import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.crud.user import (
    create_google_user,
    create_user,
    get_user_by_email,
    get_user_by_google_id,
    set_password,
)
from app.database.session import get_db
from app.models.social import RefreshToken
from app.models.user import User
from app.schemas.user import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    RefreshRequest,
    ResetPasswordRequest,
    TokenPair,
    UserCreate,
    UserLogin,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _issue_token_pair(db: Session, user: User) -> TokenPair:
    access_token = create_access_token(str(user.id), user.role.value)
    refresh_token = create_refresh_token(str(user.id))

    db.add(
        RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    db.commit()

    return TokenPair(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@router.post("/signup", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "An account with this email already exists")
    user = create_user(db, user_in)
    return _issue_token_pair(db, user)


@router.post("/login", response_model=TokenPair)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, credentials.email)
    if not user or not user.password_hash or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been deactivated")
    return _issue_token_pair(db, user)


@router.post("/refresh", response_model=TokenPair)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    claims = decode_token(payload.refresh_token)
    if not claims or claims.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")

    stored = db.query(RefreshToken).filter(RefreshToken.token == payload.refresh_token).first()
    if not stored or stored.revoked or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token expired or revoked")

    user = db.query(User).filter(User.id == uuid.UUID(claims["sub"])).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    stored.revoked = True
    db.commit()
    return _issue_token_pair(db, user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: RefreshRequest, db: Session = Depends(get_db)):
    stored = db.query(RefreshToken).filter(RefreshToken.token == payload.refresh_token).first()
    if stored:
        stored.revoked = True
        db.commit()


@router.post("/google", response_model=TokenPair)
def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        idinfo = google_id_token.verify_oauth2_token(
            payload.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid Google token")

    google_id = idinfo["sub"]
    email = idinfo["email"]
    full_name = idinfo.get("name", email.split("@")[0])
    avatar_url = idinfo.get("picture")

    user = get_user_by_google_id(db, google_id) or get_user_by_email(db, email)
    if not user:
        user = create_google_user(db, email, full_name, google_id, avatar_url)
    elif not user.google_id:
        user.google_id = google_id
        db.commit()
        db.refresh(user)

    return _issue_token_pair(db, user)


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if user:
        reset_token = create_access_token(str(user.id), user.role.value, extra_claims={"purpose": "password_reset"})
        # TODO: send `reset_token` via email service (SendGrid/SES) with a link to
        # {settings.FRONTEND_URL}/reset-password?token=reset_token
    # Always return 204 regardless of whether the email exists, to avoid account enumeration.


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    claims = decode_token(payload.token)
    if not claims or claims.get("purpose") != "password_reset":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")

    user = db.query(User).filter(User.id == uuid.UUID(claims["sub"])).first()
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token")

    set_password(db, user, hash_password(payload.new_password))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

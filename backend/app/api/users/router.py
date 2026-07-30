import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_customer
from app.crud.user import update_user
from app.database.session import get_db
from app.models.social import Wishlist
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.patch("/me", response_model=UserOut)
def update_my_profile(data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_user(db, current_user, data)


@router.post("/wishlist/{service_id}", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(service_id: uuid.UUID, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    existing = db.query(Wishlist).filter(Wishlist.customer_id == current_user.id, Wishlist.service_id == service_id).first()
    if existing:
        return {"detail": "Already in wishlist"}
    item = Wishlist(customer_id=current_user.id, service_id=service_id)
    db.add(item)
    db.commit()
    return {"detail": "Added to wishlist"}


@router.delete("/wishlist/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(service_id: uuid.UUID, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    db.query(Wishlist).filter(Wishlist.customer_id == current_user.id, Wishlist.service_id == service_id).delete()
    db.commit()


@router.get("/wishlist")
def get_wishlist(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return db.query(Wishlist).filter(Wishlist.customer_id == current_user.id).all()

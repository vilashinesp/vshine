import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_customer
from app.crud.chat import (
    create_notification,
    get_or_create_thread,
    get_thread,
    list_thread_messages,
    list_user_threads,
    mark_thread_read,
    send_message,
)
from app.crud.tailor import get_tailor_profile_by_user
from app.database.session import get_db
from app.models.enums import NotificationType
from app.models.user import User
from app.schemas.order import ChatMessageCreate, ChatMessageOut, ChatThreadCreate, ChatThreadOut

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/threads", response_model=ChatThreadOut, status_code=status.HTTP_201_CREATED)
def open_thread(data: ChatThreadCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return get_or_create_thread(db, current_user.id, data)


@router.get("/threads", response_model=list[ChatThreadOut])
def my_threads(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_tailor_profile_by_user(db, current_user.id)
    return list_user_threads(db, current_user.id, tailor_profile_id=profile.id if profile else None)


def _authorize_thread(db: Session, thread_id: uuid.UUID, current_user: User):
    thread = get_thread(db, thread_id)
    if not thread:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Thread not found")
    profile = get_tailor_profile_by_user(db, current_user.id)
    is_customer = thread.customer_id == current_user.id
    is_tailor = profile and thread.tailor_id == profile.id
    if not (is_customer or is_tailor):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized")
    return thread


@router.get("/threads/{thread_id}/messages", response_model=list[ChatMessageOut])
def thread_messages(thread_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _authorize_thread(db, thread_id, current_user)
    mark_thread_read(db, thread_id, current_user.id)
    return list_thread_messages(db, thread_id)


@router.post("/messages", response_model=ChatMessageOut, status_code=status.HTTP_201_CREATED)
def post_message(data: ChatMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    thread = _authorize_thread(db, data.thread_id, current_user)
    message = send_message(db, current_user.id, data)

    if current_user.id == thread.customer_id:
        from app.crud.tailor import get_tailor_profile

        tailor_profile = get_tailor_profile(db, thread.tailor_id)
        recipient_id = tailor_profile.user_id
    else:
        recipient_id = thread.customer_id
    create_notification(
        db,
        user_id=recipient_id,
        type_=NotificationType.chat,
        title="New message",
        body=(data.message or "Sent an attachment")[:120],
        link=f"/chat/{thread.id}",
    )
    return message

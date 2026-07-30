import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.crud.chat import list_user_notifications, mark_notification_read
from app.database.session import get_db
from app.models.social import Notification
from app.models.user import User
from app.schemas.order import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationOut])
def my_notifications(unread_only: bool = False, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_user_notifications(db, current_user.id, unread_only=unread_only)


@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notification:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    return mark_notification_read(db, notification)

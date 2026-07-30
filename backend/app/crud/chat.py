import uuid

from sqlalchemy.orm import Session

from app.models.social import ChatMessage, ChatThread, Notification
from app.models.enums import NotificationType
from app.schemas.order import ChatMessageCreate, ChatThreadCreate


def get_or_create_thread(db: Session, customer_id: uuid.UUID, data: ChatThreadCreate) -> ChatThread:
    existing = (
        db.query(ChatThread)
        .filter(
            ChatThread.customer_id == customer_id,
            ChatThread.tailor_id == data.tailor_id,
            ChatThread.booking_id == data.booking_id,
        )
        .first()
    )
    if existing:
        return existing

    thread = ChatThread(customer_id=customer_id, tailor_id=data.tailor_id, booking_id=data.booking_id)
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread


def list_user_threads(db: Session, user_id: uuid.UUID, tailor_profile_id: uuid.UUID | None) -> list[ChatThread]:
    q = db.query(ChatThread)
    if tailor_profile_id:
        q = q.filter(ChatThread.tailor_id == tailor_profile_id)
    else:
        q = q.filter(ChatThread.customer_id == user_id)
    return q.order_by(ChatThread.created_at.desc()).all()


def get_thread(db: Session, thread_id: uuid.UUID) -> ChatThread | None:
    return db.query(ChatThread).filter(ChatThread.id == thread_id).first()


def send_message(db: Session, sender_id: uuid.UUID, data: ChatMessageCreate) -> ChatMessage:
    message = ChatMessage(sender_id=sender_id, thread_id=data.thread_id, message=data.message, attachment_url=data.attachment_url)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def list_thread_messages(db: Session, thread_id: uuid.UUID) -> list[ChatMessage]:
    return db.query(ChatMessage).filter(ChatMessage.thread_id == thread_id).order_by(ChatMessage.created_at).all()


def mark_thread_read(db: Session, thread_id: uuid.UUID, reader_id: uuid.UUID) -> None:
    db.query(ChatMessage).filter(
        ChatMessage.thread_id == thread_id, ChatMessage.sender_id != reader_id
    ).update({"is_read": True})
    db.commit()


def create_notification(db: Session, user_id: uuid.UUID, type_: NotificationType, title: str, body: str | None = None, link: str | None = None) -> Notification:
    notification = Notification(user_id=user_id, type=type_, title=title, body=body, link=link)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def list_user_notifications(db: Session, user_id: uuid.UUID, unread_only: bool = False) -> list[Notification]:
    q = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        q = q.filter(Notification.is_read.is_(False))
    return q.order_by(Notification.created_at.desc()).all()


def mark_notification_read(db: Session, notification: Notification) -> Notification:
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

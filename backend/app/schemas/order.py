import uuid
from datetime import datetime, date

from pydantic import BaseModel, Field

from app.models.enums import OrderStatus, PaymentMethod, PaymentStatus, NotificationType


class OrderOut(BaseModel):
    id: uuid.UUID
    booking_id: uuid.UUID
    customer_id: uuid.UUID
    tailor_id: uuid.UUID
    order_number: str
    status: OrderStatus
    total_amount: float
    finished_image_url: str | None = None
    estimated_delivery: date | None = None
    delivered_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    note: str | None = None


class OrderStatusHistoryOut(BaseModel):
    status: OrderStatus
    note: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    order_id: uuid.UUID
    method: PaymentMethod


class PaymentOut(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    customer_id: uuid.UUID
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    transaction_ref: str | None = None
    invoice_url: str | None = None
    paid_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    order_id: uuid.UUID
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewOut(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    customer_id: uuid.UUID
    tailor_id: uuid.UUID
    rating: int
    comment: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    thread_id: uuid.UUID
    message: str | None = None
    attachment_url: str | None = None


class ChatMessageOut(BaseModel):
    id: uuid.UUID
    thread_id: uuid.UUID
    sender_id: uuid.UUID
    message: str | None = None
    attachment_url: str | None = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ChatThreadCreate(BaseModel):
    tailor_id: uuid.UUID
    booking_id: uuid.UUID | None = None


class ChatThreadOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    tailor_id: uuid.UUID
    booking_id: uuid.UUID | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationOut(BaseModel):
    id: uuid.UUID
    type: NotificationType
    title: str
    body: str | None = None
    link: str | None = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

import uuid
from datetime import datetime, date, time

from pydantic import BaseModel

from app.models.enums import OrderStatus


class MeasurementBase(BaseModel):
    label: str = "Default"
    chest: float | None = None
    waist: float | None = None
    hip: float | None = None
    shoulder: float | None = None
    sleeve_length: float | None = None
    inseam: float | None = None
    neck: float | None = None
    height: float | None = None
    weight: float | None = None
    notes: str | None = None


class MeasurementCreate(MeasurementBase):
    pass


class MeasurementOut(MeasurementBase):
    id: uuid.UUID
    customer_id: uuid.UUID
    ai_suggested: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    tailor_id: uuid.UUID
    service_id: uuid.UUID
    measurement_id: uuid.UUID | None = None
    booking_date: date
    booking_time: time
    cloth_image_url: str | None = None
    design_image_url: str | None = None
    measurement_image_url: str | None = None
    notes: str | None = None


class BookingStatusUpdate(BaseModel):
    status: OrderStatus


class BookingOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    tailor_id: uuid.UUID
    service_id: uuid.UUID
    measurement_id: uuid.UUID | None = None
    booking_date: date
    booking_time: time
    cloth_image_url: str | None = None
    design_image_url: str | None = None
    measurement_image_url: str | None = None
    notes: str | None = None
    status: OrderStatus
    created_at: datetime

    class Config:
        from_attributes = True

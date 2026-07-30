import uuid
from datetime import datetime, date, time

from sqlalchemy import String, DateTime, Date, Time, ForeignKey, Numeric, Boolean, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.models.enums import OrderStatus


class Measurement(Base):
    __tablename__ = "measurements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    label: Mapped[str] = mapped_column(String, default="Default")
    chest: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    waist: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    hip: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    shoulder: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    sleeve_length: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    inseam: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    neck: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    height: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    weight: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    ai_suggested: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    tailor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tailor_profiles.id", ondelete="CASCADE"))
    service_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="RESTRICT"))
    measurement_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("measurements.id", ondelete="SET NULL"), nullable=True)
    booking_date: Mapped[date] = mapped_column(Date, nullable=False)
    booking_time: Mapped[time] = mapped_column(Time, nullable=False)
    cloth_image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    design_image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    measurement_image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus, name="order_status"), default=OrderStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    order: Mapped["Order"] = relationship(back_populates="booking", uselist=False)

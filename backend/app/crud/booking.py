import uuid

from sqlalchemy.orm import Session

from app.models.booking import Booking, Measurement
from app.models.enums import OrderStatus
from app.schemas.booking import BookingCreate, MeasurementCreate


def create_measurement(db: Session, customer_id: uuid.UUID, data: MeasurementCreate) -> Measurement:
    measurement = Measurement(customer_id=customer_id, **data.model_dump())
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement


def list_measurements(db: Session, customer_id: uuid.UUID) -> list[Measurement]:
    return db.query(Measurement).filter(Measurement.customer_id == customer_id).order_by(Measurement.created_at.desc()).all()


def create_booking(db: Session, customer_id: uuid.UUID, data: BookingCreate) -> Booking:
    booking = Booking(customer_id=customer_id, **data.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_booking(db: Session, booking_id: uuid.UUID) -> Booking | None:
    return db.query(Booking).filter(Booking.id == booking_id).first()


def list_customer_bookings(db: Session, customer_id: uuid.UUID) -> list[Booking]:
    return db.query(Booking).filter(Booking.customer_id == customer_id).order_by(Booking.created_at.desc()).all()


def list_tailor_bookings(db: Session, tailor_id: uuid.UUID, status: OrderStatus | None = None) -> list[Booking]:
    q = db.query(Booking).filter(Booking.tailor_id == tailor_id)
    if status:
        q = q.filter(Booking.status == status)
    return q.order_by(Booking.booking_date, Booking.booking_time).all()


def update_booking_status(db: Session, booking: Booking, status: OrderStatus) -> Booking:
    booking.status = status
    db.commit()
    db.refresh(booking)
    return booking

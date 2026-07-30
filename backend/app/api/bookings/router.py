import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_customer, require_tailor_or_admin
from app.crud.booking import (
    create_booking,
    create_measurement,
    get_booking,
    list_customer_bookings,
    list_measurements,
    list_tailor_bookings,
    update_booking_status,
)
from app.crud.chat import create_notification
from app.crud.order import create_order_from_booking
from app.crud.tailor import get_service, get_tailor_profile_by_user
from app.database.session import get_db
from app.models.enums import NotificationType, OrderStatus
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate, MeasurementCreate, MeasurementOut

router = APIRouter(tags=["Bookings"])


@router.post("/measurements", response_model=MeasurementOut, status_code=status.HTTP_201_CREATED)
def add_measurement(data: MeasurementCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return create_measurement(db, current_user.id, data)


@router.get("/measurements", response_model=list[MeasurementOut])
def my_measurements(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return list_measurements(db, current_user.id)


@router.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_new_booking(data: BookingCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    service = get_service(db, data.service_id)
    if not service or service.tailor_id != data.tailor_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Service does not belong to the selected tailor")

    booking = create_booking(db, current_user.id, data)

    tailor_profile = service.tailor
    create_notification(
        db,
        user_id=tailor_profile.user_id,
        type_=NotificationType.booking,
        title="New booking request",
        body=f"{current_user.full_name} requested {service.name}",
        link=f"/tailor/bookings/{booking.id}",
    )
    return booking


@router.get("/bookings/me", response_model=list[BookingOut])
def my_bookings(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return list_customer_bookings(db, current_user.id)


@router.get("/bookings/tailor", response_model=list[BookingOut])
def tailor_bookings(status_filter: OrderStatus | None = None, current_user: User = Depends(require_tailor_or_admin), db: Session = Depends(get_db)):
    profile = get_tailor_profile_by_user(db, current_user.id)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tailor profile not found")
    return list_tailor_bookings(db, profile.id, status=status_filter)


@router.get("/bookings/{booking_id}", response_model=BookingOut)
def get_booking_detail(booking_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
    profile = get_tailor_profile_by_user(db, current_user.id)
    is_owner = booking.customer_id == current_user.id
    is_tailor = profile and booking.tailor_id == profile.id
    if not (is_owner or is_tailor or current_user.role == "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized to view this booking")
    return booking


@router.patch("/bookings/{booking_id}/status", response_model=BookingOut)
def change_booking_status(booking_id: uuid.UUID, data: BookingStatusUpdate, current_user: User = Depends(require_tailor_or_admin), db: Session = Depends(get_db)):
    booking = get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")

    profile = get_tailor_profile_by_user(db, current_user.id)
    if current_user.role != "admin" and (not profile or booking.tailor_id != profile.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized to update this booking")

    booking = update_booking_status(db, booking, data.status)

    if data.status == OrderStatus.accepted:
        service = get_service(db, booking.service_id)
        create_order_from_booking(db, booking, total_amount=service.price)

    create_notification(
        db,
        user_id=booking.customer_id,
        type_=NotificationType.booking,
        title="Booking update",
        body=f"Your booking is now '{data.status.value}'",
        link=f"/orders",
    )
    return booking

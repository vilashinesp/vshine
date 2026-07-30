import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_customer, require_tailor_or_admin
from app.crud.chat import create_notification
from app.crud.order import (
    create_review,
    get_order,
    get_order_history,
    list_customer_orders,
    list_tailor_orders,
    list_tailor_reviews,
    update_order_status,
)
from app.crud.tailor import get_tailor_profile_by_user
from app.database.session import get_db
from app.models.enums import NotificationType, OrderStatus
from app.models.user import User
from app.schemas.order import OrderOut, OrderStatusHistoryOut, OrderStatusUpdate, ReviewCreate, ReviewOut

router = APIRouter(tags=["Orders"])


@router.get("/orders/me", response_model=list[OrderOut])
def my_orders(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return list_customer_orders(db, current_user.id)


@router.get("/orders/tailor", response_model=list[OrderOut])
def tailor_orders(status_filter: OrderStatus | None = None, current_user: User = Depends(require_tailor_or_admin), db: Session = Depends(get_db)):
    profile = get_tailor_profile_by_user(db, current_user.id)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tailor profile not found")
    return list_tailor_orders(db, profile.id, status=status_filter)


def _authorize_order_access(db: Session, order_id: uuid.UUID, current_user: User):
    order = get_order(db, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    profile = get_tailor_profile_by_user(db, current_user.id)
    is_owner = order.customer_id == current_user.id
    is_tailor = profile and order.tailor_id == profile.id
    if not (is_owner or is_tailor or current_user.role == "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized")
    return order


@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order_detail(order_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _authorize_order_access(db, order_id, current_user)


@router.get("/orders/{order_id}/history", response_model=list[OrderStatusHistoryOut])
def order_history(order_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _authorize_order_access(db, order_id, current_user)
    return get_order_history(db, order_id)


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_status(order_id: uuid.UUID, data: OrderStatusUpdate, current_user: User = Depends(require_tailor_or_admin), db: Session = Depends(get_db)):
    order = get_order(db, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    profile = get_tailor_profile_by_user(db, current_user.id)
    if current_user.role != "admin" and (not profile or order.tailor_id != profile.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized to update this order")

    order = update_order_status(db, order, data.status, data.note, current_user.id)

    create_notification(
        db,
        user_id=order.customer_id,
        type_=NotificationType.order_status,
        title=f"Order {order.order_number} update",
        body=f"Status changed to '{data.status.value}'",
        link=f"/orders/{order.id}",
    )
    return order


@router.post("/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def leave_review(data: ReviewCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    order = get_order(db, data.order_id)
    if not order or order.customer_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if order.status != OrderStatus.delivered:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can only review a delivered order")
    return create_review(db, current_user.id, order.tailor_id, data)


@router.get("/tailors/{tailor_id}/reviews", response_model=list[ReviewOut])
def tailor_reviews(tailor_id: uuid.UUID, db: Session = Depends(get_db)):
    return list_tailor_reviews(db, tailor_id)

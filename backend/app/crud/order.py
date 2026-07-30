import uuid

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.order import Order, OrderStatusHistory
from app.models.payment import Payment
from app.models.social import Review
from app.models.enums import OrderStatus, PaymentStatus
from app.schemas.order import PaymentCreate, ReviewCreate


def create_order_from_booking(db: Session, booking: Booking, total_amount: float) -> Order:
    order = Order(
        booking_id=booking.id,
        customer_id=booking.customer_id,
        tailor_id=booking.tailor_id,
        order_number="PENDING",  # overwritten by DB trigger generate_order_number
        total_amount=total_amount,
        status=OrderStatus.accepted,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_order(db: Session, order_id: uuid.UUID) -> Order | None:
    return db.query(Order).filter(Order.id == order_id).first()


def list_customer_orders(db: Session, customer_id: uuid.UUID) -> list[Order]:
    return db.query(Order).filter(Order.customer_id == customer_id).order_by(Order.created_at.desc()).all()


def list_tailor_orders(db: Session, tailor_id: uuid.UUID, status: OrderStatus | None = None) -> list[Order]:
    q = db.query(Order).filter(Order.tailor_id == tailor_id)
    if status:
        q = q.filter(Order.status == status)
    return q.order_by(Order.created_at.desc()).all()


def update_order_status(db: Session, order: Order, status: OrderStatus, note: str | None, changed_by: uuid.UUID) -> Order:
    order.status = status
    db.add(OrderStatusHistory(order_id=order.id, status=status, note=note, changed_by=changed_by))
    db.commit()
    db.refresh(order)
    return order


def get_order_history(db: Session, order_id: uuid.UUID) -> list[OrderStatusHistory]:
    return (
        db.query(OrderStatusHistory)
        .filter(OrderStatusHistory.order_id == order_id)
        .order_by(OrderStatusHistory.created_at)
        .all()
    )


def create_payment(db: Session, customer_id: uuid.UUID, order: Order, data: PaymentCreate) -> Payment:
    payment = Payment(
        order_id=order.id,
        customer_id=customer_id,
        amount=order.total_amount,
        method=data.method,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def mark_payment_paid(db: Session, payment: Payment, transaction_ref: str) -> Payment:
    from datetime import datetime, timezone

    payment.status = PaymentStatus.paid
    payment.transaction_ref = transaction_ref
    payment.paid_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(payment)
    return payment


def list_customer_payments(db: Session, customer_id: uuid.UUID) -> list[Payment]:
    return db.query(Payment).filter(Payment.customer_id == customer_id).order_by(Payment.created_at.desc()).all()


def create_review(db: Session, customer_id: uuid.UUID, tailor_id: uuid.UUID, data: ReviewCreate) -> Review:
    review = Review(customer_id=customer_id, tailor_id=tailor_id, **data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def list_tailor_reviews(db: Session, tailor_id: uuid.UUID) -> list[Review]:
    return db.query(Review).filter(Review.tailor_id == tailor_id).order_by(Review.created_at.desc()).all()

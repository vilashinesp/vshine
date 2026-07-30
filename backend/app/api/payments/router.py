import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import require_customer
from app.crud.order import create_payment, get_order, list_customer_payments, mark_payment_paid
from app.database.session import get_db
from app.models.enums import PaymentMethod
from app.models.user import User
from app.schemas.order import PaymentCreate, PaymentOut
from app.services.payment_service import create_razorpay_order, create_stripe_payment_intent, verify_razorpay_signature

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def initiate_payment(data: PaymentCreate, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    order = get_order(db, data.order_id)
    if not order or order.customer_id != current_user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    payment = create_payment(db, current_user.id, order, data)

    gateway_payload: dict = {}
    if data.method == PaymentMethod.stripe:
        gateway_payload = create_stripe_payment_intent(order.total_amount, str(order.id))
    elif data.method == PaymentMethod.razorpay:
        gateway_payload = create_razorpay_order(order.total_amount, str(order.id))

    return {**PaymentOut.model_validate(payment).model_dump(), **{"gateway": gateway_payload}} if gateway_payload else payment


@router.get("/me", response_model=list[PaymentOut])
def my_payments(current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    return list_customer_payments(db, current_user.id)


@router.post("/razorpay/verify", status_code=status.HTTP_200_OK)
def verify_razorpay(payment_id: uuid.UUID, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str, current_user: User = Depends(require_customer), db: Session = Depends(get_db)):
    if not verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Signature verification failed")

    from app.models.payment import Payment

    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.customer_id == current_user.id).first()
    if not payment:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Payment not found")
    return mark_payment_paid(db, payment, razorpay_payment_id)


@router.post("/stripe/webhook", status_code=status.HTTP_200_OK, include_in_schema=False)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    import stripe

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid webhook signature")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        order_id = intent["metadata"].get("order_id")
        from app.models.payment import Payment

        payment = db.query(Payment).filter(Payment.order_id == order_id).order_by(Payment.created_at.desc()).first()
        if payment:
            mark_payment_paid(db, payment, intent["id"])

    return {"received": True}

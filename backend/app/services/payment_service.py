"""
Thin wrappers around Stripe and Razorpay SDKs for creating payment intents / orders.
Cash and UPI-manual are handled without a gateway call.
"""
import razorpay
import stripe

from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY
_razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)) if settings.RAZORPAY_KEY_ID else None


def create_stripe_payment_intent(amount_inr: float, order_id: str) -> dict:
    intent = stripe.PaymentIntent.create(
        amount=int(amount_inr * 100),  # paise
        currency="inr",
        metadata={"order_id": order_id},
        automatic_payment_methods={"enabled": True},
    )
    return {"client_secret": intent.client_secret, "id": intent.id}


def create_razorpay_order(amount_inr: float, order_id: str) -> dict:
    if not _razorpay_client:
        raise RuntimeError("Razorpay is not configured")
    order = _razorpay_client.order.create(
        {
            "amount": int(amount_inr * 100),
            "currency": "INR",
            "receipt": order_id,
            "notes": {"order_id": order_id},
        }
    )
    return order


def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if not _razorpay_client:
        return False
    try:
        _razorpay_client.utility.verify_payment_signature(
            {"razorpay_order_id": order_id, "razorpay_payment_id": payment_id, "razorpay_signature": signature}
        )
        return True
    except razorpay.errors.SignatureVerificationError:
        return False

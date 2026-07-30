"""
Shared enum types mirroring the Postgres enum types in database/schema.sql
"""
import enum


class UserRole(str, enum.Enum):
    customer = "customer"
    tailor = "tailor"
    admin = "admin"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    measurement = "measurement"
    cutting = "cutting"
    stitching = "stitching"
    ironing = "ironing"
    ready = "ready"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentMethod(str, enum.Enum):
    cash = "cash"
    upi = "upi"
    stripe = "stripe"
    razorpay = "razorpay"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


class NotificationType(str, enum.Enum):
    booking = "booking"
    order_status = "order_status"
    payment = "payment"
    chat = "chat"
    system = "system"
    promotion = "promotion"

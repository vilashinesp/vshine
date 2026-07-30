import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database.session import get_db
from app.models.enums import OrderStatus, PaymentStatus, UserRole
from app.models.order import Order
from app.models.payment import Payment, Coupon
from app.models.tailor import TailorProfile
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def dashboard_summary(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).filter(User.role == UserRole.customer).scalar()
    total_tailors = db.query(func.count(TailorProfile.id)).scalar()
    pending_approvals = db.query(func.count(TailorProfile.id)).filter(TailorProfile.is_approved.is_(False)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(Payment.status == PaymentStatus.paid).scalar()
    active_orders = db.query(func.count(Order.id)).filter(Order.status.notin_([OrderStatus.delivered, OrderStatus.cancelled])).scalar()

    return {
        "total_users": total_users,
        "total_tailors": total_tailors,
        "pending_tailor_approvals": pending_approvals,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "total_revenue": float(total_revenue),
    }


@router.get("/users", response_model=list[UserOut])
def list_all_users(role: UserRole | None = None, skip: int = 0, limit: int = 50, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}/deactivate", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_user(user_id: uuid.UUID, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    user.is_active = False
    db.commit()


@router.get("/tailors/pending", response_model=list[dict])
def pending_tailors(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    profiles = db.query(TailorProfile).filter(TailorProfile.is_approved.is_(False)).all()
    return [{"id": p.id, "shop_name": p.shop_name, "city": p.city, "user_id": p.user_id} for p in profiles]


@router.patch("/tailors/{tailor_id}/approve", status_code=status.HTTP_204_NO_CONTENT)
def approve_tailor(tailor_id: uuid.UUID, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    profile = db.query(TailorProfile).filter(TailorProfile.id == tailor_id).first()
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tailor profile not found")
    profile.is_approved = True
    db.commit()


@router.get("/orders", response_model=list[dict])
def all_orders(status_filter: OrderStatus | None = None, skip: int = 0, limit: int = 50, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    q = db.query(Order)
    if status_filter:
        q = q.filter(Order.status == status_filter)
    orders = q.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return [{"id": o.id, "order_number": o.order_number, "status": o.status, "total_amount": float(o.total_amount)} for o in orders]


@router.post("/coupons", status_code=status.HTTP_201_CREATED)
def create_coupon(code: str, discount_percent: float | None = None, discount_flat: float | None = None, max_uses: int | None = None, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    coupon = Coupon(code=code, discount_percent=discount_percent, discount_flat=discount_flat, max_uses=max_uses)
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return {"id": coupon.id, "code": coupon.code}


@router.get("/coupons")
def list_coupons(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()

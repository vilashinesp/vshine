import uuid

from sqlalchemy.orm import Session

from app.models.tailor import TailorProfile, Category, Service
from app.schemas.tailor import ServiceCreate, ServiceUpdate, TailorProfileCreate, TailorProfileUpdate


def get_tailor_profile_by_user(db: Session, user_id: uuid.UUID) -> TailorProfile | None:
    return db.query(TailorProfile).filter(TailorProfile.user_id == user_id).first()


def get_tailor_profile(db: Session, tailor_id: uuid.UUID) -> TailorProfile | None:
    return db.query(TailorProfile).filter(TailorProfile.id == tailor_id).first()


def list_tailors(db: Session, city: str | None = None, approved_only: bool = True, skip: int = 0, limit: int = 20) -> list[TailorProfile]:
    q = db.query(TailorProfile)
    if approved_only:
        q = q.filter(TailorProfile.is_approved.is_(True))
    if city:
        q = q.filter(TailorProfile.city.ilike(f"%{city}%"))
    return q.order_by(TailorProfile.avg_rating.desc()).offset(skip).limit(limit).all()


def create_tailor_profile(db: Session, user_id: uuid.UUID, data: TailorProfileCreate) -> TailorProfile:
    profile = TailorProfile(user_id=user_id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def update_tailor_profile(db: Session, profile: TailorProfile, data: TailorProfileUpdate) -> TailorProfile:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


def list_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.name).all()


def list_services(db: Session, tailor_id: uuid.UUID | None = None, category_id: uuid.UUID | None = None, active_only: bool = True) -> list[Service]:
    q = db.query(Service)
    if active_only:
        q = q.filter(Service.is_active.is_(True))
    if tailor_id:
        q = q.filter(Service.tailor_id == tailor_id)
    if category_id:
        q = q.filter(Service.category_id == category_id)
    return q.order_by(Service.created_at.desc()).all()


def get_service(db: Session, service_id: uuid.UUID) -> Service | None:
    return db.query(Service).filter(Service.id == service_id).first()


def create_service(db: Session, tailor_id: uuid.UUID, data: ServiceCreate) -> Service:
    service = Service(tailor_id=tailor_id, **data.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


def update_service(db: Session, service: Service, data: ServiceUpdate) -> Service:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


def delete_service(db: Session, service: Service) -> None:
    db.delete(service)
    db.commit()

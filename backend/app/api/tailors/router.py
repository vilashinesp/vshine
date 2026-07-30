import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_tailor, require_tailor_or_admin
from app.crud.tailor import (
    create_service,
    create_tailor_profile,
    delete_service,
    get_service,
    get_tailor_profile,
    get_tailor_profile_by_user,
    list_categories,
    list_services,
    list_tailors,
    update_service,
    update_tailor_profile,
)
from app.database.session import get_db
from app.models.user import User
from app.schemas.tailor import (
    CategoryOut,
    ServiceCreate,
    ServiceOut,
    ServiceUpdate,
    TailorProfileCreate,
    TailorProfileOut,
    TailorProfileUpdate,
)

router = APIRouter(prefix="/tailors", tags=["Tailors"])


@router.get("", response_model=list[TailorProfileOut])
def browse_tailors(city: str | None = None, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return list_tailors(db, city=city, skip=skip, limit=limit)


@router.get("/categories", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return list_categories(db)


@router.post("/profile", response_model=TailorProfileOut, status_code=status.HTTP_201_CREATED)
def create_my_tailor_profile(data: TailorProfileCreate, current_user: User = Depends(require_tailor), db: Session = Depends(get_db)):
    if get_tailor_profile_by_user(db, current_user.id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Tailor profile already exists")
    return create_tailor_profile(db, current_user.id, data)


@router.get("/profile/me", response_model=TailorProfileOut)
def get_my_tailor_profile(current_user: User = Depends(require_tailor), db: Session = Depends(get_db)):
    profile = get_tailor_profile_by_user(db, current_user.id)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tailor profile not found")
    return profile


@router.patch("/profile/me", response_model=TailorProfileOut)
def update_my_tailor_profile(data: TailorProfileUpdate, current_user: User = Depends(require_tailor), db: Session = Depends(get_db)):
    profile = get_tailor_profile_by_user(db, current_user.id)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tailor profile not found")
    return update_tailor_profile(db, profile, data)


@router.get("/{tailor_id}", response_model=TailorProfileOut)
def get_tailor(tailor_id: uuid.UUID, db: Session = Depends(get_db)):
    profile = get_tailor_profile(db, tailor_id)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tailor not found")
    return profile


@router.get("/{tailor_id}/services", response_model=list[ServiceOut])
def get_tailor_services(tailor_id: uuid.UUID, db: Session = Depends(get_db)):
    return list_services(db, tailor_id=tailor_id)


@router.post("/services", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def add_service(data: ServiceCreate, current_user: User = Depends(require_tailor), db: Session = Depends(get_db)):
    profile = get_tailor_profile_by_user(db, current_user.id)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Create a tailor profile first")
    return create_service(db, profile.id, data)


def _ensure_service_owner(db: Session, service_id: uuid.UUID, current_user: User):
    service = get_service(db, service_id)
    if not service:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Service not found")
    profile = get_tailor_profile_by_user(db, current_user.id)
    if current_user.role != "admin" and (not profile or service.tailor_id != profile.id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't own this service")
    return service


@router.patch("/services/{service_id}", response_model=ServiceOut)
def edit_service(service_id: uuid.UUID, data: ServiceUpdate, current_user: User = Depends(require_tailor_or_admin), db: Session = Depends(get_db)):
    service = _ensure_service_owner(db, service_id, current_user)
    return update_service(db, service, data)


@router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_service(service_id: uuid.UUID, current_user: User = Depends(require_tailor_or_admin), db: Session = Depends(get_db)):
    service = _ensure_service_owner(db, service_id, current_user)
    delete_service(db, service)

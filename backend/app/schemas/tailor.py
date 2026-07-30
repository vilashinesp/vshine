import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TailorProfileBase(BaseModel):
    shop_name: str
    bio: str | None = None
    years_experience: int = 0
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class TailorProfileCreate(TailorProfileBase):
    pass


class TailorProfileUpdate(BaseModel):
    shop_name: str | None = None
    bio: str | None = None
    years_experience: int | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    cover_image_url: str | None = None


class TailorProfileOut(TailorProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    cover_image_url: str | None = None
    is_approved: bool
    avg_rating: float
    total_reviews: int
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    icon_url: str | None = None

    class Config:
        from_attributes = True


class ServiceBase(BaseModel):
    name: str
    description: str | None = None
    price: float = Field(gt=0)
    duration_days: int = Field(default=3, gt=0)
    category_id: uuid.UUID | None = None
    image_url: str | None = None


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    duration_days: int | None = None
    category_id: uuid.UUID | None = None
    image_url: str | None = None
    is_active: bool | None = None


class ServiceOut(ServiceBase):
    id: uuid.UUID
    tailor_id: uuid.UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

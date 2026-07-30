from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin.router import router as admin_router
from app.api.ai.router import router as ai_router
from app.api.auth.router import router as auth_router
from app.api.bookings.router import router as bookings_router
from app.api.chat.router import router as chat_router
from app.api.notifications.router import router as notifications_router
from app.api.orders.router import router as orders_router
from app.api.payments.router import router as payments_router
from app.api.tailors.router import router as tailors_router
from app.api.users.router import router as users_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(tailors_router, prefix=settings.API_V1_PREFIX)
app.include_router(bookings_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(payments_router, prefix=settings.API_V1_PREFIX)
app.include_router(chat_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {"service": settings.APP_NAME, "status": "ok"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}

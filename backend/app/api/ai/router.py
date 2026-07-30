from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.services.ai_service import chat_with_assistant, recommend_fabric_and_color, suggest_measurements

router = APIRouter(prefix="/ai", tags=["AI"])


class MeasurementSuggestRequest(BaseModel):
    height_cm: float
    weight_kg: float
    garment_type: str


class ChatAssistantRequest(BaseModel):
    message: str
    history: list[dict] | None = None


class RecommendationRequest(BaseModel):
    occasion: str
    season: str
    skin_tone: str | None = None


@router.post("/measurements/suggest")
def ai_suggest_measurements(payload: MeasurementSuggestRequest, current_user: User = Depends(get_current_user)):
    try:
        return suggest_measurements(payload.height_cm, payload.weight_kg, payload.garment_type)
    except RuntimeError as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))


@router.post("/chat")
def ai_chat(payload: ChatAssistantRequest, current_user: User = Depends(get_current_user)):
    try:
        reply = chat_with_assistant(payload.message, payload.history)
        return {"reply": reply}
    except RuntimeError as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))


@router.post("/recommend")
def ai_recommend(payload: RecommendationRequest, current_user: User = Depends(get_current_user)):
    try:
        recommendation = recommend_fabric_and_color(payload.occasion, payload.season, payload.skin_tone)
        return {"recommendation": recommendation}
    except RuntimeError as e:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(e))

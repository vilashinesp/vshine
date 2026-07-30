"""
AI-powered features: measurement suggestions, chat assistant, and
cloth/color/design recommendations, backed by the Anthropic API.
"""
import json

import anthropic

from app.core.config import settings

_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None

_MEASUREMENT_SYSTEM_PROMPT = (
    "You are a tailoring assistant. Given a person's height, weight, and garment type, "
    "estimate standard body measurements in inches. Respond ONLY with JSON matching this shape: "
    '{"chest": number, "waist": number, "hip": number, "shoulder": number, "sleeve_length": number, '
    '"inseam": number, "neck": number}. These are starting estimates the customer will adjust after a fitting.'
)

_CHAT_SYSTEM_PROMPT = (
    "You are TailorMate's assistant. Help customers with questions about booking, fabric choice, "
    "sizing, order status, and general tailoring advice. Keep answers short and practical. "
    "If asked something requiring account-specific data you don't have, tell them to check their dashboard."
)


def suggest_measurements(height_cm: float, weight_kg: float, garment_type: str) -> dict:
    if not _client:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")

    message = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        system=_MEASUREMENT_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Height: {height_cm}cm, Weight: {weight_kg}kg, Garment: {garment_type}",
            }
        ],
    )
    text = message.content[0].text.strip()
    return json.loads(text)


def chat_with_assistant(user_message: str, conversation_history: list[dict] | None = None) -> str:
    if not _client:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")

    messages = (conversation_history or []) + [{"role": "user", "content": user_message}]
    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        system=_CHAT_SYSTEM_PROMPT,
        messages=messages,
    )
    return response.content[0].text


def recommend_fabric_and_color(occasion: str, season: str, skin_tone: str | None = None) -> str:
    if not _client:
        raise RuntimeError("ANTHROPIC_API_KEY is not configured")

    prompt = f"Occasion: {occasion}, Season: {season}"
    if skin_tone:
        prompt += f", Skin tone: {skin_tone}"
    prompt += ". Suggest 3 fabric and color combinations, one line each, with a one-sentence reason."

    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text

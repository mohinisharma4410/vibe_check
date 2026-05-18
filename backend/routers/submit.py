import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel
from google import genai

from db import get_supabase

router = APIRouter()


class SubmissionPayload(BaseModel):
    cafe_id: str
    table_id: str
    mood: Optional[str] = None
    mood_accurate: Optional[bool] = None
    vibe_score: Optional[int] = None
    vibe_label: Optional[str] = None
    voice_transcript: Optional[str] = None
    question: Optional[str] = None
    question_answer: Optional[str] = None
    ghost_note: Optional[str] = None

    # frontend-only optional fields
    photo_feedback: Optional[str] = None
    direct_text: Optional[str] = None
    is_direct: Optional[bool] = False


async def generate_oneliner(payload: SubmissionPayload) -> str:

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        return "A visit worth remembering. ☕"

    client = genai.Client(api_key=api_key)

    parts = []

    if payload.vibe_label:
        parts.append(f"Vibe: {payload.vibe_label}")

    if payload.ghost_note:
        parts.append(
            f'Customer note: "{payload.ghost_note[:120]}"'
        )

    if payload.direct_text:
        parts.append(
            f'Direct feedback: "{payload.direct_text[:120]}"'
        )

    if payload.voice_transcript:
        parts.append(
            f'Voice feedback: "{payload.voice_transcript[:120]}"'
        )

    if payload.photo_feedback:
        parts.append(
            f'Photo context: "{payload.photo_feedback[:120]}"'
        )

    context = ". ".join(parts) if parts else "No additional context."

    prompt = (
        "Generate a single witty, warm one-liner "
        "(max 12 words) summarising this café visit "
        "for a receipt tagline — clever, slightly cheeky, human. "
        "Coffee/café metaphors welcome. "
        "No hashtags, no quotes in output. "
        "Just the line.\n\n"
        f"Visit context: {context}"
    )

    try:

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt,
        )

        text = response.text.strip()

        return (
            text
            .strip('"')
            .strip("'")
        )

    except Exception as e:

        print("========== GEMINI ERROR ==========")
        print(e)

        return "A solid visit. The coffee carried. ☕"


@router.post("/submit")
async def submit_feedback(payload: SubmissionPayload):

    oneliner = await generate_oneliner(payload)

    try:

        db = get_supabase()

        # ONLY INSERT EXISTING DB COLUMNS
        row = {
            "cafe_id": payload.cafe_id,
            "table_id": payload.table_id,
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "mood": payload.mood,
            "mood_accurate": payload.mood_accurate,
            "vibe_score": payload.vibe_score,
            "vibe_label": payload.vibe_label,
            "voice_transcript": payload.voice_transcript,
            "question": payload.question,
            "question_answer": payload.question_answer,
            "ghost_note": payload.ghost_note,
        }

        print("========== INSERTING ROW ==========")
        print(row)

        result = (
            db.table("submissions")
            .insert(row)
            .execute()
        )

        print("========== INSERT SUCCESS ==========")
        print(result)

        submission_id = (
            result.data[0]["id"]
            if result.data
            else None
        )

    except Exception as e:

        print("========== SUPABASE INSERT ERROR ==========")
        print(e)

        submission_id = None

    return {
        "success": True,
        "submission_id": submission_id,
        "oneliner": oneliner,
    }


@router.get("/test-db")
async def test_db():

    try:

        db = get_supabase()

        result = (
            db.table("submissions")
            .select("*")
            .limit(5)
            .execute()
        )

        return {
            "success": True,
            "data": result.data,
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e),
        }
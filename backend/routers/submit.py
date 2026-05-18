import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import anthropic

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


async def generate_oneliner(payload: SubmissionPayload) -> str:
    """Call Claude to generate a witty one-liner for the receipt card."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return "A visit worth remembering. ☕"

    client = anthropic.Anthropic(api_key=api_key)

    parts = []
    if payload.vibe_label:
        parts.append(f"Vibe: {payload.vibe_label}")
    if payload.mood:
        parts.append(f"Mood: {payload.mood}")
    if payload.ghost_note:
        parts.append(f"Customer note: \"{payload.ghost_note[:120]}\"")
    if payload.voice_transcript:
        parts.append(f"Voice feedback: \"{payload.voice_transcript[:120]}\"")

    context = ". ".join(parts) if parts else "No additional context."

    prompt = (
        f"Generate a single witty, warm one-liner (max 12 words) summarising this café visit. "
        f"It should feel like a receipt tagline — clever, slightly cheeky, human. "
        f"No hashtags, no quotes in the output. Just the line itself.\n\n"
        f"Visit context: {context}"
    )

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=60,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip().strip('"').strip("'")
    except Exception as e:
        print(f"Claude API error: {e}")
        return "A solid visit. The coffee carried. ☕"


@router.post("/submit")
async def submit_feedback(payload: SubmissionPayload):
    """
    Receive customer feedback submission, store in Supabase,
    generate receipt one-liner via Claude, return it.
    """
    # Generate AI one-liner
    oneliner = await generate_oneliner(payload)

    # Save to Supabase
    try:
        db = get_supabase()
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
            "receipt_oneliner": oneliner,
        }
        result = db.table("submissions").insert(row).execute()
        submission_id = result.data[0]["id"] if result.data else None
    except Exception as e:
        print(f"Supabase insert error: {e}")
        # Don't fail the customer experience if DB write fails
        submission_id = None

    return {
        "success": True,
        "submission_id": submission_id,
        "oneliner": oneliner,
    }

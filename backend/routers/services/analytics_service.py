from collections import defaultdict, Counter
from statistics import mean
from datetime import datetime

from routers.services.db import get_supabase


async def fetch_rows(cafe_id: str):

    db = get_supabase()

    result = (
        db.table("submissions")
        .select("*")
        .eq("cafe_id", cafe_id)
        .execute()
    )

    return result.data or []


async def get_dashboard_overview(cafe_id: str):

    rows = await fetch_rows(cafe_id)

    vibe_scores = [
        r["vibe_score"]
        for r in rows
        if r.get("vibe_score") is not None
    ]

    avg_vibe = (
        round(mean(vibe_scores), 2)
        if vibe_scores
        else 0
    )

    low_vibes = len([
        r for r in rows
        if (r.get("vibe_score") or 0) <= 2
    ])

    voice_notes = len([
        r for r in rows
        if r.get("voice_transcript")
    ])

    ghost_notes = len([
        r for r in rows
        if r.get("ghost_note")
    ])

    return {
        "total_feedback": len(rows),
        "avg_vibe_score": avg_vibe,
        "low_vibe_alerts": low_vibes,
        "voice_notes": voice_notes,
        "ghost_notes": ghost_notes,
    }


async def get_feedback_feed(
    cafe_id: str,
    limit: int = 50,
):

    db = get_supabase()

    result = (
        db.table("submissions")
        .select("*")
        .eq("cafe_id", cafe_id)
        .order("submitted_at", desc=True)
        .limit(limit)
        .execute()
    )

    return {
        "items": result.data or []
    }


async def get_heatmap_data(cafe_id: str):

    rows = await fetch_rows(cafe_id)

    grid = defaultdict(list)

    for row in rows:

        vibe = row.get("vibe_score")

        if vibe is None:
            continue

        dt = datetime.fromisoformat(
            row["submitted_at"].replace("Z", "+00:00")
        )

        slot = f"{dt.hour:02d}:00"

        key = (
            row["table_id"],
            slot,
        )

        grid[key].append(vibe)

    heatmap = []

    for (table, slot), vibes in grid.items():

        avg = round(mean(vibes), 2)

        if avg >= 8:
            color = "green"
        elif avg >= 5:
            color = "amber"
        else:
            color = "red"

        heatmap.append({
            "table_id": table,
            "time_slot": slot,
            "avg_vibe": avg,
            "color": color,
        })

    return {
        "heatmap": heatmap
    }


async def get_table_rankings(cafe_id: str):

    rows = await fetch_rows(cafe_id)

    table_scores = defaultdict(list)

    for row in rows:

        vibe = row.get("vibe_score")

        if vibe is None:
            continue

        table_scores[row["table_id"]].append(vibe)

    rankings = []

    for table, vibes in table_scores.items():

        rankings.append({
            "table_id": table,
            "avg_vibe": round(mean(vibes), 2),
            "feedback_count": len(vibes),
        })

    rankings.sort(
        key=lambda x: x["avg_vibe"],
        reverse=True,
    )

    return {
        "best_tables": rankings[:5],
        "worst_tables": rankings[-5:],
    }


async def get_time_slot_analysis(cafe_id: str):

    rows = await fetch_rows(cafe_id)

    slots = defaultdict(list)

    for row in rows:

        vibe = row.get("vibe_score")

        if vibe is None:
            continue

        dt = datetime.fromisoformat(
            row["submitted_at"].replace("Z", "+00:00")
        )

        slot = f"{dt.hour:02d}:00"

        slots[slot].append(vibe)

    analysis = []

    for slot, vibes in slots.items():

        analysis.append({
            "time_slot": slot,
            "avg_vibe": round(mean(vibes), 2),
            "feedback_count": len(vibes),
        })

    analysis.sort(
        key=lambda x: x["avg_vibe"]
    )

    return {
        "worst_time_slots": analysis[:5],
        "best_time_slots": analysis[-5:],
    }


async def get_repeat_visitor_stats(cafe_id: str):

    rows = await fetch_rows(cafe_id)

    repeat_users = len([
        r for r in rows
        if r.get("visits", 0) > 1
    ])

    first_time = len(rows) - repeat_users

    return {
        "repeat_visitors": repeat_users,
        "first_time_visitors": first_time,
    }


async def get_silent_dissatisfaction(cafe_id: str):

    rows = await fetch_rows(cafe_id)

    silent = []

    for row in rows:

        vibe = row.get("vibe_score")

        if (
            vibe is not None
            and vibe <= 4
            and not row.get("ghost_note")
            and not row.get("voice_transcript")
        ):

            silent.append({
                "table_id": row["table_id"],
                "submitted_at": row["submitted_at"],
                "vibe_score": vibe,
            })

    return {
        "silent_dissatisfaction_cases": silent,
        "count": len(silent),
    }


async def get_emotional_engagement(cafe_id: str):

    rows = await fetch_rows(cafe_id)

    engagement = []

    for row in rows:

        score = 0

        if row.get("ghost_note"):
            score += 3

        if row.get("voice_transcript"):
            score += 4

        if row.get("photo_feedback"):
            score += 2

        if row.get("vibe_score") is not None:
            score += 1

        engagement.append(score)

    avg_engagement = (
        round(mean(engagement), 2)
        if engagement
        else 0
    )

    return {
        "avg_engagement_score": avg_engagement,
        "max_possible": 10,
    }


async def get_keyword_insights(cafe_id: str):

    rows = await fetch_rows(cafe_id)

    text = []

    for row in rows:

        if row.get("ghost_note"):
            text.extend(
                row["ghost_note"]
                .lower()
                .split()
            )

        if row.get("voice_transcript"):
            text.extend(
                row["voice_transcript"]
                .lower()
                .split()
            )

    ignore = {
        "the", "a", "and", "is",
        "was", "to", "of", "it",
        "very", "really", "good",
    }

    words = [
        w for w in text
        if len(w) > 3
        and w not in ignore
    ]

    top = Counter(words).most_common(15)

    return {
        "top_keywords": [
            {
                "word": w,
                "count": c,
            }
            for w, c in top
        ]
    }
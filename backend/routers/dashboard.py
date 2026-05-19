from fastapi import APIRouter

from routers.services.analytics_service import (
    get_dashboard_overview,
    get_feedback_feed,
    get_heatmap_data,
    get_table_rankings,
    get_time_slot_analysis,
    get_repeat_visitor_stats,
    get_silent_dissatisfaction,
    get_emotional_engagement,
    get_keyword_insights,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)


@router.get("/overview")
async def overview(cafe_id: str):
    return await get_dashboard_overview(cafe_id)


@router.get("/feed")
async def feed(
    cafe_id: str,
    limit: int = 50,
):
    return await get_feedback_feed(
        cafe_id,
        limit,
    )


@router.get("/heatmap")
async def heatmap(cafe_id: str):
    return await get_heatmap_data(cafe_id)


@router.get("/table-rankings")
async def table_rankings(cafe_id: str):
    return await get_table_rankings(cafe_id)


@router.get("/time-analysis")
async def time_analysis(cafe_id: str):
    return await get_time_slot_analysis(cafe_id)


@router.get("/repeat-visitors")
async def repeat_visitors(cafe_id: str):
    return await get_repeat_visitor_stats(cafe_id)


@router.get("/silent-dissatisfaction")
async def silent(cafe_id: str):
    return await get_silent_dissatisfaction(cafe_id)


@router.get("/engagement")
async def engagement(cafe_id: str):
    return await get_emotional_engagement(cafe_id)


@router.get("/keywords")
async def keywords(cafe_id: str):
    return await get_keyword_insights(cafe_id)
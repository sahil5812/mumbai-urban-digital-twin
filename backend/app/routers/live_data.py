"""
Live Data Router for FastAPI Backend
GET /api/live/current - Returns cached live weather, tide, and atmospheric telemetry.
POST /api/live/refresh - Forces immediate re-fetch from Open-Meteo.
"""

from fastapi import APIRouter
from app.services.live_telemetry import get_cached_telemetry, force_refresh_telemetry

router = APIRouter(prefix="/api/live", tags=["Live Telemetry Feed"])


@router.get("/current")
async def get_current_live_data():
    return get_cached_telemetry()


@router.post("/refresh")
async def trigger_live_refresh():
    return await force_refresh_telemetry()


@router.get("/status")
async def get_live_status():
    cache = get_cached_telemetry()
    return {
        "status": cache.get("status", "OPERATIONAL"),
        "source": cache.get("source", "Open-Meteo & IMD AWS"),
        "last_updated": cache.get("last_updated"),
        "weather": cache.get("weather", {}),
        "tide": cache.get("tide", {})
    }

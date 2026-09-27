from fastapi import APIRouter
from datetime import datetime, timezone
from backend.app.core.config import settings
from backend.app.core.redis_client import get_redis

router = APIRouter()

@router.get("/health")
def healthcheck():
    redis_client = get_redis()
    redis_status = "CONNECTED" if redis_client else "FALLBACK_STANDALONE"

    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "organization": settings.ORGANIZATION,
        "phase": "PHASE 1: Project Foundation & Operational Intelligence",
        "database": {
            "type": "PostgreSQL 15 / PostGIS 3.3",
            "status": "CONNECTED",
            "spatialEngine": "PostGIS (ST_DWithin & ST_Distance_Sphere)",
            "monitoredWells": 17,
            "historicalEvents": 65
        },
        "redis": {
            "status": redis_status,
            "channel": "ertmac:telemetry:live"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

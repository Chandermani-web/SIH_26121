from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os

from backend.app.core.database import get_db
from backend.app.models.event import HistoricalEvent
from backend.app.schemas.event import HistoricalEventSchema

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_DIR = os.path.join(BASE_DIR, "data")

@router.get("/events", response_model=List[HistoricalEventSchema])
def list_events(
    event_type: Optional[str] = None,
    formation: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(HistoricalEvent)
        if event_type:
            query = query.filter(HistoricalEvent.event_type == event_type)
        if formation:
            query = query.filter(HistoricalEvent.formation.ilike(f"%{formation}%"))
        if severity:
            query = query.filter(HistoricalEvent.severity == severity)
        return query.all()
    except Exception:
        events_file = os.path.join(DATA_DIR, "events_seed.json")
        if os.path.exists(events_file):
            with open(events_file) as f:
                data = json.load(f)
            events = [
                HistoricalEventSchema(
                    id=e["id"],
                    well_id=e.get("wellId") or e.get("well_id"),
                    well_name=e.get("wellName") or e.get("well_name"),
                    event_type=e.get("eventType") or e.get("event_type"),
                    severity=e["severity"],
                    depth_m=e.get("depthM") or e.get("depth_m"),
                    formation=e.get("formation"),
                    description=e["description"],
                    root_cause=e.get("rootCause") or e.get("root_cause"),
                    mitigation=e.get("mitigation"),
                    npt_hours=e.get("nptHours") or e.get("npt_hours", 0.0),
                    cost_impact_inr_lakhs=e.get("costImpactInrLakhs") or e.get("cost_impact_inr_lakhs", 0.0),
                    source_document=e.get("sourceDocument") or e.get("source_document"),
                    source_document_page=e.get("sourceDocumentPage") or e.get("source_document_page", 1)
                )
                for e in data
            ]
            if event_type:
                events = [e for e in events if e.event_type == event_type]
            if formation:
                events = [e for e in events if formation.lower() in (e.formation or "").lower()]
            if severity:
                events = [e for e in events if e.severity == severity]
            return events
        return []

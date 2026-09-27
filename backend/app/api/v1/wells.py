from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import math
import json
import os

from backend.app.core.database import get_db
from backend.app.models.well import Well
from backend.app.models.event import HistoricalEvent
from backend.app.schemas.well import WellSchema, NearbyWellResponse, NearbyWellResult, ActiveWellHeader

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_DIR = os.path.join(BASE_DIR, "data")

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def calculate_relevance_score(distance_km, max_radius, depth_offset_m, strat_match, has_critical_event):
    spatial_score = max(0.0, 1.0 - (distance_km / max_radius))
    depth_score = math.exp(-abs(depth_offset_m) / 150.0)
    strat_score = 1.0 if strat_match else 0.4
    hazard_score = 1.0 if has_critical_event else 0.5
    raw = 0.30 * spatial_score + 0.30 * depth_score + 0.25 * strat_score + 0.15 * hazard_score
    return int(round(raw * 100))

@router.get("/wells", response_model=List[WellSchema])
def list_wells(field: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        query = db.query(Well)
        if field:
            query = query.filter(Well.field.ilike(f"%{field}%"))
        return query.all()
    except Exception:
        # Fallback to seed data
        wells_file = os.path.join(DATA_DIR, "wells_seed.json")
        if os.path.exists(wells_file):
            with open(wells_file) as f:
                data = json.load(f)
            return [
                WellSchema(
                    id=w["id"],
                    well_name=w.get("wellName") or w.get("well_name"),
                    field=w["field"],
                    block=w.get("block"),
                    latitude=w["latitude"],
                    longitude=w["longitude"],
                    elevation_m=w.get("elevationM") or w.get("elevation_m", 120.0),
                    total_depth_m=w.get("totalDepthM") or w.get("total_depth_m", 3500.0),
                    current_depth_m=w.get("currentDepthM") or w.get("current_depth_m", 0.0),
                    target_formation=w.get("targetFormation") or w.get("target_formation"),
                    current_formation=w.get("currentFormation") or w.get("current_formation"),
                    status=w["status"],
                    is_active=w.get("isSimulatedActive") or w.get("is_active", False),
                    rig_name=w.get("rigName") or w.get("rig_name"),
                    casing_program=w.get("casingProgram") or w.get("casing_program")
                )
                for w in data
            ]
        return []

@router.get("/wells/nearby", response_model=NearbyWellResponse)
def get_nearby_wells(
    latitude: float = Query(27.2985, description="Active well latitude"),
    longitude: float = Query(95.3421, description="Active well longitude"),
    radius_km: float = Query(25.0, description="Spatial search radius in km"),
    current_depth: float = Query(2845.0, description="Current bit measured depth"),
    formation: Optional[str] = Query("Barail Main Sand", description="Target stratigraphic horizon"),
    db: Session = Depends(get_db)
):
    wells = list_wells(db=db)
    active_well = next((w for w in wells if w.is_active), wells[0] if wells else None)

    results = []
    events_file = os.path.join(DATA_DIR, "events_seed.json")
    all_events = []
    if os.path.exists(events_file):
        with open(events_file) as f:
            all_events = json.load(f)

    for w in wells:
        if w.is_active:
            continue
        dist = haversine_km(latitude, longitude, w.latitude, w.longitude)
        if dist <= radius_km:
            well_events = [e for e in all_events if e.get("wellId") == w.id or e.get("well_id") == w.id]
            closest_event = None
            min_depth_diff = 9999.0
            has_crit = False

            for ev in well_events:
                ev_depth = ev.get("depthM") or ev.get("depth_m", 0.0)
                diff = abs(ev_depth - current_depth)
                if diff < min_depth_diff:
                    min_depth_diff = diff
                    closest_event = ev
                if ev.get("severity") == "CRITICAL":
                    has_crit = True

            strat_match = bool(formation and w.target_formation and formation.lower() in w.target_formation.lower())
            relevance = calculate_relevance_score(dist, radius_km, min_depth_diff if closest_event else 500.0, strat_match, has_crit)

            results.append(NearbyWellResult(
                well=w,
                distance_km=dist,
                relevance_score=relevance,
                stratigraphic_match=strat_match,
                depth_offset_m=round(min_depth_diff, 1) if closest_event else 0.0,
                closest_historical_event=closest_event
            ))

    results.sort(key=lambda x: x.relevance_score, reverse=True)

    return NearbyWellResponse(
        active_well=ActiveWellHeader(
            id=active_well.id if active_well else "OIL-ACTIVE-01",
            name=active_well.well_name if active_well else "NHK-Deep-504",
            latitude=latitude,
            longitude=longitude,
            current_depth=current_depth,
            formation=formation
        ),
        radius_km=radius_km,
        total_nearby_count=len(results),
        results=results
    )

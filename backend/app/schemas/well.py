from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class WellSchema(BaseModel):
    id: str
    well_name: str
    field: str
    block: Optional[str] = None
    latitude: float
    longitude: float
    elevation_m: Optional[float] = 120.0
    total_depth_m: float
    current_depth_m: Optional[float] = 0.0
    target_formation: Optional[str] = None
    current_formation: Optional[str] = None
    spud_date: Optional[date] = None
    status: str
    is_active: Optional[bool] = False
    rig_name: Optional[str] = None
    casing_program: Optional[str] = None

    class Config:
        from_attributes = True

class NearbyWellResult(BaseModel):
    well: WellSchema
    distance_km: float
    relevance_score: int
    stratigraphic_match: bool
    depth_offset_m: float
    closest_historical_event: Optional[dict] = None

class ActiveWellHeader(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    current_depth: float
    formation: Optional[str] = None

class NearbyWellResponse(BaseModel):
    active_well: ActiveWellHeader
    radius_km: float
    total_nearby_count: int
    results: List[NearbyWellResult]

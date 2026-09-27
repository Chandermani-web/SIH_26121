from pydantic import BaseModel
from typing import Optional
from datetime import date

class HistoricalEventSchema(BaseModel):
    id: str
    well_id: str
    well_name: str
    event_type: str
    severity: str
    depth_m: float
    formation: Optional[str] = None
    incident_date: Optional[date] = None
    description: str
    root_cause: Optional[str] = None
    mitigation: Optional[str] = None
    npt_hours: Optional[float] = 0.0
    cost_impact_inr_lakhs: Optional[float] = 0.0
    source_document: Optional[str] = None
    source_document_page: Optional[int] = 1

    class Config:
        from_attributes = True

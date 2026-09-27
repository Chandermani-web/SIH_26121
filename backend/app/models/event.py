from sqlalchemy import Column, String, Float, Text, Date, DateTime, Integer, ForeignKey
from sqlalchemy.sql import func
from backend.app.core.database import Base

class HistoricalEvent(Base):
    __tablename__ = "events"

    id = Column(String(64), primary_key=True, index=True)
    well_id = Column(String(64), ForeignKey("wells.id", ondelete="CASCADE"), nullable=False, index=True)
    well_name = Column(String(120), nullable=False)
    event_type = Column(String(64), nullable=False, index=True)
    severity = Column(String(32), nullable=False)
    depth_m = Column(Float, nullable=False, index=True)
    formation = Column(String(120), nullable=True)
    incident_date = Column(Date, nullable=True)
    description = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=True)
    mitigation = Column(Text, nullable=True)
    npt_hours = Column(Float, default=0.0)
    cost_impact_inr_lakhs = Column(Float, default=0.0)
    source_document = Column(String(120), nullable=True)
    source_document_page = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

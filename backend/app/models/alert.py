from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.app.core.database import Base

class ProactiveAlert(Base):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True, index=True)
    well_id = Column(String(64), ForeignKey("wells.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False)
    depth_m = Column(Float, nullable=False)
    formation = Column(String(120), nullable=True)
    why_detected = Column(Text, nullable=False)
    recommended_mitigation = Column(Text, nullable=False)
    status = Column(String(32), default="ACTIVE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

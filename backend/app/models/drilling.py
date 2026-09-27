from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.app.core.database import Base

class DrillingParameter(Base):
    __tablename__ = "drilling_parameters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    well_id = Column(String(64), ForeignKey("wells.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    measured_depth_m = Column(Float, nullable=False, index=True)
    tvd_m = Column(Float, nullable=False)
    rop_m_hr = Column(Float, default=0.0)
    wob_klb = Column(Float, default=0.0)
    rpm = Column(Float, default=0.0)
    torque_kft_lb = Column(Float, default=0.0)
    spp_psi = Column(Float, default=0.0)
    flow_in_gpm = Column(Float, default=0.0)
    flow_out_gpm = Column(Float, default=0.0)
    mud_weight_ppg = Column(Float, default=10.0)
    pit_volume_bbl = Column(Float, default=450.0)
    formation = Column(String(120), nullable=True)

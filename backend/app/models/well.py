from sqlalchemy import Column, String, Float, Boolean, Date, DateTime, Text, Integer, ForeignKey
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from backend.app.core.database import Base

class Well(Base):
    __tablename__ = "wells"

    id = Column(String(64), primary_key=True, index=True)
    well_name = Column(String(120), nullable=False)
    field = Column(String(80), nullable=False, index=True)
    block = Column(String(120), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geom = Column(Geometry(geometry_type='POINT', srid=4326), nullable=True)
    elevation_m = Column(Float, default=120.0)
    total_depth_m = Column(Float, nullable=False)
    current_depth_m = Column(Float, default=0.0)
    target_formation = Column(String(120), nullable=True)
    current_formation = Column(String(120), nullable=True)
    spud_date = Column(Date, nullable=True)
    status = Column(String(50), nullable=False, default="DRILLING")
    is_active = Column(Boolean, default=False)
    rig_name = Column(String(120), nullable=True)
    casing_program = Column(Text, nullable=True)
    mud_system = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WellTrajectory(Base):
    __tablename__ = "well_trajectories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    well_id = Column(String(64), ForeignKey("wells.id", ondelete="CASCADE"), nullable=False)
    md_m = Column(Float, nullable=False)
    tvd_m = Column(Float, nullable=False)
    inclination_deg = Column(Float, default=0.0)
    azimuth_deg = Column(Float, default=0.0)
    northing_m = Column(Float, default=0.0)
    easting_m = Column(Float, default=0.0)
    geom = Column(Geometry(geometry_type='POINT', srid=4326), nullable=True)

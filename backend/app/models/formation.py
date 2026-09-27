from sqlalchemy import Column, Integer, String, Float, Text, JSON
from backend.app.core.database import Base

class Formation(Base):
    __tablename__ = "formations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), unique=True, nullable=False)
    top_depth_m = Column(Float, nullable=False)
    bottom_depth_m = Column(Float, nullable=False)
    lithology = Column(Text, nullable=True)
    pore_pressure_gradient_ppg = Column(Float, default=8.5)
    fracture_gradient_ppg = Column(Float, default=14.0)
    dominant_risks = Column(JSON, default=list)

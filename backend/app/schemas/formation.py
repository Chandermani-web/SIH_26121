from pydantic import BaseModel
from typing import List, Optional

class FormationSchema(BaseModel):
    name: str
    top_depth_m: float
    bottom_depth_m: float
    lithology: Optional[str] = None
    pore_pressure_gradient_ppg: Optional[float] = 8.5
    fracture_gradient_ppg: Optional[float] = 14.0
    dominant_risks: Optional[List[str]] = []

    class Config:
        from_attributes = True

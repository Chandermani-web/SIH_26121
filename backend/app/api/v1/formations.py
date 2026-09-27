from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import json
import os

from backend.app.core.database import get_db
from backend.app.models.formation import Formation
from backend.app.schemas.formation import FormationSchema

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_DIR = os.path.join(BASE_DIR, "data")

@router.get("/formations", response_model=List[FormationSchema])
def list_formations(db: Session = Depends(get_db)):
    try:
        return db.query(Formation).all()
    except Exception:
        formations_file = os.path.join(DATA_DIR, "formations.json")
        if os.path.exists(formations_file):
            with open(formations_file) as f:
                data = json.load(f)
            return [
                FormationSchema(
                    name=fm["name"],
                    top_depth_m=fm.get("topDepth") or fm.get("top_depth_m", 0.0),
                    bottom_depth_m=fm.get("bottomDepth") or fm.get("bottom_depth_m", 0.0),
                    lithology=fm.get("typicalLithology") or fm.get("lithology", ""),
                    pore_pressure_gradient_ppg=fm.get("porePressureGradientPpg") or fm.get("pore_pressure_gradient_ppg", 8.5),
                    fracture_gradient_ppg=fm.get("fractureGradientPpg") or fm.get("fracture_gradient_ppg", 14.0),
                    dominant_risks=fm.get("dominantRisks") or fm.get("dominant_risks", [])
                )
                for fm in data
            ]
        return []

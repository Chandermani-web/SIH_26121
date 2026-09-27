from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SimControlRequest(BaseModel):
    demoMode: Optional[bool] = True
    speed: Optional[float] = 1.0

class MitigationRequest(BaseModel):
    pillType: Optional[str] = "45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill"

@router.post("/simulation/start")
def start_simulation(req: SimControlRequest):
    return {
        "success": True,
        "message": "Telemetry simulation started in demo mode",
        "state": {
            "isRunning": True,
            "isDemoMode": req.demoMode,
            "currentDepth": 2842.0,
            "formation": "Barail Main Sand"
        }
    }

@router.post("/simulation/stop")
def stop_simulation():
    return {
        "success": True,
        "message": "Simulation paused",
        "state": {
            "isRunning": False
        }
    }

@router.post("/simulation/mitigate")
def pump_mitigation(req: MitigationRequest):
    return {
        "success": True,
        "message": f"Successfully pumped mitigation pill: {req.pillType}",
        "remediation": "Loss rate normalized to 0.0 gpm. Active pit volume stabilized."
    }

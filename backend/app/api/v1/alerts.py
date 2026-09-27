from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

ALERTS_CACHE: List[Dict[str, Any]] = [
    {
        "id": "ALT-001",
        "type": "MUD_LOSS",
        "severity": "CRITICAL",
        "title": "Severe Lost Circulation Risk Horizon Approaching",
        "depth": 2845.0,
        "formation": "Barail Main Sand",
        "whyDetected": "Telemetry exhibits flow-out deficit (-25 gpm) with torque oscillations. Offset well NHK-142 (2.15 km away) suffered total loss of 68 bbls at this exact depth (2845m).",
        "offsetWell": "NHK-142",
        "evidence": {
            "sourceDoc": "WCR-NHK-142",
            "page": 42,
            "incidentDate": "18-APR-2021",
            "historicalLoss": "68 bbls in 12 min"
        },
        "historicalMitigation": "Spot 45 bbl engineered LCM squeeze pill (25 ppb coarse CaCO3 + 15 ppb medium Mica + 5 ppb Walnut shell) with 300 psi hesitation squeeze.",
        "status": "ACTIVE",
        "timestamp": "2026-09-27T16:50:00Z"
    }
]

@router.get("/alerts")
def get_alerts():
    return ALERTS_CACHE

@router.patch("/alerts/{alert_id}")
def acknowledge_alert(alert_id: str):
    for a in ALERTS_CACHE:
        if a["id"] == alert_id:
            a["status"] = "ACKNOWLEDGED"
            return {"success": True, "alert": a}
    return {"success": False, "error": "Alert not found"}

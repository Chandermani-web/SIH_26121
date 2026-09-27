from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/risk/current/{well_id}")
def get_current_risk(well_id: str):
    return {
        "wellId": well_id,
        "overallRiskLevel": "CRITICAL",
        "compositeRiskScore": 84,
        "dimensions": [
            {
                "type": "MUD_LOSS",
                "label": "Lost Circulation / Hydraulic Fracturing",
                "score": 88,
                "severity": "CRITICAL",
                "probability": 0.88,
                "offsetPrecedent": "NHK-142 (2845m, 68 bbls loss)",
                "evidenceDoc": "WCR-NHK-142",
                "recommendedMitigation": "Prepare 45 bbl CaCO3 + Mica LCM squeeze pill. Maintain ECD < 10.4 ppg."
            },
            {
                "type": "STUCK_PIPE",
                "label": "Differential Sticking in Permeable Sand",
                "score": 72,
                "severity": "HIGH",
                "probability": 0.72,
                "offsetPrecedent": "KNG-38 (2860m, 35 min stationary)",
                "evidenceDoc": "DDR-KNG-38",
                "recommendedMitigation": "Rotate string during connections. Max stationary time < 3 mins."
            },
            {
                "type": "KICK",
                "label": "Underbalanced Influx / Formation Kick",
                "score": 24,
                "severity": "LOW",
                "probability": 0.24,
                "offsetPrecedent": "MRN-84 (3210m Kopili transition)",
                "evidenceDoc": "WCR-MRN-84",
                "recommendedMitigation": "Monitor pit volume and flow checks upon entering Kopili."
            },
            {
                "type": "TORQUE_SPIKE",
                "label": "Torsional Resonance & Coal Sloughing",
                "score": 65,
                "severity": "MEDIUM",
                "probability": 0.65,
                "offsetPrecedent": "NHK-142 (2720m Barail Coal)",
                "evidenceDoc": "WCR-NHK-142",
                "recommendedMitigation": "Optimize WOB / RPM ratio. Add lubricant to mud system."
            },
            {
                "type": "CEMENTING_ISSUE",
                "label": "Casing & Cementing Slurry Flash Risk",
                "score": 35,
                "severity": "LOW",
                "probability": 0.35,
                "offsetPrecedent": "SLM-12 (2580m Girujan Clay)",
                "evidenceDoc": "WCR-SLM-12",
                "recommendedMitigation": "Calibrate retarder for BHT = 88°C before 7\" liner job."
            }
        ]
    }

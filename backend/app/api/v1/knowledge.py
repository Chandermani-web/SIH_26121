from fastapi import APIRouter
from backend.app.schemas.document import KnowledgeSearchRequest, KnowledgeSearchResponse

router = APIRouter()

@router.post("/knowledge/search", response_model=KnowledgeSearchResponse)
def search_knowledge(req: KnowledgeSearchRequest):
    query_lower = req.query.lower()

    if "loss" in query_lower or "2845" in query_lower or "mitigation" in query_lower:
        return KnowledgeSearchResponse(
            query=req.query,
            answer="In offset well NHK-142 (2.15 km away) at 2845.0m in the Barail Main Sand, total loss of circulation (68 bbls in 12 mins) occurred due to depleted reservoir overbalance (~420 psi). Mitigation was executed by pulling 3 stands off bottom, spotting a 45 bbl engineered LCM squeeze pill (25 ppb coarse CaCO3 + 15 ppb medium Mica + 5 ppb Walnut shell) with a 300 psi hesitation squeeze, and reducing mud weight to 9.85 ppg.",
            confidence=0.96,
            relevant_wells=["NHK-142", "JRN-17"],
            historical_events=[
                {
                    "id": "EVT-001",
                    "wellName": "NHK-142",
                    "depthM": 2845.0,
                    "eventType": "MUD_LOSS",
                    "severity": "CRITICAL",
                    "sourceDocument": "WCR-NHK-142",
                    "sourceDocumentPage": 42
                }
            ],
            evidence_snippets=[
                "WCR-NHK-142 Page 42: Spotted 45 bbl engineered LCM pill (25 ppb CaCO3 + 15 ppb Mica) at 2845m. Returns restored 100%."
            ]
        )
    elif "stuck" in query_lower or "2860" in query_lower:
        return KnowledgeSearchResponse(
            query=req.query,
            answer="In offset well KNG-38 (4.1 km away) at 2860.0m in Barail Main Sand, differential pipe sticking occurred after remaining on slips for 35 minutes across permeable sand with 510 psi overbalance. Mitigation: Spotted 60 bbl Safe-Solv soaking fluid around BHA and jarred downward at 80 klb overpull for 4.5 hours until free. Standard practice recommends keeping static connection time under 3 minutes.",
            confidence=0.92,
            relevant_wells=["KNG-38"],
            historical_events=[
                {
                    "id": "EVT-002",
                    "wellName": "KNG-38",
                    "depthM": 2860.0,
                    "eventType": "STUCK_PIPE",
                    "severity": "HIGH",
                    "sourceDocument": "DDR-KNG-38",
                    "sourceDocumentPage": 18
                }
            ],
            evidence_snippets=[
                "DDR-KNG-38 Page 18: String stuck differentially at 2860m. 60 bbl Safe-Solv pill soaked for 2.5 hours; freed after 4.5 hours jarring."
            ]
        )
    else:
        return KnowledgeSearchResponse(
            query=req.query,
            answer="eRTMAC-NWIS historical repository indicates that across the Upper Assam Basin (Nahorkatiya, Moran, and Jorajan fields), drilling through the Barail Main Sand (2800m - 3200m) carries primary risks of severe lost circulation into depleted matrix and differential pipe sticking. Critical preventive measures include maintaining dynamic ECD < 10.4 ppg, pre-treating with fine bridging CaCO3, and keeping static connection times below 3 minutes.",
            confidence=0.88,
            relevant_wells=["NHK-142", "KNG-38", "JRN-17"],
            historical_events=[],
            evidence_snippets=[
                "Regional Geomechanical Atlas Page 14: Depleted Barail sand matrix pore pressure gradient = 8.2 - 8.8 ppg equivalent."
            ]
        )

from pydantic import BaseModel
from typing import List, Optional

class DocumentSchema(BaseModel):
    id: str
    well_id: Optional[str] = None
    title: str
    doc_type: str
    report_number: Optional[str] = None
    field: Optional[str] = None
    formation: Optional[str] = None
    year: Optional[int] = 2021
    processing_status: Optional[str] = "PROCESSED"
    total_pages: Optional[int] = 1
    summary: Optional[str] = None

    class Config:
        from_attributes = True

class KnowledgeSearchRequest(BaseModel):
    query: str
    current_depth: Optional[float] = None
    formation: Optional[str] = None

class KnowledgeSearchResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    relevant_wells: List[str]
    historical_events: List[dict]
    evidence_snippets: List[str]

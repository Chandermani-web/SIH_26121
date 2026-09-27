from pydantic import BaseModel
from typing import Dict, Any

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    organization: str
    phase: str
    database: Dict[str, Any]
    redis: Dict[str, Any]
    timestamp: str

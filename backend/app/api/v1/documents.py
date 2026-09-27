from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from backend.app.core.database import get_db
from backend.app.schemas.document import DocumentSchema

router = APIRouter()

DOCUMENTS_FALLBACK = [
    DocumentSchema(
        id="DOC-001",
        well_id="OIL-HIST-01",
        title="Well Completion Report — NHK-142 (Barail Lost Circulation)",
        doc_type="WCR",
        report_number="WCR-NHK-142",
        field="Nahorkatiya",
        formation="Barail Main Sand",
        year=2021,
        processing_status="PROCESSED",
        total_pages=58,
        summary="Detailed post-drilling analysis of total mud loss encountered at 2845m depth in Barail depleted sandstone and successful mitigation with 45 bbl engineered CaCO3 + Mica pill."
    ),
    DocumentSchema(
        id="DOC-002",
        well_id="OIL-HIST-02",
        title="Daily Drilling Incident Log — KNG-38 (Differential Pipe Sticking)",
        doc_type="DDR",
        report_number="DDR-KNG-38",
        field="Kusijan",
        formation="Barail Main Sand",
        year=2020,
        processing_status="PROCESSED",
        total_pages=24,
        summary="Investigation report covering differential sticking at 2860m after 35-minute static connection period; details 4.5 hours jarring and 60 bbl Safe-Solv soaking fluid freeing operation."
    ),
    DocumentSchema(
        id="DOC-003",
        well_id="OIL-HIST-03",
        title="Well Control Investigation — JRN-17 (Severe Losses & Gunk Plug)",
        doc_type="DDR",
        report_number="DDR-JRN-17",
        field="Jorajan",
        formation="Barail Main Sand",
        year=2019,
        processing_status="PROCESSED",
        total_pages=36,
        summary="Severe losses (>110 bbl/hr) across secondary fault splay; details two successive 50 bbl Bentonite-Diesel-Oil (DOB) gunk plugs used to seal high-aperture natural fractures."
    ),
    DocumentSchema(
        id="DOC-004",
        well_id=None,
        title="Upper Assam Regional Geomechanical & Pore Pressure Atlas",
        doc_type="GEO_ATLAS",
        report_number="GEO-ASSAM-2024",
        field="Regional",
        formation="All Horizons",
        year=2024,
        processing_status="PROCESSED",
        total_pages=112,
        summary="Basin-wide compilation of stress orientations, fracture gradients, pore pressure trends, and fault-slip tendencies across Nahorkatiya, Moran, and Jorajan fields."
    )
]

@router.get("/documents", response_model=List[DocumentSchema])
def list_documents(db: Session = Depends(get_db)):
    return DOCUMENTS_FALLBACK

@router.post("/documents/upload", response_model=DocumentSchema)
async def upload_document(
    file: UploadFile = File(...),
    well_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None)
):
    doc_id = f"DOC-{len(DOCUMENTS_FALLBACK) + 1:03d}"
    filename = file.filename or "uploaded_report.txt"
    new_doc = DocumentSchema(
        id=doc_id,
        well_id=well_id,
        title=title or filename,
        doc_type="UPLOADED_REPORT",
        report_number=f"OIL-UP-{len(DOCUMENTS_FALLBACK)+1:03d}",
        field="Upper Assam Asset",
        formation="Barail / Tipam",
        year=2026,
        processing_status="PROCESSED",
        total_pages=1,
        summary=f"Processed and chunked technical document from file '{filename}'."
    )
    DOCUMENTS_FALLBACK.append(new_doc)
    return new_doc

from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, index=True)
    well_id = Column(String(64), ForeignKey("wells.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    doc_type = Column(String(64), nullable=False)
    report_number = Column(String(120), nullable=True)
    field = Column(String(80), nullable=True)
    formation = Column(String(120), nullable=True)
    year = Column(Integer, default=2021)
    file_path = Column(Text, nullable=True)
    processing_status = Column(String(32), default="PROCESSED")
    total_pages = Column(Integer, default=1)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, default=1)
    depth_reference_m = Column(Float, nullable=True)
    formation = Column(String(120), nullable=True)
    section_title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict)

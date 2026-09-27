"""
backend/app/main.py
eRTMAC-NWIS — FastAPI Main Application Entrypoint
Oil India Limited (OIL) — Nearby Wells Intelligence System
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from backend.app.core.config import settings
from backend.app.api.v1 import (
    health,
    wells,
    events,
    formations,
    documents,
    knowledge,
    risk,
    alerts,
    simulation
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-Time AI-Powered Drilling Decision Support System for Correlating Historical Offset Wells, Geological Hazards, and Field Mitigations.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Logging Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "service": "eRTMAC-NWIS Backend"
        }
    )

# Root endpoint
@app.get("/")
def read_root():
    return {
        "service": settings.PROJECT_NAME,
        "organization": settings.ORGANIZATION,
        "status": "OPERATIONAL",
        "documentation": "/docs",
        "openapi": "/openapi.json",
        "health": "/health"
    }

# Health Endpoint at root level
app.include_router(health.router, tags=["Health"])

# API v1 Routers
app.include_router(wells.router, prefix=settings.API_V1_STR, tags=["Wells & Spatial GIS"])
app.include_router(events.router, prefix=settings.API_V1_STR, tags=["Historical Incidents"])
app.include_router(formations.router, prefix=settings.API_V1_STR, tags=["Stratigraphy"])
app.include_router(documents.router, prefix=settings.API_V1_STR, tags=["Technical Documents"])
app.include_router(knowledge.router, prefix=settings.API_V1_STR, tags=["Evidence RAG Knowledge Search"])
app.include_router(risk.router, prefix=settings.API_V1_STR, tags=["Risk Intelligence"])
app.include_router(alerts.router, prefix=settings.API_V1_STR, tags=["Proactive Alerts"])
app.include_router(simulation.router, prefix=settings.API_V1_STR, tags=["Telemetry Simulator"])

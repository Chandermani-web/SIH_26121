# eRTMAC-NWIS — Nearby Wells Intelligence System
### Smart India Hackathon (SIH)
**Organization:** Oil India Limited (OIL)  
**System Classification:** Real-Time AI-Powered Drilling Decision Support System  
**Current Phase:** PHASE 1 — Project Foundation & Spatial Intelligence

---

## 1. Executive Summary & Objective

During high-cost, high-risk drilling operations in complex geological environments (such as the Upper Assam Basin), drilling engineers face severe subsurface uncertainties including sudden lost circulation, differential pipe sticking, formation overpressure kicks, and drillstring mechanical failures.

**eRTMAC-NWIS** is an AI-powered intelligence companion built to operate alongside real-time monitoring systems (eRTMAC). As an active well is being drilled, the system continuously and automatically:
1. **Identifies relevant historical offset wells** using spatial GIS and stratigraphic depth correlation.
2. **Correlates drilling parameters, formation attributes, mud logs, and historical incidents** with the active well.
3. **Predicts imminent operational risks** before or while they occur.
4. **Surfaces evidence-backed historical lessons, proven field mitigations, and exact source document citations** (Well Completion Reports and Daily Drilling Reports).

> **Core Operating Principle:**  
> **eRTMAC-NWIS is a Decision-Support System.** It does not pretend that AI autonomously takes drilling decisions. Every risk indicator, correlation, and mitigation recommendation is transparently grounded in verified historical records with clear confidence levels. **The final operational decision remains strictly with the drilling engineer.**

---

## 2. Directory Structure

```
.
├── backend/                  # Standalone FastAPI Python service
│   ├── app/
│   │   ├── api/v1/           # API routers (wells, events, formations, documents, knowledge, risk, alerts, simulation)
│   │   ├── core/             # Configuration, Database (SQLAlchemy/PostGIS), Redis client
│   │   ├── models/           # SQLAlchemy models (Well with PostGIS Geometry, Event, Formation, Document, etc.)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── main.py           # FastAPI application entrypoint with OpenAPI docs
│   ├── alembic/              # Database migration scripts
│   ├── Dockerfile            # Python 3.11 container build
│   └── requirements.txt      # Python dependencies
├── data/                     # Seed datasets & technical reports
│   ├── documents/            # Sample synthetic WCR and DDR reports, logs, CSVs
│   ├── formations.json       # Stratigraphic column (Alluvium to Kopili)
│   ├── wells_seed.json       # 17 Upper Assam wells with coordinates
│   └── events_seed.json      # 65+ historical drilling incidents
├── docs/                     # Technical specifications
│   ├── ARCHITECTURE.md       # Multi-tier system architecture & relevance formulas
│   ├── API_SPECIFICATION.md  # REST API and WebSocket contract
│   ├── DATABASE_SCHEMA.md    # PostGIS geometry ER diagram and queries
│   └── PHASE1_FOUNDATION.md  # Phase 1 milestones and verification report
├── frontend/                 # React frontend documentation & scripts
├── scripts/                  # Automation & verification scripts
│   ├── generate_demo_data.py # Generates synthetic dataset files
│   ├── seed_database.py      # Seeds PostgreSQL/PostGIS with spatial geometries
│   └── verify_setup.py       # Automated Phase 1 verification test suite
├── src/                      # Full-stack React + TypeScript + Express application
├── server.ts                 # Full-stack Node/Express server & WebSocket gateway
├── docker-compose.yml        # Multi-service topology (PostgreSQL, Redis, FastAPI, Fullstack App)
├── Dockerfile                # Multi-stage production build
└── .env.example              # Environment variables template
```

---

## 3. Quickstart & Installation

### Option 1: Docker Compose (All Services)
```bash
# 1. Build and launch all containers
docker-compose up --build

# Services started:
# - Fullstack App:   http://localhost:3000
# - FastAPI Backend: http://localhost:8000 (OpenAPI Docs at http://localhost:8000/docs)
# - PostgreSQL/GIS:  localhost:5432
# - Redis:           localhost:6379
```

### Option 2: Local Development
```bash
# 1. Install Node.js dependencies
npm install

# 2. Run Phase 1 automated verification test
python3 scripts/verify_setup.py

# 3. Start development server
npm run dev

# 4. Open in browser:
http://localhost:3000
```

---

## 4. API Documentation & OpenAPI Specification

- **Interactive Swagger UI:** `http://localhost:3000/docs` or `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`
- **System Healthcheck:** `GET /health` and `GET /api/health`

### Key Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/health` | System status, database & redis connections |
| **Wells** | `GET` | `/api/wells` | List all monitored wells in Upper Assam |
| | `GET` | `/api/wells/active` | Active drilling well status & live telemetry |
| | `GET` | `/api/wells/nearby` | Spatial GIS proximity query with relevance score |
| | `GET` | `/api/wells/:id` | Detailed well dossier with casing & trajectory |
| **Events** | `GET` | `/api/events` | Search 65+ historical incidents |
| **Formations**| `GET` | `/api/formations` | Stratigraphic column with pore & fracture gradients |
| **Documents** | `GET` | `/api/documents` | Ingested WCR & DDR technical document list |
| | `POST` | `/api/documents/upload` | Ingest new technical document |
| **Knowledge** | `POST` | `/api/knowledge/search` | Evidence-grounded natural language search |
| **Risk** | `GET` | `/api/risk/current/:well_id` | 5-dimension predictive risk matrix |
| **Simulation**| `POST` | `/api/simulation/start` | Start eRTMAC telemetry streaming |
| | `POST` | `/api/simulation/stop` | Pause telemetry stream |
| | `POST` | `/api/simulation/mitigate` | Deploy field-tested LCM squeeze pill |
| **Alerts** | `GET` | `/api/alerts` | Active proactive alerts |
| | `PATCH` | `/api/alerts/:id` | Acknowledge alert |

---

## 5. SIH Demonstration Workflow

Clicking **"RUN SIH DEMO SCENARIO"** in the top navigation activates the automated sequence:
1. **2838m — Approach:** Well `NHK-Deep-504` drills smoothly in the Barail Main Sand.
2. **2841m — Micro-fractures:** Flow-out deficit (-15 gpm) and torque fluctuations occur.
3. **2845m — Critical Alert:** System matches historical well **NHK-142** (2.15 km away, total loss of 68 bbls at 2845m).
4. **Mitigation:** Drilling engineer deploys the **45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill** directly from the UI.
5. **Recovery:** Returns restore to 560 gpm and drilling resumes safely.

---

## 6. Disclaimer

*All data included in this prototype has been realistically synthesized to reflect typical Upper Assam Basin geological and drilling conditions (Barail Main Sand, Girujan Clay, Tipam Sandstone). It is designed exclusively for demonstration and evaluation under Smart India Hackathon.*

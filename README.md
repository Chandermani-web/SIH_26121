# eRTMAC-NWIS — Nearby Wells Intelligence System
### Smart India Hackathon (SIH) | Problem Statement ID: 26121
**Organization:** Oil India Limited (OIL)  
**System Classification:** Real-Time AI-Powered Drilling Decision Support System

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

## 2. System Architecture

```
                             +-------------------------------+
                             |    Operations Web Dashboard   |
                             | (React + TypeScript + Leaflet)|
                             +---------------+---------------+
                                             |
                                   HTTP REST / WebSocket
                                             |
                                             v
                             +-------------------------------+
                             |    FastAPI / Express Server   |
                             |   (eRTMAC Telemetry Engine)   |
                             +---------------+---------------+
                                             |
                 +---------------------------+---------------------------+
                 |                           |                           |
                 v                           v                           v
     +-----------------------+   +-----------------------+   +-----------------------+
     |  Nearby Well Engine   |   |   Predictive Risk     |   |   Evidence RAG Engine |
     | (Haversine & Stratum) |   | (Telemetry & Hazards) |   | (Chunks & Citations)  |
     +-----------+-----------+   +-----------+-----------+   +-----------+-----------+
                 |                           |                           |
                 +---------------------------+---------------------------+
                                             |
                                             v
                             +-------------------------------+
                             |  PostgreSQL / PostGIS Data    |
                             |  65+ Incidents · 16 Wells     |
                             |  WCR/DDR Knowledge Chunks     |
                             +---------------+---------------+
                                             |
                             +---------------+---------------+
                             |       Gemini 3.8 Flash        |
                             | (Server-Side + Safe Fallback) |
                             +-------------------------------+
```

---

## 3. Key Capabilities & Implemented Modules

### A. Geospatial GIS Offset Well Map
- Displays active drilling well (`NHK-Deep-504`) and 16 historical offset wells in Upper Assam fields (*Nahorkatiya, Moran, Kusijan, Jorajan, Baghjan, Digboi, Shalmari*).
- Dynamic distance rings (2.5 km, 5.0 km, 10 km, custom radius slider 2–40 km).
- Offset markers color-coded by **Historical Relevance Score**.
- Interactive well popups detailing target formations, total depth, and closest incident depth offsets.

### B. Well Correlation & Relevance Scoring Engine
Calculates normalized **Historical Relevance Score (0–100%)**:
$$\text{Relevance} = 0.30 \times \text{Spatial} + 0.30 \times \text{DepthProximity} + 0.25 \times \text{FormationMatch} + 0.15 \times \text{IncidentSeverity}$$
Every score provides a factor breakdown explaining *why* the well is relevant (e.g. *Same formation Barail Main Sand*, *Δ 5m depth offset*, *2.3 km distance*).

### C. Predictive Multi-Dimensional Risk Engine
Evaluates 5 operational risk dimensions:
1. **Lost Circulation / Fracturing Risk** (Barail depleted sands)
2. **Differential Sticking & Pack-Off Risk** (Stationary string overbalance)
3. **Well Influx / Geopressure Kick Risk** (Kopili transition overpressures)
4. **Torsional Resonance & Stick-Slip Risk** (Interbedded coal seams)
5. **Casing & Cementing Integrity Risk** (Slurry loss across thief zones)

### D. Real-Time eRTMAC Telemetry Simulator & WebSocket Stream
- Continuous 1-second interval surface and downhole WITS telemetry stream:
  - Measured Depth (MD) and True Vertical Depth (TVD)
  - Rate of Penetration (ROP, m/hr)
  - Weight on Bit (WOB, klb) & Rotary Speed (RPM)
  - Top Drive Torque (kft-lb) with stick-slip anomaly warnings
  - Standpipe Pressure (SPP, psi)
  - Active Flow In vs. Flow Out (gpm) with loss deficit monitoring
  - Mud Weight In / Out (ppg) and Pit Volume balance (bbl)
- Proactive alerts pushed in real-time over WebSocket (`/ws/well/{well_id}`).

### E. Evidence-Grounded Knowledge Search (RAG)
- Vectorized chunk search across technical documents:
  - **WCR-NHK-142** (Well Completion Report, Nahorkatiya Well 142)
  - **DDR-KNG-38** (Daily Drilling Incident Log, Kusijan Well 38)
  - **DDR-JRN-17** (Severe Lost Circulation Report, Jorajan Well 17)
  - **GEO-UPPER-ASSAM** (Regional Geomechanical & Pore Pressure Atlas)
- Natural language query answering powered by **Gemini 3.8 Flash** with deterministic local oilfield engine fallback when offline.
- Explicit page citations and ground-truth incident tables.

### F. Field Mitigation Deployment Panel
- Drilling engineers can trigger field-tested mitigation protocols:
  - **45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill** (*NHK-142 Precedent*)
  - **50 bbl Bentonite-Diesel DOB Gunk Plug** (*JRN-17 Total Loss Precedent*)
  - **60 bbl Safe-Solv Soaking Fluid** (*KNG-38 Differential Sticking Precedent*)
- Instantly remediates simulated lost returns and lowers torque fluctuations.

---

## 4. SIH Demo Presentation Scenario (One-Click Automated)

Clicking the **"RUN SIH DEMO SCENARIO"** button in the header triggers the complete end-to-end hackathon workflow:

1. **2838.0m — Normal Drilling:** Well `NHK-Deep-504` is rotating smoothly in Barail Main Sand with nominal torque (~14.8 kft-lb) and balanced flow (560 gpm in / 560 gpm out).
2. **2841.0m — Pre-Hazard Signs:** Torque begins fluctuating (19–23 kft-lb) as the bit encounters micro-fractures; flow out lags flow in by 15 gpm.
3. **2845.0m — Critical Proactive Alert Triggered:**
   - Active pit volume begins dropping (-4.5 bbl/tick); flow deficit widens to -120 gpm.
   - eRTMAC-NWIS matches offset well **NHK-142** (2.3 km offset) which suffered **total loss of returns (68 bbls in 12 min)** at this exact depth (2845m).
   - High Priority Collaborative Alert pulses on screen citing *Well Completion Report NHK-142, page 42*.
4. **Engineering Mitigation Action:**
   - Engineer clicks **"DEPLOY LCM PILL"**.
   - System simulates pumping 45 bbl engineered squeeze pill (25 ppb coarse CaCO3 + 15 ppb Mica).
   - Annular returns restore to 560 gpm, mud weight is safely adjusted to 9.85 ppg, and drilling resumes.
5. **2858m–2860m — Preventative Differential Sticking Advisory:**
   - System flags offset well **KNG-38** (4.1 km offset) which stuck differentially at 2860m after being left stationary for 35 minutes.
   - Advisory cautions crew to maintain string rotation (>25 RPM) during upcoming connection.

---

## 5. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Leaflet (React GIS Map).
- **Backend:** Express.js, TypeScript (`tsx`), Node.js, WebSocket Server (`ws`).
- **Data Engine:** In-memory operational models matching PostgreSQL/PostGIS and pgvector schemas.
- **AI / LLM:** Google GenAI SDK (`@google/genai` with `gemini-3.8-flash`) + Deterministic Expert Rules Engine.
- **Deployment:** Docker, Docker Compose (`docker-compose up --build`).

---

## 6. REST API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Wells** | `GET` | `/api/wells` | List all monitored wells in Upper Assam |
| | `GET` | `/api/wells/active` | Active drilling well status & telemetry |
| | `GET` | `/api/wells/nearby` | Spatial query with radius & formation filters |
| | `GET` | `/api/wells/:id` | Single well dossier, casing program, trajectory |
| **Events** | `GET` | `/api/events` | Faceted search across 65+ historical incidents |
| | `GET` | `/api/events/:id` | Incident investigation details, cause & remedy |
| **Documents** | `GET` | `/api/documents` | Ingested WCR & DDR technical document list |
| | `POST` | `/api/documents/upload` | Ingest new drilling document & create chunks |
| **RAG** | `POST` | `/api/knowledge/search` | Evidence-grounded natural language Q&A |
| **Risk** | `GET` | `/api/risk/current/:well_id` | Multi-dimensional risk prediction vector |
| | `GET` | `/api/risk/history/:well_id` | Stratigraphic risk-vs-depth cross plot |
| **Simulator** | `POST` | `/api/simulation/start` | Start eRTMAC telemetry stream / demo mode |
| | `POST` | `/api/simulation/stop` | Pause telemetry stream |
| | `POST` | `/api/simulation/step` | Advance bit depth by custom meter delta |
| | `POST` | `/api/simulation/mitigate` | Deploy field-tested LCM or soaking pill |
| **Alerts** | `GET` | `/api/alerts` | Active proactive alerts |
| | `PATCH` | `/api/alerts/:id` | Acknowledge alert |
| **Analytics** | `GET` | `/api/analytics/summary` | Field NPT, cost impact, and mitigation stats |

**WebSocket Stream:** `ws://localhost:3000/ws/well/OIL-ACTIVE-01`

---

## 7. Quickstart & Installation

### Option 1: Local Development
```bash
# 1. Clone repository & install dependencies
npm install

# 2. Configure environment (optional Gemini API key for AI RAG)
cp .env.example .env

# 3. Start full-stack development server
npm run dev

# 4. Open in browser:
http://localhost:3000
```

### Option 2: Docker Compose
```bash
docker-compose up --build
```

---

## 8. Role-Based Access Controls (RBAC)

The header provides a role switcher simulating access levels across Oil India operations:
- **Drilling Engineer:** Access to live telemetry, real-time WITS gauges, proactive hazard alerts, and pill deployment.
- **Geologist:** In-depth stratigraphic formation boundaries, pore pressure profiles, and correlation matrices.
- **Drilling Superintendent / Admin:** Rig spread oversight, NPT analytics, cost impact totals, and fleet well status.
- **Operations Viewer:** Read-only executive dashboard monitoring field progress.

---

## 9. Disclaimer

*All data included in this prototype has been realistically synthesized to reflect typical Upper Assam Basin geological and drilling conditions (Barail Main Sand, Girujan Clay, Tipam Sandstone). It is designed exclusively for demonstration and evaluation under Smart India Hackathon Problem Statement 26121.*
#   S I H _ 2 6 1 2 1  
 
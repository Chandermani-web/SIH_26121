# eRTMAC-NWIS — System Architecture & Technical Specification

## 1. System Overview
**eRTMAC-NWIS** (electronic Real-Time Monitoring & Advisory Centre — Nearby Wells Intelligence System) is an industrial-grade decision-support platform engineered for **Oil India Limited (OIL)** operations in the Upper Assam Foreland Basin.

The system correlates real-time drilling telemetry with historical offset well dossiers, stratigraphic hazards, daily drilling logs (DDR), well completion reports (WCR), and field mitigations to proactively forecast drilling incidents before they escalate.

---

## 2. Architectural Layers

```
+-----------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (Web SPA)                            |
|  - React 19 + TypeScript + Vite + Tailwind CSS                                    |
|  - Leaflet GIS Interactive Map with Distance Rings & Hazard Heatmap Layers        |
|  - Live WITS Telemetry Gauges (MD, TVD, ROP, WOB, RPM, Torque, SPP, Mud Balances) |
|  - Real-Time Proactive Alert Ribbon with Evidence Inspector & Mitigation Trigger  |
|  - Multi-Role Operational Command Decks (Drilling Eng, Geologist, Superintendent)  |
+------------------------------------------+----------------------------------------+
                                           | HTTP REST / WebSocket
                                           v
+-----------------------------------------------------------------------------------+
|                        API GATEWAY & TELEMETRY STREAM LAYER                       |
|  - Express.js / FastAPI Service Gateway                                           |
|  - WebSocket Server (RFC 6455) streaming at 1-second telemetry intervals          |
|  - CORS Security Policy & Role-Based Access Control (RBAC)                        |
|  - Dual Endpoints: /health and /api/health with system dependency introspection   |
+------------------------------------------+----------------------------------------+
                                           |
        +----------------------------------+----------------------------------+
        |                                  |                                  |
        v                                  v                                  v
+-----------------------+      +-----------------------+      +-----------------------+
|  SPATIAL & OFFSET     |      |   PREDICTIVE RISK     |      | EVIDENCE RAG & NLP    |
|  INTELLIGENCE ENGINE  |      |   ANALYSIS ENGINE     |      | KNOWLEDGE SEARCH      |
|                       |      |                       |      |                       |
| - PostGIS ST_DWithin  |      | - 5 Hazard Dimensions:|      | - Document Parsing:   |
| - Haversine Geo-Dist  |      |   1. Mud Loss         |      |   WCR, DDR, Logs      |
| - Historical          |      |   2. Differential     |      | - Chunking & Embeds   |
|   Relevance Score     |      |      Sticking         |      | - pgvector Search     |
| - Stratigraphic Depth |      |   3. Gas Influx / Kick|      | - Grounded Synthesis  |
|   Proximity Scoring   |      |   4. Stick-Slip Torque|      | - Deterministic Field |
|                       |      |   5. Cementing Slurry |      |   Fallback Generator  |
+-----------+-----------+      +-----------+-----------+      +-----------+-----------+
            |                              |                              |
            +------------------------------+------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                              PERSISTENCE & DATA LAYER                             |
|  - PostgreSQL 15 + PostGIS Spatial Geometries (SRID 4326)                         |
|  - pgvector High-Dimensional Vector Embeddings Storage                            |
|  - Redis 7 In-Memory Cache & Pub/Sub Telemetry Broker                             |
|  - Curated Upper Assam Basin Stratigraphy & 65+ Historical Incident Records       |
+-----------------------------------------------------------------------------------+
```

---

## 3. Mathematical Formulations

### 3.1 Historical Relevance Score
For an active drilling well at $(lat_0, lon_0)$ with measured depth $d_0$ in formation $f_0$, the relevance of an offset well $i$ is calculated as:

$$\text{Relevance}_i = w_s \cdot S_i + w_d \cdot D_i + w_f \cdot F_i + w_h \cdot H_i$$

Where:
- **Spatial Proximity ($S_i$):**
  $$S_i = \max\left(0, 1 - \frac{\text{Distance}(P_0, P_i)}{R_{\max}}\right)$$
  Calculated using the great-circle Haversine formula or PostGIS `ST_Distance(geom0::geography, geom_i::geography)`.
- **Depth Proximity ($D_i$):**
  $$D_i = \exp\left(-\frac{|d_0 - d_{\text{incident}, i}|}{150.0}\right)$$
  Exponential decay prioritizing incidents within $\pm 25$ meters of current bit depth.
- **Stratigraphic Formation Match ($F_i$):**
  $$F_i = \begin{cases} 1.0 & \text{if } f_i = f_0 \\ 0.5 & \text{if adjacent formation} \\ 0.0 & \text{otherwise} \end{cases}$$
- **Historical Hazard Severity Weight ($H_i$):**
  $$H_i = \begin{cases} 1.0 & \text{Critical (Total loss, Kick, Stuck pipe)} \\ 0.7 & \text{High} \\ 0.4 & \text{Medium / Minor} \end{cases}$$
- Default weights: $w_s = 0.30$, $w_d = 0.30$, $w_f = 0.25$, $w_h = 0.15$.

---

## 4. Operational Safety Boundary
eRTMAC-NWIS enforces a strict decision-support design contract:
- The system **never** triggers downhole tools or actuator changes autonomously.
- Every alert explicitly details:
  1. **Why it was triggered** (telemetry anomaly + offset precedent).
  2. **Historical Ground Truth** (Exact well name, year, depth offset, and document page).
  3. **Verified Field Mitigation Protocol** (e.g., 45 bbl CaCO3 + Mica LCM squeeze pill).

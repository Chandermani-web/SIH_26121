# eRTMAC-NWIS — REST API & WebSocket Specification

## Base URL
- Local Express/FastAPI Gateway: `http://localhost:3000` (or `http://localhost:8000` for FastAPI standalone)
- WebSocket Endpoint: `ws://localhost:3000/ws/well/{well_id}`

---

## 1. System Health & Introspection

### `GET /health` and `GET /api/health`
Returns system component status, database and redis connectivity, uptime, and telemetry state.

**Response (200 OK):**
```json
{
  "status": "HEALTHY",
  "service": "eRTMAC-NWIS Engine",
  "version": "1.0.0",
  "organization": "Oil India Limited (OIL)",
  "phase": "PHASE 1: Project Foundation & Operational Intelligence",
  "uptimeSeconds": 1420,
  "database": {
    "type": "PostgreSQL/PostGIS (Synthetic Hybrid Engine)",
    "status": "CONNECTED",
    "spatialEngine": "PostGIS / Haversine Geo-Correlation",
    "monitoredWellsCount": 17,
    "historicalEventsCount": 65
  },
  "redis": {
    "status": "ACTIVE_PUBSUB",
    "channel": "ertmac:telemetry:live"
  },
  "telemetryStream": {
    "activeWell": "NHK-Deep-504",
    "status": "STREAMING",
    "currentDepth": 2845.2
  },
  "timestamp": "2026-09-27T16:50:00.000Z"
}
```

---

## 2. Wells & GIS Spatial Intelligence

### `GET /api/wells`
List all monitored active and historical offset wells.
- Query parameters:
  - `field` (string, optional): e.g. `Nahorkatiya`, `Moran`, `Kusijan`
  - `status` (string, optional): e.g. `DRILLING`, `COMPLETED_PRODUCING`

### `GET /api/wells/active`
Retrieve currently drilling active well dossier and live WITS telemetry.

### `GET /api/wells/nearby`
Execute GIS spatial proximity search with stratigraphic depth correlation.
- Query parameters:
  - `latitude` (float, required): Active well latitude
  - `longitude` (float, required): Active well longitude
  - `radius_km` (float, default: 25): Search radius in kilometers
  - `current_depth` (float, optional): Current measured bit depth in meters
  - `formation` (string, optional): Target stratigraphic horizon

**Response (200 OK):**
```json
{
  "activeWell": {
    "id": "OIL-ACTIVE-01",
    "name": "NHK-Deep-504 (Active)",
    "latitude": 27.2985,
    "longitude": 95.3421,
    "currentDepth": 2845.0,
    "formation": "Barail Main Sand"
  },
  "radiusKm": 15,
  "totalNearbyCount": 8,
  "results": [
    {
      "well": {
        "id": "OIL-HIST-01",
        "wellName": "NHK-142",
        "field": "Nahorkatiya",
        "latitude": 27.3112,
        "longitude": 95.3584,
        "totalDepthM": 3280.0
      },
      "distanceKm": 2.15,
      "relevanceScore": 94,
      "stratigraphicMatch": true,
      "depthOffsetM": 0.0,
      "closestHistoricalEvent": {
        "eventType": "MUD_LOSS",
        "severity": "CRITICAL",
        "depthM": 2845.0,
        "description": "Total loss of returns (68 bbls) in depleted Barail sand"
      }
    }
  ]
}
```

---

## 3. Historical Events & Documents

### `GET /api/events`
Query 65+ curated historical drilling incidents.
- Filters: `eventType`, `formation`, `severity`, `wellId`, `minDepth`, `maxDepth`.

### `GET /api/documents`
List technical documents (Well Completion Reports, Daily Drilling Reports, Geomechanical Atlases).

### `POST /api/documents/upload`
Upload technical report (PDF/TXT/CSV) for text extraction, chunking, and embedding.

---

## 4. Evidence-Grounded Knowledge Search (RAG)

### `POST /api/knowledge/search`
**Request Body:**
```json
{
  "query": "What mitigation was used for severe lost circulation around 2845m in Nahorkatiya?",
  "currentDepth": 2845.0,
  "formation": "Barail Main Sand"
}
```

**Response (200 OK):**
```json
{
  "query": "What mitigation was used for severe lost circulation around 2845m in Nahorkatiya?",
  "answer": "Historically in offset well NHK-142 (2.15 km offset) at 2845.0m in the Barail Main Sand, total loss of circulation (68 bbls) was successfully mitigated by spotting a 45 bbl engineered LCM squeeze pill (25 ppb coarse CaCO3 + 15 ppb medium Mica + 5 ppb Walnut shell) with a 300 psi hesitation squeeze, followed by trimming active mud weight from 10.2 to 9.85 ppg.",
  "confidence": 0.94,
  "relevantWells": ["NHK-142", "JRN-17"],
  "historicalEvents": [
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
  "evidenceSnippets": [
    "WCR-NHK-142 Page 42: Spotted 45 bbl engineered LCM squeeze pill (25 ppb CaCO3 + 15 ppb Mica) at 2845m. Returns restored 100%."
  ]
}
```

---

## 5. Proactive Alerts & Telemetry Simulation

### `GET /api/alerts`
Active proactive drilling alerts.

### `PATCH /api/alerts/:id`
Acknowledge alert status.

### `POST /api/simulation/start`
Start real-time eRTMAC telemetry streaming.
- Body: `{"demoMode": true, "speed": 1.0}`

### `POST /api/simulation/stop`
Stop telemetry stream.

### `POST /api/simulation/mitigate`
Deploy field mitigation pill (e.g. `45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill`).

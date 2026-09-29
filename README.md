# eRTMAC-NWIS — Nearby Wells Intelligence System
### Smart India Hackathon (SIH)
**Organization:** Oil India Limited (OIL)  
**System Classification:** Real-Time Drilling Decision Support System  
**Architecture:** Pure Frontend Client-Side Intelligence (Self-Contained & Hardcoded)

---

## 1. Executive Summary & Objective

During high-cost, high-risk drilling operations in complex geological environments (such as the Upper Assam Basin), drilling engineers face severe subsurface uncertainties including sudden lost circulation, differential pipe sticking, formation overpressure kicks, and drillstring mechanical failures.

**eRTMAC-NWIS** is an industrial decision-support platform designed for **Oil India Limited (OIL)** operations. The entire application runs natively in the frontend client:
1. **Identifies relevant historical offset wells** using spatial GIS and stratigraphic depth correlation.
2. **Correlates drilling parameters, formation attributes, mud logs, and historical incidents** with the active well.
3. **Predicts operational risks** across 5 key dimensions (Mud Loss, Stuck Pipe, Kick, Torque Spike, Cementing).
4. **Surfaces evidence-backed historical lessons, proven field mitigations, and exact source document citations** (Well Completion Reports and Daily Drilling Reports).
5. **Simulates real-time eRTMAC drilling telemetry** with interactive 5-phase mud loss mitigation storyboard.

> **Core Operating Principle:**  
> **eRTMAC-NWIS is a Decision-Support System.** Every risk indicator, correlation, and mitigation recommendation is transparently grounded in verified historical records with clear confidence levels. **The final operational decision remains strictly with the drilling engineer.**

---

## 2. Directory Structure

```
.
├── src/
│   ├── components/           # React command dashboard components
│   │   ├── Header.tsx        # Top status bar, telemetry badges, demo triggers
│   │   ├── SihDemoHUD.tsx    # Interactive heads-up storyboard HUD
│   │   ├── DashboardOverview.tsx # KPI summary, active well cards, risk widgets
│   │   ├── LiveWellMonitor.tsx   # Live WITS gauges, parameter charts, mud balance
│   │   ├── GeospatialMap.tsx     # Interactive Leaflet GIS map with radius rings
│   │   ├── HistoricalEventsExplorer.tsx # 65+ incident search & filters
│   │   ├── RiskIntelligenceView.tsx     # 5-dimension risk matrix & depth timeline
│   │   ├── KnowledgeSearchRAG.tsx       # Grounded knowledge search engine
│   │   ├── DocumentCenter.tsx           # Technical reports viewer (WCR, DDR)
│   │   ├── AnalyticsView.tsx            # Fleet NPT, cost impacts, and metrics
│   │   ├── AlertsModal.tsx              # Proactive incident alerts inspector
│   │   └── WellDetailModal.tsx          # Well dossier & trajectory viewer
│   ├── mock/                 # 100% In-Browser Hardcoded Data & Simulation Engines
│   │   ├── wellsData.ts      # 17 Upper Assam wells & stratigraphic horizons
│   │   ├── eventsData.ts     # 65+ historical drilling incidents & mitigations
│   │   ├── documentsData.ts  # Ingested technical reports (WCR, DDR, Atlas)
│   │   ├── correlationEngine.ts # Haversine spatial proximity & relevance scoring
│   │   ├── riskEngine.ts     # 5-dimension predictive risk matrix evaluator
│   │   ├── clientSimulator.ts # Real-time telemetry tick simulator & alert triggers
│   │   └── clientKnowledgeRAG.ts # Grounded knowledge search with zero external AI
│   ├── services/
│   │   └── apiService.ts     # Local in-browser mock API adapter
│   ├── utils/
│   │   └── soundEngine.ts    # Web Audio synthesized alarms and sound cues
│   ├── types/
│   │   └── index.ts          # Comprehensive TypeScript domain types
│   ├── App.tsx               # Main application container & view manager
│   ├── main.tsx              # React DOM root entrypoint
│   └── index.css             # Tailwind CSS styles
├── server.ts                 # Clean Vite development and static server (Port 3000)
├── Dockerfile                # Production container build
└── package.json              # Clean dependencies (No backend, No DB, No external AI)
```

---

## 3. Quickstart & Installation

### Local Development
```bash
# 1. Install Node.js dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Open in browser:
http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

---

## 4. Key Functional Features (All 100% Client-Side)

1. **Live Drilling Simulation:**
   - Real-time bit advancement, ROP, WOB, RPM, torque, SPP, and pit levels.
   - At 2844.5m, entering the Barail Main Sand horizon triggers a simulated lost circulation event mirroring offset well **NHK-142**.
   - Engineers can deploy a **45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill** with instant remediation feedback.

2. **Geospatial GIS Map:**
   - Displays active well `NHK-Deep-504` surrounded by 16 historical offset wells.
   - Adjustable radius filtering (5 km to 50 km) and stratigraphic formation filters.

3. **Evidence-Grounded Knowledge Search:**
   - Instant search across historical incident logs and well completion reports.
   - Deterministic factual responses with citations and exact document page references.

4. **Multi-Role Operational Decks:**
   - Tailored views for **Drilling Engineers**, **Wellsite Geologists**, and **Asset Admins**.

---

## 5. Disclaimer

*All data included in this prototype has been realistically synthesized to reflect typical Upper Assam Basin geological and drilling conditions (Barail Main Sand, Girujan Clay, Tipam Sandstone). It is designed exclusively for demonstration and evaluation under Smart India Hackathon.*

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { WELLS_DATA, FORMATIONS_DATA, HistoricalEvent } from '../data/wellsData.js';
import { HISTORICAL_EVENTS_DATA } from '../data/eventsData.js';
import { TECHNICAL_DOCUMENTS_DATA, TechnicalDocument } from '../data/documentsData.js';
import { correlateNearbyWells } from '../services/correlationEngine.js';
import { evaluateDrillingRisks, DrillingTelemetryParams } from '../services/riskEngine.js';
import { executeRagQuery } from '../services/ragService.js';
import { ertmacSimulator } from '../services/simulatorService.js';

export const apiRouter = Router();

// Store dynamic uploaded documents in memory
const documentsStore: TechnicalDocument[] = [...TECHNICAL_DOCUMENTS_DATA];

// 1. AUTHENTICATION
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, role = 'DRILLING_ENGINEER' } = req.body;
  const user = {
    id: 'USR-001',
    username: username || 'Chief Drilling Engineer',
    organization: 'Oil India Limited (OIL)',
    role: role, // 'ADMIN' | 'DRILLING_ENGINEER' | 'GEOLOGIST' | 'VIEWER'
    asset: 'Upper Assam Basin — Nahorkatiya Asset',
    rigAssigned: 'OIL-RIG-E2000',
    token: 'jwt-simulated-token-ertmac-oil-2026',
  };
  return res.json({ success: true, user });
});

apiRouter.get('/auth/me', (_req: Request, res: Response) => {
  return res.json({
    user: {
      id: 'USR-001',
      username: 'P. Borah (Chief Drilling Engineer)',
      organization: 'Oil India Limited (OIL)',
      role: 'DRILLING_ENGINEER',
      asset: 'Upper Assam Basin — Nahorkatiya Asset',
      rigAssigned: 'OIL-RIG-E2000',
    },
  });
});

// 2. WELLS ENDPOINTS
apiRouter.get('/wells', (req: Request, res: Response) => {
  const { field, status } = req.query;
  let wells = [...WELLS_DATA];

  // Sync active well depth with current simulation state
  const simState = ertmacSimulator.getState();
  wells = wells.map((w) => {
    if (w.isSimulatedActive) {
      return {
        ...w,
        currentDepth: simState.currentDepth,
        currentFormation: simState.formation,
      };
    }
    return w;
  });

  if (field) {
    wells = wells.filter((w) => w.field.toLowerCase() === String(field).toLowerCase());
  }
  if (status) {
    wells = wells.filter((w) => w.status === status);
  }

  return res.json({
    count: wells.length,
    wells,
    formations: FORMATIONS_DATA,
  });
});

apiRouter.get('/wells/active', (_req: Request, res: Response) => {
  const simState = ertmacSimulator.getState();
  const activeWell = WELLS_DATA.find((w) => w.isSimulatedActive) || WELLS_DATA[0];
  return res.json({
    ...activeWell,
    currentDepth: simState.currentDepth,
    currentFormation: simState.formation,
    simState,
  });
});

apiRouter.get('/wells/nearby', (req: Request, res: Response) => {
  const simState = ertmacSimulator.getState();
  const activeWell = WELLS_DATA.find((w) => w.isSimulatedActive) || WELLS_DATA[0];

  const latitude = req.query.latitude ? parseFloat(String(req.query.latitude)) : activeWell.latitude;
  const longitude = req.query.longitude ? parseFloat(String(req.query.longitude)) : activeWell.longitude;
  const currentDepth = req.query.current_depth ? parseFloat(String(req.query.current_depth)) : simState.currentDepth;
  const radiusKm = req.query.radius_km ? parseFloat(String(req.query.radius_km)) : 25;
  const formation = req.query.formation ? String(req.query.formation) : undefined;

  const results = correlateNearbyWells({
    activeLatitude: latitude,
    activeLongitude: longitude,
    currentDepth,
    radiusKm,
    formationFilter: formation,
  });

  return res.json({
    activeWell: {
      id: activeWell.id,
      name: activeWell.wellName,
      latitude,
      longitude,
      currentDepth,
      formation: simState.formation,
    },
    radiusKm,
    totalNearbyCount: results.length,
    results,
  });
});

apiRouter.get('/wells/:id', (req: Request, res: Response) => {
  const well = WELLS_DATA.find((w) => w.id === req.params.id);
  if (!well) {
    return res.status(404).json({ error: 'Well not found' });
  }

  const events = HISTORICAL_EVENTS_DATA.filter((e) => e.wellId === well.id);
  const documents = documentsStore.filter((d) => d.wellId === well.id);

  return res.json({
    well,
    events,
    documents,
  });
});

// 3. HISTORICAL EVENTS ENDPOINTS
apiRouter.get('/events', (req: Request, res: Response) => {
  const { wellId, eventType, formation, severity, minDepth, maxDepth, search } = req.query;

  let filtered = [...HISTORICAL_EVENTS_DATA];

  if (wellId) {
    filtered = filtered.filter((e) => e.wellId === String(wellId));
  }
  if (eventType && eventType !== 'ALL') {
    filtered = filtered.filter((e) => e.eventType === String(eventType));
  }
  if (formation && formation !== 'ALL') {
    filtered = filtered.filter((e) =>
      e.formationName.toLowerCase().includes(String(formation).toLowerCase())
    );
  }
  if (severity && severity !== 'ALL') {
    filtered = filtered.filter((e) => e.severity === String(severity));
  }
  if (minDepth) {
    filtered = filtered.filter((e) => e.depth >= parseFloat(String(minDepth)));
  }
  if (maxDepth) {
    filtered = filtered.filter((e) => e.depth <= parseFloat(String(maxDepth)));
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.rootCause.toLowerCase().includes(q) ||
        e.mitigation.toLowerCase().includes(q) ||
        e.wellName.toLowerCase().includes(q)
    );
  }

  return res.json({
    count: filtered.length,
    events: filtered,
  });
});

apiRouter.get('/events/:id', (req: Request, res: Response) => {
  const event = HISTORICAL_EVENTS_DATA.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  return res.json(event);
});

// 4. DOCUMENT INTELLIGENCE CENTER
apiRouter.get('/documents', (_req: Request, res: Response) => {
  return res.json({
    count: documentsStore.length,
    documents: documentsStore.map((d) => ({
      id: d.id,
      filename: d.filename,
      title: d.title,
      documentType: d.documentType,
      wellName: d.wellName,
      uploadDate: d.uploadDate,
      fileSizeKb: d.fileSizeKb,
      pageCount: d.pageCount,
      processingStatus: d.processingStatus,
      chunkCount: d.chunks.length,
      extractedEntities: d.extractedEntities,
      summary: d.summary,
    })),
  });
});

apiRouter.get('/documents/:id', (req: Request, res: Response) => {
  const doc = documentsStore.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  return res.json(doc);
});

apiRouter.post('/documents/upload', (req: Request, res: Response) => {
  const { filename, title, documentType, wellName, textContent } = req.body;

  const newDocId = `DOC-UP-${Date.now()}`;
  const simulatedText =
    textContent ||
    `OIL INDIA LIMITED - DAILY DRILLING REPORT\nWELL: ${wellName || 'NHK-Offset'}\nDEPTH: 2840m - 2890m\nFormation: Barail Main Sand\nOperational Log: Penetrated fractured sandstone. Observed 18 bbl/hr seepage loss. Conditioned mud with 15 ppb calcium carbonate. Returns restored.`;

  const newDoc: TechnicalDocument = {
    id: newDocId,
    filename: filename || `Uploaded_Report_${Date.now()}.pdf`,
    title: title || 'Field Operational Record',
    documentType: documentType || 'DDR',
    wellName: wellName || 'NHK-Offset',
    uploadDate: new Date().toISOString(),
    fileSizeKb: 1820,
    processingStatus: 'COMPLETED',
    pageCount: 14,
    extractedEntities: {
      formations: ['Barail Main Sand (BMS)'],
      depths: [2845],
      mudWeights: [10.2],
      incidents: ['MUD_LOSS at 2845m'],
      mitigations: ['Calcium carbonate pill treatment'],
      drillingParameters: { lossRate: '18 bbl/hr' },
    },
    summary: 'Parsed drilling report detailing Barail section operations and lost circulation mitigation.',
    fullText: simulatedText,
    chunks: [
      {
        id: `CHK-${newDocId}-1`,
        documentId: newDocId,
        chunkIndex: 0,
        section: 'Operational Incident & Mitigation',
        pageNumber: 1,
        keywords: ['Barail', 'Mud Loss', 'Mitigation', 'CaCO3'],
        text: simulatedText.substring(0, 500),
      },
    ],
  };

  documentsStore.unshift(newDoc);
  return res.json({ success: true, document: newDoc });
});

apiRouter.post('/documents/:id/process', (req: Request, res: Response) => {
  const doc = documentsStore.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  doc.processingStatus = 'COMPLETED';
  return res.json({ success: true, message: 'Document extraction and vector chunking completed', doc });
});

// 5. KNOWLEDGE SEARCH & RAG
apiRouter.post('/knowledge/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const ragResult = await executeRagQuery(query);
    return res.json(ragResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'RAG search failed', message });
  }
});

// 6. RISK INTELLIGENCE
apiRouter.get('/risk/current/:well_id', (_req: Request, res: Response) => {
  const simState = ertmacSimulator.getState();
  const telemetry: DrillingTelemetryParams = {
    depth: simState.currentDepth,
    rop: simState.rop,
    wob: simState.wob,
    rpm: simState.rpm,
    torque: simState.torque,
    spp: simState.spp,
    flowIn: simState.flowIn,
    flowOut: simState.flowOut,
    mudWeight: simState.mudWeight,
    pitVolumeChangeBbl: simState.pitVolumeChangeBbl,
    gasUnits: simState.gasUnits,
  };

  const riskAssessment = evaluateDrillingRisks(telemetry);
  return res.json({
    wellId: simState.wellId,
    wellName: 'NHK-Deep-504 (Active)',
    ...riskAssessment,
    telemetry,
  });
});

apiRouter.get('/risk/history/:well_id', (_req: Request, res: Response) => {
  // Generate risk vs depth cross-plot profile across Barail interval
  const depthProfile: {
    depth: number;
    mudLossRisk: number;
    stuckPipeRisk: number;
    torqueRisk: number;
    kickRisk: number;
    formation: string;
    hasHistoricalIncident: boolean;
  }[] = [];

  for (let d = 2650; d <= 3150; d += 25) {
    const hasHistoricalLoss = HISTORICAL_EVENTS_DATA.some(
      (e) => Math.abs(e.depth - d) <= 12 && e.eventType === 'MUD_LOSS'
    );
    const hasHistoricalStuck = HISTORICAL_EVENTS_DATA.some(
      (e) => Math.abs(e.depth - d) <= 12 && e.eventType === 'STUCK_PIPE'
    );

    // Hazard spike around 2840-2865m
    const lossScore = Math.round(
      Math.min(95, Math.max(15, 20 + 75 * Math.exp(-Math.pow(d - 2846, 2) / 450)))
    );
    const stuckScore = Math.round(
      Math.min(90, Math.max(12, 18 + 70 * Math.exp(-Math.pow(d - 2860, 2) / 500)))
    );
    const torqueScore = Math.round(
      Math.min(85, Math.max(15, 22 + 60 * Math.exp(-Math.pow(d - 2850, 2) / 600)))
    );
    const kickScore = d > 3100 ? 65 : 15;

    depthProfile.push({
      depth: d,
      mudLossRisk: lossScore,
      stuckPipeRisk: stuckScore,
      torqueRisk: torqueScore,
      kickRisk: kickScore,
      formation: 'Barail Main Sand (BMS)',
      hasHistoricalIncident: hasHistoricalLoss || hasHistoricalStuck,
    });
  }

  return res.json({
    wellId: 'OIL-ACTIVE-01',
    interval: 'Barail Main Sand (2650m - 3150m)',
    depthProfile,
  });
});

// 7. REAL-TIME SIMULATION CONTROLS
apiRouter.get('/simulation/status', (_req: Request, res: Response) => {
  return res.json(ertmacSimulator.getState());
});

apiRouter.post('/simulation/start', (req: Request, res: Response) => {
  const { demoMode = false, speed = 1.0 } = req.body;
  ertmacSimulator.startSimulation(demoMode, speed);
  return res.json({ success: true, state: ertmacSimulator.getState() });
});

apiRouter.post('/simulation/stop', (_req: Request, res: Response) => {
  ertmacSimulator.stopSimulation();
  return res.json({ success: true, state: ertmacSimulator.getState() });
});

apiRouter.post('/simulation/fast-forward', (_req: Request, res: Response) => {
  ertmacSimulator.fastForwardToIncident();
  return res.json({ success: true, state: ertmacSimulator.getState() });
});

apiRouter.post('/simulation/step', (req: Request, res: Response) => {
  const { deltaM = 1.0 } = req.body;
  ertmacSimulator.stepDepth(deltaM);
  return res.json({ success: true, state: ertmacSimulator.getState() });
});

apiRouter.post('/simulation/reset', (req: Request, res: Response) => {
  const { startDepth = 2835.0 } = req.body;
  ertmacSimulator.resetSimulation(startDepth);
  return res.json({ success: true, state: ertmacSimulator.getState() });
});

apiRouter.post('/simulation/mitigate', (req: Request, res: Response) => {
  const { pillType = '45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill' } = req.body;
  ertmacSimulator.pumpMitigationPill(pillType);
  return res.json({ success: true, message: 'Mitigation applied', state: ertmacSimulator.getState() });
});

// 8. ALERTS
apiRouter.get('/alerts', (_req: Request, res: Response) => {
  const state = ertmacSimulator.getState();
  return res.json({
    count: state.activeAlerts.length,
    alerts: state.activeAlerts,
  });
});

apiRouter.patch('/alerts/:id', (req: Request, res: Response) => {
  ertmacSimulator.acknowledgeAlert(req.params.id);
  return res.json({ success: true, message: 'Alert acknowledged' });
});

// 9. ANALYTICS SUMMARY
apiRouter.get('/analytics/summary', (_req: Request, res: Response) => {
  const allEvents = HISTORICAL_EVENTS_DATA;

  // Breakdown by event type
  const eventTypeBreakdown: Record<string, number> = {};
  let totalNptHours = 0;
  let totalCostImpactInrLakhs = 0;

  for (const e of allEvents) {
    eventTypeBreakdown[e.eventType] = (eventTypeBreakdown[e.eventType] || 0) + 1;
    totalNptHours += e.nptHours;
    totalCostImpactInrLakhs += e.costImpactInrLakhs;
  }

  // Formation hazard distribution
  const formationHazardCounts: Record<string, number> = {};
  for (const e of allEvents) {
    formationHazardCounts[e.formationName] = (formationHazardCounts[e.formationName] || 0) + 1;
  }

  return res.json({
    totalOffsetWellsMonitored: WELLS_DATA.length - 1,
    activeWellsDrilling: 1,
    totalHistoricalEventsLogged: allEvents.length,
    totalHistoricalNptHours: Math.round(totalNptHours),
    totalCostImpactInrLakhs: Math.round(totalCostImpactInrLakhs),
    eventTypeBreakdown,
    formationHazardCounts,
    fieldDistribution: {
      Nahorkatiya: 6,
      Kusijan: 1,
      Moran: 1,
      Jorajan: 1,
      Digboi: 1,
      Baghjan: 1,
      Shalmari: 1,
      Other: 4,
    },
    topMitigations: [
      { name: 'Engineered CaCO3 + Mica LCM Squeeze Pill', successRate: '92%', frequency: 18 },
      { name: 'Safe-Solv Low Toxicity Soaking Pill & Jar Down', successRate: '88%', frequency: 12 },
      { name: 'Controlled Overbalance (< 400 psi) & Flow Checks', successRate: '95%', frequency: 24 },
      { name: 'KCl Polymer / Polyglycol Shale Stabilization', successRate: '90%', frequency: 15 },
    ],
  });
});

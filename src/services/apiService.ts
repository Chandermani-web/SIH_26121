/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Well,
  HistoricalEvent,
  WellCorrelationResult,
  SimulationState,
  TechnicalDocument,
  RagResponse,
} from '../types/index.js';

import { WELLS_DATA, FORMATIONS_DATA } from '../mock/wellsData.js';
import { HISTORICAL_EVENTS_DATA } from '../mock/eventsData.js';
import { TECHNICAL_DOCUMENTS_DATA } from '../mock/documentsData.js';
import { correlateNearbyWells, getFormationForDepth } from '../mock/correlationEngine.js';
import { clientSimulator } from '../mock/clientSimulator.js';
import { executeClientRagQuery } from '../mock/clientKnowledgeRAG.js';

// In-memory storage for client uploaded documents
const dynamicDocuments: TechnicalDocument[] = [...TECHNICAL_DOCUMENTS_DATA];

export const api = {
  /**
   * List monitored wells
   */
  async getWells(params?: { field?: string; status?: string }): Promise<{ count: number; wells: Well[] }> {
    let wells = [...WELLS_DATA];
    if (params?.field) {
      wells = wells.filter((w) => w.field.toLowerCase().includes(params.field!.toLowerCase()));
    }
    if (params?.status) {
      wells = wells.filter((w) => w.status === params.status);
    }
    return { count: wells.length, wells };
  },

  /**
   * Get single well details with its historical events and documents
   */
  async getWellDetails(wellId: string): Promise<{ well: Well; events: HistoricalEvent[]; documents: TechnicalDocument[] }> {
    const well = WELLS_DATA.find((w) => w.id === wellId) || WELLS_DATA[0];
    const events = HISTORICAL_EVENTS_DATA.filter((e) => e.wellId === well.id);
    const documents = dynamicDocuments.filter((d) => d.wellId === well.id);
    return { well, events, documents };
  },

  /**
   * Correlate nearby offset wells based on geographic position and depth
   */
  async getNearbyWells(params?: {
    latitude?: number;
    longitude?: number;
    current_depth?: number;
    radius_km?: number;
    formation?: string;
  }): Promise<{
    activeWell: { id: string; name: string; latitude: number; longitude: number; currentDepth: number; formation: string };
    radiusKm: number;
    totalNearbyCount: number;
    results: WellCorrelationResult[];
  }> {
    const lat = params?.latitude ?? 27.2942;
    const lon = params?.longitude ?? 95.3418;
    const depth = params?.current_depth ?? clientSimulator.getState().currentDepth;
    const radius = params?.radius_km ?? 25;

    const results = correlateNearbyWells({
      activeLatitude: lat,
      activeLongitude: lon,
      currentDepth: depth,
      radiusKm: radius,
    });

    return {
      activeWell: {
        id: 'OIL-ACTIVE-01',
        name: 'NHK-Deep-504 (Active)',
        latitude: lat,
        longitude: lon,
        currentDepth: depth,
        formation: getFormationForDepth(depth),
      },
      radiusKm: radius,
      totalNearbyCount: results.length,
      results,
    };
  },

  /**
   * List and filter historical drilling events
   */
  async getEvents(params?: {
    wellId?: string;
    eventType?: string;
    formation?: string;
    severity?: string;
    minDepth?: number;
    maxDepth?: number;
    search?: string;
  }): Promise<{ count: number; events: HistoricalEvent[] }> {
    let events = [...HISTORICAL_EVENTS_DATA];

    if (params?.wellId) {
      events = events.filter((e) => e.wellId === params.wellId);
    }
    if (params?.eventType) {
      events = events.filter((e) => e.eventType === params.eventType);
    }
    if (params?.formation) {
      events = events.filter((e) => e.formationName.toLowerCase().includes(params.formation!.toLowerCase()));
    }
    if (params?.severity) {
      events = events.filter((e) => e.severity === params.severity);
    }
    if (params?.minDepth) {
      events = events.filter((e) => e.depth >= params.minDepth!);
    }
    if (params?.maxDepth) {
      events = events.filter((e) => e.depth <= params.maxDepth!);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.rootCause.toLowerCase().includes(q) ||
          e.mitigation.toLowerCase().includes(q) ||
          e.wellName.toLowerCase().includes(q)
      );
    }

    return { count: events.length, events };
  },

  /**
   * Get all ingested technical documents
   */
  async getDocuments(): Promise<{ count: number; documents: TechnicalDocument[] }> {
    return { count: dynamicDocuments.length, documents: dynamicDocuments };
  },

  /**
   * Get technical document details
   */
  async getDocumentDetails(docId: string): Promise<TechnicalDocument> {
    const doc = dynamicDocuments.find((d) => d.id === docId);
    if (!doc) {
      return dynamicDocuments[0];
    }
    return doc;
  },

  /**
   * Ingest and parse technical document in browser memory
   */
  async uploadDocument(data: {
    filename: string;
    title: string;
    documentType: string;
    wellName: string;
    textContent?: string;
  }): Promise<{ success: boolean; document: TechnicalDocument }> {
    const newDoc: TechnicalDocument = {
      id: `DOC-UPLOAD-${Date.now()}`,
      filename: data.filename || 'uploaded_report.pdf',
      title: data.title || data.filename,
      documentType: (data.documentType as any) || 'DDR',
      wellName: data.wellName,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSizeKb: 1420,
      processingStatus: 'COMPLETED',
      pageCount: 1,
      chunkCount: 1,
      summary: `Parsed and indexed report for well ${data.wellName}. Ingested into eRTMAC browser knowledge engine.`,
      extractedEntities: {
        formations: ['Barail Main Sand (BMS)'],
        depths: [2845],
        mudWeights: [10.2],
        incidents: ['MUD_LOSS'],
        mitigations: ['Engineered CaCO3 + Mica LCM Pill'],
        drillingParameters: { flowRate: '560 gpm', spp: '2720 psi' },
      },
      chunks: [
        {
          id: `CHUNK-UP-${Date.now()}`,
          documentId: `DOC-UPLOAD-${Date.now()}`,
          chunkIndex: 0,
          pageNumber: 1,
          section: 'Operations & Summary',
          text: data.textContent || `Technical drilling operations log for ${data.wellName}.`,
          keywords: ['upload', data.wellName.toLowerCase(), 'drilling'],
        },
      ],
    };

    dynamicDocuments.unshift(newDoc);
    return { success: true, document: newDoc };
  },

  /**
   * Evidence-grounded historical knowledge search (100% hardcoded, deterministic)
   */
  async searchKnowledge(query: string): Promise<RagResponse> {
    return executeClientRagQuery(query);
  },

  /**
   * Get depth-risk profile history for a well
   */
  async getRiskHistory(wellId: string): Promise<{
    wellId: string;
    interval: string;
    depthProfile: {
      depth: number;
      mudLossRisk: number;
      stuckPipeRisk: number;
      torqueRisk: number;
      kickRisk: number;
      formation: string;
      hasHistoricalIncident: boolean;
    }[];
  }> {
    const depths = [2700, 2750, 2800, 2820, 2840, 2845, 2860, 2900, 2950, 3000, 3100, 3200, 3300];
    const depthProfile = depths.map((d) => {
      const isCriticalZone = d >= 2840 && d <= 2860;
      return {
        depth: d,
        mudLossRisk: isCriticalZone ? 88 : d > 2800 ? 55 : 20,
        stuckPipeRisk: isCriticalZone ? 72 : 35,
        torqueRisk: d >= 2700 && d <= 2800 ? 65 : 25,
        kickRisk: d >= 3200 ? 78 : 15,
        formation: getFormationForDepth(d),
        hasHistoricalIncident: isCriticalZone || d >= 3200,
      };
    });

    return {
      wellId,
      interval: '2700m - 3300m',
      depthProfile,
    };
  },

  /**
   * Get current simulator state
   */
  async getSimulationStatus(): Promise<SimulationState> {
    return clientSimulator.getState();
  },

  /**
   * Start live simulation in demo or continuous mode
   */
  async startSimulation(demoMode = false, speed = 1.0): Promise<{ success: boolean; state: SimulationState }> {
    clientSimulator.startSimulation(demoMode, speed);
    return { success: true, state: clientSimulator.getState() };
  },

  /**
   * Stop simulation
   */
  async stopSimulation(): Promise<{ success: boolean; state: SimulationState }> {
    clientSimulator.stopSimulation();
    return { success: true, state: clientSimulator.getState() };
  },

  /**
   * Fast-forward simulation directly into the 2844.6m mud loss zone
   */
  async fastForwardSimulation(): Promise<{ success: boolean; state: SimulationState }> {
    clientSimulator.fastForwardToIncident();
    return { success: true, state: clientSimulator.getState() };
  },

  /**
   * Step depth
   */
  async stepSimulation(deltaM = 1.0): Promise<{ success: boolean; state: SimulationState }> {
    clientSimulator.stepDepth(deltaM);
    return { success: true, state: clientSimulator.getState() };
  },

  /**
   * Reset simulation to starting depth
   */
  async resetSimulation(startDepth = 2835.0): Promise<{ success: boolean; state: SimulationState }> {
    clientSimulator.resetSimulation(startDepth);
    return { success: true, state: clientSimulator.getState() };
  },

  /**
   * Deploy mitigation pill (e.g. 45 bbl Engineered CaCO3 + Mica Squeeze Pill)
   */
  async pumpMitigation(pillType: string): Promise<{ success: boolean; state: SimulationState }> {
    clientSimulator.pumpMitigationPill(pillType);
    return { success: true, state: clientSimulator.getState() };
  },

  /**
   * Acknowledge proactive alert
   */
  async acknowledgeAlert(alertId: string): Promise<{ success: boolean }> {
    clientSimulator.acknowledgeAlert(alertId);
    return { success: true };
  },

  /**
   * Get asset-wide analytics summary
   */
  async getAnalyticsSummary(): Promise<{
    totalOffsetWellsMonitored: number;
    activeWellsDrilling: number;
    totalHistoricalEventsLogged: number;
    totalHistoricalNptHours: number;
    totalCostImpactInrLakhs: number;
    eventTypeBreakdown: Record<string, number>;
    formationHazardCounts: Record<string, number>;
    topMitigations: { name: string; successRate: string; frequency: number }[];
  }> {
    const totalEvents = HISTORICAL_EVENTS_DATA.length;
    const totalNpt = HISTORICAL_EVENTS_DATA.reduce((sum, e) => sum + e.nptHours, 0);
    const totalCost = HISTORICAL_EVENTS_DATA.reduce((sum, e) => sum + e.costImpactInrLakhs, 0);

    const eventTypeBreakdown: Record<string, number> = {};
    const formationHazardCounts: Record<string, number> = {};

    for (const e of HISTORICAL_EVENTS_DATA) {
      eventTypeBreakdown[e.eventType] = (eventTypeBreakdown[e.eventType] || 0) + 1;
      formationHazardCounts[e.formationName] = (formationHazardCounts[e.formationName] || 0) + 1;
    }

    return {
      totalOffsetWellsMonitored: WELLS_DATA.length - 1,
      activeWellsDrilling: 1,
      totalHistoricalEventsLogged: totalEvents,
      totalHistoricalNptHours: Math.round(totalNpt * 10) / 10,
      totalCostImpactInrLakhs: Math.round(totalCost * 10) / 10,
      eventTypeBreakdown,
      formationHazardCounts,
      topMitigations: [
        { name: 'Engineered CaCO3 + Mica LCM Squeeze Pill', successRate: '94%', frequency: 18 },
        { name: 'Safe-Solv Organic Surfactant Soaking Fluid', successRate: '88%', frequency: 12 },
        { name: 'Bentonite-Diesel-Oil (DOB) Gunk Plug', successRate: '91%', frequency: 7 },
        { name: 'Dynamic Mud Weight Optimization (<10.0 ppg)', successRate: '96%', frequency: 24 },
      ],
    };
  },
};

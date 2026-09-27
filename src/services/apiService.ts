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
  ActiveAlert,
} from '../types/index.js';

export const api = {
  async getWells(params?: { field?: string; status?: string }): Promise<{ count: number; wells: Well[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/wells${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch wells');
    return res.json();
  },

  async getWellDetails(wellId: string): Promise<{ well: Well; events: HistoricalEvent[]; documents: TechnicalDocument[] }> {
    const res = await fetch(`/api/wells/${wellId}`);
    if (!res.ok) throw new Error('Failed to fetch well details');
    return res.json();
  },

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
    const q = new URLSearchParams();
    if (params?.latitude) q.set('latitude', String(params.latitude));
    if (params?.longitude) q.set('longitude', String(params.longitude));
    if (params?.current_depth) q.set('current_depth', String(params.current_depth));
    if (params?.radius_km) q.set('radius_km', String(params.radius_km));
    if (params?.formation) q.set('formation', params.formation);

    const res = await fetch(`/api/wells/nearby?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch nearby wells');
    return res.json();
  },

  async getEvents(params?: {
    wellId?: string;
    eventType?: string;
    formation?: string;
    severity?: string;
    minDepth?: number;
    maxDepth?: number;
    search?: string;
  }): Promise<{ count: number; events: HistoricalEvent[] }> {
    const q = new URLSearchParams();
    if (params?.wellId) q.set('wellId', params.wellId);
    if (params?.eventType) q.set('eventType', params.eventType);
    if (params?.formation) q.set('formation', params.formation);
    if (params?.severity) q.set('severity', params.severity);
    if (params?.minDepth) q.set('minDepth', String(params.minDepth));
    if (params?.maxDepth) q.set('maxDepth', String(params.maxDepth));
    if (params?.search) q.set('search', params.search);

    const res = await fetch(`/api/events?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getDocuments(): Promise<{ count: number; documents: TechnicalDocument[] }> {
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async getDocumentDetails(docId: string): Promise<TechnicalDocument> {
    const res = await fetch(`/api/documents/${docId}`);
    if (!res.ok) throw new Error('Failed to fetch document details');
    return res.json();
  },

  async uploadDocument(data: {
    filename: string;
    title: string;
    documentType: string;
    wellName: string;
    textContent?: string;
  }): Promise<{ success: boolean; document: TechnicalDocument }> {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async searchKnowledge(query: string): Promise<RagResponse> {
    const res = await fetch('/api/knowledge/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to search knowledge');
    return res.json();
  },

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
    const res = await fetch(`/api/risk/history/${wellId}`);
    if (!res.ok) throw new Error('Failed to fetch risk history');
    return res.json();
  },

  async getSimulationStatus(): Promise<SimulationState> {
    const res = await fetch('/api/simulation/status');
    if (!res.ok) throw new Error('Failed to fetch simulation status');
    return res.json();
  },

  async startSimulation(demoMode = false, speed = 1.0): Promise<{ success: boolean; state: SimulationState }> {
    const res = await fetch('/api/simulation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoMode, speed }),
    });
    if (!res.ok) throw new Error('Failed to start simulation');
    return res.json();
  },

  async stopSimulation(): Promise<{ success: boolean; state: SimulationState }> {
    const res = await fetch('/api/simulation/stop', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to stop simulation');
    return res.json();
  },

  async fastForwardSimulation(): Promise<{ success: boolean; state: SimulationState }> {
    const res = await fetch('/api/simulation/fast-forward', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to fast forward simulation');
    return res.json();
  },

  async stepSimulation(deltaM = 1.0): Promise<{ success: boolean; state: SimulationState }> {
    const res = await fetch('/api/simulation/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deltaM }),
    });
    if (!res.ok) throw new Error('Failed to step simulation');
    return res.json();
  },

  async resetSimulation(startDepth = 2835.0): Promise<{ success: boolean; state: SimulationState }> {
    const res = await fetch('/api/simulation/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDepth }),
    });
    if (!res.ok) throw new Error('Failed to reset simulation');
    return res.json();
  },

  async pumpMitigation(pillType: string): Promise<{ success: boolean; state: SimulationState }> {
    const res = await fetch('/api/simulation/mitigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillType }),
    });
    if (!res.ok) throw new Error('Failed to apply mitigation');
    return res.json();
  },

  async acknowledgeAlert(alertId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/alerts/${alertId}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

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
    const res = await fetch('/api/analytics/summary');
    if (!res.ok) throw new Error('Failed to fetch analytics summary');
    return res.json();
  },
};

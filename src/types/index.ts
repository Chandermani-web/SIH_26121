/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'DRILLING_ENGINEER' | 'GEOLOGIST' | 'ADMIN' | 'VIEWER';

export type EventSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EventType =
  | 'MUD_LOSS'
  | 'STUCK_PIPE'
  | 'KICK'
  | 'OVERPRESSURE'
  | 'TORQUE_SPIKE'
  | 'CEMENTING_ISSUE'
  | 'NPT'
  | 'FISHING';

export interface WellTrajectoryPoint {
  md: number;
  tvd: number;
  inclination: number;
  azimuth: number;
  northing: number;
  easting: number;
}

export interface Well {
  id: string;
  wellName: string;
  field: string;
  block: string;
  operator: string;
  latitude: number;
  longitude: number;
  elevationMsl: number;
  spudDate: string;
  completionDate?: string;
  totalDepth: number;
  status: 'ACTIVE_DRILLING' | 'COMPLETED_PRODUCER' | 'ABANDONED' | 'SUSPENDED';
  targetFormation: string;
  currentDepth?: number;
  currentFormation?: string;
  trajectory: WellTrajectoryPoint[];
  casingProgram: {
    sizeInch: number;
    depthM: number;
    casingType: string;
  }[];
  isSimulatedActive?: boolean;
}

export interface HistoricalEvent {
  id: string;
  wellId: string;
  wellName: string;
  eventType: EventType;
  depth: number;
  formationId: string;
  formationName: string;
  severity: EventSeverity;
  timestamp: string;
  nptHours: number;
  costImpactInrLakhs: number;
  description: string;
  rootCause: string;
  mitigation: string;
  sourceDocumentId: string;
  sourceDocumentName: string;
  sourcePageNumber: number;
  mudWeightUsed: number;
  ecd: number;
  drillingParametersAtIncident: {
    wob: number;
    rpm: number;
    torque: number;
    flowRate: number;
    spp: number;
  };
}

export interface WellCorrelationResult {
  well: Well;
  distanceKm: number;
  depthProximityM: number;
  formationMatch: boolean;
  activeFormation: string;
  wellFormation: string;
  historicalEventsCount: number;
  criticalEventsCount: number;
  relevanceScore: number;
  relevanceFactors: {
    factor: string;
    weight: number;
    contributionScore: number;
    description: string;
  }[];
  nearbyEvents: HistoricalEvent[];
  recommendedMitigations: string[];
}

export interface ActiveAlert {
  id: string;
  wellId: string;
  wellName: string;
  alertType: string;
  severity: EventSeverity;
  depth: number;
  timestamp: string;
  title: string;
  message: string;
  evidence: {
    historicalWells: string[];
    historicalDepths: number[];
    formation: string;
    distanceKm: number;
    sourceDoc: string;
    page: number;
  };
  recommendedMitigation: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface RiskPredictionFactor {
  name: string;
  impactWeight: number;
  status: 'ALERT' | 'WARNING' | 'NOMINAL';
  observation: string;
}

export interface RiskEvidenceItem {
  wellId: string;
  wellName: string;
  distanceKm: number;
  historicalDepth: number;
  depthDeltaM: number;
  eventType: string;
  severity: EventSeverity;
  eventDescription: string;
  historicalMitigation: string;
  sourceDoc: string;
  pageNumber: number;
}

export interface RiskPrediction {
  riskType: 'MUD_LOSS' | 'STUCK_PIPE' | 'KICK' | 'TORQUE_SPIKE' | 'CEMENTING_ISSUE';
  title: string;
  score: number;
  severity: EventSeverity;
  confidence: number;
  summary: string;
  factors: RiskPredictionFactor[];
  evidence: RiskEvidenceItem[];
  recommendedMitigations: string[];
  historicalLesson: string;
}

export interface SimulationState {
  wellId: string;
  isRunning: boolean;
  isDemoMode: boolean;
  simulationSpeed: number;
  currentDepth: number;
  tvd: number;
  rop: number;
  wob: number;
  rpm: number;
  torque: number;
  spp: number;
  flowIn: number;
  flowOut: number;
  mudWeight: number;
  pitVolumeBbl: number;
  pitVolumeChangeBbl: number;
  gasUnits: number;
  formation: string;
  activeAlerts: ActiveAlert[];
  latestRisks: RiskPrediction[];
  overallRiskLevel: EventSeverity;
  topCorrelations: WellCorrelationResult[];
  mitigationPillPumped: boolean;
  stepIndex: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  section: string;
  pageNumber: number;
  keywords: string[];
}

export interface TechnicalDocument {
  id: string;
  filename: string;
  title: string;
  documentType: 'WCR' | 'DDR' | 'EOWR' | 'MUD_LOG' | 'GEOMECHANICAL_STUDY' | 'CASING_CEMENTING';
  wellId?: string;
  wellName?: string;
  uploadDate: string;
  fileSizeKb: number;
  processingStatus: 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED';
  pageCount: number;
  chunkCount?: number;
  extractedEntities: {
    formations: string[];
    depths: number[];
    mudWeights: number[];
    incidents: string[];
    mitigations: string[];
    drillingParameters: Record<string, string | number>;
  };
  summary: string;
  fullText?: string;
  chunks?: DocumentChunk[];
}

export interface RagResponse {
  query: string;
  answerMarkdown: string;
  retrievedHistoricalFacts: {
    wellName: string;
    depth: number;
    formation: string;
    eventType: string;
    severity: string;
    nptHours: number;
    mitigation: string;
    source: string;
  }[];
  citations: {
    sourceDocId: string;
    sourceDocTitle: string;
    wellName: string;
    pageNumber: number;
    section: string;
    quoteSnippet: string;
  }[];
  llmProviderUsed: string;
  confidenceScore: number;
  isDeterministicFallback: boolean;
}

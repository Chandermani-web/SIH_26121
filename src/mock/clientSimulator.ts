/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DrillingTelemetryParams, evaluateDrillingRisks, RiskPrediction } from './riskEngine.js';
import { correlateNearbyWells, WellCorrelationResult } from './correlationEngine.js';
import { EventSeverity } from './wellsData.js';

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

type TelemetryListener = (state: SimulationState) => void;

class ClientErtmacSimulator {
  private state: SimulationState;
  private timer: any = null;
  private listeners: Set<TelemetryListener> = new Set();
  private alertCounter = 1;

  constructor() {
    this.state = {
      wellId: 'OIL-ACTIVE-01',
      isRunning: false,
      isDemoMode: false,
      simulationSpeed: 1.0,
      currentDepth: 2835.0,
      tvd: 2810.8,
      rop: 14.5,
      wob: 20.0,
      rpm: 115,
      torque: 14.8,
      spp: 2720,
      flowIn: 560,
      flowOut: 560,
      mudWeight: 10.3,
      pitVolumeBbl: 850.0,
      pitVolumeChangeBbl: 0,
      gasUnits: 135,
      formation: 'Barail Main Sand (BMS)',
      activeAlerts: [],
      latestRisks: [],
      overallRiskLevel: 'MEDIUM',
      topCorrelations: [],
      mitigationPillPumped: false,
      stepIndex: 0,
    };

    this.recomputeIntelligence();
  }

  public getState(): SimulationState {
    return { ...this.state };
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    // Send immediate snapshot to subscriber
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    }
  }

  public startSimulation(demoMode = false, speed = 1.0) {
    this.state.isRunning = true;
    this.state.isDemoMode = demoMode;
    this.state.simulationSpeed = speed;

    if (demoMode) {
      // In demo mode, start at 2842.0m so it approaches the 2844.5m mud loss horizon in ~6-8 seconds
      this.state.currentDepth = 2842.0;
      this.state.tvd = 2842.0 * 0.991;
      this.state.flowIn = 560;
      this.state.flowOut = 560;
      this.state.torque = 14.8;
      this.state.rop = 14.5;
      this.state.mudWeight = 10.3;
      this.state.pitVolumeBbl = 850.0;
      this.state.pitVolumeChangeBbl = 0;
      this.state.mitigationPillPumped = false;
      this.state.activeAlerts = this.state.activeAlerts.filter((a) => a.alertType !== 'MUD_LOSS');
    }

    if (this.timer) clearInterval(this.timer);

    const tickInterval = Math.max(200, Math.floor(1000 / speed));
    this.timer = setInterval(() => {
      this.tick();
    }, tickInterval);

    this.recomputeIntelligence();
    this.notify();
  }

  public fastForwardToIncident() {
    this.state.currentDepth = 2844.6;
    this.state.tvd = 2844.6 * 0.991;
    this.state.mitigationPillPumped = false;
    this.simulatePhysics();
    this.recomputeIntelligence();
    this.notify();
  }

  public stopSimulation() {
    this.state.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  public resetSimulation(startDepth = 2835.0) {
    this.stopSimulation();
    this.state.currentDepth = startDepth;
    this.state.tvd = startDepth * 0.991;
    this.state.torque = 14.8;
    this.state.flowIn = 560;
    this.state.flowOut = 560;
    this.state.pitVolumeBbl = 850.0;
    this.state.pitVolumeChangeBbl = 0;
    this.state.activeAlerts = [];
    this.state.mitigationPillPumped = false;
    this.state.stepIndex = 0;
    this.recomputeIntelligence();
    this.notify();
  }

  public stepDepth(deltaM = 1.0) {
    this.state.currentDepth += deltaM;
    this.state.tvd = this.state.currentDepth * 0.991;
    this.simulatePhysics();
    this.recomputeIntelligence();
    this.notify();
  }

  public pumpMitigationPill(pillType: string) {
    this.state.mitigationPillPumped = true;
    this.state.mudWeight = 9.85; // reduced mud weight to prevent overbalance
    this.state.flowOut = this.state.flowIn; // full returns restored
    this.state.pitVolumeChangeBbl = 0;
    this.state.torque = 14.2;

    for (const a of this.state.activeAlerts) {
      if (a.alertType === 'MUD_LOSS') {
        a.status = 'RESOLVED';
      }
    }

    this.recomputeIntelligence();
    this.notify();
  }

  public acknowledgeAlert(alertId: string) {
    for (const a of this.state.activeAlerts) {
      if (a.id === alertId) {
        a.status = 'ACKNOWLEDGED';
      }
    }
    this.notify();
  }

  private tick() {
    this.state.stepIndex += 1;
    const advanceRate = this.state.isDemoMode ? 0.35 : 0.2;
    this.state.currentDepth = Math.round((this.state.currentDepth + advanceRate) * 10) / 10;
    this.state.tvd = Math.round(this.state.currentDepth * 0.991 * 10) / 10;

    this.simulatePhysics();
    this.recomputeIntelligence();
    this.notify();
  }

  private simulatePhysics() {
    const depth = this.state.currentDepth;

    // Normal subtle fluctuations
    const jitter = (Math.random() - 0.5) * 0.8;
    this.state.rop = Math.max(4.0, Math.min(32.0, 14.5 + jitter * 2));
    this.state.wob = Math.max(16.0, Math.min(26.0, 20.0 + jitter));
    this.state.rpm = Math.round(115 + jitter * 3);
    this.state.spp = Math.round(2720 + jitter * 40);

    // Scenario 1: Approaching 2840m - 2843m (Pre-loss warning zone)
    if (depth >= 2840.0 && depth < 2844.5 && !this.state.mitigationPillPumped) {
      this.state.torque = 19.5 + Math.random() * 4.0;
      this.state.rop = 22.0 + Math.random() * 5.0;
      this.state.flowOut = this.state.flowIn - 15; // 15 gpm seepage
      this.state.pitVolumeChangeBbl -= 1.2;
    }
    // Scenario 2: Critical 2844.5m - 2852m (Mirrors NHK-142 total loss)
    else if (depth >= 2844.5 && depth < 2852.0 && !this.state.mitigationPillPumped) {
      this.state.torque = 24.5 + Math.random() * 4.5;
      this.state.rop = 28.5 + Math.random() * 4.0;
      this.state.flowOut = 440; // 120 gpm loss deficit
      this.state.pitVolumeChangeBbl -= 4.5;
      this.state.pitVolumeBbl = Math.max(720, this.state.pitVolumeBbl - 2.5);

      // Trigger Proactive Alert
      const existing = this.state.activeAlerts.find((a) => a.alertType === 'MUD_LOSS');
      if (!existing) {
        const newAlert: ActiveAlert = {
          id: `ALT-MUDLOSS-${Date.now()}-${this.alertCounter++}`,
          wellId: 'OIL-ACTIVE-01',
          wellName: 'NHK-Deep-504 (Active)',
          alertType: 'MUD_LOSS',
          severity: 'CRITICAL',
          depth: Math.round(depth * 10) / 10,
          timestamp: new Date().toISOString(),
          title: 'CRITICAL: Severe Lost Circulation Horizon Detected',
          message:
            'Flow line return deficit (-120 gpm) and torque oscillations observed at 2844.5m. Direct stratigraphic correlation with offset well NHK-142 (2.3 km away) where total loss of returns occurred at 2845.0m.',
          evidence: {
            historicalWells: ['NHK-142', 'JRN-17', 'BBL-14'],
            historicalDepths: [2845.0, 2846.5, 2842.0],
            formation: 'Barail Main Sand (BMS)',
            distanceKm: 2.3,
            sourceDoc: 'Well Completion Report WCR-NHK-142',
            page: 42,
          },
          recommendedMitigation:
            'Stage 45 bbl engineered LCM pill (25 ppb coarse CaCO3 + 15 ppb coarse Mica + 10 ppb walnut shells). Lower mud weight to 9.85 ppg to eliminate 420 psi overbalance.',
          status: 'ACTIVE',
        };

        this.state.activeAlerts = [newAlert, ...this.state.activeAlerts];
      }
    }
    // Scenario 3: After mitigation pill deployed or normal zone
    else if (this.state.mitigationPillPumped) {
      this.state.torque = 14.8 + Math.random() * 1.5;
      this.state.flowOut = this.state.flowIn;
      this.state.pitVolumeChangeBbl = 0;
      this.state.mudWeight = 9.85;
    }
  }

  private recomputeIntelligence() {
    const telemetry: DrillingTelemetryParams = {
      depth: this.state.currentDepth,
      rop: this.state.rop,
      wob: this.state.wob,
      rpm: this.state.rpm,
      torque: this.state.torque,
      spp: this.state.spp,
      flowIn: this.state.flowIn,
      flowOut: this.state.flowOut,
      mudWeight: this.state.mudWeight,
      pitVolumeChangeBbl: this.state.pitVolumeChangeBbl,
      gasUnits: this.state.gasUnits,
    };

    const riskEvaluation = evaluateDrillingRisks(telemetry);
    this.state.formation = riskEvaluation.formation;
    this.state.latestRisks = riskEvaluation.risks;
    this.state.overallRiskLevel = riskEvaluation.overallRiskLevel;

    // Offset correlations
    this.state.topCorrelations = correlateNearbyWells({
      activeLatitude: 27.2942,
      activeLongitude: 95.3418,
      currentDepth: this.state.currentDepth,
      radiusKm: 25,
    });
  }
}

export const clientSimulator = new ClientErtmacSimulator();

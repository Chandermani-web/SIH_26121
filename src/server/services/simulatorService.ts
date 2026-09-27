/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WebSocket } from 'ws';
import { DrillingTelemetryParams, evaluateDrillingRisks, RiskPrediction } from './riskEngine.js';
import { correlateNearbyWells, WellCorrelationResult } from './correlationEngine.js';
import { EventSeverity } from '../data/wellsData.js';

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
  simulationSpeed: number; // multiplier
  currentDepth: number; // m
  tvd: number; // m
  rop: number; // m/hr
  wob: number; // klb
  rpm: number;
  torque: number; // kft-lb
  spp: number; // psi
  flowIn: number; // gpm
  flowOut: number; // gpm
  mudWeight: number; // ppg
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

class ErtmacSimulator {
  private state: SimulationState;
  private intervalTimer: NodeJS.Timeout | null = null;
  private connectedSockets: Set<WebSocket> = new Set();
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

    // Initialize initial risks and correlations
    this.recomputeIntelligence();
  }

  public registerSocket(ws: WebSocket) {
    this.connectedSockets.add(ws);
    // Send immediate snapshot
    ws.send(JSON.stringify({ type: 'SIMULATION_STATE', payload: this.state }));

    ws.on('close', () => {
      this.connectedSockets.delete(ws);
    });
  }

  public getState(): SimulationState {
    return { ...this.state };
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
      // Clear previous alerts so demo alert fires cleanly
      this.state.activeAlerts = this.state.activeAlerts.filter((a) => a.alertType !== 'MUD_LOSS');
    }

    if (this.intervalTimer) clearInterval(this.intervalTimer);

    // Run tick every 1000ms / speed
    const tickInterval = Math.max(200, Math.floor(1000 / speed));
    this.intervalTimer = setInterval(() => {
      this.tick();
    }, tickInterval);

    this.recomputeIntelligence();
    this.broadcast();
  }

  public fastForwardToIncident() {
    this.state.currentDepth = 2844.6;
    this.state.tvd = 2844.6 * 0.991;
    this.state.mitigationPillPumped = false;
    this.simulatePhysics();
    this.recomputeIntelligence();
    this.broadcast();
  }

  public stopSimulation() {
    this.state.isRunning = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.broadcast();
  }

  public resetSimulation(startDepth = 2835.0) {
    this.stopSimulation();
    this.state.currentDepth = startDepth;
    this.state.tvd = startDepth * 0.991;
    this.state.torque = 14.8;
    this.state.flowIn = 560;
    this.state.flowOut = 560;
    this.state.pitVolumeChangeBbl = 0;
    this.state.activeAlerts = [];
    this.state.mitigationPillPumped = false;
    this.state.stepIndex = 0;
    this.recomputeIntelligence();
    this.broadcast();
  }

  public stepDepth(deltaM = 1.0) {
    this.state.currentDepth += deltaM;
    this.state.tvd = this.state.currentDepth * 0.991;
    this.simulatePhysics();
    this.recomputeIntelligence();
    this.broadcast();
  }

  public pumpMitigationPill(pillType: string) {
    this.state.mitigationPillPumped = true;
    // Remediate mud loss conditions
    this.state.mudWeight = 9.85; // reduced mud weight
    this.state.flowOut = this.state.flowIn; // full returns restored
    this.state.pitVolumeChangeBbl = 0;
    this.state.torque = 14.2;

    // Resolve or acknowledge active alerts
    for (const a of this.state.activeAlerts) {
      if (a.alertType === 'MUD_LOSS') {
        a.status = 'RESOLVED';
      }
    }

    this.recomputeIntelligence();
    this.broadcast({
      type: 'NOTIFICATION',
      payload: {
        title: 'Mitigation Pill Successfully Deployed',
        message: `Poured 45 bbl ${pillType}. Annular returns re-established at ${this.state.flowIn} gpm. Mud weight lowered to 9.85 ppg.`,
        severity: 'SUCCESS',
      },
    });
  }

  private tick() {
    this.state.stepIndex += 1;
    // Drilling advance rate adjusted for demo mode pace
    const advanceRate = this.state.isDemoMode ? 0.35 : 0.2;
    this.state.currentDepth = Math.round((this.state.currentDepth + advanceRate) * 10) / 10;
    this.state.tvd = Math.round(this.state.currentDepth * 0.991 * 10) / 10;

    this.simulatePhysics();
    this.recomputeIntelligence();
    this.broadcast();
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
      // Torque increases as bit encounters carbonaceous shale / fracture boundaries
      this.state.torque = 19.5 + Math.random() * 4.0;
      this.state.rop = 22.0 + Math.random() * 5.0; // Drilling break
      this.state.flowOut = this.state.flowIn - 15; // Initial seepage loss
      this.state.pitVolumeChangeBbl -= 1.2;
    }
    // Scenario 2: Critical 2844.5m - 2852m (Mirrors NHK-142 total loss)
    else if (depth >= 2844.5 && depth < 2852.0 && !this.state.mitigationPillPumped) {
      this.state.torque = 24.5 + Math.random() * 4.5;
      this.state.rop = 28.5 + Math.random() * 4.0;
      this.state.flowOut = 440; // 120 gpm deficit!
      this.state.pitVolumeChangeBbl -= 4.5;
      this.state.pitVolumeBbl = Math.max(720, this.state.pitVolumeBbl - 2.5);

      // Trigger Alert if not already triggered
      if (!this.state.activeAlerts.some((a) => a.alertType === 'MUD_LOSS' && a.status === 'ACTIVE')) {
        const newAlert: ActiveAlert = {
          id: `ALT-${this.alertCounter++}`,
          wellId: this.state.wellId,
          wellName: 'NHK-Deep-504 (Active)',
          alertType: 'MUD_LOSS',
          severity: 'CRITICAL',
          depth: this.state.currentDepth,
          timestamp: new Date().toISOString(),
          title: 'PROACTIVE ALERT: Severe Lost Circulation Zone',
          message:
            'Critical historical correlation: Offset Well NHK-142 (2.3 km away) suffered total mud loss (68 bbls in 12 min) at 2845m in Barail Main Sand. Active flow deficit detected (-120 gpm).',
          evidence: {
            historicalWells: ['NHK-142 (2.3 km)', 'BBL-14 (1.8 km)', 'JRN-17 (5.5 km)'],
            historicalDepths: [2845.0, 2842.0, 2846.5],
            formation: 'Barail Main Sand (BMS)',
            distanceKm: 2.3,
            sourceDoc: 'Well Completion Report NHK-142',
            page: 42,
          },
          recommendedMitigation:
            'Prepare to pull off bottom into 9-5/8" casing shoe. Pump 45 bbl engineered LCM squeeze pill (25 ppb coarse CaCO3 + 15 ppb coarse Mica + 10 ppb walnut shells). Lower mud weight to 9.85 ppg.',
          status: 'ACTIVE',
        };
        this.state.activeAlerts.unshift(newAlert);
      }
    }
    // Scenario 3: Passing 2855m - 2862m (Differential sticking alert like KNG-38)
    else if (depth >= 2856.0 && depth <= 2864.0) {
      if (this.state.mitigationPillPumped) {
        this.state.torque = 15.2 + Math.random() * 1.5;
        this.state.flowOut = this.state.flowIn;
      }
      if (!this.state.activeAlerts.some((a) => a.alertType === 'STUCK_PIPE' && a.status === 'ACTIVE')) {
        const stickAlert: ActiveAlert = {
          id: `ALT-${this.alertCounter++}`,
          wellId: this.state.wellId,
          wellName: 'NHK-Deep-504 (Active)',
          alertType: 'STUCK_PIPE',
          severity: 'HIGH',
          depth: this.state.currentDepth,
          timestamp: new Date().toISOString(),
          title: 'PREVENTATIVE ADVISORY: High Differential Sticking Horizon',
          message:
            'Entering permeable depleted Barail Sandstone horizon. Offset Well KNG-38 (4.1 km) stuck differentially at 2860m when left stationary for 35 minutes.',
          evidence: {
            historicalWells: ['KNG-38 (4.1 km)'],
            historicalDepths: [2860.0],
            formation: 'Barail Main Sand (BMS)',
            distanceKm: 4.1,
            sourceDoc: 'Daily Drilling Incident Log KNG-38',
            page: 18,
          },
          recommendedMitigation:
            'Enforce rule: Never keep string stationary for > 10 min without rotation (min 25 RPM). Maintain low filtration loss (< 8 cc). Spotting fluid on standby.',
          status: 'ACTIVE',
        };
        this.state.activeAlerts.unshift(stickAlert);
      }
    }
    // Scenario 4: Normal drilling
    else {
      this.state.torque = 14.5 + Math.random() * 1.5;
      this.state.flowOut = this.state.flowIn;
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

    // Recompute top correlations
    this.state.topCorrelations = correlateNearbyWells({
      activeLatitude: 27.2942,
      activeLongitude: 95.3418,
      currentDepth: this.state.currentDepth,
      radiusKm: 25,
    }).slice(0, 8);
  }

  public acknowledgeAlert(alertId: string) {
    const alert = this.state.activeAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'ACKNOWLEDGED';
      this.broadcast();
    }
  }

  private broadcast(customMsg?: Record<string, unknown>) {
    const payload = customMsg || {
      type: 'SIMULATION_STATE',
      payload: this.state,
    };
    const jsonStr = JSON.stringify(payload);

    for (const ws of this.connectedSockets) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(jsonStr);
        } catch {
          this.connectedSockets.delete(ws);
        }
      }
    }
  }
}

export const ertmacSimulator = new ErtmacSimulator();

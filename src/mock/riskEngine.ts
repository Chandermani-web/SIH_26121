/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventSeverity, HistoricalEvent } from './wellsData.js';
import { HISTORICAL_EVENTS_DATA } from './eventsData.js';
import { getFormationForDepth } from './correlationEngine.js';

export interface RiskPredictionFactor {
  name: string;
  impactWeight: number; // percentage
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
  score: number; // 0 to 100
  severity: EventSeverity;
  confidence: number; // 0.0 to 1.0
  summary: string;
  factors: RiskPredictionFactor[];
  evidence: RiskEvidenceItem[];
  recommendedMitigations: string[];
  historicalLesson: string;
}

export interface DrillingTelemetryParams {
  depth: number;
  rop: number; // m/hr
  wob: number; // klb
  rpm: number;
  torque: number; // kft-lb
  spp: number; // psi
  flowIn: number; // gpm
  flowOut: number; // gpm
  mudWeight: number; // ppg
  pitVolumeChangeBbl?: number; // delta bbl
  gasUnits?: number; // units
}

/**
 * Predict active drilling risks based on telemetry parameters and offset well history.
 */
export function evaluateDrillingRisks(params: DrillingTelemetryParams): {
  currentDepth: number;
  formation: string;
  overallRiskLevel: EventSeverity;
  risks: RiskPrediction[];
} {
  const {
    depth,
    rop,
    wob,
    rpm,
    torque,
    spp,
    flowIn,
    flowOut,
    mudWeight,
    pitVolumeChangeBbl = 0,
    gasUnits = 120,
  } = params;

  const formation = getFormationForDepth(depth);

  // Search historical incidents within +/- 150m of current depth
  const nearbyIncidents = HISTORICAL_EVENTS_DATA.filter(
    (e) => Math.abs(e.depth - depth) <= 150
  );

  // 1. MUD LOSS RISK EVALUATION
  let mudLossScore = 15;
  const mudLossFactors: RiskPredictionFactor[] = [];
  const mudLossEvidence: RiskEvidenceItem[] = [];

  // Historical proximity in Barail
  const historicalMudLosses = nearbyIncidents.filter((e) => e.eventType === 'MUD_LOSS');
  const closestMudLoss = historicalMudLosses.sort(
    (a, b) => Math.abs(a.depth - depth) - Math.abs(b.depth - depth)
  )[0];

  if (formation.includes('Barail')) {
    mudLossScore += 35; // Barail Main Sand has depleted sands
    mudLossFactors.push({
      name: 'Depleted Sandstone Facies',
      impactWeight: 35,
      status: 'WARNING',
      observation: 'Barail Main Sand exhibits sub-hydrostatic depleted pore pressure (~8.8 ppg equivalent).',
    });
  }

  if (closestMudLoss) {
    const depthDelta = Math.abs(closestMudLoss.depth - depth);
    if (depthDelta <= 15) {
      mudLossScore += 45;
      mudLossFactors.push({
        name: 'Critical Depth Offset Proximity',
        impactWeight: 45,
        status: 'ALERT',
        observation: `Bit depth (${depth.toFixed(1)}m) is within ${depthDelta.toFixed(1)}m of severe mud loss in offset ${closestMudLoss.wellName} at ${closestMudLoss.depth}m.`,
      });
    } else if (depthDelta <= 50) {
      mudLossScore += 25;
      mudLossFactors.push({
        name: 'Historical Hazard Corridor',
        impactWeight: 25,
        status: 'WARNING',
        observation: `Approaching historical loss depth of ${closestMudLoss.depth}m in ${closestMudLoss.wellName}.`,
      });
    }

    for (const lossEvt of historicalMudLosses) {
      mudLossEvidence.push({
        wellId: lossEvt.wellId,
        wellName: lossEvt.wellName,
        distanceKm: lossEvt.wellId === 'OIL-HIST-01' ? 2.3 : lossEvt.wellId === 'OIL-HIST-09' ? 1.8 : 5.5,
        historicalDepth: lossEvt.depth,
        depthDeltaM: Math.round(Math.abs(lossEvt.depth - depth) * 10) / 10,
        eventType: lossEvt.eventType,
        severity: lossEvt.severity,
        eventDescription: lossEvt.description,
        historicalMitigation: lossEvt.mitigation,
        sourceDoc: lossEvt.sourceDocumentName,
        pageNumber: lossEvt.sourcePageNumber,
      });
    }
  }

  // Parameter telemetry triggers
  if (flowIn - flowOut > 30 || pitVolumeChangeBbl < -5) {
    mudLossScore += 20;
    mudLossFactors.push({
      name: 'Active Flow Deficit & Pit Volume Drop',
      impactWeight: 20,
      status: 'ALERT',
      observation: `Flow out (${flowOut.toFixed(0)} gpm) lagging flow in (${flowIn.toFixed(0)} gpm) with pit volume trending downward.`,
    });
  } else if (mudWeight > 10.2 && formation.includes('Barail')) {
    mudLossScore += 15;
    mudLossFactors.push({
      name: 'High Overbalance Pressure',
      impactWeight: 15,
      status: 'WARNING',
      observation: `Mud weight ${mudWeight.toFixed(2)} ppg provides > 400 psi overbalance on depleted formation, risking micro-fracture inception.`,
    });
  }

  mudLossScore = Math.min(96, Math.max(8, mudLossScore));
  const mudLossSeverity: EventSeverity =
    mudLossScore >= 80 ? 'CRITICAL' : mudLossScore >= 60 ? 'HIGH' : mudLossScore >= 35 ? 'MEDIUM' : 'LOW';

  // 2. STUCK PIPE RISK EVALUATION
  let stuckPipeScore = 12;
  const stuckPipeFactors: RiskPredictionFactor[] = [];
  const stuckPipeEvidence: RiskEvidenceItem[] = [];

  const historicalStuck = nearbyIncidents.filter((e) => e.eventType === 'STUCK_PIPE');
  if (historicalStuck.length > 0) {
    const closestStuck = historicalStuck[0];
    const depthDelta = Math.abs(closestStuck.depth - depth);
    if (depthDelta <= 35) {
      stuckPipeScore += 40;
      stuckPipeFactors.push({
        name: 'Historical Differential Sticking Horizon',
        impactWeight: 40,
        status: 'ALERT',
        observation: `Offset well ${closestStuck.wellName} suffered differential sticking at ${closestStuck.depth}m (Δ ${depthDelta.toFixed(1)}m).`,
      });
    }

    for (const evt of historicalStuck) {
      stuckPipeEvidence.push({
        wellId: evt.wellId,
        wellName: evt.wellName,
        distanceKm: evt.wellId === 'OIL-HIST-02' ? 4.1 : 2.3,
        historicalDepth: evt.depth,
        depthDeltaM: Math.round(Math.abs(evt.depth - depth) * 10) / 10,
        eventType: evt.eventType,
        severity: evt.severity,
        eventDescription: evt.description,
        historicalMitigation: evt.mitigation,
        sourceDoc: evt.sourceDocumentName,
        pageNumber: evt.sourcePageNumber,
      });
    }
  }

  if (torque > 22.0) {
    stuckPipeScore += 25;
    stuckPipeFactors.push({
      name: 'Elevated Rotary Torque & Friction',
      impactWeight: 25,
      status: 'ALERT',
      observation: `Drillstring torque (${torque.toFixed(1)} kft-lb) elevated significantly above baseline (14.0 kft-lb).`,
    });
  }

  if (rpm < 30 && rop < 1.0 && depth > 2700) {
    stuckPipeScore += 20;
    stuckPipeFactors.push({
      name: 'Stationary String Exposure',
      impactWeight: 20,
      status: 'WARNING',
      observation: 'Low string rotation across permeable sandstone risks rapid filter cake differential sticking.',
    });
  }

  stuckPipeScore = Math.min(94, Math.max(10, stuckPipeScore));
  const stuckPipeSeverity: EventSeverity =
    stuckPipeScore >= 75 ? 'HIGH' : stuckPipeScore >= 45 ? 'MEDIUM' : 'LOW';

  // 3. TORQUE SPIKE / VIBRATION RISK
  let torqueRiskScore = 15;
  const torqueFactors: RiskPredictionFactor[] = [];
  const torqueEvidence: RiskEvidenceItem[] = [];

  const historicalTorque = nearbyIncidents.filter((e) => e.eventType === 'TORQUE_SPIKE');
  if (historicalTorque.length > 0) {
    const closestT = historicalTorque[0];
    torqueRiskScore += 30;
    torqueFactors.push({
      name: 'Intercalated Coal / Shale Seam Torsional Drag',
      impactWeight: 30,
      status: 'WARNING',
      observation: `Offset wells (${closestT.wellName} at ${closestT.depth}m) reported high torsional slip-stick in Barail carbonaceous beds.`,
    });
    for (const evt of historicalTorque) {
      torqueEvidence.push({
        wellId: evt.wellId,
        wellName: evt.wellName,
        distanceKm: 1.5,
        historicalDepth: evt.depth,
        depthDeltaM: Math.round(Math.abs(evt.depth - depth) * 10) / 10,
        eventType: evt.eventType,
        severity: evt.severity,
        eventDescription: evt.description,
        historicalMitigation: evt.mitigation,
        sourceDoc: evt.sourceDocumentName,
        pageNumber: evt.sourcePageNumber,
      });
    }
  }

  if (torque >= 24.0) {
    torqueRiskScore += 45;
    torqueFactors.push({
      name: 'Real-Time Torque Spikes (>24 kft-lb)',
      impactWeight: 45,
      status: 'ALERT',
      observation: `Current top drive torque (${torque.toFixed(1)} kft-lb) exhibiting severe stick-slip cycles.`,
    });
  }

  torqueRiskScore = Math.min(92, Math.max(10, torqueRiskScore));
  const torqueSeverity: EventSeverity =
    torqueRiskScore >= 75 ? 'HIGH' : torqueRiskScore >= 45 ? 'MEDIUM' : 'LOW';

  // 4. KICK / OVERPRESSURE RISK
  let kickScore = 10;
  const kickFactors: RiskPredictionFactor[] = [];
  const kickEvidence: RiskEvidenceItem[] = [];

  if (formation.includes('Kopili') || depth > 3200) {
    kickScore += 50;
    kickFactors.push({
      name: 'Geopressured Kopili Transition Zone',
      impactWeight: 50,
      status: 'ALERT',
      observation: 'Entering overpressured Kopili Shale with pore pressure gradients up to 0.58 psi/ft.',
    });
  } else {
    kickFactors.push({
      name: 'Pore Pressure Baseline',
      impactWeight: 10,
      status: 'NOMINAL',
      observation: 'Current Barail horizon is normally pressured to depleted; low spontaneous influx risk unless induced by severe loss.',
    });
  }

  if (gasUnits > 1500 || (flowOut - flowIn > 40 && pitVolumeChangeBbl > 8)) {
    kickScore += 40;
    kickFactors.push({
      name: 'Gas Flare or Pit Gain Detected',
      impactWeight: 40,
      status: 'ALERT',
      observation: `Gas units spiked to ${gasUnits} units with positive pit gain.`,
    });
  }

  kickScore = Math.min(95, Math.max(5, kickScore));
  const kickSeverity: EventSeverity =
    kickScore >= 75 ? 'CRITICAL' : kickScore >= 50 ? 'HIGH' : kickScore >= 25 ? 'MEDIUM' : 'LOW';

  // 5. CEMENTING / CASING ISSUE RISK
  let cementScore = 18;
  const cementFactors: RiskPredictionFactor[] = [];
  const cementEvidence: RiskEvidenceItem[] = [];

  if (depth > 2650 && depth < 2750) {
    cementScore += 45;
    cementFactors.push({
      name: 'Intermediate Casing Shoe Horizon',
      impactWeight: 45,
      status: 'WARNING',
      observation: '9-5/8" casing shoe across Girujan/Barail transition requires strict leak-off test and low-density slurry design.',
    });
  } else {
    cementFactors.push({
      name: 'Current Openhole Section',
      impactWeight: 15,
      status: 'NOMINAL',
      observation: 'Section currently in open hole drilling; future liner cementation will encounter loss thief zones.',
    });
  }

  const risks: RiskPrediction[] = [
    {
      riskType: 'MUD_LOSS',
      title: 'Lost Circulation / Fracturing Risk',
      score: mudLossScore,
      severity: mudLossSeverity,
      confidence: 0.92,
      summary:
        mudLossScore >= 70
          ? 'PROACTIVE ALERT: High risk of sudden mud loss into depleted micro-fractured Barail sands. Closely mirrors NHK-142 total loss at 2845m (2.3 km offset).'
          : 'Moderate mud loss risk under standard operating parameters in current lithology.',
      factors: mudLossFactors,
      evidence: mudLossEvidence,
      recommendedMitigations: [
        'Reduce active mud weight from 10.4 ppg to 9.8-9.9 ppg (ECD < 10.5 ppg) to decrease overbalance pressure.',
        'Pre-treat active suction pits with 15-20 ppb sized Calcium Carbonate (D50 ~ 45 micron) for continuous pore bridging.',
        'Stage 45 bbl engineered LCM squeeze pill (25 ppb Coarse CaCO3 + 15 ppb Mica flakes + 10 ppb Walnut shells) ready in pill pit.',
        'Reduce pump rate from 580 gpm to 440 gpm upon encountering any drilling break > 20 m/hr.',
      ],
      historicalLesson:
        'In offset well NHK-142 (2.3 km away), total loss of 68 bbls occurred at 2845m when overbalance exceeded 420 psi. Cured with 45 bbl CaCO3/Mica pill with 250 psi hesitation squeeze.',
    },
    {
      riskType: 'STUCK_PIPE',
      title: 'Differential Sticking & Pack-off Risk',
      score: stuckPipeScore,
      severity: stuckPipeSeverity,
      confidence: 0.88,
      summary:
        stuckPipeScore >= 60
          ? 'ELEVATED RISK: High overbalance across permeable depleted sands creates differential sticking hazard if drillstring remains stationary.'
          : 'Low differential sticking risk with continuous pipe movement and controlled filtration loss.',
      factors: stuckPipeFactors,
      evidence: stuckPipeEvidence,
      recommendedMitigations: [
        'Enforce strict rig floor rule: Never leave drillstring stationary across Barail interval for > 10 minutes without rotation (min 25 RPM).',
        'Add 3% polyglycol lubricant to mud system to lower filter cake friction coefficient below 0.08.',
        'Maintain HTHP fluid loss below 8.0 cc to prevent spongy filter cake buildup.',
        'Keep 60 bbl low-toxicity oil-base spotting fluid (Safe-Solv) on rig site for immediate soaking in case of sticking.',
      ],
      historicalLesson:
        'KNG-38 stuck differentially at 2860m after 35 min stationary during MWD repair. Freed after 46 hours NPT by spotting 60 bbl soaking pill and downward jarring.',
    },
    {
      riskType: 'TORQUE_SPIKE',
      title: 'Torsional Resonance & Stick-Slip Risk',
      score: torqueRiskScore,
      severity: torqueSeverity,
      confidence: 0.85,
      summary:
        torqueRiskScore >= 65
          ? 'ACTIVE WARNING: Torsional drag and stick-slip vibrations detected. Interspliced coal beds causing erratic bit response.'
          : 'Nominal torque levels with smooth bit-rock engagement.',
      factors: torqueFactors,
      evidence: torqueEvidence,
      recommendedMitigations: [
        'Reduce WOB by 4-6 klb and increase rotary speed to 130 RPM to escape torsional resonance window.',
        'Pump 25 bbl high-viscosity pill with extreme-pressure lubricant.',
        'Ream tight spots with low back-reaming rate (< 5 m/hr) to avoid bit hanging.',
      ],
      historicalLesson:
        'CHM-11 experienced torque surges up to 26 kft-lb at 2848.5m due to carbonaceous shale ribbons. Stabilized by reducing WOB and reaming with glycol.',
    },
    {
      riskType: 'KICK',
      title: 'Well Influx & Geopressure Kick Risk',
      score: kickScore,
      severity: kickSeverity,
      confidence: 0.89,
      summary:
        kickScore >= 70
          ? 'CRITICAL ALERT: Potential high-pressure influx zone or secondary gas entry following severe mud loss.'
          : 'Low influx potential in current section; monitor trip tank during connections.',
      factors: kickFactors,
      evidence: kickEvidence,
      recommendedMitigations: [
        'Maintain automated PVT alarm thresholds at +/- 3 bbl.',
        'Execute immediate space-out and shut-in on annular preventer if flow out increases unexpectedly.',
        'Prepare barite weighting material in reserve tanks if approaching Kopili transition.',
      ],
      historicalLesson:
        'Baghjan BGJ-09 took a 22 bbl gas kick at 3420m in Kopili transition with 10.8 ppg mud. Safely killed using Wait and Weight method with 12.8 ppg mud.',
    },
    {
      riskType: 'CEMENTING_ISSUE',
      title: 'Zonal Isolation & Cementing Risk',
      score: cementScore,
      severity: cementScore >= 50 ? 'MEDIUM' : 'LOW',
      confidence: 0.82,
      summary: 'Thief zones in Barail require low-density microsphere slurry or multi-stage cementing to avoid slurry losses.',
      factors: cementFactors,
      evidence: cementEvidence,
      recommendedMitigations: [
        'Use extended low-density (12.2 ppg) lead slurry with gas-tight fluid loss additives.',
        'Pre-flush with 50 bbl reactive chemical wash to maximize casing-cement bond index.',
      ],
      historicalLesson:
        'JRN-17 lost 180 bbl cement slurry at 2690m due to hydrostatic pressure exceeding formation breakdown. Required secondary remedial squeeze.',
    },
  ];

  // Determine overall severity
  let overallRiskLevel: EventSeverity = 'LOW';
  if (risks.some((r) => r.severity === 'CRITICAL')) {
    overallRiskLevel = 'CRITICAL';
  } else if (risks.some((r) => r.severity === 'HIGH')) {
    overallRiskLevel = 'HIGH';
  } else if (risks.some((r) => r.severity === 'MEDIUM')) {
    overallRiskLevel = 'MEDIUM';
  }

  return {
    currentDepth: depth,
    formation,
    overallRiskLevel,
    risks,
  };
}

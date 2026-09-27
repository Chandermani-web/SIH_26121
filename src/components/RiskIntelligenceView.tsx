/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  TrendingDown,
  Layers,
  FileText,
  Activity,
  Droplet,
  ChevronRight,
  Info,
} from 'lucide-react';
import { RiskPrediction, SimulationState } from '../types/index.js';
import { api } from '../services/apiService.js';

interface RiskIntelligenceViewProps {
  simState: SimulationState;
  onPumpMitigation: (pillType: string) => void;
}

export const RiskIntelligenceView: React.FC<RiskIntelligenceViewProps> = ({
  simState,
  onPumpMitigation,
}) => {
  const [selectedRiskType, setSelectedRiskType] = useState<string>('MUD_LOSS');
  const [depthProfile, setDepthProfile] = useState<
    {
      depth: number;
      mudLossRisk: number;
      stuckPipeRisk: number;
      torqueRisk: number;
      kickRisk: number;
      formation: string;
      hasHistoricalIncident: boolean;
    }[]
  >([]);

  useEffect(() => {
    api.getRiskHistory('OIL-ACTIVE-01').then((res) => {
      setDepthProfile(res.depthProfile);
    });
  }, []);

  const selectedRisk =
    simState.latestRisks.find((r) => r.riskType === selectedRiskType) ||
    simState.latestRisks[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-display">
              Multi-Dimensional Predictive Risk Analytics Engine
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              ML & RULE CORRELATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Correlates active bit depth ({simState.currentDepth.toFixed(1)}m in {simState.formation}) with real-time drilling dynamics (torque, flow rate, overbalance) and historical offset failure frequencies.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs">
          <span className="text-slate-400">Overall Hazard Status:</span>
          <span
            className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[11px] ${
              simState.overallRiskLevel === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : simState.overallRiskLevel === 'HIGH'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {simState.overallRiskLevel} ATTENTION
          </span>
        </div>
      </div>

      {/* 5 Risk Dimensions Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {simState.latestRisks.map((risk) => {
          const isSelected = selectedRiskType === risk.riskType;
          const isCrit = risk.severity === 'CRITICAL';
          const isHigh = risk.severity === 'HIGH';

          return (
            <button
              key={risk.riskType}
              onClick={() => setSelectedRiskType(risk.riskType)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                  : 'bg-[#0c1424] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {risk.title.split('/')[0]}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    isCrit
                      ? 'bg-rose-500/20 text-rose-300'
                      : isHigh
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {risk.severity}
                </span>
              </div>

              <div className="my-2">
                <span
                  className={`text-2xl font-bold font-mono ${
                    isCrit ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-cyan-400'
                  }`}
                >
                  {risk.score}%
                </span>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isCrit ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${risk.score}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Risk Deep-Dive & Contributing Factors */}
      {selectedRisk && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Risk Summary & Contributing Factors (7 cols) */}
          <div className="lg:col-span-7 bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 font-display">
                    {selectedRisk.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Confidence: {(selectedRisk.confidence * 100).toFixed(0)}% · Evaluation Stratum: {simState.formation}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-2xl font-bold font-mono ${
                      selectedRisk.severity === 'CRITICAL'
                        ? 'text-rose-400'
                        : selectedRisk.severity === 'HIGH'
                        ? 'text-amber-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {selectedRisk.score}/100
                  </span>
                  <span className="block text-[10px] text-slate-500 uppercase">
                    Risk Score
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 mt-3 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                {selectedRisk.summary}
              </p>
            </div>

            {/* Contributing Parameter Factors */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                Contributing Telemetry & Geological Factors
              </h4>
              <div className="space-y-2">
                {selectedRisk.factors.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            f.status === 'ALERT'
                              ? 'bg-rose-500 animate-pulse'
                              : f.status === 'WARNING'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <strong className="text-slate-200">{f.name}</strong>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-4 leading-relaxed">
                        {f.observation}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-cyan-300 font-bold whitespace-nowrap">
                      +{f.impactWeight}% impact
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Lesson Learned */}
            <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs">
              <span className="font-semibold text-cyan-300 block mb-1">
                Historical Lesson Learned:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {selectedRisk.historicalLesson}
              </p>
            </div>

            {/* Mitigation Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 italic">
                Derived directly from Oil India Well Completion Reports.
              </div>

              {selectedRisk.riskType === 'MUD_LOSS' && (
                <button
                  onClick={() => onPumpMitigation('45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition-colors flex items-center gap-1.5"
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>Stage Recommended LCM Squeeze Pill</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Historical Offset Precedents & Mitigations (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Recommended Mitigations */}
            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Recommended Mitigations
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedRisk.recommendedMitigations.map((mit, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/60">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span className="leading-relaxed">{mit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Correlated Historical Evidence Records */}
            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Verified Historical Evidence Dossiers
              </h4>

              {selectedRisk.evidence.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No direct historical incident in this stratum.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedRisk.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">{ev.wellName}</span>
                        <span className="text-[10px] font-mono text-amber-300">
                          {ev.distanceKm} km offset
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Historical Depth: <strong className="text-slate-200">{ev.historicalDepth}m</strong> (Δ {ev.depthDeltaM}m from bit)
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {ev.eventDescription}
                      </p>
                      <div className="pt-1 border-t border-slate-800/80 text-[10px] text-cyan-400 flex items-center justify-between">
                        <span>Source: {ev.sourceDoc} (pg. {ev.pageNumber})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Risk-vs-Depth Stratigraphic Cross Plot */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-display">
              Stratigraphic Risk-vs-Depth Cross-Plot (Barail Main Sand: 2650m - 3150m)
            </h3>
            <p className="text-xs text-slate-400">
              Composite risk density curves across 21 offset well penetrations highlighting the critical 2840m - 2865m hazard corridor
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Mud Loss Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Stuck Pipe Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Current Bit ({simState.currentDepth.toFixed(1)}m)
            </span>
          </div>
        </div>

        {/* Visual Cross-Plot Matrix */}
        <div className="h-64 relative bg-[#080d19] border border-slate-800 rounded-lg p-3 flex items-end justify-between gap-1 overflow-hidden">
          {/* Depth Axis & Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20 text-[10px] font-mono text-slate-400">
            <div className="border-b border-slate-600 pb-0.5">Risk Score: 100% (CRITICAL)</div>
            <div className="border-b border-slate-600 pb-0.5">Risk Score: 75% (HIGH)</div>
            <div className="border-b border-slate-600 pb-0.5">Risk Score: 50% (MEDIUM)</div>
            <div className="border-b border-slate-600 pb-0.5">Risk Score: 25% (LOW)</div>
          </div>

          {/* Critical Hazard Zone Shaded Area (2840m - 2865m) */}
          <div className="absolute top-0 bottom-0 left-[35%] right-[45%] bg-rose-500/10 border-x border-rose-500/30 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono font-bold text-rose-300/70 tracking-widest rotate-90 uppercase">
              HAZARD CORRIDOR (2840m - 2865m)
            </span>
          </div>

          {/* Active Bit Position Indicator */}
          {depthProfile.length > 0 && (
            <div
              className="absolute top-0 bottom-0 z-10 w-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4] flex flex-col items-center pointer-events-none transition-all duration-300"
              style={{
                left: `${Math.max(
                  5,
                  Math.min(
                    95,
                    ((simState.currentDepth - 2650) / (3150 - 2650)) * 100
                  )
                )}%`,
              }}
            >
              <div className="px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-bold text-[9px] font-mono whitespace-nowrap shadow mt-1">
                BIT: {simState.currentDepth.toFixed(1)}m
              </div>
            </div>
          )}

          {/* Render Bars per depth step */}
          {depthProfile.map((pt) => (
            <div
              key={pt.depth}
              className="flex-1 flex flex-col items-center gap-0.5 group relative h-full justify-end"
            >
              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute bottom-full mb-2 z-20 bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-[10px] font-mono text-slate-200 whitespace-nowrap pointer-events-none">
                <div>Depth: <strong>{pt.depth}m</strong></div>
                <div className="text-rose-400">Mud Loss Risk: {pt.mudLossRisk}%</div>
                <div className="text-amber-400">Stuck Pipe Risk: {pt.stuckPipeRisk}%</div>
                {pt.hasHistoricalIncident && (
                  <div className="text-cyan-300 font-bold mt-1">Historical Incident Recorded</div>
                )}
              </div>

              {/* Loss bar */}
              <div
                className="w-full bg-rose-500/70 rounded-t-sm transition-all"
                style={{ height: `${pt.mudLossRisk * 0.8}%` }}
              />

              {/* Depth label at bottom */}
              {pt.depth % 100 === 0 && (
                <span className="text-[9px] font-mono text-slate-500 absolute -bottom-5">
                  {pt.depth}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-500 font-mono text-right pt-2">
          Depth Axis: Measured Depth (m) across Barail section
        </div>
      </div>
    </div>
  );
};

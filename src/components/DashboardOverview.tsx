/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  Compass,
  FileText,
  Layers,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Droplet,
  ExternalLink,
} from 'lucide-react';
import { SimulationState, Well, WellCorrelationResult } from '../types/index.js';

interface DashboardOverviewProps {
  simState: SimulationState;
  activeWell: Well;
  topCorrelations: WellCorrelationResult[];
  onSelectWell: (well: Well) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAlerts: () => void;
  onStartDemo: () => void;
  onPumpMitigation: (pillType: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  simState,
  activeWell,
  topCorrelations,
  onSelectWell,
  onNavigateTab,
  onOpenAlerts,
  onStartDemo,
  onPumpMitigation,
}) => {
  const activeAlerts = simState.activeAlerts.filter((a) => a.status === 'ACTIVE');
  const criticalAlert = activeAlerts.find((a) => a.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Critical Alert Proactive Notification Banner */}
      {criticalAlert && (
        <div className="bg-gradient-to-r from-rose-950/70 via-rose-900/40 to-slate-900 border-2 border-rose-500 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-rose-600/30 border border-rose-500 text-rose-300 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white">
                  PROACTIVE COLLABORATIVE ALERT
                </span>
                <span className="text-xs text-rose-300 font-mono">
                  Depth: {criticalAlert.depth.toFixed(1)}m · {criticalAlert.evidence.formation}
                </span>
              </div>
              <h3 className="font-bold text-slate-100 text-base mt-1">
                {criticalAlert.title}
              </h3>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed max-w-3xl">
                {criticalAlert.message}
              </p>
              <div className="mt-2 text-xs text-cyan-300">
                <strong>Recommended Mitigation: </strong> {criticalAlert.recommendedMitigation}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPumpMitigation('45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill')}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>DEPLOY LCM PILL</span>
            </button>
            <button
              onClick={onOpenAlerts}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              VIEW EVIDENCE &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Hero Grid: Active Well Snapshot & 4 Core Risk Radios */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Well Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  ACTIVE RIG TELEMETRY
                </span>
                <h2 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                  {activeWell.wellName}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DRILLING
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Bit Depth (MD)</span>
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {simState.currentDepth.toFixed(1)}m
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">True Vertical Depth</span>
                <span className="text-xl font-bold font-mono text-slate-200">
                  {simState.tvd.toFixed(1)}m
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Target Formation</span>
                <span className="font-semibold text-amber-300">
                  {simState.formation}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Active Mud Weight</span>
                <span className="font-bold font-mono text-slate-200">
                  {simState.mudWeight.toFixed(2)} ppg
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
              <div className="flex justify-between">
                <span>Field / Mining Lease:</span>
                <strong className="text-slate-200">Nahorkatiya ML (Upper Assam)</strong>
              </div>
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <strong className="text-slate-200 font-mono">27.2942° N, 95.3418° E</strong>
              </div>
              <div className="flex justify-between">
                <span>Casing Set Depth:</span>
                <strong className="text-slate-200">9-5/8" at 2680m (Intermediate)</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
            <button
              onClick={() => onNavigateTab('live-well')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Open Rig Telemetry Monitor &rarr;
            </button>

            <button
              onClick={onStartDemo}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate SIH Demo Scenario</span>
            </button>
          </div>
        </div>

        {/* 4 Risk Prediction Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {simState.latestRisks.slice(0, 4).map((risk) => {
            const isCrit = risk.severity === 'CRITICAL';
            const isHigh = risk.severity === 'HIGH';
            return (
              <div
                key={risk.riskType}
                className={`bg-[#0c1424] border rounded-xl p-4 shadow-md flex flex-col justify-between transition-all ${
                  isCrit
                    ? 'border-rose-600/70 bg-rose-950/15'
                    : isHigh
                    ? 'border-amber-600/60 bg-amber-950/15'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      {risk.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {risk.severity}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 my-2.5">
                    <span
                      className={`text-2xl font-bold font-mono ${
                        isCrit
                          ? 'text-rose-400'
                          : isHigh
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {risk.score}%
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Hazard Probability
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCrit ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {risk.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Confidence: <strong>{(risk.confidence * 100).toFixed(0)}%</strong>
                  </span>
                  <button
                    onClick={() => onNavigateTab('risk')}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Section: Top Correlated Nearby Wells with Historical Relevance Scores */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-base font-display">
                Top Correlated Historical Offset Wells
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                HAZARD CORRELATION ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by Historical Relevance Score: combining spatial distance, stratigraphic depth proximity, formation alignment, and incident severity
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('gis-map')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Interactive GIS Map</span>
          </button>
        </div>

        {/* Wells Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topCorrelations.slice(0, 4).map((item) => {
            const { well, distanceKm, relevanceScore, depthProximityM, criticalEventsCount } = item;
            const isHighRel = relevanceScore >= 80;

            return (
              <div
                key={well.id}
                onClick={() => onSelectWell(well)}
                className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isHighRel
                    ? 'bg-rose-950/15 border-rose-800/40 hover:border-rose-500 hover:bg-rose-950/25'
                    : 'bg-[#090f1d] border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {well.wellName}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {distanceKm.toFixed(1)} km · {well.field}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-bold font-mono ${
                        isHighRel ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {relevanceScore}%
                    </span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider">
                      Relevance
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Formation:</span>
                    <strong className="text-slate-200 truncate max-w-[130px]">{well.targetFormation}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Depth:</span>
                    <span className="font-mono text-slate-300">{well.totalDepth}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nearest Incident:</span>
                    <span className="font-mono text-rose-400">
                      {depthProximityM > 0 ? `Δ ${depthProximityM.toFixed(1)}m` : 'Normal'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Incidents: <strong className="text-amber-400">{item.historicalEventsCount}</strong>
                  </span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    View &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Knowledge Search Teaser & Recent Lessons Learned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Knowledge Search Teaser Card */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-slate-100 text-sm font-display">
                Evidence-Grounded Knowledge Search
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ask natural language operational questions directly grounded in Oil India Well Completion Reports (WCR) & Daily Drilling Reports (DDR)
            </p>

            <div className="mt-3 space-y-2">
              {[
                'What happened around 2850m in offset wells?',
                'Which nearby wells experienced mud losses in Barail Main Sand?',
                'What mitigation was used for stuck pipe in KNG-38?',
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateTab('knowledge')}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between group"
                >
                  <span>"{query}"</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-cyan-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4">
            <button
              onClick={() => onNavigateTab('knowledge')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Open Complete Knowledge Search Engine &rarr;
            </button>
          </div>
        </div>

        {/* Proven Historical Mitigations */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-slate-100 text-sm font-display">
                Field-Proven Mitigations on Record (Barail Corridor)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Historical engineering remedies proven effective in surrounding Upper Assam wells
            </p>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-slate-200 block">
                  1. Engineered LCM Squeeze Pill (NHK-142, 2845m)
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  25 ppb Coarse CaCO3 + 15 ppb Mica flakes + 10 ppb Walnut shells with 250 psi squeeze restored 100% returns after 68 bbl total loss.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-slate-200 block">
                  2. Safe-Solv Soaking Fluid (KNG-38, 2860m)
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  60 bbl low-toxicity oil soak across BHA freed differentially stuck drillstring after 46 hours without sidetracking.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-slate-200 block">
                  3. Thixotropic Bentonite-Diesel Plug (JRN-17, 2846.5m)
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  50 bbl DOB plug successfully sealed severe fracture aperture when standard fiber LCM pills were washed away.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4">
            <button
              onClick={() => onNavigateTab('events')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Browse All 65+ Historical Incidents &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

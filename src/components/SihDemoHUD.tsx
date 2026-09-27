/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Droplet,
  CheckCircle2,
  FastForward,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Activity,
  Layers,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SimulationState, WellCorrelationResult } from '../types/index.js';
import { soundEngine } from '../utils/soundEngine.js';

interface SihDemoHUDProps {
  simState: SimulationState;
  onStopDemo: () => void;
  onResetDemo: () => void;
  onFastForward: () => void;
  onPumpMitigation: (pillType: string) => void;
  onChangeSpeed: (speed: number) => void;
  onNavigateTab: (tab: string, context?: any) => void;
  onSelectWellByName: (wellName: string) => void;
  onOpenAlerts: () => void;
}

export const SihDemoHUD: React.FC<SihDemoHUDProps> = ({
  simState,
  onStopDemo,
  onResetDemo,
  onFastForward,
  onPumpMitigation,
  onChangeSpeed,
  onNavigateTab,
  onSelectWellByName,
  onOpenAlerts,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.isMuted);
  const prevDepthRef = useRef<number>(simState.currentDepth);
  const hasTriggeredCriticalSound = useRef<boolean>(false);
  const hasTriggeredSuccessSound = useRef<boolean>(false);

  const depth = simState.currentDepth;
  const flowDelta = simState.flowOut - simState.flowIn;
  const isLossActive = flowDelta < -30 || (depth >= 2844.5 && !simState.mitigationPillPumped);
  const isRemediated = simState.mitigationPillPumped;

  // Sound triggers on depth update and events
  useEffect(() => {
    if (Math.abs(depth - prevDepthRef.current) >= 0.2) {
      soundEngine.playTick();
      prevDepthRef.current = depth;
    }
  }, [depth]);

  useEffect(() => {
    if (isLossActive && !hasTriggeredCriticalSound.current && !isRemediated) {
      soundEngine.playCriticalAlert();
      hasTriggeredCriticalSound.current = true;
    }
  }, [isLossActive, isRemediated]);

  useEffect(() => {
    if (isRemediated && !hasTriggeredSuccessSound.current) {
      soundEngine.playSuccessChime();
      hasTriggeredSuccessSound.current = true;
    }
    if (!isRemediated) {
      hasTriggeredSuccessSound.current = false;
    }
  }, [isRemediated]);

  const toggleSound = () => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  };

  // Determine current stage (1 to 5)
  let currentStage = 1;
  let stageTitle = 'Stage 1: Bit Approaching Barail Main Sand Horizon (2842.0m)';
  let stageDescription = 'Telemetry normal. Bit at 2842m. eRTMAC algorithm is cross-referencing offset wells NHK-142 (2.3 km) and BBL-14 (1.8 km).';

  if (isRemediated) {
    currentStage = 5;
    stageTitle = 'Stage 5: ✅ Well Remediated — 100% Returns Restored, ₹18.5L NPT Avoided';
    stageDescription = 'Annular flow balanced at 560 gpm. Mud weight lowered to 9.85 ppg. Rig downtime avoided.';
  } else if (isLossActive || depth >= 2844.5) {
    currentStage = 3;
    stageTitle = 'Stage 3: 🚨 SEVERE LOST CIRCULATION ZONE ENCOUNTERED (2844.5m)';
    stageDescription = 'Active flow deficit detected (-120 gpm). Pit volume plummeting. Matches offset well NHK-142 total loss at 2845m!';
  } else if (depth >= 2843.2) {
    currentStage = 2;
    stageTitle = 'Stage 2: Drilling Break & Micro-fracture Seepage (2843.5m)';
    stageDescription = 'Bit encountering fracture boundary. ROP surges to 26 m/hr, torque rises, early seepage (-15 gpm) detected.';
  }

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-b from-[#0e182b] to-[#070d1a] border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/60 overflow-hidden transition-all duration-300">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-cyan-950/90 via-[#0a1b33] to-slate-900 border-b border-cyan-500/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-extrabold tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SIH DEMO SCENARIO
              </span>
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wide hidden sm:inline">
                OIL INDIA LIMITED · REAL-TIME DECISION SUPPORT
              </span>
            </div>
            <p className="text-[11px] text-cyan-200/80 mt-0.5">
              Automated Offset Well Correlation & Proactive Mud Loss Decision Support in Barail Formation
            </p>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
            }`}
            title={isMuted ? 'Unmute Audio Cues' : 'Mute Audio Cues'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[10px] hidden md:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs text-slate-300">
            <span className="text-[10px] text-slate-500 px-1 font-mono">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  simState.simulationSpeed === spd
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Fast-Forward to 2844.5m */}
          {!isLossActive && !isRemediated && depth < 2844.5 && (
            <button
              onClick={onFastForward}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              title="Skip straight to critical 2844.5m incident horizon"
            >
              <FastForward className="w-3 h-3 text-amber-300" />
              <span>Jump to 2844.5m (Incident)</span>
            </button>
          )}

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
            title="Reset scenario to 2842.0m"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset (2842m)</span>
          </button>

          {/* Stop Demo */}
          <button
            onClick={onStopDemo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium transition-colors"
            title="Exit Demo Scenario"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop Demo</span>
          </button>
        </div>
      </div>

      {/* Interactive 5-Step Storyline Bar */}
      <div className="bg-[#091122] px-4 py-2.5 border-b border-slate-800/80">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {[
            {
              step: 1,
              title: '1. Baseline Approach',
              desc: 'Depth 2842m · Normal ROP & Pit',
              active: currentStage === 1,
              completed: currentStage > 1,
            },
            {
              step: 2,
              title: '2. Drilling Break',
              desc: 'Depth 2843.5m · ROP 26 m/hr',
              active: currentStage === 2,
              completed: currentStage > 2,
            },
            {
              step: 3,
              title: '3. 🚨 Total Mud Loss',
              desc: 'Depth 2844.5m · -120 gpm deficit',
              active: currentStage === 3,
              completed: currentStage > 3,
              danger: true,
            },
            {
              step: 4,
              title: '4. AI Correlation',
              desc: 'Matched NHK-142 at 2845m (WCR P.42)',
              active: currentStage === 4 || currentStage === 3,
              completed: currentStage > 4,
            },
            {
              step: 5,
              title: '5. Remediated & Saved',
              desc: 'LCM Pill pumped · ₹18.5L saved',
              active: currentStage === 5,
              completed: currentStage === 5,
              success: true,
            },
          ].map((item) => (
            <div
              key={item.step}
              className={`p-2 rounded-lg border transition-all ${
                item.active
                  ? item.danger
                    ? 'bg-rose-950/50 border-rose-500 text-rose-200 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/50 animate-pulse'
                    : item.success
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40 shadow-lg'
                    : 'bg-cyan-950/50 border-cyan-400 text-cyan-100 ring-2 ring-cyan-500/30 shadow-md'
                  : item.completed
                  ? 'bg-slate-900/60 border-emerald-800/40 text-emerald-400/80'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] font-mono">{item.title}</span>
                {item.completed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {item.active && item.danger && <AlertTriangle className="w-3 h-3 text-rose-400" />}
              </div>
              <p className="text-[10px] mt-0.5 truncate text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Status Alert Banner */}
        <div
          className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
            isRemediated
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
              : isLossActive
              ? 'bg-rose-950/40 border-rose-500/80 text-rose-200 animate-pulse shadow-lg shadow-rose-950/50'
              : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {isRemediated ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : isLossActive ? (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            ) : (
              <Activity className="w-6 h-6 text-cyan-400 shrink-0 animate-pulse" />
            )}
            <div>
              <h3 className="font-bold text-sm tracking-wide font-display">{stageTitle}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{stageDescription}</p>
            </div>
          </div>

          {/* Quick Action Button for Stage */}
          {isLossActive && !isRemediated && (
            <button
              onClick={() => onPumpMitigation('45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.03] flex items-center gap-2 cursor-pointer border border-emerald-400/50"
            >
              <Droplet className="w-4 h-4 fill-current text-white animate-bounce" />
              <span>DEPLOY MITIGATION PILL NOW (NHK-142 RECIPE)</span>
            </button>
          )}

          {isRemediated && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                NPT SAVED: ₹18.5 LAKHS
              </span>
              <button
                onClick={onResetDemo}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Scenario</span>
              </button>
            </div>
          )}
        </div>

        {/* Side-by-Side Live Telemetry vs Offset Ground Truth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Left: Active Well Real-Time Telemetry */}
          <div className="bg-[#070e1c] border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Active Well NHK-Deep-504 Live Telemetry
              </span>
              <span className="font-mono text-cyan-300 text-[11px] font-bold">
                FORMATION: BARAIL MAIN SAND
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bit Depth</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {simState.currentDepth.toFixed(1)}m
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  TVD: {simState.tvd.toFixed(1)}m
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Flow In / Out</span>
                <span className="text-base font-bold font-mono text-slate-100">
                  {simState.flowIn} / {simState.flowOut}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold block ${
                    isLossActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  {isLossActive ? `Δ ${simState.flowOut - simState.flowIn} gpm (LOSS)` : 'Full Returns'}
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mud Weight</span>
                <span className="text-base font-bold font-mono text-amber-300">
                  {simState.mudWeight.toFixed(2)} ppg
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {isRemediated ? 'Lowered to 9.85 ppg' : 'Standard 10.3 ppg'}
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">ROP</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {simState.rop.toFixed(1)} m/hr
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {simState.rop > 24 ? 'Drilling break' : 'Smooth advance'}
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Torque</span>
                <span
                  className={`text-base font-bold font-mono ${
                    simState.torque > 20 ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {simState.torque.toFixed(1)} kft-lb
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {simState.torque > 20 ? 'Torque chatter' : 'Normal rotary'}
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pit Change</span>
                <span
                  className={`text-base font-bold font-mono ${
                    simState.pitVolumeChangeBbl < -1.0 ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {simState.pitVolumeChangeBbl.toFixed(1)} bbl
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Pit: {simState.pitVolumeBbl.toFixed(0)} bbl
                </span>
              </div>
            </div>
          </div>

          {/* Right: Matched Offset Well Historical Evidence (Ground Truth) */}
          <div className="bg-[#070e1c] border border-amber-500/40 p-4 rounded-xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Correlated Offset Ground Truth: Well NHK-142
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                2.3 KM DISTANCE
              </span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400">Historical Depth of Loss:</span>
                <strong className="text-cyan-300 font-mono">2,845.0m (Δ only +0.4m from current bit)</strong>
              </div>

              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400">Historical Incident:</span>
                <strong className="text-rose-400 font-mono">Total Lost Circulation (68 bbls in 12 min)</strong>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Verified Remediation in Well Completion Report (WCR Page 42):
                </span>
                <p className="text-slate-200 leading-relaxed">
                  "Pulled bit into 9-5/8" shoe at 2680m. Pumped 45 bbl engineered LCM squeeze pill containing 25 ppb coarse CaCO3, 15 ppb mica, and 10 ppb walnut shells. Lowered mud weight from 10.3 ppg to 9.85 ppg to stay below fracture breakdown pressure. Full returns restored."
                </p>
              </div>

              {/* Action Buttons for Offset Evidence */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onSelectWellByName('NHK-142')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium transition-colors"
                >
                  View NHK-142 Dossier &rarr;
                </button>

                <button
                  onClick={() =>
                    onNavigateTab('knowledge', {
                      query: 'What happened in Well NHK-142 at 2845m in Barail Main Sand?',
                    })
                  }
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-colors"
                >
                  Search in Knowledge Search &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

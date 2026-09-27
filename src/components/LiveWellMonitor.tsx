/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Square,
  FastForward,
  RotateCcw,
  Droplet,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { SimulationState } from '../types/index.js';

interface LiveWellMonitorProps {
  simState: SimulationState;
  onStartSimulation: (demoMode?: boolean, speed?: number) => void;
  onStopSimulation: () => void;
  onStepSimulation: (deltaM?: number) => void;
  onResetSimulation: (startDepth?: number) => void;
  onPumpMitigation: (pillType: string) => void;
}

export const LiveWellMonitor: React.FC<LiveWellMonitorProps> = ({
  simState,
  onStartSimulation,
  onStopSimulation,
  onStepSimulation,
  onResetSimulation,
  onPumpMitigation,
}) => {
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1.0);
  const [selectedPill, setSelectedPill] = useState<string>(
    '45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill'
  );

  const flowDelta = simState.flowOut - simState.flowIn;
  const isLossActive = flowDelta < -25 || simState.pitVolumeChangeBbl < -2.0;
  const isTorqueSpike = simState.torque >= 22.0;

  // Generate depth interval points for visual drilling log
  const currentDepth = simState.currentDepth;
  const logWindowStart = Math.max(2650, currentDepth - 80);
  const logWindowEnd = Math.min(3150, currentDepth + 40);

  return (
    <div className="space-y-6">
      {/* Top Controls Banner: Simulation & Rig Actions */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-100 font-display">
                eRTMAC Real-Time Telemetry Stream & Simulator
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                1-SEC STREAM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Correlating live surface/downhole WITS telemetry with offset wells in Barail Main Sand
            </p>
          </div>
        </div>

        {/* Playback & Step Controls */}
        <div className="flex items-center gap-2">
          {simState.isRunning ? (
            <button
              onClick={onStopSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE DRILLING</span>
            </button>
          ) : (
            <button
              onClick={() => onStartSimulation(false, selectedSpeed)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RESUME DRILLING</span>
            </button>
          )}

          <button
            onClick={() => onStepSimulation(1.0)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Advance bit by 1 meter"
          >
            <span>+1m STEP</span>
          </button>

          <button
            onClick={() => onStepSimulation(5.0)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Advance bit by 5 meters"
          >
            <span>+5m STEP</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  setSelectedSpeed(spd);
                  if (simState.isRunning) {
                    onStartSimulation(simState.isDemoMode, spd);
                  }
                }}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  selectedSpeed === spd
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => onResetSimulation(2835.0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset bit depth to 2835m"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Gauge 1: Measured Depth */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Bit Depth (MD)
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
              {simState.currentDepth.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 ml-1">m</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            TVD: <strong className="text-slate-300">{simState.tvd.toFixed(1)}m</strong>
          </div>
        </div>

        {/* Gauge 2: ROP */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Rate of Penetration
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {simState.rop.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 ml-1">m/hr</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Avg: 16.4 m/hr
          </div>
        </div>

        {/* Gauge 3: WOB & RPM */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            WOB / RPM
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {simState.wob.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">klb</span>
            <span className="text-slate-600">/</span>
            <span className="text-lg font-bold font-mono text-amber-300">
              {simState.rpm}
            </span>
            <span className="text-[10px] text-slate-400">RPM</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Rotary Drive: Active
          </div>
        </div>

        {/* Gauge 4: Torque */}
        <div
          className={`border rounded-xl p-3 shadow-md flex flex-col justify-between transition-colors ${
            isTorqueSpike
              ? 'bg-rose-950/20 border-rose-600/60'
              : 'bg-[#0c1424] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Top Drive Torque
            </span>
            {isTorqueSpike && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <div className="my-2">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                isTorqueSpike ? 'text-rose-400 animate-pulse' : 'text-slate-100'
              }`}
            >
              {simState.torque.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 ml-1">kft-lb</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {isTorqueSpike ? (
              <span className="text-rose-400 font-bold">Stick-Slip Drag Alert</span>
            ) : (
              'Baseline: ~14.5 kft-lb'
            )}
          </div>
        </div>

        {/* Gauge 5: Flow In / Out Balance */}
        <div
          className={`border rounded-xl p-3 shadow-md flex flex-col justify-between transition-colors ${
            isLossActive
              ? 'bg-rose-950/20 border-rose-600/60'
              : 'bg-[#0c1424] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Flow In / Out
            </span>
            {isLossActive && <TrendingDown className="w-3.5 h-3.5 text-rose-400 animate-bounce" />}
          </div>
          <div className="my-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-lg font-bold text-slate-100">{simState.flowIn}</span>
            <span className="text-slate-500 text-xs">/</span>
            <span
              className={`text-2xl font-bold ${
                isLossActive ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {simState.flowOut}
            </span>
            <span className="text-xs text-slate-400">gpm</span>
          </div>
          <div className="text-[11px] font-mono">
            {flowDelta < 0 ? (
              <span className="text-rose-400 font-semibold">
                Loss Deficit: {Math.abs(flowDelta)} gpm
              </span>
            ) : (
              <span className="text-emerald-400">Returns Balanced (100%)</span>
            )}
          </div>
        </div>

        {/* Gauge 6: Mud Weight & Pit Vol */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-3 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Mud Weight / Pit
          </span>
          <div className="my-2 flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-amber-400">
              {simState.mudWeight.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">ppg</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Pit: <strong className="text-slate-200">{simState.pitVolumeBbl.toFixed(0)} bbl</strong>{' '}
            {simState.pitVolumeChangeBbl < 0 && (
              <span className="text-rose-400 font-bold ml-1">
                ({simState.pitVolumeChangeBbl.toFixed(1)} bbl)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mitigation Action Panel: Engineered LCM Squeeze */}
      <div className="bg-[#0b1220] border border-cyan-900/60 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100">
              Proactive Field Mitigation Deployment
            </h3>
            <p className="text-xs text-slate-400">
              Trigger field-tested LCM pills or differential spotting fluids derived directly from offset well history
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPill}
            onChange={(e) => setSelectedPill(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill">
              45 bbl Engineered CaCO3 (25 ppb) + Mica (15 ppb) LCM Squeeze (NHK-142 Precedent)
            </option>
            <option value="50 bbl Bentonite-Diesel DOB Gunk Plug">
              50 bbl Bentonite-Diesel DOB Gunk Plug (JRN-17 Total Loss Precedent)
            </option>
            <option value="60 bbl Safe-Solv Low-Toxicity Soaking Fluid">
              60 bbl Safe-Solv Soaking Fluid & Downward Jarring (KNG-38 Stuck Pipe Precedent)
            </option>
          </select>

          <button
            onClick={() => onPumpMitigation(selectedPill)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>PUMP MITIGATION PILL NOW</span>
          </button>
        </div>
      </div>

      {/* Triple-Track Drilling Log & Wireline Correlation Cross Plot */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm font-display">
              Real-Time Triple-Track Drilling Telemetry Log & Stratigraphic Hazard Zone
            </h3>
            <p className="text-xs text-slate-400">
              Correlating current bit position with known historical loss & sticking depths in Barail Main Sand
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
              Active Bit ({currentDepth.toFixed(1)}m)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
              Historical Loss Zone (2842m - 2848m)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
              Stuck Pipe Zone (2860m)
            </span>
          </div>
        </div>

        {/* Visual Depth Strip / Triple Track Canvas Simulation */}
        <div className="relative bg-[#090e17] border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto">
          {/* Track Headers */}
          <div className="grid grid-cols-12 gap-2 text-[10px] text-slate-400 font-semibold border-b border-slate-800 pb-2 uppercase tracking-wider">
            <div className="col-span-2 text-center">Depth (MD)</div>
            <div className="col-span-3 text-cyan-300">Track 1: ROP (0 - 40 m/hr)</div>
            <div className="col-span-3 text-amber-300">Track 2: Torque (0 - 30 kft-lb)</div>
            <div className="col-span-4 text-emerald-300">Track 3: Flow Balance & Losses (gpm)</div>
          </div>

          {/* Depth Slices */}
          <div className="divide-y divide-slate-800/60 py-1">
            {[2810, 2825, 2835, 2842, 2845, 2848, 2855, 2860, 2870].map((d) => {
              const isAtCurrentBit = Math.abs(currentDepth - d) <= 4.0;
              const isHazardLoss = d >= 2842 && d <= 2848;
              const isHazardStuck = d === 2860;

              return (
                <div
                  key={d}
                  className={`grid grid-cols-12 gap-2 py-2 items-center transition-colors ${
                    isAtCurrentBit
                      ? 'bg-cyan-950/40 border-l-4 border-cyan-400 pl-2'
                      : isHazardLoss
                      ? 'bg-rose-950/15'
                      : isHazardStuck
                      ? 'bg-amber-950/15'
                      : 'hover:bg-slate-800/20'
                  }`}
                >
                  {/* Depth Column */}
                  <div className="col-span-2 flex items-center justify-between pr-2 border-r border-slate-800">
                    <span
                      className={`font-bold ${
                        isAtCurrentBit ? 'text-cyan-300 text-sm' : 'text-slate-400'
                      }`}
                    >
                      {d}m
                    </span>
                    {isAtCurrentBit && (
                      <span className="text-[9px] px-1 rounded bg-cyan-400 text-slate-950 font-extrabold uppercase">
                        BIT
                      </span>
                    )}
                  </div>

                  {/* Track 1: ROP */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            ((isAtCurrentBit
                              ? simState.rop
                              : d === 2845
                              ? 32
                              : 14) /
                              40) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-300 w-12 text-right">
                      {isAtCurrentBit
                        ? `${simState.rop.toFixed(1)}`
                        : d === 2845
                        ? '32.0'
                        : '14.5'}
                    </span>
                  </div>

                  {/* Track 2: Torque */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          d === 2845 || (isAtCurrentBit && simState.torque > 20)
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            ((isAtCurrentBit
                              ? simState.torque
                              : d === 2845
                              ? 26
                              : 14.5) /
                              30) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-300 w-14 text-right">
                      {isAtCurrentBit
                        ? `${simState.torque.toFixed(1)}`
                        : d === 2845
                        ? '26.2'
                        : '14.8'}
                    </span>
                  </div>

                  {/* Track 3: Flow & Offset Annotation */}
                  <div className="col-span-4 flex items-center justify-between text-[11px]">
                    {isHazardLoss ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        Historical Mud Loss (NHK-142: -68 bbls / JRN-17: 0 returns)
                      </span>
                    ) : isHazardStuck ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Differential Sticking Zone (KNG-38: 46 hrs NPT)
                      </span>
                    ) : (
                      <span className="text-slate-500">Nominal Permeable Sandstone Facies</span>
                    )}

                    <span className="text-slate-400 font-mono text-[10px]">
                      {isAtCurrentBit ? `${simState.flowOut} gpm` : '560 gpm'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

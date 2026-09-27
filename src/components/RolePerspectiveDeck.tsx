/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Compass,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Droplet,
  Layers,
  Activity,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Gauge,
  Flame,
  ArrowRight,
  Database,
  Radio,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { UserRole, SimulationState, Well } from '../types/index.js';

interface RolePerspectiveDeckProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  simState: SimulationState;
  activeWell: Well;
  onNavigateTab: (tab: string, context?: any) => void;
  onPumpMitigation: (pillType: string) => void;
  onStartDemo: () => void;
  onOpenAlerts: () => void;
}

export const RolePerspectiveDeck: React.FC<RolePerspectiveDeckProps> = ({
  currentRole,
  onRoleChange,
  simState,
  activeWell,
  onNavigateTab,
  onPumpMitigation,
  onStartDemo,
  onOpenAlerts,
}) => {
  const [ddrSigned, setDdrSigned] = useState(false);
  const [bopTestPassed, setBopTestPassed] = useState(true);
  const [tripSheetVerified, setTripSheetVerified] = useState(false);
  const [geologyPrognosisConfirmed, setGeologyPrognosisConfirmed] = useState(false);

  // Role Configuration Metadata
  const rolesConfig = [
    {
      id: 'DRILLING_ENGINEER' as UserRole,
      title: 'Drilling Engineer',
      subtitle: 'Rig Operations & Bit Hydraulics',
      icon: Wrench,
      accent: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20',
      activeBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'GEOLOGIST' as UserRole,
      title: 'Geologist',
      subtitle: 'Stratigraphy & Subsurface Gas',
      icon: Compass,
      accent: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
      activeBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      id: 'ADMIN' as UserRole,
      title: 'Drilling Admin',
      subtitle: 'Superintendent & Fleet Executive',
      icon: ShieldCheck,
      accent: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20',
      activeBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'VIEWER' as UserRole,
      title: 'Operations Viewer',
      subtitle: 'Read-Only Monitoring & Telemetry',
      icon: Eye,
      accent: 'border-slate-500/50 text-slate-300 bg-slate-900/40',
      activeBadge: 'bg-slate-700/40 text-slate-300 border-slate-600',
    },
  ];

  return (
    <div className="mb-6 bg-[#0c1424] border border-slate-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300">
      {/* Role Selector Header Bar */}
      <div className="bg-[#080d19] border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400">
            ACTIVE OPERATIONAL ROLE PERSPECTIVE:
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
              currentRole === 'DRILLING_ENGINEER'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : currentRole === 'GEOLOGIST'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : currentRole === 'ADMIN'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {currentRole === 'DRILLING_ENGINEER' && 'DRILLING ENGINEER COMMAND DECK'}
            {currentRole === 'GEOLOGIST' && 'OPERATIONS GEOLOGIST SUBSURFACE DECK'}
            {currentRole === 'ADMIN' && 'DRILLING SUPERINTENDENT / ADMIN DECK'}
            {currentRole === 'VIEWER' && 'OPERATIONS VIEWER TELEMETRY DECK'}
          </span>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">
            Switch Perspective:
          </span>
          {rolesConfig.map((role) => {
            const Icon = role.icon;
            const isCurrent = currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? `${role.activeBadge} shadow-md`
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                }`}
                title={`Switch to ${role.title} (${role.subtitle})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{role.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Content Body */}
      <div className="p-4 sm:p-5">
        {/* ======================================================== */}
        {/* 1. DRILLING ENGINEER PERSPECTIVE                         */}
        {/* ======================================================== */}
        {currentRole === 'DRILLING_ENGINEER' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-slate-100 text-sm font-display">
                    Drilling Engineer Command Deck — Mechanical & Hydraulics Telemetry
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    REAL-TIME BIT MECHANICS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Optimized for rig floor drilling supervisors, monitoring WOB, ROP, torque spikes, differential sticking margins, and mud loss hydraulics.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('live-well')}
                  className="px-3 py-1.5 rounded bg-cyan-600/90 hover:bg-cyan-500 text-white font-medium text-xs shadow flex items-center gap-1.5 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Open Full Rig Gauges</span>
                </button>
                <button
                  onClick={() => onNavigateTab('risk')}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Risk Intelligence</span>
                </button>
              </div>
            </div>

            {/* Quick Live Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Bit Depth (MD)
                </span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {simState.currentDepth.toFixed(1)}m
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  TVD: {simState.tvd.toFixed(1)}m
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  ROP
                </span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {simState.rop.toFixed(1)} <span className="text-xs text-slate-400 font-normal">m/hr</span>
                </span>
                <span className="text-[10px] text-slate-500 block">Formation: Barail</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  WOB & RPM
                </span>
                <span className="text-lg font-bold font-mono text-amber-300">
                  {simState.wob.toFixed(1)} <span className="text-xs text-slate-400 font-normal">klb</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Rotary: {simState.rpm} RPM
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Torque
                </span>
                <span className={`text-lg font-bold font-mono ${simState.torque > 18 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                  {simState.torque.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kft-lb</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {simState.torque > 18 ? 'Torque Warning' : 'Normal smooth'}
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Mud Weight / ECD
                </span>
                <span className="text-lg font-bold font-mono text-cyan-300">
                  {simState.mudWeight.toFixed(2)} <span className="text-xs text-slate-400 font-normal">ppg</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  ECD: {(simState.mudWeight + 0.35).toFixed(2)} ppg
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Flow In / Out
                </span>
                <span className="text-lg font-bold font-mono text-slate-200">
                  {simState.flowIn} / {simState.flowOut}
                </span>
                <span className={`text-[10px] block font-mono font-semibold ${
                  simState.flowOut < simState.flowIn - 50 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {simState.flowOut < simState.flowIn - 50 ? `Δ -${simState.flowIn - simState.flowOut} gpm (Loss)` : 'Balanced Returns'}
                </span>
              </div>
            </div>

            {/* Engineer Operational Quick Action Bar */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Immediate Drilling Engineer Protocols:
                </span>
                <button
                  onClick={() => setTripSheetVerified(!tripSheetVerified)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                    tripSheetVerified
                      ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tripSheetVerified ? '✓ Trip Sheet Verified' : 'Verify Trip Sheet'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPumpMitigation('45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill')}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow flex items-center gap-1.5 transition-colors"
                  title="Deploy 45 bbl CaCO3 + Mica Pill proven in offset well NHK-142"
                >
                  <Droplet className="w-3.5 h-3.5 fill-current" />
                  <span>Pump Engineered LCM Pill (NHK-142 Recipe)</span>
                </button>
                <button
                  onClick={() => onNavigateTab('events')}
                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1"
                >
                  <span>Historical Sticking Precedents</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. GEOLOGIST PERSPECTIVE                                 */}
        {/* ======================================================== */}
        {currentRole === 'GEOLOGIST' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-slate-100 text-sm font-display">
                    Operations Geologist Subsurface & Stratigraphy Deck
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    STRATIGRAPHY & PORE PRESSURE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stratigraphic formation tops correlation, lithology logs, hydrocarbon gas chromatograph, and fault throw tracking in Nahorkatiya Field.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('gis-map')}
                  className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs shadow flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Nearby Wells GIS Correlation</span>
                </button>
                <button
                  onClick={() => onNavigateTab('documents')}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Geological Reports</span>
                </button>
              </div>
            </div>

            {/* Geological Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Lithological Column */}
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Lithology at {simState.currentDepth.toFixed(0)}m
                  </span>
                  <span className="text-amber-400 font-mono text-[10px] font-bold">Barail Sand</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Porous Sandstone (Reservoir Facies)</span>
                    <strong className="text-amber-300 font-mono">65%</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '65%' }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Carbonaceous Shale / Siltstone</span>
                    <strong className="text-cyan-300 font-mono">25%</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '25%' }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Coal Streaks & Siderite Nodules</span>
                    <strong className="text-slate-400 font-mono">10%</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80">
                  <strong className="text-amber-300">Pore Pressure:</strong> 9.85 ppg equiv.
                  <br />
                  <strong className="text-rose-400">Overbalance:</strong> {(simState.mudWeight - 9.85).toFixed(2)} ppg (Risk of differential sticking above 1.2 ppg).
                </div>
              </div>

              {/* Hydrocarbon Gas Chromatography */}
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Mud Gas & Chromatograph
                  </span>
                  <span className="text-rose-400 font-mono text-[10px] font-bold">
                    {simState.gasUnits} Gas Units
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">C1 (Methane)</span>
                    <span className="font-mono text-cyan-300 font-bold text-sm">82.4%</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">C2 (Ethane)</span>
                    <span className="font-mono text-emerald-300 font-bold text-sm">11.2%</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">C3 (Propane)</span>
                    <span className="font-mono text-amber-300 font-bold text-sm">4.5%</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">C4 - C5 (Heavy)</span>
                    <span className="font-mono text-rose-300 font-bold text-sm">1.9%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-emerald-400 font-semibold">Hydrocarbon Show:</span> Good oil/condensate fluorescence in sandstone cuttings; no H2S detected in flowline.
                </div>
              </div>

              {/* Stratigraphic Formation Tops Comparison */}
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Formation Tops vs Offset Prognosis
                </span>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800/60">
                    <div>
                      <span className="font-semibold text-slate-200">Tipam Sandstone</span>
                      <span className="text-slate-500 block text-[10px]">Prog: 1,820m · Act: 1,815m</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">Δ -5m (High)</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800/60">
                    <div>
                      <span className="font-semibold text-slate-200">Girujan Clay</span>
                      <span className="text-slate-500 block text-[10px]">Prog: 2,340m · Act: 2,345m</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">Δ +5m (Matched)</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800/60">
                    <div>
                      <span className="font-semibold text-slate-200">Barail Main Sand</span>
                      <span className="text-slate-500 block text-[10px]">Prog: 2,800m · Act: 2,804m</span>
                    </div>
                    <span className="font-mono text-amber-300 font-bold">Current Target</span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded bg-rose-950/20 border border-rose-800/40 text-rose-300">
                    <div>
                      <span className="font-semibold">Kopili Shale (Danger)</span>
                      <span className="text-slate-400 block text-[10px]">Expected: 3,180m</span>
                    </div>
                    <span className="font-mono font-bold">Overpressure Ahead</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Geologist Action Strip */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGeologyPrognosisConfirmed(!geologyPrognosisConfirmed)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                    geologyPrognosisConfirmed
                      ? 'bg-amber-950/40 border-amber-600/60 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {geologyPrognosisConfirmed ? '✓ Stratigraphic Tops Verified' : 'Confirm Stratigraphic Prognosis'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('knowledge')}
                  className="px-3 py-1.5 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Search Historical Mud Loss in Barail Main Sand</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. DRILLING ADMIN (SUPERINTENDENT) PERSPECTIVE            */}
        {/* ======================================================== */}
        {currentRole === 'ADMIN' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm font-display">
                    Drilling Superintendent & Rig Fleet Executive Deck
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    EXECUTIVE OVERSIGHT & HSE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-level rig operations oversight, Non-Productive Time (NPT) financial impact, well control compliance, and Daily Drilling Report sign-off.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onStartDemo}
                  className="px-3 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Run SIH Demo Scenario</span>
                </button>
                <button
                  onClick={() => onNavigateTab('analytics')}
                  className="px-3 py-1.5 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-xs shadow flex items-center gap-1.5 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Field NPT Analytics</span>
                </button>
              </div>
            </div>

            {/* Admin Key Operational KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                  <span>Rig Operational Uptime</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">98.4%</span>
                <span className="text-[10px] text-slate-500 font-mono">Rig OIL-RIG-E2000 (2000 HP)</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                  <span>Target Schedule AFE</span>
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-xl font-bold font-mono text-cyan-400 block mt-1">+14 Days</span>
                <span className="text-[10px] text-slate-500">Ahead of planned drilling curve</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                  <span>Proactive Savings</span>
                  <span className="text-amber-400 font-bold">₹</span>
                </div>
                <span className="text-xl font-bold font-mono text-amber-300 block mt-1">₹18.5 Lakhs</span>
                <span className="text-[10px] text-slate-500">NPT avoided via early warnings</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                  <span>HSE & Well Control</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">100% READY</span>
                <span className="text-[10px] text-slate-500">BOP Stack 10k psi Certified</span>
              </div>
            </div>

            {/* Admin Regulatory & Sign-Off Actions */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <strong className="text-slate-100">
                    Daily Drilling Report (DDR) #OIL-DDR-2026-084:
                  </strong>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ddrSigned
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {ddrSigned ? 'SIGNED & APPROVED' : 'PENDING SUPERINTENDENT SIGNATURE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Interval 2,804m - 2,835m drilled in Barail Main Sand. Mud weight 10.3 ppg maintained. No lost time injuries (LTI).
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!ddrSigned ? (
                  <button
                    onClick={() => setDdrSigned(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Sign DDR #084</span>
                  </button>
                ) : (
                  <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Signed by Operations Superintendent</span>
                  </span>
                )}
                <button
                  onClick={() => onNavigateTab('documents')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs"
                >
                  View Document Center
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. OPERATIONS VIEWER PERSPECTIVE                          */}
        {/* ======================================================== */}
        {currentRole === 'VIEWER' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-300" />
                  <h3 className="font-bold text-slate-100 text-sm font-display">
                    Operations Viewer & Field Observer Deck (Read-Only)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    READ-ONLY MODE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  General real-time situational awareness view for off-site engineers, partner representatives, and regulatory observers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('gis-map')}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700"
                >
                  Inspect Nearby Wells
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Well Status</span>
                <span className="text-emerald-400 font-bold text-sm">Active Drilling</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Current Depth</span>
                <span className="text-cyan-400 font-bold font-mono text-sm">{simState.currentDepth.toFixed(1)}m</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Target Stratum</span>
                <span className="text-amber-300 font-bold text-sm">Barail Main Sand</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Overall Risk</span>
                <span className="text-amber-400 font-bold text-sm">{simState.overallRiskLevel}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

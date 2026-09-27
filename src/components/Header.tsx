/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  Play,
  Square,
  Radio,
  User,
  Shield,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { SimulationState, UserRole } from '../types/index.js';

interface HeaderProps {
  simState: SimulationState;
  onStartDemo: () => void;
  onStopSimulation: () => void;
  onResetSimulation: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  simState,
  onStartDemo,
  onStopSimulation,
  onResetSimulation,
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onOpenAlerts,
}) => {
  const activeAlertsCount = simState.activeAlerts.filter((a) => a.status === 'ACTIVE').length;
  const hasCriticalAlert = simState.activeAlerts.some(
    (a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE'
  );

  return (
    <header className="sticky top-0 z-40 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner / Rig Status */}
      <div className="px-4 py-2 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-[10px] text-slate-950 shadow-sm">
              OIL
            </div>
            <div>
              <span className="font-semibold text-slate-200 tracking-wide">OIL INDIA LIMITED</span>
              <span className="text-slate-500 ml-2">eRTMAC-NWIS · Real-Time Decision Support</span>
            </div>
          </div>

          <span className="text-slate-700">|</span>

          {/* Active Well Telemetry Quick Look */}
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              NHK-Deep-504
            </span>
            <span className="text-slate-400">
              MD: <strong className="text-slate-100">{simState.currentDepth.toFixed(1)}m</strong>
            </span>
            <span className="text-slate-400">
              TVD: <strong className="text-slate-100">{simState.tvd.toFixed(1)}m</strong>
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Stratum: <strong className="text-amber-400">{simState.formation}</strong>
            </span>
            <span className="text-slate-400 hidden md:inline">
              Rig: <strong className="text-slate-200">OIL-RIG-E2000</strong>
            </span>
          </div>
        </div>

        {/* Right Actions: Demo Mode Button, Alerts, Role Selector */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>eRTMAC TELEMETRY LIVE</span>
          </div>

          {/* Demo Mode Button */}
          {simState.isRunning && simState.isDemoMode ? (
            <button
              onClick={onStopSimulation}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-600/90 hover:bg-rose-600 text-white font-medium text-xs shadow transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP DEMO</span>
            </button>
          ) : (
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-950/50 transition-all hover:scale-[1.02]"
              title="Activate full end-to-end scenario: approaches historical 2845m mud loss zone, triggers proactive alert, displays offset evidence"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>RUN SIH DEMO SCENARIO</span>
            </button>
          )}

          <button
            onClick={onResetSimulation}
            className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset active well to 2835m"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Active Alerts Trigger */}
          <button
            onClick={onOpenAlerts}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold transition-all ${
              hasCriticalAlert
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-pulse shadow-md shadow-rose-900/30'
                : activeAlertsCount > 0
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{activeAlertsCount} ALERTS</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300">
            <Shield className="w-3 h-3 text-cyan-400" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="DRILLING_ENGINEER" className="bg-slate-900">
                Drilling Engineer
              </option>
              <option value="GEOLOGIST" className="bg-slate-900">
                Geologist
              </option>
              <option value="ADMIN" className="bg-slate-900">
                Drilling Admin
              </option>
              <option value="VIEWER" className="bg-slate-900">
                Operations Viewer
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 flex items-center gap-1 overflow-x-auto text-xs no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'live-well', label: 'Live Well Monitor' },
          { id: 'gis-map', label: 'Nearby Wells (GIS)' },
          { id: 'events', label: 'Historical Events' },
          { id: 'risk', label: 'Risk Intelligence' },
          { id: 'knowledge', label: 'Knowledge Search' },
          { id: 'documents', label: 'Document Center' },
          { id: 'analytics', label: 'Field Analytics' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2.5 font-medium transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

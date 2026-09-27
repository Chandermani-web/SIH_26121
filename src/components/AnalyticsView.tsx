/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  Clock,
  IndianRupee,
  Layers,
  ShieldCheck,
  PieChart,
} from 'lucide-react';
import { api } from '../services/apiService.js';

interface AnalyticsViewProps {
  onNavigateTab?: (tab: string, context?: any) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<{
    totalOffsetWellsMonitored: number;
    activeWellsDrilling: number;
    totalHistoricalEventsLogged: number;
    totalHistoricalNptHours: number;
    totalCostImpactInrLakhs: number;
    eventTypeBreakdown: Record<string, number>;
    formationHazardCounts: Record<string, number>;
    topMitigations: { name: string; successRate: string; frequency: number }[];
  } | null>(null);

  useEffect(() => {
    api.getAnalyticsSummary().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading Field Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h2 className="text-base font-bold text-slate-100 font-display">
          Field Operational Analytics & Historical Lessons Learned
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Quantitative post-drilling analysis across 16 historical offset wells in Upper Assam Basin (Nahorkatiya, Moran, Kusijan, Jorajan, Baghjan)
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Offset Wells Indexed
            </span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {data.totalOffsetWellsMonitored} Wells
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            6 Mining Leases / Fields
          </span>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Total Recorded NPT
            </span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {data.totalHistoricalNptHours} Hours
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Non-Productive Downtime
          </span>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Historical Cost Impact
            </span>
            <span className="font-bold text-amber-400 text-sm">₹</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            ₹{data.totalCostImpactInrLakhs} Lakhs
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Remediation & Rig Spread
          </span>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Logged Incidents
            </span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {data.totalHistoricalEventsLogged} Events
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            With Document References
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Incident Frequency by Event Type */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-display">
            Historical Incident Distribution by Event Type
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(data.eventTypeBreakdown).map(([type, count]) => {
              const maxCount = Math.max(...Object.values(data.eventTypeBreakdown));
              const pct = (count / maxCount) * 100;
              return (
                <div
                  key={type}
                  onClick={() => onNavigateTab && onNavigateTab('events', { eventType: type })}
                  className="space-y-1 text-xs font-mono cursor-pointer hover:bg-slate-900/60 p-1.5 rounded transition-colors"
                  title={`View all ${type} incidents in Historical Events Explorer`}
                >
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold text-cyan-300 hover:underline">{type}</span>
                    <span>{count} events &rarr;</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        type === 'MUD_LOSS'
                          ? 'bg-rose-500'
                          : type === 'STUCK_PIPE'
                          ? 'bg-amber-500'
                          : type === 'KICK'
                          ? 'bg-red-600'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hazard Breakdown by Formation */}
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-display">
            Hazard Distribution by Geological Formation
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(data.formationHazardCounts).map(([form, count]) => {
              const maxCount = Math.max(...Object.values(data.formationHazardCounts));
              const pct = (count / maxCount) * 100;
              return (
                <div
                  key={form}
                  onClick={() => onNavigateTab && onNavigateTab('events', { formation: form })}
                  className="space-y-1 text-xs font-mono cursor-pointer hover:bg-slate-900/60 p-1.5 rounded transition-colors"
                  title={`Filter events for ${form}`}
                >
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold truncate max-w-xs text-amber-300 hover:underline">{form}</span>
                    <span>{count} incidents &rarr;</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Proven Mitigations Table */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-100 font-display flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Field-Validated Engineering Mitigations & Historical Success Rates
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090f1d] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Mitigation Treatment / Protocol</th>
                <th className="px-4 py-2.5">Application Count</th>
                <th className="px-4 py-2.5">Success Rate</th>
                <th className="px-4 py-2.5">Primary Target Hazard</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {data.topMitigations.map((mit, i) => (
                <tr key={i} className="hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-sans font-medium text-slate-100">{mit.name}</td>
                  <td className="px-4 py-3 text-cyan-300">{mit.frequency} operations</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-800/30">
                      {mit.successRate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-sans">
                    {i === 0
                      ? 'Severe Lost Circulation (Barail)'
                      : i === 1
                      ? 'Differential Sticking'
                      : i === 2
                      ? 'Micro-Fracture Inception'
                      : 'Reactive Swelling Clay (Girujan)'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {onNavigateTab && (
                      <button
                        onClick={() =>
                          onNavigateTab('knowledge', {
                            query: `Mitigation procedure and effectiveness for: ${mit.name}`,
                          })
                        }
                        className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-sans font-semibold transition-colors"
                      >
                        Search Knowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

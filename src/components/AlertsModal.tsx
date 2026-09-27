/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, X, ChevronRight, Droplet, ArrowRight } from 'lucide-react';
import { ActiveAlert } from '../types/index.js';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: ActiveAlert[];
  onAcknowledge: (alertId: string) => void;
  onApplyMitigation: (pillType: string) => void;
  onNavigateTab?: (tab: string, context?: any) => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onApplyMitigation,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[85vh] bg-[#0c1424] border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-semibold text-base text-slate-100 font-display">
                Active Drilling Alerts & Proactive Mitigations
              </h2>
              <p className="text-xs text-slate-400">
                Decision support alerts triggered by real-time depth correlation against historical offset wells
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
              <p className="font-medium text-slate-300">All Nominal — No Active Hazards Detected</p>
              <p className="text-xs text-slate-500 mt-1">
                Active well is within safe operating parameters relative to historical offset records.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-600/50 shadow-lg shadow-rose-950/30'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-950/20 border-amber-600/40'
                      : 'bg-slate-800/40 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {alert.severity} · {alert.alertType}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Bit Depth: {alert.depth.toFixed(1)}m
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-100 mt-2 text-sm">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {alert.message}
                  </p>

                  {/* Evidence Box */}
                  <div className="mt-3 p-3 rounded bg-slate-900/80 border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold uppercase tracking-wider text-slate-300">
                        Historical Precedent Evidence:
                      </span>
                      <span>Formation: <strong className="text-cyan-400">{alert.evidence.formation}</strong></span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-500">Correlated Wells: </span>
                        <span className="font-semibold text-amber-300">{alert.evidence.historicalWells.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Historical Loss Depths: </span>
                        <span className="font-mono text-slate-200">{alert.evidence.historicalDepths.map((d) => `${d}m`).join(', ')}</span>
                      </div>
                      <div className="sm:col-span-2 text-slate-400 text-[11px]">
                        <span>Source Document: </span>
                        <span className="text-slate-200 font-mono">{alert.evidence.sourceDoc} (Page {alert.evidence.page})</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Field Mitigation */}
                  <div className="mt-3 p-3 rounded bg-cyan-950/30 border border-cyan-800/40 text-xs">
                    <span className="font-semibold text-cyan-300 block mb-1">
                      Recommended Engineering Mitigation (Derived from Historical Precedents):
                    </span>
                    <p className="text-slate-200 leading-relaxed">
                      {alert.recommendedMitigation}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-500 italic">
                      *Decision Support: Operational decision rests with the drilling engineer.
                    </div>

                    <div className="flex items-center gap-2">
                      {onNavigateTab && (
                        <>
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateTab('documents', { query: alert.evidence.sourceDoc });
                            }}
                            className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                          >
                            Source Document
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateTab('knowledge', { query: `Mitigation for ${alert.title}` });
                            }}
                            className="px-2.5 py-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/40 text-xs transition-colors"
                          >
                            Search Knowledge
                          </button>
                        </>
                      )}

                      {alert.alertType === 'MUD_LOSS' && (
                        <button
                          onClick={() => {
                            onApplyMitigation('45 bbl Engineered CaCO3 + Mica LCM Squeeze Pill');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow transition-colors"
                        >
                          <Droplet className="w-3.5 h-3.5" />
                          <span>PUMP LCM SQUEEZE PILL</span>
                        </button>
                      )}

                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                        >
                          ACKNOWLEDGE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Active Wells Monitored: NHK-Deep-504</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

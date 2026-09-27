/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  X,
  Compass,
  FileText,
  AlertTriangle,
  Layers,
  Calendar,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Well, HistoricalEvent, TechnicalDocument } from '../types/index.js';
import { api } from '../services/apiService.js';

interface WellDetailModalProps {
  well: Well | null;
  onClose: () => void;
  onOpenDocument?: (docId: string) => void;
  onNavigateTab?: (tab: string, context?: any) => void;
}

export const WellDetailModal: React.FC<WellDetailModalProps> = ({
  well,
  onClose,
  onOpenDocument,
  onNavigateTab,
}) => {
  const [details, setDetails] = useState<{
    events: HistoricalEvent[];
    documents: TechnicalDocument[];
  } | null>(null);

  useEffect(() => {
    if (!well) return;
    api.getWellDetails(well.id).then((res) => {
      setDetails({
        events: res.events,
        documents: res.documents,
      });
    });
  }, [well]);

  if (!well) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#0c1424] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Historical Offset Well Dossier: {well.wellName}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                {well.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Field: {well.field} · Block: {well.block} · Operator: {well.operator}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Total Depth</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{well.totalDepth}m</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Target Stratum</span>
              <span className="font-semibold text-amber-300">{well.targetFormation}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Surface Coordinates</span>
              <span className="font-mono text-slate-200 text-[11px] block mt-0.5">
                {well.latitude.toFixed(4)}° N, {well.longitude.toFixed(4)}° E
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Spud Date</span>
              <span className="font-mono text-slate-200">{well.spudDate}</span>
            </div>
          </div>

          {/* Historical Events Logged */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Historical Operational Incidents & Hazards on Record ({details?.events.length || 0})
            </h3>

            {!details || details.events.length === 0 ? (
              <p className="text-slate-500 italic p-3 bg-slate-900 rounded-lg">
                No major NPT or critical failure incidents logged in archived completion report.
              </p>
            ) : (
              <div className="space-y-3">
                {details.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            evt.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {evt.eventType} ({evt.severity})
                        </span>
                        <strong className="text-slate-100 text-sm">Depth: {evt.depth}m</strong>
                        <span className="text-amber-300">({evt.formationName})</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[11px]">
                        NPT: <strong className="text-rose-400">{evt.nptHours} hrs</strong>
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {evt.description}
                    </p>

                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                      <div>
                        <span className="text-rose-400 font-semibold">Root Cause: </span>
                        <span className="text-slate-300">{evt.rootCause}</span>
                      </div>
                      <div>
                        <span className="text-cyan-300 font-semibold">Applied Mitigation: </span>
                        <span className="text-slate-200">{evt.mitigation}</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 pt-1 flex items-center justify-between">
                      <span>Source: {evt.sourceDocumentName} (pg. {evt.sourcePageNumber})</span>
                      <span>MW at event: {evt.mudWeightUsed} ppg</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Casing Program */}
          {well.casingProgram && well.casingProgram.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Casing & Hole Program
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                  <thead className="bg-[#090f1d] text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2">Casing String</th>
                      <th className="px-3 py-2">Size (Inch)</th>
                      <th className="px-3 py-2">Shoe Depth (m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    {well.casingProgram.map((c, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-sans font-medium text-slate-200">{c.casingType}</td>
                        <td className="px-3 py-2 text-cyan-300">{c.sizeInch}"</td>
                        <td className="px-3 py-2 font-bold">{c.depthM}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('events', { wellId: well.id });
                  }}
                  className="px-3 py-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors"
                >
                  View Historical Incidents ({details?.events.length || 0})
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('knowledge', { query: `Historical incidents and mud weights in ${well.wellName}` });
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                >
                  Search in Knowledge Search
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('documents', { query: well.wellName });
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                >
                  Well Documents
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

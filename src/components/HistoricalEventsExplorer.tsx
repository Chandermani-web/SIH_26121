/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
} from 'lucide-react';
import { HistoricalEvent, EventSeverity, EventType } from '../types/index.js';

interface HistoricalEventsExplorerProps {
  events: HistoricalEvent[];
  wells: { id: string; wellName: string }[];
  formations: { id: string; name: string }[];
  initialWellId?: string;
  initialEventType?: string;
  onNavigateTab?: (tab: string, context?: any) => void;
  onSelectWellById?: (wellId: string) => void;
}

export const HistoricalEventsExplorer: React.FC<HistoricalEventsExplorerProps> = ({
  events,
  wells,
  formations,
  initialWellId = 'ALL',
  initialEventType = 'ALL',
  onNavigateTab,
  onSelectWellById,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWellId, setSelectedWellId] = useState(initialWellId);
  const [selectedEventType, setSelectedEventType] = useState(initialEventType);
  const [selectedFormation, setSelectedFormation] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [minDepth, setMinDepth] = useState<number | ''>('');
  const [maxDepth, setMaxDepth] = useState<number | ''>('');
  const [selectedEventForModal, setSelectedEventForModal] = useState<HistoricalEvent | null>(null);

  React.useEffect(() => {
    if (initialWellId) setSelectedWellId(initialWellId);
  }, [initialWellId]);

  React.useEffect(() => {
    if (initialEventType) setSelectedEventType(initialEventType);
  }, [initialEventType]);

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (selectedWellId !== 'ALL' && e.wellId !== selectedWellId) return false;
    if (selectedEventType !== 'ALL' && e.eventType !== selectedEventType) return false;
    if (selectedFormation !== 'ALL' && !e.formationName.toLowerCase().includes(selectedFormation.toLowerCase()))
      return false;
    if (selectedSeverity !== 'ALL' && e.severity !== selectedSeverity) return false;
    if (minDepth !== '' && e.depth < Number(minDepth)) return false;
    if (maxDepth !== '' && e.depth > Number(maxDepth)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        e.description.toLowerCase().includes(q) ||
        e.rootCause.toLowerCase().includes(q) ||
        e.mitigation.toLowerCase().includes(q) ||
        e.wellName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">
              Historical Drilling Events & Lessons Learned Explorer
            </h2>
            <p className="text-xs text-slate-400">
              Query 65+ operational incidents across Upper Assam offset wells to extract proven mitigation precedents
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            {filteredEvents.length} Incidents Found
          </span>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Free Text Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search description, root cause, mitigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Event Types</option>
              <option value="MUD_LOSS">MUD_LOSS (Lost Circulation)</option>
              <option value="STUCK_PIPE">STUCK_PIPE (Sticking)</option>
              <option value="KICK">KICK (Influx)</option>
              <option value="OVERPRESSURE">OVERPRESSURE</option>
              <option value="TORQUE_SPIKE">TORQUE_SPIKE</option>
              <option value="CEMENTING_ISSUE">CEMENTING_ISSUE</option>
              <option value="NPT">NPT</option>
              <option value="FISHING">FISHING</option>
            </select>
          </div>

          {/* Well Selector */}
          <div>
            <select
              value={selectedWellId}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Offset Wells</option>
              {wells.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.wellName}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Formation Filter */}
          <div>
            <select
              value={selectedFormation}
              onChange={(e) => setSelectedFormation(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Formations</option>
              {formations.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090f1d] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Incident Type</th>
                <th className="px-4 py-3">Well & Field</th>
                <th className="px-4 py-3">Depth (m)</th>
                <th className="px-4 py-3">Formation</th>
                <th className="px-4 py-3">Description & Cause</th>
                <th className="px-4 py-3">NPT / Cost</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredEvents.map((evt) => {
                const isCrit = evt.severity === 'CRITICAL';
                const isHigh = evt.severity === 'HIGH';

                return (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEventForModal(evt)}
                    className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                            isCrit
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-100">
                      {evt.wellName}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-cyan-300">
                      {evt.depth.toFixed(1)}m
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-amber-300">
                      {evt.formationName}
                    </td>

                    <td className="px-4 py-3 max-w-md">
                      <p className="line-clamp-2 text-slate-300 leading-snug">
                        {evt.description}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                      <div>
                        {evt.nptHours > 0 ? (
                          <span className="text-rose-400 font-bold">{evt.nptHours} hrs NPT</span>
                        ) : (
                          <span className="text-slate-500">0 hrs</span>
                        )}
                      </div>
                      <div className="text-slate-500">₹{evt.costImpactInrLakhs} Lakhs</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-cyan-400 hover:text-cyan-300 font-medium">
                        View Dossier &rarr;
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedEventForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0c1424] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-200">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                    selectedEventForModal.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {selectedEventForModal.severity} · {selectedEventForModal.eventType}
                </span>
                <span className="font-bold text-slate-100">
                  {selectedEventForModal.wellName} at {selectedEventForModal.depth}m
                </span>
              </div>
              <button
                onClick={() => setSelectedEventForModal(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                  Incident Description
                </h4>
                <p className="text-slate-200 mt-1 leading-relaxed text-sm">
                  {selectedEventForModal.description}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40">
                <h4 className="text-rose-400 uppercase tracking-wider text-[10px] font-semibold">
                  Root Cause Analysis
                </h4>
                <p className="text-slate-200 mt-1 leading-relaxed">
                  {selectedEventForModal.rootCause}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
                <h4 className="text-cyan-300 uppercase tracking-wider text-[10px] font-semibold">
                  Historical Mitigation Applied & Result
                </h4>
                <p className="text-slate-200 mt-1 leading-relaxed">
                  {selectedEventForModal.mitigation}
                </p>
              </div>

              {/* Drilling Parameters at Incident */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <h4 className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold mb-2">
                  Parameters at Time of Incident
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">WOB:</span>
                    <strong>{selectedEventForModal.drillingParametersAtIncident.wob} klb</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">RPM:</span>
                    <strong>{selectedEventForModal.drillingParametersAtIncident.rpm}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Torque:</span>
                    <strong>{selectedEventForModal.drillingParametersAtIncident.torque} kft-lb</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Flow Rate:</span>
                    <strong>{selectedEventForModal.drillingParametersAtIncident.flowRate} gpm</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Mud Weight:</span>
                    <strong>{selectedEventForModal.mudWeightUsed} ppg</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ECD:</span>
                    <strong>{selectedEventForModal.ecd} ppg</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">NPT Duration:</span>
                    <strong className="text-rose-400">{selectedEventForModal.nptHours} hours</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cost Impact:</span>
                    <strong className="text-rose-400">₹{selectedEventForModal.costImpactInrLakhs} L</strong>
                  </div>
                </div>
              </div>

              {/* Source Document Citation */}
              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Verified Source: <strong className="text-slate-200">{selectedEventForModal.sourceDocumentName}</strong> (Page {selectedEventForModal.sourcePageNumber})
                  </span>
                </div>
                <span className="text-emerald-400 font-semibold">Document Verified</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {onNavigateTab && (
                  <>
                    <button
                      onClick={() => {
                        const q = `Mitigation for ${selectedEventForModal.eventType} at depth ${selectedEventForModal.depth}m in ${selectedEventForModal.wellName}`;
                        setSelectedEventForModal(null);
                        onNavigateTab('knowledge', { query: q });
                      }}
                      className="px-3 py-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors"
                    >
                      Query in Knowledge Search
                    </button>
                    <button
                      onClick={() => {
                        const doc = selectedEventForModal.sourceDocumentName;
                        setSelectedEventForModal(null);
                        onNavigateTab('documents', { query: doc });
                      }}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                    >
                      View Source Document
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventForModal(null);
                        if (onSelectWellById) onSelectWellById(selectedEventForModal.wellId);
                        onNavigateTab('gis-map');
                      }}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                    >
                      Locate Well on GIS
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedEventForModal(null)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

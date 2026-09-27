/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  FileText,
  BookmarkCheck,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Loader2,
  MapPin,
  FileCheck,
  Copy,
  Check,
} from 'lucide-react';
import { RagResponse } from '../types/index.js';
import { api } from '../services/apiService.js';

interface KnowledgeSearchProps {
  initialQuery?: string;
  onNavigateTab?: (tab: string, context?: any) => void;
  onSelectWellByName?: (wellName: string) => void;
}

export const KnowledgeSearchRAG: React.FC<KnowledgeSearchProps> = ({
  initialQuery = '',
  onNavigateTab,
  onSelectWellByName,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RagResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const suggestedPrompts = [
    'What happened around 2850m in nearby offset wells?',
    'Which wells experienced severe mud losses in Barail Main Sand?',
    'What mitigation was used for stuck pipe in KNG-38?',
    'Show historical lost circulation pills used in Nahorkatiya field.',
    'What are the geomechanical pore pressure hazards in Upper Assam Barail?',
  ];

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.searchKnowledge(queryText);
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Knowledge search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const copyAnswer = () => {
    if (!response) return;
    navigator.clipboard.writeText(response.answerMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-display">
              Evidence-Grounded Historical Knowledge Search
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              VECTOR & INCIDENT RETRIEVAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Query the full corpus of Oil India Well Completion Reports (WCR), Daily Drilling Reports (DDR), and Geomechanical Atlases. Answers are strictly grounded in retrieved operational records with direct page citations.
          </p>
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Ask an operational question (e.g., 'What happened around 2850m in offset wells?')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-950/40 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-200" />
            )}
            <span>Search Knowledge</span>
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">Suggested queries:</span>
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(prompt);
                handleSearch(prompt);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-12 text-center text-slate-400 shadow-lg space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-200">
            Retrieving Historical Chunks & Correlating Offset Records...
          </p>
          <p className="text-xs text-slate-500">
            Querying technical document corpus and compiling evidence citations
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-950/30 border border-rose-600/50 rounded-xl p-4 text-rose-300 text-xs">
          <strong>Search Error:</strong> {error}
        </div>
      )}

      {/* Response Display */}
      {response && !loading && (
        <div className="space-y-5">
          {/* Main Answer Card */}
          <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 font-display text-base">
                  Synthesized Decision Support Analysis
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">Engine:</span>
                <span className="font-mono text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {response.llmProviderUsed}
                </span>
                <span className="text-slate-500">
                  Confidence: <strong>{(response.confidenceScore * 100).toFixed(0)}%</strong>
                </span>

                <button
                  onClick={copyAnswer}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
                  title="Copy analysis text"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Answer Markdown / Text */}
            <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed space-y-3 whitespace-pre-line font-sans">
              {response.answerMarkdown}
            </div>

            {/* Disclaimer */}
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 italic">
              *Disclaimer: This synthesized insight provides historical correlation evidence for decision support. All operational drilling decisions remain under the sole discretion of the rig superintendent and drilling engineer.
            </div>
          </div>

          {/* Retrieved Historical Incident Records Table */}
          {response.retrievedHistoricalFacts.length > 0 && (
            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Retrieved Historical Incident Records (Ground Truth)
                </h4>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('events')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <span>View in Historical Events Explorer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090f1d] border-b border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2">Well</th>
                      <th className="px-3 py-2">Depth</th>
                      <th className="px-3 py-2">Formation</th>
                      <th className="px-3 py-2">Incident</th>
                      <th className="px-3 py-2">Historical Mitigation</th>
                      <th className="px-3 py-2">Source Document</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {response.retrievedHistoricalFacts.map((fact, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="px-3 py-2.5 font-bold text-slate-100">
                          {fact.wellName}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-cyan-300 font-semibold">{fact.depth}m</td>
                        <td className="px-3 py-2.5 text-amber-300">{fact.formation}</td>
                        <td className="px-3 py-2.5">
                          <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-200">
                            {fact.eventType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 max-w-xs">{fact.mitigation}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-400 text-[11px]">{fact.source}</td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          {onSelectWellByName && (
                            <button
                              onClick={() => onSelectWellByName(fact.wellName)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 text-[10px] font-medium mr-1 transition-colors"
                              title="Inspect Well Profile"
                            >
                              Well Profile
                            </button>
                          )}
                          {onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('gis-map')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors"
                              title="Locate on GIS Map"
                            >
                              GIS Map
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Citations Grid */}
          {response.citations.length > 0 && (
            <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Primary Source Document Citations
                </h4>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('documents')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Inspect In Document Center</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-cyan-300">{cite.wellName}</span>
                      <span className="font-mono text-slate-400">Page {cite.pageNumber}</span>
                    </div>
                    <div className="font-medium text-slate-200">{cite.sourceDocTitle}</div>
                    <div className="text-slate-400 text-[11px] italic pl-2 border-l-2 border-cyan-500/40 leading-relaxed">
                      "{cite.quoteSnippet}"
                    </div>
                    {onNavigateTab && (
                      <div className="pt-1 text-right">
                        <button
                          onClick={() => onNavigateTab('documents')}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          Open in Document Center &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

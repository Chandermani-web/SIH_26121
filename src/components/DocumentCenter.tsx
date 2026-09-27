/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Layers,
  Search,
  Eye,
  X,
  FileCheck,
  ChevronRight,
  Database,
} from 'lucide-react';
import { TechnicalDocument } from '../types/index.js';
import { api } from '../services/apiService.js';

interface DocumentCenterProps {
  initialSearch?: string;
  onNavigateTab?: (tab: string, context?: any) => void;
}

export const DocumentCenter: React.FC<DocumentCenterProps> = ({
  initialSearch = '',
  onNavigateTab,
}) => {
  const [documents, setDocuments] = useState<TechnicalDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<TechnicalDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchFilter, setSearchFilter] = useState(initialSearch);

  useEffect(() => {
    if (initialSearch) setSearchFilter(initialSearch);
  }, [initialSearch]);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadDocType, setUploadDocType] = useState('DDR');
  const [uploadWellName, setUploadWellName] = useState('NHK-142');
  const [uploadText, setUploadText] = useState('');

  const loadDocuments = () => {
    api.getDocuments().then((res) => {
      setDocuments(res.documents);
    });
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleOpenDoc = async (docId: string) => {
    try {
      const fullDoc = await api.getDocumentDetails(docId);
      setSelectedDoc(fullDoc);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await api.uploadDocument({
        filename: uploadFilename || `DDR_${uploadWellName}_Interval.pdf`,
        title: uploadTitle || `Daily Drilling Report - ${uploadWellName}`,
        documentType: uploadDocType,
        wellName: uploadWellName,
        textContent: uploadText,
      });
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFilename('');
      setUploadText('');
      loadDocuments();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.filename.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (d.wellName && d.wellName.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-100 font-display">
              Document Intelligence & Ingestion Center
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              OCR & ENTITY EXTRACTION PIPELINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Central repository for Well Completion Reports (WCR), Daily Drilling Reports (DDR), and Geomechanical Atlases. Automatically parses stratigraphic markers, lost circulation incidents, and LCM recipes into vector embeddings.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-950/40 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Drilling Dossier</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter documents by filename, title, or well..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          {filteredDocs.length} Documents Indexed
        </span>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-[#0c1424] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090f1d] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Document Title & Filename</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Associated Well</th>
                <th className="px-4 py-3">Pages / Chunks</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Key Extracted Entities</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => handleOpenDoc(doc.id)}
                  className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-100 block text-xs">{doc.title}</strong>
                        <span className="font-mono text-[11px] text-slate-500">{doc.filename}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                      {doc.documentType}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-200">
                    {doc.wellName || 'Regional Upper Assam'}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {doc.pageCount} pgs · <strong className="text-cyan-300">{doc.chunkCount || 4} chunks</strong>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Vectorized
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {doc.extractedEntities.incidents?.slice(0, 2).map((inc, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950/40 text-rose-300 border border-rose-800/30 truncate max-w-[180px]"
                        >
                          {inc}
                        </span>
                      ))}
                      {doc.extractedEntities.formations?.slice(0, 2).map((form, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 truncate max-w-[120px]"
                        >
                          {form}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-end gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Reader & Chunk Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-[#0c1424] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div>
                <h3 className="font-bold text-slate-100 text-sm font-display flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  {selectedDoc.title}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedDoc.filename} · {selectedDoc.wellName} · {selectedDoc.pageCount} Pages
                </span>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Executive Summary */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                  Parsed Executive Summary
                </span>
                <p className="text-slate-200 leading-relaxed">{selectedDoc.summary}</p>
              </div>

              {/* Extracted Entities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="font-semibold text-cyan-400 block mb-1 text-[11px]">
                    Identified Formations & Depths
                  </span>
                  <div className="space-y-1 text-slate-300">
                    {selectedDoc.extractedEntities.formations?.map((f, i) => (
                      <div key={i}>• {f}</div>
                    ))}
                    <div className="text-slate-500 font-mono text-[11px] pt-1">
                      Depths: {selectedDoc.extractedEntities.depths?.join(', ')}m
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="font-semibold text-amber-400 block mb-1 text-[11px]">
                    Identified Incidents & Mitigations
                  </span>
                  <div className="space-y-1 text-slate-300">
                    {selectedDoc.extractedEntities.incidents?.map((inc, i) => (
                      <div key={i} className="text-rose-300">• {inc}</div>
                    ))}
                    {selectedDoc.extractedEntities.mitigations?.map((mit, i) => (
                      <div key={i} className="text-emerald-300">• {mit}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chunks Inspector */}
              {selectedDoc.chunks && selectedDoc.chunks.length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[10px]">
                    Vectorized Knowledge Chunks ({selectedDoc.chunks.length})
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedDoc.chunks.map((chk) => (
                      <div
                        key={chk.id}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span className="font-bold text-cyan-400">
                            [{chk.section} - Page {chk.pageNumber}]
                          </span>
                          <span>Keywords: {chk.keywords.join(', ')}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-sans">{chk.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {onNavigateTab && (
                  <>
                    <button
                      onClick={() => {
                        const title = selectedDoc.title;
                        setSelectedDoc(null);
                        onNavigateTab('knowledge', { query: `Historical operational findings in ${title}` });
                      }}
                      className="px-3 py-1.5 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors"
                    >
                      Search Report in Knowledge Search
                    </button>
                    {selectedDoc.wellName && (
                      <button
                        onClick={() => {
                          const well = selectedDoc.wellName;
                          setSelectedDoc(null);
                          onNavigateTab('events', { wellName: well });
                        }}
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                      >
                        Find Incidents for {selectedDoc.wellName}
                      </button>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0c1424] border border-slate-700 rounded-xl shadow-2xl p-5 space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm font-display flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Upload Technical Drilling Report (WCR/DDR)
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulatedUpload} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Well Completion Report NHK-145"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Document Type</label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="WCR">WCR (Well Completion Report)</option>
                    <option value="DDR">DDR (Daily Drilling Report)</option>
                    <option value="EOWR">EOWR (End of Well Report)</option>
                    <option value="GEOMECHANICAL_STUDY">Geomechanical Study</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Associated Well</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NHK-145"
                    value={uploadWellName}
                    onChange={(e) => setUploadWellName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Text / Log Excerpt</label>
                <textarea
                  rows={4}
                  placeholder="Paste operational log content or notes..."
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow"
                >
                  {isUploading ? 'Ingesting & Chunking...' : 'Ingest Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

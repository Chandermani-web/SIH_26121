/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Header } from './components/Header.js';
import { RolePerspectiveDeck } from './components/RolePerspectiveDeck.js';
import { SihDemoHUD } from './components/SihDemoHUD.js';
import { DashboardOverview } from './components/DashboardOverview.js';
import { LiveWellMonitor } from './components/LiveWellMonitor.js';
import { GeospatialMap } from './components/GeospatialMap.js';
import { HistoricalEventsExplorer } from './components/HistoricalEventsExplorer.js';
import { RiskIntelligenceView } from './components/RiskIntelligenceView.js';
import { KnowledgeSearchRAG } from './components/KnowledgeSearchRAG.js';
import { DocumentCenter } from './components/DocumentCenter.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { AlertsModal } from './components/AlertsModal.js';
import { WellDetailModal } from './components/WellDetailModal.js';
import { api } from './services/apiService.js';
import { clientSimulator } from './mock/clientSimulator.js';
import {
  SimulationState,
  Well,
  WellCorrelationResult,
  HistoricalEvent,
  UserRole,
} from './types/index.js';

export default function App() {
  const [simState, setSimState] = useState<SimulationState>({
    wellId: 'OIL-ACTIVE-01',
    isRunning: false,
    isDemoMode: false,
    simulationSpeed: 1.0,
    currentDepth: 2835.0,
    tvd: 2810.8,
    rop: 14.5,
    wob: 20.0,
    rpm: 115,
    torque: 14.8,
    spp: 2720,
    flowIn: 560,
    flowOut: 560,
    mudWeight: 10.3,
    pitVolumeBbl: 850.0,
    pitVolumeChangeBbl: 0,
    gasUnits: 135,
    formation: 'Barail Main Sand (BMS)',
    activeAlerts: [],
    latestRisks: [],
    overallRiskLevel: 'MEDIUM',
    topCorrelations: [],
    mitigationPillPumped: false,
    stepIndex: 0,
  });

  const [activeWell, setActiveWell] = useState<Well>({
    id: 'OIL-ACTIVE-01',
    wellName: 'NHK-Deep-504 (Active)',
    field: 'Nahorkatiya',
    block: 'NHK Mining Lease',
    operator: 'Oil India Limited',
    latitude: 27.2942,
    longitude: 95.3418,
    elevationMsl: 124.5,
    spudDate: '2026-08-12',
    totalDepth: 3450,
    status: 'ACTIVE_DRILLING',
    targetFormation: 'Barail Main Sand (BMS)',
    currentDepth: 2835.0,
    currentFormation: 'Barail Main Sand (BMS)',
    isSimulatedActive: true,
    casingProgram: [
      { sizeInch: 20, depthM: 120, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1150, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2680, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3450, casingType: 'Production Liner' },
    ],
    trajectory: [],
  });

  const [wells, setWells] = useState<Well[]>([]);
  const [formations, setFormations] = useState<{ id: string; name: string }[]>([]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [nearbyResults, setNearbyResults] = useState<WellCorrelationResult[]>([]);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedWell, setSelectedWell] = useState<Well | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('DRILLING_ENGINEER');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [formationFilter, setFormationFilter] = useState<string>('ALL');

  // Cross-Navigation Context States
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState<string>('');
  const [documentSearchQuery, setDocumentSearchQuery] = useState<string>('');
  const [eventsWellFilter, setEventsWellFilter] = useState<string>('ALL');
  const [eventsTypeFilter, setEventsTypeFilter] = useState<string>('ALL');
  const [eventsFormationFilter, setEventsFormationFilter] = useState<string>('ALL');

  // Initialize data from mock store on mount
  useEffect(() => {
    // 1. Fetch initial wells
    api.getWells().then((data) => {
      setWells(data.wells);
      const active = data.wells.find((w) => w.isSimulatedActive);
      if (active) setActiveWell(active);
    });

    // 2. Fetch all historical events
    api.getEvents().then((data) => {
      setEvents(data.events);
    });

    // 3. Fetch nearby correlations
    api.getNearbyWells({ radius_km: radiusKm, formation: formationFilter }).then((res) => {
      setNearbyResults(res.results);
    });
  }, []);

  // Update nearby correlations when radius, formation, or depth changes
  useEffect(() => {
    api
      .getNearbyWells({
        current_depth: simState.currentDepth,
        radius_km: radiusKm,
        formation: formationFilter === 'ALL' ? undefined : formationFilter,
      })
      .then((res) => {
        setNearbyResults(res.results);
      });
  }, [radiusKm, formationFilter, Math.round(simState.currentDepth / 10)]);

  // Subscribe to live client simulator telemetry updates (Pure in-browser engine)
  useEffect(() => {
    const unsubscribe = clientSimulator.subscribe((state) => {
      setSimState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Unified Cross-Navigation Handler
  const handleNavigateTab = (tab: string, context?: any) => {
    if (context) {
      if (context.query) {
        if (tab === 'knowledge') {
          setKnowledgeSearchQuery(context.query);
        } else if (tab === 'documents') {
          setDocumentSearchQuery(context.query);
        }
      }
      if (context.wellId) {
        setEventsWellFilter(context.wellId);
      }
      if (context.wellName) {
        if (tab === 'events') {
          const match = wells.find((w) =>
            w.wellName.toLowerCase().includes(context.wellName.toLowerCase())
          );
          if (match) setEventsWellFilter(match.id);
        } else if (tab === 'documents') {
          setDocumentSearchQuery(context.wellName);
        } else if (tab === 'knowledge') {
          setKnowledgeSearchQuery(`Operational incidents in well ${context.wellName}`);
        }
      }
      if (context.eventType) {
        setEventsTypeFilter(context.eventType);
      }
      if (context.formation) {
        setEventsFormationFilter(context.formation);
      }
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simulation controls
  const handleStartDemo = () => {
    api.startSimulation(true, 1.0).then((res) => {
      setSimState(res.state);
      setActiveTab('dashboard');
    });
  };

  const handleFastForwardDemo = () => {
    api.fastForwardSimulation().then((res) => {
      setSimState(res.state);
    });
  };

  const handleChangeSimulationSpeed = (speed: number) => {
    api.startSimulation(simState.isDemoMode, speed).then((res) => {
      setSimState(res.state);
    });
  };

  const handleStopSimulation = () => {
    api.stopSimulation().then((res) => setSimState(res.state));
  };

  const handleStepSimulation = (deltaM = 1.0) => {
    api.stepSimulation(deltaM).then((res) => setSimState(res.state));
  };

  const handleResetSimulation = (startDepth = 2835.0) => {
    api.resetSimulation(startDepth).then((res) => setSimState(res.state));
  };

  const handlePumpMitigation = (pillType: string) => {
    api.pumpMitigation(pillType).then((res) => setSimState(res.state));
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    api.acknowledgeAlert(alertId).then(() => {
      setSimState((prev) => ({
        ...prev,
        activeAlerts: prev.activeAlerts.map((a) =>
          a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a
        ),
      }));
    });
  };

  const handleSelectWellByName = (wellName: string) => {
    const match = wells.find((w) =>
      w.wellName.toLowerCase().includes(wellName.toLowerCase())
    );
    if (match) setSelectedWell(match);
  };

  const handleSelectWellById = (wellId: string) => {
    const match = wells.find((w) => w.id === wellId);
    if (match) setSelectedWell(match);
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Header */}
      <Header
        simState={simState}
        onStartDemo={handleStartDemo}
        onStopSimulation={handleStopSimulation}
        onResetSimulation={() => handleResetSimulation(2835.0)}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onTabChange={(tab) => handleNavigateTab(tab)}
        onOpenAlerts={() => setIsAlertsModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* SIH 2024 Demo Scenario Interactive Heads-Up Display (Visible during Demo Mode) */}
        {simState.isDemoMode && (
          <SihDemoHUD
            simState={simState}
            onStopDemo={handleStopSimulation}
            onResetDemo={handleStartDemo}
            onFastForward={handleFastForwardDemo}
            onPumpMitigation={handlePumpMitigation}
            onChangeSpeed={handleChangeSimulationSpeed}
            onNavigateTab={handleNavigateTab}
            onSelectWellByName={handleSelectWellByName}
            onOpenAlerts={() => setIsAlertsModalOpen(true)}
          />
        )}

        {/* Dynamic Role Perspective Command Deck (Visible when Drilling Engineer, Geologist, or Drilling Admin is active) */}
        <RolePerspectiveDeck
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          simState={simState}
          activeWell={activeWell}
          onNavigateTab={handleNavigateTab}
          onPumpMitigation={handlePumpMitigation}
          onStartDemo={handleStartDemo}
          onOpenAlerts={() => setIsAlertsModalOpen(true)}
        />

        {activeTab === 'dashboard' && (
          <DashboardOverview
            simState={simState}
            activeWell={activeWell}
            topCorrelations={simState.topCorrelations.length > 0 ? simState.topCorrelations : nearbyResults}
            onSelectWell={setSelectedWell}
            onNavigateTab={handleNavigateTab}
            onOpenAlerts={() => setIsAlertsModalOpen(true)}
            onStartDemo={handleStartDemo}
            onPumpMitigation={handlePumpMitigation}
          />
        )}

        {activeTab === 'live-well' && (
          <LiveWellMonitor
            simState={simState}
            onStartSimulation={(demo, spd) =>
              api.startSimulation(demo, spd).then((r) => setSimState(r.state))
            }
            onStopSimulation={handleStopSimulation}
            onStepSimulation={handleStepSimulation}
            onResetSimulation={handleResetSimulation}
            onPumpMitigation={handlePumpMitigation}
          />
        )}

        {activeTab === 'gis-map' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1424] border border-slate-800 p-4 rounded-xl shadow-lg">
              <div>
                <h2 className="font-semibold text-sm text-slate-100 font-display">
                  Geospatial Offset Wells Spatial Intelligence Map
                </h2>
                <p className="text-xs text-slate-400">
                  Interactive GIS tracking 16 offset wells relative to active well NHK-Deep-504 (Lat: 27.2942° N, Lon: 95.3418° E)
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                {nearbyResults.length} Offset Wells Within {radiusKm} km
              </span>
            </div>

            <GeospatialMap
              activeWell={activeWell}
              nearbyResults={nearbyResults}
              selectedWell={selectedWell}
              onSelectWell={setSelectedWell}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              formationFilter={formationFilter}
              onFormationFilterChange={setFormationFilter}
              formations={[
                { id: 'F-BARAIL', name: 'Barail Main Sand (BMS)' },
                { id: 'F-GIRUJAN', name: 'Girujan Clay' },
                { id: 'F-TIPAM', name: 'Tipam Sandstone' },
                { id: 'F-KOPILI', name: 'Kopili Shale Formation' },
                { id: 'F-SYLHET', name: 'Sylhet Limestone & Narpuh' },
              ]}
            />
          </div>
        )}

        {activeTab === 'events' && (
          <HistoricalEventsExplorer
            events={events}
            wells={wells}
            formations={[
              { id: 'F-BARAIL', name: 'Barail Main Sand (BMS)' },
              { id: 'F-GIRUJAN', name: 'Girujan Clay' },
              { id: 'F-TIPAM', name: 'Tipam Sandstone' },
              { id: 'F-KOPILI', name: 'Kopili Shale Formation' },
              { id: 'F-SYLHET', name: 'Sylhet Limestone & Narpuh' },
            ]}
            initialWellId={eventsWellFilter}
            initialEventType={eventsTypeFilter}
            onNavigateTab={handleNavigateTab}
            onSelectWellById={handleSelectWellById}
          />
        )}

        {activeTab === 'risk' && (
          <RiskIntelligenceView
            simState={simState}
            onPumpMitigation={handlePumpMitigation}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeSearchRAG
            initialQuery={knowledgeSearchQuery}
            onNavigateTab={handleNavigateTab}
            onSelectWellByName={handleSelectWellByName}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentCenter
            initialSearch={documentSearchQuery}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            onNavigateTab={handleNavigateTab}
          />
        )}
      </main>

      {/* Proactive Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={simState.activeAlerts}
        onAcknowledge={handleAcknowledgeAlert}
        onApplyMitigation={handlePumpMitigation}
        onNavigateTab={handleNavigateTab}
      />

      {/* Offset Well Details Modal */}
      <WellDetailModal
        well={selectedWell}
        onClose={() => setSelectedWell(null)}
        onNavigateTab={handleNavigateTab}
      />

      {/* Operational Disclaimer Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060a14] py-3 px-6 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">Oil India Limited</span>
          <span>· eRTMAC-NWIS Nearby Wells Intelligence System</span>
        </div>
        <div className="text-[11px] text-slate-500 italic">
          *Decision-Support Architecture: AI correlations and risk recommendations support the engineering team. Final operational decisions remain strictly with the drilling engineer.
        </div>
      </footer>
    </div>
  );
}

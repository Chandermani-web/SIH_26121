/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Well, WellCorrelationResult } from '../types/index.js';
import { Compass, Filter, Layers, MapPin, Maximize2, ShieldAlert } from 'lucide-react';

interface GeospatialMapProps {
  activeWell: Well;
  nearbyResults: WellCorrelationResult[];
  selectedWell: Well | null;
  onSelectWell: (well: Well) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  formationFilter: string;
  onFormationFilterChange: (formation: string) => void;
  formations: { id: string; name: string }[];
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  activeWell,
  nearbyResults,
  selectedWell,
  onSelectWell,
  radiusKm,
  onRadiusChange,
  formationFilter,
  onFormationFilterChange,
  formations,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapType, setMapType] = useState<'dark' | 'satellite'>('dark');

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [activeWell.latitude, activeWell.longitude],
      zoom: 12,
      zoomControl: true,
    });

    // Dark Matter tile layer by CartoDB
    const darkTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    const circlesGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;
    circlesGroupRef.current = circlesGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map tiles when tile layer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === 'dark') {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);
    } else {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri World Imagery',
          maxZoom: 18,
        }
      ).addTo(map);
    }
  }, [mapType]);

  // Update markers, active well, and radius circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    const circlesGroup = circlesGroupRef.current;
    if (!map || !layerGroup || !circlesGroup) return;

    layerGroup.clearLayers();
    circlesGroup.clearLayers();

    // 1. Draw Range Rings (2.5 km, 5 km, 10 km, and active slider radius)
    const activeCenter: [number, number] = [activeWell.latitude, activeWell.longitude];

    // Selected radius circle
    L.circle(activeCenter, {
      radius: radiusKm * 1000,
      color: '#06b6d4',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#06b6d4',
      fillOpacity: 0.05,
    }).addTo(circlesGroup);

    // Inner 2.5km High Risk ring
    L.circle(activeCenter, {
      radius: 2500,
      color: '#f43f5e',
      weight: 1,
      dashArray: '2, 4',
      fillColor: '#f43f5e',
      fillOpacity: 0.04,
    }).addTo(circlesGroup);

    // 2. Add Active Well Marker (Animated pulsing cyan marker)
    const activeIcon = L.divIcon({
      className: 'custom-active-well-icon',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(6, 182, 212, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #06b6d4; border: 3px solid #ffffff; box-shadow: 0 0 14px #06b6d4; display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #080d1a;"></div>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const activeMarker = L.marker(activeCenter, { icon: activeIcon }).addTo(layerGroup);
    activeMarker.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.4;">
        <div style="color: #06b6d4; font-weight: 700; font-size: 13px;">ACTIVE DRILLING WELL</div>
        <div style="font-weight: 700; font-size: 14px; margin-top: 2px;">${activeWell.wellName}</div>
        <div style="color: #94a3b8; font-size: 11px;">Field: ${activeWell.field} · Rig: OIL-RIG-E2000</div>
        <div style="margin-top: 6px; padding: 4px 6px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 4px;">
          <div>Bit Depth: <strong style="color: #ffffff;">${activeWell.currentDepth?.toFixed(1) || 2835.4}m</strong></div>
          <div>Formation: <strong style="color: #fbbf24;">${activeWell.currentFormation || 'Barail Main Sand'}</strong></div>
        </div>
      </div>
    `);

    // 3. Add Offset Wells Markers
    nearbyResults.forEach((item) => {
      const { well, distanceKm, relevanceScore, depthProximityM, criticalEventsCount } = item;
      const isSelected = selectedWell?.id === well.id;

      // Color coding by Historical Relevance Score:
      // >80: Critical / High Hazard corridor (Rose)
      // 60-80: High Correlation (Amber)
      // 40-60: Medium Correlation (Blue)
      // <40: Low Correlation (Slate)
      let markerColor = '#64748b';
      if (relevanceScore >= 80) markerColor = '#f43f5e';
      else if (relevanceScore >= 60) markerColor = '#f59e0b';
      else if (relevanceScore >= 40) markerColor = '#38bdf8';

      const offsetIcon = L.divIcon({
        className: 'custom-offset-well-icon',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isSelected
                ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #ffffff; animation: pulse 1.5s infinite;"></div>`
                : ''
            }
            <div style="width: 18px; height: 18px; border-radius: 50%; background: ${markerColor}; border: 2px solid #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #ffffff;">
              ${criticalEventsCount > 0 ? '!' : ''}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([well.latitude, well.longitude], { icon: offsetIcon }).addTo(layerGroup);

      marker.on('click', () => {
        onSelectWell(well);
      });

      marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; line-height: 1.4; min-width: 190px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px; color: #ffffff;">${well.wellName}</strong>
            <span style="font-size: 11px; padding: 2px 5px; border-radius: 4px; background: ${markerColor}20; color: ${markerColor}; font-weight: 700;">
              ${relevanceScore}% Relevance
            </span>
          </div>
          <div style="color: #94a3b8; font-size: 11px; margin-top: 2px;">
            ${distanceKm.toFixed(1)} km offset · ${well.field}
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: #cbd5e1;">
            <div>Target: <strong>${well.targetFormation}</strong></div>
            <div>Total Depth: <strong>${well.totalDepth}m</strong></div>
            ${
              depthProximityM > 0
                ? `<div style="color: #f43f5e; margin-top: 2px;">Closest incident Δ: <strong>${depthProximityM.toFixed(1)}m</strong></div>`
                : ''
            }
          </div>
          <div style="margin-top: 8px; text-align: right;">
            <span style="color: #38bdf8; font-size: 11px; font-weight: 600; cursor: pointer;">Click marker to view full profile &rarr;</span>
          </div>
        </div>
      `);
    });
  }, [activeWell, nearbyResults, selectedWell, radiusKm]);

  return (
    <div className="relative w-full h-[650px] bg-[#090e17] rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Controls Card */}
        <div className="pointer-events-auto bg-[#0b1220]/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-lg flex flex-wrap items-center gap-4 text-xs text-slate-200">
          {/* Radius Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Search Radius:</span>
            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={radiusKm}
              onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
              className="w-24 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-cyan-300 font-semibold w-12">{radiusKm} km</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Formation Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={formationFilter}
              onChange={(e) => onFormationFilterChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Formations</option>
              {formations.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-700">|</span>

          {/* Map Layer Mode */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setMapType('dark')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                mapType === 'dark' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dark High-Contrast
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                mapType === 'satellite' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="pointer-events-auto bg-[#0b1220]/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-lg flex items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 border border-white shadow-sm inline-block" />
            <span>Active Well</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Relevance &gt; 80% (High Risk)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Relevance 60-80%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>Relevance &lt; 60%</span>
          </div>
        </div>
      </div>

      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Selected Well Summary Pill at bottom */}
      {selectedWell && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-[#0c1424]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300">
              {selectedWell.wellName.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">{selectedWell.wellName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                  {selectedWell.field} Field
                </span>
                <span className="text-slate-400">Total Depth: {selectedWell.totalDepth}m</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target: <strong className="text-slate-200">{selectedWell.targetFormation}</strong> ·
                Status: <span className="text-emerald-400">{selectedWell.status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectWell(selectedWell)}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow transition-colors"
            >
              Open Full Offset Well Correlation Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

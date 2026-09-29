/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Well, HistoricalEvent, WELLS_DATA, FORMATIONS_DATA } from './wellsData.js';
import { HISTORICAL_EVENTS_DATA } from './eventsData.js';

export interface WellCorrelationResult {
  well: Well;
  distanceKm: number;
  depthProximityM: number;
  formationMatch: boolean;
  activeFormation: string;
  wellFormation: string;
  historicalEventsCount: number;
  criticalEventsCount: number;
  relevanceScore: number; // 0 to 100
  relevanceFactors: {
    factor: string;
    weight: number;
    contributionScore: number;
    description: string;
  }[];
  nearbyEvents: HistoricalEvent[];
  recommendedMitigations: string[];
}

/**
 * Compute Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Determine geological formation based on True Vertical Depth / Measured Depth.
 */
export function getFormationForDepth(depthM: number): string {
  for (const f of FORMATIONS_DATA) {
    if (depthM >= f.depthStart && depthM <= f.depthEnd) {
      return f.name;
    }
  }
  return depthM > 4100 ? 'Basement Complex' : 'Unknown Stratum';
}

/**
 * Correlate offset wells against an active well depth and location.
 */
export function correlateNearbyWells(params: {
  activeLatitude: number;
  activeLongitude: number;
  currentDepth: number;
  radiusKm?: number;
  formationFilter?: string;
}): WellCorrelationResult[] {
  const {
    activeLatitude,
    activeLongitude,
    currentDepth,
    radiusKm = 25,
    formationFilter,
  } = params;

  const currentFormation = getFormationForDepth(currentDepth);

  const results: WellCorrelationResult[] = [];

  for (const well of WELLS_DATA) {
    // Skip active well itself in offset analysis
    if (well.isSimulatedActive) continue;

    const distanceKm = calculateHaversineDistanceKm(
      activeLatitude,
      activeLongitude,
      well.latitude,
      well.longitude
    );

    if (distanceKm > radiusKm) continue;

    // Get historical events for this well
    const wellEvents = HISTORICAL_EVENTS_DATA.filter((e) => e.wellId === well.id);
    const criticalEvents = wellEvents.filter(
      (e) => e.severity === 'CRITICAL' || e.severity === 'HIGH'
    );

    // Calculate nearest event depth
    let minDepthDelta = 9999;
    let closestEvent: HistoricalEvent | null = null;
    for (const evt of wellEvents) {
      const delta = Math.abs(evt.depth - currentDepth);
      if (delta < minDepthDelta) {
        minDepthDelta = delta;
        closestEvent = evt;
      }
    }

    const wellFormationAtDepth = getFormationForDepth(currentDepth);
    const isSameFormation =
      well.targetFormation.toLowerCase().includes('barail') ||
      wellFormationAtDepth === currentFormation;

    if (formationFilter && !isSameFormation && formationFilter !== 'ALL') {
      continue;
    }

    // Historical Relevance Score Calculation
    // 1. Spatial Proximity: Exponential decay up to 25 km
    const spatialScore = Math.max(0, Math.min(100, Math.exp(-distanceKm / 6.0) * 100));

    // 2. Depth Proximity: Exponential decay within 300m
    const depthScore = Math.max(
      0,
      Math.min(100, Math.exp(-minDepthDelta / 80.0) * 100)
    );

    // 3. Formation Match: 100 if matching, 40 if adjacent
    const formationScore = isSameFormation ? 100 : 40;

    // 4. Incident Severity & Density: Higher if severe events occurred near this depth
    let incidentScore = 30;
    if (closestEvent) {
      if (minDepthDelta <= 30) {
        incidentScore = closestEvent.severity === 'CRITICAL' ? 100 : 85;
      } else if (minDepthDelta <= 100) {
        incidentScore = closestEvent.severity === 'CRITICAL' ? 80 : 65;
      } else {
        incidentScore = 45;
      }
    }

    // Normalized Weighted Relevance Score
    // Spatial (30%) + Depth (30%) + Formation (25%) + Incidents (15%)
    const rawRelevance =
      spatialScore * 0.3 +
      depthScore * 0.3 +
      formationScore * 0.25 +
      incidentScore * 0.15;

    const relevanceScore = Math.round(Math.min(99, Math.max(12, rawRelevance)));

    // Breakdown factors for engineers
    const relevanceFactors = [
      {
        factor: 'Geographical Proximity',
        weight: 30,
        contributionScore: Math.round(spatialScore),
        description: `${distanceKm.toFixed(1)} km offset distance from active well coordinates.`,
      },
      {
        factor: 'Stratigraphic & Depth Proximity',
        weight: 30,
        contributionScore: Math.round(depthScore),
        description:
          minDepthDelta < 9999
            ? `Nearest historical event at ${closestEvent?.depth}m (Δ ${minDepthDelta.toFixed(1)}m from current bit depth).`
            : 'No direct depth match in historical profile.',
      },
      {
        factor: 'Formation Alignment',
        weight: 25,
        contributionScore: formationScore,
        description: isSameFormation
          ? `Direct geological match: ${currentFormation}. Shared reservoir facies.`
          : `Different stratum: target is ${well.targetFormation}.`,
      },
      {
        factor: 'Historical Incident Severity',
        weight: 15,
        contributionScore: incidentScore,
        description: closestEvent
          ? `Historical ${closestEvent.eventType} logged with ${closestEvent.severity} severity.`
          : 'Normal drilling with low incident frequency.',
      },
    ];

    // Collect mitigations
    const mitigations = Array.from(
      new Set(
        wellEvents
          .filter((e) => Math.abs(e.depth - currentDepth) <= 150)
          .map((e) => e.mitigation)
      )
    );

    results.push({
      well,
      distanceKm,
      depthProximityM: minDepthDelta === 9999 ? 0 : Math.round(minDepthDelta * 10) / 10,
      formationMatch: isSameFormation,
      activeFormation: currentFormation,
      wellFormation: well.targetFormation,
      historicalEventsCount: wellEvents.length,
      criticalEventsCount: criticalEvents.length,
      relevanceScore,
      relevanceFactors,
      nearbyEvents: wellEvents,
      recommendedMitigations: mitigations,
    });
  }

  // Sort descending by Historical Relevance Score
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

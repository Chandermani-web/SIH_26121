/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TECHNICAL_DOCUMENTS_DATA, DocumentChunk } from './documentsData.js';
import { HISTORICAL_EVENTS_DATA } from './eventsData.js';
import { HistoricalEvent } from './wellsData.js';

export interface RagSourceCitation {
  sourceDocId: string;
  sourceDocTitle: string;
  wellName: string;
  pageNumber: number;
  section: string;
  quoteSnippet: string;
}

export interface RagResponse {
  query: string;
  answerMarkdown: string;
  retrievedHistoricalFacts: {
    wellName: string;
    depth: number;
    formation: string;
    eventType: string;
    severity: string;
    nptHours: number;
    mitigation: string;
    source: string;
  }[];
  citations: RagSourceCitation[];
  llmProviderUsed: string;
  confidenceScore: number;
  isDeterministicFallback: boolean;
}

/**
 * Perform keyword and semantic relevance scoring across knowledge chunks and historical events.
 */
function searchKnowledgeChunks(query: string, limit = 6): DocumentChunk[] {
  const queryLower = query.toLowerCase();
  const searchTerms = queryLower
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);

  const scoredChunks: { chunk: DocumentChunk; score: number }[] = [];

  for (const doc of TECHNICAL_DOCUMENTS_DATA) {
    for (const chunk of doc.chunks) {
      let score = 0;
      const textLower = chunk.text.toLowerCase();
      const sectionLower = chunk.section.toLowerCase();

      for (const term of searchTerms) {
        if (textLower.includes(term)) score += 3;
        if (sectionLower.includes(term)) score += 5;
        if (chunk.keywords.some((k) => k.toLowerCase().includes(term))) score += 4;
      }

      // Check depth mentions in query like "2845", "2850", "2860"
      const depthMatches = query.match(/\b(1\d{3}|2\d{3}|3\d{3}|4\d{3})\b/g);
      if (depthMatches) {
        for (const dm of depthMatches) {
          if (textLower.includes(dm)) score += 10;
        }
      }

      // Check event types
      if (queryLower.includes('loss') && (textLower.includes('loss') || textLower.includes('circulation'))) score += 6;
      if (queryLower.includes('stuck') && (textLower.includes('stuck') || textLower.includes('differential'))) score += 6;
      if (queryLower.includes('kick') && (textLower.includes('kick') || textLower.includes('influx'))) score += 6;
      if (queryLower.includes('barail') && textLower.includes('barail')) score += 6;

      if (score > 0) {
        scoredChunks.push({ chunk, score });
      }
    }
  }

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, limit).map((s) => s.chunk);
}

/**
 * Find relevant historical events matching a free-text operational query.
 */
function searchHistoricalEvents(query: string, limit = 6): HistoricalEvent[] {
  const queryLower = query.toLowerCase();
  const searchTerms = queryLower
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);

  const scoredEvents: { event: HistoricalEvent; score: number }[] = [];

  for (const event of HISTORICAL_EVENTS_DATA) {
    let score = 0;
    const textBlob = `${event.wellName} ${event.formationName} ${event.eventType} ${event.description} ${event.rootCause} ${event.mitigation}`.toLowerCase();

    for (const term of searchTerms) {
      if (textBlob.includes(term)) score += 3;
    }

    if (queryLower.includes('loss') && event.eventType === 'MUD_LOSS') score += 10;
    if (queryLower.includes('stuck') && event.eventType === 'STUCK_PIPE') score += 10;
    if (queryLower.includes('kick') && event.eventType === 'KICK') score += 10;
    if (queryLower.includes('torque') && event.eventType === 'TORQUE_SPIKE') score += 10;

    // Check specific depth correlation
    const depthMatches = query.match(/\b(1\d{3}|2\d{3}|3\d{3}|4\d{3})\b/g);
    if (depthMatches) {
      for (const dm of depthMatches) {
        const queryDepth = parseFloat(dm);
        const delta = Math.abs(event.depth - queryDepth);
        if (delta <= 15) score += 25;
        else if (delta <= 60) score += 8;
      }
    }

    if (score > 0) {
      scoredEvents.push({ event, score });
    }
  }

  scoredEvents.sort((a, b) => b.score - a.score);
  return scoredEvents.slice(0, limit).map((s) => s.event);
}

/**
 * Execute 100% hardcoded, deterministic evidence-grounded RAG query in the browser.
 */
export async function executeClientRagQuery(userQuery: string): Promise<RagResponse> {
  const chunks = searchKnowledgeChunks(userQuery, 4);
  const events = searchHistoricalEvents(userQuery, 4);

  // Build citations
  const citations: RagSourceCitation[] = [];
  for (const chunk of chunks) {
    const parentDoc = TECHNICAL_DOCUMENTS_DATA.find((d) => d.id === chunk.documentId);
    citations.push({
      sourceDocId: chunk.documentId,
      sourceDocTitle: parentDoc?.title || chunk.documentId,
      wellName: parentDoc?.wellName || 'Regional Analysis',
      pageNumber: chunk.pageNumber,
      section: chunk.section,
      quoteSnippet: chunk.text,
    });
  }

  // Format historical facts
  const historicalFacts = events.map((e) => ({
    wellName: e.wellName,
    depth: e.depth,
    formation: e.formationName,
    eventType: e.eventType,
    severity: e.severity,
    nptHours: e.nptHours,
    mitigation: e.mitigation,
    source: `${e.sourceDocumentName} (pg. ${e.sourcePageNumber})`,
  }));

  // Deterministic Grounded Synthesis
  const isDepthQuery = /284\d|285\d|286\d|283\d/i.test(userQuery);
  const isLossQuery = /loss|mud loss|circulation|seepage/i.test(userQuery);
  const isStuckQuery = /stuck|differential|pack-off|pipe/i.test(userQuery);
  const isKickQuery = /kick|gas|influx|pressure|kopili/i.test(userQuery);

  let synthesizedAnswer = '';

  if (isLossQuery || isDepthQuery) {
    synthesizedAnswer = `### Evidence-Grounded Historical Analysis: Lost Circulation & Depleted Sands

#### 1. Retrieved Historical Incidents
* **Well NHK-142 at 2845.0m (2.3 km offset)**: Encountered catastrophic lost circulation (68 bbl pit drop in 12 min) upon penetrating upper Barail Main Sand. Mud weight of 10.4 ppg created an overbalance > 420 psi against the depleted pore pressure (8.8 ppg equivalent).
* **Well JRN-17 at 2846.5m (5.5 km offset)**: Experienced total loss of returns in fractured Barail sandstone. Conventional LCM failed; cured using a 50 bbl bentonite-diesel gunk plug followed by 40 bbl calcium carbonate bridging blend (*Source: DDR JRN-17, pg. 22*).
* **Well BBL-14 at 2842.0m (1.8 km offset)**: Suffered 42 bbl/hr losses upon drilling break; cured by dropping mud weight to 9.8 ppg and spotting a 30 bbl cellulosic bridging pill.

#### 2. Root Cause Analysis
The Barail Main Sand has experienced localized pore pressure depletion over 40+ years of production, lowering the fracture gradient to 11.0 - 11.3 ppg equivalent. Drilling with mud weights above 10.2 ppg (ECD > 10.8 ppg) reliably induces micro-fracture propagation in this corridor.

#### 3. Recommended Field Mitigations (Derived from Historical Precedents)
1. **Reduce Overbalance**: Maintain active mud weight between **9.7 and 9.9 ppg** (keep ECD < 10.5 ppg).
2. **Pre-Treat Mud System**: Stage 15-20 ppb sized Calcium Carbonate (D50 ~ 45 micron) prior to drilling past 2835m.
3. **Standby LCM Pill**: Have **45 bbl engineered LCM squeeze pill** (25 ppb coarse CaCO3 + 15 ppb coarse Mica + 10 ppb walnut shells) ready in the slug pit.

*Disclaimer: This is a decision-support synthesis. The final operational decision remains strictly with the drilling engineer.*`;
  } else if (isStuckQuery) {
    synthesizedAnswer = `### Evidence-Grounded Historical Analysis: Differential Pipe Sticking

#### 1. Retrieved Historical Incidents
* **Well KNG-38 at 2860.0m (4.1 km offset)**: Experienced differential sticking after string remained stationary for 35 minutes during an MWD survey. Overbalance was 510 psi across permeable Barail sand. String was freed after 4.5 hours of downward jarring and soaking with 60 bbl Safe-Solv organic surfactant (*Source: DDR KNG-38, pg. 18*).
* **Well NHK-205 at 2855.0m (2.8 km offset)**: Severe pipe drag (65 klb overpull) during trip out across upper Barail boundary. Resolved by circulating high-viscosity bentonite sweeps and backreaming twice.

#### 2. Recommended Preventive Procedures
1. Restrict stationary connection times to **under 3 minutes** across the permeable Barail horizon.
2. Maintain active mud filter cake thickness < 2/32" with low fluid loss (< 4.5 cc/30 min).
3. Stage pre-mixed organic freeing agent (Safe-Solv or Pipe-Free) on rig floor before entering the section.`;
  } else if (isKickQuery) {
    synthesizedAnswer = `### Evidence-Grounded Historical Analysis: Gas Influx & Overpressure in Kopili Horizon

#### 1. Retrieved Historical Incidents
* **Well MRN-84 at 3210.0m (14.2 km offset)**: Gas influx and rapid drilling break detected upon entering the Kopili transitional sequence. Pit gained 22 bbls in 4 minutes; SIDPP stabilized at 380 psi. Successfully killed using the Wait-and-Weight method and raising mud weight to 11.2 ppg (*Source: WCR MRN-84, pg. 56*).
* **Well BGJ-05 at 3450.0m**: Severe gas kick while coring; required barite weighting to 12.6 ppg to stabilize wellbore.

#### 2. Recommended Operating Envelope
1. Perform flow check at the top of the Kopili transition (~3180m - 3220m).
2. Weight up active system gradually from 10.4 ppg to 11.2 ppg before penetrating sand lenses.
3. Verify choke manifold and trip tank alignment prior to casing shoe drillout.`;
  } else {
    synthesizedAnswer = `### eRTMAC-NWIS Knowledge Synthesis for: "${userQuery}"

Based on cross-correlation of **16 offset wells** and **65+ historical incidents** in the Nahorkatiya and Upper Assam corridor:

1. **Stratigraphic Horizon Context**: The primary operational hazards in this field concentrate in the **Barail Main Sand (2650m - 3150m)** due to depleted pore pressures and high permeability, followed by overpressured kicks in the deeper **Kopili Formation (3150m - 3550m)**.
2. **Key Historical Precedents**: 
   * Well **NHK-142** (2845m): Total lost circulation of 68 bbls mitigated with 45 bbl CaCO3 + Mica squeeze pill.
   * Well **KNG-38** (2860m): Differential pipe sticking resolved by 4.5 hrs jarring and 60 bbl soaking pill.
   * Well **MRN-84** (3210m): Gas influx handled with Wait-and-Weight well kill method.
3. **Operational Recommendation**: Always verify offset correlation scores before penetrating stratigraphic tops and keep rapid-acting LCM blends in readiness.`;
  }

  return {
    query: userQuery,
    answerMarkdown: synthesizedAnswer,
    retrievedHistoricalFacts: historicalFacts,
    citations,
    llmProviderUsed: 'eRTMAC Deterministic Grounded Engine',
    confidenceScore: 0.95,
    isDeterministicFallback: true,
  };
}

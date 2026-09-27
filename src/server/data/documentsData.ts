/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  section: string;
  pageNumber: number;
  keywords: string[];
}

export interface TechnicalDocument {
  id: string;
  filename: string;
  title: string;
  documentType: 'WCR' | 'DDR' | 'EOWR' | 'MUD_LOG' | 'GEOMECHANICAL_STUDY' | 'CASING_CEMENTING';
  wellId?: string;
  wellName?: string;
  uploadDate: string;
  fileSizeKb: number;
  processingStatus: 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED';
  pageCount: number;
  extractedEntities: {
    formations: string[];
    depths: number[];
    mudWeights: number[];
    incidents: string[];
    mitigations: string[];
    drillingParameters: Record<string, string | number>;
  };
  summary: string;
  fullText: string;
  chunks: DocumentChunk[];
}

export const TECHNICAL_DOCUMENTS_DATA: TechnicalDocument[] = [
  {
    id: 'DOC-WCR-NHK-142',
    filename: 'WCR_NHK_142_Final_Report.pdf',
    title: 'Well Completion Report: Nahorkatiya Well NHK-142',
    documentType: 'WCR',
    wellId: 'OIL-HIST-01',
    wellName: 'NHK-142',
    uploadDate: '2026-08-01T10:00:00Z',
    fileSizeKb: 4850,
    processingStatus: 'COMPLETED',
    pageCount: 68,
    extractedEntities: {
      formations: ['Girujan Clay', 'Barail Main Sand (BMS)', 'Kopili Shale'],
      depths: [2410, 2650, 2845, 2858, 3320],
      mudWeights: [9.8, 10.3, 10.4],
      incidents: ['MUD_LOSS at 2845m (Total loss 68 bbls)', 'STUCK_PIPE at 2410m (Pack-off)', 'TORQUE_SPIKE at 2858m'],
      mitigations: ['Engineered LCM squeeze pill (25 ppb coarse CaCO3 + 15 ppb Mica + 10 ppb walnut shells)', 'Water wash pill and jar upward', 'Added 3% lubricant'],
      drillingParameters: {
        mudLossDepth: 2845,
        flowRateBeforeLoss: '580 gpm',
        mudWeight: '10.4 ppg',
        porePressureEquiv: '8.8 ppg',
      },
    },
    summary: 'Comprehensive Well Completion Report for NHK-142 in Nahorkatiya Field. Explores Barail Main Sand target. Highlights major lost circulation zone at 2845m with 68 bbl pit drop, successfully mitigated with coarse CaCO3 + Mica flakes LCM squeeze pill.',
    fullText: `OIL INDIA LIMITED - WELL COMPLETION REPORT
WELL: NHK-142 (FIELD: NAHORKATIYA)
SPUD DATE: 10/04/2018 | RIG: OIL-RIG-E2000 | TOTAL DEPTH: 3320m MD / 3310m TVD
TARGET FORMATION: Barail Main Sand (BMS)

1. GEOLOGICAL SUMMARY & STRATIGRAPHY:
0 - 450m: Alluvium
450 - 1100m: Dhekiajuli Formation
1100 - 2200m: Tipam Sandstone
2200 - 2650m: Girujan Clay (Reactive swelling claystones)
2650 - 3150m: Barail Main Sand (Major hydrocarbon producing sandstone intercalated with thin coal beds)
3150 - 3320m: Kopili Formation

2. DRILLING OPERATIONS & DRILLING HAZARDS:
At 2410m in 12-1/4" hole section through Girujan Clay, encountered tight hole and mechanical pack-off while back-reaming. The potassium chloride polymer mud had depleted below 5% KCl, leading to rapid hydration of smectite clays. Jarred upwards with 140 klb overpull and pumped 40 bbl wash pill to free string.

CRITICAL OPERATIONAL EVENT AT 2845m (BARAIL MAIN SAND):
On 14/05/2018 at 03:45 hrs while drilling 8-1/2" hole with 10.4 ppg KCL-PHPA polymer water-based mud (WOB: 22 klb, RPM: 110, Flow Rate: 580 gpm, SPP: 2850 psi), a drilling break was observed (ROP jumped from 9 m/hr to 32 m/hr). Immediately following the drilling break, active pit volume decreased rapidly by 68 bbls over 12 minutes (rate of loss: ~340 bbl/hr initially).
Root Cause Analysis revealed sub-hydrostatic depleted sandstone layer (effective pore pressure gradient 0.38 psi/ft ~ 8.8 ppg equivalent). Overbalance pressure exceeded 420 psi, which induced hydraulic tensile fracturing in existing natural sub-seismic micro-fractures.
Corrective & Mitigation Actions:
- Stopped rotary drilling, pulled bit up 10m off bottom into casing shoe at 2650m.
- Filled annulus continuously with base fluid through kill line to monitor fluid level.
- Formulated and spotted a 45 bbl high-fluid-loss engineered LCM squeeze pill: 25 ppb Coarse Calcium Carbonate (Safecarb 500) + 15 ppb Mica Flakes (coarse) + 10 ppb Walnut Shells (medium grade).
- Squeezed 15 bbl into formation at 250 psi hesitation pressure; held for 6 hours.
- Run back to bottom, staged circulation up to 450 gpm; 100% full returns restored. Drilling resumed with mud weight reduced to 9.9 ppg.`,
    chunks: [
      {
        id: 'CHK-WCR-NHK142-01',
        documentId: 'DOC-WCR-NHK-142',
        chunkIndex: 0,
        section: 'Executive Geological & Operational Summary',
        pageNumber: 2,
        keywords: ['NHK-142', 'Nahorkatiya', 'Barail Main Sand', 'Girujan Clay', '3320m'],
        text: 'Well NHK-142 spudded 10/04/2018 in Nahorkatiya Field targeting Barail Main Sand at 2650-3150m. Total depth achieved 3320m MD. Key formations penetrated include Alluvium, Dhekiajuli, Tipam Sandstone, Girujan Clay, and Barail Main Sand.',
      },
      {
        id: 'CHK-WCR-NHK142-02',
        documentId: 'DOC-WCR-NHK-142',
        chunkIndex: 1,
        section: 'Operational Hazards - Girujan Clay Stuck Pipe',
        pageNumber: 28,
        keywords: ['2410m', 'Girujan Clay', 'Stuck Pipe', 'Pack-off', 'KCl'],
        text: 'At 2410m in 12-1/4" hole through Girujan Clay, mechanical pack-off occurred during back-reaming due to smectite clay hydration and low KCl concentration (<5%). Resolved by jarring upwards with 140 klb overpull and pumping 40 bbl low-viscosity wash pill.',
      },
      {
        id: 'CHK-WCR-NHK142-03',
        documentId: 'DOC-WCR-NHK-142',
        chunkIndex: 2,
        section: 'Critical Incident: Severe Mud Loss at 2845m',
        pageNumber: 42,
        keywords: ['2845m', 'Mud Loss', 'Total Loss', 'Barail Main Sand', 'CaCO3', 'Mica', 'LCM Pill'],
        text: 'At 2845m in Barail Main Sand, massive mud loss occurred: 68 bbl pit drop in 12 min (340 bbl/hr initial rate) after drilling break. Caused by 10.4 ppg mud creating 420 psi overbalance on depleted 8.8 ppg pore pressure sand. Cured by spotting 45 bbl LCM pill (25 ppb Coarse CaCO3 + 15 ppb Coarse Mica + 10 ppb Walnut Shells) with 250 psi hesitation squeeze.',
      },
      {
        id: 'CHK-WCR-NHK142-04',
        documentId: 'DOC-WCR-NHK-142',
        chunkIndex: 3,
        section: 'Barail Coal Intercalation & Torque Fluctuations',
        pageNumber: 47,
        keywords: ['2858m', 'Torque Spike', 'Coal Bed', 'Stick-Slip', 'Lubricant'],
        text: 'At 2858m, torque fluctuated up to 25 kft-lb with stick-slip index > 2.0 caused by sloughing brittle coal beds interbedded within Barail sand. Mitigated by increasing mud salinity, adding 3% liquid lubricant, and controlled reaming.',
      },
    ],
  },

  {
    id: 'DOC-DDR-KNG-38',
    filename: 'DDR_KNG_38_Incident_Log.pdf',
    title: 'Daily Drilling Incident Log: Kusijan Well KNG-38',
    documentType: 'DDR',
    wellId: 'OIL-HIST-02',
    wellName: 'KNG-38',
    uploadDate: '2026-08-01T10:00:00Z',
    fileSizeKb: 2150,
    processingStatus: 'COMPLETED',
    pageCount: 32,
    extractedEntities: {
      formations: ['Barail Main Sand (BMS)'],
      depths: [2860],
      mudWeights: [10.5],
      incidents: ['STUCK_PIPE at 2860m (Differential Sticking)'],
      mitigations: ['Spotted 60 bbl low-toxicity oil-base soaking pill (Safe-Solv)', 'Downward jarring at 140 klb'],
      drillingParameters: {
        stuckDepth: 2860,
        overbalancePsi: 510,
        filterCakeThickness: '7/32 inch',
        nptHours: 46.0,
      },
    },
    summary: 'Detailed daily drilling incident log for differential sticking in KNG-38 at 2860m in depleted Barail sandstone after pipe was left stationary during MWD repair. Freed using 60 bbl soaking pill and downward jarring.',
    fullText: `OIL INDIA LIMITED - DAILY DRILLING REPORT INCIDENT RECORD
WELL: KNG-38 | DATE: 22/03/2020 | DEPTH: 2860m MD | RIG: OIL-RIG-14

INCIDENT: DIFFERENTIAL PIPE STICKING ACROSS DEPLETED BARAIL SANDSTONE
Operations Prior to Incident:
Drilled 8-1/2" hole from 2815m to 2860m. MWD tool failed transmission. Pipe set in slips with bottom drill collars positioned directly across permeable sandstone horizon at 2855-2860m. String remained stationary without rotation for 35 minutes while surface electronic connection was inspected.
Incident Occurrence:
Upon attempting to resume circulation and rotation, top drive stalled at 28 kft-lb torque. Unable to move string up or down (zero axial movement with 60 klb overpull). Full circulation maintained with 2100 psi pump pressure at 480 gpm, confirming clean annulus and ruling out mechanical pack-off.

Diagnostic Analysis:
- Mud weight in hole: 10.5 ppg (hydrostatic pressure = 2240 psi at 2860m TVD).
- Formation pore pressure: 8.8 ppg equivalent (1730 psi).
- Differential overbalance pressure = 510 psi acting across 18m of 8" drill collars pressed into 7/32" thick filter cake.
- Contact friction force calculated at ~195,000 lbs.

Resolution Procedure:
1. Applied maximum safe tensile pull (80% yield = 380 klb) and fired upward hydraulic jars for 3 hours - no movement.
2. Fired jars downward at 160 klb - no movement.
3. Formulated and spotted 60 bbl low-toxicity oil-base soaking pill (Safe-Solv with wetting agents) across drill collar section.
4. Allowed soak time of 5.5 hours, pumping 0.5 bbl every 30 minutes to move fresh surfactant along collar contact zone.
5. Fired hydraulic jars downward with 140 klb impact; drillstring immediately released.
6. Circulated out spotting fluid safely to waste pit, conditioned mud system to reduce HTHP fluid loss to < 8 cc.`,
    chunks: [
      {
        id: 'CHK-DDR-KNG38-01',
        documentId: 'DOC-DDR-KNG-38',
        chunkIndex: 0,
        section: 'Differential Sticking Incident at 2860m',
        pageNumber: 18,
        keywords: ['KNG-38', '2860m', 'Differential Sticking', 'Barail Main Sand', 'Overbalance', 'Soaking Pill'],
        text: 'KNG-38 experienced differential sticking at 2860m across depleted Barail Sandstone after remaining stationary for 35 mins during MWD repair. Overbalance was 510 psi (10.5 ppg mud vs 8.8 ppg pore pressure). Free circulation indicated differential sticking. Freed by spotting 60 bbl low-toxicity soaking pill and downward jarring.',
      },
    ],
  },

  {
    id: 'DOC-DDR-JRN-17-LOSS',
    filename: 'JRN_17_Severe_Loss_Special_Report.pdf',
    title: 'Special Incident Report: Catastrophic Mud Loss in Well JRN-17',
    documentType: 'DDR',
    wellId: 'OIL-HIST-04',
    wellName: 'JRN-17',
    uploadDate: '2026-08-01T10:00:00Z',
    fileSizeKb: 3100,
    processingStatus: 'COMPLETED',
    pageCount: 26,
    extractedEntities: {
      formations: ['Barail Main Sand (BMS)'],
      depths: [2846.5],
      mudWeights: [10.4],
      incidents: ['MUD_LOSS at 2846.5m (Total loss - 0 returns)'],
      mitigations: ['Bullheaded 50 bbl bentonite-diesel gunk plug', '40 bbl CaCO3 blend'],
      drillingParameters: {
        lossDepth: 2846.5,
        lossesRate: 'Total (0 returns)',
        nptHours: 44.0,
      },
    },
    summary: 'Investigation of total lost circulation encountered in Jorajan Well 17 at 2846.5m in Barail Main Sand. Cured using bentonite-diesel gunk plug followed by calcium carbonate bridging pill.',
    fullText: `OIL INDIA LIMITED - SPECIAL INCIDENT REPORT
WELL: JRN-17 | JORAJAN FIELD | DEPTH: 2846.5m MD
SUBJECT: TOTAL LOSS OF RETURNS IN BARAIL MAIN SANDSTONE

Incident Summary:
On 15/03/2021 at 08:00 hrs while drilling at 2846.5m with 10.4 ppg mud, sudden total loss occurred. Pit level dropped 110 bbl before pumps could be shut down. Fluid level in annulus dropped below rotary table.
Remedial Action:
Conventional LCM pills failed to seal the large fracture aperture. Driller prepared 50 bbl thixotropic bentonite-diesel plug (DOB - Diesel Oil Bentonite). The plug was pumped into the open thief zone and reacted with formation water/water-based mud, setting into an impermeable semi-rigid gel. Followed by 40 bbl CaCO3 bridging pill. Full returns were regained at 380 gpm. Total NPT: 44 hours.`,
    chunks: [
      {
        id: 'CHK-JRN17-01',
        documentId: 'DOC-DDR-JRN-17-LOSS',
        chunkIndex: 0,
        section: 'Total Loss Remediation with Bentonite-Diesel Plug',
        pageNumber: 22,
        keywords: ['JRN-17', '2846.5m', 'Total Loss', 'Bentonite-Diesel Gunk Plug', 'DOB', 'Barail'],
        text: 'In JRN-17 at 2846.5m, complete loss of returns occurred in Barail Sand. When conventional LCM failed, pumped 50 bbl bentonite-diesel gunk plug followed by 40 bbl CaCO3 bridging blend, successfully sealing massive fractures and regaining full returns.',
      },
    ],
  },

  {
    id: 'DOC-GEO-UPPER-ASSAM',
    filename: 'Regional_Geomechanical_Pore_Pressure_Study_Assam.pdf',
    title: 'Upper Assam Basin Regional Geomechanics & Depletion Pore Pressure Analysis',
    documentType: 'GEOMECHANICAL_STUDY',
    uploadDate: '2026-08-01T10:00:00Z',
    fileSizeKb: 8900,
    processingStatus: 'COMPLETED',
    pageCount: 140,
    extractedEntities: {
      formations: ['Tipam Sandstone', 'Girujan Clay', 'Barail Main Sand (BMS)', 'Kopili Shale', 'Sylhet Limestone'],
      depths: [1800, 2400, 2840, 2865, 3400, 3600],
      mudWeights: [9.6, 9.8, 10.0, 10.8, 11.5],
      incidents: ['Depletion-induced microfracturing', 'Differential sticking risk across BMS', 'Overpressured Kopili kicks'],
      mitigations: ['Keep ECD < 10.8 ppg across Barail 2830-2880m', 'Pre-treat mud with 20 ppb fine/medium CaCO3', 'Limit stationary time < 10 min'],
      drillingParameters: {
        virginBmsPorePressure: '9.3 ppg equivalent',
        depletedBmsPorePressure: '8.6 - 8.9 ppg equivalent',
        fractureGradientBms: '11.1 - 11.4 ppg equivalent',
      },
    },
    summary: 'Comprehensive regional study detailing pore pressure regimes, depletion characteristics in Barail Main Sand, geomechanical safe mud weight windows, and offset well incident correlations across Nahorkatiya, Moran, and Kusijan blocks.',
    fullText: `OIL INDIA LIMITED - GEOSCIENCE & DRILLING SERVICES
REGIONAL GEOMECHANICAL & PORE PRESSURE ATLAS: UPPER ASSAM BASIN
COVERING: NAHORKATIYA, MORAN, KUSIJAN, JORAJAN, BAGHJAN

EXECUTIVE DRILLING RECOMMENDATIONS FOR BARAIL MAIN SAND (2650m - 3150m):
1. Pore Pressure Depletion:
Due to more than 40 years of continuous hydrocarbon extraction, Barail Main Sand reservoirs exhibit severe localized pressure depletion. Pore pressure drops from virgin 0.45 psi/ft (9.3 ppg equivalent) down to 0.38 - 0.41 psi/ft (8.6 - 8.9 ppg equivalent) in producing fault blocks.
2. Narrow Drilling Window:
The reduction in pore pressure reduces the minimum horizontal principal stress (Shmin), thereby lowering the formation fracture breakdown gradient from 12.2 ppg down to 11.0 - 11.3 ppg equivalent.
Drilling with conventional 10.4 - 10.6 ppg mud results in an overbalance of 400 - 550 psi and an ECD exceeding 11.1 ppg, directly triggering hydraulic fracture propagation and massive lost circulation between 2830m and 2870m.
3. Offset Correlation Rule:
Wells within 5 km offset (e.g., NHK-142 at 2845m, JRN-17 at 2846.5m, BBL-14 at 2842m, KNG-38 at 2860m) have all encountered severe loss or sticking incidents in this exact depth interval.
RECOMMENDED SAFE PRACTICE:
- Keep mud weight between 9.7 and 9.9 ppg (ECD < 10.5 ppg).
- Add 15-20 ppb sized calcium carbonate bridging agents (D50 ~ 45 micron) prior to penetrating 2830m.
- Never leave drillstring stationary across Barail permeable sand for > 10 minutes without continuous rotation (minimum 25 RPM).
- Keep 50 bbl engineered LCM pill (CaCO3 coarse + Mica + Nut plug) pre-mixed in slug pit ready for immediate deployment.`,
    chunks: [
      {
        id: 'CHK-GEO-01',
        documentId: 'DOC-GEO-UPPER-ASSAM',
        chunkIndex: 0,
        section: 'Barail Main Sand Depletion & Narrow Safe Mud Window',
        pageNumber: 45,
        keywords: ['Pore Pressure', 'Depletion', 'Barail Main Sand', 'Fracture Gradient', 'ECD', '2830-2870m'],
        text: 'Barail Main Sand reservoirs have depleted from 9.3 ppg to 8.6-8.9 ppg equivalent. This reduces fracture gradient to 11.0-11.3 ppg. Drilling with > 10.2 ppg mud creates excessive overbalance (> 400 psi), inducing micro-fracturing and severe mud losses between 2830m and 2870m.',
      },
      {
        id: 'CHK-GEO-02',
        documentId: 'DOC-GEO-UPPER-ASSAM',
        chunkIndex: 1,
        section: 'Mitigation Guidelines for Offset Well Drilling',
        pageNumber: 52,
        keywords: ['Mitigation', 'Safe Practice', 'LCM Pill', 'Stationary Time', '9.8 ppg'],
        text: 'Best practices for Barail 2830-2880m: Maintain mud weight 9.7-9.9 ppg with ECD < 10.5 ppg; pre-treat mud with 15-20 ppb CaCO3 bridging agent; never keep string stationary for > 10 min without rotation to prevent differential sticking; keep 50 bbl coarse CaCO3/Mica LCM pill ready.',
      },
    ],
  },
];

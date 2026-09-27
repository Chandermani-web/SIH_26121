/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeologicalFormation {
  id: string;
  name: string;
  age: string;
  depthStart: number;
  depthEnd: number;
  lithology: string;
  description: string;
  typicalPorePressureGradients: number; // psi/ft
  hazardNotes: string;
}

export interface WellTrajectoryPoint {
  md: number; // Measured Depth (m)
  tvd: number; // True Vertical Depth (m)
  inclination: number; // degrees
  azimuth: number; // degrees
  northing: number; // m relative
  easting: number; // m relative
}

export type EventSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EventType =
  | 'MUD_LOSS'
  | 'STUCK_PIPE'
  | 'KICK'
  | 'OVERPRESSURE'
  | 'TORQUE_SPIKE'
  | 'CEMENTING_ISSUE'
  | 'NPT'
  | 'FISHING';

export interface HistoricalEvent {
  id: string;
  wellId: string;
  wellName: string;
  eventType: EventType;
  depth: number;
  formationId: string;
  formationName: string;
  severity: EventSeverity;
  timestamp: string;
  nptHours: number;
  costImpactInrLakhs: number;
  description: string;
  rootCause: string;
  mitigation: string;
  sourceDocumentId: string;
  sourceDocumentName: string;
  sourcePageNumber: number;
  mudWeightUsed: number; // ppg
  ecd: number; // ppg
  drillingParametersAtIncident: {
    wob: number; // klb
    rpm: number;
    torque: number; // kft-lb
    flowRate: number; // gpm
    spp: number; // psi
  };
}

export interface Well {
  id: string;
  wellName: string;
  field: string;
  block: string;
  operator: string;
  latitude: number;
  longitude: number;
  elevationMsl: number; // meters
  spudDate: string;
  completionDate?: string;
  totalDepth: number; // meters
  status: 'ACTIVE_DRILLING' | 'COMPLETED_PRODUCER' | 'ABANDONED' | 'SUSPENDED';
  targetFormation: string;
  currentDepth?: number;
  currentFormation?: string;
  trajectory: WellTrajectoryPoint[];
  casingProgram: {
    sizeInch: number;
    depthM: number;
    casingType: string;
  }[];
  isSimulatedActive?: boolean;
}

export const FORMATIONS_DATA: GeologicalFormation[] = [
  {
    id: 'F-ALLUVIUM',
    name: 'Alluvium & Dihing',
    age: 'Pleistocene - Holocene',
    depthStart: 0,
    depthEnd: 450,
    lithology: 'Unconsolidated Sands, Gravel, Pebbles, and Soft Clays',
    description: 'Surface unconsolidated gravelly strata; prone to surface hole washouts and shallow freshwater aquifer protection requirements.',
    typicalPorePressureGradients: 0.433,
    hazardNotes: 'Borehole enlargement, sand caving, conductor washouts.',
  },
  {
    id: 'F-DHEKIAJULI',
    name: 'Dhekiajuli Formation',
    age: 'Pliocene',
    depthStart: 450,
    depthEnd: 1100,
    lithology: 'Medium to coarse sandstone with claystone intercalations',
    description: 'Thick massive sandstones with clay beds; good drilling rate with water-based bentonite mud.',
    typicalPorePressureGradients: 0.442,
    hazardNotes: 'Bit balling in soft clay ribbons, high ROP leading to cuttings accumulation in annulus.',
  },
  {
    id: 'F-TIPAM',
    name: 'Tipam Sandstone',
    age: 'Miocene',
    depthStart: 1100,
    depthEnd: 2200,
    lithology: 'Massive salt-and-pepper sandstone with mottled clays',
    description: 'Major regional hydro-carbon and aquifer bearing unit in Upper Assam. Clean sands with good permeability.',
    typicalPorePressureGradients: 0.450,
    hazardNotes: 'Differential sticking in permeable zones if overbalance exceeds 400 psi; seepage mud losses.',
  },
  {
    id: 'F-GIRUJAN',
    name: 'Girujan Clay',
    age: 'Miocene',
    depthStart: 2200,
    depthEnd: 2650,
    lithology: 'Variegated claystone, mottled mudstone, thin sandstone bands',
    description: 'Extensive impermeable sealing formation over Barail sands. Contains reactive smectite and swelling clays.',
    typicalPorePressureGradients: 0.468,
    hazardNotes: 'Sloughing shale, chemical instability, tight hole on trips, high torque spikes due to swelling clay.',
  },
  {
    id: 'F-BARAIL',
    name: 'Barail Main Sand (BMS)',
    age: 'Oligocene',
    depthStart: 2650,
    depthEnd: 3150,
    lithology: 'Fine to medium grained sandstone, carbonaceous shales, coal beds',
    description: 'Prime oil-producing reservoir interval in Nahorkatiya, Moran, and Jorajan fields. Highly heterogeneous with depleted pressure compartments.',
    typicalPorePressureGradients: 0.420, // Depleted reservoir zones!
    hazardNotes: 'CRITICAL HAZARD: Massive lost circulation in micro-fractures; differential sticking across depleted sands; coal bed spalling.',
  },
  {
    id: 'F-KOPILI',
    name: 'Kopili Shale Formation',
    age: 'Late Eocene',
    depthStart: 3150,
    depthEnd: 3550,
    lithology: 'Fissile dark grey to black splintery shale with phosphatic nodules',
    description: 'Overpressured transition zone with ductile and brittle shale interleaving.',
    typicalPorePressureGradients: 0.585, // High pore pressure!
    hazardNotes: 'Severe overpressured kicks, tight pull on connections, pack-offs, explosive shale failure.',
  },
  {
    id: 'F-SYLHET',
    name: 'Sylhet Limestone & Narpuh',
    age: 'Middle Eocene',
    depthStart: 3550,
    depthEnd: 4100,
    lithology: 'Fossiliferous nummulitic limestone, marl, calcareous sandstones',
    description: 'Deep carbonate reservoir target with secondary vuggy porosity and paleokarst cavities.',
    typicalPorePressureGradients: 0.475,
    hazardNotes: 'Sudden total loss into cavernous porosity, gas influx with potential H2S traces, lost-circulation-induced underground blowouts.',
  },
];

// Oil India Limited Upper Assam Basin Fields (Nahorkatiya, Moran, Kusijan, Jorajan, Digboi, Baghjan)
export const WELLS_DATA: Well[] = [
  // Active Well
  {
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
    currentDepth: 2835.4,
    currentFormation: 'Barail Main Sand (BMS)',
    isSimulatedActive: true,
    casingProgram: [
      { sizeInch: 20, depthM: 120, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1150, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2680, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3450, casingType: 'Production Liner (Planned)' },
    ],
    trajectory: [
      { md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 },
      { md: 1000, tvd: 1000, inclination: 1.2, azimuth: 45, northing: 8.5, easting: 8.5 },
      { md: 2000, tvd: 1995, inclination: 8.4, azimuth: 62, northing: 88.2, easting: 165.4 },
      { md: 2680, tvd: 2660, inclination: 14.2, azimuth: 68, northing: 164.8, easting: 375.1 },
      { md: 2835.4, tvd: 2811.2, inclination: 15.5, azimuth: 70, northing: 188.4, easting: 432.8 },
      { md: 3450, tvd: 3402, inclination: 15.5, azimuth: 70, northing: 280.1, easting: 642.5 },
    ],
  },

  // Offset Historical Wells
  {
    id: 'OIL-HIST-01',
    wellName: 'NHK-142',
    field: 'Nahorkatiya',
    block: 'NHK Mining Lease',
    operator: 'Oil India Limited',
    latitude: 27.3115,
    longitude: 95.3582, // ~2.3 km northeast of active well
    elevationMsl: 122.0,
    spudDate: '2018-04-10',
    completionDate: '2018-07-28',
    totalDepth: 3320,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 110, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1120, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2650, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3315, casingType: 'Production Casing' },
    ],
    trajectory: [
      { md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 },
      { md: 2000, tvd: 1998, inclination: 2.1, azimuth: 110, northing: 12, easting: 32 },
      { md: 3320, tvd: 3310, inclination: 4.5, azimuth: 125, northing: 45, easting: 110 },
    ],
  },
  {
    id: 'OIL-HIST-02',
    wellName: 'KNG-38',
    field: 'Kusijan',
    block: 'Kusijan Development Area',
    operator: 'Oil India Limited',
    latitude: 27.2625,
    longitude: 95.3690, // ~4.1 km southeast
    elevationMsl: 127.3,
    spudDate: '2020-02-14',
    completionDate: '2020-06-18',
    totalDepth: 3410,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 115, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1140, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2675, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3405, casingType: 'Production Casing' },
    ],
    trajectory: [
      { md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 },
      { md: 3410, tvd: 3395, inclination: 3.8, azimuth: 95, northing: 38, easting: 85 },
    ],
  },
  {
    id: 'OIL-HIST-03',
    wellName: 'MRN-89',
    field: 'Moran',
    block: 'Moran Ext-II',
    operator: 'Oil India Limited',
    latitude: 27.2380,
    longitude: 95.3120, // ~6.8 km southwest
    elevationMsl: 119.8,
    spudDate: '2019-09-05',
    completionDate: '2019-12-22',
    totalDepth: 3580,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 125, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1160, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2710, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3575, casingType: 'Production Casing' },
    ],
    trajectory: [
      { md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 },
      { md: 3580, tvd: 3570, inclination: 2.5, azimuth: 180, northing: -60, easting: 10 },
    ],
  },
  {
    id: 'OIL-HIST-04',
    wellName: 'JRN-17',
    field: 'Jorajan',
    block: 'Jorajan North',
    operator: 'Oil India Limited',
    latitude: 27.3250,
    longitude: 95.3850, // ~5.5 km northeast
    elevationMsl: 130.2,
    spudDate: '2021-01-18',
    completionDate: '2021-05-12',
    totalDepth: 3620,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 120, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1150, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2690, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3615, casingType: 'Production Casing' },
    ],
    trajectory: [
      { md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 },
      { md: 3620, tvd: 3600, inclination: 4.1, azimuth: 35, northing: 82, easting: 58 },
    ],
  },
  {
    id: 'OIL-HIST-05',
    wellName: 'DGB-12',
    field: 'Digboi',
    block: 'Digboi Historic Basin',
    operator: 'Oil India Limited',
    latitude: 27.3820,
    longitude: 95.6180, // ~28 km east-northeast
    elevationMsl: 148.5,
    spudDate: '2017-06-01',
    completionDate: '2017-10-15',
    totalDepth: 2980,
    status: 'SUSPENDED',
    targetFormation: 'Tipam Sandstone',
    casingProgram: [
      { sizeInch: 20, depthM: 90, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 980, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2400, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 2970, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-06',
    wellName: 'BGJ-09',
    field: 'Baghjan',
    block: 'Baghjan PML',
    operator: 'Oil India Limited',
    latitude: 27.5850,
    longitude: 95.3850, // ~32 km north
    elevationMsl: 116.0,
    spudDate: '2021-11-04',
    completionDate: '2022-04-20',
    totalDepth: 3950,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Kopili & Barail',
    casingProgram: [
      { sizeInch: 20, depthM: 130, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1200, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2850, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3940, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-07',
    wellName: 'SHL-23',
    field: 'Shalmari',
    block: 'Shalmari Exploration Block',
    operator: 'Oil India Limited',
    latitude: 27.2750,
    longitude: 95.3150, // ~3.4 km southwest
    elevationMsl: 121.4,
    spudDate: '2022-03-12',
    completionDate: '2022-07-09',
    totalDepth: 3380,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 110, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1130, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2660, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3370, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-08',
    wellName: 'KMC-05',
    field: 'Kumchai',
    block: 'Arunachal Thrust Belt',
    operator: 'Oil India Limited',
    latitude: 27.4200,
    longitude: 95.7400, // ~42 km east
    elevationMsl: 210.0,
    spudDate: '2016-10-10',
    completionDate: '2017-04-05',
    totalDepth: 4250,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Girujan & Tipam',
    casingProgram: [
      { sizeInch: 20, depthM: 150, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1300, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 3100, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 4240, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-09',
    wellName: 'BBL-14',
    field: 'Borbil',
    block: 'Nahorkatiya South',
    operator: 'Oil India Limited',
    latitude: 27.2810,
    longitude: 95.3520, // ~1.8 km south-southeast
    elevationMsl: 125.1,
    spudDate: '2023-01-20',
    completionDate: '2023-05-15',
    totalDepth: 3290,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 115, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1145, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2655, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3280, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-10',
    wellName: 'TGK-07',
    field: 'Tengakhat',
    block: 'Tengakhat PML',
    operator: 'Oil India Limited',
    latitude: 27.3480,
    longitude: 95.2750, // ~8.9 km northwest
    elevationMsl: 118.0,
    spudDate: '2020-07-15',
    completionDate: '2020-11-30',
    totalDepth: 3480,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 120, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1160, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2700, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3470, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-11',
    wellName: 'DKM-02',
    field: 'Dikom',
    block: 'Dikom-Chabua',
    operator: 'Oil India Limited',
    latitude: 27.4850,
    longitude: 95.1250, // ~29 km northwest
    elevationMsl: 112.5,
    spudDate: '2019-03-01',
    completionDate: '2019-07-14',
    totalDepth: 3720,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Kopili & Sylhet',
    casingProgram: [
      { sizeInch: 20, depthM: 125, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1180, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2790, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3710, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-12',
    wellName: 'CHM-11',
    field: 'Chandmari',
    block: 'Chandmari Field',
    operator: 'Oil India Limited',
    latitude: 27.3050,
    longitude: 95.3320, // ~1.5 km northwest
    elevationMsl: 123.6,
    spudDate: '2023-06-08',
    completionDate: '2023-09-24',
    totalDepth: 3310,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 115, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1140, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2665, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3300, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-13',
    wellName: 'HBD-04',
    field: 'Hebeda',
    block: 'Nahorkatiya Extension',
    operator: 'Oil India Limited',
    latitude: 27.2780,
    longitude: 95.3280, // ~2.2 km southwest
    elevationMsl: 122.9,
    spudDate: '2021-08-19',
    completionDate: '2021-12-05',
    totalDepth: 3350,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 120, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1150, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2670, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3340, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-14',
    wellName: 'DLJ-88',
    field: 'Duliajan',
    block: 'Duliajan Hub',
    operator: 'Oil India Limited',
    latitude: 27.3550,
    longitude: 95.3180, // ~7.1 km north-northwest
    elevationMsl: 120.5,
    spudDate: '2018-11-12',
    completionDate: '2019-03-20',
    totalDepth: 3450,
    status: 'ABANDONED',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 110, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1130, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2680, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3440, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-15',
    wellName: 'MKM-03',
    field: 'Makum',
    block: 'Makum-North Hapjan',
    operator: 'Oil India Limited',
    latitude: 27.4420,
    longitude: 95.5250, // ~24 km northeast
    elevationMsl: 138.0,
    spudDate: '2022-09-02',
    completionDate: '2023-02-18',
    totalDepth: 3820,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail & Kopili',
    casingProgram: [
      { sizeInch: 20, depthM: 130, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1210, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2820, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3810, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
  {
    id: 'OIL-HIST-16',
    wellName: 'HPJ-21',
    field: 'Hapjan',
    block: 'Hapjan PML',
    operator: 'Oil India Limited',
    latitude: 27.4150,
    longitude: 95.4650, // ~18 km northeast
    elevationMsl: 132.5,
    spudDate: '2020-10-05',
    completionDate: '2021-03-01',
    totalDepth: 3690,
    status: 'COMPLETED_PRODUCER',
    targetFormation: 'Barail Main Sand (BMS)',
    casingProgram: [
      { sizeInch: 20, depthM: 120, casingType: 'Conductor' },
      { sizeInch: 13.375, depthM: 1170, casingType: 'Surface Casing' },
      { sizeInch: 9.625, depthM: 2740, casingType: 'Intermediate Casing' },
      { sizeInch: 7, depthM: 3680, casingType: 'Production Casing' },
    ],
    trajectory: [{ md: 0, tvd: 0, inclination: 0, azimuth: 0, northing: 0, easting: 0 }],
  },
];

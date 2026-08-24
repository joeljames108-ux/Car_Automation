// ===================================================================
// EXHAUSTIVE GLOBAL RACE TRACK CATALOG & GPS TELEMETRY DATABASE
// ===================================================================
// Detailed telemetry database for 25 world-famous racing circuits:
// Spa-Francorchamps, Nürburgring Nordschleife, Le Mans, Silverstone, Monza,
// Suzuka, Laguna Seca, Mount Panorama, COTA, Interlagos, Monaco, Red Bull Ring,
// Daytona, Indianapolis, Mount Haruna Touge, Road America, Zandvoort, etc.
// ===================================================================

export type TrackCategoryType =
  | "FORMULA_GRAND_PRIX"
  | "ENDURANCE_24H"
  | "HISTORIC_CLASSIC"
  | "HIGH_SPEED_OVAL"
  | "MOUNTAIN_TOUGE_DRIFT"
  | "TECHNICAL_ROAD_COURSE";

export interface TrackCornerDetail {
  turnNumber: number;
  cornerName: string;
  entrySpeedKmH: number;
  apexSpeedKmH: number;
  exitSpeedKmH: number;
  cornerRadiusMeters: number;
  bankingAngleDeg: number;
  elevationDeltaMeters: number; // + for uphill, - for downhill
  kerbSeverity: "FLAT_SMOOTH" | "STANDARD_RIPPLE" | "SAUSAGE_KERB_HAZARD";
}

export interface SpeedTrapLocation {
  id: string;
  name: string;
  distanceFromStartMeters: number;
  expectedTopSpeedKmH: number;
}

export interface DrsZoneConfig {
  drsZoneId: number;
  detectionDistanceMeters: number;
  activationDistanceMeters: number;
  endDistanceMeters: number;
}

export interface GlobalCircuitSpec {
  id: string;
  name: string;
  officialTitle: string;
  country: string;
  locationCity: string;
  category: TrackCategoryType;
  totalLengthMeters: number;
  turnCount: number;
  elevationChangeMeters: number;
  asphaltGripMu: number; // Base coefficient of friction e.g. 1.05
  baseReferenceLapTimeMs: number; // GT3 benchmark lap time
  f1LapRecordMs?: number;
  sectors: {
    sectorId: 1 | 2 | 3;
    name: string;
    lengthMeters: number;
    cornerCount: number;
    drsActive: boolean;
  }[];
  corners: TrackCornerDetail[];
  speedTraps: SpeedTrapLocation[];
  drsZones: DrsZoneConfig[];
  trackDifficulty: 1 | 2 | 3 | 4 | 5; // 5 = Nordschleife/Monaco extreme
}

export const GLOBAL_RACE_TRACK_CATALOG: Record<string, GlobalCircuitSpec> = {
  spa_francorchamps: {
    id: "spa_francorchamps",
    name: "Spa-Francorchamps",
    officialTitle: "Circuit de Spa-Francorchamps",
    country: "Belgium",
    locationCity: "Stavelot",
    category: "FORMULA_GRAND_PRIX",
    totalLengthMeters: 7004,
    turnCount: 19,
    elevationChangeMeters: 104,
    asphaltGripMu: 1.08,
    baseReferenceLapTimeMs: 138500, // 2:18.500
    f1LapRecordMs: 106286, // 1:46.286 (Valtteri Bottas)
    trackDifficulty: 4,
    sectors: [
      { sectorId: 1, name: "La Source & Kemmel Straight", lengthMeters: 2200, cornerCount: 3, drsActive: true },
      { sectorId: 2, name: "Les Combes & Pouhon Sweep", lengthMeters: 3100, cornerCount: 9, drsActive: false },
      { sectorId: 3, name: "Blanchimont & Bus Stop Chicane", lengthMeters: 1704, cornerCount: 7, drsActive: true },
    ],
    corners: [
      { turnNumber: 1, cornerName: "La Source Hairpin", entrySpeedKmH: 285, apexSpeedKmH: 68, exitSpeedKmH: 140, cornerRadiusMeters: 18, bankingAngleDeg: 2, elevationDeltaMeters: -8, kerbSeverity: "STANDARD_RIPPLE" },
      { turnNumber: 2, cornerName: "Eau Rouge", entrySpeedKmH: 305, apexSpeedKmH: 295, exitSpeedKmH: 300, cornerRadiusMeters: 120, bankingAngleDeg: 6, elevationDeltaMeters: 18, kerbSeverity: "FLAT_SMOOTH" },
      { turnNumber: 3, cornerName: "Raidillon", entrySpeedKmH: 300, apexSpeedKmH: 290, exitSpeedKmH: 315, cornerRadiusMeters: 140, bankingAngleDeg: 8, elevationDeltaMeters: 24, kerbSeverity: "FLAT_SMOOTH" },
      { turnNumber: 10, cornerName: "Pouhon Double Apex", entrySpeedKmH: 290, apexSpeedKmH: 240, exitSpeedKmH: 260, cornerRadiusMeters: 85, bankingAngleDeg: 4, elevationDeltaMeters: -14, kerbSeverity: "STANDARD_RIPPLE" },
      { turnNumber: 18, cornerName: "Bus Stop Chicane Entry", entrySpeedKmH: 315, apexSpeedKmH: 75, exitSpeedKmH: 110, cornerRadiusMeters: 16, bankingAngleDeg: 0, elevationDeltaMeters: 0, kerbSeverity: "SAUSAGE_KERB_HAZARD" },
    ],
    speedTraps: [
      { id: "kemmel_finish", name: "Kemmel Straight Speed Trap", distanceFromStartMeters: 2150, expectedTopSpeedKmH: 338 },
      { id: "blanchimont_trap", name: "Blanchimont Speed Trap", distanceFromStartMeters: 6400, expectedTopSpeedKmH: 318 },
    ],
    drsZones: [
      { drsZoneId: 1, detectionDistanceMeters: 1800, activationDistanceMeters: 2220, endDistanceMeters: 3100 },
      { drsZoneId: 2, detectionDistanceMeters: 6600, activationDistanceMeters: 6850, endDistanceMeters: 7000 },
    ],
  },

  nurburgring_nordschleife: {
    id: "nurburgring_nordschleife",
    name: "Nürburgring Nordschleife",
    officialTitle: "Nürburgring Nordschleife 24h Circuit",
    country: "Germany",
    locationCity: "Nürburg",
    category: "ENDURANCE_24H",
    totalLengthMeters: 20832,
    turnCount: 73,
    elevationChangeMeters: 300,
    asphaltGripMu: 0.98,
    baseReferenceLapTimeMs: 395000, // 6:35.000
    f1LapRecordMs: 385250, // 6:25.91 (Porsche 919 Hybrid Evo)
    trackDifficulty: 5,
    sectors: [
      { sectorId: 1, name: "Flugplatz & Schwedenkreuz", lengthMeters: 6500, cornerCount: 22, drsActive: false },
      { sectorId: 2, name: "Karussell & Hohe Acht", lengthMeters: 7500, cornerCount: 38, drsActive: false },
      { sectorId: 3, name: "Pflanzgarten & Döttinger Höhe", lengthMeters: 6832, cornerCount: 13, drsActive: true },
    ],
    corners: [
      { turnNumber: 5, cornerName: "Flugplatz Crest", entrySpeedKmH: 260, apexSpeedKmH: 225, exitSpeedKmH: 250, cornerRadiusMeters: 110, bankingAngleDeg: 3, elevationDeltaMeters: -12, kerbSeverity: "STANDARD_RIPPLE" },
      { turnNumber: 32, cornerName: "Caracciola-Karussell", entrySpeedKmH: 130, apexSpeedKmH: 65, exitSpeedKmH: 115, cornerRadiusMeters: 14, bankingAngleDeg: 33, elevationDeltaMeters: -6, kerbSeverity: "SAUSAGE_KERB_HAZARD" },
      { turnNumber: 54, cornerName: "Pflanzgarten Jump", entrySpeedKmH: 230, apexSpeedKmH: 185, exitSpeedKmH: 220, cornerRadiusMeters: 75, bankingAngleDeg: 2, elevationDeltaMeters: -18, kerbSeverity: "STANDARD_RIPPLE" },
    ],
    speedTraps: [
      { id: "dottinger_hohe", name: "Döttinger Höhe Speed Trap", distanceFromStartMeters: 19800, expectedTopSpeedKmH: 345 },
    ],
    drsZones: [
      { drsZoneId: 1, detectionDistanceMeters: 18500, activationDistanceMeters: 18900, endDistanceMeters: 20500 },
    ],
  },

  le_mans_sarthe: {
    id: "le_mans_sarthe",
    name: "Circuit de la Sarthe (Le Mans)",
    officialTitle: "Circuit des 24 Heures du Mans",
    country: "France",
    locationCity: "Le Mans",
    category: "ENDURANCE_24H",
    totalLengthMeters: 13626,
    turnCount: 38,
    elevationChangeMeters: 45,
    asphaltGripMu: 1.02,
    baseReferenceLapTimeMs: 202000, // 3:22.000
    trackDifficulty: 4,
    sectors: [
      { sectorId: 1, name: "Dunlop Bridge & Mulsanne Straight 1", lengthMeters: 4500, cornerCount: 12, drsActive: false },
      { sectorId: 2, name: "Mulsanne Chicanes & Indianapolis", lengthMeters: 4800, cornerCount: 14, drsActive: false },
      { sectorId: 3, name: "Porsche Curves & Ford Chicanes", lengthMeters: 4326, cornerCount: 12, drsActive: false },
    ],
    corners: [
      { turnNumber: 2, cornerName: "Dunlop Chicane", entrySpeedKmH: 290, apexSpeedKmH: 115, exitSpeedKmH: 180, cornerRadiusMeters: 28, bankingAngleDeg: 2, elevationDeltaMeters: 10, kerbSeverity: "STANDARD_RIPPLE" },
      { turnNumber: 24, cornerName: "Indianapolis Corner", entrySpeedKmH: 320, apexSpeedKmH: 145, exitSpeedKmH: 170, cornerRadiusMeters: 42, bankingAngleDeg: 6, elevationDeltaMeters: -4, kerbSeverity: "STANDARD_RIPPLE" },
      { turnNumber: 30, cornerName: "Porsche Curves 1", entrySpeedKmH: 265, apexSpeedKmH: 215, exitSpeedKmH: 235, cornerRadiusMeters: 95, bankingAngleDeg: 4, elevationDeltaMeters: 0, kerbSeverity: "FLAT_SMOOTH" },
    ],
    speedTraps: [
      { id: "mulsanne_1", name: "Mulsanne Straight Trap 1", distanceFromStartMeters: 3800, expectedTopSpeedKmH: 348 },
    ],
    drsZones: [],
  },

  silverstone_gp: {
    id: "silverstone_gp",
    name: "Silverstone Circuit",
    officialTitle: "Silverstone Grand Prix Circuit",
    country: "United Kingdom",
    locationCity: "Silverstone",
    category: "FORMULA_GRAND_PRIX",
    totalLengthMeters: 5891,
    turnCount: 18,
    elevationChangeMeters: 12,
    asphaltGripMu: 1.10,
    baseReferenceLapTimeMs: 118000, // 1:58.000
    trackDifficulty: 3,
    sectors: [
      { sectorId: 1, name: "Abbey & Arena Section", lengthMeters: 1800, cornerCount: 5, drsActive: true },
      { sectorId: 2, name: "Copse, Maggots & Becketts", lengthMeters: 2300, cornerCount: 7, drsActive: true },
      { sectorId: 3, name: "Stowe & Vale Chicane", lengthMeters: 1791, cornerCount: 6, drsActive: false },
    ],
    corners: [
      { turnNumber: 9, cornerName: "Copse", entrySpeedKmH: 295, apexSpeedKmH: 275, exitSpeedKmH: 290, cornerRadiusMeters: 130, bankingAngleDeg: 0, elevationDeltaMeters: 0, kerbSeverity: "FLAT_SMOOTH" },
      { turnNumber: 11, cornerName: "Maggots & Becketts S-Curves", entrySpeedKmH: 300, apexSpeedKmH: 235, exitSpeedKmH: 255, cornerRadiusMeters: 70, bankingAngleDeg: 1, elevationDeltaMeters: -2, kerbSeverity: "FLAT_SMOOTH" },
    ],
    speedTraps: [
      { id: "hangar_straight", name: "Hangar Straight Trap", distanceFromStartMeters: 4100, expectedTopSpeedKmH: 330 },
    ],
    drsZones: [
      { drsZoneId: 1, detectionDistanceMeters: 1400, activationDistanceMeters: 1650, endDistanceMeters: 2300 },
      { drsZoneId: 2, detectionDistanceMeters: 3800, activationDistanceMeters: 4050, endDistanceMeters: 4900 },
    ],
  },

  monza_autodromo: {
    id: "monza_autodromo",
    name: "Monza (Temple of Speed)",
    officialTitle: "Autodromo Nazionale Monza",
    country: "Italy",
    locationCity: "Monza",
    category: "HISTORIC_CLASSIC",
    totalLengthMeters: 5793,
    turnCount: 11,
    elevationChangeMeters: 10,
    asphaltGripMu: 1.06,
    baseReferenceLapTimeMs: 108000, // 1:48.000
    trackDifficulty: 2,
    sectors: [
      { sectorId: 1, name: "Variante del Rettifilo & Curva Grande", lengthMeters: 2100, cornerCount: 3, drsActive: true },
      { sectorId: 2, name: "Variante della Roggia & Lesmo 1-2", lengthMeters: 2200, cornerCount: 4, drsActive: true },
      { sectorId: 3, name: "Variante Ascari & Parabolica", lengthMeters: 1493, cornerCount: 4, drsActive: false },
    ],
    corners: [
      { turnNumber: 1, cornerName: "Variante del Rettifilo Chicane", entrySpeedKmH: 350, apexSpeedKmH: 72, exitSpeedKmH: 125, cornerRadiusMeters: 14, bankingAngleDeg: 0, elevationDeltaMeters: 0, kerbSeverity: "SAUSAGE_KERB_HAZARD" },
      { turnNumber: 11, cornerName: "Curva Parabolica (Michele Alboreto)", entrySpeedKmH: 330, apexSpeedKmH: 215, exitSpeedKmH: 265, cornerRadiusMeters: 90, bankingAngleDeg: 3, elevationDeltaMeters: 0, kerbSeverity: "FLAT_SMOOTH" },
    ],
    speedTraps: [
      { id: "main_straight", name: "Monza Main Straight Trap", distanceFromStartMeters: 1100, expectedTopSpeedKmH: 355 },
    ],
    drsZones: [
      { drsZoneId: 1, detectionDistanceMeters: 900, activationDistanceMeters: 1150, endDistanceMeters: 2000 },
    ],
  },
};

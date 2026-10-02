/**
 * AUTO TYCOON CAMPUS HQ - PLOT COORDINATE SYSTEM (PHASE 1)
 * 
 * Maps all 14 campus plots to exact 3D world-space meter coordinates,
 * matching the 45° resin diorama isometric reference layout.
 * 
 * Coordinate System:
 * - Origin (0, 0, 0): Central Plaza between Corporate HQ and Design Studio.
 * - +X: East / Right
 * - -X: West / Left (towards Manufacturing & Logistics Zone A)
 * - +Z: South / Front (towards Track Perimeter & Special Ops Zone D)
 * - -Z: North / Back (towards Engineering Zone B)
 * - +Y: Elevation (Ground = 0)
 */

import { CampusUnitId, CampusUnitKey, CampusZone } from "./campusTypes";

export type PlotTerrainType = "grass" | "paved" | "gravel" | "industrial" | "track_border";

export interface CampusPlotDefinition {
  plotId: string;
  unitId: CampusUnitId;
  unitKey: CampusUnitKey;
  name: string;
  zoneId: CampusZone;
  zoneName: string;
  worldPosition: {
    x: number;
    y: number;
    z: number;
  };
  rotationDeg: number;
  rotationRad: number;
  footprintMeters: {
    width: number;
    length: number;
    height: number;
  };
  isActive1970: boolean;
  terrainType: PlotTerrainType;
  roadAccessPoint: {
    x: number;
    z: number;
  };
  expansionReserveMeters: {
    width: number;
    length: number;
  };
  description: string;
}

export interface ZoneBoundaryPolygon {
  zoneId: CampusZone;
  name: string;
  colorHex: string;
  fillOpacity: number;
  vertices: Array<{ x: number; z: number }>;
}

/**
 * 14 Campus Plot Definitions
 */
export const CAMPUS_PLOTS: Record<CampusUnitId, CampusPlotDefinition> = {
  // ── ZONE C: CORPORATE & STYLING CENTER (Origin / Core Hub) ──
  CENTRAL_CORPORATE_HQ: {
    plotId: "PLOT_01",
    unitId: "CENTRAL_CORPORATE_HQ",
    unitKey: "UNIT_01",
    name: "Central Corporate HQ Plot",
    zoneId: "ZONE_C",
    zoneName: "Zone C: Core Styling & Corporate",
    worldPosition: { x: 25, y: 0, z: -20 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 24, length: 24, height: 18 },
    isActive1970: true,
    terrainType: "paved",
    roadAccessPoint: { x: 25, z: -5 },
    expansionReserveMeters: { width: 36, length: 36 },
    description: "Central administrative plaza, executive suites, boardroom, finance, and prototype engineering bays.",
  },

  VEHICLE_DESIGN_HQ: {
    plotId: "PLOT_04",
    unitId: "VEHICLE_DESIGN_HQ",
    unitKey: "UNIT_04",
    name: "Vehicle Design HQ Plot",
    zoneId: "ZONE_C",
    zoneName: "Zone C: Core Styling & Corporate",
    worldPosition: { x: 75, y: 0, z: -20 },
    rotationDeg: -10,
    rotationRad: (-10 * Math.PI) / 180,
    footprintMeters: { width: 36, length: 36, height: 16 },
    isActive1970: true,
    terrainType: "paved",
    roadAccessPoint: { x: 75, z: -5 },
    expansionReserveMeters: { width: 44, length: 44 },
    description: "North-light styling studios, 1:1 clay modeling halls, CMF material library, and VR review theater.",
  },

  QUALITY_RELIABILITY_HQ: {
    plotId: "PLOT_12",
    unitId: "QUALITY_RELIABILITY_HQ",
    unitKey: "UNIT_12",
    name: "Quality & Reliability HQ Plot",
    zoneId: "ZONE_C",
    zoneName: "Zone C: Core Styling & Corporate",
    worldPosition: { x: 120, y: 0, z: -20 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 24, length: 24, height: 14 },
    isActive1970: false, // Locked in 1970
    terrainType: "paved",
    roadAccessPoint: { x: 120, z: -5 },
    expansionReserveMeters: { width: 30, length: 30 },
    description: "Metrology, coordinate measurement machines, environmental aging, warranty data, and zero-defect QA.",
  },

  MARKETING_SALES_HQ: {
    plotId: "PLOT_14",
    unitId: "MARKETING_SALES_HQ",
    unitKey: "UNIT_14",
    name: "Marketing & Sales HQ Plot",
    zoneId: "ZONE_C",
    zoneName: "Zone C: Core Styling & Corporate",
    worldPosition: { x: 50, y: 0, z: 45 },
    rotationDeg: 15,
    rotationRad: (15 * Math.PI) / 180,
    footprintMeters: { width: 32, length: 32, height: 15 },
    isActive1970: true,
    terrainType: "paved",
    roadAccessPoint: { x: 50, z: 25 },
    expansionReserveMeters: { width: 40, length: 40 },
    description: "Dealer franchise headquarters, press relations, global launch theater, advertising, and digital studio.",
  },

  // ── ZONE B: ENGINEERING & VALIDATION (North Sector) ──
  POWERTRAIN_EV_HQ: {
    plotId: "PLOT_02",
    unitId: "POWERTRAIN_EV_HQ",
    unitKey: "UNIT_02",
    name: "Powertrain & EV HQ Plot",
    zoneId: "ZONE_B",
    zoneName: "Zone B: Engineering & Validation",
    worldPosition: { x: -75, y: 0, z: -20 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 36, length: 36, height: 16 },
    isActive1970: true,
    terrainType: "industrial",
    roadAccessPoint: { x: -75, z: -5 },
    expansionReserveMeters: { width: 48, length: 48 },
    description: "ICE engine drafting, water-brake dynamometers, gearbox prototyping, emissions bench, and EV battery labs.",
  },

  CHASSIS_DYNAMICS_HQ: {
    plotId: "PLOT_05",
    unitId: "CHASSIS_DYNAMICS_HQ",
    unitKey: "UNIT_05",
    name: "Chassis & Dynamics HQ Plot",
    zoneId: "ZONE_B",
    zoneName: "Zone B: Engineering & Validation",
    worldPosition: { x: -25, y: 0, z: -20 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 28, length: 36, height: 15 },
    isActive1970: true,
    terrainType: "industrial",
    roadAccessPoint: { x: -25, z: -5 },
    expansionReserveMeters: { width: 36, length: 44 },
    description: "Suspension kinematic rigs, 7-post shaker test rigs, steering compliance rigs, and DIL simulators.",
  },

  INTERIOR_HQ: {
    plotId: "PLOT_06",
    unitId: "INTERIOR_HQ",
    unitKey: "UNIT_06",
    name: "Interior & HMI HQ Plot",
    zoneId: "ZONE_B",
    zoneName: "Zone B: Engineering & Validation",
    worldPosition: { x: -25, y: 0, z: -70 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 24, length: 24, height: 14 },
    isActive1970: true,
    terrainType: "paved",
    roadAccessPoint: { x: -25, z: -55 },
    expansionReserveMeters: { width: 32, length: 32 },
    description: "Ergonomics bucks, foam & leather upholstery shop, climate chamber HVAC tests, and digital cockpit UX labs.",
  },

  TESTING_VALIDATION_HQ: {
    plotId: "PLOT_07",
    unitId: "TESTING_VALIDATION_HQ",
    unitKey: "UNIT_07",
    name: "Testing & Validation HQ Plot",
    zoneId: "ZONE_B",
    zoneName: "Zone B: Engineering & Validation",
    worldPosition: { x: -75, y: 0, z: -75 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 45, length: 45, height: 16 },
    isActive1970: false, // Locked in 1970
    terrainType: "gravel",
    roadAccessPoint: { x: -75, z: -55 },
    expansionReserveMeters: { width: 60, length: 60 },
    description: "Rough-road Belgian block torture tracks, salt-spray corrosion baths, high-temperature environmental domes.",
  },

  // ── ZONE A: MANUFACTURING & SUPPLY CHAIN (North-West Sector) ──
  FACTORY: {
    plotId: "PLOT_10",
    unitId: "FACTORY",
    unitKey: "UNIT_10",
    name: "Manufacturing Plant Complex Plot",
    zoneId: "ZONE_A",
    zoneName: "Zone A: Logistics & Production",
    worldPosition: { x: -140, y: 0, z: -70 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 75, length: 90, height: 22 },
    isActive1970: false, // Starts outsourced in 1970
    terrainType: "industrial",
    roadAccessPoint: { x: -100, z: -70 },
    expansionReserveMeters: { width: 120, length: 150 },
    description: "Full-scale vehicle assembly plant: stamping press lines, automated paint shop, marrying skids, and rail spur.",
  },

  SUPPLIER_PROCUREMENT_HQ: {
    plotId: "PLOT_11",
    unitId: "SUPPLIER_PROCUREMENT_HQ",
    unitKey: "UNIT_11",
    name: "Supplier & Procurement HQ Plot",
    zoneId: "ZONE_A",
    zoneName: "Zone A: Logistics & Production",
    worldPosition: { x: -130, y: 0, z: -15 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 36, length: 36, height: 14 },
    isActive1970: true,
    terrainType: "industrial",
    roadAccessPoint: { x: -105, z: -15 },
    expansionReserveMeters: { width: 45, length: 45 },
    description: "Logistics staging docks, BOM cost ledger control, supplier contract bidding rooms, and incoming parts audit.",
  },

  // ── ZONE D: SPECIAL OPERATIONS & PERIMETER TRACK (South & East Sector) ──
  AERO_HQ: {
    plotId: "PLOT_03",
    unitId: "AERO_HQ",
    unitKey: "UNIT_03",
    name: "Aero HQ & Wind Tunnel Plot",
    zoneId: "ZONE_D",
    zoneName: "Zone D: Special Operations & Track Perimeter",
    worldPosition: { x: 130, y: 0, z: -75 },
    rotationDeg: -90,
    rotationRad: (-90 * Math.PI) / 180,
    footprintMeters: { width: 36, length: 50, height: 18 },
    isActive1970: false, // Locked in 1970
    terrainType: "industrial",
    roadAccessPoint: { x: 110, z: -75 },
    expansionReserveMeters: { width: 45, length: 65 },
    description: "Closed-loop boundary-layer wind tunnel, moving ground plane belt, smoke visualization, and supercomputer CFD cluster.",
  },

  MOTORSPORT_HQ: {
    plotId: "PLOT_08",
    unitId: "MOTORSPORT_HQ",
    unitKey: "UNIT_08",
    name: "Motorsport & Works Team HQ Plot",
    zoneId: "ZONE_D",
    zoneName: "Zone D: Special Operations & Track Perimeter",
    worldPosition: { x: 135, y: 0, z: 40 },
    rotationDeg: -15,
    rotationRad: (-15 * Math.PI) / 180,
    footprintMeters: { width: 45, length: 45, height: 16 },
    isActive1970: false, // Locked in 1970
    terrainType: "track_border",
    roadAccessPoint: { x: 110, z: 40 },
    expansionReserveMeters: { width: 55, length: 55 },
    description: "Works racing team garage, carbon-composite autoclave ovens, telemetry pits, and direct pitlane track access.",
  },

  COMMERCIAL_VEHICLES_HQ: {
    plotId: "PLOT_09",
    unitId: "COMMERCIAL_VEHICLES_HQ",
    unitKey: "UNIT_09",
    name: "Commercial Vehicles HQ Plot",
    zoneId: "ZONE_D",
    zoneName: "Zone D: Special Operations & Track Perimeter",
    worldPosition: { x: -80, y: 0, z: 50 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 45, length: 45, height: 18 },
    isActive1970: false, // Locked in 1970
    terrainType: "industrial",
    roadAccessPoint: { x: -55, z: 50 },
    expansionReserveMeters: { width: 55, length: 55 },
    description: "Heavy-duty truck frames, fleet van engineering, high-tonnage hoist bays, bus bodywork jigs, and diesel/EV dynos.",
  },

  SAFETY_HQ: {
    plotId: "PLOT_13",
    unitId: "SAFETY_HQ",
    unitKey: "UNIT_13",
    name: "Safety & Crash Test Center Plot",
    zoneId: "ZONE_D",
    zoneName: "Zone D: Special Operations & Track Perimeter",
    worldPosition: { x: -15, y: 0, z: 65 },
    rotationDeg: 0,
    rotationRad: 0,
    footprintMeters: { width: 28, length: 70, height: 16 },
    isActive1970: false, // Locked in 1970
    terrainType: "industrial",
    roadAccessPoint: { x: -15, z: 30 },
    expansionReserveMeters: { width: 35, length: 90 },
    description: "150m cable-pull linear crash propulsion track, frontal rigid barrier, photogrammetry lighting array, and dummy lab.",
  },
};

/**
 * 4 Campus Zone Polygon Boundaries (World-space meters)
 */
export const CAMPUS_ZONE_BOUNDARIES: Record<CampusZone, ZoneBoundaryPolygon> = {
  ZONE_A: {
    zoneId: "ZONE_A",
    name: "Zone A: Logistics & Production",
    colorHex: "#f87171", // Soft Red
    fillOpacity: 0.15,
    vertices: [
      { x: -180, z: -110 },
      { x: -95, z: -110 },
      { x: -95, z: 10 },
      { x: -180, z: 10 },
    ],
  },
  ZONE_B: {
    zoneId: "ZONE_B",
    name: "Zone B: Engineering & Validation",
    colorHex: "#60a5fa", // Soft Blue
    fillOpacity: 0.15,
    vertices: [
      { x: -95, z: -110 },
      { x: 0, z: -110 },
      { x: 0, z: 5 },
      { x: -95, z: 5 },
    ],
  },
  ZONE_C: {
    zoneId: "ZONE_C",
    name: "Zone C: Core Styling & Corporate",
    colorHex: "#fbbf24", // Soft Gold / Warm Amber
    fillOpacity: 0.15,
    vertices: [
      { x: 0, z: -60 },
      { x: 150, z: -60 },
      { x: 150, z: 70 },
      { x: 0, z: 70 },
    ],
  },
  ZONE_D: {
    zoneId: "ZONE_D",
    name: "Zone D: Special Operations & Track Perimeter",
    colorHex: "#34d399", // Soft Emerald / Sage
    fillOpacity: 0.15,
    vertices: [
      { x: -180, z: 15 },
      { x: 180, z: 15 },
      { x: 180, z: 120 },
      { x: -180, z: 120 },
    ],
  },
};

/**
 * Helper Utilities
 */
export function getPlotByUnitId(unitId: CampusUnitId): CampusPlotDefinition | undefined {
  return CAMPUS_PLOTS[unitId];
}

export function getAllPlots(): CampusPlotDefinition[] {
  return Object.values(CAMPUS_PLOTS);
}

export function getPlotsByZone(zoneId: CampusZone): CampusPlotDefinition[] {
  return Object.values(CAMPUS_PLOTS).filter((p) => p.zoneId === zoneId);
}

export function getStarterPlots1970(): CampusPlotDefinition[] {
  return Object.values(CAMPUS_PLOTS).filter((p) => p.isActive1970);
}

export function getLockedPlots1970(): CampusPlotDefinition[] {
  return Object.values(CAMPUS_PLOTS).filter((p) => !p.isActive1970);
}

/**
 * Point-in-polygon test (ray casting algorithm)
 */
export function isPointInZone(x: number, z: number, zoneId: CampusZone): boolean {
  const boundary = CAMPUS_ZONE_BOUNDARIES[zoneId];
  if (!boundary) return false;
  const vs = boundary.vertices;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x;
    const zi = vs[i].z;
    const xj = vs[j].x;
    const zj = vs[j].z;
    const intersect = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Resolves the procedural 3D GLB model path for any campus unit and progression tier.
 */
export const CAMPUS_UNIT_MODEL_PREFIXES: Record<CampusUnitId, string> = {
  CENTRAL_CORPORATE_HQ: "hq_01_corporate",
  POWERTRAIN_EV_HQ: "hq_02_powertrain",
  AERO_HQ: "hq_03_aero",
  VEHICLE_DESIGN_HQ: "hq_04_design",
  CHASSIS_DYNAMICS_HQ: "hq_05_chassis",
  INTERIOR_HQ: "hq_06_interior",
  TESTING_VALIDATION_HQ: "hq_07_testing",
  MOTORSPORT_HQ: "hq_08_motorsport",
  COMMERCIAL_VEHICLES_HQ: "hq_09_commercial",
  FACTORY: "hq_10_factory",
  SUPPLIER_PROCUREMENT_HQ: "hq_11_procurement",
  QUALITY_RELIABILITY_HQ: "hq_12_quality",
  SAFETY_HQ: "hq_13_safety",
  MARKETING_SALES_HQ: "hq_14_marketing",
};

export function getCampusModelPath(unitId: CampusUnitId, level: number = 1, isLocked: boolean = false): string {
  const levelNum = isLocked ? 0 : Math.max(0, Math.min(7, level));
  const prefix = CAMPUS_UNIT_MODEL_PREFIXES[unitId] || "hq_01_corporate";
  return `/models/campus/${prefix}_l${levelNum}.glb`;
}

/**
 * Resolves the 3D GLB model path for the HQ Cargo Railway Terminal facility.
 */
export function getRailwayModelPath(level: number = 0): string {
  const safeLevel = Math.max(0, Math.min(5, level));
  return `/models/campus/hq_railway_l${safeLevel}.glb`;
}

export const RAILWAY_TERMINAL_PLOT: CampusPlotDefinition = {
  plotId: "PLOT_RAILWAY",
  unitId: "FACTORY",
  unitKey: "UNIT_10",
  name: "HQ Cargo Railway Terminal",
  zoneId: "ZONE_A",
  zoneName: "Zone A: Logistics & Production",
  worldPosition: { x: -180, y: 0, z: -45 },
  rotationDeg: 0,
  rotationRad: 0,
  footprintMeters: { width: 55, length: 110, height: 18 },
  isActive1970: true,
  terrainType: "industrial",
  roadAccessPoint: { x: -150, z: -45 },
  expansionReserveMeters: { width: 70, length: 130 },
  description: "Multi-modal rail freight terminal with heavy ballasted tracks, overhead gantry cranes, container storage, and direct factory auto-rack sidings.",
};


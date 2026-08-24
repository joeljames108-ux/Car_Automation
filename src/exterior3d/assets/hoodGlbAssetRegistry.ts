// ===================================================================
// HOOD GLB ASSET REGISTRY & VEHICLE CONFIGURATIONS
// ===================================================================
// Wires every exported sculpted hood GLB under public/models/exterior/
// into the exterior 3D scene graph. Each preset carries its full vehicle
// configuration (body type, wheelbase, track, paint, metallurgy grade)
// plus closed/open articulation variants for interactive hood states.
// ===================================================================

import type { MaterialGrade } from "../../sim/assemblyTypes";
import type { VehicleBodyType } from "../types/vehicleConstructionTypes";

export interface HoodGlbAssetConfig {
  id: string;
  label: string;
  vehicleName: string;
  bodyType: VehicleBodyType;
  wheelbaseMm: number;
  trackWidthMm: number;
  paintColorHex: number;
  materialGrade: MaterialGrade;
  assetPathClosed: string;
  assetPathOpen: string;
  massKg: number;
  articulationRangeDeg: number;
}

export const HOOD_GLB_ASSET_CONFIGS: HoodGlbAssetConfig[] = [
  {
    id: "supercar_bmw_i8",
    label: "BMW i8 Supercar Hood",
    vehicleName: "BMW_i8_Supercar",
    bodyType: "supercar",
    wheelbaseMm: 2800,
    trackWidthMm: 1620,
    paintColorHex: 0x2563eb,
    materialGrade: "forged",
    assetPathClosed: "/models/exterior/bmw_i8_supercar_hood_closed.glb",
    assetPathOpen: "/models/exterior/bmw_i8_supercar_hood_open.glb",
    massKg: 14,
    articulationRangeDeg: 50,
  },
  {
    id: "gt3_ford_escort",
    label: "Escort RS GT3 Hood",
    vehicleName: "Ford_Escort_RS_Cosworth_GT3",
    bodyType: "sports_car",
    wheelbaseMm: 2551,
    trackWidthMm: 1580,
    paintColorHex: 0xdc2626,
    materialGrade: "forged",
    assetPathClosed: "/models/exterior/ford_escort_rs_cosworth_gt3_hood_closed.glb",
    assetPathOpen: "/models/exterior/ford_escort_rs_cosworth_gt3_hood_open.glb",
    massKg: 13,
    articulationRangeDeg: 50,
  },
  {
    id: "hatchback_ford_escort",
    label: "Escort RS Hatchback Hood",
    vehicleName: "Ford_Escort_RS_Cosworth",
    bodyType: "hatchback",
    wheelbaseMm: 2551,
    trackWidthMm: 1580,
    paintColorHex: 0x059669,
    materialGrade: "billet",
    assetPathClosed: "/models/exterior/ford_escort_rs_cosworth_hood_closed.glb",
    assetPathOpen: "/models/exterior/ford_escort_rs_cosworth_hood_open.glb",
    massKg: 12,
    articulationRangeDeg: 50,
  },
];

export const DEFAULT_HOOD_GLB_ID = "supercar_bmw_i8";

export function resolveHoodGlbConfig(presetId: string): HoodGlbAssetConfig {
  return (
    HOOD_GLB_ASSET_CONFIGS.find((p) => p.id === presetId) ||
    HOOD_GLB_ASSET_CONFIGS[0]
  );
}

export interface ResolvedHoodGlbAsset {
  config: HoodGlbAssetConfig;
  open: boolean;
  assetPath: string;
}

/**
 * Resolves the active hood GLB asset path for a given preset and
 * articulation state. The shared `hood.glb` / `hood_panel.glb` files are
 * byte-identical copies of the supercar preset in its closed state.
 */
export function resolveHoodGlbAsset(presetId: string, open: boolean): ResolvedHoodGlbAsset {
  const config = resolveHoodGlbConfig(presetId);
  return {
    config,
    open,
    assetPath: open ? config.assetPathOpen : config.assetPathClosed,
  };
}

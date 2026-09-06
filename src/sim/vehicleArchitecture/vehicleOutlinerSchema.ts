// ============================================================================
// VEHICLE 3D OUTLINER HIERARCHY & NAMING CONVENTIONS SCHEMA
// ============================================================================
// Enforces a clean Outliner hierarchy and strict naming convention for:
// - Fast modifier management (Mirror Modifiers on .L targeting origin Empty)
// - Panel seam alignment via shared vertex groups (VG_PanelSeam_*)
// - Material-driven collection sorting and transparent shader passes
// - Selective GLB exports (filtering COL_ collision and 00_Reference blueprints)
// ============================================================================

import { VehicleCategory } from "./vehicleArchitectureTypes";

export type OutlinerPrefix = "GEO" | "SM" | "COL" | "REF";

export type OutlinerSide = "L" | "R" | "CENTER";

export type OutlinerCollectionId =
  | "00_Reference"
  | "01_Body_Main"
  | "02_Bumpers_Aero"
  | "03_Glass_Greenhouse"
  | "04_Lighting"
  | "05_Exterior_Hardware"
  | "06_Running_Gear";

export type ShaderPassType =
  | "reference_data"
  | "painted_surface"
  | "fascia_trim"
  | "glass_transmission"
  | "lighting_emissive"
  | "exterior_hardware"
  | "running_gear";

export interface OutlinerCollectionDefinition {
  id: OutlinerCollectionId;
  order: number;
  name: string;
  description: string;
  shaderPass: ShaderPassType;
  isRenderable: boolean;
  isGlbExportable: boolean;
  viewportColorRgba: [number, number, number, number];
}

export const OUTLINER_COLLECTIONS: Record<OutlinerCollectionId, OutlinerCollectionDefinition> = {
  "00_Reference": {
    id: "00_Reference",
    order: 0,
    name: "00_Reference",
    description: "Reference blueprints, packaging boxes, and origin empties",
    shaderPass: "reference_data",
    isRenderable: false,
    isGlbExportable: false,
    viewportColorRgba: [0.3, 0.6, 1.0, 0.4],
  },
  "01_Body_Main": {
    id: "01_Body_Main",
    order: 1,
    name: "01_Body_Main",
    description: "Primary painted outer sheet metal / carbon panels",
    shaderPass: "painted_surface",
    isRenderable: true,
    isGlbExportable: true,
    viewportColorRgba: [0.9, 0.2, 0.2, 1.0],
  },
  "02_Bumpers_Aero": {
    id: "02_Bumpers_Aero",
    order: 2,
    name: "02_Bumpers_Aero",
    description: "Front/rear fascias, diffusers, grilles, and spoilers",
    shaderPass: "fascia_trim",
    isRenderable: true,
    isGlbExportable: true,
    viewportColorRgba: [0.2, 0.2, 0.2, 1.0],
  },
  "03_Glass_Greenhouse": {
    id: "03_Glass_Greenhouse",
    order: 3,
    name: "03_Glass_Greenhouse",
    description: "Transparent laminated windshield, backlight, and side glazing",
    shaderPass: "glass_transmission",
    isRenderable: true,
    isGlbExportable: true,
    viewportColorRgba: [0.1, 0.8, 0.9, 0.3],
  },
  "04_Lighting": {
    id: "04_Lighting",
    order: 4,
    name: "04_Lighting",
    description: "Emissive DRLs, LED projector lenses, and taillight housings",
    shaderPass: "lighting_emissive",
    isRenderable: true,
    isGlbExportable: true,
    viewportColorRgba: [1.0, 0.9, 0.2, 1.0],
  },
  "05_Exterior_Hardware": {
    id: "05_Exterior_Hardware",
    order: 5,
    name: "05_Exterior_Hardware",
    description: "Side mirrors, door handles, windshield wipers, roof antenna, seals",
    shaderPass: "exterior_hardware",
    isRenderable: true,
    isGlbExportable: true,
    viewportColorRgba: [0.4, 0.4, 0.45, 1.0],
  },
  "06_Running_Gear": {
    id: "06_Running_Gear",
    order: 6,
    name: "06_Running_Gear",
    description: "Alloy rims, rubber tires, brake calipers/rotors, wheel arch liners, underbody shield",
    shaderPass: "running_gear",
    isRenderable: true,
    isGlbExportable: true,
    viewportColorRgba: [0.15, 0.15, 0.18, 1.0],
  },
};

/**
 * Standard vertex groups for panel gap continuity and seam alignment
 */
export type PanelSeamVertexGroup =
  | "VG_PanelSeam_Front" // Hood <-> Front Fender seam
  | "VG_PanelSeam_A_Pillar" // Front Fender <-> A-Pillar / Windshield base
  | "VG_PanelSeam_Door_Front" // Front Fender <-> Front Door gap
  | "VG_PanelSeam_Door_B_Pillar" // Front Door <-> Rear Door / B-Pillar gap
  | "VG_PanelSeam_Door_Rear" // Rear Door <-> Rear Quarter Panel gap
  | "VG_PanelSeam_Trunk" // Rear Quarter Panel <-> Trunk / Decklid gap
  | "VG_PanelSeam_Rocker" // Doors <-> Rocker Panel / Side Skirt gap
  | "VG_PanelSeam_Bumper_Front" // Fenders/Hood <-> Front Bumper Fascia
  | "VG_PanelSeam_Bumper_Rear"; // Quarter Panel/Trunk <-> Rear Bumper Fascia

export interface OutlinerNodeTemplate {
  partName: string;
  collectionId: OutlinerCollectionId;
  prefix: OutlinerPrefix;
  isSymmetrical: boolean;
  defaultSide?: OutlinerSide;
  description: string;
  panelSeamGroups?: PanelSeamVertexGroup[];
  hasMirrorModifier: boolean;
  mirrorTargetObject?: string;
  categorySpecific?: VehicleCategory[];
}

/**
 * Master catalog of standard Outliner nodes adhering to the 7-collection hierarchy
 */
export const OUTLINER_NODE_CATALOG: OutlinerNodeTemplate[] = [
  // ── 00_Reference ──
  {
    partName: "Blueprint_Top",
    collectionId: "00_Reference",
    prefix: "REF",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Top-down orthographic blueprint projection",
    hasMirrorModifier: false,
  },
  {
    partName: "Blueprint_Side",
    collectionId: "00_Reference",
    prefix: "REF",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Side-view orthographic blueprint projection",
    hasMirrorModifier: false,
  },
  {
    partName: "Blueprint_Front",
    collectionId: "00_Reference",
    prefix: "REF",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Front-view orthographic blueprint projection",
    hasMirrorModifier: false,
  },
  {
    partName: "Blueprint_Rear",
    collectionId: "00_Reference",
    prefix: "REF",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Rear-view orthographic blueprint projection",
    hasMirrorModifier: false,
  },
  {
    partName: "Origin_Empty",
    collectionId: "00_Reference",
    prefix: "REF",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Central Empty coordinate origin (0,0,0) used as target for Mirror Modifiers",
    hasMirrorModifier: false,
  },

  // ── 01_Body_Main ──
  {
    partName: "Hood",
    collectionId: "01_Body_Main",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Centerline hood outer panel",
    panelSeamGroups: ["VG_PanelSeam_Front", "VG_PanelSeam_Bumper_Front"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Roof",
    collectionId: "01_Body_Main",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Cabin roof crown panel",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Trunk",
    collectionId: "01_Body_Main",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Rear trunk lid / hatch / tailgate outer panel",
    panelSeamGroups: ["VG_PanelSeam_Trunk", "VG_PanelSeam_Bumper_Rear"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Fender_Front",
    collectionId: "01_Body_Main",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front wing / quarter fender outer panel",
    panelSeamGroups: ["VG_PanelSeam_Front", "VG_PanelSeam_A_Pillar", "VG_PanelSeam_Door_Front", "VG_PanelSeam_Bumper_Front"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "QuarterPanel_Rear",
    collectionId: "01_Body_Main",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Rear quarter panel & C-pillar / D-pillar outer skin",
    panelSeamGroups: ["VG_PanelSeam_Door_Rear", "VG_PanelSeam_Trunk", "VG_PanelSeam_Bumper_Rear"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Door_Front",
    collectionId: "01_Body_Main",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front side passenger door outer panel",
    panelSeamGroups: ["VG_PanelSeam_Door_Front", "VG_PanelSeam_Door_B_Pillar", "VG_PanelSeam_Rocker"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Door_Rear",
    collectionId: "01_Body_Main",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Rear passenger door outer panel",
    panelSeamGroups: ["VG_PanelSeam_Door_B_Pillar", "VG_PanelSeam_Door_Rear", "VG_PanelSeam_Rocker"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "RockerPanel",
    collectionId: "01_Body_Main",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Lower sill rocker panel / side aerodynamic skirt",
    panelSeamGroups: ["VG_PanelSeam_Rocker"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },

  // ── 02_Bumpers_Aero ──
  {
    partName: "Bumper_Front",
    collectionId: "02_Bumpers_Aero",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Front bumper cover fascia and lower chin",
    panelSeamGroups: ["VG_PanelSeam_Bumper_Front"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Bumper_Rear",
    collectionId: "02_Bumpers_Aero",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Rear bumper cover fascia",
    panelSeamGroups: ["VG_PanelSeam_Bumper_Rear"],
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Grille_Upper",
    collectionId: "02_Bumpers_Aero",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Upper radiator grille mesh / active shutter bezel",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Grille_Lower",
    collectionId: "02_Bumpers_Aero",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Lower intake aperture grille",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Diffuser_Rear",
    collectionId: "02_Bumpers_Aero",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Rear aerodynamic underbody diffuser with strake fins",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Spoiler_Trunk",
    collectionId: "02_Bumpers_Aero",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Trunk ducktail lip or rear roof spoiler wing",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },

  // ── 03_Glass_Greenhouse ──
  {
    partName: "Windshield",
    collectionId: "03_Glass_Greenhouse",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Acoustic laminated front windshield glass",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Rear_Backlight",
    collectionId: "03_Glass_Greenhouse",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Tempered rear window glass with defroster grid",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "DoorWindow_Front",
    collectionId: "03_Glass_Greenhouse",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front side door drop glass",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "DoorWindow_Rear",
    collectionId: "03_Glass_Greenhouse",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Rear side door drop glass",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "QuarterWindow",
    collectionId: "03_Glass_Greenhouse",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Fixed rear C-pillar / D-pillar quarter glass pane",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },

  // ── 04_Lighting ──
  {
    partName: "Headlight_Housing",
    collectionId: "04_Lighting",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Headlamp bucket housing and internal projector bezel",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Headlight_Lens",
    collectionId: "04_Lighting",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Crystal clear polycarbonate front headlight outer lens",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Taillight_Housing",
    collectionId: "04_Lighting",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Rear taillight internal optic reflector housing",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Taillight_Lens",
    collectionId: "04_Lighting",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Red/smoke tinted acrylic taillight outer lens",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Foglight",
    collectionId: "04_Lighting",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Lower bumper fog / cornering light assembly",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "CHMSL",
    collectionId: "04_Lighting",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Center High-Mount Stop Light (Third brake light)",
    hasMirrorModifier: false,
  },

  // ── 05_Exterior_Hardware ──
  {
    partName: "Mirror_Housing",
    collectionId: "05_Exterior_Hardware",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Aerodynamic wing mirror shell and mounting stalk",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Mirror_Glass",
    collectionId: "05_Exterior_Hardware",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Convex chrome-coated side mirror reflective glass",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "DoorHandle_Front",
    collectionId: "05_Exterior_Hardware",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front flush or pull door handle mechanism",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "DoorHandle_Rear",
    collectionId: "05_Exterior_Hardware",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Rear passenger door handle",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Wiper_Arm",
    collectionId: "05_Exterior_Hardware",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Articulated windshield wiper arm and rubber blade",
    hasMirrorModifier: false, // Wipers are tandem, usually not pure symmetry
  },
  {
    partName: "Antenna_Roof",
    collectionId: "05_Exterior_Hardware",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Roof-mounted shark fin aerodynamic radio antenna",
    hasMirrorModifier: false,
  },
  {
    partName: "Window_Trim_Rubber",
    collectionId: "05_Exterior_Hardware",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Greenhouse beltline weatherstrip and surround molding",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },

  // ── 06_Running_Gear ──
  {
    partName: "Wheel_Rim_Front",
    collectionId: "06_Running_Gear",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front cast/forged alloy wheel rim",
    hasMirrorModifier: false, // Wheels are distinct instances per corner
  },
  {
    partName: "Wheel_Tire_Front",
    collectionId: "06_Running_Gear",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front performance pneumatic rubber tire with tread pattern",
    hasMirrorModifier: false,
  },
  {
    partName: "Brake_Caliper_Front",
    collectionId: "06_Running_Gear",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front multi-piston painted brake caliper",
    hasMirrorModifier: false,
  },
  {
    partName: "Brake_Rotor_Front",
    collectionId: "06_Running_Gear",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front cross-drilled / ventilated brake disc rotor",
    hasMirrorModifier: false,
  },
  {
    partName: "WheelArch_Liner_Front",
    collectionId: "06_Running_Gear",
    prefix: "GEO",
    isSymmetrical: true,
    defaultSide: "L",
    description: "Front thermoplastic wheel arch splash guard liner",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
  {
    partName: "Underbody_Shield",
    collectionId: "06_Running_Gear",
    prefix: "GEO",
    isSymmetrical: false,
    defaultSide: "CENTER",
    description: "Flat floor aerodynamic undertray and engine skid plate",
    hasMirrorModifier: true,
    mirrorTargetObject: "REF_Origin_Empty",
  },
];

// ============================================================================
// NODE NAME PARSING & VALIDATION ENGINE
// ============================================================================

export interface ParsedOutlinerNode {
  rawName: string;
  prefix: OutlinerPrefix;
  assetTag?: string;
  categoryTag?: string;
  partName: string;
  subPart?: string;
  side: OutlinerSide;
  symmetryNotation: "dot" | "underscore" | "none";
  collectionId: OutlinerCollectionId;
  shaderPass: ShaderPassType;
  isRenderable: boolean;
  isGlbExportable: boolean;
  mirrorTarget?: string;
  panelSeamGroups: PanelSeamVertexGroup[];
}

export interface NodeValidationReport {
  isValid: boolean;
  rawName: string;
  parsed?: ParsedOutlinerNode;
  errors: string[];
  warnings: string[];
}

/**
 * Parses node names conforming to:
 * 1. Blender dot notation: GEO_Fender_Front.L, GEO_Hood, REF_Blueprint_Top
 * 2. Underscore notation: GEO_Fender_Front_L, SM_Door_Rear_R
 * 3. Extended enterprise format: Car_Sedan_GEO_Door_Front_Panel_L
 */
export function parseOutlinerNodeName(nodeName: string): ParsedOutlinerNode | null {
  if (!nodeName || typeof nodeName !== "string") return null;

  const trimmed = nodeName.trim();
  if (trimmed.length === 0) return null;

  // Detect symmetry notation
  let side: OutlinerSide = "CENTER";
  let symmetryNotation: "dot" | "underscore" | "none" = "none";
  let cleanName = trimmed;

  if (trimmed.endsWith(".L") || trimmed.endsWith(".l")) {
    side = "L";
    symmetryNotation = "dot";
    cleanName = trimmed.substring(0, trimmed.length - 2);
  } else if (trimmed.endsWith(".R") || trimmed.endsWith(".r")) {
    side = "R";
    symmetryNotation = "dot";
    cleanName = trimmed.substring(0, trimmed.length - 2);
  } else if (trimmed.endsWith("_L") || trimmed.endsWith("_l")) {
    side = "L";
    symmetryNotation = "underscore";
    cleanName = trimmed.substring(0, trimmed.length - 2);
  } else if (trimmed.endsWith("_R") || trimmed.endsWith("_r")) {
    side = "R";
    symmetryNotation = "underscore";
    cleanName = trimmed.substring(0, trimmed.length - 2);
  }

  // Detect Type Prefix: GEO_, SM_, COL_, REF_
  let prefix: OutlinerPrefix = "GEO";
  if (cleanName.startsWith("GEO_")) {
    prefix = "GEO";
    cleanName = cleanName.substring(4);
  } else if (cleanName.startsWith("SM_")) {
    prefix = "SM";
    cleanName = cleanName.substring(3);
  } else if (cleanName.startsWith("COL_")) {
    prefix = "COL";
    cleanName = cleanName.substring(4);
  } else if (cleanName.startsWith("REF_")) {
    prefix = "REF";
    cleanName = cleanName.substring(4);
  }

  // Check if there are remaining tokens (e.g. Asset_Category_PartName_SubPart)
  const tokens = cleanName.split("_").filter(Boolean);
  const partName = tokens.length > 0 ? tokens.join("_") : cleanName;

  // Infer collection mapping from partName
  const matchingCatalog = OUTLINER_NODE_CATALOG.find((cat) =>
    partName.toLowerCase().includes(cat.partName.toLowerCase()) ||
    cat.partName.toLowerCase().includes(partName.toLowerCase())
  );

  let collectionId: OutlinerCollectionId = matchingCatalog ? matchingCatalog.collectionId : "01_Body_Main";
  if (prefix === "REF" || partName.startsWith("Blueprint") || partName.includes("Empty")) {
    collectionId = "00_Reference";
  }

  const collectionDef = OUTLINER_COLLECTIONS[collectionId];

  const isGlbExportable = prefix !== "COL" && collectionDef.isGlbExportable;
  const isRenderable = prefix !== "COL" && prefix !== "REF" && collectionDef.isRenderable;

  return {
    rawName: nodeName,
    prefix,
    partName,
    side,
    symmetryNotation,
    collectionId,
    shaderPass: collectionDef.shaderPass,
    isRenderable,
    isGlbExportable,
    mirrorTarget: side === "L" || matchingCatalog?.hasMirrorModifier ? "REF_Origin_Empty" : undefined,
    panelSeamGroups: matchingCatalog?.panelSeamGroups || [],
  };
}

/**
 * Validates a node name against strict outliner production standards
 */
export function validateOutlinerNodeName(nodeName: string): NodeValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!nodeName || nodeName.trim().length === 0) {
    return {
      isValid: false,
      rawName: nodeName,
      errors: ["Node name cannot be empty"],
      warnings: [],
    };
  }

  const parsed = parseOutlinerNodeName(nodeName);
  if (!parsed) {
    return {
      isValid: false,
      rawName: nodeName,
      errors: ["Failed to parse node name syntax"],
      warnings: [],
    };
  }

  // Check prefix validity
  const validPrefixes = ["GEO_", "SM_", "COL_", "REF_"];
  const hasValidPrefix = validPrefixes.some((p) => nodeName.startsWith(p) || nodeName.includes(`_${p}`));
  if (!hasValidPrefix) {
    warnings.push(
      `Node '${nodeName}' lacks a recognized prefix (${validPrefixes.join(", ")}). Defaults to GEO.`
    );
  }

  // Check symmetry notation
  if (parsed.side !== "CENTER" && parsed.symmetryNotation === "none") {
    warnings.push("Symmetrical element is missing explicit .L / .R or _L / _R symmetry suffix.");
  }

  // Check collision mesh conventions
  if (parsed.prefix === "COL") {
    if (parsed.isGlbExportable) {
      errors.push("Collision meshes (COL_*) must be flagged as non-exportable for visual GLB passes.");
    }
  }

  return {
    isValid: errors.length === 0,
    rawName: nodeName,
    parsed,
    errors,
    warnings,
  };
}

/**
 * Formats a standardized node name
 */
export function formatOutlinerNodeName(opts: {
  prefix: OutlinerPrefix;
  partName: string;
  subPart?: string;
  side?: OutlinerSide;
  symmetryStyle?: "dot" | "underscore";
}): string {
  const { prefix, partName, subPart, side = "CENTER", symmetryStyle = "dot" } = opts;
  let base = `${prefix}_${partName}`;
  if (subPart) {
    base += `_${subPart}`;
  }
  if (side === "L") {
    return symmetryStyle === "dot" ? `${base}.L` : `${base}_L`;
  }
  if (side === "R") {
    return symmetryStyle === "dot" ? `${base}.R` : `${base}_R`;
  }
  return base;
}

// ============================================================================
// PLATFORM OUTLINER HIERARCHY GENERATOR
// ============================================================================

export interface OutlinerHierarchyCollectionNode {
  id: OutlinerCollectionId;
  name: string;
  description: string;
  shaderPass: ShaderPassType;
  isRenderable: boolean;
  isGlbExportable: boolean;
  nodes: {
    name: string;
    prefix: OutlinerPrefix;
    side: OutlinerSide;
    hasMirrorModifier: boolean;
    mirrorTarget?: string;
    panelSeamGroups: PanelSeamVertexGroup[];
    description: string;
  }[];
}

export interface VehicleOutlinerScene {
  category: VehicleCategory;
  masterRootCollection: string;
  collections: OutlinerHierarchyCollectionNode[];
  summary: {
    totalNodes: number;
    symmetricalNodesCount: number;
    mirrorModifierCount: number;
    vertexSeamGroupsCount: number;
    glbVisualNodesCount: number;
  };
}

/**
 * Generates the full 7-collection Outliner hierarchy for a given vehicle platform
 */
export function getVehicleOutlinerHierarchy(category: VehicleCategory): VehicleOutlinerScene {
  const categoryCap = category.charAt(0).toUpperCase() + category.slice(1);
  const masterRoot = `Car_${categoryCap}_Master`;

  const collections: OutlinerHierarchyCollectionNode[] = (
    Object.keys(OUTLINER_COLLECTIONS) as OutlinerCollectionId[]
  ).map((colId) => {
    const colDef = OUTLINER_COLLECTIONS[colId];
    const templates = OUTLINER_NODE_CATALOG.filter((item) => item.collectionId === colId);

    const nodes: OutlinerHierarchyCollectionNode["nodes"] = [];

    templates.forEach((t) => {
      if (t.isSymmetrical) {
        // Dot notation by default for native Blender mirror workflow
        nodes.push({
          name: formatOutlinerNodeName({ prefix: t.prefix, partName: t.partName, side: "L", symmetryStyle: "dot" }),
          prefix: t.prefix,
          side: "L",
          hasMirrorModifier: t.hasMirrorModifier,
          mirrorTarget: t.mirrorTargetObject,
          panelSeamGroups: t.panelSeamGroups || [],
          description: `${t.description} (Left / Active modeling mesh)`,
        });
        nodes.push({
          name: formatOutlinerNodeName({ prefix: t.prefix, partName: t.partName, side: "R", symmetryStyle: "dot" }),
          prefix: t.prefix,
          side: "R",
          hasMirrorModifier: false,
          panelSeamGroups: t.panelSeamGroups || [],
          description: `${t.description} (Right / Mirrored instance)`,
        });
      } else {
        nodes.push({
          name: formatOutlinerNodeName({ prefix: t.prefix, partName: t.partName, side: "CENTER" }),
          prefix: t.prefix,
          side: "CENTER",
          hasMirrorModifier: t.hasMirrorModifier,
          mirrorTarget: t.mirrorTargetObject,
          panelSeamGroups: t.panelSeamGroups || [],
          description: t.description,
        });
      }
    });

    return {
      id: colDef.id,
      name: colDef.name,
      description: colDef.description,
      shaderPass: colDef.shaderPass,
      isRenderable: colDef.isRenderable,
      isGlbExportable: colDef.isGlbExportable,
      nodes,
    };
  });

  let totalNodes = 0;
  let symmetricalNodesCount = 0;
  let mirrorModifierCount = 0;
  let vertexSeamGroupsCount = 0;
  let glbVisualNodesCount = 0;

  collections.forEach((col) => {
    col.nodes.forEach((n) => {
      totalNodes++;
      if (n.side !== "CENTER") symmetricalNodesCount++;
      if (n.hasMirrorModifier) mirrorModifierCount++;
      if (n.panelSeamGroups && n.panelSeamGroups.length > 0) vertexSeamGroupsCount++;
      if (col.isGlbExportable && n.prefix !== "COL") glbVisualNodesCount++;
    });
  });

  return {
    category,
    masterRootCollection: masterRoot,
    collections,
    summary: {
      totalNodes,
      symmetricalNodesCount,
      mirrorModifierCount,
      vertexSeamGroupsCount,
      glbVisualNodesCount,
    },
  };
}

/**
 * Rules for GLB export filtering pipeline
 */
export interface GlbExportFilterRule {
  filterName: string;
  ruleDescription: string;
  predicate: (node: ParsedOutlinerNode) => boolean;
  action: "include" | "exclude";
}

export const GLB_EXPORT_FILTER_RULES: GlbExportFilterRule[] = [
  {
    filterName: "Exclude References",
    ruleDescription: "Omit 00_Reference collection (blueprints, reference planes, and origin empties) from visual GLB",
    predicate: (node) => node.collectionId === "00_Reference" || node.prefix === "REF",
    action: "exclude",
  },
  {
    filterName: "Exclude Collision Meshes",
    ruleDescription: "Omit COL_* collision geometry from visual render/GLB passes (saved to separate physics collision package)",
    predicate: (node) => node.prefix === "COL",
    action: "exclude",
  },
  {
    filterName: "Include Visual Geometry",
    ruleDescription: "Include all GEO_* and SM_* meshes within collections 01 to 06",
    predicate: (node) =>
      (node.prefix === "GEO" || node.prefix === "SM") && node.collectionId !== "00_Reference",
    action: "include",
  },
];

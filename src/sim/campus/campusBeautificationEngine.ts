/**
 * AUTO TYCOON CAMPUS HQ - DYNAMIC HQ PRESTIGE & BEAUTIFICATION SYSTEM
 * 
 * Core Philosophy:
 * - HQ Level = Functional capability (R&D speed, staff capacity, machinery)
 * - Company Reputation = Prestige, aesthetic appearance, and campus presentation
 * 
 * Features:
 * - 5 Reputation-driven Prestige Tiers (Startup -> Iconic Empire)
 * - Dynamic Beautification Point Budgeting
 * - Historical Heritage Preservation (assets once built become heritage, never erased)
 * - Specialization Differentiation (Engineering, Motorsport, Safety, Luxury, Environmental)
 * - Layered procedural asset visibility overrides (replacesAssetId)
 */

import { CampusBonusSummary } from "./campusBonusEngine";
import { CampusUnitDefinition, CampusUnitId } from "./campusTypes";

// ══════════════════════════════════════════════════════════════════════════
// 1. DOMAIN TYPES & CONSTANTS
// ══════════════════════════════════════════════════════════════════════════

export type BeautificationTier =
  | "STARTUP"      // 0–10
  | "GROWING"      // 11–25
  | "ESTABLISHED"  // 26–50
  | "PRESTIGIOUS"  // 51–75
  | "ICONIC";      // 76–100

export type ReputationSpecialization =
  | "engineering"
  | "motorsport"
  | "safety"
  | "luxury"
  | "environmental";

export type BeautificationCategory =
  | "entrance"
  | "landscaping"
  | "water_feature"
  | "sculpture"
  | "signage"
  | "lighting"
  | "monument"
  | "specialty";

export type PlacementZone =
  | "entrance"
  | "perimeter"
  | "courtyard"
  | "rooftop"
  | "interior_lobby"
  | "plaza"
  | "gardens";

export interface BeautificationAsset {
  id: string;
  category: BeautificationCategory;
  name: string;
  description: string;
  minTier: BeautificationTier;
  budgetCost: number;
  specialization?: ReputationSpecialization;
  isHeritage: boolean;
  placementZone: PlacementZone;
  glbAssetTag: string;
  priority: number; // Higher priority gets chosen first within budget
  replacesAssetId?: string; // Supersedes earlier asset (e.g. entrance upgrades), preserving old as heritage
}

export interface BeautificationAssetInstance {
  assetId: string;
  placedAtReputation: number;
  placedAtGameMonth: number;
  isHeritage: boolean;
  active: boolean;
  isOverridden?: boolean;
  weathered?: boolean;
}

export interface CampusBeautificationState {
  tier: BeautificationTier;
  tierLabel: string;
  totalBudget: number;
  budgetSpent: number;
  activeAssets: BeautificationAssetInstance[];
  heritageAssets: BeautificationAssetInstance[];
  dominantSpecialization: ReputationSpecialization | null;
  specializationScores: Record<ReputationSpecialization, number>;
  lastEvaluationMonth: number;
  lastReputationScore: number;
}

export const BEAUTIFICATION_TIER_CONFIG: Record<
  BeautificationTier,
  { label: string; minRep: number; maxRep: number; budget: number; badgeColor: string }
> = {
  STARTUP: {
    label: "Founding Workshop & Basic Grounds",
    minRep: 0,
    maxRep: 10,
    budget: 20,
    badgeColor: "text-slate-700 bg-slate-100 border-slate-300",
  },
  GROWING: {
    label: "Growing Regional Headquarters",
    minRep: 11,
    maxRep: 25,
    budget: 50,
    badgeColor: "text-emerald-800 bg-emerald-100 border-emerald-300",
  },
  ESTABLISHED: {
    label: "Established Brand Complex",
    minRep: 26,
    maxRep: 50,
    budget: 120,
    badgeColor: "text-blue-800 bg-blue-100 border-blue-300",
  },
  PRESTIGIOUS: {
    label: "Prestigious OEM Campus",
    minRep: 51,
    maxRep: 75,
    budget: 220,
    badgeColor: "text-indigo-800 bg-indigo-100 border-indigo-300",
  },
  ICONIC: {
    label: "Iconic Automotive Empire",
    minRep: 76,
    maxRep: 100,
    budget: 350,
    badgeColor: "text-purple-800 bg-purple-100 border-purple-300",
  },
};

const TIER_ORDER: Record<BeautificationTier, number> = {
  STARTUP: 1,
  GROWING: 2,
  ESTABLISHED: 3,
  PRESTIGIOUS: 4,
  ICONIC: 5,
};

// ══════════════════════════════════════════════════════════════════════════
// 2. MASTER BEAUTIFICATION ASSET REGISTRY (~45 ASSETS ACROSS 8 CATEGORIES)
// ══════════════════════════════════════════════════════════════════════════

export const BEAUTIFICATION_ASSET_REGISTRY: Record<string, BeautificationAsset> = {
  // ── 1. ENTRANCE (7 Assets) ──
  ENT_BASIC_DOOR: {
    id: "ENT_BASIC_DOOR",
    category: "entrance",
    name: "Standard Personnel Entrance",
    description: "Modest single-door glass entrance with utilitarian steel frame canopy.",
    minTier: "STARTUP",
    budgetCost: 5,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_ENT_BASIC",
    priority: 25,
  },
  ENT_DOUBLE_GLASS: {
    id: "ENT_DOUBLE_GLASS",
    category: "entrance",
    name: "Double Glazed Executive Portal",
    description: "Wide automatic sliding glass doors with brushed aluminum transom.",
    minTier: "GROWING",
    budgetCost: 12,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_ENT_DOUBLE_GLASS",
    priority: 35,
    replacesAssetId: "ENT_BASIC_DOOR",
  },
  ENT_BRANDED_PORTICO: {
    id: "ENT_BRANDED_PORTICO",
    category: "entrance",
    name: "Branded Portico & Column Entry",
    description: "Cantilevered stone portico displaying laser-cut company heraldry.",
    minTier: "ESTABLISHED",
    budgetCost: 25,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_ENT_BRANDED_PORTICO",
    priority: 45,
    replacesAssetId: "ENT_DOUBLE_GLASS",
  },
  ENT_GLASS_LOBBY: {
    id: "ENT_GLASS_LOBBY",
    category: "entrance",
    name: "Double-Height Glass Atrium Lobby",
    description: "Floor-to-ceiling curtain wall entrance with grand reception rotunda.",
    minTier: "ESTABLISHED",
    budgetCost: 35,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_ENT_GLASS_LOBBY",
    priority: 55,
    replacesAssetId: "ENT_BRANDED_PORTICO",
  },
  ENT_GRAND_PLAZA: {
    id: "ENT_GRAND_PLAZA",
    category: "entrance",
    name: "Monumental Corporate Plaza Entry",
    description: "Polished granite promenade with flanking water mirrors and illuminated pylons.",
    minTier: "PRESTIGIOUS",
    budgetCost: 55,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_ENT_GRAND_PLAZA",
    priority: 70,
    replacesAssetId: "ENT_GLASS_LOBBY",
  },
  ENT_CRYSTAL_ATRIUM: {
    id: "ENT_CRYSTAL_ATRIUM",
    category: "entrance",
    name: "Hypermodern Crystalline Atrium",
    description: "Self-supporting geometric diamond glass pavilion with cascading indoor bio-waterfall.",
    minTier: "ICONIC",
    budgetCost: 80,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_ENT_CRYSTAL_ATRIUM",
    priority: 85,
    replacesAssetId: "ENT_GRAND_PLAZA",
  },
  ENT_MOTORSPORT_ARCH: {
    id: "ENT_MOTORSPORT_ARCH",
    category: "entrance",
    name: "Carbon-Fibre Gantry Portal",
    description: "Aerodynamic wing-profile archway paying homage to circuit racing heritage.",
    minTier: "PRESTIGIOUS",
    budgetCost: 45,
    specialization: "motorsport",
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_ENT_MOTORSPORT_ARCH",
    priority: 50,
  },

  // ── 2. LANDSCAPING (8 Assets) ──
  LAND_GRASS_BASIC: {
    id: "LAND_GRASS_BASIC",
    category: "landscaping",
    name: "Basic Lawn & Border Gravel",
    description: "Cleanly edged turf plots along the main pedestrian thoroughfare.",
    minTier: "STARTUP",
    budgetCost: 3,
    isHeritage: false,
    placementZone: "gardens",
    glbAssetTag: "GEO_DECO_LAND_GRASS_BASIC",
    priority: 5,
  },
  LAND_FLOWER_BEDS: {
    id: "LAND_FLOWER_BEDS",
    category: "landscaping",
    name: "Seasonal Floral Borders",
    description: "Curated floral beds that bloom in corporate color accents.",
    minTier: "GROWING",
    budgetCost: 8,
    isHeritage: false,
    placementZone: "gardens",
    glbAssetTag: "GEO_DECO_LAND_FLOWER_BEDS",
    priority: 15,
  },
  LAND_HEDGEROW: {
    id: "LAND_HEDGEROW",
    category: "landscaping",
    name: "Precision Boxwood Perimeter Hedges",
    description: "Formal manicured evergreen hedges providing acoustic shielding and privacy.",
    minTier: "GROWING",
    budgetCost: 10,
    isHeritage: false,
    placementZone: "perimeter",
    glbAssetTag: "GEO_DECO_LAND_HEDGEROW",
    priority: 18,
  },
  LAND_TOPIARY: {
    id: "LAND_TOPIARY",
    category: "landscaping",
    name: "Automotive Silhouette Topiary",
    description: "Artfully sculpted yew trees shaped into iconic aerodynamic roadster forms.",
    minTier: "ESTABLISHED",
    budgetCost: 20,
    isHeritage: true,
    placementZone: "courtyard",
    glbAssetTag: "GEO_DECO_LAND_TOPIARY",
    priority: 25,
  },
  LAND_JAPANESE_GARDEN: {
    id: "LAND_JAPANESE_GARDEN",
    category: "landscaping",
    name: "Zen Contemplation Rock Garden",
    description: "Raked quartz sand, moss boulders, and bonsai pines for contemplative engineering.",
    minTier: "PRESTIGIOUS",
    budgetCost: 40,
    isHeritage: true,
    placementZone: "courtyard",
    glbAssetTag: "GEO_DECO_LAND_JAPANESE_GARDEN",
    priority: 40,
  },
  LAND_GREEN_WALL: {
    id: "LAND_GREEN_WALL",
    category: "landscaping",
    name: "Vertical Hydroponic Living Façade",
    description: "Multi-story evergreen living wall filtering particulate and lowering ambient temps.",
    minTier: "PRESTIGIOUS",
    budgetCost: 35,
    specialization: "environmental",
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_LAND_GREEN_WALL",
    priority: 45,
  },
  LAND_SCULPTURE_GARDEN: {
    id: "LAND_SCULPTURE_GARDEN",
    category: "landscaping",
    name: "Masterworks Botanical Promenade",
    description: "Meandering pathway flanked by rare specimen trees, water streams, and bronze plaques.",
    minTier: "ICONIC",
    budgetCost: 60,
    isHeritage: true,
    placementZone: "gardens",
    glbAssetTag: "GEO_DECO_LAND_SCULPTURE_GARDEN",
    priority: 55,
  },
  LAND_SOLAR_GROVE: {
    id: "LAND_SOLAR_GROVE",
    category: "landscaping",
    name: "Photovoltaic Solar Canopy Grove",
    description: "Sculptural solar leaf structures generating clean energy while shading walkways.",
    minTier: "ICONIC",
    budgetCost: 55,
    specialization: "environmental",
    isHeritage: true,
    placementZone: "perimeter",
    glbAssetTag: "GEO_DECO_LAND_SOLAR_GROVE",
    priority: 58,
  },

  // ── 3. WATER FEATURES (5 Assets) ──
  WATER_BIRDBATH: {
    id: "WATER_BIRDBATH",
    category: "water_feature",
    name: "Chiseled Stone Water Basin",
    description: "Simple natural stone bubbling basin in the central courtyard.",
    minTier: "GROWING",
    budgetCost: 5,
    isHeritage: true,
    placementZone: "courtyard",
    glbAssetTag: "GEO_DECO_WATER_BIRDBATH",
    priority: 12,
  },
  WATER_FOUNTAIN_SMALL: {
    id: "WATER_FOUNTAIN_SMALL",
    category: "water_feature",
    name: "Tiered Granite Jet Fountain",
    description: "Multi-tiered fountain featuring five concentric water plumes.",
    minTier: "ESTABLISHED",
    budgetCost: 18,
    isHeritage: true,
    placementZone: "courtyard",
    glbAssetTag: "GEO_DECO_WATER_FOUNTAIN_SMALL",
    priority: 28,
    replacesAssetId: "WATER_BIRDBATH",
  },
  WATER_REFLECTING_POOL: {
    id: "WATER_REFLECTING_POOL",
    category: "water_feature",
    name: "Basalt Infinity Reflecting Pool",
    description: "Mirror-smooth dark granite pool reflecting the sky and corporate skyline.",
    minTier: "PRESTIGIOUS",
    budgetCost: 35,
    isHeritage: true,
    placementZone: "plaza",
    glbAssetTag: "GEO_DECO_WATER_REFLECTING_POOL",
    priority: 42,
  },
  WATER_CASCADE_WALL: {
    id: "WATER_CASCADE_WALL",
    category: "water_feature",
    name: "Acoustic Glass Cascade Wall",
    description: "Laminar sheet of recycled water flowing down etched acoustic glass.",
    minTier: "PRESTIGIOUS",
    budgetCost: 45,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_WATER_CASCADE_WALL",
    priority: 48,
  },
  WATER_GRAND_FOUNTAIN: {
    id: "WATER_GRAND_FOUNTAIN",
    category: "water_feature",
    name: "Choreographed Aerodynamic Water Spire",
    description: "Pressurized variable-frequency water nozzles programmed with music and light shows.",
    minTier: "ICONIC",
    budgetCost: 70,
    isHeritage: true,
    placementZone: "plaza",
    glbAssetTag: "GEO_DECO_WATER_GRAND_FOUNTAIN",
    priority: 65,
    replacesAssetId: "WATER_FOUNTAIN_SMALL",
  },

  // ── 4. SCULPTURES & ART (6 Assets) ──
  SCULPT_FOUNDER_BUST: {
    id: "SCULPT_FOUNDER_BUST",
    category: "sculpture",
    name: "Founding Engineer Bronze Bust",
    description: "Hand-cast bronze effigy celebrating the enterprise's original chief visionary.",
    minTier: "ESTABLISHED",
    budgetCost: 15,
    isHeritage: true,
    placementZone: "interior_lobby",
    glbAssetTag: "GEO_DECO_SCULPT_FOUNDER_BUST",
    priority: 26,
  },
  SCULPT_ENGINE_MODEL: {
    id: "SCULPT_ENGINE_MODEL",
    category: "sculpture",
    name: "Cutaway Titanium V12 Engine Monument",
    description: "Full-scale precision milled engine block exhibiting intricate internal valves and pistons.",
    minTier: "ESTABLISHED",
    budgetCost: 20,
    specialization: "engineering",
    isHeritage: true,
    placementZone: "interior_lobby",
    glbAssetTag: "GEO_DECO_SCULPT_ENGINE_MODEL",
    priority: 32,
  },
  SCULPT_TROPHY_CASE: {
    id: "SCULPT_TROPHY_CASE",
    category: "sculpture",
    name: "Championship Silverware Rotunda",
    description: "Bulletproof illuminated display of motorsport laurels, cups, and chequered flags.",
    minTier: "PRESTIGIOUS",
    budgetCost: 30,
    specialization: "motorsport",
    isHeritage: true,
    placementZone: "interior_lobby",
    glbAssetTag: "GEO_DECO_SCULPT_TROPHY_CASE",
    priority: 44,
  },
  SCULPT_KINETIC_ART: {
    id: "SCULPT_KINETIC_ART",
    category: "sculpture",
    name: "Wind-Driven Kinetic Airfoil Mobile",
    description: "Counterbalanced polished aluminum aerodynamic foils turning gently with the breeze.",
    minTier: "PRESTIGIOUS",
    budgetCost: 40,
    isHeritage: true,
    placementZone: "courtyard",
    glbAssetTag: "GEO_DECO_SCULPT_KINETIC_ART",
    priority: 46,
  },
  SCULPT_HERITAGE_CAR: {
    id: "SCULPT_HERITAGE_CAR",
    category: "sculpture",
    name: "Chassis #001 Heritage Car Plinth",
    description: "Original serial-number-one classic vehicle elevated on an illuminated mirror pedestal.",
    minTier: "ICONIC",
    budgetCost: 55,
    isHeritage: true,
    placementZone: "plaza",
    glbAssetTag: "GEO_DECO_SCULPT_HERITAGE_CAR",
    priority: 62,
  },
  SCULPT_HOLOGRAPHIC: {
    id: "SCULPT_HOLOGRAPHIC",
    category: "sculpture",
    name: "Volumetric Photon Concept Projector",
    description: "Persistent 3D light-field projector beaming rotating concept blueprints into open air.",
    minTier: "ICONIC",
    budgetCost: 75,
    isHeritage: true,
    placementZone: "rooftop",
    glbAssetTag: "GEO_DECO_SCULPT_HOLOGRAPHIC",
    priority: 68,
  },

  // ── 5. SIGNAGE & BRANDING (6 Assets) ──
  SIGN_BASIC_PLATE: {
    id: "SIGN_BASIC_PLATE",
    category: "signage",
    name: "Enamelled Nameplate Plaque",
    description: "Modest brass and enamel company identifier mounted beside the main entrance gate.",
    minTier: "STARTUP",
    budgetCost: 3,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_SIGN_BASIC_PLATE",
    priority: 8,
  },
  SIGN_COMPANY_FLAG: {
    id: "SIGN_COMPANY_FLAG",
    category: "signage",
    name: "Corporate Standard Flagstaff",
    description: "Polished marine-grade flagpole flying the company emblem proudly against the wind.",
    minTier: "GROWING",
    budgetCost: 6,
    isHeritage: true,
    placementZone: "perimeter",
    glbAssetTag: "GEO_DECO_SIGN_COMPANY_FLAG",
    priority: 16,
  },
  SIGN_LED_LOGO: {
    id: "SIGN_LED_LOGO",
    category: "signage",
    name: "Architectural Halo-Lit Crest",
    description: "Machined brushed steel company emblem with soft 3000K warm white halo rear glow.",
    minTier: "ESTABLISHED",
    budgetCost: 22,
    isHeritage: true,
    placementZone: "rooftop",
    glbAssetTag: "GEO_DECO_SIGN_LED_LOGO",
    priority: 34,
  },
  SIGN_DIGITAL_BANNER: {
    id: "SIGN_DIGITAL_BANNER",
    category: "signage",
    name: "Curved Micro-LED Media Ribbon",
    description: "Seamless display ribbon exhibiting live lap times, design awards, and corporate milestones.",
    minTier: "PRESTIGIOUS",
    budgetCost: 35,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_SIGN_DIGITAL_BANNER",
    priority: 47,
  },
  SIGN_MONUMENT_WALL: {
    id: "SIGN_MONUMENT_WALL",
    category: "signage",
    name: "Freestanding Monolithic Brand Totem",
    description: "Ten-meter-tall blasted basalt pylon with etched company timeline and achievements.",
    minTier: "PRESTIGIOUS",
    budgetCost: 45,
    isHeritage: true,
    placementZone: "perimeter",
    glbAssetTag: "GEO_DECO_SIGN_MONUMENT_WALL",
    priority: 51,
  },
  SIGN_HOLO_BRAND: {
    id: "SIGN_HOLO_BRAND",
    category: "signage",
    name: "Skyline Holographic Beacon",
    description: "High-candela laser projection system casting the brand logo into cloud ceilings at night.",
    minTier: "ICONIC",
    budgetCost: 65,
    isHeritage: true,
    placementZone: "rooftop",
    glbAssetTag: "GEO_DECO_SIGN_HOLO_BRAND",
    priority: 66,
    replacesAssetId: "SIGN_LED_LOGO",
  },

  // ── 6. LIGHTING (6 Assets) ──
  LIGHT_PATH_BASIC: {
    id: "LIGHT_PATH_BASIC",
    category: "lighting",
    name: "Low-Voltage Bollard Pathway Lights",
    description: "Cylindrical aluminum light bollards guiding night shift workers safely across plots.",
    minTier: "STARTUP",
    budgetCost: 4,
    isHeritage: false,
    placementZone: "perimeter",
    glbAssetTag: "GEO_DECO_LIGHT_PATH_BASIC",
    priority: 7,
  },
  LIGHT_ENTRANCE_SPOTS: {
    id: "LIGHT_ENTRANCE_SPOTS",
    category: "lighting",
    name: "Recessed Ground Well Uplights",
    description: "Flush-mount stainless steel spotlights illuminating vertical architectural facades.",
    minTier: "GROWING",
    budgetCost: 10,
    isHeritage: false,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_LIGHT_ENTRANCE_SPOTS",
    priority: 19,
  },
  LIGHT_FACADE_WASH: {
    id: "LIGHT_FACADE_WASH",
    category: "lighting",
    name: "Programmable Linear Façade Washers",
    description: "Color-balanced wall-wash fixtures bathing building massing in warm dramatic shadows.",
    minTier: "ESTABLISHED",
    budgetCost: 20,
    isHeritage: true,
    placementZone: "plaza",
    glbAssetTag: "GEO_DECO_LIGHT_FACADE_WASH",
    priority: 31,
  },
  LIGHT_ACCENT_RGB: {
    id: "LIGHT_ACCENT_RGB",
    category: "lighting",
    name: "Skyline Edge LED Contour Strips",
    description: "Crisp architectural neon-flex tubes tracing the building's roof silhouettes at dusk.",
    minTier: "PRESTIGIOUS",
    budgetCost: 30,
    isHeritage: true,
    placementZone: "rooftop",
    glbAssetTag: "GEO_DECO_LIGHT_ACCENT_RGB",
    priority: 41,
  },
  LIGHT_LANDSCAPE_DRAMA: {
    id: "LIGHT_LANDSCAPE_DRAMA",
    category: "lighting",
    name: "Arboretum Fiber-Optic Uplighting",
    description: "Subtle organic illumination tracing branches and specimen foliage with twilight glow.",
    minTier: "PRESTIGIOUS",
    budgetCost: 35,
    isHeritage: true,
    placementZone: "gardens",
    glbAssetTag: "GEO_DECO_LIGHT_LANDSCAPE_DRAMA",
    priority: 43,
  },
  LIGHT_DYNAMIC_SHOW: {
    id: "LIGHT_DYNAMIC_SHOW",
    category: "lighting",
    name: "Campus Synchronized Luminary Array",
    description: "Centralized DMX light system that pulsates gently to celebrate vehicle launches and race wins.",
    minTier: "ICONIC",
    budgetCost: 50,
    isHeritage: true,
    placementZone: "plaza",
    glbAssetTag: "GEO_DECO_LIGHT_DYNAMIC_SHOW",
    priority: 63,
  },

  // ── 7. MONUMENTS (4 Assets) ──
  MON_CORNERSTONE: {
    id: "MON_CORNERSTONE",
    category: "monument",
    name: "Foundational Limestone Cornerstone",
    description: "Carved limestone datum block bearing the enterprise incorporation date and charter.",
    minTier: "GROWING",
    budgetCost: 8,
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_MON_CORNERSTONE",
    priority: 17,
  },
  MON_MILESTONE_PILLAR: {
    id: "MON_MILESTONE_PILLAR",
    category: "monument",
    name: "Production Milestone Obelisk",
    description: "Stepped bronze stele commemorating the first 10,000 and 100,000 units delivered.",
    minTier: "ESTABLISHED",
    budgetCost: 18,
    isHeritage: true,
    placementZone: "courtyard",
    glbAssetTag: "GEO_DECO_MON_MILESTONE_PILLAR",
    priority: 29,
  },
  MON_HERITAGE_WALK: {
    id: "MON_HERITAGE_WALK",
    category: "monument",
    name: "Hall of Innovators Walk of Fame",
    description: "Engraved brass pathway plaques acknowledging chief engineers, test drivers, and patentees.",
    minTier: "PRESTIGIOUS",
    budgetCost: 40,
    isHeritage: true,
    placementZone: "gardens",
    glbAssetTag: "GEO_DECO_MON_HERITAGE_WALK",
    priority: 49,
  },
  MON_LEGACY_PAVILION: {
    id: "MON_LEGACY_PAVILION",
    category: "monument",
    name: "Centenary Heritage Rotunda",
    description: "Domed circular temple archiving patent drawings, scale prototypes, and racing trophies.",
    minTier: "ICONIC",
    budgetCost: 65,
    isHeritage: true,
    placementZone: "courtyard",
    glbAssetTag: "GEO_DECO_MON_LEGACY_PAVILION",
    priority: 64,
  },

  // ── 8. SPECIALTY (6 Assets) ──
  SPEC_CRASH_DUMMY: {
    id: "SPEC_CRASH_DUMMY",
    category: "specialty",
    name: "Safety Hall of Fame Impact Rig",
    description: "Deconstructed crash test chassis and instrumented Hybrid III mannequins celebrating zero-fatality engineering.",
    minTier: "ESTABLISHED",
    budgetCost: 15,
    specialization: "safety",
    isHeritage: true,
    placementZone: "interior_lobby",
    glbAssetTag: "GEO_DECO_SPEC_CRASH_DUMMY",
    priority: 33,
  },
  SPEC_RACING_LIVERY_WALL: {
    id: "SPEC_RACING_LIVERY_WALL",
    category: "specialty",
    name: "Le Mans Victory Mural",
    description: "Ceramic tile mural capturing the company's inaugural 24-hour endurance triumph.",
    minTier: "PRESTIGIOUS",
    budgetCost: 35,
    specialization: "motorsport",
    isHeritage: true,
    placementZone: "courtyard",
    glbAssetTag: "GEO_DECO_SPEC_RACING_LIVERY_WALL",
    priority: 52,
  },
  SPEC_EV_CHARGER_GARDEN: {
    id: "SPEC_EV_CHARGER_GARDEN",
    category: "specialty",
    name: "Carbon-Neutral Rapid Oasis",
    description: "Solar-shaded rapid charging hub enveloped by native flowering meadows.",
    minTier: "PRESTIGIOUS",
    budgetCost: 30,
    specialization: "environmental",
    isHeritage: true,
    placementZone: "perimeter",
    glbAssetTag: "GEO_DECO_SPEC_EV_CHARGER_GARDEN",
    priority: 53,
  },
  SPEC_MARBLE_COLUMNS: {
    id: "SPEC_MARBLE_COLUMNS",
    category: "specialty",
    name: "Carrara Fluted Marble Colonnette",
    description: "Hand-honed Italian white marble portico pillars embodying bespoke luxury craftsmanship.",
    minTier: "PRESTIGIOUS",
    budgetCost: 40,
    specialization: "luxury",
    isHeritage: true,
    placementZone: "entrance",
    glbAssetTag: "GEO_DECO_SPEC_MARBLE_COLUMNS",
    priority: 54,
  },
  SPEC_WIND_TUNNEL_BLADE: {
    id: "SPEC_WIND_TUNNEL_BLADE",
    category: "specialty",
    name: "Scale Subsonic Fan Blade Sculpture",
    description: "Mirrored aerodynamic titanium impeller blade showcasing wind tunnel aero prowess.",
    minTier: "PRESTIGIOUS",
    budgetCost: 35,
    specialization: "engineering",
    isHeritage: true,
    placementZone: "plaza",
    glbAssetTag: "GEO_DECO_SPEC_WIND_TUNNEL_BLADE",
    priority: 56,
  },
  SPEC_LUXURY_CHANDELIER: {
    id: "SPEC_LUXURY_CHANDELIER",
    category: "specialty",
    name: "Crystal Fiber-Optic Chandelier",
    description: "Hand-blown Austrian crystal luminary resembling automotive engine cylinder firing orders.",
    minTier: "ICONIC",
    budgetCost: 50,
    specialization: "luxury",
    isHeritage: true,
    placementZone: "interior_lobby",
    glbAssetTag: "GEO_DECO_SPEC_LUXURY_CHANDELIER",
    priority: 67,
  },
};

// ══════════════════════════════════════════════════════════════════════════
// 3. CORE LOGIC & PURE EVALUATION FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

/**
 * Maps company reputation (0–100) directly to a Beautification Tier.
 */
export function resolveBeautificationTier(reputation: number): BeautificationTier {
  const rep = Math.max(0, Math.min(100, Math.round(reputation)));
  if (rep >= 76) return "ICONIC";
  if (rep >= 51) return "PRESTIGIOUS";
  if (rep >= 26) return "ESTABLISHED";
  if (rep >= 11) return "GROWING";
  return "STARTUP";
}

/**
 * Returns point budget available for beautification assets at the given tier.
 */
export function calculateBeautificationBudget(tier: BeautificationTier): number {
  return BEAUTIFICATION_TIER_CONFIG[tier].budget;
}

/**
 * Computes specialization scores (0–100) across Engineering, Motorsport,
 * Safety, Luxury, and Environmental axes using campus bonuses, units, or external hints.
 */
export function computeSpecializationScores(
  bonuses?: CampusBonusSummary,
  units?: Record<CampusUnitId, CampusUnitDefinition>,
  overrides?: Partial<Record<ReputationSpecialization, number>>
): Record<ReputationSpecialization, number> {
  const scores: Record<ReputationSpecialization, number> = {
    engineering: 20,
    motorsport: 0,
    safety: 30,
    luxury: 20,
    environmental: 10,
  };

  if (bonuses) {
    scores.engineering = Math.min(100, Math.round(bonuses.rndSpeedBonusPct * 0.4 + bonuses.qualityAssuranceRating * 0.6));
    scores.motorsport = Math.min(100, Math.round(bonuses.motorsportPerformanceIndex));
    scores.safety = Math.min(100, Math.round(bonuses.safetyComplianceRating));
    scores.luxury = Math.min(100, Math.round(bonuses.stylingPrestigeScore));
  }

  if (units) {
    let totalLvl = 0;
    let highTechCount = 0;
    Object.values(units).forEach((u) => {
      if (u.status === "operational") {
        totalLvl += u.level;
        if (u.level >= 5) highTechCount++;
      }
    });
    scores.environmental = Math.min(100, Math.round(totalLvl * 1.5 + highTechCount * 12));
  }

  if (overrides) {
    for (const key of Object.keys(overrides) as ReputationSpecialization[]) {
      if (overrides[key] !== undefined) {
        scores[key] = Math.max(0, Math.min(100, overrides[key]!));
      }
    }
  }

  return scores;
}

/**
 * Finds the dominant specialization if any score reaches a meaningful threshold.
 */
export function determineDominantSpecialization(
  scores: Record<ReputationSpecialization, number>
): ReputationSpecialization | null {
  let highestKey: ReputationSpecialization | null = null;
  let highestVal = 35; // minimum threshold to be considered dominant

  for (const [key, val] of Object.entries(scores) as [ReputationSpecialization, number][]) {
    if (val > highestVal) {
      highestVal = val;
      highestKey = key;
    }
  }

  return highestKey;
}

export interface BeautificationEvaluationInput {
  reputation: number;
  previousState?: CampusBeautificationState | null;
  bonuses?: CampusBonusSummary;
  units?: Record<CampusUnitId, CampusUnitDefinition>;
  specializationOverrides?: Partial<Record<ReputationSpecialization, number>>;
  gameMonth?: number;
}

/**
 * Core Orchestrator: Computes the complete beautification state.
 * 
 * Strict Heritage Rules:
 * 1. Heritage assets are NEVER removed, even if reputation falls.
 * 2. If an asset was ever placed, it stays in `heritageAssets`.
 * 3. An upgraded asset marks earlier replaced assets as `isOverridden: true`, `active: false`.
 * 4. Active assets are selected within the current tier's point budget, prioritized by quality and specialization.
 */
export function computeBeautificationState(
  input: BeautificationEvaluationInput
): CampusBeautificationState {
  const currentRep = Math.max(0, Math.min(100, input.reputation));
  const tier = resolveBeautificationTier(currentRep);
  const tierInfo = BEAUTIFICATION_TIER_CONFIG[tier];
  const totalBudget = tierInfo.budget;
  const currentMonth = input.gameMonth ?? 1;

  const specScores = computeSpecializationScores(
    input.bonuses,
    input.units,
    input.specializationOverrides
  );
  const dominantSpec = determineDominantSpecialization(specScores);

  // Collect previous heritage assets so they are never forgotten
  const heritageMap = new Map<string, BeautificationAssetInstance>();
  if (input.previousState?.heritageAssets) {
    for (const inst of input.previousState.heritageAssets) {
      heritageMap.set(inst.assetId, { ...inst });
    }
  }
  if (input.previousState?.activeAssets) {
    for (const inst of input.previousState.activeAssets) {
      if (!heritageMap.has(inst.assetId)) {
        heritageMap.set(inst.assetId, { ...inst });
      }
    }
  }

  const currentTierRank = TIER_ORDER[tier];

  // Filter eligible assets from the registry
  const eligibleAssets: BeautificationAsset[] = [];
  for (const asset of Object.values(BEAUTIFICATION_ASSET_REGISTRY)) {
    const assetTierRank = TIER_ORDER[asset.minTier];
    if (assetTierRank > currentTierRank) {
      continue; // Not yet unlocked
    }

    // Specialization gating:
    if (asset.specialization) {
      const specScore = specScores[asset.specialization] || 0;
      const isDominant = dominantSpec === asset.specialization;
      // Appears if specialization is dominant or score is high (>= 45)
      if (!isDominant && specScore < 45) {
        continue;
      }
    }

    eligibleAssets.push(asset);
  }

  // Sort eligible assets by priority (descending)
  eligibleAssets.sort((a, b) => {
    // If one matches dominant specialization, give it a priority boost
    const aSpecBoost = a.specialization === dominantSpec ? 25 : 0;
    const bSpecBoost = b.specialization === dominantSpec ? 25 : 0;
    return (b.priority + bSpecBoost) - (a.priority + aSpecBoost);
  });

  // Track which assets are superseded by higher-tier upgrades (transitive traversal)
  const supersededAssetIds = new Set<string>();
  for (const asset of eligibleAssets) {
    let currentReplaced = asset.replacesAssetId;
    while (currentReplaced) {
      supersededAssetIds.add(currentReplaced);
      currentReplaced = BEAUTIFICATION_ASSET_REGISTRY[currentReplaced]?.replacesAssetId;
    }
  }

  // Allocate budget
  let budgetSpent = 0;
  const activeInstanceMap = new Map<string, BeautificationAssetInstance>();

  for (const asset of eligibleAssets) {
    if (supersededAssetIds.has(asset.id)) {
      // Replaced by a higher tier upgrade
      continue;
    }

    if (budgetSpent + asset.budgetCost <= totalBudget) {
      budgetSpent += asset.budgetCost;

      // Existing instance or new
      const existing = heritageMap.get(asset.id);
      const instance: BeautificationAssetInstance = existing
        ? {
            ...existing,
            active: true,
            isOverridden: false,
            weathered: currentRep < (BEAUTIFICATION_TIER_CONFIG[asset.minTier]?.minRep ?? 0),
          }
        : {
            assetId: asset.id,
            placedAtReputation: currentRep,
            placedAtGameMonth: currentMonth,
            isHeritage: asset.isHeritage,
            active: true,
            isOverridden: false,
            weathered: false,
          };

      activeInstanceMap.set(asset.id, instance);
      if (asset.isHeritage || instance.isHeritage) {
        heritageMap.set(asset.id, instance);
      }
    }
  }

  // Ensure all previously placed heritage assets are retained
  // Mark overridden ones appropriately
  for (const [assetId, inst] of heritageMap.entries()) {
    if (!activeInstanceMap.has(assetId)) {
      const isReplaced = supersededAssetIds.has(assetId);
      heritageMap.set(assetId, {
        ...inst,
        active: false,
        isOverridden: isReplaced,
        weathered: currentRep < inst.placedAtReputation - 15,
      });
    } else {
      heritageMap.set(assetId, activeInstanceMap.get(assetId)!);
    }
  }

  const activeAssets = Array.from(activeInstanceMap.values());
  const heritageAssets = Array.from(heritageMap.values());

  return {
    tier,
    tierLabel: tierInfo.label,
    totalBudget,
    budgetSpent,
    activeAssets,
    heritageAssets,
    dominantSpecialization: dominantSpec,
    specializationScores: specScores,
    lastEvaluationMonth: currentMonth,
    lastReputationScore: currentRep,
  };
}

/**
 * Helper to get a human-readable summary of the beautification state.
 */
export function getBeautificationSummaryText(state: CampusBeautificationState): string {
  const activeCount = state.activeAssets.length;
  const heritageCount = state.heritageAssets.length;
  const specText = state.dominantSpecialization
    ? `Specialized in ${state.dominantSpecialization.toUpperCase()}`
    : "Balanced Aesthetic";

  return `Campus Prestige: ${state.tierLabel} (${state.tier}) | Budget: ${state.budgetSpent}/${state.totalBudget} pts | ${activeCount} Active Assets (${heritageCount} Historical Monuments) | ${specText}`;
}

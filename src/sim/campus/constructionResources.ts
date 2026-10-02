/**
 * AUTO TYCOON CAMPUS HQ - CONSTRUCTION RESOURCES & HISTORICAL COSTS (PHASE 4)
 * 
 * Defines the material resource types required for campus building construction,
 * historical price indices, and inflation curves across 1970–2030.
 */

export type ConstructionResourceType =
  | "STEEL"
  | "CONCRETE"
  | "GLASS"
  | "TIMBER"
  | "ELECTRONICS"
  | "HEAVY_MACHINERY"
  | "LABOR_MONTHS";

export interface ConstructionResourceDefinition {
  resource: ConstructionResourceType;
  name: string;
  unit: string; // e.g. "Metric Tons", "Cubic Meters", "Sq Meters", "Worker-Months"
  unitPrice1970: number; // Cost in 1970 USD
  priceInflationPctPerDecade: number; // Compounding inflation percentage per 10 years
  carbonFootprintPerUnitKg: number;
  description: string;
}

export interface ConstructionResourceCost {
  resource: ConstructionResourceType;
  quantity: number;
}

export const CONSTRUCTION_RESOURCES: Record<ConstructionResourceType, ConstructionResourceDefinition> = {
  STEEL: {
    resource: "STEEL",
    name: "Structural Steel",
    unit: "Metric Tons",
    unitPrice1970: 180, // $180 / ton in 1970
    priceInflationPctPerDecade: 28,
    carbonFootprintPerUnitKg: 1800,
    description: "Rolled I-beams, rebar reinforcement cages, and truss framework for multi-story buildings and industrial bays.",
  },
  CONCRETE: {
    resource: "CONCRETE",
    name: "Ready-Mix Concrete",
    unit: "Cubic Meters",
    unitPrice1970: 25, // $25 / m³ in 1970
    priceInflationPctPerDecade: 32,
    carbonFootprintPerUnitKg: 240,
    description: "Deep foundation footings, reinforced slabs, shear walls, and shaker rig vibration damping mass blocks.",
  },
  GLASS: {
    resource: "GLASS",
    name: "Architectural Glazing",
    unit: "Square Meters",
    unitPrice1970: 45, // $45 / m² in 1970
    priceInflationPctPerDecade: 25,
    carbonFootprintPerUnitKg: 35,
    description: "Clerestory studio skylights, low-iron curtain walls, soundproof observation partitions, and acoustic glass.",
  },
  TIMBER: {
    resource: "TIMBER",
    name: "Architectural Timber & Formwork",
    unit: "Cubic Meters",
    unitPrice1970: 95, // $95 / m³ in 1970
    priceInflationPctPerDecade: 22,
    carbonFootprintPerUnitKg: -400, // Sequestered carbon
    description: "Concrete formwork framing, interior wall paneling, acoustic diffuser baffles, and heritage wing trim.",
  },
  ELECTRONICS: {
    resource: "ELECTRONICS",
    name: "HVAC, Wiring & Data Harnesses",
    unit: "Systems Units",
    unitPrice1970: 1200, // $1,200 / unit in 1970
    priceInflationPctPerDecade: 18,
    carbonFootprintPerUnitKg: 450,
    description: "Building management transformers, teletype/server racks, climate control HVAC, cleanroom filtration, and high-voltage busways.",
  },
  HEAVY_MACHINERY: {
    resource: "HEAVY_MACHINERY",
    name: "Crane & Earthmoving Equipment Hours",
    unit: "Machine Hours",
    unitPrice1970: 65, // $65 / hour in 1970
    priceInflationPctPerDecade: 30,
    carbonFootprintPerUnitKg: 95,
    description: "Tower cranes, hydraulic excavators, pile drivers, and specialized gantry crane rigging.",
  },
  LABOR_MONTHS: {
    resource: "LABOR_MONTHS",
    name: "Specialized Construction Labor",
    unit: "Worker-Months",
    unitPrice1970: 850, // $850 / month in 1970
    priceInflationPctPerDecade: 35,
    carbonFootprintPerUnitKg: 10,
    description: "Civil engineers, master ironworkers, certified welders, electrical contractors, and architectural finish carpenters.",
  },
};

/**
 * Historical Price Lookup
 * Compounding price inflation calculation relative to 1970 baseline.
 */
export function getResourceUnitPrice(resource: ConstructionResourceType, year: number): number {
  const def = CONSTRUCTION_RESOURCES[resource];
  if (!def) return 0;
  const clampedYear = Math.max(1970, Math.min(2035, year));
  const decadesElapsed = (clampedYear - 1970) / 10;
  const multiplier = Math.pow(1 + def.priceInflationPctPerDecade / 100, decadesElapsed);
  return Math.round(def.unitPrice1970 * multiplier * 100) / 100;
}

/**
 * Calculate total monetary cost of a bill of construction materials in a specific year
 */
export function calculateBillOfMaterialsCost(
  materials: ConstructionResourceCost[],
  year: number = 1970
): number {
  return materials.reduce((acc, item) => {
    const unitPrice = getResourceUnitPrice(item.resource, year);
    return acc + Math.round(unitPrice * item.quantity);
  }, 0);
}

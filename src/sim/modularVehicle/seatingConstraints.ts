/**
 * ============================================================================
 * VEHICLE SEATING CONSTRAINTS & CABIN ARCHITECTURE REGISTRY
 * ============================================================================
 * Defines physically feasible seating configurations and interior architecture
 * classifications across all 24 canonical automotive body types.
 *
 * Enforces engineering realism:
 * - Supercars/Hypercars/Roadsters are strictly 2-seaters (mid-engine tub / open cockpit).
 * - Track Specials are single-seat race-prepped cockpits (1-seater with FIA roll cage).
 * - Trucks feature Single-Cab (2-seat) and Crew-Cab (5-seat) utility layouts.
 * - Transit Buses feature 8, 12, or 16 passenger transit configurations.
 * - Luxury Sedans and Limousines feature ultra-spacious executive lounge legroom.
 * ============================================================================
 */

import { VehicleBodyTypeId } from "./types";

export type InteriorVariantClass =
  | "standard_cabin"
  | "executive_long_wheelbase"
  | "heavy_duty_truck"
  | "transit_bus"
  | "supercar_cockpit";

export interface SeatingOption {
  seats: number;
  label: string;
  layout: string;
  description: string;
  hasRow2: boolean;
  hasRow3: boolean;
  category: "sport" | "standard" | "luxury" | "utility" | "commercial";
}

export interface BodyTypeSeatingSpec {
  bodyTypeId: VehicleBodyTypeId;
  defaultSeats: number;
  allowedOptions: SeatingOption[];
  isRow2Allowed: boolean;
  isRow3Allowed: boolean;
  interiorVariant: InteriorVariantClass;
  cabinRationale: string;
}

export const BODY_TYPE_SEATING_MAP: Record<VehicleBodyTypeId, BodyTypeSeatingSpec> = {
  // ── 1. Unibody Passenger Platform ──────────────────────────────────────────
  sedan: {
    bodyTypeId: "sedan",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "standard_cabin",
    cabinRationale: "Classic 3-box unibody; rear bench seats 2 executive or 3 standard passengers.",
    allowedOptions: [
      {
        seats: 4,
        label: "4-Seater Luxury",
        layout: "2 + 2",
        description: "Twin contoured rear executive seats with folding center armrest console",
        hasRow2: true,
        hasRow3: false,
        category: "luxury",
      },
      {
        seats: 5,
        label: "5-Seater Standard",
        layout: "2 + 3",
        description: "Full-width 40/20/40 split folding rear bench for 3 passengers",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
    ],
  },

  luxury_sedan: {
    bodyTypeId: "luxury_sedan",
    defaultSeats: 4,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "executive_long_wheelbase",
    cabinRationale: "Extended wheelbase (+270mm cabin length); palatial chauffeured rear lounge with first-class legroom.",
    allowedOptions: [
      {
        seats: 4,
        label: "4-Seater First Class",
        layout: "2 + 2",
        description: "Dual 24-way reclining captain chairs with motorized calf ottomans and continuous champagne bar",
        hasRow2: true,
        hasRow3: false,
        category: "luxury",
      },
      {
        seats: 5,
        label: "5-Seater Executive",
        layout: "2 + 3",
        description: "Expansive luxury bench with deployable touch-command smart tablet armrest",
        hasRow2: true,
        hasRow3: false,
        category: "luxury",
      },
    ],
  },

  coupe: {
    bodyTypeId: "coupe",
    defaultSeats: 4,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "standard_cabin",
    cabinRationale: "Low sloping roofline with 2 side doors; 2+2 fastback seating.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Clubsport",
        layout: "2 + 0",
        description: "Rear seat delete with lightweight luggage shelf and acoustic carpet",
        hasRow2: false,
        hasRow3: false,
        category: "sport",
      },
      {
        seats: 4,
        label: "4-Seater (2+2)",
        layout: "2 + 2",
        description: "Sculpted twin rear bucket seats tailored for sports coupes",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
    ],
  },

  station_wagon: {
    bodyTypeId: "station_wagon",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: true,
    interiorVariant: "standard_cabin",
    cabinRationale: "Long horizontal roofline enables spacious 5-seat touring or fold-flat 7-seat capability.",
    allowedOptions: [
      {
        seats: 5,
        label: "5-Seater Tourer",
        layout: "2 + 3",
        description: "Spacious second row bench with maximum 640L cargo boot volume",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
      {
        seats: 7,
        label: "7-Seater Family",
        layout: "2 + 3 + 2",
        description: "Includes fold-flat 3rd-row jump seats beneath the rear cargo floor",
        hasRow2: true,
        hasRow3: true,
        category: "utility",
      },
    ],
  },

  shooting_brake: {
    bodyTypeId: "shooting_brake",
    defaultSeats: 4,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "standard_cabin",
    cabinRationale: "Sleek 2-door wagon/coupe hybrid; 2+2 sports layout with extended cargo floor.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Sport GT",
        layout: "2 + 0",
        description: "Front sport buckets only with bespoke leather-lined luggage deck",
        hasRow2: false,
        hasRow3: false,
        category: "sport",
      },
      {
        seats: 4,
        label: "4-Seater (2+2)",
        layout: "2 + 2",
        description: "Dual rear bucket seats with fold-down center pass-through",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
    ],
  },

  grand_tourer: {
    bodyTypeId: "grand_tourer",
    defaultSeats: 4,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "standard_cabin",
    cabinRationale: "Long hood and aerodynamic cabin designed for high-speed cross-continental 2+2 touring.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Lightweight",
        layout: "2 + 0",
        description: "Rear bench delete with integrated carbon tie-down luggage loops",
        hasRow2: false,
        hasRow3: false,
        category: "sport",
      },
      {
        seats: 4,
        label: "4-Seater Grand Lusso",
        layout: "2 + 2",
        description: "Hand-stitched semi-aniline leather 2+2 touring cabin",
        hasRow2: true,
        hasRow3: false,
        category: "luxury",
      },
    ],
  },

  limousine: {
    bodyTypeId: "limousine",
    defaultSeats: 4,
    isRow2Allowed: true,
    isRow3Allowed: true,
    interiorVariant: "executive_long_wheelbase",
    cabinRationale: "Extended chauffeur chassis with privacy partition; executive rear suite with optional facing jump seats.",
    allowedOptions: [
      {
        seats: 4,
        label: "4-Seater Presidential",
        layout: "2 + 2",
        description: "Twin VIP reclining thrones, electrochromic partition, cocktail bar, and theater screen",
        hasRow2: true,
        hasRow3: false,
        category: "luxury",
      },
      {
        seats: 5,
        label: "5-Seater Sovereign",
        layout: "2 + 3",
        description: "Full-width luxury lounge with center touch console and acoustic glass divider",
        hasRow2: true,
        hasRow3: false,
        category: "luxury",
      },
      {
        seats: 6,
        label: "6-Seater Conference",
        layout: "2 + 2 + 2",
        description: "Chauffeur compartment plus 4 rear conference seats in face-to-face club configuration",
        hasRow2: true,
        hasRow3: true,
        category: "luxury",
      },
    ],
  },

  // ── 2. Unibody Compact Platform ────────────────────────────────────────────
  hatchback: {
    bodyTypeId: "hatchback",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "standard_cabin",
    cabinRationale: "Practical 2-box compact package; front buckets and folding rear 60/40 bench.",
    allowedOptions: [
      {
        seats: 4,
        label: "4-Seater Sport",
        layout: "2 + 2",
        description: "Deep-bolstered rear outboard seats with cupholder center tray",
        hasRow2: true,
        hasRow3: false,
        category: "sport",
      },
      {
        seats: 5,
        label: "5-Seater Practical",
        layout: "2 + 3",
        description: "Full-width 3-passenger rear folding bench for everyday versatility",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
    ],
  },

  // ── 3. Utility & Crossover Platform ────────────────────────────────────────
  suv: {
    bodyTypeId: "suv",
    defaultSeats: 7,
    isRow2Allowed: true,
    isRow3Allowed: true,
    interiorVariant: "standard_cabin",
    cabinRationale: "Tall greenhouse and high roofline accommodate multi-row seating with 3rd row options.",
    allowedOptions: [
      {
        seats: 5,
        label: "5-Seater Cargo Max",
        layout: "2 + 3",
        description: "Two rows with maximum underfloor luggage capacity and flat load deck",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
      {
        seats: 6,
        label: "6-Seater Captains",
        layout: "2 + 2 + 2",
        description: "Second-row captain chairs with center pass-through aisle to 3rd row",
        hasRow2: true,
        hasRow3: true,
        category: "luxury",
      },
      {
        seats: 7,
        label: "7-Seater Family",
        layout: "2 + 3 + 2",
        description: "Three-row family utility with 60/40 slide second row and fold-flat third row",
        hasRow2: true,
        hasRow3: true,
        category: "utility",
      },
    ],
  },

  crossover: {
    bodyTypeId: "crossover",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: true,
    interiorVariant: "standard_cabin",
    cabinRationale: "Car-based utility combining sedan ease with elevated H-point and optional compact 3rd row.",
    allowedOptions: [
      {
        seats: 5,
        label: "5-Seater Standard",
        layout: "2 + 3",
        description: "Spacious 5-passenger configuration with 60/40 reclining rear bench",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
      {
        seats: 7,
        label: "7-Seater Occasional",
        layout: "2 + 3 + 2",
        description: "Compact 50/50 split third row for occasional passenger transport",
        hasRow2: true,
        hasRow3: true,
        category: "utility",
      },
    ],
  },

  luxury_suv: {
    bodyTypeId: "luxury_suv",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: true,
    interiorVariant: "standard_cabin",
    cabinRationale: "Full-size flagship SUV with acoustic laminated glass and versatile luxury seating choices.",
    allowedOptions: [
      {
        seats: 4,
        label: "4-Seater Executive",
        layout: "2 + 2",
        description: "Individual rear power captain thrones with center console and champagne cooler",
        hasRow2: true,
        hasRow3: false,
        category: "luxury",
      },
      {
        seats: 5,
        label: "5-Seater Luxury",
        layout: "2 + 3",
        description: "Premium bench with heated/ventilated outboard seats and electric recline",
        hasRow2: true,
        hasRow3: false,
        category: "luxury",
      },
      {
        seats: 6,
        label: "6-Seater Captains",
        layout: "2 + 2 + 2",
        description: "Second-row captain chairs with power fold and third-row power stowage",
        hasRow2: true,
        hasRow3: true,
        category: "luxury",
      },
      {
        seats: 7,
        label: "7-Seater Grand",
        layout: "2 + 3 + 2",
        description: "Full three-row luxury with quad-zone rear climate control and overhead glass",
        hasRow2: true,
        hasRow3: true,
        category: "standard",
      },
    ],
  },

  performance_suv: {
    bodyTypeId: "performance_suv",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "standard_cabin",
    cabinRationale: "Sport-tuned suspension and lower roofline prioritize rear chassis rigidity; no 3rd row.",
    allowedOptions: [
      {
        seats: 4,
        label: "4-Seater Sport",
        layout: "2 + 2",
        description: "Four contoured sport bucket seats with Alcantara inserts and carbon shells",
        hasRow2: true,
        hasRow3: false,
        category: "sport",
      },
      {
        seats: 5,
        label: "5-Seater Standard",
        layout: "2 + 3",
        description: "Second-row split bench with high-grip sport bolsters",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
    ],
  },

  offroad_suv: {
    bodyTypeId: "offroad_suv",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: true,
    interiorVariant: "standard_cabin",
    cabinRationale: "Expedition-focused body with heavy-duty grab handles and versatile cargo/passenger modes.",
    allowedOptions: [
      {
        seats: 5,
        label: "5-Seater Overland",
        layout: "2 + 3",
        description: "Heavy-duty water-resistant upholstery with fold-flat cargo floor",
        hasRow2: true,
        hasRow3: false,
        category: "utility",
      },
      {
        seats: 7,
        label: "7-Seater Expedition",
        layout: "2 + 3 + 2",
        description: "Third-row foldaway seats for expanded passenger trail capacity",
        hasRow2: true,
        hasRow3: true,
        category: "utility",
      },
    ],
  },

  // ── 4. Body-on-Frame Truck & Commercial ─────────────────────────────────────
  pickup_truck: {
    bodyTypeId: "pickup_truck",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "heavy_duty_truck",
    cabinRationale: "High-command utility cockpit with 4WD transfer dial; Single-Cab (2-seat) or Double-Cab (5-seat).",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Single-Cab",
        layout: "2 + 0",
        description: "Front bucket/bench seating with rear bulkhead tool rack and storage net",
        hasRow2: false,
        hasRow3: false,
        category: "utility",
      },
      {
        seats: 5,
        label: "5-Seater Double-Cab",
        layout: "2 + 3",
        description: "Full 4-door crew cab with 60/40 flip-up rear bench and under-seat tool bins",
        hasRow2: true,
        hasRow3: false,
        category: "utility",
      },
    ],
  },

  offroad_4x4: {
    bodyTypeId: "offroad_4x4",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "heavy_duty_truck",
    cabinRationale: "Trail-ready body-on-frame with mechanical 4WD controls, roll-bar padding, and washable floor mats.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Trail Utility",
        layout: "2 + 0",
        description: "Front bucket seats with flat rear utility bed for spare tires and recovery gear",
        hasRow2: false,
        hasRow3: false,
        category: "utility",
      },
      {
        seats: 5,
        label: "5-Seater Expedition",
        layout: "2 + 3",
        description: "Full passenger cab with overhead grab handles and waterproof marine seat trim",
        hasRow2: true,
        hasRow3: false,
        category: "utility",
      },
    ],
  },

  truck_lorry: {
    bodyTypeId: "truck_lorry",
    defaultSeats: 3,
    isRow2Allowed: false,
    isRow3Allowed: false,
    interiorVariant: "heavy_duty_truck",
    cabinRationale: "Commercial cab-over or heavy-duty conventional truck cab; pneumatic driver seat + 2-passenger bench.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Long-Haul",
        layout: "1 + 1",
        description: "Driver pneumatic suspension seat plus passenger bucket with rear sleeper bunk",
        hasRow2: false,
        hasRow3: false,
        category: "commercial",
      },
      {
        seats: 3,
        label: "3-Seater Commercial Cab",
        layout: "1 + 2",
        description: "Individual driver seat plus integrated 2-passenger commercial bench seat",
        hasRow2: false,
        hasRow3: false,
        category: "commercial",
      },
    ],
  },

  // ── 5. Commercial Volume & Passenger Transit ────────────────────────────────
  cargo_van: {
    bodyTypeId: "cargo_van",
    defaultSeats: 2,
    isRow2Allowed: false,
    isRow3Allowed: false,
    interiorVariant: "heavy_duty_truck",
    cabinRationale: "Flat-floor cab-forward commercial volume hauler; driver and passenger bulkhead.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Courier",
        layout: "2 + 0",
        description: "Dual front bucket seats with solid steel cargo partition barrier behind",
        hasRow2: false,
        hasRow3: false,
        category: "commercial",
      },
      {
        seats: 3,
        label: "3-Seater Utility Crew",
        layout: "1 + 2",
        description: "Driver bucket plus 2-seat passenger bench with fold-down work clipboard",
        hasRow2: false,
        hasRow3: false,
        category: "commercial",
      },
    ],
  },

  bus_shuttle: {
    bodyTypeId: "bus_shuttle",
    defaultSeats: 16,
    isRow2Allowed: true,
    isRow3Allowed: true,
    interiorVariant: "transit_bus",
    cabinRationale: "Heavy-duty electric transit coach with driver pod, fare terminal, safety stanchions, and multi-row seating.",
    allowedOptions: [
      {
        seats: 8,
        label: "8-Seater VIP Shuttle",
        layout: "1 + (7 Executive)",
        description: "Airport executive shuttle with wide leather chairs, luggage bay, and Wi-Fi hub",
        hasRow2: true,
        hasRow3: true,
        category: "luxury",
      },
      {
        seats: 12,
        label: "12-Seater Suburban Feeder",
        layout: "1 + (11 Transit)",
        description: "Commuter shuttle with dual curbside rows and wide center aisle access",
        hasRow2: true,
        hasRow3: true,
        category: "commercial",
      },
      {
        seats: 16,
        label: "16-Seater Urban Transit",
        layout: "1 + (15 Coach)",
        description: "Full transit coach with 8 double-bench rows, safety stanchions, and fare validator terminal",
        hasRow2: true,
        hasRow3: true,
        category: "commercial",
      },
    ],
  },

  // ── 6. Mid-Engine Carbon Monocoque ──────────────────────────────────────────
  supercar: {
    bodyTypeId: "supercar",
    defaultSeats: 2,
    isRow2Allowed: false,
    isRow3Allowed: false,
    interiorVariant: "supercar_cockpit",
    cabinRationale: "Mid-engine layout with structural carbon tub and venturi tunnels; strictly 2 front seats.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Cockpit",
        layout: "1 + 1",
        description: "Low-slung fixed carbon monocoque bucket seats with minimal central spine tunnel",
        hasRow2: false,
        hasRow3: false,
        category: "sport",
      },
    ],
  },

  hypercar: {
    bodyTypeId: "hypercar",
    defaultSeats: 2,
    isRow2Allowed: false,
    isRow3Allowed: false,
    interiorVariant: "supercar_cockpit",
    cabinRationale: "8.0L W16 mid-engine monocoque (Divo); strictly 2 bespoke ergonomic race bucket seats.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Hypercar",
        layout: "1 + 1",
        description: "Dual-tone carbon fiber bucket seats flanking central spine console with 4-point harnesses",
        hasRow2: false,
        hasRow3: false,
        category: "sport",
      },
    ],
  },

  track_special: {
    bodyTypeId: "track_special",
    defaultSeats: 1,
    isRow2Allowed: false,
    isRow3Allowed: false,
    interiorVariant: "supercar_cockpit",
    cabinRationale: "Competition circuit machine with FIA-homologated welded roll cage; single central or left racing seat.",
    allowedOptions: [
      {
        seats: 1,
        label: "1-Seater Monoposto",
        layout: "1 + 0",
        description: "Single FIA-certified carbon racing bucket seat with 6-point harness and fire suppression nozzle",
        hasRow2: false,
        hasRow3: false,
        category: "sport",
      },
    ],
  },

  // ── 7. Open-Top Reinforced Platform ────────────────────────────────────────
  roadster: {
    bodyTypeId: "roadster",
    defaultSeats: 2,
    isRow2Allowed: false,
    isRow3Allowed: false,
    interiorVariant: "supercar_cockpit",
    cabinRationale: "Lightweight 2-seater open cockpit with aerodynamic rollover hoops behind headrests.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Roadster",
        layout: "1 + 1",
        description: "Driver-focused twin bucket cockpit with integrated wind deflector and aluminum rollover hoops",
        hasRow2: false,
        hasRow3: false,
        category: "sport",
      },
    ],
  },

  convertible: {
    bodyTypeId: "convertible",
    defaultSeats: 4,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "standard_cabin",
    cabinRationale: "Open-air 2+2 grand tourer with folding roof cassette behind rear passenger seats.",
    allowedOptions: [
      {
        seats: 2,
        label: "2-Seater Speedster",
        layout: "2 + 0",
        description: "Twin aero speedster nacelles concealing the rear seat well",
        hasRow2: false,
        hasRow3: false,
        category: "sport",
      },
      {
        seats: 4,
        label: "4-Seater Cabriolet (2+2)",
        layout: "2 + 2",
        description: "Rear passenger seats with motorized wind deflector integration",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
    ],
  },

  // ── 8. Tubular & Specialty Platform ────────────────────────────────────────
  sport_wagon: {
    bodyTypeId: "sport_wagon",
    defaultSeats: 5,
    isRow2Allowed: true,
    isRow3Allowed: false,
    interiorVariant: "standard_cabin",
    cabinRationale: "Competition sport wagon; wide track performance chassis with 2-row sports seating.",
    allowedOptions: [
      {
        seats: 4,
        label: "4-Seater Sport Club",
        layout: "2 + 2",
        description: "Four individual sport bucket seats with titanium cross-brace luggage partition",
        hasRow2: true,
        hasRow3: false,
        category: "sport",
      },
      {
        seats: 5,
        label: "5-Seater Sport Tourer",
        layout: "2 + 3",
        description: "High-bolstered 5-passenger cabin with carbon interior trim",
        hasRow2: true,
        hasRow3: false,
        category: "standard",
      },
    ],
  },
};

/**
 * Returns the list of valid seating options for the given vehicle body type.
 * Falls back to standard sedan options if body type is unrecognized.
 */
export function getAllowedSeatingOptions(bodyTypeId: VehicleBodyTypeId | string): SeatingOption[] {
  const key = String(bodyTypeId || "").toLowerCase() as VehicleBodyTypeId;
  const spec = BODY_TYPE_SEATING_MAP[key];
  if (spec && spec.allowedOptions.length > 0) {
    return spec.allowedOptions;
  }
  return BODY_TYPE_SEATING_MAP.sedan.allowedOptions;
}

/**
 * Returns the default passenger seating count for the given vehicle body type.
 */
export function getDefaultSeatingForBodyType(bodyTypeId: VehicleBodyTypeId | string): number {
  const key = String(bodyTypeId || "").toLowerCase() as VehicleBodyTypeId;
  const spec = BODY_TYPE_SEATING_MAP[key];
  if (spec) {
    return spec.defaultSeats;
  }
  return 5;
}

export function resolveSeatingSpec(bodyTypeId: VehicleBodyTypeId | string): BodyTypeSeatingSpec | undefined {
  const raw = String(bodyTypeId || "").toLowerCase();
  if (raw === "bus" || raw === "transit_bus" || raw === "coach") {
    return BODY_TYPE_SEATING_MAP.bus_shuttle;
  }
  return BODY_TYPE_SEATING_MAP[raw as VehicleBodyTypeId];
}

/**
 * Checks if a 2nd row of seats is available for the given body type and seat count.
 */
export function isRow2Available(bodyTypeId: VehicleBodyTypeId | string, seats?: number): boolean {
  const spec = resolveSeatingSpec(bodyTypeId);
  if (!spec || !spec.isRow2Allowed) return false;
  const count = typeof seats === "number" ? seats : spec.defaultSeats;
  // A seat count of 1 or 2 in a 2-seat vehicle has no Row 2
  if (count <= 2) {
    const opt = spec.allowedOptions.find((o) => o.seats === count);
    return opt ? opt.hasRow2 : false;
  }
  return true;
}

/**
 * Checks if a 3rd row of seats is available for the given body type and seat count.
 */
export function isRow3Available(bodyTypeId: VehicleBodyTypeId | string, seats?: number): boolean {
  const spec = resolveSeatingSpec(bodyTypeId);
  if (!spec || !spec.isRow3Allowed) return false;
  const count = typeof seats === "number" ? seats : spec.defaultSeats;
  const opt = spec.allowedOptions.find((o) => o.seats === count);
  return opt ? opt.hasRow3 : false;
}

/**
 * Returns the interior variant class (e.g. heavy_duty_truck, transit_bus, executive_long_wheelbase).
 */
export function getInteriorVariantForBodyType(bodyTypeId: VehicleBodyTypeId | string): InteriorVariantClass {
  const spec = resolveSeatingSpec(bodyTypeId);
  if (spec) {
    return spec.interiorVariant;
  }
  return "standard_cabin";
}

/**
 * Returns human-readable body type cabin rationale and seat capacity range string (e.g. "Sedan: 4–5 seats").
 */
export function getSeatingSummaryBadge(bodyTypeId: VehicleBodyTypeId | string): {
  label: string;
  range: string;
  variant: InteriorVariantClass;
} {
  const spec = resolveSeatingSpec(bodyTypeId) || BODY_TYPE_SEATING_MAP.sedan;
  const seatCounts = spec.allowedOptions.map((o) => o.seats).sort((a, b) => a - b);
  const min = seatCounts[0];
  const max = seatCounts[seatCounts.length - 1];
  const range = min === max ? `${min} Seat${min > 1 ? "s" : ""}` : `${min}–${max} Seats`;
  return {
    label: spec.bodyTypeId.replace(/_/g, " ").toUpperCase(),
    range,
    variant: spec.interiorVariant,
  };
}

/**
 * Maps the vehicle body type / platform directly to its dedicated Class-A 3D interior GLB model asset URL.
 * Enables dynamic GLB hot-swapping in the unified interior studio without separate routes or components.
 */
export function getInteriorGlbUrlForBodyType(bodyTypeId: VehicleBodyTypeId | string): string {
  const variant = getInteriorVariantForBodyType(bodyTypeId);
  switch (variant) {
    case "transit_bus":
      return "/models/interior/cockpit_transit_bus.glb";
    case "heavy_duty_truck":
      return "/models/interior/cockpit_heavy_duty_truck.glb";
    case "executive_long_wheelbase":
      return "/models/interior/cockpit_executive_lwb.glb";
    case "supercar_cockpit":
      return "/models/interior/cockpit_supercar_track.glb";
    default:
      return "/models/interior/dashboard_interactive_master.glb";
  }
}

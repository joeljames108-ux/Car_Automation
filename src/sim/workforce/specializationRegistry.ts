/**
 * ═══════════════════════════════════════════════════════════════════════
 * SPECIALIZATION REGISTRY & CROSS-DOMAIN RELEVANCE ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 7: "Specialization is more important than raw skill"
 *
 * Provides a canonical registry of automotive engineering, production,
 * management, and styling specializations, along with a cross-relevance
 * matrix to evaluate an engineer's true project fitness.
 */

export interface SpecializationDefinition {
  id: string;
  name: string;
  domain: "POWERTRAIN" | "CHASSIS" | "AERODYNAMICS" | "DESIGN" | "ELECTRONICS" | "MANUFACTURING" | "MOTORSPORT" | "GENERAL";
  description: string;
  relatedSpecializations: Record<string, number>; // Related spec ID -> match coefficient (0.0 to 1.0)
}

export const SPECIALIZATIONS: Record<string, SpecializationDefinition> = {
  // ── POWERTRAIN ──
  TURBOCHARGING: {
    id: "TURBOCHARGING",
    name: "Forced Induction & Turbocharging",
    domain: "POWERTRAIN",
    description: "Twin-scroll geometries, wastegate mapping, intercooler thermal drops, anti-lag.",
    relatedSpecializations: {
      COMBUSTION_DYNAMICS: 0.75,
      VALVETRAIN_VVT: 0.60,
      SUPERCHARGING: 0.85,
      EXHAUST_ACOUSTICS: 0.50,
      ECU_CALIBRATION: 0.55,
    },
  },
  COMBUSTION_DYNAMICS: {
    id: "COMBUSTION_DYNAMICS",
    name: "Combustion Chambers & Thermodynamics",
    domain: "POWERTRAIN",
    description: "Flame propagation, knock thresholds, hemispherical heads, direct injection swirl.",
    relatedSpecializations: {
      TURBOCHARGING: 0.75,
      VALVETRAIN_VVT: 0.70,
      PISTON_ROD_ASSEMBLY: 0.65,
      EMISSIONS_CATALYSTS: 0.60,
    },
  },
  VALVETRAIN_VVT: {
    id: "VALVETRAIN_VVT",
    name: "Valvetrains & Variable Valve Timing",
    domain: "POWERTRAIN",
    description: "Cam phasers, desmodromic valves, pneumatic valve springs, hydraulic lifters.",
    relatedSpecializations: {
      COMBUSTION_DYNAMICS: 0.70,
      TURBOCHARGING: 0.60,
      CRANKSHAFT_BALANCING: 0.50,
    },
  },
  CRANKSHAFT_BALANCING: {
    id: "CRANKSHAFT_BALANCING",
    name: "Crankshaft Balancing & NVH",
    domain: "POWERTRAIN",
    description: "Crossplane vs flatplane harmonics, torsional vibration dampers, counterweights.",
    relatedSpecializations: {
      COMBUSTION_DYNAMICS: 0.60,
      PISTON_ROD_ASSEMBLY: 0.80,
      TRANSMISSION_GEARS: 0.55,
    },
  },
  TRANSMISSION_GEARS: {
    id: "TRANSMISSION_GEARS",
    name: "Transmission Gearsets & Clutching",
    domain: "POWERTRAIN",
    description: "Helical synchromesh, dual-clutch packs, epicyclic planetaries, shift forks.",
    relatedSpecializations: {
      CRANKSHAFT_BALANCING: 0.55,
      DIFFERENTIAL_LSD: 0.80,
    },
  },

  // ── CHASSIS & DYNAMICS ──
  SUSPENSION_KINEMATICS: {
    id: "SUSPENSION_KINEMATICS",
    name: "Suspension Geometry & Kinematics",
    domain: "CHASSIS",
    description: "Double wishbones, multi-link anti-squat/anti-dive, roll centers, scrub radius.",
    relatedSpecializations: {
      ACTIVE_DAMPING: 0.75,
      BRAKE_HYDRAULICS: 0.50,
      STEERING_RACKS: 0.70,
      CHASSIS_MONOCOQUE: 0.65,
    },
  },
  ACTIVE_DAMPING: {
    id: "ACTIVE_DAMPING",
    name: "MagneRide & Active Damping Control",
    domain: "CHASSIS",
    description: "Magnetorheological valves, adaptive solenoid pitch control, heave springs.",
    relatedSpecializations: {
      SUSPENSION_KINEMATICS: 0.75,
      ECU_CALIBRATION: 0.60,
      STEERING_RACKS: 0.55,
    },
  },
  BRAKE_HYDRAULICS: {
    id: "BRAKE_HYDRAULICS",
    name: "Carbon-Ceramic Rotors & Hydraulics",
    domain: "CHASSIS",
    description: "Monobloc calipers, cross-drilled rotor vanes, brake bias valves, brake-by-wire.",
    relatedSpecializations: {
      SUSPENSION_KINEMATICS: 0.50,
      CHASSIS_MONOCOQUE: 0.40,
    },
  },
  CHASSIS_MONOCOQUE: {
    id: "CHASSIS_MONOCOQUE",
    name: "Carbon Monocoque & Torsional Rigidity",
    domain: "CHASSIS",
    description: "Pre-preg autoclaved carbon tubs, shear web bulkheads, tubular subframe hardpoints.",
    relatedSpecializations: {
      SUSPENSION_KINEMATICS: 0.65,
      MATERIALS_COMPOSITES: 0.85,
      CRASH_STRUCTURES: 0.80,
    },
  },

  // ── AERODYNAMICS ──
  GROUND_EFFECT_VENTURI: {
    id: "GROUND_EFFECT_VENTURI",
    name: "Underbody Ground Effect & Venturi Tunnels",
    domain: "AERODYNAMICS",
    description: "Low-pressure suction floors, expansion ramps, tire-squirt strakes, porpoising control.",
    relatedSpecializations: {
      ACTIVE_AERO_DRS: 0.75,
      DIFFUSER_DESIGN: 0.90,
      CFD_SUPERCOMPUTING: 0.85,
    },
  },
  ACTIVE_AERO_DRS: {
    id: "ACTIVE_AERO_DRS",
    name: "Active Aerodynamics & DRS Actuation",
    domain: "AERODYNAMICS",
    description: "Servo-driven active wings, active splitter flaps, airbrake deceleration balance.",
    relatedSpecializations: {
      GROUND_EFFECT_VENTURI: 0.75,
      DIFFUSER_DESIGN: 0.70,
      CFD_SUPERCOMPUTING: 0.75,
    },
  },
  CFD_SUPERCOMPUTING: {
    id: "CFD_SUPERCOMPUTING",
    name: "Supercomputing Computational Fluid Dynamics",
    domain: "AERODYNAMICS",
    description: "Reynolds-averaged Navier-Stokes (RANS), boundary layer mesh refinement, turbulence models.",
    relatedSpecializations: {
      GROUND_EFFECT_VENTURI: 0.85,
      ACTIVE_AERO_DRS: 0.75,
      WIND_TUNNEL_CORRELATION: 0.90,
    },
  },

  // ── VEHICLE DESIGN & STYLING ──
  CLASS_A_SURFACING: {
    id: "CLASS_A_SURFACING",
    name: "Class-A Surfacing & Highlight Flow",
    domain: "DESIGN",
    description: "G2/G3 continuous curvature, character lines, light reflections, exterior sheet-metal.",
    relatedSpecializations: {
      CLAY_MODELING: 0.85,
      COCKPIT_ERGONOMICS: 0.60,
      LUXURY_MATERIALS: 0.50,
    },
  },
  CLAY_MODELING: {
    id: "CLAY_MODELING",
    name: "Full-Scale Clay Sculpting & Proportions",
    domain: "DESIGN",
    description: "Artisan clay modeling, 5-axis milling translation, stance and wheel arch harmony.",
    relatedSpecializations: {
      CLASS_A_SURFACING: 0.85,
      COCKPIT_ERGONOMICS: 0.55,
    },
  },
  COCKPIT_ERGONOMICS: {
    id: "COCKPIT_ERGONOMICS",
    name: "Cockpit Ergonomics & H-Point Clearance",
    domain: "DESIGN",
    description: "SAE J1100 H-point, driver sightlines, hand reach envelopes, switchgear tactile feedback.",
    relatedSpecializations: {
      CLASS_A_SURFACING: 0.60,
      LUXURY_MATERIALS: 0.75,
    },
  },

  // ── ELECTRONICS & SOFTWARE ──
  ECU_CALIBRATION: {
    id: "ECU_CALIBRATION",
    name: "Engine Management & ECU Dyno Mapping",
    domain: "ELECTRONICS",
    description: "Ignition timing advance tables, fuel trim stoichiometry, knock sensor feedback loops.",
    relatedSpecializations: {
      TURBOCHARGING: 0.55,
      COMBUSTION_DYNAMICS: 0.60,
      TELEMETRY_DATA: 0.70,
    },
  },

  // ── MANUFACTURING & QUALITY ──
  TOOLING_AND_DIES: {
    id: "TOOLING_AND_DIES",
    name: "Deep-Draw Stamping Tooling & Progressive Dies",
    domain: "MANUFACTURING",
    description: "Hydraulic press tooling, springback compensation, zinc-coated steel stamping dies.",
    relatedSpecializations: {
      ROBOTIC_ASSEMBLY: 0.70,
      QUALITY_METROLOGY: 0.75,
    },
  },
  QUALITY_METROLOGY: {
    id: "QUALITY_METROLOGY",
    name: "Laser CMM Metrology & Panel Gap Tolerancing",
    domain: "MANUFACTURING",
    description: "Coordinate Measuring Machines, 3.5mm shutlines, ultrasonic weld inspection, Six-Sigma.",
    relatedSpecializations: {
      TOOLING_AND_DIES: 0.75,
      ROBOTIC_ASSEMBLY: 0.65,
    },
  },

  // ── MOTORSPORT ──
  TRACKSIDE_TELEMETRY: {
    id: "TRACKSIDE_TELEMETRY",
    name: "Trackside Telemetry & Race Strategy",
    domain: "MOTORSPORT",
    description: "Tire degradation thermal curves, stint strategy, rapid gear ratio re-stacking.",
    relatedSpecializations: {
      ECU_CALIBRATION: 0.70,
      SUSPENSION_KINEMATICS: 0.65,
      TURBOCHARGING: 0.55,
    },
  },
};

/**
 * Calculate the project relevance match coefficient between an employee's
 * primary/secondary specialization and the project target specialization.
 * Returns a multiplier from 0.40 (mismatched) to 1.00 (exact match) up to 1.15 (master specialist).
 */
export function calculateSpecializationMatch(
  primarySpecId: string,
  secondarySpecId: string | undefined,
  specScore: number,
  targetSpecId: string
): number {
  if (primarySpecId === targetSpecId) {
    // Exact primary match: 1.00 + bonus up to 0.15 based on specialization mastery score
    return 1.0 + (Math.max(0, specScore - 70) / 30) * 0.15;
  }

  if (secondarySpecId && secondarySpecId === targetSpecId) {
    // Exact secondary match
    return 0.85 + (specScore / 100) * 0.10;
  }

  // Check related domain compatibility from registry
  const primaryDef = SPECIALIZATIONS[primarySpecId];
  if (primaryDef && primaryDef.relatedSpecializations[targetSpecId]) {
    const relationFactor = primaryDef.relatedSpecializations[targetSpecId];
    return 0.55 + relationFactor * 0.35; // 0.55 to 0.90
  }

  // Cross-domain mismatch baseline
  return 0.45;
}

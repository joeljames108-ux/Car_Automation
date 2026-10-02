/**
 * REGULATORY HOMOLOGATION & VEHICLE RECALLS ENGINE
 * 
 * Implements:
 * 1. Regional Type Approval & Homologation Checklists (NA, EU, Asia)
 * 2. 1970–2026 Chronological Mandate Milestones (5-mph bumpers, Catalytic converters, Airbags, ESC, ADAS)
 * 3. Field Failure & Defect Rate Curves
 * 4. Voluntary Service Campaign vs Government-Mandated Recalls
 */

export type HomologationRegion = "NA" | "EU" | "ASIA";

export interface RegulatoryMandate {
  id: string;
  name: string;
  region: HomologationRegion;
  effectiveYear: number;
  description: string;
  check: (vehicle: HomologationCandidate) => { passed: boolean; failureReason?: string; fixCost: number };
}

export interface HomologationCandidate {
  id: string;
  name: string;
  modelYear: number;
  ncapStars: number;
  hasCatalyticConverter: boolean;
  emissionsTier: "leaded_carb" | "early_catalyst" | "euro1_3" | "euro4_6" | "ev_zero_emission";
  has5MphBumpers: boolean;
  hasSealedBeamLights: boolean;
  airbagCount: number;
  hasESC: boolean;
  hasAEB_ADAS: boolean;
  qualityRatingScore: number; // 0-100 (from QA Lab)
  validationMileageKm: number; // Durability testing km
}

export interface RegionalHomologationStatus {
  region: HomologationRegion;
  approved: boolean;
  unmetMandates: string[];
  totalFixCostPerUnit: number;
  marketAccessGranted: boolean;
}

export interface HomologationEvaluation {
  vehicleId: string;
  year: number;
  regionalStatuses: Record<HomologationRegion, RegionalHomologationStatus>;
  allRegionsApproved: boolean;
}

export interface RecallEvent {
  id: string;
  vehicleId: string;
  vehicleName: string;
  year: number;
  month: number;
  defectCategory: "brakes" | "fuel_leak" | "steering_linkage" | "airbag_inflator" | "suspension_shear" | "software_ecu";
  severity: "minor" | "critical" | "catastrophic";
  type: "voluntary_service" | "safety_recall" | "government_mandated_recall";
  affectedFleetUnits: number;
  costPerVehicle: number;
  totalCost: number;
  reputationImpact: number;
  description: string;
  resolutionStage: "active_recall" | "remedied";
}

// ─────────────────────────────────────────────────────────────
// 1. HISTORICAL REGULATORY MANDATES (1970–2026)
// ─────────────────────────────────────────────────────────────

export const HISTORICAL_MANDATES: RegulatoryMandate[] = [
  // 1973: US 5-MPH Bumper Standard (FMVSS 215)
  {
    id: "us_5mph_bumper_1973",
    name: "FMVSS 215: 5-MPH Impact Bumpers",
    region: "NA",
    effectiveYear: 1973,
    description: "Front & rear bumpers must withstand 5 mph barrier impacts without safety lamp damage.",
    check: (v) => {
      if (v.has5MphBumpers) return { passed: true, fixCost: 0 };
      return { passed: false, failureReason: "Requires reinforced 5-mph shock-absorbing bumper bars.", fixCost: 240 };
    },
  },
  // 1975: US EPA Clean Air Act Catalytic Converter Mandate
  {
    id: "epa_catalyst_1975",
    name: "EPA Clean Air Act: Catalytic Reduction",
    region: "NA",
    effectiveYear: 1975,
    description: "Requires unleaded fuel calibration and underbody catalytic exhaust converter.",
    check: (v) => {
      if (v.hasCatalyticConverter || v.emissionsTier === "ev_zero_emission") return { passed: true, fixCost: 0 };
      return { passed: false, failureReason: "Missing catalytic converter and unleaded fuel restrictor neck.", fixCost: 450 };
    },
  },
  // 1983: US FMVSS 108 Flush Aerodynamic Composite Headlamps
  {
    id: "us_composite_lights_1983",
    name: "FMVSS 108 Amendment: Composite Light Enclosures",
    region: "NA",
    effectiveYear: 1983,
    description: "Modern flush aerodynamic lenses allowed (or standard sealed beams maintained).",
    check: (_v) => ({ passed: true, fixCost: 0 }),
  },
  // 1993: Euro 1 Emissions Mandate (ECE R83)
  {
    id: "euro_1_emissions_1993",
    name: "Euro 1 Environmental Standard (ECE R83)",
    region: "EU",
    effectiveYear: 1993,
    description: "Mandatory closed-loop 3-way catalytic converter and electronic fuel injection.",
    check: (v) => {
      if (v.emissionsTier !== "leaded_carb") return { passed: true, fixCost: 0 };
      return { passed: false, failureReason: "Leaded carburetted fuel systems strictly prohibited under Euro 1.", fixCost: 650 };
    },
  },
  // 1998: US FMVSS 208 Dual Frontal Airbags
  {
    id: "us_dual_airbags_1998",
    name: "FMVSS 208: Mandatory Dual Front Airbags",
    region: "NA",
    effectiveYear: 1998,
    description: "Driver and front passenger dual supplementary restraint airbags required.",
    check: (v) => {
      if (v.airbagCount >= 2) return { passed: true, fixCost: 0 };
      return { passed: false, failureReason: "Requires dual front passenger & driver airbag modules.", fixCost: 520 };
    },
  },
  // 1999: Euro NCAP 3-Star Crash Safety Barrier
  {
    id: "euroncap_3star_1999",
    name: "European Market 3-Star NCAP Crashworthiness",
    region: "EU",
    effectiveYear: 1999,
    description: "Vehicles must achieve at least 3 Euro NCAP crash stars for commercial market access.",
    check: (v) => {
      if (v.ncapStars >= 3) return { passed: true, fixCost: 0 };
      return { passed: false, failureReason: "Chassis failed offset frontal deformable barrier crash requirement (<3 stars).", fixCost: 1100 };
    },
  },
  // 2012: Electronic Stability Control (ESC) Mandate
  {
    id: "esc_mandate_2012",
    name: "FMVSS 126 / UN GTR 8: Mandatory Electronic Stability Control",
    region: "NA",
    effectiveYear: 2012,
    description: "Active 4-channel yaw-rate braking and torque reduction control required.",
    check: (v) => {
      if (v.hasESC) return { passed: true, fixCost: 0 };
      return { passed: false, failureReason: "Requires 4-channel ABS modulator with yaw and steering-angle sensors.", fixCost: 380 };
    },
  },
  // 2024: European General Safety Regulation II (GSR II)
  {
    id: "euro_gsr2_2024",
    name: "EU GSR II: Advanced Emergency Braking & Event Data Recorder",
    region: "EU",
    effectiveYear: 2024,
    description: "Autonomous Emergency Braking (AEB), Lane Keeping, and Black-Box EDR mandated.",
    check: (v) => {
      if (v.hasAEB_ADAS) return { passed: true, fixCost: 0 };
      return { passed: false, failureReason: "Requires radar/camera forward perception suite and EDR module.", fixCost: 890 };
    },
  },
];

// ─────────────────────────────────────────────────────────────
// 2. HOMOLOGATION EVALUATION ENGINE
// ─────────────────────────────────────────────────────────────

export class HomologationEngine {
  /**
   * Evaluates a vehicle against all applicable regional mandates for a given calendar year
   */
  public static evaluateVehicle(
    vehicle: HomologationCandidate,
    calendarYear: number
  ): HomologationEvaluation {
    const regions: HomologationRegion[] = ["NA", "EU", "ASIA"];
    const regionalStatuses: Record<HomologationRegion, RegionalHomologationStatus> = {
      NA: { region: "NA", approved: true, unmetMandates: [], totalFixCostPerUnit: 0, marketAccessGranted: true },
      EU: { region: "EU", approved: true, unmetMandates: [], totalFixCostPerUnit: 0, marketAccessGranted: true },
      ASIA: { region: "ASIA", approved: true, unmetMandates: [], totalFixCostPerUnit: 0, marketAccessGranted: true },
    };

    const applicableMandates = HISTORICAL_MANDATES.filter(m => calendarYear >= m.effectiveYear);

    for (const mandate of applicableMandates) {
      const result = mandate.check(vehicle);
      if (!result.passed) {
        const status = regionalStatuses[mandate.region];
        status.approved = false;
        status.marketAccessGranted = false;
        status.unmetMandates.push(`${mandate.name}: ${result.failureReason}`);
        status.totalFixCostPerUnit += result.fixCost;
      }
    }

    const allRegionsApproved = Object.values(regionalStatuses).every(s => s.marketAccessGranted);

    return {
      vehicleId: vehicle.id,
      year: calendarYear,
      regionalStatuses,
      allRegionsApproved,
    };
  }

  /**
   * Calculates field defect probability based on QA rating, durability testing km, and supplier defect rate
   */
  public static calculateDefectRisk(
    qaRatingScore: number,          // 0-100 (from UNIT_12 Quality HQ)
    validationMileageKm: number,    // e.g. 5,000 km to 100,000 km (from UNIT_07 Testing HQ)
    assemblyDefectRate: number = 0.015 // ~1.5%
  ): {
    fieldFailureRatePct: number;
    annualDefectProbability: number;
    riskCategory: "minimal" | "moderate" | "critical";
  } {
    // High QA score (e.g. 85+) and extensive durability testing (50k+ km) radically lowers failure rates
    const qaFactor = Math.max(0.1, 1 - (qaRatingScore / 100));
    const mileageFactor = Math.max(0.15, Math.exp(-validationMileageKm / 45000));
    
    // Field failure rate percentage across sold fleet
    const rawRate = (assemblyDefectRate * 100) * qaFactor * (1 + mileageFactor);
    const fieldFailureRatePct = Math.round(rawRate * 100) / 100;

    let annualDefectProbability = 0.05;
    let riskCategory: "minimal" | "moderate" | "critical" = "minimal";

    if (fieldFailureRatePct > 1.5) {
      annualDefectProbability = 0.65;
      riskCategory = "critical";
    } else if (fieldFailureRatePct > 0.6) {
      annualDefectProbability = 0.25;
      riskCategory = "moderate";
    } else {
      annualDefectProbability = 0.04;
      riskCategory = "minimal";
    }

    return {
      fieldFailureRatePct,
      annualDefectProbability,
      riskCategory,
    };
  }

  /**
   * Simulates monthly defect recall occurrence
   */
  public static checkMonthlyRecallTrigger(
    vehicle: HomologationCandidate,
    fleetSoldVolume: number,
    year: number,
    month: number,
    randomSeed: number = Math.random()
  ): RecallEvent | null {
    if (fleetSoldVolume < 100) return null;

    const risk = this.calculateDefectRisk(vehicle.qualityRatingScore, vehicle.validationMileageKm);
    
    // Monthly trigger threshold
    const monthlyThreshold = risk.annualDefectProbability / 12;
    if (randomSeed > monthlyThreshold) {
      return null;
    }

    // Determine recall category and type
    const defectTypes: RecallEvent["defectCategory"][] = [
      "brakes",
      "fuel_leak",
      "steering_linkage",
      "airbag_inflator",
      "suspension_shear",
      "software_ecu"
    ];
    const defectCategory = defectTypes[Math.floor(randomSeed * defectTypes.length * 10) % defectTypes.length];

    let severity: RecallEvent["severity"] = "minor";
    let costPerVehicle = 120;
    let type: RecallEvent["type"] = "voluntary_service";
    let reputationImpact = +1; // Voluntary service campaign actually shows customer care!

    if (risk.riskCategory === "critical") {
      severity = "catastrophic";
      type = "government_mandated_recall";
      costPerVehicle = 550;
      reputationImpact = -18; // Serious NHTSA / EU mandated recall
    } else if (risk.riskCategory === "moderate") {
      severity = "critical";
      type = "safety_recall";
      costPerVehicle = 320;
      reputationImpact = -7;
    }

    const affectedFleetUnits = Math.round(fleetSoldVolume * 0.45);
    const totalCost = affectedFleetUnits * costPerVehicle;

    return {
      id: `recall_${vehicle.id}_${year}_${month}`,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      year,
      month,
      defectCategory,
      severity,
      type,
      affectedFleetUnits,
      costPerVehicle,
      totalCost,
      reputationImpact,
      description: `${type.toUpperCase()}: ${defectCategory.replace("_", " ").toUpperCase()} defect reported in ${affectedFleetUnits} vehicles. Quality score was ${vehicle.qualityRatingScore}/100.`,
      resolutionStage: "active_recall",
    };
  }
}

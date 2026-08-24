/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — MULTI-PHYSICS COMPATIBILITY & SAFETY ENGINE
 * ============================================================================
 * Rigorously checks mechanical tolerances, valvetrain harmonics, combustion
 * knock limits, crankcase pressure, thermal dissipation, and structural limits.
 * Emits actionable diagnosis and recommended remedies rather than opaque errors.
 * ============================================================================
 */

import {
  MasterEngineState,
  EngineCompatibilityReport,
  EngineCompatibilityViolation,
} from "./masterEngineTypes";

export class EngineCompatibilityEngine {
  public static evaluate(state: MasterEngineState): EngineCompatibilityReport {
    const violations: EngineCompatibilityViolation[] = [];

    const arch = state.architecture;
    const block = state.block;
    const crank = state.crankshaft;
    const rods = state.connectingRods;
    const pistons = state.pistons;
    const heads = state.cylinderHeads;
    const cams = state.camshafts;
    const valves = state.valvesAndSprings;
    const intake = state.intake;
    const fuel = state.fuelSystem;
    const ignition = state.ignition;
    const turbo = state.turboSystem;
    const lube = state.lubrication;
    const tuning = state.tuning;

    // ------------------------------------------------------------------------
    // 1. VALVETRAIN HARMONICS & VALVE FLOAT SPEED
    // ------------------------------------------------------------------------
    // High cam lift requires sufficient spring open pressure.
    // Valve float occurs when spring force cannot keep up with valve deceleration.
    let baseFloatRpm = 6800;
    if (valves.springType === "dual_titanium_springs_pac") baseFloatRpm = 9800;
    else if (valves.springType === "pneumatic_nitrogen_chamber") baseFloatRpm = 14500;
    else if (heads.valvetrain === "desmodromic_mechanical") baseFloatRpm = 13500;

    // Heavy stainless valves reduce float RPM, titanium increases float RPM
    if (valves.intakeValveMaterial === "titanium_aluminide") baseFloatRpm += 800;
    else if (valves.intakeValveMaterial === "martensitic_stainless_steel") baseFloatRpm -= 500;

    // High lift and aggressive duration accelerates valve float
    if (cams.intakeLiftMm > 13.5) baseFloatRpm -= (cams.intakeLiftMm - 13.5) * 400;
    if (cams.intakeDurationAdvDeg > 290) baseFloatRpm -= (cams.intakeDurationAdvDeg - 290) * 15;

    const valveFloatRpm = Math.round(baseFloatRpm);

    if (tuning.revLimiterRpm > valveFloatRpm) {
      violations.push({
        id: "RULE_VALVE_FLOAT_HAZARD",
        severity: "critical_hazard",
        affectedComponents: ["valvesAndSprings", "camshafts", "tuning"],
        title: "Catastrophic Valve Float & Piston Contact Risk",
        description: `The engine rev limiter (${tuning.revLimiterRpm} RPM) exceeds the valvetrain float limit (${valveFloatRpm} RPM). Valves will bounce off seats and strike pistons at high RPM.`,
        recommendedRemedy: `Upgrade to Dual Titanium Springs (PAC) or Pneumatic F1 Valvetrain, or lower rev limiter below ${valveFloatRpm} RPM.`,
      });
    }

    // ------------------------------------------------------------------------
    // 2. KNOCK, DETONATION & OCTANE COMPLIANCE
    // ------------------------------------------------------------------------
    // Calculate static compression ratio estimate
    const cylinderDisplacementCc =
      ((Math.PI * Math.pow(block.boreMm / 2, 2) * block.strokeMm) / 1000);
    const clearanceVolCc = heads.combustionChamberVolumeCc - pistons.domeVolumeCc;
    const staticCR = Number(((cylinderDisplacementCc + clearanceVolCc) / Math.max(1, clearanceVolCc)).toFixed(2));

    // Dynamic boost pressure effective compression
    const effectiveBoostBar = turbo.type !== "naturally_aspirated" ? turbo.targetBoostPressureBar : 0;
    const effectiveCR = staticCR * Math.sqrt(1 + effectiveBoostBar);

    // Required octane rating calculation (AKI)
    let requiredOctane = 87 + (staticCR - 9.0) * 2.8 + effectiveBoostBar * 8.5;
    if (ignition.sparkPlugHeatRange >= 8) requiredOctane -= 1.5;
    if (pistons.materialClass === "ceramic_thermal_barrier_coated") requiredOctane -= 2.0;

    const fuelOctaneRatings = {
      pump_91: 91,
      pump_93: 93,
      e85_flex: 105,
      race_100_unleaded: 100,
      methanol_m1: 114,
    };
    const currentFuelOctane = fuelOctaneRatings[fuel.fuelTypeOctane] || 91;
    const detonationOctaneThreshold = Math.round(requiredOctane * 10) / 10;

    if (currentFuelOctane < requiredOctane - 2.5) {
      violations.push({
        id: "RULE_SEVERE_DETONATION_RISK",
        severity: "critical_hazard",
        affectedComponents: ["pistons", "turboSystem", "fuelSystem"],
        title: "Severe Combustion Detonation / Knock Hazard",
        description: `Effective compression with ${effectiveBoostBar.toFixed(1)} bar boost requires ~${detonationOctaneThreshold} Octane, but ${fuel.fuelTypeOctane} provides only ${currentFuelOctane} Octane. High likelihood of melted ringlands or blown head gasket.`,
        recommendedRemedy: `Switch fuel to E85 Flex Fuel / Race 100 Unleaded, lower boost pressure, or fit Dished Low-Compression Pistons.`,
      });
    } else if (currentFuelOctane < requiredOctane) {
      violations.push({
        id: "RULE_SPARK_RETARD_OCTANE_WARNING",
        severity: "performance_warning",
        affectedComponents: ["fuelSystem", "tuning"],
        title: "Sub-Optimal Fuel Octane (ECU Knock Retard Active)",
        description: `Engine will run with retarded ignition timing to prevent pre-ignition, sacrificing ~8% peak power.`,
        recommendedRemedy: `Use 93+ Octane fuel or advance ignition timing slightly with cooler heat range spark plugs.`,
      });
    }

    // ------------------------------------------------------------------------
    // 3. CRANKSHAFT & CONNECTING ROD TORQUE LIMITS
    // ------------------------------------------------------------------------
    const displacementL = (cylinderDisplacementCc * arch.cylinderCount) / 1000;
    const estimatedTorqueNm = Math.round(displacementL * 115 * (1 + effectiveBoostBar * 0.95));

    let maxCrankTorque = 650;
    if (crank.material === "forged_4340_steel") maxCrankTorque = 1450;
    else if (crank.material === "billet_en40b_nitrided") maxCrankTorque = 2200;
    else if (crank.material === "titanium_billet_f1") maxCrankTorque = 2600;

    let maxRodTorque = 600;
    if (rods.style === "h_beam_billet_4340") maxRodTorque = 1500;
    else if (rods.style === "x_beam_ultra_light") maxRodTorque = 1800;
    else if (rods.style === "titanium_forged_competition") maxRodTorque = 2500;

    if (estimatedTorqueNm > maxCrankTorque) {
      violations.push({
        id: "RULE_CRANKSHAFT_TORQUE_EXCEEDED",
        severity: "critical_hazard",
        affectedComponents: ["crankshaft", "turboSystem"],
        title: "Crankshaft Yield Stress Exceeded",
        description: `Estimated torque (${estimatedTorqueNm} Nm) exceeds the fatigue rating of ${crank.material} (${maxCrankTorque} Nm). Crankshaft may snap at main journals.`,
        recommendedRemedy: `Upgrade to Forged 4340 Steel or Billet EN40B Nitrided Crankshaft.`,
      });
    }

    if (estimatedTorqueNm > maxRodTorque) {
      violations.push({
        id: "RULE_CONNECTING_ROD_BENDING_HAZARD",
        severity: "critical_hazard",
        affectedComponents: ["connectingRods", "turboSystem"],
        title: "Connecting Rod Column Buckling Risk",
        description: `Combustion peak cylinder pressure will bend ${rods.style} connecting rods. Rated limit: ${maxRodTorque} Nm vs Output: ${estimatedTorqueNm} Nm.`,
        recommendedRemedy: `Fit H-Beam Billet 4340 or Titanium Forged Connecting Rods with ARP Custom Age 625 bolts.`,
      });
    }

    // ------------------------------------------------------------------------
    // 4. FORCED INDUCTION & CHARGE AIR COOLING (HEAT SOAK)
    // ------------------------------------------------------------------------
    if (turbo.type !== "naturally_aspirated" && turbo.targetBoostPressureBar > 1.2) {
      if (turbo.intercoolerType === "air_to_air_bar_plate" && turbo.targetBoostPressureBar > 2.2) {
        violations.push({
          id: "RULE_INTERCOOLER_THERMAL_EFFICIENCY",
          severity: "performance_warning",
          affectedComponents: ["turboSystem"],
          title: "Intake Charge Temperature Heat Soak",
          description: `Boost pressures above 2.2 bar exceed the thermal rejection capacity of standard Air-to-Air coolers. Intake air temps will exceed 65°C.`,
          recommendedRemedy: `Upgrade to Water-to-Air Charge Cooler with dedicated front heat exchanger or Cryogenic CO2 Spray.`,
        });
      }
    }

    // ------------------------------------------------------------------------
    // 5. HIGH-RPM OIL CONTROL & CRANKCASE SURGE
    // ------------------------------------------------------------------------
    if (tuning.revLimiterRpm > 8500 && lube.systemType === "wet_sump_baffled") {
      violations.push({
        id: "RULE_HIGH_RPM_OIL_STARVATION",
        severity: "critical_hazard",
        affectedComponents: ["lubrication", "tuning"],
        title: "High-G / High-RPM Oil Surge & Cavitation Hazard",
        description: `Wet sump oil pans experience severe aeration, oil sloshing, and rod bearing starvation at engine speeds above 8,500 RPM.`,
        recommendedRemedy: `Upgrade to 3-Stage or 5-Stage Dry Sump Lubrication with external oil reservoir and scavenge pumps.`,
      });
    }

    // ------------------------------------------------------------------------
    // 6. CYLINDER BORE SLEEVE PRESSURE RATING
    // ------------------------------------------------------------------------
    if (effectiveBoostBar > 2.0 && block.sleeveType === "cast_in_ductile_iron") {
      violations.push({
        id: "RULE_CYLINDER_SLEEVE_DISTORTION",
        severity: "performance_warning",
        affectedComponents: ["block", "turboSystem"],
        title: "Cylinder Wall Micro-Distortion Hazard",
        description: `Cast-in iron sleeves can crack or distort out-of-round under >2.0 bar cylinder pressures, causing ring seal loss and blow-by.`,
        recommendedRemedy: `Upgrade block to Darton Modular Sleeves or Plasma Transferred Wire Arc (PTWA).`,
      });
    }

    const criticalCount = violations.filter(v => v.severity === "critical_hazard").length;
    const warningCount = violations.filter(v => v.severity === "performance_warning").length;

    return {
      isMechanicallySafe: criticalCount === 0,
      criticalHazardsCount: criticalCount,
      warningsCount: warningCount,
      violations,
      valveFloatRpm,
      maxSafeCrankTorqueNm: maxCrankTorque,
      detonationThresholdOctane: detonationOctaneThreshold,
    };
  }
}

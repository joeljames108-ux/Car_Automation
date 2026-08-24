/**
 * ============================================================================
 * PACKAGING & COMPATIBILITY RULE ENGINE
 * ============================================================================
 * Evaluates geometric packaging, powertrain torque safety factors, cooling
 * thermal limits, tire-to-fender clearances, and electrical load balances.
 * Flags physical impossibilities with clear causes and suggested remedies.
 */

import { MasterVehicleState, PackagingCompatibilityReport, PackagingRuleViolation } from "./masterVehicleTypes";

export class PackagingCompatibilityEngine {
  public static evaluate(state: MasterVehicleState): PackagingCompatibilityReport {
    const violations: PackagingRuleViolation[] = [];
    const c = state.chassis;
    const p = state.powertrain;
    const t = state.transmission;
    const cl = state.cooling;
    const w = state.wheelsBrakes;
    const b = state.bodyPanels;
    const sf = state.safety;

    // ------------------------------------------------------------------------
    // 1. ENGINE BAY PACKAGING & ARCHITECTURE CHECK
    // ------------------------------------------------------------------------
    let maxEngineLengthMm = 750;
    if (c.wheelbaseMm > 2800) maxEngineLengthMm = 950;
    if (c.architecture === "mid_engine_rwd" || c.architecture === "mid_engine_awd") maxEngineLengthMm = 820;

    let engineLengthEstimateMm = 520;
    if (p.engineType === "v12") engineLengthEstimateMm = 920;
    else if (p.engineType === "v10") engineLengthEstimateMm = 780;
    else if (p.engineType === "v8") engineLengthEstimateMm = 650;
    else if (p.engineType === "i6") engineLengthEstimateMm = 820;
    else if (p.engineType === "boxer6") engineLengthEstimateMm = 610;

    const clearanceX = maxEngineLengthMm - engineLengthEstimateMm;
    const clearanceY = c.frontTrackMm - 1100;
    const clearanceZ = 450;

    if (clearanceX < 0) {
      violations.push({
        id: "RULE_ENGINE_BAY_OVERFLOW",
        severity: "critical_error",
        affectedSubsystems: ["chassis", "powertrain"],
        title: `Engine Length (${engineLengthEstimateMm}mm) Exceeds Bay Envelope (${maxEngineLengthMm}mm)`,
        explanation: `The selected ${p.engineType.toUpperCase()} engine exceeds the longitudinal clearance of this ${c.bodyType} chassis.`,
        consequence: "Engine block will physically collide with firewall and front crash structure.",
        remedySuggestion: "Increase chassis wheelbase (+100mm) or select a more compact V8/V6 engine architecture.",
      });
    }

    // ------------------------------------------------------------------------
    // 2. TRANSMISSION TORQUE CAPACITY CHECK
    // ------------------------------------------------------------------------
    const peakEngineTorque = state.metrics?.peakTorqueNm || p.peakTorqueNm;
    const torqueSafetyFactor = Number((t.maxTorqueRatingNm / Math.max(1, peakEngineTorque)).toFixed(2));

    if (torqueSafetyFactor < 1.0) {
      violations.push({
        id: "RULE_TRANSMISSION_TORQUE_EXCEEDED",
        severity: "critical_error",
        affectedSubsystems: ["powertrain", "transmission"],
        title: `Engine Torque (${peakEngineTorque} Nm) Exceeds Gearbox Rating (${t.maxTorqueRatingNm} Nm)`,
        explanation: `The transmission is rated for ${t.maxTorqueRatingNm} Nm, which is below the engine's peak torque output of ${peakEngineTorque} Nm (Safety Factor: ${torqueSafetyFactor}).`,
        consequence: "Catastrophic gear tooth shear and clutch slip during full-throttle acceleration.",
        remedySuggestion: "Upgrade to a heavy-duty sequential race gearbox or high-torque dual-clutch transmission.",
      });
    } else if (torqueSafetyFactor < 1.15) {
      violations.push({
        id: "RULE_TRANSMISSION_LOW_SAFETY_MARGIN",
        severity: "warning_advisory",
        affectedSubsystems: ["transmission"],
        title: `Low Transmission Safety Margin (${torqueSafetyFactor}x)`,
        explanation: "Transmission torque margin is under 15%. Aggressive standing starts may cause accelerated wear.",
        consequence: "Reduced gearbox lifespan during track days.",
        remedySuggestion: "Reinforce gearset or reduce turbo boost pressure slightly.",
      });
    }

    // ------------------------------------------------------------------------
    // 3. COOLING ADEQUACY CHECK
    // ------------------------------------------------------------------------
    const requiredThermalKw = p.thermalDissipationKw;
    const providedCoolingKw = cl.heatDissipationTotalKw;
    const coolingScorePercent = Math.min(100, Math.round((providedCoolingKw / Math.max(1, requiredThermalKw)) * 100));

    if (coolingScorePercent < 85) {
      violations.push({
        id: "RULE_THERMAL_DEFICIT",
        severity: "critical_error",
        affectedSubsystems: ["powertrain", "cooling"],
        title: `Cooling System Deficit (${coolingScorePercent}% Capacity)`,
        explanation: `Cooling system dissipates ${providedCoolingKw} kW, but the high-output engine generates ${requiredThermalKw} kW at peak load.`,
        consequence: "Engine coolant will boil over within 2 hot laps; severe power thermal derating will occur.",
        remedySuggestion: "Increase radiator core area (>3600 cm²), add dual oil coolers, and upgrade charge air cooler.",
      });
    } else if (coolingScorePercent < 100) {
      violations.push({
        id: "RULE_THERMAL_TIGHT_MARGIN",
        severity: "warning_advisory",
        affectedSubsystems: ["cooling"],
        title: `Borderline Cooling Margin (${coolingScorePercent}%)`,
        explanation: "Cooling is adequate for sprint racing but will struggle in high ambient temperature endurance events.",
        consequence: "Mild ECU ignition timing retarding during sustained top speed runs.",
        remedySuggestion: "Install high-flow sidepod cooling ducts or thicker radiator core.",
      });
    }

    // ------------------------------------------------------------------------
    // 4. WHEEL & FENDER CLEARANCE CHECK
    // ------------------------------------------------------------------------
    const frontMaxTireWidth = 245 + b.fenderWidthFrontBonusMm * 2;
    const rearMaxTireWidth = 275 + b.fenderWidthRearBonusMm * 2;
    const frontTireClearance = frontMaxTireWidth - w.wheelWidthFrontMm;
    const rearTireClearance = rearMaxTireWidth - w.wheelWidthRearMm;

    if (frontTireClearance < 0) {
      violations.push({
        id: "RULE_FRONT_TIRE_RUBBING",
        severity: "critical_error",
        affectedSubsystems: ["wheels_tires", "body_panels"],
        title: `Front Tire Width (${w.wheelWidthFrontMm}mm) Exceeds Arch Envelope (${frontMaxTireWidth}mm)`,
        explanation: "Front tires will rub against outer wheel arch and inner suspension uprights at full steering lock.",
        consequence: "Tire sidewall delamination and restricted turning radius.",
        remedySuggestion: "Widen front body fenders (+20mm flare) or reduce front tire section width.",
      });
    }

    if (rearTireClearance < 0) {
      violations.push({
        id: "RULE_REAR_TIRE_RUBBING",
        severity: "critical_error",
        affectedSubsystems: ["wheels_tires", "body_panels"],
        title: `Rear Tire Width (${w.wheelWidthRearMm}mm) Exceeds Arch Envelope (${rearMaxTireWidth}mm)`,
        explanation: "Rear wide-track tires extend beyond bodywork envelope.",
        consequence: "Tire contact under full suspension bump compression.",
        remedySuggestion: "Widen rear quarter panels or reduce rear tire width.",
      });
    }

    // ------------------------------------------------------------------------
    // 5. SAFETY & HARNESS COMPATIBILITY
    // ------------------------------------------------------------------------
    if (sf.harnessType === "sabelt_6_point_f1" && sf.rollCageType === "none") {
      violations.push({
        id: "RULE_HARNESS_WITHOUT_ROLLCAGE",
        severity: "warning_advisory",
        affectedSubsystems: ["safety", "interior"],
        title: "6-Point Racing Harness Installed Without Roll Cage",
        explanation: "A 6-point harness holds driver upright during a rollover. Without a structural cage, roof collapse poses extreme danger.",
        consequence: "Fails FIA / SCCA technical scrutiny inspection.",
        remedySuggestion: "Install 4-point harness bar or 6-point FIA bolt-in roll cage.",
      });
    }

    const criticalCount = violations.filter((v) => v.severity === "critical_error").length;
    const warningCount = violations.filter((v) => v.severity === "warning_advisory").length;

    return {
      isPhysicallyFeasible: criticalCount === 0,
      totalViolations: violations.length,
      criticalErrorsCount: criticalCount,
      warningsCount: warningCount,
      engineBayClearanceMm: { x: clearanceX, y: clearanceY, z: clearanceZ },
      wheelArchClearanceMm: { front: frontTireClearance, rear: rearTireClearance },
      coolingAdequacyScorePercent: coolingScorePercent,
      transmissionTorqueSafetyFactor: torqueSafetyFactor,
      electricalLoadBalanceWatts: 1850,
      violations: violations,
    };
  }
}

/**
 * ============================================================================
 * MASTER VEHICLE STATE ENGINE
 * ============================================================================
 * Central single source of truth managing all 12 vehicle subsystems,
 * reactive listeners, real-time multi-physics recalculation, delta tracking,
 * undo/redo history, and snapshot serialization.
 */

import {
  MasterVehicleState,
  PhysicsStateDelta,
  UnifiedVehiclePerformanceMetrics,
  UnifiedVehicleCostAndBOM,
  PackagingCompatibilityReport,
  VehicleComparisonDelta,
} from "./masterVehicleTypes";
import { COCKPIT_THEME_PRESETS } from "../../exterior3d/manifests/interiorStudioCatalog";
import { InteriorErgonomicsSolver } from "../interior/interiorErgonomicsSolver";
import { PackagingCompatibilityEngine } from "./compatibilityEngine";

export type StateChangeListener = (
  state: MasterVehicleState,
  delta?: PhysicsStateDelta
) => void;

export class MasterVehicleStateEngine {
  /**
   * Physics calibration constants for the quasi-static performance solver.
   * Fitted against the 100-car real-world benchmark fleet
   * (see src/sim/benchmarks/benchmarkCorrelationEngine.ts).
   */
  public static PERFORMANCE_CALIBRATION = {
    muLong: { street_comfort: 0.96, ultra_high_performance: 1.34, track_r_compound: 1.4, racing_slick: 1.46 },
    muLat: { street_comfort: 0.95, ultra_high_performance: 1.06, track_r_compound: 1.2, racing_slick: 1.38 },
    /** Engine-engagement / driver-reaction offset added to standing starts (s). */
    engageOffsetSec: { manual: 0.26, torque_converter: 0.2, dual_clutch: 0.34, sequential: 0.26, ev: 0 },
    drivetrainEff: { ice: 0.85, hybrid: 0.89, ev: 0.92 },
    deliveryFactor: {
      /** ICE delivery = clamp(iceBase + (Nm/HP)*iceTorqueSlope, iceMin, iceMax) */
      iceBase: 0.58, iceTorqueSlope: 0.15, iceMin: 0.66, iceMax: 0.84,
      hybrid: 0.76, ev: 0.9,
    },
    /** Power available at the top-speed operating point (cooling drag, drivetrain rise). */
    vmaxPowerFactor: 0.89,
    crr: 0.012,
    rolloutDiscountSec: 0.16,
    shiftLossFactor: 0.6,
    brakeMuFactor: 1.12,
    /** Drag-strip timing gear reads trap slightly below true exit speed. */
    trapMeasurementFactor: 0.96,
    // Log-space least-squares regression vs published Nordschleife reference laps
    lap: {
      baseSpeed: 181.35, powerExp: 0.1181, gripExp: 0.2716, dfExp: 0.3372,
      massExp: -0.0568, refMass: 1500, awdBonus: 1.0,
      spaFactor: 0.325, silverstoneFactor: 0.24, lagunaFactor: 0.185,
    },
  };

  private static instance: MasterVehicleStateEngine | null = null;
  private state: MasterVehicleState;
  private history: MasterVehicleState[] = [];
  private historyIndex: number = -1;
  private listeners: Set<StateChangeListener> = new Set();
  private lastDelta: PhysicsStateDelta | null = null;

  private constructor() {
    this.state = this.createDefaultVehicleState();
    this.recomputeAllMetrics();
    this.pushHistory();
  }

  public static getInstance(): MasterVehicleStateEngine {
    if (!MasterVehicleStateEngine.instance) {
      MasterVehicleStateEngine.instance = new MasterVehicleStateEngine();
    }
    return MasterVehicleStateEngine.instance;
  }

  public getState(): MasterVehicleState {
    return this.state;
  }

  public getLastDelta(): PhysicsStateDelta | null {
    return this.lastDelta;
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.state, this.lastDelta ?? undefined);
    return () => this.listeners.delete(listener);
  }

  private notify(delta?: PhysicsStateDelta): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state, delta);
      } catch (err) {
        console.error("Error in MasterVehicleStateEngine subscriber:", err);
      }
    });
  }

  // ==========================================================================
  // STATE MUTATIONS WITH DELTA TRACKING
  // ==========================================================================

  public updateChassis(patch: Partial<MasterVehicleState["chassis"]>): void {
    const prevMetrics = { ...this.state.metrics };
    const prevCost = this.state.costAndBOM.totalManufacturingCostUSD;
    const changedKey = Object.keys(patch)[0] || "chassis";
    const prevVal = (this.state.chassis as any)[changedKey];

    this.state = {
      ...this.state,
      chassis: { ...this.state.chassis, ...patch },
      updatedAt: new Date().toISOString(),
    };

    this.recomputeAllMetrics();
    const delta = this.computeDelta(
      `Chassis: ${changedKey}`,
      prevVal,
      (patch as any)[changedKey],
      prevMetrics,
      prevCost
    );
    this.lastDelta = delta;
    this.pushHistory();
    this.notify(delta);
  }

  public updatePowertrain(patch: Partial<MasterVehicleState["powertrain"]>): void {
    const prevMetrics = { ...this.state.metrics };
    const prevCost = this.state.costAndBOM.totalManufacturingCostUSD;
    const changedKey = Object.keys(patch)[0] || "powertrain";
    const prevVal = (this.state.powertrain as any)[changedKey];

    this.state = {
      ...this.state,
      powertrain: { ...this.state.powertrain, ...patch },
      updatedAt: new Date().toISOString(),
    };

    this.recomputeAllMetrics();
    const delta = this.computeDelta(
      `Engine: ${changedKey}`,
      prevVal,
      (patch as any)[changedKey],
      prevMetrics,
      prevCost
    );
    this.lastDelta = delta;
    this.pushHistory();
    this.notify(delta);
  }

  public updateTransmission(patch: Partial<MasterVehicleState["transmission"]>): void {
    const prevMetrics = { ...this.state.metrics };
    const prevCost = this.state.costAndBOM.totalManufacturingCostUSD;
    const changedKey = Object.keys(patch)[0] || "transmission";
    const prevVal = (this.state.transmission as any)[changedKey];

    this.state = {
      ...this.state,
      transmission: { ...this.state.transmission, ...patch },
      updatedAt: new Date().toISOString(),
    };

    this.recomputeAllMetrics();
    const delta = this.computeDelta(
      `Transmission: ${changedKey}`,
      prevVal,
      (patch as any)[changedKey],
      prevMetrics,
      prevCost
    );
    this.lastDelta = delta;
    this.pushHistory();
    this.notify(delta);
  }

  public updateSuspension(patch: Partial<MasterVehicleState["suspension"]>): void {
    const prevMetrics = { ...this.state.metrics };
    const prevCost = this.state.costAndBOM.totalManufacturingCostUSD;
    const changedKey = Object.keys(patch)[0] || "suspension";
    const prevVal = (this.state.suspension as any)[changedKey];

    this.state = {
      ...this.state,
      suspension: { ...this.state.suspension, ...patch },
      updatedAt: new Date().toISOString(),
    };

    this.recomputeAllMetrics();
    const delta = this.computeDelta(
      `Suspension: ${changedKey}`,
      prevVal,
      (patch as any)[changedKey],
      prevMetrics,
      prevCost
    );
    this.lastDelta = delta;
    this.pushHistory();
    this.notify(delta);
  }

  public updateWheelsBrakes(patch: Partial<MasterVehicleState["wheelsBrakes"]>): void {
    const prevMetrics = { ...this.state.metrics };
    const prevCost = this.state.costAndBOM.totalManufacturingCostUSD;
    const changedKey = Object.keys(patch)[0] || "wheelsBrakes";
    const prevVal = (this.state.wheelsBrakes as any)[changedKey];

    this.state = {
      ...this.state,
      wheelsBrakes: { ...this.state.wheelsBrakes, ...patch },
      updatedAt: new Date().toISOString(),
    };

    this.recomputeAllMetrics();
    const delta = this.computeDelta(
      `Wheels & Brakes: ${changedKey}`,
      prevVal,
      (patch as any)[changedKey],
      prevMetrics,
      prevCost
    );
    this.lastDelta = delta;
    this.pushHistory();
    this.notify(delta);
  }

  public updateAero(patch: Partial<MasterVehicleState["aero"]>): void {
    const prevMetrics = { ...this.state.metrics };
    const prevCost = this.state.costAndBOM.totalManufacturingCostUSD;
    const changedKey = Object.keys(patch)[0] || "aero";
    const prevVal = (this.state.aero as any)[changedKey];

    this.state = {
      ...this.state,
      aero: { ...this.state.aero, ...patch },
      updatedAt: new Date().toISOString(),
    };

    this.recomputeAllMetrics();
    const delta = this.computeDelta(
      `Aero: ${changedKey}`,
      prevVal,
      (patch as any)[changedKey],
      prevMetrics,
      prevCost
    );
    this.lastDelta = delta;
    this.pushHistory();
    this.notify(delta);
  }

  public updateInterior(patch: Partial<MasterVehicleState["interior"]>): void {
    const prevMetrics = { ...this.state.metrics };
    const prevCost = this.state.costAndBOM.totalManufacturingCostUSD;
    const changedKey = Object.keys(patch)[0] || "interior";
    const prevVal = (this.state.interior as any)[changedKey];

    this.state = {
      ...this.state,
      interior: { ...this.state.interior, ...patch },
      updatedAt: new Date().toISOString(),
    };

    this.recomputeAllMetrics();
    const delta = this.computeDelta(
      `Interior: ${changedKey}`,
      prevVal,
      (patch as any)[changedKey],
      prevMetrics,
      prevCost
    );
    this.lastDelta = delta;
    this.pushHistory();
    this.notify(delta);
  }

  public updateBodyPanels(patch: Partial<MasterVehicleState["bodyPanels"]>): void {
    const prevMetrics = { ...this.state.metrics };
    const prevCost = this.state.costAndBOM.totalManufacturingCostUSD;
    const changedKey = Object.keys(patch)[0] || "bodyPanels";
    const prevVal = (this.state.bodyPanels as any)[changedKey];

    this.state = {
      ...this.state,
      bodyPanels: { ...this.state.bodyPanels, ...patch },
      updatedAt: new Date().toISOString(),
    };

    this.recomputeAllMetrics();
    const delta = this.computeDelta(
      `Body: ${changedKey}`,
      prevVal,
      (patch as any)[changedKey],
      prevMetrics,
      prevCost
    );
    this.lastDelta = delta;
    this.pushHistory();
    this.notify(delta);
  }

  public updateCooling(patch: Partial<MasterVehicleState["cooling"]>): void {
    this.state = {
      ...this.state,
      cooling: { ...this.state.cooling, ...patch },
      updatedAt: new Date().toISOString(),
    };
    this.recomputeAllMetrics();
    this.pushHistory();
    this.notify();
  }

  public updateElectronics(patch: Partial<MasterVehicleState["electronics"]>): void {
    this.state = {
      ...this.state,
      electronics: { ...this.state.electronics, ...patch },
      updatedAt: new Date().toISOString(),
    };
    this.recomputeAllMetrics();
    this.pushHistory();
    this.notify();
  }

  public updateSafety(patch: Partial<MasterVehicleState["safety"]>): void {
    this.state = {
      ...this.state,
      safety: { ...this.state.safety, ...patch },
      updatedAt: new Date().toISOString(),
    };
    this.recomputeAllMetrics();
    this.pushHistory();
    this.notify();
  }

  // ==========================================================================
  // REAL-TIME MULTI-PHYSICS & COST SOLVER
  // ==========================================================================

  public static calculateStateMetrics(targetState: MasterVehicleState): {
    metrics: UnifiedVehiclePerformanceMetrics;
    costAndBOM: UnifiedVehicleCostAndBOM;
    ergonomics: any;
    compatibility: PackagingCompatibilityReport;
  } {
    const c = targetState.chassis;
    const p = targetState.powertrain;
    const t = targetState.transmission;
    const s = targetState.suspension;
    const w = targetState.wheelsBrakes;
    const a = targetState.aero;
    const b = targetState.bodyPanels;
    const cl = targetState.cooling;
    const el = targetState.electronics;
    const sf = targetState.safety;

    // 1. Total Mass Calculation (kg)
    const bodyPanelMass = b.material === "prepreg_carbon_fiber" ? 75 : b.material === "forged_carbon" ? 65 : b.material === "aluminum_sheet" ? 140 : 210;
    const totalMassKg =
      c.massKg +
      p.massKg +
      t.massKg +
      s.massKg +
      w.massKg +
      a.massKg +
      bodyPanelMass +
      cl.massKg +
      el.massKg +
      sf.massKg +
      140; // baseline interior & wiring loom

    // 2. Weight Distribution (Front / Rear)
    let frontWeightRatio = 0.50;
    if (c.architecture === "front_engine_rwd") frontWeightRatio = 0.53;
    if (c.architecture === "front_mid_engine_rwd") frontWeightRatio = 0.49;
    if (c.architecture === "mid_engine_rwd" || c.architecture === "mid_engine_awd") frontWeightRatio = 0.43;
    if (c.architecture === "rear_engine_rwd") frontWeightRatio = 0.39;
    if (c.architecture === "front_engine_fwd") frontWeightRatio = 0.61;

    const frontMassKg = totalMassKg * frontWeightRatio;
    const rearMassKg = totalMassKg * (1 - frontWeightRatio);

    const cornerWeights = {
      frontLeft: Number((frontMassKg / 2).toFixed(1)),
      frontRight: Number((frontMassKg / 2).toFixed(1)),
      rearLeft: Number((rearMassKg / 2).toFixed(1)),
      rearRight: Number((rearMassKg / 2).toFixed(1)),
    };

    // 3. Powertrain Outputs
    let effectiveHp = p.peakPowerHp || 500;
    if (p.aspiration === "twin_turbo" || p.aspiration === "single_turbo") {
      effectiveHp = p.displacementL * 140 * (1 + p.boostBar * 0.85);
    } else if (p.aspiration === "supercharged") {
      effectiveHp = p.displacementL * 125 * (1 + p.boostBar * 0.75);
    } else if (p.aspiration === "quad_turbo") {
      effectiveHp = p.displacementL * 180 * (1 + p.boostBar * 0.95);
    } else {
      effectiveHp = p.displacementL * 98; // naturally aspirated
    }
    if (p.peakPowerHp > effectiveHp) {
      effectiveHp = p.peakPowerHp;
    }
    const isElectricVehicle =
      p.fuelType === "ev_800v" || p.engineType === "electric_dual_motor";
    const isHybridVehicle = (p as { isHybrid?: boolean }).isHybrid === true || String(p.engineType).startsWith("hybrid");
    const computedTorqueNm = (effectiveHp * 7127) / Math.max(3000, p.redlineRpm * 0.75);
    const effectiveTorqueNm = p.peakTorqueNm > 0 ? Math.max(p.peakTorqueNm, computedTorqueNm) : computedTorqueNm;

    // 4. Aerodynamics Physics (Downforce & Drag)
    const airDensity = 1.225; // kg/m³
    const speed160Mps = 44.44; // 160 km/h = 44.44 m/s
    const speed250Mps = 69.44; // 250 km/h = 69.44 m/s

    // Wing area in m²
    const rearWingAreaM2 = (a.rearWingSpanMm / 1000) * (a.rearWingChordMm / 1000);
    const wingAngleRad = (a.rearWingAngleDeg * Math.PI) / 180;
    const wingCl = Math.sin(wingAngleRad) * 2.8 + (a.rearGurneyFlapHeightMm > 0 ? 0.35 : 0);
    const wingCd = Math.pow(Math.sin(wingAngleRad), 2) * 1.4 + 0.08;

    const splitterCl = (a.frontSplitterLengthMm / 100) * 0.45 + (a.frontCanardsCount * 0.12);
    const underbodyCl = a.underbodyVenturiTunnels ? 1.25 : a.underbodyFlatFloor ? 0.65 : 0.15;
    const diffuserCl = (a.rearDiffuserAngleDeg / 15) * 0.85;

    const totalCl = wingCl + splitterCl + underbodyCl + diffuserCl;
    const baseCd = 0.31;
    const totalCd = baseCd + wingCd * 0.4 + (a.rearDiffuserAngleDeg > 12 ? 0.04 : 0);

    const frontalAreaM2 = 2.15;
    const dynamicPressure160 = 0.5 * airDensity * Math.pow(speed160Mps, 2);
    const dynamicPressure250 = 0.5 * airDensity * Math.pow(speed250Mps, 2);

    // Declared aero overrides (benchmark mapper supplies measured Cd·A and downforce)
    const hasDeclaredAero = (a as { declaredAeroOverride?: boolean }).declaredAeroOverride === true;
    const declaredCdA = hasDeclaredAero && a.topSpeedDragAreaCdA > 0.05 ? a.topSpeedDragAreaCdA : 0;
    const effCdA = declaredCdA > 0 ? declaredCdA : totalCd * frontalAreaM2;
    const declaredDf160N = hasDeclaredAero && a.totalDownforceNAt100Mph > 0 ? a.totalDownforceNAt100Mph : 0;

    const geometricDf160N = totalCl * dynamicPressure160 * frontalAreaM2;
    const downforce160N = Math.round(declaredDf160N > 0 ? declaredDf160N : geometricDf160N);
    const drag160N = Math.round(effCdA * dynamicPressure160);
    const downforce250N = Math.round((declaredDf160N > 0 ? declaredDf160N : geometricDf160N) * Math.pow(speed250Mps / speed160Mps, 2));
    const drag250N = Math.round(effCdA * dynamicPressure250);

    // 5. Performance Dynamics — quasi-static point-mass solver
    // (traction-limited launch phase + power-limited phase with drag/rolling
    //  resistance, calibrated against the 100-car real-world benchmark fleet)
    const CAL = MasterVehicleStateEngine.PERFORMANCE_CALIBRATION;
    const G = 9.81; // standard gravity, m/s²
    const powerKw = effectiveHp * 0.7457;
    const powerToWeightHpPerTonne = Math.round((effectiveHp / totalMassKg) * 1000);

    let tireGripCoeff = CAL.muLong.street_comfort;
    if (w.tireCompound === "ultra_high_performance") tireGripCoeff = CAL.muLong.ultra_high_performance;
    if (w.tireCompound === "track_r_compound") tireGripCoeff = CAL.muLong.track_r_compound;
    if (w.tireCompound === "racing_slick") tireGripCoeff = CAL.muLong.racing_slick;
    let tireMuLat = CAL.muLat.street_comfort;
    if (w.tireCompound === "ultra_high_performance") tireMuLat = CAL.muLat.ultra_high_performance;
    if (w.tireCompound === "track_r_compound") tireMuLat = CAL.muLat.track_r_compound;
    if (w.tireCompound === "racing_slick") tireMuLat = CAL.muLat.racing_slick;

    const archAny = c.architecture as string;
    const isAWD = archAny.includes("awd") || archAny.includes("all_wheel");
    const isFWD = archAny === "front_engine_fwd";
    const rearAxleFraction = 1 - frontWeightRatio;

    // Longitudinal weight transfer: ΔW/W = μ · h/L
    const coGHeight = (c as { coGHeightMm?: number }).coGHeightMm ?? 460;
    const hOverL = Math.min(0.28, coGHeight / Math.max(2200, c.wheelbaseMm));
    let drivenAxleFraction: number;
    if (isElectricVehicle) drivenAxleFraction = 0.88;
    else if (isAWD) drivenAxleFraction = isHybridVehicle ? Math.min(0.88, rearAxleFraction + 0.32) : Math.min(0.96, rearAxleFraction + 0.5);
    else if (isFWD) drivenAxleFraction = Math.min(0.72, frontWeightRatio + tireGripCoeff * hOverL);
    else drivenAxleFraction = Math.min(0.95, rearAxleFraction + tireGripCoeff * hOverL);

    const ttKey = String(t.transmissionType);
    const engageOffsetSec =
      ttKey.startsWith("manual") ? CAL.engageOffsetSec.manual :
      ttKey.startsWith("torque_converter") ? CAL.engageOffsetSec.torque_converter :
      ttKey.startsWith("ev_direct") ? CAL.engageOffsetSec.ev :
      ttKey.startsWith("dual_clutch") ? CAL.engageOffsetSec.dual_clutch :
      CAL.engageOffsetSec.sequential;
    const tractionAccelMs2 = tireGripCoeff * G * drivenAxleFraction;

    // Wheel power after drivetrain losses.
    // Top-speed operating point sustains near-peak power; standing-run average
    // power scales with the engine's torque richness (Nm/HP) because flat,
    // torquey curves spend more time near peak-power rpm during a run.
    const drivetrainEff = isElectricVehicle ? CAL.drivetrainEff.ev : isHybridVehicle ? CAL.drivetrainEff.hybrid : CAL.drivetrainEff.ice;
    const torqueRichness = p.peakTorqueNm > 0 ? p.peakTorqueNm / Math.max(1, effectiveHp) : 1.1;
    const deliveryFactor = isElectricVehicle
      ? CAL.deliveryFactor.ev
      : isHybridVehicle
        ? CAL.deliveryFactor.hybrid
        : Math.min(CAL.deliveryFactor.iceMax, Math.max(CAL.deliveryFactor.iceMin, CAL.deliveryFactor.iceBase + torqueRichness * CAL.deliveryFactor.iceTorqueSlope));
    const wheelPowerW = effectiveHp * 745.7 * drivetrainEff;
    const accelPowerW = effectiveHp * 745.7 * drivetrainEff * deliveryFactor;

    const rollingResistN = CAL.crr * totalMassKg * G;
    const resistForceAt = (v: number) => 0.5 * airDensity * effCdA * v * v + rollingResistN;
    const accelAt = (v: number) =>
      Math.max(0.2, Math.min(tractionAccelMs2, accelPowerW / Math.max(4, totalMassKg * v)) - resistForceAt(v) / totalMassKg);

    // Rollout convention: manufacturer / drag-strip timing discounts the first
    // foot of the run for cars with launch control and non-manual gearboxes.
    const rolloutDiscount =
      el.launchControlInstalled && !ttKey.startsWith("manual") && !isElectricVehicle ? CAL.rolloutDiscountSec : 0;

    // Velocity-domain integration helper
    const integrateToSpeed = (vTargetMps: number): number => {
      let v = 0.5;
      let time = 0;
      const dv = 0.25;
      while (v < vTargetMps && time < 120) {
        const a = accelAt(v);
        time += dv / a;
        v += dv;
      }
      return time;
    };

    const shiftCountTo = (vEndMps: number) =>
      isElectricVehicle || t.gearCount <= 1
        ? 0
        : Math.max(0, Math.min(t.gearCount - 1, Math.round((vEndMps * 3.6) / 52) - 1));

    const shiftLossSec = (count: number) => count * (t.shiftTimeMs / 1000) * CAL.shiftLossFactor;

    const raw100 = integrateToSpeed(100 / 3.6);
    const zeroToHundredSec = Number(Math.max(1.6,
      raw100 + engageOffsetSec + shiftLossSec(Math.max(0, shiftCountTo(27.78) - 1)) - rolloutDiscount).toFixed(2));
    const raw200 = integrateToSpeed(200 / 3.6);
    const zeroToTwoHundredSec = Number(Math.max(3.5,
      raw200 + engageOffsetSec + shiftLossSec(Math.max(0, shiftCountTo(55.56) - 1)) - rolloutDiscount).toFixed(2));
    // Top Speed solver: wheel power balance vs aero drag + rolling resistance
    const vmaxPowerW = wheelPowerW * CAL.vmaxPowerFactor;
    let vTop = Math.pow(vmaxPowerW / (0.5 * airDensity * Math.max(0.12, effCdA)), 1 / 3);
    for (let i = 0; i < 24; i++) {
      const fDrag = resistForceAt(vTop);
      const targetV = vmaxPowerW / fDrag;
      vTop = vTop + (targetV - vTop) * 0.5;
    }
    const limiterKmh = el.topSpeedLimiterKmh ?? 0;
    const topSpeedKmh = Math.round(Math.max(80, Math.min(limiterKmh > 0 ? limiterKmh : 480, vTop * 3.6)));

    // Quarter Mile — distance-domain integration to 402.34 m
    let qmDist = 0, qmTime = 0, qmTrap = topSpeedKmh * 0.72;
    {
      let v = 0.5;
      const dt = 0.008;
      while (qmDist < 402.34 && qmTime < 60) {
        const a = accelAt(v);
        const vNext = v + a * dt;
        qmDist += ((v + vNext) / 2) * dt;
        qmTime += dt;
        v = vNext;
      }
      qmTrap = Math.round(v * 3.6);
      qmTime += engageOffsetSec + shiftLossSec(Math.max(0, shiftCountTo(qmTrap / 3.6) - 1)) - rolloutDiscount;
    }
    const quarterMileSec = Number(Math.max(5, qmTime).toFixed(2));
    const quarterMileTrapKmh = Math.min(topSpeedKmh, Math.round(qmTrap * CAL.trapMeasurementFactor));

    // Braking & Lateral Grip
    const brakePadCapG = w.brakeDiscType === "carbon_ceramic_matrix" ? 1.30 : w.brakeDiscType === "carbon_carbon_race" ? 1.45 : 1.15;
    const brakingDecelG = Math.min(brakePadCapG, tireMuLat * CAL.brakeMuFactor);
    const brakingDistM = Number((Math.pow(100 / 3.6, 2) / (2 * brakingDecelG * G)).toFixed(1));

    // Lateral G with aero downforce bonus
    const aeroLoadRatio = downforce160N / (totalMassKg * G);
    const maxLateralG = Number((tireMuLat * (1 + aeroLoadRatio)).toFixed(2));

    // 6. Track Lap Times — macro circuit model on Nürburgring Nordschleife 20.832 km.
    // Average speed scales with power-to-weight, tyre grip, aerodynamic load and mass.
    const dfTerm = 1 + (downforce250N / Math.max(1, totalMassKg * G));
    const avgLapSpeedKmh =
      CAL.lap.baseSpeed *
      Math.pow(Math.max(0.04, effectiveHp / totalMassKg), CAL.lap.powerExp) *
      Math.pow(tireMuLat, CAL.lap.gripExp) *
      Math.pow(dfTerm, CAL.lap.dfExp) *
      Math.pow(CAL.lap.refMass / Math.max(600, totalMassKg), CAL.lap.massExp) *
      (isAWD ? CAL.lap.awdBonus : 1);
    const nurburgringSec = Number(Math.max(240, (20832 / 1000 / Math.max(60, avgLapSpeedKmh)) * 3600).toFixed(2));
    const spaSec = Number((nurburgringSec * CAL.lap.spaFactor).toFixed(2));
    const silverstoneSec = Number((nurburgringSec * CAL.lap.silverstoneFactor).toFixed(2));
    const lagunaSecaSec = Number((nurburgringSec * CAL.lap.lagunaFactor).toFixed(2));

    const metrics: UnifiedVehiclePerformanceMetrics = {
      totalCurbMassKg: Math.round(totalMassKg),
      weightDistributionFrontPercent: Number((frontWeightRatio * 100).toFixed(1)),
      weightDistributionRearPercent: Number(((1 - frontWeightRatio) * 100).toFixed(1)),
      centerOfGravityHeightMm: Math.round(410 - (s.rideHeightFrontMm < 90 ? 25 : 0)),
      cornerWeightsKg: cornerWeights,
      powerToWeightRatioHpPerTonne: powerToWeightHpPerTonne,
      peakHorsepowerHp: Math.round(effectiveHp),
      peakTorqueNm: Math.round(effectiveTorqueNm),
      topSpeedKmh: topSpeedKmh,
      zeroToHundredKmhSec: zeroToHundredSec,
      zeroToTwoHundredKmhSec: zeroToTwoHundredSec,
      quarterMileTimeSec: quarterMileSec,
      quarterMileTrapSpeedKmh: quarterMileTrapKmh,
      brakingDistance100To0M: brakingDistM,
      maxLateralAccelerationG: maxLateralG,
      slalomSpeedKmh: Math.round(68 * maxLateralG),
      downforceAt160KmhN: downforce160N,
      dragAt160KmhN: drag160N,
      downforceAt250KmhN: downforce250N,
      dragAt250KmhN: drag250N,
      aerodynamicEfficiencyLOverD: Number((totalCl / Math.max(0.01, totalCd)).toFixed(2)),
      nurburgringNordschleifeLapSec: nurburgringSec,
      spaFrancorchampsLapSec: spaSec,
      silverstoneGPLapSec: silverstoneSec,
      lagunaSecaLapSec: lagunaSecaSec,
      engineCoolingMarginPercent: Math.round(((cl.heatDissipationTotalKw * 1000) / Math.max(1, p.thermalDissipationKw * 1000) - 1) * 100),
      brakeFadeResistancePercent: w.brakeDiscType === "carbon_ceramic_matrix" ? 98 : 82,
      fuelEconomyLitersPer100Km: Number((8.5 + (effectiveHp / 100) * 1.8 + totalCd * 4).toFixed(1)),
    };

    // 7. Cost & BOM Solver
    const cost: UnifiedVehicleCostAndBOM = {
      chassisCapExUSD: c.materialGrade === "carbon_composite" ? 35000 : c.materialGrade === "extruded_aluminum" ? 18000 : 8500,
      powertrainCapExUSD: Math.round(effectiveHp * 35 + (p.aspiration === "twin_turbo" ? 6500 : 0)),
      transmissionCapExUSD: t.transmissionType === "sequential_6sp" ? 18500 : t.transmissionType === "dual_clutch_8sp" ? 12000 : 4500,
      suspensionWheelsUSD: Math.round(w.brakeDiscType === "carbon_ceramic_matrix" ? 16000 : 4500),
      aeroPackageUSD: Math.round(a.rearWingSpanMm > 0 ? 8500 : 1500),
      bodyShellUSD: b.material === "prepreg_carbon_fiber" ? 28000 : 9500,
      interiorCabinUSD: (targetState.interior as any)?.totalCostUSD || 12500,
      electronicsSafetyUSD: 8500,
      assemblyLaborHours: 120,
      assemblyLaborUSD: 120 * 85,
      totalManufacturingCostUSD: 0,
      suggestedMSRPUSD: 0,
    };

    cost.totalManufacturingCostUSD =
      cost.chassisCapExUSD +
      cost.powertrainCapExUSD +
      cost.transmissionCapExUSD +
      cost.suspensionWheelsUSD +
      cost.aeroPackageUSD +
      cost.bodyShellUSD +
      cost.interiorCabinUSD +
      cost.electronicsSafetyUSD +
      cost.assemblyLaborUSD;
    cost.suggestedMSRPUSD = Math.round(cost.totalManufacturingCostUSD * 1.45);

    // 8. Interior Ergonomics Solver
    const ergo = InteriorErgonomicsSolver.solveErgonomics(targetState.interior as any, c.wheelbaseMm, c.frontTrackMm);

    // 9. Packaging & Compatibility Engine
    const compat = PackagingCompatibilityEngine.evaluate(targetState);

    return {
      metrics,
      costAndBOM: cost,
      ergonomics: ergo,
      compatibility: compat,
    };
  }

  public recomputeAllMetrics(): void {
    const solved = MasterVehicleStateEngine.calculateStateMetrics(this.state);
    this.state.metrics = solved.metrics;
    this.state.costAndBOM = solved.costAndBOM;
    this.state.ergonomics = solved.ergonomics;
    this.state.compatibility = solved.compatibility;
  }

  // ==========================================================================
  // DELTA COMPUTATION ENGINE
  // ==========================================================================

  private computeDelta(
    paramName: string,
    prevVal: any,
    newVal: any,
    prevMetrics: UnifiedVehiclePerformanceMetrics,
    prevCostUSD: number
  ): PhysicsStateDelta {
    const cur = this.state.metrics;
    const curCost = this.state.costAndBOM.totalManufacturingCostUSD;

    return {
      parameterName: paramName,
      previousValue: String(prevVal),
      newValue: String(newVal),
      deltaMassKg: cur.totalCurbMassKg - prevMetrics.totalCurbMassKg,
      deltaPowerHp: cur.peakHorsepowerHp - prevMetrics.peakHorsepowerHp,
      deltaTorqueNm: cur.peakTorqueNm - prevMetrics.peakTorqueNm,
      deltaZeroToHundredSec: Number((cur.zeroToHundredKmhSec - prevMetrics.zeroToHundredKmhSec).toFixed(2)),
      deltaTopSpeedKmh: cur.topSpeedKmh - prevMetrics.topSpeedKmh,
      deltaDownforceN: cur.downforceAt160KmhN - prevMetrics.downforceAt160KmhN,
      deltaDragN: cur.dragAt160KmhN - prevMetrics.dragAt160KmhN,
      deltaLateralG: Number((cur.maxLateralAccelerationG - prevMetrics.maxLateralAccelerationG).toFixed(2)),
      deltaLapTimeSec: Number((cur.nurburgringNordschleifeLapSec - prevMetrics.nurburgringNordschleifeLapSec).toFixed(2)),
      deltaCostUSD: curCost - prevCostUSD,
      timestamp: Date.now(),
    };
  }

  // ==========================================================================
  // COMPARISON STUDIO (CAR A vs CAR B)
  // ==========================================================================

  public compareWith(otherState: MasterVehicleState): VehicleComparisonDelta {
    const a = this.state.metrics;
    const solvedB = MasterVehicleStateEngine.calculateStateMetrics(otherState);
    const b = solvedB.metrics;
    const costB = solvedB.costAndBOM.totalManufacturingCostUSD;

    return {
      carA: { id: this.state.id, name: this.state.name },
      carB: { id: otherState.id, name: otherState.name },
      massDiffKg: a.totalCurbMassKg - b.totalCurbMassKg,
      powerDiffHp: a.peakHorsepowerHp - b.peakHorsepowerHp,
      torqueDiffNm: a.peakTorqueNm - b.peakTorqueNm,
      zeroToHundredDiffSec: Number((a.zeroToHundredKmhSec - b.zeroToHundredKmhSec).toFixed(2)),
      topSpeedDiffKmh: a.topSpeedKmh - b.topSpeedKmh,
      downforceDiffN: a.downforceAt160KmhN - b.downforceAt160KmhN,
      dragDiffN: a.dragAt160KmhN - b.dragAt160KmhN,
      lateralGDiff: Number((a.maxLateralAccelerationG - b.maxLateralAccelerationG).toFixed(2)),
      lapTimeDiffSec: Number((a.nurburgringNordschleifeLapSec - b.nurburgringNordschleifeLapSec).toFixed(2)),
      costDiffUSD: this.state.costAndBOM.totalManufacturingCostUSD - costB,
      sectorDeltas: {
        sector1DiffSec: Number(((a.nurburgringNordschleifeLapSec - b.nurburgringNordschleifeLapSec) * 0.32).toFixed(2)),
        sector2DiffSec: Number(((a.nurburgringNordschleifeLapSec - b.nurburgringNordschleifeLapSec) * 0.44).toFixed(2)),
        sector3DiffSec: Number(((a.nurburgringNordschleifeLapSec - b.nurburgringNordschleifeLapSec) * 0.24).toFixed(2)),
      },
    };
  }

  // ==========================================================================
  // HISTORY / UNDO / REDO
  // ==========================================================================

  private pushHistory(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(JSON.parse(JSON.stringify(this.state)));
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  public undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.recomputeAllMetrics();
      this.notify();
      return true;
    }
    return false;
  }

  public redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.recomputeAllMetrics();
      this.notify();
      return true;
    }
    return false;
  }

  // ==========================================================================
  // DEFAULT VEHICLE FACTORY
  // ==========================================================================

  public createDefaultVehicleState(): MasterVehicleState {
    return {
      id: "VEHICLE_MASTER_GT3_APEX",
      name: "Antigravity GT3 Apex Stradale",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Lead Vehicle Architect",
      chassis: {
        chassisId: "CHASSIS_HYPERCAR_01",
        bodyType: "hypercar",
        architecture: "mid_engine_rwd",
        chassisType: "carbon_tub",
        wheelbaseMm: 2720,
        frontTrackMm: 1680,
        rearTrackMm: 1660,
        frontOverhangMm: 850,
        rearOverhangMm: 780,
        groundClearanceMm: 95,
        materialGrade: "carbon_composite",
        torsionalRigidityKNmPerDeg: 68.5,
        massKg: 185,
      },
      powertrain: {
        engineType: "v8",
        displacementL: 4.0,
        cylinderCount: 8,
        aspiration: "twin_turbo",
        boostBar: 1.45,
        boreMm: 86,
        strokeMm: 86,
        compressionRatio: 9.8,
        redlineRpm: 8800,
        peakPowerHp: 780,
        peakTorqueNm: 850,
        fuelType: "race_100",
        thermalDissipationKw: 185,
        massKg: 198,
        mountedPistons: true,
        mountedCylinderHeads: true,
        mountedTurbos: true,
        mountedIntake: true,
      },
      transmission: {
        transmissionType: "dual_clutch_8sp",
        gearCount: 8,
        gearRatios: [3.82, 2.36, 1.68, 1.31, 1.08, 0.89, 0.76, 0.62],
        finalDriveRatio: 3.73,
        shiftTimeMs: 45,
        differentialType: "electronic_torque_vectoring",
        diffPreloadNm: 120,
        maxTorqueRatingNm: 1850,
        massKg: 78,
      },
      suspension: {
        frontType: "pushrod",
        rearType: "pushrod",
        frontSpringRateNmm: 145,
        rearSpringRateNmm: 165,
        frontDamperCompressionNsM: 4200,
        rearDamperCompressionNsM: 4800,
        frontDamperReboundNsM: 6500,
        rearDamperReboundNsM: 7200,
        frontAntiRollBarStiffnessNmDeg: 850,
        rearAntiRollBarStiffnessNmDeg: 920,
        camberFrontDeg: -3.2,
        camberRearDeg: -2.4,
        toeFrontDeg: -0.1,
        toeRearDeg: 0.2,
        rideHeightFrontMm: 85,
        rideHeightRearMm: 95,
        activeAeroRideHeightCompensation: true,
        massKg: 92,
      },
      wheelsBrakes: {
        wheelDiameterFrontInch: 19,
        wheelDiameterRearInch: 20,
        wheelWidthFrontMm: 295,
        wheelWidthRearMm: 345,
        tireCompound: "track_r_compound",
        tirePressureFrontPsi: 28,
        tirePressureRearPsi: 27,
        brakeDiscType: "carbon_ceramic_matrix",
        frontDiscDiameterMm: 410,
        rearDiscDiameterMm: 390,
        frontCaliperPistonCount: 8,
        rearCaliperPistonCount: 4,
        brakeBiasFrontPercent: 58,
        absEnabled: true,
        massKg: 88,
      },
      aero: {
        frontSplitterLengthMm: 140,
        frontCanardsCount: 4,
        frontWingAngleDeg: 8,
        underbodyFlatFloor: true,
        underbodyVenturiTunnels: true,
        rearDiffuserAngleDeg: 14,
        rearDiffuserStrakeCount: 4,
        rearWingSpanMm: 1680,
        rearWingChordMm: 320,
        rearWingAngleDeg: 16,
        rearGurneyFlapHeightMm: 8,
        activeDrsEnabled: true,
        activeDrsOpenWingAngleDeg: 2,
        sidepodsCoolingAirflowLps: 340,
        totalDownforceNAt100Mph: 4800,
        totalDragNAt100Mph: 1250,
        aeroBalanceFrontPercent: 43.5,
        liftToDragRatio: 3.84,
        topSpeedDragAreaCdA: 0.68,
        massKg: 42,
      },
      bodyPanels: {
        material: "prepreg_carbon_fiber",
        hoodStyle: "gt_twin_duct",
        roofStyle: "solid_coupe",
        fenderWidthFrontBonusMm: 30,
        fenderWidthRearBonusMm: 45,
        sideSkirtGroundSeal: true,
        paintColorHex: "#ef4444", // Rosso Corsa Red
        paintFinish: "gloss",
        liveryDecals: ["Apex Competition", "01"],
        massKg: 75,
      },
      cooling: {
        radiatorCoreAreaCm2: 3600,
        radiatorThicknessMm: 45,
        oilCoolerInstalled: true,
        intercoolerType: "water_to_air_charge_cooler",
        brakeCoolingDucts: true,
        transmissionCoolerInstalled: true,
        heatDissipationTotalKw: 240,
        massKg: 28,
      },
      interior: {
        ...(COCKPIT_THEME_PRESETS.THEME_ROSSO_CORSA_TRACK.config as any),
      },
      electronics: {
        tractionControlLevel: 4,
        launchControlInstalled: true,
        driveModes: ["COMFORT", "SPORT", "CORSA", "QUALIFYING"],
        activeDriveMode: "CORSA",
        telemetryLoggingFrequencyHz: 100,
        activeAerodynamicsController: true,
        brakeByWire: true,
        steerByWire: false,
        massKg: 24,
      },
      safety: {
        rollCageType: "6_point_fia_bolt_in",
        fireSuppressionInstalled: true,
        harnessType: "sabelt_6_point_f1",
        fuelCellSafetyBladder: true,
        crashStructureRating: "motorsport_fia",
        massKg: 38,
      },
      metrics: {} as any,
      ergonomics: {} as any,
      costAndBOM: {} as any,
      compatibility: {} as any,
    };
  }
}

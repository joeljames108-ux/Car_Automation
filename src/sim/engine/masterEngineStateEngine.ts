/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — MASTER STATE ENGINE
 * ============================================================================
 * Central reactive manager for the unified MasterEngineState.
 * - Reactive subscriptions for UI and 3D Viewport components
 * - 50-step deep undo / redo history stack
 * - Continuous re-computation of dyno curves, BOM cost, and mechanical safety
 * - Side-by-side engine comparison delta solver
 * - 6 Curated High-Fidelity Engine Archetype Presets
 * ============================================================================
 */

import {
  MasterEngineState,
  EngineComparisonDelta,
  MasterEnginePerformanceMetrics,
  MasterEngineCostAndBOM,
  EngineCompatibilityReport,
  DrivetrainSubsystemState,
} from "./masterEngineTypes";
import { EngineDynoSolver } from "./engineDynoSolver";
import { EngineCompatibilityEngine } from "./engineCompatibilityEngine";
import { DrivetrainSolver } from "./drivetrainSolver";

export class MasterEngineStateEngine {
  private static instance: MasterEngineStateEngine | null = null;
  private state: MasterEngineState;
  private subscribers: Set<(state: MasterEngineState) => void> = new Set();
  private history: MasterEngineState[] = [];
  private historyIndex: number = -1;

  public constructor(initialState?: MasterEngineState) {
    this.state = initialState || this.createPresetV8TwinTurbo();
    this.recomputeAll();
    this.pushHistory();
  }

  public static getInstance(): MasterEngineStateEngine {
    if (!MasterEngineStateEngine.instance) {
      MasterEngineStateEngine.instance = new MasterEngineStateEngine();
    }
    return MasterEngineStateEngine.instance;
  }

  public getState(): MasterEngineState {
    return this.state;
  }

  public subscribe(listener: (state: MasterEngineState) => void): () => void {
    this.subscribers.add(listener);
    listener(this.state);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notify(): void {
    this.subscribers.forEach((listener) => listener(this.state));
  }

  // ==========================================================================
  // STATE MUTATION METHODS (Single-Source-of-Truth Updaters)
  // ==========================================================================

  public updateArchitecture(patch: Partial<MasterEngineState["architecture"]>): void {
    this.state.architecture = { ...this.state.architecture, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateBlock(patch: Partial<MasterEngineState["block"]>): void {
    this.state.block = { ...this.state.block, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateCrankshaft(patch: Partial<MasterEngineState["crankshaft"]>): void {
    this.state.crankshaft = { ...this.state.crankshaft, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateConnectingRods(patch: Partial<MasterEngineState["connectingRods"]>): void {
    this.state.connectingRods = { ...this.state.connectingRods, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updatePistons(patch: Partial<MasterEngineState["pistons"]>): void {
    this.state.pistons = { ...this.state.pistons, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateCylinderHeads(patch: Partial<MasterEngineState["cylinderHeads"]>): void {
    this.state.cylinderHeads = { ...this.state.cylinderHeads, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateCamshafts(patch: Partial<MasterEngineState["camshafts"]>): void {
    this.state.camshafts = { ...this.state.camshafts, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateValvesAndSprings(patch: Partial<MasterEngineState["valvesAndSprings"]>): void {
    this.state.valvesAndSprings = { ...this.state.valvesAndSprings, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateIntake(patch: Partial<MasterEngineState["intake"]>): void {
    this.state.intake = { ...this.state.intake, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateFuelSystem(patch: Partial<MasterEngineState["fuelSystem"]>): void {
    this.state.fuelSystem = { ...this.state.fuelSystem, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateIgnition(patch: Partial<MasterEngineState["ignition"]>): void {
    this.state.ignition = { ...this.state.ignition, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateTurboSystem(patch: Partial<MasterEngineState["turboSystem"]>): void {
    this.state.turboSystem = { ...this.state.turboSystem, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateExhaust(patch: Partial<MasterEngineState["exhaust"]>): void {
    this.state.exhaust = { ...this.state.exhaust, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateLubrication(patch: Partial<MasterEngineState["lubrication"]>): void {
    this.state.lubrication = { ...this.state.lubrication, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateTuning(patch: Partial<MasterEngineState["tuning"]>): void {
    this.state.tuning = { ...this.state.tuning, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateDrivetrain(patch: Partial<DrivetrainSubsystemState>): void {
    this.state.drivetrain = { ...this.state.drivetrain, ...patch };
    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  public updateCosmetics(patch: Partial<NonNullable<MasterEngineState["cosmetics"]>>): void {
    const current = this.state.cosmetics || {
      coverModel: "hypercar_quartz",
      coverColor: "dry_carbon",
      coverBezelColor: "billet_gold",
      coverStripeStyle: "none",
      coverStripeColor: "#ffffff",
      badgeEmblemText: "APEX V12",
      badgeFinish: "gold",
      exhaustFinish: "titanium_blued",
      valveCoverColor: "rosso_red",
      anodizingTheme: "anodized_gold",
      showEngineCover: true,
      wireColor: "orange_hv",
    };
    this.state.cosmetics = { ...current, ...patch };
    this.pushHistory();
    this.notify();
  }

  public loadPreset(presetId: string): void {
    if (presetId === "v8_twin_turbo") this.state = this.createPresetV8TwinTurbo();
    else if (presetId === "inline_6_turbo") this.state = this.createPresetI6Turbo();
    else if (presetId === "v12_naturally_aspirated") this.state = this.createPresetV12NA();
    else if (presetId === "boxer_6_racing") this.state = this.createPresetBoxer6NA();
    else if (presetId === "inline_4_turbo") this.state = this.createPresetI4Turbo();
    else if (presetId === "w16_quad_turbo") this.state = this.createPresetW16QuadTurbo();

    this.recomputeAll();
    this.pushHistory();
    this.notify();
  }

  // ==========================================================================
  // RECOMPUTATION & SOLVER
  // ==========================================================================

  public static calculateStateOutputs(targetState: MasterEngineState): {
    performance: MasterEnginePerformanceMetrics;
    costAndBOM: MasterEngineCostAndBOM;
    compatibility: EngineCompatibilityReport;
  } {
    const { performance, costAndBOM } = EngineDynoSolver.solve(targetState);
    const compatibility = EngineCompatibilityEngine.evaluate(targetState);
    return { performance, costAndBOM, compatibility };
  }

  public recomputeAll(): void {
    const { performance, costAndBOM, compatibility } = MasterEngineStateEngine.calculateStateOutputs(this.state);
    this.state.performance = performance;
    this.state.costAndBOM = costAndBOM;
    this.state.compatibility = compatibility;

    // Compute coupled drivetrain performance (wheel torque, shift points, accel)
    if (this.state.drivetrain && performance.dynoCurve?.length > 0) {
      this.state.drivetrainPerformance = DrivetrainSolver.solve(
        performance,
        this.state.drivetrain,
      );
    }

    this.state.updatedAt = new Date().toISOString();
  }

  // ==========================================================================
  // ENGINE COMPARISON STUDIO (ENGINE A vs ENGINE B)
  // ==========================================================================

  public compareWith(otherEngineState: MasterEngineState): EngineComparisonDelta {
    const a = this.state.performance;
    const costA = this.state.costAndBOM.totalEngineBOMCostUSD;

    const solvedB = MasterEngineStateEngine.calculateStateOutputs(otherEngineState);
    const b = solvedB.performance;
    const costB = solvedB.costAndBOM.totalEngineBOMCostUSD;

    return {
      engineA: { id: this.state.id, name: this.state.name },
      engineB: { id: otherEngineState.id, name: otherEngineState.name },
      displacementDiffL: Number((a.displacementLiters - b.displacementLiters).toFixed(2)),
      powerDiffHp: a.peakHorsepowerHp - b.peakHorsepowerHp,
      torqueDiffNm: a.peakTorqueNm - b.peakTorqueNm,
      redlineDiffRpm: a.redlineRpm - b.redlineRpm,
      massDiffKg: Number((a.engineTotalMassKg - b.engineTotalMassKg).toFixed(1)),
      costDiffUSD: costA - costB,
      specificOutputDiffHpPerL: Number((a.specificOutputHpPerLiter - b.specificOutputHpPerLiter).toFixed(1)),
      thermalEfficiencyDiffPercent: Number((a.brakeThermalEfficiencyPercent - b.brakeThermalEfficiencyPercent).toFixed(1)),
      powerCurveA: a.dynoCurve,
      powerCurveB: b.dynoCurve,
    };
  }

  // ==========================================================================
  // HISTORY / UNDO / REDO (OPTIMIZED WITH DEBOUNCED SNAPSHOTS)
  // ==========================================================================

  private historyDebounceTimer: any = null;

  private pushHistory(immediate: boolean = false): void {
    if (immediate) {
      if (this.historyDebounceTimer) {
        clearTimeout(this.historyDebounceTimer);
        this.historyDebounceTimer = null;
      }
      this.executePushHistory();
      return;
    }

    if (this.historyDebounceTimer) {
      clearTimeout(this.historyDebounceTimer);
    }

    this.historyDebounceTimer = setTimeout(() => {
      this.executePushHistory();
      this.historyDebounceTimer = null;
    }, 350);
  }

  private executePushHistory(): void {
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
      this.recomputeAll();
      this.notify();
      return true;
    }
    return false;
  }

  public redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.recomputeAll();
      this.notify();
      return true;
    }
    return false;
  }

  // ==========================================================================
  // CURATED ENGINE PRESETS
  // ==========================================================================

  public createPresetV8TwinTurbo(): MasterEngineState {
    return {
      id: "ENG_V8_TWIN_TURBO_40",
      name: "Apex 4.0L Flat-Plane Twin-Turbo V8",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Chief Powertrain Engineer",
      architecture: {
        family: "v_engine",
        cylinderCount: 8,
        bankAngleDeg: 90,
        firingOrder: "1-8-2-7-4-5-3-6",
        deckHeightMm: 220,
        boreSpacingMm: 98,
      },
      block: {
        material: "billet_6061_t6",
        sleeveType: "nikasil_electroplate",
        boreMm: 86,
        strokeMm: 86,
        mainBearingBoreMm: 60,
        cylinderWallThicknessMm: 7.2,
        girdleReinforcementInstalled: true,
        crossBoltedMainCaps: true,
        massKg: 42,
        costUSD: 5200,
      },
      crankshaft: {
        material: "billet_en40b_nitrided",
        planeType: "flat_plane_180",
        strokeMm: 86,
        mainJournalDiaMm: 55,
        rodJournalDiaMm: 48,
        knifeEdgedCounterweights: true,
        harmonicDamperInstalled: true,
        flywheelFlangeBolts: 8,
        massKg: 16.5,
        costUSD: 3400,
      },
      connectingRods: {
        style: "titanium_forged_competition",
        rodLengthMm: 148,
        wristPinDiameterMm: 21,
        rodBoltGrade: "arp_custom_age_625",
        bushingMaterial: "beryllium_copper",
        massKgTotal: 3.2,
        costUSD: 2800,
      },
      pistons: {
        materialClass: "2618_forged_low_silicon_race",
        crownProfile: "dished_low_compression",
        compressionHeightMm: 31,
        domeVolumeCc: -12,
        ringPackage: "total_seal_gapless",
        skirtCoating: "tungsten_disulfide",
        wristPinMaterial: "dlc_coated_titanium",
        massKgTotal: 2.8,
        costUSD: 1600,
      },
      cylinderHeads: {
        valvetrain: "dohc_4v_roller_rocker",
        material: "billet_6061_t6",
        combustionChamberVolumeCc: 48,
        intakePortVolumeCc: 245,
        exhaustPortVolumeCc: 180,
        intakeValvesPerCylinder: 2,
        exhaustValvesPerCylinder: 2,
        intakeValveDiameterMm: 36.5,
        exhaustValveDiameterMm: 31.0,
        portFinish: "cnc_ported_stage3",
        massKgTotal: 26,
        costUSD: 4800,
      },
      camshafts: {
        intakeDurationAdvDeg: 282,
        exhaustDurationAdvDeg: 276,
        intakeLiftMm: 12.8,
        exhaustLiftMm: 12.2,
        lobeSeparationAngleDeg: 112,
        variableValveTimingIntake: true,
        variableValveTimingExhaust: true,
        vvtAdvanceRangeDeg: 45,
        massKg: 7.2,
        costUSD: 1800,
      },
      valvesAndSprings: {
        intakeValveMaterial: "titanium_aluminide",
        exhaustValveMaterial: "inconel_751_exhaust",
        springType: "dual_titanium_springs_pac",
        seatPressureLbs: 145,
        openPressureLbs: 380,
        retainerMaterial: "titanium_grade_5",
        massKgTotal: 3.8,
        costUSD: 1450,
      },
      intake: {
        style: "dual_plenum_ram_air",
        plenumVolumeLiters: 5.5,
        runnerLengthMm: 185,
        runnerDiameterMm: 52,
        throttleBodyDiameterMm: 82,
        airFilterType: "cotton_gauze_high_flow",
        manifoldMaterial: "prepreg_carbon_fiber",
        massKg: 5.8,
        costUSD: 2400,
      },
      fuelSystem: {
        injectionType: "dual_port_and_direct_dsi",
        injectorFlowCcPerMin: 1200,
        fuelRailPressureBar: 220,
        fuelPumpFlowLph: 650,
        fuelTypeOctane: "e85_flex",
        hasFlexFuelSensor: true,
        massKg: 4.5,
        costUSD: 1950,
      },
      ignition: {
        type: "coil_on_plug_cop",
        sparkPlugHeatRange: 8,
        sparkPlugGapMm: 0.65,
        coilEnergyMillijoules: 125,
        hasIonSenseKnockDetection: true,
        massKg: 3.2,
        costUSD: 850,
      },
      turboSystem: {
        type: "hot_v_twin_turbo",
        turboCount: 2,
        compressorInducerMm: 62,
        turbineExducerMm: 66,
        aRatio: 0.82,
        wastegateType: "external_dual_44mm_electronic",
        blowOffValveType: "recirculating_diverter",
        intercoolerType: "water_to_air_charge_cooler",
        targetBoostPressureBar: 1.65,
        turboHousingFinish: "titanium_blued",
        compressorWheelColor: "billet_gold",
        wastegateCapColor: "anodized_purple",
        couplerColor: "blue_silicone",
        massKg: 28,
        costUSD: 6800,
      },
      exhaust: {
        headerStyle: "inconel_pie_cut_hot_v",
        primaryTubeDiameterMm: 45,
        primaryTubeLengthMm: 620,
        collectorMergeAngleDeg: 15,
        downpipeDiameterMm: 76,
        catalyticConverter: "high_flow_200_cell",
        mufflerStyle: "titanium_valved_race",
        massKg: 14.5,
        costUSD: 4200,
      },
      lubrication: {
        systemType: "dry_sump_3_stage",
        oilPanCapacityLiters: 9.5,
        oilViscosityGrade: "5w30",
        oilCoolerInstalled: true,
        oilCoolerAreaSqCm: 1200,
        crankcaseScavengeStages: 3,
        massKg: 12.5,
        costUSD: 2900,
      },
      tuning: {
        revLimiterRpm: 8800,
        idleRpm: 950,
        ignitionTimingAdvanceDeg: 28,
        airFuelRatioTargetWOT: 11.8,
        vvtIntakeAdvanceMapDeg: 35,
        launchControlRpm: 4200,
        tractionControlTorqueReductionPercent: 25,
      },
      cosmetics: {
        coverModel: "hypercar_quartz",
        coverColor: "dry_carbon",
        coverBezelColor: "billet_gold",
        coverStripeStyle: "none",
        coverStripeColor: "#ffffff",
        badgeEmblemText: "APEX V12",
        badgeFinish: "gold",
        exhaustFinish: "titanium_blued",
        valveCoverColor: "rosso_red",
        anodizingTheme: "anodized_gold",
        showEngineCover: true,
        wireColor: "orange_hv",
      },
      drivetrain: {
        architecture: "dct_7",
        gearRatios: { gear1: 3.82, gear2: 2.36, gear3: 1.68, gear4: 1.28, gear5: 1.02, gear6: 0.84, gear7: 0.67, gear8: 0.55, finalDrive: 3.44 },
        activeGearCount: 7,
        lsdType: "e_lsd",
        clutchType: "carbon_multi_plate",
        clutchDiameterMm: 240,
        flywheelMassKg: 5.8,
        bellhousingMaterial: "cast_aluminum",
        gearsetMetallurgy: "aerospace_m50_nil",
        shiftTimingMs: 35,
        maxInputTorqueNm: 850,
        mechanicalEfficiencyPercent: 97.2,
        massKg: 78,
        costUSD: 9500,
      },
      performance: {} as any,
      costAndBOM: {} as any,
      compatibility: {} as any,
    };
  }

  public createPresetI6Turbo(): MasterEngineState {
    const s = this.createPresetV8TwinTurbo();
    s.id = "ENG_I6_TURBO_30";
    s.name = "Apex 3.0L Straight-6 Twin-Scroll";
    s.architecture = {
      family: "inline",
      cylinderCount: 6,
      bankAngleDeg: 0,
      firingOrder: "1-5-3-6-2-4",
      deckHeightMm: 218,
      boreSpacingMm: 91,
    };
    s.block.boreMm = 82;
    s.block.strokeMm = 94.6;
    s.block.cylinderWallThicknessMm = 6.8;
    s.turboSystem.type = "single_twin_scroll_turbo";
    s.turboSystem.turboCount = 1;
    s.turboSystem.compressorInducerMm = 68;
    s.turboSystem.targetBoostPressureBar = 1.45;
    s.tuning.revLimiterRpm = 7600;
    s.drivetrain = {
      ...s.drivetrain,
      architecture: "manual_6",
      activeGearCount: 6,
      gearRatios: { gear1: 3.50, gear2: 2.06, gear3: 1.41, gear4: 1.10, gear5: 0.91, gear6: 0.75, gear7: 0.65, gear8: 0.55, finalDrive: 3.73 },
      clutchType: "sintered_metallic",
      shiftTimingMs: 120,
      maxInputTorqueNm: 650,
      massKg: 65,
      costUSD: 6200,
    };
    return s;
  }

  public createPresetV12NA(): MasterEngineState {
    const s = this.createPresetV8TwinTurbo();
    s.id = "ENG_V12_NA_65";
    s.name = "Apex 6.5L Screaming V12 Corsa";
    s.architecture = {
      family: "v_engine",
      cylinderCount: 12,
      bankAngleDeg: 65,
      firingOrder: "1-12-4-9-2-11-6-7-3-10-5-8",
      deckHeightMm: 215,
      boreSpacingMm: 94,
    };
    s.block.boreMm = 94;
    s.block.strokeMm = 78;
    s.pistons.crownProfile = "domed_high_compression";
    s.pistons.domeVolumeCc = 8;
    s.intake.style = "individual_throttle_bodies_itb";
    s.turboSystem.type = "naturally_aspirated";
    s.turboSystem.turboCount = 0;
    s.turboSystem.targetBoostPressureBar = 0.0;
    s.tuning.revLimiterRpm = 9600;
    s.exhaust.headerStyle = "equal_length_long_tube";
    s.drivetrain = {
      ...s.drivetrain,
      architecture: "seq_7",
      activeGearCount: 7,
      gearRatios: { gear1: 3.18, gear2: 2.24, gear3: 1.76, gear4: 1.45, gear5: 1.22, gear6: 1.05, gear7: 0.92, gear8: 0.80, finalDrive: 3.90 },
      clutchType: "carbon_multi_plate",
      gearsetMetallurgy: "straight_cut_dog_ring",
      shiftTimingMs: 15,
      maxInputTorqueNm: 780,
      massKg: 72,
      costUSD: 14500,
    };
    return s;
  }

  public createPresetBoxer6NA(): MasterEngineState {
    const s = this.createPresetV8TwinTurbo();
    s.id = "ENG_BOXER_6_NA_40";
    s.name = "Apex 4.0L Flat-6 GT3 Motorsport";
    s.architecture = {
      family: "boxer",
      cylinderCount: 6,
      bankAngleDeg: 180,
      firingOrder: "1-6-2-4-3-5",
      deckHeightMm: 210,
      boreSpacingMm: 110,
    };
    s.block.boreMm = 102;
    s.block.strokeMm = 81.5;
    s.pistons.domeVolumeCc = 6;
    s.turboSystem.type = "naturally_aspirated";
    s.turboSystem.turboCount = 0;
    s.turboSystem.targetBoostPressureBar = 0.0;
    s.tuning.revLimiterRpm = 9200;
    s.drivetrain = {
      ...s.drivetrain,
      architecture: "dct_7",
      activeGearCount: 7,
      gearRatios: { gear1: 3.91, gear2: 2.29, gear3: 1.58, gear4: 1.19, gear5: 0.97, gear6: 0.79, gear7: 0.63, gear8: 0.52, finalDrive: 3.56 },
      clutchType: "carbon_multi_plate",
      gearsetMetallurgy: "straight_cut_dog_ring",
      shiftTimingMs: 20,
      maxInputTorqueNm: 520,
      massKg: 68,
      costUSD: 12800,
    };
    return s;
  }

  public createPresetI4Turbo(): MasterEngineState {
    const s = this.createPresetV8TwinTurbo();
    s.id = "ENG_I4_TURBO_20";
    s.name = "Apex 2.0L Turbo Track Spec I4";
    s.architecture = {
      family: "inline",
      cylinderCount: 4,
      bankAngleDeg: 0,
      firingOrder: "1-3-4-2",
      deckHeightMm: 215,
      boreSpacingMm: 88,
    };
    s.block.boreMm = 82.5;
    s.block.strokeMm = 92.8;
    s.turboSystem.type = "single_twin_scroll_turbo";
    s.turboSystem.turboCount = 1;
    s.turboSystem.targetBoostPressureBar = 1.85;
    s.tuning.revLimiterRpm = 7400;
    s.drivetrain = {
      ...s.drivetrain,
      architecture: "manual_6",
      activeGearCount: 6,
      gearRatios: { gear1: 3.63, gear2: 2.13, gear3: 1.43, gear4: 1.08, gear5: 0.87, gear6: 0.73, gear7: 0.65, gear8: 0.55, finalDrive: 4.10 },
      clutchType: "sintered_metallic",
      shiftTimingMs: 110,
      maxInputTorqueNm: 550,
      massKg: 58,
      costUSD: 4800,
    };
    return s;
  }

  public createPresetW16QuadTurbo(): MasterEngineState {
    const s = this.createPresetV8TwinTurbo();
    s.id = "ENG_W16_QUAD_TURBO_80";
    s.name = "Apex 8.0L Quad-Turbo W16 Hypercar";
    s.architecture = {
      family: "w_engine",
      cylinderCount: 16,
      bankAngleDeg: 90,
      firingOrder: "1-14-9-4-7-12-15-6-13-8-3-16-11-2-5-10",
      deckHeightMm: 228,
      boreSpacingMm: 88,
    };
    s.block.boreMm = 86;
    s.block.strokeMm = 86;
    s.turboSystem.type = "quad_turbo_staged";
    s.turboSystem.turboCount = 4;
    s.turboSystem.targetBoostPressureBar = 2.4;
    s.tuning.revLimiterRpm = 7200;
    s.drivetrain = {
      ...s.drivetrain,
      architecture: "dct_7",
      activeGearCount: 7,
      gearRatios: { gear1: 3.56, gear2: 2.18, gear3: 1.55, gear4: 1.17, gear5: 0.92, gear6: 0.76, gear7: 0.61, gear8: 0.50, finalDrive: 3.15 },
      clutchType: "carbon_multi_plate",
      gearsetMetallurgy: "aerospace_m50_nil",
      shiftTimingMs: 25,
      maxInputTorqueNm: 1600,
      mechanicalEfficiencyPercent: 96.8,
      massKg: 95,
      costUSD: 22000,
    };
    return s;
  }
}

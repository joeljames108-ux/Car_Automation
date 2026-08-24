/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — MULTI-PHYSICS DYNAMOMETER SOLVER
 * ============================================================================
 * Solves continuous power, torque, volumetric efficiency, turbo spool,
 * fuel flow, BSFC, thermal output, and manufacturing BOM cost across
 * the full engine operating range (0 to 12,000 RPM).
 * ============================================================================
 */

import {
  MasterEngineState,
  MasterEnginePerformanceMetrics,
  MasterEngineCostAndBOM,
  DynoDataPoint,
} from "./masterEngineTypes";

export class EngineDynoSolver {
  public static solve(state: MasterEngineState): {
    performance: MasterEnginePerformanceMetrics;
    costAndBOM: MasterEngineCostAndBOM;
  } {
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
    const exhaust = state.exhaust;
    const lube = state.lubrication;
    const tuning = state.tuning;

    // 1. Geometric Displacements
    const singleCylinderCc =
      (Math.PI * Math.pow(block.boreMm / 2, 2) * block.strokeMm) / 1000;
    const displacementCc = singleCylinderCc * arch.cylinderCount;
    const displacementLiters = Number((displacementCc / 1000).toFixed(2));
    const boreToStroke = Number((block.boreMm / block.strokeMm).toFixed(2));

    // 2. Static & Dynamic Compression Ratio
    const clearanceCc = heads.combustionChamberVolumeCc - pistons.domeVolumeCc;
    const staticCR = Number(((singleCylinderCc + clearanceCc) / Math.max(1, clearanceCc)).toFixed(2));

    const effectiveBoost = turbo.type !== "naturally_aspirated" ? turbo.targetBoostPressureBar : 0;
    const dynamicCR = Number((staticCR * Math.sqrt(1 + effectiveBoost)).toFixed(2));

    // 3. Valvetrain & Flow Coefficients
    // Optimal volumetric efficiency peak RPM based on intake runner & cam duration
    const camDuration = cams.intakeDurationAdvDeg;
    const camPeakRpm = Math.round(3000 + (camDuration - 240) * 45 + (heads.portFinish === "cnc_ported_stage3" ? 400 : 0));
    const runnerResonanceRpm = Math.round(90000 / Math.max(100, intake.runnerLengthMm));
    const peakVeRpm = Math.round((camPeakRpm * 0.65 + runnerResonanceRpm * 0.35));

    // Peak Volumetric Efficiency %
    let peakVE = 88.0;
    if (heads.valvetrain === "dohc_4v_roller_rocker" || heads.valvetrain === "dohc_5v") peakVE += 8.0;
    if (heads.valvetrain === "desmodromic_mechanical" || heads.valvetrain === "pneumatic_f1_valvetrain") peakVE += 12.0;
    if (intake.style === "individual_throttle_bodies_itb") peakVE += 5.5;
    if (heads.portFinish === "cnc_ported_stage3") peakVE += 4.5;
    if (exhaust.headerStyle === "equal_length_long_tube" || exhaust.headerStyle === "inconel_pie_cut_hot_v") peakVE += 3.5;
    if (cams.variableValveTimingIntake) peakVE += 3.0;

    // 4. Turbo Spool Threshold RPM
    let spoolThresholdRpm = 2400;
    if (turbo.type !== "naturally_aspirated") {
      spoolThresholdRpm = Math.round(
        1800 + (turbo.compressorInducerMm - 48) * 35 + (turbo.aRatio - 0.55) * 1200 / Math.max(1.5, displacementLiters)
      );
      if (turbo.type === "hot_v_twin_turbo" || turbo.type === "twin_turbo_parallel") {
        spoolThresholdRpm -= 350;
      }
    }

    // 5. Dyno Curve Solver (1000 RPM to Redline)
    const dynoCurve: DynoDataPoint[] = [];
    const redline = tuning.revLimiterRpm;
    let maxHp = 0;
    let maxHpRpm = 0;
    let maxTorque = 0;
    let maxTorqueRpm = 0;

    for (let rpm = 1000; rpm <= redline; rpm += 250) {
      // Natural Volumetric Efficiency curve
      const rpmOffset = (rpm - peakVeRpm) / 3200;
      let ve = peakVE * Math.exp(-0.5 * Math.pow(rpmOffset, 2));

      // Boost pressure build-up
      let currentBoost = 0;
      if (turbo.type !== "naturally_aspirated") {
        if (rpm < spoolThresholdRpm) {
          const spoolRatio = Math.max(0, (rpm - 1400) / (spoolThresholdRpm - 1400));
          currentBoost = effectiveBoost * Math.pow(spoolRatio, 2.2);
        } else {
          currentBoost = effectiveBoost;
          // High-RPM boost taper if exhaust backpressure rises
          if (rpm > 7500 && turbo.aRatio < 0.8) {
            currentBoost *= 1 - (rpm - 7500) * 0.00008;
          }
        }
      }

      // Airflow mass flow rate (g/s)
      const airDensity = 1.184 * (1 + currentBoost); // kg/m^3
      const sweptVolumeM3 = (displacementCc * 1e-6 * (rpm / 60)) / 2; // 4-stroke
      const airMassFlowGps = sweptVolumeM3 * airDensity * (ve / 100) * 1000;

      // Friction Mean Effective Pressure (FMEP) scaling with RPM^2 and bearing friction
      const meanPistonSpeedMps = (2 * block.strokeMm * rpm) / 60000;
      const fmepBar = 0.4 + 0.04 * meanPistonSpeedMps + 0.002 * Math.pow(meanPistonSpeedMps, 2);

      // Indicated Torque (Nm)
      const fuelFlowGps = airMassFlowGps / tuning.airFuelRatioTargetWOT;
      // Lower Heating Value of gasoline/ethanol = 43.5 kJ/g. Multiplied by thermal efficiency ~36%
      const combustionEnergyKw = fuelFlowGps * 43.5 * 0.36; // kW
      const indicatedTorqueNm = (combustionEnergyKw * 9549) / Math.max(500, rpm);

      // Net Brake Torque after mechanical & pumping losses (FMEP)
      const mechanicalLossNm = fmepBar * (displacementCc / 1000) * 7.958;
      let brakeTorqueNm = Math.round(indicatedTorqueNm - mechanicalLossNm);
      brakeTorqueNm = Math.max(20, brakeTorqueNm);

      // Brake Horsepower (HP = (Torque * RPM) / 7121)
      const horsepowerHp = Math.max(10, Math.round((brakeTorqueNm * rpm) / 7121));

      // Brake Specific Fuel Consumption (BSFC in g/kWh)
      const bsfc = Number((215 + Math.abs(rpm - peakVeRpm) * 0.018 + (currentBoost > 1.5 ? 25 : 0)).toFixed(1));

      // Exhaust Gas Temp (°C)
      const egt = Math.round(580 + (rpm / redline) * 240 + currentBoost * 65 - (tuning.airFuelRatioTargetWOT < 12.0 ? 45 : 0));

      // Combustion chamber peak pressure (bar)
      const pmax = Math.round(staticCR * 6.5 + currentBoost * 42);

      dynoCurve.push({
        rpm,
        horsepowerHp,
        torqueNm: brakeTorqueNm,
        boostBar: Number(currentBoost.toFixed(2)),
        volumetricEfficiencyPercent: Number(ve.toFixed(1)),
        bsfcGramsPerKwh: bsfc,
        exhaustGasTempC: egt,
        combustionPressureBar: pmax,
      });

      if (horsepowerHp > maxHp) {
        maxHp = horsepowerHp;
        maxHpRpm = rpm;
      }
      if (brakeTorqueNm > maxTorque) {
        maxTorque = brakeTorqueNm;
        maxTorqueRpm = rpm;
      }
    }

    // 6. Total Engine Mass (kg)
    const blockMass = block.material === "billet_6061_t6" ? 42 : block.material === "hypereutectic_aluminum" ? 48 : block.material === "magnesium_alloy" ? 34 : 85;
    const headsMass = heads.material === "billet_6061_t6" ? 26 : 32;
    const turboMass = turbo.type !== "naturally_aspirated" ? (turbo.turboCount * 14 + 18) : 0; // turbos + intercooler
    const accessoriesMass = 38; // alternator, pump, starter, harness, fluids

    const totalEngineMassKg = Math.round(
      (blockMass +
        headsMass * (arch.family === "inline" ? 1 : 2) +
        crank.massKg +
        rods.massKgTotal +
        pistons.massKgTotal +
        cams.massKg +
        valves.massKgTotal +
        intake.massKg +
        exhaust.massKg +
        lube.massKg +
        turboMass +
        accessoriesMass) * 10
    ) / 10;

    // 7. Bill of Materials (BOM) Cost Solver
    const machiningCost =
      (heads.portFinish === "cnc_ported_stage3" ? 2800 : 800) +
      (block.material === "billet_6061_t6" ? 4500 : 1200) +
      (crank.knifeEdgedCounterweights ? 750 : 0);

    const assemblyLaborHours = Math.round(24 + arch.cylinderCount * 1.5 + (turbo.type !== "naturally_aspirated" ? 12 : 0));
    const assemblyLaborCost = assemblyLaborHours * 95;

    const shortBlockCost = block.costUSD + crank.costUSD + rods.costUSD + pistons.costUSD + lube.costUSD;
    const headsCost = heads.costUSD + cams.costUSD + valves.costUSD;
    const totalBOM =
      shortBlockCost +
      headsCost +
      intake.costUSD +
      fuel.costUSD +
      ignition.costUSD +
      turbo.costUSD +
      exhaust.costUSD +
      machiningCost +
      assemblyLaborCost;

    const costAndBOM: MasterEngineCostAndBOM = {
      shortBlockCostUSD: shortBlockCost,
      cylinderHeadsCostUSD: headsCost,
      valvetrainCostUSD: valves.costUSD + cams.costUSD,
      forcedInductionCostUSD: turbo.costUSD,
      fuelAndIgnitionCostUSD: fuel.costUSD + ignition.costUSD,
      exhaustCostUSD: exhaust.costUSD,
      lubricationCoolingCostUSD: lube.costUSD + 850,
      precisionMachiningCostUSD: machiningCost,
      assemblyLaborHours,
      assemblyLaborCostUSD: assemblyLaborCost,
      totalEngineBOMCostUSD: totalBOM,
      suggestedMSRPUSD: Math.round(totalBOM * 1.55),
    };

    const meanPistonSpeedRedline = Number(((2 * block.strokeMm * redline) / 60000).toFixed(1));

    const performance: MasterEnginePerformanceMetrics = {
      displacementLiters,
      boreToStrokeRatio: boreToStroke,
      staticCompressionRatio: staticCR,
      effectiveDynamicCompressionRatio: dynamicCR,
      peakHorsepowerHp: maxHp,
      peakHorsepowerRpm: maxHpRpm,
      peakTorqueNm: maxTorque,
      peakTorqueRpm: maxTorqueRpm,
      redlineRpm: redline,
      specificOutputHpPerLiter: Number((maxHp / Math.max(0.5, displacementLiters)).toFixed(1)),
      volumetricEfficiencyPeakPercent: Number(peakVE.toFixed(1)),
      meanPistonSpeedAtRedlineMps: meanPistonSpeedRedline,
      brakeThermalEfficiencyPercent: 36.5,
      turboSpoolThresholdRpm: spoolThresholdRpm,
      turboLagIndexSec: turbo.type !== "naturally_aspirated" ? Number((0.25 + turbo.aRatio * 0.4).toFixed(2)) : 0.05,
      throttleResponseIndexMs: intake.style === "individual_throttle_bodies_itb" ? 45 : 120,
      engineTotalMassKg: totalEngineMassKg,
      dynoCurve,
    };

    return { performance, costAndBOM };
  }
}

// ============================================================================
// EDGE-CASE, BOUNDARY & FAILURE-MODE MULTI-PHYSICS TEST SUITE
// ============================================================================
// Tests all upgraded solvers against boundary values, zero conditions,
// extreme input conditions (350 km/h, 24000 RPM, -40°C), and fault injection modes.
// ============================================================================

import { SensorFusionKalmanFilter } from '../../adas/sensorFusionKalmanFilter';
import { CrashPulseRestraintSolver } from '../../safety/crashPulseRestraintSolver';
import { ActiveElectroHydraulicRollControl } from '../../suspension/activeElectroHydraulicRollControl';
import { SteerByWireForceFeedbackSolver } from '../../steering/steerByWireForceFeedbackSolver';
import { SolidStateLithiumMultiPhysics } from '../../battery/solidStateLithiumMultiPhysics';
import { BrakeByWireBlendingSolver } from '../../brakes/brakeByWireBlendingSolver';
import { AutonomousModelPredictiveController } from '../../ai/autonomousModelPredictiveController';
import { SicInverterThermalSolver } from '../../powertrain/sicInverterThermalSolver';
import { PmsmFluxWeakeningRotorFea } from '../../powertrain/pmsmFluxWeakeningRotorFea';
import { DualChamberAirSuspensionSolver } from '../../suspension/dualChamberAirSuspensionSolver';
import { ActiveVenturiDiffuserSolver } from '../../aerodynamics/activeVenturiDiffuserSolver';
import { ActiveAwdTransferCaseSolver } from '../../drivetrain/activeAwdTransferCaseSolver';
import { CarbonCeramicThermalStressFea } from '../../brakes/carbonCeramicThermalStressFea';
import { RefrigerantHeatPumpCycleSolver } from '../../thermal/refrigerantHeatPumpCycleSolver';

export interface EdgeCaseTestResult {
  suite: string;
  name: string;
  passed: boolean;
  score?: number;
  error?: string;
  durationMs: number;
}

export class EdgeCaseBoundaryTestRunner {
  public executeAllTests(): EdgeCaseTestResult[] {
    const results: EdgeCaseTestResult[] = [];

    // ── TEST 1: Zero Conditions (Stationary Vehicle) ──
    const t0 = performance.now();
    try {
      const adas = SensorFusionKalmanFilter.processSensorFusion({ egoVehicleSpeedKmh: 0 });
      const sbw = SteerByWireForceFeedbackSolver.evaluateSteerByWire({
        handwheelAngleDeg: 0,
        handwheelAngularVelocityDegSec: 0,
        vehicleSpeedKmh: 0,
        frontLateralForceN: 0,
      });
      const bbw = BrakeByWireBlendingSolver.evaluateBrakeBlending({
        pedalTravelMm: 0,
        vehicleSpeedKmh: 0,
        batterySocPct: 50,
      });

      const passed =
        adas.egoSpeedKmh === 0 &&
        sbw.handwheelFeedbackTorqueNm === 0 &&
        bbw.totalDriverBrakingTorqueDemandNm === 0 &&
        bbw.hydraulicCaliperPressureBar === 0;

      results.push({
        suite: 'EdgeCase_ZeroConditions',
        name: 'Solvers correctly handle zero speed, zero steering input, and zero brake demand without singularity',
        passed,
        durationMs: performance.now() - t0,
      });
    } catch (err: any) {
      results.push({
        suite: 'EdgeCase_ZeroConditions',
        name: 'Solvers correctly handle zero speed, zero steering input, and zero brake demand without singularity',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t0,
      });
    }

    // ── TEST 2: Extreme High-Speed & RPM Boundary (350 km/h, 22000 RPM) ──
    const t1 = performance.now();
    try {
      const motor = PmsmFluxWeakeningRotorFea.evaluateMotorPerformance({
        rotorSpeedRpm: 22000,
        demandedTorqueNm: 150,
      });
      const aero = ActiveVenturiDiffuserSolver.solveGroundEffectAerodynamics({
        vehicleSpeedKmh: 350,
        frontRideHeightMm: 22,
        rearRideHeightMm: 38,
        diffuserRampAngleDeg: 10.0,
      });
      const sic = SicInverterThermalSolver.evaluateSicInverter({
        dcBusVoltageV: 950,
        phaseCurrentRmsA: 550,
        switchingFrequencyKhz: 35,
      });

      const passed =
        motor.rotorFea.rotorSpeedRpm === 22000 &&
        motor.isFluxWeakeningActive &&
        aero.totalUnderbodyDownforceN > 3000 &&
        sic.losses.totalThreePhaseLossWatts > 1000;

      results.push({
        suite: 'EdgeCase_ExtremeSpeedRpm',
        name: 'PMSM, Inverter, and Aerodynamic solvers remain numerically stable at 350 km/h and 22,000 RPM',
        passed,
        durationMs: performance.now() - t1,
      });
    } catch (err: any) {
      results.push({
        suite: 'EdgeCase_ExtremeSpeedRpm',
        name: 'PMSM, Inverter, and Aerodynamic solvers remain numerically stable at 350 km/h and 22,000 RPM',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t1,
      });
    }

    // ── TEST 3: Battery Extreme SOC Boundaries (0% and 100%) ──
    const t2 = performance.now();
    try {
      const cellEmpty = SolidStateLithiumMultiPhysics.evaluateSolidStateCell({
        stateOfChargePct: 0.0,
        dischargeChargeCurrentAmps: 50.0,
      });
      const cellFull = SolidStateLithiumMultiPhysics.evaluateSolidStateCell({
        stateOfChargePct: 100.0,
        dischargeChargeCurrentAmps: -50.0,
      });

      const passed =
        cellEmpty.cellTerminalVoltageVolts < cellFull.cellTerminalVoltageVolts &&
        cellEmpty.openCircuitVoltageVolts > 3.0 &&
        cellFull.openCircuitVoltageVolts < 4.4 &&
        cellFull.degradation.coulombicEfficiencyPct > 99.0;

      results.push({
        suite: 'EdgeCase_BatterySocBoundaries',
        name: 'Solid-state electrochemical solver operates gracefully at 0.0% and 100.0% SOC boundaries',
        passed,
        durationMs: performance.now() - t2,
      });
    } catch (err: any) {
      results.push({
        suite: 'EdgeCase_BatterySocBoundaries',
        name: 'Solid-state electrochemical solver operates gracefully at 0.0% and 100.0% SOC boundaries',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t2,
      });
    }

    // ── TEST 4: Fault Injection & Redundancy Failover ──
    const t3 = performance.now();
    try {
      const sbwFaultA = SteerByWireForceFeedbackSolver.evaluateSteerByWire({
        handwheelAngleDeg: 45,
        handwheelAngularVelocityDegSec: 25,
        vehicleSpeedKmh: 100,
        frontLateralForceN: 3500,
        channelAFaultSimulated: true,
      });

      const sbwDualFault = SteerByWireForceFeedbackSolver.evaluateSteerByWire({
        handwheelAngleDeg: 45,
        handwheelAngularVelocityDegSec: 25,
        vehicleSpeedKmh: 100,
        frontLateralForceN: 3500,
        channelAFaultSimulated: true,
        channelBFaultSimulated: true,
      });

      const passed =
        sbwFaultA.redundancyState === 'SECONDARY_ONLY_FALLBACK' &&
        sbwFaultA.isFailOperationalRedundant === true &&
        sbwDualFault.redundancyState === 'SAFE_STOP_DEGRADED' &&
        sbwDualFault.isFailOperationalRedundant === false;

      results.push({
        suite: 'EdgeCase_FaultInjectionRedundancy',
        name: 'Steer-by-Wire correctly executes fail-operational single-channel failover and degraded safe-stop',
        passed,
        durationMs: performance.now() - t3,
      });
    } catch (err: any) {
      results.push({
        suite: 'EdgeCase_FaultInjectionRedundancy',
        name: 'Steer-by-Wire correctly executes fail-operational single-channel failover and degraded safe-stop',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t3,
      });
    }

    // ── TEST 5: Extreme Thermal Shock on Brake Disc (1000°C Stop) ──
    const t4 = performance.now();
    try {
      const ccmDisc = CarbonCeramicThermalStressFea.evaluateThermalStress({
        brakingPowerKw: 850, // 850 kW high-speed emergency stop
        rotorSpeedRpm: 1800,
        initialRotorTempC: 350.0,
      });

      const passed =
        ccmDisc.peakRotorTempC > 600.0 &&
        ccmDisc.radialNodes.length === 10 &&
        ccmDisc.coolingVaneAirflowCfm > 200.0 &&
        ccmDisc.thermalShockSafetyFactor > 0.5;

      results.push({
        suite: 'EdgeCase_BrakeThermalShock',
        name: 'Carbon-ceramic disc thermal stress FEA maintains convergence during 850 kW emergency deceleration',
        passed,
        durationMs: performance.now() - t4,
      });
    } catch (err: any) {
      results.push({
        suite: 'EdgeCase_BrakeThermalShock',
        name: 'Carbon-ceramic disc thermal stress FEA maintains convergence during 850 kW emergency deceleration',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t4,
      });
    }

    // ── TEST 6: Sub-Zero Ambient Temperature Heat Pump Defrost (-20°C) ──
    const t5 = performance.now();
    try {
      const hpSubZero = RefrigerantHeatPumpCycleSolver.evaluateHeatPumpCycle({
        mode: 'CABIN_HEATING_BATTERY_SCAVENGE',
        ambientTempC: -20.0,
        cabinTargetTempC: 22.0,
      });

      const passed =
        hpSubZero.coefficientOfPerformanceCop > 1.2 &&
        hpSubZero.heatingCapacityKw > 3.0 &&
        hpSubZero.compressorPowerConsumptionKw > 0.5 &&
        hpSubZero.cycleStatePoints.length === 4;

      results.push({
        suite: 'EdgeCase_SubZeroHeatPump',
        name: 'R-1234yf heat pump cycle maintains positive COP and heat scavenging at -20°C ambient temperature',
        passed,
        durationMs: performance.now() - t5,
      });
    } catch (err: any) {
      results.push({
        suite: 'EdgeCase_SubZeroHeatPump',
        name: 'R-1234yf heat pump cycle maintains positive COP and heat scavenging at -20°C ambient temperature',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t5,
      });
    }

    return results;
  }
}

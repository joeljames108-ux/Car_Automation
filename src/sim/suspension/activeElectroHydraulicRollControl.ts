// ============================================================================
// PHASE 67 — ACTIVE ELECTRO-HYDRAULIC ROLL CONTROL (eHRC) SOLVER
// ============================================================================
// 180-bar hydraulic rotary actuator on split anti-roll bar, fast proportional
// servo valve flow kinetics (tau < 25ms), and single-wheel pothole decoupling.
// ============================================================================

export interface ActiveRollControlState {
  hydraulicSystemPressureBar: number;
  servoValveSpoolPositionPct: number;
  rotaryActuatorTorqueNm: number;
  chassisRollSuppressionAngleDeg: number;
  counterTorqueResponseTimeMs: number;
  isSingleWheelPotholeDecoupled: boolean;
  powerConsumptionWatts: number;
}

export class ActiveElectroHydraulicRollControl {
  private static readonly MAX_SYSTEM_PRESSURE_BAR = 180.0;
  private static readonly MAX_ACTUATOR_TORQUE_NM = 1400.0;

  /**
   * Evaluates hydraulic servo valve kinetics and split ARB counter-torque.
   */
  public static evaluateActiveRollControl(params: {
    lateralAccelerationG: number;
    vehicleSpeedKmh: number;
    singleWheelBumpDetected?: boolean;
  }): ActiveRollControlState {
    const ay = params.lateralAccelerationG;
    const isPothole = params.singleWheelBumpDetected ?? false;

    // 1. Single-Wheel Pothole Decoupling (Open bypass valve for maximum ride plushness)
    if (isPothole && Math.abs(ay) < 0.25) {
      return {
        hydraulicSystemPressureBar: 35.0,
        servoValveSpoolPositionPct: 0.0,
        rotaryActuatorTorqueNm: 0.0,
        chassisRollSuppressionAngleDeg: 0.0,
        counterTorqueResponseTimeMs: 12.0,
        isSingleWheelPotholeDecoupled: true,
        powerConsumptionWatts: 45,
      };
    }

    // 2. Proportional Servo Valve Flow & Pressure Demand
    // Demand torque proportional to lateral acceleration: T_dem = k * ay
    const demandRatio = Math.min(1.0, Math.abs(ay) / 1.15);
    const actuatorTorqueNm = demandRatio * this.MAX_ACTUATOR_TORQUE_NM;
    const valveSpoolPct = demandRatio * 100;
    const activePressureBar = 40 + demandRatio * (this.MAX_SYSTEM_PRESSURE_BAR - 40);

    // 3. Roll Angle Suppression (Suppresses up to 3.5 deg of passive chassis roll down to 0.4 deg)
    const passiveRollDeg = Math.abs(ay) * 3.5;
    const activeRollDeg = Math.max(0.2, passiveRollDeg - (actuatorTorqueNm / 450));

    // Hydraulic pump power consumption
    const powerW = 80 + (actuatorTorqueNm / this.MAX_ACTUATOR_TORQUE_NM) * 850;

    return {
      hydraulicSystemPressureBar: Math.round(activePressureBar * 10) / 10,
      servoValveSpoolPositionPct: Math.round(valveSpoolPct * 10) / 10,
      rotaryActuatorTorqueNm: Math.round(actuatorTorqueNm * 10) / 10,
      chassisRollSuppressionAngleDeg: Math.round(activeRollDeg * 100) / 100,
      counterTorqueResponseTimeMs: 18.5,
      isSingleWheelPotholeDecoupled: false,
      powerConsumptionWatts: Math.round(powerW),
    };
  }
}

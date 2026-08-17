// ============================================================================
// PHASE 34 — ACTIVE AERODYNAMICS DRS & ADAPTIVE VENTURI ACTUATOR SOLVER
// ============================================================================
// Real-time active aero control solver modeling Drag Reduction System (DRS),
// airbrake rapid deployment, adaptive underfloor Venturi diffuser strakes,
// and aerodynamic center-of-pressure (CP) balance migration.
// ============================================================================

export interface ActiveAeroState {
  rearWingAngleDeg: number; // 0 to 18 deg (normal), up to 55 deg (airbrake)
  drsActive: boolean;
  airbrakeActive: boolean;
  frontActiveFlapAngleDeg: number; // 0 to 12 deg
  diffuserThroatHeightMm: number; // 15mm to 65mm
  currentCd: number;
  currentClFront: number;
  currentClRear: number;
  currentTotalDownforceN: number;
  currentTotalDragN: number;
  centerOfPressureFrontPct: number;
  aeroEfficiencyLOverD: number;
}

export class ActiveAerodynamicsActuatorSolver {
  // Baseline Aerodynamic Coefficients (Clean Sedan / GT Body)
  private static readonly BASE_CD = 0.285;
  private static readonly BASE_CL_FRONT = 0.12;
  private static readonly BASE_CL_REAR = 0.18;
  private static readonly FRONTAL_AREA_M2 = 2.15;
  private static readonly AIR_DENSITY = 1.225; // kg/m^3

  /**
   * Solves real-time active aero actuator positions and resulting forces.
   */
  public static evaluateActiveAeroTick(params: {
    vehicleSpeedKmh: number;
    longitudinalAccelG: number; // Negative for braking
    lateralAccelG: number;
    driverDrsButtonPressed: boolean;
    steeringAngleDeg: number;
  }): ActiveAeroState {
    const vMs = (params.vehicleSpeedKmh * 1000) / 3600;
    const dynamicPressure = 0.5 * this.AIR_DENSITY * vMs * vMs;

    // 1. Airbrake Mode Trigger: Triggered when vehicle speed > 80 km/h and hard braking (accel < -0.6g)
    const isAirbrakeTriggered = params.vehicleSpeedKmh > 80 && params.longitudinalAccelG < -0.60;

    // 2. DRS Mode Trigger: Enabled when driver presses button, speed > 100 km/h, not turning hard, and not braking
    const isDrsEligible =
      params.driverDrsButtonPressed &&
      params.vehicleSpeedKmh > 100 &&
      Math.abs(params.steeringAngleDeg) < 15 &&
      params.longitudinalAccelG >= -0.10;

    let wingAngleDeg = 8.0; // Default high-downforce road setting
    let drsActive = false;
    let airbrakeActive = false;
    let frontFlapAngleDeg = 4.0;
    let diffuserHeightMm = 35; // Default 35mm ground clearance

    if (isAirbrakeTriggered) {
      wingAngleDeg = 55.0; // Max airbrake angle
      airbrakeActive = true;
      frontFlapAngleDeg = 12.0; // Max front drag
      diffuserHeightMm = 15; // Max Venturi restriction
    } else if (isDrsEligible) {
      wingAngleDeg = 0.0; // Flat DRS slot
      drsActive = true;
      frontFlapAngleDeg = 0.0;
      diffuserHeightMm = 55; // Open low-drag diffuser
    }

    // 3. Compute Resulting Aero Coefficients
    let cd = this.BASE_CD;
    let clFront = this.BASE_CL_FRONT;
    let clRear = this.BASE_CL_REAR;

    if (airbrakeActive) {
      cd += 0.42; // Huge air resistance
      clRear += 0.55; // Extreme rear stabilization downforce
      clFront += 0.20;
    } else if (drsActive) {
      cd -= 0.095; // Low-drag high speed sprint
      clRear -= 0.28;
    } else {
      // Linear scaling with wing angle: 0.012 Cd / deg, 0.025 Cl / deg
      cd += (wingAngleDeg - 8.0) * 0.008;
      clRear += (wingAngleDeg - 8.0) * 0.022;
      clFront += (frontFlapAngleDeg - 4.0) * 0.015;
    }

    // 4. Calculate Aero Forces (Newtons)
    const dragForceN = dynamicPressure * cd * this.FRONTAL_AREA_M2;
    const downforceFrontN = dynamicPressure * clFront * this.FRONTAL_AREA_M2;
    const downforceRearN = dynamicPressure * clRear * this.FRONTAL_AREA_M2;
    const totalDownforceN = downforceFrontN + downforceRearN;

    // 5. Center of Pressure (CP) Front Balance %
    const cpFrontPct = totalDownforceN > 0 ? (downforceFrontN / totalDownforceN) * 100 : 45.0;
    const lOverD = dragForceN > 0 ? totalDownforceN / dragForceN : 0.0;

    return {
      rearWingAngleDeg: wingAngleDeg,
      drsActive,
      airbrakeActive,
      frontActiveFlapAngleDeg: frontFlapAngleDeg,
      diffuserThroatHeightMm: diffuserHeightMm,
      currentCd: Math.round(cd * 1000) / 1000,
      currentClFront: Math.round(clFront * 1000) / 1000,
      currentClRear: Math.round(clRear * 1000) / 1000,
      currentTotalDownforceN: Math.round(totalDownforceN),
      currentTotalDragN: Math.round(dragForceN),
      centerOfPressureFrontPct: Math.round(cpFrontPct * 10) / 10,
      aeroEfficiencyLOverD: Math.round(lOverD * 100) / 100,
    };
  }
}

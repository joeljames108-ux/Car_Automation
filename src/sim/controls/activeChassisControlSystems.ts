// ============================================================================
// PHASE 21 — ACTIVE CHASSIS CONTROLS & ELECTRONIC STABILITY PROGRAM (ESP/ABS/TCS)
// ============================================================================
// Real-time closed-loop chassis control algorithms: 4-Channel ABS,
// Traction Control engine de-rating, and ESP differential yaw-moment braking.
// ============================================================================

export interface ChassisControlInputs {
  vehicleSpeedKmh: number;
  steeringWheelAngleDeg: number;
  yawRateDegPerSec: number;
  driverThrottlePct: number;
  driverBrakePressureBar: number;
  wheelSlipRatios: { fl: number; fr: number; rl: number; rr: number };
  wheelSpeedsKmh: { fl: number; fr: number; rl: number; rr: number };
}

export interface ChassisControlOutputs {
  absActive: boolean;
  tcsActive: boolean;
  espActive: boolean;
  torqueReductionPct: number; // 0 to 100%
  commandedBrakePressureBar: { fl: number; fr: number; rl: number; rr: number };
  torqueVectoringDeltaNm: number; // Left/Right torque split differential
  yawErrorDegPerSec: number;
}

export class ActiveChassisControlSystems {
  /**
   * Evaluates active chassis control state machines for ABS, TCS, and ESP.
   */
  public static evaluateControlTick(inputs: ChassisControlInputs): ChassisControlOutputs {
    const vMs = (inputs.vehicleSpeedKmh * 1000) / 3600;
    const wheelbaseM = 2.82;
    const understeerGradient = 0.0025; // rad/(m/s^2)

    // ── 1. 4-CHANNEL ABS (Anti-Lock Braking System) ──
    const targetMinSlip = 0.08;
    const targetMaxSlip = 0.16;

    let absActive = false;
    const commandedBrake = {
      fl: inputs.driverBrakePressureBar,
      fr: inputs.driverBrakePressureBar,
      rl: inputs.driverBrakePressureBar * 0.75, // Standard rear brake proportioning
      rr: inputs.driverBrakePressureBar * 0.75,
    };

    const wheels: (keyof typeof commandedBrake)[] = ['fl', 'fr', 'rl', 'rr'];
    for (const w of wheels) {
      const slip = inputs.wheelSlipRatios[w];
      if (slip > targetMaxSlip && inputs.driverBrakePressureBar > 10.0) {
        // High wheel lockup risk -> Dump brake pressure
        commandedBrake[w] = inputs.driverBrakePressureBar * 0.35;
        absActive = true;
      } else if (slip > targetMinSlip) {
        // Near peak grip -> Hold pressure
        commandedBrake[w] = inputs.driverBrakePressureBar * 0.85;
      }
    }

    // ── 2. TRACTION CONTROL SYSTEM (TCS) ──
    let tcsActive = false;
    let torqueReductionPct = 0.0;
    const maxDrivenSlip = Math.max(inputs.wheelSlipRatios.rl, inputs.wheelSlipRatios.rr);

    if (maxDrivenSlip > 0.14 && inputs.driverThrottlePct > 15) {
      tcsActive = true;
      torqueReductionPct = Math.min(85.0, (maxDrivenSlip - 0.14) * 350.0);
    }

    // ── 3. ELECTRONIC STABILITY PROGRAM (ESP / YAW STABILITY CONTROL) ──
    // Desired linear bicycle model yaw rate: r_des = (V / (L + K_us * V^2)) * delta
    const deltaRoadRad = ((inputs.steeringWheelAngleDeg / 14.5) * Math.PI) / 180; // 14.5:1 steering ratio
    const desiredYawRateRad = (vMs / (wheelbaseM + understeerGradient * vMs * vMs)) * deltaRoadRad;
    const desiredYawRateDegPerSec = (desiredYawRateRad * 180) / Math.PI;

    const yawError = inputs.yawRateDegPerSec - desiredYawRateDegPerSec;
    let espActive = false;
    let torqueVectoringDeltaNm = 0.0;

    const espThresholdDegPerSec = 2.5;
    if (Math.abs(yawError) > espThresholdDegPerSec && inputs.vehicleSpeedKmh > 35) {
      espActive = true;
      if (yawError > 0) {
        // Oversteer (Vehicle yawing faster than steering input) -> Brake outside front wheel
        commandedBrake.fr = Math.max(commandedBrake.fr, 45.0);
        torqueReductionPct = Math.max(torqueReductionPct, 40.0);
      } else {
        // Understeer (Vehicle pushing straight) -> Brake inside rear wheel
        commandedBrake.rl = Math.max(commandedBrake.rl, 35.0);
        torqueReductionPct = Math.max(torqueReductionPct, 25.0);
      }
    }

    // ── 4. ACTIVE TORQUE VECTORING (ATV) ──
    if (Math.abs(deltaRoadRad) > 0.02 && inputs.driverThrottlePct > 20) {
      // Overdrive outside rear wheel to assist turn-in
      const atvGain = 450.0; // Nm per rad of steering
      torqueVectoringDeltaNm = deltaRoadRad * atvGain;
    }

    return {
      absActive,
      tcsActive,
      espActive,
      torqueReductionPct: Math.round(torqueReductionPct * 10) / 10,
      commandedBrakePressureBar: {
        fl: Math.round(commandedBrake.fl * 10) / 10,
        fr: Math.round(commandedBrake.fr * 10) / 10,
        rl: Math.round(commandedBrake.rl * 10) / 10,
        rr: Math.round(commandedBrake.rr * 10) / 10,
      },
      torqueVectoringDeltaNm: Math.round(torqueVectoringDeltaNm),
      yawErrorDegPerSec: Math.round(yawError * 10) / 10,
    };
  }
}

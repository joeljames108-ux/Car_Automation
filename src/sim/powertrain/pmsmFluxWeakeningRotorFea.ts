// ============================================================================
// PHASE 54 — PMSM FLUX WEAKENING & HIGH-SPEED ROTOR STRESS FEA
// ============================================================================
// Interior Permanent Magnet Synchronous Motor (IPMSM) d-q vector controller.
// MTPA (Maximum Torque Per Ampere) & MTPV (Maximum Torque Per Voltage) trajectories,
// voltage ellipse flux-weakening to 22,000 RPM, rotor carbon fiber sleeve hoop stress FEA,
// and Neodymium N52SH magnet demagnetization safety factor analysis.
// ============================================================================

export interface DqCurrentTrajectoryPoint {
  rotorSpeedRpm: number;
  idCurrentAmps: number;
  iqCurrentAmps: number;
  terminalVoltageVolts: number;
  electromagneticTorqueNm: number;
  powerOutputKw: number;
  voltageLimitUtilizationPct: number;
}

export interface RotorMechanicalStressFea {
  rotorSpeedRpm: number;
  centrifugalRotorBridgeStressMpa: number;
  carbonFiberSleeveHoopStressMpa: number;
  yieldStrengthSiliconSteelMpa: number;
  yieldStrengthCfSleeveMpa: number;
  rotorMechanicalSafetyFactor: number;
  isRotorStructurallySafe: boolean;
}

export interface PmsmFluxWeakeningRotorState {
  rotorSpeedRpm: number;
  isFluxWeakeningActive: boolean;
  dAxisCurrentAmps: number;
  idCurrentAmps: number; // Backward compatibility alias
  qAxisCurrentAmps: number;
  iqCurrentAmps: number; // Backward compatibility alias
  statorCurrentRmsAmps: number;
  magnetFluxLinkageWb: number;
  electromagneticTorqueNm: number;
  shaftPowerOutputKw: number;
  powerKw: number; // Backward compatibility alias
  backEmfVoltageVolts: number;
  terminalVoltageVolts: number;
  powerFactor: number;
  motorEfficiencyPct: number;
  magnetDemagnetizationSafetyFactor: number;
  carbonSleeveSafetyFactor: number; // Backward compatibility alias
  rotorMaxHoopStressMpa: number; // Backward compatibility alias
  rotorFea: RotorMechanicalStressFea;
  trajectory: DqCurrentTrajectoryPoint[];
}

export class PmsmFluxWeakeningRotorFea {
  // 180 kW High-Speed Traction Motor Parameters
  private static readonly POLE_PAIRS = 4;
  private static readonly PM_FLUX_WB = 0.082; // 82 mWb NdFeB N52SH
  private static readonly L_D_HENRY = 0.00018; // 180 uH d-axis inductance
  private static readonly L_Q_HENRY = 0.00042; // 420 uH q-axis inductance (Saliency ratio Lq/Ld = 2.33)
  private static readonly STATOR_RESISTANCE_OHM = 0.014;
  private static readonly MAX_STATOR_CURRENT_A = 480.0;
  private static readonly MAX_DC_BUS_VOLTAGE_V = 800.0;

  /**
   * Alias for backward compatibility with existing test runners and UI decks.
   */
  public static evaluateMotorOperatingPoint(params: {
    rotorSpeedRpm: number;
    demandedTorqueNm: number;
    dcBusVoltageV?: number;
    magnetTempC?: number;
  }): PmsmFluxWeakeningRotorState {
    return this.evaluateMotorPerformance(params);
  }

  /**
   * Evaluates d-q vector current trajectory, flux-weakening, and rotor centrifugal stress.
   */
  public static evaluateMotorPerformance(params: {
    rotorSpeedRpm: number;
    demandedTorqueNm: number;
    dcBusVoltageV?: number;
    magnetTempC?: number;
  }): PmsmFluxWeakeningRotorState {
    const rpm = Math.max(0, Math.min(24000, params.rotorSpeedRpm));
    const tDem = Math.max(0, params.demandedTorqueNm);
    const vDc = params.dcBusVoltageV || this.MAX_DC_BUS_VOLTAGE_V;
    const tMagC = params.magnetTempC || 75.0;

    // Temperature derating of NdFeB remanence (-0.11% per deg C above 20C)
    const psiPm = this.PM_FLUX_WB * (1.0 - 0.0011 * Math.max(0, tMagC - 20));

    const p = this.POLE_PAIRS;
    const ld = this.L_D_HENRY;
    const lq = this.L_Q_HENRY;
    const rs = this.STATOR_RESISTANCE_OHM;
    const iMax = this.MAX_STATOR_CURRENT_A;

    // Electrical angular velocity: omega_e = omega_m * p
    const omegaM = (rpm * 2 * Math.PI) / 60;
    const omegaE = omegaM * p;

    // Maximum phase voltage available from SVPWM: V_s_max = V_dc / sqrt(3)
    const vsMax = vDc / Math.sqrt(3);

    // 1. Determine MTPA (Maximum Torque Per Ampere) below base speed
    const deltaL = lq - ld;
    let isDem = Math.min(iMax, (tDem / (1.5 * p * psiPm)) * 1.05);

    let idMtpa = 0;
    let iqMtpa = isDem;

    if (deltaL > 0 && isDem > 10) {
      const term1 = psiPm / (4 * deltaL);
      const term2 = Math.sqrt(Math.pow(psiPm, 2) / (16 * Math.pow(deltaL, 2)) + Math.pow(isDem, 2) / 2);
      idMtpa = term1 - term2;
      iqMtpa = Math.sqrt(Math.max(0, Math.pow(isDem, 2) - Math.pow(idMtpa, 2)));
    }

    // 2. Voltage limit check
    let vd = rs * idMtpa - omegaE * lq * iqMtpa;
    let vq = rs * iqMtpa + omegaE * (ld * idMtpa + psiPm);
    let vs = Math.sqrt(vd * vd + vq * vq);

    let isFluxWeakening = false;
    let finalId = idMtpa;
    let finalIq = iqMtpa;

    // 3. Flux-Weakening (MTPV) Algorithm when voltage limit is hit or high speed
    if ((vs > vsMax || rpm > 8500) && omegaE > 10) {
      isFluxWeakening = true;
      const vLimit = vsMax * 0.98; // 2% voltage margin
      const idFw = -(psiPm / ld) * (1 - vLimit / Math.max(vLimit, vs));
      finalId = Math.max(-iMax * 0.95, Math.min(-15.0, idFw));
      finalIq = Math.min(iqMtpa, Math.sqrt(Math.max(0, Math.pow(iMax, 2) - Math.pow(finalId, 2))));

      vd = rs * finalId - omegaE * lq * finalIq;
      vq = rs * finalIq + omegaE * (ld * finalId + psiPm);
      vs = Math.sqrt(vd * vd + vq * vq);
    }

    // 4. Electromagnetic Torque
    const pmTorque = psiPm * finalIq;
    const reluctanceTorque = (ld - lq) * finalId * finalIq;
    const actualTorqueNm = Math.max(0, 1.5 * p * (pmTorque + reluctanceTorque));
    const shaftPowerKw = (actualTorqueNm * omegaM) / 1000;

    // 5. Back-EMF and Power Factor
    const backEmfVolts = omegaE * psiPm;
    const pf = vs > 0 ? (vd * finalId + vq * finalIq) / (vs * Math.sqrt(Math.max(0.01, finalId * finalId + finalIq * finalIq))) : 0.92;

    // Losses & Efficiency
    const pCopperLoss = 1.5 * rs * (finalId * finalId + finalIq * finalIq);
    const pIronLoss = 0.00015 * Math.pow(omegaE, 1.85) * (finalId * finalId + finalIq * finalIq + 500);
    const totalMotorLossW = pCopperLoss + pIronLoss + 80;
    const efficiencyPct = shaftPowerKw > 0 ? ((shaftPowerKw * 1000) / (shaftPowerKw * 1000 + totalMotorLossW)) * 100 : 96.0;

    // 6. Demagnetization Safety Factor
    const maxSafeNegIdAmps = 520.0 * (1.0 - 0.002 * Math.max(0, tMagC - 20));
    const demagSafetyFactor = maxSafeNegIdAmps / Math.max(1, Math.abs(finalId));

    // 7. Rotor High-Speed Centrifugal Mechanical Stress FEA
    const rRotorM = 0.068; // 68mm rotor radius
    const rhoSteel = 7850; // kg/m^3
    const rhoCfSleeve = 1580; // kg/m^3
    const vTipMs = omegaM * rRotorM;

    // Centrifugal hoop stress
    const bridgeStressMpa = (rhoSteel * Math.pow(vTipMs, 2) * 2.85) / 1e6;
    const sleeveStressMpa = (rhoCfSleeve * Math.pow(vTipMs, 2) * 1.45) / 1e6;

    const yieldSteelMpa = 420.0;
    const yieldCfMpa = 1850.0;
    const safetyFactor = Math.min(yieldSteelMpa / Math.max(1, bridgeStressMpa), yieldCfMpa / Math.max(1, sleeveStressMpa));
    const cfSafetyFactor = yieldCfMpa / Math.max(1, sleeveStressMpa);

    // Speed sweep trajectory points for plotting
    const trajectory: DqCurrentTrajectoryPoint[] = [];
    for (let sRpm = 2000; sRpm <= 20000; sRpm += 3000) {
      const wM = (sRpm * 2 * Math.PI) / 60;
      const wE = wM * p;
      let sId = idMtpa;
      let sIq = iqMtpa;
      const rawVs = Math.sqrt(Math.pow(rs * sId - wE * lq * sIq, 2) + Math.pow(rs * sIq + wE * (ld * sId + psiPm), 2));
      if (rawVs > vsMax) {
        sId = -(psiPm / ld) * (1 - vsMax / rawVs);
        sIq = Math.sqrt(Math.max(0, Math.pow(iMax, 2) - Math.pow(sId, 2)));
      }
      const sT = Math.max(0, 1.5 * p * (psiPm * sIq + (ld - lq) * sId * sIq));
      trajectory.push({
        rotorSpeedRpm: sRpm,
        idCurrentAmps: Math.round(sId * 10) / 10,
        iqCurrentAmps: Math.round(sIq * 10) / 10,
        terminalVoltageVolts: Math.round(Math.min(vsMax, rawVs) * 10) / 10,
        electromagneticTorqueNm: Math.round(sT * 10) / 10,
        powerOutputKw: Math.round(((sT * wM) / 1000) * 10) / 10,
        voltageLimitUtilizationPct: Math.round((Math.min(vsMax, rawVs) / vsMax) * 1000) / 10,
      });
    }

    return {
      rotorSpeedRpm: rpm,
      isFluxWeakeningActive: isFluxWeakening,
      dAxisCurrentAmps: Math.round(finalId * 10) / 10,
      idCurrentAmps: Math.round(finalId * 10) / 10,
      qAxisCurrentAmps: Math.round(finalIq * 10) / 10,
      iqCurrentAmps: Math.round(finalIq * 10) / 10,
      statorCurrentRmsAmps: Math.round(Math.sqrt((finalId * finalId + finalIq * finalIq) / 2) * 10) / 10,
      magnetFluxLinkageWb: Math.round(psiPm * 1000) / 1000,
      electromagneticTorqueNm: Math.round(actualTorqueNm * 10) / 10,
      shaftPowerOutputKw: Math.round(shaftPowerKw * 10) / 10,
      powerKw: Math.round(shaftPowerKw * 10) / 10,
      backEmfVoltageVolts: Math.round(backEmfVolts * 10) / 10,
      terminalVoltageVolts: Math.round(vs * 10) / 10,
      powerFactor: Math.round(Math.abs(pf) * 100) / 100,
      motorEfficiencyPct: Math.round(efficiencyPct * 10) / 10,
      magnetDemagnetizationSafetyFactor: Math.round(demagSafetyFactor * 100) / 100,
      carbonSleeveSafetyFactor: Math.round(cfSafetyFactor * 100) / 100,
      rotorMaxHoopStressMpa: Math.round(sleeveStressMpa * 10) / 10,
      rotorFea: {
        rotorSpeedRpm: rpm,
        centrifugalRotorBridgeStressMpa: Math.round(bridgeStressMpa * 10) / 10,
        carbonFiberSleeveHoopStressMpa: Math.round(sleeveStressMpa * 10) / 10,
        yieldStrengthSiliconSteelMpa: yieldSteelMpa,
        yieldStrengthCfSleeveMpa: yieldCfMpa,
        rotorMechanicalSafetyFactor: Math.round(safetyFactor * 100) / 100,
        isRotorStructurallySafe: safetyFactor > 1.35,
      },
      trajectory,
    };
  }
}

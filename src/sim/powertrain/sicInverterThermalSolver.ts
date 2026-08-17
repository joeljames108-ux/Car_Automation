// ============================================================================
// PHASE 50 — 800V SILICON CARBIDE (SiC) INVERTER & JUNCTION THERMAL SOLVER
// ============================================================================
// 1200V / 600A SiC MOSFET power module multi-physics solver.
// High-frequency switching loss kinetics (f_sw = 10 - 40 kHz), R_DS(on)(T_j) temperature
// dependency, body diode dead-time conduction, 4-stage Foster thermal impedance RC network,
// Space Vector PWM (SVPWM) modulation, and thermal derating protection.
// ============================================================================

export type InverterCoolingMode = 'DIRECT_PIN_FIN_WATER_GLYCOL' | 'DIELECTRIC_IMMERSION' | 'PHASE_CHANGE_COLD_PLATE';

export interface FosterThermalStage {
  stageIndex: number;
  resistanceKPerW: number;
  capacitanceJoulesPerK: number;
  timeConstantSec: number;
}

export interface SicLossBreakdown {
  conductionLossMosfetWatts: number;
  turnOnSwitchingLossWatts: number;
  turnOffSwitchingLossWatts: number;
  diodeConductionLossWatts: number;
  diodeReverseRecoveryLossWatts: number;
  gateDriveLossWatts: number;
  totalPhaseLossWatts: number;
  totalThreePhaseLossWatts: number;
}

export interface SicInverterThermalState {
  dcBusVoltageVolts: number;
  phaseCurrentRmsAmps: number;
  switchingFrequencyKhz: number;
  modulationIndex: number;
  losses: SicLossBreakdown;
  inverterEfficiencyPct: number;
  inverterElectricalEfficiencyPct: number; // Backward compatibility alias
  mosfetRdsOnMohm: number;
  junctionTempC: number;
  mosfetJunctionTempC: number; // Backward compatibility alias
  caseTempC: number;
  heatsinkTempC: number;
  coolantOutletTempC: number;
  totalInverterLossWatts: number; // Backward compatibility alias
  conductionLossWatts: number;    // Backward compatibility alias
  switchingLossWatts: number;     // Backward compatibility alias
  thermalDeratingFactorPct: number;
  isThermalLimitExceeded: boolean;
  fosterStages: FosterThermalStage[];
}

export class SicInverterThermalSolver {
  private static readonly V_REF = 800.0;
  private static readonly I_REF = 450.0;
  private static readonly TJ_MAX_C = 175.0; // High-temp SiC rated to 175°C (vs 150°C for Si IGBT)
  private static readonly E_ON_REF_MJ = 4.2;  // 4.2 mJ turn-on at 800V/450A
  private static readonly E_OFF_REF_MJ = 2.8; // 2.8 mJ turn-off at 800V/450A
  private static readonly Q_RR_REF_UC = 1.1;  // Low reverse recovery charge

  /**
   * Alias for backward compatibility with existing tests and UI components.
   */
  public static evaluateSicInverterPerformance(params: {
    switchingFreqKhz?: number;
    dcBusVolts?: number;
    phaseCurrentRmsAmps?: number;
    inverterOutputPowerKw?: number;
    coolantInletTempC?: number;
    coolantFlowRateLpm?: number;
  }): SicInverterThermalState {
    return this.evaluateSicInverter({
      dcBusVoltageV: params.dcBusVolts ?? 800,
      phaseCurrentRmsA: params.phaseCurrentRmsAmps ?? 350,
      switchingFrequencyKhz: params.switchingFreqKhz ?? 20,
      coolantInletTempC: params.coolantInletTempC ?? 45,
      coolantFlowRateLpm: params.coolantFlowRateLpm ?? 12,
    });
  }

  /**
   * Evaluates high-fidelity electrical losses, junction-to-ambient thermal impedance, and efficiency.
   */
  public static evaluateSicInverter(params: {
    dcBusVoltageV: number;
    phaseCurrentRmsA: number;
    switchingFrequencyKhz?: number;
    coolantInletTempC?: number;
    coolantFlowRateLpm?: number;
    powerFactor?: number;
    modulationIndex?: number;
    deadTimeNs?: number;
    coolingMode?: InverterCoolingMode;
  }): SicInverterThermalState {
    const vDc = Math.max(200, Math.min(1000, params.dcBusVoltageV));
    const iRms = Math.max(0, params.phaseCurrentRmsA);
    const fSwKhz = params.switchingFrequencyKhz ?? 20.0;
    const fSwHz = fSwKhz * 1000;
    const tCoolantInC = params.coolantInletTempC ?? 45.0;
    const flowLpm = params.coolantFlowRateLpm ?? 12.0;
    const pf = params.powerFactor ?? 0.88;
    const mIndex = Math.min(1.15, Math.max(0.05, params.modulationIndex ?? 0.92));
    const tDeadNs = params.deadTimeNs ?? 250;
    const cooling = params.coolingMode ?? 'DIRECT_PIN_FIN_WATER_GLYCOL';

    const iPeak = iRms * Math.SQRT2;

    // 1. Temperature-dependent R_DS(on)
    let tjEst = tCoolantInC + 25.0;
    const rdsOn25Mohm = 1.85;
    const rdsOnMohm = rdsOn25Mohm * Math.pow((tjEst + 273.15) / 298.15, 1.85);
    const rdsOnOhm = rdsOnMohm / 1000;

    // 2. Conduction Losses
    const dMosfet = 0.125 + (mIndex * pf) / (3 * Math.PI);
    const pCondMosfet = 2.0 * Math.pow(iRms, 2) * rdsOnOhm * dMosfet;

    // 3. Switching Losses
    const vScale = vDc / this.V_REF;
    const iScale = iPeak / this.I_REF;
    const eOnJ = (this.E_ON_REF_MJ * 1e-3) * Math.pow(vScale, 1.35) * Math.pow(iScale, 1.05);
    const eOffJ = (this.E_OFF_REF_MJ * 1e-3) * Math.pow(vScale, 1.25) * Math.pow(iScale, 1.0);

    const pSwOnWatts = eOnJ * fSwHz * 2;
    const pSwOffWatts = eOffJ * fSwHz * 2;

    // 4. Dead-Time Body Diode
    const vfDiode = 2.8 + 0.0015 * iPeak;
    const pDiodeCondWatts = 2 * (tDeadNs * 1e-9 * fSwHz) * vfDiode * (iPeak / Math.PI);
    const qrr = (this.Q_RR_REF_UC * 1e-6) * Math.pow(iScale, 0.6);
    const pDiodeQrrWatts = 0.25 * qrr * vDc * fSwHz * 2;

    const qGateNc = 450;
    const vGateV = 20.0;
    const pGateWatts = qGateNc * 1e-9 * vGateV * fSwHz * 2;

    const totalSinglePhaseLossW =
      pCondMosfet + pSwOnWatts + pSwOffWatts + pDiodeCondWatts + pDiodeQrrWatts + pGateWatts;
    const totalInverterLossW = totalSinglePhaseLossW * 3;

    // 5. Foster 4-Stage Thermal Resistance Network
    const fosterStages: FosterThermalStage[] = [
      { stageIndex: 1, resistanceKPerW: 0.012, capacitanceJoulesPerK: 1.8, timeConstantSec: 0.021 },
      { stageIndex: 2, resistanceKPerW: 0.022, capacitanceJoulesPerK: 8.5, timeConstantSec: 0.187 },
      { stageIndex: 3, resistanceKPerW: 0.018, capacitanceJoulesPerK: 45.0, timeConstantSec: 0.81 },
      { stageIndex: 4, resistanceKPerW: 0.038, capacitanceJoulesPerK: 320.0, timeConstantSec: 12.16 },
    ];

    const flowScale = Math.pow(12.0 / Math.max(2.0, flowLpm), 0.45);
    const rThJunctionToCase = fosterStages[0].resistanceKPerW + fosterStages[1].resistanceKPerW;
    const rThCaseToSink = fosterStages[2].resistanceKPerW;
    const rThSinkToCoolant = fosterStages[3].resistanceKPerW * flowScale;
    const rThTotalKPerW = rThJunctionToCase + rThCaseToSink + rThSinkToCoolant;

    const deltaTJunctionToCoolant = totalSinglePhaseLossW * rThTotalKPerW;
    const tJunctionC = tCoolantInC + deltaTJunctionToCoolant;
    const tCaseC = tJunctionC - totalSinglePhaseLossW * rThJunctionToCase;
    const tSinkC = tCaseC - totalSinglePhaseLossW * rThCaseToSink;

    const cpWaterGlycol = 3500;
    const massFlowKgSec = (flowLpm / 60) * 1.05;
    const deltaTCoolant = totalInverterLossW / (massFlowKgSec * cpWaterGlycol);
    const tCoolantOutC = tCoolantInC + deltaTCoolant;

    // 6. Efficiency
    const pOutElectWatts = Math.sqrt(3) * (vDc / Math.SQRT2 * mIndex) * iRms * pf;
    const efficiencyPct = pOutElectWatts > 0 ? (pOutElectWatts / (pOutElectWatts + totalInverterLossW)) * 100 : 98.5;

    let deratingFactor = 100.0;
    if (tJunctionC > 155.0) {
      deratingFactor = Math.max(20.0, 100.0 - (tJunctionC - 155.0) * 4.0);
    }

    return {
      dcBusVoltageVolts: vDc,
      phaseCurrentRmsAmps: iRms,
      switchingFrequencyKhz: fSwKhz,
      modulationIndex: Math.round(mIndex * 100) / 100,
      losses: {
        conductionLossMosfetWatts: Math.round(pCondMosfet * 10) / 10,
        turnOnSwitchingLossWatts: Math.round(pSwOnWatts * 10) / 10,
        turnOffSwitchingLossWatts: Math.round(pSwOffWatts * 10) / 10,
        diodeConductionLossWatts: Math.round(pDiodeCondWatts * 10) / 10,
        diodeReverseRecoveryLossWatts: Math.round(pDiodeQrrWatts * 10) / 10,
        gateDriveLossWatts: Math.round(pGateWatts * 10) / 10,
        totalPhaseLossWatts: Math.round(totalSinglePhaseLossW * 10) / 10,
        totalThreePhaseLossWatts: Math.round(totalInverterLossW * 10) / 10,
      },
      inverterEfficiencyPct: Math.round(efficiencyPct * 100) / 100,
      inverterElectricalEfficiencyPct: Math.round(efficiencyPct * 100) / 100,
      mosfetRdsOnMohm: Math.round(rdsOnMohm * 100) / 100,
      junctionTempC: Math.round(tJunctionC * 10) / 10,
      mosfetJunctionTempC: Math.round(tJunctionC * 10) / 10,
      caseTempC: Math.round(tCaseC * 10) / 10,
      heatsinkTempC: Math.round(tSinkC * 10) / 10,
      coolantOutletTempC: Math.round(tCoolantOutC * 10) / 10,
      totalInverterLossWatts: Math.round(totalInverterLossW),
      conductionLossWatts: Math.round(pCondMosfet * 6),
      switchingLossWatts: Math.round((pSwOnWatts + pSwOffWatts) * 6),
      thermalDeratingFactorPct: Math.round(deratingFactor * 10) / 10,
      isThermalLimitExceeded: tJunctionC >= this.TJ_MAX_C,
      fosterStages,
    };
  }
}

// ============================================================================
// PHASE 80 — ELECTROMAGNETIC COMPATIBILITY (EMC) & HIGH-VOLTAGE
//            INTERLOCK LOOP (HVIL) SAFETY SOLVER
// ============================================================================
// Models conducted/radiated emissions from SiC inverter PWM switching noise,
// high-voltage interlock loop continuity verification (ISO 6469-3),
// isolation resistance monitoring per IEC 61851 / UN R100, and ground fault
// detection with rapid HV bus discharge (<5s to <60V DC safety threshold).
//
// Reference physics & standards:
//   - EMI spectral envelope: P_emi(f) = k * (dV/dt)^2 * C_parasitic * f^(-n)
//   - CISPR 25 Class 5 limits (narrowband/broadband conducted/radiated)
//   - Isolation resistance: R_iso = V_bus / I_leakage >= 100 Ω/V (DC)
//   - HVIL loop: continuity pilot current 10 mA, detection < 100 ms
//   - Active discharge: τ = R_discharge * C_bus, V(t) = V0 * exp(-t/τ)
// ============================================================================

// ─── EMI Spectral Analysis Point ────────────────────────────────────────────
export interface EmiSpectralPoint {
  frequencyMhz: number;
  conductedEmissionDbuvM: number;
  radiatedEmissionDbuvM: number;
  cispr25ClassLimit: number;
  isCompliant: boolean;
  dominantSourceComponent: string;
}

// ─── EMI Filter Design State ────────────────────────────────────────────────
export interface EmiFilterDesign {
  filterTopology: 'PI_LC' | 'COMMON_MODE_CHOKE' | 'DIFFERENTIAL_MODE_LC';
  commonModeInductanceUh: number;
  differentialModeInductanceUh: number;
  xCapacitorNf: number;
  yCapacitorNf: number;
  insertionLossDb: number;
  resonantFrequencyMhz: number;
  attenuationAt150KhzDb: number;
  attenuationAt30MhzDb: number;
}

// ─── HVIL Loop State ────────────────────────────────────────────────────────
export interface HvilLoopState {
  pilotCurrentMa: number;
  loopResistanceOhms: number;
  isContinuityConfirmed: boolean;
  detectionTimeMs: number;
  connectorCount: number;
  failedConnectorIndex: number | null;
  interlockedComponents: string[];
  safetyState: 'CLOSED_SAFE' | 'OPEN_FAULT' | 'DEGRADED';
}

// ─── Isolation Monitoring State ─────────────────────────────────────────────
export interface IsolationMonitoringState {
  busVoltageV: number;
  positiveToChassisResistanceMohm: number;
  negativeToChassisResistanceMohm: number;
  minimumIsolationResistanceMohm: number;
  isolationResistancePerVolt: number; // Ω/V — must be >= 100 for DC, >= 500 for AC
  isIsolationSafe: boolean;
  groundFaultDetected: boolean;
  leakageCurrentMa: number;
  measurementMethodology: 'ACTIVE_INJECTION' | 'PASSIVE_MONITORING';
}

// ─── Active Discharge State ─────────────────────────────────────────────────
export interface ActiveDischargeState {
  initialBusVoltageV: number;
  busCapacitanceUf: number;
  dischargeResistanceOhms: number;
  timeConstantMs: number;
  timeToSafeVoltageMs: number; // Time to reach < 60V DC
  safeVoltageThresholdV: number;
  residualVoltageAfter5sV: number;
  dischargeEnergyJoules: number;
  isSafeWithin5s: boolean;
  dischargeProfile: { timeMs: number; voltageV: number; currentA: number; powerW: number }[];
}

// ─── Master EMC & HVIL System State ─────────────────────────────────────────
export interface EmcHvilSystemState {
  emiSpectrum: EmiSpectralPoint[];
  emiFilterDesign: EmiFilterDesign;
  hvilLoop: HvilLoopState;
  isolationMonitoring: IsolationMonitoringState;
  activeDischarge: ActiveDischargeState;
  overallEmcCompliance: boolean;
  overallSafetyCompliance: boolean;
  applicableStandards: string[];
}

// ─── Input Parameters ───────────────────────────────────────────────────────
export interface EmcHvilSolverParams {
  busVoltageV?: number;
  busCapacitanceUf?: number;
  switchingFrequencyKhz?: number;
  dvDtRateVPerUs?: number;
  hvilConnectorCount?: number;
  simulateFault?: boolean;
  faultType?: 'HVIL_OPEN' | 'ISOLATION_DEGRADED' | 'GROUND_FAULT' | 'NONE';
}

// ============================================================================
// SOLVER CLASS
// ============================================================================
export class EmcHvilSafetySolver {

  // ── Physical Constants ──────────────────────────────────────────────────
  private static readonly SAFE_VOLTAGE_THRESHOLD_V = 60; // UN R100 DC safety
  private static readonly MIN_ISOLATION_OHM_PER_V_DC = 100; // ISO 6469-3
  private static readonly MIN_ISOLATION_OHM_PER_V_AC = 500; // IEC 61851
  private static readonly HVIL_PILOT_CURRENT_MA = 10; // 10 mA diagnostic current
  private static readonly HVIL_MAX_DETECTION_TIME_MS = 100;

  // ── CISPR 25 Class 5 Limits (simplified at key frequencies) ───────────
  private static readonly CISPR25_LIMITS: { freqMhz: number; limitDbuvM: number }[] = [
    { freqMhz: 0.15, limitDbuvM: 79 },
    { freqMhz: 0.5, limitDbuvM: 66 },
    { freqMhz: 1.0, limitDbuvM: 56 },
    { freqMhz: 5.0, limitDbuvM: 46 },
    { freqMhz: 10.0, limitDbuvM: 40 },
    { freqMhz: 30.0, limitDbuvM: 34 },
    { freqMhz: 100.0, limitDbuvM: 32 },
    { freqMhz: 300.0, limitDbuvM: 30 },
    { freqMhz: 1000.0, limitDbuvM: 28 },
  ];

  // ── Parasitic Capacitances (typical SiC MOSFET module) ────────────────
  private static readonly PARASITIC_DRAIN_SOURCE_PF = 85;
  private static readonly PARASITIC_GATE_DRAIN_PF = 12;
  private static readonly CABLE_PARASITIC_PF_PER_M = 110;
  private static readonly CABLE_LENGTH_M = 4.5; // HV cable harness length

  /**
   * Solves the complete EMC emissions profile and HVIL safety chain.
   */
  public static solveEmcHvilSystem(params: EmcHvilSolverParams = {}): EmcHvilSystemState {
    const V_bus = params.busVoltageV ?? 800;
    const C_bus = params.busCapacitanceUf ?? 2200; // 2200 µF DC-link
    const f_sw = params.switchingFrequencyKhz ?? 24; // 24 kHz SiC switching
    const dvdt = params.dvDtRateVPerUs ?? 35; // 35 V/µs SiC slew rate
    const connectorCount = params.hvilConnectorCount ?? 12;
    const simulateFault = params.simulateFault ?? false;
    const faultType = params.faultType ?? 'NONE';

    // ──────────────────────────────────────────────────────────────────
    // 1. EMI SPECTRAL ANALYSIS
    // ──────────────────────────────────────────────────────────────────
    const emiSpectrum = this.computeEmiSpectrum(V_bus, f_sw, dvdt);

    // ──────────────────────────────────────────────────────────────────
    // 2. EMI FILTER DESIGN
    // ──────────────────────────────────────────────────────────────────
    const emiFilter = this.designEmiFilter(f_sw, dvdt);

    // ──────────────────────────────────────────────────────────────────
    // 3. HVIL LOOP CONTINUITY VERIFICATION
    // ──────────────────────────────────────────────────────────────────
    const hvilLoop = this.verifyHvilLoop(connectorCount, simulateFault, faultType);

    // ──────────────────────────────────────────────────────────────────
    // 4. ISOLATION RESISTANCE MONITORING
    // ──────────────────────────────────────────────────────────────────
    const isolation = this.monitorIsolation(V_bus, simulateFault, faultType);

    // ──────────────────────────────────────────────────────────────────
    // 5. ACTIVE DISCHARGE SYSTEM
    // ──────────────────────────────────────────────────────────────────
    const discharge = this.computeActiveDischarge(V_bus, C_bus);

    // ──────────────────────────────────────────────────────────────────
    // 6. OVERALL COMPLIANCE ASSESSMENT
    // ──────────────────────────────────────────────────────────────────
    const emcCompliant = emiSpectrum.every(p => p.isCompliant);
    const safetyCompliant =
      hvilLoop.isContinuityConfirmed &&
      isolation.isIsolationSafe &&
      discharge.isSafeWithin5s;

    return {
      emiSpectrum,
      emiFilterDesign: emiFilter,
      hvilLoop,
      isolationMonitoring: isolation,
      activeDischarge: discharge,
      overallEmcCompliance: emcCompliant,
      overallSafetyCompliance: safetyCompliant,
      applicableStandards: [
        'CISPR 25 Class 5 (Conducted & Radiated Emissions)',
        'ISO 11452 (Vehicle EMC Immunity)',
        'ISO 6469-3 (EV Safety – Electrical Protection)',
        'UN ECE R100 (EV High-Voltage Safety)',
        'IEC 61851 (EV Conductive Charging – Isolation)',
        'SAE J1772 (EV Charging Interoperability)',
        'ISO 7637-2 (Vehicle Transient Disturbances)',
      ],
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Compute EMI spectral envelope
  // ────────────────────────────────────────────────────────────────────────
  private static computeEmiSpectrum(
    V_bus: number,
    f_sw_khz: number,
    dvdt_v_per_us: number
  ): EmiSpectralPoint[] {
    const spectrum: EmiSpectralPoint[] = [];
    const C_parasitic = this.PARASITIC_DRAIN_SOURCE_PF +
      this.CABLE_PARASITIC_PF_PER_M * this.CABLE_LENGTH_M;

    // EMI envelope: fundamental + harmonics of switching frequency
    for (const limitPoint of this.CISPR25_LIMITS) {
      const f = limitPoint.freqMhz;
      const f_hz = f * 1e6;
      const f_sw_hz = f_sw_khz * 1e3;

      // Spectral energy density from trapezoidal PWM switching
      // P_emi ∝ (dV/dt)^2 * C_parasitic * sin(πf τ_rise) / (πf τ_rise)
      const tau_rise_s = V_bus / (dvdt_v_per_us * 1e6); // Rise time in seconds
      const sinc_arg = Math.PI * f_hz * tau_rise_s;
      const sinc_val = sinc_arg > 0.001 ? Math.sin(sinc_arg) / sinc_arg : 1.0;

      // Conducted emission (dBµV/m)
      const baseConducted = 20 * Math.log10(
        dvdt_v_per_us * C_parasitic * 1e-12 * Math.abs(sinc_val) * 1e6 + 1
      );
      const conductedLevel = Math.max(10, baseConducted + 40 - 14 * Math.log10(f + 0.1));

      // Radiated emission (cable acts as antenna above 30 MHz)
      const antennaFactor = f > 30 ? 1.5 : 0.6;
      const radiatedLevel = conductedLevel * antennaFactor - 8;

      // Determine dominant noise source at this frequency
      let source = 'SiC MOSFET Switching';
      if (f < 0.5) source = 'DC-DC Converter Ripple';
      else if (f > 100) source = 'Gate Driver Ringing';
      else if (f > 30) source = 'HV Cable Radiation';

      spectrum.push({
        frequencyMhz: f,
        conductedEmissionDbuvM: Math.round(conductedLevel * 10) / 10,
        radiatedEmissionDbuvM: Math.round(radiatedLevel * 10) / 10,
        cispr25ClassLimit: limitPoint.limitDbuvM,
        isCompliant: conductedLevel <= limitPoint.limitDbuvM && radiatedLevel <= limitPoint.limitDbuvM,
        dominantSourceComponent: source,
      });
    }

    return spectrum;
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Design EMI filter
  // ────────────────────────────────────────────────────────────────────────
  private static designEmiFilter(f_sw_khz: number, dvdt: number): EmiFilterDesign {
    // Common-mode choke: sized for 150 kHz → 30 MHz suppression
    const cmInductance = 4.7 + dvdt * 0.15; // µH — higher dV/dt needs more inductance
    const dmInductance = 2.2 + dvdt * 0.08;

    // X-capacitor (differential mode): C_x = 1 / (4π² f_sw² L_dm)
    const f_sw_hz = f_sw_khz * 1e3;
    const cX = 1e9 / (4 * Math.PI * Math.PI * f_sw_hz * f_sw_hz * dmInductance * 1e-6); // nF
    const cX_clamped = Math.max(100, Math.min(4700, cX));

    // Y-capacitor (common mode to chassis): typically 4.7-10 nF (limited by leakage)
    const cY = 4.7;

    // Resonant frequency of LC filter
    const f_res = 1 / (2 * Math.PI * Math.sqrt(dmInductance * 1e-6 * cX_clamped * 1e-9));
    const f_res_mhz = f_res / 1e6;

    // Insertion loss at key frequencies (2nd-order rolloff: -40 dB/decade above resonance)
    const insertionLoss = 20 * Math.log10(f_sw_khz * 1000 / f_res) * 2;
    const att150khz = Math.max(0, 20 * Math.log10(150e3 / f_res) * 2);
    const att30mhz = Math.max(0, 20 * Math.log10(30e6 / f_res) * 2);

    return {
      filterTopology: 'PI_LC',
      commonModeInductanceUh: Math.round(cmInductance * 10) / 10,
      differentialModeInductanceUh: Math.round(dmInductance * 10) / 10,
      xCapacitorNf: Math.round(cX_clamped),
      yCapacitorNf: cY,
      insertionLossDb: Math.round(insertionLoss * 10) / 10,
      resonantFrequencyMhz: Math.round(f_res_mhz * 1000) / 1000,
      attenuationAt150KhzDb: Math.round(att150khz * 10) / 10,
      attenuationAt30MhzDb: Math.round(att30mhz * 10) / 10,
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Verify HVIL loop continuity
  // ────────────────────────────────────────────────────────────────────────
  private static verifyHvilLoop(
    connectorCount: number,
    simulateFault: boolean,
    faultType: string
  ): HvilLoopState {
    // HVIL: series daisy-chain of connectors with 10 mA pilot current
    // Each connector adds ~0.5 Ω contact resistance
    const contactResPerConnector = 0.5;
    const wireResistance = 2.8; // Ohms for full loop wiring

    const isHvilFault = simulateFault && faultType === 'HVIL_OPEN';
    const failedIdx = isHvilFault ? Math.floor(connectorCount / 2) : null;

    // Total loop resistance (infinite if open circuit)
    const loopResistance = isHvilFault
      ? 999999 // Open circuit
      : wireResistance + connectorCount * contactResPerConnector;

    // Pilot current (V_pilot = 5V from monitoring ECU)
    const pilotVoltage = 5.0;
    const pilotCurrent = isHvilFault ? 0 : (pilotVoltage / loopResistance) * 1000; // mA

    // Continuity confirmed if pilot current within expected range
    const expectedCurrent = (pilotVoltage / loopResistance) * 1000;
    const isContinuity = !isHvilFault && pilotCurrent > 0.5; // > 0.5 mA threshold

    // Detection time: RC time constant of measurement circuit
    const detectionTime = isHvilFault ? 12 : 45; // ms — fault detected faster

    const interlockedComponents = [
      'Battery Pack Disconnect (BPC)',
      'Front Motor Inverter',
      'Rear Motor Inverter',
      'DC-DC Converter (800V→12V)',
      'Onboard Charger (OBC)',
      'HV Junction Box',
      'A/C Compressor (HV)',
      'PTC Heater (HV)',
      'Charge Inlet CCS2/NACS',
      'HV Cable Harness (Front)',
      'HV Cable Harness (Rear)',
      'Manual Service Disconnect (MSD)',
    ];

    return {
      pilotCurrentMa: Math.round(pilotCurrent * 100) / 100,
      loopResistanceOhms: isHvilFault ? Infinity : Math.round(loopResistance * 100) / 100,
      isContinuityConfirmed: isContinuity,
      detectionTimeMs: detectionTime,
      connectorCount,
      failedConnectorIndex: failedIdx,
      interlockedComponents: interlockedComponents.slice(0, connectorCount),
      safetyState: isHvilFault ? 'OPEN_FAULT' : 'CLOSED_SAFE',
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Monitor isolation resistance
  // ────────────────────────────────────────────────────────────────────────
  private static monitorIsolation(
    V_bus: number,
    simulateFault: boolean,
    faultType: string
  ): IsolationMonitoringState {
    const isIsoFault = simulateFault && faultType === 'ISOLATION_DEGRADED';
    const isGndFault = simulateFault && faultType === 'GROUND_FAULT';

    // Healthy isolation: typically 2-10 MΩ for 800V systems
    const posToChassisBase = isGndFault ? 0.008 : isIsoFault ? 0.025 : 5.2; // MΩ
    const negToChassisBase = isGndFault ? 0.012 : isIsoFault ? 0.045 : 4.8; // MΩ

    const minIsolation = Math.min(posToChassisBase, negToChassisBase);
    const isoPerVolt = (minIsolation * 1e6) / V_bus; // Ω per Volt

    // Leakage current: I_leak = V_bus / R_iso
    const leakageCurrent = V_bus / (minIsolation * 1e6) * 1000; // mA

    return {
      busVoltageV: V_bus,
      positiveToChassisResistanceMohm: Math.round(posToChassisBase * 1000) / 1000,
      negativeToChassisResistanceMohm: Math.round(negToChassisBase * 1000) / 1000,
      minimumIsolationResistanceMohm: Math.round(minIsolation * 1000) / 1000,
      isolationResistancePerVolt: Math.round(isoPerVolt * 10) / 10,
      isIsolationSafe: isoPerVolt >= this.MIN_ISOLATION_OHM_PER_V_DC,
      groundFaultDetected: isGndFault,
      leakageCurrentMa: Math.round(leakageCurrent * 100) / 100,
      measurementMethodology: 'ACTIVE_INJECTION',
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // PRIVATE: Compute active HV bus discharge
  // ────────────────────────────────────────────────────────────────────────
  private static computeActiveDischarge(V_bus: number, C_bus_uf: number): ActiveDischargeState {
    const C_bus_f = C_bus_uf * 1e-6; // Convert µF to F

    // Discharge resistor: sized for τ such that V < 60V within 5 seconds
    // V(t) = V0 * exp(-t / (R*C))
    // 60 = V0 * exp(-5 / (R*C))
    // R*C = -5 / ln(60/V0)
    const targetTimeS = 4.5; // Margin: design for < 60V within 4.5s (not 5s)
    const lnRatio = Math.log(this.SAFE_VOLTAGE_THRESHOLD_V / V_bus);
    const requiredTau = -targetTimeS / lnRatio; // seconds
    const R_discharge = requiredTau / C_bus_f; // Ohms

    // Time constant
    const tauMs = requiredTau * 1000;

    // Time to reach safe voltage
    const timeToSafe = -requiredTau * Math.log(this.SAFE_VOLTAGE_THRESHOLD_V / V_bus) * 1000;

    // Residual voltage after exactly 5 seconds
    const V_5s = V_bus * Math.exp(-5.0 / requiredTau);

    // Total discharge energy: E = 0.5 * C * V^2
    const dischargeEnergy = 0.5 * C_bus_f * V_bus * V_bus;

    // Generate discharge profile at 100ms intervals
    const profile: { timeMs: number; voltageV: number; currentA: number; powerW: number }[] = [];
    for (let t_ms = 0; t_ms <= 6000; t_ms += 100) {
      const t_s = t_ms / 1000;
      const v = V_bus * Math.exp(-t_s / requiredTau);
      const i = v / R_discharge;
      const p = v * i;
      profile.push({
        timeMs: t_ms,
        voltageV: Math.round(v * 10) / 10,
        currentA: Math.round(i * 1000) / 1000,
        powerW: Math.round(p * 10) / 10,
      });
    }

    return {
      initialBusVoltageV: V_bus,
      busCapacitanceUf: C_bus_uf,
      dischargeResistanceOhms: Math.round(R_discharge * 10) / 10,
      timeConstantMs: Math.round(tauMs * 10) / 10,
      timeToSafeVoltageMs: Math.round(timeToSafe * 10) / 10,
      safeVoltageThresholdV: this.SAFE_VOLTAGE_THRESHOLD_V,
      residualVoltageAfter5sV: Math.round(V_5s * 10) / 10,
      dischargeEnergyJoules: Math.round(dischargeEnergy * 10) / 10,
      isSafeWithin5s: V_5s <= this.SAFE_VOLTAGE_THRESHOLD_V,
      dischargeProfile: profile,
    };
  }
}

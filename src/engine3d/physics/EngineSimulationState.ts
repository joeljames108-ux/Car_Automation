// ============================================================================
// ENGINE SIMULATION STATE — ROTATIONAL DYNAMICS & ENGINE CYCLE PHYSICS
// ============================================================================
// Solves real-time rotational dynamics:
// - dω/dt = (T_combustion - T_friction - T_load) / I_crank
// - Starter motor cranking & flare sequence
// - Hard rev-limiter fuel cut bounce & backfire ignition
// - Throttle body response & manifold vacuum (MAP)
// - Turbocharger spool lag, boost pressure, and blow-off flutter
// - Multi-speed slow motion for educational stroke observation
// ============================================================================

export type EngineOperationalState =
  | 'OFF'
  | 'CRANKING'
  | 'IDLING'
  | 'REVVING'
  | 'REV_LIMITER'
  | 'ENGINE_BRAKING'
  | 'SHUTTING_DOWN';

export interface EnginePhysicsConfig {
  idleRpm: number;
  redlineRpm: number;
  revLimiterCutRpm: number;
  revLimiterRecoveryRpm: number;
  crankInertiaKgM2: number; // Crankshaft + flywheel + rod rotational inertia
  starterTorqueNm: number;
  crankingRpmTarget: number;
  frictionCoeff: number; // N·m per rad/s
  maxPowerHp: number;
  maxTorqueNm: number;
  turboMaxBoostBar: number;
  turboSpoolTauSec: number; // Inertia time constant for spooling
  gearRatios?: number[];
  finalDriveRatio?: number;
  tireRadiusM?: number;
}

export const DEFAULT_ENGINE_PHYSICS_CONFIG: EnginePhysicsConfig = {
  idleRpm: 800,
  redlineRpm: 8500,
  revLimiterCutRpm: 8500,
  revLimiterRecoveryRpm: 8250,
  crankInertiaKgM2: 0.12, // High-revving lightweight racing flywheel
  starterTorqueNm: 85,
  crankingRpmTarget: 260,
  frictionCoeff: 0.035,
  maxPowerHp: 820,
  maxTorqueNm: 750,
  turboMaxBoostBar: 2.4,
  turboSpoolTauSec: 0.35,
  gearRatios: [3.15, 2.18, 1.62, 1.28, 1.05, 0.88, 0.74], // 7-speed sequential dog-box
  finalDriveRatio: 3.44,
  tireRadiusM: 0.33,
};

export type ShiftType = 'NONE' | 'UPSHIFT' | 'DOWNSHIFT';

export interface EngineSimulationSnapshot {
  state: EngineOperationalState;
  rpm: number;
  targetRpm: number;
  crankAngleDeg: number;       // 0 to 720 degrees for 4-stroke cycle
  crankAngleTotalRad: number;  // Continuous cumulative radians
  angularVelocityRadS: number;
  throttle: number;            // 0.0 to 1.0
  manifoldPressureBar: number; // 0.2 (high vacuum) to 3.4 (boosted)
  turboRpm: number;            // 0 to 180,000 RPM
  boostPressureBar: number;    // 0.0 to 2.4 bar gauge
  wastegateOpen: boolean;
  bovFlutterIntensity: number; // Blow-off valve pressure oscillation
  backfireIntensity: number;   // 0.0 to 1.0 exhaust pop
  engineTempC: number;
  timeScale: number;           // 1.0 = real-time, 0.1 = 10x slow motion
  currentGear: number;         // 1 to 7
  vehicleSpeedKmh: number;     // Theoretical road speed in km/h
  isShifting: boolean;
  shiftType: ShiftType;
}

export class EngineSimulationState {
  private config: EnginePhysicsConfig;
  private state: EngineOperationalState = 'OFF';
  private rpm: number = 0;
  private targetRpm: number = 0;
  private crankAngleTotalRad: number = 0;
  private throttle: number = 0; // 0 to 1
  private targetThrottle: number = 0;
  private timeScale: number = 1.0;

  // Cranking sequence timers
  private crankingElapsedSec: number = 0;
  private crankingDurationSec: number = 1.1;

  // Rev limiter state
  private isRevLimitCut: boolean = false;
  private revLimitBounceTimer: number = 0;

  // Turbocharger
  private turboRpm: number = 0;
  private boostPressureBar: number = 0;
  private wastegateOpen: boolean = false;
  private bovFlutterPhase: number = 0;
  private bovFlutterIntensity: number = 0;

  // Backfire & Overrun
  private backfireTimer: number = 0;
  private backfireIntensity: number = 0;

  // Thermal
  private engineTempC: number = 24.0;

  // 7-Speed Sequential Gearbox
  private currentGear: number = 1;
  private isShifting: boolean = false;
  private shiftType: ShiftType = 'NONE';
  private shiftTimerSec: number = 0;
  private shiftDurationSec: number = 0.085; // 85ms rapid sequential dog-ring shift
  private targetGearRpm: number = 0;
  private blipTimerSec: number = 0;

  // Listeners
  private listeners: Set<(snapshot: EngineSimulationSnapshot) => void> = new Set();

  constructor(config: Partial<EnginePhysicsConfig> = {}) {
    this.config = { ...DEFAULT_ENGINE_PHYSICS_CONFIG, ...config };
  }

  public setTimeScale(scale: number): void {
    this.timeScale = Math.max(0.05, Math.min(2.0, scale));
  }

  public getTimeScale(): number {
    return this.timeScale;
  }

  public startEngine(): void {
    if (this.state !== 'OFF' && this.state !== 'SHUTTING_DOWN') return;
    this.state = 'CRANKING';
    this.crankingElapsedSec = 0;
    this.targetThrottle = 0.05;
  }

  public stopEngine(): void {
    if (this.state === 'OFF' || this.state === 'SHUTTING_DOWN') return;
    this.state = 'SHUTTING_DOWN';
    this.targetThrottle = 0;
  }

  public toggleEngine(): void {
    if (this.state === 'OFF') {
      this.startEngine();
    } else {
      this.stopEngine();
    }
  }

  public setThrottle(val: number): void {
    this.targetThrottle = Math.max(0, Math.min(1, val));
  }

  public setTargetRpm(target: number): void {
    this.targetRpm = Math.max(0, Math.min(this.config.redlineRpm, target));
    if (this.state === 'OFF' && target > 0) {
      this.startEngine();
    }
    // Calculate required throttle based on target RPM
    const normalizedTarget = (this.targetRpm - this.config.idleRpm) / (this.config.redlineRpm - this.config.idleRpm);
    this.targetThrottle = Math.max(0, Math.min(1, Math.pow(Math.max(0, normalizedTarget), 1.2)));
  }

  public revBurst(peakRpm: number = 7200, durationSec: number = 0.6): void {
    if (this.state === 'OFF') {
      this.startEngine();
      return;
    }
    this.targetThrottle = 0.95;
    setTimeout(() => {
      this.targetThrottle = 0.0;
    }, durationSec * 1000);
  }

  public getGearRatio(gear: number): number {
    const ratios = this.config.gearRatios || [3.15, 2.18, 1.62, 1.28, 1.05, 0.88, 0.74];
    const idx = Math.max(1, Math.min(ratios.length, gear)) - 1;
    return ratios[idx] ?? 1.0;
  }

  public shiftUp(): boolean {
    const maxGear = this.config.gearRatios ? this.config.gearRatios.length : 7;
    if (this.state === 'OFF' || this.currentGear >= maxGear || this.isShifting) {
      return false;
    }
    const oldRatio = this.getGearRatio(this.currentGear);
    this.currentGear++;
    const newRatio = this.getGearRatio(this.currentGear);

    this.isShifting = true;
    this.shiftType = 'UPSHIFT';
    this.shiftTimerSec = this.shiftDurationSec;
    this.targetGearRpm = Math.max(this.config.idleRpm, this.rpm * (newRatio / oldRatio));

    // Flat-shift ignition torque cut & gunshot exhaust backfire pop
    if (this.rpm > 3500) {
      this.backfireIntensity = 1.0;
      this.backfireTimer = 0.08;
    }
    return true;
  }

  public shiftDown(): boolean {
    if (this.state === 'OFF' || this.currentGear <= 1 || this.isShifting) {
      return false;
    }
    const oldRatio = this.getGearRatio(this.currentGear);
    this.currentGear--;
    const newRatio = this.getGearRatio(this.currentGear);

    this.isShifting = true;
    this.shiftType = 'DOWNSHIFT';
    this.shiftTimerSec = this.shiftDurationSec * 1.3; // 110ms with auto-blip
    this.targetGearRpm = Math.min(this.config.redlineRpm, this.rpm * (newRatio / oldRatio));

    // Heel-and-toe auto-blip throttle pulse
    this.blipTimerSec = 0.12;
    this.throttle = Math.max(this.throttle, 0.85);

    // Overrun burble / turbo BOV flutter
    if (this.boostPressureBar > 0.5) {
      this.bovFlutterIntensity = 0.85;
    }
    return true;
  }

  public setGear(gear: number): void {
    const maxGear = this.config.gearRatios ? this.config.gearRatios.length : 7;
    const g = Math.max(1, Math.min(maxGear, gear));
    if (g > this.currentGear) {
      this.shiftUp();
    } else if (g < this.currentGear) {
      this.shiftDown();
    }
  }

  public getCurrentGear(): number {
    return this.currentGear;
  }

  public getIsShifting(): boolean {
    return this.isShifting;
  }

  public getVehicleSpeedKmh(): number {
    if (this.state === 'OFF' || this.rpm <= 0) return 0;
    const gearRatio = this.getGearRatio(this.currentGear);
    const finalDrive = this.config.finalDriveRatio || 3.44;
    const tireRadius = this.config.tireRadiusM || 0.33;
    const wheelRps = (this.rpm / (gearRatio * finalDrive)) / 60;
    const speedMs = wheelRps * 2 * Math.PI * tireRadius;
    return Math.max(0, speedMs * 3.6);
  }

  public subscribe(cb: (snapshot: EngineSimulationSnapshot) => void): () => void {
    this.listeners.add(cb);
    cb(this.getSnapshot());
    return () => this.listeners.delete(cb);
  }

  /**
   * Advances physics simulation by real deltaSeconds, scaled by timeScale.
   */
  public update(realDeltaSec: number): EngineSimulationSnapshot {
    const dt = Math.min(0.05, realDeltaSec) * this.timeScale;
    if (dt <= 0) return this.getSnapshot();

    // Auto-blip throttle handling for downshifts
    if (this.blipTimerSec > 0) {
      this.blipTimerSec -= dt;
      if (this.blipTimerSec <= 0) {
        this.throttle = this.targetThrottle;
      }
    } else {
      // Smooth throttle actuator lag (60ms physical butterfly response)
      const throttleRate = 18.0;
      this.throttle += (this.targetThrottle - this.throttle) * Math.min(1.0, throttleRate * dt);
    }

    switch (this.state) {
      case 'OFF': {
        this.rpm = 0;
        this.boostPressureBar = 0;
        this.turboRpm = 0;
        this.bovFlutterIntensity = 0;
        this.backfireIntensity = 0;
        break;
      }

      case 'CRANKING': {
        this.crankingElapsedSec += dt;
        // Starter motor accelerates engine towards cranking speed with compression pulsing
        const crankProgress = Math.min(1, this.crankingElapsedSec / this.crankingDurationSec);
        const compressionPulse = Math.sin(this.crankingElapsedSec * 32.0) * 25.0;
        this.rpm = (this.config.crankingRpmTarget * Math.pow(crankProgress, 0.8)) + compressionPulse;

        if (this.crankingElapsedSec >= this.crankingDurationSec) {
          // Ignition catch & initial flare to 1,400 RPM
          this.state = 'IDLING';
          this.rpm = 1450;
        }
        break;
      }

      case 'IDLING':
      case 'REVVING':
      case 'REV_LIMITER':
      case 'ENGINE_BRAKING': {
        // Continuous Rotational Dynamics Solver
        const omega = (this.rpm * 2 * Math.PI) / 60; // rad/s

        // Combustion torque produced
        // T_comb = T_max * (throttle + idle_air) * torque_curve_factor * (1 + boost * 0.45)
        const idleAir = 0.04;
        const effectiveThrottle = Math.max(idleAir, this.throttle);
        const rpmNorm = Math.min(1.0, this.rpm / this.config.redlineRpm);
        // Volumetric efficiency curve (peaks at 6,200 RPM)
        const ve = 0.75 + 0.45 * Math.sin(rpmNorm * Math.PI * 0.95);
        const boostFactor = 1.0 + this.boostPressureBar * 0.52;

        let combustionTorque = this.config.maxTorqueNm * effectiveThrottle * ve * boostFactor;

        // Rev Limiter Fuel / Ignition Cut Logic
        if (this.rpm >= this.config.revLimiterCutRpm) {
          this.isRevLimitCut = true;
          this.state = 'REV_LIMITER';
        } else if (this.rpm <= this.config.revLimiterRecoveryRpm) {
          this.isRevLimitCut = false;
        }

        if (this.isRevLimitCut) {
          combustionTorque = 0; // Cut spark & fuel
          this.revLimitBounceTimer += dt;
          // Intense backfire flame probability when fuel cuts at redline
          if (Math.random() < 0.35) {
            this.backfireIntensity = 1.0;
            this.backfireTimer = 0.08;
          }
        }

        // Mechanical friction & pumping losses: T_friction = c * omega + c2 * omega^2
        const frictionTorque = this.config.frictionCoeff * omega + 0.00012 * omega * omega;

        // Net Torque & Angular Acceleration
        const netTorque = combustionTorque - frictionTorque;
        const alpha = netTorque / this.config.crankInertiaKgM2; // rad/s^2

        let newOmega = Math.max(0, omega + alpha * dt);
        let newRpm = (newOmega * 60) / (2 * Math.PI);

        // Idle governor prevents stall
        if (!this.isRevLimitCut && this.throttle <= 0.05 && newRpm < this.config.idleRpm) {
          newRpm += (this.config.idleRpm - newRpm) * Math.min(1.0, 8.0 * dt);
          newOmega = (newRpm * 2 * Math.PI) / 60;
        }

        // Determine current operational state
        if (this.isRevLimitCut) {
          this.state = 'REV_LIMITER';
        } else if (this.throttle > 0.15 && newRpm > this.rpm + 50) {
          this.state = 'REVVING';
        } else if (this.throttle < 0.08 && newRpm > this.config.idleRpm + 400) {
          this.state = 'ENGINE_BRAKING';
          // Overrun burble & pop
          if (Math.random() < 0.12 && newRpm > 3000) {
            this.backfireIntensity = 0.65;
            this.backfireTimer = 0.06;
          }
        } else {
          this.state = 'IDLING';
        }

        this.rpm = newRpm;
        break;
      }

      case 'SHUTTING_DOWN': {
        // Decelerates to zero with compression chug
        this.rpm = Math.max(0, this.rpm - (1200 * dt));
        this.boostPressureBar = Math.max(0, this.boostPressureBar - 4.0 * dt);
        this.turboRpm = Math.max(0, this.turboRpm - 80000 * dt);
        if (this.rpm <= 10) {
          this.rpm = 0;
          this.state = 'OFF';
        }
        break;
      }
    }

    // Shifting RPM transition handling (simulates dog-ring gear engagement)
    if (this.isShifting) {
      this.shiftTimerSec -= dt;
      this.rpm += (this.targetGearRpm - this.rpm) * Math.min(1.0, 24.0 * dt);
      if (this.shiftTimerSec <= 0) {
        this.isShifting = false;
        this.shiftType = 'NONE';
      }
    }

    // Advance crankshaft angular position: omega = (RPM * 2 * PI / 60) rad/s
    const omega = (this.rpm * 2 * Math.PI) / 60;
    this.crankAngleTotalRad += omega * dt;

    // Turbocharger Dynamics
    this.updateTurbo(dt);

    // Backfire Timer Decay
    if (this.backfireTimer > 0) {
      this.backfireTimer -= dt;
      if (this.backfireTimer <= 0) {
        this.backfireIntensity = 0;
      }
    }

    // Engine Temperature (warms up when running, cools when off)
    if (this.state !== 'OFF') {
      const targetTemp = 92.0 + (this.rpm / this.config.redlineRpm) * 18.0;
      this.engineTempC += (targetTemp - this.engineTempC) * 0.02 * dt;
    } else {
      this.engineTempC += (24.0 - this.engineTempC) * 0.01 * dt;
    }

    const snapshot = this.getSnapshot();
    this.notify(snapshot);
    return snapshot;
  }

  private updateTurbo(dt: number): void {
    if (this.state === 'OFF' || this.state === 'CRANKING') {
      this.turboRpm = 0;
      this.boostPressureBar = 0;
      this.wastegateOpen = false;
      this.bovFlutterIntensity = 0;
      return;
    }

    // Exhaust gas enthalpy drives turbine: proportional to (RPM * Throttle)
    const exhaustEnthalpy = (this.rpm / this.config.redlineRpm) * Math.pow(Math.max(0.05, this.throttle), 0.85);
    const targetTurboRpm = exhaustEnthalpy * 165000; // max 165k RPM
    const targetBoost = exhaustEnthalpy * this.config.turboMaxBoostBar;

    // Spool lag with physical inertia time constant tau
    const spoolRate = 1.0 / this.config.turboSpoolTauSec;
    this.turboRpm += (targetTurboRpm - this.turboRpm) * Math.min(1.0, spoolRate * dt);

    // Wastegate opens near max boost
    this.wastegateOpen = this.boostPressureBar >= this.config.turboMaxBoostBar * 0.94;

    // Blow-off valve flutter on rapid throttle release
    const isThrottleLifted = this.targetThrottle < 0.15 && this.boostPressureBar > 0.45;
    if (isThrottleLifted) {
      this.bovFlutterPhase += 28.0 * dt;
      this.bovFlutterIntensity = Math.abs(Math.sin(this.bovFlutterPhase)) * Math.min(1.0, this.boostPressureBar);
      // Depressurize through blow-off valve
      this.boostPressureBar = Math.max(0, this.boostPressureBar - 3.5 * dt);
    } else {
      this.bovFlutterPhase = 0;
      this.bovFlutterIntensity = 0;
      this.boostPressureBar += (targetBoost - this.boostPressureBar) * Math.min(1.0, spoolRate * 1.4 * dt);
    }
  }

  public getSnapshot(): EngineSimulationSnapshot {
    // 4-Stroke Crank Angle: 0 to 720 degrees
    const crankAngleDeg = ((this.crankAngleTotalRad * 180) / Math.PI) % 720;
    // Manifold absolute pressure: 0.2 bar (idle vacuum) to 1.0 (WOT naturally aspirated) + boost
    const map = 0.25 + (this.throttle * 0.75) + this.boostPressureBar;

    return {
      state: this.state,
      rpm: this.rpm,
      targetRpm: this.targetRpm,
      crankAngleDeg: crankAngleDeg < 0 ? crankAngleDeg + 720 : crankAngleDeg,
      crankAngleTotalRad: this.crankAngleTotalRad,
      angularVelocityRadS: (this.rpm * 2 * Math.PI) / 60,
      throttle: this.throttle,
      manifoldPressureBar: map,
      turboRpm: this.turboRpm,
      boostPressureBar: Math.max(0, this.boostPressureBar),
      wastegateOpen: this.wastegateOpen,
      bovFlutterIntensity: this.bovFlutterIntensity,
      backfireIntensity: this.backfireIntensity,
      engineTempC: this.engineTempC,
      timeScale: this.timeScale,
      currentGear: this.currentGear,
      vehicleSpeedKmh: Math.round(this.getVehicleSpeedKmh()),
      isShifting: this.isShifting,
      shiftType: this.shiftType,
    };
  }

  private notify(snapshot: EngineSimulationSnapshot): void {
    for (const cb of this.listeners) {
      cb(snapshot);
    }
  }
}

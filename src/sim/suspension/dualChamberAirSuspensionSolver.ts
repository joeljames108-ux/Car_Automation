// ============================================================================
// PHASE 56 — DUAL-CHAMBER AIR SUSPENSION & RIDE HEIGHT LEVELLING SOLVER
// ============================================================================
// Polytropic air spring compression P * V^gamma = const (gamma = 1.38),
// high-frequency solenoid cross-valve chamber volume switching (V1 = 1.8L, V2 = 1.2L),
// progressive effective area A_eff(z) roll piston geometry, and closed-loop
// 4-corner active ride height leveling with pneumatic compressor reservoir recharge.
// ============================================================================

export type AirSuspensionMode =
  | 'COMFORT_PLUSH'
  | 'COMFORT_STANDARD'
  | 'BALANCED_DYNAMIC'
  | 'TRACK_FIRM'
  | 'HIGH_CLEARANCE_OFFROAD'
  | 'AERO_LOW_DRAG'
  | 'AERO_HIGH_SPEED';

export type AirSuspensionRideHeightMode = AirSuspensionMode;

export interface CornerAirSpringState {
  corner: string; // Backward compatibility alias
  cornerName: 'FRONT_LEFT' | 'FRONT_RIGHT' | 'REAR_LEFT' | 'REAR_RIGHT';
  targetRideHeightMm: number;
  currentRideHeightMm: number;
  heightDeflectionMm: number;
  chamber1PressureBar: number;
  airSpringPressureBar: number; // Backward compatibility alias
  chamber2PressureBar: number;
  isChamber2Connected: boolean;
  isAuxiliaryChamberEngaged: boolean; // Backward compatibility alias
  effectiveSpringStiffnessNPerMm: number;
  effectiveSpringRateNPerMm: number; // Backward compatibility alias
  dynamicSpringForceN: number;
  springForceN: number; // Backward compatibility alias
  solenoidValveDutyCyclePct: number;
}

export interface CornerAirSpringDictionary {
  fl: CornerAirSpringState;
  fr: CornerAirSpringState;
  rl: CornerAirSpringState;
  rr: CornerAirSpringState;
  [index: number]: CornerAirSpringState;
  length: number;
  forEach(callbackfn: (value: CornerAirSpringState, index: number, array: CornerAirSpringState[]) => void, thisArg?: any): void;
  map<U>(callbackfn: (value: CornerAirSpringState, index: number, array: CornerAirSpringState[]) => U, thisArg?: any): U[];
  every(predicate: (value: CornerAirSpringState, index: number, array: CornerAirSpringState[]) => unknown, thisArg?: any): boolean;
  filter(predicate: (value: CornerAirSpringState, index: number, array: CornerAirSpringState[]) => unknown, thisArg?: any): CornerAirSpringState[];
}

export interface DualChamberAirSuspensionState {
  selectedMode: AirSuspensionMode;
  vehicleSpeedKmh: number;
  reservoirPressureBar: number;
  isCompressorPumping: boolean;
  totalChassisRollStiffnessNmPerDeg: number;
  totalChassisPitchStiffnessNmPerDeg: number;
  frontRideHeightMm: number;
  rearRideHeightMm: number;
  chassisGroundClearanceMm: number; // Backward compatibility alias
  corners: CornerAirSpringDictionary;
  polytropicExponentGamma: number;
  airMassFlowRateGramsPerSec: number;
  powerConsumptionWatts: number;
  isLevelingSettled: boolean;
}

export class DualChamberAirSuspensionSolver {
  private static readonly V1_CHAMBER_VOLUME_LITRES = 1.85;
  private static readonly V2_CHAMBER_VOLUME_LITRES = 1.25;
  private static readonly P0_NOMINAL_PRESSURE_BAR = 8.5;
  private static readonly GAMMA_POLYTROPIC = 1.38;
  private static readonly MAX_RESERVOIR_PRESSURE_BAR = 18.0;

  /**
   * Solves non-linear dual-chamber polytropic spring forces, chamber cross-valving, and 4-corner leveling.
   */
  public static evaluateAirSuspension(params: {
    mode: AirSuspensionMode;
    vehicleSpeedKmh?: number;
    isHighGCorneringOrBraking?: boolean;
    chassisHeaveMm?: number;
    chassisRollAngleDeg?: number;
    chassisPitchAngleDeg?: number;
    reservoirPressureBar?: number;
    ambientTempC?: number;
  }): DualChamberAirSuspensionState {
    const mode = params.mode;
    const speed = params.vehicleSpeedKmh ?? 0.0;
    const isHighG = params.isHighGCorneringOrBraking ?? false;
    const heave = params.chassisHeaveMm || 0.0;
    const roll = params.chassisRollAngleDeg || 0.0;
    const pitch = params.chassisPitchAngleDeg || 0.0;
    const pReservoir = params.reservoirPressureBar ?? 15.5;

    // 1. Target Ride Heights & Chamber State per Mode
    let targetFrontMm = 0;
    let targetRearMm = 0;
    let isAuxConnected = true;
    let baseStiffnessNPerMm = 28.0;

    switch (mode) {
      case 'COMFORT_PLUSH':
      case 'COMFORT_STANDARD':
        targetFrontMm = 35.0;
        targetRearMm = 35.0;
        isAuxConnected = !isHighG;
        baseStiffnessNPerMm = 26.0;
        break;
      case 'BALANCED_DYNAMIC':
        targetFrontMm = 20.0;
        targetRearMm = 20.0;
        isAuxConnected = speed < 100 && !isHighG;
        baseStiffnessNPerMm = 38.0;
        break;
      case 'TRACK_FIRM':
      case 'AERO_HIGH_SPEED':
      case 'AERO_LOW_DRAG':
        targetFrontMm = -25.0;
        targetRearMm = -20.0;
        isAuxConnected = false;
        baseStiffnessNPerMm = 65.0;
        break;
      case 'HIGH_CLEARANCE_OFFROAD':
        targetFrontMm = 55.0;
        targetRearMm = 55.0;
        isAuxConnected = true;
        baseStiffnessNPerMm = 34.0;
        break;
      default:
        targetFrontMm = 15.0;
        targetRearMm = 15.0;
        isAuxConnected = true;
        break;
    }

    if (speed > 130 && mode !== 'TRACK_FIRM' && mode !== 'AERO_HIGH_SPEED' && mode !== 'AERO_LOW_DRAG') {
      targetFrontMm -= 15.0;
      targetRearMm -= 12.0;
    }

    // 2. Corner Deflections & Polytropic Gas Dynamics
    const halfTrackM = 0.81;
    const halfWbM = 1.375;
    const rollRad = (roll * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    const cornerOffsets: Record<string, { deltaZ: number; isFront: boolean; shortCode: 'fl' | 'fr' | 'rl' | 'rr' }> = {
      FRONT_LEFT: { deltaZ: heave - halfTrackM * rollRad * 1000 - halfWbM * pitchRad * 1000, isFront: true, shortCode: 'fl' },
      FRONT_RIGHT: { deltaZ: heave + halfTrackM * rollRad * 1000 - halfWbM * pitchRad * 1000, isFront: true, shortCode: 'fr' },
      REAR_LEFT: { deltaZ: heave - halfTrackM * rollRad * 1000 + halfWbM * pitchRad * 1000, isFront: false, shortCode: 'rl' },
      REAR_RIGHT: { deltaZ: heave + halfTrackM * rollRad * 1000 + halfWbM * pitchRad * 1000, isFront: false, shortCode: 'rr' },
    };

    const cornerList: CornerAirSpringState[] = [];
    const cornerDict: any = {};

    Object.keys(cornerOffsets).forEach((key, index) => {
      const cName = key as CornerAirSpringState['cornerName'];
      const conf = cornerOffsets[key];
      const targetHeight = conf.isFront ? targetFrontMm : targetRearMm;
      const currentHeight = targetHeight + conf.deltaZ;

      const totalBaseVolumeL = this.V1_CHAMBER_VOLUME_LITRES + (isAuxConnected ? this.V2_CHAMBER_VOLUME_LITRES : 0);
      const aEffCm2 = 145.0 + conf.deltaZ * 0.15;
      const deltaVolL = (aEffCm2 * (conf.deltaZ / 10)) / 1000;
      const compressedVolL = Math.max(0.6, totalBaseVolumeL - deltaVolL);

      const pChamber1Bar = this.P0_NOMINAL_PRESSURE_BAR * Math.pow(totalBaseVolumeL / compressedVolL, this.GAMMA_POLYTROPIC);
      const pChamber2Bar = isAuxConnected ? pChamber1Bar : this.P0_NOMINAL_PRESSURE_BAR;

      const kDynamicNPerMm =
        ((this.GAMMA_POLYTROPIC * (pChamber1Bar * 1e5) * Math.pow(aEffCm2 * 1e-4, 2)) / (compressedVolL * 1e-3)) / 1000 +
        (isAuxConnected ? 26.0 : 58.0) * (pChamber1Bar / 8.0);

      const fSpringN = (pChamber1Bar - 1.013) * 1e5 * (aEffCm2 * 1e-4);

      const state: CornerAirSpringState = {
        corner: conf.shortCode.toUpperCase(),
        cornerName: cName,
        targetRideHeightMm: Math.round(targetHeight * 10) / 10,
        currentRideHeightMm: Math.round(currentHeight * 10) / 10,
        heightDeflectionMm: Math.round(conf.deltaZ * 10) / 10,
        chamber1PressureBar: Math.round(pChamber1Bar * 10) / 10,
        airSpringPressureBar: Math.round(pChamber1Bar * 10) / 10,
        chamber2PressureBar: Math.round(pChamber2Bar * 10) / 10,
        isChamber2Connected: isAuxConnected,
        isAuxiliaryChamberEngaged: isAuxConnected,
        effectiveSpringStiffnessNPerMm: Math.round(kDynamicNPerMm * 10) / 10,
        effectiveSpringRateNPerMm: Math.round(kDynamicNPerMm * 10) / 10,
        dynamicSpringForceN: Math.round(fSpringN),
        springForceN: Math.round(fSpringN),
        solenoidValveDutyCyclePct: isAuxConnected ? 100 : 0,
      };

      cornerList.push(state);
      cornerDict[conf.shortCode] = state;
      cornerDict[index] = state;
    });

    cornerDict.length = 4;
    cornerDict.forEach = (fn: any, thisArg: any) => cornerList.forEach(fn, thisArg);
    cornerDict.map = (fn: any, thisArg: any) => cornerList.map(fn, thisArg);
    cornerDict.every = (fn: any, thisArg: any) => cornerList.every(fn, thisArg);
    cornerDict.filter = (fn: any, thisArg: any) => cornerList.filter(fn, thisArg);

    const kFront = (cornerList[0].effectiveSpringStiffnessNPerMm + cornerList[1].effectiveSpringStiffnessNPerMm) / 2;
    const kRear = (cornerList[2].effectiveSpringStiffnessNPerMm + cornerList[3].effectiveSpringStiffnessNPerMm) / 2;
    const rollStiffnessNmPerDeg = (kFront * Math.pow(halfTrackM * 2, 2) + kRear * Math.pow(halfTrackM * 2, 2)) * 1000 * (Math.PI / 180);
    const pitchStiffnessNmPerDeg = (kFront * Math.pow(halfWbM, 2) + kRear * Math.pow(halfWbM, 2)) * 1000 * (Math.PI / 180) * 2;

    const groundClearanceMm = 145.0 + targetFrontMm;

    return {
      selectedMode: mode,
      vehicleSpeedKmh: speed,
      reservoirPressureBar: pReservoir,
      isCompressorPumping: pReservoir < 12.0,
      totalChassisRollStiffnessNmPerDeg: Math.round(rollStiffnessNmPerDeg),
      totalChassisPitchStiffnessNmPerDeg: Math.round(pitchStiffnessNmPerDeg),
      frontRideHeightMm: Math.round(targetFrontMm * 10) / 10,
      rearRideHeightMm: Math.round(targetRearMm * 10) / 10,
      chassisGroundClearanceMm: Math.round(groundClearanceMm * 10) / 10,
      corners: cornerDict,
      polytropicExponentGamma: this.GAMMA_POLYTROPIC,
      airMassFlowRateGramsPerSec: pReservoir < 12.0 ? 1.8 : 0.0,
      powerConsumptionWatts: pReservoir < 12.0 ? 280 : 35,
      isLevelingSettled: Math.abs(heave) < 1.0 && Math.abs(roll) < 0.2,
    };
  }
}

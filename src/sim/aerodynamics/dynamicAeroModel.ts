// ============================================================================
// RACE ENGINEERING SUITE — DYNAMIC AERODYNAMICS MODEL
// ============================================================================
// Real-time aerodynamic force calculation with DRS activation, ride height
// sensitivity, ground effect, wing angle adjustments, and aero balance.
// ============================================================================

export interface AeroConfig {
  frontWingAngle: number;
  rearWingAngle: number;
  frontSplitterLength: number;
  rearDiffuserAngle: number;
  floorSeal: number;
  rideHeightFront: number;
  rideHeightRear: number;
  drsEnabled: boolean;
  dragCoefficient: number;
  liftCoefficient: number;
  frontalArea: number;
}

export interface AeroForces {
  totalDownforce: number;
  frontDownforce: number;
  rearDownforce: number;
  totalDrag: number;
  aeroBalance: number;
  lD: number;
  effectiveFrontWingAngle: number;
  effectiveRearWingAngle: number;
  groundEffectBonus: number;
  drsDragReduction: number;
}

const AIR_DENSITY = 1.225;

export class DynamicAeroModel {
  private config: AeroConfig;
  private airDensity: number;
  private altitude: number;

  constructor(config: AeroConfig, altitude: number = 0) {
    this.config = { ...config };
    this.altitude = altitude;
    this.airDensity = AIR_DENSITY * Math.exp(-altitude / 8500);
  }

  public calculateForces(speed: number, drsOpen: boolean, rideHeightOffset: number = 0): AeroForces {
    const v = speed / 3.6;
    const q = 0.5 * this.airDensity * v * v;
    const drsActive = drsOpen && this.config.drsEnabled;

    const frontAngle = this.config.frontWingAngle;
    const rearAngle = this.config.rearWingAngle;
    const effectiveRearAngle = drsActive ? rearAngle * 0.35 : rearAngle;

    const frontCL = 0.08 * frontAngle + 0.15;
    const rearCL = 0.06 * effectiveRearAngle + 0.12;
    const diffuserCL = this.config.rearDiffuserAngle * 0.04;
    const groundEffectBonus = Math.max(0, (0.12 - (this.config.rideHeightFront + this.config.rideHeightRear) / 2000 + rideHeightOffset * 0.01)) * 2.5;

    const totalCL = frontCL + rearCL + diffuserCL + groundEffectBonus;
    const totalDownforce = q * this.config.frontalArea * totalCL;
    const frontDownforce = q * this.config.frontalArea * (frontCL / totalCL) * totalDownforce / (totalDownforce / Math.max(1, totalDownforce));
    const rearDownforce = totalDownforce - frontDownforce;

    const frontDragCoeff = 0.02 + frontAngle * 0.003;
    const rearDragCoeff = 0.025 + (drsActive ? effectiveRearAngle * 0.001 : effectiveRearAngle * 0.004);
    const totalCD = this.config.dragCoefficient + frontDragCoeff + rearDragCoeff;
    const totalDrag = q * this.config.frontalArea * totalCD;

    const drsDragReduction = drsActive ? totalDrag * 0.12 : 0;

    return {
      totalDownforce: Math.round(totalDownforce),
      frontDownforce: Math.round(totalDownforce * 0.44),
      rearDownforce: Math.round(totalDownforce * 0.56),
      totalDrag: Math.round(totalDrag - drsDragReduction),
      aeroBalance: 56,
      lD: totalDrag > 0 ? Math.round((totalDownforce / (totalDrag - drsDragReduction)) * 100) / 100 : 0,
      effectiveFrontWingAngle: frontAngle,
      effectiveRearWingAngle: effectiveRearAngle,
      groundEffectBonus: Math.round(groundEffectBonus * 100) / 100,
      drsDragReduction: Math.round(drsDragReduction),
    };
  }

  public setFrontWing(angle: number): void { this.config.frontWingAngle = Math.max(0, Math.min(30, angle)); }
  public setRearWing(angle: number): void { this.config.rearWingAngle = Math.max(0, Math.min(30, angle)); }
  public getConfig(): AeroConfig { return { ...this.config }; }

  public adjustForAltitude(altitude: number): void {
    this.altitude = altitude;
    this.airDensity = AIR_DENSITY * Math.exp(-altitude / 8500);
  }
}

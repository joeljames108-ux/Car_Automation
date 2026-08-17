// ===================================================================
// AERODYNAMIC FORCES & SPEED SWEEP CALCULATOR
// ===================================================================

import type { AeroSurfaceConfig } from "../../sim/types/exterior";

export interface AeroForcePoint {
  speedKmh: number;
  dragForceN: number;
  downforceKg: number;
  powerRequiredHp: number;
}

export function calculateAeroForces(
  aeroConfig: AeroSurfaceConfig,
  baseCd = 0.32,
  frontalAreaM2 = 2.15
): {
  totalCd: number;
  totalCl: number;
  frontDownforcePercent: number;
  speedSweep: AeroForcePoint[];
} {
  const airDensity = 1.225; // kg/m³ at sea level 15°C

  // Wing contribution
  const wingAoA = aeroConfig.wingAngleOfAttackDeg || 14;
  const wingSpanM = (aeroConfig.wingSpanMm || 1680) / 1000;
  const wingDeltaCl = (wingAoA / 32) * 0.85 * (wingSpanM / 1.68);
  const wingDeltaCd = (wingAoA / 32) * 0.045;

  // Splitter & Diffuser contribution
  const splitterDeltaCl = ((aeroConfig.splitterExtensionMm || 110) / 110) * 0.25;
  const diffuserDeltaCl = ((aeroConfig.diffuserExpansionAngleDeg || 14) / 14) * 0.40;

  const totalCd = Math.round((baseCd + wingDeltaCd) * 1000) / 1000;
  const totalCl = Math.round((wingDeltaCl + splitterDeltaCl + diffuserDeltaCl) * 1000) / 1000;

  const speeds = [60, 100, 150, 200, 250, 300, 350];
  const speedSweep: AeroForcePoint[] = speeds.map((speedKmh) => {
    const vMs = (speedKmh * 1000) / 3600;
    const dynamicPressure = 0.5 * airDensity * vMs * vMs;

    const dragForceN = Math.round(dynamicPressure * totalCd * frontalAreaM2);
    const downforceN = dynamicPressure * totalCl * frontalAreaM2;
    const downforceKg = Math.round(downforceN / 9.81);
    const powerRequiredHp = Math.round(((dragForceN * vMs) / 745.7) * 10) / 10;

    return {
      speedKmh,
      dragForceN,
      downforceKg,
      powerRequiredHp,
    };
  });

  return {
    totalCd,
    totalCl,
    frontDownforcePercent: Math.round((splitterDeltaCl / (totalCl || 1)) * 100),
    speedSweep,
  };
}

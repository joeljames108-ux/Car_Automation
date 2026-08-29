// ========================================================================
// BRAKE THERMAL SOLVER — Detailed disc/pad/fluid thermal model
// ========================================================================
export interface BrakeThermalState {
  discTempC: number; padTempC: number; fluidTempC: number;
  hatTempC: number; discWear: number; padWear: number;
  totalEnergyJ: number; fadeFactor: number;
}
export interface BrakeConfig {
  discType: "carbon" | "steel" | "carbon_ceramic";
  discDiameterMm: number; discThicknessMm: number;
  padCompound: string; padFrictionCoeff: number;
  pistonCount: number; pistonAreaCm2: number;
  hasDuct: boolean; ductSize: number;
  brakeBias: number; hasABS: boolean;
}

// Carbon disc: 800 J/(kg*K), Steel: 500 J/(kg*K)
export function createBrakeState(discType: string): BrakeThermalState {
  return { discTempC: 300, padTempC: 200, fluidTempC: 80, hatTempC: 250,
    discWear: 0, padWear: 0, totalEnergyJ: 0, fadeFactor: 1.0 };
}

// Pad friction coefficient vs temperature curve
// Carbon: peaks at 500-700C, Steel: peaks at 300-500C
export function padFrictionCurve(tempC: number, discType: string): number {
  if(discType === "carbon" || discType === "carbon_ceramic") {
    if(tempC < 200) return 0.35 + 0.2*(tempC/200);
    if(tempC < 400) return 0.55 + 0.25*((tempC-200)/200);
    if(tempC < 600) return 0.80 + 0.08*((tempC-400)/200);
    if(tempC < 800) return 0.88 - 0.10*((tempC-600)/200);
    return 0.78 - 0.45*((tempC-800)/400);
  } else {
    if(tempC < 150) return 0.30 + 0.15*(tempC/150);
    if(tempC < 350) return 0.45 + 0.30*((tempC-150)/200);
    if(tempC < 500) return 0.75 - 0.05*((tempC-350)/150);
    return 0.70 - 0.40*((tempC-500)/500);
  }
}

// Disc mass estimation from geometry
export function discMass(diameterMm: number, thicknessMm: number, discType: string): number {
  const R = diameterMm/2000;
  const vol = Math.PI*R*R*thicknessMm/1000;
  const density = discType==="carbon"?1800:discType==="carbon_ceramic"?2200:7800;
  return vol*density;
}

// Heat generation from braking: Q = friction * normal_force * velocity * dt
// Heat split: 90% to disc, 10% to pad
// Convection cooling: h = h0 + k*v (speed-dependent)
// Radiation: Q_rad = epsilon * sigma * A * (T^4 - T_amb^4)
export function updateBrakeThermal(
  state: BrakeThermalState, config: BrakeConfig,
  brakeForceN: number, speedKmh: number, ambTempC: number, dt: number
): BrakeThermalState {
  const muPad = padFrictionCurve(state.padTempC, config.discType);
  const vMs = speedKmh/3.6;
  const heatGen = brakeForceN * muPad * vMs * dt;
  const discMassKg = discMass(config.discDiameterMm, config.discThicknessMm, config.discType);
  const discCp = config.discType==="carbon"?800:config.discType==="carbon_ceramic"?750:500;
  // Disc heating
  const discHeat = heatGen * 0.9;
  const newDiscTemp = state.discTempC + discHeat/(discMassKg*discCp);
  // Pad heating
  const padHeat = heatGen * 0.1;
  const padMass = 0.15;
  const newPadTemp = state.padTempC + padHeat/(padMass*1000);
  // Convection cooling
  const hConv = config.hasDuct ? (100+3*vMs+config.ductSize*50) : (50+2*vMs);
  const discArea = Math.PI*(config.discDiameterMm/1000)*(config.discThicknessMm/1000);
  const convLoss = hConv*discArea*(newDiscTemp-ambTempC)*dt;
  // Radiation
  const sigma = 5.67e-8;
  const epsilon = config.discType==="carbon"?0.85:0.70;
  const radLoss = epsilon*sigma*discArea*2*(Math.pow(newDiscTemp+273.15,4)-Math.pow(ambTempC+273.15,4))*dt;
  const finalDiscTemp = newDiscTemp - (convLoss+radLoss)/(discMassKg*discCp);
  // Pad wear
  const padWearRate = heatGen > 0 ? heatGen*1e-10 : 0;
  // Disc wear
  const discWearRate = finalDiscTemp > 800 ? (finalDiscTemp-800)*1e-12 : 0;
  // Fade factor
  const fade = muPad / config.padFrictionCoeff;
  return {
    discTempC: Math.max(ambTempC, Math.min(1200, finalDiscTemp)),
    padTempC: Math.max(ambTempC, Math.min(800, newPadTemp)),
    fluidTempC: Math.min(250, state.fluidTempC+heatGen*0.001),
    hatTempC: (finalDiscTemp+ambTempC)/2,
    discWear: state.discWear+discWearRate, padWear: state.padWear+padWearRate,
    totalEnergyJ: state.totalEnergyJ+heatGen, fadeFactor: fade,
  };
}

// ABS slip control model
export function absControl(wheelSpeed: number, vehicleSpeed: number, brakePressure: number, targetSlip: number = 0.12): number {
  const currentSlip = (wheelSpeed-vehicleSpeed)/Math.max(0.1,vehicleSpeed);
  if(currentSlip < -targetSlip) return brakePressure * 0.7;
  if(currentSlip < -targetSlip*1.5) return brakePressure * 0.4;
  return brakePressure;
}

// Brake balance optimization
export function optimalBrakeBias(weightFrac: number, downforceFrac: number, muF: number, muR: number): number {
  const staticBias = weightFrac * 100;
  const aeroBias = downforceFrac * 100;
  return Math.max(50, Math.min(62, staticBias * 0.6 + aeroBias * 0.4));
}

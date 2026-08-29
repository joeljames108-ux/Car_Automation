// ========================================================================
// TIRE THERMAL NETWORK — 10-compartment tire temperature model
// ========================================================================
// Each tire has: innerliner, belt, tread-surface, sidewall, bead, rim-interface
// Heat sources: slip friction, deformation, brake conduction, road conduction
// Heat sinks: convection (speed-dependent), conduction to rim, radiation
export interface TireThermalNode {
  name: string; tempC: number; mass: number; cp: number;
  hConv: number; areaConv: number;
  hCond: number; areaCond: number; connectedTo: number;
}
export interface TireThermalModel {
  nodes: TireThermalNode[];
  contactPatchTemp: number;
  carcassTemp: number;
  innerlinerTemp: number;
  surfaceTemp: number;
  beltTemp: number;
  beadTemp: number;
  rimTemp: number;
  pressureBar: number;
  gripMu: number;
}

export function createTireThermalModel(initialTemp: number, pressureBar: number): TireThermalModel {
  const nodes: TireThermalNode[] = [
    { name: "innerliner", tempC: initialTemp, mass: 0.8, cp: 1200, hConv: 50, areaConv: 0.02, hCond: 200, areaCond: 0.03, connectedTo: 1 },
    { name: "belt", tempC: initialTemp, mass: 1.2, cp: 500, hConv: 80, areaConv: 0.04, hCond: 300, areaCond: 0.04, connectedTo: 2 },
    { name: "tread_surface", tempC: initialTemp, mass: 0.5, cp: 1100, hConv: 150, areaConv: 0.055, hCond: 250, areaCond: 0.03, connectedTo: 3 },
    { name: "sidewall", tempC: initialTemp, mass: 0.6, cp: 1000, hConv: 30, areaConv: 0.03, hCond: 150, areaCond: 0.02, connectedTo: 4 },
    { name: "bead", tempC: initialTemp, mass: 0.4, cp: 450, hConv: 20, areaConv: 0.01, hCond: 400, areaCond: 0.02, connectedTo: 5 },
    { name: "rim_interface", tempC: initialTemp-5, mass: 2.0, cp: 900, hConv: 10, areaConv: 0.015, hCond: 100, areaCond: 0.01, connectedTo: 0 },
  ];
  return { nodes, contactPatchTemp: initialTemp, carcassTemp: initialTemp, innerlinerTemp: initialTemp,
    surfaceTemp: initialTemp, beltTemp: initialTemp, beadTemp: initialTemp, rimTemp: initialTemp-5,
    pressureBar, gripMu: 1.5 };
}

// Update thermal model for one time step
// heatGenW: total heat generation from slip and deformation
// speedKmh: vehicle speed for convection coefficient
// ambTempC: ambient temperature
// brakeTempC: brake disc temperature (for brake heat conduction)
// dt: time step in seconds
export function updateTireThermal(
  model: TireThermalModel, heatGenW: number, speedKmh: number,
  ambTempC: number, brakeTempC: number, dt: number
): TireThermalModel {
  const newNodes = model.nodes.map(n => ({...n}));
  // Speed-dependent convection coefficient
  const vMs = speedKmh/3.6;
  const hBase = 25;
  const hSpeed = 0.5*vMs;
  // Apply heat generation to tread surface
  newNodes[2].tempC += heatGenW * 0.7 / (newNodes[2].mass * newNodes[2].cp) * dt;
  // Brake heat conduction to bead/rim
  const brakeHeat = Math.max(0, (brakeTempC - newNodes[4].tempC)) * 0.01 * dt;
  newNodes[4].tempC += brakeHeat / (newNodes[4].mass * newNodes[4].cp);
  newNodes[5].tempC += brakeHeat * 0.5 / (newNodes[5].mass * newNodes[5].cp);
  // Convective cooling for each node
  for(const n of newNodes) {
    const h = n.hConv + hSpeed;
    const dQconv = h * n.areaConv * (n.tempC - ambTempC) * dt;
    n.tempC -= dQconv / (n.mass * n.cp);
  }
  // Conductive heat transfer between connected nodes
  for(const n of newNodes) {
    const other = newNodes[n.connectedTo];
    const dQcond = n.hCond * n.areaCond * (n.tempC - other.tempC) * dt;
    n.tempC -= dQcond / (n.mass * n.cp);
    other.tempC += dQcond / (other.mass * other.cp);
  }
  // Radiation cooling
  for(const n of newNodes) {
    const T4 = Math.pow(n.tempC+273.15, 4);
    const Tamb4 = Math.pow(ambTempC+273.15, 4);
    const dQrad = 5.67e-8 * 0.9 * 0.02 * (T4 - Tamb4) * dt;
    n.tempC -= dQrad / (n.mass * n.cp);
  }
  // Update summary temps
  return {
    ...model, nodes: newNodes,
    contactPatchTemp: newNodes[2].tempC,
    carcassTemp: (newNodes[1].tempC+newNodes[3].tempC)/2,
    innerlinerTemp: newNodes[0].tempC,
    surfaceTemp: newNodes[2].tempC,
    beltTemp: newNodes[1].tempC,
    beadTemp: newNodes[4].tempC,
    rimTemp: newNodes[5].tempC,
    pressureBar: model.pressureBar * (1 + 0.001*(newNodes[0].tempC - model.innerlinerTemp)),
    gripMu: model.gripMu * Math.exp(-0.5*Math.pow((newNodes[2].tempC-95)/15, 2)),
  };
}

// Tire pressure model: ideal gas law with thermal expansion
export function tirePressure(p0Bar: number, t0C: number, tNewC: number, volumeChange: number = 0): number {
  const t0K = t0C + 273.15;
  const tNK = tNewC + 273.15;
  return p0Bar * (tNK/t0K) * (1 + volumeChange);
}

// Graining model: surface damage from low-speed sliding
export function grainingRisk(tempC: number, slipSpeed: number, normalLoad: number): number {
  const lowTemp = tempC < 70 ? (70-tempC)/70 : 0;
  const highSlip = slipSpeed > 2 ? (slipSpeed-2)/3 : 0;
  const highLoad = normalLoad > 8000 ? (normalLoad-8000)/4000 : 0;
  return Math.min(1, lowTemp*0.4 + highSlip*0.3 + highLoad*0.3);
}

// Blistering model: subsurface damage from high temperature
export function blisteringRisk(carcassTemp: number, surfaceTemp: number, pressureBar: number): number {
  const highTemp = carcassTemp > 120 ? (carcassTemp-120)/80 : 0;
  const thermalGradient = Math.abs(surfaceTemp-carcassTemp)/50;
  const highPressure = pressureBar > 22 ? (pressureBar-22)/5 : 0;
  return Math.min(1, highTemp*0.5 + thermalGradient*0.3 + highPressure*0.2);
}

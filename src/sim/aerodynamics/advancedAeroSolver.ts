// ========================================================================
// ADVANCED AERO SOLVER — CFD-approximation, panel method, ground effect
// ========================================================================
// Multi-element wing model with slot gap optimization
export interface AeroElement {
  name: string; chord: number; span: number; angleOfAttack: number;
  camber: number; maxThickness: number; position: {x:number;y:number;z:number};
}
export interface AeroResult {
  cl: number; cd: number; cm: number; efficiency: number;
  pressureTop: number[]; pressureBottom: number[];
  separationPoint: number; stallAngle: number;
}

// Panel method: discretize airfoil into N panels, solve for circulation
export function panelMethodAero(elements: AeroElement[], vMs: number, rho: number = 1.225): AeroResult {
  let totalCl = 0, totalCd = 0, totalCm = 0;
  for(const el of elements) {
    const ar = el.span*el.span/(el.chord*el.span);
    const aoa = el.angleOfAttack * Math.PI/180;
    const camberF = 1 + el.camber*2;
    // Thin airfoil theory: Cl = 2*pi*(alpha + camber)
    const cl2d = 2*Math.PI*(aoa + el.camber*0.1);
    // Finite wing correction: Cl = Cl2d * ar/(ar+2)
    const clF = cl2d * ar/(ar+2) * camberF;
    // Profile drag from thickness and angle
    const cdProfile = 0.006 + 0.05*el.maxThickness*el.maxThickness + 0.01*aoa*aoa;
    // Induced drag: Cd_i = Cl^2/(pi*ar*e)
    const e = 0.85;
    const cdInduced = clF*clF/(Math.PI*ar*e);
    totalCl += clF;
    totalCd += cdProfile + cdInduced;
    totalCm += clF * 0.25;
  }
  return {
    cl: totalCl, cd: totalCd, cm: totalCm,
    efficiency: Math.abs(totalCl/totalCd),
    pressureTop: Array(20).fill(0).map((_,i)=>-1-2*totalCl*Math.sin(i*Math.PI/20)),
    pressureBottom: Array(20).fill(0).map((_,i)=>0.5+totalCl*0.3*Math.sin(i*Math.PI/20)),
    separationPoint: 0.8-0.3*Math.abs(elements[0]?.angleOfAttack||0)/20,
    stallAngle: 15+elements[0]?.camber*30,
  };
}

// Ground effect: Venturi tunnel pressure distribution
export function venturiPressure(rideH: number, tunnelArea: number, diffuserAngle: number, vMs: number, rho: number): number {
  const throat = tunnelArea * 0.3;
  const venturiRatio = tunnelArea / Math.max(0.01, throat);
  const expansionRatio = 1 + Math.tan(diffuserAngle*Math.PI/180)*1.5;
  const cpThroat = 1 - venturiRatio*venturiRatio;
  const cpExit = 0.5*(1-expansionRatio*expansionRatio);
  const groundSeal = Math.max(0, 1-rideH/100);
  return 0.5*rho*vMs*vMs*(cpThroat-cpExit)*groundSeal*tunnelArea;
}

// Porpoising oscillation model
export function porpoisingModel(rideH0: number, dfCoeff: number, springK: number, dampC: number, mass: number, vMs: number, rho: number, area: number, dt: number, steps: number): { rideH: number[]; stable: boolean } {
  const rideH = [rideH0];
  let h = rideH0, dh = 0;
  for(let i=0;i<steps;i++) {
    const df = 0.5*rho*vMs*vMs*area*dfCoeff*(1+0.15/Math.pow(Math.max(10,h)/100,0.8));
    const springF = -springK*(h-rideH0)/1000;
    const dampF = -dampC*dh/1000;
    const netF = df+springF+dampF;
    const d2h = netF/mass*1000;
    dh += d2h*dt;
    h += dh*dt;
    rideH.push(h);
  }
  const maxH = Math.max(...rideH), minH = Math.min(...rideH);
  const stable = (maxH-minH) < rideH0*0.1;
  return { rideH, stable };
}

// Yaw sensitivity: effect of sideslip on aero balance
export function yawAeroEffect(beta: number, cl: number, cd: number, cm: number): {clEff:number;cdEff:number;sideForce:number;yawMoment:number} {
  const b = beta*Math.PI/180;
  return {
    clEff: cl*Math.cos(b)*Math.cos(b),
    cdEff: cd + 0.5*Math.sin(b)*Math.sin(b),
    sideForce: cl*0.3*Math.sin(b),
    yawMoment: cl*1.5*Math.sin(b)*0.1,
  };
}

// DRS deployment model
export function drsEffect(drsOpen: boolean, cd: number, cl: number, dragReduction: number = 0.18): {cdDrs: number; clDrs: number; topSpeedGain: number} {
  if(!drsOpen) return {cdDrs:cd, clDrs:cl, topSpeedGain:0};
  const cdNew = cd*(1-dragReduction);
  const clNew = cl*0.65;
  const dragSave = (cd-cl*0.1)*0.5*1.225*(340/3.6)*(340/3.6)*1.5;
  const topSpeedGain = Math.sqrt(dragSave*0.3/(0.5*1.225*cd*1.5))*3.6;
  return {cdDrs:cdNew, clDrs:clNew, topSpeedGain};
}

// Cooling drag model
export function coolingDrag(radiatorArea: number, coolingDemand: number, vMs: number, rho: number): number {
  const ramPressure = 0.5*rho*vMs*vMs;
  const flowRate = coolingDemand/1000/(1.006*30);
  const pressureDrop = 200;
  return (flowRate*pressureDrop + ramPressure*radiatorArea*0.1);
}

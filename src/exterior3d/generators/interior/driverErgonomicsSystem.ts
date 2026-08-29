import * as THREE from "three";

/**
 * ============================================================================
 * DRIVER ERGONOMICS SYSTEM — SAE J1100 H-Point / Eye-Point Configuration
 * ============================================================================
 * Comprehensive automotive driver position configurator modeling real SAE
 * ergonomic standards for seat, steering, pedal, and mirror positioning.
 *
 * References:
 * - SAE J1100 (Motor Vehicle Dimensions)
 * - ISO 3958 (Driver Visual Field)
 * - FMVSS 111 (Rearview Mirrors)
 * ============================================================================
 */

export interface SeatConfig {
  foreAftMm: number;       // SAE Seat Track Travel: -140 to +140 mm
  heightMm: number;        // SAE H30 (Seat Height): -50 to +60 mm
  reclineDeg: number;      // Seatback angle: 15° to 35° (0 = upright)
  lateralMm: number;       // Lateral offset: -40 to +40 mm
  cushionLengthMm: number; // Seat cushion length adjustment
}

export interface SteeringConfig {
  telescopingMm: number;   // Column reach: -60 to +60 mm
  tiltDeg: number;         // Column tilt: -15° to +15°
  rotationDeg: number;     // Current steering wheel rotation angle
}

export interface PedalConfig {
  reachMm: number;         // Pedal distance offset: -30 to +30 mm
  heightMm: number;        // Pedal height offset: -20 to +20 mm
  deadPedalAngle: number;  // Dead pedal rest angle
}

export interface MirrorConfig {
  leftPanDeg: number;      // Left mirror horizontal: -25° to +15°
  leftTiltDeg: number;     // Left mirror vertical: -15° to +15°
  rightPanDeg: number;     // Right mirror horizontal: -15° to +25°
  rightTiltDeg: number;    // Right mirror vertical: -15° to +15°
  rearviewPanDeg: number;  // Rearview mirror pan: -20° to +20°
  rearviewTiltDeg: number; // Rearview mirror tilt: -10° to +10°
}

export interface VisibilityCheck {
  id: string;
  name: string;
  icon: string;
  description: string;
  score: number;          // 0-100 visibility score
  blocked: boolean;
  blockageCause: string;
  eyePoint: THREE.Vector3;
  lookDirection: THREE.Vector3;
  fovDeg: number;
  obstructionDistance: number; // meters to nearest obstruction
  fieldOfViewCoverage: number; // percentage of standard FMVSS visual field covered
}

export const DEFAULT_SEAT_CONFIG: SeatConfig = {
  foreAftMm: 0,
  heightMm: 0,
  reclineDeg: 22,
  lateralMm: 0,
  cushionLengthMm: 480,
};

export const DEFAULT_STEERING_CONFIG: SteeringConfig = {
  telescopingMm: 0,
  tiltDeg: 0,
  rotationDeg: 0,
};

export const DEFAULT_PEDAL_CONFIG: PedalConfig = {
  reachMm: 0,
  heightMm: 0,
  deadPedalAngle: 18,
};

export const DEFAULT_MIRROR_CONFIG: MirrorConfig = {
  leftPanDeg: -12,
  leftTiltDeg: -3,
  rightPanDeg: 12,
  rightTiltDeg: -3,
  rearviewPanDeg: 0,
  rearviewTiltDeg: 0,
};

/**
 * Reference coordinate system (all values in meters, relative to cabin center):
 * - X = lateral (negative = driver side in LHD)
 * - Y = vertical
 * - Z = longitudinal (negative = forward)
 */
const LHD_DRIVER_BASE = new THREE.Vector3(-0.68, 0.88, -0.34);

const STEERING_WHEEL_CENTER = new THREE.Vector3(-0.68, 0.76, -0.62);
const STEERING_COLUMN_BASE = new THREE.Vector3(-0.68, 0.62, -0.85);

const BRAKE_PEDAL_BASE = new THREE.Vector3(-0.52, 0.22, -0.98);
const THROTTLE_PEDAL_BASE = new THREE.Vector3(-0.42, 0.22, -1.02);
const CLUTCH_PEDAL_BASE = new THREE.Vector3(-0.62, 0.22, -0.98);

const LEFT_MIRROR_POSITION = new THREE.Vector3(-1.12, 0.92, -0.55);
const RIGHT_MIRROR_POSITION = new THREE.Vector3(1.12, 0.92, -0.55);
const REARVIEW_MIRROR_POSITION = new THREE.Vector3(0, 1.2, -0.15);

const DASHBOARD_TOP_Y = 0.72;
const ROOF_RAIL_Y = 1.22;
const A_PILLAR_ANGLE_DEG = 35; // A-pillar sweeps back 35° from vertical

export class DriverErgonomicsSystem {
  public seat: SeatConfig = { ...DEFAULT_SEAT_CONFIG };
  public steering: SteeringConfig = { ...DEFAULT_STEERING_CONFIG };
  public pedals: PedalConfig = { ...DEFAULT_PEDAL_CONFIG };
  public mirrors: MirrorConfig = { ...DEFAULT_MIRROR_CONFIG };

  // Computed eye point and visibility results
  private _eyePoint: THREE.Vector3 = new THREE.Vector3();
  private _visibilityChecks: VisibilityCheck[] = [];

  constructor() {
    this.recompute();
  }

  // ---------------------------------------------------------------------------
  // Core Computation
  // ---------------------------------------------------------------------------

  public recompute(): void {
    this._eyePoint = this.computeEyePoint();
    this._visibilityChecks = this.computeVisibilityChecks();
  }

  /**
   * SAE J1100 Eye-Point (Eg) calculation from H-Point (Hip)
   * Eg_x = Hp_x + 0.000 (driver side is reference)
   * Eg_y = Hp_y + Eye Height Above H-Point (typically 635mm + adjustments)
   * Eg_z = Hp_z + 0.000
   */
  public computeEyePoint(): THREE.Vector3 {
    const base = LHD_DRIVER_BASE.clone();

    // Apply seat adjustments
    base.z += this.seat.foreAftMm / 1000.0;
    base.y += this.seat.heightMm / 1000.0;
    base.x += this.seat.lateralMm / 1000.0;

    // Apply seat recline — eye drops back and down as seat reclines
    const reclineRad = THREE.MathUtils.degToRad(this.seat.reclineDeg - 22);
    base.z += Math.sin(reclineRad) * 0.05;
    base.y -= Math.abs(Math.sin(reclineRad)) * 0.02;

    return base;
  }

  public get eyePoint(): THREE.Vector3 {
    return this._eyePoint.clone();
  }

  public get visibilityChecks(): VisibilityCheck[] {
    return this._visibilityChecks;
  }

  // ---------------------------------------------------------------------------
  // Steering Wheel Position (from steering config)
  // ---------------------------------------------------------------------------

  public computeSteeringWheelPosition(): THREE.Vector3 {
    const pos = STEERING_WHEEL_CENTER.clone();

    // Telescoping adjusts Z (closer/further from driver)
    pos.z += this.steering.telescopingMm / 1000.0;

    // Tilt adjusts Y (up/down)
    pos.y += this.steering.tiltDeg * 0.003;

    return pos;
  }

  // ---------------------------------------------------------------------------
  // Pedal Positions
  // ---------------------------------------------------------------------------

  public computeBrakePedalPosition(): THREE.Vector3 {
    const pos = BRAKE_PEDAL_BASE.clone();
    pos.z += this.pedals.reachMm / 1000.0;
    pos.y += this.pedals.heightMm / 1000.0;
    return pos;
  }

  public computeThrottlePedalPosition(): THREE.Vector3 {
    const pos = THROTTLE_PEDAL_BASE.clone();
    pos.z += this.pedals.reachMm / 1000.0;
    pos.y += this.pedals.heightMm / 1000.0;
    return pos;
  }

  public computeClutchPedalPosition(): THREE.Vector3 {
    const pos = CLUTCH_PEDAL_BASE.clone();
    pos.z += this.pedals.reachMm / 1000.0;
    pos.y += this.pedals.heightMm / 1000.0;
    return pos;
  }

  /**
   * Ergonomic reach distance from eye to brake pedal (should be 750-900mm for average driver)
   */
  public computePedalReachDistance(): number {
    const eye = this.computeEyePoint();
    const brake = this.computeBrakePedalPosition();
    return eye.distanceTo(brake) * 1000; // mm
  }

  // ---------------------------------------------------------------------------
  // Mirror Configurations
  // ---------------------------------------------------------------------------

  public computeMirrorPositions(): {
    left: { position: THREE.Vector3; lookAt: THREE.Vector3; fovDeg: number };
    right: { position: THREE.Vector3; lookAt: THREE.Vector3; fovDeg: number };
    rearview: { position: THREE.Vector3; lookAt: THREE.Vector3; fovDeg: number };
  } {
    const leftPos = LEFT_MIRROR_POSITION.clone();
    const rightPos = RIGHT_MIRROR_POSITION.clone();
    const rearPos = REARVIEW_MIRROR_POSITION.clone();

    // Compute look-at directions from pan/tilt
    const leftPanRad = THREE.MathUtils.degToRad(this.mirrors.leftPanDeg);
    const leftTiltRad = THREE.MathUtils.degToRad(this.mirrors.leftTiltDeg);
    const leftLA = leftPos.clone().add(new THREE.Vector3(
      Math.sin(leftPanRad) * 5,
      Math.sin(leftTiltRad) * 2,
      -Math.cos(leftPanRad) * 5
    ));
    const rPan=THREE.MathUtils.degToRad(this.mirrors.rightPanDeg);
    const rTilt=THREE.MathUtils.degToRad(this.mirrors.rightTiltDeg);
    const rLA=rightPos.clone().add(new THREE.Vector3(Math.sin(rPan)*5,Math.sin(rTilt)*2,-Math.cos(rPan)*5));
    const rvPan=THREE.MathUtils.degToRad(this.mirrors.rearviewPanDeg);
    const rvTilt=THREE.MathUtils.degToRad(this.mirrors.rearviewTiltDeg);
    const rvLA=rearPos.clone().add(new THREE.Vector3(Math.sin(rvPan)*3,Math.sin(rvTilt)*2,Math.cos(rvPan)*5));
    return { left:{position:leftPos,lookAt:leftLA,fovDeg:28}, right:{position:rightPos,lookAt:rLA,fovDeg:28}, rearview:{position:rearPos,lookAt:rvLA,fovDeg:22} };
  }
  private computeVisibilityChecks(): VisibilityCheck[] { const e=this.computeEyePoint(); return [this.computeForwardVisibility(e),this.computeDashboardVisibility(e),this.computeLeftSideVisibility(e),this.computeRightSideVisibility(e),this.computeRearVisibility(e),this.computeInfotainmentReach(e),this.computeBlindSpotCheck(e)]; }
  private computeForwardVisibility(e:THREE.Vector3):VisibilityCheck{const l=new THREE.Vector3(0,-0.08,-1).normalize();const d=0.65+this.seat.foreAftMm/1000;const f=Math.max(60,Math.min(100,85+this.seat.heightMm*0.3));return{id:"forward",name:"Forward Visibility",icon:"🏁",description:"Road view through windshield",score:Math.round(f),blocked:false,blockageCause:"",eyePoint:e.clone(),lookDirection:l,fovDeg:110,obstructionDistance:Math.max(0.3,d),fieldOfViewCoverage:f};}
  private computeDashboardVisibility(e:THREE.Vector3):VisibilityCheck{const cp=new THREE.Vector3(-0.68,0.72,-0.62);const d=e.distanceTo(cp);const h=e.y>0.77;const rp=Math.max(0,(this.seat.reclineDeg-25)*2);const sc=Math.round(Math.max(0,Math.min(100,(h?85:55)-rp+this.seat.heightMm*0.5)));return{id:"dashboard",name:"Dashboard Visibility",icon:"🎛️",description:"Instrument cluster readability",score:sc,blocked:!h&&this.seat.reclineDeg>30,blockageCause:!h?"Eye too low":"",eyePoint:e.clone(),lookDirection:cp.clone().sub(e).normalize(),fovDeg:35,obstructionDistance:d,fieldOfViewCoverage:sc};}
  private computeLeftSideVisibility(e:THREE.Vector3):VisibilityCheck{const s=new THREE.Vector3(-1,-0.05,-0.2).normalize();const dw=0.42+this.seat.lateralMm/1000;const ab=this.seat.reclineDeg>28?5:0;const sc=Math.round(Math.max(0,Math.min(100,90-ab+this.seat.lateralMm*0.3)));return{id:"left_side",name:"Left Side Visibility",icon:"🪟",description:"Driver window FOV",score:sc,blocked:false,blockageCause:"",eyePoint:e.clone(),lookDirection:s,fovDeg:85,obstructionDistance:Math.max(0.2,dw),fieldOfViewCoverage:sc};}
  private computeRightSideVisibility(e:THREE.Vector3):VisibilityCheck{const s=new THREE.Vector3(1,-0.05,-0.3).normalize();const da=1.36-this.seat.lateralMm/1000;const sc=Math.round(Math.max(0,Math.min(100,75+(1.36-da)*15)));return{id:"right_side",name:"Right Side Visibility",icon:"🪟",description:"Passenger window visibility",score:sc,blocked:false,blockageCause:"",eyePoint:e.clone(),lookDirection:s,fovDeg:70,obstructionDistance:Math.max(0.3,da),fieldOfViewCoverage:sc};}
  private computeRearVisibility(e:THREE.Vector3):VisibilityCheck{const r=new THREE.Vector3(0,0.05,1).normalize();const sc=Math.round(Math.max(0,Math.min(100,72+this.mirrors.rearviewPanDeg*0.3)));return{id:"rear",name:"Rear Visibility",icon:"🔙",description:"Rear window via mirror",score:sc,blocked:false,blockageCause:"",eyePoint:e.clone(),lookDirection:r,fovDeg:45,obstructionDistance:1.8,fieldOfViewCoverage:sc};}
  private computeInfotainmentReach(e:THREE.Vector3):VisibilityCheck{const sp=new THREE.Vector3(-0.32,0.68,-0.58);const d=e.distanceTo(sp)*1000;const ok=d>=480&&d<=720;const sc=Math.round(Math.max(0,Math.min(100,ok?90-Math.abs(d-600)*0.2:40)));return{id:"infotainment",name:"Infotainment Reach",icon:"📱",description:"Reach: "+Math.round(d)+"mm (optimal: 480-720mm)",score:sc,blocked:d>800,blockageCause:d>800?"Too far":"",eyePoint:e.clone(),lookDirection:sp.clone().sub(e).normalize(),fovDeg:30,obstructionDistance:d/1000,fieldOfViewCoverage:sc};}
  private computeBlindSpotCheck(e:THREE.Vector3):VisibilityCheck{const bsa=35+this.seat.reclineDeg*0.3;const w=80+(bsa-35)*2;const sc=Math.round(Math.max(0,Math.min(100,95-(bsa-35)*1.5)));return{id:"blind_spot",name:"A-Pillar Blind Spot",icon:"⚠️",description:"Angle: "+Math.round(bsa)+"deg, width: "+Math.round(w)+"mm",score:sc,blocked:bsa>42,blockageCause:bsa>42?"Excessive blind spot":"",eyePoint:e.clone(),lookDirection:new THREE.Vector3(-Math.sin(THREE.MathUtils.degToRad(bsa)),0,-Math.cos(THREE.MathUtils.degToRad(bsa))).normalize(),fovDeg:15,obstructionDistance:0.45,fieldOfViewCoverage:sc};}
  public getOverallErgonomicScore():number{if(!this._visibilityChecks.length)return 0;return Math.round(this._visibilityChecks.reduce((s,c)=>s+c.score,0)/this._visibilityChecks.length);}
  public getPedalReachGrade():string{const d=this.computePedalReachDistance();if(d>=750&&d<=900)return"OPTIMAL";if(d>=680&&d<=970)return"ACCEPTABLE";return d<680?"TOO CLOSE":"TOO FAR";}
  public getComfortZone(){return{eyePointRange:{min:new THREE.Vector3(-0.72,0.83,-0.48),max:new THREE.Vector3(-0.64,0.94,-0.20)},pedalReachRange:{minMm:680,maxMm:970},seatTrackRange:{minMm:-140,maxMm:140}};}
  public applyPreset(p:"5th_female"|"50th_male"|"95th_male"|"sport_driving"|"luxury_cruise"):void{switch(p){case"5th_female":this.seat={...DEFAULT_SEAT_CONFIG,foreAftMm:80,heightMm:30,reclineDeg:20};this.steering={...DEFAULT_STEERING_CONFIG,telescopingMm:40};this.pedals={...DEFAULT_PEDAL_CONFIG,reachMm:20};break;case"50th_male":this.seat={...DEFAULT_SEAT_CONFIG};this.steering={...DEFAULT_STEERING_CONFIG};this.pedals={...DEFAULT_PEDAL_CONFIG};break;case"95th_male":this.seat={...DEFAULT_SEAT_CONFIG,foreAftMm:-60,heightMm:-15,reclineDeg:25};this.steering={...DEFAULT_STEERING_CONFIG,telescopingMm:-30};this.pedals={...DEFAULT_PEDAL_CONFIG,reachMm:-15};break;case"sport_driving":this.seat={...DEFAULT_SEAT_CONFIG,foreAftMm:-30,heightMm:-10,reclineDeg:28};this.steering={...DEFAULT_STEERING_CONFIG,telescopingMm:-20,tiltDeg:-5};this.pedals={...DEFAULT_PEDAL_CONFIG,reachMm:-10};break;case"luxury_cruise":this.seat={...DEFAULT_SEAT_CONFIG,foreAftMm:30,heightMm:15,reclineDeg:26};this.steering={...DEFAULT_STEERING_CONFIG,telescopingMm:20,tiltDeg:5};this.pedals={...DEFAULT_PEDAL_CONFIG,reachMm:10};break;}this.recompute();}
  public reset():void{this.seat={...DEFAULT_SEAT_CONFIG};this.steering={...DEFAULT_STEERING_CONFIG};this.pedals={...DEFAULT_PEDAL_CONFIG};this.mirrors={...DEFAULT_MIRROR_CONFIG};this.recompute();}
}
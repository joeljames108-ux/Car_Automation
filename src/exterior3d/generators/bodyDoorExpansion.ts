// ====================================================================
// ADVANCED BODY & DOOR GLB SYSTEM
// ====================================================================
import * as THREE from "three";

function m(c: number, mn = 0.5, r = 0.3, o?: Partial<THREE.MeshPhysicalMaterialParameters>): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c), metalness: mn, roughness: r, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.2, ...o });
}

function aM(g: THREE.Group, geo: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0): THREE.Mesh {
  const me = new THREE.Mesh(geo, material);
  me.position.set(x, y, z);
  if (rx) me.rotation.x = rx; if (ry) me.rotation.y = ry; if (rz) me.rotation.z = rz;
  me.castShadow = true; me.receiveShadow = true;
  g.add(me); return me;
}

function cy(a: number, b: number, h: number, s = 16) { return new THREE.CylinderGeometry(a, b, h, s); }
function bx(w: number, h: number, d: number) { return new THREE.BoxGeometry(w, h, d); }
function sp(r: number, ws = 16, hs = 12) { return new THREE.SphereGeometry(r, ws, hs); }
function to(r: number, t: number, rs = 12, ts = 24) { return new THREE.TorusGeometry(r, t, rs, ts); }

// ===========================================================================
// 1. ADVANCED DOOR SYSTEM
// ===========================================================================
export function buildAdvancedDoorSystem(): THREE.Group {
  const g = new THREE.Group(); g.name = "Advanced_Door_System";
  const bodyMat = m(0x1a1a1a, 0.85, 0.12, { clearcoat: 1.0, clearcoatRoughness: 0.01, envMapIntensity: 2.0 });
  const carbonMat = m(0x0a0a0a, 0.9, 0.15, { clearcoat: 0.8 });
  const chromeMat = m(0xcccccc, 0.95, 0.05, { clearcoat: 1.0 });
  const rubberMat = m(0x111111, 0.05, 0.9);
  const glassMat = m(0x8899aa, 0.0, 0.01, { transmission: 0.9, transparent: true, opacity: 0.35, ior: 1.52, thickness: 0.004 });
  const aluMat = m(0x888888, 0.9, 0.3);

  for (const side of [-1, 1]) {
    const dg = new THREE.Group(); dg.name = "Door_" + (side > 0 ? "R" : "L");
    aM(dg, bx(1.0, 0.55, 0.06), bodyMat, 0, 0, side * 0.50);
    aM(dg, bx(0.95, 0.008, 0.005), chromeMat, 0, 0.08, side * 0.535);
    const hg = new THREE.Group(); hg.name = "Handle";
    aM(hg, bx(0.14, 0.035, 0.015), bodyMat, 0, 0, 0);
    aM(hg, bx(0.10, 0.015, 0.012), chromeMat, 0, 0, 0.008);
    aM(hg, bx(0.06, 0.003, 0.003), m(0xfbbf24, 0, 0.1, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0.8 }), 0, -0.012, 0.008);
    hg.position.set(0.22, 0.06, side * 0.538); dg.add(hg);
    for (let h = 0; h < 3; h++) {
      const hy = -0.20 + h * 0.22;
      aM(dg, cy(0.008, 0.008, 0.04, 12), m(0x666666, 0.9, 0.2), -0.46, hy, side * 0.48, 0, 0, Math.PI / 2);
      aM(dg, bx(0.04, 0.05, 0.004), m(0x666666, 0.9, 0.2), -0.445, hy, side * 0.48);
      aM(dg, bx(0.04, 0.05, 0.004), m(0x666666, 0.9, 0.2), -0.475, hy, side * 0.48);
      aM(dg, cy(0.003, 0.003, 0.05, 8), chromeMat, -0.46, hy, side * 0.48, 0, 0, Math.PI / 2);
      for (const bx2 of [-0.01, 0.01]) {
        for (const by2 of [-0.012, 0.012]) {
          aM(dg, cy(0.004, 0.004, 0.006, 6), m(0x444444, 0.9, 0.2), -0.445 + bx2, hy + by2, side * 0.485);
        }
      }
    }
    aM(dg, bx(0.04, 0.06, 0.03), m(0x555555, 0.85, 0.25), 0.46, 0, side * 0.48);
    aM(dg, to(0.012, 0.003, 8, 16), chromeMat, 0.48, 0, side * 0.48, 0, 0, Math.PI / 2);
    aM(dg, bx(0.85, 0.42, 0.015), m(0x1a1a1a, 0.05, 0.7), 0, 0, side * 0.44);
    aM(dg, bx(0.35, 0.04, 0.05), m(0x222222, 0.05, 0.6, { sheen: 0.4 }), 0.05, -0.04, side * 0.42);
    for (let s = 0; s < 4; s++) { aM(dg, bx(0.002, 0.035, 0.002), m(0xcccccc, 0.3, 0.5), -0.12 + s * 0.08, -0.04, side * 0.445); }
    const phPts = [new THREE.Vector3(-0.04, 0, 0), new THREE.Vector3(0, 0.015, 0), new THREE.Vector3(0.04, 0, 0)];
    aM(dg, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(phPts), 12, 0.005, 8, false), chromeMat, 0.15, 0.06, side * 0.42);
    aM(dg, bx(0.06, 0.04, 0.008), m(0x111111, 0.3, 0.4), 0.10, -0.02, side * 0.43);
    aM(dg, bx(0.025, 0.015, 0.004), m(0x333333, 0.4, 0.3), 0.10, -0.02, side * 0.44);
    aM(dg, sp(0.006, 10, 8), m(0x222222, 0.3, 0.5), 0.06, 0.02, side * 0.43);
    aM(dg, cy(0.045, 0.045, 0.012, 24), m(0x111111, 0.1, 0.8), -0.10, -0.12, side * 0.435, Math.PI / 2);
    for (let r = 0; r < 5; r++) { aM(dg, to(0.012 + r * 0.008, 0.001, 6, 20), m(0x333333, 0.6, 0.4), -0.10, -0.12, side * 0.442); }
    aM(dg, sp(0.008, 12, 8), m(0x888888, 0.7, 0.2), -0.10, -0.12, side * 0.442);
    aM(dg, bx(0.72, 0.28, 0.004), glassMat, 0, 0.28, side * 0.50);
    aM(dg, bx(0.008, 0.35, 0.006), aluMat, -0.35, 0.12, side * 0.47);
    const sPts = [new THREE.Vector3(-0.37, 0.14, side * 0.50), new THREE.Vector3(-0.37, 0.42, side * 0.50), new THREE.Vector3(0.37, 0.42, side * 0.50), new THREE.Vector3(0.37, 0.14, side * 0.50)];
    aM(dg, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sPts, true), 32, 0.004, 6, true), rubberMat);
    aM(dg, bx(0.50, 0.01, 0.04), m(0x222222, 0.3, 0.5), 0, -0.27, side * 0.48);
    aM(dg, bx(0.42, 0.003, 0.003), m(0xfbbf24, 0, 0.1, { emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 0.6 }), 0, -0.265, side * 0.49);
    aM(dg, bx(0.03, 0.02, 0.005), m(0xffffff, 0, 0.1, { emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.5 }), -0.30, -0.10, side * 0.43);
    g.add(dg);
  }
  return g;
}

// ===========================================================================
// 4. ADVANCED ROOF SYSTEM
// ===========================================================================
export function buildAdvancedRoofSystem(): THREE.Group {
  const g = new THREE.Group(); g.name = "Advanced_Roof";
  const bodyMat = m(0x1a1a1a, 0.85, 0.12, { clearcoat: 1.0 });
  const carbonMat = m(0x0a0a0a, 0.9, 0.15, { clearcoat: 0.8 });
  const rubberMat = m(0x111111, 0.05, 0.9);
  const glassMat = m(0x8899aa, 0.0, 0.01, { transmission: 0.92, transparent: true, opacity: 0.3, ior: 1.52 });
  aM(g, bx(1.20, 0.025, 0.90), bodyMat, -0.10, 0.54, 0);
  aM(g, bx(0.80, 0.005, 0.60), glassMat, -0.10, 0.555, 0);
  const gPts = [new THREE.Vector3(0.30,0.545,-0.30),new THREE.Vector3(0.30,0.545,0.30),new THREE.Vector3(-0.50,0.545,0.30),new THREE.Vector3(-0.50,0.545,-0.30)];
  aM(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gPts,true),32,0.004,6,true), rubberMat);
  for (const side of [-1,1]) {
    const rPts=[new THREE.Vector3(0.50,0.535,side*0.46),new THREE.Vector3(-0.70,0.535,side*0.46)];
    aM(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rPts),20,0.004,6,false), bodyMat);
  }
  for (const [dx,dz] of [[0.30,-0.30],[0.30,0.30],[-0.50,-0.30],[-0.50,0.30]]) {
    const dPts=[new THREE.Vector3(dx,0.54,dz),new THREE.Vector3(dx,0.50,dz+(dz>0?0.05:-0.05))];
    aM(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dPts),8,0.003,6,false), rubberMat);
  }
  const fPts2=[[0,0],[0.025,0.005],[0.022,0.02],[0.018,0.035],[0.012,0.045],[0.005,0.050],[0,0.052]].map(([r,y])=>new THREE.Vector2(r,y));
  aM(g, new THREE.LatheGeometry(fPts2,16), m(0x111111,0.4,0.3), -0.45, 0.545, 0);
  aM(g, bx(0.025,0.008,0.020), bodyMat, -0.45, 0.54, 0);
  aM(g, bx(1.10,0.005,0.015), m(0x222222,0.3,0.5), -0.10, 0.535, 0);
  for (const [bx2,bz] of [[0.20,-0.25],[0.20,0.25],[-0.40,-0.25],[-0.40,0.25]]) { aM(g, cy(0.005,0.005,0.008,8), m(0x555555,0.9,0.2), bx2, 0.530, bz); }
  return g; }
// ===========================================================================
// 5. ADVANCED BUMPER SYSTEM
// ===========================================================================
export function buildAdvancedBumperSystem(): THREE.Group {
  const g = new THREE.Group(); g.name = "Advanced_Bumpers";
  const bodyMat=m(0x1a1a1a,0.85,0.12,{clearcoat:1.0,clearcoatRoughness:0.01});
  const carbonMat=m(0x0a0a0a,0.9,0.15,{clearcoat:0.8});
  const chromeMat=m(0xcccccc,0.95,0.05);
  const rubberMat=m(0x111111,0.05,0.9);
  const aluMat=m(0x888888,0.9,0.3);
  // Front bumper
  aM(g,bx(0.20,0.18,1.00),bodyMat,1.20,0.10,0);
  aM(g,bx(0.02,0.08,0.50),m(0x111111,0.6,0.4),1.30,0.18,0);
  for(let s=0;s<5;s++){aM(g,bx(0.02,0.003,0.48),chromeMat,1.30,0.15+s*0.015,0);}
  aM(g,bx(0.03,0.06,0.60),m(0x0a0a0a,0.3,0.6),1.28,0.02,0);
  aM(g,bx(0.04,0.008,1.05),carbonMat,1.28,-0.02,0);
  for(const side of[-1,1]){aM(g,bx(0.03,0.04,0.008),carbonMat,1.28,0.0,side*0.52);}
  for(const side of[-1,1]){
    aM(g,bx(0.03,0.05,0.08),m(0x111111,0.3,0.5),1.30,0.05,side*0.38);
    aM(g,sp(0.02,12,8),m(0xffffff,0,0.05,{emissive:new THREE.Color(0xffffff),emissiveIntensity:0.3}),1.32,0.05,side*0.38);
    aM(g,to(0.025,0.003,8,16),chromeMat,1.315,0.05,side*0.38,0,Math.PI/2);
  }
  for(let i=0;i<4;i++){aM(g,cy(0.008,0.008,0.015,12),m(0x111111,0.2,0.5),1.31,0.10,-0.25+i*0.17,0,0,Math.PI/2);}
  aM(g,cy(0.015,0.015,0.008,16),bodyMat,1.31,0.05,-0.40,0,0,Math.PI/2);
  aM(g,bx(0.005,0.10,0.22),m(0x111111,0.3,0.5),1.32,0.05,0);
  // Rear bumper
  aM(g,bx(0.18,0.16,0.96),bodyMat,-1.12,0.08,0);
  aM(g,bx(0.06,0.06,0.80),carbonMat,-1.16,-0.01,0);
  for(let f=0;f<5;f++){aM(g,bx(0.05,0.008,0.005),carbonMat,-1.18,0.0,-0.30+f*0.15);}
  for(let i=0;i<4;i++){aM(g,cy(0.008,0.008,0.015,12),m(0x111111,0.2,0.5),-1.22,0.08,-0.25+i*0.17,0,0,Math.PI/2);}
  for(const side of[-1,1]){aM(g,bx(0.01,0.04,0.02),m(0xff0000,0.1,0.05,{emissive:new THREE.Color(0xff0000),emissiveIntensity:0.3}),-1.21,0.05,side*0.42);}
  return g; }
// ===========================================================================
// 6. ADVANCED SIDE MIRROR SYSTEM
// ===========================================================================
export function buildAdvancedSideMirrorSystem(): THREE.Group {
  const g=new THREE.Group();g.name="Advanced_Mirrors";
  const bodyMat=m(0x1a1a1a,0.85,0.12,{clearcoat:1.0,clearcoatRoughness:0.01});
  const carbonMat=m(0x0a0a0a,0.9,0.15,{clearcoat:0.8});
  const chromeMat=m(0xcccccc,0.95,0.05);
  const glassMat=m(0xaabbcc,0.99,0.01,{clearcoat:1.0,reflectivity:1.0});
  const amberMat=m(0xf59e0b,0,0.1,{emissive:new THREE.Color(0xf59e0b),emissiveIntensity:0.6});
  for(const side of[-1,1]){
    const mg=new THREE.Group();mg.name="Mirror_"+(side>0?"R":"L");
    aM(mg,bx(0.03,0.04,0.03),bodyMat,0,0,0);
    for(const[bx2,by]of[[0,0.012],[-0.008,-0.008],[0.008,-0.008]]){aM(mg,cy(0.003,0.003,0.006,6),chromeMat,bx2,by,0.016);}
    const sPts=[new THREE.Vector3(0,0,0),new THREE.Vector3(-0.02,0.02,side*0.04),new THREE.Vector3(-0.04,0.04,side*0.08)];
    aM(mg,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sPts),12,0.008,8,false),carbonMat);
    const hGeo=sp(0.065,16,12);var hMe=aM(mg,hGeo,carbonMat,-0.04,0.05,side*0.10);hMe.scale.set(1.5,0.65,0.85);
    aM(mg,bx(0.003,0.075,0.11),glassMat,-0.08,0.05,side*0.10);
    for(let l=0;l<6;l++){aM(mg,bx(0.001,0.001,0.09),m(0xff6600,0,0.5,{emissive:new THREE.Color(0xff3300),emissiveIntensity:0.2}),-0.082,0.02+l*0.01,side*0.10);}
    aM(mg,bx(0.05,0.008,0.015),amberMat,-0.02,0.05,side*0.13);
    aM(mg,cy(0.004,0.004,0.003,8),m(0x111111,0.2,0.5),-0.082,0.08,side*0.10);
    aM(mg,cy(0.012,0.012,0.02,12),m(0x222222,0.4,0.5),-0.02,0.03,side*0.06,Math.PI/2);
    aM(mg,cy(0.005,0.005,0.008,10),m(0x111111,0.3,0.4),-0.02,0.02,side*0.13,Math.PI/2);
    aM(mg,sp(0.004,8,6),m(0x222266,0.1,0.05),-0.025,0.02,side*0.13);
    mg.position.set(0.82,0.28,side*0.38);g.add(mg);}
  return g; }
// ===========================================================================
// 7. ADVANCED WIPER & WASH SYSTEM
// ===========================================================================
export function buildAdvancedWiperWashSystem(): THREE.Group {
  const g=new THREE.Group();g.name="Advanced_Wiper";
  const blackMat=m(0x111111,0.3,0.7);const chromeMat=m(0xcccccc,0.95,0.05);
  // Cowl panel
  aM(g,bx(0.08,0.02,0.90),m(0x111111,0.1,0.8),0.78,0.35,0);
  for(let v=0;v<12;v++){aM(g,bx(0.06,0.003,0.03),m(0x0a0a0a,0.3,0.6),0.78,0.362,-0.35+v*0.06);}
  for(const dz of[-0.40,0.40]){aM(g,cy(0.006,0.006,0.02,8),blackMat,0.78,0.345,dz);}
  // Driver wiper
  const dwg=new THREE.Group();dwg.name="Wiper_Driver";
  aM(dwg,cy(0.012,0.012,0.015,12),blackMat,0,0,0);
  aM(dwg,cy(0.008,0.008,0.008,12),chromeMat,0,0.012,0);
  const dwPts=[new THREE.Vector3(0,0.01,0),new THREE.Vector3(-0.10,0.02,0.10),new THREE.Vector3(-0.20,0.03,0.25),new THREE.Vector3(-0.25,0.035,0.35)];
  aM(dwg,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dwPts),16,0.004,6,false),blackMat);
  const dwB=[new THREE.Vector3(-0.10,0.02,0.12),new THREE.Vector3(-0.28,0.035,0.38)];
  aM(dwg,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dwB),10,0.002,4,false),m(0x050505,0.1,0.95));
  for(let cl=0;cl<4;cl++){var t=0.2+cl*0.2;aM(dwg,bx(0.002,0.008,0.003),blackMat,-0.10-0.18*t,0.025,0.12+0.26*t);}
  dwg.position.set(0.80,0.36,-0.10);g.add(dwg);
  // Passenger wiper
  const pwg=new THREE.Group();pwg.name="Wiper_Passenger";
  aM(pwg,cy(0.012,0.012,0.015,12),blackMat,0,0,0);
  const pwPts=[new THREE.Vector3(0,0.01,0),new THREE.Vector3(-0.05,0.015,-0.06),new THREE.Vector3(-0.12,0.02,-0.15),new THREE.Vector3(-0.18,0.025,-0.22)];
  aM(pwg,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pwPts),14,0.003,6,false),blackMat);
  const pwB=[new THREE.Vector3(-0.05,0.015,-0.06),new THREE.Vector3(-0.20,0.025,-0.24)];
  aM(pwg,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pwB),8,0.002,4,false),m(0x050505,0.1,0.95));
  pwg.position.set(0.80,0.36,0.15);g.add(pwg);
  // Washer nozzles
  for(const side of[-1,1]){aM(g,cy(0.004,0.003,0.008,8),blackMat,0.80,0.365,side*0.15);aM(g,sp(0.003,8,6),chromeMat,0.805,0.37,side*0.15);}
  // Wiper motor
  aM(g,bx(0.06,0.04,0.08),m(0x222222,0.4,0.5),0.82,0.33,-0.10);
  aM(g,bx(0.15,0.005,0.008),chromeMat,0.78,0.33,-0.10);
  return g; }
// ===========================================================================
// 8. ADVANCED BODY FRAME SYSTEM
// ===========================================================================
export function buildAdvancedBodyFrameSystem(): THREE.Group {
  const g=new THREE.Group();g.name="Advanced_Body_Frame";
  const steelMat=m(0x555555,0.9,0.35);const aluMat=m(0x888888,0.85,0.3);
  const rubberMat=m(0x111111,0.05,0.9);const sealMat=m(0x333333,0.1,0.8);
  // Front subframe rails
  for(const side of[-1,1]){
    var rPts=[new THREE.Vector3(1.00,-0.05,side*0.28),new THREE.Vector3(0.60,-0.08,side*0.26),new THREE.Vector3(0.20,-0.10,side*0.24)];
    aM(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rPts),20,0.02,8,false),steelMat);}
  // Rear subframe rails
  for(const side of[-1,1]){
    var rPts=[new THREE.Vector3(-0.20,-0.10,side*0.24),new THREE.Vector3(-0.60,-0.08,side*0.26),new THREE.Vector3(-0.95,-0.05,side*0.28)];
    aM(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rPts),20,0.02,8,false),steelMat);}
  // Floor pan
  aM(g,bx(1.80,0.008,0.50),aluMat,0,-0.14,0);
  for(let r=0;r<5;r++){aM(g,bx(1.70,0.004,0.006),steelMat,0,-0.135,-0.20+r*0.10);}
  for(let c2=0;c2<4;c2++){aM(g,bx(0.004,0.004,0.48),steelMat,-0.60+c2*0.40,-0.135,0);}
  // Transmission tunnel
  var tPts=[new THREE.Vector3(0.50,-0.08,0),new THREE.Vector3(0,-0.06,0),new THREE.Vector3(-0.50,-0.04,0)];
  var tMe=aM(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tPts),20,0.08,12,false),steelMat);tMe.scale.set(1,0.8,1.2);
  // Wheel well liners
  for(const side of[-1,1]){
    var fGeo=new THREE.SphereGeometry(0.30,16,12,0,Math.PI,0,Math.PI);var fMe=aM(g,fGeo,m(0x222222,0.05,0.8),0.55,-0.05,side*0.50);fMe.scale.set(1.2,0.8,0.6);
    var rGeo=new THREE.SphereGeometry(0.32,16,12,0,Math.PI,0,Math.PI);var rMe=aM(g,rGeo,m(0x222222,0.05,0.8),-0.72,-0.05,side*0.50);rMe.scale.set(1.3,0.85,0.6);}
  // Firewall
  aM(g,bx(0.015,0.35,0.65),steelMat,0.18,0.05,0);
  for(const[gy,gz]of[[0.10,-0.15],[0.05,0.10],[0.15,0.20],[0.00,-0.25]]){aM(g,cy(0.008,0.008,0.018,10),rubberMat,0.19,gy,gz,0,0,Math.PI/2);}
  aM(g,bx(0.005,0.25,0.50),sealMat,0.195,0.05,0);
  // Body mount bushings
  for(const[mx,mz]of[[0.40,-0.28],[0.40,0.28],[-0.40,-0.28],[-0.40,0.28],[0.80,-0.25],[0.80,0.25]]){
    aM(g,cy(0.015,0.015,0.025,12),rubberMat,mx,-0.12,mz);aM(g,cy(0.005,0.005,0.035,6),steelMat,mx,-0.12,mz);}
  // Weld seam sealer
  for(const side of[-1,1]){var sPts=[new THREE.Vector3(0.50,-0.13,side*0.25),new THREE.Vector3(0,-0.13,side*0.25),new THREE.Vector3(-0.50,-0.13,side*0.25)];
    aM(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sPts),20,0.003,4,false),sealMat);}
  return g; }

// ===========================================================================
// MASTER EXPORT
// ===========================================================================
export function buildAllBodyDoorSystems(): THREE.Group {
  const g = new THREE.Group(); g.name = "Complete_Body_Door_Expansion";
  g.add(buildAdvancedDoorSystem());
  g.add(buildAdvancedRoofSystem());
  g.add(buildAdvancedBumperSystem());
  g.add(buildAdvancedSideMirrorSystem());
  g.add(buildAdvancedWiperWashSystem());
  g.add(buildAdvancedBodyFrameSystem());
  return g;
}
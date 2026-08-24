// ============================================================================
// STRUCTURAL CHASSIS FRAME GLB GENERATOR & EXPORTER
// ============================================================================
// Generates purpose-built structural chassis GLB assets for the Car3D asset
// registry entries SPORTS_CHASSIS_01 and HATCHBACK_CHASSIS_01:
//
//   sports_car_chassis_01.glb  — Mid-engine hydroformed aluminum spaceframe
//                                with carbon monocoque tub, X-brace, roll
//                                hoops, shock towers and 36 hardpoint nodes.
//   hatchback_chassis_01.glb   — Front-engine transverse unibody platform
//                                with floorpan, tunnel, engine cradle, strut
//                                towers, firewall and rear torsion beam.
//
// Both exports carry README-convention MOUNT_* attachment empty-nodes so the
// physics attachment engine can snap components directly in 3D, and material
// names matching the registry bodyPaintMaterialNames heuristics
// ("frame/chassis/aluminum/tub" and "frame/unibody/floor").
//
// Coordinate standard: +X right (track), +Y up, +Z rearward, origin at ground
// center of wheelbase, 1 unit = 1 meter.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as fs from 'fs';
import * as path from 'path';
import { enhanceGlbBuffer } from '../loaders/glbPbrEnhancer';

if (typeof globalThis !== 'undefined' && typeof (globalThis as any).FileReader === 'undefined') {
  class NodeFileReader {
    result: ArrayBuffer | null = null;
    onloadend: (() => void) | null = null;
    async readAsArrayBuffer(blob: Blob) {
      this.result = await blob.arrayBuffer();
      if (this.onloadend) this.onloadend();
    }
  }
  // @ts-ignore
  globalThis.FileReader = NodeFileReader;
}

function namedMesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  name: string,
  x = 0,
  y = 0,
  z = 0
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  m.position.set(x, y, z);
  return m;
}

function mountNode(name: string, x: number, y: number, z: number): THREE.Object3D {
  const o = new THREE.Object3D();
  o.name = name;
  o.position.set(x, y, z);
  return o;
}

function addCommonMounts(parent: THREE.Group, cfg: {
  engineZ: number; engineHalfTrack: number; suspZf: number; suspZr: number;
  halfTrackSusp: number; dashZ: number; seatZ: number; aeroFrontZ: number; aeroRearZ: number;
}) {
  parent.add(mountNode('MOUNT_ENGINE_FL', -cfg.engineHalfTrack, 0.42, cfg.engineZ));
  parent.add(mountNode('MOUNT_ENGINE_FR', cfg.engineHalfTrack, 0.42, cfg.engineZ));
  parent.add(mountNode('MOUNT_TRANS_REAR', 0, 0.38, cfg.engineZ + 0.22));
  parent.add(mountNode('MOUNT_SUSP_FL', -cfg.halfTrackSusp, 0.28, cfg.suspZf));
  parent.add(mountNode('MOUNT_SUSP_FR', cfg.halfTrackSusp, 0.28, cfg.suspZf));
  parent.add(mountNode('MOUNT_SUSP_RL', -cfg.halfTrackSusp, 0.28, cfg.suspZr));
  parent.add(mountNode('MOUNT_SUSP_RR', cfg.halfTrackSusp, 0.28, cfg.suspZr));
  parent.add(mountNode('MOUNT_DASHBOARD', 0, 0.62, cfg.dashZ));
  parent.add(mountNode('MOUNT_STEERING', -0.36, 0.66, cfg.dashZ + 0.10));
  parent.add(mountNode('MOUNT_DRIVER_SEAT', -0.20, 0.34, cfg.seatZ));
  parent.add(mountNode('MOUNT_PASSENGER_SEAT', 0.20, 0.34, cfg.seatZ));
  parent.add(mountNode('MOUNT_CENTER_CONSOLE', 0, 0.34, cfg.seatZ));
  parent.add(mountNode('MOUNT_AERO_FRONT', 0, 0.24, cfg.aeroFrontZ));
  parent.add(mountNode('MOUNT_AERO_REAR', 0, 0.86, cfg.aeroRearZ));
}

/**
 * Sports car mid-engine aluminum spaceframe with carbon tub.
 */
export function buildSportsChassisScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Sports_Car_Spaceframe_Chassis_Scene';

  const root = new THREE.Group();
  root.name = 'Sports_Chassis_Master_Assembly';
  scene.add(root);

  const matAlu = new THREE.MeshStandardMaterial({
    name: 'Frame_Aluminum_Spaceframe_Tub',
    color: 0xb8c4d0,
    metalness: 0.82,
    roughness: 0.34,
  });

  const matCarbonTub = new THREE.MeshStandardMaterial({
    name: 'Chassis_Carbon_Monocoque_Tub_Structure',
    color: 0x1f2937,
    metalness: 0.42,
    roughness: 0.3,
  });

  const matHardpoint = new THREE.MeshStandardMaterial({
    name: 'Gold_Anodized_Hardpoint_Node',
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2,
  });

  const matCrash = new THREE.MeshStandardMaterial({
    name: 'Aluminum_Honeycomb_Crash_Structure',
    color: 0x94a3b8,
    metalness: 0.78,
    roughness: 0.42,
  });

  // ─── 1. CENTRAL CARBON MONOCOQUE TUB ───
  const tubGroup = new THREE.Group();
  tubGroup.name = 'Carbon_Monocoque_Tub';

  const tubProfile = new THREE.Shape();
  tubProfile.moveTo(-0.92, 0.10);
  tubProfile.lineTo(-1.00, 0.52);
  tubProfile.quadraticCurveTo(0.0, 0.60, 0.86, 0.50);
  tubProfile.lineTo(0.80, 0.10);
  tubProfile.closePath();

  const tubGeo = new THREE.ExtrudeGeometry(tubProfile, { depth: 0.70, bevelEnabled: false });
  tubGeo.rotateY(Math.PI / 2);
  const tubMesh = new THREE.Mesh(tubGeo, matCarbonTub);
  tubMesh.name = 'Monocoque_Tub_Core_Structure';
  tubMesh.position.x = -0.35;
  tubGroup.add(tubMesh);

  const cockpitRecess = namedMesh(new THREE.BoxGeometry(0.62, 0.05, 1.05), new THREE.MeshStandardMaterial({
    name: 'Tub_Interior_Floor_Ply',
    color: 0x111827,
    metalness: 0.3,
    roughness: 0.5,
  }), 'Cockpit_Floor_Recess_Pan', 0, 0.545, -0.05);
  tubGroup.add(cockpitRecess);

  root.add(tubGroup);

  // ─── 2. HYDROFORMED SPACEFRAME RAILS & HOOPS ───
  const frameGroup = new THREE.Group();
  frameGroup.name = 'Hydroformed_Aluminum_Spaceframe';

  const railRadius = 0.030;

  for (const sx of [-1, 1]) {
    const sillCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.66, 0.16, -1.55),
      new THREE.Vector3(sx * 0.64, 0.17, -0.90),
      new THREE.Vector3(sx * 0.63, 0.17, 0.85),
      new THREE.Vector3(sx * 0.66, 0.16, 1.60),
    ]);
    frameGroup.add(namedMesh(new THREE.TubeGeometry(sillCurve, 20, railRadius, 12), matAlu, `Door_Sill_Main_Rail_${sx < 0 ? 'LH' : 'RH'}`));

    const shoulderCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.44, 0.46, -1.45),
      new THREE.Vector3(sx * 0.56, 0.50, -0.85),
      new THREE.Vector3(sx * 0.55, 0.49, 0.80),
      new THREE.Vector3(sx * 0.40, 0.44, 1.35),
    ]);
    frameGroup.add(namedMesh(new THREE.TubeGeometry(shoulderCurve, 20, railRadius * 0.9, 12), matAlu, `Shoulder_Top_Rail_${sx < 0 ? 'LH' : 'RH'}`));

    for (let v = 0; v < 4; v++) {
      const vz = -1.35 + v * 0.72;
      const vertical = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx * 0.645, 0.17, vz),
        new THREE.Vector3(sx * 0.555, 0.48, vz * 0.97),
      ]);
      frameGroup.add(namedMesh(new THREE.TubeGeometry(vertical, 8, railRadius * 0.75, 10), matAlu, `Vertical_Bulkhead_Post_${sx < 0 ? 'LH' : 'RH'}_${v + 1}`));
    }
  }

  const windshieldArc = new THREE.EllipseCurve(0, 0, 0.58, 0.34, 0, Math.PI, false, 0);
  const wsPts = windshieldArc.getPoints(24).map((p) => new THREE.Vector3(p.x, 0.52 + p.y * 0.9, -0.78));
  frameGroup.add(namedMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wsPts), 24, railRadius * 0.85, 10), matAlu, 'Windshield_A_Pillar_Hoop'));

  for (const sx of [-1, 1]) {
    const hoopArc = new THREE.EllipseCurve(0, 0, 0.20, 0.36, 0, Math.PI, false, 0);
    const hoopPts = hoopArc.getPoints(22).map((p) => new THREE.Vector3(sx * 0.24 + p.x, 0.50 + p.y, 1.02));
    frameGroup.add(namedMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hoopPts), 22, railRadius * 0.8, 10), matAlu, `Roll_Hoop_Rear_Deck_${sx < 0 ? 'LH' : 'RH'}`));
  }

  const xBraceA = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.52, 0.30, 1.28), new THREE.Vector3(0.52, 0.30, 1.62)]);
  const xBraceB = new THREE.CatmullRomCurve3([new THREE.Vector3(0.52, 0.30, 1.28), new THREE.Vector3(-0.52, 0.30, 1.62)]);
  frameGroup.add(namedMesh(new THREE.TubeGeometry(xBraceA, 8, 0.022, 10), matAlu, 'Rear_X_Brace_Bar_A'));
  frameGroup.add(namedMesh(new THREE.TubeGeometry(xBraceB, 8, 0.022, 10), matAlu, 'Rear_X_Brace_Bar_B'));

  const torqueTube = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.40, -0.88),
    new THREE.Vector3(0, 0.36, -1.35),
  ]);
  frameGroup.add(namedMesh(new THREE.TubeGeometry(torqueTube, 8, 0.038, 14), matAlu, 'Torque_Tube_To_Front_Bulkhead'));

  const noseV = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.30, 0.30, -1.42),
    new THREE.Vector3(0, 0.24, -1.72),
  ]);
  const noseVR = noseV.clone();
  noseVR.points.forEach((p) => { p.x *= -1; });
  frameGroup.add(namedMesh(new THREE.TubeGeometry(noseV, 8, railRadius * 0.8, 10), matAlu, 'Nose_V_Converging_Rail_LH'));
  frameGroup.add(namedMesh(new THREE.TubeGeometry(noseVR, 8, railRadius * 0.8, 10), matAlu, 'Nose_V_Converging_Rail_RH'));

  root.add(frameGroup);

  // ─── 3. SHOCK TOWERS & SUSPENSION PICKUPS ───
  const towerGroup = new THREE.Group();
  towerGroup.name = 'Shock_Towers_And_Pickups';

  const towerSpots: Array<[number, number, string]> = [
    [-0.68, -1.34, 'FL'],
    [0.68, -1.34, 'FR'],
    [-0.70, 1.34, 'RL'],
    [0.70, 1.34, 'RR'],
  ];
  for (const [tx, tz, tag] of towerSpots) {
    const tower = namedMesh(new THREE.ConeGeometry(0.16, 0.30, 4), matAlu, `Shock_Tower_Pyramid_${tag}`, tx, 0.42, tz);
    tower.rotation.y = Math.PI / 4;
    towerGroup.add(tower);

    const topPlate = namedMesh(new THREE.CylinderGeometry(0.075, 0.075, 0.014, 20), matAlu, `Strut_Mount_Face_Plate_${tag}`, tx, 0.575, tz);
    towerGroup.add(topPlate);

    for (const dz of [-0.10, 0.10]) {
      const lug = namedMesh(new THREE.BoxGeometry(0.05, 0.06, 0.05), matAlu, `Wishbone_Pickup_Lug_${tag}_Z${dz > 0 ? 'R' : 'F'}`, tx * 0.82, 0.20, tz + dz);
      towerGroup.add(lug);
    }
  }

  root.add(towerGroup);

  // ─── 4. FLOOR GRID, CROSSMEMBERS & CRASH STRUCTURES ───
  const floorGroup = new THREE.Group();
  floorGroup.name = 'Floor_Grid_Crossmembers_Crash';

  for (let c = 0; c < 5; c++) {
    const cz = -1.15 + c * 0.58;
    floorGroup.add(namedMesh(new THREE.BoxGeometry(1.24, 0.035, 0.06), matAlu, `Floor_Transverse_Channel_${c + 1}`, 0, 0.135, cz));
  }

  for (const cz of [-1.52, 1.55]) {
    const crossGeo = new THREE.CylinderGeometry(0.026, 0.026, 1.30, 12);
    crossGeo.rotateZ(Math.PI / 2);
    floorGroup.add(namedMesh(crossGeo, matAlu, `Axle_Location_Crossmember_Z${cz.toFixed(2)}`, 0, 0.20, cz));
  }

  const frontCrash = namedMesh(new THREE.BoxGeometry(0.52, 0.18, 0.30), matCrash, 'Front_Honeycomb_Crash_Box', 0, 0.30, -1.78);
  floorGroup.add(frontCrash);
  const rearCrash = namedMesh(new THREE.BoxGeometry(0.60, 0.20, 0.26), matCrash, 'Rear_Honeycomb_Crash_Box', 0, 0.32, 1.76);
  floorGroup.add(rearCrash);

  for (const [hx, hz, ht] of [
    [0, -1.96, 'Front'],
    [0, 1.92, 'Rear'],
  ] as const) {
    const towHook = namedMesh(new THREE.TorusGeometry(0.035, 0.009, 10, 20), matHardpoint, `${ht}_Tow_Hook_Ring`, hx, 0.26, hz);
    towHook.rotation.x = Math.PI / 2;
    floorGroup.add(towHook);
  }

  root.add(floorGroup);

  // ─── 5. THIRTY-SIX STRUCTURAL HARDPOINT NODES ───
  const hpGroup = new THREE.Group();
  hpGroup.name = 'Structural_Hardpoint_Network';

  const hpGeoShared = new THREE.SphereGeometry(0.021, 14, 10);
  let hpIdx = 0;
  for (let row = 0; row < 6; row++) {
    const rz = -1.45 + row * 0.58;
    for (let col = 0; col < 6; col++) {
      hpIdx++;
      const cx = col === 0 || col === 5 ? (col === 0 ? -1 : 1) * 0.645 : (col - 2.5) * 0.155;
      const cy = col === 0 || col === 5 ? 0.175 : 0.135;
      hpGroup.add(namedMesh(hpGeoShared, matHardpoint, `Structural_Hardpoint_HP${hpIdx.toString().padStart(2, '0')}`, cx, cy, rz));
    }
  }

  root.add(hpGroup);

  addCommonMounts(root, {
    engineZ: 0.98,
    engineHalfTrack: 0.30,
    suspZf: -1.34,
    suspZr: 1.34,
    halfTrackSusp: 0.70,
    dashZ: -0.72,
    seatZ: -0.10,
    aeroFrontZ: -1.90,
    aeroRearZ: 1.62,
  });

  return scene;
}

/**
 * Hatchback front-engine transverse unibody platform.
 */
export function buildHatchbackChassisScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Hatchback_Unibody_Platform_Chassis_Scene';

  const root = new THREE.Group();
  root.name = 'Hatchback_Chassis_Master_Assembly';
  scene.add(root);

  const matUnibody = new THREE.MeshStandardMaterial({
    name: 'Frame_Unibody_Floor_Platform_Steel',
    color: 0x8a97a5,
    metalness: 0.74,
    roughness: 0.42,
  });

  const matSubframe = new THREE.MeshStandardMaterial({
    name: 'Chassis_Front_Subframe_Engine_Cradle',
    color: 0xa8b3c2,
    metalness: 0.80,
    roughness: 0.36,
  });

  const matSeamSealer = new THREE.MeshStandardMaterial({
    name: 'Body_Seam_Sealer_Black',
    color: 0x14181f,
    metalness: 0.2,
    roughness: 0.75,
  });

  // ─── 1. FLOOR PAN WITH TRANSMISSION TUNNEL ───
  const floorGroup = new THREE.Group();
  floorGroup.name = 'Floorpan_Platform';

  const panGeo = new THREE.BoxGeometry(1.44, 0.045, 3.05);
  const panMesh = namedMesh(panGeo, matUnibody, 'Unibody_Floorpan_Main_Platform', 0, 0.30, 0);
  floorGroup.add(panMesh);

  const tunnelGeo = new THREE.BoxGeometry(0.24, 0.16, 2.60);
  floorGroup.add(namedMesh(tunnelGeo, matUnibody, 'Transmission_Tunnel_Bridge', 0, 0.395, 0.05));

  for (const sx of [-1, 1]) {
    floorGroup.add(namedMesh(new THREE.BoxGeometry(0.16, 0.06, 1.30), matUnibody, `Seat_Rail_Reinforcement_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.42, 0.355, 0.35));
    floorGroup.add(namedMesh(new THREE.BoxGeometry(0.10, 0.115, 2.95), matUnibody, `Rocker_Box_Section_${sx < 0 ? 'LH' : 'RH'}`, sx * 0.735, 0.33, 0.02));
  }

  for (let c = 0; c < 6; c++) {
    const cz = -1.30 + c * 0.52;
    floorGroup.add(namedMesh(new THREE.BoxGeometry(1.40, 0.04, 0.07), matUnibody, `Floor_Crossmember_Press_Formed_${c + 1}`, 0, 0.272, cz));
  }

  root.add(floorGroup);

  // ─── 2. ENGINE CRADLE / FRONT SUBFRAME & STRUT TOWERS ───
  const cradleGroup = new THREE.Group();
  cradleGroup.name = 'Engine_Cradle_Front_Subframe';

  for (const sx of [-1, 1]) {
    const longi = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.52, 0.26, -1.95),
      new THREE.Vector3(sx * 0.54, 0.27, -1.30),
    ]);
    cradleGroup.add(namedMesh(new THREE.TubeGeometry(longi, 8, 0.028, 12), matSubframe, `Cradle_Longitudinal_${sx < 0 ? 'LH' : 'RH'}`));

    const tower = namedMesh(new THREE.SphereGeometry(0.11, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), matUnibody, `MacPherson_Strut_Tower_Dome_${sx < 0 ? 'FL' : 'FR'}`, sx * 0.60, 0.53, -1.22);
    cradleGroup.add(tower);
    cradleGroup.add(namedMesh(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 16), matSubframe, `Strut_Mount_Plate_${sx < 0 ? 'FL' : 'FR'}`, sx * 0.60, 0.535, -1.22));

    const turretLeg = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.60, 0.47, -1.22),
      new THREE.Vector3(sx * 0.66, 0.31, -1.24),
    ]);
    cradleGroup.add(namedMesh(new THREE.TubeGeometry(turretLeg, 6, 0.020, 10), matUnibody, `Strut_Turret_Gusset_${sx < 0 ? 'LH' : 'RH'}`));
  }

  const cradleCross = new THREE.CylinderGeometry(0.026, 0.026, 1.06, 14);
  cradleCross.rotateZ(Math.PI / 2);
  cradleGroup.add(namedMesh(cradleCross, matSubframe, 'Cradle_Front_Crossmember', 0, 0.255, -1.88));
  cradleGroup.add(namedMesh(cradleCross, matSubframe, 'Cradle_Rear_Crossmember', 0, 0.260, -1.34));

  for (const mx of [-0.30, 0.30]) {
    cradleGroup.add(namedMesh(new THREE.CylinderGeometry(0.036, 0.036, 0.05, 14), new THREE.MeshStandardMaterial({
      name: 'Cradle_Rubber_Isolator_Bush',
      color: 0x111111,
      metalness: 0,
      roughness: 0.9,
    }), `Cradle_Isolator_Bush_X${mx}`, mx, 0.26, -1.61));
  }

  root.add(cradleGroup);

  // ─── 3. FIREWALL, PILLARS & UPPER STRUCTURE STUBS ───
  const upperGroup = new THREE.Group();
  upperGroup.name = 'Firewall_Pillar_Structures';

  upperGroup.add(namedMesh(new THREE.BoxGeometry(1.42, 0.46, 0.05), matUnibody, 'Firewall_Bulkhead_Panel', 0, 0.56, -1.08));

  for (let r = 0; r < 4; r++) {
    const rib = namedMesh(new THREE.BoxGeometry(1.38, 0.030, 0.020), matSeamSealer, `Firewall_Stiffening_SWage_Rib_${r + 1}`, 0, 0.40 + r * 0.105, -1.102);
    rib.rotation.x = 0.06;
    upperGroup.add(rib);
  }

  const pillarSpots: Array<[number, number, number, string]> = [
    [-0.66, 0.62, -0.92, 'A_LH'],
    [0.66, 0.62, -0.92, 'A_RH'],
    [-0.70, 0.62, -0.10, 'B_LH'],
    [0.70, 0.62, -0.10, 'B_RH'],
    [-0.66, 0.62, 1.05, 'C_LH'],
    [0.66, 0.62, 1.05, 'C_RH'],
  ];
  for (const [px, py, pz, tag] of pillarSpots) {
    upperGroup.add(namedMesh(new THREE.BoxGeometry(0.085, 0.55, 0.10), matUnibody, `Roof_Side_Rail_Pillar_${tag}_Stub`, px, py + 0.20, pz));
  }

  upperGroup.add(namedMesh(new THREE.BoxGeometry(1.38, 0.06, 0.09), matUnibody, 'Rear_Seat_Back_Crossmember', 0, 0.62, 0.72));
  upperGroup.add(namedMesh(new THREE.BoxGeometry(1.40, 0.05, 0.10), matUnibody, 'Parcel_Shelf_Forward_Header', 0, 0.66, 1.18));

  root.add(upperGroup);

  // ─── 4. REAR TORSION BEAM AXLE & TRAILING ARMS ───
  const beamGroup = new THREE.Group();
  beamGroup.name = 'Rear_Torsion_Beam_Axle';

  const beamGeo = new THREE.CylinderGeometry(0.042, 0.042, 1.18, 18);
  beamGeo.rotateZ(Math.PI / 2);
  beamGroup.add(namedMesh(beamGeo, matUnibody, 'TorsionBeam_Main_CrossTube', 0, 0.235, 1.32));

  for (const sx of [-1, 1]) {
    const arm = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.59, 0.235, 1.32),
      new THREE.Vector3(sx * 0.62, 0.245, 0.86),
    ]);
    beamGroup.add(namedMesh(new THREE.TubeGeometry(arm, 8, 0.026, 12), matUnibody, `Trailing_Arm_${sx < 0 ? 'RL' : 'RR'}`));

    beamGroup.add(namedMesh(new THREE.CylinderGeometry(0.052, 0.052, 0.05, 16), matSubframe, `Stub_Axle_Flange_${sx < 0 ? 'RL' : 'RR'}`, sx * 0.615, 0.235, 1.32));

    beamGroup.add(namedMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.020, 16), matSeamSealer, `Coil_Spring_Seat_${sx < 0 ? 'RL' : 'RR'}`, sx * 0.60, 0.29, 1.10));
  }

  beamGroup.add(namedMesh(new THREE.BoxGeometry(0.16, 0.05, 0.06), matUnibody, 'AntiRoll_Bar_Bracket_Plate', 0, 0.235, 1.32));

  root.add(beamGroup);

  addCommonMounts(root, {
    engineZ: -1.55,
    engineHalfTrack: 0.34,
    suspZf: -1.22,
    suspZr: 1.32,
    halfTrackSusp: 0.62,
    dashZ: -1.00,
    seatZ: 0.30,
    aeroFrontZ: -2.00,
    aeroRearZ: 1.55,
  });

  return scene;
}

/**
 * Exports both chassis frames to their registry asset paths.
 */
export async function generateChassisFrameGlbs(
  outputDir: string = 'public/models/chassis'
): Promise<{ filename: string; bytes: number }[]> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const exporter = new GLTFExporter();
  const results: { filename: string; bytes: number }[] = [];

  const jobs: Array<[string, THREE.Scene]> = [
    ['sports_car_chassis_01.glb', buildSportsChassisScene()],
    ['hatchback_chassis_01.glb', buildHatchbackChassisScene()],
  ];

  for (const [filename, scene] of jobs) {
    let meshCount = 0;
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshCount++;
    });
    console.log(`[Chassis GLB] Building ${filename} (${meshCount} detail nodes)...`);

    const raw = await new Promise<ArrayBuffer>((resolve, reject) => {
      exporter.parse(
        scene,
        (gltf) => resolve(gltf as ArrayBuffer),
        (err) => reject(err),
        { binary: true }
      );
    });

    const enhanced = await enhanceGlbBuffer(Buffer.from(raw));
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, enhanced);
    results.push({ filename, bytes: enhanced.byteLength });
    console.log(`  ✅ ${filePath} (${(enhanced.byteLength / 1024).toFixed(1)} KB)`);
  }

  return results;
}

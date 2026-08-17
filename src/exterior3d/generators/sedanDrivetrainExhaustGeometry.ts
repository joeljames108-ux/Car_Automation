// ===================================================================
// SEDAN DRIVETRAIN & EXHAUST SYSTEM 3D GEOMETRY GENERATOR
// ===================================================================
// Procedurally constructs the internal mechanical drivetrain and exhaust
// routing as seen in the AutoVoB executive sedan chassis architecture:
// - Longitudinal engine block casting with accessory pulleys & intake
// - 8-speed automatic transmission casing in the firewall bellhousing pocket
// - Two-piece prop-shaft with center carrier bearing & rear differential
// - Dual stainless steel exhaust pipes with catalytic converters & rear muffler
// ===================================================================

import * as THREE from "three";
import type { ExteriorEngineeringConfig } from "../../sim/types/exterior";
import { getSedanChassisMaterials } from "../materials/sedanMetallurgyShaders";

export function generateSedanDrivetrainExhaust3DGeometry(
  config?: Partial<ExteriorEngineeringConfig>
): THREE.Group {
  const masterGroup = new THREE.Group();
  masterGroup.name = "Sedan_Drivetrain_Exhaust_Assembly";

  const materials = getSedanChassisMaterials();
  const wb = (config?.wheelbase || 2850) / 1000;
  const halfWb = wb / 2;
  const floorHeight = 0.22;

  // =================================================================
  // 1. LONGITUDINAL ENGINE BLOCK & ACCESSORIES (FRONT ENGINE BAY)
  // =================================================================
  const engineGroup = new THREE.Group();
  engineGroup.name = "Longitudinal_Engine_Assembly";

  // Main Cylinder Block Casting
  const blockGeo = new THREE.BoxGeometry(0.58, 0.42, 0.38);
  const block = new THREE.Mesh(blockGeo, materials.castIronEngine);
  block.position.set(halfWb * 0.62, floorHeight + 0.32, 0);
  block.castShadow = true;
  engineGroup.add(block);

  // Cylinder Head Valve Cover
  const headCoverGeo = new THREE.BoxGeometry(0.54, 0.12, 0.34);
  const headCover = new THREE.Mesh(headCoverGeo, materials.stampedAlloyDark);
  headCover.position.set(halfWb * 0.62, floorHeight + 0.58, 0);
  engineGroup.add(headCover);

  // Front Serpentine Belt Accessory Pulleys
  const crankPulleyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 24);
  const crankPulley = new THREE.Mesh(crankPulleyGeo, materials.machinedAlloy);
  crankPulley.rotation.z = Math.PI / 2;
  crankPulley.position.set(halfWb * 0.62 + 0.31, floorHeight + 0.24, 0);
  engineGroup.add(crankPulley);

  const altPulleyGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16);
  const altPulley = new THREE.Mesh(altPulleyGeo, materials.machinedAlloy);
  altPulley.rotation.z = Math.PI / 2;
  altPulley.position.set(halfWb * 0.62 + 0.31, floorHeight + 0.42, 0.14);
  engineGroup.add(altPulley);

  masterGroup.add(engineGroup);

  // =================================================================
  // 2. LONGITUDINAL TRANSMISSION CASING & PROPELLERSHAFT
  // =================================================================
  const transGroup = new THREE.Group();
  transGroup.name = "Transmission_Driveline_Assembly";

  // Bellhousing Cone (Mating to Engine & Firewall Pocket)
  const bellhousingGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.28, 24);
  const bellhousing = new THREE.Mesh(bellhousingGeo, materials.stampedAlloyDark);
  bellhousing.rotation.z = Math.PI / 2;
  bellhousing.position.set(halfWb * 0.62 - 0.42, floorHeight + 0.28, 0);
  transGroup.add(bellhousing);

  // Transmission Main Gearbox Case
  const transCaseGeo = new THREE.BoxGeometry(0.48, 0.24, 0.26);
  const transCase = new THREE.Mesh(transCaseGeo, materials.castIronEngine);
  transCase.position.set(halfWb * 0.62 - 0.78, floorHeight + 0.24, 0);
  transCase.castShadow = true;
  transGroup.add(transCase);

  // Longitudinal Propeller Shaft (Routed through floor tunnel)
  const propShaftLength = wb * 0.55;
  const propShaftGeo = new THREE.CylinderGeometry(0.035, 0.035, propShaftLength, 16);
  const propShaft = new THREE.Mesh(propShaftGeo, materials.machinedAlloy);
  propShaft.rotation.z = Math.PI / 2;
  propShaft.position.set(-halfWb * 0.22, floorHeight + 0.18, 0);
  transGroup.add(propShaft);

  // Center Carrier Support Bearing
  const centerBearingGeo = new THREE.TorusGeometry(0.06, 0.02, 12, 24);
  const centerBearing = new THREE.Mesh(centerBearingGeo, materials.rubberMatte);
  centerBearing.rotation.y = Math.PI / 2;
  centerBearing.position.set(-halfWb * 0.22, floorHeight + 0.18, 0);
  transGroup.add(centerBearing);

  // Rear Differential Housing Casing
  const diffGeo = new THREE.SphereGeometry(0.16, 24, 16);
  const diffMesh = new THREE.Mesh(diffGeo, materials.castIronEngine);
  diffMesh.position.set(-halfWb * 0.98, floorHeight + 0.18, 0);
  diffMesh.castShadow = true;
  transGroup.add(diffMesh);

  // Rear Axle Half-Shafts (LH & RH to Hubs)
  const halfShaftGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.55, 12);
  
  const leftHalfShaft = new THREE.Mesh(halfShaftGeo, materials.machinedAlloy);
  leftHalfShaft.rotation.x = Math.PI / 2;
  leftHalfShaft.position.set(-halfWb * 0.98, floorHeight + 0.18, 0.42);
  transGroup.add(leftHalfShaft);

  const rightHalfShaft = new THREE.Mesh(halfShaftGeo, materials.machinedAlloy);
  rightHalfShaft.rotation.x = Math.PI / 2;
  rightHalfShaft.position.set(-halfWb * 0.98, floorHeight + 0.18, -0.42);
  transGroup.add(rightHalfShaft);

  masterGroup.add(transGroup);

  // =================================================================
  // 3. DUAL STAINLESS STEEL EXHAUST PIPES & MUFFLERS
  // =================================================================
  const exhaustGroup = new THREE.Group();
  exhaustGroup.name = "Exhaust_Routing_Assembly";

  // Downpipes from Engine Bay
  const downpipeGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.65, 16);
  const downpipe = new THREE.Mesh(downpipeGeo, materials.exhaustStainless);
  downpipe.position.set(halfWb * 0.45, floorHeight + 0.22, 0.12);
  downpipe.rotation.z = -0.45;
  exhaustGroup.add(downpipe);

  // Dual Catalytic Converters
  const catGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.28, 16);
  const catMesh = new THREE.Mesh(catGeo, materials.exhaustStainless);
  catMesh.rotation.z = Math.PI / 2;
  catMesh.position.set(halfWb * 0.15, floorHeight + 0.12, 0.12);
  exhaustGroup.add(catMesh);

  // Mid-Pipe Running in Exhaust Tunnel
  const midPipeGeo = new THREE.CylinderGeometry(0.032, 0.032, wb * 0.68, 16);
  const midPipe = new THREE.Mesh(midPipeGeo, materials.exhaustStainless);
  midPipe.rotation.z = Math.PI / 2;
  midPipe.position.set(-halfWb * 0.35, floorHeight + 0.09, 0.10);
  exhaustGroup.add(midPipe);

  // Center Resonator Box
  const resonatorGeo = new THREE.BoxGeometry(0.38, 0.10, 0.22);
  const resonator = new THREE.Mesh(resonatorGeo, materials.exhaustStainless);
  resonator.position.set(-halfWb * 0.48, floorHeight + 0.09, 0.10);
  exhaustGroup.add(resonator);

  // Rear Transverse Muffler Silencer
  const mufflerGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.72, 24);
  const muffler = new THREE.Mesh(mufflerGeo, materials.exhaustStainless);
  muffler.rotation.x = Math.PI / 2;
  muffler.position.set(-halfWb * 1.38, floorHeight + 0.18, 0);
  muffler.castShadow = true;
  exhaustGroup.add(muffler);

  // Dual Polished Exhaust Tailpipes (LH & RH)
  const tipGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.22, 24, 1, true);
  
  const leftTip = new THREE.Mesh(tipGeo, materials.machinedAlloy);
  leftTip.rotation.z = Math.PI / 2;
  leftTip.position.set(-halfWb * 1.54, floorHeight + 0.16, 0.38);
  exhaustGroup.add(leftTip);

  const rightTip = new THREE.Mesh(tipGeo, materials.machinedAlloy);
  rightTip.rotation.z = Math.PI / 2;
  rightTip.position.set(-halfWb * 1.54, floorHeight + 0.16, -0.38);
  exhaustGroup.add(rightTip);

  masterGroup.add(exhaustGroup);

  return masterGroup;
}

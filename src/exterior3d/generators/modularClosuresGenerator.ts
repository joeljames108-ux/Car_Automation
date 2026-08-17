// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — CLOSURES & BODY PANELS 3D GENERATOR
// ============================================================================
// Procedurally generates exterior body panels, doors, hood, trunk, fenders,
// bumpers, and roof skin matching the active vehicle body type and wheelbase.
// ============================================================================

import * as THREE from 'three';
import { VehicleBodyType } from '../types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';

export class ModularClosuresGenerator {
  public static buildClosures(
    bodyType: VehicleBodyType,
    wheelbaseMm: number,
    trackWidthMm: number,
    materialGrade: MaterialGrade = 'forged',
    isXRay: boolean = false
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `Closures_${bodyType}`;

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;

    const paintMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materialGrade === 'titanium' ? '#111827' : '#0284c7'), // Deep carbon or vibrant blue
      metalness: materialGrade === 'cast' ? 0.4 : 0.85,
      roughness: materialGrade === 'cast' ? 0.4 : 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      transparent: isXRay,
      opacity: isXRay ? 0.25 : 1.0,
    });

    // 1. Hood / Bonnet
    const hoodGeo = new THREE.BoxGeometry(0.88, 0.03, halfTrM * 1.5);
    const hood = new THREE.Mesh(hoodGeo, paintMaterial);
    hood.position.set(0.35, 0.58, 0);
    hood.rotation.z = -0.05;
    group.add(hood);

    // 2. Front Left & Right Fenders
    const fenderGeo = new THREE.BoxGeometry(0.9, 0.35, 0.08);
    const fenderL = new THREE.Mesh(fenderGeo, paintMaterial);
    fenderL.position.set(0.35, 0.42, -halfTrM * 0.9);
    const fenderR = fenderL.clone();
    fenderR.position.z = halfTrM * 0.9;
    group.add(fenderL, fenderR);

    // 3. Front Bumper Fascia & Grille
    const frontBumperGeo = new THREE.BoxGeometry(0.24, 0.38, halfTrM * 1.85);
    const frontBumper = new THREE.Mesh(frontBumperGeo, paintMaterial);
    frontBumper.position.set(0.92, 0.32, 0);
    group.add(frontBumper);

    // 4. Doors (Front Left & Right)
    const doorGeo = new THREE.BoxGeometry(wbM * 0.45, 0.52, 0.06);
    const doorL = new THREE.Mesh(doorGeo, paintMaterial);
    doorL.position.set(-wbM * 0.3, 0.48, -halfTrM * 0.88);
    const doorR = doorL.clone();
    doorR.position.z = halfTrM * 0.88;
    group.add(doorL, doorR);

    // 5. Rear Quarter Panels (Left & Right)
    const qtrGeo = new THREE.BoxGeometry(wbM * 0.55, 0.48, 0.08);
    const qtrL = new THREE.Mesh(qtrGeo, paintMaterial);
    qtrL.position.set(-wbM * 0.82, 0.5, -halfTrM * 0.9);
    const qtrR = qtrL.clone();
    qtrR.position.z = halfTrM * 0.9;
    group.add(qtrL, qtrR);

    // 6. Roof Panel
    if (bodyType !== 'convertible') {
      const roofLength = bodyType === 'wagon' ? wbM * 0.75 : wbM * 0.55;
      const roofGeo = new THREE.BoxGeometry(roofLength, 0.03, halfTrM * 1.35);
      const roof = new THREE.Mesh(roofGeo, paintMaterial);
      roof.position.set(-wbM * 0.48, 0.98, 0);
      group.add(roof);
    }

    // 7. Trunk Lid / Tailgate
    const trunkGeo = new THREE.BoxGeometry(0.55, 0.03, halfTrM * 1.4);
    const trunk = new THREE.Mesh(trunkGeo, paintMaterial);
    trunk.position.set(-wbM - 0.28, 0.65, 0);
    trunk.rotation.z = 0.08;
    group.add(trunk);

    // 8. Rear Bumper Fascia
    const rearBumperGeo = new THREE.BoxGeometry(0.24, 0.36, halfTrM * 1.85);
    const rearBumper = new THREE.Mesh(rearBumperGeo, paintMaterial);
    rearBumper.position.set(-wbM - 0.62, 0.34, 0);
    group.add(rearBumper);

    return group;
  }
}

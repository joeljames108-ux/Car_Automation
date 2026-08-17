// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 CENTRAL VALLEY & KNOCK SENSOR SYSTEM
// ============================================================================
// Solid-modeling generator for the central 60° V-valley floor casting, sloped
// gravity oil drainage troughs, crankcase oil mist separation baffles, dual
// tuned piezoelectric knock sensor mounting bosses, and PCV breather ports.
// ============================================================================

import * as THREE from 'three';
import type { V12BlockMaterialPalette } from '../engineBlockGenerator';

// ============================================================================
// 1. CENTRAL VALLEY SPECIFICATION CONSTANTS
// ============================================================================

export interface ValleyScavengeSpec {
  valleyLengthMm: number; // 630.0 mm central valley floor length
  valleyLengthM: number; // 0.630 m
  valleyWidthMm: number; // 142.0 mm central valley floor width
  valleyWidthM: number; // 0.142 m
  knockSensorCount: number; // 2 resonant piezoelectric knock sensors
  knockSensorFreqKhz: number; // 6.2 kHz resonance frequency
  knockBossDiameterMm: number; // 28.0 mm machined resonance boss
  knockBossRadiusM: number; // 0.014 m
  drainPortCount: number; // 4 gravity oil drainback ports
  drainPortDiameterMm: number; // 18.0 mm
  drainPortRadiusM: number; // 0.009 m
  breatherPortDiameterMm: number; // 24.0 mm crankcase ventilation ports
  breatherPortRadiusM: number; // 0.012 m
}

export const V12_VALLEY_SPECS: ValleyScavengeSpec = {
  valleyLengthMm: 630.0,
  valleyLengthM: 0.630,
  valleyWidthMm: 142.0,
  valleyWidthM: 0.142,
  knockSensorCount: 2,
  knockSensorFreqKhz: 6.2,
  knockBossDiameterMm: 28.0,
  knockBossRadiusM: 0.014,
  drainPortCount: 4,
  drainPortDiameterMm: 18.0,
  drainPortRadiusM: 0.009,
  breatherPortDiameterMm: 24.0,
  breatherPortRadiusM: 0.012,
};

// ============================================================================
// 2. MASTER CENTRAL VALLEY ASSEMBLY BUILDER
// ============================================================================

/**
 * Builds the complete 60° central V-valley floor, scavenge troughs, and knock sensors.
 */
export function buildV12ValleyScavengeSystem(
  materials: V12BlockMaterialPalette
): THREE.Group {
  const group = new THREE.Group();
  group.name = '07_V12_Central_Valley_Scavenge_Assembly';
  const spec = V12_VALLEY_SPECS;

  group.position.set(0, 0, 0.24);

  // ── A. Deep 60° V-Valley Floor Casting Bedplate ──
  const valleyFloorGeo = new THREE.BoxGeometry(
    spec.valleyLengthM,
    spec.valleyWidthM,
    0.052
  );
  const valleyFloorMesh = new THREE.Mesh(valleyFloorGeo, materials.castAluminumBlock);
  valleyFloorMesh.name = 'Central_Valley_Floor_Casting';
  valleyFloorMesh.position.set(0, 0, 0);
  valleyFloorMesh.castShadow = true;
  valleyFloorMesh.receiveShadow = true;
  group.add(valleyFloorMesh);

  // ── B. Sloped Longitudinal Oil Drainage Trough ──
  const troughGeo = new THREE.CylinderGeometry(0.045, 0.045, spec.valleyLengthM - 0.04, 24, 1, false, 0, Math.PI);
  troughGeo.rotateZ(Math.PI / 2);
  troughGeo.rotateX(Math.PI);
  const troughMesh = new THREE.Mesh(troughGeo, materials.machinedDeckSurface);
  troughMesh.name = 'Valley_Oil_Drainage_Trough';
  troughMesh.position.set(0, 0, 0.022);
  troughMesh.castShadow = true;
  group.add(troughMesh);

  // ── C. 4 Central Oil Drainback Return Galleys ──
  const drainGeo = new THREE.CylinderGeometry(
    spec.drainPortRadiusM,
    spec.drainPortRadiusM,
    0.065,
    16
  );

  for (let i = 0; i < spec.drainPortCount; i++) {
    const dx = -0.22 + i * 0.15;
    const drainMesh = new THREE.Mesh(drainGeo, materials.oilGalleryPassage);
    drainMesh.name = `Valley_Drainback_Port_${i + 1}`;
    drainMesh.position.set(dx, 0, -0.015);
    group.add(drainMesh);
  }

  // ── D. Dual Tuned Piezoelectric Knock Sensor Resonance Bosses ──
  const knockBossGeo = new THREE.CylinderGeometry(
    spec.knockBossRadiusM,
    spec.knockBossRadiusM,
    0.026,
    20
  );

  const knockThreadGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.032, 12);

  [-0.14, 0.14].forEach((kx, kIdx) => {
    const knockGroup = new THREE.Group();
    knockGroup.name = `Knock_Sensor_Assembly_${kIdx + 1}`;
    knockGroup.position.set(kx, 0, 0.028);

    // 1. Machined Flat Resonance Pad
    const bossMesh = new THREE.Mesh(knockBossGeo, materials.machinedDeckSurface);
    bossMesh.name = `Knock_Sensor_Boss_${kIdx + 1}`;
    bossMesh.castShadow = true;
    knockGroup.add(bossMesh);

    // 2. Center M8 Stud Thread Hole
    const threadMesh = new THREE.Mesh(knockThreadGeo, materials.oilGalleryPassage);
    threadMesh.position.set(0, 0, 0.004);
    knockGroup.add(threadMesh);

    // 3. Sensor Wiring Harness Clamp Boss
    const clampGeo = new THREE.BoxGeometry(0.008, 0.018, 0.012);
    const clampMesh = new THREE.Mesh(clampGeo, materials.arpHardenedFastener);
    clampMesh.position.set(0, 0.022, 0.004);
    knockGroup.add(clampMesh);

    group.add(knockGroup);
  });

  // ── E. Dual Crankcase PCV Breather Chimney Ports ──
  const breatherGeo = new THREE.CylinderGeometry(
    spec.breatherPortRadiusM,
    spec.breatherPortRadiusM,
    0.035,
    20
  );

  [-0.24, 0.24].forEach((bx, bIdx) => {
    const breatherMesh = new THREE.Mesh(breatherGeo, materials.machinedDeckSurface);
    breatherMesh.name = `PCV_Breather_Chimney_${bIdx === 0 ? 'Front' : 'Rear'}`;
    breatherMesh.position.set(bx, 0, 0.032);
    breatherMesh.castShadow = true;
    group.add(breatherMesh);
  });

  return group;
}

export default buildV12ValleyScavengeSystem;

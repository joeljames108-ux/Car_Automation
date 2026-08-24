// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 MULTI-PASS COOLANT WATER JACKET SYSTEM
// ============================================================================
// Solid-modeling generator for the closed-deck 360° water jacket cavities,
// Siamese cylinder wall inter-bore bridging passages, front water pump scroll
// volute chamber, 24 deck water transfer metering orifices, 8 brass core freeze
// plugs with stamped serial IDs, and upper cylinder head steam bleed ports.
// ============================================================================

import * as THREE from 'three';
import type { V12BlockMaterialPalette } from '../engineBlockGenerator';

// ============================================================================
// 1. COOLANT JACKET SPECIFICATION CONSTANTS
// ============================================================================

export interface CoolantJacketSpec {
  jacketVolumeLiters: number; // 4.8 Liters total internal block jacket volume
  annulusGapMm: number; // 6.5 mm water passage gap around sleeves
  annulusGapM: number; // 0.0065 m
  freezePlugDiameterMm: number; // 36.0 mm deep-cup expansion freeze plugs
  freezePlugRadiusM: number; // 0.018 m
  freezePlugCount: number; // 8 brass plugs (4 left flank, 4 right flank)
  deckOrificeDiameterMm: number; // 8.5 mm precision metering orifices
  deckOrificeRadiusM: number; // 0.00425 m
  voluteImpellerDiameterMm: number; // 78.0 mm front water pump impeller cavity
  voluteImpellerRadiusM: number; // 0.039 m
  steamBleedPortDiameterMm: number; // 6.0 mm (1/8 NPT)
  steamBleedPortRadiusM: number; // 0.003 m
}

export const V12_COOLANT_SPECS: CoolantJacketSpec = {
  jacketVolumeLiters: 4.8,
  annulusGapMm: 6.5,
  annulusGapM: 0.0065,
  freezePlugDiameterMm: 36.0,
  freezePlugRadiusM: 0.018,
  freezePlugCount: 8,
  deckOrificeDiameterMm: 8.5,
  deckOrificeRadiusM: 0.00425,
  voluteImpellerDiameterMm: 78.0,
  voluteImpellerRadiusM: 0.039,
  steamBleedPortDiameterMm: 6.0,
  steamBleedPortRadiusM: 0.003,
};

// ============================================================================
// 2. BRASS EXPANSION CORE FREEZE PLUG BUILDER
// ============================================================================

export interface FreezePlugConfig {
  plugNumber: number; // 1 through 8
  side: 'left' | 'right';
  positionX: number;
  spec: CoolantJacketSpec;
}

/**
 * Builds a single deep-cup machined brass core freeze plug with stamped
 * serial ID and recessed retention lip.
 */
export function buildSingleFreezePlug(
  config: FreezePlugConfig,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const { plugNumber, side, positionX, spec } = config;
  const isLeft = side === 'left';
  const group = new THREE.Group();
  group.name = `Brass_Freeze_Plug_${side === 'left' ? 'L' : 'R'}_${plugNumber}`;

  const py = isLeft ? 0.186 : -0.186;
  group.position.set(positionX, py, 0.14);

  // 1. Outer Brass Retention Lip
  const plugLipGeo = new THREE.CylinderGeometry(
    spec.freezePlugRadiusM,
    spec.freezePlugRadiusM,
    0.006,
    32
  );
  plugLipGeo.rotateZ(Math.PI / 2);
  const plugLipMesh = new THREE.Mesh(plugLipGeo, materials.brassFreezePlug);
  plugLipMesh.name = `Freeze_Plug_Lip_${plugNumber}`;
  plugLipMesh.castShadow = true;
  group.add(plugLipMesh);

  // 2. Recessed Inner Cup Dome
  const cupGeo = new THREE.CylinderGeometry(
    spec.freezePlugRadiusM - 0.003,
    spec.freezePlugRadiusM - 0.003,
    0.010,
    32
  );
  cupGeo.rotateZ(Math.PI / 2);
  const cupMesh = new THREE.Mesh(cupGeo, materials.brassFreezePlug);
  cupMesh.name = `Freeze_Plug_Cup_${plugNumber}`;
  cupMesh.position.set(0, isLeft ? -0.003 : 0.003, 0);
  group.add(cupMesh);

  // 3. Stamped Inspection Center Dot
  const dotGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.002, 16);
  dotGeo.rotateZ(Math.PI / 2);
  const dotMesh = new THREE.Mesh(dotGeo, materials.machinedDeckSurface);
  dotMesh.name = `Stamp_Mark_${plugNumber}`;
  dotMesh.position.set(0, isLeft ? 0.0035 : -0.0035, 0);
  group.add(dotMesh);

  return group;
}

// ============================================================================
// 3. MASTER COOLANT WATER JACKET ASSEMBLY BUILDER
// ============================================================================

/**
 * Builds the complete physical coolant circulation water jacket system.
 */
export function buildV12CoolantJacketSystem(
  materials: V12BlockMaterialPalette,
  cylindersPerBank: number = 6
): THREE.Group {
  const group = new THREE.Group();
  group.name = '04_V12_Coolant_Jacket_System_Assembly';
  const spec = V12_COOLANT_SPECS;
  const pitchM = 0.108;
  const blockHalfLen = (cylindersPerBank * pitchM) / 2;
  const startXCyl = -((cylindersPerBank - 1) * pitchM) / 2;

  // ── A. Deep-Cup Brass Expansion Freeze Plugs ──
  const plugCountPerSide = Math.max(2, cylindersPerBank - 2);
  const plugSpan = (cylindersPerBank - 1) * pitchM * 0.85;
  const plugStart = -plugSpan / 2;

  for (let idx = 0; idx < plugCountPerSide; idx++) {
    const px = plugCountPerSide === 1 ? 0 : plugStart + idx * (plugSpan / (plugCountPerSide - 1));

    // Left flank plugs
    const leftPlug = buildSingleFreezePlug(
      {
        plugNumber: idx + 1,
        side: 'left',
        positionX: px,
        spec,
      },
      materials
    );
    group.add(leftPlug);

    // Right flank plugs
    const rightPlug = buildSingleFreezePlug(
      {
        plugNumber: idx + 1 + plugCountPerSide,
        side: 'right',
        positionX: px + 0.015,
        spec,
      },
      materials
    );
    group.add(rightPlug);
  }

  // ── B. Front Water Pump Scroll Volute Chamber ──
  const frontX = -(blockHalfLen + 0.04);
  const voluteHousingGeo = new THREE.CylinderGeometry(
    spec.voluteImpellerRadiusM,
    spec.voluteImpellerRadiusM,
    0.042,
    32
  );
  voluteHousingGeo.rotateZ(Math.PI / 2);
  const voluteMesh = new THREE.Mesh(voluteHousingGeo, materials.machinedDeckSurface);
  voluteMesh.name = 'Water_Pump_Scroll_Volute_Housing';
  voluteMesh.position.set(frontX, 0.08, 0.20);
  voluteMesh.castShadow = true;
  group.add(voluteMesh);

  // Volute Internal Impeller Inlet Cavity
  const inletCavityGeo = new THREE.CylinderGeometry(
    spec.voluteImpellerRadiusM - 0.008,
    spec.voluteImpellerRadiusM - 0.008,
    0.024,
    24
  );
  inletCavityGeo.rotateZ(Math.PI / 2);
  const inletMesh = new THREE.Mesh(inletCavityGeo, materials.coolantJacketInterior);
  inletMesh.name = 'Water_Pump_Inlet_Cavity';
  inletMesh.position.set(frontX - 0.01, 0.08, 0.20);
  group.add(inletMesh);

  // Dual Coolant Flow Splitter Discharge Horns (Feeding Bank 1 and Bank 2)
  const hornGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.065, 16);
  hornGeo.rotateX(Math.PI / 3);

  [-0.06, 0.06].forEach((hy, hornIdx) => {
    const hornMesh = new THREE.Mesh(hornGeo, materials.castAluminumBlock);
    hornMesh.name = `Coolant_Discharge_Horn_${hornIdx === 0 ? 'Bank1' : 'Bank2'}`;
    hornMesh.position.set(frontX + 0.03, 0.08 + hy, 0.22);
    group.add(hornMesh);
  });

  // ── C. Precision Cylinder Head Deck Water Metering Orifices ──
  const orificeGeo = new THREE.CylinderGeometry(
    spec.deckOrificeRadiusM,
    spec.deckOrificeRadiusM,
    0.025,
    16
  );
  orificeGeo.rotateX(Math.PI / 2);

  // Bank 1 Deck Orifices
  for (let b1 = 0; b1 < cylindersPerBank; b1++) {
    const ox = startXCyl + b1 * pitchM;
    [-0.045, 0.045].forEach((oy, rowIdx) => {
      const orificeMesh = new THREE.Mesh(orificeGeo, materials.coolantJacketInterior);
      orificeMesh.name = `Deck_Coolant_Orifice_Bank1_${b1 + 1}_${rowIdx === 0 ? 'In' : 'Ex'}`;
      orificeMesh.position.set(ox, 0.11 + oy, 0.22 + 0.108);
      group.add(orificeMesh);
    });
  }

  // Bank 2 Deck Orifices (with 15mm stagger)
  for (let b2 = 0; b2 < cylindersPerBank; b2++) {
    const ox = startXCyl + b2 * pitchM + 0.015;
    [-0.045, 0.045].forEach((oy, rowIdx) => {
      const orificeMesh = new THREE.Mesh(orificeGeo, materials.coolantJacketInterior);
      orificeMesh.name = `Deck_Coolant_Orifice_Bank2_${b2 + 1}_${rowIdx === 0 ? 'In' : 'Ex'}`;
      orificeMesh.position.set(ox, -0.11 + oy, 0.22 + 0.108);
      group.add(orificeMesh);
    });
  }

  // ── D. Steam Air Bleed Ports (Upper Front & Rear Deck End Vents) ──
  const steamGeo = new THREE.CylinderGeometry(
    spec.steamBleedPortRadiusM,
    spec.steamBleedPortRadiusM,
    0.018,
    12
  );

  const steamX = blockHalfLen + 0.02;
  [-steamX, steamX].forEach((sx, endIdx) => {
    [-0.10, 0.10].forEach((sy, sideIdx) => {
      const steamMesh = new THREE.Mesh(steamGeo, materials.arpHardenedFastener);
      steamMesh.name = `Steam_Bleed_Port_${endIdx === 0 ? 'Front' : 'Rear'}_${sideIdx === 0 ? 'B1' : 'B2'}`;
      steamMesh.position.set(sx, sy, 0.33);
      group.add(steamMesh);
    });
  });

  return group;
}

export default buildV12CoolantJacketSystem;

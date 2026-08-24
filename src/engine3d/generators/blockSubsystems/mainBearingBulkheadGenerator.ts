// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 CRANKCASE MAIN BULKHEAD & ARP SYSTEM
// ============================================================================
// High-precision solid-modeling generator for the 7 cross-bolted main bearing
// bulkheads, precision split main caps, serrated cap locating steps, ARP 2000
// vertical main studs with 12-point nuts, horizontal cross-tie skirt through-bolts,
// main journal pressurized oil feed channels, and 28-bolt perimeter oil pan rail.
// ============================================================================

import * as THREE from 'three';
import type { V12BlockMaterialPalette } from '../engineBlockGenerator';

// ============================================================================
// 1. MAIN BEARING BULKHEAD SPECIFICATION CONSTANTS
// ============================================================================

export interface MainBulkheadSpec {
  mainJournalDiameterMm: number; // 68.0 mm main journal diameter
  mainJournalRadiusM: number; // 0.034 m main journal radius
  bearingWidthMm: number; // 26.0 mm bearing shell width
  bearingWidthM: number; // 0.026 m
  bulkheadThicknessMm: number; // 32.0 mm structural web thickness
  bulkheadThicknessM: number; // 0.032 m
  crankcaseWidthMm: number; // 340.0 mm total skirt width
  crankcaseWidthM: number; // 0.340 m
  arpStudDiameterMm: number; // 12.0 mm (M12x1.5 ARP 2000)
  arpStudRadiusM: number; // 0.006 m
  arpNutDiameterMm: number; // 22.0 mm 12-point flange nut
  arpNutRadiusM: number; // 0.011 m
  crossBoltDiameterMm: number; // 10.0 mm horizontal cross-tie
  crossBoltRadiusM: number; // 0.005 m
  panRailWidthMm: number; // 360.0 mm oil pan mating rail width
  panRailLengthMm: number; // 740.0 mm total pan rail length
  panBoltCount: number; // 28 perimeter mounting bolt holes
}

export const V12_MAIN_BULKHEAD_SPECS: MainBulkheadSpec = {
  mainJournalDiameterMm: 68.0,
  mainJournalRadiusM: 0.034,
  bearingWidthMm: 26.0,
  bearingWidthM: 0.026,
  bulkheadThicknessMm: 32.0,
  bulkheadThicknessM: 0.032,
  crankcaseWidthMm: 340.0,
  crankcaseWidthM: 0.340,
  arpStudDiameterMm: 12.0,
  arpStudRadiusM: 0.006,
  arpNutDiameterMm: 22.0,
  arpNutRadiusM: 0.011,
  crossBoltDiameterMm: 10.0,
  crossBoltRadiusM: 0.005,
  panRailWidthMm: 360.0,
  panRailLengthMm: 740.0,
  panBoltCount: 28,
};

// ============================================================================
// 2. INDIVIDUAL MAIN BULKHEAD & CAP BUILDER
// ============================================================================

export interface BulkheadConfig {
  bulkheadIndex: number; // 0 through 6 (Main Journals #1 to #7)
  positionX: number; // Longitudinal X position
  isThrustBearing: boolean; // Journal #4 features dual thrust washer flanges
  spec: MainBulkheadSpec;
}

/**
 * Builds a single complete 3D cross-bolted main bearing web bulkhead assembly.
 */
export function buildSingleMainBulkhead(
  config: BulkheadConfig,
  materials: V12BlockMaterialPalette
): THREE.Group {
  const { bulkheadIndex, positionX, isThrustBearing, spec } = config;
  const journalNumber = bulkheadIndex + 1;

  const group = new THREE.Group();
  group.name = `Main_Bearing_Bulkhead_${journalNumber}`;
  group.position.set(positionX, 0, 0.06);

  // ── A. Upper Saddle Arch Casting Web (Integrated Block Upper) ──
  const upperWebGeo = new THREE.BoxGeometry(
    spec.bulkheadThicknessM,
    spec.crankcaseWidthM - 0.04,
    0.11
  );
  const upperWebMesh = new THREE.Mesh(upperWebGeo, materials.castAluminumBlock);
  upperWebMesh.name = `Upper_Bulkhead_Web_${journalNumber}`;
  upperWebMesh.position.set(0, 0, 0.035);
  upperWebMesh.castShadow = true;
  upperWebMesh.receiveShadow = true;
  group.add(upperWebMesh);

  // ── B. Semi-Circular Upper Main Bearing Saddle Arch ──
  const upperArchGeo = new THREE.CylinderGeometry(
    spec.mainJournalRadiusM + 0.003,
    spec.mainJournalRadiusM + 0.003,
    spec.bearingWidthM,
    36,
    1,
    false,
    0,
    Math.PI
  );
  upperArchGeo.rotateZ(Math.PI / 2);
  upperArchGeo.rotateX(Math.PI / 2);
  const upperArchMesh = new THREE.Mesh(upperArchGeo, materials.machinedDeckSurface);
  upperArchMesh.name = `Upper_Main_Journal_Arch_${journalNumber}`;
  upperArchMesh.position.set(0, 0, 0);
  upperArchMesh.castShadow = true;
  group.add(upperArchMesh);

  // ── C. Tri-Metal Upper Main Bearing Shell Liner ──
  const shellGeo = new THREE.CylinderGeometry(
    spec.mainJournalRadiusM,
    spec.mainJournalRadiusM,
    spec.bearingWidthM - 0.002,
    36,
    1,
    true,
    0,
    Math.PI
  );
  shellGeo.rotateZ(Math.PI / 2);
  shellGeo.rotateX(Math.PI / 2);
  const shellMesh = new THREE.Mesh(shellGeo, materials.machinedDeckSurface);
  shellMesh.name = `TriMetal_Upper_Bearing_Shell_${journalNumber}`;
  shellMesh.position.set(0, 0, 0);
  group.add(shellMesh);

  // ── D. Thrust Washer Flange Collars (Center Journal #4 only) ──
  if (isThrustBearing) {
    const thrustFlangeGeo = new THREE.RingGeometry(
      spec.mainJournalRadiusM,
      spec.mainJournalRadiusM + 0.014,
      36
    );
    thrustFlangeGeo.rotateY(Math.PI / 2);

    [-spec.bearingWidthM / 2, spec.bearingWidthM / 2].forEach((tx, thrustIdx) => {
      const thrustMesh = new THREE.Mesh(thrustFlangeGeo, materials.brassFreezePlug);
      thrustMesh.name = `Crank_Thrust_Washer_${thrustIdx === 0 ? 'Front' : 'Rear'}`;
      thrustMesh.position.set(tx, 0, 0);
      group.add(thrustMesh);
    });
  }

  // ── E. Main Bearing Pressurized Oil Supply Feed Hole ──
  const oilFeedGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.045, 16);
  const oilFeedMesh = new THREE.Mesh(oilFeedGeo, materials.oilGalleryPassage);
  oilFeedMesh.name = `Main_Oil_Feed_Drilling_${journalNumber}`;
  oilFeedMesh.position.set(0, 0, 0.022);
  group.add(oilFeedMesh);

  // ── F. Precision Billet Machined Lower Main Bearing Cap ──
  const capGeo = new THREE.BoxGeometry(
    spec.bulkheadThicknessM + 0.004,
    0.20,
    0.048
  );
  const capMesh = new THREE.Mesh(capGeo, materials.machinedDeckSurface);
  capMesh.name = `Billet_Main_Cap_${journalNumber}`;
  capMesh.position.set(0, 0, -0.024);
  capMesh.castShadow = true;
  capMesh.receiveShadow = true;
  group.add(capMesh);

  // ── G. 4-Bolt ARP 2000 Vertical Main Studs & 12-Point Flange Nuts ──
  const studGeo = new THREE.CylinderGeometry(
    spec.arpStudRadiusM,
    spec.arpStudRadiusM,
    0.075,
    16
  );
  studGeo.rotateX(Math.PI / 2);

  const nutGeo = new THREE.CylinderGeometry(
    spec.arpNutRadiusM,
    spec.arpNutRadiusM,
    0.012,
    12
  );
  nutGeo.rotateX(Math.PI / 2);

  const washerGeo = new THREE.CylinderGeometry(
    spec.arpNutRadiusM + 0.002,
    spec.arpNutRadiusM + 0.002,
    0.004,
    16
  );
  washerGeo.rotateX(Math.PI / 2);

  // 4 stud positions (Inner pairs at ±38mm, Outer pairs at ±72mm)
  [-0.072, -0.038, 0.038, 0.072].forEach((sy, studIdx) => {
    const isOuter = Math.abs(sy) > 0.05;
    const studMesh = new THREE.Mesh(studGeo, materials.arpHardenedFastener);
    studMesh.name = `ARP_Main_Stud_${journalNumber}_${studIdx + 1}_${isOuter ? 'Outer' : 'Inner'}`;
    studMesh.position.set(0, sy, 0.035);
    studMesh.castShadow = true;
    group.add(studMesh);

    const nutMesh = new THREE.Mesh(nutGeo, materials.arpHardenedFastener);
    nutMesh.name = `ARP_12Pt_Nut_${journalNumber}_${studIdx + 1}`;
    nutMesh.position.set(0, sy, -0.036);
    nutMesh.castShadow = true;
    group.add(nutMesh);

    const washerMesh = new THREE.Mesh(washerGeo, materials.machinedDeckSurface);
    washerMesh.name = `ARP_Washer_${journalNumber}_${studIdx + 1}`;
    washerMesh.position.set(0, sy, -0.044);
    group.add(washerMesh);
  });

  // ── H. Dual Horizontal Cross-Tie Skirt Bolts (Left & Right) ──
  const crossTieGeo = new THREE.CylinderGeometry(
    spec.crossBoltRadiusM,
    spec.crossBoltRadiusM,
    spec.crankcaseWidthM + 0.01,
    16
  );
  crossTieGeo.rotateZ(Math.PI / 2);
  const crossTieMesh = new THREE.Mesh(crossTieGeo, materials.arpHardenedFastener);
  crossTieMesh.name = `Cross_Tie_Through_Bolt_${journalNumber}`;
  crossTieMesh.position.set(0, 0, -0.012);
  group.add(crossTieMesh);

  // ── I. Crankcase Bay Windage Scraper & Baffle Mount Boss ──
  const scraperBossGeo = new THREE.BoxGeometry(0.012, 0.024, 0.015);
  const scraperMesh = new THREE.Mesh(scraperBossGeo, materials.machinedDeckSurface);
  scraperMesh.name = `Windage_Scraper_Boss_${journalNumber}`;
  scraperMesh.position.set(0, 0.09, -0.03);
  group.add(scraperMesh);

  // ── J. Embedded Crankshaft Journal Alignment Node ──
  const crankJournalAnchor = new THREE.Object3D();
  crankJournalAnchor.name = `Crank_Main_Journal_${journalNumber}_Anchor`;
  crankJournalAnchor.position.set(0, 0, 0);
  group.add(crankJournalAnchor);

  return group;
}

// ============================================================================
// 3. MASTER 7-BULKHEAD & PAN RAIL ASSEMBLY BUILDER
// ============================================================================

/**
 * Builds the complete lower engine crankcase assembly featuring all 7
 * cross-bolted main bearing bulkheads, continuous pan rail, and 28 bolt sockets.
 */
export function buildV12MainBulkheadSystem(
  materials: V12BlockMaterialPalette,
  cylindersPerBank: number = 6
): THREE.Group {
  const group = new THREE.Group();
  group.name = '01_V12_Main_Bulkheads_Pan_Rail_Assembly';
  const spec = V12_MAIN_BULKHEAD_SPECS;
  const pitchM = 0.108;
  const mainCount = cylindersPerBank + 1;
  const blockLengthM = (cylindersPerBank * pitchM) + 0.08;
  const startX = -((mainCount - 1) * pitchM) / 2;

  // ── 1. Outer Deep-Skirt Tub Casting ──
  const skirtTubGeo = new THREE.BoxGeometry(blockLengthM, spec.crankcaseWidthM, 0.15);
  const skirtTubMesh = new THREE.Mesh(skirtTubGeo, materials.castAluminumBlock);
  skirtTubMesh.name = 'Deep_Skirt_Crankcase_Housing';
  skirtTubMesh.position.set(0, 0, 0.075);
  skirtTubMesh.castShadow = true;
  skirtTubMesh.receiveShadow = true;
  group.add(skirtTubMesh);

  // ── 2. Full-Perimeter CNC Machined Oil Pan Rail ──
  const panRailLength = blockLengthM + 0.02;
  const panRailGeo = new THREE.BoxGeometry(panRailLength, spec.panRailWidthMm / 1000, 0.018);
  const panRailMesh = new THREE.Mesh(panRailGeo, materials.machinedDeckSurface);
  panRailMesh.name = 'Continuous_CNC_Pan_Rail';
  panRailMesh.position.set(0, 0, 0.009);
  panRailMesh.castShadow = true;
  group.add(panRailMesh);

  // ── 3. Perimeter Pan Rail Bolt Holes & Gasket Channel ──
  const boltHoleGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.02, 12);
  boltHoleGeo.rotateX(Math.PI / 2);

  const sideBoltCount = Math.max(4, cylindersPerBank + 3);
  for (let s = 0; s < sideBoltCount; s++) {
    const halfSpan = (blockLengthM * 0.9) / 2;
    const bx = -halfSpan + s * ((halfSpan * 2) / (sideBoltCount - 1));
    [-0.172, 0.172].forEach((by, sideIdx) => {
      const hole = new THREE.Mesh(boltHoleGeo, materials.oilGalleryPassage);
      hole.name = `Pan_Bolt_Hole_${sideIdx === 0 ? 'Left' : 'Right'}_${s + 1}`;
      hole.position.set(bx, by, 0.009);
      group.add(hole);
    });
  }

  // 5 bolts front, 5 bolts rear
  const endHalf = blockLengthM / 2 - 0.005;
  [-endHalf, endHalf].forEach((bx, endIdx) => {
    for (let e = 0; e < 5; e++) {
      const by = -0.14 + e * (0.28 / 4);
      const hole = new THREE.Mesh(boltHoleGeo, materials.oilGalleryPassage);
      hole.name = `Pan_End_Bolt_Hole_${endIdx === 0 ? 'Front' : 'Rear'}_${e + 1}`;
      hole.position.set(bx, by, 0.009);
      group.add(hole);
    }
  });

  // ── 4. Cross-Bolted Main Bulkhead Modules ──
  const thrustIdx = Math.floor(mainCount / 2);
  for (let i = 0; i < mainCount; i++) {
    const positionX = startX + i * pitchM;
    const isThrustBearing = i === thrustIdx;

    const bulkhead = buildSingleMainBulkhead(
      {
        bulkheadIndex: i,
        positionX,
        isThrustBearing,
        spec,
      },
      materials
    );

    group.add(bulkhead);
  }

  // ── 5. Main Longitudinal High-Pressure Oil Gallery Rifle ──
  const rifleGeo = new THREE.CylinderGeometry(0.007, 0.007, blockLengthM - 0.02, 16);
  rifleGeo.rotateZ(Math.PI / 2);
  const rifleMesh = new THREE.Mesh(rifleGeo, materials.machinedDeckSurface);
  rifleMesh.name = 'Main_Crankcase_Oil_Rifle';
  rifleMesh.position.set(0, -0.088, 0.12);
  group.add(rifleMesh);

  return group;
}

export default buildV12MainBulkheadSystem;

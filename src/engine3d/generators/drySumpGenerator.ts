// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR Ã¢â‚¬â€ 4-STAGE DRY SUMP SYSTEM
// ============================================================================
// Solid-modeling engineering generator for a 4-stage low-profile dry sump
// lubrication system CNC machined from 7075-T6 billet aluminum. Features 4 screened
// scavenge pickup sumps with directional crank scrapers, internal wire mesh baffle,
// external multi-stage gerotor pump with Gilmer cogged belt drive, AN-12 braided stainless
// scavenge hardlines, centrifugal cyclone de-aerator oil tank with vertical sight glass,
// breather catch can plumbing, thermostatic sandwich plate, and 28 perimeter flange bolts.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EngineConfig } from '../../sim/types';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  createHexBoltHead,
  createAllenSocketHead,
  createKnurledBand,
} from './geometryDetailUtils';

// Polyfill Node.js FileReader if executing in CLI
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

export interface DrySumpSpec {
  panLengthM: number;
  panWidthM: number;
  panDepthM: number;
  railThicknessM: number;
  tankDiameterM: number;
  tankHeightM: number;
  filterDiameterM: number;
  filterHeightM: number;
}

export const V12_DRYSUMP_SPECS: DrySumpSpec = {
  panLengthM: 0.680,
  panWidthM: 0.320,
  panDepthM: 0.055,
  railThicknessM: 0.012,
  tankDiameterM: 0.140,
  tankHeightM: 0.280,
  filterDiameterM: 0.086,
  filterHeightM: 0.120,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the dry sump system.
 */
export function buildDrySumpScene(configOrCyls?: Partial<EngineConfig> | number): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'Dry_Sump_System_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = 'Dry_Sump_Lubrication_Master_Group';
  scene.add(rootGroup);

  let cylsPerBank = 6;
  if (typeof configOrCyls === 'number') {
    cylsPerBank = configOrCyls;
  } else if (configOrCyls?.layout) {
    const l = configOrCyls.layout;
    cylsPerBank =
      l === 'i3' || l === 'v6' ? 3 :
      l === 'i4' || l === 'boxer4' || l === 'v8' ? 4 :
      l === 'v10' ? 5 :
      l === 'w12' ? 3 :
      l === 'w16' ? 4 :
      l === 'w18' ? 5 :
      6;
  }

  const matLib = globalMaterialLibrary;
  const matBilletPan = matLib.getMachinedBillet();
  const matCastHousing = matLib.getCastAluminum();
  const matGoldAnodized = matLib.getGoldAnodized();
  const matCobaltAnodized = matLib.getCobaltAnodized();
  const matBraidedLine = matLib.getNitridedCrank();
  const matInternalMesh = matLib.getTranslucentMesh();
  const matFilterCan = matLib.getCobaltAnodized();
  const matGlass = matLib.getQuartzGlass();
  const matSensorBillet = matLib.getNitridedCrank();

  const spec = V12_DRYSUMP_SPECS;
  const panLengthM = (cylsPerBank - 1) * 0.108 + 0.140;
  const halfSpanX = panLengthM / 2;
  const stageCount = Math.max(3, cylsPerBank - 1);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 1. CNC BILLET 7075 LOW-PROFILE PAN & CRANK SCRAPER TRAY Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const panGroup = new THREE.Group();
  panGroup.name = 'Billet_Sump_Pan_Subsystem';

  // CNC Machined Shallow Pan Trough
  const panGeo = new THREE.BoxGeometry(panLengthM, spec.panWidthM, spec.panDepthM);
  const panMesh = new THREE.Mesh(panGeo, matCastHousing);
  panMesh.name = 'CNC_Low_Profile_Scavenge_Pan_Trough';
  panMesh.position.set(0, 0, 0);
  panMesh.castShadow = true;
  panMesh.receiveShadow = true;
  panGroup.add(panMesh);

  // Precision Perimeter Mating Rail Flange
  const railGeo = new THREE.BoxGeometry(panLengthM + 0.024, spec.panWidthM + 0.024, spec.railThicknessM);
  const railMesh = new THREE.Mesh(railGeo, matBilletPan);
  railMesh.name = 'Perimeter_Pan_Rail_Mounting_Flange';
  railMesh.position.set(0, 0, spec.panDepthM / 2 - spec.railThicknessM / 2);
  railMesh.castShadow = true;
  panGroup.add(railMesh);

  // Perimeter M6 Hex Flange Bolts along pan rail
  const boltCols = Math.max(6, cylsPerBank + 2);
  for (let bx = 0; bx < boltCols; bx++) {
    const xPos = -halfSpanX + 0.02 + bx * (panLengthM - 0.04) / (boltCols - 1);
    [-spec.panWidthM / 2 - 0.006, spec.panWidthM / 2 + 0.006].forEach((yPos, yIdx) => {
      const boltGeo = createHexBoltHead(0.004, 0.008);
      const boltMesh = new THREE.Mesh(boltGeo, matSensorBillet);
      boltMesh.name = `Pan_Flange_Bolt_Longitudinal_${bx + 1}_${yIdx === 0 ? 'L' : 'R'}`;
      boltMesh.position.set(xPos, yPos, spec.panDepthM / 2 + 0.002);
      panGroup.add(boltMesh);
    });
  }

  for (let by = 0; by < 4; by++) {
    const yPos = -spec.panWidthM / 2 + 0.04 + by * (spec.panWidthM - 0.08) / 3;
    [-halfSpanX - 0.006, halfSpanX + 0.006].forEach((xPos, xIdx) => {
      const boltGeo = createHexBoltHead(0.004, 0.008);
      const boltMesh = new THREE.Mesh(boltGeo, matSensorBillet);
      boltMesh.name = `Pan_Flange_Bolt_Transverse_${by + 1}_${xIdx === 0 ? 'Fwd' : 'Aft'}`;
      boltMesh.position.set(xPos, yPos, spec.panDepthM / 2 + 0.002);
      panGroup.add(boltMesh);
    });
  }

  // Internal Stainless Steel Screen Baffle Tray
  const screenBaffleGeo = new THREE.BoxGeometry(panLengthM - 0.04, spec.panWidthM - 0.04, 0.002);
  const screenBaffleMesh = new THREE.Mesh(screenBaffleGeo, matInternalMesh);
  screenBaffleMesh.name = 'Internal_Stainless_Screen_Baffle_Tray';
  screenBaffleMesh.position.set(0, 0, spec.panDepthM / 2 - 0.012);
  panGroup.add(screenBaffleMesh);

  // Teflon Multi-Blade Windage Crank Scraper Trays
  for (let w = 0; w < cylsPerBank; w++) {
    const wx = -halfSpanX + 0.07 + w * 0.108;
    const scraperGeo = new THREE.BoxGeometry(0.016, spec.panWidthM - 0.04, 0.014);
    const scraperMesh = new THREE.Mesh(scraperGeo, matBilletPan);
    scraperMesh.name = `Teflon_Crank_Scraper_Baffle_${w + 1}`;
    scraperMesh.position.set(wx, 0, spec.panDepthM / 2 - 0.018);
    panGroup.add(scraperMesh);
  }

  // Dual Magnetic Drain Plugs
  [-halfSpanX + 0.06, halfSpanX - 0.06].forEach((dx, dIdx) => {
    const plugGeo = createHexBoltHead(0.009, 0.012);
    const plugMesh = new THREE.Mesh(plugGeo, matGoldAnodized);
    plugMesh.name = `Magnetic_Sump_Drain_Plug_${dIdx + 1}`;
    plugMesh.position.set(dx, 0, -spec.panDepthM / 2 - 0.004);
    panGroup.add(plugMesh);
  });

  rootGroup.add(panGroup);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 2. SCAVENGE PICKUP PORTS & AN-12 BRAIDED HARDLINES Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const scavengeGroup = new THREE.Group();
  scavengeGroup.name = 'Scavenge_Pickups_Hardlines_Subsystem';

  for (let p = 0; p < stageCount; p++) {
    const px = -halfSpanX + 0.08 + p * ((panLengthM - 0.16) / Math.max(1, stageCount - 1));

    // AN-12 Billet Scavenge Port Bung
    const portGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.024, 6);
    portGeo.rotateX(Math.PI / 2);
    const portMesh = new THREE.Mesh(portGeo, matCobaltAnodized);
    portMesh.name = `AN12_Scavenge_Port_Fitting_${p + 1}`;
    portMesh.position.set(px, spec.panWidthM / 2 + 0.010, 0);
    scavengeGroup.add(portMesh);

    // Gold AN-12 Tube Nut Collar
    const nutGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.012, 6);
    nutGeo.rotateX(Math.PI / 2);
    const nutMesh = new THREE.Mesh(nutGeo, matGoldAnodized);
    nutMesh.name = `AN12_Tube_Locknut_${p + 1}`;
    nutMesh.position.set(px, spec.panWidthM / 2 + 0.022, 0);
    scavengeGroup.add(nutMesh);

    // Curved Braided Stainless Hardline Sweeping to Pump
    const tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, spec.panWidthM / 2 + 0.024, 0),
      new THREE.Vector3(px + 0.035, spec.panWidthM / 2 + 0.065, -0.012),
      new THREE.Vector3(halfSpanX * 0.85, spec.panWidthM / 2 + 0.055, 0.010),
    ]);
    const tubeGeo = new THREE.TubeGeometry(tubeCurve, 32, 0.009, 20, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, matBraidedLine);
    tubeMesh.name = `AN12_Braided_Scavenge_Line_${p + 1}`;
    tubeMesh.castShadow = true;
    scavengeGroup.add(tubeMesh);
  }

  rootGroup.add(scavengeGroup);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 3. MULTI-STAGE GEROTOR SCAVENGE OIL PUMP & GILMER PULLEY Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const pumpGroup = new THREE.Group();
  pumpGroup.name = 'MultiStage_Scavenge_Pump_Subsystem';
  pumpGroup.position.set(0.31, spec.panWidthM / 2 + 0.045, 0.015);

  // 4-Stage Gerotor Extruded Pump Body (Smooth 32 segments)
  const pumpBodyGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.16, 32);
  pumpBodyGeo.rotateZ(Math.PI / 2);
  const pumpBodyMesh = new THREE.Mesh(pumpBodyGeo, matCastHousing);
  pumpBodyMesh.name = 'Gerotor_4Stage_Pump_Body';
  pumpBodyMesh.castShadow = true;
  pumpGroup.add(pumpBodyMesh);

  // Front Gilmer Toothed Belt Drive Cog Pulley
  const cogGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.024, 36);
  cogGeo.rotateZ(Math.PI / 2);
  const cogMesh = new THREE.Mesh(cogGeo, matGoldAnodized);
  cogMesh.name = 'Gilmer_Cogged_Pulley_Wheel';
  cogMesh.position.set(-0.09, 0, 0);
  cogMesh.castShadow = true;
  pumpGroup.add(cogMesh);

  // Gilmer Belt Engagement Teeth (24 Square-Cut Cogs)
  for (let gt = 0; gt < 24; gt++) {
    const gtAngle = (gt * Math.PI * 2) / 24;
    const toothGeo = new THREE.BoxGeometry(0.02, 0.006, 0.008);
    toothGeo.rotateX(gtAngle);
    const toothMesh = new THREE.Mesh(toothGeo, matGoldAnodized);
    toothMesh.name = `Gilmer_Pulley_Cog_Tooth_${gt + 1}`;
    toothMesh.position.set(-0.09, Math.sin(gtAngle) * 0.047, Math.cos(gtAngle) * 0.047);
    pumpGroup.add(toothMesh);
  }

  // 4-Stage Stack Parting Seam Rings
  [-0.055, -0.018, 0.018, 0.055].forEach((sx, si) => {
    const seamGeo = new THREE.TorusGeometry(0.0385, 0.0015, 8, 36);
    seamGeo.rotateY(Math.PI / 2);
    const seamMesh = new THREE.Mesh(seamGeo, matGoldAnodized);
    seamMesh.name = `Pump_Stage_Parting_Seam_${si + 1}`;
    seamMesh.position.set(sx, 0, 0);
    pumpGroup.add(seamMesh);
  });

  // Pump Mounting Feet with Retention Bolts
  [-0.06, 0.06].forEach((fx) => {
    const footGeo = new THREE.BoxGeometry(0.02, 0.008, 0.07);
    const footMesh = new THREE.Mesh(footGeo, matCastHousing);
    footMesh.name = `Pump_Mount_Foot_${fx < 0 ? 'Front' : 'Rear'}`;
    footMesh.position.set(fx, -0.04, 0);
    pumpGroup.add(footMesh);

    const footBoltGeo = createHexBoltHead(0.005, 0.005);
    const footBoltMesh = new THREE.Mesh(footBoltGeo, matSensorBillet);
    footBoltMesh.name = `Pump_Foot_Retention_Bolt_${fx < 0 ? 'F' : 'R'}`;
    footBoltMesh.position.set(fx, -0.046, 0.024);
    pumpGroup.add(footBoltMesh);
  });

  // High-Pressure Pressure Stage Outlet Port
  const pumpOutGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.026, 16);
  pumpOutGeo.rotateX(Math.PI / 2);
  const pumpOutMesh = new THREE.Mesh(pumpOutGeo, matGoldAnodized);
  pumpOutMesh.name = 'Pump_Pressure_Outlet_Port';
  pumpOutMesh.position.set(0.05, 0, 0.042);
  pumpGroup.add(pumpOutMesh);

  rootGroup.add(pumpGroup);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 4. CENTRIFUGAL DE-AERATION DRY SUMP OIL TANK & SIGHT GLASS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const tankGroup = new THREE.Group();
  tankGroup.name = 'Cyclone_DeAerator_Tank_Subsystem';
  tankGroup.position.set(-0.28, -0.22, 0.12);

  // Spun Aluminum Cylindrical Reservoir Body (Smooth 48 segments)
  const tankGeo = new THREE.CylinderGeometry(spec.tankDiameterM / 2, spec.tankDiameterM / 2, spec.tankHeightM, 48);
  const tankMesh = new THREE.Mesh(tankGeo, matBilletPan);
  tankMesh.name = 'Cyclone_DeAerator_Reservoir_Vessel';
  tankMesh.castShadow = true;
  tankMesh.receiveShadow = true;
  tankGroup.add(tankMesh);

  // Top Aerodynamic Breather Canister Cap
  const capGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.035, 32);
  const capMesh = new THREE.Mesh(capGeo, matGoldAnodized);
  capMesh.name = 'Tank_Breather_Cyclone_Cap';
  capMesh.position.set(0, spec.tankHeightM / 2 + 0.015, 0);
  tankGroup.add(capMesh);

  // Vertical Tubular Quartz Oil Level Sight Glass
  const sightGlassGeo = new THREE.CylinderGeometry(0.008, 0.008, spec.tankHeightM * 0.6, 20);
  const sightGlassMesh = new THREE.Mesh(sightGlassGeo, matGlass);
  sightGlassMesh.name = 'Oil_Level_Quartz_Sight_Glass';
  sightGlassMesh.position.set(spec.tankDiameterM / 2 + 0.012, 0, 0);
  tankGroup.add(sightGlassMesh);

  // Sight Glass Billet Retaining Top & Bottom Banjo Mounts
  [-spec.tankHeightM * 0.3, spec.tankHeightM * 0.3].forEach((sy, sIdx) => {
    const mountGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.018, 16);
    mountGeo.rotateZ(Math.PI / 2);
    const mountMesh = new THREE.Mesh(mountGeo, matGoldAnodized);
    mountMesh.name = `SightGlass_Billet_Mount_${sIdx === 0 ? 'Bottom' : 'Top'}`;
    mountMesh.position.set(spec.tankDiameterM / 2 + 0.008, sy, 0);
    tankGroup.add(mountMesh);
  });

  // Breather Catch-Can Vent Plumbing Hose
  const ventCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, spec.tankHeightM / 2 + 0.03, 0),
    new THREE.Vector3(0.04, spec.tankHeightM / 2 + 0.06, 0.04),
    new THREE.Vector3(0.08, spec.tankHeightM / 2 + 0.02, 0.06),
  ]);
  const ventGeo = new THREE.TubeGeometry(ventCurve, 16, 0.006, 12, false);
  const ventMesh = new THREE.Mesh(ventGeo, matBraidedLine);
  ventMesh.name = 'Breather_Catch_Can_Vent_Hose';
  tankGroup.add(ventMesh);

  // Spun-Aluminum Rolled Seam Beads (Top & Bottom of Vessel)
  [-spec.tankHeightM / 2 + 0.01, spec.tankHeightM / 2 - 0.01].forEach((sy, si) => {
    const seamGeo = new THREE.TorusGeometry(spec.tankDiameterM / 2 + 0.001, 0.0022, 10, 48);
    seamGeo.rotateX(Math.PI / 2);
    const seamMesh = new THREE.Mesh(seamGeo, matGoldAnodized);
    seamMesh.name = `Tank_Spun_Aluminum_Rolled_Seam_${si === 0 ? 'Bottom' : 'Top'}`;
    seamMesh.position.set(0, sy, 0);
    tankGroup.add(seamMesh);
  });

  // AN-12 Oil Feed Inlet Fitting (Lower Flank)
  const tankInletGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.026, 6);
  tankInletGeo.rotateZ(Math.PI / 2);
  const tankInletMesh = new THREE.Mesh(tankInletGeo, matCobaltAnodized);
  tankInletMesh.name = 'Tank_AN12_Oil_Feed_Inlet';
  tankInletMesh.position.set(spec.tankDiameterM / 2 + 0.01, -spec.tankHeightM * 0.28, 0.022);
  tankGroup.add(tankInletMesh);

  // AN-10 Scavenge Return Fitting (Upper Flank)
  const tankReturnGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.024, 6);
  tankReturnGeo.rotateZ(Math.PI / 2);
  const tankReturnMesh = new THREE.Mesh(tankReturnGeo, matCobaltAnodized);
  tankReturnMesh.name = 'Tank_AN10_Scavenge_Return_Fitting';
  tankReturnMesh.position.set(spec.tankDiameterM / 2 + 0.009, spec.tankHeightM * 0.3, -0.018);
  tankGroup.add(tankReturnMesh);

  // MIN / MAX Level Bands on the Sight Glass
  [-0.045, 0.045].forEach((ly, li) => {
    const bandGeo = new THREE.TorusGeometry(0.0092, 0.0008, 8, 20);
    bandGeo.rotateY(Math.PI / 2);
    const bandMesh = new THREE.Mesh(bandGeo, li === 0 ? matCobaltAnodized : matGoldAnodized);
    bandMesh.name = `SightGlass_${li === 0 ? 'MIN' : 'MAX'}_Level_Band`;
    bandMesh.position.set(spec.tankDiameterM / 2 + 0.012, ly, 0);
    tankGroup.add(bandMesh);
  });

  // Etched Manufacturer Badge on the Tank Flank
  const tankBadgeGeo = new THREE.BoxGeometry(0.04, 0.03, 0.0015);
  const tankBadgeMesh = new THREE.Mesh(tankBadgeGeo, matGoldAnodized);
  tankBadgeMesh.name = 'DrySump_Tank_Anodized_Badge_Plate';
  tankBadgeMesh.position.set(0, 0, -(spec.tankDiameterM / 2 + 0.001));
  tankGroup.add(tankBadgeMesh);

  rootGroup.add(tankGroup);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 5. HIGH-FLOW SPIN-ON FILTER & THERMOSTATIC SANDWICH Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const filterGroup = new THREE.Group();
  filterGroup.name = 'SpinOn_Racing_Filter_Subsystem';
  filterGroup.position.set(-0.28, -0.22, -0.075);

  // Cobalt Blue Spin-On Filter Canister (Smooth 36 segments)
  const filterGeo = new THREE.CylinderGeometry(spec.filterDiameterM / 2, spec.filterDiameterM / 2, spec.filterHeightM, 36);
  const filterMesh = new THREE.Mesh(filterGeo, matFilterCan);
  filterMesh.name = 'Cobalt_Racing_HighFlow_Filter_Canister';
  filterMesh.castShadow = true;
  filterGroup.add(filterMesh);

  // Knurled Grip Bands on the Filter Canister
  [-spec.filterHeightM / 2 + 0.016, spec.filterHeightM / 2 - 0.016].forEach((fy, fi) => {
    const knurlGeo = createKnurledBand(spec.filterDiameterM / 2 + 0.0005, 0.012, 40);
    const knurlMesh = new THREE.Mesh(knurlGeo, matGoldAnodized);
    knurlMesh.name = `Filter_Knurled_Grip_Band_${fi === 0 ? 'Bottom' : 'Top'}`;
    knurlMesh.position.set(0, fy, 0);
    filterGroup.add(knurlMesh);
  });

  // Gold Etched Spec Label Band
  const labelGeo = new THREE.CylinderGeometry(spec.filterDiameterM / 2 + 0.0008, spec.filterDiameterM / 2 + 0.0008, 0.022, 36, 1, true);
  const labelMesh = new THREE.Mesh(labelGeo, matGoldAnodized);
  labelMesh.name = 'Filter_Etched_Spec_Label_Band';
  filterGroup.add(labelMesh);

  // Hex Drive Nut Base for Filter Wrenches
  const hexBaseGeo = new THREE.CylinderGeometry(spec.filterDiameterM / 2 - 0.004, spec.filterDiameterM / 2 - 0.004, 0.012, 6);
  const hexBaseMesh = new THREE.Mesh(hexBaseGeo, matGoldAnodized);
  hexBaseMesh.name = 'Filter_Hex_Drive_Nut_Base';
  hexBaseMesh.position.set(0, -spec.filterHeightM / 2 - 0.004, 0);
  filterGroup.add(hexBaseMesh);

  // CNC Thermostatic Oil Cooler Sandwich Adapter Plate
  const sandwichGeo = new THREE.BoxGeometry(0.095, 0.095, 0.024);
  const sandwichMesh = new THREE.Mesh(sandwichGeo, matGoldAnodized);
  sandwichMesh.name = 'Thermostatic_Sandwich_Adapter_Plate';
  sandwichMesh.position.set(0, 0, spec.filterHeightM / 2 + 0.012);
  filterGroup.add(sandwichMesh);

  // Oil Temperature Sensor Boss on Sandwich Plate
  const tempSensorGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.018, 16);
  tempSensorGeo.rotateX(Math.PI / 2);
  const tempSensorMesh = new THREE.Mesh(tempSensorGeo, matSensorBillet);
  tempSensorMesh.name = 'Oil_Temperature_Sensor_Boss';
  tempSensorMesh.position.set(0.04, 0.045, spec.filterHeightM / 2 + 0.012);
  filterGroup.add(tempSensorMesh);

  // Sandwich Plate Perimeter Hex Bolts (4)
  [-0.038, 0.038].forEach((bx) => {
    [-0.038, 0.038].forEach((by) => {
      const boltGeo = createHexBoltHead(0.005, 0.006);
      const boltMesh = new THREE.Mesh(boltGeo, matSensorBillet);
      boltMesh.name = 'Sandwich_Plate_Hex_Bolt';
      boltMesh.position.set(bx, by, spec.filterHeightM / 2 + 0.027);
      filterGroup.add(boltMesh);
    });
  });

  // Thermostat Port Fitting on the Sandwich Plate
  const thermoGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6);
  thermoGeo.rotateX(Math.PI / 2);
  const thermoMesh = new THREE.Mesh(thermoGeo, matCobaltAnodized);
  thermoMesh.name = 'Sandwich_Thermostat_Port_Fitting';
  thermoMesh.position.set(-0.038, -0.038, spec.filterHeightM / 2 + 0.032);
  filterGroup.add(thermoMesh);

  rootGroup.add(filterGroup);

  return scene;
}

/**
 * Exports the dry sump scene to a binary GLB ArrayBuffer.
 */
export async function generateDrySumpGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildDrySumpScene();
  const exporter = new GLTFExporter();

  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      scene,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          resolve(gltf);
        } else {
          resolve(gltf as unknown as ArrayBuffer);
        }
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

export default buildDrySumpScene;

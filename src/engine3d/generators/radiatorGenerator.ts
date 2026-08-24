// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â DUAL-PASS COOLING RADIATOR
// ============================================================================
// Solid-modeling engineering generator for an ultra-high-performance dual-pass
// brazed aluminum racing radiator. Features a 24-row extruded cooling core with
// micro-louvered serpentine fins, TIG-welded partitioned end tanks with billet
// AN-16 ports, 1.3-bar pressure cap, expansion reservoir, carbon fiber fan shroud
// with dynamic bypass flaps, twin 9-blade brushless electric fans with wiring harness,
// auxiliary 10-row stacked-plate oil cooler, stone guard grille, and 4-ply Kevlar
// silicone hoses with stainless T-bolt clamps.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import {
  createHoseClamp,
  createHexBoltHead,
  createAllenSocketHead,
  createKnurledBand,
  createORingSeal,
  createTurbineAirfoilBlade,
  mergeBufferGeometries,
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

export interface RadiatorSpec {
  coreThicknessM: number;      // 0.055 m (dual-pass 55mm core)
  coreWidthM: number;          // 0.650 m (lateral left-to-right)
  coreHeightM: number;         // 0.420 m (vertical height)
  endTankWidthM: number;       // 0.065 m
  fanDiameterM: number;        // 0.280 m
  fanBladeCount: number;       // 9 blades per fan
  hoseBarbDiameterMm: number;  // 38.0 mm (1.5 inch)
  tubeRowPairs?: number;       // 24 horizontal cooling tube rows
  includeAuxiliaryOilCooler?: boolean; // 10-row auxiliary oil cooler
  includeExpansionTank?: boolean;     // Billet overflow bottle
  includeDebrisGrille?: boolean;      // Stainless track stone guard
  includeBypassFlaps?: boolean;       // Rubber shroud flaps
  includeWiringHarness?: boolean;     // Fan electrical loom
  includeSensorsAndBleeder?: boolean; // Dual temp senders & petcock
}

export const V12_RADIATOR_SPECS: RadiatorSpec = {
  coreThicknessM: 0.055,
  coreWidthM: 0.650,
  coreHeightM: 0.420,
  endTankWidthM: 0.065,
  fanDiameterM: 0.280,
  fanBladeCount: 9,
  hoseBarbDiameterMm: 38.0,
  tubeRowPairs: 24,
  includeAuxiliaryOilCooler: true,
  includeExpansionTank: true,
  includeDebrisGrille: true,
  includeBypassFlaps: true,
  includeWiringHarness: true,
  includeSensorsAndBleeder: true,
};

/**
 * Builds a TIG weld bead geometry running down a straight line.
 */
function createTigWeldBead(length: number, beadRadius: number = 0.0035, overlapFactor: number = 0.6): THREE.BufferGeometry {
  const step = beadRadius * (1 - overlapFactor) * 2;
  const beadCount = Math.max(4, Math.floor(length / step));
  const geos: THREE.BufferGeometry[] = [];

  const sphereGeo = new THREE.SphereGeometry(beadRadius, 8, 8);
  for (let i = 0; i < beadCount; i++) {
    const y = -length / 2 + (i + 0.5) * (length / beadCount);
    const sphere = sphereGeo.clone();
    sphere.scale(1.2, 0.7, 1.0);
    sphere.translate(0, y, 0);
    geos.push(sphere);
  }

  return mergeBufferGeometries(geos);
}

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the dual-pass radiator.
 */
export function buildRadiatorScene(customSpec?: Partial<RadiatorSpec>): THREE.Scene {
  const spec: RadiatorSpec = { ...V12_RADIATOR_SPECS, ...customSpec };

  const scene = new THREE.Scene();
  scene.name = 'V12_DualPass_Radiator_Scene';

  const rootGroup = new THREE.Group();
  rootGroup.name = '11_Radiator_Cooling_Master_Assembly_Group';
  scene.add(rootGroup);

  const matLib = globalMaterialLibrary;
  const matBrazedCore = matLib.getCastAluminum();
  const matEndTanks = matLib.getMachinedBillet();
  const matCarbonShroud = matLib.getDryCarbonFiber();
  const matFanBlades = matLib.getBlackPolymer();
  const matFanMotor = matLib.getNitridedCrank();
  const matGoldAnodized = matLib.getGoldAnodized();
  const matCobaltAnodized = matLib.getCobaltAnodized();
  const matSiliconeHose = matLib.getBlueSilicone();
  const matStainless = matLib.getNitridedCrank();

  // Custom dedicated materials
  const matBrass = new THREE.MeshStandardMaterial({
    name: 'Billet_Brass_Fitting',
    color: new THREE.Color(0xd97706),
    metalness: 0.85,
    roughness: 0.25,
    envMapIntensity: 1.8,
  });

  const matRedAnodized = new THREE.MeshStandardMaterial({
    name: 'Billet_Red_Anodized_AN',
    color: new THREE.Color(0xdc2626),
    metalness: 0.90,
    roughness: 0.20,
    envMapIntensity: 1.8,
  });

  const matEPDMRubber = new THREE.MeshStandardMaterial({
    name: 'EPDM_Rubber_Isolator',
    color: new THREE.Color(0x0f172a),
    metalness: 0.05,
    roughness: 0.85,
  });

  const matClearGlass = matLib.getQuartzGlass();

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 1. 24-ROW DUAL-PASS BRAZED ALUMINUM COOLING CORE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const coreGroup = new THREE.Group();
  coreGroup.name = 'Brazed_Radiator_Core_Subsystem';

  // Main Brazed Fin & Tube Extrusion Matrix (X: Depth, Y: Width, Z: Height)
  // Recessed inner matrix: tubes & fins protrude past it for a real finned face
  const coreGeo = new THREE.BoxGeometry(spec.coreThicknessM * 0.55, spec.coreWidthM * 0.995, spec.coreHeightM * 0.995);
  const coreMesh = new THREE.Mesh(coreGeo, matBrazedCore);
  coreMesh.name = 'MicroLouvered_Aluminum_Fin_Core';
  coreMesh.position.set(0, 0, 0);
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  coreGroup.add(coreMesh);

  // 24 Horizontal Extruded Cooling Channel Tubes
  const tubeRows = spec.tubeRowPairs || 24;
  const tubeGeos: THREE.BufferGeometry[] = [];
  const finRibGeos: THREE.BufferGeometry[] = [];

  for (let t = 0; t < tubeRows; t++) {
    const tz = -spec.coreHeightM / 2 + 0.012 + t * (spec.coreHeightM - 0.024) / (tubeRows - 1);
    const tubeGeo = new THREE.BoxGeometry(spec.coreThicknessM * 0.92, spec.coreWidthM * 1.002, 0.004);
    tubeGeo.translate(0, 0, tz);
    tubeGeos.push(tubeGeo);

    // Corrugated Micro-Rib Fin Strip between tubes
    if (t < tubeRows - 1) {
      const nextTz = -spec.coreHeightM / 2 + 0.012 + (t + 1) * (spec.coreHeightM - 0.024) / (tubeRows - 1);
      const finZ = (tz + nextTz) / 2;
      const finStripGeo = new THREE.BoxGeometry(spec.coreThicknessM * 0.85, spec.coreWidthM * 0.98, (nextTz - tz) * 0.65);
      finStripGeo.translate(0, 0, finZ);
      finRibGeos.push(finStripGeo);
    }
  }

  const mergedTubes = mergeBufferGeometries(tubeGeos);
  const tubesMesh = new THREE.Mesh(mergedTubes, matEndTanks);
  tubesMesh.name = 'Coolant_Flat_Extruded_Tubes_24Row';
  coreGroup.add(tubesMesh);

  const mergedFins = mergeBufferGeometries(finRibGeos);
  const finsMesh = new THREE.Mesh(mergedFins, matBrazedCore);
  finsMesh.name = 'Serpentine_Micro_Louvered_Fin_Ribbons';
  coreGroup.add(finsMesh);

  // Heavy-Gauge Side Core Plates with Dimple Swages
  [-spec.coreWidthM / 2, spec.coreWidthM / 2].forEach((sideY, sIdx) => {
    const plateGeo = new THREE.BoxGeometry(spec.coreThicknessM + 0.008, 0.004, spec.coreHeightM + 0.01);
    const plateMesh = new THREE.Mesh(plateGeo, matEndTanks);
    plateMesh.name = `Core_Side_Header_Plate_${sIdx === 0 ? 'Left' : 'Right'}`;
    plateMesh.position.set(0, sideY, 0);
    coreGroup.add(plateMesh);
  });

  // Structural Top & Bottom Stiffening C-Channels
  [-spec.coreHeightM / 2 - 0.008, spec.coreHeightM / 2 + 0.008].forEach((rz, rIdx) => {
    const railGeo = new THREE.BoxGeometry(spec.coreThicknessM + 0.014, spec.coreWidthM + 0.02, 0.016);
    const railMesh = new THREE.Mesh(railGeo, matEndTanks);
    railMesh.name = `Core_Structural_Rail_${rIdx === 0 ? 'Bottom' : 'Top'}`;
    railMesh.position.set(0, 0, rz);
    railMesh.castShadow = true;
    coreGroup.add(railMesh);
  });

  // 4 Corner Rubber Vibration Isolation Dampers & M8 Threaded Studs
  [
    [-spec.coreWidthM / 2 - 0.02, -spec.coreHeightM / 2 - 0.008],
    [spec.coreWidthM / 2 + 0.02, -spec.coreHeightM / 2 - 0.008],
    [-spec.coreWidthM / 2 - 0.02, spec.coreHeightM / 2 + 0.008],
    [spec.coreWidthM / 2 + 0.02, spec.coreHeightM / 2 + 0.008],
  ].forEach(([by, bz], mIdx) => {
    const rubberPuckGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.022, 24);
    rubberPuckGeo.rotateZ(Math.PI / 2);
    const rubberPuck = new THREE.Mesh(rubberPuckGeo, matEPDMRubber);
    rubberPuck.name = `Chassis_Vibration_Isolator_${mIdx + 1}`;
    rubberPuck.position.set(-spec.coreThicknessM / 2 - 0.012, by, bz);
    coreGroup.add(rubberPuck);

    const studGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.038, 16);
    studGeo.rotateZ(Math.PI / 2);
    const studMesh = new THREE.Mesh(studGeo, matStainless);
    studMesh.name = `Isolator_Mounting_Stud_${mIdx + 1}`;
    studMesh.position.set(-spec.coreThicknessM / 2 - 0.016, by, bz);
    coreGroup.add(studMesh);
  });

  rootGroup.add(coreGroup);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 2. TIG-WELDED PARTITIONED END TANKS & FLOW DIVIDERS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const tankGroup = new THREE.Group();
  tankGroup.name = 'Partitioned_EndTanks_Subsystem';

  // Left (+Y Return) & Right (-Y Dual-Pass Inlet/Outlet) TIG-Welded Aluminum End Tanks
  [-1, 1].forEach((dir) => {
    const yPos = dir * (spec.coreWidthM / 2 + spec.endTankWidthM / 2);

    const tankGeo = new THREE.BoxGeometry(spec.coreThicknessM + 0.016, spec.endTankWidthM, spec.coreHeightM + 0.016);
    const tankMesh = new THREE.Mesh(tankGeo, matEndTanks);
    tankMesh.name = `TIG_Welded_EndTank_${dir === 1 ? 'Left_Return' : 'Right_InletOutlet'}`;
    tankMesh.position.set(0, yPos, 0);
    tankMesh.castShadow = true;
    tankGroup.add(tankMesh);

    // TIG Weld Seam Beads along the front and rear tank-to-header seams
    [-spec.coreThicknessM / 2 - 0.008, spec.coreThicknessM / 2 + 0.008].forEach((wx, wIdx) => {
      const weldGeo = createTigWeldBead(spec.coreHeightM + 0.014, 0.004);
      const weldMesh = new THREE.Mesh(weldGeo, matBrazedCore);
      weldMesh.name = `TIG_Weld_Bead_${dir === 1 ? 'L' : 'R'}_${wIdx === 0 ? 'Front' : 'Rear'}`;
      weldMesh.position.set(wx, dir * (spec.coreWidthM / 2 + 0.002), 0);
      tankGroup.add(weldMesh);
    });
  });

  // Internal Dual-Pass Horizontal Baffle Plate (Right Tank, -Y)
  const internalBaffleGeo = new THREE.BoxGeometry(spec.coreThicknessM * 0.9, spec.endTankWidthM * 0.95, 0.004);
  const internalBaffleMesh = new THREE.Mesh(internalBaffleGeo, matEndTanks);
  internalBaffleMesh.name = 'DualPass_Internal_Flow_Baffle_Plate';
  internalBaffleMesh.position.set(0, -spec.coreWidthM / 2 - spec.endTankWidthM / 2, 0);
  tankGroup.add(internalBaffleMesh);

  // Upper Inlet CNC AN-16 Fitting (Right Tank, -Y, +X facing engine)
  const inletPortGroup = new THREE.Group();
  inletPortGroup.name = 'Upper_AN16_Coolant_Inlet_Port';
  inletPortGroup.position.set(spec.coreThicknessM / 2 + 0.02, -spec.coreWidthM / 2 - 0.02, 0.12);

  const inletFittingGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.045, 32);
  inletFittingGeo.rotateZ(Math.PI / 2);
  const inletFittingMesh = new THREE.Mesh(inletFittingGeo, matEndTanks);
  inletPortGroup.add(inletFittingMesh);

  const inletHexNut = new THREE.Mesh(createKnurledBand(0.026, 0.012, 6, 0.003), matCobaltAnodized);
  inletHexNut.rotation.z = Math.PI / 2;
  inletHexNut.position.set(-0.01, 0, 0);
  inletPortGroup.add(inletHexNut);
  tankGroup.add(inletPortGroup);

  // Bottom Outlet CNC AN-16 Fitting (Right Tank, -Y, +X facing engine)
  const outletPortGroup = new THREE.Group();
  outletPortGroup.name = 'Lower_AN16_Coolant_Outlet_Port';
  outletPortGroup.position.set(spec.coreThicknessM / 2 + 0.02, -spec.coreWidthM / 2 - 0.02, -0.12);

  const outletFittingGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.045, 32);
  outletFittingGeo.rotateZ(Math.PI / 2);
  const outletFittingMesh = new THREE.Mesh(outletFittingGeo, matEndTanks);
  outletPortGroup.add(outletFittingMesh);

  const outletHexNut = new THREE.Mesh(createKnurledBand(0.026, 0.012, 6, 0.003), matCobaltAnodized);
  outletHexNut.rotation.z = Math.PI / 2;
  outletHexNut.position.set(-0.01, 0, 0);
  outletPortGroup.add(outletHexNut);
  tankGroup.add(outletPortGroup);

  // Dual Coolant Temperature Sender Senders & Petcock Bleeder Valve
  if (spec.includeSensorsAndBleeder) {
    // Upper Inlet Temp Sensor
    const sensorGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.028, 16);
    const sensorMesh = new THREE.Mesh(sensorGeo, matBrass);
    sensorMesh.name = 'Inlet_Coolant_Temp_Sensor';
    sensorMesh.position.set(0, -spec.coreWidthM / 2 - spec.endTankWidthM - 0.004, 0.16);
    sensorMesh.rotation.x = Math.PI / 2;
    tankGroup.add(sensorMesh);

    // Sensor Deutsch DT 2-Pin Plug
    const plugGeo = new THREE.BoxGeometry(0.014, 0.012, 0.018);
    const plugMesh = new THREE.Mesh(plugGeo, matFanMotor);
    plugMesh.name = 'Temp_Sensor_Deutsch_Plug';
    plugMesh.position.set(0, -spec.coreWidthM / 2 - spec.endTankWidthM - 0.018, 0.16);
    tankGroup.add(plugMesh);

    // Top Air Bleed Petcock Valve (Left Tank Top)
    const petcockBodyGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.022, 16);
    const petcockBody = new THREE.Mesh(petcockBodyGeo, matBrass);
    petcockBody.name = 'Air_Bleed_Petcock_Valve';
    petcockBody.position.set(0, spec.coreWidthM / 2 + 0.02, spec.coreHeightM / 2 + 0.018);
    tankGroup.add(petcockBody);

    const petcockKnob = new THREE.Mesh(createKnurledBand(0.010, 0.008, 16), matBrass);
    petcockKnob.name = 'Petcock_Knurled_Thumb_Wheel';
    petcockKnob.position.set(0, spec.coreWidthM / 2 + 0.02, spec.coreHeightM / 2 + 0.032);
    tankGroup.add(petcockKnob);

    // Lower Magnetic Drain Plug (Left Tank Bottom)
    const drainPlug = new THREE.Mesh(createHexBoltHead(0.010, 0.008), matEndTanks);
    drainPlug.name = 'Lower_Magnetic_Coolant_Drain_Plug';
    drainPlug.position.set(0, spec.coreWidthM / 2 + 0.02, -spec.coreHeightM / 2 - 0.014);
    tankGroup.add(drainPlug);
  }

  rootGroup.add(tankGroup);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 3. BILLET FILLER NECK, RELIEF CAP & OVERFLOW EXPANSION TANK ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const fillerGroup = new THREE.Group();
  fillerGroup.name = 'FillerNeck_ExpansionTank_Subsystem';

  // Billet High-Pressure Filler Neck
  const fillerNeckGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.036, 32);
  const fillerNeckMesh = new THREE.Mesh(fillerNeckGeo, matEndTanks);
  fillerNeckMesh.name = 'Billet_Radiator_Filler_Neck';
  fillerNeckMesh.position.set(0, -spec.coreWidthM / 2 - 0.015, spec.coreHeightM / 2 + 0.024);
  fillerGroup.add(fillerNeckMesh);

  // Overflow Catch Nipple Tube
  const overflowNippleGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.018, 16);
  overflowNippleGeo.rotateZ(Math.PI / 2);
  const overflowNipple = new THREE.Mesh(overflowNippleGeo, matEndTanks);
  overflowNipple.name = 'Filler_Overflow_Nipple';
  overflowNipple.position.set(0.02, -spec.coreWidthM / 2 - 0.015, spec.coreHeightM / 2 + 0.024);
  fillerGroup.add(overflowNipple);

  // 1.3-Bar Racing Pressure Cap (Gold Anodized with Safety Lever & Plunger)
  const capGroup = new THREE.Group();
  capGroup.name = 'Pressure_1_3_Bar_Racing_Cap';
  capGroup.position.set(0, -spec.coreWidthM / 2 - 0.015, spec.coreHeightM / 2 + 0.044);

  const capBodyMesh = new THREE.Mesh(createKnurledBand(0.028, 0.014, 24, 0.002), matGoldAnodized);
  capGroup.add(capBodyMesh);

  const safetyLeverGeo = new THREE.BoxGeometry(0.038, 0.010, 0.004);
  const safetyLeverMesh = new THREE.Mesh(safetyLeverGeo, matStainless);
  safetyLeverMesh.position.set(0, 0, 0.009);
  capGroup.add(safetyLeverMesh);
  fillerGroup.add(capGroup);

  // Billet Aluminum Overflow Expansion Reservoir Tank
  if (spec.includeExpansionTank) {
    const expTankGroup = new THREE.Group();
    expTankGroup.name = 'Billet_Overflow_Expansion_Reservoir';
    expTankGroup.position.set(spec.coreThicknessM / 2 + 0.04, -spec.coreWidthM / 2 - spec.endTankWidthM - 0.02, 0.02);

    const expBodyGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.22, 32);
    const expBodyMesh = new THREE.Mesh(expBodyGeo, matEndTanks);
    expBodyMesh.castShadow = true;
    expTankGroup.add(expBodyMesh);

    // End Caps
    [-0.11, 0.11].forEach((cz) => {
      const capGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.012, 32);
      const capMesh = new THREE.Mesh(capGeo, matGoldAnodized);
      capMesh.position.set(0, 0, cz);
      expTankGroup.add(capMesh);
    });

    // Clear Quartz Glass Coolant Level Sight Tube
    const sightTubeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.15, 16);
    const sightTubeMesh = new THREE.Mesh(sightTubeGeo, matClearGlass);
    sightTubeMesh.position.set(0.038, 0, 0);
    expTankGroup.add(sightTubeMesh);

    // Sight Tube Brass Fittings
    [-0.075, 0.075].forEach((fz) => {
      const fGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.016, 16);
      fGeo.rotateZ(Math.PI / 2);
      const fMesh = new THREE.Mesh(fGeo, matBrass);
      fMesh.position.set(0.034, 0, fz);
      expTankGroup.add(fMesh);
    });

    // Stainless Mounting Band Straps
    [-0.06, 0.06].forEach((sz) => {
      const bandMesh = new THREE.Mesh(createHoseClamp(0.074, 0.012), matStainless);
      bandMesh.rotation.x = Math.PI / 2;
      bandMesh.position.set(0, 0, sz);
      expTankGroup.add(bandMesh);
    });

    fillerGroup.add(expTankGroup);
  }

  rootGroup.add(fillerGroup);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 4. CARBON MONOCOQUE SHROUD, BYPASS FLAPS & DUAL BRUSHLESS FANS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const fanGroup = new THREE.Group();
  fanGroup.name = 'Carbon_Shroud_TwinFans_Subsystem';

  // Aerodynamic Monocoque Dry Carbon Fan Shroud Panel
  const shroudGeo = new THREE.BoxGeometry(0.028, spec.coreWidthM - 0.02, spec.coreHeightM - 0.02);
  const shroudMesh = new THREE.Mesh(shroudGeo, matCarbonShroud);
  shroudMesh.name = 'Dry_Carbon_Aerodynamic_Fan_Shroud';
  shroudMesh.position.set(spec.coreThicknessM / 2 + 0.014, 0, 0);
  shroudMesh.castShadow = true;
  fanGroup.add(shroudMesh);

  // 8 Perimeter Shroud Mounting Brackets with M6 Hex Socket Bolts
  for (let b = 0; b < 8; b++) {
    const angle = (b * Math.PI * 2) / 8;
    const by = Math.sin(angle) * (spec.coreWidthM / 2 - 0.03);
    const bz = Math.cos(angle) * (spec.coreHeightM / 2 - 0.03);
    const boltMesh = new THREE.Mesh(createAllenSocketHead(0.005, 0.008), matStainless);
    boltMesh.name = `Shroud_Mount_Bolt_${b + 1}`;
    boltMesh.position.set(spec.coreThicknessM / 2 + 0.028, by, bz);
    fanGroup.add(boltMesh);
  }

  // 6 Dynamic Air Bypass Flaps (Rubber Flaps with Stainless Hinge Plates)
  if (spec.includeBypassFlaps) {
    [
      [-0.26, 0.14], [0.26, 0.14],
      [-0.26, 0.00], [0.26, 0.00],
      [-0.26, -0.14], [0.26, -0.14],
    ].forEach(([fy, fz], flapIdx) => {
      const flapFrameGeo = new THREE.BoxGeometry(0.004, 0.045, 0.065);
      const flapFrame = new THREE.Mesh(flapFrameGeo, matEPDMRubber);
      flapFrame.name = `Air_Bypass_Flap_${flapIdx + 1}`;
      flapFrame.position.set(spec.coreThicknessM / 2 + 0.029, fy, fz);
      fanGroup.add(flapFrame);

      const hingeGeo = new THREE.BoxGeometry(0.002, 0.045, 0.008);
      const hingeMesh = new THREE.Mesh(hingeGeo, matStainless);
      hingeMesh.position.set(spec.coreThicknessM / 2 + 0.031, fy, fz + 0.030);
      fanGroup.add(hingeMesh);
    });
  }

  // Twin 280mm 9-Blade High-Torque Brushless Puller Fan Assemblies
  [-0.16, 0.16].forEach((fy, fIdx) => {
    const singleFanGroup = new THREE.Group();
    singleFanGroup.name = `Brushless_Puller_Fan_Assembly_${fIdx + 1}`;
    singleFanGroup.position.set(spec.coreThicknessM / 2 + 0.028, fy, 0);

    // Fan Outer Protective Cowl Ring with Venturi Contour
    const cowlGeo = new THREE.CylinderGeometry(spec.fanDiameterM / 2, spec.fanDiameterM / 2, 0.036, 48, 1, true);
    cowlGeo.rotateZ(Math.PI / 2);
    const cowlMesh = new THREE.Mesh(cowlGeo, matCarbonShroud);
    cowlMesh.name = `Fan_Cowl_Venturi_Ring_${fIdx + 1}`;
    singleFanGroup.add(cowlMesh);

    // Center Brushless Electric Motor Hub with Heatsink Fins
    const hubGeo = new THREE.CylinderGeometry(0.044, 0.044, 0.040, 32);
    hubGeo.rotateZ(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, matFanMotor);
    hubMesh.name = `Brushless_Fan_Motor_Hub_${fIdx + 1}`;
    singleFanGroup.add(hubMesh);

    // Radial Motor Cooling Fins
    for (let fin = 0; fin < 8; fin++) {
      const fAngle = (fin * Math.PI * 2) / 8;
      const finGeo = new THREE.BoxGeometry(0.038, 0.002, 0.012);
      finGeo.rotateX(fAngle);
      const finMesh = new THREE.Mesh(finGeo, matEndTanks);
      finMesh.position.set(0.002, Math.cos(fAngle) * 0.038, Math.sin(fAngle) * 0.038);
      singleFanGroup.add(finMesh);
    }

    // 9 Aerodynamic Curved Airfoil Fan Blades with Trailing Edge Winglets
    const bladeCount = spec.fanBladeCount || 9;
    for (let b = 0; b < bladeCount; b++) {
      const bAngle = (b * Math.PI * 2) / bladeCount;
      const bladeGeo = createTurbineAirfoilBlade(spec.fanDiameterM / 2 - 0.048, 0.028, 0.018, 38, 0.003);
      bladeGeo.rotateZ(Math.PI / 2);
      bladeGeo.rotateX(bAngle);
      const bladeMesh = new THREE.Mesh(bladeGeo, matFanBlades);
      bladeMesh.name = `Puller_Fan_Blade_${fIdx + 1}_${b + 1}`;
      bladeMesh.position.set(0.004, Math.cos(bAngle) * 0.082, Math.sin(bAngle) * 0.082);
      singleFanGroup.add(bladeMesh);
    }

    fanGroup.add(singleFanGroup);
  });

  // Fan Wiring Harness & Junction Box
  if (spec.includeWiringHarness) {
    const harnessGroup = new THREE.Group();
    harnessGroup.name = 'Fan_Electrical_Wiring_Harness';

    // Black Nylon Braided Conduit along shroud top
    const harnessCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(spec.coreThicknessM / 2 + 0.04, -0.16, 0.02),
      new THREE.Vector3(spec.coreThicknessM / 2 + 0.04, 0.00, 0.05),
      new THREE.Vector3(spec.coreThicknessM / 2 + 0.04, 0.16, 0.02),
      new THREE.Vector3(spec.coreThicknessM / 2 + 0.04, 0.28, -0.05),
    ]);
    const harnessGeo = new THREE.TubeGeometry(harnessCurve, 24, 0.005, 12, false);
    const harnessMesh = new THREE.Mesh(harnessGeo, matFanMotor);
    harnessGroup.add(harnessMesh);

    // Central 4-Pin Sealed Relay Connector Box
    const relayBoxGeo = new THREE.BoxGeometry(0.024, 0.035, 0.025);
    const relayBox = new THREE.Mesh(relayBoxGeo, matFanMotor);
    relayBox.name = 'Fan_Relay_Junction_Box';
    relayBox.position.set(spec.coreThicknessM / 2 + 0.04, 0.28, -0.05);
    harnessGroup.add(relayBox);

    fanGroup.add(harnessGroup);
  }

  rootGroup.add(fanGroup);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 5. AUXILIARY 10-ROW STACKED-PLATE OIL COOLER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  if (spec.includeAuxiliaryOilCooler) {
    const oilCoolerGroup = new THREE.Group();
    oilCoolerGroup.name = 'Auxiliary_StackedPlate_OilCooler_Subsystem';
    oilCoolerGroup.position.set(-spec.coreThicknessM / 2 - 0.035, 0, -0.08);

    // 10 Stacked Aluminum Plates
    const plateGeos: THREE.BufferGeometry[] = [];
    for (let p = 0; p < 10; p++) {
      const pz = -0.06 + p * 0.013;
      const pGeo = new THREE.BoxGeometry(0.028, 0.32, 0.006);
      pGeo.translate(0, 0, pz);
      plateGeos.push(pGeo);
    }
    const mergedOilPlates = mergeBufferGeometries(plateGeos);
    const oilPlatesMesh = new THREE.Mesh(mergedOilPlates, matEndTanks);
    oilPlatesMesh.name = 'Stacked_Aluminum_Oil_Cooler_Plates';
    oilCoolerGroup.add(oilPlatesMesh);

    // Side End Tanks
    [-0.165, 0.165].forEach((oy) => {
      const oTankGeo = new THREE.BoxGeometry(0.032, 0.018, 0.14);
      const oTankMesh = new THREE.Mesh(oTankGeo, matEndTanks);
      oTankMesh.position.set(0, oy, 0);
      oilCoolerGroup.add(oTankMesh);
    });

    // AN-10 90-Degree Swivel Hose Fittings (Red/Blue Anodized)
    [-0.165, 0.165].forEach((oy, oIdx) => {
      const anFitting = new THREE.Mesh(createKnurledBand(0.014, 0.018, 6, 0.002), oIdx === 0 ? matRedAnodized : matCobaltAnodized);
      anFitting.position.set(-0.018, oy, 0.06);
      anFitting.rotation.y = Math.PI / 2;
      oilCoolerGroup.add(anFitting);
    });

    // Billet Standoff Mounting Brackets securing oil cooler to radiator core
    [-0.12, 0.12].forEach((by) => {
      const bracketGeo = new THREE.BoxGeometry(0.035, 0.012, 0.006);
      const bracketMesh = new THREE.Mesh(bracketGeo, matStainless);
      bracketMesh.position.set(0.018, by, 0);
      oilCoolerGroup.add(bracketMesh);
    });

    rootGroup.add(oilCoolerGroup);
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 6. TRACK DEBRIS PROTECTIVE MESH GRILLE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  if (spec.includeDebrisGrille) {
    const grilleGroup = new THREE.Group();
    grilleGroup.name = 'TrackDebris_StoneGuard_Subsystem';

    // Woven wire mesh grid (merged wire strips) - see-through stone guard
    const wireGeos: THREE.BufferGeometry[] = [];
    const meshCols = 26;
    const meshRows = 44;
    for (let wc = 0; wc <= meshCols; wc++) {
      const wy = -spec.coreWidthM / 2 + 0.005 + (wc / meshCols) * (spec.coreWidthM - 0.01);
      const wGeo = new THREE.BoxGeometry(0.0012, 0.0016, spec.coreHeightM - 0.01);
      wGeo.translate(0, wy, 0);
      wireGeos.push(wGeo);
    }
    for (let wr = 0; wr <= meshRows; wr++) {
      const wz = -spec.coreHeightM / 2 + 0.005 + (wr / meshRows) * (spec.coreHeightM - 0.01);
      const wGeo = new THREE.BoxGeometry(0.0012, spec.coreWidthM - 0.01, 0.0016);
      wGeo.translate(0, 0, wz);
      wireGeos.push(wGeo);
    }
    const meshItem = new THREE.Mesh(mergeBufferGeometries(wireGeos), matStainless);
    meshItem.name = 'Titanium_Hexagonal_Stone_Guard_Mesh';
    meshItem.position.set(-spec.coreThicknessM / 2 - 0.006, 0, 0);
    grilleGroup.add(meshItem);

    // 4 Corner Clip Brackets
    [
      [-spec.coreWidthM / 2 + 0.02, -spec.coreHeightM / 2 + 0.02],
      [spec.coreWidthM / 2 - 0.02, -spec.coreHeightM / 2 + 0.02],
      [-spec.coreWidthM / 2 + 0.02, spec.coreHeightM / 2 - 0.02],
      [spec.coreWidthM / 2 - 0.02, spec.coreHeightM / 2 - 0.02],
    ].forEach(([gy, gz], cIdx) => {
      const clipGeo = new THREE.BoxGeometry(0.012, 0.020, 0.020);
      const clipMesh = new THREE.Mesh(clipGeo, matStainless);
      clipMesh.name = `Stone_Guard_Clip_${cIdx + 1}`;
      clipMesh.position.set(-spec.coreThicknessM / 2 - 0.008, gy, gz);
      grilleGroup.add(clipMesh);
    });

    rootGroup.add(grilleGroup);
  }

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 7. 4-PLY KEVLAR SILICONE HOSES & STAINLESS T-BOLT CLAMPS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const hoseGroup = new THREE.Group();
  hoseGroup.name = 'Silicone_Hoses_TClamps_Subsystem';

  // Upper Inlet Swept Silicone Hose
  const upperHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(spec.coreThicknessM / 2 + 0.02, -spec.coreWidthM / 2 - 0.02, 0.12),
    new THREE.Vector3(0.12, -spec.coreWidthM / 2 + 0.08, 0.16),
    new THREE.Vector3(0.24, -0.16, 0.18),
  ]);
  const upperHoseGeo = new THREE.TubeGeometry(upperHoseCurve, 32, 0.020, 20, false);
  const upperHoseMesh = new THREE.Mesh(upperHoseGeo, matSiliconeHose);
  upperHoseMesh.name = 'Kevlar_Upper_Coolant_Hose';
  upperHoseMesh.castShadow = true;
  hoseGroup.add(upperHoseMesh);

  // Upper Hose T-Bolt Stainless Clamps
  const clamp1 = new THREE.Mesh(createHoseClamp(0.045, 0.008), matStainless);
  clamp1.position.set(spec.coreThicknessM / 2 + 0.035, -spec.coreWidthM / 2 - 0.02, 0.12);
  hoseGroup.add(clamp1);

  // Lower Outlet Swept Silicone Hose
  const lowerHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(spec.coreThicknessM / 2 + 0.02, -spec.coreWidthM / 2 - 0.02, -0.12),
    new THREE.Vector3(0.12, -spec.coreWidthM / 2 + 0.08, -0.08),
    new THREE.Vector3(0.24, -0.05, 0.02),
  ]);
  const lowerHoseGeo = new THREE.TubeGeometry(lowerHoseCurve, 32, 0.020, 20, false);
  const lowerHoseMesh = new THREE.Mesh(lowerHoseGeo, matSiliconeHose);
  lowerHoseMesh.name = 'Kevlar_Lower_Coolant_Hose';
  lowerHoseMesh.castShadow = true;
  hoseGroup.add(lowerHoseMesh);

  // Lower Hose T-Bolt Stainless Clamps
  const clamp2 = new THREE.Mesh(createHoseClamp(0.045, 0.008), matStainless);
  clamp2.position.set(spec.coreThicknessM / 2 + 0.035, -spec.coreWidthM / 2 - 0.02, -0.12);
  hoseGroup.add(clamp2);

  // Engine-Side Hose End Bead Rings & Clamps
  const endClamp1 = new THREE.Mesh(createHoseClamp(0.045, 0.008), matStainless);
  endClamp1.position.set(0.225, -0.155, 0.175);
  hoseGroup.add(endClamp1);

  const endClamp2 = new THREE.Mesh(createHoseClamp(0.045, 0.008), matStainless);
  endClamp2.position.set(0.225, -0.06, 0.015);
  hoseGroup.add(endClamp2);

  const hoseBeadGeo = new THREE.TorusGeometry(0.021, 0.0025, 10, 24);
  const hoseBead1 = new THREE.Mesh(hoseBeadGeo, matEndTanks);
  hoseBead1.name = 'Upper_Hose_Mating_Bead_Ring';
  hoseBead1.position.set(0.243, -0.148, 0.181);
  hoseBead1.rotation.y = 0.5;
  hoseGroup.add(hoseBead1);

  const hoseBead2 = new THREE.Mesh(hoseBeadGeo, matEndTanks);
  hoseBead2.name = 'Lower_Hose_Mating_Bead_Ring';
  hoseBead2.position.set(0.243, -0.052, 0.024);
  hoseBead2.rotation.y = 0.5;
  hoseGroup.add(hoseBead2);

  rootGroup.add(hoseGroup);

  return scene;
}

/**
 * Exports the radiator scene to a binary GLB ArrayBuffer.
 */
export async function generateRadiatorGlbBuffer(customSpec?: Partial<RadiatorSpec>): Promise<ArrayBuffer> {
  const scene = buildRadiatorScene(customSpec);
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

export default buildRadiatorScene;

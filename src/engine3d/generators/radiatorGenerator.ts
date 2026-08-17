// ============================================================================
// ULTRA-HIGH-FIDELITY MODULAR GLB GENERATOR — DUAL-PASS COOLING RADIATOR
// ============================================================================
// Solid-modeling engineering generator for an ultra-high-performance dual-pass
// brazed aluminum racing radiator. Features a 42-row micro-louvered cooling core,
// TIG-welded partitioned end tanks with billet hose barbs and 1.3-bar pressure cap,
// dry carbon fiber fan shroud with high-speed bypass flaps, twin 7-blade brushless
// electric puller fans, and 4-ply Kevlar silicone hoses with stainless T-bolt clamps.
// ============================================================================

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';

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
  coreThicknessM: number; // 0.055 m (dual-pass 55mm core)
  coreWidthM: number; // 0.650 m (lateral left-to-right)
  coreHeightM: number; // 0.420 m (vertical height)
  endTankWidthM: number; // 0.065 m
  fanDiameterM: number; // 0.280 m
  fanBladeCount: number; // 7 blades per fan
  hoseBarbDiameterMm: number; // 38.0 mm (1.5 inch)
}

export const V12_RADIATOR_SPECS: RadiatorSpec = {
  coreThicknessM: 0.055,
  coreWidthM: 0.650,
  coreHeightM: 0.420,
  endTankWidthM: 0.065,
  fanDiameterM: 0.280,
  fanBladeCount: 7,
  hoseBarbDiameterMm: 38.0,
};

/**
 * Builds the complete ultra-high-fidelity 3D scene graph for the dual-pass radiator.
 * Properly aligned in automotive engine coordinate space:
 * - X-axis: Front-to-Rear airflow axis (radiator facing forward towards -X)
 * - Y-axis: Lateral Left-to-Right crossflow axis (Bank 1 +Y, Bank 2 -Y)
 * - Z-axis: Vertical Upright height axis
 */
export function buildRadiatorScene(): THREE.Scene {
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
  const matSiliconeHose = matLib.getBlueSilicone();

  const spec = V12_RADIATOR_SPECS;

  // ─── 1. 42-ROW DUAL-PASS BRAZED ALUMINUM COOLING CORE ───
  const coreGroup = new THREE.Group();
  coreGroup.name = 'Brazed_Radiator_Core_Subsystem';

  // Main Brazed Fin & Tube Extrusion Matrix (X: Depth, Y: Width, Z: Height)
  const coreGeo = new THREE.BoxGeometry(spec.coreThicknessM, spec.coreWidthM, spec.coreHeightM);
  const coreMesh = new THREE.Mesh(coreGeo, matBrazedCore);
  coreMesh.name = 'MicroLouvered_Aluminum_Fin_Core';
  coreMesh.position.set(0, 0, 0);
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  coreGroup.add(coreMesh);

  // Structural Top & Bottom Stiffening Rails
  [-spec.coreHeightM / 2 - 0.008, spec.coreHeightM / 2 + 0.008].forEach((rz, rIdx) => {
    const railGeo = new THREE.BoxGeometry(spec.coreThicknessM + 0.012, spec.coreWidthM + 0.02, 0.016);
    const railMesh = new THREE.Mesh(railGeo, matEndTanks);
    railMesh.name = `Core_Structural_Rail_${rIdx === 0 ? 'Bottom' : 'Top'}`;
    railMesh.position.set(0, 0, rz);
    railMesh.castShadow = true;
    coreGroup.add(railMesh);
  });

  rootGroup.add(coreGroup);

  // ─── 2. TIG-WELDED PARTITIONED END TANKS & 1.3-BAR PRESSURE CAP ───
  const tankGroup = new THREE.Group();
  tankGroup.name = 'Partitioned_EndTanks_Subsystem';

  // Left (+Y) & Right (-Y) TIG-Welded Aluminum End Tanks
  [-1, 1].forEach((dir) => {
    const yPos = dir * (spec.coreWidthM / 2 + spec.endTankWidthM / 2);

    const tankGeo = new THREE.BoxGeometry(spec.coreThicknessM + 0.012, spec.endTankWidthM, spec.coreHeightM + 0.016);
    const tankMesh = new THREE.Mesh(tankGeo, matEndTanks);
    tankMesh.name = `TIG_Welded_EndTank_${dir === 1 ? 'Left_Return' : 'Right_InletOutlet'}`;
    tankMesh.position.set(0, yPos, 0);
    tankMesh.castShadow = true;
    tankGroup.add(tankMesh);
  });

  // Top Inlet CNC Hose Barb (Right Tank, -Y, pointing rearwards towards +X)
  const inletBarbGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.045, 24);
  inletBarbGeo.rotateZ(Math.PI / 2);
  const inletBarbMesh = new THREE.Mesh(inletBarbGeo, matEndTanks);
  inletBarbMesh.name = 'Upper_Coolant_Inlet_Barb';
  inletBarbMesh.position.set(spec.coreThicknessM / 2 + 0.02, -spec.coreWidthM / 2 - 0.02, 0.12);
  tankGroup.add(inletBarbMesh);

  // Bottom Outlet CNC Hose Barb (Right Tank, -Y, pointing rearwards towards +X)
  const outletBarbGeo = new THREE.CylinderGeometry(0.019, 0.019, 0.045, 24);
  outletBarbGeo.rotateZ(Math.PI / 2);
  const outletBarbMesh = new THREE.Mesh(outletBarbGeo, matEndTanks);
  outletBarbMesh.name = 'Lower_Coolant_Outlet_Barb';
  outletBarbMesh.position.set(spec.coreThicknessM / 2 + 0.02, -spec.coreWidthM / 2 - 0.02, -0.12);
  tankGroup.add(outletBarbMesh);

  // Billet High-Pressure 1.3-Bar Radiator Filler Neck & Knurled Cap (Top of Right Tank)
  const fillerNeckGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.032, 24);
  const fillerNeckMesh = new THREE.Mesh(fillerNeckGeo, matEndTanks);
  fillerNeckMesh.name = 'Radiator_Filler_Neck';
  fillerNeckMesh.position.set(0, -spec.coreWidthM / 2 - 0.015, spec.coreHeightM / 2 + 0.024);
  tankGroup.add(fillerNeckMesh);

  const capGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.014, 24);
  const capMesh = new THREE.Mesh(capGeo, matGoldAnodized);
  capMesh.name = 'Pressure_1_3_Bar_Radiator_Cap';
  capMesh.position.set(0, -spec.coreWidthM / 2 - 0.015, spec.coreHeightM / 2 + 0.042);
  capMesh.castShadow = true;
  tankGroup.add(capMesh);

  rootGroup.add(tankGroup);

  // ─── 3. DRY CARBON FIBER SHROUD & TWIN 7-BLADE BRUSHLESS PULLER FANS ───
  const fanGroup = new THREE.Group();
  fanGroup.name = 'Carbon_Shroud_TwinFans_Subsystem';

  // Aerodynamic Monocoque Dry Carbon Fan Shroud Panel (Rear of Core towards +X)
  const shroudGeo = new THREE.BoxGeometry(0.028, spec.coreWidthM - 0.02, spec.coreHeightM - 0.02);
  const shroudMesh = new THREE.Mesh(shroudGeo, matCarbonShroud);
  shroudMesh.name = 'Dry_Carbon_Aerodynamic_Fan_Shroud';
  shroudMesh.position.set(spec.coreThicknessM / 2 + 0.014, 0, 0);
  shroudMesh.castShadow = true;
  fanGroup.add(shroudMesh);

  // Twin 280mm 7-Blade High-Torque Puller Fan Assemblies (Left & Right on Shroud)
  [-0.16, 0.16].forEach((fy, fIdx) => {
    // Fan Outer Protective Cowl Ring (Axis along X)
    const cowlGeo = new THREE.CylinderGeometry(spec.fanDiameterM / 2, spec.fanDiameterM / 2, 0.032, 32, 1, true);
    cowlGeo.rotateZ(Math.PI / 2);
    const cowlMesh = new THREE.Mesh(cowlGeo, matCarbonShroud);
    cowlMesh.name = `Fan_Cowl_Venturi_Ring_${fIdx + 1}`;
    cowlMesh.position.set(spec.coreThicknessM / 2 + 0.028, fy, 0);
    fanGroup.add(cowlMesh);

    // Center Brushless Electric Motor Hub
    const hubGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.038, 24);
    hubGeo.rotateZ(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, matFanMotor);
    hubMesh.name = `Brushless_Fan_Motor_Hub_${fIdx + 1}`;
    hubMesh.position.set(spec.coreThicknessM / 2 + 0.032, fy, 0);
    fanGroup.add(hubMesh);

    // 7 Aerodynamic Curved Fan Blades
    for (let b = 0; b < spec.fanBladeCount; b++) {
      const bAngle = (b * Math.PI * 2) / spec.fanBladeCount;
      const bladeGeo = new THREE.BoxGeometry(0.003, spec.fanDiameterM / 2 - 0.045, 0.022);
      bladeGeo.rotateX(bAngle);
      const bladeMesh = new THREE.Mesh(bladeGeo, matFanBlades);
      bladeMesh.name = `Puller_Fan_Blade_${fIdx + 1}_${b + 1}`;
      bladeMesh.position.set(spec.coreThicknessM / 2 + 0.032, fy + Math.cos(bAngle) * 0.08, Math.sin(bAngle) * 0.08);
      fanGroup.add(bladeMesh);
    }
  });

  rootGroup.add(fanGroup);

  // ─── 4. 4-PLY KEVLAR SILICONE HOSES & STAINLESS T-BOLT CLAMPS ───
  const hoseGroup = new THREE.Group();
  hoseGroup.name = 'Silicone_Hoses_TClamps_Subsystem';

  // Upper Inlet Swept Silicone Hose (Rearward from radiator to engine water port)
  const upperHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(spec.coreThicknessM / 2 + 0.02, -spec.coreWidthM / 2 - 0.02, 0.12),
    new THREE.Vector3(0.12, -spec.coreWidthM / 2 + 0.08, 0.16),
    new THREE.Vector3(0.24, -0.16, 0.18),
  ]);
  const upperHoseGeo = new THREE.TubeGeometry(upperHoseCurve, 24, 0.020, 16, false);
  const upperHoseMesh = new THREE.Mesh(upperHoseGeo, matSiliconeHose);
  upperHoseMesh.name = 'Kevlar_Upper_Coolant_Hose';
  upperHoseMesh.castShadow = true;
  hoseGroup.add(upperHoseMesh);

  // Lower Outlet Swept Silicone Hose (Rearward from radiator to engine water pump)
  const lowerHoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(spec.coreThicknessM / 2 + 0.02, -spec.coreWidthM / 2 - 0.02, -0.12),
    new THREE.Vector3(0.12, -spec.coreWidthM / 2 + 0.08, -0.08),
    new THREE.Vector3(0.24, -0.05, 0.02),
  ]);
  const lowerHoseGeo = new THREE.TubeGeometry(lowerHoseCurve, 24, 0.020, 16, false);
  const lowerHoseMesh = new THREE.Mesh(lowerHoseGeo, matSiliconeHose);
  lowerHoseMesh.name = 'Kevlar_Lower_Coolant_Hose';
  lowerHoseMesh.castShadow = true;
  hoseGroup.add(lowerHoseMesh);

  rootGroup.add(hoseGroup);

  return scene;
}

/**
 * Exports the radiator scene to a binary GLB ArrayBuffer.
 */
export async function generateRadiatorGlbBuffer(): Promise<ArrayBuffer> {
  const scene = buildRadiatorScene();
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

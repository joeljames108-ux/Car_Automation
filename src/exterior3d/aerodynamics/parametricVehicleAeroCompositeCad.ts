// ============================================================================
// PHASE 118: MASTER PARAMETRIC VEHICLE AERODYNAMIC COMPOSITE CAD
// ============================================================================
// Assembles the core vehicle chassis with all 6 live parametric aerodynamic
// subsystems: Front Wing, Sidepods, Ground Effect Floor, Diffuser, Rear Wing,
// and Canards, supporting real-time geometry deformation, photorealistic PBR
// clearcoat materials, sports wheel assemblies, and reference 3D GLB model loading.
// ============================================================================

import * as THREE from 'three';
import type { MasterAeroStudioConfig, AeroVisualMode } from '../../sim/aerodynamics/aeroStudioTypes';
import { ParametricFrontWingCad } from './parametricFrontWingCad';
import { ParametricRearWingCad } from './parametricRearWingCad';
import { ParametricGroundEffectFloorCad } from './parametricGroundEffectFloorCad';
import { ParametricSidepodCad } from './parametricSidepodCad';
import { ParametricDiffuserCad } from './parametricDiffuserCad';
import { ParametricCanardArrayCad } from './parametricCanardArrayCad';
import { UniversalGlbAssetLoader } from '../loaders/universalGlbAssetLoader';
import { AutomotivePBRMaterialSystem } from '../materials/automotivePBRMaterialSystem';

export class ParametricVehicleAeroCompositeCad {
  /**
   * Generates a high-polygon, photorealistic sculpted GT3/Hypercar chassis body.
   */
  private static buildBaseChassisBody(visualMode: AeroVisualMode): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Base_Vehicle_Chassis_Body';

    const isWireframe = visualMode === 'wireframe';
    const isCfd = visualMode === 'cfdPressure';

    // ── 1. Photorealistic Automotive Paint & PBR Materials ──
    const paintColor = isCfd ? 0x0284c7 : 0x0f172a; // Deep Carbon / Azure CFD
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: paintColor,
      metalness: 0.85,
      roughness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.95,
      wireframe: isWireframe,
    });

    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.2,
      normalMap: typeof document !== 'undefined' ? AutomotivePBRMaterialSystem.getCarbonWeaveNormalTexture() : null,
      wireframe: isWireframe,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.1,
      roughness: 0.02,
      transmission: 0.9,
      transparent: true,
      opacity: 0.88,
      ior: 1.52,
      wireframe: isWireframe,
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Forged Satin Bronze / Champagne
      metalness: 0.95,
      roughness: 0.14,
      wireframe: isWireframe,
    });

    const rotorMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.35,
      normalMap: typeof document !== 'undefined' ? AutomotivePBRMaterialSystem.getBrakeRotorNormalTexture() : null,
      wireframe: isWireframe,
    });

    const caliperMaterial = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Brembo Gloss Red
      metalness: 0.7,
      roughness: 0.15,
      wireframe: isWireframe,
    });

    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x080b10,
      metalness: 0.1,
      roughness: 0.85,
      wireframe: isWireframe,
    });

    const lightEmissiveMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0xfbbf24,
      emissiveIntensity: isWireframe ? 0 : 2.5,
      metalness: 0.2,
      roughness: 0.1,
    });

    const tailLightMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: isWireframe ? 0 : 3.0,
      metalness: 0.1,
      roughness: 0.1,
    });

    // ── 2. Sculpted Monocoque Cockpit & Teardrop Canopy ──
    const canopyGeo = new THREE.SphereGeometry(1.0, 32, 16);
    canopyGeo.scale(0.62, 0.42, 1.45);
    const canopy = new THREE.Mesh(canopyGeo, glassMaterial);
    canopy.position.set(0, 0.72, -0.05);
    canopy.castShadow = true;
    group.add(canopy);

    // Roof Center Spine / Air Scoop
    const roofScoopGeo = new THREE.BoxGeometry(0.24, 0.08, 0.9);
    const roofScoop = new THREE.Mesh(roofScoopGeo, carbonMaterial);
    roofScoop.position.set(0, 0.98, 0.1);
    group.add(roofScoop);

    // ── 3. Main Center Body Tub & Side Waistline ──
    const tubGeo = new THREE.BoxGeometry(1.48, 0.38, 3.85);
    const tub = new THREE.Mesh(tubGeo, bodyMaterial);
    tub.position.set(0, 0.40, 0);
    tub.castShadow = true;
    tub.receiveShadow = true;
    group.add(tub);

    // ── 4. Sculpted Front Hood & Air Extraction Louvers ──
    const hoodGeo = new THREE.BoxGeometry(1.42, 0.12, 1.35);
    const hood = new THREE.Mesh(hoodGeo, bodyMaterial);
    hood.position.set(0, 0.52, -1.25);
    hood.rotation.x = 0.08;
    group.add(hood);

    // Hood Center Vented Extraction Channel
    const louverGeo = new THREE.BoxGeometry(0.55, 0.04, 0.65);
    const louver = new THREE.Mesh(louverGeo, carbonMaterial);
    louver.position.set(0, 0.55, -1.2);
    group.add(louver);

    // ── 5. Aerodynamic Front Fascia & Matrix LED Headlights ──
    const noseGeo = new THREE.ConeGeometry(0.68, 0.95, 8);
    noseGeo.scale(1.2, 0.45, 1.1);
    const nose = new THREE.Mesh(noseGeo, bodyMaterial);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0.38, -2.12);
    nose.castShadow = true;
    group.add(nose);

    // Front Headlight Crystals (Left & Right)
    const hlGeo = new THREE.BoxGeometry(0.26, 0.06, 0.38);
    const leftHl = new THREE.Mesh(hlGeo, lightEmissiveMaterial);
    leftHl.position.set(-0.54, 0.46, -1.95);
    leftHl.rotation.y = -0.22;
    group.add(leftHl);

    const rightHl = new THREE.Mesh(hlGeo, lightEmissiveMaterial);
    rightHl.position.set(0.54, 0.46, -1.95);
    rightHl.rotation.y = 0.22;
    group.add(rightHl);

    // ── 6. Muscular Front & Rear Wheel Arches (Widebody Fenders) ──
    const createFender = (x: number, z: number, isRear: boolean) => {
      const fenderGeo = new THREE.CylinderGeometry(0.46, 0.48, 0.34, 24, 1, true, 0, Math.PI);
      fenderGeo.rotateZ(Math.PI / 2);
      const fender = new THREE.Mesh(fenderGeo, bodyMaterial);
      fender.position.set(x, 0.44, z);
      fender.scale.set(1.0, isRear ? 1.08 : 0.98, 1.0);
      fender.castShadow = true;
      return fender;
    };

    group.add(createFender(-0.76, -1.4, false));
    group.add(createFender(0.76, -1.4, false));
    group.add(createFender(-0.78, 1.4, true));
    group.add(createFender(0.78, 1.4, true));

    // ── 7. Rear Deck, Exhaust Tips & OLED Light Blade ──
    const rearDeckGeo = new THREE.BoxGeometry(1.44, 0.22, 1.25);
    const rearDeck = new THREE.Mesh(rearDeckGeo, bodyMaterial);
    rearDeck.position.set(0, 0.50, 1.35);
    group.add(rearDeck);

    // Rear OLED Light Blade
    const tailBladeGeo = new THREE.BoxGeometry(1.36, 0.04, 0.06);
    const tailBlade = new THREE.Mesh(tailBladeGeo, tailLightMaterial);
    tailBlade.position.set(0, 0.52, 1.96);
    group.add(tailBlade);

    // Dual Center Titanium Exhaust Tips
    const exhaustGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 16);
    exhaustGeo.rotateX(Math.PI / 2);
    const leftExhaust = new THREE.Mesh(exhaustGeo, rimMaterial);
    leftExhaust.position.set(-0.08, 0.36, 1.94);
    group.add(leftExhaust);

    const rightExhaust = new THREE.Mesh(exhaustGeo, rimMaterial);
    rightExhaust.position.set(0.08, 0.36, 1.94);
    group.add(rightExhaust);

    // ── 8. Detailed Performance Sports Wheel Assemblies (4 corners) ──
    const createWheelAssembly = (x: number, z: number, isRight: boolean) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, 0.34, z);

      // Tire with 3D Profile
      const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.28, 32);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMaterial);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Multi-Spoke Forged Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.284, 24);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMaterial);
      wheelGroup.add(rim);

      // Center Hub & Lug Nuts
      const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.29, 12);
      hubGeo.rotateZ(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, carbonMaterial);
      wheelGroup.add(hub);

      // Cross-Drilled Carbon Ceramic Brake Rotor
      const rotorGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.025, 24);
      rotorGeo.rotateZ(Math.PI / 2);
      const rotor = new THREE.Mesh(rotorGeo, rotorMaterial);
      rotor.position.set(isRight ? -0.06 : 0.06, 0, 0);
      wheelGroup.add(rotor);

      // Brembo Monobloc Brake Caliper
      const caliperGeo = new THREE.BoxGeometry(0.04, 0.11, 0.08);
      const caliper = new THREE.Mesh(caliperGeo, caliperMaterial);
      caliper.position.set(isRight ? -0.06 : 0.06, 0.12, -0.05);
      wheelGroup.add(caliper);

      return wheelGroup;
    };

    group.add(createWheelAssembly(-0.85, -1.4, false)); // FL
    group.add(createWheelAssembly(0.85, -1.4, true));   // FR
    group.add(createWheelAssembly(-0.88, 1.4, false));  // RL
    group.add(createWheelAssembly(0.88, 1.4, true));   // RR

    return group;
  }

  /**
   * Composites the entire vehicle with live parametric aero components.
   */
  public static buildFullAerodynamicVehicle3D(
    config: MasterAeroStudioConfig,
    visualMode: AeroVisualMode = 'realistic'
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = 'Master_Parametric_Aerodynamics_Vehicle';

    // 1. Base Chassis Body Shell (High-poly sculpted hypercar)
    const baseBody = this.buildBaseChassisBody(visualMode);
    root.add(baseBody);

    // 2. Parametric Front Wing (Mounted at forward nose anchor: Z = -2.25m)
    const frontWing = ParametricFrontWingCad.buildFrontWing3D(
      config.frontWing,
      visualMode === 'cfdPressure' ? 'cfdPressure' : visualMode === 'wireframe' ? 'wireframe' : 'realistic'
    );
    frontWing.position.set(0, 0, -2.25);
    root.add(frontWing);

    // 3. Parametric Sidepods (Mounted at midship chassis: Z = 0.0m)
    const sidepods = ParametricSidepodCad.buildSidepods3D(
      config.sidepod,
      visualMode === 'cfdPressure' ? 'cfdPressure' : visualMode === 'wireframe' ? 'wireframe' : 'realistic'
    );
    sidepods.position.set(0, 0, 0);
    root.add(sidepods);

    // 4. Parametric Ground Effect Underfloor (Mounted under chassis: Y = 0, Z = 0)
    const floor = ParametricGroundEffectFloorCad.buildFloor3D(
      config.groundEffectFloor,
      visualMode === 'cfdPressure' ? 'cfdPressure' : visualMode === 'wireframe' ? 'wireframe' : 'realistic'
    );
    floor.position.set(0, 0, 0);
    root.add(floor);

    // 5. Parametric Rear Diffuser (Mounted at rear underbody: Z = +1.65m)
    const diffuser = ParametricDiffuserCad.buildDiffuser3D(
      config.diffuser,
      visualMode === 'cfdPressure' ? 'cfdPressure' : visualMode === 'wireframe' ? 'wireframe' : 'realistic'
    );
    diffuser.position.set(0, 0, 1.65);
    root.add(diffuser);

    // 6. Parametric Rear Wing (Mounted at rear deck / swan pylons: Z = +2.05m)
    const rearWing = ParametricRearWingCad.buildRearWing3D(
      config.rearWing,
      visualMode === 'cfdPressure' ? 'cfdPressure' : visualMode === 'wireframe' ? 'wireframe' : 'realistic'
    );
    rearWing.position.set(0, 0.45, 2.05);
    root.add(rearWing);

    // 7. Parametric Canards / Dive Planes (Mounted at front bumper corners)
    const canards = ParametricCanardArrayCad.buildCanards3D(
      config.canards,
      visualMode === 'cfdPressure' ? 'cfdPressure' : visualMode === 'wireframe' ? 'wireframe' : 'realistic'
    );
    root.add(canards);

    return root;
  }

  /**
   * Asynchronously loads an authentic reference vehicle 3D model from the project GLB assets.
   */
  public static async loadReferenceVehicleAsset(
    modelId: 'ford_escort' | 'bmw_i8' | 'mini_jcw' | 'v12_engine'
  ): Promise<THREE.Group> {
    let uri = '/models/extracted/ford-escort-rs-cosworth-cossie/source/Body_lodA/Body_lodA/fordEscortRSCosworth.glb';

    if (modelId === 'bmw_i8') {
      uri = '/models/extracted/bmw-i8-xs-2015/source/2015-bmw-i8_xs_car.glb';
    } else if (modelId === 'mini_jcw') {
      uri = '/models/extracted/mini-countryman-jcw/source/Unity2Skfb/Unity2Skfb.gltf';
    } else if (modelId === 'v12_engine') {
      uri = '/models/v12_racing_engine.glb';
    }

    const loaded = await UniversalGlbAssetLoader.loadAsset(uri);
    const scene = loaded.scene;

    // Normalize scale and center bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const targetLengthM = modelId === 'v12_engine' ? 1.4 : 4.4;
      const scale = targetLengthM / maxDim;
      scene.scale.set(scale, scale, scale);
      scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    }

    // Enable shadows on all meshes
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return scene;
  }

  /**
   * Recursively disposes all geometries, materials, and textures within an Object3D hierarchy
   * to eliminate WebGL memory leaks during hot parameter updates and model switches.
   */
  public static disposeObject3D(root: THREE.Object3D | null | undefined): void {
    if (!root) return;

    const disposeMat = (mat: THREE.Material) => {
      const anyMat = mat as any;
      if (anyMat.map) anyMat.map.dispose();
      if (anyMat.normalMap) anyMat.normalMap.dispose();
      if (anyMat.roughnessMap) anyMat.roughnessMap.dispose();
      if (anyMat.metalnessMap) anyMat.metalnessMap.dispose();
      if (anyMat.emissiveMap) anyMat.emissiveMap.dispose();
      if (anyMat.envMap) anyMat.envMap.dispose();
      mat.dispose();
    };

    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(disposeMat);
          } else {
            disposeMat(mesh.material);
          }
        }
      }
    });

    while (root.children.length > 0) {
      const child = root.children[0];
      root.remove(child);
    }
  }
}

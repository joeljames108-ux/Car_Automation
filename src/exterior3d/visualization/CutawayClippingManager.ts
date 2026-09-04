// ============================================================================
// CUTAWAY & SECTION CLIPPING MANAGER
// ============================================================================
// Manages real-time WebGL local clipping planes, dynamic cross-section depth,
// plane normal inversion, sliced-edge highlighting, and exposed internal CAD
// geometries (pistons in cylinders, turbo impellers, transmission gears).
// ============================================================================

import * as THREE from 'three';

export type CutawayAxis = 'X' | 'Y' | 'Z';

export interface CutawayConfig {
  enabled: boolean;
  axis: CutawayAxis;
  depth: number; // Normalized offset (-1.0 to 1.0)
  invert: boolean;
  showInternalComponents: boolean;
}

export class CutawayClippingManager {
  private clippingPlane: THREE.Plane;
  private renderer: THREE.WebGLRenderer | null = null;
  private internalCutawayGroup: THREE.Group | null = null;
  private config: CutawayConfig;

  constructor() {
    this.clippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
    this.config = {
      enabled: false,
      axis: 'X',
      depth: 0.0,
      invert: false,
      showInternalComponents: true,
    };
  }

  /**
   * Initializes the manager with the WebGL renderer and enables local clipping.
   */
  public attachRenderer(renderer: THREE.WebGLRenderer): void {
    this.renderer = renderer;
    this.renderer.localClippingEnabled = true;
  }

  /**
   * Gets the active Three.js clipping plane array.
   */
  public getPlanes(): THREE.Plane[] {
    return this.config.enabled ? [this.clippingPlane] : [];
  }

  /**
   * Updates cutaway parameters and recalculates plane orientation.
   */
  public updateConfig(newConfig: Partial<CutawayConfig>, targetGroup?: THREE.Object3D): void {
    this.config = { ...this.config, ...newConfig };

    // 1. Calculate plane normal vector
    const normal = new THREE.Vector3();
    switch (this.config.axis) {
      case 'X':
        normal.set(this.config.invert ? -1 : 1, 0, 0);
        break;
      case 'Y':
        normal.set(0, this.config.invert ? -1 : 1, 0);
        break;
      case 'Z':
        normal.set(0, 0, this.config.invert ? -1 : 1);
        break;
    }

    // 2. Calculate plane constant from depth
    // Map normalized depth [-1, 1] to physical bounding meters [-1.5m to 1.5m]
    const physicalDistance = this.config.depth * 1.5;
    const constant = this.config.invert ? physicalDistance : -physicalDistance;

    this.clippingPlane.set(normal, constant);

    // 3. Apply or remove clipping planes from target meshes
    if (targetGroup) {
      this.applyPlanesToHierarchy(targetGroup, this.config.enabled ? [this.clippingPlane] : []);
    }

    // 4. Update visibility of exposed internal components
    if (this.internalCutawayGroup) {
      this.internalCutawayGroup.visible = this.config.enabled && this.config.showInternalComponents;
    }
  }

  /**
   * Recursively applies clipping planes to all mesh materials in a hierarchy.
   */
  public applyPlanesToHierarchy(root: THREE.Object3D, planes: THREE.Plane[]): void {
    root.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              mat.clippingPlanes = planes;
              mat.clipShadows = true;
              mat.needsUpdate = true;
            });
          } else {
            mesh.material.clippingPlanes = planes;
            mesh.material.clipShadows = true;
            mesh.material.needsUpdate = true;
          }
        }
      }
    });
  }

  /**
   * Builds high-detail internal mechanical subassemblies that are revealed
   * when cutaway mode is active (e.g. reciprocating pistons, valve springs, turbo wheels).
   */
  public buildInternalCutawayGroup(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Cutaway_Internal_Exposed_Components';

    // Materials
    const pistonMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.08,
      clearcoat: 0.8,
      name: 'Forged_Piston_Crown',
    });
    const rodMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
      name: 'Titanium_Connecting_Rod',
    });
    const valveSpringMat = new THREE.MeshPhysicalMaterial({
      color: 0xfacc15,
      metalness: 0.4,
      roughness: 0.2,
      clearcoat: 0.6,
      name: 'Valve_Coil_Spring',
    });
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.2,
      name: 'Hardened_Gear_Steel',
    });

    // 1. Exposed Engine Cylinder Bores & Pistons
    const cylindersGroup = new THREE.Group();
    cylindersGroup.position.set(0, 0.35, 0.0);

    for (let c = -1; c <= 1; c += 2) {
      for (let b = -1.5; b <= 1.5; b += 1.0) {
        const cylZ = b * 0.18;
        const cylX = c * 0.12;

        // Piston Head
        const pistonGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.038, 24);
        const piston = new THREE.Mesh(pistonGeo, pistonMat);
        const strokeY = 0.08 + Math.sin(b * 1.5) * 0.04;
        piston.position.set(cylX, strokeY, cylZ);
        cylindersGroup.add(piston);

        // Connecting Rod
        const rodGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.11, 12);
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.set(cylX, strokeY - 0.065, cylZ);
        rod.rotation.z = c * -0.15;
        cylindersGroup.add(rod);

        // Overhead Dual Valve Springs
        for (const v of [-0.018, 0.018]) {
          const springGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.035, 12);
          const spring = new THREE.Mesh(springGeo, valveSpringMat);
          spring.position.set(cylX + v, strokeY + 0.12, cylZ);
          cylindersGroup.add(spring);
        }
      }
    }
    group.add(cylindersGroup);

    // 2. Exposed Transmission Internal Helical Gear Cluster
    const transGroup = new THREE.Group();
    transGroup.position.set(0, 0.32, 1.15);

    for (let g = 0; g < 6; g++) {
      const zOffset = (g - 2.5) * 0.045;
      const radius = 0.04 + (g % 3) * 0.015;
      const gearGeo = new THREE.CylinderGeometry(radius, radius, 0.025, 28);
      gearGeo.rotateX(Math.PI / 2);
      const gear = new THREE.Mesh(gearGeo, gearMat);
      gear.position.set(0, 0, zOffset);
      transGroup.add(gear);
    }
    group.add(transGroup);

    // 3. Exposed Turbocharger Internal Aerofoil Compressor & Turbine Blades
    const turboGroup = new THREE.Group();
    turboGroup.position.set(-0.35, 0.42, 0.10);

    const compWheelGeo = new THREE.ConeGeometry(0.032, 0.035, 16);
    compWheelGeo.rotateZ(Math.PI / 2);
    const compWheel = new THREE.Mesh(compWheelGeo, pistonMat);
    compWheel.position.set(-0.02, 0, -0.04);
    turboGroup.add(compWheel);

    const turbWheelGeo = new THREE.ConeGeometry(0.030, 0.035, 16);
    turbWheelGeo.rotateZ(-Math.PI / 2);
    const turbWheel = new THREE.Mesh(turbWheelGeo, rodMat);
    turbWheel.position.set(0.02, 0, 0.04);
    turboGroup.add(turbWheel);

    group.add(turboGroup);

    group.visible = false;
    this.internalCutawayGroup = group;
    return group;
  }

  public getConfig(): CutawayConfig {
    return { ...this.config };
  }

  public dispose(): void {
    if (this.internalCutawayGroup) {
      this.internalCutawayGroup.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          const mesh = o as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
        }
      });
    }
  }
}

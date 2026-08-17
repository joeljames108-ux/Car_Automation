// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — MASTER 3D SCENE GRAPH
// ============================================================================
// Hierarchical Three.js scene graph container managing:
// VehicleRoot -> ChassisRoot, PowertrainRoot, SuspensionRoot, WheelRoot,
// BodyRoot, ExteriorPanelsRoot, LightingGlassRoot, AeroRoot, InteriorRoot, ElectronicsRoot.
// Supports dynamic exploded view radial expansion, X-Ray mode, and VRAM cleanup.
// ============================================================================

import * as THREE from 'three';
import { VehicleSubsystemStage } from '../types/vehicleConstructionTypes';

export class VehicleSceneGraph {
  public vehicleRoot: THREE.Group;

  // 10 Logical Subsystem Group Nodes
  public chassisRoot: THREE.Group;
  public powertrainRoot: THREE.Group;
  public suspensionRoot: THREE.Group;
  public wheelBrakeRoot: THREE.Group;
  public bodyStructureRoot: THREE.Group;
  public exteriorPanelsRoot: THREE.Group;
  public lightingGlassRoot: THREE.Group;
  public aeroRoot: THREE.Group;
  public interiorRoot: THREE.Group;
  public electronicsRoot: THREE.Group;

  // Subsystem Node Lookup Map
  private subsystemNodes: Map<VehicleSubsystemStage, THREE.Group>;

  // Exploded View Direction Vectors (Radial Dispersal)
  private explosionVectors: Map<VehicleSubsystemStage, THREE.Vector3>;

  constructor() {
    this.vehicleRoot = new THREE.Group();
    this.vehicleRoot.name = 'VehicleRoot';

    this.chassisRoot = new THREE.Group();
    this.chassisRoot.name = 'ChassisRoot';

    this.powertrainRoot = new THREE.Group();
    this.powertrainRoot.name = 'PowertrainRoot';

    this.suspensionRoot = new THREE.Group();
    this.suspensionRoot.name = 'SuspensionRoot';

    this.wheelBrakeRoot = new THREE.Group();
    this.wheelBrakeRoot.name = 'WheelBrakeRoot';

    this.bodyStructureRoot = new THREE.Group();
    this.bodyStructureRoot.name = 'BodyStructureRoot';

    this.exteriorPanelsRoot = new THREE.Group();
    this.exteriorPanelsRoot.name = 'ExteriorPanelsRoot';

    this.lightingGlassRoot = new THREE.Group();
    this.lightingGlassRoot.name = 'LightingGlassRoot';

    this.aeroRoot = new THREE.Group();
    this.aeroRoot.name = 'AeroRoot';

    this.interiorRoot = new THREE.Group();
    this.interiorRoot.name = 'InteriorRoot';

    this.electronicsRoot = new THREE.Group();
    this.electronicsRoot.name = 'ElectronicsRoot';

    // Mount to VehicleRoot
    this.vehicleRoot.add(
      this.chassisRoot,
      this.powertrainRoot,
      this.suspensionRoot,
      this.wheelBrakeRoot,
      this.bodyStructureRoot,
      this.exteriorPanelsRoot,
      this.lightingGlassRoot,
      this.aeroRoot,
      this.interiorRoot,
      this.electronicsRoot
    );

    // Populate Stage to Node Map
    this.subsystemNodes = new Map<VehicleSubsystemStage, THREE.Group>([
      ['architecture', this.chassisRoot],
      ['chassis_platform', this.chassisRoot],
      ['powertrain_engine', this.powertrainRoot],
      ['transmission', this.powertrainRoot],
      ['suspension', this.suspensionRoot],
      ['wheels_brakes', this.wheelBrakeRoot],
      ['body_structure', this.bodyStructureRoot],
      ['exterior_panels', this.exteriorPanelsRoot],
      ['lighting_glass', this.lightingGlassRoot],
      ['aerodynamics', this.aeroRoot],
      ['interior_cabin', this.interiorRoot],
      ['electronics', this.electronicsRoot],
    ]);

    // Define Exploded View Spreading Offsets (in meters)
    this.explosionVectors = new Map<VehicleSubsystemStage, THREE.Vector3>([
      ['architecture', new THREE.Vector3(0, 0, 0)],
      ['chassis_platform', new THREE.Vector3(0, 0, 0)],
      ['powertrain_engine', new THREE.Vector3(0.6, 0.4, 0)],
      ['transmission', new THREE.Vector3(-0.4, -0.3, 0)],
      ['suspension', new THREE.Vector3(0, -0.5, 0.4)],
      ['wheels_brakes', new THREE.Vector3(0, 0, 0.9)],
      ['body_structure', new THREE.Vector3(0, 0.8, 0)],
      ['exterior_panels', new THREE.Vector3(0, 1.2, 0.8)],
      ['lighting_glass', new THREE.Vector3(0.8, 0.5, 0)],
      ['aerodynamics', new THREE.Vector3(0, -0.4, 0)],
      ['interior_cabin', new THREE.Vector3(-0.5, 0.9, 0)],
      ['electronics', new THREE.Vector3(0.3, 0.7, -0.3)],
    ]);
  }

  /**
   * Retrieves the target parent Three.js group for any subsystem stage.
   */
  public getNodeForStage(stage: VehicleSubsystemStage): THREE.Group {
    return this.subsystemNodes.get(stage) || this.vehicleRoot;
  }

  /**
   * Updates exploded view spatial separation from 0.0 (assembled) to 1.0 (exploded).
   */
  public updateExplodedView(progress: number) {
    const p = Math.max(0, Math.min(1, progress));

    this.subsystemNodes.forEach((node, stage) => {
      const vec = this.explosionVectors.get(stage);
      if (vec) {
        node.position.set(vec.x * p, vec.y * p, vec.z * p);
      }
    });
  }

  /**
   * Toggles X-Ray structural transparency across all body panel meshes.
   */
  public setXRayMode(enabled: boolean) {
    this.exteriorPanelsRoot.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.transparent = true;
            mat.opacity = enabled ? 0.25 : 1.0;
            mat.depthWrite = !enabled;
          });
        } else if (child.material) {
          child.material.transparent = true;
          child.material.opacity = enabled ? 0.25 : 1.0;
          child.material.depthWrite = !enabled;
        }
      }
    });
  }

  /**
   * Cleans up all geometries, materials, and textures to prevent VRAM memory leaks.
   */
  public dispose() {
    this.vehicleRoot.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });

    while (this.vehicleRoot.children.length > 0) {
      this.vehicleRoot.remove(this.vehicleRoot.children[0]);
    }
  }
}

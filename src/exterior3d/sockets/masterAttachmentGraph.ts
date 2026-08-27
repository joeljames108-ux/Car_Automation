/**
 * ============================================================================
 * MASTER ATTACHMENT GRAPH & 3D SNAPPING SYSTEM
 * ============================================================================
 * Hierarchical scene graph orchestrator managing component sockets,
 * coordinate transformations, snapping alignments, and exploded view offsets.
 */

import * as THREE from "three";
import {
  ComponentMountPoint,
  AttachmentSocket,
  Vector3D,
  VehicleSubsystemCategory,
} from "../../sim/masterVehicleState/masterVehicleTypes";

export interface AttachedNode {
  id: string;
  category: VehicleSubsystemCategory;
  mountPoint: ComponentMountPoint;
  parentSocketId: ComponentMountPoint;
  meshGroup: THREE.Group;
  localPositionMm: Vector3D;
  localRotationDeg: Vector3D;
  explodedOffsetMm: Vector3D;
  isIsolated: boolean;
  isVisible: boolean;
}

export class MasterAttachmentGraph {
  private rootGroup: THREE.Group;
  private attachedNodes: Map<string, AttachedNode> = new Map();
  private sockets: Map<ComponentMountPoint, AttachmentSocket> = new Map();

  constructor() {
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "MasterVehicleSceneGraph";
    this.initializeDefaultSockets();
  }

  public getRootGroup(): THREE.Group {
    return this.rootGroup;
  }

  public getAttachedNodes(): AttachedNode[] {
    return Array.from(this.attachedNodes.values());
  }

  public getSocket(id: ComponentMountPoint): AttachmentSocket | undefined {
    return this.sockets.get(id);
  }

  /**
   * Registers or updates a mounting socket in chassis 3D space (mm).
   */
  public registerSocket(socket: AttachmentSocket): void {
    this.sockets.set(socket.id, socket);
  }

  /**
   * Attaches a 3D component subassembly mesh to a designated parent socket.
   */
  public attachComponent(
    nodeId: string,
    category: VehicleSubsystemCategory,
    targetSocketId: ComponentMountPoint,
    meshGroup: THREE.Group,
    explodedDirectionMm: Vector3D = { x: 0, y: 0, z: 0 }
  ): boolean {
    const socket = this.sockets.get(targetSocketId);
    if (!socket) {
      console.warn(`[AttachmentGraph] Socket ${targetSocketId} not found. Attaching to root.`);
    }

    // Detach if already exists
    if (this.attachedNodes.has(nodeId)) {
      this.detachComponent(nodeId);
    }

    const pos = socket?.localPosition || { x: 0, y: 0, z: 0 };
    const rot = socket?.localRotation || { x: 0, y: 0, z: 0 };

    // Set position and rotation (converting mm to Three.js meters)
    meshGroup.position.set(pos.x / 1000, pos.y / 1000, pos.z / 1000);
    meshGroup.rotation.set(
      (rot.x * Math.PI) / 180,
      (rot.y * Math.PI) / 180,
      (rot.z * Math.PI) / 180
    );

    this.rootGroup.add(meshGroup);

    const node: AttachedNode = {
      id: nodeId,
      category,
      mountPoint: targetSocketId,
      parentSocketId: targetSocketId,
      meshGroup,
      localPositionMm: pos,
      localRotationDeg: rot,
      explodedOffsetMm: explodedDirectionMm,
      isIsolated: false,
      isVisible: true,
    };

    this.attachedNodes.set(nodeId, node);
    if (socket) {
      socket.isOccupied = true;
      socket.attachedComponentId = nodeId;
    }

    return true;
  }

  /**
   * Detaches a component and removes its 3D mesh from the scene.
   */
  public detachComponent(nodeId: string, disposeGeometries: boolean = true): boolean {
    const node = this.attachedNodes.get(nodeId);
    if (!node) return false;

    if (disposeGeometries && node.meshGroup) {
      node.meshGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => m.dispose());
          }
        }
      });
    }

    this.rootGroup.remove(node.meshGroup);
    const socket = this.sockets.get(node.parentSocketId);
    if (socket && socket.attachedComponentId === nodeId) {
      socket.isOccupied = false;
      socket.attachedComponentId = undefined;
    }

    this.attachedNodes.delete(nodeId);
    return true;
  }

  /**
   * Cleans up all attached node meshes and frees GPU buffers.
   */
  public dispose(): void {
    const nodeIds = Array.from(this.attachedNodes.keys());
    nodeIds.forEach((id) => this.detachComponent(id, true));
  }

  /**
   * Applies an exploded view expansion factor (0.0 = fully assembled, 1.0 = fully expanded).
   */
  public setExplodedFactor(factor: number): void {
    const clamped = Math.max(0, Math.min(2.0, factor));
    this.attachedNodes.forEach((node) => {
      const basePos = node.localPositionMm;
      const offset = node.explodedOffsetMm;
      node.meshGroup.position.set(
        (basePos.x + offset.x * clamped) / 1000,
        (basePos.y + offset.y * clamped) / 1000,
        (basePos.z + offset.z * clamped) / 1000
      );
    });
  }

  /**
   * Isolates a single subsystem or component, dimming/hiding other components.
   */
  public isolateCategory(targetCategory: VehicleSubsystemCategory | "all"): void {
    this.attachedNodes.forEach((node) => {
      if (targetCategory === "all" || node.category === targetCategory) {
        node.meshGroup.visible = true;
        node.meshGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat && mat.opacity !== undefined) {
              mat.transparent = false;
              mat.opacity = 1.0;
            }
          }
        });
      } else {
        node.meshGroup.visible = true;
        node.meshGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat && mat.opacity !== undefined) {
              mat.transparent = true;
              mat.opacity = 0.15;
            }
          }
        });
      }
    });
  }

  /**
   * Sets X-Ray ghosting mode for exterior shell to reveal internal powertrain and chassis.
   */
  public setXRayMode(enabled: boolean): void {
    this.attachedNodes.forEach((node) => {
      if (node.category === "body_panels" || node.category === "aero") {
        node.meshGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat) {
              mat.transparent = enabled;
              mat.opacity = enabled ? 0.22 : 1.0;
              mat.wireframe = false;
            }
          }
        });
      }
    });
  }

  /**
   * Parametrically transforms mounting sockets when chassis dimensions (wheelbase, track) change.
   */
  public updateChassisDimensions(wheelbaseMm: number, trackWidthMm: number): void {
    const halfWb = wheelbaseMm / 2;
    const halfTrack = trackWidthMm / 2;

    // Update front subframe and suspension sockets
    const frontSuspL = this.sockets.get("CHASSIS_FRONT_SUSP_L");
    if (frontSuspL) frontSuspL.localPosition = { x: -halfTrack, y: 320, z: -halfWb };

    const frontSuspR = this.sockets.get("CHASSIS_FRONT_SUSP_R");
    if (frontSuspR) frontSuspR.localPosition = { x: halfTrack, y: 320, z: -halfWb };

    // Update rear subframe and suspension sockets
    const rearSuspL = this.sockets.get("CHASSIS_REAR_SUSP_L");
    if (rearSuspL) rearSuspL.localPosition = { x: -halfTrack, y: 340, z: halfWb };

    const rearSuspR = this.sockets.get("CHASSIS_REAR_SUSP_R");
    if (rearSuspR) rearSuspR.localPosition = { x: halfTrack, y: 340, z: halfWb };

    // Reposition attached meshes
    this.attachedNodes.forEach((node) => {
      const socket = this.sockets.get(node.parentSocketId);
      if (socket) {
        node.localPositionMm = socket.localPosition;
        node.meshGroup.position.set(
          socket.localPosition.x / 1000,
          socket.localPosition.y / 1000,
          socket.localPosition.z / 1000
        );
      }
    });
  }

  private initializeDefaultSockets(): void {
    // Chassis Hardpoints (in 3D mm)
    this.registerSocket({
      id: "CHASSIS_FRONT_SUBFRAME",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 0, y: 280, z: -1360 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["suspension", "cooling"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "CHASSIS_ENGINE_BAY",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 0, y: 420, z: 320 }, // Mid-engine default
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["powertrain"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "CHASSIS_TRANSMISSION_TUNNEL",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 0, y: 360, z: 880 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["transmission"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "CHASSIS_CABIN_FLOOR",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 0, y: 150, z: -350 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["interior", "safety"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "CHASSIS_FRONT_SUSP_L",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: -840, y: 320, z: -1360 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["suspension", "wheels_tires", "brakes"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "CHASSIS_FRONT_SUSP_R",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 840, y: 320, z: -1360 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["suspension", "wheels_tires", "brakes"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "CHASSIS_REAR_SUSP_L",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: -830, y: 340, z: 1360 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["suspension", "wheels_tires", "brakes"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "CHASSIS_REAR_SUSP_R",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 830, y: 340, z: 1360 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["suspension", "wheels_tires", "brakes"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "AERO_FRONT_SPLITTER_SOCKET",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 0, y: 110, z: -2150 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["aero"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "AERO_REAR_WING_DECK",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 0, y: 1050, z: 1980 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["aero"],
      isOccupied: false,
    });

    this.registerSocket({
      id: "AERO_UNDERBODY_DIFFUSER",
      parentComponentId: "CHASSIS_BASE",
      localPosition: { x: 0, y: 180, z: 1750 },
      localRotation: { x: 0, y: 0, z: 0 },
      compatibleCategories: ["aero"],
      isOccupied: false,
    });
  }
}

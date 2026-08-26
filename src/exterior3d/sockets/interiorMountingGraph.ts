/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — 3D MOUNTING SOCKET GRAPH & EXPLODED KINEMATICS
 * ============================================================================
 * Defines explicit 3D attachment hardpoints for all modular cabin subassemblies:
 * - Driver & Passenger Seat Mounts (Floor Slider Track Rails)
 * - Dashboard Bulkhead Hardpoints & Steering Column Splines
 * - Center Tunnel Anchor Points & Shifter Linkage Well
 * - Left & Right Door Ingress Hinge & Latch Points
 * - Roof Structural Rib Hardpoints & Starlight Headliner Clips
 * - Continuous Exploded View Slider ($0.0 \to 1.0$) with Disassembly Vectors
 * ============================================================================
 */

import * as THREE from "three";

export interface SocketTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

export type InteriorSocketId =
  | "INTERIOR_ROOT"
  | "DRIVER_SEAT_MOUNT"
  | "PASSENGER_SEAT_MOUNT"
  | "REAR_LEFT_SEAT_MOUNT"
  | "REAR_RIGHT_SEAT_MOUNT"
  | "DASHBOARD_MOUNT"
  | "STEERING_MOUNT"
  | "CENTER_CONSOLE_MOUNT"
  | "SCREEN_MOUNT"
  | "DOOR_PANEL_LEFT"
  | "DOOR_PANEL_RIGHT"
  | "ROOF_MOUNT"
  | "PEDAL_BOX_MOUNT";

export interface InteriorSocketNode {
  id: InteriorSocketId;
  name: string;
  nominalLocalPositionM: THREE.Vector3;
  nominalRotationEuler: THREE.Euler;
  explodedDisassemblyVectorM: THREE.Vector3;
  attachedSubsystemName?: string;
}

export class InteriorMountingGraph {
  private static instance: InteriorMountingGraph;
  private sockets: Map<InteriorSocketId, InteriorSocketNode> = new Map();

  private constructor() {
    this.initializeDefaultSockets();
  }

  public static getInstance(): InteriorMountingGraph {
    if (!InteriorMountingGraph.instance) {
      InteriorMountingGraph.instance = new InteriorMountingGraph();
    }
    return InteriorMountingGraph.instance;
  }

  private initializeDefaultSockets(): void {
    // 1. Root
    this.sockets.set("INTERIOR_ROOT", {
      id: "INTERIOR_ROOT",
      name: "Cabin Floor Chassis Monocoque Anchor",
      nominalLocalPositionM: new THREE.Vector3(0, 0, 0),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0, 0, 0),
    });

    // 2. Driver Seat Mount (Left side)
    this.sockets.set("DRIVER_SEAT_MOUNT", {
      id: "DRIVER_SEAT_MOUNT",
      name: "Driver Seat 4-Point Floor Slider Rail",
      nominalLocalPositionM: new THREE.Vector3(-0.70, 0.28, -0.34),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0, 0.28, -0.15),
    });

    // 3. Passenger Seat Mount (Right side)
    this.sockets.set("PASSENGER_SEAT_MOUNT", {
      id: "PASSENGER_SEAT_MOUNT",
      name: "Passenger Seat 4-Point Floor Slider Rail",
      nominalLocalPositionM: new THREE.Vector3(-0.70, 0.28, 0.34),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0, 0.28, 0.15),
    });

    // 4. Rear Left Seat Mount
    this.sockets.set("REAR_LEFT_SEAT_MOUNT", {
      id: "REAR_LEFT_SEAT_MOUNT",
      name: "Rear Left Passenger Seat Anchor",
      nominalLocalPositionM: new THREE.Vector3(-1.35, 0.32, -0.34),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(-0.20, 0.26, -0.15),
    });

    // 5. Rear Right Seat Mount
    this.sockets.set("REAR_RIGHT_SEAT_MOUNT", {
      id: "REAR_RIGHT_SEAT_MOUNT",
      name: "Rear Right Passenger Seat Anchor",
      nominalLocalPositionM: new THREE.Vector3(-1.35, 0.32, 0.34),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(-0.20, 0.26, 0.15),
    });

    // 6. Dashboard Cross-Car Beam Mount
    this.sockets.set("DASHBOARD_MOUNT", {
      id: "DASHBOARD_MOUNT",
      name: "Magnesium Cross-Car Bulkhead Beam",
      nominalLocalPositionM: new THREE.Vector3(-0.35, 0.68, 0),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0.20, 0.34, 0),
    });

    // 7. Steering Column Mount
    this.sockets.set("STEERING_MOUNT", {
      id: "STEERING_MOUNT",
      name: "Power Steering Column Spline & Clockspring",
      nominalLocalPositionM: new THREE.Vector3(-0.46, 0.70, -0.32),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(-0.25, 0.15, -0.20),
    });

    // 8. Center Console Mount
    this.sockets.set("CENTER_CONSOLE_MOUNT", {
      id: "CENTER_CONSOLE_MOUNT",
      name: "Central Transmission Tunnel Spine",
      nominalLocalPositionM: new THREE.Vector3(-0.58, 0.30, 0),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0, 0.18, 0),
    });

    // 9. Infotainment & Screen Mount
    this.sockets.set("SCREEN_MOUNT", {
      id: "SCREEN_MOUNT",
      name: "Floating Center OLED Display Mount",
      nominalLocalPositionM: new THREE.Vector3(-0.30, 0.74, 0),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0.15, 0.25, 0),
    });

    // 10. Left Door Panel
    this.sockets.set("DOOR_PANEL_LEFT", {
      id: "DOOR_PANEL_LEFT",
      name: "Driver Door Inner Structural Card",
      nominalLocalPositionM: new THREE.Vector3(-0.60, 0.48, -0.72),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0, 0.05, -0.45),
    });

    // 11. Right Door Panel
    this.sockets.set("DOOR_PANEL_RIGHT", {
      id: "DOOR_PANEL_RIGHT",
      name: "Passenger Door Inner Structural Card",
      nominalLocalPositionM: new THREE.Vector3(-0.60, 0.48, 0.72),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0, 0.05, 0.45),
    });

    // 12. Roof & Headliner Mount
    this.sockets.set("ROOF_MOUNT", {
      id: "ROOF_MOUNT",
      name: "Roof Header & Starlight Headliner",
      nominalLocalPositionM: new THREE.Vector3(-0.80, 1.18, 0),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0, 0.50, 0),
    });

    // 13. Pedal Box Mount
    this.sockets.set("PEDAL_BOX_MOUNT", {
      id: "PEDAL_BOX_MOUNT",
      name: "Aluminum Floor-Mounted Pedal Box",
      nominalLocalPositionM: new THREE.Vector3(-0.18, 0.20, -0.32),
      nominalRotationEuler: new THREE.Euler(0, 0, 0),
      explodedDisassemblyVectorM: new THREE.Vector3(0.18, -0.10, -0.10),
    });
  }

  /**
   * Returns current 3D world transform for a given socket under a continuous exploded factor (0.0 to 1.0).
   */
  public getSocketTransform(
    socketId: InteriorSocketId,
    explodedFactor: number = 0.0,
    halfTrackWidthM: number = 0.75
  ): { position: THREE.Vector3; rotation: THREE.Euler } {
    const node = this.sockets.get(socketId);
    if (!node) {
      return { position: new THREE.Vector3(), rotation: new THREE.Euler() };
    }

    const pos = node.nominalLocalPositionM.clone();
    
    // Scale lateral door offsets dynamically with track width
    if (socketId === "DOOR_PANEL_LEFT") pos.z = -halfTrackWidthM * 0.94;
    if (socketId === "DOOR_PANEL_RIGHT") pos.z = halfTrackWidthM * 0.94;

    // Apply exploded disassembly displacement
    if (explodedFactor > 0.0) {
      const exp = node.explodedDisassemblyVectorM.clone().multiplyScalar(explodedFactor);
      pos.add(exp);
    }

    return {
      position: pos,
      rotation: node.nominalRotationEuler.clone(),
    };
  }

  public getAllSockets(): InteriorSocketNode[] {
    return Array.from(this.sockets.values());
  }
}

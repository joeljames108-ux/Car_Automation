/**
 * ============================================================================
 * INTERIOR GLB SOCKET SNAPPING & TRANSFORM ALIGNMENT ENGINE
 * ============================================================================
 * Aligns loaded 3D GLB interior sub-assemblies (seats, steering wheels, consoles,
 * dashboards, door panels) to structural mounting sockets in the vehicle cabin.
 * Handles bounding box auto-centering, pivot normalization, socket matrix transforms,
 * and exploded-view kinematics offsets.
 * ============================================================================
 */

import * as THREE from "three";
import { InteriorMountingGraph, InteriorSocketId, SocketTransform } from "../../sockets/interiorMountingGraph";
import { MasterModularInteriorState } from "../../../sim/interior/masterInteriorTypes";
import { UniversalGlbAssetLoader } from "../../loaders/universalGlbAssetLoader";
import { MasterModularInterior3DAssembler } from "./masterModularInterior3DAssembler";

export interface SocketSnappedGlbComponent {
  socketId: InteriorSocketId;
  assetUri: string;
  group: THREE.Group;
  transform: SocketTransform;
  originalBoundingBox: THREE.Box3;
}

export class InteriorGlbSocketSnapper {
  private static mountingGraph = InteriorMountingGraph.getInstance();

  /**
   * Aligns a loaded GLB 3D Object to a specified interior mounting socket
   */
  public static alignGlbToSocket(
    glbObject: THREE.Object3D,
    socketId: InteriorSocketId,
    halfTrackM: number,
    explodedFactor: number = 0.0
  ): THREE.Group {
    const containerGroup = new THREE.Group();
    containerGroup.name = `SnappedSocket_${socketId}`;

    const socketXform = this.mountingGraph.getSocketTransform(socketId, explodedFactor, halfTrackM);

    // Compute bounding box and center offset
    const box = new THREE.Box3().setFromObject(glbObject);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Clone GLB scene object and reset relative pivot to bottom-center
    const clonedGlb = glbObject.clone(true);
    clonedGlb.position.set(-center.x, -box.min.y, -center.z);

    containerGroup.add(clonedGlb);

    // Apply socket target position and rotation
    containerGroup.position.copy(socketXform.position);
    containerGroup.rotation.copy(socketXform.rotation);

    containerGroup.userData = {
      socketId,
      socketTransform: socketXform,
      boundingBox: box,
    };

    return containerGroup;
  }

  /**
   * Asynchronously loads and snaps all GLB sub-assemblies for the cabin configuration
   */
  public static async buildFullySnappedGlbCabinAsync(
    state: MasterModularInteriorState,
    explodedFactor: number = 0.0,
    steeringAngleRad: number = 0.0,
    doorOpenAngleDeg: number = 0.0
  ): Promise<THREE.Group> {
    const root = new THREE.Group();
    root.name = `SnappedCabin_${state.id}`;

    const halfTrackM = (state.trackWidthMm / 2) / 1000;

    // Resolve component paths
    const dashPath = MasterModularInterior3DAssembler.resolveInteriorGlbPath("dashboard", state);
    const steerPath = MasterModularInterior3DAssembler.resolveInteriorGlbPath("steering", state);
    const seatPath = MasterModularInterior3DAssembler.resolveInteriorGlbPath("seats", state);
    const consolePath = MasterModularInterior3DAssembler.resolveInteriorGlbPath("console", state);
    const doorsPath = MasterModularInterior3DAssembler.resolveInteriorGlbPath("doors", state);

    // Load assets in parallel
    const [dashAsset, steerAsset, seatAsset, consoleAsset, doorsAsset] = await Promise.all([
      UniversalGlbAssetLoader.loadAsset(dashPath),
      UniversalGlbAssetLoader.loadAsset(steerPath),
      UniversalGlbAssetLoader.loadAsset(seatPath),
      UniversalGlbAssetLoader.loadAsset(consolePath),
      UniversalGlbAssetLoader.loadAsset(doorsPath),
    ]);

    // 1. Dashboard Assembly
    const dashGroup = this.alignGlbToSocket(dashAsset.scene, "DASHBOARD_MOUNT", halfTrackM, explodedFactor);
    root.add(dashGroup);

    // 2. Steering Column Assembly
    const steerGroup = this.alignGlbToSocket(steerAsset.scene, "STEERING_MOUNT", halfTrackM, explodedFactor);
    steerGroup.rotation.z += steeringAngleRad; // Dynamic turn angle
    root.add(steerGroup);

    // 3. Driver & Passenger Seats
    const driverSeatGroup = this.alignGlbToSocket(seatAsset.scene, "DRIVER_SEAT_MOUNT", halfTrackM, explodedFactor);
    root.add(driverSeatGroup);

    const passengerSeatGroup = this.alignGlbToSocket(seatAsset.scene, "PASSENGER_SEAT_MOUNT", halfTrackM, explodedFactor);
    root.add(passengerSeatGroup);

    // 4. Center Console Assembly
    const consoleGroup = this.alignGlbToSocket(consoleAsset.scene, "CENTER_CONSOLE_MOUNT", halfTrackM, explodedFactor);
    root.add(consoleGroup);

    // 5. Left & Right Door Panels
    const leftDoorGroup = this.alignGlbToSocket(doorsAsset.scene, "DOOR_PANEL_LEFT", halfTrackM, explodedFactor);
    leftDoorGroup.rotation.y -= (doorOpenAngleDeg * Math.PI) / 180;
    root.add(leftDoorGroup);

    const rightDoorGroup = this.alignGlbToSocket(doorsAsset.scene, "DOOR_PANEL_RIGHT", halfTrackM, explodedFactor);
    rightDoorGroup.rotation.y += (doorOpenAngleDeg * Math.PI) / 180;
    root.add(rightDoorGroup);

    return root;
  }
}

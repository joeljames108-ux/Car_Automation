// ============================================================================
// PHASE 08 — CHASSIS SOCKET 3D VISUALIZER & INTERACTION ENGINE
// ============================================================================
// Generates 3D interactive Three.js glyphs representing machined fastener
// sockets, insertion vectors, torque arrows, and socket mate status rings.
// ============================================================================

import * as THREE from 'three';
import { ChassisAttachmentSocketsRegistry, AttachmentSocketDefinition } from '../sockets/chassisAttachmentSockets';

export class ChassisSocketVisualizer {
  /**
   * Generates a 3D Group containing visual glyphs for all chassis attachment sockets.
   */
  public static generateAllSocketGlyphs(
    activeSocketId?: string,
    occupiedSocketIds: Set<string> = new Set()
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = 'ChassisSocketVisualizerRoot';

    for (const socket of Object.values(ChassisAttachmentSocketsRegistry.SOCKETS)) {
      const isOccupied = occupiedSocketIds.has(socket.socketId);
      const isSelected = activeSocketId === socket.socketId;
      const glyph = this.buildSocketGlyph(socket, isOccupied, isSelected);
      root.add(glyph);
    }

    return root;
  }

  /**
   * Builds an individual 3D socket glyph with ring, normal arrow, and machined boss.
   */
  public static buildSocketGlyph(
    socket: AttachmentSocketDefinition,
    isOccupied: boolean,
    isSelected: boolean
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `SocketGlyph_${socket.socketId}`;
    group.userData = { socketId: socket.socketId, socketDef: socket };

    const pos = new THREE.Vector3(
      socket.chassisPositionMm.x / 1000.0,
      socket.chassisPositionMm.y / 1000.0,
      socket.chassisPositionMm.z / 1000.0
    );
    group.position.copy(pos);

    // Color: Green if occupied, Cyan if selected, Amber if open/available
    const colorHex = isSelected ? 0x00ffff : isOccupied ? 0x10b981 : 0xf59e0b;

    // 1. Machined Fastener Boss Ring
    const torusGeom = new THREE.TorusGeometry(0.045, 0.008, 12, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: isSelected ? 0.8 : 0.25,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ringMesh = new THREE.Mesh(torusGeom, ringMat);

    // Align ring with socket normal
    const normal = new THREE.Vector3(socket.normalVector.x, socket.normalVector.y, socket.normalVector.z).normalize();
    ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    group.add(ringMesh);

    // 2. Directional Insertion Vector Cone
    const coneGeom = new THREE.ConeGeometry(0.018, 0.05, 12);
    const coneMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const coneMesh = new THREE.Mesh(coneGeom, coneMat);
    const insertVec = new THREE.Vector3(socket.insertionVector.x, socket.insertionVector.y, socket.insertionVector.z).normalize();
    coneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), insertVec);
    coneMesh.position.addScaledVector(insertVec, 0.035);
    group.add(coneMesh);

    // 3. Central Bolt Head Sphere
    const boltGeom = new THREE.SphereGeometry(0.015, 8, 8);
    const boltMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const boltMesh = new THREE.Mesh(boltGeom, boltMat);
    group.add(boltMesh);

    return group;
  }
}

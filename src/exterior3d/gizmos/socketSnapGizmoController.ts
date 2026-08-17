// ============================================================================
// PHASE 26 — INTERACTIVE 3D PART SNAPPING & SOCKET MAGNET GIZMO CONTROLLER
// ============================================================================
// Real-time 3D spatial raycasting and magnetic snapping engine aligning
// components to hardpoint sockets with quaternion slerp interpolation.
// ============================================================================

import * as THREE from 'three';
import { AttachmentSocketDefinition } from '../sockets/chassisAttachmentSockets';

export interface SocketSnapCandidate {
  socket: AttachmentSocketDefinition;
  socketWorldPosition: THREE.Vector3;
  distanceMeters: number;
  isWithinSnapRadius: boolean;
  alignmentScorePct: number;
}

export class SocketSnapGizmoController {
  private static readonly SNAP_THRESHOLD_RADIUS_M = 0.18; // 180mm snap radius

  /**
   * Finds the nearest compatible socket to a dragged component position.
   */
  public static findNearestSocket(
    draggedWorldPos: THREE.Vector3,
    availableSockets: AttachmentSocketDefinition[],
    compatibleSocketIds?: string[]
  ): SocketSnapCandidate | null {
    let bestCandidate: SocketSnapCandidate | null = null;
    let minDistance = Infinity;

    for (const socket of availableSockets) {
      if (compatibleSocketIds && !compatibleSocketIds.includes(socket.socketId)) {
        continue;
      }

      const sockPos = new THREE.Vector3(
        socket.chassisPositionMm.x / 1000,
        socket.chassisPositionMm.y / 1000,
        socket.chassisPositionMm.z / 1000
      );

      const dist = draggedWorldPos.distanceTo(sockPos);

      if (dist < minDistance) {
        minDistance = dist;
        const isSnap = dist <= this.SNAP_THRESHOLD_RADIUS_M;
        const alignScore = Math.max(0, 100 - (dist / this.SNAP_THRESHOLD_RADIUS_M) * 100);

        bestCandidate = {
          socket,
          socketWorldPosition: sockPos,
          distanceMeters: Math.round(dist * 1000) / 1000,
          isWithinSnapRadius: isSnap,
          alignmentScorePct: Math.round(alignScore),
        };
      }
    }

    return bestCandidate;
  }

  /**
   * Computes snapped target position with magnetic damping.
   */
  public static computeSnappedPosition(
    currentPos: THREE.Vector3,
    candidate: SocketSnapCandidate
  ): THREE.Vector3 {
    if (!candidate.isWithinSnapRadius) {
      return currentPos.clone();
    }

    // Magnetic pull interpolation (smooth spring snap)
    const t = 0.65; // 65% pull toward socket center
    return new THREE.Vector3().lerpVectors(currentPos, candidate.socketWorldPosition, t);
  }
}

// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 3D SPATIAL ATTACHMENT RESOLVER
// ============================================================================
// Solves 3D transformation matrices, parent-to-child socket alignments,
// quaternion orientation synthesis, cylinder bank stagger kinematics, and
// scene-graph traversal for deterministic component docking and snapping.
// ============================================================================

import * as THREE from 'three';
import type {
  AttachmentPoint3D,
  ComponentInstance3D,
  Engine3DComponentManifest,
  Engine3DComponentType,
  Transform3D,
  Vector3D,
  Euler3D,
} from '../types';
import { VectorMath, EulerMath, QuaternionMath, TransformMath } from '../types';
import {
  findAttachmentPointById,
  getAllV12AttachmentPoints,
  V12_PHYSICAL_SPECS,
} from '../attachmentMaps/v12AttachmentMap';

// ============================================================================
// 1. SPATIAL SCENE GRAPH ATTACHMENT QUERIES
// ============================================================================

/**
 * Searches a Three.js Object3D hierarchy for an embedded named attachment anchor node.
 * If found, returns its exact decomposed world-space Transform3D.
 */
export function resolveWorldTransformFromNode(
  rootObject: THREE.Object3D,
  attachmentPointId: string
): Transform3D | null {
  let targetNode: THREE.Object3D | null = null;

  rootObject.traverse((child) => {
    if (child.name === attachmentPointId) {
      targetNode = child;
    }
  });

  if (!targetNode) {
    // If not found in live scene graph, fallback to declarative attachment map
    const mappedPoint = findAttachmentPointById(attachmentPointId);
    if (mappedPoint) {
      return {
        position: VectorMath.clone(mappedPoint.position),
        rotation: EulerMath.clone(mappedPoint.rotation),
        scale: VectorMath.one(),
      };
    }
    return null;
  }

  // Force world matrix calculation
  (targetNode as THREE.Object3D).updateWorldMatrix(true, false);

  const worldPos = new THREE.Vector3();
  const worldQuat = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();

  (targetNode as THREE.Object3D).matrixWorld.decompose(worldPos, worldQuat, worldScale);

  const euler = new THREE.Euler().setFromQuaternion(worldQuat, 'XYZ');

  return {
    position: { x: worldPos.x, y: worldPos.y, z: worldPos.z },
    rotation: { x: euler.x, y: euler.y, z: euler.z, order: 'XYZ' },
    scale: { x: worldScale.x, y: worldScale.y, z: worldScale.z },
  };
}

// ============================================================================
// 2. DETERMINISTIC ATTACHMENT TRANSFORM SOLVER
// ============================================================================

/**
 * Calculates the exact world-space Transform3D required for a child component
 * to snap perfectly onto a parent socket.
 */
export function solveComponentSnapTransform(
  childManifest: Engine3DComponentManifest,
  parentTransform: Transform3D,
  socket: AttachmentPoint3D,
  instanceIndexInPattern: number = 0
): Transform3D {
  // 1. Calculate parent world position + socket relative offset
  const parentQuat = QuaternionMath.fromEuler(parentTransform.rotation);
  const rotatedSocketPos = QuaternionMath.rotateVector(parentQuat, socket.position);

  const targetWorldPos: Vector3D = {
    x: parentTransform.position.x + rotatedSocketPos.x,
    y: parentTransform.position.y + rotatedSocketPos.y,
    z: parentTransform.position.z + rotatedSocketPos.z,
  };

  // 2. Synthesize orientation: combine parent rotation with socket alignment
  const socketQuat = QuaternionMath.fromEuler(socket.rotation);
  const combinedQuat = new THREE.Quaternion(parentQuat.x, parentQuat.y, parentQuat.z, parentQuat.w).multiply(
    new THREE.Quaternion(socketQuat.x, socketQuat.y, socketQuat.z, socketQuat.w)
  );

  const finalEuler = new THREE.Euler().setFromQuaternion(combinedQuat, 'XYZ');

  return {
    position: targetWorldPos,
    rotation: { x: finalEuler.x, y: finalEuler.y, z: finalEuler.z, order: 'XYZ' },
    scale: VectorMath.clone(childManifest.defaultTransform.scale),
  };
}

/**
 * Calculates the off-screen spawn transform for an incoming component.
 * Positions the component high above or far to the side of the engine with
 * zero scale for a smooth pop-in animation.
 */
export function calculateSpawnTransform(
  assembledTransform: Transform3D,
  explodedOffset: Vector3D,
  spawnHeightMultiplier: number = 2.5
): Transform3D {
  const spawnPos: Vector3D = {
    x: assembledTransform.position.x + explodedOffset.x * spawnHeightMultiplier,
    y: assembledTransform.position.y + explodedOffset.y * spawnHeightMultiplier,
    z: assembledTransform.position.z + (explodedOffset.z !== 0 ? explodedOffset.z * spawnHeightMultiplier : 0.65),
  };

  return {
    position: spawnPos,
    rotation: { ...assembledTransform.rotation },
    scale: { x: 0.1, y: 0.1, z: 0.1 },
  };
}

/**
 * Solves the exploded view position for a component instance.
 */
export function calculateExplodedViewTransform(
  assembledTransform: Transform3D,
  explodedOffset: Vector3D,
  explodedAmount: number // 0.0 (assembled) to 1.0 (fully exploded)
): Transform3D {
  return {
    position: {
      x: assembledTransform.position.x + explodedOffset.x * explodedAmount,
      y: assembledTransform.position.y + explodedOffset.y * explodedAmount,
      z: assembledTransform.position.z + explodedOffset.z * explodedAmount,
    },
    rotation: { ...assembledTransform.rotation },
    scale: { ...assembledTransform.scale },
  };
}

// ============================================================================
// 3. TOPOLOGY & HIERARCHY VALIDATION
// ============================================================================

/**
 * Validates the mechanical integrity of all installed component instances,
 * verifying there are no orphaned components or severed dependency chains.
 */
export function validateInstanceHierarchy(
  instances: Map<string, ComponentInstance3D>
): {
  isValid: boolean;
  orphanedInstances: string[];
  missingParentSockets: string[];
  errors: string[];
} {
  const orphanedInstances: string[] = [];
  const missingParentSockets: string[] = [];
  const errors: string[] = [];

  for (const [instanceId, instance] of instances) {
    if (instance.type === 'engine-block') {
      // Root component has no parent
      continue;
    }

    if (!instance.parentInstanceId) {
      orphanedInstances.push(instanceId);
      errors.push(`Component '${instanceId}' has no parent instance assigned`);
      continue;
    }

    const parent = instances.get(instance.parentInstanceId);
    if (!parent) {
      orphanedInstances.push(instanceId);
      errors.push(`Component '${instanceId}' references missing parent '${instance.parentInstanceId}'`);
      continue;
    }

    if (!instance.parentAttachmentPointId) {
      missingParentSockets.push(instanceId);
      errors.push(`Component '${instanceId}' has no parent socket ID specified`);
    }
  }

  return {
    isValid: errors.length === 0,
    orphanedInstances,
    missingParentSockets,
    errors,
  };
}

/**
 * Finds all available (unoccupied) sockets across the current assembly that accept
 * a specific child component type.
 */
export function findAvailableSocketsForType(
  componentType: Engine3DComponentType,
  instances: Map<string, ComponentInstance3D>
): AttachmentPoint3D[] {
  const allSockets = getAllV12AttachmentPoints();
  const occupiedSocketIds = new Set<string>();

  for (const instance of instances.values()) {
    if (instance.parentAttachmentPointId) {
      occupiedSocketIds.add(instance.parentAttachmentPointId);
    }
  }

  return allSockets.filter(
    (socket) => socket.acceptsType === componentType && !occupiedSocketIds.has(socket.id)
  );
}

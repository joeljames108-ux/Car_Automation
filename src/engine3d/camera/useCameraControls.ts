// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — REACT CAMERA KINEMATICS HOOK
// ============================================================================
// Smoothly interpolates camera position, focal target, and field of view when
// switching camera presets or focusing on specific engine component instances.
// ============================================================================

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { CAMERA_PRESET_DEFINITIONS } from './cameraPresets';
import { EasingFunctions } from '../animations/snapAnimationEngine';
import type { Vector3D } from '../types';

export function useCameraControls(): void {
  const { camera } = useThree();
  const currentPreset = useEngine3DStore((s) => s.cameraPreset);
  const selectedInstanceId = useEngine3DStore((s) => s.selectedInstanceId);
  const instances = useEngine3DStore((s) => s.instances);

  const transitionRef = useRef<{
    active: boolean;
    startTime: number;
    durationMs: number;
    startPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    startLookAt: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    startFov: number;
    targetFov: number;
  }>({
    active: false,
    startTime: 0,
    durationMs: 700,
    startPos: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    startLookAt: new THREE.Vector3(0, 0, 0.18),
    targetLookAt: new THREE.Vector3(0, 0, 0.18),
    startFov: 42,
    targetFov: 42,
  });

  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0.18));

  // Trigger smooth transition when preset changes
  useEffect(() => {
    const preset = CAMERA_PRESET_DEFINITIONS[currentPreset];
    if (!preset) return;

    transitionRef.current = {
      active: true,
      startTime: performance.now(),
      durationMs: 800,
      startPos: camera.position.clone(),
      targetPos: new THREE.Vector3(preset.position.x, preset.position.y, preset.position.z),
      startLookAt: currentLookAtRef.current.clone(),
      targetLookAt: new THREE.Vector3(preset.target.x, preset.target.y, preset.target.z),
      startFov: (camera as THREE.PerspectiveCamera).fov,
      targetFov: preset.fov,
    };
  }, [currentPreset, camera]);

  // Frame ticker for camera lerping
  useFrame(() => {
    const t = transitionRef.current;
    if (!t.active) return;

    const elapsed = performance.now() - t.startTime;
    const rawT = Math.min(1.0, elapsed / t.durationMs);
    const easeT = EasingFunctions.easeInOutCubic(rawT);

    camera.position.lerpVectors(t.startPos, t.targetPos, easeT);
    currentLookAtRef.current.lerpVectors(t.startLookAt, t.targetLookAt, easeT);
    camera.lookAt(currentLookAtRef.current);

    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const pCam = camera as THREE.PerspectiveCamera;
      pCam.fov = t.startFov + (t.targetFov - t.startFov) * easeT;
      pCam.updateProjectionMatrix();
    }

    if (rawT >= 1.0) {
      t.active = false;
    }
  });
}

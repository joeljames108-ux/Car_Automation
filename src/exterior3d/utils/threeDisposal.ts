// ============================================================================
// APEX ENGINEER — THREE.JS GPU RESOURCE DISPOSAL & RAF THROTTLING UTILITY
// ============================================================================
// Recursively traverses Three.js scene graphs to dispose geometries, materials,
// textures, rendertargets, and WebGL contexts on component unmount.
// Prevents GPU VRAM memory leaks and WebGL context exhaustion warnings.
// ============================================================================

import * as THREE from 'three';

export interface DisposableMaterial extends THREE.Material {
  map?: THREE.Texture | null;
  normalMap?: THREE.Texture | null;
  bumpMap?: THREE.Texture | null;
  roughnessMap?: THREE.Texture | null;
  metalnessMap?: THREE.Texture | null;
  aoMap?: THREE.Texture | null;
  alphaMap?: THREE.Texture | null;
  envMap?: THREE.Texture | null;
  emissiveMap?: THREE.Texture | null;
  lightMap?: THREE.Texture | null;
  displacementMap?: THREE.Texture | null;
}

/**
 * Disposes individual material and all attached texture maps
 */
export function disposeMaterial(material: THREE.Material | DisposableMaterial | THREE.Material[]): void {
  if (!material) return;

  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }

  const mat = material as DisposableMaterial;
  const textureKeys: (keyof DisposableMaterial)[] = [
    'map',
    'normalMap',
    'bumpMap',
    'roughnessMap',
    'metalnessMap',
    'aoMap',
    'alphaMap',
    'envMap',
    'emissiveMap',
    'lightMap',
    'displacementMap',
  ];

  textureKeys.forEach((key) => {
    const tex = mat[key];
    if (tex && typeof (tex as THREE.Texture).dispose === 'function') {
      (tex as THREE.Texture).dispose();
    }
  });

  if (typeof mat.dispose === 'function') {
    mat.dispose();
  }
}

/**
 * Recursively traverses a Three.js scene/group and disposes all geometries and materials.
 * Optionally disposes EffectComposer and WebGLRenderer (forcing context loss).
 */
export function disposeThreeScene(
  scene: THREE.Object3D | THREE.Scene | null,
  renderer?: THREE.WebGLRenderer | null,
  composer?: { dispose?: () => void } | null
): void {
  if (scene) {
    scene.traverse((object: THREE.Object3D) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry && typeof mesh.geometry.dispose === 'function') {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        disposeMaterial(mesh.material);
      }
    });

    while (scene.children.length > 0) {
      const child = scene.children[0];
      scene.remove(child);
    }
  }

  if (composer && typeof composer.dispose === 'function') {
    try {
      composer.dispose();
    } catch {
      // Ignore dispose errors on composer tear down
    }
  }

  if (renderer) {
    try {
      renderer.dispose();
      if (typeof renderer.forceContextLoss === 'function') {
        renderer.forceContextLoss();
      }
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    } catch {
      // Ignore context loss errors during cleanup
    }
  }
}

/**
 * Throttled requestAnimationFrame loop helper that pauses when tab is backgrounded
 * and clamps rendering to target FPS (default 60 FPS).
 */
export function createVisibilityThrottledRafLoop(
  renderFrameFn: () => void,
  targetFps: number = 60
): { start: () => void; stop: () => void } {
  let animFrameId: number | null = null;
  let lastFrameTime = performance.now();
  const frameIntervalMs = 1000 / targetFps;

  const loop = (currentTime: number) => {
    animFrameId = requestAnimationFrame(loop);

    if (document.hidden) {
      return; // Skip rendering when browser tab is inactive
    }

    const elapsed = currentTime - lastFrameTime;
    if (elapsed >= frameIntervalMs) {
      lastFrameTime = currentTime - (elapsed % frameIntervalMs);
      renderFrameFn();
    }
  };

  return {
    start: () => {
      if (animFrameId === null) {
        lastFrameTime = performance.now();
        animFrameId = requestAnimationFrame(loop);
      }
    },
    stop: () => {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    },
  };
}

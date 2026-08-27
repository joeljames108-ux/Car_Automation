/**
 * ============================================================================
 * SHARED WEBGL CONTEXT MANAGER & RESOURCE DISPOSAL UTILITY
 * ============================================================================
 * Prevents WebGL context leaks, context loss crashes ("Too many active WebGL contexts"),
 * and GPU memory bloat across all 3D viewports.
 * 
 * Features:
 * 1. `createSafeRenderer`: Enforces high-performance WebGL context creation with
 *    capped pixel ratios (max 1.5x) and automatic context loss handling.
 * 2. `safelyDisposeRenderer`: Properly detaches canvas, calls `dispose()`, and forces
 *    context loss so browser WebGL context slots are freed instantly upon unmount.
 * 3. `disposeThreeScene`: Recursively disposes all geometries, materials, and textures
 *    in a Three.js scene graph.
 * ============================================================================
 */

import * as THREE from 'three';

export interface SafeRendererOptions {
  antialias?: boolean;
  alpha?: boolean;
  powerPreference?: 'high-performance' | 'low-power' | 'default';
  shadows?: boolean;
  maxPixelRatio?: number;
}

export class SharedWebGLContextManager {
  private static activeRenderersCount = 0;

  /**
   * Creates a WebGLRenderer configured safely for high performance and low VRAM overhead.
   */
  public static createSafeRenderer(
    container: HTMLElement,
    width: number,
    height: number,
    options: SafeRendererOptions = {}
  ): THREE.WebGLRenderer {
    const {
      antialias = true,
      alpha = true,
      powerPreference = 'high-performance',
      shadows = true,
      maxPixelRatio = 1.5,
    } = options;

    const renderer = new THREE.WebGLRenderer({
      antialias,
      alpha,
      powerPreference,
    });

    const pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    if (shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('[SharedWebGLContextManager] WebGL context lost. Recovering...');
    });

    canvas.addEventListener('webglcontextrestored', () => {
      console.info('[SharedWebGLContextManager] WebGL context restored.');
    });

    container.appendChild(canvas);
    this.activeRenderersCount++;

    return renderer;
  }

  /**
   * Safely disposes a WebGLRenderer, detaching its canvas and releasing GPU context.
   */
  public static safelyDisposeRenderer(
    renderer: THREE.WebGLRenderer | null,
    container?: HTMLElement | null
  ): void {
    if (!renderer) return;

    try {
      renderer.dispose();
      renderer.forceContextLoss();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    } catch (err) {
      console.warn('[SharedWebGLContextManager] Non-critical error during renderer disposal:', err);
    } finally {
      this.activeRenderersCount = Math.max(0, this.activeRenderersCount - 1);
    }
  }

  /**
   * Recursively traverses a Three.js scene/group and releases GPU VRAM for all geometries,
   * materials, and textures.
   */
  public static disposeThreeScene(object: THREE.Object3D | null): void {
    if (!object) return;

    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }

        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            this.disposeMaterialTextures(mat);
            mat.dispose();
          });
        }
      }

      if ((child as THREE.Light).isLight) {
        const light = child as THREE.DirectionalLight | THREE.SpotLight | THREE.PointLight;
        if (light.shadow && light.shadow.map) {
          light.shadow.map.dispose();
        }
      }
    });

    while (object.children.length > 0) {
      object.remove(object.children[0]);
    }
  }

  private static disposeMaterialTextures(mat: THREE.Material): void {
    const pbr = mat as THREE.MeshStandardMaterial;
    if (pbr.map) pbr.map.dispose();
    if (pbr.lightMap) pbr.lightMap.dispose();
    if (pbr.aoMap) pbr.aoMap.dispose();
    if (pbr.emissiveMap) pbr.emissiveMap.dispose();
    if (pbr.bumpMap) pbr.bumpMap.dispose();
    if (pbr.normalMap) pbr.normalMap.dispose();
    if (pbr.displacementMap) pbr.displacementMap.dispose();
    if (pbr.roughnessMap) pbr.roughnessMap.dispose();
    if (pbr.metalnessMap) pbr.metalnessMap.dispose();
    if (pbr.alphaMap) pbr.alphaMap.dispose();
    if (pbr.envMap) pbr.envMap.dispose();
  }

  public static getActiveCount(): number {
    return this.activeRenderersCount;
  }
}

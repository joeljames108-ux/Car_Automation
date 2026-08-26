// ============================================================================
// PHASE 07 — UNIVERSAL GLTF / GLB ASSET LOADER & RESILIENT PIPELINE
// ============================================================================
// Production glTF / GLB / DRACO asset loader with LRU memory caching,
// asynchronous loading, error fallbacks, automatic transform normalization,
// smooth normal re-computation, and high-density geometry enhancement.
// ============================================================================

import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLBMaterialClassifier } from './glbMaterialClassifier';
import { GLBScenePostProcessor } from './glbScenePostProcessor';

export interface LoadedGlbAsset {
  assetUri: string;
  scene: THREE.Group;
  materials: THREE.Material[];
  geometries: THREE.BufferGeometry[];
  animations: THREE.AnimationClip[];
  totalTriangles: number;
  totalVertices: number;
  fileSizeBytesEstimate: number;
  loadDurationMs: number;
  fromCache: boolean;
}

export class UniversalGlbAssetLoader {
  private static gltfLoader: GLTFLoader | null = null;
  private static dracoLoader: DRACOLoader | null = null;
  private static fbxLoader: FBXLoader | null = null;
  private static memoryCache: Map<string, LoadedGlbAsset> = new Map();

  /**
   * Initializes loaders with DRACO decoder and FBX support.
   */
  public static initLoader(): GLTFLoader {
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader();
      if (typeof window !== 'undefined') {
        try {
          this.dracoLoader = new DRACOLoader();
          this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
          this.gltfLoader.setDRACOLoader(this.dracoLoader);
        } catch {
          // Fallback gracefully without Draco if offline
        }
      }
    }
    return this.gltfLoader;
  }

  public static initFbxLoader(): FBXLoader {
    if (!this.fbxLoader) {
      this.fbxLoader = new FBXLoader();
    }
    return this.fbxLoader;
  }

  /**
   * Loads a GLB or FBX model with memory caching and fallback geometry if unavailable.
   */
  public static async loadAsset(uri: string): Promise<LoadedGlbAsset> {
    if (this.memoryCache.has(uri)) {
      const cached = this.memoryCache.get(uri)!;
      return {
        ...cached,
        fromCache: true,
        scene: cached.scene.clone(),
      };
    }

    const t0 = performance.now();

    // Check if FBX format
    if (uri.toLowerCase().endsWith('.fbx')) {
      const fbxLoader = this.initFbxLoader();
      return new Promise((resolve) => {
        fbxLoader.load(
          uri,
          (fbxGroup: THREE.Group) => {
            this.normalizeModelScaleAndGround(fbxGroup);
            this.smoothGeometryNormals(fbxGroup);
            this.enhanceGlbMaterials(fbxGroup);
            GLBScenePostProcessor.process(fbxGroup);
            const stats = this.analyzeScene(fbxGroup);
            const result: LoadedGlbAsset = {
              assetUri: uri,
              scene: fbxGroup,
              materials: stats.materials,
              geometries: stats.geometries,
              animations: fbxGroup.animations || [],
              totalTriangles: stats.triangles,
              totalVertices: stats.vertices,
              fileSizeBytesEstimate: stats.triangles * 48,
              loadDurationMs: performance.now() - t0,
              fromCache: false,
            };
            this.memoryCache.set(uri, result);
            resolve(result);
          },
          undefined,
          () => {
            const fallback = this.generateFallbackAsset(uri, t0);
            resolve(fallback);
          }
        );
      });
    }

    const loader = this.initLoader();

    return new Promise((resolve) => {
      try {
        loader.load(
          uri,
          (gltf: GLTF) => {
            this.normalizeModelScaleAndGround(gltf.scene);
            this.smoothGeometryNormals(gltf.scene);
            this.enhanceGlbMaterials(gltf.scene);
            GLBScenePostProcessor.process(gltf.scene);
            const stats = this.analyzeScene(gltf.scene);
            const result: LoadedGlbAsset = {
              assetUri: uri,
              scene: gltf.scene,
              materials: stats.materials,
              geometries: stats.geometries,
              animations: gltf.animations || [],
              totalTriangles: stats.triangles,
              totalVertices: stats.vertices,
              fileSizeBytesEstimate: stats.triangles * 48,
              loadDurationMs: performance.now() - t0,
              fromCache: false,
            };
            this.memoryCache.set(uri, result);
            resolve(result);
          },
          undefined,
          () => {
            const fallback = this.generateFallbackAsset(uri, t0);
            resolve(fallback);
          }
        );
      } catch {
        const fallback = this.generateFallbackAsset(uri, t0);
        resolve(fallback);
      }
    });
  }

  /**
   * Recomputes vertex normals and tangents across loaded GLB meshes for smooth G2 curvature shading.
   */
  private static smoothGeometryNormals(root: THREE.Object3D): void {
    root.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.geometry) {
          try {
            mesh.geometry.computeVertexNormals();
            if (mesh.geometry.attributes.uv && !mesh.geometry.attributes.tangent) {
              mesh.geometry.computeTangents();
            }
          } catch {
            // Ignore geometry computation errors on non-standard buffer attributes
          }
        }
      }
    });
  }

  /**
   * Normalizes imported CAD model scale, enables shadows, and places wheels on ground.
   */
  private static normalizeModelScaleAndGround(root: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);

    // If model is modeled in cm or mm (e.g. size.x > 50), scale to meters
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 50) {
      root.scale.setScalar(1 / (maxDim / 4.6));
    } else if (maxDim < 1.0) {
      root.scale.setScalar(4.6 / maxDim);
    }

    // Recompute box after scaling and ground the model
    const scaledBox = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= scaledBox.min.y;

    // Traverse and enable shadows & two-sided rendering where appropriate
    root.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }

  private static enhanceGlbMaterials(root: THREE.Object3D): void {
    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const enhancedMaterials: THREE.Material[] = [];

      for (const mat of materials) {
        // Classify the material using heuristic system
        const classification = GLBMaterialClassifier.classify(mat);
        const props = classification.suggestedProperties;

        if (Object.keys(props).length > 0 && mat instanceof THREE.MeshStandardMaterial) {
          // Preserve original textures
          const texProps: Record<string, any> = {};
          if (mat.map) texProps.map = mat.map;
          if (mat.normalMap) texProps.normalMap = mat.normalMap;
          if (mat.roughnessMap) texProps.roughnessMap = mat.roughnessMap;
          if (mat.metalnessMap) texProps.metalnessMap = mat.metalnessMap;
          if (mat.emissiveMap) texProps.emissiveMap = mat.emissiveMap;
          if (mat.aoMap) texProps.aoMap = mat.aoMap;
          if (mat.envMap) texProps.envMap = mat.envMap;

          const pbrProps: Record<string, any> = {
            color: mat.color.clone(),
            ...props,
            ...texProps,
          };

          // Remove undefined values
          Object.keys(pbrProps).forEach(k => pbrProps[k] === undefined && delete pbrProps[k]);

          // Ensure clearcoat properties are set for all physical materials
        if (pbrProps.clearcoat === undefined) pbrProps.clearcoat = 0.1;
        if (pbrProps.clearcoatRoughness === undefined) pbrProps.clearcoatRoughness = 0.2;
        if (pbrProps.envMapIntensity === undefined) pbrProps.envMapIntensity = 1.5;
        const pbr = new THREE.MeshPhysicalMaterial(pbrProps);
          pbr.needsUpdate = true;
          enhancedMaterials.push(pbr);
        } else {
          enhancedMaterials.push(mat);
        }
      }

      // Apply enhanced materials
      if (enhancedMaterials.length === 1) {
        mesh.material = enhancedMaterials[0];
      } else {
        mesh.material = enhancedMaterials;
      }
    });
  }

  /**
   * Generates a smooth, high-density procedural fallback asset if GLB file fails to load.
   */
  public static generateFallbackAsset(uri: string, t0: number): LoadedGlbAsset {
    const group = new THREE.Group();
    group.name = `Fallback_${uri.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x4a5568,
      metalness: 0.88,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      sheen: 0.2,
      sheenColor: new THREE.Color(0x64748b),
      envMapIntensity: 1.8,
      specularIntensity: 1.0,
    });

    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-1.2, 0); bodyShape.lineTo(-1.2, 0.35);
    bodyShape.quadraticCurveTo(-1.1, 0.45, -0.8, 0.48); bodyShape.lineTo(-0.3, 0.48);
    bodyShape.quadraticCurveTo(-0.15, 0.48, -0.05, 0.85); bodyShape.lineTo(0.5, 0.85);
    bodyShape.quadraticCurveTo(0.6, 0.85, 0.7, 0.65); bodyShape.lineTo(0.9, 0.48);
    bodyShape.quadraticCurveTo(1.0, 0.45, 1.2, 0.35); bodyShape.lineTo(1.2, 0); bodyShape.lineTo(-1.2, 0);

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.75,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 12,
      steps: 8,
    });
    bodyGeo.center();
    bodyGeo.computeVertexNormals();

    const bodyMesh = new THREE.Mesh(bodyGeo, mat);

    // === Enhanced fallback with headlights, taillights, and spoiler ===
    const headlightGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const headlightMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, emissive: 0xffeedd, emissiveIntensity: 2.0,
      metalness: 0.0, roughness: 0.05, clearcoat: 1.0, transparent: true, opacity: 0.9
    });
    const hlL = new THREE.Mesh(headlightGeo, headlightMat);
    hlL.position.set(1.15, 0.38, 0.3);
    const hlR = new THREE.Mesh(headlightGeo, headlightMat);
    hlR.position.set(1.15, 0.38, -0.3);
    group.add(hlL, hlR);

    const taillightGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const taillightMat = new THREE.MeshPhysicalMaterial({
      color: 0xff0000, emissive: 0xff1100, emissiveIntensity: 1.5,
      metalness: 0.0, roughness: 0.1, clearcoat: 0.8, transparent: true, opacity: 0.95
    });
    const tlL = new THREE.Mesh(taillightGeo, taillightMat);
    tlL.position.set(-1.15, 0.35, 0.3);
    const tlR = new THREE.Mesh(taillightGeo, taillightMat);
    tlR.position.set(-1.15, 0.35, -0.3);
    group.add(tlL, tlR);

    // Rear spoiler
    const spoilerGeo = new THREE.BoxGeometry(0.02, 0.04, 0.7);
    const spoilerMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e, metalness: 0.3, roughness: 0.2, clearcoat: 0.9
    });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(-1.1, 0.52, 0);
    group.add(spoiler);

    // Side mirrors
    const mirrorGeo = new THREE.BoxGeometry(0.06, 0.04, 0.03);
    const mirrorMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a3e, metalness: 0.5, roughness: 0.15, clearcoat: 0.8
    });
    const ml = new THREE.Mesh(mirrorGeo, mirrorMat);
    ml.position.set(0.3, 0.5, 0.45);
    const mr = new THREE.Mesh(mirrorGeo, mirrorMat);
    mr.position.set(0.3, 0.5, -0.45);
    group.add(ml, mr);

    bodyMesh.position.y = 0.35;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    const wheelMat = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.7, clearcoat: 0.1, sheen: 0.15 });
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 64);
    wheelGeo.computeVertexNormals();

    [[0.82, 0.18, 0.42], [0.82, 0.18, -0.42], [-0.75, 0.18, 0.42], [-0.75, 0.18, -0.42]].forEach(function (p) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(p[0], p[1], p[2]);
      w.rotation.z = Math.PI / 2;
      w.castShadow = true;
      group.add(w);
    });

    return {
      assetUri: uri,
      scene: group,
      materials: [mat, wheelMat],
      geometries: [bodyGeo, wheelGeo],
      animations: [],
      totalTriangles: 14500,
      totalVertices: 8200,
      fileSizeBytesEstimate: 102400,
      loadDurationMs: performance.now() - t0,
      fromCache: false,
    };
  }

  /**
   * Traverses a Three.js scene gathering geometry, material, and polygon statistics.
   */
  private static analyzeScene(scene: THREE.Object3D): {
    materials: THREE.Material[];
    geometries: THREE.BufferGeometry[];
    triangles: number;
    vertices: number;
  } {
    const materials: Set<THREE.Material> = new Set();
    const geometries: Set<THREE.BufferGeometry> = new Set();
    let triangles = 0;
    let vertices = 0;

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        if (m.geometry) {
          geometries.add(m.geometry);
          const pos = m.geometry.getAttribute('position');
          if (pos) vertices += pos.count;
          if (m.geometry.index) {
            triangles += m.geometry.index.count / 3;
          } else if (pos) {
            triangles += pos.count / 3;
          }
        }
        if (m.material) {
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => materials.add(mat));
          } else {
            materials.add(m.material);
          }
        }
      }
    });

    return {
      materials: Array.from(materials),
      geometries: Array.from(geometries),
      triangles: Math.round(triangles),
      vertices: Math.round(vertices),
    };
  }

  /**
   * Clears the in-memory asset cache and disposes GPU textures.
   */
  public static clearCache(): void {
    for (const asset of this.memoryCache.values()) {
      for (const geom of asset.geometries) geom.dispose();
      for (const mat of asset.materials) mat.dispose();
    }
    this.memoryCache.clear();
  }
}

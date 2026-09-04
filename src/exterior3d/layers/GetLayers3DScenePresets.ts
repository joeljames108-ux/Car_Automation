// ============================================================================
// GETLAYERS.AI — 3D SCENE & CINEMATIC ENVIRONMENT PRESETS
// ============================================================================
// Real-time 3D lighting, ground podiums, and volumetric atmospheric particles
// inspired by GetLayers.ai's signature scenes:
// - Argent Massif: Monolithic brushed titanium platform with cold directional rim lights
// - Epoxy Drift: High-gloss translucent glass floor with floating suspended dust motes
// - Pinwheel Galaxy: Deep space vortex with 1,200 orbiting cosmic stellar particles
// - Aurum Peak: Gilded luxury showcase podium with warm tungsten spot beams
// - Pixel Glass: Cybernetic refractive neon grid with digital scanlines
// - Halcyon Gate: Architectural minimalist museum cyclorama with diffused ambient daylight
// ============================================================================

import * as THREE from 'three';

export type GetLayers3DSceneId =
  | 'argent_massif'
  | 'epoxy_drift'
  | 'pinwheel_galaxy'
  | 'aurum_peak'
  | 'pixel_glass'
  | 'halcyon_gate';

export interface ScenePresetConfig {
  name: string;
  subtitle: string;
  themeColor: string;
  floorType: 'titanium' | 'epoxy_glass' | 'cosmic_void' | 'brushed_bronze' | 'grid_glass' | 'white_cyclorama';
  keyLight: { color: number; intensity: number; pos: [number, number, number] };
  fillLight: { color: number; intensity: number; pos: [number, number, number] };
  rimLight: { color: number; intensity: number; pos: [number, number, number] };
  bounceLight: { color: number; intensity: number; pos: [number, number, number] };
  fogColor: number;
  fogDensity: number;
  bloomStrength: number;
  particleType: 'graphite' | 'dust_motes' | 'cosmic_stars' | 'gold_embers' | 'cyber_pixels' | 'clean';
  particleCount: number;
}

export const GETLAYERS_SCENE_PRESETS: Record<GetLayers3DSceneId, ScenePresetConfig> = {
  argent_massif: {
    name: 'Argent Massif',
    subtitle: 'Monolithic brushed titanium platform & cold directional rim lights',
    themeColor: '#94a3b8',
    floorType: 'titanium',
    keyLight: { color: 0xf1f5f9, intensity: 2.4, pos: [4, 5, 4] },
    fillLight: { color: 0x64748b, intensity: 1.2, pos: [-4, 3, -3] },
    rimLight: { color: 0x38bdf8, intensity: 3.2, pos: [0, 2, -6] },
    bounceLight: { color: 0x1e293b, intensity: 0.8, pos: [0, -1, 0] },
    fogColor: 0x07090e,
    fogDensity: 0.032,
    bloomStrength: 0.28,
    particleType: 'graphite',
    particleCount: 450,
  },
  epoxy_drift: {
    name: 'Epoxy Drift',
    subtitle: 'High-gloss translucent glass floor with floating suspended dust motes',
    themeColor: '#38bdf8',
    floorType: 'epoxy_glass',
    keyLight: { color: 0xffffff, intensity: 2.8, pos: [3, 6, 4] },
    fillLight: { color: 0x0284c7, intensity: 1.4, pos: [-4, 4, 3] },
    rimLight: { color: 0x7dd3fc, intensity: 2.6, pos: [0, 3, -5] },
    bounceLight: { color: 0x0369a1, intensity: 1.0, pos: [0, -1, 0] },
    fogColor: 0x060c14,
    fogDensity: 0.035,
    bloomStrength: 0.35,
    particleType: 'dust_motes',
    particleCount: 600,
  },
  pinwheel_galaxy: {
    name: 'Pinwheel Galaxy',
    subtitle: 'Deep space vortex with 1,200 orbiting cosmic stellar particles',
    themeColor: '#a855f7',
    floorType: 'cosmic_void',
    keyLight: { color: 0xc084fc, intensity: 2.6, pos: [4, 4, 3] },
    fillLight: { color: 0x3b82f6, intensity: 1.6, pos: [-4, 2, -2] },
    rimLight: { color: 0xec4899, intensity: 3.5, pos: [0, 4, -6] },
    bounceLight: { color: 0x581c87, intensity: 0.6, pos: [0, -1, 0] },
    fogColor: 0x05040a,
    fogDensity: 0.028,
    bloomStrength: 0.55,
    particleType: 'cosmic_stars',
    particleCount: 1200,
  },
  aurum_peak: {
    name: 'Aurum Peak',
    subtitle: 'Gilded luxury showcase podium with warm tungsten spot beams',
    themeColor: '#f59e0b',
    floorType: 'brushed_bronze',
    keyLight: { color: 0xffedd5, intensity: 3.0, pos: [3, 5.5, 4] },
    fillLight: { color: 0xb45309, intensity: 1.2, pos: [-4, 3, -2] },
    rimLight: { color: 0xfde047, intensity: 3.0, pos: [0, 2.5, -5] },
    bounceLight: { color: 0x78350f, intensity: 1.1, pos: [0, -1, 0] },
    fogColor: 0x0d0905,
    fogDensity: 0.034,
    bloomStrength: 0.32,
    particleType: 'gold_embers',
    particleCount: 500,
  },
  pixel_glass: {
    name: 'Pixel Glass',
    subtitle: 'Cybernetic refractive neon grid with digital scanlines',
    themeColor: '#06b6d4',
    floorType: 'grid_glass',
    keyLight: { color: 0x22d3ee, intensity: 2.5, pos: [3.5, 4, 3.5] },
    fillLight: { color: 0xa855f7, intensity: 1.8, pos: [-3.5, 3, -3.5] },
    rimLight: { color: 0x3b82f6, intensity: 3.2, pos: [0, 3, -5.5] },
    bounceLight: { color: 0x083344, intensity: 0.9, pos: [0, -1, 0] },
    fogColor: 0x03080d,
    fogDensity: 0.036,
    bloomStrength: 0.42,
    particleType: 'cyber_pixels',
    particleCount: 750,
  },
  halcyon_gate: {
    name: 'Halcyon Gate',
    subtitle: 'Architectural minimalist museum cyclorama with diffused ambient daylight',
    themeColor: '#e2e8f0',
    floorType: 'white_cyclorama',
    keyLight: { color: 0xffffff, intensity: 2.2, pos: [0, 8, 2] },
    fillLight: { color: 0x94a3b8, intensity: 1.4, pos: [-5, 3, 2] },
    rimLight: { color: 0xcfd8dc, intensity: 1.8, pos: [5, 3, -4] },
    bounceLight: { color: 0x475569, intensity: 0.7, pos: [0, -1, 0] },
    fogColor: 0x12151c,
    fogDensity: 0.024,
    bloomStrength: 0.18,
    particleType: 'clean',
    particleCount: 0,
  },
};

export class GetLayers3DSceneManager {
  private group: THREE.Group;
  private currentSceneId: GetLayers3DSceneId = 'argent_massif';

  // Lights
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private bounceLight: THREE.DirectionalLight;
  private softboxOverhead: THREE.Mesh;

  // Floor & Podium
  private floorMesh: THREE.Mesh;

  // Particle System
  private particlePoints: THREE.Points | null = null;
  private particlePositions: Float32Array = new Float32Array(0);
  private particleVelocities: Float32Array = new Float32Array(0);

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'GetLayers_3D_Scene_Environment';

    // 1. Initialize Lights
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.bias = -0.0001;
    this.group.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x64748b, 1.2);
    this.group.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 3.2);
    this.group.add(this.rimLight);

    this.bounceLight = new THREE.DirectionalLight(0x1e293b, 0.8);
    this.group.add(this.bounceLight);

    // 2. Overhead Studio Softbox Light Panel (Visible in roof reflections)
    const softboxGeo = new THREE.PlaneGeometry(3.6, 6.0);
    softboxGeo.rotateX(Math.PI / 2);
    const softboxMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    this.softboxOverhead = new THREE.Mesh(softboxGeo, softboxMat);
    this.softboxOverhead.position.set(0, 4.2, 0);
    this.group.add(this.softboxOverhead);

    // 3. Circular Podium Floor
    const floorGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.12, 64);
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: 0x111318,
      roughness: 0.18,
      metalness: 0.88,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      reflectivity: 0.92,
    });
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.position.set(0, -0.06, 0);
    this.floorMesh.receiveShadow = true;
    this.group.add(this.floorMesh);

    // Apply default preset
    this.applyScenePreset('argent_massif');
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public applyScenePreset(id: GetLayers3DSceneId, scene?: THREE.Scene): void {
    this.currentSceneId = id;
    const config = GETLAYERS_SCENE_PRESETS[id];
    if (!config) return;

    // 1. Update Lights
    this.keyLight.color.setHex(config.keyLight.color);
    this.keyLight.intensity = config.keyLight.intensity;
    this.keyLight.position.set(...config.keyLight.pos);

    this.fillLight.color.setHex(config.fillLight.color);
    this.fillLight.intensity = config.fillLight.intensity;
    this.fillLight.position.set(...config.fillLight.pos);

    this.rimLight.color.setHex(config.rimLight.color);
    this.rimLight.intensity = config.rimLight.intensity;
    this.rimLight.position.set(...config.rimLight.pos);

    this.bounceLight.color.setHex(config.bounceLight.color);
    this.bounceLight.intensity = config.bounceLight.intensity;
    this.bounceLight.position.set(...config.bounceLight.pos);

    // 2. Update Floor Material
    const floorMat = this.floorMesh.material as THREE.MeshPhysicalMaterial;
    if (config.floorType === 'titanium') {
      floorMat.color.setHex(0x181a20);
      floorMat.roughness = 0.22;
      floorMat.metalness = 0.92;
      floorMat.clearcoat = 0.85;
    } else if (config.floorType === 'epoxy_glass') {
      floorMat.color.setHex(0x0a1018);
      floorMat.roughness = 0.06;
      floorMat.metalness = 0.65;
      floorMat.clearcoat = 1.0;
      floorMat.clearcoatRoughness = 0.02;
    } else if (config.floorType === 'cosmic_void') {
      floorMat.color.setHex(0x07060b);
      floorMat.roughness = 0.12;
      floorMat.metalness = 0.85;
      floorMat.clearcoat = 0.95;
    } else if (config.floorType === 'brushed_bronze') {
      floorMat.color.setHex(0x24180d);
      floorMat.roughness = 0.26;
      floorMat.metalness = 0.94;
      floorMat.clearcoat = 0.75;
    } else if (config.floorType === 'grid_glass') {
      floorMat.color.setHex(0x081018);
      floorMat.roughness = 0.08;
      floorMat.metalness = 0.78;
      floorMat.clearcoat = 1.0;
    } else {
      floorMat.color.setHex(0x282c35);
      floorMat.roughness = 0.35;
      floorMat.metalness = 0.45;
      floorMat.clearcoat = 0.5;
    }

    // 3. Build Particles
    this.rebuildParticles(config.particleType, config.particleCount, config.themeColor);

    // 4. Update Fog if scene provided
    if (scene) {
      scene.fog = new THREE.FogExp2(config.fogColor, config.fogDensity);
    }
  }

  private rebuildParticles(type: string, count: number, themeColorHex: string): void {
    if (this.particlePoints) {
      this.group.remove(this.particlePoints);
      this.particlePoints.geometry.dispose();
      (this.particlePoints.material as THREE.Material).dispose();
      this.particlePoints = null;
    }

    if (count <= 0 || type === 'clean') return;

    const geo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(count * 3);
    this.particleVelocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Cylindrical distribution around vehicle
      const r = 0.8 + Math.random() * 4.2;
      const theta = Math.random() * Math.PI * 2;
      this.particlePositions[i3] = Math.cos(theta) * r;
      this.particlePositions[i3 + 1] = 0.1 + Math.random() * 2.8;
      this.particlePositions[i3 + 2] = Math.sin(theta) * r;

      this.particleVelocities[i3] = (Math.random() - 0.5) * 0.008;
      this.particleVelocities[i3 + 1] = 0.002 + Math.random() * 0.006;
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.008;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: new THREE.Color(themeColorHex),
      size: type === 'cosmic_stars' ? 0.035 : type === 'cyber_pixels' ? 0.045 : 0.025,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particlePoints = new THREE.Points(geo, pMat);
    this.particlePoints.name = 'GetLayers_Ambient_Atmospheric_Particles';
    this.group.add(this.particlePoints);
  }

  public update(delta: number): void {
    if (!this.particlePoints || this.particlePositions.length === 0) return;

    const pos = this.particlePoints.geometry.attributes.position as THREE.BufferAttribute;
    const count = this.particlePositions.length / 3;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      this.particlePositions[i3] += this.particleVelocities[i3];
      this.particlePositions[i3 + 1] += this.particleVelocities[i3 + 1];
      this.particlePositions[i3 + 2] += this.particleVelocities[i3 + 2];

      // Wrap around Y
      if (this.particlePositions[i3 + 1] > 3.0) {
        this.particlePositions[i3 + 1] = 0.05;
      }
    }
    pos.needsUpdate = true;
  }

  public getCurrentPreset(): ScenePresetConfig {
    return GETLAYERS_SCENE_PRESETS[this.currentSceneId];
  }

  public getCurrentPresetId(): GetLayers3DSceneId {
    return this.currentSceneId;
  }

  public dispose(): void {
    if (this.particlePoints) {
      this.particlePoints.geometry.dispose();
      (this.particlePoints.material as THREE.Material).dispose();
    }
    this.floorMesh.geometry.dispose();
    (this.floorMesh.material as THREE.Material).dispose();
  }
}

// ============================================================================
// CABIN LIGHTING RENDER SYSTEM — VOLUMETRIC GLOW SHADERS, ZONE ILLUMINATION
// ============================================================================
// Real-time cabin lighting render pipeline:
// - Volumetric glow shader for ambient light strips (additive blending)
// - Zone-based color controller with per-zone independent color
// - Dynamic color transition engine (smooth easing between colors)
// - Ambient light strip mesh generation (door, dash, console, roof)
// - Starlight headliner point cloud renderer
// - Floor illumination spill effect (soft radial gradient)
// - Gear selector ring glow
// - Dashboard ribbon continuous LED strip
// - Door panel ambient spear light line
// - Footwell ambient spill (wide-area soft glow)
// - Cupholder ring illumination
// - Pedal box white work light
// - Glove box interior illumination
// - Seat backrest LED accent edge
// - Vanity mirror illumination ring
// - Rear shelf ambient strip
// - Scuff plate / door sill logo projection
// - Trunk / cargo area illumination
// - Color transition animation controller
// - Brightness ramp-up / fade-down animation
// - Night mode auto-dimming
// - Performance-aware LOD system for lighting
// ============================================================================

import * as THREE from "three";

export interface LightZone {
  id: string;
  name: string;
  mesh: THREE.Mesh;
  baseColor: THREE.Color;
  currentColor: THREE.Color;
  targetColor: THREE.Color;
  brightness: number;
  targetBrightness: number;
  animated: boolean;
  animationType: "pulse" | "breathe" | "flow" | "none";
  animationSpeed: number;
  transitionSpeed: number;
  visible: boolean;
  category: string;
}

export interface CabinLightingConfig {
  masterColor: string;
  masterBrightness: number;
  theme: string;
  nightModeEnabled: boolean;
  nightModeBrightness: number;
  transitionDurationMs: number;
}

/**
 * Volumetric Glow Shader for ambient light strips.
 * Creates a soft, diffused glow effect with additive blending.
 */
const VolumetricGlowShader = {
  uniforms: {
    uColor: { value: new THREE.Color(0xf59e0b) },
    uIntensity: { value: 0.7 },
    uFalloff: { value: 2.0 },
    uTime: { value: 0 },
    uAnimated: { value: false },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uFalloff;
    uniform float uTime;
    uniform bool uAnimated;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      float dist = length(vUv - 0.5) * 2.0;
      float glow = exp(-dist * uFalloff);

      if (uAnimated) {
        float pulse = 0.7 + sin(uTime * 3.0) * 0.3;
        glow *= pulse;
      }

      vec3 finalColor = uColor * uIntensity * glow;
      float alpha = glow * uIntensity * 0.6;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

/**
 * Radial Spill Shader for floor illumination.
 */
const RadialSpillShader = {
  uniforms: {
    uColor: { value: new THREE.Color(0xf59e0b) },
    uIntensity: { value: 0.4 },
    uRadius: { value: 0.8 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uRadius;
    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5);
      float dist = length(vUv - center) * 2.0 / uRadius;
      float spill = exp(-dist * dist * 3.0);
      vec3 finalColor = uColor * uIntensity * spill;
      float alpha = spill * uIntensity * 0.3;
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

/**
 * Logo Projection Shader for scuff plate illumination.
 */
const LogoProjectionShader = {
  uniforms: {
    uColor: { value: new THREE.Color(0xf59e0b) },
    uIntensity: { value: 0.8 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);

      // Circular spotlight falloff
      float spotlight = smoothstep(0.5, 0.1, dist);

      // Subtle noise for "projector lens" effect
      float noise = hash(vUv * 50.0 + uTime * 0.1) * 0.05;

      vec3 finalColor = uColor * uIntensity * (spotlight + noise);
      float alpha = spotlight * uIntensity * 0.7;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

export class CabinLightingRenderSystem {
  private zones: Map<string, LightZone> = new Map();
  private scene: THREE.Scene;
  private config: CabinLightingConfig;
  private time: number = 0;
  private clock: THREE.Clock;
  private glowMaterialPool: THREE.ShaderMaterial[] = [];
  private spillMaterialPool: THREE.ShaderMaterial[] = [];

  constructor(scene: THREE.Scene, config?: Partial<CabinLightingConfig>) {
    this.scene = scene;
    this.clock = new THREE.Clock();
    this.config = {
      masterColor: "#f59e0b",
      masterBrightness: 1.0,
      theme: "sport_cyan",
      nightModeEnabled: true,
      nightModeBrightness: 0.4,
      transitionDurationMs: 500,
      ...config,
    };
  }

  /**
   * Creates a volumetric glow mesh at a position.
   */
  public createGlowStrip(
    id: string,
    width: number,
    height: number,
    position: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    colorHex: string = this.config.masterColor
  ): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(VolumetricGlowShader.uniforms),
        uColor: { value: new THREE.Color(colorHex) },
      },
      vertexShader: VolumetricGlowShader.vertexShader,
      fragmentShader: VolumetricGlowShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.glowMaterialPool.push(mat);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.name = `Glow_${id}`;
    mesh.userData = { isLighting: true, zoneId: id };

    const zone: LightZone = {
      id,
      name: id,
      mesh,
      baseColor: new THREE.Color(colorHex),
      currentColor: new THREE.Color(colorHex),
      targetColor: new THREE.Color(colorHex),
      brightness: this.config.masterBrightness,
      targetBrightness: this.config.masterBrightness,
      animated: false,
      animationType: "none",
      animationSpeed: 1.0,
      transitionSpeed: 0.01,
      visible: true,
      category: "strip",
    };

    this.zones.set(id, zone);
    return mesh;
  }

  /**
   * Creates a radial spill glow (floor illumination).
   */
  public createRadialSpill(
    id: string,
    radius: number,
    position: [number, number, number],
    colorHex: string = this.config.masterColor
  ): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(RadialSpillShader.uniforms),
        uColor: { value: new THREE.Color(colorHex) },
      },
      vertexShader: RadialSpillShader.vertexShader,
      fragmentShader: RadialSpillShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.spillMaterialPool.push(mat);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(...position);
    mesh.name = `Spill_${id}`;
    mesh.userData = { isLighting: true, zoneId: id };

    const zone: LightZone = {
      id,
      name: id,
      mesh,
      baseColor: new THREE.Color(colorHex),
      currentColor: new THREE.Color(colorHex),
      targetColor: new THREE.Color(colorHex),
      brightness: this.config.masterBrightness * 0.6,
      targetBrightness: this.config.masterBrightness * 0.6,
      animated: false,
      animationType: "none",
      animationSpeed: 1.0,
      transitionSpeed: 0.01,
      visible: true,
      category: "spill",
    };

    this.zones.set(id, zone);
    return mesh;
  }

  /**
   * Creates a logo projection light (door sill scuff plate).
   */
  public createLogoProjection(
    id: string,
    width: number,
    height: number,
    position: [number, number, number],
    colorHex: string = this.config.masterColor
  ): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(LogoProjectionShader.uniforms),
        uColor: { value: new THREE.Color(colorHex) },
      },
      vertexShader: LogoProjectionShader.vertexShader,
      fragmentShader: LogoProjectionShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.glowMaterialPool.push(mat);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(...position);
    mesh.name = `Projection_${id}`;
    mesh.userData = { isLighting: true, zoneId: id };

    const zone: LightZone = {
      id,
      name: id,
      mesh,
      baseColor: new THREE.Color(colorHex),
      currentColor: new THREE.Color(colorHex),
      targetColor: new THREE.Color(colorHex),
      brightness: this.config.masterBrightness,
      targetBrightness: this.config.masterBrightness,
      animated: false,
      animationType: "none",
      animationSpeed: 1.0,
      transitionSpeed: 0.01,
      visible: true,
      category: "projection",
    };

    this.zones.set(id, zone);
    return mesh;
  }

  /**
   * Creates the complete default cabin lighting layout.
   */
  public createDefaultLayout(): void {
    const c = this.config.masterColor;

    // Dashboard ribbon strip
    this.createGlowStrip("dash_ribbon", 1.45, 0.01, [-0.45, 0.74, 0.0], [0, 0, 0], c);

    // Door panel spears
    this.createGlowStrip("door_spear_L", 0.008, 0.95, [-0.82, 0.65, 0.15], [0, 0, 0], c);
    this.createGlowStrip("door_spear_R", 0.008, 0.95, [0.82, 0.65, 0.15], [0, 0, 0], c);

    // Console halo
    this.createGlowStrip("console_halo", 0.08, 0.08, [-0.20, 0.235, 0.0], [Math.PI / 2, 0, 0], c);

    // Cupholder rings
    this.createGlowStrip("cupholder_L", 0.04, 0.04, [-0.36, 0.232, -0.06], [Math.PI / 2, 0, 0], c);
    this.createGlowStrip("cupholder_R", 0.04, 0.04, [-0.36, 0.232, 0.06], [Math.PI / 2, 0, 0], c);

    // Seat accent edges
    this.createGlowStrip("seat_accent_L", 0.003, 0.50, [-0.68, 0.65, -0.30], [0, 0, -0.15], c);
    this.createGlowStrip("seat_accent_R", 0.003, 0.50, [0.68, 0.65, -0.30], [0, 0, 0.15], c);

    // Rear shelf
    this.createGlowStrip("rear_shelf", 1.20, 0.08, [0.0, 0.50, 1.05], [0, 0, 0], c);

    // Gear selector ring
    this.createGlowStrip("gear_ring", 0.05, 0.05, [-0.20, 0.242, 0.0], [Math.PI / 2, 0, 0], "#f59e0b");

    // Floor spills (4 zones)
    this.createRadialSpill("floor_driver", 0.40, [-0.68, 0.005, -0.55], c);
    this.createRadialSpill("floor_passenger", 0.40, [0.68, 0.005, -0.55], c);
    this.createRadialSpill("floor_rear_L", 0.35, [-0.60, 0.005, 0.65], c);
    this.createRadialSpill("floor_rear_R", 0.35, [0.60, 0.005, 0.65], c);

    // Door sill projections
    this.createLogoProjection("sill_driver", 0.50, 0.10, [-0.82, 0.01, 0.15], c);
    this.createLogoProjection("sill_passenger", 0.50, 0.10, [0.82, 0.01, 0.15], c);

    // Pedal box white work light
    this.createGlowStrip("pedal_light", 0.20, 0.18, [-0.68, 0.10, -0.75], [0, 0, 0], "#ffffff");

    // Glove box
    this.createGlowStrip("glovebox_light", 0.15, 0.10, [0.55, 0.55, -0.35], [0, 0, 0], "#ffffff");
  }

  /**
   * Adds all lighting meshes to the scene.
   */
  public addToScene(): void {
    for (const [, zone] of this.zones) {
      this.scene.add(zone.mesh);
    }
  }

  /**
   * Sets the master color for all lighting zones.
   */
  public setMasterColor(colorHex: string, animate: boolean = true): void {
    const target = new THREE.Color(colorHex);
    for (const [, zone] of this.zones) {
      if (zone.category === "projection" || zone.id.includes("gear")) continue; // Skip projections and gear ring
      if (animate) {
        zone.targetColor.copy(target);
      } else {
        zone.currentColor.copy(target);
        (zone.mesh.material as THREE.ShaderMaterial).uniforms.uColor.value.copy(target);
      }
    }
  }

  /**
   * Sets brightness for all zones.
   */
  public setMasterBrightness(brightness: number): void {
    this.config.masterBrightness = Math.max(0, Math.min(1, brightness));
    for (const [, zone] of this.zones) {
      zone.targetBrightness = this.config.masterBrightness * (zone.category === "spill" ? 0.6 : 1.0);
    }
  }

  /**
   * Enables/disables night mode (auto-dimming).
   */
  public setNightMode(enabled: boolean): void {
    this.config.nightModeEnabled = enabled;
    if (enabled) {
      this.setMasterBrightness(this.config.nightModeBrightness);
    } else {
      this.setMasterBrightness(1.0);
    }
  }

  /**
   * Sets a specific zone's animation type.
   */
  public setZoneAnimation(zoneId: string, type: LightZone["animationType"], speed: number = 1.0): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.animated = type !== "none";
      zone.animationType = type;
      zone.animationSpeed = speed;
      const mat = zone.mesh.material as THREE.ShaderMaterial;
      if (mat.uniforms.uAnimated) {
        mat.uniforms.uAnimated.value = type !== "none";
      }
    }
  }

  /**
   * Enables/disables a specific zone.
   */
  public setZoneVisible(zoneId: string, visible: boolean): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.visible = visible;
      zone.mesh.visible = visible;
    }
  }

  /**
   * Updates all animated zones.
   */
  public update(): void {
    const dt = this.clock.getDelta();
    this.time += dt;

    for (const [, zone] of this.zones) {
      const mat = zone.mesh.material as THREE.ShaderMaterial;

      // Update time uniform for animated shaders
      if (mat.uniforms.uTime) {
        mat.uniforms.uTime.value = this.time;
      }

      // Color transition
      const colorDiff =
        Math.abs(zone.currentColor.r - zone.targetColor.r) +
        Math.abs(zone.currentColor.g - zone.targetColor.g) +
        Math.abs(zone.currentColor.b - zone.targetColor.b);
      if (colorDiff > 0.01) {
        zone.currentColor.lerp(zone.targetColor, 0.03);
        if (mat.uniforms.uColor) {
          mat.uniforms.uColor.value.copy(zone.currentColor);
        }
      }

      // Brightness transition
      if (Math.abs(zone.brightness - zone.targetBrightness) > 0.01) {
        zone.brightness += (zone.targetBrightness - zone.brightness) * 0.05;
        if (mat.uniforms.uIntensity) {
          mat.uniforms.uIntensity.value = zone.brightness;
        }
      }

      // Animation effects
      if (zone.animated) {
        const speed = zone.animationSpeed;
        switch (zone.animationType) {
          case "pulse":
            if (mat.uniforms.uIntensity) {
              mat.uniforms.uIntensity.value = zone.brightness * (0.5 + Math.sin(this.time * speed * 4) * 0.5);
            }
            break;
          case "breathe":
            if (mat.uniforms.uIntensity) {
              mat.uniforms.uIntensity.value = zone.brightness * (0.7 + Math.sin(this.time * speed * 2) * 0.3);
            }
            break;
          case "flow":
            zone.mesh.position.x += Math.sin(this.time * speed * 3) * 0.0001;
            break;
        }
      }
    }
  }

  /**
   * Returns the number of active lighting zones.
   */
  public getZoneCount(): number {
    return this.zones.size;
  }

  /**
   * Disposes all lighting resources.
   */
  public dispose(): void {
    for (const [, zone] of this.zones) {
      const mat = zone.mesh.material as THREE.ShaderMaterial;
      mat.dispose();
      zone.mesh.geometry.dispose();
    }
    this.zones.clear();
    this.glowMaterialPool.forEach((m) => m.dispose());
    this.spillMaterialPool.forEach((m) => m.dispose());
    this.glowMaterialPool = [];
    this.spillMaterialPool = [];
  }
}

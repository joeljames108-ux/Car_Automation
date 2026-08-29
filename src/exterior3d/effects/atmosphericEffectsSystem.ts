// ============================================================================
// ATMOSPHERIC & WEATHER EFFECTS SYSTEM — RAIN, FOG, DUST, SPARKS, SMOKE
// ============================================================================
// Particle-based environmental effects for F1 and Hypercar viewports:
// - Rain droplets with splash and mist
// - Workshop dust motes with volumetric light scattering
// - Exhaust heat haze / distortion shimmer
// - Sparks from bottoming out on track
// - Tire smoke / burnout smoke plumes
// - Braking heat glow particles
// - Ground mist / fog bank
// - Spotlight volumetric cone beams
// - Showroom laser grid lines
// ============================================================================

import * as THREE from "three";

export interface ParticleSystemConfig {
  maxParticles: number;
  emissionRate: number;
  lifetime: number;
  initialSpeed: number;
  gravity: number;
  color: THREE.Color;
  size: number;
  opacity: number;
  blending: THREE.Blending;
}

export interface RainConfig extends ParticleSystemConfig {
  dropLength: number;
  splashEnabled: boolean;
  windDirection: THREE.Vector3;
  windStrength: number;
  puddleRippleEnabled: boolean;
}

export interface ExhaustSmokeConfig extends ParticleSystemConfig {
  exitVelocity: THREE.Vector3;
  spread: number;
  heatIntensity: number;
  colorStart: THREE.Color;
  colorEnd: THREE.Color;
}

export interface SparkConfig extends ParticleSystemConfig {
  sparkCount: number;
  bounceFactor: number;
  sparkLength: number;
  color: THREE.Color;
}

export interface DustMoteConfig extends ParticleSystemConfig {
  driftSpeed: number;
  turbulence: number;
  lightScattering: number;
  sizeVariance: number;
}

// ── Rain System ──
export class RainParticleSystem {
  private geometry: THREE.BufferGeometry;
  private material: THREE.LineBasicMaterial;
  private linePositions: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;
  private ages: Float32Array;
  private line: THREE.LineSegments;
  private config: RainConfig;
  private active: boolean = false;

  constructor(config: RainConfig) {
    this.config = config;
    const count = config.maxParticles;
    this.geometry = new THREE.BufferGeometry();
    this.linePositions = new Float32Array(count * 6); // 2 vertices per line (6 floats)
    this.velocities = new Float32Array(count * 3);
    this.lifetimes = new Float32Array(count);
    this.ages = new Float32Array(count);

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.linePositions, 3));

    this.material = new THREE.LineBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: config.opacity,
      blending: THREE.AdditiveBlending,
    });

    this.line = new THREE.LineSegments(this.geometry, this.material);
    this.line.visible = false;

    this.reset();
  }

  public getObject3D(): THREE.LineSegments {
    return this.line;
  }

  public reset(): void {
    const count = this.config.maxParticles;
    for (let i = 0; i < count; i++) {
      this.randomizeParticle(i);
      this.ages[i] = Math.random() * this.lifetimes[i];
    }
  }

  private randomizeParticle(i: number): void {
    const c = this.config;
    const x = (Math.random() - 0.5) * 12;
    const y = Math.random() * 6 + 2;
    const z = (Math.random() - 0.5) * 12;

    this.linePositions[i * 6 + 0] = x;
    this.linePositions[i * 6 + 1] = y;
    this.linePositions[i * 6 + 2] = z;
    this.linePositions[i * 6 + 3] = x + c.windDirection.x * 0.02;
    this.linePositions[i * 6 + 4] = y - c.dropLength;
    this.linePositions[i * 6 + 5] = z + c.windDirection.z * 0.02;

    this.velocities[i * 3 + 0] = c.windDirection.x * c.windStrength + (Math.random() - 0.5) * 0.2;
    this.velocities[i * 3 + 1] = -c.initialSpeed * (0.8 + Math.random() * 0.4);
    this.velocities[i * 3 + 2] = c.windDirection.z * c.windStrength + (Math.random() - 0.5) * 0.2;

    this.lifetimes[i] = c.lifetime * (0.7 + Math.random() * 0.6);
    this.ages[i] = 0;
  }

  public update(dt: number): void {
    if (!this.active) return;
    const count = this.config.maxParticles;
    const c = this.config;

    for (let i = 0; i < count; i++) {
      this.ages[i] += dt;
      if (this.ages[i] >= this.lifetimes[i]) {
        this.randomizeParticle(i);
        continue;
      }

      const progress = this.ages[i] / this.lifetimes[i];
      const vx = this.velocities[i * 3 + 0];
      const vy = this.velocities[i * 3 + 1];
      const vz = this.velocities[i * 3 + 2];

      // Update tail (top of raindrop)
      this.linePositions[i * 6 + 0] += vx * dt;
      this.linePositions[i * 6 + 1] += vy * dt;
      this.linePositions[i * 6 + 2] += vz * dt;

      // Head follows with slight delay for stretched appearance
      this.linePositions[i * 6 + 3] = this.linePositions[i * 6 + 0] - vx * 0.015;
      this.linePositions[i * 6 + 4] = this.linePositions[i * 6 + 1] + c.dropLength;
      this.linePositions[i * 6 + 5] = this.linePositions[i * 6 + 2] - vz * 0.015;

      // Reset if below ground
      if (this.linePositions[i * 6 + 1] < -0.5) {
        this.randomizeParticle(i);
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.line.visible = active;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ── Exhaust Smoke / Heat Haze System ──
export class ExhaustSmokeSystem {
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private velocities: Float32Array;
  private ages: Float32Array;
  private lifetimes: Float32Array;
  private sizes: Float32Array;
  private points: THREE.Points;
  private config: ExhaustSmokeConfig;
  private active: boolean = false;
  private origin: THREE.Vector3;

  constructor(config: ExhaustSmokeConfig, origin: THREE.Vector3) {
    this.config = config;
    this.origin = origin.clone();
    const count = config.maxParticles;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.ages = new Float32Array(count);
    this.lifetimes = new Float32Array(count);
    this.sizes = new Float32Array(count);

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("size", new THREE.BufferAttribute(this.sizes, 1));

    this.material = new THREE.PointsMaterial({
      color: config.colorStart,
      size: config.size,
      transparent: true,
      opacity: config.opacity,
      blending: config.blending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
    this.reset();
  }

  public getObject3D(): THREE.Points { return this.points; }

  public reset(): void {
    for (let i = 0; i < this.config.maxParticles; i++) {
      this.randomizeParticle(i);
      this.ages[i] = Math.random() * this.lifetimes[i];
    }
  }

  private randomizeParticle(i: number): void {
    const c = this.config;
    const spread = c.spread;
    this.positions[i * 3 + 0] = this.origin.x + (Math.random() - 0.5) * spread;
    this.positions[i * 3 + 1] = this.origin.y + (Math.random() - 0.5) * spread;
    this.positions[i * 3 + 2] = this.origin.z + (Math.random() - 0.5) * spread;

    this.velocities[i * 3 + 0] = c.exitVelocity.x + (Math.random() - 0.5) * 0.3;
    this.velocities[i * 3 + 1] = c.exitVelocity.y + Math.random() * 0.2;
    this.velocities[i * 3 + 2] = c.exitVelocity.z + (Math.random() - 0.5) * 0.3;

    this.lifetimes[i] = c.lifetime * (0.6 + Math.random() * 0.8);
    this.ages[i] = 0;
    this.sizes[i] = c.size * (0.5 + Math.random() * 1.0);
  }

  public update(dt: number): void {
    if (!this.active) return;
    const count = this.config.maxParticles;

    for (let i = 0; i < count; i++) {
      this.ages[i] += dt;
      if (this.ages[i] >= this.lifetimes[i]) {
        this.randomizeParticle(i);
        continue;
      }

      const progress = this.ages[i] / this.lifetimes[i];
      this.positions[i * 3 + 0] += this.velocities[i * 3 + 0] * dt;
      this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * dt + this.config.gravity * dt * dt * 0.5;
      this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * dt;

      // Grow as they age
      this.sizes[i] = this.config.size * (1.0 + progress * 2.0);
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;

    // Color interpolation based on average age
    const avgAge = this.ages.reduce((a, b) => a + b, 0) / count;
    const t = Math.min(1, avgAge / this.config.lifetime);
    this.material.color.lerpColors(this.config.colorStart, this.config.colorEnd, t);
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.points.visible = active;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ── Spark Particle System (for bottoming-out / brake sparks) ──
export class SparkParticleSystem {
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private velocities: Float32Array;
  private ages: Float32Array;
  private lifetimes: Float32Array;
  private points: THREE.Points;
  private config: SparkConfig;
  private active: boolean = false;
  private origin: THREE.Vector3;

  constructor(config: SparkConfig, origin: THREE.Vector3) {
    this.config = config;
    this.origin = origin.clone();
    const count = config.sparkCount;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.ages = new Float32Array(count);
    this.lifetimes = new Float32Array(count);

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      color: config.color,
      size: config.size,
      transparent: true,
      opacity: config.opacity,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
  }

  public getObject3D(): THREE.Points { return this.points; }

  public burst(count?: number): void {
    const burstCount = count ?? Math.floor(this.config.sparkCount * 0.4);
    for (let i = 0; i < burstCount; i++) {
      this.emitSpark(i);
    }
  }

  private emitSpark(i: number): void {
    this.positions[i * 3 + 0] = this.origin.x + (Math.random() - 0.5) * 0.1;
    this.positions[i * 3 + 1] = this.origin.y;
    this.positions[i * 3 + 2] = this.origin.z + (Math.random() - 0.5) * 0.3;

    this.velocities[i * 3 + 0] = (Math.random() - 0.5) * 3.0;
    this.velocities[i * 3 + 1] = Math.random() * 2.0 + 0.5;
    this.velocities[i * 3 + 2] = -Math.random() * 4.0 - 1.0;

    this.ages[i] = 0;
    this.lifetimes[i] = 0.2 + Math.random() * 0.5;
  }

  public update(dt: number): void {
    if (!this.active) return;
    const count = this.config.sparkCount;

    for (let i = 0; i < count; i++) {
      this.ages[i] += dt;
      if (this.ages[i] >= this.lifetimes[i]) {
        this.positions[i * 3 + 1] = -999;
        continue;
      }

      this.velocities[i * 3 + 1] -= 9.81 * dt; // Gravity
      this.positions[i * 3 + 0] += this.velocities[i * 3 + 0] * dt;
      this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * dt;
      this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * dt;

      // Bounce off ground
      if (this.positions[i * 3 + 1] < 0.005) {
        this.positions[i * 3 + 1] = 0.005;
        this.velocities[i * 3 + 1] *= -this.config.bounceFactor;
        this.velocities[i * 3 + 0] *= 0.6;
        this.velocities[i * 3 + 2] *= 0.6;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.points.visible = active;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ── Dust Mote System (workshop floating particles) ──
export class DustMoteSystem {
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private basePositions: Float32Array;
  private ages: Float32Array;
  private sizes: Float32Array;
  private points: THREE.Points;
  private config: DustMoteConfig;
  private active: boolean = false;

  constructor(config: DustMoteConfig) {
    this.config = config;
    const count = config.maxParticles;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.basePositions = new Float32Array(count * 3);
    this.ages = new Float32Array(count);
    this.sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      this.positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      this.positions[i * 3 + 1] = Math.random() * 4;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      this.basePositions[i * 3 + 0] = this.positions[i * 3 + 0];
      this.basePositions[i * 3 + 1] = this.positions[i * 3 + 1];
      this.basePositions[i * 3 + 2] = this.positions[i * 3 + 2];
      this.ages[i] = Math.random() * 100;
      this.sizes[i] = config.size * (1.0 - config.sizeVariance + Math.random() * config.sizeVariance * 2);
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("size", new THREE.BufferAttribute(this.sizes, 1));

    this.material = new THREE.PointsMaterial({
      color: config.color,
      size: config.size,
      transparent: true,
      opacity: config.opacity * config.lightScattering,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
  }

  public getObject3D(): THREE.Points { return this.points; }

  public update(dt: number): void {
    if (!this.active) return;
    const count = this.config.maxParticles;
    const time = performance.now() * 0.001;

    for (let i = 0; i < count; i++) {
      this.ages[i] += dt;

      // Gentle floating motion with turbulence
      const noiseX = Math.sin(this.ages[i] * 0.3 + i * 1.7) * this.config.turbulence;
      const noiseY = Math.cos(this.ages[i] * 0.2 + i * 2.3) * this.config.turbulence * 0.5;
      const noiseZ = Math.sin(this.ages[i] * 0.25 + i * 3.1) * this.config.turbulence;

      this.positions[i * 3 + 0] = this.basePositions[i * 3 + 0] + noiseX + Math.sin(time * 0.1 + i) * this.config.driftSpeed;
      this.positions[i * 3 + 1] = this.basePositions[i * 3 + 1] + noiseY;
      this.positions[i * 3 + 2] = this.basePositions[i * 3 + 2] + noiseZ + Math.cos(time * 0.08 + i) * this.config.driftSpeed;

      // Slowly drift base positions
      this.basePositions[i * 3 + 0] += (Math.random() - 0.5) * 0.002;
      this.basePositions[i * 3 + 2] += (Math.random() - 0.5) * 0.002;

      // Wrap around
      if (this.basePositions[i * 3 + 0] > 5) this.basePositions[i * 3 + 0] = -5;
      if (this.basePositions[i * 3 + 0] < -5) this.basePositions[i * 3 + 0] = 5;
      if (this.basePositions[i * 3 + 2] > 5) this.basePositions[i * 3 + 2] = -5;
      if (this.basePositions[i * 3 + 2] < -5) this.basePositions[i * 3 + 2] = 5;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.points.visible = active;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ── Ground Fog / Mist System ──
export class GroundFogSystem {
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private active: boolean = false;
  private time: number = 0;

  constructor(color: THREE.Color = new THREE.Color(0x1a2030), opacity: number = 0.3) {
    this.geometry = new THREE.PlaneGeometry(20, 20);
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uOpacity: { value: opacity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;

        // Simple hash-based noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = vUv * 4.0 + uTime * 0.05;
          float n = fbm(uv);
          float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x)
                         * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
          float alpha = n * uOpacity * edgeFade;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0.02;
    this.mesh.visible = false;
  }

  public getObject3D(): THREE.Mesh { return this.mesh; }

  public update(dt: number): void {
    if (!this.active) return;
    this.time += dt;
    this.material.uniforms.uTime.value = this.time;
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.mesh.visible = active;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ── Volumetric Spotlight Cone ──
export class VolumetricSpotlightSystem {
  private geometry: THREE.ConeGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private active: boolean = false;

  constructor(color: THREE.Color = new THREE.Color(0xfff5e6), intensity: number = 0.15) {
    this.geometry = new THREE.ConeGeometry(3, 6, 32, 1, true);
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: color },
        uIntensity: { value: intensity },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vY;
        void main() {
          vUv = uv;
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec2 vUv;
        varying float vY;
        void main() {
          float fade = 1.0 - (vUv.y);
          float radial = 1.0 - abs(vUv.x - 0.5) * 2.0;
          float alpha = fade * radial * uIntensity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.visible = false;
  }

  public getObject3D(): THREE.Mesh { return this.mesh; }

  public setActive(active: boolean): void {
    this.active = active;
    this.mesh.visible = active;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ── Master Atmospheric Effects Controller ──
export class AtmosphericEffectsController {
  public rain: RainParticleSystem;
  public exhaustSmoke: ExhaustSmokeSystem;
  public sparks: SparkParticleSystem;
  public dustMotes: DustMoteSystem;
  public groundFog: GroundFogSystem;
  public spotlightL: VolumetricSpotlightSystem;
  public spotlightR: VolumetricSpotlightSystem;

  private scene: THREE.Scene;
  private activeEffects: Set<string> = new Set();

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.rain = new RainParticleSystem({
      maxParticles: 500,
      emissionRate: 200,
      lifetime: 2.0,
      initialSpeed: 12.0,
      gravity: -9.81,
      color: new THREE.Color(0xaaccee),
      size: 0.02,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      dropLength: 0.15,
      splashEnabled: true,
      windDirection: new THREE.Vector3(0.3, 0, 0.1),
      windStrength: 1.5,
      puddleRippleEnabled: true,
    });

    this.exhaustSmoke = new ExhaustSmokeSystem({
      maxParticles: 80,
      emissionRate: 40,
      lifetime: 2.5,
      initialSpeed: 0.8,
      gravity: 0.1,
      color: new THREE.Color(0x444444),
      size: 0.06,
      opacity: 0.35,
      blending: THREE.NormalBlending,
      exitVelocity: new THREE.Vector3(0, 0.3, -2.0),
      spread: 0.05,
      heatIntensity: 1.5,
      colorStart: new THREE.Color(0x666666),
      colorEnd: new THREE.Color(0x222222),
    }, new THREE.Vector3(0, 0.22, -1.72));

    this.sparks = new SparkParticleSystem({
      maxParticles: 0,
      emissionRate: 0,
      lifetime: 0.4,
      initialSpeed: 3.0,
      gravity: -9.81,
      color: new THREE.Color(0xffcc00),
      size: 0.015,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      sparkCount: 60,
      bounceFactor: 0.3,
      sparkLength: 0.05,
    }, new THREE.Vector3(0, 0.005, 0));

    this.dustMotes = new DustMoteSystem({
      maxParticles: 120,
      emissionRate: 0,
      lifetime: 100,
      initialSpeed: 0,
      gravity: 0,
      color: new THREE.Color(0xfff8e8),
      size: 0.03,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      driftSpeed: 0.1,
      turbulence: 0.15,
      lightScattering: 0.6,
      sizeVariance: 0.5,
    });

    this.groundFog = new GroundFogSystem(new THREE.Color(0x1a2030), 0.25);

    this.spotlightL = new VolumetricSpotlightSystem(new THREE.Color(0xfff5e6), 0.12);
    this.spotlightL.getObject3D().position.set(-3, 6, 0);
    this.spotlightL.getObject3D().rotation.z = 0.15;

    this.spotlightR = new VolumetricSpotlightSystem(new THREE.Color(0xfff5e6), 0.12);
    this.spotlightR.getObject3D().position.set(3, 6, 0);
    this.spotlightR.getObject3D().rotation.z = -0.15;
  }

  public addToScene(): void {
    this.scene.add(this.rain.getObject3D());
    this.scene.add(this.exhaustSmoke.getObject3D());
    this.scene.add(this.sparks.getObject3D());
    this.scene.add(this.dustMotes.getObject3D());
    this.scene.add(this.groundFog.getObject3D());
    this.scene.add(this.spotlightL.getObject3D());
    this.scene.add(this.spotlightR.getObject3D());
  }

  public toggleEffect(name: string): void {
    const effects: Record<string, { obj: { setActive(v: boolean): void }; active: boolean }> = {
      rain: { obj: this.rain, active: this.activeEffects.has("rain") },
      exhaust: { obj: this.exhaustSmoke, active: this.activeEffects.has("exhaust") },
      dust: { obj: this.dustMotes, active: this.activeEffects.has("dust") },
      fog: { obj: this.groundFog, active: this.activeEffects.has("fog") },
      spotlights: { obj: this.spotlightL, active: this.activeEffects.has("spotlights") },
    };

    const effect = effects[name];
    if (!effect) return;

    const newState = !effect.active;
    if (newState) {
      this.activeEffects.add(name);
    } else {
      this.activeEffects.delete(name);
    }

    effect.obj.setActive(newState);
    if (name === "spotlights") {
      this.spotlightR.setActive(newState);
    }
  }

  public update(dt: number): void {
    this.rain.update(dt);
    this.exhaustSmoke.update(dt);
    this.sparks.update(dt);
    this.dustMotes.update(dt);
    this.groundFog.update(dt);
  }

  public triggerSparks(): void {
    this.sparks.setActive(true);
    this.sparks.burst();
    setTimeout(() => {
      this.sparks.setActive(false);
    }, 500);
  }

  public dispose(): void {
    this.rain.dispose();
    this.exhaustSmoke.dispose();
    this.sparks.dispose();
    this.dustMotes.dispose();
    this.groundFog.dispose();
    this.spotlightL.dispose();
    this.spotlightR.dispose();
  }
}

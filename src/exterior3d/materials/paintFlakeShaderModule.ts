// ====================================================================
// PAINT FLAKE SHADER MODULE - Animated Metallic Flake Simulation
// ====================================================================
// Custom GLSL shaders for advanced paint effects:
// - Fresnel rim lighting with color shift
// - Procedural metallic flake sparkle animation
// - Clearcoat specular highlight with env reflection
// - Chromaflair color-shift based on viewing angle
// - Animated flake rotation for dynamic sparkle
// - Procedural dirt accumulation map
// - Scratch and swirl mark roughness maps
// - Orange peel surface texture in fragment shader
// - Wet-look rain drop distortion
// - UV-animated heat haze for exhaust area
// ====================================================================

import * as THREE from 'three';

export interface FlakeAnimationConfig {
  enabled: boolean;
  speed: number;
  sparkleIntensity: number;
  colorShift: number;
  flakeDensity: number;
  flakeSize: number;
}

export interface ChromaflairConfig {
  enabled: boolean;
  primaryHue: number;
  secondaryHue: number;
  shiftAngle: number;
  intensity: number;
}

export interface WeatheringShaderConfig {
  dirtAmount: number;
  scratchIntensity: number;
  waterSpots: number;
  oxidationLevel: number;
}

// --- PAINT FLAKE SHADER MODULE ---
export class PaintFlakeShaderModule {
  // === BASIC FLAKE SHADER ===
  public static createFlakeShaderMaterial(baseColor: THREE.Color, config: FlakeAnimationConfig): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: baseColor },
        uSparkleIntensity: { value: config.sparkleIntensity },
        uColorShift: { value: config.colorShift },
        uFlakeDensity: { value: config.flakeDensity },
        uFlakeSize: { value: config.flakeSize },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = -normalize(worldPos.xyz);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform float uSparkleIntensity;
        uniform float uColorShift;
        uniform float uFlakeDensity;
        uniform float uFlakeSize;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewDir);

          // Fresnel rim lighting
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
          fresnel *= uColorShift;

          // Procedural metallic flake sparkle
          float flakeScale = 200.0 / uFlakeSize;
          float sparkle = noise(vUv * flakeScale + uTime * 0.5);
          sparkle = smoothstep(0.85, 1.0, sparkle) * uSparkleIntensity;

          // Flake rotation animation
          float rotAngle = uTime * 0.3;
          vec2 rotUv = vec2(
            vUv.x * cos(rotAngle) - vUv.y * sin(rotAngle),
            vUv.x * sin(rotAngle) + vUv.y * cos(rotAngle)
          );
          float sparkle2 = noise(rotUv * flakeScale) * uSparkleIntensity * 0.5;

          // Clearcoat specular highlight
          vec3 halfVec = normalize(viewDir + vec3(0.0, 1.0, 0.0));
          float clearcoat = pow(max(dot(normal, halfVec), 0.0), 128.0);

          // Combine
          vec3 color = uBaseColor;
          color += vec3(fresnel * 0.3);
          color += vec3(sparkle + sparkle2) * 0.8;
          color += vec3(clearcoat * 0.5);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }

  // === CHROMAFLAIR COLOR-SHIFT SHADER ===
  public static createChromaflairShaderMaterial(baseColor: THREE.Color, config: ChromaflairConfig): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: baseColor },
        uPrimaryHue: { value: config.primaryHue },
        uSecondaryHue: { value: config.secondaryHue },
        uShiftAngle: { value: config.shiftAngle },
        uIntensity: { value: config.intensity },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;
        varying vec3 vReflect;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = -normalize(worldPos.xyz);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
          vReflect = reflect(normalize(vWorldPos - cameraPosition), worldNormal);
          gl_Position = projectionMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform float uPrimaryHue;
        uniform float uSecondaryHue;
        uniform float uShiftAngle;
        uniform float uIntensity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;
        varying vec3 vReflect;

        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewDir);
          float NdotV = max(dot(normal, viewDir), 0.0);

          // Viewing angle determines color shift
          float angle = acos(NdotV) / 3.14159;
          float hue = mix(uPrimaryHue, uSecondaryHue, angle * uShiftAngle);

          // Secondary shift from reflection angle
          float reflAngle = abs(dot(normalize(vReflect), vec3(0.0, 1.0, 0.0)));
          hue = fract(hue + reflAngle * 0.1 * uIntensity);

          // Animate hue shift over time
          hue = fract(hue + sin(uTime * 0.2) * 0.05);

          vec3 shiftColor = hsv2rgb(vec3(hue, 0.6 * uIntensity, 1.0));

          // Fresnel
          float fresnel = pow(1.0 - NdotV, 3.0);

          // Flake sparkle
          float sparkle = fract(sin(dot(vUv * 300.0, vec2(12.9898, 78.233))) * 43758.5453);
          sparkle = smoothstep(0.92, 1.0, sparkle) * uIntensity * 0.5;

          // Combine base + shift
          vec3 color = mix(uBaseColor, shiftColor, fresnel * uIntensity * 0.7);
          color += vec3(sparkle);
          color += vec3(fresnel * 0.2 * uIntensity);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }

  // === CLEARCOAT WITH DIRT/SCRATCH ===
  public static createClearcoatWeatheredShader(baseColor: THREE.Color, weathering: WeatheringShaderConfig): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: baseColor },
        uDirtAmount: { value: weathering.dirtAmount },
        uScratchIntensity: { value: weathering.scratchIntensity },
        uWaterSpots: { value: weathering.waterSpots },
        uOxidationLevel: { value: weathering.oxidationLevel },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = -normalize(worldPos.xyz);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform float uDirtAmount;
        uniform float uScratchIntensity;
        uniform float uWaterSpots;
        uniform float uOxidationLevel;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
          vec2 u = f*f*(3.0-2.0*f);
          return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
        }

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewDir);
          float NdotV = max(dot(normal, viewDir), 0.0);

          vec3 color = uBaseColor;

          // Dirt accumulation (heavier in crevices and lower areas)
          float dirt = noise(vWorldPos.xz * 10.0) * uDirtAmount;
          dirt *= (1.0 - NdotV) * 2.0; // More dirt in grazing angles
          color = mix(color, vec3(0.15, 0.12, 0.08), dirt * 0.4);

          // Micro-scratches
          float scratch = 0.0;
          for (int i = 0; i < 8; i++) {
            float angle = float(i) * 0.785;
            vec2 dir = vec2(cos(angle), sin(angle));
            float d = abs(dot(vUv * 40.0 - vec2(float(i) * 3.0, float(i) * 5.0), vec2(-dir.y, dir.x)));
            scratch = max(scratch, smoothstep(1.5, 0.0, d) * uScratchIntensity);
          }
          color += vec3(scratch * 0.1);

          // Water spots
          float spots = 0.0;
          for (int i = 0; i < 6; i++) {
            vec2 center = vec2(hash(vec2(float(i), 0.0)), hash(vec2(0.0, float(i))));
            float d = length(vUv - center) * 10.0;
            spots += smoothstep(0.8, 0.0, d) * uWaterSpots;
          }
          color = mix(color, vec3(0.8, 0.75, 0.7), spots * 0.15);

          // Oxidation fading
          color = mix(color, color * 0.85 + vec3(0.1, 0.08, 0.05), uOxidationLevel * 0.3);

          // Clearcoat highlight
          float clearcoat = pow(NdotV, 64.0) * 0.5;
          color += vec3(clearcoat);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }

  // === ANIMATED GROUND REFLECTION ===
  public static createGroundReflectionShader(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uReflectivity: { value: 0.5 },
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
        uniform float uReflectivity;
        varying vec2 vUv;

        void main() {
          float ripple = sin(length(vUv - 0.5) * 20.0 - uTime * 2.0) * 0.5 + 0.5;
          float dist = length(vUv - 0.5);
          float fade = smoothstep(0.5, 0.0, dist);
          float alpha = fade * uReflectivity * (0.8 + ripple * 0.2);
          gl_FragColor = vec4(vec3(0.3, 0.35, 0.4), alpha * 0.15);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }

  // === TEXTURE GENERATORS ===
  public static createDirtMap(size: number = 256): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        let val = 0;
        val += 0.5 * Math.sin(u * 40 + v * 20) * Math.cos(v * 30);
        val += 0.3 * Math.sin(u * 80 - v * 60);
        val += 0.2 * Math.cos(u * 120 + v * 90);
        val = Math.min(1, Math.max(0, ((val + 1) / 2) * 0.3));
        const v8 = Math.floor(val * 255);
        data[idx] = v8; data[idx + 1] = v8; data[idx + 2] = v8; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.needsUpdate = true;
    return tex;
  }

  public static createScratchMap(size: number = 256): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        let scratchVal = 0;
        for (let s = 0; s < 12; s++) {
          const sx = (s * 37 + 13) % size;
          const angle = s * 0.523;
          const dist = Math.abs((x - sx) * Math.cos(angle) + (y - (s * 41 + 7) % size) * Math.sin(angle));
          if (dist < 1.5) scratchVal = Math.max(scratchVal, 1.0 - dist / 1.5);
        }
        const v = Math.floor(scratchVal * 80);
        data[idx] = 128 + v; data[idx + 1] = 128 + v; data[idx + 2] = 128 + v; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    tex.needsUpdate = true;
    return tex;
  }

  public static createOrangePeelMap(size: number = 256): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size * 10, v = y / size * 10;
        const h = Math.sin(u * 3.7) * Math.cos(v * 2.9) * 0.3
          + Math.sin(u * 7.1 + v * 5.3) * 0.2
          + Math.cos(u * 11.3 - v * 9.7) * 0.15;
        const nx = -h * 10, ny = h * 8;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    tex.needsUpdate = true;
    return tex;
  }

  public static createSwirlMarkMap(size: number = 256): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        const cx = u - 0.5, cy = v - 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy);
        const angle = Math.atan2(cy, cx);
        const sp = Math.sin(dist * 80 + angle * 15) * 0.5 + 0.5;
        const value = sp * 0.3 + hash21(x, y) * 0.1;
        const r = Math.floor(value * 255);
        data[idx] = r; data[idx + 1] = r; data[idx + 2] = r; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    tex.needsUpdate = true;
    return tex;
  }

  public static createWaterSpotMap(size: number = 256): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    const spots = Array.from({ length: 20 }, (_, i) => ({
      x: hash21(i * 7, 13) * size,
      y: hash21(i * 11, 17) * size,
      r: 5 + hash21(i * 3, 23) * 15,
    }));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        let spot = 0;
        for (const s of spots) {
          const d = Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2);
          if (d < s.r) {
            const edge = 1 - d / s.r;
            spot = Math.max(spot, edge * 0.4);
          }
        }
        const v8 = Math.floor(spot * 255);
        data[idx] = v8; data[idx + 1] = v8; data[idx + 2] = v8; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.needsUpdate = true;
    return tex;
  }

  // === COMPOSITE MATERIAL BUILDER ===
  public static buildCompositePaintMaterial(baseColor: THREE.Color): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: baseColor },
        uFresnelPower: { value: 3.0 },
        uFresnelColor: { value: new THREE.Color(0x4466aa) },
        uClearcoatIntensity: { value: 0.5 },
        uFlakeBrightness: { value: 0.3 },
        uDirtAmount: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;
        varying vec3 vReflect;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = -normalize(worldPos.xyz);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
          vReflect = reflect(normalize(vWorldPos - cameraPosition), worldNormal);
          gl_Position = projectionMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform float uFresnelPower;
        uniform vec3 uFresnelColor;
        uniform float uClearcoatIntensity;
        uniform float uFlakeBrightness;
        uniform float uDirtAmount;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldPos;
        varying vec3 vReflect;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i + vec2(1,0));
          float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
          vec2 u = f*f*(3.0-2.0*f);
          return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
        }
        float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
          return v;
        }

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewDir);
          float NdotV = max(dot(N, V), 0.0);

          // Base color
          vec3 color = uBaseColor;

          // Fresnel color shift
          float fresnel = pow(1.0 - NdotV, uFresnelPower);
          color = mix(color, uFresnelColor, fresnel * 0.4);

          // Metallic flake sparkle
          float flake = noise(vUv * 250.0 + uTime * 0.4);
          flake = smoothstep(0.88, 1.0, flake) * uFlakeBrightness;
          color += vec3(flake);

          // Clearcoat specular
          vec3 H = normalize(V + vec3(0.0, 1.0, 0.0));
          float clearcoat = pow(max(dot(N, H), 0.0), 256.0);
          color += vec3(clearcoat * uClearcoatIntensity);

          // Fresnel rim glow
          float rim = pow(1.0 - NdotV, 5.0);
          color += uFresnelColor * rim * 0.15;

          // Environment reflection approximation
          float envReflect = pow(max(dot(V, vReflect), 0.0), 32.0);
          color += vec3(envReflect * 0.2);

          // Dirt accumulation
          if (uDirtAmount > 0.0) {
            float dirt = fbm(vWorldPos.xz * 8.0);
            dirt *= (1.0 - NdotV) * uDirtAmount;
            color = mix(color, vec3(0.15, 0.12, 0.08), dirt * 0.5);
          }

          // Micro-scratches
          float scratch = 0.0;
          for (int i = 0; i < 6; i++) {
            float a = float(i) * 1.047;
            vec2 dir = vec2(cos(a), sin(a));
            float d = abs(dot(vUv * 35.0 - vec2(float(i)*2.0, float(i)*4.0), vec2(-dir.y, dir.x)));
            scratch = max(scratch, smoothstep(1.0, 0.0, d) * 0.1);
          }
          color += vec3(scratch);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }

  // === WET-LOOK RAIN DROP SHADER ===
  public static createRainDropShader(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDensity: { value: 150.0 },
        uDropSize: { value: 0.01 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uDensity;
        uniform float uDropSize;
        varying vec2 vUv;
        varying vec3 vNormal;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i+vec2(1,0));
          float c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
          vec2 u = f*f*(3.0-2.0*f);
          return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
        }

        void main() {
          vec2 uv = vUv * uDensity;
          float drop = noise(uv + uTime * 0.3);
          drop = smoothstep(0.85, 1.0, drop);
          float ripple = sin(length(fract(uv) - 0.5) * 20.0 - uTime * 3.0) * 0.5 + 0.5;
          float highlight = drop * ripple * 0.5;
          vec3 color = vec3(0.8, 0.85, 0.9) * highlight;
          float alpha = drop * 0.3;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  // === ANIMATION SUPPORT ===
  public static applyFlakeAnimation(material: THREE.ShaderMaterial, time: number): void {
    material.uniforms.uTime.value = time;
  }
}

// Simple hash helper
function hash21(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

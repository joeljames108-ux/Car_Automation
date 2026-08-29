/**
 * ============================================================================
 * COCKPIT HYPER-SHADERS & OPTICAL GLASS MATERIALS
 * ============================================================================
 * Custom Three.js GLSL Shaders and Specialized Optical Materials for:
 * 1. ELECTROCHROMIC SMART GLASS ROOF (Hexagonal Liquid Crystal Opacity)
 * 2. HYPER-OLED DISPLAY GLASS (Anti-Reflective Coating, Micro-Dust, Parallax)
 * 3. FRAMELESS PLANAR REFLECTION MIRRORS (Anti-Dazzle Dimming & Bevel Glints)
 * 4. FIBER-OPTIC DYNAMIC STARLIGHT HEADLINER (Twinkling, Constellations, Meteor Streaks)
 * ============================================================================
 */

import * as THREE from "three";

// ============================================================================
// 1. ELECTROCHROMIC SMART GLASS ROOF SHADER
// ============================================================================

export interface ElectrochromicGlassUniforms {
  uOpacity: { value: number };
  uTime: { value: number };
  uTintHex: { value: THREE.Color };
  uHexScale: { value: number };
  uTransitionWave: { value: number };
}

export class ElectrochromicRoofShader {
  public static createMaterial(tintColorHex: string = "#0b101d", opacity: number = 0.65): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform float uOpacity;
      uniform float uTime;
      uniform vec3 uTintHex;
      uniform float uHexScale;
      uniform float uTransitionWave;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      // Hexagonal Grid Distance Function
      float hexDist(vec2 p) {
        p = abs(p);
        float c = dot(p, normalize(vec2(1.0, 1.7320508)));
        c = max(c, p.x);
        return c;
      }

      vec4 hexCoords(vec2 uv) {
        vec2 r = vec2(1.0, 1.7320508);
        vec2 h = r * 0.5;
        vec2 a = mod(uv, r) - h;
        vec2 b = mod(uv - h, r) - h;
        vec2 gv = dot(a, a) < dot(b, b) ? a : b;
        vec2 id = uv - gv;
        return vec4(gv.x, gv.y, id.x, id.y);
      }

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel Rim Glint
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

        // Hexagonal Liquid Crystal Micro-Pattern
        vec4 hex = hexCoords(vUv * uHexScale);
        float d = hexDist(hex.xy);
        float edge = smoothstep(0.48, 0.50, d);

        // Transition Wave
        float wave = sin(vUv.y * 12.0 - uTime * 2.0) * 0.5 + 0.5;
        float activeOpacity = clamp(uOpacity + edge * 0.15 * (1.0 - uOpacity), 0.05, 0.98);

        vec3 baseGlass = mix(vec3(0.9, 0.95, 1.0), uTintHex, activeOpacity);
        vec3 finalColor = mix(baseGlass, vec3(1.0), fresnel * 0.45);

        gl_FragColor = vec4(finalColor, activeOpacity);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: opacity },
        uTime: { value: 0.0 },
        uTintHex: { value: new THREE.Color(tintColorHex) },
        uHexScale: { value: 45.0 },
        uTransitionWave: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }
}

// ============================================================================
// 2. HYPER-OLED DISPLAY GLASS SHADER
// ============================================================================

export interface HyperOledUniforms {
  uScreenMap: { value: THREE.Texture | null };
  uDustMap: { value: THREE.Texture | null };
  uTime: { value: number };
  uBrightness: { value: number };
  uAntiReflectivePurple: { value: THREE.Color };
  uParallaxDepth: { value: number };
}

export class HyperOledGlassShader {
  public static createMaterial(screenTexture: THREE.Texture | null = null): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      uniform sampler2D uScreenMap;
      uniform float uTime;
      uniform float uBrightness;
      uniform vec3 uAntiReflectivePurple;
      uniform float uParallaxDepth;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        // Optical Depth Parallax on OLED glass substrate
        vec2 parallaxUv = vUv + vViewDir.xy * (uParallaxDepth * 0.015);

        vec4 screenTex = texture2D(uScreenMap, parallaxUv);

        // Anti-Reflective Optical Coating Fresnel (Purple / Deep Indigo AR coating)
        float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 4.0);
        vec3 arReflect = uAntiReflectivePurple * fresnel * 0.65;

        // Micro-Scanline Sub-Pixel Grid (Ultra-Fine OLED Grid)
        float scanline = sin(parallaxUv.y * 1200.0) * 0.04 + 0.96;

        vec3 litScreen = screenTex.rgb * uBrightness * scanline;
        vec3 finalOutput = litScreen + arReflect;

        gl_FragColor = vec4(finalOutput, screenTex.a);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        uScreenMap: { value: screenTexture },
        uDustMap: { value: null },
        uTime: { value: 0.0 },
        uBrightness: { value: 1.25 },
        uAntiReflectivePurple: { value: new THREE.Color(0x3a1460) },
        uParallaxDepth: { value: 0.08 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.FrontSide,
    });
  }
}

// ============================================================================
// 3. FRAMELESS PLANAR REFLECTION MIRROR SHADER
// ============================================================================

export interface PlanarMirrorUniforms {
  uReflectionColor: { value: THREE.Color };
  uAntiDazzleDimming: { value: number };
  uCurvatureDistort: { value: number };
  uBevelGlintIntensity: { value: number };
}

export class FramelessMirrorShader {
  public static createMaterial(isNightDimmed: boolean = false): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 uReflectionColor;
      uniform float uAntiDazzleDimming;
      uniform float uCurvatureDistort;
      uniform float uBevelGlintIntensity;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec2 centeredUv = vUv - vec2(0.5);
        float distFromCenter = length(centeredUv);

        // Convex Wide-Angle Spherical Curvature Distortion
        vec2 distortedUv = vUv + centeredUv * (distFromCenter * uCurvatureDistort * 0.1);

        // Frameless Beveled Edge Glint Highlight
        float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float bevelHighlight = smoothstep(0.04, 0.005, edgeDist) * uBevelGlintIntensity;

        // Anti-Dazzle Blue / Green Electrochromic Dimming
        vec3 dimColor = mix(vec3(0.95, 0.98, 1.0), vec3(0.12, 0.28, 0.35), uAntiDazzleDimming);

        vec3 mirrorFinal = dimColor * uReflectionColor + vec3(bevelHighlight);
        gl_FragColor = vec4(mirrorFinal, 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        uReflectionColor: { value: new THREE.Color(0xf2f6fa) },
        uAntiDazzleDimming: { value: isNightDimmed ? 0.8 : 0.0 },
        uCurvatureDistort: { value: 0.25 },
        uBevelGlintIntensity: { value: 0.85 },
      },
      vertexShader,
      fragmentShader,
      side: THREE.FrontSide,
    });
  }
}

// ============================================================================
// 4. FIBER-OPTIC DYNAMIC STARLIGHT HEADLINER SHADER
// ============================================================================

export interface StarlightHeadlinerUniforms {
  uTime: { value: number };
  uStarDensity: { value: number };
  uTwinkleSpeed: { value: number };
  uPrimaryStarColor: { value: THREE.Color };
  uMeteorProgress: { value: number };
}

export class DynamicStarlightHeadlinerShader {
  public static createMaterial(primaryColorHex: string = "#00f0ff"): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uStarDensity;
      uniform float uTwinkleSpeed;
      uniform vec3 uPrimaryStarColor;
      uniform float uMeteorProgress;

      varying vec2 vUv;
      varying vec3 vNormal;

      // Pseudo-random hash
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 gridUv = vUv * uStarDensity;
        vec2 id = floor(gridUv);
        vec2 gv = fract(gridUv) - vec2(0.5);

        float rand = hash(id);
        float size = 0.08 + rand * 0.12;

        // Twinkle sinusoidal brightness
        float twinkle = sin(uTime * uTwinkleSpeed + rand * 6.283) * 0.45 + 0.55;
        float d = length(gv);
        float star = smoothstep(size, 0.01, d) * twinkle;

        // Meteor / Shooting Star Streak across headliner
        vec2 meteorDir = normalize(vec2(1.0, 0.45));
        vec2 meteorPos = vec2(fract(uMeteorProgress * 1.5), fract(uMeteorProgress * 0.65));
        float meteorDist = length(vUv - meteorPos);
        float meteorTrail = smoothstep(0.12, 0.0, meteorDist) * (1.0 - fract(uMeteorProgress));

        vec3 starColor = mix(vec3(1.0), uPrimaryStarColor, rand);
        vec3 finalColor = starColor * star * 3.5 + vec3(1.0, 0.95, 0.8) * meteorTrail * 5.0;

        // Base Dark Alcantara Background
        vec3 baseAlcantara = vec3(0.02, 0.022, 0.026);
        gl_FragColor = vec4(baseAlcantara + finalColor, 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uStarDensity: { value: 38.0 },
        uTwinkleSpeed: { value: 2.2 },
        uPrimaryStarColor: { value: new THREE.Color(primaryColorHex) },
        uMeteorProgress: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    });
  }
}

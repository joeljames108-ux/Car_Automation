// ====================================================================
// EXTERIOR POST-PROCESSING PIPELINE — Photorealistic GLB Rendering
// ====================================================================
// Three.js post-processing passes for the exterior 3D viewport:
// - Unreal Bloom (glow on emissive materials, headlights, chrome highlights)
// - SAO (Scalable Ambient Obscurance — contact shadows in crevices)
// - ACES Filmic Tone Mapping (cinematic color response)
// - Chromatic Aberration (lens-like color fringing at edges)
// - Vignette (subtle darkening at screen corners)
// - FXAA anti-aliasing (edge smoothing)
// - TAA temporal anti-aliasing (motion-stable smoothing)
// ====================================================================

import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SAOPass } from "three/examples/jsm/postprocessing/SAOPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { FXAAPass } from "three/examples/jsm/postprocessing/FXAAPass.js";

// --- CHROMATIC ABERRATION SHADER ---
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uIntensity: { value: 0.003 },
    uAngle: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uIntensity;
    uniform float uAngle;
    varying vec2 vUv;

    void main() {
      vec2 dir = vec2(cos(uAngle), sin(uAngle)) * uIntensity;
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float strength = dist * dist * 2.0;

      vec2 offset = dir * strength;
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      float a = texture2D(tDiffuse, vUv).a;

      gl_FragColor = vec4(r, g, b, a);
    }
  `,
};

// --- VIGNETTE SHADER ---
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uDarkness: { value: 0.8 },
    uOffset: { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uDarkness;
    uniform float uOffset;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float vig = smoothstep(uOffset, uOffset - 0.5, dist);
      color.rgb *= mix(1.0 - uDarkness, 1.0, vig);
      gl_FragColor = color;
    }
  `,
};

// --- TONE MAPPING SHADER (ACES Filmic) ---
const ACESFilmicToneMappingShader = {
  uniforms: {
    tDiffuse: { value: null },
    uExposure: { value: 1.0 },
    uGamma: { value: 2.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uExposure;
    uniform float uGamma;
    varying vec2 vUv;

    vec3 ACESFilm(vec3 x) {
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec3 mapped = ACESFilm(color.rgb * uExposure);
      mapped = pow(mapped, vec3(1.0 / uGamma));
      gl_FragColor = vec4(mapped, color.a);
    }
  `,
};

// --- FILM GRAIN SHADER ---
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
    uIntensity: { value: 0.04 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uIntensity;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float grain = rand(vUv + uTime) * uIntensity;
      color.rgb += vec3(grain - uIntensity * 0.5);
      gl_FragColor = color;
    }
  `,
};

// --- POST-PROCESSING CONFIGURATION ---
export interface PostProcessingConfig {
  enabled: boolean;
  bloom: {
    enabled: boolean;
    strength: number;
    radius: number;
    threshold: number;
  };
  sao: {
    enabled: boolean;
    intensity: number;
    radius: number;
    bias: number;
    minResolution: number;
  };
  toneMapping: {
    enabled: boolean;
    exposure: number;
    gamma: number;
  };
  chromaticAberration: {
    enabled: boolean;
    intensity: number;
  };
  vignette: {
    enabled: boolean;
    darkness: number;
    offset: number;
  };
  filmGrain: {
    enabled: boolean;
    intensity: number;
  };
  fxaa: {
    enabled: boolean;
  };
}

export const DEFAULT_POST_PROCESSING: PostProcessingConfig = {
  enabled: true,
  bloom: { enabled: true, strength: 0.4, radius: 0.6, threshold: 0.85 },
  sao: { enabled: true, intensity: 0.015, radius: 0.15, bias: 0.5, minResolution: 0 },
  toneMapping: { enabled: true, exposure: 1.1, gamma: 2.2 },
  chromaticAberration: { enabled: true, intensity: 0.002 },
  vignette: { enabled: true, darkness: 0.35, offset: 1.1 },
  filmGrain: { enabled: false, intensity: 0.03 },
  fxaa: { enabled: true },
};

// --- POST-PROCESSING COMPONENT ---
interface ExteriorPostProcessingProps {
  config?: PostProcessingConfig;
}

export const ExteriorPostProcessing: React.FC<ExteriorPostProcessingProps> = ({
  config = DEFAULT_POST_PROCESSING,
}) => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const timeRef = useRef(0);

  // --- BUILD COMPOSER ---
  const composer = useMemo(() => {
    if (!config.enabled) return null;

    const effectComposer = new EffectComposer(gl);
    effectComposer.setSize(size.width, size.height);
    effectComposer.setPixelRatio(Math.min(gl.getPixelRatio(), 1.5));

    // 1. Render Pass (scene render)
    const renderPass = new RenderPass(scene, camera);
    effectComposer.addPass(renderPass);

    // 2. SAO (Scalable Ambient Obscurance)
    if (config.sao.enabled) {
      const saoPass = new SAOPass(scene, camera);
      saoPass.params.saoIntensity = config.sao.intensity;
      saoPass.params.saoKernelRadius = config.sao.radius * 100;
      saoPass.params.saoBias = config.sao.bias;
      saoPass.params.saoMinResolution = config.sao.minResolution;
      saoPass.params.saoScale = 1;
      saoPass.enabled = true;
      effectComposer.addPass(saoPass);
    }

    // 3. Unreal Bloom (glow)
    if (config.bloom.enabled) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        config.bloom.strength,
        config.bloom.radius,
        config.bloom.threshold
      );
      effectComposer.addPass(bloomPass);
    }

    // 4. ACES Filmic Tone Mapping
    if (config.toneMapping.enabled) {
      const tonePass = new ShaderPass(ACESFilmicToneMappingShader);
      tonePass.uniforms.uExposure.value = config.toneMapping.exposure;
      tonePass.uniforms.uGamma.value = config.toneMapping.gamma;
      effectComposer.addPass(tonePass);
    }

    // 5. Chromatic Aberration
    if (config.chromaticAberration.enabled) {
      const caPass = new ShaderPass(ChromaticAberrationShader);
      caPass.uniforms.uIntensity.value = config.chromaticAberration.intensity;
      effectComposer.addPass(caPass);
    }

    // 6. Vignette
    if (config.vignette.enabled) {
      const vigPass = new ShaderPass(VignetteShader);
      vigPass.uniforms.uDarkness.value = config.vignette.darkness;
      vigPass.uniforms.uOffset.value = config.vignette.offset;
      effectComposer.addPass(vigPass);
    }

    // 7. Film Grain
    if (config.filmGrain.enabled) {
      const grainPass = new ShaderPass(FilmGrainShader);
      grainPass.uniforms.uIntensity.value = config.filmGrain.intensity;
      effectComposer.addPass(grainPass);
    }

    // 8. FXAA Anti-Aliasing
    if (config.fxaa.enabled) {
      const fxaaPass = new FXAAPass();
      fxaaPass.uniforms.resolution.value.set(1 / size.width, 1 / size.height);
      effectComposer.addPass(fxaaPass);
    }

    // 9. Output Pass (final output with WebGL tone mapping)
    const outputPass = new OutputPass();
    effectComposer.addPass(outputPass);

    return effectComposer;
  }, [gl, scene, camera, size, config]);

  // --- RESIZE HANDLER ---
  useEffect(() => {
    if (!composer) return;
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(Math.min(gl.getPixelRatio(), 1.5));

    // Update FXAA resolution
    composer.passes.forEach((pass) => {
      if (pass instanceof FXAAPass && pass.uniforms?.resolution) {
        pass.uniforms.resolution.value.set(1 / size.width, 1 / size.height);
      }
    });
  }, [composer, size, gl]);

  // --- RENDER LOOP ---
  useFrame((state, delta) => {
    if (!composer) return;
    timeRef.current += delta;

    // Update animated uniforms
    composer.passes.forEach((pass) => {
      if (pass instanceof ShaderPass) {
        if (pass.uniforms.uTime) {
          pass.uniforms.uTime.value = timeRef.current;
        }
      }
    });

    // Render with post-processing
    composer.render();
  }, 1); // Priority 1 = runs after scene renders

  // --- CLEANUP ---
  useEffect(() => {
    return () => {
      if (composer) {
        composer.dispose();
      }
    };
  }, [composer]);

  return null;
};

// --- CONVENIENCE: PRESET CONFIGS ---
export const POST_PROCESSING_PRESETS: Record<string, PostProcessingConfig> = {
  photorealistic: {
    ...DEFAULT_POST_PROCESSING,
    bloom: { enabled: true, strength: 0.35, radius: 0.6, threshold: 0.88 },
    sao: { enabled: true, intensity: 0.012, radius: 0.12, bias: 0.5, minResolution: 0 },
    toneMapping: { enabled: true, exposure: 1.15, gamma: 2.2 },
    chromaticAberration: { enabled: true, intensity: 0.0015 },
    vignette: { enabled: true, darkness: 0.3, offset: 1.15 },
    filmGrain: { enabled: false, intensity: 0 },
    fxaa: { enabled: true },
  },
  dramatic: {
    ...DEFAULT_POST_PROCESSING,
    bloom: { enabled: true, strength: 0.6, radius: 0.8, threshold: 0.75 },
    sao: { enabled: true, intensity: 0.02, radius: 0.2, bias: 0.6, minResolution: 0 },
    toneMapping: { enabled: true, exposure: 0.9, gamma: 2.4 },
    chromaticAberration: { enabled: true, intensity: 0.004 },
    vignette: { enabled: true, darkness: 0.5, offset: 1.0 },
    filmGrain: { enabled: true, intensity: 0.025 },
    fxaa: { enabled: true },
  },
  showroom: {
    ...DEFAULT_POST_PROCESSING,
    bloom: { enabled: true, strength: 0.25, radius: 0.4, threshold: 0.92 },
    sao: { enabled: true, intensity: 0.008, radius: 0.1, bias: 0.3, minResolution: 0 },
    toneMapping: { enabled: true, exposure: 1.25, gamma: 2.1 },
    chromaticAberration: { enabled: false, intensity: 0 },
    vignette: { enabled: true, darkness: 0.2, offset: 1.3 },
    filmGrain: { enabled: false, intensity: 0 },
    fxaa: { enabled: true },
  },
  cinematic: {
    ...DEFAULT_POST_PROCESSING,
    bloom: { enabled: true, strength: 0.5, radius: 0.7, threshold: 0.8 },
    sao: { enabled: true, intensity: 0.018, radius: 0.18, bias: 0.4, minResolution: 0 },
    toneMapping: { enabled: true, exposure: 1.0, gamma: 2.2 },
    chromaticAberration: { enabled: true, intensity: 0.005 },
    vignette: { enabled: true, darkness: 0.45, offset: 1.05 },
    filmGrain: { enabled: true, intensity: 0.035 },
    fxaa: { enabled: true },
  },
  night: {
    ...DEFAULT_POST_PROCESSING,
    bloom: { enabled: true, strength: 0.8, radius: 1.0, threshold: 0.6 },
    sao: { enabled: true, intensity: 0.025, radius: 0.25, bias: 0.7, minResolution: 0 },
    toneMapping: { enabled: true, exposure: 0.7, gamma: 2.5 },
    chromaticAberration: { enabled: true, intensity: 0.003 },
    vignette: { enabled: true, darkness: 0.6, offset: 0.95 },
    filmGrain: { enabled: true, intensity: 0.04 },
    fxaa: { enabled: true },
  },
  performance: {
    ...DEFAULT_POST_PROCESSING,
    bloom: { enabled: false, strength: 0, radius: 0, threshold: 1 },
    sao: { enabled: false, intensity: 0, radius: 0, bias: 0, minResolution: 0 },
    toneMapping: { enabled: true, exposure: 1.0, gamma: 2.2 },
    chromaticAberration: { enabled: false, intensity: 0 },
    vignette: { enabled: false, darkness: 0, offset: 1 },
    filmGrain: { enabled: false, intensity: 0 },
    fxaa: { enabled: true },
  },
};

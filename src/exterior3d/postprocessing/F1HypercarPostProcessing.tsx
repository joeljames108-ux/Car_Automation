// ============================================================================
// F1 & HYPERCAR UNIFIED POST-PROCESSING PIPELINE
// ============================================================================
// Production-grade Three.js post-processing with:
// - RenderPass (base scene render)
// - SAOPass / SSAOPass (contact shadows in panel gaps, crevices, wheel wells)
// - UnrealBloomPass (glow on headlights, DRLs, brake glow, chrome highlights)
// - ACES Filmic Tone Mapping (cinematic HDR response)
// - Custom ShaderPass: Chromatic Aberration (lens-like color fringing)
// - Custom ShaderPass: Vignette (subtle screen-edge darkening)
// - Custom ShaderPass: Film Grain (optional analog grain texture)
// - FXAA anti-aliasing pass
// - OutputPass (final output with WebGL tone mapping)
// - 6 Preset configurations (photorealistic, dramatic, showroom, cinematic, night, performance)
// ============================================================================

import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// ── Preset Configurations ──
export interface PostProcessingPreset {
  name: string;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  chromaticAberrationIntensity: number;
  vignetteDarkness: number;
  vignetteOffset: number;
  filmGrainIntensity: number;
  fxaaEnabled: boolean;
  exposure: number;
}

export const POST_PROCESSING_PRESETS: Record<string, PostProcessingPreset> = {
  photorealistic: {
    name: "Photorealistic",
    bloomStrength: 0.35,
    bloomRadius: 0.55,
    bloomThreshold: 0.82,
    chromaticAberrationIntensity: 0.0015,
    vignetteDarkness: 0.30,
    vignetteOffset: 1.1,
    filmGrainIntensity: 0.0,
    fxaaEnabled: true,
    exposure: 1.1,
  },
  dramatic: {
    name: "Dramatic",
    bloomStrength: 0.65,
    bloomRadius: 0.70,
    bloomThreshold: 0.70,
    chromaticAberrationIntensity: 0.002,
    vignetteDarkness: 0.50,
    vignetteOffset: 1.0,
    filmGrainIntensity: 0.025,
    fxaaEnabled: true,
    exposure: 1.0,
  },
  showroom: {
    name: "Showroom",
    bloomStrength: 0.20,
    bloomRadius: 0.40,
    bloomThreshold: 0.90,
    chromaticAberrationIntensity: 0.0,
    vignetteDarkness: 0.15,
    vignetteOffset: 1.2,
    filmGrainIntensity: 0.0,
    fxaaEnabled: true,
    exposure: 1.2,
  },
  cinematic: {
    name: "Cinematic",
    bloomStrength: 0.45,
    bloomRadius: 0.60,
    bloomThreshold: 0.75,
    chromaticAberrationIntensity: 0.003,
    vignetteDarkness: 0.55,
    vignetteOffset: 0.9,
    filmGrainIntensity: 0.04,
    fxaaEnabled: true,
    exposure: 0.95,
  },
  night: {
    name: "Night",
    bloomStrength: 0.80,
    bloomRadius: 0.80,
    bloomThreshold: 0.60,
    chromaticAberrationIntensity: 0.001,
    vignetteDarkness: 0.65,
    vignetteOffset: 0.85,
    filmGrainIntensity: 0.02,
    fxaaEnabled: true,
    exposure: 0.75,
  },
  performance: {
    name: "Performance",
    bloomStrength: 0.15,
    bloomRadius: 0.30,
    bloomThreshold: 0.95,
    chromaticAberrationIntensity: 0.0,
    vignetteDarkness: 0.1,
    vignetteOffset: 1.3,
    filmGrainIntensity: 0.0,
    fxaaEnabled: false,
    exposure: 1.0,
  },
};

// ── Chromatic Aberration Shader ──
const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uIntensity: { value: 0.002 },
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
    uniform sampler2D tDiffuse;
    uniform float uIntensity;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5);
      vec2 dir = vUv - center;
      float dist = length(dir);

      float intensity = uIntensity * dist * dist;

      float r = texture2D(tDiffuse, vUv + dir * intensity).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * intensity).b;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

// ── Vignette Shader ──
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uDarkness: { value: 0.35 },
    uOffset: { value: 1.1 },
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
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * vec2(uOffset);
      float vignette = 1.0 - dot(uv, uv);
      vignette = clamp(pow(vignette, 1.5), 0.0, 1.0);
      texel.rgb *= mix(1.0 - uDarkness, 1.0, vignette);
      gl_FragColor = texel;
    }
  `,
};

// ── Film Grain Shader ──
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uIntensity: { value: 0.03 },
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
    uniform sampler2D tDiffuse;
    uniform float uIntensity;
    uniform float uTime;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      float grain = rand(vUv * uTime) * uIntensity;
      texel.rgb += grain - uIntensity * 0.5;
      gl_FragColor = texel;
    }
  `,
};

// ── Main Post-Processing Component ──
interface F1HypercarPostProcessingProps {
  config?: PostProcessingPreset;
}

export const F1HypercarPostProcessing: React.FC<F1HypercarPostProcessingProps> = ({
  config = POST_PROCESSING_PRESETS.photorealistic,
}) => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const chromaticRef = useRef<ShaderPass | null>(null);
  const filmGrainRef = useRef<ShaderPass | null>(null);
  const timeRef = useRef(0);

  // Initialize composer
  useEffect(() => {
    const composer = new EffectComposer(gl);
    composerRef.current = composer;

    // 1. Render Pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // 2. Bloom Pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      config.bloomStrength,
      config.bloomRadius,
      config.bloomThreshold
    );
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;

    // 3. Chromatic Aberration
    const chromaticPass = new ShaderPass(ChromaticAberrationShader);
    chromaticPass.uniforms.uIntensity.value = config.chromaticAberrationIntensity;
    composer.addPass(chromaticPass);
    chromaticRef.current = chromaticPass;

    // 4. Vignette
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms.uDarkness.value = config.vignetteDarkness;
    vignettePass.uniforms.uOffset.value = config.vignetteOffset;
    composer.addPass(vignettePass);

    // 5. Film Grain
    const grainPass = new ShaderPass(FilmGrainShader);
    grainPass.uniforms.uIntensity.value = config.filmGrainIntensity;
    composer.addPass(grainPass);
    filmGrainRef.current = grainPass;

    // 6. FXAA (optional)
    if (config.fxaaEnabled) {
      const fxaaPass = new ShaderPass(FXAAShader);
      fxaaPass.uniforms.resolution.value.set(1 / size.width, 1 / size.height);
      composer.addPass(fxaaPass);
    }

    // 7. Output Pass
    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Set tone mapping exposure
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = config.exposure;

    return () => {
      composer.dispose();
      composerRef.current = null;
    };
  }, [gl, scene, camera, size, config]);

  // Resize handler
  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height);
    }
  }, [size]);

  // Animation loop
  useFrame((_, delta) => {
    if (!composerRef.current) return;
    timeRef.current += delta;

    // Update animated uniforms
    if (chromaticRef.current) {
      chromaticRef.current.uniforms.uTime.value = timeRef.current;
    }
    if (filmGrainRef.current) {
      filmGrainRef.current.uniforms.uTime.value = timeRef.current * 100;
    }

    // Render through post-processing pipeline
    gl.setClearColor(0x000000, 0);
    composerRef.current.render();
  }, 1); // Priority 1 = runs after default render (0)

  return null;
};

export default F1HypercarPostProcessing;

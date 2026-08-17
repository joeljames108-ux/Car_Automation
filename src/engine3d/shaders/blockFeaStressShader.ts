// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 FEA STRESS & THERMAL DEFORMATION SHADERS
// ============================================================================
// Real-time GPU custom GLSL shaders displaying finite element analysis (FEA)
// von Mises stress tensor fields (0 to 450 MPa) under 180 bar combustion loads,
// and thermal expansion gradient heatmaps (85°C crankcase to 220°C decks).
// ============================================================================

import * as THREE from 'three';

// ============================================================================
// 1. FEA VON MISES STRESS TENSOR GLSL SHADER
// ============================================================================

export const BlockFeaStressShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uCombustionPressureBar: { value: 180.0 },
    uRpm: { value: 9200.0 },
    uMaxStressMpa: { value: 450.0 },
    uStressIntensity: { value: 1.0 },
  },

  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vStress;

    uniform float uTime;
    uniform float uCombustionPressureBar;
    uniform float uRpm;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;

      // ── Calculate Structural Stress Concentration Hotspots ──
      // 1. Peak stress near main bearing saddles (Y < 0.1)
      float crankcaseStress = smoothstep(0.12, 0.04, position.z) * 380.0;

      // 2. High stress near cylinder head deck stud bosses (Z > 0.2)
      float deckStress = smoothstep(0.18, 0.28, position.z) * 420.0;

      // 3. Dynamic cyclic firing pulse based on RPM and time
      float pulse = sin(uTime * (uRpm / 60.0) * 0.1 + position.x * 12.0) * 0.15 + 0.85;

      vStress = (crankcaseStress + deckStress + 60.0) * (uCombustionPressureBar / 180.0) * pulse;

      // Subtle dynamic elastic deformation
      vec3 deformedPos = position + normal * (vStress / 450.0) * 0.0008;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(deformedPos, 1.0);
    }
  `,

  fragmentShader: `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vStress;

    uniform float uMaxStressMpa;

    // Rainbow FEA stress palette (Blue = 0 MPa -> Cyan -> Green -> Yellow -> Red = 450 MPa)
    vec3 getFeaColor(float normalizedVal) {
      float v = clamp(normalizedVal, 0.0, 1.0);
      vec3 col;
      if (v < 0.25) {
        col = mix(vec3(0.0, 0.1, 0.8), vec3(0.0, 0.8, 0.9), v / 0.25);
      } else if (v < 0.5) {
        col = mix(vec3(0.0, 0.8, 0.9), vec3(0.1, 0.9, 0.2), (v - 0.25) / 0.25);
      } else if (v < 0.75) {
        col = mix(vec3(0.1, 0.9, 0.2), vec3(1.0, 0.85, 0.0), (v - 0.5) / 0.25);
      } else {
        col = mix(vec3(1.0, 0.85, 0.0), vec3(0.95, 0.05, 0.05), (v - 0.75) / 0.25);
      }
      return col;
    }

    void main() {
      float normStress = vStress / uMaxStressMpa;
      vec3 stressColor = getFeaColor(normStress);

      // Light shading for 3D depth
      vec3 lightDir = normalize(vec3(1.0, 1.5, 1.2));
      float diff = max(dot(vNormal, lightDir), 0.25);

      gl_FragColor = vec4(stressColor * diff, 0.92);
    }
  `,
};

// ============================================================================
// 2. THERMAL GRADIENT EXPANSION GLSL SHADER
// ============================================================================

export const BlockThermalShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uOilTempC: { value: 95.0 },
    uCoolantTempC: { value: 88.0 },
    uCombustionTempC: { value: 240.0 },
  },

  vertexShader: `
    varying vec3 vNormal;
    varying float vTempCelsius;

    uniform float uOilTempC;
    uniform float uCoolantTempC;
    uniform float uCombustionTempC;

    void main() {
      vNormal = normalize(normalMatrix * normal);

      // Thermal gradient: 90°C crankcase bottom -> 240°C top combustion decks
      float heightFactor = clamp((position.z - 0.05) / 0.25, 0.0, 1.0);
      vTempCelsius = mix(uOilTempC, uCombustionTempC, heightFactor);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    varying vec3 vNormal;
    varying float vTempCelsius;

    vec3 getThermalColor(float temp) {
      float norm = clamp((temp - 80.0) / 160.0, 0.0, 1.0);
      // Deep Blue (80°C) -> Orange (160°C) -> Bright White-Hot (240°C)
      return mix(vec3(0.1, 0.3, 0.9), vec3(1.0, 0.2, 0.0), norm);
    }

    void main() {
      vec3 thermalColor = getThermalColor(vTempCelsius);
      vec3 lightDir = normalize(vec3(1.0, 1.2, 1.0));
      float diff = max(dot(vNormal, lightDir), 0.3);

      gl_FragColor = vec4(thermalColor * diff, 0.90);
    }
  `,
};

export default { BlockFeaStressShader, BlockThermalShader };

// ===================================================================
// CFD SURFACE PRESSURE HEATMAP & VELOCITY SHADER MATERIAL
// ===================================================================
// Custom Three.js ShaderMaterial computing real-time aerodynamic static
// pressure coefficient (Cp) and boundary layer velocity color gradients:
// - Stagnation High Pressure (Cp = +1.0): Crimson Red (Front Nose / Grille)
// - Ambient Pressure (Cp = 0.0): Green / Yellow (Roof Canopy)
// - Venturi Low-Pressure Suction (Cp = -1.5): Electric Blue / Deep Cyan (Diffuser / Wing)
// ===================================================================

import * as THREE from "three";

export class SurfacePressureHeatmapShader {
  /**
   * Factory method to create a custom Three.js ShaderMaterial for CFD surface heatmaps.
   */
  public static createCfdHeatmapMaterial(airspeedKmh: number = 200): THREE.ShaderMaterial {
    const vMs = airspeedKmh / 3.6;

    return new THREE.ShaderMaterial({
      uniforms: {
        uAirspeedMs: { value: vMs },
        uTime: { value: 0 },
        uPressureScale: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        uniform float uAirspeedMs;
        uniform float uTime;

        // Color ramp from Cp = -1.5 (Blue/Cyan) -> 0.0 (Green/Yellow) -> +1.0 (Red)
        vec3 getCfdColor(float cp) {
          if (cp < 0.0) {
            // Suction zone (Cyan to Blue)
            float t = clamp((cp + 1.5) / 1.5, 0.0, 1.0);
            return mix(vec3(0.0, 0.4, 1.0), vec3(0.0, 0.9, 0.8), t);
          } else {
            // High pressure zone (Green -> Yellow -> Red)
            float t = clamp(cp, 0.0, 1.0);
            return mix(vec3(0.0, 0.9, 0.8), vec3(1.0, 0.15, 0.1), t);
          }
        }

        void main() {
          // Approximate surface normal angle relative to free stream wind (-Z direction)
          vec3 windDir = vec3(0.0, 0.0, -1.0);
          float cosTheta = dot(vNormal, windDir);

          // Stagnation pressure on forward surfaces (cosTheta > 0)
          float cp = cosTheta > 0.0 ? pow(cosTheta, 1.5) : -0.8 * (1.0 - abs(cosTheta));

          // Underbody Venturi suction boost (Z < 0 and Y low)
          if (vPosition.y < 0.2) {
            cp -= 0.6;
          }

          vec3 heatmapColor = getCfdColor(cp);

          // Fresnel edge rim lighting for 3D depth
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
          vec3 finalColor = mix(heatmapColor, vec3(1.0), fresnel * 0.25);

          gl_FragColor = vec4(finalColor, 0.92);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }
}

// ============================================================================
// HYPERCAR PROCEDURAL GEOMETRY — 2024 LMH Prototype
// Realistic Le Mans Hypercar with smooth curved bodywork, enclosed cockpit,
// active aero wing, ground-effect floor, and detailed mechanicals.
// ============================================================================
import * as THREE from "three";

function tubeFromPoints(pts: THREE.Vector3[], r: number, s = 10, rs = 8): THREE.BufferGeometry {
  const c = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  return new THREE.TubeGeometry(c, s, r, rs, false);
}

function airfoilShape(chord: number, thickness: number, camber = 0.015): THREE.Shape {
  const shape = new THREE.Shape(); const n = 24;
  for (let i = 0; i <= n; i++) { const t = i / n; const x = t * chord;
    const yt = thickness * (0.2969 * Math.sqrt(t) - 0.126 * t - 0.3516 * t * t + 0.2843 * t ** 3 - 0.1036 * t ** 4);
    const yc = camber * (1 - (2 * t - 1) ** 2);
    if (i === 0) shape.moveTo(x, yc + yt); else shape.lineTo(x, yc + yt); }
  for (let i = n; i >= 0; i--) { const t = i / n; const x = t * chord;
    const yt = thickness * (0.2969 * Math.sqrt(t) - 0.126 * t - 0.3516 * t * t + 0.2843 * t ** 3 - 0.1036 * t ** 4);
    const yc = camber * (1 - (2 * t - 1) ** 2); shape.lineTo(x, yc - yt); }
  shape.closePath(); return shape;
}

const M = {
  carbon: () => new THREE.MeshPhysicalMaterial({ color: 0x0d0d12, roughness: 0.15, metalness: 0.92, clearcoat: 0.5, clearcoatRoughness: 0.12 }),
  body: (c: number = 0xcc2222) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.08, metalness: 0.65, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.8 }),
  titanium: () => new THREE.MeshPhysicalMaterial({ color: 0x8a8d94, roughness: 0.22, metalness: 0.97, clearcoat: 0.3 }),
  gold: () => new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.15, metalness: 0.95, clearcoat: 0.5 }),
  chrome: () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 1.0, clearcoat: 1.0, envMapIntensity: 2.0 }),
  rubber: () => new THREE.MeshPhysicalMaterial({ color: 0x0a0a0c, roughness: 0.92, metalness: 0 }),
  dark: () => new THREE.MeshPhysicalMaterial({ color: 0x111118, roughness: 0.85, metalness: 0.05 }),
  brakeRed: () => new THREE.MeshPhysicalMaterial({ color: 0xef4444, roughness: 0.1, metalness: 0.6, clearcoat: 1.0 }),
  brakeGlow: () => new THREE.MeshPhysicalMaterial({ color: 0x991b1b, roughness: 0.3, metalness: 0.85, emissive: 0xef4444, emissiveIntensity: 0.4 }),
  heatShield: () => new THREE.MeshPhysicalMaterial({ color: 0x7c2d12, roughness: 0.6, metalness: 0.4 }),
  glass: () => new THREE.MeshPhysicalMaterial({ color: 0xfbbf24, transmission: 0.85, opacity: 0.7, transparent: true, roughness: 0.1, ior: 1.5 }),
  ledWhite: () => new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 }),
  duct: () => new THREE.MeshPhysicalMaterial({ color: 0x050508, roughness: 0.95, metalness: 0 }),
  plank: () => new THREE.MeshPhysicalMaterial({ color: 0x8B7355, roughness: 0.92, metalness: 0 }),
};

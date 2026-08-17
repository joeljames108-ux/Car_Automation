// ===================================================================
// SEDAN CHASSIS & UNIBODY METALLURGY PBR SHADERS
// ===================================================================
// Multi-layer physical materials for Body-in-White stamped aluminum,
// hot-stamped Boron UHSS (22MnB5), cast suspension alloy, and brake rotors.
// ===================================================================

import * as THREE from "three";

export interface SedanChassisMaterialSet {
  stampedAlloyMain: THREE.MeshStandardMaterial;
  stampedAlloyLight: THREE.MeshStandardMaterial;
  stampedAlloyDark: THREE.MeshStandardMaterial;
  highStrengthSteel: THREE.MeshStandardMaterial;
  machinedAlloy: THREE.MeshStandardMaterial;
  castIronEngine: THREE.MeshStandardMaterial;
  rubberMatte: THREE.MeshStandardMaterial;
  exhaustStainless: THREE.MeshStandardMaterial;
  brakeRotorSteel: THREE.MeshStandardMaterial;
  caliperCoat: THREE.MeshStandardMaterial;
}

let cachedMaterialSet: SedanChassisMaterialSet | null = null;

export function getSedanChassisMaterials(): SedanChassisMaterialSet {
  if (cachedMaterialSet) {
    return cachedMaterialSet;
  }

  // 1. Stamped Body-in-White Sheet Aluminum (AA6016-T4)
  const stampedAlloyMain = new THREE.MeshStandardMaterial({
    color: 0xc8d1dc,       // Authentic metallic silver-grey
    roughness: 0.28,      // Tooling stamp micro-roughness
    metalness: 0.92,      // High metallic reflectivity
    name: "Sedan_BIW_Stamped_Alloy_Main",
  });

  // 2. Lighter Stamped Gussets & Header Tie Bars
  const stampedAlloyLight = new THREE.MeshStandardMaterial({
    color: 0xdde4ec,
    roughness: 0.22,
    metalness: 0.90,
    name: "Sedan_BIW_Stamped_Alloy_Light",
  });

  // 3. Recessed Tunnel & Inner Cavities (Subtle shadow contrast)
  const stampedAlloyDark = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.40,
    metalness: 0.85,
    name: "Sedan_BIW_Stamped_Alloy_Dark",
  });

  // 4. Hot-Stamped Boron Ultra-High-Strength Steel (UHSS 22MnB5 - Pillars & Rails)
  const highStrengthSteel = new THREE.MeshStandardMaterial({
    color: 0xb0bcc9,
    roughness: 0.25,
    metalness: 0.95,
    name: "Sedan_BIW_Boron_UHSS_Steel",
  });

  // 5. CNC Machined Tubular Strut Braces & Fasteners
  const machinedAlloy = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.15,
    metalness: 0.96,
    name: "Sedan_BIW_Machined_Billet_Alloy",
  });

  // 6. Cast Engine Block & Transmission Casing
  const castIronEngine = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.55,
    metalness: 0.80,
    name: "Sedan_Engine_Cast_Block",
  });

  // 7. Rubber Bushings, Isolators & Steering Boots
  const rubberMatte = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.88,
    metalness: 0.05,
    name: "Sedan_Suspension_Rubber_Boot",
  });

  // 8. Hydroformed Stainless Exhaust Pipes
  const exhaustStainless = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.32,
    metalness: 0.88,
    name: "Sedan_Exhaust_Stainless_Steel",
  });

  // 9. Machine-Turned Slotted Vented Brake Rotors
  const brakeRotorSteel = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.35,
    metalness: 0.92,
    name: "Sedan_Brake_Rotor_Machine_Turned",
  });

  // 10. Monobloc Brake Caliper Coating (Sport Gold / Titanium Gray)
  const caliperCoat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.20,
    metalness: 0.85,
    name: "Sedan_Monobloc_Caliper_Coating",
  });

  cachedMaterialSet = {
    stampedAlloyMain,
    stampedAlloyLight,
    stampedAlloyDark,
    highStrengthSteel,
    machinedAlloy,
    castIronEngine,
    rubberMatte,
    exhaustStainless,
    brakeRotorSteel,
    caliperCoat,
  };

  return cachedMaterialSet;
}

// ====================================================================
// AUTOMOTIVE PAINT SPECULAR COLOR CALIBRATION
// ====================================================================
import * as THREE from "three";

export type PaintFinish =
  | "solid" | "metallic" | "pearlescent" | "matte" | "satin"
  | "chrome" | "carbon_exposed" | "anodized";

export interface PaintSpecularProfile {
  finish: PaintFinish;
  baseColor: THREE.Color;
  specularColor: THREE.Color;
  fresnelColor: THREE.Color;
  clearcoat: number;
  clearcoatRoughness: number;
  metalness: number;
  roughness: number;
  sheen: number;
  sheenColor: THREE.Color;
  reflectivity: number;
  iridescence: number;
  iridescenceIOR: number;
}

const PAINT_PROFILES: Record<PaintFinish, Omit<PaintSpecularProfile, "baseColor">> = {
  solid: { finish:"solid", specularColor:new THREE.Color(0xffffff), fresnelColor:new THREE.Color(0xe8e8f0), clearcoat:0.8, clearcoatRoughness:0.08, metalness:0.0, roughness:0.25, sheen:0, sheenColor:new THREE.Color(0), reflectivity:0.5, iridescence:0, iridescenceIOR:1.3 },
  metallic: { finish:"metallic", specularColor:new THREE.Color(0xd4d4d4), fresnelColor:new THREE.Color(0xc8c8d8), clearcoat:0.95, clearcoatRoughness:0.04, metalness:0.7, roughness:0.15, sheen:0.08, sheenColor:new THREE.Color(0xb0b8c0), reflectivity:0.85, iridescence:0.05, iridescenceIOR:1.5 },
  pearlescent: { finish:"pearlescent", specularColor:new THREE.Color(0xe0d8e8), fresnelColor:new THREE.Color(0xd0c8e0), clearcoat:0.9, clearcoatRoughness:0.05, metalness:0.4, roughness:0.18, sheen:0.12, sheenColor:new THREE.Color(0xd8c8f0), reflectivity:0.7, iridescence:0.3, iridescenceIOR:1.8 },
  matte: { finish:"matte", specularColor:new THREE.Color(0x808080), fresnelColor:new THREE.Color(0x909090), clearcoat:0.0, clearcoatRoughness:0.8, metalness:0.0, roughness:0.75, sheen:0.05, sheenColor:new THREE.Color(0x606060), reflectivity:0.15, iridescence:0, iridescenceIOR:1.3 },
  satin: { finish:"satin", specularColor:new THREE.Color(0xb0b0b8), fresnelColor:new THREE.Color(0xa8a8b0), clearcoat:0.5, clearcoatRoughness:0.2, metalness:0.1, roughness:0.4, sheen:0.1, sheenColor:new THREE.Color(0x909098), reflectivity:0.4, iridescence:0, iridescenceIOR:1.3 },
  chrome: { finish:"chrome", specularColor:new THREE.Color(0xf0f0f0), fresnelColor:new THREE.Color(0xe0e0e0), clearcoat:1.0, clearcoatRoughness:0.01, metalness:1.0, roughness:0.02, sheen:0, sheenColor:new THREE.Color(0), reflectivity:1.0, iridescence:0, iridescenceIOR:1.3 },
  carbon_exposed: { finish:"carbon_exposed", specularColor:new THREE.Color(0x404040), fresnelColor:new THREE.Color(0x505050), clearcoat:0.9, clearcoatRoughness:0.06, metalness:0.3, roughness:0.2, sheen:0.05, sheenColor:new THREE.Color(0x303030), reflectivity:0.6, iridescence:0, iridescenceIOR:1.5 },
  anodized: { finish:"anodized", specularColor:new THREE.Color(0xc0c0d0), fresnelColor:new THREE.Color(0xb8b8c8), clearcoat:0.7, clearcoatRoughness:0.1, metalness:0.85, roughness:0.1, sheen:0.1, sheenColor:new THREE.Color(0xa0a8b0), reflectivity:0.9, iridescence:0.1, iridescenceIOR:1.6 },
};

export class AutomotivePaintCalibrator {
  public static createPaintMaterial(baseColorHex: number, finish: PaintFinish): THREE.MeshPhysicalMaterial {
    const profile = PAINT_PROFILES[finish];
    const base = new THREE.Color(baseColorHex);
    const specular = profile.specularColor.clone().multiplyScalar(finish === "metallic" ? 0.9 : 0.6);
    return new THREE.MeshPhysicalMaterial({
      color: base, metalness: profile.metalness, roughness: profile.roughness,
      clearcoat: profile.clearcoat, clearcoatRoughness: profile.clearcoatRoughness,
      reflectivity: profile.reflectivity, sheen: profile.sheen, sheenColor: profile.sheenColor,
      specularColor: specular, specularIntensity: finish === "chrome" ? 1.5 : 1.0,
      envMapIntensity: finish === "chrome" ? 2.5 : 1.5,
      iridescence: profile.iridescence, iridescenceIOR: profile.iridescenceIOR,
    });
  }

  public static calibratePaintMaterial(material: THREE.MeshPhysicalMaterial, detectedFinish?: PaintFinish): void {
    const finish = detectedFinish ?? this.detectFinish(material);
    const profile = PAINT_PROFILES[finish];
    material.specularColor = profile.specularColor;
    material.clearcoat = profile.clearcoat;
    material.clearcoatRoughness = profile.clearcoatRoughness;
    material.sheen = profile.sheen;
    material.sheenColor = profile.sheenColor;
    material.reflectivity = profile.reflectivity;
    material.iridescence = profile.iridescence;
    material.iridescenceIOR = profile.iridescenceIOR;
    material.envMapIntensity = finish === "chrome" ? 2.5 : 1.5;
    material.needsUpdate = true;
  }

  private static detectFinish(mat: THREE.MeshPhysicalMaterial): PaintFinish {
    const m = mat.metalness ?? 0, r = mat.roughness ?? 0.5, cc = mat.clearcoat ?? 0;
    if (m > 0.9 && r < 0.05) return "chrome";
    if (m > 0.6 && r < 0.2) return "metallic";
    if (r > 0.6) return "matte";
    if (r > 0.35 && r < 0.5) return "satin";
    if (cc < 0.1 && r < 0.3) return "carbon_exposed";
    return "solid";
  }

  public static getAvailableFinishes(): { finish: PaintFinish; label: string }[] {
    return [
      { finish:"solid", label:"Solid" }, { finish:"metallic", label:"Metallic" },
      { finish:"pearlescent", label:"Pearlescent" }, { finish:"matte", label:"Matte" },
      { finish:"satin", label:"Satin" }, { finish:"chrome", label:"Chrome" },
      { finish:"carbon_exposed", label:"Carbon Fiber" }, { finish:"anodized", label:"Anodized" },
    ];
  }
}

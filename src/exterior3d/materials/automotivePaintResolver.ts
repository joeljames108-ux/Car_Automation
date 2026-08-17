// ===================================================================
// AUTOMOTIVE PAINT MATERIAL RESOLVER
// ===================================================================

import * as THREE from "three";
import type { PaintSystemConfig } from "../../sim/types/exterior";
import type { PaintZone3D } from "../types";
import { ExteriorMaterialLibrary } from "./exteriorPbrMaterialSystem";

export function resolveExteriorMaterialForZone(
  paintZone: PaintZone3D,
  paintConfig: PaintSystemConfig
): THREE.Material {
  switch (paintZone) {
    case "BODY_PAINTED":
      return ExteriorMaterialLibrary.getPaintMaterial(paintConfig);
    case "CONTRAST_ROOF":
      return paintConfig.roofContrastColor
        ? ExteriorMaterialLibrary.getPaintMaterial({
            ...paintConfig,
            primaryColorHex: paintConfig.secondaryColorHex,
          })
        : ExteriorMaterialLibrary.getPaintMaterial(paintConfig);
    case "UNPAINTED_CARBON":
      return ExteriorMaterialLibrary.getCarbonMaterial();
    case "GLASS_TRANSMISSIVE":
      return ExteriorMaterialLibrary.getGlassMaterial(0.92);
    case "LIGHTING_EMISSIVE":
      return ExteriorMaterialLibrary.getLightingEmissiveMaterial(0x38bdf8, 2.5);
    case "RUBBER_MATTE":
      return ExteriorMaterialLibrary.getTireRubberMaterial();
    case "CHROME_POLISHED":
      return ExteriorMaterialLibrary.getPaintMaterial({
        ...paintConfig,
        finishType: "full_mirror_chrome",
        primaryColorHex: "#e2e8f0",
      });
    case "WHEEL_FINISH":
      return new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 });
    case "BRAKE_CALIPER":
      return new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });
    default:
      return ExteriorMaterialLibrary.getPaintMaterial(paintConfig);
  }
}

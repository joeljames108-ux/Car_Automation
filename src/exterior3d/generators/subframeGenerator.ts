// ===================================================================
// THREE.JS SUBFRAME CRADLE 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";
import type { ExteriorEngineeringConfig } from "../../sim/types/exterior";
import { generateSedanSubframeSuspension3DGeometry } from "./sedanSubframeSuspensionGeometry";

export function generateSubframe3DGeometry(
  type: "front" | "rear",
  config?: Partial<ExteriorEngineeringConfig>
): THREE.Group {
  return generateSedanSubframeSuspension3DGeometry(type, config);
}

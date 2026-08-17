// ===================================================================
// EXTERIOR 3D PARAMETRIC TRANSFORM SOLVER
// ===================================================================
// Dynamically computes 3D scale vectors, rotation matrices, and translation
// offsets based on live vehicle dimensions, aero angles, and ride heights.
// ===================================================================

import type { ExteriorComponent3DType, Transform3D } from "../types";
import type {
  ExteriorEngineeringConfig,
  AeroSurfaceConfig,
} from "../../sim/types/exterior";

export function solveExteriorTransformForComponent(
  componentType: ExteriorComponent3DType,
  extConfig?: Partial<ExteriorEngineeringConfig>,
  aeroConfig?: Partial<AeroSurfaceConfig>,
  baseTransform?: Transform3D
): Transform3D {
  const result: Transform3D = {
    position: { x: baseTransform?.position.x || 0, y: baseTransform?.position.y || 0, z: baseTransform?.position.z || 0 },
    rotation: { x: baseTransform?.rotation.x || 0, y: baseTransform?.rotation.y || 0, z: baseTransform?.rotation.z || 0 },
    scale: { x: 1, y: 1, z: 1 },
  };

  const wb = (extConfig?.wheelbase || 2700) / 2700;
  const track = (extConfig?.trackWidthFront || 1680) / 1680;
  const clearance = ((extConfig?.groundClearance || 85) - 85) / 1000;

  // Global ride height offset
  result.position.y += clearance;

  switch (componentType) {
    case "chassis_frame":
    case "floor_pan":
      result.scale = { x: wb, y: 1, z: track };
      break;

    case "front_subframe":
    case "suspension_front_assembly":
    case "front_fenders":
    case "front_bumper_fascia":
      result.position.x = (baseTransform?.position.x || 1.35) * wb;
      result.scale = { x: 1, y: 1, z: track };
      break;

    case "rear_subframe":
    case "suspension_rear_assembly":
    case "rear_quarter_panels":
    case "rear_bumper_fascia":
      result.position.x = (baseTransform?.position.x || -1.35) * wb;
      result.scale = { x: 1, y: 1, z: track };
      break;

    case "front_splitter_tray":
      const splitterExt = (aeroConfig?.splitterExtensionMm || 110) / 110;
      result.position.x = (baseTransform?.position.x || 2.2) * wb;
      result.scale = { x: splitterExt, y: 1, z: track };
      break;

    case "rear_diffuser_tunnel":
      const diffAngle = ((aeroConfig?.diffuserExpansionAngleDeg || 14) * Math.PI) / 180;
      result.position.x = (baseTransform?.position.x || -2.15) * wb;
      result.rotation.z = diffAngle;
      result.scale = { x: 1, y: 1, z: track };
      break;

    case "rear_wing_spoiler":
      const wingAoA = ((aeroConfig?.wingAngleOfAttackDeg || 14) * Math.PI) / 180;
      const wingSpan = (aeroConfig?.wingSpanMm || 1680) / 1680;
      result.position.x = (baseTransform?.position.x || -1.8) * wb;
      result.rotation.z = wingAoA;
      result.scale = { x: 1, y: 1, z: wingSpan };
      break;

    case "roof_panel":
    case "doors_assembly":
    case "side_skirts_aero":
      result.scale = { x: wb, y: 1, z: track };
      break;

    default:
      result.scale = { x: 1, y: 1, z: 1 };
  }

  return result;
}

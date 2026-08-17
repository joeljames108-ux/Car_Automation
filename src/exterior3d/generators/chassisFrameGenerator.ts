// ===================================================================
// THREE.JS CHASSIS MONOCOQUE TUB & UNIBODY FRAME GENERATOR
// ===================================================================
// Procedurally constructs the complete Body-in-White sedan chassis frame
// matching real-world automotive engineering benchmarks & photos.
// ===================================================================

import * as THREE from "three";
import type { ExteriorEngineeringConfig } from "../../sim/types/exterior";
import { generateSedanChassis3DGeometry } from "./sedanChassisGeometry";
import { generateSedanDrivetrainExhaust3DGeometry } from "./sedanDrivetrainExhaustGeometry";

export function generateChassisFrame3DGeometry(
  config?: Partial<ExteriorEngineeringConfig>
): THREE.Group {
  const masterGroup = new THREE.Group();
  masterGroup.name = "Chassis_Frame_Master_Assembly";

  // 1. High-fidelity Sedan Unibody Body-in-White Shell
  const unibodyGroup = generateSedanChassis3DGeometry(config);
  masterGroup.add(unibodyGroup);

  // 2. Integrated Internal Drivetrain, Longitudinal Engine & Exhaust System
  const drivetrainGroup = generateSedanDrivetrainExhaust3DGeometry(config);
  masterGroup.add(drivetrainGroup);

  return masterGroup;
}

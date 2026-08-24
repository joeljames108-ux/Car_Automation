// ===================================================================
// THREE.JS AERO HOOD PANEL 3D GEOMETRY GENERATOR
// ===================================================================
// Generates high-fidelity 3D sculpted clamshell hood with S-duct vents,
// carbon fiber underside stiffener, gas struts, and AeroCatch latches.
// ===================================================================

import * as THREE from "three";
import type { ExteriorEngineeringConfig } from "../../sim/types/exterior";
import { SculptedBodyPanelsGenerator } from "./sculptedBodyPanelsGenerator";

export function generateHoodPanel3DGeometry(
  config?: Partial<ExteriorEngineeringConfig>
): THREE.Group {
  const frontAxleX = 0.45;
  const frontNoseX = 1.33;
  const halfTfM = 0.79;

  const paintMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.85,
    name: "Body_Paint_Primary",
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.38,
    metalness: 0.35,
    name: "Autoclaved_Carbon_Twill",
  });

  const gasketMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
    metalness: 0.05,
    name: "EPDM_Rubber_Gasket",
  });

  const strutMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.20,
    metalness: 0.90,
    name: "Billet_Titanium",
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x020617,
    roughness: 0.10,
    metalness: 0.60,
    name: "Gloss_Black_Trim",
  });

  const meshMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.40,
    metalness: 0.70,
    name: "Hex_Grille_Mesh",
  });

  return SculptedBodyPanelsGenerator.buildBlock04SculptedHoodAndSDuct(
    frontAxleX,
    frontNoseX,
    halfTfM,
    paintMat,
    carbonMat,
    gasketMat,
    strutMat,
    trimMat,
    meshMat,
    { hoodOpenProgress: 0 }
  );
}

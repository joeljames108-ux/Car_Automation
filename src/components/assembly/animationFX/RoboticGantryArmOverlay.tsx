import React from "react";
import type { ComponentId, AssemblyPhase, AssemblyComponentMeta } from "../../../sim/assemblyTypes";

interface RoboticGantryArmOverlayProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
  startPos?: { x: number; y: number };
  meta?: AssemblyComponentMeta;
}

export const RoboticGantryArmOverlay: React.FC<RoboticGantryArmOverlayProps> = () => {
  // Gantry rail beam & aligning scale overlay disabled per user request
  return null;
};

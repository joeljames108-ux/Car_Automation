import React from "react";
import type { ComponentId, AssemblyPhase } from "../../../sim/assemblyTypes";

interface AssemblyLaserGuidanceProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
}

export const AssemblyLaserGuidance: React.FC<AssemblyLaserGuidanceProps> = () => {
  // Aiming target removed per user request
  return null;
};

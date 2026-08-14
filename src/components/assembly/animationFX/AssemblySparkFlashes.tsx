import React from "react";
import type { ComponentId, AssemblyPhase } from "../../../sim/assemblyTypes";

interface AssemblySparkFlashesProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
}

export const AssemblySparkFlashes: React.FC<AssemblySparkFlashesProps> = () => {
  // Removed starburst radial flash animation per user request
  return null;
};

import React from "react";
import type { ComponentId, AssemblyPhase } from "../../../sim/assemblyTypes";

interface AssemblyTrajectoryOverlayProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
  startPos?: { x: number; y: number };
}

export const AssemblyTrajectoryOverlay: React.FC<AssemblyTrajectoryOverlayProps> = () => {
  // Trajectory flight path aiming line disabled per user request
  return null;
};

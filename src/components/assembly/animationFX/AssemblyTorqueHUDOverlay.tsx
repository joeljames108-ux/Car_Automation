import React from "react";
import type { ComponentId, AssemblyPhase, AssemblyComponentMeta } from "../../../sim/assemblyTypes";

interface AssemblyTorqueHUDOverlayProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
  meta?: AssemblyComponentMeta;
}

export const AssemblyTorqueHUDOverlay: React.FC<AssemblyTorqueHUDOverlayProps> = () => {
  // Torque Spec HUD Overlay disabled per user request
  return null;
};

// ===================================================================
// EXTERIOR VIEW MODE TRANSITION CONTROLLER (2D ISO <-> 3D WEBGL)
// ===================================================================

import React from "react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import { ExteriorAssemblyViewer } from "./ExteriorAssemblyViewer";
import { Exterior3DWebGLViewer } from "./Exterior3DWebGLViewer";

interface ExteriorViewModeTransitionProps {
  className?: string;
}

export const ExteriorViewModeTransition: React.FC<ExteriorViewModeTransitionProps> = ({
  className = "w-full h-full",
}) => {
  const viewMode = useExteriorAssemblyStore((s) => s.viewMode);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {viewMode === "2d_iso" ? (
        <ExteriorAssemblyViewer />
      ) : (
        <Exterior3DWebGLViewer />
      )}
    </div>
  );
};

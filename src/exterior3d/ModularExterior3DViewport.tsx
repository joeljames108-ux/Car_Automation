// ===================================================================
// MODULAR EXTERIOR 3D VIEWPORT CONTAINER
// ===================================================================
// Encapsulates the complete 3D WebGL / Three.js assembly workstation,
// automatic 2D/3D state synchronization, floating HUDs, and inspectors.
// ===================================================================

import React from "react";
import { ExteriorScene3D } from "./scene/ExteriorScene3D";
import { ExteriorComponentPicker3D } from "./ui/ExteriorComponentPicker3D";
import { ExteriorComponentInspector3D } from "./ui/ExteriorComponentInspector3D";
import { useExteriorAssembly3DBridge } from "./store/exteriorAssemblyBridge";

interface ModularExterior3DViewportProps {
  className?: string;
}

export const ModularExterior3DViewport: React.FC<ModularExterior3DViewportProps> = ({
  className = "w-full h-full min-h-[500px]",
}) => {
  // Activate automatic bi-directional 2D/3D state sync
  useExteriorAssembly3DBridge();

  return (
    <div className={`relative w-full h-full rounded-3xl overflow-hidden bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl ${className}`}>
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none z-10" />

      {/* Main React Three Fiber 3D Canvas */}
      <ExteriorScene3D />

      {/* Floating 3D Component Quick Installer */}
      <ExteriorComponentPicker3D />

      {/* Floating Component Metallurgy Inspector */}
      <ExteriorComponentInspector3D />
    </div>
  );
};

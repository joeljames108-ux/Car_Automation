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
import { ViewportPauseCanvas } from "../utils/ViewportPauseCanvas";

interface ModularExterior3DViewportProps {
  className?: string;
}

export const ModularExterior3DViewport: React.FC<ModularExterior3DViewportProps> = ({
  className = "w-full h-full min-h-[500px]",
}) => {
  // Activate automatic bi-directional 2D/3D state sync
  useExteriorAssembly3DBridge();

  return (
    <div className={`relative w-full h-full rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl ${className}`} style={{backgroundColor: 'rgba(255,248,235,0.85)', borderColor: 'rgba(217,166,78,0.3)', borderWidth: '1px', borderStyle: 'solid'}}>
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{background: 'radial-gradient(circle at 50% 35%, rgba(217,166,78,0.12), transparent 70%)'}} />

      {/* Main React Three Fiber 3D Canvas — paused when off-screen */}
      <ViewportPauseCanvas rootMargin="300px" style={{flex: 1, minHeight: 0}}>
        <ExteriorScene3D />
      </ViewportPauseCanvas>

      {/* Floating 3D Component Quick Installer */}
      <ExteriorComponentPicker3D />

      {/* Floating Component Metallurgy Inspector */}
      <ExteriorComponentInspector3D />
    </div>
  );
};

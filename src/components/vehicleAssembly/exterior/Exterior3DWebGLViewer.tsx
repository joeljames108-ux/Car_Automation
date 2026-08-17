// ===================================================================
// EXTERIOR 3D WEBGL VIEWER EMBED COMPONENT
// ===================================================================

import React from "react";
import { ModularExterior3DViewport } from "../../../exterior3d/ModularExterior3DViewport";

interface Exterior3DWebGLViewerProps {
  className?: string;
}

export const Exterior3DWebGLViewer: React.FC<Exterior3DWebGLViewerProps> = ({
  className = "w-full h-full",
}) => {
  return <ModularExterior3DViewport className={className} />;
};

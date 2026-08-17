// ===================================================================
// THREE.JS AUTOMOTIVE STUDIO LIGHTING RIG
// ===================================================================

import React from "react";

export const ExteriorLighting3D: React.FC = () => {
  return (
    <>
      {/* Ambient Fill Light */}
      <ambientLight intensity={0.65} />

      {/* Key Light (Front-Right 45 degrees) */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
      />

      {/* Rim Light (Rear-Left Backlight) */}
      <directionalLight position={[-8, 6, -8]} intensity={1.2} color="#38bdf8" />

      {/* Soft Ground Bounce Fill Light */}
      <directionalLight position={[0, -4, 0]} intensity={0.3} color="#94a3b8" />
    </>
  );
};

// ===================================================================
// THREE.JS AUTOMOTIVE STUDIO LIGHTING RIG
// ===================================================================

import React from "react";

export const ExteriorLighting3D: React.FC = () => {
  return (
    <>
      {/* High-Visibility Ambient Fill Light */}
      <ambientLight intensity={1.2} color="#ffffff" />

      {/* Main Studio Key Light */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={2.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
      />

      {/* Top Overhead Softbox Skylight */}
      <directionalLight position={[0, 10, 0]} intensity={1.5} color="#ffffff" />

      {/* Rim Light (Rear-Left Backlight) */}
      <directionalLight position={[-8, 6, -8]} intensity={1.6} color="#38bdf8" />

      {/* Soft Ground Bounce Fill Light */}
      <directionalLight position={[0, -4, 0]} intensity={0.5} color="#94a3b8" />
    </>
  );
};

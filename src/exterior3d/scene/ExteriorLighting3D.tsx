// ===================================================================
// THREE.JS AUTOMOTIVE STUDIO LIGHTING RIG — Neutral Showroom Quality
// ===================================================================

import React from "react";

export const ExteriorLighting3D: React.FC = () => {
  return (
    <>
      {/* Soft Ambient Fill — warm white */}
      <ambientLight intensity={0.6} color="#faf5eb" />

      {/* Main Studio Key Light — slightly warm, from upper front-right */}
      <directionalLight
        position={[6, 10, 6]}
        intensity={2.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0002}
      />

      {/* Overhead Softbox — neutral white for roof reflections */}
      <directionalLight position={[0, 12, 0]} intensity={1.0} color="#ffffff" />

      {/* Rear Rim Light — cool blue for dramatic edge highlight */}
      <directionalLight position={[-6, 5, -8]} intensity={1.2} color="#c8ddf0" />

      {/* Side Fill Light — very subtle warm from left */}
      <directionalLight position={[-8, 4, 2]} intensity={0.5} color="#fef3c7" />

      {/* Underbody Bounce — subtle cool fill from below */}
      <directionalLight position={[0, -3, 0]} intensity={0.3} color="#94a3b8" />

      {/* Spot accent on the car — tight spot for dramatic highlight */}
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={1.5}
        color="#ffffff"
        castShadow={false}
      />
    </>
  );
};

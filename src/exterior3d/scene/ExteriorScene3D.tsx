// ===================================================================
// MASTER EXTERIOR 3D GLTF SCENE GRAPH (REACT THREE FIBER)
// ===================================================================
// Loads real BMW i8 GLB model with metallic clearcoat PBR paint,
// studio HDRI reflections, ground shadow catcher, orbit camera, and
// photorealistic post-processing.
// ===================================================================

import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, MeshReflectorMaterial } from "@react-three/drei";
import { GlbCarModel } from "./GlbCarModel";

// Loading fallback component
const CarLoadingFallback: React.FC = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {/* Ground plane visible during loading */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1208" roughness={0.15} metalness={0.5} />
      </mesh>
      <gridHelper args={[4.0, 40, '#1a1508', '#0d0a06']} position={[0, -0.099, 0]} />

      {/* Loading indicator */}
      <group position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.008, 8, 64]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.004, 8, 64]} />
          <meshStandardMaterial color="#92702a" emissive="#92702a" emissiveIntensity={0.3} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Placeholder wireframe car silhouette */}
      <group position={[0, 0.25, 0]} scale={[1.8, 0.4, 0.8]}>
        <mesh>
          <boxGeometry args={[2, 0.6, 1]} />
          <meshStandardMaterial color="#1a1208" wireframe transparent opacity={0.15} />
        </mesh>
        <mesh position={[0.2, 0.25, 0]}>
          <boxGeometry args={[1.2, 0.5, 0.9]} />
          <meshStandardMaterial color="#1a1208" wireframe transparent opacity={0.1} />
        </mesh>
      </group>
    </group>
  );
};

export const ExteriorScene3D: React.FC = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [3.8, 2.2, 3.8], fov: 42 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        shadows
        className="w-full h-full"
      >
        {/* Studio Lighting */}
        <ambientLight intensity={1.2} color="#ffffff" />
        <directionalLight position={[3, 4, 3.5]} intensity={3.4} color="#ffffff" castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0002} />
        <directionalLight position={[-3.5, 2.5, 2.5]} intensity={1.8} color="#e0f2fe" />
        <directionalLight position={[-1.5, 3, -3.5]} intensity={1.6} color="#fef08a" />
        <directionalLight position={[0, 4.5, 0]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[0, -3.5, 0]} intensity={0.9} color="#e2e8f0" />
        <directionalLight position={[3.5, 1.5, -2.5]} intensity={1.2} color="#f8fafc" />
        <hemisphereLight args={['#ffffff', '#64748b', 1.1]} />

        {/* HDRI Environment for realistic metallic reflections */}
        <Environment preset="studio" background={false} environmentIntensity={0.8} />

        {/* Real GLB Car Model with PBR Paint */}
        <Suspense fallback={<CarLoadingFallback />}>
          <group position={[0, -0.08, 0]}>
            <GlbCarModel
              paintColorHex={0x0044cc}
              caliperColorHex="#ff1100"
              autoRotate={false}
            />
          </group>
        </Suspense>

        {/* Reflective Dark Studio Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={40}
            roughness={0.15}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#1a1208"
            metalness={0.5}
            mirror={0.5}
          />
        </mesh>

        {/* Subtle ground contact shadow */}
        <ContactShadows
          position={[0, -0.09, 0]}
          opacity={0.6}
          scale={12}
          blur={2.5}
          far={4}
          color="#2a1a0a"
        />

        {/* Orbit Camera Controller */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.8}
          maxDistance={8.5}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />
      </Canvas>
    </div>
  );
};

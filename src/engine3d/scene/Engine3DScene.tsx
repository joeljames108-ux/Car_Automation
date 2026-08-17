// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — REACT THREE FIBER SCENE CONTAINER
// ============================================================================
// Master 3D viewport canvas featuring transparent alpha blending matching the
// app's luxury glassmorphic studio theme, studio lighting, and smooth OrbitControls.
// ============================================================================

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { useSnapAnimationTicker } from '../animations/useSnapAnimation';
import { ModularEngineAssembly } from './ModularEngineAssembly';

// ============================================================================
// 1. STUDIO LIGHTING RIG & ENVIRONMENT
// ============================================================================

export const StudioLightingRig: React.FC = () => {
  const lightingPreset = useEngine3DStore((s) => s.lightingPreset);

  const getPresetValues = () => {
    switch (lightingPreset) {
      case 'workshop':
        return { keyColor: '#fef08a', keyInt: 2.2, fillInt: 0.6, rimInt: 0.8, envPreset: 'warehouse' as const };
      case 'showroom':
        return { keyColor: '#ffffff', keyInt: 2.8, fillInt: 1.2, rimInt: 1.0, envPreset: 'city' as const };
      case 'outdoor':
        return { keyColor: '#ffedd5', keyInt: 3.2, fillInt: 0.9, rimInt: 0.7, envPreset: 'sunset' as const };
      case 'dramatic':
        return { keyColor: '#38bdf8', keyInt: 3.5, fillInt: 0.2, rimInt: 2.0, envPreset: 'night' as const };
      case 'blueprint':
        return { keyColor: '#06b6d4', keyInt: 1.5, fillInt: 1.5, rimInt: 0.0, envPreset: 'apartment' as const };
      case 'studio':
      default:
        return { keyColor: '#ffffff', keyInt: 2.6, fillInt: 0.9, rimInt: 1.0, envPreset: 'studio' as const };
    }
  };

  const values = getPresetValues();

  return (
    <>
      <ambientLight intensity={0.65} color="#f8fafc" />

      {/* Key Light (Casting High-Res Soft Shadows) */}
      <directionalLight
        position={[2.5, 3.5, 4.0]}
        intensity={values.keyInt}
        color={values.keyColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-1.5}
        shadow-camera-right={1.5}
        shadow-camera-top={1.5}
        shadow-camera-bottom={-1.5}
        shadow-bias={-0.0001}
      />

      {/* Cool Fill Light */}
      <directionalLight position={[-3.0, 1.5, 2.0]} intensity={values.fillInt} color="#bae6fd" />

      {/* Warm Rim Back-Light */}
      <directionalLight position={[0, -3.0, 3.5]} intensity={values.rimInt} color="#fde68a" />

      {/* Hemisphere Ambient */}
      <hemisphereLight args={['#ffffff', '#1e293b', 0.6]} />

      {/* HDRI Metallic Environment Map */}
      <Environment preset={values.envPreset} />
    </>
  );
};

// ============================================================================
// 2. INNER SCENE GRAPH & FRAME ANIMATION HOOK
// ============================================================================

export const SceneContent: React.FC = () => {
  useSnapAnimationTicker();
  const orbitRef = useRef<any>(null);

  return (
    <>
      <StudioLightingRig />

      {/* Core Modular 3D Engine Assembly */}
      <ModularEngineAssembly />

      {/* Ground Contact Shadow Plate */}
      <ContactShadows
        position={[0, 0, -0.16]}
        opacity={0.45}
        scale={2.4}
        blur={2.0}
        far={1.2}
        resolution={1024}
        color="#0f172a"
      />

      {/* Orbit Controls */}
      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={0.4}
        maxDistance={4.5}
        maxPolarAngle={Math.PI / 2 + 0.1}
        target={[0, 0, 0.18]}
      />

      {/* 3D Coordinate Orientation Gizmo */}
      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="#ffffff" />
      </GizmoHelper>
    </>
  );
};

// ============================================================================
// 3. MASTER CANVAS WRAPPER COMPONENT
// ============================================================================

export interface Engine3DSceneProps {
  className?: string;
}

export const Engine3DScene: React.FC<Engine3DSceneProps> = ({ className = 'w-full h-full' }) => {
  return (
    <div className={`relative bg-transparent select-none overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [1.4, 1.2, 0.9], fov: 42, near: 0.05, far: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        shadows
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Engine3DScene;

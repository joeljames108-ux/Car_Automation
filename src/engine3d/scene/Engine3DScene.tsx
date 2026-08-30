// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — REACT THREE FIBER SCENE CONTAINER (OPTIMIZED)
// ============================================================================
// Master 3D viewport canvas featuring adaptive DPR clamping, high-performance
// WebGL power preferences, static contact shadow caching, and studio lighting.
// ============================================================================

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { useSnapAnimationTicker } from '../animations/useSnapAnimation';
import { ModularEngineAssembly } from './ModularEngineAssembly';
import { PostProcessingStack } from '../postprocessing/PostProcessingStack';
import { EngineRuntimeMotion } from './EngineRuntimeMotion';

import { globalPerformanceManager } from '../core/PerformanceManager';

// ============================================================================
// 1. STUDIO LIGHTING RIG & ENVIRONMENT
// ============================================================================

export const StudioLightingRig: React.FC = () => {
  const lightingPreset = useEngine3DStore((s) => s.lightingPreset);

  const getPresetValues = () => {
    switch (lightingPreset) {
      case 'workshop':
        return { keyColor: '#fef08a', keyInt: 3.2, fillInt: 1.6, rimInt: 1.5, envPreset: 'warehouse' as const };
      case 'showroom':
        return { keyColor: '#ffffff', keyInt: 3.6, fillInt: 2.0, rimInt: 1.8, envPreset: 'city' as const };
      case 'outdoor':
        return { keyColor: '#ffedd5', keyInt: 3.8, fillInt: 1.8, rimInt: 1.4, envPreset: 'sunset' as const };
      case 'dramatic':
        return { keyColor: '#fbbf24', keyInt: 3.8, fillInt: 1.0, rimInt: 2.5, envPreset: 'night' as const };
      case 'blueprint':
        return { keyColor: '#f59e0b', keyInt: 2.2, fillInt: 2.0, rimInt: 1.0, envPreset: 'apartment' as const };
      case 'studio':
      default:
        return { keyColor: '#ffffff', keyInt: 3.4, fillInt: 1.8, rimInt: 1.6, envPreset: 'studio' as const };
    }
  };

  const values = getPresetValues();

  return (
    <>
      <ambientLight intensity={1.2} color="#ffffff" />

      {/* Key Light (Front Right Upper) — High-res shadow map */}
      <directionalLight
        position={[3.0, 4.0, 3.5]}
        intensity={values.keyInt}
        color={values.keyColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-2.0}
        shadow-camera-right={2.0}
        shadow-camera-top={2.0}
        shadow-camera-bottom={-2.0}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      {/* Cool Fill Light (Front Left) */}
      <directionalLight position={[-3.5, 2.5, 2.5]} intensity={values.fillInt} color="#e0f2fe" />

      {/* Warm Rim Back-Light (Rear Upper) */}
      <directionalLight position={[-1.5, 3.0, -3.5]} intensity={values.rimInt} color="#fef08a" />

      {/* Top Studio Downlight */}
      <directionalLight position={[0, 4.5, 0]} intensity={1.4} color="#ffffff" />

      {/* Bottom Ground Bounce Light (Illuminates undercuts & oil pan) */}
      <directionalLight position={[0, -3.5, 0]} intensity={0.9} color="#e2e8f0" />

      {/* Rear Flank Soft Light */}
      <directionalLight position={[3.5, 1.5, -2.5]} intensity={1.2} color="#f8fafc" />

      {/* Hemisphere Ambient */}
      <hemisphereLight args={['#ffffff', '#64748b', 1.1]} />

      {/* HDRI Metallic Environment Map (Non-blocking async load) */}
      <Suspense fallback={null}>
        <Environment preset={values.envPreset} environmentIntensity={1.4} />
      </Suspense>
    </>
  );
};

// ============================================================================
// 2. INNER SCENE GRAPH & FRAME ANIMATION HOOK
// ============================================================================

export const SceneContent: React.FC = () => {
  useSnapAnimationTicker();
  const orbitRef = useRef<any>(null);

  useFrame(({ gl }: { gl: THREE.WebGLRenderer }) => {
    globalPerformanceManager.updateFrameStats(gl, 0, false);
  });

  return (
    <>
      <StudioLightingRig />

      {/* Core Modular 3D Engine Assembly */}
      <ModularEngineAssembly />

      {/* Engine Runtime Motion - auto-starts when assembly completes */}
      <EngineRuntimeMotion autoStart={true} initialRpm={800} />

      {/* Post-Processing Overlays & Studio Highlights */}
      <PostProcessingStack />

      {/* Ground Contact Shadow Plate (Cached 1-Frame Texture Bake) */}
      <ContactShadows
        position={[0, -0.12, 0]}
        opacity={0.4}
        scale={2.6}
        blur={2.2}
        far={1.0}
        resolution={512}
        frames={1}
        color="#2a1a0a"
      />

      {/* Reflective Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 0]} receiveShadow>
        <circleGeometry args={[2.0, 64]} />
        <meshPhysicalMaterial
          color="#1a1208"
          roughness={0.12}
          metalness={0.7}
          clearcoat={0.4}
          clearcoatRoughness={0.15}
          envMapIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Ground Grid Overlay (Engineering Blueprint Style) */}
      <gridHelper
        args={[4.0, 40, '#1a1508', '#0d0a06']}
        position={[0, -0.125, 0]}
      />
      <gridHelper
        args={[4.0, 8, '#92702a', '#1a1508']}
        position={[0, -0.124, 0]}
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
        target={[0, 0.10, 0]}
        autoRotate={false}
        autoRotateSpeed={0.3}
      />

      {/* 3D Coordinate Orientation Gizmo */}
      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#d97706']} labelColor="#ffffff" />
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
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
          outputColorSpace: THREE.SRGBColorSpace,
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

export default React.memo(Engine3DScene);

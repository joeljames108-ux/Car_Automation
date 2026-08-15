import React, { useState, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Float,
  GizmoHelper,
  GizmoViewport,
  useGLTF,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import {
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  Download,
  Box,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface V12WebGLOrbitViewerProps {
  modelUrl?: string;
  className?: string;
}

/**
 * 3D Model Loader & Scene Renderer inside React-Three-Fiber Canvas
 */
function V12EngineModel({
  modelUrl = "/models/v12_racing_engine.glb",
  wireframe = false,
  autoRotate = false,
}: {
  modelUrl?: string;
  wireframe?: boolean;
  autoRotate?: boolean;
}) {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);

  // Apply wireframe override if requested
  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            if ("wireframe" in m) {
              (m as any).wireframe = wireframe;
            }
          });
        } else if (mesh.material && "wireframe" in mesh.material) {
          (mesh.material as any).wireframe = wireframe;
        }
      }
    });
  }, [scene, wireframe]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]} scale={[1.8, 1.8, 1.8]}>
      <primitive object={scene} />
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md text-cyan-300 font-mono text-xs shadow-2xl">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading 3D V12 Engine Model...</span>
      </div>
    </Html>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * FULL 3D WEBGL ORBIT CONTROLS ENGINE VIEWER
 * ═══════════════════════════════════════════════════════════════════
 */
export const V12WebGLOrbitViewer: React.FC<V12WebGLOrbitViewerProps> = ({
  modelUrl = "/models/v12_racing_engine.glb",
  className = "",
}) => {
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [lightingTheme, setLightingTheme] = useState<"studio" | "sun" | "cyber">("studio");
  const [floatingEffect, setFloatingEffect] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleDownloadGlb = () => {
    const link = document.createElement("a");
    link.href = modelUrl;
    link.download = "v12_racing_engine_3d.glb";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`relative w-full h-[460px] md:h-[520px] rounded-3xl bg-slate-950/90 border border-cyan-500/20 overflow-hidden select-none backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] flex flex-col ${className}`}
    >
      {/* ── TOP HUD CONTROLS ── */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        {/* Left: Engine Model Title & Badges */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 px-3 rounded-2xl border border-white/10 backdrop-blur-md text-xs font-mono">
          <Box size={14} className="text-cyan-400 animate-pulse" />
          <span className="font-extrabold text-slate-100">60° V12 3D WebGL Model</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-extrabold">
            GLTF 2.0 PBR
          </span>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-2xl border border-white/10 backdrop-blur-md text-xs font-mono">
          {/* Auto-Rotate Toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              autoRotate
                ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Toggle Continuous 360° Rotation"
          >
            <RotateCcw size={12} className={autoRotate ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Rotate</span>
          </button>

          {/* Wireframe Toggle */}
          <button
            type="button"
            onClick={() => setWireframe(!wireframe)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              wireframe
                ? "bg-amber-500/30 text-amber-200 border border-amber-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Toggle Wireframe Mesh Topology"
          >
            <Eye size={12} />
            <span className="hidden sm:inline">Mesh</span>
          </button>

          {/* Lighting Mode Presets */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-1.5 ml-1">
            <button
              type="button"
              onClick={() => setLightingTheme(lightingTheme === "studio" ? "sun" : lightingTheme === "sun" ? "cyber" : "studio")}
              className="flex items-center gap-1 px-2 py-1 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Switch Studio Lighting Environment"
            >
              {lightingTheme === "studio" ? <Sparkles size={12} className="text-cyan-400" /> : lightingTheme === "sun" ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} className="text-purple-400" />}
              <span className="capitalize hidden md:inline">{lightingTheme}</span>
            </button>
          </div>

          {/* Reset Camera View */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-all cursor-pointer"
            title="Reset Camera Orientation"
          >
            <RotateCcw size={13} />
          </button>

          {/* Download GLB Button */}
          <button
            type="button"
            onClick={handleDownloadGlb}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95 ml-1"
            title="Download Binary .GLB 3D File"
          >
            <Download size={12} />
            <span>Get .GLB</span>
          </button>
        </div>
      </div>

      {/* ── 3D CANVAS VIEWPORT ── */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          shadows
          camera={{ position: [1.2, 0.8, 1.4], fov: 42 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          {/* Ambient & Directional Studio Lights based on theme */}
          {lightingTheme === "studio" && (
            <>
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} />
              <directionalLight position={[-5, 4, -5]} intensity={0.9} color="#38bdf8" />
              <pointLight position={[0, 4, 0]} intensity={0.6} color="#f59e0b" />
            </>
          )}

          {lightingTheme === "sun" && (
            <>
              <ambientLight intensity={0.5} />
              <directionalLight position={[8, 10, 4]} intensity={2.4} color="#fef08a" castShadow />
              <directionalLight position={[-4, 2, -4]} intensity={0.5} color="#93c5fd" />
            </>
          )}

          {lightingTheme === "cyber" && (
            <>
              <ambientLight intensity={0.3} />
              <directionalLight position={[4, 6, 4]} intensity={2.0} color="#38bdf8" />
              <directionalLight position={[-4, 4, -4]} intensity={2.0} color="#ec4899" />
              <pointLight position={[0, -2, 0]} intensity={1.2} color="#a855f7" />
            </>
          )}

          {/* Model Rendering with Suspense */}
          <Suspense fallback={<Loader />}>
            {floatingEffect ? (
              <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                <V12EngineModel modelUrl={modelUrl} wireframe={wireframe} autoRotate={autoRotate} />
              </Float>
            ) : (
              <V12EngineModel modelUrl={modelUrl} wireframe={wireframe} autoRotate={autoRotate} />
            )}

            {/* Ground Contact Shadows */}
            <ContactShadows
              position={[0, -0.45, 0]}
              opacity={0.7}
              scale={2.2}
              blur={2.0}
              far={1.5}
              color="#020617"
            />
          </Suspense>

          {/* Orbit Controls with Smooth Damping */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.06}
            minDistance={0.6}
            maxDistance={3.5}
            maxPolarAngle={Math.PI / 2 + 0.15}
          />

          {/* 3D Interactive Orientation Axis Gizmo */}
          <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
            <GizmoViewport axisColors={["#ef4444", "#22c55e", "#3b82f6"]} labelColor="#ffffff" />
          </GizmoHelper>
        </Canvas>
      </div>

      {/* ── BOTTOM HUD FOOTER HELPER TIPS ── */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-3 bg-slate-950/70 p-1.5 px-3 rounded-2xl border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-400 pointer-events-none">
        <span>🖱️ Left-Click + Drag: Rotate 360°</span>
        <span>•</span>
        <span>📜 Scroll: Zoom In/Out</span>
        <span>•</span>
        <span>🖱️ Right-Click: Pan View</span>
      </div>
    </div>
  );
};

// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 3D WEBGL CAD VIEWPORT
// ============================================================================
// Full-width interactive Three.js WebGL canvas supporting:
// - Orbit controls & studio lighting
// - Exploded view radial separation slider (0% to 100%)
// - X-Ray structural transparency & Wireframe inspection
// - 4 Camera presets (Front 3/4, Side, Top, Cockpit)
// - 3-Way Mode Switcher: 2D Blueprint, 3D Isometric SVG, 3D WebGL GLB
// ============================================================================

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Layers,
  Sparkles,
  Eye,
  Sliders,
  RotateCw,
  Maximize2,
  Compass,
  Zap,
} from 'lucide-react';
import { VehicleSceneGraph } from '../../exterior3d/scene/VehicleSceneGraph';
import { ModularChassisFamilyGenerator } from '../../exterior3d/generators/modularChassisFamilyGenerator';
import { ModularClosuresGenerator } from '../../exterior3d/generators/modularClosuresGenerator';
import { ModularCabinInteriorGenerator } from '../../exterior3d/generators/modularCabinInteriorGenerator';
import { ModularInterior3DGenerator } from '../../exterior3d/generators/modularInterior3DGenerator';
import { ModularLightingGlassAeroGenerator } from '../../exterior3d/generators/modularLightingGlassAeroGenerator';
import {
  VehicleBodyType,
  VehicleSubsystemStage,
  Assembly3DViewMode,
  CameraPreset,
} from '../../exterior3d/types/vehicleConstructionTypes';
import { ModularInteriorConfiguration } from '../../exterior3d/types/modularInteriorTypes';
import { CHASSIS_50_MAP } from '../../exterior3d/manifests/chassis50Manifest';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { VehicleSVG } from './VehicleSVG';
import { ChassisFrameSVG } from './exterior/svg/ChassisFrameSVG';

interface ModularVehicle3DViewportProps {
  bodyType: VehicleBodyType;
  chassisId: string;
  installedStages: VehicleSubsystemStage[];
  materialGrades: Record<VehicleSubsystemStage, MaterialGrade>;
  interiorConfig?: Partial<ModularInteriorConfiguration>;
  wheelbaseMm: number;
  trackWidthFrontMm: number;
  trackWidthRearMm: number;
  rideHeightMm: number;
  viewMode: Assembly3DViewMode;
  cameraPreset: CameraPreset;
  explodedViewProgress: number;
  isXRayActive: boolean;
  isWireframeActive: boolean;
  isRotating: boolean;
  onSetViewMode: (mode: Assembly3DViewMode) => void;
  onSetCameraPreset: (preset: CameraPreset) => void;
  onSetExplodedView: (val: number) => void;
  onToggleXRay: () => void;
  onToggleWireframe: () => void;
  onToggleRotating: () => void;
}

export const ModularVehicle3DViewport: React.FC<ModularVehicle3DViewportProps> = ({
  bodyType,
  chassisId,
  installedStages,
  materialGrades,
  interiorConfig = {},
  wheelbaseMm,
  trackWidthFrontMm,
  trackWidthRearMm,
  rideHeightMm,
  viewMode,
  cameraPreset,
  explodedViewProgress,
  isXRayActive,
  isWireframeActive,
  isRotating,
  onSetViewMode,
  onSetCameraPreset,
  onSetExplodedView,
  onToggleXRay,
  onToggleWireframe,
  onToggleRotating,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneGraphRef = useRef<VehicleSceneGraph | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Setup Three.js WebGL Scene
  useEffect(() => {
    if (viewMode !== '3d_glb' && viewMode !== 'xray_structural') return;
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0d14);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(3.8, 2.2, 3.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.replaceChildren(renderer.domElement);

    // 2. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Ground limit
    controls.minDistance = 1.5;
    controls.maxDistance = 12.0;
    controls.target.set(-wheelbaseMm / 2000, 0.4, 0);
    controlsRef.current = controls;

    // 3. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.4);
    fillLight.position.set(-5, 4, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(0, 6, -8);
    scene.add(rimLight);

    // Ground Grid & Mirror Plane
    const grid = new THREE.GridHelper(16, 32, 0x0284c7, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // 4. Initialize Vehicle Scene Graph
    const sceneGraph = new VehicleSceneGraph();
    sceneGraphRef.current = sceneGraph;
    scene.add(sceneGraph.vehicleRoot);

    // 5. Populate Modular Meshes
    const chassisDef = CHASSIS_50_MAP[chassisId] || CHASSIS_50_MAP['SEDAN_CHASSIS_01'];

    // 5.1 Chassis Monocoque Mesh
    if (installedStages.includes('chassis_platform')) {
      const chassisGrade = materialGrades.chassis_platform || 'forged';
      const chassisMesh = ModularChassisFamilyGenerator.buildChassisMesh(chassisDef, chassisGrade, isWireframeActive);
      sceneGraph.chassisRoot.add(chassisMesh);
    }

    // 5.2 Closures & Exterior Body Panels
    if (installedStages.includes('exterior_panels')) {
      const panelGrade = materialGrades.exterior_panels || 'forged';
      const closures = ModularClosuresGenerator.buildClosures(bodyType, wheelbaseMm, trackWidthRearMm, panelGrade, isXRayActive);
      sceneGraph.exteriorPanelsRoot.add(closures);
    }

    // 5.3 Modular Cabin Interior & Cockpit
    if (installedStages.includes('interior_cabin')) {
      const interior = ModularInterior3DGenerator.buildModularInterior(interiorConfig, wheelbaseMm, trackWidthFrontMm);
      sceneGraph.interiorRoot.add(interior);
    }

    // 5.4 Lighting, Glass & Aerodynamics
    if (installedStages.includes('lighting_glass')) {
      const lights = ModularLightingGlassAeroGenerator.buildLighting(wheelbaseMm, trackWidthFrontMm);
      const glass = ModularLightingGlassAeroGenerator.buildGlass(wheelbaseMm, trackWidthFrontMm);
      sceneGraph.lightingGlassRoot.add(lights, glass);
    }

    if (installedStages.includes('aerodynamics')) {
      const aero = ModularLightingGlassAeroGenerator.buildAerodynamics(wheelbaseMm, trackWidthRearMm, materialGrades.aerodynamics);
      sceneGraph.aeroRoot.add(aero);
    }

    // Update Exploded View
    sceneGraph.updateExplodedView(explodedViewProgress);

    // 6. Animation Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating) {
        sceneGraph.vehicleRoot.rotation.y += 0.005;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      sceneGraph.dispose();
    };
  }, [
    bodyType,
    chassisId,
    installedStages,
    materialGrades,
    wheelbaseMm,
    trackWidthFrontMm,
    trackWidthRearMm,
    rideHeightMm,
    viewMode,
    explodedViewProgress,
    isXRayActive,
    isWireframeActive,
    isRotating,
  ]);

  // Update Camera Presets
  const applyCameraPreset = (preset: CameraPreset) => {
    onSetCameraPreset(preset);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const targetX = -wheelbaseMm / 2000;
    controls.target.set(targetX, 0.4, 0);

    if (preset === 'front_3_4') {
      camera.position.set(3.8, 2.0, 3.2);
    } else if (preset === 'side_profile') {
      camera.position.set(targetX, 1.2, 4.5);
    } else if (preset === 'top_chassis') {
      camera.position.set(targetX, 5.5, 0.01);
    } else if (preset === 'cockpit') {
      camera.position.set(targetX - 0.2, 0.9, -0.1);
    }
    controls.update();
  };

  return (
    <div className="relative w-full bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl font-mono">
      {/* ── TOP HEADER TOOLBAR ── */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-md">
        {/* Left: View Mode Toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-base-900/90 border border-slate-800">
          <button
            onClick={() => onSetViewMode('2d_blueprint')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === '2d_blueprint'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D Blueprint
          </button>
          <button
            onClick={() => onSetViewMode('3d_isometric')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === '3d_isometric'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3D Iso SVG
          </button>
          <button
            onClick={() => onSetViewMode('3d_glb')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === '3d_glb'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3D WebGL GLB
          </button>
        </div>

        {/* Right: Inspection Controls (Exploded View, X-Ray, Camera Presets) */}
        <div className="flex items-center gap-2">
          {/* Exploded View Slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-base-900/90 border border-slate-800 text-xs text-slate-300">
            <Sliders size={13} className="text-cyan-400" />
            <span className="text-[10px] text-slate-400">Exploded:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedViewProgress}
              onChange={(e) => onSetExplodedView(parseFloat(e.target.value))}
              className="w-20 accent-cyan-500 cursor-pointer h-1.5"
            />
            <span className="text-[10px] text-cyan-400 font-bold w-6">
              {Math.round(explodedViewProgress * 100)}%
            </span>
          </div>

          {/* X-Ray Toggle */}
          <button
            onClick={onToggleXRay}
            className={`p-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              isXRayActive
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md'
                : 'bg-base-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle X-Ray Structural View"
          >
            <Eye size={15} />
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={onToggleWireframe}
            className={`p-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              isWireframeActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                : 'bg-base-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle CAD Wireframe Mesh"
          >
            <Layers size={15} />
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={onToggleRotating}
            className={`p-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              isRotating
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                : 'bg-base-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Auto-Rotate Studio Turntable"
          >
            <RotateCw size={15} />
          </button>

          {/* Camera Preset Dropdown */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-base-900/90 border border-slate-800">
            <button
              onClick={() => applyCameraPreset('front_3_4')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cameraPreset === 'front_3_4' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              3/4 Front
            </button>
            <button
              onClick={() => applyCameraPreset('side_profile')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cameraPreset === 'side_profile' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Side
            </button>
            <button
              onClick={() => applyCameraPreset('top_chassis')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cameraPreset === 'top_chassis' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Top Plan
            </button>
          </div>
        </div>
      </div>

      {/* ── CANVAS RENDER STAGE ── */}
      <div className="h-[480px] w-full flex items-center justify-center">
        {viewMode === '3d_glb' || viewMode === 'xray_structural' ? (
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        ) : viewMode === '3d_isometric' ? (
          <div className="w-full h-full p-8 flex items-center justify-center bg-base-950">
            <ChassisFrameSVG />
          </div>
        ) : (
          <div className="w-full h-full p-8 flex items-center justify-center bg-base-950">
            <VehicleSVG
              installedComponents={['chassis_frame', 'engine_bay', 'suspension_front', 'suspension_rear', 'wheels_tires']}
              activeComponentId={null}
              phase="complete"
              hoveredComponentId={null}
              isExplodedView={false}
            />
          </div>
        )}
      </div>

      {/* ── BOTTOM HUD CAD DIMENSIONS OVERLAY ── */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-base-950/80 border border-slate-800 backdrop-blur-md">
          <span>Wheelbase: <strong className="text-cyan-400">{wheelbaseMm}mm</strong></span>
          <span>Track F/R: <strong className="text-slate-200">{trackWidthFrontMm}/{trackWidthRearMm}mm</strong></span>
          <span>Ride Height: <strong className="text-emerald-400">{rideHeightMm}mm</strong></span>
        </div>

        <div className="px-3 py-1.5 rounded-2xl bg-base-950/80 border border-slate-800 backdrop-blur-md text-[10px] text-slate-400">
          Left Click: Orbit • Right Click: Pan • Scroll: Zoom
        </div>
      </div>
    </div>
  );
};

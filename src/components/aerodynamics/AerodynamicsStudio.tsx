// ============================================================================
// PHASE 121: PARAMETRIC 3D AERODYNAMICS STUDIO & ENGINEERING LABORATORY
// ============================================================================
// 3-column laboratory studio where adjusting aerodynamic parameters directly
// regenerates 3D CAD meshes, solves surrogate CFD physics, renders streamlines
// and force vectors, and displays live lap-time deltas and telemetry.
// ============================================================================

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Wind,
  Layers,
  Plane,
  RotateCcw,
  Zap,
  Gauge,
  Activity,
  Sliders,
  DollarSign,
  Weight,
  Sparkles,
  ShieldAlert,
  Play,
  Pause,
  Maximize2,
  ChevronRight,
  HelpCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type {
  MasterAeroStudioConfig,
  AeroSubsystemId,
  AeroVisualMode,
  AeroPackagePresetId,
} from '../../sim/aerodynamics/aeroStudioTypes';
import { SurrogateAeroPhysicsEngine } from '../../sim/aerodynamics/surrogateAeroPhysicsEngine';
import { ParametricVehicleAeroCompositeCad } from '../../exterior3d/aerodynamics/parametricVehicleAeroCompositeCad';
import { CFDVisualOverlaySystem } from '../../exterior3d/aerodynamics/cfdVisualOverlaySystem';
import { StudioEnvironmentGenerator } from '../../exterior3d/environment/StudioEnvironmentGenerator';

export const AerodynamicsStudio: React.FC = () => {
  // 1. Master Studio Configuration State
  const [config, setConfig] = useState<MasterAeroStudioConfig>(() =>
    SurrogateAeroPhysicsEngine.getPresetConfig('balanced_gt')
  );

  const [activeSubsystem, setActiveSubsystem] = useState<AeroSubsystemId>('frontWing');
  const [visualMode, setVisualMode] = useState<AeroVisualMode>('realistic');
  const [showStreamlines, setShowStreamlines] = useState<boolean>(true);
  const [showForceVectors, setShowForceVectors] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [modelSource, setModelSource] = useState<'parametric_gt3' | 'ford_escort' | 'bmw_i8' | 'mini_jcw' | 'v12_engine'>('parametric_gt3');
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);

  // 2. Compute live surrogate aerodynamic physics in real-time
  const physics = useMemo(() => {
    return SurrogateAeroPhysicsEngine.solveAerodynamics(config);
  }, [config]);

  // 3. Three.js Viewport Mount and Animation Loop
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const forceVectorsGroupRef = useRef<THREE.Group | null>(null);
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null);
  const streamlinesSystemRef = useRef<{
    points: THREE.Points;
    updateParticles: (airspeedKmh: number, delta: number) => void;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.04);
    sceneRef.current = scene;

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.8, 2.4, 4.4);

    // Renderer Setup with ACES Filmic Tone Mapping and Shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Environment Radiance Reflections
    if (typeof document !== 'undefined') {
      const radianceMap = StudioEnvironmentGenerator.createStudioRadianceMap(renderer);
      scene.environment = radianceMap;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.4, 0);
    controls.maxDistance = 14;
    controls.minDistance = 1.5;

    // 5-Point Studio Lighting Rig
    StudioEnvironmentGenerator.setupStudioLighting(scene, 'darkWindTunnel');

    // Realistic Soft Ground Contact Shadow
    const groundShadow = StudioEnvironmentGenerator.createContactShadowPlane(2.8, 5.4, 0.82);
    shadowPlaneRef.current = groundShadow;
    scene.add(groundShadow);

    // Wind Tunnel Floor Grid
    const grid = new THREE.GridHelper(16, 32, 0x00f0ff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Particle Streamlines System
    const streamlines = CFDVisualOverlaySystem.buildStreamlinesParticleSystem(850);
    streamlinesSystemRef.current = streamlines;
    scene.add(streamlines.points);

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const rawDelta = (time - lastTime) / 1000;
      const delta = Math.min(rawDelta, 0.08); // Clamp delta to avoid particle bursts on tab switch
      lastTime = time;

      controls.update();

      if (streamlinesSystemRef.current && isPlaying && showStreamlines) {
        streamlinesSystemRef.current.points.visible = true;
        streamlinesSystemRef.current.updateParticles(config.airspeedKmh, delta);
      } else if (streamlinesSystemRef.current) {
        streamlinesSystemRef.current.points.visible = false;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (vehicleGroupRef.current) {
        ParametricVehicleAeroCompositeCad.disposeObject3D(vehicleGroupRef.current);
      }
      if (forceVectorsGroupRef.current) {
        ParametricVehicleAeroCompositeCad.disposeObject3D(forceVectorsGroupRef.current);
      }
      if (shadowPlaneRef.current) {
        shadowPlaneRef.current.geometry.dispose();
        if (Array.isArray(shadowPlaneRef.current.material)) {
          shadowPlaneRef.current.material.forEach((m) => m.dispose());
        } else {
          shadowPlaneRef.current.material.dispose();
        }
      }
      renderer.dispose();
    };
  }, []);

  // 4. Update 3D Geometry when config, modelSource, or visualMode changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    let isCancelled = false;

    // Load or rebuild Vehicle 3D Mesh
    const updateModel = async () => {
      if (modelSource === 'parametric_gt3') {
        if (vehicleGroupRef.current) {
          scene.remove(vehicleGroupRef.current);
          ParametricVehicleAeroCompositeCad.disposeObject3D(vehicleGroupRef.current);
        }
        const newVehicle = ParametricVehicleAeroCompositeCad.buildFullAerodynamicVehicle3D(config, visualMode);
        vehicleGroupRef.current = newVehicle;
        scene.add(newVehicle);
      } else {
        setIsLoadingModel(true);
        try {
          const refModel = await ParametricVehicleAeroCompositeCad.loadReferenceVehicleAsset(modelSource);
          if (isCancelled) return;
          if (vehicleGroupRef.current) {
            scene.remove(vehicleGroupRef.current);
            // Note: Keep shared cached geometries but remove from scene
          }
          vehicleGroupRef.current = refModel;
          scene.add(refModel);
        } catch (e) {
          console.warn('[AerodynamicsStudio] Failed loading reference model:', e);
        } finally {
          if (!isCancelled) setIsLoadingModel(false);
        }
      }
    };

    updateModel();

    // Rebuild Force Vectors
    if (forceVectorsGroupRef.current) {
      scene.remove(forceVectorsGroupRef.current);
      ParametricVehicleAeroCompositeCad.disposeObject3D(forceVectorsGroupRef.current);
    }
    if (showForceVectors) {
      const forceGroup = CFDVisualOverlaySystem.buildForceVectors3D(physics);
      forceVectorsGroupRef.current = forceGroup;
      scene.add(forceGroup);
    }

    return () => {
      isCancelled = true;
    };
  }, [config, visualMode, showForceVectors, physics, modelSource]);

  // Helper to switch presets
  const handleApplyPreset = (preset: AeroPackagePresetId) => {
    const newConf = SurrogateAeroPhysicsEngine.getPresetConfig(preset);
    setConfig(newConf);
  };

  return (
    <div className="flex flex-col h-full w-full bg-amber-950/80 text-amber-50 rounded-xl overflow-hidden border border-amber-800/30 shadow-2xl">
      {/* TOP HEADER BAR */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-amber-900/40 backdrop-blur border-b border-amber-800/30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Wind size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide uppercase text-amber-50">
                AERODYNAMICS STUDIO <span className="text-amber-400 font-mono">PHASE 111-125</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                3D PARAMETRIC CFD LAB
              </span>
            </div>
            <p className="text-[11px] text-amber-200/60">
              Parametric 3D CAD Geometry &bull; Surrogate CFD Physics &bull; Live Lap-Time Coupling
            </p>
          </div>
        </div>

        {/* Quick Aero Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-semibold text-amber-200/60 mr-1">PACKAGE:</span>
          {(
            [
              { id: 'low_drag_speed', label: '🚀 Low Drag', color: 'purple' },
              { id: 'balanced_gt', label: '⚖️ Balanced GT', color: 'cyan' },
              { id: 'high_downforce_sprint', label: '🏎️ Max Downforce', color: 'emerald' },
              { id: 'extreme_ground_effect', label: '⚡ Ground Effect', color: 'amber' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all border ${
                config.preset === p.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm shadow-cyan-500/20'
                  : 'bg-amber-850/40 border-amber-800/30 text-amber-200/60 hover:border-amber-700/30 hover:text-amber-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN 3-COLUMN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 bg-amber-950/80">
        {/* 1. LEFT RAIL: SUBSYSTEM SELECTION */}
        <div className="lg:col-span-2 p-3 bg-amber-900/40 border-r border-amber-800/30 flex flex-col gap-1.5 overflow-y-auto">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-200/60 mb-1 px-1">
            AERO SUBSYSTEMS
          </div>

          {(
            [
              { id: 'frontWing', label: 'Front Wing & Flaps', icon: <Layers size={14} />, metric: `${physics.components.frontWing.downforceN} N` },
              { id: 'canards', label: 'Bumper Canards', icon: <Zap size={14} />, metric: `${physics.components.canards.downforceN} N` },
              { id: 'groundEffectFloor', label: 'Ground Effect Floor', icon: <Activity size={14} />, metric: `${physics.components.floor.downforceN} N` },
              { id: 'sidepod', label: 'Sculpted Sidepods', icon: <Sliders size={14} />, metric: `${physics.components.sidepods.downforceN} N` },
              { id: 'diffuser', label: 'Rear Diffuser', icon: <RotateCcw size={14} />, metric: `${physics.components.diffuser.downforceN} N` },
              { id: 'rearWing', label: 'Rear Wing & DRS', icon: <Plane size={14} />, metric: `${physics.components.rearWing.downforceN} N` },
            ] as const
          ).map((item) => {
            const isActive = activeSubsystem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubsystem(item.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-left transition-all border ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-amber-900/40 border-amber-800/30 text-amber-200/60 hover:border-amber-700/30 hover:text-amber-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isActive ? 'text-amber-400' : 'text-amber-200/60'}>{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-200/60">{item.metric}</span>
              </button>
            );
          })}

          <div className="mt-auto pt-3 border-t border-amber-800/30 space-y-2">
            <div className="p-2.5 rounded-lg bg-amber-900/40 border border-amber-800/30 text-[11px] space-y-1">
              <div className="flex justify-between text-amber-200/60 font-mono">
                <span>Total Aero Mass:</span>
                <span className="text-amber-50 font-bold">{physics.totalAeroMassKg} kg</span>
              </div>
              <div className="flex justify-between text-amber-200/60 font-mono">
                <span>Tooling / Cost:</span>
                <span className="text-emerald-400 font-bold">${physics.totalAeroCostUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CENTER STAGE: INTERACTIVE 3D VIEWPORT */}
        <div className="lg:col-span-7 relative flex flex-col min-h-[380px] bg-amber-950/80">
          {/* Viewport Toolbar Overlay */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 flex-wrap max-w-full">
            {/* 3D Model Asset Source Selector */}
            <div className="flex items-center bg-amber-900/40 backdrop-blur rounded-lg p-1 border border-amber-500/40 shadow-lg">
              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase px-1.5 flex items-center gap-1">
                <Sparkles size={10} /> 3D MODEL:
              </span>
              <select
                value={modelSource}
                onChange={(e) => setModelSource(e.target.value as any)}
                className="bg-amber-950/80 text-amber-50 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-amber-800/30 focus:outline-none focus:border-amber-500"
              >
                <option value="parametric_gt3">🏆 GT3 Hypercar (Parametric 3D CAD)</option>
                <option value="ford_escort">🚗 Ford Escort RS Cosworth (Official GLB)</option>
                <option value="bmw_i8">⚡ BMW i8 XS Supercar (Official GLB)</option>
                <option value="mini_jcw">🏁 Mini Countryman JCW (Official GLTF)</option>
                <option value="v12_engine">🔧 V12 Racing Engine (Official CAD)</option>
              </select>
            </div>

            {/* Visual Mode Selector */}
            <div className="flex items-center bg-amber-900/40 backdrop-blur rounded-lg p-1 border border-amber-800/30 shadow-lg">
              {(
                [
                  { id: 'realistic', label: 'PBR 3D' },
                  { id: 'wireframe', label: 'CAD Wire' },
                  { id: 'cfdPressure', label: 'CFD Heatmap' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setVisualMode(mode.id)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                    visualMode === mode.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-amber-200/60 hover:text-amber-50'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowStreamlines(!showStreamlines)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 backdrop-blur border transition-all ${
                showStreamlines
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-amber-900/40 border-amber-800/30 text-amber-200/60'
              }`}
            >
              <Wind size={12} />
              Streamlines
            </button>

            <button
              onClick={() => setShowForceVectors(!showForceVectors)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 backdrop-blur border transition-all ${
                showForceVectors
                  ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                  : 'bg-amber-900/40 border-amber-800/30 text-amber-200/60'
              }`}
            >
              <TrendingDown size={12} />
              Force Vectors
            </button>

            {isLoadingModel && (
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono animate-pulse flex items-center gap-1.5">
                <Activity size={10} className="animate-spin" />
                Loading 3D Model...
              </div>
            )}
          </div>

          {/* Airspeed Scrubber Overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-3 px-3 py-2 bg-amber-900/40 backdrop-blur rounded-xl border border-amber-800/30 shadow-xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <div className="text-xs font-mono">
                <span className="text-amber-200/60">TUNNEL AIRSPEED:</span>{' '}
                <span className="text-amber-300 font-bold">{config.airspeedKmh} km/h</span>
              </div>
            </div>

            <input
              type="range"
              min={40}
              max={360}
              step={5}
              value={config.airspeedKmh}
              onChange={(e) => setConfig({ ...config, airspeedKmh: Number(e.target.value) })}
              className="flex-1 accent-amber-400 h-1.5 bg-amber-800/35 rounded-lg cursor-pointer"
            />

            <div className="text-[11px] font-mono text-amber-200/60">
              q = {Math.round(0.5 * 1.225 * Math.pow((config.airspeedKmh * 1000) / 3600, 2))} N/m²
            </div>
          </div>

          {/* 3D Canvas Mount */}
          <div ref={mountRef} className="w-full h-full min-h-[380px]" />
        </div>

        {/* 3. RIGHT RAIL: PARAMETRIC ENGINEERING CONTROLS */}
        <div className="lg:col-span-3 p-4 bg-amber-900/40 border-l border-amber-800/30 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-800/30">
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
              {activeSubsystem} PARAMETERS
            </div>
            <span className="text-[10px] font-mono text-amber-200/60">3D MORPHING</span>
          </div>

          {/* Active Subsystem Controls */}
          {activeSubsystem === 'frontWing' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Flap Angle of Attack</span>
                  <span className="text-amber-400 font-bold">{config.frontWing.flapAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={1}
                  value={config.frontWing.flapAngleDeg}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frontWing: { ...config.frontWing, flapAngleDeg: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Flap Span Length</span>
                  <span className="text-amber-400 font-bold">{config.frontWing.flapLengthPct}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={config.frontWing.flapLengthPct}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frontWing: { ...config.frontWing, flapLengthPct: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Front Ride Height</span>
                  <span className="text-amber-400 font-bold">{config.frontWing.rideHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={2}
                  value={config.frontWing.rideHeightMm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frontWing: { ...config.frontWing, rideHeightMm: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Trailing Gurney Height</span>
                  <span className="text-amber-400 font-bold">{config.frontWing.gurneyHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={1}
                  value={config.frontWing.gurneyHeightMm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      frontWing: { ...config.frontWing, gurneyHeightMm: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-amber-100/80">Multi-Element Count</span>
                <div className="flex gap-1">
                  {([1, 2, 3] as const).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() =>
                        setConfig({
                          ...config,
                          frontWing: { ...config.frontWing, elementCount: cnt },
                        })
                      }
                      className={`px-2.5 py-1 text-xs font-mono rounded ${
                        config.frontWing.elementCount === cnt
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-amber-800/35 text-amber-200/60 hover:text-amber-50'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubsystem === 'rearWing' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Wing Angle of Attack</span>
                  <span className="text-amber-400 font-bold">{config.rearWing.angleOfAttackDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={35}
                  step={1}
                  value={config.rearWing.angleOfAttackDeg}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rearWing: { ...config.rearWing, angleOfAttackDeg: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Wing Span</span>
                  <span className="text-amber-400 font-bold">{config.rearWing.spanMm} mm</span>
                </div>
                <input
                  type="range"
                  min={1200}
                  max={2000}
                  step={20}
                  value={config.rearWing.spanMm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rearWing: { ...config.rearWing, spanMm: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Gurney Tab Height</span>
                  <span className="text-amber-400 font-bold">{config.rearWing.gurneyHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={22}
                  step={1}
                  value={config.rearWing.gurneyHeightMm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rearWing: { ...config.rearWing, gurneyHeightMm: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-amber-100/80">Pylon Architecture</span>
                <button
                  onClick={() =>
                    setConfig({
                      ...config,
                      rearWing: {
                        ...config.rearWing,
                        pylonType: config.rearWing.pylonType === 'swan_neck' ? 'bottom_mount' : 'swan_neck',
                      },
                    })
                  }
                  className="px-2.5 py-1 text-xs font-mono rounded bg-amber-800/35 text-amber-300 border border-amber-700/30"
                >
                  {config.rearWing.pylonType === 'swan_neck' ? '🦢 Swan Neck' : '📍 Bottom Mount'}
                </button>
              </div>
            </div>
          )}

          {activeSubsystem === 'groundEffectFloor' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Venturi Throat Height</span>
                  <span className="text-amber-400 font-bold">{config.groundEffectFloor.tunnelThroatHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={80}
                  step={1}
                  value={config.groundEffectFloor.tunnelThroatHeightMm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      groundEffectFloor: {
                        ...config.groundEffectFloor,
                        tunnelThroatHeightMm: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Expansion Ratio</span>
                  <span className="text-amber-400 font-bold">{config.groundEffectFloor.tunnelExpansionRatio.toFixed(1)}:1</span>
                </div>
                <input
                  type="range"
                  min={1.2}
                  max={4.5}
                  step={0.1}
                  value={config.groundEffectFloor.tunnelExpansionRatio}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      groundEffectFloor: {
                        ...config.groundEffectFloor,
                        tunnelExpansionRatio: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Underbody Strake Count</span>
                  <span className="text-amber-400 font-bold">{config.groundEffectFloor.strakeCount} strakes</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  step={1}
                  value={config.groundEffectFloor.strakeCount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      groundEffectFloor: {
                        ...config.groundEffectFloor,
                        strakeCount: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeSubsystem === 'diffuser' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Diffuser Ramp Angle</span>
                  <span className="text-amber-400 font-bold">{config.diffuser.rampAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={24}
                  step={0.5}
                  value={config.diffuser.rampAngleDeg}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      diffuser: { ...config.diffuser, rampAngleDeg: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Diffuser Strake Count</span>
                  <span className="text-amber-400 font-bold">{config.diffuser.strakeCount}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={1}
                  value={config.diffuser.strakeCount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      diffuser: { ...config.diffuser, strakeCount: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Diffuser Exit Height</span>
                  <span className="text-amber-400 font-bold">{config.diffuser.exitHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={450}
                  step={10}
                  value={config.diffuser.exitHeightMm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      diffuser: { ...config.diffuser, exitHeightMm: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeSubsystem === 'sidepod' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Undercut Channel Depth</span>
                  <span className="text-amber-400 font-bold">{config.sidepod.undercutDepthMm} mm</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={250}
                  step={5}
                  value={config.sidepod.undercutDepthMm}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sidepod: { ...config.sidepod, undercutDepthMm: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Radiator Inlet Area</span>
                  <span className="text-amber-400 font-bold">{config.sidepod.inletAreaM2.toFixed(2)} m²</span>
                </div>
                <input
                  type="range"
                  min={0.08}
                  max={0.35}
                  step={0.01}
                  value={config.sidepod.inletAreaM2}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sidepod: { ...config.sidepod, inletAreaM2: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Vortex Fences Count</span>
                  <span className="text-amber-400 font-bold">{config.sidepod.vortexFencesCount}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={config.sidepod.vortexFencesCount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sidepod: { ...config.sidepod, vortexFencesCount: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeSubsystem === 'canards' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Canard Tier Count</span>
                  <span className="text-amber-400 font-bold">{config.canards.tierCount} tiers</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={config.canards.tierCount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      canards: { ...config.canards, tierCount: Number(e.target.value) as 0 | 1 | 2 | 3 },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-100/80">Canard Incidence Angle</span>
                  <span className="text-amber-400 font-bold">{config.canards.incidenceDeg}°</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={config.canards.incidenceDeg}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      canards: { ...config.canards, incidenceDeg: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-amber-800/35 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Component Real-Time Telemetry Tile */}
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-800/30 space-y-2">
            <div className="text-[10px] font-mono uppercase text-amber-200/60">Local Aerodynamic Forces</div>
            {activeSubsystem === 'frontWing' && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-amber-300/50">Downforce</div>
                  <div className="text-amber-300 font-bold">{physics.components.frontWing.downforceN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Drag</div>
                  <div className="text-amber-400 font-bold">{physics.components.frontWing.dragN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Cl / Cd</div>
                  <div className="text-amber-100/80">{physics.components.frontWing.cl} / {physics.components.frontWing.cd}</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Area</div>
                  <div className="text-amber-100/80">{physics.components.frontWing.projectedAreaM2} m²</div>
                </div>
              </div>
            )}
            {activeSubsystem === 'rearWing' && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-amber-300/50">Downforce</div>
                  <div className="text-amber-300 font-bold">{physics.components.rearWing.downforceN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Drag</div>
                  <div className="text-amber-400 font-bold">{physics.components.rearWing.dragN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Cl / Cd</div>
                  <div className="text-amber-100/80">{physics.components.rearWing.cl} / {physics.components.rearWing.cd}</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Status</div>
                  <div className={physics.isRearWingStalled ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {physics.isRearWingStalled ? '⚠️ Stalled' : '✅ Attached'}
                  </div>
                </div>
              </div>
            )}
            {activeSubsystem === 'groundEffectFloor' && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-amber-300/50">Suction Force</div>
                  <div className="text-amber-300 font-bold">{physics.components.floor.downforceN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Drag</div>
                  <div className="text-amber-400 font-bold">{physics.components.floor.dragN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Porpoise Risk</div>
                  <div className={physics.porpoisingRiskPct > 50 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {physics.porpoisingRiskPct}%
                  </div>
                </div>
                <div>
                  <div className="text-amber-300/50">Area</div>
                  <div className="text-amber-100/80">{physics.components.floor.projectedAreaM2} m²</div>
                </div>
              </div>
            )}
            {activeSubsystem === 'diffuser' && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-amber-300/50">Downforce</div>
                  <div className="text-amber-300 font-bold">{physics.components.diffuser.downforceN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Drag</div>
                  <div className="text-amber-400 font-bold">{physics.components.diffuser.dragN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Flow State</div>
                  <div className={physics.isDiffuserStalled ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {physics.isDiffuserStalled ? '⚠️ Boundary Stall' : '✅ Laminar'}
                  </div>
                </div>
                <div>
                  <div className="text-amber-300/50">Cl</div>
                  <div className="text-amber-100/80">{physics.components.diffuser.cl}</div>
                </div>
              </div>
            )}
            {activeSubsystem === 'sidepod' && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-amber-300/50">Downforce</div>
                  <div className="text-amber-300 font-bold">{physics.components.sidepods.downforceN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Cooling Drag</div>
                  <div className="text-amber-400 font-bold">{physics.components.sidepods.dragN} N</div>
                </div>
              </div>
            )}
            {activeSubsystem === 'canards' && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-amber-300/50">Downforce</div>
                  <div className="text-amber-300 font-bold">{physics.components.canards.downforceN} N</div>
                </div>
                <div>
                  <div className="text-amber-300/50">Drag</div>
                  <div className="text-amber-400 font-bold">{physics.components.canards.dragN} N</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM TELEMETRY DOCK: VEHICLE DYNAMICS & LAP IMPACT */}
      <div className="p-3 bg-amber-900/40 border-t border-amber-800/30 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
        <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/30">
          <div className="text-[10px] font-mono text-amber-300/50 uppercase">Total Downforce</div>
          <div className="text-sm font-bold font-mono text-amber-300">{physics.totalDownforceN} N</div>
          <div className="text-[10px] font-mono text-amber-200/60">@{config.airspeedKmh} km/h</div>
        </div>

        <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/30">
          <div className="text-[10px] font-mono text-amber-300/50 uppercase">Aero Balance</div>
          <div className="text-sm font-bold font-mono text-emerald-400">
            {physics.aeroBalanceFrontPct}% F / {physics.aeroBalanceRearPct}% R
          </div>
          <div className="text-[10px] font-mono text-amber-200/60">CoP: {physics.centerOfPressureXM}m</div>
        </div>

        <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/30">
          <div className="text-[10px] font-mono text-amber-300/50 uppercase">Total Drag Force</div>
          <div className="text-sm font-bold font-mono text-amber-400">{physics.totalDragN} N</div>
          <div className="text-[10px] font-mono text-amber-200/60">Cd = {physics.totalCd}</div>
        </div>

        <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/30">
          <div className="text-[10px] font-mono text-amber-300/50 uppercase">L/D Efficiency</div>
          <div className="text-sm font-bold font-mono text-amber-400">{physics.liftToDragRatio.toFixed(2)}</div>
          <div className="text-[10px] font-mono text-amber-200/60">Lift / Drag Ratio</div>
        </div>

        <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/30">
          <div className="text-[10px] font-mono text-amber-300/50 uppercase">Cornering Grip</div>
          <div className="text-sm font-bold font-mono text-amber-300">{physics.lapSimulation.lateralGAt200Kmh} G</div>
          <div className="text-[10px] font-mono text-emerald-400 font-semibold">⚡ High Speed</div>
        </div>

        <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/30">
          <div className="text-[10px] font-mono text-amber-300/50 uppercase">Top Speed Potential</div>
          <div className="text-sm font-bold font-mono text-amber-50">{physics.lapSimulation.topSpeedKmh} km/h</div>
          <div className="text-[10px] font-mono text-amber-200/60">Power Equilibrium</div>
        </div>

        <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/30">
          <div className="text-[10px] font-mono text-amber-300/50 uppercase">Lap Time Impact</div>
          <div className={`text-sm font-bold font-mono ${physics.lapSimulation.lapTimeDeltaS < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {physics.lapSimulation.lapTimeDeltaS <= 0 ? '' : '+'}
            {physics.lapSimulation.lapTimeDeltaS.toFixed(2)} s
          </div>
          <div className="text-[10px] font-mono text-amber-200/60">GP Circuit Delta</div>
        </div>
      </div>
    </div>
  );
};

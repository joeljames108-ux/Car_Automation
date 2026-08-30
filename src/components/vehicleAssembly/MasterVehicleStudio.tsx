/**
 * ============================================================================
 * MASTER VEHICLE 3D STUDIO & WORKBENCH
 * ============================================================================
 * Unified photorealistic 3D vehicle engineering viewport with real-time
 * WebGL OrbitControls, exploded view slider, X-Ray mode, aerodynamic
 * streamlines, subsystem isolation, delta badges, and packaging alerts.
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Box,
  Layers,
  Wind,
  Eye,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Camera,
  Info,
  DollarSign,
  Gauge,
  Compass,
} from "lucide-react";
import { MasterVehicleStateEngine } from "../../sim/masterVehicleState/masterVehicleStateEngine";
import {
  MasterVehicleState,
  PhysicsStateDelta,
  VehicleSubsystemCategory,
} from "../../sim/masterVehicleState/masterVehicleTypes";
import { MasterVehicle3DAssembler } from "../../exterior3d/generators/masterVehicle3DAssembler";
import { AeroStreamlineParticleSystem } from "../../exterior3d/aerodynamics/AeroStreamlineParticleSystem";
import { SharedWebGLContextManager } from "../../engine3d/managers/SharedWebGLContextManager";

const MasterVehicleStudioInner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateEngine = useMemo(() => MasterVehicleStateEngine.getInstance(), []);

  const [state, setState] = useState<MasterVehicleState>(stateEngine.getState());
  const [lastDelta, setLastDelta] = useState<PhysicsStateDelta | null>(stateEngine.getLastDelta());
  const [explodedFactor, setExplodedFactor] = useState<number>(0.0);
  const [activeCategory, setActiveCategory] = useState<VehicleSubsystemCategory | "all">("all");
  const [xRayEnabled, setXRayEnabled] = useState<boolean>(false);
  const [streamlinesEnabled, setStreamlinesEnabled] = useState<boolean>(true);
  const [lightingMode, setLightingMode] = useState<"studio" | "cyberpunk" | "sunset">("studio");
  const [activeTab, setActiveTab] = useState<"quick_adjust" | "telemetry" | "packaging" | "bom">("quick_adjust");

  const assemblerRef = useRef<MasterVehicle3DAssembler | null>(null);
  const particleSystemRef = useRef<AeroStreamlineParticleSystem | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Subscribe to Master Vehicle State changes
  useEffect(() => {
    const unsubscribe = stateEngine.subscribe((newState, delta) => {
      setState({ ...newState });
      if (delta) setLastDelta(delta);
    });
    return unsubscribe;
  }, [stateEngine]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 580;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c12);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.2, 2.2, -4.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 18;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf0f2f8, 2.5);
    keyLight.position.set(6, 9, -6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8090a8, 1.2);
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc8ddf0, 1.5);
    rimLight.position.set(0, 7, 7);
    scene.add(rimLight);

    // Reflective Studio Floor Grid
    const grid = new THREE.GridHelper(24, 48, 0x3a4050, 0x12151a);
    grid.position.y = -0.01;
    scene.add(grid);

    // Assembler & Particle System
    const assembler = new MasterVehicle3DAssembler();
    assemblerRef.current = assembler;
    const vehicleGroup = assembler.assembleVehicle(state);
    scene.add(vehicleGroup);

    const particles = new AeroStreamlineParticleSystem();
    particleSystemRef.current = particles;
    scene.add(particles.getParticleGroup());

    let animationFrameId: number;
    const clock = new THREE.Clock();
    let isTabVisible = !document.hidden;

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isTabVisible) return;

      const deltaSec = clock.getDelta();
      controls.update();

      if (particles) {
        particles.update(deltaSec, state.aero);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      particleSystemRef.current?.dispose();
      assemblerRef.current?.dispose();
      SharedWebGLContextManager.safelyDisposeRenderer(renderer, container);
      SharedWebGLContextManager.disposeThreeScene(scene);
    };
  }, []);

  // Update vehicle 3D mesh on state change
  useEffect(() => {
    if (assemblerRef.current) {
      assemblerRef.current.dispose();
      assemblerRef.current.assembleVehicle(state);
      assemblerRef.current.getAttachmentGraph().setExplodedFactor(explodedFactor);
      assemblerRef.current.getAttachmentGraph().isolateCategory(activeCategory);
      assemblerRef.current.getAttachmentGraph().setXRayMode(xRayEnabled);
    }
  }, [state]);

  // Handle Exploded Factor change
  const handleExplodedChange = (factor: number) => {
    setExplodedFactor(factor);
    if (assemblerRef.current) {
      assemblerRef.current.getAttachmentGraph().setExplodedFactor(factor);
    }
  };

  // Handle Category Isolation
  const handleCategorySelect = (cat: VehicleSubsystemCategory | "all") => {
    setActiveCategory(cat);
    if (assemblerRef.current) {
      assemblerRef.current.getAttachmentGraph().isolateCategory(cat);
    }
  };

  // Handle X-Ray Mode
  const handleToggleXRay = () => {
    const next = !xRayEnabled;
    setXRayEnabled(next);
    if (assemblerRef.current) {
      assemblerRef.current.getAttachmentGraph().setXRayMode(next);
    }
  };

  // Handle Streamlines Visibility
  const handleToggleStreamlines = () => {
    const next = !streamlinesEnabled;
    setStreamlinesEnabled(next);
    if (particleSystemRef.current) {
      particleSystemRef.current.setVisible(next);
    }
  };

  // Camera View Shortcuts
  const setCameraPose = (pose: "iso" | "front" | "rear" | "side" | "top" | "engine") => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (pose) {
      case "iso":
        cam.position.set(4.2, 2.2, -4.8);
        ctrl.target.set(0, 0.4, 0);
        break;
      case "front":
        cam.position.set(0, 0.9, -5.2);
        ctrl.target.set(0, 0.4, -1.2);
        break;
      case "rear":
        cam.position.set(0, 1.2, 5.2);
        ctrl.target.set(0, 0.5, 1.2);
        break;
      case "side":
        cam.position.set(-6.2, 0.8, 0);
        ctrl.target.set(0, 0.4, 0);
        break;
      case "top":
        cam.position.set(0, 7.5, 0.1);
        ctrl.target.set(0, 0, 0);
        break;
      case "engine":
        cam.position.set(1.4, 1.6, 0.4);
        ctrl.target.set(0, 0.4, 0.3);
        break;
    }
  };

  const m = state.metrics;
  const cost = state.costAndBOM;
  const compat = state.compatibility;

  return (
    <div className="flex flex-col xl:flex-row gap-4 w-full h-full min-h-[720px] text-slate-100">
      {/* â”€â”€ 3D VIEWPORT CANVAS â”€â”€ */}
      <div className="flex-1 flex flex-col bg-base-950/90 rounded-3xl border border-base-800 overflow-hidden shadow-2xl backdrop-blur-xl relative">
        {/* Top Viewport Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-base-800/40 bg-base-900/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Box size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">{state.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                  v{state.version}.0 MODULAR 3D
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Master Vehicle Scene Graph & Multi-Physics Digital Twin</p>
            </div>
          </div>

          {/* Quick Camera Preset Buttons */}
          <div className="flex items-center gap-1 bg-base-950/80 p-1 rounded-xl border border-base-800">
            <button onClick={() => setCameraPose("iso")} className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-base-800/50 text-slate-700 dark:text-slate-300">
              3/4 Iso
            </button>
            <button onClick={() => setCameraPose("front")} className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-base-800/50 text-slate-700 dark:text-slate-300">
              Front
            </button>
            <button onClick={() => setCameraPose("side")} className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-base-800/50 text-slate-700 dark:text-slate-300">
              Side
            </button>
            <button onClick={() => setCameraPose("rear")} className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-base-800/50 text-slate-700 dark:text-slate-300">
              Diffuser
            </button>
            <button onClick={() => setCameraPose("engine")} className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-base-800/50 text-slate-700 dark:text-slate-300">
              Engine
            </button>
            <button onClick={() => setCameraPose("top")} className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-base-800/50 text-slate-700 dark:text-slate-300">
              Top
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Mount */}
        <div ref={containerRef} className="flex-1 w-full h-full min-h-[480px] relative cursor-grab active:cursor-grabbing">
          {/* Real-time Delta Change Floating Badge */}
          {lastDelta && (
            <div className="absolute top-4 left-4 z-10 p-3 rounded-2xl bg-base-900/90 border border-amber-400/50 shadow-2xl backdrop-blur-xl max-w-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Zap size={11} /> Parameter Delta
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{lastDelta.parameterName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {lastDelta.deltaDownforceN !== 0 && (
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-300">
                    <span>Downforce</span>
                    <span className="font-bold">{lastDelta.deltaDownforceN > 0 ? `+${lastDelta.deltaDownforceN} N` : `${lastDelta.deltaDownforceN} N`}</span>
                  </div>
                )}
                {lastDelta.deltaDragN !== 0 && (
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-300">
                    <span>Drag</span>
                    <span className="font-bold">{lastDelta.deltaDragN > 0 ? `+${lastDelta.deltaDragN} N` : `${lastDelta.deltaDragN} N`}</span>
                  </div>
                )}
                {lastDelta.deltaTopSpeedKmh !== 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-300">
                    <span>Top Speed</span>
                    <span className="font-bold">{lastDelta.deltaTopSpeedKmh > 0 ? `+${lastDelta.deltaTopSpeedKmh} km/h` : `${lastDelta.deltaTopSpeedKmh} km/h`}</span>
                  </div>
                )}
                {lastDelta.deltaLapTimeSec !== 0 && (
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-300">
                    <span>Ring Lap</span>
                    <span className="font-bold">{lastDelta.deltaLapTimeSec < 0 ? `${lastDelta.deltaLapTimeSec}s` : `+${lastDelta.deltaLapTimeSec}s`}</span>
                  </div>
                )}
                {lastDelta.deltaCostUSD !== 0 && (
                  <div className="flex items-center justify-between text-yellow-600 dark:text-yellow-300 col-span-2">
                    <span>BOM Cost</span>
                    <span className="font-bold">{lastDelta.deltaCostUSD > 0 ? `+$${lastDelta.deltaCostUSD}` : `-$${Math.abs(lastDelta.deltaCostUSD)}`}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Viewport Control Overlay (Exploded, X-Ray, Wind Tunnel) */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-base-900/90 border border-base-800 backdrop-blur-xl">
            {/* Exploded View Slider */}
            <div className="flex items-center gap-3 bg-base-950/80 px-3 py-1.5 rounded-xl border border-base-800">
              <Layers size={15} className="text-amber-500 dark:text-amber-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Exploded View:</span>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.05"
                value={explodedFactor}
                onChange={(e) => handleExplodedChange(parseFloat(e.target.value))}
                className="w-28 accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-300 w-8">{Math.round(explodedFactor * 100)}%</span>
            </div>

            {/* Viewport Feature Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleXRay}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  xRayEnabled
                    ? "bg-amber-500/30 text-amber-700 dark:text-amber-200 border border-amber-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-base-950/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-base-800"
                }`}
              >
                <Eye size={14} /> X-Ray Shell
              </button>

              <button
                onClick={handleToggleStreamlines}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  streamlinesEnabled
                    ? "bg-amber-500/30 text-amber-700 dark:text-amber-200 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "bg-base-950/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-base-800"
                }`}
              >
                <Wind size={14} /> Wind Tunnel Smoke
              </button>
            </div>
          </div>
        </div>

        {/* Subsystem Isolation Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-t border-base-800/50 bg-base-900/60 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">Isolate:</span>
          {(["all", "chassis", "powertrain", "suspension", "aero", "body_panels", "interior"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeCategory === cat
                  ? "bg-amber-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  : "bg-base-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-base-800/50"
              }`}
            >
              {cat === "all" ? "Entire Vehicle" : cat.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€ RIGHT ENGINEERING WORKBENCH â”€â”€ */}
      <div className="w-full xl:w-96 flex flex-col gap-3 shrink-0">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-base-950/80 rounded-2xl border border-base-800 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("quick_adjust")}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "quick_adjust" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Adjust
          </button>
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "telemetry" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Dynamics
          </button>
          <button
            onClick={() => setActiveTab("packaging")}
            className={`py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "packaging" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Packaging
            {compat.criticalErrorsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("bom")}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "bom" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            BOM & Cost
          </button>
        </div>

        {/* TAB 1: QUICK PARAMETRIC SLIDERS */}
        {activeTab === "quick_adjust" && (
          <div className="flex-1 flex flex-col gap-3 p-4 bg-base-950/90 rounded-3xl border border-base-800 backdrop-blur-xl overflow-y-auto max-h-[620px] custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Sliders size={14} /> Parametric Vehicle Controls
            </h3>

            {/* Rear Wing Angle */}
            <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rear Wing Angle</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{state.aero.rearWingAngleDeg}Â°</span>
              </div>
              <input
                type="range"
                min="0"
                max="28"
                step="1"
                value={state.aero.rearWingAngleDeg}
                onChange={(e) => stateEngine.updateAero({ rearWingAngleDeg: parseInt(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>0Â° (Low Drag)</span>
                <span>28Â° (Max Downforce)</span>
              </div>
            </div>

            {/* Turbo Boost */}
            <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Turbo Boost Pressure</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{state.powertrain.boostBar.toFixed(2)} bar</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.4"
                step="0.05"
                value={state.powertrain.boostBar}
                onChange={(e) => stateEngine.updatePowertrain({ boostBar: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                <span>0.4 bar (Street)</span>
                <span>2.4 bar (Qualifying)</span>
              </div>
            </div>

            {/* Front Splitter Extension */}
            <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Front Splitter Extension</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{state.aero.frontSplitterLengthMm} mm</span>
              </div>
              <input
                type="range"
                min="40"
                max="200"
                step="10"
                value={state.aero.frontSplitterLengthMm}
                onChange={(e) => stateEngine.updateAero({ frontSplitterLengthMm: parseInt(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Wheelbase Dimension */}
            <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Chassis Wheelbase</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{state.chassis.wheelbaseMm} mm</span>
              </div>
              <input
                type="range"
                min="2400"
                max="3100"
                step="20"
                value={state.chassis.wheelbaseMm}
                onChange={(e) => stateEngine.updateChassis({ wheelbaseMm: parseInt(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Front Track Width */}
            <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Front Track Width</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{state.chassis.frontTrackMm} mm</span>
              </div>
              <input
                type="range"
                min="1450"
                max="1780"
                step="10"
                value={state.chassis.frontTrackMm}
                onChange={(e) => stateEngine.updateChassis({ frontTrackMm: parseInt(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Paint Finish Selector */}
            <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Exterior Paint Finish</span>
              <div className="flex items-center gap-2">
                {[
                  { hex: "#ef4444", name: "Rosso Corsa" },
                  { hex: "#f59e0b", name: "Cyan Mist" },
                  { hex: "#10b981", name: "British Green" },
                  { hex: "#f59e0b", name: "Apex Gold" },
                  { hex: "#080c14", name: "Midnight Stealth" },
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => stateEngine.updateBodyPanels({ paintColorHex: color.hex })}
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-lg"
                    style={{
                      backgroundColor: color.hex,
                      borderColor: state.bodyPanels.paintColorHex === color.hex ? "#fbbf24" : "transparent",
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-PHYSICS DYNAMICS TELEMETRY */}
        {activeTab === "telemetry" && (
          <div className="flex-1 flex flex-col gap-3 p-4 bg-base-950/90 rounded-3xl border border-base-800 backdrop-blur-xl overflow-y-auto max-h-[620px] custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Activity size={14} /> Multi-Physics Telemetry
            </h3>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">0â€“100 km/h</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{m.zeroToHundredKmhSec}s</span>
              </div>
              <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Top Speed</span>
                <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{m.topSpeedKmh} km/h</span>
              </div>
              <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Peak Power</span>
                <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{m.peakHorsepowerHp} hp</span>
              </div>
              <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Curb Mass</span>
                <span className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200">{m.totalCurbMassKg} kg</span>
              </div>
              <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Downforce @ 160</span>
                <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-300">{m.downforceAt160KmhN} N</span>
              </div>
              <div className="p-3 rounded-2xl bg-base-900/60 border border-base-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Max Lateral G</span>
                <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{m.maxLateralAccelerationG} g</span>
              </div>
            </div>

            {/* Track Lap Times */}
            <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                <Compass size={14} className="text-amber-600 dark:text-amber-400" /> Virtual Track Lap Sim
              </span>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-base-800/40">
                  <span className="text-slate-500 dark:text-slate-400">NÃ¼rburgring Nordschleife</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{Math.floor(m.nurburgringNordschleifeLapSec / 60)}:{String(Math.floor(m.nurburgringNordschleifeLapSec % 60)).padStart(2, "0")}.{Math.round((m.nurburgringNordschleifeLapSec % 1) * 10)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-base-800/40">
                  <span className="text-slate-500 dark:text-slate-400">Spa-Francorchamps</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{Math.floor(m.spaFrancorchampsLapSec / 60)}:{String(Math.floor(m.spaFrancorchampsLapSec % 60)).padStart(2, "0")}.{Math.round((m.spaFrancorchampsLapSec % 1) * 10)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 dark:text-slate-400">Silverstone GP</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{Math.floor(m.silverstoneGPLapSec / 60)}:{String(Math.floor(m.silverstoneGPLapSec % 60)).padStart(2, "0")}.{Math.round((m.silverstoneGPLapSec % 1) * 10)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PACKAGING & COMPATIBILITY ENGINE */}
        {activeTab === "packaging" && (
          <div className="flex-1 flex flex-col gap-3 p-4 bg-base-950/90 rounded-3xl border border-base-800 backdrop-blur-xl overflow-y-auto max-h-[620px] custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Packaging Rule Engine
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  compat.isPhysicallyFeasible
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40"
                    : "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40"
                }`}
              >
                {compat.isPhysicallyFeasible ? "Feasible Build" : `${compat.criticalErrorsCount} Critical Conflicts`}
              </span>
            </div>

            {compat.violations.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-200">100% Engineering Compatibility</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">All mechanical clearances, torque envelopes, and thermal loads are within valid physical tolerances.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {compat.violations.map((v) => (
                  <div
                    key={v.id}
                    className={`p-3 rounded-2xl border ${
                      v.severity === "critical_error"
                        ? "bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-200"
                        : "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                      <AlertTriangle size={13} /> {v.title}
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 mb-2">{v.explanation}</p>
                    <div className="p-2 rounded-xl bg-base-950/60 border border-base-800 text-[10px] text-amber-700 dark:text-amber-300">
                      <span className="font-bold">Actionable Remedy:</span> {v.remedySuggestion}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BILL OF MATERIALS & COST */}
        {activeTab === "bom" && (
          <div className="flex-1 flex flex-col gap-3 p-4 bg-base-950/90 rounded-3xl border border-base-800 backdrop-blur-xl overflow-y-auto max-h-[620px] custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <DollarSign size={14} /> Bill of Materials & CapEx
            </h3>

            <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 space-y-1">
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase">Estimated Manufacturing Cost</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">${cost.totalManufacturingCostUSD.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Suggested MSRP: ${cost.suggestedMSRPUSD.toLocaleString()}</span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-base-800/40 text-slate-700 dark:text-slate-300">
                <span>Chassis Structure</span>
                <span>${cost.chassisCapExUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-800/40 text-slate-700 dark:text-slate-300">
                <span>Powertrain Engine</span>
                <span>${cost.powertrainCapExUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-800/40 text-slate-700 dark:text-slate-300">
                <span>Transmission</span>
                <span>${cost.transmissionCapExUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-800/40 text-slate-700 dark:text-slate-300">
                <span>Suspension & Brakes</span>
                <span>${cost.suspensionWheelsUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-800/40 text-slate-700 dark:text-slate-300">
                <span>Aero Package</span>
                <span>${cost.aeroPackageUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-base-800/40 text-slate-700 dark:text-slate-300">
                <span>Interior Cabin</span>
                <span>${cost.interiorCabinUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
                <span>Assembly Labor</span>
                <span>${cost.assemblyLaborUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MasterVehicleStudio = React.memo(MasterVehicleStudioInner);
export default MasterVehicleStudio;


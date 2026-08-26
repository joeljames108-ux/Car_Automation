/**
 * ============================================================================
 * GRAND AUTOMOTIVE ENGINEERING STUDIO — 3D TRANSMISSION & TRANSAXLE WORKSHOP
 * ============================================================================
 * Master WebGL 3D interactive viewport and simulation workbench for transmissions:
 * - 5 Transmission Architectures (DCT, Manual, Sequential GT3, EV e-Axle, CVT)
 * - 60fps Live Shaft & Gear Rotation Simulation with gear ratio mechanics
 * - Interactive Gear Selector (P / R / N / D / Gears 1 to 8) with shift dynamics
 * - Exploded View Slider (0% to 100%) & Translucent X-Ray Casing Mode
 * - 6 Precision Camera Presets (ISO, Bellhousing, Gearsets, Mechatronics, LSD, Macro)
 * - Real-Time Telemetry: Input/Output RPM, Torque, Clutch Pressure, Fluid Temp, Shift Time
 * - Gear Ratio & Differential Metallurgy Customizer
 * ============================================================================
 */

import React, { useEffect, useRef, useState, memo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Cog,
  Sliders,
  Eye,
  RotateCw,
  Maximize2,
  Activity,
  Flame,
  Zap,
  Layers,
  Sparkles,
  Shield,
  Gauge,
  Compass,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX,
  Award,
  ZapOff,
} from "lucide-react";
import type { TransmissionType, EngineConfig, SimResult } from "../../sim/types";
import type {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../sim/assemblyTypes";
import { MaterialGradePicker } from "../assembly/MaterialGradePicker";
import { InstallButton } from "../assembly/InstallButton";
import {
  buildTransaxleGroup,
  updateTransaxleExplodedView,
  animateTransaxleRotation,
} from "../../engine3d/generators/transaxleGenerator";
import { globalMaterialLibrary } from "../../engine3d/materials/pbrMaterialSystem";

export type TransmissionArchitecture = "dct_7" | "manual_6" | "seq_7" | "single_speed" | "cvt";

export interface GearRatioConfig {
  gear1: number;
  gear2: number;
  gear3: number;
  gear4: number;
  gear5: number;
  gear6: number;
  gear7: number;
  gear8: number;
  finalDrive: number;
}

export interface Transmission3DStudioProps {
  engineConfig?: EngineConfig;
  sim?: SimResult;
  updateEngine?: (updates: Partial<EngineConfig>) => void;
  isEmbedded?: boolean;
  componentMeta?: AssemblyComponentMeta;
  selectedVariant?: MaterialGrade;
  onSelectVariant?: (variant: MaterialGrade) => void;
  isInstalled?: boolean;
  isInstalling?: boolean;
  canInstall?: boolean;
  phase?: AssemblyPhase;
  currentTotalStats?: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  onInstall?: () => void;
  onSkipAnimation?: () => void;
  onNext?: () => void;
}

const DEFAULT_GEAR_RATIOS: Record<TransmissionArchitecture, GearRatioConfig> = {
  dct_7: { gear1: 3.82, gear2: 2.36, gear3: 1.68, gear4: 1.28, gear5: 1.02, gear6: 0.84, gear7: 0.67, gear8: 0.55, finalDrive: 3.44 },
  manual_6: { gear1: 3.50, gear2: 2.06, gear3: 1.41, gear4: 1.10, gear5: 0.91, gear6: 0.75, gear7: 0.65, gear8: 0.55, finalDrive: 3.73 },
  seq_7: { gear1: 3.18, gear2: 2.24, gear3: 1.76, gear4: 1.45, gear5: 1.22, gear6: 1.05, gear7: 0.92, gear8: 0.80, finalDrive: 3.90 },
  single_speed: { gear1: 9.60, gear2: 9.60, gear3: 9.60, gear4: 9.60, gear5: 9.60, gear6: 9.60, gear7: 9.60, gear8: 9.60, finalDrive: 1.00 },
  cvt: { gear1: 2.60, gear2: 2.10, gear3: 1.60, gear4: 1.20, gear5: 0.90, gear6: 0.70, gear7: 0.55, gear8: 0.45, finalDrive: 4.10 },
};

const Transmission3DStudioComponent: React.FC<Transmission3DStudioProps> = ({
  engineConfig,
  sim,
  updateEngine,
  isEmbedded = false,
  componentMeta,
  selectedVariant,
  onSelectVariant,
  isInstalled = false,
  isInstalling = false,
  canInstall = true,
  phase = "idle",
  currentTotalStats,
  onInstall,
  onSkipAnimation,
  onNext,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [archType, setArchType] = useState<TransmissionArchitecture>("dct_7");
  const [currentGear, setCurrentGear] = useState<number>(1);
  const [simRpm, setSimRpm] = useState<number>(
    engineConfig?.redline ? Math.round(engineConfig.redline * 0.65) : 4500
  );
  const [engineTorqueNm, setEngineTorqueNm] = useState<number>(
    sim?.peakTorque ? Math.round(sim.peakTorque) : 650
  );
  const [explodedProgress, setExplodedProgress] = useState<number>(0.0);
  const [xRayMode, setXRayMode] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [activeCameraPose, setActiveCameraPose] = useState<string>("iso_wide");
  const [activeTab, setActiveTab] = useState<"shifter" | "ratios" | "metallurgy" | "telemetry">("shifter");

  // Gear Ratios & Differential Settings
  const [ratios, setRatios] = useState<GearRatioConfig>(DEFAULT_GEAR_RATIOS.dct_7);
  const [lsdType, setLsdType] = useState<"open" | "viscous" | "mechanical_ramp" | "e_lsd">("e_lsd");
  const [clutchType, setClutchType] = useState<"organic" | "sintered_metallic" | "carbon_multi_plate">("carbon_multi_plate");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transGroupRef = useRef<THREE.Group | null>(null);

  // Target vectors for smooth camera lerp
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(1.8, 0.9, 1.4));
  const targetCtrlTarget = useRef<THREE.Vector3>(new THREE.Vector3(0.1, 0, 0));

  // Sync default gear ratios on architecture change
  const handleArchChange = (newArch: TransmissionArchitecture) => {
    setArchType(newArch);
    setRatios(DEFAULT_GEAR_RATIOS[newArch]);
    setCurrentGear(newArch === "single_speed" ? 1 : 1);
  };

  // Get current active gear ratio
  const getActiveGearRatio = (): number => {
    if (archType === "single_speed") return ratios.gear1;
    const gearKeys: (keyof GearRatioConfig)[] = ["gear1", "gear2", "gear3", "gear4", "gear5", "gear6", "gear7", "gear8"];
    const key = gearKeys[Math.min(currentGear - 1, gearKeys.length - 1)];
    return ratios[key] || 1.0;
  };

  const activeRatio = getActiveGearRatio();
  const outputRpm = Math.round(simRpm / activeRatio);
  const outputTorqueNm = Math.round(engineTorqueNm * activeRatio * ratios.finalDrive);
  const shiftTimeMs = archType === "dct_7" ? 45 : archType === "seq_7" ? 35 : archType === "single_speed" ? 0 : archType === "cvt" ? 80 : 160;
  const clutchPressureBar = archType === "single_speed" ? 0 : archType === "dct_7" ? 19.5 : archType === "seq_7" ? 22.0 : 12.0;

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(1.8, 0.9, 1.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 0.8;
    controls.maxDistance = 6.0;
    controls.target.set(0.1, 0, 0);
    controlsRef.current = controls;

    // Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 0.8);
    scene.add(hemiLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 4.0, 12, Math.PI / 4, 0.3, 1);
    mainSpot.position.set(1.5, 2.5, 2.0);
    mainSpot.castShadow = true;
    scene.add(mainSpot);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rimLight.position.set(-2.0, 1.5, -2.0);
    scene.add(rimLight);

    // Reflective Studio Floor Grid
    const grid = new THREE.GridHelper(10, 20, 0x06b6d4, 0x1e293b);
    grid.position.y = -0.24;
    scene.add(grid);

    // Animation Loop with Tab Visibility Suspension
    let animId: number;
    let prevTime = performance.now();
    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      if (document.hidden) return;

      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      // Smooth Camera & Target Lerp
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.08);
        controlsRef.current.target.lerp(targetCtrlTarget.current, 0.08);
      }

      // Rotate Transmission Internal Shafts & Gears
      if (transGroupRef.current && isRotating) {
        animateTransaxleRotation(transGroupRef.current, dt, simRpm, activeRatio);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate(performance.now());

    const handleVisibilityChange = () => {
      if (!document.hidden && renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Re-build 3D Transmission Group on Architecture / X-Ray Change
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (transGroupRef.current) {
      scene.remove(transGroupRef.current);
    }

    const transGroup = buildTransaxleGroup(archType as TransmissionType);
    transGroupRef.current = transGroup;

    // Apply X-Ray Translucent Acrylic Casing if enabled
    if (xRayMode) {
      transGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.parent && mesh.parent.name.includes("Casing")) {
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0x38bdf8,
              transparent: true,
              opacity: 0.25,
              roughness: 0.1,
              transmission: 0.85,
              ior: 1.45,
            });
          }
        }
      });
    }

    // Apply active exploded view progress
    updateTransaxleExplodedView(transGroup, explodedProgress);
    scene.add(transGroup);
  }, [archType, xRayMode]);

  // Update Exploded View Progress
  useEffect(() => {
    if (transGroupRef.current) {
      updateTransaxleExplodedView(transGroupRef.current, explodedProgress);
    }
  }, [explodedProgress]);

  // Camera Preset Poses
  const setCameraPose = (pose: string) => {
    setActiveCameraPose(pose);
    switch (pose) {
      case "iso_wide":
        targetCamPos.current.set(1.8, 0.9, 1.4);
        targetCtrlTarget.current.set(0.1, 0, 0);
        break;
      case "bellhousing":
        targetCamPos.current.set(-0.45, 0.45, 0.35);
        targetCtrlTarget.current.set(-0.16, 0, 0);
        break;
      case "gearsets":
        targetCamPos.current.set(0.15, 0.45, 0.45);
        targetCtrlTarget.current.set(0.10, 0, 0.04);
        break;
      case "mechatronics":
        targetCamPos.current.set(0.16, 0.65, 0.35);
        targetCtrlTarget.current.set(0.16, 0, 0.18);
        break;
      case "differential":
        targetCamPos.current.set(0.65, 0.45, -0.45);
        targetCtrlTarget.current.set(0.36, 0, -0.02);
        break;
      case "macro_teeth":
        targetCamPos.current.set(0.08, 0.22, 0.12);
        targetCtrlTarget.current.set(0.04, 0, 0.04);
        break;
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4 font-mono text-slate-100 select-none">
      {/* Top Header & Architecture Selector Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Cog size={22} className="animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <span>3D TRANSMISSION & TRANSAXLE WORKSHOP</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                PHYSICS SIMULATOR
              </span>
            </h2>
            <p className="text-xs text-cyan-400/80">
              Interactive 3D mechanical gearsets, clutch engagement, mechatronics solenoids & gear ratios
            </p>
          </div>
        </div>

        {/* 5 Architecture Type Selection Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
          {[
            { id: "dct_7", label: "7-Speed DCT" },
            { id: "manual_6", label: "6-Speed Manual" },
            { id: "seq_7", label: "GT3 Sequential" },
            { id: "single_speed", label: "EV e-Axle" },
            { id: "cvt", label: "CVT Pulley" },
          ].map((arch) => (
            <button
              key={arch.id}
              onClick={() => handleArchChange(arch.id as TransmissionArchitecture)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                archType === arch.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {arch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: 3D Interactive WebGL Transmission Viewport (7 Columns) */}
        <div className="xl:col-span-7 flex flex-col space-y-3">
          <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col">
            {/* WebGL Canvas */}
            <div ref={containerRef} className="w-full flex-1" />

            {/* Top HUD Overlay Controls */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              {/* Active Specs Badge */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md pointer-events-auto">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">{archType.toUpperCase()} TRANSAXLE</div>
                  <div className="text-[10px] text-cyan-400">
                    Ratio: {activeRatio.toFixed(2)}:1 • Output: {outputRpm} RPM • {outputTorqueNm.toLocaleString()} N·m
                  </div>
                </div>
              </div>

              {/* Camera Presets Quick Bar */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/85 border border-slate-700/60 backdrop-blur-md pointer-events-auto">
                {[
                  { id: "iso_wide", label: "ISO Wide" },
                  { id: "bellhousing", label: "Clutch" },
                  { id: "gearsets", label: "Gears" },
                  { id: "mechatronics", label: "Valve Body" },
                  { id: "differential", label: "Differential" },
                  { id: "macro_teeth", label: "Macro 🔍" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCameraPose(c.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeCameraPose === c.id
                        ? "bg-cyan-500 text-slate-950 shadow-md"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Interactive Inspection Controls Bar */}
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
              {/* Exploded View Slider */}
              <div className="flex items-center gap-3 min-w-[220px] flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Maximize2 size={14} />
                  <span>EXPLODED VIEW</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedProgress}
                  onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-cyan-400 font-bold min-w-[36px]">
                  {Math.round(explodedProgress * 100)}%
                </span>
              </div>

              {/* X-Ray Mode Toggle */}
              <button
                onClick={() => setXRayMode((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  xRayMode
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <Eye size={14} />
                <span>X-RAY CASING</span>
              </button>

              {/* Gear Rotation Animation Toggle */}
              <button
                onClick={() => setIsRotating((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isRotating
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <RotateCw size={14} className={isRotating ? "animate-spin-slow" : ""} />
                <span>{isRotating ? "ROTATING 60FPS" : "PAUSED"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Interactive Shifter Workbench (5 Columns) */}
        <div className="xl:col-span-5 h-[580px] rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Tab Navigation Header */}
          <div className="flex items-center gap-1.5 p-2.5 bg-slate-900/60 border-b border-slate-800">
            {[
              { id: "shifter", label: "GEAR SHIFTER & RPM", icon: Gauge },
              { id: "ratios", label: "RATIOS & FINAL DRIVE", icon: Sliders },
              { id: "metallurgy", label: "CLUTCH & LSD", icon: Shield },
              { id: "telemetry", label: "HYDRAULIC TELEMETRY", icon: Activity },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <Icon size={14} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Deck */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
            {/* ── TAB 1: GEAR SHIFTER & RPM SIMULATOR ── */}
            {activeTab === "shifter" && (
              <div className="space-y-4">
                {/* Live Gear Selector Buttons */}
                <div>
                  <label className="text-slate-300 font-bold mb-2 block flex items-center justify-between">
                    <span>SELECT GEAR POSITION</span>
                    <span className="text-cyan-400">SHIFT TIME: {shiftTimeMs}ms</span>
                  </label>

                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                      <button
                        key={g}
                        onClick={() => setCurrentGear(g)}
                        className={`p-3 rounded-xl text-center border font-extrabold text-sm transition-all cursor-pointer ${
                          currentGear === g
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-102"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-500/50"
                        }`}
                      >
                        GEAR {g}
                        <div className="text-[9px] text-slate-400 font-normal mt-0.5">
                          {((DEFAULT_GEAR_RATIOS[archType] as any)[`gear${g}`] || 1.0).toFixed(2)}:1
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine Input RPM Slider */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-300">ENGINE INPUT RPM</span>
                    <span className="text-amber-400 text-sm">{simRpm} RPM</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="9000"
                    step="100"
                    value={simRpm}
                    onChange={(e) => setSimRpm(parseInt(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Idle (1,000 RPM)</span>
                    <span>Peak Power (6,500 RPM)</span>
                    <span>Redline (9,000 RPM)</span>
                  </div>
                </div>

                {/* Engine Torque Slider */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-300">ENGINE FLYWHEEL TORQUE</span>
                    <span className="text-emerald-400 text-sm">{engineTorqueNm} N·m</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1500"
                    step="50"
                    value={engineTorqueNm}
                    onChange={(e) => setEngineTorqueNm(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>200 N·m</span>
                    <span>650 N·m (GT3)</span>
                    <span>1,500 N·m (Hypercar)</span>
                  </div>
                </div>

                {/* Key Telemetry Tiles */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">OUTPUT SHAFT RPM</div>
                    <div className="text-base font-extrabold text-cyan-300 mt-1">{outputRpm} RPM</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">WHEEL TORQUE</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-1">{outputTorqueNm.toLocaleString()} N·m</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: GEAR RATIOS & FINAL DRIVE ── */}
            {activeTab === "ratios" && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span>INDIVIDUAL GEAR RATIO SPECS</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Top Speed at 7,200 RPM</span>
                </div>

                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => {
                  const key = `gear${g}` as keyof GearRatioConfig;
                  const ratioVal = ratios[key];
                  const totalRatio = ratioVal * ratios.finalDrive;
                  const wheelRps = (7200 / 60) / totalRatio;
                  const topSpeedKmh = Math.round(wheelRps * 2 * Math.PI * 0.33 * 3.6);

                  return (
                    <div key={g} className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="w-16 font-bold text-slate-300">Gear {g}</span>
                      <input
                        type="range"
                        min="0.4"
                        max="4.5"
                        step="0.05"
                        value={ratioVal}
                        onChange={(e) => setRatios({ ...ratios, [key]: parseFloat(e.target.value) })}
                        className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <span className="w-14 text-right font-bold text-cyan-400">{ratioVal.toFixed(2)}:1</span>
                      <span className="w-20 text-right font-mono font-bold text-emerald-400 text-xs">{topSpeedKmh} km/h</span>
                    </div>
                  );
                })}

                {/* Final Drive Ratio */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 pt-3">
                  <span className="w-24 font-bold text-cyan-300">Final Drive</span>
                  <input
                    type="range"
                    min="2.5"
                    max="5.2"
                    step="0.05"
                    value={ratios.finalDrive}
                    onChange={(e) => setRatios({ ...ratios, finalDrive: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="w-14 text-right font-bold text-cyan-300">{ratios.finalDrive.toFixed(2)}:1</span>
                </div>

                {/* Velocity Staircase Chart */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase">Velocity Staircase Map (Gears 1-8)</div>
                  <div className="h-24 flex items-end gap-1.5 pt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => {
                      const key = `gear${g}` as keyof GearRatioConfig;
                      const ratioVal = ratios[key];
                      const totalRatio = ratioVal * ratios.finalDrive;
                      const wheelRps = (7200 / 60) / totalRatio;
                      const topSpeedKmh = Math.round(wheelRps * 2 * Math.PI * 0.33 * 3.6);
                      const maxSpeed = 420;
                      const heightPct = Math.min(100, Math.max(10, (topSpeedKmh / maxSpeed) * 100));

                      return (
                        <div key={g} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="text-[9px] font-mono text-cyan-300">{topSpeedKmh}</div>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t transition-all ${
                              currentGear === g ? "bg-gradient-to-t from-cyan-500 to-sky-400 ring-1 ring-cyan-300" : "bg-slate-700 hover:bg-slate-600"
                            }`}
                          />
                          <div className="text-[9px] font-bold text-slate-400">G{g}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: CLUTCH & DIFFERENTIAL METALLURGY ── */}
            {activeTab === "metallurgy" && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 font-bold mb-2 block">CLUTCH FRICTION DISCS COMPOUND</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "organic", name: "Organic Fiber", friction: "0.38 µ", torque: "650 N·m" },
                      { id: "sintered_metallic", name: "Sintered Metallic", friction: "0.48 µ", torque: "1100 N·m" },
                      { id: "carbon_multi_plate", name: "3-Plate Carbon-Carbon", friction: "0.58 µ", torque: "1800 N·m" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setClutchType(c.id as any)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          clutchType === c.id
                            ? "bg-amber-950/50 border-amber-400 text-amber-300 shadow-md"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="font-bold">{c.name}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{c.friction} • Max: {c.torque}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-2 block">DIFFERENTIAL ARCHITECTURE & LSD LOCK</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "open", name: "Open Differential", lock: "0% Lockup" },
                      { id: "viscous", name: "Viscous LSD", lock: "35% Lockup" },
                      { id: "mechanical_ramp", name: "Multi-Plate Ramp LSD", lock: "75% Lockup" },
                      { id: "e_lsd", name: "Electronic Vectoring e-LSD", lock: "0-100% Active" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setLsdType(d.id as any)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          lsdType === d.id
                            ? "bg-cyan-950/50 border-cyan-400 text-cyan-300 shadow-md"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="font-bold">{d.name}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{d.lock}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Component Material Metallurgy Grade Picker if available */}
                {componentMeta && selectedVariant && onSelectVariant && (
                  <div className="pt-3 border-t border-slate-800">
                    <label className="text-slate-300 font-bold mb-2 block flex items-center justify-between">
                      <span>GEARSET & BELLHOUSING METALLURGY GRADE</span>
                      <span className="text-[10px] text-cyan-400 font-normal">Stage #14 Specification</span>
                    </label>
                    <MaterialGradePicker
                      variants={componentMeta.variants}
                      selectedVariant={selectedVariant}
                      onSelectVariant={onSelectVariant}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: HYDRAULIC & THERMAL TELEMETRY ── */}
            {activeTab === "telemetry" && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase">TRANSMISSION HYDRAULICS & THERMAL TELEMETRY</div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">MECHATRONICS HYDRAULIC PRESSURE</div>
                    <div className="text-lg font-extrabold text-cyan-300 mt-1">{clutchPressureBar.toFixed(1)} bar</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">TRANSMISSION FLUID TEMP</div>
                    <div className="text-lg font-extrabold text-amber-400 mt-1">94.2 °C</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">GEAR SHIFT DURATION</div>
                    <div className="text-lg font-extrabold text-emerald-400 mt-1">{shiftTimeMs} ms</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">MECHANICAL EFFICIENCY</div>
                    <div className="text-lg font-extrabold text-purple-400 mt-1">97.4%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Stage 14 Installation Action Button */}
      {isEmbedded && onInstall && (
        <div className="pt-2">
          <InstallButton
            componentId="transmission"
            componentName="Transmission & Bellhousing Assembly"
            isInstalled={isInstalled}
            isInstalling={isInstalling}
            canInstall={canInstall}
            phase={phase}
            onInstall={onInstall}
            onSkipAnimation={onSkipAnimation}
            onNext={onNext}
          />
        </div>
      )}
    </div>
  );
};

export const Transmission3DStudio = memo(Transmission3DStudioComponent);


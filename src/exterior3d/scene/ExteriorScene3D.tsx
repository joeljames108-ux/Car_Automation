// =============================================================================
// EXTERIOR 3D SCENE - INTEGRATED CHASSIS & BODY FRAMEWORK GLB STUDIO
// =============================================================================
// Supports dual visual workflows:
// 1. "CHASSIS & BODY FRAMEWORK" CAD mode:
//    Loads the specific vehicle category's discrete GLB assets:
//    - Sedan: /models/vehicles/sedan/chassis.glb + body-framework.glb
//    - Hatchback: /models/vehicles/hatchback/chassis.glb + body-framework.glb
//    - Cross: /models/vehicles/crossover/chassis.glb + body-framework.glb
//    - SUV: /models/vehicles/suv/chassis.glb + body-framework.glb
//    Includes layer visibility toggles, exploded view kinematics, and X-ray mode.
// 2. "FINISHED EXTERIOR STYLING" mode:
//    Renders complete production body models with PBR paint booth and turntable.
// =============================================================================

import React, { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, MeshReflectorMaterial } from "@react-three/drei";
import { GlbCarModel, type PaintFinishType } from "./GlbCarModel";
import { CAR_MODEL_REGISTRY, TIER_LABELS, type CarModelEntry } from "./carModelRegistry";
import {
  DedicatedArchitectureGlbViewer,
  type ArchitectureLayerToggles,
} from "./DedicatedArchitectureGlbViewer";
import { useVehicleArchitectureStore } from "../../state/useVehicleArchitectureStore";
import { useExteriorAssemblyStore } from "../../state/useExteriorAssemblyStore";
import { VehicleCategory } from "../../sim/vehicleArchitecture/vehicleArchitectureTypes";
import {
  Layers,
  Sparkles,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  Box,
  Car,
  Shield,
  Maximize2,
  Wrench,
  CheckCircle2,
} from "lucide-react";

const CarLoadingFallback: React.FC = () => {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const iv = setInterval(() => setDots((p) => (p.length >= 3 ? "" : p + ".")), 400);
    return () => clearInterval(iv);
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1208" roughness={0.15} metalness={0.5} />
      </mesh>
      <gridHelper args={[4, 40, "#1a1508", "#0d0a06"]} position={[0, -0.099, 0]} />
      <group position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.008, 8, 64]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
};

// Camera presets: name -> [position, target, fov]
const CAMERA_PRESETS: Record<string, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  orbit: { pos: [3.8, 2.2, 3.8], target: [0, 0.3, 0], fov: 42 },
  front: { pos: [0, 1.0, 4.5], target: [0, 0.3, 0], fov: 38 },
  rear: { pos: [0, 1.2, -4.5], target: [0, 0.3, 0], fov: 38 },
  side: { pos: [4.5, 0.8, 0], target: [0, 0.3, 0], fov: 36 },
  low: { pos: [2.5, 0.3, 2.5], target: [0, 0.5, 0], fov: 45 },
  top: { pos: [0, 6.0, 0.1], target: [0, 0, 0], fov: 50 },
};

const PAINT_FINISHES: { id: PaintFinishType; label: string; icon: string }[] = [
  { id: "metallic", label: "Metallic", icon: "✨" },
  { id: "gloss", label: "Gloss", icon: "💎" },
  { id: "matte", label: "Matte", icon: "🌫️" },
  { id: "satin", label: "Satin", icon: "🪞" },
  { id: "chameleon", label: "Chameleon", icon: "🦎" },
];

const PALETTE = [
  0xd97706, // Amber gold (default chassis framework accent)
  0xcc0000, // Racing red
  0x0044cc, // Electric blue
  0xffffff, // Alpine white
  0x111111, // Stealth black
  0x800080, // Royal purple
  0x2d5016, // British racing green
  0xff8800, // Papaya orange
  0x003366, // Deep navy
  0xffd700, // Titanium gold
  0x00ff88, // Mint neon
  0x0066cc, // Azure blue
];

const VEHICLE_CATEGORIES: { id: VehicleCategory; label: string; icon: string; shortTag: string }[] = [
  { id: "sedan", label: "Sedan", icon: "🚗", shortTag: "3-Box" },
  { id: "hatchback", label: "Hatchback", icon: "🏎️", shortTag: "2-Box" },
  { id: "crossover", label: "Cross", icon: "🚙", shortTag: "AWD" },
  { id: "suv", label: "SUV", icon: "🚐", shortTag: "Heavy-Duty" },
];

export const ExteriorScene3D: React.FC = () => {
  // Sync with Vehicle Architecture Store
  const selectedCategory = useVehicleArchitectureStore((s) => s.selectedCategory);
  const selectCategory = useVehicleArchitectureStore((s) => s.selectCategory);
  const architecture = useVehicleArchitectureStore((s) => s.architecture);
  const setExteriorCategory = useExteriorAssemblyStore((s) => s.setVehicleCategory);

  // Studio Display Mode: "framework_chassis" (default) or "finished_body"
  const [studioMode, setStudioMode] = useState<"framework_chassis" | "finished_body">("framework_chassis");

  // Layer Visibility for dedicated GLB architecture
  const [layers, setLayers] = useState<ArchitectureLayerToggles>({
    chassis: true,
    bodyFramework: true,
    floor: true,
    wheelArches: true,
    hardpoints: false,
    envelopes: false,
  });

  // Exploded View & X-Ray State
  const [explodedProgress, setExplodedProgress] = useState<number>(0);
  const [isXRay, setIsXRay] = useState<boolean>(false);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Styling & Paint state
  const [selectedId, setSelectedId] = useState("bmw_i8");
  const [paintColor, setPaintColor] = useState(0xd97706);
  const [paintFinish, setPaintFinish] = useState<PaintFinishType>("metallic");
  const [cameraPreset, setCameraPreset] = useState("orbit");
  const [autoRotate, setAutoRotate] = useState(false);
  const [turntableSpeed, setTurntableSpeed] = useState(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sync category on mount or change
  useEffect(() => {
    setExteriorCategory(selectedCategory);
  }, [selectedCategory, setExteriorCategory]);

  const handleCategorySwitch = (cat: VehicleCategory) => {
    selectCategory(cat);
    setExteriorCategory(cat);
  };

  const toggleLayer = (layerKey: keyof ArchitectureLayerToggles) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const model = CAR_MODEL_REGISTRY.find((m) => m.id === selectedId) || CAR_MODEL_REGISTRY[0];
  const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.orbit;

  const handleSelectModel = (entry: CarModelEntry) => {
    setSelectedId(entry.id);
    setPaintColor(entry.defaultPaint);
    setPaintFinish((entry.paintFinish as PaintFinishType) || "metallic");
    setDropdownOpen(false);
  };

  const tierGroups = useMemo(
    () =>
      CAR_MODEL_REGISTRY.reduce<Record<string, CarModelEntry[]>>((acc, m) => {
        (acc[m.tier] = acc[m.tier] || []).push(m);
        return acc;
      }, {}),
    []
  );

  return (
    <div className="w-full h-full relative select-none">
      {/* =====================================================================
          1. TOP-LEFT HUD: PLATFORM SELECTOR & STUDIO MODE SWITCHER
          ===================================================================== */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-2 pointer-events-auto">
        {/* Dual Mode Switcher */}
        <div
          className="flex items-center p-1 rounded-2xl backdrop-blur-xl border shadow-xl"
          style={{ background: "rgba(18, 12, 6, 0.92)", borderColor: "rgba(245, 158, 11, 0.35)" }}
        >
          <button
            onClick={() => setStudioMode("framework_chassis")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              studioMode === "framework_chassis"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold"
                : "text-amber-200/70 hover:text-amber-100 hover:bg-white/5"
            }`}
          >
            <Wrench size={13} />
            <span>CHASSIS & FRAMEWORK GLB</span>
          </button>
          <button
            onClick={() => setStudioMode("finished_body")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              studioMode === "finished_body"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold"
                : "text-amber-200/70 hover:text-amber-100 hover:bg-white/5"
            }`}
          >
            <Car size={13} />
            <span>FINISHED STYLING</span>
          </button>
        </div>

        {/* Vehicle Category Quick-Pills: Sedan, Hatchback, Cross, SUV */}
        <div
          className="flex items-center gap-1.5 p-1.5 rounded-2xl backdrop-blur-xl border shadow-xl"
          style={{ background: "rgba(18, 12, 6, 0.88)", borderColor: "rgba(180, 140, 60, 0.3)" }}
        >
          <span className="text-[10px] font-mono font-extrabold text-amber-400 px-2 uppercase tracking-wider">
            PLATFORM:
          </span>
          {VEHICLE_CATEGORIES.map((cat) => {
            const isCurrent = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySwitch(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all ${
                  isCurrent
                    ? "bg-amber-500 text-slate-950 shadow-sm font-extrabold scale-105"
                    : "text-amber-200/60 hover:text-amber-100 hover:bg-white/5"
                }`}
                title={`Switch to ${cat.label} Architecture`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[9px] px-1 rounded ${
                    isCurrent ? "bg-slate-950/30 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {cat.shortTag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Model dropdown if in finished_body mode */}
        {studioMode === "finished_body" && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md border transition-all text-xs font-mono font-bold"
              style={{ background: "rgba(26,16,8,0.88)", borderColor: "rgba(180,140,60,0.4)", color: "#fde68a" }}
            >
              <span>{model.name}</span>
              <span className="text-[10px] opacity-70">({model.subtitle})</span>
            </button>
            {dropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-80 rounded-xl backdrop-blur-md border overflow-hidden max-h-80 overflow-y-auto z-40"
                style={{ background: "rgba(26,16,8,0.95)", borderColor: "rgba(180,140,60,0.3)" }}
              >
                {Object.entries(tierGroups).map(([tier, models]) => (
                  <div key={tier}>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase" style={{ color: "rgba(253,230,138,0.5)" }}>
                      {TIER_LABELS[tier] || tier}
                    </div>
                    {models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectModel(m)}
                        className="w-full text-left px-3 py-2 flex items-center gap-3 transition-colors text-xs"
                        style={{ background: m.id === selectedId ? "rgba(180,140,60,0.2)" : "transparent" }}
                      >
                        <span className="text-amber-400 font-bold">{m.name}</span>
                        <span className="text-[10px] text-amber-200/50">{m.power}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Platform Engineering Specs Callout */}
        {studioMode === "framework_chassis" && (
          <div
            className="px-3 py-1.5 rounded-xl backdrop-blur-md border font-mono text-[10px] text-amber-200/80 flex items-center gap-3"
            style={{ background: "rgba(18, 12, 6, 0.75)", borderColor: "rgba(180, 140, 60, 0.2)" }}
          >
            <span>
              WB: <strong className="text-amber-300">{architecture.wheelbaseMm}mm</strong>
            </span>
            <span>
              TRACK: <strong className="text-amber-300">{architecture.trackFrontMm}mm</strong>
            </span>
            <span>
              HEIGHT: <strong className="text-amber-300">{architecture.overallHeightMm}mm</strong>
            </span>
            <span>
              CLEARANCE: <strong className="text-amber-300">{architecture.rideHeightMm}mm</strong>
            </span>
          </div>
        )}
      </div>

      {/* =====================================================================
          2. TOP-RIGHT HUD: PAINT PALETTE & FINISH CONTROLS
          ===================================================================== */}
      <div
        className="absolute top-3 right-3 z-30 px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-xl"
        style={{ background: "rgba(26,16,8,0.85)", borderColor: "rgba(180,140,60,0.3)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono font-bold text-amber-300">
            {studioMode === "framework_chassis" ? "FRAMEWORK FINISH" : "EXTERIOR COLOR"}
          </span>
          <span className="text-[10px] font-mono text-amber-200/60 uppercase">
            {paintFinish}
          </span>
        </div>

        {/* Paint Color Swatches */}
        <div className="flex gap-1.5 mt-2">
          {PALETTE.map((c, i) => (
            <button
              key={i}
              onClick={() => setPaintColor(c)}
              className="w-5 h-5 rounded-full border-2 transition-all hover:scale-125 cursor-pointer"
              style={{
                background: "#" + c.toString(16).padStart(6, "0"),
                borderColor: paintColor === c ? "#fbbf24" : "rgba(180,140,60,0.2)",
                boxShadow: paintColor === c ? "0 0 10px rgba(251,191,36,0.5)" : "none",
              }}
              title={`Color #${c.toString(16).padStart(6, "0")}`}
            />
          ))}
        </div>

        {/* Paint Finish Buttons */}
        <div className="flex gap-1 mt-2">
          {PAINT_FINISHES.map((f) => (
            <button
              key={f.id}
              onClick={() => setPaintFinish(f.id)}
              className="px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer"
              style={{
                background: paintFinish === f.id ? "rgba(180,140,60,0.3)" : "rgba(180,140,60,0.08)",
                color: paintFinish === f.id ? "#fbbf24" : "rgba(253,230,138,0.5)",
                border: paintFinish === f.id ? "1px solid rgba(251,191,36,0.4)" : "1px solid transparent",
              }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          3. BOTTOM-LEFT HUD: ARCHITECTURE LAYER TOGGLES & EXPLODED CONTROLS
          ===================================================================== */}
      {studioMode === "framework_chassis" && (
        <div
          className="absolute bottom-16 left-3 z-30 p-2.5 rounded-2xl backdrop-blur-xl border shadow-xl flex flex-col gap-2 font-mono text-[11px]"
          style={{ background: "rgba(18, 12, 6, 0.88)", borderColor: "rgba(180, 140, 60, 0.3)" }}
        >
          {/* Layer visibility buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-amber-400 mr-1">LAYERS:</span>
            {[
              { key: "chassis" as const, label: "Chassis GLB" },
              { key: "bodyFramework" as const, label: "Framework GLB" },
              { key: "floor" as const, label: "Floor GLB" },
              { key: "wheelArches" as const, label: "Wheel Arches" },
              { key: "hardpoints" as const, label: "Hardpoints" },
              { key: "envelopes" as const, label: "Envelopes" },
            ].map((item) => {
              const active = layers[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => toggleLayer(item.key)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border ${
                    active
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-900/60 text-slate-500 border-slate-800"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-amber-400" : "bg-slate-600"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Exploded View & X-Ray Row */}
          <div className="flex items-center gap-4 pt-1.5 border-t border-amber-500/20">
            {/* Exploded View Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-300 font-bold">EXPLODED:</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={explodedProgress}
                onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
                className="w-24 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, rgba(251,191,36,0.8) " +
                    explodedProgress * 100 +
                    "%, rgba(180,140,60,0.2) " +
                    explodedProgress * 100 +
                    "%)",
                }}
              />
              <span className="text-[10px] text-amber-400 font-bold min-w-[28px]">
                {Math.round(explodedProgress * 100)}%
              </span>
            </div>

            {/* X-Ray Ghost Mode Toggle */}
            <button
              onClick={() => setIsXRay(!isXRay)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 border ${
                isXRay
                  ? "bg-sky-500/25 text-sky-300 border-sky-400/60 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Eye size={12} />
              <span>{isXRay ? "X-RAY ACTIVE" : "X-RAY MODE"}</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. TURNTABLE & CAMERA PRESETS (BOTTOM)
          ===================================================================== */}
      <div
        className="absolute bottom-16 right-3 z-30 flex items-center gap-3 px-3 py-1.5 rounded-xl backdrop-blur-md border transition-all"
        style={{
          background: autoRotate ? "rgba(26,16,8,0.92)" : "rgba(26,16,8,0.75)",
          borderColor: autoRotate ? "rgba(251,191,36,0.5)" : "rgba(180,140,60,0.2)",
        }}
      >
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
          style={{
            background: autoRotate ? "rgba(251,191,36,0.25)" : "rgba(180,140,60,0.1)",
            color: autoRotate ? "#fbbf24" : "rgba(253,230,138,0.6)",
            border: autoRotate ? "1px solid rgba(251,191,36,0.4)" : "1px solid transparent",
          }}
        >
          <span className={autoRotate ? "inline-block animate-spin" : ""}>🏎️</span>
          <span>{autoRotate ? "Turntable ON" : "Turntable"}</span>
        </button>
        {autoRotate && (
          <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: "rgba(180,140,60,0.25)" }}>
            <span className="text-[10px]" style={{ color: "rgba(253,230,138,0.5)" }}>
              Speed
            </span>
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.5}
              value={turntableSpeed}
              onChange={(e) => setTurntableSpeed(parseFloat(e.target.value))}
              className="w-16 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background:
                  "linear-gradient(to right, rgba(180,140,60,0.3) 0%, rgba(251,191,36,0.6) " +
                  ((turntableSpeed - 0.5) / 7.5) * 100 +
                  "%, rgba(180,140,60,0.15) 100%)",
              }}
            />
            <span className="text-[10px] font-mono min-w-[24px] text-right" style={{ color: "#fbbf24" }}>
              {turntableSpeed}x
            </span>
          </div>
        )}
      </div>

      {/* Camera Presets Bar */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1 px-3 py-1.5 rounded-xl backdrop-blur-md border"
        style={{ background: "rgba(26,16,8,0.85)", borderColor: "rgba(180,140,60,0.3)" }}
      >
        {Object.entries({
          orbit: "🔄 Orbit",
          front: "➡️ Front",
          rear: "⬅️ Rear",
          side: "↔️ Side",
          low: "📐 Low",
          top: "🔝 Top",
        }).map(([k, v]) => (
          <button
            key={k}
            onClick={() => {
              setCameraPreset(k);
              setAutoRotate(false);
            }}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            style={{
              background: cameraPreset === k ? "rgba(180,140,60,0.3)" : "transparent",
              color: cameraPreset === k ? "#fbbf24" : "rgba(253,230,138,0.5)",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* =====================================================================
          5. 3D WEBGL CANVAS WITH PHOTOREALISTIC STUDIO LIGHTING
          ===================================================================== */}
      <Canvas
        camera={{ position: preset.pos, fov: preset.fov }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        shadows
        className="w-full h-full"
      >
        {/* Studio Lighting Rig */}
        <ambientLight intensity={0.85} color="#fef3c7" />
        <directionalLight
          position={[5, 6, 4]}
          intensity={3.8}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[-4, 3, 3]} intensity={2.0} color="#e0f2fe" />
        <directionalLight position={[-2, 4, -4]} intensity={1.8} color="#fef08a" />
        <directionalLight position={[0, 5, 0]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[4, 1, -3]} intensity={1.4} color="#f8fafc" />
        <directionalLight position={[-5, 2, 0]} intensity={1.2} color="#dbeafe" />
        <hemisphereLight args={["#fef3c7", "#4a3728", 1.0]} />

        <spotLight position={[3, 4, 5]} angle={0.3} penumbra={0.8} intensity={2.5} color="#fde68a" />
        <spotLight position={[-3, 3, -3]} angle={0.4} penumbra={0.6} intensity={1.5} color="#e0f2fe" />

        <Environment preset="studio" background={false} environmentIntensity={0.9} />

        {/* Overhead Studio Softbox Light Bank */}
        <group position={[0, 4.8, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.8, 6.5]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.2} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* ── CONDITIONAL 3D RENDERING ── */}
        <Suspense fallback={<CarLoadingFallback />}>
          {studioMode === "framework_chassis" ? (
            /* Dedicated specific vehicle category Chassis & Body Framework GLB Viewer */
            <DedicatedArchitectureGlbViewer
              category={selectedCategory}
              paintColorHex={paintColor}
              paintFinish={paintFinish}
              layers={layers}
              explodedProgress={explodedProgress}
              isXRay={isXRay}
              autoRotate={autoRotate}
              autoRotateSpeed={turntableSpeed * 0.3}
            />
          ) : (
            /* Finished Car Model Viewer */
            <group position={[0, -0.08, 0]} key={selectedId}>
              <GlbCarModel
                modelPath={model.glbPath}
                paintColorHex={paintColor}
                caliperColorHex={model.caliperColor}
                paintFinish={paintFinish}
                autoRotate={false}
              />
            </group>
          )}
        </Suspense>

        {/* Reflective Dark Studio Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={45}
            roughness={0.12}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#1a1208"
            metalness={0.5}
            mirror={0.5}
          />
        </mesh>

        <ContactShadows position={[0, -0.09, 0]} opacity={0.7} scale={14} blur={2.5} far={4} color="#2a1a0a" />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.5}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2 - 0.02}
          target={preset.target}
          autoRotate={autoRotate}
          autoRotateSpeed={turntableSpeed}
        />
      </Canvas>
    </div>
  );
};

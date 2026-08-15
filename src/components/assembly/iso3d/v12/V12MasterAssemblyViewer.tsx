import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  RotateCcw,
  Sparkles,
  Layers,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  Eye,
  Shield,
  Wind,
} from "lucide-react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { V12CoordinateStage } from "./V12CoordinateStage";
import { V12BlockCastingIso } from "./V12BlockCastingIso";
import { V12DrySumpPanIso } from "./V12DrySumpPanIso";
import { V12DrySumpTubesIso } from "./V12DrySumpTubesIso";
import { V12DrySumpTankIso } from "./V12DrySumpTankIso";
import { V12RadiatorAssemblyIso } from "./V12RadiatorAssemblyIso";
import { V12CylinderHeadsIso } from "./V12CylinderHeadsIso";
import { V12TimingTrainIso } from "./V12TimingTrainIso";
import { V12ValveCoversIso } from "./V12ValveCoversIso";
import { V12IntakeManifoldsIso } from "./V12IntakeManifoldsIso";
import { V12VelocityStacksIso } from "./V12VelocityStacksIso";
import { V12FuelSystemIso } from "./V12FuelSystemIso";
import { V12TurbochargerIso } from "./V12TurbochargerIso";
import { V12ExhaustHeadersIso } from "./V12ExhaustHeadersIso";
import { V12FlywheelIso } from "./V12FlywheelIso";
import { V12ClutchPackIso } from "./V12ClutchPackIso";
import { V12BellhousingIso } from "./V12BellhousingIso";
import { V12GearClusterIso } from "./V12GearClusterIso";
import { V12TransmissionCasingIso } from "./V12TransmissionCasingIso";
import { V12ElectronicsIso } from "./V12ElectronicsIso";
import { V12WiringLoomIso } from "./V12WiringLoomIso";
import { V12EngineCoverAssemblyIso } from "./V12EngineCoverAssemblyIso";
import { V12DynoHUDOverlayIso } from "./V12DynoHUDOverlayIso";

export type AspirationMode = "na" | "turbo";
export type PowertrainOption = "ice" | "hybrid";
export type CameraPreset = "iso" | "top" | "rear" | "front";
export type ThemeColor = "gold" | "rosso" | "stealth" | "emerald";

interface V12MasterAssemblyViewerProps {
  initialWithCover?: boolean;
  initialAspiration?: AspirationMode;
  initialPowertrain?: PowertrainOption;
  onHoverComponent?: (id: ComponentId | null) => void;
  className?: string;
}

// 60° V12 Even Firing Order Sequence: 1-12-5-8-3-10-6-7-2-11-4-9
const V12_FIRING_ORDER = [1, 12, 5, 8, 3, 10, 6, 7, 2, 11, 4, 9];

/**
 * ═══════════════════════════════════════════════════════════════════
 * UNIFIED MASTER V12 INTERACTIVE ASSEMBLY & DYNO WORKSTATION
 * ═══════════════════════════════════════════════════════════════════
 */
export const V12MasterAssemblyViewer: React.FC<V12MasterAssemblyViewerProps> = ({
  initialWithCover = false,
  initialAspiration = "na",
  initialPowertrain = "ice",
  onHoverComponent,
  className = "",
}) => {
  // ── Configuration State ──
  const [withEngineCover, setWithEngineCover] = useState<boolean>(initialWithCover);
  const [aspirationMode, setAspirationMode] = useState<AspirationMode>(initialAspiration);
  const [powertrainOption, setPowertrainOption] = useState<PowertrainOption>(initialPowertrain);
  const [activeComponent, setActiveComponent] = useState<ComponentId | null>(null);

  // ── Interactive Enhancements ──
  const [explodedSlider, setExplodedSlider] = useState<number>(0); // 0 (assembled) to 1 (fully exploded)
  const [liveRpm, setLiveRpm] = useState<number>(900); // 900 RPM idle to 11000 RPM redline
  const [isRevving, setIsRevving] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("iso");
  const [colorTheme, setColorTheme] = useState<ThemeColor>("gold");
  const [firingOrderIdx, setFiringOrderIdx] = useState<number>(0);

  // Dynamic Firing Order Combustion Loop based on live RPM
  useEffect(() => {
    const intervalMs = Math.max(16, Math.floor(60000 / (liveRpm * 6))); // 6 combustion events per revolution
    const timer = setInterval(() => {
      setFiringOrderIdx((prev) => (prev + 1) % V12_FIRING_ORDER.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [liveRpm]);

  // Smooth rev up / return to idle
  const revRafRef = useRef<number | null>(null);
  const handleStartRev = () => {
    setIsRevving(true);
    let target = 11000;
    const step = () => {
      setLiveRpm((prev) => {
        const next = prev + (target - prev) * 0.15;
        if (Math.abs(target - next) < 50) return target;
        return next;
      });
      revRafRef.current = requestAnimationFrame(step);
    };
    revRafRef.current = requestAnimationFrame(step);
  };

  const handleStopRev = () => {
    setIsRevving(false);
    if (revRafRef.current) cancelAnimationFrame(revRafRef.current);
    let target = 900;
    const step = () => {
      setLiveRpm((prev) => {
        const next = prev + (target - prev) * 0.12;
        if (Math.abs(target - next) < 20) return target;
        return next;
      });
      revRafRef.current = requestAnimationFrame(step);
    };
    revRafRef.current = requestAnimationFrame(step);
  };

  const handleHover = (id: ComponentId | null) => {
    setActiveComponent(id);
    onHoverComponent?.(id);
  };

  // Calibrated Viewport Origin and Camera Transforms
  const cameraTransform = useMemo(() => {
    switch (cameraPreset) {
      case "top":
        return "scale(1.15) translate(0px, 20px) rotate(-6deg)";
      case "rear":
        return "scale(1.22) translate(-35px, -15px)";
      case "front":
        return "scale(1.22) translate(35px, -10px)";
      case "iso":
      default:
        return "scale(1) translate(0px, 0px)";
    }
  }, [cameraPreset]);

  const originScreen = { x: 290, y: 245 };

  // Calculated Output Stats
  const outputHp = useMemo(() => {
    let base = 790; // Base 6.5L NA 11,000 RPM
    if (aspirationMode === "turbo") base += 280; // High-Boost Turbo +280 HP
    if (powertrainOption === "hybrid") base += 240; // 800V Axial-Flux Motor +240 HP
    return base;
  }, [aspirationMode, powertrainOption]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 border border-white/10 shadow-2xl p-3 md:p-4 overflow-hidden select-none transition-all ${className}`}
    >
      {/* ── TOP INTERACTIVE CONTROL PANEL & SPEC BADGES ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 px-1 border-b border-white/5 pb-2.5 text-xs font-mono">
        {/* Left: Mode & Powertrain Switchers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* 1. Cover Mode Toggle */}
          <button
            type="button"
            onClick={() => setWithEngineCover((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer active:scale-95 ${
              withEngineCover
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]"
            }`}
            title="Toggle Engine Dress Cover"
          >
            <Shield size={13} className="text-amber-400" />
            <span>{withEngineCover ? "Mode 2: Carbon Cover" : "Mode 1: Exposed Race"}</span>
          </button>

          {/* 2. Optional Turbocharger Toggle */}
          <button
            type="button"
            onClick={() => setAspirationMode((prev) => (prev === "na" ? "turbo" : "na"))}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer active:scale-95 ${
              aspirationMode === "turbo"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white"
            }`}
            title="Toggle Turbocharger Induction"
          >
            <Wind size={13} className={aspirationMode === "turbo" ? "text-rose-400" : "text-slate-400"} />
            <span>{aspirationMode === "turbo" ? "Turbocharged" : "Atmospheric NA"}</span>
          </button>

          {/* 3. Optional Hybrid E-Motor Toggle */}
          <button
            type="button"
            onClick={() => setPowertrainOption((prev) => (prev === "ice" ? "hybrid" : "ice"))}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer active:scale-95 ${
              powertrainOption === "hybrid"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white"
            }`}
            title="Toggle 800V Hybrid Assist"
          >
            <Zap size={13} className={powertrainOption === "hybrid" ? "text-purple-400" : "text-slate-400"} />
            <span>{powertrainOption === "hybrid" ? "800V Hybrid" : "Pure ICE"}</span>
          </button>
        </div>

        {/* Right: Live Dynamic Power & Inspection Badge */}
        <div className="flex items-center gap-2">
          {activeComponent ? (
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 font-extrabold animate-pulse">
              INSPECTING: {activeComponent.toUpperCase().replace("_", " ")}
            </span>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-[11px] font-mono">
              <Flame size={12} className="text-amber-400 animate-pulse" />
              <span className="text-slate-300 font-bold">RACING-SPEC V12:</span>
              <span className="text-emerald-400 font-extrabold">{outputHp} HP</span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-400">{Math.round(liveRpm).toLocaleString()} RPM</span>
            </div>
          )}
        </div>
      </div>

      {/* ── SECONDARY TOOLBAR: CAMERA PRESETS, EXPLODED SLIDER & DYNO THROTTLE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 px-1 text-[11px] font-mono">
        {/* 1. Camera Angle Presets */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-white/5">
          <span className="text-slate-400 font-bold px-1 shrink-0">Camera:</span>
          {(["iso", "top", "rear", "front"] as CameraPreset[]).map((cam) => (
            <button
              key={cam}
              type="button"
              onClick={() => setCameraPreset(cam)}
              className={`flex-1 py-1 rounded-lg text-center font-extrabold uppercase transition-all cursor-pointer ${
                cameraPreset === cam
                  ? "bg-cyan-500/25 text-cyan-200 border border-cyan-500/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cam}
            </button>
          ))}
        </div>

        {/* 2. Exploded View Continuous Slider */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/5">
          <Sliders size={13} className="text-amber-400 shrink-0" />
          <span className="text-slate-400 font-bold shrink-0">Exploded:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedSlider}
            onChange={(e) => setExplodedSlider(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <span className="text-amber-300 font-extrabold w-8 text-right">
            {Math.round(explodedSlider * 100)}%
          </span>
        </div>

        {/* 3. Live 11,000 RPM Throttle & Dyno Rev Controller */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-white/5">
          <Gauge size={13} className="text-rose-400 shrink-0" />
          <span className="text-slate-400 font-bold shrink-0">Dyno Rev:</span>
          <button
            type="button"
            onMouseDown={handleStartRev}
            onMouseUp={handleStopRev}
            onTouchStart={handleStartRev}
            onTouchEnd={handleStopRev}
            className={`w-full py-1 rounded-lg font-extrabold uppercase transition-all border cursor-pointer active:scale-95 ${
              isRevving
                ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
            }`}
          >
            {isRevving ? "🔥 REV AT 11,000 RPM" : "Hold to Rev Engine"}
          </button>
        </div>
      </div>

      {/* ── MASTER SVG WORKSTATION (580x480 CALIBRATED VIEWPORT) ── */}
      <div className="relative w-full h-[400px] md:h-[450px] rounded-2xl bg-slate-950/40 border border-white/5 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-inner">
        {/* Soft Radial Studio Lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(245,158,11,0.06),transparent_65%)] pointer-events-none" />

        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
          style={{ transform: cameraTransform }}
        >
          <svg
            viewBox="0 0 580 480"
            className="w-full h-full max-h-[500px] overflow-visible drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 1. Master Coordinate Stage & Tempered Glass Podium */}
            <V12CoordinateStage
              originScreen={originScreen}
              showPodium={true}
              theme={colorTheme}
              cameraPreset={cameraPreset}
            >
              {/* 2. 60° V12 Die-Cast Crankcase & Bedplate */}
              <V12BlockCastingIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 3. Billet Low-Profile Dry-Sump Oil Pan (Floats -Z in exploded view) */}
              <V12DrySumpPanIso
                originScreen={originScreen}
                explodedAmount={explodedSlider}
                onHoverComponent={handleHover}
              />

              {/* 4. 4-Tube Scavenge Hardlines & AN Fittings */}
              <V12DrySumpTubesIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 5. Integrated Dry-Sump Reservoir Tank Box & Filter */}
              <V12DrySumpTankIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 6. Front Dual-Pass Aluminum Racing Radiator & Fan (Floats -X in exploded view) */}
              <V12RadiatorAssemblyIso
                originScreen={originScreen}
                explodedAmount={explodedSlider}
                onHoverComponent={handleHover}
              />

              {/* 7. Precision 48-Valve Dual Cylinder Heads with Live Firing Combustion Glow */}
              <V12CylinderHeadsIso
                originScreen={originScreen}
                explodedAmount={explodedSlider}
                activeFiringCyl={V12_FIRING_ORDER[firingOrderIdx]}
                onHoverComponent={handleHover}
              />

              {/* 8. Quad-Cam Timing Sprockets & Roller Chains */}
              <V12TimingTrainIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 9. Vibrant Orange-Gold Billet Valve Covers */}
              <V12ValveCoversIso
                originScreen={originScreen}
                explodedAmount={explodedSlider}
                onHoverComponent={handleHover}
              />

              {/* 10. 12 Curved Ram-Air Intake Runners */}
              <V12IntakeManifoldsIso
                originScreen={originScreen}
                explodedAmount={explodedSlider}
                onHoverComponent={handleHover}
              />

              {/* 11. 12 Cobalt Velocity Stacks / ITBs with Live RPM Butterfly Opening */}
              <V12VelocityStacksIso
                originScreen={originScreen}
                explodedAmount={explodedSlider}
                throttleRpm={liveRpm}
                colorTheme={colorTheme}
                onHoverComponent={handleHover}
              />

              {/* 12. Dual High-Pressure GDI Fuel Rails & Injectors */}
              <V12FuelSystemIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 13. Optional Turbocharger (Rendered ONLY if aspirationMode === 'turbo') */}
              {aspirationMode === "turbo" && (
                <V12TurbochargerIso
                  originScreen={originScreen}
                  onHoverComponent={handleHover}
                />
              )}

              {/* 14. 6-into-1 Hydroformed Inconel Headers */}
              <V12ExhaustHeadersIso
                originScreen={originScreen}
                explodedAmount={explodedSlider}
                onHoverComponent={handleHover}
              />

              {/* 15. Forged Chromoly Dual-Mass Flywheel */}
              <V12FlywheelIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 16. Multi-Plate Wet Carbon Clutch Pack */}
              <V12ClutchPackIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 17. Bellhousing with Cutaway Window */}
              <V12BellhousingIso
                originScreen={originScreen}
                explodedAmount={explodedSlider}
                onHoverComponent={handleHover}
              />

              {/* 18. 7-Speed Sequential Transaxle Gear Cluster */}
              <V12GearClusterIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 19. Transmission Casing & Splined Output Yoke */}
              <V12TransmissionCasingIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 20. Optional 800V Hybrid ECU & Power Electronics (Rendered ONLY if hybrid) */}
              {powertrainOption === "hybrid" && (
                <V12ElectronicsIso
                  originScreen={originScreen}
                  onHoverComponent={handleHover}
                />
              )}

              {/* 21. Braided Raychem Motorsport Wiring Loom */}
              <V12WiringLoomIso
                originScreen={originScreen}
                onHoverComponent={handleHover}
              />

              {/* 22. Optional Mode 2 Dry-Carbon Monocoque Engine Cover */}
              {withEngineCover && (
                <V12EngineCoverAssemblyIso
                  originScreen={originScreen}
                  explodedAmount={explodedSlider}
                  onHoverComponent={handleHover}
                />
              )}
            </V12CoordinateStage>

            {/* 23. Interactive Spec Reticle Overlay */}
            <V12DynoHUDOverlayIso
              hasCover={withEngineCover}
              onToggleCover={() => setWithEngineCover((prev) => !prev)}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

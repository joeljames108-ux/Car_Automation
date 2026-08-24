import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  Zap,
  ShieldCheck,
  DollarSign,
  Gauge,
  Thermometer,
  Wind,
  X,
  RotateCcw,
  ArrowRight,
  Sliders,
  Activity,
  Award,
} from "lucide-react";
import { ModularEngine3DViewport } from "../../engine3d/ModularEngine3DViewport";
import { getAssemblyComponents } from "../../sim/assemblyTypes";
import { playAssemblySound } from "./sounds";
import { EngineConfig } from "../../sim/types";
import { AnimatedCounter } from "../ui/AnimatedCounter";

interface AssemblyCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  stats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  layout?: string;
  engineConfig?: Partial<EngineConfig>;
}

export function AssemblyCompletionModal({
  isOpen,
  onClose,
  onReset,
  stats,
  layout,
  engineConfig,
}: AssemblyCompletionModalProps) {
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const [throttlePos, setThrottlePos] = useState(0); // 0% to 100%
  const [rpm, setRpm] = useState(850);
  const [boost, setBoost] = useState(0.2);

  // Play completion chime when opened
  useEffect(() => {
    if (isOpen) {
      playAssemblySound("completion");
    }
  }, [isOpen]);

  // Live telemetry calculation based on throttle position slider
  useEffect(() => {
    if (!isRunningEngine) {
      setRpm(0);
      setBoost(0);
      return;
    }

    // Calculate RPM & Boost from throttle position (0 - 100%)
    const targetRpm = Math.round(950 + (throttlePos / 100) * 7550);
    const targetBoost = parseFloat((0.3 + (throttlePos / 100) * 2.1).toFixed(2));

    setRpm(targetRpm);
    setBoost(targetBoost);

    if (throttlePos > 10) {
      playAssemblySound("rev");
    }
  }, [isRunningEngine, throttlePos]);

  if (!isOpen) return null;

  const allComponentIds = getAssemblyComponents(engineConfig).map((c) => c.id);

  // Tachometer Needle Rotation Angle (-120deg to +120deg)
  const needleRotation = -120 + (rpm / 8500) * 240;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-base-950/80 backdrop-blur-2xl animate-fade-in select-none">
      {/* Vision Glass Atmospheric Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.18),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(232,121,160,0.12),transparent_60%)] pointer-events-none" />

      {/* Main Vision Glass Container */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-base-900/90 via-base-900/95 to-base-950/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_40px_rgba(34,211,238,0.15),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-3xl flex flex-col gap-6 overflow-hidden animate-scale-in">
        
        {/* Specular Rim Light on Top Edge */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-base-800/90 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/35 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-extrabold tracking-wider shadow-[0_0_10px_rgba(34,211,238,0.25)]">
                  FACTORY VERIFIED
                </span>
                <span className="text-[10.5px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Award size={12} className="text-cyan-400" /> 100% Precision Build
                </span>
              </div>
              <h2 className="text-xl font-mono font-bold text-slate-100 mt-1 tracking-tight">
                Engine Dyno & Telemetry Testing
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-slate-400 hover:text-white bg-base-850/80 hover:bg-base-800 border border-base-750/80 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Center Grid: Engine 3D Canvas + Vision Glass Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Left Column: Assembled Engine Canvas in Vision Glass Card */}
          <div className="relative bg-base-950/80 border border-base-800/90 rounded-2xl p-2 flex flex-col items-center justify-center min-h-[320px] h-[320px] w-full overflow-hidden shadow-inner">
            <ModularEngine3DViewport
              className="w-full h-full"
              engineConfig={engineConfig}
            />

            {/* Start Engine & Live Throttle Controls */}
            <div className="w-full space-y-2 mt-3 relative z-10">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const nextState = !isRunningEngine;
                    setIsRunningEngine(nextState);
                    if (nextState) playAssemblySound("starter");
                    else setThrottlePos(0);
                  }}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                    isRunningEngine
                      ? "bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30"
                      : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                  }`}
                >
                  <Zap size={14} />
                  {isRunningEngine ? "CUT IGNITION" : "START ENGINE"}
                </button>

                {isRunningEngine && (
                  <button
                    onClick={() => {
                      playAssemblySound("rev");
                      setThrottlePos(100);
                      setTimeout(() => setThrottlePos(0), 800);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-mono text-xs font-bold hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300/50 active:scale-95 cursor-pointer"
                  >
                    <Gauge size={14} /> REV MAX
                  </button>
                )}
              </div>

              {/* Throttle Position Slider */}
              {isRunningEngine && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-base-900/90 border border-cyan-500/30 backdrop-blur-md shadow-md animate-fade-in">
                  <Sliders size={14} className="text-cyan-400 shrink-0" />
                  <span className="text-[10.5px] font-mono text-cyan-300 font-bold shrink-0">
                    Throttle: {throttlePos}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={throttlePos}
                    onChange={(e) => setThrottlePos(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Circular Vision Glass Tachometer & Live Telemetry */}
          <div className="space-y-4">
            {/* Vision Glass Tachometer Dial */}
            <div className="flex items-center justify-center bg-base-950/80 border border-base-800/90 rounded-2xl p-5 relative shadow-inner">
              <svg viewBox="0 0 200 130" className="w-52 h-36 overflow-visible">
                {/* Background Track Arc */}
                <path
                  d="M 30 110 A 80 80 0 1 1 170 110"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Redline Danger Arc */}
                <path
                  d="M 140 35 A 80 80 0 0 1 170 110"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="10"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                {/* Active Cyan RPM Glowing Track */}
                <path
                  d="M 30 110 A 80 80 0 1 1 170 110"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="4.5"
                  strokeDasharray="300"
                  strokeDashoffset={300 - (rpm / 8500) * 300}
                  className="transition-all duration-200"
                  style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.8))" }}
                />

                {/* Rotating Needle with Cyan Glow */}
                <g
                  style={{
                    transform: `rotate(${needleRotation}deg)`,
                    transformOrigin: "100px 110px",
                    transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <line
                    x1="100"
                    y1="110"
                    x2="100"
                    y2="38"
                    stroke="#22d3ee"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.9))" }}
                  />
                  <circle cx="100" cy="110" r="8" fill="#0f172a" stroke="#22d3ee" strokeWidth="2.5" />
                </g>

                <text x="100" y="92" fill="#f8fafc" fontSize="18" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {rpm}
                </text>
                <text x="100" y="108" fill="#64748b" fontSize="8.5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.1em">
                  RPM
                </text>
              </svg>
            </div>

            {/* Final Stats Summary Grid in Vision Glass Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-950/80 border border-base-800/90 rounded-2xl p-3.5 backdrop-blur-md shadow-sm">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp size={13} className="text-cyan-400" /> Peak Power
                </span>
                <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
                  <AnimatedCounter value={stats.hp} suffix=" HP" />
                </div>
              </div>

              <div className="bg-base-950/80 border border-base-800/90 rounded-2xl p-3.5 backdrop-blur-md shadow-sm">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap size={13} className="text-pink-400" /> Peak Torque
                </span>
                <div className="text-lg font-mono font-bold text-pink-300 mt-1">
                  <AnimatedCounter value={stats.torque} suffix=" Nm" />
                </div>
              </div>

              <div className="bg-base-950/80 border border-base-800/90 rounded-2xl p-3.5 backdrop-blur-md shadow-sm">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck size={13} className="text-emerald-400" /> Durability
                </span>
                <div className="text-lg font-mono font-bold text-emerald-300 mt-1">
                  <AnimatedCounter value={stats.reliability} suffix="%" />
                </div>
              </div>

              <div className="bg-base-950/80 border border-base-800/90 rounded-2xl p-3.5 backdrop-blur-md shadow-sm">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <DollarSign size={13} className="text-amber-400" /> Total Cost
                </span>
                <div className="text-lg font-mono font-bold text-amber-300 mt-1">
                  <AnimatedCounter value={stats.cost} prefix="$" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Modal Actions */}
        <div className="flex items-center justify-between border-t border-base-800/90 pt-4">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-mono font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} /> Disassemble Engine
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-black text-xs font-mono font-extrabold hover:from-cyan-300 hover:to-sky-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 cursor-pointer"
          >
            Return to Studio <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

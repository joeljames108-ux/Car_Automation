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
} from "lucide-react";
import { EngineSVG } from "./EngineSVG";
import { ENGINE_ASSEMBLY_COMPONENTS } from "../../sim/assemblyTypes";
import { playAssemblySound } from "./sounds";

import { EngineConfig } from "../../sim/types";

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

  const allComponentIds = ENGINE_ASSEMBLY_COMPONENTS.map((c) => c.id);

  // Tachometer Needle Rotation Angle (-120deg to +120deg)
  const needleRotation = -120 + (rpm / 8500) * 240;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl animate-stage-transition-enter select-none">
      {/* Dynamic Background Rays & Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none" />

      {/* Main Dialog Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#070a12]/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col gap-6 overflow-hidden">
        {/* Light Sweep Particle Flare */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-400/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                  FACTORY VERIFIED
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  100% Precision Build
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                Engine Dyno & Telemetry Testing
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Center Grid: Engine SVG + Live Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left Column: Assembled Engine Canvas */}
          <div className="relative bg-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[310px] overflow-hidden">
            <EngineSVG
              installedComponents={allComponentIds}
              activeComponentId={null}
              phase="complete"
              hoveredComponentId={null}
              isExplodedView={false}
              isAssemblyComplete={true}
              layout={layout}
              engineConfig={engineConfig}
              className="max-h-[260px]"
            />

            {/* Start Engine & Throttle Controls */}
            <div className="w-full space-y-2 mt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const nextState = !isRunningEngine;
                    setIsRunningEngine(nextState);
                    if (nextState) playAssemblySound("starter");
                    else setThrottlePos(0);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition-all shadow-lg active:scale-95 cursor-pointer ${
                    isRunningEngine
                      ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
                      : "bg-gradient-to-r from-cyan-500 to-sky-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110"
                  }`}
                >
                  <Flame size={16} />
                  {isRunningEngine ? "Stop Engine" : "Start Engine"}
                </button>

                {isRunningEngine && (
                  <button
                    onClick={() => {
                      playAssemblySound("rev");
                      setThrottlePos(100);
                      setTimeout(() => setThrottlePos(0), 800);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
                  >
                    <Gauge size={16} /> REV MAX
                  </button>
                )}
              </div>

              {/* Throttle Position Slider */}
              {isRunningEngine && (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-[#070a12]/90 border border-cyan-500/30">
                  <Sliders size={14} className="text-cyan-400 shrink-0" />
                  <span className="text-[10px] font-mono text-slate-300 font-bold shrink-0">
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

          {/* Right Column: Circular SVG Tachometer & Live Telemetry */}
          <div className="space-y-4">
            {/* Circular Tachometer Dial */}
            <div className="flex items-center justify-center bg-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-4 relative">
              <svg viewBox="0 0 200 130" className="w-48 h-32 overflow-visible">
                {/* Dial Arc */}
                <path
                  d="M 30 110 A 80 80 0 1 1 170 110"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Redline Arc */}
                <path
                  d="M 140 35 A 80 80 0 0 1 170 110"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Active RPM Fill Arc */}
                <path
                  d="M 30 110 A 80 80 0 1 1 170 110"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeDasharray="300"
                  strokeDashoffset={300 - (rpm / 8500) * 300}
                  className="transition-all duration-200"
                />

                {/* Rotating Needle */}
                <g
                  style={{
                    transform: `rotate(${needleRotation}deg)`,
                    transformOrigin: "100px 110px",
                    transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <line x1="100" y1="110" x2="100" y2="40" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="110" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                </g>

                <text x="100" y="95" fill="#f8fafc" fontSize="16" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {rpm}
                </text>
                <text x="100" y="110" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  RPM
                </text>
              </svg>
            </div>

            {/* Final Stats Summary Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <TrendingUp size={12} className="text-cyan-400" /> Peak Power
                </span>
                <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
                  {stats.hp} HP
                </div>
              </div>

              <div className="bg-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Zap size={12} className="text-pink-400" /> Peak Torque
                </span>
                <div className="text-lg font-mono font-bold text-pink-300 mt-1">
                  {stats.torque} Nm
                </div>
              </div>

              <div className="bg-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" /> Durability
                </span>
                <div className="text-lg font-mono font-bold text-emerald-300 mt-1">
                  {stats.reliability}%
                </div>
              </div>

              <div className="bg-[#0b0f19]/80 border border-slate-800/80 rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <DollarSign size={12} className="text-amber-400" /> Total Cost
                </span>
                <div className="text-lg font-mono font-bold text-amber-300 mt-1">
                  ${stats.cost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            <RotateCcw size={14} /> Disassemble Engine
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-mono font-bold hover:bg-cyan-400 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            Return to Studio <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

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
} from "lucide-react";
import { EngineSVG } from "./EngineSVG";
import { ENGINE_ASSEMBLY_COMPONENTS } from "../../sim/assemblyTypes";
import { playAssemblySound } from "./sounds";

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
}

export function AssemblyCompletionModal({
  isOpen,
  onClose,
  onReset,
  stats,
}: AssemblyCompletionModalProps) {
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const [rpm, setRpm] = useState(850);
  const [boost, setBoost] = useState(0.2);

  // Play completion chime when opened
  useEffect(() => {
    if (isOpen) {
      playAssemblySound("completion");
    }
  }, [isOpen]);

  // Live telemetry animation when engine is running
  useEffect(() => {
    if (!isRunningEngine) {
      setRpm(0);
      setBoost(0);
      return;
    }

    setRpm(950);
    setBoost(0.3);

    const interval = setInterval(() => {
      setRpm((prev) => 900 + Math.floor(Math.random() * 150));
      setBoost((prev) => parseFloat((0.25 + Math.random() * 0.15).toFixed(2)));
    }, 400);

    return () => clearInterval(interval);
  }, [isRunningEngine]);

  if (!isOpen) return null;

  const allComponentIds = ENGINE_ASSEMBLY_COMPONENTS.map((c) => c.id);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-2xl animate-stage-transition-enter select-none">
      {/* Dynamic Background Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.15),transparent_70%)] pointer-events-none" />

      {/* Main Dialog Modal Container */}
      <div className="relative w-full max-w-4xl bg-base-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col gap-6 overflow-hidden">
        {/* Light Sweep Particle Flare */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-400/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-base-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  FACTORY VERIFIED
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  100% Complete
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-0.5">
                Engine Assembly Successful!
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-base-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Center Grid: Engine SVG + Live Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left Column: Assembled Engine Canvas */}
          <div className="relative bg-base-950/90 border border-base-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
            <EngineSVG
              installedComponents={allComponentIds}
              activeComponentId={null}
              phase="complete"
              hoveredComponentId={null}
              isExplodedView={false}
              isAssemblyComplete={true}
              className="max-h-[280px]"
            />

            {/* Start Engine & Rev Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  const nextState = !isRunningEngine;
                  setIsRunningEngine(nextState);
                  if (nextState) playAssemblySound("starter");
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
                    setRpm(8500);
                    setBoost(2.4);
                    setTimeout(() => {
                      setRpm(950);
                      setBoost(0.3);
                    }, 800);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-500 text-black font-mono text-xs font-bold hover:bg-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
                >
                  <Gauge size={16} /> REV (8,500 RPM)
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Final Stats Summary & Live Telemetry */}
          <div className="space-y-4">
            {/* Final Stats Summary Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-850 border border-base-750 rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <TrendingUp size={12} className="text-cyan-400" /> Peak Power
                </span>
                <div className="text-lg font-mono font-bold text-cyan-300 mt-1">
                  {stats.hp} HP
                </div>
              </div>

              <div className="bg-base-850 border border-base-750 rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Zap size={12} className="text-pink-400" /> Peak Torque
                </span>
                <div className="text-lg font-mono font-bold text-pink-300 mt-1">
                  {stats.torque} Nm
                </div>
              </div>

              <div className="bg-base-850 border border-base-750 rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" /> Durability
                </span>
                <div className="text-lg font-mono font-bold text-emerald-300 mt-1">
                  {stats.reliability}%
                </div>
              </div>

              <div className="bg-base-850 border border-base-750 rounded-2xl p-3">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <DollarSign size={12} className="text-amber-400" /> Total Cost
                </span>
                <div className="text-lg font-mono font-bold text-amber-300 mt-1">
                  ${stats.cost.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Live Engine Vitals Telemetry Panel (When Running) */}
            <div className="bg-base-950/80 border border-cyan-500/30 rounded-2xl p-3.5 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block flex items-center gap-1">
                <Sparkles size={11} /> LIVE TELEMETRY SENSORS
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-base-900 border border-base-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Gauge size={12} className="text-cyan-400" /> Idle Speed
                  </span>
                  <span className="font-bold text-cyan-300">{rpm} RPM</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-base-900 border border-base-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind size={12} className="text-amber-400" /> Boost
                  </span>
                  <span className="font-bold text-amber-300">{boost} bar</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-base-900 border border-base-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Thermometer size={12} className="text-rose-400" /> Coolant
                  </span>
                  <span className="font-bold text-slate-200">
                    {isRunningEngine ? "88°C" : "--"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-base-900 border border-base-800">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" /> Oil Press.
                  </span>
                  <span className="font-bold text-emerald-300">
                    {isRunningEngine ? "4.2 bar" : "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Modal Actions */}
        <div className="flex items-center justify-between border-t border-base-800 pt-4">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-mono font-semibold transition-all"
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

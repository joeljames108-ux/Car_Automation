import React, { useEffect, useState } from "react";
import { Activity, Zap, Wifi, Shield } from "lucide-react";

interface StageLoadingSkeletonProps { stageName?: string; }

const STAGE_CONFIGS: Record<string, { icon: string; color: string; label: string; subtasks: string[] }> = {
  ENGINE: { icon: "⚙️", color: "#f59e0b", label: "Engine Studio", subtasks: ["Block Casting", "Crankshaft Balancing", "Piston Fitting", "Head Assembly", "Turbo Mounting"] },
  VEHICLE: { icon: "🏎️", color: "#3b82f6", label: "Vehicle Studio", subtasks: ["Chassis Layup", "Panel Bonding", "Suspension Mount", "Wheel Assembly", "Paint Booth"] },
  INTERIOR: { icon: "🎯", color: "#8b5cf6", label: "Interior Studio", subtasks: ["Seat Stitching", "Dash Molding", "Infotainment Load", "Ambient Wiring", "Final Trim"] },
  MANUFACTURING: { icon: "🏭", color: "#10b981", label: "Manufacturing", subtasks: ["Robot Calibration", "Part Feeding", "Weld Sequence", "QC Inspection", "Packaging"] },
  SAFETY: { icon: "🛡️", color: "#ef4444", label: "Safety Lab", subtasks: ["Crash Structure", "Airbag Test", "Seatbelt Load", "Roof Crush", "Side Impact"] },
  COMMAND: { icon: "📊", color: "#f97316", label: "Command Center", subtasks: ["System Boot", "AI Loading", "Data Sync", "Module Init", "Ready"] },
  default: { icon: "🔧", color: "#f59e0b", label: "System", subtasks: ["Initializing", "Loading", "Compiling", "Syncing", "Ready"] },
};

export const StageLoadingSkeleton: React.FC<StageLoadingSkeletonProps> = ({ stageName }) => {
  const [progress, setProgress] = useState(0);
  const [activeSubtask, setActiveSubtask] = useState(0);
  const config = STAGE_CONFIGS[stageName?.toUpperCase() || ""] || STAGE_CONFIGS.default;

  useEffect(() => {
    var iv = setInterval(() => setProgress(p => Math.min(p + Math.random() * 8 + 2, 100)), 200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    var iv = setInterval(() => setActiveSubtask(s => (s + 1) % config.subtasks.length), 800);
    return () => clearInterval(iv);
  }, [config.subtasks.length]);

  return (
    <div className="w-full h-full min-h-[520px] rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-amber-100/80 border border-amber-200/50 backdrop-blur-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_8px_32px_rgba(217,119,6,0.15)]">
      {/* Animated Gradient Sweep */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(45deg, transparent 30%, " + config.color + "08 50%, transparent 70%)", animation: "sweep 3s ease-in-out infinite" }} />

      {/* Glow Ring */}
      <div className="absolute top-6 left-6 w-16 h-16 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, " + config.color + "20 0%, transparent 70%)", animation: "pulse-glow 2s ease-in-out infinite" }} />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-200/40 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300/50 flex items-center justify-center text-2xl shadow-lg shadow-amber-200/30" style={{ animation: "bounce-subtle 1.5s ease-in-out infinite" }}>
            {config.icon}
          </div>
          <div>
            <div className="text-sm font-black text-amber-800 tracking-wider flex items-center gap-2">
              <span>INITIALIZING SUBSYSTEM PIPELINE</span>
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: config.color }} />
            </div>
            <div className="text-xs text-amber-600 font-mono">
              {stageName ? "Loading module [" + stageName.toUpperCase() + "]" : "Streaming CAD & Multi-Physics Solvers..."}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-amber-600 bg-amber-100/60 px-3 py-1.5 rounded-lg border border-amber-200/40">
          <Activity size={12} className="text-amber-500 animate-pulse" />
          <span>120Hz STREAM</span>
        </div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col justify-center gap-6 my-6 relative z-10">
        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs font-mono text-amber-700 mb-2">
            <span className="font-bold">Loading {config.label}</span>
            <span className="font-black" style={{ color: config.color }}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-amber-200/50 rounded-full overflow-hidden border border-amber-300/30">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: progress + "%", background: "linear-gradient(90deg, " + config.color + ", " + config.color + "cc, " + config.color + ")", boxShadow: "0 0 12px " + config.color + "60" }} />
          </div>
        </div>

        {/* Subtasks */}
        <div className="flex flex-wrap gap-2">
          {config.subtasks.map((task, i) => (
            <div key={task} className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300" style={{ backgroundColor: i <= activeSubtask ? config.color + "15" : "rgba(255,255,255,0.3)", border: "1px solid " + (i <= activeSubtask ? config.color + "40" : "rgba(255,255,255,0.2)"), transform: i === activeSubtask ? "scale(1.05)" : "scale(1)" }}>
              <span className="text-xs font-mono" style={{ color: i <= activeSubtask ? config.color : "#92400e" }}>{i < activeSubtask ? "✓" : i === activeSubtask ? "▶" : "○"}</span>
              <span className="text-xs font-mono font-bold" style={{ color: i <= activeSubtask ? "#92400e" : "#b45309" }}>{task}</span>
            </div>
          ))}
        </div>

        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-40 rounded-xl bg-amber-100/40 border border-amber-200/30 p-4 flex flex-col justify-between relative overflow-hidden" style={{ animation: "slide-up 0.5s ease-out " + (i * 0.1) + "s both" }}>
              <div className="h-4 w-3/4 rounded bg-amber-200/60" style={{ animation: "shimmer 1.5s ease-in-out infinite " + (i * 0.2) + "s" }} />
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-amber-200/40" style={{ animation: "shimmer 1.5s ease-in-out infinite " + (i * 0.2 + 0.1) + "s" }} />
                <div className="h-2 w-4/5 rounded bg-amber-200/30" style={{ animation: "shimmer 1.5s ease-in-out infinite " + (i * 0.2 + 0.2) + "s" }} />
              </div>
              <div className="h-7 w-full rounded-lg bg-amber-200/20 border border-amber-300/20" style={{ animation: "shimmer 1.5s ease-in-out infinite " + (i * 0.2 + 0.3) + "s" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status */}
      <div className="flex items-center justify-between text-[11px] font-mono text-amber-600 border-t border-amber-200/40 pt-4 relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Zap size={11} className="text-amber-500" /> MEM: OK</span>
          <span className="flex items-center gap-1"><Wifi size={11} className="text-amber-500" /> SHADERS: COMPILING</span>
          <span className="flex items-center gap-1"><Shield size={11} className="text-amber-500" /> VALIDATING</span>
        </div>
        <span className="font-bold" style={{ color: config.color }}>{config.label} INITIALIZING</span>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.2); } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

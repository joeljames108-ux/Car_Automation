import React, { useState, useEffect } from "react";
import {
  Activity,
  Flame,
  Zap,
  Gauge,
  Thermometer,
  Eye,
  Sliders,
  Ruler,
  Radio,
  Cpu,
  Layers,
} from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface CinematicEngineeringHUDProps {
  engineRpm?: number;
  enginePowerHp?: number;
  engineTorqueNm?: number;
  isEngineeringMode: boolean;
  onToggleEngineeringMode: () => void;
  onOpenBlueprint: () => void;
}

export const CinematicEngineeringHUD: React.FC<CinematicEngineeringHUDProps> = ({
  engineRpm = 6500,
  enginePowerHp = 720,
  engineTorqueNm = 850,
  isEngineeringMode,
  onToggleEngineeringMode,
  onOpenBlueprint,
}) => {
  const [heartbeatTick, setHeartbeatTick] = useState(0);
  const [thermalMapOpen, setThermalMapOpen] = useState(false);

  // Machine Heartbeat idle oscillator
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeatTick((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Compute thermal dissipation numbers based on power
  const turboTemp = Math.round(450 + (enginePowerHp / 1000) * 420);
  const exhaustTemp = Math.round(400 + (enginePowerHp / 1000) * 380);
  const coolantTemp = 92;
  const oilTemp = 104;
  const brakeTemp = 320;

  return (
    <div className="relative w-full flex flex-col gap-3 font-mono select-none">
      {/* Top Engineering Control Ribbon */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 p-3 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-xl shadow-xl">
        {/* Left: Design vs Engineering Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playHMIClickSound();
              onToggleEngineeringMode();
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isEngineeringMode
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10"
            }`}
          >
            <Layers size={13} className={isEngineeringMode ? "text-cyan-400 animate-pulse" : ""} />
            <span>{isEngineeringMode ? "ENGINEERING CAD MODE" : "DESIGN SHOWCASE MODE"}</span>
          </button>

          {/* Blueprint X-Ray Modal Trigger */}
          <button
            onClick={() => {
              playHMIClickSound();
              onOpenBlueprint();
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Ruler size={13} />
            <span>OPEN X-RAY BLUEPRINT</span>
          </button>

          {/* Thermal Map Toggle */}
          <button
            onClick={() => {
              playHMIClickSound();
              setThermalMapOpen(!thermalMapOpen);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              thermalMapOpen
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : "bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10"
            }`}
          >
            <Thermometer size={13} className={thermalMapOpen ? "text-rose-400 animate-pulse" : ""} />
            <span>THERMAL DISSIPATION</span>
          </button>
        </div>

        {/* Right: Machine Heartbeat & RPM Pulse Indicator */}
        <div className="flex items-center gap-3">
          {/* Heartbeat EKG Pulse Wave */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-white/10 shadow-inner">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold">HEARTBEAT IDLE</span>
            <div className="w-16 h-3 flex items-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 60 14">
                <path
                  d={`M 0 7 L 15 7 L 22 1 L 28 13 L 35 7 L 60 7`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.6"
                  strokeDasharray="60"
                  strokeDashoffset={-(heartbeatTick * 1.5) % 60}
                />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-emerald-400">850 RPM</span>
          </div>
        </div>
      </div>

      {/* Expandable Thermal Dissipation Heat Map HUD */}
      {thermalMapOpen && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950/90 via-[#130d1a]/90 to-slate-950/90 border border-rose-500/30 backdrop-blur-xl shadow-2xl animate-nh-materialize">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-500/20">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase">
              <Flame size={14} className="text-rose-400 animate-bounce" />
              <span>LIVE THERMAL DISSIPATION & PYROMETRY MAP</span>
            </span>
            <span className="text-[10px] text-slate-400">MAX TOLERANCE: 950°C (INCONEL 718)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "TWIN TURBOCHARGERS", val: `${turboTemp}°C`, status: "OPTIMAL", color: "#f97316" },
              { label: "EXHAUST HEADERS", val: `${exhaustTemp}°C`, status: "NOMINAL", color: "#eab308" },
              { label: "ENGINE COOLANT", val: `${coolantTemp}°C`, status: "NORMAL", color: "#38bdf8" },
              { label: "MOTOR OIL TEMP", val: `${oilTemp}°C`, status: "WARMED", color: "#10b981" },
              { label: "CARBON BRAKE DISCS", val: `${brakeTemp}°C`, status: "PEAK BITE", color: "#ec4899" },
            ].map((th, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase truncate">{th.label}</span>
                <span className="text-sm font-black tracking-wider" style={{ color: th.color }}>
                  {th.val}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase">{th.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

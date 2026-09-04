import { useState, useEffect, useRef, memo } from "react";
import { Activity, Gauge, Thermometer, Zap, Wind, Fuel } from "lucide-react";

interface GaugeData {
  id: string;
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  value: number;
  unit: string;
  color: string;
  glowColor: string;
  decimals?: number;
}

function AnimatedGauge({ gauge, animPhase }: { gauge: GaugeData; animPhase: number }) {
  const pct = Math.min(1, Math.max(0, (gauge.value - gauge.min) / (gauge.max - gauge.min)));
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct * 0.75);
  const displayVal = (gauge.min + (gauge.max - gauge.min) * pct * animPhase).toFixed(gauge.decimals ?? 0);

  return (
    <div className="flex flex-col items-center gap-1 group cursor-pointer">
      <div className="relative w-[72px] h-[72px]">
        <svg viewBox="0 0 72 72" className="w-full h-full">
          {/* Background arc */}
          <circle
            cx="36" cy="36" r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
            transform="rotate(135 36 36)"
          />
          {/* Active arc */}
          <circle
            cx="36" cy="36" r={radius}
            fill="none" stroke={gauge.color} strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(135 36 36)"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${gauge.glowColor})` }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-mono font-black text-white leading-none">{displayVal}</span>
          <span className="text-[8px] font-mono text-slate-400 mt-0.5">{gauge.unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        {gauge.icon}
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">{gauge.label}</span>
      </div>
    </div>
  );
}

function TelemetryPulseComponent() {
  const [gauges, setGauges] = useState<GaugeData[]>([
    { id: "rpm", label: "RPM", icon: <Gauge size={10} className="text-amber-400" />, min: 0, max: 12000, value: 7200, unit: "RPM", color: "#f59e0b", glowColor: "rgba(245,158,11,0.4)", decimals: 0 },
    { id: "speed", label: "Speed", icon: <Activity size={10} className="text-cyan-400" />, min: 0, max: 350, value: 245, unit: "km/h", color: "#22d3ee", glowColor: "rgba(34,211,238,0.4)", decimals: 0 },
    { id: "temp", label: "Coolant", icon: <Thermometer size={10} className="text-rose-400" />, min: 60, max: 130, value: 89, unit: "°C", color: "#f87171", glowColor: "rgba(248,113,113,0.4)", decimals: 0 },
    { id: "oil", label: "Oil Pres", icon: <Zap size={10} className="text-amber-300" />, min: 0, max: 8, value: 5.2, unit: "bar", color: "#fbbf24", glowColor: "rgba(251,191,36,0.4)", decimals: 1 },
    { id: "aero", label: "Downforce", icon: <Wind size={10} className="text-emerald-400" />, min: 0, max: 6000, value: 4200, unit: "N", color: "#34d399", glowColor: "rgba(52,211,153,0.4)", decimals: 0 },
    { id: "fuel", label: "Fuel", icon: <Fuel size={10} className="text-purple-400" />, min: 0, max: 100, value: 68, unit: "%", color: "#a78bfa", glowColor: "rgba(167,139,250,0.4)", decimals: 0 },
  ]);

  const [animPhase, setAnimPhase] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const frameRef = useRef<number>(0);

  // Entrance animation
  useEffect(() => {
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 800, 1);
      setAnimPhase(p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Live telemetry simulation
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setGauges(prev => prev.map(g => {
        const range = g.max - g.min;
        const jitter = range * 0.02 * (Math.random() - 0.5);
        let newVal = g.value + jitter;
        // RPM tends to fluctuate more
        if (g.id === "rpm") newVal += range * 0.05 * Math.sin(Date.now() / 2000);
        if (g.id === "speed") newVal += range * 0.03 * Math.sin(Date.now() / 3000);
        if (g.id === "temp") newVal += range * 0.01 * Math.sin(Date.now() / 5000);
        if (g.id === "aero") newVal += range * 0.02 * Math.sin(Date.now() / 1500);
        newVal = Math.max(g.min, Math.min(g.max, newVal));
        return { ...g, value: newVal };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="panel bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/8 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Activity size={14} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">LIVE TELEMETRY</span>
          </div>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition-all cursor-pointer ${
            isLive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
          {isLive ? "LIVE" : "PAUSED"}
        </button>
      </div>

      {/* Gauge Grid */}
      <div className="grid grid-cols-6 gap-1 relative z-10">
        {gauges.map(g => (
          <AnimatedGauge key={g.id} gauge={g} animPhase={animPhase} />
        ))}
      </div>
    </div>
  );
}

export const TelemetryPulse = memo(TelemetryPulseComponent);

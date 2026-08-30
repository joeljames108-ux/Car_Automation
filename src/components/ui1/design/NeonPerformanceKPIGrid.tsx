import React, { useMemo } from "react";
import { AnimatedCounter } from "../../ui/AnimatedCounter";
import type { SimResult } from "../../../sim/types";
import { Zap, Gauge, Timer, Weight, TrendingUp, DollarSign, Wind, Shield } from "lucide-react";

function NT({ label, value, unit, icon, accent, sub }: { label: string; value: number | string; unit?: string; icon?: React.ReactNode; accent?: string; sub?: string }) {
  accent = accent || "#8fb9d9";
  return (
    <div className="p-3 rounded-xl bg-[#0e1626]/80 border border-white/[0.08] backdrop-blur-md relative overflow-hidden group hover:border-white/[0.15] transition-all">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "radial-gradient(circle at 50% 100%, " + accent + "15, transparent 70%)" }} />
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300/50">{label}</span>
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-black text-lg" style={{ color: accent }}>
          {typeof value === "number" ? <AnimatedCounter value={value} decimals={value < 10 ? 1 : 0} /> : value}
        </span>
        {unit && <span className="text-[10px] font-mono text-amber-300/50">{unit}</span>}
      </div>
      {sub && <div className="text-[8px] font-mono text-amber-400 mt-0.5">{sub}</div>}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, " + accent + "40, transparent)" }} />
    </div>
  );
}

export type NeonKPIMetricKey = "power" | "torque" | "weight" | "topSpeed" | "accel0_60" | "accel0_100" | "accel0_200" | "quarterMile" | "brakingDist" | "lateralG" | "powerToWeight" | "cost" | "dragCoeff" | "downforce" | "reliability";

const ALL: NeonKPIMetricKey[] = ["power","torque","weight","topSpeed","accel0_60","accel0_100","accel0_200","quarterMile","brakingDist","lateralG","powerToWeight","cost","dragCoeff","downforce","reliability"];

export function NeonPerformanceKPIGrid({ sim, metrics = ALL, className = "" }: { sim: SimResult; metrics?: NeonKPIMetricKey[]; className?: string }) {
  const p2w = sim.weight > 0 ? (sim.peakPower / (sim.weight / 1000)).toFixed(0) : "0";
  const a200 = (sim.accel0_100 + sim.accel100_200).toFixed(2);
  const D: Record<NeonKPIMetricKey, { l: string; v: number | string; u?: string; a: string; i: React.ReactNode; s?: string }> = {
    power: { l: "PEAK POWER", v: sim.peakPower, u: "hp", a: "#8fb9d9", i: <Zap size={12} />, s: sim.peakPowerRpm ? "@ " + sim.peakPowerRpm + " rpm" : undefined },
    torque: { l: "PEAK TORQUE", v: sim.peakTorque, u: "Nm", a: "#c9974f", i: <Gauge size={12} /> },
    weight: { l: "CURB WEIGHT", v: sim.weight, u: "kg", a: "#94a3b8", i: <Weight size={12} /> },
    topSpeed: { l: "TOP SPEED", v: sim.topSpeed, u: "km/h", a: "#57a878", i: <TrendingUp size={12} /> },
    accel0_60: { l: "0-60 MPH", v: sim.accel0_60, u: "s", a: "#cf8a52", i: <Timer size={12} /> },
    accel0_100: { l: "0-100 KM/H", v: sim.accel0_100, u: "s", a: "#c96f6f", i: <Timer size={12} /> },
    accel0_200: { l: "0-200 KM/H", v: a200, u: "s", a: "#b85f5f", i: <Timer size={12} /> },
    quarterMile: { l: "QUARTER MILE", v: sim.quarterMile, u: "s", a: "#9d8fc4", i: <Gauge size={12} />, s: sim.quarterMileSpeed + " km/h" },
    brakingDist: { l: "BRAKING 100-0", v: sim.brakingDist, u: "m", a: "#c96f6f", i: <Shield size={12} /> },
    lateralG: { l: "LATERAL G", v: sim.lateralG, u: "g", a: "#6aa3b8", i: <Gauge size={12} /> },
    powerToWeight: { l: "POWER/WEIGHT", v: p2w, u: "hp/t", a: "#8fb9d9", i: <Zap size={12} /> },
    cost: { l: "TOTAL COST", v: "$" + (((sim.totalCost || sim.vehicleCost || 0) / 1000).toFixed(0)) + "k", a: "#d9b36c", i: <DollarSign size={12} /> },
    dragCoeff: { l: "DRAG Cd", v: sim.dragCoeff.toFixed(3), a: "#9188b8", i: <Wind size={12} /> },
    downforce: { l: "DOWNFORCE", v: sim.downforce, u: "kg", a: "#7fb5d8", i: <Wind size={12} /> },
    reliability: { l: "RELIABILITY", v: (sim.reliability * 100).toFixed(0), u: "%", a: "#57a878", i: <Shield size={12} /> },
  };
  return (
    <div className={"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 " + className}>
      {metrics.map(m => { const d = D[m]; return <NT key={m} label={d.l} value={d.v} unit={d.u} icon={d.i} accent={d.a} sub={d.s} />; })}
    </div>
  );
}
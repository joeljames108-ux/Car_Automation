import React from "react";
import { Car, Zap, Weight, Gauge, Timer, Disc } from "lucide-react";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { AnimatedCounter } from "../../ui/AnimatedCounter";

export interface VehicleStatsPanelProps {
  totalWeight: number;
  powerToWeight: number;
  topSpeed: number;
  zeroToSixty: number;
  quarterMile: number;
  braking100To0: number;
  className?: string;
}

export const VehicleStatsPanel: React.FC<VehicleStatsPanelProps> = ({
  totalWeight,
  powerToWeight,
  topSpeed,
  zeroToSixty,
  quarterMile,
  braking100To0,
  className = "",
}) => {
  return (
    <NeonHorizonGlassPanel
      variant="primary"
      glow="none"
      corners="reticle"
      header={{
        title: "VEHICLE STATS",
        icon: <Car size={14} />,
      }}
      className={`p-4 ${className}`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Total Weight */}
        <div className="p-3 rounded-xl bg-[#0e1626]/70 border border-white/6 flex flex-col justify-between">
          <span className="nh-label-caps text-slate-400 text-[9px] mb-1">TOTAL WEIGHT</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold nh-font-headline text-slate-100">
              <AnimatedCounter value={totalWeight} />
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">kg</span>
          </div>
        </div>

        {/* Power / Weight */}
        <div className="p-3 rounded-xl bg-[#0e1626]/70 border border-white/6 flex flex-col justify-between">
          <span className="nh-label-caps text-slate-400 text-[9px] mb-1">POWER / WEIGHT</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold nh-font-headline text-slate-100">
              <AnimatedCounter value={Math.round(powerToWeight)} />
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">hp/t</span>
          </div>
        </div>

        {/* Top Speed */}
        <div className="p-3 rounded-xl bg-[#0e1626]/70 border border-white/6 flex flex-col justify-between">
          <span className="nh-label-caps text-slate-400 text-[9px] mb-1">TOP SPEED</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold nh-font-headline text-slate-100">
              <AnimatedCounter value={topSpeed} />
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">km/h</span>
          </div>
        </div>

        {/* 0-60 MPH */}
        <div className="p-3 rounded-xl bg-[#0e1626]/70 border border-white/6 flex flex-col justify-between">
          <span className="nh-label-caps text-slate-400 text-[9px] mb-1">0-60 MPH</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold nh-font-headline text-emerald-300">
              {zeroToSixty.toFixed(2)}
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">s</span>
          </div>
        </div>

        {/* Quarter Mile */}
        <div className="p-3 rounded-xl bg-[#0e1626]/70 border border-white/6 flex flex-col justify-between">
          <span className="nh-label-caps text-slate-400 text-[9px] mb-1">QUARTER MILE</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold nh-font-headline text-amber-300">
              {quarterMile.toFixed(2)}
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">s</span>
          </div>
        </div>

        {/* Braking 100-0 */}
        <div className="p-3 rounded-xl bg-[#0e1626]/70 border border-white/6 flex flex-col justify-between">
          <span className="nh-label-caps text-slate-400 text-[9px] mb-1">BRAKING 100-0</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold nh-font-headline text-rose-300">
              {braking100To0.toFixed(1)}
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">m</span>
          </div>
        </div>
      </div>
    </NeonHorizonGlassPanel>
  );
};

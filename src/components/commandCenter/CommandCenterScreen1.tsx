// ============================================================================
// COMMAND CENTER — CONTENT STATE 01 (POWERTRAIN, PERFORMANCE, AERO & THERMAL)
// ============================================================================
// First cinematic content state featuring the exact 2x2 multi-card layout:
// 1. Power & Torque Curves Dyno Chart (Parallax Left)
// 2. Dynamic Performance Metrics (Parallax Up)
// 3. Aerodynamics Polars & Downforce (Parallax Down)
// 4. Thermal & Electrical Health Telemetry (Parallax Right)
// ============================================================================

import React from "react";
import {
  TrendingUp,
  Gauge,
  Wind,
  Thermometer,
  Zap,
  Battery,
  Activity,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { Section, StatTile } from "../ui/Controls";
import { LineChart } from "../ui/LineChart";
import { PowerTorqueCurveChart } from "../ui/PowerTorqueCurveChart";
import type { SimResult, VehicleDesign } from "../../sim/types";

export interface CommandCenterScreen1Props {
  design: VehicleDesign;
  sim: SimResult;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function SystemBar({
  label,
  value,
  good,
  invert,
  icon,
}: {
  label: string;
  value: number;
  good: number;
  invert?: boolean;
  icon?: React.ReactNode;
}) {
  const isGood = invert ? value <= good : value >= good;
  const isWarn = invert ? value > good * 1.3 : value < good * 0.7;
  const color = isGood ? "bg-emerald-400" : isWarn ? "bg-rose-500" : "bg-amber-400";
  const glow = isGood ? "rgba(52, 211, 153, 0.4)" : isWarn ? "rgba(244, 63, 94, 0.4)" : "rgba(251, 191, 36, 0.4)";
  const pct = Math.max(0, Math.min(100, value * 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
          {icon}
          {label}
        </span>
        <span className="font-mono text-xs text-slate-200 font-bold">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-base-850/90 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%`, boxShadow: `0 0 10px ${glow}` }}
        />
      </div>
    </div>
  );
}

export const CommandCenterScreen1: React.FC<CommandCenterScreen1Props> = ({ design, sim }) => {
  const dragSeries = [
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.drag })), color: "#fbbf24", fill: true },
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.downforce })), color: "#22c55e" },
  ];

  return (
    <div className="w-full space-y-4">
      {/* ── 2x2 CINEMATIC PRIMARY ANALYTICS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1 (Top-Left): Power & Torque Curves (Internal Parallax: Moves Left) */}
        <div className="cinematic-card-left">
          <Section title="POWER & TORQUE CURVES" icon={<TrendingUp size={16} className="text-amber-400" />}>
            <PowerTorqueCurveChart powerCurve={sim.powerCurve} height={220} />
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-slate-300 font-bold">Horsepower (HP)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="text-slate-300 font-bold">Torque (Nm)</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Redline: <span className="text-rose-400 font-bold">{sim.redline || 8500} RPM</span>
              </div>
            </div>
          </Section>
        </div>

        {/* Card 2 (Top-Right): Dynamic Performance Metrics (Internal Parallax: Moves Up) */}
        <div className="cinematic-card-top">
          <Section title="PERFORMANCE METRICS" icon={<Gauge size={16} className="text-sky-400" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <StatTile
                label="0-60 MPH"
                value={sim.accel0_60}
                unit="s"
                accent={sim.accel0_60 < 3.2 ? "ok" : "default"}
              />
              <StatTile label="TOP SPEED" value={sim.topSpeed} unit="km/h" accent="accent" />
              <StatTile
                label="QUARTER MILE"
                value={sim.quarterMile}
                unit="s"
                sub={`${sim.quarterMileSpeed} km/h`}
              />
              <StatTile label="LATERAL G" value={sim.lateralG} unit="g" accent="accent" />
              <StatTile
                label="BRAKING (100-0)"
                value={sim.brakingDist}
                unit="m"
                accent={sim.brakingDist < 34 ? "ok" : "default"}
              />
              <StatTile
                label="POWER-TO-WEIGHT"
                value={(sim.peakPower / (sim.weight / 1000)).toFixed(0)}
                unit="hp/t"
                accent="accent"
              />
            </div>
          </Section>
        </div>

        {/* Card 3 (Bottom-Left): Aerodynamics (Internal Parallax: Moves Down) */}
        <div className="cinematic-card-bottom">
          <Section title="AERODYNAMICS" icon={<Wind size={16} className="text-teal-400" />}>
            <LineChart series={dragSeries} xLabel="Speed" xUnit="km/h" yLabel="Force" yUnit="N" height={180} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
              <StatTile label="DRAG CD" value={sim.dragCoeff.toFixed(3)} accent="accent" />
              <StatTile
                label="LIFT CL"
                value={sim.liftCoeff.toFixed(3)}
                accent={sim.liftCoeff < 0 ? "ok" : "warn"}
              />
              <StatTile label="DOWNFORCE" value={sim.downforce} unit="N" accent="accent" />
              <StatTile label="AERO BALANCE" value={`${(sim.aeroBalance * 100).toFixed(0)}%`} unit="F" />
            </div>
          </Section>
        </div>

        {/* Card 4 (Bottom-Right): Thermal & Electrical (Internal Parallax: Moves Right) */}
        <div className="cinematic-card-right">
          <Section title="THERMAL & ELECTRICAL" icon={<Thermometer size={16} className="text-amber-400" />}>
            <div className="space-y-3">
              <SystemBar
                label="Engine Cooling Margin"
                value={sim.coolingMargin}
                good={0.5}
                icon={<Thermometer size={12} className="text-amber-400" />}
              />
              <SystemBar
                label="Brake Thermal Dissipation"
                value={sim.brakeCooling}
                good={0.5}
                icon={<Activity size={12} className="text-amber-400" />}
              />
              <SystemBar
                label="Radiator Aero Efficiency"
                value={sim.coolingEfficiency}
                good={0.7}
                icon={<Wind size={12} className="text-teal-400" />}
              />
              {(sim.isElectric || sim.isHybrid) ? (
                <>
                  <SystemBar
                    label="HV Battery Health & SOC"
                    value={0.88}
                    good={0.7}
                    icon={<Battery size={12} className="text-emerald-400" />}
                  />
                  <SystemBar
                    label="Inverter Regen Efficiency"
                    value={sim.regenEfficiency}
                    good={0.7}
                    icon={<Zap size={12} className="text-yellow-400" />}
                  />
                </>
              ) : (
                <SystemBar
                  label="Knock Safety Margin"
                  value={1 - (sim.knockRisk || 0)}
                  good={0.7}
                  icon={<Flame size={12} className="text-rose-400" />}
                />
              )}
              <SystemBar
                label="Auxiliary Electrical Load"
                value={clamp(sim.infotainment.powerDraw / 200, 0, 1)}
                good={0.4}
                invert
                icon={<Zap size={12} className="text-amber-400" />}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandCenterScreen1);

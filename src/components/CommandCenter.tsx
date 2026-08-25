// ============================================================================
// CENTRAL ENGINEERING COMMAND CENTER — CINEMATIC FULL-SCREEN VIEWPORT
// ============================================================================
// Main operational engineering hub featuring the persistent 6-pill specification
// top bar and scroll-driven 3D cinematic transitions between:
// • Screen 1: Power / Torque / Performance / Aero / Thermal
// • Screen 2: Chassis / Reliability / Reviews / AI Next Steps
// ============================================================================

import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Gauge,
  Car,
  Fuel,
  Cog,
  CircleDot,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { useCompany } from "../state/CompanyContext";
import { computeScores, computeSummary } from "../sim/reviews";
import { CinematicScrollViewport, type CinematicSceneConfig } from "./ui/cinematic/CinematicScrollViewport";
import { CommandCenterScreen1 } from "./commandCenter/CommandCenterScreen1";
import { CommandCenterScreen2, type Recommendation } from "./commandCenter/CommandCenterScreen2";
import { ENGINE_LAYOUTS, CHASSIS_TYPES, TIRE_COMPOUNDS } from "../sim/constants";
import type { SimResult, VehicleDesign } from "../sim/types";

interface CommandCenterProps {
  onSelectStage?: (stage: string) => void;
}

function analyzeDesign(design: VehicleDesign, sim: SimResult): Recommendation[] {
  const recs: Recommendation[] = [];
  const e = design.engine;

  if (sim.knockRisk > 0.6) {
    recs.push({
      id: "knock",
      priority: "critical",
      category: "Engine",
      title: "Reduce knock risk",
      detail: `Knock risk at ${(sim.knockRisk * 100).toFixed(0)}%. Lower compression ratio or boost pressure to protect the engine.`,
      metric: `${(sim.knockRisk * 100).toFixed(0)}%`,
      target: "<40%",
    });
  }
  if (sim.coolingMargin < 0.4) {
    recs.push({
      id: "cooling",
      priority: "high",
      category: "Engine",
      title: "Improve cooling capacity",
      detail: `Cooling margin is ${(sim.coolingMargin * 100).toFixed(0)}%. Increase radiator size or add oil cooler.`,
      metric: `${(sim.coolingMargin * 100).toFixed(0)}%`,
      target: ">50%",
    });
  }
  if (sim.turboLag > 0.6 && e.intake !== "na") {
    recs.push({
      id: "lag",
      priority: "medium",
      category: "Engine",
      title: "Reduce turbo lag",
      detail: `Turbo lag is ${sim.turboLag.toFixed(2)}s. Consider bi-turbo or compound turbo for better response.`,
      metric: `${sim.turboLag.toFixed(2)}s`,
      target: "<0.4s",
    });
  }
  if (sim.maxPistonSpeed > 24) {
    recs.push({
      id: "piston",
      priority: "high",
      category: "Engine",
      title: "High piston speed",
      detail: `Max piston speed ${sim.maxPistonSpeed.toFixed(1)} m/s threatens reliability. Reduce stroke or lower redline.`,
      metric: `${sim.maxPistonSpeed.toFixed(1)} m/s`,
      target: "<24 m/s",
    });
  }
  if (sim.dragCoeff > 0.42) {
    recs.push({
      id: "drag",
      priority: "high",
      category: "Aero",
      title: "Reduce drag coefficient",
      detail: `Cd of ${sim.dragCoeff.toFixed(3)} is limiting top speed. Smooth body shape, add wheel covers, or reduce wing angle.`,
      metric: `${sim.dragCoeff.toFixed(3)}`,
      target: "<0.38",
    });
  }
  if (sim.separationRisk > 0.55) {
    recs.push({
      id: "separation",
      priority: "critical",
      category: "Aero",
      title: "Flow separation risk",
      detail: `Separation risk at ${(sim.separationRisk * 100).toFixed(0)}%. Reduce diffuser angle or wing AoA.`,
      metric: `${(sim.separationRisk * 100).toFixed(0)}%`,
      target: "<45%",
    });
  }
  if (sim.aeroBalance < 0.42 || sim.aeroBalance > 0.62) {
    recs.push({
      id: "balance",
      priority: "high",
      category: "Aero",
      title: sim.aeroBalance < 0.42 ? "Add front downforce" : "Add rear downforce",
      detail: `Aero balance at ${(sim.aeroBalance * 100).toFixed(0)}% front. ${sim.aeroBalance < 0.42 ? "Increase splitter or front wing." : "Increase rear wing angle."}`,
      metric: `${(sim.aeroBalance * 100).toFixed(0)}% F`,
      target: "45-55% F",
    });
  }
  if (sim.weight > 1800) {
    recs.push({
      id: "weight",
      priority: "high",
      category: "Chassis",
      title: "Reduce vehicle weight",
      detail: `Weight of ${sim.weight} kg hurts acceleration and handling. Consider lighter chassis or strip interior.`,
      metric: `${sim.weight} kg`,
      target: "<1600 kg",
    });
  }

  return recs;
}

export function CommandCenter({ onSelectStage }: CommandCenterProps = {}) {
  const { design, sim } = useDesign();
  const { company } = useCompany();
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  const scores = useMemo(() => computeScores(design, sim), [design, sim]);
  const summary = useMemo(() => computeSummary(scores), [scores]);
  const recommendations = useMemo<Recommendation[]>(() => analyzeDesign(design, sim), [design, sim]);

  const layout = ENGINE_LAYOUTS[design.engine.layout];
  const chassis = CHASSIS_TYPES[design.vehicle.chassis];
  const tire = TIRE_COMPOUNDS[design.vehicle.tireCompound];

  // ── Persistent Top 6-Pill Specification Header Bar (Matching Exact UI Screenshot) ──
  const persistentHeader = (
    <div className="w-full mb-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="panel bg-base-900/90 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-center shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Layout</span>
          <span className="text-base font-bold text-slate-100 truncate">
            {layout?.label || design.engine.layout.toUpperCase()}
          </span>
        </div>
        <div className="panel bg-base-900/90 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-center shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Displacement</span>
          <span className="text-base font-bold font-mono text-cyan-300">
            {sim.displacement.toLocaleString()} <span className="text-xs text-slate-400 font-normal">cc</span>
          </span>
        </div>
        <div className="panel bg-base-900/90 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-center shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Chassis Structure</span>
          <span className="text-base font-bold text-slate-100 truncate">
            {chassis?.label || design.vehicle.chassis}
          </span>
        </div>
        <div className="panel bg-base-900/90 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-center shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Tire Compound</span>
          <span className="text-base font-bold text-slate-100 truncate">
            {tire?.label || design.vehicle.tireCompound}
          </span>
        </div>
        <div className="panel bg-base-900/90 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-center shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Total Weight</span>
          <span className="text-base font-bold font-mono text-amber-300">
            {sim.weight.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg</span>
          </span>
        </div>
        <div className="panel bg-base-900/90 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-center shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Peak Power</span>
          <span className="text-base font-bold font-mono text-cyan-400">
            {sim.peakPower} <span className="text-xs text-slate-400 font-normal">hp</span>
          </span>
        </div>
      </div>
    </div>
  );

  // ── CINEMATIC SCENE DEFINITIONS ──
  const scenes: CinematicSceneConfig[] = useMemo(
    () => [
      {
        id: "screen_01_powertrain_performance",
        title: "POWER / TORQUE / AERO / THERMAL",
        subtitle: "Dyno curves, 0-60 acceleration, downforce & thermal load",
        badge: "STATE 01",
        icon: <TrendingUp size={14} className="text-cyan-400" />,
        component: <CommandCenterScreen1 design={design} sim={sim} />,
      },
      {
        id: "screen_02_reliability_market",
        title: "RELIABILITY / REVIEWS / AI STRATEGY",
        subtitle: "Chassis structure, safety ratings, customer satisfaction & next steps",
        badge: "STATE 02",
        icon: <ShieldCheck size={14} className="text-emerald-400" />,
        component: (
          <CommandCenterScreen2
            design={design}
            sim={sim}
            scores={scores}
            summary={summary}
            recommendations={recommendations}
            onSelectStage={onSelectStage}
          />
        ),
      },
    ],
    [design, sim, scores, summary, recommendations, onSelectStage]
  );

  return (
    <div className="w-full">
      {/* ── CINEMATIC SCROLL-DRIVEN VIEWPORT CONTAINER ── */}
      <CinematicScrollViewport
        scenes={scenes}
        activeSceneIndex={activeSceneIndex}
        onSceneChange={setActiveSceneIndex}
        persistentHeader={persistentHeader}
      />
    </div>
  );
}

export default CommandCenter;

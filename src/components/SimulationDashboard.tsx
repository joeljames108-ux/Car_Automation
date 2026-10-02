import { Activity, Gauge, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section } from "./ui/Controls";
import { PerformanceKPIGrid } from "./ui/PerformanceKPIGrid";
import { PowerTorqueCurveChart } from "./ui/PowerTorqueCurveChart";
import { LapTimesPanel } from "./ui/LapTimesPanel";

interface SimulationDashboardProps {
  onSelectStage?: (stage: any) => void;
}

export function SimulationDashboard({ onSelectStage }: SimulationDashboardProps = {}) {
  const { design, sim } = useDesign();

  return (
    <div className="space-y-4 stagger">
      {/* Top Banner with Navigation */}
      <div className="panel p-5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(59,130,246,0.35), transparent 60%)" }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <Activity size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono font-bold tracking-wider">
                  STAGE 6: SIMULATION & PROVING GROUND
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">6. Vehicle Dynamics & Simulation</h2>
              <p className="text-xs text-slate-400">Multi-physics lap simulator, acceleration benchmark, and power dyno curves</p>
            </div>
          </div>

          {onSelectStage && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectStage("create_vehicle_hub")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all shadow-sm"
              >
                <ArrowLeft size={13} />
                <span>Vehicle Hub</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <Section title="Performance Summary" icon={<Gauge size={16} />}>
        <PerformanceKPIGrid sim={sim} />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger">
        <Section title="Power & Torque Curve" icon={<Activity size={16} />}>
          <PowerTorqueCurveChart powerCurve={sim.powerCurve} height={220} />
        </Section>

        <LapTimesPanel lapTimes={sim.lapTimes} design={design} sim={sim} mode="bars_only" />
      </div>

      <LapTimesPanel lapTimes={sim.lapTimes} design={design} sim={sim} mode="table_only" />

      {/* Bottom Stage Progression Bar */}
      {onSelectStage && (
        <div className="panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-500/30 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 shadow-xl rounded-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              <CheckCircle2 size={13} />
              <span>SIMULATION TELEMETRY BENCHMARKED</span>
            </div>
            <div className="text-sm font-bold text-slate-100">
              0-60 mph: {sim.accel0_60?.toFixed(2) || "—"}s · Top Speed: {Math.round(sim.topSpeed || 0)} mph
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Advance to 7. Final Build or return to Vehicle Creation Hub
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectStage("create_vehicle_hub")}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold transition-all"
            >
              ← HUB
            </button>
            <button
              type="button"
              onClick={() => onSelectStage("manufacturing")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>PROCEED TO 7. MANUFACTURE →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

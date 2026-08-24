import React, { useState } from "react";
import {
  Factory,
  DollarSign,
  Activity,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { useCompany } from "../../../state/CompanyContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { RoboticFactorySequencer } from "../../assembly/RoboticFactorySequencer";
import { ManufacturingDesigner } from "../../ManufacturingDesigner";

type FactoryTab = "robotic_line" | "production_pipeline" | "station_telemetry";

export function NeonFactoryFloor() {
  const { design, sim } = useDesign();
  const { company } = useCompany();

  const [activeTab, setActiveTab] = useState<FactoryTab>("robotic_line");

  const stations = [
    { name: "Station 1: Prepreg Carbon Fiber Autoclave", status: "Active", cycleTime: "14.2 min", yieldRate: "99.4%", accent: "cyan" as const },
    { name: "Station 2: Robotic Chassis Marriage Jig", status: "Active", cycleTime: "8.5 min", yieldRate: "99.8%", accent: "magenta" as const },
    { name: "Station 3: Powertrain & Dyno Calibration", status: "Active", cycleTime: "11.0 min", yieldRate: "99.1%", accent: "gold" as const },
    { name: "Station 4: Automated Laser Paint Booth", status: "Active", cycleTime: "18.4 min", yieldRate: "98.7%", accent: "emerald" as const },
    { name: "Station 5: Final End-of-Line Telemetry Audit", status: "Active", cycleTime: "6.2 min", yieldRate: "100.0%", accent: "cyan" as const },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header Banner */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "AUTOMATED ROBOTIC ASSEMBLY & FINANCIAL MATRIX",
          subtitle: "Real-time manufacturing yield, assembly line robotics, and unit profitability",
          icon: <Factory size={18} />,
          badge: <NeonHorizonBadge variant="live">5 STATIONS OPERATIONAL</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard
            label="TOTAL COMPANY REVENUE"
            value={`$${(company.totalRevenue / 1e6).toFixed(2)}M`}
            accentColor="emerald"
          />
          <NeonHorizonDataCard
            label="ESTIMATED UNIT COST"
            value={`$${(sim.totalCost / 1e3).toFixed(1)}k`}
            accentColor="cyan"
          />
          <NeonHorizonDataCard
            label="TARGET MARGIN"
            value="38.5%"
            accentColor="gold"
          />
          <NeonHorizonDataCard
            label="FACTORY CYCLE TIME"
            value="48.3 min"
            accentColor="magenta"
          />
        </div>
      </NeonHorizonGlassPanel>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "robotic_line" as const, label: "Robotic Factory Sequencer", icon: <Cpu size={14} /> },
          { id: "production_pipeline" as const, label: "Manufacturing Pipeline Designer", icon: <Sliders size={14} /> },
          { id: "station_telemetry" as const, label: "Assembly Station Metrics", icon: <Activity size={14} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMITabSound();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs nh-font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
 isActive
 ? "bg-sky-400/20 text-sky-200 border border-sky-400/35"
 : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
 }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View 1: Robotic Factory Sequencer */}
      {activeTab === "robotic_line" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#070e1c] p-3">
          <RoboticFactorySequencer />
        </div>
      )}

      {/* View 2: Manufacturing Designer */}
      {activeTab === "production_pipeline" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#070e1c] p-4">
          <ManufacturingDesigner />
        </div>
      )}

      {/* View 3: Station Telemetry Matrix */}
      {activeTab === "station_telemetry" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((st, idx) => (
            <NeonHorizonGlassPanel
              key={idx}
              variant="primary"
              corners="reticle"
              header={{
                title: st.name.toUpperCase(),
                icon: <Activity size={16} />,
                badge: <NeonHorizonBadge variant="emerald">{st.status}</NeonHorizonBadge>,
              }}
              className="p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-xs text-slate-400 font-mono">CYCLE TIME</span>
                <span className="text-sm font-bold font-mono text-sky-300">{st.cycleTime}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                <span className="text-xs text-slate-400 font-mono">STATION YIELD RATE</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{st.yieldRate}</span>
              </div>
            </NeonHorizonGlassPanel>
          ))}
        </div>
      )}
    </div>
  );
}

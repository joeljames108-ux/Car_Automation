import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
  FileText,
  Wrench,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { ApexAIStudio } from "../../ApexAIStudio";
import { AIAssistant } from "../../AIAssistant";
import { ApexAgentConsole } from "../../agents/ApexAgentConsole";
import { AgentDashboard } from "../../agents/AgentDashboard";
import { AIEngineeringPresets } from "../../agents/AIEngineeringPresets";

type AIStudioTab = "apex_ai_studio" | "ai_presets" | "live_advisory" | "agent_console" | "agent_dashboard" | "quick_recs";

export function NeonAIArchitectStudio() {
  const { design, sim, updateEngine, updateAero, updateVehicle } = useDesign();

  const [activeTab, setActiveTab] = useState<AIStudioTab>("apex_ai_studio");
  const [appliedRecs, setAppliedRecs] = useState<Record<string, boolean>>({});

  const quickAgents = [
    {
      id: "aero_opt",
      name: "Aerodynamics Domain Agent",
      domain: "Aero & CFD",
      rec: "Increase Rear Wing Angle by 3.5° and lower ride height by 5mm to unlock 65N downforce with minimal drag impact.",
      impact: "+65N Downforce · -0.4s Lap Time",
      confidence: "98.4%",
      accent: "cyan" as const,
      onApply: () => {
        updateAero({ wingAngle: (design.vehicle.aero?.wingAngle || 15) + 3.5 });
        updateVehicle({ rideHeight: Math.max(50, design.vehicle.rideHeight - 5) });
      },
    },
    {
      id: "ecu_opt",
      name: "Powertrain & Thermal Agent",
      domain: "ECU / Dyno",
      rec: "Advance ignition timing by +2.0° BTDC and switch fuel map to E85 to increase peak yield by +38 HP safely.",
      impact: "+38 HP · +42 Nm Torque",
      confidence: "99.1%",
      accent: "gold" as const,
      onApply: () => {
        updateEngine({ compressionRatio: Math.min(14.0, design.engine.compressionRatio + 0.3) });
      },
    },
    {
      id: "chassis_opt",
      name: "Suspension Kinematics Agent",
      domain: "Chassis / Rigidity",
      rec: "Stiffen Front Anti-Roll Bar by 12% and switch to Carbon Ceramic Brakes to eliminate high-speed trail-braking oversteer.",
      impact: "+0.18G Lateral Grip · Zero Brake Fade",
      confidence: "97.6%",
      accent: "magenta" as const,
      onApply: () => {
        updateVehicle({ springRateF: Math.min(140, design.vehicle.springRateF + 15) });
      },
    },
    {
      id: "materials_opt",
      name: "Materials & Structural FEA Agent",
      domain: "Manufacturing / FEA",
      rec: "Upgrade frame subframe to Forged Carbon Monocoque tub to shave 52 kg from total vehicle dry mass.",
      impact: "-52 kg Mass · +18 kNm/° Rigidity",
      confidence: "99.5%",
      accent: "emerald" as const,
      onApply: () => {
        updateVehicle({ chassis: "carbon_tub" });
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header Banner */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "APEX AI NEURAL ENGINEERING STUDIO",
          subtitle: "5 Specialized AI Domain Engineers, multi-agent autonomous optimization, telemetry feedback & LLM copilot",
          icon: <Bot size={18} />,
          badge: <NeonHorizonBadge variant="live">5 AI DOMAIN AGENTS ONLINE</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="ACTIVE AGENTS" value="5" unit="NEURAL" accentColor="cyan" />
          <NeonHorizonDataCard label="EST. LAP SAVINGS" value="-2.14" unit="s" accentColor="emerald" />
          <NeonHorizonDataCard label="POWER GAIN POTENTIAL" value="+84" unit="HP" accentColor="gold" />
          <NeonHorizonDataCard label="CONFIDENCE RATING" value="98.7%" accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "apex_ai_studio" as const, label: "Apex AI Neural Studio", icon: <Bot size={14} /> },
          { id: "ai_presets" as const, label: "AI Engineering Presets", icon: <Sparkles size={14} /> },
          { id: "live_advisory" as const, label: "Live Engineering Advisory", icon: <FileText size={14} /> },
          { id: "agent_console" as const, label: "Multi-Agent Console", icon: <Terminal size={14} /> },
          { id: "agent_dashboard" as const, label: "Agent Status Dashboard", icon: <Activity size={14} /> },
          { id: "quick_recs" as const, label: "Quick-Apply Presets", icon: <Sparkles size={14} /> },
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

      {/* View 1: Apex AI Studio (5 Engineers + Chat + Recommendations) */}
      {activeTab === "apex_ai_studio" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#070e1c]">
          <ApexAIStudio />
        </div>
      )}

      {/* View 2: AI Engineering Presets & Architect Templates */}
      {activeTab === "ai_presets" && (
        <div className="w-full">
          <AIEngineeringPresets />
        </div>
      )}

      {/* View 2: Live Engineering Advisory (AIAssistant) */}
      {activeTab === "live_advisory" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#070e1c] p-4">
          <AIAssistant embedded={true} />
        </div>
      )}

      {/* View 3: Multi-Agent Execution Console */}
      {activeTab === "agent_console" && (
        <div className="w-full min-h-[550px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#070e1c]">
          <ApexAgentConsole
            engineConfig={design.engine}
            powerHp={sim.peakPower}
            weightKg={sim.weight}
            onApplyTuning={(changes) => updateEngine(changes)}
          />
        </div>
      )}

      {/* View 4: Agent Status Dashboard */}
      {activeTab === "agent_dashboard" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#070e1c] p-4">
          <AgentDashboard />
        </div>
      )}

      {/* View 5: Quick-Apply Presets */}
      {activeTab === "quick_recs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickAgents.map((ag) => {
            const isApplied = appliedRecs[ag.id];
            return (
              <NeonHorizonGlassPanel
                key={ag.id}
                variant="primary"
                corners="reticle"
                header={{
                  title: ag.name.toUpperCase(),
                  subtitle: `Domain: ${ag.domain} · Confidence: ${ag.confidence}`,
                  icon: <Bot size={16} />,
                  badge: isApplied ? (
                    <NeonHorizonBadge variant="emerald">APPLIED</NeonHorizonBadge>
                  ) : (
                    <NeonHorizonBadge variant="live">READY</NeonHorizonBadge>
                  ),
                }}
                className="p-6 flex flex-col justify-between gap-5"
              >
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-200 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/8">
                    "{ag.rec}"
                  </p>
                  <div className="flex items-center gap-2 text-xs nh-font-mono text-sky-300 font-bold">
                    <TrendingUp size={14} className="text-sky-400" />
                    <span>Impact: {ag.impact}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-[10px] nh-font-mono text-slate-400">STATUS: {isApplied ? "ACTIVE" : "STANDBY"}</span>
                  <NeonHorizonButton
                    variant={isApplied ? "secondary" : "primary"}
                    size="sm"
                    icon={isApplied ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />}
                    onClick={() => {
                      playHMIClickSound();
                      ag.onApply();
                      setAppliedRecs((prev) => ({ ...prev, [ag.id]: true }));
                    }}
                  >
                    {isApplied ? "APPLIED" : "APPLY OPTIMIZATION"}
                  </NeonHorizonButton>
                </div>
              </NeonHorizonGlassPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}

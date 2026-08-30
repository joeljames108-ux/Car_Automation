// ===================================================================
// APEX ENGINEER — AUTONOMOUS AI AGENT CONSOLE UI
// Interactive Multi-Agent Control Suite with One-Click Auto-Tune, QA Diagnostics & Chat
// ===================================================================

import React, { useState, useMemo } from "react";
import {
  Bot,
  Zap,
  ShieldCheck,
  Flag,
  MessageSquare,
  Sparkles,
  Check,
  AlertTriangle,
  Send,
  Gauge,
  Activity,
  Flame,
  Award,
  RefreshCw,
} from "lucide-react";
import { EngineConfig } from "../../sim/types";
import { ComponentId, AssemblyPhase } from "../../sim/assemblyTypes";
import {
  AgentMode,
  TuningPreset,
  ChiefPowertrainAgent,
  RoboticAssemblyQAAgent,
  RaceStrategyAgent,
} from "../../sim/agents/apexAgentEngine";

interface ApexAgentConsoleProps {
  engineConfig: Partial<EngineConfig>;
  installedComponents?: ComponentId[];
  activeComponentId?: ComponentId | null;
  phase?: AssemblyPhase;
  powerHp?: number;
  weightKg?: number;
  onApplyTuning?: (changes: Partial<EngineConfig>) => void;
  className?: string;
}

export function ApexAgentConsole({
  engineConfig,
  installedComponents = [],
  activeComponentId = null,
  phase = "idle",
  powerHp = 650,
  weightKg = 1450,
  onApplyTuning,
  className = "",
}: ApexAgentConsoleProps) {
  const [activeMode, setActiveMode] = useState<AgentMode>("powertrain");
  const [selectedPreset, setSelectedPreset] = useState<TuningPreset>("track_attack");
  const [appliedPreset, setAppliedPreset] = useState<TuningPreset | null>(null);

  // Chat Q&A Drawer State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "agent"; text: string }>>([
    {
      sender: "agent",
      text: "👋 Welcome to Apex Autonomous Agent Console! I am your Chief Powertrain Engineer & QA Inspector. Ask me anything about ECU tuning, assembly torque specs, or track lap times.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const recommendation = useMemo(
    () => ChiefPowertrainAgent.getTuningPreset(selectedPreset, engineConfig),
    [selectedPreset, engineConfig]
  );
  const diagnostics = useMemo(
    () => ChiefPowertrainAgent.diagnose(engineConfig),
    [engineConfig]
  );
  const qaReport = useMemo(
    () => RoboticAssemblyQAAgent.inspectAssembly(installedComponents, activeComponentId, phase),
    [installedComponents, activeComponentId, phase]
  );
  const circuitPredictions = useMemo(
    () => RaceStrategyAgent.predictCircuits(powerHp, weightKg),
    [powerHp, weightKg]
  );

  const handleApplyPreset = () => {
    if (onApplyTuning) {
      onApplyTuning(recommendation.changes);
      setAppliedPreset(selectedPreset);
      setTimeout(() => setAppliedPreset(null), 3000);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    // Simulate Agent Natural Language Response
    setTimeout(() => {
      let reply = "I've analyzed your powertrain configuration. ";
      const lower = userText.toLowerCase();

      if (lower.includes("boost") || lower.includes("turbo")) {
        reply += `Current turbo boost is set to ${engineConfig.boostPressure || 1.2} bar. Recommended intercooler efficiency is 90%+ to prevent detonation under high load.`;
      } else if (lower.includes("power") || lower.includes("hp")) {
        reply += `Estimated peak output is ${powerHp} HP. Switching to Qualifying 100% Boost preset will add approx +${recommendation.expectedPowerDeltaHp} HP!`;
      } else if (lower.includes("knock") || lower.includes("detonation")) {
        reply += `Current AFR is ${engineConfig.afr || 14.0}:1 with ${engineConfig.ignitionTiming || 20}° BTDC timing. Fuel octane requirement is 98 RON.`;
      } else if (lower.includes("track") || lower.includes("nurburgring")) {
        reply += `Predicted Nürburgring Nordschleife lap time is ${circuitPredictions[0].lapTimeFormatted} with a top speed of ${circuitPredictions[0].topSpeedKmh} km/h.`;
      } else {
        reply += `All 12 assembly components and engine vitals are running within OEM specifications! Power-to-weight ratio is ${(powerHp / (weightKg / 1000)).toFixed(1)} hp/ton.`;
      }

      setChatMessages((prev) => [...prev, { sender: "agent", text: reply }]);
    }, 600);
  };

  return (
    <div
      className={`w-full bg-slate-900/80/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-slate-100 select-none space-y-4 ${className}`}
    >
      {/* ── TOP HEADER & AGENT MODE SELECTOR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            <Bot size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-slate-100">
                APEX AUTONOMOUS AGENT SUITE
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold tracking-widest uppercase">
                ACTIVE CO-PILOT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Multi-Agent Powertrain Tuning, Robotic QA & Circuit Strategy
            </p>
          </div>
        </div>

        {/* Agent Mode Navigation Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveMode("powertrain")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeMode === "powertrain"
                ? "bg-amber-500 text-black shadow-md font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap size={14} /> Powertrain Agent
          </button>

          <button
            onClick={() => setActiveMode("assembly_qa")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeMode === "assembly_qa"
                ? "bg-amber-500 text-black shadow-md font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck size={14} /> Assembly QA
          </button>

          <button
            onClick={() => setActiveMode("race_strategy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeMode === "race_strategy"
                ? "bg-amber-500 text-black shadow-md font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flag size={14} /> Race Strategy
          </button>

          <button
            onClick={() => setActiveMode("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeMode === "chat"
                ? "bg-amber-500 text-black shadow-md font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare size={14} /> AI Assistant Q&A
          </button>
        </div>
      </div>

      {/* ── MODE 1: CHIEF POWERTRAIN TUNING AGENT ── */}
      {activeMode === "powertrain" && (
        <div className="space-y-4">
          {/* Preset Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { id: "v12_hybrid_valkyrie", label: "🔥 1,000 HP Valkyrie", desc: "6.4L V12 + 180kW PHEV" },
              { id: "sprint_race", label: "🏁 Sprint Race Attack", desc: "9,000 RPM V8 Twin-Turbo" },
              { id: "high_downforce", label: "🌪️ High Downforce", desc: "Monaco Ground Effect GT" },
              { id: "fuel_efficient", label: "🌱 EcoStream Hybrid", desc: "43% BTE Lean Atkinson" },
              { id: "balanced_sport", label: "⚖️ Balanced Sport GT", desc: "3.0L V6 Golden Ratio" },
              { id: "gt3_spec_r", label: "🏎️ GT3 Spec-R", desc: "FIA Homologated 620 HP" },
              { id: "track_attack", label: "🏎️ Track Attack", desc: "Balanced Circuit Tune" },
              { id: "qualifying_max", label: "⚡ Quali 100% Boost", desc: "Max Output Flying Lap" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p.id as TuningPreset)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPreset === p.id
                    ? "bg-amber-500/15 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-mono font-extrabold">{p.label}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>

          {/* Selected Tuning Card & One-Click Apply */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 animate-spin" />
                <h4 className="text-sm font-bold text-slate-100">{recommendation.title}</h4>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    recommendation.knockRiskLevel === "safe"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {recommendation.knockRiskLevel} Knock Risk
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{recommendation.summary}</p>

              <div className="flex items-center gap-4 text-xs font-mono pt-1">
                <span className="text-emerald-400 font-bold">
                  Power Delta: +{recommendation.expectedPowerDeltaHp} HP
                </span>
                <span className="text-amber-400 font-bold">
                  AFR Target: {recommendation.changes.afr || 12.2}:1
                </span>
                <span className="text-amber-400 font-bold">
                  Timing: {recommendation.changes.ignitionTiming || 28}° BTDC
                </span>
              </div>
            </div>

            <button
              onClick={handleApplyPreset}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                appliedPreset === selectedPreset
                  ? "bg-emerald-500 text-black font-extrabold"
                  : "bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              }`}
            >
              {appliedPreset === selectedPreset ? (
                <>
                  <Check size={16} /> TUNING APPLIED!
                </>
              ) : (
                <>
                  <Zap size={16} /> AUTO-TUNE ENGINE
                </>
              )}
            </button>
          </div>

          {/* Live Agent Diagnostics */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="text-xs font-mono font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-amber-400" /> Chief Powertrain Live Diagnostics
            </div>
            <div className="space-y-1.5">
              {diagnostics.map((diag, idx) => (
                <div key={idx} className="text-xs font-mono text-slate-300 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  {diag}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 2: ROBOTIC ASSEMBLY QA AGENT ── */}
      {activeMode === "assembly_qa" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Quality Score</span>
              <span className="text-2xl font-mono font-extrabold text-emerald-400 mt-1 block">{qaReport.qualityScore}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Torque Verification</span>
              <span className="text-2xl font-mono font-extrabold text-amber-400 uppercase mt-1 block">{qaReport.torqueVerification}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Deck Clearance</span>
              <span className="text-2xl font-mono font-extrabold text-amber-400 mt-1 block">{qaReport.deckClearanceMm} mm</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> Robotic Inspection Checklist
            </h4>
            <div className="space-y-1.5">
              {qaReport.insights.map((insight, idx) => (
                <div key={idx} className="text-xs font-mono text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 3: MOTORSPORT RACE STRATEGY AGENT ── */}
      {activeMode === "race_strategy" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {circuitPredictions.map((cp, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono font-extrabold text-slate-200 truncate">{cp.circuitName}</span>
                <Flag size={14} className="text-amber-400 shrink-0" />
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Predicted Lap:</span>
                  <span className="text-amber-400 font-extrabold">{cp.lapTimeFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Top Speed:</span>
                  <span className="text-amber-400 font-extrabold">{cp.topSpeedKmh} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fuel / Lap:</span>
                  <span className="text-emerald-400 font-extrabold">{cp.fuelBurnLitersPerLap} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tire Wear / Lap:</span>
                  <span className="text-rose-400 font-extrabold">{cp.tireDegradationPercentPerLap}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODE 4: INTERACTIVE AI ASSISTANT CHAT DRAWER ── */}
      {activeMode === "chat" && (
        <div className="space-y-3">
          <div className="h-44 bg-slate-950/90 border border-slate-800 rounded-2xl p-3 overflow-y-auto space-y-2 font-mono text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl max-w-[85%] ${
                  msg.sender === "user"
                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/30 ml-auto text-right"
                    : "bg-slate-900 text-slate-200 border border-slate-800 mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Chief Engineer Agent (e.g. 'Optimize for 98 RON fuel')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

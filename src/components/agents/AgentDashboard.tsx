// ===================================================================
// AGENT DASHBOARD — Live Autonomous Multi-Agent Engineering Grid
// ===================================================================

import React, { useState } from "react";
import {
  Bot,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
  Filter,
  Layers,
  ChevronRight,
} from "lucide-react";
import { AgentOrchestrator, BaseAgent, AgentFinding } from "../../sim/agents/agentFramework";
import { AgentRegistry } from "../../sim/agents/agentRegistry";
import { AgentDetailPanel } from "./AgentDetailPanel";

interface AgentDashboardProps {
  onApplyRecommendation?: (rec: any) => void;
  className?: string;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  onApplyRecommendation,
  className = "",
}) => {
  const orchestrator = AgentOrchestrator.getInstance();
  const registry = AgentRegistry.getInstance();
  const agents = orchestrator.getAllAgents();
  const [selectedAgent, setSelectedAgent] = useState<BaseAgent | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const aggregateFindings = orchestrator.getAggregateFindings();
  const criticalCount = aggregateFindings.filter((f) => f.severity === "critical").length;
  const warningCount = aggregateFindings.filter((f) => f.severity === "warning").length;

  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      {/* Top Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{agents.length}</div>
            <div className="text-xs text-slate-400 font-medium">Active Autonomous Agents</div>
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{criticalCount}</div>
            <div className="text-xs text-slate-400 font-medium">Critical Design Hazards</div>
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{warningCount}</div>
            <div className="text-xs text-slate-400 font-medium">Optimization Warnings</div>
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">100%</div>
            <div className="text-xs text-slate-400 font-medium">Division Health Index</div>
          </div>
        </div>
      </div>

      {/* Agents Grid Header & Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          <h3 className="text-base font-bold text-white">Autonomous Engineering Division</h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-slate-400" />
          {["all", "powertrain", "dynamics", "vehicle", "racing"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl capitalize font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const { identity } = agent;
          const state = agent.getState();
          const findings = agent.getLatestFindings();
          const hasCritical = findings.some((f) => f.severity === "critical");
          const hasWarning = findings.some((f) => f.severity === "warning");

          return (
            <div
              key={identity.id}
              onClick={() => setSelectedAgent(agent)}
              className="p-5 bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {identity.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                      {identity.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize">{identity.domain}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      state === "alert"
                        ? "bg-rose-500 animate-ping"
                        : state === "recommending"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 capitalize font-medium">{state}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{identity.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400 font-medium">{findings.length} Findings</span>
                <span className="text-cyan-400 flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Inspect</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Agent Inspection Detail Modal */}
      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onApplyRecommendation={onApplyRecommendation}
        />
      )}
    </div>
  );
};

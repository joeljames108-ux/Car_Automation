// ===================================================================
// AGENT DETAIL PANEL — Individual Agent Inspection & History
// ===================================================================

import React from "react";
import { X, Activity, Check, ShieldAlert, Cpu, Sparkles, Clock, ListFilter } from "lucide-react";
import { BaseAgent, AgentFinding } from "../../sim/agents/agentFramework";

interface AgentDetailPanelProps {
  agent: BaseAgent;
  onClose: () => void;
  onApplyRecommendation?: (recommendation: any) => void;
}

export const AgentDetailPanel: React.FC<AgentDetailPanelProps> = ({
  agent,
  onClose,
  onApplyRecommendation,
}) => {
  const { identity } = agent;
  const state = agent.getState();
  const findings = agent.getLatestFindings();
  const memoryHistory = agent.getMemoryStore().getHistory();

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-amber-900/50 border border-amber-800/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-amber-50 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-800/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-amber-800/35/80 border border-amber-700/30">
              {identity.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{identity.name}</h3>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Priority {identity.priority}
                </span>
              </div>
              <p className="text-xs text-amber-200/60 mt-0.5">{identity.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-amber-200/60 hover:text-white hover:bg-amber-800/35 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status & Capabilities */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-amber-950/60 border border-amber-800/30 rounded-2xl flex flex-col gap-1.5">
            <span className="text-xs text-amber-200/60 uppercase font-semibold">Agent Status</span>
            <div className="flex items-center gap-2 font-bold text-sm">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state === "alert"
                    ? "bg-rose-500 animate-ping"
                    : state === "recommending"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
              <span className="capitalize">{state}</span>
            </div>
          </div>

          <div className="p-4 bg-amber-950/60 border border-amber-800/30 rounded-2xl flex flex-col gap-1.5">
            <span className="text-xs text-amber-200/60 uppercase font-semibold">Capabilities</span>
            <div className="flex flex-wrap gap-1">
              {identity.capabilities.map((cap) => (
                <span key={cap} className="px-2 py-0.5 text-[10px] rounded bg-amber-800/35 text-amber-100/80">
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Diagnostics */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-amber-200/60 flex items-center gap-2">
            <Activity size={14} className="text-amber-400" />
            <span>Active Diagnostics ({findings.length})</span>
          </h4>

          {findings.length === 0 ? (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/30 text-center text-xs text-amber-200/60">
              ✅ All systems within optimal engineering tolerances. No active warnings reported.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-amber-950/70 border border-amber-800/30 flex flex-col gap-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{f.title}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-md uppercase font-semibold ${
                        f.severity === "critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-amber-100/80 leading-relaxed">{f.detail}</p>

                  {f.recommendation && onApplyRecommendation && (
                    <button
                      onClick={() => onApplyRecommendation(f.recommendation!)}
                      className="mt-2 self-start px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-semibold transition-colors"
                    >
                      Apply: {f.recommendation.title}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

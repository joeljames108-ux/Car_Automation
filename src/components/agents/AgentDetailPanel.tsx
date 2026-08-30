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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-slate-100 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-slate-800/80 border border-slate-700">
              {identity.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{identity.name}</h3>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Priority {identity.priority}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{identity.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status & Capabilities */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col gap-1.5">
            <span className="text-xs text-slate-400 uppercase font-semibold">Agent Status</span>
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

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col gap-1.5">
            <span className="text-xs text-slate-400 uppercase font-semibold">Capabilities</span>
            <div className="flex flex-wrap gap-1">
              {identity.capabilities.map((cap) => (
                <span key={cap} className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300">
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Diagnostics */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-2">
            <Activity size={14} className="text-amber-400" />
            <span>Active Diagnostics ({findings.length})</span>
          </h4>

          {findings.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
              ✅ All systems within optimal engineering tolerances. No active warnings reported.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2 text-xs"
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
                  <p className="text-slate-300 leading-relaxed">{f.detail}</p>

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

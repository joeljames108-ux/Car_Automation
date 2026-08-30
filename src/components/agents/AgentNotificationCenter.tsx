// ===================================================================
// AGENT NOTIFICATION CENTER — Floating Alerts & Recommended Actions
// ===================================================================

import React, { useState } from "react";
import { AlertTriangle, Info, Check, X, Bell, ChevronRight, Zap } from "lucide-react";
import { AgentFinding, AgentRecommendation } from "../../sim/agents/agentFramework";

interface AgentNotificationCenterProps {
  findings: AgentFinding[];
  onApplyRecommendation?: (recommendation: AgentRecommendation) => void;
  className?: string;
}

export const AgentNotificationCenter: React.FC<AgentNotificationCenterProps> = ({
  findings,
  onApplyRecommendation,
  className = "",
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const activeFindings = findings.filter((f) => !dismissedIds.has(f.id));
  const criticalCount = activeFindings.filter((f) => f.severity === "critical").length;
  const warningCount = activeFindings.filter((f) => f.severity === "warning").length;

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  if (activeFindings.length === 0) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end ${className}`}>
      {/* Floating Badge Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-full shadow-2xl hover:border-amber-400 transition-all text-white font-medium text-xs group"
      >
        <div className="relative">
          <Bell size={16} className="text-amber-400 group-hover:rotate-12 transition-transform" />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          )}
        </div>
        <span>AI Division Diagnostics</span>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/30">
          {activeFindings.length}
        </span>
      </button>

      {/* Expanded Notification Drawer */}
      {isOpen && (
        <div className="mt-3 w-96 max-h-[500px] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-2xl text-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <h4 className="font-semibold text-sm text-white">Live AI Diagnostics</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {activeFindings.map((f) => (
              <div
                key={f.id}
                className={`p-3.5 rounded-xl border text-xs flex flex-col gap-2 relative ${
                  f.severity === "critical"
                    ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                    : f.severity === "warning"
                    ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                    : "bg-amber-950/30 border-amber-500/40 text-amber-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    {f.severity === "critical" ? (
                      <AlertTriangle size={14} className="text-rose-400 shrink-0" />
                    ) : (
                      <Info size={14} className="text-amber-400 shrink-0" />
                    )}
                    <span>{f.title}</span>
                  </div>
                  <button
                    onClick={() => handleDismiss(f.id)}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>

                <p className="text-[11px] leading-relaxed opacity-90">{f.detail}</p>

                {f.recommendation && onApplyRecommendation && (
                  <button
                    onClick={() => {
                      onApplyRecommendation(f.recommendation!);
                      handleDismiss(f.id);
                    }}
                    className="mt-1 flex items-center justify-between px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-300 font-medium text-[11px] transition-colors"
                  >
                    <span>Apply: {f.recommendation.title}</span>
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

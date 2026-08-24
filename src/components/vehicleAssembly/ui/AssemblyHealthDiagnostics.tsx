/**
 * ============================================================================
 * ASSEMBLY HEALTH & CLEARANCE DIAGNOSTICS
 * ============================================================================
 * Displays real-time assembly health score (0-100%), physical clearance issues,
 * structural alignment, and 3D Center of Mass telemetry.
 */

import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Crosshair,
  Maximize2,
  Flame,
  Wind,
  Gauge,
} from "lucide-react";
import { AssemblyHealthReport, ClearanceIssue } from "../../../sim/modularVehicle/AssemblyPackagingValidator";
import { ComputedVehiclePhysicalState } from "../../../sim/modularVehicle/AssemblyRegistryEngine";

interface AssemblyHealthDiagnosticsProps {
  healthReport: AssemblyHealthReport;
  physicalState: ComputedVehiclePhysicalState;
  onFocusIssue?: (issue: ClearanceIssue) => void;
  showCoMGizmo: boolean;
  onToggleCoMGizmo: () => void;
}

export const AssemblyHealthDiagnostics: React.FC<AssemblyHealthDiagnosticsProps> = ({
  healthReport,
  physicalState,
  onFocusIssue,
  showCoMGizmo,
  onToggleCoMGizmo,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/15";
    if (score >= 75) return "text-cyan-400 border-cyan-500/40 bg-cyan-500/15";
    if (score >= 55) return "text-amber-400 border-amber-500/40 bg-amber-500/15";
    return "text-red-400 border-red-500/40 bg-red-500/15";
  };

  return (
    <div className="panel p-3.5 rounded-2xl space-y-3.5 border border-base-800 text-xs font-mono shadow-xl">
      {/* Top Header: Score & Rating */}
      <div className="flex items-center justify-between border-b border-base-800/60 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-cyan-400" />
          <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
            ASSEMBLY HEALTH & PACKAGING STATUS
          </span>
        </div>
        <div className={`px-2.5 py-1 rounded-xl border font-bold text-xs flex items-center gap-1.5 ${getScoreColor(healthReport.score)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>{healthReport.score}/100 QUALITY</span>
        </div>
      </div>

      {/* 4-Domain Health Score Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-2 rounded-xl bg-base-900/60 border border-base-800 text-center">
          <span className="text-[9px] text-slate-500 block uppercase">STRUCTURAL RIGIDITY</span>
          <span className="font-bold text-slate-200 text-xs">{healthReport.structuralIntegrityScore}%</span>
        </div>
        <div className="p-2 rounded-xl bg-base-900/60 border border-base-800 text-center">
          <span className="text-[9px] text-slate-500 block uppercase">CLEARANCE MARGIN</span>
          <span className="font-bold text-cyan-300 text-xs">{healthReport.packagingClearanceScore}%</span>
        </div>
        <div className="p-2 rounded-xl bg-base-900/60 border border-base-800 text-center">
          <span className="text-[9px] text-slate-500 block uppercase">THERMAL CAPACITY</span>
          <span className="font-bold text-amber-300 text-xs">{healthReport.thermalSafetyScore}%</span>
        </div>
        <div className="p-2 rounded-xl bg-base-900/60 border border-base-800 text-center">
          <span className="text-[9px] text-slate-500 block uppercase">AERO STABILITY</span>
          <span className="font-bold text-emerald-300 text-xs">{healthReport.aerodynamicBalanceScore}%</span>
        </div>
      </div>

      {/* Center of Mass (CoM) & Inertia Card */}
      <div className="p-2.5 rounded-xl bg-base-900/80 border border-base-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[10px]">
            <Crosshair size={12} className="text-amber-400" />
            <span>3D CENTER OF MASS (CoM) TELEMETRY</span>
          </div>
          <button
            onClick={onToggleCoMGizmo}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
              showCoMGizmo
                ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-sm"
                : "bg-base-850 border-base-700 text-slate-500 hover:text-slate-300"
            }`}
          >
            {showCoMGizmo ? "✓ 3D DATUM ACTIVE" : "SHOW 3D GIZMO"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px]">
          <div>
            <span className="text-slate-500 block">WEIGHT BIAS</span>
            <strong className="text-slate-200">
              {physicalState.weightDistributionFrontPct}% F / {physicalState.weightDistributionRearPct}% R
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">3D CoM [X,Y,Z]</span>
            <strong className="text-cyan-300">
              [{physicalState.centerOfMassMm[0]}, {physicalState.centerOfMassMm[1]}, {physicalState.centerOfMassMm[2]}] mm
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">UNSPRUNG MASS</span>
            <strong className="text-amber-300">{physicalState.unsprungMassKg} kg</strong>
          </div>
        </div>
      </div>

      {/* Real-time Clearance Diagnostics List */}
      <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
          CLEARANCE & INTERACTION DIAGNOSTICS ({healthReport.issues.length})
        </span>

        {healthReport.issues.map((issue) => {
          const isPass = issue.severity === "PASS";
          const isConflict = issue.severity === "CONFLICT";
          return (
            <div
              key={issue.id}
              onClick={() => onFocusIssue && onFocusIssue(issue)}
              className={`p-2 rounded-xl border flex items-start gap-2 transition-all cursor-pointer ${
                isConflict
                  ? "bg-red-500/10 border-red-500/40 text-red-200 hover:bg-red-500/20"
                  : isPass
                  ? "bg-base-900/40 border-base-800/60 text-slate-400"
                  : "bg-amber-500/10 border-amber-500/40 text-amber-200 hover:bg-amber-500/20"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isConflict ? (
                  <XCircle size={14} className="text-red-400" />
                ) : isPass ? (
                  <CheckCircle2 size={13} className="text-emerald-400" />
                ) : (
                  <AlertTriangle size={13} className="text-amber-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-slate-200 truncate">{issue.title}</span>
                  {issue.clearanceMm !== undefined && (
                    <span className="text-[9px] font-mono text-cyan-400 shrink-0">{issue.clearanceMm}mm</span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 leading-snug line-clamp-2 mt-0.5">{issue.description}</p>
                {issue.recommendation && (
                  <div className="text-[9px] text-cyan-300/90 font-medium mt-1">
                    ↳ Action: {issue.recommendation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * STAGE 13: COMPLETE VEHICLE — HARDWARE VALIDATION, 3D CoM & TRACK SIGN-OFF
 * ============================================================================
 * Final gate of the master 13-stage linear chain:
 * - Hardware validation checklist across all installed subsystems
 * - 3D Center of Mass (CoM) datum readout with gizmo toggle
 * - Track readiness sign-off with chief engineer signature
 */

import React, { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  Wind,
  Gauge,
  ShieldCheck,
  Crosshair,
  PenLine,
} from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface PhysicalStateSummary {
  totalCurbWeightKg: number;
  centerOfMassMm: [number, number, number];
  weightDistributionFrontPct: number;
}

interface VehicleCompletionStageProps {
  assemblyState: InstalledSubsystemsState;
  physicalState?: PhysicalStateSummary;
  onEnterAeroStudio: () => void;
  onToggleCoMGizmo?: () => void;
  showCoMGizmo?: boolean;
  onFinishVehicle: () => void;
}

export const VehicleCompletionStage: React.FC<VehicleCompletionStageProps> = ({
  assemblyState,
  physicalState,
  onEnterAeroStudio,
  onToggleCoMGizmo,
  showCoMGizmo,
  onFinishVehicle,
}) => {
  const [signature, setSignature] = useState("");
  const [checksAcknowledged, setChecksAcknowledged] = useState<Set<string>>(new Set());

  const eng = assemblyState.engine;
  const displacementCc = Math.round(
    Math.PI * Math.pow((eng.bore || 88) / 20, 2) * ((eng.stroke || 82) / 10) * 8
  );
  const estHp = Math.round(
    (displacementCc || 4000) *
      0.14 *
      (eng.intake === "twin_turbo" ? 1.65 : eng.intake === "turbo_single" || eng.intake === "bi_turbo" ? 1.4 : 1.0)
  );
  const topSpeed = Math.round(280 + estHp * 0.12);
  const accel0_100 = (3.8 - (estHp - 450) * 0.002).toFixed(2);

  // ── HARDWARE VALIDATION CHECKLIST (driven by real installed stages) ──
  const requiredStages: { id: keyof typeof assemblyState | string; stageId: any; label: string; detail: string }[] = [
    { id: "s1", stageId: "chassis", label: "Chassis Frame Integrity", detail: "Monocoque tub / spaceframe torque-checked to spec" },
    { id: "s2", stageId: "engine", label: "Engine Drop-In Secured", detail: "Mount anchors at rated clamp load" },
    { id: "s3", stageId: "transmission", label: "Gearbox Mated & Leak-Tested", detail: "Bellhousing concentricity within 0.05 mm" },
    { id: "s4", stageId: "suspension", label: "4-Corner Suspension Aligned", detail: "Pushrods, coilovers & ARBs preloaded" },
    { id: "s5", stageId: "brakes", label: "Brake Circuit Bled", detail: "Pedal feel verified, bias set" },
    { id: "s6", stageId: "wheels", label: "Wheels Torqued", detail: "Centerlock nuts at 600 Nm + pins" },
    { id: "s7", stageId: "body_structure", label: "Body Panels Latched", detail: "Quick-release fasteners engaged" },
    { id: "s8", stageId: "glass", label: "Glazing Bonded", detail: "Canopy urethane cure complete" },
    { id: "s9", stageId: "interior", label: "Cockpit Safety Fitted", detail: "Buckets, harnesses & display secured" },
    { id: "s10", stageId: "electronics", label: "ECU Comms Online", detail: "CAN bus heartbeat + logger armed" },
    { id: "s11", stageId: "final_exterior", label: "Exhaust & Tow Hooks", detail: "Tip clamps torqued, hooks load-rated" },
    { id: "s12", stageId: "aero_studio", label: "Aero Suite Locked", detail: "Wing AoA pinned, splitter shear bolts fitted" },
  ];

  const installed = (stageId: string) => assemblyState.installedStages.has(stageId as never);
  const passedCount = requiredStages.filter((c) => installed(c.stageId)).length;
  const allPassed = passedCount === requiredStages.length;

  const toggleCheck = (id: string) => {
    setChecksAcknowledged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allAcknowledged = checksAcknowledged.size === requiredStages.length && allPassed;
  const comMm = physicalState?.centerOfMassMm || [0, 480, Math.round((assemblyState.chassis.wheelbaseMm / 2) - 120)];
  const massKg = physicalState?.totalCurbWeightKg || 1185;

  return (
    <div className="panel p-6 rounded-3xl space-y-6 shadow-2xl border-amber-500/40 animate-stage-transition-enter">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 border border-emerald-500/40 text-emerald-400 mb-1 shadow-lg shadow-emerald-500/10">
          <Trophy size={36} className={allPassed ? "text-emerald-400 animate-bounce" : "text-amber-200/60"} />
        </div>
        <h2 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-wide">
          {allPassed ? "STAGE 13: COMPLETE VEHICLE — READY FOR SIGN-OFF" : `STAGE 13: COMPLETE VEHICLE (${passedCount}/12 SYSTEMS VALIDATED)`}
        </h2>
        <p className="text-xs font-mono text-amber-400 dark:text-amber-200/60 max-w-xl mx-auto">
          Hardware validation of the full 13-stage linear chain, 3D Center of Mass datum, and final track readiness certification.
        </p>
      </div>

      {/* Complete Engineering Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 text-center">
          <span className="text-[10px] font-mono text-amber-300/50 uppercase block mb-1">CURB MASS</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{massKg} kg</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 text-center">
          <span className="text-[10px] font-mono text-amber-500 uppercase block mb-1">HORSEPOWER</span>
          <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-300">{estHp} HP</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 text-center">
          <span className="text-[10px] font-mono text-amber-500 uppercase block mb-1">0–100 KM/H</span>
          <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-300">{accel0_100}s</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 text-center">
          <span className="text-[10px] font-mono text-emerald-500 uppercase block mb-1">TOP SPEED</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-300">{topSpeed} km/h</span>
        </div>
      </div>

      {/* 3D CENTER OF MASS DATUM */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-amber-950/30 border border-indigo-500/40 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-indigo-500/30">
              <Crosshair size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-amber-50 uppercase tracking-wider">
                3D CENTER OF MASS (CoM) DATUM
              </h4>
              <p className="text-[11px] font-mono text-amber-300/50 dark:text-amber-200/60">
                Measured from front axle centerline · ride height datum plane
              </p>
            </div>
          </div>
          {onToggleCoMGizmo && (
            <button
              onClick={onToggleCoMGizmo}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                showCoMGizmo ? "bg-amber-500/20 border-indigo-500/50 text-amber-300" : "bg-base-850 border-base-700 text-amber-300/50"
              }`}
            >
              {showCoMGizmo ? "◉ 3D GIZMO VISIBLE" : "SHOW 3D CoM GIZMO"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-base-900/80 border border-base-800 text-center">
            <span className="text-[9px] font-mono text-amber-300/50 uppercase block">LATERAL X</span>
            <span className="font-bold font-mono text-amber-300 tabular-nums">{comMm[0] >= 0 ? "+" : ""}{comMm[0]} mm</span>
          </div>
          <div className="p-2.5 rounded-xl bg-base-900/80 border border-base-800 text-center">
            <span className="text-[9px] font-mono text-amber-300/50 uppercase block">HEIGHT Y</span>
            <span className="font-bold font-mono text-amber-300 tabular-nums">{comMm[1]} mm</span>
          </div>
          <div className="p-2.5 rounded-xl bg-base-900/80 border border-base-800 text-center">
            <span className="text-[9px] font-mono text-amber-300/50 uppercase block">LONGITUDINAL Z</span>
            <span className="font-bold font-mono text-amber-300 tabular-nums">{comMm[2] >= 0 ? "+" : ""}{comMm[2]} mm</span>
          </div>
          <div className="p-2.5 rounded-xl bg-base-900/80 border border-base-800 text-center">
            <span className="text-[9px] font-mono text-amber-300/50 uppercase block">STATIC BIAS</span>
            <span className="font-bold font-mono text-emerald-400 tabular-nums">
              {physicalState?.weightDistributionFrontPct ?? 43}% F / {100 - (physicalState?.weightDistributionFrontPct ?? 57)}% R
            </span>
          </div>
        </div>
      </div>

      {/* HARDWARE VALIDATION CHECKLIST */}
      <div className="p-5 rounded-2xl bg-base-900/70 border border-base-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-amber-50 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" /> HARDWARE VALIDATION CHECKLIST
          </h4>
          <span className={`text-xs font-mono font-bold ${allPassed ? "text-emerald-400" : "text-amber-400"}`}>
            {passedCount}/{requiredStages.length} SUBSYSTEMS TORQUE-CHECKED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {requiredStages.map((check) => {
            const ok = installed(check.stageId);
            const acknowledged = checksAcknowledged.has(check.id);
            return (
              <button
                key={check.id}
                onClick={() => ok && toggleCheck(check.id)}
                disabled={!ok}
                className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  ok
                    ? acknowledged
                      ? "bg-emerald-500/15 border-emerald-500/50 cursor-pointer"
                      : "bg-base-850/60 border-base-750 hover:border-emerald-500/40 cursor-pointer"
                    : "bg-red-500/5 border-red-500/25 opacity-60 cursor-not-allowed"
                }`}
              >
                <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-md border flex items-center justify-center ${
                  !ok ? "border-red-500/40" : acknowledged ? "bg-emerald-500 border-emerald-500" : "border-base-600"
                }`}>
                  {ok && acknowledged && <CheckCircle2 size={12} className="text-black" />}
                  {!ok && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </span>
                <span>
                  <span className={`block text-[11px] font-mono font-bold ${ok ? "text-amber-50" : "text-red-300"}`}>
                    {check.label}
                  </span>
                  <span className="block text-[9px] font-mono text-amber-300/50">{ok ? check.detail : "SYSTEM NOT INSTALLED — RETURN TO STAGE"}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TRACK READINESS SIGN-OFF */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-amber-950/30 border border-emerald-500/40 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <PenLine size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-amber-50 uppercase tracking-wider">
              TRACK READINESS CERTIFICATION
            </h4>
            <p className="text-[11px] font-mono text-amber-300/50 dark:text-amber-200/60">
              Chief engineer sign-off — releases the vehicle to virtual track testing.
            </p>
          </div>
        </div>

        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Chief Engineer Signature (type your name)"
          disabled={!allPassed}
          className="w-full px-3 py-2.5 rounded-xl bg-base-900/80 border border-base-700 focus:border-emerald-500 outline-none text-sm font-mono text-amber-50 placeholder:text-amber-400 disabled:opacity-50"
        />

        {/* Aerodynamics Prompt Box */}
        {!allPassed && (
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={onEnterAeroStudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 font-mono font-bold text-xs transition-all cursor-pointer"
            >
              <Wind size={14} />
              GO TO AERODYNAMICS STUDIO (STAGE 12)
            </button>
          </div>
        )}

        {allPassed && (
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={onEnterAeroStudio}
              className="px-5 py-2.5 rounded-xl bg-base-850 border border-base-700 hover:border-base-600 text-amber-200/60 font-mono font-bold text-xs transition-all cursor-pointer"
            >
              TUNE AERO FIRST
            </button>
            <button
              onClick={() => {
                if (!signature.trim()) return;
                onFinishVehicle();
              }}
              disabled={!signature.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 ${
                signature.trim()
                  ? "bg-gradient-to-r from-emerald-500 to-amber-600 hover:from-emerald-400 hover:to-amber-500 text-white shadow-emerald-500/25 cursor-pointer hover:scale-105"
                  : "bg-base-800 text-amber-300/50 cursor-not-allowed"
              }`}
            >
              <Gauge size={16} />
              {signature.trim() ? `SIGN-OFF & RELEASE "${signature.trim()}"` : "SIGNATURE REQUIRED"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

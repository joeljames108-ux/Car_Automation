/**
 * ============================================================================
 * STAGE 7: BODY & PAINT — WIDEBODY CARBON SHELL, FENDER LOUVERS, PAINT BOOTH
 * ============================================================================
 * Attach the widebody carbon composite shell and closures (doors, bonnet,
 * dicky), configure fender extraction louvers, and spec the bespoke paint.
 */

import React, { useState } from "react";
import {
  Car,
  CheckCircle2,
  Palette,
  Layers,
  Maximize2,
  FolderLock,
  Sliders,
  Flame,
  FolderOpen,
  Wind,
} from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";
import { PaintFinish } from "../../../sim/types";

interface BodyPanelsAssemblyStageProps {
  bodyKit: InstalledSubsystemsState["bodyKit"];
  doorStyle?: InstalledSubsystemsState["doorStyle"];
  doorOpenAngleDeg?: number;
  bonnetStyle?: InstalledSubsystemsState["bonnetStyle"];
  bonnetOpenAngleDeg?: number;
  dickyStyle?: InstalledSubsystemsState["dickyStyle"];
  dickyOpenAngleDeg?: number;
  paintColor: string;
  paintFinish: PaintFinish;
  fenderLouvers?: boolean;
  onUpdateBody: (patch: {
    bodyKit?: InstalledSubsystemsState["bodyKit"];
    doorStyle?: InstalledSubsystemsState["doorStyle"];
    doorOpenAngleDeg?: number;
    bonnetStyle?: InstalledSubsystemsState["bonnetStyle"];
    bonnetOpenAngleDeg?: number;
    dickyStyle?: InstalledSubsystemsState["dickyStyle"];
    dickyOpenAngleDeg?: number;
    paintColor?: string;
    paintFinish?: PaintFinish;
    fenderLouvers?: boolean;
  }) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

type BodyworkSubTab = "body_shell" | "doors" | "bonnet" | "dicky" | "paint";

const BODY_KITS: { id: InstalledSubsystemsState["bodyKit"]; label: string; desc: string; dragDelta: string; weightDelta: string; material: string }[] = [
  { id: "gt3_aero", label: "GT3 Competition Widebody", desc: "Flared carbon fiber fenders with front louvers and high-speed side air extraction ducts.", dragDelta: "+0.015 Cd", weightDelta: "+12 kg", material: "Carbon Composite Prepreg" },
  { id: "carbon_widebody", label: "Exposed Carbon Monocoque Shell", desc: "100% dry carbon prepreg body panels with high gloss resin clearcoat.", dragDelta: "-0.010 Cd", weightDelta: "-28 kg", material: "Dry Carbon 2x2 Twill" },
  { id: "sculpted_supercar", label: "Sculpted Supercar Streamline", desc: "Smooth organic curves with integrated door air channels to rear cooling radiators.", dragDelta: "-0.022 Cd", weightDelta: "-8 kg", material: "SMC / Carbon Hybrid" },
  { id: "oem_sport", label: "OEM Aluminum Sport Package", desc: "Superformed aerospace aluminum bodywork with clean aerodynamic shutlines.", dragDelta: "0.000 Cd", weightDelta: "0 kg", material: "Superformed 5083 Alu" },
];

const DOOR_STYLES: { id: InstalledSubsystemsState["doorStyle"]; label: string; desc: string; maxAngle: number }[] = [
  { id: "butterfly", label: "Dihedral Butterfly Doors", desc: "McLaren-style doors that sweep upwards and outwards along the A-pillar hinge.", maxAngle: 70 },
  { id: "scissor", label: "Scissor Vertical Doors", desc: "Lamborghini V12-style doors that articulate vertically along a front offset pivot.", maxAngle: 70 },
  { id: "gullwing", label: "Gullwing Top-Hinged Doors", desc: "Classic Mercedes 300SL roof-hinged doors that lift directly upwards toward the sky.", maxAngle: 65 },
  { id: "conventional", label: "Lightweight Frameless Track Doors", desc: "Carbon fiber frameless racing doors with side impact protection beams.", maxAngle: 60 },
];

const BONNET_STYLES: { id: InstalledSubsystemsState["bonnetStyle"]; label: string; desc: string; coolingDelta: string }[] = [
  { id: "extractor_vents", label: "Radiator Chimney Extractor Bonnet", desc: "Dual carbon fiber chimney vents that exhaust hot radiator airflow over the windshield.", coolingDelta: "+25% Radiator Flow" },
  { id: "naca_ducts", label: "Dual NACA-Duct Inlets Bonnet", desc: "Low-drag submerged inlets feeding dedicated front brake cooling tunnels.", coolingDelta: "+15% Brake Cooling" },
  { id: "louvered", label: "Louvered Supervent Carbon Hood", desc: "Row of longitudinal heat extraction louvers for aggressive underhood pressure relief.", coolingDelta: "+20% Underhood Flow" },
  { id: "smooth_supercar", label: "Smooth Carbon Lightweight Bonnet", desc: "Sleek continuous carbon fiber surface engineered for lowest possible aerodynamic drag.", coolingDelta: "Low Drag Profile" },
];

const DICKY_STYLES: { id: InstalledSubsystemsState["dickyStyle"]; label: string; desc: string; downforceDelta: string }[] = [
  { id: "vented_decklid", label: "Vented Engine Decklid (Dicky)", desc: "Rear engine cover with CNC slotted heat vents and integrated rear view camera.", downforceDelta: "Balanced Cooling" },
  { id: "ducktail_trunk", label: "Integrated Ducktail Trunk (Dicky)", desc: "Trunk decklid with an upswept ducktail lip spoiler generating 45 kg of clean rear downforce.", downforceDelta: "+45 kg Downforce @ 150 mph" },
  { id: "carbon_tailgate", label: "Carbon Fiber Fastback Tailgate", desc: "One-piece lightweight carbon decklid with quick-release motorsport latches.", downforceDelta: "-14 kg Weight" },
  { id: "active_airbrake", label: "Active Airbrake Dicky Lid", desc: "Articulated rear deck section capable of deploying as an aerodynamic airbrake.", downforceDelta: "Dynamic Aero" },
];

const PAINT_SWATCHES = [
  "#dc2626", "#e11d48", "#ea580c", "#f59e0b", "#facc15", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#2563eb",
  "#1e40af", "#7c3aed", "#a855f7", "#ec4899", "#f43f5e", "#0f172a",
  "#1e293b", "#334155", "#64748b", "#94a3b8", "#e2e8f0", "#ffffff",
];

const FINISHES: { id: PaintFinish; label: string }[] = [
  { id: "gloss", label: "High Gloss Clearcoat" },
  { id: "satin", label: "Satin Sheen" },
  { id: "matte", label: "Stealth Matte" },
  { id: "metallic", label: "Metallic Flake" },
  { id: "pearl", label: "Chameleon Pearl" },
  { id: "colorshift", label: "Colorshift Iridescent" },
];

export const BodyPanelsAssemblyStage: React.FC<BodyPanelsAssemblyStageProps> = ({
  bodyKit,
  doorStyle = "butterfly",
  doorOpenAngleDeg = 0,
  bonnetStyle = "extractor_vents",
  bonnetOpenAngleDeg = 0,
  dickyStyle = "vented_decklid",
  dickyOpenAngleDeg = 0,
  paintColor,
  paintFinish,
  fenderLouvers,
  onUpdateBody,
  isInstalled,
  onInstall,
}) => {
  const [subTab, setSubTab] = useState<BodyworkSubTab>("body_shell");

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl border border-base-800 bg-base-950/90 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/30">
            <Car size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 7: BODYWORK, CLOSURES & BESPOKE PAINT
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Widebody carbon composite shell, door/bonnet/dicky kinematics, fender louvers & paint booth.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> BODYWORK INSTALLED
          </span>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-base-900/90 border border-base-800/80 overflow-x-auto no-scrollbar">
        {(
          [
            { id: "body_shell", label: "1. BODY SHELL", icon: Layers },
            { id: "doors", label: `2. DOORS (${doorOpenAngleDeg}°)`, icon: Maximize2 },
            { id: "bonnet", label: `3. BONNET (${bonnetOpenAngleDeg}°)`, icon: Flame },
            { id: "dicky", label: `4. DICKY (${dickyOpenAngleDeg}°)`, icon: FolderLock },
            { id: "paint", label: "5. PAINT BOOTH", icon: Palette },
          ] as { id: BodyworkSubTab; label: string; icon: any }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === t.id
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <t.icon size={13} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: BODY SHELL & WIDEBODY ── */}
      {subTab === "body_shell" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BODY_KITS.map((k) => {
              const isSelected = bodyKit === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => onUpdateBody({ bodyKit: k.id })}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-pink-500/20 border-pink-500/60 shadow-md ring-1 ring-pink-500/40"
                      : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{k.label}</span>
                    <span className="text-[10px] font-mono font-bold text-pink-400">{k.weightDelta}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{k.desc}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-base-800/60">
                    <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{k.dragDelta}</span>
                    <span className="text-slate-500">{k.material}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Fender Extraction Louvers */}
          <button
            onClick={() => onUpdateBody({ fenderLouvers: !fenderLouvers })}
            className={`w-full p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
              fenderLouvers
                ? "bg-pink-500/15 border-pink-500/50 ring-1 ring-pink-500/40"
                : "bg-base-900/60 border-base-800 hover:border-base-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Wind size={13} className="text-pink-400" /> FENDER EXTRACTION LOUVERS
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                fenderLouvers ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
              }`}>
                {fenderLouvers ? "✓ CUT & FITTED" : "OFF"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              CNC-cut carbon louver sets above all four arches — vents low-pressure wheel-well suction, drops front lift ~12 kg @ 250 km/h.
            </p>
          </button>
        </div>
      )}

      {/* ── TAB 2: DOORS & KINEMATICS ── */}
      {subTab === "doors" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DOOR_STYLES.map((d) => {
              const isSelected = doorStyle === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onUpdateBody({ doorStyle: d.id })}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-pink-500/20 border-pink-500/60 shadow-md ring-1 ring-pink-500/40"
                      : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{d.label}</span>
                    <span className="text-[10px] font-mono text-pink-400 font-bold">MAX {d.maxAngle}°</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{d.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders size={13} className="text-pink-400" /> DOOR ARTICULATION ANGLE
              </label>
              <span className="text-xs font-mono font-bold text-pink-400">{doorOpenAngleDeg}° OPEN</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="1"
              value={doorOpenAngleDeg}
              onChange={(e) => onUpdateBody({ doorOpenAngleDeg: parseInt(e.target.value) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex items-center gap-2 pt-1">
              {[{ v: 0, l: "CLOSED (0°)" }, { v: 25, l: "AJAR (25°)" }, { v: 70, l: "FULL OPEN (70°)" }].map((b) => (
                <button
                  key={b.v}
                  onClick={() => onUpdateBody({ doorOpenAngleDeg: b.v })}
                  className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    doorOpenAngleDeg === b.v ? "bg-pink-500/20 border-pink-500 text-pink-300" : "bg-base-850 border-base-800 text-slate-400"
                  }`}
                >
                  {b.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: BONNET (FRONT HOOD) ── */}
      {subTab === "bonnet" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BONNET_STYLES.map((b) => {
              const isSelected = bonnetStyle === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onUpdateBody({ bonnetStyle: b.id })}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-pink-500/20 border-pink-500/60 shadow-md ring-1 ring-pink-500/40"
                      : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{b.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{b.desc}</p>
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 font-semibold">{b.coolingDelta}</div>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FolderOpen size={13} className="text-pink-400" /> BONNET SERVICE OPEN ANGLE
              </label>
              <span className="text-xs font-mono font-bold text-pink-400">{bonnetOpenAngleDeg}° OPEN</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={bonnetOpenAngleDeg}
              onChange={(e) => onUpdateBody({ bonnetOpenAngleDeg: parseInt(e.target.value) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ── TAB 4: DICKY (BOOT / TRUNK / DECKLID) ── */}
      {subTab === "dicky" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DICKY_STYLES.map((d) => {
              const isSelected = dickyStyle === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onUpdateBody({ dickyStyle: d.id })}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-pink-500/20 border-pink-500/60 shadow-md ring-1 ring-pink-500/40"
                      : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{d.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{d.desc}</p>
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 font-semibold">{d.downforceDelta}</div>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders size={13} className="text-pink-400" /> DICKY ACCESS ANGLE
              </label>
              <span className="text-xs font-mono font-bold text-pink-400">{dickyOpenAngleDeg}° OPEN</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={dickyOpenAngleDeg}
              onChange={(e) => onUpdateBody({ dickyOpenAngleDeg: parseInt(e.target.value) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ── TAB 5: PAINT BOOTH & CLEARCOAT FINISH ── */}
      {subTab === "paint" && (
        <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Palette size={13} className="text-pink-400" /> BESPOKE PAINT BOOTH — MIXER SWATCHES
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={paintColor}
                onChange={(e) => onUpdateBody({ paintColor: e.target.value })}
                className="h-6 w-8 bg-transparent border border-base-800 rounded cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">{paintColor}</span>
            </div>
          </div>

          <div className="grid grid-cols-8 md:grid-cols-12 gap-1.5">
            {PAINT_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => onUpdateBody({ paintColor: c })}
                className={`h-7 rounded-lg border-2 transition-transform hover:scale-110 cursor-pointer ${
                  paintColor === c ? "border-white scale-110 ring-2 ring-pink-500" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          {/* Finish Selector */}
          <div className="flex items-center gap-2 pt-2 border-t border-base-800/60 overflow-x-auto no-scrollbar">
            {FINISHES.map((f) => (
              <button
                key={f.id}
                onClick={() => onUpdateBody({ paintFinish: f.id })}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer whitespace-nowrap ${
                  paintFinish === f.id
                    ? "bg-pink-500/20 border-pink-500/60 text-pink-600 dark:text-pink-300 shadow-sm"
                    : "bg-base-850/60 border-base-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="text-[9px] font-mono text-slate-600 dark:text-slate-500">
            Bespoke program: 9-stage hand-polished process · ceramic quartz top-coat option · batch code laser-etched inside driver sill.
          </p>
        </div>
      )}

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL COMPLETE BODYWORK" : "INSTALL COMPLETE BODYWORK & PROCEED TO GLASS"}
        </button>
      </div>
    </div>
  );
};

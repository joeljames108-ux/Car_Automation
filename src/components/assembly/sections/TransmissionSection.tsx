// ===================================================================
// APEX ENGINE BUILDER — STAGE 14: TRANSMISSION & CLUTCH SECTION
// Sequential Dog-Box, Dual-Clutch Gearsets, Flywheel & Bellhousing
// Integrated with 3D Transmission & Transaxle CAD Studio
// ===================================================================

import React, { useState } from "react";
import { Cog, Layers, Activity, Zap, ShieldCheck, Box, Sliders, Sparkles } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { MaterialGradePicker } from "../MaterialGradePicker";
import { StatDeltasPanel } from "../StatDeltasPanel";
import { InstallButton } from "../InstallButton";
import { Slider, Select, Toggle } from "../../ui/Controls";
import { EngineConfig, SimResult } from "../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../sim/assemblyTypes";
import { Transmission3DStudio } from "../../transmissionStudio/Transmission3DStudio";

interface TransmissionSectionProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  componentMeta?: AssemblyComponentMeta;
  selectedVariant: MaterialGrade;
  isInstalled: boolean;
  isInstalling: boolean;
  canInstall: boolean;
  phase: AssemblyPhase;
  currentTotalStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  updateEngine: (updates: Partial<EngineConfig>) => void;
  onSelectVariant: (variant: MaterialGrade) => void;
  onInstall: () => void;
  onSkipAnimation?: () => void;
  onNext?: () => void;
  className?: string;
}

export function TransmissionSection({
  engineConfig,
  sim,
  componentMeta,
  selectedVariant,
  isInstalled,
  isInstalling,
  canInstall,
  phase,
  currentTotalStats,
  updateEngine,
  onSelectVariant,
  onInstall,
  onSkipAnimation,
  onNext,
  className = "",
}: TransmissionSectionProps) {
  const [viewMode, setViewMode] = useState<"3d_studio" | "cards">("3d_studio");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Header Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/40 dark:bg-slate-950/80 border border-amber-500/30 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Cog size={18} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-200">
                STAGE #14: TRANSMISSION & TRANSAXLE WORKSHOP
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                3D CAD Studio Integrated
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Interactive 3D WebGL Transaxle, 60fps shaft kinematics, gear ratio tuning & driveline physics
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/40 dark:bg-slate-900/90 border border-slate-700/60 dark:border-slate-800">
          <button
            onClick={() => setViewMode("3d_studio")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              viewMode === "3d_studio"
                ? "bg-amber-500 text-slate-900 dark:text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Box size={13} />
            <span>3D Interactive Studio</span>
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              viewMode === "cards"
                ? "bg-amber-500 text-slate-900 dark:text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Sliders size={13} />
            <span>Metallurgy & Stat Cards</span>
          </button>
        </div>
      </div>

      {/* MODE 1: INTEGRATED 3D TRANSMISSION & TRANSAXLE STUDIO */}
      {viewMode === "3d_studio" ? (
        <div className="w-full">
          <Transmission3DStudio
            isEmbedded={true}
            engineConfig={engineConfig}
            sim={sim}
            updateEngine={updateEngine}
            componentMeta={componentMeta}
            selectedVariant={selectedVariant}
            onSelectVariant={onSelectVariant}
            isInstalled={isInstalled}
            isInstalling={isInstalling}
            canInstall={canInstall}
            phase={phase}
            currentTotalStats={currentTotalStats}
            onInstall={onInstall}
            onSkipAnimation={onSkipAnimation}
            onNext={onNext}
          />
        </div>
      ) : (
        /* MODE 2: CLASSIC 3-CARD OVERVIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
            {/* CARD 1: GEARBOX & CLUTCH SPEC */}
            <SectionCard
              title="Drivetrain & Transmission Architecture"
              subtitle="Gearbox gearset, clutch friction plates, flywheel & shift speed"
              icon={<Cog size={16} />}
              accent="cyan"
            >
              <div className="space-y-3">
                <Select
                  label="Transmission Architecture"
                  value="7_speed_dct"
                  options={[
                    { value: "6_speed_manual", label: "6-Speed H-Pattern Manual + Organic Clutch" },
                    { value: "7_speed_dct", label: "7-Speed Dual-Clutch (DCT) + Multi-Plate Wet Clutch" },
                    { value: "6_speed_sequential", label: "6-Speed Straight-Cut Dog-Ring Sequential" },
                    { value: "7_speed_formula", label: "7-Speed Carbon-Cased Formula Sequential" },
                  ]}
                  onChange={() => {}}
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-base-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Shift Time</span>
                    <span className="text-xs font-mono font-bold text-amber-300 block">25 ms Instant</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-base-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Clutch Discs</span>
                    <span className="text-xs font-mono font-bold text-amber-300 block">Twin Carbon-Carbon</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 dark:bg-slate-900/50 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                    TORQUE TRANSFER & DRIVELINE LOSS
                  </span>
                  <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                    Precision ground helical gears and lightened chrome-moly flywheel minimize drivetrain parasitic friction loss, sending 94% of flywheel power straight to the tires.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* CARD 2: MATERIAL GRADE PICKER */}
            <SectionCard
              title="Gearset & Bellhousing Metallurgy"
              subtitle="Synchronized OEM vs Cryo-Treated Billet Dog-Ring Gearbox"
              icon={<Layers size={16} />}
              accent="purple"
            >
              {componentMeta ? (
                <MaterialGradePicker
                  variants={componentMeta.variants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={onSelectVariant}
                />
              ) : (
                <p className="text-xs font-mono text-slate-500">Loading material variants...</p>
              )}
            </SectionCard>

            {/* CARD 3: ENGINEERING STAT DELTAS */}
            <SectionCard
              title="Wheel Torque & Driveline Durability"
              subtitle="Torque handling capacity, shift speed & bellhousing stud torque"
              icon={<Activity size={16} />}
              accent="emerald"
            >
              <StatDeltasPanel
                componentMeta={componentMeta}
                selectedVariant={selectedVariant}
                currentTotalStats={currentTotalStats}
                adviceText={componentMeta?.tooltipAdvice}
              />
            </SectionCard>
          </div>

          {/* INSTALL ACTION TRIGGER */}
          <InstallButton
            componentId="transmission"
            componentName="Transmission & Bellhousing Assembly"
            isInstalled={isInstalled}
            isInstalling={isInstalling}
            canInstall={canInstall}
            phase={phase}
            onInstall={onInstall}
            onSkipAnimation={onSkipAnimation}
            onNext={onNext}
          />
        </div>
      )}
    </div>
  );
}

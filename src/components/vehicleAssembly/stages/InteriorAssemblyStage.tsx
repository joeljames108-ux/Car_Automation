/**
 * ============================================================================
 * STAGE 9: INTERIOR COCKPIT & ON-BOARD ELECTRONICS ARCHITECTURE
 * ============================================================================
 * Unified interior cockpit installation combining:
 * - FIA carbon bucket seating, 6-point harnesses & digital MoTeC display cluster
 * - Bosch Motorsport MS6 ECU, Raychem mil-spec wire looms & 800V HV lines
 */

import React, { useState } from "react";
import {
  Sofa,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  Monitor,
  Cable,
  Zap,
  Sliders,
} from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface InteriorAssemblyStageProps {
  interiorType: InstalledSubsystemsState["interiorType"];
  onUpdateInterior: (type: InstalledSubsystemsState["interiorType"]) => void;
  sixPointHarness: boolean;
  onUpdateSixPointHarness: (enabled: boolean) => void;
  motecDisplay: boolean;
  onUpdateMotecDisplay: (enabled: boolean) => void;
  electronicsType: InstalledSubsystemsState["electronicsType"];
  onUpdateElectronics: (type: InstalledSubsystemsState["electronicsType"]) => void;
  raychemLooms: boolean;
  onUpdateRaychemLooms: (enabled: boolean) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const InteriorAssemblyStage: React.FC<InteriorAssemblyStageProps> = ({
  interiorType,
  onUpdateInterior,
  sixPointHarness,
  onUpdateSixPointHarness,
  motecDisplay,
  onUpdateMotecDisplay,
  electronicsType,
  onUpdateElectronics,
  raychemLooms,
  onUpdateRaychemLooms,
  isInstalled,
  onInstall,
}) => {
  const [activeTab, setActiveTab] = useState<"cockpit" | "electronics">("cockpit");

  const interiors: {
    id: InstalledSubsystemsState["interiorType"];
    label: string;
    seats: string;
    steering: string;
    desc: string;
  }[] = [
    {
      id: "carbon_bucket_gt3",
      label: "GT3 Carbon Bucket & FIA Cage",
      seats: "Fixed Carbon Shells",
      steering: "Alcantara GT3 Yoke",
      desc: "FIA 8862-2009 homologated carbon fiber bucket seats with roll cage integration.",
    },
    {
      id: "formula_yoke_cockpit",
      label: "Formula 1 Monoposto Digital Cockpit",
      seats: "Custom Molded Bead Seat",
      steering: "Formula Yoke with OLED",
      desc: "Ultra-low reclined seating position with integrated paddle shifters and direct CAN telemetry display.",
    },
    {
      id: "alcantara_comfort",
      label: "Grand Touring Alcantara & Nappa",
      seats: "18-Way Power Sports Seats",
      steering: "Heated Leather Wheel",
      desc: "Hand-stitched Italian leather and Alcantara interior with ambient LED illumination.",
    },
  ];

  const electronics: {
    id: InstalledSubsystemsState["electronicsType"];
    label: string;
    bus: string;
    voltage: string;
    desc: string;
  }[] = [
    {
      id: "motorsport_ecu_telemetry",
      label: "Bosch MS6 ECU & 100Hz Telemetry",
      bus: "Dual CAN-FD (10 Mbps)",
      voltage: "12V / 48V Mil-Spec",
      desc: "Bosch Motorsport MS6 engine control unit with wideband lambda, knock control, traction map library, and high-speed data logger.",
    },
    {
      id: "800v_hv_harness",
      label: "800V SiC High-Voltage Architecture",
      bus: "Ethernet BroadR-Reach",
      voltage: "800V DC Traction Bus",
      desc: "Shielded orange HV power distribution harness with SiC inverter gate drivers and pyrofuse isolation.",
    },
    {
      id: "adas_sensor_suite",
      label: "ADAS LiDAR & Sensor Fusion Matrix",
      bus: "Automotive Gigabit Ethernet",
      voltage: "Dual Redundant 12V",
      desc: "Solid-state roof LiDAR, quad corner radar units, and 8 high-dynamic-range stereo cameras for driver assistance.",
    },
  ];

  const isHv = electronicsType === "800v_hv_harness";

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl select-none">
      {/* Header with Subtab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-base-800/60 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 text-amber-400 border border-indigo-500/30">
            <Sofa size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                STAGE 9: INTERIOR COCKPIT & ELECTRONICS
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-indigo-500/30">
                UNIFIED CABIN & ECU
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Configure FIA carbon seating, digital displays, wire looms, and 800V power electronics.
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 bg-base-950 p-1 rounded-xl border border-base-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              activeTab === "cockpit"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sofa size={12} />
            <span>COCKPIT & CONTROLS</span>
          </button>
          <button
            onClick={() => setActiveTab("electronics")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
              activeTab === "electronics"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu size={12} />
            <span>ECU & WIRE HARNESS</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 1: COCKPIT & SEATING CONTROLS ── */}
      {activeTab === "cockpit" && (
        <div className="space-y-3.5 animate-stage-transition-enter">
          {/* Interior Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {interiors.map((i) => {
              const isSelected = interiorType === i.id;
              return (
                <button
                  key={i.id}
                  onClick={() => onUpdateInterior(i.id)}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/20 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/40"
                      : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                  }`}
                >
                  <div className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 mb-1">
                    {i.label}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                    {i.desc}
                  </p>
                  <div className="space-y-0.5 text-[10px] font-mono text-slate-400 border-t border-base-800/60 pt-2">
                    <div>Seats: <strong className="text-slate-200">{i.seats}</strong></div>
                    <div>Steering: <strong className="text-amber-400">{i.steering}</strong></div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Harness Toggle */}
            <button
              onClick={() => onUpdateSixPointHarness(!sixPointHarness)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                sixPointHarness
                  ? "bg-red-500/10 border-red-500/50 ring-1 ring-red-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-red-400" /> FIA 6-POINT RACING HARNESSES
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                  sixPointHarness ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
                }`}>
                  {sixPointHarness ? "✓ FITTED" : "STOCK BELTS"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                2" polyester webbing with titanium adjusters & 7075 billet harness bar mounting.
              </p>
            </button>

            {/* MoTeC Display Toggle */}
            <button
              onClick={() => onUpdateMotecDisplay(!motecDisplay)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                motecDisplay
                  ? "bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Monitor size={13} className="text-amber-400" /> DIGITAL MoTeC C1259 DISPLAY
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                  motecDisplay ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
                }`}>
                  {motecDisplay ? "✓ INSTALLED" : "OFF"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Configurable race dash: lap deltas, g-force traces, and RGB shift-light strip over CAN.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION 2: ECU & WIRE HARNESS ── */}
      {activeTab === "electronics" && (
        <div className="space-y-3.5 animate-stage-transition-enter">
          {/* Electronics Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {electronics.map((e) => {
              const isSelected = electronicsType === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => onUpdateElectronics(e.id)}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/40"
                      : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
                  }`}
                >
                  <div className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 mb-1">
                    {e.label}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                    {e.desc}
                  </p>
                  <div className="space-y-0.5 text-[10px] font-mono text-slate-400 border-t border-base-800/60 pt-2">
                    <div>Bus: <strong className="text-amber-400">{e.bus}</strong></div>
                    <div>Power: <strong className={isHv && e.id === "800v_hv_harness" ? "text-orange-400" : "text-amber-400"}>{e.voltage}</strong></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Raychem Mil-Spec Looms Toggle */}
          <button
            onClick={() => onUpdateRaychemLooms(!raychemLooms)}
            className={`w-full p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
              raychemLooms
                ? "bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40"
                : "bg-base-900/60 border-base-800 hover:border-base-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Cable size={13} className="text-amber-400" /> RAYCHEM MIL-SPEC WIRE LOOMS
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                raychemLooms ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
              }`}>
                {raychemLooms ? "✓ LOOMED" : "STANDARD HARNESS"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Tefzel 22AWG core with DR-25 heat-shrink jacketing & 55-pin Deutsch ASX connector at the ECU.
            </p>
          </button>

          {/* HV Warning Strip */}
          {isHv && (
            <div className="px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/40 text-[10px] font-mono text-orange-300 flex items-center gap-2">
              <Zap size={14} className="text-orange-400" />
              ⚡ HIGH-VOLTAGE PROTOCOL: MSD (Maintenance Safety Discharge) loop required before high-power validation.
            </div>
          )}
        </div>
      )}

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-amber-500 hover:from-indigo-400 hover:to-amber-400 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL INTERIOR & ELECTRONICS" : "INSTALL INTERIOR & ELECTRONICS & PROCEED"}
        </button>
      </div>
    </div>
  );
};

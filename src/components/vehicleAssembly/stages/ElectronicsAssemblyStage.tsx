/**
 * ============================================================================
 * STAGE 10: ELECTRONICS — BOSCH MS6 ECU, RAYCHEM LOOMS, 800V HV LINES
 * ============================================================================
 * Install the Bosch Motorsport MS6 ECU, Raychem mil-spec wire looms and the
 * shielded 800V high-voltage traction lines with pyrofuse isolation.
 */

import React from "react";
import { Cpu, CheckCircle2, Cable } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface ElectronicsAssemblyStageProps {
  electronicsType: InstalledSubsystemsState["electronicsType"];
  onUpdateElectronics: (type: InstalledSubsystemsState["electronicsType"]) => void;
  raychemLooms: boolean;
  onUpdateRaychemLooms: (enabled: boolean) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const ElectronicsAssemblyStage: React.FC<ElectronicsAssemblyStageProps> = ({
  electronicsType,
  onUpdateElectronics,
  raychemLooms,
  onUpdateRaychemLooms,
  isInstalled,
  onInstall,
}) => {
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
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Cpu size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-amber-50 uppercase tracking-wider">
              STAGE 10: ELECTRONICS & WIRE HARNESS
            </h3>
            <p className="text-[11px] font-mono text-amber-300/50 dark:text-amber-200/60">
              Route the ECU, vehicle dynamics controller, mil-spec looms and HV traction lines.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> ELECTRONICS INSTALLED
          </span>
        )}
      </div>

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
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-amber-200/60"
              }`}
            >
              <div className="font-bold text-xs font-mono text-slate-900 dark:text-amber-50 mb-1">{e.label}</div>
              <p className="text-[10px] text-amber-300/50 dark:text-amber-200/60 mb-2.5">{e.desc}</p>
              <div className="space-y-0.5 text-[10px] font-mono text-amber-200/60 border-t border-base-800/60 pt-2">
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
          <span className="font-bold text-xs font-mono text-slate-900 dark:text-amber-50 flex items-center gap-1.5">
            <Cable size={13} className="text-amber-400" /> RAYCHEM MIL-SPEC WIRE LOOMS
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
            raychemLooms ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-amber-300/50"
          }`}>
            {raychemLooms ? "✓ LOOMED" : "STANDARD HARNESS"}
          </span>
        </div>
        <p className="text-[10px] text-amber-300/50 dark:text-amber-200/60">
          Tefzel 22AWG core with DR-25 heat-shrink jacketing, bonded into branch bundles at all four corners.
          55-pin Deutsch ASX connector at the ECU — rated to 200°C and impervious to race fuel vapor.
          {isHv && raychemLooms ? " HV traction lines run in separate shielded conduit per ISO 6469 clearance rules." : ""}
        </p>
      </button>

      {/* HV Warning Strip */}
      {isHv && (
        <div className="px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/40 text-[10px] font-mono text-orange-300 flex items-center gap-2">
          ⚡ HIGH-VOLTAGE PROTOCOL: MSD (Maintenance Safety Discharge) loop + service plug required before any Stage 13 hardware validation.
        </div>
      )}

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-WIRE ELECTRONICS" : "INSTALL ELECTRONICS & PROCEED TO EXTERIOR DETAILS"}
        </button>
      </div>
    </div>
  );
};

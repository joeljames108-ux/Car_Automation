/**
 * ============================================================================
 * STAGE 10: ELECTRONICS, HARNESS & SENSORS STAGE
 * ============================================================================
 */

import React from "react";
import { Cpu, CheckCircle2, Zap, Radio, Shield } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface ElectronicsAssemblyStageProps {
  electronicsType: InstalledSubsystemsState["electronicsType"];
  onUpdateElectronics: (type: InstalledSubsystemsState["electronicsType"]) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const ElectronicsAssemblyStage: React.FC<ElectronicsAssemblyStageProps> = ({
  electronicsType,
  onUpdateElectronics,
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
      label: "Motorsport ECU & 100Hz Telemetry",
      bus: "Dual CAN-FD (10 Mbps)",
      voltage: "12V / 48V Mil-Spec",
      desc: "Bosch Motorsport MS6 engine control unit with wideband lambda, knock control, and high-speed data logger.",
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

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Cpu size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 10: ELECTRONICS, ECU & 800V WIRING
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Install the powertrain ECU, vehicle dynamics controller, wire harness, and telemetry sensors.
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
                  ? "bg-cyan-500/20 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 mb-1">{e.label}</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">{e.desc}</p>
              <div className="space-y-0.5 text-[10px] font-mono text-slate-400 border-t border-base-800/60 pt-2">
                <div>Bus: <strong className="text-cyan-400">{e.bus}</strong></div>
                <div>Power: <strong className="text-amber-400">{e.voltage}</strong></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-WIRE ELECTRONICS" : "INSTALL ELECTRONICS & PROCEED TO EXTERIOR DETAILS"}
        </button>
      </div>
    </div>
  );
};

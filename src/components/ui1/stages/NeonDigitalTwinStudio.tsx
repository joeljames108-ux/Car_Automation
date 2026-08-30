import React, { useState } from "react";
import {
  Activity,
  Cpu,
  Zap,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonDigitalTwinStudio() {
  const { sim, design } = useDesign();

  const [clearedDtc, setClearedDtc] = useState(false);
  const [activeFaultCount, setActiveFaultCount] = useState(0);

  const subsystems = [
    { name: "Powertrain ECU / Spark Timing", status: "NOMINAL", load: "42%", temp: "88°C", health: "99%" },
    { name: "Twin-Scroll Turbo Boost Solenoid", status: "NOMINAL", load: "68%", temp: "145°C", health: "98%" },
    { name: "Dual-Clutch Transmission Mechatronic", status: "NOMINAL", load: "54%", temp: "78°C", health: "100%" },
    { name: "800V High Voltage Traction Inverter", status: "NOMINAL", load: "35%", temp: "62°C", health: "99%" },
    { name: "Active Hydraulic DRS Wing Actuator", status: "NOMINAL", load: "12%", temp: "45°C", health: "100%" },
    { name: "Carbon Ceramic Brake Pressure Master", status: "NOMINAL", load: "28%", temp: "110°C", health: "97%" },
    { name: "Adaptive Pushrod Damping Kinematics", status: "NOMINAL", load: "61%", temp: "52°C", health: "99%" },
    { name: "360° Solid-State LiDAR & Vision ADAS", status: "NOMINAL", load: "74%", temp: "49°C", health: "100%" },
  ];

  const handleClearCodes = () => {
    playHMIClickSound();
    setActiveFaultCount(0);
    setClearedDtc(true);
    setTimeout(() => setClearedDtc(false), 2500);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "LIVE DIGITAL TWIN & CAN-FD SUBSYSTEM TELEMETRY",
          subtitle: "500 Hz vehicle bus multiplexing, hardware diagnostic codes, and thermal health",
          icon: <Server size={18} />,
          badge: <NeonHorizonBadge variant="live">CAN-FD BUS SYNCHRONIZED</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="BUS SAMPLE RATE" value="500 Hz" accentColor="cyan" />
          <NeonHorizonDataCard label="BUS UTILIZATION" value="38.4%" accentColor="gold" />
          <NeonHorizonDataCard label="PACKET ERROR RATE" value="0.002%" accentColor="emerald" />
          <NeonHorizonDataCard label="ACTIVE DTC FAULTS" value={activeFaultCount} accentColor={activeFaultCount > 0 ? "coral" : "emerald"} />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Subsystem Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "HARDWARE SUBSYSTEM HEALTH MATRIX",
              icon: <Cpu size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subsystems.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-50 truncate pr-2">{sub.name}</span>
                    <NeonHorizonBadge variant="emerald" size="xs">
                      {sub.status}
                    </NeonHorizonBadge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] nh-font-mono text-amber-200/60">
                    <span>Load: {sub.load} · {sub.temp}</span>
                    <span className="text-sky-300 font-bold">Health: {sub.health}</span>
                  </div>
                </div>
              ))}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right DTC Diagnostics Scanner (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "OBD-II / UDS DIAGNOSTIC SCANNER",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="p-4 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">ECU Handshake:</span>
                <span className="text-xs font-bold nh-font-mono text-emerald-300">ESTABLISHED (0x7E0)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">Security Access Level:</span>
                <span className="text-xs font-bold nh-font-mono text-sky-300">OEM LEVEL 3 (UNLOCKED)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">Flash Memory Checksum:</span>
                <span className="text-xs font-bold nh-font-mono text-amber-300">0xA84F_92BC (VALID)</span>
              </div>
            </div>

            {clearedDtc && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs nh-font-mono flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>All diagnostic fault codes cleared from ECU memory!</span>
              </div>
            )}

            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="text-xs text-amber-200/60">0 Diagnostic codes pending</span>
              <NeonHorizonButton
                variant="secondary"
                size="sm"
                icon={<RotateCcw size={14} />}
                onClick={handleClearCodes}
              >
                Clear ECU Codes
              </NeonHorizonButton>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

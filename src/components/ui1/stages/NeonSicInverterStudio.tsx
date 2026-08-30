import React, { useState } from "react";
import {
  Zap,
  Activity,
  Sliders,
  Cpu,
  Gauge,
  ShieldCheck,
  Flame,
  Award,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonSicInverterStudio() {
  const { sim } = useDesign();

  const [switchingFreqKhz, setSwitchingFreqKhz] = useState(80); // kHz (20-120)
  const [rotorRpm, setRotorRpm] = useState(21500); // RPM (10000-24000)
  const [motorType, setMotorType] = useState<"pma_synrm" | "axial_flux" | "halbach_radial">("pma_synrm");

  // Compute Inverter & Motor Dynamics
  const inverterEfficiency = (98.6 + (switchingFreqKhz / 120) * 0.8).toFixed(1);
  const peakTorqueNm = motorType === "axial_flux" ? 880 : motorType === "pma_synrm" ? 760 : 690;
  const powerKw = Math.round((peakTorqueNm * ((rotorRpm * 2 * Math.PI) / 60)) / 1000);
  const rotorTempC = Math.round(65 + (rotorRpm / 24000) * 35);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "800V SILICON-CARBIDE (SiC) INVERTER & 24,000 RPM SynRM MOTOR BENCH",
          subtitle: "100 kHz high-frequency SiC MOSFET gate drivers, direct rotor oil-jet cooling, and flux-weakening high-speed torque bench",
          icon: <Cpu size={18} />,
          badge: <NeonHorizonBadge variant="live">800V SiC BUS ACTIVE · {motorType.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TOTAL POWER OUTPUT" value={`${powerKw} kW (${Math.round(powerKw * 1.341)} HP)`} accentColor="emerald" />
          <NeonHorizonDataCard label="PEAK TORQUE" value={`${peakTorqueNm} Nm`} accentColor="cyan" />
          <NeonHorizonDataCard label="INVERTER EFFICIENCY" value={`${inverterEfficiency}% (SiC)`} accentColor="gold" />
          <NeonHorizonDataCard label="ROTOR THERMAL LOAD" value={`${rotorTempC}°C (OIL JET)`} accentColor={rotorTempC > 90 ? "coral" : "magenta"} />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Motor Architecture Selection & Stator Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "3-PHASE SiC INVERTER GATE VOLTAGE & PWM SWITCHING",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/80 border border-sky-400/25 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 flex flex-col items-center">
                <span className="text-slate-400 text-[10px]">Phase U</span>
                <span className="text-amber-300 font-bold text-sm">800V · 450A</span>
                <span className="text-emerald-400 text-[10px]">0.02% THD</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 flex flex-col items-center">
                <span className="text-slate-400 text-[10px]">Phase V</span>
                <span className="text-amber-300 font-bold text-sm">800V · 450A</span>
                <span className="text-emerald-400 text-[10px]">0.02% THD</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 flex flex-col items-center">
                <span className="text-slate-400 text-[10px]">Phase W</span>
                <span className="text-amber-300 font-bold text-sm">800V · 450A</span>
                <span className="text-emerald-400 text-[10px]">0.02% THD</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "pma_synrm", name: "PMa-SynRM" },
                { id: "axial_flux", name: "Dual Axial Flux" },
                { id: "halbach_radial", name: "Halbach Radial" },
              ].map((m) => {
                const isSelected = motorType === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playTurboBoostSound();
                      setMotorType(m.id as "pma_synrm" | "axial_flux" | "halbach_radial");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-slate-900/80 border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                  >
                    {m.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "INVERTER FREQUENCY & ROTOR SPEED",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="SiC PWM Switching Frequency"
              value={switchingFreqKhz}
              min={20}
              max={120}
              step={5}
              unit=" kHz"
              color="cyan"
              onChange={(val) => setSwitchingFreqKhz(val)}
            />

            <NeonHorizonSlider
              label="Rotor Angular Speed"
              value={rotorRpm}
              min={10000}
              max={24000}
              step={500}
              unit=" RPM"
              color="magenta"
              onChange={(val) => setRotorRpm(val)}
            />

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Power Density:</span>
                <span className="text-emerald-300 font-bold">28.5 kW / kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Direct Oil Flowrate:</span>
                <span className="text-amber-300 font-bold">14.2 L/min Stator Jet</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

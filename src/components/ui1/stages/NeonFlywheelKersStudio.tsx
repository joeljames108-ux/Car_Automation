import React, { useState, useEffect } from "react";
import {
  Zap,
  Activity,
  Sliders,
  Gauge,
  ShieldCheck,
  Flame,
  Award,
  RotateCw,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonFlywheelKersStudio() {
  const { sim } = useDesign();

  const [flywheelRpm, setFlywheelRpm] = useState(54000); // RPM (20000-60000)
  const [cvtRatio, setCvtRatio] = useState(1.4); // Ratio (0.4-2.5)
  const [isBoosting, setIsBoosting] = useState(false);

  // Compute Mechanical Flywheel Dynamics
  const storedEnergyMj = (0.5 * 2.0 * Math.pow((flywheelRpm * 2 * Math.PI) / 60, 2) / 1e6).toFixed(2);
  const dischargePowerKw = isBoosting ? 160 : Math.round((flywheelRpm / 60000) * 120);
  const gyroTorqueNm = Math.round((flywheelRpm / 60000) * 45);

  const handleBoost = () => {
    playTurboBoostSound();
    setIsBoosting(true);
    setTimeout(() => {
      setIsBoosting(false);
      setFlywheelRpm((prev) => Math.max(20000, prev - 12000));
    }, 2500);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={isBoosting ? "pulse" : "cyan"}
        corners="reticle"
        header={{
          title: "60,000 RPM VACUUM-SEALED CARBON FLYWHEEL KERS LAB",
          subtitle: "Magnetic levitation bearing rotor, toroidal CVT mechanical energy transfer, and 160 kW instant launch assist boost",
          icon: <RotateCw size={18} />,
          badge: <NeonHorizonBadge variant={isBoosting ? "coral" : "live"}>{isBoosting ? "MECHANICAL BOOST PULSE ACTIVE" : "FLYWHEEL CHARGED & LEVITATING"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="STORED KINETIC ENERGY" value={`${storedEnergyMj} MJ`} accentColor="emerald" />
          <NeonHorizonDataCard label="DISCHARGE POWER" value={`${dischargePowerKw} kW (${Math.round(dischargePowerKw * 1.341)} HP)`} accentColor="cyan" />
          <NeonHorizonDataCard label="ROTOR SPEED" value={`${flywheelRpm.toLocaleString()} RPM`} accentColor="gold" />
          <NeonHorizonDataCard label="GYRO STABILIZER TORQUE" value={`${gyroTorqueNm} Nm (Z-AXIS)`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Flywheel Rotor Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "VACUUM ENCLOSURE & MAGNETIC LEVITATION STATOR",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="p-4 rounded-xl bg-[#05080f] border border-sky-400/25 font-mono text-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Enclosure Pressure:</span>
                <span className="text-sky-300 font-bold">10⁻⁴ mbar High Vacuum</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Mag-Lev Bearings:</span>
                <span className="text-emerald-300 font-bold">Active 5-Axis Magnetic Control</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Standby Run-Down Loss:</span>
                <span className="text-amber-300 font-bold">0.45% / hr (Ultra Low)</span>
              </div>
            </div>

            <NeonHorizonButton
              variant={isBoosting ? "primary" : "secondary"}
              glow
              className="w-full py-3.5 text-sm font-bold tracking-wider"
              onClick={handleBoost}
            >
              {isBoosting ? "DISCHARGING 160 kW MECHANICAL KERS..." : "ACTIVATE 160 kW FLYWHEEL LAUNCH ASSIST"}
            </NeonHorizonButton>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Flywheel Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "ROTOR RPM & TOROIDAL CVT RATIO",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Flywheel Rotor Speed"
              value={flywheelRpm}
              min={20000}
              max={60000}
              step={1000}
              unit=" RPM"
              color="cyan"
              onChange={(val) => setFlywheelRpm(val)}
            />

            <NeonHorizonSlider
              label="Toroidal CVT Variator Ratio"
              value={cvtRatio}
              min={0.4}
              max={2.5}
              step={0.1}
              unit="x"
              color="magenta"
              onChange={(val) => setCvtRatio(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Rim Rim Tip Speed:</span>
                <span className="text-sky-300 font-bold">850 m/s (Mach 2.5)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Rotor Carbon Spec:</span>
                <span className="text-emerald-300 font-bold">Toray T1100 Filament Wound</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

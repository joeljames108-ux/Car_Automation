import React, { useState } from "react";
import {
  Cog,
  Zap,
  Activity,
  Sliders,
  TrendingUp,
  Gauge,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import type { TransmissionType } from "../../../sim/types";

export function NeonTransmissionStudio() {
  const { design, sim, updateVehicle } = useDesign();
  const { vehicle } = design;

  const [gear1, setGear1] = useState(3.45);
  const [gear2, setGear2] = useState(2.25);
  const [gear3, setGear3] = useState(1.65);
  const [gear4, setGear4] = useState(1.28);
  const [gear5, setGear5] = useState(1.02);
  const [gear6, setGear6] = useState(0.85);
  const [gear7, setGear7] = useState(0.71);
  const [finalDrive, setFinalDrive] = useState(3.73);

  const maxRpm = design.engine.rpmLimiter || 8500;
  const tireRadiusM = 0.33; // 660mm tire diameter

  // Compute speed at redline for each gear
  const calcTopSpeedGear = (ratio: number) => {
    const totalRatio = ratio * finalDrive;
    const wheelRpm = maxRpm / totalRatio;
    const speedMs = (wheelRpm * 2 * Math.PI * tireRadiusM) / 60;
    return Math.round(speedMs * 3.6);
  };

  const gearSpeeds = [
    { gear: "1st", speed: calcTopSpeedGear(gear1), ratio: gear1 },
    { gear: "2nd", speed: calcTopSpeedGear(gear2), ratio: gear2 },
    { gear: "3rd", speed: calcTopSpeedGear(gear3), ratio: gear3 },
    { gear: "4th", speed: calcTopSpeedGear(gear4), ratio: gear4 },
    { gear: "5th", speed: calcTopSpeedGear(gear5), ratio: gear5 },
    { gear: "6th", speed: calcTopSpeedGear(gear6), ratio: gear6 },
    { gear: "7th", speed: calcTopSpeedGear(gear7), ratio: gear7 },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header Banner */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "TRANSMISSION & GEAR RATIO STAIRCASE BENCH",
          subtitle: "Optimize gear spacing, shift drop points, and final drive acceleration curves",
          icon: <Cog size={18} />,
          badge: <NeonHorizonBadge variant="live">GEAR TRAIN OPTIMIZED</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="EST. TOP SPEED" value={calcTopSpeedGear(gear7)} unit="km/h" accentColor="cyan" />
          <NeonHorizonDataCard label="SHIFT LATENCY" value="20" unit="ms" accentColor="emerald" />
          <NeonHorizonDataCard label="FINAL DRIVE" value={finalDrive.toFixed(2)} accentColor="gold" />
          <NeonHorizonDataCard label="DRIVETRAIN LOSS" value="11.5%" accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Gear Ratio Sliders */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "GEARBOX RATIOS & ARCHITECTURE",
              icon: <Cog size={16} />,
            }}
            className="p-6 flex flex-col gap-5"
          >
            <NeonHorizonSelect
              label="TRANSMISSION ARCHITECTURE"
              value={vehicle.transmission}
              onChange={(v) => updateVehicle({ transmission: v as TransmissionType })}
              options={[
                { value: "dct_7", label: "7-Speed Dual-Clutch Transmission (DCT)", sublabel: "Seamless dual-shaft pre-selection · 20ms shift" },
                { value: "seq_6", label: "6-Speed Straight-Cut Sequential Dog-Box", sublabel: "Clutchless flat-shift with ignition cut" },
                { value: "manual_6", label: "6-Speed Open-Gate H-Pattern Manual", sublabel: "Tactile billet titanium linkage feel" },
                { value: "single_speed", label: "Single-Speed Epicyclic Direct Drive", sublabel: "Instantaneous torque multiplication" },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NeonHorizonSlider
                label="1ST GEAR RATIO"
                value={gear1}
                min={2.5}
                max={4.2}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
                onChange={setGear1}
                color="cyan"
              />
              <NeonHorizonSlider
                label="2ND GEAR RATIO"
                value={gear2}
                min={1.8}
                max={3.0}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
                onChange={setGear2}
                color="cyan"
              />
              <NeonHorizonSlider
                label="3RD GEAR RATIO"
                value={gear3}
                min={1.3}
                max={2.2}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
                onChange={setGear3}
                color="magenta"
              />
              <NeonHorizonSlider
                label="4TH GEAR RATIO"
                value={gear4}
                min={1.0}
                max={1.6}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
                onChange={setGear4}
                color="magenta"
              />
              <NeonHorizonSlider
                label="5TH GEAR RATIO"
                value={gear5}
                min={0.8}
                max={1.3}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
                onChange={setGear5}
                color="gold"
              />
              <NeonHorizonSlider
                label="6TH GEAR RATIO"
                value={gear6}
                min={0.65}
                max={1.1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
                onChange={setGear6}
                color="gold"
              />
              <NeonHorizonSlider
                label="7TH GEAR OVERDRIVE"
                value={gear7}
                min={0.5}
                max={0.9}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
                onChange={setGear7}
                color="emerald"
              />
              <NeonHorizonSlider
                label="FINAL DRIVE RATIO"
                value={finalDrive}
                min={2.8}
                max={4.8}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
                onChange={setFinalDrive}
                color="emerald"
              />
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Column (5 cols): Staircase Chart */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "SPEED PER GEAR STAIRCASE",
              icon: <Activity size={16} />,
            }}
            className="p-5 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              {gearSpeeds.map((g, idx) => (
                <div key={g.gear} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs nh-font-mono">
                    <span className="text-amber-100/80 font-bold">{g.gear} Gear ({g.ratio.toFixed(2)}:1)</span>
                    <span className="text-sky-300 font-bold">{g.speed} km/h</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#05080f] rounded-full p-0.5 border border-white/10">
                    <div
                      style={{ width: `${Math.min(100, (g.speed / 420) * 100)}%` }}
                      className="h-full bg-sky-400/60 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

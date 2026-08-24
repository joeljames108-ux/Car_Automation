import React, { useState } from "react";
import {
  Zap,
  RotateCw,
  Sliders,
  Activity,
  Layers,
  Sparkles,
  Gauge,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonTorqueVectoringStudio() {
  const { sim } = useDesign();

  const [frontBias, setFrontBias] = useState(35); // % front power
  const [yawMomentAggressiveness, setYawMomentAggressiveness] = useState(80); // %
  const [vectorMode, setVectorMode] = useState<"track_apex" | "pure_rwd_drift" | "torque_overdrive" | "snow_ice_50">("track_apex");

  const totalTorqueNm = 1450;
  const frontTorqueNm = Math.round(totalTorqueNm * (frontBias / 100));
  const rearTorqueNm = totalTorqueNm - frontTorqueNm;
  const yawMomentKNm = ((yawMomentAggressiveness / 100) * 4.8).toFixed(1);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "QUAD-MOTOR INDEPENDENT TORQUE VECTORING & DYNAMIC YAW LAB",
          subtitle: "Millisecond per-wheel torque distribution, outer-wheel acceleration overdrive, and dynamic turn-in yaw moment",
          icon: <Zap size={18} />,
          badge: <NeonHorizonBadge variant="live">VECTORING ACTIVE · {vectorMode.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TOTAL SYSTEM TORQUE" value={`${totalTorqueNm} Nm`} accentColor="cyan" />
          <NeonHorizonDataCard label="DYNAMIC YAW MOMENT" value={`+${yawMomentKNm} kNm`} accentColor="magenta" />
          <NeonHorizonDataCard label="FRONT/REAR SPLIT" value={`${frontBias}% F / ${100 - frontBias}% R`} accentColor="emerald" />
          <NeonHorizonDataCard label="INNER WHEEL REGEN" value="-240 Nm (TUCK-IN)" accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4-Wheel Torque Allocation Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "4-CORNER INDEPENDENT MOTOR TORQUE OUTPUT",
              icon: <RotateCw size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#030712] border border-sky-400/25 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {[
                { pos: "FRONT LEFT (FL)", torque: `${Math.round(frontTorqueNm * 0.45)} Nm`, regen: "DRIVE", color: "text-sky-300" },
                { pos: "FRONT RIGHT (FR)", torque: `${Math.round(frontTorqueNm * 0.55)} Nm`, regen: "OVERDRIVE", color: "text-emerald-300" },
                { pos: "REAR LEFT (RL)", torque: `${Math.round(rearTorqueNm * 0.35)} Nm`, regen: "TUCK-IN", color: "text-amber-300" },
                { pos: "REAR RIGHT (RR)", torque: `${Math.round(rearTorqueNm * 0.65)} Nm`, regen: "APEX PUSH", color: "text-rose-400" },
              ].map((wheel, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#060e22] border border-white/10 flex flex-col gap-1 font-mono text-xs">
                  <span className="text-[10px] text-slate-400 font-bold">{wheel.pos}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Torque:</span>
                    <span className={`${wheel.color} font-bold text-sm`}>{wheel.torque}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vector State:</span>
                    <span className="text-sky-300 font-bold">{wheel.regen}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "track_apex", name: "Track Apex" },
                { id: "pure_rwd_drift", name: "RWD Drift" },
                { id: "torque_overdrive", name: "Overdrive" },
                { id: "snow_ice_50", name: "50/50 Snow" },
              ].map((m) => {
                const isSelected = vectorMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setVectorMode(m.id as "track_apex" | "pure_rwd_drift" | "torque_overdrive" | "snow_ice_50");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-[#091a38] border-sky-400/40 text-sky-300"
 : "bg-[#060e22] border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                  >
                    {m.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Vectoring Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "VECTORING GAIN & POWER BIAS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Front/Rear Power Bias"
              value={frontBias}
              min={0}
              max={60}
              step={5}
              unit="% Front"
              color="cyan"
              onChange={(val) => setFrontBias(val)}
            />

            <NeonHorizonSlider
              label="Yaw Moment Intervention Gain"
              value={yawMomentAggressiveness}
              min={10}
              max={100}
              step={5}
              unit="%"
              color="magenta"
              onChange={(val) => setYawMomentAggressiveness(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#060e22] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Response Rate:</span>
                <span className="text-sky-300 font-bold">1,000 Hz CAN-FD Loop</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Max Regen Vector:</span>
                <span className="text-emerald-300 font-bold">-500 Nm Inner Wheel</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

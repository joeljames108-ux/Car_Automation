import React, { useState } from "react";
import {
  Activity,
  Sliders,
  Zap,
  Shield,
  Layers,
  ArrowUpDown,
  Compass,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonActiveSuspensionStudio() {
  const { sim } = useDesign();

  const [activeRollStiffness, setActiveRollStiffness] = useState(85); // %
  const [curveTiltAngle, setCurveTiltAngle] = useState(2.4); // degrees inward tilt
  const [suspensionMode, setSuspensionMode] = useState<"aero_seal_gt3" | "magic_carpet" | "track_flat" | "launch_squat">("aero_seal_gt3");

  const pitchUnderBraking = ((100 - activeRollStiffness) * 0.02).toFixed(2);
  const rollUnderCornering = ((100 - activeRollStiffness) * 0.015).toFixed(2);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "48V ELECTRO-HYDRAULIC ACTIVE AERO SUSPENSION KINEMATICS",
          subtitle: "Zero-pitch braking anti-dive to seal ground effect venturi tunnels, active motorcycle curve tilt, and 2.5ms hydraulic response",
          icon: <ArrowUpDown size={18} />,
          badge: <NeonHorizonBadge variant="live">ACTIVE 48V LEVELING · {suspensionMode.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="BRAKE DIVE PITCH" value={`${pitchUnderBraking}° (SEALED)`} accentColor="emerald" />
          <NeonHorizonDataCard label="CORNER ROLL ANGLE" value={`${rollUnderCornering}° (FLAT)`} accentColor="cyan" />
          <NeonHorizonDataCard label="ACTIVE CURVE TILT" value={`+${curveTiltAngle.toFixed(1)}° INWARD`} accentColor="magenta" />
          <NeonHorizonDataCard label="HYDRAULIC LATENCY" value="2.5 ms (400 Hz)" accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4-Corner Hydraulic Actuator Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "4-CORNER FAST-ACTING HYDRAULIC STRUT LOADS",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-amber-950/60 border border-sky-400/25 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {[
                { pos: "FRONT LEFT (FL)", pressure: "185 BAR", height: "+0.0 mm", color: "text-amber-300" },
                { pos: "FRONT RIGHT (FR)", pressure: "185 BAR", height: "+0.0 mm", color: "text-amber-300" },
                { pos: "REAR LEFT (RL)", pressure: "160 BAR", height: "-2.0 mm", color: "text-emerald-300" },
                { pos: "REAR RIGHT (RR)", pressure: "160 BAR", height: "-2.0 mm", color: "text-emerald-300" },
              ].map((strut, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-amber-950/60 border border-white/10 flex flex-col gap-1 font-mono text-xs">
                  <span className="text-[10px] text-slate-400 font-bold">{strut.pos}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pressure:</span>
                    <span className={`${strut.color} font-bold`}>{strut.pressure}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Venturi Gap:</span>
                    <span className="text-amber-300 font-bold">{strut.height}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "aero_seal_gt3", name: "Aero Seal GT3" },
                { id: "magic_carpet", name: "Magic Carpet" },
                { id: "track_flat", name: "Track Flat" },
                { id: "launch_squat", name: "Launch Anti-Squat" },
              ].map((m) => {
                const isSelected = suspensionMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setSuspensionMode(m.id as "aero_seal_gt3" | "magic_carpet" | "track_flat" | "launch_squat");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-amber-950/60 border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                  >
                    {m.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Active Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "HYDRAULIC ACTUATOR TUNING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Active Roll & Pitch Compensation"
              value={activeRollStiffness}
              min={20}
              max={100}
              step={5}
              unit="%"
              color="cyan"
              onChange={(val) => setActiveRollStiffness(val)}
            />

            <NeonHorizonSlider
              label="Curve Banking Inward Tilt"
              value={curveTiltAngle}
              min={0.0}
              max={3.5}
              step={0.1}
              unit="°"
              color="magenta"
              onChange={(val) => setCurveTiltAngle(val)}
            />

            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">48V Pump Power:</span>
                <span className="text-amber-300 font-bold">12 kW Peak Electric</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Road Preview LiDAR:</span>
                <span className="text-emerald-300 font-bold">15m Ahead Predictive</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

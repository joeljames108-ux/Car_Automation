import React, { useState } from "react";
import {
  Disc,
  Flame,
  ShieldAlert,
  Sliders,
  Play,
  Zap,
  Activity,
  Droplet,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonBrakeLabStudio() {
  const { sim } = useDesign();

  const [discMaterial, setDiscMaterial] = useState<"carbon_ceramic" | "carbon_carbon" | "cast_iron">("carbon_ceramic");
  const [coolingDuctFlow, setCoolingDuctFlow] = useState(85); // %
  const [simulatedStops, setSimulatedStops] = useState(1);

  // Compute thermal metrics
  const maxRotorTemp = Math.round(180 + simulatedStops * 68 - (coolingDuctFlow / 100) * 80);
  const fadeRisk = maxRotorTemp > 750 ? "SEVERE FADE" : maxRotorTemp > 550 ? "MODERATE FADE" : "ZERO FADE (OPTIMAL)";
  const stoppingDist200 = (31.2 + (maxRotorTemp > 700 ? (maxRotorTemp - 700) * 0.05 : 0)).toFixed(1);

  const handleSimulateEmergencyStop = () => {
    playSubsystemEngageSound();
    setSimulatedStops((prev) => (prev >= 10 ? 1 : prev + 1));
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={maxRotorTemp > 650 ? "pulse" : "cyan"}
        corners="reticle"
        header={{
          title: "CARBON-CERAMIC BRAKE THERMAL FADE & ROTOR DECELERATION SOLVER",
          subtitle: "10-Stop consecutive 200-0 km/h emergency brake fade cycles, NACA duct airflows, and fluid boiling limits",
          icon: <Disc size={18} />,
          badge: <NeonHorizonBadge variant={maxRotorTemp > 650 ? "coral" : "emerald"}>PEAK ROTOR: {maxRotorTemp}°C</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="PEAK DISC TEMP" value={`${maxRotorTemp}°C`} accentColor={maxRotorTemp > 650 ? "coral" : "gold"} />
          <NeonHorizonDataCard label="200-0 KM/H DISTANCE" value={`${stoppingDist200} m`} accentColor="cyan" />
          <NeonHorizonDataCard label="THERMAL FADE RISK" value={fadeRisk} accentColor={maxRotorTemp > 650 ? "coral" : "emerald"} />
          <NeonHorizonDataCard label="ROTOR METALLURGY" value={discMaterial === "carbon_ceramic" ? "C/SiC CERAMIC" : discMaterial === "carbon_carbon" ? "CARBON-CARBON" : "CAST IRON"} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 10-Stop Thermal Fade Bar Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "10-STOP EMERGENCY DECELERATION TEMPERATURE SPIKES",
              icon: <Flame size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-10 gap-1.5 h-36 p-4 rounded-xl bg-slate-900/80 border border-sky-400/25 items-end shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {Array.from({ length: 10 }).map((_, idx) => {
                const stopTemp = Math.round(180 + (idx + 1) * 68 - (coolingDuctFlow / 100) * 80);
                const heightPercent = Math.min(100, Math.max(15, (stopTemp / 900) * 100));
                const isCurrent = idx + 1 === simulatedStops;
                const isHot = stopTemp > 650;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all ${
 isHot
 ? "bg-rose-500"
 : isCurrent
 ? "bg-amber-400"
 : "bg-amber-500/40"
 }`}
                    />
                    <span className="text-[9px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <NeonHorizonButton variant="primary" glow size="sm" onClick={handleSimulateEmergencyStop}>
                <Play size={14} className="mr-1.5" /> TRIGGER STOP #{simulatedStops} (200-0 KM/H)
              </NeonHorizonButton>
              <span className="text-xs font-mono text-slate-400">
                DOT 5.1 Fluid Boiling: <strong className="text-emerald-400">325°C Safe</strong>
              </span>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Metallurgy Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "ROTOR MATERIAL & NACA COOLING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">Brake Disc Metallurgy:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "carbon_ceramic", name: "Carbon-Ceramic" },
                  { id: "carbon_carbon", name: "Carbon-Carbon" },
                  { id: "cast_iron", name: "Cast Iron" },
                ].map((item) => {
                  const isSelected = discMaterial === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        playSubsystemEngageSound();
                        setDiscMaterial(item.id as "carbon_ceramic" | "carbon_carbon" | "cast_iron");
                      }}
                      className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-slate-900/80 border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                    >
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>

            <NeonHorizonSlider
              label="NACA Brake Duct Airflow"
              value={coolingDuctFlow}
              min={20}
              max={100}
              step={5}
              unit="%"
              color="cyan"
              onChange={(val) => setCoolingDuctFlow(val)}
            />

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Front Caliper:</span>
                <span className="text-amber-300 font-bold">10-Piston Monobloc Titanium</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rotor Dimension:</span>
                <span className="text-amber-300 font-bold">420 x 40 mm Ventilated</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

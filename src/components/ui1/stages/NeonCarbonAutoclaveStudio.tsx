import React, { useState } from "react";
import {
  Layers,
  Flame,
  Gauge,
  Sliders,
  ShieldCheck,
  Zap,
  Activity,
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

export function NeonCarbonAutoclaveStudio() {
  const { sim } = useDesign();

  const [cureTemp, setCureTemp] = useState(180); // °C (120-200)
  const [vesselPressure, setVesselPressure] = useState(7.0); // bar (2-8)
  const [prepregResin, setPrepregResin] = useState<"toughened_epoxy" | "cyanate_ester" | "bismaleimide">("toughened_epoxy");

  // Compute Composite Properties
  const voidPorosity = (0.8 - (vesselPressure / 8.0) * 0.6).toFixed(2);
  const torsionalRigidity = Math.round(58 + (vesselPressure / 8.0) * 16 + (cureTemp >= 175 ? 6 : 0));
  const tgTemp = prepregResin === "bismaleimide" ? "260°C" : prepregResin === "cyanate_ester" ? "220°C" : "195°C";

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "AEROSPACE CARBON PREPREG AUTOCLAVE CURING & RESIN CONSOLIDATION LAB",
          subtitle: "8-Bar hyperbaric nitrogen vessel consolidation, multi-ramp thermal resin cross-linking, and monocoque torsional stiffness synthesis",
          icon: <Layers size={18} />,
          badge: <NeonHorizonBadge variant="live">AUTOCLAVE CURE CYCLE ACTIVE · {prepregResin.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TORSIONAL RIGIDITY" value={`${torsionalRigidity} kNm/° (F1 SPEC)`} accentColor="emerald" />
          <NeonHorizonDataCard label="VOID POROSITY" value={`${voidPorosity}% (AEROSPACE)`} accentColor="cyan" />
          <NeonHorizonDataCard label="VESSEL PRESSURE" value={`${vesselPressure.toFixed(1)} BAR N₂`} accentColor="gold" />
          <NeonHorizonDataCard label="GLASS TRANSITION (Tg)" value={tgTemp} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Fiber Ply Layup Matrix (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "16-PLY QUASI-ISOTROPIC CARBON FIBER ORIENTATION SCHEDULE",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-8 gap-2 p-4 rounded-xl bg-[#05080f] border border-sky-400/25 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              {["0°", "+45°", "-45°", "90°", "0°", "+45°", "-45°", "90°", "90°", "-45°", "+45°", "0°", "90°", "-45°", "+45°", "0°"].map((ply, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#0a111e] border border-white/10 flex flex-col items-center justify-center font-mono text-[10px] text-center">
                  <span className="text-amber-200/60">P{idx + 1}</span>
                  <span className="text-sky-300 font-bold text-xs">{ply}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "toughened_epoxy", name: "T1000G Epoxy" },
                { id: "cyanate_ester", name: "Cyanate Ester" },
                { id: "bismaleimide", name: "High-Tg BMI" },
              ].map((r) => {
                const isSelected = prepregResin === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setPrepregResin(r.id as "toughened_epoxy" | "cyanate_ester" | "bismaleimide");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10 text-amber-200/60 hover:border-sky-400/25"
 }`}
                  >
                    {r.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Autoclave Parameters (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "PRESSURE & TEMPERATURE RAMP PROFILE",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Autoclave Cure Temperature"
              value={cureTemp}
              min={120}
              max={200}
              step={5}
              unit="°C"
              color="magenta"
              onChange={(val) => setCureTemp(val)}
            />

            <NeonHorizonSlider
              label="Nitrogen Vessel Consolidation Pressure"
              value={vesselPressure}
              min={2.0}
              max={8.0}
              step={0.5}
              unit=" bar"
              color="cyan"
              onChange={(val) => setVesselPressure(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Fiber Volume Fraction (Vf):</span>
                <span className="text-emerald-300 font-bold">64.5% Optimal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Vacuum Bag Debulk:</span>
                <span className="text-sky-300 font-bold">-0.98 Bar Vacuum</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

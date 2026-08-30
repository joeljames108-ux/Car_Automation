import React, { useState } from "react";
import {
  Trophy,
  ShieldCheck,
  Zap,
  Activity,
  Wind,
  Layers,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonConstructorStudio() {
  const { design, sim, updateAero } = useDesign();

  const [mgukMode, setMgukMode] = useState<string>("qualifying");
  const [venturiDepth, setVenturiDepth] = useState(65); // mm
  const [plankClearance, setPlankClearance] = useState(12); // mm

  const porpoisingRisk = venturiDepth > 75 && plankClearance < 10 ? "HIGH RISK" : "NOMINAL";

  const regChecks = [
    { item: "Minimum Curb Mass (798 kg limit)", pass: (sim.weight || 1000) >= 798, val: `${sim.weight} kg` },
    { item: "FIA Skid Block Plank Thickness (10mm min)", pass: plankClearance >= 10, val: `${plankClearance} mm` },
    { item: "DRS Flap Opening Gap (85mm max)", pass: true, val: "84.5 mm" },
    { item: "Halo Structural Titanium Strength (125 kN)", pass: true, val: "132 kN" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "FIA F1 & HYPERCAR CONSTRUCTOR COMPLIANCE",
          subtitle: "Technical regulations scrutineering, ground-effect venturi aero, and MGU-K hybrid deployment",
          icon: <Trophy size={18} />,
          badge: <NeonHorizonBadge variant="live">HOMOLOGATION VALID</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="SCRUTINEERING STATUS" value="PASSED" accentColor="emerald" />
          <NeonHorizonDataCard label="PORPOISING RISK" value={porpoisingRisk} accentColor={porpoisingRisk === "HIGH RISK" ? "coral" : "cyan"} />
          <NeonHorizonDataCard label="MGU-K DEPLOYMENT" value="120 kW" accentColor="gold" />
          <NeonHorizonDataCard label="GROUND EFFECT YIELD" value={`${(venturiDepth * 18)} N`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tuning Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "GROUND EFFECT VENTURI TUNNELS & HYBRID MAP",
              icon: <Wind size={16} />,
            }}
            className="p-6 flex flex-col gap-5"
          >
            <NeonHorizonSelect
              label="MGU-K HYBRID ELECTRIC BOOST DEPLOYMENT"
              value={mgukMode}
              onChange={setMgukMode}
              options={[
                { value: "qualifying", label: "Qualifying Hot-Lap (120 kW Full Discharge)", sublabel: "Maximum electrical boost across straightaways" },
                { value: "race_balanced", label: "Balanced Race Energy Management (85 kW)", sublabel: "Harmonized lap-to-lap battery state-of-charge" },
                { value: "super_harvest", label: "Super-Harvest Regen Mode (50 kW Regen)", sublabel: "Aggressive kinetic recovery under braking" },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NeonHorizonSlider
                label="VENTURI TUNNEL THROAT DEPTH"
                value={venturiDepth}
                min={30}
                max={95}
                unit="mm"
                onChange={setVenturiDepth}
                color="cyan"
              />
              <NeonHorizonSlider
                label="SKID BLOCK PLANK CLEARANCE"
                value={plankClearance}
                min={6}
                max={22}
                unit="mm"
                onChange={setPlankClearance}
                color="magenta"
              />
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Scrutineering Checklist (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "FIA TECHNICAL SCRUTINEERING",
              icon: <ShieldCheck size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {regChecks.map((chk, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-amber-950/60 border border-sky-400/15 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-100">{chk.item}</div>
                  <div className="text-[10px] nh-font-mono text-amber-300 mt-0.5">Value: {chk.val}</div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 nh-font-mono text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>PASS</span>
                </div>
              </div>
            ))}
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

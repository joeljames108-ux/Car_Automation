import React, { useState } from "react";
import {
  Warehouse,
  Car,
  Sparkles,
  Key,
  ShieldCheck,
  TrendingUp,
  Sliders,
  DollarSign,
  RotateCw,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonGarageStudio() {
  const { sim, design } = useDesign();

  const [selectedCar, setSelectedCar] = useState(1);
  const [lightingPreset, setLightingPreset] = useState("cyberpunk");

  const fleet = [
    { id: 1, name: "Apex Horizon GT-X", spec: "Twin-Turbo V8 AWD", power: `${sim.peakPower} HP`, odo: "1,420 km", value: "$1,850,000", badge: "ACTIVE BUILD" },
    { id: 2, name: "Valkyrie AMR Spec 02", spec: "6.5L V12 Hybrid RWD", power: "1,160 HP", odo: "3,840 km", value: "$3,200,000", badge: "TRACK ONLY" },
    { id: 3, name: "Nevera Warp Edition", spec: "Quad-Motor EV AWD", power: "1,914 HP", odo: "890 km", value: "$2,400,000", badge: "STREET LEGAL" },
    { id: 4, name: "Jesko Absolute Silver", spec: "5.0L Twin-Turbo Flat-Plane", power: "1,600 HP", odo: "2,100 km", value: "$3,400,000", badge: "COLLECTION" },
  ];

  const lightingPresets = [
    { id: "cyberpunk", name: "Cyberpunk Neon Blue & Magenta" },
    { id: "golden_hour", name: "Runway Sunset Golden Hour" },
    { id: "studio_white", name: "Clean High-Contrast Studio White" },
    { id: "stealth", name: "Midnight Stealth Low Key" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "VIRTUAL HYPERCAR GARAGE & FLEET SHOWCASE",
          subtitle: "Multi-vehicle collection, turntable studio lighting, and vehicle appraisal telemetry",
          icon: <Warehouse size={18} />,
          badge: <NeonHorizonBadge variant="live">FLEET VALUATION: $10.85M</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="ACTIVE VEHICLE" value="Apex Horizon GT-X" accentColor="cyan" />
          <NeonHorizonDataCard label="EST. VALUATION" value="$1.85M" accentColor="gold" />
          <NeonHorizonDataCard label="TOTAL FLEET" value="4 VEHICLES" accentColor="magenta" />
          <NeonHorizonDataCard label="FLEET CONDITION" value="100% PRISTINE" accentColor="emerald" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Turntable Vehicle Showcase (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "3D TURNTABLE STAGE LIGHTING",
              icon: <Car size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-3">
              {lightingPresets.map((preset) => {
                const isSelected = lightingPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      playHMIClickSound();
                      setLightingPreset(preset.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10 text-amber-100/80 hover:border-sky-400/25"
 }`}
                  >
                    {preset.name}
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">VIN Chassis Serial:</span>
                <span className="text-xs font-bold nh-font-mono text-sky-300">APX-2026-00984-GTX</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">Assembly Location:</span>
                <span className="text-xs font-bold nh-font-mono text-amber-300">Apex Skunkworks Plant 01</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-200/60">Track Homologation:</span>
                <span className="text-xs font-bold nh-font-mono text-emerald-300">FIA GT3 & Road Legal</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Fleet Collection (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "SELECT VEHICLE FLEET SLOT",
              icon: <Key size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {fleet.map((car) => {
              const isSelected = selectedCar === car.id;
              return (
                <div
                  key={car.id}
                  onClick={() => {
                    playHMIClickSound();
                    setSelectedCar(car.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10 hover:border-sky-400/25"
 }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-50">{car.name}</span>
                    <NeonHorizonBadge variant={isSelected ? "cyan" : "neutral"} size="xs">
                      {car.badge}
                    </NeonHorizonBadge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] nh-font-mono text-amber-200/60">
                    <span>{car.spec} · {car.power}</span>
                    <span className="text-amber-300 font-bold">{car.value}</span>
                  </div>
                </div>
              );
            })}
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}

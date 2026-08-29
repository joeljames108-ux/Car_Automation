import React, { useState } from "react";
import {
  Paintbrush,
  Sparkles,
  Layers,
  Wind,
  Shield,
  Eye,
  Sliders,
  Check,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonToggle } from "../design/NeonHorizonToggle";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { HyperFidelityExteriorStudioCustomizer } from "../../exterior/HyperFidelityExteriorStudioCustomizer";
import { UltraFidelityExteriorStudioWorkbench } from "../../exterior/UltraFidelityExteriorStudioWorkbench";
import { Phase8AeroKinematicsExteriorStudio } from "../../exterior/Phase8AeroKinematicsExteriorStudio";
import { Phase9ExtremeAeroStudioWorkbench } from "../../exterior/Phase9ExtremeAeroStudioWorkbench";
import type { BodyKit, SpoilerType, PaintFinish, BodyType, RoofScoopType } from "../../../sim/types";

export function NeonExteriorStudio() {
  const { design, sim, updateExterior, updateAero } = useDesign();
  const { exterior } = design.vehicle;

  const [activeTab, setActiveTab] = useState<"phase9_extreme_aero" | "phase8_kinematics" | "ultra_cad_workbench" | "hyper_studio" | "paint" | "aero_kit" | "lighting">("phase9_extreme_aero");

  const colorPresets = [
    { name: "Electric Cyan", hex: "#8fb9d9" },
    { name: "Acid Laser", hex: "#34d399" },
    { name: "Hyper Violet", hex: "#a78bfa" },
    { name: "Stealth Carbon", hex: "#0f172a" },
    { name: "Solar Gold", hex: "#d9b36c" },
    { name: "Crimson Pulse", hex: "#ff5252" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 p-1 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "phase9_extreme_aero" as const, label: "3D Extreme Aero Flaps", icon: <Sliders size={14} /> },
          { id: "phase8_kinematics" as const, label: "3D Aero-Kinematics Studio", icon: <Wind size={14} /> },
          { id: "ultra_cad_workbench" as const, label: "3D Ultra-CAD Workbench", icon: <Sparkles size={14} /> },
          { id: "hyper_studio" as const, label: "3D Hyper-Fidelity Studio", icon: <Eye size={14} /> },
          { id: "paint" as const, label: "Cyberpunk Paint & Materials", icon: <Paintbrush size={14} /> },
          { id: "aero_kit" as const, label: "Aero Bodykit & Wing", icon: <Wind size={14} /> },
          { id: "lighting" as const, label: "Laser Optics & Accents", icon: <Sparkles size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playHMITabSound();
              setActiveTab(tab.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs nh-font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "phase9_extreme_aero" && (
        <div className="w-full h-[700px]">
          <Phase9ExtremeAeroStudioWorkbench />
        </div>
      )}

      {activeTab === "phase8_kinematics" && (
        <div className="w-full h-[700px]">
          <Phase8AeroKinematicsExteriorStudio />
        </div>
      )}

      {activeTab === "ultra_cad_workbench" && (
        <div className="w-full h-[680px]">
          <UltraFidelityExteriorStudioWorkbench />
        </div>
      )}

      {activeTab === "hyper_studio" && (
        <div className="w-full h-[650px]">
          <HyperFidelityExteriorStudioCustomizer />
        </div>
      )}

      {activeTab !== "phase8_kinematics" && activeTab !== "ultra_cad_workbench" && activeTab !== "hyper_studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Config Deck (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {activeTab === "paint" && (
              <NeonHorizonGlassPanel
                variant="primary"
                corners="reticle"
                header={{
                  title: "EXTERIOR PAINT & CLEARCOAT FINISH",
                  subtitle: "Select spectral basecoat and metallic flake reflection",
                  icon: <Paintbrush size={16} />,
                }}
                className="p-6 flex flex-col gap-5"
              >
              {/* Color Swatches */}
              <div className="flex flex-col gap-2">
                <span className="nh-label-caps text-slate-400 text-[10px]">PRESET COLOR PALETTE</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {colorPresets.map((c) => {
                    const isSelected = exterior.paintColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        onClick={() => {
                          playHMIClickSound();
                          updateExterior({ paintColor: c.hex });
                        }}
                        style={{ backgroundColor: c.hex }}
                        className={`h-12 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${
 isSelected
 ? "border-white scale-105"
 : "border-white/20 hover:border-white/60"
 }`}
                      >
                        {isSelected && <Check size={16} className="text-black drop-shadow" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paint Finish Selector */}
              <NeonHorizonSelect
                label="PAINT COAT FINISH"
                value={exterior.paintFinish}
                onChange={(val) => updateExterior({ paintFinish: val as PaintFinish })}
                options={[
                  { value: "metallic", label: "Multi-Coat Metallic", sublabel: "Deep sparkling specular highlights" },
                  { value: "colorshift", label: "Chameleon Colorshift", sublabel: "Angle-dependent cyan-to-magenta hue" },
                  { value: "matte", label: "Matte Stealth", sublabel: "Zero glare military radar absorbing finish" },
                  { value: "satin", label: "Satin Liquid Silk", sublabel: "Semi-gloss diffuse reflections" },
                  { value: "gloss", label: "High Gloss Piano Lacquer", sublabel: "Mirror-like clearcoat reflection" },
                ]}
              />
            </NeonHorizonGlassPanel>
          )}

          {activeTab === "aero_kit" && (
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "AERODYNAMIC BODYKIT & SPOILER",
                icon: <Wind size={16} />,
              }}
              className="p-6 flex flex-col gap-5"
            >
              <NeonHorizonSelect
                label="BODYKIT PACKAGE"
                value={exterior.bodyKit}
                onChange={(val) => updateExterior({ bodyKit: val as BodyKit })}
                options={[
                  { value: "gt3", label: "FIA GT3 Homologation Aero", sublabel: "Aggressive front canards, extended diffuser" },
                  { value: "widebody", label: "Bolt-On Time Attack Widebody", sublabel: "Flared arches, +80mm front/rear track" },
                  { value: "track", label: "Club Sport Track Package", sublabel: "Functional aero splitters & brake ducts" },
                  { value: "street", label: "Clean Street GT", sublabel: "OEM+ integrated body lines" },
                ]}
              />

              <NeonHorizonSelect
                label="REAR WING / SPOILER SPECIFICATION"
                value={exterior.spoilerType}
                onChange={(val) => updateExterior({ spoilerType: val as SpoilerType })}
                options={[
                  { value: "swan_neck", label: "Swan-Neck Top-Mount Carbon Wing", sublabel: "Clean airflow underneath suction side" },
                  { value: "active_wing", label: "Hydraulic Active Aero DRS Wing", sublabel: "Variable angle-of-attack airbrake" },
                  { value: "gt_wing", label: "Multi-Element High-Downforce GT Wing", sublabel: "Dual airfoil with Gurney flap" },
                  { value: "ducktail", label: "Molded Carbon Ducktail Spoiler", sublabel: "Low drag, vintage high-speed stability" },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <NeonHorizonToggle
                  label="CARBON FRONT SPLITTER"
                  checked={exterior.splitter}
                  onChange={(v) => updateExterior({ splitter: v })}
                  color="cyan"
                />
                <NeonHorizonToggle
                  label="VENTED FRONT FENDERS"
                  checked={exterior.fenderVents}
                  onChange={(v) => updateExterior({ fenderVents: v })}
                  color="magenta"
                />
              </div>
            </NeonHorizonGlassPanel>
          )}

          {activeTab === "lighting" && (
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "LASER HEADLIGHTS & OLED TAILLIGHTS",
                icon: <Sparkles size={16} />,
              }}
              className="p-6 flex flex-col gap-4"
            >
              <NeonHorizonSelect
                label="HEADLIGHT OPTICS"
                value={exterior.headlightType}
                onChange={(val) => updateExterior({ headlightType: val as any })}
                options={[
                  { value: "laser", label: "Ultra-Range Matrix Laser Diodes", sublabel: "600m beam throw with adaptive masking" },
                  { value: "led_matrix", label: "Active Pixel LED Matrix", sublabel: "Individual micro-LED matrix array" },
                  { value: "oled_strip", label: "Full-Width OLED Lightblade", sublabel: "Futuristic blade running across front nose" },
                ]}
              />

              <NeonHorizonSelect
                label="TAILLIGHT OPTICS"
                value={exterior.taillightType}
                onChange={(val) => updateExterior({ taillightType: val as any })}
                options={[
                  { value: "laser_glow", label: "Laser Glass Lightguide", sublabel: "3D floating red laser illumination" },
                  { value: "sequential_led", label: "Sequential Animated LED Bar", sublabel: "Dynamic sweep turn signals" },
                  { value: "oled", label: "Layered 3D OLED Scales", sublabel: "Deep multi-layer red glow tiles" },
                ]}
              />
            </NeonHorizonGlassPanel>
          )}
        </div>

        {/* Right Aerodynamic Impact & Summary Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "AERODYNAMIC SILHOUETTE STATS",
              icon: <Layers size={16} />,
            }}
            className="p-5 flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <NeonHorizonDataCard
                label="DRAG COEFF"
                value={sim.dragCoeff.toFixed(3)}
                accentColor="cyan"
              />
              <NeonHorizonDataCard
                label="DOWNFORCE"
                value={sim.downforce}
                unit="N"
                accentColor="gold"
              />
              <NeonHorizonDataCard
                label="TOP SPEED"
                value={sim.topSpeed}
                unit="km/h"
                accentColor="emerald"
              />
              <NeonHorizonDataCard
                label="FRONT LIP EXT"
                value={`${(exterior.frontLipExtension * 100).toFixed(0)}%`}
                accentColor="magenta"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#0a111e] border border-sky-400/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] nh-font-mono text-slate-400">ACTIVE COLOR SPEC:</span>
                <div className="text-sm font-bold nh-font-headline text-sky-200 mt-0.5">
                  {exterior.paintColor.toUpperCase()} ({exterior.paintFinish.toUpperCase()})
                </div>
              </div>
              <div
                style={{ backgroundColor: exterior.paintColor }}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
      )}
    </div>
  );
}

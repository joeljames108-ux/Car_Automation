import { Car, Palette, Disc, Lightbulb, Layers, Wind, Gauge } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { CFDView } from "./ui/CFDView";

import {
  BODY_TYPES, RIM_DESIGNS, RIM_FINISHES, PAINT_FINISHES,
  HEADLIGHT_TYPES, TAILLIGHT_TYPES, BODY_KITS, SPOILER_TYPES,
  ROOF_SCOOPS, MIRROR_TYPES,
} from "../sim/constants";
import type {
  BodyType, RimDesign, RimFinish, PaintFinish,
  HeadlightType, TaillightType, BodyKit, SpoilerType, RoofScoopType,
  ExteriorConfig,
} from "../sim/types";

const PAINT_SWATCHES = [
  "#e11d48", "#dc2626", "#ea580c", "#f59e0b", "#facc15", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#2563eb",
  "#1e40af", "#7c3aed", "#a855f7", "#ec4899", "#f43f5e", "#0f172a",
  "#1e293b", "#475569", "#94a3b8", "#e2e8f0", "#f8fafc", "#92400e",
];

const BADGE_SWATCHES = ["#e11d48", "#facc15", "#22d3ee", "#e2e8f0", "#0f172a", "#84cc16"];

function BodyPreview({ bodyType, finish }: {
  bodyType: BodyType; finish: PaintFinish;
}) {
  return (
    <div className="relative bg-gradient-to-b from-base-900 to-base-950 rounded-lg overflow-hidden border border-base-800">
      <img src="/agera.png" alt="Car Preview" className="w-full h-auto block" />

      {/* finish label */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
        {BODY_TYPES[bodyType].label} · {PAINT_FINISHES[finish].label}
      </div>
    </div>
  );
}

export function ExteriorDesigner() {
  const { design, sim, updateExterior } = useDesign();
  const ext = design.vehicle.exterior;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4 stagger">
        <Section title="Body Type" icon={<Car size={16} />}>
          <div className="mb-3">
            <ChoiceGrid<BodyType>
              value={ext.bodyType}
              options={(Object.keys(BODY_TYPES) as BodyType[]).map((b) => ({ value: b, label: BODY_TYPES[b].label }))}
              onChange={(val) => updateExterior({ bodyType: val })}
              columns={6}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-base-850 rounded-lg p-2 border border-base-800">
              <div className="label-mono text-slate-500">Origin</div>
              <div className="text-slate-300">{BODY_TYPES[ext.bodyType].origin}</div>
            </div>
            <div className="bg-base-850 rounded-lg p-2 border border-base-800">
              <div className="label-mono text-slate-500">Aero Impact</div>
              <div className="text-slate-300">
                Cd {BODY_TYPES[ext.bodyType].dragDelta >= 0 ? "+" : ""}{BODY_TYPES[ext.bodyType].dragDelta.toFixed(3)} · Cl {BODY_TYPES[ext.bodyType].liftDelta >= 0 ? "+" : ""}{BODY_TYPES[ext.bodyType].liftDelta.toFixed(3)}
              </div>
            </div>
            <div className="bg-base-850 rounded-lg p-2 border border-base-800">
              <div className="label-mono text-slate-500">Weight Δ</div>
              <div className="text-slate-300">{BODY_TYPES[ext.bodyType].weightDelta > 0 ? "+" : ""}{BODY_TYPES[ext.bodyType].weightDelta} kg</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{BODY_TYPES[ext.bodyType].description}</p>
        </Section>

        <Section title="Paint & Finish" icon={<Palette size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label-mono mb-1.5 block">Paint Color</label>
              <div className="grid grid-cols-8 gap-1.5">
                {PAINT_SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateExterior({ paintColor: c })}
                    className={`h-7 rounded-md border-2 transition-all ${ext.paintColor === c ? "border-accent-400 scale-110" : "border-base-800 hover:border-base-600"}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={ext.paintColor}
                  onChange={(e) => updateExterior({ paintColor: e.target.value })}
                  className="h-8 w-12 bg-transparent border border-base-800 rounded cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-400">{ext.paintColor}</span>
              </div>
            </div>
            <div>
              <Select<PaintFinish>
                label="Finish"
                value={ext.paintFinish}
                options={(Object.keys(PAINT_FINISHES) as PaintFinish[]).map((f) => ({ value: f, label: PAINT_FINISHES[f].label }))}
                onChange={(val) => updateExterior({ paintFinish: val })}
              />
              <div className="mt-3">
                <label className="label-mono mb-1.5 block">Badge Color</label>
                <div className="flex gap-1.5">
                  {BADGE_SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateExterior({ badgeColor: c })}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${ext.badgeColor === c ? "border-accent-400 scale-110" : "border-base-800 hover:border-base-600"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Wheels & Rims" icon={<Disc size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select<RimDesign>
              label="Rim Design"
              value={ext.rimDesign}
              options={(Object.keys(RIM_DESIGNS) as RimDesign[]).map((r) => ({ value: r, label: RIM_DESIGNS[r].label }))}
              onChange={(val) => updateExterior({ rimDesign: val })}
            />
            <Select<RimFinish>
              label="Rim Finish"
              value={ext.rimFinish}
              options={(Object.keys(RIM_FINISHES) as RimFinish[]).map((r) => ({ value: r, label: RIM_FINISHES[r].label }))}
              onChange={(val) => updateExterior({ rimFinish: val })}
            />
            <Slider label="Rim Diameter" value={ext.rimDiameter} min={15} max={22} unit='"' onChange={(val) => updateExterior({ rimDiameter: val })} />
            <Slider label="Rim Width" value={ext.rimWidth} min={7} max={13} step={0.5} unit='"' onChange={(val) => updateExterior({ rimWidth: val })} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
            <div className="bg-base-850 rounded p-1.5 border border-base-800 text-center">
              <div className="label-mono text-slate-500">Aero</div>
              <div className="font-mono text-slate-300">{(RIM_DESIGNS[ext.rimDesign].aeroFactor).toFixed(2)}×</div>
            </div>
            <div className="bg-base-850 rounded p-1.5 border border-base-800 text-center">
              <div className="label-mono text-slate-500">Weight</div>
              <div className="font-mono text-slate-300">{(RIM_DESIGNS[ext.rimDesign].weightFactor).toFixed(2)}×</div>
            </div>
            <div className="bg-base-850 rounded p-1.5 border border-base-800 text-center">
              <div className="label-mono text-slate-500">Brake Cool</div>
              <div className="font-mono text-slate-300">{(RIM_DESIGNS[ext.rimDesign].brakeCooling * 100).toFixed(0)}%</div>
            </div>
          </div>
        </Section>

        <Section title="Lighting" icon={<Lightbulb size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select<HeadlightType>
              label="Headlights"
              value={ext.headlightType}
              options={(Object.keys(HEADLIGHT_TYPES) as HeadlightType[]).map((h) => ({ value: h, label: HEADLIGHT_TYPES[h].label }))}
              onChange={(val) => updateExterior({ headlightType: val })}
            />
            <Select<TaillightType>
              label="Taillights"
              value={ext.taillightType}
              options={(Object.keys(TAILLIGHT_TYPES) as TaillightType[]).map((t) => ({ value: t, label: TAILLIGHT_TYPES[t].label }))}
              onChange={(val) => updateExterior({ taillightType: val })}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3 text-[10px]">
            <div className="bg-base-850 rounded p-1.5 border border-base-800 text-center">
              <div className="label-mono text-slate-500">Headlight Wt</div>
              <div className="font-mono text-slate-300">{HEADLIGHT_TYPES[ext.headlightType].weight} kg</div>
            </div>
            <div className="bg-base-850 rounded p-1.5 border border-base-800 text-center">
              <div className="label-mono text-slate-500">Draw</div>
              <div className="font-mono text-slate-300">{HEADLIGHT_TYPES[ext.headlightType].powerDraw} W</div>
            </div>
            <div className="bg-base-850 rounded p-1.5 border border-base-800 text-center">
              <div className="label-mono text-slate-500">Taillight Wt</div>
              <div className="font-mono text-slate-300">{TAILLIGHT_TYPES[ext.taillightType].weight} kg</div>
            </div>
            <div className="bg-base-850 rounded p-1.5 border border-base-800 text-center">
              <div className="label-mono text-slate-500">Brightness</div>
              <div className="font-mono text-slate-300">{(HEADLIGHT_TYPES[ext.headlightType].brightness * 100).toFixed(0)}%</div>
            </div>
          </div>
        </Section>

        <Section title="Body Kit & Aero Add-ons" icon={<Layers size={16} />}>
          <div className="mb-3">
            <label className="label-mono mb-1.5 block">Body Kit</label>
            <ChoiceGrid<BodyKit>
              value={ext.bodyKit}
              options={(Object.keys(BODY_KITS) as BodyKit[]).map((k) => ({ value: k, label: BODY_KITS[k].label }))}
              onChange={(val) => updateExterior({ bodyKit: val })}
              columns={4}
            />
            <p className="text-[11px] text-slate-500 mt-2">{BODY_KITS[ext.bodyKit].description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select<SpoilerType>
              label="Spoiler / Wing"
              value={ext.spoilerType}
              options={(Object.keys(SPOILER_TYPES) as SpoilerType[]).map((s) => ({ value: s, label: SPOILER_TYPES[s].label }))}
              onChange={(val) => updateExterior({ spoilerType: val })}
            />
            <Select<RoofScoopType>
              label="Roof Scoop"
              value={ext.roofScoop}
              options={(Object.keys(ROOF_SCOOPS) as RoofScoopType[]).map((r) => ({ value: r, label: ROOF_SCOOPS[r].label }))}
              onChange={(val) => updateExterior({ roofScoop: val })}
            />
            <Select
              label="Mirrors"
              value={ext.mirrorType}
              options={(Object.keys(MIRROR_TYPES) as string[]).map((m) => ({ value: m, label: MIRROR_TYPES[m].label }))}
              onChange={(val) => updateExterior({ mirrorType: val as ExteriorConfig["mirrorType"] })}
            />
            <Slider label="Front Lip Extension" value={ext.frontLipExtension} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(val) => updateExterior({ frontLipExtension: val })} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            <Toggle label="Hood Scoop" value={ext.hoodScoop} onChange={(val) => updateExterior({ hoodScoop: val })} />
            <Toggle label="Side Skirts" value={ext.sideSkirts} onChange={(val) => updateExterior({ sideSkirts: val })} />
            <Toggle label="Fender Vents" value={ext.fenderVents} onChange={(val) => updateExterior({ fenderVents: val })} />
            <Toggle label="Front Splitter" value={ext.splitter} onChange={(val) => updateExterior({ splitter: val })} />
            <Toggle label="Tow Hook" value={ext.towHook} onChange={(val) => updateExterior({ towHook: val })} />
          </div>
        </Section>
      </div>

      {/* Right column: live preview + aero */}
      <div className="space-y-4">
        <Section title="Live Body Preview" icon={<Car size={16} />}>
          <BodyPreview
            bodyType={ext.bodyType}
            finish={ext.paintFinish}
          />
        </Section>

        <CFDView aero={design.vehicle.aero} dragCoeff={sim.dragCoeff} liftCoeff={sim.liftCoeff} downforce={sim.downforce} />

        <Section title="Exterior Impact" icon={<Wind size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Drag Cd" value={sim.dragCoeff.toFixed(3)} accent="accent" />
            <StatTile label="Lift Cl" value={sim.liftCoeff.toFixed(3)} accent="accent" />
            <StatTile label="Downforce" value={sim.downforce} unit="N" accent="ok" />
            <StatTile label="Total Weight" value={sim.weight} unit="kg" />
            <StatTile label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
            <StatTile label="0-60 mph" value={sim.accel0_60} unit="s" accent="ok" />
          </div>
        </Section>

        <Section title="Aero Forces" icon={<Gauge size={16} />}>
          <div className="text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between"><span>Body type Cd Δ</span><span className="font-mono text-slate-300">{BODY_TYPES[ext.bodyType].dragDelta >= 0 ? "+" : ""}{BODY_TYPES[ext.bodyType].dragDelta.toFixed(3)}</span></div>
            <div className="flex justify-between"><span>Body kit Cd Δ</span><span className="font-mono text-slate-300">{BODY_KITS[ext.bodyKit].dragDelta >= 0 ? "+" : ""}{BODY_KITS[ext.bodyKit].dragDelta.toFixed(3)}</span></div>
            <div className="flex justify-between"><span>Spoiler Cl Δ</span><span className="font-mono text-slate-300">{SPOILER_TYPES[ext.spoilerType].liftDelta >= 0 ? "+" : ""}{SPOILER_TYPES[ext.spoilerType].liftDelta.toFixed(3)}</span></div>
            <div className="flex justify-between"><span>Paint Cd Δ</span><span className="font-mono text-slate-300">{PAINT_FINISHES[ext.paintFinish].dragDelta >= 0 ? "+" : ""}{PAINT_FINISHES[ext.paintFinish].dragDelta.toFixed(3)}</span></div>
            <div className="flex justify-between"><span>Headlight Cd Δ</span><span className="font-mono text-slate-300">{HEADLIGHT_TYPES[ext.headlightType].dragDelta >= 0 ? "+" : ""}{HEADLIGHT_TYPES[ext.headlightType].dragDelta.toFixed(3)}</span></div>
          </div>
        </Section>
      </div>
    </div>
  );
}

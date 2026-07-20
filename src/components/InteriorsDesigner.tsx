import { Sofa, Palette, Volume2, Snowflake, Shield, Gauge, Sparkles, Armchair } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { SEAT_TYPES, SEAT_MATERIALS, DASHBOARD_MATERIALS, STEERING_WHEEL_TYPES, STEERING_MATERIALS, PEDAL_SETS, SHIFT_KNOBS, ROLL_CAGES } from "../sim/constants";

export function InteriorsDesigner() {
  const { design, sim, updateInterior } = useDesign();
  const i = design.vehicle.interior;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4">
        <Section title="Seating" icon={<Armchair size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label-mono mb-1.5 block">Seat Type</label>
              <ChoiceGrid
                value={i.seatType}
                options={(Object.keys(SEAT_TYPES) as string[]).map((s) => ({ value: s, label: SEAT_TYPES[s].label }))}
                onChange={(v) => updateInterior({ seatType: v as typeof i.seatType })}
                columns={3}
              />
            </div>
            <Select
              label="Seat Material"
              value={i.seatMaterial}
              options={(Object.keys(SEAT_MATERIALS) as string[]).map((m) => ({ value: m, label: SEAT_MATERIALS[m].label }))}
              onChange={(v) => updateInterior({ seatMaterial: v as typeof i.seatMaterial })}
            />
            <Slider label="Seat Count" value={i.seatCount} min={1} max={5} onChange={(v) => updateInterior({ seatCount: v })} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatTile label="Seat Weight" value={SEAT_TYPES[i.seatType].weight * i.seatCount} unit="kg" />
            <StatTile label="Lateral Support" value={`${(SEAT_TYPES[i.seatType].support * 100).toFixed(0)}%`} accent="accent" />
            <StatTile label="Comfort" value={`${(SEAT_TYPES[i.seatType].comfort * 100).toFixed(0)}%`} />
          </div>
        </Section>

        <Section title="Dashboard & Controls" icon={<Gauge size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Dashboard Material"
              value={i.dashboardMaterial}
              options={(Object.keys(DASHBOARD_MATERIALS) as string[]).map((d) => ({ value: d, label: DASHBOARD_MATERIALS[d].label }))}
              onChange={(v) => updateInterior({ dashboardMaterial: v as typeof i.dashboardMaterial })}
            />
            <Select
              label="Steering Wheel"
              value={i.steeringWheel}
              options={(Object.keys(STEERING_WHEEL_TYPES) as string[]).map((w) => ({ value: w, label: STEERING_WHEEL_TYPES[w].label }))}
              onChange={(v) => updateInterior({ steeringWheel: v as typeof i.steeringWheel })}
            />
            <Select
              label="Steering Material"
              value={i.steeringMaterial}
              options={(Object.keys(STEERING_MATERIALS) as string[]).map((m) => ({ value: m, label: STEERING_MATERIALS[m].label }))}
              onChange={(v) => updateInterior({ steeringMaterial: v as typeof i.steeringMaterial })}
            />
            <Select
              label="Pedal Set"
              value={i.pedalSet}
              options={(Object.keys(PEDAL_SETS) as string[]).map((p) => ({ value: p, label: PEDAL_SETS[p].label }))}
              onChange={(v) => updateInterior({ pedalSet: v as typeof i.pedalSet })}
            />
            <Select
              label="Shift Knob"
              value={i.shiftKnob}
              options={(Object.keys(SHIFT_KNOBS) as string[]).map((k) => ({ value: k, label: SHIFT_KNOBS[k].label }))}
              onChange={(v) => updateInterior({ shiftKnob: v as typeof i.shiftKnob })}
            />
            <Select
              label="Trim Finish"
              value={i.trimFinish}
              options={[{ value: "matte", label: "Matte" }, { value: "gloss", label: "Gloss" }, { value: "satin", label: "Satin" }, { value: "brushed", label: "Brushed" }]}
              onChange={(v) => updateInterior({ trimFinish: v as typeof i.trimFinish })}
            />
          </div>
        </Section>

        <Section title="Infotainment & Comfort" icon={<Volume2 size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Slider label="Screen Size" value={i.infotainmentSize} min={0} max={15} step={0.5} unit='"' onChange={(v) => updateInterior({ infotainmentSize: v })} />
            <Slider label="Speakers" value={i.audioSpeakers} min={2} max={24} onChange={(v) => updateInterior({ audioSpeakers: v })} />
            <Slider label="Ambient Lighting" value={i.ambientLighting} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateInterior({ ambientLighting: v })} />
            <Slider label="Sound Deadening" value={i.soundDeadening} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateInterior({ soundDeadening: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Toggle label="Navigation" value={i.hasNav} onChange={(v) => updateInterior({ hasNav: v })} />
            <Toggle label="Premium Audio" value={i.hasPremiumAudio} onChange={(v) => updateInterior({ hasPremiumAudio: v })} />
            <Toggle label="Climate Control" value={i.climateControl} onChange={(v) => updateInterior({ climateControl: v })} />
          </div>
        </Section>

        <Section title="Colors" icon={<Palette size={16} />}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-mono mb-1.5 block">Interior Color</label>
              <input type="color" value={i.interiorColor} onChange={(e) => updateInterior({ interiorColor: e.target.value })} className="w-full h-10 rounded-lg bg-base-850 border border-base-700 cursor-pointer" />
            </div>
            <div>
              <label className="label-mono mb-1.5 block">Accent Color</label>
              <input type="color" value={i.accentColor} onChange={(e) => updateInterior({ accentColor: e.target.value })} className="w-full h-10 rounded-lg bg-base-850 border border-base-700 cursor-pointer" />
            </div>
          </div>
          {/* Interior preview */}
          <div className="mt-3 rounded-lg overflow-hidden border border-base-800" style={{ background: i.interiorColor }}>
            <div className="p-6 flex items-center justify-center gap-4" style={{ background: `linear-gradient(180deg, ${i.interiorColor} 0%, ${i.interiorColor}dd 100%)` }}>
              <div className="rounded-lg px-4 py-2 text-xs font-mono" style={{ color: i.accentColor, border: `1px solid ${i.accentColor}40` }}>
                Dashboard Preview
              </div>
              <div className="rounded-full h-8 w-8 flex items-center justify-center" style={{ border: `2px solid ${i.accentColor}` }}>
                <span className="text-[8px]" style={{ color: i.accentColor }}>SW</span>
              </div>
            </div>
            <div className="flex justify-center gap-2 pb-4">
              {Array.from({ length: i.seatCount }).map((_, idx) => (
                <div key={idx} className="rounded-lg h-12 w-10 flex items-center justify-center" style={{ background: `${i.accentColor}30`, border: `1px solid ${i.accentColor}60` }}>
                  <Armchair size={16} style={{ color: i.accentColor }} />
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Safety & Racing Equipment" icon={<Shield size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Roll Cage"
              value={i.rollCage}
              options={(Object.keys(ROLL_CAGES) as string[]).map((c) => ({ value: c, label: ROLL_CAGES[c].label }))}
              onChange={(v) => updateInterior({ rollCage: v as typeof i.rollCage })}
            />
            <Slider label="Harness Points" value={i.harnessPoints} min={4} max={6} onChange={(v) => updateInterior({ harnessPoints: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Toggle label="Racing Harness" value={i.racingHarness} onChange={(v) => updateInterior({ racingHarness: v })} />
            <Toggle label="Fire Extinguisher" value={i.fireExtinguisher} onChange={(v) => updateInterior({ fireExtinguisher: v })} />
            <Toggle label="Window Net" value={i.windowNet} onChange={(v) => updateInterior({ windowNet: v })} />
          </div>
        </Section>
      </div>

      {/* Right column — stats */}
      <div className="space-y-4">
        <Section title="Interior Summary" icon={<Sofa size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Interior Weight" value={sim.interiorWeight} unit="kg" accent="accent" />
            <StatTile label="Interior Cost" value={`$${sim.interiorCost.toLocaleString()}`} accent="accent" />
            <StatTile label="Comfort" value={`${(sim.comfortRating * 100).toFixed(0)}%`} accent="ok" />
            <StatTile label="Luxury" value={`${(sim.luxuryRating * 100).toFixed(0)}%`} accent="ok" />
          </div>
        </Section>

        <Section title="Weight Breakdown" icon={<Gauge size={16} />}>
          <div className="space-y-2">
            <WeightBar label="Seats" value={SEAT_TYPES[i.seatType].weight * SEAT_MATERIALS[i.seatMaterial].weightFactor * i.seatCount} max={100} />
            <WeightBar label="Dashboard" value={DASHBOARD_MATERIALS[i.dashboardMaterial].weight} max={100} />
            <WeightBar label="Roll Cage" value={ROLL_CAGES[i.rollCage].weight} max={100} />
            <WeightBar label="Audio" value={i.hasPremiumAudio ? i.audioSpeakers * 1.5 : i.audioSpeakers * 0.5} max={100} />
            <WeightBar label="Sound Deadening" value={i.soundDeadening * 20} max={100} />
            <WeightBar label="Steering Wheel" value={STEERING_WHEEL_TYPES[i.steeringWheel].weight} max={100} />
          </div>
        </Section>

        <Section title="Ratings" icon={<Sparkles size={16} />}>
          <div className="space-y-3">
            <RatingBar label="Comfort" value={sim.comfortRating} />
            <RatingBar label="Luxury" value={sim.luxuryRating} />
            <RatingBar label="Safety" value={ROLL_CAGES[i.rollCage].safetyFactor} />
            <RatingBar label="Sport Factor" value={SEAT_TYPES[i.seatType].support} />
          </div>
        </Section>

        <Section title="Impact on Vehicle" icon={<Snowflake size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Total Weight" value={sim.weight} unit="kg" />
            <StatTile label="Noise Level" value={sim.noise} unit="dB" accent={sim.noise < 70 ? "ok" : "warn"} />
            <StatTile label="Drivability" value={`${(sim.drivability * 100).toFixed(0)}%`} accent="ok" />
            <StatTile label="Market Rating" value={`${sim.marketRating}/5`} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function WeightBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-300">{value.toFixed(1)} kg</span>
      </div>
      <div className="h-2 bg-base-850 rounded-full overflow-hidden">
        <div className="h-full bg-accent-500/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(value * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-accent-300">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-base-850 rounded-full overflow-hidden">
        <div className="h-full bg-ok-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

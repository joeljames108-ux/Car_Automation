// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR & ELECTRONICS STUDIO — MAIN DESIGNER COMPONENT
// ============================================================================
// Features:
// - Photorealistic 3D Three.js First-Person Cockpit Viewport with 6 Camera Presets
// - 5-Tab Glassmorphism Interior Studio Workbench (Materials, Displays, Seating, Audio, NVH)
// - Integrated Vehicle Electronics, Avionics, CAN-FD, ADAS & Infotainment Suite
// - Classic 2D Parametric Controls & Realistic Dashboard Cross-Section Preview
// - Complete Two-Way State Synchronization with DesignContext
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Sofa, Palette, Volume2, Snowflake, Shield, Gauge, Sparkles, Armchair,
Box, Sliders, Cpu, Monitor, Zap, Radio
} from 'lucide-react';
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from './ui/Controls';
import {
  SEAT_TYPES, SEAT_MATERIALS, DASHBOARD_MATERIALS, STEERING_WHEEL_TYPES,
  STEERING_MATERIALS, PEDAL_SETS, SHIFT_KNOBS, ROLL_CAGES
} from '../sim/constants';
import { useDesign } from '../state/DesignContext';
import { InfotainmentDesigner } from './InfotainmentDesigner';
import { InteriorDashboardConfiguratorStudio } from './interior/InteriorDashboardConfiguratorStudio';
import { playHMITabSound } from '../utils/hmiSoundSynth';

const SEAT_MATERIAL_OPTIONS = Object.entries(SEAT_MATERIALS).map(([k, v]) => ({ value: k, label: v.label }));
const DASHBOARD_MATERIAL_OPTIONS = Object.entries(DASHBOARD_MATERIALS).map(([k, v]) => ({ value: k, label: v.label }));
const STEERING_WHEEL_OPTIONS = Object.entries(STEERING_WHEEL_TYPES).map(([k, v]) => ({ value: k, label: v.label }));
const STEERING_MATERIAL_OPTIONS = Object.entries(STEERING_MATERIALS).map(([k, v]) => ({ value: k, label: v.label }));
const PEDAL_SET_OPTIONS = Object.entries(PEDAL_SETS).map(([k, v]) => ({ value: k, label: v.label }));
const SHIFT_KNOB_OPTIONS = Object.entries(SHIFT_KNOBS).map(([k, v]) => ({ value: k, label: v.label }));
const TRIM_FINISH_OPTIONS = [
  { value: "matte", label: "Matte" },
  { value: "gloss", label: "Gloss" },
  { value: "satin", label: "Satin" },
  { value: "brushed", label: "Brushed" },
];

export type InteriorStudioViewMode = 'electronics' | '2d_classic' | 'configurator';

interface InteriorsDesignerProps {
  initialSubTab?: InteriorStudioViewMode;
}

export function InteriorsDesigner({ initialSubTab = 'configurator' }: InteriorsDesignerProps) {
  const { design, sim, updateInterior } = useDesign();
  const i = design.vehicle.interior;
  const chassis = design.vehicle.chassis;

  const [viewMode, setViewMode] = useState<InteriorStudioViewMode>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setViewMode(initialSubTab);
    }
  }, [initialSubTab]);



  const handleTabSelect = (mode: InteriorStudioViewMode) => {
    playHMITabSound();
    setViewMode(mode);
  };

  return (
    <div className="space-y-4">
      {/* ── TOP SWITCHER: UNIFIED INTERIOR & ELECTRONICS STUDIO TABS ── */}
      <div
        className="flex items-center justify-between p-2 rounded-2xl backdrop-blur-xl shadow-xl border"
        style={{
          backgroundColor: 'rgba(255,248,235,0.88)',
          borderColor: 'rgba(217,166,78,0.4)',
        }}
      >
        <div className="flex items-center gap-2 pl-2">
          <Sparkles style={{ color: '#92400E' }} size={18} />
          <span className="text-xs font-black tracking-wider uppercase" style={{ color: '#92400E' }}>
            INTERIOR & ELECTRONICS WORKBENCH
          </span>
        </div>

        {/* Studio View Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => handleTabSelect('configurator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'configurator'
                ? 'shadow-md scale-[1.02] bg-blue-600 text-white ring-2 ring-blue-400'
                : 'hover:opacity-80 bg-blue-500/10 text-blue-800'
            }`}
          >
            <Sliders size={13} />
            <span>🎚️ 2D DASHBOARD CONFIGURATOR</span>
          </button>

          <button
            onClick={() => handleTabSelect('electronics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'electronics'
                ? 'shadow-md scale-[1.02]'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: viewMode === 'electronics' ? '#B45309' : 'transparent',
              color: viewMode === 'electronics' ? '#ffffff' : '#78350F'
            }}
          >
            <Cpu size={13} />
            <span>ELECTRONICS & AVIONICS</span>
          </button>

          <button
            onClick={() => handleTabSelect('2d_classic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === '2d_classic'
                ? 'shadow-md scale-[1.02]'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: viewMode === '2d_classic' ? '#B45309' : 'transparent',
              color: viewMode === '2d_classic' ? '#ffffff' : '#78350F'
            }}
          >
            <Box size={13} />
            <span>2D CONTROLS</span>
          </button>
        </div>
      </div>

      {/* ── CONDITIONAL VIEW MODE RENDERING ── */}
      {viewMode === 'configurator' ? (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-amber-800/30">
          <InteriorDashboardConfiguratorStudio />
        </div>
        ) : viewMode === 'electronics' ? (
        /* MODE B: Vehicle Electronics, Infotainment, ADAS, CAN-FD & Avionics */
        <InfotainmentDesigner />
      ) : (
        /* MODE D: Classic 2D Controls & Section Layouts */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Section title="Seating & Upholstery" icon={<Armchair size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="label-mono mb-1.5 block">Seat Type</label>
                  <ChoiceGrid
                    value={i.seatType}
                    options={Object.entries(SEAT_TYPES).map(([k, v]) => ({ value: k, label: v.label, desc: `${v.weight}kg | Comfort: ${(v.comfort * 10).toFixed(0)}/10` }))}
                    onChange={(v) => updateInterior({ seatType: v as typeof i.seatType })}
                    columns={3}
                  />
                </div>
                <Select
                  label="Seat Material"
                  value={i.seatMaterial}
                  options={SEAT_MATERIAL_OPTIONS}
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
                  options={DASHBOARD_MATERIAL_OPTIONS}
                  onChange={(v) => updateInterior({ dashboardMaterial: v as typeof i.dashboardMaterial })}
                />
                <Select
                  label="Steering Wheel"
                  value={i.steeringWheel}
                  options={STEERING_WHEEL_OPTIONS}
                  onChange={(v) => updateInterior({ steeringWheel: v as typeof i.steeringWheel })}
                />
                <Select
                  label="Steering Material"
                  value={i.steeringMaterial}
                  options={STEERING_MATERIAL_OPTIONS}
                  onChange={(v) => updateInterior({ steeringMaterial: v as typeof i.steeringMaterial })}
                />
                <Select
                  label="Pedal Set"
                  value={i.pedalSet}
                  options={PEDAL_SET_OPTIONS}
                  onChange={(v) => updateInterior({ pedalSet: v as typeof i.pedalSet })}
                />
                <Select
                  label="Shift Knob"
                  value={i.shiftKnob}
                  options={SHIFT_KNOB_OPTIONS}
                  onChange={(v) => updateInterior({ shiftKnob: v as typeof i.shiftKnob })}
                />
                <Select
                  label="Trim Finish"
                  value={i.trimFinish}
                  options={TRIM_FINISH_OPTIONS}
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
      )}
    </div>
  );
}

function WeightBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-amber-300/70">{label}</span>
        <span className="font-mono text-amber-200">{value.toFixed(1)} kg</span>
      </div>
      <div className="h-2 bg-amber-950/40 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(value * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-amber-300/70">{label}</span>
        <span className="font-mono text-amber-300">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-amber-950/40 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

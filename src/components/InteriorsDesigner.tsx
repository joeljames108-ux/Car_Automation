// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — MAIN DESIGNER COMPONENT
// ============================================================================
// Features:
// - Photorealistic 3D Three.js First-Person Cockpit Viewport with 6 Camera Presets
// - 5-Tab Glassmorphism Interior Studio Workbench (Materials, Displays, Seating, Audio, NVH)
// - Classic 2D Parametric Controls & Realistic Dashboard Cross-Section Preview
// - Complete Two-Way State Synchronization with DesignContext
// ============================================================================

import React, { useState } from 'react';
import { Sofa, Palette, Volume2, Snowflake, Shield, Gauge, Sparkles, Armchair, Eye, Box, Sliders } from 'lucide-react';
import { useDesign } from '../state/DesignContext';
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from './ui/Controls';
import { SEAT_TYPES, SEAT_MATERIALS, DASHBOARD_MATERIALS, STEERING_WHEEL_TYPES, STEERING_MATERIALS, PEDAL_SETS, SHIFT_KNOBS, ROLL_CAGES } from '../sim/constants';
import { RealisticDashboardPreview } from './ui/RealisticDashboardPreview';
import { Interior3DViewport } from './interior/Interior3DViewport';
import { InteriorStudioWorkbench } from './interior/InteriorStudioWorkbench';
import { ModularInteriorStudio } from './interior/ModularInteriorStudio';
import { MasterInteriorConfiguration } from '../exterior3d/types/interiorStudioTypes';
import { COCKPIT_THEME_PRESETS } from '../exterior3d/manifests/interiorStudioCatalog';

export function InteriorsDesigner() {
  const { design, sim, updateInterior } = useDesign();
  const i = design.vehicle.interior;
  const chassis = design.vehicle.chassis;

  const [viewMode, setViewMode] = useState<'modular_studio' | '3d_studio' | '2d_classic'>('modular_studio');

  // Convert current DesignContext state into a MasterInteriorConfiguration object
  const [studioConfig, setStudioConfig] = useState<MasterInteriorConfiguration>(() => {
    const base = COCKPIT_THEME_PRESETS.THEME_MIDNIGHT_STEALTH.config;
    return {
      dashboardId: 'DASH_HYPER_GLASS_03',
      dashboardClass: 'hyper_minimalist_glass',
      steeringWheelId: 'STEER_FLAT_BOTTOM',
      steeringTypology: 'flat_bottom_sport',
      frontSeatsId: 'SEAT_SPORT_RECARO',
      seatingClass: 'sport_bolstered_recaro',
      seatCount: (i.seatCount as 1 | 2 | 4 | 5) || 2,
      harnessType: i.racingHarness ? 'sabelt_6_point_f1' : 'standard_3_point',
      centerConsoleId: 'CONSOLE_ROTARY_CRYSTAL',
      centerConsoleStyle: 'crystal_rotary_dial',
      digitalCockpit: {
        layoutType: 'pillar_to_pillar_hyperscreen',
        uiTheme: 'cyberpunk_neon_cyan',
        virtualClusterSizeInches: 12.3,
        infotainmentSizeInches: Math.max(10, i.infotainmentSize || 14.5),
        passengerScreenSizeInches: 12.3,
        hasHolographicHUD: true,
        hudProjectionDistanceM: 2.5,
        hudFieldOfViewDeg: 12.0,
        touchscreenHapticFeedback: true,
        glassAntiReflectiveCoating: true,
        ambientLightSync: true,
      },
      materials: {
        primaryUpholstery: i.seatMaterial === 'alcantara' ? 'alcantara_suede' : 'nappa_leather',
        secondaryUpholstery: 'nappa_leather',
        primaryColorHex: i.interiorColor || '#12151c',
        secondaryColorHex: '#1e2430',
        stitchingPattern: 'diamond_quilted',
        stitchingColorHex: i.accentColor || '#00f0ff',
        trimAccents: i.dashboardMaterial === 'carbon_fiber' ? 'twill_gloss_carbon' : i.dashboardMaterial === 'wood' ? 'open_pore_walnut' : 'satin_brushed_aluminum',
        seatBeltColorHex: i.accentColor || '#00f0ff',
        carpetColorHex: '#0a0d13',
        headlinerMaterial: 'starlight_fiber_optic',
        headlinerColorHex: '#080a0f',
      },
      ambientLighting: {
        enabled: (i.ambientLighting ?? 0.8) > 0.05,
        brightnessPercent: Math.round((i.ambientLighting ?? 0.8) * 100),
        primaryColorHex: i.accentColor || '#00f0ff',
        secondaryColorHex: '#3b82f6',
        colorMode: 'dual_zone_gradient',
        activeZones: ['dashboard_contour', 'center_console_halo', 'door_spear_accents', 'footwell_mood', 'speaker_grille_halo'],
        fiberOpticDiffuserDiffusion: 0.8,
      },
      audioSystemId: i.hasPremiumAudio ? 'AUDIO_SPATIAL_24' : 'AUDIO_BASE_8',
      rollCage: {
        type: i.rollCage === 'full' ? 'full_6_point_bolt_in' : i.rollCage === 'half' ? 'rear_4_point_half_cage' : 'none',
        tubeDiameterMm: 45,
        tubeMaterial: 'chromoly_4130',
        massKg: i.rollCage === 'full' ? 38 : i.rollCage === 'half' ? 18 : 0,
        torsionalStiffnessBoostPercent: i.rollCage === 'full' ? 24 : 10,
        colorHex: '#94a3b8',
      },
      soundDeadeningLevel: i.soundDeadening ?? 0.7,
      hasClimateDualZone: i.climateControl ?? true,
      hasFragranceDiffuser: true,
      hasWirelessPhoneChargers: true,
    };
  });

  // Synchronize updates between studio config and DesignContext
  const handleStudioConfigChange = (updated: MasterInteriorConfiguration) => {
    setStudioConfig(updated);

    // Sync back key parameters into DesignContext
    updateInterior({
      interiorColor: updated.materials.primaryColorHex,
      accentColor: updated.materials.stitchingColorHex,
      ambientLighting: updated.ambientLighting.enabled ? updated.ambientLighting.brightnessPercent / 100 : 0,
      seatCount: updated.seatCount,
      soundDeadening: updated.soundDeadeningLevel,
      racingHarness: updated.harnessType === 'sabelt_6_point_f1' || updated.harnessType === 'schroth_enduro_pro',
      hasPremiumAudio: updated.audioSystemId === 'AUDIO_SPATIAL_24' || updated.audioSystemId === 'AUDIO_AUDIOPHILE_32',
    });
  };

  const chassisEng = design.vehicle.chassisEng;
  const wbMm = chassisEng?.wheelbase || 2850;
  const trMm = chassisEng?.trackWidthFront || 1620;

  return (
    <div className="space-y-4">
      {/* ── TOP SWITCHER: 3D PHOTOREALISTIC STUDIO vs 2D CONTROLS ── */}
      <div className="flex items-center justify-between p-2 rounded-2xl backdrop-blur-xl shadow-xl" style={{backgroundColor: 'rgba(255,248,235,0.85)', border: '1px solid rgba(217,166,78,0.4)'}}>
        <div className="flex items-center gap-2 pl-2">
          <Sparkles style={{color: '#92400E'}} size={18} />
          <span className="text-xs font-black tracking-wider uppercase" style={{color: '#92400E'}}>
            Automotive Cockpit & Interior Engineering
          </span>
        </div>
        {/* Studio Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)'}}>
          <button
            onClick={() => setViewMode('modular_studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'modular_studio'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            <Sparkles size={14} />
            Modular 3D Studio
          </button>

          <button
            onClick={() => setViewMode('3d_studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d_studio'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-600 hover:text-amber-900'
            }`}
          >
            <Box size={14} />
            3D Cockpit
          </button>

          <button
            onClick={() => setViewMode('2d_classic')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '2d_classic'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-600 hover:text-amber-900'
            }`}
          >
            <Sliders size={14} />
            2D Classic Schematic
          </button>
        </div>
      </div>

      {/* ── MODULAR 3D INTERIOR STUDIO MODE ── */}
      {viewMode === 'modular_studio' && (
        <div className="animate-stage-transition-enter">
          <ModularInteriorStudio />
        </div>
      )}

      {/* ── 3D PHOTOREALISTIC COCKPIT STUDIO MODE ── */}
      {viewMode === '3d_studio' ? (
        <div className="space-y-4">
          {/* 3D WebGL Viewport with 6 Camera Presets */}
          <Interior3DViewport
            config={studioConfig}
            wheelbaseMm={wbMm}
            trackWidthMm={trMm}
          />

          {/* 5-Tab Glassmorphism Workbench */}
          <InteriorStudioWorkbench
            config={studioConfig}
            onChange={handleStudioConfigChange}
            wheelbaseMm={wbMm}
            trackWidthMm={trMm}
          />
        </div>
      ) : (
        /* ── 2D CLASSIC SCHEMATIC MODE ── */
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

            <Section title="Colors & Dashboard Preview" icon={<Palette size={16} />}>
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

              {/* Realistic 2D Dashboard Cross-Section Preview */}
              <div className="mt-4">
                <RealisticDashboardPreview interior={i} />
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

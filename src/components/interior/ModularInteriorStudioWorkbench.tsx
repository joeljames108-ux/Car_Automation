/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — 5-TAB LUXURY DESIGN WORKBENCH
 * ============================================================================
 * Precision parameter configuration deck with 3D physical material swatch wall:
 * - Tab 1: Seating & Layout (Comfort vs Sport vs FIA Carbon Buckets)
 * - Tab 2: Dashboard & Steering (Hyperscreen, OLED Cluster, GT3 Yoke)
 * - Tab 3: Center Console & Doors (Gated Manual, Sequential Tower, Pull Straps)
 * - Tab 4: Materials Swatch Wall & Contrast Stitching Studio
 * - Tab 5: Lighting, Audio & Roll Cage (Starlight Roof, 2100W Dolby, FIA Cage)
 * ============================================================================
 */

import React, { useState } from "react";
import {
  Armchair,
  Gauge,
  Compass,
  Sliders,
  Sparkles,
  Volume2,
  Shield,
  Palette,
  Check,
  Zap,
} from "lucide-react";
import {
  MasterModularInteriorState,
  FrontSeatTypology,
  RearSeatingTypology,
  DashboardTypology,
  InstrumentClusterStyle,
  SteeringWheelTypology,
  CenterConsoleTypology,
  InteriorMaterialType,
  AmbientLightingTheme,
  AudioSystemTier,
  RollCageOption,
} from "../../sim/interior/masterInteriorTypes";
import { MasterInteriorStateEngine } from "../../sim/interior/masterInteriorStateEngine";
import { LuxuryMaterialSwatchWall } from "./LuxuryMaterialSwatchWall";
import { BespokeInteriorCustomizer } from "./BespokeInteriorCustomizer";
import { AmbientLightingStudioPanel } from "./AmbientLightingStudioPanel";
import { CockpitHmiConfiguratorPanel } from "./CockpitHmiConfiguratorPanel";

export type InteriorWorkbenchTab = "seats" | "dash" | "console" | "materials" | "audio_safety" | "bespoke";

interface ModularInteriorStudioWorkbenchProps {
  state: MasterModularInteriorState;
  activeTab?: InteriorWorkbenchTab;
  onTabChange?: (tab: InteriorWorkbenchTab) => void;
}

export const ModularInteriorStudioWorkbench: React.FC<ModularInteriorStudioWorkbenchProps> = ({
  state,
  activeTab: externalTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<InteriorWorkbenchTab>("seats");
  const activeTab = externalTab || internalTab;
  const setActiveTab = (tab: InteriorWorkbenchTab) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const engine = MasterInteriorStateEngine.getInstance();

  return (
    <div className="flex flex-col h-full rounded-2xl bg-amber-50/80 border border-amber-300/60 backdrop-blur-xl shadow-xl overflow-hidden" style={{backgroundColor: 'rgba(255,248,235,0.80)', borderColor: 'rgba(217,166,78,0.45)'}}>
      {/* Decorative Top Accent Line */}
      <div className="w-full h-[2px]" style={{background: 'linear-gradient(to right, transparent, #D9A64E, transparent)'}} />
      {/* Tab Navigation Header */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b" style={{backgroundColor: 'rgba(255,248,235,0.6)', borderColor: 'rgba(217,166,78,0.25)'}}>
        {[
          { id: "seats", label: "SEATS", icon: Armchair, accent: "🪑" },
          { id: "dash", label: "DASH", icon: Gauge, accent: "⚡" },
          { id: "console", label: "CONSOLE", icon: Compass, accent: "⚙" },
          { id: "materials", label: "SWATCHES", icon: Palette, accent: "🎨" },
          { id: "bespoke", label: "BESPOKE", icon: Sparkles, accent: "✨" },
          { id: "audio_safety", label: "AUDIO", icon: Volume2, accent: "🔊" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InteriorWorkbenchTab)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                isActive
                  ? "bg-amber-500 text-white shadow-[0_0_12px_rgba(217,166,78,0.4)]"
                  : "bg-amber-100/60 text-amber-700 hover:text-amber-900 hover:bg-amber-200/50"
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
              {isActive && <span className="text-[8px] ml-0.5">✦</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Contents Deck */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-mono">
        {/* ── TAB 1: SEATING & CABIN LAYOUT ── */}
        {activeTab === "seats" && (
          <div className="space-y-4">
            <div>
              <label className="text-amber-800 font-bold mb-2 flex items-center gap-2"><span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span> <span>▌</span> FRONT SEATING ARCHITECTURE <span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "executive_22way_massage_ottoman", name: "22-Way Executive Massage Ottoman", mass: 62, cost: 14500, icon: "👑" },
                  { id: "sport_14way_adaptive_bolster", name: "14-Way Sport Adaptive Bolster", mass: 44, cost: 8200, icon: "⚡" },
                  { id: "carbon_monocoque_fixed_bucket", name: "Carbon Monocoque Fixed Bucket", mass: 22, cost: 11000, icon: "🏎" },
                  { id: "fia_homologated_racing_bucket", name: "FIA GT3 Homologated Race Bucket", mass: 14.5, cost: 8500, icon: "🏁" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => engine.updateSeating({ frontSeatType: s.id as FrontSeatTypology, frontSeatsMassKgTotal: s.mass, costUSD: s.cost })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      state.seating.frontSeatType === s.id
                        ? "border-amber-400 text-amber-800 shadow-md"
                        : "bg-white/50 border-amber-200/60 text-amber-900 hover:border-amber-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">{'icon' in s && <span className="text-[10px]">{(s as any).icon}</span>} {s.name}</div>
                    <div className="text-[10px] text-amber-600 mt-1">{s.mass} kg • ${s.cost.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>              <label className="text-amber-800 font-bold mb-2 flex items-center gap-2"><span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span> <span>▌</span> REAR CABIN CONFIGURATION <span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "standard_3passenger_bench", name: "Standard 3-Passenger Bench", mass: 38, icon: "🪑" },
                  { id: "executive_2passenger_lounge", name: "Executive 2-Passenger Lounge", mass: 48, icon: "🛋" },
                  { id: "rear_seat_delete_carpeted", name: "Rear Seat Delete (Carpeted)", mass: 0, icon: "🪶" },
                  { id: "rear_seat_delete_roll_cage_x_brace", name: "Rear Seat Delete (Roll Cage X-Brace)", mass: 0, icon: "⚙" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => engine.updateSeating({ rearSeatType: r.id as RearSeatingTypology, rearSeatsMassKgTotal: r.mass })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      state.seating.rearSeatType === r.id
                        ? "bg-amber-200/60 border-amber-400 text-amber-800 shadow-md"
                        : "bg-white/50 border-amber-200/60 text-amber-900 hover:border-amber-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">{'icon' in r && <span className="text-[10px]">{(r as any).icon}</span>} {r.name}</div>
                    <div className="text-[10px] text-amber-600 mt-1">Mass: {r.mass} kg</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seat Comfort & Track Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t" style={{borderColor: 'rgba(217,166,78,0.25)'}}>
              {[
                { key: "hasSeatHeating", label: "♨ Heated Seats", emoji: "♨" },
                { key: "hasSeatVentilation", label: "❄ Cooled Seats", emoji: "❄" },
                { key: "hasPneumaticMassage", label: "✋ Massage", emoji: "✋" },
                { key: "has6PointRacingHarness", label: "🏎 6-Point Harness", emoji: "🏎" },
              ].map((tog) => (
                <button
                  key={tog.key}
                  onClick={() => engine.updateSeating({ [tog.key]: !(state.seating as any)[tog.key] })}                    className={`p-2 rounded-xl text-center border font-bold ${
                    (state.seating as any)[tog.key]
                      ? "bg-amber-200/60 border-amber-400 text-amber-800"
                      : "bg-white/50 border-amber-200/60 text-amber-600 hover:border-amber-300"
                  }`}
                >
                  {tog.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: DASHBOARD & STEERING ── */}
        {activeTab === "dash" && (
          <div className="space-y-4">
            <CockpitHmiConfiguratorPanel state={state} />

            <div>
              <label className="text-amber-800 font-bold mb-2 flex items-center gap-2"><span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span> <span>▌</span> DASHBOARD ARCHITECTURE <span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "executive_dual_tier_leather", name: "Executive Dual-Tier Leather", mass: 28.5, cost: 7200, icon: "👔" },
                  { id: "gt3_competition_dry_carbon", name: "GT3 Competition Dry Carbon", mass: 9.2, cost: 6400, icon: "Carbon" },
                  { id: "pillar_to_pillar_hyperscreen_blade", name: "Pillar-to-Pillar Hyperscreen Blade", mass: 16.5, cost: 9200, icon: "📺" },
                  { id: "classic_heritage_brushed_chrome", name: "Classic Heritage Brushed Chrome", mass: 24.0, cost: 5800, icon: "🏛" },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => engine.updateDashboard({ typology: d.id as DashboardTypology, massKg: d.mass, costUSD: d.cost })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      state.dashboard.typology === d.id
                        ? "border-amber-400 text-amber-800 shadow-md"
                        : "bg-white/50 border-amber-200/60 text-amber-900 hover:border-amber-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">{'icon' in d && <span className="text-[10px]">{(d as any).icon}</span>} {d.name}</div>
                    <div className="text-[10px] text-amber-600 mt-1">{d.mass} kg • ${d.cost.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-amber-800 font-bold mb-2 flex items-center gap-2"><span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span> <span>▌</span> STEERING WHEEL TYPOLOGY <span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "formula_gt3_carbon_yoke", name: "Formula GT3 Carbon Yoke", mass: 1.8, cost: 3800, icon: "🎯" },
                  { id: "flat_bottom_alcantara_sport", name: "Flat-Bottom Alcantara Sport", mass: 3.4, cost: 2200, icon: "🔘" },
                  { id: "cyber_steer_retractable_yoke", name: "Cyber-Steer Retractable", mass: 3.2, cost: 4600, icon: "🤖" },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => engine.updateSteering({ typology: w.id as SteeringWheelTypology, massKg: w.mass, costUSD: w.cost })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      state.steering.typology === w.id
                        ? "border-amber-400 text-amber-800 shadow-md"
                        : "bg-white/50 border-amber-200/60 text-amber-900 hover:border-amber-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">{'icon' in w && <span className="text-[10px]">{(w as any).icon}</span>} {w.name}</div>
                    <div className="text-[10px] text-amber-600 mt-1">{w.mass} kg • ${w.cost.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display & HUD Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{borderColor: 'rgba(217,166,78,0.25)'}}>
              <button
                onClick={() => engine.updateDashboard({ hasWindshieldHolographicHUD: !state.dashboard.hasWindshieldHolographicHUD })}
                className={`p-2 rounded-xl text-center border font-bold ${
                  state.dashboard.hasWindshieldHolographicHUD
                    ? "bg-amber-200/60 border-amber-400 text-amber-800"
                    : "bg-white/50 border-amber-200/60 text-amber-600"
                }`}
              >
                <span className="text-[10px]">🏹</span> Holographic HUD Projector
              </button>
              <button
                onClick={() => engine.updateDashboard({ hasPassengerCoPilotDisplay: !state.dashboard.hasPassengerCoPilotDisplay })}
                className={`p-2 rounded-xl text-center border font-bold ${
                  state.dashboard.hasPassengerCoPilotDisplay
                    ? "bg-amber-200/60 border-amber-400 text-amber-800"
                    : "bg-white/50 border-amber-200/60 text-amber-600"
                }`}
              >
                <span className="text-[10px]">📺</span> Passenger Co-Pilot Display
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: CENTER CONSOLE & DOORS ── */}
        {activeTab === "console" && (
          <div className="space-y-4">
            <div>
              <label className="text-amber-800 font-bold mb-2 flex items-center gap-2"><span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span> <span>▌</span> CENTER CONSOLE & SHIFTER <span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "open_gated_manual_tunnel", name: "Open-Gated 6-Speed Manual", mass: 14.2, cost: 3200, icon: "⚙" },
                  { id: "sequential_dog_ring_tower", name: "Sequential Dog-Ring Race Shifter", mass: 5.4, cost: 4200, icon: "🏎" },
                  { id: "crystal_glass_monostable_rotary", name: "Crystal Glass Monostable Rotary", mass: 18.2, cost: 3600, icon: "💎" },
                  { id: "minimalist_ev_floating_bridge", name: "EV Floating Carbon Bridge", mass: 8.5, cost: 3800, icon: "⚡" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => engine.updateConsole({ typology: c.id as CenterConsoleTypology, massKg: c.mass, costUSD: c.cost })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      state.console.typology === c.id
                        ? "bg-amber-200/60 border-amber-400 text-amber-800 shadow-md"
                        : "bg-white/50 border-amber-200/60 text-amber-900 hover:border-amber-300"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5"><span className="text-[10px]">{(c as any).icon}</span> {c.name}</div>
                    <div className="text-[10px] text-amber-600 mt-1">{c.mass} kg • ${c.cost.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-amber-800 font-bold mb-2 flex items-center gap-2"><span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span> <span>▌</span> DOOR RELEASE MECHANISM <span style={{color: '#D9A64E', fontSize: '10px'}}>◆</span></label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "polished_aluminum_handle", label: "🔩 Billet Aluminum Handle" },
                  { id: "nylon_pull_strap_race", label: "🪢 Nylon Race Pull Strap (-8kg)" },
                  { id: "electronic_push_button", label: "🔘 Electronic Push Button" },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => engine.updateDoors({ doorReleaseType: d.id as any })}
                    className={`p-2 rounded-xl text-center border font-bold text-[11px] ${
                      state.doors.doorReleaseType === d.id
                        ? "bg-amber-200/60 border-amber-400 text-amber-800"
                        : "bg-white/50 border-amber-200/60 text-amber-600 hover:border-amber-300"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: LUXURY MATERIAL SWATCH WALL ── */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            <LuxuryMaterialSwatchWall
              selectedMaterial={state.materials.seatPrimaryMaterial}
              selectedStitchColorHex={state.materials.seatStitchingColorHex}
              onSelectMaterial={(mat) =>
                engine.updateMaterials({
                  seatPrimaryMaterial: mat,
                  dashboardTrimInsert: mat === "open_pore_walnut" ? "open_pore_walnut" : state.materials.dashboardTrimInsert,
                })
              }
              onSelectStitchColor={(hex) => engine.updateMaterials({ seatStitchingColorHex: hex })}
            />

            <div>
              <label              className="text-amber-800 font-bold mb-2 block">DASHBOARD & CONSOLE TRIM INSERTS</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "open_pore_walnut", label: "Open-Pore Walnut" },
                  { id: "3k_twill_carbon_fiber", label: "3K Carbon" },
                  { id: "brushed_billet_aluminum", label: "Brushed Aluminum" },
                  { id: "titanium_satin_finish", label: "Titanium Satin" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => engine.updateMaterials({ dashboardTrimInsert: t.id as InteriorMaterialType })}
                    className={`p-2 rounded-xl text-center border font-bold ${
                      state.materials.dashboardTrimInsert === t.id
                        ? "bg-amber-950/50 border-amber-400 text-amber-300"
                        : "bg-amber-900/40 border-amber-800/30 text-amber-200/60 hover:border-amber-700/30"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: AUDIO, LIGHTING & ROLL CAGE ── */}
        {activeTab === "audio_safety" && (
          <div className="space-y-4">
            <AmbientLightingStudioPanel state={state} />

            <div>
              <label              className="text-amber-800 font-bold mb-2 block">ACOUSTIC AUDIO SYSTEM</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "bespoke_24_speaker_diamond_2100w", name: "Bespoke Diamond 24-Speaker 2100W", mass: 18.5, cost: 9500 },
                  { id: "spatial_18_speaker_dolby_atmos", name: "Spatial Dolby Atmos 18-Speaker", mass: 11.2, cost: 6200 },
                  { id: "premium_12_speaker_surround", name: "Premium Surround 12-Speaker", mass: 7.5, cost: 2800 },
                  { id: "audio_delete_track_spec", name: "Audio Delete (Track Lightening)", mass: 0, cost: 0 },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => engine.updateAudio({ tier: a.id as AudioSystemTier, massKg: a.mass, costUSD: a.cost })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      state.audio.tier === a.id
                        ? "bg-amber-200/60 border-amber-400 text-amber-800 shadow-md"
                        : "bg-white/50 border-amber-200/60 text-amber-900 hover:border-amber-300"
                    }`}
                  >
                    <div className="font-bold">{a.name}</div>
                    <div className="text-[10px] text-amber-200/60 mt-1">{a.mass} kg • ${a.cost.toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label              className="text-amber-800 font-bold mb-2 block">CHASSIS ROLL CAGE REINFORCEMENT</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "none_standard_chassis", name: "None (Standard Monocoque)", mass: 0 },
                  { id: "clubsport_4_point_half_cage", name: "Clubsport 4-Point Half Cage", mass: 22 },
                  { id: "fia_gt3_6_point_welded_cage", name: "FIA GT3 6-Point Welded Cage", mass: 34 },
                  { id: "full_chromoly_spaceframe_reinforcement", name: "Full Chromoly Spaceframe", mass: 46 },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => engine.updateSafety({ rollCage: c.id as RollCageOption, massKg: c.mass })}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      state.safety.rollCage === c.id
                        ? "bg-amber-200/60 border-amber-400 text-amber-800 shadow-md"
                        : "bg-white/50 border-amber-200/60 text-amber-900 hover:border-amber-300"
                    }`}
                  >
                    <div className="font-bold">{c.name}</div>
                    <div className="text-[10px] text-amber-200/60 mt-1">Mass: +{c.mass} kg</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Starlight Roof Toggle */}
            <div className="pt-2 border-t border-amber-800/30">
              <button
                onClick={() =>
                  engine.updateLighting({
                    illuminatedZones: {
                      ...state.lighting.illuminatedZones,
                      starlightRoofHeadliner: !state.lighting.illuminatedZones.starlightRoofHeadliner,
                    },
                  })
                }
                className={`w-full p-2.5 rounded-xl text-center border font-bold ${
                  state.lighting.illuminatedZones.starlightRoofHeadliner
                    ? "bg-amber-200/60 border-amber-400 text-amber-800"
                    : "bg-white/50 border-amber-200/60 text-amber-600"
                }`}
              >
                ✨ Starlight Optical Fiber Headliner Roof
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 6: BESPOKE APPOINTMENTS & SOUND ── */}
        {activeTab === "bespoke" && (
          <BespokeInteriorCustomizer state={state} />
        )}
      </div>
    </div>
  );
};

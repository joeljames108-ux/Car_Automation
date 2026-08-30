// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — WORKBENCH & CONFIGURATOR COMPONENT
// ============================================================================
// 5-Tab Glassmorphism control panel with live synchronization:
// 1. Cockpit & Materials (Dashboards, Steering Wheels, Consoles, Leathers, Carbon, Woods)
// 2. Digital Displays & HMI Studio (Hyperscreen, Clusters, Holographic HUD, Themes)
// 3. Seating & Harness Lab (Carbon Buckets, 6-Point Sabelt Harnesses, VIP Ottomans)
// 4. Sound Stage & Ambient RGB (24-Speaker Dolby Atmos, 8 Ambient Zones, Hex Pickers)
// 5. Ergonomics & NVH Telemetry HUD (H-Point, Clearances, 120 km/h dB(A), Luxury Score)
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  MasterInteriorConfiguration,
  DashboardArchitectureClass,
  SteeringWheelTypology,
  SeatingArchitectureClass,
  CenterConsoleStyle,
  DisplayLayoutType,
  HmiUiTheme,
  UpholsteryMaterialType,
  StitchingPattern,
  TrimAccentsMaterial,
  AudioSystemClass,
  RacingHarnessType,
  AmbientLightingZone,
} from '../../exterior3d/types/interiorStudioTypes';
import {
  DASHBOARD_CATALOG,
  STEERING_WHEEL_CATALOG,
  SEATING_CATALOG,
  CENTER_CONSOLE_CATALOG,
  AUDIO_SYSTEM_CATALOG,
  COCKPIT_THEME_PRESETS,
} from '../../exterior3d/manifests/interiorStudioCatalog';
import { InteriorErgonomicsSolver } from '../../sim/interior/interiorErgonomicsSolver';
import {
  Palette,
  Armchair,
  Gauge,
  Volume2,
  Activity,
  Sparkles,
  Shield,
  Layers,
  Zap,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface InteriorStudioWorkbenchProps {
  config: MasterInteriorConfiguration;
  onChange: (updated: MasterInteriorConfiguration) => void;
  wheelbaseMm?: number;
  trackWidthMm?: number;
  roofHeightMm?: number;
}

export const InteriorStudioWorkbench: React.FC<InteriorStudioWorkbenchProps> = ({
  config,
  onChange,
  wheelbaseMm = 2850,
  trackWidthMm = 1620,
  roofHeightMm = 1380,
}) => {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'hmi' | 'seating' | 'sound_ambient' | 'telemetry'>('cockpit');

  // Compute live ergonomics and NVH telemetry
  const telemetry = useMemo(() => {
    return InteriorErgonomicsSolver.solveErgonomics(config, wheelbaseMm, trackWidthMm, roofHeightMm);
  }, [config, wheelbaseMm, trackWidthMm, roofHeightMm]);

  // Apply a curated preset theme
  const applyPreset = (presetKey: string) => {
    const preset = COCKPIT_THEME_PRESETS[presetKey];
    if (preset && preset.config) {
      onChange({
        ...config,
        ...preset.config,
        materials: {
          ...config.materials,
          ...(preset.config.materials || {}),
        },
        ambientLighting: {
          ...config.ambientLighting,
          ...(preset.config.ambientLighting || {}),
        },
        digitalCockpit: {
          ...config.digitalCockpit,
          ...(preset.config.digitalCockpit || {}),
        },
      });
    }
  };

  return (
    <div className="rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-4" style={{background: 'linear-gradient(to bottom, rgba(255,248,235,0.95), rgba(255,248,235,0.85))', border: '1px solid rgba(217,166,78,0.4)'}}>
      {/* Decorative Top Accent Line */}
      <div className="w-full h-[2px]" style={{background: 'linear-gradient(to right, transparent, #D9A64E, transparent)'}} />
      {/* ── 1. HEADER & PRESET THEMES BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3" style={{borderBottom: '1px solid rgba(217,166,78,0.25)'}}>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles style={{color: '#92400E'}} size={20} />
            <h2 className="text-lg font-black tracking-wide" style={{color: '#92400E'}}>
              ✦ ULTRA-FIDELITY 3D INTERIOR & COCKPIT STUDIO ✦
            </h2>
          </div>
          <p className="text-xs mt-0.5" style={{color: '#92400E', opacity: 0.7}}>
            Procedural automotive cabin styling, PBR upholstery textures, live digital HMI displays & ergonomics
          </p>
        </div>

        {/* Quick Theme Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {Object.entries(COCKPIT_THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 whitespace-nowrap" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#92400E'}}
            >
              <span>⚡</span>
              {preset.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. NAVIGATION TABS ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl overflow-x-auto" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.3)'}}>
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'cockpit'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
          }`}
        >
          <Layers size={14} />
          <span>✦</span> Cockpit & Materials
        </button>

        <button
          onClick={() => setActiveTab('hmi')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'hmi'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
          }`}
        >
          <Gauge size={14} />
          <span>⚡</span> Displays & HMI Studio
        </button>

        <button
          onClick={() => setActiveTab('seating')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'seating'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
          }`}
        >
          <Armchair size={14} />
          <span>🪑</span> Seating & Harness Lab
        </button>

        <button
          onClick={() => setActiveTab('sound_ambient')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sound_ambient'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
          }`}
        >
          <Volume2 size={14} />
          <span>🔊</span> Audio & Ambient RGB
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
          }`}
        >
          <Activity size={14} />
          <span>📊</span> Ergonomics & NVH HUD
        </button>
      </div>

      {/* ── 3. TAB 1: COCKPIT & MATERIALS ── */}
      {activeTab === 'cockpit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Dashboard Architecture */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between" style={{color: '#92400E'}}>
              <span>◆ Dashboard Architecture</span>
              <span className="font-mono" style={{color: '#78716C'}}>{DASHBOARD_CATALOG[config.dashboardId]?.massKg} kg</span>
            </label>
            <select
              value={config.dashboardId}
              onChange={(e) => {
                const spec = DASHBOARD_CATALOG[e.target.value];
                onChange({
                  ...config,
                  dashboardId: e.target.value,
                  dashboardClass: spec.architectureClass,
                });
              }}
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              {Object.values(DASHBOARD_CATALOG).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (${d.costUSD})
                </option>
              ))}
            </select>
            <p className="text-[11px] line-clamp-2" style={{color: '#78716C'}}>
              {DASHBOARD_CATALOG[config.dashboardId]?.description}
            </p>
          </div>

          {/* Steering Wheel Typology */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between" style={{color: '#92400E'}}>
              <span>◆ Steering Wheel & Controls</span>
              <span className="font-mono" style={{color: '#78716C'}}>{STEERING_WHEEL_CATALOG[config.steeringWheelId]?.diameterMm} mm</span>
            </label>
            <select
              value={config.steeringWheelId}
              onChange={(e) => {
                const spec = STEERING_WHEEL_CATALOG[e.target.value];
                onChange({
                  ...config,
                  steeringWheelId: e.target.value,
                  steeringTypology: spec.typology,
                });
              }}
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              {Object.values(STEERING_WHEEL_CATALOG).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (${w.costUSD})
                </option>
              ))}
            </select>
            <p className="text-[11px] line-clamp-2" style={{color: '#78716C'}}>
              {STEERING_WHEEL_CATALOG[config.steeringWheelId]?.description}
            </p>
          </div>

          {/* Center Console Style */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between" style={{color: '#92400E'}}>
              <span>◆ Center Console & Shifter</span>
              <span className="font-mono" style={{color: '#78716C'}}>{CENTER_CONSOLE_CATALOG[config.centerConsoleId]?.massKg} kg</span>
            </label>
            <select
              value={config.centerConsoleId}
              onChange={(e) => {
                const spec = CENTER_CONSOLE_CATALOG[e.target.value];
                onChange({
                  ...config,
                  centerConsoleId: e.target.value,
                  centerConsoleStyle: spec.style,
                });
              }}
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              {Object.values(CENTER_CONSOLE_CATALOG).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (${c.costUSD})
                </option>
              ))}
            </select>
            <p className="text-[11px] line-clamp-2" style={{color: '#78716C'}}>
              {CENTER_CONSOLE_CATALOG[config.centerConsoleId]?.description}
            </p>
          </div>

          {/* ◆ Primary Upholstery Material */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              ◆ Primary Upholstery
            </label>
            <select
              value={config.materials.primaryUpholstery}
              onChange={(e) =>
                onChange({
                  ...config,
                  materials: {
                    ...config.materials,
                    primaryUpholstery: e.target.value as UpholsteryMaterialType,
                  },
                })
              }
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              <option value="nappa_leather">Nappa Full-Grain Leather</option>
              <option value="semi_aniline_leather">Semi-Aniline Luxury Leather</option>
              <option value="alcantara_suede">Alcantara Track Suede</option>
              <option value="perforated_sport_leather">Perforated Cooling Sport Leather</option>
              <option value="wool_heritage_tartan">Heritage Woven Tartan Textile</option>
              <option value="vegan_bamboo_silk">Vegan Bamboo Silk Bio-Leather</option>
              <option value="matte_dry_carbon">Matte Pre-Preg Dry Carbon</option>
            </select>

            <div className="flex items-center gap-2 pt-1">
              <label className="text-[11px]" style={{color: '#78716C'}}>Primary Color:</label>
              <input
                type="color"
                value={config.materials.primaryColorHex}
                onChange={(e) =>
                  onChange({
                    ...config,
                    materials: { ...config.materials, primaryColorHex: e.target.value },
                  })
                }
                className="w-7 h-7 rounded-lg bg-transparent border border-white/20 cursor-pointer"
              />
              <span className="font-mono text-xs" style={{color: '#451A03'}}>{config.materials.primaryColorHex}</span>
            </div>
          </div>

          {/* Secondary Contrast Upholstery & Stitching */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              ◆ Stitching Pattern & Contrast
            </label>
            <select
              value={config.materials.stitchingPattern}
              onChange={(e) =>
                onChange({
                  ...config,
                  materials: {
                    ...config.materials,
                    stitchingPattern: e.target.value as StitchingPattern,
                  },
                })
              }
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              <option value="single_french_seam">Single French Seam</option>
              <option value="double_contrast_stitch">Double Contrast Stitch</option>
              <option value="diamond_quilted">Diamond-Quilted Pleats</option>
              <option value="hexagonal_honeycomb">Hexagonal Honeycomb Quilt</option>
              <option value="piped_edge_accent">Piped Contrast Edge</option>
            </select>

            <div className="flex items-center gap-2 pt-1">
              <label className="text-[11px]" style={{color: '#78716C'}}>Stitch Color:</label>
              <input
                type="color"
                value={config.materials.stitchingColorHex}
                onChange={(e) =>
                  onChange({
                    ...config,
                    materials: { ...config.materials, stitchingColorHex: e.target.value },
                  })
                }
                className="w-7 h-7 rounded-lg bg-transparent border border-white/20 cursor-pointer"
              />
              <span className="font-mono text-xs" style={{color: '#451A03'}}>{config.materials.stitchingColorHex}</span>
            </div>
          </div>

          {/* Trim Accents & Metallurgy */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              Trim Accents & Metallurgy
            </label>
            <select
              value={config.materials.trimAccents}
              onChange={(e) =>
                onChange({
                  ...config,
                  materials: {
                    ...config.materials,
                    trimAccents: e.target.value as TrimAccentsMaterial,
                  },
                })
              }
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              <option value="twill_gloss_carbon">Twill Gloss Carbon Fiber</option>
              <option value="forged_matte_carbon">Forged Matte Carbon Composite</option>
              <option value="open_pore_walnut">Open-Pore Natural Walnut</option>
              <option value="satin_brushed_aluminum">Satin Brushed Aluminum</option>
              <option value="anodized_dark_titanium">Anodized Dark Titanium</option>
              <option value="piano_black_lacquer">Piano Black Lacquer</option>
            </select>

            <div className="flex items-center gap-2 pt-1">
              <label className="text-[11px]" style={{color: '#78716C'}}>Seatbelt Color:</label>
              <input
                type="color"
                value={config.materials.seatBeltColorHex}
                onChange={(e) =>
                  onChange({
                    ...config,
                    materials: { ...config.materials, seatBeltColorHex: e.target.value },
                  })
                }
                className="w-7 h-7 rounded-lg bg-transparent border border-white/20 cursor-pointer"
              />
              <span className="font-mono text-xs" style={{color: '#451A03'}}>{config.materials.seatBeltColorHex}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. TAB 2: DIGITAL DISPLAYS & HMI STUDIO ── */}
      {activeTab === 'hmi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Display Layout */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              ◆ Display Architecture Layout
            </label>
            <select
              value={config.digitalCockpit.layoutType}
              onChange={(e) =>
                onChange({
                  ...config,
                  digitalCockpit: {
                    ...config.digitalCockpit,
                    layoutType: e.target.value as DisplayLayoutType,
                  },
                })
              }
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              <option value="pillar_to_pillar_hyperscreen">56" Pillar-to-Pillar Curved Hyperscreen</option>
              <option value="dual_screen_cockpit">Dual-Screen Virtual Cockpit (12.3" + 14.5")</option>
              <option value="driver_centric_track_cluster">Driver-Centric MoTeC Track Cluster (10.25")</option>
              <option value="classic_analog_hybrid">Classic Chrome Analog Dial Hybrid</option>
            </select>
          </div>

          {/* HMI Graphic Theme */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              ◆ HMI Telemetry UI Theme
            </label>
            <select
              value={config.digitalCockpit.uiTheme}
              onChange={(e) =>
                onChange({
                  ...config,
                  digitalCockpit: {
                    ...config.digitalCockpit,
                    uiTheme: e.target.value as HmiUiTheme,
                  },
                })
              }
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              <option value="cyberpunk_neon_cyan">Cyberpunk Neon Cyan & Magenta</option>
              <option value="motorsport_track_telemetry">Motorsport High-Contrast Track Red</option>
              <option value="luxury_gold_elegance">Luxury Champagne Gold Serif</option>
              <option value="dark_stealth_minimal">Dark Stealth OLED Monochromatic</option>
              <option value="heritage_classic_analog">Heritage Classic Cream & Orange</option>
            </select>
          </div>

          {/* ◆ Holographic Windshield HUD */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
                ◆ Holographic Windshield HUD
              </label>
              <input
                type="checkbox"
                checked={config.digitalCockpit.hasHolographicHUD}
                onChange={(e) =>
                  onChange({
                    ...config,
                    digitalCockpit: {
                      ...config.digitalCockpit,
                      hasHolographicHUD: e.target.checked,
                    },
                  })
                }
                className="rounded accent-amber-500 w-4 h-4"
              />
            </div>
            <p className="text-[11px]" style={{color: '#78716C'}}>
              Projects collimated speed, shift light ribbons, and augmented turn-by-turn navigation onto the windshield glass.
            </p>
            {config.digitalCockpit.hasHolographicHUD && (
              <div className="flex items-center justify-between text-xs pt-1" style={{color: '#451A03'}}>
                <span>Projection Distance:</span>
                <span className="font-mono" style={{color: '#92400E'}}>{config.digitalCockpit.hudProjectionDistanceM} meters</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 5. TAB 3: SEATING & HARNESS LAB ── */}
      {activeTab === 'seating' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Seating Class */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              ◆ Seating Architecture
            </label>
            <select
              value={config.frontSeatsId}
              onChange={(e) => {
                const spec = SEATING_CATALOG[e.target.value];
                onChange({
                  ...config,
                  frontSeatsId: e.target.value,
                  seatingClass: spec.architectureClass,
                  harnessType: spec.harnessType,
                });
              }}
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              {Object.values(SEATING_CATALOG).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.lateralGSupportPercent}% G-Support)
                </option>
              ))}
            </select>
            <p className="text-[11px] line-clamp-2" style={{color: '#78716C'}}>
              {SEATING_CATALOG[config.frontSeatsId]?.description}
            </p>
          </div>

          {/* Seat Count */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              ◆ Cabin Seat Capacity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 4, 5] as const).map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => onChange({ ...config, seatCount: cnt })}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    config.seatCount === cnt
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-amber-100/50 text-amber-600 hover:text-amber-800 border border-amber-200/50'
                  }`}
                >
                  {cnt} {cnt === 1 ? 'Seat' : 'Seats'}
                </button>
              ))}
            </div>
            <p className="text-[11px]" style={{color: '#78716C'}}>
              {config.seatCount <= 2 ? '2-Seater Lightweight Berlinetta Layout' : '4/5-Seater Grand Tourer / VIP Executive Lounge'}
            </p>
          </div>

          {/* Racing Harness & Seat Belts */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              ◆ Harness & Seatbelt Spec
            </label>
            <select
              value={config.harnessType}
              onChange={(e) =>
                onChange({
                  ...config,
                  harnessType: e.target.value as RacingHarnessType,
                })
              }
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              <option value="standard_3_point">Standard 3-Point Inertia Reel Belts</option>
              <option value="clubman_4_point">Clubman 4-Point Trackday Harness</option>
              <option value="sabelt_6_point_f1">Sabelt 6-Point F1 Competition Harness with Cam-Lock</option>
              <option value="schroth_enduro_pro">Schroth Enduro Pro 6-Point Pull-Down Harness</option>
            </select>
          </div>
        </div>
      )}

      {/* ── 6. TAB 4: SOUND STAGE & AMBIENT RGB ── */}
      {activeTab === 'sound_ambient' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Audio System */}
          <div className="p-3 rounded-xl bg-amber-900/40 border border-white/10 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider flex items-center justify-between" style={{color: '#92400E'}}>
              <span>◆ Sound Stage System</span>
              <span className="font-mono" style={{color: '#78716C'}}>{AUDIO_SYSTEM_CATALOG[config.audioSystemId]?.speakerCount} Speakers</span>
            </label>
            <select
              value={config.audioSystemId}
              onChange={(e) => onChange({ ...config, audioSystemId: e.target.value })}
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              {Object.values(AUDIO_SYSTEM_CATALOG).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.totalAmplifierWattsRMS}W RMS)
                </option>
              ))}
            </select>
            <p className="text-[11px] line-clamp-2" style={{color: '#78716C'}}>
              {AUDIO_SYSTEM_CATALOG[config.audioSystemId]?.description}
            </p>
          </div>

          {/* Ambient RGB Master Controls */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
                ◆ Fiber-Optic Ambient Lighting
              </label>
              <input
                type="checkbox"
                checked={config.ambientLighting.enabled}
                onChange={(e) =>
                  onChange({
                    ...config,
                    ambientLighting: { ...config.ambientLighting, enabled: e.target.checked },
                  })
                }
                className="rounded accent-amber-500 w-4 h-4"
              />
            </div>

            {config.ambientLighting.enabled && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{color: '#78716C'}}>Primary Color:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.ambientLighting.primaryColorHex}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          ambientLighting: { ...config.ambientLighting, primaryColorHex: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded-lg bg-transparent border border-white/20 cursor-pointer"
                    />
                    <span className="font-mono text-xs" style={{color: '#92400E'}}>{config.ambientLighting.primaryColorHex}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{color: '#78716C'}}>Secondary Gradient:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.ambientLighting.secondaryColorHex}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          ambientLighting: { ...config.ambientLighting, secondaryColorHex: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded-lg bg-transparent border border-white/20 cursor-pointer"
                    />
                    <span className="font-mono text-xs" style={{color: '#92400E'}}>{config.ambientLighting.secondaryColorHex}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs" style={{color: '#78716C'}}>
                    <span>Brightness:</span>
                    <span className="font-mono" style={{color: '#92400E'}}>{config.ambientLighting.brightnessPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={config.ambientLighting.brightnessPercent}
                    onChange={(e) =>
                      onChange({
                        ...config,
                        ambientLighting: { ...config.ambientLighting, brightnessPercent: Number(e.target.value) },
                      })
                    }
                    className="w-full" style={{accentColor: '#D9A64E'}}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Roof Headliner & Starlight Ceiling */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
            <label className="text-xs font-bold uppercase tracking-wider" style={{color: '#92400E'}}>
              ◆ Roof & Headliner Architecture
            </label>
            <select
              value={config.materials.headlinerMaterial}
              onChange={(e) =>
                onChange({
                  ...config,
                  materials: {
                    ...config.materials,
                    headlinerMaterial: e.target.value as typeof config.materials.headlinerMaterial,
                  },
                })
              }
              className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
            >
              <option value="alcantara_suede">Alcantara Suede Headliner</option>
              <option value="starlight_fiber_optic">Starlight Fiber-Optic Constellation Ceiling</option>
              <option value="panoramic_electrochromic_glass">Panoramic Electrochromic Smart Glass Roof</option>
              <option value="woven_fabric">Woven Heritage Textile</option>
            </select>
          </div>
        </div>
      )}

      {/* ── 7. TAB 5: ERGONOMICS & NVH TELEMETRY HUD ── */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Tile 1: Driver H-Point & Clearances */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.25)'}}>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{color: '#92400E'}}>
              <Armchair size={14} />
              <span>SAE J826 Clearances</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Headroom:</span>
                <span className="font-bold" style={{color: '#451A03'}}>{telemetry.headroomClearanceMm} mm</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Legroom:</span>
                <span className="font-bold" style={{color: '#451A03'}}>{telemetry.legroomClearanceMm} mm</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Shoulder Room:</span>
                <span className="font-bold" style={{color: '#451A03'}}>{telemetry.shoulderRoomMm} mm</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>H-Point [X, Y, Z]:</span>
                <span style={{color: '#92400E'}}>[{telemetry.driverHPointMm.x}, {telemetry.driverHPointMm.y}, {telemetry.driverHPointMm.z}]</span>
              </div>
            </div>
          </div>

          {/* Tile 2: Visibility & Ingress Ease */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.25)'}}>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{color: '#92400E'}}>
              <Gauge size={14} />
              <span>Ergonomics & Vision</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Forward Vision Cone:</span>
                <span className="font-bold" style={{color: '#92400E'}}>{telemetry.visibilityForwardDeg}°</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Blindspot Angle:</span>
                <span className="font-bold" style={{color: '#92400E'}}>{telemetry.blindspotAngleDeg}°</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Driver Reach Score:</span>
                <span className="font-bold" style={{color: '#92400E'}}>{telemetry.driverReachScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Ingress / Egress:</span>
                <span className="font-bold" style={{color: '#92400E'}}>{telemetry.ingressEgressEaseScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Tile 3: Cabin Acoustic NVH Sound Level */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.25)'}}>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{color: '#92400E'}}>
              <Volume2 size={14} />
              <span>NVH & Acoustics</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Sound @ 120 km/h:</span>
                <span className="font-black text-sm" style={{color: '#92400E'}}>{telemetry.cabinDecibelAt120Kmh} dB(A)</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Acoustic Isolation:</span>
                <span className="font-bold" style={{color: '#92400E'}}>{telemetry.nvhIsolationIndex} / 100</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Luxury Perception:</span>
                <span className="font-bold" style={{color: '#92400E'}}>{telemetry.overallLuxuryScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Tile 4: Mass & BOM Cost */}
          <div className="p-3 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.25)'}}>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{color: '#92400E'}}>
              <Zap size={14} />
              <span>Interior BOM Specs</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Total Interior Mass:</span>
                <span className="font-black text-sm" style={{color: '#92400E'}}>{telemetry.totalInteriorMassKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Subsystem Cost:</span>
                <span className="font-black text-sm" style={{color: '#92400E'}}>${telemetry.totalInteriorCostUSD.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#78716C'}}>Chassis Roof H:</span>
                <span style={{color: '#451A03'}}>{roofHeightMm} mm</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

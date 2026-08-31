/**
 * ============================================================================
 * BESPOKE LUXURY AUTOMOTIVE INTERIOR STUDIO HUB & CAD INSPECTOR
 * ============================================================================
 * Master interactive engineering dashboard for bespoke vehicle cockpit design:
 * 1. PHOTOREALISTIC 3D CABIN VIEWPORT WITH FIRST-PERSON LOOK-AROUND
 * 2. LIVE PBR MATERIAL & TEXTURE CUSTOMIZER (Leather, Alcantara, Carbon, Wood)
 * 3. CABIN ACOUSTICS, NVH & ANC ACTIVE NOISE SIMULATOR
 * 4. SAE J1100 DRIVER ERGONOMICS & BIOMETRIC POSTURE SOLVER
 * 5. UNIVERSAL GLB ASSET EXPORTER & CAD SPECIFICATION EXPORT
 * ============================================================================
 */

import React, { useState, useMemo, memo } from "react";
import {
  Sliders,
  Palette,
  Volume2,
  Eye,
  Download,
  Sparkles,
  Shield,
  Activity,
  CheckCircle,
  RotateCcw,
  Compass,
  Cpu,
  Tv,
  Maximize2,
  Box,
  Zap,
} from "lucide-react";
import {
  MasterModularInteriorState,
  DashboardTypology,
  SteeringWheelTypology,
  FrontSeatTypology,
  CenterConsoleTypology,
  InteriorMaterialType,
} from "../../sim/interior/masterInteriorTypes";
import { MasterInteriorStateEngine } from "../../sim/interior/masterInteriorStateEngine";
import { ModularInterior3DStudioViewport } from "./ModularInterior3DStudioViewport";
import { InteriorAcousticThermalSimulator } from "../../sim/interior/interiorAcousticThermalSimulator";
import {
  InteriorErgonomicsBiometricsEngine,
  DriverPercentile,
} from "../../sim/interior/interiorErgonomicsBiometricsEngine";

export const DEFAULT_BESPOKE_STATE: MasterModularInteriorState = MasterInteriorStateEngine.getInstance().getState();

const DASHBOARD_OPTIONS: { id: DashboardTypology; name: string }[] = [
  { id: "gt3_competition_dry_carbon", name: "GT3 Competition Dry-Carbon Cockpit" },
  { id: "executive_dual_tier_leather", name: "Monolithic Executive Dual-Tier" },
  { id: "pillar_to_pillar_hyperscreen_blade", name: "Pillar-to-Pillar Hyperscreen Blade" },
  { id: "grand_tourer_handcrafted_cowl", name: "Grand Tourer Hand-Crafted Cowl" },
  { id: "classic_heritage_brushed_chrome", name: "Classic Heritage Brushed Chrome" },
];

const STEERING_OPTIONS: { id: SteeringWheelTypology; name: string }[] = [
  { id: "formula_gt3_carbon_yoke", name: "Formula & GT3 Competition Carbon Yoke" },
  { id: "flat_bottom_alcantara_sport", name: "Flat-Bottom Alcantara Sport Wheel" },
  { id: "classic_heritage_3spoke_polished", name: "Classic Heritage 3-Spoke Polished Rim" },
  { id: "executive_two_spoke_heated", name: "Executive Two-Spoke Heated Luxury Wheel" },
  { id: "pro_drift_deep_dish_suede", name: "Pro-Drift 90mm Deep Dish Suede Wheel" },
  { id: "cyber_steer_retractable_yoke", name: "Cyber-Steer Retractable Folding Yoke" },
];

const SEATING_OPTIONS: { id: FrontSeatTypology; name: string }[] = [
  { id: "fia_homologated_racing_bucket", name: "FIA Homologated Racing Bucket" },
  { id: "carbon_monocoque_fixed_bucket", name: "High-Modulus Carbon Monocoque Bucket" },
  { id: "sport_14way_adaptive_bolster", name: "14-Way Adaptive Bolstered Sport Seat" },
  { id: "executive_22way_massage_ottoman", name: "Executive 22-Way Pneumatic Massage Ottoman" },
  { id: "base_comfort_8way", name: "Base Comfort 8-Way Power Seat" },
];

const CONSOLE_OPTIONS: { id: CenterConsoleTypology; name: string }[] = [
  { id: "sequential_dog_ring_tower", name: "Sequential Dog-Ring Race Shifter Tower" },
  { id: "open_gated_manual_tunnel", name: "Open-Gated Manual Shifter Tunnel" },
  { id: "crystal_glass_monostable_rotary", name: "Crystal Glass Monostable Rotary Console" },
  { id: "fighter_jet_start_flap_matrix", name: "Fighter-Jet Start Flap & Toggle Matrix" },
  { id: "minimalist_ev_floating_bridge", name: "Minimalist EV Floating Bridge" },
  { id: "track_competition_fire_suppression", name: "Track Competition Fire Suppression Tower" },
];

export const BespokeLuxuryInteriorStudioHubComponent: React.FC = () => {
  const [interiorState, setInteriorState] = useState<MasterModularInteriorState>(DEFAULT_BESPOKE_STATE);
  const [activeTab, setActiveTab] = useState<"visualizer" | "materials" | "acoustics" | "ergonomics" | "cad">("visualizer");
  const [simRpm, setSimRpm] = useState<number>(4200);
  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState<number>(120);
  const [manikinPercentile, setManikinPercentile] = useState<DriverPercentile>("50th_male");
  const [seatForeAftMm, setSeatForeAftMm] = useState<number>(0);
  const [ancEnabled, setAncEnabled] = useState<boolean>(true);

  // Acoustic NVH Simulation Result
  const acousticResult = useMemo(() => {
    return InteriorAcousticThermalSimulator.simulateCabinAcoustics(
      interiorState,
      simRpm,
      vehicleSpeedKmh,
      ancEnabled
    );
  }, [interiorState, simRpm, vehicleSpeedKmh, ancEnabled]);

  // SAE J1100 Ergonomics Result
  const ergoResult = useMemo(() => {
    return InteriorErgonomicsBiometricsEngine.solveDriverErgonomics(
      interiorState,
      manikinPercentile,
      seatForeAftMm
    );
  }, [interiorState, manikinPercentile, seatForeAftMm]);

  return (
    <div className="w-full h-full flex flex-col space-y-6 text-slate-100 p-4 md:p-6 bg-amber-950">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-800/30">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles size={14} /> BESPOKE AUTOMOTIVE INTERIOR STUDIO
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {interiorState.name}
          </h1>
          <p className="text-xs text-amber-300/70 mt-1 max-w-2xl">
            Precision bespoke cabin engineering with active acoustics, thermal comfort, and SAE J1100 biometrics.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl backdrop-blur-xl bg-amber-950/80 border border-amber-800/30">
          {[
            { id: "visualizer" as const, label: "3D CAD Studio", icon: Box },
            { id: "materials" as const, label: "PBR Materials", icon: Palette },
            { id: "acoustics" as const, label: "NVH & Acoustics", icon: Volume2 },
            { id: "ergonomics" as const, label: "SAE Ergonomics", icon: Eye },
            { id: "cad" as const, label: "Spec & GLB", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-cyan-500/25"
                    : "text-amber-300/70 hover:text-amber-100 hover:bg-amber-900/40/50"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Work Area */}
      {activeTab === "visualizer" && (
        <div className="space-y-4">
          <ModularInterior3DStudioViewport state={interiorState} />

          {/* Quick Component Preset Switcher Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-amber-950/80/90 border border-amber-800/30 space-y-1.5">
              <label className="text-[10px] font-bold text-amber-300/70 uppercase">Dashboard Architecture</label>
              <select
                value={interiorState.dashboard.typology}
                onChange={(e) =>
                  setInteriorState({
                    ...interiorState,
                    dashboard: { ...interiorState.dashboard, typology: e.target.value as DashboardTypology },
                  })
                }
                className="w-full bg-amber-950 text-xs font-bold text-amber-300 p-2 rounded-xl border border-amber-800/30"
              >
                {DASHBOARD_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/80/90 border border-amber-800/30 space-y-1.5">
              <label className="text-[10px] font-bold text-amber-300/70 uppercase">Steering Wheel</label>
              <select
                value={interiorState.steering.typology}
                onChange={(e) =>
                  setInteriorState({
                    ...interiorState,
                    steering: { ...interiorState.steering, typology: e.target.value as SteeringWheelTypology },
                  })
                }
                className="w-full bg-amber-950 text-xs font-bold text-amber-300 p-2 rounded-xl border border-amber-800/30"
              >
                {STEERING_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/80/90 border border-amber-800/30 space-y-1.5">
              <label className="text-[10px] font-bold text-amber-300/70 uppercase">Seating Assembly</label>
              <select
                value={interiorState.seating.frontSeatType}
                onChange={(e) =>
                  setInteriorState({
                    ...interiorState,
                    seating: { ...interiorState.seating, frontSeatType: e.target.value as FrontSeatTypology },
                  })
                }
                className="w-full bg-amber-950 text-xs font-bold text-amber-300 p-2 rounded-xl border border-amber-800/30"
              >
                {SEATING_OPTIONS.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/80/90 border border-amber-800/30 space-y-1.5">
              <label className="text-[10px] font-bold text-amber-300/70 uppercase">Center Console</label>
              <select
                value={interiorState.console.typology}
                onChange={(e) =>
                  setInteriorState({
                    ...interiorState,
                    console: { ...interiorState.console, typology: e.target.value as CenterConsoleTypology },
                  })
                }
                className="w-full bg-amber-950 text-xs font-bold text-amber-300 p-2 rounded-xl border border-amber-800/30"
              >
                {CONSOLE_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Materials Customizer Tab */}
      {activeTab === "materials" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-3xl bg-amber-950/80/90 border border-amber-800/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Palette size={16} /> Upholstery & Leather Finish
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs text-amber-300/70">Primary Material</label>
              <select
                value={interiorState.materials.seatPrimaryMaterial}
                onChange={(e) =>
                  setInteriorState({
                    ...interiorState,
                    materials: { ...interiorState.materials, seatPrimaryMaterial: e.target.value as InteriorMaterialType },
                  })
                }
                className="w-full bg-amber-950 text-xs p-2.5 rounded-xl border border-amber-800/30 font-bold"
              >
                <option value="perforated_alcantara">Alcantara Synthetic Suede</option>
                <option value="nappa_leather">Full-Grain Nappa Leather</option>
                <option value="semi_aniline_leather">Semi-Aniline Luxury Leather</option>
                <option value="3k_twill_carbon_fiber">3K Carbon Fiber</option>
                <option value="forged_carbon_composite">Forged Carbon Composite</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-amber-300/70">Stitching Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={interiorState.materials.seatStitchingColorHex || "#fbbf24"}
                  onChange={(e) =>
                    setInteriorState({
                      ...interiorState,
                      materials: { ...interiorState.materials, seatStitchingColorHex: e.target.value },
                    })
                  }
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {interiorState.materials.seatStitchingColorHex || "#fbbf24"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-950/80/90 border border-amber-800/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} /> Stitching & Trim Accents
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-amber-300/70">Decorative Trim Insert</label>
              <select
                value={interiorState.materials.dashboardTrimInsert}
                onChange={(e) =>
                  setInteriorState({
                    ...interiorState,
                    materials: { ...interiorState.materials, dashboardTrimInsert: e.target.value as InteriorMaterialType },
                  })
                }
                className="w-full bg-amber-950 text-xs p-2.5 rounded-xl border border-amber-800/30 font-bold"
              >
                <option value="3k_twill_carbon_fiber">3K Twill Gloss Carbon Fiber</option>
                <option value="forged_carbon_composite">Forged Carbon Composite</option>
                <option value="open_pore_walnut">Open-Pore Walnut Veneer</option>
                <option value="brushed_billet_aluminum">Brushed Billet Aluminum</option>
                <option value="titanium_satin_finish">Satin Titanium Finish</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-950/80/90 border border-amber-800/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} /> Ambient Lighting & Starlight
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-200 font-bold">Starlight Roof Headliner</span>
              <input
                type="checkbox"
                checked={interiorState.lighting.illuminatedZones.starlightRoofHeadliner}
                onChange={(e) =>
                  setInteriorState({
                    ...interiorState,
                    lighting: {
                      ...interiorState.lighting,
                      illuminatedZones: {
                        ...interiorState.lighting.illuminatedZones,
                        starlightRoofHeadliner: e.target.checked,
                      },
                    },
                  })
                }
                className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* NVH & Acoustics Simulation Tab */}
      {activeTab === "acoustics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-amber-950/80/90 border border-amber-800/30 space-y-5">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Volume2 size={16} /> Real-Time Cabin NVH Simulation
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-amber-300/70">Engine RPM:</span>
                <span className="text-rose-400 font-bold">{simRpm} RPM</span>
              </div>
              <input
                type="range"
                min="800"
                max="9000"
                step="100"
                value={simRpm}
                onChange={(e) => setSimRpm(parseInt(e.target.value))}
                className="w-full h-1.5 accent-rose-400 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-xs">
                <span className="text-amber-300/70">Vehicle Speed:</span>
                <span className="text-amber-400 font-bold">{vehicleSpeedKmh} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="280"
                step="5"
                value={vehicleSpeedKmh}
                onChange={(e) => setVehicleSpeedKmh(parseInt(e.target.value))}
                className="w-full h-1.5 accent-amber-400 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950 border border-amber-800/30">
              <span className="text-xs font-bold text-amber-100">Active Noise Cancellation (ANC)</span>
              <button
                onClick={() => setAncEnabled(!ancEnabled)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  ancEnabled
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-amber-950/80 border-amber-700/30 text-amber-300/70"
                }`}
              >
                {ancEnabled ? "ACTIVE" : "BYPASSED"}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-amber-950/80/90 border border-amber-800/30 space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} /> Acoustic Telemetry Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-950 border border-amber-800/30">
                <div className="text-[10px] font-bold text-amber-300/70">DRIVER EAR SPL (dBA)</div>
                <div className="text-xl font-black text-amber-300 mt-1">{acousticResult.driverEarSplDba} dBA</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950 border border-amber-800/30">
                <div className="text-[10px] font-bold text-amber-300/70">REVERBERATION T60</div>
                <div className="text-xl font-black text-amber-300 mt-1">{acousticResult.reverberationTimeT60Sec}s</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950 border border-amber-800/30">
                <div className="text-[10px] font-bold text-amber-300/70">ANC ATTENUATION</div>
                <div className="text-xl font-black text-emerald-300 mt-1">-{acousticResult.ancAttenuationDb} dB</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950 border border-amber-800/30">
                <div className="text-[10px] font-bold text-amber-300/70">ZWICKER QUALITY</div>
                <div className="text-xl font-black text-amber-300 mt-1">{acousticResult.soundQualityScoreZwicker}/100</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ergonomics & Biometrics Tab */}
      {activeTab === "ergonomics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-amber-950/80/90 border border-amber-800/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Eye size={16} /> SAE J1100 Manikin Calibration
            </h3>

            <div className="space-y-2">
              <label className="text-xs text-amber-300/70">Driver Percentile Manikin</label>
              <div className="grid grid-cols-3 gap-2">
                {(["5th_female", "50th_male", "95th_male"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setManikinPercentile(p)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      manikinPercentile === p
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-amber-950 border-amber-800/30 text-amber-300/70"
                    }`}
                  >
                    {p.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-amber-300/70">Seat Fore / Aft Position:</span>
                <span className="text-amber-300 font-bold">{seatForeAftMm} mm</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                step="5"
                value={seatForeAftMm}
                onChange={(e) => setSeatForeAftMm(parseInt(e.target.value))}
                className="w-full h-1.5 accent-amber-400 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-amber-950/80/90 border border-amber-800/30 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Shield size={16} /> SAE Ergonomics Results
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-amber-950 border border-amber-800/30">
                <span className="text-amber-300/70">Headroom:</span>
                <div className="text-lg font-bold text-emerald-300">{ergoResult.headroomClearanceMm} mm</div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950 border border-amber-800/30">
                <span className="text-amber-300/70">Knee Flexion Angle:</span>
                <div className="text-lg font-bold text-amber-300">{ergoResult.kneeAngleDeg}°</div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950 border border-amber-800/30">
                <span className="text-amber-300/70">Elbow Bend Angle:</span>
                <div className="text-lg font-bold text-amber-300">{ergoResult.elbowAngleDeg}°</div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950 border border-amber-800/30">
                <span className="text-amber-300/70">SAE Overall Score:</span>
                <div className="text-lg font-bold text-amber-300">{ergoResult.overallSaeErgonomicsScore}/100</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAD Spec & GLB Tab */}
      {activeTab === "cad" && (
        <div className="p-6 rounded-3xl bg-amber-950/80/90 border border-amber-800/30 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu size={16} /> CAD Assembly Metadata & Specification
          </h3>
          <pre className="p-4 rounded-2xl bg-amber-950 border border-amber-800/30 text-xs font-mono text-amber-200 overflow-x-auto">
            {JSON.stringify(interiorState, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const BespokeLuxuryInteriorStudioHub = memo(BespokeLuxuryInteriorStudioHubComponent);


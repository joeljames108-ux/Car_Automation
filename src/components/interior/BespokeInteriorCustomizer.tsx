/**
 * ============================================================================
 * BESPOKE INTERIOR CUSTOMIZER & TWO-TONE STUDIO
 * ============================================================================
 * Precision customization for ultra-luxury bespoke appointments:
 * - Two-Tone Primary & Accent Leather Color Blocking
 * - Quilted Seat Stitching Patterns (Diamond, Hex Honeycomb, Fluted, Minimalist)
 * - Seatbelt & 6-Point Harness Palette
 * - Laser-Etched Illuminated Door Sill Treadplates
 * - Tactile Cockpit Sound Testing (Door Thunk, Shifter Clack, Dolby Atmos Sweep)
 * ============================================================================
 */

import React, { useState } from "react";
import { Sparkles, Shield, Volume2, Music, Check, Zap, Layers } from "lucide-react";
import { MasterModularInteriorState } from "../../sim/interior/masterInteriorTypes";
import { MasterInteriorStateEngine } from "../../sim/interior/masterInteriorStateEngine";
import { CabinAcousticSynthesizer } from "../../sim/interior/cabinAcousticSynthesizer";

interface BespokeInteriorCustomizerProps {
  state: MasterModularInteriorState;
}

export const BespokeInteriorCustomizer: React.FC<BespokeInteriorCustomizerProps> = ({ state }) => {
  const engine = MasterInteriorStateEngine.getInstance();
  const audioSynth = CabinAcousticSynthesizer.getInstance();

  const [treadplateText, setTreadplateText] = useState<string>("HANDCRAFTED // APEX GT3 001/050");
  const [selectedQuilt, setSelectedQuilt] = useState<string>("diamond_quilted");

  const harnessColors = [
    { name: "Guards Red", hex: "#ef4444" },
    { name: "Racing Yellow", hex: "#eab308" },
    { name: "Miami Blue", hex: "#f59e0b" },
    { name: "Acid Green", hex: "#84cc16" },
    { name: "Chalk Silver", hex: "#94a3b8" },
    { name: "Stealth Black", hex: "#0f172a" },
  ];

  const quiltPatterns = [
    { id: "diamond_quilted", name: "Diamond Double Quilt", desc: "Dual-needle diamond lattice stitching with micro-perforations" },
    { id: "hex_honeycomb", name: "Hexagonal Honeycomb", desc: "Motorsport-inspired aerodynamic geometric honeycomb" },
    { id: "fluted_horizontal", name: "Classic Fluted Pleats", desc: "Hand-rolled horizontal fluting inspired by 1960s GT racers" },
    { id: "minimalist_clean", name: "Technical Minimalist", desc: "Flush flat seams with zero unnecessary ornamental lines" },
  ];

  return (
    <div className="space-y-4 text-xs font-mono">
      {/* 1. Seat Quilt Stitching Pattern */}
      <div className="p-3.5 rounded-xl space-y-2.5" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5" style={{color: '#451A03'}}>
            <Sparkles size={14} style={{color: '#92400E'}} />
            <span>SEAT QUILT STITCHING ARCHITECTURE</span>
          </label>
          <span className="text-[10px] font-mono" style={{color: '#92400E'}}>Bespoke Upholstery</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quiltPatterns.map((q) => {
            const isSelected = selectedQuilt === q.id;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuilt(q.id);
                  audioSynth.playRotaryDialClick();
                }}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? "bg-amber-200/60 border-amber-400 shadow-md"
                    : "bg-white/50 border-amber-200/60 text-amber-700 hover:border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold" style={{color: '#451A03'}}>{q.name}</div>
                  {isSelected && <Check size={12} style={{color: '#92400E'}} />}
                </div>
                <div className="text-[10px] mt-1 leading-tight" style={{color: '#78716C'}}>{q.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Seatbelts & 6-Point Harness Palette */}
      <div className="p-3.5 rounded-xl space-y-2.5" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5" style={{color: '#451A03'}}>
            <Shield size={14} style={{color: '#92400E'}} />
            <span>SEATBELT & 6-POINT HARNESS COLOR</span>
          </label>
          <span className="text-[10px] font-mono" style={{color: '#92400E'}}>FIA Homologated Webbing</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {harnessColors.map((c) => {
            const isSelected = state.seating.harnessColorHex?.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                onClick={() => {
                  engine.updateSeating({ harnessColorHex: c.hex });
                  audioSynth.playRotaryDialClick();
                }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? "bg-amber-200/60 border-amber-400 shadow-sm"
                    : "bg-white/50 border-amber-200/60 hover:border-amber-300"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[9px] font-bold truncate w-full" style={{color: '#451A03'}}>{c.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Illuminated Laser-Etched Door Sill Treadplate */}
      <div className="p-3.5 rounded-xl space-y-2" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5" style={{color: '#451A03'}}>
            <Layers size={14} style={{color: '#92400E'}} />
            <span>ILLUMINATED CARBON SILL TREADPLATE</span>
          </label>
          <span className="text-[10px] font-mono" style={{color: '#92400E'}}>Laser Engraved</span>
        </div>

        <input
          type="text"
          value={treadplateText}
          onChange={(e) => setTreadplateText(e.target.value)}
          placeholder="Custom Vehicle Engraving..."
          className="w-full px-3 py-2 rounded-xl font-mono text-xs focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
        />

        {/* Live Illuminated Preview */}
        <div className="p-2.5 rounded-lg flex items-center justify-center text-center" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.25)'}}>
          <span className="text-xs font-mono font-bold tracking-widest" style={{color: '#92400E', textShadow: '0 0 10px rgba(217,166,78,0.5)'}}>
            ✨ {treadplateText.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 4. Tactile Cockpit Sound Feedback Testing */}
      <div className="p-3.5 rounded-xl space-y-2.5" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5" style={{color: '#451A03'}}>
            <Volume2 size={14} style={{color: '#92400E'}} />
            <span>TACTILE COCKPIT ACOUSTIC TESTING</span>
          </label>
          <span className="text-[10px] font-mono" style={{color: '#92400E'}}>Web Audio API</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => audioSynth.playDoorThunk()}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all font-bold" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)', color: '#451A03'}}
          >
            <Shield size={12} />
            <span>Door Seal "Thunk"</span>
          </button>

          <button
            onClick={() => audioSynth.playGatedShifterClick()}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all font-bold" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)', color: '#451A03'}}
          >
            <Zap size={12} />
            <span>Gated Shifter "Click"</span>
          </button>

          <button
            onClick={() => audioSynth.playDolbyAtmosSweep()}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all font-bold" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)', color: '#451A03'}}
          >
            <Music size={12} />
            <span>Dolby Atmos Sweep</span>
          </button>
        </div>
      </div>
    </div>
  );
};

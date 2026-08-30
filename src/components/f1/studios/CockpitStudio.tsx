// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — COCKPIT, STEERING WHEEL & ELECTRONICS STUDIO
// ============================================================================

import React, { memo } from "react";
import { Sliders, Cpu, Shield, Radio, CheckCircle2 } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export const CockpitStudio: React.FC = memo(function CockpitStudio() {
  const { car, updateCockpit } = useF1ConstructorStore();
  const c = car.cockpit;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-indigo-500/20 bg-gradient-to-r from-amber-900/60 via-slate-900/90 to-indigo-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="text-amber-400" size={24} />
            <h2 className="text-xl font-bold text-amber-50 tracking-wide">
              Cockpit Ergonomics, F1 Steering Wheel & Electronics
            </h2>
          </div>
          <p className="text-xs text-amber-200/60 max-w-2xl">
            Design the driver cockpit environment: 5.0" high-nit OLED telemetry screen, 30+ steering wheel buttons/dials, dual clutch paddles, 3D foam driver seat mold, and McLaren TAG-320 ECU telemetry logging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-amber-400">
              {c.telemetryChannelsCount} <span className="text-xs text-amber-200/60 font-normal">Channels</span>
            </div>
            <div className="text-[10px] text-amber-200/60 uppercase tracking-wider">
              {c.telemetrySampleRateHz} Hz Sample Rate
            </div>
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Steering Wheel Display */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
            <span>Steering Display Unit</span>
            <span className="text-[10px] text-amber-400 font-mono">PDU Display</span>
          </label>
          <select
            value={c.steeringWheelDisplayType}
            onChange={(e) => {
              playHMIClickSound();
              updateCockpit({ steeringWheelDisplayType: e.target.value as any });
            }}
            className="w-full bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="5_0_INCH_HIGH_NIT_TFT">5.0" High-Nit Daylight Visible TFT (1200 Nits)</option>
            <option value="4_3_INCH_OLED_PDU">4.3" Lightweight OLED Programmable Display</option>
          </select>
          <p className="text-[11px] text-amber-300/50">
            Displays live delta timing, tire core temperatures, ERS state-of-charge %, and engine map status.
          </p>
        </div>

        {/* 2. Steering Rotary Switch Count */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-100/80 uppercase tracking-wider">Steering Rotary Switches</span>
            <span className="font-mono text-amber-400 font-bold">{c.rotarySwitchCount} Rotary Selectors</span>
          </div>
          <input
            type="range"
            min="4"
            max="8"
            step="1"
            value={c.rotarySwitchCount}
            onChange={(e) => updateCockpit({ rotarySwitchCount: parseInt(e.target.value) })}
            className="w-full accent-indigo-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-amber-300/50">
            <span>4 (Essential)</span>
            <span>6 (Diff / Brake / PU / MGU-K)</span>
            <span>8 (Full Pro Matrix)</span>
          </div>
        </div>

        {/* 3. Pushbutton Controls */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-100/80 uppercase tracking-wider">Tactile Pushbuttons</span>
            <span className="font-mono text-amber-400 font-bold">{c.pushbuttonCount} Buttons</span>
          </div>
          <input
            type="range"
            min="12"
            max="20"
            step="1"
            value={c.pushbuttonCount}
            onChange={(e) => updateCockpit({ pushbuttonCount: parseInt(e.target.value) })}
            className="w-full accent-indigo-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-amber-300/50">
            <span>12 (Radio / DRS / Neutral)</span>
            <span>16 (F1 Standard)</span>
            <span>20 (Max Tactile Controls)</span>
          </div>
        </div>

        {/* 4. Telemetry Channels & Sample Frequency */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
            <span>Telemetry Acquisition Rate</span>
            <span className="text-[10px] text-amber-400 font-mono">Pit Radio Link</span>
          </label>
          <select
            value={c.telemetrySampleRateHz}
            onChange={(e) => updateCockpit({ telemetrySampleRateHz: parseInt(e.target.value) as any })}
            className="w-full bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 focus:outline-none focus:border-indigo-500"
          >
            <option value={100}>100 Hz (Standard Telemetry)</option>
            <option value={250}>250 Hz (High Speed Suspension Logs)</option>
            <option value={500}>500 Hz (Tire & Combust Dyno Precision)</option>
            <option value={1000}>1000 Hz (Full High-Resolution Black Box)</option>
          </select>
          <p className="text-[11px] text-amber-300/50">
            Higher sample rates provide millisecond-precise tire slip and damper velocity logging.
          </p>
        </div>

        {/* 5. Custom Driver Seat Foam Mold */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
            <span>Driver Ergonomic Seat Insert</span>
            <span className="text-[10px] text-amber-400 font-mono">3D Body Scan</span>
          </label>
          <div className="flex items-center gap-3 bg-amber-800/35/80 p-3 rounded-lg border border-amber-700/30">
            <input
              type="checkbox"
              id="customSeat"
              checked={c.driverSeatCustomFoamScan}
              onChange={(e) => {
                playHMIClickSound();
                updateCockpit({ driverSeatCustomFoamScan: e.target.checked });
              }}
              className="accent-indigo-400 w-4 h-4"
            />
            <label htmlFor="customSeat" className="text-xs text-amber-50 cursor-pointer">
              Bespoke Carbon/Foam Driver Seat Mold (Reduces driver fatigue by 18%)
            </label>
          </div>
          <p className="text-[11px] text-amber-300/50">
            Custom-molded bead seats distribute 5G lateral cornering loads evenly across the driver's torso.
          </p>
        </div>

        {/* 6. Fire Suppression Gas */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
            <span>Fire Extinguisher System</span>
            <span className="text-[10px] text-ok-400 font-mono">FIA 8865-2015</span>
          </label>
          <select
            value={c.fireExtinguisherGas}
            onChange={(e) => {
              playHMIClickSound();
              updateCockpit({ fireExtinguisherGas: e.target.value as any });
            }}
            className="w-full bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="NOVEC_1230">3M Novec 1230 Clean Agent (Zero Residue)</option>
            <option value="FE_36_ECO_CLEAN">FE-36 DuPont Fire Suppression Gas</option>
          </select>
          <p className="text-[11px] text-amber-300/50">
            Dual nozzles in cockpit and engine bay automatically deploy in high thermal emergency events.
          </p>
        </div>
      </div>
    </div>
  );
});

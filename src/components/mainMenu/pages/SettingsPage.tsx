import React, { useState } from "react";
import { Settings, Volume2, Monitor, Sliders, Shield, Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { SubPageLayout } from "../SubPageLayout";
import type { Stage } from "../../StageSwitcher";

interface SettingsPageProps {
  onSelectStage: (stage: Stage) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSelectStage }) => {
  const [metricUnits, setMetricUnits] = useState(true);
  const [audioVolume, setAudioVolume] = useState(85);
  const [autoSaveMinutes, setAutoSaveMinutes] = useState(5);

  return (
    <SubPageLayout
      title="Corporate & Simulator Settings"
      category="Preferences • Display • Units • Audio • Simulation Engine"
      icon={<Settings size={20} className="text-slate-400" />}
      onSelectStage={onSelectStage}
    >
      <div className="w-full flex-1 flex flex-col gap-5 max-w-4xl mx-auto">
        {/* Settings Categories Grid */}
        <div className="space-y-4">
          {/* Section 1: Units & Preferences */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Sliders size={16} className="text-cyan-400" />
              <span>MEASUREMENT & DISPLAY UNITS</span>
            </h3>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div>
                <div className="text-sm font-bold text-white">Unit System</div>
                <div className="text-xs text-slate-400">Choose between Metric (km/h, kW, kg) and Imperial (mph, hp, lbs)</div>
              </div>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setMetricUnits(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    metricUnits ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Metric
                </button>
                <button
                  onClick={() => setMetricUnits(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    !metricUnits ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Imperial
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Audio & Acoustics */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Volume2 size={16} className="text-amber-400" />
              <span>AUDIO & NVH ACOUSTICS</span>
            </h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-bold text-white">Master Sound Engine Volume</div>
                <div className="text-xs text-slate-400">Synthesized 720° engine acoustics, turbo spool, and UI haptics</div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(Number(e.target.value))}
                  className="w-32 accent-cyan-400"
                />
                <span className="text-xs font-mono text-cyan-300 w-10 text-right">{audioVolume}%</span>
              </div>
            </div>
          </div>

          {/* Section 3: Save Data & Cloud Backup */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Save size={16} className="text-emerald-400" />
              <span>DATA & AUTO-SAVE INTERVAL</span>
            </h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-bold text-white">Auto-Save Frequency</div>
                <div className="text-xs text-slate-400">Periodically stores vehicle blueprints and corporate state</div>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/10">
                Every {autoSaveMinutes} Minutes
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPageLayout>
  );
};

/**
 * ============================================================================
 * INTERIOR COMPARE MODAL — SIDE-BY-SIDE SPECIFICATION COMPARATOR
 * ============================================================================
 * Compares the user's active interior build against:
 * 1. Factory Baseline (Original 80s)
 * 2. Sport 80s Spec
 * 3. Luxury 80s Spec
 * Shows dynamic metric deltas (Comfort, Weight, Cost, Rating) + One-click Load.
 * ============================================================================
 */

import React from "react";
import {
  useInteriorDashboardConfigStore,
  INTERIOR_PRESETS,
  CONFIG_OPTIONS,
  computeMetrics,
  getSelectedOptionLabel,
  type FeatureKey,
} from "../../state/interiorDashboardConfigStore";
import { X, Check, ArrowRight, Sparkles, Scale, DollarSign, Award } from "lucide-react";

interface InteriorCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteriorCompareModal: React.FC<InteriorCompareModalProps> = ({
  isOpen,
  onClose,
}) => {
  const selections = useInteriorDashboardConfigStore((s) => s.selections);
  const currentMetrics = useInteriorDashboardConfigStore((s) => s.metrics);
  const applyPreset = useInteriorDashboardConfigStore((s) => s.applyPreset);

  if (!isOpen) return null;

  const baselineSelections = INTERIOR_PRESETS.ORIGINAL_80S.selections;
  const baselineMetrics = computeMetrics(baselineSelections);

  const sportSelections = INTERIOR_PRESETS.SPORT_80S.selections;
  const sportMetrics = computeMetrics(sportSelections);

  const luxurySelections = INTERIOR_PRESETS.LUXURY_80S.selections;
  const luxuryMetrics = computeMetrics(luxurySelections);

  const featureKeys = Object.keys(CONFIG_OPTIONS) as FeatureKey[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-amber-950/80 border border-amber-700/30/80 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-800/30 bg-amber-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Interior Specification Comparison</h2>
              <p className="text-xs text-amber-300/70">Side-by-side automotive engineering matrix &amp; stat deltas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-300/70 hover:text-amber-50 hover:bg-amber-900/40 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-4 gap-3">
            {/* Active Config */}
            <div className="bg-blue-950/40 border-2 border-cyan-400/60 rounded-xl p-3.5 flex flex-col gap-2 relative">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">YOUR ACTIVE BUILD</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-white">{currentMetrics.overallRating}</span>
                <span className="text-xs font-bold text-amber-200">{currentMetrics.comfort}% Comfort</span>
              </div>
              <div className="text-xs text-amber-300/70 flex justify-between font-mono">
                <span>{currentMetrics.weight} kg</span>
                <span className="text-emerald-400 font-bold">${currentMetrics.cost.toLocaleString()}</span>
              </div>
            </div>

            {/* Baseline */}
            <div className="bg-amber-950/60 border border-amber-800/30 rounded-xl p-3.5 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-300/70 uppercase tracking-wider">ORIGINAL 80S (BASE)</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-amber-200">{baselineMetrics.overallRating}</span>
                <span className="text-xs font-bold text-amber-300/70">{baselineMetrics.comfort}% Comfort</span>
              </div>
              <div className="text-xs text-amber-300/70 flex justify-between font-mono">
                <span>{baselineMetrics.weight} kg</span>
                <span className="text-amber-200">${baselineMetrics.cost.toLocaleString()}</span>
              </div>
            </div>

            {/* Sport 80s */}
            <div className="bg-amber-950/60 border border-amber-800/30 rounded-xl p-3.5 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">SPORT 80S</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-amber-300">{sportMetrics.overallRating}</span>
                <span className="text-xs font-bold text-amber-300/70">{sportMetrics.comfort}% Comfort</span>
              </div>
              <div className="text-xs text-amber-300/70 flex justify-between font-mono">
                <span>{sportMetrics.weight} kg</span>
                <span className="text-amber-200">${sportMetrics.cost.toLocaleString()}</span>
              </div>
            </div>

            {/* Luxury 80s */}
            <div className="bg-amber-950/60 border border-amber-800/30 rounded-xl p-3.5 flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">LUXURY 80S</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-emerald-300">{luxuryMetrics.overallRating}</span>
                <span className="text-xs font-bold text-amber-300/70">{luxuryMetrics.comfort}% Comfort</span>
              </div>
              <div className="text-xs text-amber-300/70 flex justify-between font-mono">
                <span>{luxuryMetrics.weight} kg</span>
                <span className="text-amber-200">${luxuryMetrics.cost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Feature Matrix Table */}
          <div className="border border-amber-800/30 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-amber-950 text-amber-300/70 uppercase font-mono border-b border-amber-800/30">
                  <th className="py-2.5 px-4 font-semibold">Subsystem / Feature</th>
                  <th className="py-2.5 px-4 font-semibold text-cyan-400 bg-blue-950/20">Your Active Build</th>
                  <th className="py-2.5 px-4 font-semibold">Original 80s</th>
                  <th className="py-2.5 px-4 font-semibold">Sport 80s</th>
                  <th className="py-2.5 px-4 font-semibold">Luxury 80s</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {featureKeys.map((key) => {
                  const label = CONFIG_OPTIONS[key].label;
                  const currentVal = getSelectedOptionLabel(key, selections);
                  const baseVal = getSelectedOptionLabel(key, baselineSelections);
                  const sportVal = getSelectedOptionLabel(key, sportSelections);
                  const luxVal = getSelectedOptionLabel(key, luxurySelections);

                  return (
                    <tr key={key} className="hover:bg-amber-900/40/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-amber-200">{label}</td>
                      <td className="py-2.5 px-4 font-bold text-cyan-300 bg-blue-950/20">{currentVal}</td>
                      <td className="py-2.5 px-4 text-amber-300/70">{baseVal}</td>
                      <td className="py-2.5 px-4 text-amber-300/70">{sportVal}</td>
                      <td className="py-2.5 px-4 text-amber-300/70">{luxVal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-800/30 bg-amber-950/60 flex items-center justify-between">
          <span className="text-xs text-amber-300/70">
            Selected configurations update in real time across the 3D cockpit and 2D blueprints.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
};

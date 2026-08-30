// ===================================================================
// EXTERIOR VEHICLE ASSEMBLY COMPLETION CELEBRATION MODAL
// ===================================================================

import React from "react";
import { Sparkles, Trophy, CheckCircle2, RotateCcw, Share2, Play } from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";

interface ExteriorCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExteriorCompletionModal: React.FC<ExteriorCompletionModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const totalWeight = useExteriorAssemblyStore((s) => s.getTotalExteriorWeight());
  const totalCost = useExteriorAssemblyStore((s) => s.getTotalExteriorCost());
  const totalRigidity = useExteriorAssemblyStore((s) => s.getTotalTorsionalRigidityKNm());
  const paintConfig = useExteriorAssemblyStore((s) => s.paintConfig);

  const totalDft =
    paintConfig.eCoatPrimerMicrons +
    paintConfig.primerSurfacerMicrons +
    paintConfig.baseCoatMicrons +
    paintConfig.clearCoatMicrons;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative max-w-lg w-full bg-amber-900/50 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto">
          <Trophy size={32} />
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
            HOMOLOGATION CERTIFIED
          </span>
          <h2 className="text-xl font-bold font-mono text-amber-50 mt-1">
            BODY-IN-WHITE ASSEMBLY COMPLETE!
          </h2>
          <p className="text-xs text-amber-200/60 mt-1">
            All structural, optical, and closure subsystems have been precision aligned and torque-verified.
          </p>
        </div>

        {/* Final Specification Badges */}
        <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-amber-950/80 border border-white/10 font-mono text-xs text-center">
          <div>
            <span className="text-[10px] text-amber-300/50 block">WEIGHT</span>
            <strong className="text-amber-400 font-bold">{Math.round(totalWeight)} kg</strong>
          </div>
          <div>
            <span className="text-[10px] text-amber-300/50 block">RIGIDITY</span>
            <strong className="text-emerald-400 font-bold">{totalRigidity} kNm/deg</strong>
          </div>
          <div>
            <span className="text-[10px] text-amber-300/50 block">PAINT BUILD</span>
            <strong className="text-amber-400 font-bold">{totalDft} µm</strong>
          </div>
          <div>
            <span className="text-[10px] text-amber-300/50 block">TOTAL BOM</span>
            <strong className="text-amber-400 font-bold">${Math.round(totalCost).toLocaleString()}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-lg hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all"
          >
            CONTINUE INSPECTION
          </button>
        </div>
      </div>
    </div>
  );
};

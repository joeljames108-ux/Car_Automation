// ===================================================================
// EXTERIOR VEHICLE DESIGNER TOP-LEVEL INTEGRATION WORKSPACE
// ===================================================================
// Integrates sticky 2D/3D viewport, progressive assembly builder flow,
// category accordions, paint booth, and completion celebration modal.
// ===================================================================

import React, { useState } from "react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import { ExteriorViewModeTransition } from "./ExteriorViewModeTransition";
import { ExteriorBuilderFlow } from "./ExteriorBuilderFlow";
import { ExteriorProgressPanel } from "./ExteriorProgressPanel";
import { ExteriorCompletionModal } from "./ExteriorCompletionModal";

export const ExteriorDesignerIntegration: React.FC = () => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const isAssemblyComplete = useExteriorAssemblyStore((s) => s.isAssemblyComplete);

  // Trigger modal when complete
  React.useEffect(() => {
    if (isAssemblyComplete) {
      setShowCompletionModal(true);
    }
  }, [isAssemblyComplete]);

  return (
    <div className="w-full h-full min-h-[700px] flex flex-col space-y-4 font-sans text-slate-100">
      {/* ── TOP HEADER STATS & PROGRESS ── */}
      <ExteriorProgressPanel />

      {/* ── MAIN DUAL-COLUMN WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1">
        {/* Left Sticky 2D / 3D Assembly Viewport (7 Cols) */}
        <div className="lg:col-span-7 lg:sticky lg:top-4 h-[580px] w-full">
          <ExteriorViewModeTransition />
        </div>

        {/* Right Scrollable Assembly Builder Flow & Workshop Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <ExteriorBuilderFlow />
        </div>
      </div>

      {/* ── ASSEMBLY COMPLETION MODAL ── */}
      <ExteriorCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
      />
    </div>
  );
};

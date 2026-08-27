import React, { Suspense, lazy } from "react";
import { Sparkles } from "lucide-react";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { StageLoadingSkeleton } from "../../ui/StageLoadingSkeleton";

const GrandAutomotiveStudioHub = lazy(() => import("../../GrandAutomotiveStudioHub").then(m => ({ default: m.GrandAutomotiveStudioHub })));

export function NeonGrandStudioHub() {
  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header Banner */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "GRAND AUTOMOTIVE ENGINEERING STUDIO HUB",
          subtitle: "Flagship unified control center across 17 engineering, aerodynamic, racing, and manufacturing studios",
          icon: <Sparkles size={18} />,
          badge: <NeonHorizonBadge variant="live">17 STUDIOS CONNECTED</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="text-xs text-slate-400 font-mono">
          Unified real-time bidirectional engineering link active. Select any studio to calibrate telemetry, physics kinematics, or powertrain parameters.
        </div>
      </NeonHorizonGlassPanel>

      {/* Embedded Studio Hub Container */}
      <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0a111e]">
        <Suspense fallback={<StageLoadingSkeleton stageName="studio" />}>
          <GrandAutomotiveStudioHub />
        </Suspense>
      </div>
    </div>
  );
}

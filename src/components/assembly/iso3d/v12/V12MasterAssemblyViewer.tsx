import React, { useState, useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { V12CoordinateStage } from "./V12CoordinateStage";
import { V12BlockCastingIso } from "./V12BlockCastingIso";
import { V12DrySumpPanIso } from "./V12DrySumpPanIso";
import { V12DrySumpTubesIso } from "./V12DrySumpTubesIso";
import { V12DrySumpTankIso } from "./V12DrySumpTankIso";
import { V12RadiatorAssemblyIso } from "./V12RadiatorAssemblyIso";
import { V12CylinderHeadsIso } from "./V12CylinderHeadsIso";
import { V12TimingTrainIso } from "./V12TimingTrainIso";
import { V12ValveCoversIso } from "./V12ValveCoversIso";
import { V12IntakeManifoldsIso } from "./V12IntakeManifoldsIso";
import { V12VelocityStacksIso } from "./V12VelocityStacksIso";
import { V12FuelSystemIso } from "./V12FuelSystemIso";
import { V12TurbochargerIso } from "./V12TurbochargerIso";
import { V12ExhaustHeadersIso } from "./V12ExhaustHeadersIso";
import { V12FlywheelIso } from "./V12FlywheelIso";
import { V12ClutchPackIso } from "./V12ClutchPackIso";
import { V12BellhousingIso } from "./V12BellhousingIso";
import { V12GearClusterIso } from "./V12GearClusterIso";
import { V12TransmissionCasingIso } from "./V12TransmissionCasingIso";
import { V12ElectronicsIso } from "./V12ElectronicsIso";
import { V12WiringLoomIso } from "./V12WiringLoomIso";
import { V12EngineCoverAssemblyIso } from "./V12EngineCoverAssemblyIso";
import { V12DynoHUDOverlayIso } from "./V12DynoHUDOverlayIso";

interface V12MasterAssemblyViewerProps {
  initialWithCover?: boolean;
  onHoverComponent?: (id: ComponentId | null) => void;
  className?: string;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PHASE 24 — UNIFIED MASTER V12 INTERACTIVE ASSEMBLY VIEWER
 * ═══════════════════════════════════════════════════════════════════
 *
 * Full Master 3D Isometric Racing-Spec 6.5L 60° V12 Engine & Integrated
 * Dry-Sump Transmission Assembly matching the reference illustration.
 *
 * Dual Operational Modes:
 *  1. Mode 1: Without Engine Cover (Raw Exposed Mechanical Splendor)
 *  2. Mode 2: With Engine Cover (Dry-Carbon Monocoque with Quartz Viewports)
 */
export const V12MasterAssemblyViewer: React.FC<V12MasterAssemblyViewerProps> = ({
  initialWithCover = false,
  onHoverComponent,
  className = "",
}) => {
  const [withEngineCover, setWithEngineCover] = useState<boolean>(initialWithCover);
  const [activeComponent, setActiveComponent] = useState<ComponentId | null>(null);

  const handleHover = (id: ComponentId | null) => {
    setActiveComponent(id);
    onHoverComponent?.(id);
  };

  return (
    <div className={`relative w-full overflow-hidden select-none bg-slate-950/80 rounded-xl border border-slate-800 ${className}`}>
      {/* ── TOP CONTROL BAR ── */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-3">
        <button
          onClick={() => setWithEngineCover((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-300 border ${
            withEngineCover
              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10"
              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
          }`}
        >
          {withEngineCover ? "✦ MODE 2: WITH ENGINE COVER" : "✦ MODE 1: WITHOUT COVER (RAW SPEC)"}
        </button>

        {activeComponent && (
          <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-cyan-400">
            INSPECTING: {activeComponent.toUpperCase()}
          </span>
        )}
      </div>

      {/* ── MASTER SVG ISOMETRIC CANVAS ── */}
      <svg
        viewBox="0 0 500 375"
        className="w-full h-auto max-h-[720px] drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Stage & Tempered Glass Display Podium */}
        <V12CoordinateStage originScreen={{ x: 250, y: 220 }} showPodium={true}>
          {/* 1. Engine Block Casting */}
          <V12BlockCastingIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 2. Dry-Sump Low-Profile Pan */}
          <V12DrySumpPanIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 3. Dry-Sump Scavenge Hardline Tubes & AN Fittings */}
          <V12DrySumpTubesIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 4. Integrated Dry-Sump Reservoir Tank & Inline Filter */}
          <V12DrySumpTankIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 5. Dual-Pass Aluminum Racing Radiator & Fan Shroud */}
          <V12RadiatorAssemblyIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 6. Precision 60° V12 Cylinder Heads */}
          <V12CylinderHeadsIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 7. Quad-Cam Timing Sprockets & Roller Chains */}
          <V12TimingTrainIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 8. Vibrant Orange-Gold Billet Valve Covers */}
          <V12ValveCoversIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 9. 12 Curved Ram Intake Runners */}
          <V12IntakeManifoldsIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 10. 12 Cobalt-Blue Velocity Stacks / ITBs */}
          <V12VelocityStacksIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 11. Dual High-Pressure Fuel Rails & GDI Injectors */}
          <V12FuelSystemIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 12. Mirror-Polished High-Boost Turbocharger */}
          <V12TurbochargerIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 13. 6-into-1 Hydroformed Inconel Headers */}
          <V12ExhaustHeadersIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 14. Dual-Mass Steel Flywheel */}
          <V12FlywheelIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 15. Multi-Plate Wet Clutch Pack */}
          <V12ClutchPackIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 16. Die-Cast Aluminum Bellhousing */}
          <V12BellhousingIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 17. 7-Speed Sequential Transaxle Gear Cluster */}
          <V12GearClusterIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 18. Transmission Casing & Output Yoke */}
          <V12TransmissionCasingIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 19. Extruded Aluminum ECU & TCU Modules */}
          <V12ElectronicsIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 20. Braided Raychem Wiring Loom */}
          <V12WiringLoomIso originScreen={{ x: 250, y: 220 }} onHoverComponent={handleHover} />

          {/* 21. Optional Dry-Carbon Monocoque Engine Cover */}
          {withEngineCover && (
            <V12EngineCoverAssemblyIso
              originScreen={{ x: 250, y: 220 }}
              onHoverComponent={handleHover}
            />
          )}
        </V12CoordinateStage>

        {/* 22. Glassmorphic Spec Callout HUD & Camera Reticle */}
        <V12DynoHUDOverlayIso
          hasCover={withEngineCover}
          onToggleCover={() => setWithEngineCover((prev) => !prev)}
        />
      </svg>
    </div>
  );
};

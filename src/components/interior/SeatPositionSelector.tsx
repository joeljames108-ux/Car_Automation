/**
 * ============================================================================
 * MULTI-SEAT VIEW POSITION SELECTOR COMPONENT
 * ============================================================================
 * Interactive HUD selector for switching camera views inside the 3D cabin:
 * - [ DRIVER ] [ FRONT PASSENGER ] [ REAR LEFT ] [ REAR RIGHT ]
 * - Auto-detects 2-seat vs 4/5-seat vehicle layout and hides unavailable seats
 * - Triggers smooth cinematic camera lerp and gaze HUD updating
 * ============================================================================
 */

import React from "react";
import { SeatCameraAnchorId, SEAT_CAMERA_ANCHORS } from "../../exterior3d/generators/interior/driverSeatCameraRig";
import { Eye, Armchair, User, Sparkles } from "lucide-react";

interface SeatPositionSelectorProps {
  activeAnchor: SeatCameraAnchorId;
  seatCount?: number;
  onSelectAnchor: (anchorId: SeatCameraAnchorId) => void;
  isAutoPan?: boolean;
  onToggleAutoPan?: () => void;
}

export const SeatPositionSelector: React.FC<SeatPositionSelectorProps> = ({
  activeAnchor,
  seatCount = 2,
  onSelectAnchor,
  isAutoPan = false,
  onToggleAutoPan,
}) => {
  // Only show rear seats if vehicle seat count > 2
  const availableAnchors: SeatCameraAnchorId[] =
    seatCount <= 2 ? ["DRIVER", "FRONT_PASSENGER"] : ["DRIVER", "FRONT_PASSENGER", "REAR_LEFT", "REAR_RIGHT"];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-amber-900/50 to-amber-950/70 backdrop-blur-xl border border-amber-500/35 shadow-2xl">
      {/* Label */}
      <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-extrabold text-amber-400 border-r border-amber-500/40">
        <Eye size={14} className="text-amber-400" />
        <span className="hidden sm:inline">VIEW POSITION</span>
      </div>

      {/* Seat Button Group */}
      <div className="flex items-center gap-1">
        {availableAnchors.map((id) => {
          const cfg = SEAT_CAMERA_ANCHORS[id];
          const isActive = activeAnchor === id;

          return (
            <button
              key={id}
              onClick={() => onSelectAnchor(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black scale-105"
                  : "bg-amber-950/50 text-amber-200 hover:text-amber-100 hover:bg-amber-900/60 border border-amber-500/30"
              }`}
              title={cfg.name}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Optional Auto-Pan Tour Button */}
      {onToggleAutoPan && (
        <button
          onClick={onToggleAutoPan}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all ml-auto cursor-pointer ${
            isAutoPan
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 animate-pulse"
              : "bg-amber-950/50 text-amber-400 border border-amber-500/30 hover:bg-amber-900/60"
          }`}
        >
          <Sparkles size={13} />
          <span>{isAutoPan ? "SWAY TOUR: ON" : "360° SWAY"}</span>
        </button>
      )}
    </div>
  );
};

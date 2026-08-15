import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";

interface HybridMotorIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    bh: number;
  };
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  onHoverComponent?: (id: ComponentId | null) => void;
}

const HybridMotorIsoComponent: React.FC<HybridMotorIsoProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 230 }), []);
  const block3DWidth = layoutSpec.bw * 0.7;

  // Mounted at Rear Flywheel Shaft End: X = -block3DWidth / 2 - 25, Y = 0, Z = 28
  const hPt = useMemo(
    () => projectIso({ x: -block3DWidth / 2 - 25, y: 0, z: 28 }, originScreen),
    [block3DWidth, originScreen]
  );

  return (
    <g
      id="iso-hybrid_motor"
      onMouseEnter={() => onHoverComponent?.("hybrid_motor")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* 3D Stator Ring Ring */}
      <ellipse cx={hPt.x} cy={hPt.y} rx="26" ry="38" fill="url(#ev-stator-core)" stroke="#090d16" strokeWidth="2.8" />
      <ellipse cx={hPt.x} cy={hPt.y} rx="22" ry="32" fill="url(#ev-copper-windings)" stroke="#090d16" strokeWidth="1.8" />
      <ellipse cx={hPt.x} cy={hPt.y} rx="12" ry="18" fill="url(#main-bearing-cap-cast-iron)" stroke="#090d16" strokeWidth="1.5" />

      {/* High-Voltage Orange Busbar Connections */}
      <rect x={hPt.x - 12} y={hPt.y - 42} width="8" height="12" rx="2" fill="#ea580c" stroke="#090d16" strokeWidth="1" />
      <rect x={hPt.x + 4} y={hPt.y - 42} width="8" height="12" rx="2" fill="#ea580c" stroke="#090d16" strokeWidth="1" />
    </g>
  );
};

export const HybridMotorIso = React.memo(HybridMotorIsoComponent);

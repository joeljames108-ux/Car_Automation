import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { getIsoBoxFacets } from "./isoMath";

interface InverterECUIsoProps {
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

const InverterECUIsoComponent: React.FC<InverterECUIsoProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 230 }), []);
  const facets = useMemo(() => getIsoBoxFacets({ x: -35, y: -30, z: 225 }, 70, 60, 20, originScreen), [originScreen]);

  return (
    <g
      id="iso-inverter_ecu"
      onMouseEnter={() => onHoverComponent?.("inverter_ecu")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      <polygon points={facets.top} fill="url(#iso-forged-top)" stroke="#0f172a" strokeWidth="1.5" />
      <polygon points={facets.left} fill="url(#iso-forged-left)" stroke="#0f172a" strokeWidth="1.5" />
      <polygon points={facets.right} fill="url(#iso-forged-right)" stroke="#0f172a" strokeWidth="1.5" />
    </g>
  );
};

export const InverterECUIso = React.memo(InverterECUIsoComponent);

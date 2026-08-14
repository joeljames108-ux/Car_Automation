import React from "react";
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

export const InverterECUIso: React.FC<InverterECUIsoProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 230 };

  const origin3D = {
    x: -35,
    y: -30,
    z: 225, // Mounted over valve cover deck surface!
  };

  const facets = getIsoBoxFacets(origin3D, 70, 60, 20, originScreen);

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
      <path d={facets.left} fill="url(#slate-block-artwork)" stroke="#090d16" strokeWidth="2.2" />
      <path d={facets.right} fill="url(#slate-block-artwork)" stroke="#090d16" strokeWidth="2.2" />
      <path d={facets.top} fill="url(#iso-billet-top)" stroke="#090d16" strokeWidth="2.5" />
      <path d={facets.top} fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />

      {/* Status Signal LED */}
      <circle cx={facets.top.indexOf("M") !== -1 ? 250 : 250} cy="115" r="2.5" fill="#38bdf8" className="animate-pulse" />
    </g>
  );
};

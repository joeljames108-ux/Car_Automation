import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVCellModulesRendererProps {
  layoutSpec: {
    bx: number;
    bw: number;
    bh: number;
  };
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  onHoverComponent?: (id: ComponentId | null) => void;
}

export const EVCellModulesRenderer: React.FC<EVCellModulesRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;

  // 800V Cell Modules in Dual Matrix Rows
  const moduleCols = 4;
  const moduleRows = 2;
  const moduleWidth = (bw - 36) / moduleCols;
  const moduleHeight = 85;

  return (
    <g
      id="ev-cell-modules"
      onMouseEnter={() => onHoverComponent?.("crankshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {[0, 1].map((row) => (
        <g key={row}>
          {Array.from({ length: moduleCols }).map((_, col) => {
            const mx = bx + 18 + col * moduleWidth;
            const my = 125 + row * 95;

            return (
              <g key={col}>
                {/* Module Casing Box */}
                <rect
                  x={mx}
                  y={my}
                  width={moduleWidth - 6}
                  height={moduleHeight}
                  rx="6"
                  fill="url(#billet-chrome)"
                  stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
                  strokeWidth="2"
                />
                <rect x={mx + 2} y={my + 2} width={moduleWidth - 10} height={moduleHeight - 4} rx="4" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />

                {/* Individual Pouch Cell Ribs */}
                {Array.from({ length: 6 }).map((_, rib) => (
                  <line
                    key={rib}
                    x1={mx + 6 + rib * ((moduleWidth - 16) / 5)}
                    y1={my + 10}
                    x2={mx + 6 + rib * ((moduleWidth - 16) / 5)}
                    y2={my + moduleHeight - 10}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Module Positive/Negative Terminals */}
                <circle cx={mx + 10} cy={my + 8} r="3" fill="#ef4444" stroke="#090d16" strokeWidth="1" />
                <circle cx={mx + moduleWidth - 16} cy={my + 8} r="3" fill="#3b82f6" stroke="#090d16" strokeWidth="1" />

                {/* Status Telemetry LED */}
                <circle cx={mx + (moduleWidth - 6) / 2} cy={my + moduleHeight - 8} r="2.5" fill="#10b981" />
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};

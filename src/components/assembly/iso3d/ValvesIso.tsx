import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIso60VEllipse, projectIsoEllipse } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface ValvesIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    bh: number;
    category?: string;
  };
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * 3D ISOMETRIC 4-VALVE PER CYLINDER ASSEMBLY — Multi-Architecture
 * ═══════════════════════════════════════════════════════════════════
 *
 * Titanium intake valves & sodium-filled Inconel exhaust valves with
 * beehive dual-rate helical springs and titanium retainers.
 */
const ValvesIsoComponent: React.FC<ValvesIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 215 }), []);
  const materialGrade = selectedVariants?.valves || "titanium";
  const fills = useMemo(() => getIsoMaterialFills(materialGrade), [materialGrade]);

  const cat = (layoutSpec.category || "").toLowerCase();
  const label = (layoutSpec.label || "").toLowerCase();
  const isV = cat === "vbank" || label.includes("v-") || label.includes("v6") || label.includes("v8") || label.includes("v10") || label.includes("v12");
  const isBoxer = cat === "flat" || label.includes("boxer") || label.includes("h4") || label.includes("h6");
  const isW = cat === "wbank" || label.includes("w12") || label.includes("w16") || label.includes("w18");

  const valveList = useMemo(() => {
    const list: {
      key: string;
      vBot: { x: number; y: number };
      vTop: { x: number; y: number };
      tiltDeg: number;
      type: "intake" | "exhaust";
      bankSide: "left" | "right" | "inline";
      headRadius: number;
    }[] = [];

    if (isV || isW || isBoxer) {
      let xPositions = [-85, -51, -17, 17, 51, 85];
      if (label.includes("v6") || label.includes("w12")) {
        xPositions = [-38, 0, 38];
      } else if (label.includes("v8") || label.includes("w16")) {
        xPositions = [-54, -18, 18, 54];
      } else if (label.includes("v10")) {
        xPositions = [-70, -35, 0, 35, 70];
      } else if (isBoxer) {
        const isH6 = label.includes("h6") || label.includes("6");
        xPositions = isH6 ? [-50, 0, 50] : [-30, 30];
      }

      xPositions.forEach((boreX, cylIdx) => {
        // Left Bank 4 Valves
        [-5, 5].forEach((dx, vIdx) => {
          const inBot = projectIso({ x: boreX + dx, y: 50, z: 147 }, originScreen);
          const inTop = projectIso({ x: boreX + dx, y: 36, z: 180 }, originScreen);
          list.push({
            key: `lh-in-${cylIdx}-${vIdx}`,
            vBot: inBot,
            vTop: inTop,
            tiltDeg: -25,
            type: "intake",
            bankSide: "left",
            headRadius: 5.5,
          });

          const exBot = projectIso({ x: boreX + dx, y: 38, z: 147 }, originScreen);
          const exTop = projectIso({ x: boreX + dx, y: 52, z: 180 }, originScreen);
          list.push({
            key: `lh-ex-${cylIdx}-${vIdx}`,
            vBot: exBot,
            vTop: exTop,
            tiltDeg: -25,
            type: "exhaust",
            bankSide: "left",
            headRadius: 4.8,
          });
        });

        // Right Bank 4 Valves
        [-5, 5].forEach((dx, vIdx) => {
          const inBot = projectIso({ x: boreX + dx, y: -50, z: 147 }, originScreen);
          const inTop = projectIso({ x: boreX + dx, y: -36, z: 180 }, originScreen);
          list.push({
            key: `rh-in-${cylIdx}-${vIdx}`,
            vBot: inBot,
            vTop: inTop,
            tiltDeg: 25,
            type: "intake",
            bankSide: "right",
            headRadius: 5.5,
          });

          const exBot = projectIso({ x: boreX + dx, y: -38, z: 147 }, originScreen);
          const exTop = projectIso({ x: boreX + dx, y: -52, z: 180 }, originScreen);
          list.push({
            key: `rh-ex-${cylIdx}-${vIdx}`,
            vBot: exBot,
            vTop: exTop,
            tiltDeg: 25,
            type: "exhaust",
            bankSide: "right",
            headRadius: 4.8,
          });
        });
      });
      return list;
    }

    // Inline (I3, I4, I6)
    let inlineX = [-54, -18, 18, 54];
    if (label.includes("i3") || layoutSpec.cyls.length === 3) {
      inlineX = [-38, 0, 38];
    } else if (label.includes("i6") || layoutSpec.cyls.length === 6) {
      inlineX = [-85, -51, -17, 17, 51, 85];
    }

    inlineX.forEach((boreX, cylIdx) => {
      [-5, 5].forEach((dx, vIdx) => {
        const inBot = projectIso({ x: boreX + dx, y: -12, z: 147 }, originScreen);
        const inTop = projectIso({ x: boreX + dx, y: -12, z: 180 }, originScreen);
        list.push({
          key: `inl-in-${cylIdx}-${vIdx}`,
          vBot: inBot,
          vTop: inTop,
          tiltDeg: 0,
          type: "intake",
          bankSide: "inline",
          headRadius: 5.5,
        });

        const exBot = projectIso({ x: boreX + dx, y: 12, z: 147 }, originScreen);
        const exTop = projectIso({ x: boreX + dx, y: 12, z: 180 }, originScreen);
        list.push({
          key: `inl-ex-${cylIdx}-${vIdx}`,
          vBot: exBot,
          vTop: exTop,
          tiltDeg: 0,
          type: "exhaust",
          bankSide: "inline",
          headRadius: 4.8,
        });
      });
    });

    return list;
  }, [isV, isW, isBoxer, label, layoutSpec.cyls.length, originScreen]);

  return (
    <g
      id="iso-valves-assembly"
      onMouseEnter={() => onHoverComponent?.("valves")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {valveList.map((v) => {
        return (
          <g key={`valve-${v.key}`}>
            {/* Valve Stem Line */}
            <line
              x1={v.vBot.x}
              y1={v.vBot.y}
              x2={v.vTop.x}
              y2={v.vTop.y}
              stroke="url(#rod-hbeam-shank)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Helical Beehive Valve Spring Stack */}
            <line
              x1={v.vBot.x}
              y1={v.vBot.y - 4}
              x2={v.vTop.x}
              y2={v.vTop.y + 4}
              stroke="#64748b"
              strokeWidth="6.5"
              strokeDasharray="2 2"
              strokeLinecap="round"
            />
            {/* Titanium Valve Retainer Top Cap */}
            <circle cx={v.vTop.x} cy={v.vTop.y} r="4.5" fill="url(#titanium-anodized)" stroke="#090d16" strokeWidth="0.8" />
            {/* Bottom Valve Head Disc Face */}
            <circle cx={v.vBot.x} cy={v.vBot.y} r={v.headRadius} fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1" />
          </g>
        );
      })}
    </g>
  );
};

export const ValvesIso = React.memo(ValvesIsoComponent);

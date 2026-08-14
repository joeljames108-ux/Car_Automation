import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIso60VEllipse } from "./isoMath";
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
 * Photorealistic 3D Isometric 48-Valve Assembly & Beehive Helical Springs Renderer
 * Perfectly aligned with 60° V12 / V8 / V6 cylinder heads and combustion chambers:
 * - 4 Valves Per Cylinder (2 Intake, 2 Exhaust) = 48 Valves for V12
 * - Left Bank Valves angled @ 30° matching Left Cylinder Bank (Y = +48, Z = 145 to top Y = +32, Z = 180)
 * - Right Bank Valves angled @ 30° matching Right Cylinder Bank (Y = -48, Z = 145 to top Y = -32, Z = 180)
 * - Dual Beehive Helical Valve Springs with progressive pitch coiling & Chrome Stems
 * - Titanium Valve Spring Retainers & Hardened Steel Keepers
 */
export const ValvesIso: React.FC<ValvesIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 };
  const materialGrade = selectedVariants?.valves || "titanium";
  const fills = getIsoMaterialFills(materialGrade);

  const isVEngine = layoutSpec.category === "V" || layoutSpec.label?.includes("V") || layoutSpec.cyls.length >= 8;

  // Build array of 3D valve specifications
  let valveList: {
    key: string;
    vBot: { x: number; y: number };
    vTop: { x: number; y: number };
    tiltDeg: number;
    type: "intake" | "exhaust";
    bankSide: "left" | "right" | "inline";
    headRadius: number;
  }[] = [];

  if (isVEngine) {
    // 48 Valves for 60° V12 (4 Valves per cylinder: 2 Intake, 2 Exhaust)
    for (let cylIdx = 0; cylIdx < 6; cylIdx++) {
      const boreX = -85 + cylIdx * 34;

      // ── LEFT BANK 4 VALVES (Cylinder #cylIdx Left) ──
      // 2 Intake Valves (Outer side Y = +52, Z = 145, top Y = +36, Z = 180)
      [-5, +5].forEach((dx, vSubIdx) => {
        const bot3D = { x: boreX + dx, y: 52, z: 145 };
        const top3D = { x: boreX + dx, y: 36, z: 180 };
        const vBot = projectIso(bot3D, originScreen);
        const vTop = projectIso(top3D, originScreen);
        const tilted = projectIso60VEllipse(bot3D, 6.5, "left", originScreen);

        valveList.push({
          key: `left-intake-${cylIdx}-${vSubIdx}`,
          vBot,
          vTop,
          tiltDeg: tilted.tiltDeg,
          type: "intake",
          bankSide: "left",
          headRadius: 6.5,
        });
      });

      // 2 Exhaust Valves (Inner side Y = +44, Z = 145, top Y = +28, Z = 180)
      [-5, +5].forEach((dx, vSubIdx) => {
        const bot3D = { x: boreX + dx, y: 44, z: 145 };
        const top3D = { x: boreX + dx, y: 28, z: 180 };
        const vBot = projectIso(bot3D, originScreen);
        const vTop = projectIso(top3D, originScreen);
        const tilted = projectIso60VEllipse(bot3D, 5.5, "left", originScreen);

        valveList.push({
          key: `left-exhaust-${cylIdx}-${vSubIdx}`,
          vBot,
          vTop,
          tiltDeg: tilted.tiltDeg,
          type: "exhaust",
          bankSide: "left",
          headRadius: 5.5,
        });
      });

      // ── RIGHT BANK 4 VALVES (Cylinder #cylIdx Right) ──
      // 2 Intake Valves (Outer side Y = -52, Z = 145, top Y = -36, Z = 180)
      [-5, +5].forEach((dx, vSubIdx) => {
        const bot3D = { x: boreX + dx, y: -52, z: 145 };
        const top3D = { x: boreX + dx, y: -36, z: 180 };
        const vBot = projectIso(bot3D, originScreen);
        const vTop = projectIso(top3D, originScreen);
        const tilted = projectIso60VEllipse(bot3D, 6.5, "right", originScreen);

        valveList.push({
          key: `right-intake-${cylIdx}-${vSubIdx}`,
          vBot,
          vTop,
          tiltDeg: tilted.tiltDeg,
          type: "intake",
          bankSide: "right",
          headRadius: 6.5,
        });
      });

      // 2 Exhaust Valves (Inner side Y = -44, Z = 145, top Y = -28, Z = 180)
      [-5, +5].forEach((dx, vSubIdx) => {
        const bot3D = { x: boreX + dx, y: -44, z: 145 };
        const top3D = { x: boreX + dx, y: -28, z: 180 };
        const vBot = projectIso(bot3D, originScreen);
        const vTop = projectIso(top3D, originScreen);
        const tilted = projectIso60VEllipse(bot3D, 5.5, "right", originScreen);

        valveList.push({
          key: `right-exhaust-${cylIdx}-${vSubIdx}`,
          vBot,
          vTop,
          tiltDeg: tilted.tiltDeg,
          type: "exhaust",
          bankSide: "right",
          headRadius: 5.5,
        });
      });
    }
  } else {
    // Standard Inline Valve Array
    layoutSpec.cyls.forEach((cxPos, cylIdx) => {
      const normX = (cxPos - layoutSpec.bx - layoutSpec.bw / 2) * 0.65;
      [-10, 10].forEach((bankY, vSubIdx) => {
        const vBot = projectIso({ x: normX, y: bankY, z: 145 }, originScreen);
        const vTop = projectIso({ x: normX, y: bankY, z: 182 }, originScreen);
        valveList.push({
          key: `inline-valve-${cylIdx}-${vSubIdx}`,
          vBot,
          vTop,
          tiltDeg: 0,
          type: vSubIdx === 0 ? "intake" : "exhaust",
          bankSide: "inline",
          headRadius: 6,
        });
      });
    });
  }

  return (
    <g
      id="iso-valves-aligned-60deg"
      onMouseEnter={() => onHoverComponent?.("valves")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {valveList.map((valve) => {
        const { key, vBot, vTop, type, headRadius, tiltDeg } = valve;

        return (
          <g key={key}>
            {/* 1. Bronze Valve Guide Sleeve */}
            <line
              x1={vTop.x}
              y1={vTop.y + 8}
              x2={vBot.x}
              y2={vBot.y - 12}
              stroke="#b45309"
              strokeWidth="5.5"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* 2. Polished Chrome Valve Stem Line along 3D Stem Axis */}
            <line
              x1={vTop.x}
              y1={vTop.y}
              x2={vBot.x}
              y2={vBot.y}
              stroke="url(#bearing-saddle-chrome)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <line
              x1={vTop.x - 0.7}
              y1={vTop.y}
              x2={vBot.x - 0.7}
              y2={vBot.y}
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.95"
            />

            {/* 3. Helical Beehive Valve Spring Coils (7 Progressive Coils — wider, brighter) */}
            {[0.12, 0.24, 0.36, 0.48, 0.60, 0.72, 0.84].map((factor, sIdx) => {
              const coilX = vTop.x + (vBot.x - vTop.x) * factor;
              const coilY = vTop.y + (vBot.y - vTop.y) * factor;
              // Beehive profile: wider at base, narrow at top
              const coilRadius = 4.5 + factor * 3.2;

              return (
                <g key={`spring-coil-${sIdx}`}>
                  {/* Main coil wire */}
                  <ellipse
                    cx={coilX}
                    cy={coilY}
                    rx={coilRadius}
                    ry={coilRadius * 0.45}
                    fill="none"
                    stroke="#c8d2e0"
                    strokeWidth="2.2"
                    transform={tiltDeg ? `rotate(${tiltDeg}, ${coilX}, ${coilY})` : undefined}
                  />
                  {/* Bright specular highlight on coil wire */}
                  <ellipse
                    cx={coilX}
                    cy={coilY - 0.6}
                    rx={coilRadius - 0.5}
                    ry={(coilRadius - 0.5) * 0.45}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.1"
                    opacity="0.9"
                    transform={tiltDeg ? `rotate(${tiltDeg}, ${coilX}, ${coilY})` : undefined}
                  />
                  {/* Shadow underside of coil wire */}
                  <ellipse
                    cx={coilX}
                    cy={coilY + 0.8}
                    rx={coilRadius - 0.3}
                    ry={(coilRadius - 0.3) * 0.45}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1"
                    opacity="0.5"
                    transform={tiltDeg ? `rotate(${tiltDeg}, ${coilX}, ${coilY})` : undefined}
                  />
                </g>
              );
            })}

            {/* 4. Titanium Top Spring Retainer Cap & Hardened Keepers */}
            <g transform={tiltDeg ? `rotate(${tiltDeg}, ${vTop.x}, ${vTop.y})` : undefined}>
              {/* Retainer washer (larger for visibility) */}
              <ellipse
                cx={vTop.x}
                cy={vTop.y}
                rx="7.5"
                ry="3.5"
                fill="url(#bolt-boss-raised)"
                stroke="#090d16"
                strokeWidth="1.4"
              />
              {/* Specular ring on retainer */}
              <ellipse
                cx={vTop.x}
                cy={vTop.y}
                rx="6.5"
                ry="3"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="0.8"
                opacity="0.7"
              />
              {/* Keeper collet center hole */}
              <circle cx={vTop.x} cy={vTop.y} r="2" fill="#020617" stroke="#e2e8f0" strokeWidth="0.9" />
            </g>

            {/* 4b. Bottom Spring Seat Washer (at base of spring) */}
            {(() => {
              const seatX = vTop.x + (vBot.x - vTop.x) * 0.92;
              const seatY = vTop.y + (vBot.y - vTop.y) * 0.92;
              return (
                <g transform={tiltDeg ? `rotate(${tiltDeg}, ${seatX}, ${seatY})` : undefined}>
                  <ellipse
                    cx={seatX}
                    cy={seatY}
                    rx="8"
                    ry="3.5"
                    fill="url(#bolt-boss-raised)"
                    stroke="#090d16"
                    strokeWidth="1"
                    opacity="0.7"
                  />
                </g>
              );
            })()}

            {/* 5. Mushroom Valve Disc Head at Combustion Chamber Deck */}
            <g transform={tiltDeg ? `rotate(${tiltDeg}, ${vBot.x}, ${vBot.y})` : undefined}>
              <ellipse
                cx={vBot.x}
                cy={vBot.y}
                rx={headRadius}
                ry={headRadius * 0.48}
                fill={type === "intake" ? fills.top : "#334155"}
                stroke="#090d16"
                strokeWidth="1.6"
              />
              {/* 45° Machined Seating Bevel Lip */}
              <ellipse
                cx={vBot.x}
                cy={vBot.y}
                rx={headRadius - 1}
                ry={(headRadius - 1) * 0.48}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.9"
              />
            </g>
          </g>
        );
      })}
    </g>
  );
};

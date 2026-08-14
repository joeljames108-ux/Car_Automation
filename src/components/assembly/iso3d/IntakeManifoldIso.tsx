import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIso60VEllipse } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface IntakeManifoldIsoProps {
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
 * Photorealistic 3D Isometric Individual Velocity Stack (ITB) Intake System
 *
 * 12 chrome-polished trumpet funnels (6 per bank) replacing the former plenum boxes.
 * Each stack features:
 * - Tapered bell-mouth trumpet body with chrome gradient
 * - Visible brass butterfly throttle disc inside
 * - Individual port mounting flange ring
 * - Anodized red fuel rail with injectors between stacks
 */
export const IntakeManifoldIso: React.FC<IntakeManifoldIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O = { x: 250, y: 215 };
  const materialGrade = selectedVariants?.intake_manifold || "carbon";
  const fills = getIsoMaterialFills(materialGrade);

  const isVEngine = layoutSpec.category === "V" || layoutSpec.label?.includes("V") || layoutSpec.cyls.length >= 8;

  // Bore positions matching V12 block (6 per bank, 34px spacing starting at -85)
  const BORE_SPACING = 34;
  const BORE_START_X = -85;
  const borePositions = Array.from({ length: 6 }, (_, i) => BORE_START_X + i * BORE_SPACING);

  // Bank bore center coordinates (matching VBankBlockCastingIso)
  const LEFT_BORE_Y = 48;
  const LEFT_BORE_Z = 145;
  const RIGHT_BORE_Y = -48;
  const RIGHT_BORE_Z = 145;

  // Velocity stack dimensions
  const STACK_HEIGHT = 42;      // Total height of each trumpet
  const STACK_BASE_R = 8;       // Radius at port base (narrow)
  const STACK_MOUTH_R = 14;     // Radius at top bellmouth (wide)
  const STACK_MID_R = 7;        // Narrowest waist

  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, O);

  /**
   * Render a single velocity stack trumpet at given bank position
   */
  const renderVelocityStack = (
    boreX: number,
    boreY: number,
    boreZ: number,
    bank: "left" | "right",
    idx: number,
    prefix: string
  ) => {
    // Stack position: sits on top of the bore, extending upward
    const portBase = P(boreX, boreY, boreZ + 2);   // Bottom (port flange)
    const stackWaist = P(boreX, boreY, boreZ + 18); // Narrowest point
    const stackMouth = P(boreX, boreY, boreZ + STACK_HEIGHT); // Top bellmouth

    // Get tilted bore ellipse for port flange alignment
    const boreEllipse = projectIso60VEllipse(
      { x: boreX, y: boreY, z: boreZ },
      STACK_BASE_R, bank, O
    );

    // Bellmouth ellipse (larger, at top)
    const mouthEllipse = projectIso60VEllipse(
      { x: boreX, y: boreY, z: boreZ + STACK_HEIGHT },
      STACK_MOUTH_R, bank, O
    );

    // Waist ellipse (narrowest)
    const waistEllipse = projectIso60VEllipse(
      { x: boreX, y: boreY, z: boreZ + 18 },
      STACK_MID_R, bank, O
    );

    // Trumpet body curvature — left/right sides of the trumpet profile
    const bodyLeftBase = P(boreX, boreY + (bank === "left" ? STACK_BASE_R : -STACK_BASE_R), boreZ + 2);
    const bodyRightBase = P(boreX, boreY + (bank === "left" ? -STACK_BASE_R : STACK_BASE_R), boreZ + 2);
    const bodyLeftWaist = P(boreX, boreY + (bank === "left" ? STACK_MID_R : -STACK_MID_R), boreZ + 18);
    const bodyRightWaist = P(boreX, boreY + (bank === "left" ? -STACK_MID_R : STACK_MID_R), boreZ + 18);
    const bodyLeftMouth = P(boreX, boreY + (bank === "left" ? STACK_MOUTH_R : -STACK_MOUTH_R), boreZ + STACK_HEIGHT);
    const bodyRightMouth = P(boreX, boreY + (bank === "left" ? -STACK_MOUTH_R : STACK_MOUTH_R), boreZ + STACK_HEIGHT);

    return (
      <g key={`${prefix}-velocity-stack-${idx}`}>
        {/* Trumpet body — chrome polished bell curve */}
        <path
          d={`M ${bodyLeftBase.x} ${bodyLeftBase.y}
              Q ${bodyLeftWaist.x - 2} ${bodyLeftWaist.y} ${bodyLeftMouth.x} ${bodyLeftMouth.y}
              L ${bodyRightMouth.x} ${bodyRightMouth.y}
              Q ${bodyRightWaist.x + 2} ${bodyRightWaist.y} ${bodyRightBase.x} ${bodyRightBase.y}
              Z`}
          fill="url(#chrome-polished-trumpet)"
          stroke="#090d16"
          strokeWidth="1.8"
        />

        {/* Specular highlight streak down center of trumpet */}
        <path
          d={`M ${(bodyLeftBase.x + bodyRightBase.x) / 2} ${(bodyLeftBase.y + bodyRightBase.y) / 2 - 1}
              Q ${(bodyLeftWaist.x + bodyRightWaist.x) / 2} ${(bodyLeftWaist.y + bodyRightWaist.y) / 2 - 2} ${(bodyLeftMouth.x + bodyRightMouth.x) / 2} ${(bodyLeftMouth.y + bodyRightMouth.y) / 2 - 1}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Second highlight line (chrome double-reflection) */}
        <path
          d={`M ${bodyLeftBase.x + 3} ${bodyLeftBase.y - 0.5}
              Q ${bodyLeftWaist.x + 1} ${bodyLeftWaist.y - 1} ${bodyLeftMouth.x + 2} ${bodyLeftMouth.y - 0.5}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Top bellmouth opening — dark interior */}
        <ellipse
          cx={mouthEllipse.cx}
          cy={mouthEllipse.cy}
          rx={mouthEllipse.rx}
          ry={mouthEllipse.ry}
          fill="url(#velocity-stack-bellmouth)"
          stroke="#090d16"
          strokeWidth="1.5"
          transform={`rotate(${mouthEllipse.tiltDeg}, ${mouthEllipse.cx}, ${mouthEllipse.cy})`}
        />

        {/* Bellmouth electric blue anodized outer lip ring (matching reference image) */}
        <ellipse
          cx={mouthEllipse.cx}
          cy={mouthEllipse.cy}
          rx={mouthEllipse.rx + 2.5}
          ry={mouthEllipse.ry + 1.8}
          fill="url(#electric-blue-lip)"
          stroke="#090d16"
          strokeWidth="1.8"
          transform={`rotate(${mouthEllipse.tiltDeg}, ${mouthEllipse.cx}, ${mouthEllipse.cy})`}
        />

        {/* Inner chrome rim highlight on blue lip */}
        <ellipse
          cx={mouthEllipse.cx}
          cy={mouthEllipse.cy}
          rx={mouthEllipse.rx + 0.5}
          ry={mouthEllipse.ry + 0.3}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.95"
          transform={`rotate(${mouthEllipse.tiltDeg}, ${mouthEllipse.cx}, ${mouthEllipse.cy})`}
        />

        {/* Brass butterfly valve disc visible inside (angled) */}
        <ellipse
          cx={mouthEllipse.cx}
          cy={mouthEllipse.cy}
          rx={mouthEllipse.rx * 0.35}
          ry={mouthEllipse.ry * 0.9}
          fill="url(#brass-butterfly-disc)"
          stroke="#92400e"
          strokeWidth="0.8"
          opacity="0.7"
          transform={`rotate(${mouthEllipse.tiltDeg + 25}, ${mouthEllipse.cx}, ${mouthEllipse.cy})`}
        />

        {/* Port mounting flange ring at base */}
        <ellipse
          cx={boreEllipse.cx}
          cy={boreEllipse.cy}
          rx={boreEllipse.rx + 3}
          ry={boreEllipse.ry + 2}
          fill="url(#bolt-boss-raised)"
          stroke="#090d16"
          strokeWidth="1.3"
          transform={`rotate(${boreEllipse.tiltDeg}, ${boreEllipse.cx}, ${boreEllipse.cy})`}
        />

        {/* 2 flange mounting bolts per stack (gold accent) */}
        {[-1, 1].map((side) => {
          const boltPt = P(
            boreX + side * (STACK_BASE_R + 2),
            boreY,
            boreZ + 4
          );
          return (
            <circle
              key={`${prefix}-stack-bolt-${idx}-${side}`}
              cx={boltPt.x}
              cy={boltPt.y}
              r="1.8"
              fill="url(#gold-anodized-bolt)"
              stroke="#78350f"
              strokeWidth="0.6"
            />
          );
        })}
      </g>
    );
  };

  /**
   * Render a fuel rail with injectors for a bank
   */
  const renderFuelRail = (
    boreY: number,
    boreZ: number,
    bank: "left" | "right",
    prefix: string
  ) => {
    const railZ = boreZ + 12; // Rail sits between port base and waist
    const railStartPt = P(BORE_START_X - 10, boreY, railZ);
    const railEndPt = P(BORE_START_X + 5 * BORE_SPACING + 10, boreY, railZ);

    return (
      <g id={`${prefix}-fuel-rail-system`}>
        {/* Main fuel rail tube (anodized red) */}
        <line
          x1={railStartPt.x} y1={railStartPt.y}
          x2={railEndPt.x} y2={railEndPt.y}
          stroke="url(#anodized-fuel-rail)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Rail highlight streak */}
        <line
          x1={railStartPt.x} y1={railStartPt.y - 1.5}
          x2={railEndPt.x} y2={railEndPt.y - 1.5}
          stroke="#fca5a5"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Fuel rail end fitting (AN fitting) */}
        <circle
          cx={railEndPt.x + 4}
          cy={railEndPt.y}
          r="4"
          fill="url(#bolt-boss-raised)"
          stroke="#090d16"
          strokeWidth="1.2"
        />

        {/* Individual fuel injectors — 6 per rail */}
        {borePositions.map((boreX, idx) => {
          const injBase = P(boreX, boreY, railZ);
          const injTip = P(boreX, boreY, boreZ + 3);
          return (
            <g key={`${prefix}-injector-${idx}`}>
              {/* Injector body */}
              <line
                x1={injBase.x} y1={injBase.y}
                x2={injTip.x} y2={injTip.y}
                stroke="#0f172a"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Injector connector (electrical) */}
              <circle cx={injBase.x} cy={injBase.y} r="2.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              {/* Injector nozzle tip */}
              <circle cx={injTip.x} cy={injTip.y} r="1.5" fill="#475569" stroke="#090d16" strokeWidth="0.6" />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <g
      id="iso-intake-manifold-v12-velocity-stacks"
      onMouseEnter={() => onHoverComponent?.("intake_manifold")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {isVEngine ? (
        /* ── 12 INDIVIDUAL VELOCITY STACK TRUMPETS FOR V12 (6 per bank) ── */
        <g id="v12-velocity-stack-intake-system">
          {/* ── RIGHT BANK (rear/distal) — render first for depth sorting ── */}
          <g id="right-bank-velocity-stacks">
            {borePositions.map((boreX, idx) =>
              renderVelocityStack(boreX, RIGHT_BORE_Y, RIGHT_BORE_Z, "right", idx, "right")
            )}
            {renderFuelRail(RIGHT_BORE_Y, RIGHT_BORE_Z, "right", "right")}
          </g>

          {/* ── LEFT BANK (front/proximal) — render second (in front) ── */}
          <g id="left-bank-velocity-stacks">
            {borePositions.map((boreX, idx) =>
              renderVelocityStack(boreX, LEFT_BORE_Y, LEFT_BORE_Z, "left", idx, "left")
            )}
            {renderFuelRail(LEFT_BORE_Y, LEFT_BORE_Z, "left", "left")}
          </g>
        </g>
      ) : (
        /* Standard Single Stack Row for Inline Engine */
        <g id="inline-intake-system">
          {borePositions.map((boreX, idx) =>
            renderVelocityStack(boreX, 0, 145, "left", idx, "inline")
          )}
        </g>
      )}
    </g>
  );
};

import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12ValveCoversIsoProps {
  originScreen?: ScreenPoint2D;
  explodedAmount?: number;
  componentState?: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PHASE 9 — 60° V12 VIBRANT ORANGE-GOLD ANODIZED VALVE COVERS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Left (Bank 1) and Right (Bank 2) CNC Billet Aluminum Valve Covers
 * with sculpted arched camshaft tunnels, filleted spark plug valley
 * gutters, and vibrant orange-gold anodized finish.
 */
export const V12ValveCoversIso: React.FC<V12ValveCoversIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  componentState,
  onHoverComponent,
}) => {
  const expZ = explodedAmount * 28;

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z: z + expZ }, originScreen),
    [originScreen, expZ]
  );

  const blockLength = 236;
  const coverLength = blockLength - 16;
  const halfCL = coverLength / 2;
  const coverHeight = 22;
  const coverZBase = 124;

  const geometry = useMemo(() => {
    // Bank 1 (Left / Front) Valve Cover
    const b1BotFL = P(-halfCL, 40, coverZBase);
    const b1BotFR = P(halfCL, 40, coverZBase);
    const b1BotBL = P(-halfCL, 8, coverZBase + 14);
    const b1BotBR = P(halfCL, 8, coverZBase + 14);

    const b1TopFL = P(-halfCL, 40, coverZBase + coverHeight);
    const b1TopFR = P(halfCL, 40, coverZBase + coverHeight);
    const b1TopBL = P(-halfCL, 8, coverZBase + coverHeight + 14);
    const b1TopBR = P(halfCL, 8, coverZBase + coverHeight + 14);

    // Bank 1 Arched Camshaft Tunnel Crown (Upper Peak)
    const b1CamPeakFL = P(-halfCL, 24, coverZBase + coverHeight + 6);
    const b1CamPeakFR = P(halfCL, 24, coverZBase + coverHeight + 6);

    // Bank 2 (Right / Rear) Valve Cover
    const b2BotFL = P(-halfCL, -8, coverZBase + 14);
    const b2BotFR = P(halfCL, -8, coverZBase + 14);
    const b2BotBL = P(-halfCL, -40, coverZBase);
    const b2BotBR = P(halfCL, -40, coverZBase);

    const b2TopFL = P(-halfCL, -8, coverZBase + coverHeight + 14);
    const b2TopFR = P(halfCL, -8, coverZBase + coverHeight + 14);
    const b2TopBL = P(-halfCL, -40, coverZBase + coverHeight);
    const b2TopBR = P(halfCL, -40, coverZBase + coverHeight);

    // Bank 2 Arched Camshaft Tunnel Crown (Upper Peak)
    const b2CamPeakFL = P(-halfCL, -24, coverZBase + coverHeight + 6);
    const b2CamPeakFR = P(halfCL, -24, coverZBase + coverHeight + 6);

    // Bank 1 6x Spark Plug Well Access Holes
    const b1SparkPlugs: ScreenPoint2D[] = [];
    const cylPitch = (coverLength - 36) / 5;
    for (let i = 0; i < 6; i++) {
      const cx = -halfCL + 18 + i * cylPitch;
      b1SparkPlugs.push(P(cx, 24, coverZBase + coverHeight + 7));
    }

    // Billet Oil Filler Cap on Bank 1 Front
    const oilCapPt = P(-halfCL + 16, 34, coverZBase + coverHeight + 5);

    return {
      b1BotFL, b1BotFR, b1BotBL, b1BotBR,
      b1TopFL, b1TopFR, b1TopBL, b1TopBR,
      b1CamPeakFL, b1CamPeakFR,
      b2BotFL, b2BotFR, b2BotBL, b2BotBR,
      b2TopFL, b2TopFR, b2TopBL, b2TopBR,
      b2CamPeakFL, b2CamPeakFR,
      b1SparkPlugs,
      oilCapPt,
    };
  }, [P, coverLength, halfCL, coverHeight, coverZBase]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-valve-covers-3d"
      onMouseEnter={() => onHoverComponent?.("cylinder_head")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-500 ease-out"
      style={{
        opacity,
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
      }}
    >
      <defs>
        {/* Vibrant Orange-Gold Anodized Aluminum Shader */}
        <linearGradient id="v12-anodized-orange-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#ea580c" />
          <stop offset="85%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>

        <linearGradient id="v12-valve-specular-ridge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#fef08a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* ── BANK 2 (RIGHT) VALVE COVER WITH ARCHED CAM TUNNELS ── */}
      <path
        d={`M ${geometry.b2BotBL.x} ${geometry.b2BotBL.y}
            L ${geometry.b2BotBR.x} ${geometry.b2BotBR.y}
            L ${geometry.b2TopBR.x} ${geometry.b2TopBR.y}
            L ${geometry.b2TopBL.x} ${geometry.b2TopBL.y} Z`}
        fill="url(#v12-anodized-orange-gold)"
        stroke="#090d16"
        strokeWidth="1.6"
      />
      {/* Curved Arched Top Face on Bank 2 */}
      <path
        d={`M ${geometry.b2TopBL.x} ${geometry.b2TopBL.y}
            Q ${geometry.b2CamPeakFL.x} ${geometry.b2CamPeakFL.y} ${geometry.b2TopFL.x} ${geometry.b2TopFL.y}
            L ${geometry.b2TopFR.x} ${geometry.b2TopFR.y}
            Q ${geometry.b2CamPeakFR.x} ${geometry.b2CamPeakFR.y} ${geometry.b2TopBR.x} ${geometry.b2TopBR.y}
            Z`}
        fill="url(#v12-anodized-orange-gold)"
        stroke="#090d16"
        strokeWidth="1.6"
      />

      {/* ── BANK 1 (LEFT) VALVE COVER WITH ARCHED CAM TUNNELS ── */}
      <path
        d={`M ${geometry.b1BotFL.x} ${geometry.b1BotFL.y}
            L ${geometry.b1BotFR.x} ${geometry.b1BotFR.y}
            L ${geometry.b1TopFR.x} ${geometry.b1TopFR.y}
            L ${geometry.b1TopFL.x} ${geometry.b1TopFL.y} Z`}
        fill="url(#v12-anodized-orange-gold)"
        stroke="#090d16"
        strokeWidth="1.6"
      />
      {/* Curved Arched Top Face on Bank 1 */}
      <path
        d={`M ${geometry.b1TopFL.x} ${geometry.b1TopFL.y}
            Q ${geometry.b1CamPeakFL.x} ${geometry.b1CamPeakFL.y} ${geometry.b1TopBL.x} ${geometry.b1TopBL.y}
            L ${geometry.b1TopBR.x} ${geometry.b1TopBR.y}
            Q ${geometry.b1CamPeakFR.x} ${geometry.b1CamPeakFR.y} ${geometry.b1TopFR.x} ${geometry.b1TopFR.y}
            Z`}
        fill="url(#v12-anodized-orange-gold)"
        stroke="#090d16"
        strokeWidth="1.6"
      />

      {/* Specular Arched Crown Ridge Glint */}
      <path
        d={`M ${geometry.b1CamPeakFL.x} ${geometry.b1CamPeakFL.y}
            L ${geometry.b1CamPeakFR.x} ${geometry.b1CamPeakFR.y}`}
        stroke="url(#v12-valve-specular-ridge)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* ── 6 SPARK PLUG ACCESS GROMMETS ON BANK 1 ── */}
      {geometry.b1SparkPlugs.map((pt, idx) => (
        <g key={`spark-grommet-${idx}`}>
          <ellipse cx={pt.x} cy={pt.y} rx={5.5} ry={3.2} fill="#1e293b" stroke="#090d16" strokeWidth="0.8" />
          <ellipse cx={pt.x} cy={pt.y} rx={4.0} ry={2.2} fill="#090d16" stroke="#ca8a04" strokeWidth="0.6" />
          <circle cx={pt.x} cy={pt.y} r={1.5} fill="#fef08a" />
        </g>
      ))}

      {/* ── BILLET OIL FILLER CAP WITH KNURLED FLANGE ── */}
      <g transform={`translate(${geometry.oilCapPt.x}, ${geometry.oilCapPt.y})`}>
        <ellipse cx={0} cy={0} rx={7.5} ry={4.5} fill="#78350f" stroke="#090d16" strokeWidth="1.2" />
        <ellipse cx={0} cy={-1.5} rx={6.0} ry={3.5} fill="url(#v12-anodized-orange-gold)" stroke="#fef08a" strokeWidth="0.8" />
        <line x1={-3} y1={-1.5} x2={3} y2={-1.5} stroke="#090d16" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </g>
  );
};

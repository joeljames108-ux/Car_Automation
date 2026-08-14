import React from "react";
import type { ComponentId, AssemblyPhase, AssemblyComponentMeta } from "../../../sim/assemblyTypes";
import { getComponentTorqueDisplay } from "../assemblyUIHelpers";

interface RoboticGantryArmOverlayProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
  startPos?: { x: number; y: number };
  meta?: AssemblyComponentMeta;
}

export const RoboticGantryArmOverlay: React.FC<RoboticGantryArmOverlayProps> = ({
  activeComponentId,
  phase,
  targetPos,
  startPos = { x: 50, y: 380 },
  meta,
}) => {
  if (!activeComponentId || phase === "idle" || phase === "complete") return null;

  // Determine current robotic arm position based on assembly phase interpolation
  let armX = targetPos.x;
  let armY = targetPos.y;
  let armAngle = 0;
  let gripperExtension = 0;
  let toolRotation = 0;

  switch (phase) {
    case "picking":
      armX = startPos.x;
      armY = startPos.y - 40;
      armAngle = -25;
      gripperExtension = 20;
      break;
    case "traveling":
      armX = (startPos.x + targetPos.x) / 2;
      armY = Math.min(startPos.y, targetPos.y) - 90;
      armAngle = -10;
      gripperExtension = 10;
      break;
    case "aligning":
      armX = targetPos.x;
      armY = targetPos.y - 50;
      armAngle = 0;
      gripperExtension = 5;
      break;
    case "inserting":
      armX = targetPos.x;
      armY = targetPos.y - 15;
      armAngle = 0;
      gripperExtension = 0;
      toolRotation = 45;
      break;
    case "locking":
      armX = targetPos.x;
      armY = targetPos.y;
      armAngle = 0;
      gripperExtension = -5;
      toolRotation = 180;
      break;
    case "confirming":
      armX = targetPos.x;
      armY = targetPos.y - 25;
      armAngle = 5;
      gripperExtension = 15;
      break;
  }

  // Calculate inverse kinematics joint coordinates for 2-segment arm
  const baseRailY = 25;
  const shoulderX = armX;
  const shoulderY = baseRailY + 20;

  // Mid elbow joint
  const elbowX = shoulderX + 45 * Math.sin((armAngle * Math.PI) / 180);
  const elbowY = shoulderY + (armY - shoulderY) * 0.55;

  return (
    <g id="robotic-gantry-system" className="pointer-events-none z-40 transition-all duration-300 ease-out">
      {/* ── TOP INDUSTRIAL GANTRY RAIL SYSTEM ── */}
      <g stroke="#090d16" strokeWidth="2.5">
        {/* Top Heavy-Duty Steel Structural Rail Beam */}
        <rect x="20" y="10" width="460" height="22" rx="4" fill="url(#titanium-dark)" />
        <rect x="22" y="12" width="456" height="18" rx="3" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />

        {/* Gear Rack Drive Teeth Across Rail */}
        {Array.from({ length: 45 }).map((_, i) => (
          <line
            key={i}
            x1={30 + i * 10}
            y1="14"
            x2={30 + i * 10}
            y2="28"
            stroke="#475569"
            strokeWidth="1.5"
          />
        ))}

        {/* High-Voltage Energy Cable Track Drag Chain */}
        <path
          d={`M 25 15 C 60 15, ${shoulderX - 30} 15, ${shoulderX} 25`}
          fill="none"
          stroke="#f97316"
          strokeWidth="4"
          strokeDasharray="4 2"
        />
      </g>

      {/* ── ARM 1: PRIMARY GANTRY CARRIAGE & 6-AXIS ARTICULATED MANIPULATOR ── */}
      <g transform={`translate(${shoulderX - 25}, ${baseRailY - 5})`}>
        {/* Gantry Truck Motor Carriage */}
        <rect x="0" y="0" width="50" height="24" rx="5" fill="url(#billet-chrome)" stroke="#090d16" strokeWidth="2.5" />
        <rect x="3" y="3" width="44" height="18" rx="3" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.9" />

        {/* Roller Bearing Wheels on Rail */}
        <circle cx="8" cy="4" r="4.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />
        <circle cx="42" cy="4" r="4.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />

        {/* Servo Motor Status LED */}
        <circle cx="25" cy="12" r="3" fill={phase === "locking" ? "#ef4444" : "#10b981"}>
          <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* ── ARTICULATED ROBOTIC ARM BOOMS & HYDRAULIC PISTONS ── */}
      <g stroke="#090d16" strokeWidth="2.5">
        {/* Shoulder Rotary Joint Hub */}
        <circle cx={shoulderX} cy={shoulderY} r="14" fill="url(#titanium-dark)" />
        <circle cx={shoulderX} cy={shoulderY} r="9" fill="url(#billet-chrome)" />
        <circle cx={shoulderX} cy={shoulderY} r="4" fill="#38bdf8" />

        {/* Upper Arm Metallic Boom Segment */}
        <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="url(#billet-chrome)" strokeWidth="14" strokeLinecap="round" />
        <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

        {/* Parallel Hydraulic Actuator Cylinder */}
        <line
          x1={shoulderX - 10}
          y1={shoulderY + 5}
          x2={elbowX - 10}
          y2={elbowY + 5}
          stroke="#f97316"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Elbow Joint Rotary Encoder */}
        <circle cx={elbowX} cy={elbowY} r="11" fill="url(#titanium-dark)" />
        <circle cx={elbowX} cy={elbowY} r="6" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Forearm Segment */}
        <line x1={elbowX} y1={elbowY} x2={armX} y2={armY - 20} stroke="url(#billet-chrome)" strokeWidth="10" strokeLinecap="round" />
        <line x1={elbowX} y1={elbowY} x2={armX} y2={armY - 20} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

        {/* Wrist 3-Axis Joint Spherical Motor */}
        <circle cx={armX} cy={armY - 20} r="8" fill="url(#gold-hub)" />
      </g>

      {/* ── END EFFECTOR: QUAD VACUUM MAGNETIC SUCTION CUPS ── */}
      <g transform={`translate(${armX}, ${armY - 10})`}>
        {/* End-Effector Mounting Plate */}
        <rect x="-32" y="0" width="64" height="10" rx="3" fill="url(#titanium-dark)" stroke="#090d16" strokeWidth="2" />

        {/* Suction Cup Extensions */}
        {[-22, -7, 7, 22].map((xOff, i) => (
          <g key={i} transform={`translate(${xOff}, 10)`}>
            <rect x="-3" y="0" width="6" height={12 + gripperExtension} fill="#475569" stroke="#090d16" strokeWidth="1" />
            <path
              d={`M -7 ${12 + gripperExtension} L 7 ${12 + gripperExtension} L 5 ${18 + gripperExtension} L -5 ${18 + gripperExtension} Z`}
              fill="#020617"
              stroke="#38bdf8"
              strokeWidth="1.2"
            />
            {/* Glowing Magnetic Vacuum Sensor Core */}
            <circle cx="0" cy={15 + gripperExtension} r="2.5" fill="#38bdf8">
              <animate attributeName="fill" values="#38bdf8;#f59e0b;#38bdf8" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </g>

      {/* ── ARM 2: SECONDARY PRECISION ELECTRIC TORQUE SCREWDRIVER ARM ── */}
      {(phase === "inserting" || phase === "locking") && (
        <g transform={`translate(${armX + 40}, ${armY - 40})`} className="animate-pulse">
          {/* Torque Driver Housing */}
          <rect x="-10" y="-30" width="20" height="40" rx="4" fill="url(#gold-hub)" stroke="#090d16" strokeWidth="2" />
          <rect x="-4" y="10" width="8" height="25" fill="#e2e8f0" stroke="#090d16" strokeWidth="1" />

          {/* Spinning Electric Bit Ring */}
          <g transform={`rotate(${toolRotation}, 0, 35)`}>
            <polygon points="-6,30 6,30 0,42" fill="#38bdf8" stroke="#090d16" strokeWidth="1" />
          </g>

          {/* Digital Nm Torque Telemetry Badge */}
          <rect x="14" y="-20" width="75" height="18" rx="3" fill="#020617" stroke="#f59e0b" strokeWidth="1.2" />
          <text x="51" y="-8" fill="#f59e0b" fontSize="7.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            {getComponentTorqueDisplay(meta, phase)}
          </text>
        </g>
      )}
    </g>
  );
};

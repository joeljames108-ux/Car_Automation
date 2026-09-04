/**
 * ============================================================================
 * VEHICLE SILHOUETTE VIEWER 3D (CAD & ISOMETRIC PROJECTION ENGINE)
 * ============================================================================
 * High-performance 3D projection canvas rendering authentic silhouettes,
 * 360° orbital rotation, exploded component separation, and anatomical hotspots
 * for all 18 vehicle categories without exceeding browser WebGL context limits.
 */

import React, { useRef, useEffect, useState, useMemo } from "react";
import { RotateCw, Layers, Eye, Crosshair } from "lucide-react";
import { VehicleCategoryId } from "../../../sim/modularVehicle/vehicleTypeRegistry";

interface VehicleSilhouetteViewer3DProps {
  categoryId: VehicleCategoryId;
  isInteractive?: boolean;
  accentColor?: string;
  initialMode?: "orbit" | "exploded" | "anatomy";
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const VehicleSilhouetteViewer3D: React.FC<VehicleSilhouetteViewer3DProps> = ({
  categoryId,
  isInteractive = true,
  accentColor = "#f59e0b",
  initialMode = "orbit",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<"orbit" | "exploded" | "anatomy">(initialMode);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const rotationRef = useRef<number>(categoryId.charCodeAt(0) * 0.4);
  const pitchRef = useRef<number>(0.28);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle drag for free orbit camera
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsRotating(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    rotationRef.current += dx * 0.012;
    pitchRef.current = Math.max(0.05, Math.min(0.65, pitchRef.current + dy * 0.008));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      if (isRotating && !isDraggingRef.current) {
        rotationRef.current += 0.014;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;
      const scale = width * 0.38;

      const yaw = rotationRef.current;
      const pitch = pitchRef.current;

      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      // 3D to 2D projection function
      const project = (p: Point3D): { x: number; y: number; z: number } => {
        // Rotate around Y (yaw)
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;

        // Rotate around X (pitch)
        const y2 = p.y * cosP - z1 * sinP;
        const z2 = p.y * sinP + z1 * cosP;

        // Perspective depth factor
        const fov = 3.5;
        const depth = fov / (fov + z2);

        return {
          x: cx + x1 * scale * depth,
          y: cy - y2 * scale * depth,
          z: z2,
        };
      };

      // 1. Draw Technical Datum Grid
      ctx.strokeStyle = "rgba(245, 158, 11, 0.08)";
      ctx.lineWidth = 1;
      const gridCount = 5;
      for (let i = -gridCount; i <= gridCount; i++) {
        const p1 = project({ x: -1.2, y: -0.4, z: (i / gridCount) * 1.2 });
        const p2 = project({ x: 1.2, y: -0.4, z: (i / gridCount) * 1.2 });
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project({ x: (i / gridCount) * 1.2, y: -0.4, z: -1.2 });
        const p4 = project({ x: (i / gridCount) * 1.2, y: -0.4, z: 1.2 });
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // Generate category-specific 3D geometry nodes
      const { chassisLines, bodyPolygons, wheelNodes, anatomyHotspots } = getCategory3DGeometry(categoryId, mode);

      // Draw Wheels
      wheelNodes.forEach((w) => {
        const center = project(w.pos);
        const radius = w.radius * scale * (3.5 / (3.5 + center.z));
        ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rim inner hub
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius * 0.55, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw Chassis Frame Rails
      ctx.strokeStyle = mode === "exploded" ? "#38bdf8" : "rgba(245, 158, 11, 0.5)";
      ctx.lineWidth = mode === "exploded" ? 2 : 1.5;
      chassisLines.forEach((line) => {
        const p1 = project(line.from);
        const p2 = project(line.to);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw Body Polygons / Wireframe
      bodyPolygons.forEach((poly) => {
        if (poly.length < 3) return;
        const projected = poly.map((pt) => project(pt));

        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        for (let i = 1; i < projected.length; i++) {
          ctx.lineTo(projected[i].x, projected[i].y);
        }
        ctx.closePath();

        // Dynamic gradient shading based on lighting direction
        const avgZ = projected.reduce((acc, p) => acc + p.z, 0) / projected.length;
        const alpha = Math.max(0.08, Math.min(0.35, 0.22 - avgZ * 0.12));
        ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
        ctx.fill();

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Draw Anatomy Hotspots if mode is anatomy
      if (mode === "anatomy") {
        anatomyHotspots.forEach((spot) => {
          const pt = project(spot.pos);
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing ping ring
          ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
          ctx.stroke();

          // Text label
          ctx.font = "10px JetBrains Mono, monospace";
          ctx.fillStyle = "#f8fafc";
          ctx.fillText(spot.label, pt.x + 10, pt.y - 4);
        });
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [categoryId, mode, isRotating, accentColor]);

  return (
    <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-slate-950/80 to-slate-900/90 rounded-2xl overflow-hidden border border-amber-500/20 shadow-inner group">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={420}
        height={260}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full block cursor-grab active:cursor-grabbing select-none"
      />

      {/* Interactive Controls Overlay */}
      {isInteractive && (
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={() => setMode("orbit")}
            className={`p-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
              mode === "orbit"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-700/60 hover:text-slate-200"
            }`}
            title="360° Free Orbit View"
          >
            360°
          </button>
          <button
            onClick={() => setMode("exploded")}
            className={`p-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
              mode === "exploded"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-700/60 hover:text-slate-200"
            }`}
            title="Exploded Component Separation"
          >
            EXPLODED
          </button>
          <button
            onClick={() => setMode("anatomy")}
            className={`p-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
              mode === "anatomy"
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-700/60 hover:text-slate-200"
            }`}
            title="Anatomy Hardpoint Inspection"
          >
            ANATOMY
          </button>
        </div>
      )}

      {/* Mode Indicator & Auto-Rotate Toggle */}
      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 z-10">
        <button
          onClick={() => setIsRotating((prev) => !prev)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
            isRotating
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-slate-800/60 text-slate-400 border-slate-700"
          }`}
        >
          <RotateCw size={10} className={isRotating ? "animate-spin" : ""} />
          {isRotating ? "ROTATING" : "PAUSED"}
        </button>
        <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">
          DRAG TO ROTATE
        </span>
      </div>
    </div>
  );
};

/**
 * Procedurally generates authentic 3D wireframe and silhouette geometry
 * tailored to each of the 18 vehicle categories.
 */
function getCategory3DGeometry(categoryId: VehicleCategoryId, mode: "orbit" | "exploded" | "anatomy") {
  const explodeOffset = mode === "exploded" ? 0.35 : 0;

  // Geometry attributes depending on category
  let length = 1.0;
  let width = 0.52;
  let height = 0.32;
  let groundClearance = 0.08;
  let hoodSlope = 0.28;
  let roofStart = -0.15;
  let roofEnd = 0.45;
  let isFastback = false;
  let isBoxyRear = false;
  let isFormula = false;
  let hasRearWing = false;
  let hasBed = false;

  switch (categoryId) {
    case "hatchback":
      length = 0.88;
      width = 0.50;
      height = 0.36;
      roofEnd = 0.72;
      isBoxyRear = true;
      break;
    case "sedan":
      length = 1.08;
      width = 0.52;
      height = 0.34;
      roofEnd = 0.48;
      break;
    case "coupe":
      length = 1.02;
      width = 0.54;
      height = 0.29;
      roofEnd = 0.52;
      isFastback = true;
      break;
    case "convertible":
      length = 0.98;
      width = 0.53;
      height = 0.26;
      roofEnd = 0.35;
      break;
    case "wagon":
      length = 1.12;
      width = 0.53;
      height = 0.35;
      roofEnd = 0.88;
      isBoxyRear = true;
      break;
    case "crossover":
      length = 0.98;
      width = 0.54;
      height = 0.42;
      groundClearance = 0.14;
      roofEnd = 0.72;
      isBoxyRear = true;
      break;
    case "suv":
      length = 1.18;
      width = 0.58;
      height = 0.48;
      groundClearance = 0.18;
      roofEnd = 0.86;
      isBoxyRear = true;
      break;
    case "offroad_4x4":
      length = 1.05;
      width = 0.58;
      height = 0.54;
      groundClearance = 0.22;
      roofEnd = 0.84;
      isBoxyRear = true;
      break;
    case "grand_tourer":
      length = 1.14;
      width = 0.56;
      height = 0.28;
      roofStart = 0.05;
      roofEnd = 0.56;
      isFastback = true;
      break;
    case "sports_car":
      length = 0.96;
      width = 0.54;
      height = 0.26;
      roofStart = -0.05;
      roofEnd = 0.45;
      isFastback = true;
      break;
    case "supercar":
      length = 1.05;
      width = 0.58;
      height = 0.22;
      roofStart = -0.15;
      roofEnd = 0.35;
      isFastback = true;
      break;
    case "hypercar":
      length = 1.12;
      width = 0.60;
      height = 0.20;
      roofStart = -0.18;
      roofEnd = 0.32;
      hasRearWing = true;
      isFastback = true;
      break;
    case "gt3_race":
      length = 1.08;
      width = 0.60;
      height = 0.24;
      hasRearWing = true;
      isFastback = true;
      break;
    case "formula_open_wheel":
      length = 1.22;
      width = 0.32;
      height = 0.18;
      isFormula = true;
      hasRearWing = true;
      break;
    case "prototype_lmp":
      length = 1.14;
      width = 0.58;
      height = 0.22;
      hasRearWing = true;
      break;
    case "pickup":
      length = 1.25;
      width = 0.58;
      height = 0.46;
      groundClearance = 0.18;
      roofEnd = 0.35;
      hasBed = true;
      break;
    case "van_mpv":
      length = 1.15;
      width = 0.56;
      height = 0.52;
      groundClearance = 0.10;
      roofStart = -0.38;
      roofEnd = 0.90;
      isBoxyRear = true;
      break;
    case "ev_platform":
      length = 1.08;
      width = 0.56;
      height = 0.31;
      roofEnd = 0.60;
      isFastback = true;
      break;
  }

  const yFloor = -0.3 + groundClearance;
  const yWaist = yFloor + height * 0.5 + (mode === "exploded" ? explodeOffset * 0.5 : 0);
  const yRoof = yFloor + height + explodeOffset;

  const xHalf = width / 2;
  const zFront = -length / 2;
  const zRear = length / 2;

  // Wheel positions
  const zWheelF = zFront + length * 0.22;
  const zWheelR = zRear - length * 0.22;
  const wheelRadius = 0.10 + groundClearance * 0.25;

  const wheelNodes = [
    { pos: { x: -xHalf - 0.05, y: yFloor + wheelRadius * 0.8, z: zWheelF }, radius: wheelRadius },
    { pos: { x: xHalf + 0.05, y: yFloor + wheelRadius * 0.8, z: zWheelF }, radius: wheelRadius },
    { pos: { x: -xHalf - 0.05, y: yFloor + wheelRadius * 0.8, z: zWheelR }, radius: wheelRadius },
    { pos: { x: xHalf + 0.05, y: yFloor + wheelRadius * 0.8, z: zWheelR }, radius: wheelRadius },
  ];

  // Chassis Rails (lower structural level)
  const chassisLines: { from: Point3D; to: Point3D }[] = [
    // Left & right frame rails
    { from: { x: -xHalf * 0.7, y: yFloor, z: zFront }, to: { x: -xHalf * 0.7, y: yFloor, z: zRear } },
    { from: { x: xHalf * 0.7, y: yFloor, z: zFront }, to: { x: xHalf * 0.7, y: yFloor, z: zRear } },
    // Crossmembers
    { from: { x: -xHalf * 0.7, y: yFloor, z: zFront }, to: { x: xHalf * 0.7, y: yFloor, z: zFront } },
    { from: { x: -xHalf * 0.7, y: yFloor, z: zWheelF }, to: { x: xHalf * 0.7, y: yFloor, z: zWheelF } },
    { from: { x: -xHalf * 0.7, y: yFloor, z: zWheelR }, to: { x: xHalf * 0.7, y: yFloor, z: zWheelR } },
    { from: { x: -xHalf * 0.7, y: yFloor, z: zRear }, to: { x: xHalf * 0.7, y: yFloor, z: zRear } },
  ];

  // Body Polygons
  const bodyPolygons: Point3D[][] = [];

  if (isFormula) {
    // Open-wheel single seater
    bodyPolygons.push([
      { x: 0, y: yFloor + 0.08, z: zFront - 0.15 },
      { x: -xHalf * 0.4, y: yWaist, z: zWheelF },
      { x: xHalf * 0.4, y: yWaist, z: zWheelF },
    ]);
    bodyPolygons.push([
      { x: -xHalf * 0.5, y: yWaist, z: zWheelF },
      { x: -xHalf * 0.6, y: yRoof * 0.8, z: 0 },
      { x: xHalf * 0.6, y: yRoof * 0.8, z: 0 },
      { x: xHalf * 0.5, y: yWaist, z: zWheelF },
    ]);
  } else {
    // Standard Passenger or Sports Body Polygons
    // 1. Hood / Bonnet
    bodyPolygons.push([
      { x: -xHalf * 0.85, y: yWaist * 0.9, z: zFront },
      { x: xHalf * 0.85, y: yWaist * 0.9, z: zFront },
      { x: xHalf * 0.9, y: yWaist + hoodSlope * 0.3, z: zFront + length * roofStart },
      { x: -xHalf * 0.9, y: yWaist + hoodSlope * 0.3, z: zFront + length * roofStart },
    ]);

    // 2. Greenhouse / Roof
    bodyPolygons.push([
      { x: -xHalf * 0.7, y: yRoof, z: zFront + length * (roofStart + 0.2) },
      { x: xHalf * 0.7, y: yRoof, z: zFront + length * (roofStart + 0.2) },
      { x: xHalf * 0.7, y: yRoof, z: zFront + length * roofEnd },
      { x: -xHalf * 0.7, y: yRoof, z: zFront + length * roofEnd },
    ]);

    // 3. Rear Deck or Hatch
    if (isBoxyRear) {
      bodyPolygons.push([
        { x: -xHalf * 0.7, y: yRoof, z: zFront + length * roofEnd },
        { x: xHalf * 0.7, y: yRoof, z: zFront + length * roofEnd },
        { x: xHalf * 0.85, y: yWaist, z: zRear },
        { x: -xHalf * 0.85, y: yWaist, z: zRear },
      ]);
    } else if (hasBed) {
      // Pickup bed
      bodyPolygons.push([
        { x: -xHalf * 0.85, y: yWaist, z: zFront + length * roofEnd },
        { x: xHalf * 0.85, y: yWaist, z: zFront + length * roofEnd },
        { x: xHalf * 0.85, y: yWaist, z: zRear },
        { x: -xHalf * 0.85, y: yWaist, z: zRear },
      ]);
    } else {
      // Fastback / Coupe taper
      bodyPolygons.push([
        { x: -xHalf * 0.7, y: yRoof, z: zFront + length * roofEnd },
        { x: xHalf * 0.7, y: yRoof, z: zFront + length * roofEnd },
        { x: xHalf * 0.82, y: yWaist, z: zRear },
        { x: -xHalf * 0.82, y: yWaist, z: zRear },
      ]);
    }
  }

  // Rear Wing if present
  if (hasRearWing) {
    const yWing = yRoof + 0.12;
    const zWing = zRear + 0.05;
    bodyPolygons.push([
      { x: -xHalf * 0.95, y: yWing, z: zWing - 0.08 },
      { x: xHalf * 0.95, y: yWing, z: zWing - 0.08 },
      { x: xHalf * 0.95, y: yWing + 0.04, z: zWing + 0.06 },
      { x: -xHalf * 0.95, y: yWing + 0.04, z: zWing + 0.06 },
    ]);
  }

  // Anatomy Hotspots
  const anatomyHotspots = [
    { label: "FRONT CRASH STRUCTURE", pos: { x: 0, y: yFloor + 0.15, z: zFront - 0.05 } },
    { label: "POWERTRAIN PACKAGING", pos: { x: 0, y: yWaist * 0.8, z: zWheelF } },
    { label: "PASSENGER CELL (COCKPIT)", pos: { x: 0, y: yWaist + 0.08, z: 0 } },
    { label: "REAR SUSPENSION CLEVIS", pos: { x: -xHalf * 0.6, y: yFloor + 0.15, z: zWheelR } },
    { label: "AERODYNAMIC DIFFUSER EXIT", pos: { x: 0, y: yFloor + 0.05, z: zRear } },
  ];

  return { chassisLines, bodyPolygons, wheelNodes, anatomyHotspots };
}

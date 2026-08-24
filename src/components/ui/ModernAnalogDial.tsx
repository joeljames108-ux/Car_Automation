import { useState, useId, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Plus, Minus, Zap, Scale, Wind, Info, ArrowRight, Box, Eye } from "lucide-react";

interface ModernAnalogDialProps {
  title?: string;
  value?: number;
  min?: number;
  max?: number;
  unit?: string;
  sublabel?: string;
  onChange?: (val: number) => void;
  step?: number;
  ticks?: (string | number)[];
}

export function ModernAnalogDial({
  title = "AERODYNAMIC PROFILE",
  value = 19,
  min = 0,
  max = 40,
  unit = "°",
  sublabel = "L/D RATIO",
  onChange,
  step = 1,
  ticks,
}: ModernAnalogDialProps) {
  const gradientId = useId();
  const [val, setVal] = useState(value);
  const [actionState, setActionState] = useState<"downforce" | "balance" | "drag">("downforce");
  const [lightningEnabled, setLightningEnabled] = useState(true);
  const [cfdIntensity, setCfdIntensity] = useState(80);
  const [wireframeEnabled, setWireframeEnabled] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);

  const mount3DRef = useRef<HTMLDivElement>(null);
  const needle3DRef = useRef<THREE.Group | null>(null);

  const handleUpdate = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    setVal(clamped);
    if (onChange) onChange(clamped);
  };

  // 3D Three.js Dial Gauge Setup
  useEffect(() => {
    if (!is3DMode || !mount3DRef.current) return;
    const container = mount3DRef.current;
    const s = 170;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(s, s);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const dirLight = new THREE.DirectionalLight(0x007aff, 2.5);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    // 1. Outer Bezel Housing Ring
    const bezelGeom = new THREE.TorusGeometry(1.0, 0.08, 16, 48);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x007aff, metalness: 0.9, roughness: 0.1 });
    scene.add(new THREE.Mesh(bezelGeom, bezelMat));

    // 2. Dial Plate
    const dialGeom = new THREE.CylinderGeometry(0.98, 0.98, 0.04, 48);
    dialGeom.rotateX(Math.PI / 2);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    scene.add(new THREE.Mesh(dialGeom, dialMat));

    // 3. Glowing Active Gauge Arc Ring
    const arcGeom = new THREE.TorusGeometry(0.82, 0.05, 12, 48, Math.PI * 1.5);
    arcGeom.rotateZ(-Math.PI * 0.75);
    const arcMat = new THREE.MeshStandardMaterial({ color: 0x007aff, emissive: 0x007aff, emissiveIntensity: 0.8 });
    scene.add(new THREE.Mesh(arcGeom, arcMat));

    // 4. Rotating 3D Needle Indicator Group
    const needleGroup = new THREE.Group();
    const needleGeom = new THREE.ConeGeometry(0.04, 0.75, 16);
    needleGeom.translate(0, 0.35, 0);
    const needleMat = new THREE.MeshStandardMaterial({ color: 0x007aff, emissive: 0x007aff, emissiveIntensity: 0.5 });
    const needleMesh = new THREE.Mesh(needleGeom, needleMat);
    needleMesh.rotation.z = Math.PI / 2;
    needleGroup.add(needleMesh);

    const capGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
    needleGroup.add(new THREE.Mesh(capGeom, capMat));

    scene.add(needleGroup);
    needle3DRef.current = needleGroup;

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [is3DMode]);

  // Update 3D Needle Angle when val changes
  useEffect(() => {
    if (!needle3DRef.current) return;
    const pct = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const targetAngle = -Math.PI * 0.75 + pct * Math.PI * 1.5;
    needle3DRef.current.rotation.z = -targetAngle;
  }, [val, min, max]);

  // Gauge SVG & Layout Math (170x170 coordinate system)
  const size = 170;
  const center = size / 2; // 85
  const radius = 56;
  const strokeWidth = 10;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  const percentage = Math.max(0, Math.min(1, (val - min) / (max - min)));
  const activeAngle = startAngle + percentage * totalAngle;

  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
    const startPt = polarToCartesian(cx, cy, r, end);
    const endPt = polarToCartesian(cx, cy, r, start);
    const largeArcFlag = end - start <= 180 ? "0" : "1";
    return ["M", startPt.x, startPt.y, "A", r, r, 0, largeArcFlag, 0, endPt.x, endPt.y].join(" ");
  };

  const bgArcPath = describeArc(center, center, radius, startAngle, endAngle);
  const activeArcPath = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, activeAngle));
  const knobPos = polarToCartesian(center, center, radius, activeAngle);
  const needleEndPos = polarToCartesian(center, center, radius - 14, activeAngle);

  const rawTicks = ticks || [
    `${min}${unit}`,
    `${Math.round(min + (max - min) * 0.25)}${unit}`,
    `${Math.round(min + (max - min) * 0.5)}${unit}`,
    `${Math.round(min + (max - min) * 0.75)}${unit}`,
    `${max}${unit}`,
  ];

  const tickList = rawTicks.map((t) => {
    const str = String(t);
    return str.endsWith(unit) || !unit ? str : `${str}${unit}`;
  });

  return (
    <div
      className="modern-analog-card"
      style={{
        background: "rgba(255, 252, 245, 0.58)",
        backdropFilter: "blur(50px) saturate(210%)",
        WebkitBackdropFilter: "blur(50px) saturate(210%)",
        border: "1px solid rgba(255, 255, 255, 0.75)",
        borderRadius: 24,
        padding: "16px",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.90)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        color: "#1c1c1e",
        width: "100%",
        maxWidth: 340,
      }}
    >
      {/* Title Header */}
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "#1c1c1e", textTransform: "uppercase" }}>
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: 6,
                background: is3DMode ? "#007aff" : "rgba(0,0,0,0.08)",
                color: is3DMode ? "#fff" : "#1c1c1e",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              {is3DMode ? <Box size={10} /> : <Eye size={10} />}
              {is3DMode ? "3D" : "2D"}
            </button>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#007aff", boxShadow: "0 0 8px rgba(0, 122, 255, 0.6)" }} />
          </div>
        </div>
      )}

      {/* Main Analog Gauge Container */}
      <div style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Central Value Readout */}
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 900, color: "#1c1c1e", lineHeight: 1, letterSpacing: "-0.03em" }}>
              {val}{unit}
            </span>
          </div>

          {/* Sublabel Readout */}
          <div
            style={{
              position: "absolute",
              top: 96,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 800, color: "#3a3a3c", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {sublabel}
            </span>
          </div>

          {is3DMode ? (
            <div ref={mount3DRef} style={{ width: size, height: size, cursor: "grab" }} />
          ) : (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "relative", zIndex: 1 }}>
              <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(0, 122, 255, 0.06)" strokeWidth={strokeWidth + 12} />
              <path d={bgArcPath} fill="none" stroke="rgba(0, 0, 0, 0.08)" strokeWidth={strokeWidth} strokeLinecap="round" />
              <path
                d={activeArcPath}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 8px rgba(0, 122, 255, 0.5))" }}
              />
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0066ff" />
                  <stop offset="50%" stopColor="#00c8ff" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <line
                x1={center}
                y1={center}
                x2={needleEndPos.x}
                y2={needleEndPos.y}
                stroke="#0066ff"
                strokeWidth={2.5}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(0, 102, 255, 0.6))", transition: "all 0.15s ease-out" }}
              />
              <circle cx={center} cy={center} r={6} fill="#ffffff" stroke="#0066ff" strokeWidth={2.5} style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.18))" }} />
              <circle cx={knobPos.x} cy={knobPos.y} r={7.5} fill="#0066ff" stroke="#ffffff" strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 8px rgba(0, 102, 255, 0.85))" }} />
            </svg>
          )}

          {/* Outer Tick Numbers */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4 }}>
            {tickList.map((t, i) => {
              const tickAngle = startAngle + (i / (tickList.length - 1)) * totalAngle;
              const pos = polarToCartesian(center, center, radius + 17, tickAngle);
              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: "translate(-50%, -50%)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#3a3a3c",
                    textAlign: "center",
                    fontFamily: "monospace",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        </div>

        {/* Stepper Buttons (- / +) */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", justifyContent: "center", marginTop: 4 }}>
          <button
            onClick={() => handleUpdate(val - step)}
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.85)",
              borderRadius: 12,
              width: 38,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1c1c1e",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.90)",
            }}
          >
            <Minus size={14} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#1c1c1e", fontFamily: "monospace" }}>{val}{unit}</span>
          <button
            onClick={() => handleUpdate(val + step)}
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.85)",
              borderRadius: 12,
              width: 38,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1c1c1e",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.90)",
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Actions Row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#636366", textTransform: "uppercase" }}>Actions</div>
        <div style={{ display: "flex", gap: 6, width: "100%" }}>
          {[
            { key: "downforce", label: "+ Downforce", icon: <Zap size={11} /> },
            { key: "balance", label: "Balance", icon: <Scale size={11} /> },
            { key: "drag", label: "- Drag", icon: <Wind size={11} /> },
          ].map((act) => {
            const isActive = actionState === act.key;
            return (
              <button
                key={act.key}
                onClick={() => setActionState(act.key as any)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "8px 4px",
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  background: isActive ? "#007aff" : "rgba(255, 255, 255, 0.55)",
                  color: isActive ? "#ffffff" : "#3a3a3c",
                  border: isActive ? "1px solid rgba(255, 255, 255, 0.40)" : "1px solid rgba(255, 255, 255, 0.75)",
                  boxShadow: isActive ? "0 4px 16px rgba(0, 122, 255, 0.35)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Section 1 */}
      <div style={{ background: "rgba(255, 255, 255, 0.45)", borderRadius: 14, padding: "10px 12px", border: "1px solid rgba(0, 0, 0, 0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1c1c1e" }}>Lightning</span>
          <button
            onClick={() => setLightningEnabled(!lightningEnabled)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 12,
              background: lightningEnabled ? "#007aff" : "rgba(0, 0, 0, 0.12)",
              position: "relative",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#ffffff",
                position: "absolute",
                top: 2,
                left: lightningEnabled ? 18 : 2,
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3a3a3c" }}>CFD Visualization Intensity</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={12} style={{ color: "#007aff" }} />
            <input
              type="range"
              min={0}
              max={100}
              value={cfdIntensity}
              onChange={(e) => setCfdIntensity(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#007aff", cursor: "pointer" }}
            />
            <span style={{ fontSize: 10, fontWeight: 800, color: "#007aff", width: 30, textAlign: "right" }}>{cfdIntensity}%</span>
          </div>
        </div>
      </div>

      {/* Controls Section 2 */}
      <div style={{ background: "rgba(255, 255, 255, 0.45)", borderRadius: 14, padding: "10px 12px", border: "1px solid rgba(0, 0, 0, 0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#1c1c1e" }}>Wireframe & Analysis</span>
            <Info size={12} style={{ color: "#636366" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#3a3a3c" }}>Wireframe Mode</span>
          <button
            onClick={() => setWireframeEnabled(!wireframeEnabled)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 12,
              background: wireframeEnabled ? "#007aff" : "rgba(0, 0, 0, 0.12)",
              position: "relative",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#ffffff",
                position: "absolute",
                top: 2,
                left: wireframeEnabled ? 18 : 2,
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 8, fontSize: 10, color: "#636366" }}>
          <span>Last Sync at 8:02 AM</span>
          <button style={{ background: "rgba(255, 255, 255, 0.65)", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#1c1c1e", cursor: "pointer" }}>
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}


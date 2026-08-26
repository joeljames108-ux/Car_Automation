import { useState, useEffect, useRef, memo } from "react";
import * as THREE from "three";
import { ModernAnalogDial } from "./ModernAnalogDial";
import { EngineeringLog } from "../EngineeringLog";
import { CFDView } from "./CFDView";
import { useDesign } from "../../state/DesignContext";
import { HelpCircle, User, Bot, Box } from "lucide-react";

function SpatialReferenceSuiteComponent() {
  const { design, sim } = useDesign();
  const [rideHeight, setRideHeight] = useState(105);
  const [cameraSmart, setCameraSmart] = useState(true);
  const [timePeriod, setTimePeriod] = useState<"monthly" | "weekly">("monthly");
  const [activeTab, setActiveTab] = useState("Suspension");

  const card1MountRef = useRef<HTMLDivElement>(null);
  const card2MountRef = useRef<HTMLDivElement>(null);

  // 3D Mini Suspension Preview for Card 1
  useEffect(() => {
    if (!card1MountRef.current) return;
    const container = card1MountRef.current;
    const w = container.clientWidth || 180;
    const h = container.clientHeight || 80;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10);
    camera.position.set(1.2, 0.8, 1.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0x007aff, 2.0);
    light.position.set(2, 3, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));

    // 3D Suspension Arm Geometry
    const group = new THREE.Group();
    const armGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.8);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x007aff, metalness: 0.8 });

    const arm1 = new THREE.Mesh(armGeom, armMat);
    arm1.rotation.z = Math.PI / 4;
    group.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, armMat);
    arm2.rotation.z = -Math.PI / 4;
    group.add(arm2);

    const springGeom = new THREE.TorusGeometry(0.12, 0.02, 8, 24);
    const springMat = new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.5 });
    const spring = new THREE.Mesh(springGeom, springMat);
    group.add(spring);

    scene.add(group);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.02;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // 3D Mini Wireframe Car Preview for Card 2
  useEffect(() => {
    if (!card2MountRef.current) return;
    const container = card2MountRef.current;
    const w = container.clientWidth || 180;
    const h = container.clientHeight || 60;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10);
    camera.position.set(2.0, 0.8, 2.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const carGeom = new THREE.BoxGeometry(1.2, 0.35, 0.6);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x007aff, wireframe: true });
    const carMesh = new THREE.Mesh(carGeom, wireMat);
    scene.add(carMesh);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      carMesh.rotation.y += 0.015;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      className="spatial-reference-suite w-full"
      style={{
        position: "relative",
        borderRadius: 28,
        padding: "16px",
        background: "rgba(255, 252, 245, 0.52)",
        backdropFilter: "blur(60px) saturate(210%)",
        WebkitBackdropFilter: "blur(60px) saturate(210%)",
        border: "1px solid rgba(255, 255, 255, 0.75)",
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.90)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        color: "#1c1c1e",
      }}
    >
      {/* Top Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Column 1 (Left): AERODYNAMIC PROFILE Dial Card */}
        <div className="lg:col-span-3 flex justify-center">
          <ModernAnalogDial
            title="AERODYNAMIC PROFILE"
            value={19}
            min={0}
            max={40}
            unit="°"
            sublabel="L/D"
            ticks={["0°", "10°", "20°", "30°", "40°"]}
          />
        </div>

        {/* Column 2 (Center): CFD Live Simulation Window + 3 Sub-Cards */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* CFD Wind Tunnel Live View */}
          <div className="relative rounded-2xl overflow-hidden border border-white/75 shadow-lg">
            <CFDView
              aero={design.vehicle.aero}
              dragCoeff={sim.dragCoeff}
              liftCoeff={sim.liftCoeff}
              downforce={sim.downforce}
            />
          </div>

          {/* Bottom Row 3 Cards: Vehicle Configuration | CFD Lab Data | Aero Forces over Velocity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1: VEHICLE CONFIGURATION */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(30px) saturate(210%)",
                border: "1px solid rgba(255, 255, 255, 0.75)",
                borderRadius: 20,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.85)",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#1c1c1e", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>VEHICLE CONFIGURATION</span>
                <Box size={11} style={{ color: "#007aff" }} />
              </div>

              {/* Technical Interactive 3D Suspension Preview Viewport */}
              <div ref={card1MountRef} style={{ position: "relative", height: 80, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }} />

              {/* Ride Height Slider */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#1c1c1e" }}>Ride Height (mm)</span>
                  <button
                    onClick={() => setRideHeight(rideHeight === 105 ? 85 : 105)}
                    style={{
                      width: 30,
                      height: 16,
                      borderRadius: 10,
                      background: "#007aff",
                      position: "relative",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 16 }} />
                  </button>
                </div>
                <input
                  type="range"
                  min={60}
                  max={160}
                  value={rideHeight}
                  onChange={(e) => setRideHeight(Number(e.target.value))}
                  style={{ accentColor: "#007aff", width: "100%", cursor: "pointer" }}
                />
              </div>

              {/* White Pill Input Element */}
              <div style={{ background: "rgba(255, 255, 255, 0.85)", color: "#1c1c1e", borderRadius: 14, padding: "6px 12px", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(0,0,0,0.06)" }}>
                <span>Standard Aero Mode</span>
                <span style={{ fontSize: 10, color: "#007aff" }}>✓</span>
              </div>
            </div>

            {/* Card 2: CFD LAB DATA */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(30px) saturate(210%)",
                border: "1px solid rgba(255, 255, 255, 0.75)",
                borderRadius: 20,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.85)",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#1c1c1e", textTransform: "uppercase" }}>
                CFD LAB DATA
              </div>

              <div style={{ fontSize: 11, color: "#3a3a3c", lineHeight: 1.4 }}>
                <div>Drag Cd: <span style={{ fontWeight: 800, color: "#1c1c1e" }}>{sim.dragCoeff.toFixed(3)}</span></div>
                <div>Front/Rear Lift: <span style={{ fontWeight: 800, color: "#007aff" }}>+0.067 / +0.101</span></div>
              </div>

              {/* Camera ISmart Cam Toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.65)", padding: "6px 10px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1c1c1e" }}>Camera</div>
                  <div style={{ fontSize: 9, color: "#636366" }}>ISmart Cam</div>
                </div>
                <button
                  onClick={() => setCameraSmart(!cameraSmart)}
                  style={{
                    width: 32,
                    height: 18,
                    borderRadius: 10,
                    background: cameraSmart ? "#007aff" : "rgba(0,0,0,0.12)",
                    position: "relative",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: cameraSmart ? 16 : 2 }} />
                </button>
              </div>

              {/* Wireframe Vehicle 3D Thumbnail Viewport */}
              <div ref={card2MountRef} style={{ height: 60, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }} />
            </div>

            {/* Card 3: AERO FORCES OVER VELOCITY */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(30px) saturate(210%)",
                border: "1px solid rgba(255, 255, 255, 0.75)",
                borderRadius: 20,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.85)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: "#1c1c1e", textTransform: "uppercase" }}>
                  AERO FORCES OVER VELOCITY
                </div>
                <HelpCircle size={12} style={{ color: "#636366" }} />
              </div>

              {/* Time Period Filter Pills */}
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.65)", padding: 2, borderRadius: 10, width: "fit-content", border: "1px solid rgba(0,0,0,0.06)" }}>
                <button
                  onClick={() => setTimePeriod("monthly")}
                  style={{
                    padding: "2px 10px",
                    borderRadius: 8,
                    fontSize: 9,
                    fontWeight: 700,
                    background: timePeriod === "monthly" ? "#007aff" : "transparent",
                    color: timePeriod === "monthly" ? "#ffffff" : "#636366",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimePeriod("weekly")}
                  style={{
                    padding: "2px 10px",
                    borderRadius: 8,
                    fontSize: 9,
                    fontWeight: 700,
                    background: timePeriod === "weekly" ? "#007aff" : "transparent",
                    color: timePeriod === "weekly" ? "#ffffff" : "#636366",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Weekly
                </button>
              </div>

              {/* Multi-Line Chart */}
              <div style={{ position: "relative", height: 95, width: "100%" }}>
                <svg width="100%" height="100%" viewBox="0 0 200 95" preserveAspectRatio="none">
                  {[30, 45, 60, 80, 65].map((h, i) => (
                    <rect
                      key={i}
                      x={20 + i * 36}
                      y={90 - h}
                      width={18}
                      height={h}
                      rx={4}
                      fill="rgba(0, 122, 255, 0.14)"
                    />
                  ))}
                  <path d="M 10 70 Q 60 50 110 65 T 190 30" fill="none" stroke="#007aff" strokeWidth="2.5" />
                  <path d="M 10 35 Q 60 55 110 75 T 190 85" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  <path d="M 10 80 Q 60 70 110 40 T 190 20" fill="none" stroke="#34d399" strokeWidth="2.5" />
                </svg>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#636366", fontFamily: "monospace", marginTop: 2, fontWeight: 700 }}>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 (Right): ENGINEERING LOG Panel */}
        <div className="lg:col-span-3">
          <EngineeringLog />
        </div>
      </div>

      {/* Floating Bottom Navigation Capsule Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 252, 245, 0.78)",
          backdropFilter: "blur(30px) saturate(210%)",
          WebkitBackdropFilter: "blur(30px) saturate(210%)",
          borderRadius: 28,
          border: "1px solid rgba(255, 255, 255, 0.85)",
          padding: "6px 12px",
          width: "max-content",
          margin: "0 auto",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {["Suspension", "Chassis", "Aero", "Powertrain", "Brakes"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: isActive ? 800 : 600,
                  background: isActive ? "#007aff" : "transparent",
                  color: isActive ? "#ffffff" : "#636366",
                  boxShadow: isActive ? "0 4px 12px rgba(0, 122, 255, 0.30)" : "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div style={{ marginLeft: 12, width: 28, height: 28, borderRadius: "50%", background: "#007aff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <User size={16} />
        </div>
      </div>

      {/* Floating Bottom-Right Apex AI Button */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 24,
          zIndex: 30,
          background: "rgba(255, 252, 245, 0.85)",
          backdropFilter: "blur(30px) saturate(210%)",
          WebkitBackdropFilter: "blur(30px) saturate(210%)",
          border: "1px solid rgba(255, 255, 255, 0.85)",
          borderRadius: 20,
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          color: "#1c1c1e",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Bot size={14} style={{ color: "#007aff" }} />
        <span>Apex AI</span>
        <span style={{ background: "#ef4444", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
          1
        </span>
      </div>
    </div>
  );
}

export const SpatialReferenceSuite = memo(SpatialReferenceSuiteComponent);


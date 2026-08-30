import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Zap, Cog, Wind, Activity, ShieldCheck, Monitor, Box, Eye } from "lucide-react";
import type { Stage } from "../StageSwitcher";
import { AnimatedCounter } from "./AnimatedCounter";

interface HolographicCarHUDProps {
  peakPower: number;
  peakTorque: number;
  weight: number;
  dragCoeff: number;
  topSpeed: number;
  downforce: number;
  onSelectSubsystem: (stage: Stage) => void;
}

export function HolographicCarHUD({
  peakPower,
  peakTorque,
  weight,
  dragCoeff,
  topSpeed,
  downforce,
  onSelectSubsystem,
}: HolographicCarHUDProps) {
  const [rpm, setRpm] = useState(2400);
  const [gear, setGear] = useState(3);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [renderMode3D, setRenderMode3D] = useState(true);

  const mountRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  // Live Engine Tachometer Idle Sweep Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const targetRpm = Math.floor(6200 + Math.sin(Date.now() / 600) * 1400);
      setRpm((prev) => Math.round(prev + (targetRpm - prev) * 0.2));
      setGear(Math.min(6, Math.max(1, Math.floor(targetRpm / 1500))));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Three.js 3D Supercar Hologram Viewport Setup
  useEffect(() => {
    if (!renderMode3D || !mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 165;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030610);
    scene.fog = new THREE.FogExp2(0x030610, 0.08);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(3.2, 1.4, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 0.3, 0);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    dirLight.position.set(4, 6, 4);
    scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0xf59e0b, 3.0, 10);
    purpleLight.position.set(-3, 2, -2);
    scene.add(purpleLight);

    // Cyan Cyber Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Procedural 3D Supercar Group
    const carGroup = new THREE.Group();

    // 1. Sleek Supercar Main Body Mesh
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-1.6, 0.15);
    bodyShape.lineTo(-1.5, 0.3);
    bodyShape.lineTo(-0.8, 0.45);
    bodyShape.lineTo(-0.3, 0.75);
    bodyShape.lineTo(0.5, 0.75);
    bodyShape.lineTo(1.1, 0.45);
    bodyShape.lineTo(1.6, 0.35);
    bodyShape.lineTo(1.7, 0.15);
    bodyShape.closePath();

    const extrudeSettings = { depth: 1.1, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
    const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeom.center();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x06152d,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: false,
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.y = 0.45;
    carGroup.add(bodyMesh);

    // 2. Cyan Wireframe Overlay Shell
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.35 });
    const wireMesh = new THREE.Mesh(bodyGeom, wireMat);
    wireMesh.position.y = 0.45;
    carGroup.add(wireMesh);

    // 3. Tinted Glass Cockpit Dome
    const glassGeom = new THREE.SphereGeometry(0.55, 16, 16);
    glassGeom.scale(1.4, 0.7, 1.0);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    glassMesh.position.set(0, 0.65, 0);
    carGroup.add(glassMesh);

    // 4. Active Rear Wing
    const wingGeom = new THREE.BoxGeometry(0.3, 0.04, 1.3);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const wingMesh = new THREE.Mesh(wingGeom, wingMat);
    wingMesh.position.set(-1.45, 0.7, 0);
    carGroup.add(wingMesh);

    // 5. 3D Wheels (4 Positioned Rims)
    const wheelGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 24);
    wheelGeom.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 1.0, roughness: 0.1 });

    const wheelPositions = [
      { x: -1.0, z: 0.65 },
      { x: -1.0, z: -0.65 },
      { x: 1.0, z: 0.65 },
      { x: 1.0, z: -0.65 },
    ];
    const wheelMeshes: THREE.Group[] = [];

    wheelPositions.forEach((pos) => {
      const wg = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeom, wheelMat);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 16), rimMat);
      wg.add(tire);
      wg.add(rim);
      wg.position.set(pos.x, 0.32, pos.z);
      carGroup.add(wg);
      wheelMeshes.push(wg);
    });

    scene.add(carGroup);

    // Animation Loop
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      controls.update();
      wheelMeshes.forEach((w) => {
        w.rotation.z -= 0.08;
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [renderMode3D]);

  const rpmPercent = Math.min(100, Math.max(0, (rpm / 9000) * 100));

  const subsystems = [
    { id: "engine" as Stage, label: "Engine V8", x: 140, y: 85, icon: <Cog size={12} />, color: "text-amber-400 border-amber-400/50 bg-amber-500/10" },
    { id: "aero" as Stage, label: "Active Wing", x: 340, y: 55, icon: <Wind size={12} />, color: "text-amber-400 border-amber-400/50 bg-amber-500/10" },
    { id: "suspension3d" as Stage, label: "Double Wishbone", x: 260, y: 110, icon: <Activity size={12} />, color: "text-emerald-400 border-emerald-400/50 bg-emerald-500/10" },
    { id: "interior" as Stage, label: "Cockpit HUD", x: 210, y: 70, icon: <Monitor size={12} />, color: "text-amber-400 border-amber-400/50 bg-amber-500/10" },
    { id: "safety" as Stage, label: "Monocoque Cell", x: 180, y: 95, icon: <ShieldCheck size={12} />, color: "text-amber-400 border-sky-400/50 bg-amber-500/15" },
  ];

  return (
    <div className="w-full bg-slate-900/80/90 border border-amber-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(34,211,238,0.12)] relative overflow-hidden">
      {/* Background Cyber Laser Reticles */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-amber-400/50 tracking-widest uppercase pointer-events-none z-10 flex items-center gap-2">
        <span>HUD // CAD TELEMETRY SYSTEM · 60FPS</span>
      </div>

      {/* Mode Switcher Toggle Pill */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-slate-900/90 border border-amber-500/40 rounded-lg p-0.5 backdrop-blur-md">
        <button
          onClick={() => setRenderMode3D(true)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
            renderMode3D ? "bg-amber-500 text-slate-950 shadow-sm font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Box size={10} /> 3D MODEL
        </button>
        <button
          onClick={() => setRenderMode3D(false)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
            !renderMode3D ? "bg-amber-500 text-slate-950 shadow-sm font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Eye size={10} /> 2D VECTOR
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Holographic Vehicle Viewport (3D or 2D) */}
        <div className="relative w-full lg:w-[480px] h-[165px] bg-slate-900/80 rounded-xl border border-amber-500/20 p-2 flex items-center justify-center overflow-hidden">
          {renderMode3D ? (
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing relative">
              <div className="absolute bottom-1 right-2 text-[8px] font-mono text-amber-400/60 pointer-events-none bg-black/40 px-1.5 py-0.5 rounded">
                ORBIT: DRAG · ZOOM: SCROLL
              </div>
            </div>
          ) : (
            <>
              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.15)_50%,transparent_100%)] animate-[pulse_3s_ease-in-out_infinite] pointer-events-none" />

              {/* SVG Vector Supercar Silhouette Wireframe */}
              <svg viewBox="0 0 400 150" className="w-full h-full text-amber-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
                <defs>
                  <linearGradient id="hudGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Aerodynamic Wind Flow Particles */}
                <path d="M 10 30 Q 150 20 390 40" fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="6 4" />
                <path d="M 20 60 Q 180 35 380 75" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" strokeDasharray="8 6" />
                <path d="M 10 110 Q 160 115 390 110" fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Supercar Body Outline */}
                <path
                  d="M 40 100 L 70 95 Q 110 90 140 65 Q 180 35 240 38 Q 290 42 330 75 L 360 85 Q 375 92 375 105 L 360 108 M 40 100 L 35 108 L 360 108"
                  fill="none"
                  stroke="url(#hudGradient)"
                  strokeWidth="2"
                />
                {/* Windshield & Cockpit */}
                <path d="M 155 62 Q 190 38 245 42 Q 270 52 285 75 Z" fill="none" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="1.5" />

                {/* Front & Rear Rims */}
                <circle cx="105" cy="108" r="18" fill="#040814" stroke="#00f0ff" strokeWidth="2.5" className="animate-spin" style={{ animationDuration: "3s", transformOrigin: "105px 108px" }} />
                <circle cx="105" cy="108" r="8" fill="none" stroke="#f59e0b" strokeWidth="1" />
                <circle cx="310" cy="108" r="18" fill="#040814" stroke="#00f0ff" strokeWidth="2.5" className="animate-spin" style={{ animationDuration: "3s", transformOrigin: "310px 108px" }} />
                <circle cx="310" cy="108" r="8" fill="none" stroke="#f59e0b" strokeWidth="1" />
              </svg>
            </>
          )}

          {/* Interactive Subsystem Node Buttons Overlay */}
          {subsystems.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelectSubsystem(sub.id)}
              onMouseEnter={() => setHoveredNode(sub.label)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ left: `${sub.x}px`, top: `${sub.y}px` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all ui1-btn-kinetic cursor-pointer z-10 ${sub.color} ${
                hoveredNode === sub.label ? "scale-110 shadow-[0_0_15px_rgba(34,211,238,0.6)] z-20" : "opacity-85 hover:opacity-100"
              }`}
            >
              {sub.icon}
              <span>{sub.label}</span>
            </button>
          ))}
        </div>

        {/* Right Dynamic RPM Tachometer & Gear HUD */}
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center justify-around gap-4 bg-slate-900/80/80 p-3 rounded-xl border border-amber-500/20">
          {/* Tachometer Ring */}
          <div className="relative flex flex-col items-center justify-center w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {/* Background Ring Track */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              {/* Dynamic RPM Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={rpm > 7500 ? "#ef4444" : rpm > 5500 ? "#f59e0b" : "#00f0ff"}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * rpmPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
              />
            </svg>

            {/* Center RPM Reading */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">ENGINE RPM</span>
              <span className="text-lg font-black font-mono text-amber-300">{rpm}</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase">GEAR {gear}</span>
            </div>
          </div>

          {/* Quick HUD Metrics Column */}
          <div className="flex flex-col gap-2 min-w-[160px]">
            <div className="flex items-center justify-between text-xs font-mono border-b border-amber-500/20 pb-1">
              <span className="text-slate-400">POWERTRAIN</span>
              <span className="text-amber-300 font-bold flex items-center">
                <AnimatedCounter value={peakPower} duration={400} /> HP
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono border-b border-amber-500/20 pb-1">
              <span className="text-slate-400">TORQUE</span>
              <span className="text-amber-300 font-bold flex items-center">
                <AnimatedCounter value={peakTorque} duration={400} /> Nm
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono border-b border-amber-500/20 pb-1">
              <span className="text-slate-400">DOWNFORCE</span>
              <span className="text-emerald-300 font-bold flex items-center">
                <AnimatedCounter value={downforce} duration={400} /> N
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">CD DRAG</span>
              <span className="text-amber-300 font-bold">
                <AnimatedCounter value={dragCoeff} decimals={3} duration={400} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


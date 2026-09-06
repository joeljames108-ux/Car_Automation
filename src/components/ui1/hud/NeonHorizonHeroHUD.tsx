import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Zap, Cog, Wind, Activity, ShieldCheck, Monitor, Box, Eye, Layers,
  Camera, Gauge, Compass, ChevronLeft, ChevronRight, RotateCw, Sparkles,
  Sliders, Cpu
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import type { Stage } from "../../StageSwitcher";

export interface NeonHorizonHeroHUDProps {
  peakPower: number;
  peakTorque: number;
  weight: number;
  dragCoeff: number;
  topSpeed: number;
  downforce: number;
  onSelectSubsystem: (stage: Stage) => void;
}

type CameraPreset = "iso" | "top" | "side" | "rear";

export const NeonHorizonHeroHUD: React.FC<NeonHorizonHeroHUDProps> = ({
  peakPower,
  peakTorque,
  weight,
  dragCoeff,
  topSpeed,
  downforce,
  onSelectSubsystem,
}) => {
  const { design, sim } = useDesign();

  // Dynamic Telemetry States
  const [speed, setSpeed] = useState(184);
  const [rpm, setRpm] = useState(7200);
  const [gForce, setGForce] = useState({ x: 0.12, y: 0.85 });
  const [activeSubTab, setActiveSubTab] = useState<"systems" | "performance" | "ai" | "higgsfield" | "telemetry" | "config">("systems");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("iso");
  const [rotationAngle, setRotationAngle] = useState(0);

  // Three.js Mount & Animation Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);

  // Dynamic Telemetry Pulse
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now() / 1000;
      const targetSpeed = Math.round(180 + Math.sin(now * 1.5) * 24);
      const targetRpm = Math.round(7100 + Math.sin(now * 2.2) * 650);
      const gx = +(Math.sin(now * 0.9) * 0.45).toFixed(2);
      const gy = +(0.85 + Math.cos(now * 1.2) * 0.35).toFixed(2);

      setSpeed((s) => Math.round(s + (targetSpeed - s) * 0.3));
      setRpm((r) => Math.round(r + (targetRpm - r) * 0.25));
      setGForce({ x: gx, y: gy });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Three.js Hologram Viewport Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 560;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(3.6, 1.6, 4.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 2.2;
    controls.maxDistance = 7.5;
    controlsRef.current = controls;

    // Cyan Neon Wireframe Materials
    const cyanWireMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });

    const bodyFillMat = new THREE.MeshStandardMaterial({
      color: 0x07111c,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x002b28,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.75,
    });

    const carGroup = new THREE.Group();
    carGroupRef.current = carGroup;

    // Chassis Monocoque Body
    const bodyGeom = new THREE.BoxGeometry(2.6, 0.32, 1.15);
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyFillMat);
    const bodyWire = new THREE.Mesh(bodyGeom, cyanWireMat);
    carGroup.add(bodyMesh);
    carGroup.add(bodyWire);

    // Aerodynamic Canopy
    const canopyGeom = new THREE.BoxGeometry(1.1, 0.36, 0.82);
    canopyGeom.translate(-0.1, 0.32, 0);
    const canopyMesh = new THREE.Mesh(canopyGeom, bodyFillMat);
    const canopyWire = new THREE.Mesh(canopyGeom, cyanWireMat);
    carGroup.add(canopyMesh);
    carGroup.add(canopyWire);

    // Front Nose Wedge
    const noseGeom = new THREE.ConeGeometry(0.58, 0.85, 4);
    noseGeom.rotateZ(Math.PI / 2);
    noseGeom.translate(1.5, -0.02, 0);
    const noseWire = new THREE.Mesh(noseGeom, cyanWireMat);
    carGroup.add(noseWire);

    // Active GT Rear Wing
    const wingGeom = new THREE.BoxGeometry(0.28, 0.04, 1.4);
    wingGeom.translate(-1.25, 0.55, 0);
    const wingWire = new THREE.Mesh(wingGeom, cyanWireMat);
    carGroup.add(wingWire);

    // 4 Wheels with Brake Rotors
    const wheelGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 16);
    const wheelWireMat = new THREE.MeshBasicMaterial({ color: 0xffb703, wireframe: true });
    const wheelPositions = [
      [0.9, -0.05, 0.65],
      [0.9, -0.05, -0.65],
      [-0.9, -0.05, 0.65],
      [-0.9, -0.05, -0.65],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelWireMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, y, z);
      carGroup.add(wheel);
    });

    scene.add(carGroup);

    // Holographic Telemetry Pedestal Ring
    const ringGeom = new THREE.RingGeometry(1.7, 2.2, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.38;
    scene.add(ring);

    // Neon Lighting Setup
    const ambLight = new THREE.AmbientLight(0x406080, 1.2);
    scene.add(ambLight);
    const pointLight = new THREE.PointLight(0x00f5d4, 2.0, 15);
    pointLight.position.set(3, 4, 3);
    scene.add(pointLight);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      ring.rotation.z += 0.004;
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
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      container.innerHTML = "";
    };
  }, []);

  const handleSetCameraPreset = (preset: CameraPreset) => {
    playHMIClickSound();
    setCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;

    if (preset === "iso") {
      cameraRef.current.position.set(3.6, 1.6, 4.2);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "top") {
      cameraRef.current.position.set(0.01, 5.2, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "side") {
      cameraRef.current.position.set(0.0, 0.5, 4.8);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "rear") {
      cameraRef.current.position.set(-4.0, 1.2, 0.0);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  const handleNudgeRotation = (dir: number) => {
    playHMIClickSound();
    if (!controlsRef.current || !carGroupRef.current) return;
    controlsRef.current.autoRotate = false;
    carGroupRef.current.rotation.y += dir * (Math.PI / 8);
    setRotationAngle((prev) => (prev + dir * 45 + 360) % 360);
  };

  // Suspension & Aero Parameters from state
  const aero = design.vehicle.aero;
  const rearWingAngle = Math.round(aero?.wingAngle ?? 14);
  const frontFlapsAngle = Math.round(aero?.splitterAngle ?? 8);
  const rideHeightMm = Math.round(aero?.rideHeight ?? 95);

  return (
    <div
      className="relative w-full rounded-3xl p-5 select-none overflow-hidden transition-all duration-300"
      style={{
        background: "radial-gradient(ellipse at 50% 20%, rgba(13, 22, 38, 0.95), rgba(7, 10, 16, 0.98))",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Telemetry Header Strip */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/8 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-[0_0_10px_#00F5D4] animate-pulse" />
          <span className="font-extrabold tracking-wider text-white text-sm font-sans flex items-center gap-2">
            AETHER AUTOMOTIVE DESIGN STUDIO
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-[#00F5D4]">
            PROJECT: NEBULA HYPERCAR
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => {
              playHMIClickSound();
              onSelectSubsystem("higgsfield");
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-fuchsia-500/20 via-[#00F5D4]/20 to-cyan-500/20 border border-[#00F5D4]/40 hover:border-[#00F5D4] text-white hover:text-[#00F5D4] text-xs font-bold font-mono transition-all duration-150 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(0,245,212,0.2)]"
            title="Launch Higgsfield AI Creative Studio"
          >
            <Sparkles size={12} className="text-[#00F5D4]" />
            HIGGSFIELD AI
          </button>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>OPTIMAL</span>
          </div>
          <span className="text-zinc-500">|</span>
          <span className="text-amber-300/80 font-mono">LIVE DYNAMICS</span>
        </div>
      </div>

      {/* Main 3-Column Cockpit Telemetry Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-stretch">
        {/* Left Column: Dynamics, Aerodynamics & Active Suspension */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Dynamics & Aerodynamics Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/8 backdrop-blur-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
                <Wind size={13} className="text-[#00F5D4]" />
                DYNAMICS & AERODYNAMICS
              </span>
              <span className="text-[10px] font-mono text-zinc-500">REALTIME</span>
            </div>

            {/* SVG Live Downforce & Drag Polynomial Curves */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#00F5D4] flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-[#00F5D4] inline-block" /> DOWNFORCE
                </span>
                <span className="text-white font-bold">{Math.round(downforce)} kg</span>
              </div>
              <div className="w-full h-12 relative overflow-hidden rounded-lg bg-zinc-950/60 p-1">
                <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                  <path
                    d="M 0 35 Q 40 5, 80 8 T 160 22 T 200 12"
                    fill="none"
                    stroke="#00F5D4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 35 Q 40 5, 80 8 T 160 22 T 200 12 L 200 40 L 0 40 Z"
                    fill="url(#downforceGrad)"
                    opacity="0.25"
                  />
                  <defs>
                    <linearGradient id="downforceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F5D4" />
                      <stop offset="100%" stopColor="#00F5D4" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                <span className="text-[#FFB703] flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-[#FFB703] inline-block" /> DRAG COEFFICIENT
                </span>
                <span className="text-white font-bold">Cd {dragCoeff.toFixed(3)}</span>
              </div>
              <div className="w-full h-10 relative overflow-hidden rounded-lg bg-zinc-950/60 p-1">
                <svg className="w-full h-full" viewBox="0 0 200 35" preserveAspectRatio="none">
                  <path
                    d="M 0 30 Q 50 10, 100 15 T 200 24"
                    fill="none"
                    stroke="#FFB703"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Active Aero State Indicators */}
            <div className="pt-2 border-t border-white/8 flex flex-col gap-1.5 text-[11px]">
              <span className="text-zinc-400 font-bold uppercase text-[10px]">ACTIVE AERO STATE</span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-zinc-300">Rear Wing Angle:</span>
                <span className="text-[#00F5D4] font-bold">{rearWingAngle}°</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-zinc-300">Front Aero Flaps:</span>
                <span className="text-[#FFB703] font-bold">{frontFlapsAngle}°</span>
              </div>
            </div>
          </div>

          {/* Active Suspension Equalizer Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/8 backdrop-blur-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
                <Activity size={13} className="text-[#00F5D4]" />
                ACTIVE SUSPENSION
              </span>
              <span className="text-[10px] font-mono text-[#00F5D4] font-bold">ADAPTIVE</span>
            </div>

            {/* 4-Corner Compression & Rebound Bars */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { wheel: "FL", comp: 72, reb: 64 },
                { wheel: "FR", comp: 68, reb: 60 },
                { wheel: "RL", comp: 84, reb: 78 },
                { wheel: "RR", comp: 81, reb: 75 },
              ].map((w) => (
                <div key={w.wheel} className="flex flex-col items-center gap-1">
                  <div className="h-16 w-3 rounded-full bg-zinc-900 border border-white/10 flex flex-col justify-end p-0.5 overflow-hidden">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-[#00F5D4] to-[#00bbf9] transition-all duration-300"
                      style={{ height: `${w.comp}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{w.wheel}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/8 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">RIDE HEIGHT:</span>
              <span className="text-white font-bold">{rideHeightMm}mm / {rideHeightMm + 3}mm</span>
            </div>
          </div>
        </div>

        {/* Center Column: 3D Holographic Wireframe Supercar Viewport */}
        <div className="lg:col-span-6 flex flex-col items-center justify-between relative min-h-[360px] p-4 rounded-2xl bg-gradient-to-b from-black/50 to-black/20 border border-white/8">
          <div className="w-full text-center">
            <h2 className="text-lg font-black tracking-widest text-white uppercase font-sans">
              AETHER — MODEL 7
            </h2>
            <p className="text-[11px] font-mono tracking-widest text-zinc-400">
              GLOBAL CHASSIS & AERODYNAMIC SCHEMATIC
            </p>
          </div>

          {/* Three.js 3D Viewport Container */}
          <div
            ref={mountRef}
            className="w-full h-64 relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          />

          {/* Center 360° & Angle Control Bar */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-white/8">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                onClick={() => handleNudgeRotation(-1)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Rotate Left"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="px-2 py-0.5 text-xs font-mono font-bold text-[#00F5D4]">
                {rotationAngle}°
              </div>
              <button
                onClick={() => handleNudgeRotation(1)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Rotate Right"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Camera Angle Presets */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
              {[
                { id: "iso" as CameraPreset, label: "3/4 Iso" },
                { id: "top" as CameraPreset, label: "Top Aero" },
                { id: "side" as CameraPreset, label: "Side Profile" },
                { id: "rear" as CameraPreset, label: "Rear Wing" },
              ].map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => handleSetCameraPreset(cp.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                    cameraPreset === cp.id
                      ? "bg-[#00F5D4]/20 text-[#00F5D4] font-bold border border-[#00F5D4]/40 shadow-[0_0_10px_rgba(0,245,212,0.2)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {cp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Speedometer, Tachometer, G-Force & Tyre Status */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Dual Digital Gauges: Speedometer & Tachometer */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/8 backdrop-blur-xl flex items-center justify-around gap-2">
            {/* Speedometer Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#00F5D4"
                    strokeWidth="6"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (speed / 380) * 264}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.2s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white font-mono">{speed}</span>
                  <span className="text-[9px] font-mono text-zinc-400 uppercase">km/h</span>
                </div>
              </div>
            </div>

            {/* Tachometer Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#FFB703"
                    strokeWidth="6"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (rpm / 9000) * 264}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.2s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white font-mono">{rpm}</span>
                  <span className="text-[9px] font-mono text-zinc-400 uppercase">RPM</span>
                </div>
              </div>
            </div>
          </div>

          {/* G-Force Friction Circle */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/8 backdrop-blur-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-white flex items-center gap-1.5">
                <Compass size={13} className="text-[#FFB703]" />
                G-FORCE VECTOR
              </span>
              <span className="text-[10px] font-mono text-zinc-400">LAT / LONG</span>
            </div>

            <div className="relative w-full h-28 flex items-center justify-center bg-zinc-950/50 rounded-xl border border-white/5 overflow-hidden">
              {/* Radar Rings */}
              <div className="absolute w-20 h-20 rounded-full border border-white/10" />
              <div className="absolute w-12 h-12 rounded-full border border-white/10" />
              <div className="absolute w-full h-[1px] bg-white/10" />
              <div className="absolute h-full w-[1px] bg-white/10" />

              {/* Dynamic G-Force Blip */}
              <div
                className="absolute w-3 h-3 rounded-full bg-[#FFB703] shadow-[0_0_12px_#FFB703] transition-all duration-150"
                style={{
                  transform: `translate(${gForce.x * 40}px, ${-gForce.y * 30}px)`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
              <span>LAT: <strong className="text-white">{gForce.x > 0 ? `+${gForce.x}` : gForce.x} G</strong></span>
              <span>LONG: <strong className="text-white">+{gForce.y} G</strong></span>
            </div>
          </div>

          {/* Tyre Status Quadrant */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/8 backdrop-blur-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-white">TYRE STATUS</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">OPTIMAL</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-white/5">
                <span className="text-[10px] text-zinc-400 font-mono">TEMPERATURE</span>
                <p className="text-base font-black text-[#FFB703] font-mono mt-0.5">30°C</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/60 border border-white/5">
                <span className="text-[10px] text-zinc-400 font-mono">PRESSURE</span>
                <p className="text-base font-black text-[#00F5D4] font-mono mt-0.5">63.0 psi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Navigation Studio Ribbon */}
      <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-white/8 overflow-x-auto scrollbar-none">
        {[
          { id: "systems" as const, label: "SYSTEMS OVERVIEW", stage: "command" as Stage },
          { id: "performance" as const, label: "PERFORMANCE PROFILES", stage: "dyno_ecu" as Stage },
          { id: "higgsfield" as const, label: "HIGGSFIELD AI STUDIO", stage: "higgsfield" as Stage },
          { id: "ai" as const, label: "AI ASSISTANT", stage: "ai" as Stage },
          { id: "telemetry" as const, label: "TELEMETRY LOGS", stage: "stats" as Stage },
          { id: "config" as const, label: "VEHICLE CONFIGURATOR", stage: "vehicle" as Stage },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMIClickSound();
                setActiveSubTab(tab.id);
                onSelectSubsystem(tab.stage);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider font-mono transition-all cursor-pointer border ${
                isActive
                  ? "bg-[#00F5D4]/15 text-[#00F5D4] border-[#00F5D4]/40 shadow-[0_0_15px_rgba(0,245,212,0.25)] scale-105"
                  : "bg-white/5 text-zinc-400 hover:text-white border-white/10 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

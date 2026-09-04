import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Zap, Cog, Wind, Activity, ShieldCheck, Monitor, Box, Eye, Layers, Camera } from "lucide-react";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonRadialDial } from "./NeonRadialDial";
import { NeonArcGauge } from "./NeonArcGauge";
import { AnimatedCounter } from "../../ui/AnimatedCounter";
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

type CameraPreset = "perspective" | "top" | "side" | "rear";

export const NeonHorizonHeroHUD: React.FC<NeonHorizonHeroHUDProps> = ({
  peakPower,
  peakTorque,
  weight,
  dragCoeff,
  topSpeed,
  downforce,
  onSelectSubsystem,
}) => {
  const [rpm, setRpm] = useState(2800);
  const [gear, setGear] = useState(3);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("perspective");
  const [holoColor, setHoloColor] = useState<"cyan" | "magenta" | "emerald">("cyan");

  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const wireMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Live Engine Tachometer Sweep Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const targetRpm = Math.floor(6200 + Math.sin(Date.now() / 600) * 1600);
      setRpm((prev) => Math.round(prev + (targetRpm - prev) * 0.2));
      setGear(Math.min(6, Math.max(1, Math.floor(targetRpm / 1500))));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Update wireframe color when changed
  useEffect(() => {
    if (!wireMatRef.current) return;
    const hex = holoColor === "cyan" ? 0x7fb5d8 : holoColor === "magenta" ? 0x9d8fc4 : 0x6fbf9a;
    wireMatRef.current.color.setHex(hex);
  }, [holoColor]);

  // Set camera angle preset
  const handleSetCameraPreset = (preset: CameraPreset) => {
    playHMIClickSound();
    setCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;

    if (preset === "perspective") {
      cameraRef.current.position.set(3.4, 1.5, 4.0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "top") {
      cameraRef.current.position.set(0.01, 5.0, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "side") {
      cameraRef.current.position.set(0.0, 0.5, 4.8);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "rear") {
      cameraRef.current.position.set(-3.8, 1.2, 0.0);
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  // Three.js 3D Supercar Hologram Viewport Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 170;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040814);
    scene.fog = new THREE.FogExp2(0x040814, 0.07);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(3.4, 1.5, 4.0);
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
    controls.autoRotateSpeed = 1.2;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 8.0;
    controlsRef.current = controls;

    // Muted Hologram Materials
    const cyanWire = new THREE.MeshBasicMaterial({
      color: 0x7fb5d8,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    wireMatRef.current = cyanWire;

    const glowFill = new THREE.MeshStandardMaterial({
      color: 0x081c3b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x10202f,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.7,
    });

    const carGroup = new THREE.Group();

    // Chassis Base Monocoque
    const bodyGeom = new THREE.BoxGeometry(2.4, 0.35, 1.1);
    const bodyMesh = new THREE.Mesh(bodyGeom, glowFill);
    const bodyWire = new THREE.Mesh(bodyGeom, cyanWire);
    carGroup.add(bodyMesh);
    carGroup.add(bodyWire);

    // Aerodynamic Cockpit Canopy
    const cabinGeom = new THREE.BoxGeometry(1.0, 0.35, 0.85);
    cabinGeom.translate(-0.15, 0.32, 0);
    const cabinMesh = new THREE.Mesh(cabinGeom, glowFill);
    const cabinWire = new THREE.Mesh(cabinGeom, cyanWire);
    carGroup.add(cabinMesh);
    carGroup.add(cabinWire);

    // Front Nose Splitter Cone
    const noseGeom = new THREE.ConeGeometry(0.55, 0.8, 4);
    noseGeom.rotateZ(Math.PI / 2);
    noseGeom.translate(1.4, 0.0, 0);
    const noseMesh = new THREE.Mesh(noseGeom, cyanWire);
    carGroup.add(noseMesh);

    // Active GT Rear Aero Wing
    const wingGeom = new THREE.BoxGeometry(0.3, 0.04, 1.3);
    wingGeom.translate(-1.15, 0.52, 0);
    const wingMesh = new THREE.Mesh(wingGeom, cyanWire);
    carGroup.add(wingMesh);

    // 4 Hologram Wheels with Brake Rotors
    const wheelGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16);
    const wheelWire = new THREE.MeshBasicMaterial({ color: 0x9d8fc4, wireframe: true });
    const wheelPositions = [
      [0.85, -0.05, 0.6],
      [0.85, -0.05, -0.6],
      [-0.85, -0.05, 0.6],
      [-0.85, -0.05, -0.6],
    ];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelWire);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, y, z);
      carGroup.add(wheel);
    });

    scene.add(carGroup);

    // Holographic Telemetry Pedestal Ring
    const ringGeom = new THREE.RingGeometry(1.6, 2.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x7fb5d8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.35;
    scene.add(ring);

    // Neon Lights
    const ambLight = new THREE.AmbientLight(0x8fa9c4, 0.9);
    scene.add(ambLight);
    const pointLight = new THREE.PointLight(0x9db8d4, 1.6, 10);
    pointLight.position.set(2, 3, 2);
    scene.add(pointLight);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      ring.rotation.z += 0.005;
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

  return (
    <NeonHorizonGlassPanel
      variant="window"
      glow="cyan"
      corners="reticle"
      withScanline
      className="p-5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left Subsystem Navigation Pills */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/8 pb-2 mb-1">
            <span className="nh-label-caps text-amber-300 flex items-center gap-1.5">
              <Zap size={13} /> SUBSYSTEM HUD
            </span>
            <span className="text-[10px] nh-font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-nh-pulse-dot" />
              ONLINE
            </span>
          </div>

          {[
            { id: "engine" as Stage, label: "POWERTRAIN & V12", val: `${peakPower} hp`, icon: <Cog size={13} /> },
            { id: "aero" as Stage, label: "AERODYNAMICS CFD", val: `Cd ${dragCoeff.toFixed(3)}`, icon: <Wind size={13} /> },
            { id: "vehicle" as Stage, label: "CHASSIS MONOCOQUE", val: `${weight} kg`, icon: <Activity size={13} /> },
            { id: "infotainment" as Stage, label: "CAN-BUS AVIONICS", val: "CAN FD 5Mbps", icon: <Monitor size={13} /> },
            { id: "safety" as Stage, label: "CRASH TELEMETRY", val: "5-Star NCAP", icon: <ShieldCheck size={13} /> },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                playHMIClickSound();
                onSelectSubsystem(sub.id);
              }}
              onMouseEnter={() => setHoveredNode(sub.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`p-2 rounded-xl text-left border transition-all duration-200 flex items-center justify-between gap-2 group cursor-pointer ${
 hoveredNode === sub.id
 ? "bg-amber-500/12 border-amber-500/30 text-white"
 : "bg-black/30 border-white/10 text-amber-200/70 hover:border-white/15"
 }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400 group-hover:scale-110 transition-transform">
                  {sub.icon}
                </span>
                <span className="text-[11px] font-bold nh-font-headline tracking-wider">
                  {sub.label}
                </span>
              </div>
              <span className="text-[10px] nh-font-mono font-bold text-amber-300/80">
                {sub.val}
              </span>
            </button>
          ))}
        </div>

        {/* Center 3D Holographic Supercar Viewport */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[190px]">
          <div
            ref={mountRef}
            className="w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-amber-950/90 shadow-[inset_0_2px_18px_rgba(0,0,0,0.45)] relative"
          />

          {/* Top Camera Controls Overlay */}
          <div className="absolute top-2 left-3 right-3 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-0.5 rounded-lg border border-white/10">
              {[
                { id: "perspective" as CameraPreset, label: "3/4 Iso" },
                { id: "top" as CameraPreset, label: "Top Aero" },
                { id: "side" as CameraPreset, label: "Side Profile" },
                { id: "rear" as CameraPreset, label: "Rear Wing" },
              ].map((cp) => (
                <button
                  key={cp.id}
                  onClick={() => handleSetCameraPreset(cp.id)}
                  className={`px-2 py-0.5 rounded text-[9px] nh-font-mono transition-all cursor-pointer ${
 cameraPreset === cp.id
 ? "bg-amber-500/25 text-sky-200 font-bold border border-amber-500/30"
 : "text-amber-300/60 hover:text-amber-100"
 }`}
                >
                  {cp.label}
                </button>
              ))}
            </div>

            {/* Hologram Wireframe Color Swatches */}
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setHoloColor("cyan")}
                className={`w-2.5 h-2.5 rounded-full bg-[#8fb9d9] cursor-pointer ${
 holoColor === "cyan" ? "ring-2 ring-white scale-125" : "opacity-60"
 }`}
                title="Cyan Hologram"
              />
              <button
                onClick={() => setHoloColor("magenta")}
                className={`w-2.5 h-2.5 rounded-full bg-[#a78bfa] cursor-pointer ${
 holoColor === "magenta" ? "ring-2 ring-white scale-125" : "opacity-60"
 }`}
                title="Magenta Hologram"
              />
              <button
                onClick={() => setHoloColor("emerald")}
                className={`w-2.5 h-2.5 rounded-full bg-[#34d399] cursor-pointer ${
 holoColor === "emerald" ? "ring-2 ring-white scale-125" : "opacity-60"
 }`}
                title="Emerald Hologram"
              />
            </div>
          </div>
        </div>

        {/* Right Live Gauges & Telemetry Cluster */}
        <div className="lg:col-span-4 flex items-center justify-around gap-2 bg-amber-950/70 p-3 rounded-2xl border border-white/8">
          <NeonRadialDial rpm={rpm} gear={gear} size={125} />

          <div className="flex flex-col gap-2">
            <NeonArcGauge
              value={topSpeed}
              min={0}
              max={420}
              label="TOP SPEED"
              unit="km/h"
              size={90}
              color="cyan"
            />
            <NeonArcGauge
              value={downforce}
              min={0}
              max={1500}
              label="DOWNFORCE"
              unit="kg"
              size={90}
              color="magenta"
            />
          </div>
        </div>
      </div>
    </NeonHorizonGlassPanel>
  );
};

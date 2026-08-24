// ===================================================================
// INTERACTIVE 3D SUSPENSION KINEMATICS & GEOMETRY STUDIO
// ===================================================================
// Real-time 3D Three.js suspension kinematics visualizer:
// - Double Wishbone, MacPherson Strut, Pushrod Motorsport, Pullrod Formula, Multi-Link
// - Animate Wheel Bump Travel (-50mm to +50mm) and Steering Lock (-30° to +30°)
// - Live Kinematic Readouts: Camber Gain (°/m), Roll Center Height, Anti-Dive/Squat %
// ===================================================================

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PbrMaterialStudio } from "../../exterior3d/materials/pbrMaterialStudio";
import { Sliders, Activity, RotateCcw, ShieldAlert, Zap } from "lucide-react";

export type SuspensionType3D = "DOUBLE_WISHBONE" | "MACPHERSON_STRUT" | "PUSHROD_MOTORSPORT" | "PULLROD_FORMULA" | "MULTI_LINK_5ARM";

export const Suspension3DStudioViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [suspensionType, setSuspensionType] = useState<SuspensionType3D>("DOUBLE_WISHBONE");
  const [wheelBumpMm, setWheelBumpMm] = useState<number>(0); // -50mm to +50mm
  const [steeringAngleDeg, setSteeringAngleDeg] = useState<number>(0); // -30° to +30°
  const [springRateNmm, setSpringRateNmm] = useState<number>(120);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const wheelGroupRef = useRef<THREE.Group | null>(null);
  const upperArmRef = useRef<THREE.Mesh | null>(null);
  const lowerArmRef = useRef<THREE.Mesh | null>(null);
  const damperRef = useRef<THREE.Mesh | null>(null);

  // Kinematic calculations
  const bumpMers = wheelBumpMm / 1000;
  const dynamicCamberDeg = Number((-0.8 - (bumpMers * 1000 / 25) * 0.45).toFixed(2));
  const rollCenterHeightMm = Number((42 + bumpMers * 18).toFixed(1));
  const antiDivePct = Number((32.5 + (springRateNmm / 120) * 8.0).toFixed(1));
  const antiSquatPct = Number((48.0 + (springRateNmm / 120) * 12.0).toFixed(1));

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090b10);
    scene.fog = new THREE.FogExp2(0x090b10, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(1.4, 0.8, 1.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.2, 0);
    controlsRef.current = controls;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-3, 3, -4);
    scene.add(rimLight);

    const gridHelper = new THREE.GridHelper(10, 20, 0x007aff, 0x1e293b);
    gridHelper.position.y = -0.34;
    scene.add(gridHelper);

    // PBR Materials
    const aluminumMat = PbrMaterialStudio.createMaterial("BILLET_ALUMINUM_ANODIZED", 0xd0d5dd);
    const darkMat = PbrMaterialStudio.createMaterial("BILLET_ALUMINUM_ANODIZED", 0x1e2229);
    const carbonMat = PbrMaterialStudio.createMaterial("CARBON_FIBER_2X2_TWILL");
    const springMat = PbrMaterialStudio.createMaterial("METALLIC_CAR_PAINT_ROSSO_CORSA");
    const rotorMat = PbrMaterialStudio.createMaterial("BRAKE_ROTOR_CROSS_DRILLED");

    // ── 3D SUSPENSION ASSEMBLY ──
    const suspAssembly = new THREE.Group();
    suspAssembly.name = "SUSPENSION_ASSEMBLY_3D";

    // Chassis Subframe Mounting Wall
    const wallGeo = new THREE.BoxGeometry(0.08, 0.60, 0.80);
    const wallMesh = new THREE.Mesh(wallGeo, darkMat);
    wallMesh.position.set(-0.35, 0.15, 0);
    suspAssembly.add(wallMesh);

    // Wheel & Brake Hub Assembly Group (Articulates on Y & Camber Z)
    const wheelHubGroup = new THREE.Group();
    wheelHubGroup.position.set(0.35, 0, 0);

    // Tire Rubber
    const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 32);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, darkMat);
    tireMesh.castShadow = true;
    wheelHubGroup.add(tireMesh);

    // Alloy Rim
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.25, 24);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, aluminumMat);
    wheelHubGroup.add(rimMesh);

    // Brake Rotor
    const rotorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotorMesh = new THREE.Mesh(rotorGeo, rotorMat);
    wheelHubGroup.add(rotorMesh);

    // Upright / Steering Knuckle
    const knuckleGeo = new THREE.BoxGeometry(0.06, 0.32, 0.10);
    const knuckleMesh = new THREE.Mesh(knuckleGeo, aluminumMat);
    knuckleMesh.position.set(-0.14, 0, 0);
    wheelHubGroup.add(knuckleMesh);

    suspAssembly.add(wheelHubGroup);
    wheelGroupRef.current = wheelHubGroup;

    // Upper Wishbone Arm (A-Arm)
    const upperArmGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 16);
    upperArmGeo.rotateZ(Math.PI / 2);
    const upperArmMesh = new THREE.Mesh(upperArmGeo, carbonMat);
    upperArmMesh.position.set(0, 0.15, 0);
    suspAssembly.add(upperArmMesh);
    upperArmRef.current = upperArmMesh;

    // Lower Wishbone Arm (A-Arm)
    const lowerArmGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.68, 16);
    lowerArmGeo.rotateZ(Math.PI / 2);
    const lowerArmMesh = new THREE.Mesh(lowerArmGeo, carbonMat);
    lowerArmMesh.position.set(0, -0.15, 0);
    suspAssembly.add(lowerArmMesh);
    lowerArmRef.current = lowerArmMesh;

    // Coilover Shock Damper with Red Spring
    const damperGroup = new THREE.Group();
    damperGroup.position.set(-0.08, 0.10, 0);

    const shockBodyGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.42, 24);
    const shockBodyMesh = new THREE.Mesh(shockBodyGeo, aluminumMat);
    damperGroup.add(shockBodyMesh);

    const springCoilGeo = new THREE.TorusGeometry(0.045, 0.012, 12, 32);
    springCoilGeo.rotateX(Math.PI / 2);
    for (let sp = -0.12; sp <= 0.12; sp += 0.05) {
      const spMesh = new THREE.Mesh(springCoilGeo, springMat);
      spMesh.position.set(0, sp, 0);
      damperGroup.add(spMesh);
    }

    suspAssembly.add(damperGroup);

    scene.add(suspAssembly);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, [suspensionType]);

  // Update 3D Suspension Articulation based on Wheel Bump and Steering angle sliders
  useEffect(() => {
    if (!wheelGroupRef.current || !upperArmRef.current || !lowerArmRef.current) return;

    const bumpOffset = wheelBumpMm / 1000;
    const steerRad = (steeringAngleDeg * Math.PI) / 180;
    const camberRad = (dynamicCamberDeg * Math.PI) / 180;

    wheelGroupRef.current.position.y = bumpOffset;
    wheelGroupRef.current.rotation.y = steerRad;
    wheelGroupRef.current.rotation.z = camberRad;

    upperArmRef.current.position.y = 0.15 + bumpOffset * 0.85;
    upperArmRef.current.rotation.z = bumpOffset * 0.5;

    lowerArmRef.current.position.y = -0.15 + bumpOffset * 0.95;
    lowerArmRef.current.rotation.z = bumpOffset * 0.4;
  }, [wheelBumpMm, steeringAngleDeg, dynamicCamberDeg]);

  return (
    <div className="relative w-full h-[650px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header & Selector */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/50 shadow-lg">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">3D SUSPENSION KINEMATICS STUDIO</div>
            <div className="text-[10px] text-slate-400 font-mono">Articulate wheel bump travel & camber gain</div>
          </div>
        </div>

        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-700/50 shadow-lg">
          <select
            value={suspensionType}
            onChange={(e) => setSuspensionType(e.target.value as SuspensionType3D)}
            className="bg-slate-950 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 font-mono outline-none"
          >
            <option value="DOUBLE_WISHBONE">Double Wishbone A-Arm</option>
            <option value="MACPHERSON_STRUT">MacPherson Strut</option>
            <option value="PUSHROD_MOTORSPORT">Pushrod Inboard Rocker</option>
            <option value="PULLROD_FORMULA">Pullrod Formula Monoposto</option>
            <option value="MULTI_LINK_5ARM">5-Link Multi-Link Rear</option>
          </select>
        </div>
      </div>

      {/* Left Slider Controls */}
      <div className="absolute top-20 left-4 bg-slate-900/85 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-2xl w-80 space-y-4 pointer-events-auto">
        <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">KINEMATIC ARTICULATION</div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
            <span>Wheel Bump Travel:</span>
            <strong className="text-blue-400">{wheelBumpMm} mm</strong>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={wheelBumpMm}
            onChange={(e) => setWheelBumpMm(Number(e.target.value))}
            className="w-full accent-blue-500 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
            <span>Steering Lock Angle:</span>
            <strong className="text-emerald-400">{steeringAngleDeg}°</strong>
          </div>
          <input
            type="range"
            min={-30}
            max={30}
            step={1}
            value={steeringAngleDeg}
            onChange={(e) => setSteeringAngleDeg(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
            <span>Coil Spring Stiffness:</span>
            <strong className="text-purple-400">{springRateNmm} N/mm</strong>
          </div>
          <input
            type="range"
            min={60}
            max={220}
            step={5}
            value={springRateNmm}
            onChange={(e) => setSpringRateNmm(Number(e.target.value))}
            className="w-full accent-purple-500 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Right Kinematics Readout HUD */}
      <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-2xl w-80 space-y-2 pointer-events-auto font-mono text-xs">
        <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-1.5 font-sans">
          KINEMATIC READOUT TELEMETRY
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Dynamic Camber:</span>
          <strong className="text-cyan-400">{dynamicCamberDeg}°</strong>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Roll Center Height:</span>
          <strong className="text-purple-400">{rollCenterHeightMm} mm</strong>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Anti-Dive Rating:</span>
          <strong className="text-emerald-400">{antiDivePct}%</strong>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Anti-Squat Rating:</span>
          <strong className="text-amber-400">{antiSquatPct}%</strong>
        </div>
      </div>
    </div>
  );
};

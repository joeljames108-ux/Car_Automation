// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — BRAKES & HYDRAULICS STUDIO WITH 3D MODEL
// ============================================================================

import React, { useState, useEffect, useRef, memo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Disc, Flame, Sliders, Shield, Box, Activity } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import type { BrakeDiscHolePattern } from "../../../sim/f1/types/f1Enums";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export const BrakesStudio: React.FC = memo(function BrakesStudio() {
  const { car, updateBrakes } = useF1ConstructorStore();
  const b = car.brakes;

  const [brakeSimTemp, setBrakeSimTemp] = useState(650); // 200°C to 1050°C
  const mount3DRef = useRef<HTMLDivElement>(null);
  const discMeshRef = useRef<THREE.Mesh | null>(null);

  // 3D Carbon-Carbon Brake Assembly Viewport Setup
  useEffect(() => {
    if (!mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    scene.fog = new THREE.FogExp2(0x060914, 0.05);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(2.2, 1.2, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const redLight = new THREE.PointLight(0xef4444, 2.0, 5);
    redLight.position.set(0, 0, 1);
    scene.add(redLight);

    // 1. Carbon-Carbon Ventilated Brake Disc
    const discGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.12, 48);
    discGeom.rotateX(Math.PI / 2);

    const discMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0xef4444,
      emissiveIntensity: (brakeSimTemp - 200) / 850,
    });
    const discMesh = new THREE.Mesh(discGeom, discMat);
    scene.add(discMesh);
    discMeshRef.current = discMesh;

    // Center Hub & Mounting Pins
    const hubGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 24);
    hubGeom.rotateX(Math.PI / 2);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    scene.add(new THREE.Mesh(hubGeom, hubMat));

    // 2. 6-Piston Monobloc Caliper Assembly (Red Anodized Finish)
    const caliperGroup = new THREE.Group();
    const caliperGeom = new THREE.BoxGeometry(0.4, 0.45, 0.8);
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const caliperMesh = new THREE.Mesh(caliperGeom, caliperMat);
    caliperGroup.add(caliperMesh);

    // Hydraulic Pistons
    const pistonGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);
    pistonGeom.rotateZ(Math.PI / 2);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });

    for (let i = -1; i <= 1; i++) {
      const p1 = new THREE.Mesh(pistonGeom, pistonMat);
      p1.position.set(-0.15, i * 0.12, 0);
      caliperGroup.add(p1);
    }
    caliperGroup.position.set(0.9, 0.3, 0);
    scene.add(caliperGroup);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      if (discMeshRef.current) {
        discMeshRef.current.rotation.z += 0.02;
      }
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
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // Update Disc Glow Shader based on simulated brake temperature slider
  useEffect(() => {
    if (!discMeshRef.current) return;
    const mat = discMeshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      mat.emissiveIntensity = Math.max(0, (brakeSimTemp - 200) / 850);
      if (brakeSimTemp > 800) {
        mat.emissive.setHex(0xf97316); // Orange-red incandescent heat
      } else {
        mat.emissive.setHex(0xef4444); // Crimson red
      }
    }
  }, [brakeSimTemp]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-red-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-red-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Disc className="text-red-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              Carbon-Carbon Brakes & Brake-By-Wire Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Engineer the 5.8G deceleration braking system: 1050-hole ventilated carbon discs (operating at up to 1000°C), monobloc 6-piston calipers, front/rear brake cooling duct aero trade-offs, and rear MGU-K regen blending.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-red-400">
              {car.computedMaxBrakingGLong} <span className="text-xs text-slate-400 font-normal">G</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Peak Deceleration</div>
          </div>
        </div>
      </div>

      {/* Interactive 3D Carbon-Carbon Brake Assembly Viewport */}
      <div className="w-full bg-slate-950/90 rounded-2xl border border-red-500/30 p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <Box size={14} />
            <span>3D CARBON-CARBON BRAKE DISC & MONOBLOC CALIPER VIEWPORT</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-orange-400" />
              <span>DISC TEMP: <span className="text-red-400 font-bold">{brakeSimTemp}°C</span></span>
            </span>
            <input
              type="range"
              min="200"
              max="1050"
              step="25"
              value={brakeSimTemp}
              onChange={(e) => setBrakeSimTemp(parseInt(e.target.value))}
              className="w-28 accent-red-400 cursor-pointer"
            />
          </div>
        </div>

        <div ref={mount3DRef} className="w-full h-[240px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800 relative">
          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded border border-slate-700 pointer-events-none">
            ORBIT: DRAG TO ROTATE 3D CALIPER · SCROLL TO ZOOM
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Carbon Disc Ventilation Holes */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Disc Cooling Drill Pattern</span>
            <span className="text-[10px] text-red-400 font-mono">1,000°C Peak</span>
          </label>
          <select
            value={b.frontDiscHoleCount}
            onChange={(e) => {
              playHMIClickSound();
              updateBrakes({
                frontDiscHoleCount: e.target.value as BrakeDiscHolePattern,
                rearDiscHoleCount: e.target.value as BrakeDiscHolePattern,
              });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="600_HOLE_MEDIUM_COOLING">600 Holes (Low Drag / Silverstone)</option>
            <option value="1050_HOLE_HIGH_VENT">1050 Holes (Standard F1 GP)</option>
            <option value="1480_HOLE_CHEVRON_EXTREME">1480 Holes (Extreme Montreal / Singapore)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            More cooling holes reduce disc temperatures but reduce mechanical surface contact area.
          </p>
        </div>

        {/* 2. Default Brake Bias */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Front Brake Bias</span>
            <span className="font-mono text-red-400 font-bold">{b.brakeBiasDefaultFrontPercent.toFixed(1)}% Front</span>
          </div>
          <input
            type="range"
            min="52.0"
            max="62.0"
            step="0.5"
            value={b.brakeBiasDefaultFrontPercent}
            onChange={(e) => updateBrakes({ brakeBiasDefaultFrontPercent: parseFloat(e.target.value) })}
            className="w-full accent-red-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>52.0% (Rear Bias / Rotate)</span>
            <span>56.5% (Standard)</span>
            <span>62.0% (Front Lock Risk)</span>
          </div>
        </div>

        {/* 3. Front Brake Duct Inlet Area */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Front Brake Duct Inlet Size</span>
            <span className="font-mono text-red-400 font-bold">{b.frontBrakeDuctInletAreaCm2} cm²</span>
          </div>
          <input
            type="range"
            min="45"
            max="130"
            step="2"
            value={b.frontBrakeDuctInletAreaCm2}
            onChange={(e) => updateBrakes({ frontBrakeDuctInletAreaCm2: parseInt(e.target.value) })}
            className="w-full accent-red-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>45 cm² (Min Drag)</span>
            <span>78 cm²</span>
            <span>130 cm² (Max Cooling)</span>
          </div>
        </div>

        {/* 4. Brake-by-Wire Response Latency */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">BBW MGU-K Regen Response</span>
            <span className="font-mono text-red-400 font-bold">{b.brakeByWireReactionTimeMs} ms</span>
          </div>
          <input
            type="range"
            min="4"
            max="12"
            step="1"
            value={b.brakeByWireReactionTimeMs}
            onChange={(e) => updateBrakes({ brakeByWireReactionTimeMs: parseInt(e.target.value) })}
            className="w-full accent-red-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>4 ms (Ultra Fast)</span>
            <span>6 ms</span>
            <span>12 ms</span>
          </div>
        </div>

        {/* 5. Brake Pad Carbon Compound */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Carbon-Carbon Pad Compound</span>
            <span className="text-[10px] text-red-400 font-mono">Bite Curve</span>
          </label>
          <select
            value={b.brakePadCompound}
            onChange={(e) => {
              playHMIClickSound();
              updateBrakes({ brakePadCompound: e.target.value as any });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="CARBONE_INDUSTRIE_CCR">Carbone Industrie CCR (Linear Modulation)</option>
            <option value="BREMBO_HIGH_FRICTION_CERAMIC">Brembo High-Initial-Bite Ceramic Matrix</option>
          </select>
          <p className="text-[11px] text-slate-500">
            High-bite pads offer sharp initial deceleration into heavy braking zones like Monza Turn 1.
          </p>
        </div>

        {/* 6. High-Temp Hydraulic Fluid */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Hydraulic Brake Fluid</span>
            <span className="text-[10px] text-red-400 font-mono">Boiling Point</span>
          </label>
          <select
            value={b.brakeFluidType}
            onChange={(e) => {
              playHMIClickSound();
              updateBrakes({ brakeFluidType: e.target.value as any });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="SILICONE_ESTER_350C">Silicone Ester Racing Fluid (350°C Dry Boiling)</option>
            <option value="DOT_5_1_RACING">Castrol SRF DOT 5.1 Synthetic</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Zero-compressibility hydraulic fluid ensures a rock-solid pedal feel for the driver.
          </p>
        </div>
      </div>
    </div>
  );
});


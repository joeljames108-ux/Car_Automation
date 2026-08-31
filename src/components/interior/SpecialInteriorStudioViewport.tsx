// ===================================================================
// SPECIAL INTERIOR STUDIO 3D INTERACTIVE VIEWPORT & DASHBOARD
// ===================================================================
// Vision Glass 3D Interior & Ergonomics Studio Dashboard:
// - Interactive 3D Three.js Cockpit Viewport (Seats, Dashboard, Steering Wheel, Pedals)
// - SAE J941 H-Point & Eyellipse Eyepoint Ergonomic Telemetry
// - 4-Zone Cabin HVAC Thermodynamics & Fanger PMV Thermal Comfort
// - AR Head-Up Display (HUD) & NHTSA Driver Distraction Audit
// ===================================================================

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HyperFidelityCockpitInterior3DGenerator } from "../../exterior3d/geometry/hyperFidelityCockpitInterior3dGenerator";
import { InteriorErgonomicsEngine } from "../../sim/interior/interiorErgonomicsEngine";
import { CabinHvacThermalEngine } from "../../sim/interior/cabinHvacThermalEngine";
import { InfotainmentHmiEngine } from "../../sim/interior/infotainmentHmiEngine";
import { Sofa, Sliders, Sun, ShieldAlert, Sparkles, Eye, Radio, Thermometer, RotateCcw } from "lucide-react";

export const SpecialInteriorStudioViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"SPORT_CARBON" | "LUXURY_EXECUTIVE" | "GT_ALCANTARA" | "FUTURISTIC_EV">("SPORT_CARBON");
  const [leatherHex, setLeatherHex] = useState<string>("#1c1e24");
  const [ambientHex, setAmbientHex] = useState<string>("#00f0ff");

  // Ergonomic Sliders
  const [seatTrackMm, setSeatTrackMm] = useState<number>(120);
  const [seatHeightMm, setSeatHeightMm] = useState<number>(30);
  const [torsoReclineDeg, setTorsoReclineDeg] = useState<number>(25);

  // HVAC State
  const [targetTempC, setTargetTempC] = useState<number>(22.0);
  const [solarSoakWm2, setSolarSoakWm2] = useState<number>(850);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const interiorGroupRef = useRef<THREE.Group | null>(null);

  // 1. Run Simulations
  const ergonomics = InteriorErgonomicsEngine.evaluateErgonomics({
    roofHeightMm: 1250,
    wheelbaseMm: 2750,
    cabinWidthMm: 1550,
    hoodHeightMm: 780,
    aPillarWidthMm: 65,
    seatTrackForeAftMm: seatTrackMm,
    seatHeightAdjMm: seatHeightMm,
    torsoAngleDeg: torsoReclineDeg,
  });

  const hvac = CabinHvacThermalEngine.solveCabinThermodynamics({
    ambientTempC: 35.0,
    solarSoakWm2,
    cabinVolumeM3: 3.8,
    glassAcousticTinted: true,
    heatPumpMode: "COOLING",
  });

  const hmi = InfotainmentHmiEngine.simulateHmiSystem({
    hasArHud: true,
    touchscreenDiagonalInches: 14.5,
    hasPhysicalClimateButtons: true,
    speakerCount: 18,
  });

  // 2. Three.js 3D Viewport Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090b10);
    scene.fog = new THREE.FogExp2(0x090b10, 0.05);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0.65, 0.65, 0.95); // Inside cockpit viewpoint

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.45, 0.1);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const cabinDomeLight = new THREE.PointLight(parseInt(ambientHex.replace("#", "0x")), 2.0, 5.0);
    cabinDomeLight.position.set(0, 0.85, 0);
    scene.add(cabinDomeLight);

    // Initial 3D Interior Mesh
    const interiorMesh = HyperFidelityCockpitInterior3DGenerator.buildInterior3DGroup({
      theme,
      primaryLeatherColorHex: parseInt(leatherHex.replace("#", "0x")),
      ambientLightColorHex: parseInt(ambientHex.replace("#", "0x")),
    });
    scene.add(interiorMesh);
    interiorGroupRef.current = interiorMesh;

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
  }, [theme, leatherHex, ambientHex]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="backdrop-blur-xl p-6 rounded-2xl flex items-center justify-between shadow-2xl" style={{backgroundColor: 'rgba(255,248,235,0.9)', border: '1px solid rgba(217,166,78,0.4)'}}>
        <div>
          <h2 className="text-xl font-black tracking-wider flex items-center space-x-2" style={{color: '#92400E'}}>
            <Sofa className="w-6 h-6" style={{color: '#92400E'}} />
            <span>SPECIAL INTERIOR 3D CAD & ERGONOMICS STUDIO</span>
          </h2>
          <p className="text-xs mt-1" style={{color: '#92400E', opacity: 0.7}}>
            SAE J941 Eyellipse Eyepoint kinematics, 4-zone cabin HVAC thermodynamics, and AR Head-Up Display (HUD) HMI optics.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="px-4 py-2 rounded-xl font-bold" style={{backgroundColor: 'rgba(217,166,78,0.1)', border: '1px solid rgba(217,166,78,0.3)', color: '#92400E'}}>
            ERGONOMIC GRADE: {ergonomics.ergonomicGrade}
          </div>
        </div>
      </div>

      {/* 3D Interactive Viewport Container */}
      <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl" style={{backgroundColor: '#FFF8EB', border: '1px solid rgba(217,166,78,0.3)'}}>
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Viewport Top Left Theme Controls */}
        <div className="absolute top-4 left-4 flex items-center space-x-3 pointer-events-auto backdrop-blur-md p-2.5 rounded-xl shadow-lg text-xs" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.3)'}}>
          <label className="font-bold" style={{color: '#92400E'}}>THEME:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="text-xs rounded-lg px-2.5 py-1.5 font-mono outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
          >
            <option value="SPORT_CARBON">Sport Carbon Fiber</option>
            <option value="LUXURY_EXECUTIVE">Executive Nappa Leather</option>
            <option value="GT_ALCANTARA">Grand Tourer Alcantara</option>
            <option value="FUTURISTIC_EV">Futuristic EV Lounge</option>
          </select>
        </div>

        {/* Left Slider Controls Overlay */}
        <div className="absolute top-20 left-4 bg-amber-950/80/85 backdrop-blur-md p-4 rounded-xl border border-amber-700/30/50 shadow-2xl w-80 space-y-4 pointer-events-auto">
          <div className="text-xs font-bold text-amber-100 border-b border-amber-800/30 pb-2 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>SAE H-POINT SEAT ADJUSTMENTS</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-amber-200 mb-1.5 font-mono">
              <span>Seat Travel (Fore-Aft):</span>
              <strong className="text-amber-400">{seatTrackMm} mm</strong>
            </div>
            <input
              type="range"
              min={0}
              max={240}
              step={10}
              value={seatTrackMm}
              onChange={(e) => setSeatTrackMm(Number(e.target.value))}
              className="w-full accent-amber-500 bg-amber-950 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-amber-200 mb-1.5 font-mono">
              <span>Torso Recline Angle:</span>
              <strong className="text-amber-400">{torsoReclineDeg}°</strong>
            </div>
            <input
              type="range"
              min={18}
              max={35}
              step={1}
              value={torsoReclineDeg}
              onChange={(e) => setTorsoReclineDeg(Number(e.target.value))}
              className="w-full accent-purple-500 bg-amber-950 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-amber-200 mb-1.5 font-mono">
              <span>Solar Soak Radiation:</span>
              <strong className="text-amber-400">{solarSoakWm2} W/m²</strong>
            </div>
            <input
              type="range"
              min={200}
              max={1200}
              step={50}
              value={solarSoakWm2}
              onChange={(e) => setSolarSoakWm2(Number(e.target.value))}
              className="w-full accent-amber-500 bg-amber-950 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right Telemetry Readout Overlay */}
        <div className="absolute bottom-4 right-4 bg-amber-950/80/85 backdrop-blur-md p-4 rounded-xl border border-amber-700/30/50 shadow-2xl w-80 space-y-2.5 pointer-events-auto font-mono text-xs">
          <div className="text-xs font-bold text-amber-100 border-b border-amber-800/30 pb-1.5 font-sans flex items-center justify-between">
            <span>ERGONOMICS & HVAC TELEMETRY</span>
            <span className="text-emerald-400">{ergonomics.overallErgonomicsScore}/100</span>
          </div>

          <div className="flex justify-between">
            <span className="text-amber-300/70">SAE H-Point (X/Z):</span>
            <strong className="text-amber-400">{ergonomics.hPointKinematics.hPointXMm} / {ergonomics.hPointKinematics.hPointZMm} mm</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-amber-300/70">A-Pillar Obscuration:</span>
            <strong className="text-amber-400">{ergonomics.visibility.leftAPillarBlindSpotDeg}°</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-amber-300/70">HVAC Cooldown Time:</span>
            <strong className="text-amber-400">{hvac.cooldownPullDownTimeMinutes} min</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-amber-300/70">AR HUD Virtual Distance:</span>
            <strong className="text-emerald-400">{hmi.arHudSpec.virtualImageDistanceMeters} m</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

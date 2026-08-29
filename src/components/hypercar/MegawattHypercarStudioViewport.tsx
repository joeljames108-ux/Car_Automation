// ===================================================================
// MEGAWATT HYPERCAR STUDIO 3D INTERACTIVE VIEWPORT & DASHBOARD
// ===================================================================
// Vision Glass 1,600+ HP Megawatt Hypercar Studio Dashboard:
// - Interactive 3D Three.js Hypercar Viewport (Carbotanium Tub, DRS Wing, Tri-Motor)
// - Carbotanium Monocoque Structural FEA & Tsai-Wu Failure Index
// - Active Ground-Effect Venturi Suction & 2.5Hz Porpoising Limit Cycles
// - 420mm Carbon-Ceramic Matrix Brake 1,400°C Thermal Pyrometry
// ===================================================================

import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CarboTitaniumMonocoqueSolver } from "../../sim/hypercar/carboTitaniumMonocoqueSolver";
import { MegawattTriMotorPowertrainEngine } from "../../sim/hypercar/megawattTriMotorPowertrainEngine";
import { ActiveGroundEffectVenturiAeromechanics, ActiveDrsMode } from "../../sim/hypercar/activeGroundEffectVenturiAeromechanics";
import { CarbonCeramicMatrixBrakeThermalFea } from "../../sim/hypercar/carbonCeramicMatrixBrakeThermalFea";
import { Car3DGeometryGenerator } from "../../exterior3d/geometry/car3dGeometryGenerator";
import { Zap, Sliders, Wind, Flame, ShieldAlert, Activity, Trophy, Play } from "lucide-react";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

const MegawattHypercarStudioViewportComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [drsMode, setDrsMode] = useState<ActiveDrsMode>("HIGH_DOWNFORCE_CORNERING");
  const [airspeedKmH, setAirspeedKmH] = useState<number>(320);
  const [rideHeightMm, setRideHeightMm] = useState<number>(35);
  const [icePowerHp, setIcePowerHp] = useState<number>(1050);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 1. Run Simulations with useMemo
  const monocoqueFea = useMemo(() => {
    return CarboTitaniumMonocoqueSolver.solveMonocoque({
      plyCount: 32,
      titaniumMeshVolRatioPct: 18,
      monocoqueLengthMm: 2750,
      monocoqueWidthMm: 1450,
      monocoqueHeightMm: 1100,
      appliedTorsionalMomentNm: 15000,
    });
  }, []);

  const powertrain = useMemo(() => {
    return MegawattTriMotorPowertrainEngine.solvePowertrainKinetics({
      vehicleMassKg: 1480,
      icePowerHp,
      frontLeftMotorKw: 350,
      frontRightMotorKw: 350,
      batteryCapacityKwh: 85,
      dragCoefficientCd: 0.31,
      frontalAreaM2: 2.05,
    });
  }, [icePowerHp]);

  const aero = useMemo(() => {
    return ActiveGroundEffectVenturiAeromechanics.solveAeromechanics({
      airspeedKmH,
      rideHeightMm,
      drsMode,
      wingAngleDeg: 12.0,
    });
  }, [airspeedKmH, rideHeightMm, drsMode]);

  const brakeFea = useMemo(() => {
    return CarbonCeramicMatrixBrakeThermalFea.solveBrakeThermalFea({
      entrySpeedKmH: airspeedKmH,
      vehicleMassKg: 1480,
      rotorSpec: {
        outerDiameterMm: 420,
        innerDiameterMm: 240,
        thicknessMm: 40,
        rotorMassKg: 6.8,
        materialType: "CARBON_SILICON_CARBIDE_CSIC_R",
        maxOperatingTempC: 1450,
        specificHeatJPerKgK: 1200,
        thermalConductivityWPerMK: 45,
      },
      caliperSpec: {
        pistonCount: 10,
        pistonMaterial: "TITANIUM_NITRIDE_COATED",
        caliperBodyMaterial: "ALUMINUM_LITHIUM_MONOBLOC",
        maxHydraulicLinePressureBar: 120,
        totalPistonAreaCm2: 85,
      },
      hydraulicLinePressureBar: 95,
      ambientTempC: 30,
    });
  }, [airspeedKmH]);

  // 2. Three.js 3D Viewport Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(3.5, 1.8, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.0);
    keyLight.position.set(6, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfbbf24, 1.8);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    const gridHelper = new THREE.GridHelper(10, 20, 0x00f0ff, 0x1f293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 3D Hypercar Monocoque & Outer Skin
    const hypercar3D = Car3DGeometryGenerator.buildCar3DGroup("HYPERCAR_MONOCOQUE", 0x111317);
    scene.add(hypercar3D);

    // Adaptive Render Loop Controller
    let isDirty = true;
    let lastActiveTime = performance.now();
    const markDirty = () => {
      isDirty = true;
      lastActiveTime = performance.now();
    };

    controls.addEventListener("change", markDirty);

    // Animation Loop with Tab Visibility Suspension
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.hidden) return;

      if (isDirty) {
        controls.update();
        renderer.render(scene, camera);
        if (performance.now() - lastActiveTime > 1500) {
          isDirty = false;
        }
      }
    };
    animate();

    const handleVisibilityChange = () => {
      if (!document.hidden && renderer && scene && camera) {
        markDirty();
        renderer.render(scene, camera);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      markDirty();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-2xl">
        <div>
          <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 flex items-center space-x-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>1,600+ HP MEGAWATT HYPERCAR ENGINEERING STUDIO</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Carbotanium monocoque FEA, active ground-effect Venturi suction, 2.5Hz porpoising limit cycles & 1,400°C carbon-ceramic brakes.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-bold">
            POWERTRAIN: {powertrain.combinedPeakPowerHp} HP / {powertrain.combinedPeakTorqueNm} Nm
          </div>
        </div>
      </div>

      {/* Interactive 3D Viewport */}
      <div className="relative w-full h-[600px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* DRS Mode Selector Toolbar */}
        <div className="absolute top-4 left-4 flex items-center space-x-3 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/50 shadow-lg text-xs">
          <label className="font-bold text-slate-400">ACTIVE DRS WING:</label>
          <select
            value={drsMode}
            onChange={(e) => {
              playHMIClickSound();
              setDrsMode(e.target.value as ActiveDrsMode);
            }}
            className="bg-slate-950 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 font-mono outline-none cursor-pointer"
          >
            <option value="HIGH_DOWNFORCE_CORNERING">High Downforce Cornering Mode</option>
            <option value="LOW_DRAG_STRAIGHT_SPRINT">Low Drag Straight Sprint (DRS Open)</option>
            <option value="AIRBRAKE_DECELERATION_1_8G">Airbrake 1.8G Deceleration Mode</option>
          </select>
        </div>

        {/* Left Slider Controls */}
        <div className="absolute top-20 left-4 bg-slate-900/85 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-2xl w-80 space-y-4 pointer-events-auto">
          <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>HYPERCAR KINETIC SLIDERS</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
              <span>Vehicle Airspeed:</span>
              <strong className="text-amber-400">{airspeedKmH} km/h</strong>
            </div>
            <input
              type="range"
              min={100}
              max={430}
              step={10}
              value={airspeedKmH}
              onChange={(e) => setAirspeedKmH(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
              <span>Ride Height (Venturi Throat):</span>
              <strong className="text-amber-400">{rideHeightMm} mm</strong>
            </div>
            <input
              type="range"
              min={15}
              max={70}
              step={1}
              value={rideHeightMm}
              onChange={(e) => setRideHeightMm(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-mono">
              <span>V12 ICE Output Power:</span>
              <strong className="text-amber-400">{icePowerHp} HP</strong>
            </div>
            <input
              type="range"
              min={700}
              max={1300}
              step={25}
              value={icePowerHp}
              onChange={(e) => setIcePowerHp(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right Telemetry Overlay */}
        <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-2xl w-80 space-y-2 font-mono text-xs pointer-events-auto">
          <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-1.5 font-sans flex items-center justify-between">
            <span>MEGAWATT HYPERCAR TELEMETRY</span>
            <span className="text-emerald-400">0-400 km/h: {powertrain.acceleration0_400KmHSec}s</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Carbotanium Rigidity:</span>
            <strong className="text-amber-400">{monocoqueFea.torsionalRigidityNmPerDeg.toLocaleString()} Nm/deg</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Total Downforce @ {airspeedKmH}km/h:</span>
            <strong className="text-amber-400">{aero.totalDownforceKg} kg ({aero.totalDownforceN} N)</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Porpoising Status:</span>
            <strong className={`${aero.porpoisingRiskStatus.includes("PORPOISING") ? "text-rose-400" : "text-emerald-400"}`}>
              {aero.porpoisingRiskStatus}
            </strong>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">420mm Rotor Pyrometry:</span>
            <strong className="text-rose-400">{brakeFea.rotorSurfaceTempPeakC}°C</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">0-100 km/h Sprint:</span>
            <strong className="text-emerald-400">{powertrain.acceleration0_100KmHSec}s</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MegawattHypercarStudioViewport = memo(MegawattHypercarStudioViewportComponent);


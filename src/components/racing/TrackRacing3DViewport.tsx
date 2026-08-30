// ===================================================================
// INTERACTIVE 3D TRACK RACING SIMULATOR VIEWPORT & TELEMETRY HUD
// ===================================================================
// Real-time 3D Three.js race track simulation with live telemetry:
// - Multi-Sector Lap Simulation (Spa-Francorchamps, Nürburgring Nordschleife)
// - 4-Wheel Tire Thermal Pyrometry (FL, FR, RL, RR °C & % Wear)
// - AI Driver Aggression Profiles & Pit Stop Strategy Engine
// ===================================================================

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  TrackRacingSimulator,
  MASTER_RACE_TRACKS,
  TrackCircuitConfig,
  AiDriverAggression,
  DriverStintTelemetry,
} from "../../sim/racing/trackRacingSimulator";
import { Car3DGeometryGenerator } from "../../exterior3d/geometry/car3dGeometryGenerator";
import { disposeThreeScene } from "../../exterior3d/utils/threeDisposal";
import { Flag, Play, Pause, RotateCcw, Flame, ShieldAlert, Zap, Trophy, Sliders } from "lucide-react";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

const TrackRacing3DViewportComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedTrack, setSelectedTrack] = useState<TrackCircuitConfig>(MASTER_RACE_TRACKS[0]);
  const [driverAggression, setDriverAggression] = useState<AiDriverAggression>("AGGRESSIVE_LATE_BRAKER");
  const [isRacingActive, setIsRacingActive] = useState<boolean>(true);

  const [telemetry, setTelemetry] = useState<DriverStintTelemetry>({
    currentLap: 1,
    totalLaps: 15,
    sectorTimesMs: [45000, 58000, 32000],
    totalLapTimeMs: 135000,
    gapToLeaderSeconds: 0.0,
    tireWearPct: 100.0,
    tireSurfaceTempC: 92.0,
    fuelRemainingKg: 45.0,
    isPittingThisLap: false,
    pitStopStrategy: "STAY_OUT",
    driverMistakeOccurred: false,
    apexSpeedAvgKmH: 142.5,
  });

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carMeshRef = useRef<THREE.Group | null>(null);

  // 1. Simulation Step Loop (Every 2.5 seconds = 1 race lap)
  useEffect(() => {
    if (!isRacingActive) return;

    const timer = setInterval(() => {
      if (document.hidden) return;

      setTelemetry((prev) =>
        TrackRacingSimulator.simulateRaceLap({
          track: selectedTrack,
          driverAggression,
          vehicleWeightKg: 1420,
          vehicleDownforceNAt200: 3800,
          vehicleHorsepower: 720,
          currentTelemetry: prev,
        })
      );
    }, 2500);

    return () => clearInterval(timer);
  }, [isRacingActive, selectedTrack, driverAggression]);


  // 2. Three.js 3D Track Viewport
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.0, 2.5, 5.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(8, 12, 6);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Curved Track Path Ribbon
    const trackCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 3.5),
      new THREE.Vector3(2.5, 0, 1.5),
      new THREE.Vector3(3.0, 0, -2.0),
      new THREE.Vector3(0, 0, -3.5),
      new THREE.Vector3(-3.0, 0, -1.5),
      new THREE.Vector3(-2.0, 0, 2.0),
    ]);
    trackCurve.closed = true;

    const trackGeo = new THREE.TubeGeometry(trackCurve, 100, 0.45, 8, true);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.85 });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.scale.set(1, 0.05, 1); // Flatten to road plane
    scene.add(trackMesh);

    // 3D Car Model traversing circuit
    const car3D = Car3DGeometryGenerator.buildCar3DGroup("GT3_RACE_CAR", 0xd6001c);
    car3D.scale.set(0.45, 0.45, 0.45);
    scene.add(car3D);
    carMeshRef.current = car3D;

    // Adaptive Animation Loop Controller
    let isDirty = true;
    let lastActiveTime = performance.now();
    const markDirty = () => {
      isDirty = true;
      lastActiveTime = performance.now();
    };

    controls.addEventListener("change", markDirty);

    let animId: number;
    let progress = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (document.hidden) return;

      if (isRacingActive) {
        progress += 0.002;
        if (progress > 1) progress = 0;
        const pt = trackCurve.getPoint(progress);
        const tangent = trackCurve.getTangent(progress);

        car3D.position.set(pt.x, 0.05, pt.z);
        car3D.lookAt(pt.x + tangent.x, 0.05, pt.z + tangent.z);
        markDirty();
      }

      if (isDirty || isRacingActive) {
        controls.update();
        renderer.render(scene, camera);
        if (performance.now() - lastActiveTime > 2000 && !isRacingActive) {
          isDirty = false;
        }
      }
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      markDirty();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) markDirty();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      disposeThreeScene(scene, renderer);
    };
  }, [isRacingActive]);


  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = ((ms % 60000) / 1000).toFixed(3);
    return `${min}:${sec.padStart(6, "0")}`;
  };

  return (
    <div className="relative w-full h-[650px] bg-amber-950/80 rounded-2xl overflow-hidden border border-amber-800/30 shadow-2xl">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto bg-amber-900/40 backdrop-blur-md p-2.5 rounded-xl border border-amber-700/30/50 shadow-lg">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-2">
              <span>{selectedTrack.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-800/35 text-amber-100/80">
                {selectedTrack.country}
              </span>
            </div>
            <div className="text-[10px] text-amber-200/60 font-mono">
              {selectedTrack.totalLengthKm} km • Ref: {formatTime(selectedTrack.baseReferenceLapTimeMs)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 pointer-events-auto bg-amber-900/40 backdrop-blur-md p-2 rounded-xl border border-amber-700/30/50 shadow-lg">
          <select
            value={driverAggression}
            onChange={(e) => {
              playHMIClickSound();
              setDriverAggression(e.target.value as AiDriverAggression);
            }}
            className="bg-amber-950/80 text-amber-50 text-xs rounded-lg px-2.5 py-1.5 border border-amber-700/30 font-mono outline-none cursor-pointer"
          >
            <option value="CONSERVATIVE_TIRE_SAVER">Conservative (Tire Saver)</option>
            <option value="BALANCED_CALCULATED">Balanced (Calculated Apex)</option>
            <option value="AGGRESSIVE_LATE_BRAKER">Aggressive (Late Braker)</option>
            <option value="HIGH_RISK_QUALIFYING_ATTACK">High Risk (Qualifying Attack)</option>
          </select>

          <button
            onClick={() => {
              playHMIClickSound();
              setIsRacingActive(!isRacingActive);
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/30 cursor-pointer"
          >
            {isRacingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isRacingActive ? "PAUSE RACE" : "RESUME RACE"}</span>
          </button>
        </div>
      </div>

      {/* Telemetry HUD Overlay (Left Panel) */}
      <div className="absolute top-20 left-4 bg-amber-900/40 backdrop-blur-md p-4 rounded-xl border border-amber-700/30/50 shadow-2xl w-80 space-y-3 pointer-events-auto">
        <div className="flex items-center justify-between border-b border-amber-800/30 pb-2">
          <span className="text-xs font-bold text-amber-50 flex items-center space-x-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>RACE TELEMETRY HUD</span>
          </span>
          <span className="text-xs font-mono font-black text-emerald-400">
            LAP {telemetry.currentLap} / {telemetry.totalLaps}
          </span>
        </div>

        {/* Sector Times */}
        <div className="grid grid-cols-3 gap-2 font-mono text-center">
          <div className="bg-amber-950/80 p-2 rounded-lg border border-amber-800/30">
            <div className="text-[9px] text-amber-200/60">SECTOR 1</div>
            <div className="text-xs font-bold text-amber-400 mt-0.5">{(telemetry.sectorTimesMs[0] / 1000).toFixed(2)}s</div>
          </div>
          <div className="bg-amber-950/80 p-2 rounded-lg border border-amber-800/30">
            <div className="text-[9px] text-amber-200/60">SECTOR 2</div>
            <div className="text-xs font-bold text-amber-400 mt-0.5">{(telemetry.sectorTimesMs[1] / 1000).toFixed(2)}s</div>
          </div>
          <div className="bg-amber-950/80 p-2 rounded-lg border border-amber-800/30">
            <div className="text-[9px] text-amber-200/60">SECTOR 3</div>
            <div className="text-xs font-bold text-amber-400 mt-0.5">{(telemetry.sectorTimesMs[2] / 1000).toFixed(2)}s</div>
          </div>
        </div>

        {/* Last Lap Time & Gap */}
        <div className="flex justify-between items-center bg-amber-950/80 p-2.5 rounded-lg border border-amber-800/30 font-mono text-xs">
          <span className="text-amber-200/60">LAST LAP:</span>
          <strong className="text-emerald-400 font-bold">{formatTime(telemetry.totalLapTimeMs)}</strong>
        </div>

        {/* Tire Wear & Thermal Pyrometry */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-amber-200/60">Tire Life Remaining:</span>
            <strong className={`${telemetry.tireWearPct < 30 ? "text-rose-400" : "text-emerald-400"}`}>
              {telemetry.tireWearPct}%
            </strong>
          </div>
          <div className="w-full bg-amber-950/80 h-2 rounded-full overflow-hidden border border-amber-800/30">
            <div
              className={`h-full transition-all duration-500 ${
                telemetry.tireWearPct < 30 ? "bg-rose-500" : "bg-emerald-500"
              }`}
              style={{ width: `${telemetry.tireWearPct}%` }}
            />
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-amber-200/60">Tire Temp (Surface):</span>
            <strong className="text-amber-400">{telemetry.tireSurfaceTempC}°C</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-200/60">Fuel Mass:</span>
            <strong className="text-amber-400">{telemetry.fuelRemainingKg} kg</strong>
          </div>
        </div>

        {/* Pit Stop Alert Banner */}
        {telemetry.isPittingThisLap && (
          <div className="bg-amber-500/20 border border-amber-500/40 p-2 rounded-lg text-amber-300 text-xs font-bold flex items-center space-x-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>BOX THIS LAP: {telemetry.pitStopStrategy}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const TrackRacing3DViewport = React.memo(TrackRacing3DViewportComponent);


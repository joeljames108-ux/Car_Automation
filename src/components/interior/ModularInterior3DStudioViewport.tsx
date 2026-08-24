/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — PHOTOREALISTIC 3D CABIN VIEWPORT
 * ============================================================================
 * Luxury automotive configurator viewport:
 * - Direct Click-to-Edit 3D Raycasting with hover highlight & part focus
 * - 3 Cinematic Lighting Modes (Daylight Showroom, Sunset Gold, Midnight Cyberpunk)
 * - 7 Precision Interior Camera Poses (Driver POV, Passenger POV, Cluster, Console, Seats, Rear, Macro)
 * - Real-Time Functional Cluster Telemetry & Central Infotainment HMI Simulation
 * - Interactive Door Swing Kinematics (0° to 65° open angle) with Sound Feedback
 * - 3D Ergonomics & SAE J1100 Clearance Overlay Toggle
 * - Continuous Exploded View Slider (0.0 to 1.0)
 * ============================================================================
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Layers,
  Maximize2,
  Activity,
  Sun,
  Sunset,
  Moon,
  DoorOpen,
  Volume2,
  Tv,
  Eye,
  Sliders,
} from "lucide-react";
import { MasterModularInteriorState } from "../../sim/interior/masterInteriorTypes";
import { MasterModularInterior3DAssembler } from "../../exterior3d/generators/interior/masterModularInterior3DAssembler";
import { InfotainmentScreenMode } from "../../exterior3d/generators/interior/functionalInfotainmentRenderer";
import { CabinAcousticSynthesizer } from "../../sim/interior/cabinAcousticSynthesizer";

export type LightingMode = "daylight" | "sunset" | "midnight";

interface ModularInterior3DStudioViewportProps {
  state: MasterModularInteriorState;
  selectedPartId?: string;
  onSelectPart?: (partId: "seats" | "dash" | "console" | "materials" | "audio_safety" | "bespoke") => void;
}

export const ModularInterior3DStudioViewport: React.FC<ModularInterior3DStudioViewportProps> = ({
  state,
  selectedPartId,
  onSelectPart,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [explodedFactor, setExplodedFactor] = useState<number>(0.0);
  const [simRpm, setSimRpm] = useState<number>(4200);
  const [steeringAngleDeg, setSteeringAngleDeg] = useState<number>(0);
  const [doorOpenAngleDeg, setDoorOpenAngleDeg] = useState<number>(0);
  const [activeCameraPose, setActiveCameraPose] = useState<string>("driver_pov");
  const [lightingMode, setLightingMode] = useState<LightingMode>("midnight");
  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);
  const [infotainmentMode, setInfotainmentMode] = useState<InfotainmentScreenMode>("telemetry");
  const [showErgonomics, setShowErgonomics] = useState<boolean>(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const interiorGroupRef = useRef<THREE.Group | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const spotLightRef = useRef<THREE.SpotLight | null>(null);
  const cabinLightRef = useRef<THREE.PointLight | null>(null);

  const audioSynth = CabinAcousticSynthesizer.getInstance();

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFF8EB);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.05, 100);
    camera.position.set(-0.72, 0.85, -0.34); // Default Driver POV
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0.1, 0.65, -0.32);
    controlsRef.current = controls;

    // 1. Hemisphere Light — warm sky/ground separation
    const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x92400E, 0.9);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    // 2. Key spotlight — warm golden from above-left
    const spotLight = new THREE.SpotLight(0xfff5e6, 4.0, 14, Math.PI / 3.5, 0.25, 1);
    spotLight.position.set(-1.8, 3.0, 1.5);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLightRef.current = spotLight;
    scene.add(spotLight);

    // 3. Cabin interior fill light — warm amber
    const cabinLight = new THREE.PointLight(0xffd699, 1.6, 4);
    cabinLight.position.set(-0.6, 1.2, 0);
    cabinLightRef.current = cabinLight;
    scene.add(cabinLight);

    // 4. Secondary fill from rear — subtle warm rim
    const rearFill = new THREE.PointLight(0xffa833, 0.8, 5);
    rearFill.position.set(-1.4, 0.8, 0);
    scene.add(rearFill);

    // 5. Ambient light — soft warm baseline
    const ambient = new THREE.AmbientLight(0x2a1f10, 0.8);
    scene.add(ambient);

    // 6. Subtle grid floor — warm amber tones
    const grid = new THREE.GridHelper(10, 20, 0xD9A64E, 0xE8D5B7);
    grid.position.y = 0.04;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.3;
    scene.add(grid);

    // Raycaster for Direct Click-to-Edit & Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current || !interiorGroupRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interiorGroupRef.current.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent && obj.parent !== interiorGroupRef.current) {
          obj = obj.parent;
        }
        if (obj && obj.name) {
          setHoveredPartName(obj.name);
          container.style.cursor = "pointer";
          return;
        }
      }
      setHoveredPartName(null);
      container.style.cursor = "grab";
    };

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !interiorGroupRef.current || !onSelectPart) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interiorGroupRef.current.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent && obj.parent !== interiorGroupRef.current) {
          obj = obj.parent;
        }
        if (obj && obj.name) {
          const name = obj.name.toLowerCase();
          audioSynth.playRotaryDialClick();
          if (name.includes("seat")) {
            onSelectPart("seats");
            setCameraView("seats_detail");
          } else if (name.includes("dash") || name.includes("cluster") || name.includes("infotainment")) {
            onSelectPart("dash");
            setCameraView("dashboard_macro");
          } else if (name.includes("steer") || name.includes("pedal")) {
            onSelectPart("dash");
            setCameraView("steering_close");
          } else if (name.includes("console")) {
            onSelectPart("console");
            setCameraView("console_macro");
          } else if (name.includes("door")) {
            onSelectPart("console");
          }
        }
      }
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("click", handleClick);

    // Animation Loop
    let animId: number;
    let lapTime = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      lapTime += 0.016;

      // 1. Update functional instrument cluster canvas
      const clusterRenderer = MasterModularInterior3DAssembler.getClusterRenderer();
      clusterRenderer.render({
        rpm: simRpm,
        maxRpm: 9000,
        speedKmh: (simRpm / 9000) * 285,
        gear: simRpm > 7500 ? "4" : "3",
        boostBar: Math.min(2.2, (simRpm / 9000) * 2.2),
        oilTempC: 98,
        coolantTempC: 90,
        lateralG: Math.sin(lapTime * 0.8) * 1.35,
        longitudinalG: Math.cos(lapTime * 1.2) * 0.95,
        lapTimeSeconds: lapTime,
      });

      // 2. Update functional central infotainment touchscreen canvas
      const infoRenderer = MasterModularInterior3DAssembler.getInfotainmentRenderer();
      infoRenderer.render({
        speedKmh: (simRpm / 9000) * 285,
        gear: simRpm > 7500 ? "4" : "3",
        rpm: simRpm,
        lateralG: Math.sin(lapTime * 0.8) * 1.35,
        longitudinalG: Math.cos(lapTime * 1.2) * 0.95,
        lapTimeSeconds: lapTime,
        lapDeltaSeconds: Math.sin(lapTime * 0.5) * 0.45,
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Lighting Mode
  useEffect(() => {
    if (!sceneRef.current || !hemiLightRef.current || !spotLightRef.current || !cabinLightRef.current) return;
    const scene = sceneRef.current;
    const hemi = hemiLightRef.current;
    const spot = spotLightRef.current;
    const cabin = cabinLightRef.current;

    switch (lightingMode) {
      case "daylight":
        scene.background = new THREE.Color(0xFFF8EB);
        hemi.color.setHex(0xfff5e6);
        hemi.groundColor.setHex(0xd9a64e);
        hemi.intensity = 1.2;
        spot.color.setHex(0xfff5e6);
        spot.intensity = 4.0;
        cabin.intensity = 1.5;
        break;
      case "sunset":
        scene.background = new THREE.Color(0xFFF3E0);
        hemi.color.setHex(0xfb923c);
        hemi.groundColor.setHex(0x92400E);
        hemi.intensity = 0.9;
        spot.color.setHex(0xf97316);
        spot.intensity = 3.8;
        cabin.intensity = 1.2;
        break;
      case "midnight":
        scene.background = new THREE.Color(0xFFEDD5);
        hemi.color.setHex(0xfff5e6);
        hemi.groundColor.setHex(0xd9a64e);
        hemi.intensity = 1.0;
        spot.color.setHex(0xffa833);
        spot.intensity = 3.0;
        cabin.intensity = 1.0;
        break;
    }
  }, [lightingMode]);

  // Update Infotainment Screen Mode
  useEffect(() => {
    const infoRenderer = MasterModularInterior3DAssembler.getInfotainmentRenderer();
    infoRenderer.setMode(infotainmentMode);
  }, [infotainmentMode]);

  // Re-build 3D Mesh on State or Slider Updates
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (interiorGroupRef.current) {
      scene.remove(interiorGroupRef.current);
    }

    const steerRad = (steeringAngleDeg * Math.PI) / 180;
    const newGroup = MasterModularInterior3DAssembler.assembleInterior3D(
      state,
      explodedFactor,
      steerRad,
      doorOpenAngleDeg,
      showErgonomics
    );
    interiorGroupRef.current = newGroup;
    scene.add(newGroup);
  }, [state, explodedFactor, steeringAngleDeg, doorOpenAngleDeg, showErgonomics]);

  // Camera Presets
  const setCameraView = (pose: string) => {
    setActiveCameraPose(pose);
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (pose) {
      case "driver_pov":
        cam.position.set(-0.72, 0.85, -0.34);
        ctrl.target.set(0.1, 0.65, -0.32);
        break;
      case "passenger_pov":
        cam.position.set(-0.72, 0.85, 0.34);
        ctrl.target.set(-0.2, 0.65, 0);
        break;
      case "dashboard_macro":
        cam.position.set(-0.45, 0.80, -0.15);
        ctrl.target.set(-0.25, 0.68, 0);
        break;
      case "steering_close":
        cam.position.set(-0.55, 0.78, -0.32);
        ctrl.target.set(-0.46, 0.70, -0.32);
        break;
      case "console_macro":
        cam.position.set(-0.48, 0.68, 0);
        ctrl.target.set(-0.60, 0.30, 0);
        break;
      case "seats_detail":
        cam.position.set(-0.15, 0.65, -0.65);
        ctrl.target.set(-0.70, 0.45, 0);
        break;
      case "exploded_wide":
        cam.position.set(-2.20, 1.80, 1.80);
        ctrl.target.set(-0.60, 0.50, 0);
        break;
    }
  };

  const toggleDoor = () => {
    if (doorOpenAngleDeg > 0) {
      setDoorOpenAngleDeg(0);
      audioSynth.playDoorThunk();
    } else {
      setDoorOpenAngleDeg(55);
      audioSynth.playRotaryDialClick();
    }
  };

  return (
    <div className="relative w-full h-[680px] rounded-2xl overflow-hidden shadow-2xl flex flex-col select-none" style={{backgroundColor: '#FFF8EB', border: '1px solid rgba(217,166,78,0.3)'}}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full flex-1" />

      {/* Hovered Part HUD Badge */}
      {hoveredPartName && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md shadow-lg pointer-events-none animate-pulse" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.5)', color: '#92400E'}}>
          Click to inspect & edit: {hoveredPartName.replace(/([A-Z])/g, " $1").trim()}
        </div>
      )}

      {/* Top HUD Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Active Cabin Badge */}
        <div className="flex items-center gap-2 p-2 rounded-xl backdrop-blur-md pointer-events-auto shadow-md" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.4)'}}>
          <div className="p-1.5 rounded-lg" style={{backgroundColor: 'rgba(217,166,78,0.2)', color: '#92400E'}}>
            <Layers size={16} />
          </div>
          <div>
            <div className="text-xs font-mono font-bold" style={{color: '#451A03'}}>{state.name.toUpperCase()}</div>
            <div className="text-[10px] font-mono" style={{color: '#92400E'}}>
              {state.metrics.totalInteriorMassKg} kg • ${state.metrics.totalInteriorCostUSD.toLocaleString()} • Comfort: {state.metrics.comfortIndexPercent}%
            </div>
          </div>
        </div>

        {/* Center: Central Screen HMI Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl backdrop-blur-md pointer-events-auto" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.3)'}}>
          <div className="px-2 py-0.5 text-[10px] font-bold flex items-center gap-1" style={{color: '#92400E'}}>
            <Tv size={11} />
            <span>HMI SCREEN:</span>
          </div>
          {[
            { id: "telemetry", label: "Track Telemetry" },
            { id: "media", label: "Dolby DSP" },
            { id: "dynamics", label: "Dynamics" },
            { id: "climate", label: "Climate" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setInfotainmentMode(m.id as InfotainmentScreenMode);
                audioSynth.playRotaryDialClick();
              }}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                infotainmentMode === m.id
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-amber-700 hover:text-amber-900 hover:bg-amber-200/50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Right: Lighting Modes & Ergonomics Toggle */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Ergonomics Sightline Toggle */}
          <button
            onClick={() => {
              setShowErgonomics(!showErgonomics);
              audioSynth.playRotaryDialClick();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-all ${
              showErgonomics
                ? "bg-amber-200/60 border-amber-400 text-amber-800 shadow-md"
                : "bg-amber-100/50 border-amber-200/60 text-amber-600 hover:text-amber-800"
            }`}
          >
            <Eye size={12} />
            <span>SAE J1100 {showErgonomics ? "ON" : "OFF"}</span>
          </button>

          {/* Door Toggle Button with Thunk Sound */}
          <button
            onClick={toggleDoor}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-all ${
              doorOpenAngleDeg > 0
                ? "bg-amber-200/60 border-amber-400 text-amber-800 shadow-md"
                : "bg-amber-100/50 border-amber-200/60 text-amber-600 hover:text-amber-800"
            }`}
          >
            <DoorOpen size={12} />
            <span>{doorOpenAngleDeg > 0 ? "CLOSE DOORS" : "OPEN DOORS"}</span>
          </button>

          {/* Lighting Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl backdrop-blur-md" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.3)'}}>
            {[
              { id: "daylight", icon: Sun },
              { id: "sunset", icon: Sunset },
              { id: "midnight", icon: Moon },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = lightingMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setLightingMode(mode.id as LightingMode)}
                  className={`p-1.5 rounded-lg transition-all ${
                    isSelected
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-amber-600 hover:text-amber-800 hover:bg-amber-200/50"
                  }`}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Camera Viewpoints Quick Bar */}
      <div className="absolute top-16 right-3 flex flex-col gap-1 p-1.5 rounded-xl backdrop-blur-md" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.3)'}}>
        {[
          { id: "driver_pov", label: "Driver POV" },
          { id: "passenger_pov", label: "Passenger" },
          { id: "dashboard_macro", label: "Dash & HMI" },
          { id: "steering_close", label: "Wheel" },
          { id: "console_macro", label: "Console" },
          { id: "seats_detail", label: "Seats" },
          { id: "exploded_wide", label: "Studio ISO" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setCameraView(c.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-left transition-all ${
              activeCameraPose === c.id
                ? "bg-amber-500 text-white shadow-md"
                : "text-amber-700 hover:text-amber-900 hover:bg-amber-200/50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Bottom Interactive Sliders Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.4)'}}>
        {/* Exploded View Slider */}
        <div className="flex items-center gap-3 min-w-[200px] flex-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold" style={{color: '#92400E'}}>
            <Maximize2 size={14} />
            <span>EXPLODED</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedFactor}
            onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-lg cursor-pointer" style={{accentColor: '#D9A64E', backgroundColor: '#E8D5B7'}}
          />
          <span className="text-xs font-mono font-bold min-w-[36px]" style={{color: '#92400E'}}>
            {Math.round(explodedFactor * 100)}%
          </span>
        </div>

        {/* Dynamic Engine RPM Simulator for Cluster Needle */}
        <div className="flex items-center gap-3 min-w-[190px] flex-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
            <Activity size={14} />
            <span>RPM</span>
          </div>
          <input
            type="range"
            min="800"
            max="9000"
            step="100"
            value={simRpm}
            onChange={(e) => setSimRpm(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-lg cursor-pointer" style={{accentColor: '#D9A64E', backgroundColor: '#E8D5B7'}}
          />
          <span className="text-xs font-mono text-amber-300 font-bold min-w-[48px]">
            {simRpm}
          </span>
        </div>

        {/* Door Angle Slider */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <div className="text-xs font-mono font-bold" style={{color: '#92400E'}}>
            DOOR: {doorOpenAngleDeg}°
          </div>
          <input
            type="range"
            min="0"
            max="65"
            step="1"
            value={doorOpenAngleDeg}
            onChange={(e) => setDoorOpenAngleDeg(parseInt(e.target.value))}
            className="w-16 h-1.5 rounded-lg cursor-pointer" style={{accentColor: '#D9A64E', backgroundColor: '#E8D5B7'}}
          />
        </div>

        {/* Dynamic Steering Angle */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <div className="text-xs font-mono font-bold" style={{color: '#92400E'}}>
            STEER: {steeringAngleDeg}°
          </div>
          <input
            type="range"
            min="-90"
            max="90"
            step="5"
            value={steeringAngleDeg}
            onChange={(e) => setSteeringAngleDeg(parseInt(e.target.value))}
            className="w-16 h-1.5 rounded-lg cursor-pointer" style={{accentColor: '#D9A64E', backgroundColor: '#E8D5B7'}}
          />
        </div>
      </div>
    </div>
  );
};

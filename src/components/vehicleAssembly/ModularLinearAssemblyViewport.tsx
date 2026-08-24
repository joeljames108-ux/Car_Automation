/**
 * ============================================================================
 * MODULAR LINEAR ASSEMBLY 3D VIEWPORT (WITH CAD TOOLS & KINEMATICS)
 * ============================================================================
 * Photorealistic Three.js WebGL viewport for the Linear Vehicle Assembly System.
 * Supports:
 * - OrbitControls with smooth damping & camera presets
 * - Exploded view displacement slider (0% to 100%)
 * - Interactive Section Cut Clipping Planes (X, Y, Z)
 * - Kinematic steering angle & suspension travel articulation
 * - Live Drivetrain spin animation mode
 * - 3D Center of Mass spherical gizmo & coordinate callout
 * - Automated 360° Cinematic Vehicle Inspection Flythrough
 * - Live parametric aerodynamic transforms & CFD streamline particles
 * - Dynamic lighting environments (Studio, Cyberpunk, Sunset)
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Box,
  Layers,
  Wind,
  Eye,
  Sliders,
  Sparkles,
  Zap,
  RotateCw,
  Camera,
  Maximize2,
  Compass,
  Gauge,
  Sun,
  Moon,
  Flame,
  Scissors,
  Crosshair,
  Activity,
  Play,
  Pause,
  Video,
} from "lucide-react";
import {
  ModularAssemblySceneGraph,
  InstalledSubsystemsState,
  AssemblyStageId,
} from "./scene/ModularAssemblySceneGraph";
import { AeroStreamlineParticleSystem } from "../../exterior3d/aerodynamics/AeroStreamlineParticleSystem";
import { ComputedVehiclePhysicalState } from "../../sim/modularVehicle/AssemblyRegistryEngine";
import { assemblyAudio } from "./utils/assemblyAudioEngine";

export type CameraPresetType = "front34" | "side" | "rear34" | "top" | "engine_zoom" | "cockpit" | "undercarriage";

export type CaliperPresetType = "off" | "wheelbase" | "front_track" | "rear_track" | "ride_height" | "engine_offset" | "wing_span";

interface ModularLinearAssemblyViewportProps {
  assemblyState: InstalledSubsystemsState;
  activeStage: AssemblyStageId;
  previewStage: AssemblyStageId | null;
  explodedProgress: number;
  onExplodedChange: (val: number) => void;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
  isXRay: boolean;
  onToggleXRay: () => void;
  showStreamlines: boolean;
  onToggleStreamlines: () => void;
  physicalState: ComputedVehiclePhysicalState;
  showCoMGizmo: boolean;
  onToggleCoMGizmo: () => void;
  visibilityModeRequest?: { stage: AssemblyStageId; mode: "normal" | "ghost" | "xray" | "hidden" | "isolated" } | null;
}

export const ModularLinearAssemblyViewport: React.FC<ModularLinearAssemblyViewportProps> = ({
  assemblyState,
  activeStage,
  previewStage,
  explodedProgress,
  onExplodedChange,
  isAutoRotate,
  onToggleAutoRotate,
  isXRay,
  onToggleXRay,
  showStreamlines,
  onToggleStreamlines,
  physicalState,
  showCoMGizmo,
  onToggleCoMGizmo,
  visibilityModeRequest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneGraphRef = useRef<ModularAssemblySceneGraph | null>(null);
  const particleSystemRef = useRef<AeroStreamlineParticleSystem | null>(null);

  const [lightingMode, setLightingMode] = useState<"studio" | "cyberpunk" | "sunset">("studio");
  const [activeCamPreset, setActiveCamPreset] = useState<CameraPresetType>("front34");

  // CAD Tools State
  const [sectionPlane, setSectionPlane] = useState<"off" | "x" | "y" | "z">("off");
  const [sectionOffset, setSectionOffset] = useState<number>(0);
  const [sectionInverted, setSectionInverted] = useState<boolean>(false);
  const [activeCaliper, setActiveCaliper] = useState<CaliperPresetType>("off");
  const [steeringAngle, setSteeringAngle] = useState<number>(0);
  const [suspensionTravel, setSuspensionTravel] = useState<number>(0);
  const [isDrivetrainSpin, setIsDrivetrainSpin] = useState<boolean>(false);
  const [closuresDoorAngle, setClosuresDoorAngle] = useState<number>(assemblyState.doorOpenAngleDeg || 0);
  const [closuresBonnetAngle, setClosuresBonnetAngle] = useState<number>(assemblyState.bonnetOpenAngleDeg || 0);
  const [closuresDickyAngle, setClosuresDickyAngle] = useState<number>(assemblyState.dickyOpenAngleDeg || 0);
  const [isCinematicInspection, setIsCinematicInspection] = useState<boolean>(false);
  const [showCADToolbar, setShowCADToolbar] = useState<boolean>(false);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.2, 2.0, -4.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.localClippingEnabled = true;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.minDistance = 1.2;
    controls.maxDistance = 18;
    controls.target.set(0, 0.35, 0);
    controlsRef.current = controls;

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    ambientLight.name = "ambient";
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.8);
    keyLight.name = "key";
    keyLight.position.set(6, 9, -6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.name = "fill";
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xec4899, 1.2);
    rimLight.name = "rim";
    rimLight.position.set(0, 7, 7);
    scene.add(rimLight);

    // Studio Ground Grid
    const grid = new THREE.GridHelper(24, 48, 0x06b6d4, 0x1e293b);
    grid.position.y = -0.01;
    scene.add(grid);

    // Assembly Scene Graph
    const sceneGraph = new ModularAssemblySceneGraph();
    sceneGraphRef.current = sceneGraph;
    scene.add(sceneGraph.rootGroup);

    // Aero Streamline Particles
    const particles = new AeroStreamlineParticleSystem();
    particleSystemRef.current = particles;
    scene.add(particles.getParticleGroup());

    let animationFrameId: number;
    const clock = new THREE.Clock();
    let inspectionAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const deltaSec = clock.getDelta();

      if (controlsRef.current && cameraRef.current) {
        if (isCinematicInspection) {
          inspectionAngle += deltaSec * 0.45;
          const radius = 5.2;
          const heightY = 1.6 + Math.sin(inspectionAngle * 2) * 0.6;
          cameraRef.current.position.set(
            Math.sin(inspectionAngle) * radius,
            heightY,
            Math.cos(inspectionAngle) * radius
          );
          controlsRef.current.target.set(0, 0.35, 0);
          controlsRef.current.update();
        } else if (isAutoRotate) {
          controlsRef.current.autoRotate = true;
          controlsRef.current.autoRotateSpeed = 1.2;
          controlsRef.current.update();
        } else {
          controlsRef.current.autoRotate = false;
          controlsRef.current.update();
        }
      }

      if (sceneGraphRef.current && isDrivetrainSpin) {
        sceneGraphRef.current.spinDrivetrain(deltaSec, 3600);
      }

      if (particles && showStreamlines) {
        particles.getParticleGroup().visible = true;
        particles.update(deltaSec, {
          frontSplitterLengthMm: assemblyState.aero.frontSplitterLengthMm,
          frontCanardsCount: assemblyState.aero.frontCanards ? 2 : 0,
          frontWingAngleDeg: assemblyState.aero.frontSplitterAngleDeg,
          underbodyFlatFloor: true,
          underbodyVenturiTunnels: assemblyState.aero.underbodyVenturiTunnels,
          rearDiffuserAngleDeg: assemblyState.aero.diffuserAngleDeg,
          rearDiffuserStrakeCount: assemblyState.aero.diffuserStrakes,
          rearWingSpanMm: assemblyState.aero.rearWingWidthMm,
          rearWingChordMm: 320,
          rearWingAngleDeg: assemblyState.aero.rearWingAngleDeg,
          rearGurneyFlapHeightMm: assemblyState.aero.gurneyFlap ? 10 : 0,
          activeDrsEnabled: assemblyState.aero.rearWingType === "active_drs",
          activeDrsOpenWingAngleDeg: 2,
          sidepodsCoolingAirflowLps: 85,
          totalDownforceNAt100Mph: 2400,
          totalDragNAt100Mph: 620,
          aeroBalanceFrontPercent: 44,
          liftToDragRatio: 3.8,
          topSpeedDragAreaCdA: 0.65,
          massKg: 35,
        });
      } else if (particles) {
        particles.getParticleGroup().visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update 3D components whenever assembly state, preview stage, exploded factor, or x-ray changes
  useEffect(() => {
    if (sceneGraphRef.current) {
      sceneGraphRef.current.updateScene(assemblyState, previewStage, explodedProgress, isXRay);
    }
  }, [assemblyState, previewStage, explodedProgress, isXRay]);

  // Sync closures state when assemblyState changes
  useEffect(() => {
    setClosuresDoorAngle(assemblyState.doorOpenAngleDeg || 0);
    setClosuresBonnetAngle(assemblyState.bonnetOpenAngleDeg || 0);
    setClosuresDickyAngle(assemblyState.dickyOpenAngleDeg || 0);
  }, [assemblyState.doorOpenAngleDeg, assemblyState.bonnetOpenAngleDeg, assemblyState.dickyOpenAngleDeg]);

  const handleClosuresChange = (doors: number, bonnet: number, dicky: number) => {
    setClosuresDoorAngle(doors);
    setClosuresBonnetAngle(bonnet);
    setClosuresDickyAngle(dicky);
    if (sceneGraphRef.current) {
      sceneGraphRef.current.setClosuresArticulation(doors, bonnet, dicky, assemblyState.doorStyle);
    }
  };

  // Update Center of Mass Gizmo
  useEffect(() => {
    if (sceneGraphRef.current) {
      sceneGraphRef.current.updateCenterOfMass(physicalState.centerOfMassMm, showCoMGizmo);
    }
  }, [physicalState.centerOfMassMm, showCoMGizmo]);

  // Handle Visibility Mode requests from CAD Tree
  useEffect(() => {
    if (sceneGraphRef.current && visibilityModeRequest) {
      sceneGraphRef.current.setSubsystemVisibilityMode(
        visibilityModeRequest.stage,
        visibilityModeRequest.mode
      );
    }
  }, [visibilityModeRequest]);

  // Handle Section Clipping Planes
  const handleSectionPlaneChange = (plane: "off" | "x" | "y" | "z", offset: number, inverted = sectionInverted) => {
    setSectionPlane(plane);
    setSectionOffset(offset);
    setSectionInverted(inverted);
    assemblyAudio.playSectionSlice();
    if (sceneGraphRef.current) {
      sceneGraphRef.current.setSectionClippingPlane(plane, inverted ? -offset : offset);
    }
  };

  // Handle Invert Section Plane
  const handleToggleInvertPlane = () => {
    const nextInverted = !sectionInverted;
    setSectionInverted(nextInverted);
    assemblyAudio.playSectionSlice();
    if (sceneGraphRef.current) {
      sceneGraphRef.current.setSectionClippingPlane(sectionPlane, nextInverted ? -sectionOffset : sectionOffset);
    }
  };

  // Handle Calipers Point-to-Point Measurement
  const handleCaliperChange = (caliperType: CaliperPresetType) => {
    setActiveCaliper(caliperType);
    assemblyAudio.playCaliperSnap();
    if (!sceneGraphRef.current) return;

    if (caliperType === "off") {
      sceneGraphRef.current.updateMeasurementCalipers(null, null);
      return;
    }

    const wb = assemblyState.chassis.wheelbaseMm;
    const tf = assemblyState.chassis.frontTrackMm;
    const tr = assemblyState.chassis.rearTrackMm;
    const rh = assemblyState.chassis.rideHeightMm;

    switch (caliperType) {
      case "wheelbase":
        sceneGraphRef.current.updateMeasurementCalipers(
          [0, rh + 180, -wb / 2],
          [0, rh + 180, wb / 2]
        );
        break;
      case "front_track":
        sceneGraphRef.current.updateMeasurementCalipers(
          [-tf / 2, rh + 180, -wb / 2],
          [tf / 2, rh + 180, -wb / 2]
        );
        break;
      case "rear_track":
        sceneGraphRef.current.updateMeasurementCalipers(
          [-tr / 2, rh + 180, wb / 2],
          [tr / 2, rh + 180, wb / 2]
        );
        break;
      case "ride_height":
        sceneGraphRef.current.updateMeasurementCalipers(
          [0, 0, 0],
          [0, rh, 0]
        );
        break;
      case "engine_offset":
        const engZ = assemblyState.enginePosition === "mid" ? 150 : assemblyState.enginePosition === "rear" ? wb / 2 + 280 : -wb / 2 + 320;
        sceneGraphRef.current.updateMeasurementCalipers(
          [0, rh + 320, engZ],
          [0, rh + 180, wb / 2]
        );
        break;
      case "wing_span":
        const wingW = assemblyState.aero.rearWingWidthMm;
        const wingZ = wb / 2 + 650;
        sceneGraphRef.current.updateMeasurementCalipers(
          [-wingW / 2, rh + 850, wingZ],
          [wingW / 2, rh + 850, wingZ]
        );
        break;
    }
  };

  // Handle Steering Angle
  const handleSteeringChange = (deg: number) => {
    setSteeringAngle(deg);
    if (sceneGraphRef.current) {
      sceneGraphRef.current.setSteeringAngle(deg);
    }
  };

  // Handle Suspension Travel
  const handleSuspensionTravelChange = (travelMm: number) => {
    setSuspensionTravel(travelMm);
    if (sceneGraphRef.current) {
      sceneGraphRef.current.setSuspensionTravel(travelMm);
    }
  };

  // Handle Lighting Preset Switch
  const applyLightingMode = (mode: "studio" | "cyberpunk" | "sunset") => {
    setLightingMode(mode);
    const scene = sceneRef.current;
    if (!scene) return;

    const ambient = scene.getObjectByName("ambient") as THREE.AmbientLight;
    const key = scene.getObjectByName("key") as THREE.DirectionalLight;
    const fill = scene.getObjectByName("fill") as THREE.DirectionalLight;
    const rim = scene.getObjectByName("rim") as THREE.DirectionalLight;

    if (mode === "studio") {
      scene.background = new THREE.Color(0x0a0c14);
      if (ambient) ambient.color.setHex(0xffffff);
      if (key) {
        key.color.setHex(0xfff8ee);
        key.intensity = 2.8;
      }
      if (fill) {
        fill.color.setHex(0x38bdf8);
        fill.intensity = 1.4;
      }
      if (rim) {
        rim.color.setHex(0xec4899);
        rim.intensity = 1.2;
      }
    } else if (mode === "cyberpunk") {
      scene.background = new THREE.Color(0x04060d);
      if (ambient) ambient.color.setHex(0x1e1035);
      if (key) {
        key.color.setHex(0x00f0ff);
        key.intensity = 3.5;
      }
      if (fill) {
        fill.color.setHex(0xff007f);
        fill.intensity = 2.5;
      }
      if (rim) {
        rim.color.setHex(0xa855f7);
        rim.intensity = 2.2;
      }
    } else if (mode === "sunset") {
      scene.background = new THREE.Color(0x140a0c);
      if (ambient) ambient.color.setHex(0xffaa77);
      if (key) {
        key.color.setHex(0xff6622);
        key.intensity = 3.0;
      }
      if (fill) {
        fill.color.setHex(0x8844ff);
        fill.intensity = 1.8;
      }
      if (rim) {
        rim.color.setHex(0xffcc00);
        rim.intensity = 1.8;
      }
    }
  };

  // Handle Camera Presets
  const setCameraPreset = (preset: CameraPresetType) => {
    setActiveCamPreset(preset);
    setIsCinematicInspection(false);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const wb = assemblyState.chassis.wheelbaseMm / 1000;

    switch (preset) {
      case "front34":
        camera.position.set(3.8, 1.8, -(wb * 0.5) - 3.2);
        controls.target.set(0, 0.35, -(wb * 0.1));
        break;
      case "side":
        camera.position.set(5.2, 0.85, 0);
        controls.target.set(0, 0.35, 0);
        break;
      case "rear34":
        camera.position.set(-3.6, 1.7, (wb * 0.5) + 3.2);
        controls.target.set(0, 0.35, (wb * 0.1));
        break;
      case "top":
        camera.position.set(0, 6.8, 0.01);
        controls.target.set(0, 0, 0);
        break;
      case "engine_zoom":
        const engZ = assemblyState.enginePosition === "mid" ? 0.2 : assemblyState.enginePosition === "rear" ? (wb * 0.5) : -(wb * 0.5) + 0.3;
        camera.position.set(1.4, 1.5, engZ - 1.2);
        controls.target.set(0, 0.45, engZ);
        break;
      case "cockpit":
        camera.position.set(-0.35, 0.82, -0.05);
        controls.target.set(-0.35, 0.65, -0.85);
        break;
      case "undercarriage":
        camera.position.set(2.8, -0.65, 1.2);
        controls.target.set(0, 0.2, 0);
        break;
    }
    controls.update();
  };

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden border border-base-800 bg-base-950 shadow-2xl">
      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Subsystem Badge & Physical Telemetry */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-base-900/80 backdrop-blur-xl border border-base-800 shadow-lg pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff]" />
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            {activeStage.replace("_", " ")} STAGE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold">
            {assemblyState.installedStages.size}/12 INSTALLED
          </span>
        </div>

        {/* Real-Time Mass & CoM HUD Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-base-900/70 backdrop-blur-md border border-base-800/80 font-mono text-[10px] text-slate-400">
          <span>MASS: <strong className="text-slate-200">{physicalState.totalCurbWeightKg} kg</strong></span>
          <span>•</span>
          <span>BIAS: <strong className="text-amber-300">{physicalState.weightDistributionFrontPct}% F</strong></span>
          <span>•</span>
          <span>CoM Z: <strong className="text-cyan-300">{physicalState.centerOfMassMm[2]}mm</strong></span>
        </div>
      </div>

      {/* Top Right: Camera Presets & CAD Inspection Mode */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto flex-wrap">
        {/* Cinematic Inspection Flythrough */}
        <button
          onClick={() => setIsCinematicInspection(!isCinematicInspection)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            isCinematicInspection
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/30"
              : "bg-base-900/80 backdrop-blur-xl border-base-800 text-cyan-400 hover:border-cyan-500/50"
          }`}
        >
          <Video size={13} className={isCinematicInspection ? "animate-pulse" : ""} />
          <span>{isCinematicInspection ? "STOP INSPECTION" : "360° INSPECT"}</span>
        </button>

        {/* Camera Presets */}
        <div className="flex items-center bg-base-900/80 backdrop-blur-xl p-1 rounded-2xl border border-base-800 shadow-lg">
          {(
            [
              { id: "front34", label: "Front 3/4" },
              { id: "side", label: "Side" },
              { id: "rear34", label: "Rear 3/4" },
              { id: "top", label: "Top" },
              { id: "engine_zoom", label: "Engine" },
              { id: "cockpit", label: "Cockpit" },
              { id: "undercarriage", label: "Underbody" },
            ] as { id: CameraPresetType; label: string }[]
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setCameraPreset(c.id)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                activeCamPreset === c.id
                  ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* CAD Tools Toggle Button */}
        <button
          onClick={() => setShowCADToolbar(!showCADToolbar)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            showCADToolbar
              ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm"
              : "bg-base-900/80 backdrop-blur-xl border-base-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Scissors size={13} />
          <span>CAD TOOLS</span>
        </button>

        {/* Lighting Mode Switcher */}
        <div className="flex items-center bg-base-900/80 backdrop-blur-xl p-1 rounded-2xl border border-base-800 shadow-lg">
          <button
            onClick={() => applyLightingMode("studio")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              lightingMode === "studio" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Studio Neutral"
          >
            <Sun size={13} />
          </button>
          <button
            onClick={() => applyLightingMode("cyberpunk")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              lightingMode === "cyberpunk" ? "bg-purple-500/20 text-purple-400" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Cyberpunk Neon"
          >
            <Moon size={13} />
          </button>
          <button
            onClick={() => applyLightingMode("sunset")}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              lightingMode === "sunset" ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-slate-200"
            }`}
            title="Sunset Golden Hour"
          >
            <Flame size={13} />
          </button>
        </div>
      </div>

      {/* Floating CAD Engineering Tools Drawer */}
      {showCADToolbar && (
        <div className="absolute top-16 right-4 p-3 rounded-2xl bg-base-900/90 backdrop-blur-xl border border-base-800 shadow-2xl space-y-3 font-mono text-xs w-72 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-base-800 pb-2">
            <span className="font-bold text-[10px] text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scissors size={13} /> SECTION CUT & KINEMATICS
            </span>
            <button
              onClick={() => setShowCADToolbar(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Section Cut Clipping Planes */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Section Clipping Plane</span>
              <div className="flex items-center gap-1.5">
                {sectionPlane !== "off" && (
                  <button
                    onClick={handleToggleInvertPlane}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer ${
                      sectionInverted
                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                        : "bg-base-950 border-base-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    INVERT
                  </button>
                )}
                <span className="text-cyan-400 font-bold uppercase">{sectionPlane}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(["off", "x", "y", "z"] as const).map((axis) => (
                <button
                  key={axis}
                  onClick={() => handleSectionPlaneChange(axis, sectionOffset)}
                  className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    sectionPlane === axis
                      ? "bg-amber-500/20 border-amber-500 text-amber-300"
                      : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {axis.toUpperCase()}
                </button>
              ))}
            </div>
            {sectionPlane !== "off" && (
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={sectionOffset}
                onChange={(e) => handleSectionPlaneChange(sectionPlane, parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer mt-1"
              />
            )}
          </div>

          {/* 3D Calipers & Distance Dimensioning */}
          <div className="space-y-1.5 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Crosshair size={11} className="text-cyan-400" /> 3D CALIPER CALLOUTS
              </span>
              <span className="text-cyan-400 font-bold uppercase text-[9px]">{activeCaliper}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: "off", label: "OFF" },
                  { id: "wheelbase", label: "WHEELBASE" },
                  { id: "front_track", label: "F-TRACK" },
                  { id: "rear_track", label: "R-TRACK" },
                  { id: "ride_height", label: "HEIGHT" },
                  { id: "wing_span", label: "WING SPAN" },
                ] as { id: CaliperPresetType; label: string }[]
              ).map((cal) => (
                <button
                  key={cal.id}
                  onClick={() => handleCaliperChange(cal.id)}
                  className={`py-1 px-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer truncate ${
                    activeCaliper === cal.id
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm"
                      : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {cal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kinematic Steering Slider */}
          <div className="space-y-1 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Steering Rack Angle</span>
              <span className="text-cyan-400 font-bold">{steeringAngle}°</span>
            </div>
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={steeringAngle}
              onChange={(e) => handleSteeringChange(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Kinematic Suspension Bump/Travel Slider */}
          <div className="space-y-1 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400">Suspension Travel</span>
              <span className="text-emerald-400 font-bold">{suspensionTravel} mm</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="2"
              value={suspensionTravel}
              onChange={(e) => handleSuspensionTravelChange(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Closures Articulation (Doors, Bonnet, Dicky) */}
          <div className="space-y-2 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1 font-bold">
                <Maximize2 size={11} className="text-pink-400" /> CLOSURES ARTICULATION
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    handleClosuresChange(0, 0, 0);
                    assemblyAudio.playHydraulicClamp();
                  }}
                  className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-base-950 border border-base-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  CLOSE ALL
                </button>
                <button
                  onClick={() => {
                    handleClosuresChange(70, 45, 40);
                    assemblyAudio.playHydraulicClamp();
                  }}
                  className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-pink-500/20 border border-pink-500 text-pink-300 cursor-pointer"
                >
                  OPEN ALL
                </button>
              </div>
            </div>

            {/* Doors slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Doors ({assemblyState.doorStyle || "butterfly"})</span>
                <span className="text-pink-400 font-bold">{closuresDoorAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="70"
                step="1"
                value={closuresDoorAngle}
                onChange={(e) => handleClosuresChange(parseInt(e.target.value), closuresBonnetAngle, closuresDickyAngle)}
                className="w-full accent-pink-400 cursor-pointer"
              />
            </div>

            {/* Bonnet slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Bonnet / Hood</span>
                <span className="text-pink-400 font-bold">{closuresBonnetAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={closuresBonnetAngle}
                onChange={(e) => handleClosuresChange(closuresDoorAngle, parseInt(e.target.value), closuresDickyAngle)}
                className="w-full accent-pink-400 cursor-pointer"
              />
            </div>

            {/* Dicky slider */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Dicky / Trunk</span>
                <span className="text-pink-400 font-bold">{closuresDickyAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={closuresDickyAngle}
                onChange={(e) => handleClosuresChange(closuresDoorAngle, closuresBonnetAngle, parseInt(e.target.value))}
                className="w-full accent-pink-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Drivetrain Spin Animation */}
          <div className="flex items-center justify-between pt-2 border-t border-base-800 text-[10px]">
            <span className="text-slate-400">Drivetrain Spin (3,600 RPM)</span>
            <button
              onClick={() => {
                const nextState = !isDrivetrainSpin;
                setIsDrivetrainSpin(nextState);
                if (nextState) assemblyAudio.playPneumaticInstall();
              }}
              className={`px-2 py-1 rounded-lg border font-bold cursor-pointer transition-all ${
                isDrivetrainSpin
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : "bg-base-950 border-base-800 text-slate-500"
              }`}
            >
              {isDrivetrainSpin ? "SPINNING" : "STOPPED"}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Center: Viewport Controls (Exploded View, X-Ray, Auto-Rotate, CFD Streamlines, CoM) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 rounded-2xl bg-base-900/85 backdrop-blur-xl border border-base-800 shadow-2xl pointer-events-auto max-w-[95%] overflow-x-auto no-scrollbar">
        {/* Exploded View Slider */}
        <div className="flex items-center gap-2 px-2 border-r border-base-800/80">
          <Sliders size={13} className="text-cyan-500" />
          <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            EXPLODED VIEW
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedProgress}
            onChange={(e) => onExplodedChange(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-300 w-7">
            {Math.round(explodedProgress * 100)}%
          </span>
        </div>

        {/* 3D Center of Mass Gizmo */}
        <button
          onClick={onToggleCoMGizmo}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            showCoMGizmo
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm"
              : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Crosshair size={12} />
          <span>CoM GIZMO</span>
        </button>

        {/* X-Ray Mode */}
        <button
          onClick={onToggleXRay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            isXRay
              ? "bg-purple-500/20 border-purple-500/50 text-purple-600 dark:text-purple-300 shadow-sm"
              : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Eye size={12} />
          <span>X-RAY</span>
        </button>

        {/* Auto Rotate */}
        <button
          onClick={onToggleAutoRotate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            isAutoRotate
              ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-600 dark:text-cyan-300 shadow-sm"
              : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <RotateCw size={12} className={isAutoRotate ? "animate-spin" : ""} />
          <span>ORBIT</span>
        </button>

        {/* CFD Streamlines */}
        <button
          onClick={onToggleStreamlines}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            showStreamlines
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-300 shadow-sm"
              : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <Wind size={12} className={showStreamlines ? "animate-pulse text-emerald-400" : ""} />
          <span>CFD STREAMLINES</span>
        </button>
      </div>
    </div>
  );
};

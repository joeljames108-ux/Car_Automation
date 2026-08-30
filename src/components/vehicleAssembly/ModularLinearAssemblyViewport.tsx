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
  Shield,
  Play,
  Pause,
  Video,
  Palette,
  Building,
} from "lucide-react";
import {
  ModularAssemblySceneGraph,
  InstalledSubsystemsState,
  AssemblyStageId,
} from "./scene/ModularAssemblySceneGraph";
import { AeroStreamlineParticleSystem } from "../../exterior3d/aerodynamics/AeroStreamlineParticleSystem";
import { ComputedVehiclePhysicalState } from "../../sim/modularVehicle/AssemblyRegistryEngine";
import { assemblyAudio } from "./utils/assemblyAudioEngine";
import {
  STUDIO_ENVIRONMENT_PRESETS,
  StudioEnvironmentPreset,
  AutomotiveStudioEnvironmentManager,
} from "../../exterior3d/environment/AutomotiveStudioEnvironment";

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

  const [environmentPreset, setEnvironmentPreset] = useState<StudioEnvironmentPreset>("warm_sunset");
  const [customTopColor, setCustomTopColor] = useState<string>("#2e1814");
  const [customHorizonColor, setCustomHorizonColor] = useState<string>("#451a14");
  const [customFloorColor, setCustomFloorColor] = useState<string>("#1f0f0c");
  const [floorReflectivity, setFloorReflectivity] = useState<number>(0.2);
  const [gridOpacity, setGridOpacity] = useState<number>(0.45);
  const [exposureVal, setExposureVal] = useState<number>(1.3);
  const [isFloorDiscActive, setIsFloorDiscActive] = useState<boolean>(true);
  const [isContactShadowActive, setIsContactShadowActive] = useState<boolean>(true);
  const currentEnvTextureRef = useRef<THREE.CanvasTexture | null>(null);

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
  const [isFeaStressActive, setIsFeaStressActive] = useState<boolean>(false);
  const [feaLoadCase, setFeaLoadCase] = useState<"torsional" | "cornering" | "braking" | "crash">("torsional");
  const [chassisMetallurgy, setChassisMetallurgy] = useState<"default" | "titanium" | "aluminum_6061" | "chromoly_4130" | "carbon_autoclave" | "hardox_steel">("default");
  const [frameIsolation, setFrameIsolation] = useState<"all" | "chassis" | "body">("all");
  const [activeCustomPaintFinish, setActiveCustomPaintFinish] = useState<string>("candy");
  const [headlightsActive, setHeadlightsActive] = useState<boolean>(true);
  const [drlActive, setDrlActive] = useState<boolean>(true);
  const [underglowActive, setUnderglowActive] = useState<boolean>(true);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
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
    renderer.toneMappingExposure = 1.3;
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

    // 1. Initial Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffecd1, 1.3);
    ambientLight.name = "ambient";
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x2e1814, 0.7);
    hemiLight.name = "hemi";
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffaa44, 3.4);
    keyLight.name = "key";
    keyLight.position.set(7, 8, -5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfbbf24, 1.8);
    fillLight.name = "fill";
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfbbf24, 2.2);
    rimLight.name = "rim";
    rimLight.position.set(0, 7, 7);
    scene.add(rimLight);

    // 2. Studio Ground Grid
    const grid = new THREE.GridHelper(24, 48, 0xf59e0b, 0x78350f);
    grid.name = "grid";
    grid.position.y = -0.01;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.45;
    scene.add(grid);

    // 3. Studio Floor Disc & Ground Contact Shadow Plane
    const floorDisc = AutomotiveStudioEnvironmentManager.createStudioFloorDisc(18, 0x1f0f0c, 0.2);
    scene.add(floorDisc);

    const contactShadow = AutomotiveStudioEnvironmentManager.createContactShadowPlane(3.2, 6.0, 0.65);
    scene.add(contactShadow);

    // 4. Initial Gradient Canvas Background Texture (Golden Hour Sunset Studio)
    const initBg = AutomotiveStudioEnvironmentManager.createGradientBackgroundTexture(
      "#2e1814",
      "#451a14",
      "#1f0f0c",
      true
    );
    currentEnvTextureRef.current = initBg;
    scene.background = initBg;
    scene.environment = initBg;

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

  // Handle Dynamic Studio Environment Preset Switch
  const applyEnvironmentPreset = (presetId: StudioEnvironmentPreset) => {
    setEnvironmentPreset(presetId);
    const config = STUDIO_ENVIRONMENT_PRESETS[presetId];
    if (!config) return;

    setCustomTopColor(config.topColor);
    setCustomHorizonColor(config.horizonColor);
    setCustomFloorColor(config.floorColor);
    setGridOpacity(config.gridOpacity);
    setFloorReflectivity(config.floorReflectivity);
    setExposureVal(config.toneMappingExposure);

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer) return;

    // 1. Dynamic Gradient Canvas Background Texture
    if (currentEnvTextureRef.current) {
      currentEnvTextureRef.current.dispose();
    }
    const bgTexture = AutomotiveStudioEnvironmentManager.createGradientBackgroundTexture(
      config.topColor,
      config.horizonColor,
      config.floorColor,
      true
    );
    currentEnvTextureRef.current = bgTexture;
    scene.background = bgTexture;
    scene.environment = bgTexture;

    // 2. 5-Point Dynamic Automotive Studio Lighting
    const ambient = scene.getObjectByName("ambient") as THREE.AmbientLight;
    const hemi = scene.getObjectByName("hemi") as THREE.HemisphereLight;
    const key = scene.getObjectByName("key") as THREE.DirectionalLight;
    const fill = scene.getObjectByName("fill") as THREE.DirectionalLight;
    const rim = scene.getObjectByName("rim") as THREE.DirectionalLight;

    if (ambient) {
      ambient.color.setHex(config.ambientLightColor);
      ambient.intensity = config.ambientLightIntensity;
    }
    if (hemi) {
      hemi.color.setHex(config.hemiSkyColor);
      hemi.groundColor.setHex(config.hemiGroundColor);
      hemi.intensity = config.hemiIntensity;
    }
    if (key) {
      key.color.setHex(config.keyLightColor);
      key.intensity = config.keyLightIntensity;
      key.position.set(...config.keyLightPos);
    }
    if (fill) {
      fill.color.setHex(config.fillLightColor);
      fill.intensity = config.fillLightIntensity;
    }
    if (rim) {
      rim.color.setHex(config.rimLightColor);
      rim.intensity = config.rimLightIntensity;
    }

    // 3. Grid Reconfiguration
    const existingGrid = scene.getObjectByName("grid");
    if (existingGrid) scene.remove(existingGrid);
    const newGrid = new THREE.GridHelper(24, 48, config.gridPrimaryColor, config.gridSecondaryColor);
    newGrid.name = "grid";
    newGrid.position.y = -0.01;
    (newGrid.material as THREE.Material).transparent = true;
    (newGrid.material as THREE.Material).opacity = config.gridOpacity;
    scene.add(newGrid);

    // 4. Studio Floor Disc Reconfiguration
    const existingDisc = scene.getObjectByName("Studio_Floor_Disc");
    if (existingDisc) scene.remove(existingDisc);
    if (isFloorDiscActive) {
      const newDisc = AutomotiveStudioEnvironmentManager.createStudioFloorDisc(
        18,
        new THREE.Color(config.floorColor).getHex(),
        config.floorReflectivity
      );
      scene.add(newDisc);
    }

    // 5. Tone Mapping Exposure Calibration
    renderer.toneMappingExposure = config.toneMappingExposure;
  };

  // Handle Custom Gradient Color Customization
  const applyCustomGradient = (top: string, horizon: string, floor: string) => {
    setCustomTopColor(top);
    setCustomHorizonColor(horizon);
    setCustomFloorColor(floor);

    const scene = sceneRef.current;
    if (!scene) return;

    if (currentEnvTextureRef.current) {
      currentEnvTextureRef.current.dispose();
    }
    const bgTexture = AutomotiveStudioEnvironmentManager.createGradientBackgroundTexture(top, horizon, floor, true);
    currentEnvTextureRef.current = bgTexture;
    scene.background = bgTexture;
    scene.environment = bgTexture;
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
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#00e5ff]" />
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            {activeStage.replace("_", " ")} STAGE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold">
            {assemblyState.installedStages.size}/12 INSTALLED
          </span>
        </div>

        {/* Real-Time Mass & CoM HUD Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-base-900/70 backdrop-blur-md border border-base-800/80 font-mono text-[10px] text-slate-400">
          <span>MASS: <strong className="text-slate-200">{physicalState.totalCurbWeightKg} kg</strong></span>
          <span>•</span>
          <span>BIAS: <strong className="text-amber-300">{physicalState.weightDistributionFrontPct}% F</strong></span>
          <span>•</span>
          <span>CoM Z: <strong className="text-amber-300">{physicalState.centerOfMassMm[2]}mm</strong></span>
        </div>
      </div>

      {/* Top Right: Camera Presets & CAD Inspection Mode */}
      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto flex-wrap">
        {/* Cinematic Inspection Flythrough */}
        <button
          onClick={() => setIsCinematicInspection(!isCinematicInspection)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            isCinematicInspection
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-lg shadow-cyan-500/30"
              : "bg-base-900/80 backdrop-blur-xl border-base-800 text-amber-400 hover:border-amber-500/50"
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
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-sm"
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

        {/* Dynamic Studio Environment Switcher */}
        <div className="flex items-center bg-base-900/80 backdrop-blur-xl p-1 rounded-2xl border border-base-800 shadow-lg">
          {(
            [
              { id: "warm_sunset", label: "Sunset", icon: Flame, color: "text-amber-400" },
              { id: "luxury_showroom", label: "Showroom", icon: Sun, color: "text-slate-100" },
              { id: "titanium_slate", label: "Titanium", icon: Compass, color: "text-amber-400" },
              { id: "blueprint_navy", label: "Blueprint", icon: Layers, color: "text-amber-400" },
              { id: "cyberpunk_neon", label: "Cyberpunk", icon: Zap, color: "text-amber-400" },
              { id: "obsidian_stealth", label: "Obsidian", icon: Moon, color: "text-zinc-400" },
            ] as const
          ).map((env) => {
            const Icon = env.icon;
            const isActive = environmentPreset === env.id;
            return (
              <button
                key={env.id}
                onClick={() => applyEnvironmentPreset(env.id)}
                className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title={STUDIO_ENVIRONMENT_PRESETS[env.id].name + " — " + STUDIO_ENVIRONMENT_PRESETS[env.id].tagline}
              >
                <Icon size={13} className={isActive ? env.color : ""} />
                {isActive && <span className="text-[9px] font-mono font-bold uppercase">{env.label}</span>}
              </button>
            );
          })}
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
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-base-950 border-base-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    INVERT
                  </button>
                )}
                <span className="text-amber-400 font-bold uppercase">{sectionPlane}</span>
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
                <Crosshair size={11} className="text-amber-400" /> 3D CALIPER CALLOUTS
              </span>
              <span className="text-amber-400 font-bold uppercase text-[9px]">{activeCaliper}</span>
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
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
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
              <span className="text-amber-400 font-bold">{steeringAngle}°</span>
            </div>
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={steeringAngle}
              onChange={(e) => handleSteeringChange(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
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

          {/* FEA Load Case Simulation */}
          <div className="space-y-1.5 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity size={11} className="text-rose-400" /> FEA LOAD CASE
              </span>
              <span className="text-rose-400 font-bold uppercase text-[9px]">{feaLoadCase}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  { id: "torsional", label: "Torsional 45kNm" },
                  { id: "cornering", label: "Corner 1.8G" },
                  { id: "braking", label: "Braking 1.5G" },
                  { id: "crash", label: "Crash 50km/h" },
                ] as const
              ).map((lc) => (
                <button
                  key={lc.id}
                  onClick={() => {
                    setFeaLoadCase(lc.id);
                    if (sceneGraphRef.current) {
                      sceneGraphRef.current.setFeaLoadCase(lc.id);
                      sceneGraphRef.current.updateScene(assemblyState, previewStage, explodedProgress, isXRay);
                    }
                  }}
                  className={`py-1 px-1.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer truncate ${
                    feaLoadCase === lc.id
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm"
                      : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {lc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chassis Metallurgy Mode */}
          <div className="space-y-1.5 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Shield size={11} className="text-amber-400" /> CHASSIS METALLURGY
              </span>
              <span className="text-amber-400 font-bold uppercase text-[9px]">{chassisMetallurgy}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: "default", label: "Default" },
                  { id: "titanium", label: "Titanium" },
                  { id: "aluminum_6061", label: "Alu 6061" },
                  { id: "chromoly_4130", label: "Chromoly" },
                  { id: "carbon_autoclave", label: "Carbon Tub" },
                  { id: "hardox_steel", label: "Hardox" },
                ] as const
              ).map((met) => (
                <button
                  key={met.id}
                  onClick={() => {
                    setChassisMetallurgy(met.id);
                    if (sceneGraphRef.current) {
                      sceneGraphRef.current.setChassisMetallurgy(met.id);
                      sceneGraphRef.current.updateScene(assemblyState, previewStage, explodedProgress, isXRay);
                    }
                  }}
                  className={`py-1 px-1 rounded-lg text-[8px] font-bold border transition-all cursor-pointer truncate ${
                    chassisMetallurgy === met.id
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                      : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {met.label}
                </button>
              ))}
            </div>
          </div>

          {/* Structural Rigidity Telemetry Card */}
          <div className="p-2 rounded-xl bg-base-950/80 border border-base-800/80 space-y-1 text-[9px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>TORSIONAL RIGIDITY:</span>
              <span className="text-amber-300 font-bold">48,200 Nm/deg</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>PEAK VON MISES:</span>
              <span className="text-rose-400 font-bold">418 MPa</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>YIELD STRENGTH:</span>
              <span className="text-emerald-400 font-bold">880 MPa</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>SAFETY FACTOR (Sf):</span>
              <span className="text-amber-300 font-bold">2.10 (OPTIMAL)</span>
            </div>
          </div>

          {/* Paint Finish Studio */}
          <div className="space-y-1.5 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" /> PAINT FINISH STUDIO
              </span>
              <span className="text-amber-400 font-bold uppercase text-[9px]">{activeCustomPaintFinish}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: "candy", label: "Candy Red" },
                  { id: "chameleon", label: "Chameleon" },
                  { id: "carbon", label: "Forged Carbon" },
                  { id: "metallic", label: "Metallic Flake" },
                  { id: "pearl", label: "Pearl Shift" },
                  { id: "matte", label: "Matte Satin" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveCustomPaintFinish(p.id);
                    if (sceneGraphRef.current) {
                      const updatedState = { ...assemblyState, paintFinish: p.id as any };
                      sceneGraphRef.current.updateScene(updatedState, previewStage, explodedProgress, isXRay);
                    }
                  }}
                  className={`py-1 px-1 rounded-lg text-[8px] font-bold border transition-all cursor-pointer truncate ${
                    activeCustomPaintFinish === p.id
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                      : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exterior Lighting Studio */}
          <div className="space-y-1.5 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Sun size={11} className="text-amber-400" /> EXTERIOR OPTICS
              </span>
              <span className="text-amber-400 font-bold uppercase text-[9px]">
                {headlightsActive ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setHeadlightsActive(!headlightsActive)}
                className={`py-1 px-1 rounded-lg text-[8px] font-bold border transition-all cursor-pointer truncate ${
                  headlightsActive
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                    : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                Headlights
              </button>
              <button
                onClick={() => setDrlActive(!drlActive)}
                className={`py-1 px-1 rounded-lg text-[8px] font-bold border transition-all cursor-pointer truncate ${
                  drlActive
                    ? "bg-sky-500/20 border-sky-500 text-amber-300 shadow-sm"
                    : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                DRL Halos
              </button>
              <button
                onClick={() => setUnderglowActive(!underglowActive)}
                className={`py-1 px-1 rounded-lg text-[8px] font-bold border transition-all cursor-pointer truncate ${
                  underglowActive
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                    : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                }`}
              >
                Underglow
              </button>
            </div>
          </div>

          {/* Studio Environment & Lighting Lab */}
          <div className="space-y-2 pt-2 border-t border-base-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Palette size={11} className="text-amber-400" /> STUDIO ENVIRONMENT
              </span>
              <span className="text-amber-400 font-bold uppercase text-[9px]">
                {STUDIO_ENVIRONMENT_PRESETS[environmentPreset]?.name || "CUSTOM"}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: "warm_sunset", label: "Sunset", accent: "border-amber-500 text-amber-300" },
                  { id: "luxury_showroom", label: "Showroom", accent: "border-slate-300 text-slate-200" },
                  { id: "titanium_slate", label: "Slate CAD", accent: "border-amber-500 text-amber-300" },
                  { id: "blueprint_navy", label: "Blueprint", accent: "border-amber-500 text-amber-300" },
                  { id: "cyberpunk_neon", label: "Cyberpunk", accent: "border-amber-500 text-amber-300" },
                  { id: "obsidian_stealth", label: "Obsidian", accent: "border-zinc-500 text-zinc-400" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyEnvironmentPreset(preset.id)}
                  className={`py-1 px-1 rounded-lg text-[8px] font-bold border transition-all cursor-pointer truncate ${
                    environmentPreset === preset.id
                      ? `bg-amber-500/20 ${preset.accent} shadow-sm`
                      : "bg-base-950 border-base-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Gradient Palette */}
            <div className="p-2 rounded-xl bg-base-950/80 border border-base-800/80 space-y-1.5 text-[9px]">
              <div className="flex justify-between items-center text-slate-400">
                <span>GRADIENT PALETTE:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={customTopColor}
                    onChange={(e) => applyCustomGradient(e.target.value, customHorizonColor, customFloorColor)}
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                    title="Sky / Top Color"
                  />
                  <input
                    type="color"
                    value={customHorizonColor}
                    onChange={(e) => applyCustomGradient(customTopColor, e.target.value, customFloorColor)}
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                    title="Horizon Glow Color"
                  />
                  <input
                    type="color"
                    value={customFloorColor}
                    onChange={(e) => applyCustomGradient(customTopColor, customHorizonColor, e.target.value)}
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                    title="Floor Base Color"
                  />
                </div>
              </div>

              {/* Exposure Slider */}
              <div className="flex justify-between items-center text-slate-400">
                <span>EXPOSURE:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="range"
                    min="0.8"
                    max="2.2"
                    step="0.05"
                    value={exposureVal}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setExposureVal(val);
                      if (rendererRef.current) rendererRef.current.toneMappingExposure = val;
                    }}
                    className="w-16 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-amber-300 font-mono w-7 text-right">{exposureVal.toFixed(1)}x</span>
                </div>
              </div>

              {/* Floor Reflectivity */}
              <div className="flex justify-between items-center text-slate-400">
                <span>FLOOR REFLECTIVITY:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={floorReflectivity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFloorReflectivity(val);
                      const scene = sceneRef.current;
                      if (scene) {
                        const disc = scene.getObjectByName("Studio_Floor_Disc") as THREE.Mesh;
                        if (disc && disc.material) {
                          (disc.material as THREE.MeshStandardMaterial).roughness = 0.9 - val * 0.7;
                        }
                      }
                    }}
                    className="w-16 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-amber-300 font-mono w-7 text-right">{Math.round(floorReflectivity * 100)}%</span>
                </div>
              </div>

              {/* Floor Grid Opacity */}
              <div className="flex justify-between items-center text-slate-400">
                <span>CAD GRID OPACITY:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={gridOpacity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGridOpacity(val);
                      const scene = sceneRef.current;
                      if (scene) {
                        const gridObj = scene.getObjectByName("grid") as THREE.GridHelper;
                        if (gridObj && gridObj.material) {
                          (gridObj.material as THREE.Material).opacity = val;
                        }
                      }
                    }}
                    className="w-16 accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-emerald-300 font-mono w-7 text-right">{Math.round(gridOpacity * 100)}%</span>
                </div>
              </div>
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
          <Sliders size={13} className="text-amber-500" />
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
            className="w-24 accent-amber-400 cursor-pointer"
          />
          <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-300 w-7">
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
              ? "bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-300 shadow-sm"
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
              ? "bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-300 shadow-sm"
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

        {/* FEA Stress Heatmap */}
        <button
          onClick={() => {
            const nextState = !isFeaStressActive;
            setIsFeaStressActive(nextState);
            if (sceneGraphRef.current) {
              sceneGraphRef.current.setFeaStressMode(nextState);
              sceneGraphRef.current.updateScene(assemblyState, previewStage, explodedProgress, isXRay);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            isFeaStressActive
              ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm"
              : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
          title="FEA Von Mises Stress Heatmap"
        >
          <Activity size={12} className={isFeaStressActive ? "animate-pulse text-rose-400" : ""} />
          <span>FEA STRESS</span>
        </button>

        {/* Chassis Frame Isolation */}
        <button
          onClick={() => {
            const nextIso = frameIsolation === "all" ? "chassis" : frameIsolation === "chassis" ? "body" : "all";
            setFrameIsolation(nextIso);
            if (sceneGraphRef.current) {
              sceneGraphRef.current.setIsolatedStage(nextIso === "all" ? null : nextIso === "chassis" ? "chassis" : "body_structure");
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
            frameIsolation !== "all"
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm"
              : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
          title="Isolate Chassis Frame or Bodywork"
        >
          <Layers size={12} />
          <span>{frameIsolation === "all" ? "ALL LAYERS" : frameIsolation === "chassis" ? "FRAME ONLY" : "BODY ONLY"}</span>
        </button>
      </div>
    </div>
  );
};

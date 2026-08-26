/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — PHOTOREALISTIC 3D CABIN VIEWPORT
 * ============================================================================
 * Luxury automotive configurator viewport featuring:
 * 1. FIRST-PERSON DRIVER SEAT POV & 360° HEAD LOOK-AROUND
 *    - Pinned Driver H-Point Eye Coordinate ($X=-0.68, Y=0.88, Z=-0.34$)
 *    - Mouse Drag & Pan/Tilt Head Rotation (Yaw: -140° to +140°, Pitch: -55° to +55°)
 *    - 8 Instant Gaze Hotspots (Road, Cluster, Infotainment, Console, Passenger, Mirror, Roof, Rear)
 *    - Dynamic Gaze Target HUD (Real-time detection of what the driver is looking at)
 *    - Automated Cockpit Head Pan Tour Mode
 *    - Driver Fore/Aft & Eye Height Ergonomic Adjustment
 *    - Wide-Angle to Detail FOV Lens Zoom ($35^\circ \to 75^\circ$)
 * 2. 5 DYNAMIC AUTOMOTIVE STUDIO ENVIRONMENTS & LIGHTING RIGS
 *    - Warm Sunset Golden Hour, Luxury Showroom, Titanium Slate, Cyberpunk Neon, Obsidian Stealth
 * 3. REAL-TIME INTERACTIVE COCKPIT TELEMETRY & CONTROLS
 *    - 9,000 RPM Engine Revving Slider with Live Canvas Cluster & Acoustic Synthesizer
 *    - Central Infotainment HMI Mode Switcher (Telemetry, Dolby Media, Dynamics, Climate)
 *    - Interactive Steering Wheel Rotation & Hydraulic Door Latch Kinematics with Audio
 *    - Continuous Exploded View Kinematics ($0.0 \to 1.0$)
 * ============================================================================
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Sparkles,
  Compass,
  Play,
  Pause,
  RotateCw,
  Crosshair,
  Zap,
  Shield,
  Palette,
  VolumeX,
  Download,
  Box,
  CheckCircle,
} from "lucide-react";
import { MasterModularInteriorState } from "../../sim/interior/masterInteriorTypes";
import { MasterModularInterior3DAssembler } from "../../exterior3d/generators/interior/masterModularInterior3DAssembler";
import { InfotainmentScreenMode } from "../../exterior3d/generators/interior/functionalInfotainmentRenderer";
import { CabinAcousticSynthesizer } from "../../sim/interior/cabinAcousticSynthesizer";
import { UniversalGlbExporter } from "../../exterior3d/export/universalGlbExporter";
import { Car3DGlbAssetRegistry } from "../../exterior3d/geometry/car3dGlbAssetRegistry";
import {
  STUDIO_ENVIRONMENT_PRESETS,
  StudioEnvironmentPreset,
  AutomotiveStudioEnvironmentManager,
} from "../../exterior3d/environment/AutomotiveStudioEnvironment";
import { DriverSeatCameraRig, SeatCameraAnchorId } from "../../exterior3d/generators/interior/driverSeatCameraRig";
import { SeatPositionSelector } from "./SeatPositionSelector";
import { InteriorRaycastPicker, InteriorWorkbenchTabKey } from "../../exterior3d/generators/interior/interiorRaycastPicker";

export type CockpitCameraPose =
  | "driver_seat_eye"
  | "passenger_pov"
  | "dashboard_macro"
  | "steering_close"
  | "console_macro"
  | "seats_detail"
  | "starlight_roof"
  | "exploded_wide";

export type GazeHotspotId =
  | "forward_road"
  | "gauge_cluster"
  | "infotainment"
  | "center_console"
  | "passenger_seat"
  | "left_mirror"
  | "panoramic_roof"
  | "rear_cabin";

interface GazeHotspotConfig {
  id: GazeHotspotId;
  label: string;
  shortLabel: string;
  icon: string;
  yawDeg: number;
  pitchDeg: number;
  targetDescription: string;
}

export const GAZE_HOTSPOTS: GazeHotspotConfig[] = [
  {
    id: "forward_road",
    label: "Forward Windshield & HUD",
    shortLabel: "Windshield",
    icon: "🏁",
    yawDeg: 0,
    pitchDeg: 2,
    targetDescription: "FORWARD ROAD & AR HEAD-UP DISPLAY",
  },
  {
    id: "gauge_cluster",
    label: "Digital Gauge Cluster & Wheel",
    shortLabel: "Cluster",
    icon: "🎛️",
    yawDeg: -10,
    pitchDeg: -18,
    targetDescription: "12.3\" DIGITAL COCKPIT INSTRUMENT CLUSTER",
  },
  {
    id: "infotainment",
    label: "Central Infotainment Touchscreen",
    shortLabel: "Screen",
    icon: "📱",
    yawDeg: 34,
    pitchDeg: -12,
    targetDescription: "14.5\" OLED CENTRAL HMI TOUCHSCREEN",
  },
  {
    id: "center_console",
    label: "Transmission Shifter & Crystal Dial",
    shortLabel: "Console",
    icon: "🕹️",
    yawDeg: 46,
    pitchDeg: -34,
    targetDescription: "CRYSTAL ROTARY DIAL & SHIFTER CONSOLE",
  },
  {
    id: "passenger_seat",
    label: "Passenger Sport Bolstered Seat",
    shortLabel: "Passenger",
    icon: "💺",
    yawDeg: 68,
    pitchDeg: -6,
    targetDescription: "PASSENGER BOLSTERED RECARO BUCKET",
  },
  {
    id: "left_mirror",
    label: "Driver Window & Exterior Mirror",
    shortLabel: "Side Mirror",
    icon: "🪞",
    yawDeg: -68,
    pitchDeg: -4,
    targetDescription: "DRIVER DOOR PANEL & AERO SIDE MIRROR",
  },
  {
    id: "panoramic_roof",
    label: "Panoramic Starlight Headliner",
    shortLabel: "Roof",
    icon: "✨",
    yawDeg: 0,
    pitchDeg: 42,
    targetDescription: "FIBER-OPTIC STARLIGHT GLASS ROOF",
  },
  {
    id: "rear_cabin",
    label: "Rear Cabin & Chromoly Roll Cage",
    shortLabel: "Rear Cage",
    icon: "🛡️",
    yawDeg: 140,
    pitchDeg: 6,
    targetDescription: "REAR CABIN & CHROMOLY ROLL CAGE",
  },
];

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

  // Core 3D State
  const [explodedFactor, setExplodedFactor] = useState<number>(0.0);
  const [simRpm, setSimRpm] = useState<number>(4200);
  const [steeringAngleDeg, setSteeringAngleDeg] = useState<number>(0);
  const [doorOpenAngleDeg, setDoorOpenAngleDeg] = useState<number>(0);
  const [activeCameraPose, setActiveCameraPose] = useState<CockpitCameraPose>("driver_seat_eye");
  const [environmentPreset, setEnvironmentPreset] = useState<StudioEnvironmentPreset>("warm_sunset");
  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);
  const [infotainmentMode, setInfotainmentMode] = useState<InfotainmentScreenMode>("telemetry");
  const [showErgonomics, setShowErgonomics] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Driver Seat First-Person Look-Around Dynamics
  const [driverYawDeg, setDriverYawDeg] = useState<number>(0);
  const [driverPitchDeg, setDriverPitchDeg] = useState<number>(2);
  const [driverFov, setDriverFov] = useState<number>(54);
  const [seatForeAftMm, setSeatForeAftMm] = useState<number>(0);
  const [seatHeightMm, setSeatHeightMm] = useState<number>(0);
  const [isAutoHeadPan, setIsAutoHeadPan] = useState<boolean>(false);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [currentGazeTarget, setCurrentGazeTarget] = useState<string>("FORWARD ROAD & AR HEAD-UP DISPLAY");

  // GLB Model & Export State
  const [isExportingGlb, setIsExportingGlb] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [useGlbAssets, setUseGlbAssets] = useState<boolean>(true);

  const handleExportGlb = async () => {
    if (!sceneRef.current || isExportingGlb) return;
    setIsExportingGlb(true);
    try {
      const root = sceneRef.current.getObjectByName(`ModularInterior_${state.id}`) || interiorGroupRef.current || sceneRef.current;
      const result = await UniversalGlbExporter.exportVehicleToGlb(root, {
        vehicleName: `Interior_Studio_${state.id}`,
        author: "Antigravity Photorealistic Automotive Interior CAD Engine",
      });
      UniversalGlbExporter.triggerBrowserDownload(result);
      setExportSuccessMsg(`Exported ${result.filename} (${(result.byteLength / 1024).toFixed(1)} KB)`);
      setTimeout(() => setExportSuccessMsg(null), 5000);
    } catch (err) {
      console.error("GLB export failed:", err);
    } finally {
      setIsExportingGlb(false);
    }
  };

  // Three.js Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const interiorGroupRef = useRef<THREE.Group | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const cabinLightRef = useRef<THREE.PointLight | null>(null);
  const currentEnvTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Pointer drag state for First-Person Look
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const headYawRef = useRef<number>(0);
  const headPitchRef = useRef<number>(2);
  const targetYawRef = useRef<number>(0);
  const targetPitchRef = useRef<number>(2);
  const isDriverSeatModeRef = useRef<boolean>(true);

  const audioSynth = CabinAcousticSynthesizer.getInstance();

  // DriverSeatCameraRig & RaycastPicker State
  const cameraRigRef = useRef<DriverSeatCameraRig | null>(null);
  const raycastPickerRef = useRef<InteriorRaycastPicker | null>(null);
  const [activeSeatAnchor, setActiveSeatAnchor] = useState<SeatCameraAnchorId>("DRIVER");

  // Sync ref with state
  useEffect(() => {
    isDriverSeatModeRef.current = activeCameraPose === "driver_seat_eye";
  }, [activeCameraPose]);

  // Compute Gaze Target from Yaw and Pitch
  const updateGazeDetection = useCallback((yaw: number, pitch: number) => {
    let bestMatch = GAZE_HOTSPOTS[0];
    let minDistance = Infinity;

    for (const hotspot of GAZE_HOTSPOTS) {
      const dy = yaw - hotspot.yawDeg;
      const dp = pitch - hotspot.pitchDeg;
      const dist = Math.sqrt(dy * dy + dp * dp);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = hotspot;
      }
    }

    if (pitch > 28) {
      setCurrentGazeTarget("FIBER-OPTIC STARLIGHT GLASS ROOF");
    } else if (pitch < -24 && yaw > 25 && yaw < 65) {
      setCurrentGazeTarget("CRYSTAL ROTARY DIAL & SHIFTER CONSOLE");
    } else if (pitch < -12 && yaw > -25 && yaw < 10) {
      setCurrentGazeTarget("12.3\" DIGITAL COCKPIT INSTRUMENT CLUSTER");
    } else if (minDistance < 35) {
      setCurrentGazeTarget(bestMatch.targetDescription);
    } else {
      setCurrentGazeTarget("360° CABIN INTERIOR VIEW");
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 680;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.05, 100);
    // Base Driver Eye Position
    camera.position.set(-0.68, 0.88, -0.34);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
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

    // 1. Initial Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffecd1, 1.2);
    ambientLight.name = "ambient";
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x2e1814, 0.8);
    hemiLight.name = "hemi";
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffaa44, 3.2);
    keyLight.name = "key";
    keyLight.position.set(5, 8, -4);
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    const cabinLight = new THREE.PointLight(0xffd699, 1.8, 5);
    cabinLight.position.set(-0.6, 1.1, 0);
    cabinLightRef.current = cabinLight;
    scene.add(cabinLight);

    // 2. Ground Grid
    const grid = new THREE.GridHelper(16, 32, 0xd9a64e, 0x78350f);
    grid.name = "grid";
    grid.position.y = 0.02;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    // 3. Studio Ground Disc & Contact Shadow
    const floorDisc = AutomotiveStudioEnvironmentManager.createStudioFloorDisc(14, 0x1f0f0c, 0.25);
    scene.add(floorDisc);

    const contactShadow = AutomotiveStudioEnvironmentManager.createContactShadowPlane(2.8, 4.8, 0.6);
    scene.add(contactShadow);

    // 5. Initialize Camera Rig Engine
    const cameraRig = new DriverSeatCameraRig({
      camera,
      domElement: container,
      initialAnchor: "DRIVER",
      sensitivity: 0.25,
      dampingFactor: 0.12,
    });
    cameraRigRef.current = cameraRig;
    cameraRig.subscribeGazeChange((yaw, pitch, targetStr) => {
      setDriverYawDeg(yaw);
      setDriverPitchDeg(pitch);
      setCurrentGazeTarget(targetStr);
    });

    // Raycaster for Direct Click-to-Edit & Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Pointer Event Handlers
    const handlePointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isPointerDownRef.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current || !cameraRef.current) return;

      // When in Driver Seat mode, drag rotates the driver's head
      if (isDriverSeatModeRef.current && isPointerDownRef.current) {
        const deltaX = e.clientX - lastPointerRef.current.x;
        const deltaY = e.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.22;
        const newYaw = Math.max(-145, Math.min(145, headYawRef.current + deltaX * sensitivity));
        const newPitch = Math.max(-55, Math.min(55, headPitchRef.current - deltaY * sensitivity));

        headYawRef.current = newYaw;
        headPitchRef.current = newPitch;
        targetYawRef.current = newYaw;
        targetPitchRef.current = newPitch;

        setDriverYawDeg(Math.round(newYaw));
        setDriverPitchDeg(Math.round(newPitch));
        updateGazeDetection(newYaw, newPitch);
        return;
      }

      // Raycasting Hover logic when not dragging
      if (!interiorGroupRef.current) return;
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
          container.style.cursor = isDriverSeatModeRef.current ? "crosshair" : "pointer";
          return;
        }
      }
      setHoveredPartName(null);
      container.style.cursor = isDriverSeatModeRef.current ? "crosshair" : "grab";
    };

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !interiorGroupRef.current || !onSelectPart) return;
      if (isDriverSeatModeRef.current) return; // In driver seat look-around, clicks are reserved for view look

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
          } else if (name.includes("dash") || name.includes("cluster") || name.includes("infotainment")) {
            onSelectPart("dash");
          } else if (name.includes("steer") || name.includes("pedal")) {
            onSelectPart("dash");
          } else if (name.includes("console")) {
            onSelectPart("console");
          } else if (name.includes("door")) {
            onSelectPart("console");
          }
        }
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("click", handleClick);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();
    let currentYaw = 0;
    let currentPitch = 2;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

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
        lateralG: Math.sin(elapsed * 0.8) * 1.35,
        longitudinalG: Math.cos(elapsed * 1.2) * 0.95,
        lapTimeSeconds: elapsed,
      });

      // 2. Update functional central infotainment touchscreen canvas
      const infoRenderer = MasterModularInterior3DAssembler.getInfotainmentRenderer();
      infoRenderer.render({
        speedKmh: (simRpm / 9000) * 285,
        gear: simRpm > 7500 ? "4" : "3",
        rpm: simRpm,
        lateralG: Math.sin(elapsed * 0.8) * 1.35,
        longitudinalG: Math.cos(elapsed * 1.2) * 0.95,
        lapTimeSeconds: elapsed,
        lapDeltaSeconds: Math.sin(elapsed * 0.5) * 0.45,
      });

      // 3. Driver Seat First-Person Look-Around or Orbit Camera
      if (isDriverSeatModeRef.current && cameraRigRef.current) {
        controls.enabled = false;
        cameraRigRef.current.update(delta);
      } else {
        controls.enabled = true;
        controls.update();
      }

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
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [updateGazeDetection, seatForeAftMm, seatHeightMm, isAutoHeadPan]);

  // Update Environment Preset
  const applyEnvironmentPreset = (presetId: StudioEnvironmentPreset) => {
    setEnvironmentPreset(presetId);
    const config = STUDIO_ENVIRONMENT_PRESETS[presetId];
    if (!config || !sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;

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

    const ambient = scene.getObjectByName("ambient") as THREE.AmbientLight;
    const hemi = scene.getObjectByName("hemi") as THREE.HemisphereLight;
    const key = scene.getObjectByName("key") as THREE.DirectionalLight;

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
    }

    renderer.toneMappingExposure = config.toneMappingExposure;
  };

  // Update Infotainment Screen Mode
  useEffect(() => {
    const infoRenderer = MasterModularInterior3DAssembler.getInfotainmentRenderer();
    infoRenderer.setMode(infotainmentMode);
  }, [infotainmentMode]);

  // Re-build 3D Mesh on State, Steering or Door Updates
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

  // Handle FOV Updates
  const handleFovChange = (newFov: number) => {
    setDriverFov(newFov);
    if (cameraRef.current) {
      cameraRef.current.fov = newFov;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  // Smooth Look At Hotspot
  const snapToHotspot = (hotspot: GazeHotspotConfig) => {
    setIsAutoHeadPan(false);
    setActiveCameraPose("driver_seat_eye");
    isDriverSeatModeRef.current = true;

    targetYawRef.current = hotspot.yawDeg;
    targetPitchRef.current = hotspot.pitchDeg;
    headYawRef.current = hotspot.yawDeg;
    headPitchRef.current = hotspot.pitchDeg;

    setDriverYawDeg(hotspot.yawDeg);
    setDriverPitchDeg(hotspot.pitchDeg);
    setCurrentGazeTarget(hotspot.targetDescription);
    audioSynth.playRotaryDialClick();
  };

  // Camera Presets Switcher
  const setCameraView = (pose: CockpitCameraPose) => {
    setActiveCameraPose(pose);
    setIsAutoHeadPan(false);

    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (pose === "driver_seat_eye") {
      isDriverSeatModeRef.current = true;
      ctrl.enabled = false;
      targetYawRef.current = 0;
      targetPitchRef.current = 2;
      headYawRef.current = 0;
      headPitchRef.current = 2;
      setDriverYawDeg(0);
      setDriverPitchDeg(2);
      handleFovChange(54);
      updateGazeDetection(0, 2);
    } else {
      isDriverSeatModeRef.current = false;
      ctrl.enabled = true;
      handleFovChange(50);

      switch (pose) {
        case "passenger_pov":
          cam.position.set(-0.72, 0.88, 0.34);
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
        case "starlight_roof":
          cam.position.set(-0.68, 0.45, 0);
          ctrl.target.set(-0.68, 1.40, 0);
          break;
        case "exploded_wide":
          cam.position.set(-2.20, 1.80, 1.80);
          ctrl.target.set(-0.60, 0.50, 0);
          break;
      }
      ctrl.update();
    }
  };

  // Door Swing Action
  const toggleDoor = () => {
    if (doorOpenAngleDeg > 0) {
      setDoorOpenAngleDeg(0);
      audioSynth.playDoorThunk();
    } else {
      setDoorOpenAngleDeg(55);
      audioSynth.playRotaryDialClick();
    }
  };

  // Handle Engine RPM & Audio
  const handleRpmChange = (rpm: number) => {
    setSimRpm(rpm);
    if (!isAudioMuted && Math.abs(rpm - simRpm) > 200) {
      audioSynth.playPaddleShiftSound(rpm > simRpm ? "up" : "down");
    }
  };

  return (
    <div className="relative w-full h-[680px] rounded-3xl overflow-hidden shadow-2xl flex flex-col select-none border border-amber-900/40 bg-gradient-to-b from-slate-900/90 to-base-950 font-mono">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full flex-1" />

      {/* Driver Crosshair Reticle (in Driver Look-Around mode) */}
      {activeCameraPose === "driver_seat_eye" && showCrosshair && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-8 h-8 flex items-center justify-center opacity-40">
            <div className="w-2 h-2 rounded-full border border-amber-300" />
            <div className="absolute w-6 h-px bg-amber-400/50" />
            <div className="absolute h-6 w-px bg-amber-400/50" />
          </div>
        </div>
      )}

      {/* Real-Time Gaze Target HUD (When sitting in Driver Seat) */}
      {activeCameraPose === "driver_seat_eye" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-xl border border-amber-500/40 shadow-xl pointer-events-none text-xs font-bold animate-pulse">
          <Eye size={14} className="text-amber-400" />
          <span className="text-amber-200 tracking-wider">👀 GAZE: {currentGazeTarget}</span>
          <span className="text-[10px] text-slate-400 font-normal">
            ({driverYawDeg > 0 ? `+${driverYawDeg}° R` : `${driverYawDeg}° L`}, {driverPitchDeg}° TILT)
          </span>
        </div>
      )}

      {/* Top HUD Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
        {/* Left: Active Cabin Badge & Multi-Seat Selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-2xl backdrop-blur-xl shadow-xl bg-slate-950/85 border border-amber-500/30">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
              <Layers size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>{state.name.toUpperCase()}</span>
                {activeCameraPose === "driver_seat_eye" && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    DRIVER EYE ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-amber-300/80">
                {state.metrics.totalInteriorMassKg} kg • ${state.metrics.totalInteriorCostUSD.toLocaleString()} • Comfort: {state.metrics.comfortIndexPercent}%
              </div>
            </div>
          </div>

          {/* Seat Position Selector [ DRIVER ] [ FRONT PASSENGER ] [ REAR LEFT ] [ REAR RIGHT ] */}
          <SeatPositionSelector
            activeAnchor={activeSeatAnchor}
            seatCount={state.seating.rearSeatType.includes("delete") ? 2 : 5}
            onSelectAnchor={(anchorId) => {
              setActiveSeatAnchor(anchorId);
              setActiveCameraPose("driver_seat_eye");
              isDriverSeatModeRef.current = true;
              if (cameraRigRef.current) {
                cameraRigRef.current.setActiveAnchor(anchorId, true);
              }
              audioSynth.playRotaryDialClick();
            }}
            isAutoPan={isAutoHeadPan}
            onToggleAutoPan={() => {
              const next = !isAutoHeadPan;
              setIsAutoHeadPan(next);
              if (cameraRigRef.current) {
                cameraRigRef.current.setAutoPan(next);
              }
            }}
          />
        </div>

        {/* Center: Central Screen HMI Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl backdrop-blur-xl pointer-events-auto bg-slate-950/85 border border-slate-800 shadow-xl">
          <div className="px-2 py-0.5 text-[10px] font-bold text-amber-400 flex items-center gap-1">
            <Tv size={12} />
            <span>HMI:</span>
          </div>
          {[
            { id: "telemetry", label: "Track Telemetry" },
            { id: "media", label: "Dolby Atmos" },
            { id: "dynamics", label: "G-Dynamics" },
            { id: "climate", label: "4-Zone HVAC" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setInfotainmentMode(m.id as InfotainmentScreenMode);
                audioSynth.playRotaryDialClick();
              }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                infotainmentMode === m.id
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Right: Studio Environment & Interactive Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Audio Mute Toggle */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-2 rounded-xl text-xs border transition-all cursor-pointer ${
              isAudioMuted
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-slate-950/85 border-slate-800 text-slate-300 hover:text-white"
            }`}
            title={isAudioMuted ? "Unmute Engine Audio" : "Mute Engine Audio"}
          >
            {isAudioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          {/* SAE J1100 Ergonomics Sightline Toggle */}
          <button
            onClick={() => {
              setShowErgonomics(!showErgonomics);
              audioSynth.playRotaryDialClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
              showErgonomics
                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md"
                : "bg-slate-950/85 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye size={12} />
            <span>SAE J1100 {showErgonomics ? "ON" : "OFF"}</span>
          </button>

          {/* Door Toggle Button with Thunk Sound */}
          <button
            onClick={toggleDoor}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
              doorOpenAngleDeg > 0
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md"
                : "bg-slate-950/85 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <DoorOpen size={12} />
            <span>{doorOpenAngleDeg > 0 ? "CLOSE DOOR" : "OPEN DOOR"}</span>
          </button>

          {/* GLB Asset Engine Mode Toggle */}
          <button
            onClick={() => {
              setUseGlbAssets(!useGlbAssets);
              audioSynth.playRotaryDialClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
              useGlbAssets
                ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-md"
                : "bg-slate-950/85 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle between GLB asset loading and 3D procedural mesh generation"
          >
            <Box size={12} />
            <span>GLB MODE: {useGlbAssets ? "ACTIVE" : "PROCEDURAL"}</span>
          </button>

          {/* Export Studio GLB Button */}
          <button
            onClick={handleExportGlb}
            disabled={isExportingGlb}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-lg hover:brightness-110 disabled:opacity-50"
            title="Export full 3D interior studio scene to binary GLB file"
          >
            <Download size={12} className={isExportingGlb ? "animate-bounce" : ""} />
            <span>{isExportingGlb ? "EXPORTING GLB..." : "EXPORT GLB"}</span>
          </button>

          {/* Studio Environment Preset Selector */}
          <div className="flex items-center bg-slate-950/85 backdrop-blur-xl p-1 rounded-2xl border border-slate-800 shadow-xl">
            {(
              [
                { id: "warm_sunset", icon: Sunset, color: "text-amber-400", title: "Warm Sunset" },
                { id: "luxury_showroom", icon: Sun, color: "text-slate-100", title: "Showroom White" },
                { id: "titanium_slate", icon: Compass, color: "text-cyan-400", title: "Titanium Slate" },
                { id: "cyberpunk_neon", icon: Zap, color: "text-purple-400", title: "Cyberpunk Neon" },
                { id: "obsidian_stealth", icon: Moon, color: "text-zinc-400", title: "Obsidian Stealth" },
              ] as const
            ).map((env) => {
              const Icon = env.icon;
              const isSelected = environmentPreset === env.id;
              return (
                <button
                  key={env.id}
                  onClick={() => applyEnvironmentPreset(env.id)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                  title={env.title}
                >
                  <Icon size={13} className={isSelected ? env.color : ""} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Export GLB Success Toast */}
      {exportSuccessMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl backdrop-blur-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 z-30 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {/* Camera Viewpoints Quick Ribbon (Right Side) */}
      <div className="absolute top-20 right-3 flex flex-col gap-1 p-1.5 rounded-2xl backdrop-blur-xl bg-slate-950/90 border border-slate-800 shadow-2xl z-10">
        <div className="px-2 py-1 text-[9px] font-bold text-amber-400 border-b border-slate-800 uppercase tracking-wider flex items-center gap-1">
          <Compass size={11} /> CAMERA POSE
        </div>
        {[
          { id: "driver_seat_eye" as const, label: "Driver Seat POV (Look-Around)", highlight: true },
          { id: "steering_close" as const, label: "Wheel & Paddle Shifter" },
          { id: "dashboard_macro" as const, label: "Digital Cluster & HMI" },
          { id: "console_macro" as const, label: "Central Crystal Console" },
          { id: "passenger_pov" as const, label: "Passenger Viewpoint" },
          { id: "seats_detail" as const, label: "Recaro Sport Seating" },
          { id: "starlight_roof" as const, label: "Starlight Roof View" },
          { id: "exploded_wide" as const, label: "Studio Isometric ISO" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setCameraView(c.id)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              activeCameraPose === c.id
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>{c.label}</span>
            {c.id === "driver_seat_eye" && <Crosshair size={11} className="text-amber-200" />}
          </button>
        ))}
      </div>

      {/* FIRST-PERSON DRIVER SEAT HEAD LOOK-AROUND CONTROL BAR (Left Side Drawer) */}
      {activeCameraPose === "driver_seat_eye" && (
        <div className="absolute top-20 left-3 p-3 rounded-2xl backdrop-blur-xl bg-slate-950/92 border border-amber-500/30 shadow-2xl w-64 space-y-2.5 z-10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair size={13} className="text-amber-400" /> DRIVER HEAD LOOK-AROUND
            </span>
            <button
              onClick={() => setIsAutoHeadPan(!isAutoHeadPan)}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                isAutoHeadPan
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 animate-pulse"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title="Toggle automatic 360° cabin head turn pan"
            >
              {isAutoHeadPan ? <Pause size={10} /> : <Play size={10} />}
              <span>{isAutoHeadPan ? "SCANNING" : "AUTO PAN"}</span>
            </button>
          </div>

          {/* Quick Gaze Hotspots Grid */}
          <div className="space-y-1">
            <div className="text-[9px] text-slate-400 flex justify-between">
              <span>QUICK GAZE HOTSPOTS:</span>
              <span className="text-amber-300">8 POSES</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {GAZE_HOTSPOTS.map((hotspot) => (
                <button
                  key={hotspot.id}
                  onClick={() => snapToHotspot(hotspot)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all text-left truncate cursor-pointer flex items-center gap-1 ${
                    currentGazeTarget === hotspot.targetDescription
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                      : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                  title={hotspot.label}
                >
                  <span>{hotspot.icon}</span>
                  <span className="truncate">{hotspot.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Head Rotation Sliders */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80 text-[9px]">
            <div className="flex justify-between items-center text-slate-400">
              <span>HEAD PAN (YAW):</span>
              <span className="text-amber-300 font-bold">{driverYawDeg}°</span>
            </div>
            <input
              type="range"
              min="-140"
              max="140"
              step="1"
              value={driverYawDeg}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setIsAutoHeadPan(false);
                setDriverYawDeg(val);
                targetYawRef.current = val;
                headYawRef.current = val;
                updateGazeDetection(val, driverPitchDeg);
              }}
              className="w-full h-1.5 rounded-lg accent-amber-400 cursor-pointer"
            />

            <div className="flex justify-between items-center text-slate-400">
              <span>HEAD TILT (PITCH):</span>
              <span className="text-amber-300 font-bold">{driverPitchDeg}°</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="1"
              value={driverPitchDeg}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setIsAutoHeadPan(false);
                setDriverPitchDeg(val);
                targetPitchRef.current = val;
                headPitchRef.current = val;
                updateGazeDetection(driverYawDeg, val);
              }}
              className="w-full h-1.5 rounded-lg accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Seating Ergonomics & Lens Zoom */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80 text-[9px]">
            <div className="flex justify-between items-center text-slate-400">
              <span>LENS FOV (ZOOM):</span>
              <span className="text-cyan-300 font-bold">{driverFov}°</span>
            </div>
            <input
              type="range"
              min="38"
              max="72"
              step="1"
              value={driverFov}
              onChange={(e) => handleFovChange(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg accent-cyan-400 cursor-pointer"
            />

            <div className="flex justify-between items-center text-slate-400">
              <span>SEAT FORE / AFT:</span>
              <span className="text-emerald-300 font-bold">{seatForeAftMm} mm</span>
            </div>
            <input
              type="range"
              min="-80"
              max="80"
              step="5"
              value={seatForeAftMm}
              onChange={(e) => setSeatForeAftMm(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg accent-emerald-400 cursor-pointer"
            />

            <div className="flex justify-between items-center text-slate-400">
              <span>EYE HEIGHT:</span>
              <span className="text-emerald-300 font-bold">{seatHeightMm} mm</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="5"
              value={seatHeightMm}
              onChange={(e) => setSeatHeightMm(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Mouse Drag Tip */}
          <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[8px] text-slate-400 text-center">
            💡 Drag cursor anywhere on canvas to look around cockpit
          </div>
        </div>
      )}

      {/* Bottom Interactive Sliders & Cockpit Simulator Bar */}
      <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl backdrop-blur-xl bg-slate-950/90 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Continuous Exploded View Slider */}
        <div className="flex items-center gap-3 min-w-[200px] flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 whitespace-nowrap">
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
            className="w-full h-1.5 rounded-lg accent-amber-400 cursor-pointer"
          />
          <span className="text-xs font-bold text-amber-300 min-w-[36px]">
            {Math.round(explodedFactor * 100)}%
          </span>
        </div>

        {/* Dynamic Engine RPM Simulator for Cluster Needle & Audio */}
        <div className="flex items-center gap-3 min-w-[200px] flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 whitespace-nowrap">
            <Activity size={14} />
            <span>SIM RPM</span>
          </div>
          <input
            type="range"
            min="800"
            max="9000"
            step="100"
            value={simRpm}
            onChange={(e) => handleRpmChange(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-lg accent-rose-400 cursor-pointer"
          />
          <span className="text-xs text-rose-300 font-bold min-w-[54px]">
            {simRpm} RPM
          </span>
        </div>

        {/* Dynamic Steering Angle */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <div className="text-xs font-bold text-cyan-400 whitespace-nowrap">
            STEER: {steeringAngleDeg}°
          </div>
          <input
            type="range"
            min="-90"
            max="90"
            step="5"
            value={steeringAngleDeg}
            onChange={(e) => setSteeringAngleDeg(parseInt(e.target.value))}
            className="w-16 h-1.5 rounded-lg accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Driver Door Angle */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <div className="text-xs font-bold text-emerald-400 whitespace-nowrap">
            DOOR: {doorOpenAngleDeg}°
          </div>
          <input
            type="range"
            min="0"
            max="65"
            step="1"
            value={doorOpenAngleDeg}
            onChange={(e) => setDoorOpenAngleDeg(parseInt(e.target.value))}
            className="w-16 h-1.5 rounded-lg accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

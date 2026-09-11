import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Layers3,
  ScanSearch,
  Scissors,
  FileCode2,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Sliders,
  Compass,
  Box,
  Cpu,
  Zap,
  Gauge,
  Sparkles,
  Palette,
  Grid,
  Tag,
  X,
} from "lucide-react";

export type ViewMode = "studio" | "blueprint" | "exploded" | "anatomy" | "cutaway";

export interface ComponentInfo {
  id: string;
  label: string;
  cat: "body" | "glass" | "powertrain" | "chassis" | "aero" | "interior" | "electrical";
  stat: string;
  det: string;
  pos3d: [number, number, number];
  color: string;
}

const COMPONENT_HOTSPOTS: ComponentInfo[] = [
  { id: "AERO", label: "Front Aero Splitter & Canards", cat: "aero", stat: "Active Carbon Splitter", det: "Autoclaved 3K Carbon, 220kg downforce @ 250km/h", pos3d: [0, 2.38, 0.20], color: "#10b981" },
  { id: "FL", label: "Front Left Pushrod Suspension & CCM Brake", cat: "chassis", stat: "Pushrod Double Wishbone", det: "410mm Carbon-Ceramic Rotor, 6-Piston Monobloc Brembo", pos3d: [0.80, 1.425, 0.34], color: "#22c55e" },
  { id: "ECU", label: "Central Neural Telemetry & Inverter", cat: "electrical", stat: "Dual DO-178C Flight Compute", det: "CAN-FD / Automotive Ethernet, 100 TFLOPS inference", pos3d: [0, 0.65, 0.58], color: "#3b82f6" },
  { id: "PU", label: "4.0L Twin-Turbo Flat-Plane V8", cat: "powertrain", stat: "90° Alloy V8 Twin-Turbo", det: "920 HP @ 8,500 RPM, 950 Nm, Inconel equal-length headers", pos3d: [0, 1.425, 0.45], color: "#f59e0b" },
  { id: "RL", label: "Rear Left 5-Link Kinematics & Wheel", cat: "chassis", stat: "Forged 6061-T6 Suspension", det: "20x11 Forged Alloy Rim, 305/30R20 Semi-Slick Tire", pos3d: [0.80, -1.425, 0.34], color: "#f97316" },
  { id: "RR", label: "Rear Right Drive Corner & Differential", cat: "chassis", stat: "Electronic LSD Differential", det: "Vectoring e-LSD, 390mm CCM rotor, 4-piston caliper", pos3d: [-0.80, -1.425, 0.34], color: "#22c55e" },
  { id: "WING", label: "Active DRS Swan-Neck Rear Wing", cat: "aero", stat: "Active Aerodynamic Foil", det: "Prepreg Carbon Fiber, +/- 18° motorized DRS pitch", pos3d: [0, -2.18, 1.22], color: "#a855f7" },
];

// Anti-collision offset tiers and horizontal staggering to prevent label overlap when expanded
const HOTSPOT_CALLOUT_CONFIG: Record<
  string,
  {
    tier: "top-high" | "top-low" | "bottom-low" | "bottom-high";
    xOffset: number;
    yOffset: number;
  }
> = {
  AERO: { tier: "bottom-low", xOffset: -45, yOffset: 34 },
  FL:   { tier: "bottom-high", xOffset: 35, yOffset: 65 },
  ECU:  { tier: "top-high", xOffset: -25, yOffset: -68 },
  PU:   { tier: "top-low", xOffset: 25, yOffset: -38 },
  RL:   { tier: "bottom-high", xOffset: -35, yOffset: 65 },
  RR:   { tier: "bottom-low", xOffset: 45, yOffset: 34 },
  WING: { tier: "top-high", xOffset: 0, yOffset: -68 },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; text: string }> = {
  body: { label: "Body", color: "#38bdf8", bg: "bg-sky-500/15", border: "border-sky-500/40", text: "text-sky-300" },
  glass: { label: "Glass", color: "#22d3ee", bg: "bg-cyan-500/15", border: "border-cyan-500/40", text: "text-cyan-300" },
  powertrain: { label: "Powertrain", color: "#fbbf24", bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-300" },
  chassis: { label: "Chassis", color: "#94a3b8", bg: "bg-slate-500/15", border: "border-slate-500/40", text: "text-slate-300" },
  aero: { label: "Aero", color: "#34d399", bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-300" },
  interior: { label: "Interior", color: "#a78bfa", bg: "bg-purple-500/15", border: "border-purple-500/40", text: "text-purple-300" },
  electrical: { label: "Electrical", color: "#60a5fa", bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-300" },
};

const VIEW_MODES = [
  { id: "studio" as ViewMode, label: "Studio PBR", icon: Sparkles, desc: "Photorealistic Blender showroom with metallic clearcoat, optical glass & Brembo brakes" },
  { id: "blueprint" as ViewMode, label: "Blueprint CAD", icon: FileCode2, desc: "Vision Pro holographic CAD blueprint & calibrated chassis telemetry reticles" },
  { id: "exploded" as ViewMode, label: "Exploded", icon: Layers3, desc: "Interactive 3D vehicle disassembly along calibrated spatial vectors" },
  { id: "anatomy" as ViewMode, label: "Anatomy", icon: ScanSearch, desc: "Translucent X-Ray cut with glowing powertrain, battery & electrical conduits" },
  { id: "cutaway" as ViewMode, label: "Cutaway", icon: Scissors, desc: "Dynamic volumetric clipping plane cross-section reveal" },
];

// Calibrated 3D Exploded displacement vectors for vehicle subsystems (Three.js: +X Right, +Y Up, -Z Forward, +Z Rearward)
const EXPLODED_VECTORS: Record<string, [number, number, number]> = {
  roof: [0, 0.75, 0],
  hood: [0, 0.40, -0.45],
  bumper_f: [0, 0.05, -0.85],
  bumper_r: [0, 0.05, 0.85],
  door_fl: [0.65, 0.15, -0.10],
  door_fr: [-0.65, 0.15, -0.10],
  door_rl: [0.65, 0.15, 0.20],
  door_rr: [-0.65, 0.15, 0.20],
  fender_l: [0.55, 0.20, -0.35],
  fender_r: [-0.55, 0.20, -0.35],
  quarter_l: [0.55, 0.25, 0.35],
  quarter_r: [-0.55, 0.25, 0.35],
  engine: [0, 0.30, -0.35],
  intake: [0, 0.55, -0.35],
  turbos: [0.25, 0.35, -0.25],
  gearbox: [0, 0.20, 0.40],
  diff: [0, 0.10, 0.65],
  driveshaft: [0, 0.10, 0.30],
  splitter: [0, -0.25, -0.80],
  wing: [0, 0.80, 0.65],
  diffuser: [0, -0.25, 0.75],
  wheel_fl: [0.75, 0, -0.25],
  wheel_fr: [-0.75, 0, -0.25],
  wheel_rl: [0.75, 0, 0.25],
  wheel_rr: [-0.75, 0, 0.25],
  caliper_fl: [0.85, 0, -0.25],
  caliper_fr: [-0.85, 0, -0.25],
  caliper_rl: [0.85, 0, 0.25],
  caliper_rr: [-0.85, 0, 0.25],
  seats: [0, 0.35, 0],
  dashboard: [0, 0.40, -0.20],
  battery: [0, -0.45, 0],
  floor: [0, -0.35, 0],
  // Procedural node mappings
  body_front: [0, 0.30, -0.75],
  body_cabin: [0, 0.50, 0],
  body_roof: [0, 0.85, 0],
  body_rear: [0, 0.30, 0.75],
  body_underbody: [0, -0.40, 0],
  aero_front: [0, -0.20, -0.85],
  aero_rear: [0, 0.75, 0.85],
  aero_diffuser: [0, -0.25, 0.75],
  chassis: [0, -0.15, 0],
};

export interface VehicleModelOption {
  id: string;
  label: string;
  family: string;
  path: string;
  badge: string;
  desc: string;
}

const VEHICLE_FAMILY_MODELS: VehicleModelOption[] = [
  { id: "sedan", label: "Executive Sedan", family: "Unibody Passenger", path: "/models/Car_Sedan_Complete.glb", badge: "SEDAN", desc: "Midnight Sapphire Class-A EV Sedan with dual e-motors & VIP cabin" },
  { id: "pickup_truck", label: "HiLux SR5 Pickup", family: "Body-on-Frame Utility", path: "/models/Car_HiLux_SR5_Complete.glb", badge: "PICKUP", desc: "2025 Double-Cab 4WD Turbo-Diesel with ladder frame & reinforced cargo bed" },
  { id: "hypercar", label: "Apex Hypercar", family: "High-Downforce", path: "/models/Car_Hypercar_Complete.glb", badge: "HYPER", desc: "Mid-engine carbon monocoque with active DRS rear wing & aero splitter" },
  { id: "gt3", label: "GT3 Supercar", family: "Track Performance", path: "/models/Car_GT3_Supercar_Complete.glb", badge: "GT3", desc: "Aerodynamic lightweight track machine with roll cage & carbon body" },
  { id: "suv", label: "Luxury SUV", family: "Elevated Skateboard", path: "/models/Car_Suv_Complete.glb", badge: "SUV", desc: "High-clearance all-terrain luxury platform with dual-motor AWD" },
  { id: "crossover", label: "Crossover Tourer", family: "Multi-Activity", path: "/models/Car_Crossover_Complete.glb", badge: "CROSS", desc: "Dynamic unibody sports crossover with panoramic glass" },
  { id: "f1", label: "Formula 1 Apex", family: "Ground Effect", path: "/models/Car_F1_Complete.glb", badge: "F1", desc: "Open-wheel ground effect racer with multi-tier front wing & halo" },
];

interface Props {
  onSelectStage?: (stageId: string) => void;
}

function VehicleViewSystemComponent({ onSelectStage }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("studio");
  const [selectedHotspot, setSelectedHotspot] = useState<ComponentInfo | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<ComponentInfo | null>(null);
  const [explodedProgress, setExplodedProgress] = useState(0.65);
  const [cutSide, setCutSide] = useState<"left" | "right" | "front" | "rear" | "top">("left");
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({
    body: true,
    glass: true,
    powertrain: true,
    chassis: true,
    aero: true,
    interior: true,
    electrical: true,
  });
  const [is3DMode, setIs3DMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Background & Label Visibility Settings (Default: Clean mode with no overlapping labels)
  const [bgStyle, setBgStyle] = useState<"studio" | "cad" | "minimal" | "blueprint">("studio");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAllLabels, setShowAllLabels] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  // 3D Viewport Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const clipPlanesRef = useRef<Record<string, THREE.Plane>>({});
  const initialMeshStates = useRef<Map<string, { pos: THREE.Vector3; mat: THREE.Material | THREE.Material[] }>>(new Map());

  // Screen-projected 2D coordinates for 3D Hotspot Pins
  const [hotspotScreenPositions, setHotspotScreenPositions] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  // Active Vehicle Model Family State
  const [selectedModelId, setSelectedModelId] = useState<string>("sedan");
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [isSceneReady, setIsSceneReady] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // 1. INITIALIZE THREE.JS 3D SCENE
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    // Scene setup with transparent background allowing container gradient
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    // Camera setup (side profile angle matching blueprint)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.2, 3.8, 2.0);
    cameraRef.current = camera;

    // WebGL Renderer with alpha transparency and high performance
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 12.0;
    controls.target.set(0, 0, 0.45);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // Studio Lighting
    const ambientLight = new THREE.HemisphereLight(0x38bdf8, 0x0a1020, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 6, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    fillLight.position.set(-6, -3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x22c55e, 1.8);
    rimLight.position.set(0, -6, 4);
    scene.add(rimLight);

    // Subtle Non-Intrusive Engineering Floor Grid
    const gridHelper = new THREE.GridHelper(14, 24, 0x0284c7, 0x334155);
    gridHelper.position.y = -0.01;
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.16;
    }
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Clipping Planes for 3D Cutaway (Three.js space: Y is Up, Z is Longitudinal)
    clipPlanesRef.current = {
      left: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
      right: new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
      front: new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.5),
      rear: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.5),
      top: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.7),
    };

    // 3D Vehicle Root Group
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);
    vehicleGroupRef.current = vehicleGroup;
    setIsSceneReady(true);

    // Animation Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Project 3D Hotspot positions to 2D screen coordinates
      if (camera && vehicleGroup && container) {
        const screenCoords: Record<string, { x: number; y: number; visible: boolean }> = {};
        const rect = container.getBoundingClientRect();

        COMPONENT_HOTSPOTS.forEach((spot) => {
          // Convert 3D world pos
          const v = new THREE.Vector3(spot.pos3d[0], spot.pos3d[2], -spot.pos3d[1]);
          v.project(camera);

          // Check if behind camera
          const isBehind = v.z > 1;
          const x = ((v.x + 1) * width) / 2;
          const y = ((-v.y + 1) * height) / 2;

          screenCoords[spot.id] = {
            x,
            y,
            visible: !isBehind && x >= 0 && x <= width && y >= 0 && y <= height,
          };
        });
        setHotspotScreenPositions(screenCoords);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update Grid Helper Visibility and Opacity
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid && bgStyle !== "minimal";
      if (gridHelperRef.current.material instanceof THREE.Material) {
        gridHelperRef.current.material.transparent = true;
        gridHelperRef.current.material.opacity = bgStyle === "blueprint" ? 0.30 : bgStyle === "cad" ? 0.20 : 0.16;
      }
    }
  }, [showGrid, bgStyle]);

  // Dynamic Background Gradient
  const bgGradient = useMemo(() => {
    switch (bgStyle) {
      case "minimal":
        return "radial-gradient(ellipse at 50% 45%, #0a0e1a 0%, #050811 60%, #020307 100%)";
      case "cad":
        return "radial-gradient(ellipse at 50% 45%, #0f1e38 0%, #091224 55%, #03060f 100%)";
      case "blueprint":
        return "radial-gradient(ellipse at 50% 45%, #0c2b4d 0%, #06182c 55%, #020a14 100%)";
      case "studio":
      default:
        return "radial-gradient(ellipse at 50% 45%, #14213d 0%, #0c1424 55%, #040711 100%)";
    }
  }, [bgStyle]);

  // --------------------------------------------------------------------------
  // 2. APPLY VIEW MODES & SHADERS (Blueprint, Exploded, Anatomy, Cutaway)
  // --------------------------------------------------------------------------
  const applyViewModeShaders = useCallback(() => {
    const vg = vehicleGroupRef.current;
    if (!vg) return;

    vg.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        const initial = initialMeshStates.current.get(mesh.name);
        const baseMat = initial?.mat;

        // Reset clipping
        mesh.material = Array.isArray(baseMat) ? baseMat.map((m) => m.clone()) : (baseMat ? (baseMat as THREE.Material).clone() : mesh.material);

        if (viewMode === "studio") {
          // Photorealistic Studio PBR: Base materials from Blender are retained
          // with pristine metallic paint, clearcoat, rubber tires, and glass
        } else if (viewMode === "blueprint") {
          // Vision Pro Holographic CAD Shader - clean frosted cyan glass & glowing internals (no jagged triangulated wireframe)
          if (name.includes("body") || name.includes("hood") || name.includes("door") || name.includes("roof") || name.includes("fender") || name.includes("bumper")) {
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0x071526,
              emissive: new THREE.Color(0x0284c7),
              emissiveIntensity: 0.28,
              roughness: 0.15,
              metalness: 0.45,
              transmission: 0.72,
              transparent: true,
              opacity: 0.85,
              ior: 1.45,
            });
          } else if (name.includes("glass") || name.includes("windshield") || name.includes("window")) {
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0x0ea5e9,
              transmission: 0.95,
              roughness: 0.05,
              transparent: true,
              opacity: 0.35,
              ior: 1.52,
            });
          } else if (name.includes("wheel") || name.includes("rim") || name.includes("tire")) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x0f2942,
              emissive: new THREE.Color(0x0369a1),
              emissiveIntensity: 0.35,
              metalness: 0.85,
              roughness: 0.25,
            });
          } else {
            // Mechanical powertrain, brakes, suspension internals
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: new THREE.Color(0x0284c7),
              emissiveIntensity: 0.4,
              metalness: 0.8,
              roughness: 0.2,
            });
          }
        } else if (viewMode === "anatomy") {
          // High-contrast translucent X-ray body with glowing mechanical conduits
          if (name.includes("body") || name.includes("glass") || name.includes("fender") || name.includes("door")) {
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0x1e293b,
              transmission: 0.88,
              opacity: 0.22,
              transparent: true,
              roughness: 0.1,
              ior: 1.5,
            });
          } else if (name.includes("engine") || name.includes("powertrain") || name.includes("cyl")) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xf59e0b,
              emissive: new THREE.Color(0xf59e0b),
              emissiveIntensity: 0.6,
              roughness: 0.2,
              metalness: 0.9,
            });
          } else if (name.includes("battery") || name.includes("ecu") || name.includes("cable")) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xff5722,
              emissive: new THREE.Color(0xff5722),
              emissiveIntensity: 0.8,
              roughness: 0.2,
              metalness: 0.5,
            });
          } else if (name.includes("brake") || name.includes("caliper")) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xef4444,
              emissive: new THREE.Color(0xef4444),
              emissiveIntensity: 0.5,
              roughness: 0.2,
            });
          }
        } else if (viewMode === "cutaway") {
          // Three.js Volumetric Cross-Section Clipping
          const activePlane = clipPlanesRef.current[cutSide];
          if (activePlane) {
            (mesh.material as THREE.Material).clippingPlanes = [activePlane];
            (mesh.material as THREE.Material).clipShadows = true;
          }
        }
      }
    });
  }, [viewMode, cutSide]);

  useEffect(() => {
    applyViewModeShaders();
  }, [viewMode, cutSide, applyViewModeShaders]);

  // --------------------------------------------------------------------------
  // 2B. DYNAMIC VEHICLE MODEL LOADER (PROCEDURAL FAMILIES + CUTAWAY SPECIMEN)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isSceneReady) return;
    const vg = vehicleGroupRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!vg || !camera || !controls) return;

    setIsModelLoading(true);

    // Clean up previous meshes
    while (vg.children.length > 0) {
      const child = vg.children[0];
      vg.remove(child);
      child.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const mesh = c as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    }

    const currentOption = VEHICLE_FAMILY_MODELS.find((m) => m.id === selectedModelId) || VEHICLE_FAMILY_MODELS[0];
    const loader = new GLTFLoader();

    loader.load(
      currentOption.path,
      (gltf) => {
        const root = gltf.scene;
        root.rotation.set(0, 0, 0);
        vg.add(root);

        // Cache initial mesh positions and materials for mode switching
        initialMeshStates.current.clear();
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            initialMeshStates.current.set(mesh.name, {
              pos: mesh.position.clone(),
              mat: mesh.material,
            });
          }
        });

        // Fit camera to bounding box (clean horizontal side profile matching blueprint mode)
        const box = new THREE.Box3().setFromObject(vg);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 4.0);
        controls.target.copy(center);
        camera.position.set(center.x + maxDim * 0.95, center.y + maxDim * 0.28, center.z + maxDim * 0.35);
        controls.update();

        // Apply view mode shaders to newly loaded model
        applyViewModeShaders();
        setIsModelLoading(false);
      },
      undefined,
      (err) => {
        console.warn(`[VehicleViewSystem] Could not load ${currentOption.path}:`, err);
        setIsModelLoading(false);
      }
    );
  }, [isSceneReady, selectedModelId, applyViewModeShaders]);

  // --------------------------------------------------------------------------
  // 3. APPLY 3D EXPLODED DISASSEMBLY VECTORS
  // --------------------------------------------------------------------------
  useEffect(() => {
    const vg = vehicleGroupRef.current;
    if (!vg) return;

    vg.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        const initial = initialMeshStates.current.get(mesh.name);
        if (!initial) return;

        if (viewMode === "exploded") {
          // Find matching vector
          let offset: [number, number, number] = [0, 0, 0];
          for (const [key, vec] of Object.entries(EXPLODED_VECTORS)) {
            if (name.includes(key)) {
              offset = vec;
              break;
            }
          }
          const factor = explodedProgress;
          // Note: in Three.js rotated container, Z is Y and Y is -Z
          mesh.position.set(
            initial.pos.x + offset[0] * factor,
            initial.pos.y + offset[1] * factor,
            initial.pos.z + offset[2] * factor
          );
        } else {
          mesh.position.copy(initial.pos);
        }
      }
    });
  }, [viewMode, explodedProgress]);

  // --------------------------------------------------------------------------
  // 4. CATEGORY LAYER VISIBILITY FILTERING
  // --------------------------------------------------------------------------
  useEffect(() => {
    const vg = vehicleGroupRef.current;
    if (!vg) return;

    vg.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        let cat = "body";
        if (name.includes("glass") || name.includes("windshield") || name.includes("window")) cat = "glass";
        else if (name.includes("engine") || name.includes("powertrain") || name.includes("gearbox") || name.includes("diff") || name.includes("turbo")) cat = "powertrain";
        else if (name.includes("chassis") || name.includes("susp") || name.includes("brake") || name.includes("wheel") || name.includes("tire") || name.includes("rim")) cat = "chassis";
        else if (name.includes("aero") || name.includes("splitter") || name.includes("wing") || name.includes("diffuser")) cat = "aero";
        else if (name.includes("interior") || name.includes("seat") || name.includes("dash") || name.includes("steer") || name.includes("console")) cat = "interior";
        else if (name.includes("elect") || name.includes("battery") || name.includes("ecu") || name.includes("cable")) cat = "electrical";

        mesh.visible = visibleCategories[cat] ?? true;
      }
    });
  }, [visibleCategories]);

  // --------------------------------------------------------------------------
  // 5. CAMERA PRESETS
  // --------------------------------------------------------------------------
  const setCameraPreset = (preset: "side" | "front_34" | "top" | "rear_34") => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (preset) {
      case "side": // Clean side profile blueprint view
        cam.position.set(5.2, 0.55, 0);
        ctrl.target.set(0, 0.55, 0);
        break;
      case "front_34": // Dynamic front 3/4 hero angle
        cam.position.set(3.8, 1.8, -3.8);
        ctrl.target.set(0, 0.50, 0);
        break;
      case "top": // Top-down architectural plan view
        cam.position.set(0, 6.5, 0);
        ctrl.target.set(0, 0, 0);
        break;
      case "rear_34": // Dynamic rear 3/4 angle
        cam.position.set(3.8, 1.8, 3.8);
        ctrl.target.set(0, 0.50, 0);
        break;
    }
    ctrl.update();
  };

  const focusHotspot = (spot: ComponentInfo) => {
    setSelectedHotspot(spot);
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    const targetPos = new THREE.Vector3(spot.pos3d[0], spot.pos3d[2], -spot.pos3d[1]);
    ctrl.target.copy(targetPos);
    cam.position.set(targetPos.x + 1.8, targetPos.y + 1.2, targetPos.z + 1.5);
    ctrl.update();
  };

  const resetAll = () => {
    setSelectedHotspot(null);
    setHoveredHotspot(null);
    setExplodedProgress(0.65);
    setVisibleCategories({
      body: true,
      glass: true,
      powertrain: true,
      chassis: true,
      aero: true,
      interior: true,
      electrical: true,
    });
    setCameraPreset("side");
  };

  const activeDisplay = selectedHotspot || hoveredHotspot;

  return (
    <div
      className={`dark-surface dark-hud cad-hud bg-[#080d1a] backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 overflow-y-auto" : ""
      }`}
      style={{
        backgroundColor: "rgba(8, 13, 26, 0.98)",
        borderColor: "rgba(71, 85, 105, 0.85)",
        borderWidth: "1px",
        borderStyle: "solid",
        color: "#f8fafc",
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Layers3 size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">VEHICLE ANATOMY VIEWER [BLENDER 3D]</span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={9} /> {VIEW_MODES.find((v) => v.id === viewMode)?.label}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Interactive 3D Vehicle Disassembly & CAD Anatomy
            </h3>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 rounded-xl p-1 dark-hud cad-hud">
          {VIEW_MODES.map((v) => {
            const Icon = v.icon;
            const active = viewMode === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
                title={v.desc}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Procedural Vehicle Family Asset Selector Strip */}
      <div className="mb-3 p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 dark-hud cad-hud">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Box size={12} /> MASTER BLENDER VEHICLE FLEET
          </div>
          <span className="text-xs text-slate-300 font-mono hidden md:inline">
            {VEHICLE_FAMILY_MODELS.find(m => m.id === selectedModelId)?.desc}
          </span>
          {isModelLoading && (
            <span className="text-[11px] font-mono text-amber-400 animate-pulse flex items-center gap-1.5 ml-2">
              <Sparkles size={12} /> Loading Master Vehicle GLB...
            </span>
          )}
        </div>

        {/* Scrollable Model Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {VEHICLE_FAMILY_MODELS.map((opt) => {
            const active = selectedModelId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedModelId(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/90"
                }`}
                title={`${opt.label} (${opt.family})`}
              >
                <span>{opt.label}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded uppercase ${
                  active ? "bg-slate-950/40 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
                }`}>
                  {opt.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 relative z-10">
        {/* Left: Camera Presets */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded-xl p-1 text-[11px] font-mono dark-hud cad-hud">
          <span className="text-slate-400 px-2 py-0.5 text-[9px] uppercase font-bold flex items-center gap-1">
            <Compass size={11} className="text-cyan-400" /> 3D Angles:
          </span>
          <button onClick={() => setCameraPreset("side")} className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer font-semibold">
            Side Profile
          </button>
          <button onClick={() => setCameraPreset("front_34")} className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer font-semibold">
            Front 3/4
          </button>
          <button onClick={() => setCameraPreset("top")} className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer font-semibold">
            Top Blueprint
          </button>
          <button onClick={() => setCameraPreset("rear_34")} className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer font-semibold">
            Rear Aero
          </button>
        </div>

        {/* Environment & Backdrop Controls */}
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded-xl p-1 text-[11px] font-mono dark-hud cad-hud">
          <span className="text-slate-400 px-2 py-0.5 text-[9px] uppercase font-bold flex items-center gap-1">
            <Palette size={11} className="text-sky-400" /> Backdrop:
          </span>
          {(
            [
              { id: "studio", label: "Studio" },
              { id: "cad", label: "CAD Dark" },
              { id: "blueprint", label: "Blueprint" },
              { id: "minimal", label: "Void" },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => setBgStyle(b.id)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer font-bold ${
                bgStyle === b.id
                  ? "bg-sky-500/25 text-sky-300 border border-sky-400/50 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              {b.label}
            </button>
          ))}
          <div className="w-[1px] h-3.5 bg-slate-800 mx-0.5" />
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer font-semibold ${
              showGrid
                ? "bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                : "text-slate-400 hover:text-white"
            }`}
            title="Toggle Floor Grid"
          >
            <Grid size={11} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer font-semibold ${
              showHotspots
                ? "bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                : "text-slate-400 hover:text-white"
            }`}
            title="Toggle Engineering 3D Hotspot Pins"
          >
            <Eye size={11} />
            <span>{showHotspots ? "Pins" : "Pins Off"}</span>
          </button>
          {showHotspots && (
            <button
              onClick={() => setShowAllLabels(!showAllLabels)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer font-semibold ${
                showAllLabels
                  ? "bg-amber-500/25 text-amber-300 font-bold border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Toggle Expanded All Labels vs Clean Hover Mode"
            >
              <Tag size={11} className={showAllLabels ? "text-amber-400" : "text-slate-500"} />
              <span>{showAllLabels ? "Callouts: All" : "Callouts: Clean"}</span>
            </button>
          )}
        </div>

        {/* Right: Exploded Expansion Slider or Cut Plane Selector */}
        {viewMode === "exploded" && (
          <div className="flex items-center gap-2 bg-slate-950/90 border border-cyan-500/40 rounded-xl px-3 py-1.5 animate-in fade-in duration-200 dark-hud cad-hud">
            <Sliders size={13} className="text-cyan-400" />
            <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase">Disassembly Spread:</span>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={explodedProgress}
              onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
              className="w-28 accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-100 font-bold w-9 text-right">{Math.round((explodedProgress / 1.5) * 100)}%</span>
          </div>
        )}

        {viewMode === "cutaway" && (
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-rose-500/40 rounded-xl p-1 animate-in fade-in duration-200 dark-hud cad-hud">
            <span className="text-[10px] font-mono text-rose-300 px-2 uppercase font-bold flex items-center gap-1">
              <Scissors size={12} /> Cut Plane:
            </span>
            {(["left", "right", "front", "rear", "top"] as const).map((side) => (
              <button
                key={side}
                onClick={() => setCutSide(side)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  cutSide === side
                    ? "bg-rose-500/25 text-rose-200 border border-rose-400/60 shadow-[0_0_10px_rgba(244,63,94,0.35)] font-black"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {side.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Viewport Actions */}
        <div className="flex items-center gap-1.5 ml-auto dark-hud cad-hud">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              autoRotate ? "bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]" : "bg-slate-950/90 text-slate-300 border-slate-700/80 hover:text-white hover:bg-slate-800"
            }`}
            title="Auto-Turntable Orbit"
          >
            <RotateCcw size={13} className={autoRotate ? "animate-spin text-cyan-300" : ""} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-950/90 text-slate-300 border border-slate-700/80 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen 3D Studio"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Primary 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        style={{ background: bgGradient, color: "#f8fafc" }}
        className={`relative w-full overflow-hidden rounded-2xl border border-slate-700/80 shadow-[0_0_40px_rgba(0,0,0,0.9)] transition-all duration-300 dark-surface dark-hud cad-hud ${
          isFullscreen ? "h-[calc(100vh-240px)]" : "h-[440px]"
        }`}
      >
        <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

        {/* 3D Interactive Hotspots Screen Overlay */}
        {showHotspots && (
          <div className="absolute inset-0 pointer-events-none">
            {COMPONENT_HOTSPOTS.map((spot) => {
              if (visibleCategories[spot.cat] === false) return null;
              const screen = hotspotScreenPositions[spot.id];
              if (!screen || !screen.visible) return null;
              const isSelected = selectedHotspot?.id === spot.id;
              const isHovered = hoveredHotspot?.id === spot.id;
              const offsetCfg = HOTSPOT_CALLOUT_CONFIG[spot.id] || { tier: "top-low", xOffset: 0, yOffset: -38 };

              return (
                <div
                  key={spot.id}
                  style={{
                    transform: `translate(${screen.x}px, ${screen.y}px)`,
                    position: "absolute",
                    left: 0,
                    top: 0,
                  }}
                  className="pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  onClick={() => focusHotspot(spot)}
                  onMouseEnter={() => setHoveredHotspot(spot)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  {/* Subtle Non-Intrusive Breathing Halo */}
                  <div
                    className={`absolute -inset-1.5 rounded-full pointer-events-none transition-opacity ${
                      isSelected || isHovered ? "animate-ping opacity-50" : "opacity-25 animate-pulse"
                    }`}
                    style={{ backgroundColor: spot.color }}
                  />

                  {/* Clean Precision 28px Reticle Pin with Guaranteed White Text */}
                  <div
                    className={`relative w-7 h-7 rounded-full flex items-center justify-center border backdrop-blur-md transition-all duration-200 dark-hud cad-hud ${
                      isSelected || isHovered
                        ? "scale-125 border-white ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(255,255,255,1)]"
                        : "scale-100 hover:scale-115 shadow-[0_0_12px_rgba(0,0,0,0.95)]"
                    }`}
                    style={{
                      borderColor: isSelected || isHovered ? "#ffffff" : spot.color,
                      backgroundColor: "#050914",
                      boxShadow: isSelected || isHovered
                        ? `0 0 20px ${spot.color}, 0 0 8px #ffffff`
                        : `0 0 10px rgba(0,0,0,0.9), inset 0 0 6px ${spot.color}40`,
                    }}
                  >
                    {/* Micro Category Color Dot */}
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 shadow-md"
                      style={{ backgroundColor: spot.color, boxShadow: `0 0 8px ${spot.color}` }}
                    />
                    <span
                      className="text-[9px] font-mono font-black tracking-tight"
                      style={{ color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,1)" }}
                    >
                      {spot.id}
                    </span>
                  </div>

                  {/* Single Clean Micro-Pill Tag on Hover / Selection (When not in All Labels mode) */}
                  {!showAllLabels && (isHovered || isSelected) && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none z-30 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 dark-hud cad-hud">
                      <div
                        className="px-3 py-1 rounded-full border text-[11px] font-mono font-bold shadow-[0_6px_25px_rgba(0,0,0,0.95)] backdrop-blur-xl flex items-center gap-2"
                        style={{
                          backgroundColor: "#070d1c",
                          borderColor: isSelected ? "#38bdf8" : spot.color,
                          boxShadow: `0 0 18px ${spot.color}99, 0 4px 15px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.25)`,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full animate-pulse shadow-sm shrink-0"
                          style={{ backgroundColor: spot.color, boxShadow: `0 0 8px ${spot.color}` }}
                        />
                        <span
                          className="font-extrabold tracking-wide text-xs"
                          style={{ color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                        >
                          {spot.label}
                        </span>
                        <span
                          className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: `${spot.color}35`,
                            color: "#ffffff",
                            border: `1px solid ${spot.color}80`,
                            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                          }}
                        >
                          {spot.cat}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Anti-Collision Staggered Callouts (When All Labels is Active) */}
                  {showAllLabels && (
                    <div
                      className="absolute pointer-events-none z-30 whitespace-nowrap animate-in fade-in duration-200 dark-hud cad-hud"
                      style={{
                        transform: `translate(${offsetCfg.xOffset}px, ${offsetCfg.yOffset}px)`,
                        left: "50%",
                        top: "50%",
                      }}
                    >
                      {/* Fine SVG Leader Line connecting reticle center (0,0) to callout tag */}
                      <svg
                        className="absolute pointer-events-none overflow-visible"
                        style={{
                          left: `${-offsetCfg.xOffset}px`,
                          top: `${-offsetCfg.yOffset}px`,
                          width: "1px",
                          height: "1px",
                        }}
                      >
                        <line
                          x1="0"
                          y1="0"
                          x2={offsetCfg.xOffset}
                          y2={offsetCfg.yOffset}
                          stroke={spot.color}
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          opacity="0.9"
                        />
                      </svg>

                      <div
                        className="relative px-2.5 py-1 rounded-lg border shadow-[0_4px_25px_rgba(0,0,0,0.95)] backdrop-blur-xl flex items-center gap-2 dark-hud cad-hud"
                        style={{
                          backgroundColor: "#070d1c",
                          borderColor: isSelected || isHovered ? "#38bdf8" : `${spot.color}dd`,
                          boxShadow: isSelected || isHovered
                            ? `0 0 20px ${spot.color}aa, 0 2px 10px rgba(0,0,0,0.9)`
                            : `0 2px 12px rgba(0,0,0,0.9)`,
                        }}
                      >
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase text-white shadow-sm"
                          style={{ backgroundColor: spot.color, color: "#ffffff" }}
                        >
                          {spot.id}
                        </span>
                        <span
                          className="text-[11px] font-bold tracking-wide"
                          style={{ color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
                        >
                          {spot.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Technical Telemetry Card — High Contrast Obsidian HUD */}
        {activeDisplay && (
          <div
            className="absolute top-4 right-4 w-84 p-4.5 rounded-2xl border backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200 z-20 dark-surface dark-hud cad-hud"
            style={{
              backgroundColor: "rgba(6, 11, 24, 0.97)",
              borderColor: activeDisplay.color,
              boxShadow: `0 16px 50px rgba(0,0,0,0.95), 0 0 25px ${activeDisplay.color}40, inset 0 1px 1px rgba(255,255,255,0.2)`,
            }}
          >
            {/* Top Bar: Subsystem & Category */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_currentColor] shrink-0"
                  style={{ backgroundColor: activeDisplay.color, color: activeDisplay.color }}
                />
                <span
                  className="text-xs font-mono font-extrabold uppercase tracking-wide"
                  style={{ color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {activeDisplay.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-md border uppercase tracking-wider font-extrabold"
                  style={{
                    borderColor: `${activeDisplay.color}99`,
                    color: "#ffffff",
                    backgroundColor: `${activeDisplay.color}35`,
                    boxShadow: `0 0 10px ${activeDisplay.color}35`,
                  }}
                >
                  {activeDisplay.cat}
                </span>
                <button
                  onClick={() => {
                    setSelectedHotspot(null);
                    setHoveredHotspot(null);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Subsystem Name / Stat */}
            <div
              className="text-sm font-extrabold mb-1.5 flex items-center gap-2"
              style={{ color: "#38bdf8" }}
            >
              <Cpu size={15} className="text-cyan-400 shrink-0" />
              <span>{activeDisplay.stat}</span>
            </div>

            {/* Description & Technical Specs */}
            <div
              className="text-xs leading-relaxed mb-3.5 font-medium"
              style={{ color: "#e2e8f0" }}
            >
              {activeDisplay.det}
            </div>

            {/* Bottom Footer: CAD Status & Configure Action */}
            <div className="pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-xs font-mono">
              <span
                className="flex items-center gap-1.5 font-semibold text-[11px]"
                style={{ color: "#94a3b8" }}
              >
                <Gauge size={13} className="text-emerald-400 shrink-0" />
                <span>Real-time CAD telemetry</span>
              </span>
              {onSelectStage && (
                <button
                  onClick={() => onSelectStage(activeDisplay.cat)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/40 text-cyan-200 hover:text-white border border-cyan-400/70 text-[11px] font-extrabold tracking-wider transition-all shadow-[0_0_14px_rgba(6,182,212,0.35)] cursor-pointer flex items-center gap-1"
                >
                  <span>Configure Stage</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Viewport Watermark & Controls Guide — High-Contrast Pill */}
        <div
          className="absolute bottom-3 left-4 pointer-events-none flex flex-wrap items-center gap-2.5 border border-slate-600/80 px-4 py-1.5 rounded-full backdrop-blur-md shadow-2xl text-[11px] font-mono dark-surface dark-hud cad-hud"
          style={{ backgroundColor: "rgba(5, 9, 20, 0.94)", color: "#e2e8f0" }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <strong style={{ color: "#ffffff" }}>Orbit:</strong> Left Click + Drag
          </span>
          <span style={{ color: "#475569" }}>|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <strong style={{ color: "#ffffff" }}>Pan:</strong> Right Click + Drag
          </span>
          <span style={{ color: "#475569" }}>|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            <strong style={{ color: "#ffffff" }}>Zoom:</strong> Scroll Wheel
          </span>
        </div>
      </div>

      {/* Component Layers Control Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800 relative z-10 dark-surface dark-hud cad-hud">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold" style={{ color: "#94a3b8" }}>
            <Box size={12} className="text-cyan-400" /> 3D Automotive Subsystem Layers
          </span>
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <RotateCcw size={11} /> Reset 3D Stage
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => {
            const isVis = visibleCategories[catKey] ?? true;
            return (
              <button
                key={catKey}
                onClick={() =>
                  setVisibleCategories((prev) => ({
                    ...prev,
                    [catKey]: !isVis,
                  }))
                }
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-mono font-extrabold transition-all cursor-pointer dark-hud cad-hud ${
                  isVis
                    ? `${cfg.bg} ${cfg.border} shadow-[0_0_14px_rgba(0,0,0,0.5)]`
                    : "bg-slate-900/80 border-slate-800 text-slate-500 opacity-60"
                }`}
                style={{
                  color: isVis ? "#ffffff" : "#64748b",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: isVis ? cfg.color : "#64748b", boxShadow: isVis ? `0 0 8px ${cfg.color}` : "none" }}
                  />
                  <span style={{ color: isVis ? "#ffffff" : "#94a3b8" }}>{cfg.label}</span>
                </div>
                {isVis ? <Eye size={13} style={{ color: cfg.color }} /> : <EyeOff size={13} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const VehicleViewSystem = memo(VehicleViewSystemComponent);

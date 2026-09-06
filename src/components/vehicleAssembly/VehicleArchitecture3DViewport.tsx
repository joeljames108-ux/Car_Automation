// ============================================================================
// VEHICLE ARCHITECTURE 3D VIEWPORT
// ============================================================================
// Real-time photorealistic Three.js WebGL viewport for inspecting the selected
// vehicle category's dedicated engineering base (Chassis, Body Framework Cage,
// Floor, Wheel Arches, Hardpoints, Packaging Envelopes).
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Layers,
  Camera,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  Box,
  Compass,
  Grid,
} from "lucide-react";
import {
  useVehicleArchitectureStore,
  ArchitectureLayerVisibility,
} from "../../state/useVehicleArchitectureStore";

export const VehicleArchitecture3DViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedCategory = useVehicleArchitectureStore((s) => s.selectedCategory);
  const architecture = useVehicleArchitectureStore((s) => s.architecture);
  const layers = useVehicleArchitectureStore((s) => s.layers);
  const toggleLayer = useVehicleArchitectureStore((s) => s.toggleLayer);
  const setAllLayers = useVehicleArchitectureStore((s) => s.setAllLayers);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCamPreset, setActiveCamPreset] = useState<string>("iso");

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupsRef = useRef<Map<keyof ArchitectureLayerVisibility, THREE.Group>>(new Map());
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10); // Deep dark automotive studio slate
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.8, 3.2, 3.6);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going below ground
    controls.minDistance = 2.0;
    controls.maxDistance = 12.0;
    controls.target.set(0, 0.6, 0);
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xaad4ff, 1.2);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd700, 1.4);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // 6. Ground Studio Platform & Grid
    const grid = new THREE.GridHelper(12, 24, 0xf59e0b, 0x1f293d);
    grid.position.y = 0.001;
    scene.add(grid);
    gridHelperRef.current = grid;

    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x08090d,
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Load Architecture GLBs whenever selectedCategory changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    setIsLoading(true);
    setLoadError(null);

    // Clean up previous models
    modelGroupsRef.current.forEach((grp) => {
      scene.remove(grp);
      grp.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    });
    modelGroupsRef.current.clear();

    const loader = new GLTFLoader();
    const assetEntries: { key: keyof ArchitectureLayerVisibility; path: string; name: string }[] = [
      { key: "chassis", path: architecture.assets.chassisAsset, name: "Chassis" },
      { key: "bodyFramework", path: architecture.assets.bodyFrameworkAsset, name: "BodyFramework" },
      { key: "floor", path: architecture.assets.floorAsset, name: "Floor" },
      { key: "wheelArches", path: architecture.assets.wheelArchAsset, name: "WheelArches" },
      { key: "hardpoints", path: architecture.assets.hardpointAsset, name: "Hardpoints" },
      { key: "envelopes", path: architecture.assets.envelopeAsset, name: "Envelopes" },
    ];

    let loadedCount = 0;
    const newGroups = new Map<keyof ArchitectureLayerVisibility, THREE.Group>();

    assetEntries.forEach((entry) => {
      loader.load(
        entry.path,
        (gltf) => {
          const grp = new THREE.Group();
          grp.name = `Layer_${entry.key}`;
          grp.add(gltf.scene);
          grp.visible = layers[entry.key];

          // Enable shadows and enhance materials
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material) {
                (mesh.material as THREE.Material).needsUpdate = true;
              }
            }
          });

          scene.add(grp);
          newGroups.set(entry.key, grp);
          loadedCount++;

          if (loadedCount === assetEntries.length) {
            modelGroupsRef.current = newGroups;
            setIsLoading(false);
          }
        },
        undefined,
        (err) => {
          console.error(`Failed to load ${entry.name} from ${entry.path}:`, err);
          setLoadError(`Failed to load ${entry.name}`);
          loadedCount++;
          if (loadedCount === assetEntries.length) {
            setIsLoading(false);
          }
        }
      );
    });
  }, [selectedCategory, architecture]);

  // Sync Layer Visibility
  useEffect(() => {
    modelGroupsRef.current.forEach((grp, key) => {
      grp.visible = layers[key];
    });
  }, [layers]);

  // Camera Presets
  const setCameraPreset = useCallback((preset: "iso" | "side" | "top" | "front" | "rear") => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveCamPreset(preset);
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (preset) {
      case "iso":
        cam.position.set(4.8, 3.0, 3.6);
        ctrl.target.set(0, 0.6, 0);
        break;
      case "side":
        cam.position.set(0, 1.2, 5.8);
        ctrl.target.set(0, 0.6, 0);
        break;
      case "top":
        cam.position.set(0, 7.5, 0.01);
        ctrl.target.set(0, 0, 0);
        break;
      case "front":
        cam.position.set(5.5, 1.1, 0);
        ctrl.target.set(0, 0.6, 0);
        break;
      case "rear":
        cam.position.set(-5.5, 1.1, 0);
        ctrl.target.set(0, 0.6, 0);
        break;
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0c10] shadow-2xl select-none">
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Top Left: Category Badge & Architectural Dimensions */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
            {architecture.name}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {architecture.architectureClass.replace(/_/g, " ").toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800/80">
          <span>WB: <strong className="text-slate-200">{architecture.wheelbaseMm}mm</strong></span>
          <span className="text-slate-600">|</span>
          <span>TRACK: <strong className="text-slate-200">{architecture.trackFrontMm}mm</strong></span>
          <span className="text-slate-600">|</span>
          <span>HEIGHT: <strong className="text-slate-200">{architecture.overallHeightMm}mm</strong></span>
          <span className="text-slate-600">|</span>
          <span>CLEARANCE: <strong className="text-amber-400">{architecture.rideHeightMm}mm</strong></span>
        </div>
      </div>

      {/* Top Right: Camera Presets */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg z-10">
        {(["iso", "side", "top", "front", "rear"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setCameraPreset(p)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
              activeCamPreset === p
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Bottom Center: Layer Visibility Controller */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-slate-700/70 shadow-2xl z-10">
        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mr-1 flex items-center gap-1">
          <Layers size={12} className="text-amber-400" /> Layers:
        </span>
        {(
          [
            { key: "chassis", label: "Chassis", color: "text-slate-300" },
            { key: "bodyFramework", label: "Cage", color: "text-amber-400" },
            { key: "floor", label: "Floor", color: "text-slate-400" },
            { key: "wheelArches", label: "Arches", color: "text-cyan-400" },
            { key: "hardpoints", label: "Hardpoints", color: "text-yellow-400" },
            { key: "envelopes", label: "Envelopes", color: "text-emerald-400" },
          ] as const
        ).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
              layers[key]
                ? `bg-slate-800/90 border-slate-600 ${color} shadow-sm`
                : "bg-transparent border-transparent text-slate-600 hover:text-slate-400"
            }`}
          >
            {layers[key] ? <Eye size={10} /> : <EyeOff size={10} />}
            {label}
          </button>
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
          <div className="h-7 w-7 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-amber-300 tracking-wider">
            LOADING {architecture.name.toUpperCase()} CAD PACKAGE...
          </span>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-xs font-mono shadow-xl z-20">
          ⚠️ {loadError}
        </div>
      )}
    </div>
  );
};

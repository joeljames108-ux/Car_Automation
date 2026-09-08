import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  useInstrumentClusterStore,
  TELLTALE_DEFINITIONS,
  type ClusterTheme,
} from "../../state/instrumentClusterStore";
import { Camera, ZoomIn, RefreshCw, Eye, Sparkles } from "lucide-react";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

export const InstrumentClusterCanvasViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Store Selectors
  const warningLights = useInstrumentClusterStore((s) => s.warningLights);
  const speedMph = useInstrumentClusterStore((s) => s.speedMph);
  const engineRpm = useInstrumentClusterStore((s) => s.engineRpm);
  const fuelLevelPct = useInstrumentClusterStore((s) => s.fuelLevelPct);
  const coolantTempC = useInstrumentClusterStore((s) => s.coolantTempC);
  const batteryVolts = useInstrumentClusterStore((s) => s.batteryVolts);
  const oilPressurePsi = useInstrumentClusterStore((s) => s.oilPressurePsi);
  const theme = useInstrumentClusterStore((s) => s.theme);
  const focusedLightId = useInstrumentClusterStore((s) => s.focusedLightId);
  const setFocusedLightId = useInstrumentClusterStore((s) => s.setFocusedLightId);
  const toggleWarningLight = useInstrumentClusterStore((s) => s.toggleWarningLight);

  // References for Three.js scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const needleSpeedoRef = useRef<THREE.Object3D | null>(null);
  const needleTachoRef = useRef<THREE.Object3D | null>(null);
  const needleFuelRef = useRef<THREE.Object3D | null>(null);
  const needleTempRef = useRef<THREE.Object3D | null>(null);
  const needleVoltRef = useRef<THREE.Object3D | null>(null);
  const needleOilRef = useRef<THREE.Object3D | null>(null);

  const telltaleMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const dialFaceplateRef = useRef<THREE.Mesh | null>(null);

  // Setup Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0c10);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 50);
    camera.position.set(0.0, -0.65, 0.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.maxDistance = 1.8;
    controls.minDistance = 0.25;
    controls.maxPolarAngle = Math.PI / 2 + 0.3;
    controls.minPolarAngle = Math.PI / 2 - 0.3;
    controlsRef.current = controls;

    // Ambient studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(0.2, -0.8, 0.6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    rimLight.position.set(0.0, -0.4, 0.8);
    scene.add(rimLight);

    // Load Instrument Cluster GLB
    const loader = new GLTFLoader();
    const modelUrl = "/models/interior/instrument_cluster_master.glb";

    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;
        scene.add(root);

        // Find needle references
        root.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const name = child.name;

            if (name.includes("GAUGE_NEEDLE_SPEEDO")) needleSpeedoRef.current = child;
            if (name.includes("GAUGE_NEEDLE_TACHO")) needleTachoRef.current = child;
            if (name.includes("GAUGE_NEEDLE_FUEL")) needleFuelRef.current = child;
            if (name.includes("GAUGE_NEEDLE_TEMP")) needleTempRef.current = child;
            if (name.includes("GAUGE_NEEDLE_VOLT")) needleVoltRef.current = child;
            if (name.includes("GAUGE_NEEDLE_OIL")) needleOilRef.current = child;

            if (name.includes("CLUSTER_FACEPLATE")) {
              dialFaceplateRef.current = child;
            }

            // Telltale warning lights
            TELLTALE_DEFINITIONS.forEach((t) => {
              if (name.includes(t.meshNodeName)) {
                // Clone material to allow independent emissive control
                if (child.material) {
                  child.material = (child.material as THREE.Material).clone();
                  (child.material as THREE.MeshStandardMaterial).transparent = true;
                }
                telltaleMeshesRef.current.set(t.id, child);
              }
            });
          }
        });

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error("Failed to load instrument cluster GLB:", err);
        setLoading(false);
      }
    );

    // Raycaster for 3D clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        for (const [id, mesh] of telltaleMeshesRef.current.entries()) {
          if (hit === mesh || hit.parent === mesh) {
            playHMIClickSound();
            toggleWarningLight(id);
            setFocusedLightId(id);
            break;
          }
        }
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let found: string | null = null;
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        for (const [id, mesh] of telltaleMeshesRef.current.entries()) {
          if (hit === mesh || hit.parent === mesh) {
            found = id;
            renderer.domElement.style.cursor = "pointer";
            break;
          }
        }
      }
      if (!found) {
        renderer.domElement.style.cursor = "default";
      }
      setHoveredNode(found);
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);

    // Resize listener
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Needle Rotations Dynamically
  useEffect(() => {
    // 1. Speedometer: 0 MPH = -140 deg, 160 MPH = +140 deg (span 280 deg)
    if (needleSpeedoRef.current) {
      const t = Math.min(1, Math.max(0, speedMph / 160));
      const angle = THREE.MathUtils.degToRad(-140 + t * 280);
      needleSpeedoRef.current.rotation.y = -angle; // rotate around Y in vehicle space
    }

    // 2. Tachometer: 0 RPM = -140 deg, 8000 RPM = +120 deg
    if (needleTachoRef.current) {
      const t = Math.min(1, Math.max(0, engineRpm / 8000));
      const angle = THREE.MathUtils.degToRad(-140 + t * 260);
      needleTachoRef.current.rotation.y = -angle;
    }

    // 3. Fuel Level: 0% = -50 deg, 100% = +50 deg
    if (needleFuelRef.current) {
      const t = Math.min(1, Math.max(0, fuelLevelPct / 100));
      const angle = THREE.MathUtils.degToRad(-50 + t * 100);
      needleFuelRef.current.rotation.y = -angle;
    }

    // 4. Coolant Temp: 40C = -50 deg, 130C = +50 deg
    if (needleTempRef.current) {
      const t = Math.min(1, Math.max(0, (coolantTempC - 40) / 90));
      const angle = THREE.MathUtils.degToRad(-50 + t * 100);
      needleTempRef.current.rotation.y = -angle;
    }

    // 5. Battery Voltage: 9V = -50 deg, 19V = +50 deg
    if (needleVoltRef.current) {
      const t = Math.min(1, Math.max(0, (batteryVolts - 9) / 10));
      const angle = THREE.MathUtils.degToRad(-50 + t * 100);
      needleVoltRef.current.rotation.y = -angle;
    }

    // 6. Oil Pressure: 0 PSI = -50 deg, 80 PSI = +50 deg
    if (needleOilRef.current) {
      const t = Math.min(1, Math.max(0, oilPressurePsi / 80));
      const angle = THREE.MathUtils.degToRad(-50 + t * 100);
      needleOilRef.current.rotation.y = -angle;
    }
  }, [speedMph, engineRpm, fuelLevelPct, coolantTempC, batteryVolts, oilPressurePsi]);

  // Update Telltale Warning Lights Illumination
  useEffect(() => {
    telltaleMeshesRef.current.forEach((mesh, id) => {
      const isActive = !!warningLights[id];
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (isActive) {
          mat.emissiveIntensity = 2.8;
          mat.opacity = 1.0;
        } else {
          mat.emissiveIntensity = 0.04;
          mat.opacity = 0.22;
        }
      }
    });
  }, [warningLights]);

  // Update Backlight Theme Color Tint
  useEffect(() => {
    if (!dialFaceplateRef.current) return;
    const mat = dialFaceplateRef.current.material as THREE.MeshStandardMaterial;
    if (!mat) return;

    const themeColors: Record<ClusterTheme, number> = {
      ice_blue: 0x38bdf8,
      amber_classic: 0xf59e0b,
      crimson_sport: 0xef4444,
      arctic_white: 0xf8fafc,
      neon_cyber: 0xa855f7,
    };

    mat.emissive = new THREE.Color(themeColors[theme] || 0x38bdf8);
    mat.emissiveIntensity = 0.65;
  }, [theme]);

  // Camera preset handlers
  const setCameraPreset = (preset: "default" | "speedo" | "tacho" | "aux") => {
    playHMIClickSound();
    if (!cameraRef.current || !controlsRef.current) return;

    if (preset === "default") {
      cameraRef.current.position.set(0.0, -0.65, 0.0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "speedo") {
      cameraRef.current.position.set(0.0, -0.42, 0.0);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "tacho") {
      cameraRef.current.position.set(-0.19, -0.38, 0.0);
      controlsRef.current.target.set(-0.19, 0, 0);
    } else if (preset === "aux") {
      cameraRef.current.position.set(0.22, -0.38, 0.0);
      controlsRef.current.target.set(0.22, 0, 0);
    }
  };

  const activeLightDef = TELLTALE_DEFINITIONS.find((t) => t.id === (hoveredNode || focusedLightId));

  return (
    <div className="relative w-full h-[380px] md:h-[480px] bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md z-30">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono tracking-widest text-cyan-300 uppercase">
              CALIBRATING 3D INSTRUMENT CLUSTER CAD...
            </span>
          </div>
        </div>
      )}

      {/* Top HUD Overlay: Live Digital Speedometer & RPM */}
      <div className="absolute top-3 left-4 flex items-center gap-3 z-10 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">SPEED</span>
            <span className="text-xl font-black font-mono text-cyan-300 leading-none">
              {Math.round(speedMph)} <span className="text-xs font-normal text-slate-400">MPH</span>
            </span>
          </div>
          <div className="h-7 w-px bg-slate-700" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">TACHOMETER</span>
            <span className="text-xl font-black font-mono text-emerald-400 leading-none">
              {Math.round(engineRpm)} <span className="text-xs font-normal text-slate-400">RPM</span>
            </span>
          </div>
        </div>

        {/* Focused Light Badge */}
        {activeLightDef && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-lg animate-pulse">
            <span className="text-sm">{activeLightDef.iconSymbol}</span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-mono text-slate-400">
                {hoveredNode ? "HOVERED LIGHT" : "SELECTED WARNING"}
              </span>
              <span
                className="text-xs font-bold leading-tight"
                style={{ color: activeLightDef.colorHex }}
              >
                {activeLightDef.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Preset Quick Bar */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md z-10 shadow-xl">
        <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
          <Camera size={12} /> SIGHTLINE:
        </span>
        <button
          onClick={() => setCameraPreset("default")}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition-all"
        >
          Overview
        </button>
        <button
          onClick={() => setCameraPreset("speedo")}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer transition-all"
        >
          Speedo & MID
        </button>
        <button
          onClick={() => setCameraPreset("tacho")}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 cursor-pointer transition-all"
        >
          Tachometer
        </button>
        <button
          onClick={() => setCameraPreset("aux")}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer transition-all"
        >
          Aux Gauges
        </button>
      </div>

      {/* Bottom Left Hint */}
      <div className="absolute bottom-3 left-4 text-[10px] font-mono text-slate-400 pointer-events-none z-10 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
        💡 Drag to rotate • Click any 3D warning light to toggle & inspect
      </div>
    </div>
  );
};

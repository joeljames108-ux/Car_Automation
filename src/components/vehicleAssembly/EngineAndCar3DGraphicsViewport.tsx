// ===================================================================
// INTERACTIVE PHOTOREALISTIC 3D ENGINE & CAR GRAPHICS VIEWPORT
// ===================================================================
// Renders real-time Three.js WebGL 3D models of Engine & Vehicles:
// - Real Production GLB Models: BMW i8, Ford Escort Cosworth, Mini Countryman JCW, Volvo Restomod, V12 Engine
// - PBR Shaded, Metallic Clearcoat Paint, Carbon Fiber Weave, Soft Contact Shadows
// - Disassembly Kinematics (Exploded View Slider), X-Ray Structural Inspection Mode
// - Lighting Studio: Studio Softbox 3-Point Light, Cyber Neon Night, Proving Ground Sun
// - Camera Angle Presets: Hero 3/4, Side Profile, Cockpit Interior, Engine Bay, Rear Diffuser
// - Part Hierarchy Inspector: Explores GLB mesh tree nodes with visibility & polycounts
// ===================================================================

import React, { useEffect, useRef, useState, memo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import { StudioEnvironmentGenerator } from "../../exterior3d/environment/StudioEnvironmentGenerator";
import { Engine3DGeometryGenerator, EngineLayout3D } from "../../exterior3d/geometry/engine3dGeometryGenerator";
import { Car3DGeometryGenerator, VehicleBodyStyle3D, CarGlbOptions } from "../../exterior3d/geometry/car3dGeometryGenerator";
import { Car3DGlbAssetRegistry } from "../../exterior3d/geometry/car3dGlbAssetRegistry";
import { disposeThreeScene } from "../../exterior3d/utils/threeDisposal";
import { GlassFilter } from "../ui/LiquidGlass";
import {
  MultiModeVisualizationHUD,
  MultiModeState,
} from "../../exterior3d/visualization/MultiModeVisualizationHUD";
import {
  SUBSYSTEM_CAPABILITIES,
  SubsystemCapability,
} from "../../exterior3d/visualization/multimodeCapabilities";
import { CutawayClippingManager } from "../../exterior3d/visualization/CutawayClippingManager";
import { FlowVisualizationSystem } from "../../exterior3d/visualization/FlowVisualizationSystem";
import {
  GetLayersGradientShader,
  GetLayersGradientId,
  GETLAYERS_GRADIENTS,
} from "../../exterior3d/layers/GetLayersGradientShader";
import {
  GetLayers3DSceneManager,
  GetLayers3DSceneId,
  GETLAYERS_SCENE_PRESETS,
} from "../../exterior3d/layers/GetLayers3DScenePresets";
import {
  GetLayersStudioPanel,
  LayerItem,
} from "../../exterior3d/layers/GetLayersStudioPanel";
import {
  Box,
  Layers,
  RotateCcw,
  Eye,
  Sparkles,
  Palette,
  Loader2,
  CheckCircle2,
  Camera,
  Sun,
  Sliders,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Info,
  Disc,
} from "lucide-react";

export const PAINT_PALETTE = [
  { name: "Apex Pearl Blue", hex: 0x0044cc, displayHex: "#0044cc" },
  { name: "Rosso Corsa Red", hex: 0xdc2626, displayHex: "#dc2626" },
  { name: "Obsidian Black", hex: 0x111827, displayHex: "#111827" },
  { name: "Liquid Silver", hex: 0xe2e8f0, displayHex: "#e2e8f0" },
  { name: "British Racing Green", hex: 0x059669, displayHex: "#059669" },
  { name: "Solar Flare Gold", hex: 0xeab308, displayHex: "#eab308" },
  { name: "Platinum White", hex: 0xf8fafc, displayHex: "#f8fafc" },
  { name: "Carbon Matte Stealth", hex: 0x1e293b, displayHex: "#1e293b" },
];

export const CALIPER_PALETTE = [
  { name: "Brembo Red", hex: "#dc2626" },
  { name: "Acid Green", hex: "#84cc16" },
  { name: "Gold Anodized", hex: "#eab308" },
  { name: "Speed Yellow", hex: "#facc15" },
  { name: "Gloss Black", hex: "#080c14" },
];

export type StudioLightingMode = "SOFTBOX_MAIN" | "CYBER_NEON" | "PROVING_GROUND_SUN";
export type CameraPresetView = "HERO_THREE_QUARTER" | "SIDE_PROFILE" | "COCKPIT_DRIVER" | "ENGINE_BAY" | "REAR_DIFFUSER";

const EngineAndCar3DGraphicsViewportComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"VEHICLE" | "ENGINE">("VEHICLE");
  const [selectedEngineLayout, setSelectedEngineLayout] = useState<EngineLayout3D>("V_BANK_8");
  const [selectedCarStyle, setSelectedCarStyle] = useState<VehicleBodyStyle3D>("SUPERCAR_MID_ENGINE");
  const [selectedPaintHex, setSelectedPaintHex] = useState<number>(0x0044cc);
  const [selectedCaliperHex, setSelectedCaliperHex] = useState<string>("#dc2626");
  const [isWireframe, setIsWireframe] = useState(false);
  const [isXRay, setIsXRay] = useState(false);
  const [isSmoothNormals, setIsSmoothNormals] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [lightingMode, setLightingMode] = useState<StudioLightingMode>("SOFTBOX_MAIN");
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPresetView>("HERO_THREE_QUARTER");

  const [isLoading, setIsLoading] = useState(false);
  const [loadedAssetName, setLoadedAssetName] = useState("BMW i8 Hybrid Supercar GLB");
  const [isGlbSource, setIsGlbSource] = useState(true);
  const [polyCount, setPolyCount] = useState(0);
  const [vertCount, setVertCount] = useState(0);
  const [subMeshList, setSubMeshList] = useState<string[]>([]);
  const [showMeshTree, setShowMeshTree] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const filterId = React.useId().replace(/:/g, "-");
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentModelGroup = useRef<THREE.Group | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Multi-Mode Visualization Studio Managers & State
  const cutawayManagerRef = useRef<CutawayClippingManager>(new CutawayClippingManager());
  const flowSystemRef = useRef<FlowVisualizationSystem>(new FlowVisualizationSystem());

  const [multiModeState, setMultiModeState] = useState<MultiModeState>({
    is360: true,
    isExploded: false,
    isAnatomy: false,
    isCutaway: false,
    isXRay: false,
    activeSubsystemId: "engine",
    explodedProgress: 0,
    isAutoPlayingExplosion: false,
    cutawayConfig: {
      enabled: false,
      axis: "X",
      depth: 0,
      invert: false,
      showInternalComponents: true,
    },
    flowConfig: {
      coolant: true,
      oil: true,
      air: true,
      fuel: true,
      exhaust: true,
      power: true,
    },
    selectedPart: SUBSYSTEM_CAPABILITIES.engine.anatomy.parts[0] || null,
    isolatedPartName: null,
    autoSpin: false,
    autoSpinSpeed: 1,
  });

  const multiModeStateRef = useRef(multiModeState);
  useEffect(() => {
    multiModeStateRef.current = multiModeState;
  }, [multiModeState]);

  // GetLayers.ai State
  const [activeGradient, setActiveGradient] = useState<GetLayersGradientId>("strigil");
  const [activeScenePreset, setActiveScenePreset] = useState<GetLayers3DSceneId>("argent_massif");
  const [bloomStrength, setBloomStrength] = useState<number>(0.3);
  const [fogDensity, setFogDensity] = useState<number>(0.035);
  const [exposure, setExposure] = useState<number>(1.35);

  const gradientShaderRef = useRef<GetLayersGradientShader | null>(null);
  const getLayersSceneRef = useRef<GetLayers3DSceneManager | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

  const [layersState, setLayersState] = useState<LayerItem[]>([
    { id: "body", name: "Stamped Body & Haunches", category: "Bodywork", visible: true, meshCount: 18 },
    { id: "aero", name: "Aerodynamics & Splitters", category: "Aero", visible: true, meshCount: 14 },
    { id: "powertrain", name: "Twin-Turbo V8 & Bay", category: "Engine", visible: true, meshCount: 38 },
    { id: "drivetrain", name: "Transaxle & Differential", category: "Drivetrain", visible: true, meshCount: 12 },
    { id: "suspension", name: "Pushrod Suspension & Brakes", category: "Chassis", visible: true, meshCount: 22 },
    { id: "wheels", name: "Forged Wheels & Tires", category: "Wheels", visible: true, meshCount: 8 },
    { id: "cockpit", name: "Cockpit & Racing Glass", category: "Interior", visible: true, meshCount: 16 },
    { id: "internals", name: "Internal Cutaway CAD Parts", category: "Cutaway", visible: true, meshCount: 40 },
  ]);

  useEffect(() => {
    if (bloomPassRef.current) {
      bloomPassRef.current.strength = bloomStrength;
    }
  }, [bloomStrength]);

  useEffect(() => {
    if (sceneRef.current && sceneRef.current.fog instanceof THREE.FogExp2) {
      sceneRef.current.fog.density = fogDensity;
    }
  }, [fogDensity]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = exposure;
    }
  }, [exposure]);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. SCENE SETUP
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0d12);
    scene.fog = new THREE.FogExp2(0x0c0d12, 0.04);
    sceneRef.current = scene;

    // 2. CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.2, 1.8, 3.8);
    cameraRef.current = camera;

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.localClippingEnabled = true;
    cutawayManagerRef.current.attachRenderer(renderer);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Attach Flow particle system & Cutaway internals to scene
    scene.add(flowSystemRef.current.getGroup());
    const cutawayInternals = cutawayManagerRef.current.buildInternalCutawayGroup();
    scene.add(cutawayInternals);

    // Post-Processing Pipeline
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Screen-Space Ambient Occlusion
    const saoPass = new SAOPass(scene, camera, new THREE.Vector2(512, 512));
    saoPass.params.saoIntensity = 0.035;
    saoPass.params.saoScale = 1.25;
    saoPass.params.saoKernelRadius = 60;
    saoPass.params.saoBlur = true;
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), bloomStrength, 0.6, 0.85);
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;

    // GetLayers.ai Background Gradient & 3D Scene Systems
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const gradientShader = new GetLayersGradientShader();
    bgScene.add(gradientShader.getMesh());
    gradientShaderRef.current = gradientShader;

    const getLayersScene = new GetLayers3DSceneManager();
    scene.add(getLayersScene.getGroup());
    getLayersSceneRef.current = getLayersScene;

    const handleMouseMove = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mousePosRef.current = { x, y };
    };
    mountRef.current.addEventListener("mousemove", handleMouseMove);
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.uniforms["resolution"].value.set(1 / width, 1 / height);
    composer.addPass(fxaaPass);
    const vignetteShader = {
      uniforms: { tDiffuse: { value: null }, offset: { value: 1.0 }, darkness: { value: 1.2 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "uniform sampler2D tDiffuse; uniform float offset; uniform float darkness; varying vec2 vUv; void main(){ vec4 t=texture2D(tDiffuse,vUv); vec2 u=(vUv-vec2(0.5))*vec2(offset); t.rgb*=1.0-dot(u,u)*darkness; gl_FragColor=t; }"
    };
    composer.addPass(new ShaderPass(vignetteShader));
    composer.addPass(new OutputPass());

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controlsRef.current = controls;

    // 5. STUDIO LIGHTING ENVIRONMENT
    const ambientLight = new THREE.AmbientLight(0x2a1f10, 1.8);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0x8b7355, 1.4);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Rim Light
    const rimLight = new THREE.DirectionalLight(0xffa833, 1.8);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Ground Plane with Shadow Receiver & Grid
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.01;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const gridHelper = new THREE.GridHelper(20, 40, 0xd97706, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Studio radiance environment map for PBR reflections
    scene.environment = StudioEnvironmentGenerator.createStudioRadianceMap(renderer);

    // Contact shadow
    const shadowPlane = StudioEnvironmentGenerator.createContactShadowPlane(2.6, 5.2, 0.75);
    scene.add(shadowPlane);

    // 6. ANIMATION LOOP WITH TAB VISIBILITY SUSPENSION
    let animationFrameId: number;
    let orbitTime = 0;
    const clock = new THREE.Clock();
    let explosionDirection = 1;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden) return;

      const delta = clock.getDelta();

      // Animate flow streamlines
      flowSystemRef.current.update(delta);

      // Handle auto-playing sequential assembly/disassembly
      if (multiModeStateRef.current.isAutoPlayingExplosion) {
        setMultiModeState((prev) => {
          let nextP = prev.explodedProgress + delta * 0.35 * explosionDirection;
          if (nextP >= 1.0) {
            nextP = 1.0;
            explosionDirection = -1;
          } else if (nextP <= 0.0) {
            nextP = 0.0;
            explosionDirection = 1;
          }
          return { ...prev, explodedProgress: nextP };
        });
      }

      // Handle 360 inspection auto-spin or standard orbit
      if (multiModeStateRef.current.autoSpin && currentModelGroup.current) {
        currentModelGroup.current.rotation.y += delta * 0.6 * multiModeStateRef.current.autoSpinSpeed;
      } else if (autoRotateRef.current) {
        orbitTime += 0.004;
        const radius = 4.2;
        camera.position.x = Math.sin(orbitTime) * radius;
        camera.position.z = Math.cos(orbitTime) * radius;
        camera.position.y = 1.6 + Math.sin(orbitTime * 0.5) * 0.3;
        camera.lookAt(0, 0.3, 0);
        if (controlsRef.current) controlsRef.current.target.set(0, 0.3, 0);
      }
      if (controlsRef.current) controlsRef.current.update();

      // Render GetLayers.ai WebGL Fluid Gradient Backdrop
      if (gradientShaderRef.current) {
        gradientShaderRef.current.update(delta, mousePosRef.current.x, mousePosRef.current.y);
        renderer.autoClear = false;
        renderer.clear();
        renderer.render(bgScene, bgCamera);
      }
      if (getLayersSceneRef.current) {
        getLayersSceneRef.current.update(delta);
      }

      composer.render();
    };
    animate();

    const handleVisibilityChange = () => {
      if (!document.hidden && composer) {
        composer.render();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      composer.setSize(w, h);
      fxaaPass.uniforms["resolution"].value.set(1 / w, 1 / h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) mountRef.current.removeEventListener("mousemove", handleMouseMove);
      gradientShaderRef.current?.dispose();
      getLayersSceneRef.current?.dispose();
      disposeThreeScene(scene, renderer, composer);
    };
  }, []);

  // Update Lighting Setup when mode changes
  useEffect(() => {
    if (!sceneRef.current || !keyLightRef.current || !fillLightRef.current || !rimLightRef.current) return;

    if (lightingMode === "SOFTBOX_MAIN") {
      sceneRef.current.background = new THREE.Color(0x0c0d12);
      sceneRef.current.fog = new THREE.FogExp2(0x0c0d12, 0.04);
      keyLightRef.current.color.setHex(0xfff5e6);
      keyLightRef.current.intensity = 3.2;
      fillLightRef.current.color.setHex(0x8b7355);
      fillLightRef.current.intensity = 1.4;
      rimLightRef.current.color.setHex(0xffa833);
      rimLightRef.current.intensity = 1.8;
    } else if (lightingMode === "CYBER_NEON") {
      sceneRef.current.background = new THREE.Color(0x050814);
      sceneRef.current.fog = new THREE.FogExp2(0x050814, 0.05);
      keyLightRef.current.color.setHex(0x00f0ff);
      keyLightRef.current.intensity = 4.0;
      fillLightRef.current.color.setHex(0xff0055);
      fillLightRef.current.intensity = 2.8;
      rimLightRef.current.color.setHex(0x7000ff);
      rimLightRef.current.intensity = 3.5;
    } else if (lightingMode === "PROVING_GROUND_SUN") {
      sceneRef.current.background = new THREE.Color(0x1e293b);
      sceneRef.current.fog = new THREE.FogExp2(0x1e293b, 0.02);
      keyLightRef.current.color.setHex(0xfffbeb);
      keyLightRef.current.intensity = 5.0;
      fillLightRef.current.color.setHex(0x94a3b8);
      fillLightRef.current.intensity = 2.0;
      rimLightRef.current.color.setHex(0xfef08a);
      rimLightRef.current.intensity = 2.2;
    }
  }, [lightingMode]);

  // Handle Camera Presets
  const applyCameraPreset = (preset: CameraPresetView) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setAutoRotate(false);
    setActiveCameraPreset(preset);

    switch (preset) {
      case "HERO_THREE_QUARTER":
        cameraRef.current.position.set(3.2, 1.8, 3.8);
        controlsRef.current.target.set(0, 0.3, 0);
        break;
      case "SIDE_PROFILE":
        cameraRef.current.position.set(0, 1.2, 5.2);
        controlsRef.current.target.set(0, 0.3, 0);
        break;
      case "COCKPIT_DRIVER":
        cameraRef.current.position.set(-0.35, 0.95, 0.15);
        controlsRef.current.target.set(0.40, 0.85, 0);
        break;
      case "ENGINE_BAY":
        cameraRef.current.position.set(0.20, 1.8, 0.0);
        controlsRef.current.target.set(0.10, 0.40, 0);
        break;
      case "REAR_DIFFUSER":
        cameraRef.current.position.set(-3.5, 0.8, -1.8);
        controlsRef.current.target.set(-1.2, 0.3, 0);
        break;
    }
    controlsRef.current.update();
  };

  // Update Model Geometry Mesh when Layout, Paint, Caliper, or View Mode changes
  useEffect(() => {
    let active = true;
    if (!sceneRef.current) return;

    if (currentModelGroup.current) {
      sceneRef.current.remove(currentModelGroup.current);
      disposeThreeScene(currentModelGroup.current);
      currentModelGroup.current = null;
    }

    setIsLoading(true);

    const loadModel = async () => {
      let modelGroup: THREE.Group;
      let tri = 0;
      let vert = 0;
      let assetLabel = "";
      let fromGlb = true;
      let subNames: string[] = [];

      if (viewMode === "ENGINE") {
        modelGroup = Engine3DGeometryGenerator.buildEngine3DGroup(selectedEngineLayout);
        assetLabel = `${selectedEngineLayout} Racing Engine`;
        fromGlb = true;

        modelGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            subNames.push(child.name || `EngineMesh_${child.id}`);
            if (child.geometry) {
              const pos = child.geometry.getAttribute("position");
              if (pos) vert += pos.count;
              if (child.geometry.index) {
                tri += child.geometry.index.count / 3;
              } else if (pos) {
                tri += pos.count / 3;
              }
            }
          }
        });
      } else {
        const options: CarGlbOptions = {
          paintColorHex: selectedPaintHex,
          caliperColorHex: selectedCaliperHex,
          isXRay,
          explodedProgress: explodedAmount,
        };
        const result = await Car3DGeometryGenerator.buildCar3DGroupAsync(selectedCarStyle, options);
        modelGroup = result.group;
        tri = result.triangles;
        vert = result.vertices;
        assetLabel = result.assetName;
        fromGlb = result.loadedFromGlb;
        subNames = result.subMeshNames;
      }

      if (!active) return;

      // Apply smooth vertex normals and wireframe toggles across all GLB sub-mesh nodes
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (isSmoothNormals && child.geometry) {
            try {
              child.geometry.computeVertexNormals();
            } catch {
              // Ignore non-standard geometry buffers
            }
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => (m.wireframe = isWireframe));
            } else {
              child.material.wireframe = isWireframe;
            }
          }
        }
      });

      if (sceneRef.current) {
        sceneRef.current.add(modelGroup);
        currentModelGroup.current = modelGroup;
      }

      // Automatically frame camera around loaded model geometry
      if (cameraRef.current && controlsRef.current) {
        const bbox = new THREE.Box3().setFromObject(modelGroup);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        bbox.getCenter(center);
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z, 0.4);
        const radius = maxDim * 1.5;
        controlsRef.current.target.set(center.x, center.y, center.z);
        cameraRef.current.position.set(center.x + radius * 0.75, center.y + radius * 0.45, center.z + radius * 0.85);
        cameraRef.current.lookAt(center);
        controlsRef.current.update();
      }

      setPolyCount(Math.round(tri));
      setVertCount(Math.round(vert));
      setLoadedAssetName(assetLabel);
      setIsGlbSource(fromGlb);
      setSubMeshList(subNames);
      setIsLoading(false);
    };

    loadModel();

    return () => {
      active = false;
    };
  }, [viewMode, selectedEngineLayout, selectedCarStyle, selectedPaintHex, selectedCaliperHex, isWireframe, isXRay, isSmoothNormals, explodedAmount, multiModeState.explodedProgress]);

  // Reactive updates for Cutaway Clipping & Internal components
  useEffect(() => {
    if (!currentModelGroup.current) return;
    cutawayManagerRef.current.updateConfig(
      {
        ...multiModeState.cutawayConfig,
        enabled: multiModeState.isCutaway,
      },
      currentModelGroup.current
    );
  }, [multiModeState.isCutaway, multiModeState.cutawayConfig]);

  // Reactive updates for Anatomy Flow Streamlines
  useEffect(() => {
    flowSystemRef.current.setEnabled(multiModeState.isAnatomy);
    flowSystemRef.current.setFlowConfig(multiModeState.flowConfig);
  }, [multiModeState.isAnatomy, multiModeState.flowConfig]);

  useEffect(() => {
    const sub = SUBSYSTEM_CAPABILITIES[multiModeState.activeSubsystemId] || SUBSYSTEM_CAPABILITIES.engine;
    flowSystemRef.current.buildFlowPaths(sub.anatomy.flows);
  }, [multiModeState.activeSubsystemId]);

  // Handle Raycaster Click-to-Isolate
  const handleViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !currentModelGroup.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const hits = raycaster.intersectObjects(currentModelGroup.current.children, true);

    if (hits.length > 0) {
      const hitObj = hits[0].object as THREE.Mesh;
      const hitName = hitObj.name || "";
      const sub = SUBSYSTEM_CAPABILITIES[multiModeState.activeSubsystemId] || SUBSYSTEM_CAPABILITIES.engine;
      const matchedPart =
        sub.anatomy.parts.find((p) => hitName.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])) ||
        sub.anatomy.parts[0];

      setMultiModeState((prev) => ({
        ...prev,
        selectedPart: matchedPart || null,
        isolatedPartName: prev.isolatedPartName === hitName ? null : hitName,
      }));
    }
  };

  // Handle HUD Camera Preset
  const handleHUDCameraPreset = (presetName: string) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const sub = SUBSYSTEM_CAPABILITIES[multiModeState.activeSubsystemId] || SUBSYSTEM_CAPABILITIES.engine;
    const preset = sub.cameraPresets.find((p) => p.name === presetName) || sub.cameraPresets[0];
    if (preset) {
      setAutoRotate(false);
      cameraRef.current.position.set(preset.pos[0], preset.pos[1], preset.pos[2]);
      controlsRef.current.target.set(preset.target[0], preset.target[1], preset.target[2]);
      cameraRef.current.fov = preset.fov;
      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.update();
    }
  };

  // Reset All Modes
  const handleResetAllModes = () => {
    setMultiModeState({
      is360: true,
      isExploded: false,
      isAnatomy: false,
      isCutaway: false,
      isXRay: false,
      activeSubsystemId: "engine",
      explodedProgress: 0,
      isAutoPlayingExplosion: false,
      cutawayConfig: {
        enabled: false,
        axis: "X",
        depth: 0,
        invert: false,
        showInternalComponents: true,
      },
      flowConfig: {
        coolant: true,
        oil: true,
        air: true,
        fuel: true,
        exhaust: true,
        power: true,
      },
      selectedPart: SUBSYSTEM_CAPABILITIES.engine.anatomy.parts[0] || null,
      isolatedPartName: null,
      autoSpin: false,
      autoSpinSpeed: 1,
    });
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(3.2, 1.8, 3.8);
      controlsRef.current.target.set(0, 0.3, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-[750px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handleViewportPointerDown}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Multi-Mode Visualization Studio HUD */}
      <MultiModeVisualizationHUD
        state={multiModeState}
        onUpdateState={(updates) => setMultiModeState((prev) => ({ ...prev, ...updates }))}
        onCameraPreset={handleHUDCameraPreset}
        onResetAll={handleResetAllModes}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30 pointer-events-none">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <div className="text-white text-sm font-semibold tracking-wider font-mono">LOADING PHOTOREALISTIC 3D GLB CAR MESH...</div>
          <div className="text-xs text-amber-400 font-mono">PBR Clearcoat Shaders • Caliper Finishes • Micro-Details</div>
        </div>
      )}

      {/* Top Vision Glass Toolbar */}
      <GlassFilter id={filterId} scale={20} />
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* Left: View Mode Switcher & Asset Selector */}
        <div
          className="flex items-center space-x-3 pointer-events-auto p-2 rounded-2xl border"
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: `url(#${filterId}) blur(28px) saturate(180%)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(28px) saturate(180%)`,
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.40), inset 1px 1px 1px -0.5px rgba(255,255,255,0.4), inset -1px -1px 1px -0.5px rgba(0,0,0,0.5)"
          }}
        >
          <button
            onClick={() => setViewMode("VEHICLE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 ${
              viewMode === "VEHICLE"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3D CAR GLB MODEL</span>
          </button>
          <button
            onClick={() => setViewMode("ENGINE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 ${
              viewMode === "ENGINE"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Box className="w-4 h-4" />
            <span>3D ENGINE ASSEMBLY</span>
          </button>

          {/* Sub-selector */}
          {viewMode === "VEHICLE" ? (
            <select
              value={selectedCarStyle}
              onChange={(e) => setSelectedCarStyle(e.target.value as VehicleBodyStyle3D)}
              className="bg-slate-950/80 text-amber-300 text-xs rounded-xl px-2.5 py-1.5 border border-white/10 font-mono outline-none focus:border-amber-500 max-w-[280px]"
            >
              <optgroup label="── Complete Vehicles ──">
                {Car3DGlbAssetRegistry.getAssetsByCategory("SUPERCAR").map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
                {Car3DGlbAssetRegistry.getAssetsByCategory("RALLY").map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
                {Car3DGlbAssetRegistry.getAssetsByCategory("RESTOMOD").map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>

              <optgroup label="── Chassis & Platforms ──">
                {Car3DGlbAssetRegistry.getAssetsByCategory("CHASSIS").map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>

              <optgroup label="── Active Aero & Rear Assembly ──">
                {Car3DGlbAssetRegistry.getAssetsByCategory("AERO").map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>

              <optgroup label="── Closures & Hood Panels ──">
                {Car3DGlbAssetRegistry.getAssetsByCategory("CLOSURES").map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>

              <optgroup label="── Cockpit Interior Studio ──">
                {Car3DGlbAssetRegistry.getAssetsByCategory("INTERIOR").map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>

              <optgroup label="── Powertrain Engines ──">
                {Car3DGlbAssetRegistry.getAssetsByCategory("ENGINE").map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>

              <optgroup label="── Procedural Studio CAD ──">
                <option value="EXECUTIVE_SEDAN">Executive Sport Sedan (Studio CAD)</option>
                <option value="HYPERCAR_MONOCOQUE">Carbon Monocoque Hypercar (Studio CAD)</option>
              </optgroup>
            </select>
          ) : (
            <select
              value={selectedEngineLayout}
              onChange={(e) => setSelectedEngineLayout(e.target.value as EngineLayout3D)}
              className="bg-slate-950/80 text-amber-300 text-xs rounded-xl px-2.5 py-1.5 border border-white/10 font-mono outline-none focus:border-amber-500"
            >
              <option value="INLINE_3">Inline-3 (I3 Turbo - 3 Cylinders)</option>
              <option value="INLINE_4">Inline-4 (I4 Turbo - 4 Cylinders)</option>
              <option value="INLINE_6">Inline-6 (I6 Twin-Turbo - 6 Cylinders)</option>
              <option value="V_BANK_6">V6 (60° Twin-Turbo - 6 Cylinders)</option>
              <option value="V_BANK_8">V8 (90° Crossplane - 8 Cylinders)</option>
              <option value="V_BANK_10">V10 (72° Exotic - 10 Cylinders)</option>
              <option value="V_BANK_12">V12 (60° Hypercar - 12 Cylinders)</option>
              <option value="BOXER_4">Boxer-4 (Flat-4 - 4 Cylinders)</option>
              <option value="BOXER_6">Boxer-6 (Flat-6 GT3 - 6 Cylinders)</option>
              <option value="W_BANK_12">W12 (Twin-VR6 - 12 Cylinders)</option>
              <option value="W_BANK_16">W16 (Quad-Turbo Hypercar - 16 Cylinders)</option>
              <option value="ROTARY_WANKEL">Rotary Wankel (13B Twin-Rotor - 2 Rotors)</option>
              <option value="RADIAL_9">Radial-9 (Star Pattern - 9 Cylinders)</option>
            </select>
          )}
        </div>

        {/* Right: Inspection Toggles & Part Tree Drawer Button */}
        <div
          className="flex items-center space-x-2 pointer-events-auto p-2 rounded-2xl border"
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: `url(#${filterId}) blur(28px) saturate(180%)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(28px) saturate(180%)`,
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.40), inset 1px 1px 1px -0.5px rgba(255,255,255,0.4), inset -1px -1px 1px -0.5px rgba(0,0,0,0.5)"
          }}
        >
          <button
            onClick={() => setIsSmoothNormals(!isSmoothNormals)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95 ${
              isSmoothNormals ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-white"
            }`}
            title="Toggle Smooth G2 Vertex Normal Shading"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>SMOOTH G2</span>
          </button>

          <button
            onClick={() => setIsXRay(!isXRay)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95 ${
              isXRay ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-white"
            }`}
            title="Toggle X-Ray Structural Inspection"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>X-RAY</span>
          </button>

          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`p-2 rounded-xl text-xs transition-all active:scale-95 ${
              isWireframe ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-white"
            }`}
            title="Toggle Wireframe Mesh Topology"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-xl text-xs transition-all active:scale-95 ${
              autoRotate ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-white"
            }`}
            title="Toggle Auto-Turntable Rotation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowMeshTree(!showMeshTree)}
            className={`p-2 rounded-xl text-xs transition-all active:scale-95 ${
              showMeshTree ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-400 hover:text-white"
            }`}
            title="Toggle GLB Part Tree Drawer"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GetLayers.ai Studio & Layer Inspector HUD */}
      <GetLayersStudioPanel
        activeGradient={activeGradient}
        onSelectGradient={(id) => {
          setActiveGradient(id);
          if (gradientShaderRef.current && sceneRef.current) {
            gradientShaderRef.current.setGradient(id, sceneRef.current);
          }
        }}
        activeScenePreset={activeScenePreset}
        onSelectScenePreset={(id) => {
          setActiveScenePreset(id);
          if (getLayersSceneRef.current && sceneRef.current) {
            getLayersSceneRef.current.applyScenePreset(id, sceneRef.current);
            const preset = GETLAYERS_SCENE_PRESETS[id];
            if (preset) {
              setBloomStrength(preset.bloomStrength);
              setFogDensity(preset.fogDensity);
            }
          }
        }}
        layers={layersState}
        onToggleLayer={(layerId) => {
          setLayersState((prev) =>
            prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
          );
          if (!currentModelGroup.current) return;
          const target = layersState.find((l) => l.id === layerId);
          const nextVis = target ? !target.visible : false;
          currentModelGroup.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const name = child.name.toLowerCase();
              let m = false;
              if (layerId === "body" && (name.includes("hood") || name.includes("door") || name.includes("fender") || name.includes("roof") || name.includes("bumper") || name.includes("fascia") || name.includes("stamped") || name.includes("fuselage") || name.includes("shell") || name.includes("cowl"))) m = true;
              if (layerId === "aero" && (name.includes("wing") || name.includes("splitter") || name.includes("diffuser") || name.includes("canard") || name.includes("louver") || name.includes("aero") || name.includes("strake") || name.includes("vane"))) m = true;
              if (layerId === "powertrain" && (name.includes("engine") || name.includes("turbo") || name.includes("exhaust") || name.includes("header") || name.includes("cooler") || name.includes("intake") || name.includes("manifold") || name.includes("inconel") || name.includes("cylinder"))) m = true;
              if (layerId === "drivetrain" && (name.includes("transaxle") || name.includes("differential") || name.includes("gear") || name.includes("drivetrain") || name.includes("clutch") || name.includes("flywheel"))) m = true;
              if (layerId === "suspension" && (name.includes("suspension") || name.includes("brake") || name.includes("caliper") || name.includes("pushrod") || name.includes("damper") || name.includes("rotor") || name.includes("a-arm") || name.includes("spring"))) m = true;
              if (layerId === "wheels" && (name.includes("wheel") || name.includes("tire") || name.includes("rim") || name.includes("hub") || name.includes("lug") || name.includes("centerlock"))) m = true;
              if (layerId === "cockpit" && (name.includes("cockpit") || name.includes("cabin") || name.includes("seat") || name.includes("dash") || name.includes("canopy") || name.includes("glass") || name.includes("windshield") || name.includes("window") || name.includes("yoke") || name.includes("steering"))) m = true;
              if (layerId === "internals" && (name.includes("cutaway") || name.includes("internal") || name.includes("piston") || name.includes("crank") || name.includes("valve"))) m = true;
              if (m) child.visible = nextVis;
            }
          });
        }}
        onSoloLayer={(layerId) => {
          setLayersState((prev) =>
            prev.map((l) => ({ ...l, visible: l.id === layerId }))
          );
          if (!currentModelGroup.current) return;
          currentModelGroup.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const name = child.name.toLowerCase();
              let m = false;
              if (layerId === "body" && (name.includes("hood") || name.includes("door") || name.includes("fender") || name.includes("roof") || name.includes("bumper") || name.includes("fascia") || name.includes("stamped") || name.includes("fuselage") || name.includes("shell") || name.includes("cowl"))) m = true;
              if (layerId === "aero" && (name.includes("wing") || name.includes("splitter") || name.includes("diffuser") || name.includes("canard") || name.includes("louver") || name.includes("aero") || name.includes("strake") || name.includes("vane"))) m = true;
              if (layerId === "powertrain" && (name.includes("engine") || name.includes("turbo") || name.includes("exhaust") || name.includes("header") || name.includes("cooler") || name.includes("intake") || name.includes("manifold") || name.includes("inconel") || name.includes("cylinder"))) m = true;
              if (layerId === "drivetrain" && (name.includes("transaxle") || name.includes("differential") || name.includes("gear") || name.includes("drivetrain") || name.includes("clutch") || name.includes("flywheel"))) m = true;
              if (layerId === "suspension" && (name.includes("suspension") || name.includes("brake") || name.includes("caliper") || name.includes("pushrod") || name.includes("damper") || name.includes("rotor") || name.includes("a-arm") || name.includes("spring"))) m = true;
              if (layerId === "wheels" && (name.includes("wheel") || name.includes("tire") || name.includes("rim") || name.includes("hub") || name.includes("lug") || name.includes("centerlock"))) m = true;
              if (layerId === "cockpit" && (name.includes("cockpit") || name.includes("cabin") || name.includes("seat") || name.includes("dash") || name.includes("canopy") || name.includes("glass") || name.includes("windshield") || name.includes("window") || name.includes("yoke") || name.includes("steering"))) m = true;
              if (layerId === "internals" && (name.includes("cutaway") || name.includes("internal") || name.includes("piston") || name.includes("crank") || name.includes("valve"))) m = true;
              child.visible = m;
            }
          });
        }}
        bloomStrength={bloomStrength}
        onChangeBloom={setBloomStrength}
        fogDensity={fogDensity}
        onChangeFog={setFogDensity}
        exposure={exposure}
        onChangeExposure={setExposure}
        currentColorName={PAINT_PALETTE.find((p) => p.hex === selectedPaintHex)?.name || "Apex Pearl Blue"}
        currentWheelFinish="Satin Bronze"
        activeModes={[
          multiModeState.is360 ? "/360" : "",
          multiModeState.isExploded ? "/exploded" : "",
          multiModeState.isAnatomy ? "/anatomy" : "",
          multiModeState.isCutaway ? "/cutaway" : "",
          multiModeState.isXRay ? "/xray" : "",
        ].filter(Boolean)}
      />

      {/* Left Vertical Camera & Studio Lighting Bar */}
      <div className="absolute top-28 left-4 flex flex-col space-y-2 pointer-events-auto z-10">
        {/* Camera Presets */}
        <div
          className="p-2 rounded-2xl border flex flex-col space-y-1"
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: `url(#${filterId}) blur(24px) saturate(180%)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(24px) saturate(180%)`,
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.40), inset 1px 1px 1px -0.5px rgba(255,255,255,0.4)"
          }}
        >
          <div className="text-[10px] text-slate-400 font-mono font-semibold px-2 py-0.5 border-b border-white/10">CAMERA</div>
          <button
            onClick={() => applyCameraPreset("HERO_THREE_QUARTER")}
            className={`px-2.5 py-1 text-left rounded-xl text-[11px] font-mono transition-all active:scale-95 ${
              activeCameraPreset === "HERO_THREE_QUARTER" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            3/4 Hero
          </button>
          <button
            onClick={() => applyCameraPreset("SIDE_PROFILE")}
            className={`px-2.5 py-1 text-left rounded-xl text-[11px] font-mono transition-all active:scale-95 ${
              activeCameraPreset === "SIDE_PROFILE" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Side Aero
          </button>
          <button
            onClick={() => applyCameraPreset("COCKPIT_DRIVER")}
            className={`px-2.5 py-1 text-left rounded-xl text-[11px] font-mono transition-all active:scale-95 ${
              activeCameraPreset === "COCKPIT_DRIVER" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Cockpit
          </button>
          <button
            onClick={() => applyCameraPreset("ENGINE_BAY")}
            className={`px-2.5 py-1 text-left rounded-xl text-[11px] font-mono transition-all active:scale-95 ${
              activeCameraPreset === "ENGINE_BAY" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Engine Bay
          </button>
          <button
            onClick={() => applyCameraPreset("REAR_DIFFUSER")}
            className={`px-2.5 py-1 text-left rounded-xl text-[11px] font-mono transition-all active:scale-95 ${
              activeCameraPreset === "REAR_DIFFUSER" ? "bg-amber-500 text-slate-950 font-bold shadow" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            Rear Exhaust
          </button>
        </div>

        {/* Lighting Setup */}
        <div
          className="p-2 rounded-2xl border flex flex-col space-y-1"
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: `url(#${filterId}) blur(24px) saturate(180%)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(24px) saturate(180%)`,
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.40), inset 1px 1px 1px -0.5px rgba(255,255,255,0.4)"
          }}
        >
          <div className="text-[10px] text-slate-400 font-mono font-semibold px-2 py-0.5 border-b border-white/10">LIGHTING</div>
          <button
            onClick={() => setLightingMode("SOFTBOX_MAIN")}
            className={`px-2.5 py-1 text-left rounded-xl text-[11px] font-mono flex items-center space-x-1.5 transition-all active:scale-95 ${
              lightingMode === "SOFTBOX_MAIN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>Softbox Studio</span>
          </button>
          <button
            onClick={() => setLightingMode("CYBER_NEON")}
            className={`px-2.5 py-1 text-left rounded-xl text-[11px] font-mono flex items-center space-x-1.5 transition-all active:scale-95 ${
              lightingMode === "CYBER_NEON" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Cyber Neon</span>
          </button>
          <button
            onClick={() => setLightingMode("PROVING_GROUND_SUN")}
            className={`px-2.5 py-1 text-left rounded-xl text-[11px] font-mono flex items-center space-x-1.5 transition-all active:scale-95 ${
              lightingMode === "PROVING_GROUND_SUN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-slate-300 hover:bg-white/5"
            }`}
          >
            <Sun className="w-3 h-3 text-yellow-400" />
            <span>Day Sun</span>
          </button>
        </div>
      </div>

      {/* Right Customization Floating Panel */}
      {viewMode === "VEHICLE" && (
        <div
          className="absolute top-20 right-4 w-64 p-3 rounded-2xl border shadow-2xl pointer-events-auto space-y-3 z-10"
          style={{
            background: "rgba(15, 23, 42, 0.70)",
            backdropFilter: `url(#${filterId}) blur(28px) saturate(190%)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(28px) saturate(190%)`,
            borderColor: "rgba(255, 255, 255, 0.14)",
            boxShadow:
              "0 20px 45px rgba(0,0,0,0.50), " +
              "inset 3px 3px 0.5px -3px rgba(255,255,255,0.7), " +
              "inset -3px -3px 0.5px -3px rgba(0,0,0,0.6), " +
              "inset 1px 1px 1px -0.5px rgba(255,255,255,0.5)"
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white tracking-wide flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>COLOR & TRIM STUDIO</span>
            </span>
          </div>

          {/* Car Body Metallic Paint */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-300 font-mono font-medium">METALLIC BODY PAINT</div>
            <div className="grid grid-cols-4 gap-1.5">
              {PAINT_PALETTE.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedPaintHex(color.hex)}
                  title={color.name}
                  style={{ backgroundColor: color.displayHex }}
                  className={`w-full h-6 rounded-lg border transition-all active:scale-95 ${
                    selectedPaintHex === color.hex ? "scale-110 border-white ring-2 ring-amber-500/60" : "border-slate-600 opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Brake Caliper Finish */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-300 font-mono font-medium flex items-center justify-between">
              <span>BREMBO CALIPER FINISH</span>
              <Disc className="w-3 h-3 text-red-400" />
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {CALIPER_PALETTE.map((cal) => (
                <button
                  key={cal.name}
                  onClick={() => setSelectedCaliperHex(cal.hex)}
                  title={cal.name}
                  style={{ backgroundColor: cal.hex }}
                  className={`w-full h-5 rounded-lg border transition-all active:scale-95 ${
                    selectedCaliperHex === cal.hex ? "scale-110 border-white ring-2 ring-red-500/60" : "border-slate-600 opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Exploded Disassembly Kinematics Slider */}
          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span>DISASSEMBLY KINEMATICS</span>
              <span className="text-amber-400 font-bold">{Math.round(explodedAmount * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedAmount}
              onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>
      )}

      {/* Part Tree Hierarchy Drawer */}
      {showMeshTree && (
        <div
          className="absolute top-20 right-72 w-64 h-[500px] p-3 rounded-2xl border shadow-2xl pointer-events-auto z-10 overflow-y-auto space-y-2"
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: `url(#${filterId}) blur(28px) saturate(190%)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(28px) saturate(190%)`,
            borderColor: "rgba(255, 255, 255, 0.14)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-white font-mono flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>GLB SUB-MESH TREE ({subMeshList.length})</span>
            </span>
            <button onClick={() => setShowMeshTree(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <div className="space-y-1">
            {subMeshList.map((mName, idx) => (
              <div key={idx} className="text-[11px] font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/60 flex items-center justify-between hover:border-amber-500/40">
                <span className="truncate max-w-[170px]">{mName}</span>
                <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 rounded">MESH</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Telemetry Overlay HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div
          className="px-4 py-2 rounded-2xl border text-amber-200 text-xs font-mono flex items-center space-x-4"
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: `url(#${filterId}) blur(24px) saturate(180%)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(24px) saturate(180%)`,
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35), inset 1px 1px 1px -0.5px rgba(255,255,255,0.3)"
          }}
        >
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white font-semibold">{loadedAssetName}</span>
            {isGlbSource && <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">GLB 2.0</span>}
          </div>
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PBR METALLIC CLEARCOAT 1.0</span>
          </div>
          <div>NODES: <strong className="text-amber-400">{subMeshList.length}</strong></div>
          <div>TRIANGLES: <strong className="text-emerald-400">{polyCount.toLocaleString()}</strong></div>
          <div>VERTICES: <strong className="text-amber-400">{vertCount.toLocaleString()}</strong></div>
        </div>

        <div
          className="px-3.5 py-2 rounded-2xl border text-slate-400 text-xs font-mono"
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: `url(#${filterId}) blur(24px) saturate(180%)`,
            WebkitBackdropFilter: `url(#${filterId}) blur(24px) saturate(180%)`,
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35), inset 1px 1px 1px -0.5px rgba(255,255,255,0.3)"
          }}
        >
          WEBGL 2.0 • 60 FPS • THREE.JS r160
        </div>
      </div>
    </div>
  );
};

export const EngineAndCar3DGraphicsViewport = memo(EngineAndCar3DGraphicsViewportComponent);


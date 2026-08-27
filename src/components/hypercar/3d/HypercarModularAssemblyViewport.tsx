// ============================================================================
// HYPERCAR 3D MODULAR ASSEMBLY VIEWPORT — WEBGL THREE.JS CANVAS
// ============================================================================
// Interactive 3D engineering viewport for assembling Le Mans Hypercar prototypes.
// Supports 3D raycasting, exploded view animations, X-Ray transparency,
// department isolation, and physical part snapping.
// ============================================================================

import React, { useEffect, useRef, useState, memo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useHypercarAssemblyStore } from "../../../sim/hypercar/state/hypercarAssemblyStore";
import { HYPERCAR_SOCKET_ANCHORS, type HypercarSocketId } from "../../../sim/hypercar/modular/hypercarSockets";
import { HypercarComponentRegistry } from "../../../sim/hypercar/modular/hypercarComponentRegistry";
import { disposeThreeScene } from "../../../exterior3d/utils/threeDisposal";
import { Layers, Eye, Maximize2, Sparkles, Sliders, Wind, Camera } from "lucide-react";

const HypercarModularAssemblyViewportComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshMapRef = useRef<Map<HypercarSocketId, THREE.Group>>(new Map());
  const hotspotsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const streamlinesRef = useRef<THREE.Points | null>(null);

  const [showAeroStreamlines, setShowAeroStreamlines] = useState(false);
  const showAeroStreamlinesRef = useRef(false);
  showAeroStreamlinesRef.current = showAeroStreamlines;

  const [cameraPreset, setCameraPresetState] = useState<"iso" | "mgu" | "cockpit" | "hybrid" | "rear">("iso");

  const {
    installedMap,
    selectedSocketId,
    selectSocket,
    systemIsolationMode,
    setSystemIsolationMode,
    xrayMode,
    toggleXrayMode,
    showAttachmentHotspots,
    toggleAttachmentHotspots,
    explodedViewAmount,
    setExplodedViewAmount,
    snappingSocketId,
    snapAnimationProgress,
  } = useHypercarAssemblyStore();

  // ── Three.js Initialization ──
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090d);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.5, 2.4, 5.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.target.set(0, 0.35, 1.6);
    controlsRef.current = controls;

    // Workshop Grid Floor
    const grid = new THREE.GridHelper(24, 48, 0xf59e0b, 0x1f2937);
    grid.position.y = -0.001;
    scene.add(grid);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(6, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.2);
    rimLight.position.set(-6, 5, -5);
    scene.add(rimLight);

    const cyanUnderglow = new THREE.DirectionalLight(0x06b6d4, 1.2);
    cyanUnderglow.position.set(0, -3, 0);
    scene.add(cyanUnderglow);

    const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.001;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // CFD Aerodynamic Streamline Particles
    const streamlineCount = 150;
    const streamlineGeo = new THREE.BufferGeometry();
    const streamlinePos = new Float32Array(streamlineCount * 3);
    for (let i = 0; i < streamlineCount; i++) {
      streamlinePos[i * 3 + 0] = (Math.random() - 0.5) * 2.0;
      streamlinePos[i * 3 + 1] = 0.05 + Math.random() * 0.9;
      streamlinePos[i * 3 + 2] = -2.8 + Math.random() * 6.5;
    }
    streamlineGeo.setAttribute("position", new THREE.BufferAttribute(streamlinePos, 3));
    const streamlineMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const streamlines = new THREE.Points(streamlineGeo, streamlineMat);
    streamlines.visible = false;
    scene.add(streamlines);
    streamlinesRef.current = streamlines;

    scene.add(hotspotsGroupRef.current);

    // Raycasting Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      for (const hit of intersects) {
        let current: THREE.Object3D | null = hit.object;
        while (current && current !== scene) {
          if (current.userData && current.userData.socketId) {
            selectSocket(current.userData.socketId as HypercarSocketId);
            return;
          }
          current = current.parent;
        }
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    // Animation Loop with Tab Visibility Suspension
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.hidden) return;

      controls.update();

      // Pulsing hotspot rings
      const time = Date.now() * 0.003;
      hotspotsGroupRef.current.children.forEach((child) => {
        const ring = child.children[0] as THREE.Mesh;
        if (ring) {
          const s = 1.0 + Math.sin(time) * 0.15;
          ring.scale.set(s, s, s);
        }
      });

      // Streamline Flow Animation
      if (streamlinesRef.current && showAeroStreamlinesRef.current) {
        streamlinesRef.current.visible = true;
        const posArr = streamlinesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < streamlineCount; i++) {
          posArr[i * 3 + 2] += 0.07; // Move rearward
          if (posArr[i * 3 + 2] > 4.2) {
            posArr[i * 3 + 2] = -2.8;
            posArr[i * 3 + 0] = (Math.random() - 0.5) * 2.0;
            posArr[i * 3 + 1] = 0.05 + Math.random() * 0.9;
          }
        }
        streamlinesRef.current.geometry.attributes.position.needsUpdate = true;
      } else if (streamlinesRef.current) {
        streamlinesRef.current.visible = false;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleVisibilityChange = () => {
      if (!document.hidden && renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth || 800;
      const h = mountRef.current.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Initial stabilization timers
    requestAnimationFrame(handleResize);
    const initTimer = setTimeout(handleResize, 60);

    return () => {
      clearTimeout(initTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleClick);
      cancelAnimationFrame(animId);
      disposeThreeScene(scene, renderer);
    };
  }, []);

  // ── Sync Meshes with Installed Map & Exploded View ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear existing component meshes
    meshMapRef.current.forEach((group) => scene.remove(group));
    meshMapRef.current.clear();
    hotspotsGroupRef.current.clear();

    const allSockets = Object.keys(HYPERCAR_SOCKET_ANCHORS) as HypercarSocketId[];

    allSockets.forEach((socketId) => {
      const anchor = HYPERCAR_SOCKET_ANCHORS[socketId];
      const componentId = installedMap[socketId];

      // Base translation (mm -> meters)
      const basePos = new THREE.Vector3(
        anchor.positionMm[0] / 1000,
        anchor.positionMm[1] / 1000,
        anchor.positionMm[2] / 1000
      );

      // Exploded view translation along normal
      const explodedOffset = new THREE.Vector3(
        anchor.normalVector[0],
        anchor.normalVector[1],
        anchor.normalVector[2]
      ).multiplyScalar(explodedViewAmount * 1.6);

      const finalPos = basePos.clone().add(explodedOffset);

      if (componentId) {
        const comp = HypercarComponentRegistry.getComponent(componentId);
        if (!comp) return;

        // Snapping animation offset
        if (snappingSocketId === socketId && snapAnimationProgress < 1.0) {
          finalPos.y += (1.0 - snapAnimationProgress) * 0.8;
        }

        const group = createHypercarModularMesh(socketId, comp.glbMeshName, xrayMode, selectedSocketId === socketId);
        group.position.copy(finalPos);
        group.userData = { socketId };

        // Isolation mode check
        let isVisible = true;
        if (systemIsolationMode !== "ALL") {
          if (systemIsolationMode === "BODYWORK" && anchor.category !== "BODYWORK") isVisible = false;
          if (systemIsolationMode === "AERO" && anchor.category !== "AERO") isVisible = false;
          if (systemIsolationMode === "HYBRID_POWERTRAIN" && anchor.category !== "HYBRID_POWERTRAIN") isVisible = false;
          if (systemIsolationMode === "COOLING" && anchor.category !== "COOLING" && anchor.category !== "BODYWORK") isVisible = false;
          if (systemIsolationMode === "CHASSIS" && anchor.category !== "CHASSIS") isVisible = false;
          if (systemIsolationMode === "SUSPENSION" && anchor.category !== "SUSPENSION") isVisible = false;
          if (systemIsolationMode === "WHEELS" && anchor.category !== "WHEELS") isVisible = false;
        }
        group.visible = isVisible;

        scene.add(group);
        meshMapRef.current.set(socketId, group);
      } else if (showAttachmentHotspots) {
        // Empty socket hotspot ring
        const hotspot = createHotspotRing(socketId, finalPos, selectedSocketId === socketId);
        hotspotsGroupRef.current.add(hotspot);
      }
    });
  }, [
    installedMap,
    selectedSocketId,
    systemIsolationMode,
    xrayMode,
    showAttachmentHotspots,
    explodedViewAmount,
    snappingSocketId,
    snapAnimationProgress,
  ]);

  const handleCameraPreset = (preset: "iso" | "mgu" | "cockpit" | "hybrid" | "rear") => {
    setCameraPresetState(preset);
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (preset === "iso") {
      cam.position.set(4.5, 2.4, 5.0);
      ctrl.target.set(0, 0.35, 1.6);
    } else if (preset === "mgu") {
      cam.position.set(0, 0.65, -2.4);
      ctrl.target.set(0, 0.35, -0.8);
    } else if (preset === "cockpit") {
      cam.position.set(0, 0.95, 0.6);
      ctrl.target.set(0, 0.6, -1.0);
    } else if (preset === "hybrid") {
      cam.position.set(1.8, 1.4, 2.0);
      ctrl.target.set(0, 0.4, 1.8);
    } else if (preset === "rear") {
      cam.position.set(0, 0.8, 4.8);
      ctrl.target.set(0, 0.45, 3.2);
    }
    ctrl.update();
  };

  return (
    <div className="relative w-full h-full bg-[#08090d] select-none overflow-hidden">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Viewport Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Hypercar CAD 3D Viewport
          </span>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-[11px] text-zinc-400">Click mesh or pulsing rings to snap components</span>
        </div>

        {/* Camera Presets Bar */}
        <div className="flex items-center gap-1 pointer-events-auto bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[10px] font-bold">
          <Camera className="w-3.5 h-3.5 text-zinc-400 mr-1" />
          {[
            { id: "iso", label: "ISO 3D" },
            { id: "mgu", label: "Front MGU" },
            { id: "cockpit", label: "Cockpit Tub" },
            { id: "hybrid", label: "Battery & ICE" },
            { id: "rear", label: "Rear Wing" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => handleCameraPreset(v.id as any)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                cameraPreset === v.id
                  ? "bg-amber-500/30 border border-amber-400/50 text-amber-300"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* System Isolation Modes */}
        <div className="flex items-center gap-1 pointer-events-auto bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[11px] font-bold">
          {(["ALL", "BODYWORK", "AERO", "HYBRID_POWERTRAIN", "COOLING", "SUSPENSION", "WHEELS"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSystemIsolationMode(mode)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                systemIsolationMode === mode
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Floating Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* Toggles */}
        <div className="flex items-center gap-2 pointer-events-auto bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
          <button
            onClick={toggleXrayMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              xrayMode ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            X-Ray Ghost
          </button>
          <button
            onClick={toggleAttachmentHotspots}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              showAttachmentHotspots
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Hotspot Rings
          </button>
          <button
            onClick={() => setShowAeroStreamlines(!showAeroStreamlines)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              showAeroStreamlines
                ? "bg-amber-400 text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            CFD Flow
          </button>
        </div>

        {/* Exploded View Slider */}
        <div className="flex items-center gap-3 pointer-events-auto bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-mono">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-zinc-300 font-bold">EXPLODED VIEW</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedViewAmount}
            onChange={(e) => setExplodedViewAmount(parseFloat(e.target.value))}
            className="w-28 accent-amber-400 cursor-pointer"
          />
          <span className="text-amber-400 font-bold w-9 text-right">{Math.round(explodedViewAmount * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export const HypercarModularAssemblyViewport = memo(HypercarModularAssemblyViewportComponent);


// ── Procedural Hypercar Mesh Generator ──
function createHypercarModularMesh(
  socketId: HypercarSocketId,
  meshName: string,
  xray: boolean,
  isSelected: boolean
): THREE.Group {
  const group = new THREE.Group();

  const carbonMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0xf59e0b : 0x11141a, // Gold selection
    roughness: 0.35,
    metalness: 0.85,
    transparent: xray,
    opacity: xray ? 0.35 : 1.0,
  });

  const cyanAeroMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0xf59e0b : 0x0284c7, // High-visibility livery
    roughness: 0.25,
    metalness: 0.9,
    transparent: xray,
    opacity: xray ? 0.4 : 1.0,
  });

  const goldMetallicMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.2,
    metalness: 0.95,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.85,
    opacity: 0.7,
    transparent: true,
    roughness: 0.1,
    ior: 1.5,
  });

  switch (socketId) {
    case "SOCKET_CENTRAL_MONOCOQUE": {
      // Full enclosed survival cell
      const tubGeo = new THREE.BoxGeometry(0.95, 0.65, 1.8);
      const tubMesh = new THREE.Mesh(tubGeo, carbonMat);
      tubMesh.castShadow = true;
      group.add(tubMesh);
      break;
    }
    case "SOCKET_FRONT_CRASH_NOSE": {
      const isTitanium = meshName.includes("Titanium");
      const noseGeo = new THREE.ConeGeometry(0.35, 0.85, isTitanium ? 6 : 4);
      noseGeo.rotateX(-Math.PI / 2);
      const noseMesh = new THREE.Mesh(noseGeo, isTitanium ? goldMetallicMat : carbonMat);
      noseMesh.castShadow = true;
      group.add(noseMesh);
      break;
    }
    case "SOCKET_FRONT_CLAMSHELL": {
      const isLeMans = meshName.includes("LeMans");
      const clamshellGeo = new THREE.BoxGeometry(1.85, isLeMans ? 0.32 : 0.4, 1.1);
      const clamshellMesh = new THREE.Mesh(clamshellGeo, cyanAeroMat);
      clamshellMesh.castShadow = true;
      group.add(clamshellMesh);
      break;
    }
    case "SOCKET_FRONT_SPLITTER": {
      const isActiveVenturi = meshName.includes("ActiveVenturi");
      const splitterGeo = new THREE.BoxGeometry(1.95, isActiveVenturi ? 0.08 : 0.05, 0.9);
      const splitterMesh = new THREE.Mesh(splitterGeo, carbonMat);
      splitterMesh.castShadow = true;
      group.add(splitterMesh);
      if (isActiveVenturi) {
        const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.9), cyanAeroMat);
        skirtL.position.set(-0.95, -0.04, 0);
        const skirtR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.9), cyanAeroMat);
        skirtR.position.set(0.95, -0.04, 0);
        group.add(skirtL, skirtR);
      }
      break;
    }
    case "SOCKET_FRONT_CANARDS": {
      const canardL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.25), carbonMat);
      canardL.position.set(-0.85, 0, 0);
      const canardR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.25), carbonMat);
      canardR.position.set(0.85, 0, 0);
      group.add(canardL, canardR);
      break;
    }
    case "SOCKET_FRONT_HYBRID_MGU": {
      const mguGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.45, 16);
      mguGeo.rotateZ(Math.PI / 2);
      const mguMesh = new THREE.Mesh(mguGeo, goldMetallicMat);
      group.add(mguMesh);
      break;
    }
    case "SOCKET_FRONT_SUSPENSION": {
      const armGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8);
      armGeo.rotateZ(Math.PI / 2);
      const armMesh = new THREE.Mesh(armGeo, carbonMat);
      group.add(armMesh);
      break;
    }
    case "SOCKET_COCKPIT_ENCLOSED": {
      const seatGeo = new THREE.BoxGeometry(0.45, 0.55, 0.65);
      const seatMesh = new THREE.Mesh(seatGeo, carbonMat);
      group.add(seatMesh);
      break;
    }
    case "SOCKET_WINDSCREEN_ROOF": {
      const windscreenGeo = new THREE.SphereGeometry(0.58, 16, 16, 0, Math.PI);
      windscreenGeo.rotateX(Math.PI / 2);
      const windscreenMesh = new THREE.Mesh(windscreenGeo, glassMat);
      group.add(windscreenMesh);
      break;
    }
    case "SOCKET_ROOF_AIR_SCOOP": {
      const scoopGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.6, 8);
      scoopGeo.rotateX(Math.PI / 2);
      const scoopMesh = new THREE.Mesh(scoopGeo, carbonMat);
      group.add(scoopMesh);
      break;
    }
    case "SOCKET_SIDE_BODY_L":
    case "SOCKET_SIDE_BODY_R": {
      const sidepodGeo = new THREE.BoxGeometry(0.48, 0.52, 1.6);
      const sidepodMesh = new THREE.Mesh(sidepodGeo, cyanAeroMat);
      sidepodMesh.castShadow = true;
      group.add(sidepodMesh);
      break;
    }
    case "SOCKET_FLOOR_UNDERBODY": {
      const floorGeo = new THREE.BoxGeometry(1.9, 0.04, 3.2);
      const floorMesh = new THREE.Mesh(floorGeo, carbonMat);
      floorMesh.castShadow = true;
      group.add(floorMesh);
      break;
    }
    case "SOCKET_BATTERY_900V": {
      const batteryGeo = new THREE.BoxGeometry(0.65, 0.25, 0.85);
      const batteryMesh = new THREE.Mesh(batteryGeo, goldMetallicMat);
      group.add(batteryMesh);
      break;
    }
    case "SOCKET_ICE_POWERTRAIN": {
      const blockGeo = new THREE.BoxGeometry(0.65, 0.55, 0.8);
      const blockMesh = new THREE.Mesh(blockGeo, carbonMat);
      blockMesh.castShadow = true;
      group.add(blockMesh);
      break;
    }
    case "SOCKET_EXHAUST_SYSTEM": {
      const pipeL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), goldMetallicMat);
      pipeL.position.set(-0.15, 0, 0);
      const pipeR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), goldMetallicMat);
      pipeR.position.set(0.15, 0, 0);
      group.add(pipeL, pipeR);
      break;
    }
    case "SOCKET_GEARBOX_REAR": {
      const boxGeo = new THREE.BoxGeometry(0.55, 0.42, 0.65);
      const boxMesh = new THREE.Mesh(boxGeo, carbonMat);
      boxMesh.castShadow = true;
      group.add(boxMesh);
      break;
    }
    case "SOCKET_REAR_SUSPENSION": {
      const armGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8);
      armGeo.rotateZ(Math.PI / 2);
      const armMesh = new THREE.Mesh(armGeo, carbonMat);
      group.add(armMesh);
      break;
    }
    case "SOCKET_DORSAL_SHARK_FIN": {
      const finGeo = new THREE.BoxGeometry(0.03, 0.5, 1.4);
      const finMesh = new THREE.Mesh(finGeo, cyanAeroMat);
      finMesh.castShadow = true;
      group.add(finMesh);
      break;
    }
    case "SOCKET_REAR_WING": {
      const wingGeo = new THREE.BoxGeometry(1.95, 0.05, 0.45);
      const wingMesh = new THREE.Mesh(wingGeo, carbonMat);
      wingMesh.castShadow = true;
      group.add(wingMesh);
      break;
    }
    case "SOCKET_REAR_DIFFUSER": {
      const diffGeo = new THREE.BoxGeometry(1.5, 0.22, 0.9);
      diffGeo.rotateX(Math.PI / 12);
      const diffMesh = new THREE.Mesh(diffGeo, carbonMat);
      diffMesh.castShadow = true;
      group.add(diffMesh);
      break;
    }
    case "SOCKET_WHEELS_BRAKES_FL":
    case "SOCKET_WHEELS_BRAKES_FR":
    case "SOCKET_WHEELS_BRAKES_RL":
    case "SOCKET_WHEELS_BRAKES_RR": {
      const wheelGeo = new THREE.CylinderGeometry(0.355, 0.355, 0.34, 24);
      wheelGeo.rotateZ(Math.PI / 2);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.9 });
      const wheelMesh = new THREE.Mesh(wheelGeo, tireMat);
      wheelMesh.castShadow = true;
      group.add(wheelMesh);
      break;
    }
  }

  return group;
}

// ── Empty Socket Hotspot Ring ──
function createHotspotRing(socketId: HypercarSocketId, pos: THREE.Vector3, isSelected: boolean): THREE.Group {
  const group = new THREE.Group();
  group.position.copy(pos);
  group.userData = { socketId };

  const ringGeo = new THREE.TorusGeometry(0.18, 0.02, 16, 32);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isSelected ? 0xf59e0b : 0x0284c7, // Gold if selected, Cyan otherwise
    transparent: true,
    opacity: 0.8,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  group.add(ringMesh);

  return group;
}

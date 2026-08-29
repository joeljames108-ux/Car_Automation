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
import { buildHypercarComponent } from "./HypercarProceduralGeometry";

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

  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const targetCameraLookAt = useRef<THREE.Vector3 | null>(null);

  const [isLowDragAero, setIsLowDragAero] = useState(false);
  const isLowDragAeroRef = useRef(false);
  isLowDragAeroRef.current = isLowDragAero;

  const [isSnapshotFlash, setIsSnapshotFlash] = useState(false);
  const [hoveredComponentInfo, setHoveredComponentInfo] = useState<{
    socketId: HypercarSocketId;
    componentName?: string;
    category?: string;
    massKg?: number;
  } | null>(null);

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
    scene.background = new THREE.Color(0x0c0a08);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.5, 2.4, 5.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.2);
    rimLight.position.set(-6, 5, -5);
    scene.add(rimLight);

    const warmUnderglow = new THREE.DirectionalLight(0xf59e0b, 0.8);
    warmUnderglow.position.set(0, -3, 0);
    scene.add(warmUnderglow);

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

    let lastHoveredSocketId: string | null = null;
    let lastMouseMoveTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseMoveTime < 35) return; // ~30 FPS throttle
      lastMouseMoveTime = now;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      for (const hit of intersects) {
        let current: THREE.Object3D | null = hit.object;
        while (current && current !== scene) {
          if (current.userData && current.userData.socketId) {
            const sId = current.userData.socketId as HypercarSocketId;
            if (lastHoveredSocketId === sId) return;
            lastHoveredSocketId = sId;
            const socket = HYPERCAR_SOCKET_ANCHORS[sId];
            const compId = installedMap[sId];
            const comp = compId ? HypercarComponentRegistry.getComponent(compId) : null;
            setHoveredComponentInfo({
              socketId: sId,
              componentName: comp ? comp.name : `Empty ${socket?.category || "Socket"}`,
              category: socket?.category,
              massKg: comp?.massKg,
            });
            return;
          }
          current = current.parent;
        }
      }
      if (lastHoveredSocketId !== null) {
        lastHoveredSocketId = null;
        setHoveredComponentInfo(null);
      }
    };

    renderer.domElement.addEventListener("click", handleClick);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);

    // Adaptive Render Loop Controller
    let isDirty = true;
    let lastActiveTime = performance.now();
    const markDirty = () => {
      isDirty = true;
      lastActiveTime = performance.now();
    };

    controls.addEventListener("change", markDirty);

    // Animation Loop with Tab Visibility Suspension
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.hidden) return;

      // Smooth Camera Preset Lerping
      if (targetCameraPos.current && targetCameraLookAt.current) {
        camera.position.lerp(targetCameraPos.current, 0.08);
        controls.target.lerp(targetCameraLookAt.current, 0.08);
        markDirty();
        if (
          camera.position.distanceTo(targetCameraPos.current) < 0.02 &&
          controls.target.distanceTo(targetCameraLookAt.current) < 0.02
        ) {
          targetCameraPos.current = null;
          targetCameraLookAt.current = null;
        }
      }

      // Pulsing hotspot rings
      if (hotspotsGroupRef.current && hotspotsGroupRef.current.children.length > 0 && isDirty) {
        const time = Date.now() * 0.003;
        hotspotsGroupRef.current.children.forEach((child) => {
          const ring = child.children[0] as THREE.Mesh;
          if (ring) {
            const s = 1.0 + Math.sin(time) * 0.15;
            ring.scale.set(s, s, s);
          }
        });
      }

      // Streamline Flow Animation
      const isStreamlinesActive = showAeroStreamlinesRef.current;
      if (streamlinesRef.current && isStreamlinesActive) {
        streamlinesRef.current.visible = true;
        const posArr = streamlinesRef.current.geometry.attributes.position.array as Float32Array;
        const speedDelta = isLowDragAeroRef.current ? 0.12 : 0.07;
        for (let i = 0; i < streamlineCount; i++) {
          posArr[i * 3 + 2] += speedDelta; // Move rearward
          if (posArr[i * 3 + 2] > 4.2) {
            posArr[i * 3 + 2] = -2.8;
            posArr[i * 3 + 0] = (Math.random() - 0.5) * 2.0;
            posArr[i * 3 + 1] = 0.05 + Math.random() * 0.9;
          }
        }
        streamlinesRef.current.geometry.attributes.position.needsUpdate = true;
        markDirty();
      } else if (streamlinesRef.current && streamlinesRef.current.visible) {
        streamlinesRef.current.visible = false;
        markDirty();
      }

      if (isDirty || isStreamlinesActive || targetCameraPos.current) {
        controls.update();
        renderer.render(scene, camera);
        if (performance.now() - lastActiveTime > 1500 && !isStreamlinesActive && !targetCameraPos.current) {
          isDirty = false;
        }
      }
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

  const hotspotMapRef = useRef<Map<HypercarSocketId, THREE.Group>>(new Map());

  // ── Sync Meshes with Installed Map, Isolation & X-Ray Mode ──
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear existing component meshes
    meshMapRef.current.forEach((group) => scene.remove(group));
    meshMapRef.current.clear();
    hotspotsGroupRef.current.clear();
    hotspotMapRef.current.clear();

    const allSockets = Object.keys(HYPERCAR_SOCKET_ANCHORS) as HypercarSocketId[];

    allSockets.forEach((socketId) => {
      const anchor = HYPERCAR_SOCKET_ANCHORS[socketId];
      const componentId = installedMap[socketId];

      if (componentId) {
        const comp = HypercarComponentRegistry.getComponent(componentId);
        if (!comp) return;

        const group = createHypercarModularMesh(socketId, comp.glbMeshName, xrayMode, selectedSocketId === socketId);
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
        const hotspot = createHotspotRing(socketId, new THREE.Vector3(), selectedSocketId === socketId);
        hotspotsGroupRef.current.add(hotspot);
        hotspotMapRef.current.set(socketId, hotspot);
      }
    });

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.shadowMap.needsUpdate = true;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [
    installedMap,
    systemIsolationMode,
    xrayMode,
    showAttachmentHotspots,
  ]);

  // ── Fast O(1) Transform Updates on Exploded View Slider / Snapping Animation ──
  useEffect(() => {
    const allSockets = Object.keys(HYPERCAR_SOCKET_ANCHORS) as HypercarSocketId[];

    allSockets.forEach((socketId) => {
      const anchor = HYPERCAR_SOCKET_ANCHORS[socketId];
      const basePos = new THREE.Vector3(
        anchor.positionMm[0] / 1000,
        anchor.positionMm[1] / 1000,
        anchor.positionMm[2] / 1000
      );

      const explodedOffset = new THREE.Vector3(
        anchor.normalVector[0],
        anchor.normalVector[1],
        anchor.normalVector[2]
      ).multiplyScalar(explodedViewAmount * 1.6);

      const finalPos = basePos.clone().add(explodedOffset);

      const group = meshMapRef.current.get(socketId);
      if (group) {
        if (snappingSocketId === socketId && snapAnimationProgress < 1.0) {
          finalPos.y += (1.0 - snapAnimationProgress) * 0.8;
        }
        group.position.copy(finalPos);
      }

      const hotspot = hotspotMapRef.current.get(socketId);
      if (hotspot) {
        hotspot.position.copy(finalPos);
      }
    });

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [
    explodedViewAmount,
    snappingSocketId,
    snapAnimationProgress,
    selectedSocketId,
  ]);

  const handleCameraPreset = (preset: "iso" | "mgu" | "cockpit" | "hybrid" | "rear") => {
    setCameraPresetState(preset);
    if (preset === "iso") {
      targetCameraPos.current = new THREE.Vector3(4.5, 2.4, 5.0);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.35, 1.6);
    } else if (preset === "mgu") {
      targetCameraPos.current = new THREE.Vector3(0, 0.65, -2.4);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.35, -0.8);
    } else if (preset === "cockpit") {
      targetCameraPos.current = new THREE.Vector3(0, 0.95, 0.6);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.6, -1.0);
    } else if (preset === "hybrid") {
      targetCameraPos.current = new THREE.Vector3(1.8, 1.4, 2.0);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.4, 1.8);
    } else if (preset === "rear") {
      targetCameraPos.current = new THREE.Vector3(0, 0.8, 4.8);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.45, 3.2);
    }
  };

  const handleTakeSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Apex_Hypercar_LMH_CAD_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setIsSnapshotFlash(true);
    setTimeout(() => setIsSnapshotFlash(false), 300);
  };

  return (
    <div className="relative w-full h-full bg-[#0c0a08] select-none overflow-hidden group">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Snapshot Flash Overlay */}
      {isSnapshotFlash && (
        <div className="absolute inset-0 bg-white/40 pointer-events-none transition-opacity duration-300 z-50 animate-fade-out" />
      )}

      {/* Hovered Component Specs Pill (Floating Top Center) */}
      {hoveredComponentInfo && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/85 backdrop-blur-md border border-amber-500/40 px-4 py-1.5 rounded-full shadow-2xl z-20 pointer-events-none animate-fade-in-up">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-black text-white">{hoveredComponentInfo.componentName}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {hoveredComponentInfo.category}
          </span>
          {hoveredComponentInfo.massKg !== undefined && (
            <span className="text-[10px] font-mono text-zinc-300 font-bold">
              {hoveredComponentInfo.massKg} kg
            </span>
          )}
        </div>
      )}

      {/* Top Viewport Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs shadow-2xl">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Hypercar CAD 3D Viewport
          </span>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-[11px] text-zinc-400">Click mesh or pulsing rings to snap components</span>
        </div>

        {/* Camera Presets & Snapshot Bar */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[10px] font-bold shadow-2xl">
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

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Export Render Button */}
          <button
            onClick={handleTakeSnapshot}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
            title="Export 4K Studio Image of Hypercar"
          >
            <Camera className="w-3 h-3" />
            Export Render
          </button>
        </div>

        {/* System Isolation Modes */}
        <div className="flex items-center gap-1 pointer-events-auto bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[11px] font-bold shadow-2xl">
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
        <div className="flex items-center gap-2 pointer-events-auto bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
          <button
            onClick={toggleXrayMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              xrayMode ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-zinc-400 hover:text-white"
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

          {/* Low Drag Aero Mode Toggle */}
          <button
            onClick={() => setIsLowDragAero(!isLowDragAero)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              isLowDragAero
                ? "bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30"
                : "bg-black/60 text-zinc-400 border-white/10 hover:text-white hover:border-white/30"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Aero: {isLowDragAero ? "Low Drag Mulsanne" : "High Downforce"}
          </button>
        </div>

        {/* Exploded View Slider */}
        <div className="flex items-center gap-3 pointer-events-auto bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-mono shadow-2xl">
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


// ── Procedural Hypercar Mesh Generator (delegates to HypercarProceduralGeometry) ──
function createHypercarModularMesh(
  socketId: HypercarSocketId,
  meshName: string,
  xray: boolean,
  isSelected: boolean
): THREE.Group {
  const builtGroup = buildHypercarComponent(socketId);
  if (builtGroup) {
    builtGroup.name = `COMP_${socketId}`;
    builtGroup.userData = { socketId };
    // Apply X-ray or selection tint
    if (xray || isSelected) {
      builtGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
          child.material = child.material.clone();
          if (xray) {
            child.material.transparent = true;
            (child.material as any).opacity = 0.35;
          }
          if (isSelected && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive = new THREE.Color(0xf59e0b);
            child.material.emissiveIntensity = 0.15;
          }
        }
      });
    }
  }
  return builtGroup || new THREE.Group();
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

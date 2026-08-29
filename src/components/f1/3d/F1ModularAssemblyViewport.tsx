// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — INTERACTIVE 3D ASSEMBLY VIEWPORT
// ============================================================================
// Real-time Three.js WebGL canvas displaying modular F1 components, socket
// attachment hotspots, snap animations, X-Ray transparency, and exploded views.
// ============================================================================

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useF1AssemblyStore, type F1SystemIsolationMode } from "../../../sim/f1/state/f1AssemblyStore";
import { F1_SOCKET_ANCHORS, type F1SocketId } from "../../../sim/f1/modular/f1Sockets";
import { F1ComponentRegistry } from "../../../sim/f1/modular/f1ComponentRegistry";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import {
  Eye, Box, Layers, RotateCcw, Volume2, Sparkles, ZoomIn, Info, ShieldAlert,
  Maximize2, EyeOff, Wind, Video, Compass, Camera
} from "lucide-react";
import { buildF1Component } from "./F1ProceduralGeometry";

const F1ModularAssemblyViewportComponent: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const assemblyGroupRef = useRef<THREE.Group | null>(null);
  const hotspotsGroupRef = useRef<THREE.Group | null>(null);
  const streamlinesRef = useRef<THREE.Points | null>(null);

  const [showAeroStreamlines, setShowAeroStreamlines] = useState(false);
  const showAeroStreamlinesRef = useRef(false);
  showAeroStreamlinesRef.current = showAeroStreamlines;

  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const targetCameraLookAt = useRef<THREE.Vector3 | null>(null);

  const [isDrsOpen, setIsDrsOpen] = useState(false);
  const isDrsOpenRef = useRef(false);
  isDrsOpenRef.current = isDrsOpen;

  const [isSnapshotFlash, setIsSnapshotFlash] = useState(false);
  const [hoveredComponentInfo, setHoveredComponentInfo] = useState<{
    socketId: F1SocketId;
    componentName?: string;
    category?: string;
    massKg?: number;
  } | null>(null);

  const [cameraPreset, setCameraPresetState] = useState<"iso" | "wing" | "cockpit" | "engine" | "rear">("iso");

  // F1 geometry module already imported — no inline materials needed

  const {
    installedMap,
    selectedSocketId,
    selectSocket,
    activeComponentPreviewId,
    snappingSocketId,
    snapAnimationProgress,
    systemIsolationMode,
    xrayMode,
    showAttachmentHotspots,
    explodedViewAmount,
    setExplodedViewAmount,
    toggleXrayMode,
    toggleAttachmentHotspots,
    setSystemIsolationMode,
  } = useF1AssemblyStore();

  const [hoveredSocket, setHoveredSocket] = useState<F1SocketId | null>(null);

  // Materials are managed by F1ProceduralGeometry module

  // ── Initialize Scene ──
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0a08);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(3.8, 2.2, 4.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.4, 1.8); // Center on vehicle chassis
    controls.maxDistance = 15;
    controls.minDistance = 0.8;
    controlsRef.current = controls;

    // ── Photorealistic Studio Lighting ──
    const ambientLight = new THREE.AmbientLight(0xfff5ee, 0.8);
    scene.add(ambientLight);

    // Hemisphere light for natural sky/ground bounce
    const hemiLight = new THREE.HemisphereLight(0xc4d4e8, 0x1a1410, 0.6);
    scene.add(hemiLight);

    // Key light — warm, slightly overhead
    const keyLight = new THREE.DirectionalLight(0xfff0dd, 3.5);
    keyLight.position.set(4, 8, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill light — cool, from opposite side
    const fillLight = new THREE.DirectionalLight(0x8ec5e8, 1.2);
    fillLight.position.set(-6, 4, -2);
    scene.add(fillLight);

    // Rim / back light — cyan accent
    const rimLight = new THREE.DirectionalLight(0xd4a006, 1.4);
    rimLight.position.set(-3, 5, -6);
    scene.add(rimLight);

    // Under-chassis glow
    const underGlow = new THREE.PointLight(0xd4a006, 0.6, 3.5);
    underGlow.position.set(0, -0.1, 1.5);
    scene.add(underGlow);

    // Workshop Spot lights (top-down, for highlights)
    const spotGeo = new THREE.SpotLight(0xffffff, 1.5, 12, Math.PI / 5, 0.4, 1);
    spotGeo.position.set(0, 6, 1.5);
    spotGeo.target.position.set(0, 0, 1.5);
    scene.add(spotGeo, spotGeo.target);

    // Reflective ground plane
    const groundGeo = new THREE.PlaneGeometry(24, 24);
    const groundMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d0a06,
      roughness: 0.12,
      metalness: 0.55,
      clearcoat: 0.25,
      clearcoatRoughness: 0.18,
      envMapIntensity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.002;
    ground.receiveShadow = true;
    scene.add(ground);

    // Workshop Grid Floor (subtle)
    // Subtle workshop floor grid — warm amber accent matching the Vision Glass theme
    const grid = new THREE.GridHelper(20, 40, 0x92702a, 0x1a1508);
    grid.position.y = 0.001;
    grid.material.opacity = 0.08;
    grid.material.transparent = true;
    scene.add(grid);

    // CFD Aerodynamic Streamline Particles
    const streamlineCount = 150;
    const streamlineGeo = new THREE.BufferGeometry();
    const streamlinePos = new Float32Array(streamlineCount * 3);
    for (let i = 0; i < streamlineCount; i++) {
      streamlinePos[i * 3 + 0] = (Math.random() - 0.5) * 1.9;
      streamlinePos[i * 3 + 1] = 0.05 + Math.random() * 0.85;
      streamlinePos[i * 3 + 2] = -2.8 + Math.random() * 6.5;
    }
    streamlineGeo.setAttribute("position", new THREE.BufferAttribute(streamlinePos, 3));
    const streamlineMat = new THREE.PointsMaterial({
      color: 0xd4a006,
      size: 0.040,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const streamlines = new THREE.Points(streamlineGeo, streamlineMat);
    streamlines.visible = false;
    scene.add(streamlines);
    streamlinesRef.current = streamlines;

    // Groups
    const assemblyGroup = new THREE.Group();
    scene.add(assemblyGroup);
    assemblyGroupRef.current = assemblyGroup;

    const hotspotsGroup = new THREE.Group();
    scene.add(hotspotsGroup);
    hotspotsGroupRef.current = hotspotsGroup;

    // Adaptive Render Loop Controller
    let isDirty = true;
    let lastActiveTime = performance.now();
    const markDirty = () => {
      isDirty = true;
      lastActiveTime = performance.now();
    };

    controls.addEventListener("change", markDirty);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

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

      const isStreamlinesActive = showAeroStreamlinesRef.current;

      // Pulse Hotspots without forcing continuous markDirty when idle
      if (hotspotsGroupRef.current && hotspotsGroupRef.current.children.length > 0 && isDirty) {
        const time = Date.now() * 0.003;
        hotspotsGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const scale = 1.0 + Math.sin(time) * 0.12;
            child.scale.set(scale, scale, scale);
          }
        });
      }

      // Streamline Flow Animation with DRS speed multiplier
      if (streamlinesRef.current && isStreamlinesActive) {
        streamlinesRef.current.visible = true;
        const posArr = streamlinesRef.current.geometry.attributes.position.array as Float32Array;
        const speedDelta = isDrsOpenRef.current ? 0.12 : 0.07;
        for (let i = 0; i < streamlineCount; i++) {
          posArr[i * 3 + 2] += speedDelta; // Move rearward
          if (posArr[i * 3 + 2] > 4.2) {
            posArr[i * 3 + 2] = -2.8;
            posArr[i * 3 + 0] = (Math.random() - 0.5) * 1.9;
            posArr[i * 3 + 1] = 0.05 + Math.random() * 0.85;
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

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth || 800;
      const h = mountRef.current.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      markDirty();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) markDirty();
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Trigger initial layout adaptation
    requestAnimationFrame(handleResize);
    const initTimer = setTimeout(handleResize, 60);

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (streamlinesRef.current?.geometry) {
        streamlinesRef.current.geometry.dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const meshMapRef = useRef<Map<F1SocketId, THREE.Group>>(new Map());
  const hotspotMapRef = useRef<Map<F1SocketId, THREE.Mesh>>(new Map());

  // ── Rebuild 3D Meshes Only When Installed Parts, Isolation, or X-Ray Mode Change ──
  useEffect(() => {
    if (!assemblyGroupRef.current || !hotspotsGroupRef.current) return;
    const assemblyGroup = assemblyGroupRef.current;
    const hotspotsGroup = hotspotsGroupRef.current;

    // Dispose old geometries before clearing children
    const disposeGeometries = (grp: THREE.Group) => {
      grp.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry) {
          obj.geometry.dispose();
        }
      });
      while (grp.children.length > 0) {
        grp.remove(grp.children[0]);
      }
    };

    disposeGeometries(assemblyGroup);
    disposeGeometries(hotspotsGroup);
    meshMapRef.current.clear();
    hotspotMapRef.current.clear();

    const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];

    allSockets.forEach((socketId) => {
      const socket = F1_SOCKET_ANCHORS[socketId];
      const componentId = installedMap[socketId];

      // Check System Isolation Mode
      const isVisibleInIsolation =
        systemIsolationMode === "ALL" ||
        (systemIsolationMode === "AERO" && socket.category === "AERO") ||
        (systemIsolationMode === "POWERTRAIN" && socket.category === "POWERTRAIN") ||
        (systemIsolationMode === "SUSPENSION" && socket.category === "SUSPENSION") ||
        (systemIsolationMode === "CHASSIS" && socket.category === "CHASSIS") ||
        (systemIsolationMode === "WHEELS" && socket.category === "WHEELS");

      if (!isVisibleInIsolation) return;

      if (componentId) {
        // ── Render Installed Component ──
        const comp = F1ComponentRegistry.getComponent(componentId);
        if (!comp) return;

        const compGroup = new THREE.Group();
        compGroup.name = `COMP_${socketId}`;
        compGroup.userData = { socketId };

        // ── Build photorealistic geometry from F1ProceduralGeometry module ──
        const builtGroup = buildF1Component(socketId, xrayMode, isDrsOpen);
        if (builtGroup) {
          builtGroup.name = `COMP_${socketId}`;
          builtGroup.userData = { socketId };
          // Apply X-ray transparency to entire group if needed
          if (xrayMode && (socket.category === "AERO" || socket.category === "CHASSIS")) {
            builtGroup.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
                child.material = child.material.clone();
                (child.material as THREE.MeshPhysicalMaterial).transparent = true;
                (child.material as THREE.MeshPhysicalMaterial).opacity = 0.22;
              }
            });
          }
          compGroup.add(builtGroup);
        }

        assemblyGroup.add(compGroup);
        meshMapRef.current.set(socketId, compGroup);
      } else if (showAttachmentHotspots) {
        // ── Render Empty Socket Hotspot Ring ──
        const ringGeo = new THREE.TorusGeometry(0.18, 0.018, 12, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: selectedSocketId === socketId ? 0xd4a006 : 0x92702a,
          wireframe: true,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.name = `HOTSPOT_${socketId}`;
        ringMesh.userData = { socketId };
        hotspotsGroup.add(ringMesh);
        hotspotMapRef.current.set(socketId, ringMesh);
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
    activeComponentPreviewId,
    isDrsOpen,
  ]);

  // ── High-Performance O(1) Transform Updates (Zero Geometry Reallocation on Slider / Snapping) ──
  useEffect(() => {
    const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];

    allSockets.forEach((socketId) => {
      const socket = F1_SOCKET_ANCHORS[socketId];
      const basePos = new THREE.Vector3(
        socket.positionMm[0] * 0.001,
        socket.positionMm[1] * 0.001,
        socket.positionMm[2] * 0.001
      );

      const explodeOffset = new THREE.Vector3(
        socket.normalVector[0] * explodedViewAmount * 1.2,
        socket.normalVector[1] * explodedViewAmount * 1.2,
        socket.normalVector[2] * explodedViewAmount * 1.2
      );

      const finalPos = basePos.clone().add(explodeOffset);

      const compGroup = meshMapRef.current.get(socketId);
      if (compGroup) {
        if (snappingSocketId === socketId && snapAnimationProgress < 1.0) {
          const hoverOffset = new THREE.Vector3(0, 0.4 * (1.0 - snapAnimationProgress), 0);
          compGroup.position.copy(finalPos).add(hoverOffset);
        } else {
          compGroup.position.copy(finalPos);
        }
      }

      const ringMesh = hotspotMapRef.current.get(socketId);
      if (ringMesh) {
        ringMesh.position.copy(finalPos);
        if (ringMesh.material instanceof THREE.MeshBasicMaterial) {
          ringMesh.material.color.setHex(selectedSocketId === socketId ? 0xd4a006 : 0x92702a);
        }
      }
    });

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [explodedViewAmount, snappingSocketId, snapAnimationProgress, selectedSocketId]);

  // ── Raycasting on Click & Pointer Move ──
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr && curr !== sceneRef.current) {
        if (curr.name.startsWith("HOTSPOT_")) {
          const socketId = curr.name.replace("HOTSPOT_", "") as F1SocketId;
          selectSocket(socketId);
          return;
        }
        if (curr.name.startsWith("COMP_")) {
          const socketId = curr.name.replace("COMP_", "") as F1SocketId;
          selectSocket(socketId);
          return;
        }
        curr = curr.parent;
      }
    }
  };

  const lastHoveredSocketIdRef = useRef<string | null>(null);
  const lastPointerMoveTimeRef = useRef<number>(0);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - lastPointerMoveTimeRef.current < 35) return; // ~30 FPS throttled raycasting
    lastPointerMoveTimeRef.current = now;

    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr && curr !== sceneRef.current) {
        if (curr.name.startsWith("COMP_") || curr.name.startsWith("HOTSPOT_")) {
          const sId = curr.name.replace("COMP_", "").replace("HOTSPOT_", "") as F1SocketId;
          if (lastHoveredSocketIdRef.current === sId) return;
          lastHoveredSocketIdRef.current = sId;
          const socket = F1_SOCKET_ANCHORS[sId];
          const compId = installedMap[sId];
          const comp = compId ? F1ComponentRegistry.getComponent(compId) : null;
          setHoveredComponentInfo({
            socketId: sId,
            componentName: comp ? comp.name : `Empty ${socket?.category || "Socket"}`,
            category: socket?.category,
            massKg: comp?.massKg,
          });
          return;
        }
        curr = curr.parent;
      }
    }
    if (lastHoveredSocketIdRef.current !== null) {
      lastHoveredSocketIdRef.current = null;
      setHoveredComponentInfo(null);
    }
  }, [installedMap]);

  const handleCameraPreset = (preset: "iso" | "wing" | "cockpit" | "engine" | "rear") => {
    setCameraPresetState(preset);
    if (preset === "iso") {
      targetCameraPos.current = new THREE.Vector3(3.8, 2.2, 4.8);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.4, 1.8);
    } else if (preset === "wing") {
      targetCameraPos.current = new THREE.Vector3(0, 0.6, -2.4);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.3, 0);
    } else if (preset === "cockpit") {
      targetCameraPos.current = new THREE.Vector3(0, 0.88, 0.9);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.55, -1.5);
    } else if (preset === "engine") {
      targetCameraPos.current = new THREE.Vector3(1.5, 1.2, 2.2);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.4, 2.0);
    } else if (preset === "rear") {
      targetCameraPos.current = new THREE.Vector3(0, 0.75, 4.6);
      targetCameraLookAt.current = new THREE.Vector3(0, 0.4, 3.0);
    }
  };

  const handleTakeSnapshot = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    playHMIClickSound();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Apex_F1_Chassis_CAD_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setIsSnapshotFlash(true);
    setTimeout(() => setIsSnapshotFlash(false), 300);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#0a0c10] select-none overflow-hidden group">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

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

      {/* Top Left Floating Viewport Toolbar */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-2xl z-10">
        <span className="text-[11px] font-black tracking-widest uppercase text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          F1 CAD Viewport
        </span>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* System Isolation Modes */}
        {(["ALL", "AERO", "POWERTRAIN", "SUSPENSION", "CHASSIS", "WHEELS"] as F1SystemIsolationMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setSystemIsolationMode(mode)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
              systemIsolationMode === mode
                ? "bg-amber-500 text-black shadow-md shadow-cyan-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {mode}
          </button>
        ))}

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* X-Ray Mode */}
        <button
          onClick={toggleXrayMode}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
            xrayMode ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
          title="Toggle Transparent X-Ray Inspection"
        >
          <Layers className="w-3 h-3" />
          X-Ray
        </button>

        {/* Hotspots Toggle */}
        <button
          onClick={toggleAttachmentHotspots}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
            showAttachmentHotspots ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
          title="Toggle Empty Attachment Hotspots"
        >
          <Box className="w-3 h-3" />
          Hotspots
        </button>

        {/* Aero Streamlines Toggle */}
        <button
          onClick={() => setShowAeroStreamlines(!showAeroStreamlines)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
            showAeroStreamlines ? "bg-amber-400 text-black shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
          title="Toggle CFD Aerodynamic Streamlines"
        >
          <Wind className="w-3 h-3" />
          CFD Flow
        </button>

        {/* DRS Actuator Toggle */}
        <button
          onClick={() => {
            playHMIClickSound();
            setIsDrsOpen(!isDrsOpen);
          }}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
            isDrsOpen
              ? "bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30"
              : "bg-black/60 text-zinc-400 border-white/10 hover:text-white hover:border-white/30"
          }`}
          title="Toggle DRS Rear Wing Flap Actuation"
        >
          <Sparkles className="w-3 h-3" />
          DRS {isDrsOpen ? "OPEN (ACTIVE)" : "CLOSED"}
        </button>
      </div>

      {/* Top Right Camera Presets & Snapshot Floating Widget */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl z-10 text-xs shadow-2xl">
        <Camera className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mr-1">Views:</span>
        {[
          { id: "iso", label: "ISO 3D" },
          { id: "wing", label: "Front Wing" },
          { id: "cockpit", label: "Halo POV" },
          { id: "engine", label: "V6 Engine" },
          { id: "rear", label: "Rear DRS" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => handleCameraPreset(v.id as any)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              cameraPreset === v.id
                ? "bg-amber-500/25 border border-amber-400/50 text-amber-300"
                : "text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {v.label}
          </button>
        ))}

        <div className="h-4 w-px bg-white/15 mx-1" />

        {/* Snapshot Export Button */}
        <button
          onClick={handleTakeSnapshot}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
          title="Export 4K Studio Image of Chassis"
        >
          <Camera className="w-3 h-3" />
          Export Render
        </button>
      </div>

      {/* Exploded View Bottom Slider HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl z-10 shadow-2xl">
        <div className="flex items-center gap-3 w-1/2 max-w-sm">
          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider whitespace-nowrap">
            Exploded View
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedViewAmount}
            onChange={(e) => setExplodedViewAmount(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <span className="text-[11px] font-mono text-amber-400 font-bold w-10 text-right">
            {Math.round(explodedViewAmount * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Click any 3D part or glowing cyan ring to select attachment socket</span>
        </div>
      </div>
    </div>
  );
};

export const F1ModularAssemblyViewport = React.memo(F1ModularAssemblyViewportComponent);


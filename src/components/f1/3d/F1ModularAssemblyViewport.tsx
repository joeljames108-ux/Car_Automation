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
import {
  Eye, Box, Layers, RotateCcw, Volume2, Sparkles, ZoomIn, Info, ShieldAlert,
  Maximize2, EyeOff, Wind, Video, Compass, Camera
} from "lucide-react";

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

  const [cameraPreset, setCameraPresetState] = useState<"iso" | "wing" | "cockpit" | "engine" | "rear">("iso");

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

  // ── Materials Cache ──
  const carbonMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: 0x111113,
      roughness: 0.28,
      metalness: 0.85,
    })
  );

  const liveryMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan Apex Works Livery
      roughness: 0.2,
      metalness: 0.6,
    })
  );

  const titaniumMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      roughness: 0.35,
      metalness: 0.95,
    })
  );

  const engineGoldMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.9,
    })
  );

  const rubberMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.05,
    })
  );

  const brakeGlowingMaterial = useRef(
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.4,
    })
  );

  const xrayBodyMaterial = useRef(
    new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.22,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.5,
    })
  );

  // ── Initialize Scene ──
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(3.8, 2.2, 4.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.4, 1.8); // Center on vehicle chassis
    controls.maxDistance = 15;
    controls.minDistance = 0.8;
    controlsRef.current = controls;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 2.0);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const floorLight = new THREE.DirectionalLight(0x3b82f6, 0.8);
    floorLight.position.set(0, -3, 0);
    scene.add(floorLight);

    // Workshop Grid Floor
    const grid = new THREE.GridHelper(20, 40, 0x06b6d4, 0x1f2937);
    grid.position.y = -0.001;
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
      color: 0x06b6d4,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
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

      const isStreamlinesActive = showAeroStreamlinesRef.current;

      // Pulse Hotspots
      if (hotspotsGroupRef.current && hotspotsGroupRef.current.children.length > 0) {
        const time = Date.now() * 0.003;
        hotspotsGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const scale = 1.0 + Math.sin(time) * 0.12;
            child.scale.set(scale, scale, scale);
          }
        });
        markDirty();
      }

      // Streamline Flow Animation
      if (streamlinesRef.current && isStreamlinesActive) {
        streamlinesRef.current.visible = true;
        const posArr = streamlinesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < streamlineCount; i++) {
          posArr[i * 3 + 2] += 0.07; // Move rearward
          if (posArr[i * 3 + 2] > 4.2) {
            posArr[i * 3 + 2] = -2.8;
            posArr[i * 3 + 0] = (Math.random() - 0.5) * 1.9;
            posArr[i * 3 + 1] = 0.05 + Math.random() * 0.85;
          }
        }
        streamlinesRef.current.geometry.attributes.position.needsUpdate = true;
        markDirty();
      } else if (streamlinesRef.current) {
        streamlinesRef.current.visible = false;
      }

      if (isDirty || isStreamlinesActive) {
        controls.update();
        renderer.render(scene, camera);
        if (performance.now() - lastActiveTime > 2000 && !isStreamlinesActive) {
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
      carbonMaterial.current.dispose();
      liveryMaterial.current.dispose();
      titaniumMaterial.current.dispose();
      engineGoldMaterial.current.dispose();
      rubberMaterial.current.dispose();
      brakeGlowingMaterial.current.dispose();
      xrayBodyMaterial.current.dispose();
      if (streamlinesRef.current?.geometry) {
        streamlinesRef.current.geometry.dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ── Rebuild 3D Meshes on State Changes ──
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

    const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];

    allSockets.forEach((socketId) => {
      const socket = F1_SOCKET_ANCHORS[socketId];
      const componentId = installedMap[socketId];

      // Convert mm to Three.js meters (scale: 0.001)
      const basePos = new THREE.Vector3(
        socket.positionMm[0] * 0.001,
        socket.positionMm[1] * 0.001,
        socket.positionMm[2] * 0.001
      );

      // Add exploded view displacement
      const explodeOffset = new THREE.Vector3(
        socket.normalVector[0] * explodedViewAmount * 1.2,
        socket.normalVector[1] * explodedViewAmount * 1.2,
        socket.normalVector[2] * explodedViewAmount * 1.2
      );

      const finalPos = basePos.clone().add(explodeOffset);

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
        compGroup.position.copy(finalPos);

        // Snap animation lerp if active
        if (snappingSocketId === socketId && snapAnimationProgress < 1.0) {
          const hoverOffset = new THREE.Vector3(0, 0.4 * (1.0 - snapAnimationProgress), 0);
          compGroup.position.add(hoverOffset);
        }

        const bodyMat = xrayMode && (socket.category === "AERO" || socket.category === "CHASSIS")
          ? xrayBodyMaterial.current
          : liveryMaterial.current;

        // Build procedural geometry based on socket type
        switch (socketId) {
          case "SOCKET_SURVIVAL_CELL": {
            // Main monocoque tub
            const tubGeo = new THREE.BoxGeometry(0.72, 0.52, 2.2);
            const tubMesh = new THREE.Mesh(tubGeo, bodyMat);
            tubMesh.position.set(0, 0, 0);
            compGroup.add(tubMesh);
            break;
          }

          case "SOCKET_NOSE_CONE": {
            // Tapered nose cone
            const noseGeo = new THREE.ConeGeometry(0.32, 1.1, 16);
            noseGeo.rotateX(-Math.PI / 2);
            const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
            compGroup.add(noseMesh);
            break;
          }

          case "SOCKET_FRONT_WING": {
            // 4-element front wing mainplane & endplates
            const wingGeo = new THREE.BoxGeometry(1.95, 0.04, 0.55);
            const wingMesh = new THREE.Mesh(wingGeo, carbonMaterial.current);
            compGroup.add(wingMesh);

            // Endplates
            const epL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.6), bodyMat);
            epL.position.set(-0.98, 0.1, 0);
            const epR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.6), bodyMat);
            epR.position.set(0.98, 0.1, 0);
            compGroup.add(epL, epR);
            break;
          }

          case "SOCKET_HALO": {
            const haloTorus = new THREE.TorusGeometry(0.28, 0.035, 12, 24, Math.PI);
            haloTorus.rotateX(Math.PI / 2);
            const haloMesh = new THREE.Mesh(haloTorus, titaniumMaterial.current);
            compGroup.add(haloMesh);
            break;
          }

          case "SOCKET_COCKPIT_TRIM": {
            const wheelGeo = new THREE.BoxGeometry(0.26, 0.16, 0.04);
            const wheelMesh = new THREE.Mesh(wheelGeo, carbonMaterial.current);
            compGroup.add(wheelMesh);
            break;
          }

          case "SOCKET_FLOOR_UNDERBODY": {
            const floorGeo = new THREE.BoxGeometry(1.5, 0.04, 2.6);
            const floorMesh = new THREE.Mesh(floorGeo, carbonMaterial.current);
            compGroup.add(floorMesh);
            break;
          }

          case "SOCKET_SIDEPOD_L": {
            const sideGeo = new THREE.BoxGeometry(0.42, 0.38, 1.4);
            const sideMesh = new THREE.Mesh(sideGeo, bodyMat);
            compGroup.add(sideMesh);
            break;
          }

          case "SOCKET_SIDEPOD_R": {
            const sideGeo = new THREE.BoxGeometry(0.42, 0.38, 1.4);
            const sideMesh = new THREE.Mesh(sideGeo, bodyMat);
            compGroup.add(sideMesh);
            break;
          }

          case "SOCKET_POWER_UNIT": {
            const v6Geo = new THREE.BoxGeometry(0.48, 0.44, 0.62);
            const v6Mesh = new THREE.Mesh(v6Geo, engineGoldMaterial.current);
            compGroup.add(v6Mesh);
            break;
          }

          case "SOCKET_GEARBOX": {
            const gbGeo = new THREE.BoxGeometry(0.38, 0.34, 0.75);
            const gbMesh = new THREE.Mesh(gbGeo, carbonMaterial.current);
            compGroup.add(gbMesh);
            break;
          }

          case "SOCKET_SUSPENSION_FL":
          case "SOCKET_SUSPENSION_FR":
          case "SOCKET_SUSPENSION_RL":
          case "SOCKET_SUSPENSION_RR": {
            const isRight = socketId.includes("FR") || socketId.includes("RR");
            const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45);
            armGeo.rotateZ(isRight ? -Math.PI / 4 : Math.PI / 4);
            const armMesh = new THREE.Mesh(armGeo, carbonMaterial.current);
            compGroup.add(armMesh);
            break;
          }

          case "SOCKET_REAR_DIFFUSER": {
            const diffGeo = new THREE.BoxGeometry(0.95, 0.18, 0.65);
            diffGeo.rotateX(-0.2);
            const diffMesh = new THREE.Mesh(diffGeo, carbonMaterial.current);
            compGroup.add(diffMesh);
            break;
          }

          case "SOCKET_REAR_WING": {
            const rwGeo = new THREE.BoxGeometry(1.2, 0.04, 0.38);
            const rwMesh = new THREE.Mesh(rwGeo, bodyMat);
            compGroup.add(rwMesh);

            const drsFlap = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.02, 0.18), carbonMaterial.current);
            drsFlap.position.set(0, 0.12, -0.05);
            compGroup.add(drsFlap);

            const pylonL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65), carbonMaterial.current);
            pylonL.position.set(-0.25, -0.3, 0);
            const pylonR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.65), carbonMaterial.current);
            pylonR.position.set(0.25, -0.3, 0);
            compGroup.add(pylonL, pylonR);
            break;
          }

          case "SOCKET_WHEEL_FL":
          case "SOCKET_WHEEL_FR":
          case "SOCKET_WHEEL_RL":
          case "SOCKET_WHEEL_RR": {
            const isRear = socketId.includes("RL") || socketId.includes("RR");
            const wheelRadius = 0.36;
            const wheelWidth = isRear ? 0.42 : 0.32;

            const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
            tireGeo.rotateZ(Math.PI / 2);
            const tireMesh = new THREE.Mesh(tireGeo, rubberMaterial.current);

            const discGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16);
            discGeo.rotateZ(Math.PI / 2);
            const discMesh = new THREE.Mesh(discGeo, brakeGlowingMaterial.current);

            compGroup.add(tireMesh, discMesh);
            break;
          }
        }

        assemblyGroup.add(compGroup);
      } else if (showAttachmentHotspots) {
        // ── Render Empty Socket Hotspot Ring ──
        const ringGeo = new THREE.TorusGeometry(0.18, 0.018, 12, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: selectedSocketId === socketId ? 0xec4899 : 0x06b6d4,
          wireframe: true,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.name = `HOTSPOT_${socketId}`;
        ringMesh.position.copy(finalPos);
        hotspotsGroup.add(ringMesh);
      }
    });
  }, [
    installedMap,
    selectedSocketId,
    activeComponentPreviewId,
    snappingSocketId,
    snapAnimationProgress,
    systemIsolationMode,
    xrayMode,
    showAttachmentHotspots,
    explodedViewAmount,
  ]);

  // ── Raycasting on Click ──
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

  const handleCameraPreset = (preset: "iso" | "wing" | "cockpit" | "engine" | "rear") => {
    setCameraPresetState(preset);
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    if (preset === "iso") {
      cam.position.set(3.8, 2.2, 4.8);
      ctrl.target.set(0, 0.4, 1.8);
    } else if (preset === "wing") {
      cam.position.set(0, 0.6, -2.4);
      ctrl.target.set(0, 0.3, 0);
    } else if (preset === "cockpit") {
      cam.position.set(0, 0.88, 0.9);
      ctrl.target.set(0, 0.55, -1.5);
    } else if (preset === "engine") {
      cam.position.set(1.5, 1.2, 2.2);
      ctrl.target.set(0, 0.4, 2.0);
    } else if (preset === "rear") {
      cam.position.set(0, 0.75, 4.6);
      ctrl.target.set(0, 0.4, 3.0);
    }
    ctrl.update();
  };

  return (
    <div className="relative w-full h-full bg-[#0a0c10] select-none overflow-hidden group">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} onPointerDown={handlePointerDown} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Floating Viewport Toolbar */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-2xl z-10">
        <span className="text-[11px] font-black tracking-widest uppercase text-cyan-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
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
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/30"
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
            showAttachmentHotspots ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-zinc-400 hover:text-white hover:bg-white/10"
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
            showAeroStreamlines ? "bg-cyan-400 text-black shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/10"
          }`}
          title="Toggle CFD Aerodynamic Streamlines"
        >
          <Wind className="w-3 h-3" />
          CFD Flow
        </button>
      </div>

      {/* Top Right Camera Presets Floating Widget */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl z-10 text-xs">
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
                ? "bg-cyan-500/25 border border-cyan-400/50 text-cyan-300"
                : "text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Exploded View Bottom Slider HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/75 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl z-10">
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
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[11px] font-mono text-cyan-400 font-bold w-10 text-right">
            {Math.round(explodedViewAmount * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click any 3D part or glowing cyan ring to select attachment socket</span>
        </div>
      </div>
    </div>
  );
};

export const F1ModularAssemblyViewport = React.memo(F1ModularAssemblyViewportComponent);


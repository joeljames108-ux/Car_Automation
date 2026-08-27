// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — INTERACTIVE 3D WEBGL CAD VIEWPORT
// ============================================================================

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Layers, Maximize2, RotateCw, Eye, Sliders, Wind, Compass, Sparkles,
  Camera, Zap, Disc, Volume2, VolumeX,
} from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import { F1FullCarProceduralGenerator } from "../../../exterior3d/generators/f1/f1FullCarProceduralGenerator";

const F1Car3DViewportComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    car,
    cameraPreset,
    setCameraPreset,
    explodedViewAmount,
    setExplodedViewAmount,
    wireframeMode,
    toggleWireframe,
    showAeroStreamlines,
    toggleAeroStreamlines,
    isEngineRevving,
    setIsEngineRevving,
    engineRpm,
    setEngineRpm,
  } = useF1ConstructorStore();

  const [drsOpen, setDrsOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);
  const markDirtyRef = useRef<() => void>(() => {});
  const autoRotateRef = useRef<boolean>(autoRotate);
  const isEngineRevvingRef = useRef<boolean>(isEngineRevving);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    markDirtyRef.current();
  }, [autoRotate]);

  useEffect(() => {
    isEngineRevvingRef.current = isEngineRevving;
    markDirtyRef.current();
  }, [isEngineRevving]);

  // Audio Synth Ref (Web Audio API)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Initialize Three.js Scene (Mounted ONCE)
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d);

    // Fog for depth
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.2, 2.1, 4.8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 15.0;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Studio Rim Lights
    const rimLight1 = new THREE.DirectionalLight(0x00f0ff, 1.8);
    rimLight1.position.set(-5, 3, -5);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xff0055, 1.2);
    rimLight2.position.set(5, 2, -5);
    scene.add(rimLight2);

    // Reflective Studio Floor
    const gridHelper = new THREE.GridHelper(30, 60, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050814,
      roughness: 0.2,
      metalness: 0.8,
    });
    const floorPlane = new THREE.Mesh(floorGeo, floorMat);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.receiveShadow = true;
    scene.add(floorPlane);

    // Adaptive Render Loop Controller
    let isDirty = true;
    let lastActiveTime = performance.now();
    const markDirty = () => {
      isDirty = true;
      lastActiveTime = performance.now();
    };
    markDirtyRef.current = markDirty;

    controls.addEventListener("change", markDirty);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (document.hidden) return;

      const isActivelyRotating = autoRotateRef.current;
      const isActivelyRevving = isEngineRevvingRef.current;

      if (isActivelyRotating && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 1.2;
        controlsRef.current.update();
        markDirty();
      }

      if (isDirty || isActivelyRotating || isActivelyRevving) {
        controls.update();
        renderer.render(scene, camera);
        if (performance.now() - lastActiveTime > 2000 && !isActivelyRotating && !isActivelyRevving) {
          isDirty = false;
        }
      }
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      markDirty();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markDirty();
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update 3D Car Geometry when design or options change
  useEffect(() => {
    if (!sceneRef.current) return;

    if (carGroupRef.current) {
      sceneRef.current.remove(carGroupRef.current);
      carGroupRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    const newCarGroup = F1FullCarProceduralGenerator.createCarGroup(car, {
      explodedAmount: explodedViewAmount,
      wireframe: wireframeMode,
      brakeTemperatureC: isEngineRevving ? 750 : 380,
      drsOpen,
    });

    carGroupRef.current = newCarGroup;
    sceneRef.current.add(newCarGroup);
    markDirtyRef.current();
  }, [car, explodedViewAmount, wireframeMode, drsOpen, isEngineRevving]);

  // Camera Presets
  const applyCameraPreset = (preset: typeof cameraPreset) => {
    setCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;

    switch (preset) {
      case "ORBIT_HERO":
        cameraRef.current.position.set(4.2, 2.1, 4.8);
        controlsRef.current.target.set(0, 0.4, 0);
        break;
      case "AERO_TUNNEL":
        cameraRef.current.position.set(0, 1.2, 5.8);
        controlsRef.current.target.set(0, 0.3, 0);
        break;
      case "COCKPIT_POV":
        cameraRef.current.position.set(0, 0.72, -0.2);
        controlsRef.current.target.set(0, 0.5, 2.5);
        break;
      case "FRONT_WING_MACRO":
        cameraRef.current.position.set(1.4, 0.5, 2.8);
        controlsRef.current.target.set(0, 0.2, 2.2);
        break;
      case "REAR_DIFFUSER_MACRO":
        cameraRef.current.position.set(-1.8, 0.6, -2.6);
        controlsRef.current.target.set(0, 0.3, -1.2);
        break;
    }
  };

  // Sound Synth Toggle
  const toggleAudioSynth = () => {
    if (!audioEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime((engineRpm / 60) * 3, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setAudioEnabled(true);
      } catch (err) {
        console.error("Audio synth error:", err);
      }
    } else {
      if (oscRef.current) oscRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
      setAudioEnabled(false);
    }
  };

  // Update sound when RPM changes
  useEffect(() => {
    if (audioEnabled && oscRef.current && audioCtxRef.current) {
      const freq = (engineRpm / 60) * 3; // 3 ignition pulses per rev in 6-cyl 4-stroke
      oscRef.current.frequency.setTargetAtTime(freq, audioCtxRef.current.currentTime, 0.05);
    }
  }, [engineRpm, audioEnabled]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Viewport Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5 shadow-lg">
          <Sparkles size={12} className="text-cyan-400" />
          <span>F1 3D CAD STUDIO</span>
        </div>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg border backdrop-blur-md transition-all ${
            autoRotate
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/40"
              : "bg-slate-900/70 border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
          title="Auto Rotate Turntable"
        >
          <RotateCw size={14} className={autoRotate ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Top Right Camera Presets */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-lg">
        {[
          { id: "ORBIT_HERO", label: "Hero 3/4" },
          { id: "AERO_TUNNEL", label: "Front" },
          { id: "FRONT_WING_MACRO", label: "F-Wing" },
          { id: "REAR_DIFFUSER_MACRO", label: "Diffuser" },
          { id: "COCKPIT_POV", label: "Cockpit" },
        ].map((cam) => (
          <button
            key={cam.id}
            onClick={() => applyCameraPreset(cam.id as any)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              cameraPreset === cam.id
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            {cam.label}
          </button>
        ))}
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-2xl">
        {/* Exploded View Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Layers size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Exploded:</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedViewAmount}
            onChange={(e) => setExplodedViewAmount(parseFloat(e.target.value))}
            className="w-28 sm:w-36 accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-xs text-cyan-400 w-9 font-bold">
            {Math.round(explodedViewAmount * 100)}%
          </span>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* DRS Flap Toggle */}
          <button
            onClick={() => setDrsOpen(!drsOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all border ${
              drsOpen
                ? "bg-ok-500/20 border-ok-500/50 text-ok-300 shadow-md shadow-ok-950/40"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            DRS {drsOpen ? "OPEN (85mm)" : "CLOSED"}
          </button>

          {/* Wireframe */}
          <button
            onClick={toggleWireframe}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              wireframeMode
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            Wireframe
          </button>

          {/* Engine Sound Synth */}
          <button
            onClick={toggleAudioSynth}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              audioEnabled
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-950/40"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            {audioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{audioEnabled ? "V6 Audio ON" : "V6 Audio"}</span>
          </button>

          {/* RPM Slider if audio enabled */}
          {audioEnabled && (
            <div className="flex items-center gap-2 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
              <input
                type="range"
                min="3500"
                max="15000"
                step="250"
                value={engineRpm}
                onChange={(e) => setEngineRpm(parseInt(e.target.value))}
                className="w-20 accent-amber-400 cursor-pointer"
              />
              <span className="font-mono text-[11px] text-amber-400 font-bold">{engineRpm} RPM</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const F1Car3DViewport = React.memo(F1Car3DViewportComponent);


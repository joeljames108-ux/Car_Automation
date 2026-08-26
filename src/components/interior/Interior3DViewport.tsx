// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — DEDICATED 3D COCKPIT VIEWPORT
// ============================================================================
// Real-time WebGL canvas rendering the procedural automotive interior:
// - FIRST-PERSON DRIVER SEAT POV & 360° HEAD LOOK-AROUND
// - Orbit & First-Person Controls with Mouse Drag Head Rotation
// - 6 Instant Cinematic Camera Presets (Driver POV, Steering Macro, Console Macro, etc.)
// - Live PBR Shader Reflections and Glowing Canvas Display Screens
// - Day / Night Ambient Lighting Intensity Controller
// ============================================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import {
  MasterInteriorConfiguration,
} from '../../exterior3d/types/interiorStudioTypes';
import {
  MasterInterior3DStudio,
  InteriorCameraViewpoint,
} from '../../exterior3d/generators/interior/masterInterior3DStudio';
import { Eye, Gauge, Compass, Sun, Moon, Maximize2, Sparkles, Sliders, Play, Pause, Crosshair } from 'lucide-react';
import { DriverSeatCameraRig, SeatCameraAnchorId } from '../../exterior3d/generators/interior/driverSeatCameraRig';
import { SeatPositionSelector } from './SeatPositionSelector';

interface Interior3DViewportProps {
  config: MasterInteriorConfiguration;
  wheelbaseMm?: number;
  trackWidthMm?: number;
}

export const Interior3DViewport: React.FC<Interior3DViewportProps> = ({
  config,
  wheelbaseMm = 2850,
  trackWidthMm = 1620,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeViewpoint, setActiveViewpoint] = useState<InteriorCameraViewpoint>('driver_pov');
  const [isNightMode, setIsNightMode] = useState<boolean>(true);

  // Driver Head Rotation State
  const [driverYawDeg, setDriverYawDeg] = useState<number>(0);
  const [driverPitchDeg, setDriverPitchDeg] = useState<number>(0);
  const [isAutoPan, setIsAutoPan] = useState<boolean>(false);
  const [currentGaze, setCurrentGaze] = useState<string>("FORWARD ROAD & CLUSTER");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cockpitGroupRef = useRef<THREE.Group | null>(null);

  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const headYawRef = useRef<number>(0);
  const headPitchRef = useRef<number>(0);
  const targetYawRef = useRef<number>(0);
  const targetPitchRef = useRef<number>(0);
  const cameraRigRef = useRef<DriverSeatCameraRig | null>(null);
  const isDriverSeatModeRef = useRef<boolean>(true);
  const [activeSeatAnchor, setActiveSeatAnchor] = useState<SeatCameraAnchorId>('DRIVER');

  useEffect(() => {
    isDriverSeatModeRef.current = activeViewpoint === 'driver_pov';
  }, [activeViewpoint]);

  // Setup Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? 0x05070d : 0x1e2430);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.05, 50);
    cameraRef.current = camera;

    const initialPose = MasterInterior3DStudio.getCameraPoseForViewpoint(activeViewpoint);
    camera.position.copy(initialPose.position);
    camera.fov = initialPose.fov;
    camera.updateProjectionMatrix();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(initialPose.target);
    controls.maxDistance = 6.0;
    controls.minDistance = 0.15;
    controlsRef.current = controls;

    // 5. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, isNightMode ? 0.35 : 1.2);
    ambientLight.name = "ambient";
    scene.add(ambientLight);

    const domeLight = new THREE.DirectionalLight(0xffffff, isNightMode ? 0.4 : 1.8);
    domeLight.position.set(2, 4, 2);
    scene.add(domeLight);

    const cabinFillLight = new THREE.PointLight(0x38bdf8, isNightMode ? 0.6 : 0.2, 3);
    cabinFillLight.position.set(-0.6, 0.9, 0);
    scene.add(cabinFillLight);

    // 6. Build Initial Cockpit Group
    const cockpit = MasterInterior3DStudio.buildCockpitScene(config, wheelbaseMm, trackWidthMm);
    cockpitGroupRef.current = cockpit;
    scene.add(cockpit);

    // 7. Pointer drag handlers for Driver POV Look-Around
    const handlePointerDown = (e: PointerEvent) => {
      isPointerDownRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isPointerDownRef.current = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDriverSeatModeRef.current || !isPointerDownRef.current) return;
      const deltaX = e.clientX - lastPointerRef.current.x;
      const deltaY = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.25;
      const newYaw = Math.max(-140, Math.min(140, headYawRef.current + deltaX * sensitivity));
      const newPitch = Math.max(-50, Math.min(50, headPitchRef.current - deltaY * sensitivity));

      headYawRef.current = newYaw;
      headPitchRef.current = newPitch;
      targetYawRef.current = newYaw;
      targetPitchRef.current = newPitch;

      setDriverYawDeg(Math.round(newYaw));
      setDriverPitchDeg(Math.round(newPitch));

      if (newPitch > 25) setCurrentGaze("PANORAMIC ROOF");
      else if (newPitch < -15 && newYaw > -20 && newYaw < 20) setCurrentGaze("INSTRUMENT CLUSTER & WHEEL");
      else if (newYaw > 25) setCurrentGaze("CENTER INFOTAINMENT & CONSOLE");
      else if (newYaw < -25) setCurrentGaze("DRIVER DOOR & MIRROR");
      else setCurrentGaze("FORWARD WINDSHIELD & ROAD");
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointermove', handlePointerMove);

    // 8. Animation Loop
    let animId: number;
    let curYaw = 0;
    let curPitch = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (isDriverSeatModeRef.current) {
        controls.enabled = false;

        if (isAutoPan) {
          targetYawRef.current = Math.sin(elapsed * 0.5) * 65;
          targetPitchRef.current = Math.sin(elapsed * 0.7) * 15;
          setDriverYawDeg(Math.round(targetYawRef.current));
          setDriverPitchDeg(Math.round(targetPitchRef.current));
        }

        curYaw += (targetYawRef.current - curYaw) * 0.12;
        curPitch += (targetPitchRef.current - curPitch) * 0.12;

        const eyeX = -0.68;
        const eyeY = 0.88;
        const eyeZ = -0.34;

        camera.position.set(eyeX, eyeY, eyeZ);

        const yawRad = (curYaw * Math.PI) / 180;
        const pitchRad = (curPitch * Math.PI) / 180;

        const dirX = Math.cos(pitchRad) * Math.cos(yawRad);
        const dirY = Math.sin(pitchRad);
        const dirZ = Math.cos(pitchRad) * Math.sin(yawRad);

        camera.lookAt(eyeX + dirX, eyeY + dirY, eyeZ + dirZ);
      } else {
        controls.enabled = true;
        controls.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [isAutoPan]);

  // Update Cockpit Geometry when Config changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (cockpitGroupRef.current) {
      scene.remove(cockpitGroupRef.current);
    }

    const newCockpit = MasterInterior3DStudio.buildCockpitScene(config, wheelbaseMm, trackWidthMm);
    cockpitGroupRef.current = newCockpit;
    scene.add(newCockpit);
  }, [config, wheelbaseMm, trackWidthMm]);

  // Update Background & Ambient Lights on Night Mode Toggle
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.background = new THREE.Color(isNightMode ? 0x05070d : 0x1e2430);
  }, [isNightMode]);

  // Switch Cinematic Camera Viewpoint
  const setViewpoint = (vp: InteriorCameraViewpoint) => {
    setActiveViewpoint(vp);
    setIsAutoPan(false);
    if (!cameraRef.current || !controlsRef.current) return;

    if (vp === 'driver_pov') {
      isDriverSeatModeRef.current = true;
      targetYawRef.current = 0;
      targetPitchRef.current = 0;
      headYawRef.current = 0;
      headPitchRef.current = 0;
      setDriverYawDeg(0);
      setDriverPitchDeg(0);
      setCurrentGaze("FORWARD ROAD & CLUSTER");
    } else {
      isDriverSeatModeRef.current = false;
      const pose = MasterInterior3DStudio.getCameraPoseForViewpoint(vp);
      const camera = cameraRef.current;
      const controls = controlsRef.current;

      camera.position.copy(pose.position);
      controls.target.copy(pose.target);
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
      controls.update();
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl bg-slate-950 border border-amber-500/30">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Driver Crosshair Reticle */}
      {activeViewpoint === 'driver_pov' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-6 h-6 flex items-center justify-center opacity-30">
            <div className="w-1.5 h-1.5 rounded-full border border-amber-300" />
            <div className="absolute w-4 h-px bg-amber-400" />
            <div className="absolute h-4 w-px bg-amber-400" />
          </div>
        </div>
      )}

      {/* Driver Gaze HUD */}
      {activeViewpoint === 'driver_pov' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 shadow-xl pointer-events-none">
          <Eye size={12} className="text-amber-400 animate-pulse" />
          <span>👀 LOOKING AT: {currentGaze}</span>
          <span className="text-slate-400 font-normal">({driverYawDeg}°, {driverPitchDeg}°)</span>
        </div>
      )}

      {/* ── TOP HEADER OVERLAY: CINEMATIC CAMERA VIEWPOINTS & MULTI-SEAT SELECTOR ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Seat Position Selector [ DRIVER ] [ PASSENGER ] [ REAR L ] [ REAR R ] */}
          <SeatPositionSelector
            activeAnchor={activeSeatAnchor}
            seatCount={config.seatCount || 2}
            onSelectAnchor={(anchorId) => {
              setActiveSeatAnchor(anchorId);
              setViewpoint('driver_pov');
            }}
            isAutoPan={isAutoPan}
            onToggleAutoPan={() => setIsAutoPan(!isAutoPan)}
          />

          {/* Camera Viewpoint Selector */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl backdrop-blur-md shadow-lg pointer-events-auto bg-slate-950/85 border border-slate-800">
          <button
            onClick={() => setViewpoint('driver_pov')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeViewpoint === 'driver_pov'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-amber-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye size={13} />
            Driver Seat POV (Look-Around)
          </button>

          <button
            onClick={() => setViewpoint('steering_cluster_macro')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeViewpoint === 'steering_cluster_macro'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gauge size={13} />
            Cluster & Yoke
          </button>

          <button
            onClick={() => setViewpoint('center_console_macro')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeViewpoint === 'center_console_macro'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders size={13} />
            Center Console
          </button>

          <button
            onClick={() => setViewpoint('passenger_pov')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeViewpoint === 'passenger_pov'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass size={13} />
            Passenger POV
          </button>

          <button
            onClick={() => setViewpoint('rear_vip_lounge')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeViewpoint === 'rear_vip_lounge'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles size={13} />
            VIP Lounge
          </button>

            <button
              onClick={() => setViewpoint('overhead_panoramic')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeViewpoint === 'overhead_panoramic'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Maximize2 size={13} />
              Panoramic ISO
            </button>
          </div>
        </div>

        {/* Right Tools: Auto Pan & Day/Night Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-lg pointer-events-auto">
          {activeViewpoint === 'driver_pov' && (
            <button
              onClick={() => setIsAutoPan(!isAutoPan)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isAutoPan ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {isAutoPan ? <Pause size={12} /> : <Play size={12} />}
              <span>{isAutoPan ? 'Scanning' : 'Auto Pan'}</span>
            </button>
          )}

          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isNightMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-amber-500 text-slate-950 shadow-md font-bold'
            }`}
          >
            {isNightMode ? <Moon size={13} /> : <Sun size={13} />}
            {isNightMode ? 'Night RGB' : 'Studio Sun'}
          </button>
        </div>
      </div>

      {/* ── BOTTOM TELEMETRY PILL HUD ── */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs text-slate-300 pointer-events-auto">
          <span className="font-mono text-cyan-400 font-bold">DASH: {config.dashboardClass.replace(/_/g, ' ').toUpperCase()}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-amber-400">STEERING: {config.steeringTypology.replace(/_/g, ' ').toUpperCase()}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-emerald-400">SEATS: {config.seatingClass.replace(/_/g, ' ').toUpperCase()} ({config.seatCount}x)</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-mono text-slate-400">
          <span>{activeViewpoint === 'driver_pov' ? 'DRAG: LOOK AROUND CABIN' : 'ORBIT: DRAG'}</span>
          <span>•</span>
          <span>SCROLL: ZOOM</span>
        </div>
      </div>
    </div>
  );
};

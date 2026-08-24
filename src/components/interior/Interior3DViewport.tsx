// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — DEDICATED 3D COCKPIT VIEWPORT
// ============================================================================
// Real-time WebGL canvas rendering the procedural automotive interior:
// - Orbit & First-Person POV Controls
// - 6 Instant Cinematic Camera Presets (Driver POV, Steering Macro, Console Macro, etc.)
// - Live PBR Shader Reflections and Glowing Canvas Display Screens
// - Day / Night Ambient Lighting Intensity Controller
// ============================================================================

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import {
  MasterInteriorConfiguration,
} from '../../exterior3d/types/interiorStudioTypes';
import {
  MasterInterior3DStudio,
  InteriorCameraViewpoint,
} from '../../exterior3d/generators/interior/masterInterior3DStudio';
import { Eye, Gauge, Compass, Sun, Moon, Maximize2, Sparkles, Sliders } from 'lucide-react';

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

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cockpitGroupRef = useRef<THREE.Group | null>(null);

  // Setup Three.js WebGL Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? 0x05070d : 0x1e2430);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.05, 50);
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

    // 7. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
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
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

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
    if (!cameraRef.current || !controlsRef.current) return;

    const pose = MasterInterior3DStudio.getCameraPoseForViewpoint(vp);
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    camera.position.copy(pose.position);
    controls.target.copy(pose.target);
    camera.fov = pose.fov;
    camera.updateProjectionMatrix();
    controls.update();
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl" style={{backgroundColor: '#FFF8EB', border: '1px solid rgba(217,166,78,0.3)'}}>
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ── TOP HEADER OVERLAY: CINEMATIC CAMERA VIEWPOINTS ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Camera Viewpoint Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl backdrop-blur-md shadow-lg pointer-events-auto" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.3)'}}>
          <button
            onClick={() => setViewpoint('driver_pov')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewpoint === 'driver_pov'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
            }`}
          >
            <Eye size={13} />
            Driver Eyepoint
          </button>

          <button
            onClick={() => setViewpoint('steering_cluster_macro')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewpoint === 'steering_cluster_macro'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
            }`}
          >
            <Gauge size={13} />
            Cluster & Yoke
          </button>

          <button
            onClick={() => setViewpoint('center_console_macro')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewpoint === 'center_console_macro'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
            }`}
          >
            <Sliders size={13} />
            Center Console
          </button>

          <button
            onClick={() => setViewpoint('passenger_pov')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewpoint === 'passenger_pov'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
            }`}
          >
            <Compass size={13} />
            Passenger POV
          </button>

          <button
            onClick={() => setViewpoint('rear_vip_lounge')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewpoint === 'rear_vip_lounge'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
            }`}
          >
            <Sparkles size={13} />
            VIP Lounge
          </button>

          <button
            onClick={() => setViewpoint('overhead_panoramic')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewpoint === 'overhead_panoramic'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/30'
            }`}
          >
            <Maximize2 size={13} />
            Panoramic Cutaway
          </button>
        </div>

        {/* Day / Night Ambience Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto">
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isNightMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-amber-500 text-slate-950 shadow-md'
            }`}
          >
            {isNightMode ? <Moon size={13} /> : <Sun size={13} />}
            {isNightMode ? 'Night Mode (Ambient RGB)' : 'Studio Sunlight'}
          </button>
        </div>
      </div>

      {/* ── BOTTOM TELEMETRY PILL HUD ── */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-xs text-slate-300 pointer-events-auto">
          <span className="font-mono text-cyan-400 font-bold">DASH: {config.dashboardClass.replace(/_/g, ' ').toUpperCase()}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-amber-400">STEERING: {config.steeringTypology.replace(/_/g, ' ').toUpperCase()}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-emerald-400">SEATS: {config.seatingClass.replace(/_/g, ' ').toUpperCase()} ({config.seatCount}x)</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-400">
          <span>ORBIT: L-CLICK + DRAG</span>
          <span>•</span>
          <span>ZOOM: SCROLL</span>
        </div>
      </div>
    </div>
  );
};

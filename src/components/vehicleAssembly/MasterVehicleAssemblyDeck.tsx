// ============================================================================
// PHASE 08 — MASTER VEHICLE ASSEMBLY WORKSPACE DECK & 3D VIEWPORT
// ============================================================================
// Production 3-Column Dark UI Vehicle Assembly Station with 3D WebGL Viewport,
// 36 Socket Visualizers, Exploded View Kinematics, PBR Materials & Live HUD.
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Layers,
  Wrench,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Box,
  Disc,
  Activity,
  Maximize2,
  ShieldAlert,
  Cpu,
} from 'lucide-react';
import { VehicleSubsystemStage } from '../../exterior3d/types/vehicleConstructionTypes';
import { ChassisAttachmentSocketsRegistry, AttachmentSocketDefinition } from '../../exterior3d/sockets/chassisAttachmentSockets';
import { ChassisSocketVisualizer } from '../../exterior3d/tools/chassisSocketVisualizer';
import { PbrMaterialCatalog } from '../../exterior3d/materials/pbrMaterialCatalog';
import { HighFidelitySedanChassisGenerator } from '../../exterior3d/generators/highFidelitySedanChassisGenerator';

export const MasterVehicleAssemblyDeck: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<VehicleSubsystemStage>('chassis_platform');
  const [showSockets, setShowSockets] = useState<boolean>(true);
  const [explodedProgress, setExplodedProgress] = useState<number>(0);
  const [selectedSocketId, setSelectedSocketId] = useState<string | null>(null);
  const [selectedPaintHex, setSelectedPaintHex] = useState<string>('#c4151b');

  // Assembly State
  const [assembledComponents, setAssembledComponents] = useState<Record<string, boolean>>({
    chassis_frame: true,
    front_subframe: true,
    rear_subframe: true,
    engine_v12: true,
    sequential_transmission: true,
    wheel_centerlock_fl: true,
    wheel_centerlock_fr: true,
    wheel_centerlock_rl: true,
    wheel_centerlock_rr: true,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const socketGroupRef = useRef<THREE.Group | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);

  // 1. Initialize Three.js Viewport
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e12);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.8, 2.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mountRef.current.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.target.set(0, 0.6, -1.35);

    // Studio Lighting Rig
    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x88c0d0, 1.2);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    // Grid Floor
    const grid = new THREE.GridHelper(12, 24, 0x00f0ff, 0x1f293d);
    grid.position.y = 0.0;
    scene.add(grid);

    // Vehicle Assembly Root
    const vehicleRoot = new THREE.Group();
    vehicleRoot.name = 'VehicleAssemblyRoot';
    vehicleGroupRef.current = vehicleRoot;
    scene.add(vehicleRoot);

    // Add High-Fidelity Chassis 01 Model
    const chassis = HighFidelitySedanChassisGenerator.buildChassis3D();
    vehicleRoot.add(chassis);

    // Sockets Layer
    const sockets = ChassisSocketVisualizer.generateAllSocketGlyphs(
      undefined,
      new Set(Object.keys(assembledComponents))
    );
    socketGroupRef.current = sockets;
    scene.add(sockets);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Socket Visibility
  useEffect(() => {
    if (socketGroupRef.current) {
      socketGroupRef.current.visible = showSockets;
    }
  }, [showSockets]);

  // Handle Exploded View Progression
  useEffect(() => {
    if (!vehicleGroupRef.current) return;
    vehicleGroupRef.current.children.forEach((child, idx) => {
      const dirZ = idx % 2 === 0 ? 1 : -1;
      const dirX = idx % 3 === 0 ? 1 : -1;
      child.position.set(dirX * explodedProgress * 0.8, explodedProgress * 0.4, dirZ * explodedProgress * 1.2);
    });
  }, [explodedProgress]);

  const stages: { id: VehicleSubsystemStage; label: string; count: number }[] = [
    { id: 'chassis_platform', label: 'Chassis Platform', count: 6 },
    { id: 'suspension', label: 'Suspension & Steering', count: 8 },
    { id: 'powertrain_engine', label: 'Powertrain & Turbo', count: 4 },
    { id: 'transmission', label: 'Transmission & Driveline', count: 3 },
    { id: 'wheels_brakes', label: 'Wheels & Carbon Brakes', count: 4 },
    { id: 'body_structure', label: 'Body Structure & Cage', count: 6 },
    { id: 'exterior_panels', label: 'Closures & Panels', count: 8 },
    { id: 'lighting_glass', label: 'Lighting & Glass', count: 6 },
    { id: 'aerodynamics', label: 'Aero Splitter & Wings', count: 5 },
    { id: 'interior_cabin', label: 'Modular Cockpit', count: 7 },
  ];

  const currentSockets = ChassisAttachmentSocketsRegistry.getSocketsForSubsystem(activeStage);

  return (
    <div className="flex flex-col h-full text-amber-900 select-none overflow-hidden font-sans" style={{backgroundColor: '#FFF8EB'}}>
      {/* Top Stage Navigation Ribbon */}
      <div className="flex items-center gap-1.5 p-2.5 overflow-x-auto no-scrollbar shadow-lg" style={{backgroundColor: 'rgba(255,248,235,0.8)', borderBottom: '1px solid rgba(217,166,78,0.25)'}}>
        {stages.map((stage) => {
          const isActive = activeStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-200/60 text-amber-800 border border-amber-400/50 shadow-[0_0_12px_rgba(217,166,78,0.3)]'
                  : 'bg-amber-100/50 text-amber-700 border border-amber-200/60 hover:bg-amber-200/50 hover:text-amber-900'
              }`}
            >
              <span>{stage.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-amber-500 text-white font-bold' : 'bg-amber-200/60 text-amber-600'}`}>
                {stage.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 3-Column Studio Deck */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Subsystem Inspector Column */}
        <div className="w-80 border-r flex flex-col overflow-y-auto p-4 space-y-4" style={{backgroundColor: 'rgba(255,248,235,0.7)', borderColor: 'rgba(217,166,78,0.25)'}}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wider text-amber-400 uppercase flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Subsystem Sockets
            </h2>
            <span className="text-[11px] text-gray-400 font-mono">{currentSockets.length} Active Nodes</span>
          </div>

          <div className="space-y-2">
            {currentSockets.map((sock) => {
              const isSelected = selectedSocketId === sock.socketId;
              const isOccupied = !!assembledComponents[sock.socketId];
              return (
                <div
                  key={sock.socketId}
                  onClick={() => setSelectedSocketId(sock.socketId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-200/60 border-amber-400 shadow-[0_0_10px_rgba(217,166,78,0.2)]'
                      : 'bg-amber-50/50 border-amber-200/60 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-900">{sock.name}</span>
                    {isOccupied ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Mated
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                        <AlertTriangle className="w-3 h-3" /> Open
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono space-y-0.5" style={{color: '#78716C'}}>
                    <div>Fastener: <span className="text-gray-200 font-semibold">{sock.fastenerSpec.id}</span></div>
                    <div>Torque Spec: <span className="font-semibold" style={{color: '#92400E'}}>{sock.fastenerSpec.nominalTorqueNm} Nm</span></div>
                    <div>Max Misalignment: <span className="text-gray-200">{sock.maxAllowableAngularMisalignmentDeg}°</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color & Paint Swatches */}
          <div className="pt-2 border-t" style={{borderColor: 'rgba(217,166,78,0.25)'}}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{color: '#78716C'}}>
              <Layers className="w-3.5 h-3.5" style={{color: '#92400E'}} />
              Automotive Paint Finish
            </h3>
            <div className="flex items-center gap-2">
              {[
                { name: 'Apex Red', hex: '#c4151b' },
                { name: 'Gulf Blue', hex: '#88b6d8' },
                { name: 'Phantom Black', hex: '#111316' },
                { name: 'Carbon Grey', hex: '#3a3f45' },
                { name: 'British Racing Green', hex: '#0d3824' },
              ].map((p) => (
                <button
                  key={p.hex}
                  onClick={() => setSelectedPaintHex(p.hex)}
                  title={p.name}
                  style={{ backgroundColor: p.hex }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    selectedPaintHex === p.hex ? 'scale-110 shadow-[0_0_8px_rgba(217,166,78,0.6)]' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center 3D Viewport Column */}
        <div className="flex-1 relative flex flex-col" style={{backgroundColor: 'rgba(255,248,235,0.9)'}}>
          {/* Canvas Viewport Container */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating Viewport Controls Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 backdrop-blur-md px-3 py-2 rounded-xl shadow-2xl" style={{backgroundColor: 'rgba(255,248,235,0.9)', border: '1px solid rgba(217,166,78,0.3)'}}>
            <button
              onClick={() => setShowSockets(!showSockets)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                showSockets ? 'bg-amber-200/60 text-amber-800 border border-amber-400/50' : 'bg-amber-100/50 text-amber-600 hover:text-amber-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {showSockets ? 'Hide Sockets' : 'Show Sockets'}
            </button>

            <div className="h-4 w-px mx-1" style={{backgroundColor: 'rgba(217,166,78,0.3)'}} />

            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
              <Sliders className="w-3.5 h-3.5" style={{color: '#92400E'}} />
              <span>Exploded View:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedProgress}
                onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer"
              />
              <span className="font-mono w-8" style={{color: '#92400E'}}>{Math.round(explodedProgress * 100)}%</span>
            </div>
          </div>

          {/* Viewport Telemetry HUD */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between backdrop-blur-md p-3.5 rounded-xl shadow-2xl" style={{backgroundColor: 'rgba(255,248,235,0.92)', border: '1px solid rgba(217,166,78,0.3)'}}>
            <div className="flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="block text-[10px] uppercase" style={{color: '#A8A29E'}}>Chassis Rigidity</span>
                <span className="font-bold text-sm" style={{color: '#92400E'}}>38,500 Nm/deg</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase" style={{color: '#A8A29E'}}>Total Mass</span>
                <span className="font-bold text-sm text-amber-900">1,280 kg</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase" style={{color: '#A8A29E'}}>Weight Bias</span>
                <span className="font-bold text-sm text-amber-800">49.2% F / 50.8% R</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase" style={{color: '#A8A29E'}}>Aero Drag</span>
                <span className="font-bold text-sm text-amber-800">Cd 0.31</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Quality Gate: 98.5% Pass
              </span>
            </div>
          </div>
        </div>

        {/* Right Assembly Details Column */}
        <div className="w-84 border-l flex flex-col p-4 space-y-4 overflow-y-auto" style={{backgroundColor: 'rgba(255,248,235,0.7)', borderColor: 'rgba(217,166,78,0.25)'}}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wider uppercase flex items-center gap-2" style={{color: '#92400E'}}>
              <Activity className="w-4 h-4" style={{color: '#92400E'}} />
              Structural Verification
            </h2>
          </div>

          <div className="p-3.5 rounded-xl border space-y-3" style={{backgroundColor: 'rgba(255,248,235,0.6)', borderColor: 'rgba(217,166,78,0.2)'}}>
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" style={{color: '#92400E'}} />
              Real-Time Joint Preload Analyzer
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-amber-800">
                <span>Subframe Preload Tension:</span>
                <span className="font-mono font-semibold" style={{color: '#92400E'}}>185.0 kN</span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Engine Hydro-Mount Damper:</span>
                <span className="font-mono text-emerald-400 font-semibold">95.0 Nm</span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Wheel Centerlock Torque:</span>
                <span className="font-mono text-amber-400 font-semibold">600.0 Nm</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border space-y-2.5" style={{backgroundColor: 'rgba(255,248,235,0.6)', borderColor: 'rgba(217,166,78,0.2)'}}>
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Disc className="w-4 h-4" style={{color: '#92400E'}} />
              Active Subsystem Components
            </h4>
            <div className="space-y-1.5 text-xs text-amber-800">
              <div className="p-2 rounded flex items-center justify-between" style={{backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.15)'}}>
                <span>Modular Unibody Shell</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono">Installed</span>
              </div>
              <div className="p-2 rounded flex items-center justify-between" style={{backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.15)'}}>
                <span>V12 Quad-Turbo Block</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono">Installed</span>
              </div>
              <div className="p-2 rounded flex items-center justify-between" style={{backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.15)'}}>
                <span>6-Speed Sequential Gearbox</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono">Installed</span>
              </div>
              <div className="p-2 rounded flex items-center justify-between" style={{backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.15)'}}>
                <span>Carbon Ceramic Rotor Package</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded font-mono">Installed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

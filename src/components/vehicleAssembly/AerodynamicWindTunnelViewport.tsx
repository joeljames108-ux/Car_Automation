// ============================================================================
// PHASE 14 — AERODYNAMIC WIND TUNNEL 3D VIEWPORT & TELEMETRY DECK
// ============================================================================
// High-contrast Three.js aerodynamic visualization studio with particle
// streamlines, velocity gradient vectors, surface pressure heatmaps, and aero HUD.
// ============================================================================

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Wind,
  Gauge,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
} from 'lucide-react';
import {
  CFDWindTunnelSimulator,
  WindTunnelState,
  AerodynamicForcesResult,
} from '../../sim/aerodynamics/cfdWindTunnelSimulator';
import { HighFidelitySedanChassisGenerator } from '../../exterior3d/generators/highFidelitySedanChassisGenerator';

export const AerodynamicWindTunnelViewport: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [airspeedKmh, setAirspeedKmh] = useState<number>(200);
  const [rearWingAngleDeg, setRearWingAngleDeg] = useState<number>(8);
  const [rideHeightFrontMm, setRideHeightFrontMm] = useState<number>(110);
  const [rideHeightRearMm, setRideHeightRearMm] = useState<number>(130);

  const [aeroResults, setAeroResults] = useState<AerodynamicForcesResult | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene & Camera Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080e);
    scene.fog = new THREE.FogExp2(0x06080e, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(4.5, 2.2, 4.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.5, -0.6);

    // 2. Wind Tunnel Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xec4899, 1.8);
    rimLight.position.set(-5, 3, -6);
    scene.add(rimLight);

    // 3. Ground Plane with Wind Tunnel Floor Markings
    const grid = new THREE.GridHelper(12, 24, 0x00f0ff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // 4. Vehicle 3D Model
    const vehicle = HighFidelitySedanChassisGenerator.buildChassis3D();
    scene.add(vehicle);

    // 5. Streamlines Container Group
    const streamlinesGroup = new THREE.Group();
    streamlinesGroup.name = 'StreamlinesGroup';
    scene.add(streamlinesGroup);

    // 6. Particle Cloud for Dynamic Wind Flow
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 2.2;
      particlePositions[i * 3 + 1] = 0.1 + Math.random() * 1.5;
      particlePositions[i * 3 + 2] = 3.5 - Math.random() * 7.0;
      particleVelocities[i] = 1.0 + Math.random() * 0.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Update Streamlines Geometry Function
    const updateStreamlinesMesh = (results: AerodynamicForcesResult) => {
      while (streamlinesGroup.children.length > 0) {
        const obj = streamlinesGroup.children.pop();
        if (obj instanceof THREE.Line) {
          obj.geometry.dispose();
        }
      }

      for (const sl of results.streamlines) {
        const points = sl.points.map((p) => p.position);
        const curve = new THREE.CatmullRomCurve3(points);
        const curvePoints = curve.getPoints(40);
        const geom = new THREE.BufferGeometry().setFromPoints(curvePoints);

        const lineMat = new THREE.LineBasicMaterial({
          color: sl.points[15]?.pressureCp < -0.5 ? 0xef4444 : 0x00f0ff,
          transparent: true,
          opacity: 0.6,
          linewidth: 1.5,
        });

        const line = new THREE.Line(geom, lineMat);
        streamlinesGroup.add(line);
      }
    };

    // Initial Aero Solve
    const initRes = CFDWindTunnelSimulator.solveAerodynamics({
      airspeedKmh,
      airDensityKgPerM3: 1.225,
      ambientTempC: 20,
      yawAngleDeg: 0,
      rideHeightFrontMm,
      rideHeightRearMm,
      rearWingAngleDeg,
    });
    setAeroResults(initRes);
    updateStreamlinesMesh(initRes);

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isPlaying) {
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        const speedFactor = (airspeedKmh / 200) * 0.08;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 2] -= speedFactor * particleVelocities[i]; // Move downstream (-Z)

          if (arr[i * 3 + 2] < -3.8) {
            arr[i * 3 + 2] = 3.5;
            arr[i * 3 + 0] = (Math.random() - 0.5) * 2.2;
            arr[i * 3 + 1] = 0.1 + Math.random() * 1.5;
          }
        }
        posAttr.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [airspeedKmh, rearWingAngleDeg, rideHeightFrontMm, rideHeightRearMm, isPlaying]);

  return (
    <div className="flex flex-col h-full bg-[#080b12] text-gray-100 font-sans border border-[#1b2333] rounded-2xl overflow-hidden shadow-2xl">
      {/* Wind Tunnel Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#0d121c] border-b border-[#1b2333]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100">
              Virtual CFD Aerodynamic Wind Tunnel & Streamline Visualizer
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">
              Incompressible Navier-Stokes Boundary Layer & Ground Effect Solver
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141a26] hover:bg-[#1c2436] text-xs font-semibold border border-[#273248] transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {isPlaying ? 'Pause Flow' : 'Resume Flow'}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport & HUD Overlay */}
      <div className="flex flex-1 overflow-hidden relative">
        <div ref={mountRef} className="flex-1 w-full h-full" />

        {/* Aerodynamic Telemetry HUD Overlay */}
        {aeroResults && (
          <div className="absolute top-4 left-4 flex flex-col gap-2.5 bg-[#0b0f19]/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 shadow-2xl w-72 text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="font-bold text-gray-200 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Aero Telemetry
              </span>
              <span className="font-mono text-cyan-400 font-bold">{airspeedKmh} km/h</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Downforce:</span>
                <span className="font-mono font-bold text-emerald-400">{aeroResults.totalDownforceN} N ({(aeroResults.totalDownforceN / 9.81).toFixed(0)} kg)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Aero Drag:</span>
                <span className="font-mono font-bold text-rose-400">{aeroResults.totalDragN} N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aero Balance (Front):</span>
                <span className="font-mono font-bold text-cyan-400">{aeroResults.aeroBalanceFrontPct}% F / {(100 - aeroResults.aeroBalanceFrontPct).toFixed(1)}% R</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Lift-to-Drag (L/D):</span>
                <span className="font-mono font-bold text-amber-400">{aeroResults.liftToDragRatio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ground Effect Suction:</span>
                <span className="font-mono font-bold text-purple-400">{aeroResults.groundEffectSuctionN} N</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Wind Tunnel Controls Panel */}
        <div className="w-80 bg-[#0c1018] border-l border-[#1b2333] p-4 flex flex-col space-y-4 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Tunnel Environmental Controls
          </h4>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Tunnel Airspeed:</span>
                <span className="font-mono text-cyan-400 font-bold">{airspeedKmh} km/h</span>
              </div>
              <input
                type="range"
                min="50"
                max="350"
                step="5"
                value={airspeedKmh}
                onChange={(e) => setAirspeedKmh(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Rear Wing Angle:</span>
                <span className="font-mono text-cyan-400 font-bold">{rearWingAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={rearWingAngleDeg}
                onChange={(e) => setRearWingAngleDeg(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Front Ride Height:</span>
                <span className="font-mono text-cyan-400 font-bold">{rideHeightFrontMm} mm</span>
              </div>
              <input
                type="range"
                min="60"
                max="160"
                step="5"
                value={rideHeightFrontMm}
                onChange={(e) => setRideHeightFrontMm(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Rear Ride Height:</span>
                <span className="font-mono text-cyan-400 font-bold">{rideHeightRearMm} mm</span>
              </div>
              <input
                type="range"
                min="70"
                max="180"
                step="5"
                value={rideHeightRearMm}
                onChange={(e) => setRideHeightRearMm(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

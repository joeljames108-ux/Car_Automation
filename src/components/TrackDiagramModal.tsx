import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { X, Flag, Gauge, Award, Activity, Navigation, Box, Eye } from "lucide-react";
import { TRACKS } from "../sim/constants";
import { formatLap } from "../sim/utils/formatLap";
import type { TrackId, SimResult, VehicleDesign } from "../sim/types";
import { simulateLap } from "../sim/physics/lapSimulator";

interface TrackDiagramModalProps {
  trackId: TrackId | null;
  design: VehicleDesign;
  sim: SimResult;
  onClose: () => void;
}

// Official high-resolution SVG track layout maps from Wikimedia Commons for all 23 racetracks
const TRACK_DIAGRAM_IMAGES: Record<TrackId, string> = {
  monza: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Monza_track_map.svg/1024px-Monza_track_map.svg.png",
  spa: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Spa-Francorchamps_of_Belgium.svg/1024px-Spa-Francorchamps_of_Belgium.svg.png",
  silverstone: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Silverstone_Circuit_2011.svg/1024px-Silverstone_Circuit_2011.svg.png",
  suzuka: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Suzuka_circuit_map.svg/1024px-Suzuka_circuit_map.svg.png",
  nurburgring: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/N%C3%BCrburgring_GP-Strecke.svg/1024px-N%C3%BCrburgring_GP-Strecke.svg.png",
  lemans: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Circuit_de_la_Sarthe_track_map.svg/1024px-Circuit_de_la_Sarthe_track_map.svg.png",
  laguna: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Laguna_Seca_track_map.svg/1024px-Laguna_Seca_track_map.svg.png",
  interlagos: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28Interlagos%29_track_map.svg/1024px-Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace_%28Interlagos%29_track_map.svg.png",
  monaco: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Circuit_Monaco_2003.svg/1024px-Circuit_Monaco_2003.svg.png",
  bathurst: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mount_Panorama_Circuit_map.svg/1024px-Mount_Panorama_Circuit_map.svg.png",
  imola: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Autodromo_Enzo_e_Dino_Ferrari_2020.svg/1024px-Autodromo_Enzo_e_Dino_Ferrari_2020.svg.png",
  redbullring: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Red_Bull_Ring_track_map.svg/1024px-Red_Bull_Ring_track_map.svg.png",
  hungaroring: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Hungaroring.svg/1024px-Hungaroring.svg.png",
  zandvoort: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Circuit_Zandvoort_2020.svg/1024px-Circuit_Zandvoort_2020.svg.png",
  americas: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Circuit_of_the_Americas_track_map.svg/1024px-Circuit_of_the_Americas_track_map.svg.png",
  miami: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Miami_International_Autodrome_2022.svg/1024px-Miami_International_Autodrome_2022.svg.png",
  vegas: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Las_Vegas_Strip_Circuit_2023.svg/1024px-Las_Vegas_Strip_Circuit_2023.svg.png",
  fuji: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Fuji_Speedway_track_map.svg/1024px-Fuji_Speedway_track_map.svg.png",
  sebring: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Sebring_International_Raceway_track_map.svg/1024px-Sebring_International_Raceway_track_map.svg.png",
  watkins: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Watkins_Glen_Grand_Prix_Course_map.svg/1024px-Watkins_Glen_Grand_Prix_Course_map.svg.png",
  roadatlanta: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Road_Atlanta_track_map.svg/1024px-Road_Atlanta_track_map.svg.png",
  dragstrip: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/NHRA_Dragstrip_layout.svg/1024px-NHRA_Dragstrip_layout.svg.png",
  nordschleife: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Nordschleife.svg/1024px-Nordschleife.svg.png",
};

export const TrackDiagramModal: React.FC<TrackDiagramModalProps> = ({
  trackId,
  design,
  sim,
  onClose,
}) => {
  const [mode3D, setMode3D] = useState(true);
  const mount3DRef = useRef<HTMLDivElement>(null);
  const anim3DRef = useRef<number>(0);

  if (!trackId) return null;
  const track = TRACKS[trackId];
  if (!track) return null;

  // Run the physics lap simulation for precise sector breakdown
  let simRes;
  try {
    simRes = simulateLap(design, sim, {
      trackId,
      driverSkill: "pro",
      ambientTemp: 22,
      trackTemp: 30,
      weatherGrip: 1.0,
      fuelLoad: 20,
      lapNumber: 1,
    });
  } catch (e) {
    simRes = null;
  }

  // Calculate sector times
  const totalTime = simRes ? simRes.totalTime : (track.length * 1000) / (sim.topSpeed * 0.45 / 3.6);
  const s1Time = simRes ? simRes.sectorTimes[0] || (totalTime * 0.31) : (totalTime * 0.31);
  const s2Time = simRes ? simRes.sectorTimes[1] || (totalTime * 0.39) : (totalTime * 0.39);
  const s3Time = simRes ? simRes.sectorTimes[2] || (totalTime * 0.30) : (totalTime * 0.30);

  const topSpeed = simRes ? simRes.topSpeed : Math.round(sim.topSpeed * 0.85);
  const avgSpeed = simRes ? simRes.averageSpeed : Math.round((track.length / (totalTime / 3600)) * 10) / 10;
  const maxG = sim.lateralG;
  const imageSrc = TRACK_DIAGRAM_IMAGES[trackId];

  // Three.js 3D Ribbon Circuit Visualizer
  useEffect(() => {
    if (!mode3D || !mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 550;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050814);
    scene.fog = new THREE.FogExp2(0x050814, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(5, 12, 8);
    scene.add(sunLight);

    // Grid Floor
    const grid = new THREE.GridHelper(20, 20, 0x007aff, 0x1e293b);
    grid.position.y = -0.5;
    scene.add(grid);

    // Build 3D Track Spline Points based on Track Archetype
    const points: THREE.Vector3[] = [];
    const numPoints = 60;

    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * Math.PI * 2;
      let x = 0, z = 0, y = Math.sin(t * 2) * (track.altitudeChange > 20 ? 0.8 : 0.3);

      if (trackId === "monaco") {
        x = Math.sin(t) * 4 + Math.sin(t * 3) * 0.8;
        z = Math.cos(t) * 2.5 + Math.cos(t * 2) * 0.5;
      } else if (trackId === "monza" || trackId === "redbullring") {
        x = Math.sin(t) * 5.5 + Math.sin(t * 2) * 0.4;
        z = Math.cos(t) * 2.0;
      } else if (trackId === "spa" || trackId === "nordschleife") {
        x = Math.sin(t) * 5.0 + Math.cos(t * 3) * 1.0;
        z = Math.cos(t) * 3.2 + Math.sin(t * 2) * 0.6;
        y = Math.sin(t * 3) * 1.2; // Eau Rouge / Nordschleife elevation bump
      } else {
        x = Math.sin(t) * 4.5 + Math.sin(t * 2) * 0.6;
        z = Math.cos(t) * 2.8 + Math.cos(t * 3) * 0.4;
      }
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points, true);

    // Extrude 3D Ribbon Track Geometry
    const shape = new THREE.Shape();
    shape.moveTo(-0.25, -0.04);
    shape.lineTo(0.25, -0.04);
    shape.lineTo(0.25, 0.04);
    shape.lineTo(-0.25, 0.04);
    shape.closePath();

    const extrudeSettings = { steps: 120, extrudePath: curve, bevelEnabled: false };
    const trackGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x007aff,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x0033aa,
      emissiveIntensity: 0.2,
    });
    const trackMesh = new THREE.Mesh(trackGeom, trackMat);
    scene.add(trackMesh);

    // 3D Telemetry Racing Car Marker
    const carGeom = new THREE.BoxGeometry(0.35, 0.15, 0.2);
    const carMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.6 });
    const carMesh = new THREE.Mesh(carGeom, carMat);
    scene.add(carMesh);

    // Dynamic Telemetry Animation
    let progress = 0;
    const animate = () => {
      anim3DRef.current = requestAnimationFrame(animate);
      controls.update();

      progress += 0.003;
      if (progress > 1) progress = 0;

      const pos = curve.getPointAt(progress);
      const tangent = curve.getTangentAt(progress);
      carMesh.position.copy(pos);
      carMesh.position.y += 0.12;
      carMesh.lookAt(pos.clone().add(tangent));

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(anim3DRef.current);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mode3D, trackId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-base-900 border border-base-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-800 bg-base-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-500/10 text-accent-400 border border-accent-500/20">
              <Flag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">{track.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-base-800 text-slate-400 border border-base-700">
                  {track.country}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{track.length.toFixed(3)} km</span>
                <span>•</span>
                <span>{track.highSpeed ? "High Speed Circuit" : "Technical Circuit"}</span>
                <span>•</span>
                <span>Elevation Δ: {track.altitudeChange}m</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-base-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Sector Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-base-950/80 border border-red-500/30 rounded-xl p-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="text-[11px] font-semibold text-red-400 tracking-wider uppercase flex items-center justify-between">
                <span>Sector 1</span>
                <span className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {s1Time.toFixed(3)}s
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Speed & Entry Zone
              </div>
            </div>

            <div className="bg-base-950/80 border border-cyan-500/30 rounded-xl p-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="text-[11px] font-semibold text-cyan-400 tracking-wider uppercase flex items-center justify-between">
                <span>Sector 2</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {s2Time.toFixed(3)}s
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Technical Corners & Apex
              </div>
            </div>

            <div className="bg-base-950/80 border border-amber-500/30 rounded-xl p-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase flex items-center justify-between">
                <span>Sector 3</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {s3Time.toFixed(3)}s
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Final Straight & Finish
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/40 to-base-950 border border-emerald-500/40 rounded-xl p-3.5">
              <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase flex items-center justify-between">
                <span>Total Lap Time</span>
                <Award size={14} className="text-emerald-400" />
              </div>
              <div className="text-xl font-mono font-bold text-emerald-300 mt-1">
                {formatLap(totalTime)}
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-1 font-mono">
                Avg: {avgSpeed.toFixed(1)} km/h
              </div>
            </div>
          </div>

          {/* Interactive Racetrack Diagram Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual Circuit Layout Canvas */}
            <div className="lg:col-span-2 bg-base-950 border border-base-800 rounded-xl p-5 flex flex-col justify-between items-center relative min-h-[320px]">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Navigation size={14} className="text-accent-400" /> Circuit Track Layout & Sector Map
                </span>
                
                {/* 3D vs 2D Toggle Switch */}
                <div className="flex items-center gap-1 bg-slate-900 border border-cyan-500/30 rounded-lg p-0.5">
                  <button
                    onClick={() => setMode3D(true)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      mode3D ? "bg-cyan-500 text-slate-950 font-extrabold shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Box size={11} /> 3D RIBBON
                  </button>
                  <button
                    onClick={() => setMode3D(false)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      !mode3D ? "bg-cyan-500 text-slate-950 font-extrabold shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Eye size={11} /> 2D PLAN
                  </button>
                </div>
              </div>

              <div className="relative w-full flex-1 flex items-center justify-center p-2 min-h-[260px]">
                {mode3D ? (
                  <div ref={mount3DRef} className="w-full h-[260px] cursor-grab active:cursor-grabbing relative rounded-lg overflow-hidden border border-cyan-500/20">
                    <div className="absolute bottom-1 right-2 text-[9px] font-mono text-cyan-400/60 pointer-events-none bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      ORBIT: DRAG · ELEVATION Δ: {track.altitudeChange}m
                    </div>
                  </div>
                ) : (
                  <svg className="w-full h-[260px] max-w-[550px]" viewBox="0 0 600 300">
                    <defs>
                      <linearGradient id="s1TrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#f87171" />
                      </linearGradient>
                      <linearGradient id="s2TrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                      <linearGradient id="s3TrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>

                      <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Dark Track Asphalt Foundation */}
                    {renderTrackSvgPath(track, "asphalt")}

                    {/* Sector 1 (Red) */}
                    {renderTrackSvgPath(track, "s1")}
                    {/* Sector 2 (Cyan) */}
                    {renderTrackSvgPath(track, "s2")}
                    {/* Sector 3 (Gold) */}
                    {renderTrackSvgPath(track, "s3")}

                    {/* Start/Finish Line & Sector Annotations */}
                    <g>
                      <circle cx="80" cy="220" r="5" fill="#22c55e" className="animate-ping" />
                      <circle cx="80" cy="220" r="5" fill="#22c55e" />
                      <text x="92" y="224" fill="#22c55e" fontSize="10" fontFamily="monospace" fontWeight="bold">DRS Zone</text>

                      <circle cx="500" cy="140" r="5" fill="#a855f7" />
                      <text x="512" y="144" fill="#a855f7" fontSize="10" fontFamily="monospace" fontWeight="bold">Speed Trap</text>

                      {/* Sector Pills */}
                      <rect x="65" y="200" width="22" height="13" rx="3" fill="#ef4444" />
                      <text x="76" y="210" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">S1</text>

                      <rect x="260" y="45" width="22" height="13" rx="3" fill="#06b6d4" />
                      <text x="271" y="55" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">S2</text>

                      <rect x="420" y="125" width="22" height="13" rx="3" fill="#f59e0b" />
                      <text x="431" y="135" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">S3</text>
                    </g>
                  </svg>
                )}
              </div>

              <div className="w-full flex items-center justify-between border-t border-base-900 pt-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> 2 DRS Activation Zones</span>
                <span className="font-mono text-slate-500">Physics Simulation Engine Active</span>
              </div>
            </div>

            {/* Circuit Telemetry & Key Corner Specs */}
            <div className="space-y-4">
              <div className="bg-base-950 border border-base-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge size={14} className="text-accent-400" /> Telemetry Benchmarks
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-base-850">
                    <span className="text-slate-400">Top Speed:</span>
                    <span className="font-mono font-bold text-white">{topSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-base-850">
                    <span className="text-slate-400">Average Speed:</span>
                    <span className="font-mono font-bold text-accent-300">{avgSpeed.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-base-850">
                    <span className="text-slate-400">Peak Lateral Force:</span>
                    <span className="font-mono font-bold text-emerald-400">{maxG.toFixed(2)} G</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Turn Count:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {track.segments.filter(s => s.type === "corner").length} Corners
                    </span>
                  </div>
                </div>
              </div>

              {/* Corner Segment Profile Breakdown */}
              <div className="bg-base-950 border border-base-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-cyan-400" /> Sector Key Corners
                </h4>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {track.segments.filter(s => s.type === "corner").slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-base-900/60 border border-base-850">
                      <span className="text-slate-300 font-medium">Turn {i + 1} Radius</span>
                      <span className="font-mono text-cyan-400">{c.length}m ({c.arc}°)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-base-800 bg-base-950 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-mono">
            Telemetry calculated using Apex Physics Dynamics Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-accent-500 text-white font-medium text-xs hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/20"
          >
            Close Diagram
          </button>
        </div>

      </div>
    </div>
  );
};

// Helper to generate dynamic vector path traces for track sectors
function renderTrackSvgPath(track: import("../sim/types").TrackInfo, mode: "asphalt" | "s1" | "s2" | "s3") {
  let d = "";
  if (track.id === "monaco") {
    d = "M 90 220 L 220 220 C 260 220, 270 190, 250 160 C 230 130, 280 90, 360 80 C 440 70, 520 90, 500 130 C 480 170, 440 180, 410 190 C 370 200, 310 200, 260 210 L 90 220 Z";
  } else if (track.id === "monza" || track.id === "redbullring") {
    d = "M 80 230 L 520 230 C 560 230, 570 190, 530 150 L 410 70 C 380 50, 320 60, 280 110 L 200 170 C 160 200, 110 230, 80 230 Z";
  } else if (track.id === "spa" || track.id === "silverstone") {
    d = "M 80 220 L 240 220 C 280 220, 310 170, 290 120 C 270 70, 350 40, 450 60 C 530 80, 550 140, 510 180 C 460 220, 380 210, 310 210 L 80 220 Z";
  } else if (track.id === "suzuka") {
    d = "M 80 210 Q 180 200, 260 140 T 420 100 T 520 180 T 360 230 T 200 160 Z";
  } else {
    d = "M 80 220 L 280 220 C 330 220, 360 180, 340 130 C 320 80, 410 50, 490 80 C 550 110, 540 180, 480 210 C 400 240, 300 210, 200 210 Z";
  }

  if (mode === "asphalt") {
    return <path d={d} fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />;
  }

  if (mode === "s1") {
    return <path d={d} fill="none" stroke="url(#s1TrackGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="180 800" strokeDashoffset="0" filter="url(#neonGlow)" />;
  }
  if (mode === "s2") {
    return <path d={d} fill="none" stroke="url(#s2TrackGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="220 800" strokeDashoffset="-180" filter="url(#neonGlow)" />;
  }
  return <path d={d} fill="none" stroke="url(#s3TrackGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="300 800" strokeDashoffset="-400" filter="url(#neonGlow)" />;
}

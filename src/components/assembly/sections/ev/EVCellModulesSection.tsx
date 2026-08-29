// ===================================================================
// APEX ENGINE BUILDER — EV STAGE 2: CELL MODULES SECTION (PHASE 9)
// 800V High-Density Cell Arrays, Series/Parallel Strings & Cathode Tech
// ===================================================================

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Battery, Layers, Activity, Zap, Flame, Box, RefreshCw } from "lucide-react";
import { SectionCard } from "../../SectionCard";
import { MaterialGradePicker } from "../../MaterialGradePicker";
import { StatDeltasPanel } from "../../StatDeltasPanel";
import { InstallButton } from "../../InstallButton";
import { EngineConfig, SimResult } from "../../../../sim/types";
import {
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
} from "../../../../sim/assemblyTypes";

interface EVCellModulesSectionProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  componentMeta?: AssemblyComponentMeta;
  selectedVariant: MaterialGrade;
  isInstalled: boolean;
  isInstalling: boolean;
  canInstall: boolean;
  phase: AssemblyPhase;
  currentTotalStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  updateEngine: (updates: Partial<EngineConfig>) => void;
  onSelectVariant: (variant: MaterialGrade) => void;
  onInstall: () => void;
  onSkipAnimation?: () => void;
  onNext?: () => void;
  className?: string;
}

export function EVCellModulesSection({
  engineConfig,
  sim,
  componentMeta,
  selectedVariant,
  isInstalled,
  isInstalling,
  canInstall,
  phase,
  currentTotalStats,
  updateEngine,
  onSelectVariant,
  onInstall,
  onSkipAnimation,
  onNext,
  className = "",
}: EVCellModulesSectionProps) {
  const capacity = engineConfig.batteryCapacity || 90;
  const estimatedCells = Math.round(capacity * 48);

  const [cRate, setCRate] = useState(4.0); // 1.0C to 8.0C launch discharge
  const [explodedFactor, setExplodedFactor] = useState(0); // 0 (Assembled) to 1 (Exploded)
  const mount3DRef = useRef<HTMLDivElement>(null);
  const cellMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // 3D EV Battery Pack Architecture Viewport Setup
  useEffect(() => {
    if (!mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    scene.fog = new THREE.FogExp2(0x060914, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(3.8, 2.6, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.3, 0);

    // Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const mainLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
    mainLight.position.set(4, 6, 4);
    scene.add(mainLight);

    const blueFill = new THREE.PointLight(0x00f0ff, 2.0, 8);
    blueFill.position.set(-3, 2, -2);
    scene.add(blueFill);

    // Grid Floor
    const grid = new THREE.GridHelper(10, 20, 0xf59e0b, 0x1e293b);
    grid.position.y = -0.01;
    scene.add(grid);

    // Main Battery Assembly Group
    const batteryGroup = new THREE.Group();

    // 1. Structural Skateboard Alloy Tray Base
    const trayGeom = new THREE.BoxGeometry(3.2, 0.12, 1.8);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const trayMesh = new THREE.Mesh(trayGeom, trayMat);
    trayMesh.position.y = 0.06;
    batteryGroup.add(trayMesh);

    // 2. Liquid Cooling Cold Plates & Serpentine Fluid Loops
    const coolingPlateGeom = new THREE.BoxGeometry(3.0, 0.04, 1.6);
    const coolingMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.4 });
    const coolingPlate = new THREE.Mesh(coolingPlateGeom, coolingMat);
    coolingPlate.position.y = 0.14;
    batteryGroup.add(coolingPlate);

    // 3. Array of 3D Cylindrical Cell Modules (4x8 Grid = 32 Modules)
    const cellGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16);
    cellMaterialsRef.current = [];

    const modulesGroup = new THREE.Group();
    modulesGroup.position.y = 0.35;

    for (let row = -1.5; row <= 1.5; row += 1.0) {
      for (let col = -3; col <= 3; col += 0.8) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.7,
          roughness: 0.3,
          emissive: 0xfbbf24,
          emissiveIntensity: 0.2,
        });
        cellMaterialsRef.current.push(mat);

        const cell = new THREE.Mesh(cellGeom, mat);
        cell.position.set(col * 0.42, 0, row * 0.45);
        modulesGroup.add(cell);
      }
    }
    batteryGroup.add(modulesGroup);

    // 4. BMS Master Controllers & High-Voltage Busbars
    const bmsGeom = new THREE.BoxGeometry(0.3, 0.15, 0.5);
    const bmsMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.8, roughness: 0.2 });
    const bmsMesh = new THREE.Mesh(bmsGeom, bmsMat);
    bmsMesh.position.set(-1.4, 0.25, 0);
    batteryGroup.add(bmsMesh);

    // 5. Top Glass/Carbon Protection Cover
    const coverGeom = new THREE.BoxGeometry(3.2, 0.06, 1.8);
    const coverMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.6,
    });
    const coverMesh = new THREE.Mesh(coverGeom, coverMat);
    coverMesh.position.y = 0.65;
    batteryGroup.add(coverMesh);

    scene.add(batteryGroup);

    // Animation Loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Apply Vertical Exploded View Offset
      coverMesh.position.y = 0.65 + explodedFactor * 0.6;
      modulesGroup.position.y = 0.35 + explodedFactor * 0.3;
      coolingPlate.position.y = 0.14 + explodedFactor * 0.1;

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
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // Live Thermal Gradient Shader update driven by C-Rate Discharge slider
  useEffect(() => {
    const tempCelsius = 25 + cRate * 6.5; // 25°C to 77°C thermal gradient
    cellMaterialsRef.current.forEach((mat, i) => {
      if (!mat) return;
      // Thermal variation per cell
      const cellTemp = tempCelsius + Math.sin(i * 1.5) * 4;
      const normTemp = Math.min(1, Math.max(0, (cellTemp - 25) / 50));

      if (normTemp > 0.6) {
        mat.color.setHex(0xef4444); // Thermal stress crimson red
        mat.emissive.setHex(0xef4444);
        mat.emissiveIntensity = normTemp * 0.8;
      } else if (normTemp > 0.3) {
        mat.color.setHex(0xf59e0b); // Peak amber operating temp
        mat.emissive.setHex(0xf59e0b);
        mat.emissiveIntensity = normTemp * 0.5;
      } else {
        mat.color.setHex(0xfbbf24); // Cool blue baseline
        mat.emissive.setHex(0xfbbf24);
        mat.emissiveIntensity = 0.2;
      }
    });
  }, [cRate]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 3D INTERACTIVE EV BATTERY PACK ARCHITECTURE VIEWPORT */}
      <div className="w-full bg-slate-950/90 rounded-2xl border border-amber-500/30 p-4 space-y-3 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Box size={16} />
            <span>3D EV BATTERY ARCHITECTURE: TRAY, CELL MODULES & COOLING LOOPS</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* C-Rate Discharge Thermal Slider */}
            <div className="flex items-center gap-2">
              <Flame size={13} className={cRate > 5 ? "text-red-400 animate-pulse" : "text-amber-400"} />
              <span>DISCHARGE: <span className="text-amber-300 font-bold">{cRate.toFixed(1)}C</span></span>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={cRate}
                onChange={(e) => setCRate(parseFloat(e.target.value))}
                className="w-24 accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Exploded View Slider */}
            <div className="flex items-center gap-2">
              <RefreshCw size={13} className="text-amber-400" />
              <span>EXPLODE: <span className="text-amber-300 font-bold">{(explodedFactor * 100).toFixed(0)}%</span></span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodedFactor}
                onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3D WebGL Canvas Container */}
        <div ref={mount3DRef} className="w-full h-[320px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800 relative">
          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-black/70 px-2.5 py-1 rounded border border-slate-700 pointer-events-none">
            ORBIT: DRAG TO ROTATE 3D PACK · SCROLL TO ZOOM · SLIDE EXPLODE TO INSPECT CELLS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* CARD 1: CELL ARRAY CONFIG */}
        <SectionCard
          title="800V Cell String Architecture"
          subtitle="Cathode chemistry, string array voltage & energy density"
          icon={<Battery size={16} />}
          accent="purple"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-base-950/80 border border-amber-500/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Pack Nominal Voltage</span>
                <span className="text-amber-300 font-extrabold">800V Ultra-Fast DC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Cell Count</span>
                <span className="text-emerald-300 font-extrabold">~{estimatedCells} Cylindrical Cells</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gravimetric Density</span>
                <span className="text-amber-300 font-extrabold">320 Wh/kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                THERMAL CELL ISOLATION
              </span>
              <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                Aerogel inter-cell insulation barriers block cascading thermal runaway and sustain peak C-rates under launch control.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* CARD 2: MATERIAL GRADE */}
        <SectionCard
          title="Cell Chemistry Grade"
          subtitle="NMC 811 vs Lithium-Iron-Phosphate (LFP) & Solid-State"
          icon={<Layers size={16} />}
          accent="purple"
        >
          {componentMeta ? (
            <MaterialGradePicker
              variants={componentMeta.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={onSelectVariant}
            />
          ) : (
            <p className="text-xs font-mono text-slate-500">Loading material variants...</p>
          )}
        </SectionCard>

        {/* CARD 3: ENGINEERING STAT DELTAS */}
        <SectionCard
          title="Discharge Power & Energy"
          subtitle="Peak continuous kW discharge, cell mass & reliability"
          icon={<Activity size={16} />}
          accent="emerald"
        >
          <StatDeltasPanel
            componentMeta={componentMeta}
            selectedVariant={selectedVariant}
            currentTotalStats={currentTotalStats}
            adviceText={componentMeta?.tooltipAdvice}
          />
        </SectionCard>
      </div>

      {/* INSTALL ACTION TRIGGER */}
      <InstallButton
        componentId="crankshaft"
        componentName="High-Voltage Battery Modules"
        isInstalled={isInstalled}
        isInstalling={isInstalling}
        canInstall={canInstall}
        phase={phase}
        onInstall={onInstall}
        onSkipAnimation={onSkipAnimation}
        onNext={onNext}
      />
    </div>
  );
}


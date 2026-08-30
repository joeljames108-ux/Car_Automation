/**
 * ============================================================================
 * MODULAR VEHICLE ASSEMBLY — 12-STAGE ROBOTIC FACTORY SEQUENCER
 * ============================================================================
 * Visualizes the progressive robotic assembly line with:
 * - 12-stage animated manufacturing sequence
 * - Laser alignment & robot arm position indicators
 * - Quality gate torque certification
 * - Dynamic stage progress controls
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Flame,
  Activity,
  Award,
} from "lucide-react";

export interface AssemblyStage {
  id: number;
  name: string;
  category: string;
  robotStation: string;
  cycleTimeSec: number;
  fastenerTorqueNm: number;
  subsystemSummary: string;
  qualityToleranceMm: number;
}

export const ASSEMBLY_STAGES: AssemblyStage[] = [
  {
    id: 1,
    name: "Chassis Frame Jig & Laser Calibration",
    category: "Chassis",
    robotStation: "Station A-01 (KUKA Titan 6-Axis)",
    cycleTimeSec: 45,
    fastenerTorqueNm: 120,
    subsystemSummary: "Mounts unibody to optical frame jig with sub-0.1mm alignment",
    qualityToleranceMm: 0.08,
  },
  {
    id: 2,
    name: "Front & Rear Subframe Bolting",
    category: "Subframes",
    robotStation: "Station A-02 (Dual Torquing Gantry)",
    cycleTimeSec: 60,
    fastenerTorqueNm: 165,
    subsystemSummary: "Installs high-rigidity aluminum subframes with 12x M14 Grade 10.9 bolts",
    qualityToleranceMm: 0.12,
  },
  {
    id: 3,
    name: "Powertrain Drop-In (Engine & Transaxle)",
    category: "Powertrain",
    robotStation: "Station B-01 (Hydraulic Marriage Table)",
    cycleTimeSec: 90,
    fastenerTorqueNm: 140,
    subsystemSummary: "Mates engine block, transaxle, and active motor mounts from underneath",
    qualityToleranceMm: 0.15,
  },
  {
    id: 4,
    name: "Suspension Wishbones & Active Dampers",
    category: "Suspension",
    robotStation: "Station B-02 (Articulated Suspension Arm)",
    cycleTimeSec: 75,
    fastenerTorqueNm: 110,
    subsystemSummary: "Installs double wishbones, spherical bearings, and MR active dampers",
    qualityToleranceMm: 0.1,
  },
  {
    id: 5,
    name: "Brake Calipers & Carbon-Ceramic Discs",
    category: "Braking",
    robotStation: "Station B-03 (Precision Spindle Torquer)",
    cycleTimeSec: 50,
    fastenerTorqueNm: 180,
    subsystemSummary: "Mounts 410mm carbon-ceramic rotors with 6-piston monobloc calipers",
    qualityToleranceMm: 0.05,
  },
  {
    id: 6,
    name: "800V HV & CAN-FD Wire Harness Routing",
    category: "Electrical",
    robotStation: "Station C-01 (Wire Harness Cobot)",
    cycleTimeSec: 80,
    fastenerTorqueNm: 45,
    subsystemSummary: "Routes shielded 800V traction cables and gigabit Ethernet backbone",
    qualityToleranceMm: 0.2,
  },
  {
    id: 7,
    name: "Interior Cockpit & Monocoque Seats",
    category: "Interior",
    robotStation: "Station C-02 (Cockpit Insertion Manipulator)",
    cycleTimeSec: 110,
    fastenerTorqueNm: 75,
    subsystemSummary: "Installs pre-assembled dashboard, steering column, and carbon bucket seats",
    qualityToleranceMm: 0.25,
  },
  {
    id: 8,
    name: "Exterior Skin & Carbon Body Closures",
    category: "Exterior",
    robotStation: "Station D-01 (Optical Panel Fit Gantry)",
    cycleTimeSec: 120,
    fastenerTorqueNm: 35,
    subsystemSummary: "Installs doors, hood, fenders, and roof with 3.5mm nominal shut-lines",
    qualityToleranceMm: 0.18,
  },
  {
    id: 9,
    name: "Aerodynamic Wings & Venturi Diffuser",
    category: "Aerodynamics",
    robotStation: "Station D-02 (Aero Fastening Cell)",
    cycleTimeSec: 65,
    fastenerTorqueNm: 55,
    subsystemSummary: "Mounts active DRS rear wing, front splitter, and carbon undertray tunnels",
    qualityToleranceMm: 0.14,
  },
  {
    id: 10,
    name: "Forged Wheels & Michelin Cup 2 R Tires",
    category: "Wheels",
    robotStation: "Station E-01 (5-Spindle Center-Lock Torquer)",
    cycleTimeSec: 40,
    fastenerTorqueNm: 600,
    subsystemSummary: "Mounts lightweight forged magnesium wheels at 600 Nm center-lock torque",
    qualityToleranceMm: 0.04,
  },
  {
    id: 11,
    name: "Fluids Vacuum Purge & Pressurization",
    category: "Fluids",
    robotStation: "Station E-02 (Automated Fluid Fill Rig)",
    cycleTimeSec: 55,
    fastenerTorqueNm: 30,
    subsystemSummary: "Vacuum fills synthetic oil, ethylene glycol coolant, and DOT 5.1 brake fluid",
    qualityToleranceMm: 0.01,
  },
  {
    id: 12,
    name: "End-of-Line Dyno QA & Homologation Gate",
    category: "Testing",
    robotStation: "Station F-01 (Chassis Roll Dyno & EOL Gate)",
    cycleTimeSec: 180,
    fastenerTorqueNm: 0,
    subsystemSummary: "100% WOT throttle sweep, ABS lockup test, and ASIL-D safety sign-off",
    qualityToleranceMm: 0.0,
  },
];

export const RoboticFactorySequencer: React.FC = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [completedStages, setCompletedStages] = useState<number[]>([0]);

  const activeStage = ASSEMBLY_STAGES[currentStageIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      setCurrentStageIndex((prev) => {
        if (prev >= ASSEMBLY_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        setCompletedStages((c) => (c.includes(next) ? c : [...c, next]));
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSelectStage = (idx: number) => {
    setCurrentStageIndex(idx);
    setCompletedStages((c) => (c.includes(idx) ? c : [...c, idx]));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStageIndex(0);
    setCompletedStages([0]);
  };

  const progressPercent = Math.round(((currentStageIndex + 1) / ASSEMBLY_STAGES.length) * 100);

  return (
    <div className="flex flex-col h-full bg-amber-900/40 backdrop-blur-xl border border-amber-800/30 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4 text-xs text-amber-100/80">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-amber-800/30 gap-2">
        <div>
          <h3 className="text-sm font-bold text-amber-50 flex items-center gap-2">
            <Cpu size={16} className="text-amber-400" />
            12-Stage Robotic Assembly Sequencer
          </h3>
          <p className="text-[11px] text-amber-200/60">
            Factory Station: <span className="text-amber-300 font-bold">{activeStage.robotStation}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md ${
              isPlaying
                ? "bg-amber-500 text-slate-950 shadow-amber-500/30"
                : "bg-amber-500 text-slate-950 shadow-cyan-500/30 hover:bg-amber-400"
            }`}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? "Pause Line" : "Auto-Run Assembly"}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 bg-amber-800/35 hover:bg-amber-700/40 text-amber-100/80 rounded-xl border border-amber-700/30"
            title="Reset to Stage 1"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-amber-200/60 font-semibold">
            Stage {activeStage.id} of 12: {activeStage.name}
          </span>
          <span className="font-mono font-bold text-amber-400">{progressPercent}% Assembly Complete</span>
        </div>
        <div className="w-full h-2 bg-amber-950/80 rounded-full overflow-hidden border border-amber-800/30">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 12-Stage Interactive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {ASSEMBLY_STAGES.map((stg, i) => {
          const isCurrent = i === currentStageIndex;
          const isDone = completedStages.includes(i);

          return (
            <button
              key={stg.id}
              onClick={() => handleSelectStage(i)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isCurrent
                  ? "bg-amber-500/15 border-amber-500 text-amber-200 shadow-md shadow-cyan-500/20 scale-[1.02]"
                  : isDone
                  ? "bg-amber-950/60 border-amber-700/30/80 text-amber-100/80 hover:bg-amber-800/35"
                  : "bg-amber-950/30 border-amber-800/30 text-amber-300/50 hover:bg-amber-900/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold text-amber-400">0{stg.id}</span>
                {isDone && <CheckCircle2 size={12} className="text-emerald-400" />}
              </div>
              <span className="font-bold text-[11px] block leading-tight line-clamp-1">
                {stg.name}
              </span>
              <span className="text-[9px] text-amber-200/60 block mt-0.5">{stg.category}</span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detail Deck */}
      <div className="bg-amber-950/80 p-3.5 rounded-xl border border-amber-800/30 space-y-3 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
              STAGE {activeStage.id} ACTIVE
            </span>
            <span className="text-xs font-bold text-amber-50">{activeStage.name}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <Sparkles size={11} />
            Tolerance: ±{activeStage.qualityToleranceMm} mm
          </span>
        </div>

        <p className="text-amber-100/80 text-[11px] leading-relaxed">
          {activeStage.subsystemSummary}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-amber-900/40 p-2 rounded-lg border border-amber-800/30">
            <span className="text-[9px] text-amber-200/60 block uppercase">Cycle Time</span>
            <span className="text-xs font-mono font-bold text-amber-300">{activeStage.cycleTimeSec}s</span>
          </div>
          <div className="bg-amber-900/40 p-2 rounded-lg border border-amber-800/30">
            <span className="text-[9px] text-amber-200/60 block uppercase">Target Torque</span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {activeStage.fastenerTorqueNm > 0 ? `${activeStage.fastenerTorqueNm} Nm` : "N/A"}
            </span>
          </div>
          <div className="bg-amber-900/40 p-2 rounded-lg border border-amber-800/30">
            <span className="text-[9px] text-amber-200/60 block uppercase">Station ID</span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {activeStage.robotStation.split(" ")[0]}
            </span>
          </div>
          <div className="bg-amber-900/40 p-2 rounded-lg border border-amber-800/30">
            <span className="text-[9px] text-amber-200/60 block uppercase">QA Status</span>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 size={11} /> Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

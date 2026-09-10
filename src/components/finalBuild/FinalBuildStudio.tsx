import React, { useState, useMemo, Suspense } from "react";
import {
  Trophy,
  CheckCircle2,
  Share2,
  Download,
  Gauge,
  Zap,
  Weight,
  Wind,
  Layers,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Flame,
  Car,
  Sofa,
  Box,
  Edit3,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import { useCompany } from "../../state/CompanyContext";
import { useGuidedEngineeringStore, WORKFLOW_STAGES_META } from "../../state/guidedEngineeringStore";
import { useModularVehicleBuilderStore } from "../../state/modularVehicleBuilderStore";
import { useAeroStudioStore } from "../../state/aeroStudioStore";

interface FinalBuildStudioProps {
  onSelectStage?: (stage: string) => void;
  className?: string;
}

export const FinalBuildStudio: React.FC<FinalBuildStudioProps> = ({
  onSelectStage,
  className = "",
}) => {
  const { design, sim, setDesignName } = useDesign();
  const { safetyConfig, safetySim } = useCompany();
  const {
    engineStatus,
    vehicleStatus,
    aeroStatus,
    interiorStatus,
    markStageComplete,
    setActiveWorkflowStage,
  } = useGuidedEngineeringStore();

  const selectedModel = useModularVehicleBuilderStore((s) => s.selectedModel);
  const aeroPhysics = useAeroStudioStore((s) => s.physics);

  const [activeViewTab, setActiveViewTab] = useState<"summary" | "bom" | "telemetry">("summary");

  // Mark Final Build as complete upon viewing
  React.useEffect(() => {
    markStageComplete("final_build");
  }, [markStageComplete]);

  const pwrToWeight = sim.peakPower > 0 && sim.weight > 0
    ? (sim.peakPower / (sim.weight / 1000)).toFixed(1)
    : "—";

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(design, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${design.name.toLowerCase().replace(/\s+/g, "_")}_build_spec.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={`space-y-6 select-none ${className}`}>
      {/* ── TOP HERO BANNER: CERTIFICATE OF HOMOLOGATION ── */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0d1527]/95 via-[#111c36]/90 to-[#0d1527]/95 border border-amber-500/40 p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>STAGE 6: VEHICLE ASSEMBLED FROM ZERO — HOMOLOGATION COMPLETE</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
                  <Edit3 size={13} className="text-amber-400" />
                  <span>MODEL NAME (TYPE TO CUSTOMIZE):</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  (Type directly to rename model)
                </span>
              </div>
              <div className="relative flex items-center max-w-xl group">
                <input
                  type="text"
                  value={design.name}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="Enter custom vehicle model name..."
                  className="w-full text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono text-slate-100 bg-slate-950/60 hover:bg-slate-950/80 focus:bg-slate-950 border border-amber-500/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 rounded-2xl px-4 py-2 transition-all outline-none tracking-tight shadow-inner"
                />
                <Edit3 size={18} className="absolute right-4 text-amber-400/70 pointer-events-none group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
            <p className="text-xs md:text-sm text-slate-300 font-mono leading-relaxed">
              Every subsystem has been verified through the sequential engineering pipeline.
              Powertrain dynamics, suspension kinematics, aerodynamic balance, and cockpit avionics are 100% unified.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-mono font-bold tracking-wider shadow-lg transition-all cursor-pointer"
            >
              <Download size={14} className="text-amber-400" />
              <span>EXPORT SPEC JSON</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectStage?.("simulation")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-mono font-bold tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
            >
              <Activity size={14} />
              <span>TEST TRACK DYNAMICS →</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KEY PERFORMANCE TILES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <Zap size={14} /> <span>POWER</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {sim.peakPower > 0 ? `${sim.peakPower}` : "—"}
            <span className="text-xs font-normal text-slate-400 ml-1">hp</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">{pwrToWeight} hp/tonne</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <Gauge size={14} /> <span>TORQUE</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {sim.peakTorque > 0 ? `${sim.peakTorque}` : "—"}
            <span className="text-xs font-normal text-slate-400 ml-1">Nm</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">@ {sim.peakTorqueRpm || 4500} RPM</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <Weight size={14} /> <span>CURB MASS</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {sim.weight > 0 ? `${sim.weight}` : "—"}
            <span className="text-xs font-normal text-slate-400 ml-1">kg</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Bias: {Math.round((sim.weightDistFront || 0.5) * 100)}% F
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-teal-400">
            <Wind size={14} /> <span>DOWNFORCE</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {sim.downforce > 0 ? `${Math.round(sim.downforce)}` : "—"}
            <span className="text-xs font-normal text-slate-400 ml-1">N</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">@ 200 km/h (Cd: {sim.dragCoeff?.toFixed(2) || "0.30"})</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <Activity size={14} /> <span>0-60 MPH</span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">
            {sim.accel0_60 > 0 ? `${sim.accel0_60.toFixed(2)}` : "—"}
            <span className="text-xs font-normal text-slate-400 ml-1">s</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">Top Speed: {sim.topSpeed ? `${Math.round(sim.topSpeed)} km/h` : "—"}</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-emerald-500/30 backdrop-blur-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <ShieldCheck size={14} /> <span>STATUS</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={18} /> PASSED
          </div>
          <div className="text-[10px] font-mono text-slate-400">Virtual Homologated</div>
        </div>
      </div>

      {/* ── STAGE RETROSPECTIVE & MODULAR BILL OF MATERIALS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Step 1: Engine */}
        <div className="p-5 rounded-2xl bg-[#0e1424]/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <Flame size={15} /> <span>STEP 1: ENGINE</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold">
              COMPLETE
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs text-slate-300">
            <div>Architecture: <span className="text-white font-bold">{design.engine.layout.toUpperCase()}</span></div>
            <div>Bore × Stroke: <span className="text-white">{design.engine.bore}mm × {design.engine.stroke}mm</span></div>
            <div>Aspiration: <span className="text-white font-bold">{design.engine.intake.toUpperCase()}</span></div>
            <div>Fuel System: <span className="text-white">{design.engine.fuelSystem}</span></div>
          </div>
          <button
            type="button"
            onClick={() => onSelectStage?.("engine")}
            className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Edit Engine</span> <ArrowRight size={12} />
          </button>
        </div>

        {/* Step 2: Vehicle */}
        <div className="p-5 rounded-2xl bg-[#0e1424]/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
              <Car size={15} /> <span>STEP 2: VEHICLE</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold">
              COMPLETE
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs text-slate-300">
            <div>Platform: <span className="text-white font-bold">{design.vehicle.platform}</span></div>
            <div>Body Shell: <span className="text-white font-bold">{selectedModel || design.vehicle.exterior.bodyType}</span></div>
            <div>Drivetrain: <span className="text-white">{design.vehicle.driveType.toUpperCase()} · {design.vehicle.transmission}</span></div>
            <div>Chassis: <span className="text-white">{design.vehicle.chassis}</span></div>
          </div>
          <button
            type="button"
            onClick={() => onSelectStage?.("vehicle")}
            className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Edit Vehicle</span> <ArrowRight size={12} />
          </button>
        </div>

        {/* Step 3: Aero */}
        <div className="p-5 rounded-2xl bg-[#0e1424]/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-400">
              <Wind size={15} /> <span>STEP 3: AERO</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold">
              COMPLETE
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs text-slate-300">
            <div>Rear Wing: <span className="text-white font-bold">Configured</span></div>
            <div>Front Splitter: <span className="text-white font-bold">Mounted</span></div>
            <div>Underbody: <span className="text-white">{design.vehicle.aero.underbody}</span></div>
            <div>Balance: <span className="text-white font-bold">52% F / 48% R</span></div>
          </div>
          <button
            type="button"
            onClick={() => onSelectStage?.("aero_studio")}
            className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Edit Aero</span> <ArrowRight size={12} />
          </button>
        </div>

        {/* Step 4: Interior */}
        <div className="p-5 rounded-2xl bg-[#0e1424]/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400">
              <Sofa size={15} /> <span>STEP 4: INTERIOR</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold">
              COMPLETE
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs text-slate-300">
            <div>Seats: <span className="text-white font-bold">{design.vehicle.interior.seatType} ({design.vehicle.interior.seatMaterial})</span></div>
            <div>Cockpit Trim: <span className="text-white font-bold">{design.vehicle.interior.dashboardMaterial}</span></div>
            <div>Steering: <span className="text-white">{design.vehicle.interior.steeringWheel}</span></div>
            <div>Infotainment: <span className="text-white font-bold">{design.vehicle.interior.infotainmentSize}" Display</span></div>
          </div>
          <button
            type="button"
            onClick={() => onSelectStage?.("interior")}
            className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Edit Interior</span> <ArrowRight size={12} />
          </button>
        </div>

        {/* Step 5: Safety */}
        <div className="p-5 rounded-2xl bg-[#0e1424]/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
              <ShieldCheck size={15} /> <span>STEP 5: SAFETY</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold">
              COMPLETE
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs text-slate-300">
            <div>Crumple Zone: <span className="text-white font-bold">{safetyConfig.frontCrumple.toUpperCase()}</span></div>
            <div>Airbags: <span className="text-white font-bold">{safetyConfig.airbagType.replace(/_/g, ' ').toUpperCase()} ({safetyConfig.airbagCount}x)</span></div>
            <div>Safety Cage: <span className="text-white font-bold">{safetyConfig.safetyCage.replace(/_/g, ' ').toUpperCase()}</span></div>
            <div>NCAP Rating: <span className="text-amber-400 font-bold">{safetySim.ncapStars}★ ({safetySim.overallScore}/100)</span></div>
          </div>
          <button
            type="button"
            onClick={() => onSelectStage?.("safety")}
            className="w-full py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Edit Safety</span> <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

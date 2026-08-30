import React from "react";
import { Activity, ShieldAlert, Cpu, Layers } from "lucide-react";

interface ChassisFEAControlPanelProps {
  corneringG: number;
  setCorneringG: (val: number) => void;
  brakingG: number;
  setBrakingG: (val: number) => void;
  downforceN: number;
  setDownforceN: (val: number) => void;
  showDeformationMesh: boolean;
  setShowDeformationMesh: (val: boolean) => void;
  torsionalRigidity: number;
  chassisName: string;
}

export const ChassisFEAControlPanel: React.FC<ChassisFEAControlPanelProps> = ({
  corneringG,
  setCorneringG,
  brakingG,
  setBrakingG,
  downforceN,
  setDownforceN,
  showDeformationMesh,
  setShowDeformationMesh,
  torsionalRigidity,
  chassisName,
}) => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/30 rounded-xl p-4 shadow-2xl text-slate-100 flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
            Chassis FEA Load Simulator
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-slate-400">
          <span>{chassisName}</span>
          <span className="text-amber-400 font-bold">{torsionalRigidity} kNm/°</span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cornering G */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">Cornering G-Load</span>
            <span className="text-amber-400 font-bold">{corneringG.toFixed(2)} g</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={corneringG}
            onChange={(e) => setCorneringG(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Braking G */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">Braking Decel</span>
            <span className="text-red-400 font-bold">{brakingG.toFixed(2)} g</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.0"
            step="0.05"
            value={brakingG}
            onChange={(e) => setBrakingG(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
          />
        </div>

        {/* Aerodynamic Downforce */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">Aero Downforce</span>
            <span className="text-amber-400 font-bold">{downforceN} N</span>
          </div>
          <input
            type="range"
            min="0"
            max="15000"
            step="250"
            value={downforceN}
            onChange={(e) => setDownforceN(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      </div>

      {/* Toggles and Fast Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
        <button
          onClick={() => setShowDeformationMesh(!showDeformationMesh)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
            showDeformationMesh
              ? "bg-slate-950/80 text-amber-300 border border-amber-500/40"
              : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>{showDeformationMesh ? "FEA Mesh: ON" : "FEA Mesh: OFF"}</span>
        </button>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Nominal (&lt;400 MPa)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Yield Warning
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical Hotspot
          </span>
        </div>
      </div>
    </div>
  );
};

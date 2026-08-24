/**
 * ============================================================================
 * VEHICLE CONFIGURATION CAD TREE
 * ============================================================================
 * Engineering hierarchy tree providing CAD-grade component inspection,
 * component isolation, ghosting, X-Ray mode, and node selection.
 */

import React, { useState } from "react";
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Maximize2,
  Sparkles,
  Wrench,
  Cog,
  Gauge,
  Activity,
  Disc,
  Car,
  Sofa,
  Cpu,
  Flame,
  Wind,
  Shield,
  Box,
} from "lucide-react";
import { AssemblyStageId } from "../scene/ModularAssemblySceneGraph";

export interface CADTreeNode {
  id: AssemblyStageId;
  name: string;
  category: string;
  icon: any;
  massKg: number;
  status: "INSTALLED" | "PREVIEW" | "UNINSTALLED";
  children?: { id: string; name: string; info: string }[];
}

interface VehicleConfigTreeProps {
  installedStages: Set<AssemblyStageId>;
  selectedStage: AssemblyStageId | null;
  onSelectStage: (stage: AssemblyStageId) => void;
  onSetVisibilityMode: (stage: AssemblyStageId, mode: "normal" | "ghost" | "xray" | "hidden" | "isolated") => void;
}

export const VehicleConfigTree: React.FC<VehicleConfigTreeProps> = ({
  installedStages,
  selectedStage,
  onSelectStage,
  onSetVisibilityMode,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["chassis", "engine", "body_structure", "aero_studio"]));
  const [activeModes, setActiveModes] = useState<Map<AssemblyStageId, "normal" | "ghost" | "xray" | "hidden" | "isolated">>(new Map());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleModeChange = (stage: AssemblyStageId, mode: "normal" | "ghost" | "xray" | "hidden" | "isolated", e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModes((prev) => {
      const next = new Map(prev);
      const current = next.get(stage) || "normal";
      const newMode = current === mode ? "normal" : mode;
      next.set(stage, newMode);
      onSetVisibilityMode(stage, newMode);
      return next;
    });
  };

  const nodes: CADTreeNode[] = [
    {
      id: "chassis",
      name: "Chassis Frame & Structural Monocell",
      category: "Structure",
      icon: Wrench,
      massKg: 280,
      status: installedStages.has("chassis") ? "INSTALLED" : "UNINSTALLED",
      children: [
        { id: "cm_tub", name: "FIA Prepreg Carbon Tub", info: "78 kNm/° Rigidity" },
        { id: "cm_sub_f", name: "Front Aluminum Subframe", info: "Double Wishbone Pickups" },
        { id: "cm_sub_r", name: "Rear Engine & Transaxle Cradle", info: "Multi-Link Hardpoints" },
      ],
    },
    {
      id: "engine",
      name: "Powertrain & Forced Induction",
      category: "Propulsion",
      icon: Cog,
      massKg: 195,
      status: installedStages.has("engine") ? "INSTALLED" : "UNINSTALLED",
      children: [
        { id: "eng_block", name: "Aluminum Cylinder Block & Heads", info: "Forged Crank & Pistons" },
        { id: "eng_turbos", name: "Twin Turbochargers & Wastegates", info: "Inconel Turbine Housings" },
        { id: "eng_intake", name: "Carbon Fiber Intake Plenum", info: "Direct Port Injection" },
      ],
    },
    {
      id: "transmission",
      name: "Drivetrain & Transaxle Gearbox",
      category: "Drivetrain",
      icon: Gauge,
      massKg: 88,
      status: installedStages.has("transmission") ? "INSTALLED" : "UNINSTALLED",
      children: [
        { id: "trans_gearset", name: "7-Speed Dual-Clutch Cassette", info: "Electro-Hydraulic Shift" },
        { id: "trans_diff", name: "Electronic Torque-Vectoring LSD", info: "Active Multi-Plate Clutch" },
      ],
    },
    {
      id: "suspension",
      name: "4-Corner Kinematics & Wishbones",
      category: "Chassis Dynamics",
      icon: Activity,
      massKg: 68,
      status: installedStages.has("suspension") ? "INSTALLED" : "UNINSTALLED",
      children: [
        { id: "susp_arms", name: "Aero Profile Carbon A-Arms", info: "-1.8°/deg Camber Gain" },
        { id: "susp_pushrods", name: "Inboard Pushrod Actuators", info: "Active MR Coilover Dampers" },
      ],
    },
    {
      id: "brakes",
      name: "Braking System & Monobloc Calipers",
      category: "Braking",
      icon: Disc,
      massKg: 32,
      status: installedStages.has("brakes") ? "INSTALLED" : "UNINSTALLED",
      children: [
        { id: "brk_rotors", name: "410mm Carbon-Ceramic Rotors", info: "Directional Cooling Vanes" },
        { id: "brk_calipers", name: "8-Piston Monobloc Calipers", info: "Titanium Piston Caps" },
      ],
    },
    {
      id: "wheels",
      name: "Forged Wheels & Racing Tyres",
      category: "Unsprung",
      icon: Disc,
      massKg: 78,
      status: installedStages.has("wheels") ? "INSTALLED" : "UNINSTALLED",
      children: [
        { id: "whl_rims", name: "Centerlock Monoblock GT3 Rims", info: "Forged 6061-T6 Alloy" },
        { id: "whl_tires", name: "Competition Semi-Slick Tyres", info: "1.45 G Peak Grip" },
      ],
    },
    {
      id: "body_structure",
      name: "Widebody Aero Shell & Paint",
      category: "Exterior",
      icon: Car,
      massKg: 110,
      status: installedStages.has("body_structure") ? "INSTALLED" : "UNINSTALLED",
      children: [
        { id: "bdy_fenders", name: "Flared Front & Rear Fenders", info: "Wheel Arch Louvers" },
        { id: "bdy_hood", name: "Vented Front Hood & Radiator Duct", info: "Carbon Extraction Chimney" },
      ],
    },
    {
      id: "glass",
      name: "Canopy & Aerodynamic Glass",
      category: "Canopy",
      icon: Sparkles,
      massKg: 14,
      status: installedStages.has("glass") ? "INSTALLED" : "UNINSTALLED",
    },
    {
      id: "interior",
      name: "Cockpit, Yoke & Carbon Buckets",
      category: "Cockpit",
      icon: Sofa,
      massKg: 28,
      status: installedStages.has("interior") ? "INSTALLED" : "UNINSTALLED",
    },
    {
      id: "electronics",
      name: "Motorsport ECU & 800V Harness",
      category: "Electrical",
      icon: Cpu,
      massKg: 18,
      status: installedStages.has("electronics") ? "INSTALLED" : "UNINSTALLED",
    },
    {
      id: "final_exterior",
      name: "Titanium Exhaust & Wing Mirrors",
      category: "Details",
      icon: Flame,
      massKg: 16,
      status: installedStages.has("final_exterior") ? "INSTALLED" : "UNINSTALLED",
    },
    {
      id: "aero_studio",
      name: "Parametric Aerodynamics Package",
      category: "Aerodynamics",
      icon: Wind,
      massKg: 24,
      status: "INSTALLED",
      children: [
        { id: "aero_wing", name: "Swan-Neck Carbon Rear Wing", info: "-5° to 28° AoA Pivot" },
        { id: "aero_split", name: "Front Carbon Splitter & Air Dam", info: "Ground Effect Channel" },
        { id: "aero_diff", name: "Venturi Tunnel Rear Diffuser", info: "Expansion Strakes" },
      ],
    },
  ];

  return (
    <div className="panel p-3 rounded-2xl space-y-2 border border-base-800 text-xs font-mono shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-2">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-cyan-400" />
          <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px]">
            CAD VEHICLE HIERARCHY TREE
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-bold">
          12 SUBASSEMBLIES
        </span>
      </div>

      {/* Node Hierarchy List */}
      <div className="space-y-1 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
        {nodes.map((node) => {
          const isSelected = selectedStage === node.id;
          const isExpanded = expandedNodes.has(node.id);
          const mode = activeModes.get(node.id) || "normal";
          const Icon = node.icon;

          return (
            <div key={node.id} className="space-y-0.5">
              <div
                onClick={() => onSelectStage(node.id)}
                className={`group flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-500/60 text-slate-100 shadow-sm"
                    : "bg-base-900/40 border-base-800/60 hover:bg-base-850 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {node.children ? (
                    <button
                      onClick={(e) => toggleExpand(node.id, e)}
                      className="p-0.5 rounded hover:bg-base-800 text-slate-400"
                    >
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                  ) : (
                    <div className="w-3.5" />
                  )}
                  <Icon size={13} className={node.status === "INSTALLED" ? "text-cyan-400" : "text-slate-600"} />
                  <span className="font-bold truncate text-[11px] text-slate-800 dark:text-slate-200">
                    {node.name}
                  </span>
                </div>

                {/* Right Actions: Mass Badge & CAD Visibility Tools */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-500 font-semibold">{node.massKg}kg</span>

                  {/* CAD Visibility Actions */}
                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleModeChange(node.id, "isolated", e)}
                      title="Isolate Component"
                      className={`p-1 rounded text-[9px] font-bold cursor-pointer transition-all ${
                        mode === "isolated"
                          ? "bg-amber-500 text-black font-extrabold shadow-sm"
                          : "hover:bg-base-800 text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      ISO
                    </button>
                    <button
                      onClick={(e) => handleModeChange(node.id, "xray", e)}
                      title="X-Ray Mode"
                      className={`p-1 rounded text-[9px] font-bold cursor-pointer transition-all ${
                        mode === "xray"
                          ? "bg-purple-500 text-white font-extrabold shadow-sm"
                          : "hover:bg-base-800 text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      XRAY
                    </button>
                    <button
                      onClick={(e) => handleModeChange(node.id, "ghost", e)}
                      title="Ghost Mode (Translucent)"
                      className={`p-1 rounded text-[9px] font-bold cursor-pointer transition-all ${
                        mode === "ghost"
                          ? "bg-cyan-500 text-black font-extrabold shadow-sm"
                          : "hover:bg-base-800 text-slate-500 hover:text-slate-200"
                      }`}
                    >
                      GST
                    </button>
                  </div>
                </div>
              </div>

              {/* Children Sub-Assemblies */}
              {isExpanded && node.children && (
                <div className="pl-6 space-y-1 border-l border-base-800/80 ml-3.5 my-1">
                  {node.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-1 rounded-lg bg-base-950/40 text-[10px] text-slate-400 border border-base-800/40"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-1 h-1 rounded-full bg-cyan-500/80" />
                        <span className="truncate text-slate-300 font-medium">{child.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0 font-mono">{child.info}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

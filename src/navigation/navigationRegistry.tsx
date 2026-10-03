import React from "react";
import {
  Cog, Car, Activity, Flag, BarChart3,
  Sofa, Factory, Wind, Newspaper,
  GitCompare, TrendingUp, ShieldCheck, DollarSign, Cpu, GitBranch,
  Volume2, Navigation, Home, Trophy,
} from "lucide-react";
import { type Stage } from "../components/StageSwitcher";
import { isCarCreationStageId } from "../state/guidedEngineeringStore";

export type WorkspaceCategory = "engineering" | "studios" | "simulation" | "world";

export interface StageItem {
  id: Stage;
  label: string;
  icon: React.ReactNode;
  category: WorkspaceCategory;
}

export const STAGES: StageItem[] = [
  // --- Main Menu Hub & Overview ---
  { id: "main_menu", label: "Main Menu", icon: <Home size={14} />, category: "engineering" },
  { id: "create_vehicle_hub", label: "Creation Hub", icon: <Car size={14} />, category: "engineering" },

  // --- Engineering Sequential Workflow (8 Divisions) ---
  { id: "engine", label: "1. Engine", icon: <Cog size={14} />, category: "engineering" },
  { id: "vehicle", label: "2. Vehicle Studio", icon: <Car size={14} />, category: "engineering" },
  { id: "aero_studio", label: "3. Aero Studio", icon: <Wind size={14} />, category: "engineering" },
  { id: "interior", label: "4. Interior", icon: <Sofa size={14} />, category: "engineering" },
  { id: "safety", label: "5. Safety Center", icon: <ShieldCheck size={14} />, category: "engineering" },
  { id: "simulation", label: "6. Sim & Testing", icon: <Activity size={14} />, category: "engineering" },
  { id: "manufacturing", label: "7. Manufacture", icon: <Factory size={14} />, category: "engineering" },
  { id: "factory", label: "8. Factory Floor", icon: <Factory size={14} />, category: "engineering" },

  // --- Design Studios Hub ---
  { id: "transmission3d", label: "3D Transmission Studio", icon: <Cog size={14} />, category: "studios" },
  { id: "track_layout", label: "Track Layouts Studio", icon: <Navigation size={14} />, category: "studios" },
  { id: "f1_constructor", label: "🏎️ F1 Constructor Studio", icon: <Flag size={14} />, category: "studios" },
  { id: "hypercar_constructor", label: "🏆 Hypercar WEC Studio", icon: <Trophy size={14} />, category: "studios" },
  { id: "suspension3d", label: "3D Suspension Studio", icon: <Activity size={14} />, category: "studios" },

  // --- Simulation & Testing ---
  { id: "nvh", label: "NVH Audio Lab", icon: <Volume2 size={14} />, category: "simulation" },
  { id: "race", label: "Race Track", icon: <Flag size={14} />, category: "simulation" },
  { id: "stats", label: "Telemetry Stats", icon: <BarChart3 size={14} />, category: "simulation" },

  // --- World & Racing ---
  { id: "reputation", label: "Reputation", icon: <Trophy size={14} />, category: "world" },
  { id: "compare", label: "Compare", icon: <GitCompare size={14} />, category: "world" },
  { id: "economy", label: "Economy", icon: <TrendingUp size={14} />, category: "world" },
  { id: "twin", label: "Digital Twin", icon: <Cpu size={14} />, category: "world" },
  { id: "press", label: "Press Reviews", icon: <Newspaper size={14} />, category: "world" },
  { id: "competitors", label: "Rivals", icon: <GitBranch size={14} />, category: "world" },
];

export function isMainMenuOrSubPage(s: Stage): boolean {
  return [
    "main_menu",
    "create_vehicle_hub",
    "powertrain_studio_select",
    "operations",
    "project_overview",
    "hq",
    "calendar",
    "contracts",
    "settings",
    "reputation",
    "garage",
    "motorsport",
    "rd",
  ].includes(s);
}

export function isCarCreationStage(s: Stage): boolean {
  return isCarCreationStageId(s);
}

export function resolveStageCategory(st: string): WorkspaceCategory {
  const selectedStage = STAGES.find((item) => item.id === st);
  if (selectedStage) {
    return selectedStage.category;
  }
  if (st === "garage" || st === "motorsport" || st === "supplyChain") {
    return "world";
  }
  if (["operations", "project_overview", "hq", "calendar", "contracts", "settings", "reputation"].includes(st)) {
    return "world";
  }
  return "engineering";
}

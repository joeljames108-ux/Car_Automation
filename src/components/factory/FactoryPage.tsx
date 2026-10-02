import React from "react";
import {
  Factory,
  Layers,
  Calendar,
  Boxes,
  Users,
  ShieldCheck,
  ChevronRight,
  Home,
  Plus,
} from "lucide-react";
import { useFactoryStore, FactoryViewTab } from "../../state/factoryStore";
import { FactoryOverviewDashboard } from "./FactoryOverviewDashboard";
import { AssemblyLineManager } from "./AssemblyLineManager";
import { ProductionScheduler } from "./ProductionScheduler";
import { MaterialQueuePanel } from "./MaterialQueuePanel";
import { WorkforceAllocatorPanel } from "./WorkforceAllocatorPanel";
import { QualityInspectionPanel } from "./QualityInspectionPanel";

interface FactoryPageProps {
  onSelectStage?: (stage: any) => void;
}

export function FactoryPage({ onSelectStage }: FactoryPageProps) {
  const { activeViewTab, setActiveViewTab } = useFactoryStore();

  const tabs: { id: FactoryViewTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Factory size={15} /> },
    { id: "lines", label: "Assembly Lines", icon: <Layers size={15} /> },
    { id: "scheduler", label: "Production Schedule", icon: <Calendar size={15} /> },
    { id: "materials", label: "Materials & BOM", icon: <Boxes size={15} /> },
    { id: "workforce", label: "Workforce & Shifts", icon: <Users size={15} /> },
    { id: "quality", label: "Quality Inspection", icon: <ShieldCheck size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800 p-6 md:p-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onSelectStage?.("main_menu")}
          className="hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <Home size={13} /> Hub
        </button>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="font-semibold text-slate-900">Factory Floor Operations</span>
      </div>

      {/* Main Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Factory size={26} className="text-emerald-800" />
            Factory Floor Management
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Real-time physical capacity, takt time scheduling, multi-shift line tooling, material stocking, and end-of-line quality inspection.
          </p>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeViewTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveViewTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span className={isActive ? "text-emerald-700" : "text-slate-400"}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View Rendering */}
      <div>
        {activeViewTab === "overview" && (
          <FactoryOverviewDashboard onNavigateTab={setActiveViewTab} />
        )}
        {activeViewTab === "lines" && <AssemblyLineManager />}
        {activeViewTab === "scheduler" && <ProductionScheduler />}
        {activeViewTab === "materials" && <MaterialQueuePanel />}
        {activeViewTab === "workforce" && <WorkforceAllocatorPanel />}
        {activeViewTab === "quality" && <QualityInspectionPanel />}
      </div>
    </div>
  );
}

export default FactoryPage;

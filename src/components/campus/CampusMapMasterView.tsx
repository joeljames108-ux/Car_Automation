import React, { useState, useEffect } from "react";
import {
  Building2,
  Factory,
  Compass,
  Layers,
  Sparkles,
  Users,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Flag,
  Share2,
  ChevronRight,
  Wrench,
  Award,
  HardHat,
  BarChart3,
  Bell,
  ArrowLeftRight,
  HelpCircle,
  Camera,
  X,
  Train,
} from "lucide-react";
import { SubPageLayout } from "../mainMenu/SubPageLayout";
import { Stage } from "../StageSwitcher";
import { useCampusStore } from "../../state/campusStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { Campus3DMapViewport } from "./Campus3DMapViewport";
import { BuildingInspectorDrawer } from "./BuildingInspectorDrawer";
import { CampusTreeSidebar } from "./CampusTreeSidebar";
import { ConstructionQueuePanel } from "./ConstructionQueuePanel";
import { CampusAnalyticsModal } from "./CampusAnalyticsModal";
import { CampusNotificationDrawer } from "./CampusNotificationDrawer";
import { BuildingComparisonModal } from "./BuildingComparisonModal";
import { CampusTutorialOverlay } from "./CampusTutorialOverlay";
import { CampusViewportControls } from "./CampusViewportControls";
import { CampusTimelineViewer } from "./CampusTimelineViewer";
import { RailwayTerminalDrawer } from "./RailwayTerminalDrawer";
import { CampusSector, CampusUnitId } from "../../sim/campus/campusTypes";

interface CampusMapMasterViewProps {
  onSelectStage: (stage: Stage) => void;
}

export const CampusMapMasterView: React.FC<CampusMapMasterViewProps> = ({ onSelectStage }) => {
  const {
    units,
    factoryState,
    selectedUnitId,
    selectUnit,
    activeSectorFilter,
    setSectorFilter,
    getTelemetrySummary,
    eventLog,
    railwayTerminalState,
  } = useCampusStore();

  const { year, month, cash } = useSimulationClockStore();
  const telemetry = getTelemetrySummary();

  // Modals & Panels State
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsTab, setAnalyticsTab] = useState<"budget" | "statistics" | "workforce" | "beautification" | "railway">("budget");
  const [showRailwayDrawer, setShowRailwayDrawer] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTimelineViewer, setShowTimelineViewer] = useState(false);
  const [isPhotoModeActive, setIsPhotoModeActive] = useState(false);

  const unreadNotificationsCount = eventLog.filter((e) => !e.isRead).length;

  const sectorFilters: { id: "ALL" | CampusSector; label: string; count: number }[] = [
    { id: "ALL", label: "ALL UNITS", count: 14 },
    { id: "CORPORATE_MANAGEMENT", label: "CORPORATE", count: 1 },
    { id: "ENGINEERING_RND", label: "ENGINEERING R&D", count: 6 },
    { id: "MOTORSPORT_COMMERCIAL", label: "MOTORSPORT", count: 2 },
    { id: "MANUFACTURING_SUPPLY_CHAIN", label: "MANUFACTURING", count: 4 },
    { id: "COMMERCIAL_MARKET", label: "MARKET & SALES", count: 1 },
  ];

  const filteredUnits = Object.values(units).filter((unit) => {
    if (activeSectorFilter === "ALL") return true;
    return unit.sector === activeSectorFilter;
  });

  // Calculate Campus Prestige Score (0-100) based on building levels and staff
  const avgLevel = Object.values(units).reduce((acc, u) => acc + u.level, 0) / 14;
  const prestigeScore = Math.min(
    100,
    Math.round(
      (avgLevel / 7) * 70 + (telemetry.totalCurrentStaff / telemetry.totalStaffCapacity) * 30
    )
  );

  // Global Keyboard Shortcuts (Phase 199)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key >= "1" && e.key <= "9") {
        const num = parseInt(e.key, 10);
        const target = Object.values(units).find((u) => u.unitNumber === num);
        if (target) selectUnit(target.id);
      } else if (e.key === "0") {
        const factory = Object.values(units).find((u) => u.unitNumber === 10);
        if (factory) selectUnit(factory.id);
      } else if (e.key === "Escape") {
        if (showAnalyticsModal) setShowAnalyticsModal(false);
        else if (showRailwayDrawer) setShowRailwayDrawer(false);
        else if (showNotificationDrawer) setShowNotificationDrawer(false);
        else if (showComparisonModal) setShowComparisonModal(false);
        else if (showTutorial) setShowTutorial(false);
        else if (isPhotoModeActive) setIsPhotoModeActive(false);
        else selectUnit(null);
      } else if (e.key === "m" || e.key === "M") {
        setAnalyticsTab("budget");
        setShowAnalyticsModal((prev) => !prev);
      } else if (e.key === "r" || e.key === "R") {
        setShowRailwayDrawer((prev) => !prev);
      } else if (e.key === "n" || e.key === "N") {
        setShowNotificationDrawer((prev) => !prev);
      } else if (e.key === "c" || e.key === "C") {
        setShowComparisonModal((prev) => !prev);
      } else if (e.key === "p" || e.key === "P") {
        setIsPhotoModeActive((prev) => !prev);
      } else if (e.key === "t" || e.key === "T") {
        setShowTimelineViewer((prev) => !prev);
      } else if (e.key === "?") {
        setShowTutorial((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    units,
    selectUnit,
    showAnalyticsModal,
    showRailwayDrawer,
    showNotificationDrawer,
    showComparisonModal,
    showTutorial,
    showTimelineViewer,
    isPhotoModeActive,
  ]);

  const handleOpenAnalyticsWithTab = (tab: "budget" | "statistics" | "workforce") => {
    setAnalyticsTab(tab);
    setShowAnalyticsModal(true);
  };

  return (
    <SubPageLayout
      title="Automotive Corporate Campus"
      category="13 HQ Buildings + 1 Manufacturing Plant (14 Units)"
      icon={<Building2 size={20} className="text-cyan-400" />}
      onSelectStage={onSelectStage}
    >
      <div className="w-full flex-1 flex flex-col gap-3 min-h-0 relative">
        {/* ── PHOTO MODE BANNER ── */}
        {isPhotoModeActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#f8f6f0]/95 border border-[#dad4c5] backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Camera size={16} className="text-amber-600" />
            <span className="text-xs font-mono font-extrabold text-slate-900">
              PHOTO MODE ACTIVE
            </span>
            <span className="text-[11px] text-slate-500 font-mono">• Press P or Esc to exit</span>
            <button
              onClick={() => setIsPhotoModeActive(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── TOP CAMPUS TELEMETRY DASHBOARD (Phase 191) ── */}
        {!isPhotoModeActive && (
          <div className="w-full p-3.5 rounded-2xl bg-[#f8f6f0]/95 border border-[#dad4c5] backdrop-blur-md flex items-center justify-between flex-wrap gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-700 shadow-xs">
                <Building2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-wide font-mono">
                    APEX GLOBAL AUTOMOTIVE CAMPUS
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                    {year} ERA
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  14 Dedicated Units • 13 HQ Buildings • 1 Manufacturing Plant
                </p>
              </div>
            </div>

            {/* Key Campus Metrics (Clickable to jump into analytics tabs) */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <div
                onClick={() => handleOpenAnalyticsWithTab("workforce")}
                title="Click to view workforce distribution"
                className="px-3 py-1.5 rounded-xl bg-[#ffffff]/90 border border-[#dad4c5] hover:border-cyan-400 cursor-pointer flex items-center gap-2 shadow-xs transition-all"
              >
                <Users size={14} className="text-cyan-600" />
                <div>
                  <span className="text-[9px] text-slate-500 block leading-tight font-sans font-bold">
                    TOTAL STAFF
                  </span>
                  <span className="font-bold text-slate-900">
                    {telemetry.totalCurrentStaff} / {telemetry.totalStaffCapacity}
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleOpenAnalyticsWithTab("budget")}
                title="Click to view detailed monthly budget"
                className="px-3 py-1.5 rounded-xl bg-[#ffffff]/90 border border-[#dad4c5] hover:border-amber-400 cursor-pointer flex items-center gap-2 shadow-xs transition-all"
              >
                <DollarSign size={14} className="text-amber-600" />
                <div>
                  <span className="text-[9px] text-slate-500 block leading-tight font-sans font-bold">
                    MAINTENANCE
                  </span>
                  <span className="font-bold text-amber-700">
                    ${(telemetry.totalMonthlyExpenses / 1e3).toFixed(0)}k/mo
                  </span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#ffffff]/90 border border-[#dad4c5] flex items-center gap-2 shadow-xs">
                <Cpu size={14} className="text-emerald-600" />
                <div>
                  <span className="text-[9px] text-slate-500 block leading-tight font-sans font-bold">
                    R&D VELOCITY
                  </span>
                  <span className="font-bold text-emerald-700">
                    +{telemetry.rndSpeedBonusPct}%
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleOpenAnalyticsWithTab("statistics")}
                title="Click to view campus prestige breakdown"
                className="px-3 py-1.5 rounded-xl bg-[#ffffff]/90 border border-[#dad4c5] hover:border-indigo-400 cursor-pointer flex items-center gap-2 shadow-xs transition-all"
              >
                <Award size={14} className="text-indigo-600" />
                <div>
                  <span className="text-[9px] text-slate-500 block leading-tight font-sans font-bold">
                    CAMPUS PRESTIGE
                  </span>
                  <span className="font-bold text-indigo-700">{prestigeScore} / 100</span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#ffffff]/90 border border-[#dad4c5] flex items-center gap-2 shadow-xs">
                <Factory size={14} className="text-amber-600" />
                <div>
                  <span className="text-[9px] text-slate-500 block leading-tight font-sans font-bold">
                    PLANT STATUS
                  </span>
                  <span
                    className={`font-bold ${
                      factoryState.ownershipStatus === "no_factory_outsourced"
                        ? "text-amber-700"
                        : factoryState.ownershipStatus === "under_construction"
                        ? "text-cyan-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {factoryState.ownershipStatus === "no_factory_outsourced"
                      ? "OUTSOURCED"
                      : factoryState.ownershipStatus === "under_construction"
                      ? "CONSTRUCTION"
                      : "OWNED PLANT"}
                  </span>
                </div>
              </div>

              {/* Railway Terminal Status (Clickable to open Terminal Drawer) */}
              <div
                onClick={() => setShowRailwayDrawer(true)}
                title="HQ Cargo Railway Terminal & Network Concessions (R)"
                className="px-3 py-1.5 rounded-xl bg-[#ffffff]/90 border border-[#dad4c5] hover:border-cyan-500 cursor-pointer flex items-center gap-2 shadow-xs transition-all"
              >
                <Train size={14} className="text-cyan-700" />
                <div>
                  <span className="text-[9px] text-slate-500 block leading-tight font-sans font-bold">
                    RAIL LOGISTICS
                  </span>
                  <span
                    className={`font-bold ${
                      railwayTerminalState.level === 0
                        ? "text-slate-500"
                        : railwayTerminalState.operationalStatus === "under_construction"
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {railwayTerminalState.level === 0
                      ? "UNBUILT"
                      : railwayTerminalState.operationalStatus === "under_construction"
                      ? `L${railwayTerminalState.level} (BUILD)`
                      : `LEVEL ${railwayTerminalState.level}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Analytics, Compare, Notifications, Guide */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-300">
                <button
                  onClick={() => {
                    setAnalyticsTab("budget");
                    setShowAnalyticsModal(true);
                  }}
                  title="Campus Analytics & Financials (M)"
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-[#dad4c5] hover:border-cyan-500 text-slate-700 hover:text-cyan-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <BarChart3 size={14} className="text-cyan-700" />
                  <span className="hidden sm:inline">ANALYTICS</span>
                </button>

                <button
                  onClick={() => setShowComparisonModal(true)}
                  title="Compare Facilities (C)"
                  className="p-1.5 rounded-xl bg-white border border-[#dad4c5] hover:border-indigo-500 text-slate-700 hover:text-indigo-800 transition-all shadow-xs"
                >
                  <ArrowLeftRight size={16} />
                </button>

                <button
                  onClick={() => setShowNotificationDrawer(true)}
                  title="Campus Event Log & Notifications (N)"
                  className="relative p-1.5 rounded-xl bg-white border border-[#dad4c5] hover:border-cyan-500 text-slate-700 hover:text-cyan-800 transition-all shadow-xs"
                >
                  <Bell size={16} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-700 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowTutorial(true)}
                  title="Campus Guide & Onboarding (?)"
                  className="p-1.5 rounded-xl bg-white border border-[#dad4c5] hover:border-emerald-500 text-slate-700 hover:text-emerald-800 transition-all shadow-xs"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTOR FILTER CHIPS ── */}
        {!isPhotoModeActive && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {sectorFilters.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSectorFilter(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeSectorFilter === sec.id
                    ? "bg-cyan-700 text-white shadow-sm border border-cyan-800"
                    : "bg-[#f8f6f0]/90 text-slate-700 hover:text-slate-900 border border-[#dad4c5] hover:bg-white"
                }`}
              >
                <span>{sec.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeSectorFilter === sec.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {sec.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── CENTRAL 3D CAMPUS VIEWPORT & OVERLAYS ── */}
        <div className="relative flex-1 w-full rounded-2xl overflow-hidden min-h-[500px] border border-[#dad4c5] shadow-lg">
          <Campus3DMapViewport
            onSelectUnit={(uId) => selectUnit(uId)}
            onOpenRailwayTerminal={() => setShowRailwayDrawer(true)}
          />

          {/* Viewport Control Dock (Phases 199, 200, 201, 202) */}
          <CampusViewportControls
            onTogglePhotoMode={(active) => setIsPhotoModeActive(active)}
            isPhotoModeActive={isPhotoModeActive}
            onOpenTutorial={() => setShowTutorial(true)}
            onOpenComparison={() => setShowComparisonModal(true)}
            onOpenAnalytics={() => {
              setAnalyticsTab("budget");
              setShowAnalyticsModal(true);
            }}
            onOpenNotifications={() => setShowNotificationDrawer(true)}
            onToggleTimeline={() => setShowTimelineViewer((prev) => !prev)}
            isTimelineOpen={showTimelineViewer}
          />

          {/* Phase 192: Collapsible Building Tree Sidebar */}
          {!isPhotoModeActive && <CampusTreeSidebar />}

          {/* Phase 190: Construction Queue Dock Widget */}
          {!isPhotoModeActive && <ConstructionQueuePanel />}

          {/* Phase 183–188: Redesigned 5-Tab Building Inspector Drawer */}
          {!isPhotoModeActive && <BuildingInspectorDrawer />}

          {/* Phase 218: Campus Timeline Viewer */}
          {!isPhotoModeActive && (
            <CampusTimelineViewer
              isOpen={showTimelineViewer}
              onClose={() => setShowTimelineViewer(false)}
            />
          )}
        </div>

        {/* ── BOTTOM UNIT SELECTOR STRIP ── */}
        {!isPhotoModeActive && (
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {filteredUnits.map((u) => {
              const isSelected = selectedUnitId === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => selectUnit(u.id)}
                  className={`min-w-[190px] p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between shrink-0 shadow-xs ${
                    isSelected
                      ? "bg-cyan-50/90 border-cyan-500 shadow-sm shadow-cyan-100"
                      : u.status === "locked"
                      ? "bg-[#f1eee4]/70 border-dashed border-[#c2bcae] hover:border-slate-500"
                      : "bg-[#f8f6f0]/90 border-[#dad4c5] hover:border-slate-400 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-cyan-700 text-white"
                          : u.status === "locked"
                          ? "bg-[#e5e1d5] text-slate-500 border border-[#c2bcae]"
                          : "bg-[#ece8dc] text-slate-800 border border-[#dad4c5]"
                      }`}
                    >
                      {u.unitNumber.toString().padStart(2, "0")}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold truncate max-w-[105px] ${
                          u.status === "locked" ? "text-slate-500" : "text-slate-900"
                        }`}
                      >
                        {u.shortName}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {u.status === "locked"
                          ? "Reserved Plot"
                          : u.isFactory
                          ? factoryState.ownershipStatus === "no_factory_outsourced"
                            ? "Outsourced"
                            : "Owned"
                          : u.prototypeCapacity
                          ? `Garage (Cap: ${u.prototypeCapacity})`
                          : `Level ${u.level}`}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      u.status === "operational"
                        ? "bg-emerald-500 shadow-xs"
                        : u.status === "locked"
                        ? "bg-slate-400 border border-slate-300"
                        : u.status === "outsourced"
                        ? "bg-amber-500"
                        : "bg-cyan-500"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODALS & OVERLAYS ── */}
      <CampusAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        defaultTab={analyticsTab}
      />

      <CampusNotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
      />

      <BuildingComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        initialUnitAId={selectedUnitId || "CENTRAL_CORPORATE_HQ"}
      />

      <CampusTutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      {/* HQ Cargo Railway Terminal Drawer (Phase 200) */}
      <RailwayTerminalDrawer
        isOpen={showRailwayDrawer}
        onClose={() => setShowRailwayDrawer(false)}
      />
    </SubPageLayout>
  );
};

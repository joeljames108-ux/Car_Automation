import React, { useState } from "react";
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  HardHat,
  Trophy,
  Info,
  Calendar,
  Building2,
  ExternalLink
} from "lucide-react";
import { useCampusStore } from "../../state/campusStore";
import { CampusUnitId } from "../../sim/campus/campusTypes";
import { CampusEventType, EventSeverity } from "../../sim/campus/campusEvents";

interface CampusNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusNotificationDrawer: React.FC<CampusNotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { eventLog, markEventRead, clearEventLog, selectUnit, units } = useCampusStore();
  const [filter, setFilter] = useState<"ALL" | "CONSTRUCTION" | "INCIDENTS" | "MILESTONES" | "FACTORY">("ALL");

  if (!isOpen) return null;

  const unreadCount = eventLog.filter((e) => !e.isRead).length;

  const filteredEvents = eventLog.filter((e) => {
    if (filter === "ALL") return true;
    if (filter === "CONSTRUCTION") {
      return e.type === "CONSTRUCTION_STARTED" || e.type === "CONSTRUCTION_COMPLETED" || e.type === "PLOT_UNLOCKED";
    }
    if (filter === "INCIDENTS") {
      return (
        e.type === "INCIDENT_ELECTRICAL_SHORT" ||
        e.type === "INCIDENT_FROZEN_PIPES" ||
        e.type === "DISASTER_FIRE" ||
        e.type === "DISASTER_FLOOD" ||
        e.type === "FACTORY_LINE_BREAKDOWN" ||
        e.type === "FACTORY_PRODUCTION_STARVED"
      );
    }
    if (filter === "MILESTONES") {
      return e.type === "STAFF_MILESTONE" || e.type === "CAMPUS_AWARD" || e.type === "LEVEL_UP" || e.type === "DEPARTMENT_OPENED";
    }
    if (filter === "FACTORY") {
      return e.type.startsWith("FACTORY_");
    }
    return true;
  });

  const getSeverityStyle = (severity: EventSeverity) => {
    switch (severity) {
      case "success":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-300",
          iconBg: "bg-emerald-100 text-emerald-700",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 size={16} />,
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-300",
          iconBg: "bg-amber-100 text-amber-700",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <AlertTriangle size={16} />,
        };
      case "error":
        return {
          bg: "bg-rose-50",
          border: "border-rose-300",
          iconBg: "bg-rose-100 text-rose-700",
          badge: "bg-rose-100 text-rose-800 border-rose-200",
          icon: <AlertTriangle size={16} />,
        };
      case "info":
      default:
        return {
          bg: "bg-cyan-50",
          border: "border-cyan-300",
          iconBg: "bg-cyan-100 text-cyan-700",
          badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
          icon: <Info size={16} />,
        };
    }
  };

  const handleInspectUnit = (unitId?: CampusUnitId) => {
    if (unitId && units[unitId]) {
      selectUnit(unitId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out drawer */}
      <div className="relative w-full max-w-md h-full bg-[#f8f6f0] border-l border-[#dad4c5] shadow-2xl pointer-events-auto flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#dad4c5] bg-white/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-700">
              <Bell size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 font-mono tracking-wide">
                  CAMPUS NOTIFICATIONS
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-700 text-white font-mono">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Live operational & construction logs</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {eventLog.length > 0 && (
              <>
                <button
                  onClick={() => {
                    eventLog.forEach((e) => markEventRead(e.id));
                  }}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <CheckCheck size={16} />
                </button>
                <button
                  onClick={clearEventLog}
                  title="Clear event log"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-[#dad4c5] bg-[#f4f0e6]/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(
            [
              { id: "ALL", label: "ALL EVENTS" },
              { id: "CONSTRUCTION", label: "CONSTRUCTION" },
              { id: "INCIDENTS", label: "INCIDENTS" },
              { id: "MILESTONES", label: "MILESTONES" },
              { id: "FACTORY", label: "FACTORY" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? "bg-cyan-700 text-white shadow-xs"
                  : "bg-white/80 text-slate-600 hover:text-slate-900 border border-[#dad4c5]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
          {filteredEvents.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#dad4c5] rounded-2xl bg-white/50">
              <Bell size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700 font-mono">NO NOTIFICATIONS</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[220px]">
                {filter === "ALL"
                  ? "Campus operational events, construction updates, and milestones will appear here."
                  : `No ${filter.toLowerCase()} events recorded in the campus log.`}
              </p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const style = getSeverityStyle(evt.severity);
              const relatedUnit = evt.unitId ? units[evt.unitId] : null;

              return (
                <div
                  key={evt.id}
                  onClick={() => markEventRead(evt.id)}
                  className={`p-3 rounded-xl border transition-all ${style.bg} ${style.border} ${
                    !evt.isRead ? "shadow-xs ring-1 ring-cyan-500/30" : "opacity-90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
                        {style.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 font-sans leading-tight">
                          {evt.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {evt.year} • M{evt.month.toString().padStart(2, "0")}
                          </span>
                          {!evt.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 inline-block" />
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${style.badge}`}>
                      {evt.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 mt-2 leading-relaxed">
                    {evt.message}
                  </p>

                  {/* Actions / Metadata footer */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 text-[10px]">
                    {relatedUnit ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspectUnit(evt.unitId);
                        }}
                        className="flex items-center gap-1 font-mono font-bold text-cyan-700 hover:text-cyan-900 bg-white/80 px-2 py-0.5 rounded border border-cyan-200 hover:bg-cyan-50 transition-colors"
                      >
                        <Building2 size={11} />
                        <span>{relatedUnit.shortName}</span>
                        <ExternalLink size={10} />
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono">Campus-wide</span>
                    )}

                    {evt.repairCost && evt.repairCost > 0 && (
                      <span className="text-rose-700 font-mono font-bold">
                        Repair: ${evt.repairCost.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#dad4c5] bg-white/60 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            Auto Tycoon Campus Logistics • Phase 195 Notification Engine
          </p>
        </div>
      </div>
    </div>
  );
};

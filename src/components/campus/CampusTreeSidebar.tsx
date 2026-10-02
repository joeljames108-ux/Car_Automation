import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Building2,
  Lock,
  Layers,
  Factory,
  Wrench,
  PanelLeftClose,
  PanelLeft,
  Users
} from "lucide-react";
import { useCampusStore } from "../../state/campusStore";
import { CampusUnitDefinition, CampusUnitId, CampusZone } from "../../sim/campus/campusTypes";
import { CAMPUS_PLOTS } from "../../sim/campus/campusPlotCoordinates";

interface ZoneGroup {
  zoneId: CampusZone;
  name: string;
  color: string;
  badgeBg: string;
  units: CampusUnitDefinition[];
}

export const CampusTreeSidebar: React.FC = () => {
  const {
    units,
    selectedUnitId,
    selectUnit,
    setCameraFocusTarget,
  } = useCampusStore();

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({});

  const toggleZone = (zoneId: string) => {
    setCollapsedZones(prev => ({ ...prev, [zoneId]: !prev[zoneId] }));
  };

  const zoneGroups: ZoneGroup[] = useMemo(() => {
    const groups: Record<CampusZone, ZoneGroup> = {
      ZONE_C: {
        zoneId: "ZONE_C",
        name: "Zone C: Core Styling & Corporate",
        color: "text-amber-700",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
        units: [],
      },
      ZONE_B: {
        zoneId: "ZONE_B",
        name: "Zone B: Engineering & Validation",
        color: "text-blue-700",
        badgeBg: "bg-blue-100 text-blue-800 border-blue-300",
        units: [],
      },
      ZONE_A: {
        zoneId: "ZONE_A",
        name: "Zone A: Logistics & Production",
        color: "text-rose-700",
        badgeBg: "bg-rose-100 text-rose-800 border-rose-300",
        units: [],
      },
      ZONE_D: {
        zoneId: "ZONE_D",
        name: "Zone D: Special Ops & Perimeter",
        color: "text-emerald-700",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
        units: [],
      },
    };

    Object.values(units).forEach(u => {
      const plot = CAMPUS_PLOTS[u.id];
      const zone = plot ? plot.zoneId : "ZONE_B";
      if (groups[zone]) {
        if (!searchQuery || 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.shortName.toLowerCase().includes(searchQuery.toLowerCase())) {
          groups[zone].units.push(u);
        }
      }
    });

    return Object.values(groups);
  }, [units, searchQuery]);

  const handleSelectBuilding = (unitId: CampusUnitId) => {
    selectUnit(unitId);
    const plot = CAMPUS_PLOTS[unitId];
    if (plot) {
      setCameraFocusTarget([plot.worldPosition.x, 0, plot.worldPosition.z]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 z-20 p-2.5 rounded-xl bg-[#f8f6f0]/95 backdrop-blur-md border border-[#dad4c5] hover:border-slate-400 text-slate-700 hover:text-slate-900 shadow-md transition-all flex items-center gap-1.5 font-mono text-xs"
        title="Open Campus Facilities Tree"
      >
        <PanelLeft size={16} className="text-cyan-700" />
        <span className="font-bold">FACILITIES</span>
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-20 w-80 max-h-[calc(100%-80px)] bg-[#f8f6f0]/95 backdrop-blur-xl border border-[#dad4c5] rounded-2xl shadow-xl flex flex-col overflow-hidden text-slate-900 animate-in fade-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-3 bg-[#f1eee4]/90 border-b border-[#dad4c5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-cyan-700" />
          <span className="font-mono font-bold text-xs text-slate-900 tracking-wider">
            CAMPUS DIRECTORY
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
          title="Collapse Directory"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b border-[#dad4c5] bg-white/60">
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search facility by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#dad4c5] text-[11px] font-mono focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Zone Hierarchy List */}
      <div className="p-2 overflow-y-auto flex-1 space-y-2 text-xs font-mono">
        {zoneGroups.map(group => {
          if (group.units.length === 0) return null;
          const isCollapsed = collapsedZones[group.zoneId];

          return (
            <div key={group.zoneId} className="rounded-xl overflow-hidden border border-[#dad4c5] bg-white/70 shadow-2xs">
              {/* Zone Header */}
              <div
                onClick={() => toggleZone(group.zoneId)}
                className="p-2 bg-[#ece7da]/70 flex items-center justify-between cursor-pointer select-none hover:bg-[#ece7da] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {isCollapsed ? <ChevronRight size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
                  <span className={`font-bold text-[10px] ${group.color}`}>
                    {group.name}
                  </span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${group.badgeBg}`}>
                  {group.units.length}
                </span>
              </div>

              {/* Units List */}
              {!isCollapsed && (
                <div className="divide-y divide-[#eee9dc]">
                  {group.units.map(unit => {
                    const isSelected = selectedUnitId === unit.id;
                    const isLocked = unit.status === "locked";

                    return (
                      <div
                        key={unit.id}
                        onClick={() => handleSelectBuilding(unit.id)}
                        className={`p-2 flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "bg-cyan-50/90 text-cyan-950 font-bold border-l-4 border-cyan-600 pl-1.5"
                            : isLocked
                            ? "bg-transparent text-slate-500 hover:bg-slate-50 opacity-75"
                            : "bg-transparent hover:bg-white/90 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-1">
                          <span className={`w-5 h-5 rounded font-mono text-[9px] flex items-center justify-center shrink-0 font-bold ${
                            isSelected
                              ? "bg-cyan-700 text-white"
                              : isLocked
                              ? "bg-slate-200 text-slate-500 border border-slate-300"
                              : "bg-[#e5e1d5] text-slate-700 border border-[#dad4c5]"
                          }`}>
                            {unit.unitNumber.toString().padStart(2, "0")}
                          </span>
                          <div className="truncate">
                            <span className="text-[11px] block truncate leading-tight">
                              {unit.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-normal">
                              {unit.code} • {isLocked ? "Reserved Plot" : `Level ${unit.level}`}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {isLocked ? (
                            <Lock size={12} className="text-amber-600" />
                          ) : (
                            <span className="text-[9px] text-slate-500 font-mono">
                              {unit.currentStaff}p
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

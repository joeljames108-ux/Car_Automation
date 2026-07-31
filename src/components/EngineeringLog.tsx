import { useState } from "react";
import { Globe, RefreshCw, CheckCircle2, AlertCircle, Info, ChevronRight, Sliders, Cpu, ShieldCheck } from "lucide-react";
import { useDesign } from "../state/DesignContext";

interface LogEntry {
  id: string;
  category: "aero" | "material" | "powertrain" | "chassis" | "safety";
  title: string;
  subtext?: string;
  status: "approved" | "suggestion" | "info" | "warning";
  timestamp: string;
}

export function EngineeringLog() {
  const { sim, design } = useDesign();
  const [filter, setFilter] = useState<"all" | "approved" | "suggestions">("all");

  const logs: LogEntry[] = [
    {
      id: "1",
      category: "aero",
      title: `Aero simulation completed (v${(design.vehicle.aero?.drs ? "2.4" : "2.1")})`,
      status: "info",
      timestamp: "Just now",
    },
    {
      id: "2",
      category: "aero",
      title: "Rear wing angle suggestion:",
      subtext: (design.vehicle.aero?.wingAngle ?? 10) > 12 ? "-2° for drag reduction" : "+2° for downforce",
      status: "suggestion",
      timestamp: "1m ago",
    },
    {
      id: "3",
      category: "material",
      title: `Composite material test (${(design.vehicle.chassisEng?.chassisType ?? "carbon_tub").replace("_", " ")}):`,
      subtext: "Approved",
      status: "approved",
      timestamp: "3m ago",
    },
    {
      id: "4",
      category: "powertrain",
      title: `Peak power validation (${sim.peakPower} hp):`,
      subtext: "Approved",
      status: "approved",
      timestamp: "5m ago",
    },
    {
      id: "5",
      category: "chassis",
      title: `Suspension travel limit check (${design.vehicle.aero?.rideHeight ?? 80}mm):`,
      subtext: "Optimal",
      status: "approved",
      timestamp: "8m ago",
    },
    {
      id: "6",
      category: "safety",
      title: "Monocoque crash structure test:",
      subtext: "Approved",
      status: "approved",
      timestamp: "12m ago",
    },
    {
      id: "7",
      category: "aero",
      title: `CFD Drag Cd (${sim.dragCoeff.toFixed(3)}):`,
      subtext: sim.dragCoeff < 0.32 ? "Low Drag Approved" : "Moderate Drag",
      status: "approved",
      timestamp: "15m ago",
    },
    {
      id: "8",
      category: "material",
      title: "Carbon ceramic brake disc stress test:",
      subtext: "Approved",
      status: "approved",
      timestamp: "18m ago",
    },
  ];

  const filteredLogs = logs.filter((log) => {
    if (filter === "approved") return log.status === "approved";
    if (filter === "suggestions") return log.status === "suggestion";
    return true;
  });

  return (
    <div
      className="engineering-log-panel"
      style={{
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(45px) saturate(210%)",
        WebkitBackdropFilter: "blur(45px) saturate(210%)",
        border: "1px solid rgba(255, 255, 255, 0.75)",
        borderRadius: 24,
        padding: "16px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.85)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        color: "#1c1c1e",
      }}
    >
      {/* Panel Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} style={{ color: "#007aff" }} />
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: "#1c1c1e", textTransform: "uppercase" }}>
            ENGINEERING LOG
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => setFilter(filter === "all" ? "approved" : filter === "approved" ? "suggestions" : "all")}
            title="Filter Logs"
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: 8,
              padding: "4px 8px",
              fontSize: 10,
              color: "#3a3a3c",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Globe size={11} style={{ color: "#007aff" }} />
            <span>{filter.toUpperCase()}</span>
          </button>
          <button
            title="Refresh Analysis"
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: 8,
              padding: 4,
              color: "#3a3a3c",
              cursor: "pointer",
            }}
          >
            <Sliders size={12} />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 460, overflowY: "auto" }}>
        {filteredLogs.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              background: "rgba(255, 255, 255, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.85)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1c1c1e", lineHeight: 1.3 }}>
              {entry.title}
            </div>

            {entry.subtext && (
              <div style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                {entry.status === "approved" && (
                  <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} /> Approved
                  </span>
                )}
                {entry.status === "suggestion" && (
                  <span style={{ color: "#007aff", fontWeight: 700 }}>
                    {entry.subtext}
                  </span>
                )}
                {entry.status === "info" && (
                  <span style={{ color: "#94a3b8" }}>{entry.subtext}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live System Telemetry Summary Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.10)",
          paddingTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 10,
          color: "#94a3b8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Cpu size={12} style={{ color: "#38bdf8" }} />
          <span>Apex AI Log v2.4</span>
        </div>
        <span style={{ color: "#34d399", fontWeight: 600 }}>● Connected</span>
      </div>
    </div>
  );
}

import React from "react";
import { Activity, Gauge } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section } from "./ui/Controls";
import { PerformanceKPIGrid } from "./ui/PerformanceKPIGrid";
import { PowerTorqueCurveChart } from "./ui/PowerTorqueCurveChart";
import { LapTimesPanel } from "./ui/LapTimesPanel";

export function SimulationDashboard() {
  const { design, sim } = useDesign();

  return (
    <div className="space-y-4 stagger">
      <Section title="Performance Summary" icon={<Gauge size={16} />}>
        <PerformanceKPIGrid sim={sim} />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger">
        <Section title="Power & Torque Curve" icon={<Activity size={16} />}>
          <PowerTorqueCurveChart powerCurve={sim.powerCurve} height={220} />
        </Section>

        <LapTimesPanel lapTimes={sim.lapTimes} design={design} sim={sim} mode="bars_only" />
      </div>

      <LapTimesPanel lapTimes={sim.lapTimes} design={design} sim={sim} mode="table_only" />
    </div>
  );
}


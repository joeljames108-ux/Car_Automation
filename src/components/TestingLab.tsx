import { useDesign, fmtSpeed, fmtDistance } from "../state/DesignContext";
import { Section, StatTile } from "./ui/Controls";
import { Wind, ShieldAlert, Disc, CircleDot, Spline, Star, Activity, Thermometer, AlertTriangle } from "lucide-react";

export function TestingLab() {
  const { sim, design } = useDesign();
  const t = sim.testing;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Testing Laboratory</h2>
        <p className="text-sm text-slate-500">Virtual validation: wind tunnel, crash safety, braking, skidpad, and slalom. All tests run live against the current design.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Wind Tunnel */}
        <Section title="Wind Tunnel" icon={<Wind size={14} />} className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <StatTile label="Lift/Drag Ratio" value={t.windTunnel.liftDragRatio.toFixed(2)} accent={t.windTunnel.liftDragRatio > 1.5 ? "ok" : "warn"} />
            <StatTile label="Aero Efficiency" value={t.windTunnel.aeroEfficiency} unit="/100" accent="accent" />
            <StatTile label="Balance Score" value={t.windTunnel.balanceScore} unit="/100" accent={t.windTunnel.balanceScore > 70 ? "ok" : "warn"} />
            <StatTile label="Cooling Flow" value={t.windTunnel.coolingFlow} unit="/100" accent={t.windTunnel.coolingFlow > 60 ? "ok" : "danger"} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-base-850 rounded-lg p-3 border border-base-800">
              <div className="label-mono text-slate-500 mb-1">Drag Coefficient</div>
              <div className="font-mono text-lg text-slate-200">{sim.dragCoeff.toFixed(3)}</div>
            </div>
            <div className="bg-base-850 rounded-lg p-3 border border-base-800">
              <div className="label-mono text-slate-500 mb-1">Downforce</div>
              <div className="font-mono text-lg text-accent-300">{Math.round(sim.downforce)} N</div>
            </div>
            <div className="bg-base-850 rounded-lg p-3 border border-base-800">
              <div className="label-mono text-slate-500 mb-1">Frontal Area</div>
              <div className="font-mono text-lg text-slate-200">{sim.frontalArea.toFixed(2)} m²</div>
            </div>
          </div>
          {/* Aero balance bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="label-mono">Aero Balance (Front ↔ Rear)</span>
              <span className="font-mono text-slate-400">{Math.round(sim.aeroBalance * 100)}% / {Math.round((1 - sim.aeroBalance) * 100)}%</span>
            </div>
            <div className="h-3 bg-gradient-to-r from-accent-500/30 to-ok-500/30 rounded-full overflow-hidden border border-base-800">
              <div className="h-full bg-accent-500 rounded-full transition-all duration-500" style={{ width: `${sim.aeroBalance * 100}%` }} />
            </div>
          </div>
        </Section>

        {/* Crash Test */}
        <Section title="Crash Test" icon={<ShieldAlert size={14} />}>
          <div className="flex items-center justify-center mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={28}
                  className={s <= t.crashTest.starRating ? "text-warn-400 fill-warn-400" : "text-base-700"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <ScoreBar label="Frontal Impact" value={t.crashTest.frontalScore} />
            <ScoreBar label="Side Impact" value={t.crashTest.sideScore} />
            <ScoreBar label="Rollover" value={t.crashTest.rolloverScore} />
            <ScoreBar label="Overall" value={t.crashTest.overall} />
          </div>
        </Section>

        {/* Brake Test */}
        <Section title="Brake Test" icon={<Disc size={14} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="60-0 Stop" value={fmtDistance(t.brakeTest.stopDist60_0, "metric")} accent={t.brakeTest.stopDist60_0 < 18 ? "ok" : "warn"} />
            <StatTile label="100-0 Stop" value={fmtDistance(t.brakeTest.stopDist100_0, "metric")} accent={t.brakeTest.stopDist100_0 < 35 ? "ok" : "warn"} />
            <StatTile label="Fade Resistance" value={t.brakeTest.fadeResistance} unit="/100" accent={t.brakeTest.fadeResistance > 70 ? "ok" : "warn"} />
            <StatTile label="Consistency" value={t.brakeTest.consistency} unit="/100" accent={t.brakeTest.consistency > 80 ? "ok" : "warn"} />
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <Thermometer size={12} />
            <span>Brake disc: {design.vehicle.brakeDiscSize}mm · Pad compound: {design.vehicle.brakePadCompound}</span>
          </div>
        </Section>

        {/* Skidpad */}
        <Section title="Skidpad" icon={<CircleDot size={14} />}>
          <div className="grid grid-cols-1 gap-2">
            <StatTile label="Max Lateral G" value={t.skidpadTest.maxLateralG} unit="g" accent="accent" />
            <StatTile label="Balance" value={t.skidpadTest.balance} unit="/100" accent={t.skidpadTest.balance > 70 ? "ok" : "warn"} />
            <StatTile label="Grip Score" value={t.skidpadTest.gripScore} unit="/100" accent={t.skidpadTest.gripScore > 70 ? "ok" : "warn"} />
          </div>
          <div className="mt-3">
            <GaugeMeter value={t.skidpadTest.maxLateralG} max={3.5} label="Lateral G" />
          </div>
        </Section>

        {/* Slalom */}
        <Section title="Slalom" icon={<Spline size={14} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Max Speed" value={fmtSpeed(t.slalomTest.maxSpeed, "metric")} accent="accent" />
            <StatTile label="Transition" value={t.slalomTest.transitionTime} unit="s" accent={t.slalomTest.transitionTime < 1.5 ? "ok" : "warn"} />
            <StatTile label="Stability" value={t.slalomTest.stability} unit="/100" accent={t.slalomTest.stability > 75 ? "ok" : "warn"} />
            <StatTile label="CG Height" value={sim.cgHeight} unit="mm" accent={sim.cgHeight < 350 ? "ok" : "warn"} />
          </div>
        </Section>
      </div>

      {/* Overall performance summary */}
      <Section title="Performance Summary" icon={<Activity size={14} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <StatTile label="Top Speed" value={fmtSpeed(sim.topSpeed, "metric")} accent="accent" />
          <StatTile label="0-100 km/h" value={sim.accel0_100} unit="s" accent={sim.accel0_100 < 4 ? "ok" : "default"} />
          <StatTile label="Quarter Mile" value={sim.quarterMile} unit="s" accent="default" />
          <StatTile label="Half Mile" value={sim.halfMile} unit="s" accent="default" />
          <StatTile label="Lateral G" value={sim.lateralG} unit="g" accent="accent" />
          <StatTile label="Slalom" value={fmtSpeed(sim.slalomSpeed, "metric")} accent="default" />
        </div>
      </Section>

      {/* Warnings */}
      {sim.coolingMargin < 0.3 && (
        <div className="flex items-center gap-2 text-xs text-warn-400 bg-warn-500/10 border border-warn-500/30 rounded-lg px-3 py-2">
          <AlertTriangle size={14} />
          <span>Cooling margin is low ({Math.round(sim.coolingMargin * 100)}%). Consider larger cooling ducts or a more efficient radiator.</span>
        </div>
      )}
      {t.crashTest.starRating < 4 && (
        <div className="flex items-center gap-2 text-xs text-danger-400 bg-danger-500/10 border border-danger-500/30 rounded-lg px-3 py-2">
          <AlertTriangle size={14} />
          <span>Crash safety below 4 stars. Strengthen the frame material or add a roll cage.</span>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value > 80 ? "bg-ok-500" : value > 60 ? "bg-warn-500" : "bg-danger-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="label-mono">{label}</span>
        <span className="font-mono text-slate-300">{value}/100</span>
      </div>
      <div className="h-2 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function GaugeMeter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const angle = (pct / 100) * 180 - 90;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-base-800 border-b-transparent" />
        </div>
        <div
          className="absolute bottom-0 left-1/2 w-1 h-14 bg-accent-400 origin-bottom transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent-400" />
      </div>
      <div className="font-mono text-sm text-accent-300">{value.toFixed(2)}</div>
      <div className="label-mono text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

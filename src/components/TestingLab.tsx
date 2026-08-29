import React, { useId } from "react";
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
  const gradientId = useId();
  const pct = Math.max(0, Math.min(1, value / max));
  
  // 180° Top Semi-Circle Arc (sweeps clockwise over top from 270° left to 450° right)
  const W = 170;
  const H = 120;
  const cx = 85;
  const cy = 80;
  const r = 54;
  const strokeWidth = 8;

  const startAngle = 270;
  const endAngle = 450;
  const totalAngle = endAngle - startAngle;
  const activeAngle = startAngle + pct * totalAngle;

  const polarToCartesian = (x: number, y: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: x + radius * Math.cos(angleInRadians),
      y: y + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, start: number, end: number) => {
    const startPt = polarToCartesian(x, y, radius, start);
    const endPt = polarToCartesian(x, y, radius, end);
    const largeArc = end - start <= 180 ? "0" : "1";
    return `M ${startPt.x.toFixed(1)} ${startPt.y.toFixed(1)} A ${radius} ${radius} 0 ${largeArc} 1 ${endPt.x.toFixed(1)} ${endPt.y.toFixed(1)}`;
  };

  const bgArc = describeArc(cx, cy, r, startAngle, endAngle);
  const activeArc = describeArc(cx, cy, r, startAngle, Math.max(startAngle + 0.1, activeAngle));
  const knobPos = polarToCartesian(cx, cy, r, activeAngle);
  const needleEnd = polarToCartesian(cx, cy, r - 14, activeAngle);

  const ticks = [
    { label: "0", angle: 270 },
    { label: `${(max / 2).toFixed(1)}`, angle: 360 },
    { label: `${max.toFixed(1)}`, angle: 450 },
  ];

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0066ff" />
              <stop offset="50%" stopColor="#00c8ff" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Ambient Track Glow */}
          <path d={bgArc} fill="none" stroke="rgba(0, 122, 255, 0.08)" strokeWidth={strokeWidth + 10} strokeLinecap="round" />

          {/* Background Track Arc */}
          <path d={bgArc} fill="none" stroke="rgba(0, 0, 0, 0.08)" strokeWidth={strokeWidth} strokeLinecap="round" />

          {/* Active Vibrant Arc */}
          <path
            d={activeArc}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(0, 122, 255, 0.5))", transition: "all 0.3s ease-out" }}
          />

          {/* Needle Indicator */}
          <line
            x1={cx}
            y1={cy}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke="#0066ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(0, 102, 255, 0.6))", transition: "all 0.3s ease-out" }}
          />

          {/* Center Pivot Pin */}
          <circle cx={cx} cy={cy} r="5" fill="#ffffff" stroke="#0066ff" strokeWidth="2" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }} />

          {/* Glowing Indicator Knob */}
          <circle cx={knobPos.x} cy={knobPos.y} r="6.5" fill="#0066ff" stroke="#ffffff" strokeWidth="2" style={{ filter: "drop-shadow(0 0 6px rgba(0, 122, 255, 0.8))" }} />

          {/* Scale Ticks */}
          {ticks.map((t, i) => {
            const pos = polarToCartesian(cx, cy, r + 15, t.angle);
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y + 3}
                fontSize="9"
                fontWeight="700"
                fill="#3a3a3c"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {t.label}
              </text>
            );
          })}
        </svg>

        {/* Value Readout & Label (Centered underneath pivot pin) */}
        <div
          style={{
            position: "absolute",
            top: cy + 10,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div className="font-mono text-base font-black text-amber-400 leading-none">
            {value.toFixed(2)} <span className="text-xs font-bold">G</span>
          </div>
          <div className="label-mono text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-1">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

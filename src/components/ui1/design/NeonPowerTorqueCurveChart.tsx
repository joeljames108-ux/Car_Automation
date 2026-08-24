import React, { useMemo } from "react";
import { NeonEntrance } from "./useNeonEntrance";

export interface NeonPowerTorquePoint { rpm: number; power: number; torque: number }

export function NeonPowerTorqueCurveChart({ powerCurve, height = 220, className = "", powerColor = "#8fb9d9", torqueColor = "#c9974f" }: {
  powerCurve: NeonPowerTorquePoint[]; height?: number; className?: string; powerColor?: string; torqueColor?: string;
}) {
  const W = 500; const H = height;
  const pad = { top: 28, right: 60, bottom: 36, left: 50 };
  const cw = W - pad.left - pad.right; const ch = H - pad.top - pad.bottom;

  const { maxRpm, maxPower, maxTorque, powerPts, torquePts, peakPowerPt, peakTorquePt } = useMemo(() => {
    const data = powerCurve || [];
    if (data.length === 0) return { maxRpm: 1, maxPower: 1, maxTorque: 1, powerPts: [], torquePts: [], peakPowerPt: { x: 0, y: 0, rpm: 0, val: 0 }, peakTorquePt: { x: 0, y: 0, rpm: 0, val: 0 } };
    const mr = Math.max(...data.map(d => d.rpm), 1);
    const mp = Math.max(...data.map(d => d.power), 1);
    const mt = Math.max(...data.map(d => d.torque), 1);
    const sc = (rpm: number, val: number, maxVal: number) => ({ x: pad.left + (rpm / mr) * cw, y: pad.top + ch - (val / maxVal) * ch });
    const pp = data.reduce((b, d) => d.power > b.power ? d : b);
    const pt = data.reduce((b, d) => d.torque > b.torque ? d : b);
    return {
      maxRpm: mr, maxPower: mp, maxTorque: mt,
      powerPts: data.map(d => ({ ...sc(d.rpm, d.power, mp), rpm: d.rpm, val: d.power })),
      torquePts: data.map(d => ({ ...sc(d.rpm, d.torque, mt), rpm: d.rpm, val: d.torque })),
      peakPowerPt: { ...sc(pp.rpm, pp.power, mp), rpm: pp.rpm, val: pp.power },
      peakTorquePt: { ...sc(pt.rpm, pt.torque, mt), rpm: pt.rpm, val: pt.torque },
    };
  }, [powerCurve]);

  const toPath = (pts: { x: number; y: number }[]) => pts.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
  const toArea = (pts: { x: number; y: number }[]) => toPath(pts) + " L" + pts[pts.length - 1].x.toFixed(1) + "," + (pad.top + ch) + " L" + pts[0].x.toFixed(1) + "," + (pad.top + ch) + " Z";

  return (
    <NeonEntrance type="scan-reveal" className={"relative " + className}>
      <svg viewBox={"0 0 " + W + " " + H} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="npPowG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={powerColor} stopOpacity="0.18" /><stop offset="100%" stopColor={powerColor} stopOpacity="0" /></linearGradient>
          <linearGradient id="npTorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={torqueColor} stopOpacity="0.12" /><stop offset="100%" stopColor={torqueColor} stopOpacity="0" /></linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((g, i) => <line key={i} x1={pad.left} y1={pad.top + ch * (1 - g)} x2={W - pad.right} y2={pad.top + ch * (1 - g)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />)}
        <text x={pad.left - 6} y={pad.top + 4} textAnchor="end" className="fill-slate-500" style={{ fontSize: 8, fontFamily: "monospace" }}>{maxPower.toFixed(0)} hp</text>
        <text x={W - pad.right + 6} y={pad.top + 4} className="fill-slate-500" style={{ fontSize: 8, fontFamily: "monospace" }}>{maxTorque.toFixed(0)} Nm</text>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => <text key={i} x={pad.left + cw * f} y={H - 8} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 8, fontFamily: "monospace" }}>{Math.round(maxRpm * f)}</text>)}
        {powerPts.length > 1 && <path d={toArea(powerPts)} fill="url(#npPowG)" />}
        {torquePts.length > 1 && <path d={toArea(torquePts)} fill="url(#npTorG)" />}
        {powerPts.length > 1 && <path d={toPath(powerPts)} fill="none" stroke={powerColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
        {torquePts.length > 1 && <path d={toPath(torquePts)} fill="none" stroke={torqueColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />}
        <circle cx={peakPowerPt.x} cy={peakPowerPt.y} r="4" fill={powerColor} />
        <text x={peakPowerPt.x + 8} y={peakPowerPt.y - 6} fill={powerColor} style={{ fontSize: 9, fontFamily: "monospace", fontWeight: "bold" }}>{peakPowerPt.val.toFixed(0)} hp @{peakPowerPt.rpm}</text>
        <circle cx={peakTorquePt.x} cy={peakTorquePt.y} r="4" fill={torqueColor} />
        <text x={peakTorquePt.x + 8} y={peakTorquePt.y + 14} fill={torqueColor} style={{ fontSize: 9, fontFamily: "monospace", fontWeight: "bold" }}>{peakTorquePt.val.toFixed(0)} Nm @{peakTorquePt.rpm}</text>
      </svg>
    </NeonEntrance>
  );
}
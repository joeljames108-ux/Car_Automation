import React, { useEffect, useState, useMemo } from "react";

interface SVGCProps { progress: number; }

const EngineSVG: React.FC<SVGCProps> = ({ progress }) => (
  <svg viewBox="0 0 240 140" className="w-48 h-28">
    <defs><radialGradient id="eg"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" /><stop offset="100%" stopColor="#92400e" stopOpacity="0" /></radialGradient></defs>
    <circle cx="120" cy="60" r="55" fill="url(#eg)" opacity={0.3+progress*0.4} />
    <rect x="50" y="85" width="140" height="10" rx="5" fill="#b45309" stroke="#92400e" strokeWidth="1.5" />
    {[{x:65,f:Math.sin},{x:111,f:Math.cos},{x:157,f:function(p: number){return -Math.sin(p*Math.PI*2+2)}}].map(function(p,i){var yOff=-p.f(progress*Math.PI*2)*15;return(<g key={i} transform={"translate(0,"+yOff+")"}><rect x={p.x} y="38" width="22" height="35" rx="4" fill="#d97706" stroke="#92400e" /><rect x={p.x+6} y="32" width="10" height="12" rx="3" fill="#f59e0b" /><rect x={p.x+3} y="30" width="16" height="4" rx="2" fill="#fbbf24" opacity="0.8" /></g>);})}
    {[76,121,166].map(function(x){return(<line key={x} x1={x} y1="78" x2={x} y2="85" stroke="#92400e" strokeWidth="2.5" />);})}
    {[{cx:76,b:"0s"},{cx:121,b:"0.15s"},{cx:166,b:"0.3s"}].map(function(s,i){return(<circle key={i} cx={s.cx} cy="28" r="3" fill="#fbbf24"><animate attributeName="opacity" values="0.2;1;0.2" dur="0.4s" repeatCount="indefinite" begin={s.b} /><animate attributeName="r" values="2;4;2" dur="0.4s" repeatCount="indefinite" begin={s.b} /></circle>);})}
    {[{cx:76,b:"0.1s"},{cx:121,b:"0.25s"},{cx:166,b:"0.4s"}].map(function(s,i){return(<circle key={"sp"+i} cx={s.cx} cy={22-progress*5} r="1.5" fill="#fde68a" opacity={progress>0.3?0.8:0}><animate attributeName="cy" values="28;15;28" dur="0.3s" repeatCount="indefinite" begin={s.b} /><animate attributeName="opacity" values="0;1;0" dur="0.3s" repeatCount="indefinite" begin={s.b} /></circle>);})}
    <text x="120" y="115" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#92400e" fontWeight="bold">{Math.round(progress*8000)} RPM</text>
    <text x="120" y="130" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#b45309">FIRING ORDER: 1-7-5-11-3-9-6-12-2-8-4-10</text>
  </svg>
);

const VehicleSVG: React.FC<SVGCProps> = ({ progress }) => (
  <svg viewBox="0 0 240 120" className="w-48 h-24">
    <path d="M 30 80 L 30 62 Q 30 50 55 45 L 90 34 Q 105 30 120 30 L 155 34 Q 165 36 178 45 L 205 58 Q 210 62 210 68 L 210 80 Z" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="500" strokeDashoffset={500-progress*500} strokeLinecap="round" />
    <path d="M 90 34 L 108 30 Q 120 28 135 30 L 155 35 L 142 48 L 85 48 Z" fill="rgba(217,119,6,0.08)" stroke="#f59e0b" strokeWidth="1" opacity={progress} />
    {[75,170].map(function(cx){return(<g key={cx}><circle cx={cx} cy="80" r="15" fill="none" stroke="#92400e" strokeWidth="2.5" /><circle cx={cx} cy="80" r="8" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="50" strokeDashoffset={50-progress*50} /><circle cx={cx} cy="80" r="3" fill="#b45309" /></g>);})}
    <text x="120" y="110" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#92400e" fontWeight="bold">MESH: {Math.round(progress*280000)} TRIANGLES</text>
  </svg>
);

const InteriorSVG: React.FC<SVGCProps> = ({ progress }) => (
  <svg viewBox="0 0 240 140" className="w-48 h-28">
    <circle cx="80" cy="65" r="30" fill="none" stroke="#d97706" strokeWidth="3.5" strokeDasharray="189" strokeDashoffset={189-progress*189} />
    <circle cx="80" cy="65" r="12" fill="none" stroke="#f59e0b" strokeWidth="2" />
    <path d="M 15 35 Q 40 28 65 32 Q 85 28 105 32 L 105 95 Q 85 100 65 95 Q 40 100 15 95 Z" fill="rgba(217,119,6,0.06)" stroke="#d97706" strokeWidth="1.5" strokeDasharray="350" strokeDashoffset={350-progress*350} />
    <path d="M 140 40 L 170 40 Q 182 40 182 55 L 182 95 L 140 95 Z" fill="rgba(217,119,6,0.08)" stroke="#92400e" strokeWidth="1.5" opacity={progress} />
    <rect x="185" y="45" width="45" height="30" rx="4" fill="rgba(217,119,6,0.08)" stroke="#f59e0b" strokeWidth="1.5" opacity={progress*0.8} />
    <text x="120" y="130" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#92400e" fontWeight="bold">COCKPIT: {Math.round(progress*100)}%</text>
  </svg>
);

const ManufacturingSVG: React.FC<SVGCProps> = ({ progress }) => (
  <svg viewBox="0 0 240 120" className="w-48 h-24">
    <rect x="10" y="85" width="220" height="8" rx="4" fill="rgba(217,119,6,0.12)" stroke="#92400e" strokeWidth="1" />
    {[{cx:22,cy:89},{cx:218,cy:89}].map(function(w,i){return(<circle key={i} cx={w.cx} cy={w.cy} r="6" fill="none" stroke="#d97706" strokeWidth="1.5" transform={"rotate("+progress*360+" "+w.cx+" "+w.cy+")"} />);})}
    <line x1="120" y1="25" x2={120+Math.sin(progress*Math.PI)*25} y2={25+Math.cos(progress*Math.PI)*18} stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
    <line x1={120+Math.sin(progress*Math.PI)*25} y1={25+Math.cos(progress*Math.PI)*18} x2={120+Math.sin(progress*Math.PI)*25} y2={25+Math.cos(progress*Math.PI)*18+18} stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="120" cy="25" r="5" fill="#92400e" stroke="#d97706" strokeWidth="1.5" />
    {progress>0.3&&[0,1,2].map(function(i){return(<circle key={i} cx={105+progress*30+i*5} cy={58+i*3} r="1.5" fill="#fbbf24" opacity="0.7"><animate attributeName="opacity" values="0.2;1;0.2" dur="0.3s" repeatCount="indefinite" begin={i*0.1+"s"} /></circle>);})}
    <text x="120" y="110" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#92400e" fontWeight="bold">ASSEMBLY: {Math.round(progress*100)}%</text>
  </svg>
);

const SafetySVG: React.FC<SVGCProps> = ({ progress }) => (
  <svg viewBox="0 0 240 120" className="w-48 h-24">
    <path d="M 70 55 Q 70 20 120 20 Q 170 20 170 55 L 170 75 Q 170 85 158 85 L 82 85 Q 70 85 70 75 Z" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="240" strokeDashoffset={240-progress*240} />
    <path d="M 82 48 Q 120 42 158 48 L 158 62 Q 120 68 82 62 Z" fill="rgba(217,119,6,0.08)" stroke="#f59e0b" strokeWidth="1.5" opacity={progress*0.8} />
    <line x1="35" y1="55" x2="65" y2="55" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" opacity={progress>0.5?0.6:0} />
    <line x1="175" y1="55" x2="205" y2="55" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4" opacity={progress>0.5?0.6:0} />
    <text x="120" y="110" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#92400e" fontWeight="bold">SAFETY: {Math.round(progress*100)}%</text>
  </svg>
);

const CommandSVG: React.FC<SVGCProps> = ({ progress }) => (
  <svg viewBox="0 0 240 120" className="w-48 h-24">
    <circle cx="60" cy="60" r="32" fill="none" stroke="rgba(217,119,6,0.12)" strokeWidth="2" />
    <circle cx="60" cy="60" r="32" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="201" strokeDashoffset={201-progress*201} strokeLinecap="round" transform="rotate(-120 60 60)" />
    <text x="60" y="64" textAnchor="middle" fontSize="14" fontFamily="monospace" fill="#92400e" fontWeight="bold">{Math.round(progress*200)}</text>
    <text x="60" y="78" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#b45309">MPH</text>
    {[0,1,2,3,4,5,6,7].map(function(i){return(<rect key={i} x={130+i*12} y={95-(i<progress*8?(8-i)*7:0)} width="7" height={i<progress*8?(8-i)*7:0} rx="2" fill={i<4?"#d97706":"#f59e0b"} opacity="0.7" />);})}
    <text x="175" y="110" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#92400e" fontWeight="bold">TELEMETRY</text>
  </svg>
);

const SimSVG: React.FC<SVGCProps> = ({ progress }) => (
  <svg viewBox="0 0 240 120" className="w-48 h-24">
    <ellipse cx="120" cy="55" rx="95" ry="40" fill="none" stroke="rgba(217,119,6,0.12)" strokeWidth="3" />
    <ellipse cx="120" cy="55" rx="95" ry="40" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="600" strokeDashoffset={600-progress*600} strokeLinecap="round" />
    <circle cx={120+Math.cos(progress*Math.PI*2)*95} cy={55+Math.sin(progress*Math.PI*2)*40} r="5" fill="#f59e0b" />
    <text x="120" y="110" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#92400e" fontWeight="bold">LAP: {Math.floor(progress*3)} / 3</text>
  </svg>
);

const WorldSVG: React.FC<SVGCProps> = ({ progress }) => (
  <svg viewBox="0 0 240 120" className="w-48 h-24">
    <circle cx="120" cy="55" r="40" fill="none" stroke="rgba(217,119,6,0.12)" strokeWidth="1.5" />
    <ellipse cx="120" cy="55" rx="40" ry="14" fill="none" stroke="rgba(217,119,6,0.08)" strokeWidth="1" />
    <ellipse cx="120" cy="55" rx="14" ry="40" fill="none" stroke="rgba(217,119,6,0.08)" strokeWidth="1" />
    <circle cx="120" cy="55" r="40" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="251" strokeDashoffset={251-progress*251} strokeLinecap="round" />
    <text x="120" y="110" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#92400e" fontWeight="bold">WORLDS: {Math.round(progress*50)}</text>
  </svg>
);
const STAGE_SVG: Record<string, React.FC<SVGCProps>> = { engine: EngineSVG, vehicle: VehicleSVG, interior: InteriorSVG, manufacturing: ManufacturingSVG, safety: SafetySVG, command: CommandSVG, sim: SimSVG, world: WorldSVG };
const STAGE_LABELS: Record<string, string> = { engine: "ASSEMBLING ENGINE", vehicle: "BUILDING CHASSIS", interior: "FITTING COCKPIT", manufacturing: "PRODUCTION LINE", safety: "CRASH TESTING", sim: "SIMULATING LAP", world: "LOADING CIRCUITS", command: "INITIALIZING SYSTEMS" };
const STAGE_SUBTASKS: Record<string, string[]> = {
  engine: ["Block Casting","Crankshaft Balancing","Piston Fitting","Head Assembly","Turbo Mounting"],
  vehicle: ["Chassis Layup","Panel Bonding","Suspension Mount","Wheel Assembly","Paint Booth"],
  interior: ["Seat Stitching","Dash Molding","Infotainment Load","Ambient Wiring","Final Trim"],
  manufacturing: ["Robot Calibration","Part Feeding","Weld Sequence","QC Inspection","Packaging"],
  safety: ["Crash Structure","Airbag Test","Seatbelt Load","Roof Crush","Side Impact"],
  command: ["System Boot","AI Loading","Data Sync","Module Init","Ready"],
  sim: ["Track Load","Physics Init","Telemetry Sync","Weather Set","Lights Out"],
  world: ["Map Load","AI Grid","Weather Sync","Physics Bind","Go!"]
};

function ParticlesBg() {
  var dots = useMemo(function() { return Array.from({length: 20}, function(_, i) { return { x: Math.random()*100, y: Math.random()*100, size: 1+Math.random()*2, delay: Math.random()*3, dur: 2+Math.random()*3 }; }); }, []);
  return (<div className="absolute inset-0 pointer-events-none overflow-hidden">
    {dots.map(function(d, i) { return (<div key={i} className="absolute rounded-full bg-amber-400/20" style={{ left: d.x+"%", top: d.y+"%", width: d.size, height: d.size, animation: "pulse "+d.dur+"s ease-in-out "+d.delay+"s infinite" }} />); })}
  </div>);
}

export function NeonStageLoadingSkeleton({ stageName }: { stageName?: string }) {
  var _a = useState(0); var progress = _a[0]; var setProgress = _a[1];
  useEffect(function() { var start = Date.now(); var duration = 2500; var raf: number = 0; var tick = function() { var e = Date.now() - start; setProgress(Math.min(e / duration, 1)); if (e < duration) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); return function() { cancelAnimationFrame(raf); }; }, []);
  var n = (stageName || "").toLowerCase().replace(/[^a-z]/g, "");
  var sk: keyof typeof STAGE_SVG = "command";
  if (n.includes("engine")) sk = "engine"; else if (n.includes("vehicle") || n.includes("exterior")) sk = "vehicle"; else if (n.includes("interior")) sk = "interior"; else if (n.includes("manufactur")) sk = "manufacturing"; else if (n.includes("safety")) sk = "safety"; else if (n.includes("sim")) sk = "sim"; else if (n.includes("world") || n.includes("race")) sk = "world";
  var SVGComp = STAGE_SVG[sk] || STAGE_SVG.command;
  var subtasks: string[] = (STAGE_SUBTASKS as Record<string, string[]>)[sk] || STAGE_SUBTASKS.command;
  var currentTask = Math.min(Math.floor(progress * subtasks.length), subtasks.length - 1);
  return (
    <div className="w-full h-full min-h-[520px] rounded-2xl bg-amber-50/90 border border-amber-200/60 backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(217,119,6,0.15)" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-transparent to-amber-100/30 pointer-events-none animate-pulse" />
      <ParticlesBg />
      <div className="relative z-10 mb-6"><div className="absolute inset-0 -m-4 rounded-full" style={{ background: "radial-gradient(circle, rgba(251,191,36,"+(0.1+progress*0.2)+"), transparent 70%)", filter: "blur(8px)" }} /><SVGComp progress={progress} /></div>
      <div className="relative z-10 text-center"><div className="text-sm font-mono font-bold text-amber-700 tracking-wider mb-1">{(STAGE_LABELS as Record<string, string>)[sk]}</div><div className="text-[11px] text-amber-600 font-mono">{stageName ? "Module [" + stageName.toUpperCase() + "]" : "Preparing workspace..."}</div></div>
      <div className="relative z-10 mt-4 flex flex-col items-center gap-1">
        {subtasks.map(function(task: string, i: number) { var isActive = i === currentTask; var isDone = i < currentTask; return (<div key={i} className="flex items-center gap-2 text-[10px] font-mono" style={{ color: isDone ? "#92400e" : isActive ? "#b45309" : "#d4c5a0", opacity: isDone ? 0.6 : isActive ? 1 : 0.3 }}><span>{isDone ? "✓" : isActive ? "▶" : "○"}</span><span>{task}</span></div>); })}
      </div>
      <div className="relative z-10 w-72 mt-5"><div className="h-2 bg-amber-200/60 rounded-full overflow-hidden border border-amber-300/40"><div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full" style={{ width: Math.round(progress * 100) + "%", transition: "width 0.1s linear", boxShadow: "0 0 8px rgba(217,119,6,0.4)" }} /></div><div className="flex justify-between mt-1.5 text-[10px] font-mono text-amber-600"><span>{Math.round(progress * 100)}%</span><span>{progress < 1 ? "Loading..." : "Ready"}</span></div></div>
    </div>);
}

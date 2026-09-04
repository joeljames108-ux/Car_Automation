import { useState, useMemo, memo, useEffect } from "react";
import { Layers3, ScanSearch, Scissors, FileCode2, RotateCcw, Eye, EyeOff } from "lucide-react";

export type ViewMode = "blueprint" | "exploded" | "anatomy" | "cutaway";

interface CL {
  id: string; label: string; cat: string; color: string; glow: string;
  vis: boolean; ey: number; ao: number; path: string;
  cs?: string; stat?: string; det?: string;
}

const CC: Record<string, {bg:string;border:string;text:string}> = {
  body:{bg:"bg-sky-500/15",border:"border-sky-500/40",text:"text-sky-300"},
  powertrain:{bg:"bg-amber-500/15",border:"border-amber-500/40",text:"text-amber-300"},
  chassis:{bg:"bg-slate-500/15",border:"border-slate-500/40",text:"text-slate-300"},
  aero:{bg:"bg-emerald-500/15",border:"border-emerald-500/40",text:"text-emerald-300"},
  interior:{bg:"bg-purple-500/15",border:"border-purple-500/40",text:"text-purple-300"},
  glass:{bg:"bg-cyan-500/15",border:"border-cyan-500/40",text:"text-cyan-300"},
  electrical:{bg:"bg-blue-500/15",border:"border-blue-500/40",text:"text-blue-300"},
};

const VM = [
  {id:"blueprint" as ViewMode,label:"Blueprint",icon:FileCode2},
  {id:"exploded" as ViewMode,label:"Exploded",icon:Layers3},
  {id:"anatomy" as ViewMode,label:"Anatomy",icon:ScanSearch},
  {id:"cutaway" as ViewMode,label:"Cutaway",icon:Scissors},
];

function buildLayers(): CL[] { return [
  {id:"body-roof",label:"Roof",cat:"body",color:"#38bdf8",glow:"rgba(56,189,248,0.5)",vis:true,ey:-140,ao:0.3,path:"M300,80 L500,80 L520,85 L280,85 Z",cs:"top",stat:"Carbon Monocoque",det:"2.1mm CFRP"},
  {id:"body-upper",label:"Upper Body",cat:"body",color:"#38bdf8",glow:"rgba(56,189,248,0.5)",vis:true,ey:-90,ao:0.25,path:"M220,90 L580,90 L600,110 L200,110 Z",cs:"all",stat:"Space Frame",det:"6082-T6 Al"},
  {id:"body-nose",label:"Nose",cat:"body",color:"#38bdf8",glow:"rgba(56,189,248,0.5)",vis:true,ey:-50,ao:0.25,path:"M80,120 L220,110 L220,140 L80,145 Z",cs:"front",stat:"Impact Structure",det:"FIA crash"},
  {id:"body-side",label:"Side Pods",cat:"body",color:"#38bdf8",glow:"rgba(56,189,248,0.5)",vis:true,ey:-20,ao:0.2,path:"M240,110 L580,110 L600,140 L220,140 Z",cs:"left",stat:"Side Impact",det:"Kevlar"},
  {id:"body-rear",label:"Rear Body",cat:"body",color:"#38bdf8",glow:"rgba(56,189,248,0.5)",vis:true,ey:-10,ao:0.25,path:"M580,100 L700,115 L700,140 L580,135 Z",cs:"rear",stat:"Rear Crash",det:"Diffuser"},
  {id:"g-ws",label:"Windshield",cat:"glass",color:"#22d3ee",glow:"rgba(34,211,238,0.5)",vis:true,ey:-120,ao:0.6,path:"M240,82 L320,78 L325,90 L235,92 Z",cs:"all",stat:"Laminated",det:"6.38mm PVB"},
  {id:"g-rw",label:"Rear Window",cat:"glass",color:"#22d3ee",glow:"rgba(34,211,238,0.5)",vis:true,ey:-115,ao:0.55,path:"M520,82 L560,85 L555,92 L515,90 Z",cs:"all",stat:"Polycarbonate",det:"Heated"},
  {id:"engine",label:"Engine",cat:"powertrain",color:"#fbbf24",glow:"rgba(251,191,36,0.5)",vis:true,ey:30,ao:0.9,path:"M500,115 L600,110 L605,135 L495,140 Z",cs:"right",stat:"4.0L TT V8",det:"920 HP"},
  {id:"intake",label:"Intake",cat:"powertrain",color:"#f59e0b",glow:"rgba(245,158,11,0.4)",vis:true,ey:10,ao:0.85,path:"M510,108 L590,104 L595,115 L505,118 Z",cs:"right",stat:"Variable Runners",det:"8.2L plenum"},
  {id:"turbo-l",label:"Turbo L",cat:"powertrain",color:"#d97706",glow:"rgba(217,119,6,0.4)",vis:true,ey:50,ao:0.9,path:"M490,130 L510,128 L512,142 L488,144 Z",cs:"left",stat:"Billet",det:"2.4 bar"},
  {id:"turbo-r",label:"Turbo R",cat:"powertrain",color:"#d97706",glow:"rgba(217,119,6,0.4)",vis:true,ey:50,ao:0.9,path:"M585,126 L605,124 L607,140 L583,142 Z",cs:"right",stat:"Billet",det:"2.4 bar"},
  {id:"trans",label:"Gearbox",cat:"powertrain",color:"#fbbf24",glow:"rgba(251,191,36,0.5)",vis:true,ey:70,ao:0.9,path:"M450,135 L500,140 L495,160 L445,155 Z",cs:"right",stat:"8-Spd DCT",det:"32ms shift"},
  {id:"floor",label:"Floor",cat:"chassis",color:"#94a3b8",glow:"rgba(148,163,184,0.4)",vis:true,ey:100,ao:0.7,path:"M100,170 L700,170 L700,185 L100,185 Z",cs:"all",stat:"Venturi",det:"6 strakes"},
  {id:"tub",label:"Monocoque",cat:"chassis",color:"#cbd5e1",glow:"rgba(203,213,225,0.4)",vis:true,ey:85,ao:0.8,path:"M200,130 L500,130 L510,165 L190,165 Z",cs:"left",stat:"CFRP Tub",det:"38kg"},
  {id:"rails",label:"Frame Rails",cat:"chassis",color:"#64748b",glow:"rgba(100,116,139,0.4)",vis:true,ey:115,ao:0.75,path:"M150,175 L700,175 L700,180 L150,180 Z",cs:"all",stat:"6061-T6",det:"Twin rails"},
  {id:"susp-f",label:"Front Susp",cat:"chassis",color:"#a1a1aa",glow:"rgba(161,161,170,0.4)",vis:true,ey:60,ao:0.85,path:"M130,140 L210,138 L210,165 L130,167 Z",cs:"left",stat:"Pushrod DW",det:"Inboard"},
  {id:"susp-r",label:"Rear Susp",cat:"chassis",color:"#a1a1aa",glow:"rgba(161,161,170,0.4)",vis:true,ey:60,ao:0.85,path:"M590,138 L670,140 L670,165 L590,163 Z",cs:"right",stat:"Pushrod DW",det:"Heave"},
  {id:"brk-fl",label:"Brake FL",cat:"chassis",color:"#f87171",glow:"rgba(248,113,113,0.4)",vis:true,ey:55,ao:0.9,path:"M135,150 L165,148 L165,162 L135,164 Z",cs:"left",stat:"CC 380mm",det:"6-piston"},
  {id:"brk-fr",label:"Brake FR",cat:"chassis",color:"#f87171",glow:"rgba(248,113,113,0.4)",vis:true,ey:55,ao:0.9,path:"M175,148 L205,146 L205,162 L175,164 Z",cs:"right",stat:"CC 380mm",det:"6-piston"},
  {id:"wh-fl",label:"Wheel FL",cat:"chassis",color:"#d4d4d8",glow:"rgba(212,212,216,0.4)",vis:true,ey:80,ao:0.6,path:"M100,145 L130,142 L132,168 L98,171 Z",cs:"left",stat:"19in Forged",det:"275/35 R19"},
  {id:"wh-fr",label:"Wheel FR",cat:"chassis",color:"#d4d4d8",glow:"rgba(212,212,216,0.4)",vis:true,ey:80,ao:0.6,path:"M210,140 L240,138 L242,168 L208,170 Z",cs:"right",stat:"19in Forged",det:"275/35 R19"},
  {id:"wh-rl",label:"Wheel RL",cat:"chassis",color:"#d4d4d8",glow:"rgba(212,212,216,0.4)",vis:true,ey:80,ao:0.6,path:"M570,140 L600,138 L602,168 L568,170 Z",cs:"left",stat:"19in Forged",det:"325/30 R19"},
  {id:"wh-rr",label:"Wheel RR",cat:"chassis",color:"#d4d4d8",glow:"rgba(212,212,216,0.4)",vis:true,ey:80,ao:0.6,path:"M670,140 L700,142 L698,168 L668,166 Z",cs:"right",stat:"19in Forged",det:"325/30 R19"},
  {id:"split",label:"Splitter",cat:"aero",color:"#34d399",glow:"rgba(52,211,153,0.5)",vis:true,ey:125,ao:0.85,path:"M70,145 L200,140 L200,150 L70,155 Z",cs:"front",stat:"Carbon Gurney",det:"+/- 5deg"},
  {id:"ufloor",label:"Underbody",cat:"aero",color:"#10b981",glow:"rgba(16,185,129,0.5)",vis:true,ey:135,ao:0.7,path:"M120,180 L680,180 L680,190 L120,190 Z",cs:"all",stat:"Venturi Floor",det:"220kg DF"},
  {id:"wing",label:"Rear Wing",cat:"aero",color:"#34d399",glow:"rgba(52,211,153,0.5)",vis:true,ey:130,ao:0.9,path:"M660,100 L720,105 L720,115 L660,110 Z",cs:"rear",stat:"DRS Active",det:"2-element"},
  {id:"canards",label:"Canards",cat:"aero",color:"#6ee7b7",glow:"rgba(110,231,183,0.4)",vis:true,ey:120,ao:0.85,path:"M100,130 L140,127 L138,135 L98,138 Z",cs:"left",stat:"Twin Element",det:"4/side"},
  {id:"seats",label:"Seats",cat:"interior",color:"#a78bfa",glow:"rgba(167,139,250,0.5)",vis:true,ey:-60,ao:0.8,path:"M340,100 L400,98 L405,120 L335,122 Z",cs:"all",stat:"Carbon Bucket",det:"FIA 8862"},
  {id:"dash",label:"Dashboard",cat:"interior",color:"#8b5cf6",glow:"rgba(139,92,246,0.5)",vis:true,ey:-70,ao:0.75,path:"M280,92 L420,88 L425,105 L275,108 Z",cs:"all",stat:"Carbon Dash",det:"12.3in OLED"},
  {id:"steer",label:"Steering",cat:"interior",color:"#c4b5fd",glow:"rgba(196,181,253,0.4)",vis:true,ey:-75,ao:0.85,path:"M320,105 L370,103 L372,115 L318,117 Z",cs:"all",stat:"F1 Yoke",det:"Paddle shift"},
  {id:"batt",label:"Battery",cat:"electrical",color:"#60a5fa",glow:"rgba(96,165,250,0.5)",vis:true,ey:95,ao:0.9,path:"M350,155 L450,152 L452,170 L348,173 Z",cs:"all",stat:"400V Li-Ion",det:"8.4kWh"},
  {id:"wire",label:"Wiring",cat:"electrical",color:"#93c5fd",glow:"rgba(147,197,253,0.4)",vis:true,ey:88,ao:0.6,path:"M250,125 L550,120 L555,130 L245,135 Z",cs:"all",stat:"Mil-Spec",det:"DR-25"},
]; }

function CarOutline({op=0.35}:{op?:number}){return(
  <g opacity={op} className="pointer-events-none">
    <path d="M80,145 C80,120 120,100 180,95 L220,90 C260,82 320,78 400,76 C480,78 540,82 580,90 L620,95 C680,100 720,120 720,145 L720,165 C720,180 700,190 680,192 L120,192 C100,190 80,180 80,165 Z" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" strokeDasharray="4 2" />
    <line x1="60" y1="155" x2="740" y2="155" stroke="rgba(56,189,248,0.15)" strokeWidth="0.5" strokeDasharray="8 4" />
    <line x1="130" y1="125" x2="130" y2="185" stroke="rgba(148,163,184,0.2)" strokeWidth="0.5" />
    <line x1="650" y1="125" x2="650" y2="185" stroke="rgba(148,163,184,0.2)" strokeWidth="0.5" />
    <path d="M95,135 Q95,115 130,115 Q165,115 165,135" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
    <path d="M615,135 Q615,115 650,115 Q685,115 685,135" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
    <ellipse cx="400" cy="105" rx="70" ry="20" fill="none" stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="3 2" />
  </g>);}

interface Props { onSelectStage?: (s:string)=>void; }

function VehicleViewSystemComponent({onSelectStage}: Props) {
  const [vm,setVm] = useState<ViewMode>("blueprint");
  const [layers,setLayers] = useState<CL[]>(()=>buildLayers());
  const [hovered,setHovered] = useState<string|null>(null);
  const [selected,setSelected] = useState<string|null>(null);
  const [phase,setPhase] = useState(0);
  const [cutSide,setCutSide] = useState<"left"|"right"|"front"|"rear">("left");

  useEffect(()=>{
    setPhase(0);
    const t0=performance.now();
    const tick=(t:number)=>{
      const p=Math.min((t-t0)/600,1);
      setPhase(p);
      if(p<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[vm]);

  // Keyboard shortcuts: 1-4 for view modes, R for reset, Esc deselect
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
      if(e.key==="1")setVm("blueprint");
      if(e.key==="2")setVm("exploded");
      if(e.key==="3")setVm("anatomy");
      if(e.key==="4")setVm("cutaway");
      if(e.key==="r"||e.key==="R")reset();
      if(e.key==="Escape")setSelected(null);
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[]);

  const reset=()=>{setLayers(buildLayers());setSelected(null);setHovered(null);};
  const vis=useMemo(()=>layers.filter(l=>l.vis),[layers]);
  const disp=selected?layers.find(l=>l.id===selected):hovered?layers.find(l=>l.id===hovered):null;

  const ease=(t:number)=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const ep=ease(phase);

  const getTransform=(l:CL):string=>{
    if(vm==="blueprint")return"";
    if(vm==="exploded")return"translate(0,"+(l.ey*ep)+")";
    return"";
  };

  const getOpacity=(l:CL):number=>{
    if(vm==="blueprint")return 0.85;
    if(vm==="exploded")return 0.9;
    if(vm==="anatomy")return l.ao;
    if(vm==="cutaway"){if(l.cs==="all"||l.cs===cutSide)return 0.9;return 0.15;}
    return 1;
  };

  return(
    <div className="panel bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.25)]">
            <Layers3 size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">VEHICLE ANATOMY VIEWER</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                {VM.find(v=>v.id===vm)?.label}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">Interactive Vehicle Disassembly</h3>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-1">
          {VM.map(v=>{
            const I=v.icon;
            const a=vm===v.id;
            return(
              <button key={v.id} onClick={()=>setVm(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${a?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]":"text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}>
                <I size={13} /><span className="hidden sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cutaway Selector */}
      {vm==="cutaway"&&(
        <div className="flex items-center gap-2 mb-3 relative z-10 animate-in fade-in duration-300">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Cut Plane:</span>
          {["left","right","front","rear"].map(s=>(
            <button key={s} onClick={()=>setCutSide(s as any)}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${cutSide===s?"bg-rose-500/20 text-rose-300 border border-rose-500/40":"bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-slate-200"}`}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Main Viewport */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#060a12] shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div style={{transform:vm==="exploded"?"rotateX(15deg) rotateZ(-2deg)":vm==="cutaway"?"rotateY(-8deg)":undefined,transformStyle:"preserve-3d",transition:"transform 0.6s cubic-bezier(0.16,1,0.3,1)"}}>
          <svg viewBox="0 0 800 320" className="w-full h-[340px]" style={{filter:"drop-shadow(0 0 20px rgba(52,211,153,0.15))"}}>
            <defs>
              <pattern id="vgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56,189,248,0.04)" strokeWidth="0.5" />
              </pattern>
              <filter id="vglow"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width="800" height="320" fill="url(#vgrid)" />
            <CarOutline op={vm==="blueprint"?0.3:0.15} />

            {/* Render layers */}
            {vis.map((l,i)=>{
              const ih=hovered===l.id;
              const is=selected===l.id;
              const op=getOpacity(l);
              const tr=getTransform(l);
              const sop=op*Math.min(1,Math.max(0,(phase-i*0.02)*3));
              return(
                <g key={l.id} transform={tr} opacity={sop} className="cursor-pointer"
                  onMouseEnter={()=>setHovered(l.id)} onMouseLeave={()=>setHovered(null)}
                  onClick={()=>setSelected(selected===l.id?null:l.id)}
                  style={{filter:ih||is?"url(#vglow)":undefined}}>
                  <path d={l.path} fill={ih||is?l.color:l.color+"40"} stroke={l.color} strokeWidth={ih||is?2:1} className="transition-all duration-200" />
                  {(ih||is)&&<path d={l.path} fill="none" stroke={l.glow} strokeWidth="3" opacity="0.5" className="animate-pulse" />}
                  {vm==="cutaway"&&op<0.5&&<g opacity="0.15">
                    <line x1="200" y1="100" x2="600" y2="200" stroke="#ef4444" strokeWidth="0.5" />
                    <line x1="200" y1="120" x2="600" y2="220" stroke="#ef4444" strokeWidth="0.5" />
                    <line x1="200" y1="140" x2="600" y2="240" stroke="#ef4444" strokeWidth="0.5" />
                  </g>}
                  {vm==="exploded"&&l.ey!==0&&<text x="750" y={155+l.ey*ep} fill={l.color} fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="end" opacity="0.8">{l.label}</text>}
                </g>
              );
            })}

            {/* Blueprint reticles */}
            {vm==="blueprint"&&(
              <g>
                {[{x:155,y:155,c:"#22c55e",l:"FL"},{x:650,y:155,c:"#22c55e",l:"RR"},{x:400,y:120,c:"#3b82f6",l:"ECU"},{x:540,y:135,c:"#f59e0b",l:"PU"},{x:120,y:145,c:"#10b981",l:"AERO"},{x:690,y:125,c:"#a855f7",l:"WING"}].map(pt=>(
                  <g key={pt.l}>
                    <circle cx={pt.x} cy={pt.y} r="14" fill="none" stroke={pt.c} strokeWidth="1.5" opacity="0.4" className="animate-ping" />
                    <circle cx={pt.x} cy={pt.y} r="8" fill={pt.c+"30"} stroke={pt.c} strokeWidth="1.5" />
                    <circle cx={pt.x} cy={pt.y} r="2" fill={pt.c} />
                    <line x1={pt.x-4} y1={pt.y} x2={pt.x+4} y2={pt.y} stroke="#fff" strokeWidth="1" opacity="0.8" />
                    <line x1={pt.x} y1={pt.y-4} x2={pt.x} y2={pt.y+4} stroke="#fff" strokeWidth="1" opacity="0.8" />
                    <text x={pt.x} y={pt.y-18} fill={pt.c} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle" opacity="0.7">{pt.l}</text>
                  </g>
                ))}
              </g>
            )}

            {/* Anatomy flow lines */}
            {vm==="anatomy"&&(
              <g opacity="0.3">
                <path d="M500,130 Q450,125 350,130 Q250,135 150,140" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 3" className="animate-pulse" />
                <path d="M520,145 Q480,150 440,155 Q380,158 320,155" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 3" className="animate-pulse" />
                <path d="M590,130 L640,135 L680,140 L720,150" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 3" />
                <path d="M350,160 L400,158 L450,155 L500,150 L550,145" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2 2" />
                <path d="M540,140 L480,150 L400,155 L300,158" fill="none" stroke="#a78bfa" strokeWidth="1" strokeDasharray="5 3" />
              </g>
            )}

            {/* Cutaway section plane */}
            {vm==="cutaway"&&(
              <g>
                <line x1={cutSide==="left"||cutSide==="right"?400:80} y1={cutSide==="left"||cutSide==="right"?60:155}
                  x2={cutSide==="left"||cutSide==="right"?400:720} y2={cutSide==="left"||cutSide==="right"?260:155}
                  stroke="#ef4444" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.6" />
                <text x={cutSide==="left"||cutSide==="right"?410:720} y={cutSide==="left"||cutSide==="right"?70:148}
                  fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.7">
                  CUT: {cutSide.toUpperCase()}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Info Card */}
        {disp&&(
          <div className="absolute top-4 right-4 w-64 p-3.5 rounded-xl bg-slate-950/95 backdrop-blur-2xl border shadow-[0_0_30px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 z-20" style={{borderColor:disp.color}}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor:disp.color}} />
                <span className="text-xs font-mono font-bold text-slate-100">{disp.label}</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border" style={{borderColor:disp.color+"60",color:disp.color,backgroundColor:disp.color+"15"}}>
                {disp.cat.toUpperCase()}
              </span>
            </div>
            {disp.stat&&<div className="text-sm font-bold text-white mb-1">{disp.stat}</div>}
            {disp.det&&<div className="text-[11px] text-slate-300 leading-tight">{disp.det}</div>}
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 font-mono">Click to navigate</span>
            </div>
          </div>
        )}
      </div>

      {/* Layer Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Component Layers</span>
          <button onClick={reset} className="flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            <RotateCcw size={10} /> Reset
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {["body","glass","powertrain","chassis","aero","interior","electrical"].map(cat=>{
            const cl=layers.filter(l=>l.cat===cat);
            const all=cl.every(l=>l.vis);
            const some=cl.some(l=>l.vis);
            const co=CC[cat];
            return(
              <button key={cat}
                onClick={()=>setLayers(p=>p.map(l=>l.cat===cat?{...l,vis:!all}:l))}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${all?co.bg+" "+co.border+" "+co.text:some?"bg-slate-800/50 border-slate-600 text-slate-300":"bg-slate-900/50 border-slate-800 text-slate-500"}`}>
                {all?<Eye size={10} />:<EyeOff size={10} />}
                <span className="capitalize">{cat}</span>
                <span className="text-[8px] opacity-60">({cl.length})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const VehicleViewSystem = memo(VehicleViewSystemComponent);

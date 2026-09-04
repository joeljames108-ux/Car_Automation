// =============================================================================
// EXTERIOR 3D SCENE - ENHANCED WITH CAMERA PRESETS + PAINT FINISH PICKER
// =============================================================================
import React, { Suspense, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, MeshReflectorMaterial, CameraControls } from "@react-three/drei";
import { GlbCarModel, type PaintFinishType } from "./GlbCarModel";
import { CAR_MODEL_REGISTRY, TIER_LABELS, type CarModelEntry } from "./carModelRegistry";

const CarLoadingFallback: React.FC = () => {
  const [dots, setDots] = useState("");
  useEffect(() => { const iv = setInterval(() => setDots(p => p.length >= 3 ? "" : p + "."), 400); return () => clearInterval(iv); }, []);
  return (<group><mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.1,0]} receiveShadow><planeGeometry args={[30,30]} /><meshStandardMaterial color="#1a1208" roughness={0.15} metalness={0.5} /></mesh><gridHelper args={[4,40,"#1a1508","#0d0a06"]} position={[0,-0.099,0]} /><group position={[0,0.5,0]}><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.15,0.008,8,64]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} /></mesh></group></group>);
};

// Camera presets: name -> [position, target, fov]
const CAMERA_PRESETS: Record<string, { pos: [number,number,number]; target: [number,number,number]; fov: number }> = {
  orbit:  { pos: [3.8, 2.2, 3.8], target: [0, 0.3, 0], fov: 42 },
  front:  { pos: [0, 1.0, 4.5], target: [0, 0.3, 0], fov: 38 },
  rear:   { pos: [0, 1.2, -4.5], target: [0, 0.3, 0], fov: 38 },
  side:   { pos: [4.5, 0.8, 0], target: [0, 0.3, 0], fov: 36 },
  low:    { pos: [2.5, 0.3, 2.5], target: [0, 0.5, 0], fov: 45 },
  top:    { pos: [0, 6.0, 0.1], target: [0, 0, 0], fov: 50 },
};

const PAINT_FINISHES: { id: PaintFinishType; label: string; icon: string }[] = [
  { id: "metallic", label: "Metallic", icon: "✨" },
  { id: "gloss", label: "Gloss", icon: "💎" },
  { id: "matte", label: "Matte", icon: "🌫️" },
  { id: "satin", label: "Satin", icon: "🪞" },
  { id: "chameleon", label: "Chameleon", icon: "🦎" },
];

const PALETTE = [0xcc0000, 0x0044cc, 0xffffff, 0x111111, 0x800080, 0x2d5016, 0xff8800, 0x003366, 0xffd700, 0xff1493, 0x00ff88, 0x0066cc];

export const ExteriorScene3D: React.FC = () => {
  const [selectedId, setSelectedId] = useState("bmw_i8");
  const [paintColor, setPaintColor] = useState(0x0044cc);
  const [paintFinish, setPaintFinish] = useState<PaintFinishType>("metallic");
  const [cameraPreset, setCameraPreset] = useState("orbit");
  const [autoRotate, setAutoRotate] = useState(false);
  const [turntableSpeed, setTurntableSpeed] = useState(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const model = CAR_MODEL_REGISTRY.find(m => m.id === selectedId) || CAR_MODEL_REGISTRY[0];
  const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.orbit;

  const handleSelect = (entry: CarModelEntry) => { setSelectedId(entry.id); setPaintColor(entry.defaultPaint); setPaintFinish(entry.paintFinish as PaintFinishType || "metallic"); setDropdownOpen(false); };

  const tierGroups = CAR_MODEL_REGISTRY.reduce<Record<string, CarModelEntry[]>>((acc, m) => { (acc[m.tier] = acc[m.tier] || []).push(m); return acc; }, {});

  return (<div className="w-full h-full relative">

      {/* CAR MODEL SELECTOR */}
      <div className="absolute top-3 left-3 z-30">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md border transition-all duration-200" style={{background:"rgba(26,16,8,0.88)",borderColor:"rgba(180,140,60,0.4)",color:"#fde68a"}}>
          <span className="text-sm font-semibold">{model.name}</span>
          <svg className="w-4 h-4 transition-transform" style={{transform:dropdownOpen?"rotate(180deg)":"rotate(0)"}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {dropdownOpen && (<div className="absolute top-full left-0 mt-2 w-80 rounded-xl backdrop-blur-md border overflow-hidden max-h-96 overflow-y-auto" style={{background:"rgba(26,16,8,0.95)",borderColor:"rgba(180,140,60,0.3)"}}>
          {Object.entries(tierGroups).map(([tier, models]) => (<div key={tier}>
            <div className="px-3 py-1.5 text-xs font-bold tracking-wider uppercase" style={{color:"rgba(253,230,138,0.5)"}}>{TIER_LABELS[tier] || tier}</div>
            {models.map(m => (<button key={m.id} onClick={() => handleSelect(m)} className="w-full text-left px-3 py-2 flex items-center gap-3 transition-colors" style={{background:m.id===selectedId?"rgba(180,140,60,0.2)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(180,140,60,0.15)"} onMouseLeave={e=>e.currentTarget.style.background=m.id===selectedId?"rgba(180,140,60,0.2)":"transparent"}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{background:"rgba(180,140,60,0.15)",color:"#fbbf24"}}>{m.name.charAt(0)}</div>
              <div className="flex-1 min-w-0"><div className="text-sm font-medium" style={{color:"#fde68a"}}>{m.name}</div><div className="text-xs" style={{color:"rgba(253,230,138,0.5)"}}>{m.subtitle} | {m.year}</div></div>
              <div className="text-xs font-mono" style={{color:"rgba(253,230,138,0.6)"}}>{m.power}</div>
            </button>))}
          </div>))}
        </div>)}
      </div>
      {/* MODEL INFO CARD + PAINT CONTROLS */}
      <div className="absolute top-3 right-3 z-30 px-4 py-3 rounded-xl backdrop-blur-md border" style={{background:"rgba(26,16,8,0.85)",borderColor:"rgba(180,140,60,0.3)"}}>
        <div className="text-sm font-bold" style={{color:"#fde68a"}}>{model.name}</div>
        <div className="text-xs mt-0.5" style={{color:"rgba(253,230,138,0.6)"}}>{model.subtitle} | {model.origin} | {model.year}</div>
        <div className="flex gap-3 mt-1.5"><span className="text-xs font-mono" style={{color:"#fbbf24"}}>{model.power}</span><span className="text-xs font-mono" style={{color:"rgba(253,230,138,0.5)"}}>{model.weight}</span></div>

        {/* PAINT COLOR PALETTE */}
        <div className="flex gap-1.5 mt-2">
          {PALETTE.map((c, i) => (<button key={i} onClick={() => setPaintColor(c)} className="w-5 h-5 rounded-full border-2 transition-all duration-150 hover:scale-125" style={{background:"#"+c.toString(16).padStart(6,"0"),borderColor:paintColor===c?"#fbbf24":"rgba(180,140,60,0.2)",boxShadow:paintColor===c?"0 0 8px rgba(251,191,36,0.4)":"none"}} />))}
        </div>

        {/* PAINT FINISH PICKER */}
        <div className="flex gap-1 mt-2">
          {PAINT_FINISHES.map(f => (<button key={f.id} onClick={() => setPaintFinish(f.id)} className="px-2 py-1 rounded-md text-[10px] font-bold transition-all" style={{background:paintFinish===f.id?"rgba(180,140,60,0.3)":"rgba(180,140,60,0.08)",color:paintFinish===f.id?"#fbbf24":"rgba(253,230,138,0.5)",border:paintFinish===f.id?"1px solid rgba(251,191,36,0.4)":"1px solid transparent"}}>{f.icon} {f.label}</button>))}
        </div>
      </div>


      {/* TURNTABLE CONTROLS */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300" style={{background: autoRotate ? 'rgba(26,16,8,0.92)' : 'rgba(26,16,8,0.75)', borderColor: autoRotate ? 'rgba(251,191,36,0.5)' : 'rgba(180,140,60,0.2)'}}>
        <button onClick={() => setAutoRotate(!autoRotate)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200" style={{background: autoRotate ? 'rgba(251,191,36,0.25)' : 'rgba(180,140,60,0.1)', color: autoRotate ? '#fbbf24' : 'rgba(253,230,138,0.6)', border: autoRotate ? '1px solid rgba(251,191,36,0.4)' : '1px solid transparent'}}>
          <span className={autoRotate ? 'inline-block animate-spin' : ''}>🏎️</span>
          <span>{autoRotate ? 'Turntable ON' : 'Turntable'}</span>
        </button>
        {autoRotate && (
          <div className="flex items-center gap-2 pl-2 border-l" style={{borderColor:'rgba(180,140,60,0.25)'}}>
            <span className="text-[10px]" style={{color:'rgba(253,230,138,0.5)'}}>Speed</span>
            <input type="range" min={0.5} max={8} step={0.5} value={turntableSpeed} onChange={e => setTurntableSpeed(parseFloat(e.target.value))} className="w-20 h-1 rounded-full appearance-none cursor-pointer" style={{background: 'linear-gradient(to right, rgba(180,140,60,0.3) 0%, rgba(251,191,36,0.6) ' + ((turntableSpeed-0.5)/7.5*100) + '%, rgba(180,140,60,0.15) 100%)'}} />
            <span className="text-[10px] font-mono min-w-[28px] text-right" style={{color:'#fbbf24'}}>{turntableSpeed}x</span>
          </div>
        )}
      </div>
      {/* CAMERA PRESETS */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1 px-3 py-1.5 rounded-xl backdrop-blur-md border" style={{background:"rgba(26,16,8,0.85)",borderColor:"rgba(180,140,60,0.3)"}}>
        {Object.entries({orbit:"🔄 Orbit",front:"➡️ Front",rear:"⬅️ Rear",side:"↔️ Side",low:"📐 Low",top:"🔝 Top"}).map(([k,v]) => (<button key={k} onClick={() => { setCameraPreset(k); setAutoRotate(false); }} className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all" style={{background:cameraPreset===k?"rgba(180,140,60,0.3)":"transparent",color:cameraPreset===k?"#fbbf24":"rgba(253,230,138,0.5)"}}>{v}</button>))}
      </div>
      {/* 3D CANVAS WITH ENHANCED LIGHTING */}
      <Canvas camera={{position:preset.pos, fov:preset.fov}} dpr={[1,1.5]} performance={{min:0.5}} gl={{antialias:true,alpha:true,powerPreference:"high-performance",toneMapping:3,toneMappingExposure:1.1}} shadows className="w-full h-full">
        {/* Studio Lighting Rig - 9 lights for photorealistic reflections */}
        <ambientLight intensity={0.8} color="#fef3c7" />
        <directionalLight position={[5,6,4]} intensity={3.8} color="#ffffff" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} shadow-normalBias={0.02} />
        <directionalLight position={[-4,3,3]} intensity={2.0} color="#e0f2fe" />
        <directionalLight position={[-2,4,-4]} intensity={1.8} color="#fef08a" />
        <directionalLight position={[0,5,0]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[4,1,-3]} intensity={1.4} color="#f8fafc" />
        <directionalLight position={[-5,2,0]} intensity={1.2} color="#dbeafe" />
        <directionalLight position={[0,-2,3]} intensity={0.6} color="#e2e8f0" />
        <hemisphereLight args={["#fef3c7","#4a3728",1.0]} />
        {/* Warm rim/accent spot lights */}
        <spotLight position={[3,4,5]} angle={0.3} penumbra={0.8} intensity={2.5} color="#fde68a" castShadow={false} />
        <spotLight position={[-3,3,-3]} angle={0.4} penumbra={0.6} intensity={1.5} color="#e0f2fe" castShadow={false} />

        <Environment preset="studio" background={false} environmentIntensity={0.9} />

        {/* Overhead Automotive Studio Softbox Light Bank */}
        <group position={[0, 4.8, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.8, 6.5]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.2} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Real GLB Car Model with expanded PBR materials */}
        <Suspense fallback={<CarLoadingFallback />}>
          <group position={[0,-0.08,0]} key={selectedId}>
            <GlbCarModel modelPath={model.glbPath} paintColorHex={paintColor} caliperColorHex={model.caliperColor} paintFinish={paintFinish} autoRotate={false} />
          </group>
        </Suspense>

        {/* Reflective Dark Studio Floor */}
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.1,0]} receiveShadow>
          <planeGeometry args={[30,30]} />
          <MeshReflectorMaterial blur={[300,100]} resolution={1024} mixBlur={1} mixStrength={45} roughness={0.12} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#1a1208" metalness={0.5} mirror={0.5} />
        </mesh>

        <ContactShadows position={[0,-0.09,0]} opacity={0.7} scale={14} blur={2.5} far={4} color="#2a1a0a" />
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={1.5} maxDistance={10} maxPolarAngle={Math.PI/2-0.02} target={preset.target} autoRotate={autoRotate} autoRotateSpeed={turntableSpeed} />
      </Canvas>
    </div>);
};


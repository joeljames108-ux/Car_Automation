// ============================================================================
// ENGINE RUNTIME MOTION - Pistons, Crankshaft, Camshafts, Valves, Turbo
// ============================================================================

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEngine3DStore } from '../store/useEngine3DStore';
import {
  calculatePistonDisplacement, calculateConRodAngle, calculateValveLift,
  calculateEngineVibration, getFiringOrderForType, getCamshaftAngle,
  PISTON_CONFIGS, advanceCrankshaft, advanceTurbocharger,
  createInitialCrankshaftState, createTurbochargerState,
  type CrankshaftState, type TurbochargerState, type EngineType, type EngineVibration,
} from '../animations/engineRuntimeAnimations';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';

// Crankshaft Rotator
const CrankshaftRotator: React.FC<{angleRad:number;vibration:EngineVibration}> =
  React.memo(({angleRad, vibration}) => {
    const ref = useRef<THREE.Group>(null);
    const mat = useMemo(() => globalMaterialLibrary.getNitridedCrank(), []);
    useFrame(() => {
      if (!ref.current) return;
      ref.current.rotation.x = angleRad;
      ref.current.position.x = vibration.primaryX + vibration.secondaryX;
      ref.current.position.y = vibration.primaryY + vibration.secondaryY;
    });
    return (
      <group ref={ref} name="Crankshaft_Assembly">
        <mesh castShadow><cylinderGeometry args={[0.025,0.025,0.52,24]}/><primitive object={mat} attach="material"/></mesh>
        {[0,1,2,3,4,5].map(i => {
          const z = -0.20+i*0.08; const p = (i*120*Math.PI)/180;
          return (<group key={i} position={[0,0,z]} rotation={[p,0,0]}>
            <mesh castShadow position={[0,0.02,0]}><boxGeometry args={[0.008,0.04,0.012]}/><primitive object={mat} attach="material"/></mesh>
            <mesh castShadow position={[0,-0.02,0]}><cylinderGeometry args={[0.018,0.018,0.012,12]}/><primitive object={mat} attach="material"/></mesh>
          </group>);
        })}
        {[0,1,2,3,4,5,6].map(i => (
          <mesh key={i} position={[0,0,-0.24+i*0.08]} castShadow><cylinderGeometry args={[0.016,0.016,0.015,16]}/><meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15}/></mesh>
        ))}
        <mesh position={[0,0,0.28]} castShadow rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.045,0.045,0.015,32]}/><meshPhysicalMaterial color="#505050" metalness={0.85} roughness={0.2} clearcoat={0.3}/></mesh>
      </group>
    );
  });

// Piston Assembly
const PistonAssembly: React.FC<{crankAngleDeg:number;phaseOffsetDeg:number;position:[number,number,number];bankAngle:number;pistonRadius:number}> =
  React.memo(({crankAngleDeg, phaseOffsetDeg, position, bankAngle, pistonRadius}) => {
    const pistonHeadRef = useRef<THREE.Mesh>(null);
    const conrodRef = useRef<THREE.Mesh>(null);
    const config = PISTON_CONFIGS.V12;
    const pistonMat = useMemo(() => globalMaterialLibrary.getMachinedBillet(), []);
    const conrodMat = useMemo(() => globalMaterialLibrary.getForgedSteel(), []);
    useFrame(() => {
      const angle = (crankAngleDeg + phaseOffsetDeg) % 720;
      const pistonY = calculatePistonDisplacement(angle, config) * (config.strokeMm / 2000);
      if (pistonHeadRef.current) pistonHeadRef.current.position.y = pistonY;
      if (conrodRef.current) { conrodRef.current.position.y = pistonY*0.5; conrodRef.current.rotation.z = calculateConRodAngle(angle, config); }
    });
    return (
      <group position={position} rotation={[(bankAngle*Math.PI)/180,0,0]}>
        <mesh ref={pistonHeadRef} castShadow><cylinderGeometry args={[pistonRadius,pistonRadius*0.95,0.02,20]}/><primitive object={pistonMat} attach="material"/></mesh>
        {[0,0.004,0.008].map((y,i) => (<mesh key={i} position={[0,y+0.01,0]}><torusGeometry args={[pistonRadius*1.01,0.001,8,24]}/><meshStandardMaterial color="#888" metalness={0.9} roughness={0.1}/></mesh>))}
        <mesh position={[0,-0.008,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[0.004,0.004,pistonRadius*1.6,12]}/><meshStandardMaterial color="#aaa" metalness={0.85} roughness={0.2}/></mesh>
        <mesh ref={conrodRef} castShadow position={[0,-0.04,0]}><boxGeometry args={[0.006,0.05,0.004]}/><primitive object={conrodMat} attach="material"/></mesh>
        <mesh position={[0,-0.065,0]}><torusGeometry args={[0.012,0.003,8,16]}/><primitive object={conrodMat} attach="material"/></mesh>
      </group>
    );
  });

// Camshaft Rotator
const CamshaftRotator: React.FC<{crankAngleDeg:number;position:[number,number,number];bank:"intake"|"exhaust"}> =
  React.memo(({crankAngleDeg, position, bank}) => {
    const ref = useRef<THREE.Group>(null);
    const camMat = useMemo(() => globalMaterialLibrary.getMachinedBillet(), []);
    useFrame(() => {
      if (!ref.current) return;
      ref.current.rotation.x = (getCamshaftAngle(crankAngleDeg, bank) * Math.PI) / 180;
    });
    return (
      <group ref={ref} position={position}>
        <mesh castShadow><cylinderGeometry args={[0.008,0.008,0.44,16]}/><primitive object={camMat} attach="material"/></mesh>
        {Array.from({length:12}, (_,i) => {
          const z = -0.18+i*0.032; const lp = (i*60*Math.PI)/180;
          return (<group key={i} position={[0,0,z]} rotation={[lp,0,0]}><mesh castShadow position={[0.006,0,0]}><sphereGeometry args={[0.005,8,8]}/><meshStandardMaterial color="#d4a030" metalness={0.7} roughness={0.25}/></mesh></group>);
        })}
        {[0,1,2,3].map(i => (<mesh key={i} position={[0,0,-0.14+i*0.1]} castShadow><torusGeometry args={[0.012,0.002,8,16]}/><meshStandardMaterial color="#707070" metalness={0.8} roughness={0.2}/></mesh>))}
      </group>
    );
  });

// Valve Actuator
const ValveActuator: React.FC<{crankAngleDeg:number;phaseOffsetDeg:number;position:[number,number,number];isIntake:boolean}> =
  React.memo(({crankAngleDeg, phaseOffsetDeg, position, isIntake}) => {
    const valveRef = useRef<THREE.Group>(null);
    const valveMat = useMemo(() => globalMaterialLibrary.getInconelExhaust(), []);
    useFrame(() => {
      if (!valveRef.current) return;
      const camAngle = getCamshaftAngle(crankAngleDeg, isIntake ? "intake" : "exhaust") + phaseOffsetDeg;
      valveRef.current.position.y = -calculateValveLift(camAngle) * 0.001;
    });
    return (
      <group ref={valveRef} position={position}>
        <mesh castShadow rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.008,0.004,0.002,12]}/><primitive object={valveMat} attach="material"/></mesh>
        <mesh castShadow position={[0,0.02,0]}><cylinderGeometry args={[0.0015,0.0015,0.04,8]}/><primitive object={valveMat} attach="material"/></mesh>
        <mesh position={[0,0.015,0]}><torusGeometry args={[0.005,0.0008,6,24]}/><meshStandardMaterial color="#4488cc" metalness={0.6} roughness={0.3}/></mesh>
      </group>
    );
  });

// Turbocharger Spin
const TurbochargerSpin: React.FC<{turbineSpeedRpm:number;position:[number,number,number]}> =
  React.memo(({turbineSpeedRpm, position}) => {
    const tRef = useRef<THREE.Group>(null);
    const cRef = useRef<THREE.Group>(null);
    const tMat = useMemo(() => globalMaterialLibrary.getInconelExhaust(), []);
    const cMat = useMemo(() => globalMaterialLibrary.getMachinedBillet(), []);
    useFrame(() => {
      if (!tRef.current || !cRef.current) return;
      const inc = (turbineSpeedRpm / 60) * 2 * Math.PI / 60 * 0.001;
      tRef.current.rotation.z += inc; cRef.current.rotation.z += inc;
    });
    return (
      <group position={position} name="Turbocharger">
        <mesh castShadow position={[0,0,-0.025]}><torusGeometry args={[0.025,0.012,12,24]}/><meshPhysicalMaterial color="#8b4513" metalness={0.6} roughness={0.5} clearcoat={0.1}/></mesh>
        <mesh castShadow position={[0,0,0.025]}><torusGeometry args={[0.028,0.01,12,24]}/><meshPhysicalMaterial color="#b0c4de" metalness={0.8} roughness={0.15} clearcoat={0.5}/></mesh>
        <group ref={tRef} position={[0,0,-0.025]}><mesh castShadow rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.018,0.012,0.008,8]}/><primitive object={tMat} attach="material"/></mesh>
          {Array.from({length:8},(_,i)=>(<mesh key={i} rotation={[0,(i*45*Math.PI)/180,Math.PI/2]}><boxGeometry args={[0.002,0.014,0.005]}/><primitive object={tMat} attach="material"/></mesh>))}
        </group>
        <group ref={cRef} position={[0,0,0.025]}><mesh castShadow rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.02,0.014,0.006,8]}/><primitive object={cMat} attach="material"/></mesh>
          {Array.from({length:12},(_,i)=>(<mesh key={i} rotation={[0,(i*30*Math.PI)/180,Math.PI/2]}><boxGeometry args={[0.0015,0.016,0.004]}/><primitive object={cMat} attach="material"/></mesh>))}
        </group>
        <mesh castShadow rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.004,0.004,0.06,12]}/><meshStandardMaterial color="#888" metalness={0.9} roughness={0.1}/></mesh>
      </group>
    );
  });

// Exhaust Pulse Glow
const ExhaustPulseGlow: React.FC<{intensity:number;position:[number,number,number];temperature:number}> =
  React.memo(({intensity, position, temperature}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
      if (!meshRef.current) return;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = intensity * 3.0;
      mat.emissive.setRGB(0.4 + temperature * 0.6, 0.1 + temperature * 0.2, 0.05);
      meshRef.current.scale.setScalar(0.5 + intensity * 1.5);
    });
    return (<mesh ref={meshRef} position={position}><sphereGeometry args={[0.006,8,8]}/><meshStandardMaterial color="#1a0800" emissive="#ff4400" emissiveIntensity={0} transparent opacity={0.6}/></mesh>);
  });

// Oil Pump Gear
const OilPumpGear: React.FC<{angleRad:number;position:[number,number,number]}> =
  React.memo(({angleRad, position}) => {
    const ref = useRef<THREE.Group>(null);
    useFrame(() => { if (ref.current) ref.current.rotation.z = angleRad; });
    return (
      <group ref={ref} position={position} name="Oil_Pump">
        <mesh castShadow rotation={[Math.PI/2,0,0]}><torusGeometry args={[0.012,0.003,6,16]}/><meshStandardMaterial color="#c8a020" metalness={0.7} roughness={0.25}/></mesh>
        {Array.from({length:12},(_,i)=>(<mesh key={i} position={[Math.cos(i*30*Math.PI/180)*0.015,Math.sin(i*30*Math.PI/180)*0.015,0]}><boxGeometry args={[0.003,0.002,0.003]}/><meshStandardMaterial color="#c8a020" metalness={0.7} roughness={0.3}/></mesh>))}
      </group>
    );
  });

// RPM Control Overlay
const RuntimeControlOverlay: React.FC<{currentRpm:number;targetRpm:number;isRunning:boolean;onSetRpm:(rpm:number)=>void;onToggle:()=>void}> =
  ({currentRpm, targetRpm, isRunning, onSetRpm, onToggle}) => (
    <div style={{position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:12,background:"rgba(26,16,8,0.92)",border:"1px solid rgba(251,191,36,0.3)",borderRadius:12,padding:"8px 16px",zIndex:10,fontFamily:"monospace",color:"#fbbf24",fontSize:12,backdropFilter:"blur(8px)"}}>
      <button onClick={onToggle} style={{background:isRunning?"rgba(220,38,38,0.3)":"rgba(34,197,94,0.3)",border:"1px solid "+(isRunning?"#ef4444":"#22c55e"),color:isRunning?"#fca5a5":"#86efac",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:"bold"}}>
        {isRunning?"STOP":"START"}
      </button>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:10,opacity:0.6}}>RPM</span><span style={{fontSize:16,fontWeight:"bold",color:currentRpm>6000?"#ef4444":"#fbbf24"}}>{Math.round(currentRpm).toLocaleString()}</span></div>
      <input type="range" min={0} max={9000} step={100} value={targetRpm} onChange={e=>onSetRpm(Number(e.target.value))} style={{width:120,accentColor:"#fbbf24",cursor:"pointer"}}/>
      <div style={{display:"flex",gap:4}}>{[800,2000,4000,6000,8000].map(rpm=>(<button key={rpm} onClick={()=>onSetRpm(rpm)} style={{background:targetRpm===rpm?"rgba(251,191,36,0.3)":"transparent",border:"1px solid rgba(251,191,36,0.2)",color:"#fbbf24",borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:9}}>{rpm}</button>))}</div>
    </div>
  );

// ============================================================================
// MASTER ENGINE RUNTIME MOTION COMPONENT
// ============================================================================

export interface EngineRuntimeMotionProps {
  engineType?: EngineType;
  autoStart?: boolean;
  initialRpm?: number;
}

export const EngineRuntimeMotion: React.FC<EngineRuntimeMotionProps> = ({
  engineType = "V12",
  autoStart = true,
  initialRpm = 800,
}) => {
  const progress = useEngine3DStore((s) => s.progress);
  const [runtimeActive, setRuntimeActive] = useState(false);
  const crankRef = useRef<CrankshaftState>(createInitialCrankshaftState());
  const turboRef = useRef<TurbochargerState>(createTurbochargerState());
  const targetRpmRef = useRef(initialRpm);
  const frameTimeRef = useRef(performance.now());
  const [displayRpm, setDisplayRpm] = useState(0);

  // Auto-start when assembly reaches 100%
  useEffect(() => {
    if (progress.percentage >= 100 && autoStart && !runtimeActive) {
      const timer = setTimeout(() => {
        crankRef.current.targetRpm = initialRpm;
        targetRpmRef.current = initialRpm;
        setRuntimeActive(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [progress.percentage, autoStart, runtimeActive, initialRpm]);

  // Frame tick — advance crankshaft and turbo
  useFrame(() => {
    if (!runtimeActive) return;
    const now = performance.now();
    const delta = Math.min(0.05, (now - frameTimeRef.current) / 1000);
    frameTimeRef.current = now;
    crankRef.current = advanceCrankshaft(crankRef.current, delta);
    if (targetRpmRef.current > 1000) {
      turboRef.current = advanceTurbocharger(turboRef.current, crankRef.current.rpm, Math.min(1, targetRpmRef.current / 8000), delta);
    }
    // Throttle RPM display to 10fps
    if (Math.floor(now / 100) !== Math.floor((now - delta * 1000) / 100)) {
      setDisplayRpm(crankRef.current.rpm);
    }
  });

  const firingOrder = useMemo(() => getFiringOrderForType(engineType), [engineType]);
  const bankAngle = PISTON_CONFIGS[engineType]?.bankAngle ?? 60;

  const pistonPositions = useMemo(() => {
    const pos: [number,number,number][] = [];
    for (let i = 0; i < 12; i++) {
      pos.push([i < 6 ? 0.04 : -0.04, 0.08, -0.09 + (i % 6) * 0.035]);
    }
    return pos;
  }, []);

  const exhaustPositions = useMemo(() => {
    const pos: [number,number,number][] = [];
    for (let i = 0; i < 12; i++) {
      pos.push([i < 6 ? 0.08 : -0.08, 0.05, -0.09 + (i % 6) * 0.035]);
    }
    return pos;
  }, []);

  const vibration = useMemo(
    () => calculateEngineVibration(crankRef.current.angleDeg, crankRef.current.rpm, engineType),
    [runtimeActive, displayRpm]
  );

  const handleSetRpm = (rpm: number) => {
    targetRpmRef.current = rpm;
    crankRef.current.targetRpm = rpm;
  };

  const handleToggle = () => {
    if (runtimeActive) {
      targetRpmRef.current = 0;
      crankRef.current.targetRpm = 0;
      setTimeout(() => setRuntimeActive(false), 1000);
    } else {
      crankRef.current.targetRpm = 800;
      targetRpmRef.current = 800;
      setRuntimeActive(true);
      frameTimeRef.current = performance.now();
    }
  };

  if (!runtimeActive) return null;

  return (
    <>
      <group name="Engine_Runtime_Motion">
        <CrankshaftRotator angleRad={(crankRef.current.angleDeg * Math.PI) / 180} vibration={vibration} />
        {pistonPositions.map((pos, i) => (
          <PistonAssembly key={i} crankAngleDeg={crankRef.current.angleDeg} phaseOffsetDeg={firingOrder[i] ?? 0} position={pos} bankAngle={bankAngle} pistonRadius={0.014} />
        ))}
        {[-1,1].map(bank => ["intake","exhaust"].map(cam => (
          <CamshaftRotator key={"c"+bank+cam} crankAngleDeg={crankRef.current.angleDeg} position={[bank*0.05,0.12,0]} bank={cam as "intake"|"exhaust"} />
        )))}
        {pistonPositions.map((pos, i) => (
          <React.Fragment key={'v'+i}>
            <ValveActuator crankAngleDeg={crankRef.current.angleDeg} phaseOffsetDeg={firingOrder[i]??0} position={[pos[0]+0.015,0.1,pos[2]]} isIntake={true} />
            <ValveActuator crankAngleDeg={crankRef.current.angleDeg} phaseOffsetDeg={(firingOrder[i]??0)+360} position={[pos[0]-0.015,0.1,pos[2]]} isIntake={false} />
          </React.Fragment>
        ))}
        <TurbochargerSpin turbineSpeedRpm={turboRef.current.turbineSpeedRpm} position={[0,0.06,0.22]} />
        <OilPumpGear angleRad={(crankRef.current.angleDeg * Math.PI) / 180} position={[0,-0.06,0.15]} />
        {exhaustPositions.map((pos, i) => {
          const a = (crankRef.current.angleDeg + (firingOrder[i]??0) + 460) % 720;
          return (<ExhaustPulseGlow key={i} intensity={Math.max(0, Math.sin((a/120)*Math.PI)) * (crankRef.current.rpm/3000)} position={pos} temperature={0.6} />);
        })}
      </group>
      <RuntimeControlOverlay currentRpm={crankRef.current.rpm} targetRpm={targetRpmRef.current} isRunning={runtimeActive} onSetRpm={handleSetRpm} onToggle={handleToggle} />
    </>
  );
};

export default EngineRuntimeMotion;

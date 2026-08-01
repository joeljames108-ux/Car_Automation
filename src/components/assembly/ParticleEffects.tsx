import { useState, useEffect } from "react";
import { AssemblyPhase, ComponentId } from "../../sim/assemblyTypes";

export type ParticlePreset = "sparks" | "dust" | "oil" | "smoke" | "coolant" | "welding";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  duration: number;
  delay: number;
}

interface ParticleEffectsProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  slotPosition?: { x: number; y: number };
}

export function ParticleEffects({
  activeComponentId,
  phase,
  slotPosition = { x: 250, y: 225 },
}: ParticleEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [preset, setPreset] = useState<ParticlePreset>("sparks");

  useEffect(() => {
    if (!activeComponentId || (phase !== "locking" && phase !== "confirming" && phase !== "complete")) {
      setParticles([]);
      return;
    }

    // Determine particle preset based on component type
    let chosenPreset: ParticlePreset = "sparks";
    if (activeComponentId === "block" || activeComponentId === "cylinder_head") {
      chosenPreset = "dust";
    } else if (activeComponentId === "oil_pan") {
      chosenPreset = "oil";
    } else if (activeComponentId === "head_gasket") {
      chosenPreset = "coolant";
    } else if (activeComponentId === "exhaust_headers") {
      chosenPreset = "welding";
    } else if (activeComponentId === "turbocharger") {
      chosenPreset = "smoke";
    } else {
      chosenPreset = "sparks";
    }

    setPreset(chosenPreset);

    // Generate randomized particles
    const count = chosenPreset === "sparks" || chosenPreset === "welding" ? 24 : 12;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 40 + Math.random() * 80;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      let color = "#fbbf24";
      if (chosenPreset === "sparks") color = Math.random() > 0.5 ? "#f97316" : "#facc15";
      else if (chosenPreset === "dust") color = "#cbd5e1";
      else if (chosenPreset === "oil") color = "#eab308";
      else if (chosenPreset === "coolant") color = "#38bdf8";
      else if (chosenPreset === "smoke") color = "#94a3b8";
      else if (chosenPreset === "welding") color = Math.random() > 0.5 ? "#ffffff" : "#38bdf8";

      newParticles.push({
        id: Math.random(),
        x: slotPosition.x,
        y: slotPosition.y,
        size: Math.random() * 4 + 2,
        color,
        vx,
        vy,
        duration: 0.6 + Math.random() * 0.4,
        delay: Math.random() * 0.1,
      });
    }

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeComponentId, phase, slotPosition]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full transition-all ${
            preset === "smoke" || preset === "dust" ? "blur-[1px] opacity-70" : "shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          }`}
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `translate(${p.vx}px, ${p.vy}px) scale(0)`,
            animation: `particleBurst ${p.duration}s cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

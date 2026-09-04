import React from "react";

export type MaterialTextureType = "leather" | "carbon" | "wood" | "alcantara" | "cloth" | "piano_black" | "aluminum";

interface MaterialTexturePreviewProps { type: MaterialTextureType; color: string; size?: number; isActive?: boolean; className?: string; }

const LeatherTexture: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><defs><filter id="ltN"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="6" seed="42" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncR type="discrete" tableValues="0.1 0.3 0.5 0.7 0.9" /><feFuncG type="discrete" tableValues="0.1 0.3 0.5 0.7 0.9" /><feFuncB type="discrete" tableValues="0.1 0.3 0.5 0.7 0.9" /></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply" /></filter></defs><rect width="64" height="64" rx="6" fill={color} filter="url(#ltN)" /><rect width="64" height="64" rx="6" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" /></svg>
);

const CarbonTexture: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><defs><pattern id="cw" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect x="0" y="0" width="4" height="4" fill="rgba(255,255,255,0.06)" /><rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.06)" /><rect x="0" y="4" width="4" height="4" fill="rgba(0,0,0,0.15)" /><rect x="4" y="0" width="4" height="4" fill="rgba(0,0,0,0.15)" /></pattern></defs><rect width="64" height="64" rx="6" fill={color || "#1a1a2e"} /><rect width="64" height="64" rx="6" fill="url(#cw)" /><rect width="64" height="64" rx="6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" /></svg>
);

const WoodTexture: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><defs><filter id="wg"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.5" numOctaves="5" seed="15" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncR type="discrete" tableValues="0.2 0.4 0.6 0.8 1" /><feFuncG type="discrete" tableValues="0.15 0.3 0.45 0.6 0.75" /><feFuncB type="discrete" tableValues="0.08 0.18 0.28 0.38 0.48" /></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply" /></filter></defs><rect width="64" height="64" rx="6" fill={color || "#8d5027"} filter="url(#wg)" /><rect width="64" height="64" rx="6" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" /></svg>
);

const AlcantaraTexture: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><defs><filter id="af"><feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="4" seed="77" /><feColorMatrix type="saturate" values="0" /><feBlend in="SourceGraphic" mode="overlay" /></filter></defs><rect width="64" height="64" rx="6" fill={color} filter="url(#af)" /><rect width="64" height="64" rx="6" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" /></svg>
);

const ClothTexture: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><defs><pattern id="clw" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="3" height="3" fill="rgba(255,255,255,0.08)" /><rect x="3" y="3" width="3" height="3" fill="rgba(255,255,255,0.08)" /><rect x="3" y="0" width="3" height="3" fill="rgba(0,0,0,0.08)" /><rect x="0" y="3" width="3" height="3" fill="rgba(0,0,0,0.08)" /></pattern></defs><rect width="64" height="64" rx="6" fill={color} /><rect width="64" height="64" rx="6" fill="url(#clw)" /><rect width="64" height="64" rx="6" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" /></svg>
);

const PianoBlackTexture: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><defs><linearGradient id="ps" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.15)" /><stop offset="50%" stopColor="rgba(255,255,255,0)" /><stop offset="100%" stopColor="rgba(255,255,255,0.08)" /></linearGradient></defs><rect width="64" height="64" rx="6" fill={color || "#0a0a0f"} /><rect width="64" height="64" rx="6" fill="url(#ps)" /><rect width="64" height="64" rx="6" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" /></svg>
);

const AluminumTexture: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64"><defs><filter id="ba"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.8" numOctaves="3" seed="55" /><feColorMatrix type="saturate" values="0" /><feBlend in="SourceGraphic" mode="soft-light" /></filter></defs><rect width="64" height="64" rx="6" fill={color || "#94a3b8"} filter="url(#ba)" /><rect width="64" height="64" rx="6" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" /></svg>
);

const TEXTURE_MAP: Record<MaterialTextureType, React.FC<{ color: string; size: number }>> = {
  leather: LeatherTexture, carbon: CarbonTexture, wood: WoodTexture,
  alcantara: AlcantaraTexture, cloth: ClothTexture, piano_black: PianoBlackTexture, aluminum: AluminumTexture,
};

export const MaterialTexturePreview: React.FC<MaterialTexturePreviewProps> = ({
  type, color, size = 40, isActive = false, className = "",
}) => {
  const Tex = TEXTURE_MAP[type] || LeatherTexture;
  return (
    <div className={"relative rounded-lg overflow-hidden transition-all duration-200 " + (isActive ? "ring-2 ring-amber-400/70 ring-offset-1 ring-offset-amber-50 shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "ring-1 ring-white/10") + " " + className} style={{ width: size, height: size }}>
      <Tex color={color} size={size} />
      {isActive && ( <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg"><div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-sm" /></div> )}
    </div>
  );
};

export const MATERIAL_LABELS: Record<MaterialTextureType, string> = {
  leather: "Nappa Leather", carbon: "3K Carbon Fiber", wood: "Open-Pore Walnut",
  alcantara: "Alcantara Suede", cloth: "Ballistic Cordura", piano_black: "Piano Black", aluminum: "Brushed Aluminum",
};

export const MATERIAL_WEIGHTS: Record<MaterialTextureType, string> = {
  leather: "12.4 kg", carbon: "8.2 kg", wood: "14.1 kg",
  alcantara: "10.8 kg", cloth: "9.6 kg", piano_black: "11.0 kg", aluminum: "10.2 kg",
};
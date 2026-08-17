// ===================================================================
// WHEEL, TIRE & BRAKE SVG SHADER & TEXTURE DEFINITIONS
// ===================================================================
// SVG <defs> containing carbon ceramic matrix cross-hatch, slotted iron
// rotor textures, tire rubber treads, and caliper racing gloss finishes.
// ===================================================================

import React from "react";

export const WheelBrakeShaderDefs: React.FC = () => {
  return (
    <defs>
      {/* ── 1. Carbon Ceramic Brake Rotor Matrix Texture ── */}
      <radialGradient id="carbonCeramicRotorFace" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="40%" stopColor="#334155" />
        <stop offset="70%" stopColor="#475569" />
        <stop offset="90%" stopColor="#d97706" stopOpacity="0.3" /> {/* Thermal carbon friction sheen */}
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>

      {/* ── 2. Slotted Cast Iron Rotor Gradient ── */}
      <radialGradient id="castIronRotorFace" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="60%" stopColor="#94a3b8" />
        <stop offset="90%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>

      {/* ── 3. Caliper Racing Paint Gloss (Brembo Gold / Red) ── */}
      <linearGradient id="caliperGoldGloss" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="35%" stopColor="#f59e0b" />
        <stop offset="80%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>

      <linearGradient id="caliperRedGloss" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="35%" stopColor="#dc2626" />
        <stop offset="80%" stopColor="#991b1b" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>

      {/* ── 4. Motorsport Tire Rubber Compound Texture ── */}
      <radialGradient id="tireRubberTread" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="60%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>

      {/* ── 5. Forged Wheel Rim Satin Bronze ── */}
      <linearGradient id="wheelSatinBronze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="30%" stopColor="#f59e0b" />
        <stop offset="60%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>

      {/* ── 6. Forged Wheel Rim Jet Black ── */}
      <linearGradient id="wheelJetBlack" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>
  );
};

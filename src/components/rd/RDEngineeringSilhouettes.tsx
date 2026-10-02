// ===================================================================
// R&D ENGINEERING SILHOUETTES — CAD & POWERTRAIN HARDWARE ARTWORK
// Authentic vector silhouettes matching the automotive tech tree spec
// ===================================================================
import React from "react";

interface SilhouetteProps {
  type: string;
  className?: string;
  size?: number;
}

export const RDEngineeringSilhouette: React.FC<SilhouetteProps> = ({
  type,
  className = "text-slate-600",
  size = 38,
}) => {
  switch (type.toLowerCase()) {
    case "i4":
    case "eng_arch_baseline":
      // 4-Cylinder inline engine block with ribbed oil pan and timing chain cover
      return (
        <svg width={size} height={size * 0.75} viewBox="0 0 48 36" fill="currentColor" className={className}>
          <path d="M 6 8 L 42 8 L 40 26 L 36 28 L 36 32 L 12 32 L 12 28 L 8 26 Z" opacity="0.9" />
          {/* Cylinder bores */}
          <rect x="9" y="11" width="6" height="12" rx="1.5" fill="#090d14" opacity="0.8" />
          <rect x="17" y="11" width="6" height="12" rx="1.5" fill="#090d14" opacity="0.8" />
          <rect x="25" y="11" width="6" height="12" rx="1.5" fill="#090d14" opacity="0.8" />
          <rect x="33" y="11" width="6" height="12" rx="1.5" fill="#090d14" opacity="0.8" />
          {/* Sump cooling fins */}
          <line x1="14" y1="30" x2="34" y2="30" stroke="#090d14" strokeWidth="1" />
        </svg>
      );

    case "i6":
    case "eng_arch_i6":
      // Long 6-cylinder inline block
      return (
        <svg width={size * 1.1} height={size * 0.7} viewBox="0 0 54 34" fill="currentColor" className={className}>
          <path d="M 4 8 L 50 8 L 48 26 L 44 28 L 44 32 L 10 32 L 10 28 L 6 26 Z" opacity="0.9" />
          <rect x="7" y="11" width="5" height="12" rx="1" fill="#090d14" opacity="0.8" />
          <rect x="14" y="11" width="5" height="12" rx="1" fill="#090d14" opacity="0.8" />
          <rect x="21" y="11" width="5" height="12" rx="1" fill="#090d14" opacity="0.8" />
          <rect x="28" y="11" width="5" height="12" rx="1" fill="#090d14" opacity="0.8" />
          <rect x="35" y="11" width="5" height="12" rx="1" fill="#090d14" opacity="0.8" />
          <rect x="42" y="11" width="5" height="12" rx="1" fill="#090d14" opacity="0.8" />
        </svg>
      );

    case "v8":
    case "eng_arch_v8":
      // 90-Degree V8 engine cross-section silhouette
      return (
        <svg width={size} height={size * 0.8} viewBox="0 0 44 36" fill="currentColor" className={className}>
          <path d="M 4 10 L 14 4 L 22 14 L 30 4 L 40 10 L 32 26 L 28 32 L 16 32 L 12 26 Z" opacity="0.9" />
          <circle cx="13" cy="11" r="3.5" fill="#090d14" opacity="0.85" />
          <circle cx="31" cy="11" r="3.5" fill="#090d14" opacity="0.85" />
          <circle cx="22" cy="24" r="4.5" fill="#090d14" opacity="0.85" />
        </svg>
      );

    case "boxer":
    case "eng_arch_boxer":
      // Horizontally opposed flat boxer block with twin lateral cylinder banks
      return (
        <svg width={size * 1.2} height={size * 0.6} viewBox="0 0 52 28" fill="currentColor" className={className}>
          <path d="M 2 10 L 18 10 L 22 6 L 30 6 L 34 10 L 50 10 L 50 20 L 34 20 L 30 24 L 22 24 L 18 20 L 2 20 Z" opacity="0.9" />
          <rect x="5" y="12" width="10" height="6" rx="1" fill="#090d14" opacity="0.8" />
          <rect x="37" y="12" width="10" height="6" rx="1" fill="#090d14" opacity="0.8" />
          <circle cx="26" cy="15" r="4" fill="#090d14" opacity="0.85" />
        </svg>
      );

    case "turbo":
    case "eng_ind_turbo_twin":
    case "eng_ind_turbo_flat6":
      // Turbocharger scroll housing and compressor wheel
      return (
        <svg width={size} height={size * 0.85} viewBox="0 0 40 34" fill="currentColor" className={className}>
          <path d="M 20 4 C 11 4 4 11 4 20 C 4 27 10 32 18 32 L 34 32 L 36 24 L 26 24 C 28 22 29 19 29 16 C 29 9 24 4 20 4 Z" opacity="0.9" />
          <circle cx="18" cy="18" r="6" fill="#090d14" opacity="0.9" />
          <circle cx="18" cy="18" r="2.5" fill="currentColor" opacity="0.8" />
        </svg>
      );

    case "rotary":
    case "eng_arch_rotary":
    case "eng_rotary_twin":
      // Wankel epitrochoid housing with triangular rotor
      return (
        <svg width={size} height={size * 0.9} viewBox="0 0 40 36" fill="currentColor" className={className}>
          <path d="M 12 4 C 20 6 28 4 34 10 C 38 16 38 22 34 28 C 28 32 20 30 12 32 C 6 32 2 26 2 18 C 2 10 6 4 12 4 Z" opacity="0.85" />
          {/* Reuleaux triangle rotor */}
          <path d="M 20 10 L 28 24 L 12 24 Z" fill="#090d14" opacity="0.9" />
          <circle cx="20" cy="19" r="2.5" fill="currentColor" opacity="0.85" />
        </svg>
      );

    case "v12":
    case "eng_arch_v12":
      // Sleek Grand Tourer low-slung coupe aerodynamic silhouette
      return (
        <svg width={size * 1.3} height={size * 0.55} viewBox="0 0 60 26" fill="currentColor" className={className}>
          <path d="M 3 17 L 10 14 L 18 8 L 38 7 L 48 13 L 57 14 L 59 18 L 54 21 L 48 21 C 47 18 43 18 42 21 L 18 21 C 17 18 13 18 12 21 L 3 21 Z" opacity="0.9" />
          <circle cx="15" cy="20" r="3.5" fill="#090d14" opacity="0.9" />
          <circle cx="45" cy="20" r="3.5" fill="#090d14" opacity="0.9" />
        </svg>
      );

    case "itb":
    case "eng_valvetrain_dohc":
    case "eng_ind_itb_v12":
      // Individual Throttle Bodies with flared trumpet velocity stacks
      return (
        <svg width={size * 1.1} height={size * 0.75} viewBox="0 0 48 34" fill="currentColor" className={className}>
          <path d="M 4 24 L 44 24 L 44 29 L 4 29 Z" opacity="0.9" />
          {/* 4 flared velocity stack trumpets */}
          <path d="M 7 24 L 9 10 L 5 6 L 15 6 L 11 10 L 13 24 Z" fill="#090d14" opacity="0.9" />
          <path d="M 17 24 L 19 10 L 15 6 L 25 6 L 21 10 L 23 24 Z" fill="#090d14" opacity="0.9" />
          <path d="M 27 24 L 29 10 L 25 6 L 35 6 L 31 10 L 33 24 Z" fill="#090d14" opacity="0.9" />
          <path d="M 37 24 L 39 10 L 35 6 L 45 6 L 41 10 L 43 24 Z" fill="#090d14" opacity="0.9" />
        </svg>
      );

    default:
      // Generic technical engineering block
      return (
        <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="currentColor" className={className}>
          <rect x="4" y="6" width="32" height="18" rx="3" opacity="0.9" />
          <circle cx="20" cy="15" r="4" fill="#090d14" opacity="0.85" />
        </svg>
      );
  }
};

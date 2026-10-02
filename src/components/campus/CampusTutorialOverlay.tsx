import React, { useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  Compass,
  Users,
  HardHat,
  Factory,
  Sparkles,
  CheckCircle2,
  BookOpen
} from "lucide-react";

interface CampusTutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: string[];
  tip?: string;
}

export const CampusTutorialOverlay: React.FC<CampusTutorialOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const steps: TutorialStep[] = [
    {
      title: "Welcome to Apex Global Campus",
      subtitle: "Step 1 of 5 • Corporate Headquarters Overview",
      icon: <Building2 className="text-cyan-600" size={24} />,
      content: [
        "Your automotive empire is powered by this 14-unit Corporate Headquarters campus.",
        "Divided into 4 strategic zones (A, B, C, D), your campus houses design studios, crash laboratories, aerodynamics wind tunnels, powertrain cleanrooms, and an industrial gigafactory.",
        "In the 1970 founding era, you begin with 7 active core pavilions. As your cash reserves and market reach expand, you can unlock and construct the remaining 7 specialized facilities.",
      ],
      tip: "Tip: Higher tier facilities directly amplify your R&D development velocity, car chassis rigidity, and vehicle styling appeal.",
    },
    {
      title: "Fiscal Burn Rate & Campus Prestige",
      subtitle: "Step 2 of 5 • Real-Time Telemetry",
      icon: <Users className="text-amber-600" size={24} />,
      content: [
        "The top telemetry dashboard tracks your total staff headcount, monthly facility maintenance, and campus prestige score (0–100).",
        "Every engineer employed costs an estimated $4,500/month in payroll, alongside individual facility operational upkeep.",
        "Monitor your net cash flow carefully—investing too rapidly in high-tier upgrades can deplete your operating treasury during market recessions.",
      ],
      tip: "Tip: Click the 'Analytics & Budget' button at any time to inspect detailed cash burn, department payroll, and sector headcount distribution.",
    },
    {
      title: "Navigating the 3D Isometric Viewport",
      subtitle: "Step 3 of 5 • Campus Navigation",
      icon: <Compass className="text-emerald-600" size={24} />,
      content: [
        "The central 3D viewport renders authentic CAD architecture generated in Blender across an alabaster diorama tabletop.",
        "Left-click and drag to rotate your camera view around the campus.",
        "Right-click and drag to pan laterally, and use the scroll wheel to zoom into individual architectural details.",
        "Click on any building mesh or plot base to select and frame it immediately in the camera.",
      ],
      tip: "Tip: You can also use the left Tree Sidebar to quickly search and jump to any facility across Zones A–D.",
    },
    {
      title: "The 5-Tab Building Inspector",
      subtitle: "Step 4 of 5 • Facility Management",
      icon: <Sparkles className="text-indigo-600" size={24} />,
      content: [
        "Selecting any unit opens the right slide-out Building Inspector with 5 specialized management tabs:",
        "• Overview: Era tier badge, maintenance burn, active prototype bays, and facility bonuses.",
        "• Departments: Expand and upgrade specialized sub-labs to unlock advanced tooling perks.",
        "• Staff: Assign overtime policies (40h Standard, 52h Crunch, 65h Death) with real-time CAD speed and error rate trade-offs.",
        "• Upgrade: Progress through 8 distinct evolutionary eras (1970 starter brick to 2030s hypermodern).",
        "• History: Review your building's architectural lineage and milestones since 1970.",
      ],
      tip: "Tip: Unlocked sub-departments provide passive perks that lower engineering hours across vehicle development projects.",
    },
    {
      title: "Construction Queue & Manufacturing Gigafactory",
      subtitle: "Step 5 of 5 • Logistics & Expansion",
      icon: <Factory className="text-cyan-600" size={24} />,
      content: [
        "When an upgrade or new plot groundbreaking begins, it enters the Construction Queue at the bottom-right of your screen.",
        "Track monthly progress bars, civil costs, and estimated commissioning dates.",
        "Unit 10 (Manufacturing Plant) is your most vital strategic asset: starting as an outsourced contract partnership, you can acquire industrial land and construct your own owned stamping and robotic assembly gigafactory to drastically cut unit production costs.",
      ],
      tip: "Tip: Completing the owned plant saves up to 40% in contractor per-vehicle assembly fees.",
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Guide Card */}
      <div className="relative w-full max-w-xl bg-[#f8f6f0] border border-[#dad4c5] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600" />

        {/* Header */}
        <div className="p-5 border-b border-[#dad4c5] bg-white/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center">
              {currentStep.icon}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-mono tracking-wide">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono">{currentStep.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            {currentStep.content.map((p, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-relaxed font-sans">
                {p}
              </p>
            ))}
          </div>

          {currentStep.tip && (
            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 font-sans leading-relaxed flex items-start gap-2">
              <Sparkles size={16} className="text-cyan-700 shrink-0 mt-0.5" />
              <span>{currentStep.tip}</span>
            </div>
          )}

          {/* Step Progress Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {steps.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentStepIndex
                    ? "w-8 bg-cyan-700"
                    : i < currentStepIndex
                    ? "w-3 bg-cyan-300"
                    : "w-3 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[#dad4c5] bg-white/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-mono font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-1.5 rounded-xl border border-[#dad4c5] bg-white text-slate-700 hover:bg-slate-50 text-xs font-mono font-bold flex items-center gap-1 transition-all"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-mono font-bold flex items-center gap-1 shadow-xs transition-all"
            >
              <span>{isLast ? "Get Started" : "Next"}</span>
              {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

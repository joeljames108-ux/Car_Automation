// ===================================================================
// EXTERIOR COMPONENT INSTALLATION CARD
// ===================================================================
// Interactive card for installing individual exterior subsystems,
// swapping material grades, inspecting fasteners, and checking tolerances.
// ===================================================================

import React from "react";
import { Check, Plus, Wrench, Shield, ArrowUpRight, DollarSign, Scale } from "lucide-react";
import type { ExteriorAssemblyComponentMeta } from "../../../sim/exteriorAssemblyTypes";
import type { MaterialGrade } from "../../../sim/assemblyTypes";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";

import { useVehicleArchitectureStore } from "../../../state/useVehicleArchitectureStore";

function getPlatformComponentDetails(
  id: string,
  category: string,
  defaultName: string,
  defaultDesc: string
): { name: string; desc: string; badge: string } {
  const catUpper = category === "crossover" ? "CROSS" : category.toUpperCase();

  if (id === "trunk_decklid") {
    switch (category) {
      case "sedan":
        return {
          name: "Sedan 3-Box Trunk Decklid & Aerofoil",
          desc: "Low-drag trunk decklid configured for 3-box executive saloon architecture.",
          badge: "SEDAN 3-BOX",
        };
      case "hatchback":
        return {
          name: "Hatchback 2-Box Aerodynamic Rear Hatch",
          desc: "Upright liftgate with integrated high-downforce top spoiler & rear wash-wipe.",
          badge: "HATCH 2-BOX",
        };
      case "crossover":
        return {
          name: "All-Road Power Split Tailgate & Cladding",
          desc: "Dual-action split tailgate with rugged impact polymer protection.",
          badge: "CROSS TAILGATE",
        };
      case "suv":
        return {
          name: "Heavy-Duty Reinforced Armored Liftgate",
          desc: "Full-height powered liftgate with external spare wheel mount hardpoint.",
          badge: "SUV LIFTGATE",
        };
    }
  }

  if (id === "hood_panel") {
    switch (category) {
      case "sedan":
        return {
          name: "Executive Low-Cowl Sleek Hood",
          desc: "Aerodynamically sculpted hood with laminar boundary layer airflow channels.",
          badge: "SEDAN AERO",
        };
      case "hatchback":
        return {
          name: "Compact Slanted Track Hood",
          desc: "Short aggressive hood with dual heat extraction louvers for compact bay.",
          badge: "HATCH TRACK",
        };
      case "crossover":
        return {
          name: "Elevated Sculpted Hood with Power Creases",
          desc: "Raised hood profile providing commanding driver sightlines and engine clearance.",
          badge: "CROSS ELEVATED",
        };
      case "suv":
        return {
          name: "Heavy-Duty Power-Bulge Reinforced Hood",
          desc: "High-clearance reinforced hood accommodating large powertrain and intake plenum.",
          badge: "SUV HEAVY DUTY",
        };
    }
  }

  if (id === "roof_panel") {
    switch (category) {
      case "sedan":
        return {
          name: "Fastback Panoramic Glass / Carbon Roof",
          desc: "Sleek low-profile roof seamlessly joining front windshield and rear glass.",
          badge: "SEDAN FASTBACK",
        };
      case "hatchback":
        return {
          name: "Compact Upright High-Rigidity Roof",
          desc: "Extended roofline maximizing rear passenger headroom and track downforce.",
          badge: "HATCH UPWARD",
        };
      case "crossover":
        return {
          name: "All-Road Roof with Integrated Utility Rails",
          desc: "Reinforced roof panel carrying aerodynamic flush longitudinal roof rails.",
          badge: "CROSS RAILS",
        };
      case "suv":
        return {
          name: "Expedition Dual-Sunroof / Armored Solid Roof",
          desc: "Heavy-duty structural roof rated for dynamic 150kg rooftop overland tent/rack loads.",
          badge: "SUV EXPEDITION",
        };
    }
  }

  if (id === "front_bumper_fascia") {
    switch (category) {
      case "sedan":
        return {
          name: "Executive Aerodynamic Front Fascia",
          desc: "Cd-optimized front bumper with active air shutters and integrated DRL optics.",
          badge: "SEDAN SPEC",
        };
      case "hatchback":
        return {
          name: "Agile Track Splitter Front Fascia",
          desc: "High-downforce aggressive front bumper with brake cooling ducting.",
          badge: "HATCH SPEC",
        };
      case "crossover":
        return {
          name: "All-Road Fascia with Integrated Skid Plate",
          desc: "Elevated approach angle front bumper with brushed aluminum bash guard.",
          badge: "CROSS SPEC",
        };
      case "suv":
        return {
          name: "Heavy-Duty Rugged Steel Winch-Guard Bumper",
          desc: "Maximum approach angle off-road bumper with recovery shackles & winch cavity.",
          badge: "SUV SPEC",
        };
    }
  }

  if (id === "front_fenders" || id === "rear_quarter_panels") {
    switch (category) {
      case "sedan":
        return { name: defaultName, desc: defaultDesc, badge: "SEDAN SPEC" };
      case "hatchback":
        return { name: defaultName, desc: defaultDesc, badge: "HATCH SPEC" };
      case "crossover":
        return {
          name: `${defaultName} (Elevated Cladding)`,
          desc: `${defaultDesc} with protective composite arch extensions.`,
          badge: "CROSS SPEC",
        };
      case "suv":
        return {
          name: `${defaultName} (Wide Heavy-Duty Armor)`,
          desc: `${defaultDesc} accommodating 33" all-terrain wheel articulation.`,
          badge: "SUV SPEC",
        };
    }
  }

  return { name: defaultName, desc: defaultDesc, badge: `${catUpper} SPEC` };
}

interface ExteriorComponentCardProps {
  component: ExteriorAssemblyComponentMeta;
  isInstalled: boolean;
  isActive: boolean;
  isSelected: boolean;
  selectedGrade: MaterialGrade;
  isInstallable: boolean;
  onInstall: () => void;
  onSelect: () => void;
  onGradeChange: (grade: MaterialGrade) => void;
}

export const ExteriorComponentCard: React.FC<ExteriorComponentCardProps> = ({
  component,
  isInstalled,
  isActive,
  isSelected,
  selectedGrade,
  isInstallable,
  onInstall,
  onSelect,
  onGradeChange,
}) => {
  const selectedCategory = useVehicleArchitectureStore((s) => s.selectedCategory);
  const platformDetails = getPlatformComponentDetails(
    component.id,
    selectedCategory,
    component.name,
    component.description
  );

  const currentVariant = component.variants.find((v) => v.id === selectedGrade) || component.variants[0];
  const effectiveWeight = Math.round(component.statDeltas.weight * (currentVariant?.weightMultiplier || 1.0));
  const effectiveCost = Math.round(component.statDeltas.cost * (currentVariant?.costMultiplier || 1.0));

  return (
    <div
      onClick={onSelect}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? "bg-slate-900/60 border-amber-400 shadow-[0_0_15px_rgba(217,119,6,0.3)]"
          : isInstalled
          ? "bg-slate-900/60 border-emerald-500/30 hover:border-emerald-400/60"
          : isInstallable
          ? "bg-slate-900/80 border-slate-700 hover:border-amber-500/60 hover:bg-slate-850"
          : "bg-slate-950/40 border-slate-850 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Component Info & Subcategory */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-slate-900/80 border border-amber-500/30">
              {component.subcategory}
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {platformDetails.badge}
            </span>
            {isInstalled && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <Check size={11} /> INSTALLED
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
            {platformDetails.name}
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
            {platformDetails.desc}
          </p>
        </div>

        {/* Right: Install Action Button */}
        <div>
          {isInstalled ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
              <Check size={16} />
            </div>
          ) : isActive ? (
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-mono font-bold text-xs animate-spin">
              ⚡
            </div>
          ) : isInstallable ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInstall();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1 shadow-md hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all"
            >
              <Plus size={13} />
              <span>INSTALL</span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-mono">
              🔒
            </div>
          )}
        </div>
      </div>

      {/* Physical Anatomical Sub-Elements Breakdown */}
      {component.subElements && component.subElements.length > 0 && (
        <div className={`mt-2.5 pt-2 border-t border-white/5 space-y-1 ${isSelected ? "block" : "hidden group-hover:block"}`}>
          <div className="flex items-center justify-between text-[10px] font-mono text-amber-400/90 font-bold">
            <span>PHYSICAL SUB-ELEMENTS:</span>
            <span className="text-[9px] text-slate-500">{component.subElements.length} parts</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {component.subElements.map((sub, idx) => (
              <div
                key={idx}
                className="text-[10px] font-mono text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-lg border border-white/5 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                <span className="truncate">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Material Grade Selector & Stat Delta Summary */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
        {/* Material Grade Selection Dropdown */}
        <select
          value={selectedGrade}
          onChange={(e) => {
            e.stopPropagation();
            onGradeChange(e.target.value as MaterialGrade);
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-950 border border-white/10 rounded-lg px-2 py-0.5 text-[11px] font-mono text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          {component.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>

        {/* Weight and Cost Badges */}
        <div className="flex items-center gap-2.5 text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-0.5">
            <Scale size={11} className="text-slate-500" />
            <strong className="text-slate-200">{effectiveWeight}kg</strong>
          </span>
          <span className="text-slate-400 flex items-center gap-0.5">
            <DollarSign size={11} className="text-slate-500" />
            <strong className="text-slate-200">${effectiveCost.toLocaleString()}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

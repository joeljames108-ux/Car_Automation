export type GameTipCategory =
  | "aerodynamics"
  | "powertrain"
  | "chassis"
  | "manufacturing"
  | "economy"
  | "motorsport"
  | "rd"
  | "safety"
  | "controls";

export interface GameTip {
  id: string;
  category: GameTipCategory;
  categoryLabel: string;
  icon: string;
  badgeColor: string;
  title: string;
  tip: string;
  impact?: string;
}

export const GAME_TIPS: GameTip[] = [
  // ── Aerodynamics & CFD ──
  {
    id: "aero-diffuser",
    category: "aerodynamics",
    categoryLabel: "AERODYNAMICS",
    icon: "💨",
    badgeColor: "#0284c7",
    title: "Diffuser Expansion Angle Limit",
    tip: "Keep rear diffuser expansion angles under 10°–12°. Steeper angles create adverse pressure gradients that trigger flow detachment, drastically stalling ground-effect underbody suction.",
    impact: "Maximizes downforce with minimal induced drag penalty."
  },
  {
    id: "aero-ground-effect",
    category: "aerodynamics",
    categoryLabel: "AERODYNAMICS",
    icon: "💨",
    badgeColor: "#0284c7",
    title: "Underbody Ground Effect Efficiency",
    tip: "A smooth flat underfloor with longitudinal Venturi tunnels generates up to 60% of total vehicle downforce with significantly less parasitic drag than high-angle rear wings.",
    impact: "Essential for high-speed high-efficiency circuit lap times."
  },
  {
    id: "aero-vortices",
    category: "aerodynamics",
    categoryLabel: "AERODYNAMICS",
    icon: "💨",
    badgeColor: "#0284c7",
    title: "Front Splitter Vortex Generators",
    tip: "Front splitter endplates and dive planes (canards) shed helical vortices that seal the front floor edge, preventing tire turbulent squirt from invading the low-pressure underbody.",
    impact: "Stabilizes front-axle bite and cures high-speed understeer."
  },

  // ── Powertrain & Combustion ──
  {
    id: "engine-bore-stroke",
    category: "powertrain",
    categoryLabel: "POWERTRAIN",
    icon: "⚙️",
    badgeColor: "#ea580c",
    title: "Bore vs. Stroke Geometry",
    tip: "Over-square cylinders (bore > stroke) limit mean piston speed at high RPM, allowing screamers that rev past 8,500 RPM. Under-square engines maximize thermal efficiency and low-RPM torque.",
    impact: "Match engine geometry to vehicle archetype and driving mission."
  },
  {
    id: "engine-hot-v",
    category: "powertrain",
    categoryLabel: "POWERTRAIN",
    icon: "⚙️",
    badgeColor: "#ea580c",
    title: "Hot-V Twin-Turbo Layout",
    tip: "Locating twin turbochargers inside the engine cylinder vee reduces exhaust manifold path lengths to inches, eliminating turbo lag and providing razor-sharp transient throttle response.",
    impact: "Improves corner-exit acceleration and packaging compactness."
  },
  {
    id: "engine-lambda",
    category: "powertrain",
    categoryLabel: "POWERTRAIN",
    icon: "⚙️",
    badgeColor: "#ea580c",
    title: "Air-Fuel Ratio & Knock Protection",
    tip: "Running slightly rich under wide-open throttle (Lambda 0.82–0.85) evaporates excess fuel to cool combustion chambers, protecting pistons from destructive detonation (knock).",
    impact: "Safeguards engine reliability during sustained dyno runs and races."
  },

  // ── Chassis, Brakes & Suspension ──
  {
    id: "chassis-rigidity",
    category: "chassis",
    categoryLabel: "CHASSIS & DYNAMICS",
    icon: "🚗",
    badgeColor: "#2563eb",
    title: "Torsional Stiffness Targets",
    tip: "Target a chassis torsional rigidity above 40,000 Nm/deg. A stiff monocoque prevents structural flexing from distorting dynamic suspension camber curves under heavy 1.5G+ lateral loads.",
    impact: "Unlocks predictable cornering response and razor-sharp steering."
  },
  {
    id: "chassis-unsprung",
    category: "chassis",
    categoryLabel: "CHASSIS & DYNAMICS",
    icon: "🚗",
    badgeColor: "#2563eb",
    title: "Unsprung Weight Reduction",
    tip: "Shaving 1 kg from unsprung rotating components (forged magnesium wheels, carbon-ceramic rotors) has the dynamic handling benefit of removing 4–6 kg of sprung chassis mass.",
    impact: "Sharper transient direction changes and shorter braking distances."
  },
  {
    id: "chassis-brakes",
    category: "chassis",
    categoryLabel: "CHASSIS & DYNAMICS",
    icon: "🚗",
    badgeColor: "#2563eb",
    title: "Carbon-Ceramic Thermal Operating Window",
    tip: "Carbon-ceramic brakes perform best between 300°C and 750°C. While requiring pre-warming on street courses, they resist brake fade indefinitely during repeated 250 km/h deceleration events.",
    impact: "Zero brake fluid boiling and consistent pedal pressure."
  },

  // ── Motorsport & Strategy ──
  {
    id: "motorsport-tires",
    category: "motorsport",
    categoryLabel: "MOTORSPORT",
    icon: "🏁",
    badgeColor: "#dc2626",
    title: "Tire Blanket Pre-Heating Window",
    tip: "Pre-heating slick tires in paddock warming blankets to 100°C (Front) and 90°C (Rear) ensures optimal rubber vulcanization grip immediately out of pit lane, preventing cold graining.",
    impact: "Saves 1.5 to 2.0 seconds on crucial out-laps."
  },
  {
    id: "motorsport-undercut",
    category: "motorsport",
    categoryLabel: "MOTORSPORT",
    icon: "🏁",
    badgeColor: "#dc2626",
    title: "The Pit Stop Undercut Strategy",
    tip: "Pitting 1 to 2 laps earlier than your direct rival onto fresh compound tires can generate enough sector delta to leapfrog ahead when your opponent enters their subsequent pit stop.",
    impact: "Crucial race tactic when overtaking on narrow circuits is difficult."
  },
  {
    id: "motorsport-bop",
    category: "motorsport",
    categoryLabel: "MOTORSPORT",
    icon: "🏁",
    badgeColor: "#dc2626",
    title: "FIA Balance of Performance (BoP)",
    tip: "In LMH and GT3 regulations, power-to-weight and aerodynamic downforce-to-drag ratios (Cl/Cd ~4.0:1) are closely monitored. Optimize torque delivery across the entire rev range rather than peak HP.",
    impact: "Guarantees legality and maximum average sector speed."
  },

  // ── Manufacturing & Factory Operations ──
  {
    id: "factory-takt",
    category: "manufacturing",
    categoryLabel: "MANUFACTURING",
    icon: "🏭",
    badgeColor: "#d97706",
    title: "Synchronized Takt Time",
    tip: "Balance work station takt times across stamping, body framing, paint shop, and marriage stations. Any station slower than the takt target creates upstream buffers and slashes monthly delivery output.",
    impact: "Maximizes factory throughput and eliminates inventory stagnation."
  },
  {
    id: "factory-tooling",
    category: "manufacturing",
    categoryLabel: "MANUFACTURING",
    icon: "🏭",
    badgeColor: "#d97706",
    title: "Stamping Die Amortization",
    tip: "Heavy body stamping press dies carry high upfront CapEx. Designing modular platform hardpoints shared across 2 or more vehicle models amortizes tooling costs and cuts per-car unit cost by up to 30%.",
    impact: "Greatly expands operating profit margins (EBITDA)."
  },

  // ── Economy, Ledgers & Tycoon ──
  {
    id: "economy-agency",
    category: "economy",
    categoryLabel: "FINANCE & LEDGER",
    icon: "💰",
    badgeColor: "#16a34a",
    title: "D2C Agency vs. Franchised Dealers",
    tip: "Direct-to-Consumer (D2C) agency sales capture 100% of retail price margins without dealer wholesale discounts, while franchised networks deliver faster global market reach with lower capital outlay.",
    impact: "Balance dealership expansion against corporate cash reserves."
  },
  {
    id: "economy-warranty",
    category: "economy",
    categoryLabel: "FINANCE & LEDGER",
    icon: "💰",
    badgeColor: "#16a34a",
    title: "Pre-Emptive Durability Testing",
    tip: "Investing in 4-post hydraulic shaker rigs and Euro NCAP crash simulations during early prototyping drastically curtails post-launch recall reserves and elevates customer brand equity (NPS).",
    impact: "Protects enterprise valuation and prevents costly warranty write-downs."
  },

  // ── R&D & Breakthrough Tech ──
  {
    id: "rd-solid-state",
    category: "rd",
    categoryLabel: "R&D INNOVATION",
    icon: "🔬",
    badgeColor: "#4f46e5",
    title: "Solid-State Battery Breakthrough",
    tip: "Unlocking solid-state ceramic electrolyte cells in the R&D tech tree boosts pack energy density to 450 Wh/kg, slashing vehicle curb weight by up to 350 kg while eliminating thermal fire hazard.",
    impact: "Transformational range and track endurance for EV hypercars."
  },
  {
    id: "rd-topology",
    category: "rd",
    categoryLabel: "R&D INNOVATION",
    icon: "🔬",
    badgeColor: "#4f46e5",
    title: "Generative CAD Topology Optimization",
    tip: "Algorithmic FEA generative design strips material from structural nodes that experience low stress, concentrating carbon-fiber and aluminum strictly along load paths to save 25% mass.",
    impact: "Unmatched strength-to-weight ratio without sacrificing stiffness."
  },

  // ── Crash Safety & Homologation ──
  {
    id: "safety-crumple",
    category: "safety",
    categoryLabel: "SAFETY & HOMOLOGATION",
    icon: "🛡️",
    badgeColor: "#ef4444",
    title: "Sequential Crumple Zone Dissipation",
    tip: "High-strength extruded aluminum crash boxes buckle sequentially during a 64 km/h offset impact, stretching the deceleration pulse duration to keep passenger cabin G-forces under 25G.",
    impact: "Required to achieve 5-star Euro NCAP and IIHS Top Safety Pick+."
  },
  {
    id: "safety-hv-pyro",
    category: "safety",
    categoryLabel: "SAFETY & HOMOLOGATION",
    icon: "🛡️",
    badgeColor: "#ef4444",
    title: "800V High-Voltage Pyrofuse Interlocks",
    tip: "Pyrotechnic safety disconnects sever high-voltage battery contactors within 1.8 milliseconds of airbag trigger detection, eliminating post-collision chassis short-circuit fire risks.",
    impact: "Mandatory for FIA high-voltage homologation and global safety certification."
  },

  // ── Controls, Shortcuts & Pro Tips ──
  {
    id: "ctrl-skip",
    category: "controls",
    categoryLabel: "CONTROLS & SHORTCUTS",
    icon: "⚡",
    badgeColor: "#ca8a04",
    title: "Instant Transition Skip",
    tip: "Press [ESC] or click anywhere on the loading screen at any time to immediately bypass the transition animation and enter the target hub or studio without delay.",
    impact: "Ideal for power users and rapid iteration."
  },
  {
    id: "ctrl-devmode",
    category: "controls",
    categoryLabel: "CONTROLS & SHORTCUTS",
    icon: "⚡",
    badgeColor: "#ca8a04",
    title: "Developer Sandbox & Console",
    tip: "Press [F8] to toggle Developer Mode with live time-warping, instant cash grants, and state snapshots. Press [F9] to open the Developer Command Console with 30+ debugging commands.",
    impact: "Rapid prototyping, testing, and scenario verification."
  },
  {
    id: "hq-command",
    category: "controls",
    categoryLabel: "EXECUTIVE SUITE",
    icon: "🏛️",
    badgeColor: "#b45309",
    title: "Apex Global Command Headquarters",
    tip: "The Main Menu serves as your enterprise command center. Monitor real-time calendar ticks, worldwide dealership sales, active R&D patent branches, and motorsport standings in one view.",
    impact: "Central nerve center for managing your global automotive empire."
  }
];

/**
 * Returns a random game tip from the collection.
 */
export function getRandomGameTip(): GameTip {
  const index = Math.floor(Math.random() * GAME_TIPS.length);
  return GAME_TIPS[index];
}

/**
 * Returns all game tips belonging to a specific category.
 */
export function getGameTipsByCategory(category: GameTipCategory): GameTip[] {
  return GAME_TIPS.filter((t) => t.category === category);
}

/**
 * Returns a prioritized list of tips appropriate for a given stage id.
 */
export function getGameTipsForStage(stageId?: string): GameTip[] {
  if (!stageId) return GAME_TIPS;

  const stageLower = stageId.toLowerCase();
  if (stageLower.includes("aero")) {
    return [...getGameTipsByCategory("aerodynamics"), ...GAME_TIPS];
  }
  if (stageLower.includes("engine") || stageLower.includes("dyno")) {
    return [...getGameTipsByCategory("powertrain"), ...GAME_TIPS];
  }
  if (stageLower.includes("vehicle") || stageLower.includes("chassis") || stageLower.includes("suspension")) {
    return [...getGameTipsByCategory("chassis"), ...GAME_TIPS];
  }
  if (stageLower.includes("motorsport") || stageLower.includes("f1") || stageLower.includes("hypercar")) {
    return [...getGameTipsByCategory("motorsport"), ...GAME_TIPS];
  }
  if (stageLower.includes("operations") || stageLower.includes("factory") || stageLower.includes("manufacturing")) {
    return [...getGameTipsByCategory("manufacturing"), ...GAME_TIPS];
  }
  if (stageLower.includes("finance") || stageLower.includes("economy") || stageLower.includes("sales")) {
    return [...getGameTipsByCategory("economy"), ...GAME_TIPS];
  }
  if (stageLower.includes("rd") || stageLower.includes("ai")) {
    return [...getGameTipsByCategory("rd"), ...GAME_TIPS];
  }
  if (stageLower.includes("safety")) {
    return [...getGameTipsByCategory("safety"), ...GAME_TIPS];
  }

  // Default / Main Menu: diverse balanced tips starting with executive and controls
  return GAME_TIPS;
}

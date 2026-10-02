// ==============================================================================
// COMPANY REPUTATION ENGINE — MULTI-DIMENSIONAL REPUTATION & ECONOMIC ARCHITECTURE
// 17 Specialized Tracks, 10 Stakeholder Audiences, 6 Contract Tiers,
// Emergent Design Language, Salary & Construction Economic Discounts,
// 3-Level Acclaim Hierarchy, Memory, Momentum, and Differential Decay.
// ==============================================================================

export type ReputationDimensionKey =
  | "engineering"
  | "performance"
  | "reliability"
  | "safety"
  | "luxury"
  | "value"
  | "innovation"
  | "motorsport"
  | "manufacturingQuality"
  | "customerService"
  | "commercialTrust"
  | "heritage"
  | "design"
  | "contracts"
  | "employer"
  | "industrial"
  | "supplier";

export type DecaySpeed = "fast" | "medium" | "slow";

export interface DimensionMeta {
  key: ReputationDimensionKey;
  label: string;
  category: "capability" | "market" | "legacy" | "operations";
  decaySpeed: DecaySpeed;
  description: string;
  whatCreatesIt: string;
  iconName: string;
  accentColor: string; // Tailwind color token
  economicImpact: string;
}

export const REPUTATION_DIMENSIONS_META: Record<ReputationDimensionKey, DimensionMeta> = {
  engineering: {
    key: "engineering",
    label: "Engineering",
    category: "capability",
    decaySpeed: "slow",
    description: "Advanced powertrain, chassis geometry, electronics, and technical achievements.",
    whatCreatesIt: "Propulsion design, valvetrain patents, chassis torsional stiffness, and NVH precision.",
    iconName: "Cog",
    accentColor: "text-amber-400",
    economicImpact: "Unlocks high-value OEM tech partnerships & attracts specialized powertrain PhDs.",
  },
  performance: {
    key: "performance",
    label: "Performance",
    category: "capability",
    decaySpeed: "fast",
    description: "Horsepower, acceleration, dynamic lateral grip, top speed, and circuit lap times.",
    whatCreatesIt: "0-60 mph acceleration benchmarks, skidpad lateral G, power-to-weight, and track records.",
    iconName: "Zap",
    accentColor: "text-cyan-400",
    economicImpact: "Boosts sports car price tolerance & enthusiast buyer demand.",
  },
  reliability: {
    key: "reliability",
    label: "Reliability",
    category: "market",
    decaySpeed: "medium",
    description: "Component durability, mean time between failures, low warranty claims, and longevity.",
    whatCreatesIt: "Thermal headroom, robust casting alloys, stress tolerances, and rigorous proving miles.",
    iconName: "ShieldCheck",
    accentColor: "text-emerald-400",
    economicImpact: "Dramatically reduces warranty expense & secures commercial fleet tenders.",
  },
  safety: {
    key: "safety",
    label: "Safety",
    category: "capability",
    decaySpeed: "medium",
    description: "Crash impact absorption, crumple zones, rollover protection, and driver assistance.",
    whatCreatesIt: "Non-linear FEM structural crash testing, 5-star NCAP compliance, and braking distance.",
    iconName: "Shield",
    accentColor: "text-rose-400",
    economicImpact: "Mandatory qualification for government fleet tenders & family car sales dominance.",
  },
  luxury: {
    key: "luxury",
    label: "Luxury",
    category: "market",
    decaySpeed: "medium",
    description: "Tactile materials, acoustic isolation, cabin refinement, OLED HMI, and prestige.",
    whatCreatesIt: "Bespoke leather lofting, active sound dampening, soft-touch switchgear, and ambient lighting.",
    iconName: "Sparkles",
    accentColor: "text-purple-400",
    economicImpact: "Enables up to +35% luxury trim price premiums & VIP bespoke orders.",
  },
  value: {
    key: "value",
    label: "Value",
    category: "market",
    decaySpeed: "medium",
    description: "Capability and durability delivered per dollar, low maintenance cost, and practicality.",
    whatCreatesIt: "Competitive unit manufacturing cost, fuel efficiency, broad dealer access, and affordability.",
    iconName: "DollarSign",
    accentColor: "text-lime-400",
    economicImpact: "Drives high-volume mass market vehicle deliveries and dealer network velocity.",
  },
  innovation: {
    key: "innovation",
    label: "Innovation",
    category: "capability",
    decaySpeed: "fast",
    description: "First-to-market technological breakthroughs, patents, and pioneering architectures.",
    whatCreatesIt: "Deploying active aerodynamics, 800V hybrid architectures, carbon tubs, and novel electronics.",
    iconName: "Lightbulb",
    accentColor: "text-sky-400",
    economicImpact: "-25% R&D project research duration & higher patent licensing royalties.",
  },
  motorsport: {
    key: "motorsport",
    label: "Motorsport",
    category: "legacy",
    decaySpeed: "fast",
    description: "Grand Prix victories, endurance championships, customer racing programs, and trophies.",
    whatCreatesIt: "Formula 1 wins, Le Mans 24h endurance podiums, works racing teams, and technical dominance.",
    iconName: "Flag",
    accentColor: "text-red-400",
    economicImpact: "+$850,000 to $30M/season in works sponsorships & customer racing engines.",
  },
  manufacturingQuality: {
    key: "manufacturingQuality",
    label: "Manufacturing Quality",
    category: "capability",
    decaySpeed: "medium",
    description: "Tolerances, panel shutlines, zero factory defect rates, and robotic assembly precision.",
    whatCreatesIt: "High-precision stamping dies, automated robotic welding, ultrasonic inspection, and QC audits.",
    iconName: "Factory",
    accentColor: "text-teal-400",
    economicImpact: "Reduces scrap rates, warranty recalls, and lowers unit production cost.",
  },
  customerService: {
    key: "customerService",
    label: "Customer Service",
    category: "market",
    decaySpeed: "medium",
    description: "Dealer network coverage, rapid parts availability, transparent warranty, and servicing.",
    whatCreatesIt: "Regional warehouse logistics, OEM parts supply chains, warranty turnaround, and technician skill.",
    iconName: "HeartHandshake",
    accentColor: "text-indigo-400",
    economicImpact: "Higher repeat purchase retention & dealer floor allocation priority.",
  },
  commercialTrust: {
    key: "commercialTrust",
    label: "Commercial & Financial Trust",
    category: "operations",
    decaySpeed: "slow",
    description: "Credibility with banks, financial underwriters, suppliers, and regulatory bodies.",
    whatCreatesIt: "Honored contracts, punctual payments, mutual NDA compliance, and collaborative engineering.",
    iconName: "Briefcase",
    accentColor: "text-amber-300",
    economicImpact: "Cheaper capital loans, lower credit interest rates, and institutional investor backing.",
  },
  heritage: {
    key: "heritage",
    label: "Heritage",
    category: "legacy",
    decaySpeed: "slow",
    description: "Historical prestige, milestone classic models, generational acclaim, and automotive mythology.",
    whatCreatesIt: "Decades of consistent excellence, hall-of-fame historic vehicles, and cultural significance.",
    iconName: "Trophy",
    accentColor: "text-yellow-400",
    economicImpact: "High collector car auction values, limited-edition run demand, and brand resilience.",
  },
  design: {
    key: "design",
    label: "Design & Styling",
    category: "capability",
    decaySpeed: "medium",
    description: "Exterior silhouettes, proportions, cabin aesthetics, and signature design language.",
    whatCreatesIt: "Aerodynamic sculpted bodywork, golden-ratio proportions, bespoke interior lofting, and design awards.",
    iconName: "Palette",
    accentColor: "text-pink-400",
    economicImpact: "Attracts top creative styling talent & yields distinct brand recognition without discounts.",
  },
  contracts: {
    key: "contracts",
    label: "Contract & B2B Reliability",
    category: "operations",
    decaySpeed: "slow",
    description: "Delivering contracts on time, fulfilling quotas, honoring terms, and zero contract breaches.",
    whatCreatesIt: "Punctual delivery milestones, consistent quality quotas, and honoring supplier purchase orders.",
    iconName: "FileCheck",
    accentColor: "text-emerald-300",
    economicImpact: "Unlocks Tiers 1–6 enterprise contracts and eliminates supplier deposit demands.",
  },
  employer: {
    key: "employer",
    label: "Employer Reputation",
    category: "operations",
    decaySpeed: "medium",
    description: "Prestige among workers, workplace culture, employee success, and career development.",
    whatCreatesIt: "Major engineering achievements, motorsport fame, high stability, and R&D autonomy.",
    iconName: "GraduationCap",
    accentColor: "text-blue-400",
    economicImpact: "Up to -25% talent salary discount (engineers join for career prestige) & zero hiring friction.",
  },
  industrial: {
    key: "industrial",
    label: "Industrial & Construction",
    category: "operations",
    decaySpeed: "slow",
    description: "Credibility with civil contractors, facility builders, utility providers, and industrial lenders.",
    whatCreatesIt: "Punctual plant commissioning, robust capital discipline, and proven manufacturing expansion.",
    iconName: "Building2",
    accentColor: "text-amber-500",
    economicImpact: "-12% to -20% discount on HQ and factory construction costs via trusted contractor bids.",
  },
  supplier: {
    key: "supplier",
    label: "Supplier Trust",
    category: "operations",
    decaySpeed: "slow",
    description: "Relationship health with tier-1/tier-2 parts vendors, payment history, and credit rating.",
    whatCreatesIt: "Reliable order commitments, Net-30 payment compliance, and collaborative engineering.",
    iconName: "Truck",
    accentColor: "text-cyan-300",
    economicImpact: "-10% to -18% component price discounts, Net-90 payment terms, and 0-day shortage queue.",
  },
};

// ─────────────────────────────────────────────────────────────
// REPUTATION LEVELS & TIERS (0 - 100)
// ─────────────────────────────────────────────────────────────
export type ReputationLevelTier =
  | "UNKNOWN"       // 0–19
  | "EMERGING"      // 20–39
  | "ESTABLISHED"   // 40–59
  | "RESPECTED"     // 60–74
  | "STRONG"        // 75–84
  | "PRESTIGIOUS"   // 85–94
  | "LEGENDARY";    // 95–100

export interface ReputationLevelInfo {
  tier: ReputationLevelTier;
  label: string;
  min: number;
  max: number;
  badgeBg: string;
  textColor: string;
  borderColor: string;
}

export function getReputationLevel(score: number): ReputationLevelInfo {
  if (score >= 95) {
    return { tier: "LEGENDARY", label: "Legendary", min: 95, max: 100, badgeBg: "bg-amber-500/20", textColor: "text-amber-300", borderColor: "border-amber-400" };
  }
  if (score >= 85) {
    return { tier: "PRESTIGIOUS", label: "Prestigious", min: 85, max: 94, badgeBg: "bg-purple-500/20", textColor: "text-purple-300", borderColor: "border-purple-400" };
  }
  if (score >= 75) {
    return { tier: "STRONG", label: "Strong", min: 75, max: 84, badgeBg: "bg-emerald-500/20", textColor: "text-emerald-300", borderColor: "border-emerald-400" };
  }
  if (score >= 60) {
    return { tier: "RESPECTED", label: "Respected", min: 60, max: 74, badgeBg: "bg-cyan-500/20", textColor: "text-cyan-300", borderColor: "border-cyan-400" };
  }
  if (score >= 40) {
    return { tier: "ESTABLISHED", label: "Established", min: 40, max: 59, badgeBg: "bg-blue-500/20", textColor: "text-blue-300", borderColor: "border-blue-400" };
  }
  if (score >= 20) {
    return { tier: "EMERGING", label: "Emerging", min: 20, max: 39, badgeBg: "bg-slate-700/40", textColor: "text-slate-300", borderColor: "border-slate-500" };
  }
  return { tier: "UNKNOWN", label: "Unknown", min: 0, max: 19, badgeBg: "bg-slate-900/60", textColor: "text-slate-400", borderColor: "border-slate-700" };
}

// ─────────────────────────────────────────────────────────────
// 10 AUDIENCE / STAKEHOLDER TRUST SENTIMENTS
// ─────────────────────────────────────────────────────────────
export interface AudienceSentiment {
  id: string;
  name: string;
  score: number;
  level: ReputationLevelInfo;
  description: string;
  primaryDrivers: string[];
}

export function evaluateAudienceSentiments(scores: DimensionScores): AudienceSentiment[] {
  const get = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;

  const publicScore = Math.round((get("value") + get("reliability") + get("safety") + get("customerService") + get("performance")) / 5);
  const customersScore = Math.round(get("customerService") * 0.35 + get("reliability") * 0.35 + get("value") * 0.15 + get("luxury") * 0.15);
  const engineersScore = Math.round(get("engineering") * 0.40 + get("innovation") * 0.35 + get("motorsport") * 0.25);
  const motorsportScore = Math.round(get("motorsport") * 0.50 + get("performance") * 0.30 + get("heritage") * 0.20);
  const suppliersScore = Math.round(get("supplier") * 0.40 + get("commercialTrust") * 0.30 + get("contracts") * 0.30);
  const dealersScore = Math.round(get("customerService") * 0.35 + get("contracts") * 0.30 + get("value") * 0.20 + get("reliability") * 0.15);
  const luxuryScore = Math.round(get("luxury") * 0.45 + get("design") * 0.30 + get("heritage") * 0.15 + get("manufacturingQuality") * 0.10);
  const fleetScore = Math.round(get("reliability") * 0.40 + get("contracts") * 0.30 + get("value") * 0.20 + get("safety") * 0.10);
  const employeesScore = Math.round(get("employer") * 0.50 + get("engineering") * 0.25 + get("motorsport") * 0.15 + get("commercialTrust") * 0.10);
  const investorsScore = Math.round(get("commercialTrust") * 0.40 + get("industrial") * 0.25 + get("contracts") * 0.20 + get("value") * 0.15);

  return [
    {
      id: "aud_public",
      name: "General Public",
      score: publicScore,
      level: getReputationLevel(publicScore),
      description: "Broad everyday impression formed by street sightings, word-of-mouth, and general press.",
      primaryDrivers: ["Affordable Pricing", "Reliability", "Safety Standards"],
    },
    {
      id: "aud_customers",
      name: "Vehicle Owners & Buyers",
      score: customersScore,
      level: getReputationLevel(customersScore),
      description: "Actual vehicle owners rating after-sales care, warranty turnaround, and durability.",
      primaryDrivers: ["Zero Breakdowns", "Fast Warranty Turnaround", "Residual Value"],
    },
    {
      id: "aud_engineers",
      name: "Engineering Community",
      score: engineersScore,
      level: getReputationLevel(engineersScore),
      description: "Automotive PhDs, dyno calibrators, and CAD architects judging technical depth.",
      primaryDrivers: ["Patented Powertrains", "Torsional Rigidity", "Aerodynamic Purity"],
    },
    {
      id: "aud_motorsport",
      name: "Motorsport Community",
      score: motorsportScore,
      level: getReputationLevel(motorsportScore),
      description: "Championship teams, race drivers, scrutineers, and passionate grand prix fans.",
      primaryDrivers: ["Podiums & Trophies", "Engine Scream & Powerband", "Endurance Durability"],
    },
    {
      id: "aud_suppliers",
      name: "Component Suppliers",
      score: suppliersScore,
      level: getReputationLevel(suppliersScore),
      description: "Tier-1 component manufacturers determining volume discounts and priority delivery queues.",
      primaryDrivers: ["Punctual Payments", "Predictable Forecasts", "Long-term Orders"],
    },
    {
      id: "aud_dealers",
      name: "Dealership Network",
      score: dealersScore,
      level: getReputationLevel(dealersScore),
      description: "Independent dealer principals deciding whether to allocate showroom floor space.",
      primaryDrivers: ["Inventory Margins", "Parts Fulfillment", "Warranty Compensation"],
    },
    {
      id: "aud_luxury",
      name: "Luxury Market & VIPs",
      score: luxuryScore,
      level: getReputationLevel(luxuryScore),
      description: "High-net-worth collectors and luxury buyers seeking bespoke exclusivity.",
      primaryDrivers: ["Artisanal Leather", "Acoustic Silence", "Prestige Badge Value"],
    },
    {
      id: "aud_fleet",
      name: "Fleet & Commercial Operators",
      score: fleetScore,
      level: getReputationLevel(fleetScore),
      description: "Municipal logistics, police fleets, and taxi syndicates procuring in 1,000+ unit batches.",
      primaryDrivers: ["Cost-per-Mile", "Downtime Zero Tolerance", "Bulk Parts Supply"],
    },
    {
      id: "aud_employees",
      name: "Workforce & Talent Pool",
      score: employeesScore,
      level: getReputationLevel(employeesScore),
      description: "Factory floor machinists, assembly workers, and elite engineering graduates.",
      primaryDrivers: ["Company Prestige", "Engineering Freedom", "Career Growth"],
    },
    {
      id: "aud_investors",
      name: "Financial Institutions & Investors",
      score: investorsScore,
      level: getReputationLevel(investorsScore),
      description: "Commercial banks, sovereign funds, and bond underwriters rating creditworthiness.",
      primaryDrivers: ["Operating Cashflow", "Contract Discipline", "Capital Return"],
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// 6 CONTRACT TIERS (Local to Prestige)
// ─────────────────────────────────────────────────────────────
export interface ContractTierDefinition {
  tierNumber: number; // 1 to 6
  name: string;
  badgeLabel: string;
  isUnlocked: boolean;
  requiredScores: Partial<Record<ReputationDimensionKey | "overall", number>>;
  unlockedOpportunities: string[];
  description: string;
}

export function evaluateContractTiers(scores: DimensionScores, overall: number): ContractTierDefinition[] {
  const get = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;

  return [
    {
      tierNumber: 1,
      name: "Local Municipal & Privateer",
      badgeLabel: "Tier 1: Local",
      isUnlocked: overall >= 15 && get("contracts") >= 15,
      requiredScores: { overall: 15, contracts: 15 },
      unlockedOpportunities: [
        "Local council utility vehicles (50–150 units)",
        "Clubman privateer racing engine rebuilds",
        "Small-batch parts fabrication",
      ],
      description: "Entry-level contracts with minimal compliance risk. Suitable for a fledgling manufacturer.",
    },
    {
      tierNumber: 2,
      name: "Regional Commercial & Dealer Fleets",
      badgeLabel: "Tier 2: Regional",
      isUnlocked: overall >= 35 && get("reliability") >= 40 && get("contracts") >= 35,
      requiredScores: { overall: 35, reliability: 40, contracts: 35 },
      unlockedOpportunities: [
        "Regional taxi and logistics fleet supply (500–1,200 units/yr)",
        "Sub-assembly contracts for larger regional constructors",
        "Semi-works regional touring car racing support",
      ],
      description: "Medium-volume supply contracts requiring consistent manufacturing uptime.",
    },
    {
      tierNumber: 3,
      name: "Major Industrial Tier-1 Component Supply",
      badgeLabel: "Tier 3: Major Industrial",
      isUnlocked: get("engineering") >= 55 && get("manufacturingQuality") >= 50 && get("contracts") >= 50,
      requiredScores: { engineering: 55, manufacturingQuality: 50, contracts: 50 },
      unlockedOpportunities: [
        "OEM transmission & cylinder head foundry contracts",
        "National automotive parts distribution networks",
        "Multi-million dollar annual supplier framework agreements",
      ],
      description: "High-value component supplier contracts for mass-volume third-party automakers.",
    },
    {
      tierNumber: 4,
      name: "National Corporate & Government Co-Development",
      badgeLabel: "Tier 4: National Enterprise",
      isUnlocked: overall >= 65 && get("commercialTrust") >= 65 && get("contracts") >= 65,
      requiredScores: { overall: 65, commercialTrust: 65, contracts: 65 },
      unlockedOpportunities: [
        "National highway emergency service fleets",
        "Government-backed advanced composite research grants",
        "Joint platform architecture ventures with rival OEMs",
      ],
      description: "Prestige state and multinational enterprise tenders with substantial multi-year cashflows.",
    },
    {
      tierNumber: 5,
      name: "Strategic Powertrain & Platform Outbound Supply",
      badgeLabel: "Tier 5: Strategic OEM",
      isUnlocked: get("engineering") >= 75 && get("manufacturingQuality") >= 70 && get("contracts") >= 70,
      requiredScores: { engineering: 75, manufacturingQuality: 70, contracts: 70 },
      unlockedOpportunities: [
        "Turnkey crate engine supply to boutique supercar makers ($12M–$45M/yr)",
        "Monocoque chassis licensing agreements",
        "Exclusive powertrain supply to international constructors",
      ],
      description: "Supplying complete propulsion systems and chassis tubs as an elite OEM technical supplier.",
    },
    {
      tierNumber: 6,
      name: "Prestige Works Championship & VIP Bespoke",
      badgeLabel: "Tier 6: Prestige",
      isUnlocked:
        (get("motorsport") >= 85 && get("engineering") >= 80 && get("contracts") >= 75) ||
        (get("luxury") >= 85 && get("design") >= 80 && get("manufacturingQuality") >= 75) ||
        (get("reliability") >= 85 && get("safety") >= 80 && get("contracts") >= 75),
      requiredScores: { motorsport: 85, engineering: 80, contracts: 75 },
      unlockedOpportunities: [
        "Global Grand Prix Factory Engine Partnership ($30M+/season)",
        "Royal Family & Sovereign VIP Coachbuilding Commissions",
        "Continental Heavy Logistics Sole-Source Supply Contracts",
      ],
      description: "The pinnacle of automotive prestige: world-championship works programs and bespoke ultra-luxury partnerships.",
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// EMERGENT DESIGN LANGUAGE
// ─────────────────────────────────────────────────────────────
export interface EmergentDesignLanguage {
  title: string;
  aestheticSignature: string;
  definingTraits: string[];
  stylingBonusDescription: string;
}

export function deriveEmergentDesignLanguage(scores: DimensionScores): EmergentDesignLanguage {
  const get = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;

  const designScore = get("design");
  const perfScore = get("performance");
  const luxScore = get("luxury");
  const valScore = get("value");
  const heritageScore = get("heritage");

  if (perfScore >= 75 && designScore >= 65) {
    return {
      title: "Circuit-Bred Aggressive",
      aestheticSignature: "Vented heat extractors, sharp strakes, wide track stance, and exposed carbon fiber.",
      definingTraits: ["Flared Wheel Arches", "Splitter Winglets", "Quad Hollow Exhausts", "Aggressive DRL Brow"],
      stylingBonusDescription: "+15% Appeal among Performance Enthusiasts & Track Drivers.",
    };
  }
  if (luxScore >= 70 && designScore >= 65) {
    return {
      title: "Bespoke Sculpted Elegance",
      aestheticSignature: "Sweeping G2 continuous character lines, floating greenhouse, and brushed titanium trim.",
      definingTraits: ["Monolithic Radiator Grille", "Concealed Door Handles", "Full-Width OLED Lightbar", "Chrome Beltline"],
      stylingBonusDescription: "+20% Luxury Buyer Willingness to Pay Brand Markup.",
    };
  }
  if (valScore >= 70 && get("reliability") >= 65) {
    return {
      title: "Clean Functional Utilitarian",
      aestheticSignature: "High ground clearance, unpainted rugged protective cladding, and maximized cabin volume.",
      definingTraits: ["High Roof Arch", "Modular Bumper Sections", "Easy-Replace Lens Housings", "Ergonomic Door Pulls"],
      stylingBonusDescription: "-10% Replacement Bodywork Costs & +15% Commercial Fleet Demand.",
    };
  }
  if (get("innovation") >= 70 && designScore >= 60) {
    return {
      title: "Futuristic Cyber-Minimalist",
      aestheticSignature: "Seamless flush glazing, monolithic unibody form, active pop-out aero flaps, and matrix LEDs.",
      definingTraits: ["Zero-Shutline Front Mask", "Camera Wing Mirrors", "Diffuser Expansion Tunnels", "Illuminated Badging"],
      stylingBonusDescription: "+25% Technological Press Acclaim & Design Awards.",
    };
  }
  if (heritageScore >= 60 && designScore >= 50) {
    return {
      title: "Retro-Modern Grand Touring",
      aestheticSignature: "Long clamshell hood, fastback rear deck, classic circular headlamp optics with modern LED cores.",
      definingTraits: ["Twin Hood Power Bulges", "Spoke Heritage Rims", "Chrome Fuel Filler Cap", "Tapered Boat-Tail"],
      stylingBonusDescription: "+30% Collector & Auction Market Residual Value Retention.",
    };
  }
  return {
    title: "Classic Contemporary Form",
    aestheticSignature: "Balanced proportional silhouette with clean quad surfacing and athletic road stance.",
    definingTraits: ["Slender A-Pillars", "Integrated Trunk Lip", "Dual Reflector Lamps", "Body-Colored Bumpers"],
    stylingBonusDescription: "Broad multi-segment market appeal without polarized customer reactions.",
  };
}

// ─────────────────────────────────────────────────────────────
// ECONOMIC CALCULATORS (Hiring, Construction, Supplier)
// ─────────────────────────────────────────────────────────────
export interface HiringCostModel {
  role: string;
  tier: string;
  baseSalary: number;
  talentPremiumPercent: number;
  reputationDiscountPercent: number; // e.g. -16%
  marketSalaryWithoutReputation: number;
  actualSalaryWithReputation: number;
  annualSavingsPerHire: number;
  talentPoolQuality: string;
}

export function calculateHiringEconomics(
  scores: DimensionScores,
  role: string = "Powertrain Development Engineer",
  tier: "Junior" | "Senior" | "Lead" | "Principal" | "Chief Specialist" = "Lead"
): HiringCostModel {
  const get = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;
  const employerScore = get("employer");
  const engScore = get("engineering");
  const overall = calculateOverallReputation(scores);

  let baseSalary = 80000;
  let talentPremium = 0.15;
  if (tier === "Junior") { baseSalary = 55000; talentPremium = 0.05; }
  else if (tier === "Senior") { baseSalary = 95000; talentPremium = 0.20; }
  else if (tier === "Lead") { baseSalary = 130000; talentPremium = 0.30; }
  else if (tier === "Principal") { baseSalary = 180000; talentPremium = 0.40; }
  else if (tier === "Chief Specialist") { baseSalary = 240000; talentPremium = 0.55; }

  // Unknown startup (<30 employer reputation) pays a +10% obscurity risk premium
  // Prestigious company (>=85 employer reputation) gets up to a 24% discount!
  let discountPercent = 0;
  if (employerScore < 25) {
    discountPercent = -0.10; // Extra premium required to attract talent
  } else {
    discountPercent = ((employerScore - 25) / 75) * 0.24 + (engScore > 75 ? 0.04 : 0);
  }
  discountPercent = Math.min(0.28, Number(discountPercent.toFixed(3)));

  const marketSalary = Math.round(baseSalary * (1 + talentPremium));
  const actualSalary = Math.round(marketSalary * (1 - discountPercent));
  const annualSavings = marketSalary - actualSalary;

  let talentQuality = "Local Graduates & Trainees";
  if (overall >= 85 || employerScore >= 80) talentQuality = "F1 Champions, Aerospace PhDs & Le Mans Winners";
  else if (overall >= 65 || employerScore >= 60) talentQuality = "Experienced Tier-1 OEM Senior Engineers";
  else if (overall >= 40) talentQuality = "Competent Regional Technicians & Junior Designers";

  return {
    role,
    tier,
    baseSalary,
    talentPremiumPercent: Math.round(talentPremium * 100),
    reputationDiscountPercent: Math.round(discountPercent * 100),
    marketSalaryWithoutReputation: marketSalary,
    actualSalaryWithReputation: actualSalary,
    annualSavingsPerHire: annualSavings,
    talentPoolQuality: talentQuality,
  };
}

export interface ConstructionCostModel {
  baseQuote: number;
  industrialScore: number;
  discountPercent: number;
  costSavings: number;
  finalCost: number;
  contractorBidsCount: number;
  speedMultiplier: number;
}

export function calculateConstructionEconomics(
  scores: DimensionScores,
  baseQuote: number = 100000000 // $100M baseline
): ConstructionCostModel {
  const get = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;
  const industrialScore = get("industrial");
  const contractsScore = get("contracts");
  const overall = calculateOverallReputation(scores);

  // Trust discount: up to 18% savings when industrial & contracts are high
  const composite = industrialScore * 0.55 + contractsScore * 0.30 + overall * 0.15;
  const discountPercent = composite >= 25 ? ((composite - 25) / 75) * 0.18 : 0;
  const clampedDiscount = Math.min(0.20, Number(discountPercent.toFixed(3)));

  const costSavings = Math.round(baseQuote * clampedDiscount);
  const finalCost = baseQuote - costSavings;

  const contractorBidsCount = Math.max(1, Math.min(8, Math.round(composite / 12)));
  const speedMultiplier = Number((1.0 + clampedDiscount * 1.25).toFixed(2));

  return {
    baseQuote,
    industrialScore,
    discountPercent: Math.round(clampedDiscount * 100),
    costSavings,
    finalCost,
    contractorBidsCount,
    speedMultiplier,
  };
}

export interface SupplierCostModel {
  supplierScore: number;
  componentDiscountPercent: number;
  creditTerms: string;
  shortagePriority: string;
}

export function calculateSupplierEconomics(scores: DimensionScores): SupplierCostModel {
  const get = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;
  const supScore = get("supplier");
  const contractsScore = get("contracts");

  const composite = supScore * 0.65 + contractsScore * 0.35;
  const discount = composite >= 30 ? ((composite - 30) / 70) * 0.16 : 0;
  const discountPercent = Math.min(0.18, Number(discount.toFixed(3)));

  let creditTerms = "100% Upfront Wire Deposit";
  if (composite >= 80) creditTerms = "Net 90 Days (Deferred Billing)";
  else if (composite >= 60) creditTerms = "Net 60 Days";
  else if (composite >= 40) creditTerms = "Net 30 Days";

  let shortagePriority = "Standard Allocation Queue";
  if (composite >= 75) shortagePriority = "Tier-1 Priority Allocation (0-day backlog queue)";
  else if (composite < 30) shortagePriority = "Deprioritized / Subject to Surcharges";

  return {
    supplierScore: supScore,
    componentDiscountPercent: Math.round(discountPercent * 100),
    creditTerms,
    shortagePriority,
  };
}

// ─────────────────────────────────────────────────────────────
// OVERALL COMPANY REPUTATION (Master Aggregate)
// ─────────────────────────────────────────────────────────────
export function calculateOverallReputation(scores: DimensionScores): number {
  const get = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;
  const raw =
    get("engineering") * 0.12 +
    get("performance") * 0.08 +
    get("reliability") * 0.12 +
    get("manufacturingQuality") * 0.08 +
    get("design") * 0.08 +
    get("safety") * 0.08 +
    get("luxury") * 0.06 +
    get("contracts") * 0.08 +
    get("commercialTrust") * 0.08 +
    get("employer") * 0.06 +
    get("industrial") * 0.04 +
    get("supplier") * 0.04 +
    get("customerService") * 0.06 +
    get("motorsport") * 0.06 +
    get("innovation") * 0.06 +
    get("heritage") * 0.04;
  return Math.min(100, Math.max(5, Math.round(raw)));
}

// ─────────────────────────────────────────────────────────────
// Level 1: Component Acclaim
// ─────────────────────────────────────────────────────────────
export type ComponentAcclaimTier = "Standard" | "Recognized" | "Iconic" | "Legendary";

export interface ComponentReputationRecord {
  id: string;
  name: string;
  subsystem: string;
  score: number; // 0-100
  tier: ComponentAcclaimTier;
  unlockedYear: number;
  acclaimDescription: string;
  primaryDimension: ReputationDimensionKey;
}

// ─────────────────────────────────────────────────────────────
// Level 2: Vehicle Legacy Record
// ─────────────────────────────────────────────────────────────
export type VehicleLegacyTier = "Current Production" | "Modern Classic" | "Historic Icon" | "Cult Legend";

export interface VehicleLegacyRecord {
  id: string;
  modelName: string;
  launchYear: number;
  productionUnits: number;
  overallScore: number;
  tier: VehicleLegacyTier;
  scores: {
    performance: number;
    reliability: number;
    safety: number;
    luxury: number;
    value: number;
  };
  summary: string;
}

// ─────────────────────────────────────────────────────────────
// Stakeholder Sentiments (Legacy Segment Structure)
// ─────────────────────────────────────────────────────────────
export interface StakeholderGroup {
  id: string;
  label: string;
  score: number; // 0-100
  description: string;
  drivers: string[];
}

export interface StakeholderCategoryMap {
  customers: {
    economy: StakeholderGroup;
    family: StakeholderGroup;
    luxury: StakeholderGroup;
    performance: StakeholderGroup;
    fleet: StakeholderGroup;
  };
  industry: {
    suppliers: StakeholderGroup;
    dealers: StakeholderGroup;
    competitors: StakeholderGroup;
    engineers: StakeholderGroup;
    investors: StakeholderGroup;
  };
  motorsport: {
    racingTeams: StakeholderGroup;
    sponsors: StakeholderGroup;
    governingBodies: StakeholderGroup;
    racingFans: StakeholderGroup;
  };
  public: {
    generalPublic: StakeholderGroup;
    enthusiasts: StakeholderGroup;
    pressMedia: StakeholderGroup;
  };
}

// ─────────────────────────────────────────────────────────────
// Brand Identity & Archetypes
// ─────────────────────────────────────────────────────────────
export interface BrandIdentity {
  overallReputation: number;
  overallLevel: ReputationLevelInfo;
  designLanguage: EmergentDesignLanguage;
  primaryArchetype: string;
  secondaryArchetype: string;
  taglines: string[];
  publicPerceptionSummary: string;
  brandPrestigeIndex: number; // 0-100
  priceToleranceMultiplier: number; // e.g. 1.15 (+15% premium allowed)
}

// ─────────────────────────────────────────────────────────────
// Market Opportunities & Perks Unlocked
// ─────────────────────────────────────────────────────────────
export interface MarketOpportunity {
  id: string;
  title: string;
  category: "pricing" | "suppliers" | "motorsport" | "talent" | "fleet";
  requiredDimension: ReputationDimensionKey;
  thresholdScore: number;
  isUnlocked: boolean;
  perkEffect: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────
// Shocks & Press Headlines
// ─────────────────────────────────────────────────────────────
export interface ReputationEventItem {
  id: string;
  timestamp: string;
  title: string;
  category: ReputationDimensionKey;
  impactType: "positive" | "negative" | "milestone";
  deltas: Partial<Record<ReputationDimensionKey, number>>;
  pressHeadline: string;
  mediaOutlet: string;
}

// ─────────────────────────────────────────────────────────────
// Dimension Score Data with Momentum & Decay
// ─────────────────────────────────────────────────────────────
export interface DimensionScoreData {
  score: number; // 0 - 100
  trendQuarterly: number; // e.g. +1.4
  historicalPeak: number;
}

export type DimensionScores = Record<ReputationDimensionKey, DimensionScoreData>;

// ─────────────────────────────────────────────────────────────
// INITIAL REPUTATION SEED STATE (Year 1970 - Founding Era)
// ─────────────────────────────────────────────────────────────
export const INITIAL_DIMENSION_SCORES: DimensionScores = {
  engineering:          { score: 35, trendQuarterly: 0.5, historicalPeak: 35 },
  performance:          { score: 38, trendQuarterly: 0.8, historicalPeak: 38 },
  reliability:          { score: 32, trendQuarterly: 0.2, historicalPeak: 32 },
  safety:               { score: 28, trendQuarterly: 0.1, historicalPeak: 28 },
  luxury:               { score: 20, trendQuarterly: 0.0, historicalPeak: 20 },
  value:                { score: 45, trendQuarterly: 0.4, historicalPeak: 45 },
  innovation:           { score: 30, trendQuarterly: 0.6, historicalPeak: 30 },
  motorsport:           { score: 15, trendQuarterly: 0.2, historicalPeak: 15 },
  manufacturingQuality: { score: 34, trendQuarterly: 0.3, historicalPeak: 34 },
  customerService:      { score: 25, trendQuarterly: 0.2, historicalPeak: 25 },
  commercialTrust:      { score: 30, trendQuarterly: 0.3, historicalPeak: 30 },
  heritage:             { score: 10, trendQuarterly: 0.1, historicalPeak: 10 },
  design:               { score: 30, trendQuarterly: 0.5, historicalPeak: 30 },
  contracts:            { score: 28, trendQuarterly: 0.4, historicalPeak: 28 },
  employer:             { score: 25, trendQuarterly: 0.3, historicalPeak: 25 },
  industrial:           { score: 22, trendQuarterly: 0.2, historicalPeak: 22 },
  supplier:             { score: 30, trendQuarterly: 0.4, historicalPeak: 30 },
};

export const INITIAL_COMPONENT_ACCLAIMS: ComponentReputationRecord[] = [
  {
    id: "comp_cast_v8",
    name: "3.2L Crossplane Cast-Iron V8",
    subsystem: "Engine / Block & Valvetrain",
    score: 42,
    tier: "Recognized",
    unlockedYear: 1970,
    acclaimDescription: "Foundational combustion powerplant engineered with robust iron cylinder banks and high mechanical durability.",
    primaryDimension: "engineering",
  },
  {
    id: "comp_tubular_chassis",
    name: "Multi-Tubular Steel Spaceframe",
    subsystem: "Vehicle / Chassis Hardpoints",
    score: 38,
    tier: "Standard",
    unlockedYear: 1970,
    acclaimDescription: "Lightweight tubular steel armature providing rigid suspension mounting and predictable weight distribution.",
    primaryDimension: "performance",
  },
];

export const INITIAL_VEHICLE_LEGACIES: VehicleLegacyRecord[] = [
  {
    id: "veh_project_genesis",
    modelName: "Project Genesis GT",
    launchYear: 1970,
    productionUnits: 120,
    overallScore: 48,
    tier: "Current Production",
    scores: {
      performance: 52,
      reliability: 46,
      safety: 40,
      luxury: 34,
      value: 62,
    },
    summary: "The company's pioneer grand tourer, establishing the Apex nameplate in sports car circles.",
  },
];

export const MARKET_OPPORTUNITIES_CATALOG: MarketOpportunity[] = [
  {
    id: "opp_price_premium_tier1",
    title: "Enthusiast Brand Pricing Power I",
    category: "pricing",
    requiredDimension: "performance",
    thresholdScore: 60,
    isUnlocked: false,
    perkEffect: "+8% Vehicle Price Tolerance without order volume penalty",
    description: "Performance enthusiasts are willing to pay a notable markup for your proven chassis calibration and track dynamics.",
  },
  {
    id: "opp_price_premium_tier2",
    title: "Luxury Prestige Pricing Power II",
    category: "pricing",
    requiredDimension: "luxury",
    thresholdScore: 75,
    isUnlocked: false,
    perkEffect: "+18% Vehicle Price Tolerance on luxury trims",
    description: "High-net-worth buyers perceive your craftsmanship as elite status symbols, opening wide gross profit margins.",
  },
  {
    id: "opp_supplier_priority",
    title: "Tier 1 Supplier Priority Allocation",
    category: "suppliers",
    requiredDimension: "commercialTrust",
    thresholdScore: 65,
    isUnlocked: false,
    perkEffect: "-12% B2B Component Purchase Costs & 0-day supply backlog queue",
    description: "Global tier-1 component suppliers grant you premier commercial partner status and exclusive wholesale pricing.",
  },
  {
    id: "opp_works_sponsorship",
    title: "Global Motorsport Works Sponsorship",
    category: "motorsport",
    requiredDimension: "motorsport",
    thresholdScore: 70,
    isUnlocked: false,
    perkEffect: "+$850,000 / Season Title Sponsor Funding & Free Wind Tunnel Sessions",
    description: "International corporate sponsors clamor to place liveries on your racing machinery following track championships.",
  },
  {
    id: "opp_talent_magnet",
    title: "Elite Aerospace & F1 Engineer Magnet",
    category: "talent",
    requiredDimension: "innovation",
    thresholdScore: 75,
    isUnlocked: false,
    perkEffect: "-25% R&D Project Research Time & +20% Breakthrough Probability",
    description: "Top-tier motorsport aerodynamicists and powertrain PhDs actively seek employment at your advanced laboratory.",
  },
  {
    id: "opp_government_fleet",
    title: "Municipal & Corporate Fleet Tender Eligibility",
    category: "fleet",
    requiredDimension: "reliability",
    thresholdScore: 70,
    isUnlocked: false,
    perkEffect: "Unlocks bulk B2B commercial purchase tenders (500–5,000 units/yr)",
    description: "Governments and corporate logistics operators invite your company to bid on mission-critical transportation fleets.",
  },
];

// ─────────────────────────────────────────────────────────────
// STAKEHOLDER SENTIMENT EVALUATOR
// Calculates 17 distinct stakeholder perceptions based on dimensions
// ─────────────────────────────────────────────────────────────
export function evaluateStakeholderSentiments(scores: DimensionScores): StakeholderCategoryMap {
  const get = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;

  // 1. Customers
  const economyScore = Math.round(get("value") * 0.50 + get("reliability") * 0.30 + get("customerService") * 0.20);
  const familyScore = Math.round(get("safety") * 0.40 + get("reliability") * 0.35 + get("value") * 0.15 + get("customerService") * 0.10);
  const luxuryScore = Math.round(get("luxury") * 0.50 + get("engineering") * 0.25 + get("manufacturingQuality") * 0.15 + get("heritage") * 0.10);
  const perfScore = Math.round(get("performance") * 0.45 + get("motorsport") * 0.30 + get("engineering") * 0.15 + get("innovation") * 0.10);
  const fleetScore = Math.round(get("reliability") * 0.35 + get("commercialTrust") * 0.25 + get("value") * 0.25 + get("manufacturingQuality") * 0.15);

  // 2. Industry
  const suppliersScore = Math.round(get("commercialTrust") * 0.40 + get("manufacturingQuality") * 0.30 + get("engineering") * 0.30);
  const dealersScore = Math.round(get("customerService") * 0.35 + get("value") * 0.25 + get("reliability") * 0.25 + get("commercialTrust") * 0.15);
  const competitorsScore = Math.round(get("engineering") * 0.35 + get("innovation") * 0.35 + get("performance") * 0.30);
  const engineersScore = Math.round(get("innovation") * 0.40 + get("engineering") * 0.35 + get("motorsport") * 0.25);
  const investorsScore = Math.round(get("commercialTrust") * 0.40 + get("value") * 0.30 + get("manufacturingQuality") * 0.30);

  // 3. Motorsport
  const teamsScore = Math.round(get("motorsport") * 0.50 + get("engineering") * 0.30 + get("performance") * 0.20);
  const sponsorsScore = Math.round(get("motorsport") * 0.40 + get("performance") * 0.30 + get("heritage") * 0.30);
  const governingBodiesScore = Math.round(get("safety") * 0.40 + get("commercialTrust") * 0.35 + get("engineering") * 0.25);
  const racingFansScore = Math.round(get("motorsport") * 0.50 + get("performance") * 0.35 + get("heritage") * 0.15);

  // 4. Public
  const generalPublicScore = Math.round(
    (get("value") + get("reliability") + get("safety") + get("customerService") + get("performance")) / 5
  );
  const enthusiastsScore = Math.round(get("performance") * 0.35 + get("motorsport") * 0.30 + get("engineering") * 0.20 + get("heritage") * 0.15);
  const pressMediaScore = Math.round(get("innovation") * 0.35 + get("performance") * 0.25 + get("engineering") * 0.20 + get("safety") * 0.20);

  return {
    customers: {
      economy: {
        id: "cust_economy",
        label: "Economy Buyers",
        score: Math.min(100, Math.max(5, economyScore)),
        description: "Price-sensitive buyers seeking affordable purchase cost, high mileage, and zero unexpected maintenance bills.",
        drivers: ["Low Unit Cost", "Fuel Mileage", "Warranty Terms"],
      },
      family: {
        id: "cust_family",
        label: "Family Vehicle Buyers",
        score: Math.min(100, Math.max(5, familyScore)),
        description: "Safety-first consumers prioritizing child protection, collision crumple zones, and long-term reliability.",
        drivers: ["5-Star NCAP Rating", "Braking Distance", "Cabin Space"],
      },
      luxury: {
        id: "cust_luxury",
        label: "Luxury Specialists & VIPs",
        score: Math.min(100, Math.max(5, luxuryScore)),
        description: "High-net-worth connoisseurs demanding handcrafted leather, whisper-quiet cabin NVH, and status.",
        drivers: ["Acoustic Isolation", "Artisanal Materials", "Prestige Styling"],
      },
      performance: {
        id: "cust_performance",
        label: "Performance Enthusiasts",
        score: Math.min(100, Math.max(5, perfScore)),
        description: "Drivers passionate about 0-60 acceleration, telepathic steering feedback, and track day dominance.",
        drivers: ["Power-to-Weight", "Sub-4.0s 0-60 mph", "Circuit Lap Times"],
      },
      fleet: {
        id: "cust_fleet",
        label: "Commercial & Fleet Operators",
        score: Math.min(100, Math.max(5, fleetScore)),
        description: "Logistics companies and taxi syndicates demanding continuous operational uptime and low cost-per-mile.",
        drivers: ["Fleet Bulk Discount", "Service Downtime", "Durability Guarantee"],
      },
    },
    industry: {
      suppliers: {
        id: "ind_suppliers",
        label: "Tier 1 Parts Suppliers",
        score: Math.min(100, Math.max(5, suppliersScore)),
        description: "Global powertrain and brake manufacturers granting priority component allocation and volume discounts.",
        drivers: ["Punctual Invoicing", "Long-Term Forecasts", "Shared IP Trust"],
      },
      dealers: {
        id: "ind_dealers",
        label: "Independent Dealerships",
        score: Math.min(100, Math.max(5, dealersScore)),
        description: "Franchise dealership networks deciding whether to allocate prime showroom floor real estate to your cars.",
        drivers: ["Inventory Turnover", "Parts Delivery Speed", "Warranty Labor Pay"],
      },
      competitors: {
        id: "ind_competitors",
        label: "Rival Automakers",
        score: Math.min(100, Math.max(5, competitorsScore)),
        description: "Competing automotive manufacturers monitoring your patents, race entries, and market share growth.",
        drivers: ["Patent Defensibility", "Market Share Pressure", "Benchmark Laps"],
      },
      engineers: {
        id: "ind_engineers",
        label: "Engineering Talent Pool",
        score: Math.min(100, Math.max(5, engineersScore)),
        description: "Aerospace engineers, dyno tuners, and software architects deciding whether to join your technical staff.",
        drivers: ["R&D Budget Autonomy", "Cutting-Edge CAD Tools", "Motorsport Programs"],
      },
      investors: {
        id: "ind_investors",
        label: "Investors & Financial Institutions",
        score: Math.min(100, Math.max(5, investorsScore)),
        description: "Commercial lenders and equity syndicates assessing financial stability and enterprise credit rating.",
        drivers: ["Operating Margins", "Commercial Reliability", "Capital Discipline"],
      },
    },
    motorsport: {
      racingTeams: {
        id: "moto_teams",
        label: "Racing Teams & Constructors",
        score: Math.min(100, Math.max(5, teamsScore)),
        description: "Privateer and factory racing operations looking for customer racing chassis, engines, and aero packages.",
        drivers: ["Engine Power Curves", "Chassis Adjustability", "Telemetry Support"],
      },
      sponsors: {
        id: "moto_sponsors",
        label: "Corporate Racing Sponsors",
        score: Math.min(100, Math.max(5, sponsorsScore)),
        description: "Global brands seeking high-visibility television broadcast exposure on winning vehicle body panels.",
        drivers: ["Podium Frequency", "Broadcast Airtime", "Brand Association"],
      },
      governingBodies: {
        id: "moto_governing",
        label: "Governing Bodies (FIA / ACO)",
        score: Math.min(100, Math.max(5, governingBodiesScore)),
        description: "Motorsport federations enforcing technical regulations, crash safety cells, and Balance of Performance (BoP).",
        drivers: ["Crash Structure Compliance", "Regulatory Transparency", "Clean Competition"],
      },
      racingFans: {
        id: "moto_fans",
        label: "Grand Prix & Motorsport Fans",
        score: Math.min(100, Math.max(5, racingFansScore)),
        description: "Millions of global motorsport enthusiasts cheering for thrilling on-track battles and heroic underdog victories.",
        drivers: ["Overtaking Aggression", "Distinctive Engine Screams", "Championship Trophies"],
      },
    },
    public: {
      generalPublic: {
        id: "pub_general",
        label: "General Consumer Public",
        score: Math.min(100, Math.max(5, generalPublicScore)),
        description: "Everyday drivers forming broad brand impressions through road sightings, advertisements, and word-of-mouth.",
        drivers: ["Roadside Presence", "Reliability Reputation", "Fair Pricing"],
      },
      enthusiasts: {
        id: "pub_enthusiasts",
        label: "Car Enthusiasts & Clubs",
        score: Math.min(100, Math.max(5, enthusiastsScore)),
        description: "Car collectors, weekend canyon carvers, track day drivers, and passionate online automotive communities.",
        drivers: ["Authentic Driving Feel", "Motorsport Pedigree", "Tunability"],
      },
      pressMedia: {
        id: "pub_press",
        label: "Automotive Press & Journalists",
        score: Math.min(100, Math.max(5, pressMediaScore)),
        description: "Prominent automotive magazines, road-testers, and video journalists publishing reviews and comparison shootouts.",
        drivers: ["Technological Novelty", "Handling Balance", "Design Originality"],
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────
// BRAND IDENTITY & ARCHETYPE DERIVATION
// Computes emergent corporate archetype from dimension vector
// ─────────────────────────────────────────────────────────────
export function deriveBrandIdentity(
  scores: DimensionScores,
  totalVehiclesLaunched: number,
  companyAgeYears: number
): BrandIdentity {
  const s = (k: ReputationDimensionKey) => scores[k]?.score ?? 30;

  const overallReputation = calculateOverallReputation(scores);
  const overallLevel = getReputationLevel(overallReputation);
  const designLanguage = deriveEmergentDesignLanguage(scores);

  // Composite Prestige Index (0-100)
  const brandPrestigeIndex = Math.min(
    100,
    Math.round(
      s("heritage") * 0.25 +
      s("engineering") * 0.20 +
      s("performance") * 0.15 +
      s("luxury") * 0.15 +
      s("motorsport") * 0.15 +
      s("commercialTrust") * 0.10
    )
  );

  // Price tolerance multiplier (1.00 base up to 1.35 luxury/prestige ceiling)
  const priceToleranceMultiplier = Number(
    (1.0 + (brandPrestigeIndex / 100) * 0.28 + (s("performance") > 75 ? 0.07 : 0)).toFixed(2)
  );

  // Detect Primary Archetype
  let primary = "Developing Manufacturer";
  let secondary = "General Automotive Producer";
  const taglines: string[] = [];

  const perfCluster = s("performance") + s("motorsport") + s("engineering");
  const luxCluster = s("luxury") + s("innovation") + s("manufacturingQuality");
  const massCluster = s("reliability") + s("value") + s("manufacturingQuality");
  const safetyCluster = s("safety") + s("reliability") + s("customerService");
  const techCluster = s("engineering") + s("commercialTrust") + s("manufacturingQuality");

  if (perfCluster >= 210 && s("motorsport") >= 65) {
    primary = "Motorsport & Performance Specialist";
    taglines.push("Bred on the Circuit", "Uncompromising Mechanical Purity");
  } else if (luxCluster >= 200 && s("luxury") >= 65) {
    primary = "Bespoke Luxury Innovator";
    taglines.push("Acoustic Sanctuary", "Artisanal Craftsmanship Meets Modern Tech");
  } else if (massCluster >= 200 && s("value") >= 60) {
    primary = "Mass-Market Dependability Leader";
    taglines.push("Engineered for Life", "Unmatched Value & Reliability");
  } else if (safetyCluster >= 190 && s("safety") >= 65) {
    primary = "Pioneering Safety Specialist";
    taglines.push("Zero-Fatality Philosophy", "Guardian of Human Life");
  } else if (techCluster >= 190) {
    primary = "Industrial Engineering Powerhouse";
    taglines.push("Precision Technical Authority", "Supplying the World's Best");
  } else if (s("performance") >= 50) {
    primary = "Sporting GT Specialist";
    taglines.push("Driver-Centric Balance", "Spirited Road Performance");
  } else {
    primary = "Emerging Automotive Constructor";
    taglines.push("Carving a New Legacy", "Independent Engineering Spirit");
  }

  // Detect Secondary Archetype
  if (s("motorsport") > 50 && primary !== "Motorsport & Performance Specialist") {
    secondary = "Championship Heritage";
  } else if (s("safety") > 60 && primary !== "Pioneering Safety Specialist") {
    secondary = "Class-Leading Safety Standard";
  } else if (s("innovation") > 60) {
    secondary = "Technological Trailblazer";
  } else if (s("value") > 60) {
    secondary = "Accessible High-Value Proposition";
  } else {
    secondary = "Balanced Multi-Segment Builder";
  }

  let summary = `Founded in 1970, the company is recognized as a ${primary.toLowerCase()}`;
  if (companyAgeYears > 5) {
    summary += ` with a reputation reinforced across ${totalVehiclesLaunched} production programs and active engineering divisions.`;
  } else {
    summary += `, rapidly carving out its identity through initial engineering milestones and customer vehicle deliveries.`;
  }

  return {
    overallReputation,
    overallLevel,
    designLanguage,
    primaryArchetype: primary,
    secondaryArchetype: secondary,
    taglines,
    publicPerceptionSummary: summary,
    brandPrestigeIndex,
    priceToleranceMultiplier,
  };
}

// ─────────────────────────────────────────────────────────────
// MARKET OPPORTUNITIES EVALUATION
// ─────────────────────────────────────────────────────────────
export function evaluateMarketOpportunities(scores: DimensionScores): MarketOpportunity[] {
  return MARKET_OPPORTUNITIES_CATALOG.map((opp) => {
    const currentScore = scores[opp.requiredDimension]?.score ?? 0;
    return {
      ...opp,
      isUnlocked: currentScore >= opp.thresholdScore,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// TIME ADVANCEMENT: MOMENTUM, MEMORY & DECAY
// Natural drift toward baseline with differential decay speeds
// ─────────────────────────────────────────────────────────────
export function advanceReputationClock(
  current: DimensionScores,
  elapsedDays: number
): DimensionScores {
  if (elapsedDays <= 0) return current;

  // Fraction of a year elapsed (365 days)
  const yearFraction = elapsedDays / 365;
  const updated = { ...current };

  for (const key of Object.keys(updated) as ReputationDimensionKey[]) {
    const meta = REPUTATION_DIMENSIONS_META[key];
    const item = { ...updated[key] };

    // Decay rate towards median baseline (30) if inactive
    let decayAnnualRate = 0.02; // medium
    if (meta?.decaySpeed === "fast") decayAnnualRate = 0.05;
    if (meta?.decaySpeed === "slow") decayAnnualRate = 0.005;

    // Apply trend momentum
    const naturalDrift = (item.trendQuarterly * 4) * yearFraction;
    
    // Natural friction decay toward baseline 30 if elevated
    const deltaFromBaseline = item.score - 30;
    const decayAmount = deltaFromBaseline > 0 ? deltaFromBaseline * decayAnnualRate * yearFraction : 0;

    let newScore = item.score + naturalDrift - decayAmount;
    newScore = Math.min(100, Math.max(5, Number(newScore.toFixed(1))));

    item.score = newScore;
    if (newScore > item.historicalPeak) {
      item.historicalPeak = newScore;
    }

    updated[key] = item;
  }

  return updated;
}

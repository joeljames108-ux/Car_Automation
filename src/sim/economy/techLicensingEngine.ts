/**
 * ═══════════════════════════════════════════════════════════════════════
 * TECHNOLOGY LICENSING ENGINE — PATENTS, ROYALTIES & IP REVENUE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 5: Monetizing proprietary automotive inventions.
 * When the company develops cutting-edge R&D patents, third-party
 * OEMs pay initial access fees, per-unit production royalties,
 * and monthly engineering support contracts.
 */

export interface TechLicenseAgreement {
  id: string;
  technologyId: string;
  technologyName: string;
  licenseeName: string;
  licenseeTier: "TIER1_OEM" | "REGIONAL_MANUFACTURER" | "MOTORSPORT_TEAM";
  initialLicensingFee: number;
  perUnitRoyalty: number;
  estimatedUnitsProducedMonthly: number;
  monthlySupportContractFee: number;
  durationMonths: number;
  monthsActive: number;
  isExclusive: boolean;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
}

export interface TechLicensingMonthlySummary {
  totalMonthlyRoyalties: number;
  totalMonthlySupportFees: number;
  totalMonthlyRevenue: number;
  activeLicensesCount: number;
  licensedTechnologiesCount: number;
  licenseDetails: Array<{
    id: string;
    technologyName: string;
    licenseeName: string;
    monthlyRevenue: number;
    remainingMonths: number;
  }>;
}

/** Process active tech licenses for the current month */
export function processMonthlyTechLicenses(
  licenses: TechLicenseAgreement[]
): {
  updatedLicenses: TechLicenseAgreement[];
  summary: TechLicensingMonthlySummary;
} {
  let totalRoyalties = 0;
  let totalSupport = 0;
  const licenseDetails: TechLicensingMonthlySummary["licenseDetails"] = [];
  const updatedLicenses: TechLicenseAgreement[] = [];
  const distinctTechs = new Set<string>();

  for (const lic of licenses) {
    if (lic.status !== "ACTIVE") continue;

    // Royalties fluctuate slightly (+/- 5%) around expected production volume
    const volumeJitter = 0.95 + Math.random() * 0.10;
    const monthlyUnits = Math.round(lic.estimatedUnitsProducedMonthly * volumeJitter);
    const royaltyEarned = monthlyUnits * lic.perUnitRoyalty;
    const supportEarned = lic.monthlySupportContractFee;
    const totalMonthRev = royaltyEarned + supportEarned;

    totalRoyalties += royaltyEarned;
    totalSupport += supportEarned;
    distinctTechs.add(lic.technologyId);

    const newActiveMonths = lic.monthsActive + 1;
    const isExpired = newActiveMonths >= lic.durationMonths;

    updatedLicenses.push({
      ...lic,
      monthsActive: newActiveMonths,
      status: isExpired ? "EXPIRED" : "ACTIVE",
    });

    licenseDetails.push({
      id: lic.id,
      technologyName: lic.technologyName,
      licenseeName: lic.licenseeName,
      monthlyRevenue: totalMonthRev,
      remainingMonths: Math.max(0, lic.durationMonths - newActiveMonths),
    });
  }

  return {
    updatedLicenses,
    summary: {
      totalMonthlyRoyalties: totalRoyalties,
      totalMonthlySupportFees: totalSupport,
      totalMonthlyRevenue: totalRoyalties + totalSupport,
      activeLicensesCount: updatedLicenses.filter((l) => l.status === "ACTIVE").length,
      licensedTechnologiesCount: distinctTechs.size,
      licenseDetails,
    },
  };
}

/** Generate licensing opportunities when the player unlocks significant proprietary tech */
export function generateLicensingOpportunities(
  engineeringScore: number,
  commercialTrustScore: number,
  unlockedTechIds: string[],
  year: number
): TechLicenseAgreement[] {
  const opportunities: TechLicenseAgreement[] = [];

  // If company has high engineering (>= 60) and commercial trust (>= 50)
  if (engineeringScore >= 60 && commercialTrustScore >= 50) {
    opportunities.push({
      id: `lic_pat_${year}_${Math.random().toString(36).substring(2, 6)}`,
      technologyId: "tech_variable_valve_geometry",
      technologyName: "Mechanical Variable Valve Lift Camshaft Architecture",
      licenseeName: "Nippon Auto Engineering Consortium",
      licenseeTier: "TIER1_OEM",
      initialLicensingFee: 15000000, // ₹15M upfront
      perUnitRoyalty: 850,           // ₹850 per engine built
      estimatedUnitsProducedMonthly: 4500, // ~₹3.8M/mo
      monthlySupportContractFee: 350000,
      durationMonths: 48,
      monthsActive: 0,
      isExclusive: false,
      status: "ACTIVE",
    });
  }

  if (engineeringScore >= 80) {
    opportunities.push({
      id: `lic_aero_${year}_${Math.random().toString(36).substring(2, 6)}`,
      technologyId: "tech_active_aerodynamics_algorithm",
      technologyName: "Dynamic Underfloor Venturi Inversion Control Matrix",
      licenseeName: "Bavaria Sportwagenwerke AG",
      licenseeTier: "TIER1_OEM",
      initialLicensingFee: 35000000, // ₹35M upfront
      perUnitRoyalty: 4200,          // ₹4,200 per supercar built
      estimatedUnitsProducedMonthly: 600,  // ~₹2.5M/mo
      monthlySupportContractFee: 600000,
      durationMonths: 60,
      monthsActive: 0,
      isExclusive: true,
      status: "ACTIVE",
    });
  }

  return opportunities;
}

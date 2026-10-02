/**
 * ═══════════════════════════════════════════════════════════════════════
 * FINANCIAL DANGER DETECTOR — LIQUIDITY WARNINGS & CRISIS SURVIVAL
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 43 & 44:
 *
 * An automotive company burns millions every month in payroll, energy,
 * tooling, and supplier parts. If cash drops too fast, the danger system
 * fires progressive alarms before bankruptcy ensues.
 *
 * Alert Tiers:
 * - HEALTHY:   Runway > 12 months
 * - STABLE:    Runway 6-12 months
 * - WARNING:   Runway 3-6 months ("Cash reserves falling below safety buffer")
 * - CRITICAL:  Runway < 2 months ("Imminent default on debt or payroll")
 * - INSOLVENT: Cash <= 0 ("Company unable to meet statutory obligations")
 *
 * Actionable Emergency Options (Section 43):
 * 1. Suspend or halve R&D budget
 * 2. Pause or mothball factory CapEx construction
 * 3. Liquidate surplus capital tooling or sell older test tracks
 * 4. Implement immediate hiring freeze or selective workforce reduction
 * 5. Draw emergency bank bridge liquidity (emergency high-interest loan)
 * 6. Clearance discount sale of unsold vehicle inventory
 */

export type CashHealthStatus = "HEALTHY" | "STABLE" | "WARNING" | "CRITICAL" | "INSOLVENT";

export interface EmergencyActionOption {
  id: string;
  title: string;
  description: string;
  category: "COST_CUTTING" | "CAPITAL_RAISE" | "ASSET_LIQUIDATION" | "INVENTORY_CLEARANCE";
  immediateCashBenefit: number;      // ₹ gained or freed up immediately
  monthlySavings: number;            // ₹ reduced from recurring monthly opex
  reputationDrawbackPct?: number;    // Any negative impact on employer/commercial rep
  executionActionKey: string;
}

export interface FinancialHealthAssessment {
  status: CashHealthStatus;
  monthsOfRunway: number;
  currentCash: number;
  monthlyBurnRate: number;
  isDebtServicingAtRisk: boolean;
  isPayrollAtRisk: boolean;
  headlineWarning: string;
  detailedAnalysis: string;
  emergencyActions: EmergencyActionOption[];
}

/**
 * Perform deep liquidity risk assessment and generate contextual emergency response options
 */
export function evaluateFinancialHealth(
  cash: number,
  monthlyOperatingExpenses: number,
  monthlyDebtObligations: number,
  monthlyRDBurn: number,
  unsoldInventoryUnits: number,
  averageVehicleListPrice: number
): FinancialHealthAssessment {
  const totalMonthlyBurn = Math.max(1, monthlyOperatingExpenses + monthlyDebtObligations);
  const monthsOfRunway = cash > 0 ? Number((cash / totalMonthlyBurn).toFixed(1)) : 0;

  let status: CashHealthStatus = "HEALTHY";
  if (cash <= 0) status = "INSOLVENT";
  else if (monthsOfRunway < 1.8) status = "CRITICAL";
  else if (monthsOfRunway < 4.0) status = "WARNING";
  else if (monthsOfRunway < 12.0) status = "STABLE";

  const isDebtServicingAtRisk = cash < monthlyDebtObligations * 2;
  const isPayrollAtRisk = cash < monthlyOperatingExpenses * 1.5;

  let headlineWarning = "Corporate liquidity is robust with ample operating runway.";
  let detailedAnalysis = "Current liquid reserves comfortably exceed short-term operating liabilities.";

  if (status === "INSOLVENT") {
    headlineWarning = "CRITICAL INSOLVENCY — CORPORATE LIQUIDITY DEPLETED";
    detailedAnalysis = "Cash reserves are at ₹0. The company cannot service statutory debt or upcoming payroll obligations. Immediate capital intervention required.";
  } else if (status === "CRITICAL") {
    headlineWarning = `SEVERE LIQUIDITY ALERT — ONLY ${monthsOfRunway} MONTHS OF RUNWAY REMAINING`;
    detailedAnalysis = `At current burn rate of ₹${Math.round(totalMonthlyBurn / 1000000)}M/month, cash will be fully exhausted within ${monthsOfRunway} months. Operating cuts or bridge financing must be ratified immediately.`;
  } else if (status === "WARNING") {
    headlineWarning = `CASH BUFFER WARNING — RUNWAY HAS FALLEN TO ${monthsOfRunway} MONTHS`;
    detailedAnalysis = `Liquid reserves have dipped below the 4-month corporate safety threshold. Prudent capital preservation measures are advised.`;
  }

  // Generate tactical emergency options
  const emergencyActions: EmergencyActionOption[] = [];

  // Option 1: Pause R&D spending
  if (monthlyRDBurn > 100000) {
    emergencyActions.push({
      id: "action_freeze_rd",
      title: "Freeze Discretionary R&D Programs",
      description: "Temporarily pause prototype development and active tech research to protect core cash.",
      category: "COST_CUTTING",
      immediateCashBenefit: 0,
      monthlySavings: Math.round(monthlyRDBurn * 0.75),
      reputationDrawbackPct: 2,
      executionActionKey: "FREEZE_RD",
    });
  }

  // Option 2: Inventory Clearance
  if (unsoldInventoryUnits > 10) {
    const discountedPrice = Math.round(averageVehicleListPrice * 0.82);
    const cashGenerated = Math.min(unsoldInventoryUnits, 250) * discountedPrice;
    emergencyActions.push({
      id: "action_clearance_sale",
      title: "Special Dealer Clearance Promotion (-18%)",
      description: `Discount unsold warehouse stock by 18% to instantly generate up to ₹${Math.round(cashGenerated / 1000000)}M in liquid cash.`,
      category: "INVENTORY_CLEARANCE",
      immediateCashBenefit: cashGenerated,
      monthlySavings: 0,
      reputationDrawbackPct: 3, // Slight brand dilution
      executionActionKey: "CLEARANCE_SALE",
    });
  }

  // Option 3: Emergency Bridge Loan
  emergencyActions.push({
    id: "action_emergency_bridge_loan",
    title: "Draw Emergency Bank Credit Line",
    description: "Secure a ₹25M emergency working capital facility at 12.5% APR to guarantee uninterrupted payroll.",
    category: "CAPITAL_RAISE",
    immediateCashBenefit: 25000000,
    monthlySavings: -380000, // Adds monthly interest debt service
    reputationDrawbackPct: 4, // Slight hit to commercial trust
    executionActionKey: "BRIDGE_LOAN",
  });

  // Option 4: Selective Workforce Hiring Freeze
  emergencyActions.push({
    id: "action_hiring_freeze",
    title: "Institute Corporate Hiring Freeze & Overtime Cap",
    description: "Eliminate overtime shifts and halt new recruitment to reduce payroll burn by 12%.",
    category: "COST_CUTTING",
    immediateCashBenefit: 0,
    monthlySavings: Math.round(monthlyOperatingExpenses * 0.12),
    reputationDrawbackPct: 1,
    executionActionKey: "HIRING_FREEZE",
  });

  return {
    status,
    monthsOfRunway,
    currentCash: cash,
    monthlyBurnRate: totalMonthlyBurn,
    isDebtServicingAtRisk,
    isPayrollAtRisk,
    headlineWarning,
    detailedAnalysis,
    emergencyActions,
  };
}

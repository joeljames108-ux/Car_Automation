/**
 * ═══════════════════════════════════════════════════════════════════════
 * LOAN & FINANCING ENGINE — CORPORATE DEBT, BONDS & LIQUIDITY FACILITIES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 3C & Section 19 (Loan & Financing System):
 * Provides corporate debt instruments for capital expansion and liquidity management:
 * - Working Capital Revolving Line (12-24 mo, higher liquidity flexibility)
 * - Equipment & Tooling Term Loans (36-60 mo, collateralized by capital assets)
 * - Industrial Expansion Bonds (84-120 mo, large CapEx for factories)
 * - Emergency Liquidity Bridge Facility (6-12 mo, emergency turnaround debt)
 *
 * Interest rates dynamically adjust based on corporate credit rating and commercial trust.
 */

import { CreditRating } from "./companyValuation";

export type LoanType =
  | "WORKING_CAPITAL_LINE"
  | "EQUIPMENT_TERM_LOAN"
  | "FACTORY_BOND_ISSUE"
  | "EMERGENCY_BRIDGE_LOAN";

export interface ActiveLoan {
  id: string;
  name: string;
  type: LoanType;
  principalOriginal: number;
  principalRemaining: number;
  annualInterestRatePct: number;
  termMonths: number;
  monthsRemaining: number;
  monthlyPayment: number;       // Amortized payment (Principal + Interest)
  lenderName: string;
  status: "ACTIVE" | "PAID_OFF" | "DEFAULTED";
}

export interface LoanOpportunity {
  type: LoanType;
  title: string;
  lenderName: string;
  minPrincipal: number;
  maxPrincipal: number;
  baseInterestRatePct: number;
  effectiveInterestRatePct: number;
  defaultTermMonths: number;
  minimumCreditRating: CreditRating;
  isEligible: boolean;
  ineligibilityReason?: string;
}

const RATING_PRIORITY: Record<CreditRating, number> = {
  AAA: 9,
  "AA+": 8,
  AA: 7,
  "A+": 6,
  A: 5,
  BBB: 4,
  BB: 3,
  B: 2,
  CCC: 1,
  D: 0,
};

export const LOAN_TYPE_SPECS: Record<
  LoanType,
  {
    baseRate: number;
    defaultTerm: number;
    minRating: CreditRating;
    multiplierOfAnnualRevenue: number;
    lender: string;
  }
> = {
  WORKING_CAPITAL_LINE: {
    baseRate: 8.5,
    defaultTerm: 24,
    minRating: "BB",
    multiplierOfAnnualRevenue: 0.35,
    lender: "National Industrial Commerce Bank",
  },
  EQUIPMENT_TERM_LOAN: {
    baseRate: 6.8,
    defaultTerm: 48,
    minRating: "BBB",
    multiplierOfAnnualRevenue: 0.75,
    lender: "European Machine & Asset Finance",
  },
  FACTORY_BOND_ISSUE: {
    baseRate: 5.4,
    defaultTerm: 96,
    minRating: "A",
    multiplierOfAnnualRevenue: 2.2,
    lender: "Consortium Debt Syndicate",
  },
  EMERGENCY_BRIDGE_LOAN: {
    baseRate: 14.5,
    defaultTerm: 12,
    minRating: "CCC",
    multiplierOfAnnualRevenue: 0.20,
    lender: "Apex Capital Turnaround Partners",
  },
};

/** Calculate standard amortized monthly payment */
export function calculateAmortizedMonthlyPayment(
  principal: number,
  annualRatePct: number,
  termMonths: number
): number {
  if (annualRatePct <= 0 || termMonths <= 0) {
    return Math.round(principal / Math.max(1, termMonths));
  }
  const monthlyRate = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const payment = (principal * (monthlyRate * factor)) / (factor - 1);
  return Math.round(payment);
}

/** Get loan opportunities available to the player given their credit rating & annual revenue */
export function getAvailableLoanOpportunities(
  creditRating: CreditRating,
  commercialTrustScore: number,
  annualRevenue: number
): LoanOpportunity[] {
  const currentRatingScore = RATING_PRIORITY[creditRating] ?? 0;
  const effectiveAnnualRev = Math.max(5000000, annualRevenue);

  const types: LoanType[] = [
    "WORKING_CAPITAL_LINE",
    "EQUIPMENT_TERM_LOAN",
    "FACTORY_BOND_ISSUE",
    "EMERGENCY_BRIDGE_LOAN",
  ];

  return types.map((type) => {
    const spec = LOAN_TYPE_SPECS[type];
    const minRatingScore = RATING_PRIORITY[spec.minRating] ?? 0;
    const isEligible = currentRatingScore >= minRatingScore;

    // Commercial trust discount: up to 2.2% reduction on loan rates
    const trustDiscount = (commercialTrustScore / 100) * 2.2;
    const effectiveRate = Number(Math.max(3.5, spec.baseRate - trustDiscount).toFixed(2));
    const maxPrincipal = Math.round(effectiveAnnualRev * spec.multiplierOfAnnualRevenue);

    let ineligibilityReason: string | undefined = undefined;
    if (!isEligible) {
      ineligibilityReason = `Requires corporate credit rating of ${spec.minRating} or higher (current: ${creditRating})`;
    }

    return {
      type,
      title: type.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" "),
      lenderName: spec.lender,
      minPrincipal: Math.round(maxPrincipal * 0.15),
      maxPrincipal,
      baseInterestRatePct: spec.baseRate,
      effectiveInterestRatePct: effectiveRate,
      defaultTermMonths: spec.defaultTerm,
      minimumCreditRating: spec.minRating,
      isEligible,
      ineligibilityReason,
    };
  });
}

/** Issue a new corporate loan */
export function createActiveLoan(
  type: LoanType,
  principal: number,
  termMonths: number,
  annualInterestRatePct: number,
  lenderName: string,
  year: number
): ActiveLoan {
  const payment = calculateAmortizedMonthlyPayment(principal, annualInterestRatePct, termMonths);
  return {
    id: `loan_${type.toLowerCase()}_${year}_${Math.random().toString(36).substring(2, 7)}`,
    name: `${type.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ")} (${lenderName})`,
    type,
    principalOriginal: principal,
    principalRemaining: principal,
    annualInterestRatePct,
    termMonths,
    monthsRemaining: termMonths,
    monthlyPayment: payment,
    lenderName,
    status: "ACTIVE",
  };
}

/** Process monthly debt service for all active loans */
export function processMonthlyLoans(
  loans: ActiveLoan[]
): {
  updatedLoans: ActiveLoan[];
  totalMonthlyPayment: number;
  totalPrincipalRepaid: number;
  totalInterestPaid: number;
  maturedLoans: ActiveLoan[];
} {
  let totalMonthlyPayment = 0;
  let totalPrincipalRepaid = 0;
  let totalInterestPaid = 0;
  const updatedLoans: ActiveLoan[] = [];
  const maturedLoans: ActiveLoan[] = [];

  for (const loan of loans) {
    if (loan.status !== "ACTIVE") {
      updatedLoans.push(loan);
      continue;
    }

    const monthlyInterestRate = loan.annualInterestRatePct / 100 / 12;
    const interestDue = Math.round(loan.principalRemaining * monthlyInterestRate);
    const principalDue = Math.min(loan.principalRemaining, Math.max(0, loan.monthlyPayment - interestDue));
    const actualPayment = interestDue + principalDue;

    totalInterestPaid += interestDue;
    totalPrincipalRepaid += principalDue;
    totalMonthlyPayment += actualPayment;

    const remainingMonths = Math.max(0, loan.monthsRemaining - 1);
    const remainingPrincipal = Math.max(0, loan.principalRemaining - principalDue);
    const isMatured = remainingMonths === 0 || remainingPrincipal <= 0;

    const updated: ActiveLoan = {
      ...loan,
      principalRemaining: remainingPrincipal,
      monthsRemaining: remainingMonths,
      status: isMatured ? "PAID_OFF" : "ACTIVE",
    };

    updatedLoans.push(updated);
    if (isMatured) {
      maturedLoans.push(updated);
    }
  }

  return {
    updatedLoans,
    totalMonthlyPayment,
    totalPrincipalRepaid,
    totalInterestPaid,
    maturedLoans,
  };
}

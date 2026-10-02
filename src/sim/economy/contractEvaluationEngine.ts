/**
 * ═══════════════════════════════════════════════════════════════════════
 * CONTRACT EVALUATION ENGINE — NPC DECISION MAKING & REPUTATION GATING
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 6, 23 & 24:
 *
 * Major automotive OEMs and racing constructors evaluate the player's
 * corporate profile before awarding lucrative supply contracts:
 *
 * Evaluation Criteria (Section 23):
 * 1. Unit Price vs OEM internal benchmark
 * 2. Available Factory Capacity (do they have room to deliver on time?)
 * 3. Engineering & Technology score
 * 4. Quality PPM defect history
 * 5. Historical On-Time Delivery compliance
 * 6. Contract & Commercial Trust reputation
 *
 * Reputation Gating (Section 24):
 * Higher contract tiers (Tier 1 Local to Tier 6 Global Alliance)
 * are locked until the player proves integrity and capability.
 */

import { DimensionScores } from "../../state/reputationEngine";

export interface BidSubmission {
  tenderId: string;
  partnerName: string;
  quotedUnitPrice: number;
  benchmarkPrice: number;
  annualVolume: number;
  availableCapacityUnits: number;
  proposedPaymentTerms: "UPFRONT" | "NET_30" | "NET_60";
  defectTolerancePpm: number;
  penaltyClausePct: number;
}

export interface NPCEvaluationResult {
  tenderId: string;
  isAccepted: boolean;
  score: number; // 0-100
  sentiment: "EAGER" | "FAVORABLE" | "HESITANT" | "INSULTED";
  feedbackMessage: string;
  counterOffer?: {
    unitPrice: number;
    annualVolume: number;
    durationYears: 1 | 3 | 5;
    message: string;
  };
}

export interface GatedContractOpportunity {
  id: string;
  title: string;
  partnerName: string;
  partnerCountry: string;
  category: "INBOUND_SUPPLIER" | "OUTBOUND_OEM" | "MOTORSPORT" | "TECH_LICENSE";
  tierLevel: number; // 1 to 6
  requiredContractReputation: number;
  requiredEngineeringReputation: number;
  requiredManufacturingReputation: number;
  proposedAnnualVolume: number;
  baseUnitPrice: number;
  benchmarkPrice: number;
  durationYears: number;
  description: string;
  slaCommitment: string;
  annualValue: number;
}

/**
 * NPC Automotive OEM evaluates a player's contract bid
 */
export function evaluateContractBid(
  bid: BidSubmission,
  dimensionScores: DimensionScores,
  historicalOnTimeDeliveryPct: number = 95
): NPCEvaluationResult {
  const get = (k: keyof DimensionScores): number => dimensionScores[k]?.score ?? 30;

  const contractRep = get("contracts");
  const commercialTrust = get("commercialTrust");
  const engScore = get("engineering");
  const mfgScore = get("manufacturingQuality");

  // 1. Price Competitiveness (0 - 35 pts)
  const priceRatio = bid.quotedUnitPrice / Math.max(1, bid.benchmarkPrice);
  let priceScore = 20;
  if (priceRatio <= 0.85) priceScore = 35; // Great discount
  else if (priceRatio <= 1.0) priceScore = 30;
  else if (priceRatio <= 1.12) priceScore = 15;
  else if (priceRatio <= 1.25) priceScore = 5;
  else priceScore = 0; // Overpriced

  // 2. Capacity Readiness (0 - 25 pts)
  const capacityRatio = bid.availableCapacityUnits / Math.max(1, bid.annualVolume);
  let capacityScore = 15;
  if (capacityRatio >= 1.5) capacityScore = 25; // Plentiful buffer
  else if (capacityRatio >= 1.05) capacityScore = 20;
  else if (capacityRatio >= 0.90) capacityScore = 10;
  else capacityScore = 0; // Severe capacity shortfall

  // 3. Technical & Manufacturing Quality (0 - 20 pts)
  const techScore = Math.round(((engScore * 0.5 + mfgScore * 0.5) / 100) * 20);

  // 4. Contract & Commercial Trust Reputation (0 - 20 pts)
  const repScore = Math.round(((contractRep * 0.6 + commercialTrust * 0.4) / 100) * 20);

  // Total composite score (0-100)
  const totalScore = priceScore + capacityScore + techScore + repScore;

  // Decision thresholds
  if (totalScore >= 70) {
    return {
      tenderId: bid.tenderId,
      isAccepted: true,
      score: totalScore,
      sentiment: totalScore >= 85 ? "EAGER" : "FAVORABLE",
      feedbackMessage: `${bid.partnerName} has accepted your tender terms. Production allotment is approved.`,
    };
  }

  if (totalScore >= 50) {
    // Propose a counter-offer
    const counterPrice = Math.round(bid.benchmarkPrice * 0.95);
    return {
      tenderId: bid.tenderId,
      isAccepted: false,
      score: totalScore,
      sentiment: "HESITANT",
      feedbackMessage: `${bid.partnerName} is interested but requires more aggressive pricing or volume concessions.`,
      counterOffer: {
        unitPrice: counterPrice,
        annualVolume: bid.annualVolume,
        durationYears: 3,
        message: `We can award this contract if you meet our revised target price of ₹${counterPrice.toLocaleString()}.`,
      },
    };
  }

  return {
    tenderId: bid.tenderId,
    isAccepted: false,
    score: totalScore,
    sentiment: priceRatio > 1.20 ? "INSULTED" : "HESITANT",
    feedbackMessage: `${bid.partnerName} has rejected your tender. Capacity or commercial terms failed their internal risk assessment.`,
  };
}

/**
 * Filter contract opportunities by player's unlocked reputation tier
 */
export function filterGatedContracts(
  tenders: GatedContractOpportunity[],
  dimensionScores: DimensionScores
): { unlocked: GatedContractOpportunity[]; locked: GatedContractOpportunity[] } {
  const get = (k: keyof DimensionScores): number => dimensionScores[k]?.score ?? 30;

  const contractScore = get("contracts");
  const engScore = get("engineering");
  const mfgScore = get("manufacturingQuality");

  const unlocked: GatedContractOpportunity[] = [];
  const locked: GatedContractOpportunity[] = [];

  for (const t of tenders) {
    const meetsContract = contractScore >= t.requiredContractReputation;
    const meetsEng = engScore >= t.requiredEngineeringReputation;
    const meetsMfg = mfgScore >= t.requiredManufacturingReputation;

    if (meetsContract && meetsEng && meetsMfg) {
      unlocked.push(t);
    } else {
      locked.push(t);
    }
  }

  return { unlocked, locked };
}

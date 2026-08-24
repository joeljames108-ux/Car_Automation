// ===================================================================
// SUPPLIER RISK AUDITING & DUAL-SOURCING MATRIX
// ===================================================================
// Evaluates supplier financial bankruptcy risk, ESG compliance,
// single-source vulnerability, and multi-sourcing split ratios.
// ===================================================================

import { GlobalSupplier, SupplyCategory } from "./supplierRegistry";

export interface SupplierAuditReport {
  supplierId: string;
  supplierName: string;
  category: SupplyCategory;
  compositeRiskScore: number; // 0 - 100 (Higher = Risky)
  financialInsolvencyRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  esgComplianceGrade: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";
  singleSourceVulnerability: boolean;
  recommendedDualSourceSupplierId?: string;
  auditComments: string[];
}

export interface DualSourcingAllocation {
  primarySupplierId: string;
  primaryAllocationPct: number; // e.g. 70%
  secondarySupplierId: string;
  secondaryAllocationPct: number; // e.g. 30%
  blendedUnitCostMultiplier: number;
  blendedQualityDefectPpm: number;
  resilienceIndex: number; // 0 - 100
}

export class SupplierRiskAndAuditEngine {
  /**
   * Conducts a full risk audit on a supplier profile.
   */
  public static auditSupplier(supplier: GlobalSupplier, allSuppliers: GlobalSupplier[]): SupplierAuditReport {
    const comments: string[] = [];

    // Financial Insolvency Risk
    let financialInsolvencyRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    if (supplier.financialStabilityIndex < 0.75) {
      financialInsolvencyRisk = "CRITICAL";
      comments.push("CRITICAL: Financial stability index below 0.75 threshold. Insolvency risk elevated.");
    } else if (supplier.financialStabilityIndex < 0.85) {
      financialInsolvencyRisk = "HIGH";
      comments.push("WARNING: Moderate financial distress detected in quarterly filings.");
    } else if (supplier.financialStabilityIndex < 0.92) {
      financialInsolvencyRisk = "MODERATE";
    }

    // ESG Grade mapping
    let esgComplianceGrade: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC" = "BBB";
    if (supplier.esgSustainabilityScore >= 92) esgComplianceGrade = "AAA";
    else if (supplier.esgSustainabilityScore >= 88) esgComplianceGrade = "AA";
    else if (supplier.esgSustainabilityScore >= 82) esgComplianceGrade = "A";
    else if (supplier.esgSustainabilityScore >= 75) esgComplianceGrade = "BBB";
    else if (supplier.esgSustainabilityScore >= 65) esgComplianceGrade = "BB";
    else esgComplianceGrade = "CCC";

    if (supplier.esgSustainabilityScore < 75) {
      comments.push("ESG WARNING: Carbon footprint or labor practices fall below OEM sustainability standards.");
    }

    // Check single-source vulnerability
    const peerSuppliers = allSuppliers.filter((s) => s.category === supplier.category && s.id !== supplier.id);
    const singleSourceVulnerability = peerSuppliers.length === 0;

    let recommendedDualSourceSupplierId: string | undefined;
    if (peerSuppliers.length > 0) {
      // Pick best alternative by reputation & quality
      peerSuppliers.sort((a, b) => b.reputationScorePct - a.reputationScorePct);
      recommendedDualSourceSupplierId = peerSuppliers[0].id;
    } else {
      comments.push("SINGLE-SOURCE RISK: No alternative Tier-1/2 supplier registered for this category!");
    }

    // Composite Risk Score formula
    const insolvencyPenalty = (1.0 - supplier.financialStabilityIndex) * 40;
    const defectPenalty = (supplier.qualityDefectPpm / 100) * 20;
    const leadTimePenalty = (supplier.leadTimeWeeks / 16) * 20;
    const esgPenalty = ((100 - supplier.esgSustainabilityScore) / 100) * 20;

    const compositeRiskScore = Number(
      Math.min(99, Math.max(1, insolvencyPenalty + defectPenalty + leadTimePenalty + esgPenalty)).toFixed(1)
    );

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      category: supplier.category,
      compositeRiskScore,
      financialInsolvencyRisk,
      esgComplianceGrade,
      singleSourceVulnerability,
      recommendedDualSourceSupplierId,
      auditComments: comments,
    };
  }

  /**
   * Computes blended cost and quality metrics for a dual-sourcing split strategy (e.g., 70/30).
   */
  public static calculateDualSourcingSplit(
    primary: GlobalSupplier,
    primaryPct: number,
    secondary: GlobalSupplier
  ): DualSourcingAllocation {
    const pFrac = primaryPct / 100;
    const sFrac = (100 - primaryPct) / 100;

    const blendedUnitCostMultiplier = Number((primary.costMultiplier * pFrac + secondary.costMultiplier * sFrac).toFixed(3));
    const blendedQualityDefectPpm = Math.round(primary.qualityDefectPpm * pFrac + secondary.qualityDefectPpm * sFrac);

    // Dual-sourcing increases resilience index by mitigating single-point failure
    const primaryResilience = primary.financialStabilityIndex * primary.reputationScorePct;
    const secondaryResilience = secondary.financialStabilityIndex * secondary.reputationScorePct;
    const resilienceIndex = Number(Math.min(99.0, (primaryResilience * pFrac + secondaryResilience * sFrac) * 1.15).toFixed(1));

    return {
      primarySupplierId: primary.id,
      primaryAllocationPct: primaryPct,
      secondarySupplierId: secondary.id,
      secondaryAllocationPct: 100 - primaryPct,
      blendedUnitCostMultiplier,
      blendedQualityDefectPpm,
      resilienceIndex,
    };
  }
}

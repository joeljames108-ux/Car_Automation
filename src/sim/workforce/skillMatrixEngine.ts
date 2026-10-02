/**
 * ═══════════════════════════════════════════════════════════════════════
 * SKILL MATRIX & PROJECT RELEVANCE ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 5 ("Skills"), Section 6 ("Overall Skill"),
 * and Section 7 ("Specialization is more important than raw skill").
 *
 * Calculates multidimensional attributes, composite overall skill,
 * and context-aware Project Relevant Skill.
 */

import {
  Employee,
  AnySkillMatrix,
  TechnicalSkillMatrix,
  ProductionSkillMatrix,
  ManagementSkillMatrix,
  DesignSkillMatrix,
} from "./workforceTypes";
import { calculateSpecializationMatch } from "./specializationRegistry";

/**
 * Calculate intuitive composite overall skill (0-100) from discipline vectors
 */
export function calculateOverallSkill(matrix: AnySkillMatrix): number {
  switch (matrix.discipline) {
    case "TECHNICAL": {
      const tech = matrix as TechnicalSkillMatrix;
      // Technical Mastery (35%) + Problem Solving (25%) + Innovation (20%) + Accuracy (15%) + Leadership (5%)
      const score =
        tech.technicalMastery * 0.35 +
        tech.problemSolving * 0.25 +
        tech.innovation * 0.20 +
        tech.accuracy * 0.15 +
        tech.leadership * 0.05;
      return Math.round(Math.min(100, Math.max(1, score)));
    }
    case "PRODUCTION": {
      const prod = matrix as ProductionSkillMatrix;
      // Machine Operation (35%) + Efficiency (30%) + Quality Awareness (20%) + Safety (15%)
      const score =
        prod.machineOperation * 0.35 +
        prod.productionEfficiency * 0.30 +
        prod.qualityAwareness * 0.20 +
        prod.safetyCompliance * 0.15;
      return Math.round(Math.min(100, Math.max(1, score)));
    }
    case "MANAGEMENT": {
      const mgr = matrix as ManagementSkillMatrix;
      // Leadership (30%) + Strategic Planning (25%) + Decision Velocity (20%) + People Dev (15%) + Finance (10%)
      const score =
        mgr.leadership * 0.30 +
        mgr.strategicPlanning * 0.25 +
        mgr.decisionVelocity * 0.20 +
        mgr.peopleDevelopment * 0.15 +
        mgr.financialAcumen * 0.10;
      return Math.round(Math.min(100, Math.max(1, score)));
    }
    case "DESIGN": {
      const des = matrix as DesignSkillMatrix;
      // Styling (35%) + Proportions (25%) + Creative Innovation (20%) + Luxury Craft (10%) + Ergonomics (10%)
      const score =
        des.stylingMastery * 0.35 +
        des.proportionsAndStance * 0.25 +
        des.creativeInnovation * 0.20 +
        des.luxuryCraftsmanship * 0.10 +
        des.ergonomicsAndHPoint * 0.10;
      return Math.round(Math.min(100, Math.max(1, score)));
    }
    default:
      return 50;
  }
}

/**
 * Requirements context for an active engineering or styling project
 */
export interface ProjectRequirementsContext {
  targetSpecializationId: string; // e.g. "TURBOCHARGING"
  minimumExperienceYears?: number;
  complexityTier?: 1 | 2 | 3 | 4 | 5;
  requiresHighInnovation?: boolean;
  requiresHighAccuracy?: boolean;
}

/**
 * Calculate Project Relevant Skill (Section 7)
 * Evaluates how effectively an employee's specific talent and specialization
 * maps to the concrete requirements of an active project.
 */
export function calculateProjectRelevantSkill(
  employee: Employee,
  projectReqs: ProjectRequirementsContext
): number {
  // 1. Base skill derived from employee overall skill
  const baseSkill = employee.overallSkill;

  // 2. Specialization match coefficient (0.45 to 1.15)
  const specMatch = calculateSpecializationMatch(
    employee.primarySpecialization,
    employee.secondarySpecialization,
    employee.specializationScore,
    projectReqs.targetSpecializationId
  );

  // 3. Discipline-specific attribute bonus
  let attributeBonus = 0;
  if (employee.skillMatrix.discipline === "TECHNICAL") {
    const tech = employee.skillMatrix as TechnicalSkillMatrix;
    if (projectReqs.requiresHighInnovation && tech.innovation > 80) {
      attributeBonus += (tech.innovation - 80) * 0.25;
    }
    if (projectReqs.requiresHighAccuracy && tech.accuracy > 80) {
      attributeBonus += (tech.accuracy - 80) * 0.25;
    }
  }

  // 4. Experience factor: Experience adds confidence and judgment
  const expYears = employee.experienceYears;
  const expFactor = 0.85 + Math.min(0.25, (expYears / 20) * 0.25); // 0.85 to 1.10

  // 5. Compute relevant skill
  const relevantSkill = (baseSkill * specMatch + attributeBonus) * expFactor;

  return Math.round(Math.min(100, Math.max(10, relevantSkill)));
}

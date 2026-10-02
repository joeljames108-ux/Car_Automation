/**
 * TRAINING, MENTORSHIP & SKILL PROGRESSION ENGINE
 * 
 * Features:
 * 1. Specialized Corporate Training Courses across Eras (1970–2026)
 * 2. Senior-to-Junior Mentorship Force Multipliers
 * 3. Monthly Experience Accumulation & Skill Growth
 */

import { EmployeeRank } from "./workforceTypes";
import { SkillRadarMetrics } from "./keyPersonnelEngine";

export type TrainingCourseId =
  | "drafting_tolerances_1970"
  | "dyno_engine_calibration"
  | "wind_tunnel_cfd_seminar"
  | "kaizen_zero_defect_retreat"
  | "cad_cae_digital_transition";

export interface TrainingCourseSpec {
  id: TrainingCourseId;
  name: string;
  costEur: number;
  durationWeeks: number;
  availableFromYear: number;
  skillBoosts: {
    technicalMastery?: number;
    precisionAccuracy?: number;
    problemSolving?: number;
    innovation?: number;
    techAdaptability?: number;
  };
  description: string;
}

export const TRAINING_CATALOG: Record<TrainingCourseId, TrainingCourseSpec> = {
  drafting_tolerances_1970: {
    id: "drafting_tolerances_1970",
    name: "GD&T Blueprint Tolerancing Masterclass",
    costEur: 8500,
    durationWeeks: 2,
    availableFromYear: 1970,
    skillBoosts: {
      precisionAccuracy: 7,
      technicalMastery: 4,
    },
    description: "Intensive drafting board geometric dimensioning and tolerance stackup training.",
  },
  dyno_engine_calibration: {
    id: "dyno_engine_calibration",
    name: "Dyno Brake Calibration & Air-Fuel Ratio Tuning",
    costEur: 14000,
    durationWeeks: 3,
    availableFromYear: 1970,
    skillBoosts: {
      technicalMastery: 8,
      problemSolving: 6,
    },
    description: "Hands-on water-brake dyno cell testing, spark advance tuning, and exhaust gas analysis.",
  },
  wind_tunnel_cfd_seminar: {
    id: "wind_tunnel_cfd_seminar",
    name: "Aero Boundary Layer & Smoke Flow Visualization",
    costEur: 18500,
    durationWeeks: 3,
    availableFromYear: 1974,
    skillBoosts: {
      technicalMastery: 9,
      techAdaptability: 8,
    },
    description: "Scale model wind tunnel smoke wanding, pressure tap logging, and boundary layer separation control.",
  },
  kaizen_zero_defect_retreat: {
    id: "kaizen_zero_defect_retreat",
    name: "TPS Kaizen & Poke-Yoke Mistake-Proofing Retreat",
    costEur: 12000,
    durationWeeks: 2,
    availableFromYear: 1978,
    skillBoosts: {
      precisionAccuracy: 11,
      problemSolving: 7,
    },
    description: "Comprehensive root-cause 5-Why analysis, jig mistake-proofing, and scrap reduction techniques.",
  },
  cad_cae_digital_transition: {
    id: "cad_cae_digital_transition",
    name: "3D Parametric CAD & Finite Element Analysis (FEA)",
    costEur: 24000,
    durationWeeks: 4,
    availableFromYear: 1985,
    skillBoosts: {
      techAdaptability: 18,
      technicalMastery: 12,
      innovation: 8,
    },
    description: "Digital transformation converting blueprint draftsmen into CATIA / Unigraphics 3D solid modelers.",
  },
};

export class TrainingAndMentorshipEngine {
  /**
   * Calculates mentorship learning rate acceleration for juniors based on senior headcount
   */
  public static calculateMentorshipFactor(
    seniorCount: number, // R4 Seniors + R5 Principals
    juniorCount: number  // R1 Trainees + R2 Juniors
  ): {
    mentorshipRatio: number;
    learningMultiplier: number;
    mentorshipHealth: "excellent" | "adequate" | "starved";
  } {
    if (juniorCount === 0) {
      return { mentorshipRatio: 1.0, learningMultiplier: 1.0, mentorshipHealth: "adequate" };
    }

    const mentorshipRatio = Math.round((seniorCount / juniorCount) * 100) / 100;

    let learningMultiplier = 1.0;
    let mentorshipHealth: "excellent" | "adequate" | "starved" = "adequate";

    if (mentorshipRatio >= 0.5) {
      // 1 mentor per 2 juniors: 2x faster learning
      learningMultiplier = 1.85;
      mentorshipHealth = "excellent";
    } else if (mentorshipRatio >= 0.25) {
      // 1 mentor per 4 juniors: healthy progression
      learningMultiplier = 1.30;
      mentorshipHealth = "adequate";
    } else {
      // Very few seniors to guide apprentices
      learningMultiplier = 0.65;
      mentorshipHealth = "starved";
    }

    return {
      mentorshipRatio,
      learningMultiplier,
      mentorshipHealth,
    };
  }

  /**
   * Applies training course buffs to a skill radar
   */
  public static applyCourseToRadar(
    radar: SkillRadarMetrics,
    courseId: TrainingCourseId
  ): SkillRadarMetrics {
    const course = TRAINING_CATALOG[courseId];
    if (!course) return radar;

    return {
      technicalMastery: Math.min(99, radar.technicalMastery + (course.skillBoosts.technicalMastery || 0)),
      innovationCreativity: Math.min(99, radar.innovationCreativity + (course.skillBoosts.innovation || 0)),
      precisionAccuracy: Math.min(99, radar.precisionAccuracy + (course.skillBoosts.precisionAccuracy || 0)),
      problemSolvingSpeed: Math.min(99, radar.problemSolvingSpeed + (course.skillBoosts.problemSolving || 0)),
      leadershipMentorship: radar.leadershipMentorship,
      techAdaptability: Math.min(99, radar.techAdaptability + (course.skillBoosts.techAdaptability || 0)),
    };
  }
}

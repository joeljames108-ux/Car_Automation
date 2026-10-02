import { describe, it, expect } from "vitest";
import {
  TrainingAndMentorshipEngine,
} from "../trainingAndMentorshipEngine";
import { SkillRadarMetrics } from "../keyPersonnelEngine";

describe("Training, Mentorship & Skill Progression Engine", () => {
  it("should accelerate learning speed by +85% when mentorship ratio is excellent", () => {
    // 6 seniors mentoring 6 juniors (1:1 ratio)
    const result = TrainingAndMentorshipEngine.calculateMentorshipFactor(6, 6);
    expect(result.mentorshipRatio).toBe(1.0);
    expect(result.learningMultiplier).toBe(1.85);
    expect(result.mentorshipHealth).toBe("excellent");
  });

  it("should penalize learning rate when juniors are starved of senior mentorship", () => {
    // 1 senior for 10 juniors
    const result = TrainingAndMentorshipEngine.calculateMentorshipFactor(1, 10);
    expect(result.mentorshipRatio).toBe(0.1);
    expect(result.learningMultiplier).toBe(0.65);
    expect(result.mentorshipHealth).toBe("starved");
  });

  it("should boost precision & technical mastery when completing GD&T Tolerancing Masterclass", () => {
    const initialRadar: SkillRadarMetrics = {
      technicalMastery: 70,
      innovationCreativity: 75,
      precisionAccuracy: 65,
      problemSolvingSpeed: 70,
      leadershipMentorship: 50,
      techAdaptability: 60,
    };

    const boosted = TrainingAndMentorshipEngine.applyCourseToRadar(
      initialRadar,
      "drafting_tolerances_1970"
    );

    expect(boosted.precisionAccuracy).toBe(65 + 7);
    expect(boosted.technicalMastery).toBe(70 + 4);
    expect(boosted.innovationCreativity).toBe(75); // Unchanged
  });

  it("should dramatically elevate digital CAD/CAE adaptability in 1985 digital transition course", () => {
    const initialRadar: SkillRadarMetrics = {
      technicalMastery: 72,
      innovationCreativity: 70,
      precisionAccuracy: 80,
      problemSolvingSpeed: 75,
      leadershipMentorship: 60,
      techAdaptability: 55,
    };

    const boosted = TrainingAndMentorshipEngine.applyCourseToRadar(
      initialRadar,
      "cad_cae_digital_transition"
    );

    expect(boosted.techAdaptability).toBe(55 + 18);
    expect(boosted.technicalMastery).toBe(72 + 12);
  });
});

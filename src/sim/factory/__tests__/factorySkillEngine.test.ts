import { describe, it, expect } from "vitest";
import {
  initializeLineSkill,
  calculateSkillMultipliers,
  tickWorkerExperience,
  startTrainingProgram,
  applyWorkerHeadcountChange,
  evaluateTurnoverRisk,
  TIER_NORMS,
  LineWorkforceSkill,
} from "../factorySkillEngine";

describe("factorySkillEngine", () => {
  describe("initializeLineSkill", () => {
    it("initializes balanced workforce distribution for a line", () => {
      const skill = initializeLineSkill("line_1", 100, "BALANCED");
      expect(skill.lineId).toBe("line_1");
      expect(skill.totalWorkers).toBe(100);
      expect(skill.traineeCount).toBe(35);
      expect(skill.journeymanCount).toBe(45);
      expect(skill.seniorCount).toBe(15);
      expect(skill.masterCount).toBe(5);
      expect(skill.trainingProgramActive).toBe(false);
      expect(skill.effectiveCycleMultiplier).toBeLessThan(1.0);
      expect(skill.effectiveDefectModifier).toBeLessThan(0.0);
    });

    it("initializes veteran crew with higher master and senior counts", () => {
      const skill = initializeLineSkill("line_vet", 100, "VETERAN");
      expect(skill.masterCount).toBe(25);
      expect(skill.seniorCount).toBe(45);
      expect(skill.effectiveCycleMultiplier).toBeLessThan(0.95);
      expect(skill.effectiveDefectModifier).toBeLessThan(-0.6);
    });
  });

  describe("calculateSkillMultipliers", () => {
    it("returns 1.0 cycle and 0.0 defect for pure trainees", () => {
      const mults = calculateSkillMultipliers(50, 0, 0, 0);
      expect(mults.effectiveCycleMultiplier).toBe(1.0);
      expect(mults.effectiveDefectModifier).toBe(0.0);
    });

    it("returns 0.90 cycle and -1.2 defect for pure master craftsmen", () => {
      const mults = calculateSkillMultipliers(0, 0, 0, 50);
      expect(mults.effectiveCycleMultiplier).toBe(0.9);
      expect(mults.effectiveDefectModifier).toBe(-1.2);
    });
  });

  describe("tickWorkerExperience & Training Program", () => {
    it("accelerates experience gain when training program is active", () => {
      const initialSkill: LineWorkforceSkill = {
        lineId: "line_train",
        totalWorkers: 50,
        traineeCount: 30,
        journeymanCount: 15,
        seniorCount: 5,
        masterCount: 0,
        averageDaysExperience: 60,
        effectiveCycleMultiplier: 0.98,
        effectiveDefectModifier: -0.2,
        trainingProgramActive: true,
        trainingDaysRemaining: 10,
      };

      const result = tickWorkerExperience(initialSkill, 5, true);
      // Gained 5 * 2.5 = 12.5 days of experience
      expect(result.updatedSkill.averageDaysExperience).toBe(72.5);
      expect(result.updatedSkill.trainingDaysRemaining).toBe(5);
      expect(result.trainingCompleted).toBe(false);
    });

    it("completes training program when countdown reaches 0", () => {
      const initialSkill: LineWorkforceSkill = {
        lineId: "line_train",
        totalWorkers: 50,
        traineeCount: 20,
        journeymanCount: 20,
        seniorCount: 10,
        masterCount: 0,
        averageDaysExperience: 100,
        effectiveCycleMultiplier: 0.97,
        effectiveDefectModifier: -0.4,
        trainingProgramActive: true,
        trainingDaysRemaining: 2,
      };

      const result = tickWorkerExperience(initialSkill, 2, true);
      expect(result.updatedSkill.trainingProgramActive).toBe(false);
      expect(result.updatedSkill.trainingDaysRemaining).toBe(0);
      expect(result.trainingCompleted).toBe(true);
    });

    it("activates training program with duration 30 days", () => {
      const skill = initializeLineSkill("line_test", 50);
      const withTraining = startTrainingProgram(skill);
      expect(withTraining.trainingProgramActive).toBe(true);
      expect(withTraining.trainingDaysRemaining).toBe(30);
    });
  });

  describe("applyWorkerHeadcountChange", () => {
    it("adds newly hired workers as trainees", () => {
      const skill = initializeLineSkill("line_1", 50, "BALANCED");
      const initialTrainees = skill.traineeCount;
      const updated = applyWorkerHeadcountChange(skill, 60);

      expect(updated.totalWorkers).toBe(60);
      expect(updated.traineeCount).toBe(initialTrainees + 10);
      expect(updated.masterCount).toBe(skill.masterCount);
    });

    it("downscales tiers proportionally when staffing is reduced", () => {
      const skill = initializeLineSkill("line_1", 100, "VETERAN");
      const updated = applyWorkerHeadcountChange(skill, 50);

      expect(updated.totalWorkers).toBe(50);
      expect(updated.masterCount).toBeLessThan(skill.masterCount);
    });
  });
});

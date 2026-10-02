import { describe, it, expect } from "vitest";
import {
  TalentRecruitmentEngine,
} from "../talentRecruitmentEngine";

describe("Talent Recruitment & Executive Headhunting Engine", () => {
  it("should generate affordable apprentice candidates with low recruitment fees", () => {
    const candidates = TalentRecruitmentEngine.generateCandidates(
      "POWERTRAIN_EV_HQ",
      "technical_apprenticeship",
      1972,
      "COMBUSTION_TUNING"
    );

    expect(candidates.length).toBe(3);
    candidates.forEach(c => {
      expect(c.targetRank).toBeLessThanOrEqual(2);
      expect(c.agencyHiringFeeEur).toBeLessThanOrEqual(2000);
      expect(c.salaryDemandEurMonth).toBeLessThan(1500);
      expect(c.poachedFromCompetitor).toBeUndefined();
    });
  });

  it("should generate experienced engineers with autonomous skill scores and standard recruiter fees", () => {
    const candidates = TalentRecruitmentEngine.generateCandidates(
      "VEHICLE_DESIGN_HQ",
      "experienced_industry_search",
      1975,
      "SURFACE_DRAFTING"
    );

    expect(candidates.length).toBe(3);
    candidates.forEach(c => {
      expect(c.targetRank).toBeGreaterThanOrEqual(3);
      expect(c.overallSkillScore).toBeGreaterThanOrEqual(70);
      expect(c.agencyHiringFeeEur).toBe(7500);
    });
  });

  it("should generate star executive headhunting candidates with high skill and rival friction penalties", () => {
    const candidates = TalentRecruitmentEngine.generateCandidates(
      "CENTRAL_CORPORATE_HQ",
      "executive_headhunting",
      1978,
      "EXECUTIVE_LEADERSHIP"
    );

    expect(candidates.length).toBe(2);
    candidates.forEach(c => {
      expect(c.targetRank).toBeGreaterThanOrEqual(5);
      expect(c.overallSkillScore).toBeGreaterThanOrEqual(85);
      expect(c.agencyHiringFeeEur).toBeGreaterThanOrEqual(20000);
      expect(c.poachedFromCompetitor).toBeDefined();
      expect(c.rivalFrictionPenaltyScore).toBeGreaterThan(10);
    });
  });
});

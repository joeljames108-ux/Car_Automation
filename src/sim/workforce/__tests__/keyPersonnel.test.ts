import { describe, it, expect } from "vitest";
import {
  KeyPersonnelEngine,
  SkillRadarMetrics,
} from "../keyPersonnelEngine";

describe("Key Personnel Dossiers & Multidimensional Skill Radar Engine", () => {
  const radar: SkillRadarMetrics = {
    technicalMastery: 92,
    innovationCreativity: 88,
    precisionAccuracy: 90,
    problemSolvingSpeed: 85,
    leadershipMentorship: 78,
    techAdaptability: 84,
  };

  it("should create a key personnel dossier with formatted permanent ID and weighted skill score", () => {
    const dossier = KeyPersonnelEngine.createDossier(
      1,
      "Dr. Michael Carter",
      1934,
      1970,
      1,
      "POWERTRAIN_EV_HQ",
      "pwr_ice_engineering",
      "ENGINEERING",
      5, // Principal
      "TURBOCHARGING",
      radar,
      3800 // €3,800/mo in 1970
    );

    expect(dossier.id).toBe("EMP-000001");
    expect(dossier.name).toBe("Dr. Michael Carter");
    expect(dossier.rankTitle).toBe("Principal / Lead Architect");
    expect(dossier.overallSkillScore).toBeGreaterThan(85);
    expect(dossier.milestoneHistory.length).toBe(1);
    expect(dossier.milestoneHistory[0].type).toBe("HIRED");
  });

  it("should promote employee, adjust salary, boost morale, and log career milestone", () => {
    const dossier = KeyPersonnelEngine.createDossier(
      2,
      "Paolo Vignale",
      1938,
      1970,
      1,
      "VEHICLE_DESIGN_HQ",
      "dsg_clay_exterior",
      "STYLING",
      6, // Manager
      "CLAY_SCULPTING",
      radar,
      3200
    );

    const promoted = KeyPersonnelEngine.promoteEmployee(dossier, 7, 1972, 6, 25);
    expect(promoted.rank).toBe(7);
    expect(promoted.rankTitle).toBe("Division Director");
    expect(promoted.monthlySalaryEur).toBe(4000); // 3200 * 1.25
    expect(promoted.moraleScore).toBeGreaterThan(dossier.moraleScore);
    expect(promoted.milestoneHistory.length).toBe(2);
    expect(promoted.milestoneHistory[1].type).toBe("PROMOTED");
  });

  it("should assign key personnel to active vehicle programs and log project role", () => {
    const dossier = KeyPersonnelEngine.createDossier(
      3,
      "Elena Rostova",
      1942,
      1970,
      1,
      "CHASSIS_DYNAMICS_HQ",
      "chs_suspension_steering",
      "ENGINEERING",
      4, // Senior
      "SUSPENSION_GEOMETRY",
      radar,
      2800
    );

    const assigned = KeyPersonnelEngine.assignToProject(
      dossier,
      "proj_apex_v12",
      "Apex V12 Gran Turismo",
      "Chief Suspension Tuner",
      1971,
      3
    );

    expect(assigned.currentProjectAssignment?.projectId).toBe("proj_apex_v12");
    expect(assigned.currentProjectAssignment?.assignedRole).toBe("Chief Suspension Tuner");
    expect(assigned.milestoneHistory.some(m => m.type === "PROJECT_LAUNCH")).toBe(true);
  });
});

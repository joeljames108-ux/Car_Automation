/**
 * ═══════════════════════════════════════════════════════════════
 *  Automotive R&D Deep Mastery Engine & Store — Unit Tests
 *  12 Divisions, 95 Subsystems, 6 Mastery Tiers, and Company DNA
 * ═══════════════════════════════════════════════════════════════
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  MASTER_DIVISIONS,
  RD_DEPARTMENTS,
  RD_TECH_NODES,
  TECH_NODE_BY_ID,
  TECH_NODES_BY_DEPARTMENT,
  DEPARTMENT_BY_ID,
  DIVISION_BY_ID,
  SUBSYSTEM_BRANCHES,
  BRANCH_BY_ID,
} from "../../sim/rdTreeData";
import {
  canResearchNode,
  getPrerequisiteDetails,
  getDepartmentStats,
  getDivisionStats,
  calculateBranchMastery,
  calculateCompanyDNA,
} from "../../sim/rdTreeEngine";
import { useRDTreeStore } from "../../state/rdTreeStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { MASTERY_TIERS } from "../../sim/rdTreeTypes";
import type {
  RDDepartmentId,
  MasterDivisionId,
  SubsystemBranchId,
} from "../../sim/rdTreeTypes";

describe("Automotive R&D 12 Divisions & 95 Subsystems Taxonomy", () => {
  it("registers exactly 12 Master Engineering Divisions", () => {
    expect(MASTER_DIVISIONS.length).toBe(12);
    const expectedDivisions: MasterDivisionId[] = [
      "powertrain",
      "vehicle_dynamics",
      "vehicle_design",
      "aerodynamics",
      "safety",
      "electronics_software",
      "electrification",
      "manufacturing",
      "industrial_supply",
      "motorsport",
      "reliability_service",
      "environment_efficiency",
    ];
    expectedDivisions.forEach((divId) => {
      expect(Boolean(DIVISION_BY_ID[divId])).toBe(true);
    });
  });

  it("registers exactly 95 Dedicated Subsystem Engineering Branches", () => {
    expect(SUBSYSTEM_BRANCHES.length).toBe(95);

    // Verify key branches from every major discipline
    const sampleBranches: SubsystemBranchId[] = [
      "ice_engine",
      "electric_powertrain",
      "chassis_dynamics",
      "suspension_dynamics",
      "body_structure",
      "vehicle_aerodynamics",
      "underbody_aerodynamics",
      "passive_safety",
      "airbags_pyrotechnics",
      "adas_systems",
      "electrical_architecture",
      "ecu_hardware",
      "battery_chemistry",
      "casting_manufacturing",
      "machining_cnc",
      "production_engineering",
      "rail_freight_systems",
      "race_engines",
      "telemetry_acquisition",
      "durability_engineering",
      "fuel_efficiency",
      "sustainable_materials",
    ];

    sampleBranches.forEach((bId) => {
      expect(Boolean(BRANCH_BY_ID[bId])).toBe(true);
      const branch = BRANCH_BY_ID[bId];
      expect(branch.subsections.length).toBeGreaterThan(0);
      expect(branch.primaryFacility).toBeDefined();
    });
  });

  it("registers the 22 Core Automotive Departments for backward compatibility", () => {
    expect(RD_DEPARTMENTS.length).toBe(22);
    const expectedDepts: RDDepartmentId[] = [
      "engine",
      "transmission",
      "battery_ev",
      "chassis",
      "suspension",
      "tyres_wheels",
      "braking",
      "bodywork",
      "aero",
      "interior",
      "lighting_vision",
      "safety",
      "electronics",
      "software_control",
      "thermal_management",
      "materials_science",
      "manufacturing_tech",
      "testing_dev",
      "service_reliability",
      "motorsport_tech",
      "production_supply",
      "environment_efficiency",
    ];
    expectedDepts.forEach((deptId) => {
      expect(Boolean(DEPARTMENT_BY_ID[deptId])).toBe(true);
    });
  });

  it("every tech node belongs to an existing department and a matching subsection", () => {
    RD_TECH_NODES.forEach((node) => {
      const dept = DEPARTMENT_BY_ID[node.departmentId];
      expect(dept).toBeDefined();
      expect(dept.subsections).toContain(node.subsection);
      expect(node.cost).toBeGreaterThanOrEqual(0);
      expect(node.months).toBeGreaterThanOrEqual(0);
      expect(node.yearAvailable).toBeGreaterThanOrEqual(1970);
    });
  });

  it("all prerequisites point to valid registered tech nodes", () => {
    RD_TECH_NODES.forEach((node) => {
      node.requires.forEach((reqId) => {
        expect(
          Boolean(TECH_NODE_BY_ID[reqId]),
          `Prerequisite "${reqId}" referenced by node "${node.id}" must exist in TECH_NODE_BY_ID`
        ).toBe(true);
      });
    });
  });

  it("features cross-department prerequisites illustrating deep automotive ecosystem interconnectedness", () => {
    // Engine block aluminum requires Materials aluminum
    const aluBlock = TECH_NODE_BY_ID["eng_blk_aluminum"];
    expect(aluBlock).toBeDefined();
    expect(aluBlock.requires).toContain("mat_aluminum");

    // Carbon monocoque chassis requires Materials carbon fiber
    const carbonChassis = TECH_NODE_BY_ID["chas_carbon_monocoque"];
    expect(carbonChassis).toBeDefined();
    expect(carbonChassis.requires).toContain("mat_carbon_fiber");

    // ABS system in Safety requires Early ECU in Electronics
    const abs = TECH_NODE_BY_ID["safe_abs_system"];
    expect(abs).toBeDefined();
    expect(abs.requires).toContain("elec_ecu_early");
  });
});

describe("Mastery Levels (0 to 6) & Dynamic Company DNA", () => {
  it("defines all 6 Mastery Tiers with progressive stat multipliers", () => {
    expect(MASTERY_TIERS[0].name).toBe("Unknown");
    expect(MASTERY_TIERS[1].name).toBe("Basic");
    expect(MASTERY_TIERS[2].name).toBe("Competent");
    expect(MASTERY_TIERS[3].name).toBe("Advanced");
    expect(MASTERY_TIERS[4].name).toBe("Expert");
    expect(MASTERY_TIERS[5].name).toBe("World-Class");
    expect(MASTERY_TIERS[6].name).toBe("Frontier");

    // Scaling multipliers
    expect(MASTERY_TIERS[1].statMultiplier).toBe(1.0);
    expect(MASTERY_TIERS[3].statMultiplier).toBeGreaterThan(MASTERY_TIERS[2].statMultiplier);
    expect(MASTERY_TIERS[6].statMultiplier).toBeGreaterThan(2.0);
  });

  it("calculates branch mastery rank based on hours and unlocked generation nodes", () => {
    // 0 hours, no tech -> Unknown (0)
    const rank0 = calculateBranchMastery("ice_engine", new Set(), 0);
    expect(rank0).toBe(0);

    // Baseline tech or initial hours -> Basic (1)
    const rank1 = calculateBranchMastery("ice_engine", new Set(["eng_arch_baseline"]), 800);
    expect(rank1).toBe(1);

    // 4 techs + 15,000 hours -> Expert (4)
    const rank4 = calculateBranchMastery(
      "ice_engine",
      new Set(["eng_arch_baseline", "eng_arch_i6", "eng_arch_v8", "eng_ind_efi"]),
      15000
    );
    expect(rank4).toBe(4);
  });

  it("computes emergent Company DNA Archetypes accurately", () => {
    // 1. Balanced Emerging at start (few disciplines, basic mastery)
    const earlyDNA = calculateCompanyDNA(
      new Set(["eng_arch_baseline", "mat_mild_steel", "chas_ladder_frame"]),
      { ice_engine: 2500, chassis_dynamics: 1800 }
    );
    expect(earlyDNA.archetype).toBe("balanced_emerging");
    expect(earlyDNA.breadthScorePercent).toBeLessThan(15);

    // 2. Deep Specialist (Volvo/Porsche style: narrow breadth < 45%, high depth > 55%)
    const specialistRanks = {
      passive_safety: 5,
      crash_structures: 5,
      restraint_systems: 5,
      airbags_pyrotechnics: 4,
    } as any;
    const specialistDNA = calculateCompanyDNA(
      new Set(["safe_seatbelts_2pt", "safe_crumple_zones", "safe_airbags_front"]),
      { passive_safety: 35000, crash_structures: 30000 },
      specialistRanks
    );
    expect(specialistDNA.archetype).toBe("specialist");

    // 3. Industrial Generalist (Mercedes/Toyota style: broad breadth >= 65%, high depth >= 50%)
    const generalistRanks: Record<string, any> = {};
    SUBSYSTEM_BRANCHES.slice(0, 75).forEach((b) => {
      generalistRanks[b.id] = 4; // Level 4 Expert across 75 branches
    });
    const generalistDNA = calculateCompanyDNA(
      new Set(RD_TECH_NODES.slice(0, 30).map((n) => n.id)),
      { ice_engine: 50000, passive_safety: 45000 },
      generalistRanks
    );
    expect(generalistDNA.archetype).toBe("industrial_generalist");
  });
});

describe("Automotive R&D Engine Logic & Validation", () => {
  const unlockedSet = new Set(["mat_mild_steel", "eng_arch_baseline", "elec_wiring_12v"]);

  it("blocks research if node year is in the future relative to game clock", () => {
    const node = TECH_NODE_BY_ID["eng_blk_aluminum"];
    expect(node).toBeDefined();
    expect(node.yearAvailable).toBe(1975);

    const check1970 = canResearchNode(
      node.id,
      unlockedSet,
      1970, // Game year 1970 < 1975
      100_000_000,
      1000,
      { engine_lab: 2, materials_lab: 3 },
      false
    );
    expect(check1970.ok).toBe(false);
    expect(check1970.yearLocked).toBe(true);
    expect(check1970.reasons[0]).toContain("Era Locked");

    // Year gating passes when year reaches 1985
    const check1985 = canResearchNode(
      node.id,
      unlockedSet,
      1985,
      100_000_000,
      1000,
      { engine_lab: 2, materials_lab: 3 },
      false
    );
    expect(check1985.ok).toBe(false);
    expect(check1985.yearLocked).toBe(false);
    expect(check1985.missingPrereqs.length).toBeGreaterThan(0);
  });

  it("checks prerequisite satisfaction and builds rich prerequisite status", () => {
    const details = getPrerequisiteDetails("eng_blk_aluminum", new Set(["mat_mild_steel"]));

    expect(details.length).toBeGreaterThanOrEqual(1);
    const aluPrereq = details.find((d) => d.node.id === "mat_aluminum");
    expect(aluPrereq).toBeDefined();
    expect(aluPrereq?.isUnlocked).toBe(false);
    expect(aluPrereq?.isCrossDepartment).toBe(true);
    expect(aluPrereq?.department.id).toBe("materials_science");
  });

  it("fails when research points or facility tiers are insufficient", () => {
    const node = TECH_NODE_BY_ID["mat_aluminum"];
    expect(node).toBeDefined();

    // Insufficient cash / EK
    const lowResourceCheck = canResearchNode(
      node.id,
      new Set(["mat_mild_steel", "mat_hss"]),
      1985,
      1_000, // Not enough money
      0, // Not enough EK
      { materials_lab: 3 },
      false
    );
    expect(lowResourceCheck.ok).toBe(false);
    expect(lowResourceCheck.resourceLocked).toBe(true);

    // Insufficient lab level
    const lowFacilityCheck = canResearchNode(
      node.id,
      new Set(["mat_mild_steel", "mat_hss"]),
      1985,
      50_000_000,
      500,
      { materials_lab: 1 }, // Level 1 < Level 3 required
      false
    );
    expect(lowFacilityCheck.ok).toBe(false);
    expect(lowFacilityCheck.facilityLocked).toBe(true);
  });

  it("passes when all prerequisites, year, cash, EK points, and facility tier match", () => {
    const node = TECH_NODE_BY_ID["mat_aluminum"];
    const validCheck = canResearchNode(
      node.id,
      new Set(["mat_mild_steel", "mat_hss"]),
      1985,
      50_000_000,
      500,
      { materials_lab: 3 },
      false
    );
    expect(validCheck.ok).toBe(true);
    expect(validCheck.reasons.length).toBe(0);
  });

  it("allows Developer Mode to bypass all year, prerequisite, and cost gating", () => {
    const diNode = TECH_NODE_BY_ID["eng_ind_direct_injection"];
    expect(diNode).toBeDefined();
    expect(diNode.yearAvailable).toBe(1999);

    const devCheck = canResearchNode(
      diNode.id,
      new Set(), // No prerequisites
      1970, // 29 years before historical introduction
      0, // 0 cash
      0, // 0 EK
      {}, // No facilities
      true // isDevBypassed = true
    );

    expect(devCheck.ok).toBe(true);
  });
});

describe("Automotive R&D Store & Capacity Progression", () => {
  beforeEach(() => {
    const store = useRDTreeStore.getState();
    store.resetToBaseline();
    useDeveloperModeStore.getState().setOverride("ignoreResearchRequirements", false);
  });

  it("starts in 1970 with foundational 1970 baseline technologies unlocked", () => {
    const store = useRDTreeStore.getState();
    expect(store.unlockedTechs).toContain("mat_mild_steel");
    expect(store.unlockedTechs).toContain("eng_arch_baseline");
    expect(store.unlockedTechs).toContain("chas_ladder_frame");
    expect(store.unlockedTechs).toContain("elec_wiring_12v");
  });

  it("can start research, advance months, accumulate engineering hours, and unlock", () => {
    const store = useRDTreeStore.getState();
    const node = TECH_NODE_BY_ID["mat_hss"];
    expect(node).toBeDefined();

    // Set simulation clock year to 1975 so 1974 tech is available
    useSimulationClockStore.setState({ year: 1975 });

    // Start research with 15 engineers
    const started = store.startResearch("mat_hss", 15);
    expect(started).toBe(true);

    let state = useRDTreeStore.getState();
    expect(state.activeProject).not.toBeNull();
    expect(state.activeProject?.nodeId).toBe("mat_hss");
    expect(state.activeProject?.progressMonths).toBe(0);

    const initialHours = state.branchHours["materials_engineering"] || 0;

    // Advance months until completion
    const duration = node.months;
    for (let i = 0; i < duration; i++) {
      store.advanceResearchMonths(1);
    }

    state = useRDTreeStore.getState();
    expect(state.activeProject).toBeNull(); // Project completed
    expect(state.unlockedTechs).toContain("mat_hss");

    // Verify cumulative hours increased
    const finalHours = state.branchHours["materials_engineering"] || 0;
    expect(finalHours).toBeGreaterThan(initialHours);
  });

  it("supports dev mode instant unlock and updates company DNA", () => {
    const store = useRDTreeStore.getState();
    expect(store.unlockedTechs).not.toContain("eng_ind_turbo_twin");

    store.unlockNode("eng_ind_turbo_twin");
    expect(useRDTreeStore.getState().unlockedTechs).toContain("eng_ind_turbo_twin");
    expect(useRDTreeStore.getState().companyDNA).toBeDefined();
  });

  it("supports creating new research teams", () => {
    const store = useRDTreeStore.getState();
    const initialTeamCount = store.researchTeams.length;

    store.createResearchTeam("Aerodynamics CFD Team", "cfd_simulation", 14);

    const updated = useRDTreeStore.getState();
    expect(updated.researchTeams.length).toBe(initialTeamCount + 1);
    const createdTeam = updated.researchTeams.find((t) => t.name === "Aerodynamics CFD Team");
    expect(createdTeam).toBeDefined();
    expect(createdTeam?.engineersCount).toBe(14);
  });
});

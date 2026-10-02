// ===================================================================
// AUTOMOTIVE R&D DEEP MASTERY ENGINE — PROGRESSION & DNA TELEMETRY
// Mastery Levels 0-6, Company DNA, Breadth vs Depth, and Capacity
// ===================================================================
import {
  RDTechNode,
  RDDepartmentId,
  MasterDivisionId,
  RDDepartmentMeta,
  MasterDivisionMeta,
  SubsystemBranchId,
  MasteryRank,
  CompanyDNAProfile,
  CompanyArchetype,
  CompanySpecializationMetric,
  TestingFacilityType,
  MASTERY_TIERS,
} from "./rdTreeTypes";
import {
  TECH_NODE_BY_ID,
  DEPARTMENT_BY_ID,
  DIVISION_BY_ID,
  TECH_NODES_BY_DEPARTMENT,
  TECH_NODES_BY_DIVISION,
  SUBSYSTEM_BRANCHES,
  BRANCH_BY_ID,
} from "./rdTreeData";

export interface NodeCheckResult {
  ok: boolean;
  reasons: string[];
  missingPrereqs: RDTechNode[];
  yearLocked: boolean;
  facilityLocked: boolean;
  resourceLocked: boolean;
  testingLocked?: boolean;
}

export interface PrerequisiteDetail {
  node: RDTechNode;
  department: RDDepartmentMeta;
  division: MasterDivisionMeta;
  isUnlocked: boolean;
  isCrossDepartment: boolean;
}

/**
 * Validates whether a player or developer can research a given technology node.
 */
export function canResearchNode(
  nodeId: string,
  unlockedTechs: Set<string>,
  currentYear: number,
  cash: number,
  ek: number,
  buildingLevels: Record<string, number> = {},
  isDevBypassed: boolean = false,
  availableTestingFacilities: Set<TestingFacilityType> = new Set([
    "dyno_cell",
    "wind_tunnel",
    "crash_barrier",
    "test_track",
    "shaker_rig",
    "climate_chamber",
    "hil_simulation_rig",
  ])
): NodeCheckResult {
  const node = TECH_NODE_BY_ID[nodeId];
  if (!node) {
    return {
      ok: false,
      reasons: ["Unknown technology node."],
      missingPrereqs: [],
      yearLocked: false,
      facilityLocked: false,
      resourceLocked: false,
      testingLocked: false,
    };
  }

  // Already unlocked
  if (unlockedTechs.has(nodeId)) {
    return {
      ok: false,
      reasons: ["Technology already unlocked and homologated."],
      missingPrereqs: [],
      yearLocked: false,
      facilityLocked: false,
      resourceLocked: false,
      testingLocked: false,
    };
  }

  // If developer mode override is active, bypass all restrictions!
  if (isDevBypassed) {
    return {
      ok: true,
      reasons: [],
      missingPrereqs: [],
      yearLocked: false,
      facilityLocked: false,
      resourceLocked: false,
      testingLocked: false,
    };
  }

  const reasons: string[] = [];
  const missingPrereqs: RDTechNode[] = [];
  let yearLocked = false;
  let facilityLocked = false;
  let resourceLocked = false;
  let testingLocked = false;

  // 1. Historical Year Availability Check
  if (currentYear < node.yearAvailable) {
    yearLocked = true;
    reasons.push(
      `Era Locked: Historically available from year ${node.yearAvailable} (Current game year: ${currentYear}).`
    );
  }

  // 2. Intra & Cross-Department Prerequisites Check
  for (const reqId of node.requires) {
    if (!unlockedTechs.has(reqId)) {
      const reqNode = TECH_NODE_BY_ID[reqId];
      if (reqNode) {
        missingPrereqs.push(reqNode);
        const sourceDep = DEPARTMENT_BY_ID[reqNode.departmentId]?.name || reqNode.departmentId;
        reasons.push(`Prerequisite Missing: "${reqNode.name}" (${sourceDep})`);
      } else {
        reasons.push(`Unresolved dependency requirement: ${reqId}`);
      }
    }
  }

  // 3. Physical Facility / Laboratory Tier Check
  if (node.buildingId && node.buildingLevel > 0) {
    const currentTier = buildingLevels[node.buildingId] ?? 0;
    if (currentTier < node.buildingLevel) {
      facilityLocked = true;
      reasons.push(
        `Facility Required: ${node.buildingId.replace(/_/g, " ").toUpperCase()} Level ${
          node.buildingLevel
        } (Current level: ${currentTier}).`
      );
    }
  }

  // 4. Testing Infrastructure Check (if required)
  if (
    node.testingRequirement &&
    node.testingRequirement.type !== "none" &&
    !availableTestingFacilities.has(node.testingRequirement.type)
  ) {
    testingLocked = true;
    reasons.push(`Testing Rig Missing: Requires dedicated ${node.testingRequirement.label}.`);
  }

  // 5. Capital & Engineering Knowledge (EK) Resources Check
  if (cash < node.cost) {
    resourceLocked = true;
    reasons.push(
      `Insufficient Capital: Requires $${(node.cost / 1_000_000).toFixed(1)}M (Available: $${(
        cash / 1_000_000
      ).toFixed(1)}M).`
    );
  }

  if (ek < node.ekCost) {
    resourceLocked = true;
    reasons.push(
      `Insufficient Engineering Knowledge: Requires ${node.ekCost} EK points (Available: ${ek} EK).`
    );
  }

  const ok =
    reasons.length === 0 &&
    !yearLocked &&
    !facilityLocked &&
    !resourceLocked &&
    !testingLocked &&
    missingPrereqs.length === 0;

  return {
    ok,
    reasons,
    missingPrereqs,
    yearLocked,
    facilityLocked,
    resourceLocked,
    testingLocked,
  };
}

/**
 * Builds rich dependency metadata for inspecting node prerequisites.
 */
export function getPrerequisiteDetails(
  nodeId: string,
  unlockedTechs: Set<string>
): PrerequisiteDetail[] {
  const node = TECH_NODE_BY_ID[nodeId];
  if (!node) return [];

  return node.requires.map((reqId) => {
    const reqNode = TECH_NODE_BY_ID[reqId] || {
      id: reqId,
      name: reqId,
      departmentId: node.departmentId,
      divisionId: node.divisionId,
      subsection: "",
      yearAvailable: 1970,
      era: "classic_1970" as const,
      cost: 0,
      months: 0,
      scientists: 0,
      buildingId: "",
      buildingLevel: 1,
      ekCost: 0,
      description: "",
      requires: [],
      effects: [],
      unlocks: [],
      failureRisk: 0,
    };

    const dep = DEPARTMENT_BY_ID[reqNode.departmentId] || {
      id: reqNode.departmentId,
      name: reqNode.departmentId,
      divisionId: reqNode.divisionId,
      icon: "Cog",
      tagline: "",
      description: "",
      subsections: [],
      primaryColor: "blue",
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-800",
      buildingId: "",
    };

    const div = DIVISION_BY_ID[reqNode.divisionId] || {
      id: reqNode.divisionId,
      name: reqNode.divisionId,
      subtitle: "",
      icon: "Layers",
      description: "",
      departments: [],
      branches: [],
      color: "#3b82f6",
      badgeBg: "bg-blue-100",
      badgeBorder: "border-blue-300",
    };

    return {
      node: reqNode,
      department: dep,
      division: div,
      isUnlocked: unlockedTechs.has(reqId),
      isCrossDepartment: reqNode.departmentId !== node.departmentId,
    };
  });
}

/**
 * Calculates current MasteryRank (0 to 6) for a specific engineering branch
 * based on unlocked technologies and cumulative engineering hours.
 */
export function calculateBranchMastery(
  branchId: SubsystemBranchId,
  unlockedTechs: Set<string>,
  investedHours: number = 0
): MasteryRank {
  // Check technologies associated with this branch (matching branch or corresponding department)
  const branchMeta = BRANCH_BY_ID[branchId];
  if (!branchMeta) return 0;

  const nodes = Object.values(TECH_NODE_BY_ID).filter(
    (n) =>
      n.departmentId === (branchId as unknown as RDDepartmentId) ||
      (branchId === "ice_engine" && n.departmentId === "engine") ||
      (branchId === "battery_chemistry" && n.departmentId === "battery_ev") ||
      (branchId === "chassis_dynamics" && n.departmentId === "chassis") ||
      (branchId === "suspension_dynamics" && n.departmentId === "suspension") ||
      (branchId === "brake_systems" && n.departmentId === "braking") ||
      (branchId === "tyres_wheels_dynamics" && n.departmentId === "tyres_wheels") ||
      (branchId === "vehicle_aerodynamics" && n.departmentId === "aero") ||
      (branchId === "passive_safety" && n.departmentId === "safety") ||
      (branchId === "electrical_architecture" && n.departmentId === "electronics") ||
      (branchId === "materials_engineering" && n.departmentId === "materials_science") ||
      (branchId === "casting_manufacturing" && n.departmentId === "manufacturing_tech") ||
      (branchId === "race_engines" && n.departmentId === "motorsport_tech")
  );

  const unlockedCount = nodes.filter((n) => unlockedTechs.has(n.id)).length;
  const total = nodes.length;

  // Base tier from unlocked generation progress
  let rank: MasteryRank = 0;
  if (unlockedCount >= 1 || investedHours >= 500) rank = 1; // Basic
  if (unlockedCount >= 2 || (investedHours >= 2000 && unlockedCount >= 1)) rank = 2; // Competent
  if (unlockedCount >= 3 || (investedHours >= 5000 && unlockedCount >= 2)) rank = 3; // Advanced
  if (unlockedCount >= 4 || (investedHours >= 12000 && unlockedCount >= 3)) rank = 4; // Expert
  if (unlockedCount >= 5 || (investedHours >= 25000 && unlockedCount >= 4)) rank = 5; // World-Class
  if (unlockedCount >= 6 && investedHours >= 45000) rank = 6; // Frontier

  // Check if any frontier patent is explicitly unlocked
  const hasFrontier = nodes.some(
    (n) => unlockedTechs.has(n.id) && (n.masteryTarget === 6 || n.generation === 5)
  );
  if (hasFrontier && rank < 6) {
    rank = 6;
  }

  return rank;
}

/**
 * Computes the company's dynamic DNA profile, Breadth, Depth, and emergent archetype.
 */
export function calculateCompanyDNA(
  unlockedTechs: Set<string>,
  branchHours: Record<string, number> = {},
  branchMasteryRanks?: Record<string, MasteryRank>
): CompanyDNAProfile {
  const totalBranchesCount = SUBSYSTEM_BRANCHES.length; // 95
  let exploredBranchesCount = 0;
  let totalMasterySum = 0;
  let totalHours = 0;
  let frontierPatentsCount = 0;

  const branchMetrics: CompanySpecializationMetric[] = [];

  for (const branch of SUBSYSTEM_BRANCHES) {
    const hours = branchHours[branch.id] || 0;
    totalHours += hours;

    const rank =
      branchMasteryRanks?.[branch.id] ??
      calculateBranchMastery(branch.id, unlockedTechs, hours);

    if (rank >= 1) {
      exploredBranchesCount++;
    }
    if (rank === 6) {
      frontierPatentsCount++;
    }

    totalMasterySum += rank;

    branchMetrics.push({
      branchId: branch.id,
      branchName: branch.name,
      divisionId: branch.divisionId,
      mastery: rank,
      rdInvestmentSharePercent: 0, // Calculated below
      totalHours: hours,
    });
  }

  // Calculate investment shares
  const safeTotalHours = totalHours > 0 ? totalHours : 1;
  branchMetrics.forEach((m) => {
    m.rdInvestmentSharePercent = Math.round((m.totalHours / safeTotalHours) * 100);
  });

  // Sort top specializations
  branchMetrics.sort((a, b) => b.mastery - a.mastery || b.totalHours - a.totalHours);
  const topSpecializations = branchMetrics.slice(0, 5);

  // Breadth: % of 95 branches explored (>= Level 1)
  const breadthScorePercent = Math.round((exploredBranchesCount / totalBranchesCount) * 100);

  // Depth: Mean mastery level across all 95 branches scaled to 100% (max 6.0)
  const meanMastery = exploredBranchesCount > 0 ? totalMasterySum / exploredBranchesCount : 0;
  const depthScorePercent = Math.min(100, Math.round((meanMastery / 6.0) * 100));

  // Determine Emergent Archetype
  let archetype: CompanyArchetype = "balanced_emerging";
  let archetypeTitle = "Balanced Emerging Manufacturer";
  let archetypeDescription =
    "Steady baseline development across foundational mechanical and structural disciplines.";

  if (breadthScorePercent >= 65 && depthScorePercent >= 50) {
    archetype = "industrial_generalist";
    archetypeTitle = "Industrial Generalist (Broad Hegemony)";
    archetypeDescription =
      "Massive industrial enterprise with technological hegemony across Powertrain, Safety, Electronics, and Manufacturing (akin to Mercedes-Benz or Toyota).";
  } else if (breadthScorePercent <= 45 && depthScorePercent >= 55) {
    archetype = "specialist";
    archetypeTitle = "Deep Specialist";
    archetypeDescription =
      "Uncompromising focus on a singular engineering domain, achieving industry-defining benchmark status (akin to Volvo Safety or Porsche Handling).";
  } else if (depthScorePercent >= 45) {
    archetype = "focused_multi_discipline";
    archetypeTitle = "Focused Multi-Discipline";
    archetypeDescription =
      "Harmonious synergy across 3 to 4 complementary disciplines such as Powertrain, Aerodynamics, and Lightweight Dynamics (akin to McLaren or Ferrari).";
  }

  return {
    breadthScorePercent,
    depthScorePercent,
    archetype,
    archetypeTitle,
    archetypeDescription,
    topSpecializations,
    totalEngineeringHoursInvested: totalHours,
    totalFrontierPatents: frontierPatentsCount,
  };
}

/**
 * Computes unlock progress metrics for a specific department.
 */
export function getDepartmentStats(
  departmentId: RDDepartmentId,
  unlockedTechs: Set<string>
) {
  const nodes = TECH_NODES_BY_DEPARTMENT[departmentId] || [];
  const total = nodes.length;
  const unlocked = nodes.filter((n) => unlockedTechs.has(n.id)).length;
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return {
    total,
    unlocked,
    percent,
  };
}

/**
 * Computes unlock progress metrics for a master division.
 */
export function getDivisionStats(
  divisionId: MasterDivisionId,
  unlockedTechs: Set<string>
) {
  const nodes = TECH_NODES_BY_DIVISION[divisionId] || [];
  const total = nodes.length;
  const unlocked = nodes.filter((n) => unlockedTechs.has(n.id)).length;
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return {
    total,
    unlocked,
    percent,
  };
}

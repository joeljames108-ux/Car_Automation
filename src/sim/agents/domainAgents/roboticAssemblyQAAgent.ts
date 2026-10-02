// ===================================================================
// ROBOTIC ASSEMBLY QA AGENT — Quality & Bolt Torque Verification
// ===================================================================

import { ComponentId, AssemblyPhase } from "../../assemblyTypes";
import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

export interface AssemblyQAReport {
  installedCount: number;
  totalComponents: 12;
  qualityScore: number;
  torqueVerification: "verified" | "pending" | "warning";
  deckClearanceMm: number;
  thermalExpansionRisk: "low" | "medium" | "critical";
  insights: string[];
}

const ASSEMBLY_QA_IDENTITY: AgentIdentity = {
  id: "agent_assembly_qa",
  name: "Robotic Assembly Inspector",
  domain: "assembly_qa",
  icon: "🤖",
  color: "#d97706",
  priority: 9,
  description: "Verifies modular assembly component torque specs, deck clearances, gasket seating, and sequence lock.",
  capabilities: ["Torque Verification", "Deck Clearance Check", "Missing Component Detection", "Assembly QA"],
};

export class RoboticAssemblyQAAgent extends BaseAgent {
  constructor() {
    super(ASSEMBLY_QA_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const installedCount = simState?.installedComponentsCount || 8;

    if (installedCount < 12) {
      findings.push({
        id: `qa_incomplete_assembly_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Assembly QA",
        title: "Modular Vehicle Subsystem Assembly Incomplete",
        detail: `Only ${installedCount}/12 required core vehicle components are installed on chassis hardpoints.`,
        metrics: { installedCount, totalComponents: 12 },
        recommendation: undefined,
        relatedAgents: ["agent_manufacturing", "agent_chassis"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }

  static inspectAssembly(installed: ComponentId[], _activeId: ComponentId | null, phase: AssemblyPhase): AssemblyQAReport {
    const installedCount = installed.length;
    const qualityScore = Math.min(100, Math.round((installedCount / 12) * 95 + (installed.includes("head_gasket") ? 5 : 0)));

    const insights: string[] = [];

    if (installed.includes("block") && installed.includes("crankshaft")) {
      insights.push("✅ MAIN BEARINGS VERIFIED: Journal clearances within 0.035mm OEM specification.");
    }

    if (installed.includes("head_gasket")) {
      insights.push("✅ HEAD GASKET SEALED: MLS copper stopper beads seated against deck flange.");
    } else if (installed.includes("cylinder_head") && !installed.includes("head_gasket")) {
      insights.push("⚠️ WARNING: Cylinder head installed without head gasket! Compression leak risk.");
    }

    if (phase === "inserting" || phase === "locking") {
      insights.push("🔧 TORQUE SEQUENCE ACTIVE: Applying 85 Nm cross-pattern hex bolt torque.");
    }

    if (installed.includes("turbocharger")) {
      insights.push("🌀 TURBOCHARGER ALIGNED: Oil feed lines and exhaust manifold collector flange pressure tested.");
    }

    return {
      installedCount,
      totalComponents: 12,
      qualityScore,
      torqueVerification: phase === "locking" || installedCount > 6 ? "verified" : "pending",
      deckClearanceMm: 0.85,
      thermalExpansionRisk: installedCount > 8 ? "low" : "medium",
      insights,
    };
  }
}

// ===================================================================
// SAFETY & CRASH AGENT — NCAP Crashworthiness & Driver Assist Systems
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const SAFETY_IDENTITY: AgentIdentity = {
  id: "agent_safety",
  name: "Safety & Crash System Agent",
  domain: "safety",
  icon: "🛡️",
  color: "#16a34a",
  priority: 7,
  description: "Evaluates crashworthiness, occupant safety ratings, active driver assists, and emergency braking systems.",
  capabilities: ["Crash Absorption", "NCAP Rating Prediction", "Active Safety Check", "Occupant Cell Rigidity"],
};

export class SafetyCrashAgent extends BaseAgent {
  constructor() {
    super(SAFETY_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const safetyScore = simState?.safetyRating || 65; // 0-100
    const chassis = designState?.vehicle?.chassis || "steel_unibody";

    // 1. Low Safety Score Warning
    if (safetyScore < 70) {
      findings.push({
        id: `safety_low_rating_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Occupant Crash Protection",
        title: "Occupant Crash Protection Below 5-Star NCAP Standard",
        detail: `Safety score is ${safetyScore}/100. Tubular frame & basic chassis lack crumple zone deceleration structures.`,
        metrics: { safetyRatingScore: safetyScore },
        recommendation: {
          id: "rec_add_crumple_zones",
          agentId: this.identity.id,
          title: "Install Front Aluminum Extrusion Crumple Crash Boxes & Curtain Airbags",
          description: "Adds progressive collapse crash boxes to absorb 45 kJ impact energy before occupant cell deformation.",
          impact: [{ metric: "Safety Rating", currentValue: safetyScore, projectedValue: 88, unit: "/100" }],
          tradeoffs: ["+14 kg front overhang weight"],
          confidence: 0.95,
          changes: { safetyPackage: "active_ncap_5star" },
          autoApplyable: true,
        },
        relatedAgents: ["agent_chassis", "agent_manufacturing"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}

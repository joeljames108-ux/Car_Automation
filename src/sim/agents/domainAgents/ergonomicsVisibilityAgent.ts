// ===================================================================
// ERGONOMICS & VISIBILITY AGENT — Blind Spot Angles & H-Point Seating
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const ERGONOMICS_IDENTITY: AgentIdentity = {
  id: "agent_ergonomics",
  name: "Ergonomics & Driver Sightlines Specialist",
  domain: "ergonomics",
  icon: "👁️",
  color: "#f59e0b",
  priority: 7,
  description: "Evaluates A-pillar blind spot angles, pedal box alignment, H-point seating height, and steering wheel reach envelopes.",
  capabilities: ["Sightline Raytracing", "H-Point Measurement", "Pedal Box Offset Check", "Reach Envelope Scoring"],
};

export class ErgonomicsVisibilityAgent extends BaseAgent {
  constructor() {
    super(ERGONOMICS_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const interior = designState?.vehicle?.interior || {};

    if (interior?.seatType === "bucket_racing") {
      findings.push({
        id: `ergo_bucket_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "info",
        category: "Occupant Comfort",
        title: "Fixed Back Bucket Seat Ingress Warning",
        detail: "Deep carbon bucket seats improve lateral support (+1.2G), but increase ingress/egress difficulty for daily road use.",
        metrics: { lateralSupportRating: 95 },
        recommendation: {
          id: "rec_ergo_seats",
          agentId: this.identity.id,
          title: "Install 14-Way Adjustable Sport Bucket Seats",
          description: "Retain high bolsters while allowing pneumatic lumbar adjustment and easy ingress.",
          impact: [{ metric: "Daily Comfort Index", currentValue: 40, projectedValue: 82, unit: "pts" }],
          tradeoffs: ["Mass increase +8 kg"],
          confidence: 0.85,
          changes: {},
          autoApplyable: false,
        },
        relatedAgents: ["agent_nvh", "agent_safety"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}

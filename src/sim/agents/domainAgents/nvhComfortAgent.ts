// ===================================================================
// NVH & COMFORT AGENT — Cabin Noise (dB), Vibration & Sound Deadening
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const NVH_IDENTITY: AgentIdentity = {
  id: "agent_nvh",
  name: "NVH & Comfort Engineer",
  domain: "nvh",
  icon: "🎧",
  color: "#a855f7",
  priority: 6,
  description: "Monitors cabin noise levels (dB), engine harmonic vibration, sound deadening, and ride plushness.",
  capabilities: ["Cabin dB Calculation", "Vibration Resonance", "Sound Deadening Optimization", "Ride Quality"],
};

export class NVHComfortAgent extends BaseAgent {
  constructor() {
    super(NVH_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const cabinDb = simState?.cabinDb || 74; // dB at 120 km/h
    const concept = designState?.carConcept || "sport";
    const interior = designState?.vehicle?.interior || {};

    if (concept === "luxury" && cabinDb > 68) {
      findings.push({
        id: `nvh_luxury_violation_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "warning",
        category: "Cabin Acoustic NVH",
        title: "High Cabin Noise (74 dB) Violates Luxury Standards",
        detail: `Cabin noise level at cruising speed is ${cabinDb} dB. Luxury vehicles target under 65 dB for quiet comfort.`,
        metrics: { cabinDbAt120kmh: cabinDb },
        recommendation: {
          id: "rec_add_acoustic_glass",
          agentId: this.identity.id,
          title: "Install Acoustic Laminated Dual-Pane Glass & High-Density Sound Insulation",
          description: "Reduces tire slap and wind roar by -8 dB in the 1kHz to 4kHz speech frequency band.",
          impact: [{ metric: "Cabin Noise Level", currentValue: cabinDb, projectedValue: 64, unit: "dB" }],
          tradeoffs: ["+18 kg mass penalty"],
          confidence: 0.93,
          changes: { soundDeadening: 0.85, glassType: "acoustic_laminated" },
          autoApplyable: true,
        },
        relatedAgents: ["agent_suspension", "agent_economy"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}

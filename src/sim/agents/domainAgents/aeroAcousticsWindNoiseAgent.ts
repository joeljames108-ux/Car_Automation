// ===================================================================
// AERO-ACOUSTICS & WIND NOISE AGENT — Mirror Whistle & Sunroof Buffeting
// ===================================================================

import { BaseAgent, AgentFinding, AgentIdentity } from "../agentFramework";

const AERO_ACOUSTICS_IDENTITY: AgentIdentity = {
  id: "agent_aero_acoustics",
  name: "Aero-Acoustics & Wind Noise Specialist",
  domain: "aero_acoustics",
  icon: "🌬️",
  color: "#f59e0b",
  priority: 5,
  description: "Predicts side-mirror aero whistle, sunroof buffeting resonances, and high-speed A-pillar cabin wind noise.",
  capabilities: ["Side Mirror Whistle Model", "Helmotz Buffeting Frequency", "A-Pillar Vortex Noise", "Glass Acoustic Thickness"],
};

export class AeroAcousticsWindNoiseAgent extends BaseAgent {
  constructor() {
    super(AERO_ACOUSTICS_IDENTITY);
  }

  public analyze(designState: any, simState: any): AgentFinding[] {
    const findings: AgentFinding[] = [];
    const cd = simState?.cdA || 0.32;
    const topSpeedKmh = simState?.topSpeedKmh || 260;

    if (topSpeedKmh > 280) {
      findings.push({
        id: `aero_noise_${Date.now()}`,
        agentId: this.identity.id,
        domain: this.identity.domain,
        severity: "info",
        category: "High-Speed Aero Whistle",
        title: "Side Mirror Vortex Whistle at High Speeds (> 240 km/h)",
        detail: "Standard side mirror housings generate turbulent boundary layer detachment, raising cabin wind noise above 72 dBA.",
        metrics: { cabinWindNoiseDba: 74, speedKmh: topSpeedKmh },
        recommendation: {
          id: "rec_aero_camera_mirrors",
          agentId: this.identity.id,
          title: "Install Aerodynamic Digital Camera Mirrors",
          description: "Replaces bulky physical mirrors with slim winglet cameras, reducing Cd by -0.015 and lowering cabin wind noise by -4 dBA.",
          impact: [
            { metric: "Cabin Noise @ 200 km/h", currentValue: 74, projectedValue: 70, unit: "dBA" },
            { metric: "Drag Coeff (Cd)", currentValue: cd, projectedValue: Math.max(0.25, cd - 0.015), unit: "Cd" },
          ],
          tradeoffs: ["Requires internal OLED pillar displays"],
          confidence: 0.89,
          changes: {},
          autoApplyable: false,
        },
        relatedAgents: ["agent_aerodynamics", "agent_nvh"],
        timestamp: Date.now(),
      });
    }

    return findings;
  }
}

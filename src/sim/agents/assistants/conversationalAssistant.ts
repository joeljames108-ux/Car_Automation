// ===================================================================
// CONVERSATIONAL ASSISTANT — Intent Routing & Agent Synthesis
// ===================================================================

import { AgentOrchestrator, AgentFinding } from "../agentFramework";

export interface AssistantResponse {
  reply: string;
  senderAgentId: string;
  senderName: string;
  senderIcon: string;
  suggestedActions: Array<{ label: string; action: () => void }>;
  relatedFindings: AgentFinding[];
}

export class ConversationalAssistant {
  private orchestrator: AgentOrchestrator = AgentOrchestrator.getInstance();

  /**
   * Process natural language query and route to relevant domain agent
   */
  public processQuery(query: string, designState: any, simState: any): AssistantResponse {
    const q = query.toLowerCase();
    const findings = this.orchestrator.getAggregateFindings();

    // 1. Aerodynamics Query
    if (q.includes("aero") || q.includes("downforce") || q.includes("wing") || q.includes("drag")) {
      const aeroFindings = findings.filter((f) => f.domain === "aerodynamics");
      return {
        reply: `I've routed your aerodynamic inquiry to our Aerodynamics Specialist. Current drag is ${
          simState?.dragCoeff?.toFixed(2) || "0.35"
        } Cd with an aero balance of ${Math.round((simState?.aeroBalance || 0.5) * 100)}% rear.`,
        senderAgentId: "agent_aerodynamics",
        senderName: "Aerodynamics Specialist",
        senderIcon: "🌀",
        suggestedActions: [
          { label: "Optimize Aero Balance", action: () => console.log("Aero balance action triggered") },
        ],
        relatedFindings: aeroFindings,
      };
    }

    // 2. Powertrain / Boost / Knock Query
    if (q.includes("power") || q.includes("hp") || q.includes("boost") || q.includes("knock") || q.includes("engine")) {
      const powerFindings = findings.filter((f) => f.domain === "powertrain");
      return {
        reply: `Chief Powertrain Engineer reporting. Estimated peak output is ${
          simState?.peakPower || 400
        } HP. Boost pressure is set to ${(simState?.boostPressure || 1.2).toFixed(1)} bar.`,
        senderAgentId: "agent_chief_powertrain",
        senderName: "Chief Powertrain Engineer",
        senderIcon: "🏎️",
        suggestedActions: [
          { label: "Apply Track Attack Preset", action: () => console.log("Track attack preset applied") },
        ],
        relatedFindings: powerFindings,
      };
    }

    // 3. Thermal & Cooling Query
    if (q.includes("cool") || q.includes("heat") || q.includes("radiator") || q.includes("temp")) {
      const thermalFindings = findings.filter((f) => f.domain === "thermal");
      return {
        reply: `Thermal Management Expert analyzing cooling capacity. Heat rejection is currently at ${Math.round(
          simState?.heatOutputKw || 120
        )} kW vs ${Math.round(simState?.coolingCapacityKw || 140)} kW capacity.`,
        senderAgentId: "agent_thermal",
        senderName: "Thermal Management Expert",
        senderIcon: "🔥",
        suggestedActions: [],
        relatedFindings: thermalFindings,
      };
    }

    // 4. Default / General Engineering Response
    return {
      reply: `Autonomous AI Engineering Division online. All 15 domain agents are actively monitoring your vehicle build (${findings.length} live diagnostics recorded). Ask me about powertrain boost, suspension geometry, brake thermal capacity, or lap times.`,
      senderAgentId: "agent_chief_powertrain",
      senderName: "Apex Multi-Agent Division",
      senderIcon: "🤖",
      suggestedActions: [],
      relatedFindings: findings.slice(0, 3),
    };
  }
}

// ===================================================================
// AGENT REGISTRY — Central Directory of Autonomous Domain Agents
// ===================================================================
// Manages registration, domain metadata lookup, enable/disable toggles,
// and dependencies across all 15 automotive engineering AI agents.
// ===================================================================

import { BaseAgent, AgentDomain, AgentIdentity } from "./agentFramework";

export interface AgentDescriptor {
  identity: AgentIdentity;
  enabled: boolean;
  category: "powertrain" | "dynamics" | "vehicle" | "racing" | "strategy";
}

export class AgentRegistry {
  private static instance: AgentRegistry;
  private descriptors: Map<string, AgentDescriptor> = new Map();
  private activeAgents: Map<string, BaseAgent> = new Map();

  private constructor() {
    this.registerDefaultMetadata();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Pre-register metadata descriptors for all 15 agents
   */
  private registerDefaultMetadata(): void {
    const defaultAgents: AgentDescriptor[] = [
      {
        identity: {
          id: "agent_chief_powertrain",
          name: "Chief Powertrain Engineer",
          domain: "powertrain",
          icon: "🏎️",
          color: "#ef4444",
          priority: 10,
          description: "Monitors internal combustion stress, knock thresholds, turbo boost, and power output.",
          capabilities: ["ECU Tuning", "Boost Management", "Knock Prevention", "Fuel Map Optimization"],
        },
        enabled: true,
        category: "powertrain",
      },
      {
        identity: {
          id: "agent_aerodynamics",
          name: "Aerodynamics Specialist",
          domain: "aerodynamics",
          icon: "🌀",
          color: "#06b6d4",
          priority: 9,
          description: "Optimizes downforce balance, drag coefficient (Cd), diffuser angle, and high-speed stability.",
          capabilities: ["Cd Calculation", "Aero Balance", "Downforce Tuning", "Flow Separation Warnings"],
        },
        enabled: true,
        category: "dynamics",
      },
      {
        identity: {
          id: "agent_thermal",
          name: "Thermal Management Expert",
          domain: "thermal",
          icon: "🔥",
          color: "#f97316",
          priority: 9,
          description: "Tracks radiator cooling capacity vs engine heat rejection, intercooler heat soak, and brake thermal degradation.",
          capabilities: ["Cooling Balance", "Heat Soak Prediction", "Radiator Sizing", "Brake Temperature Modeling"],
        },
        enabled: true,
        category: "powertrain",
      },
      {
        identity: {
          id: "agent_suspension",
          name: "Suspension Dynamics Agent",
          domain: "suspension",
          icon: "📐",
          color: "#8b5cf6",
          priority: 8,
          description: "Evaluates spring rates, damping coefficients, camber gain, and roll centre heights for optimal grip.",
          capabilities: ["Geometry Optimization", "Roll Resistance", "Damping Curves", "Ride Height Adjustment"],
        },
        enabled: true,
        category: "dynamics",
      },
      {
        identity: {
          id: "agent_brakes",
          name: "Brake System Engineer",
          domain: "brakes",
          icon: "🛑",
          color: "#dc2626",
          priority: 8,
          description: "Monitors brake bias balance, rotor thermal capacity, friction coefficients, and stopping distances.",
          capabilities: ["Bias Calculation", "Thermal Capacity Check", "Fade Risk Analysis", "Deceleration Modeling"],
        },
        enabled: true,
        category: "dynamics",
      },
      {
        identity: {
          id: "agent_chassis",
          name: "Chassis Structural Agent",
          domain: "chassis",
          icon: "🏗️",
          color: "#64748b",
          priority: 8,
          description: "Verifies chassis torsional rigidity, mounting hardpoint stress, mass distribution, and structural integrity.",
          capabilities: ["Rigidity Analysis", "Stress Distribution", "Weight Bias Calculation", "Material Selection"],
        },
        enabled: true,
        category: "vehicle",
      },
      {
        identity: {
          id: "agent_economy",
          name: "Economy & Cost Analyst",
          domain: "economy",
          icon: "💵",
          color: "#10b981",
          priority: 7,
          description: "Tracks bill-of-materials cost, production pricing targets, market segment profitability, and value metrics.",
          capabilities: ["BOM Cost Tracking", "Margin Calculation", "Market Positioning", "Budget Target Alerts"],
        },
        enabled: true,
        category: "strategy",
      },
      {
        identity: {
          id: "agent_electronics",
          name: "Electronics & EV Systems Agent",
          domain: "electronics",
          icon: "⚡",
          color: "#0284c7",
          priority: 7,
          description: "Supervises 800V inverter efficiency, battery cell thermal balancing, motor placement, and EV regen curves.",
          capabilities: ["Battery Management", "Inverter Efficiency", "Regen Curve Tuning", "Infotainment Power Load"],
        },
        enabled: true,
        category: "powertrain",
      },
      {
        identity: {
          id: "agent_manufacturing",
          name: "Manufacturing Line QA Agent",
          domain: "manufacturing",
          icon: "🏭",
          color: "#d97706",
          priority: 7,
          description: "Predicts assembly cycle time, defect rates, component complexity risk, and tooling requirements.",
          capabilities: ["Defect Rate Scoring", "Assembly Cycle Time", "Tolerance Check", "Tooling Feasibility"],
        },
        enabled: true,
        category: "vehicle",
      },
      {
        identity: {
          id: "agent_safety",
          name: "Safety & Crash System Agent",
          domain: "safety",
          icon: "🛡️",
          color: "#16a34a",
          priority: 7,
          description: "Evaluates crashworthiness, occupant safety ratings, active driver assists, and emergency braking systems.",
          capabilities: ["Crash Absorption", "NCAP Rating Prediction", "Active Safety Check", "Occupant Cell Rigidity"],
        },
        enabled: true,
        category: "vehicle",
      },
      {
        identity: {
          id: "agent_nvh",
          name: "NVH & Comfort Engineer",
          domain: "nvh",
          icon: "🎧",
          color: "#a855f7",
          priority: 6,
          description: "Monitors cabin noise levels (dB), engine harmonic vibration, sound deadening, and ride plushness.",
          capabilities: ["Cabin dB Calculation", "Vibration Resonance", "Sound Deadening Optimization", "Ride Quality"],
        },
        enabled: true,
        category: "vehicle",
      },
      {
        identity: {
          id: "agent_tyres",
          name: "Tyre Compound Strategist",
          domain: "tyres",
          icon: "🛞",
          color: "#eab308",
          priority: 8,
          description: "Optimizes tyre compound selection, thermal operating window, wear rate per lap, and contact patch friction.",
          capabilities: ["Compound Matching", "Wear Rate Prediction", "Thermal Window Monitoring", "Grip Coefficient"],
        },
        enabled: true,
        category: "racing",
      },
      {
        identity: {
          id: "agent_race_strategy",
          name: "Race Operations Strategist",
          domain: "race_strategy",
          icon: "🏁",
          color: "#f43f5e",
          priority: 9,
          description: "Simulates circuit lap times (Nürburgring, Spa, Le Mans), fuel burn rates, optimal pit windows, and pace.",
          capabilities: ["Circuit Lap Prediction", "Pit Strategy", "Fuel Burn Rate", "Pace Optimization"],
        },
        enabled: true,
        category: "racing",
      },
      {
        identity: {
          id: "agent_assembly_qa",
          name: "Robotic Assembly Inspector",
          domain: "assembly_qa",
          icon: "🤖",
          color: "#3b82f6",
          priority: 9,
          description: "Verifies modular assembly component torque specs, deck clearances, gasket seating, and sequence lock.",
          capabilities: ["Torque Verification", "Deck Clearance Check", "Missing Component Detection", "Assembly QA"],
        },
        enabled: true,
        category: "vehicle",
      },
      {
        identity: {
          id: "agent_rival_strategist",
          name: "AI Rival Market Intelligence Agent",
          domain: "rival_strategy",
          icon: "👁️",
          color: "#ec4899",
          priority: 6,
          description: "Monitors competitor companies (Apex Motors, Volta EV, Meridian), tech levels, and market launch tactics.",
          capabilities: ["Competitor Benchmarking", "Tech Level Tracking", "Market Share Analysis", "Rival Strategy"],
        },
        enabled: true,
        category: "strategy",
      },
    ];

    defaultAgents.forEach((desc) => {
      this.descriptors.set(desc.identity.id, desc);
    });
  }

  public registerAgentInstance(agent: BaseAgent): void {
    this.activeAgents.set(agent.identity.id, agent);
  }

  public getDescriptor(agentId: string): AgentDescriptor | undefined {
    return this.descriptors.get(agentId);
  }

  public getDescriptorByDomain(domain: AgentDomain): AgentDescriptor | undefined {
    return Array.from(this.descriptors.values()).find((d) => d.identity.domain === domain);
  }

  public getAllDescriptors(): AgentDescriptor[] {
    return Array.from(this.descriptors.values());
  }

  public getActiveAgent(agentId: string): BaseAgent | undefined {
    return this.activeAgents.get(agentId);
  }

  public setAgentEnabled(agentId: string, enabled: boolean): void {
    const desc = this.descriptors.get(agentId);
    if (desc) {
      desc.enabled = enabled;
    }
  }

  public isAgentEnabled(agentId: string): boolean {
    const desc = this.descriptors.get(agentId);
    return desc ? desc.enabled : false;
  }
}

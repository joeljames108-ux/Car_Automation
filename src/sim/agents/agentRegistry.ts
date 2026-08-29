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
          color: "#f59e0b",
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
          color: "#f59e0b",
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
          color: "#f59e0b",
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
          color: "#d97706",
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
          color: "#d97706",
          priority: 6,
          description: "Monitors competitor companies (Apex Motors, Volta EV, Meridian), tech levels, and market launch tactics.",
          capabilities: ["Competitor Benchmarking", "Tech Level Tracking", "Market Share Analysis", "Rival Strategy"],
        },
        enabled: true,
        category: "strategy",
      },
      {
        identity: {
          id: "agent_transmission",
          name: "Transmission & Drivetrain Engineer",
          domain: "transmission",
          icon: "⚙️",
          color: "#d97706",
          priority: 8,
          description: "Optimizes dual-clutch shift speed, gear ratio steps, LSD lockup percentage, and gearbox oil cooling.",
          capabilities: ["Gear Ratio Tuning", "LSD Lockup Balancing", "Shift Speed Calibration", "Gearbox Oil Temp Monitoring"],
        },
        enabled: true,
        category: "powertrain",
      },
      {
        identity: {
          id: "agent_infotainment_ux",
          name: "Cockpit UX & HMI Systems Engineer",
          domain: "infotainment_ux",
          icon: "🖥️",
          color: "#f59e0b",
          priority: 6,
          description: "Monitors digital cockpit display latency, telemetry widget density, driver UI interaction friction, and OTA updates.",
          capabilities: ["HMI Latency Check", "Widget Density Optimization", "Driver Distraction Index", "OTA Risk Audit"],
        },
        enabled: true,
        category: "vehicle",
      },
      {
        identity: {
          id: "agent_ergonomics",
          name: "Ergonomics & Driver Sightlines Specialist",
          domain: "ergonomics",
          icon: "👁️",
          color: "#f59e0b",
          priority: 7,
          description: "Evaluates A-pillar blind spot angles, pedal box alignment, H-point seating height, and steering wheel reach envelopes.",
          capabilities: ["Sightline Raytracing", "H-Point Measurement", "Pedal Box Offset Check", "Reach Envelope Scoring"],
        },
        enabled: true,
        category: "vehicle",
      },
      {
        identity: {
          id: "agent_homologation",
          name: "Homologation & Regulatory Compliance Officer",
          domain: "homologation",
          icon: "📜",
          color: "#f59e0b",
          priority: 9,
          description: "Checks global road compliance including US FMVSS crash rules, EU WLTP emissions, UNECE pass-by noise, and Japan light rules.",
          capabilities: ["FMVSS Compliance", "WLTP Emissions Check", "Pass-by Noise Limit Audit", "Lighting & Bumper Height Rules"],
        },
        enabled: true,
        category: "strategy",
      },
      {
        identity: {
          id: "agent_supply_chain",
          name: "Supply Chain Resilience Strategist",
          domain: "supply_chain",
          icon: "📦",
          color: "#64748b",
          priority: 5,
          description: "Tracks raw material scarcity (Lithium, Neodymium, Carbon tow, Titanium), supplier lead-time bottlenecks, and tariff impacts.",
          capabilities: ["Material Risk Index", "Supplier Lead Time Audit", "Single-Source Vendor Check", "Tariff Exposure Calc"],
        },
        enabled: true,
        category: "strategy",
      },
      {
        identity: {
          id: "agent_predictive_maint",
          name: "Predictive Telemetry & Diagnostics Specialist",
          domain: "predictive_maint",
          icon: "📡",
          color: "#10b981",
          priority: 6,
          description: "Analyzes bearing vibration FFT frequencies, sensor noise, oil breakdown curves, and service interval predictions.",
          capabilities: ["FFT Vibration Spectrum", "Oil Shear Degradation", "Sensor Drift Detection", "Service Interval Model"],
        },
        enabled: true,
        category: "powertrain",
      },
      {
        identity: {
          id: "agent_pit_operations",
          name: "Pit Stop & Track Operations Engineer",
          domain: "pit_operations",
          icon: "⏱️",
          color: "#d97706",
          priority: 7,
          description: "Simulates pit lane crew reaction times, wheel nut gun speed, jackman synchronization, and pit traffic releases.",
          capabilities: ["Pit Duration Model", "Wheel Nut Torque Speed", "Jackman Sync Timing", "Traffic Release Window"],
        },
        enabled: true,
        category: "racing",
      },
      {
        identity: {
          id: "agent_aero_acoustics",
          name: "Aero-Acoustics & Wind Noise Specialist",
          domain: "aero_acoustics",
          icon: "🌬️",
          color: "#f59e0b",
          priority: 5,
          description: "Predicts side-mirror aero whistle, sunroof buffeting resonances, and high-speed A-pillar cabin wind noise.",
          capabilities: ["Side Mirror Whistle Model", "Helmotz Buffeting Frequency", "A-Pillar Vortex Noise", "Glass Acoustic Thickness"],
        },
        enabled: true,
        category: "dynamics",
      },
      {
        identity: {
          id: "agent_battery_life",
          name: "Battery Degradation & Cell Chemistry Specialist",
          domain: "battery_life",
          icon: "🔋",
          color: "#14b8a6",
          priority: 8,
          description: "Models EV battery State-of-Health (SoH), fast-charging C-rate thermal stress, dendrite risk, and 10-year capacity retention.",
          capabilities: ["SoH Degradation Curve", "Fast-Charge C-Rate Model", "Dendrite Formation Audit", "10-Year Capacity Retention"],
        },
        enabled: true,
        category: "powertrain",
      },
      {
        identity: {
          id: "agent_sponsor_roi",
          name: "Motorsport Sponsor & Marketing Strategist",
          domain: "sponsor_roi",
          icon: "🎯",
          color: "#f43f5e",
          priority: 4,
          description: "Evaluates team livery brand placement exposure, sponsor ROI metrics, fan engagement, and contract value optimization.",
          capabilities: ["Livery Brand Exposure", "Sponsor Valuation Model", "TV Broadcast Airtime Scoring", "Fan Metric Index"],
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

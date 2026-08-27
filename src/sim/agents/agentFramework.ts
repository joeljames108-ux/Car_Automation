// ===================================================================
// AGENT FRAMEWORK — Autonomous Multi-Agent Engineering Architecture
// ===================================================================
// Core foundation for all 15 specialized domain agents and assistants.
// Defines agent lifecycle, state machine, memory store, and central orchestrator.
// ===================================================================

import { AgentMessageBus, AgentMessage, MessagePriority } from "./agentMessageBus";

export type AgentDomain =
  | "powertrain"
  | "aerodynamics"
  | "thermal"
  | "suspension"
  | "brakes"
  | "chassis"
  | "economy"
  | "electronics"
  | "manufacturing"
  | "safety"
  | "nvh"
  | "tyres"
  | "race_strategy"
  | "assembly_qa"
  | "rival_strategy"
  | "transmission"
  | "infotainment_ux"
  | "ergonomics"
  | "homologation"
  | "supply_chain"
  | "predictive_maint"
  | "pit_operations"
  | "aero_acoustics"
  | "battery_life"
  | "sponsor_roi";

export type AgentState = "idle" | "analyzing" | "recommending" | "waiting" | "alert";

export interface AgentIdentity {
  id: string;
  name: string;
  domain: AgentDomain;
  icon: string; // Emoji or SVG icon token
  color: string; // Tailwind/HEX color string
  priority: number; // 1 - 10 (10 = critical system priority)
  description: string;
  capabilities: string[];
}

export interface AgentRecommendation {
  id: string;
  agentId: string;
  title: string;
  description: string;
  impact: Array<{
    metric: string;
    currentValue: number;
    projectedValue: number;
    unit: string;
  }>;
  tradeoffs: string[];
  confidence: number; // 0.0 - 1.0 (1.0 = 100% confidence)
  changes: Record<string, any>; // Parameter modifications
  autoApplyable: boolean;
}

export interface AgentFinding {
  id: string;
  agentId: string;
  domain: AgentDomain;
  severity: "info" | "warning" | "critical";
  category: string;
  title: string;
  detail: string;
  metrics: Record<string, number>;
  recommendation?: AgentRecommendation;
  relatedAgents: string[];
  timestamp: number;
}

export interface AgentMemoryEntry {
  timestamp: number;
  designHash: string;
  findingsCount: number;
  criticalCount: number;
  appliedRecommendations: string[];
}

// -------------------------------------------------------------------
// AGENT MEMORY STORE — Sliding Window Context History
// -------------------------------------------------------------------

export class AgentMemoryStore {
  private history: AgentMemoryEntry[] = [];
  private appliedRecommendationIds: Set<string> = new Set();
  private maxEntries = 50;

  public recordCycle(designHash: string, findings: AgentFinding[]): void {
    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    this.history.push({
      timestamp: Date.now(),
      designHash,
      findingsCount: findings.length,
      criticalCount,
      appliedRecommendations: Array.from(this.appliedRecommendationIds),
    });

    if (this.history.length > this.maxEntries) {
      this.history.shift();
    }
  }

  public recordAppliedRecommendation(recId: string): void {
    this.appliedRecommendationIds.add(recId);
  }

  public hasApplied(recId: string): boolean {
    return this.appliedRecommendationIds.has(recId);
  }

  public getHistory(): AgentMemoryEntry[] {
    return [...this.history];
  }
}

// -------------------------------------------------------------------
// ABSTRACT BASE AGENT — Standard Contract for all 15 Domain Agents
// -------------------------------------------------------------------

export abstract class BaseAgent {
  public readonly identity: AgentIdentity;
  protected state: AgentState = "idle";
  protected findings: AgentFinding[] = [];
  protected memory: AgentMemoryStore = new AgentMemoryStore();
  protected bus: AgentMessageBus = AgentMessageBus.getInstance();
  protected unsubscribeBus?: () => void;

  constructor(identity: AgentIdentity) {
    this.identity = identity;
    this.subscribeToMessageBus();
  }

  /**
   * Subscribe agent to topics relevant to its domain
   */
  protected subscribeToMessageBus(): void {
    this.unsubscribeBus = this.bus.subscribe(`agent.${this.identity.domain}.*`, (msg) => {
      this.handleIncomingMessage(msg);
    });
  }

  /**
   * Handle incoming bus messages targeting this agent's domain
   */
  protected handleIncomingMessage(msg: AgentMessage): void {
    if (msg.toAgentId === this.identity.id || msg.toAgentId === "broadcast") {
      this.onMessage(msg);
    }
  }

  /**
   * Override in child agents to handle specific custom incoming messages
   */
  protected onMessage(_msg: AgentMessage): void {
    // Default implementation can be extended by child classes
  }

  /**
   * Core analysis method — must be implemented by each domain agent
   */
  public abstract analyze(designState: any, simState: any): AgentFinding[];

  /**
   * Execution lifecycle step triggered by Orchestrator
   */
  public runCycle(designState: any, simState: any): AgentFinding[] {
    this.state = "analyzing";
    const start = performance.now();

    try {
      this.findings = this.analyze(designState, simState);
      const hasCritical = this.findings.some((f) => f.severity === "critical");
      const hasWarning = this.findings.some((f) => f.severity === "warning");

      this.state = hasCritical ? "alert" : hasWarning ? "recommending" : "idle";

      // Create design state signature to record memory cycle
      const designHash = JSON.stringify({
        engineLayout: designState?.engine?.layout,
        chassis: designState?.vehicle?.chassis,
        weight: simState?.weight,
      });

      this.memory.recordCycle(designHash, this.findings);

      // Broadcast findings if critical
      if (hasCritical) {
        this.bus.publish({
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          fromAgentId: this.identity.id,
          toAgentId: "broadcast",
          type: "alert",
          priority: "critical",
          topic: `agent.${this.identity.domain}.alert`,
          payload: { findings: this.findings.filter((f) => f.severity === "critical") },
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error(`[BaseAgent:${this.identity.id}] Analysis failed:`, err);
      this.state = "idle";
    }

    return this.findings;
  }

  public getState(): AgentState {
    return this.state;
  }

  public getLatestFindings(): AgentFinding[] {
    return [...this.findings];
  }

  public getMemoryStore(): AgentMemoryStore {
    return this.memory;
  }

  public destroy(): void {
    if (this.unsubscribeBus) {
      this.unsubscribeBus();
    }
  }
}

// -------------------------------------------------------------------
// AGENT ORCHESTRATOR — Central Tick Scheduler & Multi-Agent Manager
// -------------------------------------------------------------------

export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private agents: Map<string, BaseAgent> = new Map();
  private isRunning = false;
  private intervalId: any = null;
  private tickRateMs = 6000; // Default 6 seconds (optimized for 60fps UI responsiveness)
  private lastCycleFindings: Map<string, AgentFinding[]> = new Map();

  private constructor() {}

  public static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  public registerAgent(agent: BaseAgent): void {
    if (this.agents.has(agent.identity.id)) return;
    this.agents.set(agent.identity.id, agent);
  }

  public unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.destroy();
      this.agents.delete(agentId);
    }
  }

  public getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  public getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values()).sort((a, b) => b.identity.priority - a.identity.priority);
  }

  private lastStateHash = "";

  public start(getDesignState: () => any, getSimState: () => any): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run initial tick when idle after initial UI render completes smoothly
    const startInitialTick = () => {
      if (this.isRunning) {
        this.tick(getDesignState(), getSimState());
      }
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(startInitialTick, { timeout: 1500 });
    } else {
      setTimeout(startInitialTick, 1200);
    }

    this.intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) {
        return; // Skip tick when browser tab is inactive
      }
      this.tick(getDesignState(), getSimState());
    }, this.tickRateMs);
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Execute single synchronous analysis cycle across all registered agents with state fingerprint memoization
   */
  public tick(designState: any, simState: any): Map<string, AgentFinding[]> {
    if (!designState || !simState) return this.lastCycleFindings;

    const eng = designState.engine;
    const veh = designState.vehicle;
    const stateHash = `${eng?.layout}_${eng?.bore}_${eng?.stroke}_${eng?.boostPressure}_${veh?.chassis}_${veh?.driveType}_${simState?.peakPower}_${simState?.weight}_${simState?.topSpeed}_${simState?.dragCoeff}`;

    // Skip redundant agent iterations if vehicle state has not changed
    if (stateHash === this.lastStateHash && this.lastCycleFindings.size > 0) {
      return this.lastCycleFindings;
    }
    this.lastStateHash = stateHash;

    const allFindings = new Map<string, AgentFinding[]>();

    // Execute agents in priority order
    const sortedAgents = this.getAllAgents();
    for (const agent of sortedAgents) {
      const findings = agent.runCycle(designState, simState);
      allFindings.set(agent.identity.id, findings);
    }

    this.lastCycleFindings = allFindings;
    return allFindings;
  }

  public getLastFindings(): Map<string, AgentFinding[]> {
    return this.lastCycleFindings;
  }

  public getAggregateFindings(): AgentFinding[] {
    const aggregate: AgentFinding[] = [];
    this.lastCycleFindings.forEach((findings) => {
      aggregate.push(...findings);
    });
    return aggregate;
  }

  public setTickRate(ms: number): void {
    this.tickRateMs = Math.max(500, ms);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

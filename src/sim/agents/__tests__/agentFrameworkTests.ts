// ===================================================================
// AUTOMATED TEST SUITE — Autonomous AI Agent Framework
// ===================================================================

import { AgentMessageBus } from "../agentMessageBus";
import { AgentMemoryStore, AgentOrchestrator } from "../agentFramework";
import { AeroDynamicsAgent } from "../domainAgents/aeroDynamicsAgent";
import { ThermalManagementAgent } from "../domainAgents/thermalManagementAgent";
import { SuspensionDynamicsAgent } from "../domainAgents/suspensionDynamicsAgent";
import { BrakeDesignAgent } from "../domainAgents/brakeDesignAgent";
import { ChassisStructuralAgent } from "../domainAgents/chassisStructuralAgent";

export interface AgentTestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export class AgentFrameworkTestRunner {
  private results: AgentTestResult[] = [];

  private runTest(suite: string, name: string, fn: () => void): void {
    const start = performance.now();
    try {
      fn();
      this.results.push({
        suite,
        name,
        passed: true,
        durationMs: performance.now() - start,
      });
    } catch (err: any) {
      this.results.push({
        suite,
        name,
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - start,
      });
    }
  }

  public executeAllTests(): AgentTestResult[] {
    this.results = [];

    // --- Suite 1: Message Bus Pub/Sub & Wildcards ---
    this.runTest("MessageBus", "Publishes and receives messages on specific and wildcard topics", () => {
      const bus = AgentMessageBus.getInstance();
      bus.clear();
      let receivedCount = 0;

      bus.subscribe("agent.powertrain.*", (msg) => {
        receivedCount++;
      });

      bus.publish({
        id: "m1",
        fromAgentId: "test",
        toAgentId: "broadcast",
        type: "alert",
        priority: "high",
        topic: "agent.powertrain.knock",
        payload: {},
        timestamp: Date.now(),
      });

      if (receivedCount !== 1) {
        throw new Error(`Expected 1 message, got ${receivedCount}`);
      }
    });

    // --- Suite 2: Agent Memory Store ---
    this.runTest("MemoryStore", "Records cycle entries and caps sliding window size", () => {
      const store = new AgentMemoryStore();
      for (let i = 0; i < 60; i++) {
        store.recordCycle(`hash_${i}`, []);
      }

      const history = store.getHistory();
      if (history.length > 50) {
        throw new Error(`Memory store exceeded max cap of 50: got ${history.length}`);
      }
    });

    // --- Suite 3: Domain Agent Diagnostics ---
    this.runTest("AeroDynamicsAgent", "Detects high drag coefficient penalty and recommends wing angle adjustment", () => {
      const agent = new AeroDynamicsAgent();
      const findings = agent.analyze({ vehicle: { aero: { dragCoeff: 0.45 } } }, { dragCoeff: 0.45 });

      if (findings.length === 0) {
        throw new Error("Aero agent failed to generate high drag warning");
      }
      if (findings[0].severity !== "warning") {
        throw new Error("Incorrect severity level");
      }
    });

    this.runTest("ThermalManagementAgent", "Detects engine overheating when heat output exceeds cooling capacity", () => {
      const agent = new ThermalManagementAgent();
      const findings = agent.analyze({}, { coolingMargin: 0.2, heatOutputKw: 200, coolingCapacityKw: 150 });

      if (findings.length === 0 || findings[0].severity !== "critical") {
        throw new Error("Thermal agent failed to trigger critical overheat alert");
      }
    });

    this.runTest("BrakeDesignAgent", "Detects brake thermal overload on solid disc setup for high power car", () => {
      const agent = new BrakeDesignAgent();
      const findings = agent.analyze({ vehicle: { brakes: "solid_disc" } }, { power: 500, weight: 1700 });

      if (findings.length === 0 || findings[0].severity !== "critical") {
        throw new Error("Brake agent failed to detect brake thermal overload");
      }
    });

    // --- Suite 4: Agent Orchestrator ---
    this.runTest("AgentOrchestrator", "Registers domain agents and executes synchronized analysis tick", () => {
      const orchestrator = AgentOrchestrator.getInstance();
      const aeroAgent = new AeroDynamicsAgent();
      const thermalAgent = new ThermalManagementAgent();

      orchestrator.registerAgent(aeroAgent);
      orchestrator.registerAgent(thermalAgent);

      const allFindings = orchestrator.tick({ vehicle: { aero: { dragCoeff: 0.44 } } }, { dragCoeff: 0.44 });

      if (allFindings.size < 2) {
        throw new Error(`Expected at least 2 agent results, got ${allFindings.size}`);
      }
    });

    return this.results;
  }
}

// ===================================================================
// ZUSTAND AGENT STORE — Global Agent State & Orchestrator Control
// ===================================================================

import { create } from "zustand";
import { AgentOrchestrator, AgentFinding, AgentRecommendation, BaseAgent } from "../sim/agents/agentFramework";
import { AgentRegistry } from "../sim/agents/agentRegistry";

interface AgentStore {
  isOrchestratorRunning: boolean;
  tickRateMs: number;
  aggregateFindings: AgentFinding[];
  activeAgents: BaseAgent[];
  enabledAgentIds: Set<string>;

  // Actions
  startOrchestrator: (getDesignState: () => any, getSimState: () => any) => void;
  stopOrchestrator: () => void;
  runManualTick: (designState: any, simState: any) => void;
  setTickRate: (ms: number) => void;
  toggleAgentEnabled: (agentId: string) => void;
}

export const useAgentStore = create<AgentStore>((set: any, get: any) => {
  const orchestrator = AgentOrchestrator.getInstance();
  const registry = AgentRegistry.getInstance();

  return {
    isOrchestratorRunning: false,
    tickRateMs: 2000,
    aggregateFindings: [],
    activeAgents: orchestrator.getAllAgents(),
    enabledAgentIds: new Set(registry.getAllDescriptors().filter((d) => d.enabled).map((d) => d.identity.id)),

    startOrchestrator: (getDesignState: () => any, getSimState: () => any) => {
      orchestrator.start(getDesignState, getSimState);
      set({ isOrchestratorRunning: true });
    },

    stopOrchestrator: () => {
      orchestrator.stop();
      set({ isOrchestratorRunning: false });
    },

    runManualTick: (designState: any, simState: any) => {
      orchestrator.tick(designState, simState);
      set({
        aggregateFindings: orchestrator.getAggregateFindings(),
        activeAgents: orchestrator.getAllAgents(),
      });
    },

    setTickRate: (ms: number) => {
      orchestrator.setTickRate(ms);
      set({ tickRateMs: ms });
    },

    toggleAgentEnabled: (agentId: string) => {
      const isEnabled = registry.isAgentEnabled(agentId);
      registry.setAgentEnabled(agentId, !isEnabled);

      const nextSet = new Set(get().enabledAgentIds);
      if (isEnabled) {
        nextSet.delete(agentId);
      } else {
        nextSet.add(agentId);
      }
      set({ enabledAgentIds: nextSet });
    },
  };
});

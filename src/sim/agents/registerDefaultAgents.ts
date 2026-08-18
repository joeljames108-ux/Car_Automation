// ===================================================================
// DEFAULT DOMAIN AGENTS REGISTRATION HELPER
// ===================================================================
// Centralizes initialization of all 25 autonomous AI domain agents.
// ===================================================================

import { AgentOrchestrator } from "./agentFramework";
import { ChiefPowertrainAgent, RoboticAssemblyQAAgent, RaceStrategyAgent } from "./apexAgentEngine";
import { AeroDynamicsAgent } from "./domainAgents/aeroDynamicsAgent";
import { ThermalManagementAgent } from "./domainAgents/thermalManagementAgent";
import { SuspensionDynamicsAgent } from "./domainAgents/suspensionDynamicsAgent";
import { BrakeDesignAgent } from "./domainAgents/brakeDesignAgent";
import { ChassisStructuralAgent } from "./domainAgents/chassisStructuralAgent";
import { EconomyCostAgent } from "./domainAgents/economyCostAgent";
import { ElectronicsEVAgent } from "./domainAgents/electronicsEVAgent";
import { ManufacturingAgent } from "./domainAgents/manufacturingAgent";
import { SafetyCrashAgent } from "./domainAgents/safetyCrashAgent";
import { NVHComfortAgent } from "./domainAgents/nvhComfortAgent";
import { TyreStrategyAgent } from "./domainAgents/tyreStrategyAgent";
import { RivalStrategistAgent } from "./domainAgents/rivalStrategistAgent";
import { TransmissionDrivetrainAgent } from "./domainAgents/transmissionDrivetrainAgent";
import { InfotainmentUXAgent } from "./domainAgents/infotainmentUXAgent";
import { ErgonomicsVisibilityAgent } from "./domainAgents/ergonomicsVisibilityAgent";
import { HomologationRegulatoryAgent } from "./domainAgents/homologationRegulatoryAgent";
import { SupplyChainResilienceAgent } from "./domainAgents/supplyChainResilienceAgent";
import { TelemetryPredictiveMaintenanceAgent } from "./domainAgents/telemetryPredictiveMaintenanceAgent";
import { PitStopOperationsAgent } from "./domainAgents/pitStopOperationsAgent";
import { AeroAcousticsWindNoiseAgent } from "./domainAgents/aeroAcousticsWindNoiseAgent";
import { BatteryDegradationLifeAgent } from "./domainAgents/batteryDegradationLifeAgent";
import { MotorsportSponsorROIAgent } from "./domainAgents/motorsportSponsorROIAgent";

/**
 * Registers all 25 autonomous engineering domain agents with the orchestrator.
 */
export function registerAllDomainAgents(orchestrator: AgentOrchestrator = AgentOrchestrator.getInstance()): void {
  orchestrator.registerAgent(new ChiefPowertrainAgent());
  orchestrator.registerAgent(new AeroDynamicsAgent());
  orchestrator.registerAgent(new ThermalManagementAgent());
  orchestrator.registerAgent(new SuspensionDynamicsAgent());
  orchestrator.registerAgent(new BrakeDesignAgent());
  orchestrator.registerAgent(new ChassisStructuralAgent());
  orchestrator.registerAgent(new EconomyCostAgent());
  orchestrator.registerAgent(new ElectronicsEVAgent());
  orchestrator.registerAgent(new ManufacturingAgent());
  orchestrator.registerAgent(new SafetyCrashAgent());
  orchestrator.registerAgent(new NVHComfortAgent());
  orchestrator.registerAgent(new TyreStrategyAgent());
  orchestrator.registerAgent(new RaceStrategyAgent());
  orchestrator.registerAgent(new RoboticAssemblyQAAgent());
  orchestrator.registerAgent(new RivalStrategistAgent());
  orchestrator.registerAgent(new TransmissionDrivetrainAgent());
  orchestrator.registerAgent(new InfotainmentUXAgent());
  orchestrator.registerAgent(new ErgonomicsVisibilityAgent());
  orchestrator.registerAgent(new HomologationRegulatoryAgent());
  orchestrator.registerAgent(new SupplyChainResilienceAgent());
  orchestrator.registerAgent(new TelemetryPredictiveMaintenanceAgent());
  orchestrator.registerAgent(new PitStopOperationsAgent());
  orchestrator.registerAgent(new AeroAcousticsWindNoiseAgent());
  orchestrator.registerAgent(new BatteryDegradationLifeAgent());
  orchestrator.registerAgent(new MotorsportSponsorROIAgent());
}

// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — VITEST SUITE
// ============================================================================

import { describe, it, expect } from "vitest";
import { F1_SOCKET_ANCHORS, type F1SocketId } from "../modular/f1Sockets";
import { F1ComponentRegistry } from "../modular/f1ComponentRegistry";
import { F1AttachmentGraph, type F1AssemblyInstalledMap } from "../modular/f1AttachmentGraph";
import { createInitialInstalledMap } from "../state/f1AssemblyStore";

describe("Formula 1 Modular Vehicle Assembly & Attachment Graph", () => {
  it("registers 20 master F1 socket anchors and complete component catalog", () => {
    const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];
    expect(allSockets.length).toBe(20);

    const allComponents = F1ComponentRegistry.getAllComponents();
    expect(allComponents.length).toBeGreaterThanOrEqual(20);

    for (const socketId of allSockets) {
      const parts = F1ComponentRegistry.getComponentsForSocket(socketId);
      expect(parts.length).toBeGreaterThanOrEqual(1);
      const standardPart = parts.find((p) => p.isFactoryStandard);
      expect(standardPart).toBeDefined();
    }
  });

  it("detects bare chassis incomplete status and missing mandatory sockets", () => {
    const bareMap = createInitialInstalledMap(true);
    const bareMetrics = F1AttachmentGraph.evaluateAssembly(bareMap);

    expect(bareMetrics.completionPercentage).toBeLessThan(100);
    expect(bareMetrics.isCompleteAndLegal).toBe(false);
    expect(bareMetrics.missingMandatorySockets.length).toBe(19);
    expect(bareMetrics.missingMandatorySockets).toContain("SOCKET_FRONT_WING");
    expect(bareMetrics.missingMandatorySockets).toContain("SOCKET_POWER_UNIT");
  });

  it("enforces structural mounting dependencies before component installation", () => {
    const emptyMap: F1AssemblyInstalledMap = {};
    const frontWingComp = F1ComponentRegistry.getComponent("FRONT_WING_OUTWASH_4_ELEMENT")!;
    const canInstallCheck = F1AttachmentGraph.canInstallComponent(frontWingComp, emptyMap);

    expect(canInstallCheck.canInstall).toBe(false);
    expect(canInstallCheck.reason).toContain("Nose Cone");
  });

  it("aggregates physical metrics for a complete factory works car", () => {
    const fullMap = createInitialInstalledMap(false);
    const fullMetrics = F1AttachmentGraph.evaluateAssembly(fullMap);

    expect(fullMetrics.completionPercentage).toBe(100);
    expect(fullMetrics.missingMandatorySockets.length).toBe(0);
    expect(fullMetrics.totalMassKg).toBeGreaterThanOrEqual(798);
    expect(fullMetrics.totalPeakHorsepower).toBeGreaterThanOrEqual(1000);
    expect(fullMetrics.totalDownforceAt250KmhKg).toBeGreaterThanOrEqual(2500);
    expect(fullMetrics.frontWeightDistributionPercent).toBeGreaterThanOrEqual(44);
    expect(fullMetrics.frontWeightDistributionPercent).toBeLessThanOrEqual(52);
    expect(fullMetrics.isCompleteAndLegal).toBe(true);
  });
});

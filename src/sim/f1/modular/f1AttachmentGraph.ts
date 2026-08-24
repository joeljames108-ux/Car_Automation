// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — ATTACHMENT GRAPH & AGGREGATION SOLVER
// ============================================================================
// Solves hierarchical dependencies, calculates exact vehicle mass and 3D CG,
// aggregates aerodynamic loads, and validates structural completeness.
// ============================================================================

import { F1_SOCKET_ANCHORS, type F1SocketId } from "./f1Sockets";
import { F1ComponentRegistry, type F1ComponentDefinition } from "./f1ComponentRegistry";

export interface F1AssemblyInstalledMap {
  [socketId: string]: string | null; // socketId -> componentId or null
}

export interface F1AggregatedVehicleMetrics {
  totalMassKg: number;
  centerOfGravityMm: [number, number, number]; // [x, y, z] from front axle ground
  frontWeightDistributionPercent: number;
  totalPeakHorsepower: number;
  iceHorsepower: number;
  ersHorsepower: number;
  totalDownforceAt250KmhKg: number;
  totalDragAt250KmhKg: number;
  frontAeroBalancePercent: number;
  totalCostUsd: number;
  installedCount: number;
  totalMandatoryCount: number;
  completionPercentage: number;
  missingMandatorySockets: F1SocketId[];
  isCompleteAndLegal: boolean;
}

export class F1AttachmentGraph {
  /**
   * Evaluates the active installed assembly state and computes all physical properties.
   */
  public static evaluateAssembly(installedMap: F1AssemblyInstalledMap): F1AggregatedVehicleMetrics {
    let totalMass = 0;
    let weightedX = 0;
    let weightedY = 0;
    let weightedZ = 0;

    let totalDownforce = 0;
    let totalDrag = 0;
    let frontDownforce = 0;

    let totalIceHp = 0;
    let totalErsHp = 0;
    let totalCost = 0;

    let installedCount = 0;
    const missingMandatorySockets: F1SocketId[] = [];

    const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];
    const mandatorySockets = allSockets.filter((s) => F1_SOCKET_ANCHORS[s].mandatoryForHomologation);

    for (const socketId of allSockets) {
      const componentId = installedMap[socketId];
      const socketAnchor = F1_SOCKET_ANCHORS[socketId];

      if (!componentId) {
        if (socketAnchor.mandatoryForHomologation) {
          missingMandatorySockets.push(socketId);
        }
        continue;
      }

      const comp = F1ComponentRegistry.getComponent(componentId);
      if (!comp) continue;

      installedCount++;
      const compMass = comp.massKg;
      totalMass += compMass;
      totalCost += comp.costUsd;

      // 3D Position = Anchor + CoM Offset
      const posX = socketAnchor.positionMm[0] + comp.centerOfMassOffsetMm[0];
      const posY = socketAnchor.positionMm[1] + comp.centerOfMassOffsetMm[1];
      const posZ = socketAnchor.positionMm[2] + comp.centerOfMassOffsetMm[2];

      weightedX += compMass * posX;
      weightedY += compMass * posY;
      weightedZ += compMass * posZ;

      // Aerodynamics
      if (comp.aero) {
        totalDownforce += comp.aero.downforceKgAt250Kmh;
        totalDrag += comp.aero.dragKgAt250Kmh;
        frontDownforce += comp.aero.downforceKgAt250Kmh * (comp.aero.frontAeroSharePercent / 100);
      }

      // Powertrain
      if (comp.power) {
        totalIceHp += comp.power.iceHorsepower;
        totalErsHp += comp.power.ersHorsepower;
      }
    }

    // Add baseline fluids (28 kg) and Driver + Ballast (94 kg) located in survival cell / rear ballast bay
    const fluidsDriverMass = 28 + 94;
    totalMass += fluidsDriverMass;
    weightedX += fluidsDriverMass * 0;
    weightedY += fluidsDriverMass * 380;
    weightedZ += fluidsDriverMass * 2100; // Calibrated with fuel tank behind cockpit

    const finalMass = Math.round(totalMass);
    const cgX = Number((weightedX / totalMass).toFixed(1));
    const cgY = Number((weightedY / totalMass).toFixed(1));
    const cgZ = Number((weightedZ / totalMass).toFixed(1));

    // Wheelbase = 3600 mm (Front axle at Z=0, Rear axle at Z=3600)
    const frontWeightDist = Number((((3600 - cgZ) / 3600) * 100).toFixed(1));
    const frontAeroBalance = totalDownforce > 0 ? Number(((frontDownforce / totalDownforce) * 100).toFixed(1)) : 45.0;

    const completionPercentage = Math.round(((mandatorySockets.length - missingMandatorySockets.length) / mandatorySockets.length) * 100);
    const isCompleteAndLegal = missingMandatorySockets.length === 0 && finalMass >= 798 && (totalIceHp + totalErsHp) >= 900 && totalCost <= 140_000_000;

    return {
      totalMassKg: finalMass,
      centerOfGravityMm: [cgX, cgY, cgZ],
      frontWeightDistributionPercent: Math.max(40, Math.min(55, frontWeightDist)),
      totalPeakHorsepower: totalIceHp + totalErsHp,
      iceHorsepower: totalIceHp,
      ersHorsepower: totalErsHp,
      totalDownforceAt250KmhKg: Math.round(totalDownforce),
      totalDragAt250KmhKg: Math.round(totalDrag),
      frontAeroBalancePercent: frontAeroBalance,
      totalCostUsd: totalCost,
      installedCount,
      totalMandatoryCount: mandatorySockets.length,
      completionPercentage,
      missingMandatorySockets,
      isCompleteAndLegal,
    };
  }

  /**
   * Checks whether a component can be mounted based on parent socket availability.
   */
  public static canInstallComponent(component: F1ComponentDefinition, installedMap: F1AssemblyInstalledMap): { canInstall: boolean; reason?: string } {
    const socket = F1_SOCKET_ANCHORS[component.targetSocketId];
    if (!socket) {
      return { canInstall: false, reason: "Target socket is not recognized." };
    }

    if (socket.parentSocketId) {
      const parentInstalled = installedMap[socket.parentSocketId];
      if (!parentInstalled) {
        const parentSocket = F1_SOCKET_ANCHORS[socket.parentSocketId];
        return {
          canInstall: false,
          reason: `Requires parent structure '${parentSocket.name}' to be installed first.`,
        };
      }
    }

    return { canInstall: true };
  }
}

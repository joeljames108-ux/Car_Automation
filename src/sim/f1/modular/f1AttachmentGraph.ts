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

const ALL_SOCKET_IDS: F1SocketId[] = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];
const MANDATORY_SOCKET_IDS: F1SocketId[] = ALL_SOCKET_IDS.filter((s) => F1_SOCKET_ANCHORS[s].mandatoryForHomologation);

export class F1AttachmentGraph {
  private static evalCache = new Map<string, F1AggregatedVehicleMetrics>();
  private static readonly MAX_CACHE_SIZE = 50;

  /**
   * Generates a fast deterministic signature key for installed component map.
   */
  private static getMapSignature(installedMap: F1AssemblyInstalledMap): string {
    let sig = "";
    for (let i = 0; i < ALL_SOCKET_IDS.length; i++) {
      const sId = ALL_SOCKET_IDS[i];
      const val = installedMap[sId];
      if (val) sig += `${sId}:${val};`;
    }
    return sig;
  }

  /**
   * Evaluates the active installed assembly state and computes all physical properties.
   */
  public static evaluateAssembly(installedMap: F1AssemblyInstalledMap): F1AggregatedVehicleMetrics {
    const signature = this.getMapSignature(installedMap);
    const cached = this.evalCache.get(signature);
    if (cached) return cached;

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

    for (let i = 0; i < ALL_SOCKET_IDS.length; i++) {
      const socketId = ALL_SOCKET_IDS[i];
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

    const completionPercentage = Math.round(((MANDATORY_SOCKET_IDS.length - missingMandatorySockets.length) / MANDATORY_SOCKET_IDS.length) * 100);
    const isCompleteAndLegal = missingMandatorySockets.length === 0 && finalMass >= 798 && (totalIceHp + totalErsHp) >= 900 && totalCost <= 140_000_000;

    const metrics: F1AggregatedVehicleMetrics = {
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
      totalMandatoryCount: MANDATORY_SOCKET_IDS.length,
      completionPercentage,
      missingMandatorySockets,
      isCompleteAndLegal,
    };

    if (this.evalCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.evalCache.keys().next().value;
      if (firstKey) this.evalCache.delete(firstKey);
    }
    this.evalCache.set(signature, metrics);

    return metrics;
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

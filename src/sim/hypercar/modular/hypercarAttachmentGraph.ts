// ============================================================================
// HYPERCAR MODULAR VEHICLE ASSEMBLY — ATTACHMENT GRAPH & METRICS SOLVER
// ============================================================================
// Solves hierarchical assembly dependencies, calculates exact Hypercar mass,
// 3D CG, e-AWD power distribution, L/D aerodynamic efficiency, and endurance score.
// ============================================================================

import { HYPERCAR_SOCKET_ANCHORS, type HypercarSocketId } from "./hypercarSockets";
import { HypercarComponentRegistry, type HypercarComponentDefinition } from "./hypercarComponentRegistry";

export interface HypercarAssemblyInstalledMap {
  [socketId: string]: string | null;
}

export interface HypercarAggregatedMetrics {
  totalMassKg: number;
  centerOfGravityMm: [number, number, number];
  frontWeightDistributionPercent: number;
  iceHorsepower: number;
  frontMguKw: number;
  totalPeakHorsepower: number;
  totalDownforceAt250KmhKg: number;
  totalDragAt250KmhKg: number;
  liftToDragRatio: number;
  frontAeroBalancePercent: number;
  totalCoolingCapacityKw: number;
  enduranceReliabilityScore: number;
  totalCostUsd: number;
  installedCount: number;
  totalMandatoryCount: number;
  completionPercentage: number;
  missingMandatorySockets: HypercarSocketId[];
  isCompleteAndLegal: boolean;
}

export class HypercarAttachmentGraph {
  public static evaluateAssembly(installedMap: HypercarAssemblyInstalledMap): HypercarAggregatedMetrics {
    let totalMass = 0;
    let weightedX = 0;
    let weightedY = 0;
    let weightedZ = 0;

    let totalDownforce = 0;
    let totalDrag = 0;
    let frontDownforce = 0;

    let iceHp = 0;
    let mguKw = 0;
    let totalCoolingKw = 0;
    let totalCost = 0;

    let totalReliabilityPoints = 0;
    let ratedComponentsCount = 0;

    let installedCount = 0;
    const missingMandatorySockets: HypercarSocketId[] = [];

    const allSockets = Object.keys(HYPERCAR_SOCKET_ANCHORS) as HypercarSocketId[];
    const mandatorySockets = allSockets.filter((s) => HYPERCAR_SOCKET_ANCHORS[s].mandatoryForHomologation);

    for (const socketId of allSockets) {
      const componentId = installedMap[socketId];
      const socketAnchor = HYPERCAR_SOCKET_ANCHORS[socketId];

      if (!componentId) {
        if (socketAnchor.mandatoryForHomologation) {
          missingMandatorySockets.push(socketId);
        }
        continue;
      }

      const comp = HypercarComponentRegistry.getComponent(componentId);
      if (!comp) continue;

      installedCount++;
      const compMass = comp.massKg;
      totalMass += compMass;
      totalCost += comp.costUsd;

      // 3D coordinates = Anchor + CoM Offset
      const posX = socketAnchor.positionMm[0] + comp.centerOfMassOffsetMm[0];
      const posY = socketAnchor.positionMm[1] + comp.centerOfMassOffsetMm[1];
      const posZ = socketAnchor.positionMm[2] + comp.centerOfMassOffsetMm[2];

      weightedX += compMass * posX;
      weightedY += compMass * posY;
      weightedZ += compMass * posZ;

      // Aero
      if (comp.aero) {
        totalDownforce += comp.aero.downforceKgAt250Kmh;
        totalDrag += comp.aero.dragKgAt250Kmh;
        frontDownforce += comp.aero.downforceKgAt250Kmh * (comp.aero.frontAeroSharePercent / 100);
      }

      // Powertrain
      if (comp.power) {
        iceHp += comp.power.iceHorsepower;
        mguKw += comp.power.frontMguKw;
      }

      // Endurance & Cooling
      if (comp.endurance) {
        totalCoolingKw += comp.endurance.coolingCapacityKw;
        totalReliabilityPoints += comp.endurance.stintReliabilityScore;
        ratedComponentsCount++;
      }
    }

    // Add baseline fluids (35 kg) + Driver & Ballast (85 kg)
    const fluidsDriverMass = 35 + 85;
    totalMass += fluidsDriverMass;
    weightedX += fluidsDriverMass * 0;
    weightedY += fluidsDriverMass * 450;
    weightedZ += fluidsDriverMass * 1650; // Central cockpit position

    const finalMass = Math.round(totalMass);
    const cgX = Number((weightedX / totalMass).toFixed(1));
    const cgY = Number((weightedY / totalMass).toFixed(1));
    const cgZ = Number((weightedZ / totalMass).toFixed(1));

    // Wheelbase = 3150 mm
    const frontWeightDist = Number((((3150 - cgZ) / 3150) * 100).toFixed(1));
    const frontAeroBalance = totalDownforce > 0 ? Number(((frontDownforce / totalDownforce) * 100).toFixed(1)) : 46.0;
    const liftToDrag = totalDrag > 0 ? Number((totalDownforce / totalDrag).toFixed(2)) : 4.4;

    const avgReliability = ratedComponentsCount > 0 ? Math.round(totalReliabilityPoints / ratedComponentsCount) : 95;
    const completionPercentage = Math.round(((mandatorySockets.length - missingMandatorySockets.length) / mandatorySockets.length) * 100);

    // FIA WEC BoP requires min 1030 kg mass and complete mandatory sockets
    const isCompleteAndLegal = missingMandatorySockets.length === 0 && finalMass >= 1030 && iceHp >= 600;

    return {
      totalMassKg: finalMass,
      centerOfGravityMm: [cgX, cgY, cgZ],
      frontWeightDistributionPercent: Math.max(42, Math.min(54, frontWeightDist)),
      iceHorsepower: iceHp,
      frontMguKw: mguKw,
      totalPeakHorsepower: iceHp + Math.round(mguKw * 1.341), // 680 HP ICE + 268 HP MGU = 948 HP uncapped (BoP limits delivery at wheel)
      totalDownforceAt250KmhKg: Math.round(totalDownforce),
      totalDragAt250KmhKg: Math.round(totalDrag),
      liftToDragRatio: liftToDrag,
      frontAeroBalancePercent: frontAeroBalance,
      totalCoolingCapacityKw: totalCoolingKw,
      enduranceReliabilityScore: avgReliability,
      totalCostUsd: totalCost,
      installedCount,
      totalMandatoryCount: mandatorySockets.length,
      completionPercentage,
      missingMandatorySockets,
      isCompleteAndLegal,
    };
  }

  public static canInstallComponent(component: HypercarComponentDefinition, installedMap: HypercarAssemblyInstalledMap): { canInstall: boolean; reason?: string } {
    const socket = HYPERCAR_SOCKET_ANCHORS[component.targetSocketId];
    if (!socket) return { canInstall: false, reason: "Target socket unrecognized." };

    if (socket.parentSocketId) {
      const parentInstalled = installedMap[socket.parentSocketId];
      if (!parentInstalled) {
        const parentSocket = HYPERCAR_SOCKET_ANCHORS[socket.parentSocketId];
        return {
          canInstall: false,
          reason: `Requires parent structure '${parentSocket.name}' to be installed first.`,
        };
      }
    }

    return { canInstall: true };
  }
}

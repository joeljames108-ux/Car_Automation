/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — PARAMETRIC MOUNTING GRAPH & SOCKETS
 * ============================================================================
 * Computes exact 3D local coordinate transforms (positions in mm, rotation euler)
 * for all engine subassemblies across Inline, V, Boxer, and W architectures.
 * Handles exploded view separation vectors along realistic mechanical disassembly paths.
 * ============================================================================
 */

import * as THREE from "three";
import { MasterEngineState } from "../../sim/engine/masterEngineTypes";

export interface EngineMountSocket {
  id: string;
  category: string;
  localPositionMm: { x: number; y: number; z: number };
  localRotationDeg: { x: number; y: number; z: number };
  ejectionVector: { x: number; y: number; z: number }; // Exploded view direction
  isOccupied: boolean;
  attachedMesh?: THREE.Object3D;
}

// ============================================================================
// DYNAMIC PARAMETRIC GEOMETRY SOLVER (LIVE BORE / STROKE / ROD LENGTH)
// ============================================================================
// Derives the real-time block envelope directly from live reciprocating
// dimensions so every mounting socket tracks the changing deck height,
// bore pitch, crank throw, and sump depth without gaps or clipping.
// ============================================================================

export interface DynamicEngineGeometry {
  /** Live bore pitch: widens spacing as cylinder bore outgrows the preset pitch */
  boreSpacingMm: number;
  /** Live deck height: elevates with stroke amplitude, rod length & piston compression height */
  deckHeightMm: number;
  /** Crank counterweight swing radius: grows with stroke throw radius */
  counterweightRadiusMm: number;
  /** Oil pan depth required for counterweight clearance */
  oilPanDepthMm: number;
  /** Seated oil pan centerline Y (mm, negative below crank centerline) */
  oilPanCenterYMm: number;
}

export function solveDynamicEngineGeometry(state: MasterEngineState): DynamicEngineGeometry {
  const arch = state.architecture;
  const strokeMm = state.block.strokeMm;
  const rodLengthMm = state.connectingRods.rodLengthMm;

  const boreSpacingMm = Math.max(arch.boreSpacingMm, state.block.boreMm + 10);
  // Deck must clear: half-stroke + rod + piston compression deck allowance
  const deckHeightMm = Math.max(
    arch.deckHeightMm,
    strokeMm * 0.9 + rodLengthMm + 45
  );
  const counterweightRadiusMm = Math.max(48, (strokeMm / 2000) * 1350);
  const oilPanDepthMm = Math.max(65, (strokeMm / 2000) * 1250);
  const oilPanCenterYMm = -(counterweightRadiusMm + oilPanDepthMm / 2 + 6);

  return {
    boreSpacingMm,
    deckHeightMm,
    counterweightRadiusMm,
    oilPanDepthMm,
    oilPanCenterYMm,
  };
}

export class EngineMountingGraph {
  private sockets: Map<string, EngineMountSocket> = new Map();
  private explodedFactor: number = 0.0; // 0.0 (assembled) to 1.0 (fully exploded)

  constructor(state?: MasterEngineState) {
    if (state) {
      this.rebuildSocketsFromState(state);
    }
  }

  public rebuildSocketsFromState(state: MasterEngineState): void {
    this.sockets.clear();
    const arch = state.architecture;
    const halfBankAngleRad = (arch.bankAngleDeg / 2) * (Math.PI / 180);
    const halfBankAngleDeg = arch.bankAngleDeg / 2;

    // Live parametric dimensions — sockets track bore pitch, deck height & sump depth
    const dyn = solveDynamicEngineGeometry(state);
    const deckHeightMm = dyn.deckHeightMm;

    const cylCount = arch.cylinderCount;
    const cylindersPerBank = arch.family === "inline" ? cylCount : cylCount / 2;
    const boreSpacing = dyn.boreSpacingMm;
    const startZ = -((cylindersPerBank - 1) * boreSpacing) / 2;

    // 1. Crankshaft Main Journal Socket
    this.sockets.set("ENGINE_CRANKSHAFT_MAIN", {
      id: "ENGINE_CRANKSHAFT_MAIN",
      category: "crankshaft",
      localPositionMm: { x: 0, y: 0, z: 0 },
      localRotationDeg: { x: 0, y: 0, z: 0 },
      ejectionVector: { x: 0, y: -220, z: 0 },
      isOccupied: true,
    });

    // 2. Oil Pan Socket (deepens with stroke for counterweight clearance)
    this.sockets.set("ENGINE_OIL_PAN", {
      id: "ENGINE_OIL_PAN",
      category: "lubrication",
      localPositionMm: { x: 0, y: dyn.oilPanCenterYMm, z: 0 },
      localRotationDeg: { x: 0, y: 0, z: 0 },
      ejectionVector: { x: 0, y: -380, z: 0 },
      isOccupied: true,
    });

    // 3. Cylinder Bores & Piston Sockets
    for (let i = 0; i < cylCount; i++) {
      let bank = 0; // -1 = Left bank, 0 = inline, +1 = Right bank
      let bankIndex = i;

      if (arch.family === "inline") {
        bank = 0;
        bankIndex = i;
      } else if (arch.family === "v_engine" || arch.family === "boxer" || arch.family === "w_engine") {
        bank = i % 2 === 0 ? -1 : 1;
        bankIndex = Math.floor(i / 2);
      }

      const zMm = startZ + bankIndex * boreSpacing;
      const angleDeg = bank * halfBankAngleDeg;
      const angleRad = bank * halfBankAngleRad;

      // Cylinder bore center at deck height
      const deckRadiusMm = deckHeightMm * 0.75;
      const xMm = Math.sin(angleRad) * deckRadiusMm;
      const yMm = Math.cos(angleRad) * deckRadiusMm;

      const socketId = `ENGINE_CYLINDER_BORE_${String(i + 1).padStart(2, "0")}`;
      this.sockets.set(socketId, {
        id: socketId,
        category: "pistons",
        localPositionMm: { x: xMm, y: yMm, z: zMm },
        localRotationDeg: { x: 0, y: 0, z: -angleDeg },
        ejectionVector: {
          x: Math.sin(angleRad) * 260,
          y: Math.cos(angleRad) * 260,
          z: 0,
        },
        isOccupied: true,
      });
    }

    // 4. Cylinder Head Mounting Sockets
    if (arch.family === "inline") {
      this.sockets.set("ENGINE_HEAD_BANK_CENTER", {
        id: "ENGINE_HEAD_BANK_CENTER",
        category: "cylinderHeads",
        localPositionMm: { x: 0, y: deckHeightMm, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: 0 },
        ejectionVector: { x: 0, y: 320, z: 0 },
        isOccupied: true,
      });
      this.sockets.set("ENGINE_CAM_INTAKE", {
        id: "ENGINE_CAM_INTAKE",
        category: "camshafts",
        localPositionMm: { x: -45, y: deckHeightMm + 90, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: 0 },
        ejectionVector: { x: -40, y: 440, z: 0 },
        isOccupied: true,
      });
      this.sockets.set("ENGINE_CAM_EXHAUST", {
        id: "ENGINE_CAM_EXHAUST",
        category: "camshafts",
        localPositionMm: { x: 45, y: deckHeightMm + 90, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: 0 },
        ejectionVector: { x: 40, y: 440, z: 0 },
        isOccupied: true,
      });
      this.sockets.set("ENGINE_VALVE_COVER", {
        id: "ENGINE_VALVE_COVER",
        category: "cylinderHeads",
        localPositionMm: { x: 0, y: deckHeightMm + 140, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: 0 },
        ejectionVector: { x: 0, y: 560, z: 0 },
        isOccupied: true,
      });
    } else {
      // Left Bank Head & Cams
      const deckL = deckHeightMm;
      const xL = -Math.sin(halfBankAngleRad) * deckL;
      const yL = Math.cos(halfBankAngleRad) * deckL;
      this.sockets.set("ENGINE_HEAD_BANK_L", {
        id: "ENGINE_HEAD_BANK_L",
        category: "cylinderHeads",
        localPositionMm: { x: xL, y: yL, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: halfBankAngleDeg },
        ejectionVector: {
          x: -Math.sin(halfBankAngleRad) * 350,
          y: Math.cos(halfBankAngleRad) * 350,
          z: 0,
        },
        isOccupied: true,
      });

      // Right Bank Head & Cams
      const xR = Math.sin(halfBankAngleRad) * deckL;
      const yR = Math.cos(halfBankAngleRad) * deckL;
      this.sockets.set("ENGINE_HEAD_BANK_R", {
        id: "ENGINE_HEAD_BANK_R",
        category: "cylinderHeads",
        localPositionMm: { x: xR, y: yR, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: -halfBankAngleDeg },
        ejectionVector: {
          x: Math.sin(halfBankAngleRad) * 350,
          y: Math.cos(halfBankAngleRad) * 350,
          z: 0,
        },
        isOccupied: true,
      });
    }

    // 5. Intake Manifold Socket
    this.sockets.set("ENGINE_INTAKE_MANIFOLD", {
      id: "ENGINE_INTAKE_MANIFOLD",
      category: "intake",
      localPositionMm: { x: 0, y: deckHeightMm + 180, z: 0 },
      localRotationDeg: { x: 0, y: 0, z: 0 },
      ejectionVector: { x: 0, y: 650, z: 0 },
      isOccupied: true,
    });

    // 5b. Engine Beauty Cover Socket
    this.sockets.set("ENGINE_COVER", {
      id: "ENGINE_COVER",
      category: "cosmetics",
      localPositionMm: { x: 0, y: deckHeightMm + 240, z: 0 },
      localRotationDeg: { x: 0, y: 0, z: 0 },
      ejectionVector: { x: 0, y: 800, z: 0 },
      isOccupied: true,
    });

    // 6. Exhaust Headers Sockets
    if (arch.family === "inline") {
      this.sockets.set("ENGINE_EXHAUST_HEADER", {
        id: "ENGINE_EXHAUST_HEADER",
        category: "exhaust",
        localPositionMm: { x: 160, y: deckHeightMm * 0.7, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: 0 },
        ejectionVector: { x: 420, y: 0, z: 0 },
        isOccupied: true,
      });
    } else {
      this.sockets.set("ENGINE_EXHAUST_HEADER_L", {
        id: "ENGINE_EXHAUST_HEADER_L",
        category: "exhaust",
        localPositionMm: { x: -240, y: deckHeightMm * 0.6, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: halfBankAngleDeg },
        ejectionVector: { x: -480, y: -80, z: 0 },
        isOccupied: true,
      });
      this.sockets.set("ENGINE_EXHAUST_HEADER_R", {
        id: "ENGINE_EXHAUST_HEADER_R",
        category: "exhaust",
        localPositionMm: { x: 240, y: deckHeightMm * 0.6, z: 0 },
        localRotationDeg: { x: 0, y: 0, z: -halfBankAngleDeg },
        ejectionVector: { x: 480, y: -80, z: 0 },
        isOccupied: true,
      });
    }

    // 7. Forced Induction Sockets (Single, Twin, Quad, Hot-V & Superchargers)
    if (state.turboSystem.type !== "naturally_aspirated") {
      if (state.turboSystem.type === "roots_twin_screw_supercharger") {
        this.sockets.set("ENGINE_SUPERCHARGER_VALLEY", {
          id: "ENGINE_SUPERCHARGER_VALLEY",
          category: "turboSystem",
          localPositionMm: { x: 0, y: deckHeightMm + 80, z: 0 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: 0, y: 620, z: 0 },
          isOccupied: true,
        });
      } else if (state.turboSystem.type === "centrifugal_supercharger") {
        this.sockets.set("ENGINE_SUPERCHARGER_CENTRIFUGAL", {
          id: "ENGINE_SUPERCHARGER_CENTRIFUGAL",
          category: "turboSystem",
          localPositionMm: { x: -220, y: 160, z: startZ - 60 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: -450, y: 200, z: -200 },
          isOccupied: true,
        });
      } else if (state.turboSystem.type === "hot_v_twin_turbo") {
        this.sockets.set("ENGINE_TURBO_HOT_V", {
          id: "ENGINE_TURBO_HOT_V",
          category: "turboSystem",
          localPositionMm: { x: 0, y: deckHeightMm + 60, z: 0 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: 0, y: 480, z: 0 },
          isOccupied: true,
        });
      } else if (state.turboSystem.type === "quad_turbo_staged" || state.turboSystem.turboCount === 4) {
        // Quad-Turbo Sockets (FL, RL, FR, RR)
        this.sockets.set("ENGINE_TURBO_QUAD_FL", {
          id: "ENGINE_TURBO_QUAD_FL",
          category: "turboSystem",
          localPositionMm: { x: -320, y: 120, z: startZ + 40 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: -550, y: 0, z: -150 },
          isOccupied: true,
        });
        this.sockets.set("ENGINE_TURBO_QUAD_RL", {
          id: "ENGINE_TURBO_QUAD_RL",
          category: "turboSystem",
          localPositionMm: { x: -320, y: 120, z: -startZ - 40 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: -550, y: 0, z: 150 },
          isOccupied: true,
        });
        this.sockets.set("ENGINE_TURBO_QUAD_FR", {
          id: "ENGINE_TURBO_QUAD_FR",
          category: "turboSystem",
          localPositionMm: { x: 320, y: 120, z: startZ + 40 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: 550, y: 0, z: -150 },
          isOccupied: true,
        });
        this.sockets.set("ENGINE_TURBO_QUAD_RR", {
          id: "ENGINE_TURBO_QUAD_RR",
          category: "turboSystem",
          localPositionMm: { x: 320, y: 120, z: -startZ - 40 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: 550, y: 0, z: 150 },
          isOccupied: true,
        });
      } else if (state.turboSystem.type === "single_twin_scroll_turbo" || state.turboSystem.turboCount === 1) {
        this.sockets.set("ENGINE_TURBO_SINGLE", {
          id: "ENGINE_TURBO_SINGLE",
          category: "turboSystem",
          localPositionMm: { x: 260, y: 140, z: 0 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: 550, y: 0, z: 0 },
          isOccupied: true,
        });
      } else {
        // Parallel / Sequential Twin Turbo (L & R)
        this.sockets.set("ENGINE_TURBO_L", {
          id: "ENGINE_TURBO_L",
          category: "turboSystem",
          localPositionMm: { x: -320, y: 120, z: 80 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: -550, y: 0, z: 0 },
          isOccupied: true,
        });
        this.sockets.set("ENGINE_TURBO_R", {
          id: "ENGINE_TURBO_R",
          category: "turboSystem",
          localPositionMm: { x: 320, y: 120, z: 80 },
          localRotationDeg: { x: 0, y: 0, z: 0 },
          ejectionVector: { x: 550, y: 0, z: 0 },
          isOccupied: true,
        });
      }
    }

    // 8. Front Accessory Serpentine Drive
    this.sockets.set("ENGINE_ACCESSORY_DRIVE", {
      id: "ENGINE_ACCESSORY_DRIVE",
      category: "accessories",
      localPositionMm: { x: 0, y: 40, z: startZ - boreSpacing * 0.8 },
      localRotationDeg: { x: 0, y: 0, z: 0 },
      ejectionVector: { x: 0, y: 0, z: -420 },
      isOccupied: true,
    });
  }

  public getSocket(id: string): EngineMountSocket | undefined {
    return this.sockets.get(id);
  }

  public getAllSockets(): EngineMountSocket[] {
    return Array.from(this.sockets.values());
  }

  public setExplodedFactor(factor: number): void {
    this.explodedFactor = Math.max(0, Math.min(1.0, factor));
    this.applyTransformsToAttachedMeshes();
  }

  public getExplodedFactor(): number {
    return this.explodedFactor;
  }

  public attachMesh(socketId: string, mesh: THREE.Object3D): boolean {
    const socket = this.sockets.get(socketId);
    if (!socket) return false;
    socket.attachedMesh = mesh;
    this.applySocketTransform(socket);
    return true;
  }

  private applySocketTransform(socket: EngineMountSocket): void {
    if (!socket.attachedMesh) return;
    const f = this.explodedFactor;

    // Convert mm to 3D world meters (/ 1000)
    const posX = (socket.localPositionMm.x + socket.ejectionVector.x * f) / 1000;
    const posY = (socket.localPositionMm.y + socket.ejectionVector.y * f) / 1000;
    const posZ = (socket.localPositionMm.z + socket.ejectionVector.z * f) / 1000;

    socket.attachedMesh.position.set(posX, posY, posZ);
    socket.attachedMesh.rotation.set(
      THREE.MathUtils.degToRad(socket.localRotationDeg.x),
      THREE.MathUtils.degToRad(socket.localRotationDeg.y),
      THREE.MathUtils.degToRad(socket.localRotationDeg.z)
    );
  }

  public applyTransformsToAttachedMeshes(): void {
    this.sockets.forEach((socket) => {
      this.applySocketTransform(socket);
    });
  }
}

// ===================================================================
// R&D TREE LAYOUT ENGINE — HIERARCHICAL GRAPH TOPOLOGY & CONDUIT ROUTER
// Translates node dependency graphs into visual tiers and SVG conduits
// ===================================================================
import { RDTechNode } from "./rdTreeTypes";

export interface GraphNodeLayout {
  node: RDTechNode;
  x: number; // Center X in canvas pixels
  y: number; // Center Y in canvas pixels
  width: number;
  height: number;
  tier: number; // 0 = root, 1 = baseline, 2 = branch tier 1, etc.
  column: number; // 0 = left, 1 = center, 2 = right
  isGenesis?: boolean;
}

export interface ConduitConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  pathD: string; // SVG path string with rounded 90° bends
  state: "unlocked" | "researching" | "ready" | "locked";
  colorTheme: "cyan" | "purple" | "emerald" | "slate";
}

export interface TreeCanvasLayout {
  nodes: GraphNodeLayout[];
  conduits: ConduitConnection[];
  canvasWidth: number;
  canvasHeight: number;
  genesisNode: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Builds the visual node graph layout for a given department's nodes.
 * Matches the reference layout with:
 * - Genesis Root at bottom center
 * - Tier 1 Baseline (Inline-4)
 * - Multi-column branches (Rotary/Alt on left, I6/Boxer in center, V8/V12 on right)
 */
export function calculateTreeLayout(
  departmentId: string,
  nodes: RDTechNode[],
  unlockedSet: Set<string>,
  activeNodeId?: string | null
): TreeCanvasLayout {
  const NODE_W = 216;
  const NODE_H = 92;
  const CANVAS_W = 800;
  const CANVAS_H = 630;

  // Dedicated layout mapping for Engine / Powertrain (matches Photo 2)
  if (departmentId === "engine" || departmentId === "powertrain") {
    // 3 distinct columns:
    // Col 0 (Left - Alt/Rotary): X = 140
    // Col 1 (Center-Left - I6/Boxer/Turbo): X = 395
    // Col 2 (Center-Right - V8/V12/ITB): X = 650
    // Genesis & Baseline I4 are centered between Col 1 and Col 2: X = 522
    const colX = [140, 395, 650];
    const centerI4X = 522;

    // Tiers vertically from bottom to top:
    // Tier 0 (Genesis): Y = 560
    // Tier 1 (Baseline I4): Y = 460
    // Tier 2 (Alt Lab, I6, V8): Y = 335
    // Tier 3 (Twin-Rotor, Boxer-6, V12): Y = 215
    // Tier 4 (Turbo Flat-6, ITB V12): Y = 95
    const tierY = [560, 460, 335, 215, 95];

    // Map known engine nodes to their specific canonical coordinates matching Photo 2
    const engineNodePlacements: Record<string, { x: number; y: number; tier: number; column: number }> = {
      // Baseline I4 (Tier 1, centered between Col 1 & Col 2)
      eng_arch_baseline: { x: centerI4X, y: tierY[1], tier: 1, column: 1 },

      // Left branch: Rotary / Alternative (Col 0)
      eng_arch_rotary: { x: colX[0], y: tierY[2], tier: 2, column: 0 },
      eng_rotary_twin: { x: colX[0], y: tierY[3], tier: 3, column: 0 },

      // Center-Left branch: Inline-6 -> Boxer-6 -> Turbo Flat-6 (Col 1)
      eng_arch_i6: { x: colX[1], y: tierY[2], tier: 2, column: 1 },
      eng_arch_boxer: { x: colX[1], y: tierY[3], tier: 3, column: 1 },
      eng_ind_turbo_flat6: { x: colX[1], y: tierY[4], tier: 4, column: 1 },
      eng_ind_turbo_twin: { x: colX[1], y: tierY[4], tier: 4, column: 1 },

      // Center-Right branch: V8 -> V12 -> ITB V12 (Col 2)
      eng_arch_v8: { x: colX[2], y: tierY[2], tier: 2, column: 2 },
      eng_arch_v12: { x: colX[2], y: tierY[3], tier: 3, column: 2 },
      eng_ind_itb_v12: { x: colX[2], y: tierY[4], tier: 4, column: 2 },
      eng_valvetrain_dohc: { x: colX[2], y: tierY[4], tier: 4, column: 2 },
    };

    const placedNodes: GraphNodeLayout[] = [];
    const nodeMap = new Map<string, RDTechNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    // Place predefined nodes
    for (const [id, pos] of Object.entries(engineNodePlacements)) {
      const node = nodeMap.get(id);
      if (node && !placedNodes.some((p) => p.node.id === node.id)) {
        placedNodes.push({
          node,
          x: pos.x,
          y: pos.y,
          width: NODE_W,
          height: NODE_H,
          tier: pos.tier,
          column: pos.column,
        });
      }
    }

    // Place any remaining nodes in department into an overflow/extended tier
    const placedIds = new Set(placedNodes.map((p) => p.node.id));
    let extraIndex = 0;
    for (const node of nodes) {
      if (!placedIds.has(node.id)) {
        const col = extraIndex % 3;
        const row = Math.floor(extraIndex / 3);
        placedNodes.push({
          node,
          x: colX[col],
          y: Math.max(30, tierY[4] - (row + 1) * 120),
          width: NODE_W,
          height: NODE_H,
          tier: 5 + row,
          column: col,
        });
        extraIndex++;
      }
    }

    // Genesis node coordinates (bottom anchor)
    const genesisNode = {
      x: centerI4X,
      y: tierY[0],
      width: 250,
      height: 48,
    };

    // Calculate conduits
    const conduits: ConduitConnection[] = [];

    // 1. Genesis -> Baseline I4 conduit (Green vertical)
    const baseline = placedNodes.find((p) => p.node.id === "eng_arch_baseline");
    if (baseline) {
      const fromX = genesisNode.x;
      const fromY = genesisNode.y - genesisNode.height / 2;
      const toX = baseline.x;
      const toY = baseline.y + baseline.height / 2;
      const isBaseDone = unlockedSet.has(baseline.node.id);

      conduits.push({
        id: "conduit_genesis_baseline",
        fromNodeId: "genesis",
        toNodeId: baseline.node.id,
        fromX,
        fromY,
        toX,
        toY,
        pathD: `M ${fromX} ${fromY} L ${toX} ${toY}`,
        state: isBaseDone ? "unlocked" : "ready",
        colorTheme: "emerald",
      });
    }

    // 2. Inter-node conduits based on placement relationships
    const nodePositionMap = new Map<string, GraphNodeLayout>();
    for (const p of placedNodes) nodePositionMap.set(p.node.id, p);

    // Custom explicit connections matching Photo 2
    const connections: Array<{
      from: string;
      to: string;
      theme?: "cyan" | "purple" | "emerald";
      customPath?: string;
    }> = [
      // Left branch: Baseline to Alt Lab (Purple horizontal-to-vertical conduit)
      {
        from: "eng_arch_baseline",
        to: "eng_arch_rotary",
        theme: "purple",
        customPath: `M ${centerI4X - NODE_W / 2} ${tierY[1]} L 155 ${tierY[1]} Q 140 ${tierY[1]} 140 ${tierY[1] - 15} L 140 ${tierY[2] + NODE_H / 2}`,
      },
      // Alt Lab to Twin-Rotor (Purple straight up)
      { from: "eng_arch_rotary", to: "eng_rotary_twin", theme: "purple" },

      // Center-Left branch: Baseline to I6 (Cyan stepped curve)
      {
        from: "eng_arch_baseline",
        to: "eng_arch_i6",
        theme: "cyan",
        customPath: `M ${centerI4X} ${tierY[1] - NODE_H / 2} L ${centerI4X} 398 Q ${centerI4X} 393 ${centerI4X - 8} 393 L 403 393 Q 395 393 395 388 L 395 ${tierY[2] + NODE_H / 2}`,
      },
      // I6 to Boxer-6 (Cyan straight up)
      { from: "eng_arch_i6", to: "eng_arch_boxer", theme: "cyan" },
      // Boxer-6 to Turbo Flat-6 (Cyan straight up)
      {
        from: "eng_arch_boxer",
        to: nodePositionMap.has("eng_ind_turbo_flat6") ? "eng_ind_turbo_flat6" : "eng_ind_turbo_twin",
        theme: "cyan",
      },

      // Center-Right branch: Baseline to V8 (Cyan stepped curve)
      {
        from: "eng_arch_baseline",
        to: "eng_arch_v8",
        theme: "cyan",
        customPath: `M ${centerI4X} ${tierY[1] - NODE_H / 2} L ${centerI4X} 398 Q ${centerI4X} 393 ${centerI4X + 8} 393 L 642 393 Q 650 393 650 388 L 650 ${tierY[2] + NODE_H / 2}`,
      },
      // V8 to V12 (Cyan straight up)
      { from: "eng_arch_v8", to: "eng_arch_v12", theme: "cyan" },
      // V12 to ITB V12 (Cyan straight up)
      {
        from: "eng_arch_v12",
        to: nodePositionMap.has("eng_ind_itb_v12") ? "eng_ind_itb_v12" : "eng_valvetrain_dohc",
        theme: "cyan",
      },
    ];

    for (const conn of connections) {
      const from = nodePositionMap.get(conn.from);
      const to = nodePositionMap.get(conn.to);
      if (!from || !to) continue;

      const fromX = from.x;
      const fromY = from.y - from.height / 2;
      const toX = to.x;
      const toY = to.y + to.height / 2;

      let pathD = conn.customPath || "";
      if (!pathD) {
        if (Math.abs(fromX - toX) < 10) {
          // Vertical straight line
          pathD = `M ${fromX} ${fromY} L ${toX} ${toY}`;
        } else {
          // Orthogonal stepped bend with smooth rounded corners
          const midY = (fromY + toY) / 2;
          const radius = 16;
          const dx = toX > fromX ? 1 : -1;

          pathD = [
            `M ${fromX} ${fromY}`,
            `L ${fromX} ${midY + radius}`,
            `Q ${fromX} ${midY} ${fromX + dx * radius} ${midY}`,
            `L ${toX - dx * radius} ${midY}`,
            `Q ${toX} ${midY} ${toX} ${midY - radius}`,
            `L ${toX} ${toY}`,
          ].join(" ");
        }
      }

      const isFromDone = unlockedSet.has(from.node.id);
      const isToDone = unlockedSet.has(to.node.id);
      const isCur = activeNodeId === to.node.id;

      let state: ConduitConnection["state"] = "locked";
      if (isToDone) state = "unlocked";
      else if (isCur) state = "researching";
      else if (isFromDone) state = "ready";

      conduits.push({
        id: `conduit_${conn.from}_${conn.to}`,
        fromNodeId: conn.from,
        toNodeId: conn.to,
        fromX,
        fromY,
        toX,
        toY,
        pathD,
        state,
        colorTheme: state === "locked" ? "slate" : conn.theme || "cyan",
      });
    }

    return {
      nodes: placedNodes,
      conduits,
      canvasWidth: CANVAS_W,
      canvasHeight: CANVAS_H,
      genesisNode,
    };
  }

  // Universal Layout Engine for other departments
  return calculateGenericTreeLayout(nodes, unlockedSet, activeNodeId, CANVAS_W, CANVAS_H);
}

/**
 * Universal layout calculation for other departments (Chassis, Aero, Materials, etc.)
 */
function calculateGenericTreeLayout(
  nodes: RDTechNode[],
  unlockedSet: Set<string>,
  activeNodeId: string | null | undefined,
  canvasWidth: number,
  canvasHeight: number
): TreeCanvasLayout {
  const NODE_W = 230;
  const NODE_H = 100;

  const tierMap = new Map<string, number>();
  const nodeMap = new Map<string, RDTechNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  function getTier(nodeId: string, visited = new Set<string>()): number {
    if (tierMap.has(nodeId)) return tierMap.get(nodeId)!;
    if (visited.has(nodeId)) return 1;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node || node.requires.length === 0) {
      tierMap.set(nodeId, 1);
      return 1;
    }

    let maxParentTier = 0;
    for (const req of node.requires) {
      if (nodeMap.has(req)) {
        maxParentTier = Math.max(maxParentTier, getTier(req, new Set(visited)));
      }
    }
    const tier = maxParentTier + 1;
    tierMap.set(nodeId, tier);
    return tier;
  }

  for (const n of nodes) getTier(n.id);

  const tierGroups = new Map<number, RDTechNode[]>();
  let maxTier = 1;
  for (const n of nodes) {
    const t = tierMap.get(n.id) || 1;
    maxTier = Math.max(maxTier, t);
    if (!tierGroups.has(t)) tierGroups.set(t, []);
    tierGroups.get(t)!.push(n);
  }

  const placedNodes: GraphNodeLayout[] = [];
  const startY = canvasHeight - 160;
  const tierHeight = Math.min(130, (canvasHeight - 200) / Math.max(1, maxTier));

  for (let t = 1; t <= maxTier; t++) {
    const group = tierGroups.get(t) || [];
    const count = group.length;
    const y = startY - (t - 1) * tierHeight;

    group.forEach((node, colIdx) => {
      const spacing = canvasWidth / (count + 1);
      const x = spacing * (colIdx + 1);

      placedNodes.push({
        node,
        x,
        y,
        width: NODE_W,
        height: NODE_H,
        tier: t,
        column: colIdx,
      });
    });
  }

  const genesisNode = {
    x: canvasWidth / 2,
    y: canvasHeight - 50,
    width: 250,
    height: 48,
  };

  const conduits: ConduitConnection[] = [];
  const placedMap = new Map<string, GraphNodeLayout>();
  for (const p of placedNodes) placedMap.set(p.node.id, p);

  for (const p of placedNodes) {
    if (p.tier === 1) {
      conduits.push({
        id: `conduit_genesis_${p.node.id}`,
        fromNodeId: "genesis",
        toNodeId: p.node.id,
        fromX: genesisNode.x,
        fromY: genesisNode.y - genesisNode.height / 2,
        toX: p.x,
        toY: p.y + p.height / 2,
        pathD: `M ${genesisNode.x} ${genesisNode.y - genesisNode.height / 2} L ${p.x} ${p.y + p.height / 2}`,
        state: unlockedSet.has(p.node.id) ? "unlocked" : "ready",
        colorTheme: "emerald",
      });
    }

    for (const req of p.node.requires) {
      const parent = placedMap.get(req);
      if (parent) {
        const fromX = parent.x;
        const fromY = parent.y - parent.height / 2;
        const toX = p.x;
        const toY = p.y + p.height / 2;

        const midY = (fromY + toY) / 2;
        const pathD = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;

        const isParentDone = unlockedSet.has(parent.node.id);
        const isChildDone = unlockedSet.has(p.node.id);
        const isCur = activeNodeId === p.node.id;

        let state: ConduitConnection["state"] = "locked";
        if (isChildDone) state = "unlocked";
        else if (isCur) state = "researching";
        else if (isParentDone) state = "ready";

        conduits.push({
          id: `conduit_${req}_${p.node.id}`,
          fromNodeId: req,
          toNodeId: p.node.id,
          fromX,
          fromY,
          toX,
          toY,
          pathD,
          state,
          colorTheme: state === "locked" ? "slate" : "cyan",
        });
      }
    }
  }

  return {
    nodes: placedNodes,
    conduits,
    canvasWidth,
    canvasHeight,
    genesisNode,
  };
}

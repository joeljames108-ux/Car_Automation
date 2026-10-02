// ===================================================================
// R&D VISUAL TREE CANVAS & LAYOUT ENGINE — UNIT TEST SUITE
// Verifies graph topology, tier calculation, and SVG conduit routing
// ===================================================================
import { describe, it, expect } from "vitest";
import { calculateTreeLayout } from "../../sim/rdTreeLayoutEngine";
import { TECH_NODES_BY_DEPARTMENT } from "../../sim/rdTreeData";

describe("R&D Visual Tree Layout Engine Master Suite", () => {
  const engineNodes = TECH_NODES_BY_DEPARTMENT["engine"] || [];

  it("calculates engine tree layout with genesis node and canonical tiers", () => {
    const unlockedSet = new Set(["eng_arch_baseline"]);
    const layout = calculateTreeLayout("engine", engineNodes, unlockedSet);

    expect(layout).toBeDefined();
    expect(layout.canvasWidth).toBe(800);
    expect(layout.canvasHeight).toBe(630);

    // Genesis node must be anchored at the bottom center
    expect(layout.genesisNode).toBeDefined();
    expect(layout.genesisNode.x).toBe(522);
    expect(layout.genesisNode.y).toBe(560);

    // Baseline Inline-4 must be Tier 1 directly above Genesis
    const baseline = layout.nodes.find((n) => n.node.id === "eng_arch_baseline");
    expect(baseline).toBeDefined();
    expect(baseline?.tier).toBe(1);
    expect(baseline?.x).toBe(522);
    expect(baseline?.y).toBe(460);
  });

  it("generates inter-node SVG conduits with valid paths and arrow markers", () => {
    const unlockedSet = new Set(["eng_arch_baseline", "eng_arch_i6"]);
    const layout = calculateTreeLayout("engine", engineNodes, unlockedSet, "eng_arch_v8");

    expect(layout.conduits.length).toBeGreaterThan(0);

    // Verify Genesis -> Baseline conduit exists and is unlocked
    const genesisConduit = layout.conduits.find((c) => c.id === "conduit_genesis_baseline");
    expect(genesisConduit).toBeDefined();
    expect(genesisConduit?.state).toBe("unlocked");
    expect(genesisConduit?.colorTheme).toBe("emerald");
    expect(genesisConduit?.pathD).toContain("M 522");

    // Verify Baseline -> I6 conduit exists and is unlocked
    const i6Conduit = layout.conduits.find((c) => c.fromNodeId === "eng_arch_baseline" && c.toNodeId === "eng_arch_i6");
    expect(i6Conduit).toBeDefined();
    expect(i6Conduit?.state).toBe("unlocked");
    expect(i6Conduit?.colorTheme).toBe("cyan");

    // Verify Baseline -> V8 conduit exists and is marked as researching
    const v8Conduit = layout.conduits.find((c) => c.fromNodeId === "eng_arch_baseline" && c.toNodeId === "eng_arch_v8");
    expect(v8Conduit).toBeDefined();
    expect(v8Conduit?.state).toBe("researching");

    // Verify all conduits have non-empty SVG path syntax
    for (const c of layout.conduits) {
      expect(c.pathD).toMatch(/^M \d+/);
    }
  });

  it("organizes multi-branch column flow (Rotary on Left, I6 Center, V8 Right)", () => {
    const unlockedSet = new Set<string>();
    const layout = calculateTreeLayout("engine", engineNodes, unlockedSet);

    const rotary = layout.nodes.find((n) => n.node.id === "eng_arch_rotary");
    const i6 = layout.nodes.find((n) => n.node.id === "eng_arch_i6");
    const v8 = layout.nodes.find((n) => n.node.id === "eng_arch_v8");

    expect(rotary).toBeDefined();
    expect(i6).toBeDefined();
    expect(v8).toBeDefined();

    // Col 0 (Rotary) < Col 1 (I6) < Col 2 (V8)
    expect(rotary!.x).toBeLessThan(i6!.x);
    expect(i6!.x).toBeLessThan(v8!.x);
  });

  it("handles universal generic tree layout for non-engine departments", () => {
    const chassisNodes = TECH_NODES_BY_DEPARTMENT["chassis"] || [];
    const unlockedSet = new Set<string>();
    const layout = calculateTreeLayout("chassis", chassisNodes, unlockedSet);

    expect(layout.nodes.length).toBe(chassisNodes.length);
    expect(layout.genesisNode).toBeDefined();

    // Ensure all nodes have valid coordinates within the canvas boundaries
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThan(0);
      expect(n.x).toBeLessThan(layout.canvasWidth);
      expect(n.y).toBeGreaterThan(0);
      expect(n.y).toBeLessThan(layout.canvasHeight);
    }
  });
});

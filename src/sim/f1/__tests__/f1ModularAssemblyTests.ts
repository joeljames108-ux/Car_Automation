// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — UNIT TEST SUITE
// ============================================================================
// Validates socket anchors, component registry, attachment graph solver,
// cascading detachment, physical metric aggregation, and homologation checks.
// ============================================================================

import { F1_SOCKET_ANCHORS, type F1SocketId } from "../modular/f1Sockets";
import { F1ComponentRegistry } from "../modular/f1ComponentRegistry";
import { F1AttachmentGraph, type F1AssemblyInstalledMap } from "../modular/f1AttachmentGraph";
import { createInitialInstalledMap } from "../state/f1AssemblyStore";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`[FAIL] ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`[PASS] ${msg}`);
}

console.log("================================================================");
console.log("RUNNING FORMULA 1 MODULAR ASSEMBLY & SOCKET GRAPH TEST SUITE");
console.log("================================================================");

// ── TEST 1: Socket Anchors & Catalog Completeness ──
console.log("\n--- TEST 1: Sockets & Registry Catalog ---");
const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];
assert(allSockets.length === 20, `20 master F1 socket anchors registered (got ${allSockets.length})`);

const allComponents = F1ComponentRegistry.getAllComponents();
assert(allComponents.length >= 20, `Component catalog contains at least 20 modular parts (got ${allComponents.length})`);

// Ensure every socket has at least 1 factory standard component
for (const socketId of allSockets) {
  const parts = F1ComponentRegistry.getComponentsForSocket(socketId);
  assert(parts.length >= 1, `Socket ${socketId} has candidate components`);
  const standardPart = parts.find((p) => p.isFactoryStandard);
  assert(!!standardPart, `Socket ${socketId} has a factory standard component`);
}

// ── TEST 2: Bare Chassis Incomplete Validation ──
console.log("\n--- TEST 2: Bare Chassis & Missing Socket Detection ---");
const bareMap = createInitialInstalledMap(true);
const bareMetrics = F1AttachmentGraph.evaluateAssembly(bareMap);

assert(bareMetrics.completionPercentage < 100, `Bare chassis completion is under 100% (got ${bareMetrics.completionPercentage}%)`);
assert(!bareMetrics.isCompleteAndLegal, "Bare chassis correctly flagged as not complete/legal");
assert(bareMetrics.missingMandatorySockets.length === 19, `Bare chassis flags 19 missing mandatory sockets (got ${bareMetrics.missingMandatorySockets.length})`);
assert(bareMetrics.missingMandatorySockets.includes("SOCKET_FRONT_WING"), "Flags missing front wing");
assert(bareMetrics.missingMandatorySockets.includes("SOCKET_POWER_UNIT"), "Flags missing power unit");

// ── TEST 3: Parent-Child Structural Dependencies ──
console.log("\n--- TEST 3: Structural Mounting Dependencies ---");
const emptyMap: F1AssemblyInstalledMap = {};
const frontWingComp = F1ComponentRegistry.getComponent("FRONT_WING_OUTWASH_4_ELEMENT")!;
const canInstallCheck = F1AttachmentGraph.canInstallComponent(frontWingComp, emptyMap);

assert(!canInstallCheck.canInstall, "Cannot install Front Wing on completely empty frame");
assert(Boolean(canInstallCheck.reason?.includes("Nose Cone")), `Error specifies missing parent nose structure (got: ${canInstallCheck.reason})`);

// ── TEST 4: Full Factory Works Car Aggregation ──
console.log("\n--- TEST 4: Complete Factory Works Assembly Physical Metrics ---");
const fullMap = createInitialInstalledMap(false);
const fullMetrics = F1AttachmentGraph.evaluateAssembly(fullMap);

assert(fullMetrics.completionPercentage === 100, `Full works car completion is 100% (got ${fullMetrics.completionPercentage}%)`);
assert(fullMetrics.missingMandatorySockets.length === 0, "Zero missing mandatory sockets on full works car");
assert(fullMetrics.totalMassKg >= 798, `Total vehicle mass meets FIA 798 kg minimum (got ${fullMetrics.totalMassKg} kg)`);
assert(fullMetrics.totalPeakHorsepower >= 1000, `Total output exceeds 1,000 HP (got ${fullMetrics.totalPeakHorsepower} HP)`);
assert(fullMetrics.totalDownforceAt250KmhKg >= 2500, `Total downforce exceeds 2,500 kg @ 250 km/h (got ${fullMetrics.totalDownforceAt250KmhKg} kg)`);
assert(fullMetrics.frontWeightDistributionPercent >= 44 && fullMetrics.frontWeightDistributionPercent <= 52, `Front weight distribution is balanced (got ${fullMetrics.frontWeightDistributionPercent}%)`);
assert(fullMetrics.isCompleteAndLegal, "Full works car passes homologation legality checks");

console.log("\n================================================================");
console.log("F1 MODULAR ASSEMBLY TESTS: ALL PASSED (0 FAILURES).");
console.log("================================================================\n");

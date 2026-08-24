// ============================================================================
// HYPERCAR MODULAR VEHICLE ASSEMBLY — COMPREHENSIVE UNIT TEST SUITE
// ============================================================================

import { HYPERCAR_SOCKET_ANCHORS, type HypercarSocketId } from "../modular/hypercarSockets";
import { HypercarComponentRegistry } from "../modular/hypercarComponentRegistry";
import { HypercarAttachmentGraph, type HypercarAssemblyInstalledMap } from "../modular/hypercarAttachmentGraph";
import { createInitialHypercarMap } from "../state/hypercarAssemblyStore";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

console.log("================================================================");
console.log("RUNNING HYPERCAR MODULAR ASSEMBLY & WEC SOCKET GRAPH TEST SUITE");
console.log("================================================================\n");

// ── TEST 1: Sockets & Registry Catalog ──
console.log("--- TEST 1: Sockets & Registry Catalog ---");
const allSockets = Object.keys(HYPERCAR_SOCKET_ANCHORS) as HypercarSocketId[];
assert(allSockets.length === 25, `25 master Hypercar socket anchors registered (got ${allSockets.length})`);

const catalog = HypercarComponentRegistry.getAllComponents();
assert(catalog.length >= 24, `Component catalog contains at least 24 modular parts (got ${catalog.length})`);

allSockets.forEach((socketId) => {
  const parts = HypercarComponentRegistry.getComponentsForSocket(socketId);
  assert(parts.length > 0, `Socket ${socketId} has candidate components`);
  const standard = parts.find((p) => p.isFactoryStandard);
  assert(!!standard, `Socket ${socketId} has a factory standard component`);
});

// ── TEST 2: Bare Monocoque & Missing Socket Detection ──
console.log("\n--- TEST 2: Bare Monocoque & Missing Socket Detection ---");
const bareMap = createInitialHypercarMap(true);
const bareMetrics = HypercarAttachmentGraph.evaluateAssembly(bareMap);

assert(bareMetrics.completionPercentage < 100, `Bare monocoque completion is under 100% (got ${bareMetrics.completionPercentage}%)`);
assert(!bareMetrics.isCompleteAndLegal, "Bare monocoque correctly flagged as not complete/legal");
assert(bareMetrics.missingMandatorySockets.length > 0, `Bare monocoque flags missing mandatory sockets (got ${bareMetrics.missingMandatorySockets.length})`);
assert(bareMetrics.missingMandatorySockets.includes("SOCKET_FRONT_SPLITTER"), "Flags missing front splitter");
assert(bareMetrics.missingMandatorySockets.includes("SOCKET_ICE_POWERTRAIN"), "Flags missing ICE powertrain");
assert(bareMetrics.missingMandatorySockets.includes("SOCKET_FRONT_HYBRID_MGU"), "Flags missing front hybrid MGU");

// ── TEST 3: Structural Mounting Dependencies ──
console.log("\n--- TEST 3: Structural Mounting Dependencies ---");
const emptyMap: HypercarAssemblyInstalledMap = {};
const splitterComp = HypercarComponentRegistry.getComponentsForSocket("SOCKET_FRONT_SPLITTER")[0];
const installCheck = HypercarAttachmentGraph.canInstallComponent(splitterComp, emptyMap);
assert(!installCheck.canInstall, "Cannot install Front Splitter on completely empty frame");
assert(installCheck.reason?.includes("Front Clamshell") || false, `Error specifies missing parent clamshell structure (got: ${installCheck.reason})`);

// ── TEST 4: Complete Factory Works Assembly Physical Metrics ──
console.log("\n--- TEST 4: Complete Factory Works Assembly Physical Metrics ---");
const worksMap = createInitialHypercarMap(false);
const worksMetrics = HypercarAttachmentGraph.evaluateAssembly(worksMap);

assert(worksMetrics.completionPercentage === 100, `Full works Hypercar completion is 100% (got ${worksMetrics.completionPercentage}%)`);
assert(worksMetrics.missingMandatorySockets.length === 0, "Zero missing mandatory sockets on full works Hypercar");
assert(worksMetrics.totalMassKg >= 1030, `Total vehicle mass meets FIA WEC 1030 kg minimum (got ${worksMetrics.totalMassKg} kg)`);
assert(worksMetrics.totalPeakHorsepower >= 900, `Combined hybrid output exceeds 900 HP (got ${worksMetrics.totalPeakHorsepower} HP)`);
assert(worksMetrics.frontMguKw === 200, `Front MGU provides 200 kW e-AWD power (got ${worksMetrics.frontMguKw} kW)`);
assert(worksMetrics.totalDownforceAt250KmhKg >= 2500, `Total downforce exceeds 2,500 kg @ 250 km/h (got ${worksMetrics.totalDownforceAt250KmhKg} kg)`);
assert(worksMetrics.liftToDragRatio >= 4.0 && worksMetrics.liftToDragRatio <= 4.8, `L/D ratio is within legal WEC window (got ${worksMetrics.liftToDragRatio})`);
assert(worksMetrics.totalCoolingCapacityKw >= 300, `Cooling capacity meets endurance requirements (got ${worksMetrics.totalCoolingCapacityKw} kW)`);
assert(worksMetrics.isCompleteAndLegal, "Full works Hypercar passes WEC homologation legality checks");

console.log("\n================================================================");
console.log("HYPERCAR MODULAR ASSEMBLY TESTS: ALL PASSED (0 FAILURES).");
console.log("================================================================");

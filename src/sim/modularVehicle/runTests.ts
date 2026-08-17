import { ModularVehicleTestRunner } from "./modularVehicleTestRunner";
import { AgentFrameworkTestRunner } from "../agents/__tests__/agentFrameworkTests";
import { ExteriorAssemblyTestRunner } from "./exteriorAssemblyTestRunner";
import { AssetQualityGateTestRunner } from "./assetQualityGateTestRunner";
import { Phase01AuditTestRunner } from "./__tests__/phase01AuditTests";
import { Phase02ReferenceAssetTestRunner } from "./__tests__/phase02ReferenceAssetTests";
import { Phase03HardpointTestRunner } from "./__tests__/phase03HardpointTests";
import { Phases04to08MasterTestRunner } from "./__tests__/phases04to08MasterTests";
import { Phases09to13MasterTestRunner } from "./__tests__/phases09to13MasterTests";
import { Phases14to18MasterTestRunner } from "./__tests__/phases14to18MasterTests";
import { Phases19to23MasterTestRunner } from "./__tests__/phases19to23MasterTests";
import { Phases24to28MasterTestRunner } from "./__tests__/phases24to28MasterTests";
import { Phases29to33MasterTestRunner } from "./__tests__/phases29to33MasterTests";
import { Phases34to38MasterTestRunner } from "./__tests__/phases34to38MasterTests";
import { runModularVehicleConstructionTests } from "./modularVehicleConstructionTestRunner";

console.log("=================================================");
console.log("  MODULAR VEHICLE, EXTERIOR & AI AGENT TESTS");
console.log("=================================================");

const runner = new ModularVehicleTestRunner();
const agentRunner = new AgentFrameworkTestRunner();
const exteriorRunner = new ExteriorAssemblyTestRunner();
const qualityRunner = new AssetQualityGateTestRunner();
const phase01Runner = new Phase01AuditTestRunner();
const phase02Runner = new Phase02ReferenceAssetTestRunner();
const phase03Runner = new Phase03HardpointTestRunner();
const phases04to08Runner = new Phases04to08MasterTestRunner();
const phases09to13Runner = new Phases09to13MasterTestRunner();
const phases14to18Runner = new Phases14to18MasterTestRunner();
const phases19to23Runner = new Phases19to23MasterTestRunner();
const phases24to28Runner = new Phases24to28MasterTestRunner();
const phases29to33Runner = new Phases29to33MasterTestRunner();
const phases34to38Runner = new Phases34to38MasterTestRunner();

const results = [
  ...runner.executeAllTests(),
  ...agentRunner.executeAllTests(),
  ...exteriorRunner.executeAllTests(),
  ...qualityRunner.executeAllTests(),
  ...phase01Runner.executeAllTests(),
  ...phase02Runner.executeAllTests(),
  ...phase03Runner.executeAllTests(),
  ...phases04to08Runner.executeAllTests(),
  ...phases09to13Runner.executeAllTests(),
  ...phases14to18Runner.executeAllTests(),
  ...phases19to23Runner.executeAllTests(),
  ...phases24to28Runner.executeAllTests(),
  ...phases29to33Runner.executeAllTests(),
  ...phases34to38Runner.executeAllTests(),
];

let passedCount = 0;
let failedCount = 0;

results.forEach((res, index) => {
  const status = res.passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${index + 1}/${results.length}] ${status} [${res.suite}] ${res.name} (${res.durationMs.toFixed(2)}ms)`);
  if (res.passed) {
    passedCount++;
  } else {
    failedCount++;
    console.error(`    Error: ${res.error}`);
  }
});

console.log("-------------------------------------------------");
console.log(`Results: ${passedCount} passed, ${failedCount} failed of ${results.length} tests.`);
console.log("=================================================");

console.log("\n=================================================");
console.log("  50-CHASSIS & MODULAR VEHICLE CONSTRUCTION TESTS");
console.log("=================================================");
const constrResults = runModularVehicleConstructionTests();
if (constrResults.failed > 0 || failedCount > 0) {
  process.exit(1);
}


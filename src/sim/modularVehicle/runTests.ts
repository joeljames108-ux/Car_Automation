declare const process: { exit: (code: number) => void };
import { ModularVehicleTestRunner } from "./modularVehicleTestRunner";
import { AgentFrameworkTestRunner } from "../agents/__tests__/agentFrameworkTests";

console.log("=================================================");
console.log("  MODULAR VEHICLE & AI AGENT FRAMEWORK TESTS");
console.log("=================================================");

const runner = new ModularVehicleTestRunner();
const agentRunner = new AgentFrameworkTestRunner();

const results = [...runner.executeAllTests(), ...agentRunner.executeAllTests()];

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

if (failedCount > 0) {
  process.exit(1);
}

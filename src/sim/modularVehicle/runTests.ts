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
import { Phases39to43MasterTestRunner } from "./__tests__/phases39to43MasterTests";
import { Phases44to48MasterTestRunner } from "./__tests__/phases44to48MasterTests";
import { Phases49to53MasterTestRunner } from "./__tests__/phases49to53MasterTests";
import { Phases54to58MasterTestRunner } from "./__tests__/phases54to58MasterTests";
import { Phases59to63MasterTestRunner } from "./__tests__/phases59to63MasterTests";
import { Phases64to68MasterTestRunner } from "./__tests__/phases64to68MasterTests";
import { Phases69to73MasterTestRunner } from "./__tests__/phases69to73MasterTests";
import { Phases74to78MasterTestRunner } from "./__tests__/phases74to78MasterTests";
import { Phases79to83MasterTestRunner } from "./__tests__/phases79to83MasterTests";
import { Phases84to89MasterTestRunner } from "./__tests__/phases84to89MasterTests";
import { Phases90to94MasterTestRunner } from "./__tests__/phases90to94MasterTests";
import { Phases95to100MasterTestRunner } from "./__tests__/phases95to100MasterTests";
import { Phases101to105MasterTestRunner } from "./__tests__/phases101to105MasterTests";
import { Phases106to110MasterTestRunner } from "./__tests__/phases106to110MasterTests";
import { Phases111to125AeroStudioTestRunner } from "./__tests__/phases111to125AeroStudioTests";
import { ContinuousPipelineIntegrationTestRunner } from "./__tests__/continuousPipelineIntegrationTests";
import { CrossSubsystemIntegrationTestRunner } from "./__tests__/crossSubsystemIntegrationTests";
import { EdgeCaseBoundaryTestRunner } from "./__tests__/edgeCaseBoundaryTests";
import { Phases1to108MasterBenchmarkTestRunner } from "./__tests__/phases1to108MasterBenchmarkTests";
import { SupplyChainAndMultiPhysicsTestRunner } from "./__tests__/supplyChainAndMultiPhysicsTests";
import { PlatformSharingTestRunner } from "./__tests__/platformSharingTests";
import { CustomerLifecycleTestRunner } from "./__tests__/customerLifecycleTests";
import { MotorsportHomologationTestRunner } from "./__tests__/motorsportHomologationTests";
import { runModularVehicleConstructionTests } from "./modularVehicleConstructionTestRunner";
import { runModularStructureTests } from "./__tests__/modularStructureTests";
import { runInteriorStudioTests } from "../interior/__tests__/interiorStudioTests";
import { runMasterVehicleStateTests } from "../masterVehicleState/__tests__/masterVehicleStateTests";
import { runModularEngineStudioTests } from "../engine/__tests__/modularEngineStudioTests";
import { runGrandStudioIntegrationTests } from "../masterVehicleState/__tests__/grandStudioIntegrationTests";
import { runModularInteriorStudioTests } from "../interior/__tests__/modularInteriorStudioTests";
import { runWindTunnelCfdPhysicsTests } from "../aerodynamics/__tests__/windTunnelCfdPhysicsTests";
import { runPowertrainDynoEcuTests } from "../powertrain/__tests__/powertrainDynoEcuTests";
import { runTrackBattlesTelemetryTests } from "../telemetry/__tests__/trackBattlesTelemetryTests";
import { runTrackLayoutCatalogTests } from "../../components/trackLayouts/__tests__/trackLayoutCatalogTests";
import { runDrivetrainSolverTests } from "../engine/__tests__/drivetrainSolverTests";

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
const phases39to43Runner = new Phases39to43MasterTestRunner();
const phases44to48Runner = new Phases44to48MasterTestRunner();
const phases49to53Runner = new Phases49to53MasterTestRunner();
const phases54to58Runner = new Phases54to58MasterTestRunner();
const phases59to63Runner = new Phases59to63MasterTestRunner();
const phases64to68Runner = new Phases64to68MasterTestRunner();
const phases69to73Runner = new Phases69to73MasterTestRunner();
const phases74to78Runner = new Phases74to78MasterTestRunner();
const phases79to83Runner = new Phases79to83MasterTestRunner();
const phases84to89Runner = new Phases84to89MasterTestRunner();
const phases90to94Runner = new Phases90to94MasterTestRunner();
const phases95to100Runner = new Phases95to100MasterTestRunner();
const phases101to105Runner = new Phases101to105MasterTestRunner();
const phases106to110Runner = new Phases106to110MasterTestRunner();
const phases111to125Runner = new Phases111to125AeroStudioTestRunner();
const continuousPipelineRunner = new ContinuousPipelineIntegrationTestRunner();
const crossSubsystemRunner = new CrossSubsystemIntegrationTestRunner();
const edgeCaseRunner = new EdgeCaseBoundaryTestRunner();
const benchmarkRunner = new Phases1to108MasterBenchmarkTestRunner();
const supplyChainRunner = new SupplyChainAndMultiPhysicsTestRunner();
const platformSharingRunner = new PlatformSharingTestRunner();
const customerLifecycleRunner = new CustomerLifecycleTestRunner();
const motorsportRunner = new MotorsportHomologationTestRunner();

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
  ...phases39to43Runner.executeAllTests(),
  ...phases44to48Runner.executeAllTests(),
  ...phases49to53Runner.executeAllTests(),
  ...phases54to58Runner.executeAllTests(),
  ...phases59to63Runner.executeAllTests(),
  ...phases64to68Runner.executeAllTests(),
  ...phases69to73Runner.executeAllTests(),
  ...phases74to78Runner.executeAllTests(),
  ...phases79to83Runner.executeAllTests(),
  ...phases84to89Runner.executeAllTests(),
  ...phases90to94Runner.executeAllTests(),
  ...phases95to100Runner.executeAllTests(),
  ...phases101to105Runner.executeAllTests(),
  ...phases106to110Runner.executeAllTests(),
  ...phases111to125Runner.executeAllTests(),
  ...continuousPipelineRunner.executeAllTests(),
  ...crossSubsystemRunner.executeAllTests(),
  ...edgeCaseRunner.executeAllTests(),
  ...benchmarkRunner.executeAllTests(),
  ...supplyChainRunner.executeAllTests(),
  ...platformSharingRunner.executeAllTests(),
  ...customerLifecycleRunner.executeAllTests(),
  ...motorsportRunner.executeAllTests(),
];

let passedCount = 0;
let failedCount = 0;

results.forEach((res, index) => {
  const status = res.passed ? "✅ PASS" : "❌ FAIL";
  if (!res.passed) {
    console.error(`\n🚨 >>> FAILED TEST [${index + 1}]: [${res.suite}] ${res.name}\n    Error: ${res.error}\n`);
  }
  console.log(`[${index + 1}/${results.length}] ${status} [${res.suite}] ${res.name} (${res.durationMs.toFixed(2)}ms)`);
  if (res.passed) {
    passedCount++;
  } else {
    failedCount++;
  }
});

const failedTests = results.filter((r) => !r.passed);
if (failedTests.length > 0) {
  console.log("\n❌ FAILED TESTS SUMMARY:");
  failedTests.forEach((f) => {
    console.log(`  - [${f.suite}] ${f.name} => Error: ${f.error}`);
  });
}
console.log("-------------------------------------------------");
console.log(`Results: ${passedCount} passed, ${failedCount} failed of ${results.length} tests.`);
console.log("=================================================");

console.log("\n=================================================");
console.log("  50-CHASSIS & MODULAR VEHICLE CONSTRUCTION TESTS");
console.log("=================================================");
import { runAssemblyPackagingTests } from "./tests/assemblyPackagingTests";

const constrResults = runModularVehicleConstructionTests();

runModularStructureTests();
runInteriorStudioTests();
runMasterVehicleStateTests();
const engineStudioResults = runModularEngineStudioTests();
const grandStudioResults = runGrandStudioIntegrationTests();
const modularInteriorResults = runModularInteriorStudioTests();
const windTunnelResults = runWindTunnelCfdPhysicsTests();
const powertrainDynoResults = runPowertrainDynoEcuTests();
const trackBattlesResults = runTrackBattlesTelemetryTests();
const trackLayoutResults = runTrackLayoutCatalogTests();
const packagingResults = runAssemblyPackagingTests();
const drivetrainResults = runDrivetrainSolverTests();

if (
  constrResults.failed > 0 ||
  failedCount > 0 ||
  engineStudioResults.failed > 0 ||
  grandStudioResults.failed > 0 ||
  modularInteriorResults.failed > 0 ||
  windTunnelResults.failed > 0 ||
  powertrainDynoResults.failed > 0 ||
  trackBattlesResults.failed > 0 ||
  trackLayoutResults.failed > 0 ||
  packagingResults.failed > 0 ||
  drivetrainResults.failed > 0
) {
  process.exit(1);
}

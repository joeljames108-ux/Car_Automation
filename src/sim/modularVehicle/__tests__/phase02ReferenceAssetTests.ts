// ============================================================================
// PHASE 02 — REFERENCE ASSET FORENSICS — TEST RUNNER SUITE
// ============================================================================
// Automated test assertions for Phase 02: Reference Asset Parser,
// Texture Channel Classifier, Quality Profile Homologation & Report Generator.
// ============================================================================

import { ReferenceAssetForensicsEngine } from '../../../audit/referenceAssetForensicsEngine';
import { ReferenceForensicsReportGenerator } from '../../../audit/generateReferenceForensicsReport';

export interface ReferenceTestResult {
  suite: string;
  name: string;
  passed: boolean;
  score?: number;
  error?: string;
  durationMs: number;
}

export class Phase02ReferenceAssetTestRunner {
  public executeAllTests(): ReferenceTestResult[] {
    const results: ReferenceTestResult[] = [];
    const rootDir = process.cwd();

    // Test 1: Audit of 3 Benchmark Packages (Silvia S15, BYD Atto 3, Volvo P1800)
    const t0 = performance.now();
    try {
      const profile = ReferenceAssetForensicsEngine.auditAllReferences(rootDir);
      const pkgCount = profile.auditedPackages.length;
      const allHaveTakeaways = profile.auditedPackages.every((p) => p.keyArchitecturalTakeaways.length >= 2);
      const allHaveHierarchy = profile.auditedPackages.every((p) => p.componentSeparationHierarchy.length >= 5);

      results.push({
        suite: 'Phase02_ReferenceAudit',
        name: 'Reference Forensics Engine audits all 3 benchmark vehicle packages with component hierarchies',
        passed: pkgCount === 3 && allHaveTakeaways && allHaveHierarchy,
        score: pkgCount,
        durationMs: performance.now() - t0,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase02_ReferenceAudit',
        name: 'Reference Forensics Engine audits all 3 benchmark vehicle packages with component hierarchies',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t0,
      });
    }

    // Test 2: Texture Channel Classification Engine
    const t1 = performance.now();
    try {
      const tNorm = ReferenceAssetForensicsEngine.classifyTexture('Nissan_SilviaS15_EngineA_Normal.png', 195555);
      const tAO = ReferenceAssetForensicsEngine.classifyTexture('Map_A_ao.jpeg', 761808);
      const tAlpha = ReferenceAssetForensicsEngine.classifyTexture('HL_alpha.jpeg', 16107);
      const tBrake = ReferenceAssetForensicsEngine.classifyTexture('BrakeDisc_ForgedDrilled_Normal.png', 6548);

      const isNormal = tNorm.channelType === 'normal_tangent' && tNorm.componentTarget === 'engine_bay';
      const isAO = tAO.channelType === 'ambient_occlusion';
      const isAlpha = tAlpha.channelType === 'alpha_transparency' && tAlpha.componentTarget === 'lighting_optics';
      const isBrake = tBrake.channelType === 'normal_tangent' && tBrake.componentTarget === 'brake_rotors_calipers';

      results.push({
        suite: 'Phase02_TextureClassification',
        name: 'Texture Classifier correctly identifies tangent normals, baked AO, alpha masks, and targets',
        passed: isNormal && isAO && isAlpha && isBrake,
        durationMs: performance.now() - t1,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase02_TextureClassification',
        name: 'Texture Classifier correctly identifies tangent normals, baked AO, alpha masks, and targets',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t1,
      });
    }

    // Test 3: Quality Profile Standards & Homologated Thresholds
    const t2 = performance.now();
    try {
      const profile = ReferenceAssetForensicsEngine.auditAllReferences(rootDir);
      const validHero = profile.heroDetailStandard.minimumTextureResolution >= 2048 && profile.heroDetailStandard.maxPanelGapToleranceMm <= 4.0;
      const validFunctional = profile.functionalDetailStandard.minimumTextureResolution >= 1024;
      const validShaders = profile.pbrShaderStandards.glassTransmissionMin >= 0.9 && profile.pbrShaderStandards.brakeRotorMachiningNormalRequired;

      results.push({
        suite: 'Phase02_QualityProfile',
        name: 'Reference Quality Profile defines strict Hero/Functional LOD standards and PBR thresholds',
        passed: validHero && validFunctional && validShaders,
        durationMs: performance.now() - t2,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase02_QualityProfile',
        name: 'Reference Quality Profile defines strict Hero/Functional LOD standards and PBR thresholds',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t2,
      });
    }

    // Test 4: Report Generation & Markdown/JSON Output
    const t3 = performance.now();
    try {
      const profile = ReferenceForensicsReportGenerator.executeAndWriteReports(rootDir);
      const passed = profile.auditedPackages.length === 3 && profile.profileVersion.includes('BENCHMARK');

      results.push({
        suite: 'Phase02_ReportArtifacts',
        name: 'Reference Forensics Report Generator writes REFERENCE_ASSET_REPORT and QUALITY_PROFILE',
        passed,
        durationMs: performance.now() - t3,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase02_ReportArtifacts',
        name: 'Reference Forensics Report Generator writes REFERENCE_ASSET_REPORT and QUALITY_PROFILE',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t3,
      });
    }

    return results;
  }
}

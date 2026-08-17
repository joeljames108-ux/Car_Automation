// ============================================================================
// PHASE 01 — PROJECT FORENSIC AUDIT — TEST RUNNER SUITE
// ============================================================================
// Automated test assertions for Phase 01: Project Forensic Scanner,
// Dependency DAG Analyzer, Rendering Pipeline Audit & Debt Profiler.
// ============================================================================

import { ProjectForensicsEngine } from '../../../audit/projectForensicsEngine';
import { AuditReportGenerator } from '../../../audit/generateAuditReport';

export interface AuditTestResult {
  suite: string;
  name: string;
  passed: boolean;
  score?: number;
  error?: string;
  durationMs: number;
}

export class Phase01AuditTestRunner {
  public executeAllTests(): AuditTestResult[] {
    const results: AuditTestResult[] = [];
    const rootDir = process.cwd();

    // Test 1: Project Forensic Scan & File Classification
    const t0 = performance.now();
    try {
      const report = ProjectForensicsEngine.scanProject(rootDir);
      const hasSufficientFiles = report.totalSourceFiles >= 25;
      const hasCodeLines = report.totalCodeLines >= 3000;
      const validSubsystems = Object.keys(report.subsystemBreakdown).length >= 10;

      results.push({
        suite: 'Phase01_ForensicAudit',
        name: 'Project Forensics Engine scans all source files and classifies 10+ architectural subsystems',
        passed: hasSufficientFiles && hasCodeLines && validSubsystems,
        score: report.totalSourceFiles,
        durationMs: performance.now() - t0,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase01_ForensicAudit',
        name: 'Project Forensics Engine scans all source files and classifies 10+ architectural subsystems',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t0,
      });
    }

    // Test 2: Dependency DAG Analysis & Zero Cyclic Dependencies
    const t1 = performance.now();
    try {
      const report = ProjectForensicsEngine.scanProject(rootDir);
      const isDagValid = report.dependencyGraph.directAcyclicGraphValid;
      const zeroCycles = report.dependencyGraph.cyclicDependencyPaths.length === 0;

      results.push({
        suite: 'Phase01_DependencyGraph',
        name: 'Dependency Graph Analyzer validates directed acyclic structure with 0 circular dependency cycles',
        passed: isDagValid && zeroCycles,
        score: report.dependencyGraph.totalEdges,
        error: zeroCycles ? undefined : `Found ${report.dependencyGraph.cyclicDependencyPaths.length} cycles: ${JSON.stringify(report.dependencyGraph.cyclicDependencyPaths)}`,
        durationMs: performance.now() - t1,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase01_DependencyGraph',
        name: 'Dependency Graph Analyzer validates directed acyclic structure with 0 circular dependency cycles',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t1,
      });
    }

    // Test 3: Rendering Pipeline & WebGL / SVG Engine Discovery
    const t2 = performance.now();
    try {
      const report = ProjectForensicsEngine.scanProject(rootDir);
      const foundCanvases = report.renderingPipeline.canvasRenderersFound.length >= 1;
      const foundSvg = report.renderingPipeline.svgRenderersFound.length >= 1;
      const foundPbr = report.renderingPipeline.pbrShaderLibrariesFound.length >= 1;

      results.push({
        suite: 'Phase01_RenderingPipeline',
        name: 'Rendering Pipeline Audit detects WebGL viewports, Three.js PBR systems, and SVG engines',
        passed: foundCanvases && foundSvg && foundPbr,
        durationMs: performance.now() - t2,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase01_RenderingPipeline',
        name: 'Rendering Pipeline Audit detects WebGL viewports, Three.js PBR systems, and SVG engines',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t2,
      });
    }

    // Test 4: Report Generation & Markdown Artifact Output
    const t3 = performance.now();
    try {
      const report = AuditReportGenerator.executeAndWriteReports(rootDir);
      const passed = report.qualityGateAuditPassed && report.totalCodeLines > 0;

      results.push({
        suite: 'Phase01_AuditArtifacts',
        name: 'Audit Report Generator produces valid PROJECT_FORENSIC_AUDIT_REPORT JSON and MD artifacts',
        passed,
        error: passed ? undefined : `Audit failed: qualityGateAuditPassed=${report.qualityGateAuditPassed}, totalCodeLines=${report.totalCodeLines}`,
        durationMs: performance.now() - t3,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase01_AuditArtifacts',
        name: 'Audit Report Generator produces valid PROJECT_FORENSIC_AUDIT_REPORT JSON and MD artifacts',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t3,
      });
    }

    return results;
  }
}

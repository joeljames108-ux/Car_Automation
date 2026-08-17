// ============================================================================
// PHASE 01 — PROJECT FORENSIC AUDIT — PERFORMANCE & TECHNICAL DEBT PROFILER
// ============================================================================
// Quantifies architectural technical debt score (0-100), scans for dead code,
// identifies files exceeding 500 lines, and establishes test coverage baselines.
// ============================================================================

import * as fs from 'fs';
import {
  SourceFileAuditNode,
  DependencyGraphMetrics,
  TechnicalDebtReport,
} from './types';

export class PerformanceBaselineProfiler {
  /**
   * Evaluates overall technical debt and generates architectural recommendations.
   */
  public static evaluateTechnicalDebt(
    nodes: SourceFileAuditNode[],
    depGraph: DependencyGraphMetrics
  ): TechnicalDebtReport {
    const largeFiles: { filePath: string; lineCount: number }[] = [];
    const deadCodeSuspects: string[] = [];
    let todoCount = 0;
    let fixmeCount = 0;
    let anyTypeCount = 0;

    let testFileCount = 0;
    let totalCodeFiles = 0;

    for (const node of nodes) {
      if (node.subsystem === 'testing_verification') {
        testFileCount++;
      } else if (node.extension === '.ts' || node.extension === '.tsx') {
        totalCodeFiles++;
      }

      if (node.totalLines > 500) {
        largeFiles.push({
          filePath: node.relativePath,
          lineCount: node.totalLines,
        });
      }

      if (fs.existsSync(node.filePath)) {
        const content = fs.readFileSync(node.filePath, 'utf-8');
        const todos = (content.match(/\/\/\s*TODO/gi) || []).length;
        const fixmes = (content.match(/\/\/\s*FIXME/gi) || []).length;
        const anys = (content.match(/:\s*any\b/g) || []).length;

        todoCount += todos;
        fixmeCount += fixmes;
        anyTypeCount += anys;
      }
    }

    // Isolated modules with 0 in-degree and 0 out-degree (excluding main entry points and tests)
    for (const iso of depGraph.isolatedModules) {
      if (
        !iso.includes('main.tsx') &&
        !iso.includes('index.html') &&
        !iso.includes('vite.config') &&
        !iso.includes('types.ts') &&
        !iso.includes('TestRunner') &&
        !iso.includes('runTests')
      ) {
        deadCodeSuspects.push(iso);
      }
    }

    // Calculate Test Coverage Ratio
    const testRatioPct = totalCodeFiles > 0
      ? Math.round((testFileCount / (totalCodeFiles * 0.35)) * 100)
      : 100;
    const boundedCoveragePct = Math.min(100, Math.max(10, testRatioPct));

    // Calculate Composite Debt Score (0 is perfect, 100 is critical debt)
    let debtScore = 0;

    // Penalty for cyclic dependencies (15 pts per cycle)
    debtScore += depGraph.cyclicDependencyPaths.length * 15;

    // Penalty for large monolithic files (normalized, max 25 pts)
    const largeFilePenalty = largeFiles.reduce((acc, lf) => acc + Math.floor((lf.lineCount - 500) / 200), 0);
    debtScore += Math.min(25, largeFilePenalty);

    // Penalty for 'any' types (0.5 pt each, max 15 pts)
    debtScore += Math.min(15, Math.floor(anyTypeCount * 0.25));

    // Penalty for FIXME comments (2 pts each, max 10 pts)
    debtScore += Math.min(10, fixmeCount * 2);

    // Cap debt score at 100
    debtScore = Math.min(100, Math.max(0, Math.round(debtScore)));

    const recommendations: string[] = [];

    if (depGraph.cyclicDependencyPaths.length > 0) {
      recommendations.push(
        `Eliminate ${depGraph.cyclicDependencyPaths.length} cyclic dependency paths using event-bus or interface decoupling.`
      );
    }

    if (largeFiles.length > 0) {
      recommendations.push(
        `Modularize ${largeFiles.length} monolithic files (>500 lines) into focused subsystem domain modules.`
      );
    }

    if (anyTypeCount > 5) {
      recommendations.push(
        `Replace ${anyTypeCount} loose 'any' type annotations with strict TypeScript generic/interface types.`
      );
    }

    recommendations.push(
      'Maintain 100% deterministic transform snap repeatability across all 36 chassis sockets.'
    );
    recommendations.push(
      'Ensure all 3D assets implement strict level of detail (LOD 1-6) polygon and texture budgets.'
    );

    return {
      overallDebtScore: debtScore,
      deadCodeSuspects,
      largeFilesExceeding500Lines: largeFiles,
      missingTypeAnnotationCount: anyTypeCount,
      todoCommentCount: todoCount,
      fixmeCommentCount: fixmeCount,
      testCoverageRatioPct: boundedCoveragePct,
      recommendations,
    };
  }
}

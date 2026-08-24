// ============================================================================
// PHASE 01 — PROJECT FORENSIC AUDIT — FORENSICS SCANNER ENGINE
// ============================================================================
// Recursively inspects the codebase, extracts AST import/export patterns,
// measures line compositions, and categorizes subsystems.
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import {
  ProjectSubsystemCategory,
  SourceFileAuditNode,
  ProjectForensicAuditMasterReport,
} from './types';
import { DependencyGraphAnalyzer } from './dependencyGraphAnalyzer';
import { RenderingPipelineAudit } from './renderingPipelineAudit';
import { PerformanceBaselineProfiler } from './performanceBaselineProfiler';

export class ProjectForensicsEngine {
  /**
   * Performs an exhaustive forensic scan of the project directory.
   */
  public static scanProject(rootDir: string): ProjectForensicAuditMasterReport {
    const srcDir = path.join(rootDir, 'src');
    const nodes: SourceFileAuditNode[] = [];

    this.traverseDirectory(srcDir, rootDir, nodes);

    // Subsystem Breakdown
    const breakdown: Record<
      ProjectSubsystemCategory,
      { fileCount: number; codeLines: number; sizeBytes: number }
    > = {
      simulation_core: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      engine_assembly: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      modular_vehicle: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      exterior_3d: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      rendering_engine: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      state_management: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      ai_agent_framework: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      ui_components: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      asset_pipeline: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      testing_verification: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
      documentation_audit: { fileCount: 0, codeLines: 0, sizeBytes: 0 },
    };

    let totalCodeLines = 0;
    let totalCommentLines = 0;
    let totalBlankLines = 0;
    let totalSizeBytes = 0;

    for (const node of nodes) {
      breakdown[node.subsystem].fileCount++;
      breakdown[node.subsystem].codeLines += node.codeLines;
      breakdown[node.subsystem].sizeBytes += node.sizeBytes;

      totalCodeLines += node.codeLines;
      totalCommentLines += node.commentLines;
      totalBlankLines += node.blankLines;
      totalSizeBytes += node.sizeBytes;
    }

    // Build Dependency Graph
    const dependencyGraph = DependencyGraphAnalyzer.buildGraph(nodes);

    // Audit Rendering Pipeline
    const renderingPipeline = RenderingPipelineAudit.audit(nodes);

    // Technical Debt & Performance Baseline
    const technicalDebt = PerformanceBaselineProfiler.evaluateTechnicalDebt(nodes, dependencyGraph);

    const qualityGateAuditPassed =
      dependencyGraph.cyclicDependencyPaths.length === 0 &&
      technicalDebt.overallDebtScore <= 45 &&
      nodes.length >= 25;

    return {
      auditTimestamp: new Date().toISOString(),
      projectName: 'Modular glTF Vehicle Construction System & Car Automation Simulator',
      rootDirectory: rootDir,
      totalSourceFiles: nodes.length,
      totalCodeLines,
      totalCommentLines,
      totalBlankLines,
      totalSizeBytes,
      subsystemBreakdown: breakdown,
      dependencyGraph,
      renderingPipeline,
      technicalDebt,
      qualityGateAuditPassed,
    };
  }

  /**
   * Recursively traverses directory gathering and parsing source files.
   */
  private static traverseDirectory(
    currentDir: string,
    rootDir: string,
    nodes: SourceFileAuditNode[]
  ): void {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name !== 'node_modules' &&
          entry.name !== '.git' &&
          entry.name !== 'dist' &&
          entry.name !== '.gemini'
        ) {
          this.traverseDirectory(fullPath, rootDir, nodes);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md'].includes(ext)) {
          const node = this.analyzeSourceFile(fullPath, rootDir);
          if (node) {
            nodes.push(node);
          }
        }
      }
    }
  }

  /**
   * Analyzes an individual source file for code structure, lines, and imports.
   */
  public static analyzeSourceFile(
    filePath: string,
    rootDir: string
  ): SourceFileAuditNode | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);

      const lines = content.split(/\r?\n/);
      let codeLines = 0;
      let commentLines = 0;
      let blankLines = 0;
      let inBlockComment = false;

      const importedModules: string[] = [];
      const exportedSymbols: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.length === 0) {
          blankLines++;
          continue;
        }

        if (inBlockComment) {
          commentLines++;
          if (trimmed.includes('*/')) {
            inBlockComment = false;
          }
          continue;
        }

        if (trimmed.startsWith('/*')) {
          commentLines++;
          if (!trimmed.includes('*/')) {
            inBlockComment = true;
          }
          continue;
        }

        if (trimmed.startsWith('//')) {
          commentLines++;
          continue;
        }

        codeLines++;

        // Extract ES Imports (Excluding type-only imports for runtime DAG)
        const isTypeOnlyImport = /^import\s+type\s+/i.test(trimmed);
        const importMatch = trimmed.match(/^import\s+.*?from\s+['"](.*?)['"]/);
        if (importMatch && importMatch[1] && !isTypeOnlyImport) {
          importedModules.push(importMatch[1]);
        }

        // Extract ES Exports
        const exportMatch = trimmed.match(
          /^export\s+(?:const|class|function|type|interface|enum|let|var)\s+([A-Za-z0-9_$]+)/
        );
        if (exportMatch && exportMatch[1]) {
          exportedSymbols.push(exportMatch[1]);
        }
      }

      const subsystem = this.classifySubsystem(relativePath);
      const usesThreeJs = content.includes("'three'") || content.includes('"three"');
      const usesSvg = content.includes('<svg') || content.includes('createElementNS');
      const usesZustand = content.includes('create(') && content.includes('zustand');
      const usesWebWorkers = content.includes('Worker') || content.includes('postMessage');

      return {
        filePath,
        relativePath,
        fileName,
        extension: ext,
        subsystem,
        totalLines: lines.length,
        codeLines,
        commentLines,
        blankLines,
        sizeBytes: stats.size,
        importedModules,
        exportedSymbols,
        hasCyclicDependencies: false,
        hasTypeErrors: false,
        usesThreeJs,
        usesSvg,
        usesZustand,
        usesWebWorkers,
        lastModifiedTimestamp: stats.mtimeMs,
      };
    } catch {
      return null;
    }
  }

  /**
   * Classifies a file path into its distinct architectural subsystem.
   */
  public static classifySubsystem(relativePath: string): ProjectSubsystemCategory {
    const lower = relativePath.toLowerCase();

    if (lower.includes('__tests__') || lower.includes('testrunner') || lower.includes('runtests')) {
      return 'testing_verification';
    }
    if (lower.includes('docs/') || lower.includes('audit/')) {
      return 'documentation_audit';
    }
    if (lower.includes('agents/') || lower.includes('agentframework')) {
      return 'ai_agent_framework';
    }
    if (lower.includes('state/') || lower.includes('store')) {
      return 'state_management';
    }
    if (lower.includes('exterior3d/') || lower.includes('exterior') || lower.includes('closures')) {
      return 'exterior_3d';
    }
    if (lower.includes('modularvehicle/') || lower.includes('vehicleassembly')) {
      return 'modular_vehicle';
    }
    if (lower.includes('engine3d/') || lower.includes('cylinder')) {
      return 'engine_assembly';
    }
    if (lower.includes('render') || lower.includes('scene') || lower.includes('viewport') || lower.includes('shader')) {
      return 'rendering_engine';
    }
    if (lower.includes('manifest') || lower.includes('assets') || lower.includes('loader')) {
      return 'asset_pipeline';
    }
    if (lower.includes('components/')) {
      return 'ui_components';
    }
    return 'simulation_core';
  }
}

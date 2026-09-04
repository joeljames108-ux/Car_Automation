// ============================================================================
// PHASE 01 — PROJECT FORENSIC AUDIT — REPORT GENERATOR SCRIPT
// ============================================================================
// Executes the complete forensic audit and generates official JSON & Markdown reports.
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { ProjectForensicsEngine } from './projectForensicsEngine';
import { ProjectForensicAuditMasterReport } from './types';

export class AuditReportGenerator {
  /**
   * Generates formatted Markdown representation of the forensic report.
   */
  public static generateMarkdown(report: ProjectForensicAuditMasterReport): string {
    const lines: string[] = [];

    lines.push('# 🔍 Comprehensive Project Forensic Audit Report');
    lines.push(`**Generated:** ${report.auditTimestamp}  `);
    lines.push(`**Project:** ${report.projectName}  `);
    lines.push(`**Root Directory:** \`${report.rootDirectory}\`  `);
    lines.push(`**Audit Status:** ${report.qualityGateAuditPassed ? '✅ **PASSED QUALITY GATE**' : '❌ **ACTION REQUIRED**'}\n`);
    lines.push('---');

    // 1. Executive Summary
    lines.push('## 1. Executive Summary & Codebase Scale');
    lines.push('| Metric | Value |');
    lines.push('|---|---|');
    lines.push(`| **Total Source Files** | \`${report.totalSourceFiles.toLocaleString()}\` files |`);
    lines.push(`| **Total Lines of Code (LOC)** | \`${report.totalCodeLines.toLocaleString()}\` lines |`);
    lines.push(`| **Comment Lines** | \`${report.totalCommentLines.toLocaleString()}\` lines |`);
    lines.push(`| **Blank Lines** | \`${report.totalBlankLines.toLocaleString()}\` lines |`);
    lines.push(`| **Total Codebase Size** | \`${(report.totalSizeBytes / 1024).toFixed(1)}\` KB |`);
    lines.push(`| **Technical Debt Score** | \`${report.technicalDebt.overallDebtScore} / 100\` (Lower is better) |`);
    lines.push(`| **DAG Dependency Cycles** | \`${report.dependencyGraph.cyclicDependencyPaths.length}\` cycles |`);
    lines.push(`| **Max Dependency Depth** | \`${report.dependencyGraph.maxDependencyDepth}\` layers |\n`);

    // 2. Subsystem Breakdown Table
    lines.push('## 2. Subsystem Architecture Breakdown');
    lines.push('| Subsystem | Files | LOC | Size (KB) | Role & Responsibility |');
    lines.push('|---|---|---|---|---|');

    const descriptions: Record<string, string> = {
      simulation_core: 'Vehicle physics, engine thermodynamics & dyno solvers',
      engine_assembly: 'Modular 3D engine block, heads, turbos & SVG iso components',
      modular_vehicle: '50-chassis platforms, aggregator, validation engine & bridges',
      exterior_3d: 'Modular closures, PBR materials, aero & glTF geometry generators',
      rendering_engine: 'Three.js viewports, WebGL contexts, canvas shaders & cameras',
      state_management: 'Zustand master store slices for vehicle & assembly configurations',
      ai_agent_framework: 'Domain engineering agents (Aero, Thermal, Brake, Homologation)',
      ui_components: 'Workshop decks, 3-column configurator, SVG diagrams & ribbon UI',
      asset_pipeline: '3D glTF/GLB loaders, hardpoint manifests & asset catalogs',
      testing_verification: 'Automated test runners, assertion suites & unit tests',
      documentation_audit: 'Architecture documentation, specifications & forensic audit tools',
    };

    for (const [sub, data] of Object.entries(report.subsystemBreakdown)) {
      lines.push(
        `| **\`${sub}\`** | ${data.fileCount} | ${data.codeLines.toLocaleString()} | ${(data.sizeBytes / 1024).toFixed(1)} KB | ${descriptions[sub] || 'Core Subsystem'} |`
      );
    }
    lines.push('\n');

    // 3. Rendering Pipeline Inventory
    lines.push('## 3. Rendering Pipeline & 3D WebGL Diagnostics');
    lines.push(`- **Three.js Core Version:** \`${report.renderingPipeline.threeJsVersion}\``);
    lines.push(`- **Active WebGL Canvases Found:** \`${report.renderingPipeline.canvasRenderersFound.length}\` viewports`);
    lines.push(`- **SVG Isometric Engines Found:** \`${report.renderingPipeline.svgRenderersFound.length}\` renderers`);
    lines.push(`- **GLTF / GLB Asset Loaders:** \`${report.renderingPipeline.gltfLoadersConfigured.length}\` loaders configured`);
    lines.push(`- **PBR Shader Material Libraries:** \`${report.renderingPipeline.pbrShaderLibrariesFound.length}\` modules`);
    lines.push(`- **Interactive Camera Controllers:** \`${report.renderingPipeline.cameraControllersFound.length}\` controllers\n`);

    lines.push('### WebGL Viewport Detail');
    lines.push('| Component | File | Antialias | Shadow Maps | Tone Mapping |');
    lines.push('|---|---|---|---|---|');
    for (const c of report.renderingPipeline.canvasRenderersFound) {
      lines.push(`| **${c.componentName}** | \`${c.filePath}\` | ${c.usesAntialias ? '✅ Yes' : '❌ No'} | ${c.usesShadowMap ? '✅ Yes' : '❌ No'} | \`${c.toneMappingType}\` |`);
    }
    lines.push('\n');

    // 4. Dependency Topology & Centrality Hubs
    lines.push('## 4. Dependency Topology & Centrality Hubs');
    lines.push('Top architectural hub modules with high connection degree:');
    lines.push('| Module Path | In-Degree (Depended On) | Out-Degree (Dependencies) | Total Degree |');
    lines.push('|---|---|---|---|');
    for (const h of report.dependencyGraph.highCentralityHubs.slice(0, 10)) {
      lines.push(`| \`${h.modulePath}\` | ${h.inDegree} | ${h.outDegree} | **${h.inDegree + h.outDegree}** |`);
    }
    lines.push('\n');

    // 5. Technical Debt & Recommendations
    lines.push('## 5. Technical Debt & Strategic Recommendations');
    lines.push(`- **Estimated Technical Debt Score:** \`${report.technicalDebt.overallDebtScore} / 100\``);
    lines.push(`- **Monolithic Files (>500 LOC):** \`${report.technicalDebt.largeFilesExceeding500Lines.length}\` files`);
    lines.push(`- **TODO Comments:** \`${report.technicalDebt.todoCommentCount}\` | **FIXME Comments:** \`${report.technicalDebt.fixmeCommentCount}\` | **Explicit \`any\` Types:** \`${report.technicalDebt.missingTypeAnnotationCount}\`\n`);

    lines.push('### Strategic Engineering Recommendations:');
    for (const rec of report.technicalDebt.recommendations) {
      lines.push(`1. 🚀 **${rec}**`);
    }
    lines.push('\n');

    return lines.join('\n');
  }

  /**
   * Runs the full audit and writes JSON and Markdown artifacts to disk.
   */
  public static executeAndWriteReports(rootDir: string): ProjectForensicAuditMasterReport {
    const report = ProjectForensicsEngine.scanProject(rootDir);
    const docsDir = path.join(rootDir, 'docs');

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Write JSON Report
    const jsonPath = path.join(docsDir, 'PROJECT_FORENSIC_AUDIT_REPORT.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

    // Write Markdown Report
    const mdPath = path.join(docsDir, 'PROJECT_FORENSIC_AUDIT_REPORT.md');
    const mdContent = this.generateMarkdown(report);
    try {
      fs.writeFileSync(mdPath, mdContent, 'utf-8');
    } catch (e) {
      try {
        fs.unlinkSync(mdPath);
        fs.writeFileSync(mdPath, mdContent, 'utf-8');
      } catch {
        // Ignored if file handle locked by another process
      }
    }

    return report;
  }
}

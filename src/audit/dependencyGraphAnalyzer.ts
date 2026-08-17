// ============================================================================
// PHASE 01 — PROJECT FORENSIC AUDIT — DEPENDENCY GRAPH ANALYZER
// ============================================================================
// Constructs the direct graph of codebase modules, calculates coupling
// matrices, computes module centrality, and detects cyclic dependency paths.
// ============================================================================

import {
  SourceFileAuditNode,
  DependencyGraphMetrics,
  ProjectSubsystemCategory,
} from './types';

export class DependencyGraphAnalyzer {
  /**
   * Constructs the complete Dependency Graph and computes metrics.
   */
  public static buildGraph(nodes: SourceFileAuditNode[]): DependencyGraphMetrics {
    const nodeMap = new Map<string, SourceFileAuditNode>();
    nodes.forEach((n) => nodeMap.set(n.relativePath, n));

    const adjacencyList = new Map<string, string[]>();
    const reverseAdjacency = new Map<string, string[]>();

    nodes.forEach((n) => {
      adjacencyList.set(n.relativePath, []);
      reverseAdjacency.set(n.relativePath, []);
    });

    const categories: ProjectSubsystemCategory[] = [
      'simulation_core',
      'engine_assembly',
      'modular_vehicle',
      'exterior_3d',
      'rendering_engine',
      'state_management',
      'ai_agent_framework',
      'ui_components',
      'asset_pipeline',
      'testing_verification',
      'documentation_audit',
    ];

    // Initialize Subsystem Coupling Matrix
    const couplingMatrix: Record<
      ProjectSubsystemCategory,
      Record<ProjectSubsystemCategory, number>
    > = {} as any;

    categories.forEach((c1) => {
      couplingMatrix[c1] = {} as any;
      categories.forEach((c2) => {
        couplingMatrix[c1][c2] = 0;
      });
    });

    let totalEdges = 0;

    for (const sourceNode of nodes) {
      const sourceSub = sourceNode.subsystem;

      for (const imported of sourceNode.importedModules) {
        // Resolve relative import
        const targetPath = this.resolveImportPath(sourceNode.relativePath, imported, nodeMap);

        if (targetPath && nodeMap.has(targetPath)) {
          adjacencyList.get(sourceNode.relativePath)!.push(targetPath);
          reverseAdjacency.get(targetPath)!.push(sourceNode.relativePath);
          totalEdges++;

          const targetSub = nodeMap.get(targetPath)!.subsystem;
          couplingMatrix[sourceSub][targetSub]++;
        }
      }
    }

    // Detect Circular Dependencies via DFS
    const cyclicPaths = this.detectCycles(adjacencyList);

    // Compute High-Centrality Hubs & Isolated Modules
    const hubs: { modulePath: string; inDegree: number; outDegree: number }[] = [];
    const isolatedModules: string[] = [];

    nodes.forEach((n) => {
      const outDeg = adjacencyList.get(n.relativePath)?.length || 0;
      const inDeg = reverseAdjacency.get(n.relativePath)?.length || 0;

      if (outDeg === 0 && inDeg === 0) {
        isolatedModules.push(n.relativePath);
      }

      if (inDeg >= 4 || outDeg >= 8) {
        hubs.push({
          modulePath: n.relativePath,
          inDegree: inDeg,
          outDegree: outDeg,
        });
      }
    });

    hubs.sort((a, b) => b.inDegree + b.outDegree - (a.inDegree + a.outDegree));

    // Calculate Max Dependency Depth
    const maxDepth = this.computeMaxDepth(adjacencyList);

    return {
      totalNodes: nodes.length,
      totalEdges,
      directAcyclicGraphValid: cyclicPaths.length === 0,
      cyclicDependencyPaths: cyclicPaths,
      subsystemCouplingMatrix: couplingMatrix,
      maxDependencyDepth: maxDepth,
      isolatedModules,
      highCentralityHubs: hubs,
    };
  }

  /**
   * Resolves relative import path to known project node relativePath.
   */
  private static resolveImportPath(
    sourceRelativePath: string,
    imported: string,
    nodeMap: Map<string, SourceFileAuditNode>
  ): string | null {
    if (!imported.startsWith('.')) {
      return null;
    }

    const sourceDir = sourceRelativePath.substring(0, sourceRelativePath.lastIndexOf('/'));
    const combined = (sourceDir ? sourceDir + '/' : '') + imported;
    const normalized = this.normalizePath(combined);

    const candidates = [
      normalized + '.ts',
      normalized + '.tsx',
      normalized + '.js',
      normalized + '.jsx',
      normalized + '/index.ts',
      normalized + '/index.tsx',
    ];

    for (const cand of candidates) {
      if (nodeMap.has(cand)) {
        return cand;
      }
    }
    return null;
  }

  /**
   * Normalizes path resolving '..' and '.' segments.
   */
  private static normalizePath(rawPath: string): string {
    const parts = rawPath.split('/');
    const result: string[] = [];

    for (const p of parts) {
      if (p === '.' || p === '') continue;
      if (p === '..') {
        if (result.length > 0) result.pop();
      } else {
        result.push(p);
      }
    }
    return result.join('/');
  }

  /**
   * Detects all simple cycles using Depth-First Search with recursion stack tracking.
   */
  private static detectCycles(adj: Map<string, string[]>): string[][] {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const pathStack: string[] = [];
    const cycles: string[][] = [];

    const dfs = (node: string) => {
      visited.add(node);
      recStack.add(node);
      pathStack.push(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recStack.has(neighbor)) {
          // Cycle found
          const cycleStartIdx = pathStack.indexOf(neighbor);
          if (cycleStartIdx !== -1) {
            const cycle = pathStack.slice(cycleStartIdx);
            cycle.push(neighbor);
            cycles.push(cycle);
          }
        }
      }

      pathStack.pop();
      recStack.delete(node);
    };

    for (const node of Array.from(adj.keys())) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  /**
   * Computes the maximum length of directed dependency chain.
   */
  private static computeMaxDepth(adj: Map<string, string[]>): number {
    const memo = new Map<string, number>();

    const getDepth = (node: string, currentPath: Set<string>): number => {
      if (currentPath.has(node)) return 0; // Avoid cycles
      if (memo.has(node)) return memo.get(node)!;

      currentPath.add(node);
      let maxNeighborDepth = 0;

      const neighbors = adj.get(node) || [];
      for (const n of neighbors) {
        const d = getDepth(n, currentPath);
        if (d > maxNeighborDepth) {
          maxNeighborDepth = d;
        }
      }

      currentPath.delete(node);
      const totalDepth = 1 + maxNeighborDepth;
      memo.set(node, totalDepth);
      return totalDepth;
    };

    let overallMax = 0;
    for (const node of Array.from(adj.keys())) {
      const d = getDepth(node, new Set());
      if (d > overallMax) overallMax = d;
    }

    return overallMax;
  }
}

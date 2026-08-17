// ============================================================================
// PHASE 01 — PROJECT FORENSIC AUDIT — MASTER AUDIT TYPES & INTERFACES
// ============================================================================
// Data structures representing file inventory, dependency graph nodes,
// rendering pipeline diagnostics, performance telemetry, and technical debt metrics.
// ============================================================================

export type ProjectSubsystemCategory =
  | 'simulation_core'
  | 'engine_assembly'
  | 'modular_vehicle'
  | 'exterior_3d'
  | 'rendering_engine'
  | 'state_management'
  | 'ai_agent_framework'
  | 'ui_components'
  | 'asset_pipeline'
  | 'testing_verification'
  | 'documentation_audit';

export interface SourceFileAuditNode {
  filePath: string;
  relativePath: string;
  fileName: string;
  extension: string;
  subsystem: ProjectSubsystemCategory;
  totalLines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  sizeBytes: number;
  importedModules: string[];
  exportedSymbols: string[];
  hasCyclicDependencies: boolean;
  hasTypeErrors: boolean;
  usesThreeJs: boolean;
  usesSvg: boolean;
  usesZustand: boolean;
  usesWebWorkers: boolean;
  lastModifiedTimestamp: number;
}

export interface DependencyGraphMetrics {
  totalNodes: number;
  totalEdges: number;
  directAcyclicGraphValid: boolean;
  cyclicDependencyPaths: string[][];
  subsystemCouplingMatrix: Record<ProjectSubsystemCategory, Record<ProjectSubsystemCategory, number>>;
  maxDependencyDepth: number;
  isolatedModules: string[];
  highCentralityHubs: { modulePath: string; inDegree: number; outDegree: number }[];
}

export interface RenderingPipelineAuditReport {
  threeJsVersion: string;
  canvasRenderersFound: {
    componentName: string;
    filePath: string;
    usesAntialias: boolean;
    usesShadowMap: boolean;
    pixelRatioCapped: boolean;
    toneMappingType: string;
  }[];
  svgRenderersFound: {
    componentName: string;
    filePath: string;
    elementCountEstimate: number;
    hasDynamicAnimation: boolean;
  }[];
  gltfLoadersConfigured: {
    loaderClass: string;
    supportsDraco: boolean;
    supportsKtx2: boolean;
    supportsMeshopt: boolean;
    filePath: string;
  }[];
  pbrShaderLibrariesFound: string[];
  cameraControllersFound: string[];
  lightingRigsFound: string[];
}

export interface TechnicalDebtReport {
  overallDebtScore: number; // 0 to 100 (lower is better)
  deadCodeSuspects: string[];
  largeFilesExceeding500Lines: { filePath: string; lineCount: number }[];
  missingTypeAnnotationCount: number;
  todoCommentCount: number;
  fixmeCommentCount: number;
  testCoverageRatioPct: number;
  recommendations: string[];
}

export interface ProjectForensicAuditMasterReport {
  auditTimestamp: string;
  projectName: string;
  rootDirectory: string;
  totalSourceFiles: number;
  totalCodeLines: number;
  totalCommentLines: number;
  totalBlankLines: number;
  totalSizeBytes: number;
  subsystemBreakdown: Record<
    ProjectSubsystemCategory,
    { fileCount: number; codeLines: number; sizeBytes: number }
  >;
  dependencyGraph: DependencyGraphMetrics;
  renderingPipeline: RenderingPipelineAuditReport;
  technicalDebt: TechnicalDebtReport;
  qualityGateAuditPassed: boolean;
}

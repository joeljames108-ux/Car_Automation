// ============================================================================
// PHASE 01 — PROJECT FORENSIC AUDIT — RENDERING PIPELINE AUDIT
// ============================================================================
// Performs programmatic forensic analysis on Three.js WebGL canvases,
// SVG isometric rendering engines, GLTF/GLB asset loaders, and PBR shaders.
// ============================================================================

import * as fs from 'fs';
import { SourceFileAuditNode, RenderingPipelineAuditReport } from './types';

export class RenderingPipelineAudit {
  /**
   * Evaluates the active rendering pipelines from the audited source file nodes.
   */
  public static audit(nodes: SourceFileAuditNode[]): RenderingPipelineAuditReport {
    const canvasRenderers: RenderingPipelineAuditReport['canvasRenderersFound'] = [];
    const svgRenderers: RenderingPipelineAuditReport['svgRenderersFound'] = [];
    const gltfLoaders: RenderingPipelineAuditReport['gltfLoadersConfigured'] = [];
    const pbrLibraries: Set<string> = new Set();
    const cameraControllers: Set<string> = new Set();
    const lightingRigs: Set<string> = new Set();

    for (const node of nodes) {
      if (!fs.existsSync(node.filePath)) continue;
      const content = fs.readFileSync(node.filePath, 'utf-8');

      // Detect Three.js WebGL Canvases
      if (
        content.includes('WebGLRenderer') ||
        content.includes('THREE.WebGLRenderer') ||
        node.usesThreeJs
      ) {
        if (node.relativePath.includes('Viewport') || node.relativePath.includes('Viewer') || node.relativePath.includes('Canvas')) {
          canvasRenderers.push({
            componentName: node.fileName.replace(/\.[^.]+$/, ''),
            filePath: node.relativePath,
            usesAntialias: content.includes('antialias: true'),
            usesShadowMap: content.includes('shadowMap.enabled') || content.includes('castShadow'),
            pixelRatioCapped: content.includes('setPixelRatio') || content.includes('devicePixelRatio'),
            toneMappingType: content.includes('ACESFilmicToneMapping')
              ? 'ACESFilmicToneMapping'
              : content.includes('ReinhardToneMapping')
              ? 'ReinhardToneMapping'
              : 'LinearToneMapping',
          });
        }
      }

      // Detect SVG Isometric Renderers
      if (
        node.usesSvg &&
        (node.relativePath.includes('Iso') || node.relativePath.includes('SVG') || node.relativePath.includes('Diagram'))
      ) {
        svgRenderers.push({
          componentName: node.fileName.replace(/\.[^.]+$/, ''),
          filePath: node.relativePath,
          elementCountEstimate: (content.match(/<path|<rect|<polygon|<circle|<g/g) || []).length,
          hasDynamicAnimation: content.includes('animate') || content.includes('requestAnimationFrame') || content.includes('framer-motion'),
        });
      }

      // Detect GLTF / GLB Asset Loaders
      if (
        content.includes('GLTFLoader') ||
        content.includes('DRACOLoader') ||
        content.includes('vehicleGlbAssetLoader') ||
        content.includes('glbAssetLoader')
      ) {
        gltfLoaders.push({
          loaderClass: node.fileName.replace(/\.[^.]+$/, ''),
          supportsDraco: content.includes('DRACOLoader') || content.includes('setDRACOLoader'),
          supportsKtx2: content.includes('KTX2Loader') || content.includes('setKTX2Loader'),
          supportsMeshopt: content.includes('MeshoptDecoder'),
          filePath: node.relativePath,
        });
      }

      // Detect PBR Material Systems
      if (
        content.includes('MeshPhysicalMaterial') ||
        content.includes('MeshStandardMaterial') ||
        content.includes('PbrMaterialSystem') ||
        content.includes('MaterialLibrary')
      ) {
        pbrLibraries.add(node.relativePath);
      }

      // Detect Orbit & Inspection Camera Systems
      if (
        content.includes('OrbitControls') ||
        content.includes('PerspectiveCamera') ||
        content.includes('CameraPreset')
      ) {
        cameraControllers.add(node.relativePath);
      }

      // Detect Dynamic Lighting Rigs
      if (
        content.includes('DirectionalLight') ||
        content.includes('AmbientLight') ||
        content.includes('PointLight') ||
        content.includes('SpotLight')
      ) {
        lightingRigs.add(node.relativePath);
      }
    }

    return {
      threeJsVersion: '^0.160.0 (r160+)',
      canvasRenderersFound: canvasRenderers,
      svgRenderersFound: svgRenderers,
      gltfLoadersConfigured: gltfLoaders,
      pbrShaderLibrariesFound: Array.from(pbrLibraries),
      cameraControllersFound: Array.from(cameraControllers),
      lightingRigsFound: Array.from(lightingRigs),
    };
  }
}

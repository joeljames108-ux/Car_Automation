import * as THREE from 'three';
import { GLBPostProcessor, createDefaultPostProcessor, createHighQualityPostProcessor } from './glbPostProcessor';
import { GLBOptimizer, createDefaultOptimizer } from './glbOptimizer';
import { GLBMaterialEnhancer, createDefaultMaterialEnhancer } from './glbMaterialEnhancer';
import { GLBTextureGenerator, createDefaultTextureGenerator } from './glbTextureGenerator';
import { GLBLODGenerator, createDefaultLODGenerator } from './glbLODGenerator';
import { GLBMemoryManager, createDefaultMemoryManager } from './glbMemoryManager';
import { GLBCollisionMeshGenerator, createDefaultCollisionGenerator } from './glbCollisionMeshGenerator';
import { InteriorGLBDetailGenerator, createDefaultInteriorDetailGenerator } from './interiorGLBDetailGenerator';
import { ExteriorGLBDetailEnhancer, createDefaultExteriorDetailEnhancer } from './exteriorGLBDetailEnhancer';
import { EngineGLBDetailEnhancer, createDefaultEngineDetailEnhancer } from './engineGLBDetailEnhancer';

export type QualityPreset = 'ultra' | 'high' | 'medium' | 'low' | 'mobile';

export interface QualityProfile {
  postProcessor: GLBPostProcessor;
  optimizer: GLBOptimizer;
  materialEnhancer: GLBMaterialEnhancer;
  textureGenerator: GLBTextureGenerator;
  lodGenerator: GLBLODGenerator;
  memoryManager: GLBMemoryManager;
  collisionGenerator: GLBCollisionMeshGenerator;
  interiorDetail: InteriorGLBDetailGenerator;
  exteriorDetail: ExteriorGLBDetailEnhancer;
  engineDetail: EngineGLBDetailEnhancer;
}

const profiles: Record<QualityPreset, QualityProfile> = {
  ultra: {
    postProcessor: createHighQualityPostProcessor(),
    optimizer: createDefaultOptimizer(),
    materialEnhancer: createDefaultMaterialEnhancer(),
    textureGenerator: createDefaultTextureGenerator(),
    lodGenerator: createDefaultLODGenerator(),
    memoryManager: createDefaultMemoryManager(),
    collisionGenerator: createDefaultCollisionGenerator(),
    interiorDetail: createDefaultInteriorDetailGenerator(),
    exteriorDetail: createDefaultExteriorDetailEnhancer(),
    engineDetail: createDefaultEngineDetailEnhancer(),
  },
  high: {
    postProcessor: createDefaultPostProcessor(),
    optimizer: createDefaultOptimizer(),
    materialEnhancer: createDefaultMaterialEnhancer(),
    textureGenerator: createDefaultTextureGenerator(),
    lodGenerator: createDefaultLODGenerator(),
    memoryManager: createDefaultMemoryManager(),
    collisionGenerator: createDefaultCollisionGenerator(),
    interiorDetail: createDefaultInteriorDetailGenerator(),
    exteriorDetail: createDefaultExteriorDetailEnhancer(),
    engineDetail: createDefaultEngineDetailEnhancer(),
  },
  medium: {
    postProcessor: createDefaultPostProcessor(),
    optimizer: createDefaultOptimizer(),
    materialEnhancer: createDefaultMaterialEnhancer(),
    textureGenerator: createDefaultTextureGenerator(),
    lodGenerator: createDefaultLODGenerator(),
    memoryManager: createDefaultMemoryManager(),
    collisionGenerator: createDefaultCollisionGenerator(),
    interiorDetail: createDefaultInteriorDetailGenerator(),
    exteriorDetail: createDefaultExteriorDetailEnhancer(),
    engineDetail: createDefaultEngineDetailEnhancer(),
  },
  low: {
    postProcessor: createDefaultPostProcessor(),
    optimizer: createDefaultOptimizer(),
    materialEnhancer: createDefaultMaterialEnhancer(),
    textureGenerator: createDefaultTextureGenerator(),
    lodGenerator: createDefaultLODGenerator(),
    memoryManager: createDefaultMemoryManager(),
    collisionGenerator: createDefaultCollisionGenerator(),
    interiorDetail: createDefaultInteriorDetailGenerator(),
    exteriorDetail: createDefaultExteriorDetailEnhancer(),
    engineDetail: createDefaultEngineDetailEnhancer(),
  },
  mobile: {
    postProcessor: createDefaultPostProcessor(),
    optimizer: createDefaultOptimizer(),
    materialEnhancer: createDefaultMaterialEnhancer(),
    textureGenerator: createDefaultTextureGenerator(),
    lodGenerator: createDefaultLODGenerator(),
    memoryManager: createDefaultMemoryManager(),
    collisionGenerator: createDefaultCollisionGenerator(),
    interiorDetail: createDefaultInteriorDetailGenerator(),
    exteriorDetail: createDefaultExteriorDetailEnhancer(),
    engineDetail: createDefaultEngineDetailEnhancer(),
  },
};

export class GLBQualityOrchestrator {
  private profile: QualityProfile;
  private preset: QualityPreset;

  constructor(preset: QualityPreset = 'high') {
    this.preset = preset;
    this.profile = profiles[preset];
  }

  processLoadedGLB(scene: THREE.Group, renderer?: THREE.WebGLRenderer): THREE.Group {
    const stats = this.profile.postProcessor.getSceneStats(scene);
    console.log(`[GLBQuality] Processing ${stats.meshes} meshes, ${stats.tris} tris, ${stats.kb}KB`);

    this.profile.postProcessor.processScene(scene);
    this.profile.postProcessor.addShadowCasting(scene, true, true);

    if (renderer) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      this.profile.postProcessor.processEnvironmentMap(scene, pmrem, renderer);
      pmrem.dispose();
    }

    this.profile.materialEnhancer.enhanceScene(scene);
    this.profile.memoryManager.trackScene(scene);

    return scene;
  }

  generateCollision(scene: THREE.Group): THREE.Mesh {
    return this.profile.collisionGenerator.generateCollisionMesh(scene);
  }

  generateLODs(scene: THREE.Group): THREE.LOD {
    return this.profile.lodGenerator.createLODHierarchy(scene);
  }

  optimizeScene(scene: THREE.Group): { merged: number; deduplicated: number } {
    const merged = this.profile.optimizer.mergeGeometriesByMaterial(scene);
    let dedupCount = 0;
    for (const [, geo] of merged) {
      this.profile.optimizer.deduplicateVertices(geo);
      dedupCount++;
    }
    return { merged: merged.size, deduplicated: dedupCount };
  }

  getMemorySnapshot() { return this.profile.memoryManager.takeSnapshot(); }
  checkMemoryBudgets() { return this.profile.memoryManager.checkBudgets(); }

  getProfile(): QualityProfile { return this.profile; }
  getPreset(): QualityPreset { return this.preset; }

  setPreset(preset: QualityPreset): void {
    this.preset = preset;
    this.profile = profiles[preset];
  }

  getInteriorDetailGenerator(): InteriorGLBDetailGenerator { return this.profile.interiorDetail; }
  getExteriorDetailEnhancer(): ExteriorGLBDetailEnhancer { return this.profile.exteriorDetail; }
  getEngineDetailEnhancer(): EngineGLBDetailEnhancer { return this.profile.engineDetail; }
  getMaterialEnhancer(): GLBMaterialEnhancer { return this.profile.materialEnhancer; }
  getTextureGenerator(): GLBTextureGenerator { return this.profile.textureGenerator; }
}

export const createDefaultOrchestrator = () => new GLBQualityOrchestrator('high');
export const createUltraOrchestrator = () => new GLBQualityOrchestrator('ultra');
export const createMobileOrchestrator = () => new GLBQualityOrchestrator('mobile');

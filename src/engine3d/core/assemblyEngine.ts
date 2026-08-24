// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — ASSEMBLY ENGINE CORE ORCHESTRATOR
// ============================================================================
// Orchestrates modular 3D engine building lifecycle, multi-instance creation
// (e.g. 12 independent pistons, 12 connecting rods), dependency verification,
// cascade removal calculations, variant hot-swapping, and exploded view solvers.
// ============================================================================

import type {
  ComponentInstance3D,
  Engine3DComponentManifest,
  Engine3DComponentType,
  Engine3DEvent,
  Engine3DEventListener,
  Transform3D,
} from '../types';
import type { EngineConfig } from '../../sim/types';
import { createComponentInstance, TransformMath, VectorMath } from '../types';
import {
  getManifestForComponentType,
  getAllV12Manifests,
  getDependentComponentTypes,
} from '../manifests/v12Manifest';
import {
  getAllV12AttachmentPoints,
  findAttachmentPointById,
} from '../attachmentMaps/v12AttachmentMap';
import {
  solveComponentSnapTransform,
  calculateSpawnTransform,
  calculateExplodedViewTransform,
} from './attachmentResolver';

export class AssemblyEngine {
  private instances: Map<string, ComponentInstance3D> = new Map();
  private eventListeners: Set<Engine3DEventListener> = new Set();
  private explodedAmount: number = 0; // 0.0 to 1.0
  private currentConfig: Partial<EngineConfig> | null = null;

  constructor() {}

  public setEngineConfig(cfg: Partial<EngineConfig> | null): void {
    this.currentConfig = cfg;
  }

  // ─── 1. EVENT SUBSCRIPTION SYSTEM ───

  public subscribe(listener: Engine3DEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emit(event: Engine3DEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[AssemblyEngine] Event listener error:', err);
      }
    });
  }

  // ─── 2. COMPONENT INSTALLATION ───

  /**
   * Checks whether a component type satisfies all prerequisite dependencies
   * and can be installed onto the current assembly.
   */
  public canInstall(type: Engine3DComponentType): {
    allowed: boolean;
    reason?: string;
    missingDependencies?: Engine3DComponentType[];
  } {
    const manifest = getManifestForComponentType(type);
    if (!manifest) {
      return { allowed: false, reason: `Unknown component type: '${type}'` };
    }

    // Check if already installed
    const alreadyInstalled = Array.from(this.instances.values()).some((inst) => inst.type === type);
    if (alreadyInstalled && manifest.instancePattern === 'single') {
      return { allowed: false, reason: `${manifest.displayName} is already installed` };
    }

    // Check prerequisites
    const installedTypes = new Set<Engine3DComponentType>(
      Array.from(this.instances.values()).map((inst) => inst.type)
    );

    const missing: Engine3DComponentType[] = [];
    for (const dep of manifest.dependencies) {
      if (!installedTypes.has(dep)) {
        missing.push(dep);
      }
    }

    if (missing.length > 0) {
      const depNames = missing.map((d) => getManifestForComponentType(d)?.displayName || d).join(', ');
      return {
        allowed: false,
        reason: `Requires ${depNames} to be installed first`,
        missingDependencies: missing,
      };
    }

    return { allowed: true };
  }

  /**
   * Adds a component type to the engine assembly.
   * Handles multi-instance expansion (e.g. creating 12 distinct piston objects).
   */
  public async addComponent(
    type: Engine3DComponentType,
    variantId?: string
  ): Promise<ComponentInstance3D[]> {
    const check = this.canInstall(type);
    if (!check.allowed) {
      throw new Error(`[AssemblyEngine] Cannot install ${type}: ${check.reason}`);
    }

    const manifest = getManifestForComponentType(type);
    if (!manifest) {
      throw new Error(`[AssemblyEngine] Manifest not found for ${type}`);
    }

    const newInstances: ComponentInstance3D[] = [];
    const rootBlock = Array.from(this.instances.values()).find((i) => i.type === 'engine-block');
    const rootTransform = rootBlock ? rootBlock.assembledTransform : TransformMath.createDefault();

    // ── CASE A: ROOT ENGINE BLOCK ──
    if (type === 'engine-block') {
      const assembledTransform = TransformMath.createDefault();
      const spawnTransform = calculateSpawnTransform(assembledTransform, manifest.explodedOffset);

      const blockInstance = createComponentInstance('engine-block-01', manifest, assembledTransform, {
        transform: spawnTransform,
        state: 'spawning',
        cylinderIndex: null,
      });

      if (variantId) {
        const v = manifest.variants.find((varObj) => varObj.id === variantId);
        if (v) blockInstance.variant = v;
      }

      this.instances.set(blockInstance.instanceId, blockInstance);
      newInstances.push(blockInstance);

      this.emit({
        type: 'component-added',
        instanceId: blockInstance.instanceId,
        componentType: blockInstance.type,
        bankSide: 'center',
        cylinderIndex: null,
      });

      return newInstances;
    }

    // ── CASE B: MULTI-INSTANCE PISTONS ──
    if (type === 'piston') {
      const layout = this.currentConfig?.layout || 'v12';
      const totalCylinders =
        layout === 'i3' ? 3 :
        layout === 'i4' || layout === 'boxer4' ? 4 :
        layout === 'i6' || layout === 'v6' || layout === 'boxer6' ? 6 :
        layout === 'v8' ? 8 :
        layout === 'v10' ? 10 :
        layout === 'w12' ? 12 :
        layout === 'w16' ? 16 :
        layout === 'w18' ? 18 :
        12;

      for (let cyl = 1; cyl <= totalCylinders; cyl++) {
        const instanceId = `piston-${cyl.toString().padStart(2, '0')}`;
        const socketId = `Piston_${cyl.toString().padStart(2, '0')}_Mount`;
        const socket = findAttachmentPointById(socketId);

        if (!socket) continue;

        const assembledTransform = solveComponentSnapTransform(manifest, rootTransform, socket, cyl - 1);
        const spawnTransform = calculateSpawnTransform(assembledTransform, manifest.explodedOffset, 2.0);

        const pistonInstance = createComponentInstance(instanceId, manifest, assembledTransform, {
          transform: spawnTransform,
          parentInstanceId: rootBlock?.instanceId || 'engine-block-01',
          parentAttachmentPointId: socket.id,
          cylinderIndex: cyl,
          bankSide: socket.bankSide || 'center',
          state: 'spawning',
        });

        if (variantId) {
          const v = manifest.variants.find((varObj) => varObj.id === variantId);
          if (v) pistonInstance.variant = v;
        }

        this.instances.set(pistonInstance.instanceId, pistonInstance);
        newInstances.push(pistonInstance);

        this.emit({
          type: 'component-added',
          instanceId: pistonInstance.instanceId,
          componentType: pistonInstance.type,
          bankSide: pistonInstance.bankSide,
          cylinderIndex: cyl,
        });
      }

      return newInstances;
    }

    // ── CASE C: MULTI-INSTANCE CONNECTING RODS ──
    if (type === 'connecting-rod') {
      const layout = this.currentConfig?.layout || 'v12';
      const totalCylinders =
        layout === 'i3' ? 3 :
        layout === 'i4' || layout === 'boxer4' ? 4 :
        layout === 'i6' || layout === 'v6' || layout === 'boxer6' ? 6 :
        layout === 'v8' ? 8 :
        layout === 'v10' ? 10 :
        layout === 'w12' ? 12 :
        layout === 'w16' ? 16 :
        layout === 'w18' ? 18 :
        12;

      for (let cyl = 1; cyl <= totalCylinders; cyl++) {
        const instanceId = `connecting-rod-${cyl.toString().padStart(2, '0')}`;
        const isLeft = cyl % 2 !== 0;
        const throwIdx = Math.ceil(cyl / 2);
        const socketId = `Crank_Journal_${throwIdx.toString().padStart(2, '0')}_${isLeft ? 'Left' : 'Right'}_Mount`;
        const socket = findAttachmentPointById(socketId);

        if (!socket) continue;

        const assembledTransform = solveComponentSnapTransform(manifest, rootTransform, socket, cyl - 1);
        const spawnTransform = calculateSpawnTransform(assembledTransform, manifest.explodedOffset, 1.8);

        const rodInstance = createComponentInstance(instanceId, manifest, assembledTransform, {
          transform: spawnTransform,
          parentInstanceId: 'crankshaft-01',
          parentAttachmentPointId: socket.id,
          cylinderIndex: cyl,
          bankSide: isLeft ? 'left' : 'right',
          state: 'spawning',
        });

        if (variantId) {
          const v = manifest.variants.find((varObj) => varObj.id === variantId);
          if (v) rodInstance.variant = v;
        }

        this.instances.set(rodInstance.instanceId, rodInstance);
        newInstances.push(rodInstance);

        this.emit({
          type: 'component-added',
          instanceId: rodInstance.instanceId,
          componentType: rodInstance.type,
          bankSide: rodInstance.bankSide,
          cylinderIndex: cyl,
        });
      }

      return newInstances;
    }

    // ── CASE D: STANDARD SINGLE OR PER-BANK COMPONENT ──
    const socket = getAllV12AttachmentPoints().find((p) => p.acceptsType === type);
    const assembledTransform = socket
      ? solveComponentSnapTransform(manifest, rootTransform, socket)
      : TransformMath.clone(manifest.defaultTransform);

    const spawnTransform = calculateSpawnTransform(assembledTransform, manifest.explodedOffset);
    const instanceId = `${type}-01`;

    const instance = createComponentInstance(instanceId, manifest, assembledTransform, {
      transform: spawnTransform,
      parentInstanceId: manifest.parentType ? `${manifest.parentType}-01` : null,
      parentAttachmentPointId: socket?.id || null,
      bankSide: manifest.bankAssignment,
      state: 'spawning',
    });

    if (variantId) {
      const v = manifest.variants.find((varObj) => varObj.id === variantId);
      if (v) instance.variant = v;
    }

    this.instances.set(instance.instanceId, instance);
    newInstances.push(instance);

    this.emit({
      type: 'component-added',
      instanceId: instance.instanceId,
      componentType: instance.type,
      bankSide: instance.bankSide,
      cylinderIndex: null,
    });

    return newInstances;
  }

  // ─── 3. COMPONENT REMOVAL & CASCADE DEPENDENCY CLEANUP ───

  /**
   * Calculates all downstream instances that depend on a target instance.
   */
  public getDependentsOfInstance(instanceId: string): ComponentInstance3D[] {
    const target = this.instances.get(instanceId);
    if (!target) return [];

    const dependentTypes = new Set(getDependentComponentTypes(target.type));
    const result: ComponentInstance3D[] = [];

    for (const inst of this.instances.values()) {
      if (inst.instanceId !== instanceId && (inst.parentInstanceId === instanceId || dependentTypes.has(inst.type))) {
        result.push(inst);
      }
    }

    return result;
  }

  /**
   * Removes an installed component instance and cascades through all dependent instances.
   */
  public async removeComponentCascade(
    instanceId: string
  ): Promise<{ removedInstanceIds: string[]; totalCount: number }> {
    const target = this.instances.get(instanceId);
    if (!target) {
      return { removedInstanceIds: [], totalCount: 0 };
    }

    const dependents = this.getDependentsOfInstance(instanceId);
    const toRemove = [...dependents, target];
    const removedIds: string[] = [];

    // Remove in reverse topological order (children first, target last)
    for (const inst of toRemove) {
      this.instances.delete(inst.instanceId);
      removedIds.push(inst.instanceId);
    }

    this.emit({
      type: 'component-removed',
      instanceId,
      componentType: target.type,
      cascadeRemoved: dependents.map((d) => d.instanceId),
    });

    return {
      removedInstanceIds: removedIds,
      totalCount: removedIds.length,
    };
  }

  // ─── 4. MATERIAL VARIANT REPLACEMENT ───

  public replaceVariant(instanceId: string, newVariantId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    const norm = (id: string) => id.toLowerCase().replace(/[-_]/g, '');
    const targetNorm = norm(newVariantId);

    const newVariant =
      instance.manifestRef.variants.find((v) => v.id === newVariantId) ||
      instance.manifestRef.variants.find((v) => norm(v.id) === targetNorm) ||
      instance.manifestRef.variants.find((v) => norm(v.id).includes(targetNorm) || targetNorm.includes(norm(v.id))) ||
      instance.manifestRef.variants[0];

    if (!newVariant) return;

    const oldVariantId = instance.variant.id;
    if (oldVariantId === newVariant.id) return; // Prevent unnecessary re-renders and loops

    instance.variant = newVariant;

    this.emit({
      type: 'component-replaced',
      instanceId,
      oldVariant: oldVariantId,
      newVariant: newVariant.id,
    });
  }

  // ─── 5. EXPLODED VIEW SOLVER ───

  public setExplodedViewAmount(amount: number): void {
    this.explodedAmount = Math.max(0, Math.min(1, amount));

    for (const instance of this.instances.values()) {
      if (this.explodedAmount === 0) {
        instance.transform.position = VectorMath.clone(instance.assembledTransform.position);
      } else {
        const exploded = calculateExplodedViewTransform(
          instance.assembledTransform,
          instance.manifestRef.explodedOffset,
          this.explodedAmount
        );
        instance.transform.position = VectorMath.clone(exploded.position);
      }
    }

    this.emit({
      type: 'exploded-view-changed',
      amount: this.explodedAmount,
    });
  }

  public getExplodedAmount(): number {
    return this.explodedAmount;
  }

  // ─── 6. STATE QUERIES & PROGRESS READOUTS ───

  public getInstalledInstances(): ComponentInstance3D[] {
    return Array.from(this.instances.values());
  }

  public getInstanceById(instanceId: string): ComponentInstance3D | undefined {
    return this.instances.get(instanceId);
  }

  public getProgress(): { installedCount: number; totalCount: number; percentage: number } {
    const totalCount = getAllV12Manifests().length;
    const uniqueInstalledTypes = new Set(Array.from(this.instances.values()).map((i) => i.type));
    const installedCount = uniqueInstalledTypes.size;
    const percentage = totalCount > 0 ? Math.round((installedCount / totalCount) * 100) : 0;

    return { installedCount, totalCount, percentage };
  }

  public getNextRecommended(): Engine3DComponentType | null {
    const manifests = getAllV12Manifests();
    for (const manifest of manifests) {
      if (!this.instances.has(manifest.type) && this.canInstall(manifest.type).allowed) {
        return manifest.type;
      }
    }
    return null;
  }

  public reset(): void {
    this.instances.clear();
    this.explodedAmount = 0;
    this.emit({ type: 'assembly-reset' });
  }
}

/** Global singleton instance */
export const globalAssemblyEngine = new AssemblyEngine();

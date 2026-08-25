// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 2D ASSEMBLY STORE ↔ 3D ENGINE BRIDGE
// ============================================================================
// Bidirectional synchronization bridge mapping 2D modular vehicle simulation
// state (useAssemblyStore) to real-time 3D glTF scene graph (useEngine3DStore),
// keeping material variants, exploded views, and installation progression in sync.
// ============================================================================

import { useEffect, useRef } from 'react';
import type { ComponentId, MaterialGrade } from '../../sim/assemblyTypes';
import type { Engine3DComponentType } from '../types';
import { useEngine3DStore } from './useEngine3DStore';

// ============================================================================
// 1. 2D COMPONENT ID ↔ 3D COMPONENT TYPE MAPPINGS
// ============================================================================

export const COMPONENT_ID_TO_3D_TYPES: Record<ComponentId, Engine3DComponentType[]> = {
  block: ['engine-block'],
  crankshaft: ['crankshaft'],
  pistons: ['piston'],
  rods: ['connecting-rod'],
  head_gasket: [],
  cylinder_head: ['cylinder-head-left', 'cylinder-head-right'],
  valves: [],
  camshaft: ['valve-cover-left', 'valve-cover-right'],
  intake_manifold: ['intake-manifold-left', 'intake-manifold-right'],
  exhaust_headers: ['exhaust-header-left', 'exhaust-header-right'],
  turbocharger: ['turbocharger'],
  oil_pan: ['dry-sump'],
  radiator: ['radiator'],
  transmission: ['transaxle'],
  engine_cover: ['engine-cover'],
  hybrid_motor: [],
  inverter_ecu: [],
  chassis_frame: [],
  suspension_front: [],
  suspension_rear: [],
  brakes: [],
  wheels_tires: [],
  aero_package: [],
  electronics_ecu: [],
};

export const TYPE_3D_TO_COMPONENT_ID: Record<string, ComponentId> = {
  'engine-block': 'block',
  'crankshaft': 'crankshaft',
  'piston': 'pistons',
  'connecting-rod': 'rods',
  'cylinder-head-left': 'cylinder_head',
  'cylinder-head-right': 'cylinder_head',
  'valve-cover-left': 'camshaft',
  'valve-cover-right': 'camshaft',
  'intake-manifold-left': 'intake_manifold',
  'intake-manifold-right': 'intake_manifold',
  'exhaust-header-left': 'exhaust_headers',
  'exhaust-header-right': 'exhaust_headers',
  'turbocharger': 'turbocharger',
  'dry-sump': 'oil_pan',
  'radiator': 'radiator',
  'transaxle': 'transmission',
  'engine-cover': 'engine_cover',
};

// ============================================================================
// 2. BIDIRECTIONAL STATE SYNCHRONIZATION HOOK
// ============================================================================

import type { EngineConfig } from '../../sim/types';

export interface Assembly3DBridgeProps {
  installedComponents2D?: ComponentId[];
  selectedVariants2D?: Partial<Record<ComponentId, MaterialGrade>>;
  isExploded2D?: boolean;
  engineConfig?: Partial<EngineConfig>;
  onSelectComponent2D?: (id: ComponentId | null) => void;
}

/**
 * Normalizes material grade names between 2D simulation and 3D manifests.
 */
function normalizeGrade(grade?: string): string {
  if (!grade) return 'forged';
  const g = grade.toLowerCase();
  if (g.includes('cast')) return 'cast';
  if (g.includes('billet') || g.includes('aluminum') || g.includes('6061')) return 'billet';
  if (g.includes('titanium') || g.includes('ti-')) return 'titanium';
  if (g.includes('carbon') || g.includes('cf')) return 'carbon';
  if (g.includes('ceramic')) return 'ceramic';
  if (g.includes('gold') || g.includes('inconel')) return 'gold-inconel';
  if (g.includes('copper')) return 'copper';
  return 'forged';
}

/**
 * Connects the primary 2D modular assembly options with the 3D glTF engine state.
 * Uses ref caches and avoids self-triggering dependency cycles to prevent React render loops.
 */
export function useAssembly3DBridge({
  installedComponents2D = [],
  selectedVariants2D = {},
  isExploded2D = false,
  engineConfig,
  onSelectComponent2D,
}: Assembly3DBridgeProps): void {
  const setEngineConfig = useEngine3DStore((s) => s.setEngineConfig);
  const resetAssembly = useEngine3DStore((s) => s.resetAssembly);
  const addComponent = useEngine3DStore((s) => s.addComponent);
  const removeComponentCascade = useEngine3DStore((s) => s.removeComponentCascade);
  const replaceVariant = useEngine3DStore((s) => s.replaceVariant);
  const setExplodedAmount = useEngine3DStore((s) => s.setExplodedAmount);
  const selectedInstanceId = useEngine3DStore((s) => s.selectedInstanceId);

  const prevInstalled2DRef = useRef<Set<ComponentId>>(new Set());
  const prevVariantsRef = useRef<Record<string, string>>({});
  const prevLayoutRef = useRef<string | undefined>(engineConfig?.layout);

  // ── 0. Live Engine Specifications Sync & Layout Change Handler ──
  const prevConfigStrRef = useRef<string>('');
  useEffect(() => {
    if (!engineConfig) return;
    const configStr = `${engineConfig.layout}_${engineConfig.bore}_${engineConfig.stroke}_${engineConfig.rodLength}_${engineConfig.intake}_${engineConfig.boostPressure}_${engineConfig.valvetrain}_${engineConfig.crank}_${engineConfig.pistons}`;
    if (configStr !== prevConfigStrRef.current) {
      prevConfigStrRef.current = configStr;
      setEngineConfig(engineConfig);

      if (engineConfig?.layout && prevLayoutRef.current && prevLayoutRef.current !== engineConfig.layout) {
        prevInstalled2DRef.current = new Set();
        prevVariantsRef.current = {};
        resetAssembly();
        const blockVariant = normalizeGrade(selectedVariants2D.block || 'cast_iron');
        addComponent('engine-block', blockVariant).catch(() => {});
      }
      prevLayoutRef.current = engineConfig?.layout;
    }
  }, [engineConfig, setEngineConfig, resetAssembly, addComponent, selectedVariants2D.block]);

  // ── 0.1 Initial Base Engine Block Guarantee ──
  useEffect(() => {
    const state = useEngine3DStore.getState();
    if (!state.installedTypes.includes('engine-block')) {
      const blockVariant = normalizeGrade(selectedVariants2D.block || 'cast_iron');
      addComponent('engine-block', blockVariant).catch(() => {});
    }
  }, [addComponent]);

  // ── 1. Sync 2D Installed Components → 3D Scene Graph ──
  const installedKey = installedComponents2D.join(',');
  useEffect(() => {
    const effectiveInstalled = new Set<ComponentId>(installedComponents2D);
    effectiveInstalled.add('block');

    const prev2DSet = prevInstalled2DRef.current;
    const state = useEngine3DStore.getState();

    // Check for newly installed components in 2D
    effectiveInstalled.forEach((compId) => {
      if (!prev2DSet.has(compId)) {
        const types3D = COMPONENT_ID_TO_3D_TYPES[compId] || [];
        const variant = normalizeGrade(selectedVariants2D[compId] || 'forged');

        types3D.forEach((type3D) => {
          if (!state.installedTypes.includes(type3D)) {
            addComponent(type3D, variant).catch((err) => {
              console.warn(`[Assembly3DBridge] Could not auto-sync ${type3D} to 3D:`, err);
            });
          }
        });
      }
    });

    // Check for uninstalled components in 2D (never uninstall the root engine-block)
    for (const compId of prev2DSet) {
      if (!effectiveInstalled.has(compId) && compId !== 'block') {
        const types3D = COMPONENT_ID_TO_3D_TYPES[compId] || [];
        types3D.forEach((type3D) => {
          const inst = Object.values(state.instances).find((i) => i.type === type3D);
          if (inst) {
            removeComponentCascade(inst.instanceId).catch(() => {});
          }
        });
      }
    }

    prevInstalled2DRef.current = effectiveInstalled;
  }, [installedKey, addComponent, removeComponentCascade]);

  // ── 2. Sync Material Variant Swaps from Primary Options → 3D PBR Shaders ──
  const variantsKey = JSON.stringify(selectedVariants2D);
  useEffect(() => {
    const prevVariants = prevVariantsRef.current;
    const allCheckedComponents: ComponentId[] = [
      'block',
      ...installedComponents2D.filter((c) => c !== 'block'),
    ];

    const state = useEngine3DStore.getState();

    for (const compId of allCheckedComponents) {
      const rawGrade = selectedVariants2D[compId] || (compId === 'block' ? 'cast_iron' : 'forged');
      const normalized = normalizeGrade(rawGrade);
      const prevNorm = prevVariants[compId];

      if (normalized !== prevNorm) {
        prevVariants[compId] = normalized;
        const types3D = COMPONENT_ID_TO_3D_TYPES[compId] || [];
        types3D.forEach((type3D) => {
          const matchingInstances = Object.values(state.instances).filter((i) => i.type === type3D);
          matchingInstances.forEach((inst) => {
            if (inst.variant.id !== normalized) {
              replaceVariant(inst.instanceId, normalized);
            }
          });
        });
      }
    }
  }, [variantsKey, installedKey, replaceVariant]);

  // ── 3. Sync Exploded View State ──
  useEffect(() => {
    const targetAmount = isExploded2D ? 1.0 : 0.0;
    const currentAmount = useEngine3DStore.getState().explodedAmount;
    if (Math.abs(currentAmount - targetAmount) > 0.01) {
      setExplodedAmount(targetAmount);
    }
  }, [isExploded2D, setExplodedAmount]);

  // ── 4. Sync Selection from 3D Viewport → Primary Options Panel Below ──
  useEffect(() => {
    if (!onSelectComponent2D || !selectedInstanceId) return;

    const inst = useEngine3DStore.getState().instances[selectedInstanceId];
    if (inst) {
      const compId2D = TYPE_3D_TO_COMPONENT_ID[inst.type];
      if (compId2D) {
        onSelectComponent2D(compId2D);
      }
    }
  }, [selectedInstanceId, onSelectComponent2D]);
}

export default useAssembly3DBridge;

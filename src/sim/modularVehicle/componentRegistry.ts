// ===================================================================
// MODULAR COMPONENT REGISTRY & INFRASTRUCTURE
// ===================================================================
// Central registry storing and indexing all available SVG vehicle components.
// Supports fast subsystem queries, variant resolution, and compatibility lookups.
// ===================================================================

import type { ModularComponent, VehicleSubsystem } from "./types";

export class ComponentRegistry {
  private components: Map<string, ModularComponent> = new Map();
  private bySubsystem: Map<VehicleSubsystem, ModularComponent[]> = new Map();

  /** Register a new modular component definition */
  register(component: ModularComponent): void {
    if (this.components.has(component.id)) {
      console.warn(`[ComponentRegistry] Overwriting component definition for ID: ${component.id}`);
    }
    this.components.set(component.id, component);

    // Index by subsystem
    const list = this.bySubsystem.get(component.subsystem) || [];
    const existingIndex = list.findIndex((c) => c.id === component.id);
    if (existingIndex >= 0) {
      list[existingIndex] = component;
    } else {
      list.push(component);
    }
    this.bySubsystem.set(component.subsystem, list);
  }

  /** Register multiple components at once */
  registerAll(components: ModularComponent[]): void {
    components.forEach((c) => this.register(c));
  }

  /** Get component definition by ID */
  get(id: string): ModularComponent | undefined {
    return this.components.get(id);
  }

  /** Get component definition by ID or throw error */
  getOrThrow(id: string): ModularComponent {
    const c = this.components.get(id);
    if (!c) {
      throw new Error(`[ComponentRegistry] Component not found for ID: ${id}`);
    }
    return c;
  }

  /** Retrieve all components registered for a given subsystem */
  getBySubsystem(subsystem: VehicleSubsystem): ModularComponent[] {
    return this.bySubsystem.get(subsystem) || [];
  }

  /** Get all available configuration variants for a subsystem */
  getVariants(subsystem: VehicleSubsystem): {
    variantId: string;
    label: string;
    component: ModularComponent;
  }[] {
    return this.getBySubsystem(subsystem).map((c) => ({
      variantId: c.variantId,
      label: c.variantLabel,
      component: c,
    }));
  }

  /** Check if two components are mutually compatible */
  areCompatible(componentIdA: string, componentIdB: string): boolean {
    const compA = this.get(componentIdA);
    const compB = this.get(componentIdB);
    if (!compA || !compB) return false;

    // Direct incompatibility list check
    if (compA.incompatibleWith.includes(componentIdB)) return false;
    if (compB.incompatibleWith.includes(componentIdA)) return false;

    // Explicit compatibility list (if specified, must include target)
    if (compA.compatibleWith.length > 0 && !compA.compatibleWith.includes(componentIdB)) {
      return false;
    }
    if (compB.compatibleWith.length > 0 && !compB.compatibleWith.includes(componentIdA)) {
      return false;
    }

    return true;
  }

  /** Retrieve all registered component IDs */
  getAllIds(): string[] {
    return Array.from(this.components.keys());
  }

  /** Total count of registered components */
  get size(): number {
    return this.components.size;
  }

  /** Clear all registered components */
  clear(): void {
    this.components.clear();
    this.bySubsystem.clear();
  }
}

/** Global component registry instance */
export const globalComponentRegistry = new ComponentRegistry();

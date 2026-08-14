// ===================================================================
// MODULAR VEHICLE EVENT BUS
// ===================================================================
// Provides event notifications when components are installed, removed,
// replaced, or when vehicle validation and aggregate stats update.
// ===================================================================

export type ModularVehicleEvent =
  | { type: "COMPONENT_INSTALLED"; componentId: string; instanceId: string }
  | { type: "COMPONENT_REMOVED"; componentId: string; instanceId: string }
  | { type: "COMPONENT_REPLACED"; oldComponentId: string; newComponentId: string; instanceId: string }
  | { type: "CHASSIS_CHANGED"; chassisId: string }
  | { type: "VALIDATION_UPDATED"; resultsCount: number }
  | { type: "AGGREGATE_STATS_UPDATED"; totalMass: number; totalPower: number }
  | { type: "ENGINE_SYNCED"; engineId: string }
  | { type: "ASSEMBLY_RESET" };

type EventHandler = (event: ModularVehicleEvent) => void;

class ModularVehicleEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /** Subscribe to a specific vehicle assembly event */
  on(eventType: ModularVehicleEvent["type"], handler: EventHandler): () => void {
    const set = this.handlers.get(eventType) || new Set();
    set.add(handler);
    this.handlers.set(eventType, set);
    return () => {
      const current = this.handlers.get(eventType);
      if (current) {
        current.delete(handler);
      }
    };
  }

  /** Emit an event to all subscribed listeners */
  emit(event: ModularVehicleEvent): void {
    const set = this.handlers.get(event.type);
    if (set) {
      set.forEach((handler) => {
        try {
          handler(event);
        } catch (err) {
          console.error(`[ModularVehicleEventBus] Error handling event ${event.type}:`, err);
        }
      });
    }
  }

  /** Remove all subscriptions */
  clear(): void {
    this.handlers.clear();
  }
}

export const vehicleEventBus = new ModularVehicleEventBus();

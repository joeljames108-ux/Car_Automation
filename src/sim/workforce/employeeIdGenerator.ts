/**
 * ═══════════════════════════════════════════════════════════════════════
 * EMPLOYEE ID GENERATOR — PERMANENT IDENTITY LIFECYCLE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 1 & Section 3:
 * - Every employee is assigned a permanent, unique identifier (EMP-XXXXXX).
 * - The ID stays with the employee throughout their entire career tenure.
 * - Supports sequential allocation, zero collisions, and format verification.
 */

import { EmployeeId } from "./workforceTypes";

let nextIdCounter = 1;

/**
 * Format a numeric index into canonical EMP-XXXXXX format
 * e.g. 1 -> EMP-000001, 4821 -> EMP-004821
 */
export function formatEmployeeId(index: number): EmployeeId {
  const padded = String(Math.max(1, Math.floor(index))).padStart(6, "0");
  return `EMP-${padded}`;
}

/**
 * Generate next available permanent employee ID
 */
export function generateNextEmployeeId(): EmployeeId {
  const id = formatEmployeeId(nextIdCounter);
  nextIdCounter += 1;
  return id;
}

/**
 * Set internal counter to ensure newly generated IDs do not collide with existing seed data
 */
export function syncIdCounterWithExisting(existingIds: string[]): void {
  let highest = 0;
  for (const id of existingIds) {
    if (id.startsWith("EMP-")) {
      const num = parseInt(id.replace("EMP-", ""), 10);
      if (!isNaN(num) && num > highest) {
        highest = num;
      }
    }
  }
  nextIdCounter = Math.max(nextIdCounter, highest + 1);
}

/**
 * Reset ID generator back to 1 (for unit tests and 1970 fresh starts)
 */
export function resetEmployeeIdCounter(startingIndex = 1): void {
  nextIdCounter = startingIndex;
}

/**
 * Get current counter value
 */
export function getNextIdCounterValue(): number {
  return nextIdCounter;
}

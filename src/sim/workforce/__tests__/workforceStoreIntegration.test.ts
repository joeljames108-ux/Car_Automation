import { describe, it, expect, beforeEach } from "vitest";
import { useWorkforceStore } from "../../../state/workforceStore";

describe("WorkforceStore Integration & Campus Orchestration (Phase 8)", () => {
  beforeEach(() => {
    useWorkforceStore.getState().resetTo1970();
  });

  it("initializes with 14-unit campus workforce and corporate archive level 1", () => {
    const state = useWorkforceStore.getState();
    expect(state.corporateArchiveLevel).toBe(1);
    expect(Object.keys(state.facilityOvertimePolicies).length).toBe(14);
    expect(state.facilityOvertimePolicies.UNIT_01).toBe("standard_40h");

    const audit = state.getCampusInstitutionalMemoryAudit();
    expect(audit.corporateArchiveLevel).toBe(1);
    expect(audit.archiveRetentionRatePct).toBe(50);
  });

  it("updates facility overtime policy and reflects in campus workload rollup", () => {
    const store = useWorkforceStore.getState();
    
    // Set UNIT_02 (Powertrain) to crunch_52h
    store.setFacilityOvertimeIntensity("UNIT_02", "crunch_52h");

    const updatedState = useWorkforceStore.getState();
    expect(updatedState.facilityOvertimePolicies.UNIT_02).toBe("crunch_52h");

    const rollup = updatedState.getCampusWorkloadRollup();
    expect(rollup.facilitiesInCrunch).toContain("UNIT_02");
    expect(rollup.totalOvertimePayrollEur).toBeGreaterThan(0);

    const powertrainReport = updatedState.getFacilityWorkloadReport("UNIT_02");
    expect(powertrainReport.intensity).toBe("crunch_52h");
    expect(powertrainReport.speedMultiplier).toBe(1.25);
    expect(powertrainReport.cadErrorRatePenaltyPct).toBeGreaterThanOrEqual(8.5);
  });

  it("upgrades corporate archive level and boosts knowledge retention rate", () => {
    const store = useWorkforceStore.getState();
    expect(store.corporateArchiveLevel).toBe(1);

    store.upgradeCorporateArchiveLevel();
    expect(useWorkforceStore.getState().corporateArchiveLevel).toBe(2);
    let audit = useWorkforceStore.getState().getCampusInstitutionalMemoryAudit();
    expect(audit.archiveRetentionRatePct).toBe(70);

    store.upgradeCorporateArchiveLevel();
    expect(useWorkforceStore.getState().corporateArchiveLevel).toBe(3);
    audit = useWorkforceStore.getState().getCampusInstitutionalMemoryAudit();
    expect(audit.archiveRetentionRatePct).toBe(88);

    store.upgradeCorporateArchiveLevel();
    expect(useWorkforceStore.getState().corporateArchiveLevel).toBe(4);
    audit = useWorkforceStore.getState().getCampusInstitutionalMemoryAudit();
    expect(audit.archiveRetentionRatePct).toBe(98);
  });

  it("reassigns staff between campus facilities and resets cleanly to 1970", () => {
    const store = useWorkforceStore.getState();
    
    // Reassign 2 staff from UNIT_04 (Vehicle Design, 15) to UNIT_05 (Chassis, 12)
    store.reassignStaffBetweenFacilities("UNIT_04", "UNIT_05", 2);

    let state = useWorkforceStore.getState();
    expect((state.campusFacilityWorkforce as any).UNIT_04.totalHeadcount1970).toBe(13);
    expect((state.campusFacilityWorkforce as any).UNIT_05.totalHeadcount1970).toBe(14);

    // Reset to 1970
    store.resetTo1970();
    state = useWorkforceStore.getState();
    expect((state.campusFacilityWorkforce as any).UNIT_04.totalHeadcount1970).toBe(15);
    expect((state.campusFacilityWorkforce as any).UNIT_05.totalHeadcount1970).toBe(12);
  });
});

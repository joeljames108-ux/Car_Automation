import { describe, it, expect, beforeEach } from "vitest";
import { useContractsStore } from "../../state/contractsStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useReputationStore } from "../../state/reputationStore";

describe("Contracts & B2B Negotiation Master Engine", () => {
  beforeEach(() => {
    // Reset simulation clock store to pure time
    useSimulationClockStore.setState({
      day: 15,
      month: 5,
      year: 1978,
    });
    useCompanyFinanceStore.setState({
      cash: 12400000,
    });
    useReputationStore.setState({
      overallReputation: 66,
    });
  });

  it("initializes with 8 active multi-stream enterprise contracts", () => {
    const contracts = useContractsStore.getState().contracts;
    expect(contracts.length).toBe(8);

    const categories = contracts.map(c => c.category);
    expect(categories).toContain("INBOUND_SUPPLIER");
    expect(categories).toContain("OUTBOUND_OEM");
    expect(categories).toContain("MOTORSPORT");
    expect(categories).toContain("TECH_LICENSE");
  });

  it("calculates positive net monthly cashflow and total annual portfolio value", () => {
    const netCashflow = useContractsStore.getState().getNetMonthlyCashflow();
    const annualPortfolio = useContractsStore.getState().getTotalAnnualizedValue();

    expect(netCashflow).toBeGreaterThan(0);
    expect(annualPortfolio).toBeGreaterThan(10000000); // > $10M / yr
  });

  it("contains initial open tender opportunities with realistic pricing", () => {
    const tenders = useContractsStore.getState().tenders;
    expect(tenders.length).toBeGreaterThanOrEqual(3);

    const v12Tender = tenders.find(t => t.id === "tender_scuderia_v12");
    expect(v12Tender).toBeDefined();
    expect(v12Tender?.baseUnitPrice).toBe(42000);
    expect(v12Tender?.proposedAnnualVolume).toBe(300);
  });

  it("opens Deal Room for tender and dynamically calculates acceptance probability", () => {
    const { openDealRoomForTender, updateNegotiationTerms } = useContractsStore.getState();

    openDealRoomForTender("tender_scuderia_v12");
    let active = useContractsStore.getState().activeNegotiation;

    expect(active).not.toBeNull();
    expect(active?.partnerName).toBe("Scuderia Veloce GT");
    expect(active?.acceptanceProbability).toBeGreaterThan(0);

    // Drastically lower the price for outbound buyer -> should increase buyer acceptance
    updateNegotiationTerms({ unitPrice: 32000 });
    active = useContractsStore.getState().activeNegotiation;
    expect(active?.acceptanceProbability).toBeGreaterThanOrEqual(80);

    // Increase price drastically -> should lower acceptance
    updateNegotiationTerms({ unitPrice: 58000 });
    active = useContractsStore.getState().activeNegotiation;
    expect(active?.acceptanceProbability).toBeLessThan(50);
  });

  it("generates partner counter-offers in the Deal Room", () => {
    const { openDealRoomForTender, requestCounterOffer } = useContractsStore.getState();

    openDealRoomForTender("tender_scuderia_v12");
    requestCounterOffer();

    const active = useContractsStore.getState().activeNegotiation;
    expect(active?.counterOffer).toBeDefined();
    expect(active?.counterOffer?.message).toContain("Our procurement board requests");
  });

  it("successfully ratifies an agreed tender into an active contract", () => {
    const { openDealRoomForTender, updateNegotiationTerms, ratifyNegotiation } = useContractsStore.getState();

    openDealRoomForTender("tender_scuderia_v12");
    // Set favorable terms
    updateNegotiationTerms({
      unitPrice: 38000,
      durationYears: 3,
      exclusivity: true,
    });

    const initialCount = useContractsStore.getState().contracts.length;
    const success = ratifyNegotiation();

    expect(success).toBe(true);
    expect(useContractsStore.getState().contracts.length).toBe(initialCount + 1);
    expect(useContractsStore.getState().activeNegotiation).toBeNull();
  });

  it("allows 1-year contract extension increasing duration and relationship score", () => {
    const { extendContract } = useContractsStore.getState();
    const initialCon = useContractsStore.getState().contracts.find(c => c.id === "titan_steel");
    const initialMonths = initialCon!.terms.durationMonths;
    const initialScore = initialCon!.relationshipScore;

    extendContract("titan_steel", 12);

    const updatedCon = useContractsStore.getState().contracts.find(c => c.id === "titan_steel");
    expect(updatedCon!.terms.durationMonths).toBe(initialMonths + 12);
    expect(updatedCon!.relationshipScore).toBeGreaterThanOrEqual(initialScore);
  });

  it("ticks contract duration when simulation calendar time advances", () => {
    const { tickContracts } = useContractsStore.getState();
    const initialRemaining = useContractsStore.getState().contracts.find(c => c.id === "titan_steel")!.terms.remainingMonths;

    // Advance 60 days (approx 2 months)
    tickContracts(60);

    const updatedRemaining = useContractsStore.getState().contracts.find(c => c.id === "titan_steel")!.terms.remainingMonths;
    expect(updatedRemaining).toBeLessThan(initialRemaining);
  });
});

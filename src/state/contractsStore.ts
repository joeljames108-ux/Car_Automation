import { create } from "zustand";
import { useSimulationClockStore } from "./simulationClockStore";
import {
  ActiveTieredContract,
  TieredContractTemplate,
} from "../sim/economy/contractTierTypes";
import {
  createActiveTieredContract,
  tickTieredContract,
} from "../sim/economy/contractLifecycleEngine";
import { useCompanyFinanceStore } from "./companyFinanceStore";
import { useReputationStore } from "./reputationStore";
import { useCampusStore } from "./campusStore";

export type ContractCategory =
  | "INBOUND_SUPPLIER"
  | "OUTBOUND_OEM"
  | "MOTORSPORT"
  | "TECH_LICENSE"
  | "PRODUCTION_MFG"
  | "BLUEPRINT_MFG"
  | "ENGINEERING_RD";

export type ContractStatus =
  | "ACTIVE"
  | "PENDING_RENEWAL"
  | "NEGOTIATING"
  | "BREACHED"
  | "EXPIRED";

export interface ContractTerms {
  unitPrice: number;
  annualVolume: number;
  durationMonths: number;
  remainingMonths: number;
  exclusivity: boolean;
  defectTolerancePpm: number;
  paymentTerm: "NET_30" | "NET_60" | "UPFRONT";
  earlyTerminationPenalty: number;
  slaCommitment: string;
}

export interface ContractItem {
  id: string;
  title: string;
  partnerName: string;
  partnerCountry: string;
  category: ContractCategory;
  status: ContractStatus;
  monthlyCashflow: number; // positive = revenue, negative = expense
  terms: ContractTerms;
  relationshipScore: number; // 0 - 100
  perk: string;
  riskFactor: "LOW" | "BALANCED" | "HIGH";
  historyDeliveredUnits: number;
  onTimeDeliveryRate: number; // 0 - 100%
  accentColor: string;
}

export interface TenderOpportunity {
  id: string;
  title: string;
  partnerName: string;
  partnerCountry: string;
  category: ContractCategory;
  description: string;
  proposedAnnualVolume: number;
  baseUnitPrice: number;
  benchmarkPrice: number;
  recommendedDurationYears: number;
  exclusivityRequested: boolean;
  partnerPersonality: "AGGRESSIVE" | "CONSERVATIVE" | "PRESTIGE_SEEKER";
  slaExpectation: string;
  perkOnSign: string;
}

export interface DealRoomNegotiation {
  tenderId: string;
  targetContractId?: string; // if renegotiating existing
  partnerName: string;
  category: ContractCategory;
  unitPrice: number;
  annualVolume: number;
  durationYears: 1 | 3 | 5;
  exclusivity: boolean;
  paymentTerm: "NET_30" | "NET_60" | "UPFRONT";
  penaltyClausePct: number;
  acceptanceProbability: number;
  partnerSentiment: "INSULTED" | "HESITANT" | "FAVORABLE" | "EAGER";
  counterOffer?: {
    unitPrice: number;
    durationYears: 1 | 3 | 5;
    annualVolume: number;
    message: string;
  };
}

interface ContractsState {
  contracts: ContractItem[];
  tenders: TenderOpportunity[];
  selectedContractId: string | null;
  activeNegotiation: DealRoomNegotiation | null;
  
  // Executive Metrics
  getNetMonthlyCashflow: () => number;
  getTotalAnnualizedValue: () => number;
  getAveragePartnerScore: () => number;
  getSecurityIndex: () => number;
  
  // Selectors & Actions
  selectContract: (id: string | null) => void;
  openDealRoomForTender: (tenderId: string) => void;
  openDealRoomForRenegotiation: (contractId: string) => void;
  closeDealRoom: () => void;
  updateNegotiationTerms: (patch: Partial<DealRoomNegotiation>) => void;
  requestCounterOffer: () => void;
  ratifyNegotiation: () => boolean;
  terminateContract: (contractId: string) => void;
  extendContract: (contractId: string, additionalMonths?: number) => void;
  tickContracts: (elapsedDays: number) => void;

  // Tiered Contracts System
  activeTieredContracts: ActiveTieredContract[];
  completedTieredContracts: ActiveTieredContract[];
  customFollowUpTenders: TieredContractTemplate[];
  selectedTierTab: "PRODUCTION" | "BLUEPRINT" | "ENGINEERING" | "ACTIVE";

  setSelectedTierTab: (tab: "PRODUCTION" | "BLUEPRINT" | "ENGINEERING" | "ACTIVE") => void;
  acceptTieredContract: (template: TieredContractTemplate, currentYear: number, currentMonth: number) => ActiveTieredContract;
  cancelTieredContract: (contractId: string) => void;
  tickTieredContracts: (elapsedDays: number, currentYear: number) => void;
}

const INITIAL_CONTRACTS: ContractItem[] = [
  {
    id: "titan_steel",
    title: "High-Strength Micro-Alloy Steel Supply",
    partnerName: "Titan Metallurgical Corp",
    partnerCountry: "Germany",
    category: "INBOUND_SUPPLIER",
    status: "ACTIVE",
    monthlyCashflow: -145000,
    terms: {
      unitPrice: 940,
      annualVolume: 1850,
      durationMonths: 24,
      remainingMonths: 14,
      exclusivity: false,
      defectTolerancePpm: 28,
      paymentTerm: "NET_30",
      earlyTerminationPenalty: 350000,
      slaCommitment: "Guaranteed 14-day delivery to stamping plant + buffer stock",
    },
    relationshipScore: 88,
    perk: "3% volume rebate on high-strength chassis sheet steel",
    riskFactor: "LOW",
    historyDeliveredUnits: 2850,
    onTimeDeliveryRate: 98.4,
    accentColor: "border-sky-500/40 text-sky-400 bg-sky-500/10",
  },
  {
    id: "toray_carbon",
    title: "Aerospace Pre-Preg Carbon Fiber & Honeycomb",
    partnerName: "Toray Composite Systems",
    partnerCountry: "Japan",
    category: "INBOUND_SUPPLIER",
    status: "ACTIVE",
    monthlyCashflow: -280000,
    terms: {
      unitPrice: 1680,
      annualVolume: 2000,
      durationMonths: 36,
      remainingMonths: 22,
      exclusivity: true,
      defectTolerancePpm: 12,
      paymentTerm: "NET_60",
      earlyTerminationPenalty: 650000,
      slaCommitment: "Exclusive autoclave pre-preg lot allocation with zero batch variance",
    },
    relationshipScore: 94,
    perk: "Exclusive priority supply during global composite shortages",
    riskFactor: "LOW",
    historyDeliveredUnits: 4100,
    onTimeDeliveryRate: 99.1,
    accentColor: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  },
  {
    id: "brembo_brakes",
    title: "Monobloc 6-Piston Brakes & Carbon-Ceramics",
    partnerName: "Brembo S.p.A.",
    partnerCountry: "Italy",
    category: "INBOUND_SUPPLIER",
    status: "PENDING_RENEWAL",
    monthlyCashflow: -95000,
    terms: {
      unitPrice: 1450,
      annualVolume: 780,
      durationMonths: 12,
      remainingMonths: 2,
      exclusivity: false,
      defectTolerancePpm: 22,
      paymentTerm: "NET_30",
      earlyTerminationPenalty: 120000,
      slaCommitment: "Calibrated fade resistance testing with dyno certification",
    },
    relationshipScore: 91,
    perk: "OEM wholesale pricing on 390mm slotted carbon-ceramic rotors",
    riskFactor: "BALANCED",
    historyDeliveredUnits: 1540,
    onTimeDeliveryRate: 96.8,
    accentColor: "border-rose-500/40 text-rose-400 bg-rose-500/10",
  },
  {
    id: "nova_oem_v8",
    title: "4.0L Twin-Turbo V8 OEM Powertrain Supply",
    partnerName: "Nova Automobili",
    partnerCountry: "Italy",
    category: "OUTBOUND_OEM",
    status: "ACTIVE",
    monthlyCashflow: 2850000,
    terms: {
      unitPrice: 28500,
      annualVolume: 1200,
      durationMonths: 36,
      remainingMonths: 19,
      exclusivity: false,
      defectTolerancePpm: 15,
      paymentTerm: "NET_30",
      earlyTerminationPenalty: 4500000,
      slaCommitment: "740 HP hot-V engine supply with factory telemetry calibration",
    },
    relationshipScore: 84,
    perk: "Major commercial revenue source utilizing 35% engine plant capacity",
    riskFactor: "BALANCED",
    historyDeliveredUnits: 1900,
    onTimeDeliveryRate: 97.5,
    accentColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "titan_tub_supply",
    title: "Carbon Monocoque Tub Contract Assembly",
    partnerName: "Titan Motors",
    partnerCountry: "Germany",
    category: "OUTBOUND_OEM",
    status: "ACTIVE",
    monthlyCashflow: 1420000,
    terms: {
      unitPrice: 38000,
      annualVolume: 450,
      durationMonths: 24,
      remainingMonths: 11,
      exclusivity: false,
      defectTolerancePpm: 8,
      paymentTerm: "UPFRONT",
      earlyTerminationPenalty: 2800000,
      slaCommitment: "Torsional stiffness > 42,000 Nm/deg guaranteed batch certification",
    },
    relationshipScore: 89,
    perk: "High-margin tub manufacturing partnership with upfront advance billing",
    riskFactor: "LOW",
    historyDeliveredUnits: 680,
    onTimeDeliveryRate: 98.9,
    accentColor: "border-teal-500/40 text-teal-400 bg-teal-500/10",
  },
  {
    id: "falcon_f1_supply",
    title: "Formula 1 Power Unit Supply & Trackside Telemetry",
    partnerName: "Falcon Racing GP",
    partnerCountry: "United Kingdom",
    category: "MOTORSPORT",
    status: "ACTIVE",
    monthlyCashflow: 1166666,
    terms: {
      unitPrice: 14000000,
      annualVolume: 4,
      durationMonths: 24,
      remainingMonths: 16,
      exclusivity: true,
      defectTolerancePpm: 5,
      paymentTerm: "NET_30",
      earlyTerminationPenalty: 8000000,
      slaCommitment: "15,000 RPM V6 Turbo Hybrid power units + 2 embedded engineers",
    },
    relationshipScore: 92,
    perk: "+$500,000 bonus per Grand Prix podium + live trackside telemetry data",
    riskFactor: "BALANCED",
    historyDeliveredUnits: 6,
    onTimeDeliveryRate: 100.0,
    accentColor: "border-red-500/40 text-red-400 bg-red-500/10",
  },
  {
    id: "velocita_sponsor",
    title: "Velocita Championship Title Sponsorship",
    partnerName: "Velocita Energy & Logistics",
    partnerCountry: "Switzerland",
    category: "MOTORSPORT",
    status: "ACTIVE",
    monthlyCashflow: 350000,
    terms: {
      unitPrice: 4200000,
      annualVolume: 1,
      durationMonths: 12,
      remainingMonths: 7,
      exclusivity: true,
      defectTolerancePpm: 0,
      paymentTerm: "UPFRONT",
      earlyTerminationPenalty: 2000000,
      slaCommitment: "Full livery branding on factory hypercar entries in WEC",
    },
    relationshipScore: 86,
    perk: "+12 corporate brand reputation bonus for race podium appearances",
    riskFactor: "LOW",
    historyDeliveredUnits: 1,
    onTimeDeliveryRate: 100.0,
    accentColor: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  },
  {
    id: "sic_inverter_license",
    title: "Silicon Carbide 800V Inverter IP Licensing",
    partnerName: "Veloce Dynamics",
    partnerCountry: "USA",
    category: "TECH_LICENSE",
    status: "ACTIVE",
    monthlyCashflow: 380000,
    terms: {
      unitPrice: 190,
      annualVolume: 24000,
      durationMonths: 48,
      remainingMonths: 31,
      exclusivity: false,
      defectTolerancePpm: 0,
      paymentTerm: "NET_60",
      earlyTerminationPenalty: 1500000,
      slaCommitment: "Patented gate-driver algorithm license with quarterly firmware updates",
    },
    relationshipScore: 95,
    perk: "Pure royalty income per vehicle sold without factory material cost",
    riskFactor: "LOW",
    historyDeliveredUnits: 48000,
    onTimeDeliveryRate: 100.0,
    accentColor: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
  },
];

const INITIAL_TENDERS: TenderOpportunity[] = [
  {
    id: "tender_scuderia_v12",
    title: "Scuderia Veloce GT - Naturally Aspirated V12 Engine Tender",
    partnerName: "Scuderia Veloce GT",
    partnerCountry: "Italy",
    category: "OUTBOUND_OEM",
    description: "Seeking bespoke 6.5L V12 dry-sump engines for their upcoming limited homologation supercar (300 units/yr).",
    proposedAnnualVolume: 300,
    baseUnitPrice: 42000,
    benchmarkPrice: 40000,
    recommendedDurationYears: 3,
    exclusivityRequested: true,
    partnerPersonality: "PRESTIGE_SEEKER",
    slaExpectation: "Acoustic harmonic tuning > 9,000 RPM and 800+ HP dyno sheet",
    perkOnSign: "+$1,050,000 / month gross revenue and +8 Global Prestige reputation",
  },
  {
    id: "tender_lithium_direct",
    title: "Direct Battery Lithium Hydroxide 3-Year Strategic Supply",
    partnerName: "Atacama Clean Minerals",
    partnerCountry: "Chile",
    category: "INBOUND_SUPPLIER",
    description: "Offering long-term fixed rate battery-grade lithium hydroxide directly from brine extraction facilities.",
    proposedAnnualVolume: 4500,
    baseUnitPrice: 320,
    benchmarkPrice: 380,
    recommendedDurationYears: 3,
    exclusivityRequested: false,
    partnerPersonality: "CONSERVATIVE",
    slaExpectation: "99.8% purity grade with guaranteed shipment even in market spikes",
    perkOnSign: "16% cost savings on battery pack cell assemblies against spot market",
  },
  {
    id: "tender_aero_ground_effect",
    title: "Ground Effect Active Floor Venturi Patent Licensing",
    partnerName: "Kallista Engineering Works",
    partnerCountry: "United Kingdom",
    category: "TECH_LICENSE",
    description: "Requests non-exclusive licensing rights for our active Venturi skirt geometry to use in track-day cars.",
    proposedAnnualVolume: 1200,
    baseUnitPrice: 850,
    benchmarkPrice: 750,
    recommendedDurationYears: 5,
    exclusivityRequested: false,
    partnerPersonality: "AGGRESSIVE",
    slaExpectation: "CAD step files and aerodynamic flow simulation dataset transfer",
    perkOnSign: "+$85,000 / month pure profit royalty with zero physical logistics",
  },
];

export const useContractsStore = create<ContractsState>((set, get) => ({
  contracts: INITIAL_CONTRACTS,
  tenders: INITIAL_TENDERS,
  selectedContractId: "titan_steel",
  activeNegotiation: null,

  // Tiered Contracts System Initial State
  activeTieredContracts: [],
  completedTieredContracts: [],
  customFollowUpTenders: [],
  selectedTierTab: "PRODUCTION",

  setSelectedTierTab: (tab) => set({ selectedTierTab: tab }),

  acceptTieredContract: (template, currentYear, currentMonth) => {
    const active = createActiveTieredContract(template, currentYear, currentMonth);
    set((state) => ({
      activeTieredContracts: [active, ...state.activeTieredContracts],
      customFollowUpTenders: state.customFollowUpTenders.filter((t) => t.id !== template.id),
    }));
    return active;
  },

  cancelTieredContract: (contractId) => {
    set((state) => ({
      activeTieredContracts: state.activeTieredContracts.filter((c) => c.id !== contractId),
    }));
  },

  tickTieredContracts: (elapsedDays, currentYear) => {
    const { activeTieredContracts, completedTieredContracts, customFollowUpTenders } = get();
    if (activeTieredContracts.length === 0) return;

    const repStore = useReputationStore.getState();
    const financeStore = useCompanyFinanceStore.getState();
    const campusStore = useCampusStore.getState();
    const rawTier = campusStore.factoryState?.factoryTier;
    const factoryTier: "boutique" | "small_batch" | "mid_volume" | "high_volume" | "mega" =
      rawTier === "workshop_plant"
        ? "boutique"
        : rawTier === "modern_assembly_plant"
        ? "mid_volume"
        : rawTier === "large_automotive_plant"
        ? "high_volume"
        : rawTier === "advanced_manufacturing_campus"
        ? "mega"
        : "small_batch";

    const updatedActive: ActiveTieredContract[] = [];
    const newlyCompleted: ActiveTieredContract[] = [...completedTieredContracts];
    const newTenders: TieredContractTemplate[] = [...customFollowUpTenders];

    for (const contract of activeTieredContracts) {
      const result = tickTieredContract(contract, elapsedDays, {
        playerMfgQualityScore: repStore.dimensions.manufacturingQuality?.score ?? 30,
        playerEngScore: repStore.dimensions.engineering?.score ?? 30,
        factoryTier,
        cashAvailable: financeStore.cash,
        addCash: (amount, _reason) => {
          useCompanyFinanceStore.setState((s) => ({ cash: s.cash + amount }));
        },
        deductCash: (amount, _reason) => {
          useCompanyFinanceStore.setState((s) => ({ cash: s.cash - amount }));
        },
        addReputation: (rewards) => {
          for (const [dim, val] of Object.entries(rewards)) {
            if (val !== undefined && val !== 0) {
              repStore.modifyDimension(dim as any, val, `Contract Execution`);
            }
          }
        },
        currentYear,
      });

      if (result.updatedContract.status === "COMPLETED" || result.updatedContract.status === "BREACHED") {
        newlyCompleted.unshift(result.updatedContract);
      } else {
        updatedActive.push(result.updatedContract);
      }

      if (result.followUpTemplate) {
        newTenders.unshift(result.followUpTemplate);
      }
    }

    set({
      activeTieredContracts: updatedActive,
      completedTieredContracts: newlyCompleted,
      customFollowUpTenders: newTenders,
    });
  },

  getNetMonthlyCashflow: () => {
    return get().contracts
      .filter(c => c.status === "ACTIVE" || c.status === "PENDING_RENEWAL")
      .reduce((sum, c) => sum + c.monthlyCashflow, 0);
  },

  getTotalAnnualizedValue: () => {
    return get().contracts
      .filter(c => c.status === "ACTIVE" || c.status === "PENDING_RENEWAL")
      .reduce((sum, c) => sum + Math.abs(c.monthlyCashflow) * 12, 0);
  },

  getAveragePartnerScore: () => {
    const list = get().contracts;
    if (list.length === 0) return 0;
    const total = list.reduce((sum, c) => sum + c.relationshipScore, 0);
    return Math.round(total / list.length);
  },

  getSecurityIndex: () => {
    // Percentage of long-term and low-risk contracts
    const active = get().contracts.filter(c => c.status === "ACTIVE");
    if (active.length === 0) return 0;
    const longTermCount = active.filter(c => c.terms.durationMonths >= 24 && c.riskFactor === "LOW").length;
    return Math.round((longTermCount / active.length) * 100);
  },

  selectContract: (id) => set({ selectedContractId: id }),

  openDealRoomForTender: (tenderId) => {
    const tender = get().tenders.find(t => t.id === tenderId);
    if (!tender) return;

    set({
      activeNegotiation: {
        tenderId: tender.id,
        partnerName: tender.partnerName,
        category: tender.category,
        unitPrice: tender.baseUnitPrice,
        annualVolume: tender.proposedAnnualVolume,
        durationYears: (tender.recommendedDurationYears as 1 | 3 | 5) || 3,
        exclusivity: tender.exclusivityRequested,
        paymentTerm: "NET_30",
        penaltyClausePct: 15,
        acceptanceProbability: 80,
        partnerSentiment: "FAVORABLE",
      },
    });
  },

  openDealRoomForRenegotiation: (contractId) => {
    const con = get().contracts.find(c => c.id === contractId);
    if (!con) return;

    const yrs = Math.max(1, Math.min(5, Math.round(con.terms.durationMonths / 12))) as 1 | 3 | 5;

    set({
      activeNegotiation: {
        tenderId: con.id,
        targetContractId: con.id,
        partnerName: con.partnerName,
        category: con.category,
        unitPrice: con.terms.unitPrice,
        annualVolume: con.terms.annualVolume,
        durationYears: yrs,
        exclusivity: con.terms.exclusivity,
        paymentTerm: con.terms.paymentTerm,
        penaltyClausePct: 20,
        acceptanceProbability: 85,
        partnerSentiment: "FAVORABLE",
      },
    });
  },

  closeDealRoom: () => set({ activeNegotiation: null }),

  updateNegotiationTerms: (patch) => {
    const cur = get().activeNegotiation;
    if (!cur) return;

    const updated = { ...cur, ...patch };

    // Dynamically calculate acceptance probability & partner sentiment
    let prob = 75;

    if (updated.category === "INBOUND_SUPPLIER") {
      // For inbound: supplier wants higher unit price, longer duration, higher volume
      const tender = get().tenders.find(t => t.id === updated.tenderId);
      const benchmark = tender ? tender.benchmarkPrice : updated.unitPrice;
      const priceDiffPct = ((updated.unitPrice - benchmark) / benchmark) * 100;
      
      prob += priceDiffPct * 1.5;
      if (updated.durationYears >= 3) prob += 12;
      if (updated.exclusivity) prob -= 8;
      if (updated.paymentTerm === "UPFRONT") prob += 15;
    } else {
      // For outbound OEM / Motorsport / Tech: buyer wants lower price or higher volume
      const tender = get().tenders.find(t => t.id === updated.tenderId);
      const benchmark = tender ? tender.benchmarkPrice : updated.unitPrice;
      const priceDiffPct = ((benchmark - updated.unitPrice) / benchmark) * 100;
      
      prob += priceDiffPct * 1.8;
      if (updated.durationYears >= 3) prob += 10;
      if (updated.exclusivity) prob += 12; // Outbound buyer loves exclusivity
    }

    prob = Math.max(5, Math.min(99, Math.round(prob)));

    let sentiment: "INSULTED" | "HESITANT" | "FAVORABLE" | "EAGER" = "FAVORABLE";
    if (prob < 30) sentiment = "INSULTED";
    else if (prob < 60) sentiment = "HESITANT";
    else if (prob >= 85) sentiment = "EAGER";

    set({
      activeNegotiation: {
        ...updated,
        acceptanceProbability: prob,
        partnerSentiment: sentiment,
      },
    });
  },

  requestCounterOffer: () => {
    const cur = get().activeNegotiation;
    if (!cur) return;

    let counterPrice = cur.unitPrice;
    let message = "";

    if (cur.category === "INBOUND_SUPPLIER") {
      counterPrice = Math.round(cur.unitPrice * 1.05);
      message = `We cannot accept ${cur.unitPrice} credits/unit. However, we can sign at ${counterPrice} credits if you commit to a 3-year term with Net-30 payment.`;
    } else {
      counterPrice = Math.round(cur.unitPrice * 0.95);
      message = `Our procurement board requests a competitive price of ${counterPrice} credits/unit with 3-year guaranteed allocation.`;
    }

    set({
      activeNegotiation: {
        ...cur,
        counterOffer: {
          unitPrice: counterPrice,
          durationYears: 3,
          annualVolume: cur.annualVolume,
          message,
        },
      },
    });
  },

  ratifyNegotiation: () => {
    const cur = get().activeNegotiation;
    if (!cur || cur.acceptanceProbability < 40) return false;

    const tender = get().tenders.find(t => t.id === cur.tenderId);
    const existing = cur.targetContractId 
      ? get().contracts.find(c => c.id === cur.targetContractId)
      : null;

    const monthlyCash = Math.round((cur.unitPrice * cur.annualVolume) / 12);
    const signedMonthly = cur.category === "INBOUND_SUPPLIER" ? -monthlyCash : monthlyCash;

    if (existing) {
      // Update existing contract
      const updatedList = get().contracts.map(c => {
        if (c.id === existing.id) {
          return {
            ...c,
            status: "ACTIVE" as ContractStatus,
            monthlyCashflow: signedMonthly,
            terms: {
              ...c.terms,
              unitPrice: cur.unitPrice,
              annualVolume: cur.annualVolume,
              durationMonths: cur.durationYears * 12,
              remainingMonths: cur.durationYears * 12,
              exclusivity: cur.exclusivity,
              paymentTerm: cur.paymentTerm,
            },
            relationshipScore: Math.min(100, c.relationshipScore + 6),
          };
        }
        return c;
      });

      set({
        contracts: updatedList,
        activeNegotiation: null,
      });

      useSimulationClockStore.getState().addFeedItem({
        type: "supplier",
        title: `Contract Renegotiated: ${existing.partnerName}`,
        description: `Successfully ratified new ${cur.durationYears}-year terms with ${existing.title}.`,
        timestamp: "Just now",
      });

      return true;
    }

    if (tender) {
      // New contract signed from tender
      const newContract: ContractItem = {
        id: `con_${Date.now()}`,
        title: tender.title,
        partnerName: tender.partnerName,
        partnerCountry: tender.partnerCountry,
        category: tender.category,
        status: "ACTIVE",
        monthlyCashflow: signedMonthly,
        terms: {
          unitPrice: cur.unitPrice,
          annualVolume: cur.annualVolume,
          durationMonths: cur.durationYears * 12,
          remainingMonths: cur.durationYears * 12,
          exclusivity: cur.exclusivity,
          defectTolerancePpm: 20,
          paymentTerm: cur.paymentTerm,
          earlyTerminationPenalty: Math.round(monthlyCash * 3),
          slaCommitment: tender.slaExpectation,
        },
        relationshipScore: 75,
        perk: tender.perkOnSign,
        riskFactor: "LOW",
        historyDeliveredUnits: 0,
        onTimeDeliveryRate: 100.0,
        accentColor: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      };

      set({
        contracts: [newContract, ...get().contracts],
        tenders: get().tenders.filter(t => t.id !== tender.id),
        selectedContractId: newContract.id,
        activeNegotiation: null,
      });

      useSimulationClockStore.getState().addFeedItem({
        type: "supplier",
        title: `New Deal Signed: ${tender.partnerName}`,
        description: `Ratified ${tender.title} for ${cur.durationYears} years.`,
        timestamp: "Just now",
      });

      return true;
    }

    return false;
  },

  terminateContract: (contractId) => {
    const con = get().contracts.find(c => c.id === contractId);
    if (!con) return;

    const penalty = con.terms.earlyTerminationPenalty;
    const clockStore = useSimulationClockStore.getState();

    // Deduct penalty from company cash
    useSimulationClockStore.setState({
      cash: Math.max(0, clockStore.cash - penalty),
      reputation: Math.max(10, clockStore.reputation - 4),
    });

    clockStore.addFeedItem({
      type: "supplier",
      title: `Contract Terminated: ${con.partnerName}`,
      description: `Incurred $${penalty.toLocaleString()} early termination penalty fee.`,
      timestamp: "Just now",
    });

    set({
      contracts: get().contracts.filter(c => c.id !== contractId),
      selectedContractId: get().contracts[0]?.id || null,
    });
  },

  extendContract: (contractId, additionalMonths = 12) => {
    const updated = get().contracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          status: "ACTIVE" as ContractStatus,
          terms: {
            ...c.terms,
            remainingMonths: c.terms.remainingMonths + additionalMonths,
            durationMonths: c.terms.durationMonths + additionalMonths,
          },
          relationshipScore: Math.min(100, c.relationshipScore + 4),
        };
      }
      return c;
    });

    set({ contracts: updated });

    useSimulationClockStore.getState().addFeedItem({
      type: "supplier",
      title: "Contract Extension",
      description: `Extended partnership by ${additionalMonths} months with favorable terms.`,
      timestamp: "Just now",
    });
  },

  tickContracts: (elapsedDays) => {
    // 30 days = 1 month decrement
    if (elapsedDays < 1) return;

    const monthsPassed = elapsedDays / 30;

    set(state => {
      const updated = state.contracts.map(c => {
        const newRemaining = Math.max(0, c.terms.remainingMonths - monthsPassed);
        let newStatus: ContractStatus = c.status;

        if (newRemaining <= 0) {
          newStatus = "EXPIRED";
        } else if (newRemaining <= 2) {
          newStatus = "PENDING_RENEWAL";
        }

        return {
          ...c,
          terms: {
            ...c.terms,
            remainingMonths: Math.round(newRemaining * 10) / 10,
          },
          status: newStatus,
        };
      });

      return { contracts: updated };
    });
  },
}));

// Automatic reactive synchronization with Simulation Clock
// Uses dual approach: legacy Zustand subscription + proper clockListeners registration
if (typeof window !== "undefined") {
  // Legacy subscription (tracks raw day field changes)
  let lastDay = useSimulationClockStore.getState().day;
  let lastMonth = useSimulationClockStore.getState().month;
  let lastYear = useSimulationClockStore.getState().year;

  useSimulationClockStore.subscribe((state) => {
    const dayChanged = state.day !== lastDay || state.month !== lastMonth || state.year !== lastYear;
    if (dayChanged) {
      // Calculate actual days elapsed (handles month/year boundaries)
      const prevDate = new Date(Date.UTC(lastYear, lastMonth - 1, lastDay));
      const currDate = new Date(Date.UTC(state.year, state.month - 1, state.day));
      const diff = Math.max(1, Math.round((currDate.getTime() - prevDate.getTime()) / 86_400_000));
      
      lastDay = state.day;
      lastMonth = state.month;
      lastYear = state.year;
      
      useContractsStore.getState().tickContracts(diff);
      useContractsStore.getState().tickTieredContracts(diff, state.year);
    }
  });
}

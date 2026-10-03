import { create } from "zustand";

export interface CompanyIdentity {
  companyName: string;
  companyFounded: number; // Year or game start month
  tagline: string;
  legalStructure: "private_limited" | "corporation" | "conglomerate";
  headquartersCity: string;
  country: string;
  logoIcon: string;
  brandPhilosophy: "performance" | "luxury" | "innovation" | "mass_production" | "balanced";
}

export interface CompanyIdentityState extends CompanyIdentity {
  setCompanyName: (name: string) => void;
  setTagline: (tagline: string) => void;
  setLegalStructure: (structure: CompanyIdentity["legalStructure"]) => void;
  setBrandPhilosophy: (philosophy: CompanyIdentity["brandPhilosophy"]) => void;
  updateIdentity: (patch: Partial<CompanyIdentity>) => void;
  resetIdentity: () => void;
}

const DEFAULT_IDENTITY: CompanyIdentity = {
  companyName: "My Automotive Co.",
  companyFounded: 1970,
  tagline: "Pioneering Automotive Excellence",
  legalStructure: "corporation",
  headquartersCity: "Apex City",
  country: "United Kingdom",
  logoIcon: "🏎️",
  brandPhilosophy: "performance",
};

export const useCompanyIdentityStore = create<CompanyIdentityState>((set) => ({
  ...DEFAULT_IDENTITY,
  setCompanyName: (name: string) => set({ companyName: name }),
  setTagline: (tagline: string) => set({ tagline }),
  setLegalStructure: (legalStructure) => set({ legalStructure }),
  setBrandPhilosophy: (brandPhilosophy) => set({ brandPhilosophy }),
  updateIdentity: (patch) => set((s) => ({ ...s, ...patch })),
  resetIdentity: () => set(DEFAULT_IDENTITY),
}));

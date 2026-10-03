# Architecture Directive: Shell, Routing, and Domain Boundaries

## Executive Summary
This document defines the strict architectural separation of concerns for the application shell ([`App.tsx`](file:///e:/Car_Automation/src/App.tsx)), the navigation layer ([`StageSwitcher.tsx`](file:///e:/Car_Automation/src/components/StageSwitcher.tsx) & [`navigationRegistry.tsx`](file:///e:/Car_Automation/src/navigation/navigationRegistry.tsx)), and domain-specific pages/systems.

---

## 1. The Core Architecture Law

The application follows a unidirectional, strictly decoupled 4-tier flow:

```
App (Shell / Shell UI / Hotkeys / Theme)
  ↓
Routing & Navigation (navigationRegistry / StageSwitcher)
  ↓
Page / Studio View (FactoryPage, ContractsPage, FinancePage, EngineDesigner, etc.)
  ↓
Domain Actions & Stores (useFactoryStore, useContractsStore, useCompanyFinanceStore, etc.)
```

### Prohibited Patterns
- **NO Business Logic in `App.tsx`**: `App.tsx` must never perform economic, supply chain, physics, manufacturing, or contracts calculations.
- **NO Domain Calculations in Navigation**: `StageSwitcher` and `navigationRegistry` only map stage IDs to display metadata, layouts, and route gating.
- **NO Leaked Domain State into Container Styles**: Shell padding and overflow are driven purely by general layout categories (`isMainMenuOrSubPage`, `isCarCreationStage`) rather than specific subsystem flags.

---

## 2. Responsibilities by Tier

### Tier 1: `App.tsx` (Application Shell)
- **Error Boundaries**: Catches runtime rendering failures gracefully.
- **Visual Chromes & Parallax**: Houses background textures, bokeh lights, and smooth momentum scrolling.
- **Global Keybindings**: Developer overlays (F8, F9, Ctrl+Shift+D), search (`Cmd+K`), focus mode (`Cmd+Shift+F`), and sidebar toggles.
- **Layout Container**: Wraps the active route in `StageSwitcher` alongside the contextual stats rail.
- **Zero Domain State**: Imports no engineering or economic stores.

### Tier 2: `navigationRegistry.tsx` & `StageSwitcher.tsx` (Routing & Navigation)
- **Stage Registry**: Canonical list of application stages (`engineering`, `studios`, `simulation`, `world`).
- **Route Gating**: Verifies sequential engineering pipeline prerequisites via `canEnterStage(...)` before mounting gated stages.
- **Dynamic Lazy Loading**: Code-splits pages and studios using `React.lazy` and `Suspense` so heavy 3D canvases and calculations only initialize on demand.

### Tier 3: Pages & Studio Views (UI Interfaces)
- Examples: [`FactoryPage.tsx`](file:///e:/Car_Automation/src/components/factory/FactoryPage.tsx), [`ContractsPage.tsx`](file:///e:/Car_Automation/src/components/mainMenu/pages/ContractsPage.tsx), [`FinancePage.tsx`](file:///e:/Car_Automation/src/components/finance/FinancePage.tsx), [`EngineDesigner.tsx`](file:///e:/Car_Automation/src/components/EngineDesigner.tsx).
- Owns local presentation, modals, tabs, and direct store bindings.
- Invokes domain store methods upon user action.

### Tier 4: Domain Stores & Engines (Autonomous Simulation)
- **Factory**: [`factoryStore.ts`](file:///e:/Car_Automation/src/state/factoryStore.ts) + [`sim/factory/`](file:///e:/Car_Automation/src/sim/factory/).
- **Finance**: [`companyFinanceStore.ts`](file:///e:/Car_Automation/src/state/companyFinanceStore.ts) + [`companyLedgerEngine.ts`](file:///e:/Car_Automation/src/sim/economy/companyLedgerEngine.ts).
- **Contracts**: [`contractsStore.ts`](file:///e:/Car_Automation/src/state/contractsStore.ts) + [`sim/trade/`](file:///e:/Car_Automation/src/sim/trade/).
- **Clock**: [`simulationClockStore.ts`](file:///e:/Car_Automation/src/state/simulationClockStore.ts) + [`gameClockEngine.ts`](file:///e:/Car_Automation/src/state/gameClockEngine.ts).
- All stores respond reactively to `clockListeners` cadences (`day`, `month`, `year`) rather than being manually pumped by UI shells.

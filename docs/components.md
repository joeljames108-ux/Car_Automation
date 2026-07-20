# Components

Apex Engineer is organized into **15 design modules**, each represented by a dedicated React component. Below is a guide to every module.

---

## Command Center

**File:** `CommandCenter.tsx`

The dashboard overview that gives you a bird's-eye view of your vehicle's current state — key stats, quick actions, and navigation into every design module.

---

## Engine Designer

**File:** `EngineDesigner.tsx`

Configure your powertrain from the ground up:

| Parameter | Description |
|-----------|-------------|
| **Layout** | I3, I4, I6, V6, V8, V10, V12, Boxer4, Boxer6, Rotary, Hybrid, Electric |
| **Bore & Stroke** | Cylinder dimensions (mm) |
| **Compression Ratio** | Affects efficiency and knock risk |
| **Valvetrain** | OHV, SOHC, DOHC, DOHC with variable valve lift |
| **Cam Profile** | Duration, lift, timing, valve angle & size |
| **Forced Induction** | NA, supercharger, single/twin/bi/compound turbo |
| **Turbo Settings** | Size, boost pressure, wastegate, intercooler efficiency |
| **Fuel System** | Carburetor, TBI, port injection, direct, dual injection |
| **Hybrid/EV** | MGU-H, MGU-K, battery chemistry, motor layout, deploy mode |

The engine simulation produces a full **power curve** (HP & torque vs RPM), thermal efficiency, knock risk, BSFC, turbo lag, weight, cost, and reliability estimates.

---

## Vehicle Designer

**File:** `VehicleDesigner.tsx`

Set up the chassis and running gear:

- **Drivetrain** — FWD, RWD, AWD
- **Transmission** — Gear count, ratios, type (manual, DCT, auto, CVT, sequential)
- **Suspension** — Spring rates, damping, ride height, anti-roll bars
- **Brakes** — Disc size, pad compound, brake bias
- **Tires** — Width, profile, compound, pressure
- **Weight Distribution** — Front/rear balance

---

## Exterior Designer

**File:** `ExteriorDesigner.tsx`

Style the body of your vehicle — body type, paint colors, wheel design, lighting packages, and visual accessories.

---

## Aero Lab

**File:** `AeroLab.tsx`

A virtual wind tunnel for aerodynamic development:

- Drag coefficient (Cd) and frontal area tuning
- Downforce configuration — front splitter, rear wing angle, diffuser
- Active aerodynamics — DRS, adjustable ride height, adaptive elements
- Cooling duct management (radiator, brake ducts)
- Wind-tunnel research and CFD analysis upgrades

---

## Interior Designer

**File:** `InteriorsDesigner.tsx`

Configure the cabin — seat materials, dashboard layout, steering wheel style, sound deadening, and comfort features.

---

## Manufacturing Designer

**File:** `ManufacturingDesigner.tsx`

Choose manufacturing methods that affect cost, weight, and production volume:

- Body construction (steel monocoque, aluminum, carbon fiber, mixed)
- Assembly quality level
- Production volume targets
- QC standards

---

## Infotainment Designer

**File:** `InfotainmentDesigner.tsx`

Set up the vehicle's electronics and software stack:

- Display size and type
- Audio system configuration
- Connectivity (Bluetooth, Wi-Fi, cellular)
- Navigation and ADAS features
- OTA update capability

---

## R&D Center

**File:** `RDCenter.tsx`

Invest in long-term research to unlock new technologies:

- Research projects across multiple disciplines
- Budget allocation and timeline management
- Technology tree progression
- Breakthrough unlocks that feed back into all other design modules

---

## Simulation Dashboard

**File:** `SimulationDashboard.tsx`

View consolidated simulation results — performance benchmarks, efficiency metrics, and cost analysis in one place.

---

## Testing Lab

**File:** `TestingLab.tsx`

Run structured test programs to validate your design:

- 0-60 / 0-100 acceleration tests
- Braking distance tests
- Lateral G and skidpad
- Endurance and reliability
- NVH assessment

---

## Race Simulator

**File:** `RaceSimulator.tsx`

A full race simulation engine that models:

- Lap-by-lap tire degradation and fuel consumption
- Weather changes and strategy adaptation
- Pit stop timing and tire compound selection
- AI opponents with varying skill levels
- Points and championship tracking

---

## Detailed Stats

**File:** `DetailedStats.tsx`

Comprehensive analytics dashboard showing power curves, spider charts, lap-time breakdowns, and comparative benchmarks.

---

## Press Reviews

**File:** `PressReviews.tsx`

AI-generated automotive press reviews that evaluate your car across categories like performance, comfort, value, and design.

---

## Competitors

**File:** `Competitors.tsx`

Compare your vehicle against a roster of AI competitor cars to see where your design excels and where it falls short.

---

## State Management

### DesignContext

**File:** `state/DesignContext.tsx`

Central React context that holds the entire vehicle design state and exposes updater functions for each subsystem:

```typescript
interface DesignContextValue {
  design: VehicleDesign;
  sim: SimResult;
  units: UnitSystem;        // "metric" | "imperial"
  updateEngine(patch): void;
  updateVehicle(patch): void;
  updateAero(patch): void;
  updateExterior(patch): void;
  updateInterior(patch): void;
  updateElectronics(patch): void;
  updateManufacturing(patch): void;
  updateInfotainment(patch): void;
  setDesign(d): void;
  resetDesign(): void;
}
```

Every time the design changes, the `simulate()` function re-runs automatically via `useMemo`, so simulation results are always in sync.

**Unit Conversion Helpers:** `fmtSpeed`, `fmtWeight`, `fmtDistance`, `fmtPower`, `fmtTorque`, `fmtTemp`, `fmtFuel`, `fmtCurrency` — all respond to the global unit system toggle.

### RDContext

**File:** `state/RDContext.tsx`

Manages R&D project state, progress tracking, budget allocation, and technology unlocks.

---

## Simulation Engine

The `src/sim/` directory contains **pure TypeScript logic** with no React dependencies:

| File | Purpose |
|------|---------|
| `types.ts` | All interfaces and type definitions |
| `constants.ts` | Default values, lookup tables, material properties |
| `engine.ts` | Engine physics simulation (thermodynamics, power curves) |
| `race.ts` | Race simulation (lap modeling, tire degradation, strategy) |
| `rdEngine.ts` | R&D progression calculations |
| `rdTypes.ts` | R&D type definitions |
| `rdData.ts` | R&D project catalog |
| `reviews.ts` | Press review scoring and generation |
| `electronicsData.ts` | Infotainment and electronics specifications |
| `competitorTypes.ts` | Competitor vehicle definitions |

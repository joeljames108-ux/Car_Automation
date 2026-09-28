# Implementation Plan - Full Automotive Taxonomies (Price Tiers & Utility Classes)

Expand the game's platform types, body types, segments, preset vehicle generators, and simulation cost factors so that every price tier and utility class requested by the user is fully supported with realistic engineering specs and budgets.

## Taxonomies Covered

### 1. Price Tiers
- **Budget/Economy**: $12k – $18k MSRP (e.g., City Hatchback, basic 3-cyl / 4-cyl)
- **Lower Mid-range**: $18k – $26k MSRP (e.g., Compact Sedan / Crossover, 1.6L - 2.0L NA)
- **Upper Mid-range**: $26k – $40k MSRP (e.g., Midsize Sedan / Family SUV, 2.0L Turbo / Hybrid)
- **Premium**: $40k – $65k MSRP (e.g., Executive Sedan, Compact Luxury SUV, 3.0L Inline-6 / V6)
- **Luxury**: $65k – $120k MSRP (e.g., Fullsize Luxury Sedan, V8 Twin Turbo / Dual Motor EV)
- **Ultra Luxury**: $120k – $250k+ MSRP (e.g., Coachbuilt Limousine, V12 Biturbo / PHEV)
- **Exotic**: $150k – $350k MSRP (e.g., Mid-engine V8/V10 Sports / GT)
- **Supercar**: $250k – $600k MSRP (e.g., Carbon Monocoque, 700+ HP V10/V12)
- **Hypercar**: $600k – $3.0M+ MSRP (e.g., Quad-turbo / Multi-motor Tri-motor EV, 1000+ HP)

### 2. Utility & Specialty Classes
- **Body & Consumer**: City Car, Hatchback, Sedan, Wagon (Estate), Coupe, Convertible (Roadster/Cabriolet), SUV, Crossover (CUV), Pickup Truck, MPV, Minivan, Van, Off-road 4x4, Limousine
- **Performance & Heritage**: Sports Car, Grand Tourer (GT), Muscle Car, Pony Car, Supercar, Hypercar
- **Commercial & Fleet**: Commercial Vehicle, Taxi, Police Vehicle, Ambulance, Fire Vehicle
- **Motorsport**: Rally Car, Formula Car, Touring Car, GT Race Car, Drift Car, Track Car
- **Powertrain Tech**: Electric Vehicle (EV), Hybrid (HEV), Plug-in Hybrid (PHEV), Hydrogen Fuel Cell (FCEV)

---

## Proposed Code Changes

### Core Types & Enums
#### [MODIFY] [types.ts](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20%283%29/project/src/sim/types.ts)
- Extend `PlatformType` to support full price tiers: `budget_economy`, `lower_mid`, `upper_mid`, `premium`, `luxury`, `ultra_luxury`, `exotic`, `supercar`, `hypercar`, `commercial_fleet`, `motorsport`.
- Extend `BodyType` to ensure all utility body styles (`city_car`, `limousine`, `van`, `pickup`, `mpv`, `formula`, `offroad_4x4`, `police`, `fire_emergency`, `ambulance`) are typed.

### Simulation Constants & Cost Calibration
#### [MODIFY] [constants.ts](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20%283%29/project/src/sim/constants.ts)
- Update `PLATFORMS` to include calibrated cost factors (`costFactor`), weight bases, and drag factors for all price tiers.
- Add utility class presets with standard engineering configurations (engine layout, chassis material, electronics, infotainment, pricing targets).

### Preset Vehicle Generator Library
#### [NEW] [vehiclePresets.ts](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20%283%29/project/src/sim/vehiclePresets.ts)
- Create a comprehensive preset generator library containing pre-configured, realistic `VehicleDesign` objects for every single requested Price Tier and Utility Class.

### UI Integration
#### [MODIFY] [VehicleDesigner.tsx](file:///c:/Users/joelj/Downloads/project-bolt-sb1-a1kjcyhr%20%283%29/project/src/components/VehicleDesigner.tsx)
- Add a "Vehicle Preset Generator" dropdown to easily load any Price Tier or Utility Class preset in one click.

---

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to ensure 0 TypeScript compilation errors across all new types and preset objects.

### Simulation Verification
- Create and execute a test script (`verify_all_vehicles.ts`) that runs `simulate()` on every single price tier and utility vehicle preset to verify that unit costs, MSRPs, horsepower, curb weight, and fuel economy hit realistic targets.

# Implementation Plan - 100 Real-Life Sports Car Benchmark & Simulation Correlation Suite

This plan establishes a comprehensive benchmark dataset of 100 real-world sports cars spanning 10 performance tiers, maps them into the project's vehicle state and lap time simulation engines (`masterVehicleStateEngine.ts` and `circuitLapTimeSimulator.ts`), and evaluates the statistical correlation ($R^2$, MAPE, Pearson $r$) between real-world statistics/track lap times and simulated performance.

---

## 1. Objectives & Target Metrics

- **Goal**: Validate that our vehicle dynamics and circuit lap time simulator produce realistic, statistically correlated performance figures when initialized with real-world sports car specifications.
- **Key Metrics to Benchmark & Compare**:
  1. **Power-to-Weight Ratio** ($\text{HP/Tonne}$)
  2. **0–100 km/h (0–62 mph)** Acceleration Time ($\text{s}$)
  3. **0–200 km/h** Acceleration Time ($\text{s}$)
  4. **Top Speed** ($\text{km/h}$)
  5. **1/4 Mile (402m)** Elapsed Time ($\text{s}$) & Trap Speed ($\text{km/h}$)
  6. **Max Lateral Acceleration** ($g$)
  7. **Nürburgring Nordschleife Lap Time** ($\text{s}$)
  8. **Spa-Francorchamps GP Lap Time** ($\text{s}$)
  9. **Laguna Seca Lap Time** ($\text{s}$)

- **Statistical Acceptance Thresholds**:
  - **Top Speed**: $R^2 \ge 0.95$, MAPE $\le 3.5\%$
  - **0–100 km/h Acceleration**: $r \ge 0.92$, MAPE $\le 5.0\%$
  - **1/4 Mile Time**: $R^2 \ge 0.94$, MAPE $\le 4.0\%$
  - **Nürburgring Lap Time**: $r \ge 0.90$, MAPE $\le 4.5\%$

---

## 2. Dataset Specification (100 Real-World Sports Cars across 10 Tiers)

The benchmark dataset `src/sim/benchmarks/realWorldSportsCar100Dataset.ts` will catalog 100 sports cars with manufacturer-verified specifications and verified published track lap times:

| Tier | Category | Sample Vehicles Included (10 per tier) |
|---|---|---|
| **Tier 1** | Light & Compact Sports Cars | Mazda MX-5 Miata ND2, Toyota GR86, Subaru BRZ, Alpine A110 R, Honda Civic Type R FL5, VW Golf R Mk8, Mini JCW GP, Lotus Elise Cup 250, Hyundai Elantra N, BMW Z4 M40i |
| **Tier 2** | Mid-Range Sports & GT Cars | Porsche 718 Cayman GT4, BMW M2 G87, Toyota Supra MK5 3.0, Nissan Z Nismo, Ford Mustang Dark Horse, Chevrolet Corvette C8 Stingray, BMW M4 Competition G82, Audi TT RS, Lotus Emira V6, Jaguar F-Type R |
| **Tier 3** | Supercars & Track Specials | Porsche 911 GT3 RS (992), Chevrolet Corvette C8 Z06, Ferrari 296 GTB, Lamborghini Huracán STO, McLaren 720S, Ford GT (2017), Mercedes-AMG GT Black Series, Ferrari 488 Pista, Porsche 911 GT2 RS (991.2), Audi R8 V10 Performance |
| **Tier 4** | Hypercars & Megacars | Bugatti Chiron Pur Sport, Rimac Nevera, Koenigsegg Jesko Attack, Aston Martin Valkyrie, Mercedes-AMG ONE, Pagani Huayra R, McLaren P1, Porsche 918 Spyder, Ferrari LaFerrari, Gordon Murray T.50 |
| **Tier 5** | Historic & Iconic Legends | McLaren F1, Ferrari F40, Porsche 959, Nissan Skyline GT-R R34 V-Spec, Mazda RX-7 FD3S, Honda NSX Type R (NA2), Dodge Viper GTS (1996), AC Cobra 427, BMW M3 E46 CSL, Lamborghini Countach LP5000 QV |
| **Tier 6** | Electric & Hybrid Performance | Porsche Taycan Turbo S, Tesla Model S Plaid, Hyundai Ioniq 5 N, Lotus Evija, Pininfarina Battista, Rimac Concept One, BMW i8, Maserati GranTurismo Folgore, Audi RS e-tron GT, Polestar 1 |
| **Tier 7** | Lightweight Track Day Specials | Ariel Atom 4, BAC Mono R, Caterham Seven 620R, KTM X-Bow R, Radical SR8, Donkervoort F22, Czinger 21C, Pagani Zonda R, Aston Martin Vulcan, Brabham BT62 |
| **Tier 8** | Grand Tourers & Super Sedans | BMW M5 CS (F90), Cadillac CT5-V Blackwing, Alfa Romeo Giulia Quadrifoglio, Porsche Panamera Turbo S, Bentley Continental GT Speed, Maserati MC20, Ferrari 812 Competizione, Aston Martin DBS Superleggera, Lexus LFA, Nissan GT-R Nismo |
| **Tier 9** | Classic & Modern Muscle Icons | Mustang Shelby GT500 (2020), Dodge Challenger SRT Demon 170, Chevrolet Camaro ZL1 1LE, Chevrolet Corvette C7 ZR1, Dodge Viper ACR (2017), Shelby Cobra Daytona, Ford Sierra RS Cosworth, Lancia Stratos HF, Audi Sport Quattro, Plymouth Hemi Cuda |
| **Tier 10** | Endurance & LMH/LMDh Monsters | Porsche 919 Hybrid Evo, Ferrari 499P Modificata, Aston Martin Valkyrie AMR Pro, McLaren Senna GTR, Ferrari FXX K Evo, Lamborghini Essenza SCV12, Pagani Zonda Revolucion, Peugeot 9X8 LMH, Toyota GR010 Hybrid, Porsche 911 GT3 Cup (992) |

---

## 3. Real-Car to Simulator Mapping Architecture

A converter function `mapRealCarToMasterState(realCar: RealCarSpec): MasterVehicleState` in `src/sim/benchmarks/realCarSimulatorMapper.ts` will configure the simulator state:

1. **Powertrain Mapping**:
   - Engine layout (I4, V6, V8, V10, V12, Flat-6, EV, Hybrid)
   - Peak HP, Peak Torque Nm, Redline RPM
   - Boost pressure (turbos/superchargers) or electric motor kW rating
2. **Chassis & Body Mass Mapping**:
   - Curb Mass ($\text{kg}$), Weight distribution ($\%\text{F}/\%\text{R}$)
   - Wheelbase ($\text{mm}$), Track width ($\text{mm}$), CoG height ($\text{mm}$)
3. **Aerodynamics Mapping**:
   - Drag coefficient ($C_d$) & Frontal area ($A \text{ m}^2$)
   - Cl downforce curve @ 160 km/h and 250 km/h
4. **Tire & Brake Systems**:
   - Tire compound mapping (`ultra_high_performance`, `track_r_compound`, `racing_slick`)
   - Brake disc type (`cast_iron`, `carbon_ceramic_matrix`)

---

## 4. Multi-Solver Correlation & Telemetry Analysis Engine

The correlation engine `src/sim/benchmarks/benchmarkCorrelationEngine.ts` will evaluate all 100 sports cars across **all 3 simulation solver pathways**:

1. **Pathway 1: Analytical Vehicle Dynamics Solver (`masterVehicleStateEngine.ts`)**
   - Instant closed-form calculation of power-to-weight, top speed, 0–100 km/h, 0–200 km/h, 1/4 mile elapsed time, braking distance, and macro circuit lap times.
2. **Pathway 2: Discrete Quasi-Static Integration Solver (`circuitLapTimeSimulator.ts`)**
   - Forward/backward acceleration integration over 25m discrete track segments (Nürburgring Nordschleife, Spa-Francorchamps, Silverstone, Laguna Seca).
   - Generates full telemetry traces (speed profile, apex velocity limits, longitudinal/lateral G forces, corner braking markers).
3. **Pathway 3: Dual-Engine Comparative Analysis (Analytical vs. Discrete Integration vs. Real-World)**
   - Side-by-side metric comparison evaluating delta between Analytical Lap Time, Integrated Lap Time, and Real-World Lap Time.

- **Statistical Analysis Formulas (Evaluated Independently for Both Solvers)**:
  - Delta: $\Delta_i = S_i - R_i$
  - Percentage Error: $E_i = \frac{|S_i - R_i|}{R_i} \times 100\%$
  - Mean Absolute Percentage Error: $\text{MAPE} = \frac{1}{N} \sum_{i=1}^{N} E_i$
  - Pearson Correlation Coefficient:
    $$r = \frac{\sum (R_i - \bar{R})(S_i - \bar{S})}{\sqrt{\sum (R_i - \bar{R})^2 \sum (S_i - \bar{S})^2}}$$
  - Linear Regression Slope ($m$) & Intercept ($c$) for scatter plotting ($S = m \cdot R + c$).
  - Solver-to-Solver Inter-Correlation ($R^2$ between Analytical Engine and Discrete Integration Engine).

---

## 5. File Structure & Boundaries

```
src/
  sim/
    benchmarks/
      realWorldSportsCar100Dataset.ts   # 100 Real sports car definitions with verified stats & track lap times
      realCarSimulatorMapper.ts        # Converter mapping RealCarSpec to MasterVehicleState
      benchmarkCorrelationEngine.ts    # Correlation solver (R^2, MAPE, Pearson r, deltas)
      __tests__/
        realSportsCar100ValidationTests.ts  # Automated test suite enforcing statistical tolerances
  components/
    hypercar/
      benchmark/
        RealCar100BenchmarkStudio.tsx  # Visual UI dashboard with filterable matrix, scatter plots & telemetry delta views
```

---

## 6. Implementation Task List

1. **Create Benchmark Dataset (`src/sim/benchmarks/realWorldSportsCar100Dataset.ts`)**
   - Populate specs and lap times for 100 sports cars across 10 performance tiers.
2. **Implement Mapper (`src/sim/benchmarks/realCarSimulatorMapper.ts`)**
   - Construct state transformer converting `RealCarSpec` into `MasterVehicleState` and track simulation parameters.
3. **Build Multi-Solver Correlation Engine (`src/sim/benchmarks/benchmarkCorrelationEngine.ts`)**
   - Execute batch simulations across all 3 pathways (Analytical, Discrete Integration, Dual Comparative).
   - Calculate error metrics, $R^2$, Pearson $r$, and inter-solver correlation.
4. **Create Automated Test Suite (`src/sim/benchmarks/__tests__/realSportsCar100ValidationTests.ts`)**
   - Verify statistical acceptance criteria for both analytical and discrete solvers across all 100 vehicles.
5. **Build Interactive Studio UI (`src/components/hypercar/benchmark/RealCar100BenchmarkStudio.tsx`)**
   - Design interactive correlation matrix, regression scatter charts, solver toggle (Analytical vs Discrete vs Dual Comparative), and track telemetry overlay.

---

## 7. Verification & Validation Protocol

- **Unit Tests Execution**:
  - Run `vitest` / test runner on `realSportsCar100ValidationTests.ts`.
  - Confirm zero failing assertions across all 100 vehicle simulations.
- **Statistical Fidelity Check**:
  - Ensure $R^2 > 0.90$ across acceleration, top speed, and lap times.

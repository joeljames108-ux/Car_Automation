# AUTO TYCOON CAMPUS HQ — SYSTEM ARCHITECTURE & PRODUCTION CERTIFICATION (V1.0)

## Executive Summary
The **Auto Tycoon Campus HQ** is an interactive, physically grounded automotive corporate headquarters, R&D complex, and manufacturing hub simulator spanning historical automotive evolution from 1970 to 2030s+. Built upon the proven **UNIT_01 Production Standard**, it couples a 3D isometric Three.js viewport with deep economic, workforce, and engineering progression mechanics.

---

## 1. Master Coordinate Space & Zoning Architecture

The campus occupies a **500m × 400m** precision-engineered terrain base plate with rounded chamfer lips and an asphalt ring road network connecting four distinct operational sectors:

| Zone | Sector Name | Primary Domain | Facilities Included |
| :--- | :--- | :--- | :--- |
| **Zone A** | `ENGINEERING_RND` | Core Vehicle Engineering | Central Corporate HQ (UNIT_01), Powertrain & EV HQ (UNIT_02), Aero & Wind Tunnel HQ (UNIT_03), Vehicle Design & Styling HQ (UNIT_04), Chassis & Dynamics HQ (UNIT_05), Interior & HMI HQ (UNIT_06) |
| **Zone B** | `TESTING_VALIDATION` | Proving & Quality | Testing & Proving Grounds HQ (UNIT_07), Quality & Reliability HQ (UNIT_12), Safety & Crash Testing HQ (UNIT_13) |
| **Zone C** | `MANUFACTURING_SUPPLY_CHAIN` | Production & Logistics | Mega-Plot Factory Plant (UNIT_10), Supplier & Procurement HQ (UNIT_11) |
| **Zone D** | `MOTORSPORT_COMMERCIAL` | Racing, Commercial & Sales | Motorsport & Special Ops HQ (UNIT_08), Commercial Vehicles & Heavy Haul HQ (UNIT_09), Global Marketing & Sales HQ (UNIT_14) |

Each unit occupies a standard **36m × 36m** footprint (with the Factory occupying a dedicated **72m × 72m** mega-plot).

---

## 2. 8-Tier Architectural Evolution System

Every campus facility evolves across 8 architectural tiers (Levels 0 through 7):

1. **Level 0 (Greenfield)**: Surveyed plot with stakes, construction barrier fencing, and green glow perimeter.
2. **Level 1 (1970s Industrial)**: Brutalist exposed terracotta brick, corrugated metal, and exposed structural steel.
3. **Level 2 (1980s Modernist)**: Horizontal ribbon windows, painted steel frames, and analog telemetry antennas.
4. **Level 3 (1990s Corporate)**: Smoked acrylic curtain walls, concrete expansion wings, and computer server louvers.
5. **Level 4 (2000s High-Tech)**: Dielectric glass atriums, cantilevered skywalks, and high-speed wind tunnel intake flutes.
6. **Level 5 (2010s Global HQ)**: Multi-platform robotics bays, floor-to-ceiling Low-E glass, and wind-sculpted solar canopies.
7. **Level 6 (2020s Innovation)**: Zero-carbon microgrid roofs, EV skateboard marriage line gantries, and kinetic louvers.
8. **Level 7 (2030s Hypermodern)**: Crystalline aerodynamic spire, holographic branding totems, and automated drone delivery pads.

---

## 3. Civil Construction & Contractor Economy (Epoch 6)

Upgrades and expansion plot construction are governed by the **Contractor System**:

- **Budget Tier (General Union Subcontractors)**:
  - Capex multiplier: `0.82x` (-18% Capex savings).
  - Duration multiplier: `1.25x` (+25% project duration).
  - Delay risk: `15%` monthly probability of weather or supply chain delay.
  - Prestige bonus: `+0`.
- **Standard Tier (Standard Civil Engineering Partners)**:
  - Capex multiplier: `1.0x`.
  - Duration multiplier: `1.0x`.
  - Delay risk: `5%` baseline.
  - Prestige bonus: `+1`.
- **Premium Tier (Apex Masterworks Fast-Track Consortium)**:
  - Capex multiplier: `1.35x` (+35% expedited premium).
  - Duration multiplier: `0.70x` (30% faster commissioning).
  - Delay risk: `0%` (24/7 modular shifts).
  - Prestige bonus: `+4` on project completion.

Concurrent project capacity is dynamically bounded by Corporate HQ level (`2 + floor(corpHqLevel / 2)`).

---

## 4. Campus Passive Revenue & Operational Finances

The campus functions as an active financial contributor rather than purely a cost center:

- **Marketing & Sales HQ (UNIT_14)**: Showroom visitor ticket sales and branded lifestyle merchandise (`level * 450 + prestigeScore * 35` monthly visitors).
- **Commercial Vehicles HQ (UNIT_09)**: Commercial fleet chassis testing and third-party contract rigging fees.
- **Motorsport & Aero HQs (UNIT_08 & UNIT_03)**: Track day track rentals and wind tunnel calibration time booked by private racing teams.
- **Powertrain & EV HQ (UNIT_02)**: Advanced battery cell and inverter patent licensing revenue (unlocked at L4+).
- **Automated Cashflow Injection**: Net operating cashflow is evaluated during each simulation month tick and credited directly to company reserves.

---

## 5. Prestige & Brand Perception Engine (0–100 Scale)

Prestige is derived from operational facilities, average building tier, cross-facility compound synergies, and factory ownership:

- **Tier 1: Founding Workshop (`0–24 pts`)**: Baseline regional perception (`1.0x` sales appeal).
- **Tier 2: Regional Contender (`25–44 pts`)**: `1.05x` sales appeal, `+3` media road test points, `+8%` engineer recruitment speed.
- **Tier 3: Established Automaker (`45–64 pts`)**: `1.12x` sales appeal, `+6` media road test points, `+15%` recruitment appeal.
- **Tier 4: Global Benchmark OEM (`65–84 pts`)**: `1.22x` sales appeal, `+10` media road test points, `+25%` recruitment appeal.
- **Tier 5: Legendary Automotive Empire (`85–100 pts`)**: `1.35x` sales appeal, `+15` media road test points, `+40%` recruitment appeal.

---

## 6. Procedural Web Audio API Synthesis

Adhering strictly to `skill-for-audio-haptic-binding`, the campus audio engine generates zero-asset, procedural soundscapes:

- **1970s**: Analog 60Hz transformer electrical hum with lowpass filtering.
- **1980s**: High-frequency CRT flyback whine harmonic + warm analog sub-pad.
- **1990s**: Bandpass-filtered pink noise server rack ventilation fans.
- **2000s**: Resonant HVAC airflow with dual harmonic sine drones.
- **2010s**: High-pitch subtle inverter pulse with undulating low-frequency oscillation.
- **2020s+**: Whisper-quiet cleanroom laminar airflow with 432Hz crystal resonance.
- **Tactile UI Audio**: Pneumatic wrench impact clicks on upgrade, resonant bass rumble on plot unlock, and pleasant ascending chimes on completion.

---

## 8. Dynamic HQ Prestige & Visual Beautification System (Reputation-Driven)

### Core Architectural Decoupling:
- **HQ Level = Functional Capability**: Governs engineering staff capacity, R&D compute clusters, testing rig precision, and machinery throughput.
- **Company Reputation = Visual Prestige & Presentation**: Governs architectural grandeur, landscaping, portals, monuments, fountains, and ambient illumination without requiring player manual object placement.

### 5-Tier Reputation Evolution Matrix:
1. **Tier 1: Founding Workshop (Reputation 0–10)**: 20 pts budget. Utilitarian single door, gravel lawn border, enamelled plaque, pathway bollards.
2. **Tier 2: Growing Regional HQ (Reputation 11–25)**: 50 pts budget. Double glass entrance, company flagpole, flower beds, boxwood hedges, stone birdbath, foundation cornerstone.
3. **Tier 3: Established Brand Complex (Reputation 26–50)**: 120 pts budget. Branded portico & glass lobby, topiary roadsters, jet fountains, founder bronze bust, halo-lit logo, facade wash lights, milestone obelisk.
4. **Tier 4: Prestigious OEM Campus (Reputation 51–75)**: 220 pts budget. Monumental granite plaza, carbon-fibre motorsport arch, Zen rock garden, reflecting pool, kinetic wind airfoils, digital media ribbon, basalt monolith totem, fiber-optic arboretum uplights, Hall of Innovators walk.
5. **Tier 5: Iconic Automotive Empire (Reputation 76–100)**: 350 pts budget. Crystalline diamond atrium, botanical promenade, choreographed water spire, Chassis #001 heritage car plinth, skyline holographic beacon, centenary heritage rotunda, synchronized light shows.

### Historical Heritage Preservation Law:
- Past monuments, milestones, and replaced early entrances are **never destroyed or deleted**.
- Replaced lower-tier assets transition into permanent **heritage assets** (`isOverridden: true`, `isHeritage: true`), establishing the campus as an authentic physical timeline of the automotive enterprise.

### Specialization Differentiation:
Campus decorations dynamically adapt to the company's predominant commercial and technical achievements:
- **Engineering Track**: Cutaway titanium engine monuments, scale wind tunnel impeller blades.
- **Motorsport Track**: Carbon gantry portals, championship silverware rotundas, Le Mans victory murals.
- **Safety NCAP Track**: Crash test dummy impact rigs, zero-fatality engineering displays.
- **Luxury Track**: Carrara fluted marble colonnades, hand-blown crystal chandeliers.
- **Environmental Track**: Hydroponic living walls, photovoltaic solar groves, rapid charging garden oases.

---

## 9. Quality Assurance & Launch Certification

| Quality Gate | Standard | Status |
| :--- | :--- | :--- |
| **TypeScript Build** | `npx tsc --noEmit -p tsconfig.app.json` | ✅ **100% Clean (0 errors)** |
| **Vitest Unit & Integration Suites** | `npx vitest run` | ✅ **82 / 82 Passing Test Suites (669 Tests)** |
| **Mesh Quality & Naming** | `GEO_*` / `HITBOX_*` with `export_apply=False` | ✅ **Certified** |
| **Material Shading** | Principled BSDF PBR with clearcoat & optical glass | ✅ **Certified** |
| **Cross-System Wiring** | Navigation, Press Reviews, Simulation Clock, Audio, Beautification | ✅ **Certified** |
| **Heritage Preservation** | Non-destructive persistent landmark history | ✅ **Certified** |

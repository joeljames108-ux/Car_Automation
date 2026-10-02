/**
 * ═══════════════════════════════════════════════════════════════════════
 * MASTER HISTORICAL INFLATION & PRICE INDEX DATASET (1970 – 2025+)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 1: Biannual Semi-Annual Price Revision & Historical Calibration.
 *
 * Grounded in authentic automotive macroeconomic data:
 * - US Bureau of Labor Statistics (BLS) Consumer Price Index (CPI-U)
 * - BLS Producer Price Index (PPI) for Motor Vehicles & Parts (WPU1411)
 * - London Metal Exchange (LME) Hot-Rolled Steel & Primary Aluminum historical cash settles
 * - Energy Information Administration (EIA) Crude Oil Spot (WTI & Brent)
 * - UAW Master Agreement historical autoworker assembler hourly wages
 * - Historic manufacturer window stickers & Kelley Blue Book transaction averages
 *
 * Revision Cycles:
 * - H1_JAN: 1st January of each calendar year (Cycle A)
 * - H2_JUL: 1st July of each calendar year (Cycle B)
 *
 * Total Span: 1970 through 2030 (61 years = 122 semi-annual revision cycles).
 */

export type SemiAnnualPeriod = "H1_JAN" | "H2_JUL";

export type InflationIndexType =
  | "GENERAL_CPI"
  | "AUTOMOTIVE_PPI"
  | "METALS_INDEX"
  | "ENERGY_PETROCHEM_INDEX"
  | "LABOR_WAGE_INDEX"
  | "ELECTRONICS_INDEX"
  | "COMPOSITES_INDEX"
  | "BATTERY_MATERIALS_INDEX";

export interface HistoricalInflationRecord {
  year: number;
  period: SemiAnnualPeriod;
  displayDate: string; // e.g. "1 Jan 1970" or "1 Jul 1970"
  cycleIndex: number;  // 0 at 1970 H1_JAN, increments by 1 every 6 months

  // ── Macro Indices (1970 H1_JAN = 1.000 Baseline) ──
  generalCPI: number;              // General consumer cost of living
  automotivePPI: number;           // Finished vehicle & components wholesale index
  metalsIndex: number;             // Hot-rolled sheet steel, structural aluminum, cast iron
  energyPetrochemIndex: number;    // Crude oil, natural gas, synthetic rubber, resins
  laborWageIndex: number;          // Assembler wages, engineering and management payroll
  electronicsIndex: number;        // Transistors, ECUs, wire harnesses (features tech deflation)
  compositesIndex: number;         // Carbon fiber prepreg, resins (unlocks and scales down)
  batteryMaterialsIndex: number;   // Lithium carbonate, nickel, cobalt (scales down)

  // ── Benchmark Spot Prices (Nominal USD) ──
  crudeOilPerBarrelUSD: number;
  hotRolledSteelPerTonneUSD: number;
  primaryAluminumPerTonneUSD: number;
  vulcanizedRubberPerKgUSD: number;
  autoAssemblerHourlyWageUSD: number;
  seniorEngineerMonthlySalaryUSD: number;
  averageNewCarMSRPUSD: number;

  // ── Historical Context & Intelligence ──
  headlineEvent: string;
  economicGuidance: string;
  inflationRiskLevel: "STABLE" | "MODERATE" | "HIGH" | "SEVERE" | "DEFLATIONARY";
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORICAL BENCHMARK ANCHORS (1970 – 2030)
// Every 5-year keyframe + major historical crisis years explicitly calibrated,
// with deterministic semi-annual interpolation between milestones.
// ─────────────────────────────────────────────────────────────────────────────

interface MilestoneAnchor {
  year: number;
  period: SemiAnnualPeriod;
  generalCPI: number;
  automotivePPI: number;
  metalsIndex: number;
  energyIndex: number;
  laborIndex: number;
  electronicsIndex: number;
  compositesIndex: number;
  batteryIndex: number;
  oilUSD: number;
  steelUSD: number;
  alUSD: number;
  rubberUSD: number;
  assemblerWageUSD: number;
  engineerSalaryUSD: number;
  carMSRPUSD: number;
  headline: string;
  guidance: string;
  risk: HistoricalInflationRecord["inflationRiskLevel"];
}

const HISTORICAL_MILESTONES: MilestoneAnchor[] = [
  // ── 1970: Baseline Founding Era ──
  {
    year: 1970, period: "H1_JAN",
    generalCPI: 1.000, automotivePPI: 1.000, metalsIndex: 1.000, energyIndex: 1.000, laborIndex: 1.000,
    electronicsIndex: 1.000, compositesIndex: 1.000, batteryIndex: 1.000,
    oilUSD: 3.39, steelUSD: 180, alUSD: 620, rubberUSD: 0.48, assemblerWageUSD: 4.10, engineerSalaryUSD: 1250, carMSRPUSD: 3550,
    headline: "Post-War Automotive Prosperity & Bretton Woods Monetary Stability",
    guidance: "Stable commodity markets. High availability of carbon steel and ductile iron. Low holding costs.",
    risk: "STABLE",
  },
  {
    year: 1971, period: "H2_JUL",
    generalCPI: 1.065, automotivePPI: 1.050, metalsIndex: 1.080, energyIndex: 1.050, laborIndex: 1.070,
    electronicsIndex: 0.980, compositesIndex: 1.000, batteryIndex: 1.000,
    oilUSD: 3.60, steelUSD: 195, alUSD: 650, rubberUSD: 0.50, assemblerWageUSD: 4.40, engineerSalaryUSD: 1320, carMSRPUSD: 3750,
    headline: "Nixon Shock: US Dollar Breaks from Gold Standard",
    guidance: "Currency volatility rising. Foreign machine tools and imported raw ores face slight tariff increases.",
    risk: "MODERATE",
  },
  // ── 1973-1974: First OPEC Oil Embargo ──
  {
    year: 1973, period: "H2_JUL",
    generalCPI: 1.180, automotivePPI: 1.160, metalsIndex: 1.250, energyIndex: 1.550, laborIndex: 1.190,
    electronicsIndex: 0.960, compositesIndex: 1.020, batteryIndex: 1.000,
    oilUSD: 4.30, steelUSD: 230, alUSD: 720, rubberUSD: 0.62, assemblerWageUSD: 4.90, engineerSalaryUSD: 1450, carMSRPUSD: 4100,
    headline: "OPEC Oil Embargo Threatens Global Petrochemical & Fuel Supplies",
    guidance: "CRITICAL: Crude oil supply contracts are being restricted. Stockpile synthetic rubber, plastics, and fuel immediately.",
    risk: "HIGH",
  },
  {
    year: 1974, period: "H1_JAN",
    generalCPI: 1.320, automotivePPI: 1.340, metalsIndex: 1.520, energyIndex: 2.650, laborIndex: 1.300,
    electronicsIndex: 0.950, compositesIndex: 1.050, batteryIndex: 1.000,
    oilUSD: 11.20, steelUSD: 285, alUSD: 850, rubberUSD: 0.95, assemblerWageUSD: 5.40, engineerSalaryUSD: 1580, carMSRPUSD: 4600,
    headline: "First Global Energy Crisis: Crude Quadruples to $11.20/bbl",
    guidance: "Energy-intensive metal smelting and tire vulcanization costs spike +65%. Downsize vehicle engine displacement and lighten bodywork.",
    risk: "SEVERE",
  },
  {
    year: 1975, period: "H1_JAN",
    generalCPI: 1.440, automotivePPI: 1.420, metalsIndex: 1.580, energyIndex: 2.800, laborIndex: 1.450,
    electronicsIndex: 0.930, compositesIndex: 1.080, batteryIndex: 1.000,
    oilUSD: 12.20, steelUSD: 305, alUSD: 910, rubberUSD: 1.05, assemblerWageUSD: 6.30, engineerSalaryUSD: 1720, carMSRPUSD: 4950,
    headline: "Stagflation Takes Hold: Automotive Downsizing & Engineering Plastics",
    guidance: "Polymers and engineering plastics become cost-competitive vs heavy cast iron. High union wage inflation.",
    risk: "HIGH",
  },
  // ── 1979-1980: Iranian Revolution & Peak Inflation Shock ──
  {
    year: 1979, period: "H2_JUL",
    generalCPI: 1.880, automotivePPI: 1.840, metalsIndex: 1.950, energyIndex: 4.100, laborIndex: 1.920,
    electronicsIndex: 0.910, compositesIndex: 1.150, batteryIndex: 1.000,
    oilUSD: 28.50, steelUSD: 410, alUSD: 1350, rubberUSD: 1.45, assemblerWageUSD: 9.80, engineerSalaryUSD: 2250, carMSRPUSD: 6800,
    headline: "Iranian Revolution Triggers Second Oil Crisis ($28.50/bbl)",
    guidance: "Massive inflation shock. Gas shortages worldwide. Compact fuel-efficient hatchbacks see explosive consumer demand.",
    risk: "SEVERE",
  },
  {
    year: 1980, period: "H1_JAN",
    generalCPI: 2.120, automotivePPI: 2.080, metalsIndex: 2.180, energyIndex: 4.950, laborIndex: 2.180,
    electronicsIndex: 0.900, compositesIndex: 1.180, batteryIndex: 1.000,
    oilUSD: 37.40, steelUSD: 460, alUSD: 1580, rubberUSD: 1.75, assemblerWageUSD: 11.50, engineerSalaryUSD: 2600, carMSRPUSD: 7600,
    headline: "Peak US Stagflation: CPI Hits 13.5%, Fed Hikes Rates to 20%",
    guidance: "Severe borrowing costs. Avoid taking high-interest factory expansion loans. Rely on internal cash reserves and warehouse buffers.",
    risk: "SEVERE",
  },
  // ── 1985: Industrial Manufacturer Era & Disinflation ──
  {
    year: 1985, period: "H1_JAN",
    generalCPI: 2.820, automotivePPI: 2.650, metalsIndex: 2.450, energyIndex: 3.600, laborIndex: 2.850,
    electronicsIndex: 0.850, compositesIndex: 1.100, batteryIndex: 1.000,
    oilUSD: 27.00, steelUSD: 520, alUSD: 1420, rubberUSD: 1.60, assemblerWageUSD: 14.80, engineerSalaryUSD: 3450, carMSRPUSD: 10200,
    headline: "Volcker Tightening Tames Inflation: High-Strength Steel & Turbochargers",
    guidance: "Metals prices normalize. High-Strength Low-Alloy (HSLA) steel unlocked. Electronic Fuel Injection ECUs drop in price.",
    risk: "MODERATE",
  },
  {
    year: 1986, period: "H2_JUL",
    generalCPI: 2.920, automotivePPI: 2.700, metalsIndex: 2.380, energyIndex: 1.850, laborIndex: 2.950,
    electronicsIndex: 0.820, compositesIndex: 1.050, batteryIndex: 1.000,
    oilUSD: 14.40, steelUSD: 490, alUSD: 1280, rubberUSD: 1.30, assemblerWageUSD: 15.40, engineerSalaryUSD: 3600, carMSRPUSD: 10800,
    headline: "1986 Oil Glut: Crude Collapses 50% ($14.40/bbl)",
    guidance: "Freight logistics and synthetic materials drop sharply. Logistics overhead drops; favorable conditions for sports cars and grand tourers.",
    risk: "DEFLATIONARY",
  },
  // ── 1990: Clean Air Act & Early Composites ──
  {
    year: 1990, period: "H1_JAN",
    generalCPI: 3.420, automotivePPI: 3.200, metalsIndex: 2.850, energyIndex: 2.750, laborIndex: 3.450,
    electronicsIndex: 0.780, compositesIndex: 0.950, batteryIndex: 1.000,
    oilUSD: 23.50, steelUSD: 590, alUSD: 1650, rubberUSD: 1.65, assemblerWageUSD: 17.10, engineerSalaryUSD: 4200, carMSRPUSD: 13400,
    headline: "Global Trade Liberalization & Motorsport Carbon Fiber Diffusion",
    guidance: "Autoclave pre-preg carbon fiber enters boutique supercar manufacturing. Microcontrollers scale up; EFI becomes mainstream.",
    risk: "MODERATE",
  },
  // ── 1995: OBD-II Electronics & Ultra-High-Strength Steel ──
  {
    year: 1995, period: "H1_JAN",
    generalCPI: 3.980, automotivePPI: 3.750, metalsIndex: 3.100, energyIndex: 2.450, laborIndex: 4.050,
    electronicsIndex: 0.650, compositesIndex: 0.850, batteryIndex: 0.950,
    oilUSD: 18.40, steelUSD: 640, alUSD: 1800, rubberUSD: 1.70, assemblerWageUSD: 18.20, engineerSalaryUSD: 5200, carMSRPUSD: 17200,
    headline: "OBD-II Mandate & Boron Steel Stamping Revolution",
    guidance: "CAN-bus multiplex wiring slashes harness weight and copper demand. Hot-stamped boron steel improves crash safety ratings.",
    risk: "STABLE",
  },
  // ── 2000: Multinational Conglomerate Era ──
  {
    year: 2000, period: "H1_JAN",
    generalCPI: 4.450, automotivePPI: 4.150, metalsIndex: 3.350, energyIndex: 3.850, laborIndex: 4.650,
    electronicsIndex: 0.520, compositesIndex: 0.720, batteryIndex: 0.850,
    oilUSD: 28.50, steelUSD: 680, alUSD: 1750, rubberUSD: 1.85, assemblerWageUSD: 21.00, engineerSalaryUSD: 6400, carMSRPUSD: 20500,
    headline: "Turn of the Millennium: Platform Sharing & Global Mega-Suppliers",
    guidance: "Multinational platform sharing drives modular component purchasing scale. Aerospace titanium alloys unlocked for exhaust and valvetrain.",
    risk: "MODERATE",
  },
  // ── 2005: Emerging Market Commodity Supercycle ──
  {
    year: 2005, period: "H1_JAN",
    generalCPI: 5.080, automotivePPI: 4.750, metalsIndex: 4.850, energyIndex: 6.800, laborIndex: 5.300,
    electronicsIndex: 0.440, compositesIndex: 0.600, batteryIndex: 0.750,
    oilUSD: 54.00, steelUSD: 920, alUSD: 2150, rubberUSD: 2.40, assemblerWageUSD: 23.50, engineerSalaryUSD: 7500, carMSRPUSD: 23400,
    headline: "China Industrial Boom Ignites Global Commodity Supercycle",
    guidance: "Raw steel and aluminum surge worldwide. Supplier lead times lengthen; Safety Stock inventory policy highly recommended.",
    risk: "HIGH",
  },
  // ── 2008: Peak Commodity Bubble & Great Financial Crisis ──
  {
    year: 2008, period: "H2_JUL",
    generalCPI: 5.680, automotivePPI: 5.350, metalsIndex: 6.100, energyIndex: 13.500, laborIndex: 5.750,
    electronicsIndex: 0.380, compositesIndex: 0.520, batteryIndex: 0.680,
    oilUSD: 138.00, steelUSD: 1250, alUSD: 3100, rubberUSD: 3.80, assemblerWageUSD: 24.80, engineerSalaryUSD: 8200, carMSRPUSD: 25800,
    headline: "Historical Peak Crude Oil ($138/bbl) & Industrial Metal Records",
    guidance: "CRITICAL: Raw material spot prices at all-time highs. Freight tariffs extreme. Cash conservation and warehouse discipline mandatory.",
    risk: "SEVERE",
  },
  {
    year: 2009, period: "H1_JAN",
    generalCPI: 5.480, automotivePPI: 5.050, metalsIndex: 4.200, energyIndex: 5.200, laborIndex: 5.800,
    electronicsIndex: 0.360, compositesIndex: 0.500, batteryIndex: 0.650,
    oilUSD: 41.00, steelUSD: 740, alUSD: 1550, rubberUSD: 2.10, assemblerWageUSD: 24.20, engineerSalaryUSD: 8100, carMSRPUSD: 25200,
    headline: "Great Financial Crisis Deflation: Automakers Restructure",
    guidance: "Global automotive demand plunges -25%. Raw material prices drop sharply. Excellent window to negotiate favorable multi-year contracts.",
    risk: "DEFLATIONARY",
  },
  // ── 2015: Electrified & Connected Era ──
  {
    year: 2015, period: "H1_JAN",
    generalCPI: 6.150, automotivePPI: 5.800, metalsIndex: 4.800, energyIndex: 6.100, laborIndex: 6.450,
    electronicsIndex: 0.280, compositesIndex: 0.380, batteryIndex: 0.450,
    oilUSD: 48.00, steelUSD: 780, alUSD: 1850, rubberUSD: 2.30, assemblerWageUSD: 26.50, engineerSalaryUSD: 9400, carMSRPUSD: 30500,
    headline: "Automotive Electrification & Active Aerodynamics Expansion",
    guidance: "Lithium battery pack costs drop below $350/kWh. Carbon fiber tub production scales to high-end road sports cars.",
    risk: "STABLE",
  },
  // ── 2020: Pandemic Shock & Sudden Digital Transition ──
  {
    year: 2020, period: "H1_JAN",
    generalCPI: 6.750, automotivePPI: 6.400, metalsIndex: 5.100, energyIndex: 5.600, laborIndex: 7.200,
    electronicsIndex: 0.240, compositesIndex: 0.300, batteryIndex: 0.280,
    oilUSD: 42.00, steelUSD: 810, alUSD: 1750, rubberUSD: 2.20, assemblerWageUSD: 28.50, engineerSalaryUSD: 10500, carMSRPUSD: 34800,
    headline: "COVID-19 Pandemic Disrupts Global Automotive Supply Chains",
    guidance: "Maritime shipping container shortages. Port congestion adds 20-35 days to international parts lead times.",
    risk: "HIGH",
  },
  // ── 2021-2022: Semiconductor Crisis & Raw Material Squeeze ──
  {
    year: 2021, period: "H2_JUL",
    generalCPI: 7.250, automotivePPI: 7.150, metalsIndex: 7.400, energyIndex: 8.900, laborIndex: 7.600,
    electronicsIndex: 0.420, compositesIndex: 0.320, batteryIndex: 0.350,
    oilUSD: 72.00, steelUSD: 1480, alUSD: 2650, rubberUSD: 3.10, assemblerWageUSD: 30.00, engineerSalaryUSD: 11200, carMSRPUSD: 38200,
    headline: "Global Semiconductor 'Chip Crunch' Halts Vehicle Assembly Lines",
    guidance: "Microchip shortages create automotive production bottlenecks. Used and new car transaction prices surge to historic dealer markups.",
    risk: "SEVERE",
  },
  {
    year: 2022, period: "H2_JUL",
    generalCPI: 7.850, automotivePPI: 7.900, metalsIndex: 7.950, energyIndex: 12.200, laborIndex: 8.100,
    electronicsIndex: 0.380, compositesIndex: 0.340, batteryIndex: 0.480,
    oilUSD: 98.00, steelUSD: 1350, alUSD: 2850, rubberUSD: 3.40, assemblerWageUSD: 31.50, engineerSalaryUSD: 11800, carMSRPUSD: 42500,
    headline: "Post-Pandemic Inflation Wave: 40-Year Consumer Price Records",
    guidance: "Energy and raw material inflation across all vehicle tiers. Aggressively revise vehicle MSRP to protect gross contribution margins.",
    risk: "SEVERE",
  },
  // ── 2024-2025: Current Frontier & EV Price Wars ──
  {
    year: 2024, period: "H1_JAN",
    generalCPI: 8.180, automotivePPI: 8.100, metalsIndex: 6.850, energyIndex: 9.800, laborIndex: 8.650,
    electronicsIndex: 0.310, compositesIndex: 0.280, batteryIndex: 0.320,
    oilUSD: 78.00, steelUSD: 1120, alUSD: 2450, rubberUSD: 2.85, assemblerWageUSD: 33.50, engineerSalaryUSD: 12400, carMSRPUSD: 39200,
    headline: "Historic UAW Master Contract Gains & Global EV Price Competition",
    guidance: "Manufacturing wages rise +25% post-strike. Raw metal prices soften. Intense OEM discounting in volume compact segments.",
    risk: "MODERATE",
  },
  {
    year: 2025, period: "H1_JAN",
    generalCPI: 8.420, automotivePPI: 8.350, metalsIndex: 7.050, energyIndex: 9.600, laborIndex: 8.950,
    electronicsIndex: 0.290, compositesIndex: 0.260, batteryIndex: 0.280,
    oilUSD: 76.00, steelUSD: 1150, alUSD: 2500, rubberUSD: 2.90, assemblerWageUSD: 35.00, engineerSalaryUSD: 12800, carMSRPUSD: 40500,
    headline: "Next-Gen 800V SiC Power Electronics & Gigacasting Adoption",
    guidance: "Megacasting reduces body-in-white part counts by 70%. High-efficiency inverters lower battery pack kWh requirements.",
    risk: "STABLE",
  },
  // ── 2030: Future Horizon ──
  {
    year: 2030, period: "H1_JAN",
    generalCPI: 9.550, automotivePPI: 9.400, metalsIndex: 7.800, energyIndex: 10.500, laborIndex: 10.200,
    electronicsIndex: 0.240, compositesIndex: 0.220, batteryIndex: 0.210,
    oilUSD: 85.00, steelUSD: 1280, alUSD: 2750, rubberUSD: 3.20, assemblerWageUSD: 41.00, engineerSalaryUSD: 14500, carMSRPUSD: 46000,
    headline: "Autonomous Software Telemetry & Solid-State Battery Commercialization",
    guidance: "Battery cell costs break below $90/kWh. Software recurring subscriptions become a primary corporate revenue stream.",
    risk: "STABLE",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEMI-ANNUAL INTERPOLATION ENGINE
// Synthesizes the full 122-cycle timeline from 1970 H1_JAN to 2030 H2_JUL
// ─────────────────────────────────────────────────────────────────────────────

function getMilestoneIndex(year: number, period: SemiAnnualPeriod): number {
  return (year - 1970) * 2 + (period === "H2_JUL" ? 1 : 0);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Builds the complete semi-annual record dictionary covering every year and period
 */
function buildCompleteHistoricalRecords(): Record<string, HistoricalInflationRecord> {
  const records: Record<string, HistoricalInflationRecord> = {};

  // Sort anchors chronologically
  const sortedAnchors = [...HISTORICAL_MILESTONES].sort((a, b) => {
    return getMilestoneIndex(a.year, a.period) - getMilestoneIndex(b.year, b.period);
  });

  for (let yr = 1970; yr <= 2030; yr++) {
    const periods: SemiAnnualPeriod[] = ["H1_JAN", "H2_JUL"];

    for (const p of periods) {
      const targetIndex = getMilestoneIndex(yr, p);
      const key = `${yr}_${p}`;
      const displayDate = p === "H1_JAN" ? `1 Jan ${yr}` : `1 Jul ${yr}`;

      // Check if exact anchor exists
      const exactMatch = sortedAnchors.find((a) => a.year === yr && a.period === p);
      if (exactMatch) {
        records[key] = {
          year: yr,
          period: p,
          displayDate,
          cycleIndex: targetIndex,
          generalCPI: exactMatch.generalCPI,
          automotivePPI: exactMatch.automotivePPI,
          metalsIndex: exactMatch.metalsIndex,
          energyPetrochemIndex: exactMatch.energyIndex,
          laborWageIndex: exactMatch.laborIndex,
          electronicsIndex: exactMatch.electronicsIndex,
          compositesIndex: exactMatch.compositesIndex,
          batteryMaterialsIndex: exactMatch.batteryIndex,
          crudeOilPerBarrelUSD: exactMatch.oilUSD,
          hotRolledSteelPerTonneUSD: exactMatch.steelUSD,
          primaryAluminumPerTonneUSD: exactMatch.alUSD,
          vulcanizedRubberPerKgUSD: exactMatch.rubberUSD,
          autoAssemblerHourlyWageUSD: exactMatch.assemblerWageUSD,
          seniorEngineerMonthlySalaryUSD: exactMatch.engineerSalaryUSD,
          averageNewCarMSRPUSD: exactMatch.carMSRPUSD,
          headlineEvent: exactMatch.headline,
          economicGuidance: exactMatch.guidance,
          inflationRiskLevel: exactMatch.risk,
        };
        continue;
      }

      // Find surrounding anchors to interpolate
      let prevAnchor = sortedAnchors[0];
      let nextAnchor = sortedAnchors[sortedAnchors.length - 1];

      for (let i = 0; i < sortedAnchors.length - 1; i++) {
        const currIdx = getMilestoneIndex(sortedAnchors[i].year, sortedAnchors[i].period);
        const nextIdx = getMilestoneIndex(sortedAnchors[i + 1].year, sortedAnchors[i + 1].period);

        if (targetIndex >= currIdx && targetIndex <= nextIdx) {
          prevAnchor = sortedAnchors[i];
          nextAnchor = sortedAnchors[i + 1];
          break;
        }
      }

      const prevIdx = getMilestoneIndex(prevAnchor.year, prevAnchor.period);
      const nextIdx = getMilestoneIndex(nextAnchor.year, nextAnchor.period);
      const span = Math.max(1, nextIdx - prevIdx);
      const t = (targetIndex - prevIdx) / span;

      // Deterministic slight seasonal perturbation: H2_JUL often has slightly higher summer energy demand
      const seasonalOilBump = p === "H2_JUL" ? 1.025 : 1.0;

      const generalCPI = Number(lerp(prevAnchor.generalCPI, nextAnchor.generalCPI, t).toFixed(3));
      const automotivePPI = Number(lerp(prevAnchor.automotivePPI, nextAnchor.automotivePPI, t).toFixed(3));
      const metalsIndex = Number(lerp(prevAnchor.metalsIndex, nextAnchor.metalsIndex, t).toFixed(3));
      const energyPetrochemIndex = Number((lerp(prevAnchor.energyIndex, nextAnchor.energyIndex, t) * seasonalOilBump).toFixed(3));
      const laborWageIndex = Number(lerp(prevAnchor.laborIndex, nextAnchor.laborIndex, t).toFixed(3));
      const electronicsIndex = Number(lerp(prevAnchor.electronicsIndex, nextAnchor.electronicsIndex, t).toFixed(3));
      const compositesIndex = Number(lerp(prevAnchor.compositesIndex, nextAnchor.compositesIndex, t).toFixed(3));
      const batteryMaterialsIndex = Number(lerp(prevAnchor.batteryIndex, nextAnchor.batteryIndex, t).toFixed(3));

      const crudeOilPerBarrelUSD = Number((lerp(prevAnchor.oilUSD, nextAnchor.oilUSD, t) * seasonalOilBump).toFixed(2));
      const hotRolledSteelPerTonneUSD = Math.round(lerp(prevAnchor.steelUSD, nextAnchor.steelUSD, t));
      const primaryAluminumPerTonneUSD = Math.round(lerp(prevAnchor.alUSD, nextAnchor.alUSD, t));
      const vulcanizedRubberPerKgUSD = Number(lerp(prevAnchor.rubberUSD, nextAnchor.rubberUSD, t).toFixed(2));
      const autoAssemblerHourlyWageUSD = Number(lerp(prevAnchor.assemblerWageUSD, nextAnchor.assemblerWageUSD, t).toFixed(2));
      const seniorEngineerMonthlySalaryUSD = Math.round(lerp(prevAnchor.engineerSalaryUSD, nextAnchor.engineerSalaryUSD, t));
      const averageNewCarMSRPUSD = Math.round(lerp(prevAnchor.carMSRPUSD, nextAnchor.carMSRPUSD, t));

      records[key] = {
        year: yr,
        period: p,
        displayDate,
        cycleIndex: targetIndex,
        generalCPI,
        automotivePPI,
        metalsIndex,
        energyPetrochemIndex,
        laborWageIndex,
        electronicsIndex,
        compositesIndex,
        batteryMaterialsIndex,
        crudeOilPerBarrelUSD,
        hotRolledSteelPerTonneUSD,
        primaryAluminumPerTonneUSD,
        vulcanizedRubberPerKgUSD,
        autoAssemblerHourlyWageUSD,
        seniorEngineerMonthlySalaryUSD,
        averageNewCarMSRPUSD,
        headlineEvent: prevAnchor.headline,
        economicGuidance: prevAnchor.guidance,
        inflationRiskLevel: prevAnchor.risk,
      };
    }
  }

  return records;
}

export const HISTORICAL_SEMI_ANNUAL_RECORDS: Record<string, HistoricalInflationRecord> =
  buildCompleteHistoricalRecords();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC QUERY & COMPUTATION API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the exact semi-annual inflation record for a given year and period
 */
export function getSemiAnnualRecord(
  year: number,
  period: SemiAnnualPeriod
): HistoricalInflationRecord {
  const clampedYear = Math.max(1970, Math.min(2030, year));
  const key = `${clampedYear}_${period}`;
  const record = HISTORICAL_SEMI_ANNUAL_RECORDS[key];

  if (!record) {
    return HISTORICAL_SEMI_ANNUAL_RECORDS["1970_H1_JAN"];
  }

  return record;
}

/**
 * Returns the active semi-annual record for any calendar date
 * - Months 1-6 (Jan 1 - Jun 30): H1_JAN
 * - Months 7-12 (Jul 1 - Dec 31): H2_JUL
 */
export function getInflationRecordForDate(
  year: number,
  month: number,
  _day: number = 1
): HistoricalInflationRecord {
  const period: SemiAnnualPeriod = month < 7 ? "H1_JAN" : "H2_JUL";
  return getSemiAnnualRecord(year, period);
}

/**
 * Returns the upcoming semi-annual period following the current date
 */
export function getNextSemiAnnualPeriod(
  year: number,
  period: SemiAnnualPeriod
): { nextYear: number; nextPeriod: SemiAnnualPeriod; nextDisplayDate: string } {
  if (period === "H1_JAN") {
    return {
      nextYear: year,
      nextPeriod: "H2_JUL",
      nextDisplayDate: `1 Jul ${year}`,
    };
  }
  return {
    nextYear: year + 1,
    nextPeriod: "H1_JAN",
    nextDisplayDate: `1 Jan ${year + 1}`,
  };
}

/**
 * Returns the upcoming semi-annual record
 */
export function getNextSemiAnnualRecord(
  year: number,
  period: SemiAnnualPeriod
): HistoricalInflationRecord {
  const next = getNextSemiAnnualPeriod(year, period);
  return getSemiAnnualRecord(next.nextYear, next.nextPeriod);
}

/**
 * Returns days remaining until the next semi-annual price revision
 */
export function getDaysUntilNextRevision(
  year: number,
  month: number,
  day: number
): {
  daysRemaining: number;
  targetDateStr: string;
  nextPeriod: SemiAnnualPeriod;
  nextYear: number;
} {
  const currentJsDate = new Date(Date.UTC(year, month - 1, day));
  let targetJsDate: Date;
  let nextPeriod: SemiAnnualPeriod;
  let nextYear: number;

  if (month < 7) {
    targetJsDate = new Date(Date.UTC(year, 6, 1)); // 1 July
    nextPeriod = "H2_JUL";
    nextYear = year;
  } else {
    targetJsDate = new Date(Date.UTC(year + 1, 0, 1)); // 1 January next year
    nextPeriod = "H1_JAN";
    nextYear = year + 1;
  }

  const diffMs = targetJsDate.getTime() - currentJsDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const targetDateStr = nextPeriod === "H2_JUL" ? `1 Jul ${year}` : `1 Jan ${year + 1}`;

  return {
    daysRemaining,
    targetDateStr,
    nextPeriod,
    nextYear,
  };
}

/**
 * Calculates projected price movement between the active period and the next period
 * Used to advise the player on warehouse stockpiling
 */
export function calculateProjectedRevisionDelta(
  currentYear: number,
  currentPeriod: SemiAnnualPeriod,
  indexType: InflationIndexType
): {
  currentMultiplier: number;
  nextMultiplier: number;
  deltaPct: number;
  direction: "INCREASE" | "DECREASE" | "FLAT";
  isSpikeWarning: boolean;
} {
  const currentRecord = getSemiAnnualRecord(currentYear, currentPeriod);
  const nextRecord = getNextSemiAnnualRecord(currentYear, currentPeriod);

  let currentVal = 1.0;
  let nextVal = 1.0;

  switch (indexType) {
    case "METALS_INDEX":
      currentVal = currentRecord.metalsIndex;
      nextVal = nextRecord.metalsIndex;
      break;
    case "ENERGY_PETROCHEM_INDEX":
      currentVal = currentRecord.energyPetrochemIndex;
      nextVal = nextRecord.energyPetrochemIndex;
      break;
    case "LABOR_WAGE_INDEX":
      currentVal = currentRecord.laborWageIndex;
      nextVal = nextRecord.laborWageIndex;
      break;
    case "ELECTRONICS_INDEX":
      currentVal = currentRecord.electronicsIndex;
      nextVal = nextRecord.electronicsIndex;
      break;
    case "COMPOSITES_INDEX":
      currentVal = currentRecord.compositesIndex;
      nextVal = nextRecord.compositesIndex;
      break;
    case "BATTERY_MATERIALS_INDEX":
      currentVal = currentRecord.batteryMaterialsIndex;
      nextVal = nextRecord.batteryMaterialsIndex;
      break;
    case "AUTOMOTIVE_PPI":
      currentVal = currentRecord.automotivePPI;
      nextVal = nextRecord.automotivePPI;
      break;
    case "GENERAL_CPI":
    default:
      currentVal = currentRecord.generalCPI;
      nextVal = nextRecord.generalCPI;
      break;
  }

  const deltaPct = Number((((nextVal - currentVal) / currentVal) * 100).toFixed(1));
  let direction: "INCREASE" | "DECREASE" | "FLAT" = "FLAT";
  if (deltaPct > 0.3) direction = "INCREASE";
  else if (deltaPct < -0.3) direction = "DECREASE";

  // A spike warning is flagged if next revision is >= 8.0% price increase
  const isSpikeWarning = deltaPct >= 8.0;

  return {
    currentMultiplier: currentVal,
    nextMultiplier: nextVal,
    deltaPct,
    direction,
    isSpikeWarning,
  };
}

/**
 * Get full chronological list of all records for historical trend charting
 */
export function getAllHistoricalRecords(): HistoricalInflationRecord[] {
  return Object.values(HISTORICAL_SEMI_ANNUAL_RECORDS).sort(
    (a, b) => a.cycleIndex - b.cycleIndex
  );
}

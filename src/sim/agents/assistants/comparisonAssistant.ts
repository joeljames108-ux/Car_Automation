// ===================================================================
// COMPARISON ASSISTANT — Vehicle Benchmarking & Delta Comparison
// ===================================================================

export interface ComparisonMetric {
  category: string;
  label: string;
  currentValue: string | number;
  benchmarkValue: string | number;
  delta: string;
  isBetter: boolean;
}

export interface VehicleComparisonReport {
  benchmarkName: string;
  summary: string;
  metrics: ComparisonMetric[];
  keyAdvantages: string[];
  keyDisadvantages: string[];
}

export class ComparisonAssistant {
  public static compareAgainstRival(rivalName: string, simState: any): VehicleComparisonReport {
    const power = simState?.power || 400;
    const weight = simState?.weight || 1500;
    const topSpeed = simState?.topSpeed || 280;

    return {
      benchmarkName: rivalName || "Apex Motors Raptor GT-R",
      summary: `Comparing your custom build against ${rivalName || "Apex Motors Raptor GT-R"}. Your vehicle has a lighter chassis but lower peak power.`,
      metrics: [
        { category: "Performance", label: "Horsepower (HP)", currentValue: `${power} HP`, benchmarkValue: "520 HP", delta: `${power - 520} HP`, isBetter: power >= 520 },
        { category: "Performance", label: "Curb Weight (kg)", currentValue: `${weight} kg`, benchmarkValue: "1,550 kg", delta: `${weight - 1550} kg`, isBetter: weight <= 1550 },
        { category: "Speed", label: "Top Speed (km/h)", currentValue: `${topSpeed} km/h`, benchmarkValue: "315 km/h", delta: `${topSpeed - 315} km/h`, isBetter: topSpeed >= 315 },
        { category: "Handling", label: "Lateral Grip (g)", currentValue: `${(simState?.corneringG || 1.15).toFixed(2)} g`, benchmarkValue: "1.25 g", delta: "-0.10 g", isBetter: false },
      ],
      keyAdvantages: ["Lower curb mass improves turn-in responsiveness", "Lower production bill-of-materials cost"],
      keyDisadvantages: ["-120 HP power deficit on long straights", "Lower high-speed downforce"],
    };
  }
}

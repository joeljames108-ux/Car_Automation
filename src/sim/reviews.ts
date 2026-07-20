import {
  SEAT_TYPES, SEAT_MATERIALS, DASHBOARD_MATERIALS, STEERING_WHEEL_TYPES,
  TRANSMISSION_TYPES, SUSPENSION_TYPES,
} from "./constants";
import type { VehicleDesign, SimResult } from "./types";

export interface CategoryScore {
  key: string;
  label: string;
  score: number; // 0-10
}

export interface ReviewScores {
  performance: CategoryScore[];
  comfort: CategoryScore[];
  interior: CategoryScore[];
  technology: CategoryScore[];
  safety: CategoryScore[];
  ownership: CategoryScore[];
  value: CategoryScore[];
}

export interface ReviewSummary {
  overall: number;
  performance: number;
  comfort: number;
  interior: number;
  technology: number;
  safety: number;
  ownership: number;
  value: number;
  editorsChoice: boolean;
}

export interface MagazineReview {
  magId: string;
  magName: string;
  category: "performance" | "luxury" | "economy" | "technology";
  score: number;
  verdict: string;
  pros: string[];
  cons: string[];
  article: string;
  award?: string;
}

export interface CustomerReview {
  author: string;
  stars: number;
  title: string;
  body: string;
  categories: { reliability: number; fuel: number; comfort: number; performance: number; technology: number; value: number };
}

export interface LongTermReview {
  years: number;
  reliabilityGrade: string;
  engineReliability: number;
  rustResistance: number;
  suspensionDurability: number;
  batteryHealth: number;
  interiorWear: number;
  electronicsFailures: number;
  resaleRetention: number;
  notes: string[];
}

export interface InfluencerReview {
  name: string;
  channel: string;
  niche: string;
  subscribers: string;
  verdict: string;
  viral: boolean;
  demandImpact: number;
}

export interface ComparisonRow {
  category: string;
  yours: number;
  competitors: number[];
}

export interface IndustryAward {
  name: string;
  won: boolean;
  description: string;
}

export interface ReliabilityRanking {
  grade: string;
  engineFailures: number;
  transmissionIssues: number;
  electronicsProblems: number;
  warrantyClaims: number;
  recallFrequency: number;
}

export interface FullReview {
  scores: ReviewScores;
  summary: ReviewSummary;
  magazines: MagazineReview[];
  customerReviews: CustomerReview[];
  longTerm: LongTermReview;
  influencers: InfluencerReview[];
  comparison: { rows: ComparisonRow[]; competitors: string[]; winnerIndex: number };
  awards: IndustryAward[];
  reliability: ReliabilityRanking;
  marketDemand: "Very Low" | "Low" | "Moderate" | "High" | "Very High";
}

const clamp = (v: number, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, v));

function gradeFor(score: number): string {
  if (score >= 9.5) return "A+";
  if (score >= 8.5) return "A";
  if (score >= 7.5) return "B";
  if (score >= 6.5) return "C";
  if (score >= 5.5) return "D";
  return "F";
}

export function computeScores(design: VehicleDesign, sim: SimResult): ReviewScores {
  const v = design.vehicle;
  const int = v.interior;
  const seat = SEAT_TYPES[int.seatType] ?? SEAT_TYPES.standard;
  const seatMat = SEAT_MATERIALS[int.seatMaterial] ?? SEAT_MATERIALS.cloth;
  const dash = DASHBOARD_MATERIALS[int.dashboardMaterial] ?? DASHBOARD_MATERIALS.plastic;
  const wheel = STEERING_WHEEL_TYPES[int.steeringWheel] ?? STEERING_WHEEL_TYPES.standard;
  const trans = TRANSMISSION_TYPES[v.transmission] ?? Object.values(TRANSMISSION_TYPES)[0];
  const susp = SUSPENSION_TYPES[v.suspensionFront] ?? Object.values(SUSPENSION_TYPES)[0];
  // PERFORMANCE
  const accelScore = clamp(10 - sim.accel0_100 / 1.0);
  const topSpeedScore = clamp(sim.topSpeed / 35);
  const handlingScore = clamp(4 + sim.lateralG * 1.5);
  const brakingScore = clamp(10 - sim.brakingDist / 4.5);
  const transmissionScore = clamp(8 - trans.shiftTime * 6 + trans.efficiency * 3);
  const steeringScore = clamp(5 + (wheel.gripFactor - 0.6) * 6 + sim.lateralG * 0.5);
  const suspensionScore = clamp(5 + susp.gripFactor * 4 + sim.lateralG * 0.6);
  const engineScore = clamp(sim.peakPower / 80 + sim.thermalEfficiency * 4);

  // COMFORT
  const seatComfort = clamp(seat.comfort * 6 + seatMat.comfortFactor * 4);
  const rideQuality = clamp(8 - (v.springRateF / 300) * 3 - (1 - susp.gripFactor) * 2);
  const cabinNoise = clamp(8 - sim.nvh * 4 + int.soundDeadening * 4);
  const climate = clamp(6 + (int.climateControl ? 2 : 0) + int.ambientLighting * 1.5);
  const rearSeat = clamp(6 - (int.seatCount <= 2 ? 3 : 0) + (v.exterior.bodyType.includes("sedan") || v.exterior.bodyType.includes("suv") ? 2 : 0));

  // INTERIOR
  const materialQuality = clamp(dash.luxuryFactor * 6 + seatMat.comfortFactor * 4);
  const buildQuality = clamp(sim.manufacturing.qualityScore / 10);
  const designScore = clamp(6 + dash.luxuryFactor * 3 + int.ambientLighting * 1.5);
  const storage = clamp(5 + (v.exterior.bodyType.includes("wagon") || v.exterior.bodyType.includes("suv") ? 3 : 0));
  const visibility = clamp(7 - (v.aero.wingHeight > 250 ? 1.5 : 0) - (int.rollCage !== "none" ? 1 : 0));

  // TECHNOLOGY
  const infotainment = clamp(4 + int.infotainmentSize * 0.35);
  const screenQuality = clamp(4 + int.infotainmentSize * 0.4 + (v.exterior.headlightType.includes("led") || v.exterior.headlightType.includes("laser") ? 2 : 0));
  const aiAssistant = clamp(5 + v.electronics.telemetryLevel * 3 + (v.electronics.dataLogging ? 1.5 : 0));
  const connectivity = clamp(5 + v.electronics.telemetryLevel * 3 + (int.hasNav ? 2 : 0));
  const voiceControl = clamp(4 + int.infotainmentSize * 0.3 + (int.hasNav ? 2 : 0));

  // SAFETY
  const crashProtection = clamp(sim.testing.crashTest.overall / 10);
  const adas = clamp(3 + (v.electronics.abs ? 2 : 0) + v.electronics.stabilityControl * 3 + v.electronics.tractionControl * 2);
  const driverAssist = clamp(3 + v.electronics.stabilityControl * 3 + (v.electronics.launchControl ? 1 : 0) + v.electronics.tractionControl * 2);
  const childSafety = clamp(4 + (v.exterior.bodyType.includes("sedan") || v.exterior.bodyType.includes("suv") || v.exterior.bodyType.includes("wagon") ? 3 : 0) + sim.testing.crashTest.sideScore / 15);

  // OWNERSHIP
  const reliabilityScore = clamp(sim.reliability * 10);
  const fuelEconomyScore = clamp(10 - sim.fuelEconomy * 0.9);
  const serviceCost = clamp(10 - (sim.engineCost + sim.manufacturing.warrantyCost) / 12000);
  const warranty = clamp(5 + sim.reliability * 4 - (sim.manufacturing.defectRate / 4));
  const resale = clamp(4 + sim.reliability * 4 + (v.chassis === "carbon_tub" ? 1 : 0) - (sim.totalCost > 80000 ? 2 : 0));

  // VALUE
  const priceScore = clamp(10 - sim.totalCost / 12000);
  const equipment = clamp(4 + int.infotainmentSize / 3 + (int.hasPremiumAudio ? 1.5 : 0) + (v.electronics.abs ? 0.5 : 0) + int.ambientLighting * 1.5);
  const runningCosts = clamp(8 - sim.fuelEconomy * 0.6 - sim.emissions / 200);
  const competitiveness = clamp(sim.marketRating / 10);

  return {
    performance: [
      { key: "engine", label: "Engine", score: engineScore },
      { key: "transmission", label: "Transmission", score: transmissionScore },
      { key: "steering", label: "Steering", score: steeringScore },
      { key: "handling", label: "Handling", score: handlingScore },
      { key: "braking", label: "Braking", score: brakingScore },
      { key: "suspension", label: "Suspension", score: suspensionScore },
      { key: "topspeed", label: "Top Speed", score: topSpeedScore },
      { key: "acceleration", label: "Acceleration", score: accelScore },
    ],
    comfort: [
      { key: "seat", label: "Seat Comfort", score: seatComfort },
      { key: "ride", label: "Ride Quality", score: rideQuality },
      { key: "noise", label: "Cabin Insulation", score: cabinNoise },
      { key: "climate", label: "Climate Control", score: climate },
      { key: "rearseat", label: "Rear-Seat Space", score: rearSeat },
    ],
    interior: [
      { key: "material", label: "Material Quality", score: materialQuality },
      { key: "build", label: "Build Quality", score: buildQuality },
      { key: "design", label: "Design", score: designScore },
      { key: "storage", label: "Storage", score: storage },
      { key: "visibility", label: "Visibility", score: visibility },
    ],
    technology: [
      { key: "infotainment", label: "Infotainment", score: infotainment },
      { key: "screen", label: "Screen Quality", score: screenQuality },
      { key: "ai", label: "AI Assistant", score: aiAssistant },
      { key: "connectivity", label: "Connectivity", score: connectivity },
      { key: "voice", label: "Voice Control", score: voiceControl },
    ],
    safety: [
      { key: "crash", label: "Crash Protection", score: crashProtection },
      { key: "adas", label: "ADAS", score: adas },
      { key: "driverassist", label: "Driver Assistance", score: driverAssist },
      { key: "child", label: "Child Safety", score: childSafety },
    ],
    ownership: [
      { key: "reliability", label: "Reliability", score: reliabilityScore },
      { key: "fuel", label: "Fuel Economy", score: fuelEconomyScore },
      { key: "service", label: "Service Cost", score: serviceCost },
      { key: "warranty", label: "Warranty", score: warranty },
      { key: "resale", label: "Resale Value", score: resale },
    ],
    value: [
      { key: "price", label: "Price", score: priceScore },
      { key: "equipment", label: "Equipment", score: equipment },
      { key: "running", label: "Running Costs", score: runningCosts },
      { key: "competitive", label: "Competitiveness", score: competitiveness },
    ],
  };
}

function avg(scores: CategoryScore[]): number {
  return scores.reduce((a, b) => a + b.score, 0) / scores.length;
}

export function computeSummary(scores: ReviewScores): ReviewSummary {
  const performance = avg(scores.performance);
  const comfort = avg(scores.comfort);
  const interior = avg(scores.interior);
  const technology = avg(scores.technology);
  const safety = avg(scores.safety);
  const ownership = avg(scores.ownership);
  const value = avg(scores.value);
  const overall = (performance + comfort + interior + technology + safety + ownership + value) / 7;
  return {
    overall: Math.round(overall * 10) / 10,
    performance: Math.round(performance * 10) / 10,
    comfort: Math.round(comfort * 10) / 10,
    interior: Math.round(interior * 10) / 10,
    technology: Math.round(technology * 10) / 10,
    safety: Math.round(safety * 10) / 10,
    ownership: Math.round(ownership * 10) / 10,
    value: Math.round(value * 10) / 10,
    editorsChoice: overall >= 8.5,
  };
}

const MAGAZINES = [
  { id: "apex_perf", name: "Apex Performance", category: "performance" as const },
  { id: "velocity", name: "Velocity Magazine", category: "performance" as const },
  { id: "track_attack", name: "Track Attack", category: "performance" as const },
  { id: "motorsport_wk", name: "Motorsport Weekly", category: "performance" as const },
  { id: "elite_drive", name: "Elite Drive", category: "luxury" as const },
  { id: "prestige", name: "Prestige Auto", category: "luxury" as const },
  { id: "exec_wheels", name: "Executive Wheels", category: "luxury" as const },
  { id: "smart_auto", name: "Smart Auto", category: "economy" as const },
  { id: "daily_drive", name: "Daily Drive", category: "economy" as const },
  { id: "family_wheels", name: "Family Wheels", category: "economy" as const },
  { id: "autotech", name: "AutoTech Review", category: "technology" as const },
  { id: "future_mobility", name: "Future Mobility", category: "technology" as const },
  { id: "digital_garage", name: "Digital Garage", category: "technology" as const },
];

function categoryWeight(cat: string, summary: ReviewSummary): number {
  if (cat === "performance") return summary.performance;
  if (cat === "luxury") return (summary.comfort + summary.interior) / 2;
  if (cat === "economy") return (summary.ownership + summary.value) / 2;
  if (cat === "technology") return summary.technology;
  return summary.overall;
}

export function generateMagazineReviews(design: VehicleDesign, sim: SimResult, _scores: ReviewScores, summary: ReviewSummary): MagazineReview[] {
  const name = design.name || "the prototype";
  const v = design.vehicle;
  const result: MagazineReview[] = [];

  for (const mag of MAGAZINES) {
    const weight = categoryWeight(mag.category, summary);
    const score = Math.round(clamp(weight + (Math.random() - 0.5) * 0.4) * 10) / 10;

    let pros: string[] = [];
    let cons: string[] = [];
    let verdict = "";
    let article = "";

    if (mag.category === "performance") {
      if (summary.performance > 7.5) pros.push("Explosive acceleration", "Sharp, communicative steering");
      else pros.push("Predictable handling balance");
      if (sim.accel0_100 < 4) pros.push(`0-100 in ${sim.accel0_100.toFixed(1)}s is serious pace`);
      if (sim.lateralG > 1.2) pros.push(`Lateral grip of ${sim.lateralG.toFixed(2)}g is exceptional`);
      if (sim.brakingDist > 38) cons.push("Braking distances are longer than class leaders");
      if (sim.fuelEconomy > 12) cons.push("Thirsty at full throttle");
      if (summary.comfort < 6) cons.push("Ride is too firm for road use");
      verdict = summary.performance > 8 ? "A genuine driver's car" : summary.performance > 6.5 ? "Capable if not thrilling" : "Lacks the edge expected here";
      article = `The ${name} ${summary.performance > 8 ? "delivers on the promise of its spec sheet" : "doesn't quite live up to its on-paper numbers"}. The ${sim.peakPower}-hp powerplant${sim.accel0_100 < 4 ? " rockets it to 100 km/h in " + sim.accel0_100.toFixed(1) + " seconds" : " is adequate rather than explosive"}. ${sim.lateralG > 1.2 ? "Cornering grip is superb" : "Grip is modest"}, and the chassis feels ${summary.performance > 7 ? "communicative" : "numb"}. ${summary.comfort < 6 ? "The ride is uncompromisingly stiff." : "The ride is surprisingly compliant."} ${summary.value < 6 ? "At this price, expectations are high." : "Value is a strong point."}`;
    } else if (mag.category === "luxury") {
      if (summary.interior > 7.5) pros.push("Beautifully appointed cabin", "Premium materials throughout");
      if (summary.comfort > 7) pros.push("Whisper-quiet cabin", "Plush, supportive seats");
      if (summary.interior < 6) cons.push("Materials feel downmarket for the segment");
      if (summary.technology < 6) cons.push("Infotainment feels dated");
      if (sim.weight > 1800) cons.push("Portly curb weight dulls responses");
      verdict = summary.comfort > 7.5 && summary.interior > 7.5 ? "A vault-like luxury cabin" : "Comfortable but not class-leading";
      article = `Elite Drive evaluates cabin quality above all. The ${name}'s interior scores ${summary.interior.toFixed(1)}/10 — ${summary.interior > 7 ? "a genuinely premium environment" : "mid-pack for the price"}. ${summary.comfort > 7 ? "Ride quality and seat comfort impress." : "The ride errs toward firmness."} ${summary.technology < 6 ? "The infotainment interface lags rivals." : "Technology integration is competitive."} ${summary.value < 6 ? "At $" + (sim.totalCost / 1000).toFixed(1) + "k, the value proposition is thin." : "Pricing is reasonable for the luxury on offer."}`;
    } else if (mag.category === "economy") {
      if (summary.ownership > 7) pros.push("Strong predicted reliability", "Frugal running costs");
      if (sim.fuelEconomy < 8) pros.push(`Fuel economy of ${sim.fuelEconomy.toFixed(1)} L/100km is commendable`);
      if (sim.totalCost > 70000) cons.push("Purchase price is steep for a family buyer");
      if (sim.fuelEconomy > 12) cons.push("Running costs will pinch over time");
      if (summary.comfort < 6) cons.push("Ride is too harsh for daily duty");
      verdict = summary.ownership > 7 && summary.value > 6.5 ? "A sensible, cost-effective choice" : "Compromised as everyday transport";
      article = `Smart Auto prioritizes the ownership experience. The ${name} returns ${sim.fuelEconomy.toFixed(1)} L/100km and carries a total cost of $${(sim.totalCost / 1000).toFixed(1)}k. ${summary.ownership > 7 ? "Predicted reliability is strong." : "Long-term reliability is a concern."} ${summary.value > 6.5 ? "Value for money is respectable." : "The price climbs faster than the equipment list."} ${summary.comfort < 6 ? "The stiff suspension may fatigue daily drivers." : "It's comfortable enough for the commute."}`;
    } else {
      if (summary.technology > 7.5) pros.push("Cutting-edge infotainment", "Comprehensive driver assists");
      if (v.interior.infotainmentSize > 12) pros.push(`${v.interior.infotainmentSize}" display is class-leading`);
      if (summary.technology < 6) cons.push("Infotainment feels a generation behind");
      if (!v.electronics.dataLogging) cons.push("Telemetry features are missing");
      verdict = summary.technology > 7.5 ? "A technology flagship" : "Tech is adequate, not class-leading";
      article = `AutoTech Review measures digital sophistication. The ${name} packs a ${v.interior.infotainmentSize}-inch infotainment system${v.electronics.dataLogging ? " with full telemetry logging" : ""}. ${summary.technology > 7 ? "Connectivity and driver-assist features impress." : "The interface feels sluggish and dated."} ${summary.safety > 7 ? "ADAS and crash protection are strong." : "Safety tech lags the segment."} ${summary.technology > 7.5 ? "This is a tech-forward package." : "More work is needed to compete digitally."}`;
    }

    result.push({
      magId: mag.id,
      magName: mag.name,
      category: mag.category,
      score,
      verdict,
      pros: pros.slice(0, 4),
      cons: cons.slice(0, 3),
      article,
    });
  }
  return result;
}

export function generateCustomerReviews(design: VehicleDesign, sim: SimResult, summary: ReviewSummary): CustomerReview[] {
  const name = design.name || "this car";
  const authors = ["Marco V.", "Hannah K.", "Devon R.", "Priya S.", "Lars M.", "Yuki T.", "Elena B.", "Tomas H.", "Grace L.", "Idris W."];
  const reviews: CustomerReview[] = [];

  const baseRatings = {
    reliability: summary.ownership,
    fuel: clamp(10 - sim.fuelEconomy * 0.9),
    comfort: summary.comfort,
    performance: summary.performance,
    technology: summary.technology,
    value: summary.value,
  };

  const templates = [
    { title: "Exceeded expectations", body: (n: string) => `The ${n} has been a joy. The engine pulls hard and the build quality feels solid.` },
    { title: "Great daily driver", body: (n: string) => `Using the ${n} every day. Comfortable, reliable, and ${sim.fuelEconomy < 9 ? "surprisingly efficient" : "not the cheapest to run"}.` },
    { title: "Fantastic engine, flawed tech", body: (n: string) => `The ${n}'s engine is brilliant but the touchscreen is ${summary.technology < 6 ? "sluggish" : "fine once you learn it"}.` },
    { title: "Stiff but rewarding", body: (n: string) => `The ${n} rides ${summary.comfort < 6 ? "firmly" : "well"} but the handling is worth it.` },
    { title: "Premium feel", body: (n: string) => `The ${n}'s cabin feels expensive. Materials are top notch.` },
    { title: "A few niggles", body: (n: string) => `Mostly happy with the ${n}, though ${sim.reliability < 0.7 ? "reliability has been patchy" : "service costs add up"}.` },
  ];

  for (let i = 0; i < 6; i++) {
    const variance = (Math.random() - 0.5) * 1.6;
    const cat = {
      reliability: clamp(baseRatings.reliability + variance),
      fuel: clamp(baseRatings.fuel + variance),
      comfort: clamp(baseRatings.comfort + variance),
      performance: clamp(baseRatings.performance + variance),
      technology: clamp(baseRatings.technology + variance),
      value: clamp(baseRatings.value + variance),
    };
    const avgStars = (cat.reliability + cat.fuel + cat.comfort + cat.performance + cat.technology + cat.value) / 6;
    const stars = Math.max(1, Math.min(5, Math.round(avgStars / 2)));
    const t = templates[i % templates.length];
    reviews.push({
      author: authors[i % authors.length],
      stars,
      title: t.title,
      body: t.body(name),
      categories: cat,
    });
  }
  return reviews.sort((a, b) => b.stars - a.stars);
}

export function generateLongTerm(design: VehicleDesign, sim: SimResult): LongTermReview {
  const years = 5;
  const rel = sim.reliability;
  const e = design.engine;

  const engineReliability = clamp(rel * 10 - (e.turboSize > 0.7 ? 1 : 0) - (sim.knockRisk > 0.5 ? 1 : 0));
  const rustResistance = clamp(7 - (design.vehicle.chassis === "steel_unibody" ? 2 : 0) + (design.vehicle.chassis === "aluminum_spaceframe" ? 1 : 0));
  const suspensionDurability = clamp(rel * 9 - (design.vehicle.springRateF / 200) - (sim.weight > 1800 ? 1 : 0));
  const batteryHealth = sim.isElectric ? clamp(rel * 9 + (e.batteryChemistry === "lfp" ? 1.5 : e.batteryChemistry === "solid_state" ? 2 : 0)) : clamp(rel * 8);
  const interiorWear = clamp(6 + rel * 3 + (design.vehicle.interior.seatMaterial === "leather" ? 1 : 0));
  const electronicsFailures = clamp(8 - sim.manufacturing.defectRate / 2 + rel * 2);
  const resaleRetention = clamp(40 + rel * 40 + (design.vehicle.chassis === "carbon_tub" ? 5 : 0) - (sim.totalCost > 80000 ? 8 : 0));

  const grade = gradeFor((engineReliability + suspensionDurability + electronicsFailures) / 3);
  const notes: string[] = [];
  if (engineReliability < 7) notes.push(`Engine showing wear by year ${Math.max(2, Math.floor(8 - engineReliability))}.`);
  if (e.turboSize > 0.7) notes.push("Turbocharger seals require inspection at 60k km.");
  if (rustResistance < 6) notes.push("Surface rust appearing on steel underbody components.");
  if (suspensionDurability < 6.5) notes.push("Dampers softened noticeably after 40k km.");
  if (sim.isElectric && batteryHealth < 7) notes.push(`Battery capacity at ${(batteryHealth * 10).toFixed(0)}% of original after 5 years.`);
  if (electronicsFailures < 6.5) notes.push("Infotainment glitches reported by multiple owners.");
  if (notes.length === 0) notes.push("No major issues reported across the ownership period.");

  return {
    years,
    reliabilityGrade: grade,
    engineReliability: Math.round(engineReliability * 10) / 10,
    rustResistance: Math.round(rustResistance * 10) / 10,
    suspensionDurability: Math.round(suspensionDurability * 10) / 10,
    batteryHealth: Math.round(batteryHealth * 10) / 10,
    interiorWear: Math.round(interiorWear * 10) / 10,
    electronicsFailures: Math.round(electronicsFailures * 10) / 10,
    resaleRetention: Math.round(resaleRetention),
    notes,
  };
}

const INFLUENCERS: { name: string; channel: string; niche: string; subscribers: string }[] = [
  { name: "Jake Carter", channel: "Redline Reviews", niche: "Track testing", subscribers: "2.1M" },
  { name: "Sophie Laurent", channel: "Curb Appeal", niche: "Luxury reviews", subscribers: "1.8M" },
  { name: "Ken Nakamura", channel: "TechDrive", niche: "Technology reviews", subscribers: "3.4M" },
  { name: "Aisha Bello", channel: "Smart Motoring", niche: "Budget reviews", subscribers: "1.2M" },
  { name: "Tom Devereux", channel: "Garage Diary", niche: "Long-term ownership", subscribers: "950K" },
];

export function generateInfluencerReviews(design: VehicleDesign, _sim: SimResult, summary: ReviewSummary): InfluencerReview[] {
  const name = design.name || "this car";
  return INFLUENCERS.map((inf) => {
    let focusScore = summary.overall;
    let verdict = "";
    if (inf.niche === "Track testing") { focusScore = summary.performance; verdict = focusScore > 7.5 ? `The ${name} is properly quick on track.` : `The ${name} is more road than race.`; }
    else if (inf.niche === "Luxury reviews") { focusScore = (summary.comfort + summary.interior) / 2; verdict = focusScore > 7 ? `The ${name} feels properly premium.` : `The ${name} doesn't feel special enough.`; }
    else if (inf.niche === "Technology reviews") { focusScore = summary.technology; verdict = focusScore > 7 ? `The ${name} is a tech showcase.` : `The ${name}'s tech trails the pack.`; }
    else if (inf.niche === "Budget reviews") { focusScore = summary.value; verdict = focusScore > 6.5 ? `The ${name} is genuinely good value.` : `Hard to justify the ${name}'s price.`; }
    else { focusScore = summary.ownership; verdict = focusScore > 7 ? `The ${name} has held up brilliantly.` : `Some long-term niggles on the ${name}.`; }

    const viral = focusScore > 8.2 && Math.random() > 0.4;
    const demandImpact = Math.round((focusScore - 6) * (viral ? 18 : 6));

    return {
      ...inf,
      verdict,
      viral,
      demandImpact: Math.max(-30, demandImpact),
    };
  });
}

export function generateComparison(_design: VehicleDesign, _sim: SimResult, summary: ReviewSummary) {
  const competitors = ["Rival GT-S", "Competitor RS", "Contender V8"];
  const rows: ComparisonRow[] = [
    { category: "Performance", yours: summary.performance, competitors: [summary.performance - 0.4 + Math.random() * 0.8, summary.performance - 0.3 + Math.random() * 0.6] },
    { category: "Comfort", yours: summary.comfort, competitors: [summary.comfort - 0.3 + Math.random() * 0.7, summary.comfort - 0.2 + Math.random() * 0.5] },
    { category: "Interior", yours: summary.interior, competitors: [summary.interior - 0.4 + Math.random() * 0.8, summary.interior + Math.random() * 0.4] },
    { category: "Technology", yours: summary.technology, competitors: [summary.technology + Math.random() * 0.5, summary.technology - 0.3 + Math.random() * 0.6] },
    { category: "Safety", yours: summary.safety, competitors: [summary.safety - 0.2 + Math.random() * 0.4, summary.safety + Math.random() * 0.3] },
    { category: "Value", yours: summary.value, competitors: [summary.value + Math.random() * 0.6, summary.value - 0.2 + Math.random() * 0.5] },
  ];
  rows.forEach((r) => {
    r.yours = Math.round(clamp(r.yours) * 10) / 10;
    r.competitors = r.competitors.map((c) => Math.round(clamp(c) * 10) / 10);
  });
  const yourTotal = rows.reduce((a, r) => a + r.yours, 0);
  const compTotals = [0, 0].map((_, i) => rows.reduce((a, r) => a + r.competitors[i], 0));
  const allTotals = [yourTotal, ...compTotals];
  const winnerIndex = allTotals.indexOf(Math.max(...allTotals));
  return { rows, competitors, winnerIndex };
}

const ALL_AWARDS: { name: string; description: string; check: (s: ReviewSummary, sim: SimResult, d: VehicleDesign) => boolean }[] = [
  { name: "Car of the Year", description: "Best overall package across all categories", check: (s) => s.overall >= 9.0 },
  { name: "Performance Car of the Year", description: "Highest performance scores", check: (s) => s.performance >= 9.2 },
  { name: "Best Family SUV", description: "Top practicality and safety", check: (s, _sim, d) => (d.vehicle.exterior.bodyType.includes("suv") || d.vehicle.exterior.bodyType.includes("wagon")) && s.safety > 8 && s.comfort > 7 },
  { name: "Luxury Sedan of the Year", description: "Exceptional comfort and interior", check: (s, _sim, d) => d.vehicle.exterior.bodyType.includes("sedan") && s.comfort > 8.2 && s.interior > 8.2 },
  { name: "Best Electric Vehicle", description: "Leading EV powertrain", check: (s, sim) => sim.isElectric && s.overall > 7.5 },
  { name: "Best Interior", description: "Finest cabin materials and design", check: (s) => s.interior >= 9.0 },
  { name: "Best Infotainment", description: "Class-leading technology interface", check: (s) => s.technology >= 9.0 },
  { name: "Safest Car", description: "Outstanding crash protection and ADAS", check: (s) => s.safety >= 9.3 },
  { name: "Best Value", description: "Exceptional value for money", check: (s) => s.value >= 9.0 },
  { name: "Engineering Innovation Award", description: "Novel engineering solutions", check: (s, _sim, d) => (d.vehicle.aeroResearch.active.enabled || d.engine.hasMguH) && s.overall > 7.5 },
  { name: "Best Engine", description: "Finest powertrain in class", check: (_s, sim) => sim.peakPower > 600 && sim.reliability > 0.75 },
  { name: "Best Manufacturing Quality", description: "Lowest defect rate and highest build quality", check: (_s, sim) => sim.manufacturing.qualityScore > 92 && sim.manufacturing.defectRate < 3 },
  { name: "Green Manufacturing Award", description: "Sustainable production", check: (_s, sim) => sim.emissions < 120 && sim.fuelEconomy < 7 },
  { name: "Most Innovative Technology", description: "Cutting-edge tech integration", check: (s, _sim, d) => d.vehicle.electronics.telemetryLevel > 0.8 && s.technology > 8 },
];

export function generateAwards(summary: ReviewSummary, sim: SimResult, design: VehicleDesign): IndustryAward[] {
  return ALL_AWARDS.map((a) => ({
    name: a.name,
    description: a.description,
    won: a.check(summary, sim, design),
  }));
}

export function generateReliability(sim: SimResult, longTerm: LongTermReview): ReliabilityRanking {
  const engineFailures = Math.round(clamp(10 - longTerm.engineReliability) * 10);
  const transmissionIssues = Math.round(clamp(10 - sim.reliability * 10) * 8);
  const electronicsProblems = Math.round(clamp(10 - longTerm.electronicsFailures) * 12);
  const warrantyClaims = Math.round(sim.manufacturing.defectRate * 10);
  const recallFrequency = Math.round(clamp(10 - sim.reliability * 10) * 5);
  const grade = longTerm.reliabilityGrade;
  return { grade, engineFailures, transmissionIssues, electronicsProblems, warrantyClaims, recallFrequency };
}

export function computeMarketDemand(summary: ReviewSummary, awards: IndustryAward[], influencers: InfluencerReview[]): FullReview["marketDemand"] {
  const awardBoost = awards.filter((a) => a.won).length * 0.4;
  const infBoost = influencers.reduce((a, i) => a + i.demandImpact, 0) / 100;
  const score = summary.overall + awardBoost + infBoost;
  if (score >= 11) return "Very High";
  if (score >= 9.5) return "High";
  if (score >= 8) return "Moderate";
  if (score >= 6.5) return "Low";
  return "Very Low";
}

export function generateFullReview(design: VehicleDesign, sim: SimResult): FullReview {
  const scores = computeScores(design, sim);
  const summary = computeSummary(scores);
  const magazines = generateMagazineReviews(design, sim, scores, summary);
  const customerReviews = generateCustomerReviews(design, sim, summary);
  const longTerm = generateLongTerm(design, sim);
  const influencers = generateInfluencerReviews(design, sim, summary);
  const comparison = generateComparison(design, sim, summary);
  const awards = generateAwards(summary, sim, design);
  const reliability = generateReliability(sim, longTerm);
  const marketDemand = computeMarketDemand(summary, awards, influencers);
  return { scores, summary, magazines, customerReviews, longTerm, influencers, comparison, awards, reliability, marketDemand };
}

// ============================================================================
// APEX AI PROMPT ENGINE — Natural Language → Vehicle Configuration Actions
// ============================================================================
// Parses conversational vehicle descriptions into structured configuration
// actions that update the DesignContext stores. Supports:
//   - Engine architecture, aspiration, power targets, hybrid/EV
//   - Vehicle chassis, drivetrain, transmission, brakes, wheels, tires
//   - Aerodynamics: wing angle, diffuser, splitter, underbody
//   - Interior: seats, materials, infotainment, ambient lighting
//   - Exterior: paint, body kit, wheels
//   - Concept targeting: budget, track, luxury, balanced
//   - Named presets (Valkyrie, Sprint, GT3, EcoStream, etc.)
//   - Direct parameter overrides ("set boost to 1.5 bar")
//   - Engineering Q&A using apexKnowledge.ts
// ============================================================================

import type { EngineLayout, IntakeType } from "../types";

// --- Types ---
export interface ParsedAction {
  type: "engine" | "vehicle" | "aero" | "interior" | "exterior" | "concept" | "preset" | "aeroResearch";
  description: string;
  changes: Record<string, unknown>;
  confidence: number;
  icon: string;
}

export interface AIResponse {
  message: string;
  actions: ParsedAction[];
  followUp?: string;
  isQueryAnswer?: boolean;
}

// --- Helpers ---
function extractNumber(text: string, unit?: string): number | null {
  const patterns = unit
    ? [new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${unit}`, "i")]
    : [/(\\d+(?:\\.\\d+)?)/];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseFloat(m[1]);
  }
  return null;
}

function hasAny(text: string, ...keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

// ============================================================================
// ENGINE INTENT PARSER
// ============================================================================
function parseEngineIntents(text: string): ParsedAction[] {
  const actions: ParsedAction[] = [];
  const lower = text.toLowerCase();

  // Engine Layout
  const layoutMap: Record<string, EngineLayout> = {
    "inline-3": "i3", "i3": "i3", "inline 3": "i3", "three cylinder": "i3", "3 cylinder": "i3",
    "inline-4": "i4", "i4": "i4", "inline 4": "i4", "four cylinder": "i4", "4 cylinder": "i4", "straight 4": "i4",
    "inline-6": "i6", "i6": "i6", "inline 6": "i6", "straight 6": "i6", "six cylinder": "i6",
    "v6": "v6", "v-6": "v6",
    "v8": "v8", "v-8": "v8",
    "v10": "v10", "v-10": "v10",
    "v12": "v12", "v-12": "v12",
    "w12": "w12", "w-12": "w12",
    "w16": "w16", "w-16": "w16", "bugatti": "w16",
    "flat-6": "boxer6", "flat 6": "boxer6", "boxer": "boxer6", "porsche": "boxer6",
    "flat-4": "boxer4", "flat 4": "boxer4",
    "rotary": "rotary", "wankel": "rotary", "mazda": "rotary",
    "electric": "electric", " ev": "electric", "bev": "electric", "battery electric": "electric",
  };

  let detectedLayout: EngineLayout | null = null;
  for (const [keyword, layout] of Object.entries(layoutMap)) {
    if (lower.includes(keyword)) { detectedLayout = layout; break; }
  }
  if (detectedLayout) {
    actions.push({ type: "engine", description: `Engine layout → ${detectedLayout.toUpperCase()}`, changes: { layout: detectedLayout }, confidence: 0.95, icon: "⚡" });
  }

  // Aspiration
  const intakeMap: Record<string, IntakeType> = {
    "naturally aspirated": "na", " na ": "na", "aspirated": "na", "atmo": "na", "atmospheric": "na",
    "turbo": "turbo_single", "turbocharged": "turbo_single", "single turbo": "turbo_single",
    "twin turbo": "twin_turbo", "bi-turbo": "twin_turbo", "biturbo": "twin_turbo", "dual turbo": "twin_turbo",
    "supercharged": "supercharger", "supercharger": "supercharger", "blower": "supercharger",
  };
  for (const [keyword, intake] of Object.entries(intakeMap)) {
    if (lower.includes(keyword)) {
      actions.push({ type: "engine", description: `Aspiration → ${intake.replace("_", " ")}`, changes: { intake }, confidence: 0.9, icon: "🔧" });
      break;
    }
  }

  // Power targets
  const hpMatch = lower.match(/(\d{2,4})\s*(hp|bhp|horsepower|ps)/);
  if (hpMatch) {
    const targetHp = parseInt(hpMatch[1]);
    const boostPressure = targetHp > 600 ? Math.min(3.5, (targetHp - 300) / 300) : targetHp > 400 ? 1.5 : 0;
    const rpmLimiter = targetHp > 800 ? 9000 : targetHp > 500 ? 7500 : 6500;
    actions.push({ type: "engine", description: `Target power → ${targetHp} HP`, changes: { boostPressure: Math.round(boostPressure * 100) / 100, rpmLimiter, redline: rpmLimiter - 200 }, confidence: 0.85, icon: "💪" });
  }

  // Boost pressure
  const boostMatch = lower.match(/boost\s*(?:to|at|set)?\s*(\d+\.?\d*)\s*(bar|psi)?/);
  if (boostMatch) {
    const bar = boostMatch[2] === "psi" ? parseFloat(boostMatch[1]) / 14.5 : parseFloat(boostMatch[1]);
    actions.push({ type: "engine", description: `Boost → ${bar.toFixed(2)} bar`, changes: { boostPressure: Math.round(bar * 100) / 100 }, confidence: 0.95, icon: "🔧" });
  }

  // RPM
  const rpmMatch = lower.match(/(\d{4,5})\s*rpm/);
  if (rpmMatch) {
    const rpm = parseInt(rpmMatch[1]);
    if (rpm >= 4000 && rpm <= 12000) {
      actions.push({ type: "engine", description: `Redline → ${rpm} RPM`, changes: { redline: rpm, rpmLimiter: rpm + 200 }, confidence: 0.9, icon: "🔄" });
    }
  }

  // Displacement
  const dispMatch = lower.match(/(\d+\.?\d*)\s*l(?:iter|itre)?/);
  if (dispMatch) {
    const liters = parseFloat(dispMatch[1]);
    const cylCount = detectedLayout === "v8" ? 8 : detectedLayout === "v12" ? 12 : detectedLayout === "v6" ? 6 : detectedLayout === "i4" ? 4 : detectedLayout === "i6" ? 6 : 6;
    const ccPerCyl = (liters * 1000) / cylCount;
    const bore = Math.round(Math.pow(ccPerCyl * 4 / Math.PI, 1 / 3) * 10) / 10;
    const stroke = Math.round((ccPerCyl * 4) / (Math.PI * bore * bore) * 10) / 10;
    actions.push({ type: "engine", description: `Displacement → ${liters}L (${Math.round(liters * 1000)}cc)`, changes: { bore, stroke }, confidence: 0.85, icon: "📏" });
  }

  // Compression ratio
  const crMatch = lower.match(/compression\s*(?:ratio)?\s*(?:of|at|set)?\s*(\d+\.?\d*)/);
  if (crMatch) {
    const cr = parseFloat(crMatch[1]);
    if (cr >= 8 && cr <= 16) {
      actions.push({ type: "engine", description: `Compression → ${cr}:1`, changes: { compressionRatio: cr }, confidence: 0.9, icon: "🔧" });
    }
  }

  // Hybrid / EV
  if (hasAny(lower, "hybrid", "phev", "plug-in", "plug in")) {
    const motorPower = extractNumber(text, "kw") || 150;
    actions.push({ type: "engine", description: `Hybrid → PHEV (${motorPower} kW)`, changes: { hybridArchitecture: "phev", hybridMotorPower: motorPower, batteryCapacity: Math.max(10, motorPower / 15), batteryChemistry: hasAny(lower, "solid") ? "solid_state" : "nmc", motorPlacement: "p2" }, confidence: 0.9, icon: "🔋" });
  }

  if (hasAny(lower, "pure ev", "battery electric", "bev", "all electric")) {
    const evPower = extractNumber(text, "kw") || 300;
    actions.push({ type: "engine", description: `Full EV → ${evPower} kW`, changes: { layout: "electric", hybridArchitecture: "none", evMotorPower: evPower, evMotorType: hasAny(lower, "axial") ? "axial_flux" : "pmsm", batteryCapacity: Math.max(60, evPower / 5), motorLayout: hasAny(lower, "dual", "awd") ? "both" : "rear" }, confidence: 0.9, icon: "⚡" });
  }

  // ECU Mode
  if (hasAny(lower, "race mode", "track mode", "race ecu")) {
    actions.push({ type: "engine", description: "ECU → Race mode", changes: { ecuMapMode: "race" }, confidence: 0.85, icon: "🎮" });
  } else if (hasAny(lower, "economy mode", "eco mode")) {
    actions.push({ type: "engine", description: "ECU → Economy mode", changes: { ecuMapMode: "economy" }, confidence: 0.85, icon: "🎮" });
  } else if (hasAny(lower, "sport mode")) {
    actions.push({ type: "engine", description: "ECU → Sport mode", changes: { ecuMapMode: "sport" }, confidence: 0.85, icon: "🎮" });
  }

  return actions;
}

// ============================================================================
// VEHICLE INTENT PARSER
// ============================================================================
function parseVehicleIntents(text: string): ParsedAction[] {
  const actions: ParsedAction[] = [];
  const lower = text.toLowerCase();

  // Chassis
  const chassisMap: Record<string, string> = {
    "carbon tub": "carbon_tub", "monocoque": "carbon_tub", "carbon fiber": "carbon_tub",
    "aluminum spaceframe": "aluminum_spaceframe", "aluminium spaceframe": "aluminum_spaceframe", "aluminum": "aluminum_spaceframe",
    "steel unibody": "steel_unibody", "steel": "steel_unibody",
    "tube frame": "tube_frame", "tubular": "tube_frame",
  };
  for (const [kw, chassis] of Object.entries(chassisMap)) {
    if (lower.includes(kw)) {
      actions.push({ type: "vehicle", description: `Chassis → ${chassis.replace(/_/g, " ")}`, changes: { chassis }, confidence: 0.9, icon: "🏗️" });
      break;
    }
  }

  // Drivetrain
  const driveMap: Record<string, string> = {
    "awd": "awd", "all wheel drive": "awd", "all-wheel drive": "awd", "4wd": "awd",
    "rwd": "rwd", "rear wheel drive": "rwd", "rear-wheel drive": "rwd",
    "fwd": "fwd", "front wheel drive": "fwd", "front-wheel drive": "fwd",
  };
  for (const [kw, drive] of Object.entries(driveMap)) {
    if (lower.includes(kw)) {
      actions.push({ type: "vehicle", description: `Drivetrain → ${drive.toUpperCase()}`, changes: { driveType: drive }, confidence: 0.9, icon: "🚗" });
      break;
    }
  }

  // Transmission
  const transMap: Record<string, string> = {
    "dct": "dct_7", "dual clutch": "dct_7", "dual-clutch": "dct_7", "pdk": "dct_7",
    "sequential": "sequential_6", "seq": "sequential_6",
    "manual": "manual_6", "stick shift": "manual_6", "6 speed manual": "manual_6",
    "automatic": "auto_8", "torque converter": "auto_8",
    "cvt": "cvt", "single speed": "single_speed",
  };
  for (const [kw, trans] of Object.entries(transMap)) {
    if (lower.includes(kw)) {
      actions.push({ type: "vehicle", description: `Transmission → ${trans}`, changes: { transmission: trans }, confidence: 0.85, icon: "⚙️" });
      break;
    }
  }

  // Brakes
  if (hasAny(lower, "carbon ceramic", "carbon-ceramic", "ccm")) {
    actions.push({ type: "vehicle", description: "Brakes → Carbon Ceramic", changes: { brakeType: "carbon_ceramic" }, confidence: 0.9, icon: "🛑" });
  } else if (hasAny(lower, "steel brake", "iron brake")) {
    actions.push({ type: "vehicle", description: "Brakes → Steel", changes: { brakeType: "steel" }, confidence: 0.85, icon: "🛑" });
  }

  // Tire compound
  const tireMap: Record<string, string> = {
    "slick": "slick", "racing slick": "slick",
    "semi slick": "semi_slick", "semi-slick": "semi_slick", "track day": "semi_slick",
    "performance": "performance", "summer": "performance",
    "all season": "all_season", "all-season": "all_season",
    "wet": "wet", "rain tire": "wet",
    "off road": "off_road", "all terrain": "all_road",
  };
  for (const [kw, compound] of Object.entries(tireMap)) {
    if (lower.includes(kw)) {
      actions.push({ type: "vehicle", description: `Tires → ${compound}`, changes: { tireCompound: compound }, confidence: 0.85, icon: "🛞" });
      break;
    }
  }

  // Engine position
  if (hasAny(lower, "mid engine", "mid-engine", "mid mounted")) {
    actions.push({ type: "vehicle", description: "Engine position → Mid", changes: { enginePosition: "mid" }, confidence: 0.9, icon: "📍" });
  } else if (hasAny(lower, "front engine", "front-engine")) {
    actions.push({ type: "vehicle", description: "Engine position → Front", changes: { enginePosition: "front" }, confidence: 0.9, icon: "📍" });
  } else if (hasAny(lower, "rear engine", "rear-engine")) {
    actions.push({ type: "vehicle", description: "Engine position → Rear", changes: { enginePosition: "rear" }, confidence: 0.9, icon: "📍" });
  }

  // Wheel diameter
  const wheelMatch = lower.match(/(\d{2})\s*(?:inch|"|in)/);
  if (wheelMatch) {
    const size = parseInt(wheelMatch[1]);
    if (size >= 15 && size <= 22) {
      actions.push({ type: "vehicle", description: `Wheels → ${size}"`, changes: { wheelDiameter: size }, confidence: 0.85, icon: "⭕" });
    }
  }

  return actions;
}

// ============================================================================
// AERO INTENT PARSER
// ============================================================================
function parseAeroIntents(text: string): ParsedAction[] {
  const actions: ParsedAction[] = [];
  const lower = text.toLowerCase();

  // Wing angle
  const wingMatch = lower.match(/wing\s*(?:angle|aoa)?\s*(?:of|at|set)?\s*(\d+)/);
  if (wingMatch) {
    const angle = parseInt(wingMatch[1]);
    if (angle >= 0 && angle <= 30) {
      actions.push({ type: "aeroResearch", description: `Rear wing AoA → ${angle}°`, changes: { rearWing: { angleOfAttack: angle, wingProfile: "multi_element", endplates: "f1_style", dragPenalty: angle * 0.005 } }, confidence: 0.9, icon: "🌬️" });
    }
  }

  // High downforce
  if (hasAny(lower, "high downforce", "maximum downforce", "max downforce", "monaco setup", "street circuit")) {
    actions.push({ type: "aeroResearch", description: "High downforce aero package", changes: { rearWing: { angleOfAttack: 20, wingProfile: "multi_element", endplates: "f1_style", dragPenalty: 0.10 }, front: { splitterProtrusion: 80, canardPlanes: 2 }, diffuser: { angle: 18, expansionRatio: 2.8, strakes: 4 } }, confidence: 0.85, icon: "🌪️" });
  }

  // Low drag
  if (hasAny(lower, "low drag", "high speed", "monza setup", "long straight", "top speed")) {
    actions.push({ type: "aeroResearch", description: "Low-drag aero package", changes: { rearWing: { angleOfAttack: 6, wingProfile: "single_element", endplates: "low_drag", dragPenalty: 0.03 }, front: { splitterProtrusion: 20, canardPlanes: 0 }, diffuser: { angle: 8, expansionRatio: 1.8, strakes: 2 } }, confidence: 0.85, icon: "💨" });
  }

  // Diffuser
  const diffuserMatch = lower.match(/diffuser\s*(?:angle)?\s*(?:of|at|set)?\s*(\d+)/);
  if (diffuserMatch) {
    const angle = parseInt(diffuserMatch[1]);
    if (angle >= 0 && angle <= 25) {
      actions.push({ type: "aeroResearch", description: `Diffuser → ${angle}°`, changes: { diffuser: { angle, expansionRatio: 1.5 + angle / 10, strakes: Math.min(6, Math.floor(angle / 4)) } }, confidence: 0.9, icon: "🌬️" });
    }
  }

  // Ground effect
  if (hasAny(lower, "ground effect", "venturi", "underbody", "underfloor")) {
    actions.push({ type: "aero", description: "Underbody → Ground effect", changes: { underbody: "ground_effect" }, confidence: 0.9, icon: "🌬️" });
  }

  return actions;
}

// ============================================================================
// INTERIOR INTENT PARSER
// ============================================================================
function parseInteriorIntents(text: string): ParsedAction[] {
  const actions: ParsedAction[] = [];
  const lower = text.toLowerCase();

  if (hasAny(lower, "carbon seat", "carbon bucket", "racing seat", "bucket seat")) {
    actions.push({ type: "interior", description: "Seats → Carbon bucket", changes: { seatMaterial: "carbon", seatType: "bucket" }, confidence: 0.9, icon: "💺" });
  } else if (hasAny(lower, "leather seat", "leather interior")) {
    actions.push({ type: "interior", description: "Seats → Leather", changes: { seatMaterial: "leather" }, confidence: 0.85, icon: "💺" });
  } else if (hasAny(lower, "alcantara", "suede")) {
    actions.push({ type: "interior", description: "Seats → Alcantara", changes: { seatMaterial: "alcantara" }, confidence: 0.85, icon: "💺" });
  }

  if (hasAny(lower, "carbon dash", "carbon fiber interior")) {
    actions.push({ type: "interior", description: "Dashboard → Carbon fiber", changes: { dashboardMaterial: "carbon" }, confidence: 0.85, icon: "🎛️" });
  } else if (hasAny(lower, "wood dash", "wood interior", "wooden")) {
    actions.push({ type: "interior", description: "Dashboard → Wood", changes: { dashboardMaterial: "wood" }, confidence: 0.85, icon: "🎛️" });
  }

  if (hasAny(lower, "ambient light", "rgb light", "interior lighting")) {
    actions.push({ type: "interior", description: "Ambient lighting → Maximum", changes: { ambientLighting: 0.9 }, confidence: 0.8, icon: "💡" });
  }

  if (hasAny(lower, "roll cage", "rollcage", "half cage", "full cage")) {
    actions.push({ type: "interior", description: "Roll cage → Installed", changes: { rollCage: true }, confidence: 0.9, icon: "🛡️" });
  }

  return actions;
}

// ============================================================================
// EXTERIOR INTENT PARSER
// ============================================================================
function parseExteriorIntents(text: string): ParsedAction[] {
  const actions: ParsedAction[] = [];
  const lower = text.toLowerCase();

  const colorMap: Record<string, string> = {
    "red": "#c4151c", "rosso": "#c4151c", "crimson": "#c4151c",
    "blue": "#0a2558", "sapphire": "#0a2558", "navy": "#0a2558",
    "black": "#1a1a1c", "nero": "#1a1a1c",
    "white": "#e8e8e8", "bianco": "#e8e8e8", "pearl white": "#e8e8e8",
    "silver": "#b0b8c2", "argento": "#b0b8c2",
    "green": "#0d4224", "racing green": "#0d4224",
    "orange": "#d9531e", "arancio": "#d9531e",
    "yellow": "#d4a017", "giallo": "#d4a017",
    "purple": "#4a0e6b", "viola": "#4a0e6b",
    "gold": "#a3823f", "oro": "#a3823f",
    "cyan": "#06b6d4", "teal": "#06b6d4",
  };
  for (const [kw, hex] of Object.entries(colorMap)) {
    if (lower.includes(kw)) {
      actions.push({ type: "exterior", description: `Paint → ${kw}`, changes: { bodyColor: hex }, confidence: 0.9, icon: "🎨" });
      break;
    }
  }

  if (hasAny(lower, "widebody", "wide body")) {
    actions.push({ type: "exterior", description: "Body kit → Widebody", changes: { bodyKit: "wide_body" }, confidence: 0.85, icon: "🏎️" });
  } else if (hasAny(lower, "body kit", "aero kit")) {
    actions.push({ type: "exterior", description: "Body kit → Aero kit", changes: { bodyKit: "aero" }, confidence: 0.85, icon: "🏎️" });
  }

  if (hasAny(lower, "gt wing", "big wing", "large spoiler")) {
    actions.push({ type: "exterior", description: "Spoiler → GT Wing", changes: { spoilerType: "gt_wing" }, confidence: 0.85, icon: "🏁" });
  } else if (hasAny(lower, "lip spoiler", "lip")) {
    actions.push({ type: "exterior", description: "Spoiler → Lip", changes: { spoilerType: "lip" }, confidence: 0.85, icon: "🏁" });
  }

  return actions;
}

// ============================================================================
// CONCEPT & PRESET INTENT PARSER
// ============================================================================
function parseConceptIntents(text: string): ParsedAction[] {
  const actions: ParsedAction[] = [];
  const lower = text.toLowerCase();

  if (hasAny(lower, "track car", "track focused", "circuit car", "race car", "attack mode")) {
    actions.push({ type: "concept", description: "Concept → Track", changes: { concept: "track" }, confidence: 0.9, icon: "🏁" });
  } else if (hasAny(lower, "luxury car", "grand tourer", "gt car", "luxury focused", "gentleman driver")) {
    actions.push({ type: "concept", description: "Concept → Luxury", changes: { concept: "luxury" }, confidence: 0.9, icon: "👑" });
  } else if (hasAny(lower, "budget car", "affordable", "cheap", "budget build", "under 30k")) {
    actions.push({ type: "concept", description: "Concept → Budget", changes: { concept: "budget" }, confidence: 0.9, icon: "💰" });
  } else if (hasAny(lower, "balanced", "daily driver", "everyday", "all-rounder")) {
    actions.push({ type: "concept", description: "Concept → Balanced", changes: { concept: "balanced" }, confidence: 0.9, icon: "⚖️" });
  }

  // Named presets
  if (hasAny(lower, "valkyrie", "1000 hp v12", "v12 hybrid")) {
    actions.push({ type: "preset", description: "Load: 1,000 HP V12 Hybrid Valkyrie", changes: { preset: "v12_hybrid_1000hp" }, confidence: 0.95, icon: "📦" });
  } else if (hasAny(lower, "sprint race", "sprint attack")) {
    actions.push({ type: "preset", description: "Load: Sprint Race Attack Spec", changes: { preset: "sprint_race" }, confidence: 0.95, icon: "📦" });
  } else if (hasAny(lower, "gt3", "gt3 spec", "motorsport benchmark")) {
    actions.push({ type: "preset", description: "Load: GT3 Spec-R Motorsport", changes: { preset: "gt3_spec_r" }, confidence: 0.95, icon: "📦" });
  } else if (hasAny(lower, "eco", "eco stream", "hybrid endurance")) {
    actions.push({ type: "preset", description: "Load: EcoStream Hybrid Endurance", changes: { preset: "eco_stream" }, confidence: 0.95, icon: "📦" });
  } else if (hasAny(lower, "balanced sport", "sport gt")) {
    actions.push({ type: "preset", description: "Load: Balanced Sport GT", changes: { preset: "balanced_sport_gt" }, confidence: 0.95, icon: "📦" });
  }

  return actions;
}

// ============================================================================
// MASTER PARSER
// ============================================================================
export function parseUserIntent(text: string): ParsedAction[] {
  return [
    ...parseConceptIntents(text),
    ...parseEngineIntents(text),
    ...parseVehicleIntents(text),
    ...parseAeroIntents(text),
    ...parseInteriorIntents(text),
    ...parseExteriorIntents(text),
  ];
}

// ============================================================================
// FOLLOW-UP QUESTION GENERATOR
// ============================================================================
export function generateFollowUp(text: string, actions: ParsedAction[]): string | null {
  const lower = text.toLowerCase();
  const hasEngine = actions.some((a) => a.type === "engine");
  const hasVehicle = actions.some((a) => a.type === "vehicle");
  const hasAero = actions.some((a) => a.type === "aero" || a.type === "aeroResearch");
  const hasInterior = actions.some((a) => a.type === "interior");

  if (hasEngine && !actions.some((a) => a.changes.intake) && hasAny(lower, "engine", "power", "motor")) {
    return "What aspiration type? (naturally aspirated, turbo, twin-turbo, supercharger)";
  }
  if (hasEngine && !hasVehicle) {
    return "What drivetrain? (FWD, RWD, AWD) and transmission? (DCT, manual, sequential)";
  }
  if (hasVehicle && !actions.some((a) => a.changes.brakeType)) {
    return "What brakes? (steel, carbon ceramic) and tire compound?";
  }
  if (hasAero && !hasInterior) {
    return "Want to specify interior? (seats, materials, roll cage)";
  }
  if (!hasEngine && !hasVehicle && !hasAero && !hasInterior) {
    return "Try: engine type, power target, chassis, aero style, or say 'track car' / 'luxury GT'";
  }
  return null;
}

// ============================================================================
// RESPONSE GENERATOR
// ============================================================================
export function generateAIResponse(text: string): AIResponse {
  const lower = text.toLowerCase();
  const actions = parseUserIntent(text);

  // Check if it's a query rather than a build request
  const isQuery = hasAny(lower, "what is", "what's", "how does", "how do", "why", "explain", "tell me about", "what's my", "what are");
  if (isQuery && actions.length === 0) {
    return generateQueryResponse(text);
  }

  if (actions.length === 0) {
    return {
      message: `I didn't detect specific configuration changes. Try:\n\n• **Engine**: "V8 twin turbo", "1000 hp", "V12 naturally aspirated"\n• **Vehicle**: "carbon tub", "AWD", "sequential gearbox"\n• **Aero**: "high downforce", "wing angle 18"\n• **Interior**: "carbon bucket seats", "leather dash"\n• **Concept**: "track car", "luxury GT"\n\nOr describe a complete vision and I'll configure everything.`,
      actions: [],
      followUp: "What kind of car are you building?",
    };
  }

  // Build summary
  const sections = ["**Configuration detected:**\n"];
  const grouped: Record<string, ParsedAction[]> = {};
  for (const a of actions) {
    if (!grouped[a.type]) grouped[a.type] = [];
    grouped[a.type].push(a);
  }

  for (const [, typeActions] of Object.entries(grouped)) {
    for (const a of typeActions) {
      sections.push(`${a.icon} ${a.description}`);
    }
  }

  sections.push(`\nApplying **${actions.length} change${actions.length > 1 ? "s" : ""}** — click Apply to confirm.`);

  const followUp = generateFollowUp(text, actions);

  return {
    message: sections.join("\n"),
    actions,
    followUp: followUp || undefined,
  };
}

// ============================================================================
// QUERY RESPONSE GENERATOR (uses domain knowledge)
// ============================================================================
function generateQueryResponse(text: string): AIResponse {
  const lower = text.toLowerCase();

  // Boost pressure guidance
  if (hasAny(lower, "boost", "turbo pressure")) {
    return {
      message: "**Boost Pressure Guide:**\n\n• **Stock internals**: Stay under 1.0 bar for reliability\n• **Forged internals**: Safe up to 2.0–2.5 bar\n• **Race-grade**: 2.5–3.5 bar with extensive cooling\n• **Above 3.5 bar**: Extreme — halved engine lifespan\n\n**Danger zone**: Above 1.5 bar on cast pistons risks detonation. Always increase cooling radiator size when adding boost.",
      actions: [],
      isQueryAnswer: true,
      followUp: "Want me to set a specific boost level?",
    };
  }

  // Chassis comparison
  if (hasAny(lower, "chassis", "carbon tub", "aluminum", "steel")) {
    return {
      message: "**Chassis Comparison:**\n\n• **Steel unibody**: Cheapest, heaviest (~350kg). Good for budget builds.\n• **Aluminum spaceframe**: Sweet spot — saves ~90kg over steel, moderate cost.\n• **Carbon fiber tub**: Lightest (~120kg), most rigid, but 5–10× the cost. Supercar territory.\n\n**Tip**: Aluminum spaceframe is the best cost-to-performance ratio for most performance cars.",
      actions: [],
      isQueryAnswer: true,
      followUp: "Want me to upgrade your chassis?",
    };
  }

  // Aero explanation
  if (hasAny(lower, "downforce", "aero", "wing", "splitter", "diffuser", "ground effect")) {
    return {
      message: "**Aerodynamics Guide:**\n\n• **Rear wing AoA**: 3–8° for high-speed tracks, 12–20° for tight circuits. Above 25° = more drag than useful downforce.\n• **Diffuser angle**: Keep under 12° for reliable flow. 12–18° needs careful design. Above 18° risks separation.\n• **Ground effect**: Venturi tunnels generate downforce without drag penalty. The holy grail of aero.\n• **Front splitter**: 40–80mm protrusion for track. More = more front downforce but higher drag.\n\n**Balance**: Target 45–55% rear aero balance for neutral handling.",
      actions: [],
      isQueryAnswer: true,
      followUp: "Want me to configure a specific aero package?",
    };
  }

  // Engine layout comparison
  if (hasAny(lower, "v8", "v12", "v6", "inline", "engine layout", "which engine")) {
    return {
      message: "**Engine Layout Guide:**\n\n• **I4**: Lightest, cheapest, good for turbo builds up to 400hp\n• **I6**: Inherently balanced, smooth, great for 300–600hp\n• **V6**: Compact, good packaging, 300–500hp range\n• **V8**: Classic performance, 400–1000hp, great sound\n• **V10/V12**: Exotic, high-revving, 500–1500hp, heavy & expensive\n• **Flat-6**: Low center of gravity, Porsche territory\n• **Rotary**: High power-to-size, fuel-hungry, unique sound\n\n**Best bang-for-buck**: Twin-turbo V6 or V8.",
      actions: [],
      isQueryAnswer: true,
      followUp: "Which layout interests you?",
    };
  }

  // Tire compound
  if (hasAny(lower, "tire", "tyre", "compound", "slick")) {
    return {
      message: "**Tire Compound Guide:**\n\n• **Slick**: Maximum dry grip, no tread pattern. Race-only.\n• **Semi-slick**: 80% slick performance, street legal. Best track-day tire.\n• **Performance**: Good grip, reasonable wear. Spirited street driving.\n• **All-season**: Balanced wet/dry, longest lasting. Daily drivers.\n• **Wet**: Maximum rain grip, specialized compound.\n\n**Tip**: Semi-slicks are the ultimate compromise — nearly slick grip with street legality.",
      actions: [],
      isQueryAnswer: true,
      followUp: "What compound should I install?",
    };
  }

  // General fallback
  return {
    message: `I can help with that! Here are some things I can explain:\n\n• **Engine**: layouts, aspiration, boost, compression, internals\n• **Chassis**: carbon tub vs aluminum vs steel\n• **Aero**: wing angles, diffuser, ground effect, drag\n• **Tires**: compounds, pressures, sizing\n• **Brakes**: materials, pads, bias\n• **Suspension**: springs, dampers, camber, anti-roll bars\n\nJust ask about any parameter and I'll give you the engineering details.`,
    actions: [],
    isQueryAnswer: true,
    followUp: "What would you like to know about?",
  };
}

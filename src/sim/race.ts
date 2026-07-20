import {
  TRACKS, TIRE_COMPOUNDS, DRIVER_SKILLS, WEATHER_TYPES, SUSPENSION_TYPES,
  HYBRID_DEPLOY_MODES, clamp,
} from "./constants";
import type {
  RaceConfig, RaceResult, LapRecord, CornerAnalysis, CompetitorResult,
  StrategySuggestion, VehicleDesign, SimResult, TrackId, WeatherType,
} from "./types";

const GRAVITY = 9.81;
const KMH_TO_MS = 1 / 3.6;

const AI_NAMES = [
  "R. Verstappen", "L. Hamilton", "C. Leclerc", "L. Norris", "F. Alonso",
  "O. Piastri", "C. Sainz", "G. Russell", "P. Gasly", "E. Ocon",
  "S. Perez", "V. Bottas", "K. Magnussen", "N. Hulkenberg", "Y. Tsunoda",
  "A. Albon", "L. Lawson", "D. Ricciardo", "M. Schumacher", "K. Raikkonen",
];
const CAR_COLORS = [
  "#0a3d62", "#7d1d1d", "#1e3a8a", "#155e44", "#5b1a5b",
  "#7c2d12", "#1c2933", "#3b2c5a", "#0e4d4d", "#4a1f1f",
];

// ===================================================================
// TIRE TEMPERATURE MODEL
// ===================================================================

function updateTireTemp(
  currentTemp: number, trackTemp: number, lateralG: number, speed: number,
  compound: typeof TIRE_COMPOUNDS[keyof typeof TIRE_COMPOUNDS],
  isWet: boolean, braking: number
): number {
  const optimal = compound.peakTemp;
  // Heat generation from lateral load and braking
  const lateralHeat = lateralG * lateralG * 8;
  const brakingHeat = braking * 3;
  const speedHeat = (speed / 200) * 5;
  // Cooling toward track temp
  const coolRate = isWet ? 0.15 : 0.08;
  const ambientEffect = (trackTemp - currentTemp) * coolRate;
  // Heat generation + ambient effect
  let newTemp = currentTemp + lateralHeat + brakingHeat + speedHeat + ambientEffect;
  // Tendency toward optimal when under load
  newTemp = newTemp * 0.9 + (optimal + (trackTemp - 20)) * 0.1;
  return Math.round(clamp(newTemp, 20, 160) * 10) / 10;
}

function tireTempGripFactor(temp: number, compound: typeof TIRE_COMPOUNDS[keyof typeof TIRE_COMPOUNDS]): number {
  const [low, high] = compound.tempRange;
  const optimal = compound.peakTemp;
  if (temp >= low && temp <= high) {
    // Near-peak grip
    const dist = Math.abs(temp - optimal) / (high - low) * 2;
    return clamp(1.0 - dist * 0.05, 0.92, 1.0);
  }
  if (temp < low) {
    // Cold tires — significant grip loss
    const coldness = (low - temp) / 30;
    return clamp(0.7 - coldness * 0.3, 0.3, 0.92);
  }
  // Overheated — grip loss + accelerated wear
  const overtemp = (temp - high) / 30;
  return clamp(0.85 - overtemp * 0.25, 0.3, 0.92);
}

// ===================================================================
// FUEL EFFICIENCY MODEL
// ===================================================================

function fuelStrategyMultiplier(strategy: string): { consumption: number; power: number; description: string } {
  switch (strategy) {
    case "lean":   return { consumption: 0.82, power: 0.92, description: "Lean mixture — saves fuel, reduces power ~8%" };
    case "balanced": return { consumption: 1.0, power: 1.0, description: "Balanced — optimal AF ratio" };
    case "rich":   return { consumption: 1.15, power: 1.03, description: "Rich mixture — more power, +15% fuel" };
    case "push":   return { consumption: 1.25, power: 1.05, description: "Push — max power, +25% fuel" };
    default:       return { consumption: 1.0, power: 1.0, description: "" };
  }
}

function estimateFuelPerLap(sim: SimResult, track: typeof TRACKS[TrackId], config: RaceConfig): number {
  if (sim.fuelEconomy === 0) return 0; // EV
  const strat = fuelStrategyMultiplier(config.fuelStrategy);
  const base = (track.length / 100) * sim.fuelEconomy;
  return base * strat.consumption * (1 + config.aggression * 0.1);
}

// ===================================================================
// TIRE WEAR MODEL
// ===================================================================

function estimateTireWearPerLap(
  sim: SimResult, track: typeof TRACKS[TrackId],
  tire: typeof TIRE_COMPOUNDS[keyof typeof TIRE_COMPOUNDS],
  config: RaceConfig, tireTemp: number
): number {
  const lateralLoad = sim.lateralG;
  const lengthFactor = track.length / 5;
  const compoundWear = tire.wearFactor;
  // Temperature affects wear — overheating accelerates it
  const tempWearMul = tireTemp > tire.tempRange[1]
    ? 1 + ((tireTemp - tire.tempRange[1]) / 30) * 2
    : tireTemp < tire.tempRange[0]
    ? 0.6 // cold tires wear slower but have less grip
    : 1.0;
  return clamp(
    compoundWear * 0.012 * lengthFactor * (1 + lateralLoad * 0.2) * (1 + config.aggression * 0.3) * tempWearMul,
    0.003, 0.2
  );
}

// ===================================================================
// HYBRID ENERGY MANAGEMENT
// ===================================================================

function simulateHybridLap(
  sim: SimResult, lapTime: number, isWet: boolean, config: RaceConfig,
  currentSOC: number
): { socAfter: number; energyDeployed: number; energyRecovered: number; powerBoost: number } {
  if (!sim.isHybrid && !sim.isElectric) {
    return { socAfter: currentSOC, energyDeployed: 0, energyRecovered: 0, powerBoost: 1.0 };
  }

  const deployMode = HYBRID_DEPLOY_MODES[config.hybridDeployMode] || HYBRID_DEPLOY_MODES.race;
  const usableEnergy = sim.batteryEnergy;

  // Energy available to deploy this lap
  const deployFraction = deployMode.deployRate;
  const energyToDeploy = Math.min(usableEnergy * deployFraction * currentSOC, usableEnergy * 0.3);
  const powerBoost = 1 + (energyToDeploy / Math.max(lapTime, 1)) * 0.5; // power boost factor

  // Energy recovery (braking + MGU-H if present)
  const brakingRecovery = sim.mguKPower > 0 ? sim.mguKPower * 0.15 * deployMode.regenRate : 0;
  const heatRecovery = sim.mguHPower > 0 ? sim.mguHPower * 0.1 : 0;
  const totalRecovery = (brakingRecovery + heatRecovery) * (isWet ? 1.2 : 1.0); // more braking in wet

  const energyRecovered = Math.min(totalRecovery, usableEnergy * (1 - currentSOC) * 2);

  let socAfter = currentSOC - (energyToDeploy / usableEnergy) + (energyRecovered / usableEnergy);
  socAfter = clamp(socAfter, 0, 1);

  return {
    socAfter: Math.round(socAfter * 100) / 100,
    energyDeployed: Math.round(energyToDeploy * 100) / 100,
    energyRecovered: Math.round(energyRecovered * 100) / 100,
    powerBoost: Math.round(powerBoost * 1000) / 1000,
  };
}

// ===================================================================
// STRATEGY SUGGESTIONS
// ===================================================================

function generateStrategySuggestions(
  result: RaceResult, design: VehicleDesign, sim: SimResult, config: RaceConfig
): StrategySuggestion[] {
  const suggestions: StrategySuggestion[] = [];
  const tire = TIRE_COMPOUNDS[design.vehicle.tireCompound];
  const track = TRACKS[config.trackId];

  // Tire suggestions
  if (result.tireWearEnd > 0.8) {
    suggestions.push({
      category: "tire", priority: "critical", title: "Tire wear critical",
      description: `Tires reached ${Math.round(result.tireWearEnd * 100)}% wear. Switch to a harder compound or plan additional pit stops.`,
      expectedGain: "Avoid tire blowout / DNF — 1-2 stops",
    });
  } else if (result.tireWearEnd > 0.6 && config.pitStrategy === "none") {
    suggestions.push({
      category: "tire", priority: "high", title: "Consider pit strategy",
      description: "Tires degraded significantly. Switch from 'No Stops' to 'Balanced' pit strategy.",
      expectedGain: "2-4 seconds per lap in final stint",
    });
  }

  // Tire temperature suggestions
  const avgTireTemp = result.lapRecords.length > 0
    ? result.lapRecords.reduce((s, l) => s + (l.tireTempFL + l.tireTempFR + l.tireTempRL + l.tireTempRR) / 4, 0) / result.lapRecords.length
    : 0;
  if (avgTireTemp < tire.tempRange[0]) {
    suggestions.push({
      category: "tire", priority: "high", title: "Tires too cold",
      description: `Avg tire temp ${Math.round(avgTireTemp)}°C is below optimal range (${tire.tempRange[0]}-${tire.tempRange[1]}°C). Use softer compound or lower tire pressure to generate heat faster.`,
      expectedGain: "3-5% grip improvement",
    });
  } else if (avgTireTemp > tire.tempRange[1]) {
    suggestions.push({
      category: "tire", priority: "high", title: "Tires overheating",
      description: `Avg tire temp ${Math.round(avgTireTemp)}°C exceeds optimal range (${tire.tempRange[0]}-${tire.tempRange[1]}°C). Consider harder compound, higher tire pressure, or reduce aggressive driving.`,
      expectedGain: "Reduce wear rate by 30-50%, improve late-stint pace",
    });
  }

  // Wet tires on dry track or vice versa
  const isWet = config.weather === "light_rain" || config.weather === "heavy_rain";
  if (isWet && design.vehicle.tireCompound !== "wet" && design.vehicle.tireCompound !== "intermediate") {
    suggestions.push({
      category: "tire", priority: "critical", title: "Wrong tire compound for conditions",
      description: "Running dry/slick tires in wet conditions. Switch to intermediate or wet compound immediately.",
      expectedGain: "Prevent aquaplaning — 5-15 seconds per lap",
    });
  }
  if (!isWet && (design.vehicle.tireCompound === "wet" || design.vehicle.tireCompound === "intermediate")) {
    suggestions.push({
      category: "tire", priority: "high", title: "Wet tires in dry conditions",
      description: "Wet/intermediate tires in dry conditions are overheating and wearing rapidly. Switch to slick or dry compound.",
      expectedGain: "3-8 seconds per lap",
    });
  }

  // Fuel suggestions
  if (result.fuelRemaining < 0 && !result.dnf) {
    suggestions.push({
      category: "fuel", priority: "critical", title: "Fuel runs out",
      description: "Car runs out of fuel before race end. Increase fuel load or use leaner fuel strategy.",
      expectedGain: "Finish the race",
    });
  }
  const fuelPerLap = result.fuelEfficiency;
  const totalFuelNeeded = fuelPerLap * config.laps;
  const fuelCapacity = 50 + sim.peakPower * 0.15;
  if (totalFuelNeeded > fuelCapacity && config.fuelStrategy !== "lean") {
    suggestions.push({
      category: "fuel", priority: "high", title: "Fuel strategy too rich",
      description: `Need ${totalFuelNeeded.toFixed(0)}L but capacity is ~${fuelCapacity.toFixed(0)}L. Switch to 'Lean' fuel strategy to save ${((1 - 0.82) * totalFuelNeeded).toFixed(0)}L.`,
      expectedGain: "Avoid fuel stop or DNF",
    });
  }
  if (sim.fuelEconomy > 0 && config.fuelStrategy === "push" && config.laps > 20) {
    suggestions.push({
      category: "fuel", priority: "medium", title: "Push strategy unsustainable",
      description: "Using 'Push' fuel strategy for a long race will require extra pit stops. Consider 'Balanced' or 'Lean'.",
      expectedGain: "Save 1 pit stop (~20 seconds)",
    });
  }

  // Hybrid/EV suggestions
  if (sim.isHybrid || sim.isElectric) {
    const finalSOC = result.lapRecords.length > 0 ? result.lapRecords[result.lapRecords.length - 1].batterySOC : 0;
    if (finalSOC > 0.5 && config.hybridDeployMode === "save") {
      suggestions.push({
        category: "hybrid", priority: "medium", title: "Battery underutilized",
        description: `Battery at ${Math.round(finalSOC * 100)}% SOC at race end. Switch from 'Save' to 'Race' or 'Attack' deploy mode for more power.`,
        expectedGain: "20-40 hp boost per lap",
      });
    }
    if (finalSOC < 0.1 && !sim.isElectric) {
      suggestions.push({
        category: "hybrid", priority: "high", title: "Battery depleted",
        description: "Battery fully depleted. Use 'Save' mode to recover energy, or increase regen level.",
        expectedGain: "Recover electric power for overtaking",
      });
    }
    if (sim.isHybrid && !design.engine.hasMguH && track.highSpeed) {
      suggestions.push({
        category: "hybrid", priority: "low", title: "Consider MGU-H",
        description: "High-speed track benefits from MGU-H exhaust energy recovery. Adding MGU-H could recover 15-30 kWh per stint.",
        expectedGain: "2-3% efficiency gain on high-speed tracks",
      });
    }
  }

  // Setup suggestions
  if (sim.coolingMargin < 0.3 && config.weather === "dry") {
    suggestions.push({
      category: "setup", priority: "high", title: "Cooling insufficient",
      description: "Engine cooling margin is low. Increase radiator size, cooling vents, or reduce boost pressure.",
      expectedGain: "Prevent overheating DNF",
    });
  }
  if (track.highSpeed && sim.downforce < 500) {
    suggestions.push({
      category: "setup", priority: "medium", title: "More downforce for high-speed track",
      description: `${track.name} is a high-speed circuit but downforce is only ${sim.downforce}N. Increase wing angle or add splitter/diffuser.`,
      expectedGain: "2-5% cornering speed improvement",
    });
  }
  if (!track.highSpeed && sim.downforce > 2000) {
    suggestions.push({
      category: "setup", priority: "medium", title: "Reduce downforce for technical track",
      description: `${track.name} is technical — excess downforce adds drag on shorter straights. Reduce wing angle.`,
      expectedGain: "3-8 km/h higher top speed",
    });
  }

  // Driver suggestions
  if (result.incidents.length > 2 && config.driverSkill === "rookie") {
    suggestions.push({
      category: "driver", priority: "medium", title: "Reduce driver aggression",
      description: `${result.incidents.length} incidents occurred. Lower AI aggression or upgrade driver skill to reduce mistakes.`,
      expectedGain: "Avoid 10-20 seconds of incident time",
    });
  }

  return suggestions.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
}

// ===================================================================
// MAIN RACE SIMULATION
// ===================================================================

export function simulateRace(design: VehicleDesign, sim: SimResult, config: RaceConfig): RaceResult {
  const tire = TIRE_COMPOUNDS[design.vehicle.tireCompound];
  const track = TRACKS[config.trackId];
  const driver = DRIVER_SKILLS[config.driverSkill];

  const baseLapTime = estimateBaseLap(sim, track, design);
  const fuelCapacity = clamp(50 + sim.peakPower * 0.15, 50, 180);
  const fuelPerLap = estimateFuelPerLap(sim, track, config);
  const initialFuel = fuelCapacity * config.fuelLoad;

  const competitors = generateCompetitors(config, baseLapTime);
  const gridPosition = estimateGridPosition(sim, competitors);

  const weatherPerLap: WeatherType[] = [];
  for (let l = 1; l <= config.laps; l++) {
    weatherPerLap.push(config.weather === "changing" && l >= config.weatherChangeLap ? config.weatherChangeTo : config.weather);
  }

  const laps: LapRecord[] = [];
  const incidents: { lap: number; type: string; description: string }[] = [];
  let fuel = initialFuel;
  let tireWear = 0;
  let tireTempFL = config.startingTireTemp;
  let tireTempFR = config.startingTireTemp;
  let tireTempRL = config.startingTireTemp;
  let tireTempRR = config.startingTireTemp;
  let batterySOC = sim.isHybrid || sim.isElectric ? 1.0 : 0;
  let pitStops = 0;
  let totalTimeLost = 0;
  let bestLap = Infinity;
  let bestLapNumber = 0;
  let totalTime = 0;
  let topSpeed = 0;
  let position = gridPosition;
  let dnf = false;
  let dnfReason: string | null = null;
  let energyRecoveredTotal = 0;
  let energyDeployedTotal = 0;
  let stintLap = 0;

  const pitLaps = planPitStops(config, estimateTireWearPerLap(sim, track, tire, config, tire.peakTemp));

  for (let lapNum = 1; lapNum <= config.laps; lapNum++) {
    const weather = weatherPerLap[lapNum - 1];
    const weatherData = WEATHER_TYPES[weather];
    const isWet = weather === "light_rain" || weather === "heavy_rain";
    const trackTemp = config.ambientTemp + weatherData.trackTempDelta;

    // Wrong tire compound penalty
    let compoundPenalty = 1.0;
    if (isWet && design.vehicle.tireCompound !== "wet" && design.vehicle.tireCompound !== "intermediate") {
      compoundPenalty = 0.7;
      if (lapNum > 2 && Math.random() < 0.01 * (weather === "heavy_rain" ? 3 : 1)) {
        incidents.push({ lap: lapNum, type: "off_track", description: "Driver aquaplaned off track on slick tires" });
      }
    }
    if (!isWet && (design.vehicle.tireCompound === "wet" || design.vehicle.tireCompound === "intermediate")) {
      compoundPenalty = 0.85;
    }

    // Tire temperature grip factor
    const avgTireTemp = (tireTempFL + tireTempFR + tireTempRL + tireTempRR) / 4;
    const tempGripFactor = tireTempGripFactor(avgTireTemp, tire);

    // Wear effect
    const wearGripFactor = clamp(1 - tireWear * 0.3, 0.7, 1.05);

    // Fuel weight effect
    const fuelWeightFactor = 1 - (fuel / fuelCapacity) * 0.03;

    // Driver consistency
    const consistencyVar = 1 + (1 - driver.consistencyFactor) * (Math.random() - 0.5) * 0.04;

    // Hybrid energy management
    const hybrid = simulateHybridLap(sim, baseLapTime, isWet, config, batterySOC);
    batterySOC = hybrid.socAfter;
    energyRecoveredTotal += hybrid.energyRecovered;
    energyDeployedTotal += hybrid.energyDeployed;

    // Pace
    const paceFactor = driver.paceFactor * compoundPenalty * tempGripFactor * wearGripFactor * fuelWeightFactor * consistencyVar * hybrid.powerBoost;
    const weatherGripFactor = weatherData.gripFactor * (1 - weatherData.downforceLoss * 0.3);
    const weatherTimeFactor = 1 / clamp(weatherGripFactor, 0.4, 1.0);

    let lapTime = baseLapTime * (2 - paceFactor) * weatherTimeFactor;

    // Tire degradation
    const degPenalty = tireWear > 0.6 ? (tireWear - 0.6) * 8 : 0;
    lapTime += degPenalty;

    // Mistake risk
    if (Math.random() < driver.mistakeRisk * (isWet ? 2 : 1) * config.aggression) {
      if (Math.random() > 0.8) {
        incidents.push({ lap: lapNum, type: "spin", description: "Driver spun and lost significant time" });
        lapTime += 8 + Math.random() * 12;
      } else {
        lapTime += 1 + Math.random() * 3;
      }
    }

    // Mechanical failure
    const mechFailureRisk = (1 - sim.reliability) * 0.003 * config.laps * 0.3 *
      (1 + (1 - sim.coolingMargin) * 2) * config.aggression;
    if (Math.random() < mechFailureRisk && lapNum > 3) {
      const failureTypes = ["Engine overheated", "Gearbox failure", "Brake failure", "Suspension failure", "Electrical fault", "Turbo failure"];
      dnfReason = failureTypes[Math.floor(Math.random() * failureTypes.length)];
      dnf = true;
      incidents.push({ lap: lapNum, type: "mechanical", description: dnfReason + " — retired" });
      break;
    }

    // Pit stop
    let pitted = false;
    if (pitLaps.includes(lapNum) && (fuel < fuelPerLap * 2 || tireWear > 0.5)) {
      pitted = true;
      pitStops++;
      const pitTime = 18 + Math.random() * 8;
      totalTimeLost += pitTime;
      lapTime += pitTime;
      const fuelToAdd = Math.min(fuelCapacity - fuel, fuelPerLap * (config.laps - lapNum + 1));
      fuel += fuelToAdd * 0.9;
      tireWear = 0;
      stintLap = 0;
      // Tires come on cold
      tireTempFL = tireTempFR = tireTempRL = tireTempRR = 40;
    }

    stintLap++;
    totalTime += lapTime;
    if (lapTime < bestLap) { bestLap = lapTime; bestLapNumber = lapNum; }

    // Update tire temperatures per corner
    const lapTopSpeed = estimateLapTopSpeed(sim, track, weather);
    const brakingIntensity = 0.5 + config.aggression * 0.3;
    tireTempFL = updateTireTemp(tireTempFL, trackTemp, sim.lateralG * 0.9, lapTopSpeed, tire, isWet, brakingIntensity);
    tireTempFR = updateTireTemp(tireTempFR, trackTemp, sim.lateralG * 0.95, lapTopSpeed, tire, isWet, brakingIntensity);
    tireTempRL = updateTireTemp(tireTempRL, trackTemp, sim.lateralG * 1.0, lapTopSpeed, tire, isWet, brakingIntensity * 0.8);
    tireTempRR = updateTireTemp(tireTempRR, trackTemp, sim.lateralG * 1.05, lapTopSpeed, tire, isWet, brakingIntensity * 0.8);

    if (lapTopSpeed > topSpeed) topSpeed = lapTopSpeed;

    // Fuel consumption
    fuel -= fuelPerLap * weatherData.fuelConsumptionMul;
    if (fuel < 0 && !sim.isElectric) {
      dnf = true; dnfReason = "Out of fuel";
      incidents.push({ lap: lapNum, type: "fuel", description: "Ran out of fuel" });
      break;
    }

    // Tire wear (temperature-dependent)
    const tireWearThisLap = estimateTireWearPerLap(sim, track, tire, config, avgTireTemp);
    tireWear += tireWearThisLap * weatherData.tireWearMul;
    if (tireWear > 1.0 && !pitLaps.includes(lapNum + 1)) {
      if (Math.random() < (tireWear - 1.0) * 0.05) {
        incidents.push({ lap: lapNum, type: "tire", description: "Tire blowout from excessive wear" });
        dnf = true; dnfReason = "Tire blowout";
        break;
      }
      tireWear = Math.min(tireWear, 1.2);
    }

    // EV battery depletion
    if (sim.isElectric && batterySOC < 0.05) {
      dnf = true; dnfReason = "Battery depleted";
      incidents.push({ lap: lapNum, type: "battery", description: "Battery depleted — no charge remaining" });
      break;
    }

    position = updatePosition(position, lapTime, competitors, config, driver);

    laps.push({
      lap: lapNum, time: Math.round(lapTime * 1000) / 1000,
      fuel: Math.round(fuel * 10) / 10, batterySOC,
      tireWearFL: Math.round(tireWear * 100) / 100, tireWearFR: Math.round(tireWear * 100) / 100,
      tireWearRL: Math.round(tireWear * 100) / 100, tireWearRR: Math.round(tireWear * 100) / 100,
      tireTempFL: Math.round(tireTempFL), tireTempFR: Math.round(tireTempFR),
      tireTempRL: Math.round(tireTempRL), tireTempRR: Math.round(tireTempRR),
      brakeTemp: Math.round(200 + (sim.weight / 1500) * 100 + config.aggression * 80),
      waterTemp: Math.round(85 + (sim.peakPower / 500) * 15 - weatherData.coolingBonus * 20),
      oilTemp: Math.round(95 + (sim.peakPower / 500) * 10),
      topSpeed: lapTopSpeed, avgSpeed: Math.round((track.length / (lapTime / 3600)) * 10) / 10,
      pitted, position, stintLap,
      energyRecovered: hybrid.energyRecovered, energyDeployed: hybrid.energyDeployed,
    });
  }

  // Final classification
  const finalCompetitors: CompetitorResult[] = competitors.map((c) => {
    const cTotalTime = c.basePace * config.laps + c.pitTimeLost;
    const cBestLap = c.basePace * (0.97 + Math.random() * 0.03);
    const retired = Math.random() < (1 - c.reliability) * 0.02;
    return {
      position: 0, name: c.name,
      totalTime: retired ? cTotalTime * 0.7 : cTotalTime,
      bestLap: Math.round(cBestLap * 1000) / 1000,
      laps: retired ? Math.floor(config.laps * 0.7) : config.laps,
      pitted: c.pitStops > 0, retired, gapToLeader: 0, carColor: c.color,
    };
  });

  const ourCar: CompetitorResult = {
    position: 0, name: "You", totalTime, bestLap: Math.round(bestLap * 1000) / 1000,
    laps: laps.length, pitted: pitStops > 0, retired: dnf, gapToLeader: 0, carColor: "#22d3ee",
  };

  const allCars = [...finalCompetitors, ourCar];
  allCars.sort((a, b) => {
    if (a.retired && b.retired) return b.laps - a.laps || a.totalTime - b.totalTime;
    if (a.retired) return 1;
    if (b.retired) return -1;
    return a.totalTime - b.totalTime;
  });
  allCars.forEach((c, i) => {
    c.position = i + 1;
    c.gapToLeader = i === 0 ? 0 : Math.round((c.totalTime - allCars[0].totalTime) * 10) / 10;
  });

  const finalPosition = ourCar.position;
  const positionsGained = gridPosition - finalPosition;
  const corners = analyzeCorners(sim, track, design);

  // Management scores
  const avgTireTempFinal = laps.length > 0
    ? laps.reduce((s, l) => s + (l.tireTempFL + l.tireTempFR + l.tireTempRL + l.tireTempRR) / 4, 0) / laps.length
    : 0;
  const tireTempStable = avgTireTempFinal >= tire.tempRange[0] && avgTireTempFinal <= tire.tempRange[1] + 10;
  const tireManagementScore = clamp(Math.round(100 - tireWear * 50 + (tireTempStable ? 20 : -20)), 0, 100);
  const fuelManagementScore = sim.isElectric ? 100 : clamp(Math.round(
    (Math.max(0, fuel) / initialFuel) * 50 + 50
  ), 0, 100);

  const score = computeScore(finalPosition, config.fieldSize + 1, bestLap, baseLapTime, dnf, positionsGained, incidents.length);

  const partialResult: RaceResult = {
    config, trackId: config.trackId, trackName: track.name,
    totalTime: Math.round(totalTime * 1000) / 1000, laps: laps.length,
    bestLap: Math.round(bestLap * 1000) / 1000, bestLapNumber, avgLap: laps.length > 0 ? Math.round((totalTime / laps.length) * 1000) / 1000 : 0,
    fuelUsed: Math.round((initialFuel - fuel) * 10) / 10, fuelRemaining: Math.round(fuel * 10) / 10,
    pitStops, totalTimeLost: Math.round(totalTimeLost * 10) / 10, tireWearEnd: Math.round(tireWear * 100) / 100,
    finalPosition, gridPosition, positionsGained, lapRecords: laps, corners, competitors: allCars,
    weatherPerLap, incidents, dnf, dnfReason, topSpeed,
    avgSpeed: laps.length > 0 ? Math.round((track.length * laps.length / (totalTime / 3600)) * 10) / 10 : 0,
    score, suggestions: [], fuelEfficiency: fuelPerLap,
    energyRecoveredTotal: Math.round(energyRecoveredTotal * 10) / 10,
    energyDeployedTotal: Math.round(energyDeployedTotal * 10) / 10,
    tireTempStable, tireManagementScore, fuelManagementScore,
  };

  partialResult.suggestions = generateStrategySuggestions(partialResult, design, sim, config);
  return partialResult;
}

function estimateBaseLap(sim: SimResult, track: typeof TRACKS[TrackId], design: VehicleDesign): number {
  const tire = TIRE_COMPOUNDS[design.vehicle.tireCompound];
  const susF = SUSPENSION_TYPES[design.vehicle.suspensionFront];
  const susR = SUSPENSION_TYPES[design.vehicle.suspensionRear];
  const susAvg = (susF.gripFactor + susR.gripFactor) / 2;
  let total = 0;
  for (const seg of track.segments) {
    if (seg.type === "straight") {
      const target = Math.min(sim.topSpeed, sim.topSpeed * (0.6 + 0.4 * clamp(seg.length / 1000, 0.1, 1)));
      const avg = target * 0.72;
      total += (seg.length / 1000) / (avg / 3.6) * 3600;
    } else {
      const radius = seg.length;
      const aeroG = sim.downforce / (sim.weight * GRAVITY) * tire.gripFactor * (track.highSpeed ? 1 : 0.7);
      const latG = clamp(tire.gripFactor * susAvg + aeroG, 0.6, 3.5);
      const vMax = Math.sqrt(latG * GRAVITY * radius);
      const arcDist = (seg.arc / 360) * 2 * Math.PI * radius;
      total += arcDist / vMax;
    }
  }
  return total;
}

function generateCompetitors(config: RaceConfig, baseLapTime: number) {
  const comps = [];
  for (let i = 0; i < config.fieldSize; i++) {
    const paceOffset = (Math.random() - 0.4) * 0.08;
    comps.push({
      name: AI_NAMES[i % AI_NAMES.length],
      color: CAR_COLORS[i % CAR_COLORS.length],
      basePace: baseLapTime * (1 + paceOffset),
      reliability: 0.85 + Math.random() * 0.13,
      pitStops: config.pitStrategy === "none" ? 0 : Math.ceil(config.laps / 25),
      pitTimeLost: (config.pitStrategy === "none" ? 0 : Math.ceil(config.laps / 25)) * (20 + Math.random() * 10),
    });
  }
  return comps;
}

function estimateGridPosition(sim: SimResult, competitors: ReturnType<typeof generateCompetitors>): number {
  const powerToWeight = sim.peakPower / (sim.weight / 1000);
  const ourSpeedScore = powerToWeight + sim.lateralG * 100 + sim.topSpeed * 0.5;
  const aiSpeedScores = competitors.map(() => 200 + Math.random() * 300);
  const allScores = [...aiSpeedScores, ourSpeedScore];
  allScores.sort((a, b) => b - a);
  return allScores.indexOf(ourSpeedScore) + 1;
}

function planPitStops(config: RaceConfig, tireWearPerLap: number): number[] {
  if (config.pitStrategy === "none") return [];
  const stops: number[] = [];
  const tireLife = 1 / tireWearPerLap;
  const factor = config.pitStrategy === "conservative" ? 0.7 : config.pitStrategy === "balanced" ? 0.6 : 0.5;
  const stopInterval = Math.floor(tireLife * factor);
  for (let l = stopInterval; l < config.laps; l += stopInterval) stops.push(l);
  return stops;
}

function updatePosition(
  currentPos: number, ourLapTime: number,
  competitors: ReturnType<typeof generateCompetitors>,
  config: RaceConfig, driver: typeof DRIVER_SKILLS[keyof typeof DRIVER_SKILLS]
): number {
  const aiAvgPace = competitors.reduce((s, c) => s + c.basePace, 0) / competitors.length;
  if (ourLapTime < aiAvgPace && currentPos > 1) {
    const overtakeChance = (aiAvgPace - ourLapTime) / aiAvgPace * driver.paceFactor * config.aggression * 0.3;
    if (Math.random() < overtakeChance) return Math.max(1, currentPos - 1);
  } else if (ourLapTime > aiAvgPace && currentPos < competitors.length + 1) {
    if (Math.random() < (ourLapTime - aiAvgPace) / ourLapTime * 0.4) return currentPos + 1;
  }
  return currentPos;
}

function estimateLapTopSpeed(sim: SimResult, track: typeof TRACKS[TrackId], weather: WeatherType): number {
  const longestStraight = Math.max(...track.segments.filter((s) => s.type === "straight").map((s) => s.length));
  const speedFrac = clamp(longestStraight / 1500, 0.5, 1);
  return Math.round(sim.topSpeed * speedFrac * (0.8 + WEATHER_TYPES[weather].gripFactor * 0.2));
}

function analyzeCorners(sim: SimResult, track: typeof TRACKS[TrackId], design: VehicleDesign): CornerAnalysis[] {
  const tire = TIRE_COMPOUNDS[design.vehicle.tireCompound];
  const susF = SUSPENSION_TYPES[design.vehicle.suspensionFront];
  const susR = SUSPENSION_TYPES[design.vehicle.suspensionRear];
  const susAvg = (susF.gripFactor + susR.gripFactor) / 2;
  const results: CornerAnalysis[] = [];
  for (const seg of track.segments) {
    if (seg.type === "straight") {
      const entrySpeed = Math.min(sim.topSpeed, sim.topSpeed * (0.6 + 0.4 * clamp(seg.length / 1000, 0.1, 1)));
      results.push({ index: results.length, type: "straight", entrySpeed: Math.round(entrySpeed), apexSpeed: Math.round(entrySpeed * 0.95), exitSpeed: Math.round(entrySpeed), lateralG: 0, brakingZone: 0, duration: Math.round((seg.length / (entrySpeed * KMH_TO_MS)) * 100) / 100 });
    } else {
      const radius = seg.length;
      const aeroG = sim.downforce / (sim.weight * GRAVITY) * tire.gripFactor;
      const latG = clamp(tire.gripFactor * susAvg + aeroG, 0.6, 3.5);
      const vMax = Math.sqrt(latG * GRAVITY * radius);
      const vMaxKmh = vMax * 3.6;
      const arcDist = (seg.arc / 360) * 2 * Math.PI * radius;
      results.push({ index: results.length, type: "corner", entrySpeed: Math.round(vMaxKmh * 0.9), apexSpeed: Math.round(vMaxKmh), exitSpeed: Math.round(vMaxKmh * 0.85), lateralG: Math.round(latG * 100) / 100, brakingZone: Math.max(0, Math.round((vMaxKmh * vMaxKmh - (vMaxKmh * 0.9) ** 2) / (200 * latG))), duration: Math.round((arcDist / vMax) * 100) / 100 });
    }
  }
  return results;
}

function computeScore(position: number, fieldSize: number, bestLap: number, baseLap: number, dnf: boolean, positionsGained: number, incidents: number): number {
  let score = 100;
  score -= ((position - 1) / fieldSize) * 40;
  if (dnf) score -= 30;
  score += positionsGained * 3;
  score -= incidents * 4;
  if (bestLap < baseLap) score += 5;
  return clamp(Math.round(score), 0, 100);
}

export function defaultRaceConfig(trackId: TrackId): RaceConfig {
  return {
    trackId, laps: 10, weather: "dry", weatherChangeLap: 5, weatherChangeTo: "light_rain",
    driverSkill: "pro", aggression: 0.6, fieldSize: 9,
    pitStrategy: "balanced", fuelLoad: 1.0, fuelStrategy: "balanced", tireStrategy: "single",
    hybridDeployMode: "race", startingTireTemp: 70, trackTemp: 30, ambientTemp: 22,
  };
}

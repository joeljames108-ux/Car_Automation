/**
 * EXTREME CLIMATE & ACCELERATED DURABILITY TESTING ENGINE (UNIT_07)
 * 
 * Simulates:
 * 1. Arctic Cold Cell (-40°C): Cold-start lubrication, battery retention, windshield defrost
 * 2. Desert Thermal Cell (+50°C): Radiator thermal margin, vapor lock risk, AC pull-down
 * 3. Monsoon Chamber: High-pressure seal ingress, optical condensation, IP67 electrical integrity
 * 4. 100,000 km 7-Post Shaker: Suspension fatigue, chassis seam durability, weld micro-cracking
 */

export interface TestVehicleSpec {
  id: string;
  name: string;
  powertrainType: "ice" | "hybrid" | "bev";
  engineCoolingCapacityW: number;
  oilViscosityGrade: "0w20" | "5w30" | "10w40" | "20w50";
  batteryCapacityKwh: number;
  hasBatteryThermalManagement: boolean;
  radiatorSurfaceAreaM2: number;
  airConditioningKw: number;
  cabinVolumeM3: number;
  chassisTorsionalRigidityNmDeg: number;
  suspensionBushingMaterial: "rubber" | "polyurethane" | "spherical_bearing";
  chassisMaterial: "mild_steel" | "high_strength_steel" | "aluminum_unibody" | "carbon_tub";
  weatherstripQuality: "standard_epdm" | "dual_lip_automotive" | "acoustic_triple_seal";
}

export interface ArcticTestResult {
  passed: boolean;
  ambientTempC: number;
  coldCrankTimeSeconds: number;
  oilFlowDelaySeconds: number;
  batteryCapacityRetentionPct: number;
  defrostTimeMinutes: number;
  engineBlockFreezeRisk: boolean;
  deficiencies: string[];
}

export interface DesertTestResult {
  passed: boolean;
  ambientTempC: number;
  peakCoolantTempC: number;
  coolantBoiloverRisk: boolean;
  vaporLockRiskPct: number;
  acPullDownTimeMinutes: number; // 60°C -> 22°C
  thermalMarginC: number;
  deficiencies: string[];
}

export interface MonsoonTestResult {
  passed: boolean;
  waterSprayPressureBar: number;
  sealWaterIngressDetected: boolean;
  headlampCondensationDetected: boolean;
  electricalShortCircuitRisk: boolean;
  ingressProtectionRating: string;
  deficiencies: string[];
}

export interface ShakerDurabilityResult {
  passed: boolean;
  equivalentRoadMileageKm: number; // 100,000 km standard
  chassisFatigueLifeCycles: number;
  bushingDegradationPct: number;
  weldMicroCrackingDetected: boolean;
  structuralRigidityRetentionPct: number;
  recommendedReinforcements: string[];
}

export interface FullDurabilityReport {
  vehicleId: string;
  overallScore: number; // 0-100
  allChambersPassed: boolean;
  earnedValidationMileageKm: number;
  arctic: ArcticTestResult;
  desert: DesertTestResult;
  monsoon: MonsoonTestResult;
  shaker: ShakerDurabilityResult;
}

export class ClimateAndDurabilityEngine {
  /**
   * 1. ARCTIC COLD CHAMBER (-40°C)
   */
  public static testArcticCell(vehicle: TestVehicleSpec): ArcticTestResult {
    const ambientTempC = -40;
    const deficiencies: string[] = [];

    // Cold crank & lubrication flow based on oil viscosity grade
    let coldCrankTimeSeconds = 2.5;
    let oilFlowDelaySeconds = 1.2;

    if (vehicle.oilViscosityGrade === "20w50") {
      coldCrankTimeSeconds = 14.5;
      oilFlowDelaySeconds = 9.8;
      deficiencies.push("High 20W-50 oil viscosity severely impairs cold-start starter motor crank.");
    } else if (vehicle.oilViscosityGrade === "10w40") {
      coldCrankTimeSeconds = 6.2;
      oilFlowDelaySeconds = 4.1;
    } else if (vehicle.oilViscosityGrade === "5w30") {
      coldCrankTimeSeconds = 3.5;
      oilFlowDelaySeconds = 2.0;
    } else {
      coldCrankTimeSeconds = 2.1;
      oilFlowDelaySeconds = 1.1;
    }

    // Battery capacity retention at -40°C
    let batteryCapacityRetentionPct = vehicle.powertrainType === "bev" ? 42 : 55;
    if (vehicle.hasBatteryThermalManagement) {
      batteryCapacityRetentionPct += 28; // Actively warmed battery
    } else if (vehicle.powertrainType === "bev") {
      deficiencies.push("Unconditioned EV battery loses over 55% usable range in arctic conditions.");
    }

    // Windshield defrost time (SAE J902 target: < 20 min)
    const defrostTimeMinutes = vehicle.powertrainType === "bev" ? 8.5 : 14.0;
    if (defrostTimeMinutes > 20) {
      deficiencies.push("Windshield defrosting exceeds SAE J902 maximum time limit.");
    }

    const engineBlockFreezeRisk = vehicle.powertrainType !== "bev" && oilFlowDelaySeconds > 6.0;
    const passed = deficiencies.length === 0;

    return {
      passed,
      ambientTempC,
      coldCrankTimeSeconds,
      oilFlowDelaySeconds,
      batteryCapacityRetentionPct,
      defrostTimeMinutes,
      engineBlockFreezeRisk,
      deficiencies,
    };
  }

  /**
   * 2. DESERT THERMAL CHAMBER (+50°C)
   */
  public static testDesertCell(vehicle: TestVehicleSpec): DesertTestResult {
    const ambientTempC = 50;
    const deficiencies: string[] = [];

    // Peak coolant temperature under 100% full-throttle load
    // Required cooling: ~120-180 kW for typical ICE under heavy desert towing
    const coolingDeficit = Math.max(0, 150000 - vehicle.engineCoolingCapacityW);
    const peakCoolantTempC = Math.round(92 + (coolingDeficit / 3000));
    const thermalMarginC = Math.round(118 - peakCoolantTempC);

    const coolantBoiloverRisk = peakCoolantTempC >= 115;
    if (coolantBoiloverRisk) {
      deficiencies.push(`Coolant temperature peaked at ${peakCoolantTempC}°C (exceeds 115°C boiling threshold under pressure).`);
    }

    // Fuel vapor lock risk in hot fuel rails
    let vaporLockRiskPct = 5;
    if (vehicle.powertrainType === "ice" && peakCoolantTempC > 105) {
      vaporLockRiskPct = 45;
      deficiencies.push("Elevated engine bay temps induce fuel rail vaporization and engine hesitation.");
    }

    // AC pull-down from 60°C cabin heat soak to 22°C (target: < 15 minutes)
    const pullDownFactor = vehicle.cabinVolumeM3 / Math.max(2.5, vehicle.airConditioningKw);
    const acPullDownTimeMinutes = Math.round(pullDownFactor * 10 * 10) / 10;
    if (acPullDownTimeMinutes > 15) {
      deficiencies.push(`HVAC pull-down takes ${acPullDownTimeMinutes} min (exceeds 15-minute cabin comfort limit).`);
    }

    const passed = deficiencies.length === 0;

    return {
      passed,
      ambientTempC,
      peakCoolantTempC,
      coolantBoiloverRisk,
      vaporLockRiskPct,
      acPullDownTimeMinutes,
      thermalMarginC,
      deficiencies,
    };
  }

  /**
   * 3. MONSOON HIGH-PRESSURE WATER INGRESS CHAMBER
   */
  public static testMonsoonChamber(vehicle: TestVehicleSpec): MonsoonTestResult {
    const waterSprayPressureBar = 100; // 100-bar industrial monsoon deluge
    const deficiencies: string[] = [];

    let sealWaterIngressDetected = false;
    let headlampCondensationDetected = false;
    let electricalShortCircuitRisk = false;
    let ingressProtectionRating = "IP65";

    if (vehicle.weatherstripQuality === "standard_epdm") {
      sealWaterIngressDetected = true;
      headlampCondensationDetected = true;
      ingressProtectionRating = "IP54";
      deficiencies.push("Water penetrated A-pillar and door perimeter under 100-bar monsoon pressure.");
    } else if (vehicle.weatherstripQuality === "dual_lip_automotive") {
      ingressProtectionRating = "IP66";
      sealWaterIngressDetected = false;
      headlampCondensationDetected = false;
    } else {
      ingressProtectionRating = "IP67";
      sealWaterIngressDetected = false;
      headlampCondensationDetected = false;
    }

    const passed = !sealWaterIngressDetected && !headlampCondensationDetected;

    return {
      passed,
      waterSprayPressureBar,
      sealWaterIngressDetected,
      headlampCondensationDetected,
      electricalShortCircuitRisk,
      ingressProtectionRating,
      deficiencies,
    };
  }

  /**
   * 4. 100,000 KM 7-POST ACCELERATED DURABILITY SHAKER RIG
   */
  public static testShakerDurability(vehicle: TestVehicleSpec): ShakerDurabilityResult {
    const equivalentRoadMileageKm = 100000;
    const recommendedReinforcements: string[] = [];

    // Rigidity & Material Fatigue Life
    // Carbon tub: millions of cycles, no yield fatigue
    // Aluminum: stress fatigue if rigidity < 22,000 Nm/deg
    // Mild steel: fatigue if rigidity < 16,000 Nm/deg
    let weldMicroCrackingDetected = false;
    let structuralRigidityRetentionPct = 96;
    let chassisFatigueLifeCycles = 1200000;

    if (vehicle.chassisTorsionalRigidityNmDeg < 15000) {
      weldMicroCrackingDetected = true;
      structuralRigidityRetentionPct = 78;
      chassisFatigueLifeCycles = 340000;
      recommendedReinforcements.push("Add front strut tower brace and gusseted rear suspension subframe nodes.");
    } else if (vehicle.chassisTorsionalRigidityNmDeg < 25000) {
      structuralRigidityRetentionPct = 89;
      chassisFatigueLifeCycles = 850000;
    } else {
      structuralRigidityRetentionPct = 98;
      chassisFatigueLifeCycles = 2500000;
    }

    // Suspension Bushing Degradation
    let bushingDegradationPct = 12;
    if (vehicle.suspensionBushingMaterial === "rubber") {
      bushingDegradationPct = 34; // standard rubber dry-rots & softens
    } else if (vehicle.suspensionBushingMaterial === "polyurethane") {
      bushingDegradationPct = 14;
    } else {
      bushingDegradationPct = 8; // Spherical bearings stay precise
    }

    const passed = !weldMicroCrackingDetected && structuralRigidityRetentionPct >= 85;

    return {
      passed,
      equivalentRoadMileageKm,
      chassisFatigueLifeCycles,
      bushingDegradationPct,
      weldMicroCrackingDetected,
      structuralRigidityRetentionPct,
      recommendedReinforcements,
    };
  }

  /**
   * Full Durability Suite Orchestration
   */
  public static runFullDurabilitySuite(vehicle: TestVehicleSpec): FullDurabilityReport {
    const arctic = this.testArcticCell(vehicle);
    const desert = this.testDesertCell(vehicle);
    const monsoon = this.testMonsoonChamber(vehicle);
    const shaker = this.testShakerDurability(vehicle);

    const allChambersPassed = arctic.passed && desert.passed && monsoon.passed && shaker.passed;

    let overallScore = 100;
    if (!arctic.passed) overallScore -= 20;
    if (!desert.passed) overallScore -= 25;
    if (!monsoon.passed) overallScore -= 20;
    if (!shaker.passed) overallScore -= 30;

    // Mileage earned toward field validation
    let earnedValidationMileageKm = 10000;
    if (shaker.passed) earnedValidationMileageKm += 70000;
    if (arctic.passed) earnedValidationMileageKm += 10000;
    if (desert.passed) earnedValidationMileageKm += 10000;

    return {
      vehicleId: vehicle.id,
      overallScore: Math.max(10, overallScore),
      allChambersPassed,
      earnedValidationMileageKm,
      arctic,
      desert,
      monsoon,
      shaker,
    };
  }
}

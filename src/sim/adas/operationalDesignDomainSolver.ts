// ============================================================================
// PHASE 99 — AUTONOMOUS VEHICLE ODD & SAE LEVEL CLASSIFICATION SOLVER
// ============================================================================
// ISO 26262 ASIL-D & SAE J3016 autonomous driving operational domain solver.
// Evaluates Operational Design Domain (ODD) boundaries, SAE Level 0-5 classification,
// Minimal Risk Condition (MRC) / Minimal Risk Maneuver (MRM) fallback state machine,
// and Driver Monitoring System (DMS) attention/takeover readiness metrics.
// ============================================================================

export type SaeAutonomyLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_2_PLUS' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';

export type WeatherCondition = 'CLEAR_SUNNY' | 'OVERCAST' | 'LIGHT_RAIN' | 'HEAVY_RAIN' | 'DENSE_FOG' | 'SNOW_BLIZZARD' | 'HAIL';
export type RoadEnvironmentType = 'CONTROLLED_HIGHWAY' | 'URBAN_ARTERIAL' | 'RESIDENTIAL_STREET' | 'RURAL_UNMARKED' | 'RACE_TRACK' | 'PARKING_STRUCTURE';
export type SurfaceFrictionCondition = 'DRY_ASPHALT' | 'WET_TARMAC' | 'STANDING_WATER_HYDROPLANING' | 'SNOW_PACKED' | 'BLACK_ICE';

export type FallbackState = 'NORMAL_AUTONOMOUS_OPERATING' | 'TAKEOVER_REQUEST_ISSUED' | 'MINIMAL_RISK_MANEUVER_IN_PROGRESS' | 'MINIMAL_RISK_CONDITION_ACHIEVED' | 'EMERGENCY_STOP_CONTROLLED';

export interface OddBoundaryParameters {
  maxAllowableSpeedKmh: number;
  minLaneWidthM: number;
  minForwardVisibilityM: number;
  minRoadFrictionCoefficientMu: number;
  maxCrosswindSpeedKmh: number;
  maxPrecipitationRateMmPerHour: number;
  isGeofencedHighwayOnly: boolean;
  requiresHighDefinitionMap: boolean;
  requiresDmsHandsOnDetection: boolean;
}

export interface DriverMonitoringState {
  gazeOnRoadDurationSec: number;
  perclosFatigueMetricPct: number; // Percentage of eye closure over time (< 15% is alert)
  handsOnSteeringWheelDetected: boolean;
  headPoseYawDeg: number;
  driverTakeoverReadinessScorePct: number; // 0 to 100%
  driverTakeoverTimeBudgetSec: number; // Available reaction window before MRM
}

export interface OddEvaluationResult {
  isWithinDesignDomain: boolean;
  violations: string[];
  operationalConfidenceScorePct: number;
  weatherFrictionIndex: number;
  visibilityIndex: number;
  mapConfidenceIndex: number;
}

export interface AutonomousOddSystemState {
  configuredSaeLevel: SaeAutonomyLevel;
  activeOperationalLevel: SaeAutonomyLevel;
  oddStatus: OddEvaluationResult;
  dmsStatus: DriverMonitoringState;
  fallbackState: FallbackState;
  fallbackTargetDecelerationG: number;
  fallbackSafePullOverLane: 'CURRENT_LANE' | 'EMERGENCY_SHOULDER' | 'SLOW_LANE' | 'IMMEDIATE_STOP';
  timeUntilMrcArrivalSec: number;
  asilSafetyIntegrityLevel: 'ASIL_B' | 'ASIL_C' | 'ASIL_D';
  isSafeForAutonomousOperation: boolean;
}

export class OperationalDesignDomainSolver {
  /**
   * Defines standard ODD envelopes for each SAE autonomy level.
   */
  public static getSaeLevelOddProfile(level: SaeAutonomyLevel): OddBoundaryParameters {
    switch (level) {
      case 'LEVEL_0':
      case 'LEVEL_1':
        return {
          maxAllowableSpeedKmh: 250,
          minLaneWidthM: 2.2,
          minForwardVisibilityM: 10,
          minRoadFrictionCoefficientMu: 0.15,
          maxCrosswindSpeedKmh: 90,
          maxPrecipitationRateMmPerHour: 50,
          isGeofencedHighwayOnly: false,
          requiresHighDefinitionMap: false,
          requiresDmsHandsOnDetection: false,
        };
      case 'LEVEL_2':
      case 'LEVEL_2_PLUS':
        return {
          maxAllowableSpeedKmh: 140,
          minLaneWidthM: 2.75,
          minForwardVisibilityM: 50,
          minRoadFrictionCoefficientMu: 0.45,
          maxCrosswindSpeedKmh: 65,
          maxPrecipitationRateMmPerHour: 20,
          isGeofencedHighwayOnly: false,
          requiresHighDefinitionMap: false,
          requiresDmsHandsOnDetection: true,
        };
      case 'LEVEL_3':
        return {
          maxAllowableSpeedKmh: 130,
          minLaneWidthM: 3.0,
          minForwardVisibilityM: 80,
          minRoadFrictionCoefficientMu: 0.60,
          maxCrosswindSpeedKmh: 50,
          maxPrecipitationRateMmPerHour: 10,
          isGeofencedHighwayOnly: true,
          requiresHighDefinitionMap: true,
          requiresDmsHandsOnDetection: false, // Eyes-off permitted during Level 3
        };
      case 'LEVEL_4':
        return {
          maxAllowableSpeedKmh: 110,
          minLaneWidthM: 2.85,
          minForwardVisibilityM: 70,
          minRoadFrictionCoefficientMu: 0.50,
          maxCrosswindSpeedKmh: 60,
          maxPrecipitationRateMmPerHour: 15,
          isGeofencedHighwayOnly: true,
          requiresHighDefinitionMap: true,
          requiresDmsHandsOnDetection: false,
        };
      case 'LEVEL_5':
        return {
          maxAllowableSpeedKmh: 200,
          minLaneWidthM: 2.4,
          minForwardVisibilityM: 25,
          minRoadFrictionCoefficientMu: 0.20,
          maxCrosswindSpeedKmh: 80,
          maxPrecipitationRateMmPerHour: 40,
          isGeofencedHighwayOnly: false,
          requiresHighDefinitionMap: true,
          requiresDmsHandsOnDetection: false,
        };
    }
  }

  /**
   * Evaluates if current vehicle and environmental state complies with the Operational Design Domain.
   */
  public static evaluateOdd(params: {
    targetLevel: SaeAutonomyLevel;
    vehicleSpeedKmh: number;
    weather: WeatherCondition;
    roadType: RoadEnvironmentType;
    surfaceFriction: SurfaceFrictionCondition;
    forwardVisibilityM: number;
    precipitationMmPerHour: number;
    crosswindSpeedKmh: number;
    laneWidthM: number;
    hdMapAvailable: boolean;
    hdMapLocalizationAccuracyCm: number;
  }): OddEvaluationResult {
    const profile = this.getSaeLevelOddProfile(params.targetLevel);
    const violations: string[] = [];

    // 1. Friction & Weather analysis
    const muEstimates: Record<SurfaceFrictionCondition, number> = {
      DRY_ASPHALT: 0.95,
      WET_TARMAC: 0.70,
      STANDING_WATER_HYDROPLANING: 0.35,
      SNOW_PACKED: 0.28,
      BLACK_ICE: 0.12,
    };
    const currentMu = muEstimates[params.surfaceFriction];
    if (currentMu < profile.minRoadFrictionCoefficientMu) {
      violations.push(`Surface friction (${currentMu.toFixed(2)}) below minimum required (${profile.minRoadFrictionCoefficientMu.toFixed(2)})`);
    }

    // 2. Speed limit compliance
    if (params.vehicleSpeedKmh > profile.maxAllowableSpeedKmh) {
      violations.push(`Vehicle speed (${params.vehicleSpeedKmh} km/h) exceeds ODD ceiling (${profile.maxAllowableSpeedKmh} km/h)`);
    }

    // 3. Visibility and Precipitation
    if (params.forwardVisibilityM < profile.minForwardVisibilityM) {
      violations.push(`Forward visibility (${params.forwardVisibilityM}m) below threshold (${profile.minForwardVisibilityM}m)`);
    }
    if (params.precipitationMmPerHour > profile.maxPrecipitationRateMmPerHour) {
      violations.push(`Precipitation rate (${params.precipitationMmPerHour} mm/h) exceeds limit (${profile.maxPrecipitationRateMmPerHour} mm/h)`);
    }

    // 4. Wind limits
    if (params.crosswindSpeedKmh > profile.maxCrosswindSpeedKmh) {
      violations.push(`Crosswind (${params.crosswindSpeedKmh} km/h) exceeds aerodynamic threshold (${profile.maxCrosswindSpeedKmh} km/h)`);
    }

    // 5. Geofencing & HD Map
    if (profile.isGeofencedHighwayOnly && params.roadType !== 'CONTROLLED_HIGHWAY') {
      violations.push(`Road type [${params.roadType}] outside geofenced highway domain`);
    }
    if (profile.requiresHighDefinitionMap) {
      if (!params.hdMapAvailable) {
        violations.push('High-Definition map telemetry unavailable');
      } else if (params.hdMapLocalizationAccuracyCm > 15.0) {
        violations.push(`HD map localization error (${params.hdMapLocalizationAccuracyCm} cm) exceeds 15cm ASIL-D threshold`);
      }
    }

    // Lane width verification
    if (params.laneWidthM < profile.minLaneWidthM) {
      violations.push(`Lane width (${params.laneWidthM}m) too narrow (min ${profile.minLaneWidthM}m)`);
    }

    // Synthesize Confidence Metrics
    const weatherFrictionIndex = Math.max(0, Math.min(1.0, currentMu / 0.95));
    const visibilityIndex = Math.max(0, Math.min(1.0, params.forwardVisibilityM / 150.0));
    const mapConfidenceIndex = params.hdMapAvailable ? Math.max(0, 1.0 - params.hdMapLocalizationAccuracyCm / 30.0) : 0.0;

    const baseScore = 100 - violations.length * 22;
    const operationalConfidence = Math.max(0, Math.min(100, baseScore * ((weatherFrictionIndex + visibilityIndex + (params.hdMapAvailable ? mapConfidenceIndex : 1.0)) / 3)));

    return {
      isWithinDesignDomain: violations.length === 0,
      violations,
      operationalConfidenceScorePct: Math.round(operationalConfidence * 10) / 10,
      weatherFrictionIndex: Math.round(weatherFrictionIndex * 100) / 100,
      visibilityIndex: Math.round(visibilityIndex * 100) / 100,
      mapConfidenceIndex: Math.round(mapConfidenceIndex * 100) / 100,
    };
  }

  /**
   * Evaluates Driver Monitoring System (DMS) attention, fatigue, and takeover budget.
   */
  public static evaluateDriverMonitoring(params: {
    gazeVectorPitchDeg: number;
    gazeVectorYawDeg: number;
    eyeClosureDurationMs: number;
    frameWindowDurationMs?: number;
    steeringWheelCapacitiveHandsOn: boolean;
    steeringWheelTorqueSensorNm: number;
    timeSinceLastRoadGazeSec: number;
  }): DriverMonitoringState {
    const windowMs = params.frameWindowDurationMs || 60000; // 1-minute analysis window
    const perclos = Math.min(100, (params.eyeClosureDurationMs / windowMs) * 100);

    const isLookingAtRoad = Math.abs(params.gazeVectorYawDeg) <= 18.0 && Math.abs(params.gazeVectorPitchDeg) <= 12.0;
    const handsOn = params.steeringWheelCapacitiveHandsOn || Math.abs(params.steeringWheelTorqueSensorNm) > 0.35;

    // Driver readiness score synthesis (0 - 100%)
    let readinessScore = 100.0;
    if (!isLookingAtRoad) {
      readinessScore -= Math.min(60, params.timeSinceLastRoadGazeSec * 15.0);
    }
    if (perclos > 15.0) {
      readinessScore -= (perclos - 15.0) * 2.0; // Fatigue penalty
    }
    if (!handsOn) {
      readinessScore -= 20.0;
    }
    readinessScore = Math.max(0, Math.min(100, readinessScore));

    // Dynamic Takeover Time Budget (ISO 21448 SOTIF: Level 3 handover requires 10 - 15s safe window)
    const timeBudgetSec = readinessScore > 75 ? 12.5 : readinessScore > 40 ? 7.5 : 4.0;

    return {
      gazeOnRoadDurationSec: isLookingAtRoad ? 1.0 : 0.0,
      perclosFatigueMetricPct: Math.round(perclos * 10) / 10,
      handsOnSteeringWheelDetected: handsOn,
      headPoseYawDeg: Math.round(params.gazeVectorYawDeg * 10) / 10,
      driverTakeoverReadinessScorePct: Math.round(readinessScore * 10) / 10,
      driverTakeoverTimeBudgetSec: timeBudgetSec,
    };
  }

  /**
   * Main Autonomous ODD State Machine orchestrating SAE Levels, ODD monitoring,
   * Takeover Requests (TOR), and Minimal Risk Maneuvers (MRM).
   */
  public static processAutonomousState(params: {
    configuredLevel: SaeAutonomyLevel;
    vehicleSpeedKmh: number;
    weather: WeatherCondition;
    roadType: RoadEnvironmentType;
    surfaceFriction: SurfaceFrictionCondition;
    forwardVisibilityM: number;
    precipitationMmPerHour: number;
    crosswindSpeedKmh: number;
    laneWidthM: number;
    hdMapAvailable: boolean;
    hdMapLocalizationAccuracyCm: number;
    dmsGazeYawDeg: number;
    dmsGazePitchDeg: number;
    dmsEyeClosureMs: number;
    dmsHandsOnDetected: boolean;
    dmsTorqueNm: number;
    timeSinceRoadGazeSec: number;
    currentFallbackState?: FallbackState;
    elapsedMrmDurationSec?: number;
  }): AutonomousOddSystemState {
    // 1. Evaluate ODD Boundaries
    const oddResult = this.evaluateOdd({
      targetLevel: params.configuredLevel,
      vehicleSpeedKmh: params.vehicleSpeedKmh,
      weather: params.weather,
      roadType: params.roadType,
      surfaceFriction: params.surfaceFriction,
      forwardVisibilityM: params.forwardVisibilityM,
      precipitationMmPerHour: params.precipitationMmPerHour,
      crosswindSpeedKmh: params.crosswindSpeedKmh,
      laneWidthM: params.laneWidthM,
      hdMapAvailable: params.hdMapAvailable,
      hdMapLocalizationAccuracyCm: params.hdMapLocalizationAccuracyCm,
    });

    // 2. Evaluate DMS
    const dmsResult = this.evaluateDriverMonitoring({
      gazeVectorPitchDeg: params.dmsGazePitchDeg,
      gazeVectorYawDeg: params.dmsGazeYawDeg,
      eyeClosureDurationMs: params.dmsEyeClosureMs,
      steeringWheelCapacitiveHandsOn: params.dmsHandsOnDetected,
      steeringWheelTorqueSensorNm: params.dmsTorqueNm,
      timeSinceLastRoadGazeSec: params.timeSinceRoadGazeSec,
    });

    // 3. Fallback and MRM State Machine
    let currentFallback = params.currentFallbackState || 'NORMAL_AUTONOMOUS_OPERATING';
    let targetDecelG = 0.0;
    let safePullOver: 'CURRENT_LANE' | 'EMERGENCY_SHOULDER' | 'SLOW_LANE' | 'IMMEDIATE_STOP' = 'CURRENT_LANE';
    let activeLevel = params.configuredLevel;
    let timeUntilMrc = 0.0;

    const profile = this.getSaeLevelOddProfile(params.configuredLevel);

    if (!oddResult.isWithinDesignDomain || (profile.requiresDmsHandsOnDetection && !dmsResult.handsOnSteeringWheelDetected)) {
      if (params.configuredLevel === 'LEVEL_3' || params.configuredLevel === 'LEVEL_2_PLUS') {
        if (dmsResult.driverTakeoverReadinessScorePct < 30 || params.timeSinceRoadGazeSec > dmsResult.driverTakeoverTimeBudgetSec) {
          // Driver failed to take over -> Execute Minimal Risk Maneuver (MRM)
          currentFallback = 'MINIMAL_RISK_MANEUVER_IN_PROGRESS';
          targetDecelG = 0.35; // Gentle 0.35g controlled deceleration
          safePullOver = params.roadType === 'CONTROLLED_HIGHWAY' ? 'EMERGENCY_SHOULDER' : 'SLOW_LANE';
          activeLevel = 'LEVEL_0';
          const mrmElapsed = params.elapsedMrmDurationSec || 0;
          timeUntilMrc = Math.max(0, 10.0 - mrmElapsed);
          if (timeUntilMrc <= 0 || params.vehicleSpeedKmh < 1.0) {
            currentFallback = 'MINIMAL_RISK_CONDITION_ACHIEVED';
            targetDecelG = 0.50; // Hold brakes at standstill
          }
        } else {
          currentFallback = 'TAKEOVER_REQUEST_ISSUED';
          targetDecelG = 0.08; // Mild throttle easing
        }
      } else if (params.configuredLevel === 'LEVEL_4' || params.configuredLevel === 'LEVEL_5') {
        // High autonomy self-mitigates directly to MRC without human reliance
        currentFallback = 'MINIMAL_RISK_MANEUVER_IN_PROGRESS';
        targetDecelG = 0.28;
        safePullOver = 'EMERGENCY_SHOULDER';
        timeUntilMrc = Math.max(0, 15.0 - (params.elapsedMrmDurationSec || 0));
        if (timeUntilMrc <= 0 || params.vehicleSpeedKmh < 1.0) {
          currentFallback = 'MINIMAL_RISK_CONDITION_ACHIEVED';
        }
      } else {
        // Level 1 / Level 2 drop immediately to manual control
        currentFallback = 'TAKEOVER_REQUEST_ISSUED';
        activeLevel = 'LEVEL_0';
      }
    } else {
      currentFallback = 'NORMAL_AUTONOMOUS_OPERATING';
    }

    const asilLevel: 'ASIL_B' | 'ASIL_C' | 'ASIL_D' =
      params.configuredLevel === 'LEVEL_4' || params.configuredLevel === 'LEVEL_5' || params.configuredLevel === 'LEVEL_3'
        ? 'ASIL_D'
        : params.configuredLevel === 'LEVEL_2_PLUS' || params.configuredLevel === 'LEVEL_2'
        ? 'ASIL_C'
        : 'ASIL_B';

    return {
      configuredSaeLevel: params.configuredLevel,
      activeOperationalLevel: activeLevel,
      oddStatus: oddResult,
      dmsStatus: dmsResult,
      fallbackState: currentFallback,
      fallbackTargetDecelerationG: targetDecelG,
      fallbackSafePullOverLane: safePullOver,
      timeUntilMrcArrivalSec: Math.round(timeUntilMrc * 10) / 10,
      asilSafetyIntegrityLevel: 'ASIL_D',
      isSafeForAutonomousOperation: currentFallback === 'NORMAL_AUTONOMOUS_OPERATING',
    };
  }

  /**
   * High-level convenience evaluation for Digital Twin and telemetry dashboards.
   */
  public static evaluateAutonomousDomain(params: {
    vehicleSpeedKmh?: number;
    targetLevel?: SaeAutonomyLevel;
    currentWeather?: WeatherCondition;
    currentRoad?: RoadEnvironmentType;
    currentSurface?: SurfaceFrictionCondition;
    laneWidthM?: number;
    forwardVisibilityM?: number;
    precipitationRateMmHr?: number;
    crosswindKmh?: number;
    hasHdMapCoverage?: boolean;
    gnssRtkFixType?: string;
    cameraOcclusionPct?: number;
    radarInterferencePct?: number;
    lidarPointDensityDegradationPct?: number;
    driverGazeOnRoadSec?: number;
    driverPerclosPct?: number;
    driverHandsOnWheel?: boolean;
  } = {}): AutonomousOddSystemState {
    return this.processAutonomousState({
      configuredLevel: params.targetLevel || 'LEVEL_3',
      vehicleSpeedKmh: params.vehicleSpeedKmh ?? 110,
      weather: params.currentWeather || 'CLEAR_SUNNY',
      roadType: params.currentRoad || 'CONTROLLED_HIGHWAY',
      surfaceFriction: params.currentSurface || 'DRY_ASPHALT',
      forwardVisibilityM: params.forwardVisibilityM ?? 300,
      precipitationMmPerHour: params.precipitationRateMmHr ?? 0,
      crosswindSpeedKmh: params.crosswindKmh ?? 15,
      laneWidthM: params.laneWidthM ?? 3.65,
      hdMapAvailable: params.hasHdMapCoverage ?? true,
      hdMapLocalizationAccuracyCm: 5.0,
      dmsGazeYawDeg: 0.0,
      dmsGazePitchDeg: 0.0,
      dmsEyeClosureMs: (params.driverPerclosPct ?? 5) * 10,
      dmsHandsOnDetected: params.driverHandsOnWheel ?? true,
      dmsTorqueNm: 2.5,
      timeSinceRoadGazeSec: params.driverGazeOnRoadSec ?? 0.0,
    });
  }
}

// ============================================================================
// CORNER-BY-CORNER ANALYSIS ENGINE — UNDERSTEER/OVERSTEER/DRAG DETECTION
// ============================================================================
// Simulates each corner on a circuit with the user's actual car parameters,
// detecting understeer, oversteer, aerodynamic limitations, brake problems,
// and generating actionable engineering recommendations.
// ============================================================================

import { CIRCUIT_DATABASE, CornerData, TrackLayout } from '../track/circuitDatabase';

export interface CarSetupParameters {
  frontWingAngle: number;     // degrees (0-15)
  rearWingAngle: number;      // degrees (0-15)
  frontSpringRate: number;    // N/mm
  rearSpringRate: number;     // N/mm
  frontAntiRollBar: number;   // 1-10
  rearAntiRollBar: number;    // 1-10
  rideHeightFront: number;    // mm
  rideHeightRear: number;     // mm
  differentialLock: number;   // 0-100%
  brakeBias: number;          // front % (50-65)
  tireCompound: 'soft' | 'medium' | 'hard' | 'wet' | 'intermediate';
  tireWidthFront: number;     // mm (200-350)
  tireWidthRear: number;      // mm (200-350)
  weight: number;             // kg
  weightDistribution: number; // front % (40-60)
  power: number;              // hp
  dragCoefficient: number;    // Cd (0.25-0.45)
  downforceCoefficient: number; // Cl (negative = downforce)
  frontalArea: number;        // m2
}

export interface CornerAnalysisResult {
  cornerNumber: number;
  cornerName: string;
  cornerType: string;
  entrySpeed: number;
  apexSpeed: number;
  exitSpeed: number;
  simulatedApexSpeed: number;
  speedDelta: number;           // positive = faster than reference
  lateralG: number;
  longitudinalG: number;
  brakingG: number;
  issue: 'none' | 'understeer' | 'oversteer' | 'brake_instability' | 'drag_limited' | 'traction_limited' | 'aero_deficiency';
  issueSeverity: 'none' | 'minor' | 'moderate' | 'severe';
  issueDescription: string;
  recommendations: string[];
  downforceAtCorner: number;    // Newtons
  tireLoadFL: number;
  tireLoadFR: number;
  tireLoadRL: number;
  tireLoadRR: number;
}

export interface TrackAnalysisReport {
  trackId: string;
  trackName: string;
  corners: CornerAnalysisResult[];
  overallLapTimeDelta: number;  // vs reference
  topSpeedDelta: number;
  majorIssues: string[];
  overallRecommendations: string[];
}

// Tire grip coefficients by compound
const TIRE_GRIP: Record<string, number> = {
  soft: 1.15,
  medium: 1.0,
  hard: 0.90,
  wet: 0.65,
  intermediate: 0.78,
};

export class CornerAnalysisEngine {

  /**
   * Analyze all corners on a given track with the user's car setup
   */
  public static analyzeTrack(
    trackId: string,
    car: CarSetupParameters
  ): TrackAnalysisReport {
    const track = CIRCUIT_DATABASE[trackId];
    if (!track) {
      return {
        trackId, trackName: 'Unknown', corners: [],
        overallLapTimeDelta: 0, topSpeedDelta: 0,
        majorIssues: [], overallRecommendations: [],
      };
    }

    const corners = track.corners.map(c =>
      CornerAnalysisEngine.analyzeCorner(c, car)
    );

    const majorIssues = corners
      .filter(c => c.issueSeverity === 'moderate' || c.issueSeverity === 'severe')
      .map(c => `Turn ${c.cornerNumber} (${c.cornerName}): ${c.issueDescription}`);

    const overallRecommendations = CornerAnalysisEngine.generateOverallRecommendations(corners, car);

    const avgDelta = corners.reduce((s, c) => s + c.speedDelta, 0) / corners.length;

    return {
      trackId: track.id,
      trackName: track.name,
      corners,
      overallLapTimeDelta: avgDelta * 0.15, // rough lap time impact
      topSpeedDelta: avgDelta,
      majorIssues,
      overallRecommendations,
    };
  }

  /**
   * Analyze a single corner with the user's car parameters
   */
  public static analyzeCorner(
    corner: CornerData,
    car: CarSetupParameters
  ): CornerAnalysisResult {
    const tireGrip = TIRE_GRIP[car.tireCompound] || 1.0;

    // Calculate total downforce at corner speed
    const cornerAvgSpeed = (corner.entrySpeed + corner.apexSpeed + corner.exitSpeed) / 2;
    const speedMs = cornerAvgSpeed / 3.6;
    const airDensity = 1.225;
    const downforce = 0.5 * airDensity * car.downforceCoefficient * car.frontalArea * speedMs * speedMs;

    // Calculate mechanical grip from tires
    const tireContactPatch = (car.tireWidthFront + car.tireWidthRear) / 2;
    const mechanicalGrip = tireContactPatch * 0.001 * tireGrip * 2.8;

    // Total lateral grip (downforce adds to tire load)
    const vehicleWeight = car.weight * 9.81;
    const totalVerticalLoad = vehicleWeight + Math.abs(downforce);
    const maxLateralG = (mechanicalGrip + downforce / totalVerticalLoad * 2.5);

    // Simulate corner entry, apex, exit speeds
    const referenceApexSpeed = corner.apexSpeed;
    let simulatedApexSpeed = referenceApexSpeed;

    // Understeer detection: front grip vs rear grip balance
    const frontGrip = car.tireWidthFront * tireGrip * (1 + car.frontWingAngle * 0.03);
    const rearGrip = car.tireWidthRear * tireGrip * (1 + car.rearWingAngle * 0.03);
    const gripBalance = frontGrip / rearGrip;

    let issue: CornerAnalysisResult['issue'] = 'none';
    let severity: CornerAnalysisResult['issueSeverity'] = 'none';
    let description = '';
    const recommendations: string[] = [];

    // === UNDERSTEER DETECTION ===
    if (gripBalance < 0.85 && corner.type !== 'hairpin') {
      // Front grip deficient
      const speedLoss = (0.85 - gripBalance) * referenceApexSpeed * 0.3;
      simulatedApexSpeed -= speedLoss;
      issue = 'understeer';
      severity = speedLoss > 15 ? 'severe' : speedLoss > 8 ? 'moderate' : 'minor';
      description = `Understeer detected — front grip deficient by ${Math.round((1 - gripBalance / 0.85) * 100)}%`;
      recommendations.push('Increase front wing angle by 1-2 degrees');
      recommendations.push('Reduce front tire pressure by 2-3 PSI');
      if (car.frontAntiRollBar > 6) recommendations.push('Soften front anti-roll bar');
      if (car.weightDistribution > 52) recommendations.push('Shift weight forward 1-2%');
    }

    // === OVERSTEER DETECTION ===
    if (gripBalance > 1.2 || (car.differentialLock < 40 && corner.type === 'slow')) {
      const speedLoss = (gripBalance - 1.0) * referenceApexSpeed * 0.2;
      simulatedApexSpeed -= speedLoss;
      issue = 'oversteer';
      severity = speedLoss > 12 ? 'severe' : speedLoss > 6 ? 'moderate' : 'minor';
      description = `Oversteer detected — rear grip ${gripBalance > 1.2 ? 'insufficient' : 'overwhelmed by low diff lock'}`;
      if (car.rearWingAngle < 8) recommendations.push('Increase rear wing angle by 1-2 degrees');
      if (car.differentialLock < 50) recommendations.push('Increase differential lock to 60-70%');
      if (car.rearAntiRollBar > 7) recommendations.push('Soften rear anti-roll bar');
      recommendations.push('Increase rear tire width by 10-20mm');
    }

    // === BRAKE INSTABILITY ===
    if (car.brakeBias > 60 && corner.type === 'slow') {
      const brakingPenalty = (car.brakeBias - 58) * 0.5;
      simulatedApexSpeed -= brakingPenalty;
      if (issue === 'none') {
        issue = 'brake_instability';
        severity = brakingPenalty > 5 ? 'moderate' : 'minor';
        description = `Brake bias too far forward (${car.brakeBias}%) — rear locking on slow corners`;
        recommendations.push('Shift brake bias rearward to 56-58%');
      }
    }

    // === AERO DEFICIENCY ===
    if (corner.type === 'very_fast' && car.downforceCoefficient > -2.0) {
      const aeroLoss = (2.0 - Math.abs(car.downforceCoefficient)) * referenceApexSpeed * 0.08;
      simulatedApexSpeed -= aeroLoss;
      if (issue === 'none') {
        issue = 'aero_deficiency';
        severity = aeroLoss > 10 ? 'severe' : aeroLoss > 5 ? 'moderate' : 'minor';
        description = `Insufficient downforce for high-speed corner (${Math.abs(car.downforceCoefficient).toFixed(1)} Cl)`;
        recommendations.push('Increase front and rear wing angles for high-speed stability');
      }
    }

    const speedDelta = simulatedApexSpeed - referenceApexSpeed;
    const speedRatio = simulatedApexSpeed / Math.max(1, referenceApexSpeed);
    const lateralG = maxLateralG * speedRatio;
    const brakingG = (car.brakeBias / 100) * 1.5;
    const longitudinalG = (car.power / Math.max(1, car.weight)) * 0.8;

    return {
      cornerNumber: corner.number,
      cornerName: corner.name,
      cornerType: corner.type,
      entrySpeed: Math.round(corner.entrySpeed * speedRatio),
      apexSpeed: corner.apexSpeed,
      exitSpeed: Math.round(corner.exitSpeed * speedRatio),
      simulatedApexSpeed: Math.round(simulatedApexSpeed),
      speedDelta: parseFloat(speedDelta.toFixed(1)),
      lateralG: parseFloat(Math.abs(lateralG).toFixed(2)),
      longitudinalG: parseFloat(longitudinalG.toFixed(2)),
      brakingG: parseFloat(brakingG.toFixed(2)),
      issue,
      issueSeverity: severity,
      issueDescription: description || 'Cornering performance within optimal envelope',
      recommendations: recommendations.length > 0 ? recommendations : ['Corner setup optimal'],
      downforceAtCorner: Math.round(Math.abs(downforce)),
      tireLoadFL: Math.round(totalVerticalLoad * 0.25),
      tireLoadFR: Math.round(totalVerticalLoad * 0.25),
      tireLoadRL: Math.round(totalVerticalLoad * 0.25),
      tireLoadRR: Math.round(totalVerticalLoad * 0.25),
    };
  }

  /**
   * Aggregate overall circuit recommendations based on individual corner deficits
   */
  public static generateOverallRecommendations(
    corners: CornerAnalysisResult[],
    _car: CarSetupParameters
  ): string[] {
    const understeerCount = corners.filter(c => c.issue === 'understeer').length;
    const oversteerCount = corners.filter(c => c.issue === 'oversteer').length;
    const aeroDefCount = corners.filter(c => c.issue === 'aero_deficiency').length;
    const brakeCount = corners.filter(c => c.issue === 'brake_instability').length;

    const recs: string[] = [];
    if (understeerCount > 2) {
      recs.push(`Circuit exhibits persistent understeer across ${understeerCount} corners: consider increasing front wing angle and softening front roll bar.`);
    }
    if (oversteerCount > 2) {
      recs.push(`Circuit exhibits high oversteer across ${oversteerCount} corners: increase rear wing angle and rear differential lock.`);
    }
    if (aeroDefCount > 1) {
      recs.push(`High-speed sweepers require higher downforce package (+2-4° rear wing).`);
    }
    if (brakeCount > 1) {
      recs.push(`Braking instability detected: shift brake bias towards 56-58% front.`);
    }
    if (recs.length === 0) {
      recs.push('Vehicle dynamic balance is well suited for this circuit layout.');
    }
    return recs;
  }
}

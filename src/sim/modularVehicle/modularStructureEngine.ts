// ============================================================================
// MODULAR VEHICLE STRUCTURE ENGINE & 3D MULTI-NODE TELEMETRY SOLVER
// ============================================================================
// Calculates:
// - Hierarchical subsystem node masses & 3D Center of Mass offsets
// - Global Center of Gravity (Xcg, Ycg, Zcg) relative to front axle datum
// - Sprung vs Unsprung mass breakdown
// - Front/Rear and Left/Right weight distribution percentages
// - Individual 4-corner tire normal loads (FL, FR, RL, RR) & cross-weight (FL+RR %)
// - Front and Rear Roll Center heights, Pitch Axis, and Yaw Moment of Inertia (Izz)
// - Structural Torsional Rigidity (kNm/deg) & Bending Stiffness
// - FEA Stress Tensors & Hotspots across chassis hardpoints under multi-G load cases
// ============================================================================

import { Chassis50Definition, ChassisArchitectureClass, VehicleSubsystemStage } from '../../exterior3d/types/vehicleConstructionTypes';
import { MaterialGrade } from '../assemblyTypes';

export interface ModularSubsystemNode {
  id: string;
  name: string;
  category: 'structural' | 'chassis' | 'suspension' | 'unsprung' | 'powertrain' | 'cabin' | 'aero';
  stage: VehicleSubsystemStage;
  baseMassKg: number;
  // Local 3D coordinate offset (X = longitudinal fore/aft relative to front axle, Y = vertical height, Z = lateral left/right)
  localCoM: { x: number; y: number; z: number };
  isUnsprung: boolean;
  materialGrade: MaterialGrade;
  structuralStiffnessNmDeg: number;
  description: string;
  childNodeIds?: string[];
}

export interface FeaStressHotspot {
  nodeId: string;
  name: string;
  location: { x: number; y: number; z: number };
  vonMisesStressMpa: number;
  yieldStrengthMpa: number;
  safetyFactor: number;
  severity: 'nominal' | 'elevated' | 'critical';
  dominantLoadCase: 'torsional_shear' | 'vertical_bump_3g' | 'lateral_cornering_2g' | 'longitudinal_braking_2g';
}

export interface ModularStructureTelemetry {
  totalMassKg: number;
  sprungMassKg: number;
  unsprungMassKg: number;
  centerOfGravity: {
    xMm: number; // Longitudinal distance aft of front axle (0 = front axle, -wb = rear axle)
    yMm: number; // Vertical height above ground datum
    zMm: number; // Lateral offset from centerline (0 = centered)
  };
  weightDistribution: {
    frontPercent: number;
    rearPercent: number;
    leftPercent: number;
    rightPercent: number;
    crossWeightPercent: number; // (FL + RR) / Total * 100%
  };
  cornerLoadsKg: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  cornerForcesN: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  kinematics: {
    frontRollCenterHeightMm: number;
    rearRollCenterHeightMm: number;
    rollAxisInclinationDeg: number;
    yawMomentOfInertiaIzz: number; // kg*m^2
    pitchMomentOfInertiaIyy: number; // kg*m^2
  };
  structuralRigidity: {
    torsionalStiffnessKNmDeg: number;
    bendingStiffnessKNm: number;
    chassisTorsionalFrequencyHz: number;
    rigidityGrade: 'Formula 1 Spec' | 'Le Mans Hypercar' | 'Competition GT3' | 'Ultra High Performance' | 'Sport Chassis' | 'Standard Production';
    chassisSafetyRating: number; // 1-100
  };
  feaHotspots: FeaStressHotspot[];
  nodes: ModularSubsystemNode[];
}

export type ModularStructureResult = ModularStructureTelemetry;

// Material density & strength multipliers relative to standard cast steel
const MATERIAL_GRADE_FACTORS: Record<MaterialGrade, { massMult: number; stiffnessMult: number; yieldMpa: number }> = {
  cast: { massMult: 1.05, stiffnessMult: 0.90, yieldMpa: 310 },
  forged: { massMult: 0.88, stiffnessMult: 1.35, yieldMpa: 650 },
  billet: { massMult: 0.82, stiffnessMult: 1.50, yieldMpa: 720 },
  titanium: { massMult: 0.58, stiffnessMult: 1.80, yieldMpa: 980 },
  ceramic: { massMult: 0.42, stiffnessMult: 2.20, yieldMpa: 1250 },
};

// Base torsional rigidity by chassis architecture class
const ARCHITECTURE_BASE_RIGIDITY: Record<ChassisArchitectureClass, { baseTorsionKNmDeg: number; baseBendingKNm: number }> = {
  f1_prepreg_monocoque: { baseTorsionKNmDeg: 62.0, baseBendingKNm: 48.0 },
  carbon_composite_monocell: { baseTorsionKNmDeg: 48.5, baseBendingKNm: 39.0 },
  tubular_spaceframe: { baseTorsionKNmDeg: 28.0, baseBendingKNm: 24.5 },
  hydroformed_spaceframe: { baseTorsionKNmDeg: 34.0, baseBendingKNm: 29.0 },
  skateboard_ev_platform: { baseTorsionKNmDeg: 42.0, baseBendingKNm: 38.0 },
  aluminum_monocoque: { baseTorsionKNmDeg: 36.5, baseBendingKNm: 31.0 },
  steel_unibody: { baseTorsionKNmDeg: 26.0, baseBendingKNm: 22.0 },
  hybrid_cast_extruded: { baseTorsionKNmDeg: 38.0, baseBendingKNm: 33.0 },
  transaxle_backbone: { baseTorsionKNmDeg: 31.0, baseBendingKNm: 27.0 },
  heavy_duty_ladder_frame: { baseTorsionKNmDeg: 19.5, baseBendingKNm: 28.0 },
};

const structureCache = new Map<string, ModularStructureTelemetry>();
const MAX_STRUCTURE_CACHE = 60;

export class ModularStructureEngine {
  /**
   * Solves all mass, center of gravity, corner load, kinematics, and FEA stress metrics
   * across the modular vehicle subsystem hierarchy.
   */
  public static solveStructure(
    chassis: Chassis50Definition,
    installedStages: VehicleSubsystemStage[],
    materialGrades: Record<VehicleSubsystemStage, MaterialGrade>,
    wheelbaseMm: number,
    trackWidthFrontMm: number,
    trackWidthRearMm: number,
    rideHeightMm: number
  ): ModularStructureTelemetry {
    const gradesKey = Object.entries(materialGrades || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
    const stagesKey = (installedStages || []).slice().sort().join(",");
    const cacheKey = `${chassis?.id || "chassis"}_${stagesKey}_${gradesKey}_${wheelbaseMm}_${trackWidthFrontMm}_${trackWidthRearMm}_${rideHeightMm}`;

    if (structureCache.has(cacheKey)) {
      return structureCache.get(cacheKey)!;
    }

    const wbM = wheelbaseMm / 1000;
    const tfM = trackWidthFrontMm / 1000;
    const trM = trackWidthRearMm / 1000;
    const rhM = rideHeightMm / 1000;

    const frontAxleX = 0.45; // Front axle datum
    const rearAxleX = frontAxleX - wbM;
    const halfTf = tfM / 2;
    const halfTr = trM / 2;

    // 1. Synthesize all active subsystem nodes
    const nodes = this.generateSubsystemNodes(
      chassis,
      installedStages,
      materialGrades,
      frontAxleX,
      rearAxleX,
      halfTf,
      halfTr,
      rhM
    );

    // 2. Compute Total Mass, Sprung/Unsprung Mass, and 3D Center of Gravity (CoG)
    let totalMassKg = 0;
    let sprungMassKg = 0;
    let unsprungMassKg = 0;

    let sumMX = 0;
    let sumMY = 0;
    let sumMZ = 0;

    for (const node of nodes) {
      const matInfo = MATERIAL_GRADE_FACTORS[node.materialGrade] || MATERIAL_GRADE_FACTORS.forged;
      const actualMass = node.baseMassKg * matInfo.massMult;

      totalMassKg += actualMass;
      if (node.isUnsprung) {
        unsprungMassKg += actualMass;
      } else {
        sprungMassKg += actualMass;
      }

      sumMX += actualMass * node.localCoM.x;
      sumMY += actualMass * node.localCoM.y;
      sumMZ += actualMass * node.localCoM.z;
    }

    // Safety fallback
    if (totalMassKg <= 0) totalMassKg = 1200;

    const cogX = sumMX / totalMassKg;
    const cogY = sumMY / totalMassKg;
    const cogZ = sumMZ / totalMassKg;

    // Distance of CoG from front axle (negative in datum coordinate system)
    const distFromFrontAxle = Math.abs(frontAxleX - cogX);
    const rearWeightRatio = Math.max(0.2, Math.min(0.8, distFromFrontAxle / wbM));
    const frontWeightRatio = 1.0 - rearWeightRatio;

    const frontPercent = frontWeightRatio * 100;
    const rearPercent = rearWeightRatio * 100;

    // Left / Right lateral balance based on lateral CoG offset
    const avgTrack = (tfM + trM) / 2;
    const rightWeightRatio = 0.5 + (cogZ / avgTrack);
    const leftWeightRatio = 1.0 - rightWeightRatio;

    const leftPercent = leftWeightRatio * 100;
    const rightPercent = rightWeightRatio * 100;

    // 3. Compute 4-Corner Tire Loads
    const frontTotalKg = totalMassKg * frontWeightRatio;
    const rearTotalKg = totalMassKg * rearWeightRatio;

    const flKg = frontTotalKg * leftWeightRatio;
    const frKg = frontTotalKg * rightWeightRatio;
    const rlKg = rearTotalKg * leftWeightRatio;
    const rrKg = rearTotalKg * rightWeightRatio;

    const crossWeightPercent = ((flKg + rrKg) / totalMassKg) * 100;

    const gAcc = 9.80665;
    const cornerForcesN = {
      fl: flKg * gAcc,
      fr: frKg * gAcc,
      rl: rlKg * gAcc,
      rr: rrKg * gAcc,
    };

    // 4. Moments of Inertia (Izz - yaw, Iyy - pitch)
    let izz = 0;
    let iyy = 0;
    for (const node of nodes) {
      const matInfo = MATERIAL_GRADE_FACTORS[node.materialGrade] || MATERIAL_GRADE_FACTORS.forged;
      const m = node.baseMassKg * matInfo.massMult;
      const dx = node.localCoM.x - cogX;
      const dy = node.localCoM.y - cogY;
      const dz = node.localCoM.z - cogZ;

      izz += m * (dx * dx + dz * dz);
      iyy += m * (dx * dx + dy * dy);
    }

    // 5. Kinematic Roll Centers
    // Double wishbone roll center ~ 65-95mm front, 85-115mm rear
    const frontRollCenterHeightMm = Math.max(45, (rhM * 1000 * 0.48) + (trackWidthFrontMm * 0.02));
    const rearRollCenterHeightMm = Math.max(60, (rhM * 1000 * 0.56) + (trackWidthRearMm * 0.025));

    const rollAxisSlope = (rearRollCenterHeightMm - frontRollCenterHeightMm) / wheelbaseMm;
    const rollAxisInclinationDeg = (Math.atan(rollAxisSlope) * 180) / Math.PI;

    // 6. Structural Torsional & Bending Rigidity
    const baseRigidity = ARCHITECTURE_BASE_RIGIDITY[chassis.architectureClass] || {
      baseTorsionKNmDeg: 30.0,
      baseBendingKNm: 25.0,
    };

    // Aggregate material stiffness multipliers across installed structural stages
    let stiffnessFactorSum = 0;
    let structuralNodeCount = 0;
    for (const node of nodes) {
      if (node.category === 'structural' || node.category === 'chassis') {
        const matInfo = MATERIAL_GRADE_FACTORS[node.materialGrade] || MATERIAL_GRADE_FACTORS.forged;
        stiffnessFactorSum += matInfo.stiffnessMult;
        structuralNodeCount++;
      }
    }
    const avgStiffnessMult = structuralNodeCount > 0 ? stiffnessFactorSum / structuralNodeCount : 1.2;

    const torsionalStiffnessKNmDeg = baseRigidity.baseTorsionKNmDeg * avgStiffnessMult * (1.0 - (wbM - 2.5) * 0.12);
    const bendingStiffnessKNm = baseRigidity.baseBendingKNm * avgStiffnessMult;
    // 1st Torsional Natural Frequency (Hz) ~ 20-60 Hz scaling with specific stiffness
    const specificStiffness = torsionalStiffnessKNmDeg / (totalMassKg / 1000);
    const chassisTorsionalFrequencyHz = Math.min(65, Math.max(18, 16 + Math.sqrt(specificStiffness) * 4.8));

    let rigidityGrade: ModularStructureTelemetry['structuralRigidity']['rigidityGrade'] = 'Sport Chassis';
    if (torsionalStiffnessKNmDeg >= 55) rigidityGrade = 'Formula 1 Spec';
    else if (torsionalStiffnessKNmDeg >= 42) rigidityGrade = 'Le Mans Hypercar';
    else if (torsionalStiffnessKNmDeg >= 35) rigidityGrade = 'Competition GT3';
    else if (torsionalStiffnessKNmDeg >= 28) rigidityGrade = 'Ultra High Performance';
    else if (torsionalStiffnessKNmDeg >= 20) rigidityGrade = 'Sport Chassis';
    else rigidityGrade = 'Standard Production';

    const chassisSafetyRating = Math.min(100, Math.round(50 + (torsionalStiffnessKNmDeg / 60) * 45 + (avgStiffnessMult - 1.0) * 10));

    // 7. FEA Stress Tensors & Hotspots
    const feaHotspots = this.computeFeaHotspots(
      chassis,
      nodes,
      frontAxleX,
      rearAxleX,
      halfTf,
      halfTr,
      rhM,
      totalMassKg,
      torsionalStiffnessKNmDeg
    );

    const result: ModularStructureTelemetry = {
      totalMassKg: Math.round(totalMassKg * 10) / 10,
      sprungMassKg: Math.round(sprungMassKg * 10) / 10,
      unsprungMassKg: Math.round(unsprungMassKg * 10) / 10,
      centerOfGravity: {
        xMm: Math.round((cogX - frontAxleX) * 1000), // Distance aft of front axle
        yMm: Math.round(cogY * 1000),
        zMm: Math.round(cogZ * 1000),
      },
      weightDistribution: {
        frontPercent: Math.round(frontPercent * 10) / 10,
        rearPercent: Math.round(rearPercent * 10) / 10,
        leftPercent: Math.round(leftPercent * 10) / 10,
        rightPercent: Math.round(rightPercent * 10) / 10,
        crossWeightPercent: Math.round(crossWeightPercent * 10) / 10,
      },
      cornerLoadsKg: {
        fl: Math.round(flKg * 10) / 10,
        fr: Math.round(frKg * 10) / 10,
        rl: Math.round(rlKg * 10) / 10,
        rr: Math.round(rrKg * 10) / 10,
      },
      cornerForcesN: {
        fl: Math.round(cornerForcesN.fl),
        fr: Math.round(cornerForcesN.fr),
        rl: Math.round(cornerForcesN.rl),
        rr: Math.round(cornerForcesN.rr),
      },
      kinematics: {
        frontRollCenterHeightMm: Math.round(frontRollCenterHeightMm),
        rearRollCenterHeightMm: Math.round(rearRollCenterHeightMm),
        rollAxisInclinationDeg: Math.round(rollAxisInclinationDeg * 100) / 100,
        yawMomentOfInertiaIzz: Math.round(izz),
        pitchMomentOfInertiaIyy: Math.round(iyy),
      },
      structuralRigidity: {
        torsionalStiffnessKNmDeg: Math.round(torsionalStiffnessKNmDeg * 10) / 10,
        bendingStiffnessKNm: Math.round(bendingStiffnessKNm * 10) / 10,
        chassisTorsionalFrequencyHz: Math.round(chassisTorsionalFrequencyHz * 10) / 10,
        rigidityGrade,
        chassisSafetyRating,
      },
      feaHotspots,
      nodes,
    };

    if (structureCache.size >= MAX_STRUCTURE_CACHE) {
      const firstKey = structureCache.keys().next().value;
      if (typeof firstKey === "string") structureCache.delete(firstKey);
    }
    structureCache.set(cacheKey, result);

    return result;
  }

  /**
   * Generates the hierarchical subsystem nodes with local CoM vectors and baseline masses.
   */
  private static generateSubsystemNodes(
    chassis: Chassis50Definition,
    installedStages: VehicleSubsystemStage[],
    materialGrades: Record<VehicleSubsystemStage, MaterialGrade>,
    frontAxleX: number,
    rearAxleX: number,
    halfTf: number,
    halfTr: number,
    rhM: number
  ): ModularSubsystemNode[] {
    const nodes: ModularSubsystemNode[] = [];
    const midX = (frontAxleX + rearAxleX) / 2;

    const getGrade = (stage: VehicleSubsystemStage): MaterialGrade => materialGrades[stage] || 'forged';

    // 1. Chassis Platform Monocoque / Spaceframe
    if (installedStages.includes('chassis_platform') || installedStages.includes('architecture')) {
      nodes.push({
        id: 'node_chassis_platform',
        name: 'Chassis Central Monocoque & Floor Tub',
        category: 'structural',
        stage: 'chassis_platform',
        baseMassKg: chassis.baseMassKg * 0.42,
        localCoM: { x: midX, y: rhM + 0.18, z: 0 },
        isUnsprung: false,
        materialGrade: getGrade('chassis_platform'),
        structuralStiffnessNmDeg: 28000,
        description: 'Torsional backbone supporting battery tray, passenger tub, and bulkhead cross-members.',
      });
    }

    // 2. Front Subframe & Crash Structure
    if (installedStages.includes('chassis_platform')) {
      nodes.push({
        id: 'node_front_subframe',
        name: 'Front Longitudinal Rails & Crash Box',
        category: 'structural',
        stage: 'chassis_platform',
        baseMassKg: chassis.baseMassKg * 0.16,
        localCoM: { x: frontAxleX + 0.32, y: rhM + 0.22, z: 0 },
        isUnsprung: false,
        materialGrade: getGrade('chassis_platform'),
        structuralStiffnessNmDeg: 12000,
        description: 'Front hydroformed rails, radiator support crossmember, and steering rack cradle.',
      });
    }

    // 3. Rear Subframe & Differential Cradle
    if (installedStages.includes('chassis_platform')) {
      nodes.push({
        id: 'node_rear_subframe',
        name: 'Rear Subframe & Transaxle Cradle',
        category: 'structural',
        stage: 'chassis_platform',
        baseMassKg: chassis.baseMassKg * 0.18,
        localCoM: { x: rearAxleX - 0.24, y: rhM + 0.24, z: 0 },
        isUnsprung: false,
        materialGrade: getGrade('chassis_platform'),
        structuralStiffnessNmDeg: 14000,
        description: 'Multi-link rear suspension pickup node carrier and differential mounting truss.',
      });
    }

    // 4. Front & Rear Suspension Kinematics (Double Wishbones & Multi-link)
    if (installedStages.includes('suspension')) {
      nodes.push(
        {
          id: 'node_suspension_fl',
          name: 'Front-Left Pushrod Wishbone Assembly',
          category: 'suspension',
          stage: 'suspension',
          baseMassKg: 24,
          localCoM: { x: frontAxleX, y: rhM + 0.16, z: -halfTf * 0.72 },
          isUnsprung: false,
          materialGrade: getGrade('suspension'),
          structuralStiffnessNmDeg: 6500,
          description: 'Aero-profiled titanium A-arms, inboard rocker bellcrank, and anti-roll bar link.',
        },
        {
          id: 'node_suspension_fr',
          name: 'Front-Right Pushrod Wishbone Assembly',
          category: 'suspension',
          stage: 'suspension',
          baseMassKg: 24,
          localCoM: { x: frontAxleX, y: rhM + 0.16, z: halfTf * 0.72 },
          isUnsprung: false,
          materialGrade: getGrade('suspension'),
          structuralStiffnessNmDeg: 6500,
          description: 'Aero-profiled titanium A-arms, inboard rocker bellcrank, and anti-roll bar link.',
        },
        {
          id: 'node_suspension_rl',
          name: 'Rear-Left 5-Link Kinematic Assembly',
          category: 'suspension',
          stage: 'suspension',
          baseMassKg: 28,
          localCoM: { x: rearAxleX, y: rhM + 0.18, z: -halfTr * 0.72 },
          isUnsprung: false,
          materialGrade: getGrade('suspension'),
          structuralStiffnessNmDeg: 7200,
          description: 'Toe control links, camber arms, forged knuckle, and remote-reservoir coilover.',
        },
        {
          id: 'node_suspension_rr',
          name: 'Rear-Right 5-Link Kinematic Assembly',
          category: 'suspension',
          stage: 'suspension',
          baseMassKg: 28,
          localCoM: { x: rearAxleX, y: rhM + 0.18, z: halfTr * 0.72 },
          isUnsprung: false,
          materialGrade: getGrade('suspension'),
          structuralStiffnessNmDeg: 7200,
          description: 'Toe control links, camber arms, forged knuckle, and remote-reservoir coilover.',
        }
      );
    }

    // 5. Unsprung Corners: Brakes & Wheels (FL, FR, RL, RR)
    if (installedStages.includes('wheels_brakes')) {
      const cornerMass = 36;

      nodes.push(
        {
          id: 'node_wheel_fl',
          name: 'Front-Left Wheel & Carbon-Ceramic Caliper Corner',
          category: 'unsprung',
          stage: 'wheels_brakes',
          baseMassKg: cornerMass,
          localCoM: { x: frontAxleX, y: rhM + 0.32, z: -halfTf },
          isUnsprung: true,
          materialGrade: getGrade('wheels_brakes'),
          structuralStiffnessNmDeg: 4500,
          description: '6-piston monoblock caliper, 390mm ventilated ceramic disc, forged wheel, and tire.',
        },
        {
          id: 'node_wheel_fr',
          name: 'Front-Right Wheel & Carbon-Ceramic Caliper Corner',
          category: 'unsprung',
          stage: 'wheels_brakes',
          baseMassKg: cornerMass,
          localCoM: { x: frontAxleX, y: rhM + 0.32, z: halfTf },
          isUnsprung: true,
          materialGrade: getGrade('wheels_brakes'),
          structuralStiffnessNmDeg: 4500,
          description: '6-piston monoblock caliper, 390mm ventilated ceramic disc, forged wheel, and tire.',
        },
        {
          id: 'node_wheel_rl',
          name: 'Rear-Left Wheel & 4-Piston Caliper Corner',
          category: 'unsprung',
          stage: 'wheels_brakes',
          baseMassKg: cornerMass + 4,
          localCoM: { x: rearAxleX, y: rhM + 0.33, z: -halfTr },
          isUnsprung: true,
          materialGrade: getGrade('wheels_brakes'),
          structuralStiffnessNmDeg: 4800,
          description: '4-piston monoblock caliper, 380mm ventilated disc, wide forged wheel, and 305mm tire.',
        },
        {
          id: 'node_wheel_rr',
          name: 'Rear-Right Wheel & 4-Piston Caliper Corner',
          category: 'unsprung',
          stage: 'wheels_brakes',
          baseMassKg: cornerMass + 4,
          localCoM: { x: rearAxleX, y: rhM + 0.33, z: halfTr },
          isUnsprung: true,
          materialGrade: getGrade('wheels_brakes'),
          structuralStiffnessNmDeg: 4800,
          description: '4-piston monoblock caliper, 380mm ventilated disc, wide forged wheel, and 305mm tire.',
        }
      );
    }

    // 6. Powertrain & Transmission: Engine / Motor / Skateboard Battery
    if (installedStages.includes('powertrain_engine') || installedStages.includes('electronics') || installedStages.includes('transmission')) {
      if (installedStages.includes('powertrain_engine')) {
        nodes.push({
          id: 'node_powertrain_engine',
          name: 'Mid-Front Powertrain Module & Inverter',
          category: 'powertrain',
          stage: 'powertrain_engine',
          baseMassKg: 210,
          localCoM: { x: frontAxleX - 0.35, y: rhM + 0.36, z: 0 },
          isUnsprung: false,
          materialGrade: getGrade('powertrain_engine'),
          structuralStiffnessNmDeg: 8000,
          description: 'High-RPM combustion engine block / dual PMSM traction motors with dry sump pan.',
        });
      }

      if (installedStages.includes('transmission')) {
        nodes.push({
          id: 'node_transmission',
          name: 'Dual-Clutch Transaxle & Differential',
          category: 'powertrain',
          stage: 'transmission',
          baseMassKg: 85,
          localCoM: { x: rearAxleX + 0.15, y: rhM + 0.28, z: 0 },
          isUnsprung: false,
          materialGrade: getGrade('transmission'),
          structuralStiffnessNmDeg: 5500,
          description: '8-speed sequential DCT gearbox with electronic limited-slip differential.',
        });
      }

      if (installedStages.includes('electronics')) {
        nodes.push({
          id: 'node_battery_skateboard',
          name: '800V Skateboard Structural Battery Enclosure',
          category: 'powertrain',
          stage: 'electronics',
          baseMassKg: 380,
          localCoM: { x: midX, y: rhM + 0.08, z: 0 },
          isUnsprung: false,
          materialGrade: getGrade('electronics'),
          structuralStiffnessNmDeg: 22000,
          description: 'Extruded aluminum cell modules, bottom ballistic armor plate, and liquid cooling channels.',
        });
      }
    }

    // 7. Cabin Interior, Cockpit & Integrated Roll Cage
    if (installedStages.includes('interior_cabin')) {
      nodes.push({
        id: 'node_cabin_interior',
        name: 'Modular Cockpit, Carbon Bucket Seats & Safety Cell',
        category: 'cabin',
        stage: 'interior_cabin',
        baseMassKg: 135,
        localCoM: { x: midX + 0.15, y: rhM + 0.52, z: 0 },
        isUnsprung: false,
        materialGrade: getGrade('interior_cabin'),
        structuralStiffnessNmDeg: 9500,
        description: 'FIA-spec roll cage hoops, carbon dashboard, digital cluster, and steering column.',
      });
    }

    // 8. Exterior Body Panels & Structural Shell
    if (installedStages.includes('exterior_panels') || installedStages.includes('body_structure')) {
      nodes.push({
        id: 'node_closures_shell',
        name: 'Carbon Outer Shell, Hood, Doors & Acoustic Glass',
        category: 'structural',
        stage: 'exterior_panels',
        baseMassKg: 115,
        localCoM: { x: midX, y: rhM + 0.65, z: 0 },
        isUnsprung: false,
        materialGrade: getGrade('exterior_panels'),
        structuralStiffnessNmDeg: 6200,
        description: 'Vented carbon hood, dihedral doors with side-impact beams, laminated windshield.',
      });
    }

    // 9. Active Aerodynamics & Lighting
    if (installedStages.includes('aerodynamics') || installedStages.includes('lighting_glass')) {
      nodes.push({
        id: 'node_aero_surfaces',
        name: 'Active Aerodynamics (Front Splitter, Diffuser & Rear Wing)',
        category: 'aero',
        stage: 'aerodynamics',
        baseMassKg: 38,
        localCoM: { x: rearAxleX - 0.45, y: rhM + 0.78, z: 0 },
        isUnsprung: false,
        materialGrade: getGrade('aerodynamics'),
        structuralStiffnessNmDeg: 3500,
        description: 'Underfloor Venturi strakes, front dive planes, and active dual-element DRS GT wing.',
      });
    }

    return nodes;
  }

  /**
   * Evaluates FEA stress concentration hotspots across structural joints and hardpoints.
   */
  private static computeFeaHotspots(
    chassis: Chassis50Definition,
    nodes: ModularSubsystemNode[],
    frontAxleX: number,
    rearAxleX: number,
    halfTf: number,
    halfTr: number,
    rhM: number,
    totalMassKg: number,
    torsionalStiffnessKNmDeg: number
  ): FeaStressHotspot[] {
    const midX = (frontAxleX + rearAxleX) / 2;
    const dynamicFactor = Math.min(1.5, Math.max(0.7, (totalMassKg / 1400) * (35 / torsionalStiffnessKNmDeg)));

    return [
      {
        nodeId: 'hotspot_front_damper_tower_left',
        name: 'Front-Left Shock Tower & Wishbone Pick-Up Bulkhead',
        location: { x: frontAxleX + 0.05, y: rhM + 0.42, z: -halfTf * 0.68 },
        vonMisesStressMpa: Math.round(285 * dynamicFactor),
        yieldStrengthMpa: 650,
        safetyFactor: Math.round((650 / (285 * dynamicFactor)) * 100) / 100,
        severity: (285 * dynamicFactor) > 420 ? 'elevated' : 'nominal',
        dominantLoadCase: 'vertical_bump_3g',
      },
      {
        nodeId: 'hotspot_front_damper_tower_right',
        name: 'Front-Right Shock Tower & Wishbone Pick-Up Bulkhead',
        location: { x: frontAxleX + 0.05, y: rhM + 0.42, z: halfTf * 0.68 },
        vonMisesStressMpa: Math.round(285 * dynamicFactor),
        yieldStrengthMpa: 650,
        safetyFactor: Math.round((650 / (285 * dynamicFactor)) * 100) / 100,
        severity: (285 * dynamicFactor) > 420 ? 'elevated' : 'nominal',
        dominantLoadCase: 'vertical_bump_3g',
      },
      {
        nodeId: 'hotspot_firewall_tub_junction',
        name: 'Forward Bulkhead / Firewall Torsional Shear Ring',
        location: { x: frontAxleX - 0.28, y: rhM + 0.38, z: 0 },
        vonMisesStressMpa: Math.round(340 * dynamicFactor),
        yieldStrengthMpa: 720,
        safetyFactor: Math.round((720 / (340 * dynamicFactor)) * 100) / 100,
        severity: (340 * dynamicFactor) > 480 ? 'critical' : 'nominal',
        dominantLoadCase: 'torsional_shear',
      },
      {
        nodeId: 'hotspot_b_pillar_side_sill',
        name: 'B-Pillar Base & Floorpan Rocker Joint',
        location: { x: midX, y: rhM + 0.22, z: -halfTf * 0.85 },
        vonMisesStressMpa: Math.round(210 * dynamicFactor),
        yieldStrengthMpa: 580,
        safetyFactor: Math.round((580 / (210 * dynamicFactor)) * 100) / 100,
        severity: 'nominal',
        dominantLoadCase: 'lateral_cornering_2g',
      },
      {
        nodeId: 'hotspot_rear_subframe_mount_left',
        name: 'Rear-Left Subframe Torsional Mounting Node',
        location: { x: rearAxleX + 0.18, y: rhM + 0.28, z: -halfTr * 0.65 },
        vonMisesStressMpa: Math.round(315 * dynamicFactor),
        yieldStrengthMpa: 650,
        safetyFactor: Math.round((650 / (315 * dynamicFactor)) * 100) / 100,
        severity: (315 * dynamicFactor) > 420 ? 'elevated' : 'nominal',
        dominantLoadCase: 'lateral_cornering_2g',
      },
      {
        nodeId: 'hotspot_rear_subframe_mount_right',
        name: 'Rear-Right Subframe Torsional Mounting Node',
        location: { x: rearAxleX + 0.18, y: rhM + 0.28, z: halfTr * 0.65 },
        vonMisesStressMpa: Math.round(315 * dynamicFactor),
        yieldStrengthMpa: 650,
        safetyFactor: Math.round((650 / (315 * dynamicFactor)) * 100) / 100,
        severity: (315 * dynamicFactor) > 420 ? 'elevated' : 'nominal',
        dominantLoadCase: 'lateral_cornering_2g',
      },
      {
        nodeId: 'hotspot_rear_suspension_crossmember',
        name: 'Rear Anti-Roll Bar & Differential Carrier Cross-Truss',
        location: { x: rearAxleX - 0.15, y: rhM + 0.32, z: 0 },
        vonMisesStressMpa: Math.round(260 * dynamicFactor),
        yieldStrengthMpa: 600,
        safetyFactor: Math.round((600 / (260 * dynamicFactor)) * 100) / 100,
        severity: 'nominal',
        dominantLoadCase: 'longitudinal_braking_2g',
      },
    ];
  }
}

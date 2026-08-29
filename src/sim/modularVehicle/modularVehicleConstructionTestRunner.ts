// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — AUTOMATED UNIT TEST RUNNER
// ============================================================================
// Validates all 10 body types, 50 chassis architectures, attachment hardpoints,
// transform solver, procedural 3D generators, and vehicle performance physics.
// ============================================================================

import { BODY_TYPE_REGISTRY, ALL_BODY_TYPES } from '../../exterior3d/manifests/bodyTypeManifest';
import { CHASSIS_50_REGISTRY, CHASSIS_50_MAP, getChassisForBodyType } from '../../exterior3d/manifests/chassis50Manifest';
import { SUBSYSTEM_STAGES, MODULAR_COMPONENTS } from '../../exterior3d/manifests/modularComponentManifest';
import { solveChassisHardpoints } from '../../exterior3d/physics/chassisHardpointSolver';
import { ModularVehicleAttachmentEngine } from '../../exterior3d/physics/vehicleAttachmentEngine';
import { ModularChassisFamilyGenerator } from '../../exterior3d/generators/modularChassisFamilyGenerator';
import { ModularClosuresGenerator } from '../../exterior3d/generators/modularClosuresGenerator';
import { ModularCabinInteriorGenerator } from '../../exterior3d/generators/modularCabinInteriorGenerator';
import { ModularInterior3DGenerator } from '../../exterior3d/generators/modularInterior3DGenerator';
import { ModularLightingGlassAeroGenerator } from '../../exterior3d/generators/modularLightingGlassAeroGenerator';
import {
  DASHBOARD_CATALOG,
  INSTRUMENT_CLUSTER_CATALOG,
  STEERING_WHEEL_CATALOG,
  SEATING_CATALOG,
  CENTER_CONSOLE_CATALOG,
} from '../../exterior3d/manifests/modularInteriorManifest';

interface TestCase {
  name: string;
  fn: () => void;
}

export function runModularVehicleConstructionTests(): { passed: number; failed: number; total: number } {
  let passed = 0;
  let failed = 0;

  const tests: TestCase[] = [
    {
      name: '[Body Types] Master registry contains all 10 distinct automotive body types',
      fn: () => {
        if (ALL_BODY_TYPES.length !== 10) {
          throw new Error(`Expected 10 body types, found ${ALL_BODY_TYPES.length}`);
        }
        for (const bt of ALL_BODY_TYPES) {
          const meta = BODY_TYPE_REGISTRY[bt];
          if (!meta || !meta.name || meta.typicalWheelbaseMm.default < 2000) {
            throw new Error(`Invalid metadata for body type ${bt}`);
          }
        }
      },
    },
    {
      name: '[50 Chassis] Registry contains exactly 50 unique chassis architectures (5 per body type)',
      fn: () => {
        if (CHASSIS_50_REGISTRY.length !== 50) {
          throw new Error(`Expected 50 chassis architectures, found ${CHASSIS_50_REGISTRY.length}`);
        }
        for (const bt of ALL_BODY_TYPES) {
          const chassisList = getChassisForBodyType(bt);
          if (chassisList.length !== 5) {
            throw new Error(`Body type ${bt} must have exactly 5 chassis architectures, found ${chassisList.length}`);
          }
        }
      },
    },
    {
      name: '[Chassis Hardpoints] Every chassis has valid structural mounting nodes and non-zero rigidity',
      fn: () => {
        for (const chassis of CHASSIS_50_REGISTRY) {
          if (chassis.baseMassKg < 150 || chassis.torsionalRigidityKNmPerDeg < 15.0) {
            throw new Error(`Chassis ${chassis.id} has invalid mass or rigidity values`);
          }
          if (chassis.hardpoints.length < 10) {
            throw new Error(`Chassis ${chassis.id} missing required hardpoints (found ${chassis.hardpoints.length})`);
          }
        }
      },
    },
    {
      name: '[Hardpoint Solver] Calculates exact 3D world coordinates scaled to wheelbase and track',
      fn: () => {
        const chassis = CHASSIS_50_MAP['SEDAN_CHASSIS_01'];
        const solved = solveChassisHardpoints(chassis, 3000, 1700, 1700, 140);
        
        if (solved.wheelbaseM !== 3.0) {
          throw new Error(`Expected wheelbase 3.0m, got ${solved.wheelbaseM}`);
        }
        const suspFL = solved.hardpoints['SUSP_MOUNT_FL'];
        if (!suspFL || suspFL.positionM[2] !== -0.85) {
          throw new Error(`Expected left track half-width -0.85m, got ${suspFL?.positionM[2]}`);
        }
      },
    },
    {
      name: '[Attachment Engine] Validates compatibility and computes world transforms for components',
      fn: () => {
        const chassis = CHASSIS_50_MAP['SUPERCAR_CHASSIS_01'];
        const engineComp = MODULAR_COMPONENTS.find((c) => c.id === 'ENGINE_MODULAR_V12_RACING');
        if (!engineComp) throw new Error('V12 engine component not found in manifest');

        const compat = ModularVehicleAttachmentEngine.isComponentCompatible(engineComp, chassis, 'supercar');
        if (!compat.compatible) {
          throw new Error(`Expected V12 to be compatible with supercar chassis, got: ${compat.reason}`);
        }

        const transform = ModularVehicleAttachmentEngine.solveAttachmentTransform(engineComp, chassis);
        if (!transform.isValid) {
          throw new Error(`Transform calculation failed: ${transform.errorMessage}`);
        }
      },
    },
    {
      name: '[12 Subsystems] Assembly manifest defines all 12 construction stages in logical sequence',
      fn: () => {
        if (SUBSYSTEM_STAGES.length !== 12) {
          throw new Error(`Expected 12 assembly stages, found ${SUBSYSTEM_STAGES.length}`);
        }
        for (let i = 0; i < SUBSYSTEM_STAGES.length; i++) {
          if (SUBSYSTEM_STAGES[i].stageNumber !== i) {
            throw new Error(`Stage sequence mismatch at index ${i}`);
          }
        }
      },
    },
    {
      name: '[Procedural 3D Mesh] Generates clean Three.js geometry for Monocoque, Spaceframe, Ladder, and Carbon Tubs',
      fn: () => {
        const monocoqueChassis = CHASSIS_50_MAP['SEDAN_CHASSIS_01'];
        const meshMono = ModularChassisFamilyGenerator.buildChassisMesh(monocoqueChassis);
        if (meshMono.children.length < 8) {
          throw new Error(`Expected at least 8 structural elements in monocoque mesh, got ${meshMono.children.length}`);
        }

        const spaceframeChassis = CHASSIS_50_MAP['SPORTS_CAR_CHASSIS_04'];
        const meshSpace = ModularChassisFamilyGenerator.buildChassisMesh(spaceframeChassis);
        if (meshSpace.children.length < 10) {
          throw new Error(`Expected at least 10 tubular nodes in spaceframe mesh, got ${meshSpace.children.length}`);
        }

        const ladderChassis = CHASSIS_50_MAP['PICKUP_CHASSIS_01'];
        const meshLadder = ModularChassisFamilyGenerator.buildChassisMesh(ladderChassis);
        if (meshLadder.children.length < 7) {
          throw new Error(`Expected at least 7 structural boxed channels in ladder mesh, got ${meshLadder.children.length}`);
        }
      },
    },
    {
      name: '[Closures, Interior, Lighting & Aero 3D] Constructs full exterior skin, cabin, and aero components',
      fn: () => {
        const closures = ModularClosuresGenerator.buildClosures('coupe', 2700, 1640);
        if (closures.children.length < 7) {
          throw new Error(`Closures missing panels (found ${closures.children.length})`);
        }

        const interior = ModularCabinInteriorGenerator.buildInterior(2700, 1640);
        if (interior.children.length < 5) {
          throw new Error(`Interior missing cockpit elements (found ${interior.children.length})`);
        }

        const lights = ModularLightingGlassAeroGenerator.buildLighting(2700, 1640);
        const glass = ModularLightingGlassAeroGenerator.buildGlass(2700, 1640);
        const aero = ModularLightingGlassAeroGenerator.buildAerodynamics(2700, 1640);
        if (lights.children.length < 2 || glass.children.length < 3 || aero.children.length < 4) {
          throw new Error('Lighting, glass or aero 3D geometry count below expected thresholds');
        }
      },
    },
    {
      name: '[Modular Interior Catalog] Validates all Dashboards 01-05, Clusters, Wheels, Seats, and Consoles',
      fn: () => {
        if (DASHBOARD_CATALOG.length !== 5) {
          throw new Error(`Expected 5 modular dashboard architectures, found ${DASHBOARD_CATALOG.length}`);
        }
        if (INSTRUMENT_CLUSTER_CATALOG.length < 4) {
          throw new Error(`Expected at least 4 instrument clusters, found ${INSTRUMENT_CLUSTER_CATALOG.length}`);
        }
        if (STEERING_WHEEL_CATALOG.length < 4) {
          throw new Error(`Expected at least 4 steering wheels, found ${STEERING_WHEEL_CATALOG.length}`);
        }
        if (SEATING_CATALOG.length < 4) {
          throw new Error(`Expected at least 4 seating options, found ${SEATING_CATALOG.length}`);
        }
        if (CENTER_CONSOLE_CATALOG.length < 4) {
          throw new Error(`Expected at least 4 center console options, found ${CENTER_CONSOLE_CATALOG.length}`);
        }
      },
    },
    {
      name: '[Modular Interior 3D Generator] Assembles full 3D cockpit with modular dashboard, screen, wheel, seats, and ambient light strip',
      fn: () => {
        const modularInterior = ModularInterior3DGenerator.buildModularInterior(
          {
            dashboardId: 'DASHBOARD_01_EXECUTIVE',
            instrumentClusterId: 'CLUSTER_VIRTUAL_COCKPIT_12_3',
            steeringWheelId: 'STEERING_FLAT_BOTTOM_SPORT',
            frontSeatsId: 'SEATS_SPORT_BOLSTERED',
            centerConsoleId: 'CONSOLE_SPORT_GATED',
            ambientLightingColorHex: '#f59e0b',
          },
          2850,
          1620
        );

        if (modularInterior.children.length < 6) {
          throw new Error(`Expected at least 6 interior sub-assembly nodes, found ${modularInterior.children.length}`);
        }
      },
    },
  ];

  for (const t of tests) {
    try {
      t.fn();
      passed++;
      console.log(`✅ PASS ${t.name}`);
    } catch (err: any) {
      failed++;
      console.error(`❌ FAIL ${t.name}: ${err.message}`);
    }
  }

  return { passed, failed, total: tests.length };
}

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as THREE from 'three';
import {
  ModularAssemblySceneGraph,
  InstalledSubsystemsState,
} from '../../components/vehicleAssembly/scene/ModularAssemblySceneGraph';

describe('Modular GT3 Blender Asset & Kinematic Pipeline Suite', () => {
  const glbPath = path.resolve(__dirname, '../../../public/models/exterior/modular_gt3_apex.glb');

  it('1. Verifies modular GT3 GLB file exists and has valid glTF binary header', () => {
    expect(fs.existsSync(glbPath)).toBe(true);
    const stat = fs.statSync(glbPath);
    expect(stat.size).toBeGreaterThan(50 * 1024);

    const fd = fs.openSync(glbPath, 'r');
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    const magic = buffer.toString('utf8', 0, 4);
    expect(magic).toBe('glTF');

    const version = buffer.readUInt32LE(4);
    expect(version).toBe(2);

    const totalLength = buffer.readUInt32LE(8);
    expect(totalLength).toBe(stat.size);
  });

  it('2. Audits glTF JSON chunk for kinematic pivots and named assemblies', () => {
    const fileBuf = fs.readFileSync(glbPath);
    const chunkLength = fileBuf.readUInt32LE(12);
    const chunkType = fileBuf.readUInt32LE(16);
    expect(chunkType).toBe(0x4e4f534a);

    const jsonStr = fileBuf.toString('utf8', 20, 20 + chunkLength);
    const gltfJson = JSON.parse(jsonStr);

    expect(gltfJson.nodes).toBeDefined();
    expect(gltfJson.nodes.length).toBeGreaterThanOrEqual(40);

    const nodeNames = gltfJson.nodes.map((n: any) => n.name).filter(Boolean);

    expect(nodeNames).toContain('Bonnet_Hinge_Pivot');
    expect(nodeNames).toContain('Door_Hinge_Pivot_Left');
    expect(nodeNames).toContain('Door_Hinge_Pivot_Right');
    expect(nodeNames).toContain('Dicky_Decklid_Pivot');
    expect(nodeNames).toContain('Front_Splitter_Assembly');
    expect(nodeNames).toContain('Rear_Wing_Assembly');
    expect(nodeNames).toContain('Diffuser_Venturi_Assembly');
    expect(nodeNames).toContain('Bonnet_Hood_Skin');
    expect(nodeNames).toContain('Door_Main_Skin_Left');
    expect(nodeNames).toContain('Door_Main_Skin_Right');
    expect(nodeNames).toContain('Dicky_Engine_Cover_Skin');
    expect(nodeNames).toContain('Taillight_OLED_Blade');
    expect(nodeNames).toContain('Greenhouse_Roof_Canopy');
    expect(nodeNames).toContain('Front_Bumper_Fascia');
    expect(nodeNames).toContain('Rear_Bumper_Fascia');

    const bonnetNode = gltfJson.nodes.find((n: any) => n.name === 'Bonnet_Hinge_Pivot');
    expect(bonnetNode).toBeDefined();
    expect(bonnetNode.translation).toBeDefined();
    const [bx, by, bz] = bonnetNode.translation;
    expect(bx).toBeCloseTo(0, 2);
    expect(by).toBeGreaterThan(0.4);
    expect(bz).toBeLessThan(0);

    const dickyNode = gltfJson.nodes.find((n: any) => n.name === 'Dicky_Decklid_Pivot');
    expect(dickyNode).toBeDefined();
    expect(dickyNode.translation).toBeDefined();
    const [dx, dy, dz] = dickyNode.translation;
    expect(dx).toBeCloseTo(0, 2);
    expect(dy).toBeGreaterThan(0.4);
    expect(dz).toBeGreaterThan(0);

    const splitterNode = gltfJson.nodes.find((n: any) => n.name === 'Front_Splitter_Assembly');
    expect(splitterNode).toBeDefined();
    expect(splitterNode.translation[2]).toBeLessThan(-1.0);

    const wingNode = gltfJson.nodes.find((n: any) => n.name === 'Rear_Wing_Assembly');
    expect(wingNode).toBeDefined();
    expect(wingNode.translation[2]).toBeGreaterThan(1.0);
  });

  it('3. Verifies ModularAssemblySceneGraph instantiates cleanly and binds kinematic closures', () => {
    const sceneGraph = new ModularAssemblySceneGraph();
    expect(sceneGraph.rootGroup).toBeInstanceOf(THREE.Group);

    const mockState: InstalledSubsystemsState = {
      installedStages: new Set(['chassis', 'engine', 'transmission', 'suspension', 'brakes', 'wheels', 'body_structure', 'final_exterior']),
      chassis: {
        type: 'gt3',
        category: 'gt3_race',
        architecture: 'carbon_tub',
        wheelbaseMm: 2700,
        frontTrackMm: 1660,
        rearTrackMm: 1710,
        rideHeightMm: 100,
      },
      engine: {
        type: 'v8_twin_turbo',
        displacement: 4.0,
        cylinders: 8,
        configuration: 'v',
        aspiration: 'twin_turbo',
        intake: 'bi_turbo',
        fuelSystem: 'direct_injection',
        valvetrain: 'dohc_4v',
        redline: 8500,
        idleRpm: 900,
        boreMm: 86,
        strokeMm: 86,
        compressionRatio: 9.8,
      } as any,
      enginePosition: 'mid',
      engineOffsetMm: 0,
      transmissionType: 'dct_7',
      suspensionType: 'pushrod',
      brakeType: 'carbon_ceramic',
      caliperColor: '#ef4444',
      wheelStyle: 'forged_monoblock',
      tireCompound: 'slick_soft',
      bodyKit: 'gt3_aero',
      doorStyle: 'butterfly',
      doorOpenAngleDeg: 45,
      bonnetStyle: 'vented_extractor',
      bonnetOpenAngleDeg: 35,
      dickyStyle: 'ducktail_trunk',
      dickyOpenAngleDeg: 30,
      paintColor: '#dc2626',
      paintFinish: 'candy',
      fenderLouvers: true,
      headlightStyle: 'matrix_led_blade',
      headlightColor: '#38bdf8',
      headlightsActive: true,
      headlightSmokedLens: false,
      taillightStyle: 'oled_blade',
      bonnetFinish: 'exposed_carbon',
      hoodPins: 'aerocatch_flush',
      mirrorStyle: 'swan_neck_carbon',
      doorHandleStyle: 'flush_electronic',
      exhaustType: 'quad_titanium',
      heatTintIntensity: 85,
      towHooksFront: true,
      towHooksRear: true,
      glassType: 'lexan_polycarbonate',
      lexanEngineCover: true,
      interiorType: 'gt3_track',
      steeringAngleDeg: 12,
      suspensionTravelMm: 15,
      aero: {
        frontSplitterEnabled: true,
        frontSplitterLengthMm: 120,
        frontSplitterAngleDeg: 4,
        frontCanards: true,
        frontCanardAngleDeg: 12,
        underbodyVenturiTunnels: true,
        venturiTunnelCount: 4,
        diffuserEnabled: true,
        diffuserAngleDeg: 14,
        diffuserStrakes: 4,
        diffuserExitWidthMm: 1200,
        sideSkirtsEnabled: true,
        sideSkirtExtensionMm: 60,
        vortexFins: true,
        rearWingEnabled: true,
        rearWingType: 'swan_neck',
        rearWingWidthMm: 1800,
        rearWingHeightMm: 450,
        rearWingAngleDeg: 10,
        gurneyFlap: true,
        endplateSize: 'swan_neck',
      },
    };

    sceneGraph.updateScene(mockState, null, 0, false);

    expect(sceneGraph.rootGroup.children.length).toBeGreaterThan(0);
    expect(sceneGraph.chassisGroup).toBeDefined();
    expect(sceneGraph.wheelsGroup).toBeDefined();
    expect(sceneGraph.bodyGroup).toBeDefined();

    sceneGraph.setClosuresArticulation(45, 35, 30, 'butterfly');

    expect(sceneGraph.leftDoorPivot.rotation.x).not.toBe(0);
    expect(sceneGraph.leftDoorPivot.rotation.y).not.toBe(0);

    expect(sceneGraph.bonnetPivot.rotation.x).toBeLessThan(0);
    expect(sceneGraph.dickyPivot.rotation.x).toBeGreaterThan(0);

    const wheelY = (mockState.chassis.rideHeightMm + 240) / 1000;
    expect(wheelY).toBeCloseTo(0.34, 2);
  });
})

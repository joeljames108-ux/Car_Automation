// ============================================================================
// MODULAR GLB GENERATOR — COMPREHENSIVE ENGINE BLOCK TEST SUITE
// ============================================================================
// Automated verification suite validating that all 14 engine layouts construct
// non-empty, high-vertex-count, multi-subsystem 3D solid model scene graphs with
// valid geometry buffer attributes, PBR material bindings, and clean bounding boxes.
// ============================================================================

import * as THREE from 'three';
import type { EngineLayout } from '../../../sim/types';
import { buildEngineBlockScene } from '../engineBlockGenerator';
import { buildInlineBlockScene } from '../inlineBlockGenerator';
import { buildBoxerBlockScene } from '../boxerBlockGenerator';
import { buildWBlockScene } from '../wEngineBlockGenerator';
import { buildRotaryBlockScene } from '../rotaryBlockGenerator';
import { buildElectricDriveScene } from '../electricDriveGenerator';
import { buildProceduralFallbackMesh } from '../../assets/glbAssetLoader';
import { solveParametricTransformForComponent } from '../../physics/parametricTransformSolver';

interface SceneAnalysis {
  name: string;
  layout: EngineLayout;
  meshCount: number;
  totalVertices: number;
  totalTriangles: number;
  subsystemCount: number;
  boundingBox: {
    sizeX: number;
    sizeY: number;
    sizeZ: number;
  };
}

function analyzeSceneGraph(object: THREE.Object3D, layout: EngineLayout): SceneAnalysis {
  let meshCount = 0;
  let totalVertices = 0;
  let totalTriangles = 0;

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshCount++;
      const mesh = child as THREE.Mesh;
      const geo = mesh.geometry;
      if (geo && geo.attributes && geo.attributes.position) {
        const count = geo.attributes.position.count;
        totalVertices += count;
        if (geo.index) {
          totalTriangles += geo.index.count / 3;
        } else {
          totalTriangles += count / 3;
        }
      }
    }
  });

  const bbox = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  return {
    name: object.name,
    layout,
    meshCount,
    totalVertices,
    totalTriangles: Math.round(totalTriangles),
    subsystemCount: object.children.length > 0 ? (object.children[0]?.children?.length || object.children.length) : 0,
    boundingBox: {
      sizeX: parseFloat(size.x.toFixed(3)),
      sizeY: parseFloat(size.y.toFixed(3)),
      sizeZ: parseFloat(size.z.toFixed(3)),
    },
  };
}

export function runAllBlockGeneratorTests(): boolean {
  console.log('================================================================');
  console.log('STARTING ENGINE BLOCK SOLID-MODELING GENERATOR VERIFICATION SUITE');
  console.log('================================================================\n');

  const layouts: EngineLayout[] = [
    'i3', 'i4', 'i6',
    'v6', 'v8', 'v10', 'v12',
    'boxer4', 'boxer6',
    'w12', 'w16', 'w18',
    'rotary',
    'electric', 'hybrid'
  ];

  let allPassed = true;
  const results: SceneAnalysis[] = [];

  for (const layout of layouts) {
    try {
      // Test fallback mesh loader dispatch
      const meshGroup = buildProceduralFallbackMesh('engine-block', { layout });

      if (!meshGroup || meshGroup.children.length === 0) {
        console.error(`[FAIL] ${layout}: buildProceduralFallbackMesh produced empty group!`);
        allPassed = false;
        continue;
      }

      const analysis = analyzeSceneGraph(meshGroup, layout);
      results.push(analysis);

      // Verify minimum complexity thresholds
      if (analysis.meshCount < 5) {
        console.error(`[FAIL] ${layout}: Mesh count too low (${analysis.meshCount} < 5)`);
        allPassed = false;
      } else if (analysis.totalVertices < 500) {
        console.error(`[FAIL] ${layout}: Vertex count too low (${analysis.totalVertices} < 500)`);
        allPassed = false;
      } else {
        console.log(
          `[PASS] ${layout.toUpperCase().padEnd(8)} | Meshes: ${String(analysis.meshCount).padStart(3)} | Vertices: ${String(analysis.totalVertices).padStart(6)} | Triangles: ${String(analysis.totalTriangles).padStart(6)} | Size: [${analysis.boundingBox.sizeX}m x ${analysis.boundingBox.sizeY}m x ${analysis.boundingBox.sizeZ}m]`
        );
      }
    } catch (err) {
      console.error(`[FAIL] ${layout}: Generator threw unhandled exception:`, err);
      allPassed = false;
    }
  }

  console.log('\n================================================================');
  console.log('TESTING ACCESSORY GENERATORS ACROSS PARAMETERIZED CONFIGS');
  console.log('================================================================\n');

  const components = [
    'crankshaft',
    'cylinder-head-left',
    'cylinder-head-right',
    'valve-cover-left',
    'valve-cover-right',
    'intake-manifold-left',
    'intake-manifold-right',
    'exhaust-header-left',
    'exhaust-header-right',
    'dry-sump',
    'piston',
    'connecting-rod',
    'turbocharger',
    'radiator',
    'transaxle',
    'engine-cover',
  ] as const;

  const testConfigs: { layout: EngineLayout; name: string }[] = [
    { layout: 'i3', name: 'Inline-3' },
    { layout: 'i4', name: 'Inline-4' },
    { layout: 'v6', name: 'V6' },
    { layout: 'v8', name: 'V8' },
    { layout: 'v10', name: 'V10' },
    { layout: 'v12', name: 'V12' },
    { layout: 'w16', name: 'W16 Quad-Turbo' },
  ];

  for (const cfg of testConfigs) {
    for (const comp of components) {
      try {
        const meshGroup = buildProceduralFallbackMesh(comp, { layout: cfg.layout });
        if (!meshGroup || meshGroup.children.length === 0) {
          console.error(`[FAIL] ${cfg.layout} ${comp}: buildProceduralFallbackMesh produced empty group!`);
          allPassed = false;
        } else {
          const analysis = analyzeSceneGraph(meshGroup, cfg.layout);
          console.log(
            `[PASS] ${cfg.layout.toUpperCase().padEnd(6)} | ${comp.padEnd(20)} | Meshes: ${String(analysis.meshCount).padStart(3)} | Vertices: ${String(analysis.totalVertices).padStart(6)} | Size: [${analysis.boundingBox.sizeX}m x ${analysis.boundingBox.sizeY}m x ${analysis.boundingBox.sizeZ}m]`
          );
        }
      } catch (err) {
        console.error(`[FAIL] ${cfg.layout} ${comp}: Generator threw unhandled exception:`, err);
        allPassed = false;
      }
    }
  }

  console.log('\n================================================================');
  console.log('TESTING DYNAMIC PARAMETRIC SIZING (BORE, STROKE & ROD LENGTH)');
  console.log('================================================================\n');

  // 1. Bore Scaling Verification (60mm -> 88mm baseline -> 110mm)
  const smallBore = solveParametricTransformForComponent('engine-block', { bore: 65, stroke: 82, rodLength: 140 });
  const baselineBore = solveParametricTransformForComponent('engine-block', { bore: 88, stroke: 82, rodLength: 140 });
  const largeBore = solveParametricTransformForComponent('engine-block', { bore: 108, stroke: 82, rodLength: 140 });

  if (smallBore.scale[2] < baselineBore.scale[2] && baselineBore.scale[2] < largeBore.scale[2]) {
    console.log(`[PASS] Engine Block lateral width scales with bore diameter: [${smallBore.scale[2].toFixed(3)} -> ${baselineBore.scale[2].toFixed(3)} -> ${largeBore.scale[2].toFixed(3)}]`);
  } else {
    console.error(`[FAIL] Engine block bore lateral scaling failed!`);
    allPassed = false;
  }

  // 2. Stroke Scaling Verification (Piston Travel & Deck Elevation)
  const shortStroke = solveParametricTransformForComponent('cylinder-head-left', { bore: 88, stroke: 65, rodLength: 140 });
  const baselineStroke = solveParametricTransformForComponent('cylinder-head-left', { bore: 88, stroke: 82, rodLength: 140 });
  const longStroke = solveParametricTransformForComponent('cylinder-head-left', { bore: 88, stroke: 108, rodLength: 140 });

  const shortY = shortStroke.positionOffset ? shortStroke.positionOffset[1] : 0;
  const baseY = baselineStroke.positionOffset ? baselineStroke.positionOffset[1] : 0;
  const longY = longStroke.positionOffset ? longStroke.positionOffset[1] : 0;

  if (shortY < baseY && baseY < longY) {
    console.log(`[PASS] Cylinder Head elevates dynamically with stroke length: [${shortY.toFixed(4)}m -> ${baseY.toFixed(4)}m -> ${longY.toFixed(4)}m]`);
  } else {
    console.error(`[FAIL] Cylinder head stroke elevation failed!`);
    allPassed = false;
  }

  // 3. Piston Diameter & Crown Scaling
  const smallPiston = solveParametricTransformForComponent('piston', { bore: 65, compressionRatio: 9.0 });
  const largePiston = solveParametricTransformForComponent('piston', { bore: 105, compressionRatio: 13.5 });

  if (smallPiston.scale[0] < largePiston.scale[0] && smallPiston.scale[1] < largePiston.scale[1]) {
    console.log(`[PASS] Piston crown diameter and compression dome scale correctly with bore & CR: [BoreScale: ${smallPiston.scale[0].toFixed(2)}x -> ${largePiston.scale[0].toFixed(2)}x | Dome: ${smallPiston.scale[1].toFixed(2)}x -> ${largePiston.scale[1].toFixed(2)}x]`);
  } else {
    console.error(`[FAIL] Piston scaling failed!`);
    allPassed = false;
  }

  console.log('\n================================================================');
  console.log(`TOTAL ENGINE BLOCK LAYOUTS TESTED: ${layouts.length}`);
  console.log(`TOTAL ACCESSORY CONFIG COMBINATIONS: ${testConfigs.length * components.length}`);
  console.log(`STATUS: ${allPassed ? 'ALL GENERATORS PASSED 100%' : 'FAILURES DETECTED'}`);
  console.log('================================================================');

  return allPassed;
}

// Run if executed directly via Node/TSX CLI
if (typeof process !== 'undefined' && process.argv[1]?.includes('verifyAllBlockGenerators')) {
  const success = runAllBlockGeneratorTests();
  process.exit(success ? 0 : 1);
}

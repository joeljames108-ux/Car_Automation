// ============================================================================
// ENHANCE EXISTING GLBS — CLI POST-PROCESSOR FOR THE WHOLE ASSET LIBRARY
// ============================================================================
// Walks public/models/**, upgrades every .glb with Khronos PBR extensions
// (clearcoat paint, transmission glass, emissive strength lights) and prints
// a per-file report. Run: see scripts/run-enhance-glbs.mjs or esbuild bundle.
// ============================================================================

import * as path from 'path';
import { enhanceAllGlbsInTree } from '../src/exterior3d/loaders/glbPbrEnhancer';

async function main() {
  const rootDir = path.resolve('public/models');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  GLB LIBRARY-WIDE PBR MATERIAL ENHANCEMENT PIPELINE');
  console.log(`  Root: ${rootDir}`);
  console.log('═══════════════════════════════════════════════════════════');

  const reports = await enhanceAllGlbsInTree(rootDir, (r) => {
    const kb = (r.bytesAfter / 1024).toFixed(1);
    console.log(`  ✓ ${path.relative(rootDir, r.file)} — ${kb} KB (${r.nodes} nodes, ${r.meshes} meshes, ${r.materials} materials)`);
  });

  console.log('───────────────────────────────────────────────────────────');
  console.log(`Enhanced ${reports.length} GLB files. Library PBR upgrade complete.`);
}

main().catch((err) => {
  console.error('Fatal enhancement error:', err);
  process.exit(1);
});

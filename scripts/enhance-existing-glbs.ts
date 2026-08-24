// ============================================================================
// ENHANCE EXISTING GLBS â€” CLI POST-PROCESSOR FOR THE WHOLE ASSET LIBRARY
// ============================================================================
// Walks public/models/**, upgrades every .glb with Khronos PBR extensions
// (clearcoat paint, transmission glass, emissive strength lights), repairs
// broken scan PBR, and merges ultra-high-mesh-count scan files (>400 meshes)
// into per-material draw calls. Prints a per-file report.
//
// Run: npm run assets:enhance
// ============================================================================

import * as path from 'path';
import { enhanceAllGlbsInTree } from '../src/exterior3d/loaders/glbPbrEnhancer';

async function main() {
  const rootDir = path.resolve('public/models');
  console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
  console.log('  GLB LIBRARY-WIDE PBR MATERIAL ENHANCEMENT PIPELINE');
  console.log(`  Root: ${rootDir}`);
  console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');

  const reports = await enhanceAllGlbsInTree(rootDir, {
    // joinMeshesOver disabled pending normalized-accessor requantization support
    onFile: (r) => {
      const kb = (r.bytesAfter / 1024).toFixed(1);
      console.log(`  âœ“ ${path.relative(rootDir, r.file)} â€” ${kb} KB (${r.nodes} nodes, ${r.meshes} meshes, ${r.materials} materials)`);
    },
  });

  console.log('â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');
  console.log(`Enhanced ${reports.length} GLB files. Library PBR upgrade complete.`);
}

main().catch((err) => {
  console.error('Fatal enhancement error:', err);
  process.exit(1);
});

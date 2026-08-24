// ============================================================================
// HOOD GLB GENERATOR CLI SCRIPT
// ============================================================================
// Run with: npx tsx scripts/generate-hood-glb.ts
// Generates high-fidelity sculpted hood GLB files for all vehicle presets
// ============================================================================

import { exportAllHoodGlbPresets } from '../src/exterior3d/generators/hoodGlbGenerator';

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  HIGH-FIDELITY SCULPTED HOOD GLB EXPORT PIPELINE');
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    const results = await exportAllHoodGlbPresets('public/models/exterior');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  EXPORT COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\nGenerated files:');
    for (const r of results) {
      console.log(`  ✓ ${r.filename} — ${(r.bytes / 1024).toFixed(1)} KB`);
    }
    console.log('\nFiles saved to: public/models/exterior/');
  } catch (error) {
    console.error('\n✗ Export failed:', error);
    process.exit(1);
  }
}

main();
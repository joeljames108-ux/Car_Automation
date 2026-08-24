// ============================================================================
// CHASSIS FRAME GLB GENERATOR CLI
// ============================================================================
// Run with: node after esbuild bundle — generates purpose-built structural
// chassis GLBs for the Car3D registry entries and saves to public/models/chassis/
// ============================================================================

import { generateChassisFrameGlbs } from '../src/exterior3d/generators/chassisFrameGlbGenerator';

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  STRUCTURAL CHASSIS FRAME GLB EXPORT PIPELINE');
  console.log('═══════════════════════════════════════════════════════════');

  const results = await generateChassisFrameGlbs('public/models/chassis');

  console.log('\nGenerated files:');
  for (const r of results) {
    console.log(`  ✓ ${r.filename} — ${(r.bytes / 1024).toFixed(1)} KB`);
  }
}

main().catch((err) => {
  console.error('Fatal chassis export error:', err);
  process.exit(1);
});

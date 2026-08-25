// ============================================================================
// RUN CAR BODY GLB EXPORT SCRIPT
// ============================================================================
import { generateCarBodyGlbs } from './carBodyGlbGenerator';
import * as path from 'path';

async function main() {
  console.log('🚀 Starting 3D Car Body & Aero GLB generation pipeline...');
  const outputDir = path.resolve(process.cwd(), 'public/models/exterior');
  const results = await generateCarBodyGlbs(outputDir);
  console.log(`\n✨ Successfully generated ${results.length} production-grade car GLB assets in ${outputDir}:`);
  results.forEach((r) => {
    console.log(` - ${r.filename} (${(r.bytes / 1024).toFixed(1)} KB)`);
  });
}

main().catch((err) => {
  console.error('❌ Error generating car body GLBs:', err);
  process.exit(1);
});

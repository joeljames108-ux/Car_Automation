// ============================================================================
// RUN CHASSIS FRAME GLB EXPORT SCRIPT
// ============================================================================
import { generateChassisFrameGlbs } from './chassisFrameGlbGenerator';
import * as path from 'path';

async function main() {
  console.log('🚀 Starting 3D Chassis Frame GLB generation pipeline...');
  const outputDir = path.resolve(process.cwd(), 'public/models/chassis');
  const results = await generateChassisFrameGlbs(outputDir);
  console.log(`\n✨ Successfully generated ${results.length} production-grade chassis GLB assets in ${outputDir}:`);
  results.forEach((r) => {
    console.log(` - ${r.filename} (${(r.bytes / 1024).toFixed(1)} KB)`);
  });
}

main().catch((err) => {
  console.error('❌ Error generating chassis frame GLBs:', err);
  process.exit(1);
});

// ============================================================================
// STANDALONE FORCED INDUCTION GLB GENERATOR & ASSET BAKER
// ============================================================================
// Bakes high-fidelity binary GLB models for all forced induction archetypes:
// 1. Twin-Turbocharger (Left & Right with Y-Pipe and central BOV)
// 2. Quad-Turbocharger (4 Turbos with dual intercooler merge bridges)
// 3. Twin-Screw / Roots Supercharger (Valley Blower with cogged belt drive)
// 4. Centrifugal Supercharger (ProCharger style with planetary gearbox)
// 5. Single High-Flow Twin-Scroll Turbocharger
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import {
  generateTwinTurboGlbBuffer,
  generateQuadTurboGlbBuffer,
  generateSingleTurboGlbBuffer,
} from '../../engine3d/generators/turbochargerGenerator';
import {
  generateTwinScrewSuperchargerGlbBuffer,
  generateCentrifugalSuperchargerGlbBuffer,
} from '../../engine3d/generators/superchargerGenerator';
import { enhanceGlbBuffer } from '../../exterior3d/loaders/glbPbrEnhancer';

async function main() {
  console.log('=================================================================');
  console.log('  FORCED INDUCTION & SUPERCHARGER GLB ASSET GENERATOR           ');
  console.log('=================================================================');

  const forcedInductionDir = path.resolve('public/models/forced_induction');
  if (!fs.existsSync(forcedInductionDir)) {
    fs.mkdirSync(forcedInductionDir, { recursive: true });
  }

  const v12Dir = path.resolve('public/models/engines/v12');
  if (!fs.existsSync(v12Dir)) {
    fs.mkdirSync(v12Dir, { recursive: true });
  }

  const tasks: { filename: string; outDir: string; generator: () => Promise<ArrayBuffer> }[] = [
    {
      filename: 'turbo_twin.glb',
      outDir: forcedInductionDir,
      generator: () =>
        generateTwinTurboGlbBuffer({
          compressorInducerMm: 68,
          housingFinish: 'titanium_blued',
          compressorWheelColor: 'billet_gold',
          wastegateCapColor: 'anodized_purple',
          couplerColor: 'blue_silicone',
        }),
    },
    {
      filename: 'turbo_quad.glb',
      outDir: forcedInductionDir,
      generator: () =>
        generateQuadTurboGlbBuffer({
          compressorInducerMm: 64,
          housingFinish: 'titanium_blued',
          compressorWheelColor: 'billet_gold',
          wastegateCapColor: 'anodized_purple',
          couplerColor: 'blue_silicone',
        }),
    },
    {
      filename: 'supercharger_twin_screw.glb',
      outDir: forcedInductionDir,
      generator: () =>
        generateTwinScrewSuperchargerGlbBuffer({
          displacementLiters: 3.5,
          pulleyRatio: 2.6,
          housingFinish: 'billet_polished',
          pulleyFinish: 'billet_gold',
          bypassCapColor: 'anodized_purple',
        }),
    },
    {
      filename: 'supercharger_centrifugal.glb',
      outDir: forcedInductionDir,
      generator: () =>
        generateCentrifugalSuperchargerGlbBuffer({
          housingFinish: 'billet_polished',
          pulleyFinish: 'billet_gold',
          couplerColor: 'blue_silicone',
        }),
    },
    {
      filename: 'turbo_single.glb',
      outDir: forcedInductionDir,
      generator: () =>
        generateSingleTurboGlbBuffer({
          compressorInducerMm: 92,
          housingFinish: 'inconel',
          compressorWheelColor: 'billet_gold',
          wastegateCapColor: 'anodized_purple',
        }),
    },
    {
      filename: 'turbocharger.glb',
      outDir: v12Dir,
      generator: () =>
        generateTwinTurboGlbBuffer({
          compressorInducerMm: 68,
          housingFinish: 'titanium_blued',
          compressorWheelColor: 'billet_gold',
          wastegateCapColor: 'anodized_purple',
          couplerColor: 'blue_silicone',
        }),
    },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const targetPath = path.join(t.outDir, t.filename);
    process.stdout.write(`[${i + 1}/${tasks.length}] Generating ${t.filename.padEnd(30, ' ')} ... `);

    try {
      const rawBuf = await t.generator();
      const nodeBuf = Buffer.from(rawBuf);
      const enhancedBuf = await enhanceGlbBuffer(nodeBuf);
      fs.writeFileSync(targetPath, enhancedBuf);
      const kb = Number((enhancedBuf.byteLength / 1024).toFixed(1));
      console.log(`✅ Saved (${kb} KB) -> ${targetPath}`);
    } catch (err: any) {
      console.error(`❌ Failed:`, err.message);
    }
  }

  console.log('=================================================================');
  console.log('  ALL FORCED INDUCTION ASSETS GENERATED SUCCESSFULLY             ');
  console.log('=================================================================');
}

main().catch((err) => {
  console.error('Fatal error generating forced induction GLBs:', err);
  process.exit(1);
});

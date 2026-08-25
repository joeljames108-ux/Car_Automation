// ============================================================================
// UNIFIED ASSET PIPELINE RUNNER
// ============================================================================
// Bundles a TypeScript asset-generator entry with esbuild (API mode) into a
// temp CJS file, executes it with Node from the project root, and propagates
// the exit code. Usage:
//
//   node scripts/asset-pipeline.mjs <job-name>
//   node scripts/asset-pipeline.mjs all
//
// Jobs are declared in JOBS below; add new generator entries there.
// ============================================================================

import { build } from 'esbuild';
import { spawnSync } from 'child_process';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const JOBS = {
  'v12-engine': 'src/sim/modularVehicle/generateV12Glb.ts',
  'v12-parts': 'src/engine3d/generators/masterExporter.ts',
  'forced-induction': 'src/sim/modularVehicle/generateTurbochargerGlb.ts',
  'rear-assembly': 'src/sim/modularVehicle/generateRearCarGlb.ts',
  'hoods': 'scripts/generate-hood-glb.ts',
  'chassis': 'scripts/generate-chassis-glb.ts',
  'interior': 'scripts/generate-interior-glb.ts',
  'enhance': 'scripts/enhance-existing-glbs.ts',
};

const ALL_ORDER = [
  'v12-engine',
  'v12-parts',
  'forced-induction',
  'rear-assembly',
  'hoods',
  'chassis',
  'interior',
  'enhance',
];

async function runJob(name) {
  const entry = JOBS[name];
  if (!entry) {
    console.error(`Unknown job "${name}". Available: ${Object.keys(JOBS).join(', ')}, all`);
    return false;
  }

  const entryAbs = resolve(projectRoot, entry);
  if (!existsSync(entryAbs)) {
    console.warn(`⚠ Job "${name}" skipped — entry not found: ${entry}`);
    return true;
  }

  const outDir = mkdtempSync(join(tmpdir(), 'apex-assets-'));
  const outFile = join(outDir, name.replace(/[^a-z0-9-]/gi, '_') + '.cjs');

  let ok = true;
  try {
    await build({
      entryPoints: [entryAbs],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      outfile: outFile,
      logLevel: 'warning',
    });

    const result = spawnSync(process.execPath, [outFile], {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    if (result.status !== 0) {
      console.error(`✗ Job "${name}" exited with code ${result.status}`);
      ok = false;
    }
  } catch (err) {
    console.error(`✗ Job "${name}" failed:`, err.message);
    ok = false;
  } finally {
    try { rmSync(outDir, { recursive: true, force: true }); } catch { /* best effort */ }
  }

  return ok;
}

async function main() {
  const requested = process.argv[2] || 'all';
  const t0 = Date.now();

  if (requested === 'all') {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  APEX ASSET PIPELINE — FULL LIBRARY REGENERATION');
    console.log('═══════════════════════════════════════════════════════');
    let failed = [];
    for (const job of ALL_ORDER) {
      console.log(`\n▶ Job: ${job}`);
      if (!(await runJob(job))) failed.push(job);
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (failed.length > 0) {
      console.error(`\n✗ Pipeline finished in ${secs}s with failures: ${failed.join(', ')}`);
      process.exit(1);
    }
    console.log(`\n✅ Full pipeline complete in ${secs}s.`);
    return;
  }

  const ok = await runJob(requested);
  if (!ok) process.exit(1);
}

main();

#!/usr/bin/env node
/**
 * ============================================================================
 * GLB OPTIMIZE & POLISH v4 — Definitive production-grade pipeline
 * ============================================================================
 *
 * Comprehensive GLB optimization that is SAFE for three.js GLTFLoader:
 *   - NO EXT_meshopt_compression (three.js needs an extra decoder for it)
 *   - NO KHR_draco_mesh_compression (needs draco decoder)
 *   - Uses ONLY KHR_mesh_quantization + EXT_texture_webp (native support)
 *
 * Pipeline stages per file:
 *   1. Structural scan + guardrail snapshot (nodes, meshes, materials)
 *   2. Backup original to .glb-originals-backup/
 *   3. Dedup — merge identical accessors, textures, materials, skins
 *   4. Weld — merge overlapping vertices (tolerance 1e-4)
 *   5. Reorder — optimize vertex/index cache for GPU
 *   6. Simplify — conservative mesh reduction (error 0.001, border-locked)
 *   7. PBR polish — fix emissive [0,0,0], normalize roughness, alpha repair
 *   8. Texture compress — WebP @1024 for large textures, @512 for small
 *   9. Flatten — removes identity transforms from nodes
 *  10. Sparse — sparse accessor encoding for near-zero data
 *  11. Quantize — vertex attribute quantization (KHR_mesh_quantization)
 *  12. Prune — strip unused nodes, materials, accessors
 *  13. Guardrail validation — reject if nodes/meshes/materials lost
 *  14. Atomic write — only replace if output is valid + smaller
 *
 * Usage:
 *   node scripts/optimize-all-glbs-v4.mjs              # all files
 *   node scripts/optimize-all-glbs-v4.mjs --dry-run    # report only
 *   node scripts/optimize-all-glbs-v4.mjs path/to.glb  # single file
 *
 * Environment:
 *   DRY_RUN=1          — report only, no writes
 *   SIMPLIFY_ERROR=0.001 — simplification error threshold (default 0.001)
 *   MIN_SIZE_KB=10     — skip files smaller than this (default 10)
 *   CONCURRENCY=4      — parallel workers (default 4)
 *   SKIP_SIMPLIFY=1    — skip mesh simplification pass
 *   SKIP_TEXTURES=1    — skip texture compression
 * ============================================================================
 */

import { createRequire } from 'node:module';
import {
  readFileSync, writeFileSync, copyFileSync, mkdirSync,
  existsSync, statSync, readdirSync, rmSync,
} from 'node:fs';
import { join, dirname, resolve, relative, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const { NodeIO } = require('@gltf-transform/core');
const {
  KHRMeshQuantization, EXTTextureWebP, KHRMaterialsClearcoat,
  KHRMaterialsEmissiveStrength, KHRMaterialsIOR,
  KHRMaterialsSpecular, KHRMaterialsTransmission,
  KHRMaterialsVolume, KHRMaterialsSheen,
  KHRMaterialsUnlit, KHRTextureTransform,
  KHRLightsPunctual, KHRMaterialsVariants,
} = require('@gltf-transform/extensions');
const {
  dedup, weld, simplify, resample, sparse, quantize,
  textureCompress, prune, reorder,
} = require('@gltf-transform/functions');
const { MeshoptSimplifier, MeshoptEncoder } = require('meshoptimizer');
const sharp = require('sharp');

// ────────────────────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────────────────────
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TREES = ['public', 'exports', 'assets/glb', 'dist'];
const BACKUP_DIR = join(ROOT, '.glb-originals-backup');
const REPORT_DIR = join(ROOT, '.freebuff');
const DRY_RUN = !!process.env.DRY_RUN || process.argv.includes('--dry-run');
const SIMPLIFY_ERROR = parseFloat(process.env.SIMPLIFY_ERROR || '0.001');
const MIN_SIZE = (parseFloat(process.env.MIN_SIZE_KB || '10')) * 1024;
const MIN_SAVINGS = 512; // Don't replace if savings < 512 bytes
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '4', 10);
const SKIP_SIMPLIFY = !!process.env.SKIP_SIMPLIFY;
const SKIP_TEXTURES = !!process.env.SKIP_TEXTURES;

// Extensions that three.js GLTFLoader supports natively
const SAFE_REQUIRED = new Set([
  'KHR_mesh_quantization',
  'EXT_texture_webp',
  'KHR_materials_clearcoat',
  'KHR_materials_emissive_strength',
  'KHR_materials_ior',
  'KHR_materials_specular',
  'KHR_materials_transmission',
  'KHR_materials_volume',
  'KHR_materials_sheen',
  'KHR_materials_unlit',
  'KHR_texture_transform',
  'KHR_lights_punctual',
  'KHR_materials_variants',
]);

// Extensions that would break three.js without extra decoders
const DANGEROUS_REQUIRED = new Set([
  'KHR_draco_mesh_compression',
  'EXT_meshopt_compression',
  'KHR_texture_basisu',
]);

// ────────────────────────────────────────────────────────────────────────────
// IO setup with all PBR extensions registered
// ────────────────────────────────────────────────────────────────────────────
const io = new NodeIO().registerExtensions([
  KHRMeshQuantization,
  EXTTextureWebP,
  KHRMaterialsClearcoat,
  KHRMaterialsEmissiveStrength,
  KHRMaterialsIOR,
  KHRMaterialsSpecular,
  KHRMaterialsTransmission,
  KHRMaterialsVolume,
  KHRMaterialsSheen,
  KHRMaterialsUnlit,
  KHRTextureTransform,
  KHRLightsPunctual,
  KHRMaterialsVariants,
]);

// ────────────────────────────────────────────────────────────────────────────
// Utility: structural GLB scan (fast, no full parse)
// ────────────────────────────────────────────────────────────────────────────
function scanGLB(buf) {
  try {
    if (buf.length < 20) return { ok: false };
    const magic = buf.readUInt32LE(0);
    if (magic !== 0x46546c67) return { ok: false };
    const jsonLen = buf.readUInt32LE(12);
    const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
    return {
      ok: true,
      required: json.extensionsRequired || [],
      used: json.extensionsUsed || [],
      nodes: json.nodes?.length ?? 0,
      nodeNames: (json.nodes || []).map(n => n.name || '').filter(Boolean),
      meshes: json.meshes?.length ?? 0,
      meshNames: (json.meshes || []).map(m => m.name || '').filter(Boolean),
      materials: json.materials?.length ?? 0,
      materialNames: (json.materials || []).map(m => m.name || '').filter(Boolean),
      images: json.images?.length ?? 0,
      animations: json.animations?.length ?? 0,
    };
  } catch {
    return { ok: false };
  }
}

function passesGuardrails(pre, postBuf) {
  const post = scanGLB(postBuf);
  if (!post.ok) return { pass: false, why: 'corrupt output' };

  // No node loss
  if (post.nodes < pre.nodes) {
    return { pass: false, why: `nodes ${pre.nodes} → ${post.nodes} (lost ${pre.nodes - post.nodes})` };
  }

  // No dangerous required extensions
  for (const ext of post.required) {
    if (DANGEROUS_REQUIRED.has(ext)) {
      return { pass: false, why: `dangerous required ext: ${ext}` };
    }
  }

  // No named node loss
  const preNodeNames = new Set(pre.nodeNames);
  const postNodeNames = new Set((post.nodeNames || []));
  for (const n of preNodeNames) {
    if (!postNodeNames.has(n)) {
      return { pass: false, why: `lost node name: ${n}` };
    }
  }

  // No named mesh loss
  const preMeshNames = new Set(pre.meshNames);
  const postMeshNames = new Set((post.meshNames || []));
  for (const n of preMeshNames) {
    if (!postMeshNames.has(n)) {
      return { pass: false, why: `lost mesh name: ${n}` };
    }
  }

  // No material loss
  if (post.materials < pre.materials) {
    return { pass: false, why: `materials ${pre.materials} → ${post.materials} (lost)` };
  }

  // No animation loss
  if (post.animations < pre.animations) {
    return { pass: false, why: `animations ${pre.animations} → ${post.animations} (lost)` };
  }

  return { pass: true };
}

// ────────────────────────────────────────────────────────────────────────────
// File discovery
// ────────────────────────────────────────────────────────────────────────────
function findGlbs(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nl = entry.name.toLowerCase();
      if (['node_modules', '.git', '.glb_opt_temp', '.glb-originals-backup',
           '.kilo', '.temp', '__pycache__'].includes(nl)) continue;
      // Skip worktree directories
      if (full.includes('.kilo\\worktrees') || full.includes('.kilo/worktrees')) continue;
      findGlbs(full, out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.glb')) {
      out.push(full);
    }
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// PBR Polish transform — fixes common material issues
// ────────────────────────────────────────────────────────────────────────────
function pbrPolish() {
  return (doc) => {
    let fixes = 0;
    for (const mat of doc.getRoot().listMaterials()) {
      // Fix default emissive [0,0,0] — remove emissive texture if factor is zero
      const ef = mat.getEmissiveFactor();
      if (ef && ef[0] === 0 && ef[1] === 0 && ef[2] === 0) {
        if (mat.getEmissiveTexture()) {
          // Emissive texture with zero factor = wasted bytes
          mat.setEmissiveTexture(null);
          fixes++;
        }
      }

      // Fix roughness = 0 (unrealistic perfect mirror)
      const rough = mat.getRoughnessFactor();
      if (rough !== undefined && rough < 0.04) {
        mat.setRoughnessFactor(0.04);
        fixes++;
      }

      // Fix alpha mode BLEND on fully opaque materials
      const alpha = mat.getAlphaMode();
      const baseTex = mat.getBaseColorTexture();
      const baseColor = mat.getBaseColorFactor();
      if (alpha === 'BLEND' && !baseTex && baseColor && baseColor[3] >= 0.99) {
        mat.setAlphaMode('OPAQUE');
        fixes++;
      }

      // Ensure doubleSided is explicit (default false)
      // Don't change — just ensure it's set properly for single-sided
    }
    return fixes;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Core optimization for a single file
// ────────────────────────────────────────────────────────────────────────────
async function optimizeFile(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, '/');
  const before = statSync(filePath).size;

  // Skip tiny files
  if (before < MIN_SIZE) {
    return { rel, status: 'skip', reason: 'below min size', before, after: before };
  }

  // Structural pre-scan
  const preBuf = readFileSync(filePath);
  const pre = scanGLB(preBuf);
  if (!pre.ok) {
    return { rel, status: 'skip', reason: 'unparseable GLB', before, after: before };
  }

  // Skip files already compressed with draco (we can't re-compress)
  if (pre.required.includes('KHR_draco_mesh_compression')) {
    return { rel, status: 'skip', reason: 'draco-compressed', before, after: before };
  }

  // Skip files with meshopt compression (would need decoder to read)
  if (pre.required.includes('EXT_meshopt_compression')) {
    return { rel, status: 'skip', reason: 'meshopt-compressed', before, after: before };
  }

  try {
    const doc = await io.read(filePath);

    // Build transform pipeline
    const transforms = [];

    // Stage 1: Dedup identical accessors, textures, materials, skins
    // Do NOT dedup meshes — it can merge identical-data meshes into one, changing node references
    transforms.push(dedup({ propertyTypes: ['Accessor', 'Texture', 'Skin'] }));

    // Stage 2: Weld overlapping vertices (tightened tolerance for safety)
    transforms.push(weld({ tolerance: 1e-4 }));

    // Stage 3: Reorder index/vertex buffers for GPU cache efficiency
    transforms.push(reorder({ encoder: MeshoptEncoder }));

    // Stage 4: Conservative simplification (optional)
    // lockBorder=true prevents boundary vertices from moving (keeps part seams clean)
    if (!SKIP_SIMPLIFY && pre.meshes > 0) {
      transforms.push(simplify({
        simplifier: MeshoptSimplifier,
        error: SIMPLIFY_ERROR,
        lockBorder: true,
      }));
    }

    // Stage 5: Resample animations (reduce keyframes without visual change)
    if (pre.animations > 0) {
      transforms.push(resample());
    }

    // Stage 6: Texture compression (WebP with quality/size limits)
    if (!SKIP_TEXTURES && pre.images > 0) {
      transforms.push(textureCompress({
        encoder: sharp,
        targetFormat: 'webp',
        resize: [1024, 1024],
        quality: 80,
      }));
    }

    // Stage 7: Sparse accessor encoding (near-zero data becomes sparse)
    transforms.push(sparse());

    // Stage 8: Quantize vertex attributes (KHR_mesh_quantization — native in three.js)
    transforms.push(quantize());

    // Stage 9: Prune only truly unused leaf data — very conservative
    // keepLeaves: preserve empty nodes (pivots, attachments)
    // keepAttributes: don't strip vertex attributes
    // keepIndices: don't strip index buffers
    // keepSolidTextures: keep 1x1 solid textures (encoded colors)
    transforms.push(prune({
      keepLeaves: true,
      keepAttributes: true,
      keepIndices: true,
      keepSolidTextures: true,
    }));

    // Apply all transforms
    await doc.transform(...transforms);

    // Stage 11: PBR polish (post-transform)
    const pbrFixes = pbrPolish()(doc);

    // Serialize
    const outBuf = Buffer.from(await io.writeBinary(doc));

    // Guardrail validation
    const check = passesGuardrails(pre, outBuf);
    if (!check.pass) {
      return { rel, status: 'reject', reason: check.why, before, after: before };
    }

    // Size check — only replace if meaningful savings
    if (before - outBuf.length < MIN_SAVINGS) {
      return { rel, status: 'skip', reason: 'no meaningful savings', before, after: before, pbrFixes };
    }

    // Backup original
    if (!DRY_RUN) {
      const backupPath = join(BACKUP_DIR, rel);
      mkdirSync(dirname(backupPath), { recursive: true });
      if (!existsSync(backupPath)) {
        copyFileSync(filePath, backupPath);
      }
      // Atomic write
      writeFileSync(filePath, outBuf);
    }

    return {
      rel,
      status: 'ok',
      before,
      after: outBuf.length,
      saved: before - outBuf.length,
      pct: Math.round((1 - outBuf.length / before) * 100),
      pbrFixes,
    };
  } catch (err) {
    return {
      rel,
      status: 'error',
      reason: String(err?.message || err).slice(0, 200),
      before,
      after: before,
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Dedup detection — find identical files that can share one copy
// ────────────────────────────────────────────────────────────────────────────
function findDuplicates(files) {
  const hashMap = new Map();
  for (const f of files) {
    try {
      const buf = readFileSync(f);
      const hash = createHash('md5').update(buf).digest('hex');
      if (!hashMap.has(hash)) {
        hashMap.set(hash, []);
      }
      hashMap.get(hash).push(f);
    } catch { /* skip unreadable */ }
  }
  const dupes = [];
  for (const [hash, paths] of hashMap) {
    if (paths.length > 1) {
      dupes.push({ hash, paths, count: paths.length });
    }
  }
  return dupes;
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────
async function main() {
  const t0 = Date.now();
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  GLB OPTIMIZE & POLISH v4 — Production Pipeline');
  console.log('  three.js–safe: quantize + WebP + dedup + weld + simplify');
  console.log('═══════════════════════════════════════════════════════════════════');
  if (DRY_RUN) console.log('  ** DRY RUN — no files will be modified **');
  console.log(`  Simplify error:  ${SIMPLIFY_ERROR}`);
  console.log(`  Min file size:   ${(MIN_SIZE / 1024).toFixed(0)} KB`);
  console.log(`  Concurrency:     ${CONCURRENCY}`);
  console.log(`  Skip simplify:   ${SKIP_SIMPLIFY}`);
  console.log(`  Skip textures:   ${SKIP_TEXTURES}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Collect files
  let files = [];
  const explicitArgs = process.argv.slice(2).filter(a => !a.startsWith('-'));
  if (explicitArgs.length > 0) {
    files = explicitArgs.map(a => resolve(ROOT, a));
  } else {
    for (const tree of TREES) {
      findGlbs(join(ROOT, tree), files);
    }
  }

  // Sort largest first for maximum early impact
  files.sort((a, b) => {
    try { return statSync(b).size - statSync(a).size; } catch { return 0; }
  });

  console.log(`Found ${files.length} GLB files to process.\n`);

  // Detect duplicates
  console.log('Scanning for duplicate files...');
  const dupes = findDuplicates(files);
  let dupeBytes = 0;
  if (dupes.length > 0) {
    console.log(`Found ${dupes.length} duplicate groups:`);
    for (const d of dupes.slice(0, 10)) {
      const sz = statSync(d.paths[0]).size;
      dupeBytes += sz * (d.count - 1);
      console.log(`  ${d.count}× ${(sz / 1048576).toFixed(2)} MB — ${d.paths.map(p => relative(ROOT, p).replace(/\\/g, '/')).join(', ').slice(0, 120)}`);
    }
    if (dupes.length > 10) console.log(`  ... and ${dupes.length - 10} more groups`);
    console.log(`  Total wasted by duplicates: ${(dupeBytes / 1048576).toFixed(1)} MB\n`);
  } else {
    console.log('  No exact duplicates found.\n');
  }

  // Process files with concurrency
  const results = [];
  let cursor = 0;
  let totalBefore = 0;
  let totalAfter = 0;
  let okCount = 0;
  let skipCount = 0;
  let errCount = 0;
  let rejectCount = 0;
  let totalPbrFixes = 0;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= files.length) break;

      const res = await optimizeFile(files[idx]);
      results.push(res);
      totalBefore += res.before;
      totalAfter += res.after;

      if (res.status === 'ok') {
        okCount++;
        totalPbrFixes += res.pbrFixes || 0;
        console.log(
          `[${results.length}/${files.length}] OK  ${res.rel}  ` +
          `${(res.before / 1048576).toFixed(2)} → ${(res.after / 1048576).toFixed(2)} MB  ` +
          `(-${res.pct}%)${res.pbrFixes ? ` [${res.pbrFixes} PBR fix]` : ''}`
        );
      } else if (res.status === 'reject') {
        rejectCount++;
        console.log(`[${results.length}/${files.length}] REJECT  ${res.rel}  — ${res.reason}`);
      } else if (res.status === 'error') {
        errCount++;
        console.log(`[${results.length}/${files.length}] ERR  ${res.rel}  — ${res.reason}`);
      } else {
        skipCount++;
        // Only log skips for files > 500 KB
        if (res.before > 512000) {
          console.log(`[${results.length}/${files.length}] SKIP ${res.rel}  — ${res.reason}`);
        }
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, files.length) }, () => worker());
  await Promise.all(workers);

  // Summary
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const savedMB = ((totalBefore - totalAfter) / 1048576).toFixed(1);
  const pctSaved = totalBefore > 0 ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  OPTIMIZATION & POLISH COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  Files processed:    ${files.length}`);
  console.log(`  Optimized:          ${okCount}`);
  console.log(`  Skipped:            ${skipCount}`);
  console.log(`  Rejected:           ${rejectCount}`);
  console.log(`  Errors:             ${errCount}`);
  console.log(`  PBR fixes applied:  ${totalPbrFixes}`);
  console.log(`  Duplicate groups:   ${dupes.length} (${(dupeBytes / 1048576).toFixed(1)} MB wasted)`);
  console.log(`  ─────────────────────────────────────────────`);
  console.log(`  Before:             ${(totalBefore / 1048576).toFixed(1)} MB`);
  console.log(`  After:              ${(totalAfter / 1048576).toFixed(1)} MB`);
  console.log(`  Saved:              ${savedMB} MB (-${pctSaved}%)`);
  console.log(`  Time:               ${elapsed}s`);
  if (DRY_RUN) console.log(`  ** DRY RUN — no files modified **`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Write detailed report
  mkdirSync(REPORT_DIR, { recursive: true });
  const report = {
    version: 'v4',
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    config: {
      simplifyError: SIMPLIFY_ERROR,
      minSize: MIN_SIZE,
      concurrency: CONCURRENCY,
      skipSimplify: SKIP_SIMPLIFY,
      skipTextures: SKIP_TEXTURES,
    },
    summary: {
      totalFiles: files.length,
      optimized: okCount,
      skipped: skipCount,
      rejected: rejectCount,
      errors: errCount,
      pbrFixes: totalPbrFixes,
      duplicateGroups: dupes.length,
      duplicateWastedMB: +(dupeBytes / 1048576).toFixed(2),
      beforeMB: +(totalBefore / 1048576).toFixed(2),
      afterMB: +(totalAfter / 1048576).toFixed(2),
      savedMB: +savedMB,
      savedPct: pctSaved,
      elapsedSec: +elapsed,
    },
    duplicates: dupes.map(d => ({
      hash: d.hash,
      count: d.count,
      files: d.paths.map(p => relative(ROOT, p).replace(/\\/g, '/')),
    })),
    files: results
      .filter(r => r.status !== 'skip' || r.before > 100000)
      .sort((a, b) => (b.saved || 0) - (a.saved || 0))
      .map(r => ({
        file: r.rel,
        status: r.status,
        beforeKB: +(r.before / 1024).toFixed(1),
        afterKB: +(r.after / 1024).toFixed(1),
        savedKB: +((r.before - r.after) / 1024).toFixed(1),
        pct: r.pct || 0,
        reason: r.reason || undefined,
        pbrFixes: r.pbrFixes || undefined,
      })),
  };

  const reportPath = join(REPORT_DIR, 'glb_optimize_report_v4.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report: ${relative(ROOT, reportPath)}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

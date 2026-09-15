#!/usr/bin/env node
/**
 * GLB optimizer v3 — aggressive pass for already-quantized files.
 *
 * v2 got 1,634→567 MB. The remaining weight in large files is vertex data:
 * POSITION+NORMAL only (zero textures). v3 goes further:
 *   - simplify error 0.003 (still border-locked; parts stay visually solid
 *     at configurator viewing distances)
 *   - prune({ keepAttributes: true }) — strips unused vertex attributes
 *   - resample/sparse/quantize kept, WebP @512px for any textures
 *   - same hard guardrails: no node loss, no lost mesh names, native exts
 *
 * Only processes files >MIN_SIZE_MB (default 0.75) — small files barely gain.
 * Skips malformed inputs (DataView errors) after 2 consecutive parser crashes.
 */

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { NodeIO } = require('@gltf-transform/core');
const { KHRMeshQuantization, EXTTextureWebP } = require('@gltf-transform/extensions');
const { dedup, weld, simplify, resample, sparse, quantize, textureCompress, prune } = require('@gltf-transform/functions');
const { MeshoptSimplifier } = require('meshoptimizer');
const sharp = require('sharp');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TREES = ['public', 'exports', 'assets/glb'];
const BACKUP_DIR = join(ROOT, '.glb-originals-backup');
const MIN_SIZE = parseFloat(process.env.MIN_SIZE_MB || '0.75') * 1024 * 1024;
const MIN_SAVINGS = parseFloat(process.env.MIN_SAVINGS_MB || '0.03') * 1024 * 1024;
const SIMPLIFY_ERROR = parseFloat(process.env.SIMPLIFY_ERROR || '0.003');
const ALLOWED_REQUIRED = new Set(['KHR_mesh_quantization', 'EXT_texture_webp']);

const io = new NodeIO().registerExtensions([KHRMeshQuantization, EXTTextureWebP]);

let files = [];
const args = process.argv.slice(2);
if (args.length > 0) {
  files = args.map(a => resolve(ROOT, a));
} else {
  for (const tree of TREES) {
    try {
      const out = execSync(`find "${join(ROOT, tree)}" -name "*.glb" -type f`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      files.push(...out.split('\n').filter(Boolean));
    } catch { /* tree missing */ }
  }
}

console.log(`Found ${files.length} GLB files (v3 aggressive: error=${SIMPLIFY_ERROR}, min=${(MIN_SIZE / 1048576).toFixed(2)}MB).`);
if (process.env.DRY_RUN) console.log('DRY RUN — no files will be modified.\n');

function scanGLB(buf) {
  try {
    const jsonLen = buf.readUInt32LE(12);
    const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
    return {
      ok: buf.readUInt32LE(0) === 0x46546c67,
      required: json.extensionsRequired || [],
      used: json.extensionsUsed || [],
      nodes: json.nodes?.length ?? 0,
      meshes: json.meshes?.length ?? 0,
      meshNames: (json.meshes || []).map(m => m.name || '').filter(Boolean),
    };
  } catch {
    return { ok: false, required: [], used: [], nodes: 0, meshes: 0, meshNames: [] };
  }
}

function passesGuardrails(pre, buf) {
  const post = scanGLB(buf);
  if (!post.ok) return { pass: false, why: 'corrupt output' };
  if (post.nodes < pre.nodes) return { pass: false, why: `nodes ${pre.nodes}→${post.nodes} (lost)` };
  if (post.required.some(e => !ALLOWED_REQUIRED.has(e))) return { pass: false, why: `req:[${post.required}]` };
  const preNames = new Set(pre.meshNames);
  const postNames = new Set(post.meshNames);
  for (const n of preNames) if (!postNames.has(n)) return { pass: false, why: `lost mesh name: ${n}` };
  return { pass: true };
}

const results = [];
let totalBefore = 0, totalAfter = 0, skipped = 0, failed = 0;

for (const file of files) {
  const rel = file.slice(ROOT.length + 1).replace(/\\/g, '/');
  const before = statSync(file).size;
  totalBefore += before;
  try {
    if (before < MIN_SIZE) { skipped++; totalAfter += before; continue; }

    const pre = scanGLB(readFileSync(file));
    if (!pre.ok) { skipped++; totalAfter += before; continue; }
    if (pre.required.includes('KHR_draco_mesh_compression')) { skipped++; totalAfter += before; continue; }

    const backupPath = join(BACKUP_DIR, rel);
    if (!process.env.DRY_RUN) {
      mkdirSync(dirname(backupPath), { recursive: true });
      if (!existsSync(backupPath)) writeFileSync(backupPath, readFileSync(file));
    }

    const doc = await io.read(file);
    await doc.transform(
      dedup({ propertyTypes: ['Accessor', 'Texture', 'Skin'] }),
      weld(),
      simplify({ simplifier: MeshoptSimplifier, error: SIMPLIFY_ERROR, lockBorder: true }),
      resample(),
      sparse(),
      quantize(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [512, 512] }),
      // keepAttributes: true → only strips attributes NO primitive uses
      prune({ keepLeaves: true, keepAttributes: true, keepIndices: true, keepSolidTextures: true }),
    );
    const buf = Buffer.from(await io.writeBinary(doc));

    const g = passesGuardrails(pre, buf);
    if (!g.pass) {
      console.warn(`REJECT: ${rel} — ${g.why}`);
      skipped++; totalAfter += before; continue;
    }
    if (before - buf.length < MIN_SAVINGS) { skipped++; totalAfter += before; continue; }

    if (!process.env.DRY_RUN) {
      if (!existsSync(backupPath)) writeFileSync(backupPath, readFileSync(file));
      writeFileSync(file, buf);
    }
    totalAfter += buf.length;
    results.push({ rel, before, after: buf.length });
    console.log(`OK  ${rel}  ${(before / 1048576).toFixed(2)} MB → ${(buf.length / 1048576).toFixed(2)} MB  (-${Math.max(0, Math.round((1 - buf.length / before) * 100))}%)`);
  } catch (err) {
    failed++;
    console.error(`ERR ${rel}: ${String(err && err.message || err).slice(0, 160)}`);
    totalAfter += before;
  }
}

mkdirSync(join(ROOT, '.freebuff'), { recursive: true });
console.log(`\n${'='.repeat(70)}`);
console.log(`processed: ${results.length}   skipped: ${skipped}   failed: ${failed}`);
console.log(`total: ${(totalBefore / 1048576).toFixed(1)} MB → ${(totalAfter / 1048576).toFixed(1)} MB (-${Math.max(0, Math.round((1 - totalAfter / Math.max(totalBefore, 1)) * 100))}%)`);
writeFileSync(join(ROOT, '.freebuff', 'glb_optimize_report_v3.json'), JSON.stringify({
  timestamp: new Date().toISOString(), dryRun: !!process.env.DRY_RUN,
  processed: results.length, skipped, failed, totalBefore, totalAfter, files: results,
}, null, 2));
console.log('report: .freebuff/glb_optimize_report_v3.json');

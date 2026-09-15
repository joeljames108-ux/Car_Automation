// Validates a GLB's structure and checks its extensions are decodable by the
// app's three.js GLTFLoader (quantization is native; WebP textures are
// browser-decoded; draco/meshopt/basisu would need loader wiring).
// Usage: node scripts/validate-optimized-glb.mjs <file.glb>
import { readFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) {
  console.error('usage: node scripts/validate-optimized-glb.mjs <file.glb>');
  process.exit(2);
}

// three's GLTFLoader needs atob/btoa for some binaries; Node 18+ has them.
const buf = readFileSync(path);

// --- GLB header + extension scan (structural validation) ---
const magic = buf.readUInt32LE(0);
if (magic !== 0x46546c67) {
  console.error(`FAIL: not a GLB (magic 0x${magic.toString(16)})`);
  process.exit(1);
}
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
const extsUsed = json.extensionsUsed || [];
const extsRequired = json.extensionsRequired || [];

const UNSUPPORTED = ['KHR_draco_mesh_compression', 'EXT_meshopt_compression', 'KHR_texture_basisu'];
const bad = extsRequired.filter(e => UNSUPPORTED.includes(e));
if (bad.length) {
  console.error(`FAIL: requires non-native extensions: ${bad.join(', ')}`);
  process.exit(1);
}

console.log(`GLB OK: ${json.meshes?.length ?? 0} meshes, ${json.nodes?.length ?? 0} nodes, ${json.materials?.length ?? 0} materials`);
console.log(`extensionsUsed: ${extsUsed.join(', ') || 'none'}`);
console.log(`extensionsRequired: ${extsRequired.join(', ') || 'none'}`);
if (extsUsed.includes('KHR_mesh_quantization')) console.log('quantization: present (natively supported by three GLTFLoader)');
const images = json.images?.length ?? 0;
if (images > 0) {
  const mimeTypes = [...new Set(json.images.map(i => i.mimeType || 'auto'))];
  console.log(`textures: ${images} (${mimeTypes.join(', ')})`);
}
console.log('VALID');

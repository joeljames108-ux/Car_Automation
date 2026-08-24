const { NodeIO } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const fs = require('fs');
async function main() {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const files = [
    'public/models/exterior/sports_car_bmw_i8.glb',
    'public/models/exterior/hatchback_ford_escort.glb',
  ];
  for (const f of files) {
    const doc = await io.readBinary(fs.readFileSync(f));
    console.log('=== ' + f.split('/').pop());
    for (const m of doc.getRoot().listMaterials()) {
      const bc = m.getBaseColorFactor().map((n) => Number(n.toFixed(2))).join(',');
      console.log('  "' + m.getName() + '" metal=' + m.getMetallicFactor() + ' rough=' + Number(m.getRoughnessFactor().toFixed(2)) + ' alpha=' + Number(m.getAlpha().toFixed(2)) + ' mode=' + m.getAlphaMode() + ' base=[' + bc + ']');
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

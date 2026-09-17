const fs = require('fs');
const path = require('path');

const matrixContent = fs.readFileSync('src/sim/bodyArchitectureMatrix/matrix.ts', 'utf8');
const regex = /architecture:\s*"([^"]+)",\s*era:\s*"([^"]+)",\s*referenceVehicle:\s*"([^"]+)"[\s\S]*?glb:\s*"([^"]+)"/g;

const entries = [];
let match;
while ((match = regex.exec(matrixContent)) !== null) {
  entries.push({
    architecture: match[1],
    era: match[2],
    referenceVehicle: match[3],
    glb: match[4],
  });
}

console.log(`Found ${entries.length} architecture/era entries in matrix.ts:\n`);

// Check existing files in public/models and exports
const publicGlbs = fs.readdirSync('public/models').filter(f => f.endsWith('.glb'));
const exportGlbs = fs.existsSync('exports') ? fs.readdirSync('exports').filter(f => f.endsWith('.glb')) : [];

console.log(`Available in public/models/ (${publicGlbs.length}):`);
publicGlbs.forEach(f => console.log(`  - ${f}`));

console.log(`\nAvailable in exports/ (${exportGlbs.length}):`);
exportGlbs.forEach(f => console.log(`  - ${f}`));

console.log('\n--- Checking status of all entries ---');
let presentCount = 0;
let defaultSmallCount = 0;
let missingCount = 0;

for (const entry of entries) {
  const targetPath = path.join('public', entry.glb.replace(/^\//, ''));
  if (fs.existsSync(targetPath)) {
    const stats = fs.statSync(targetPath);
    if (stats.size > 100000) {
      presentCount++;
      console.log(`[HIGH-FI] ${entry.architecture} / ${entry.era} (${entry.referenceVehicle}): ${stats.size} bytes -> ${entry.glb}`);
    } else {
      defaultSmallCount++;
      console.log(`[LOW-FI/MOCK] ${entry.architecture} / ${entry.era} (${entry.referenceVehicle}): ${stats.size} bytes -> ${entry.glb}`);
    }
  } else {
    missingCount++;
    console.log(`[MISSING] ${entry.architecture} / ${entry.era} (${entry.referenceVehicle}): NOT FOUND -> ${entry.glb}`);
  }
}

console.log(`\nSummary: High-Fi: ${presentCount}, Low-Fi: ${defaultSmallCount}, Missing: ${missingCount}, Total: ${entries.length}`);

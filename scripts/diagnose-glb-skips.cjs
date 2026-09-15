// Diagnose which GLBs the optimizer skipped and why.
const r = require('../.freebuff/glb_optimize_report.json');
const fs = require('fs');
const processedSet = new Set(r.files.map(f => f.rel.replace(/\\/g, '/')));
const sizes = fs.readFileSync('../.freebuff/glb_inventory.txt', 'utf8')
  .split('\n').filter(Boolean).map(l => ({ size: +l.split(' ')[0], p: l.split(' ').slice(1).join(' ') }));
let big = 0, small = 0;
for (const { size, p } of sizes) {
  if (processedSet.has(p)) continue;
  if (size > 1024 * 1024) { big++; if (big <= 8) console.log('BIG unprocessed:', (size / 1048576).toFixed(1) + 'MB', p); }
  else small++;
}
console.log({ bigUnprocessed: big, smallSkipped: small });
// Where did the optimizer look?
const invTotal = sizes.length;
console.log('inventory files:', invTotal, '| optimizer found:', r.processed + r.skipped + r.failed);

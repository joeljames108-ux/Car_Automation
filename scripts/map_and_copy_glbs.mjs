import fs from 'fs';
import path from 'path';

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

// Read all GLB files from exports and public/models
const exportFiles = fs.existsSync('exports') ? fs.readdirSync('exports').filter(f => f.endsWith('.glb')) : [];
const rootModelFiles = fs.readdirSync('public/models').filter(f => f.endsWith('.glb'));

console.log('=== All Entries in matrix.ts ===');
console.log(`Total architecture/era slots: ${entries.length}`);

// Build a lookup map of available generated GLBs
// Look in both exports/ and public/models/
const candidates = [];

for (const f of exportFiles) {
  const p = path.join('exports', f);
  const size = fs.statSync(p).size;
  candidates.push({ filename: f, path: p, size, source: 'exports' });
}

for (const f of rootModelFiles) {
  const p = path.join('public/models', f);
  const size = fs.statSync(p).size;
  // avoid duplicate if same name and size
  if (!candidates.some(c => c.filename === f && c.size === size)) {
    candidates.push({ filename: f, path: p, size, source: 'public/models' });
  }
}

console.log(`\nTotal candidate GLB files found: ${candidates.length}`);

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const mappings = [];

for (const entry of entries) {
  const normRef = normalize(entry.referenceVehicle);
  const normEra = normalize(entry.era);
  const normArch = normalize(entry.architecture);

  // Find best candidate match
  let bestMatch = null;
  let bestScore = 0;

  for (const cand of candidates) {
    const normFile = normalize(cand.filename);
    let score = 0;

    // Check era match
    const eraMatch = normFile.includes(normEra);
    
    // Check tokens from reference vehicle
    const refWords = entry.referenceVehicle.split(/[\s\-_()]+/).filter(w => w.length > 1);
    let wordMatches = 0;
    for (const w of refWords) {
      if (normFile.includes(normalize(w))) {
        wordMatches++;
      }
    }

    if (wordMatches >= 2 && eraMatch) {
      score = wordMatches * 10 + (cand.size > 100000 ? 5 : 0);
    } else if (wordMatches >= 2) {
      score = wordMatches * 5;
    } else if (normFile.includes(normRef)) {
      score = 50;
    }

    // Specific known mappings
    if (cand.filename.toLowerCase().includes('peugeot_205') && entry.referenceVehicle.includes('Peugeot 205')) score = 100;
    if (cand.filename.toLowerCase().includes('golf_gti_mk1') && entry.referenceVehicle.includes('Golf GTI Mk1')) score = 100;
    if (cand.filename.toLowerCase().includes('civic_type_r_ek9') && entry.referenceVehicle.includes('Civic Type R (EK9)')) score = 100;
    if (cand.filename.toLowerCase().includes('clio_v6') && entry.referenceVehicle.includes('Clio V6')) score = 100;
    if (cand.filename.toLowerCase().includes('focus_rs_mk3') && entry.referenceVehicle.includes('Focus RS Mk3')) score = 100;
    if (cand.filename.toLowerCase().includes('gr_yaris') && entry.referenceVehicle.includes('GR Yaris')) score = 100;
    if (cand.filename.toLowerCase().includes('n_vision_74') && entry.referenceVehicle.includes('N Vision 74')) score = 100;
    if (cand.filename.toLowerCase().includes('w116') && entry.referenceVehicle.includes('W116')) score = 100;
    if (cand.filename.toLowerCase().includes('190e') && entry.referenceVehicle.includes('190E')) score = 100;
    if (cand.filename.toLowerCase().includes('e39') && entry.referenceVehicle.includes('E39')) score = 100;
    if (cand.filename.toLowerCase().includes('rs6_c6') && entry.referenceVehicle.includes('RS6 (C6)')) score = 100;
    if (cand.filename.toLowerCase().includes('giulia_quadrifoglio') && entry.referenceVehicle.includes('Giulia Quadrifoglio')) score = 100;
    if (cand.filename.toLowerCase().includes('civic_sedan') && entry.referenceVehicle.includes('Civic Sedan')) score = 100;
    if (cand.filename.toLowerCase().includes('grandsphere') && entry.referenceVehicle.includes('Grandsphere')) score = 100;
    if (cand.filename.toLowerCase().includes('datsun_240z') && entry.referenceVehicle.includes('240Z')) score = 100;
    if (cand.filename.toLowerCase().includes('ferrari_458') && entry.referenceVehicle.includes('458 Italia')) score = 100;
    if (cand.filename.toLowerCase().includes('countach') && entry.referenceVehicle.includes('Countach')) score = 100;
    if (cand.filename.toLowerCase().includes('ferrari_f40') && entry.referenceVehicle.includes('F40')) score = 100;
    if (cand.filename.toLowerCase().includes('mclaren_f1') && entry.referenceVehicle.includes('McLaren F1')) score = 100;
    if (cand.filename.toLowerCase().includes('veyron') && entry.referenceVehicle.includes('Veyron')) score = 100;
    if (cand.filename.toLowerCase().includes('porsche_918') && entry.referenceVehicle.includes('918 Spyder')) score = 100;
    if (cand.filename.toLowerCase().includes('chiron') && entry.referenceVehicle.includes('Chiron')) score = 100;
    if (cand.filename.toLowerCase().includes('revuelto') && entry.referenceVehicle.includes('Revuelto')) score = 100;
    if (cand.filename.toLowerCase().includes('evija') && entry.referenceVehicle.includes('Evija')) score = 100;
    if (cand.filename.toLowerCase().includes('jesko') && entry.referenceVehicle.includes('Jesko')) score = 100;
    if (cand.filename.toLowerCase().includes('speirling') && entry.referenceVehicle.includes('Speirling')) score = 100;
    if (cand.filename.toLowerCase().includes('nsx') && entry.referenceVehicle.includes('NSX')) score = 100;
    if (cand.filename.toLowerCase().includes('ford_gt_2005') && entry.referenceVehicle.includes('Ford GT')) score = 100;
    if (cand.filename.toLowerCase().includes('mc20') && entry.referenceVehicle.includes('MC20')) score = 100;
    if (cand.filename.toLowerCase().includes('skyline_gt_r_r34') && entry.referenceVehicle.includes('R34')) score = 100;
    if (cand.filename.toLowerCase().includes('supra_a80') && entry.referenceVehicle.includes('Supra')) score = 100;
    if (cand.filename.toLowerCase().includes('rx_7_fc3s') && entry.referenceVehicle.includes('RX-7')) score = 100;
    if (cand.filename.toLowerCase().includes('m4_gts') && entry.referenceVehicle.includes('M4 GTS')) score = 100;
    if (cand.filename.toLowerCase().includes('a110_r') && entry.referenceVehicle.includes('A110')) score = 100;
    if (cand.filename.toLowerCase().includes('synergy') && entry.referenceVehicle.includes('Synergy')) score = 100;
    if (cand.filename.toLowerCase().includes('audi_quattro') && entry.referenceVehicle.includes('Quattro')) score = 100;
    if (cand.filename.toLowerCase().includes('911_turbo_930') && entry.referenceVehicle.includes('930')) score = 100;
    if (cand.filename.toLowerCase().includes('928_s4') && entry.referenceVehicle.includes('928')) score = 100;
    if (cand.filename.toLowerCase().includes('db7') && entry.referenceVehicle.includes('DB7')) score = 100;
    if (cand.filename.toLowerCase().includes('dbs_v12') && entry.referenceVehicle.includes('DBS')) score = 100;
    if (cand.filename.toLowerCase().includes('continental_gt') && entry.referenceVehicle.includes('Continental GT')) score = 100;
    if (cand.filename.toLowerCase().includes('celestiq') && entry.referenceVehicle.includes('Celestiq')) score = 100;
    if (cand.filename.toLowerCase().includes('challenger_r_t_1970') && entry.referenceVehicle.includes('Challenger R/T')) score = 100;
    if (cand.filename.toLowerCase().includes('foxbody') && entry.referenceVehicle.includes('Foxbody')) score = 100;
    if (cand.filename.toLowerCase().includes('camaro_ss_4th') && entry.referenceVehicle.includes('Camaro SS')) score = 100;
    if (cand.filename.toLowerCase().includes('mustang_gt_2005') && entry.referenceVehicle.includes('Mustang GT')) score = 100;
    if (cand.filename.toLowerCase().includes('hellcat') && entry.referenceVehicle.includes('Hellcat')) score = 100;
    if (cand.filename.toLowerCase().includes('demon_170') && entry.referenceVehicle.includes('Demon 170')) score = 100;
    if (cand.filename.toLowerCase().includes('charger_daytona') && entry.referenceVehicle.includes('Charger Daytona')) score = 100;
    if (cand.filename.toLowerCase().includes('917_living') && entry.referenceVehicle.includes('917')) score = 100;
    if (cand.filename.toLowerCase().includes('959') && entry.referenceVehicle.includes('959')) score = 100;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = cand;
    }
  }

  if (bestMatch && bestScore >= 20) {
    mappings.push({
      architecture: entry.architecture,
      era: entry.era,
      referenceVehicle: entry.referenceVehicle,
      targetGlb: path.join('public', entry.glb.replace(/^\//, '')),
      sourcePath: bestMatch.path,
      sourceFile: bestMatch.filename,
      sourceSize: bestMatch.size,
      score: bestScore
    });
  }
}

console.log(`\nMatched ${mappings.length} reference vehicles to generated GLBs:`);
for (const m of mappings) {
  console.log(`[MATCH ${m.score}] ${m.architecture} / ${m.era} (${m.referenceVehicle}) <- ${m.sourcePath} (${(m.sourceSize/1024).toFixed(1)} KB) -> ${m.targetGlb}`);
}

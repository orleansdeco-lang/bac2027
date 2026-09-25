import fs from 'fs';

const progs = JSON.parse(fs.readFileSync('scripts/programs_audit_dump.json', 'utf8'));
for (const p of progs) {
  console.log(`\n=== [${p.code}] ${p.nameFr} (${p.nameAr}) ===`);
  if (!p.cutoffs || p.cutoffs.length === 0) {
    console.log('  NO CUTOFFS RECORDED');
  } else {
    for (const c of p.cutoffs) {
      console.log(`  Year: ${c.year} | Inst: ${c.institutionId || 'ALL'} | Stream: ${c.stream || 'ALL'} | General: ${c.generalCutoff} | Weighted: ${c.weightedCutoff} | Source: ${c.source} | URL: ${c.sourceUrl}`);
    }
  }
}

import fs from 'fs';

const currentContent = fs.readFileSync('src/domain/content/sciences-exp-snv-packages.ts', 'utf8');

// The header and first 4 packages end before package 5
// Find the occurrence of package 5 marker
const p5Marker = '// 5. snv_self_nonself_hla_recognition';
const p5Index = currentContent.indexOf(p5Marker);
if (p5Index === -1) {
  throw new Error('Could not find package 5 marker');
}

// Backtrack to the comment bar before package 5
const beforeP5 = currentContent.substring(0, p5Index);
const lastBarIndex = beforeP5.lastIndexOf('// ============================================================================');
const part1 = currentContent.substring(0, lastBarIndex).trim();

export const HEADER_AND_PART_1 = part1;

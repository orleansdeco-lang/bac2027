import fs from 'fs';
import path from 'path';

const patterns = [
  'معايير التصحيح الوزاري',
  'تصحيح وزاري',
  'official correction',
  'official coefficient',
  'official BAC weight',
  'official current syllabus',
  'guaranteed score',
  'ستحصل على',
  'علامة مضمونة',
  'تضمن لك',
  'proven to increase score',
  'ministerial standard',
  'official frequency',
  'most frequent BAC question',
  'معامل 7',
  'معامل 6',
  '2027',
  'coefficient',
  'وزاري'
];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.next') && !full.includes('.git')) {
        walk(full, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.mjs') || file.endsWith('.md')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const allFiles = walk('src');
const hits = [];

for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  for (const p of patterns) {
    if (content.includes(p)) {
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (l.includes(p)) {
          hits.push({ file: f, line: idx + 1, pattern: p, text: l.trim() });
        }
      });
    }
  }
}

console.log('Total hits found in src:', hits.length);
hits.forEach(h => {
  console.log(`[${h.pattern}] ${h.file}:${h.line} -> ${h.text.slice(0, 120)}`);
});

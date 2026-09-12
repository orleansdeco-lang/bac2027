import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const moduleCache = new Map();
function loadTs(relPath) {
  const fullPath = path.resolve(relPath);
  if (moduleCache.has(fullPath)) return moduleCache.get(fullPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  const result = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const m = { exports: {} };
  moduleCache.set(fullPath, m.exports);
  const fn = new Function('exports', 'require', 'module', result.outputText);
  fn(m.exports, (reqPath) => {
    let target = reqPath;
    if (target.startsWith('@/')) target = path.resolve(target.replace('@/', 'src/'));
    else if (target.startsWith('.')) target = path.resolve(path.dirname(fullPath), target);
    if (fs.existsSync(target + '.ts')) return loadTs(target + '.ts');
    if (fs.existsSync(target + '/index.ts')) return loadTs(target + '/index.ts');
    if (fs.existsSync(target) && fs.statSync(target).isFile()) return loadTs(target);
    return {};
  }, m);
  return m.exports;
}

const {
  PROMPT11_SKILLS,
  PROMPT11_PRACTICE_QUESTIONS,
  PROMPT11_RETEST_QUESTIONS,
  PROMPT12_LESSONS,
} = loadTs('src/domain/content/mappings.ts');

function normalizeMath(str) {
  return (str || '')
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/·/g, '')
    .replace(/×/g, '')
    .toLowerCase();
}

console.log('Auditing normalized equation overlap between Worked Examples and Retests/Practice:');
const overlaps = [];

for (const skill of PROMPT11_SKILLS) {
  const lesson = PROMPT12_LESSONS.find(l => l.skillId === skill.id);
  const pqs = PROMPT11_PRACTICE_QUESTIONS.filter(q => q.skillId === skill.id);
  const rq = PROMPT11_RETEST_QUESTIONS.find(q => q.skillId === skill.id);

  if (lesson?.workedExample && rq) {
    const normWe = normalizeMath(lesson.workedExample.problem_ar);
    const normRq = normalizeMath(rq.prompt_ar);

    // Look for equations containing '='
    const weEqs = lesson.workedExample.problem_ar.match(/[^\s،,;:]+=[^\s،,;:]+/g) || [];
    const rqEqs = rq.prompt_ar.match(/[^\s،,;:]+=[^\s،,;:]+/g) || [];

    for (const weEq of weEqs) {
      const normWeEq = normalizeMath(weEq);
      if (normWeEq.length > 5) {
        for (const rqEq of rqEqs) {
          const normRqEq = normalizeMath(rqEq);
          if (normWeEq === normRqEq) {
            overlaps.push({
              skillId: skill.id,
              type: 'WORKED_EXAMPLE_VS_RETEST',
              weEquation: weEq,
              rqEquation: rqEq,
            });
          }
        }
      }
    }
  }

  // Also check Practice vs Retest equations
  if (rq) {
    for (const pq of pqs) {
      const pqEqs = pq.prompt_ar.match(/[^\s،,;:]+=[^\s،,;:]+/g) || [];
      const rqEqs = rq.prompt_ar.match(/[^\s،,;:]+=[^\s،,;:]+/g) || [];
      for (const pe of pqEqs) {
        const normPe = normalizeMath(pe);
        if (normPe.length > 5) {
          for (const re of rqEqs) {
            const normRe = normalizeMath(re);
            if (normPe === normRe) {
              overlaps.push({
                skillId: skill.id,
                type: 'PRACTICE_VS_RETEST',
                pqEquation: pe,
                rqEquation: re,
              });
            }
          }
        }
      }
    }
  }
}

console.log(`Found ${overlaps.length} normalized equation overlaps:`);
console.log(JSON.stringify(overlaps, null, 2));

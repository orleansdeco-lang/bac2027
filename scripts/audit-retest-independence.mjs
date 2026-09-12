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

const findings = [];

for (const skill of PROMPT11_SKILLS) {
  const lesson = PROMPT12_LESSONS.find(l => l.skillId === skill.id);
  const pqs = PROMPT11_PRACTICE_QUESTIONS.filter(q => q.skillId === skill.id);
  const rq = PROMPT11_RETEST_QUESTIONS.find(q => q.skillId === skill.id);
  const parentPq = rq ? pqs.find(p => p.id === rq.retestForQuestionId) : null;

  if (!rq) {
    findings.push({ skillId: skill.id, severity: 'CRITICAL', issue: 'MISSING_RETEST' });
    continue;
  }

  // 1. Compare Retest to Worked Example
  if (lesson?.workedExample) {
    const weProb = lesson.workedExample.problem_ar;
    const rqPrompt = rq.prompt_ar;
    // Check if mathematical formula in worked example is identical to formula in retest
    const weMathMatches = weProb.match(/[a-zA-Z0-9_\^\\\+\-\*\/\=\(\)\.]{4,}/g) || [];
    const rqMathMatches = rqPrompt.match(/[a-zA-Z0-9_\^\\\+\-\*\/\=\(\)\.]{4,}/g) || [];
    
    // Check for exact matching equation/problem
    for (const wm of weMathMatches) {
      if (wm.length > 8 && rqMathMatches.includes(wm)) {
        findings.push({
          skillId: skill.id,
          severity: 'MAJOR',
          issue: 'WORKED_EXAMPLE_EQUATION_REUSED_IN_RETEST',
          matchedFormula: wm,
          workedExampleProblem: weProb,
          retestPrompt: rqPrompt,
        });
      }
    }
  }

  // 2. Compare Retest to Parent Practice Question
  if (parentPq) {
    const pPrompt = parentPq.prompt_ar.replace(/^\[.*?\]\s*/, '').trim();
    const rPrompt = rq.prompt_ar.replace(/^\[.*?\]\s*/, '').trim();

    // Word token overlap
    const pWords = pPrompt.split(/\s+/).filter(w => w.length > 2);
    const rWords = rPrompt.split(/\s+/).filter(w => w.length > 2);
    const commonWords = pWords.filter(w => rWords.includes(w));
    const overlapRatio = commonWords.length / Math.min(pWords.length, rWords.length);

    // Number extraction
    const pNums = pPrompt.match(/\d+(\.\d+)?/g) || [];
    const rNums = rPrompt.match(/\d+(\.\d+)?/g) || [];

    // If text is essentially identical except numbers
    let textWithoutNumbersP = pPrompt.replace(/\d+/g, '#');
    let textWithoutNumbersR = rPrompt.replace(/\d+/g, '#');
    if (textWithoutNumbersP === textWithoutNumbersR) {
      findings.push({
        skillId: skill.id,
        severity: 'MAJOR',
        issue: 'COSMETIC_NUMBER_CHANGE_ONLY',
        parentPrompt: pPrompt,
        retestPrompt: rPrompt,
      });
    }

    // Check if options are essentially identical
    const pCorrect = parentPq.options.find(o => o.id === parentPq.correctAnswerId)?.text_ar;
    const rCorrect = rq.options.find(o => o.id === rq.correctAnswerId)?.text_ar;
    if (pCorrect && rCorrect && pCorrect.trim() === rCorrect.trim()) {
      findings.push({
        skillId: skill.id,
        severity: 'CRITICAL',
        issue: 'SAME_CORRECT_ANSWER_STRING_AS_PRACTICE',
        parentAnswer: pCorrect,
        retestAnswer: rCorrect,
      });
    }
  }
}

console.log('Total retest adversarial findings:', findings.length);
fs.writeFileSync('docs/bac-mastery/retest_adversarial_findings.json', JSON.stringify(findings, null, 2));
findings.forEach(f => {
  console.log(`[${f.severity}] ${f.skillId} -> ${f.issue}`);
  if (f.matchedFormula) console.log(`  Formula: ${f.matchedFormula}`);
  if (f.parentPrompt) console.log(`  P: ${f.parentPrompt}`);
  if (f.retestPrompt) console.log(`  R: ${f.retestPrompt}`);
});

import fs from 'fs';

const dump = JSON.parse(fs.readFileSync('docs/bac-mastery/full_audit_dump.json', 'utf8'));

console.log(`Total skills loaded: ${dump.length}`);

// Group by subject
const mathSkills = dump.filter(s => s.subjectId === 'math');
const physicsSkills = dump.filter(s => s.subjectId === 'physics');
const snvSkills = dump.filter(s => s.subjectId === 'natural_sciences');

console.log(`Math: ${mathSkills.length}, Physics: ${physicsSkills.length}, SNV: ${snvSkills.length}`);

// Inspect Retest Independence
console.log('\n=================== RETEST INDEPENDENCE AUDIT ===================');
const retestFindings = [];
for (const skill of dump) {
  const pQuestions = skill.practiceQuestions;
  const retest = skill.retestQuestion;
  if (!retest) {
    retestFindings.push({ skillId: skill.skillId, issue: 'MISSING_RETEST' });
    continue;
  }
  
  // Compare retest with its parent practice question or practice questions
  for (const p of pQuestions) {
    const pPrompt = p.prompt_ar.trim();
    const rPrompt = retest.prompt_ar.trim();
    
    // Check identical prompts
    if (pPrompt === rPrompt) {
      retestFindings.push({ skillId: skill.skillId, severity: 'CRITICAL', issue: 'IDENTICAL_PROMPT', pId: p.id, rId: retest.id });
    }
    
    // Check if options are identical
    const pOptTexts = p.options.map(o => o.text_ar).sort().join('|');
    const rOptTexts = retest.options.map(o => o.text_ar).sort().join('|');
    if (pOptTexts === rOptTexts) {
      retestFindings.push({ skillId: skill.skillId, severity: 'MAJOR', issue: 'IDENTICAL_OPTIONS', pId: p.id, rId: retest.id });
    }
    
    // Check Levenshtein or token similarity
    const pTokens = new Set(pPrompt.split(/\s+/));
    const rTokens = new Set(rPrompt.split(/\s+/));
    const intersection = [...pTokens].filter(t => rTokens.has(t));
    const jaccard = intersection.length / Math.max(pTokens.size, rTokens.size);
    
    if (jaccard > 0.85) {
      retestFindings.push({
        skillId: skill.skillId,
        severity: 'MAJOR',
        issue: 'HIGH_TOKEN_OVERLAP',
        jaccard: jaccard.toFixed(2),
        pPrompt,
        rPrompt
      });
    }
  }
}
console.log(`Retest issues found: ${retestFindings.length}`);
retestFindings.forEach(f => console.log(JSON.stringify(f, null, 2)));

// Inspect Quick Recall
console.log('\n=================== QUICK RECALL AUDIT ===================');
const recallFindings = [];
for (const skill of dump) {
  const qrP = skill.lesson?.quickRecallPrompt_ar;
  const qrA = skill.lesson?.quickRecallAnswer_ar;
  if (!qrP || !qrA) {
    recallFindings.push({ skillId: skill.skillId, issue: 'MISSING_QUICK_RECALL' });
  } else if (qrP.trim() === qrA.trim()) {
    recallFindings.push({ skillId: skill.skillId, issue: 'PROMPT_EQUALS_ANSWER' });
  } else if (qrA.length < 5) {
    recallFindings.push({ skillId: skill.skillId, issue: 'TRIVIAL_ANSWER', answer: qrA });
  }
}
console.log(`Quick recall issues: ${recallFindings.length}`);
recallFindings.forEach(f => console.log(JSON.stringify(f)));

// Inspect Option Correctness and Error Taxonomy
console.log('\n=================== PRACTICE QUESTIONS AUDIT ===================');
const pqFindings = [];
for (const skill of dump) {
  for (const q of skill.practiceQuestions) {
    // Check single correct answer
    const correctOpt = q.options.find(o => o.id === q.correctAnswerId);
    if (!correctOpt) {
      pqFindings.push({ skillId: skill.skillId, qId: q.id, issue: 'NO_MATCHING_CORRECT_ANSWER_ID', cId: q.correctAnswerId });
    }
    // Check distractors have suspectedErrorType
    const distractors = q.options.filter(o => o.id !== q.correctAnswerId);
    const missingErrorTag = distractors.filter(d => !d.suspectedErrorType);
    if (missingErrorTag.length > 0) {
      pqFindings.push({ skillId: skill.skillId, qId: q.id, issue: 'DISTRACTOR_MISSING_ERROR_TYPE', count: missingErrorTag.length });
    }
    // Check explanation exists and is meaningful
    if (!q.explanation_ar || q.explanation_ar.length < 20) {
      pqFindings.push({ skillId: skill.skillId, qId: q.id, issue: 'INSUFFICIENT_EXPLANATION' });
    }
  }
  
  if (skill.retestQuestion) {
    const q = skill.retestQuestion;
    const correctOpt = q.options.find(o => o.id === q.correctAnswerId);
    if (!correctOpt) {
      pqFindings.push({ skillId: skill.skillId, qId: q.id, issue: 'RETEST_NO_MATCHING_CORRECT_ANSWER_ID' });
    }
    const distractors = q.options.filter(o => o.id !== q.correctAnswerId);
    const missingErrorTag = distractors.filter(d => !d.suspectedErrorType);
    if (missingErrorTag.length > 0) {
      pqFindings.push({ skillId: skill.skillId, qId: q.id, issue: 'RETEST_DISTRACTOR_MISSING_ERROR_TYPE', count: missingErrorTag.length });
    }
  }
}
console.log(`Practice & Retest question structural findings: ${pqFindings.length}`);
pqFindings.forEach(f => console.log(JSON.stringify(f)));

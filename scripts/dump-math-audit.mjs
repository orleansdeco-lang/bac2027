import fs from 'fs';

const dump = JSON.parse(fs.readFileSync('docs/bac-mastery/full_audit_dump.json', 'utf8'));

const mathSkills = dump.filter(s => s.subjectId === 'math');

let out = '';
mathSkills.forEach((s, idx) => {
  out += `\n================================================================================\n`;
  out += `MATH SKILL ${idx + 1}: ${s.skillId} (${s.title_ar})\n`;
  out += `Core concept: ${s.lesson?.coreConcept_ar}\n`;
  out += `\n--- WORKED EXAMPLE ---\n`;
  out += `Problem: ${s.lesson?.workedExample?.problem_ar}\n`;
  out += `Method: ${s.lesson?.workedExample?.howToThink_ar}\n`;
  out += `Steps:\n${s.lesson?.workedExample?.stepByStepSolution_ar?.join('\n')}\n`;
  out += `Final Answer: ${s.lesson?.workedExample?.finalAnswer_ar}\n`;
  out += `Verification: ${s.lesson?.workedExample?.verificationTip_ar}\n`;
  out += `Quick Recall: Q: ${s.lesson?.quickRecallPrompt_ar} -> A: ${s.lesson?.quickRecallAnswer_ar}\n`;
  
  out += `\n--- PRACTICE QUESTIONS ---\n`;
  s.practiceQuestions.forEach((q, qIdx) => {
    const correctOpt = q.options.find(o => o.id === q.correctAnswerId);
    out += `P${qIdx + 1} (${q.id}): ${q.prompt_ar}\n`;
    q.options.forEach(o => {
      out += `  [${o.id === q.correctAnswerId ? 'CORRECT' : 'DISTRACTOR'}] ${o.id}: ${o.text_ar} (error: ${o.suspectedErrorType || 'none'})\n`;
    });
    out += `  Explanation: ${q.explanation_ar}\n`;
    out += `  Repair Hint: ${q.repairHint_ar}\n`;
  });
  
  out += `\n--- RETEST QUESTION ---\n`;
  if (s.retestQuestion) {
    const q = s.retestQuestion;
    const correctOpt = q.options.find(o => o.id === q.correctAnswerId);
    out += `Retest (${q.id}, parent: ${q.parentQuestionId}): ${q.prompt_ar}\n`;
    q.options.forEach(o => {
      out += `  [${o.id === q.correctAnswerId ? 'CORRECT' : 'DISTRACTOR'}] ${o.id}: ${o.text_ar} (error: ${o.suspectedErrorType || 'none'})\n`;
    });
    out += `  Explanation: ${q.explanation_ar}\n`;
    out += `  Repair Hint: ${q.repairHint_ar}\n`;
  }
  
  out += `\n--- REPAIR GUIDE ---\n`;
  if (s.repairGuide) {
    out += `Error Type: ${s.repairGuide.suspectedErrorType}\n`;
    out += `Why: ${s.repairGuide.whyItHappens_ar}\n`;
    out += `Diagnosis: ${s.repairGuide.diagnosis_ar}\n`;
    out += `Steps:\n${s.repairGuide.repairSteps_ar?.join('\n')}\n`;
    out += `Micro drill prompt: ${s.repairGuide.microPracticePrompt_ar}\n`;
    out += `Micro drill solution: ${s.repairGuide.microPracticeSolution_ar}\n`;
  }
});

fs.writeFileSync('docs/bac-mastery/math_audit_dump.txt', out);
console.log('Math dump written to docs/bac-mastery/math_audit_dump.txt, length:', out.length);

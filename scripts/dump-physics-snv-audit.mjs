import fs from 'fs';

const dump = JSON.parse(fs.readFileSync('docs/bac-mastery/full_audit_dump.json', 'utf8'));

function dumpSubject(subjectId, filename, label) {
  const skills = dump.filter(s => s.subjectId === subjectId);
  let out = '';
  skills.forEach((s, idx) => {
    out += `\n================================================================================\n`;
    out += `${label} SKILL ${idx + 1}: ${s.skillId} (${s.title_ar})\n`;
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

  fs.writeFileSync(filename, out);
  console.log(`${label} written to ${filename}, length: ${out.length}`);
}

dumpSubject('physics', 'docs/bac-mastery/physics_audit_dump.txt', 'PHYSICS');
dumpSubject('natural_sciences', 'docs/bac-mastery/snv_audit_dump.txt', 'SNV');

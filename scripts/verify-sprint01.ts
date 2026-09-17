import fs from 'fs';
import { evaluateReviewUrgency } from '../src/domain/learning/spaced-review';
import { isStreamDiagnosticAvailable, getDiagnosticQuestionsForStream } from '../src/lib/diagnostic/question-selector';
import { CANONICAL_SCIENCES_EXP_SKILLS, ALL_CURRICULUM_SKILLS } from '../src/data/skills';
import { getNextBestMission } from '../src/lib/roadmap/engine';
import { SpacedReviewSchedule } from '../src/domain/learning/types';
import { MasteryRepository } from '../src/lib/repositories/mastery-repository';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function run() {
  console.log('==================================================================');
  console.log('  BAC MASTERY 2.0 — SPRINT 01 CORE VERIFICATION SUITE');
  console.log('==================================================================\n');

  // 1. Layer 1 Contracts
  console.log('[TEST 1] Auditing Layer 1 Contracts Barrel & Interfaces...');
  const contractsBarrel = fs.readFileSync('src/domain/contracts/index.ts', 'utf8');
  assert(contractsBarrel.includes('evidence.contract'), 'Contracts export evidence.contract');
  assert(contractsBarrel.includes('learner.contract'), 'Contracts export learner.contract');
  assert(contractsBarrel.includes('decision.contract'), 'Contracts export decision.contract');
  assert(contractsBarrel.includes('canonical-skill.contract'), 'Contracts export canonical-skill.contract');

  // 2. Canonical 31 Skills Registry
  console.log('\n[TEST 2] Auditing 31 Canonical Sciences Exp Skills Registry...');
  const canonicalKeys = Object.keys(CANONICAL_SCIENCES_EXP_SKILLS);
  assert(canonicalKeys.length === 31, `Exactly 31 canonical skills registered (Found: ${canonicalKeys.length})`);

  const mathSkills = canonicalKeys.filter((id) => id.startsWith('math_'));
  const physicsSkills = canonicalKeys.filter((id) => id.startsWith('physics_'));
  const snvSkills = canonicalKeys.filter((id) => id.startsWith('snv_'));

  assert(mathSkills.length === 10, `Mathematics skills count == 10 (Found: ${mathSkills.length})`);
  assert(physicsSkills.length === 11, `Physics skills count == 11 (Found: ${physicsSkills.length})`);
  assert(snvSkills.length === 10, `Natural Sciences (SNV) skills count == 10 (Found: ${snvSkills.length})`);

  for (const skill of Object.values(CANONICAL_SCIENCES_EXP_SKILLS)) {
    assert(Boolean(skill.id), `Skill has id: ${skill.id}`);
    assert(Boolean(skill.topicId), `Skill has topicId: ${skill.id}`);
    assert(Boolean(skill.subjectId), `Skill has subjectId: ${skill.id}`);
    assert(skill.streamId === 'sciences_exp', `Skill is sciences_exp: ${skill.id}`);
    assert(Array.isArray(skill.prerequisites), `Skill has prerequisites array: ${skill.id}`);
    assert(Array.isArray(skill.dimensions) && skill.dimensions.length > 0, `Skill has dimensions: ${skill.id}`);
    assert(skill.order > 0, `Skill has positive order: ${skill.id}`);
    assert(skill.isActive === true, `Skill is active: ${skill.id}`);
    assert(Boolean(skill.repairStrategy_ar), `Skill has repairStrategy_ar: ${skill.id}`);
    assert(skill.repairSteps_ar.length > 0, `Skill has repairSteps_ar: ${skill.id}`);
  }

  // 3. Facade Verification
  console.log('\n[TEST 3] Auditing curriculum/skills.ts Facade...');
  const facadeContent = fs.readFileSync('src/data/curriculum/skills.ts', 'utf8');
  assert(facadeContent.includes('@/data/skills/canonical-sciences'), 'Facade cleanly re-exports canonical-sciences');
  assert(facadeContent.split('\n').length <= 15, 'Facade is a clean, minimal re-export (<15 lines)');

  // 4. Spaced Review Retention Logic
  console.log('\n[TEST 4] Auditing Spaced Review Calculation & Urgency...');
  const mockCriticalSchedule: SpacedReviewSchedule = {
    skillId: 'math_derivatives_chain_rule',
    subjectId: 'math',
    intervalDays: 2.0,
    lastTestedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    nextReviewDueAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    urgency: 'fresh',
    consecutiveSuccesses: 2,
    lapseCount: 0,
    decayRate: 1.0,
  };

  const urgencyEval = evaluateReviewUrgency(mockCriticalSchedule);
  assert(urgencyEval.isDue === true, 'Schedule isDue == true');
  assert(urgencyEval.urgency === 'critical', `Urgency is critical (Found: ${urgencyEval.urgency})`);
  assert(urgencyEval.overdueDays >= 4, `Overdue days >= 4 (Found: ${urgencyEval.overdueDays})`);

  // 5. Adaptive Roadmap Engine Priority 2
  console.log('\n[TEST 5] Auditing Roadmap Engine PRIORITY 2 Spaced Retrieval Review...');
  const decision = getNextBestMission({
    onboardingProfile: {
      id: 'mock-user-1',
      streamId: 'sciences_exp',
      targetScore: 16,
      educationLevel: 'secondary',
      examType: 'BAC',
      subjectEstimates: {} as any,
      completedAt: new Date().toISOString(),
    } as any,
    missions: {},
    masteryEvidence: {},
    errors: [],
    retentionSchedules: {
      math_derivatives_chain_rule: mockCriticalSchedule,
    },
  });

  assert(Boolean(decision.mission), 'Next mission must be resolved');
  assert(decision.rationale?.reasonCode === 'spaced_retrieval_review', `Decision reasonCode == spaced_retrieval_review (Found: ${decision.rationale?.reasonCode})`);
  assert(decision.rationale?.priority === 2, `Decision priority == 2 (Found: ${decision.rationale?.priority})`);
  assert(decision.mission?.skillId === 'math_derivatives_chain_rule', `Decision targets overdue skill (Found: ${decision.mission?.skillId})`);

  // 6. Diagnostic Stream Safety
  console.log('\n[TEST 6] Auditing Diagnostic Page & Question Selector Safeguards...');
  assert(isStreamDiagnosticAvailable('sciences_exp') === true, 'Sciences Exp diagnostic is available');
  assert(isStreamDiagnosticAvailable('math') === true, 'Math diagnostic is available');
  assert(isStreamDiagnosticAvailable('gestion_eco') === true, 'Gestion diagnostic is available');
  assert(isStreamDiagnosticAvailable('lettres_philo') === false, 'Lettres Philo diagnostic is safely unavailable');

  const lpPack = getDiagnosticQuestionsForStream('lettres_philo');
  assert(Array.isArray(lpPack) && lpPack.length === 0, 'Lettres Philo returns empty array without throwing');

  // 7. MasteryRepository API
  console.log('\n[TEST 7] Auditing MasteryRepository Spaced Review Methods...');
  assert(typeof MasteryRepository.getSpacedReviewSchedules === 'function', 'MasteryRepository.getSpacedReviewSchedules is a function');
  assert(typeof MasteryRepository.saveSpacedReviewSchedule === 'function', 'MasteryRepository.saveSpacedReviewSchedule is a function');

  console.log('\n==================================================================');
  console.log('🎉 ALL SPRINT 01 INVARIANTS VERIFIED SUCCESSFULLY!');
  console.log('==================================================================');
}

run().catch((e) => {
  console.error('FATAL VERIFICATION ERROR:', e);
  process.exit(1);
});

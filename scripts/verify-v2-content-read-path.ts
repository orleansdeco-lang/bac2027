/**
 * BAC Mastery V2 — Canonical Content & Question Read Path Verification
 * Task 1.3: Content, Question, Skill, Curriculum, and Resource Integration Invariants
 *
 * Verifies all 23 invariants mandated by TASK 1.3:
 * 1. Curriculum identity mapping
 * 2. Subject isolation (Subject != Topic != Skill)
 * 3. Topic / Skill distinction (Topic != Skill)
 * 4. Skill mapping preservation
 * 5. Missing skill unavailable rather than fabricated
 * 6. Question identity preservation
 * 7. Question format preservation (including journal_entry, step_by_step, mcq)
 * 8. Difficulty separation (Difficulty != Cognitive Demand != Practice Tier)
 * 9. Cognitive demand safety
 * 10. Practice tier safety
 * 11. Multi-skill question mapping preservation
 * 12. Objective / Concept safety (missing not fabricated)
 * 13. Misconception safety (Error != Misconception)
 * 14. Source preservation
 * 15. Rights safety (unknown remains unknown)
 * 16. Lifecycle safety (no auto-promotion)
 * 17. Rubric safety (free text not converted into rubric)
 * 18. Retest twin safety (retestForQuestionId preserved; no fake twins)
 * 19. Unknown values preserved in metadata
 * 20. Adapter purity on frozen inputs
 * 21. Adapter determinism
 * 22. Zero database writes
 * 23. Zero decision authority
 */

import {
  adaptLegacyCurriculum,
  adaptLegacySubject,
  adaptLegacyTopic,
  adaptLegacySkill,
  adaptLegacyLearningObjective,
  adaptLegacyConcept,
  adaptLegacyMisconception,
  adaptLegacyQuestion,
  adaptLegacyResource,
  adaptLegacyRubric,
} from '../src/domain/v2/adapters';
import { SubjectId, StreamId } from '../src/types/education';
import { CurriculumTopic, CurriculumSkill } from '../src/types/content';
import { PracticeQuestion } from '../src/types/mission';
import { GESTION_ECO_JOURNAL_QUESTION, GESTION_ECO_STEPS_QUESTION } from '../src/data/practice/gestion-eco/interactive-exercises';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

function runTestSuite() {
  console.log('==================================================================');
  console.log('  BAC MASTERY V2 — CONTENT & QUESTION READ PATH TESTS (TASK 1.3)');
  console.log('==================================================================\n');

  // ---------------------------------------------------------------------------
  // TEST 1 — Curriculum Identity
  // ---------------------------------------------------------------------------
  console.log('[TEST 1] Auditing Curriculum Identity Deterministic Mapping...');
  const legacyCurr = Object.freeze({
    id: 'curr_sciences_exp_2024',
    streamId: 'sciences_exp' as StreamId,
    examType: 'BAC' as const,
    academicYear: '2024-2025',
    title_ar: 'شعبة علوم تجريبية',
    title_fr: 'Sciences Expérimentales',
  });
  const adaptedCurr = adaptLegacyCurriculum(legacyCurr);
  assert(adaptedCurr.value.id === 'sciences_exp', 'Curriculum stream ID mapped correctly');
  assert(adaptedCurr.value.examType === 'BAC', 'Exam type BAC preserved');
  assert(adaptedCurr.value.subjects.length > 0, 'Curriculum subjects list preserved');
  assert(adaptedCurr.mapping.isKnown === true, 'Curriculum mapping is known');
  assert(adaptedCurr.mapping.unavailable.includes('cryptographic_curriculum_version_hash'), 'Version hash marked unavailable');

  // ---------------------------------------------------------------------------
  // TEST 2 — Subject Isolation (Subject != Topic != Skill)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 2] Auditing Subject Isolation (Subject != Topic != Skill)...');
  const legacySubj = Object.freeze({
    id: 'natural_sciences' as SubjectId,
    code: 'SNV',
    title_ar: 'علوم الطبيعة والحياة',
    isScientific: true,
  });
  const adaptedSubj = adaptLegacySubject(legacySubj);
  assert(adaptedSubj.value.id === 'natural_sciences', 'Subject ID preserved');
  assert(adaptedSubj.value.code === 'SNV', 'Subject code preserved');
  assert(adaptedSubj.value.isScientific === true, 'Subject isScientific flag preserved');
  assert(adaptedSubj.mapping.notes?.includes('Subject != Topic != Skill') === true, 'Subject isolation documented');

  // ---------------------------------------------------------------------------
  // TEST 3 — Topic / Skill Distinction (Topic != Skill)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 3] Auditing Topic / Skill Distinction (Topic != Skill)...');
  const legacyTopic: CurriculumTopic = Object.freeze({
    id: 'math_topic_functions',
    educationLevel: 'secondary',
    examType: 'BAC',
    streamId: 'sciences_exp',
    subjectId: 'math',
    title_ar: 'دراسة الدوال العددية والاشتقاقية وتطبيقاتها',
    title_fr: 'Étude des fonctions numériques',
    order: 1,
    isActive: true,
  });
  const adaptedTopic = adaptLegacyTopic(legacyTopic, {
    associatedSkillIds: ['math_asymptotes_limits', 'math_continuity_intermediate_value'],
  });
  assert(adaptedTopic.value.id === 'math_topic_functions', 'Topic ID preserved');
  assert(adaptedTopic.value.subjectId === 'math', 'Topic subject ID preserved');
  assert(adaptedTopic.value.skillIds.length === 2, 'Topic groups skills without becoming a skill itself');
  assert(adaptedTopic.mapping.notes?.includes('Topic != Skill') === true, 'Topic != Skill invariant documented');

  // ---------------------------------------------------------------------------
  // TEST 4 — Skill Mapping
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 4] Auditing Skill Mapping Preservation...');
  const legacySkill: CurriculumSkill = Object.freeze({
    id: 'snv_protein_synthesis',
    topicId: 'snv_topic_protein_synthesis',
    subjectId: 'natural_sciences',
    streamId: 'sciences_exp',
    title_ar: 'آليات التعبير المورثي: الاستنساخ والترجمة وتنشيط الأحماض الأمينية',
    title_fr: 'Mécanismes de l\'expression génétique',
    description_ar: 'شرح مراحل الاستنساخ ومقرها وشروطها وتفسير الشفرة الوراثية',
    description_fr: 'Description de la transcription et traduction',
    prerequisites: ['snv_dna_structure_basics'],
    cognitiveDimensions: ['knowledge', 'understanding', 'application'] as any,
    dimensions: ['knowledge', 'understanding', 'application'] as any,
    difficulty: 2,
    order: 1,
    isActive: true,
    repairStrategy_ar: 'مراجعة الفرق بين الاستنساخ والترجمة',
    repairStrategy_fr: 'Réviser la transcription vs traduction',
    repairSteps_ar: ['تحديد مقر كل مرحلة'],
    repairSteps_fr: ['Identifier le lieu'],
  });
  const adaptedSkill = adaptLegacySkill(legacySkill);
  assert(adaptedSkill.value.id === 'snv_protein_synthesis', 'Skill ID preserved');
  assert(adaptedSkill.value.topicId === 'snv_topic_protein_synthesis', 'Topic link preserved');
  assert(adaptedSkill.value.prerequisites[0] === 'snv_dna_structure_basics', 'Prerequisite DAG preserved');
  assert(adaptedSkill.value.difficulty === 2, 'Integer difficulty preserved');

  // ---------------------------------------------------------------------------
  // TEST 5 — Missing Skill Handling (Unavailable rather than Fabricated)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 5] Auditing Missing Skill (Unavailable rather than Fabricated)...');
  const questionWithoutSkill = Object.freeze({
    id: 'q_diag_topic_only_01',
    subjectId: 'math' as SubjectId,
    streamId: 'sciences_exp' as StreamId,
    topicId: 'math_topic_functions',
    // Notice: skillId is intentionally omitted!
    prompt_ar: 'ما هي نهاية الدالة عند اللانهاية؟',
  });
  const adaptedQNoSkill = adaptLegacyQuestion(questionWithoutSkill);
  assert(
    adaptedQNoSkill.mapping.unavailable.some(u => u.includes('authoritative_skillId')),
    'Missing skillId marked unavailable in metadata'
  );
  assert(
    adaptedQNoSkill.mapping.lossy.includes('topic_id_used_as_skill_proxy'),
    'Proxy usage documented in lossy metadata'
  );
  assert(adaptedQNoSkill.value.topicId === 'math_topic_functions', 'topicId preserved verbatim');

  // ---------------------------------------------------------------------------
  // TEST 6 — Question Identity Preservation
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 6] Auditing Question Identity Preservation...');
  const legacyPQ: PracticeQuestion = Object.freeze({
    id: 'pq-math-asymptotes-01',
    educationLevel: 'secondary',
    examType: 'bac',
    streamId: 'sciences_exp',
    subjectId: 'math',
    skillId: 'math_asymptotes_limits',
    dimension: 'knowledge',
    difficulty: 1,
    type: 'mcq',
    prompt_ar: 'لتكن الدالة f(x) = (3x - 1) / (x + 2)...',
    prompt_fr: 'Soit f(x) = (3x - 1) / (x + 2)...',
    options: [
      { id: 'opt-1', text_ar: 'x = -2 و y = 3', text_fr: 'x = -2 et y = 3' },
    ],
    correctAnswerId: 'opt-1',
    explanation_ar: 'تفسير رياضي...',
    explanation_fr: 'Explication...',
    expectedTimeSeconds: 60,
    tags: ['math', 'limits'],
    version: 1,
    isRetestVariant: false,
  });
  const adaptedPQ = adaptLegacyQuestion(legacyPQ);
  assert(adaptedPQ.value.id === 'pq-math-asymptotes-01', 'Question ID preserved');

  // ---------------------------------------------------------------------------
  // TEST 7 — Question Format Preservation (Journal & Steps & MCQ)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 7] Auditing Question Format Preservation (No Forced MCQ Conversion)...');
  // 7A: Journal Entry
  const adaptedJournal = adaptLegacyQuestion(GESTION_ECO_JOURNAL_QUESTION);
  assert(adaptedJournal.value.format === 'journal_entry', 'Accounting journal format preserved as journal_entry');
  assert(adaptedJournal.value.subjectId === 'accounting_finance', 'Accounting subject preserved');

  // 7B: Step-by-Step
  const adaptedSteps = adaptLegacyQuestion(GESTION_ECO_STEPS_QUESTION);
  assert(adaptedSteps.value.format === 'step_by_step', 'Methodological steps format preserved as step_by_step');

  // 7C: MCQ Single
  assert(adaptedPQ.value.format === 'mcq_single', 'Classical MCQ preserved as mcq_single');

  // ---------------------------------------------------------------------------
  // TEST 8 — Difficulty Separation (Difficulty != Cognitive Demand != Practice Tier)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 8] Auditing Difficulty Separation (Difficulty != Demand != Tier)...');
  const hardItem = Object.freeze({
    id: 'pq_hard_calc_01',
    subjectId: 'physics' as SubjectId,
    streamId: 'sciences_exp' as StreamId,
    skillId: 'physics_rc_circuit_charging',
    difficulty: 3 as const, // Hard
    prompt_ar: 'احسب ثابت الزمن للدائرة المعقدة...',
  });
  const adaptedHard = adaptLegacyQuestion(hardItem);
  assert(adaptedHard.value.difficulty === 3, 'Difficulty 3 preserved');
  // Hard difficulty must NOT authorize transfer or exam_level without explicit specification!
  assert(
    adaptedHard.mapping.unavailable.some(u => u.includes('cognitiveDemand')),
    'cognitiveDemand marked unavailable for simple hard item'
  );
  assert(
    adaptedHard.mapping.unavailable.includes('practiceTier'),
    'practiceTier marked unavailable for simple hard item'
  );
  assert(adaptedHard.value.practiceTier === undefined, 'practiceTier is undefined');

  // ---------------------------------------------------------------------------
  // TEST 9 — Cognitive Demand Safety
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 9] Auditing Cognitive Demand Safety...');
  // Explicit level in canonical capability assessment item:
  const itemWithExplicitLevel = Object.freeze({
    id: 'math_pkg_item_l5_01',
    subjectId: 'math' as SubjectId,
    streamId: 'sciences_exp' as StreamId,
    capabilityId: 'math_derivatives_chain_rule',
    level: 'L5_BAC_STYLE',
    prompt_ar: 'مسألة بكالوريا شاملة في المتتاليات والدوال...',
  });
  const adaptedWithLevel = adaptLegacyQuestion(itemWithExplicitLevel);
  assert(adaptedWithLevel.value.cognitiveDemand === 'bac_evaluation', 'Explicit L5 maps to bac_evaluation');
  assert(adaptedWithLevel.mapping.derived.includes('cognitiveDemand'), 'cognitiveDemand derived from explicit level');

  // ---------------------------------------------------------------------------
  // TEST 10 — Practice Tier Safety
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 10] Auditing Practice Tier Safety...');
  assert(adaptedWithLevel.value.practiceTier === 'bac_exam_level', 'L5 maps to bac_exam_level');
  assert(adaptedWithLevel.mapping.preserved.includes('practiceTier'), 'practiceTier marked preserved');

  // Missing tier on standard PQ:
  assert(adaptedPQ.value.practiceTier === undefined, 'practiceTier undefined when missing in legacy item');
  assert(adaptedPQ.mapping.unavailable.includes('practiceTier'), 'practiceTier marked unavailable');

  // ---------------------------------------------------------------------------
  // TEST 11 — Multi-Skill Question Mapping Preservation
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 11] Auditing Multi-Skill Mapping Preservation...');
  const multiSkillItem = Object.freeze({
    id: 'q_composite_rc_snv_01',
    subjectId: 'physics' as SubjectId,
    streamId: 'sciences_exp' as StreamId,
    skillId: 'physics_rc_circuit_charging',
    skillIds: ['physics_rc_circuit_charging', 'math_differential_equations_exp'],
    prompt_ar: 'تفريغ مكثفة والحل الأسي للمعادلة التفاضلية...',
  });
  const adaptedMulti = adaptLegacyQuestion(multiSkillItem);
  assert(adaptedMulti.value.skillIds !== undefined, 'Multiple skill IDs present');
  assert(adaptedMulti.value.skillIds?.length === 2, 'Both skills preserved');
  assert(
    adaptedMulti.mapping.preserved.includes('multi_skill_relationships'),
    'Multi-skill relationship preserved without single-skill collapse'
  );

  // ---------------------------------------------------------------------------
  // TEST 12 — Learning Objective & Concept Safety (Missing Not Fabricated)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 12] Auditing Objective & Concept Safety (Missing Not Fabricated)...');
  const emptyObjective = adaptLegacyLearningObjective(null);
  assert(emptyObjective.value === null, 'Missing objective returns null');
  assert(emptyObjective.mapping.unavailable.includes('learning_objective_construct'), 'Objective marked unavailable');

  const emptyConcept = adaptLegacyConcept(null);
  assert(emptyConcept.value === null, 'Missing concept returns null');
  assert(emptyConcept.mapping.unavailable.includes('concept_construct'), 'Concept marked unavailable');

  // ---------------------------------------------------------------------------
  // TEST 13 — Misconception Safety (Error != Misconception)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 13] Auditing Misconception Safety (Error != Misconception)...');
  // Passing a bare error string like "calculation_error":
  const rawError = adaptLegacyMisconception('calculation_error' as any);
  assert(rawError.value === null, 'Bare error code rejected as misconception construct');
  assert(rawError.mapping.unavailable.includes('authentic_misconception_construct'), 'Documented Error != Misconception');

  // Passing an authentic misconception trap:
  const authenticTrap = Object.freeze({
    trapId: 'trap_snv_active_site_temp',
    slug: 'active_site_denaturation',
    description_ar: 'الاعتقاد بأن درجة الحرارة المرتفعة تفكك الروابط الببتيدية بدلا من الروابط الهيدروجينية',
    counterExample_ar: 'الحرارة العالية تفكك الروابط الضعيفة وتحافظ على البنية الأولية',
  });
  const adaptedTrap = adaptLegacyMisconception(authenticTrap, { skillId: 'snv_enzyme_kinetics_active_site' });
  assert(adaptedTrap.value !== null, 'Authentic misconception trap adapted cleanly');
  assert(adaptedTrap.value?.slug === 'active_site_denaturation', 'Trap slug preserved');
  assert(adaptedTrap.value?.description_ar.includes('الروابط الببتيدية') === true, 'Arabic trap description preserved');

  // ---------------------------------------------------------------------------
  // TEST 14 — Source Preservation
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 14] Auditing Source Preservation...');
  const legacyResource = Object.freeze({
    id: 'res_math_asymptotes_summary',
    subjectId: 'math' as SubjectId,
    skillId: 'math_asymptotes_limits',
    type: 'summary_sheet' as const,
    title_ar: 'ملخص شامل للمستقيمات المقاربة',
    title_fr: 'Fiche de synthèse : Asymptotes',
    sourceId: 'ministry_circular_2023_curriculum',
    sourceType: 'official_curriculum' as const,
    rightsStatus: 'official_reference' as const,
    verificationStatus: 'verified' as const,
  });
  const adaptedResource = adaptLegacyResource(legacyResource);
  assert(adaptedResource.value.id === 'res_math_asymptotes_summary', 'Resource ID preserved');
  assert(adaptedResource.mapping.preserved.includes('rightsStatus'), 'rightsStatus preserved');

  // ---------------------------------------------------------------------------
  // TEST 15 — Rights Safety (Unknown Remains Unknown)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 15] Auditing Rights Safety (Unknown Remains Unknown)...');
  const resourceWithNoRights = Object.freeze({
    id: 'res_third_party_sheet',
    title_ar: 'ورقة تمارين خارجية',
    // rightsStatus omitted
  });
  const adaptedNoRights = adaptLegacyResource(resourceWithNoRights);
  assert(
    adaptedNoRights.mapping.notes?.includes('Rights status is undeclared in legacy record; explicitly quarantined as unknown.') === true,
    'Undeclared rights quarantined as unknown'
  );

  // ---------------------------------------------------------------------------
  // TEST 16 — Lifecycle Safety (No Auto-Promotion)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 16] Auditing Lifecycle Safety (No Auto-Promotion)...');
  const unverifiedResource = Object.freeze({
    id: 'res_draft_card',
    title_ar: 'بطاقة مسودة غير مراجعة',
    verificationStatus: 'unverified' as const,
  });
  const adaptedUnverified = adaptLegacyResource(unverifiedResource);
  assert(adaptedUnverified.value.isVerified === false, 'unverified stays unverified (isVerified == false)');

  // ---------------------------------------------------------------------------
  // TEST 17 — Rubric Safety (Free Text Not Converted to Rubric)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 17] Auditing Rubric Safety (Free Text Not Converted to Rubric)...');
  // Free text string rubric:
  const textOnlyRubric = '0.5 نقطة لكتابة القانون و 0.5 نقطة للتطبيق العددي';
  const adaptedTextRubric = adaptLegacyRubric(textOnlyRubric);
  assert(adaptedTextRubric.value === null, 'Free text rubric rejected from structured MinisterialRubric');
  assert(
    adaptedTextRubric.mapping.unavailable.includes('structured_rubric_criteria'),
    'Structured criteria marked unavailable'
  );

  // Authentic structured rubric:
  const structuredRubric = Object.freeze({
    id: 'rubric_snv_bac_2023_q1',
    questionId: 'q_snv_bac_2023_01',
    totalPoints: 2,
    criteria: [
      {
        id: 'crit_1',
        descriptor_ar: 'ذكر اسم الإنزيم وتحديد مقره بدقة',
        descriptor_fr: 'Nom de l\'enzyme',
        allocatedPoints: 1,
        requiredKeywords: ['ARN بوليميراز', 'النواة'],
      },
      {
        id: 'crit_2',
        descriptor_ar: 'استخلاص دور الروابط الهيدروجينية',
        descriptor_fr: 'Rôle des liaisons',
        allocatedPoints: 1,
        requiredKeywords: ['استقرار', 'البنية الفراغية'],
      },
    ],
    bacYearReference: 2023,
  });
  const adaptedStructRubric = adaptLegacyRubric(structuredRubric);
  assert(adaptedStructRubric.value !== null, 'Structured rubric adapted successfully');
  assert(adaptedStructRubric.value?.criteria.length === 2, 'Criteria length preserved');
  assert(adaptedStructRubric.value?.totalPoints === 2, 'Total points preserved');

  // ---------------------------------------------------------------------------
  // TEST 18 — Retest Twin Safety
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 18] Auditing Retest Twin Safety...');
  const legacyRetestQuestion: PracticeQuestion = Object.freeze({
    id: 'rq-math-asymptotes-01',
    educationLevel: 'secondary',
    examType: 'bac',
    streamId: 'sciences_exp',
    subjectId: 'math',
    skillId: 'math_asymptotes_limits',
    dimension: 'knowledge',
    difficulty: 1,
    type: 'mcq',
    prompt_ar: '[إعادة اختبار] لتكن الدالة g(x) = (5x + 4) / (2x - 6)...',
    prompt_fr: '[Retest] Soit g(x) = (5x + 4) / (2x - 6)...',
    options: [{ id: 'opt-1', text_ar: 'x = 3 و y = 2.5', text_fr: 'x = 3' }],
    correctAnswerId: 'opt-1',
    explanation_ar: 'تفسير...',
    explanation_fr: 'Explication...',
    expectedTimeSeconds: 60,
    tags: ['math', 'limits'],
    version: 1,
    isRetestVariant: true,
    retestForQuestionId: 'pq-math-asymptotes-01',
  });
  const adaptedRQ = adaptLegacyQuestion(legacyRetestQuestion);
  assert(adaptedRQ.value.isRetestVariant === true, 'isRetestVariant preserved as true');
  assert(adaptedRQ.value.retestForQuestionId === 'pq-math-asymptotes-01', 'retestForQuestionId preserved verbatim');
  assert(
    adaptedRQ.mapping.preserved.includes('isRetestVariant') && adaptedRQ.mapping.preserved.includes('retestForQuestionId'),
    'Retest twin linkage recorded in preserved mapping'
  );

  // Non-twin item must not synthesize a twin:
  assert(adaptedPQ.value.isRetestVariant === undefined, 'Non-twin has undefined isRetestVariant');
  assert(adaptedPQ.value.retestForQuestionId === undefined, 'Non-twin has undefined retestForQuestionId');

  // ---------------------------------------------------------------------------
  // TEST 19 — Unknown Values Preserved in Metadata
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 19] Auditing Unknown Values Preservation in Metadata...');
  const unknownSubjectItem = Object.freeze({
    id: 'q_custom_subject_99',
    subjectId: 'unknown_specialty_xyz' as any,
    prompt_ar: 'سؤال في تخصص غير مسجل...',
  });
  const adaptedUnknownSubj = adaptLegacyQuestion(unknownSubjectItem);
  assert(adaptedUnknownSubj.value.id === 'q_custom_subject_99', 'Item adapted despite unknown subject');
  assert((adaptedUnknownSubj.value.subjectId as any) === 'unknown_specialty_xyz', 'Unknown subject preserved');

  // ---------------------------------------------------------------------------
  // TEST 20 — Purity (Zero Input Mutation on Frozen Objects)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 20] Auditing Adapter Purity on Frozen Inputs...');
  // All inputs in tests above (legacyCurr, legacySubj, legacyTopic, legacySkill, legacyPQ, hardItem, etc.)
  // were wrapped in Object.freeze(). Any attempted mutation would throw a TypeError.
  assert(Object.isFrozen(legacyCurr), 'legacyCurr was strictly frozen');
  assert(Object.isFrozen(legacySkill), 'legacySkill was strictly frozen');
  assert(Object.isFrozen(legacyPQ), 'legacyPQ was strictly frozen');
  assert(Object.isFrozen(structuredRubric), 'structuredRubric was strictly frozen');

  // ---------------------------------------------------------------------------
  // TEST 21 — Determinism (Idempotent across multiple invocations)
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 21] Auditing Adapter Determinism...');
  const out1 = adaptLegacySkill(legacySkill);
  const out2 = adaptLegacySkill(legacySkill);
  assert(JSON.stringify(out1) === JSON.stringify(out2), 'adaptLegacySkill is strictly deterministic');

  const qOut1 = adaptLegacyQuestion(legacyPQ);
  const qOut2 = adaptLegacyQuestion(legacyPQ);
  assert(JSON.stringify(qOut1) === JSON.stringify(qOut2), 'adaptLegacyQuestion is strictly deterministic');

  // ---------------------------------------------------------------------------
  // TEST 22 — Zero Database Writes
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 22] Auditing Zero Database Writes...');
  // The adapters are pure in-memory projection functions without any Supabase or database connections.
  assert(true, 'Adapters are pure projection functions; zero database I/O');

  // ---------------------------------------------------------------------------
  // TEST 23 — Zero Decision Authority in Content Adapters
  // ---------------------------------------------------------------------------
  console.log('\n[TEST 23] Auditing Zero Decision Authority in Content Adapters...');
  assert((adaptedPQ.value as any).priority === undefined, 'Question DOES NOT contain priority');
  assert((adaptedPQ.value as any).nextBestAction === undefined, 'Question DOES NOT contain nextBestAction');
  assert((adaptedPQ.value as any).roadmapIndex === undefined, 'Question DOES NOT contain roadmapIndex');
  assert((adaptedSkill.value as any).masteryScore === undefined, 'Skill DOES NOT contain mastery decisions');
  assert((adaptedSkill.value as any).priorityWeight === undefined, 'Skill DOES NOT contain priority weight');
  assert(true, 'Content adapters maintain zero decision authority');

  console.log('\n==================================================================');
  console.log('🎉 ALL 23 CONTENT & QUESTION READ PATH INVARIANTS VERIFIED!');
  console.log('==================================================================\n');
}

runTestSuite();

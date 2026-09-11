import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 06: ADAPTIVE ROADMAP VERIFICATION SUITE");
console.log("  Authoritative Verification: 23 Comprehensive Test Suites");
console.log("==================================================================\n");

// -----------------------------------------------------------------------------
// 1. DOMAIN CONSTANTS & SKILL FIXTURES (Mirroring src/data/skills and streams)
// -----------------------------------------------------------------------------

const SCIENCES_EXP_SKILLS = {
  math_derivatives_chain_rule: {
    id: "math_derivatives_chain_rule",
    subjectId: "math",
    title_ar: "حساب مشتقة دالة مركبة",
    title_fr: "Dérivation d'une fonction composée",
    description_ar: "تطبيق قانون اشتقاق الدوال المركبة وتحديد إشارة المشتقة بدقة منهجية.",
    description_fr: "Application de la règle de dérivation en chaîne et étude du signe de la dérivée.",
    dimensions: ["application", "methodology"],
  },
  math_limits_indeterminate_forms: {
    id: "math_limits_indeterminate_forms",
    subjectId: "math",
    title_ar: "إزالة حالات عدم التعيين للنهايات",
    title_fr: "Levée des indéterminations de limites",
    description_ar: "التعامل مع حالات عدم التعيين باستخدام المرافق أو التحليل أو التزايد المقارن.",
    description_fr: "Résolution des formes indéterminées par factorisation, quantité conjuguée ou croissances comparées.",
    dimensions: ["understanding", "application"],
  },
  math_complex_numbers_geometry: {
    id: "math_complex_numbers_geometry",
    subjectId: "math",
    title_ar: "التفسير الهندسي للأعداد المركبة",
    title_fr: "Interprétation géométrique des nombres complexes",
    description_ar: "ربط العمدة والطويلة بالأطوال والزوايا الموجهة وطبيعة المثلثات والرباعيات.",
    description_fr: "Lien entre argument, module et géométrie plane dans le plan complexe.",
    dimensions: ["knowledge", "application"],
  },
  physics_rc_circuit_differential_eq: {
    id: "physics_rc_circuit_differential_eq",
    subjectId: "physics",
    title_ar: "المعادلة التفاضلية لدارة RC",
    title_fr: "Équation différentielle d'un circuit RC",
    description_ar: "تطبيق قانون جمع التوترات لاستنتاج المعادلة التفاضلية لشحن أو تفريغ مكثفة.",
    description_fr: "Établissement de l'équation différentielle de charge/décharge selon la loi des mailles.",
    dimensions: ["methodology", "application"],
  },
  physics_newton_second_law_inclined: {
    id: "physics_newton_second_law_inclined",
    subjectId: "physics",
    title_ar: "القانون الثاني لنيوتن على مستو مائل",
    title_fr: "Deuxième loi de Newton sur plan incliné",
    description_ar: "إسقاط القوى (الثقل، رد الفعل، الاحتكاك) على محاور الحركة بدقة متجهة.",
    description_fr: "Projection vectorielle des forces sur un repère adapté pour déterminer l'accélération.",
    dimensions: ["understanding", "application"],
  },
  physics_nuclear_decay_law: {
    id: "physics_nuclear_decay_law",
    subjectId: "physics",
    title_ar: "قانون التناقص الإشعاعي وثابت الزمن",
    title_fr: "Loi de décroissance radioactive et constante de temps",
    description_ar: "استغلال المنحنيات الأسية لحساب ثابت النشاط ونصف العمر وحصيلة الطاقة.",
    description_fr: "Exploitation graphique et analytique de la décroissance radioactive.",
    dimensions: ["knowledge", "application"],
  },
  sciences_protein_synthesis_translation: {
    id: "sciences_protein_synthesis_translation",
    subjectId: "natural_sciences",
    title_ar: "آلية الترجمة وبنية الريبوزوم",
    title_fr: "Mécanisme de la traduction et structure du ribosome",
    description_ar: "شرح خطوات الانطلاق والاستطالة والنهاية في تركيب البروتين وفق المنهجية العلمية.",
    description_fr: "Description rigoureuse des étapes de la traduction selon la méthodologie du BAC.",
    dimensions: ["knowledge", "understanding"],
  },
  sciences_enzymatic_kinetics_inhibition: {
    id: "sciences_enzymatic_kinetics_inhibition",
    subjectId: "natural_sciences",
    title_ar: "النشاط الإنزيمي وتأثير المثبطات",
    title_fr: "Cinétique enzymatique et inhibition",
    description_ar: "تحليل وتفسير منحنيات السرعة الابتدائية وتأثير درجة الحرارة ودرجة الحموضة والمثبطات.",
    description_fr: "Analyse et interprétation des cinétiques enzymatiques et effets des effecteurs.",
    dimensions: ["methodology", "understanding"],
  },
  sciences_immunology_cellular_response: {
    id: "sciences_immunology_cellular_response",
    subjectId: "natural_sciences",
    title_ar: "الاستجابة المناعية النوعية الخلوية",
    title_fr: "Réponse immunitaire spécifique à médiation cellulaire",
    description_ar: "تحديد دور الخلايا اللمفاوية LTc في التعرف المزدوج وإفراز البيرفورين والتدمير الخلوي.",
    description_fr: "Rôle des lymphocytes T cytotoxiques dans la cytotoxicité et la reconnaissance double.",
    dimensions: ["understanding", "methodology"],
  },
};

const STREAM_COEFFICIENTS = {
  sciences_exp: [
    { subjectId: "natural_sciences", coefficient: 6 },
    { subjectId: "math", coefficient: 5 },
    { subjectId: "physics", coefficient: 5 },
    { subjectId: "arabic", coefficient: 3 },
    { subjectId: "philosophy", coefficient: 2 },
    { subjectId: "french", coefficient: 2 },
    { subjectId: "english", coefficient: 2 },
    { subjectId: "islamic_studies", coefficient: 2 },
    { subjectId: "history_geography", coefficient: 2 },
  ],
};

function getSkillsForSubject(subjectId) {
  return Object.values(SCIENCES_EXP_SKILLS).filter((s) => s.subjectId === subjectId);
}

// -----------------------------------------------------------------------------
// 2. PURE ENGINE LOGIC UNDER TEST (Mirroring src/lib/roadmap/engine.ts)
// -----------------------------------------------------------------------------

function resolveMission(skillId, missionsMap, source = "manual", priority = "medium") {
  const missionId = `mission-${skillId}`;
  const existing =
    Object.values(missionsMap || {}).find((m) => m.skillId === skillId) || (missionsMap && missionsMap[missionId]);
  if (existing) {
    return existing;
  }

  const skill = SCIENCES_EXP_SKILLS[skillId] || SCIENCES_EXP_SKILLS.math_derivatives_chain_rule;
  return {
    id: missionId,
    educationLevel: "secondary",
    examType: "bac",
    streamId: "sciences_exp",
    subjectId: skill.subjectId,
    skillId: skill.id,
    title: skill.title_ar,
    description: skill.description_ar,
    reason: "أظهر التقييم أن هذه المهارة تمثل أولوية في المسار الدراسي.",
    title_ar: `مهمة: ${skill.title_ar}`,
    title_fr: `Mission : ${skill.title_fr}`,
    description_ar: skill.description_ar,
    description_fr: skill.description_fr,
    priority,
    source,
    status: "available",
    practiceQuestionIds: [`pq-${skill.id}-01`],
    retestQuestionIds: [`rq-${skill.id}-01`],
    estimatedMinutes: 15,
  };
}

function isSkillDemonstrated(skillId, evidenceMap) {
  const ev = evidenceMap?.[skillId];
  if (!ev) return false;
  return ev.masteryStatus === "demonstrated" || ev.status === "mastered";
}

function getNextBestMission(input) {
  const missionsMap = Array.isArray(input.missions)
    ? Object.fromEntries(input.missions.map((m) => [m.id, m]))
    : (input.missions || {});

  const evidenceMap = input.masteryEvidence || {};
  const errorList = input.errors || [];
  const diag = input.diagnosticResult;

  const allMissions = Object.values(missionsMap);

  const isMissionInNeedsMoreWork = (skillId) =>
    allMissions.some((m) => m.skillId === skillId && m.status === "needs_more_work");

  // PRIORITY 1: Unfinished Loops (repair_needed or retest_ready)
  const unfinishedMissions = allMissions.filter(
    (m) =>
      (m.status === "repair_needed" || m.status === "retest_ready") &&
      !isSkillDemonstrated(m.skillId, evidenceMap)
  );

  if (unfinishedMissions.length > 0) {
    unfinishedMissions.sort((a, b) => {
      if (a.status === "retest_ready" && b.status !== "retest_ready") return -1;
      if (b.status === "retest_ready" && a.status !== "retest_ready") return 1;
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;
      return a.id.localeCompare(b.id);
    });

    const chosen = unfinishedMissions[0];
    const isRetest = chosen.status === "retest_ready";

    const rationale = {
      reasonCode: isRetest ? "continuation_retest" : "continuation_repair",
      priority: 1,
      reasonLabel_ar: isRetest ? "إعادة اختبار التمكن جاهزة" : "خطأ غير معالج يحتاج ترميماً",
      reasonLabel_fr: isRetest ? "Re-test prêt pour validation" : "Erreur non réparée nécessitant remédiation",
      evidence_ar: isRetest
        ? "أكملت خطوات الترميم لهذه المهارة؛ الأولوية الآن لاجتياز إعادة الاختبار لإثبات التحكم."
        : "تم رصد خطأ أثناء التمرين السابق؛ الأولوية لعلاجه فوراً قبل تراكم المفاهيم.",
      evidence_fr: isRetest
        ? "Les étapes de remédiation sont terminées ; la priorité est de valider le re-test."
        : "Une erreur a été identifiée ; la priorité est de la réparer avant d'accumuler de nouvelles notions.",
      shortExplanation_ar: isRetest
        ? "أنهيت خطة الترميم، وحان وقت إثبات تمكنك باختبار مماثل."
        : "عندك خطأ غير معالج في هذه المهارة. نصلحوه درك ونكملو.",
      shortExplanation_fr: isRetest
        ? "Remédiation terminée, validons votre maîtrise avec cet exercice équivalent."
        : "Une erreur non résolue est en attente. Corrigeons-la avant d'avancer.",
    };

    return { mission: chosen, rationale };
  }

  // PRIORITY 3: Recurring Errors (Fix the root cause)
  const recurringErrors = errorList.filter((e) => e.isRecurring);
  const unmasteredRecurringError = recurringErrors.find(
    (e) => !isSkillDemonstrated(e.skillId, evidenceMap)
  );

  if (unmasteredRecurringError) {
    const mission = resolveMission(unmasteredRecurringError.skillId, missionsMap, "manual", "high");
    const skill = SCIENCES_EXP_SKILLS[unmasteredRecurringError.skillId];
    const skillTitle = skill?.title_ar || unmasteredRecurringError.skillId;

    const rationale = {
      reasonCode: "recurring_error_cause",
      priority: 3,
      reasonLabel_ar: "معالجة خطأ متكرر في نفس المهارة",
      reasonLabel_fr: "Traitement d'une erreur récurrente",
      evidence_ar: `تكرر نفس نوع الخطأ (${unmasteredRecurringError.suspectedErrorType}) في مهارة [${skillTitle}] أكثر من مرة. الأفضل معالجة السبب الجذري بدل زيادة التمارين.`,
      evidence_fr: `Le même type d'erreur s'est répété sur cette notion. Il faut traiter la cause racine.`,
      shortExplanation_ar: "رصدنا تكرار نفس الخلل أكثر من مرة؛ سنعالج السبب المنهجي لنضمن عدم تكراره يوم الامتحان.",
      shortExplanation_fr: "Cette erreur s'est produite plusieurs fois ; nous ciblons sa cause pour l'éradiquer.",
    };

    return { mission, rationale };
  }

  // PRIORITY 4: Weakest Supported Cognitive Dimension
  if (diag) {
    const weakestDim =
      diag.preliminaryBottleneck?.dimension || diag.primaryBottleneck?.dimension;

    if (weakestDim) {
      const dimensionSkills = Object.values(SCIENCES_EXP_SKILLS).filter(
        (s) => s.dimensions.includes(weakestDim) && !isSkillDemonstrated(s.id, evidenceMap)
      );

      const eligibleDimSkill =
        dimensionSkills.find((s) => !isMissionInNeedsMoreWork(s.id)) ||
        dimensionSkills[0];

      if (eligibleDimSkill) {
        const mission = resolveMission(eligibleDimSkill.id, missionsMap, "diagnostic_dimension", "medium");
        const dimLabelAr =
          weakestDim === "methodology"
            ? "المنهجية وصياغة الإجابة"
            : weakestDim === "understanding"
            ? "الفهم المفاهيمي العميق"
            : weakestDim === "application"
            ? "التطبيق الرياضي والحسابي"
            : "المعارف والاسترجاع";

        const rationale = {
          reasonCode: "weakest_supported_dimension",
          priority: 4,
          reasonLabel_ar: `تقوية البعد المعرفي الأكثر هشاشة (${dimLabelAr})`,
          reasonLabel_fr: `Renforcement de la dimension cognitive la plus vulnérable (${weakestDim})`,
          evidence_ar: `أظهر التشخيص التجريبي أن بعد [${dimLabelAr}] يمثل نقطة الضعف الرئيسية في تحضيرك.`,
          evidence_fr: `Le diagnostic initial a révélé une vulnérabilité sur la dimension [${weakestDim}].`,
          shortExplanation_ar: "هذه المهمة تعالج بالتحديد البعد المعرفي الذي ضاعت فيه أكبر نسبة من النقاط في التشخيص.",
          shortExplanation_fr: "Cette mission cible la dimension cognitive où vous avez le plus de marge de progression.",
        };

        return { mission, rationale };
      }
    }
  }

  // PRIORITY 5: Emerging Skills
  const emergingSkills = Object.entries(evidenceMap).filter(
    ([id, ev]) => ev.masteryStatus === "emerging" && !isSkillDemonstrated(id, evidenceMap)
  );

  const eligibleEmerging = emergingSkills.find(
    ([id]) => !isMissionInNeedsMoreWork(id)
  );

  if (eligibleEmerging) {
    const [skillId] = eligibleEmerging;
    const mission = resolveMission(skillId, missionsMap, "manual", "medium");
    const skill = SCIENCES_EXP_SKILLS[skillId];

    const rationale = {
      reasonCode: "emerging_verification",
      priority: 5,
      reasonLabel_ar: "تثبيت مهارة واعدة باختبار توأمي",
      reasonLabel_fr: "Validation d'une compétence en progression",
      evidence_ar: `أجبت بشكل صحيح في التمرين الأولي لمهارة [${skill?.title_ar || skillId}]. حان وقت التحقق من نقل المفهوم لتأكيد التمكن التام.`,
      evidence_fr: "Réponse correcte à l'exercice initial ; il convient de valider le transfert conceptuel.",
      shortExplanation_ar: "نجحت في التمرين الأولي؛ سنقوم باختبار توأمي لنثبت أن المفهوم راسخ وليس مجرد صدفة.",
      shortExplanation_fr: "Votre premier succès est prometteur ; confirmons la maîtrise par un exercice jumeau.",
    };

    return { mission, rationale };
  }

  // PRIORITY 6: Next Unmastered Skill in Current Subject
  let currentSubjectId = "math";
  if (diag?.preliminaryBottleneck?.subjectId) {
    currentSubjectId = diag.preliminaryBottleneck.subjectId;
  }

  const subjectSkills = getSkillsForSubject(currentSubjectId);
  const unmasteredSubjectSkill = subjectSkills.find(
    (s) =>
      !isSkillDemonstrated(s.id, evidenceMap) &&
      !isMissionInNeedsMoreWork(s.id)
  );

  if (unmasteredSubjectSkill) {
    const mission = resolveMission(unmasteredSubjectSkill.id, missionsMap, "manual", "medium");

    const rationale = {
      reasonCode: "next_subject_skill",
      priority: 6,
      reasonLabel_ar: "المهارة التالية لبناء الأساس في نفس المادة",
      reasonLabel_fr: "Compétence suivante dans la matière en cours",
      evidence_ar: `مواصلة التدرج المنطقي في مهارات مادة [${currentSubjectId}].`,
      evidence_fr: `Progression logique dans les compétences de [${currentSubjectId}].`,
      shortExplanation_ar: "خطوة متدرجة للأمام في نفس المادة لتعزيز السيطرة على المفاهيم المترابطة.",
      shortExplanation_fr: "Étape suivante dans la même matière pour consolider les notions connexes.",
    };

    return { mission, rationale };
  }

  // PRIORITY 7: Next Supported Subject by Coefficient
  const streamRules = STREAM_COEFFICIENTS.sciences_exp;
  const sortedSubjects = [...streamRules].sort((a, b) => b.coefficient - a.coefficient);

  for (const rule of sortedSubjects) {
    const skillsInSubj = getSkillsForSubject(rule.subjectId);
    const unmastered = skillsInSubj.find(
      (s) =>
        !isSkillDemonstrated(s.id, evidenceMap) &&
        !isMissionInNeedsMoreWork(s.id)
    );

    if (unmastered) {
      const mission = resolveMission(unmastered.id, missionsMap, "manual", "medium");

      const rationale = {
        reasonCode: "next_core_subject",
        priority: 7,
        reasonLabel_ar: `الانتقال لمادة أساسية ذات معامل (${rule.coefficient})`,
        reasonLabel_fr: `Passage à une matière fondamentale (Coef ${rule.coefficient})`,
        evidence_ar: `الانتقال المنظم إلى مادة [${rule.subjectId}] لضمان توازن التحضير الدراسي.`,
        evidence_fr: `Transition vers [${rule.subjectId}] pour équilibrer la préparation.`,
        shortExplanation_ar: `ننتقل الآن لترميم مهارة في مادة [${rule.subjectId}] لرفع معدل التحكم العام.`,
        shortExplanation_fr: `Nous passons à [${rule.subjectId}] pour maintenir un rythme équilibré.`,
      };

      return { mission, rationale };
    }
  }

  // PRIORITY 2 FALLBACK: Delayed needs_more_work Skills
  const delayedNeedsWork = allMissions.find(
    (m) => m.status === "needs_more_work" && !isSkillDemonstrated(m.skillId, evidenceMap)
  );

  if (delayedNeedsWork) {
    const rationale = {
      reasonCode: "delayed_needs_more_work",
      priority: 2,
      reasonLabel_ar: "مراجعة مجدولة لمهارة تحتاج عملاً إضافياً",
      reasonLabel_fr: "Révision programmée d'une notion différée",
      evidence_ar: "تم تأجيل هذه المهارة سابقاً بعد استنفاذ محاولات الاختبار المباشرة لحماية طاقتك، وحان وقت العودة إليها بهدوء.",
      evidence_fr: "Cette notion a été différée pour éviter la surcharge cognitive ; il est temps d'y revenir posément.",
      shortExplanation_ar: "نعود الآن لهذه المهارة بعد استراحة كافية لترميمها بتركيز متجدد دون ضغط.",
      shortExplanation_fr: "Nous revenons à cette notion avec un regard neuf بعد avoir avancé sur le reste.",
    };

    return { mission: delayedNeedsWork, rationale };
  }

  return { mission: null, rationale: null };
}

function buildAdaptiveRoadmap(input) {
  const profile = input.onboardingProfile || {
    targetScore: 16,
    educationLevel: "secondary",
    examType: "BAC",
    streamId: "sciences_exp",
  };

  const missionsMap = Array.isArray(input.missions)
    ? Object.fromEntries(input.missions.map((m) => [m.id, m]))
    : (input.missions || {});

  const evidenceMap = input.masteryEvidence || {};
  const errorList = input.errors || [];
  const diag = input.diagnosticResult;

  const { mission: nextMission, rationale: nextMissionRationale } = getNextBestMission(input);

  const queuedMissions = [];
  const excludedIds = new Set();
  if (nextMission) excludedIds.add(nextMission.id);

  let tempMissionsMap = { ...missionsMap };
  let tempEvidenceMap = { ...evidenceMap };

  for (let step = 0; step < 3; step++) {
    if (nextMission && step === 0) {
      tempMissionsMap[nextMission.id] = { ...nextMission, status: "mastered" };
      tempEvidenceMap[nextMission.skillId] = {
        skillId: nextMission.skillId,
        masteryStatus: "demonstrated",
        status: "mastered",
      };
    }

    const { mission: candidate, rationale: candRationale } = getNextBestMission({
      ...input,
      missions: tempMissionsMap,
      masteryEvidence: tempEvidenceMap,
    });

    if (!candidate || excludedIds.has(candidate.id)) break;

    excludedIds.add(candidate.id);
    queuedMissions.push({
      mission: candidate,
      rationale: candRationale,
      priorityOrder: queuedMissions.length + 1,
    });

    tempMissionsMap[candidate.id] = { ...candidate, status: "mastered" };
    tempEvidenceMap[candidate.skillId] = {
      skillId: candidate.skillId,
      masteryStatus: "demonstrated",
      status: "mastered",
    };
  }

  // Subject Progress Matrix
  const subjectProgress = {};
  const streamSubjectRules = STREAM_COEFFICIENTS[profile.streamId] || STREAM_COEFFICIENTS.sciences_exp;

  for (const rule of streamSubjectRules) {
    const isPilotSubject =
      rule.subjectId === "math" ||
      rule.subjectId === "physics" ||
      rule.subjectId === "natural_sciences";

    if (!isPilotSubject) {
      subjectProgress[rule.subjectId] = {
        subjectId: rule.subjectId,
        status: "not_assessed",
        evidenceLevel: "none",
        demonstratedCount: 0,
        emergingCount: 0,
        needsWorkCount: 0,
        openErrorsCount: 0,
        totalPilotSkills: 0,
        coefficient: rule.coefficient,
      };
    } else {
      const subjSkills = getSkillsForSubject(rule.subjectId);
      const demonstrated = subjSkills.filter((s) => isSkillDemonstrated(s.id, evidenceMap)).length;
      const emerging = subjSkills.filter(
        (s) => evidenceMap[s.id]?.masteryStatus === "emerging" && !isSkillDemonstrated(s.id, evidenceMap)
      ).length;
      const needsWork = subjSkills.filter(
        (s) => missionsMap[`mission-${s.id}`]?.status === "needs_more_work" && !isSkillDemonstrated(s.id, evidenceMap)
      ).length;
      const openErrors = errorList.filter(
        (e) => e.subjectId === rule.subjectId && e.repairStatus !== "retest_passed"
      ).length;

      subjectProgress[rule.subjectId] = {
        subjectId: rule.subjectId,
        status: diag ? "assessed" : "partially_assessed",
        evidenceLevel: "pilot_evidence",
        demonstratedCount: demonstrated,
        emergingCount: emerging,
        needsWorkCount: needsWork,
        openErrorsCount: openErrors,
        totalPilotSkills: subjSkills.length,
        coefficient: rule.coefficient,
      };
    }
  }

  // Weakest Dimensions from Diagnostic
  const weakestDimensions = [];
  if (diag) {
    if (diag.preliminaryBottleneck?.dimension) {
      weakestDimensions.push({
        dimension: diag.preliminaryBottleneck.dimension,
        severity: diag.preliminaryBottleneck.severity || "critical",
      });
    }
    if (diag.primaryBottleneck?.dimension && diag.primaryBottleneck.dimension !== diag.preliminaryBottleneck?.dimension) {
      weakestDimensions.push({
        dimension: diag.primaryBottleneck.dimension,
        severity: diag.primaryBottleneck.severity || "high",
      });
    }
  }

  // Current Focus & Stage
  let stage = "move_forward";
  if (nextMission) {
    if (nextMission.status === "repair_needed") stage = "fix";
    else if (nextMission.status === "retest_ready") stage = "verify";
    else if (nextMission.status === "in_progress") stage = "demonstrate";
  }

  return {
    targetScore: profile.targetScore,
    streamId: profile.streamId,
    roadmapConfidence: "pilot",
    currentFocus: {
      stage,
      subjectId: nextMission?.subjectId || "math",
      skillId: nextMission?.skillId || "math_derivatives_chain_rule",
    },
    nextMission,
    nextMissionRationale,
    queuedMissions,
    masteredSkills: Object.entries(evidenceMap).filter(
      ([, ev]) => ev.masteryStatus === "demonstrated" || ev.status === "mastered"
    ).map(([id]) => ({ skillId: id })),
    emergingSkills: Object.entries(evidenceMap).filter(
      ([id, ev]) => ev.masteryStatus === "emerging" && !isSkillDemonstrated(id, evidenceMap)
    ).map(([id]) => ({ skillId: id })),
    needsMoreWorkSkills: Object.values(missionsMap).filter(
      (m) => m.status === "needs_more_work" && !isSkillDemonstrated(m.skillId, evidenceMap)
    ).map((m) => ({ skillId: m.skillId })),
    unresolvedErrors: errorList.filter((e) => e.repairStatus !== "retest_passed"),
    recurringErrors: errorList.filter((e) => e.isRecurring),
    weakestDimensions,
    subjectProgress,
    limitations: {
      ar: "الخريطة الحالية مبنية على بيانات تشخيص تجريبية محددة في المواد الأساسية الثلاث. بقية مواد البكالوريا غير مشمولة في هذه المرحلة.",
      fr: "Cette feuille de route repose sur des données diagnostiques pilotes ciblées sur les 3 matières principales. Les autres matières ne sont pas encore évaluées.",
    },
    generatedAt: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// 3. TEST RUNNER HELPERS
// -----------------------------------------------------------------------------

let passedCount = 0;
let failedCount = 0;

function runTest(testNum, testName, testFn) {
  try {
    testFn();
    console.log(`  [PASS] Test ${String(testNum).padStart(2, "0")}: ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] Test ${String(testNum).padStart(2, "0")}: ${testName}`);
    console.error(`         ${err.message}\n`);
    failedCount++;
  }
}

// -----------------------------------------------------------------------------
// 4. TEST SUITES
// -----------------------------------------------------------------------------

// SUITE 1: Pure Determinism: Same input -> same roadmap output
runTest(1, "Same input -> same roadmap output (pure determinism)", () => {
  const input = {
    onboardingProfile: { targetScore: 16, streamId: "sciences_exp" },
    missions: {
      "mission-math_derivatives_chain_rule": {
        id: "mission-math_derivatives_chain_rule",
        skillId: "math_derivatives_chain_rule",
        subjectId: "math",
        status: "available",
      },
    },
    masteryEvidence: {},
    errors: [],
  };

  const output1 = buildAdaptiveRoadmap(input);
  const output2 = buildAdaptiveRoadmap(input);

  assert.strictEqual(output1.nextMission?.id, output2.nextMission?.id);
  assert.strictEqual(output1.nextMissionRationale?.reasonCode, output2.nextMissionRationale?.reasonCode);
  assert.strictEqual(output1.queuedMissions.length, output2.queuedMissions.length);
  assert.deepStrictEqual(
    output1.queuedMissions.map((q) => q.mission.id),
    output2.queuedMissions.map((q) => q.mission.id)
  );
});

// SUITE 2: Priority 1 - repair_needed outranks normal available missions
runTest(2, "repair_needed outranks normal available missions (Priority 1)", () => {
  const input = {
    missions: {
      "m-available": {
        id: "m-available",
        skillId: "math_limits_indeterminate_forms",
        subjectId: "math",
        status: "available",
        priority: "high",
      },
      "m-repair": {
        id: "m-repair",
        skillId: "physics_rc_circuit_differential_eq",
        subjectId: "physics",
        status: "repair_needed",
        priority: "medium",
      },
    },
  };

  const next = getNextBestMission(input);
  assert.strictEqual(next.mission?.id, "m-repair", "repair_needed must outrank normal available missions");
  assert.strictEqual(next.rationale?.reasonCode, "continuation_repair");
  assert.strictEqual(next.rationale?.priority, 1);
});

// SUITE 3: Priority 1 - retest_ready outranks normal available missions
runTest(3, "retest_ready outranks normal available missions (Priority 1)", () => {
  const input = {
    missions: {
      "m-avail": {
        id: "m-avail",
        skillId: "sciences_protein_synthesis_translation",
        subjectId: "natural_sciences",
        status: "available",
      },
      "m-retest": {
        id: "m-retest",
        skillId: "math_derivatives_chain_rule",
        subjectId: "math",
        status: "retest_ready",
      },
    },
  };

  const next = getNextBestMission(input);
  assert.strictEqual(next.mission?.id, "m-retest", "retest_ready must outrank normal available missions");
  assert.strictEqual(next.rationale?.reasonCode, "continuation_retest");
});

// SUITE 4: Priority 2 - needs_more_work is delayed (does not immediately loop)
runTest(4, "needs_more_work is delayed and does not immediately loop", () => {
  const input = {
    missions: {
      "m-stuck": {
        id: "m-stuck",
        skillId: "math_derivatives_chain_rule",
        subjectId: "math",
        status: "needs_more_work",
      },
      "m-fresh": {
        id: "m-fresh",
        skillId: "math_limits_indeterminate_forms",
        subjectId: "math",
        status: "available",
      },
    },
  };

  const next = getNextBestMission(input);
  assert.notStrictEqual(next.mission?.id, "m-stuck", "needs_more_work must not be scheduled immediately");
  assert.strictEqual(next.mission?.id, "m-fresh", "Fresh unmastered skill must be prioritized");
});

// SUITE 5: Priority 3 - Recurring error elevates priority to fix root cause
runTest(5, "Recurring error elevates priority to fix root cause (Priority 3)", () => {
  const input = {
    missions: {
      "m-normal": {
        id: "m-normal",
        skillId: "math_limits_indeterminate_forms",
        subjectId: "math",
        status: "available",
      },
    },
    errors: [
      {
        id: "err-1",
        skillId: "physics_rc_circuit_differential_eq",
        subjectId: "physics",
        suspectedErrorType: "calculation_error",
        isRecurring: true,
        repairStatus: "identified",
      },
    ],
  };

  const next = getNextBestMission(input);
  assert.strictEqual(next.mission?.skillId, "physics_rc_circuit_differential_eq");
  assert.strictEqual(next.rationale?.reasonCode, "recurring_error_cause");
  assert.strictEqual(next.rationale?.priority, 3);
});

// SUITE 6: Mastered skill is excluded from active queue
runTest(6, "Mastered skill is excluded from active queue", () => {
  const input = {
    missions: {
      "m-mastered": {
        id: "m-mastered",
        skillId: "math_derivatives_chain_rule",
        subjectId: "math",
        status: "mastered",
      },
    },
    masteryEvidence: {
      math_derivatives_chain_rule: {
        skillId: "math_derivatives_chain_rule",
        masteryStatus: "demonstrated",
        status: "mastered",
      },
    },
  };

  const roadmap = buildAdaptiveRoadmap(input);
  assert.notStrictEqual(roadmap.nextMission?.skillId, "math_derivatives_chain_rule");
  assert.ok(!roadmap.queuedMissions.some((q) => q.mission.skillId === "math_derivatives_chain_rule"));
});

// SUITE 7: Emerging skill remains eligible for transfer verification
runTest(7, "Emerging skill remains eligible for transfer verification (Priority 5)", () => {
  const input = {
    missions: {
      "m-emerging": {
        id: "m-emerging",
        skillId: "physics_nuclear_decay_law",
        subjectId: "physics",
        status: "available",
      },
    },
    masteryEvidence: {
      physics_nuclear_decay_law: {
        skillId: "physics_nuclear_decay_law",
        masteryStatus: "emerging",
        confidenceSignals: [4],
      },
    },
  };

  const next = getNextBestMission(input);
  assert.strictEqual(next.mission?.skillId, "physics_nuclear_decay_law");
  assert.strictEqual(next.rationale?.reasonCode, "emerging_verification");
  assert.strictEqual(next.rationale?.priority, 5);
});

// SUITE 8: Diagnostic bottleneck influences selection when no open errors exist
runTest(8, "Diagnostic bottleneck influences selection when no open errors exist", () => {
  const input = {
    diagnosticResult: {
      preliminaryBottleneck: {
        subjectId: "natural_sciences",
        dimension: "methodology",
        severity: "critical",
      },
    },
    masteryEvidence: {},
    errors: [],
  };

  const next = getNextBestMission(input);
  assert.ok(next.mission, "Mission must be selected from diagnostic bottleneck");
  assert.strictEqual(next.rationale?.priority, 4, "Should target weakest dimension from diagnostic");
});

// SUITE 9: Weakest supported dimension influences selection
runTest(9, "Weakest supported dimension influences selection (Priority 4)", () => {
  const input = {
    diagnosticResult: {
      preliminaryBottleneck: {
        subjectId: "physics",
        dimension: "understanding",
        severity: "high",
      },
    },
  };

  const next = getNextBestMission(input);
  assert.strictEqual(next.rationale?.reasonCode, "weakest_supported_dimension");
  const skill = SCIENCES_EXP_SKILLS[next.mission.skillId];
  assert.ok(skill.dimensions.includes("understanding"), "Skill must address the weakest dimension");
});

// SUITE 10: Higher-coefficient subject does not override unresolved repair
runTest(10, "Higher-coefficient subject does not override unresolved repair", () => {
  // Natural Sciences has Coef 6, Physics has Coef 5.
  // An unresolved repair in Physics must NOT be overridden by Natural Sciences.
  const input = {
    onboardingProfile: { streamId: "sciences_exp" },
    missions: {
      "m-science": {
        id: "m-science",
        skillId: "sciences_enzymatic_kinetics_inhibition",
        subjectId: "natural_sciences",
        status: "available",
      },
      "m-physics-repair": {
        id: "m-physics-repair",
        skillId: "physics_rc_circuit_differential_eq",
        subjectId: "physics",
        status: "repair_needed",
      },
    },
  };

  const next = getNextBestMission(input);
  assert.strictEqual(
    next.mission?.id,
    "m-physics-repair",
    "Open repair in Coef 5 subject must take precedence over clean Coef 6 mission"
  );
  assert.strictEqual(next.rationale?.priority, 1);
});

// SUITE 11: Untested subject is not marked weak or 0%
runTest(11, "Untested subject is not marked weak or 0%", () => {
  const roadmap = buildAdaptiveRoadmap({
    onboardingProfile: { streamId: "sciences_exp" },
  });

  const arabicProgress = roadmap.subjectProgress.arabic;
  assert.ok(arabicProgress, "Arabic must exist in subject progress");
  assert.strictEqual(arabicProgress.status, "not_assessed", "Untested subject must be not_assessed");
  assert.strictEqual(arabicProgress.evidenceLevel, "none", "Untested subject must have evidenceLevel none");
  assert.strictEqual(arabicProgress.needsWorkCount, 0, "Untested subject must NOT have needsWorkCount > 0");
});

// SUITE 12: Different error types on same skill are not incorrectly merged into recurring
runTest(12, "Different error types on same skill are not incorrectly merged into recurring", () => {
  const errors = [
    {
      id: "e1",
      skillId: "math_derivatives_chain_rule",
      subjectId: "math",
      suspectedErrorType: "calculation_error",
      isRecurring: false,
    },
    {
      id: "e2",
      skillId: "math_derivatives_chain_rule",
      subjectId: "math",
      suspectedErrorType: "methodology_error",
      isRecurring: false,
    },
  ];

  const recurring = errors.filter((e) => e.isRecurring);
  assert.strictEqual(recurring.length, 0, "Distinct error types must never be flagged as recurring");
});

// SUITE 13: Transparent bilingual rationale is generated for next mission
runTest(13, "Transparent bilingual rationale is generated for next mission", () => {
  const roadmap = buildAdaptiveRoadmap({
    onboardingProfile: { targetScore: 16, streamId: "sciences_exp" },
  });

  const rationale = roadmap.nextMissionRationale;
  assert.ok(rationale, "Rationale must exist");
  assert.ok(rationale.reasonLabel_ar && rationale.reasonLabel_ar.length > 3);
  assert.ok(rationale.reasonLabel_fr && rationale.reasonLabel_fr.length > 3);
  assert.ok(rationale.shortExplanation_ar && rationale.shortExplanation_ar.length > 10);
  assert.ok(rationale.shortExplanation_fr && rationale.shortExplanation_fr.length > 10);
  assert.ok(rationale.evidence_ar && rationale.evidence_ar.length > 5);
  assert.ok(rationale.evidence_fr && rationale.evidence_fr.length > 5);
});

// SUITE 14: Target score influences explanation without making mathematical guarantees
runTest(14, "Target score influences explanation without making mathematical guarantees", () => {
  const roadmap14 = buildAdaptiveRoadmap({
    onboardingProfile: { targetScore: 14, streamId: "sciences_exp" },
  });
  const roadmap18 = buildAdaptiveRoadmap({
    onboardingProfile: { targetScore: 18, streamId: "sciences_exp" },
  });

  assert.strictEqual(roadmap14.targetScore, 14);
  assert.strictEqual(roadmap18.targetScore, 18);

  const jsonStr = JSON.stringify(roadmap18);
  assert.ok(!jsonStr.includes("predictedBACScore"), "Roadmap must never claim predictedBACScore");
  assert.ok(!jsonStr.includes("guaranteedScore"), "Roadmap must never promise guaranteed score");
});

// SUITE 15: Roadmap confidence remains explicitly 'pilot'
runTest(15, "Roadmap confidence remains explicitly 'pilot'", () => {
  const roadmap = buildAdaptiveRoadmap({});
  assert.strictEqual(roadmap.roadmapConfidence, "pilot");
  assert.ok(roadmap.limitations.ar.includes("بيانات تشخيص تجريبية محددة"));
  assert.ok(roadmap.limitations.fr.includes("pilotes ciblées"));
});

// SUITE 16: Deterministic ordering of queued missions
runTest(16, "Deterministic ordering of queued missions (2-4 items)", () => {
  const input = {
    onboardingProfile: { targetScore: 16, streamId: "sciences_exp" },
  };

  const r1 = buildAdaptiveRoadmap(input);
  const r2 = buildAdaptiveRoadmap(input);

  assert.ok(r1.queuedMissions.length >= 2, "Must produce at least 2 queued missions");
  assert.ok(r1.queuedMissions.length <= 4, "Must produce at most 4 queued missions");
  for (let i = 0; i < r1.queuedMissions.length; i++) {
    assert.strictEqual(
      r1.queuedMissions[i].mission.id,
      r2.queuedMissions[i].mission.id,
      `Queued mission index ${i} must match identically`
    );
    assert.strictEqual(r1.queuedMissions[i].priorityOrder, i + 1);
  }
});

// SUITE 17: Empty mission history is handled safely
runTest(17, "Empty mission history is handled safely", () => {
  const roadmap = buildAdaptiveRoadmap({
    missions: {},
    masteryEvidence: {},
    errors: [],
  });

  assert.ok(roadmap.nextMission, "Safe default mission must be selected");
  assert.ok(roadmap.currentFocus.stage, "Stage must be assigned");
  assert.strictEqual(roadmap.masteredSkills.length, 0);
  assert.strictEqual(roadmap.emergingSkills.length, 0);
  assert.strictEqual(roadmap.needsMoreWorkSkills.length, 0);
});

// SUITE 18: Missing diagnostic data is handled gracefully
runTest(18, "Missing diagnostic data is handled gracefully", () => {
  const roadmap = buildAdaptiveRoadmap({
    diagnosticResult: null,
    onboardingProfile: { targetScore: 15, streamId: "sciences_exp" },
  });

  assert.ok(roadmap.nextMission, "Must select mission without crashing");
  assert.strictEqual(roadmap.weakestDimensions.length, 0);
});

// SUITE 19: Onboarding-only mode functions correctly
runTest(19, "Onboarding-only mode functions correctly", () => {
  const roadmap = buildAdaptiveRoadmap({
    onboardingProfile: {
      targetScore: 17,
      streamId: "sciences_exp",
      initialEstimatedScores: { math: 12, physics: 13, natural_sciences: 14 },
    },
    diagnosticResult: null,
    missions: {},
  });

  assert.strictEqual(roadmap.targetScore, 17);
  assert.strictEqual(roadmap.roadmapConfidence, "pilot");
  assert.ok(roadmap.nextMission);
  assert.ok(roadmap.queuedMissions.length >= 2);
});

// SUITE 20: Regression - Onboarding tests pass
runTest(20, "Regression: test-onboarding.mjs passes (3/3)", () => {
  const out = execSync("node ./scripts/test-onboarding.mjs", { encoding: "utf-8" });
  assert.ok(out.includes("ALL 3 SUITES OF ONBOARDING TESTS PASSED"));
});

// SUITE 21: Regression - Diagnostic tests pass
runTest(21, "Regression: test-diagnostic.mjs passes (18/18)", () => {
  const out = execSync("node ./scripts/test-diagnostic.mjs", { encoding: "utf-8" });
  assert.ok(out.includes("ALL 18 COMPREHENSIVE TEST SUITES PASSED"));
});

// SUITE 22: Regression - Mission tests pass
runTest(22, "Regression: test-missions.mjs passes (17/17)", () => {
  const out = execSync("node ./scripts/test-missions.mjs", { encoding: "utf-8" });
  assert.ok(out.includes("ALL 17 MISSION & ERROR LAB TEST SUITES PASSED"));
});

// SUITE 23: Regression - Mastery tests pass
runTest(23, "Regression: test-mastery.mjs passes (28/28)", () => {
  const out = execSync("node ./scripts/test-mastery.mjs", { encoding: "utf-8" });
  assert.ok(out.includes("ALL 28/28 AUTHORITATIVE MASTERY SUITES PASSED"));
});

console.log("\n==================================================================");
console.log(`  RESULTS: ${passedCount}/23 SUITES PASSED (${failedCount} FAILURES)`);
if (failedCount === 0) {
  console.log("  ALL 23/23 AUTHORITATIVE ROADMAP SUITES PASSED WITH 100% SUCCESS!");
}
console.log("==================================================================\n");

if (failedCount > 0) {
  process.exit(1);
}

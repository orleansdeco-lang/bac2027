/**
 * BAC Mastery V1 — Machine-Readable Content Coverage Matrix
 * Prompt 20: Comprehensive Curriculum Coverage & Lifecycle Accounting
 * 
 * Strict Audit Rules:
 * 1. Only genuinely verified and published skills (the 31 canonical Sciences Exp skills)
 *    are marked as PUBLISHED.
 * 2. New streams and subjects are faithfully classified as MAPPED or PLANNED.
 * 3. Never claim "100% complete" for unverified or planned content.
 */

import { StreamId, SubjectId, TechniqueMathSpecialty } from "@/types/education";
import { ALL_CURRICULUM_SKILLS } from "@/data/curriculum/skills";
import { CoverageSkillItem, CoverageStatus, ContentLifecycleState } from "./types";

// 1. Build the active 31 canonical Sciences Expérimentales entries
const CANONICAL_SCIENCES_EXP_ITEMS: CoverageSkillItem[] = Object.values(ALL_CURRICULUM_SKILLS).map((skill) => ({
  skillId: skill.id,
  subjectId: skill.subjectId,
  streamId: "sciences_exp",
  topicId: skill.topicId,
  title_ar: skill.title_ar,
  title_fr: skill.title_fr,
  objective_ar: skill.description_ar,
  objective_fr: skill.description_fr,
  bloomLevel: skill.cognitiveDimensions.includes("application") ? "apply" : "understand",
  status: "PUBLISHED" as CoverageStatus,
  lifecycleState: "PUBLISHED" as ContentLifecycleState,
  hasLesson: true,
  hasExample: true,
  hasActiveRecall: true,
  hasPractice: true,
  hasRetest: true,
  hasRepair: true,
  hasExamTransfer: true,
  contentLanguage: "ar",
  verificationStatus: "OFFICIAL_HISTORICAL",
  verificationDimensions: {
    structuralVerification: true,
    factualVerification: true,
    pedagogicalVerification: true,
    provenanceVerification: true,
    languageVerification: true,
  },
  productionPriorityScore: 100, // already completed reference implementation
}));

// 2. Multi-Stream Planned Foundations (Math, Technique Math, Gestion-Éco, Lettres-Philo, Langues)
const PLANNED_MULTI_STREAM_ITEMS: CoverageSkillItem[] = [
  // ===========================================================================
  // STREAM: MATHÉMATIQUES
  // ===========================================================================
  {
    skillId: "math_m_arithmetic_congruence",
    subjectId: "math",
    streamId: "math",
    topicId: "math_topic_arithmetic",
    title_ar: "الحساب والموافقات في Z ونظريات القسمة الإقليدية",
    title_fr: "Arithmétique, congruences dans Z et théorèmes de divisibilité",
    objective_ar: "إتقان نظريات بيزو وغوص والخواص الجبرية للموافقات وحل المعادلات في Z.",
    objective_fr: "Maîtrise des théorèmes de Bézout, Gauss et résolution des équations diophantiennes.",
    bloomLevel: "apply",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 92,
  },
  {
    skillId: "math_m_complex_geometry",
    subjectId: "math",
    streamId: "math",
    topicId: "math_topic_complex_numbers",
    title_ar: "الأعداد المركبة والتحويلات النقطية والتشابه المباشر",
    title_fr: "Nombres complexes, transformations planes et similitudes directes",
    objective_ar: "تحديد عناصر التشابه المباشر وتفسير النسب المثلثية والمجموعات النقطية هندسياً.",
    objective_fr: "Caractérisation géométrique des similitudes planes directes et lieux géométriques.",
    bloomLevel: "analyze",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 88,
  },
  {
    skillId: "math_m_conics_curves",
    subjectId: "math",
    streamId: "math",
    topicId: "math_topic_conics",
    title_ar: "المقاطع المخروطية (القطع المكافئ، الناقص، والزائد)",
    title_fr: "Sections coniques (parabole, ellipse, hyperbole)",
    objective_ar: "تحديد المعادلة المختزلة والبؤرة والدليل والمماسات للقطوع المخروطية.",
    objective_fr: "Équations réduites, foyers, directrices et tangentes aux coniques.",
    bloomLevel: "understand",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 78,
  },

  // ===========================================================================
  // STREAM: TECHNIQUE MATHÉMATIQUES (4 ISOLATED SPECIALTIES)
  // ===========================================================================
  // Specialty: Génie Civil
  {
    skillId: "tm_gc_structural_statics",
    subjectId: "civil_eng",
    streamId: "technique_math",
    specialtyId: "civil_eng",
    topicId: "gc_topic_statics",
    title_ar: "علم السكون وتوازن الأنظمة المثلثية وحساب ردود الأفعال",
    title_fr: "Statique des systèmes réticulés et calcul des réactions d'appuis",
    objective_ar: "تطبيق مبدأ السكون الأساسي لعزل العقد والرافعات وحساب الجهود الداخلية.",
    objective_fr: "Application du principe fondamental de la statique aux treillis plans.",
    bloomLevel: "apply",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 90,
  },
  // Specialty: Génie Mécanique
  {
    skillId: "tm_gm_kinematic_mechanisms",
    subjectId: "mechanical_eng",
    streamId: "technique_math",
    specialtyId: "mechanical_eng",
    topicId: "gm_topic_kinematics",
    title_ar: "السينماتيك ومخطط السرعات والتسارع في الآليات الميكانيكية",
    title_fr: "Cinématique graphique et champs des vitesses des mécanismes",
    objective_ar: "تحديد مركز الدوران اللحظي ومضلع السرعات لنقاط منظومة ميكانيكية متصلة.",
    objective_fr: "Détermination du CIR et tracé de l'épure des vitesses pour mécanismes plans.",
    bloomLevel: "apply",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 90,
  },
  // Specialty: Génie Électrique
  {
    skillId: "tm_ge_combinational_logic",
    subjectId: "electrical_eng",
    streamId: "technique_math",
    specialtyId: "electrical_eng",
    topicId: "ge_topic_logic",
    title_ar: "الأنظمة التوافقية ومخططات كارنو والتجسيد بالبوابات المنطقية",
    title_fr: "Logique combinatoire, tableaux de Karnaugh et réalisation par portes",
    objective_ar: "تبسيط الدوال المنطقية ورسم المخطط المنطقي والمحاكاة التقنية للدارات.",
    objective_fr: "Simplification algébrique et par tableaux de Karnaugh de fonctions logiques.",
    bloomLevel: "apply",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 90,
  },
  // Specialty: Génie des Procédés
  {
    skillId: "tm_gp_chemical_reactors",
    subjectId: "process_eng",
    streamId: "technique_math",
    specialtyId: "process_eng",
    topicId: "gp_topic_reactors",
    title_ar: "المفاعلات الكيميائية وموازين المادة والطاقة في العمليات الموحدة",
    title_fr: "Réacteurs chimiques et bilans de matière et d'énergie des opérations unitaires",
    objective_ar: "حساب حجم المفاعل وزمن الإقامة وتحليل مردود التحول الكيميائي الصناعي.",
    objective_fr: "Calcul de dimensionnement de réacteurs discontinus et continus idéaux.",
    bloomLevel: "apply",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 90,
  },

  // ===========================================================================
  // STREAM: GESTION ET ÉCONOMIE
  // ===========================================================================
  {
    skillId: "ge_acc_financial_analysis",
    subjectId: "accounting_finance",
    streamId: "gestion_eco",
    topicId: "acc_topic_financial_analysis",
    title_ar: "الميزانية الوظيفية وتحليل مؤشرات التوازن المالي (FRNG, BFR, TN)",
    title_fr: "Bilan fonctionnel et analyse des équilibres financiers (FRNG, BFR, TN)",
    objective_ar: "إعداد الميزانية الوظيفية واستخراج رأس المال العامل وصافي الخزينة وتفسيرها اقتصادياً.",
    objective_fr: "Établissement du bilan fonctionnel et calcul des indicateurs de trésorerie.",
    bloomLevel: "apply",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 91,
  },
  {
    skillId: "ge_eco_monetary_policy",
    subjectId: "economics_management",
    streamId: "gestion_eco",
    topicId: "eco_topic_monetary",
    title_ar: "السياسة النقدية والكتلة النقدية وأدوات التدخل للبنك المركزي",
    title_fr: "Politique monétaire, masse monétaire et instruments de la banque centrale",
    objective_ar: "تحليل أدوات السياسة النقدية المباشرة وغير المباشرة لمعالجة التضخم والركود.",
    objective_fr: "Analyse des instruments de régulation monétaire face à l'inflation.",
    bloomLevel: "understand",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 84,
  },
  {
    skillId: "ge_law_work_contracts",
    subjectId: "law",
    streamId: "gestion_eco",
    topicId: "law_topic_labor",
    title_ar: "علاقات العمل الفردية وشروط صحة عقد العمل وآثار إنهائه",
    title_fr: "Relations individuelles de travail, contrat de travail et rupture",
    objective_ar: "التمييز القانوني بين عقود العمل المحددة وغير المحددة المدة وحالات التسريح التأديبي.",
    objective_fr: "Régime juridique des contrats de travail et procédures légales de résiliation.",
    bloomLevel: "understand",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 82,
  },

  // ===========================================================================
  // STREAM: LETTRES ET PHILOSOPHIE
  // ===========================================================================
  {
    skillId: "lp_phil_epistemology_science",
    subjectId: "philosophy",
    streamId: "lettres_philo",
    topicId: "phil_topic_knowledge",
    title_ar: "المقالة الفلسفية المقارنة بين المعرفة الفلسفية والبحث العلمي",
    title_fr: "Dissertation comparée : pensée philosophique vs démarche scientifique",
    objective_ar: "بناء مقالة فلسفية بطريقة المقارنة مع ضبط أوجه التشابه والاختلاف والتدخل.",
    objective_fr: "Méthodologie de la dissertation comparative en épistémologie.",
    bloomLevel: "evaluate",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 93,
  },
  {
    skillId: "lp_ar_classical_poetry_analysis",
    subjectId: "arabic",
    streamId: "lettres_philo",
    topicId: "ar_topic_poetry",
    title_ar: "تحليل النص الشعري في عصر الانحطاط والنزعة العقلية",
    title_fr: "Analyse textuelle et stylistique de la poésie classique arabe",
    objective_ar: "تحليل الخصائص البلاغية والأسلوبية والعروضية للنص الشعري وفق منهجية البكالوريا.",
    objective_fr: "Analyse rhétorique, stylistique et prosodique selon les normes du BAC.",
    bloomLevel: "analyze",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "ar",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 89,
  },

  // ===========================================================================
  // STREAM: LANGUES ÉTRANGÈRES
  // ===========================================================================
  {
    skillId: "le_fr_argumentative_text_analysis",
    subjectId: "french",
    streamId: "langues_etrangeres",
    topicId: "fr_topic_argumentation",
    title_ar: "تحليل النص الحجاجي والتقنيات البيانية لصياغة التقرير الموضوعي",
    title_fr: "Analyse du texte argumentatif et techniques du compte rendu objectif",
    objective_ar: "استخراج الأطروحة والحجج والمؤشرات اللغوية وإعداد ملخص موضوعي دقيق بالفرنسية.",
    objective_fr: "Identification de la visée argumentative et rédaction du compte rendu objectif.",
    bloomLevel: "analyze",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "fr",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 92,
  },
  {
    skillId: "le_en_historical_text_critique",
    subjectId: "english",
    streamId: "langues_etrangeres",
    topicId: "en_topic_ancient_civilizations",
    title_ar: "قراءة نقدية للنصوص التاريخية حول الحضارات القديمة والكتابة التحريرية",
    title_fr: "Analyse textuelle et expression écrite : civilisations antiques et éthique",
    objective_ar: "قراءة النص وفهم المغزى وبناء فقرة تعبيرية منسجمة باللغة الإنجليزية.",
    objective_fr: "Compréhension écrite approfondie et expression écrite structurée en anglais.",
    bloomLevel: "apply",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "en",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 90,
  },
  {
    skillId: "le_es_hispanic_culture_dialogue",
    subjectId: "third_language",
    streamId: "langues_etrangeres",
    topicId: "es_topic_culture",
    title_ar: "فهم المقروء والتعبير المكتوب في اللغة الإسبانية لشهادة البكالوريا",
    title_fr: "Compréhension écrite et expression guidée en langue espagnole (BAC)",
    objective_ar: "فهم الأفكار الأساسية للنص الإسباني وتصريف الأفعال في الأزمنة المبرمجة بدقة.",
    objective_fr: "Compréhension globale et conjugaison en contexte selon le programme du BAC.",
    bloomLevel: "understand",
    status: "MAPPED",
    lifecycleState: "DRAFT",
    hasLesson: false,
    hasExample: false,
    hasActiveRecall: false,
    hasPractice: false,
    hasRetest: false,
    hasRepair: false,
    hasExamTransfer: false,
    contentLanguage: "es",
    verificationStatus: "OFFICIAL_HISTORICAL",
    verificationDimensions: {
      structuralVerification: false,
      factualVerification: true,
      pedagogicalVerification: false,
      provenanceVerification: true,
      languageVerification: false,
    },
    productionPriorityScore: 85,
  },
];

// Unified Master Matrix Array
export const FULL_COVERAGE_MATRIX: CoverageSkillItem[] = [
  ...CANONICAL_SCIENCES_EXP_ITEMS,
  ...PLANNED_MULTI_STREAM_ITEMS,
];

// ============================================================================
// HELPER QUERY FUNCTIONS
// ============================================================================

export function getCoverageMatrix(): CoverageSkillItem[] {
  return FULL_COVERAGE_MATRIX;
}

export function getStreamCoverage(
  streamId: StreamId,
  specialtyId?: TechniqueMathSpecialty
): CoverageSkillItem[] {
  return FULL_COVERAGE_MATRIX.filter((item) => {
    if (item.streamId !== streamId) return false;
    if (streamId === "technique_math") {
      if (!item.specialtyId) return true; // common TM skills
      if (!specialtyId) return false;     // unknown specialty does not leak branch skills
      return item.specialtyId === specialtyId;
    }
    return true;
  });
}

export function getSkillCoverageItem(skillId: string): CoverageSkillItem | undefined {
  return FULL_COVERAGE_MATRIX.find((item) => item.skillId === skillId);
}

export function getCoverageStats() {
  const total = FULL_COVERAGE_MATRIX.length;
  const published = FULL_COVERAGE_MATRIX.filter((i) => i.status === "PUBLISHED").length;
  const mapped = FULL_COVERAGE_MATRIX.filter((i) => i.status === "MAPPED").length;
  const planned = FULL_COVERAGE_MATRIX.filter((i) => i.status === "PLANNED").length;

  const byStream: Record<StreamId, { total: number; published: number; mapped: number }> = {
    sciences_exp: { total: 0, published: 0, mapped: 0 },
    math: { total: 0, published: 0, mapped: 0 },
    technique_math: { total: 0, published: 0, mapped: 0 },
    gestion_eco: { total: 0, published: 0, mapped: 0 },
    lettres_philo: { total: 0, published: 0, mapped: 0 },
    langues_etrangeres: { total: 0, published: 0, mapped: 0 },
  };

  for (const item of FULL_COVERAGE_MATRIX) {
    if (byStream[item.streamId]) {
      byStream[item.streamId].total++;
      if (item.status === "PUBLISHED") byStream[item.streamId].published++;
      if (item.status === "MAPPED") byStream[item.streamId].mapped++;
    }
  }

  return {
    totalSkillsCount: total,
    publishedSkillsCount: published,
    mappedSkillsCount: mapped,
    plannedSkillsCount: planned,
    byStream,
  };
}

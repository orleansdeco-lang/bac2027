/**
 * BAC Mastery — 3AS Mathematics Curriculum Registry
 * 
 * Formal Registry for the 5 Domains and 11 Core Topics of 3AS Mathématiques.
 * Official Legal Baseline:
 * - Executive Decree No. 07-142 of 19 May 2007 (المرسوم التنفيذي 07-142)
 * - Official Ministerial Curriculum Document (المنهاج الرسمي لمادة الرياضيات - السنة 3 ثانوي - شعبة رياضيات)
 * - Ministerial Decision of 10 September 2026 cancelling secondary schedules/coefficients Decision 20
 * 
 * Invariant: Every source cited carries an explicit source classification.
 */

import { MathCurriculumDomain, MathCurriculumTopic } from "./types";
import { SourceClassification } from "@/domain/content-quality/types";

// =============================================================================
// 1. OFFICIAL CURRICULUM SOURCES FOR 3AS MATHEMATICS
// =============================================================================

export interface OfficialCurriculumSourceRecord {
  sourceId: string;
  title: string;
  publisher: string;
  classification: SourceClassification;
  rightsStatus: "official_reference" | "original";
  documentReference: string;
  notes: string;
}

export const MATH_3AS_OFFICIAL_SOURCES: Record<string, OfficialCurriculumSourceRecord> = {
  "src-men-3as-math-syllabus": {
    sourceId: "src-men-3as-math-syllabus",
    title: "المنهاج الرسمي والوثيقة المرافقة لمادة الرياضيات — السنة الثالثة ثانوي شعبة رياضيات",
    publisher: "وزارة التربية الوطنية — اللجنة الوطنية للمناهج (CNP)",
    classification: "OFFICIAL_HISTORICAL",
    rightsStatus: "official_reference",
    documentReference: "MEN-CNP-3AS-MATH-2012",
    notes: "الوحدات البيداغوجية والكفاءات المستهدفة لشعبة الرياضيات الصادرة عن وزارة التربية الوطنية.",
  },
  "src-men-cancellation-10sept2026": {
    sourceId: "src-men-cancellation-10sept2026",
    title: "مقرر وزارة التربية الوطنية المؤرخ في 10 سبتمبر 2026 القاضي بإلغاء القرار الوزاري رقم 20 المتعلق بالمواقيت والمعاملات",
    publisher: "وزارة التربية الوطنية (الجزائر)",
    classification: "OFFICIAL_CURRENT",
    rightsStatus: "official_reference",
    documentReference: "Décision MEN du 10 septembre 2026",
    notes: "السند الرسمي الصريح الذي ألغى التعديلات السابقة وأبقى التنظيم القائم لسنة 2026-2027.",
  },
  "src-onec-bac-math-archives": {
    sourceId: "src-onec-bac-math-archives",
    title: "مواضيع وسلالم تصحيح امتحان شهادة البكالوريا — مادة الرياضيات شعبة رياضيات (2015-2025)",
    publisher: "الديوان الوطني للامتحانات والمسابقات (ONEC)",
    classification: "OFFICIAL_HISTORICAL",
    rightsStatus: "official_reference",
    documentReference: "ONEC-BAC-MATH-ARCHIVES",
    notes: "المرجع الرسمي لطبيعة المسائل وتوزيع النقاط ونماذج الإجابة المعتمدة في البكالوريا.",
  },
  "src-bac-mastery-math-factory": {
    sourceId: "src-bac-mastery-math-factory",
    title: "منظومة الهندسة البيداغوجية وبنك التمارين التوأم لبكالوريا الرياضيات — BAC Mastery",
    publisher: "فريق تطوير المحتوى التعليمي BAC Mastery",
    classification: "BAC_MASTERY_DERIVED",
    rightsStatus: "original",
    documentReference: "BAC-MASTERY-MATH-FACTORY-2027-V1",
    notes: "صياغة أصلية للدروس، التمارين التطبيقية، شبكات تشخيص الأخطاء، وأدلة الترميم الاسترجاعية.",
  },
};

// =============================================================================
// 2. THE 5 CANONICAL DOMAINS OF 3AS MATHEMATICS
// =============================================================================

export const MATH_3AS_DOMAINS: Record<string, MathCurriculumDomain> = {
  algebre_arithmetique: {
    id: "algebre_arithmetique",
    title_ar: "الجبر والحساب",
    title_fr: "Algèbre et Arithmétique",
    description_ar: "القسمة الإقليدية في Z، الحساب بالموافقات، نظريات بيزو وغوص، والأعداد الأولية وحل المعادلات الديوفانتية.",
    description_fr: "Divisibilité dans Z, congruences, théorèmes de Bézout et Gauss, nombres premiers et équations diophantiennes.",
    topicIds: ["math_topic_divisibility_congruences", "math_topic_arithmetic_theorems"],
    order: 1,
  },
  nombres_complexes_geometrie: {
    id: "nombres_complexes_geometrie",
    title_ar: "الأعداد المركبة والتحويلات النقطية",
    title_fr: "Nombres Complexes et Transformations Planes",
    description_ar: "الشكل الجبري، المثلثي، الأسي، الجذور النونية، وحل المعادلات في C، والتشابه المباشر في المستوي المركب.",
    description_fr: "Formes algébrique, trigonométrique et exponentielle, équations dans C, et similitudes planes directes.",
    topicIds: ["math_topic_complex_algebra", "math_topic_similitudes_directes"],
    order: 2,
  },
  analyse: {
    id: "analyse",
    title_ar: "التحليل الرياضي",
    title_fr: "Analyse Mathématique",
    description_ar: "الاستمرارية والاشتقاقية الصارمة، الدوال الأسية واللوغاريتمية، الدوال الأصلية والتكامل، والمعادلات التفاضلية والمتتاليات.",
    description_fr: "Continuité et dérivabilité rigoureuses, exponentielle, logarithme, primitives, calcul intégral, équations différentielles et suites.",
    topicIds: [
      "math_topic_continuity_derivatives",
      "math_topic_exp_log_croissances",
      "math_topic_integration_primitives",
      "math_topic_differential_equations",
      "math_topic_sequences_convergence",
    ],
    order: 3,
  },
  geometrie_espace: {
    id: "geometrie_espace",
    title_ar: "الهندسة في الفضاء",
    title_fr: "Géométrie dans l'Espace",
    description_ar: "الجداء السلمي، التمثيلات الوسيطية للمستقيمات، المعادلات الديكارتية للمستويات، والأوضاع النسبية والمسافات.",
    description_fr: "Produit scalaire dans l'espace, équations de plans, représentations paramétriques et calcul des distances.",
    topicIds: ["math_topic_space_geometry"],
    order: 4,
  },
  probabilites_denombrement: {
    id: "probabilites_denombrement",
    title_ar: "الاحتمالات والتحليل التوفيقي",
    title_fr: "Probabilités et Dénombrement",
    description_ar: "التحليل التوفيقي، الاحتمال الشرطي، شجرة الاحتمالات، المتغيرات العشوائية، وقانون برنولي وقانون ثنائي الحد.",
    description_fr: "Dénombrement, probabilités conditionnelles, variables aléatoires et schéma de Bernoulli.",
    topicIds: ["math_topic_combinatorics_bernoulli"],
    order: 5,
  },
};

// =============================================================================
// 3. THE 11 CORE TOPICS OF 3AS MATHEMATICS
// =============================================================================

export const MATH_3AS_TOPICS: Record<string, MathCurriculumTopic> = {
  math_topic_divisibility_congruences: {
    id: "math_topic_divisibility_congruences",
    domainId: "algebre_arithmetique",
    title_ar: "القسمة الإقليدية والموافقات في Z",
    title_fr: "Divisibilité et congruences dans Z",
    description_ar: "الخواص الجبرية للقسمة الإقليدية، دراسة بواقي القسمة الدورية لقوى الأعداد الطبيعية وحساب البواقي.",
    description_fr: "Division euclidienne, propriétés des congruences et périodicité des restes des puissances.",
    skillIds: ["math_m_arithmetic_congruence"],
    order: 1,
    isSpecificToMathStream: true,
  },
  math_topic_arithmetic_theorems: {
    id: "math_topic_arithmetic_theorems",
    domainId: "algebre_arithmetique",
    title_ar: "مبرهنتا بيزو وغوص والمعادلات الديوفانتية",
    title_fr: "Théorèmes de Bézout et Gauss et équations diophantiennes",
    description_ar: "مبرهنة بيزو، مبرهنة غوص، التحليل إلى جداء عوامل أولية، وحل المعادلات من الشكل ax + by = c في Z².",
    description_fr: "Théorème de Bézout, théorème de Gauss, nombres premiers entre eux et résolution d'équations diophantiennes.",
    skillIds: ["math_m_bezout_diophantine", "math_m_gauss_prime_factors"],
    order: 2,
    isSpecificToMathStream: true,
  },
  math_topic_complex_algebra: {
    id: "math_topic_complex_algebra",
    domainId: "nombres_complexes_geometrie",
    title_ar: "الأعداد المركبة والأشكال المثلثية والأسية",
    title_fr: "Nombres complexes, formes trigonométrique et exponentielle",
    description_ar: "الشكل الأسي، دستور دو موافر، خواص العمدة، وحل المعادلات من الدرجة الثانية في مجموعة الأعداد المركبة C.",
    description_fr: "Forme exponentielle, formule de Moivre, arguments et résolution des équations quadratiques dans C.",
    skillIds: ["math_m_complex_algebraic_trig", "math_m_roots_of_unity", "math_m_complex_argument_loci"],
    order: 3,
    isSpecificToMathStream: false,
  },
  math_topic_similitudes_directes: {
    id: "math_topic_similitudes_directes",
    domainId: "nombres_complexes_geometrie",
    title_ar: "التحويلات النقطية والتشابه المباشر",
    title_fr: "Similitudes planes directes",
    description_ar: "الكتابة المركبة z' = az + b للتشابه المباشر، وتعيين عناصره الهندسية المميزة: المركز، النسبة، والزاوية.",
    description_fr: "Écriture complexe z' = az + b, rapport, angle et centre d'une similitude plane directe.",
    skillIds: ["math_m_similitudes_directes"],
    order: 4,
    isSpecificToMathStream: true,
  },
  math_topic_continuity_derivatives: {
    id: "math_topic_continuity_derivatives",
    domainId: "analyse",
    title_ar: "الاستمرارية والاشتقاقية ومبرهنة القيم المتوسطة",
    title_fr: "Continuité, dérivabilité et TVI",
    description_ar: "الاستمرارية عند نقطة وعلى مجال، مبرهنة القيم المتوسطة بالبرهان الصارم للوجود والوحدانية، والتقعر ونقاط الانعطاف.",
    description_fr: "Continuité, dérivabilité, application rigoureuse du TVI, convexité et points d'inflexion.",
    skillIds: ["math_m_derivatives_tvi_rigor", "math_m_function_study", "math_m_bounded_functions"],
    order: 5,
    isSpecificToMathStream: false,
  },
  math_topic_exp_log_croissances: {
    id: "math_topic_exp_log_croissances",
    domainId: "analyse",
    title_ar: "الدوال الأسية واللوغاريتمية والتزايد المقارن",
    title_fr: "Exponentielle, logarithme et croissances comparées",
    description_ar: "دراسة الدوال الأسية واللوغاريتمية المركبة، نهايات التزايد المقارن، والمستقيمات المقاربة الأفقية والعمودية والمائلة.",
    description_fr: "Fonctions exponentielles et logarithmiques, limites de référence, croissances comparées et asymptotes.",
    skillIds: ["math_m_exp_log_croissances", "math_m_logarithmic_differentiation"],
    order: 6,
    isSpecificToMathStream: false,
  },
  math_topic_integration_primitives: {
    id: "math_topic_integration_primitives",
    domainId: "analyse",
    title_ar: "الدوال الأصلية والحساب التكاملي",
    title_fr: "Primitives, calcul intégral et calcul d'aires",
    description_ar: "تعيين الدوال الأصلية، المكاملة بالتجزئة، خواص التكامل (الخطية وعلاقة شال)، وحساب المساحات والحصر.",
    description_fr: "Recherche de primitives, intégration par parties, relation de Chasles, calcul d'aires et encadrement.",
    skillIds: ["math_m_integration_parts"],
    order: 7,
    isSpecificToMathStream: false,
  },
  math_topic_differential_equations: {
    id: "math_topic_differential_equations",
    domainId: "analyse",
    title_ar: "المعادلات التفاضلية الخطية",
    title_fr: "Équations différentielles linéaires",
    description_ar: "حل المعادلات التفاضلية من الرتبة الأولى y' = ay + b والرتبة الثانية y'' + ω²y = 0 وتعيين الحلول الخاصة المستوفية للشروط الابتدائية.",
    description_fr: "Résolution des équations différentielles y' = ay + b et y'' + w²y = 0 avec conditions initiales.",
    skillIds: ["math_m_differential_equations"],
    order: 8,
    isSpecificToMathStream: false,
  },
  math_topic_sequences_convergence: {
    id: "math_topic_sequences_convergence",
    domainId: "analyse",
    title_ar: "المتتاليات العددية والمتتاليات المتجاورة",
    title_fr: "Suites numériques, récurrence et suites adjacentes",
    description_ar: "الاستدلال بالتراجع الصارم، المتتاليات التراجعية u_(n+1) = f(u_n)، مبرهنة المتتاليات المتجاورة والتقارب بالرتابة.",
    description_fr: "Raisonnement par récurrence, suites récurrentes u_(n+1) = f(u_n), suites adjacentes et convergence.",
    skillIds: ["math_m_induction_adjacent_suites", "math_m_sequences_comparison_limits", "math_m_geometric_sequences"],
    order: 9,
    isSpecificToMathStream: false,
  },
  math_topic_space_geometry: {
    id: "math_topic_space_geometry",
    domainId: "geometrie_espace",
    title_ar: "الهندسة في الفضاء والمعادلات الديكارتية",
    title_fr: "Géométrie dans l'espace et produit scalaire",
    description_ar: "الجداء السلمي في الفضاء، المعادلة الديكارتية لمستو، التمثيل الوسيطي لمستقيم، المسافة من نقطة إلى مستو، والتقاطع.",
    description_fr: "Produit scalaire dans l'espace, représentations paramétriques, équations cartésiennes et calcul de distance.",
    skillIds: ["math_m_space_geometry_planes"],
    order: 10,
    isSpecificToMathStream: false,
  },
  math_topic_combinatorics_bernoulli: {
    id: "math_topic_combinatorics_bernoulli",
    domainId: "probabilites_denombrement",
    title_ar: "التحليل التوفيقي وقانون ثنائي الحد",
    title_fr: "Dénombrement et loi binomiale",
    description_ar: "التبديلات والترتيبات والتوفيقات، قانون الاحتمال للمتغير العشوائي، ومخطط برنولي وقانون ثنائي الحد B(n, p).",
    description_fr: "Analyse combinatoire (permutations, arrangements, combinaisons), schéma de Bernoulli et loi binomiale.",
    skillIds: ["math_m_combinatorics_bernoulli", "math_m_conditional_probability_trees", "math_m_total_probability"],
    order: 11,
    isSpecificToMathStream: false,
  },
};

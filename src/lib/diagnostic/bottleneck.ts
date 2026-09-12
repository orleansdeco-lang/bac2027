import {
  DiagnosticBottleneck,
  DiagnosticDimension,
  FirstMissionRecommendation,
  MisconceptionTrapFinding,
  SubjectDiagnosticScore,
} from "../../types/diagnostic";
import { SubjectId } from "../../types/education";

const SUBJECT_NAMES: Record<SubjectId, { ar: string; fr: string }> = {
  math: { ar: "الرياضيات", fr: "Mathématiques" },
  physics: { ar: "العلوم الفيزيائية", fr: "Physique-Chimie" },
  natural_sciences: { ar: "علوم الطبيعة والحياة", fr: "Sciences Naturelles" },
  arabic: { ar: "اللغة العربية", fr: "Langue Arabe" },
  philosophy: { ar: "الفلسفة", fr: "Philosophie" },
  french: { ar: "اللغة الفرنسية", fr: "Français" },
  english: { ar: "اللغة الإنجليزية", fr: "Anglais" },
  islamic_studies: { ar: "العلوم الإسلامية", fr: "Sciences Islamiques" },
  history_geography: { ar: "التاريخ والجغرافيا", fr: "Histoire-Géo" },
  accounting_finance: { ar: "المحاسبة والمالية", fr: "Comptabilité & Finance" },
  economics_management: { ar: "الاقتصاد والمناجمنت", fr: "Économie & Management" },
  law: { ar: "القانون", fr: "Droit" },
  mechanical_eng: { ar: "الهندسة الميكانيكية", fr: "Génie Mécanique" },
  civil_eng: { ar: "الهندسة المدنية", fr: "Génie Civil" },
  electrical_eng: { ar: "الهندسة الكهربائية", fr: "Génie Électrique" },
  process_eng: { ar: "هندسة الطرائق", fr: "Génie des Procédés" },
  third_language: { ar: "اللغة الأجنبية الثالثة", fr: "3ème Langue" },
};

const DIMENSION_NAMES: Record<DiagnosticDimension, { ar: string; fr: string }> = {
  knowledge: { ar: "استرجاع المعارف الأساسية", fr: "Restitution des connaissances" },
  understanding: { ar: "الفهم والتعليل المفاهيمي", fr: "Compréhension conceptuelle" },
  application: { ar: "التطبيق والحساب العددي", fr: "Application et calcul" },
  methodology: { ar: "المنهجية المعتمدة وصياغة الإجابة", fr: "Méthodologie et rédaction conforme" },
  speed: { ar: "إدارة الوقت والسرعة", fr: "Gestion du temps" },
  confidence: { ar: "معايرة اليقين وتجنب التسرع", fr: "Calibration de la certitude" },
};

/**
 * Evaluates empirical diagnostic data to identify primary and secondary academic bottlenecks
 */
export function detectEmpiricalBottlenecks(
  subjectScores: Partial<Record<SubjectId, SubjectDiagnosticScore>>,
  dimensionScores: Record<DiagnosticDimension, number>,
  misconceptions: MisconceptionTrapFinding[]
): {
  primaryBottleneck: DiagnosticBottleneck;
  secondaryBottlenecks: DiagnosticBottleneck[];
} {
  const scores = Object.values(subjectScores).filter(Boolean) as SubjectDiagnosticScore[];

  if (scores.length === 0) {
    const fallback: DiagnosticBottleneck = {
      subjectId: "math",
      dimension: "methodology",
      severity: "moderate",
      observedScore: 50,
      title_ar: "المنهجية العامة في المواد العلمية",
      title_fr: "Méthodologie générale des matières scientifiques",
      rationale_ar: "نقطة انطلاق عامة لتثبيت منهجية الإجابة المعتمدة في مواضيع البكالوريا.",
      rationale_fr: "Point de départ général pour consolider la méthodologie de référence au BAC.",
    };
    return { primaryBottleneck: fallback, secondaryBottlenecks: [] };
  }

  // Calculate subject vulnerability index:
  // Vulnerability = (100 - accuracy) * coefficient + (highConfidenceWrongCount * 25)
  const rankedSubjects = scores
    .map((s) => {
      const subjectMisconceptions = misconceptions.filter((m) => m.subjectId === s.subjectId).length;
      const vulnerabilityScore =
        (100 - s.accuracyPercentage) * s.coefficient + (subjectMisconceptions * 20);

      // Find the weakest dimension within this subject
      let weakestDim: DiagnosticDimension = "methodology";
      let lowestDimScore = 101;

      const testableDims: DiagnosticDimension[] = ["knowledge", "understanding", "application", "methodology"];
      for (const dim of testableDims) {
        const score = s.dimensionBreakdown[dim];
        if (score !== undefined && score < lowestDimScore) {
          lowestDimScore = score;
          weakestDim = dim;
        }
      }

      return {
        subjectScore: s,
        vulnerabilityScore,
        weakestDim,
        lowestDimScore: lowestDimScore === 101 ? s.accuracyPercentage : lowestDimScore,
      };
    })
    .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);

  const primaryCandidate = rankedSubjects[0];
  const subjName = SUBJECT_NAMES[primaryCandidate.subjectScore.subjectId] || {
    ar: primaryCandidate.subjectScore.subjectId,
    fr: primaryCandidate.subjectScore.subjectId,
  };
  const dimName = DIMENSION_NAMES[primaryCandidate.weakestDim];

  const severity =
    primaryCandidate.subjectScore.accuracyPercentage < 40 ||
    primaryCandidate.subjectScore.highConfidenceWrongCount >= 2
      ? "critical"
      : primaryCandidate.subjectScore.accuracyPercentage < 60
      ? "high"
      : "moderate";

  const primaryBottleneck: DiagnosticBottleneck = {
    subjectId: primaryCandidate.subjectScore.subjectId,
    dimension: primaryCandidate.weakestDim,
    severity,
    observedScore: primaryCandidate.subjectScore.accuracyPercentage,
    title_ar: `${subjName.ar}: ${dimName.ar}`,
    title_fr: `${subjName.fr} : ${dimName.fr}`,
    rationale_ar: `أظهرت العينة التشخيصية الأولية إشارة دقة ${primaryCandidate.subjectScore.accuracyPercentage}% في مادة ${subjName.ar} (معامل مرحلي ${primaryCandidate.subjectScore.coefficient}) مع تركز الفجوة في بعد [${dimName.ar}]. هذا هو أول عائق مرشح للعمل عليه لكسر حاجز البداية.`,
    rationale_fr: `Le diagnostic initial montre un signal de ${primaryCandidate.subjectScore.accuracyPercentage}% en ${subjName.fr} (coeff provisoire ${primaryCandidate.subjectScore.coefficient}) avec vulnérabilité sur [${dimName.fr}]. C'est le premier verrou candidat identifié.`,
    isPreliminary: true,
  };

  const secondaryBottlenecks: DiagnosticBottleneck[] = rankedSubjects.slice(1).map((item) => {
    const sName = SUBJECT_NAMES[item.subjectScore.subjectId] || {
      ar: item.subjectScore.subjectId,
      fr: item.subjectScore.subjectId,
    };
    const dName = DIMENSION_NAMES[item.weakestDim];
    const sSeverity =
      item.subjectScore.accuracyPercentage < 50 ? "high" : "moderate";

    return {
      subjectId: item.subjectScore.subjectId,
      dimension: item.weakestDim,
      severity: sSeverity,
      observedScore: item.subjectScore.accuracyPercentage,
      title_ar: `${sName.ar}: ${dName.ar}`,
      title_fr: `${sName.fr} : ${dName.fr}`,
      rationale_ar: `إشارة دقة ${item.subjectScore.accuracyPercentage}% بمعامل مرحلي ${item.subjectScore.coefficient}. عائق ثانوي مرشح للمتابعة اللاحقة.`,
      rationale_fr: `Signal de ${item.subjectScore.accuracyPercentage}% (coeff provisoire ${item.subjectScore.coefficient}). Verrou secondaire à suivre.`,
      isPreliminary: true,
    };
  });

  return { primaryBottleneck, secondaryBottlenecks };
}

/**
 * Generates the deterministic first recommended micro-mission based on the primary bottleneck
 */
export function generateFirstMission(
  bottleneck: DiagnosticBottleneck,
  misconceptions: MisconceptionTrapFinding[]
): FirstMissionRecommendation {
  const subj = SUBJECT_NAMES[bottleneck.subjectId]?.ar || bottleneck.subjectId;
  const relatedTrap = misconceptions.find((m) => m.subjectId === bottleneck.subjectId);

  if (bottleneck.subjectId === "math") {
    return {
      id: "mission-math-repair-01",
      title_ar: "مهمة ترميم: إتقان اشتقاق الدوال المركبة والتحكم في مبرهنة القيم المتوسطة",
      title_fr: "Mission de réparation : Dérivation des composées et TVI",
      subjectId: "math",
      dimension: bottleneck.dimension,
      focusTopic_ar: "الدوال الأسية واللوغارتمية — الشروط الصارمة للوحدانية",
      focusTopic_fr: "Fonctions exponentielles et TVI — Rigueur d'unicité",
      estimatedMinutes: 30,
      actionSteps_ar: [
        "مراجعة قاعدة اشتقاق الدالة المركبة (e^u)' = u' e^u وتدوين 3 أمثلة في دفتر الأخطاء.",
        "التدرب على صياغة شرط الرتابة التامة في مبرهنة القيم المتوسطة بدقة منهجية.",
        "حل تمرينين نموذجيين من بكالوريا 2021-2023 في دراسة إشارة الدالة المساعدة.",
      ],
      actionSteps_fr: [
        "Réviser la règle de dérivation (e^u)' = u' e^u et noter 3 cas types dans le carnet d'erreurs.",
        "S'entraîner à rédiger la condition de stricte monotonie du TVI avec rigueur méthodologique.",
        "Résoudre 2 exercices types de BAC sur l'étude du signe d'une fonction auxiliaire.",
      ],
    };
  }

  if (bottleneck.subjectId === "physics") {
    return {
      id: "mission-phys-repair-01",
      title_ar: "مهمة ترميم: إتقان الإسقاطات في الميكانيك والتحليل البعدي في الكهرباء",
      title_fr: "Mission de réparation : Projections en mécanique et analyse dimensionnelle RC",
      subjectId: "physics",
      dimension: bottleneck.dimension,
      focusTopic_ar: "القانون الثاني لنيوتن + زمن نصف التفاعل ونصف العمر",
      focusTopic_fr: "2ème loi de Newton + Temps de demi-réaction et de demi-vie",
      estimatedMinutes: 35,
      actionSteps_ar: [
        "إعادة رسم مخطط القوى على المستوي المائل وتأكيد قاعدة إسقاط الثقل (P_x = mg sin α).",
        "تثبيت برهان التحليل البعدي لثابت الزمن [τ] = [RC] = T خطوة بخطوة.",
        "حل مسألة بكالوريا سابقة تجمع بين المتابعة الزمنية وطريقة المماسات المتوازية.",
      ],
      actionSteps_fr: [
        "Refaire le bilan des forces sur plan incliné et vérifier la projection P_x = mg sin α.",
        "Consolider l'analyse dimensionnelle de tau [RC] = T étape par étape.",
        "Résoudre un sujet de BAC combinant cinétique et méthode des tangentes.",
      ],
    };
  }

  if (bottleneck.subjectId === "natural_sciences") {
    return {
      id: "mission-snv-repair-01",
      title_ar: "مهمة ترميم: شبكة الاستدلال العلمي واستغلال الوثائق التجريبية",
      title_fr: "Mission de réparation : Démarche d'exploitation des documents en SVT",
      subjectId: "natural_sciences",
      dimension: "methodology",
      focusTopic_ar: "هيكلة إجابة الاستدلال العلمي (تقديم، تحليل مقارن، استنتاج، تركيب)",
      focusTopic_fr: "Structure du raisonnement scientifique (présentation, analyse, déduction, synthèse)",
      estimatedMinutes: 30,
      actionSteps_ar: [
        "حفظ وتطبيق القالب المنهجي الرباعي لاستغلال الوثائق في التمرين الثاني والثالث.",
        "التدرب على التمييز الدقيق بين دور الجسم المضاد (تعديل المستضد) والبلعمة.",
        "حل تمرين استدلال علمي من بكالوريا حديثة مع مقارنة إجابتك بالتصحيح النموذجي.",
      ],
      actionSteps_fr: [
        "Appliquer le canevas officiel d'exploitation documentaire (présentation, analyse, déduction).",
        "Distinguer le rôle des anticorps (neutralisation) de la phagocytose.",
        "Résoudre un exercice de raisonnement scientifique de BAC avec corrigé-type.",
      ],
    };
  }

  // Fallback general mission
  return {
    id: "mission-general-repair-01",
    title_ar: `مهمة ترميم عاجلة: ${subj}`,
    title_fr: `Mission de remédiation : ${subj}`,
    subjectId: bottleneck.subjectId,
    dimension: bottleneck.dimension,
    focusTopic_ar: "تثبيت المفاهيم الأساسية وحل التمارين المنهجية",
    focusTopic_fr: "Consolidation des fondamentaux et exercices méthodologiques",
    estimatedMinutes: 30,
    actionSteps_ar: [
      "مراجعة النقاط الضعيفة التي حددها التشخيص في كراس خاص.",
      "حل 3 أسئلة بكالوريا سابقة تركز على البعد المنهجي المستهدف.",
      "إجراء إعادة اختبار سريع للتحقق من زوال الفجوة.",
    ],
    actionSteps_fr: [
      "Revoir les points faibles identifiés par le diagnostic.",
      "Résoudre 3 questions de BAC ciblées sur la méthodologie.",
      "Faire un test de vérification.",
    ],
  };
}

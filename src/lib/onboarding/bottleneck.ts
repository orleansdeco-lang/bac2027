import { InitialGapResult, StrategicBottleneck, StrategicBottleneckAnalysis, StrategicProfile } from "../../types/onboarding";
import { ALL_SUBJECTS } from "../constants/streams";

/**
 * Detects the initial primary and secondary bottlenecks for a student.
 * Synthesizes academic gaps (coefficients x self-ratings) with behavioral obstacles.
 */
export function detectStrategicBottleneck(
  profile: StrategicProfile,
  gapResult: InitialGapResult
): StrategicBottleneckAnalysis {
  const secondaryBottlenecks: StrategicBottleneck[] = [];

  // 1. Identify highest academic gap subject
  const topSubjectGap = gapResult.subjectGaps[0];
  const topSubjectMeta = topSubjectGap ? ALL_SUBJECTS[topSubjectGap.subjectId] : null;

  let academicBottleneck: StrategicBottleneck | null = null;
  if (topSubjectGap && topSubjectMeta) {
    const isAcute = topSubjectGap.selfRatedLevel <= 2; // Rating 1 or 2
    academicBottleneck = {
      category: "subject_academic",
      targetSubjectId: topSubjectGap.subjectId,
      title_ar: `${topSubjectMeta.name_ar} — فجوة المعامل والتقدير`,
      title_fr: `${topSubjectMeta.name_fr} — Écart coefficient et niveau`,
      explanation_ar: isAcute
        ? `مستواك التقديري في ${topSubjectMeta.name_ar} (ضعيف) يشكل أكبر عائق للوصول إلى معدل ${profile.targetScore}، نظراً لمعاملها العالي (${topSubjectGap.coefficient}). رفع هذه المادة يعطيك أعلى قفزة في المعدل.`
        : `تمثل ${topSubjectMeta.name_ar} الفرصة الكبرى لتقليص المسافة نحو هدفك (${profile.targetScore}). التركيز عليها يضمن أكبر مردودية للوقت المستثمر.`,
      explanation_fr: isAcute
        ? `Votre estimation en ${topSubjectMeta.name_fr} représente le principal obstacle pour atteindre ${profile.targetScore}, vu son coefficient élevé (${topSubjectGap.coefficient}).`
        : `${topSubjectMeta.name_fr} offre le plus fort levier pour combler l'écart vers votre objectif (${profile.targetScore}).`,
      recommendedFirstMission_ar: `تشخيص أساسيات مادة ${topSubjectMeta.name_ar} وتحديد مواضيع الثغرات الأولى`,
      recommendedFirstMission_fr: `Diagnostic des fondamentaux en ${topSubjectMeta.name_fr} pour identifier les premiers points de blocage`,
    };
  }

  // 2. Identify behavioral / methodological bottlenecks from obstacles and time
  const obstacles = profile.obstacles || [];
  const hasTimeDeficit = profile.availableTime === "less_than_5" || profile.availableTime === "not_sure";
  const highTarget = profile.targetScore >= 14;

  let behavioralBottleneck: StrategicBottleneck | null = null;

  if (hasTimeDeficit && highTarget) {
    behavioralBottleneck = {
      category: "time_management",
      title_ar: "إدارة الوقت والانتظام الأسبوعي",
      title_fr: "Gestion du temps et régularité hebdomadaire",
      explanation_ar: `هدفك (${profile.targetScore}/20) طموح ويحتاج مساراً واضحاً. وقت الدراسة المتاح حالياً يحتاج إعادة ضبط لبناء وتيرة مستقرة دون إجهاد.`,
      explanation_fr: `Votre objectif (${profile.targetScore}/20) nécessite un rythme d'étude stable pour éviter l'épuisement.`,
      recommendedFirstMission_ar: "تحديد جدول أسبوعي واقعي يبدأ بـ 60 دقيقة يومياً دون تراكم",
      recommendedFirstMission_fr: "Établir un planning réaliste démarrant par 60 min quotidiennes",
    };
  } else if (obstacles.includes("understand_but_fail_exercises")) {
    behavioralBottleneck = {
      category: "methodology_application",
      title_ar: "المنهجية وتطبيق التمارين",
      title_fr: "Méthodologie et application aux exercices",
      explanation_ar: "أنت تفهم الدرس، لكن النقاط تضيع في طريقة صياغة الإجابة والتعامل مع فخاخ أسئلة البكالوريا. الحل ليس إعادة قراءة الدروس، بل التدريب المنهجي.",
      explanation_fr: "La théorie est comprise mais les points sont perdus dans la formulation et les pièges d'examen. La priorité est l'entraînement méthodologique.",
      recommendedFirstMission_ar: "تفكيك تمرين بكالوريا نموذجي ومقارنة صياغة الحل مع خطوات الحل المنهجية",
      recommendedFirstMission_fr: "Décortiquer un exercice type BAC et aligner la rédaction sur la méthode rigoureuse",
    };
  } else if (obstacles.includes("start_and_stop") || obstacles.includes("waste_time")) {
    behavioralBottleneck = {
      category: "habit_consistency",
      title_ar: "الاستمرارية وتفكيك التشتت",
      title_fr: "Constance et élimination des interruptions",
      explanation_ar: "أكبر تحدي يواجهك هو التوقف بعد البداية. سنعتمد مبدأ المهام القصيرة (25 دقيقة) لكسر حاجز المماطلة وبناء الزخم التدريجي.",
      explanation_fr: "La difficulté principale est de maintenir l'élan. Le système utilisera des micro-missions de 25 min pour installer la constance.",
      recommendedFirstMission_ar: "تنفيذ مهمة أولى مركزة لمدة 25 دقيقة وإنهائها بالكامل دون انقطاع",
      recommendedFirstMission_fr: "Exécuter une première mission courte de 25 min en restant pleinement concentré",
    };
  } else if (obstacles.includes("memorize_and_forget")) {
    behavioralBottleneck = {
      category: "active_recall_retention",
      title_ar: "طريقة الحفظ وتثبيت المعلومات",
      title_fr: "Méthode de mémorisation et rappel actif",
      explanation_ar: "الحفظ التقليدي بالتكرار يتبخر بسرعة. سنعتمد بروتوكول الاسترجاع النشط (Active Recall) والمراجعة المتباعدة لضمان بقاء المعلومات يوم الامتحان.",
      explanation_fr: "La mémorisation passive s'efface vite. L'adoption du rappel actif et de la répétition espacée garantira la rétention.",
      recommendedFirstMission_ar: "تطبيق بروتوكول الاسترجاع النشط (افهم -> اغلق -> استرجع) على مفهوم محدد",
      recommendedFirstMission_fr: "Appliquer le protocole de rappel actif sur un concept clé",
    };
  } else if (obstacles.includes("big_backlog")) {
    behavioralBottleneck = {
      category: "backlog_overwhelm",
      title_ar: "معالجة التراكم وتصفية الأولويات",
      title_fr: "Traitement des retards et priorisation",
      explanation_ar: "التراكم يسبب شعوراً بالعجز. سنقوم بتصفية المتأخرات إلى أولويات قصوى ومواضيع ثانوية لبدء التقدم فوراً دون إحباط.",
      explanation_fr: "L'accumulation paralyse l'élan. Nous allons trier le retard par priorité absolue pour redémarrer immédiatement.",
      recommendedFirstMission_ar: "فرز أولويات الفصل الأول والتركيز على مفتاح واحد فقط اليوم",
      recommendedFirstMission_fr: "Prioriser un seul verrou fondamental du premier trimestre dès aujourd'hui",
    };
  }

  // 3. Determine primary vs secondary
  let primaryBottleneck: StrategicBottleneck;

  if (academicBottleneck && topSubjectGap.selfRatedLevel <= 2 && topSubjectGap.coefficient >= 5) {
    // Acute high-coefficient subject weakness takes primary lead
    primaryBottleneck = academicBottleneck;
    if (behavioralBottleneck) {
      secondaryBottlenecks.push(behavioralBottleneck);
    }
    // Add second subject if available
    const secondSubject = gapResult.subjectGaps[1];
    if (secondSubject && secondSubject.weightedGap > 0) {
      const secondMeta = ALL_SUBJECTS[secondSubject.subjectId];
      if (secondMeta) {
        secondaryBottlenecks.push({
          category: "subject_academic",
          targetSubjectId: secondSubject.subjectId,
          title_ar: `${secondMeta.name_ar} (المعامل ${secondSubject.coefficient})`,
          title_fr: `${secondMeta.name_fr} (Coefficient ${secondSubject.coefficient})`,
          explanation_ar: `ثاني أعلى فجوة موزونة في مسارك الأكاديمي.`,
          explanation_fr: `Deuxième écart pondéré le plus significatif.`,
          recommendedFirstMission_ar: `مراجعة المفاهيم التأسيسية لمادة ${secondMeta.name_ar}`,
          recommendedFirstMission_fr: `Révision des concepts clés en ${secondMeta.name_fr}`,
        });
      }
    }
  } else if (behavioralBottleneck) {
    // Behavioral takes primary lead (e.g. method, time, or consistency)
    primaryBottleneck = behavioralBottleneck;
    if (academicBottleneck) {
      secondaryBottlenecks.push(academicBottleneck);
    }
  } else if (academicBottleneck) {
    primaryBottleneck = academicBottleneck;
  } else {
    // Fallback safe bottleneck
    primaryBottleneck = {
      category: "methodology_application",
      title_ar: "الانتقال من الفهم النظري إلى حل البكالوريا",
      title_fr: "Passage de la théorie à la résolution type BAC",
      explanation_ar: "مستواك العام متوازن. التحدي الأساسي الآن هو رفع الدقة والسرعة في التمارين ذات المعاملات المرتفعة.",
      explanation_fr: "Votre niveau est équilibré. L'enjeu est désormais la précision et la vitesse sur les matières clés.",
      recommendedFirstMission_ar: "إجراء تشخيص أولي لمعرفة نمط الأخطاء في المواد الأساسية",
      recommendedFirstMission_fr: "Lancer le premier diagnostic pour cartographier les types d'erreurs",
    };
  }

  return {
    primaryBottleneck,
    secondaryBottlenecks,
  };
}

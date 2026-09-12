/**
 * BAC Mastery — Mind, Rest & Recovery Service
 * Prompt 25: Pedagogical load adaptation and guilt-free catchup mechanism.
 * 
 * Invariants:
 * - Purely pedagogical: Zero medical or psychological claims.
 * - Rest is an explicit part of the roadmap, not a failure.
 * - Recovery Mode eliminates shame and reconstructs a realistic sequence.
 */

import { WellbeingState, WellbeingCheckin, RestRecommendation, RecoveryPlan } from "@/types/mind-rest";
import { Mission } from "@/types/mission";

export interface LoadAdjustment {
  recommendedDailyMinutes: number;
  maxMissionsPerDay: number;
  priorityFocus: "repair_only" | "light_practice" | "standard_progression" | "intensive_sprint";
  rationale_ar: string;
  rationale_fr: string;
}

export const WellbeingService = {
  /**
   * Determine load adjustment based on student wellbeing self-report
   */
  getLoadAdjustment(state: WellbeingState): LoadAdjustment {
    switch (state) {
      case "tired":
        return {
          recommendedDailyMinutes: 20,
          maxMissionsPerDay: 1,
          priorityFocus: "repair_only",
          rationale_ar: "نظراً لشعورك بالإرهاق، قلّصنا وتيرة العمل إلى تدريب خفيف مدته 20 دقيقة يركز على تثبيت مهارة سابقة بدل إرهاق الذاكرة بمفاهيم جديدة.",
          rationale_fr: "Compte tenu de votre fatigue, la charge est ajustée à 20 minutes ciblées sur la révision et la consolidation, sans surcharge cognitive.",
        };
      case "stressed":
        return {
          recommendedDailyMinutes: 15,
          maxMissionsPerDay: 1,
          priorityFocus: "light_practice",
          rationale_ar: "الضغط الدراسي علامة على الرغبة في النجاح. خذ نفساً عميقاً؛ خطة اليوم خفيفة جداً لتثبيت الثقة بخطوات صغيرة وملموسة.",
          rationale_fr: "Le stress est naturel. Nous réduisons la pression avec une courte session de rappel pour reprendre confiance pas à pas.",
        };
      case "good":
        return {
          recommendedDailyMinutes: 60,
          maxMissionsPerDay: 3,
          priorityFocus: "intensive_sprint",
          rationale_ar: "طاقتك ممتازة اليوم! استغل هذا الزخم لإنجاز مهمة في مادتك العائق والتقدم في المسار.",
          rationale_fr: "Excellente énergie ! Profitez de cette dynamique pour aborder une compétence clé dans votre matière prioritaire.",
        };
      case "normal":
      default:
        return {
          recommendedDailyMinutes: 45,
          maxMissionsPerDay: 2,
          priorityFocus: "standard_progression",
          rationale_ar: "وتيرة دراسية قياسية متوازنة بين التعلم والممارسة والاسترجاع.",
          rationale_fr: "Rythme de travail équilibré conforme à votre feuille de route.",
        };
    }
  },

  /**
   * Get rest and pacing recommendation
   */
  getRestRecommendation(state: WellbeingState, consecutiveStudyMinutes: number): RestRecommendation {
    if (consecutiveStudyMinutes >= 90) {
      return {
        type: "micro_break",
        durationMinutes: 15,
        reason_ar: "تجاوزت 90 دقيقة من التركيز المتواصل. أرح عينيك وابتعد عن الشاشة لمدة 15 دقيقة لتثبيت المعلومات في الذاكرة طويلة المدى.",
        reason_fr: "Plus de 90 minutes de travail continu : une pause de 15 minutes sans écran est essentielle pour la consolidation mnésique.",
      };
    }

    if (state === "tired") {
      return {
        type: "sleep_priority",
        durationMinutes: 480, // 8 hours
        reason_ar: "النوم الكافي هو المرحلة التي يقوم فيها الدماغ بتثبيت القوانين والبراهين الرياضية. أعطِ الأولوية للراحة الليلة.",
        reason_fr: "Le sommeil est la phase clé de consolidation des apprentissages scientifiques. Priorisez une nuit réparatrice.",
      };
    }

    return {
      type: "micro_break",
      durationMinutes: 5,
      reason_ar: "استراحة قصيرة مدتها 5 دقائق بين التمارين تجدد النشاط الذهني.",
      reason_fr: "Courte pause de 5 minutes pour maintenir une vigilance optimale.",
    };
  },

  /**
   * Build a guilt-free Recovery Plan when a student misses study days
   */
  buildRecoveryPlan(studentId: string, missedMissions: Mission[]): RecoveryPlan {
    const p1: string[] = [];
    const p2: string[] = [];
    const optional: string[] = [];

    missedMissions.forEach((m) => {
      if (m.source === "diagnostic_bottleneck" || m.status === "needs_more_work" || m.status === "repair_needed") {
        p1.push(m.id);
      } else if (m.priority === "high") {
        p2.push(m.id);
      } else {
        optional.push(m.id);
      }
    });

    return {
      studentId,
      missedMissionsCount: missedMissions.length,
      priority1MissionIds: p1,
      priority2MissionIds: p2,
      optionalMissionIds: optional,
      restartedAt: new Date().toISOString(),
      encouragement_ar: "الانقطاع المؤقت جزء طبيعي من التحضير للبكالوريا. لا داعي لمحاولة تعويض كل شيء في يوم واحد. لقد أعدنا ترتيب أولوياتك لنبدأ فقط بالأهم.",
      encouragement_fr: "Les interruptions arrivent. Inutile de tout rattraper d'un coup : nous avons restructuré vos priorités pour reprendre sereinement par l'essentiel.",
    };
  },
};

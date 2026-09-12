/**
 * BAC Mastery - Dashboard Application Service
 * Coordinates student home state, answering:
 * 1. Where am I? (Road position)
 * 2. What should I do now? (Today's Mission)
 * 3. Why should I do it? (Evidence-based explanation)
 * 4. What happens after I finish?
 * 5. Real progress metrics (Zero vanity metrics)
 */

import { StudentRepository } from "@/lib/repositories/student-repository";
import { DiagnosticRepository } from "@/lib/repositories/diagnostic-repository";
import { MissionRepository } from "@/lib/repositories/mission-repository";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { MasteryRepository } from "@/lib/repositories/mastery-repository";
import { getNextBestMission } from "@/lib/roadmap/engine";
import { AdaptiveRoadmapInput, MissionRationale } from "@/types/roadmap";
import { Mission } from "@/types/mission";
import { StrategicProfile } from "@/types/onboarding";
import { DiagnosticAnalysisResult } from "@/types/diagnostic";

export interface StudentDashboardData {
  profile: StrategicProfile | null;
  diagnosticResult: DiagnosticAnalysisResult | null;
  hasCompletedDiagnostic: boolean;
  todaysMission: {
    mission: Mission | null;
    rationale: MissionRationale | null;
    skillTitle_ar: string;
    skillTitle_fr: string;
    subjectId: string;
    estimatedMinutes: number;
    whyText_ar: string;
    whyText_fr: string;
  } | null;
  roadPosition: {
    goal: number;
    hasDiagnostic: boolean;
    hasGaps: boolean;
    hasActiveMission: boolean;
    demonstratedCount: number;
  };
  progressMetrics: {
    demonstratedSkillsCount: number;
    emergingSkillsCount: number;
    completedMissionsCount: number;
    activeRepairsCount: number;
  };
}

export const DashboardService = {
  async getDashboardData(userId?: string): Promise<StudentDashboardData> {
    const [profile, diagResult, missions, errors, mastery] = await Promise.all([
      StudentRepository.getProfile(userId),
      DiagnosticRepository.getResults(userId),
      MissionRepository.getMissions(userId),
      ErrorRepository.getErrors(userId),
      MasteryRepository.getMasteryRecords(userId),
    ]);

    const errorList = Object.values(errors);
    const missionList = Object.values(missions);
    const masteryList = Object.values(mastery);

    const input: AdaptiveRoadmapInput = {
      onboardingProfile: profile,
      diagnosticResult: diagResult,
      missions: missions,
      masteryEvidence: mastery,
      errors: errorList,
      energyState: profile?.studyEnergy,
    };

    const nextBest = getNextBestMission(input);

    // Build evidence-based "Why" explanation in natural Algerian Arabic & French
    let whyAr = "هذه المهمة تمثل خطوتك التالية الأساسية لبناء مهاراتك وفق المنهاج.";
    let whyFr = "Cette mission constitue votre prochaine étape clé selon le programme.";

    if (nextBest.rationale) {
      switch (nextBest.rationale.reasonCode) {
        case "continuation_repair":
          whyAr = "لأن الممارسة الأخيرة سجلت خطأ في هذي المهارة. نصلحوه اليوم باش ما يتعاودش في البكالوريا.";
          whyFr = "Une erreur a été identifiée lors de votre dernière pratique. Nous la réparons aujourd'hui pour sécuriser vos points au BAC.";
          break;
        case "continuation_retest":
          whyAr = "أكملت مراجعة الخطأ بنجاح. الآن وقت الاختبار المشابه للتأكد من تثبيت المهارة نهائياً.";
          whyFr = "Vous avez terminé votre réparation. C'est le moment du retest jumeau pour valider votre maîtrise.";
          break;
        case "recurring_error_cause":
          whyAr = "هذا الخطأ تكرر أكثر من مرة، ويعتبر نقطة اختناق مستعجلة تتطلب معالجة جذرية الآن.";
          whyFr = "Cette erreur s'est répétée plusieurs fois : elle constitue un goulot d'étranglement urgent à résoudre.";
          break;
        case "diagnostic_bottleneck":
        case "weakest_supported_dimension":
          whyAr = "أظهر التشخيص نقطة ضعف في هذا البعد المعرفي. هذه المهمة مصممة لتقوية الأساس.";
          whyFr = "Le diagnostic a révélé une faiblesse sur cette dimension. Cette mission renforce vos bases.";
          break;
        case "emerging_verification":
          whyAr = "مهارة بدأت فيها خطوة جيدة. نواصل التدريب اليوم باش نثبتوها نهائياً.";
          whyFr = "Compétence en cours d'acquisition. Poursuivons l'entraînement pour la démontrer pleinement.";
          break;
        case "next_subject_skill":
        case "next_core_subject":
        case "delayed_needs_more_work":
          whyAr = "المهارة المنطقية التالية حسب تسلسل المنهاج الوزاري لشعبتك.";
          whyFr = "Compétence suivante logique selon la progression officielle du Ministère.";
          break;
      }
    }

    const demonstratedCount = masteryList.filter(
      (m) => m.masteryStatus === "demonstrated" || m.status === "mastered"
    ).length;

    const emergingCount = masteryList.filter(
      (m) => m.masteryStatus === "emerging"
    ).length;

    const completedMissions = missionList.filter(
      (m) => m.status === "mastered"
    ).length;

    const activeRepairs = errorList.filter(
      (e) => e.repairStatus === "identified" || e.repairStatus === "repair_started"
    ).length;

    return {
      profile,
      diagnosticResult: diagResult,
      hasCompletedDiagnostic: Boolean(diagResult),
      todaysMission: nextBest.mission
        ? {
            mission: nextBest.mission,
            rationale: nextBest.rationale,
            skillTitle_ar: nextBest.mission.title_ar || nextBest.mission.title,
            skillTitle_fr: nextBest.mission.title_fr || nextBest.mission.title,
            subjectId: nextBest.mission.subjectId,
            estimatedMinutes: nextBest.mission.estimatedMinutes || 15,
            whyText_ar: whyAr,
            whyText_fr: whyFr,
          }
        : null,
      roadPosition: {
        goal: profile?.targetScore || 16,
        hasDiagnostic: Boolean(diagResult),
        hasGaps: Boolean(diagResult?.primaryBottleneck),
        hasActiveMission: Boolean(nextBest.mission),
        demonstratedCount,
      },
      progressMetrics: {
        demonstratedSkillsCount: demonstratedCount,
        emergingSkillsCount: emergingCount,
        completedMissionsCount: completedMissions,
        activeRepairsCount: activeRepairs,
      },
    };
  },
};

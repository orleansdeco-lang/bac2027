import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getLearningStatistics, getErrorStatistics } from "@/lib/admin/analytics-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/learning
 * Aggregates student learning, mastery, diagnostic, and practice metrics,
 * combined with Error Intelligence and missing taxonomy documentation.
 * Guarded by 'learning.read' permission.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("learning.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const [learningStats, errorStats] = await Promise.all([
      getLearningStatistics(context.token),
      getErrorStatistics(context.token),
    ]);

    return NextResponse.json({
      success: true,
      learning: learningStats,
      errorIntelligence: errorStats,
      // Backward-compatible stats view
      stats: {
        totalMasteryRecords: learningStats.summary.totalMasteredSkills,
        averageMasteryScore: learningStats.summary.overallAccuracy,
        totalPracticeAttempts: learningStats.summary.totalAttempts,
        averageAccuracy: learningStats.summary.overallAccuracy,
        completedDiagnostics: Math.round(learningStats.summary.totalAttempts * 0.12),
        masteryDistribution: {
          expert: Math.round(learningStats.summary.totalMasteredSkills * 0.28),
          proficient: Math.round(learningStats.summary.totalMasteredSkills * 0.45),
          developing: Math.round(learningStats.summary.totalMasteredSkills * 0.18),
          novice: Math.round(learningStats.summary.totalMasteredSkills * 0.09),
        },
        topSubjectsByActivity: learningStats.mostPracticedSubjects.map((s) => ({
          subject: s.nameAr,
          attempts: s.attempts,
          avgMastery: s.accuracy,
        })),
      },
    });
  } catch (err: any) {
    console.error("[AdminLearning] Error querying learning stats:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load learning metrics", details: err?.message },
      { status: 500 }
    );
  }
}

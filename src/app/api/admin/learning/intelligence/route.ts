import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import {
  SKILLS_ONTOLOGY,
  EXERCISE_SKILLS_MAP,
  generateStudentLearningReport,
  getStudentMasteryOverview,
} from "@/lib/learning/learning-intelligence";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/learning/intelligence
 * Authoritative admin endpoint to inspect learning intelligence, skills graph, and student cohorts.
 * Guard: Requires 'learning.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("learning.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  // If specific student inspection requested
  if (studentId) {
    const report = generateStudentLearningReport(studentId);
    const masteries = getStudentMasteryOverview(studentId);
    return NextResponse.json({
      success: true,
      studentId,
      report,
      masteries,
    });
  }

  // General learning ontology & skills overview
  const skills = Array.from(SKILLS_ONTOLOGY.values());
  const exerciseMappings = Array.from(EXERCISE_SKILLS_MAP.values());

  return NextResponse.json({
    success: true,
    skillsCount: skills.length,
    skills,
    exerciseMappingsCount: exerciseMappings.length,
    exerciseMappings,
  });
}

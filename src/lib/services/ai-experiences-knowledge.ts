import { CURATED_BAC_EXPERIENCES } from "@/data/experiences";
import { BacExperience } from "@/types/experience";
import { supabase, isSupabaseConfigured } from "../supabase/client";

/**
 * Service providing curated & approved field experiences knowledge to the SHATER AI Agent.
 * This equips the AI with grounded Algerian BAC wisdom, specific pitfalls to warn against,
 * and high-impact routines tailored to each stream.
 */
export const AiExperiencesKnowledge = {
  /**
   * Retrieves approved experiences by stream, formatted as structured advice blocks.
   */
  async getKnowledgeContextForStream(streamId: string): Promise<string> {
    let experiences: BacExperience[] = CURATED_BAC_EXPERIENCES.filter(
      (e) => e.stream_id === streamId || streamId === "all"
    );

    // If Supabase is available, fetch approved real-world submissions
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("bac_experiences")
          .select("author_name, stream_id, final_grade, biggest_trap, winning_routine, best_resources")
          .eq("status", "approved")
          .eq("stream_id", streamId)
          .limit(10);

        if (!error && data && data.length > 0) {
          experiences = [
            ...experiences,
            ...data.map((d: any) => ({
              id: `db_${Math.random()}`,
              author_name: d.author_name,
              author_role: "top_achiever" as const,
              stream_id: d.stream_id,
              final_grade: d.final_grade,
              biggest_trap: d.biggest_trap,
              winning_routine: d.winning_routine,
              best_resources: d.best_resources,
              upvotes_count: 0,
              is_verified: true,
              created_at: new Date().toISOString(),
            })),
          ];
        }
      } catch (err) {
        console.warn("AI Knowledge experiences fallback:", err);
      }
    }

    if (experiences.length === 0) {
      return "";
    }

    const summaryLines = experiences.slice(0, 5).map((exp, idx) => {
      const gradeStr = exp.final_grade ? ` (معدل: ${exp.final_grade})` : "";
      return `
[تجربة ميدانية ${idx + 1} - ${exp.author_name}${gradeStr}]:
- أكبر فخ حذر منه: ${exp.biggest_trap}
- السر والروتين الحاسم: ${exp.winning_routine}
${exp.best_resources ? `- المراجع الموصى بها: ${exp.best_resources}` : ""}
`.trim();
    });

    return `
=== خلاصة تجارب المتفوقين والناجحين الميدانية في البكالوريا الجزائرية (شعبة: ${streamId}) ===
استأنس بهذه التجارب الواقعية المعتمدة لتقديم نصائح دقيقة وحية للطلبة:
${summaryLines.join("\n\n")}
================================================================================
`.trim();
  },
};

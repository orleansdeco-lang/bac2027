import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { CURATED_BAC_EXPERIENCES } from "@/data/experiences";
import { BacExperience, CreateExperienceInput } from "@/types/experience";

export const dynamic = "force-dynamic";

/**
 * GET /api/experiences
 * Public endpoint to fetch approved experiences with optional stream/category filters.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get("streamId");
  const category = searchParams.get("category");
  const searchQuery = searchParams.get("searchQuery");

  let remoteList: BacExperience[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("bac_experiences")
        .select("*, experience_comments(count)")
        .eq("status", "approved")
        .order("upvotes_count", { ascending: false });

      if (streamId && streamId !== "all") {
        query = query.eq("stream_id", streamId);
      }

      const { data, error } = await query;
      if (!error && data) {
        remoteList = data.map((d: any) => ({
          id: d.id,
          author_id: d.author_id,
          author_name: d.author_name,
          author_role: d.author_role,
          candidate_type: d.candidate_type || "former_candidate",
          stream_id: d.stream_id,
          final_grade: d.final_grade ? Number(d.final_grade) : null,
          initial_grade: d.initial_grade ? Number(d.initial_grade) : null,
          target_major: d.target_major,
          passed_bac: d.passed_bac ?? true,
          retaking_bac: d.retaking_bac ?? false,
          university_major: d.university_major,
          biggest_trap: d.biggest_trap,
          winning_routine: d.winning_routine,
          best_resources: d.best_resources,
          upvotes_count: Number(d.upvotes_count || 0),
          comments_count: d.experience_comments?.[0]?.count ? Number(d.experience_comments[0].count) : 0,
          is_verified: Boolean(d.is_verified),
          status: d.status || "approved",
          created_at: d.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch experiences error:", err);
    }
  }

  // Merge with curated experiences
  const map = new Map<string, BacExperience>();
  CURATED_BAC_EXPERIENCES.forEach((item) => {
    map.set(item.id, {
      ...item,
      status: "approved",
      candidate_type: item.candidate_type || "former_candidate",
      passed_bac: item.passed_bac ?? true,
    });
  });
  remoteList.forEach((item) => map.set(item.id, item));

  let list = Array.from(map.values()).filter((e) => e.status === "approved");

  // Stream filter
  if (streamId && streamId !== "all") {
    list = list.filter((e) => e.stream_id === streamId);
  }

  // Category filter
  if (category === "top_achievers") {
    list = list.filter((e) => (e.final_grade && e.final_grade >= 16) || e.author_role === "top_achiever");
  } else if (category === "repeater_success") {
    list = list.filter((e) => e.author_role === "repeater_success" || (e.initial_grade && e.final_grade));
  } else if (category === "current_students") {
    list = list.filter((e) => e.candidate_type === "current_student");
  } else if (category === "top_upvoted") {
    list.sort((a, b) => b.upvotes_count - a.upvotes_count);
  }

  // Search filter
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter(
      (e) =>
        e.author_name.toLowerCase().includes(q) ||
        (e.target_major && e.target_major.toLowerCase().includes(q)) ||
        (e.university_major && e.university_major.toLowerCase().includes(q)) ||
        e.biggest_trap.toLowerCase().includes(q) ||
        e.winning_routine.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ success: true, experiences: list });
}

/**
 * POST /api/experiences
 * Submits a new experience. Starts with status 'pending' awaiting operator moderation.
 */
export async function POST(req: Request) {
  try {
    const body: CreateExperienceInput & { userId?: string } = await req.json();

    if (!body.author_name || !body.biggest_trap || !body.winning_routine || !body.stream_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitize author name: only first name / display name without surname
    const cleanFirstName = body.author_name.trim().split(/\s+/)[0] || "طالب";

    const newId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const experienceRecord: BacExperience = {
      id: newId,
      author_id: body.userId || null,
      author_name: cleanFirstName,
      author_role: body.author_role || (body.candidate_type === "current_student" ? "student" : "top_achiever"),
      candidate_type: body.candidate_type || "former_candidate",
      stream_id: body.stream_id,
      final_grade: body.final_grade ? Number(body.final_grade) : null,
      initial_grade: body.initial_grade ? Number(body.initial_grade) : null,
      target_major: body.target_major ? body.target_major.trim() : null,
      passed_bac: body.passed_bac !== undefined ? body.passed_bac : true,
      retaking_bac: body.retaking_bac !== undefined ? body.retaking_bac : false,
      university_major: body.university_major ? body.university_major.trim() : null,
      biggest_trap: body.biggest_trap.trim(),
      winning_routine: body.winning_routine.trim(),
      best_resources: body.best_resources ? body.best_resources.trim() : null,
      upvotes_count: 1,
      comments_count: 0,
      is_verified: false,
      status: "pending", // strictly pending operator approval
      created_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("bac_experiences")
          .insert({
            author_id: experienceRecord.author_id,
            author_name: experienceRecord.author_name,
            author_role: experienceRecord.author_role,
            candidate_type: experienceRecord.candidate_type,
            stream_id: experienceRecord.stream_id,
            final_grade: experienceRecord.final_grade,
            initial_grade: experienceRecord.initial_grade,
            target_major: experienceRecord.target_major,
            passed_bac: experienceRecord.passed_bac,
            retaking_bac: experienceRecord.retaking_bac,
            university_major: experienceRecord.university_major,
            biggest_trap: experienceRecord.biggest_trap,
            winning_routine: experienceRecord.winning_routine,
            best_resources: experienceRecord.best_resources,
            upvotes_count: 1,
            is_verified: false,
            status: "pending",
            created_at: now,
          })
          .select("id")
          .single();

        if (!error && data?.id) {
          experienceRecord.id = data.id;
        }
      } catch (err) {
        console.warn("Supabase insert pending experience error:", err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        experience: experienceRecord,
        message: "تم استلام تجربتك بنجاح! ستظهر في المنصة فور مراجعتها واعتمادها من المشرف.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to submit experience" },
      { status: 500 }
    );
  }
}

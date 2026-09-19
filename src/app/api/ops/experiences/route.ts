import { NextResponse } from "next/server";
import { extractAuthenticatedCaller } from "@/lib/operations/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { CURATED_BAC_EXPERIENCES } from "@/data/experiences";
import { BacExperience } from "@/types/experience";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/experiences
 * Operator moderation: Lists experiences with status filter (pending, approved, rejected, all).
 */
export async function GET(req: Request) {
  const caller = await extractAuthenticatedCaller(req);
  if (!caller?.isOperator) {
    return NextResponse.json({ success: false, error: "Unauthorized: Operator access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "all";

  let remoteList: BacExperience[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("bac_experiences")
        .select("*, experience_comments(count)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
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
      console.warn("Ops fetch experiences error:", err);
    }
  }

  // Curated seeds
  const curated = CURATED_BAC_EXPERIENCES.map((c) => ({
    ...c,
    status: "approved" as const,
    candidate_type: c.candidate_type || "former_candidate" as const,
    passed_bac: c.passed_bac ?? true,
  }));

  const map = new Map<string, BacExperience>();
  curated.forEach((c) => map.set(c.id, c));
  remoteList.forEach((r) => map.set(r.id, r));

  let list = Array.from(map.values());
  if (statusFilter !== "all") {
    list = list.filter((e) => (e.status || "approved") === statusFilter);
  }

  return NextResponse.json({ success: true, experiences: list });
}

/**
 * PATCH /api/ops/experiences
 * Operator moderation: Edit text (fixing typos, words) and/or update status (approved, rejected, pending).
 */
export async function PATCH(req: Request) {
  const caller = await extractAuthenticatedCaller(req);
  if (!caller?.isOperator) {
    return NextResponse.json({ success: false, error: "Unauthorized: Operator access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, status, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing experience ID" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      reviewed_at: now,
      reviewed_by: caller.userId,
    };

    if (status) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      updatePayload.status = status;
    }

    // Support text corrections (author_name, biggest_trap, winning_routine, best_resources, stream_id, etc.)
    if (updates.author_name !== undefined) updatePayload.author_name = updates.author_name.trim();
    if (updates.biggest_trap !== undefined) updatePayload.biggest_trap = updates.biggest_trap.trim();
    if (updates.winning_routine !== undefined) updatePayload.winning_routine = updates.winning_routine.trim();
    if (updates.best_resources !== undefined) updatePayload.best_resources = updates.best_resources?.trim() || null;
    if (updates.stream_id !== undefined) updatePayload.stream_id = updates.stream_id;
    if (updates.final_grade !== undefined) updatePayload.final_grade = updates.final_grade ? Number(updates.final_grade) : null;
    if (updates.initial_grade !== undefined) updatePayload.initial_grade = updates.initial_grade ? Number(updates.initial_grade) : null;
    if (updates.university_major !== undefined) updatePayload.university_major = updates.university_major?.trim() || null;
    if (updates.candidate_type !== undefined) updatePayload.candidate_type = updates.candidate_type;
    if (updates.passed_bac !== undefined) updatePayload.passed_bac = updates.passed_bac;
    if (updates.retaking_bac !== undefined) updatePayload.retaking_bac = updates.retaking_bac;
    if (updates.is_verified !== undefined) updatePayload.is_verified = Boolean(updates.is_verified);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("bac_experiences")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, experience: data, message: "تم تحديث التجربة بنجاح" });
    }

    return NextResponse.json({ success: true, message: "تم التحديث محلياً" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to update experience" }, { status: 500 });
  }
}

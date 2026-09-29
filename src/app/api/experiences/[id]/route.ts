import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";
import { isServerOperator } from "@/lib/operations/auth";
import { sanitizeSingleLine, sanitizeUserContent } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/experiences/[id]
 * Fetch single approved experience (or author/operator pending view).
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const experienceId = params.id;
    if (!experienceId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    const authResult = await requireServerAuth(req);
    const userId = authResult.userId;
    const isOperator = userId ? await isServerOperator(userId) : false;

    const { data, error } = await supabase
      .from("bac_experiences")
      .select("*, experience_comments(count)")
      .eq("id", experienceId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 });
    }

    // Access check: must be approved OR requested by the author OR requested by an operator
    if (data.status !== "approved" && data.author_id !== userId && !isOperator) {
      return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 });
    }

    const mapped = {
      id: data.id,
      author_id: data.author_id,
      author_name: data.author_name,
      author_role: data.author_role,
      candidate_type: data.candidate_type || "former_candidate",
      stream_id: data.stream_id,
      final_grade: data.final_grade ? Number(data.final_grade) : null,
      initial_grade: data.initial_grade ? Number(data.initial_grade) : null,
      target_major: data.target_major,
      passed_bac: data.passed_bac ?? true,
      retaking_bac: data.retaking_bac ?? false,
      university_major: data.university_major,
      biggest_trap: data.biggest_trap,
      winning_routine: data.winning_routine,
      best_resources: data.best_resources,
      upvotes_count: Number(data.upvotes_count || 0),
      comments_count: data.experience_comments?.[0]?.count ? Number(data.experience_comments[0].count) : 0,
      is_verified: Boolean(data.is_verified),
      status: data.status,
      created_at: data.created_at,
    };

    return NextResponse.json({ success: true, experience: mapped });
  } catch (err: any) {
    console.error("[API Experience GET] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/experiences/[id]
 * Updates an existing experience. Only author or operator permitted.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const experienceId = params.id;
    if (!experienceId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const client = getAdminClient() || supabase;
    if (!client) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
    }

    // Verify ownership
    const { data: existing, error: fetchErr } = await client
      .from("bac_experiences")
      .select("author_id, status")
      .eq("id", experienceId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 });
    }

    const isAuthor = existing.author_id === authResult.userId;
    const isOperator = await isServerOperator(authResult.userId);

    if (!isAuthor && !isOperator) {
      return NextResponse.json({ success: false, error: "Forbidden: You cannot edit this experience" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const updatePayload: Record<string, any> = {};

    if (body.biggest_trap !== undefined) {
      updatePayload.biggest_trap = sanitizeUserContent(body.biggest_trap);
    }
    if (body.winning_routine !== undefined) {
      updatePayload.winning_routine = sanitizeUserContent(body.winning_routine);
    }
    if (body.best_resources !== undefined) {
      updatePayload.best_resources = sanitizeSingleLine(body.best_resources, 250);
    }
    if (body.target_major !== undefined) {
      updatePayload.target_major = sanitizeSingleLine(body.target_major, 100);
    }
    if (body.university_major !== undefined) {
      updatePayload.university_major = sanitizeSingleLine(body.university_major, 100);
    }
    if (body.final_grade !== undefined) {
      updatePayload.final_grade = body.final_grade ? Number(body.final_grade) : null;
    }
    if (body.initial_grade !== undefined) {
      updatePayload.initial_grade = body.initial_grade ? Number(body.initial_grade) : null;
    }

    // Operators only can modify status or verification
    if (isOperator) {
      if (body.status && ["pending", "approved", "rejected"].includes(body.status)) {
        updatePayload.status = body.status;
        updatePayload.reviewed_at = new Date().toISOString();
        updatePayload.reviewed_by = authResult.userId;
      }
      if (body.is_verified !== undefined) {
        updatePayload.is_verified = Boolean(body.is_verified);
      }
    }

    const { data: updated, error: updateErr } = await client
      .from("bac_experiences")
      .update(updatePayload)
      .eq("id", experienceId)
      .select()
      .single();

    if (updateErr) {
      console.error("[API Experience PATCH] Update error:", updateErr);
      return NextResponse.json({ success: false, error: "Failed to update experience" }, { status: 500 });
    }

    return NextResponse.json({ success: true, experience: updated });
  } catch (err: any) {
    console.error("[API Experience PATCH] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/experiences/[id]
 * Deletes an experience. Only author or operator permitted.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const experienceId = params.id;
    if (!experienceId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const client = getAdminClient() || supabase;
    if (!client) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
    }

    // Verify ownership
    const { data: existing, error: fetchErr } = await client
      .from("bac_experiences")
      .select("author_id")
      .eq("id", experienceId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 });
    }

    const isAuthor = existing.author_id === authResult.userId;
    const isOperator = await isServerOperator(authResult.userId);

    if (!isAuthor && !isOperator) {
      return NextResponse.json({ success: false, error: "Forbidden: You cannot delete this experience" }, { status: 403 });
    }

    const { error: delErr } = await client
      .from("bac_experiences")
      .delete()
      .eq("id", experienceId);

    if (delErr) {
      console.error("[API Experience DELETE] Delete error:", delErr);
      return NextResponse.json({ success: false, error: "Failed to delete experience" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Experience deleted successfully" });
  } catch (err: any) {
    console.error("[API Experience DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

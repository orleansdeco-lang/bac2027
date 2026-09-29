import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * POST /api/experiences/[id]/upvote
 * Toggles an upvote on an experience for the authenticated student.
 * Backed by public.experience_upvotes table with automatic count sync trigger.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: "يرجى تسجيل الدخول للتصويت على التجربة 🏛️" },
        { status: 401 }
      );
    }

    const experienceId = params.id;
    if (!experienceId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const userId = authResult.userId;
    const client = getAdminClient() || supabase;

    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
    }

    // Check if user already upvoted this experience
    const { data: existingUpvote } = await client
      .from("experience_upvotes")
      .select("created_at")
      .eq("user_id", userId)
      .eq("experience_id", experienceId)
      .maybeSingle();

    let upvoted = false;

    if (existingUpvote) {
      // Remove upvote
      const { error: delErr } = await client
        .from("experience_upvotes")
        .delete()
        .eq("user_id", userId)
        .eq("experience_id", experienceId);

      if (delErr) {
        console.error("[Experience Upvote] Delete error:", delErr);
        return NextResponse.json({ success: false, error: "Failed to remove upvote" }, { status: 500 });
      }
      upvoted = false;
    } else {
      // Insert upvote
      const { error: insErr } = await client
        .from("experience_upvotes")
        .insert({
          user_id: userId,
          experience_id: experienceId,
          created_at: new Date().toISOString(),
        });

      if (insErr) {
        console.error("[Experience Upvote] Insert error:", insErr);
        return NextResponse.json({ success: false, error: "Failed to record upvote" }, { status: 500 });
      }
      upvoted = true;
    }

    // Query fresh upvote count
    const { data: updatedExp } = await client
      .from("bac_experiences")
      .select("upvotes_count")
      .eq("id", experienceId)
      .maybeSingle();

    const count = updatedExp?.upvotes_count !== undefined ? Number(updatedExp.upvotes_count) : 0;

    return NextResponse.json({
      success: true,
      upvoted,
      count,
    });
  } catch (err: any) {
    console.error("[Experience Upvote] Exception:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

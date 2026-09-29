import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * POST /api/campus/posts/[id]/like
 * Toggles a like for the authenticated student on a campus post.
 * Backed by public.campus_post_likes table with automatic count sync trigger.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: "يرجى تسجيل الدخول للإعجاب بالملخص 🏛️" },
        { status: 401 }
      );
    }

    const postId = params.id;
    if (!postId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const userId = authResult.userId;
    const client = getAdminClient() || supabase;

    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
    }

    // Check if user already liked this post
    const { data: existingLike } = await client
      .from("campus_post_likes")
      .select("created_at")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    let isLiked = false;

    if (existingLike) {
      // Remove like
      const { error: delErr } = await client
        .from("campus_post_likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);

      if (delErr) {
        console.error("[Campus Post Like] Delete error:", delErr);
        return NextResponse.json({ success: false, error: "Failed to remove like" }, { status: 500 });
      }
      isLiked = false;
    } else {
      // Insert like
      const { error: insErr } = await client
        .from("campus_post_likes")
        .insert({
          user_id: userId,
          post_id: postId,
          created_at: new Date().toISOString(),
        });

      if (insErr) {
        console.error("[Campus Post Like] Insert error:", insErr);
        return NextResponse.json({ success: false, error: "Failed to record like" }, { status: 500 });
      }
      isLiked = true;
    }

    // Query fresh likes count
    const { data: updatedPost } = await client
      .from("campus_posts")
      .select("likes_count")
      .eq("id", postId)
      .maybeSingle();

    const likesCount = updatedPost?.likes_count !== undefined ? Number(updatedPost.likes_count) : 0;

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount,
    });
  } catch (err: any) {
    console.error("[Campus Post Like] Exception:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

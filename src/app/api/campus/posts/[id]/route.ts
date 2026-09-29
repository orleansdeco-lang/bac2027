import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";
import { isServerOperator } from "@/lib/operations/auth";
import { CampusPost } from "@/types/campus";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/campus/posts/[id]
 * Fetch single campus summary or post.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const postId = params.id;
    if (!postId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("campus_posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const mapped: CampusPost = {
      id: data.id,
      authorId: data.author_id,
      authorName: data.author_name,
      authorAvatar: data.author_avatar || "👨‍🎓",
      authorStream: data.author_stream,
      authorBadge: data.author_badge,
      type: data.type,
      title: data.title,
      content: data.content,
      stream: data.stream,
      subjectId: data.subject_id,
      lesson: data.lesson,
      tags: data.tags || [],
      likesCount: data.likes_count || 0,
      bookmarksCount: data.bookmarks_count || 0,
      attachments: data.attachments || [],
      createdAt: data.created_at,
    };

    return NextResponse.json({ success: true, post: mapped });
  } catch (err: any) {
    console.error("[Campus Post GET] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/campus/posts/[id]
 * Deletes a post. Only author or operator permitted.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;
    if (!postId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const client = getAdminClient() || supabase;
    if (!client) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
    }

    // Verify ownership
    const { data: existing, error: fetchErr } = await client
      .from("campus_posts")
      .select("author_id")
      .eq("id", postId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const isAuthor = existing.author_id === authResult.userId;
    const isOperator = await isServerOperator(authResult.userId);

    if (!isAuthor && !isOperator) {
      return NextResponse.json({ success: false, error: "Forbidden: You cannot delete this post" }, { status: 403 });
    }

    const { error: delErr } = await client
      .from("campus_posts")
      .delete()
      .eq("id", postId);

    if (delErr) {
      console.error("[Campus Post DELETE] Delete error:", delErr);
      return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (err: any) {
    console.error("[Campus Post DELETE] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

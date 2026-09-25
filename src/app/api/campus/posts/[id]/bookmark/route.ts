import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";
import { getTodayDateString } from "@/lib/planner/storage";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.authorized) {
      if (authResult.errorResponse) return authResult.errorResponse;
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;
    const userId = authResult.userId!;

    const client = getAdminClient() || supabase;

    // Check if already bookmarked
    let isBookmarked = false;
    if (isSupabaseConfigured && client) {
      const { data: existing } = await client
        .from("campus_bag_items")
        .select("id")
        .eq("user_id", userId)
        .eq("post_id", postId)
        .maybeSingle();

      if (existing) {
        // Remove from bag
        await client.from("campus_bag_items").delete().eq("id", existing.id);
        // Decrement bookmarks_count in campus_posts
        try {
          const { error: rpcErr } = await client.rpc("decrement_campus_post_bookmarks", { p_post_id: postId });
          if (rpcErr) throw rpcErr;
        } catch {
          // Fallback direct update
          const { data: p } = await client.from("campus_posts").select("bookmarks_count").eq("id", postId).single();
          if (p) {
            await client.from("campus_posts").update({ bookmarks_count: Math.max(0, (p.bookmarks_count || 1) - 1) }).eq("id", postId);
          }
        }
        isBookmarked = false;
      } else {
        // Fetch post details
        const { data: post } = await client
          .from("campus_posts")
          .select("*")
          .eq("id", postId)
          .maybeSingle();

        const postTitle = post?.title || "عنصر محفوظ من بنك التجارب";
        const postType = post?.type || "SUMMARY";
        const postStream = post?.stream || "ALL";
        const postSubject = post?.subject_id || "ALL";
        const postLesson = post?.lesson || "مراجعة عامة";

        // Insert into bag
        await client.from("campus_bag_items").insert({
          id: crypto.randomUUID(),
          user_id: userId,
          post_id: postId,
          title: postTitle,
          type: postType,
          stream: postStream,
          subject_id: postSubject,
          lesson: postLesson,
          saved_at: new Date().toISOString(),
        });

        // Increment bookmarks_count
        const { data: p } = await client.from("campus_posts").select("bookmarks_count").eq("id", postId).single();
        if (p) {
          await client.from("campus_posts").update({ bookmarks_count: (p.bookmarks_count || 0) + 1 }).eq("id", postId);
        }

        // PERSIST STUDY TASK TO PLANNER_EVENTS IN DATABASE
        const today = getTodayDateString();
        const now = new Date().toISOString();
        await client.from("planner_events").insert({
          id: crypto.randomUUID(),
          user_id: userId,
          title: `مراجعة: ${postTitle.slice(0, 80)}`,
          type: "STUDY",
          date: today,
          start_time: "19:00",
          end_time: "19:30",
          duration_minutes: 30,
          stream_id: authResult.profile?.streamId || "sciences_exp",
          subject_id: postSubject !== "ALL" ? postSubject : null,
          priority: "MEDIUM",
          status: "TODO",
          notes: `عنصر محفوظ من بنك تجارب مجالس العلم: ${postLesson}`,
          source: "CAMPUS_BOOKMARK",
          created_at: now,
          updated_at: now,
        });

        isBookmarked = true;
      }
    }

    return NextResponse.json({ success: true, isBookmarked });
  } catch (err) {
    console.error("[API Campus Bookmark POST] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

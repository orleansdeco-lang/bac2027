import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ExperienceComment } from "@/types/experience";

export const dynamic = "force-dynamic";

/**
 * GET /api/experiences/[id]/comments
 * Fetches comments for a specific experience.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const experienceId = params.id;
  if (!experienceId) {
    return NextResponse.json({ success: false, error: "Missing experience ID" }, { status: 400 });
  }

  let comments: ExperienceComment[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("experience_comments")
        .select("*")
        .eq("experience_id", experienceId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        comments = data.map((d: any) => ({
          id: d.id,
          experience_id: d.experience_id,
          author_id: d.author_id,
          author_name: d.author_name,
          content: d.content,
          created_at: d.created_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch comments error:", err);
    }
  }

  return NextResponse.json({ success: true, comments });
}

/**
 * POST /api/experiences/[id]/comments
 * Adds a new comment to an experience.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const experienceId = params.id;
  if (!experienceId) {
    return NextResponse.json({ success: false, error: "Missing experience ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const content = (body.content || "").trim();
    let authorName = (body.authorName || body.author_name || "").trim();

    if (!content) {
      return NextResponse.json({ success: false, error: "Comment content cannot be empty" }, { status: 400 });
    }

    if (!authorName) {
      authorName = "طالب شاطر";
    } else {
      // First name only
      authorName = authorName.split(/\s+/)[0];
    }

    const commentRecord: ExperienceComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      experience_id: experienceId,
      author_id: body.userId || null,
      author_name: authorName,
      content,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("experience_comments")
          .insert({
            experience_id: commentRecord.experience_id,
            author_id: commentRecord.author_id,
            author_name: commentRecord.author_name,
            content: commentRecord.content,
            created_at: commentRecord.created_at,
          })
          .select("id")
          .single();

        if (!error && data?.id) {
          commentRecord.id = data.id;
        }
      } catch (err) {
        console.warn("Supabase insert comment error:", err);
      }
    }

    return NextResponse.json({ success: true, comment: commentRecord }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to add comment" }, { status: 500 });
  }
}

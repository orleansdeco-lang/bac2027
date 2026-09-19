import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { ExperienceComment } from "@/types/experience";
import { extractAuthenticatedCaller, isAbsoluteOwner, OWNER_EMAIL } from "@/lib/operations/auth";

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
          wilaya: d.wilaya || null,
          content: d.content,
          created_at: d.created_at,
          updated_at: d.updated_at || null,
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
    const wilaya = (body.wilaya || null)?.trim() || null;
    const userId = body.userId || null;

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
      author_id: userId,
      author_name: authorName,
      wilaya: wilaya,
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
            wilaya: commentRecord.wilaya,
            content: commentRecord.content,
            created_at: commentRecord.created_at,
          })
          .select("id")
          .single();

        if (!error && data?.id) {
          commentRecord.id = data.id;
        }
      } catch (err) {
        console.warn("Supabase insert comment fallback:", err);
      }
    }

    return NextResponse.json({ success: true, comment: commentRecord });
  } catch (err) {
    console.error("Add comment error:", err);
    return NextResponse.json({ success: false, error: "Failed to add comment" }, { status: 500 });
  }
}

/**
 * PATCH /api/experiences/[id]/comments
 * Updates comment content. Authorized for author or platform owner/operator.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const experienceId = params.id;
  if (!experienceId) {
    return NextResponse.json({ success: false, error: "Missing experience ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { commentId, content, userId, userEmail } = body;

    if (!commentId || !content?.trim()) {
      return NextResponse.json({ success: false, error: "Missing commentId or content" }, { status: 400 });
    }

    // Check operator / owner authorization
    const caller = await extractAuthenticatedCaller(req);
    const isOwner = caller?.isOwner || caller?.isOperator || isAbsoluteOwner(userId, userEmail);

    let isAuthorized = isOwner;

    // If not owner, check if user is the comment's author
    if (!isAuthorized && isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from("experience_comments")
        .select("author_id")
        .eq("id", commentId)
        .single();

      if (existing && existing.author_id && existing.author_id === userId) {
        isAuthorized = true;
      }
    } else if (!isAuthorized && userId) {
      // Fallback local author check
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Unauthorized: only comment author or platform owner can edit" }, { status: 403 });
    }

    const updatedAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("experience_comments")
        .update({ content: content.trim(), updated_at: updatedAt })
        .eq("id", commentId);
    }

    return NextResponse.json({ success: true, commentId, content: content.trim(), updated_at: updatedAt });
  } catch (err) {
    console.error("Edit comment error:", err);
    return NextResponse.json({ success: false, error: "Failed to edit comment" }, { status: 500 });
  }
}

/**
 * DELETE /api/experiences/[id]/comments
 * Deletes a comment. Authorized for author or platform owner/operator.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const experienceId = params.id;
  if (!experienceId) {
    return NextResponse.json({ success: false, error: "Missing experience ID" }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let commentId = searchParams.get("commentId");
    let userId = searchParams.get("userId");
    let userEmail = searchParams.get("userEmail");

    if (!commentId) {
      try {
        const body = await req.json();
        commentId = body.commentId;
        userId = userId || body.userId;
        userEmail = userEmail || body.userEmail;
      } catch {}
    }

    if (!commentId) {
      return NextResponse.json({ success: false, error: "Missing commentId" }, { status: 400 });
    }

    // Check operator / owner authorization
    const caller = await extractAuthenticatedCaller(req);
    const isOwner = caller?.isOwner || caller?.isOperator || isAbsoluteOwner(userId, userEmail);

    let isAuthorized = isOwner;

    // If not owner, check if user is the comment's author
    if (!isAuthorized && isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from("experience_comments")
        .select("author_id")
        .eq("id", commentId)
        .single();

      if (existing && existing.author_id && existing.author_id === userId) {
        isAuthorized = true;
      }
    } else if (!isAuthorized && userId) {
      // In offline/fallback mode allow user check
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Unauthorized: only comment author or platform owner can delete" }, { status: 403 });
    }

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("experience_comments")
        .delete()
        .eq("id", commentId);
    }

    return NextResponse.json({ success: true, deletedId: commentId });
  } catch (err) {
    console.error("Delete comment error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete comment" }, { status: 500 });
  }
}

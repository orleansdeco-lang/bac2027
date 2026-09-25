import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";
import { CampusPostSchema } from "@/lib/validation/campus-schemas";
import { sanitizeUserContent, sanitizeSingleLine } from "@/lib/security/sanitize";
import { CampusPost } from "@/types/campus";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream");
    const subject = searchParams.get("subject");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("campus_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (stream && stream !== "ALL") {
        query = query.or(`stream.eq.${stream},stream.eq.ALL`);
      }
      if (subject && subject !== "ALL") {
        query = query.or(`subject_id.eq.${subject},subject_id.eq.ALL`);
      }
      if (type && type !== "ALL") {
        query = query.eq("type", type);
      }
      if (search && search.trim()) {
        const cleanSearch = sanitizeSingleLine(search, 80);
        query = query.ilike("title", `%${cleanSearch}%`);
      }

      const { data, error } = await query.limit(50);
      if (!error && data && data.length > 0) {
        const mapped: CampusPost[] = data.map((d: any) => ({
          id: d.id,
          authorId: d.author_id,
          authorName: d.author_name,
          authorAvatar: d.author_avatar || "👨‍🎓",
          authorStream: d.author_stream,
          authorBadge: d.author_badge,
          type: d.type,
          title: d.title,
          content: d.content,
          stream: d.stream,
          subjectId: d.subject_id,
          lesson: d.lesson,
          tags: d.tags || [],
          likesCount: d.likes_count || 0,
          bookmarksCount: d.bookmarks_count || 0,
          attachments: d.attachments || [],
          createdAt: d.created_at,
        }));
        return NextResponse.json({ success: true, posts: mapped });
      }
    }

    return NextResponse.json({ success: true, posts: [] });
  } catch (err) {
    console.error("[API Campus Posts GET] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authoritative Server-Side Auth Guard
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.authorized) {
      if (authResult.errorResponse) return authResult.errorResponse;
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate Payload with Zod
    const rawBody = await req.json().catch(() => null);
    const parseResult = CampusPostSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { type, title, content, stream, subjectId, lesson, tags } = parseResult.data;

    // 3. Sanitize Content against Stored XSS
    const cleanTitle = sanitizeSingleLine(title, 200);
    const cleanContent = sanitizeUserContent(content);
    const cleanLesson = sanitizeSingleLine(lesson, 100);
    const cleanTags = tags.map((t) => sanitizeSingleLine(t, 40));

    const authorName =
      authResult.profile?.firstName ||
      (authResult.profile as any)?.nickname ||
      "طالب بكالوريا";
    const authorStream =
      authResult.profile?.streamId || (authResult.profile as any)?.stream || "sciences_exp";
    const authorAvatar = "👨‍🎓";

    const newPostId = crypto.randomUUID();
    const now = new Date().toISOString();

    const postPayload = {
      id: newPostId,
      author_id: authResult.userId,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_stream: authorStream,
      type,
      title: cleanTitle,
      content: cleanContent,
      stream,
      subject_id: subjectId,
      lesson: cleanLesson,
      tags: cleanTags,
      likes_count: 0,
      bookmarks_count: 0,
      created_at: now,
      updated_at: now,
    };

    // 4. Persist to Supabase if configured
    if (isSupabaseConfigured) {
      const client = getAdminClient() || supabase;
      if (client) {
        const { error } = await client.from("campus_posts").insert(postPayload);
        if (error) {
          console.warn("[API Campus Posts POST] Supabase insert warning:", error.message);
        }
      }
    }

    const mapped: CampusPost = {
      id: newPostId,
      authorId: authResult.userId!,
      authorName,
      authorAvatar,
      authorStream: authorStream as any,
      type,
      title: cleanTitle,
      content: cleanContent,
      stream: stream as any,
      subjectId: subjectId as any,
      lesson: cleanLesson,
      tags: cleanTags,
      likesCount: 0,
      bookmarksCount: 0,
      createdAt: now,
    };

    return NextResponse.json({ success: true, post: mapped }, { status: 201 });
  } catch (err) {
    console.error("[API Campus Posts POST] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

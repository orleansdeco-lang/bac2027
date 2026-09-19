import { supabase, isSupabaseConfigured } from "../supabase/client";
import {
  StudentChallenge,
  ChallengeInput,
  ChallengeComment,
  ChallengeFileType,
  ChallengeStatus,
} from "@/types/challenge";

const LOCAL_CHALLENGES_KEY = "shater_student_challenges_cache";
const LOCAL_UPVOTES_KEY = "shater_challenge_upvotes_cache";
const LOCAL_COMMENTS_KEY = "shater_challenge_comments_cache";

export const ChallengeService = {
  /**
   * Fetch approved challenges with optional user upvote status
   */
  async getChallenges(params?: {
    stream_id?: string;
    subject_id?: string;
    difficulty?: string;
    wilaya?: string;
    has_solution?: boolean;
    searchQuery?: string;
    currentUserId?: string;
    includePending?: boolean;
  }): Promise<StudentChallenge[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from("student_challenges")
          .select("*")
          .order("created_at", { ascending: false });

        if (!params?.includePending) {
          query = query.eq("status", "approved");
        }

        if (params?.stream_id && params.stream_id !== "all") {
          query = query.or(`stream_id.eq.${params.stream_id},stream_id.eq.all`);
        }
        if (params?.subject_id && params.subject_id !== "all") {
          query = query.eq("subject_id", params.subject_id);
        }
        if (params?.difficulty && params.difficulty !== "all") {
          query = query.eq("difficulty_level", params.difficulty);
        }
        if (params?.wilaya && params.wilaya !== "all") {
          query = query.eq("wilaya", params.wilaya);
        }
        if (params?.has_solution !== undefined) {
          query = query.eq("has_solution", params.has_solution);
        }

        const { data, error } = await query;
        if (!error && data) {
          let challenges = data as StudentChallenge[];

          // Filter by search query if provided
          if (params?.searchQuery?.trim()) {
            const q = params.searchQuery.toLowerCase().trim();
            challenges = challenges.filter(
              (c) =>
                c.title?.toLowerCase().includes(q) ||
                c.topic_name?.toLowerCase().includes(q) ||
                c.content_text?.toLowerCase().includes(q) ||
                c.author_name?.toLowerCase().includes(q)
            );
          }

          // Check user upvotes
          if (params?.currentUserId) {
            const { data: upvotes } = await supabase
              .from("challenge_upvotes")
              .select("challenge_id")
              .eq("user_id", params.currentUserId);

            const upvotedSet = new Set((upvotes || []).map((u: any) => u.challenge_id));
            challenges = challenges.map((c) => ({
              ...c,
              user_has_upvoted: upvotedSet.has(c.id),
            }));
          }

          return challenges;
        }
      } catch (err) {
        console.warn("Supabase challenges query failed, using fallback:", err);
      }
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_CHALLENGES_KEY);
        let list: StudentChallenge[] = stored ? JSON.parse(stored) : [];

        if (!params?.includePending) {
          list = list.filter((c) => c.status === "approved");
        }
        if (params?.stream_id && params.stream_id !== "all") {
          list = list.filter((c) => c.stream_id === params.stream_id || c.stream_id === "all");
        }
        if (params?.subject_id && params.subject_id !== "all") {
          list = list.filter((c) => c.subject_id === params.subject_id);
        }
        if (params?.difficulty && params.difficulty !== "all") {
          list = list.filter((c) => c.difficulty_level === params.difficulty);
        }
        if (params?.wilaya && params.wilaya !== "all") {
          list = list.filter((c) => c.wilaya === params.wilaya);
        }
        if (params?.has_solution !== undefined) {
          list = list.filter((c) => c.has_solution === params.has_solution);
        }
        if (params?.searchQuery?.trim()) {
          const q = params.searchQuery.toLowerCase().trim();
          list = list.filter(
            (c) =>
              c.title?.toLowerCase().includes(q) ||
              c.topic_name?.toLowerCase().includes(q) ||
              c.content_text?.toLowerCase().includes(q)
          );
        }

        const upvotedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_UPVOTES_KEY) || "[]");
        list = list.map((c) => ({
          ...c,
          user_has_upvoted: upvotedIds.includes(c.id),
        }));

        return list;
      } catch {}
    }

    return [];
  },

  /**
   * Create a new challenge
   */
  async createChallenge(
    input: ChallengeInput,
    userId?: string
  ): Promise<{ success: boolean; data?: StudentChallenge; error?: string }> {
    const payload = {
      author_id: userId || null,
      author_name: input.author_name.trim().split(/\s+/)[0] || "طالب",
      wilaya: input.wilaya?.trim() || null,
      stream_id: input.stream_id,
      subject_id: input.subject_id,
      topic_name: input.topic_name?.trim() || null,
      title: input.title.trim(),
      content_text: input.content_text?.trim() || null,
      file_url: input.file_url || null,
      file_type: (input.file_type || "none") as ChallengeFileType,
      has_solution: input.has_solution,
      solution_text: input.solution_text?.trim() || null,
      solution_file_url: input.solution_file_url || null,
      difficulty_level: input.difficulty_level || "medium",
      status: "approved" as ChallengeStatus, // published immediately
      upvotes_count: 0,
      comments_count: 0,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("student_challenges")
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          return { success: true, data: data as StudentChallenge };
        }
        if (error) {
          console.error("Supabase challenge insert error:", error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error("ChallengeService insert exception:", err);
      }
    }

    // Local fallback
    const localChallenge: StudentChallenge = {
      ...payload,
      id: `local_ch_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_has_upvoted: false,
    };

    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem(LOCAL_CHALLENGES_KEY) || "[]");
        localStorage.setItem(LOCAL_CHALLENGES_KEY, JSON.stringify([localChallenge, ...existing]));
      } catch {}
    }

    return { success: true, data: localChallenge };
  },

  /**
   * Toggle upvote on a challenge
   */
  async toggleUpvote(
    challengeId: string,
    userId?: string
  ): Promise<{ upvoted: boolean; newCount: number }> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        // Check if already upvoted
        const { data: existing } = await supabase
          .from("challenge_upvotes")
          .select("challenge_id")
          .eq("challenge_id", challengeId)
          .eq("user_id", userId)
          .maybeSingle();

        if (existing) {
          // Remove upvote
          await supabase
            .from("challenge_upvotes")
            .delete()
            .eq("challenge_id", challengeId)
            .eq("user_id", userId);

          // Decrement challenge count
          const { data: updated } = await supabase.rpc("decrement_challenge_upvote", {
            target_challenge_id: challengeId,
          });

          // Or fallback update
          const { data: current } = await supabase
            .from("student_challenges")
            .select("upvotes_count")
            .eq("id", challengeId)
            .single();

          const count = Math.max(0, (current?.upvotes_count || 1) - 1);
          await supabase
            .from("student_challenges")
            .update({ upvotes_count: count })
            .eq("id", challengeId);

          return { upvoted: false, newCount: count };
        } else {
          // Insert upvote
          await supabase.from("challenge_upvotes").insert([{ challenge_id: challengeId, user_id: userId }]);

          const { data: current } = await supabase
            .from("student_challenges")
            .select("upvotes_count")
            .eq("id", challengeId)
            .single();

          const count = (current?.upvotes_count || 0) + 1;
          await supabase
            .from("student_challenges")
            .update({ upvotes_count: count })
            .eq("id", challengeId);

          return { upvoted: true, newCount: count };
        }
      } catch (err) {
        console.warn("Supabase toggle upvote error:", err);
      }
    }

    // Local fallback
    if (typeof window !== "undefined") {
      try {
        const upvotes: string[] = JSON.parse(localStorage.getItem(LOCAL_UPVOTES_KEY) || "[]");
        const isUpvoted = upvotes.includes(challengeId);
        let updatedUpvotes: string[];
        let countDelta = 0;

        if (isUpvoted) {
          updatedUpvotes = upvotes.filter((id) => id !== challengeId);
          countDelta = -1;
        } else {
          updatedUpvotes = [...upvotes, challengeId];
          countDelta = 1;
        }

        localStorage.setItem(LOCAL_UPVOTES_KEY, JSON.stringify(updatedUpvotes));

        // Update count in local challenges
        const challenges: StudentChallenge[] = JSON.parse(
          localStorage.getItem(LOCAL_CHALLENGES_KEY) || "[]"
        );
        let newCount = 0;
        const updatedChallenges = challenges.map((c) => {
          if (c.id === challengeId) {
            newCount = Math.max(0, (c.upvotes_count || 0) + countDelta);
            return { ...c, upvotes_count: newCount, user_has_upvoted: !isUpvoted };
          }
          return c;
        });

        localStorage.setItem(LOCAL_CHALLENGES_KEY, JSON.stringify(updatedChallenges));
        return { upvoted: !isUpvoted, newCount };
      } catch {}
    }

    return { upvoted: false, newCount: 0 };
  },

  /**
   * Fetch comments for a challenge
   */
  async getComments(challengeId: string): Promise<ChallengeComment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("challenge_comments")
          .select("*")
          .eq("challenge_id", challengeId)
          .order("created_at", { ascending: true });

        if (!error && data) {
          return data as ChallengeComment[];
        }
      } catch (err) {
        console.warn("Supabase get comments error:", err);
      }
    }

    // Fallback
    if (typeof window !== "undefined") {
      try {
        const commentsMap = JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || "{}");
        return commentsMap[challengeId] || [];
      } catch {}
    }
    return [];
  },

  /**
   * Add a comment to a challenge
   */
  async addComment(params: {
    challengeId: string;
    authorName: string;
    wilaya?: string;
    content: string;
    attachmentUrl?: string;
    userId?: string;
  }): Promise<{ success: boolean; comment?: ChallengeComment; error?: string }> {
    const payload = {
      challenge_id: params.challengeId,
      author_id: params.userId || null,
      author_name: params.authorName.trim().split(/\s+/)[0] || "طالب",
      wilaya: params.wilaya || null,
      content: params.content.trim(),
      attachment_url: params.attachmentUrl || null,
      is_solution_accepted: false,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("challenge_comments")
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          // Increment comments_count
          const { data: ch } = await supabase
            .from("student_challenges")
            .select("comments_count")
            .eq("id", params.challengeId)
            .single();

          if (ch) {
            await supabase
              .from("student_challenges")
              .update({ comments_count: (ch.comments_count || 0) + 1 })
              .eq("id", params.challengeId);
          }

          return { success: true, comment: data as ChallengeComment };
        }
        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }

    // Fallback
    const localComment: ChallengeComment = {
      ...payload,
      id: `local_com_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const commentsMap = JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || "{}");
        const list = commentsMap[params.challengeId] || [];
        commentsMap[params.challengeId] = [...list, localComment];
        localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(commentsMap));

        // Increment count
        const challenges: StudentChallenge[] = JSON.parse(
          localStorage.getItem(LOCAL_CHALLENGES_KEY) || "[]"
        );
        const updated = challenges.map((c) =>
          c.id === params.challengeId ? { ...c, comments_count: (c.comments_count || 0) + 1 } : c
        );
        localStorage.setItem(LOCAL_CHALLENGES_KEY, JSON.stringify(updated));
      } catch {}
    }

    return { success: true, comment: localComment };
  },

  /**
   * Delete a challenge (Author or Operator)
   */
  async deleteChallenge(challengeId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("student_challenges").delete().eq("id", challengeId);
        if (!error) return true;
      } catch (err) {
        console.error("Delete challenge error:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const challenges: StudentChallenge[] = JSON.parse(
          localStorage.getItem(LOCAL_CHALLENGES_KEY) || "[]"
        );
        const filtered = challenges.filter((c) => c.id !== challengeId);
        localStorage.setItem(LOCAL_CHALLENGES_KEY, JSON.stringify(filtered));
        return true;
      } catch {}
    }
    return false;
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, challengeId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("challenge_comments").delete().eq("id", commentId);
        if (!error) {
          // decrement count
          const { data: ch } = await supabase
            .from("student_challenges")
            .select("comments_count")
            .eq("id", challengeId)
            .single();
          if (ch) {
            await supabase
              .from("student_challenges")
              .update({ comments_count: Math.max(0, (ch.comments_count || 1) - 1) })
              .eq("id", challengeId);
          }
          return true;
        }
      } catch (err) {
        console.error("Delete comment error:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const commentsMap = JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || "{}");
        const list: ChallengeComment[] = commentsMap[challengeId] || [];
        commentsMap[challengeId] = list.filter((c) => c.id !== commentId);
        localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(commentsMap));
        return true;
      } catch {}
    }
    return false;
  },
};

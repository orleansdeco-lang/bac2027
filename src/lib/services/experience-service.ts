import { supabase, isSupabaseConfigured } from "../supabase/client";
import { BacExperience, CreateExperienceInput, ExperienceFilterState, ExperienceComment } from "@/types/experience";
import { CURATED_BAC_EXPERIENCES } from "@/data/experiences";

const LOCAL_STORAGE_KEY_EXPERIENCES = "bac_local_experiences";
const LOCAL_STORAGE_KEY_UPVOTES = "bac_upvoted_experiences";
const LOCAL_STORAGE_KEY_FAVORITES = "bac_favorite_experiences";
const LOCAL_STORAGE_KEY_COMMENTS_PREFIX = "bac_experience_comments_";

export const ExperienceService = {
  /**
   * Fetch experiences: Approved only for public view, supports Wilaya and stream filtering.
   */
  async getExperiences(
    filters?: Partial<ExperienceFilterState>,
    userStreamId?: string
  ): Promise<BacExperience[]> {
    let remoteExperiences: BacExperience[] = [];

    // Try API first
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams();
        if (filters?.streamId) params.set("streamId", filters.streamId);
        if (filters?.category) params.set("category", filters.category);
        if (filters?.searchQuery) params.set("searchQuery", filters.searchQuery);
        if (filters?.wilaya) params.set("wilaya", filters.wilaya);

        const res = await fetch(`/api/experiences?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.experiences) {
            remoteExperiences = data.experiences;
          }
        }
      } catch (err) {
        console.warn("API experiences fetch fallback to direct Supabase/seed:", err);
      }
    }

    if (remoteExperiences.length === 0 && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("bac_experiences")
          .select("*, experience_comments(count)")
          .eq("status", "approved")
          .order("upvotes_count", { ascending: false });

        if (!error && data && data.length > 0) {
          remoteExperiences = data.map((d: any) => ({
            id: d.id,
            author_id: d.author_id,
            author_name: d.author_name,
            author_role: d.author_role,
            candidate_type: d.candidate_type || "former_candidate",
            stream_id: d.stream_id,
            wilaya: d.wilaya || null,
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
        console.warn("ExperienceService direct Supabase error:", err);
      }
    }

    // Retrieve locally saved user contributions
    let localSubmissions: BacExperience[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_EXPERIENCES);
        if (stored) {
          localSubmissions = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse local experiences", e);
      }
    }

    // Merge and eliminate duplicates by id
    const map = new Map<string, BacExperience>();

    // 1. Curated seed data with Wilaya auto-extraction
    CURATED_BAC_EXPERIENCES.forEach((item) => {
      const match = item.author_name.match(/ولاية\s+([^)]+)/);
      const wilayaFromAuthor = match ? match[1].trim() : null;
      map.set(item.id, {
        ...item,
        wilaya: item.wilaya || wilayaFromAuthor,
        status: "approved",
        candidate_type: item.candidate_type || "former_candidate",
        passed_bac: item.passed_bac ?? true,
      });
    });

    // 2. Remote Supabase experiences
    remoteExperiences.forEach((item) => map.set(item.id, item));

    // 3. User's locally created submissions
    localSubmissions.forEach((item) => map.set(item.id, item));

    let list = Array.from(map.values()).filter((e) => (e.status || "approved") === "approved");

    // Apply upvotes stored locally
    if (typeof window !== "undefined") {
      try {
        const upvotedIds = this.getUpvotedIds();
        list = list.map((item) => {
          if (upvotedIds.includes(item.id)) {
            return {
              ...item,
              upvotes_count: Math.max(item.upvotes_count, 1),
            };
          }
          return item;
        });
      } catch {}
    }

    // Filter by Stream
    if (filters?.streamId && filters.streamId !== "all") {
      list = list.filter((e) => e.stream_id === filters.streamId);
    }

    // Filter by Category
    if (filters?.category) {
      if (filters.category === "top_achievers") {
        list = list.filter(
          (e) => (e.final_grade && e.final_grade >= 16.0) || e.author_role === "top_achiever"
        );
      } else if (filters.category === "repeater_success") {
        list = list.filter(
          (e) =>
            e.author_role === "repeater_success" ||
            (e.initial_grade !== null && e.initial_grade !== undefined) ||
            e.retaking_bac === true
        );
      } else if (filters.category === "current_students") {
        list = list.filter(
          (e) => e.candidate_type === "current_student" || e.author_role === "student"
        );
      } else if (filters.category === "top_upvoted") {
        list.sort((a, b) => b.upvotes_count - a.upvotes_count);
      }
    }

    // Filter by Wilaya
    if (filters?.wilaya && filters.wilaya !== "all") {
      const qWilaya = filters.wilaya.trim().toLowerCase();
      list = list.filter((e) => {
        const w = (e.wilaya || "").toLowerCase();
        const authorHasWilaya = e.author_name.toLowerCase().includes(qWilaya);
        return w.includes(qWilaya) || authorHasWilaya;
      });
    }

    // Filter by Search Query
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.author_name.toLowerCase().includes(q) ||
          e.biggest_trap.toLowerCase().includes(q) ||
          e.winning_routine.toLowerCase().includes(q) ||
          (e.target_major && e.target_major.toLowerCase().includes(q)) ||
          (e.university_major && e.university_major.toLowerCase().includes(q)) ||
          (e.best_resources && e.best_resources.toLowerCase().includes(q)) ||
          (e.wilaya && e.wilaya.toLowerCase().includes(q))
      );
    }

    // Filter by user target match
    if (filters?.onlyTargetMatch && userStreamId) {
      list = list.filter((e) => e.stream_id === userStreamId);
    }

    // Default sort: highest upvotes, then newest
    if (filters?.category !== "top_upvoted") {
      list.sort((a, b) => {
        if (b.upvotes_count !== a.upvotes_count) {
          return b.upvotes_count - a.upvotes_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return list;
  },

  /**
   * Submit a new BAC experience contribution.
   */
  async createExperience(
    input: CreateExperienceInput,
    userId?: string | null
  ): Promise<BacExperience> {
    const cleanFirstName = input.author_name.trim().split(/\s+/)[0] || "طالب";

    const newExperience: BacExperience = {
      id: `exp_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author_id: userId || null,
      author_name: cleanFirstName,
      author_role: input.author_role || "student",
      candidate_type: input.candidate_type || "former_candidate",
      stream_id: input.stream_id,
      wilaya: input.wilaya?.trim() || null,
      final_grade: input.final_grade !== undefined ? input.final_grade : null,
      initial_grade: input.initial_grade !== undefined ? input.initial_grade : null,
      target_major: input.target_major ? input.target_major.trim() : null,
      passed_bac: input.passed_bac !== undefined ? input.passed_bac : true,
      retaking_bac: input.retaking_bac !== undefined ? input.retaking_bac : false,
      university_major: input.university_major ? input.university_major.trim() : null,
      biggest_trap: input.biggest_trap.trim(),
      winning_routine: input.winning_routine.trim(),
      best_resources: input.best_resources ? input.best_resources.trim() : null,
      upvotes_count: 1,
      comments_count: 0,
      is_verified: false,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // Save locally
    if (typeof window !== "undefined") {
      try {
        const existing = localStorage.getItem(LOCAL_STORAGE_KEY_EXPERIENCES);
        const list: BacExperience[] = existing ? JSON.parse(existing) : [];
        list.unshift(newExperience);
        localStorage.setItem(LOCAL_STORAGE_KEY_EXPERIENCES, JSON.stringify(list));

        const upvotes = this.getUpvotedIds();
        if (!upvotes.includes(newExperience.id)) {
          upvotes.push(newExperience.id);
          localStorage.setItem(LOCAL_STORAGE_KEY_UPVOTES, JSON.stringify(upvotes));
        }
      } catch (err) {
        console.error("Failed to save experience locally", err);
      }
    }

    // Submit via API
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, author_name: cleanFirstName, userId }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.experience?.id) {
            newExperience.id = data.experience.id;
          }
        }
      } catch (err) {
        console.warn("API create experience fallback:", err);
      }
    }

    return newExperience;
  },

  /**
   * Fetch comments for an experience.
   */
  async getComments(experienceId: string): Promise<ExperienceComment[]> {
    let list: ExperienceComment[] = [];

    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/experiences/${encodeURIComponent(experienceId)}/comments`);
        if (res.ok) {
          const data = await res.json();
          if (data?.comments) {
            list = data.comments;
          }
        }
      } catch (err) {
        console.warn("Fetch comments error:", err);
      }

      // Check local storage fallback
      try {
        const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY_COMMENTS_PREFIX}${experienceId}`);
        if (stored) {
          const localList: ExperienceComment[] = JSON.parse(stored);
          const map = new Map<string, ExperienceComment>();
          list.forEach((c) => map.set(c.id, c));
          localList.forEach((c) => map.set(c.id, c));
          list = Array.from(map.values());
        }
      } catch {}
    }

    return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  /**
   * Add a comment to an experience with automatic Wilaya.
   */
  async addComment(
    experienceId: string,
    content: string,
    authorName: string,
    userId?: string | null,
    wilaya?: string | null
  ): Promise<ExperienceComment> {
    const cleanFirstName = authorName.trim().split(/\s+/)[0] || "طالب";
    const cleanWilaya = wilaya?.trim() || null;

    const newComment: ExperienceComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      experience_id: experienceId,
      author_id: userId || null,
      author_name: cleanFirstName,
      wilaya: cleanWilaya,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      // Save locally
      try {
        const key = `${LOCAL_STORAGE_KEY_COMMENTS_PREFIX}${experienceId}`;
        const stored = localStorage.getItem(key);
        const list: ExperienceComment[] = stored ? JSON.parse(stored) : [];
        list.push(newComment);
        localStorage.setItem(key, JSON.stringify(list));
      } catch {}

      // POST to API
      try {
        const res = await fetch(`/api/experiences/${encodeURIComponent(experienceId)}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content.trim(),
            authorName: cleanFirstName,
            userId,
            wilaya: cleanWilaya,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.comment?.id) {
            newComment.id = data.comment.id;
          }
        }
      } catch (err) {
        console.warn("API add comment fallback:", err);
      }
    }

    return newComment;
  },

  /**
   * Update comment content (by author or platform owner).
   */
  async updateComment(
    experienceId: string,
    commentId: string,
    content: string,
    userId?: string | null,
    userEmail?: string | null
  ): Promise<boolean> {
    const trimmed = content.trim();
    if (!trimmed) return false;

    if (typeof window !== "undefined") {
      // Update locally
      try {
        const key = `${LOCAL_STORAGE_KEY_COMMENTS_PREFIX}${experienceId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const list: ExperienceComment[] = JSON.parse(stored);
          const updated = list.map((c) =>
            c.id === commentId ? { ...c, content: trimmed, updated_at: new Date().toISOString() } : c
          );
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } catch {}

      // Call API
      try {
        const res = await fetch(`/api/experiences/${encodeURIComponent(experienceId)}/comments`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commentId, content: trimmed, userId, userEmail }),
        });
        return res.ok;
      } catch (err) {
        console.warn("API edit comment error:", err);
      }
    }
    return true;
  },

  /**
   * Delete comment (by author or platform owner).
   */
  async deleteComment(
    experienceId: string,
    commentId: string,
    userId?: string | null,
    userEmail?: string | null
  ): Promise<boolean> {
    if (typeof window !== "undefined") {
      // Remove locally
      try {
        const key = `${LOCAL_STORAGE_KEY_COMMENTS_PREFIX}${experienceId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const list: ExperienceComment[] = JSON.parse(stored);
          const filtered = list.filter((c) => c.id !== commentId);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch {}

      // Call API
      try {
        const res = await fetch(
          `/api/experiences/${encodeURIComponent(experienceId)}/comments?commentId=${encodeURIComponent(commentId)}&userId=${encodeURIComponent(userId || "")}&userEmail=${encodeURIComponent(userEmail || "")}`,
          { method: "DELETE" }
        );
        return res.ok;
      } catch (err) {
        console.warn("API delete comment error:", err);
      }
    }
    return true;
  },

  /**
   * Toggle upvote on an experience.
   */
  async toggleUpvote(
    experienceId: string,
    currentCount: number,
    userId?: string | null
  ): Promise<{ upvoted: boolean; count: number }> {
    const upvotedIds = this.getUpvotedIds();
    const isCurrentlyUpvoted = upvotedIds.includes(experienceId);
    const newUpvoted = !isCurrentlyUpvoted;
    const newCount = newUpvoted ? currentCount + 1 : Math.max(0, currentCount - 1);

    if (typeof window !== "undefined") {
      try {
        if (newUpvoted) {
          upvotedIds.push(experienceId);
        } else {
          const idx = upvotedIds.indexOf(experienceId);
          if (idx !== -1) upvotedIds.splice(idx, 1);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY_UPVOTES, JSON.stringify(upvotedIds));
      } catch (e) {
        console.error("Failed to persist upvote state", e);
      }
    }

    // Sync to Supabase if connected
    if (isSupabaseConfigured && supabase) {
      try {
        if (userId) {
          if (newUpvoted) {
            await supabase.from("experience_upvotes").insert({
              user_id: userId,
              experience_id: experienceId,
            });
          } else {
            await supabase
              .from("experience_upvotes")
              .delete()
              .eq("user_id", userId)
              .eq("experience_id", experienceId);
          }
        } else {
          await supabase
            .from("bac_experiences")
            .update({ upvotes_count: newCount })
            .eq("id", experienceId);
        }
      } catch (err) {
        console.warn("Supabase upvote sync skipped:", err);
      }
    }

    return { upvoted: newUpvoted, count: newCount };
  },

  getUpvotedIds(): string[] {
    if (typeof window !== "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_UPVOTES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  hasUserUpvoted(experienceId: string): boolean {
    return this.getUpvotedIds().includes(experienceId);
  },

  getFavoriteIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  isFavorite(experienceId: string): boolean {
    return this.getFavoriteIds().includes(experienceId);
  },

  toggleFavorite(experienceId: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      const favorites = this.getFavoriteIds();
      const idx = favorites.indexOf(experienceId);
      let isFav = false;
      if (idx !== -1) {
        favorites.splice(idx, 1);
        isFav = false;
      } else {
        favorites.push(experienceId);
        isFav = true;
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_FAVORITES, JSON.stringify(favorites));

      window.dispatchEvent(
        new CustomEvent("bac_favorites_updated", { detail: { experienceId, isFavorite: isFav } })
      );
      return isFav;
    } catch {
      return false;
    }
  },
};

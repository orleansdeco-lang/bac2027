import { supabase, isSupabaseConfigured } from "../supabase/client";
import { BacExperience, CreateExperienceInput, ExperienceFilterState } from "@/types/experience";
import { CURATED_BAC_EXPERIENCES } from "@/data/experiences";

const LOCAL_STORAGE_KEY_EXPERIENCES = "bac_local_experiences";
const LOCAL_STORAGE_KEY_UPVOTES = "bac_upvoted_experiences";
const LOCAL_STORAGE_KEY_FAVORITES = "bac_favorite_experiences";

export const ExperienceService = {
  /**
   * Fetch all experiences combining Supabase (if available), LocalStorage submissions, and Curated seed data.
   */
  async getExperiences(
    filters?: Partial<ExperienceFilterState>,
    userStreamId?: string
  ): Promise<BacExperience[]> {
    let remoteExperiences: BacExperience[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("bac_experiences")
          .select("*")
          .order("upvotes_count", { ascending: false });

        if (!error && data && data.length > 0) {
          remoteExperiences = data.map((d: any) => ({
            id: d.id,
            author_id: d.author_id,
            author_name: d.author_name,
            author_role: d.author_role,
            stream_id: d.stream_id,
            final_grade: d.final_grade ? Number(d.final_grade) : null,
            initial_grade: d.initial_grade ? Number(d.initial_grade) : null,
            target_major: d.target_major,
            biggest_trap: d.biggest_trap,
            winning_routine: d.winning_routine,
            best_resources: d.best_resources,
            upvotes_count: Number(d.upvotes_count || 0),
            is_verified: Boolean(d.is_verified),
            created_at: d.created_at || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn("ExperienceService: fallback to local seed data due to Supabase query error", err);
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

    // Priority 1: Curated seed data
    CURATED_BAC_EXPERIENCES.forEach((item) => map.set(item.id, item));

    // Priority 2: Remote Supabase experiences
    remoteExperiences.forEach((item) => map.set(item.id, item));

    // Priority 3: User's locally created submissions
    localSubmissions.forEach((item) => map.set(item.id, item));

    let list = Array.from(map.values());

    // Apply upvotes stored locally
    if (typeof window !== "undefined") {
      try {
        const upvotedIds = this.getUpvotedIds();
        list = list.map((item) => {
          if (upvotedIds.includes(item.id)) {
            // Ensure local upvote reflected if not already accounted for
            return {
              ...item,
              upvotes_count: Math.max(item.upvotes_count, 1),
            };
          }
          return item;
        });
      } catch {}
    }

    // Apply Filters
    if (filters) {
      const { streamId, category, searchQuery, onlyTargetMatch } = filters;

      // Stream filter
      if (onlyTargetMatch && userStreamId) {
        list = list.filter((item) => item.stream_id === userStreamId);
      } else if (streamId && streamId !== "all") {
        list = list.filter((item) => item.stream_id === streamId);
      }

      // Category filter
      if (category === "top_achievers") {
        list = list.filter(
          (item) => (item.final_grade && item.final_grade >= 16) || item.author_role === "top_achiever"
        );
      } else if (category === "repeater_success") {
        list = list.filter(
          (item) =>
            item.author_role === "repeater_success" ||
            (item.initial_grade !== null && item.initial_grade !== undefined)
        );
      } else if (category === "top_upvoted") {
        list.sort((a, b) => b.upvotes_count - a.upvotes_count);
      }

      // Search query
      if (searchQuery && searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase();
        list = list.filter(
          (item) =>
            item.author_name.toLowerCase().includes(q) ||
            (item.target_major && item.target_major.toLowerCase().includes(q)) ||
            item.biggest_trap.toLowerCase().includes(q) ||
            item.winning_routine.toLowerCase().includes(q) ||
            (item.best_resources && item.best_resources.toLowerCase().includes(q))
        );
      }
    }

    // Default sort: highest upvotes first, then recent
    if (filters?.category !== "top_upvoted") {
      list.sort((a, b) => b.upvotes_count - a.upvotes_count || (b.created_at > a.created_at ? 1 : -1));
    }

    return list;
  },

  /**
   * Create a new experience and persist to Supabase + LocalStorage.
   */
  async createExperience(
    input: CreateExperienceInput,
    userId?: string | null
  ): Promise<BacExperience> {
    const newExperience: BacExperience = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}`,
      author_id: userId || null,
      author_name: input.author_name.trim(),
      author_role: input.author_role,
      stream_id: input.stream_id,
      final_grade: input.final_grade ? Number(input.final_grade) : null,
      initial_grade: input.initial_grade ? Number(input.initial_grade) : null,
      target_major: input.target_major ? input.target_major.trim() : null,
      biggest_trap: input.biggest_trap.trim(),
      winning_routine: input.winning_routine.trim(),
      best_resources: input.best_resources ? input.best_resources.trim() : null,
      upvotes_count: 1, // Author automatically upvotes their own contribution
      is_verified: false,
      created_at: new Date().toISOString(),
    };

    // Save locally
    if (typeof window !== "undefined") {
      try {
        const existing = localStorage.getItem(LOCAL_STORAGE_KEY_EXPERIENCES);
        const list: BacExperience[] = existing ? JSON.parse(existing) : [];
        list.unshift(newExperience);
        localStorage.setItem(LOCAL_STORAGE_KEY_EXPERIENCES, JSON.stringify(list));

        // Auto-upvote locally for author
        const upvotes = this.getUpvotedIds();
        if (!upvotes.includes(newExperience.id)) {
          upvotes.push(newExperience.id);
          localStorage.setItem(LOCAL_STORAGE_KEY_UPVOTES, JSON.stringify(upvotes));
        }
      } catch (err) {
        console.error("Failed to save experience locally", err);
      }
    }

    // Save to Supabase if reachable
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("bac_experiences").insert({
          id: newExperience.id,
          author_id: newExperience.author_id,
          author_name: newExperience.author_name,
          author_role: newExperience.author_role,
          stream_id: newExperience.stream_id,
          final_grade: newExperience.final_grade,
          initial_grade: newExperience.initial_grade,
          target_major: newExperience.target_major,
          biggest_trap: newExperience.biggest_trap,
          winning_routine: newExperience.winning_routine,
          best_resources: newExperience.best_resources,
          upvotes_count: 1,
          is_verified: false,
        });

        if (error) {
          console.warn("Supabase insert error (stored in LocalStorage fallback):", error);
        }
      } catch (err) {
        console.warn("Supabase offline/error during insert:", err);
      }
    }

    return newExperience;
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
          // Fallback direct update for anonymous users if RPC/trigger not invoked
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
    if (typeof window === "undefined") return [];
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

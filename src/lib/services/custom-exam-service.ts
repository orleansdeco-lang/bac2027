import { supabase, isSupabaseConfigured } from "../supabase/client";
import { CustomExam, CustomExamInput } from "@/types/custom-exam";

const LOCAL_STORAGE_KEY = "shater_custom_exams_cache";

export const CustomExamService = {
  /**
   * Fetch all published custom exams (or all exams if operator)
   */
  async getCustomExams(filters?: {
    stream_id?: string;
    subject_id?: string;
    exam_type?: string;
    year?: number;
    term?: number;
    includeDrafts?: boolean;
  }): Promise<CustomExam[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from("custom_exams")
          .select("*")
          .order("created_at", { ascending: false });

        if (!filters?.includeDrafts) {
          query = query.eq("is_published", true);
        }

        if (filters?.stream_id && filters.stream_id !== "all") {
          query = query.or(`stream_id.eq.${filters.stream_id},stream_id.eq.all`);
        }
        if (filters?.subject_id && filters.subject_id !== "all") {
          query = query.eq("subject_id", filters.subject_id);
        }
        if (filters?.exam_type && filters.exam_type !== "all") {
          query = query.eq("exam_type", filters.exam_type);
        }
        if (filters?.year) {
          query = query.eq("year", filters.year);
        }
        if (filters?.term) {
          query = query.eq("term", filters.term);
        }

        const { data, error } = await query;
        if (!error && data) {
          // Update local cache
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            } catch {}
          }
          return data as CustomExam[];
        }
      } catch (err) {
        console.warn("Error querying custom_exams from Supabase:", err);
      }
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          let list: CustomExam[] = JSON.parse(stored);
          if (!filters?.includeDrafts) {
            list = list.filter((e) => e.is_published);
          }
          if (filters?.stream_id && filters.stream_id !== "all") {
            list = list.filter((e) => e.stream_id === filters.stream_id || e.stream_id === "all");
          }
          if (filters?.subject_id && filters.subject_id !== "all") {
            list = list.filter((e) => e.subject_id === filters.subject_id);
          }
          if (filters?.exam_type && filters.exam_type !== "all") {
            list = list.filter((e) => e.exam_type === filters.exam_type);
          }
          return list;
        }
      } catch {}
    }

    return [];
  },

  /**
   * Create a new custom exam (Ops No-Code upload)
   */
  async createCustomExam(input: CustomExamInput): Promise<{ success: boolean; data?: CustomExam; error?: string }> {
    const payload = {
      title: input.title.trim(),
      stream_id: input.stream_id,
      subject_id: input.subject_id,
      exam_type: input.exam_type,
      year: input.year,
      term: input.term || null,
      topic_name: input.topic_name?.trim() || null,
      school_name: input.school_name?.trim() || null,
      wilaya: input.wilaya?.trim() || null,
      file_url: input.file_url,
      solution_url: input.solution_url?.trim() || null,
      has_solution: input.has_solution,
      difficulty: input.difficulty || "standard",
      is_published: input.is_published ?? true,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("custom_exams")
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          return { success: true, data: data as CustomExam };
        }
        if (error) {
          console.error("Supabase insert error:", error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error("CustomExamService insert exception:", err);
      }
    }

    // Local fallback
    const localExam: CustomExam = {
      ...payload,
      id: `local_exam_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([localExam, ...existing]));
      } catch {}
    }

    return { success: true, data: localExam };
  },

  /**
   * Delete a custom exam
   */
  async deleteCustomExam(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("custom_exams").delete().eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Failed to delete exam from Supabase:", err);
      }
    }

    // Fallback remove from localStorage
    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        const filtered = existing.filter((e: CustomExam) => e.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
        return true;
      } catch {}
    }
    return false;
  },

  /**
   * Toggle published state
   */
  async togglePublished(id: string, currentStatus: boolean): Promise<boolean> {
    const nextStatus = !currentStatus;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("custom_exams")
          .update({ is_published: nextStatus, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (!error) return true;
      } catch (err) {
        console.error("Failed to toggle exam published in Supabase:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        const updated = existing.map((e: CustomExam) =>
          e.id === id ? { ...e, is_published: nextStatus } : e
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return true;
      } catch {}
    }
    return false;
  },
};

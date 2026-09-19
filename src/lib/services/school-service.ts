import { supabase, isSupabaseConfigured } from "../supabase/client";
import { createServerSupabaseClient, createAdminSupabaseClient } from "../supabase/server";
import {
  HighSchool,
  HighSchoolSubmission,
  HighSchoolSubmissionStatus,
  CreateSchoolSubmissionInput,
  SchoolSearchParams,
} from "@/types/school";
import { CURATED_OFFICIAL_HIGH_SCHOOLS } from "@/data/schools";
import { normalizeSchoolName } from "@/domain/administrative/school-normalization";
import {
  getWilayaByCode,
  getCommunesByWilayaCode,
} from "@/domain/administrative/algeria-administrative";

const LOCAL_STORAGE_KEY_SUBMISSIONS = "shater_school_submissions";

// In-memory fallback for local mock / dev mode without remote DB writes
const inMemorySubmissions: HighSchoolSubmission[] = [];

export const SchoolService = {
  /**
   * Search verified high schools in a specific wilaya & commune with optional query & pagination.
   * Prevents full-table client dumping.
   */
  async searchSchools(params: SchoolSearchParams): Promise<{ schools: HighSchool[]; total: number }> {
    const { wilaya_code, commune_name_ar, query, limit = 20, offset = 0 } = params;
    const normalizedQuery = query ? normalizeSchoolName(query) : "";

    let remoteSchools: HighSchool[] = [];
    let remoteTotal = 0;
    let queryFailed = false;

    // 1. Attempt Supabase query if configured
    if (isSupabaseConfigured && supabase) {
      try {
        let dbQuery = supabase
          .from("high_schools")
          .select("*", { count: "exact" })
          .eq("wilaya_code", wilaya_code)
          .eq("commune_name_ar", commune_name_ar)
          .eq("is_verified", true);

        if (query && query.trim()) {
          const rawTrimmed = query.trim();
          // Filter by Arabic name or French name
          dbQuery = dbQuery.or(`name.ilike.%${rawTrimmed}%,name_fr.ilike.%${rawTrimmed}%`);
        }

        dbQuery = dbQuery.order("name", { ascending: true }).range(offset, offset + limit - 1);

        const { data, count, error } = await dbQuery;

        if (!error && data) {
          remoteSchools = data as HighSchool[];
          remoteTotal = count || data.length;
        } else if (error) {
          queryFailed = true;
          console.warn("SchoolService.searchSchools Supabase error:", error.message);
        }
      } catch (err) {
        queryFailed = true;
        console.warn("SchoolService.searchSchools network error:", err);
      }
    }

    // 2. If Supabase succeeded with results, return them
    if (!queryFailed && remoteSchools.length > 0) {
      return { schools: remoteSchools, total: remoteTotal };
    }

    // 3. Fallback / supplementary search using curated high schools
    let filtered = CURATED_OFFICIAL_HIGH_SCHOOLS.filter(
      (s) => s.wilaya_code === wilaya_code && s.commune_name_ar === commune_name_ar && s.is_verified
    );

    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      filtered = filtered.filter((s) => {
        return (
          s.name.includes(query.trim()) ||
          (s.name_fr && s.name_fr.toLowerCase().includes(qLower)) ||
          s.name_normalized.includes(normalizedQuery)
        );
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return { schools: paginated, total };
  },

  /**
   * Check if a school name already exists in the official verified directory
   * or is already submitted and pending review.
   */
  async checkDuplicate(
    proposedName: string,
    wilayaCode: string,
    communeNameAr: string
  ): Promise<{
    existsInOfficial: boolean;
    alreadyPending: boolean;
    officialSchool?: HighSchool;
    pendingSubmission?: HighSchoolSubmission;
  }> {
    const normalized = normalizeSchoolName(proposedName);

    // 1. Check in official verified schools (Supabase)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: officialData } = await supabase
          .from("high_schools")
          .select("*")
          .eq("wilaya_code", wilayaCode)
          .eq("commune_name_ar", communeNameAr)
          .ilike("name", `%${proposedName.trim()}%`)
          .limit(1);

        if (officialData && officialData.length > 0) {
          return {
            existsInOfficial: true,
            alreadyPending: false,
            officialSchool: officialData[0] as HighSchool,
          };
        }

        // Check in pending submissions
        const { data: pendingData } = await supabase
          .from("high_school_submissions")
          .select("*")
          .eq("wilaya_code", wilayaCode)
          .eq("commune_name_ar", communeNameAr)
          .eq("status", "pending")
          .limit(10);

        if (pendingData && pendingData.length > 0) {
          const match = pendingData.find(
            (p: any) =>
              p.proposed_name_normalized === normalized ||
              normalizeSchoolName(p.proposed_name) === normalized
          );
          if (match) {
            return {
              existsInOfficial: false,
              alreadyPending: true,
              pendingSubmission: match as HighSchoolSubmission,
            };
          }
        }
      } catch (e) {
        console.warn("SchoolService.checkDuplicate remote query error, falling back to local:", e);
      }
    }

    // 2. Fallback check in local curated official schools
    const officialMatch = CURATED_OFFICIAL_HIGH_SCHOOLS.find(
      (s) =>
        s.wilaya_code === wilayaCode &&
        s.commune_name_ar === communeNameAr &&
        (s.name_normalized === normalized || normalizeSchoolName(s.name) === normalized)
    );

    if (officialMatch) {
      return {
        existsInOfficial: true,
        alreadyPending: false,
        officialSchool: officialMatch,
      };
    }

    // Check in-memory & localStorage submissions
    const allLocalSubmissions = this.getLocalSubmissions();
    const pendingMatch = allLocalSubmissions.find(
      (sub) =>
        sub.wilaya_code === wilayaCode &&
        sub.commune_name_ar === communeNameAr &&
        (sub.proposed_name_normalized === normalized ||
          normalizeSchoolName(sub.proposed_name) === normalized) &&
        sub.status === "pending"
    );

    if (pendingMatch) {
      return {
        existsInOfficial: false,
        alreadyPending: true,
        pendingSubmission: pendingMatch,
      };
    }

    return {
      existsInOfficial: false,
      alreadyPending: false,
    };
  },

  /**
   * Submit an unlisted school for administrative review.
   * Performs strict validation and duplicate checks before insertion into high_school_submissions.
   */
  async submitSchool(
    input: CreateSchoolSubmissionInput,
    userId?: string | null
  ): Promise<{
    success: boolean;
    submission?: HighSchoolSubmission;
    error?: string;
  }> {
    const rawName = input.proposed_name?.trim();
    if (!rawName || rawName.length < 3) {
      return { success: false, error: "اسم الثانوية يجب أن يتكون من 3 أحرف على الأقل." };
    }

    // Validate Wilaya
    const wilaya = getWilayaByCode(input.wilaya_code);
    if (!wilaya) {
      return { success: false, error: "رمز الولاية غير صالح." };
    }

    // Validate Commune belongs to Wilaya
    const communes = getCommunesByWilayaCode(input.wilaya_code);
    const communeValid = communes.some((c) => c.name_ar === input.commune_name_ar);
    if (!communeValid) {
      return { success: false, error: "البلدية المحددة لا تنتمي إلى هذه الولاية." };
    }

    // Duplicate Check
    const dupCheck = await this.checkDuplicate(rawName, input.wilaya_code, input.commune_name_ar);
    if (dupCheck.existsInOfficial) {
      return {
        success: false,
        error: "الثانوية موجودة بالفعل، ابحث عنها في القائمة.",
      };
    }
    if (dupCheck.alreadyPending) {
      return {
        success: false,
        error: "هذه الثانوية قيد المراجعة حالياً.",
      };
    }

    const normalized = normalizeSchoolName(rawName);
    const newSubmission: HighSchoolSubmission = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`,
      submitted_by: userId || null,
      proposed_name: rawName,
      proposed_name_normalized: normalized,
      wilaya_code: input.wilaya_code,
      wilaya_name_ar: input.wilaya_name_ar || wilaya.name_ar,
      commune_name_ar: input.commune_name_ar,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // Insert to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("high_school_submissions")
          .insert({
            id: newSubmission.id,
            submitted_by: newSubmission.submitted_by,
            proposed_name: newSubmission.proposed_name,
            proposed_name_normalized: newSubmission.proposed_name_normalized,
            wilaya_code: newSubmission.wilaya_code,
            wilaya_name_ar: newSubmission.wilaya_name_ar,
            commune_name_ar: newSubmission.commune_name_ar,
            status: "pending",
          })
          .select()
          .single();

        if (!error && data) {
          // Also save locally so in-memory cache is synced
          this.saveLocalSubmission(data as HighSchoolSubmission);
          return { success: true, submission: data as HighSchoolSubmission };
        }
        if (error) {
          if (error.code === "23505") {
            return { success: false, error: "هذه الثانوية قيد المراجعة حالياً." };
          }
          console.warn("SchoolService.submitSchool insert error:", error.message);
        }
      } catch (err) {
        console.warn("SchoolService.submitSchool remote insert failed:", err);
      }
    }

    // Save locally
    this.saveLocalSubmission(newSubmission);
    return { success: true, submission: newSubmission };
  },

  /**
   * OPERATIONS / ADMIN: Get all submissions filtered by status.
   */
  async getSubmissions(status?: HighSchoolSubmissionStatus): Promise<HighSchoolSubmission[]> {
    let remoteSubmissions: HighSchoolSubmission[] = [];

    const adminClient = createAdminSupabaseClient() || supabase;
    if (isSupabaseConfigured && adminClient) {
      try {
        let query = adminClient
          .from("high_school_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (status) {
          query = query.eq("status", status);
        }

        const { data, error } = await query;
        if (!error && data) {
          remoteSubmissions = data as HighSchoolSubmission[];
        } else if (error) {
          console.warn("SchoolService.getSubmissions Supabase error:", error.message);
        }
      } catch (err) {
        console.warn("SchoolService.getSubmissions query failed:", err);
      }
    }

    // Merge with local submissions
    const local = this.getLocalSubmissions();
    const map = new Map<string, HighSchoolSubmission>();

    // Priority: local first, then remote
    local.forEach((sub) => {
      if (!status || sub.status === status) {
        map.set(sub.id, sub);
      }
    });

    remoteSubmissions.forEach((sub) => {
      if (!status || sub.status === status) {
        map.set(sub.id, sub);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * OPERATIONS / ADMIN: Approve a submission.
   * Calls transactional stored procedure `approve_high_school_submission` if available,
   * or creates verified high school and updates submission status.
   */
  async approveSubmission(
    submissionId: string,
    reviewerUserId?: string
  ): Promise<{ success: boolean; newSchoolId?: string; error?: string }> {
    const adminClient = createAdminSupabaseClient() || supabase;

    if (isSupabaseConfigured && adminClient) {
      try {
        // Try calling the stored procedure
        const { data: rpcData, error: rpcError } = await adminClient.rpc(
          "approve_high_school_submission",
          {
            target_submission_id: submissionId,
            reviewer_user_id: reviewerUserId || null,
          }
        );

        if (!rpcError && rpcData) {
          return { success: true, newSchoolId: rpcData as string };
        }

        // If RPC not found or fails, do manual transactional fallback
        const { data: sub, error: subErr } = await adminClient
          .from("high_school_submissions")
          .select("*")
          .eq("id", submissionId)
          .single();

        if (!subErr && sub) {
          // Insert into high_schools
          const { data: newSchool, error: insErr } = await adminClient
            .from("high_schools")
            .insert({
              name: sub.proposed_name,
              name_normalized: sub.proposed_name_normalized,
              wilaya_code: sub.wilaya_code,
              wilaya_name_ar: sub.wilaya_name_ar,
              commune_name_ar: sub.commune_name_ar,
              is_verified: true,
              verification_status: "verified",
              source: "user_submission",
              source_ref: sub.id,
            })
            .select()
            .single();

          if (!insErr) {
            // Update submission
            await adminClient
              .from("high_school_submissions")
              .update({
                status: "approved",
                reviewed_by: reviewerUserId || null,
                reviewed_at: new Date().toISOString(),
              })
              .eq("id", submissionId);

            return { success: true, newSchoolId: newSchool?.id };
          }
        }
      } catch (err: any) {
        console.warn("SchoolService.approveSubmission remote error, falling back to local:", err);
      }
    }

    // Local in-memory / localStorage approval fallback
    const local = this.getLocalSubmissions();
    const item = local.find((s) => s.id === submissionId);
    if (!item) {
      return { success: false, error: "الطلب غير موجود." };
    }

    item.status = "approved";
    item.reviewed_by = reviewerUserId || "ops-admin";
    item.reviewed_at = new Date().toISOString();
    this.updateLocalSubmission(item);

    // Also add to curated in-memory schools
    const newLocalSchool: HighSchool = {
      id: `sch-${Date.now()}`,
      name: item.proposed_name,
      name_normalized: item.proposed_name_normalized,
      wilaya_code: item.wilaya_code,
      wilaya_name_ar: item.wilaya_name_ar,
      commune_name_ar: item.commune_name_ar,
      is_verified: true,
      verification_status: "verified",
      source: "user_submission",
      source_ref: item.id,
      created_at: new Date().toISOString(),
    };
    CURATED_OFFICIAL_HIGH_SCHOOLS.push(newLocalSchool);

    return { success: true, newSchoolId: newLocalSchool.id };
  },

  /**
   * OPERATIONS / ADMIN: Reject a submission with optional note.
   */
  async rejectSubmission(
    submissionId: string,
    reviewerUserId?: string,
    adminNote?: string
  ): Promise<{ success: boolean; error?: string }> {
    const adminClient = createAdminSupabaseClient() || supabase;

    if (isSupabaseConfigured && adminClient) {
      try {
        const { error } = await adminClient
          .from("high_school_submissions")
          .update({
            status: "rejected",
            admin_note: adminNote || null,
            reviewed_by: reviewerUserId || null,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", submissionId);

        if (!error) {
          return { success: true };
        }
      } catch (err: any) {
        console.warn("SchoolService.rejectSubmission remote error, falling back to local:", err);
      }
    }

    const local = this.getLocalSubmissions();
    const item = local.find((s) => s.id === submissionId);
    if (item) {
      item.status = "rejected";
      item.admin_note = adminNote || null;
      item.reviewed_by = reviewerUserId || "ops-admin";
      item.reviewed_at = new Date().toISOString();
      this.updateLocalSubmission(item);
      return { success: true };
    }

    return { success: false, error: "الطلب غير موجود." };
  },

  /**
   * OPERATIONS / ADMIN: Mark a submission as duplicate.
   */
  async markAsDuplicate(
    submissionId: string,
    reviewerUserId?: string,
    adminNote?: string
  ): Promise<{ success: boolean; error?: string }> {
    const adminClient = createAdminSupabaseClient() || supabase;

    if (isSupabaseConfigured && adminClient) {
      try {
        const { error } = await adminClient
          .from("high_school_submissions")
          .update({
            status: "duplicate",
            admin_note: adminNote || "مكررة مع ثانوية معتمدة أخرى",
            reviewed_by: reviewerUserId || null,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", submissionId);

        if (!error) {
          return { success: true };
        }
      } catch (err: any) {
        console.warn("SchoolService.markAsDuplicate remote error, falling back to local:", err);
      }
    }

    const local = this.getLocalSubmissions();
    const item = local.find((s) => s.id === submissionId);
    if (item) {
      item.status = "duplicate";
      item.admin_note = adminNote || "مكررة";
      item.reviewed_by = reviewerUserId || "ops-admin";
      item.reviewed_at = new Date().toISOString();
      this.updateLocalSubmission(item);
      return { success: true };
    }

    return { success: false, error: "الطلب غير موجود." };
  },

  // --- Local Storage & In-Memory Helpers ---

  getLocalSubmissions(): HighSchoolSubmission[] {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SUBMISSIONS);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.error("Failed to read local school submissions", e);
      }
    }
    return [...inMemorySubmissions];
  },

  saveLocalSubmission(sub: HighSchoolSubmission) {
    inMemorySubmissions.push(sub);
    if (typeof window !== "undefined") {
      try {
        const list = this.getLocalSubmissions();
        list.push(sub);
        localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(list));
      } catch (e) {
        console.error("Failed to save local school submission", e);
      }
    }
  },

  updateLocalSubmission(updated: HighSchoolSubmission) {
    const memIdx = inMemorySubmissions.findIndex((s) => s.id === updated.id);
    if (memIdx >= 0) inMemorySubmissions[memIdx] = updated;

    if (typeof window !== "undefined") {
      try {
        const list = this.getLocalSubmissions();
        const idx = list.findIndex((s) => s.id === updated.id);
        if (idx >= 0) {
          list[idx] = updated;
          localStorage.setItem(LOCAL_STORAGE_KEY_SUBMISSIONS, JSON.stringify(list));
        }
      } catch (e) {
        console.error("Failed to update local school submission", e);
      }
    }
  },
};

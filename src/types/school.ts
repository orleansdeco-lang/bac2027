export type HighSchoolVerificationStatus = "verified" | "pending" | "rejected";
export type HighSchoolSource = "ministry_directory" | "user_submission" | "admin_import";
export type HighSchoolSubmissionStatus = "pending" | "approved" | "rejected" | "duplicate";

export interface HighSchool {
  id: string;
  name: string;
  name_fr?: string | null;
  name_normalized: string;
  wilaya_code: string;
  wilaya_name_ar: string;
  commune_name_ar: string;
  is_verified: boolean;
  verification_status: HighSchoolVerificationStatus;
  source: HighSchoolSource;
  source_ref?: string | null;
  created_at: string;
}

export interface HighSchoolSubmission {
  id: string;
  submitted_by?: string | null;
  proposed_name: string;
  proposed_name_normalized: string;
  wilaya_code: string;
  wilaya_name_ar: string;
  commune_name_ar: string;
  status: HighSchoolSubmissionStatus;
  admin_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  // Optional metadata populated in admin view
  submitter_email?: string | null;
  submitter_name?: string | null;
}

export interface CreateSchoolSubmissionInput {
  proposed_name: string;
  wilaya_code: string;
  wilaya_name_ar: string;
  commune_name_ar: string;
}

export interface SchoolSearchParams {
  wilaya_code: string;
  commune_name_ar: string;
  query?: string;
  limit?: number;
  offset?: number;
}

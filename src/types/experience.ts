export type ExperienceRole = "top_achiever" | "repeater_success" | "student";

export type ExperienceCategory = "all" | "top_achievers" | "repeater_success" | "current_students" | "top_upvoted";

export type ExperienceStatus = "pending" | "approved" | "rejected";

export type CandidateType = "current_student" | "former_candidate";

export interface ExperienceComment {
  id: string;
  experience_id: string;
  author_id?: string | null;
  author_name: string;
  wilaya?: string | null;
  content: string;
  created_at: string;
  updated_at?: string | null;
}

export interface BacExperience {
  id: string;
  title?: string;
  author_id?: string | null;
  author_name: string;
  author_role: ExperienceRole;
  candidate_type?: CandidateType;
  stream_id: string;
  wilaya?: string | null;
  final_grade?: number | null;
  initial_grade?: number | null;
  target_major?: string | null;
  passed_bac?: boolean | null;
  retaking_bac?: boolean | null;
  university_major?: string | null;
  biggest_trap: string;
  winning_routine: string;
  best_resources?: string | null;
  upvotes_count: number;
  comments_count?: number;
  comments?: ExperienceComment[];
  is_verified: boolean;
  status?: ExperienceStatus;
  created_at: string;
}

export interface CreateExperienceInput {
  title?: string;
  author_name: string;
  author_role?: ExperienceRole;
  candidate_type?: CandidateType;
  stream_id: string;
  wilaya?: string | null;
  final_grade?: number | null;
  initial_grade?: number | null;
  target_major?: string | null;
  passed_bac?: boolean | null;
  retaking_bac?: boolean | null;
  university_major?: string | null;
  biggest_trap: string;
  winning_routine: string;
  best_resources?: string | null;
}

export interface ExperienceFilterState {
  streamId: string;
  category: ExperienceCategory;
  searchQuery: string;
  onlyTargetMatch: boolean;
  wilaya?: string;
}

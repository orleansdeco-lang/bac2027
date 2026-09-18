export type ExperienceRole = "top_achiever" | "repeater_success" | "student";

export type ExperienceCategory = "all" | "top_achievers" | "repeater_success" | "top_upvoted";

export interface BacExperience {
  id: string;
  author_id?: string | null;
  author_name: string;
  author_role: ExperienceRole;
  stream_id: string;
  final_grade?: number | null;
  initial_grade?: number | null;
  target_major?: string | null;
  biggest_trap: string;
  winning_routine: string;
  best_resources?: string | null;
  upvotes_count: number;
  is_verified: boolean;
  created_at: string;
}

export interface CreateExperienceInput {
  author_name: string;
  author_role: ExperienceRole;
  stream_id: string;
  final_grade?: number | null;
  initial_grade?: number | null;
  target_major?: string | null;
  biggest_trap: string;
  winning_routine: string;
  best_resources?: string | null;
}

export interface ExperienceFilterState {
  streamId: string;
  category: ExperienceCategory;
  searchQuery: string;
  onlyTargetMatch: boolean;
}

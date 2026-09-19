export type ChallengeDifficulty = "normal" | "medium" | "hard" | "genius";
export type ChallengeFileType = "none" | "image" | "pdf";
export type ChallengeStatus = "approved" | "pending" | "hidden";

export interface StudentChallenge {
  id: string;
  author_id?: string | null;
  author_name: string;
  wilaya?: string | null;
  stream_id: string;
  subject_id: string;
  topic_name?: string | null;
  title: string;
  content_text?: string | null;
  file_url?: string | null;
  file_type: ChallengeFileType;
  has_solution: boolean;
  solution_text?: string | null;
  solution_file_url?: string | null;
  difficulty_level: ChallengeDifficulty;
  upvotes_count: number;
  comments_count: number;
  status: ChallengeStatus;
  created_at: string;
  updated_at: string;
  user_has_upvoted?: boolean;
}

export interface ChallengeInput {
  author_name: string;
  wilaya?: string;
  stream_id: string;
  subject_id: string;
  topic_name?: string;
  title: string;
  content_text?: string;
  file_url?: string;
  file_type: ChallengeFileType;
  has_solution: boolean;
  solution_text?: string;
  solution_file_url?: string;
  difficulty_level: ChallengeDifficulty;
}

export interface ChallengeComment {
  id: string;
  challenge_id: string;
  author_id?: string | null;
  author_name: string;
  wilaya?: string | null;
  content: string;
  attachment_url?: string | null;
  is_solution_accepted: boolean;
  created_at: string;
}

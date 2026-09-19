export type CustomExamType =
  | "official_bac"
  | "term_1"
  | "term_2"
  | "term_3"
  | "mock_exam";

export type CustomExamDifficulty = "standard" | "advanced" | "challenge";

export interface CustomExam {
  id: string;
  title: string;
  stream_id: string;
  subject_id: string;
  exam_type: CustomExamType;
  year: number;
  term?: number | null; // 1, 2, 3
  topic_name?: string | null;
  school_name?: string | null;
  wilaya?: string | null;
  file_url: string;
  solution_url?: string | null;
  has_solution: boolean;
  difficulty: CustomExamDifficulty;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface CustomExamInput {
  title: string;
  stream_id: string;
  subject_id: string;
  exam_type: CustomExamType;
  year: number;
  term?: number | null;
  topic_name?: string;
  school_name?: string;
  wilaya?: string;
  file_url: string;
  solution_url?: string;
  has_solution: boolean;
  difficulty: CustomExamDifficulty;
  is_published?: boolean;
}

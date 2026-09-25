/**
 * Campus & 3D Majlis ("فضاء مجالس العلم وبنك التجارب") Types
 * Designed for Algerian Baccalaureate Students
 */

import { SubjectId, StreamId } from "./education";

export type CampusPostType = 
  | "EXPERIENCE"           // تجارب ونصائح
  | "SUMMARY"              // ملخصات ودروس وخرائط ذهنية
  | "TRICKY_EXAM_PROBLEM"; // أفكار تمارين وفخاخ وزارية

export interface CampusPostAttachment {
  type: "image" | "pdf" | "link";
  url: string;
  label: string;
}

export interface CampusPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorStream: StreamId;
  authorBadge?: string;
  type: CampusPostType;
  title: string;
  content: string;
  stream: StreamId | "ALL";
  subjectId: SubjectId | "ALL";
  lesson: string;
  tags: string[];
  likesCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  attachments?: CampusPostAttachment[];
  createdAt: string;
}

export type MajlisActivityMode = 
  | "PAPER_PRACTICE"       // التمارين الكتابية (حل على الكراس + سلم التنقيط)
  | "DIGITAL_QUIZ"         // التحديات والألعاب التعليمية (كويز تنافسي مباشر)
  | "GROUP_MEMORIZATION";  // جلسة الحفظ الموحد (استرجاع نشط وتسميع)

export type MajlisTableStatus = "LOBBY" | "ACTIVE" | "COMPLETED";

export type SeatStatus = "SOLVING" | "FINISHED" | "MEMORIZING" | "READY" | "IDLE";

export interface MajlisSeat {
  seatIndex: number;
  studentId: string;
  studentName: string;
  avatar: string;
  stream: StreamId;
  status: SeatStatus;
  statusPill: string;       // e.g. "يحل الآن ✍️", "أنهى الحل ✅", "يحفظ 🧠"
  timerSeconds: number;
  selfAssessment?: "CORRECT" | "PARTIAL" | "INCORRECT";
  quizScore?: number;
  joinedAt: string;
}

export interface RubricItem {
  criterion: string;
  points: number;
}

export interface PaperProblemMaterial {
  title: string;
  source: string; // e.g. "بكالوريا 2022 - الموضوع الأول"
  problemText: string;
  formulaLatex?: string;
  hint?: string;
  solutionText: string;
  rubric: RubricItem[];
  totalPoints: number;
}

export interface QuizQuestionMaterial {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  rubricTag?: string;
}

export interface MemorizationItem {
  term: string;
  definition: string;
  keyKeywords: string[];
}

export interface RecallQuestion {
  prompt: string;
  expectedAnswer: string;
  keyKeywords: string[];
}

export interface MemorizationMaterial {
  title: string;
  category: "dates" | "definitions" | "islamic" | "figures";
  originalItems: MemorizationItem[];
  recallQuestions: RecallQuestion[];
}

export interface TableActiveMaterial {
  problemSheet?: PaperProblemMaterial;
  quizQuestions?: QuizQuestionMaterial[];
  currentQuestionIndex?: number;
  memorizationContent?: MemorizationMaterial;
}

export type PaperPhase = "READING_SOLVING" | "REVEAL_SCORING" | "WRAP_UP";
export type QuizPhase = "QUESTION_ACTIVE" | "ROUND_LEADERBOARD" | "FINAL_LEADERBOARD";
export type MemorizationPhase = "MEMORIZING" | "ACTIVE_RECALL_TEST" | "SUMMARY";

export type TablePhase = PaperPhase | QuizPhase | MemorizationPhase;

export interface MajlisTable {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  stream: StreamId;
  subjectId: SubjectId;
  lesson: string;
  mode: MajlisActivityMode;
  capacity: number; // 2 to 8 seats
  seats: (MajlisSeat | null)[];
  status: MajlisTableStatus;
  currentPhase: TablePhase;
  timeRemainingSeconds: number;
  durationMinutes: number;
  activeMaterial: TableActiveMaterial;
  createdAt: string;
  spectatorsCount?: number;
}

export interface CampusBagItem {
  id: string;
  userId: string;
  postId: string;
  title: string;
  type: CampusPostType;
  stream: StreamId | "ALL";
  subjectId: SubjectId | "ALL";
  lesson: string;
  savedAt: string;
}

/**
 * AI BAC Tutor ("الأستاذ الذكي") Types & Contracts
 */

export type TutorMode =
  | "explain"       // اشرحلي درس / فكرة صعبة
  | "recite"        // التسميع الذكي (تواريخ، مصطلحات، مقاصد، نصوص)
  | "feynman"       // تقنية فاينمان (اشرحلي ونقيّمك)
  | "quiz"          // سؤال وجواب سريع (Flash Quiz 3 أسئلة)
  | "methodology"   // تدريب على المنهجية الرسمية (علوم / فلسفة)
  | "task"          // اعطيني تمرين ومهمة لليوم
  | "general";      // محادثة بيداغوجية عامة

export interface TutorTask {
  id?: string;
  title: string;
  subjectId: string;
  minutes: number;
  reason: string;
  sourceExam?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  mode?: TutorMode;
  suggestedTask?: TutorTask | null;
  taskAdded?: boolean;
}

export interface TutorRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  mode?: TutorMode;
  streamId?: string;
  subjectId?: string;
  lessonContext?: string;
  clientApiKey?: string;
}

export interface TutorResponse {
  reply: string;
  suggestedTask?: TutorTask | null;
  mode?: TutorMode;
  provider: "gemini" | "local_expert";
}

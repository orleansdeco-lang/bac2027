import { z } from "zod";

export const CampusPostSchema = z.object({
  type: z.enum(["EXPERIENCE", "SUMMARY", "TRICKY_EXAM_PROBLEM"]),
  title: z
    .string()
    .min(3, "عنوان المنشور يجب أن يتكون من 3 أحرف على الأقل")
    .max(200, "عنوان المنشور يجب ألا يتجاوز 200 حرف"),
  content: z
    .string()
    .min(10, "محتوى المنشور يجب أن يتكون من 10 أحرف على الأقل")
    .max(10000, "محتوى المنشور طويل جداً"),
  stream: z.string().default("ALL"),
  subjectId: z.string().default("ALL"),
  lesson: z.string().min(2, "اسم الدرس يجب أن يتكون من حرفين على الأقل").max(100),
  tags: z.array(z.string().max(40)).default([]),
});

export const CreateTableSchema = z.object({
  title: z
    .string()
    .min(3, "عنوان الطاولة يجب أن يتكون من 3 أحرف على الأقل")
    .max(150, "عنوان الطاولة يجب ألا يتجاوز 150 حرف"),
  stream: z.enum([
    "sciences_exp",
    "math",
    "technique_math",
    "lettres_philo",
    "gestion_eco",
    "langues_etrangeres",
  ]),
  subjectId: z.string().min(2),
  lesson: z.string().min(2, "اسم الدرس يجب ألا يقل عن حرفين").max(100),
  mode: z.enum(["PAPER_PRACTICE", "DIGITAL_QUIZ", "GROUP_MEMORIZATION"]),
  capacity: z.number().int().min(2).max(8).default(6),
});

export const JoinTableSchema = z.object({
  seatIndex: z.number().int().min(0).max(7),
  student: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
      stream: z.string().optional(),
    })
    .optional(),
});

export const TutorRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1, "يجب إرسال رسالة واحدة على الأقل"),
  mode: z
    .enum(["explain", "recite", "task", "methodology", "feynman", "quiz", "general"])
    .default("general"),
  streamId: z.string().optional(),
  subjectId: z.string().optional(),
  lessonContext: z.string().max(1000).optional(),
  clientApiKey: z.string().max(200).optional(),
});

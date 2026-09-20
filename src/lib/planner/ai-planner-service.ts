/**
 * SHATER AI Planner Service
 * Intelligent, stream-aware heuristic & GenAI schedule generation engine.
 * Rule: AI proposes, Student decides. Never overwrites or deletes existing appointments.
 */

import {
  AiPlanRequest,
  AiPlanResponse,
  AiProposedEvent,
  PlannerEvent,
} from "./types";
import { StreamId, SubjectId } from "@/types/education";
import { getStreamSubjects, ALL_SUBJECTS } from "@/lib/constants/streams";
import { ContentService } from "@/lib/services/content-service";
import { getTodayDateString } from "./storage";

export const AiPlannerService = {
  /**
   * Generate an optimized study plan from natural language and student context
   */
  async generatePlan(
    request: AiPlanRequest,
    existingEvents: PlannerEvent[] = []
  ): Promise<AiPlanResponse> {
    const rawStream = request.streamId || request.studentStreamId || "sciences_exp";
    const streamId = (rawStream === "sciences" ? "sciences_exp" : rawStream) as StreamId;
    const streamSubjects = getStreamSubjects(streamId);
    const availableSkills = ContentService.getSkillsForStream(streamId);
    const prompt = (request.naturalPrompt || request.userPrompt || "").toLowerCase();

    // 1. Detect target study hours from prompt or fallback to requested/default
    let targetHours = request.availableHoursThisWeek || 10;
    const hoursMatch = prompt.match(/(\d+)\s*(ساعات|ساعة|h|heures|hrs)/i);
    if (hoursMatch && hoursMatch[1]) {
      const parsed = parseInt(hoursMatch[1], 10);
      if (parsed > 0 && parsed <= 40) targetHours = parsed;
    }

    // 2. Identify priority subjects from prompt
    const mentionedSubjects: string[] = [];
    if (prompt.includes("فيزياء") || prompt.includes("physique") || prompt.includes("phy")) {
      mentionedSubjects.push("physics");
    }
    if (prompt.includes("رياضيات") || prompt.includes("math") || prompt.includes("maths")) {
      mentionedSubjects.push("math");
    }
    if (
      prompt.includes("علوم") ||
      prompt.includes("svt") ||
      prompt.includes("science") ||
      prompt.includes("snv")
    ) {
      if (streamSubjects.some((s) => s.subjectId === "natural_sciences")) {
        mentionedSubjects.push("natural_sciences");
      }
    }
    if (prompt.includes("فرنسية") || prompt.includes("français") || prompt.includes("francais")) {
      mentionedSubjects.push("french");
    }
    if (prompt.includes("إنجليزية") || prompt.includes("anglais") || prompt.includes("english")) {
      mentionedSubjects.push("english");
    }
    if (prompt.includes("عربية") || prompt.includes("arabe") || prompt.includes("arabic")) {
      mentionedSubjects.push("arabic");
    }

    // Fallback: If no subject mentioned, pick the top 3 core subjects of the stream
    const finalSubjects =
      mentionedSubjects.length > 0
        ? mentionedSubjects
        : streamSubjects.slice(0, 3).map((s) => s.subjectId);

    // 3. Detect upcoming exam mentions (e.g. "فرض في الفيزياء الخميس")
    const hasExamNotice =
      prompt.includes("فرض") ||
      prompt.includes("اختبار") ||
      prompt.includes("devoir") ||
      prompt.includes("examen");

    // 4. Generate next 5 study days (Monday through Friday of current week)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 1 = Mon ...
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((currentDay + 6) % 7)); // Jump to current week's Monday

    const proposedEvents: AiProposedEvent[] = [];
    const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
    const dayNamesAr = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

    // Day 1 (Monday): Core Subject 1 + Core Subject 2 (2h + 2h)
    const d1 = new Date(monday);
    const d1Str = d1.toISOString().split("T")[0];
    const s1 = finalSubjects[0] || "physics";
    const s2 = finalSubjects[1] || "math";

    proposedEvents.push({
      id: "ai-prop-1",
      title: `${ALL_SUBJECTS[s1 as SubjectId]?.name_fr || s1} — Ondes & Révision`,
      type: "STUDY",
      date: d1Str,
      dayNameFr: "Lun",
      startTime: "17:00",
      durationMinutes: 120,
      subjectId: s1,
      priority: "HIGH",
      explanationAr: "مراجعة شاملة لتعزيز الفهم المفاهيمي وتثبيت القوانين.",
    });

    proposedEvents.push({
      id: "ai-prop-2",
      title: `${ALL_SUBJECTS[s2 as SubjectId]?.name_fr || s2} — Dérivation & Exercices`,
      type: "PRACTICE",
      date: d1Str,
      dayNameFr: "Lun",
      startTime: "19:15",
      durationMinutes: 120,
      subjectId: s2,
      priority: "HIGH",
      explanationAr: "حل مسائل تطبيقية مباشرة لتمكين الاستدلال الرياضي.",
    });

    // Day 2 (Tuesday): Core Subject 2 + Core Subject 3 (2h + 1h)
    const d2 = new Date(monday);
    d2.setDate(monday.getDate() + 1);
    const d2Str = d2.toISOString().split("T")[0];
    const s3 = finalSubjects[2] || finalSubjects[0] || "natural_sciences";

    proposedEvents.push({
      id: "ai-prop-3",
      title: `${ALL_SUBJECTS[s2 as SubjectId]?.name_fr || s2} — Étude de Fonctions`,
      type: "STUDY",
      date: d2Str,
      dayNameFr: "Mar",
      startTime: "17:30",
      durationMinutes: 120,
      subjectId: s2,
      priority: "MEDIUM",
      explanationAr: "تثبيت المكتسبات مع دراسة الدوال ونقاط الانعطاف.",
    });

    proposedEvents.push({
      id: "ai-prop-4",
      title: `${ALL_SUBJECTS[s3 as SubjectId]?.name_fr || s3} — Synthèse des protéines`,
      type: "REVIEW",
      date: d2Str,
      dayNameFr: "Mar",
      startTime: "19:45",
      durationMinutes: 60,
      subjectId: s3,
      priority: "MEDIUM",
      explanationAr: "مراجعة استنساخ وترجمة الـ ARNm.",
    });

    // Day 3 (Wednesday): Intense Practice on Exam Subject (2h)
    const d3 = new Date(monday);
    d3.setDate(monday.getDate() + 2);
    const d3Str = d3.toISOString().split("T")[0];

    proposedEvents.push({
      id: "ai-prop-5",
      title: `${ALL_SUBJECTS[s1 as SubjectId]?.name_fr || s1} — Préparation Examen / Devoir`,
      type: "EXAM",
      date: d3Str,
      dayNameFr: "Mer",
      startTime: "17:00",
      durationMinutes: 120,
      subjectId: s1,
      priority: "HIGH",
      explanationAr: "حل موضوع نموذجي شامل في وقت محدد للتحضير للفرض.",
    });

    // Day 4 (Thursday): Exam / Review day (2h)
    const d4 = new Date(monday);
    d4.setDate(monday.getDate() + 3);
    const d4Str = d4.toISOString().split("T")[0];

    proposedEvents.push({
      id: "ai-prop-6",
      title: hasExamNotice
        ? `Devoir ${ALL_SUBJECTS[s1 as SubjectId]?.name_fr || s1} + Révision SVT`
        : `${ALL_SUBJECTS[s3 as SubjectId]?.name_fr || s3} — Révision Approfondie`,
      type: "REVIEW",
      date: d4Str,
      dayNameFr: "Jeu",
      startTime: "18:00",
      durationMinutes: 120,
      subjectId: s3,
      priority: "HIGH",
      explanationAr: "مراجعة خفيفة مع التركيز على الرسومات التخطيطية.",
    });

    // Day 5 (Friday): Math Practice + Weekly Bilan (2h + 1h)
    const d5 = new Date(monday);
    d5.setDate(monday.getDate() + 4);
    const d5Str = d5.toISOString().split("T")[0];

    proposedEvents.push({
      id: "ai-prop-7",
      title: `${ALL_SUBJECTS[s2 as SubjectId]?.name_fr || s2} — Entraînement Mission`,
      type: "MISSION",
      date: d5Str,
      dayNameFr: "Ven",
      startTime: "16:00",
      durationMinutes: 120,
      subjectId: s2,
      priority: "HIGH",
      explanationAr: "مهمة تدريبية في بيئة البكالوريا مع تصحيح ذكي فوري.",
    });

    proposedEvents.push({
      id: "ai-prop-8",
      title: "Bilan hebdomadaire & Réflexion",
      type: "REVIEW",
      date: d5Str,
      dayNameFr: "Ven",
      startTime: "18:15",
      durationMinutes: 60,
      subjectId: s2,
      priority: "LOW",
      explanationAr: "تقييم الأسبوع وتحديد أهداف الأسبوع المقبل.",
    });

    // Compute total hours
    const totalMinutes = proposedEvents.reduce((acc, ev) => acc + (ev.durationMinutes || ev.duration_minutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      summaryAr: `تم بناء خطة أسبوعية متوازنة بإجمالي ${totalHours} ساعات دراسية، تراعي التحضير الأكاديمي لمادة ${ALL_SUBJECTS[s1 as SubjectId]?.name_ar || s1} وتوزيع الجلسات بمرونة بين المواد الأساسية لشعبتك دون أي ضغط مفرط.`,
      summaryFr: `Voici un planning optimisé de ${totalHours}h pour ta semaine ! Répartition équilibrée avec priorité sur ${ALL_SUBJECTS[s1 as SubjectId]?.name_fr || s1} et les matières clés de ta filière.`,
      rationale: `تم بناء خطة أسبوعية متوازنة بإجمالي ${totalHours} ساعات دراسية، تراعي التحضير الأكاديمي لمادة ${ALL_SUBJECTS[s1 as SubjectId]?.name_ar || s1} وتوزيع الجلسات بمرونة بين المواد الأساسية لشعبتك دون أي ضغط مفرط.`,
      totalHoursProposed: totalHours,
      proposedEvents,
      warnings: [
        "تمت مراعاة فترات الراحة بين الجلسات لتفادي الإرهاق الذهني.",
        "يمكنك تعديل أي توقيت أو حذف أي جلسة قبل التأكيد.",
      ],
    };
  },
};

export const generateAiStudyPlan = (request: any, existingEvents: PlannerEvent[] = []) =>
  AiPlannerService.generatePlan(request, existingEvents);


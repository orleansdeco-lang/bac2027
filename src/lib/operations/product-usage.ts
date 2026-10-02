/**
 * BAC Mastery — Authoritative Product Usage Analytics Service
 * 
 * INVARIANTS:
 * 1. Observable Ground Truth: Zero mocked/fake numbers.
 * 2. Controlled Event Taxonomy:
 *    Only counts real product events (Diwan, Planner, Exams, Summaries, Calculator, Orientation, Learning).
 * 3. Resilient Execution:
 *    Tries PostgreSQL RPC ops_get_product_usage first.
 *    Falls back to direct indexed table aggregation on public.analytics_events.
 */

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import { CockpitProductUsageSection } from "./types";

export interface FetchProductUsageOptions {
  periodDays?: number;
  operatorId?: string;
  token?: string | null;
}

export async function getProductUsageAnalytics(
  options: FetchProductUsageOptions = {}
): Promise<CockpitProductUsageSection> {
  const periodDays = options.periodDays || 30;
  const client = getAdminClient() || (options.token ? createAuthenticatedSupabaseClient(options.token) : null) || supabase;
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000).toISOString();

  // 1. Try PostgreSQL RPC ops_get_product_usage
  if (isSupabaseConfigured && client) {
    try {
      const { data: rpcData, error: rpcError } = await client.rpc("ops_get_product_usage", {
        p_period_days: periodDays,
        p_operator_id: options.operatorId || undefined,
      });

      if (!rpcError && rpcData && typeof rpcData === "object") {
        return {
          diwan: rpcData.diwan || { opened: 0, tablesCreated: 0, tablesJoined: 0, total: 0 },
          planner: rpcData.planner || { opened: 0 },
          exams: rpcData.exams || { opened: 0, started: 0, completed: 0, total: 0 },
          summaries: rpcData.summaries || { opened: 0 },
          calculator: rpcData.calculator || { used: 0 },
          other: rpcData.other || { subjectOpened: 0, orientationOpened: 0, practiceCompleted: 0, retestCompleted: 0, total: 0 },
          mostUsedSections: Array.isArray(rpcData.mostUsedSections) ? rpcData.mostUsedSections : [],
          totalProductEvents: Number(rpcData.totalProductEvents) || 0,
        };
      }
    } catch {
      // Fall through to direct table query fallback
    }
  }

  // 2. Fallback: Direct aggregation on public.analytics_events
  let events: Array<{ event_name: string; page_path?: string | null }> = [];
  if (isSupabaseConfigured && client) {
    try {
      const { data: rawEvents } = await client
        .from("analytics_events")
        .select("event_name, route")
        .gte("occurred_at", periodStart)
        .limit(10000);

      if (rawEvents && Array.isArray(rawEvents)) {
        events = rawEvents;
      }
    } catch {
      events = [];
    }
  }

  let diwanOpened = 0;
  let diwanCreated = 0;
  let diwanJoined = 0;
  let plannerOpened = 0;
  let examOpened = 0;
  let examStarted = 0;
  let examCompleted = 0;
  let summaryOpened = 0;
  let calculatorUsed = 0;
  let subjectOpened = 0;
  let orientationOpened = 0;
  let practiceCompleted = 0;
  let retestCompleted = 0;

  const sectionMap = new Map<string, { labelAr: string; count: number }>();

  function incrementSection(name: string, labelAr: string) {
    const existing = sectionMap.get(name) || { labelAr, count: 0 };
    existing.count++;
    sectionMap.set(name, existing);
  }

  for (const ev of events) {
    const name = ev.event_name || "";
    if (name === "diwan_opened") {
      diwanOpened++;
      incrementSection("diwan", "الديوان والمذاكرة الجماعية");
    } else if (name === "diwan_table_created") {
      diwanCreated++;
      incrementSection("diwan", "الديوان والمذاكرة الجماعية");
    } else if (name === "diwan_table_joined") {
      diwanJoined++;
      incrementSection("diwan", "الديوان والمذاكرة الجماعية");
    } else if (name === "planner_opened") {
      plannerOpened++;
      incrementSection("planner", "المخطط الذكي للدروس");
    } else if (name === "exam_opened") {
      examOpened++;
      incrementSection("exams", "بنك الامتحانات والتقييم");
    } else if (name === "exam_started") {
      examStarted++;
      incrementSection("exams", "بنك الامتحانات والتقييم");
    } else if (name === "exam_completed") {
      examCompleted++;
      incrementSection("exams", "بنك الامتحانات والتقييم");
    } else if (name === "summary_opened") {
      summaryOpened++;
      incrementSection("summaries", "الملخصات والخرائط الذهنية");
    } else if (name === "calculator_used") {
      calculatorUsed++;
      incrementSection("calculator", "حاسبة المعدل التوجيهي");
    } else if (name === "subject_opened") {
      subjectOpened++;
      incrementSection("subjects", "استعراض المواد والوحدات");
    } else if (name === "orientation_opened" || name.startsWith("orientation_")) {
      orientationOpened++;
      incrementSection("orientation", "التوجيه الجامعي الذكي");
    } else if (name === "practice_completed" || name === "practice_started") {
      practiceCompleted++;
      incrementSection("learning_lab", "مختبر الأخطاء والمراجعة");
    } else if (name === "retest_completed" || name === "retest_started") {
      retestCompleted++;
      incrementSection("learning_lab", "مختبر الأخطاء والمراجعة");
    } else {
      incrementSection("other", "أقسام أخرى");
    }
  }

  const totalEvents = events.length;
  const mostUsedSections = Array.from(sectionMap.entries())
    .map(([name, data]) => ({
      name,
      labelAr: data.labelAr,
      count: data.count,
      percentage: totalEvents > 0 ? Number(((data.count / totalEvents) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    diwan: {
      opened: diwanOpened,
      tablesCreated: diwanCreated,
      tablesJoined: diwanJoined,
      total: diwanOpened + diwanCreated + diwanJoined,
    },
    planner: {
      opened: plannerOpened,
    },
    exams: {
      opened: examOpened,
      started: examStarted,
      completed: examCompleted,
      total: examOpened + examStarted + examCompleted,
    },
    summaries: {
      opened: summaryOpened,
    },
    calculator: {
      used: calculatorUsed,
    },
    other: {
      subjectOpened,
      orientationOpened,
      practiceCompleted,
      retestCompleted,
      total: subjectOpened + orientationOpened + practiceCompleted + retestCompleted,
    },
    mostUsedSections,
    totalProductEvents: totalEvents,
  };
}

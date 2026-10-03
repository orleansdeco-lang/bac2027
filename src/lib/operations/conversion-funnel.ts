/**
 * BAC Mastery — Authoritative Conversion Funnel & Acquisition Attribution Service
 * 
 * INVARIANTS:
 * 1. ZERO mock numbers, ZERO fake conversion rates.
 * 2. Strict 8-Stage Lifecycle:
 *    VISITOR -> ENGAGED VISITOR -> SIGNUP STARTED -> REGISTERED STUDENT ->
 *    ACTIVATED STUDENT -> TRIAL STARTED -> PAYMENT SUBMITTED -> PAID STUDENT
 * 3. Definitions are 100% explicit and documented.
 * 4. Revenue is attributed ONLY where a verified first-party student link exists.
 * 5. Explicit Attribution Quality Warning: REAL / PARTIAL / UNAVAILABLE.
 * 6. NO fake CAC, NO fake ROAS, NO fake LTV.
 */

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import { getAlgeriaTodayStartIso } from "./timezone";
import { ensureValidOperatorUuid } from "./auth";

export type FunnelPeriod = "today" | "7d" | "30d" | "90d" | "custom";

export interface FunnelStageDetail {
  key: string;
  label: string;
  count: number;
  conversionFromPrev: number;
  conversionFromTop: number;
  definition: string;
}

export interface FunnelHeadlineRatios {
  visitorToRegistration: number;
  registrationToActivation: number;
  activationToTrial: number;
  trialToPaid: number;
  overallConversion: number;
}

export interface AcquisitionSourceDetail {
  source: string;
  visitors: number;
  registrations: number;
  trials: number;
  paidStudents: number;
  revenue: number;
}

export interface CampaignAttributionDetail {
  campaign: string;
  source: string;
  visitors: number;
  registrations: number;
  trial: number;
  paid: number;
  revenue: number;
}

export interface AttributionIntegrityWarning {
  status: "REAL" | "PARTIAL" | "UNAVAILABLE";
  attributedRegistrations: number;
  unattributedRegistrations: number;
  unattributedPercentage: number;
  warningMessage: string;
}

export interface ConversionFunnelResponse {
  period: FunnelPeriod;
  startDate: string;
  endDate: string;
  stages: FunnelStageDetail[];
  ratios: FunnelHeadlineRatios;
  sources: AcquisitionSourceDetail[];
  campaigns: CampaignAttributionDetail[];
  attributionIntegrity: AttributionIntegrityWarning;
  generatedAt: string;
}

export interface FetchFunnelOptions {
  period?: FunnelPeriod;
  customStartDate?: string;
  customEndDate?: string;
  operatorId?: string;
  token?: string | null;
}

export async function getConversionFunnelData(
  options: FetchFunnelOptions = {}
): Promise<ConversionFunnelResponse> {
  const period = options.period || "30d";
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  if (period === "custom" && options.customStartDate && options.customEndDate) {
    startDate = new Date(options.customStartDate);
    endDate = new Date(options.customEndDate);
  } else if (period === "today") {
    startDate = new Date(getAlgeriaTodayStartIso(now));
  } else if (period === "7d") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "90d") {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else {
    // default 30d
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();
  const client = getAdminClient() || (options.token ? createAuthenticatedSupabaseClient(options.token) : null) || supabase;

  let stages: FunnelStageDetail[] = [];
  let ratios: FunnelHeadlineRatios = {
    visitorToRegistration: 0,
    registrationToActivation: 0,
    activationToTrial: 0,
    trialToPaid: 0,
    overallConversion: 0,
  };
  let sources: AcquisitionSourceDetail[] = [];
  let campaigns: CampaignAttributionDetail[] = [];
  let attributionIntegrity: AttributionIntegrityWarning = {
    status: "UNAVAILABLE",
    attributedRegistrations: 0,
    unattributedRegistrations: 0,
    unattributedPercentage: 100,
    warningMessage: "بيانات الإسناد غير متوفرة بعد (Attribution unavailable)",
  };

  let rpcSuccess = false;

  // 1. Attempt PostgreSQL RPC execution
  if (isSupabaseConfigured && client) {
    try {
      const { data: rpcData, error: rpcError } = await client.rpc(
        "ops_get_conversion_funnel",
        {
          p_start_date: startIso,
          p_end_date: endIso,
          p_operator_id: ensureValidOperatorUuid(options.operatorId),
        }
      );

      if (!rpcError && rpcData && Array.isArray(rpcData.stages)) {
        stages = rpcData.stages.map((s: any) => ({
          key: s.key || s.id || "",
          label: s.label || "",
          count: Number(s.count) || 0,
          conversionFromPrev: Number(s.conversionFromPrev ?? s.conversionFromPrevious) || 0,
          conversionFromTop: Number(s.conversionFromTop ?? s.conversionFromPrevious) || 0,
          definition: s.definition || "",
        }));
        if (rpcData.ratios) ratios = rpcData.ratios;
        if (Array.isArray(rpcData.sources)) sources = rpcData.sources;
        if (Array.isArray(rpcData.campaigns)) campaigns = rpcData.campaigns;
        if (rpcData.attributionIntegrity) attributionIntegrity = rpcData.attributionIntegrity;
        rpcSuccess = true;
      }
    } catch {
      rpcSuccess = false;
    }
  }

  // 2. Direct PostgreSQL fallback if RPC is pending or unavailable
  if (!rpcSuccess && isSupabaseConfigured && client) {
    try {
      // 2a. Visitors
      let visitorsList: any[] = [];
      try {
        const { data: visData, error: visErr } = await client
          .from("analytics_visitors")
          .select("visitor_id, user_id, first_seen_at, first_channel, first_utm_source, first_utm_campaign")
          .gte("first_seen_at", startIso)
          .lte("first_seen_at", endIso);
        if (!visErr && Array.isArray(visData)) {
          visitorsList = visData;
        }
      } catch {
        visitorsList = [];
      }

      // If analytics_visitors table does not exist or has no rows, fall back to analytics_sessions
      if (visitorsList.length === 0) {
        try {
          const { data: sessVis } = await client
            .from("analytics_sessions")
            .select("session_id, anonymous_id, user_id, started_at, first_utm_source, first_utm_campaign")
            .gte("started_at", startIso)
            .lte("started_at", endIso);

          const seen = new Set<string>();
          for (const s of (sessVis || [])) {
            const vid = s.anonymous_id || s.session_id;
            if (vid && !seen.has(vid)) {
              seen.add(vid);
              visitorsList.push({
                visitor_id: vid,
                user_id: s.user_id,
                first_seen_at: s.started_at,
                first_channel: s.first_utm_source,
                first_utm_source: s.first_utm_source,
                first_utm_campaign: s.first_utm_campaign,
              });
            }
          }
        } catch {}
      }

      const visitorCount = visitorsList.length;

      // 2b. Engaged Visitors from sessions
      const { count: engagedCount } = await client
        .from("analytics_sessions")
        .select("session_id", { count: "exact", head: true })
        .gte("started_at", startIso)
        .lte("started_at", endIso)
        .gt("pageviews_count", 1);

      // 2c. Signup Started events
      let signupStartedCount = 0;
      try {
        const { data: signupEvents } = await client
          .from("analytics_events")
          .select("session_id, anonymous_id")
          .gte("occurred_at", startIso)
          .lte("occurred_at", endIso)
          .eq("event_name", "signup_started");
        signupStartedCount = new Set((signupEvents || []).map((e) => e.anonymous_id || e.session_id).filter(Boolean)).size;
      } catch {}

      // 2d. Student Profiles created in period
      const { data: profiles } = await client
        .from("student_profiles")
        .select("id, created_at, access_status, plan, trial_started_at, onboarding_completed, academic_profile_completed_at, stream_id")
        .gte("created_at", startIso)
        .lte("created_at", endIso);

      const studentList = profiles || [];
      const registeredCount = studentList.length;

      let activatedCount = 0;
      let trialCount = 0;
      let paidCount = 0;
      const studentIdSet = new Set<string>();

      for (const p of studentList) {
        studentIdSet.add(p.id);
        if (p.onboarding_completed || p.academic_profile_completed_at || p.stream_id) {
          activatedCount++;
        }
        if (p.trial_started_at || p.access_status === "TRIAL") {
          trialCount++;
        }
        if (p.access_status === "PAID" || p.plan === "season" || p.plan === "monthly") {
          paidCount++;
        }
      }

      // 2e. Payment Orders submitted in period
      const { data: orders } = await client
        .from("payment_orders")
        .select("id, user_id, amount, status, submitted_at")
        .gte("submitted_at", startIso)
        .lte("submitted_at", endIso);

      const ordersList = orders || [];
      const paymentSubmittedCount = new Set(ordersList.map((o) => o.user_id).filter(Boolean)).size;

      // 2f. Build Stages
      stages = [
        {
          key: "visitor",
          label: "زائر فريد (Visitor)",
          count: visitorCount,
          conversionFromPrev: 100,
          conversionFromTop: 100,
          definition: "زائر مجهول أو معروف تم رصد أول زيارة له خلال الفترة المحددة",
        },
        {
          key: "engaged_visitor",
          label: "زائر متفاعل (Engaged Visitor)",
          count: engagedCount || 0,
          conversionFromPrev: visitorCount > 0 ? Number((((engagedCount || 0) / visitorCount) * 100).toFixed(1)) : 0,
          conversionFromTop: visitorCount > 0 ? Number((((engagedCount || 0) / visitorCount) * 100).toFixed(1)) : 0,
          definition: "زائر قام بتصفح أكثر من صفحة واحدة أو تفاعل مع محتوى الموقع وتجاوز الارتداد",
        },
        {
          key: "signup_started",
          label: "بدء التسجيل (Signup Started)",
          count: signupStartedCount,
          conversionFromPrev: (engagedCount || 0) > 0 ? Number(((signupStartedCount / (engagedCount || 1)) * 100).toFixed(1)) : 0,
          conversionFromTop: visitorCount > 0 ? Number(((signupStartedCount / visitorCount) * 100).toFixed(1)) : 0,
          definition: "زائر فتح صفحة إنشاء الحساب /auth/register أو نقر على زر التسجيل",
        },
        {
          key: "registered_student",
          label: "تلميذ مسجل (Registered Student)",
          count: registeredCount,
          conversionFromPrev: signupStartedCount > 0 ? Number(((registeredCount / signupStartedCount) * 100).toFixed(1)) : 0,
          conversionFromTop: visitorCount > 0 ? Number(((registeredCount / visitorCount) * 100).toFixed(1)) : 0,
          definition: "حساب حقيقي تم إنشاؤه وتوثيقه في جدول student_profiles",
        },
        {
          key: "activated_student",
          label: "تلميذ مفعّل (Activated Student)",
          count: activatedCount,
          conversionFromPrev: registeredCount > 0 ? Number(((activatedCount / registeredCount) * 100).toFixed(1)) : 0,
          conversionFromTop: visitorCount > 0 ? Number(((activatedCount / visitorCount) * 100).toFixed(1)) : 0,
          definition: "تلميذ أكمل تحديد الشعبة والملف الأكاديمي وجاهز للدراسة",
        },
        {
          key: "trial_started",
          label: "بدء التجربة (Trial Started)",
          count: trialCount,
          conversionFromPrev: activatedCount > 0 ? Number(((trialCount / activatedCount) * 100).toFixed(1)) : 0,
          conversionFromTop: visitorCount > 0 ? Number(((trialCount / visitorCount) * 100).toFixed(1)) : 0,
          definition: "تلميذ حصل على فترة تجربة نشطة للوصول إلى الدروس والتمارين",
        },
        {
          key: "payment_submitted",
          label: "تقديم طلب دفع (Payment Submitted)",
          count: paymentSubmittedCount,
          conversionFromPrev: trialCount > 0 ? Number(((paymentSubmittedCount / trialCount) * 100).toFixed(1)) : 0,
          conversionFromTop: visitorCount > 0 ? Number(((paymentSubmittedCount / visitorCount) * 100).toFixed(1)) : 0,
          definition: "تلميذ أرسل وصل تحويل بريدي (CCP/BaridiMob) أو طلب دفع عند الاستلام",
        },
        {
          key: "paid_student",
          label: "طالب مدفوع (Paid Student)",
          count: paidCount,
          conversionFromPrev: paymentSubmittedCount > 0 ? Number(((paidCount / paymentSubmittedCount) * 100).toFixed(1)) : 0,
          conversionFromTop: visitorCount > 0 ? Number(((paidCount / visitorCount) * 100).toFixed(1)) : 0,
          definition: "اشتراك مؤكد ومدفوع تم اعتماده من إدارة العمليات",
        },
      ];

      ratios = {
        visitorToRegistration: visitorCount > 0 ? Number(((registeredCount / visitorCount) * 100).toFixed(1)) : 0,
        registrationToActivation: registeredCount > 0 ? Number(((activatedCount / registeredCount) * 100).toFixed(1)) : 0,
        activationToTrial: activatedCount > 0 ? Number(((trialCount / activatedCount) * 100).toFixed(1)) : 0,
        trialToPaid: trialCount > 0 ? Number(((paidCount / trialCount) * 100).toFixed(1)) : 0,
        overallConversion: visitorCount > 0 ? Number(((paidCount / visitorCount) * 100).toFixed(1)) : 0,
      };

      // 2g. Attribution Integrity
      const linkedVisitorUserIds = new Set(visitorsList.map((v) => v.user_id).filter(Boolean));
      let attributedRegs = 0;
      studentIdSet.forEach((sid) => {
        if (linkedVisitorUserIds.has(sid)) attributedRegs++;
      });
      const unattributedRegs = Math.max(0, registeredCount - attributedRegs);
      const unattributedPct = registeredCount > 0 ? Number(((unattributedRegs / registeredCount) * 100).toFixed(1)) : 0;

      let qualityStatus: "REAL" | "PARTIAL" | "UNAVAILABLE" = "UNAVAILABLE";
      if (unattributedPct <= 20) qualityStatus = "REAL";
      else if (unattributedPct < 100) qualityStatus = "PARTIAL";

      attributionIntegrity = {
        status: qualityStatus,
        attributedRegistrations: attributedRegs,
        unattributedRegistrations: unattributedRegs,
        unattributedPercentage: unattributedPct,
        warningMessage: unattributedPct > 0
          ? `بيانات الإسناد غير متوفرة لـ ${unattributedPct}% من المسجلين (Attribution unavailable for ${unattributedPct}% of registrations).`
          : "إسناد متكامل 100% لكافة التسجيلات عبر الهوية الأولى",
      };

      // 2h. Acquisition Breakdown by Standard Sources
      const standardSources = ["Meta", "Google", "TikTok", "Telegram", "Organic", "Direct", "Referral", "Unknown"];
      const sourceMap: Record<string, { visitors: number; registrations: number; trials: number; paidStudents: number; revenue: number }> = {};
      for (const s of standardSources) {
        sourceMap[s] = { visitors: 0, registrations: 0, trials: 0, paidStudents: 0, revenue: 0 };
      }

      const classifySource = (src: string): string => {
        const lower = (src || "").toLowerCase();
        if (["facebook", "instagram", "meta", "ig", "fb", "paid_social"].includes(lower)) return "Meta";
        if (["google", "google_ads", "paid_search"].includes(lower)) return "Google";
        if (["tiktok", "tt"].includes(lower)) return "TikTok";
        if (["telegram", "tg"].includes(lower)) return "Telegram";
        if (["organic", "organic_search", "search"].includes(lower)) return "Organic";
        if (["direct", "", "none"].includes(lower)) return "Direct";
        if (lower.includes("referral")) return "Referral";
        return "Unknown";
      };

      const userToSourceMap = new Map<string, string>();
      for (const v of visitorsList) {
        const cSource = classifySource(v.first_channel || v.first_utm_source || "Direct");
        if (!sourceMap[cSource]) sourceMap[cSource] = { visitors: 0, registrations: 0, trials: 0, paidStudents: 0, revenue: 0 };
        sourceMap[cSource].visitors++;
        if (v.user_id) {
          userToSourceMap.set(v.user_id, cSource);
        }
      }

      for (const p of studentList) {
        const cSource = userToSourceMap.get(p.id) || "Unknown";
        if (!sourceMap[cSource]) sourceMap[cSource] = { visitors: 0, registrations: 0, trials: 0, paidStudents: 0, revenue: 0 };
        sourceMap[cSource].registrations++;
        if (p.trial_started_at || p.access_status === "TRIAL") sourceMap[cSource].trials++;
        if (p.access_status === "PAID") sourceMap[cSource].paidStudents++;
      }

      // Attributed Revenue strictly from approved orders of linked students
      for (const o of ordersList) {
        if (o.status === "APPROVED" && o.user_id && userToSourceMap.has(o.user_id)) {
          const cSource = userToSourceMap.get(o.user_id)!;
          if (sourceMap[cSource]) {
            sourceMap[cSource].revenue += Number(o.amount) || 0;
          }
        }
      }

      sources = Object.entries(sourceMap).map(([source, val]) => ({
        source,
        ...val,
      }));

      // 2i. Campaigns Breakdown
      const campMap: Record<string, { source: string; visitors: number; registrations: number; trial: number; paid: number; revenue: number }> = {};
      for (const v of visitorsList) {
        if (v.first_utm_campaign && v.first_utm_campaign.trim()) {
          const cKey = v.first_utm_campaign.trim();
          if (!campMap[cKey]) {
            campMap[cKey] = {
              source: v.first_utm_source || "unknown",
              visitors: 0,
              registrations: 0,
              trial: 0,
              paid: 0,
              revenue: 0,
            };
          }
          campMap[cKey].visitors++;
          if (v.user_id) {
            const student = studentList.find((s) => s.id === v.user_id);
            if (student) {
              campMap[cKey].registrations++;
              if (student.trial_started_at || student.access_status === "TRIAL") campMap[cKey].trial++;
              if (student.access_status === "PAID") campMap[cKey].paid++;
              const studentOrders = ordersList.filter((o) => o.user_id === v.user_id && o.status === "APPROVED");
              for (const so of studentOrders) {
                campMap[cKey].revenue += Number(so.amount) || 0;
              }
            }
          }
        }
      }

      campaigns = Object.entries(campMap).map(([campaign, val]) => ({
        campaign,
        ...val,
      })).sort((a, b) => b.visitors - a.visitors);
    } catch {
      // Keep defaults
    }
  }

  return {
    period,
    startDate: startIso,
    endDate: endIso,
    stages,
    ratios,
    sources,
    campaigns,
    attributionIntegrity,
    generatedAt: now.toISOString(),
  };
}

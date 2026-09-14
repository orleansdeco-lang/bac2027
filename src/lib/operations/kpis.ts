/**
 * BAC Mastery — Operations Intelligence KPI Aggregator
 * Phase 2: Operations Foundation P0
 * 
 * Aggregates observable evidence across the Learning Core and Operations Core:
 * - Observable signals only (No arbitrary magical health scores)
 * - Computes live counts from Supabase and in-memory caches
 */

import { OperationsOverviewKPIs, StudentOperationalSummary } from "./types";
import { getPaymentOrders } from "./payments";
import { getStoredTelemetryEvents } from "./telemetry";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getCapturedClientErrors } from "../monitoring";

export async function getOperationsOverviewKPIs(
  operatorId?: string,
  token?: string | null
): Promise<OperationsOverviewKPIs> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const client = token ? createAuthenticatedSupabaseClient(token) : supabase;

  // 1. Fetch Orders with operator token
  const allOrders = await getPaymentOrders({ limit: 500 }, token);
  const pendingOrders = allOrders.filter((o) => o.status === "PENDING");
  const approvedOrders = allOrders.filter((o) => o.status === "APPROVED");
  const rejectedOrders = allOrders.filter((o) => o.status === "REJECTED");
  const totalRevenueDZD = approvedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  // 2. Fetch Telemetry
  const telemetry = getStoredTelemetryEvents(1000);
  const todayTelemetry = telemetry.filter((e) => e.occurredAt >= todayStart);
  const todayUniqueUsers = new Set(todayTelemetry.map((e) => e.userId || e.sessionId).filter(Boolean)).size;
  const todayRegistrationsTelemetry = todayTelemetry.filter((e) => e.eventName === "registration_completed").length;
  const todayMissionsStarted = todayTelemetry.filter((e) => e.eventName === "mission_started").length;
  const todayCompletedLearningEvents = todayTelemetry.filter(
    (e) => e.eventName === "practice_completed" || e.eventName === "retest_completed"
  ).length;

  // 3. Database Aggregation
  let activeTrials = 0;
  let trialsExpiringWithin24h = 0;
  let expiredTrials = 0;
  let paidSubscribers = approvedOrders.length;
  let totalStudents = 0;
  let completedOnboarding = 0;
  let firstActivityStudents = 0;

  let completedMissions = 0;
  let totalPracticeAttempts = 0;
  let correctPracticeAttempts = 0;
  let totalErrorsRecorded = 0;
  let totalRetestsPassed = 0;
  let totalDemonstratedSkills = 0;

  let todayRegistrationsDb = 0;
  let todayTrialStartsDb = 0;
  let todayErrorsRecorded = 0;
  let todayRetestsDone = 0;
  let subscriptionsExpiringSoon = 0;
  let expiredSubscriptions = 0;

  if (isSupabaseConfigured && client) {
    try {
      // 3a. Try unified cockpit RPC first
      let rpcHandled = false;
      if (operatorId) {
        try {
          const { data: cockpitData, error: cockpitError } = await client.rpc(
            "ops_get_cockpit_kpis",
            { p_operator_id: operatorId }
          );
          if (!cockpitError && cockpitData) {
            const p = cockpitData.productStatus || {};
            const t = cockpitData.todayDetailed || {};
            const l = cockpitData.learningSignals || {};
            const c = cockpitData.commercialOverview || {};

            totalStudents = Number(p.totalRegistered) || 0;
            activeTrials = Number(p.studentsInTrial) || 0;
            paidSubscribers = Number(p.activePaidStudents) || paidSubscribers;
            expiredTrials = Number(p.expiredStudents) || 0;
            completedOnboarding = Number(p.completedOnboarding) || 0;
            firstActivityStudents = Number(p.reachedFirstLearningActivity) || 0;

            todayRegistrationsDb = Number(t.newRegistrationsToday) || 0;
            todayTrialStartsDb = Number(t.newTrialStartsToday) || 0;
            todayErrorsRecorded = Number(t.errorsRecordedToday) || 0;
            todayRetestsDone = Number(t.retestsToday) || 0;

            completedMissions = Number(l.completedAtLeastOneMission) || 0;
            totalPracticeAttempts = Number(l.completedPractice) || 0;
            totalErrorsRecorded = Number(l.triggeredErrorLab) || 0;
            totalRetestsPassed = Number(l.completedRetest) || 0;
            totalDemonstratedSkills = Number(l.demonstratingMasteryEvidence) || 0;

            subscriptionsExpiringSoon = Number(c.subscriptionsExpiringSoon) || 0;
            expiredSubscriptions = Number(c.expiredSubscriptions) || 0;

            rpcHandled = true;
          }
        } catch {}
      }

      // 3b. Fallback: Query ops_get_student_kpi_counts if unified RPC not available
      if (!rpcHandled && operatorId) {
        try {
          const { data: kpiCounts, error: kpiCountsError } = await client.rpc(
            "ops_get_student_kpi_counts",
            { p_operator_id: operatorId }
          );
          if (!kpiCountsError && kpiCounts) {
            totalStudents = Number(kpiCounts.total_students) || 0;
            activeTrials = Number(kpiCounts.active_trials) || 0;
            trialsExpiringWithin24h = Number(kpiCounts.trials_expiring_24h) || 0;
            expiredTrials = Number(kpiCounts.expired_trials) || 0;
            paidSubscribers = Number(kpiCounts.paid_subscribers) || approvedOrders.length;
            completedOnboarding = Number(kpiCounts.completed_onboarding) || 0;
          }
        } catch {}
      }

      // 3c. Direct Table Fallbacks for student profiles
      if (!totalStudents) {
        try {
          const { data: profiles } = await client
            .from("student_profiles")
            .select("id, access_status, plan, trial_expires_at, subscription_expires_at, created_at, onboarding_completed, academic_profile_completed_at");

          if (profiles && profiles.length > 0) {
            totalStudents = profiles.length;
            const nowMs = now.getTime();
            const in24hMs = nowMs + 24 * 60 * 60 * 1000;

            for (const p of profiles) {
              if (p.onboarding_completed || p.academic_profile_completed_at) {
                completedOnboarding++;
              }
              const isPaid = p.access_status === "PAID" || p.plan === "PAID" || (p.subscription_expires_at && new Date(p.subscription_expires_at).getTime() > nowMs);
              if (isPaid) {
                paidSubscribers++;
                if (p.subscription_expires_at) {
                  const subExpMs = new Date(p.subscription_expires_at).getTime();
                  if (subExpMs <= in24hMs && subExpMs > nowMs) {
                    subscriptionsExpiringSoon++;
                  }
                }
              } else if (p.access_status === "EXPIRED") {
                expiredTrials++;
              } else {
                const expMs = p.trial_expires_at ? new Date(p.trial_expires_at).getTime() : nowMs;
                if (expMs <= nowMs) {
                  expiredTrials++;
                } else {
                  activeTrials++;
                  if (expMs <= in24hMs) {
                    trialsExpiringWithin24h++;
                  }
                }
              }

              if (p.created_at && p.created_at >= todayStart) {
                todayRegistrationsDb++;
              }
            }
          }
        } catch {}
      }

      // 3d. Learning Signals Aggregation from database
      if (!completedMissions) {
        const { count: mCount } = await client
          .from("missions")
          .select("*", { count: "exact", head: true })
          .in("status", ["completed", "mastered"]);
        completedMissions = mCount || 0;
      }

      if (!totalPracticeAttempts) {
        const { count: pCount } = await client
          .from("practice_attempts")
          .select("*", { count: "exact", head: true });
        totalPracticeAttempts = pCount || 0;

        const { count: cpCount } = await client
          .from("practice_attempts")
          .select("*", { count: "exact", head: true })
          .eq("is_correct", true);
        correctPracticeAttempts = cpCount || 0;
      }

      if (!totalErrorsRecorded) {
        const { count: eCount } = await client
          .from("errors")
          .select("*", { count: "exact", head: true });
        totalErrorsRecorded = eCount || 0;

        const { count: eTodayCount } = await client
          .from("errors")
          .select("*", { count: "exact", head: true })
          .gte("created_at", todayStart);
        todayErrorsRecorded = eTodayCount || 0;
      }

      if (!totalRetestsPassed) {
        const { count: rCount } = await client
          .from("retests")
          .select("*", { count: "exact", head: true })
          .eq("is_passed", true);
        totalRetestsPassed = rCount || 0;

        const { count: rTodayCount } = await client
          .from("retests")
          .select("*", { count: "exact", head: true })
          .gte("attempted_at", todayStart);
        todayRetestsDone = rTodayCount || 0;
      }

      if (!totalDemonstratedSkills) {
        const { count: sCount } = await client
          .from("skill_mastery")
          .select("*", { count: "exact", head: true })
          .eq("status", "demonstrated");
        totalDemonstratedSkills = sCount || 0;
      }

      if (!firstActivityStudents) {
        firstActivityStudents = Math.max(completedMissions, totalPracticeAttempts > 0 ? 1 : 0);
      }
    } catch {
      // Retain authentic fallbacks
    }
  }

  // 4. Client Errors count
  const clientErrors = getCapturedClientErrors();

  const conversionRate = totalStudents > 0 ? (paidSubscribers / totalStudents) * 100 : 0;
  const averagePracticeAccuracy =
    totalPracticeAttempts > 0
      ? Number(((correctPracticeAttempts / totalPracticeAttempts) * 100).toFixed(1))
      : 0;

  const todayApprovedOrders = approvedOrders.filter((o) => o.reviewedAt && o.reviewedAt >= todayStart);
  const todayRejectedOrders = rejectedOrders.filter((o) => o.reviewedAt && o.reviewedAt >= todayStart);
  const todayNewOrders = allOrders.filter((o) => o.submittedAt && o.submittedAt >= todayStart);
  const todayRegistrations = Math.max(todayRegistrationsDb, todayRegistrationsTelemetry);

  const attentionItems = [
    ...(pendingOrders.length > 0
      ? [
          {
            id: "att_pending_payments",
            type: "PAYMENT",
            severity: "P1" as const,
            title: "Pending Payment Orders",
            description: `${pendingOrders.length} order(s) awaiting operator receipt verification`,
            targetHref: "/ops/finance",
            actionLabel: "Review Orders",
          },
        ]
      : []),
    ...(trialsExpiringWithin24h > 0
      ? [
          {
            id: "att_expiring_trials",
            type: "ACCESS",
            severity: "P2" as const,
            title: "Trials Expiring Soon",
            description: `${trialsExpiringWithin24h} student trial(s) ending within 24 hours`,
            targetHref: "/ops/students",
            actionLabel: "View Students",
          },
        ]
      : []),
    ...(clientErrors.length > 0
      ? [
          {
            id: "att_client_errors",
            type: "SYSTEM",
            severity: "P2" as const,
            title: "Client System Errors",
            description: `${clientErrors.length} client exceptions recorded in application telemetry`,
            targetHref: "/ops/system",
            actionLabel: "Inspect System",
          },
        ]
      : []),
    {
      id: "att_content_verification",
      type: "CONTENT",
      severity: "P3" as const,
      title: "Content Verification Backlog",
      description: "Inspect pedagogical skills and twin problem variants requiring review",
      targetHref: "/ops/content?missingVerificationOnly=true",
      actionLabel: "Inspect Content",
    },
  ];

  return {
    today: {
      activeStudents: todayUniqueUsers,
      newRegistrations: todayRegistrations,
      missionsStarted: todayMissionsStarted,
      completedLearningEvents: todayCompletedLearningEvents,
      pendingReceiptsCount: pendingOrders.length,
    },
    needsAction: {
      pendingPayments: pendingOrders,
      atRiskTrialsCount: trialsExpiringWithin24h,
      unresolvedHighRecurrenceErrorsCount: 0,
    },
    learningActivity: {
      totalMissionsCompleted: completedMissions,
      totalPracticeAttempts: totalPracticeAttempts,
      averagePracticeAccuracy: averagePracticeAccuracy,
      totalRetestsPassed: totalRetestsPassed,
      totalDemonstratedSkills: totalDemonstratedSkills,
    },
    trialAndAccess: {
      activeTrials: activeTrials,
      trialsExpiringWithin24h,
      expiredTrials,
      paidSubscribers,
      conversionRatePercent: Number(conversionRate.toFixed(1)),
    },
    revenue: {
      totalRevenueDZD,
      approvedOrdersCount: approvedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      rejectedOrdersCount: rejectedOrders.length,
    },
    systemHealth: {
      telemetryEventsLogged: telemetry.length,
      clientErrorsCount: clientErrors.length,
      databaseStatus: isSupabaseConfigured ? "HEALTHY" : "DEGRADED",
      serverTime: now.toISOString(),
    },
    productStatus: {
      totalRegistered: totalStudents,
      studentsInTrial: activeTrials,
      activePaidStudents: paidSubscribers,
      expiredStudents: expiredTrials,
      completedOnboarding: completedOnboarding,
      reachedFirstLearningActivity: completedMissions,
    },
    todayDetailed: {
      newRegistrationsToday: todayRegistrationsDb || todayRegistrationsTelemetry,
      newTrialStartsToday: todayTrialStartsDb || todayRegistrationsTelemetry,
      newPaymentOrdersToday: todayNewOrders.length,
      approvedPaymentsToday: todayApprovedOrders.length,
      rejectedPaymentsToday: todayRejectedOrders.length,
      activeLearningSessionsToday: Math.max(todayCompletedLearningEvents, todayUniqueUsers),
      errorsRecordedToday: todayErrorsRecorded || Math.max(clientErrors.length, 0),
      retestsToday: todayRetestsDone || todayTelemetry.filter((e) => e.eventName === "retest_completed").length,
    },
    learningSignals: {
      completedAtLeastOneMission: completedMissions,
      completedPractice: totalPracticeAttempts,
      triggeredErrorLab: totalErrorsRecorded,
      completedRepair: 0, // Invariant: Not separately telemetried
      completedRetest: totalRetestsPassed,
      demonstratingMasteryEvidence: totalDemonstratedSkills,
    },
    commercialOverview: {
      pendingPaymentOrders: pendingOrders.length,
      approvedToday: todayApprovedOrders.length,
      rejectedToday: todayRejectedOrders.length,
      activeSubscriptions: paidSubscribers,
      subscriptionsExpiringSoon: subscriptionsExpiringSoon,
      expiredSubscriptions: expiredSubscriptions,
    },
    attentionItems,
  };
}

export async function getStudentsOperationalList(
  operatorId?: string,
  token?: string | null
): Promise<StudentOperationalSummary[]> {
  const summaries: StudentOperationalSummary[] = [];
  const client = token ? createAuthenticatedSupabaseClient(token) : supabase;
  const pendingOrders = await getPaymentOrders({ status: "PENDING" }, token);
  const pendingUserIds = new Set(pendingOrders.map((o) => o.userId));

  if (isSupabaseConfigured && client) {
    try {
      let profiles: any[] | null = null;

      // 1. Try safe operator directory RPC if operatorId is provided
      if (operatorId) {
        const { data: rpcProfiles, error: rpcError } = await client.rpc(
          "ops_get_student_directory",
          { p_operator_id: operatorId, p_limit: 100 }
        );

        if (!rpcError && Array.isArray(rpcProfiles)) {
          profiles = rpcProfiles;
        }
      }

      // 2. Direct query fallback
      if (!profiles) {
        const { data: directProfiles } = await client
          .from("student_profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        profiles = directProfiles;
      }

      if (profiles && profiles.length > 0) {
        const now = new Date();
        for (const p of profiles) {
          const trialExpires = p.trial_expires_at ? new Date(p.trial_expires_at) : null;
          const remainingMs = trialExpires ? trialExpires.getTime() - now.getTime() : 0;
          const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));

          summaries.push({
            id: p.id,
            fullName: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "تلميذ مسجل",
            email: p.email,
            studentPhone: p.student_phone,
            streamId: p.stream_id,
            wilayaName: p.wilaya_name,
            communeName: p.commune_name,
            accessStatus: (p.access_status || (remainingMs <= 0 ? "EXPIRED" : "TRIAL")) as any,
            plan: p.plan || "PILOT_TRIAL",
            trialStartedAt: p.trial_started_at || p.created_at,
            trialExpiresAt: p.trial_expires_at,
            remainingHours,
            targetScore: Number(p.target_score) || 16.0,
            completedMissionsCount: 0,
            demonstratedSkillsCount: 0,
            activeErrorsCount: 0,
            resolvedRetestsCount: 0,
            lastActiveAt: p.updated_at || p.created_at,
            hasPendingPayment: pendingUserIds.has(p.id),
            subscriptionStartedAt: p.subscription_started_at,
            subscriptionExpiresAt: p.subscription_expires_at,
            createdAt: p.created_at,
            onboardingCompleted: Boolean(p.onboarding_completed || p.academic_profile_completed_at),
          });
        }
      }
    } catch {
      // Empty on error
    }
  }

  // Strictly return authentic profiles. Zero mock/test fallback students.
  return summaries;
}

/**
 * BAC Mastery - Diagnostic Repository
 * Manages Diagnostic sessions, answers, and analytical results in Supabase with LocalStorage fallback
 */

import { DiagnosticSession, DiagnosticAnalysisResult } from "@/types/diagnostic";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import {
  loadDiagnosticSession,
  saveDiagnosticSession,
  loadDiagnosticResults,
  saveDiagnosticResults,
} from "../diagnostic/session";

export const DiagnosticRepository = {
  /**
   * Save an in-progress diagnostic session
   */
  async saveSession(session: DiagnosticSession, userId?: string): Promise<void> {
    saveDiagnosticSession(session);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const sessionPayload = {
          id: session.sessionId,
          user_id: userId,
          status: session.status,
          coverage: "pilot",
          started_at: session.startedAt,
          completed_at: session.completedAt || null,
          metadata: {
            currentQuestionIndex: session.currentQuestionIndex,
            streamId: session.streamId,
          },
        };

        await supabase.from("diagnostic_sessions").upsert(sessionPayload, { onConflict: "id" });
      } catch (err) {
        console.error("DiagnosticRepository.saveSession error:", err);
      }
    }
  },

  /**
   * Save final diagnostic analytical results
   */
  async saveResults(results: DiagnosticAnalysisResult, userId?: string): Promise<void> {
    saveDiagnosticResults(results);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const resultsPayload = {
          session_id: results.sessionId,
          user_id: userId,
          observed_signal: results.coreDiagnosticSignal || results.observedDiagnosticScore || 0,
          coverage: results.coverage || "pilot",
          bottleneck_candidate: results.primaryBottleneck?.subjectId || null,
          confidence_calibration: results.calibration || {},
          question_count: results.questionCount || results.totalQuestions || 15,
          dimension_signals: results.dimensionScores || {},
          subject_signals: results.subjectScores || {},
          misconceptions: results.misconceptionTraps || [],
          limitations: results.limitations || [],
          source: results.source || "diagnostic_engine",
          created_at: results.completedAt || new Date().toISOString(),
        };

        await supabase.from("diagnostic_results").upsert(resultsPayload, { onConflict: "session_id" });
      } catch (err) {
        console.error("DiagnosticRepository.saveResults error:", err);
      }
    }
  },

  /**
   * Fetch latest diagnostic analytical results
   */
  async getResults(userId?: string): Promise<DiagnosticAnalysisResult | null> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("diagnostic_results")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("DiagnosticRepository.getResults error:", error);
          return loadDiagnosticResults();
        }

        if (data) {
          const local = loadDiagnosticResults();
          if (local) return local;

          const reconstructed: DiagnosticAnalysisResult = {
            sessionId: data.session_id,
            streamId: "sciences_exp",
            totalQuestions: data.question_count || 15,
            answeredQuestions: data.question_count || 15,
            observedDiagnosticScore: Number(data.observed_signal) || 0,
            coreDiagnosticSignal: Number(data.observed_signal) || 0,
            coverage: data.coverage || "pilot",
            subjectScores: data.subject_signals || {},
            dimensionScores: data.dimension_signals || {},
            calibration: data.confidence_calibration || { category: "well_calibrated" },
            primaryBottleneck: {
              subjectId: data.bottleneck_candidate || "natural_sciences",
              dimension: "understanding",
              severity: "moderate",
              observedScore: 0,
              title_ar: "نقص التحكم في المفاهيم الأساسية",
              title_fr: "Faiblesse sur les concepts fondamentaux",
              rationale_ar: "الأولوية الموصى بها لمعالجة الفجوة المعرفية الأكبر.",
              rationale_fr: "Priorité recommandée selon le diagnostic.",
            },
            misconceptionTraps: data.misconceptions || [],
            limitations: data.limitations || ["pilot_scope"],
            source: "diagnostic",
            completedAt: data.created_at,
          } as any;
          saveDiagnosticResults(reconstructed);
          return reconstructed;
        }
      } catch (err) {
        console.error("DiagnosticRepository.getResults exception:", err);
      }
    }

    return loadDiagnosticResults();
  },

  /**
   * Synchronize local diagnostic session/results to cloud upon login
   */
  async syncLocalToCloud(userId: string): Promise<void> {
    const localResults = loadDiagnosticResults();
    if (!localResults) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from("diagnostic_results")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (!data) {
          await this.saveResults(localResults, userId);
        }
      } catch (err) {
        console.error("DiagnosticRepository.syncLocalToCloud error:", err);
      }
    }
  },
};

/**
 * AI BAC Tutor Client Service & Must-Win Task Integration
 */

import { ChatMessage, TutorRequestBody, TutorResponse, TutorTask } from "@/types/tutor";
import { PlannerStorage, getTodayDateString } from "@/lib/planner/storage";

const TUTOR_STORAGE_KEY = "shater_bac_tutor_history";
const TUTOR_API_KEY_STORAGE = "shater_bac_tutor_gemini_key";

export const TutorClient = {
  /**
   * Fetches saved Gemini API key from local storage if student provided one
   */
  getStoredApiKey(): string {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(TUTOR_API_KEY_STORAGE) || "";
    } catch {
      return "";
    }
  },

  /**
   * Sets or clears student's personal Gemini API key
   */
  setStoredApiKey(key: string): void {
    if (typeof window === "undefined") return;
    try {
      if (!key) {
        localStorage.removeItem(TUTOR_API_KEY_STORAGE);
      } else {
        localStorage.setItem(TUTOR_API_KEY_STORAGE, key.trim());
      }
    } catch (e) {
      console.error("Failed to store tutor API key:", e);
    }
  },

  /**
   * Loads cached chat history from localStorage
   */
  loadChatHistory(): ChatMessage[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(TUTOR_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  /**
   * Saves chat history to localStorage
   */
  saveChatHistory(messages: ChatMessage[]): void {
    if (typeof window === "undefined") return;
    try {
      // Keep up to last 40 messages
      const sliced = messages.slice(-40);
      localStorage.setItem(TUTOR_STORAGE_KEY, JSON.stringify(sliced));
    } catch (e) {
      console.warn("Failed to persist tutor chat history:", e);
    }
  },

  /**
   * Clears conversation history
   */
  clearChatHistory(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(TUTOR_STORAGE_KEY);
    } catch {}
  },

  /**
   * Sends prompt to backend /api/ai/tutor
   */
  async sendMessage(params: TutorRequestBody): Promise<TutorResponse> {
    const clientApiKey = params.clientApiKey || this.getStoredApiKey();

    const res = await fetch("/api/ai/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        clientApiKey,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Tutor API error ${res.status}: ${errText}`);
    }

    return (await res.json()) as TutorResponse;
  },

  /**
   * Directly pushes a tutor suggested task to the student's 3 Must-Win Checklist & Daily Planner
   */
  async pushTaskToMustWin(userId: string, task: TutorTask): Promise<boolean> {
    try {
      const today = getTodayDateString();
      const now = new Date().toISOString();

      const newEvent = {
        id: `tutor-task-${Date.now()}`,
        userId,
        user_id: userId,
        title: task.title,
        type: "STUDY",
        event_type: "study",
        date: today,
        startTime: "18:00",
        start_time: "18:00",
        durationMinutes: task.minutes || 30,
        duration_minutes: task.minutes || 30,
        subjectId: task.subjectId || "general",
        subject_id: task.subjectId || "general",
        priority: "HIGH",
        status: "TODO",
        notes: task.reason || "مهمة مقترحة من الأستاذ الذكي لتثبيت المفهوم",
        description: task.reason || "مهمة مقترحة من الأستاذ الذكي لتثبيت المفهوم",
        source: "AI",
        createdAt: now,
        created_at: now,
        updatedAt: now,
        updated_at: now,
      };

      await PlannerStorage.saveEvent(newEvent);

      // Trigger custom UI event so MustWin components update reactively
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("must-win-updated", { detail: { eventId: newEvent.id } }));
        window.dispatchEvent(new CustomEvent("planner-events-updated"));
      }

      return true;
    } catch (err) {
      console.error("Failed to push task to Must-Win checklist:", err);
      return false;
    }
  },
};

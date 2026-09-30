/**
 * SHATER BAC — Diwan Guardian (Security, Moderation & Privacy Engine)
 * 
 * Protects student rooms from spam, flooding, PII leaks, harassment, and cheating:
 * 1. Rate Limiting: Max 5 messages in 10s per student.
 * 2. Flood Protection: Minimum 800ms between consecutive messages.
 * 3. Duplicate Spam Detection: Blocks identical messages sent within 30s.
 * 4. Message Bounds: 1 to 400 characters, compresses character spam (e.g. ههههههه).
 * 5. PII Redaction: Automatically obscures Algerian phone numbers and emails.
 * 6. Automated Escalation: Automatically flags/hides messages with >= 2 peer reports.
 * 7. Immutable Moderation Audit Log: Records every administrative action.
 */

import { supabase, isSupabaseConfigured } from "../supabase/client";

// Rate limiting & spam history tracking (in-memory per process)
interface UserMessageHistory {
  lastMessageTimestamp: number;
  timestampsInWindow: number[];
  lastMessageContent: string;
}

const userHistory = new Map<string, UserMessageHistory>();
const messageReportCounts = new Map<string, { count: number; reasons: string[] }>();

// In-memory immutable moderation audit log for fallback
export interface ModerationAuditLogEntry {
  id: string;
  moderator_id: string;
  action_type: "DELETE_MESSAGE" | "FLAG_MESSAGE" | "HIDE_MESSAGE" | "KICK_MEMBER" | "WARN_MEMBER";
  target_type: "MESSAGE" | "STUDENT" | "ROOM";
  target_id: string;
  room_id?: string;
  reason: string;
  timestamp: string;
}

const inMemoryModerationLogs: ModerationAuditLogEntry[] = [];

// Profanity & offensive words patterns (Algerian teen dialect + Arabic + French)
const OFFENSIVE_TERMS = [
  "قحب",
  "منيوك",
  "طحان",
  "زب",
  "نيك",
  "شرموط",
  "حمار",
  "كلب",
  "حقير",
  "قوادة",
  "قواد",
  "مرخس",
  "connard",
  "salope",
  "pute",
  "merde",
];

export const DiwanGuardian = {
  /**
   * Validate and sanitize message content against spam, flood, and policy violations
   */
  validateMessage(params: {
    userId: string;
    content: string;
    isReaction?: boolean;
  }): {
    valid: boolean;
    sanitizedContent: string;
    errorAr?: string;
  } {
    const { userId, content, isReaction } = params;
    const now = Date.now();

    // 1. Minimum and Maximum Length
    const trimmed = content.trim();
    if (!trimmed) {
      return { valid: false, sanitizedContent: "", errorAr: "لا يمكن إرسال رسالة فارغة." };
    }

    if (trimmed.length > 400 && !isReaction) {
      return {
        valid: false,
        sanitizedContent: trimmed.substring(0, 400),
        errorAr: "الرسالة طويلة جداً (الحد الأقصى 400 حرف لتجنب إرباك الطاولة).",
      };
    }

    // 2. User History for Rate Limiting & Flood
    const history = userHistory.get(userId) || {
      lastMessageTimestamp: 0,
      timestampsInWindow: [],
      lastMessageContent: "",
    };

    // A. Flood Protection: Minimum 800ms between consecutive messages
    const timeSinceLast = now - history.lastMessageTimestamp;
    if (timeSinceLast < 800 && !isReaction) {
      return {
        valid: false,
        sanitizedContent: trimmed,
        errorAr: "تمهل قليلاً! انتظر ثانية بين كل رسالة وأخرى لتفادي التشويش ⏱️",
      };
    }

    // B. Rate Limiting: Max 5 messages in 10 seconds
    const tenSecondsAgo = now - 10000;
    const recentTimestamps = history.timestampsInWindow.filter((t) => t > tenSecondsAgo);

    if (recentTimestamps.length >= 6) {
      return {
        valid: false,
        sanitizedContent: trimmed,
        errorAr: "أرسلت رسائل كثيرة بسرعة! خذ نفساً وانتظر 5 ثوانٍ قبل المتابعة 🧘",
      };
    }

    // C. Duplicate Spam Protection: Identical message within 30 seconds
    if (
      !isReaction &&
      history.lastMessageContent.trim() === trimmed &&
      now - history.lastMessageTimestamp < 30000
    ) {
      return {
        valid: false,
        sanitizedContent: trimmed,
        errorAr: "لقد أرسلت هذه الرسالة للتو؛ تجنب التكرار حفاظاً على نظام المجلس 💬",
      };
    }

    // 3. Compress Repetitive Character Flooding (e.g. ههههههههههههههههه -> ههههه)
    let sanitized = trimmed.replace(/(.)\1{6,}/g, "$1$1$1$1");

    // 4. Privacy & PII Redaction:
    // Redact Algerian phone numbers (05, 06, 07 followed by 8 digits or +213...)
    const phoneRegex = /(?:\+?213|0)[5-7]\d{8}/g;
    sanitized = sanitized.replace(phoneRegex, "[رقم هاتف مخفي للخصوصية 🔒]");

    // Redact email addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    sanitized = sanitized.replace(emailRegex, "[بريد مخفي للخصوصية 🔒]");

    // 5. Profanity / Inappropriate Content Check
    const lowerContent = sanitized.toLowerCase();
    for (const term of OFFENSIVE_TERMS) {
      if (lowerContent.includes(term)) {
        return {
          valid: false,
          sanitizedContent: sanitized,
          errorAr: "الرسالة تحتوي على ألفاظ غير لائقة تتعارض مع ميثاق مجلس العلم 🛡️",
        };
      }
    }

    // Update history
    recentTimestamps.push(now);
    userHistory.set(userId, {
      lastMessageTimestamp: now,
      timestampsInWindow: recentTimestamps,
      lastMessageContent: trimmed,
    });

    return {
      valid: true,
      sanitizedContent: sanitized,
    };
  },

  /**
   * Process a report on a message and automatically escalate if threshold reached
   */
  async handleReport(params: {
    messageId: string;
    roomId: string;
    reporterUserId: string;
    reason: string;
    details?: string;
  }): Promise<{ messageStatus: "VISIBLE" | "FLAGGED" | "HIDDEN"; reportCount: number }> {
    const { messageId, roomId, reporterUserId, reason, details } = params;

    // Track report count in-memory
    const existing = messageReportCounts.get(messageId) || { count: 0, reasons: [] };
    existing.count += 1;
    existing.reasons.push(reason);
    messageReportCounts.set(messageId, existing);

    let nextStatus: "VISIBLE" | "FLAGGED" | "HIDDEN" = "VISIBLE";

    // Auto-escalation threshold:
    // 2 reports -> FLAGGED
    // 3 or more reports -> HIDDEN automatically
    if (existing.count >= 3) {
      nextStatus = "HIDDEN";
    } else if (existing.count >= 2) {
      nextStatus = "FLAGGED";
    }

    // Persist to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("diwan_message_reports").insert({
          message_id: messageId,
          room_id: roomId,
          reporter_user_id: reporterUserId,
          reason,
          details: details || null,
        });

        if (nextStatus !== "VISIBLE") {
          await supabase
            .from("diwan_messages")
            .update({ status: nextStatus, is_deleted: nextStatus === "HIDDEN" })
            .eq("id", messageId);

          await this.logModerationAction({
            moderatorId: "SYSTEM_GUARDIAN",
            actionType: nextStatus === "HIDDEN" ? "HIDE_MESSAGE" : "FLAG_MESSAGE",
            targetType: "MESSAGE",
            targetId: messageId,
            roomId,
            reason: `تجاوز عتبة البلاغات (${existing.count} بلاغات: ${existing.reasons.join(", ")})`,
          });
        }
      } catch (err) {
        console.warn("[DiwanGuardian] handleReport DB error:", err);
      }
    }

    return { messageStatus: nextStatus, reportCount: existing.count };
  },

  /**
   * Record an immutable administrative action in the moderation audit log
   */
  async logModerationAction(params: {
    moderatorId: string;
    actionType: "DELETE_MESSAGE" | "FLAG_MESSAGE" | "HIDE_MESSAGE" | "KICK_MEMBER" | "WARN_MEMBER";
    targetType: "MESSAGE" | "STUDENT" | "ROOM";
    targetId: string;
    roomId?: string;
    reason: string;
  }): Promise<void> {
    const entry: ModerationAuditLogEntry = {
      id: `mod-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      moderator_id: params.moderatorId,
      action_type: params.actionType,
      target_type: params.targetType,
      target_id: params.targetId,
      room_id: params.roomId,
      reason: params.reason,
      timestamp: new Date().toISOString(),
    };

    inMemoryModerationLogs.push(entry);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("diwan_moderation_logs").insert({
          id: entry.id,
          moderator_id: entry.moderator_id,
          action_type: entry.action_type,
          target_type: entry.target_type,
          target_id: entry.target_id,
          room_id: entry.room_id || null,
          reason: entry.reason,
        });
      } catch (err) {
        console.warn("[DiwanGuardian] logModerationAction error:", err);
      }
    }
  },

  /**
   * Fetch audit logs for authorized operators (read-only)
   */
  getAuditLogs(): ModerationAuditLogEntry[] {
    return [...inMemoryModerationLogs];
  },
};

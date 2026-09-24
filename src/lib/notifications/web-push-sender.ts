import webPush from "web-push";
import { getVapidPublicKey, getVapidPrivateKey, getVapidSubject } from "./vapid";
import { FlashQuestion } from "@/types/recall";

let isVapidConfigured = false;

function ensureVapidSetup() {
  if (!isVapidConfigured) {
    try {
      webPush.setVapidDetails(
        getVapidSubject(),
        getVapidPublicKey(),
        getVapidPrivateKey()
      );
      isVapidConfigured = true;
    } catch (err) {
      console.error("[WebPush] Failed to configure VAPID details:", err);
    }
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url: string;
  questionId: string;
  options?: string[];
  actions?: Array<{ action: string; title: string }>;
  tag?: string;
}

export async function sendQuestionPushNotification(
  subscription: webPush.PushSubscription,
  question: FlashQuestion
): Promise<{ success: boolean; error?: string }> {
  ensureVapidSetup();

  // Create actionable buttons for up to 4 options (trimmed for push constraints)
  const actions = question.options.map((opt, idx) => ({
    action: `opt_${idx}`,
    title: opt.length > 28 ? opt.slice(0, 26) + ".." : opt,
  }));

  const payload: PushNotificationPayload = {
    title: `تحدي الاسترجاع الذكي ⚡ (${question.subject} - ${question.question_type})`,
    body: question.question_text,
    url: `/student/arena/quick-recall?questionId=${question.id}`,
    questionId: question.id,
    options: question.options,
    actions,
    tag: `recall_${question.id}`,
  };

  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 3600, // 1 hour
      urgency: "high",
    });
    return { success: true };
  } catch (err: any) {
    console.error("[WebPush] Error sending notification:", err);
    return {
      success: false,
      error: err?.message || "Failed to send notification",
    };
  }
}

export async function sendGenericPushNotification(
  subscription: webPush.PushSubscription,
  title: string,
  body: string,
  url: string = "/dashboard"
): Promise<{ success: boolean; error?: string }> {
  ensureVapidSetup();

  const payload = {
    title,
    body,
    url,
  };

  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (err: any) {
    console.error("[WebPush] Error sending generic notification:", err);
    return {
      success: false,
      error: err?.message || "Failed to send notification",
    };
  }
}

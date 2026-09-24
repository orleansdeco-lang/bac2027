/**
 * BAC Mastery - Web Push Client Helper
 * Manages service worker registration, push subscription, and VAPID key conversion.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function getPushPermissionState(): Promise<NotificationPermission | "unsupported"> {
  if (!isPushNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error("[WebPushClient] SW registration failed:", err);
    return null;
  }
}

export async function subscribeToPushNotifications(userId: string): Promise<{
  success: boolean;
  subscription?: PushSubscriptionJSON;
  error?: string;
}> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: "المتصفح الحالي لا يدعم إشعارات الويب المباشرة." };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "تم رفض إذن الإشعارات من قِبل المتصفح." };
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      return { success: false, error: "فشل تهيئة الـ Service Worker." };
    }

    // Fetch VAPID public key
    const vapidRes = await fetch("/api/recall/vapid-key");
    const { publicKey } = await vapidRes.json();
    if (!publicKey) {
      return { success: false, error: "مفتاح VAPID غير متاح حالياً." };
    }

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // Existing or new subscription
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
    }

    const subJson = subscription.toJSON();

    // Persist to server
    await fetch("/api/recall/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        pushSubscription: subJson,
        isActive: true,
      }),
    });

    return { success: true, subscription: subJson };
  } catch (err: any) {
    console.error("[WebPushClient] Subscription error:", err);
    return { success: false, error: err?.message || "حدث خطأ أثناء الاشتراك في الإشعارات." };
  }
}

export async function unsubscribeFromPushNotifications(userId: string): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }

    await fetch("/api/recall/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        pushSubscription: null,
        isActive: false,
      }),
    });

    return true;
  } catch (err) {
    console.error("[WebPushClient] Unsubscribe error:", err);
    return false;
  }
}

export async function triggerTestPushNotification(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`/api/recall/dispatch?userId=${userId}&force=true`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success && data.dispatchedCount > 0) {
      return { success: true, message: "تم إرسال إشعار تجريبي فوري بنجاح! تفقد شاشة جهازك." };
    } else {
      return {
        success: false,
        message: data.results?.[0]?.reason || data.error || "تعذر إرسال الإشعار. تحقق من تفعيل الاشتراك.",
      };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || "فشل الاتصال بخادم الإشعارات." };
  }
}

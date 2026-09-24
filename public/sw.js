/**
 * BAC Mastery — Progressive Web App Service Worker (v1.0)
 * Offline asset caching, fast boot, and Web Push Notifications.
 */

const CACHE_NAME = "bac-mastery-cache-v1";
const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/curriculum",
  "/diagnostic",
  "/memorize",
  "/calculator",
  "/scientific-calculator",
  "/manifest.json",
  "/favicon.svg",
  "/app-icon.svg",
];

// Install: Cache essential shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first for dynamic navigation, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests, API calls, and Supabase auth calls
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return;
  }

  // Static images, svg, icons -> Cache First
  if (
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages & Navigation -> Network First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") {
            return caches.match("/dashboard") || caches.match("/");
          }
          return null;
        });
      })
  );
});

// Push Notifications handler (Active Recall & Smart Coach)
self.addEventListener("push", (event) => {
  let data = {
    title: "SHATER BAC — استرجاع نشط ⚡",
    body: "حان موعد سؤال الاسترجاع السريع لتثبيت مكتسباتك.",
    url: "/student/arena/quick-recall",
    questionId: null,
    actions: [],
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  // Construct notification options with Actionable Buttons if provided
  const notificationActions = [];
  if (Array.isArray(data.actions) && data.actions.length > 0) {
    // Add up to 4 choice buttons for inline answering
    data.actions.slice(0, 4).forEach((act) => {
      notificationActions.push({
        action: act.action,
        title: act.title,
      });
    });
  } else {
    // Fallback actions
    notificationActions.push(
      { action: "open_challenge", title: "تحدي الاسترجاع السريع ⚡" },
      { action: "close", title: "لاحقاً" }
    );
  }

  const options = {
    body: data.body,
    icon: "/app-icon.svg",
    badge: "/favicon.svg",
    dir: "rtl",
    lang: "ar",
    vibrate: [150, 80, 150],
    tag: data.tag || (data.questionId ? `recall_${data.questionId}` : "bac_push"),
    renotify: true,
    data: {
      url: data.url || (data.questionId ? `/student/arena/quick-recall?questionId=${data.questionId}` : "/student/arena/quick-recall"),
      questionId: data.questionId,
    },
    actions: notificationActions,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler (Dual-Mode: Inline Action vs In-App Deep Link)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const notifData = event.notification.data || {};
  const questionId = notifData.questionId;
  const targetUrl = notifData.url || (questionId ? `/student/arena/quick-recall?questionId=${questionId}` : "/student/arena/quick-recall");

  // MODE 1: User clicked an Actionable Option button (e.g. opt_0, opt_1, opt_2, opt_3)
  if (event.action && event.action.startsWith("opt_") && questionId) {
    const selectedIndex = parseInt(event.action.replace("opt_", ""), 10);

    const answerPromise = fetch("/api/recall/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: questionId,
        selectedOptionIndex: selectedIndex,
        source: "inline_push",
      }),
    })
      .then((res) => res.json())
      .then((resData) => {
        // Show immediate feedback notification
        if (resData.is_correct) {
          const streakMsg = resData.consecutive_correct > 1
            ? `متتالي: ${resData.consecutive_correct} 🔥 (المستوى ${resData.new_box_level})`
            : `المستوى ${resData.new_box_level}`;
          return self.registration.showNotification("✅ إجابة صحيحة! أحسنت 🎯", {
            body: `تم تسجيل استرجاعك بنجاح. ${streakMsg}. تم تحديث موعد المراجعة القادمة.`,
            icon: "/app-icon.svg",
            badge: "/favicon.svg",
            dir: "rtl",
            lang: "ar",
            tag: `feedback_${questionId}`,
            data: { url: "/student/arena/quick-recall" },
            actions: [{ action: "open_challenge", title: "مواصلة التحدي ⚡" }],
          });
        } else {
          return self.registration.showNotification("❌ إجابة خاطئة — تم نقل السؤال لمعمل الأخطاء", {
            body: `${resData.explanation || "راجع الثغرة في الدرس لترميمها."}\nانقر الآن للعلاج الفوري.`,
            icon: "/app-icon.svg",
            badge: "/favicon.svg",
            dir: "rtl",
            lang: "ar",
            tag: `feedback_${questionId}`,
            data: { url: resData.target_lesson_url || `/student/arena/quick-recall?questionId=${questionId}` },
            actions: [{ action: "open_remedy", title: "راجع ثغرة هذا الدرس 📖" }],
          });
        }
      })
      .catch((err) => {
        console.error("[SW] Error answering inline:", err);
      });

    event.waitUntil(answerPromise);
    return;
  }

  // MODE 2: Deep Link into Quick Sprint challenge
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

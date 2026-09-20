/**
 * SHATER Planner — Multi-Tiered Notification Engine
 * Rules: Non-spammy, positive, guilt-free, respects student's spiritual choices.
 */

import { PlannerNotificationItem, NotificationPreferences, PlannerEvent } from "./types";
import { PlannerStorage, getTodayDateString } from "./storage";

const SPIRITUAL_REMINDERS = [
  {
    ar: "🤲 'رَبِّ زِدْنِي عِلْمًا' — استعن بالله ولا تعجز، خطوة صغيرة اليوم تصنع فارقاً كبيراً غداً.",
    fr: "🤲 'Seigneur, accrois mes connaissances' — Place ta confiance en Dieu et fais de ton mieux.",
    verse: "طه: 114",
  },
  {
    ar: "✨ 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ'",
    fr: "✨ 'Ô vous qui avez cru ! Cherchez secours dans l'endurance et la prière.'",
    verse: "البقرة: 153",
  },
  {
    ar: "🌱 'وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ' — جهدك وتعبك محفوظ ولن يضيع أبداً.",
    fr: "🌱 'Et dis : Œuvrez, car Dieu verra votre œuvre.' Ton travail n'est jamais vain.",
    verse: "التوبة: 105",
  },
  {
    ar: "💡 'إِنَّ مَعَ الْعُسْرِ يُسْرًا' — كل مسألة صعبة تصبح سهلة مع المحاولة والتكرار.",
    fr: "💡 'À côté de la difficulté est certes une facilité.' Tout obstacle s'efface avec la persévérance.",
    verse: "الشرح: 6",
  },
];

export const NotificationService = {
  /**
   * Get active smart notification feed for current date
   */
  async getNotifications(
    userId: string = "demo-user",
    events: PlannerEvent[] = []
  ): Promise<PlannerNotificationItem[]> {
    const prefs = await PlannerStorage.loadNotificationPreferences(userId);
    return this.generateSmartNotifications(events, prefs);
  },

  /**
   * Synchronously or immediately generate notifications given current state
   */
  generateSmartNotifications(
    events: PlannerEvent[] = [],
    customPrefs?: NotificationPreferences
  ): PlannerNotificationItem[] {
    const prefs = customPrefs || PlannerStorage.getNotificationPreferences();
    const notifications: PlannerNotificationItem[] = [];
    const today = getTodayDateString();
    const todayEvents = events.filter((e) => e.date === today);
    const completedCount = todayEvents.filter((e) => e.status === "COMPLETED" || e.status === "completed").length;

    // 1. Morning Notification (08:00)
    if (prefs.morningReminder ?? prefs.morning_brief) {
      notifications.push({
        id: "notif-morning",
        type: "MORNING",
        title: "صباح الخير ☀️",
        titleAr: "صباح الخير ☀️",
        titleFr: "Bon matin !",
        message: `يوم جديد وفرصة حقيقية باش تقرب خطوة من هدفك في البكالوريا. عندك اليوم ${todayEvents.length} أهداف مبرمجة.`,
        messageAr: `يوم جديد وفرصة حقيقية باش تقرب خطوة من هدفك في البكالوريا. عندك اليوم ${todayEvents.length} أهداف مبرمجة.`,
        messageFr: `Une belle journée pour avancer vers ton rêve ! Tu as ${todayEvents.length} tâches au programme aujourd'hui.`,
        time: prefs.morningTime || "08:00",
        scheduled_time: prefs.morningTime || "08:00",
        isRead: false,
        is_read: false,
        actionUrl: "/planner",
      });
    }

    // 2. Upcoming Task Reminder (15 minutes prior)
    if (prefs.upcomingTaskReminder ?? prefs.task_reminders) {
      const activeTask = todayEvents.find((e) => e.status === "TODO" || e.status === "pending" || e.status === "IN_PROGRESS" || e.status === "in_progress");
      if (activeTask) {
        notifications.push({
          id: `notif-upcoming-${activeTask.id}`,
          type: "UPCOMING",
          title: "تذكير قبل المهمة ⏰",
          titleAr: "تذكير قبل المهمة ⏰",
          titleFr: "Rappel de tâche",
          message: `بعد 15 دقيقة موعد: ${activeTask.title}. حضّر كراسك وابدأ بهدوء وتركيز.`,
          messageAr: `بعد 15 دقيقة موعد: ${activeTask.title}. حضّر كراسك وابدأ بهدوء وتركيز.`,
          messageFr: `Dans 15 minutes : ${activeTask.title}. Prépare-toi tranquillement !`,
          time: activeTask.startTime || activeTask.start_time || "16:45",
          scheduled_time: activeTask.startTime || activeTask.start_time || "16:45",
          isRead: false,
          is_read: false,
          actionUrl: `/planner`,
        });
      }
    }

    // 3. Task / In-Session Motivation
    if (prefs.completionEncouragement ?? true) {
      notifications.push({
        id: "notif-motivation",
        type: "COMPLETION",
        title: "تحفيز الاستمرار 🎯",
        titleAr: "تحفيز الاستمرار 🎯",
        titleFr: "Motivation",
        message:
          completedCount > 0
            ? `أنجزت ${completedCount} مهام حتى الآن! كل خطوة تزيد ثقتك وسيطرتك على المنهاج.`
            : `ما بديتش اليوم؟ عادي جداً، مازال الوقت متاح. ابدأ الآن بجلسة خفيفة 25 دقيقة.`,
        messageAr:
          completedCount > 0
            ? `أنجزت ${completedCount} مهام حتى الآن! كل خطوة تزيد ثقتك وسيطرتك على المنهاج.`
            : `ما بديتش اليوم؟ عادي جداً، مازال الوقت متاح. ابدأ الآن بجلسة خفيفة 25 دقيقة.`,
        messageFr:
          completedCount > 0
            ? `Tu as déjà complété ${completedCount} tâche(s) ! Continue, tu es sur la bonne voie.`
            : `Pas encore démarré ? Pas de panique. Fais juste une session courte de 25 min.`,
        time: "18:00",
        scheduled_time: "18:00",
        isRead: false,
        is_read: false,
        actionUrl: "/planner",
      });
    }

    // 4. Evening Reflection Reminder (21:00)
    if (prefs.eveningReflectionReminder ?? prefs.evening_reflection) {
      notifications.push({
        id: "notif-reflection",
        type: "EVENING_REFLECTION",
        title: "مراجعة اليوم 🌙",
        titleAr: "مراجعة اليوم 🌙",
        titleFr: "Réflexion du jour",
        message: "قبل ما تسالي نهارك... واش تعلمت اليوم؟ وكيف جاز نهارك؟ شاركنا في دقيقة واحدة.",
        messageAr: "قبل ما تسالي نهارك... واش تعلمت اليوم؟ وكيف جاز نهارك؟ شاركنا في دقيقة واحدة.",
        messageFr: "Qu'as-tu appris aujourd'hui ? Comment s'est passée ta journée ? Enregistre ton bilan.",
        time: prefs.eveningTime || "21:00",
        scheduled_time: prefs.eveningTime || "21:00",
        isRead: false,
        is_read: false,
        actionUrl: "/planner",
      });
    }

    // 5. Spiritual Reminder (Optional / Peaceful)
    if (prefs.spiritualReminders ?? prefs.spiritual_reminders) {
      const reminder = SPIRITUAL_REMINDERS[Math.floor(Math.random() * SPIRITUAL_REMINDERS.length)];
      notifications.push({
        id: "notif-spiritual",
        type: "SPIRITUAL",
        title: "تذكير روحي 🤲",
        titleAr: "تذكير روحي 🤲",
        titleFr: "Rappel spirituel",
        message: reminder.ar,
        messageAr: reminder.ar,
        messageFr: reminder.fr,
        time: "21:30",
        scheduled_time: "21:30",
        isRead: false,
        is_read: false,
      });
    }

    return notifications;
  },

  /**
   * Request browser push notification permission if supported
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  },

  /**
   * Trigger local browser toast / notification if permitted
   */
  notify(title: string, body: string) {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/icon.svg",
        });
      } catch (err) {
        console.warn("Browser notification trigger failed", err);
      }
    }
  },
};

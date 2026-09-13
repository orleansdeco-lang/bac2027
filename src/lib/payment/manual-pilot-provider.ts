/**
 * BAC Mastery — Manual Pilot Payment Provider
 * Prompt 18: Clean Payment Abstraction
 * 
 * Invariants:
 * - Does NOT fabricate fake payment success
 * - Explicitly marks gateway integration as pending
 * - Provides honest pilot activation instructions
 */

import {
  PaymentProvider,
  PaymentPlan,
  CheckoutRequest,
  CheckoutResult,
  PaymentStatusResult,
  PilotPaymentRecord,
  PilotPaymentState,
} from "./types";

export const CANONICAL_PLANS: Record<string, PaymentPlan> = {
  season: {
    id: "season",
    name_ar: "اشتراك الموسم الدراسي",
    name_fr: "Pass Saison BAC",
    priceDZD: 0,
    durationMonths: 10,
    description_ar: "وصول غير محدود لجميع الدروس، التدريبات، والتصحيحات حتى يوم امتحان البكالوريا.",
    description_fr: "Accès illimité à toutes les missions, entraînements et retests jusqu'aux épreuves du BAC.",
    features_ar: [
      "خريطة تعلم ذكية تتكيف مع أخطائك اليومية",
      "تحليل فوري لجذور التعثر البيداغوجي (Error Lab)",
      "أدلة معالجة موجهة خطوة بخطوة لكل مهارة",
      "اختبارات توأم مستقلة لتأكيد الإتقان الحقيقي",
      "تغطية كاملة للمواد الأساسية (رياضيات، فيزياء، علوم)",
    ],
    features_fr: [
      "Roadmap adaptative recalibrée sur vos erreurs réelles",
      "Diagnostic immédiat des causes profondes (Error Lab)",
      "Guides de remédiation en 4 étapes par compétence",
      "Retests jumeaux indépendants pour valider la maîtrise",
      "Couverture complète des matières majeures (Maths, Physique, SVT)",
    ],
    active: false,
  },
  monthly: {
    id: "monthly",
    name_ar: "الاشتراك الشهري",
    name_fr: "Pass Mensuel",
    priceDZD: 0,
    durationMonths: 1,
    description_ar: "وصول كامل وشامل لمدة شهر كامل (30 يوماً) قابل للتجديد.",
    description_fr: "Accès complet pendant 1 mois (30 jours) renouvelable.",
    features_ar: [
      "تفعيل فوري لجميع أدوات التشخيص والتعلم الذكي",
      "وصول كامل لمعمل الأخطاء (Error Lab) والمهام اليومية",
      "متابعة دقيقة لمستوى التقدم ونقاط الضعف",
      "مرونة تامة للتجديد شهرياً حسب رغبتك واحتياجك",
    ],
    features_fr: [
      "Activation immédiate de tous les outils de diagnostic",
      "Accès complet à l'Error Lab et aux missions quotidiennes",
      "Suivi précis de la progression et des points faibles",
      "Renouvelable chaque mois selon vos besoins",
    ],
    active: false,
  },
  bac_season_pass_pilot: {
    id: "bac_season_pass_pilot",
    name_ar: "موسم البكالوريا الكامل",
    name_fr: "Pass Saison BAC",
    priceDZD: 0,
    durationMonths: 10,
    description_ar: "وصول غير محدود لجميع الدروس، التدريبات، والتصحيحات حتى يوم امتحان البكالوريا.",
    description_fr: "Accès illimité à toutes les missions, entraînements et retests jusqu'aux épreuves du BAC.",
    features_ar: [
      "خريطة تعلم ذكية تتكيف مع أخطائك اليومية",
      "تحليل فوري لجذور التعثر البيداغوجي (Error Lab)",
      "أدلة معالجة موجهة خطوة بخطوة لكل مهارة",
      "اختبارات توأم مستقلة لتأكيد الإتقان الحقيقي",
      "تغطية كاملة للمواد الأساسية (رياضيات، فيزياء، علوم)",
    ],
    features_fr: [
      "Roadmap adaptative recalibrée sur vos erreurs réelles",
      "Diagnostic immédiat des causes profondes (Error Lab)",
      "Guides de remédiation en 4 étapes par compétence",
      "Retests jumeaux indépendants pour valider la maîtrise",
      "Couverture complète des matières majeures (Maths, Physique, SVT)",
    ],
    active: false,
  },
};

export const PILOT_BAC_PLAN: PaymentPlan = CANONICAL_PLANS.season;

export const PILOT_PAYMENT_RECORDS_KEY = "bac_mastery_pilot_payment_records";

export function getStoredPaymentRecords(userId?: string): PilotPaymentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PILOT_PAYMENT_RECORDS_KEY);
    const records: PilotPaymentRecord[] = raw ? JSON.parse(raw) : [];
    if (userId) {
      return records.filter((r) => r.userId === userId);
    }
    return records;
  } catch {
    return [];
  }
}

export function savePaymentRecord(record: PilotPaymentRecord): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredPaymentRecords();
    const updated = [record, ...existing.filter((r) => r.requestId !== record.requestId)].slice(0, 50);
    localStorage.setItem(PILOT_PAYMENT_RECORDS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}

export function markPaymentPendingVerification(requestId: string): PilotPaymentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = getStoredPaymentRecords();
    const target = existing.find((r) => r.requestId === requestId);
    if (!target) return null;
    const updatedRecord: PilotPaymentRecord = {
      ...target,
      state: "PAYMENT_PENDING_VERIFICATION",
      updatedAt: new Date().toISOString(),
    };
    savePaymentRecord(updatedRecord);

    // Sync to authoritative server endpoint
    fetch("/api/ops/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: target.userId,
        plan: target.planId,
        amount: target.amountDZD,
        paymentMethod: "baridimob",
        notes: `Verification requested for ref: ${requestId}`,
        studentEmail: target.studentEmail,
      }),
    }).catch(() => {});

    return updatedRecord;
  } catch {
    return null;
  }
}

export class ManualPilotPaymentProvider implements PaymentProvider {
  readonly id = "manual_pilot";
  readonly name = "تفعيل تجريبي يدوي (بوابة الدفع قيد الربط)";
  readonly isLive = false;

  async getAvailablePlans(): Promise<PaymentPlan[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/subscriptions/plans");
        if (res.ok) {
          const data = await res.json();
          if (data.plans && data.plans.length > 0) {
            return data.plans.map((p: any) => {
              const base = CANONICAL_PLANS[p.id] || CANONICAL_PLANS.season;
              return {
                ...base,
                id: p.id,
                name_ar: p.name || base.name_ar,
                priceDZD: p.price_dzd,
                durationMonths: p.duration_months,
                active: p.active !== false,
              };
            });
          }
        }
      } catch {
        // Fallback to static defaults
      }
    }

    return [CANONICAL_PLANS.season, CANONICAL_PLANS.monthly];
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    const referenceId = `PILOT-BAC-${req.userId.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const rawPlanId = req.planId || "season";
    const canonical = CANONICAL_PLANS[rawPlanId] || CANONICAL_PLANS.season;
    const finalPlanId = rawPlanId;
    const finalAmount = canonical.priceDZD;

    const record: PilotPaymentRecord = {
      requestId: referenceId,
      userId: req.userId,
      planId: finalPlanId,
      amountDZD: finalAmount,
      currency: "DZD",
      state: "PAYMENT_REQUESTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentEmail: req.studentEmail,
    };
    savePaymentRecord(record);

    // Also persist server-side payment order
    if (typeof window !== "undefined") {
      fetch("/api/ops/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: req.userId,
          plan: finalPlanId,
          amount: finalAmount,
          paymentMethod: "baridimob",
          notes: `Reference ID: ${referenceId}`,
          studentEmail: req.studentEmail,
        }),
      }).catch(() => {});
    }

    return {
      status: "READY",
      provider: this.id,
      referenceId,
      instructions_ar:
        "تم تسجيل طلب التفعيل بنجاح. يرجى إرسال الرمز المرجعي إلى فريق الدعم البيداغوجي لتأكيد العملية والتحقق منها وتفعيل اشتراكك يدويّاً.",
      instructions_fr:
        "Demande d'activation enregistrée. Veuillez transmettre votre référence au support pédagogique pour vérification manuelle et activation de votre compte.",
      requiresManualVerification: true,
    };
  }

  async getPaymentStatus(userId: string): Promise<PaymentStatusResult> {
    const userRecords = getStoredPaymentRecords(userId);
    const latest = userRecords[0];

    if (!latest || latest.state === "PAYMENT_NOT_STARTED" || latest.state === "PAYMENT_CANCELLED") {
      return { status: "UNPAID" };
    }

    if (latest.state === "PAYMENT_CONFIRMED") {
      return {
        status: "VERIFIED",
        paidAt: latest.confirmedAt,
        amountDZD: latest.amountDZD,
        providerReference: latest.requestId,
      };
    }

    if (latest.state === "PAYMENT_REJECTED") {
      return {
        status: "FAILED",
        amountDZD: latest.amountDZD,
        providerReference: latest.requestId,
      };
    }

    // Default for PAYMENT_REQUESTED and PAYMENT_PENDING_VERIFICATION
    return {
      status: "PENDING_VERIFICATION",
      providerReference: latest.requestId,
      amountDZD: latest.amountDZD,
    };
  }

  async handlePaymentConfirmation(_userId: string, _confirmationToken: string): Promise<boolean> {
    // Non-negotiable: client button clicks cannot authorize PAID status
    // Activation requires authoritative backend administrative approval
    return false;
  }
}


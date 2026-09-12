/**
 * BAC Mastery — Manual Pilot Payment Provider
 * Prompt 18: Clean Payment Abstraction
 * 
 * Invariants:
 * - Does NOT fabricate fake payment success
 * - Explicitly marks gateway integration as pending
 * - Provides honest pilot activation instructions
 */

import { PaymentProvider, PaymentPlan, CheckoutRequest, CheckoutResult, PaymentStatusResult } from "./types";

export const PILOT_BAC_PLAN: PaymentPlan = {
  id: "bac_season_pass_pilot",
  name_ar: "موسم البكالوريا الكامل",
  name_fr: "Pass Saison BAC",
  priceDZD: 3900,
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
};

export class ManualPilotPaymentProvider implements PaymentProvider {
  readonly id = "manual_pilot";
  readonly name = "تفعيل تجريبي يدوي (بوابة الدفع قيد الربط)";
  readonly isLive = false;

  async getAvailablePlans(): Promise<PaymentPlan[]> {
    return [PILOT_BAC_PLAN];
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    const referenceId = `PILOT-BAC-${req.userId.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    return {
      status: "READY",
      provider: this.id,
      referenceId,
      instructions_ar:
        "التفعيل متاح حالياً بشكل تجريبي للدفعة الأولى من تلاميذ البكالوريا. يرجى إرسال الرمز المرجعي إلى فريق الدعم البيداغوجي لتأكيد تفعيل الحساب يدوياً بعد التحقق.",
      instructions_fr:
        "L'activation est actuellement en phase pilote pour la première cohorte d'élèves. Veuillez transmettre votre référence au support pédagogique pour activation après vérification manuelle.",
      requiresManualVerification: true,
    };
  }

  async getPaymentStatus(userId: string): Promise<PaymentStatusResult> {
    // Strictly honest: in pilot mode, client queries cannot falsely report VERIFIED
    return {
      status: "PENDING_VERIFICATION",
      providerReference: `REF-${userId.slice(0, 8)}`,
    };
  }

  async handlePaymentConfirmation(_userId: string, _confirmationToken: string): Promise<boolean> {
    // Non-negotiable: client button clicks cannot authorize PAID status
    // Activation requires authoritative backend administrative approval
    return false;
  }
}

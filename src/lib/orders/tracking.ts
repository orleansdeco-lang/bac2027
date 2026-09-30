import { getCarrierTrackingUrl, resolveCarrierInfo } from "@/lib/shipping/carriers";
import { AUTHORITATIVE_PLANS } from "@/lib/operations/payments";

export type TimelineStepState = "completed" | "current" | "pending" | "failed";

export interface TrackingTimelineStep {
  id: string;
  step_number: number;
  title: string;
  symbol: "✓" | "●" | "○" | "✕";
  description: string;
  state: TimelineStepState;
  timestamp?: string | null;
  formatted_timestamp?: string | null;
  carrier?: string;
  tracking_number?: string;
  tracking_url?: string | null;
}

export interface ActivatedSubscriptionInfo {
  is_active: boolean;
  plan_name: string;
  plan_duration: string;
  starts_at: string | null;
  formatted_starts_at: string | null;
  expires_at: string | null;
  formatted_expires_at: string | null;
  days_remaining: number | null;
  badge_label: string;
}

export interface OrderTrackingData {
  order_id: string;
  order_number: string;
  created_at: string;
  formatted_created_at: string;
  plan: {
    id: string;
    name: string;
    duration: string;
  };
  financials: {
    amount: number;
    currency: string;
    formatted_amount: string;
    payment_method: string;
    payment_status: string;
    is_paid: boolean;
  };
  shipping: {
    recipient_name: string;
    wilaya: string;
    commune: string;
    address: string;
    carrier?: string;
    tracking_number?: string;
    tracking_url?: string | null;
    delivery_status: string;
    shipped_at?: string | null;
    delivered_at?: string | null;
  };
  subscription: ActivatedSubscriptionInfo;
  timeline: TrackingTimelineStep[];
  overall_status: {
    key: string;
    label: string;
    description: string;
    variant: "info" | "warning" | "success" | "error";
  };
}

export function formatArabicDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان",
      "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr || "";
  }
}

export function formatArabicDateTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dateFormatted = formatArabicDate(dateStr);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${dateFormatted} - ${hours}:${minutes}`;
  } catch {
    return dateStr || "";
  }
}

export function calculateDaysRemaining(expiresAtStr?: string | null): number | null {
  if (!expiresAtStr) return null;
  try {
    const exp = new Date(expiresAtStr).getTime();
    if (isNaN(exp)) return null;
    const now = Date.now();
    const diffMs = exp - now;
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return null;
  }
}

export function resolvePlanMetadata(planId?: string) {
  const pId = (planId || "season").toLowerCase();
  if (pId === "monthly") {
    return { name: "الاشتراك الشهري", duration: "شهر واحد (30 يوماً)" };
  }
  if (pId === "quarterly" || pId === "3_months" || pId === "trimestre") {
    return { name: "SHATER BAC", duration: "3 أشهر" };
  }
  if (pId === "season" || pId === "bac_season_pass_pilot") {
    return { name: "SHATER BAC (موسم كامل)", duration: "10 أشهر (حتى البكالوريا)" };
  }
  const authPlan = (AUTHORITATIVE_PLANS as any)?.[pId];
  if (authPlan) {
    return {
      name: authPlan.name_ar,
      duration: `${authPlan.durationMonths} أشهر`,
    };
  }
  return { name: `باقة شاطر (${planId})`, duration: "موسم البكالوريا" };
}

/**
 * Builds the canonical 8-stage Timeline for Student Order Tracking.
 *
 * The 8 Stages:
 * 1. تم تسجيل الطلب
 * 2. تم تأكيد الطلب
 * 3. تم تجهيز الطلب
 * 4. تم الشحن
 * 5. في الطريق
 * 6. تم التسليم
 * 7. تم تأكيد الدفع
 * 8. تم تفعيل الاشتراك
 *
 * Invariant:
 * Strictly avoids exposing internal sensitive statuses, operator IDs, internal staff notes,
 * or courier financial settlement reconciliation internals.
 */
export function buildOrderTrackingTimeline(
  order: any,
  shipment?: any,
  payment?: any,
  subscription?: any,
  shippingAddress?: any
): OrderTrackingData {
  const orderStatus = (order?.status || "PENDING").toUpperCase();
  const deliveryStatus = (shipment?.status || order?.delivery_status || "PENDING").toUpperCase();
  const paymentStatus = (payment?.status || (order?.payment_method === "cash" ? "COD" : order?.status) || "COD").toUpperCase();
  const subStatus = (subscription?.status || (paymentStatus === "PAID" ? "ACTIVE" : "PENDING")).toUpperCase();

  const isCancelled = orderStatus === "CANCELLED";
  const isDeliveryReturned = deliveryStatus === "RETURNED";
  const isDeliveryFailed = deliveryStatus === "FAILED";

  const carrier = shipment?.carrier || "Yalidine Express";
  const trackingNumber = shipment?.tracking_number || order?.tracking_number || null;
  const trackingUrl = getCarrierTrackingUrl(carrier, trackingNumber);

  const planMeta = resolvePlanMetadata(order?.plan_id || order?.plan);

  // 1. Step 1: تم تسجيل الطلب
  const step1State: TimelineStepState = isCancelled ? "failed" : "completed";
  const step1: TrackingTimelineStep = {
    id: "order_registered",
    step_number: 1,
    title: "تم تسجيل الطلب",
    symbol: isCancelled ? "✕" : "✓",
    description: "تم تسجيل طلبك بنجاح في المنصة وتخصيص رقم المرجع.",
    state: step1State,
    timestamp: order?.created_at,
    formatted_timestamp: formatArabicDateTime(order?.created_at),
  };

  // 2. Step 2: تم تأكيد الطلب
  const isStep2Completed =
    ["CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED"].includes(orderStatus) ||
    ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(deliveryStatus) ||
    paymentStatus === "PAID" ||
    subStatus === "ACTIVE";

  let step2State: TimelineStepState = "pending";
  if (isCancelled) {
    step2State = isStep2Completed ? "completed" : "failed";
  } else if (isStep2Completed) {
    step2State = "completed";
  } else if (orderStatus === "PENDING") {
    step2State = "current";
  }

  const step2: TrackingTimelineStep = {
    id: "order_confirmed",
    step_number: 2,
    title: "تم تأكيد الطلب",
    symbol: step2State === "completed" ? "✓" : step2State === "current" ? "●" : step2State === "failed" ? "✕" : "○",
    description:
      step2State === "completed"
        ? "تمت مراجعة بيانات التوصيل وتأكيد الطلب."
        : step2State === "current"
        ? "طلبك قيد المراجعة، سيتصل بك فريق العمل أو يتواصل عبر الواتساب لتأكيد العنوان وموعد التسليم."
        : "يتم تأكيد الطلب بعد مراجعة بيانات الاتصال.",
    state: step2State,
    timestamp: isStep2Completed ? order?.updated_at || order?.created_at : null,
    formatted_timestamp: isStep2Completed ? formatArabicDateTime(order?.updated_at || order?.created_at) : null,
  };

  // 3. Step 3: تم تجهيز الطلب
  const isStep3Completed =
    ["PROCESSING", "SHIPPED", "COMPLETED"].includes(orderStatus) ||
    ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(deliveryStatus) ||
    paymentStatus === "PAID" ||
    subStatus === "ACTIVE";

  let step3State: TimelineStepState = "pending";
  if (isCancelled) {
    step3State = isStep3Completed ? "completed" : "pending";
  } else if (isStep3Completed) {
    step3State = "completed";
  } else if (isStep2Completed && orderStatus === "CONFIRMED") {
    step3State = "current";
  }

  const step3: TrackingTimelineStep = {
    id: "order_processed",
    step_number: 3,
    title: "تم تجهيز الطلب",
    symbol: step3State === "completed" ? "✓" : step3State === "current" ? "●" : "○",
    description:
      step3State === "completed"
        ? "تم تجهيز علبة شاطر المادية وبطاقة الاشتراك وطباعة بوليصة الشحن."
        : step3State === "current"
        ? "جاري تجهيز العلبة المادية وتغليف البطاقة الذكية وخارطة الطريق في مستودع شاطر."
        : "يتم تجهيز الطرد فور تأكيد بيانات الطلب.",
    state: step3State,
    timestamp: isStep3Completed ? order?.updated_at || order?.created_at : null,
    formatted_timestamp: isStep3Completed ? formatArabicDateTime(order?.updated_at || order?.created_at) : null,
  };

  // 4. Step 4: تم الشحن
  const isStep4Completed =
    ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(deliveryStatus) ||
    ["SHIPPED", "COMPLETED"].includes(orderStatus) ||
    paymentStatus === "PAID" ||
    subStatus === "ACTIVE";

  let step4State: TimelineStepState = "pending";
  if (isCancelled) {
    step4State = isStep4Completed ? "completed" : "pending";
  } else if (isStep4Completed) {
    step4State = "completed";
  } else if (isStep3Completed && orderStatus === "PROCESSING" && deliveryStatus === "PENDING") {
    step4State = "current";
  }

  const step4: TrackingTimelineStep = {
    id: "order_shipped",
    step_number: 4,
    title: "تم الشحن",
    symbol: step4State === "completed" ? "✓" : step4State === "current" ? "●" : "○",
    description:
      step4State === "completed"
        ? `تم تسليم الطرد رسمياً لشركة التوصيل (${carrier}).`
        : step4State === "current"
        ? "العلبة المادية جاهزة وفي انتظار استلام مندوب شركة التوصيل."
        : "يتم تسليم الطرد لشركة الشحن بعد اكتمال التجهيز.",
    state: step4State,
    timestamp: shipment?.shipped_at || null,
    formatted_timestamp: shipment?.shipped_at ? formatArabicDateTime(shipment.shipped_at) : null,
    carrier,
    tracking_number: trackingNumber || undefined,
    tracking_url: trackingUrl,
  };

  // 5. Step 5: في الطريق
  const isStep5Completed =
    deliveryStatus === "DELIVERED" ||
    orderStatus === "COMPLETED" ||
    paymentStatus === "PAID" ||
    subStatus === "ACTIVE";

  let step5State: TimelineStepState = "pending";
  if (isDeliveryReturned) {
    step5State = "failed";
  } else if (isStep5Completed) {
    step5State = "completed";
  } else if (isStep4Completed && (deliveryStatus === "OUT_FOR_DELIVERY" || deliveryStatus === "SHIPPED")) {
    step5State = "current";
  }

  const step5: TrackingTimelineStep = {
    id: "in_transit",
    step_number: 5,
    title: "في الطريق",
    symbol: step5State === "completed" ? "✓" : step5State === "current" ? "●" : step5State === "failed" ? "✕" : "○",
    description:
      step5State === "completed"
        ? "وصل الطرد إلى مركز التوزيع النهائي وتم تسليمه بنجاح."
        : step5State === "current"
        ? deliveryStatus === "OUT_FOR_DELIVERY"
          ? "الطرد حالياً مع الموزع الميداني وهو في طريقه إليك اليوم للتسليم."
          : "الطرد في مركز الفرز والتوزيع ومتجه إلى ولايتك."
        : step5State === "failed"
        ? "تعذر إكمال التوصيل (طرد مرتجع)."
        : "سينطلق الطرد إلى عنوانك فور خروجه من مستودع الشحن.",
    state: step5State,
    timestamp: shipment?.shipped_at || null,
    formatted_timestamp: shipment?.shipped_at ? formatArabicDateTime(shipment.shipped_at) : null,
  };

  // 6. Step 6: تم التسليم
  const isStep6Completed =
    deliveryStatus === "DELIVERED" ||
    orderStatus === "COMPLETED" ||
    paymentStatus === "PAID" ||
    subStatus === "ACTIVE";

  let step6State: TimelineStepState = "pending";
  if (isDeliveryReturned || isDeliveryFailed) {
    step6State = "failed";
  } else if (isStep6Completed) {
    step6State = "completed";
  } else if (deliveryStatus === "OUT_FOR_DELIVERY") {
    step6State = "current";
  }

  const step6: TrackingTimelineStep = {
    id: "delivered",
    step_number: 6,
    title: "تم التسليم",
    symbol: step6State === "completed" ? "✓" : step6State === "current" ? "●" : step6State === "failed" ? "✕" : "○",
    description:
      step6State === "completed"
        ? "تم استلام العلبة المادية بنجاح من الموزع."
        : step6State === "current"
        ? "الموزع في طريقه إليك اليوم، يرجى البقاء على اتصال بهاتفك."
        : step6State === "failed"
        ? "تعذر تسليم الطرد، يرجى التواصل مع الدعم الفني."
        : "التسليم والدفع نقداً (كاش) عند باب منزلك أو بمكتب التوصيل.",
    state: step6State,
    timestamp: shipment?.delivered_at || null,
    formatted_timestamp: shipment?.delivered_at ? formatArabicDateTime(shipment.delivered_at) : null,
  };

  // 7. Step 7: تم تأكيد الدفع
  const isStep7Completed =
    paymentStatus === "PAID" ||
    paymentStatus === "APPROVED" ||
    subStatus === "ACTIVE";

  let step7State: TimelineStepState = "pending";
  if (isStep7Completed) {
    step7State = "completed";
  } else if (isStep6Completed && paymentStatus !== "PAID") {
    step7State = "current";
  }

  const step7: TrackingTimelineStep = {
    id: "payment_settled",
    step_number: 7,
    title: "تم تأكيد الدفع",
    symbol: step7State === "completed" ? "✓" : step7State === "current" ? "●" : "○",
    description:
      step7State === "completed"
        ? "تم تأكيد استلام الدفع (COD) بنجاح."
        : step7State === "current"
        ? "تم قبض المبلغ عند التسليم، بانتظار تأكيد التسوية المالية من الإدارة لتفعيل الاشتراك."
        : "يتم تسديد المبلغ نقداً للموزع عند استلام الطرد.",
    state: step7State,
    timestamp: payment?.settled_at || null,
    formatted_timestamp: payment?.settled_at ? formatArabicDateTime(payment.settled_at) : null,
  };

  // 8. Step 8: تم تفعيل الاشتراك
  const isSubActive = subStatus === "ACTIVE";
  let step8State: TimelineStepState = "pending";
  if (isSubActive) {
    step8State = "completed";
  } else if (isStep7Completed && !isSubActive) {
    step8State = "current";
  }

  const step8: TrackingTimelineStep = {
    id: "subscription_activated",
    step_number: 8,
    title: "تم تفعيل الاشتراك",
    symbol: step8State === "completed" ? "✓" : step8State === "current" ? "●" : "○",
    description:
      step8State === "completed"
        ? "تم تفعيل اشتراكك بنجاح! يمكنك الآن الاستفادة من جميع الميزات والدروس."
        : step8State === "current"
        ? "تم تأكيد الدفع، جاري إتمام تفعيل باقتك الدراسية خلال لحظات."
        : "يتم تفعيل الاشتراك الرقمي فور تأكيد استلام الدفع.",
    state: step8State,
    timestamp: subscription?.starts_at || null,
    formatted_timestamp: subscription?.starts_at ? formatArabicDateTime(subscription.starts_at) : null,
  };

  const timeline = [step1, step2, step3, step4, step5, step6, step7, step8];

  // Subscription Details (when active or pending)
  const daysRemaining = calculateDaysRemaining(subscription?.expires_at);
  const subscriptionInfo: ActivatedSubscriptionInfo = {
    is_active: isSubActive,
    plan_name: planMeta.name,
    plan_duration: planMeta.duration,
    starts_at: subscription?.starts_at || null,
    formatted_starts_at: formatArabicDate(subscription?.starts_at),
    expires_at: subscription?.expires_at || null,
    formatted_expires_at: formatArabicDate(subscription?.expires_at),
    days_remaining: daysRemaining,
    badge_label: isSubActive ? "مفعّل" : "في انتظار التسليم والدفع",
  };

  // Overall friendly status
  let overallKey = "PENDING";
  let overallLabel = "قيد المعالجة";
  let overallDesc = "طلبك مسجل وفي مرحلة المراجعة والتأكيد.";
  let overallVariant: "info" | "warning" | "success" | "error" = "info";

  if (isCancelled) {
    overallKey = "CANCELLED";
    overallLabel = "ملغى";
    overallDesc = "تم إلغاء هذا الطلب.";
    overallVariant = "error";
  } else if (isSubActive) {
    overallKey = "ACTIVE";
    overallLabel = "الاشتراك مفعّل";
    overallDesc = "تم تسليم الطرد وتأكيد الدفع وتفعيل حسابك بنجاح!";
    overallVariant = "success";
  } else if (isStep7Completed) {
    overallKey = "PAID";
    overallLabel = "تم تأكيد الدفع";
    overallDesc = "تم تأكيد الدفع، جاري تفعيل اشتراكك.";
    overallVariant = "success";
  } else if (isStep6Completed) {
    overallKey = "DELIVERED";
    overallLabel = "تم التسليم";
    overallDesc = "تم استلام الطرد بنجاح والدفع عند الاستلام.";
    overallVariant = "info";
  } else if (deliveryStatus === "OUT_FOR_DELIVERY") {
    overallKey = "OUT_FOR_DELIVERY";
    overallLabel = "في الطريق إليك";
    overallDesc = "الطرد مع الموزع وهو في طريقه لتسليمه إليك اليوم.";
    overallVariant = "info";
  } else if (isStep4Completed) {
    overallKey = "SHIPPED";
    overallLabel = "تم الشحن";
    overallDesc = "تم شحن الطرد وهو في طريقه إلى ولايتك.";
    overallVariant = "info";
  } else if (isStep3Completed) {
    overallKey = "PROCESSING";
    overallLabel = "قيد التجهيز";
    overallDesc = "جاري تغليف علبة شاطر المادية وبطاقتك الذكية.";
    overallVariant = "warning";
  } else if (isStep2Completed) {
    overallKey = "CONFIRMED";
    overallLabel = "تم التأكيد";
    overallDesc = "تم تأكيد طلبك وجاري إحالته لمرحلة التجهيز.";
    overallVariant = "info";
  }

  const numericAmount = Number(order?.amount || 0);

  return {
    order_id: order?.id || "",
    order_number: order?.order_number || `SH-2026-${order?.id?.substring(0, 6)?.toUpperCase() || "000000"}`,
    created_at: order?.created_at || new Date().toISOString(),
    formatted_created_at: formatArabicDate(order?.created_at),
    plan: {
      id: order?.plan_id || order?.plan || "season",
      name: planMeta.name,
      duration: planMeta.duration,
    },
    financials: {
      amount: numericAmount,
      currency: order?.currency || "DA",
      formatted_amount: `${numericAmount.toLocaleString()} دج`,
      payment_method: "الدفع عند الاستلام (COD)",
      payment_status: paymentStatus,
      is_paid: isStep7Completed,
    },
    shipping: {
      recipient_name: shippingAddress?.full_name || order?.full_name || "التلميذ المشترك",
      wilaya: shippingAddress?.wilaya || order?.shipping_wilaya || "غير محدد",
      commune: shippingAddress?.commune || order?.shipping_commune || "",
      address: shippingAddress?.address || order?.shipping_address || "",
      carrier,
      tracking_number: trackingNumber || undefined,
      tracking_url: trackingUrl,
      delivery_status: deliveryStatus,
      shipped_at: shipment?.shipped_at || null,
      delivered_at: shipment?.delivered_at || null,
    },
    subscription: subscriptionInfo,
    timeline,
    overall_status: {
      key: overallKey,
      label: overallLabel,
      description: overallDesc,
      variant: overallVariant,
    },
  };
}

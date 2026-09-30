import { CarrierId, CarrierInfo, ShipmentStatus } from "./types";

/**
 * Authoritative Registry of Algerian Delivery Companies (Carriers)
 */
export const KNOWN_CARRIERS: Record<CarrierId, CarrierInfo> = {
  YALIDINE: {
    id: "YALIDINE",
    name: "Yalidine Express",
    name_ar: "ياليدين إكسبريس",
    trackingUrlPattern: "https://yalidine.com/app/tracking?tracking={tracking}",
    supportsApi: false, // Set to true when API keys are configured
    supportsWebhook: true,
  },
  ZR_EXPRESS: {
    id: "ZR_EXPRESS",
    name: "ZR Express",
    name_ar: "زد آر إكسبريس",
    trackingUrlPattern: "https://zrexpress.com/tracking/{tracking}",
    supportsApi: false,
    supportsWebhook: true,
  },
  MAYSTRO: {
    id: "MAYSTRO",
    name: "Maystro Delivery",
    name_ar: "مايسترو دليفري",
    trackingUrlPattern: "https://tracking.maystro-delivery.com/?tracking_id={tracking}",
    supportsApi: false,
    supportsWebhook: true,
  },
  KAZITOUR: {
    id: "KAZITOUR",
    name: "Kazitour Express",
    name_ar: "كازيتور إكسبريس",
    trackingUrlPattern: null,
    supportsApi: false,
    supportsWebhook: false,
  },
  PROCOLIS: {
    id: "PROCOLIS",
    name: "Procolis Express",
    name_ar: "برو كوليس",
    trackingUrlPattern: null,
    supportsApi: false,
    supportsWebhook: false,
  },
  NORD_SUD: {
    id: "NORD_SUD",
    name: "Nord et Sud Express",
    name_ar: "شمال وجنوب إكسبريس",
    trackingUrlPattern: null,
    supportsApi: false,
    supportsWebhook: false,
  },
  OTHER: {
    id: "OTHER",
    name: "Manual Delivery / Other",
    name_ar: "شركة توصيل أخرى (يدوي)",
    trackingUrlPattern: null,
    supportsApi: false,
    supportsWebhook: true,
  },
};

export const CARRIER_OPTIONS = Object.values(KNOWN_CARRIERS);

/**
 * Resolves Carrier metadata from code or raw input string
 */
export function resolveCarrierInfo(carrierInput?: string | null): CarrierInfo {
  if (!carrierInput) return KNOWN_CARRIERS.YALIDINE;
  const cleanInput = carrierInput.trim().toUpperCase().replace(/[\s\-_]/g, "");

  for (const [key, info] of Object.entries(KNOWN_CARRIERS)) {
    const cleanKey = key.toUpperCase().replace(/[\s\-_]/g, "");
    const cleanName = info.name.toUpperCase().replace(/[\s\-_]/g, "");

    if (
      cleanKey === cleanInput ||
      cleanName === cleanInput ||
      cleanName.includes(cleanInput) ||
      cleanInput.includes(cleanKey) ||
      info.name_ar.includes(carrierInput.trim())
    ) {
      return info;
    }
  }

  return {
    id: "OTHER",
    name: carrierInput.trim(),
    name_ar: carrierInput.trim(),
    trackingUrlPattern: null,
    supportsApi: false,
    supportsWebhook: true,
  };
}

/**
 * Returns tracking URL for carriers with web tracking portals
 */
export function getCarrierTrackingUrl(carrierInput?: string | null, trackingNumber?: string | null): string | null {
  if (!trackingNumber?.trim()) return null;
  const carrier = resolveCarrierInfo(carrierInput);
  if (!carrier.trackingUrlPattern) return null;
  return carrier.trackingUrlPattern.replace("{tracking}", encodeURIComponent(trackingNumber.trim()));
}

/**
 * Normalizes any external carrier or webhook status to SHATER's 6 canonical statuses:
 * PENDING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED
 */
export function normalizeShipmentStatus(rawStatus?: string | null): ShipmentStatus {
  if (!rawStatus) return "PENDING";
  const s = rawStatus.trim().toUpperCase();

  // 1. Shipped / Dispatched
  if (
    s === "SHIPPED" ||
    s === "EXPÉDIÉ" ||
    s === "DISPATCHED" ||
    s === "EN_TRANSIT" ||
    s === "IN_TRANSIT" ||
    s === "CENTRE_DE_TRI"
  ) {
    return "SHIPPED";
  }

  // 2. Out for delivery
  if (
    s === "OUT_FOR_DELIVERY" ||
    s === "EN_LIVRAISON" ||
    s === "AVEC_LIVREUR" ||
    s === "DISTRIBUTION" ||
    s === "ON_DELIVERY"
  ) {
    return "OUT_FOR_DELIVERY";
  }

  // 3. Delivered
  if (
    s === "DELIVERED" ||
    s === "LIVRÉ" ||
    s === "LIVRE" ||
    s === "RECEIVED" ||
    s === "COMPLETED"
  ) {
    return "DELIVERED";
  }

  // 4. Failed / Unreachable
  if (
    s === "FAILED" ||
    s === "ECHEC" ||
    s === "ÉCHEC" ||
    s === "UNREACHABLE" ||
    s === "INJOIGNABLE" ||
    s === "POSTPONED" ||
    s === "REPORTE"
  ) {
    return "FAILED";
  }

  // 5. Returned
  if (
    s === "RETURNED" ||
    s === "RETOUR" ||
    s === "RETURN_TO_SENDER" ||
    s === "ANNULÉ" ||
    s === "CANCELLED"
  ) {
    return "RETURNED";
  }

  // Default to PENDING
  return "PENDING";
}

/**
 * Human readable Arabic labels for the 6 statuses
 */
export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, { label: string; badgeVariant: "default" | "success" | "warning" | "error" | "info" }> = {
  PENDING: {
    label: "في انتظار الشحن",
    badgeVariant: "warning",
  },
  SHIPPED: {
    label: "تم تسليم الطرد لشركة الشحن",
    badgeVariant: "info",
  },
  OUT_FOR_DELIVERY: {
    label: "في الطريق للتسليم (مع الموزع)",
    badgeVariant: "info",
  },
  DELIVERED: {
    label: "تم التسليم للزبون",
    badgeVariant: "success",
  },
  FAILED: {
    label: "تعذر أو فشل التسليم",
    badgeVariant: "error",
  },
  RETURNED: {
    label: "طرد مرتجع (Retour)",
    badgeVariant: "error",
  },
};

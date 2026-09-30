/**
 * SHATER Shipping Management Types & Carrier Architecture
 * 
 * Supports manual admin input now and extensible carrier API / Webhook integration later.
 */

export type ShipmentStatus =
  | "PENDING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export type CarrierId =
  | "YALIDINE"
  | "ZR_EXPRESS"
  | "MAYSTRO"
  | "KAZITOUR"
  | "PROCOLIS"
  | "NORD_SUD"
  | "OTHER";

export interface CarrierInfo {
  id: CarrierId;
  name: string;
  name_ar: string;
  trackingUrlPattern: string | null;
  supportsApi: boolean;
  supportsWebhook: boolean;
}

export interface NormalizedShipmentEvent {
  trackingNumber: string;
  carrierId: CarrierId;
  status: ShipmentStatus;
  eventTime?: string;
  location?: string;
  rawStatus?: string;
  notes?: string;
}

export interface UpdateShipmentParams {
  orderId: string;
  carrier?: string;
  trackingNumber?: string | null;
  shippingDate?: string | null;
  status?: ShipmentStatus;
  notes?: string | null;
  source?: "ADMIN_MANUAL" | "CARRIER_WEBHOOK" | "CARRIER_API";
  actor: {
    userId: string;
    role: string;
  };
}

export interface ShippingProviderAdapter {
  carrierId: CarrierId;
  name: string;
  parseWebhook(payload: any, headers?: Record<string, string>): Promise<NormalizedShipmentEvent | null>;
  fetchStatus?(trackingNumber: string): Promise<NormalizedShipmentEvent | null>;
}

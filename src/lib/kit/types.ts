/**
 * SHATER Physical Subscription Kit Document Types
 */

export interface PhysicalKitDocumentData {
  orderNumber: string;
  shaterId: string;
  studentName: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  planName: string;
  planDuration: string;
  amount: number;
  currency: string;
  formattedPrice: string;
  formattedDate: string;
  carrier: string;
  trackingNumber: string | null;
  loginUrl: string;
  websiteUrl: string;
  platformQrCode: string; // Base64 data URL
  whatsappUrl: string;
  whatsappNumber: string;
  whatsappQrCode: string; // Base64 data URL
  notes?: string | null;
}

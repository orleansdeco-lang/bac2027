/**
 * BAC Mastery — Payment Architecture Abstraction Types
 * Prompt 18: Pilot-Ready Payment Placeholder
 */

export interface PaymentPlan {
  id: string;
  name_ar: string;
  name_fr: string;
  priceDZD: number;
  durationMonths: number;
  description_ar: string;
  description_fr: string;
  features_ar: string[];
  features_fr: string[];
}

export interface CheckoutRequest {
  userId: string;
  planId: string;
  studentEmail?: string;
  metadata?: Record<string, any>;
}

export interface CheckoutResult {
  status: "PENDING" | "READY" | "UNAVAILABLE";
  provider: string;
  referenceId: string;
  instructions_ar: string;
  instructions_fr: string;
  checkoutUrl?: string;
  requiresManualVerification: boolean;
}

export interface PaymentStatusResult {
  status: "UNPAID" | "PENDING_VERIFICATION" | "VERIFIED" | "FAILED";
  paidAt?: string;
  amountDZD?: number;
  providerReference?: string;
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;
  readonly isLive: boolean;

  getAvailablePlans(): Promise<PaymentPlan[]>;
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
  getPaymentStatus(userId: string): Promise<PaymentStatusResult>;
  handlePaymentConfirmation(userId: string, confirmationToken: string): Promise<boolean>;
}

/**
 * Prompt 19 § 16: Clean internal commercial state model
 */
export type PilotPaymentState =
  | "PAYMENT_NOT_STARTED"
  | "PAYMENT_REQUESTED"
  | "PAYMENT_PENDING_VERIFICATION"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_REJECTED"
  | "PAYMENT_CANCELLED";

/**
 * Prompt 19 § 17: Auditable payment request record
 */
export interface PilotPaymentRecord {
  requestId: string;
  userId: string;
  planId: string;
  amountDZD: number;
  currency: "DZD";
  state: PilotPaymentState;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  verificationActor?: string;
  studentEmail?: string;
}


/**
 * BAC Mastery — WhatsApp Messaging Provider Types
 * Phase 1 Provider Abstraction Layer
 */

export interface SendOtpParams {
  phone: string; // Canonical phone number e.g. +213555123456
  code: string;  // Cryptographic 6-digit OTP
}

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppProvider {
  readonly name: string;
  sendOtp(params: SendOtpParams): Promise<SendOtpResult>;
}

/**
 * BAC Mastery — WhatsApp Provider Abstraction Layer
 * 
 * DESIGN INVARIANTS:
 * 1. Plaintext OTP codes are NEVER logged to stdout, files, or returned in API responses.
 * 2. In production, credentials (WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID) are mandatory;
 *    if absent, execution fails safely without exposing internal exceptions.
 * 3. Mock provider is STRICTLY restricted to development/testing and disabled in production.
 * 4. Easily pluggable for Meta Cloud API in Phase 2.
 */

import { WhatsAppProvider, SendOtpParams, SendOtpResult } from "./types";
import { maskPhone } from "@/lib/security/otp";

/**
 * Meta WhatsApp Cloud API Provider
 * Connects to official Meta Graph API v20.0+ endpoint.
 */
export class MetaWhatsAppCloudProvider implements WhatsAppProvider {
  public readonly name = "meta_whatsapp_cloud";

  private get apiToken(): string | undefined {
    return process.env.WHATSAPP_API_TOKEN || process.env.META_WHATSAPP_TOKEN;
  }

  private get phoneNumberId(): string | undefined {
    return process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  private get templateName(): string {
    return process.env.WHATSAPP_TEMPLATE_NAME || "shater_otp_verification";
  }

  private get languageCode(): string {
    return process.env.WHATSAPP_LANGUAGE_CODE || "ar";
  }

  async sendOtp(params: SendOtpParams): Promise<SendOtpResult> {
    const { phone, code } = params;

    if (!this.apiToken || !this.phoneNumberId) {
      if (process.env.NODE_ENV === "production") {
        console.error("[WhatsApp] Meta API credentials missing in production environment");
        return {
          success: false,
          error: "WhatsApp service credentials are not configured",
        };
      }
      return {
        success: false,
        error: "Missing WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment",
      };
    }

    try {
      // Strip leading '+' for Meta API phone recipient format (e.g. 213555123456)
      const recipientPhone = phone.replace(/^\+/, "").trim();
      const endpoint = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;

      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: this.templateName,
          language: { code: this.languageCode },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: code,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: code,
                },
              ],
            },
          ],
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          `[WhatsApp] Meta API request failed: status=${response.status}, target=${maskPhone(phone)}`
        );
        return {
          success: false,
          error: (errorData as any)?.error?.message || "Failed to dispatch WhatsApp message via Meta Cloud API",
        };
      }

      const data = await response.json().catch(() => ({}));
      const messageId = (data as any)?.messages?.[0]?.id;

      return {
        success: true,
        messageId,
      };
    } catch (err: unknown) {
      console.error(`[WhatsApp] Network exception dispatching OTP to ${maskPhone(phone)}`);
      return {
        success: false,
        error: "Network error communicating with WhatsApp service",
      };
    }
  }
}

/**
 * In-Memory Mock WhatsApp Provider (Test / Dev Only)
 * Used when running local integration tests or offline development.
 */
export class MockWhatsAppProvider implements WhatsAppProvider {
  public readonly name = "mock_whatsapp";

  // In-memory registry for test assertion harnesses
  private static lastSent: Map<string, { code: string; timestamp: number }> = new Map();

  async sendOtp(params: SendOtpParams): Promise<SendOtpResult> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SECURITY VIOLATION: MockWhatsAppProvider cannot be executed in production.");
    }

    // Record in memory for test assertions
    MockWhatsAppProvider.lastSent.set(params.phone, {
      code: params.code,
      timestamp: Date.now(),
    });

    return {
      success: true,
      messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  }

  /**
   * Helper for automated test suites to inspect the generated code in memory
   * WITHOUT logging it to stdout or exposing it over network.
   */
  public static getSentOtpForTest(phone: string): string | null {
    if (process.env.NODE_ENV === "production") {
      return null;
    }
    const entry = this.lastSent.get(phone);
    return entry ? entry.code : null;
  }

  public static clearSentOtps(): void {
    this.lastSent.clear();
  }
}

/**
 * Returns the active WhatsApp messaging provider based on runtime environment.
 */
export function getWhatsAppProvider(): WhatsAppProvider {
  if (process.env.NODE_ENV === "production") {
    return new MetaWhatsAppCloudProvider();
  }

  // In non-production, use Meta Cloud if explicitly configured; otherwise use mock
  if (
    process.env.WHATSAPP_API_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.USE_MOCK_WHATSAPP !== "true"
  ) {
    return new MetaWhatsAppCloudProvider();
  }

  return new MockWhatsAppProvider();
}

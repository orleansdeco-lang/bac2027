/**
 * BAC Mastery — Payment System Index
 * Prompt 18: Payment Provider Singleton
 */

import { PaymentProvider } from "./types";
import { ManualPilotPaymentProvider, PILOT_BAC_PLAN } from "./manual-pilot-provider";

export * from "./types";
export * from "./manual-pilot-provider";

let currentProvider: PaymentProvider = new ManualPilotPaymentProvider();

export function getPaymentProvider(): PaymentProvider {
  return currentProvider;
}

export function setPaymentProvider(provider: PaymentProvider): void {
  currentProvider = provider;
}

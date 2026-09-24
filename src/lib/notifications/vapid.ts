/**
 * BAC Mastery - VAPID Keys & Push Configuration
 */

export const DEFAULT_VAPID_PUBLIC_KEY =
  "BIXPCLxdgg7zwCeT-L3FQ5WvGjlHm7XhcOUP1xhyWd5u8toH7JDwPhZPYNN6Xa_EzalPZ0iznpy2kSKe_X_aaMU";

const DEFAULT_VAPID_PRIVATE_KEY =
  "Do7l34IrUAgqGzLipzuQHnO5Acx2XJp0EMSIoW3NGGU";

export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
}

export function getVapidPrivateKey(): string {
  return process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY;
}

export function getVapidSubject(): string {
  return process.env.VAPID_SUBJECT || "mailto:support@shater-bac.dz";
}

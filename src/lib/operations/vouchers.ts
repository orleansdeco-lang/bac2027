/**
 * SHATER BAC — Authoritative SHATER Pass Voucher Service (V1)
 * 
 * Supports:
 * 1. Physical voucher cards delivered via COD (Cash on Delivery).
 * 2. Prepared for future sales channels (LIBRARY, RESELLER, ONLINE).
 * 3. Atomic activation: Redeeming upgrades student to PAID and qualifies referrals.
 * 4. Dual-mode: Supabase RPC with durable fallback.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { recordAuditLog } from "./audit";
import { AUTHORITATIVE_PLANS } from "./payments";
import { loadServerStudentProfiles, saveServerStudentProfile } from "./students";
import { qualifyReferralOnSubscription } from "../referral";

export type VoucherSalesChannel = "COD" | "ONLINE" | "LIBRARY" | "RESELLER";
export type VoucherStatus = "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED";

export interface ShaterPassVoucher {
  id: string;
  voucherCode: string;
  planId: string;
  salesChannel: VoucherSalesChannel;
  batchNumber?: string | null;
  status: VoucherStatus;
  redeemedBy?: string | null;
  redeemedAt?: string | null;
  orderId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

function getDurableVouchersPath(): string {
  const dir = path.join(process.cwd(), ".runtime");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, "vouchers.json");
}

function getTmpVouchersPath(): string {
  return path.join(os.tmpdir(), "shater_vouchers.json");
}

function loadDurableVouchers(): ShaterPassVoucher[] {
  if (typeof window !== "undefined") return [];

  const globalList = (globalThis as any).__SHATER_VOUCHERS__;
  if (Array.isArray(globalList) && globalList.length > 0) return globalList;

  try {
    const tmp = getTmpVouchersPath();
    if (fs.existsSync(tmp)) {
      const data = JSON.parse(fs.readFileSync(tmp, "utf8"));
      if (Array.isArray(data)) {
        (globalThis as any).__SHATER_VOUCHERS__ = data;
        return data;
      }
    }
  } catch {}

  try {
    const dur = getDurableVouchersPath();
    if (fs.existsSync(dur)) {
      const data = JSON.parse(fs.readFileSync(dur, "utf8"));
      if (Array.isArray(data)) {
        (globalThis as any).__SHATER_VOUCHERS__ = data;
        return data;
      }
    }
  } catch {}

  return [];
}

function saveDurableVouchers(vouchers: ShaterPassVoucher[]): void {
  if (typeof window !== "undefined") return;
  (globalThis as any).__SHATER_VOUCHERS__ = vouchers;
  try {
    fs.writeFileSync(getTmpVouchersPath(), JSON.stringify(vouchers, null, 2), "utf8");
  } catch {}
  try {
    fs.writeFileSync(getDurableVouchersPath(), JSON.stringify(vouchers, null, 2), "utf8");
  } catch {}
}

/**
 * Generates an 8-character uppercase voucher code formatted as SHATER-XXXX-XXXX
 */
export function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars I, 1, O, 0
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SHATER-${part1}-${part2}`;
}

/**
 * Creates a new voucher in the system
 */
export async function createVoucher(params: {
  planId: string;
  salesChannel: VoucherSalesChannel;
  batchNumber?: string;
  orderId?: string;
  customCode?: string;
}): Promise<ShaterPassVoucher> {
  const voucherCode = (params.customCode || generateVoucherCode()).toUpperCase().trim();
  const id = `vch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const newVoucher: ShaterPassVoucher = {
    id,
    voucherCode,
    planId: params.planId,
    salesChannel: params.salesChannel,
    batchNumber: params.batchNumber || "BATCH-2026-V1",
    status: "ACTIVE",
    orderId: params.orderId || null,
    createdAt: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("shater_pass_vouchers").insert({
        id: newVoucher.id,
        voucher_code: newVoucher.voucherCode,
        plan_id: newVoucher.planId,
        sales_channel: newVoucher.salesChannel,
        batch_number: newVoucher.batchNumber,
        status: newVoucher.status,
        order_id: newVoucher.orderId,
        created_at: newVoucher.createdAt,
      });
    } catch (e) {
      console.error("[Voucher] Supabase voucher insert error:", e);
    }
  }

  // Durable store
  const allVouchers = loadDurableVouchers();
  allVouchers.push(newVoucher);
  saveDurableVouchers(allVouchers);

  return newVoucher;
}

/**
 * Redeems a SHATER Pass voucher code, upgrades student to PAID, and qualifies referral
 */
export async function redeemVoucher(
  userId: string,
  rawVoucherCode: string
): Promise<{
  success: boolean;
  message?: string;
  planId?: string;
  subscriptionExpiresAt?: string;
}> {
  if (!userId || !rawVoucherCode) {
    return { success: false, message: "يرجى تقديم معرف المستخدم ورمز القسيمة" };
  }

  const voucherCode = rawVoucherCode.trim().toUpperCase();

  // Try Supabase RPC first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc("redeem_shater_pass_voucher", {
        p_voucher_code: voucherCode,
        p_user_id: userId,
      });

      if (error) {
        console.error("[Voucher] Supabase redemption RPC error:", error);
      } else if (data) {
        if (!data.success) {
          return { success: false, message: data.message || "رمز القسيمة غير صالح أو تم استخدامه" };
        }

        // Check and qualify referral
        await qualifyReferralOnSubscription(userId, data.voucher_id || voucherCode);

        // Record audit log
        await recordAuditLog({
          actorUserId: userId,
          actorRole: "STUDENT",
          action: "VOUCHER_REDEEMED",
          targetType: "student_profile",
          targetId: userId,
          reason: `تفعيل قسيمة SHATER Pass: ${voucherCode}`,
          afterState: { voucherCode, planId: data.plan_id },
        });

        return {
          success: true,
          planId: data.plan_id,
          subscriptionExpiresAt: data.expires_at,
          message: data.message || "تم تفعيل اشتراكك بنجاح بواسطة قسيمة شاطر!",
        };
      }
    } catch (e) {
      console.error("[Voucher] Exception in Supabase voucher redemption:", e);
    }
  }

  // Fallback durable redemption
  const allVouchers = loadDurableVouchers();
  const voucher = allVouchers.find((v) => v.voucherCode === voucherCode);

  if (!voucher) {
    return { success: false, message: "رمز القسيمة غير موجود في النظام. تأكد من إدخاله بدقة." };
  }

  if (voucher.status !== "ACTIVE") {
    if (voucher.status === "REDEEMED") {
      return { success: false, message: "تم تفعيل هذه القسيمة مسبقاً ولا يمكن استخدامها مرة أخرى." };
    }
    return { success: false, message: `هذه القسيمة غير نشطة (${voucher.status}).` };
  }

  // Check expiration if present
  if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
    voucher.status = "EXPIRED";
    saveDurableVouchers(allVouchers);
    return { success: false, message: "انتهت صلاحية هذه القسيمة." };
  }

  // Resolve plan
  const plan = AUTHORITATIVE_PLANS[voucher.planId] || AUTHORITATIVE_PLANS.season;
  const durationMonths = plan?.durationMonths || 10;
  const now = new Date();
  const expiresDate = new Date(now.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
  const expiresAt = expiresDate.toISOString();

  // Mark voucher as redeemed
  voucher.status = "REDEEMED";
  voucher.redeemedBy = userId;
  voucher.redeemedAt = now.toISOString();
  saveDurableVouchers(allVouchers);

  // Upgrade student profile in server durable directory
  const profiles = loadServerStudentProfiles();
  const student = profiles.find((p) => p.id === userId);
  saveServerStudentProfile({
    id: userId,
    fullName: student?.fullName || "طالب شاطر",
    email: student?.email,
    studentPhone: student?.studentPhone,
    streamId: student?.streamId,
    wilayaName: student?.wilayaName,
    accessStatus: "PAID",
    plan: voucher.planId,
    hasPendingPayment: false,
    subscriptionStartedAt: now.toISOString(),
    subscriptionExpiresAt: expiresAt,
  });

  // Qualify referral if this student was referred
  await qualifyReferralOnSubscription(userId, voucher.id);

  // Record audit log
  await recordAuditLog({
    actorUserId: userId,
    actorRole: "STUDENT",
    action: "VOUCHER_REDEEMED",
    targetType: "student_profile",
    targetId: userId,
    reason: `تفعيل قسيمة SHATER Pass: ${voucherCode}`,
    afterState: { voucherCode, planId: voucher.planId, expiresAt },
  });

  return {
    success: true,
    planId: voucher.planId,
    subscriptionExpiresAt: expiresAt,
    message: "تم تفعيل اشتراكك بنجاح بواسطة قسيمة شاطر!",
  };
}

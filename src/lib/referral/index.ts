/**
 * SHATER BAC — Authoritative Referral & Credit Service (V1)
 * 
 * Rules:
 * 1. Exactly 700 DA SHATER Credit per verified qualifying subscription.
 * 2. Zero reward on trial signup.
 * 3. Anti-fraud: No self-referral, single referrer per user, single reward per referred user.
 * 4. Dual-mode: Supabase RPC / tables with durable fallback.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import {
  ReferralRecord,
  ReferralSummary,
  ReferralDashboardItem,
  CreditTransaction,
  REFERRAL_REWARD_AMOUNT_DZD,
} from "./types";
import { loadServerStudentProfiles, saveServerStudentProfile } from "../operations/students";

// Fallback durable paths
function getDurableReferralsPath(): string {
  const dir = path.join(process.cwd(), ".runtime");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, "referrals.json");
}

function getTmpReferralsPath(): string {
  return path.join(os.tmpdir(), "shater_referrals.json");
}

function getDurableCreditTxPath(): string {
  const dir = path.join(process.cwd(), ".runtime");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  return path.join(dir, "credit_transactions.json");
}

function getTmpCreditTxPath(): string {
  return path.join(os.tmpdir(), "shater_credit_transactions.json");
}

function loadDurableReferrals(): ReferralRecord[] {
  if (typeof window !== "undefined") return [];

  const globalList = (globalThis as any).__SHATER_REFERRALS__;
  if (Array.isArray(globalList) && globalList.length > 0) return globalList;

  try {
    const tmp = getTmpReferralsPath();
    if (fs.existsSync(tmp)) {
      const data = JSON.parse(fs.readFileSync(tmp, "utf8"));
      if (Array.isArray(data)) {
        (globalThis as any).__SHATER_REFERRALS__ = data;
        return data;
      }
    }
  } catch {}

  try {
    const dur = getDurableReferralsPath();
    if (fs.existsSync(dur)) {
      const data = JSON.parse(fs.readFileSync(dur, "utf8"));
      if (Array.isArray(data)) {
        (globalThis as any).__SHATER_REFERRALS__ = data;
        return data;
      }
    }
  } catch {}

  return [];
}

function saveDurableReferrals(records: ReferralRecord[]): void {
  if (typeof window !== "undefined") return;
  (globalThis as any).__SHATER_REFERRALS__ = records;
  try {
    fs.writeFileSync(getTmpReferralsPath(), JSON.stringify(records, null, 2), "utf8");
  } catch {}
  try {
    fs.writeFileSync(getDurableReferralsPath(), JSON.stringify(records, null, 2), "utf8");
  } catch {}
}

function loadDurableCreditTransactions(): CreditTransaction[] {
  if (typeof window !== "undefined") return [];

  const globalList = (globalThis as any).__SHATER_CREDIT_TX__;
  if (Array.isArray(globalList) && globalList.length > 0) return globalList;

  try {
    const tmp = getTmpCreditTxPath();
    if (fs.existsSync(tmp)) {
      const data = JSON.parse(fs.readFileSync(tmp, "utf8"));
      if (Array.isArray(data)) {
        (globalThis as any).__SHATER_CREDIT_TX__ = data;
        return data;
      }
    }
  } catch {}

  try {
    const dur = getDurableCreditTxPath();
    if (fs.existsSync(dur)) {
      const data = JSON.parse(fs.readFileSync(dur, "utf8"));
      if (Array.isArray(data)) {
        (globalThis as any).__SHATER_CREDIT_TX__ = data;
        return data;
      }
    }
  } catch {}

  return [];
}

function saveDurableCreditTransactions(records: CreditTransaction[]): void {
  if (typeof window !== "undefined") return;
  (globalThis as any).__SHATER_CREDIT_TX__ = records;
  try {
    fs.writeFileSync(getTmpCreditTxPath(), JSON.stringify(records, null, 2), "utf8");
  } catch {}
  try {
    fs.writeFileSync(getDurableCreditTxPath(), JSON.stringify(records, null, 2), "utf8");
  } catch {}
}

export {
  generateReferralCode,
  generateReferralShareUrl,
  generateWhatsAppShareMessage,
} from "./code";
import {
  generateReferralCode,
  generateReferralShareUrl,
  generateWhatsAppShareMessage,
} from "./code";

/**
 * Gets or creates the student's authoritative referral code
 */
export async function getOrCreateReferralCode(userId: string, studentName?: string): Promise<string> {
  if (!userId) {
    return generateReferralCode(studentName);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("referral_code")
        .eq("id", userId)
        .single();

      if (!error && data?.referral_code && data.referral_code !== "SHATERBAC") {
        return data.referral_code;
      }

      // Generate a new unique code and save
      const newCode = generateReferralCode(studentName, userId);
      const { error: updateError } = await supabase
        .from("student_profiles")
        .update({ referral_code: newCode })
        .eq("id", userId);

      if (!updateError) {
        return newCode;
      }
    } catch {
      // Fallback
    }
  }

  // Fallback to durable profile
  const profiles = loadServerStudentProfiles();
  const profile = profiles.find((p) => p.id === userId);
  const existingCode = (profile as any)?.referral_code;
  if (existingCode && existingCode !== "SHATERBAC") return existingCode;

  const newCode = generateReferralCode(studentName || profile?.fullName, userId);
  if (profile) {
    (profile as any).referral_code = newCode;
    saveServerStudentProfile(profile);
  }
  return newCode;
}

/**
 * Records a pending referral signup when a student signs up with ?ref=CODE
 */
export async function recordReferralSignup(
  referredUserId: string,
  rawReferralCode: string
): Promise<{ success: boolean; message?: string }> {
  if (!referredUserId || !rawReferralCode) {
    return { success: false, message: "Missing referredUserId or referralCode" };
  }

  const referralCode = rawReferralCode.trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Look up referrer by referral_code in Supabase
      const { data: referrer } = await supabase
        .from("student_profiles")
        .select("id, full_name, referral_code")
        .eq("referral_code", referralCode)
        .maybeSingle();

      if (referrer) {
        // Check anti-self referral
        if (referrer.id === referredUserId) {
          return { success: false, message: "Cannot refer self" };
        }

        // Check if this student already has a referral record
        const { data: existingRef } = await supabase
          .from("referrals")
          .select("id")
          .eq("referred_id", referredUserId)
          .maybeSingle();

        if (existingRef) {
          return { success: false, message: "User already referred" };
        }

        // Insert pending referral
        const { error: insertErr } = await supabase.from("referrals").insert({
          referrer_id: referrer.id,
          referred_id: referredUserId,
          referral_code: referralCode,
          status: "PENDING",
          reward_amount_dzd: REFERRAL_REWARD_AMOUNT_DZD,
        });

        if (!insertErr) {
          // Update student profile with referred_by_code
          await supabase
            .from("student_profiles")
            .update({ referred_by_code: referralCode })
            .eq("id", referredUserId);

          return { success: true, message: "Referral recorded" };
        }
      }
    } catch (err: any) {
      // Fall through to durable storage fallback
    }
  }

  // Fallback storage
  const profiles = loadServerStudentProfiles();
  const cleanLookup = referralCode.replace(/[^a-zA-Z0-9]/g, "");
  const referrer = profiles.find(
    (p) =>
      (p as any).referral_code === referralCode ||
      ((p as any).referral_code && (p as any).referral_code.replace(/[^a-zA-Z0-9]/g, "") === cleanLookup) ||
      generateReferralCode(p.fullName, p.id) === referralCode ||
      generateReferralCode(p.fullName, p.id).replace(/[^a-zA-Z0-9]/g, "") === cleanLookup
  );
  if (!referrer) {
    return { success: false, message: "Invalid referral code" };
  }
  if (referrer.id === referredUserId) {
    return { success: false, message: "Cannot refer self" };
  }

  const allRefs = loadDurableReferrals();
  const existing = allRefs.find((r) => r.referredId === referredUserId);
  if (existing) {
    return { success: false, message: "User already referred" };
  }

  const newRef: ReferralRecord = {
    id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    referrerId: referrer.id,
    referredId: referredUserId,
    referralCode,
    status: "PENDING",
    rewardAmountDzd: REFERRAL_REWARD_AMOUNT_DZD,
    createdAt: new Date().toISOString(),
  };

  allRefs.push(newRef);
  saveDurableReferrals(allRefs);

  const student = profiles.find((p) => p.id === referredUserId);
  if (student) {
    (student as any).referred_by_code = referralCode;
    saveServerStudentProfile(student);
  }

  return { success: true };
}

/**
 * Qualifies a referral and awards 700 DA to the referrer
 * Called server-side when a payment order is APPROVED or COD delivery is CONFIRMED
 */
export async function qualifyReferralOnSubscription(
  referredUserId: string,
  qualifyingOrderId: string
): Promise<{
  success: boolean;
  rewardedReferrerId?: string;
  creditAwarded?: number;
  message?: string;
}> {
  if (!referredUserId) {
    return { success: false, message: "Missing referredUserId" };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc("process_qualifying_referral", {
        p_referred_id: referredUserId,
        p_order_id: qualifyingOrderId,
      });

      if (error) {
        console.error("[Referral] Supabase RPC error:", error);
      } else if (data) {
        return {
          success: Boolean(data.success),
          rewardedReferrerId: data.rewarded_referrer_id,
          creditAwarded: data.reward_amount,
          message: data.message,
        };
      }
    } catch (err: any) {
      console.error("[Referral] Exception executing RPC:", err);
    }
  }

  // Fallback durable execution
  const allRefs = loadDurableReferrals();
  const ref = allRefs.find((r) => r.referredId === referredUserId && r.status === "PENDING");
  if (!ref) {
    return { success: false, message: "No pending referral found for user" };
  }

  // Mark qualified and rewarded
  const now = new Date().toISOString();
  ref.status = "REWARDED";
  ref.qualifyingOrderId = qualifyingOrderId;
  ref.qualifiedAt = now;
  ref.rewardedAt = now;
  saveDurableReferrals(allRefs);

  // Credit transaction for referrer
  const txs = loadDurableCreditTransactions();
  const tx: CreditTransaction = {
    id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: ref.referrerId,
    amountDzd: REFERRAL_REWARD_AMOUNT_DZD,
    type: "REFERRAL_REWARD",
    status: "AVAILABLE",
    referenceId: qualifyingOrderId,
    notes: `مكافأة إحالة الطالب المشترك (طلب رقم: ${qualifyingOrderId})`,
    createdAt: now,
  };
  txs.push(tx);
  saveDurableCreditTransactions(txs);

  // Update referrer student profile credit balance
  const profiles = loadServerStudentProfiles();
  const referrerProfile = profiles.find((p) => p.id === ref.referrerId);
  if (referrerProfile) {
    const currentCredit = (referrerProfile as any).credit_balance_dzd || 0;
    (referrerProfile as any).credit_balance_dzd = currentCredit + REFERRAL_REWARD_AMOUNT_DZD;
    saveServerStudentProfile(referrerProfile);
  }

  return {
    success: true,
    rewardedReferrerId: ref.referrerId,
    creditAwarded: REFERRAL_REWARD_AMOUNT_DZD,
    message: "Referral qualified and 700 DA credited successfully",
  };
}

/**
 * Returns full referral dashboard summary for a student
 */
export async function getReferralSummary(userId: string, origin?: string): Promise<ReferralSummary> {
  const referralCode = await getOrCreateReferralCode(userId);
  const shareUrl = generateReferralShareUrl(referralCode, origin);
  const whatsappMessage = generateWhatsAppShareMessage(referralCode, origin);

  let creditBalanceDzd = 0;
  let items: ReferralDashboardItem[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      // Fetch credit balance
      const { data: student } = await supabase
        .from("student_profiles")
        .select("credit_balance_dzd")
        .eq("id", userId)
        .single();
      if (student?.credit_balance_dzd) {
        creditBalanceDzd = student.credit_balance_dzd;
      }

      // Fetch referral records
      const { data: refs } = await supabase
        .from("referrals")
        .select(`
          id,
          status,
          created_at,
          reward_amount_dzd,
          referred_id
        `)
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      if (Array.isArray(refs)) {
        // Look up student first names for privacy-safe display
        const referredIds = refs.map((r) => r.referred_id);
        const { data: referredStudents } = await supabase
          .from("student_profiles")
          .select("id, full_name")
          .in("id", referredIds);

        const nameMap = new Map<string, string>();
        if (referredStudents) {
          for (const s of referredStudents) {
            const firstName = s.full_name ? s.full_name.split(" ")[0] : "طالب";
            nameMap.set(s.id, firstName);
          }
        }

        items = refs.map((r) => {
          const isSubscribed = r.status === "QUALIFIED" || r.status === "REWARDED";
          const isRejected = r.status === "REJECTED" || r.status === "CANCELLED";
          const friendName = nameMap.get(r.referred_id) || "طالب شاطر";

          return {
            id: r.id,
            friendName,
            status: isSubscribed ? "subscribed" : isRejected ? "rejected" : "trial",
            statusLabelAr: isSubscribed
              ? "مشترك مؤكد (700 دج)"
              : isRejected
              ? "ملغى"
              : "في فترة التجربة المجانية",
            rewardLabel: isSubscribed ? "+700 دج" : "قيد الانتظار",
            isRewarded: isSubscribed,
            createdAt: r.created_at,
          };
        });
      }
    } catch {
      // Fallback
    }
  }

  // If items are still empty, check durable storage
  if (items.length === 0) {
    const profiles = loadServerStudentProfiles();
    const userProfile = profiles.find((p) => p.id === userId);
    if (!creditBalanceDzd) {
      creditBalanceDzd = (userProfile as any)?.credit_balance_dzd || 0;
    }

    const allRefs = loadDurableReferrals();
    const userRefs = allRefs.filter((r) => r.referrerId === userId);

    items = userRefs.map((r) => {
      const isSubscribed = r.status === "QUALIFIED" || r.status === "REWARDED";
      const isRejected = r.status === "REJECTED" || r.status === "CANCELLED";
      const friendProfile = profiles.find((p) => p.id === r.referredId);
      const friendName = friendProfile?.fullName ? friendProfile.fullName.split(" ")[0] : "طالب شاطر";

      return {
        id: r.id,
        friendName,
        status: isSubscribed ? "subscribed" : isRejected ? "rejected" : "trial",
        statusLabelAr: isSubscribed
          ? "مشترك مؤكد (700 دج)"
          : isRejected
          ? "ملغى"
          : "في فترة التجربة المجانية",
        rewardLabel: isSubscribed ? "+700 دج" : "قيد الانتظار",
        isRewarded: isSubscribed,
        createdAt: r.createdAt,
      };
    });
  }

  const totalReferrals = items.length;
  const subscribedCount = items.filter((i) => i.status === "subscribed").length;
  const pendingCount = items.filter((i) => i.status === "trial").length;
  const confirmedRewardsDzd = subscribedCount * REFERRAL_REWARD_AMOUNT_DZD;
  const pendingRewardsDzd = pendingCount * REFERRAL_REWARD_AMOUNT_DZD;

  return {
    referralCode,
    shareUrl,
    whatsappMessage,
    totalReferrals,
    subscribedCount,
    pendingCount,
    confirmedRewardsDzd,
    pendingRewardsDzd,
    creditBalanceDzd,
    friends: items,
  };
}

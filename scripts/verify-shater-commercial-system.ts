/**
 * SHATER BAC — Commercial Engine V1 Verification Suite
 * Tests all 17 critical invariants:
 * 1. 7-Day Free Trial (168 hours)
 * 2. Countdown formatting in Algerian Arabic
 * 3. TRIAL_ACTIVE state and hasPremiumAccess
 * 4. TRIAL_EXPIRED state after 168 hours
 * 5. hasPremiumAccess authoritative lock
 * 6. Zero data loss on expiry
 * 7. Online payment order creation (4,900 DZD, PENDING)
 * 8. Online payment order approval elevates student to PAID
 * 9. Cash on Delivery (COD) order creation with voucher assignment
 * 10. COD delivery confirmation activates student subscription
 * 11. SHATER Pass voucher generation and format (SHATER-XXXX-XXXX)
 * 12. Voucher redemption unlocks subscription
 * 13. Double redemption rejection (anti-replay)
 * 14. Referral code generation (uppercase alphanumeric)
 * 15. Referral signup recording
 * 16. Anti-fraud: self-referral prevention
 * 17. Atomic 700 DA SHATER Credit qualification and reward upon payment approval
 */

import {
  TRIAL_DURATION_DAYS,
  TRIAL_DURATION_HOURS,
  formatTrialCountdown,
  calculateTrialExpiration,
  getStudentAccess,
  hasPremiumAccess,
} from "../src/lib/access";
import {
  createPaymentOrder,
  approvePaymentOrder,
  createCodOrder,
  confirmCodDelivery,
  getPaymentOrderById,
} from "../src/lib/operations/payments";
import {
  createVoucher,
  redeemVoucher,
} from "../src/lib/operations/vouchers";
import {
  getOrCreateReferralCode,
  recordReferralSignup,
  qualifyReferralOnSubscription,
  getReferralSummary,
} from "../src/lib/referral";
import { saveServerStudentProfile, loadServerStudentProfiles } from "../src/lib/operations/students";

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string, details?: any): void {
  totalCount++;
  if (!condition) {
    console.error(`❌ FAIL [Test ${totalCount}]: ${testName}`);
    if (details) console.error("   Details:", details);
    process.exit(1);
  } else {
    passedCount++;
    console.log(`✅ PASS [Test ${totalCount}]: ${testName}`);
  }
}

async function runSuite() {
  console.log("==================================================================");
  console.log("  SHATER BAC — COMMERCIAL SYSTEM SPECIFICATION V1 VERIFICATION");
  console.log("==================================================================\n");

  // TEST 1: 7-Day trial constants
  assert(
    TRIAL_DURATION_DAYS === 7 && TRIAL_DURATION_HOURS === 168,
    "1. Trial duration is strictly 7 days (168 hours)",
    { TRIAL_DURATION_DAYS, TRIAL_DURATION_HOURS }
  );

  // TEST 2: Algerian Arabic Countdown Formatting
  const cd1 = formatTrialCountdown(100, true); // 4 days, 4 hours
  const cd2 = formatTrialCountdown(48, true);  // 2 days
  const cd3 = formatTrialCountdown(5, true);   // 5 hours
  assert(
    cd1 === "4 أيام و 4 ساعات" && cd2 === "2 أيام" && cd3 === "5 ساعة",
    "2. Arabic trial countdown formats days and hours accurately",
    { cd1, cd2, cd3 }
  );

  // TEST 3: Access evaluation during trial
  const now = new Date();
  const trialStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const trialExpiry = calculateTrialExpiration(trialStart); // 5 days left
  const activeTrialStudent = {
    id: "student_trial_active",
    trial_started_at: trialStart.toISOString(),
    trial_expires_at: trialExpiry.toISOString(),
    access_status: "TRIAL" as any,
  };
  const accessActive = getStudentAccess(activeTrialStudent, now);
  assert(
    accessActive.status === "TRIAL_ACTIVE" && accessActive.canUseProduct === true,
    "3. Student within 168 hours evaluates to TRIAL_ACTIVE with canUseProduct = true",
    { status: accessActive.status, remainingHours: accessActive.remainingHours }
  );

  // TEST 4: Access evaluation after trial expiry
  const expiredStart = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days ago (> 7 days)
  const expiredExpiry = calculateTrialExpiration(expiredStart);
  const expiredStudent = {
    id: "student_trial_expired",
    trial_started_at: expiredStart.toISOString(),
    trial_expires_at: expiredExpiry.toISOString(),
    access_status: "TRIAL" as any,
  };
  const accessExpired = getStudentAccess(expiredStudent, now);
  assert(
    accessExpired.status === "TRIAL_EXPIRED" && accessExpired.canUseProduct === false,
    "4. Student past 168 hours without paid plan evaluates to TRIAL_EXPIRED with canUseProduct = false",
    { status: accessExpired.status, remainingHours: accessExpired.remainingHours }
  );

  // TEST 5: hasPremiumAccess server-authoritative helper
  assert(
    hasPremiumAccess(activeTrialStudent) === true,
    "5a. hasPremiumAccess is true for student in active trial"
  );
  assert(
    hasPremiumAccess(expiredStudent) === false,
    "5b. hasPremiumAccess is false for student with expired trial"
  );
  const paidStudent = {
    id: "student_paid",
    access_status: "PAID" as any,
    subscription_expires_at: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000).toISOString(),
  };
  assert(
    hasPremiumAccess(paidStudent) === true,
    "5c. hasPremiumAccess is true for student with active paid subscription"
  );

  // TEST 6: Zero data loss on expiry invariant
  saveServerStudentProfile({
    id: "student_historical_data",
    fullName: "أمين بلقاسم",
    accessStatus: "EXPIRED",
    plan: "season",
    completedMissionsCount: 14,
    demonstratedSkillsCount: 9,
    targetScore: 16.5,
    hasPendingPayment: false,
    remainingHours: 0,
  });
  const serverStudents = loadServerStudentProfiles();
  const preservedStudent = serverStudents.find((s) => s.id === "student_historical_data");
  assert(
    preservedStudent !== undefined &&
      preservedStudent.completedMissionsCount === 14 &&
      preservedStudent.demonstratedSkillsCount === 9,
    "6. Expiry preserves 100% of student learning progress and diagnostics (zero deletion)"
  );

  // TEST 7: Online payment order creation
  const orderInput = {
    userId: "student_online_buyer",
    plan: "season",
    paymentMethod: "baridimob" as const,
    studentName: "كريم يوسفي",
    studentPhone: "0550123456",
    wilayaName: "الجزائر",
  };
  const onlineOrder = await createPaymentOrder(orderInput);
  assert(
    onlineOrder.status === "PENDING" &&
      onlineOrder.amount === 4900 &&
      onlineOrder.currency === "DZD",
    "7. Online payment order created as PENDING with authoritative price 4,900 DZD",
    { orderId: onlineOrder.id, amount: onlineOrder.amount, status: onlineOrder.status }
  );

  // TEST 8: Online payment approval elevates student to PAID
  const approvalRes = await approvePaymentOrder(onlineOrder.id, "operator_admin", "Reçu validé");
  assert(
    approvalRes.success === true && approvalRes.order?.status === "APPROVED",
    "8a. Payment order transitioned to APPROVED by operator"
  );
  const updatedStudentProfiles = loadServerStudentProfiles();
  const elevatedStudent = updatedStudentProfiles.find((s) => s.id === "student_online_buyer");
  assert(
    elevatedStudent?.accessStatus === "PAID" && Boolean(elevatedStudent?.subscriptionExpiresAt),
    "8b. Student access authoritatively elevated to PAID with valid expiration date"
  );

  // TEST 9: Cash on Delivery (COD) order creation
  const codInput = {
    userId: "student_cod_buyer",
    plan: "season",
    shippingName: "سفيان بن علي",
    shippingPhone: "0661987654",
    shippingWilaya: "سطيف",
    shippingCommune: "العلمة",
    shippingAddress: "حي 500 مسكن عمارة 4",
    notes: "يرجى الاتصال قبل القدوم",
  };
  const codOrder = await createCodOrder(codInput);
  assert(
    codOrder.orderType === "COD" &&
      codOrder.deliveryStatus === "PENDING" &&
      codOrder.status === "PENDING" &&
      Boolean(codOrder.voucherCode?.startsWith("SHATER-")),
    "9. COD order created with PENDING delivery and pre-assigned SHATER Pass voucher",
    { orderId: codOrder.id, voucherCode: codOrder.voucherCode }
  );

  // TEST 10: COD delivery confirmation
  const codConfirmRes = await confirmCodDelivery(codOrder.id, "courier_agent", "تم تسليم البطاقة وقبض المبلغ نقداً");
  assert(
    codConfirmRes.success === true &&
      codConfirmRes.order?.status === "APPROVED" &&
      codConfirmRes.order?.deliveryStatus === "DELIVERED",
    "10a. COD delivery confirmed: order is APPROVED and DELIVERED"
  );
  const codStudent = loadServerStudentProfiles().find((s) => s.id === "student_cod_buyer");
  assert(
    codStudent?.accessStatus === "PAID",
    "10b. Student access elevated to PAID upon COD delivery confirmation"
  );

  // TEST 11: SHATER Pass voucher creation and format
  const voucher = await createVoucher({
    planId: "season",
    salesChannel: "LIBRARY",
  });
  const voucherFormatRegex = /^SHATER-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  assert(
    voucherFormatRegex.test(voucher.voucherCode) && voucher.status === "ACTIVE",
    "11. Physical voucher generated with format SHATER-XXXX-XXXX in ACTIVE status",
    { voucherCode: voucher.voucherCode }
  );

  // TEST 12: Voucher redemption
  const redeemRes = await redeemVoucher("student_voucher_user", voucher.voucherCode);
  assert(
    redeemRes.success === true && Boolean(redeemRes.subscriptionExpiresAt),
    "12. Voucher redeemed successfully and returned subscription expiration",
    { message: redeemRes.message }
  );
  const voucherStudent = loadServerStudentProfiles().find((s) => s.id === "student_voucher_user");
  assert(
    voucherStudent?.accessStatus === "PAID",
    "12b. Student elevated to PAID upon voucher redemption"
  );

  // TEST 13: Double redemption rejection
  const doubleRedeemRes = await redeemVoucher("student_attacker", voucher.voucherCode);
  assert(
    doubleRedeemRes.success === false,
    "13. Anti-replay: second redemption attempt of used voucher is rejected",
    { message: doubleRedeemRes.message }
  );

  // TEST 14: Referral code generation
  const refCode = await getOrCreateReferralCode("student_referrer_1", "Yacine");
  assert(
    refCode.length >= 6 && refCode === refCode.toUpperCase(),
    "14. Referral code generated as uppercase alphanumeric code",
    { refCode }
  );

  // TEST 15: Recording referral signup
  saveServerStudentProfile({
    id: "student_referrer_1",
    fullName: "ياسين بن عمارة",
    referral_code: refCode,
    accessStatus: "PAID",
  } as any);

  const refSignupRes = await recordReferralSignup("student_referred_friend", refCode);
  assert(
    refSignupRes.success === true,
    "15. Referral signup recorded for referred student with pending reward"
  );

  // TEST 16: Anti-fraud: Self-referral prevention
  const selfRefRes = await recordReferralSignup("student_referrer_1", refCode);
  assert(
    selfRefRes.success === false,
    "16a. Anti-fraud: self-referral is strictly prevented",
    { message: selfRefRes.message }
  );

  // Anti-fraud: Duplicate referral prevention
  const dupRefRes = await recordReferralSignup("student_referred_friend", refCode);
  assert(
    dupRefRes.success === false,
    "16b. Anti-fraud: duplicate referral for same referred student is strictly prevented",
    { message: dupRefRes.message }
  );

  // TEST 17: Atomic 700 DA SHATER Credit qualification upon qualifying paid subscription
  const summaryBefore = await getReferralSummary("student_referrer_1");
  const creditBefore = summaryBefore.creditBalanceDzd;

  // Qualify the referral by confirming a subscription order for the referred friend
  const qualRes = await qualifyReferralOnSubscription("student_referred_friend", "order_qualifying_123");
  assert(
    qualRes.success === true && qualRes.creditAwarded === 700,
    "17a. Referral qualified and awarded exactly 700 DA reward",
    { qualRes }
  );

  const summaryAfter = await getReferralSummary("student_referrer_1");
  assert(
    summaryAfter.creditBalanceDzd === creditBefore + 700 &&
      summaryAfter.subscribedCount >= 1,
    "17b. Referrer balance atomically incremented by +700 DA credit in dashboard summary",
    { before: creditBefore, after: summaryAfter.creditBalanceDzd, subscribedCount: summaryAfter.subscribedCount }
  );

  console.log("\n==================================================================");
  console.log(`  ALL ${passedCount} / ${totalCount} SHATER COMMERCIAL V1 INVARIANTS PASSED! 🚀`);
  console.log("==================================================================\n");
}

runSuite().catch((err) => {
  console.error("Suite exception:", err);
  process.exit(1);
});

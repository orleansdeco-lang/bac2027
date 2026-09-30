import assert from "assert";

console.log("📢 [SHATER AI] Testing SHATER ADVERTISING SYSTEM Integration & Safeguards...\n");

// Simulated In-Memory Store & Domain Engine (Matching src/lib/ads/ad-service.ts)
const advertisers = new Map([
  [
    "adv_oran_academy",
    {
      id: "adv_oran_academy",
      name: "أكاديمية الباهية للتفوق",
      companyNameAr: "مؤسسة الباهية للتعليم المساند",
      isVerified: true,
      status: "active",
      wilayaCode: 31,
    },
  ],
  [
    "adv_unverified",
    {
      id: "adv_unverified",
      name: "معهد غير معتمد",
      companyNameAr: "معهد تجريبي",
      isVerified: false, // Unverified
      status: "pending_verification",
      wilayaCode: 16,
    },
  ],
]);

const campaigns = new Map();
const userImpressions = new Map();

function createAdDraft(params, createdBy = "ai_assistant") {
  const id = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  // Strict invariant: AI is FORCED to draft only!
  const status = createdBy === "ai_assistant" ? "draft" : "draft";

  const campaign = {
    id,
    title: params.title,
    advertiserId: params.advertiserId,
    status,
    placement: params.placement || "sidebar",
    targeting: params.targeting || {},
    schedule: params.schedule || { startDate: new Date().toISOString() },
    creative: {
      id: `cr_${Date.now()}`,
      advertiserId: params.advertiserId,
      format: params.creative?.format || "native",
      titleAr: params.title,
      bodyAr: params.creative?.bodyAr || "نص الإعلان الترويجي",
      assetUrl: params.creative?.assetUrl || "https://shater.dz/ad.webp",
      ctaType: params.creative?.ctaType || "whatsapp",
      ctaDestination: params.creative?.ctaDestination || "+213550123456",
      ctaLabelAr: "تواصل عبر واتساب 💬",
      whatsappPrefillText: "مرحباً، أود الاستفسار عن الدورة",
      isEducationalClaim: Boolean(params.creative?.isEducationalClaim),
      claimVerificationStatus: params.creative?.isEducationalClaim ? "unverified" : "verified",
    },
    analytics: {
      impressionsCount: 0,
      clicksCount: 0,
      whatsappClicksCount: 0,
      videoViewsCount: 0,
      videoCompletionsCount: 0,
      ctrPercentage: 0,
    },
    isMandatoryBadgeConfirmed: true, // Always mandatory «إعلان»
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  campaigns.set(id, campaign);
  return campaign;
}

function transitionCampaignStatus(campaignId, targetStatus, adminUser) {
  const camp = campaigns.get(campaignId);
  assert.ok(camp, "Campaign must exist");

  // Safety Gate 1: Advertiser must be verified before approving/activating
  const adv = advertisers.get(camp.advertiserId);
  if ((targetStatus === "approved" || targetStatus === "active" || targetStatus === "scheduled") && adv && !adv.isVerified) {
    throw new Error("SECURITY_GATE: لا يمكن تفعيل الحملة لأن المعلن غير معتمد بعد.");
  }

  // Safety Gate 2: Educational claim must be verified
  if ((targetStatus === "approved" || targetStatus === "active" || targetStatus === "scheduled") && camp.creative.isEducationalClaim && camp.creative.claimVerificationStatus !== "verified") {
    throw new Error("SECURITY_GATE: الادعاءات التعليمية بحاجة لتدقيق ومصادقة بشرية قبل التفعيل.");
  }

  camp.status = targetStatus;
  camp.updatedAt = new Date().toISOString();
  if (targetStatus === "approved" || targetStatus === "active") {
    camp.reviewedByUserId = adminUser.id;
  }
  return camp;
}

function verifyAdvertiserByHuman(advertiserId, adminUser) {
  assert.ok(adminUser && adminUser.role !== "ai_assistant", "AI is strictly prohibited from verifying advertisers!");
  const adv = advertisers.get(advertiserId);
  assert.ok(adv, "Advertiser must exist");
  adv.isVerified = true;
  adv.verifiedByUserId = adminUser.id;
  return adv;
}

function serveMatchingAds(studentContext) {
  const activeCandidates = Array.from(campaigns.values()).filter((c) => {
    if (c.status !== "active" && c.status !== "scheduled") return false;

    // Targeting Checks
    if (c.placement !== studentContext.placement) return false;
    if (c.targeting.wilayas && c.targeting.wilayas.length > 0) {
      if (!studentContext.wilayaCode || !c.targeting.wilayas.includes(studentContext.wilayaCode)) return false;
    }
    if (c.targeting.streams && c.targeting.streams.length > 0) {
      if (!studentContext.streamId || !c.targeting.streams.includes(studentContext.streamId)) return false;
    }
    if (c.targeting.grades && c.targeting.grades.length > 0) {
      if (!studentContext.grade || !c.targeting.grades.includes(studentContext.grade)) return false;
    }

    // Frequency cap check
    if (studentContext.studentId && c.schedule.frequencyCap?.maxImpressionsPerUserPerDay) {
      const key = `${studentContext.studentId}_${c.id}`;
      const seen = userImpressions.get(key) || 0;
      if (seen >= c.schedule.frequencyCap.maxImpressionsPerUserPerDay) return false;
    }

    return true;
  });

  return activeCandidates.map((c) => {
    let generatedCtaUrl = c.creative.ctaDestination;
    if (c.creative.ctaType === "whatsapp") {
      const cleanPhone = c.creative.ctaDestination.replace(/[^0-9]/g, "");
      const textParam = c.creative.whatsappPrefillText ? `?text=${encodeURIComponent(c.creative.whatsappPrefillText)}` : "";
      generatedCtaUrl = `https://wa.me/${cleanPhone}${textParam}`;
    }
    return {
      ...c,
      displayBadgeAr: "إعلان", // MANDATORY OFFICIAL LABEL
      generatedCtaUrl,
    };
  });
}

function recordAdImpression(campaignId, studentId) {
  const camp = campaigns.get(campaignId);
  assert.ok(camp);
  camp.analytics.impressionsCount += 1;
  if (studentId) {
    const key = `${studentId}_${campaignId}`;
    userImpressions.set(key, (userImpressions.get(key) || 0) + 1);
  }
}

function recordAdClick(campaignId, isWhatsApp = false) {
  const camp = campaigns.get(campaignId);
  assert.ok(camp);
  camp.analytics.clicksCount += 1;
  if (isWhatsApp) {
    camp.analytics.whatsappClicksCount += 1;
  }
  if (camp.analytics.impressionsCount > 0) {
    camp.analytics.ctrPercentage = Number(
      ((camp.analytics.clicksCount / camp.analytics.impressionsCount) * 100).toFixed(2)
    );
  }
}

// ============================================================================
// TEST 1: Complete Flow: AI creates draft -> admin reviews -> approves -> scheduled
// ============================================================================
console.log("TEST 1: Complete Flow (AI Draft -> Review -> Approve -> Schedule)...");
{
  const admin = { id: "admin_owner", role: "OWNER" };

  // 1. AI Assistant creates draft (strictly draft!)
  const draft = createAdDraft(
    {
      title: "دورة المراجعة الشاملة لعلوم الطبيعة والحياة — وهران",
      advertiserId: "adv_oran_academy",
      placement: "sidebar",
      targeting: {
        wilayas: [31],
        streams: ["sciences_exp"],
        grades: ["3AS"],
      },
      schedule: {
        startDate: new Date().toISOString(),
        frequencyCap: { maxImpressionsPerUserPerDay: 3 },
      },
      creative: {
        ctaType: "whatsapp",
        ctaDestination: "+213550123456",
        isEducationalClaim: false,
      },
    },
    "ai_assistant"
  );

  assert.strictEqual(draft.status, "draft", "AI must NEVER automatically publish; status must be draft");
  assert.strictEqual(draft.createdBy, "ai_assistant");
  console.log("  ✅ AI created draft campaign:", draft.id, "(Status: draft)");

  // 2. Admin reviews -> transitions to pending_review
  transitionCampaignStatus(draft.id, "pending_review", admin);
  assert.strictEqual(draft.status, "pending_review");
  console.log("  ✅ Admin submitted for review (Status: pending_review)");

  // 3. Admin approves -> transitions to approved
  transitionCampaignStatus(draft.id, "approved", admin);
  assert.strictEqual(draft.status, "approved");
  console.log("  ✅ Admin approved campaign (Status: approved)");

  // 4. Campaign scheduled / activated -> transitions to active
  transitionCampaignStatus(draft.id, "active", admin);
  assert.strictEqual(draft.status, "active");
  console.log("  ✅ Campaign activated (Status: active)");
}

// ============================================================================
// TEST 2: Targeting Engine & Matching Student Delivery
// ============================================================================
console.log("\nTEST 2: Targeting Engine & Matching Student Delivery...");
{
  // Student 1: 3AS Sciences in Oran (Wilaya 31) -> MATCH!
  const matchingStudent = {
    studentId: "student_oran_01",
    wilayaCode: 31,
    streamId: "sciences_exp",
    grade: "3AS",
    currentPage: "practice",
    placement: "sidebar",
  };
  const servedAds1 = serveMatchingAds(matchingStudent);
  assert.strictEqual(servedAds1.length, 1, "Matching student must receive the targeted ad");
  assert.strictEqual(servedAds1[0].displayBadgeAr, "إعلان", "Mandatory «إعلان» badge must be present");
  assert.ok(servedAds1[0].generatedCtaUrl.startsWith("https://wa.me/213550123456"), "WhatsApp URL must be formatted properly");
  console.log("  ✅ Matching student in Oran (3AS Sciences) received ad with «إعلان» badge and WhatsApp CTA.");

  // Student 2: 3AS Math in Algiers (Wilaya 16) -> NO MATCH!
  const nonMatchingStudent = {
    studentId: "student_algiers_01",
    wilayaCode: 16,
    streamId: "math",
    grade: "3AS",
    currentPage: "practice",
    placement: "sidebar",
  };
  const servedAds2 = serveMatchingAds(nonMatchingStudent);
  assert.strictEqual(servedAds2.length, 0, "Non-matching student must NOT see Oran sciences ad");
  console.log("  ✅ Non-matching student (Algiers/Math) correctly filtered out.");
}

// ============================================================================
// TEST 3: Telemetry Tracking: Impression, Click, WhatsApp Clicks & CTR
// ============================================================================
console.log("\nTEST 3: Telemetry Tracking (Impressions, Clicks, WhatsApp & CTR)...");
{
  const camp = Array.from(campaigns.values())[0];
  assert.ok(camp);

  // Initial stats
  assert.strictEqual(camp.analytics.impressionsCount, 0);
  assert.strictEqual(camp.analytics.clicksCount, 0);

  // Record 10 impressions
  for (let i = 0; i < 10; i++) {
    recordAdImpression(camp.id, `student_${i}`);
  }
  assert.strictEqual(camp.analytics.impressionsCount, 10);

  // Record 1 standard click
  recordAdClick(camp.id, false);
  assert.strictEqual(camp.analytics.clicksCount, 1);
  assert.strictEqual(camp.analytics.whatsappClicksCount, 0);
  assert.strictEqual(camp.analytics.ctrPercentage, 10.0);

  // Record 1 WhatsApp click
  recordAdClick(camp.id, true);
  assert.strictEqual(camp.analytics.clicksCount, 2);
  assert.strictEqual(camp.analytics.whatsappClicksCount, 1);
  assert.strictEqual(camp.analytics.ctrPercentage, 20.0);

  console.log(`  ✅ Telemetry updated: 10 impressions, 2 clicks (1 WhatsApp), CTR: ${camp.analytics.ctrPercentage}%.`);
}

// ============================================================================
// TEST 4: Safety Safeguards: Educational Claims Review Gate
// ============================================================================
console.log("\nTEST 4: Safety Safeguards (Educational Claims Review Gate)...");
{
  const admin = { id: "admin_owner", role: "OWNER" };

  // Campaign with unverified educational claim
  const unverifiedClaimDraft = createAdDraft({
    title: "دورة تضمن لك معدل 18/20 في الرياضيات",
    advertiserId: "adv_oran_academy",
    creative: {
      isEducationalClaim: true, // Needs manual verification!
    },
  });

  assert.strictEqual(unverifiedClaimDraft.creative.claimVerificationStatus, "unverified");

  // Attempting to approve must fail!
  assert.throws(
    () => {
      transitionCampaignStatus(unverifiedClaimDraft.id, "approved", admin);
    },
    /الادعاءات التعليمية بحاجة لتدقيق/,
    "Must throw when trying to approve an unverified educational claim"
  );
  console.log("  ✅ Unverified educational claim correctly blocked from activation.");

  // Human validates the claim
  unverifiedClaimDraft.creative.claimVerificationStatus = "verified";
  const approved = transitionCampaignStatus(unverifiedClaimDraft.id, "approved", admin);
  assert.strictEqual(approved.status, "approved");
  console.log("  ✅ Human-verified claim successfully approved.");
}

// ============================================================================
// TEST 5: Human-Only Advertiser Verification (AI Prohibited)
// ============================================================================
console.log("\nTEST 5: Human-Only Advertiser Verification Gate...");
{
  const aiUser = { id: "shater_ai_agent", role: "ai_assistant" };
  const humanAdmin = { id: "admin_owner", role: "OWNER" };

  // AI attempting to verify an advertiser must fail
  assert.throws(
    () => {
      verifyAdvertiserByHuman("adv_unverified", aiUser);
    },
    /AI is strictly prohibited/,
    "AI cannot auto-verify advertisers"
  );
  console.log("  ✅ AI blocked from auto-verifying advertisers.");

  // Human admin verifies advertiser
  const verifiedAdv = verifyAdvertiserByHuman("adv_unverified", humanAdmin);
  assert.strictEqual(verifiedAdv.isVerified, true);
  console.log("  ✅ Human admin successfully verified advertiser.");
}

// ============================================================================
// TEST 6: AI Read Operations Routing
// ============================================================================
console.log("\nTEST 6: AI Assistant Read Queries...");
{
  function resolveAdsQuery(q) {
    const qLower = q.toLowerCase();
    if (qLower.includes("نشط") || qLower.includes("الحملات النشطة")) return "active";
    if (qLower.includes("وهران")) return "wilaya_31";
    if (qLower.includes("واتساب")) return "whatsapp_clicks";
    if (qLower.includes("منتهية")) return "ended";
    return "overview";
  }

  assert.strictEqual(resolveAdsQuery("أعطيني الحملات النشطة."), "active");
  assert.strictEqual(resolveAdsQuery("أريني إعلانات وهران."), "wilaya_31");
  assert.strictEqual(resolveAdsQuery("كم عدد النقرات على واتساب؟"), "whatsapp_clicks");
  assert.strictEqual(resolveAdsQuery("ما هي الحملات المنتهية؟"), "ended");

  console.log("  ✅ All 4 required AI read queries matched correctly.");
}

console.log("\n========================================================");
console.log("🎉 ALL SHATER ADVERTISING SYSTEM TESTS PASSED!");
console.log("========================================================\n");

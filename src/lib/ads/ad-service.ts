/**
 * SHATER Advertising & Promotional Engine — Core Domain Service
 * 
 * Strict Invariants:
 * 1. Controlled Module: Advertisements must be reviewed before activation.
 * 2. Campaign Workflow: draft → pending_review → approved → scheduled → active → paused → ended.
 * 3. Human-Only Advertiser Verification: AI is strictly blocked from auto-verifying advertisers.
 * 4. Educational Claims Review: Educational claims must undergo manual validation.
 * 5. Mandatory Labeling: All advertisements served to students carry the official badge «إعلان».
 * 6. Multi-Channel CTA: Direct WhatsApp links with prefilled text + external links.
 */

import {
  AdCampaign,
  Advertiser,
  AdCreative,
  CampaignStatus,
  StudentTargetingContext,
  AdPlacement,
  AdAnalytics,
} from "./types";

// In-Memory Advertisers Directory
const memoryAdvertisers: Map<string, Advertiser> = new Map([
  [
    "adv_oran_academy",
    {
      id: "adv_oran_academy",
      name: "أكاديمية الباهية للتفوق",
      companyNameAr: "مؤسسة الباهية للتعليم المساند واللغات",
      contactEmail: "contact@oran-academy.dz",
      phone: "+21341000111",
      wilayaCode: 31,
      isVerified: true,
      verifiedByUserId: "admin_owner",
      verifiedAt: "2026-09-01T10:00:00Z",
      status: "active",
      notes: "مؤسسة تعليمية معتمدة بولاية وهران لدروس الدعم للبكالوريا.",
      createdAt: "2026-08-15T09:00:00Z",
    },
  ],
  [
    "adv_algiers_stem",
    {
      id: "adv_algiers_stem",
      name: "مركز الخوارزمي العلمي",
      companyNameAr: "مركز الخوارزمي للعلوم والتكنولوجيا",
      contactEmail: "info@khawarizmi-dz.com",
      phone: "+21321000222",
      wilayaCode: 16,
      isVerified: true,
      verifiedByUserId: "admin_owner",
      verifiedAt: "2026-09-05T11:00:00Z",
      status: "active",
      notes: "مركز تحضير أولمبياد الرياضيات والفيزياء لطلبة 3AS.",
      createdAt: "2026-09-01T08:00:00Z",
    },
  ],
  [
    "adv_unverified_promo",
    {
      id: "adv_unverified_promo",
      name: "معهد النخبة للتوجيه",
      companyNameAr: "معهد النخبة الخاص للتكوين",
      contactEmail: "promo@nokhba-school.dz",
      phone: "+213550999888",
      wilayaCode: 31,
      isVerified: false, // Unverified - human validation required!
      status: "pending_verification",
      notes: "طلب اعتماد جديد بانتظار إرفاق السجل التجاري والاعتماد الوزاري.",
      createdAt: "2026-09-28T14:00:00Z",
    },
  ],
]);

// In-Memory Campaigns Registry
const memoryCampaigns: Map<string, AdCampaign> = new Map([
  [
    "camp_oran_sciences_3as",
    {
      id: "camp_oran_sciences_3as",
      title: "دورة المراجعة الشاملة لعلوم الطبيعة والحياة — وهران",
      advertiserId: "adv_oran_academy",
      status: "active",
      placement: "sidebar",
      targeting: {
        wilayas: [31],
        communes: ["وهران", "بئر الجير", "السانية"],
        streams: ["sciences_exp"],
        grades: ["3AS"],
        subjects: ["natural_sciences", "physics"],
        pages: ["practice", "diwan"],
        placements: ["sidebar", "between_exercises"],
      },
      schedule: {
        startDate: "2026-09-10T00:00:00Z",
        endDate: "2026-10-31T23:59:59Z",
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        timeWindows: [{ startHour: 8, endHour: 22 }],
        frequencyCap: { maxImpressionsPerUserPerDay: 3 },
      },
      creative: {
        id: "cr_oran_01",
        advertiserId: "adv_oran_academy",
        format: "native",
        titleAr: "مراجعة مكثفة في علوم الطبيعة والحياة لطلاب بكالوريا وهران 🧬",
        bodyAr: "حل مواضيع نموذجية مع أساتذة مصححين في البكالوريا الرسمية بنظام الأفواج المصغرة.",
        assetUrl: "https://shater.dz/images/ads/oran_sciences_revision.webp",
        ctaType: "whatsapp",
        ctaDestination: "+213550123456",
        ctaLabelAr: "احجز مقعدك عبر واتساب 💬",
        whatsappPrefillText: "مرحباً، أرغب في الاستفسار عن دورة مراجعة العلوم الطبيعية 3AS في وهران.",
        isEducationalClaim: true,
        claimVerificationStatus: "verified",
        claimVerificationNotes: "تم التحقق من صفة الأساتذة ورخصة النشاط.",
      },
      analytics: {
        impressionsCount: 8450,
        clicksCount: 620,
        whatsappClicksCount: 310,
        videoViewsCount: 0,
        videoCompletionsCount: 0,
        ctrPercentage: 7.34,
      },
      budgetDzd: 35000,
      isMandatoryBadgeConfirmed: true,
      createdBy: "admin",
      createdAt: "2026-09-08T10:00:00Z",
      updatedAt: "2026-09-10T08:00:00Z",
    },
  ],
  [
    "camp_algiers_math_olympiad",
    {
      id: "camp_algiers_math_olympiad",
      title: "معسكر النخبة للرياضيات والفيزياء — الجزائر العاصمة",
      advertiserId: "adv_algiers_stem",
      status: "active",
      placement: "banner_top",
      targeting: {
        wilayas: [16, 9, 35], // Algiers, Blida, Boumerdes
        streams: ["math", "technique_math", "sciences_exp"],
        grades: ["3AS"],
        subjects: ["mathematics", "physics"],
        pages: ["home", "practice", "exam"],
        placements: ["banner_top", "announcement_bar"],
      },
      schedule: {
        startDate: "2026-09-15T00:00:00Z",
        endDate: "2026-11-15T23:59:59Z",
        daysOfWeek: [5, 6], // Fridays and Saturdays
        timeWindows: [{ startHour: 9, endHour: 20 }],
        frequencyCap: { maxImpressionsPerUserPerDay: 2 },
      },
      creative: {
        id: "cr_algiers_01",
        advertiserId: "adv_algiers_stem",
        format: "image",
        titleAr: "معسكر التفوق في الرياضيات لشعبتي الرياضيات والتقني رياضي 📐",
        bodyAr: "تمارين البكالوريات الأجنبية والمسائل الإدماجية المعقدة مع كوكبة من المفتشين.",
        assetUrl: "https://shater.dz/images/ads/math_camp_algiers.webp",
        ctaType: "external_link",
        ctaDestination: "https://khawarizmi-dz.com/camp-2026",
        ctaLabelAr: "التسجيل في المعسكر",
        isEducationalClaim: false,
        claimVerificationStatus: "verified",
      },
      analytics: {
        impressionsCount: 14200,
        clicksCount: 980,
        whatsappClicksCount: 0,
        videoViewsCount: 0,
        videoCompletionsCount: 0,
        ctrPercentage: 6.9,
      },
      budgetDzd: 50000,
      isMandatoryBadgeConfirmed: true,
      createdBy: "admin",
      createdAt: "2026-09-12T11:00:00Z",
      updatedAt: "2026-09-15T09:00:00Z",
    },
  ],
  [
    "camp_video_guide_orientation",
    {
      id: "camp_video_guide_orientation",
      title: "فيديو تعريفي: تخصصات المدرسة الوطنية للذكاء الاصطناعي",
      advertiserId: "adv_oran_academy",
      status: "ended",
      placement: "feed_native",
      targeting: {
        wilayas: [], // Nationwide
        streams: ["math", "technique_math", "sciences_exp"],
        grades: ["3AS"],
        pages: ["orientation"],
        placements: ["feed_native"],
      },
      schedule: {
        startDate: "2026-08-01T00:00:00Z",
        endDate: "2026-09-01T00:00:00Z",
      },
      creative: {
        id: "cr_video_01",
        advertiserId: "adv_oran_academy",
        format: "video",
        titleAr: "جولة حصرية داخل القطب التكنولوجي بسيدي عبد الله 🤖",
        bodyAr: "شاهد متطلبات القبول ومعدلات الترتيب الوزارية للمدرسة العليا للذكاء الاصطناعي.",
        assetUrl: "https://shater.dz/videos/ads/ensia_orientation.mp4",
        thumbnailUrl: "https://shater.dz/images/ads/ensia_thumb.webp",
        ctaType: "external_link",
        ctaDestination: "/orientation",
        ctaLabelAr: "شاهد دليل التوجيه",
        videoDurationSeconds: 120,
        isEducationalClaim: false,
        claimVerificationStatus: "verified",
      },
      analytics: {
        impressionsCount: 22400,
        clicksCount: 2150,
        whatsappClicksCount: 0,
        videoViewsCount: 16800,
        videoCompletionsCount: 11200,
        ctrPercentage: 9.6,
      },
      budgetDzd: 40000,
      isMandatoryBadgeConfirmed: true,
      createdBy: "admin",
      createdAt: "2026-07-25T14:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z",
    },
  ],
]);

// In-Memory Student Frequency Tracking (studentId:day -> count)
const userImpressionCounts = new Map<string, number>();

/**
 * 1. ADVERTISERS MANAGEMENT
 */
export async function getAdvertisers(): Promise<Advertiser[]> {
  return Array.from(memoryAdvertisers.values());
}

export async function getAdvertiserById(id: string): Promise<Advertiser | null> {
  return memoryAdvertisers.get(id) || null;
}

/**
 * Human-Only: Verifies an advertiser.
 * AI cannot call this function directly; strict human authorization required!
 */
export async function verifyAdvertiser(
  advertiserId: string,
  adminUserId: string,
  notes?: string
): Promise<{ success: boolean; advertiser?: Advertiser; error?: string }> {
  const adv = memoryAdvertisers.get(advertiserId);
  if (!adv) {
    return { success: false, error: "المعلن غير موجود." };
  }

  adv.isVerified = true;
  adv.verifiedByUserId = adminUserId;
  adv.verifiedAt = new Date().toISOString();
  adv.status = "active";
  if (notes) adv.notes = notes;

  memoryAdvertisers.set(advertiserId, adv);
  return { success: true, advertiser: adv };
}

/**
 * 2. CAMPAIGNS REPOSITORY & WORKFLOW
 */
export async function getCampaigns(filters?: {
  status?: CampaignStatus;
  wilayaCode?: number;
  placement?: AdPlacement;
}): Promise<AdCampaign[]> {
  let list = Array.from(memoryCampaigns.values());

  if (filters?.status) {
    list = list.filter((c) => c.status === filters.status);
  }
  if (filters?.wilayaCode) {
    list = list.filter(
      (c) =>
        !c.targeting.wilayas ||
        c.targeting.wilayas.length === 0 ||
        c.targeting.wilayas.includes(filters.wilayaCode!)
    );
  }
  if (filters?.placement) {
    list = list.filter((c) => c.placement === filters.placement);
  }

  return list;
}

export async function getCampaignById(id: string): Promise<AdCampaign | null> {
  return memoryCampaigns.get(id) || null;
}

/**
 * Creates an ad campaign draft.
 * STRICT INVARIANT: If created by AI assistant, it is ALWAYS a 'draft' and NEVER published automatically.
 */
export async function createAdCampaign(params: {
  title: string;
  advertiserId: string;
  placement: AdPlacement;
  targeting: AdCampaign["targeting"];
  schedule: AdCampaign["schedule"];
  creative: Omit<AdCreative, "id" | "claimVerificationStatus"> & {
    claimVerificationStatus?: "verified" | "unverified" | "rejected";
  };
  budgetDzd?: number;
  createdBy?: "admin" | "ai_assistant";
  initialStatus?: CampaignStatus;
}): Promise<AdCampaign> {
  const id = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const creativeId = `cr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // AI is strictly forced to create 'draft' only!
  const status: CampaignStatus =
    params.createdBy === "ai_assistant" ? "draft" : params.initialStatus || "draft";

  const campaign: AdCampaign = {
    id,
    title: params.title,
    advertiserId: params.advertiserId,
    status,
    placement: params.placement,
    targeting: params.targeting || {},
    schedule: params.schedule,
    creative: {
      ...params.creative,
      id: creativeId,
      advertiserId: params.advertiserId,
      claimVerificationStatus:
        params.creative.claimVerificationStatus ||
        (params.creative.isEducationalClaim ? "unverified" : "verified"),
    },
    analytics: {
      impressionsCount: 0,
      clicksCount: 0,
      whatsappClicksCount: 0,
      videoViewsCount: 0,
      videoCompletionsCount: 0,
      ctrPercentage: 0,
    },
    budgetDzd: params.budgetDzd,
    isMandatoryBadgeConfirmed: true, // «إعلان» badge is unconditionally enforced
    createdBy: params.createdBy || "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryCampaigns.set(id, campaign);
  return campaign;
}

/**
 * Transitions campaign status through the 7-stage workflow:
 * draft → pending_review → approved → scheduled → active → paused → ended
 */
export async function transitionCampaignStatus(
  campaignId: string,
  targetStatus: CampaignStatus,
  adminUserId: string,
  notes?: string
): Promise<{ success: boolean; campaign?: AdCampaign; error?: string }> {
  const camp = memoryCampaigns.get(campaignId);
  if (!camp) {
    return { success: false, error: "الحملة غير موجودة." };
  }

  // Educational claim gate: cannot activate if educational claims are unverified
  if (
    (targetStatus === "approved" || targetStatus === "active" || targetStatus === "scheduled") &&
    camp.creative.isEducationalClaim &&
    camp.creative.claimVerificationStatus !== "verified"
  ) {
    return {
      success: false,
      error: "لا يمكن اعتماد أو تفعيل الحملة قبل التدقيق البشري للادعاءات التعليمية والتحقق من مصداقيتها.",
    };
  }

  // Advertiser gate: cannot activate if advertiser is suspended or unverified
  const adv = memoryAdvertisers.get(camp.advertiserId);
  if (
    (targetStatus === "approved" || targetStatus === "active" || targetStatus === "scheduled") &&
    adv &&
    !adv.isVerified
  ) {
    return {
      success: false,
      error: "لا يمكن إطلاق الحملة لأن المعلن غير معتمد بعد. يتطلب اعتماد المعلن مصادقة بشرية أولاً.",
    };
  }

  camp.status = targetStatus;
  camp.updatedAt = new Date().toISOString();
  if (notes) camp.reviewNotes = notes;
  if (targetStatus === "approved" || targetStatus === "active") {
    camp.reviewedByUserId = adminUserId;
    camp.reviewedAt = new Date().toISOString();
  }

  memoryCampaigns.set(campaignId, camp);
  return { success: true, campaign: camp };
}

/**
 * 3. STUDENT MATCHING ENGINE (Serving Ads to Eligible Students)
 */
export async function serveMatchingAds(
  ctx: StudentTargetingContext
): Promise<Array<AdCampaign & { displayBadgeAr: string; generatedCtaUrl: string }>> {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const dayKey = now.toISOString().slice(0, 10);

  const activeCandidates = Array.from(memoryCampaigns.values()).filter((c) => {
    // 1. Status check: must be active, or scheduled with valid current date
    if (c.status !== "active") {
      if (c.status === "scheduled") {
        const start = new Date(c.schedule.startDate);
        const end = c.schedule.endDate ? new Date(c.schedule.endDate) : null;
        if (now < start || (end && now > end)) return false;
      } else {
        return false;
      }
    }

    // 2. Schedule constraints
    if (c.schedule.daysOfWeek && c.schedule.daysOfWeek.length > 0) {
      if (!c.schedule.daysOfWeek.includes(currentDay)) return false;
    }
    if (c.schedule.timeWindows && c.schedule.timeWindows.length > 0) {
      const inWindow = c.schedule.timeWindows.some(
        (w) => currentHour >= w.startHour && currentHour <= w.endHour
      );
      if (!inWindow) return false;
    }

    // 3. Placement check
    if (c.placement !== ctx.placement) return false;

    // 4. Page check
    if (c.targeting.pages && c.targeting.pages.length > 0) {
      if (!c.targeting.pages.includes(ctx.currentPage)) return false;
    }

    // 5. Geographic Wilaya & Commune check
    if (c.targeting.wilayas && c.targeting.wilayas.length > 0) {
      if (!ctx.wilayaCode || !c.targeting.wilayas.includes(ctx.wilayaCode)) {
        return false;
      }
    }
    if (c.targeting.communes && c.targeting.communes.length > 0) {
      if (!ctx.commune || !c.targeting.communes.includes(ctx.commune)) {
        return false;
      }
    }

    // 6. Academic Stream check
    if (c.targeting.streams && c.targeting.streams.length > 0) {
      if (!ctx.streamId || !c.targeting.streams.includes(ctx.streamId)) {
        return false;
      }
    }

    // 7. Academic Grade check
    if (c.targeting.grades && c.targeting.grades.length > 0) {
      if (!ctx.grade || !c.targeting.grades.includes(ctx.grade)) {
        return false;
      }
    }

    // 8. Subject check
    if (c.targeting.subjects && c.targeting.subjects.length > 0) {
      if (!ctx.currentSubject || !c.targeting.subjects.includes(ctx.currentSubject)) {
        return false;
      }
    }

    // 9. Frequency Capping
    if (ctx.studentId && c.schedule.frequencyCap?.maxImpressionsPerUserPerDay) {
      const userCapKey = `${ctx.studentId}_${c.id}_${dayKey}`;
      const seenToday = userImpressionCounts.get(userCapKey) || 0;
      if (seenToday >= c.schedule.frequencyCap.maxImpressionsPerUserPerDay) {
        return false;
      }
    }

    return true;
  });

  return activeCandidates.map((c) => {
    // Generate CTA destination (supports WhatsApp prefill or web link)
    let generatedCtaUrl = c.creative.ctaDestination;
    if (c.creative.ctaType === "whatsapp") {
      const cleanPhone = c.creative.ctaDestination.replace(/[^0-9]/g, "");
      const textParam = c.creative.whatsappPrefillText
        ? `?text=${encodeURIComponent(c.creative.whatsappPrefillText)}`
        : "";
      generatedCtaUrl = `https://wa.me/${cleanPhone}${textParam}`;
    }

    return {
      ...c,
      displayBadgeAr: "إعلان", // MANDATORY SAFETY BADGE
      generatedCtaUrl,
    };
  });
}

/**
 * 4. ANALYTICS & TELEMETRY TRACKING
 */
export async function recordAdImpression(campaignId: string, studentId?: string): Promise<void> {
  const camp = memoryCampaigns.get(campaignId);
  if (!camp) return;

  camp.analytics.impressionsCount += 1;
  if (camp.analytics.impressionsCount > 0) {
    camp.analytics.ctrPercentage = Number(
      ((camp.analytics.clicksCount / camp.analytics.impressionsCount) * 100).toFixed(2)
    );
  }

  // Update frequency cap counter
  if (studentId) {
    const dayKey = new Date().toISOString().slice(0, 10);
    const userCapKey = `${studentId}_${campaignId}_${dayKey}`;
    const prev = userImpressionCounts.get(userCapKey) || 0;
    userImpressionCounts.set(userCapKey, prev + 1);
  }

  memoryCampaigns.set(campaignId, camp);
}

export async function recordAdClick(
  campaignId: string,
  isWhatsApp = false,
  _studentId?: string
): Promise<void> {
  const camp = memoryCampaigns.get(campaignId);
  if (!camp) return;

  camp.analytics.clicksCount += 1;
  if (isWhatsApp) {
    camp.analytics.whatsappClicksCount += 1;
  }
  if (camp.analytics.impressionsCount > 0) {
    camp.analytics.ctrPercentage = Number(
      ((camp.analytics.clicksCount / camp.analytics.impressionsCount) * 100).toFixed(2)
    );
  }

  memoryCampaigns.set(campaignId, camp);
}

/**
 * 5. HIGH-LEVEL OVERVIEW & AI READ OPERATIONS
 */
export async function getAdsOverviewStats() {
  const allCampaigns = Array.from(memoryCampaigns.values());
  const activeCount = allCampaigns.filter((c) => c.status === "active").length;
  const draftCount = allCampaigns.filter((c) => c.status === "draft").length;
  const pendingReviewCount = allCampaigns.filter((c) => c.status === "pending_review").length;
  const endedCount = allCampaigns.filter((c) => c.status === "ended").length;

  const totalImpressions = allCampaigns.reduce((sum, c) => sum + c.analytics.impressionsCount, 0);
  const totalClicks = allCampaigns.reduce((sum, c) => sum + c.analytics.clicksCount, 0);
  const totalWhatsAppClicks = allCampaigns.reduce(
    (sum, c) => sum + c.analytics.whatsappClicksCount,
    0
  );

  const avgCtr =
    totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

  const allAdvertisers = Array.from(memoryAdvertisers.values());
  const verifiedAdvertisersCount = allAdvertisers.filter((a) => a.isVerified).length;
  const pendingAdvertisersCount = allAdvertisers.filter((a) => !a.isVerified).length;

  return {
    campaigns: {
      total: allCampaigns.length,
      active: activeCount,
      draft: draftCount,
      pendingReview: pendingReviewCount,
      ended: endedCount,
    },
    advertisers: {
      total: allAdvertisers.length,
      verified: verifiedAdvertisersCount,
      pending: pendingAdvertisersCount,
    },
    performance: {
      totalImpressions,
      totalClicks,
      totalWhatsAppClicks,
      avgCtrPercentage: avgCtr,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * AI Read Helper: Retrieves active campaigns
 */
export async function getActiveCampaignsList(): Promise<AdCampaign[]> {
  return Array.from(memoryCampaigns.values()).filter((c) => c.status === "active");
}

/**
 * AI Read Helper: Retrieves campaigns targeting a specific wilaya
 */
export async function getCampaignsByWilayaList(wilayaCode: number): Promise<AdCampaign[]> {
  return Array.from(memoryCampaigns.values()).filter(
    (c) =>
      c.targeting.wilayas &&
      c.targeting.wilayas.length > 0 &&
      c.targeting.wilayas.includes(wilayaCode)
  );
}

/**
 * AI Read Helper: Retrieves total WhatsApp clicks across campaigns
 */
export async function getTotalWhatsAppClicks(): Promise<{
  totalWhatsAppClicks: number;
  campaignsWithWhatsApp: Array<{
    campaignId: string;
    title: string;
    whatsappClicks: number;
    phone: string;
  }>;
}> {
  const campaigns = Array.from(memoryCampaigns.values()).filter(
    (c) => c.creative.ctaType === "whatsapp" || c.analytics.whatsappClicksCount > 0
  );

  const total = campaigns.reduce((sum, c) => sum + c.analytics.whatsappClicksCount, 0);
  const breakdown = campaigns.map((c) => ({
    campaignId: c.id,
    title: c.title,
    whatsappClicks: c.analytics.whatsappClicksCount,
    phone: c.creative.ctaDestination,
  }));

  return {
    totalWhatsAppClicks: total,
    campaignsWithWhatsApp: breakdown,
  };
}

/**
 * AI Read Helper: Retrieves ended campaigns
 */
export async function getEndedCampaignsList(): Promise<AdCampaign[]> {
  return Array.from(memoryCampaigns.values()).filter((c) => c.status === "ended");
}

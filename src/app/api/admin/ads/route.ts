import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { recordAdminAudit } from "@/lib/admin/audit";
import {
  getCampaigns,
  getCampaignById,
  createAdCampaign,
  transitionCampaignStatus,
  getAdvertisers,
  verifyAdvertiser,
  getAdsOverviewStats,
} from "@/lib/ads/ad-service";
import { CampaignStatus, AdPlacement } from "@/lib/ads/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ads
 * Retrieves ad campaigns, advertisers directory, and overview metrics.
 * Authoritative Guard: Requires 'ads.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("ads.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") as CampaignStatus | null;
  const placementFilter = searchParams.get("placement") as AdPlacement | null;
  const wilayaFilter = searchParams.get("wilaya") ? Number(searchParams.get("wilaya")) : undefined;

  try {
    const [campaigns, advertisers, overviewStats] = await Promise.all([
      getCampaigns({
        status: statusFilter || undefined,
        placement: placementFilter || undefined,
        wilayaCode: wilayaFilter,
      }),
      getAdvertisers(),
      getAdsOverviewStats(),
    ]);

    return NextResponse.json({
      success: true,
      campaigns,
      advertisers,
      overviewStats,
    });
  } catch (err: any) {
    console.error("[AdminAdsAPI] Error fetching ad data:", err);
    return NextResponse.json(
      { success: false, error: "تعذر استرجاع بيانات المنظومة الإعلانية", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ads
 * Creates an ad campaign (Admin creates draft or submitted campaign; AI creates draft ONLY).
 * Authoritative Guard: Requires 'ads.manage'.
 */
export async function POST(req: Request) {
  const authResult = await requirePermission("ads.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.title) {
      return NextResponse.json(
        { success: false, error: "عنوان الحملة مطلوب." },
        { status: 400 }
      );
    }

    const campaign = await createAdCampaign({
      title: body.title,
      advertiserId: body.advertiserId || "adv_oran_academy",
      placement: body.placement || "sidebar",
      targeting: body.targeting || {},
      schedule: body.schedule || { startDate: new Date().toISOString() },
      creative: body.creative || {
        advertiserId: body.advertiserId || "adv_oran_academy",
        format: "native",
        titleAr: body.title,
        bodyAr: body.description || "",
        assetUrl: body.imageUrl || "https://shater.dz/images/ads/default.webp",
        ctaType: body.ctaType || "external_link",
        ctaDestination: body.destinationUrl || "/orientation",
        ctaLabelAr: body.ctaLabelAr || "اكتشف المزيد",
        isEducationalClaim: Boolean(body.isEducationalClaim),
      },
      budgetDzd: body.budgetDzd,
      createdBy: "admin",
      initialStatus: body.initialStatus || "draft",
    });

    // Record audit event
    await recordAdminAudit({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "AD_CAMPAIGN_CREATED",
      resourceType: "AD_CAMPAIGN",
      resourceId: campaign.id,
      metadata: {
        title: campaign.title,
        placement: campaign.placement,
        status: campaign.status,
      },
    });

    return NextResponse.json({
      success: true,
      campaign,
      message: "تم إنشاء الحملة الإعلانية كمسودة بنجاح.",
    });
  } catch (err: any) {
    console.error("[AdminAdsAPI] Error creating ad campaign:", err);
    return NextResponse.json(
      { success: false, error: "تعذر إنشاء الحملة الإعلانية", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/ads
 * Transitions campaign status through the workflow:
 * draft → pending_review → approved → scheduled → active → paused → ended
 * Authoritative Guard: Requires 'ads.manage'.
 */
export async function PATCH(req: Request) {
  const authResult = await requirePermission("ads.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json().catch(() => null);
    const campaignId = body?.id || body?.campaignId;
    const targetStatus = body?.status as CampaignStatus;
    const notes = body?.notes;

    if (!campaignId || !targetStatus) {
      return NextResponse.json(
        { success: false, error: "معرف الحملة والحالة المستهدفة مطلوبان." },
        { status: 400 }
      );
    }

    const result = await transitionCampaignStatus(
      campaignId,
      targetStatus,
      context.userId,
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    // Record audit log
    await recordAdminAudit({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "AD_CAMPAIGN_STATUS_TRANSITION",
      resourceType: "AD_CAMPAIGN",
      resourceId: campaignId,
      metadata: {
        newStatus: targetStatus,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: result.campaign,
      message: `تم تحديث حالة الحملة الإعلانية إلى [${targetStatus}].`,
    });
  } catch (err: any) {
    console.error("[AdminAdsAPI] Error updating ad status:", err);
    return NextResponse.json(
      { success: false, error: "تعذر تحديث حالة الحملة الإعلانية", details: err?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ads
 * Human-Only: Verifies an advertiser.
 * AI cannot call this; strict human admin check.
 * Authoritative Guard: Requires 'ads.manage'.
 */
export async function PUT(req: Request) {
  const authResult = await requirePermission("ads.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json().catch(() => null);
    const advertiserId = body?.advertiserId;
    const notes = body?.notes;

    if (!advertiserId) {
      return NextResponse.json(
        { success: false, error: "معرف المعلن مطلوب للتحقق." },
        { status: 400 }
      );
    }

    const result = await verifyAdvertiser(advertiserId, context.userId, notes);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    await recordAdminAudit({
      actorUserId: context.userId,
      actorRole: context.role,
      action: "ADVERTISER_VERIFIED_BY_HUMAN",
      resourceType: "ADVERTISER",
      resourceId: advertiserId,
      metadata: { notes },
    });

    return NextResponse.json({
      success: true,
      advertiser: result.advertiser,
      message: "تم اعتماد المعلن بنجاح بواسطة المشرف البشري.",
    });
  } catch (err: any) {
    console.error("[AdminAdsAPI] Error verifying advertiser:", err);
    return NextResponse.json(
      { success: false, error: "تعذر اعتماد المعلن", details: err?.message },
      { status: 500 }
    );
  }
}

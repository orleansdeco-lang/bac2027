import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { recordAdminAudit } from "@/lib/admin/audit";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export interface AdCampaignItem {
  id: string;
  title: string;
  description: string;
  placement: "dashboard_banner" | "diwan_sidebar" | "exam_interstitial" | "announcement_bar";
  targetStreams: string[];
  targetWilayas: number[];
  imageUrl?: string;
  destinationUrl?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  clickCount: number;
  impressionCount: number;
  createdAt: string;
}

// In-memory persistent campaign registry for zero-dependency baseline
let memoryCampaigns: AdCampaignItem[] = [
  {
    id: "camp_official_bac_2027",
    title: "انطلاق التسجيلات الرسمية لبكالوريا 2027",
    description: "توجيهات وزارة التربية الوطنية وسحب استمارات الترشح الرسمية لجميع الشعب",
    placement: "dashboard_banner",
    targetStreams: [],
    targetWilayas: [],
    destinationUrl: "/orientation",
    startDate: "2026-09-01T00:00:00Z",
    isActive: true,
    clickCount: 1420,
    impressionCount: 18500,
    createdAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "camp_diwan_night_sessions",
    title: "جلسات المذاكرة الجماعية الليلية في الديوان",
    description: "طاولات مذاكرة هادئة مع طلاب من نفس شعبتك وتركيز بنظام بومودورو",
    placement: "announcement_bar",
    targetStreams: ["sciences_exp", "math", "technique_math"],
    targetWilayas: [],
    destinationUrl: "/diwan",
    startDate: "2026-09-15T00:00:00Z",
    isActive: true,
    clickCount: 890,
    impressionCount: 12400,
    createdAt: "2026-09-15T12:00:00Z",
  },
];

/**
 * GET /api/admin/ads
 * Lists campaigns and advertisements.
 * Authoritative Guard: Requires 'ads.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("ads.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const client = getAdminClient() || (authResult.context.token ? createAuthenticatedSupabaseClient(authResult.context.token) : null) || supabase;

  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from("ad_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, campaigns: data });
      }
    } catch {}
  }

  return NextResponse.json({ success: true, campaigns: memoryCampaigns });
}

/**
 * POST /api/admin/ads
 * Creates a new announcement or promotional campaign.
 * Authoritative Guard: Requires 'ads.manage'.
 */
export async function POST(req: Request) {
  const authResult = await requirePermission("ads.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json();
    if (!body.title || !body.placement) {
      return NextResponse.json({ success: false, error: "العنوان ومكان الظهور حقول إجبارية" }, { status: 400 });
    }

    const newCampaign: AdCampaignItem = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: body.title.trim(),
      description: (body.description || "").trim(),
      placement: body.placement,
      targetStreams: Array.isArray(body.targetStreams) ? body.targetStreams : [],
      targetWilayas: Array.isArray(body.targetWilayas) ? body.targetWilayas : [],
      imageUrl: body.imageUrl || undefined,
      destinationUrl: body.destinationUrl || undefined,
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || undefined,
      isActive: body.isActive !== false,
      clickCount: 0,
      impressionCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Store in memory buffer
    memoryCampaigns.unshift(newCampaign);

    // Try persisting to Supabase if table exists
    const client = getAdminClient() || (context.token ? createAuthenticatedSupabaseClient(context.token) : null) || supabase;
    if (isSupabaseConfigured && client) {
      try {
        await client.from("ad_campaigns").insert({
          id: newCampaign.id,
          title: newCampaign.title,
          description: newCampaign.description,
          placement: newCampaign.placement,
          target_streams: newCampaign.targetStreams,
          target_wilayas: newCampaign.targetWilayas,
          image_url: newCampaign.imageUrl,
          destination_url: newCampaign.destinationUrl,
          start_date: newCampaign.startDate,
          end_date: newCampaign.endDate,
          is_active: newCampaign.isActive,
          created_by: context.userId,
        });
      } catch {}
    }

    // Record audit log
    await recordAdminAudit(
      {
        actorUserId: context.userId,
        actorRole: context.role,
        action: "CAMPAIGN_CREATED",
        resourceType: "ad_campaign",
        resourceId: newCampaign.id,
        afterState: { title: newCampaign.title, placement: newCampaign.placement },
      },
      context.token
    );

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to create campaign" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/ads
 * Toggles or updates campaign status.
 * Authoritative Guard: Requires 'ads.manage'.
 */
export async function PATCH(req: Request) {
  const authResult = await requirePermission("ads.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing campaign id" }, { status: 400 });
    }

    let updated: AdCampaignItem | null = null;
    memoryCampaigns = memoryCampaigns.map((c) => {
      if (c.id === id) {
        updated = { ...c, isActive: Boolean(isActive) };
        return updated;
      }
      return c;
    });

    const client = getAdminClient() || (context.token ? createAuthenticatedSupabaseClient(context.token) : null) || supabase;
    if (isSupabaseConfigured && client) {
      try {
        await client
          .from("ad_campaigns")
          .update({ is_active: Boolean(isActive), updated_at: new Date().toISOString() })
          .eq("id", id);
      } catch {}
    }

    await recordAdminAudit(
      {
        actorUserId: context.userId,
        actorRole: context.role,
        action: "CAMPAIGN_STATUS_UPDATED",
        resourceType: "ad_campaign",
        resourceId: id,
        afterState: { isActive },
      },
      context.token
    );

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to update campaign" }, { status: 500 });
  }
}

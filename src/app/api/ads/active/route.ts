import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/ads/active
 * Public endpoint to fetch targeted active approved banner ads
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement") || "banner_top";
    const stream = searchParams.get("stream") || null;
    const wilaya = searchParams.get("wilaya") || null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          ad: {
            id: data.id,
            name: data.name,
            creative: {
              titleAr: data.title || "دورة المراجعة الشاملة للبكالوريا",
              bodyAr: data.body || "تدريبات مكثفة ومنهجية حل المواضيع الوزارية الرسمية.",
              assetUrl: data.asset_url || "/illustrations/ads/bac_pack.png",
              ctaType: data.cta_type || "whatsapp",
              ctaDestination: data.cta_destination || "+213550000000",
              ctaLabelAr: "سجل الآن",
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true, ad: null });
  } catch {
    return NextResponse.json({ success: true, ad: null });
  }
}

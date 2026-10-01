import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { sanitizeFileName } from "./document-storage-service";

export const EXAM_STORAGE_BUCKET = "exam_files";

export interface SelfHostResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
  resourceId: string;
}

/**
 * Downloads a remote PDF file and uploads it directly to our internal Supabase Storage bucket,
 * then updates the `resources` table in Supabase with the self-hosted URL.
 */
export async function selfHostExamPdf(
  resourceId: string,
  remotePdfUrl: string,
  subject: string = "general",
  title: string = "exam"
): Promise<SelfHostResult> {
  if (!remotePdfUrl || !remotePdfUrl.startsWith("http")) {
    return { success: false, error: "Invalid remote PDF URL", resourceId };
  }

  // If already self-hosted on our Supabase Storage, skip
  if (remotePdfUrl.includes("/storage/v1/object/public/exam_files/")) {
    return { success: true, publicUrl: remotePdfUrl, resourceId };
  }

  try {
    // 1. Fetch PDF buffer
    const response = await fetch(remotePdfUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/pdf,application/octet-stream,*/*",
        Referer: "https://eddirasa.com/",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download remote PDF: HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Prepare Storage Path
    const cleanSubject = sanitizeFileName(subject || "general");
    const safeTitle = sanitizeFileName(title.slice(0, 50));
    const storagePath = `exams/${cleanSubject}/${resourceId}_${safeTitle}.pdf`;

    if (!isSupabaseConfigured || !supabase) {
      throw new Error("Supabase is not configured");
    }

    // 3. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(EXAM_STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 4. Get Public Permanent URL
    const { data: publicUrlData } = supabase.storage
      .from(EXAM_STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const hostedUrl = publicUrlData.publicUrl;

    // 5. Update `resources` table with self-hosted URL
    const { data: existing } = await supabase
      .from("resources")
      .select("pdf_links")
      .eq("id", resourceId)
      .single();

    const existingLinks: string[] = Array.isArray(existing?.pdf_links) ? existing.pdf_links : [];
    const updatedLinks = [hostedUrl, ...existingLinks.filter((l) => l !== remotePdfUrl)];

    await supabase
      .from("resources")
      .update({ pdf_links: updatedLinks })
      .eq("id", resourceId);

    return {
      success: true,
      publicUrl: hostedUrl,
      resourceId,
    };
  } catch (err: any) {
    console.error(`[SelfHost] Failed to host PDF for resource ${resourceId}:`, err);
    return {
      success: false,
      error: err?.message || "Unknown error during self-hosting",
      resourceId,
    };
  }
}

/**
 * Batch self-host up to `limit` unhosted resources
 */
export async function batchSelfHostResources(limit = 25): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  results: SelfHostResult[];
}> {
  if (!supabase) {
    return { total: 0, succeeded: 0, failed: 0, results: [] };
  }

  // Find resources that do not have our internal Supabase Storage URL yet
  const { data: items, error } = await supabase
    .from("resources")
    .select("id, title, subject, pdf_links")
    .neq("pdf_links", "{}")
    .limit(limit);

  if (error || !items) {
    return { total: 0, succeeded: 0, failed: 0, results: [] };
  }

  const results: SelfHostResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const item of items) {
    const rawLink = item.pdf_links?.[0];
    if (rawLink && !rawLink.includes("/storage/v1/object/public/exam_files/")) {
      const res = await selfHostExamPdf(item.id, rawLink, item.subject, item.title);
      results.push(res);
      if (res.success) succeeded++;
      else failed++;
    }
  }

  return {
    total: items.length,
    succeeded,
    failed,
    results,
  };
}

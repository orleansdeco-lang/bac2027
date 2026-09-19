import { supabase, isSupabaseConfigured } from "../supabase/client";

export const EXAM_BUCKET = "exam_documents";
export const COMMUNITY_BUCKET = "community_uploads";

export const ALLOWED_DOC_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

export function sanitizeFileName(name: string): string {
  if (!name) return `file_${Date.now()}`;
  return name
    .replace(/\0/g, "")
    .replace(/\.\.+[/\\]/g, "")
    .replace(/[/\\]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "");
}

export interface UploadDocumentResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
  fileType?: "pdf" | "image" | "none";
}

/**
 * Upload a document (PDF or Image) to Supabase Storage or fallback base64
 */
export async function uploadDocument(
  file: File | Blob,
  bucket: "exam_documents" | "community_uploads" = "exam_documents",
  subFolder: string = "general",
  originalName?: string
): Promise<UploadDocumentResult> {
  try {
    const rawName = originalName || (file as File).name || `file_${Date.now()}`;
    const sanitized = sanitizeFileName(rawName);
    const ext = sanitized.substring(sanitized.lastIndexOf(".")).toLowerCase();

    let fileType: "pdf" | "image" | "none" = "none";
    if (ext === ".pdf" || file.type === "application/pdf") {
      fileType = "pdf";
    } else if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext) || file.type.startsWith("image/")) {
      fileType = "image";
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const objectPath = `${subFolder}/${uniqueId}_${sanitized}`;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(objectPath, file, {
          contentType: file.type || (fileType === "pdf" ? "application/pdf" : "image/jpeg"),
          upsert: true,
        });

      if (!error && data) {
        const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(objectPath);
        return {
          success: true,
          publicUrl: pubData.publicUrl,
          fileType,
        };
      }
      if (error) {
        console.warn("Supabase storage upload error, falling back:", error.message);
      }
    }

    // Fallback: Read as base64 Data URL (resilient for offline/local testing)
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return {
      success: true,
      publicUrl: base64,
      fileType,
    };
  } catch (err: any) {
    console.error("Document upload failed:", err);
    return {
      success: false,
      error: err?.message || "فشل رفع الملف. يرجى إعادة المحاولة.",
      fileType: "none",
    };
  }
}

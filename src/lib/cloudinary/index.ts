/**
 * Cloudinary Integration for BAC Mastery
 * Provides high-speed, CDN-accelerated WebP page transformations and clean PDF downloads
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "edjddozs";

export interface ExamCloudinaryMeta {
  year: number;
  session?: "regular" | "exceptional";
  streamId: string;
  subjectId: string;
}

/**
 * Builds standard Cloudinary asset public ID for an exam topic or solution
 */
export function getExamPublicId(
  meta: ExamCloudinaryMeta,
  isSolution: boolean = false
): string {
  const sessionTag = meta.session === "exceptional" ? "exc" : "reg";
  const typeTag = isSolution ? "corrige" : "sujet";
  return `bac-exams/${meta.year}/${sessionTag}/${meta.streamId}/${meta.subjectId}_${typeTag}`;
}

/**
 * Returns optimized page image URL (WebP, auto quality, specific page number)
 * Cloudinary renders PDF pages as images on the fly via `pg_<page_number>`
 */
export function getExamPageImageUrl(
  meta: ExamCloudinaryMeta,
  pageNumber: number = 1,
  isSolution: boolean = false
): string {
  const publicId = getExamPublicId(meta, isSolution);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto:best,pg_${pageNumber}/${publicId}.jpg`;
}

/**
 * Returns direct attachment PDF download URL via Cloudinary CDN
 */
export function getExamPdfDownloadUrl(
  meta: ExamCloudinaryMeta,
  isSolution: boolean = false
): string {
  const publicId = getExamPublicId(meta, isSolution);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/fl_attachment/${publicId}.pdf`;
}

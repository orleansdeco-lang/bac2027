/**
 * Security & Input Sanitization Engine
 * Prevents Stored XSS and Injection attacks while safely preserving Markdown & KaTeX formulas
 */

/**
 * Sanitizes user-submitted text content (e.g., Campus Feed posts, comments, table titles).
 * Strips dangerous HTML tags, javascript: schemes, event handlers, and data URIs,
 * while allowing safe Markdown formatting, numbers, Arabic/French text, and LaTeX math ($...$, $$...$$).
 */
export function sanitizeUserContent(input: string): string {
  if (!input || typeof input !== "string") return "";

  let cleaned = input;

  // 1. Remove dangerous script, iframe, object, embed, form, link, style tags and their contents
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  cleaned = cleaned.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  cleaned = cleaned.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "");
  cleaned = cleaned.replace(/<link\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/<base\b[^>]*>/gi, "");
  cleaned = cleaned.replace(/<meta\b[^>]*>/gi, "");

  // 2. Strip inline event handlers (e.g. onload=, onerror=, onclick=)
  cleaned = cleaned.replace(/\bon\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 3. Strip javascript: and vbscript: URIs
  cleaned = cleaned.replace(/(javascript|vbscript|data):/gi, "blocked:");

  // 4. Neutralize raw HTML tags but preserve text content
  // Allows only safe text; Markdown rendering will still format headings, lists, bold, and KaTeX math safely
  cleaned = cleaned.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, "");

  // 5. Trim leading/trailing whitespace
  return cleaned.trim();
}

/**
 * Sanitizes a short single-line string (e.g. title, lesson name, tag)
 */
export function sanitizeSingleLine(input: string, maxLength: number = 200): string {
  if (!input || typeof input !== "string") return "";
  const cleaned = sanitizeUserContent(input).replace(/[\r\n\t]+/g, " ");
  return cleaned.slice(0, maxLength).trim();
}

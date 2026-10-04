import { NextRequest, NextResponse } from "next/server";
import https from "https";
import http from "http";
import { requireServerAuth } from "@/lib/auth/server-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-memory resolution cache to make repeat requests instant (0ms latency)
const resolvedUrlCache = new Map<string, string>();

/**
 * Robust HTTP/HTTPS buffer fetcher using Node's native network stack.
 * Bypasses Undici/TLS-fingerprint blocks (e.g. Cloudflare on dzexams.com).
 */
function fetchBuffer(
  url: string,
  options: { headers?: Record<string, string>; maxRedirects?: number } = {}
): Promise<{
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  buffer: Buffer;
  finalUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const maxRedirects = options.maxRedirects ?? 5;
    if (maxRedirects <= 0) {
      return reject(new Error("Too many redirects"));
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return reject(new Error(`Invalid URL: ${url}`));
    }

    const client = parsed.protocol === "https:" ? https : http;
    const reqHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "application/pdf,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Referer: url.includes("dzexams.com") ? "https://www.dzexams.com/" : "https://eddirasa.com/",
      ...(options.headers || {}),
    };

    const req = client.get(
      url,
      {
        headers: reqHeaders,
        timeout: 15000,
      },
      (res) => {
        // Follow redirects
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectUrl = new URL(res.headers.location, url).toString();
          return fetchBuffer(redirectUrl, {
            ...options,
            maxRedirects: maxRedirects - 1,
          })
            .then(resolve)
            .catch(reject);
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 200,
            headers: res.headers,
            buffer: Buffer.concat(chunks),
            finalUrl: url,
          });
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Upstream connection timed out"));
    });
  });
}

function extractPdfUrlFromHtml(html: string): string | null {
  const globalFileMatch = html.match(/file:\s*["']([^"']+\.pdf)["']/i);
  if (globalFileMatch && globalFileMatch[1]) {
    return globalFileMatch[1].replace(/\\\//g, "/");
  }

  const uploadsMatch = html.match(/https?:\\?\/\\?\/[^\s"'<>]*(?:uploads|sujets)[^\s"'<>]+\.pdf/i);
  if (uploadsMatch) {
    let u = uploadsMatch[0].replace(/\\\//g, "/");
    if (u.includes("docs.google.com/viewer") && u.includes("url=")) {
      const extracted = new URL(u).searchParams.get("url");
      if (extracted) u = decodeURIComponent(extracted);
    }
    return u;
  }

  const anyPdfMatch = html.match(/https?:\\?\/\\?\/[^\s"'<>]+\.pdf/i);
  if (anyPdfMatch) {
    let u = anyPdfMatch[0].replace(/\\\//g, "/");
    if (u.includes("docs.google.com/viewer") && u.includes("url=")) {
      const extracted = new URL(u).searchParams.get("url");
      if (extracted) u = decodeURIComponent(extracted);
    }
    return u;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  const download = searchParams.get("download") === "1";
  const customFilename = searchParams.get("filename");
  const isPremiumRequired = searchParams.get("isPremium") === "1";

  // Server-Side Entitlement Gate for Premium Documents
  if (isPremiumRequired) {
    const authResult = await requireServerAuth(request, { requireFeature: "EXAMS_FULL_LIBRARY" });
    if (!authResult.authorized) {
      if (authResult.errorResponse) return authResult.errorResponse;
      return NextResponse.json(
        { error: "Subscription required for this document" },
        { status: 403 }
      );
    }
  }

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }


  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Check cache only if it's already a direct PDF URL
  let cached = resolvedUrlCache.get(rawUrl);
  let targetUrl = (cached && cached.toLowerCase().includes(".pdf")) ? cached : parsedUrl.toString();

  // 1. Google Drive direct conversion
  if (targetUrl.includes("drive.google.com/file/d/")) {
    const driveIdMatch = targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      targetUrl = `https://drive.google.com/uc?export=download&id=${driveIdMatch[1]}`;
      resolvedUrlCache.set(rawUrl, targetUrl);
    }
  }

  // 2. Pre-resolve HTML pages (DzExams / Eddirasa)
  if (!targetUrl.toLowerCase().endsWith(".pdf") && (targetUrl.includes("dzexams.com") || targetUrl.includes("eddirasa.com"))) {
    try {
      const page = await fetchBuffer(targetUrl);
      const pageHtml = page.buffer.toString("utf-8");
      const extracted = extractPdfUrlFromHtml(pageHtml);
      if (extracted) {
        targetUrl = extracted;
        resolvedUrlCache.set(rawUrl, targetUrl);
      }
    } catch (err) {
      console.warn("Pre-resolve error, will try direct fetch:", err);
    }
  }

function renderFallbackHtmlResponse(
  targetUrl: string,
  statusCode?: number,
  errorDetail?: string
) {
  const safeTarget = targetUrl.replace(/"/g, "&quot;");
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(targetUrl)}&embedded=true`;
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>معاينة المرجع</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f172a;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 24px;
      padding: 32px 24px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .icon-badge {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      border-radius: 18px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
    }
    h2 { font-size: 18px; font-weight: 800; color: #f8fafc; margin-bottom: 8px; line-height: 1.4; }
    p { font-size: 13.5px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
    .actions { display: flex; flex-direction: column; gap: 10px; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
    }
    .btn-primary:hover { background: #059669; }
    .btn-secondary {
      background: #334155;
      color: #f1f5f9;
      border: 1px solid #475569;
    }
    .btn-secondary:hover { background: #475569; color: #ffffff; }
    .status-badge {
      display: inline-block;
      margin-top: 18px;
      font-size: 11px;
      color: #64748b;
      font-family: ui-monospace, monospace;
      direction: ltr;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">📖</div>
    <h2>حماية المصدر الخارجي</h2>
    <p>يفرض الموقع المستضيف لهذا المرجع قيود حماية تمنع التضمين التلقائي (${statusCode || 403}). يمكنك تصفح وتحميل المرجع مباشرة عبر الخيارات التالية:</p>
    <div class="actions">
      <a href="${safeTarget}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <span>فتح المرجع مباشرة في نافذة مستقلة ↗</span>
      </a>
      <a href="${googleViewerUrl}" class="btn btn-secondary">
        <span>المعاينة عبر قارئ Google Docs 🔍</span>
      </a>
      <a href="${safeTarget}" download target="_blank" class="btn btn-secondary">
        <span>تحميل المرجع مباشرة إلى جهازك ⬇</span>
      </a>
    </div>
    <div class="status-badge">Status: ${statusCode || 403}${errorDetail ? ` (${errorDetail})` : ''}</div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

  try {
    let upstreamRes = await fetchBuffer(targetUrl);

    if (upstreamRes.statusCode < 200 || upstreamRes.statusCode >= 400) {
      if (download) {
        return NextResponse.redirect(targetUrl, 302);
      }
      return renderFallbackHtmlResponse(targetUrl, upstreamRes.statusCode);
    }

    let finalBuffer = upstreamRes.buffer;
    let rawContentType = (upstreamRes.headers["content-type"] as string) || "application/pdf";

    // 3. Emergency fallback: if upstream still returned text/html, extract PDF from it and fetch the PDF stream!
    if (rawContentType.includes("text/html") || !targetUrl.toLowerCase().includes(".pdf")) {
      const htmlText = finalBuffer.toString("utf-8");
      const extracted = extractPdfUrlFromHtml(htmlText);
      if (extracted && extracted !== targetUrl) {
        targetUrl = extracted;
        resolvedUrlCache.set(rawUrl, targetUrl);
        const pdfRes = await fetchBuffer(extracted);
        if (pdfRes.statusCode === 200) {
          finalBuffer = pdfRes.buffer;
          rawContentType = "application/pdf";
        }
      }
    }

    const contentType = rawContentType.includes("pdf") ? "application/pdf" : rawContentType;
    const urlFilename = new URL(targetUrl).pathname.split("/").pop() || "exam.pdf";
    const filename = customFilename || decodeURIComponent(urlFilename);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      download
        ? `attachment; filename="${encodeURIComponent(filename)}"`
        : `inline; filename="${encodeURIComponent(filename)}"`
    );
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.delete("X-Frame-Options");
    headers.delete("Content-Security-Policy");

    return new Response(new Uint8Array(finalBuffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("PDF Proxy error:", err);
    if (download) {
      return NextResponse.redirect(targetUrl, 302);
    }
    return renderFallbackHtmlResponse(targetUrl, 502, err?.message);
  }
}

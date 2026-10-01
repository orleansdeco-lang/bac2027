import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  const download = searchParams.get("download") === "1";
  const customFilename = searchParams.get("filename");

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

  let targetUrl = parsedUrl.toString();

  // 1. Smart resolver for dzexams.com pages (viewer or annales)
  if (targetUrl.includes("dzexams.com") && !targetUrl.toLowerCase().endsWith(".pdf")) {
    try {
      const pageHtml = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: "https://www.dzexams.com/",
        },
      }).then((r) => r.text());

      // Prefer direct uploads link if present
      const directUploadMatch = pageHtml.match(/https?:\\?\/\\?\/[^\s"'<>]*(?:dzexams\.com)?\\?\/uploads\\?\/[^\s"'<>]+\.pdf/i);
      const generalPdfMatch = pageHtml.match(/https?:\\?\/\\?\/[^\s"'<>]+\.pdf/i);
      const matched = directUploadMatch || generalPdfMatch;

      if (matched) {
        targetUrl = matched[0].replace(/\\\//g, "/");
        if (targetUrl.includes("docs.google.com/viewer") && targetUrl.includes("url=")) {
          const extracted = new URL(targetUrl).searchParams.get("url");
          if (extracted) targetUrl = decodeURIComponent(extracted);
        }
      }
    } catch (err) {
      console.warn("Failed to extract dzexams PDF link, using original:", err);
    }
  }
  // 2. Smart resolver for eddirasa article pages
  else if (targetUrl.includes("eddirasa.com") && !targetUrl.toLowerCase().endsWith(".pdf")) {
    try {
      const pageHtml = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: "https://eddirasa.com/",
        },
      }).then((r) => r.text());

      const pdfMatch = pageHtml.match(/https?:\/\/[^\s"'<>]+\.pdf/i);
      if (pdfMatch) {
        targetUrl = pdfMatch[0];
      }
    } catch (err) {
      console.warn("Failed to extract eddirasa PDF link:", err);
    }
  }
  // 3. Smart resolver for Google Drive view links
  else if (targetUrl.includes("drive.google.com/file/d/")) {
    const driveIdMatch = targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      targetUrl = `https://drive.google.com/uc?export=download&id=${driveIdMatch[1]}`;
    }
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/pdf,application/octet-stream,*/*",
        Referer: targetUrl.includes("dzexams.com") ? "https://www.dzexams.com/" : "https://eddirasa.com/",
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: `Upstream returned status ${upstreamRes.status}` },
        { status: upstreamRes.status }
      );
    }

    const contentType = upstreamRes.headers.get("content-type") || "application/pdf";
    const urlFilename = new URL(targetUrl).pathname.split("/").pop() || "exam.pdf";
    const filename = customFilename || decodeURIComponent(urlFilename);

    const headers = new Headers();
    headers.set("Content-Type", contentType.includes("pdf") ? "application/pdf" : contentType);
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

    return new Response(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("PDF Proxy error:", err);
    return NextResponse.json(
      { error: "Failed to proxy document stream", details: err?.message },
      { status: 502 }
    );
  }
}

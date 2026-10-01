import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get("url");
  const download = searchParams.get("download") === "1";
  const customFilename = searchParams.get("filename");

  if (!pdfUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(pdfUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const upstreamRes = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/pdf,application/octet-stream,*/*",
        Referer: "https://eddirasa.com/",
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: `Upstream returned status ${upstreamRes.status}` },
        { status: upstreamRes.status }
      );
    }

    const contentType = upstreamRes.headers.get("content-type") || "application/pdf";
    const urlFilename = parsedUrl.pathname.split("/").pop() || "exam.pdf";
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

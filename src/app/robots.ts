import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shater.dz";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/account",
          "/account/*",
          "/profile",
          "/profile/*",
          "/mission",
          "/mission/*",
          "/diagnostic",
          "/diagnostic/*",
          "/error-lab",
          "/progress",
          "/roadmap",
          "/exam/*",
          "/ops",
          "/ops/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

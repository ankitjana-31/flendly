import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/lent", "/borrowed", "/requests", "/loans", "/notifications", "/profile", "/self-track", "/auth", "/complete-profile", "/api"],
      },
    ],
    sitemap: "https://flendly.in/sitemap.xml",
    host: "https://flendly.in",
  };
}

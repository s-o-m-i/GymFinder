import type { MetadataRoute } from "next";

function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();
  const isProductionSite = !base.includes("localhost");

  return {
    rules: {
      userAgent: "*",
      allow: ["/owner/register", "/trainer/register"],
      disallow: [
        "/admin/",
        "/api/",
        "/owner/",
        "/trainer/dashboard",
        "/trainer/login",
        "/trainer/auth",
        "/trainer/verify-email",
        "/trainer/forgot-password",
        "/trainer/reset-password",
        "/user/",
        "/sign-in",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    ...(isProductionSite ? { host: new URL(base).host } : {}),
  };
}

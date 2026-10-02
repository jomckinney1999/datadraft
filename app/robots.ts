import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Crawl the public pages; skip the API, the QA bench, the brand route and the account page. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/demo", "/brand/", "/account", "/auth/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

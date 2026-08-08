import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // La aplicación, el panel y los enlaces privados no se indexan nunca.
      disallow: ["/app/", "/admin/", "/p/", "/api/", "/login", "/invitacion/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}

import type { MetadataRoute } from "next";
import { RUBRO_PARAMS } from "@/lib/presets";
import { absoluteUrl } from "@/lib/site";

/**
 * Sitemap generado desde los presets.
 * Agregar un rubro nuevo agrega su landing acá automáticamente: cero mantenimiento.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/precios"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/registro"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/terminos"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacidad"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const industryPages: MetadataRoute.Sitemap = RUBRO_PARAMS.map((rubro) => ({
    url: absoluteUrl(`/${rubro}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.95,
  }));

  return [...staticPages, ...industryPages];
}

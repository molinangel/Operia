import { PLANS } from "@/lib/plans";
import type { IndustryPreset } from "@/lib/presets";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Datos estructurados.
 *
 * Es lo que hace que Google entienda qué es esto y muestre las preguntas
 * frecuentes directamente en los resultados. Barato de poner, caro de omitir.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        /**
         * `JSON.stringify` no escapa `<`, así que un texto con `</script>`
         * cerraría la etiqueta y ejecutaría lo que viniera después. Hoy todo el
         * contenido es nuestro, pero el día que acá entre el nombre de un
         * negocio esto ya está blindado. Recomendación explícita de los docs
         * de Next 16 (01-app/02-guides/json-ld.md).
         */
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function softwareSchema(preset: IndustryPreset, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${site.name} — ${preset.name}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl(path),
    description: preset.marketing.metaDescription,
    inLanguage: "es",
    offers: PLANS.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: (plan.priceCents / 100).toFixed(2),
      priceCurrency: plan.currency,
      category: "SaaS subscription",
      url: absoluteUrl("/precios"),
    })),
    featureList: preset.marketing.features.map((f) => f.title),
  };
}

export function faqSchema(preset: IndustryPreset) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preset.marketing.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.description,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.support.email,
      availableLanguage: ["Spanish"],
    },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

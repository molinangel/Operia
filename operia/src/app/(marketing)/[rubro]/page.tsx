import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  breadcrumbSchema,
  faqSchema,
  JsonLd,
  softwareSchema,
} from "@/components/marketing/json-ld";
import {
  Configurable,
  Faq,
  Features,
  FinalCta,
  Hero,
  Journey,
  PainPoints,
  Pricing,
  RelatedIndustries,
} from "@/components/marketing/sections";
import {
  getPresetByRubroParam,
  LANDING_PRESETS,
  RUBRO_PARAMS,
} from "@/lib/presets";

type Props = { params: Promise<{ rubro: string }> };

/** Solo existen las landings de los rubros conocidos: cualquier otra URL es 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return RUBRO_PARAMS.map((rubro) => ({ rubro }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { rubro } = await params;
  const preset = getPresetByRubroParam(rubro);
  if (!preset) return {};

  const m = preset.marketing;
  const path = `/${rubro}`;

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    keywords: m.keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: m.metaTitle,
      description: m.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: m.metaTitle,
      description: m.metaDescription,
    },
  };
}

export default async function RubroPage({ params }: Props) {
  const { rubro } = await params;
  const preset = getPresetByRubroParam(rubro);
  if (!preset) notFound();

  const path = `/${rubro}`;

  return (
    <>
      <JsonLd data={softwareSchema(preset, path)} />
      <JsonLd data={faqSchema(preset)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: preset.name, path },
        ])}
      />

      <Hero preset={preset} />
      <Journey preset={preset} />
      <PainPoints preset={preset} />
      <Features preset={preset} />
      <Configurable preset={preset} />
      <Pricing compact />
      <Faq preset={preset} />
      <FinalCta preset={preset} />
      <RelatedIndustries current={preset.key} presets={LANDING_PRESETS} />
    </>
  );
}

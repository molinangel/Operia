import type { Metadata } from "next";
import { IndustryShowcase } from "@/components/marketing/industry-showcase";
import {
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
} from "@/components/marketing/sections";
import { getPreset, LANDING_PRESETS } from "@/lib/presets";
import { site } from "@/lib/site";

const preset = getPreset("generic");

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
  keywords: preset.marketing.keywords,
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareSchema(preset, "/")} />
      <JsonLd data={faqSchema(preset)} />

      <Hero preset={preset} />
      <Journey preset={preset} />
      <IndustryShowcase presets={LANDING_PRESETS} />
      <PainPoints preset={preset} />
      <Features preset={preset} />
      <Configurable preset={preset} />
      <Pricing compact />
      <Faq preset={preset} />
      <FinalCta preset={preset} />
    </>
  );
}

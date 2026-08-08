import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Container, SectionHeading } from "@/components/ui/primitives";
import { Faq, FinalCta, Pricing } from "@/components/marketing/sections";
import { JsonLd, breadcrumbSchema } from "@/components/marketing/json-ld";
import { getPreset } from "@/lib/presets";
import { site } from "@/lib/site";

const preset = getPreset("generic");

export const metadata: Metadata = {
  title: "Precios",
  description:
    `Planes de ${site.name} desde USD 19 al mes. Prueba gratis ${site.trialDays} días sin tarjeta. ` +
    "Aceptamos transferencia, pago móvil, Zelle y USDT. Cancelás cuando quieras.",
  alternates: { canonical: "/precios" },
};

const guarantees = [
  {
    title: "Sin tarjeta para probar",
    detail: `${site.trialDays} días completos. Si no te sirve, no hacés nada y listo.`,
  },
  {
    title: "Sin permanencia",
    detail: "Cancelás cuando quieras, desde tu cuenta. No hay que llamar a nadie.",
  },
  {
    title: "Tus datos son tuyos",
    detail: "Exportás toda tu información en un clic, en cualquier momento.",
  },
  {
    title: "Nunca borramos tus datos",
    detail: "Si dejás de pagar, tu cuenta queda en solo lectura. Tu información sigue ahí.",
  },
];

const paymentFaq = [
  {
    q: "¿Cómo pago si no tengo tarjeta internacional?",
    a: "Aceptamos transferencia local, pago móvil, Zelle y USDT. Pagás por donde te resulte más cómodo, subís el comprobante y activamos la cuenta en menos de 24 horas.",
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí, cuando quieras, para arriba o para abajo. El cambio se ajusta en el siguiente período.",
  },
  {
    q: "¿Qué pasa si me paso del límite de mi plan?",
    a: "Te avisamos antes de llegar. Nada se bloquea de golpe ni se pierde información: te proponemos subir de plan cuando tenga sentido.",
  },
  {
    q: "¿Hay descuento por pagar el año?",
    a: "Sí: pagando anual te llevás dos meses gratis, un 17% menos.",
  },
  {
    q: "¿Hay costo de instalación o puesta en marcha?",
    a: "No. En el plan Profesional la sesión de puesta en marcha va incluida, y en Negocio te cargamos los datos iniciales nosotros.",
  },
  {
    q: "¿Puedo recuperar mi cuenta si dejé de pagar?",
    a: "Sí. La cuenta queda suspendida en modo lectura, no se borra nada. Pagás y vuelve a funcionar tal como estaba.",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Precios", path: "/precios" },
        ])}
      />

      <section className="border-b border-border py-16 text-center">
        <Container>
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Precios simples,
            <br />
            <span className="text-accent">sin letra chica</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-fg-muted">
            Elegís el plan por el tamaño de tu negocio, no por usuario. Probás
            gratis {site.trialDays} días sin poner tarjeta.
          </p>
        </Container>
      </section>

      <Pricing />

      <section className="border-b border-border bg-bg-subtle py-20">
        <Container>
          <SectionHeading
            eyebrow="Nuestro compromiso"
            title="Lo que te garantizamos siempre"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((g) => (
              <Card key={g.title} className="p-6">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-success-soft text-success">
                  <Check className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {g.detail}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-20">
        <Container>
          <SectionHeading eyebrow="Pagos" title="Cómo se paga" />
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-border rounded-xl border border-border bg-surface">
            {paymentFaq.map((item, i) => (
              <details key={i} className="group px-6 py-5" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {item.q}
                  <span className="shrink-0 text-fg-subtle transition group-open:rotate-45">
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-xl rounded-xl border border-accent/30 bg-accent-soft p-6 text-center">
            <p className="font-semibold text-fg">
              ¿Sos de los primeros 20 clientes?
            </p>
            <p className="mt-2 text-sm text-fg-muted">
              Te queda un 40% de descuento de por vida, a cambio de que nos
              cuentes qué te sirve y qué no.
            </p>
            <Button asChild className="mt-5">
              <Link href="/registro">Quiero mi descuento de fundador</Link>
            </Button>
          </div>
        </Container>
      </section>

      <Faq preset={preset} />
      <FinalCta preset={preset} />
    </>
  );
}

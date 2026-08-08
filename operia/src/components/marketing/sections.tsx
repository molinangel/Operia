import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/money";
import { isUnlimited, PLANS, yearlyCents } from "@/lib/plans";
import { type IndustryPreset, presetPath } from "@/lib/presets";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { StatusFlow, WhatsappNote, WorkOrderSheet } from "./work-order";

/* ════════════════════════════════════════════════════════════════
   PORTADA

   Asimétrica y alineada a la izquierda. El hero centrado con píldora,
   degradado y dos botones es el molde que comparten miles de landings;
   acá la jerarquía la marcan la retícula y la tipografía.
   ════════════════════════════════════════════════════════════════ */

export function Hero({ preset }: { preset: IndustryPreset }) {
  const m = preset.marketing;

  return (
    <section className="relative overflow-hidden border-b border-rule">
      <div
        className="paper-grid pointer-events-none absolute inset-0"
        aria-hidden
      />

      <Container className="relative">
        {/* Cinta de encabezado, como el membrete de un formulario */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3">
          <span className="label">
            Formulario 01 · Gestión de servicios
          </span>
          <span className="label">
            Prueba {site.trialDays} días · sin tarjeta
          </span>
        </div>

        <div className="grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="text-[2.75rem] leading-[1.02] sm:text-[3.5rem] lg:text-[4rem]">
              {m.headline}{" "}
              <em className="not-italic text-accent">{m.headlineAccent}</em>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-fg-muted">
              {m.subheadline}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={`/registro?rubro=${preset.key}`}>
                  Abrir mi cuenta
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href={whatsappLink(
                    `Hola, quiero ver ${site.name} funcionando para mi negocio.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verlo por WhatsApp
                </a>
              </Button>
            </div>

            {/* Datos duros en formato de campos, no de píldoras decorativas */}
            <dl className="mt-11 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-7 sm:grid-cols-3">
              {[
                { k: "Puesta en marcha", v: "5 minutos" },
                { k: "Tarjeta de crédito", v: "No hace falta" },
                { k: "Tus datos", v: "Exportables siempre" },
              ].map((item) => (
                <div key={item.k}>
                  <dt className="label">{item.k}</dt>
                  <dd className="mt-1.5 text-[0.9375rem]">{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-rise lg:pt-6">
            <WorkOrderSheet preset={preset} />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   DOLORES — presentados como el listado de verificación de un formulario
   ════════════════════════════════════════════════════════════════ */

export function PainPoints({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-rule py-20">
      <Container>
        <SectionHeading
          ordinal="01"
          eyebrow="El problema"
          title="Marcá las que te pasaron esta semana"
          description="Si tildás dos o más, no tenés un problema de esfuerzo: tenés un problema de sistema."
        />

        <ul className="mt-12 border-t border-border">
          {preset.marketing.painPoints.map((pain, i) => (
            <li
              key={pain.title}
              className="grid gap-3 border-b border-border py-6 sm:grid-cols-[3rem_1fr_1.1fr] sm:gap-8"
            >
              {/* Casilla de verificación tildada: el gesto del formulario */}
              <span
                aria-hidden
                className="flex size-7 items-center justify-center border border-fg text-accent"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none">
                  <path
                    d="M3 8.5 6.5 12 13 4"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="sr-only">Punto {i + 1}</span>
              </span>
              <h3 className="text-xl leading-snug">{pain.title}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-fg-muted">
                {pain.detail}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   RECORRIDO
   ════════════════════════════════════════════════════════════════ */

export function HowItWorks({ preset }: { preset: IndustryPreset }) {
  const steps = [
    {
      n: "01",
      title: "Elegís tu rubro",
      detail: `Marcás «${preset.name}» al registrarte y el sistema queda con tus estados, tus campos y tu vocabulario. No configurás nada a mano.`,
    },
    {
      n: "02",
      title: "Cargás lo que tenés abierto",
      detail:
        "Cliente, detalle y listo. Aparece en el tablero y todo el equipo lo ve al instante, desde la computadora o el celular.",
    },
    {
      n: "03",
      title: "Tu cliente aprueba desde el celular",
      detail:
        "Generás el presupuesto, lo mandás por WhatsApp y el cliente toca aprobar. A vos te llega el aviso en el momento.",
    },
  ];

  const sample = preset.notificationRules[0]?.bodyTemplate
    .replace(/\{\{contact\.name\}\}/g, "María")
    .replace(/\{\{asset\.label\}\}/g, preset.showcase.assets[0]?.label ?? "tu pedido")
    .replace(/\{\{org\.name\}\}/g, "Tu negocio")
    .replace(/\{\{appointment\.time\}\}/g, "10:30")
    .replace(/\{\{[^}]+\}\}/g, "el enlace");

  return (
    <section id="recorrido" className="border-b border-rule bg-bg-subtle py-20">
      <Container>
        <SectionHeading
          ordinal="02"
          eyebrow="Recorrido"
          title="Andando en menos de lo que dura un café"
          description="No hay implementación, ni consultores, ni semanas de configuración."
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <ol className="border-t border-border">
            {steps.map((step) => (
              <li
                key={step.n}
                className="grid gap-2 border-b border-border py-7 sm:grid-cols-[4rem_1fr] sm:gap-8"
              >
                <span className="ordinal text-2xl text-accent">{step.n}</span>
                <div>
                  <h3 className="text-xl">{step.title}</h3>
                  <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-fg-muted">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div>
            <p className="label mb-4">Lo que recibe tu cliente</p>
            <WhatsappNote message={sample ?? ""} />
            <p className="mt-4 text-sm leading-relaxed text-fg-subtle">
              Sale de tu propio número, con el texto ya armado. Un toque y listo:
              el cliente recibe el mensaje del contacto que ya conoce.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   FUNCIONES — retícula de filetes, sin tarjetas ni sombras
   ════════════════════════════════════════════════════════════════ */

export function Features({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-rule py-20">
      <Container>
        <SectionHeading
          ordinal="03"
          eyebrow="Alcance"
          title={`Pensado para ${preset.marketing.audience}`}
          description="Todo lo que necesitás para trabajar ordenado. Nada de lo que no vas a usar nunca."
        />

        <div className="mt-12 grid border-t border-l border-border sm:grid-cols-2 lg:grid-cols-3">
          {preset.marketing.features.map((feature, i) => (
            <article
              key={feature.title}
              className="border-b border-r border-border p-7"
            >
              <span className="ordinal text-[0.6875rem] text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg leading-snug">{feature.title}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                {feature.detail}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   CONFIGURABILIDAD
   ════════════════════════════════════════════════════════════════ */

export function Configurable({ preset }: { preset: IndustryPreset }) {
  const fields = preset.customFields.slice(0, 8);

  return (
    <section className="border-b border-rule bg-bg-subtle py-20">
      <Container>
        <SectionHeading
          ordinal="04"
          eyebrow="A tu medida"
          title="Se acomoda a cómo trabajás vos"
          description="Los sistemas genéricos te obligan a cambiar tu forma de trabajar. Este se adapta a la tuya, y lo cambiás vos mismo sin llamar a nadie."
        />

        <dl className="mt-12 border-t border-border">
          <ConfigRow label="Tu recorrido">
            <StatusFlow preset={preset} />
          </ConfigRow>

          {fields.length > 0 && (
            <ConfigRow label="Tus campos">
              <div className="flex flex-wrap gap-2">
                {fields.map((field) => (
                  <span
                    key={field.key}
                    className="border border-border px-2.5 py-1 text-[0.8125rem]"
                  >
                    {field.label}
                  </span>
                ))}
              </div>
            </ConfigRow>
          )}

          <ConfigRow label="Tu vocabulario">
            <p className="text-[0.9375rem]">
              Acá se llama{" "}
              <strong className="font-medium">
                {preset.vocabulary.jobSingular.toLowerCase()}
              </strong>
              {preset.vocabulary.useAssets && (
                <>
                  {" "}y{" "}
                  <strong className="font-medium">
                    {preset.vocabulary.assetSingular.toLowerCase()}
                  </strong>
                </>
              )}
              , no «ticket» ni «entidad».
            </p>
          </ConfigRow>

          <ConfigRow label="Tus documentos">
            <p className="text-[0.9375rem]">
              {preset.documentTemplates.map((t) => t.name).join(" · ")}
            </p>
          </ConfigRow>

          <ConfigRow label="Tus cobros">
            <p className="text-[0.9375rem]">
              {preset.paymentMethods.join(" · ")}
            </p>
          </ConfigRow>
        </dl>
      </Container>
    </section>
  );
}

function ConfigRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b border-border py-6 sm:grid-cols-[10rem_1fr] sm:gap-8">
      <dt className="label pt-1">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PRECIOS — tarifario impreso, no tres tarjetas flotantes
   ════════════════════════════════════════════════════════════════ */

export function Pricing({ compact = false }: { compact?: boolean }) {
  return (
    <section id="precios" className="border-b border-rule py-20">
      <Container>
        <SectionHeading
          ordinal="05"
          eyebrow="Tarifario"
          title="Claro, en dólares, sin letra chica"
          description={`Probás ${site.trialDays} días sin poner tarjeta. Si no te sirve, no pagás nada y te llevás tus datos.`}
        />

        <div className="mt-12 grid border-t border-l border-border lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.code}
              className={cn(
                "flex flex-col border-b border-r border-border p-7",
                plan.highlighted && "bg-surface",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="label text-accent">Más elegido</span>
                )}
              </div>

              <p className="mt-2 min-h-10 text-sm text-fg-muted">
                {plan.tagline}
              </p>

              <p className="ordinal mt-6 text-4xl">
                {formatMoney(plan.priceCents, plan.currency, "en-US")}
                <span className="ml-1.5 font-sans text-sm text-fg-muted">
                  /mes
                </span>
              </p>
              <p className="label mt-2">
                Anual {formatMoney(yearlyCents(plan), plan.currency, "en-US")} ·
                2 meses libres
              </p>

              <Button
                asChild
                className="mt-7 w-full"
                variant={plan.highlighted ? "primary" : "outline"}
              >
                <Link href={`/registro?plan=${plan.code}`}>Empezar</Link>
              </Button>

              <ul className="mt-7 space-y-2.5 border-t border-border pt-6">
                {(compact ? plan.features.slice(0, 6) : plan.features).map(
                  (feature) => (
                    <li
                      key={feature}
                      className="flex gap-2.5 text-[0.9375rem] leading-snug"
                    >
                      <span className="mt-2 size-1 shrink-0 bg-accent" aria-hidden />
                      <span className="text-fg-muted">{feature}</span>
                    </li>
                  ),
                )}
              </ul>

              <p className="label mt-auto pt-6">
                {isUnlimited(plan.maxUsers)
                  ? "Usuarios ilimitados"
                  : `${plan.maxUsers} usuarios`}{" "}
                ·{" "}
                {isUnlimited(plan.maxJobsMonth)
                  ? "sin tope mensual"
                  : `${plan.maxJobsMonth}/mes`}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-[0.9375rem] leading-relaxed text-fg-muted">
          Aceptamos transferencia, pago móvil, Zelle y USDT. Si sos de los
          primeros clientes, te queda un{" "}
          <strong className="font-medium text-fg">
            40% de descuento de por vida
          </strong>
          .
        </p>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   PREGUNTAS
   ════════════════════════════════════════════════════════════════ */

export function Faq({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-rule bg-bg-subtle py-20">
      <Container>
        <SectionHeading ordinal="06" eyebrow="Consultas" title="Lo que suelen preguntar" />

        <div className="mt-12 border-t border-border">
          {preset.marketing.faq.map((item, i) => (
            <details key={i} className="group border-b border-border py-5">
              <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_1fr_1.5rem] items-baseline gap-3 text-lg">
                <span className="ordinal text-[0.6875rem] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item.q}</span>
                <span
                  className="justify-self-end text-fg-subtle transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-2xl pl-[3.25rem] text-[0.9375rem] leading-relaxed text-fg-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   CIERRE
   ════════════════════════════════════════════════════════════════ */

export function FinalCta({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-rule py-20">
      <Container>
        <div className="grid gap-10 border border-rule p-8 sm:p-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <span className="label">Última sección</span>
            <h2 className="mt-4 max-w-xl text-3xl sm:text-[2.5rem]">
              Probalo con tus propios datos.{" "}
              <em className="not-italic text-accent">
                Si no te sirve, no pagás nada.
              </em>
            </h2>
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-fg-muted">
              {site.trialDays} días completos, sin tarjeta y sin compromiso. Si
              querés, te ayudamos a cargar tus clientes el primer día.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/registro?rubro=${preset.key}`}>
                  Abrir mi cuenta
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href={whatsappLink(`Hola, tengo una consulta sobre ${site.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hablar por WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <span className="stamp rotate-[-7deg] px-6 py-3 text-xl">
              Sin tarjeta
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════
   ÍNDICE DE RUBROS — enlazado interno para SEO, en clave de índice impreso
   ════════════════════════════════════════════════════════════════ */

export function RelatedIndustries({
  current,
  presets,
}: {
  current: string;
  presets: IndustryPreset[];
}) {
  const others = presets.filter((p) => p.key !== current);

  return (
    <section className="py-16">
      <Container>
        <p className="label border-b border-border pb-3">
          También funciona para
        </p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
          {others.map((preset, i) => (
            <li key={preset.key} className="border-b border-border">
              <Link
                href={presetPath(preset)}
                className="flex items-baseline gap-3 py-3.5 transition-colors hover:text-accent"
              >
                <span className="ordinal text-[0.6875rem] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.9375rem]">{preset.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

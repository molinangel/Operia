import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/money";
import { isUnlimited, PLANS, yearlyCents } from "@/lib/plans";
import { type IndustryPreset, presetPath } from "@/lib/presets";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  BoardVisual, IntakeVisual, MessageVisual, PaymentsVisual, QuoteVisual,
} from "./visuals";
import { WorkspaceVisual } from "./workspace-visual";

// ── PORTADA ───────────────────────────────────────────────────────

export function Hero({ preset }: { preset: IndustryPreset }) {
  const m = preset.marketing;

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] vignette"
        aria-hidden
      />

      <Container className="relative pb-24 pt-24 sm:pt-32">
        {/*
          Alineado a la izquierda y SIN botones.

          El hero centrado con píldora arriba, dos botones al medio y línea de
          confianza abajo es el patrón que repiten todas las landings generadas.
          Acá la acción principal vive en la barra superior —donde el visitante
          la busca— y la portada se dedica a decir qué es esto.
        */}
        <h1 className="rise max-w-4xl text-[2.75rem] sm:text-[3.75rem] lg:text-[4.5rem]">
          {m.headline} {m.headlineAccent}
        </h1>

        <div className="rise mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-fg-muted">
            {m.subheadline}
          </p>

          <Link
            href={`/registro?rubro=${preset.key}`}
            className="group inline-flex items-center gap-2 text-[0.9375rem]"
          >
            <span className="text-fg-subtle">Gratis {site.trialDays} días</span>
            <span className="text-fg">
              Empezar
              <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        </div>

        <div className="rise mt-16">
          <WorkspaceVisual preset={preset} />
        </div>
      </Container>
    </section>
  );
}

// ── EL RECORRIDO ──────────────────────────────────────────────────

/**
 * El corazón de la página: las cinco etapas por las que pasa un trabajo, cada
 * una con la pantalla que la resuelve.
 *
 * Es mejor que una grilla de funciones porque cuenta una historia con orden:
 * el visitante reconoce su propio día de trabajo y entiende dónde encaja cada
 * parte del producto.
 */
export function Journey({ preset }: { preset: IndustryPreset }) {
  const message =
    preset.notificationRules[0]?.bodyTemplate
      .replace(/\{\{contact\.name\}\}/g, "María")
      .replace(/\{\{asset\.label\}\}/g, preset.showcase.assets[0]?.label ?? "tu pedido")
      .replace(/\{\{org\.name\}\}/g, "Tu negocio")
      .replace(/\{\{appointment\.time\}\}/g, "10:30")
      .replace(/\{\{[^}]+\}\}/g, "el enlace") ?? "";

  const stages = [
    {
      n: "1.0",
      label: "Entra",
      title: `Cada ${preset.vocabulary.jobSingular.toLowerCase()} con los datos de tu rubro`,
      body: `Lo cargás en veinte segundos: cliente, detalle y listo. Los campos que tu rubro necesita ya están, porque el sistema se configuró solo cuando elegiste «${preset.name}».`,
      visual: <IntakeVisual preset={preset} />,
    },
    {
      n: "2.0",
      label: "Se presupuesta",
      title: "Tu cliente aprueba desde el celular",
      body: "Armás el presupuesto desde tu catálogo, lo mandás por WhatsApp y el cliente lo aprueba con un toque. Vos ves cuándo lo abrió y cuándo respondió.",
      visual: <QuoteVisual preset={preset} />,
    },
    {
      n: "3.0",
      label: "Avanza",
      title: "Todo el trabajo en un tablero",
      body: "Arrastrás y cambia de estado. Todo el equipo ve lo mismo, desde la computadora o el celular, y nadie tiene que preguntar cómo va nada.",
      visual: <BoardVisual preset={preset} />,
      wide: true,
    },
    {
      n: "4.0",
      label: "Se cobra",
      title: "Quién te debe, cuánto y desde cuándo",
      body: "Pagos totales o parciales, en la moneda que cobres, con la tasa del día guardada. La lista de deudores ordenada por antigüedad, lista para reclamar.",
      visual: <PaymentsVisual preset={preset} />,
    },
    {
      n: "5.0",
      label: "Se avisa",
      title: "Los mensajes salen solos",
      body: "«Tu trabajo está listo», el recordatorio del turno, el aviso del presupuesto sin responder. Se envían desde tu propio WhatsApp, sin que los escribas.",
      visual: <MessageVisual preset={preset} message={message} />,
    },
  ];

  return (
    <section id="recorrido" className="border-t border-border py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="stage">El recorrido</p>
          <h2 className="mt-4 text-[2rem] sm:text-[2.5rem]">
            De que entra el trabajo a que lo cobrás
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            Sin planillas, sin cuaderno y sin depender de que alguien se acuerde.
          </p>
        </div>

        <div className="mt-20 space-y-24">
          {stages.map((stage, i) => (
            <div
              key={stage.n}
              className={cn(
                stage.wide
                  ? "space-y-10"
                  : "grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16",
                !stage.wide && i % 2 === 1 && "lg:[&>*:first-child]:order-2",
              )}
            >
              <div className={cn(stage.wide && "max-w-2xl")}>
                <p className="stage">
                  {stage.n} · {stage.label}
                </p>
                <h3 className="mt-3 text-[1.625rem] sm:text-[2rem]">
                  {stage.title}
                </h3>
                <p
                  className={cn(
                    "mt-4 leading-relaxed text-fg-muted",
                    stage.wide ? "max-w-xl" : "max-w-md",
                  )}
                >
                  {stage.body}
                </p>
              </div>

              <div className={cn(stage.wide && "max-w-5xl")}>
                {stage.visual}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── EL PROBLEMA ───────────────────────────────────────────────────

export function PainPoints({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-t border-border py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="stage">El problema</p>
          <h2 className="mt-4 text-[2rem] sm:text-[2.5rem]">
            Si algo de esto te suena, es para vos
          </h2>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {preset.marketing.painPoints.map((pain) => (
            <div key={pain.title} className="bg-bg p-7">
              <h3 className="text-base">{pain.title}</h3>
              <p className="mt-2 leading-relaxed text-fg-muted">{pain.detail}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── FUNCIONES ─────────────────────────────────────────────────────

export function Features({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-t border-border py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="stage">Lo que incluye</p>
          <h2 className="mt-4 text-[2rem] sm:text-[2.5rem]">
            Pensado para {preset.marketing.audience}
          </h2>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {preset.marketing.features.map((feature, i) => (
            <div key={feature.title}>
              <p className="stage">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2.5 text-base">{feature.title}</h3>
              <p className="mt-2 leading-relaxed text-fg-muted">
                {feature.detail}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── A TU MEDIDA ───────────────────────────────────────────────────

export function Configurable({ preset }: { preset: IndustryPreset }) {
  const statuses = preset.statuses.filter((s) => s.kind !== "CANCELLED");

  return (
    <section className="border-t border-border py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="stage">A tu medida</p>
            <h2 className="mt-3 text-[1.625rem] sm:text-[2rem]">
              Se adapta a cómo trabajás vos
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-fg-muted">
              La mayoría de los sistemas te obliga a cambiar tu forma de
              trabajar. Este se acomoda a la tuya, y lo configurás vos mismo sin
              llamar a nadie.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                `Acá el trabajo se llama ${preset.vocabulary.jobSingular.toLowerCase()}, no «ticket»`,
                preset.customFields.length > 0
                  ? `Campos propios: ${preset.customFields.slice(0, 3).map((f) => f.label).join(", ")}`
                  : "Agregás los campos que tu rubro necesite",
                `Métodos de cobro: ${preset.paymentMethods.slice(0, 4).join(", ")}`,
                "Documentos con tu logo y tus datos",
              ].map((line) => (
                <li key={line} className="flex gap-3 text-fg-muted">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="rim surface relative overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-[0.8125rem] font-medium">
                Configuración · Estados
              </h3>
            </div>
            <ul className="space-y-1.5 p-3.5">
              {statuses.map((status) => (
                <li
                  key={status.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2"
                >
                  <span className="flex flex-col gap-[3px] text-fg-subtle">
                    <span className="block h-px w-2.5 bg-current" />
                    <span className="block h-px w-2.5 bg-current" />
                    <span className="block h-px w-2.5 bg-current" />
                  </span>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-[0.8125rem]">{status.name}</span>
                </li>
              ))}
              <li className="rounded-lg border border-dashed border-border px-3 py-2 text-[0.8125rem] text-fg-subtle">
                + Agregar estado
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── PRECIOS ───────────────────────────────────────────────────────

export function Pricing({ compact = false }: { compact?: boolean }) {
  return (
    <section id="precios" className="border-t border-border py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="stage">Precios</p>
          <h2 className="mt-4 text-[2rem] sm:text-[2.5rem]">Claro y en dólares</h2>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            Probás {site.trialDays} días sin poner tarjeta. Si no te sirve, no
            pagás nada y te llevás tus datos.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.code}
              className={cn(
                "relative flex flex-col rounded-xl border p-6",
                plan.highlighted
                  ? "rim border-accent-border bg-surface"
                  : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.6875rem] font-medium text-accent">
                    Más elegido
                  </span>
                )}
              </div>

              <p className="mt-1.5 min-h-10 text-[0.8125rem] text-fg-muted">
                {plan.tagline}
              </p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-medium tracking-tight">
                  {formatMoney(plan.priceCents, plan.currency, "en-US").replace(".00", "")}
                </span>
                <span className="text-[0.8125rem] text-fg-subtle">/mes</span>
              </p>
              <p className="mt-1 text-[0.75rem] text-fg-subtle">
                o {formatMoney(yearlyCents(plan), plan.currency, "en-US").replace(".00", "")} al año · 2 meses gratis
              </p>

              <Button
                asChild
                className="mt-6 w-full"
                variant={plan.highlighted ? "primary" : "outline"}
              >
                <Link href={`/registro?plan=${plan.code}`}>Empezar gratis</Link>
              </Button>

              <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                {(compact ? plan.features.slice(0, 6) : plan.features).map(
                  (feature) => (
                    <li
                      key={feature}
                      className="flex gap-2.5 text-[0.8125rem] text-fg-muted"
                    >
                      <span className="mt-[0.5rem] size-1 shrink-0 rounded-full bg-fg-subtle" />
                      {feature}
                    </li>
                  ),
                )}
              </ul>

              <p className="mt-auto pt-5 text-[0.75rem] text-fg-subtle">
                {isUnlimited(plan.maxUsers)
                  ? "Usuarios ilimitados"
                  : `Hasta ${plan.maxUsers} usuarios`}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-xl text-[0.8125rem] text-fg-muted">
          Aceptamos transferencia, pago móvil, Zelle y USDT. Si sos de los
          primeros clientes, te queda un{" "}
          <span className="text-fg">40% de descuento de por vida</span>.
        </p>
      </Container>
    </section>
  );
}

// ── PREGUNTAS ─────────────────────────────────────────────────────

export function Faq({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-t border-border py-24">
      <Container>
        {/*
          Dos columnas: el título queda fijo a la izquierda y las preguntas
          ocupan el resto. Alineado a la izquierda en una sola columna angosta
          dejaba media pantalla vacía en escritorio.
        */}
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="stage">Dudas</p>
            <h2 className="mt-4 text-[2rem] sm:text-[2.5rem]">
              Preguntas frecuentes
            </h2>
            <p className="mt-5 leading-relaxed text-fg-muted">
              Si te queda alguna sin responder, escribinos por WhatsApp y te
              contestamos hoy mismo.
            </p>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {preset.marketing.faq.map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {item.q}
                  <span
                    className="shrink-0 text-fg-subtle transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── CIERRE ────────────────────────────────────────────────────────

export function FinalCta({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="relative overflow-hidden border-t border-border py-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 glow rotate-180" aria-hidden />
      <Container className="relative">
        <div className="max-w-xl">
          <h2 className="text-[2rem] sm:text-[2.75rem]">
            Probalo con tus propios datos
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            {site.trialDays} días completos, sin tarjeta. Si querés, te ayudamos
            a cargar tus clientes el primer día.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/registro?rubro=${preset.key}`}>
                Crear mi cuenta gratis
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
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
      </Container>
    </section>
  );
}

// ── OTROS RUBROS ──────────────────────────────────────────────────

export function RelatedIndustries({
  current,
  presets,
}: {
  current: string;
  presets: IndustryPreset[];
}) {
  const others = presets.filter((p) => p.key !== current);

  return (
    <section className="border-t border-border py-14">
      <Container>
        <p className="text-[0.8125rem] text-fg-subtle">
          También funciona para estos rubros
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {others.map((preset) => (
            <Link
              key={preset.key}
              href={presetPath(preset)}
              className="rounded-full border border-border px-3.5 py-1.5 text-[0.8125rem] text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
            >
              {preset.name}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

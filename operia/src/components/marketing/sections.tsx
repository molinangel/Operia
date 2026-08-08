import Link from "next/link";
import {
  ArrowRight, Bell, Building2, Calendar, Check, ChartNoAxesColumn, Clock,
  Cpu, FileText, Folder, Heart, LayoutGrid, Layers, Link2, MessageCircle,
  Package, Settings, Shield, Smartphone, Users, Wallet, Car, Award, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/money";
import { isUnlimited, PLANS, yearlyCents } from "@/lib/plans";
import { type IndustryPreset, presetPath } from "@/lib/presets";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { AppPreview, MessagePreview } from "./app-preview";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: LayoutGrid, car: Car, file: FileText, message: MessageCircle,
  wallet: Wallet, package: Package, cpu: Cpu, shield: Shield, calendar: Calendar,
  building: Building2, award: Award, users: Users, smartphone: Smartphone,
  heart: Heart, bell: Bell, layers: Layers, chart: ChartNoAxesColumn,
  clock: Clock, folder: Folder, link: Link2, check: Check, settings: Settings,
};

// ── PORTADA ───────────────────────────────────────────────────────

export function Hero({ preset }: { preset: IndustryPreset }) {
  const m = preset.marketing;

  return (
    <section className="border-b border-border">
      <Container className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-in-up eyebrow">{preset.name}</p>

          <h1 className="animate-in-up mt-5 text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem]">
            {m.headline} {m.headlineAccent}
          </h1>

          <p className="animate-in-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">
            {m.subheadline}
          </p>

          <div className="animate-in-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/registro?rubro=${preset.key}`}>
                Empezar gratis
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a
                href={whatsappLink(
                  `Hola, quiero ver ${site.name} para mi negocio.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver una demo
              </a>
            </Button>
          </div>

          <p className="animate-in-up mt-5 text-sm text-fg-subtle">
            {site.trialDays} días gratis · sin tarjeta · listo en 5 minutos
          </p>
        </div>

        <div className="animate-in-up mx-auto mt-16 max-w-5xl">
          <AppPreview preset={preset} />
        </div>
      </Container>
    </section>
  );
}

// ── EL PROBLEMA ───────────────────────────────────────────────────

export function PainPoints({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">El problema</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">
            Si algo de esto te suena, es para vos
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-x-12 gap-y-10 sm:grid-cols-2">
          {preset.marketing.painPoints.map((pain) => (
            <div key={pain.title} className="flex gap-4">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
                <X className="size-3.5" strokeWidth={2.5} />
              </span>
              <div>
                <h3 className="text-base">{pain.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                  {pain.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── CÓMO FUNCIONA ─────────────────────────────────────────────────

export function HowItWorks({ preset }: { preset: IndustryPreset }) {
  const steps = [
    {
      title: "Elegís tu rubro",
      detail: `Marcás «${preset.name}» al registrarte y el sistema queda configurado con tus estados, tus campos y tus documentos.`,
    },
    {
      title: "Cargás tu trabajo del día",
      detail:
        "Cliente, detalle y listo. Aparece en el tablero y lo ve todo el equipo, desde la computadora o el celular.",
    },
    {
      title: "Tu cliente aprueba desde el celular",
      detail:
        "Le mandás el presupuesto por WhatsApp, lo aprueba con un toque y a vos te llega el aviso al instante.",
    },
  ];

  const sample = preset.notificationRules[0]?.bodyTemplate
    .replace(/\{\{contact\.name\}\}/g, "María")
    .replace(/\{\{asset\.label\}\}/g, preset.showcase.assets[0]?.label ?? "tu pedido")
    .replace(/\{\{org\.name\}\}/g, "Tu negocio")
    .replace(/\{\{appointment\.time\}\}/g, "10:30")
    .replace(/\{\{[^}]+\}\}/g, "el enlace");

  return (
    <section id="recorrido" className="border-b border-border bg-bg-subtle py-20 sm:py-24">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">
              Andando en menos de lo que dura un café
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-fg-muted">
              No hay implementación, ni consultores, ni semanas de
              configuración.
            </p>

            <ol className="mt-10 space-y-8">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base">{step.title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <MessagePreview message={sample ?? ""} />
        </div>
      </Container>
    </section>
  );
}

// ── FUNCIONES ─────────────────────────────────────────────────────

export function Features({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-border py-20 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">Lo que incluye</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">
            Pensado para {preset.marketing.audience}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            Todo lo que necesitás para trabajar ordenado. Nada de lo que no vas
            a usar nunca.
          </p>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {preset.marketing.features.map((feature) => {
            const Icon = ICONS[feature.icon] ?? LayoutGrid;
            return (
              <div key={feature.title}>
                <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-accent shadow-[var(--shadow-xs)]">
                  <Icon className="size-4" />
                </span>
                <h3 className="mt-4 text-base">{feature.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                  {feature.detail}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

// ── A TU MEDIDA ───────────────────────────────────────────────────

export function Configurable({ preset }: { preset: IndustryPreset }) {
  const statuses = preset.statuses.filter((s) => s.kind !== "CANCELLED");

  return (
    <section className="border-b border-border bg-bg-subtle py-20 sm:py-24">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow">A tu medida</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">
              Se adapta a cómo trabajás vos
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-fg-muted">
              La mayoría de los sistemas te obliga a cambiar tu forma de
              trabajar. Este se acomoda a la tuya, y lo configurás vos mismo sin
              llamar a nadie.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                `Acá el trabajo se llama ${preset.vocabulary.jobSingular.toLowerCase()}, no «ticket»`,
                preset.customFields.length > 0
                  ? `Campos propios: ${preset.customFields.slice(0, 3).map((f) => f.label).join(", ")}`
                  : "Agregás los campos que tu rubro necesite",
                `Métodos de cobro: ${preset.paymentMethods.slice(0, 4).join(", ")}`,
                "Documentos con tu logo y tus datos",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                  <span className="text-[0.9375rem] text-fg-muted">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <h3 className="text-sm">Configuración · Estados</h3>
            </div>
            <ul className="space-y-2 p-4">
              {statuses.map((status) => (
                <li
                  key={status.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-bg-subtle px-3.5 py-2.5"
                >
                  <span className="flex flex-col gap-[3px] text-fg-subtle">
                    <span className="block h-px w-3 bg-current" />
                    <span className="block h-px w-3 bg-current" />
                    <span className="block h-px w-3 bg-current" />
                  </span>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm">{status.name}</span>
                </li>
              ))}
              <li>
                <div className="rounded-lg border border-dashed border-border px-3.5 py-2.5 text-sm text-fg-subtle">
                  + Agregar estado
                </div>
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
    <section id="precios" className="border-b border-border py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Precios</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">Claro y en dólares</h2>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            Probás {site.trialDays} días sin poner tarjeta. Si no te sirve, no
            pagás nada y te llevás tus datos.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.code}
              className={cn(
                "relative flex flex-col rounded-xl border bg-surface p-7",
                plan.highlighted
                  ? "border-accent shadow-[var(--shadow-md)]"
                  : "border-border shadow-[var(--shadow-xs)]",
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-fg">
                  El más elegido
                </span>
              )}

              <h3 className="text-lg">{plan.name}</h3>
              <p className="mt-1.5 min-h-10 text-sm text-fg-muted">
                {plan.tagline}
              </p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight">
                  {formatMoney(plan.priceCents, plan.currency, "en-US").replace(
                    ".00",
                    "",
                  )}
                </span>
                <span className="text-sm text-fg-muted">/mes</span>
              </p>
              <p className="mt-1.5 text-xs text-fg-subtle">
                o{" "}
                {formatMoney(yearlyCents(plan), plan.currency, "en-US").replace(
                  ".00",
                  "",
                )}{" "}
                al año · 2 meses gratis
              </p>

              <Button
                asChild
                className="mt-6 w-full"
                variant={plan.highlighted ? "primary" : "outline"}
              >
                <Link href={`/registro?plan=${plan.code}`}>Empezar gratis</Link>
              </Button>

              <ul className="mt-7 space-y-2.5 border-t border-border pt-6">
                {(compact ? plan.features.slice(0, 6) : plan.features).map(
                  (feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-accent"
                        strokeWidth={2.5}
                      />
                      <span className="text-fg-muted">{feature}</span>
                    </li>
                  ),
                )}
              </ul>

              <p className="mt-auto pt-6 text-xs text-fg-subtle">
                {isUnlimited(plan.maxUsers)
                  ? "Usuarios ilimitados"
                  : `Hasta ${plan.maxUsers} usuarios`}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-fg-muted">
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

// ── PREGUNTAS ─────────────────────────────────────────────────────

export function Faq({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-border bg-bg-subtle py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="eyebrow">Dudas</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Preguntas frecuentes</h2>
          </div>

          <div className="mt-12 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {preset.marketing.faq.map((item, i) => (
              <details key={i} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
                  {item.q}
                  <span
                    className="shrink-0 text-fg-subtle transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
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
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl">
            Probalo con tus propios datos
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            {site.trialDays} días completos, sin tarjeta y sin compromiso. Si
            querés, te ayudamos a cargar tus clientes el primer día.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/registro?rubro=${preset.key}`}>
                Crear mi cuenta gratis
                <ArrowRight />
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
        <p className="text-center text-sm text-fg-muted">
          También funciona para estos rubros
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {others.map((preset) => (
            <Link
              key={preset.key}
              href={presetPath(preset)}
              className="rounded-full border border-border px-4 py-2 text-sm text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
            >
              {preset.name}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

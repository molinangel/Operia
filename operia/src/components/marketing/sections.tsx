import Link from "next/link";
import {
  Award, Bell, Building2, Calendar, Car, Check, CheckCircle2, ChartNoAxesColumn,
  Clock, Cpu, FileText, Folder, Heart, Layers, LayoutGrid, Link2, MessageCircle,
  Package, Settings, Shield, Smartphone, Users, Wallet, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, Container, SectionHeading } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/money";
import { isUnlimited, PLANS, yearlyCents } from "@/lib/plans";
import type { IndustryPreset } from "@/lib/presets";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { KanbanPreview, WhatsappPreview } from "./kanban-preview";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: LayoutGrid, car: Car, file: FileText, message: MessageCircle,
  wallet: Wallet, package: Package, cpu: Cpu, shield: Shield, calendar: Calendar,
  building: Building2, award: Award, users: Users, smartphone: Smartphone,
  heart: Heart, bell: Bell, layers: Layers, chart: ChartNoAxesColumn,
  clock: Clock, folder: Folder, link: Link2, check: CheckCircle2,
  settings: Settings,
};

// ── HERO ──────────────────────────────────────────────────────────

export function Hero({ preset }: { preset: IndustryPreset }) {
  const m = preset.marketing;
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.55]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] glow opacity-70" aria-hidden />

      <Container className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="accent" className="mb-6">
            <span className="size-1.5 rounded-full bg-accent" />
            Prueba gratis {site.trialDays} días · sin tarjeta
          </Badge>

          <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-5xl md:text-6xl">
            {m.headline}{" "}
            <span className="relative whitespace-nowrap text-accent">
              {m.headlineAccent}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted sm:text-xl">
            {m.subheadline}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/registro?rubro=${preset.key}`}>
                Empezar gratis ahora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a
                href={whatsappLink(
                  `Hola, quiero ver una demo de ${site.name} para mi negocio.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver una demo por WhatsApp
              </a>
            </Button>
          </div>

          <p className="mt-5 text-sm text-fg-subtle">
            Sin tarjeta · sin instalación · listo en 5 minutos
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl animate-rise">
          <KanbanPreview preset={preset} />
        </div>
      </Container>
    </section>
  );
}

// ── DOLORES ───────────────────────────────────────────────────────

export function PainPoints({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-border py-20">
      <Container>
        <SectionHeading
          eyebrow="El problema"
          title="Si algo de esto te suena, es para vos"
          description="No hace falta que nos creas: fijate cuántas de estas te pasaron esta semana."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {preset.marketing.painPoints.map((p) => (
            <Card key={p.title} className="p-6">
              <div className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
                  <X className="size-3.5" strokeWidth={3} />
                </span>
                <div>
                  <h3 className="font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                    {p.detail}
                  </p>
                </div>
              </div>
            </Card>
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
      n: "01",
      title: "Elegís tu rubro",
      detail: `Al registrarte marcás "${preset.name}" y el sistema queda configurado con tus estados, tus campos y tu vocabulario. Sin configurar nada a mano.`,
    },
    {
      n: "02",
      title: `Cargás tu primer ${preset.vocabulary.jobSingular.toLowerCase()}`,
      detail: "Cliente, detalle y listo. Aparece en el tablero y todo el equipo lo ve al instante desde la computadora o el celular.",
    },
    {
      n: "03",
      title: "Tu cliente aprueba desde el celular",
      detail: "Generás el presupuesto, lo mandás por WhatsApp y el cliente toca Aprobar. A vos te llega el aviso en el momento.",
    },
  ];

  return (
    <section id="como-funciona" className="border-b border-border bg-bg-subtle py-20">
      <Container>
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Andando en menos de lo que dura un café"
          description="No hay implementación, ni consultores, ni semanas de configuración."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <ol className="space-y-3">
            {steps.map((s) => (
              <li key={s.n}>
                <Card className="flex gap-4 p-6">
                  <span className="font-display text-2xl font-bold text-accent/40">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                      {s.detail}
                    </p>
                  </div>
                </Card>
              </li>
            ))}
          </ol>

          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-8">
            <p className="text-center text-sm font-medium text-fg-muted">
              Lo que recibe tu cliente en el celular
            </p>
            <WhatsappPreview
              message={
                preset.notificationRules[0]?.bodyTemplate
                  .replace(/\{\{contact\.name\}\}/g, "María")
                  .replace(/\{\{asset\.label\}\}/g, preset.showcase.assets[0]?.label ?? "tu pedido")
                  .replace(/\{\{org\.name\}\}/g, "Tu negocio")
                  .replace(/\{\{appointment\.time\}\}/g, "10:30")
                  .replace(/\{\{[^}]+\}\}/g, "…") ?? ""
              }
            />
            <p className="max-w-xs text-center text-xs leading-relaxed text-fg-subtle">
              Sale de tu propio número de WhatsApp, con el texto ya armado. Un
              toque y listo.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── FUNCIONES ─────────────────────────────────────────────────────

export function Features({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-border py-20">
      <Container>
        <SectionHeading
          eyebrow="Lo que hace"
          title={`Pensado para ${preset.marketing.audience}`}
          description="Todo lo que necesitás para trabajar ordenado. Nada de lo que no vas a usar nunca."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {preset.marketing.features.map((f) => {
            const Icon = ICONS[f.icon] ?? LayoutGrid;
            return (
              <Card
                key={f.title}
                className="group p-6 transition hover:border-border-strong hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {f.detail}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

// ── CONFIGURABILIDAD ──────────────────────────────────────────────

export function Configurable({ preset }: { preset: IndustryPreset }) {
  const fields = preset.customFields.slice(0, 6);
  return (
    <section className="border-b border-border bg-bg-subtle py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="A tu medida"
              title="Se adapta a cómo trabajás vos"
              description="La mayoría de los sistemas te obligan a cambiar tu forma de trabajar. Este se acomoda a la tuya, y lo cambiás vos mismo sin llamar a nadie."
            />
            <ul className="mt-8 space-y-3">
              {[
                `Tus estados: ${preset.statuses.slice(0, 3).map((s) => s.name).join(" → ")} → …`,
                `Tus campos: ${fields.slice(0, 3).map((f) => f.label).join(", ") || "los que necesites"}`,
                `Tu vocabulario: acá se llama "${preset.vocabulary.jobSingular}", no "ticket"`,
                "Tus documentos: con tu logo, tus datos y tu texto",
                "Tus métodos de pago: los que uses en tu país",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span className="text-fg-muted">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-3 text-sm font-semibold">
              Configuración · Estados
            </div>
            <div className="space-y-2 p-5">
              {preset.statuses.slice(0, 6).map((s, i) => (
                <div
                  key={s.name}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5",
                    i === 1 && "ring-2 ring-accent/30",
                  )}
                >
                  <span className="flex flex-col gap-0.5 text-fg-subtle">
                    <span className="block h-0.5 w-3 rounded bg-current" />
                    <span className="block h-0.5 w-3 rounded bg-current" />
                  </span>
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm font-medium">{s.name}</span>
                  {s.isDefault && (
                    <Badge tone="accent" className="ml-auto">
                      inicial
                    </Badge>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="w-full rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-fg-subtle"
              >
                + Agregar estado
              </button>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}

// ── PRECIOS ───────────────────────────────────────────────────────

export function Pricing({ compact = false }: { compact?: boolean }) {
  return (
    <section id="precios" className="border-b border-border py-20">
      <Container>
        <SectionHeading
          eyebrow="Precios"
          title="Claro, en dólares, sin sorpresas"
          description={`Probás ${site.trialDays} días gratis sin poner tarjeta. Si no te sirve, no pagás nada y te llevás tus datos.`}
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.code}
              className={cn(
                "relative flex flex-col p-7",
                plan.highlighted &&
                  "border-accent/40 shadow-[0_16px_48px_-16px_var(--accent-ring)] lg:-my-3 lg:py-10",
              )}
            >
              {plan.highlighted && (
                <Badge
                  tone="accent"
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 shadow-sm"
                >
                  El más elegido
                </Badge>
              )}

              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              <p className="mt-1.5 min-h-10 text-sm text-fg-muted">
                {plan.tagline}
              </p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-extrabold">
                  {formatMoney(plan.priceCents, plan.currency, "en-US")}
                </span>
                <span className="text-sm text-fg-muted">/mes</span>
              </div>
              <p className="mt-1 text-xs text-fg-subtle">
                o {formatMoney(yearlyCents(plan), plan.currency, "en-US")} al año
                · 2 meses gratis
              </p>

              <Button
                asChild
                className="mt-6 w-full"
                variant={plan.highlighted ? "primary" : "outline"}
              >
                <Link href={`/registro?plan=${plan.code}`}>
                  Empezar gratis
                </Link>
              </Button>

              <ul className="mt-7 space-y-2.5">
                {(compact ? plan.features.slice(0, 6) : plan.features).map(
                  (f) => (
                    <li key={f} className="flex gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      <span className="text-fg-muted">{f}</span>
                    </li>
                  ),
                )}
                {!compact &&
                  plan.notIncluded?.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm opacity-55">
                      <X className="mt-0.5 size-4 shrink-0" />
                      <span className="text-fg-muted line-through">{f}</span>
                    </li>
                  ))}
              </ul>

              <div className="mt-6 border-t border-border pt-4 text-xs text-fg-subtle">
                {isUnlimited(plan.maxUsers)
                  ? "Usuarios ilimitados"
                  : `Hasta ${plan.maxUsers} usuarios`}{" "}
                ·{" "}
                {isUnlimited(plan.maxJobsMonth)
                  ? "trabajos ilimitados"
                  : `${plan.maxJobsMonth} trabajos/mes`}
              </div>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-fg-muted">
          Aceptamos transferencia, pago móvil, Zelle y USDT. Si sos de los
          primeros clientes, te queda un{" "}
          <strong className="text-fg">40% de descuento de por vida</strong>.
        </p>
      </Container>
    </section>
  );
}

// ── PREGUNTAS FRECUENTES ──────────────────────────────────────────

export function Faq({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="border-b border-border bg-bg-subtle py-20">
      <Container>
        <SectionHeading eyebrow="Dudas" title="Preguntas frecuentes" />

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-border rounded-xl border border-border bg-surface">
          {preset.marketing.faq.map((item, i) => (
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
      </Container>
    </section>
  );
}

// ── CIERRE ────────────────────────────────────────────────────────

export function FinalCta({ preset }: { preset: IndustryPreset }) {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 glow opacity-60" aria-hidden />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
          Probalo con tus propios datos.
          <br />
          <span className="text-accent">Si no te sirve, no pagás nada.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-fg-muted">
          {site.trialDays} días completos, sin tarjeta y sin compromiso. Y si
          querés, te ayudamos a cargar tus clientes el primer día.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={`/registro?rubro=${preset.key}`}>
              Crear mi cuenta gratis
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a
              href={whatsappLink(
                `Hola, tengo una consulta sobre ${site.name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hablar por WhatsApp
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}

// ── RUBROS RELACIONADOS (enlazado interno para SEO) ───────────────

export function RelatedIndustries({
  current,
  presets,
}: {
  current: string;
  presets: IndustryPreset[];
}) {
  const others = presets.filter((p) => p.key !== current).slice(0, 6);
  return (
    <section className="border-t border-border py-16">
      <Container>
        <h2 className="text-center text-lg font-semibold text-fg-muted">
          También funciona para estos rubros
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          {others.map((p) => (
            <Link
              key={p.key}
              href={`/software-para-${p.marketing.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm transition hover:border-border-strong hover:bg-surface-2"
            >
              <span>{p.icon}</span>
              {p.name}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

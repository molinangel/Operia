import { formatMoney } from "@/lib/money";
import type { IndustryPreset } from "@/lib/presets";
import { cn } from "@/lib/utils";

/**
 * VISTAS DEL PRODUCTO, UNA POR ETAPA DEL RECORRIDO
 *
 * La página no es una grilla de funciones: recorre lo que le pasa a un trabajo
 * de punta a punta, y cada etapa muestra la pantalla que la resuelve.
 *
 * Todo dibujado en HTML, no son capturas: pesa nada, se ve nítido en cualquier
 * pantalla, acompaña el tema y cambia con cada rubro.
 */

function Frame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rim surface relative overflow-hidden shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Chrome({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span className="size-1.5 rounded-full bg-fg-subtle/50" />
        <h4 className="text-[0.8125rem] font-medium">{title}</h4>
      </div>
      {action && (
        <span className="rounded-md bg-accent px-2.5 py-1 text-[0.6875rem] font-medium text-accent-fg">
          {action}
        </span>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-[0.6875rem] text-fg-subtle">{label}</p>
      <div className="mt-1 rounded-md border border-border bg-surface-2 px-3 py-1.5">
        <p className={cn("truncate text-[0.8125rem]", strong && "font-medium")}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── 1.0 · ENTRA EL TRABAJO ──────────────────────────────────── */

export function IntakeVisual({ preset }: { preset: IndustryPreset }) {
  const fields = preset.customFields
    .filter((f) => f.entity === "JOB")
    .slice(0, 4);
  const job = preset.showcase.jobs[0];

  return (
    <Frame>
      <Chrome
        title={`Nuevo · ${preset.vocabulary.jobSingular}`}
        action="Guardar"
      />
      <div className="space-y-3.5 p-5">
        <Field label="Título" value={job?.title ?? ""} strong />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field
            label="Cliente"
            value={preset.showcase.contacts[0]?.name ?? ""}
          />
          {preset.vocabulary.useAssets ? (
            <Field
              label={preset.vocabulary.assetSingular}
              value={preset.showcase.assets[0]?.label ?? ""}
            />
          ) : (
            <Field label="Prioridad" value="Normal" />
          )}
        </div>

        {fields.length > 0 && (
          <div className="rounded-lg border border-accent-border bg-accent-soft p-3.5">
            <p className="mb-3 text-[0.6875rem] font-medium text-accent">
              Campos propios de tu rubro
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key}>
                  <p className="text-[0.6875rem] text-fg-subtle">
                    {field.label}
                  </p>
                  <div className="mt-1 h-7 rounded-md border border-border bg-surface" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ── 2.0 · EL PRESUPUESTO SE APRUEBA ─────────────────────────── */

export function QuoteVisual({ preset }: { preset: IndustryPreset }) {
  const job = preset.showcase.jobs[0];
  const items = job?.items ?? [];
  const total = items.reduce((s, i) => s + i.quantity * i.priceCents, 0);

  return (
    <div className="relative pb-8 sm:pb-0">
      <Frame>
        <Chrome title="Presupuesto PRE-00017" />
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <p className="text-[0.8125rem] text-fg-muted">
              {preset.showcase.contacts[0]?.name}
            </p>
            <p className="font-mono text-[0.6875rem] text-fg-subtle">
              07 ago 2026
            </p>
          </div>

          <ul className="divide-y divide-border">
            {items.slice(0, 3).map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 py-2.5"
              >
                <span className="truncate text-[0.8125rem]">
                  {item.description}
                </span>
                <span className="shrink-0 font-mono text-[0.8125rem] text-fg-muted">
                  {formatMoney(item.quantity * item.priceCents)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <span className="text-[0.8125rem] text-fg-muted">Total</span>
            <span className="font-mono text-base font-medium">
              {formatMoney(total)}
            </span>
          </div>
        </div>
      </Frame>

      {/* El teléfono del cliente, montado sobre el documento */}
      <div className="rim surface absolute bottom-0 right-0 w-56 overflow-hidden shadow-[var(--shadow-lg)] sm:-bottom-8 sm:-right-6">
        <div className="border-b border-border px-3.5 py-2">
          <p className="text-[0.625rem] text-fg-subtle">Tu cliente · WhatsApp</p>
        </div>
        <div className="p-3.5">
          <p className="text-[0.75rem] leading-relaxed text-fg-muted">
            Te enviamos el presupuesto. Podés verlo y aprobarlo acá.
          </p>
          <div className="mt-3 flex gap-2">
            <span className="flex-1 rounded-md bg-accent py-1.5 text-center text-[0.6875rem] font-medium text-accent-fg">
              Aprobar
            </span>
            <span className="rounded-md border border-border px-3 py-1.5 text-[0.6875rem] text-fg-muted">
              Rechazar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 3.0 · EL TRABAJO AVANZA ─────────────────────────────────── */

export function BoardVisual({
  preset,
  className,
}: {
  preset: IndustryPreset;
  className?: string;
}) {
  const columns = preset.statuses
    .filter((s) => s.kind !== "CANCELLED")
    .slice(0, 4)
    .map((status, index) => ({
      ...status,
      jobs: preset.showcase.jobs.filter((j) => j.statusIndex === index),
    }));

  const contactName = (i: number) =>
    preset.showcase.contacts[i]?.name ?? "Cliente";
  const assetLabel = (i?: number) =>
    typeof i === "number" ? preset.showcase.assets[i]?.label : undefined;

  return (
    <Frame className={className}>
      <div className="flex">
        <aside className="hidden w-40 shrink-0 border-r border-border p-2.5 lg:block">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="flex size-5 items-center justify-center rounded bg-accent text-[0.5625rem] font-semibold text-accent-fg">
              MN
            </span>
            <span className="truncate text-[0.6875rem] font-medium">
              Mi negocio
            </span>
          </div>
          <nav className="mt-3 space-y-px">
            {[
              "Inicio",
              preset.vocabulary.jobPlural,
              "Contactos",
              ...(preset.vocabulary.useAssets
                ? [preset.vocabulary.assetPlural]
                : []),
              "Agenda",
              "Cobros",
            ].map((label, i) => (
              <div
                key={label}
                className={cn(
                  "truncate rounded px-2 py-1.5 text-[0.6875rem]",
                  i === 1
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-fg-muted",
                )}
              >
                {label}
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <Chrome title={preset.vocabulary.jobPlural} action="Nuevo" />
          <div className="grid grid-cols-2 gap-3 p-3.5 lg:grid-cols-4">
            {columns.map((column) => (
              <section key={column.name} className="min-w-0">
                <header className="mb-2 flex items-center gap-1.5">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h5 className="min-w-0 flex-1 truncate text-[0.6875rem] text-fg-muted">
                    {column.name}
                  </h5>
                  <span className="text-[0.6875rem] text-fg-subtle">
                    {column.jobs.length}
                  </span>
                </header>
                <div className="space-y-1.5">
                  {column.jobs.slice(0, 2).map((job, i) => {
                    const total = job.items.reduce(
                      (s, it) => s + it.quantity * it.priceCents,
                      0,
                    );
                    const asset = assetLabel(job.assetIndex);
                    return (
                      <article
                        key={i}
                        className="rounded-lg border border-border bg-surface-2 p-2.5"
                      >
                        <p className="line-clamp-2 text-[0.75rem] font-medium leading-snug">
                          {job.title}
                        </p>
                        <p className="mt-1 truncate text-[0.6875rem] text-fg-subtle">
                          {contactName(job.contactIndex)}
                          {asset && ` · ${asset}`}
                        </p>
                        {total > 0 && (
                          <p className="mt-2 font-mono text-[0.6875rem] text-fg-muted">
                            {formatMoney(total)}
                          </p>
                        )}
                      </article>
                    );
                  })}
                  {column.jobs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border py-5" />
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 4.0 · SE COBRA ──────────────────────────────────────────── */

export function PaymentsVisual({ preset }: { preset: IndustryPreset }) {
  const rows = preset.showcase.contacts.slice(0, 4).map((contact, i) => ({
    name: contact.name,
    cents: [12_500, 6_000, 32_000, 4_500][i] ?? 5_000,
    days: [42, 18, 9, 3][i] ?? 5,
  }));

  const total = rows.reduce((s, r) => s + r.cents, 0);

  return (
    <Frame>
      <Chrome title="Cobros · Quién me debe" />
      <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-4">
        <p className="text-[0.75rem] text-fg-subtle">Total por cobrar</p>
        <p className="font-mono text-xl font-medium">{formatMoney(total)}</p>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center gap-4 px-5 py-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.8125rem]">
                {row.name}
              </span>
              <span className="block text-[0.6875rem] text-fg-subtle">
                hace {row.days} días
              </span>
            </span>
            <span className="shrink-0 font-mono text-[0.8125rem]">
              {formatMoney(row.cents)}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-md border px-2 py-0.5 text-[0.625rem]",
                row.days > 30
                  ? "border-transparent bg-danger-soft text-danger"
                  : "border-border text-fg-muted",
              )}
            >
              {row.days > 30 ? "Vencido" : "Al día"}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/* ── 5.0 · SE AVISA ──────────────────────────────────────────── */

export function MessageVisual({
  preset,
  message,
}: {
  preset: IndustryPreset;
  message: string;
}) {
  const rules = preset.notificationRules.slice(0, 3);

  return (
    <Frame>
      <Chrome title="Avisos automáticos" />
      <ul className="divide-y divide-border">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-center gap-3 px-5 py-3">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                i === 0 ? "bg-accent" : "bg-fg-subtle/40",
              )}
            />
            <span className="min-w-0 flex-1 truncate font-mono text-[0.75rem] text-fg-muted">
              {rule.event}
            </span>
            <span className="shrink-0 text-[0.6875rem] text-fg-subtle">
              {rule.offsetMinutes === 0
                ? "al instante"
                : `${Math.abs(rule.offsetMinutes / 60)} h antes`}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-border bg-surface-2 p-5">
        <p className="mb-2.5 text-[0.6875rem] text-fg-subtle">
          Lo que recibe tu cliente
        </p>
        <div className="rounded-lg border border-border bg-surface p-3.5">
          <p className="text-[0.8125rem] leading-relaxed">{message}</p>
          <p className="mt-2 text-[0.6875rem] text-fg-subtle">
            Entregado · leído 10:24
          </p>
        </div>
      </div>
    </Frame>
  );
}

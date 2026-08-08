import { formatMoney } from "@/lib/money";
import type { IndustryPreset } from "@/lib/presets";
import { cn } from "@/lib/utils";

/**
 * LA VISTA DE LA PORTADA
 *
 * Densa a propósito: barra lateral, detalle del trabajo con su historial y
 * panel de propiedades a la derecha. Una columna de tarjetas sueltas se lee
 * como maqueta; esto se lee como un producto en el que ya hay gente
 * trabajando, que es lo único que convence.
 *
 * Todo el contenido sale del preset del rubro, así que la vista del taller
 * habla de vehículos y la de la veterinaria de pacientes.
 */
export function WorkspaceVisual({ preset }: { preset: IndustryPreset }) {
  const job = preset.showcase.jobs[0];
  const contact = preset.showcase.contacts[job?.contactIndex ?? 0];
  const asset =
    typeof job?.assetIndex === "number"
      ? preset.showcase.assets[job.assetIndex]
      : undefined;
  const status = preset.statuses[1] ?? preset.statuses[0];
  const items = job?.items ?? [];
  const total = items.reduce((s, i) => s + i.quantity * i.priceCents, 0);
  const jobFields = preset.customFields
    .filter((f) => f.entity === "JOB")
    .slice(0, 3);

  const firstName = contact?.name?.split(" ")[0] ?? "Cliente";

  const history: Array<[string, string, string]> = [
    ["Juan", "creó OT-01042", "hace 2 h"],
    ["Juan", `cambió el estado a ${status?.name ?? ""}`, "hace 1 h"],
    ["Sistema", "envió el presupuesto por WhatsApp", "hace 34 min"],
    [firstName, "aprobó el presupuesto", "hace 12 min"],
  ];

  const properties = [
    { k: "Estado", v: status?.name, dot: status?.color },
    { k: "Prioridad", v: "Alta", dot: "var(--warning)" },
    { k: "Responsable", v: "Juan P." },
    { k: "Cliente", v: contact?.name },
    ...(asset
      ? [{ k: preset.vocabulary.assetSingular, v: asset.label }]
      : []),
    { k: "Entrega", v: "9 ago" },
  ];

  return (
    <div className="relative">
      <div className="rim surface relative overflow-hidden shadow-[var(--shadow-lg)]">
        <div className="flex min-h-[27rem]">
          {/* Barra lateral */}
          <aside className="hidden w-48 shrink-0 border-r border-border bg-bg-subtle px-2.5 py-3 md:block">
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
              <span className="flex size-5 items-center justify-center rounded bg-accent text-[0.5625rem] font-semibold text-accent-fg">
                MN
              </span>
              <span className="truncate text-[0.75rem] font-medium">
                Mi negocio
              </span>
            </div>

            <nav className="mt-4 space-y-px">
              {[
                "Inicio",
                preset.vocabulary.jobPlural,
                "Contactos",
                ...(preset.vocabulary.useAssets
                  ? [preset.vocabulary.assetPlural]
                  : []),
                "Agenda",
                "Cobros",
                "Catálogo",
              ].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "truncate rounded-md px-2 py-1.5 text-[0.75rem]",
                    i === 1 ? "bg-surface-2 text-fg" : "text-fg-muted",
                  )}
                >
                  {label}
                </div>
              ))}
            </nav>

            <p className="mt-5 px-2 text-[0.625rem] uppercase tracking-wider text-fg-subtle">
              Estados
            </p>
            <div className="mt-2 space-y-px">
              {preset.statuses.slice(0, 4).map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.75rem] text-fg-muted"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate">{s.name}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Detalle del trabajo */}
          <div className="min-w-0 flex-1 border-r border-border">
            <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
              <span className="font-mono text-[0.6875rem] text-fg-subtle">
                OT-01042
              </span>
              <span className="text-[0.6875rem] text-fg-subtle">·</span>
              <span className="truncate text-[0.75rem] text-fg-muted">
                {preset.vocabulary.jobSingular}
              </span>
            </div>

            <div className="px-5 py-4">
              <h4 className="text-[1.0625rem]">{job?.title}</h4>
              {asset && (
                <p className="mt-1.5 text-[0.8125rem] text-fg-muted">
                  {asset.label}
                  {asset.identifier ? ` · ${asset.identifier}` : ""}
                </p>
              )}

              {jobFields.length > 0 && (
                <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-border py-3">
                  {jobFields.map((field, i) => (
                    <div key={field.key} className="min-w-0">
                      <dt className="truncate text-[0.625rem] uppercase tracking-wider text-fg-subtle">
                        {field.label}
                      </dt>
                      <dd className="mt-0.5 truncate text-[0.75rem]">
                        {["84.500 km", "Reserva", "Ruido metálico"][i] ?? "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <p className="mt-4 text-[0.625rem] uppercase tracking-wider text-fg-subtle">
                Detalle
              </p>
              <ul className="mt-2 divide-y divide-border">
                {items.slice(0, 2).map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4 py-2"
                  >
                    <span className="truncate text-[0.8125rem]">
                      {item.description}
                    </span>
                    <span className="shrink-0 font-mono text-[0.75rem] text-fg-muted">
                      {formatMoney(item.quantity * item.priceCents)}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-4 py-2">
                  <span className="text-[0.8125rem] text-fg-muted">Total</span>
                  <span className="font-mono text-[0.8125rem] font-medium">
                    {formatMoney(total)}
                  </span>
                </li>
              </ul>

              <p className="mt-5 text-[0.625rem] uppercase tracking-wider text-fg-subtle">
                Historial
              </p>
              <ul className="mt-2 space-y-2.5">
                {history.map(([who, what, when], i) => (
                  <li
                    key={i}
                    className="flex items-baseline gap-2 text-[0.75rem]"
                  >
                    <span className="size-1 shrink-0 rounded-full bg-fg-subtle/60" />
                    <span className="font-medium">{who}</span>
                    <span className="min-w-0 flex-1 truncate text-fg-muted">
                      {what}
                    </span>
                    <span className="shrink-0 text-fg-subtle">{when}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Propiedades */}
          <aside className="hidden w-52 shrink-0 px-4 py-3 lg:block">
            <p className="text-[0.625rem] uppercase tracking-wider text-fg-subtle">
              Propiedades
            </p>
            <dl className="mt-3 space-y-3">
              {properties.map((row) => (
                <div key={row.k}>
                  <dt className="text-[0.625rem] uppercase tracking-wider text-fg-subtle">
                    {row.k}
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5">
                    {row.dot && (
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: row.dot }}
                      />
                    )}
                    <span className="truncate text-[0.75rem]">{row.v}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 rounded-md border border-border bg-surface-2 p-2.5">
              <p className="text-[0.625rem] uppercase tracking-wider text-fg-subtle">
                Cobrado
              </p>
              <p className="mt-1 font-mono text-[0.8125rem]">
                {formatMoney(0)} de {formatMoney(total)}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                <div className="h-full w-0 bg-accent" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Ventana flotante: el mensaje que el cliente ya respondió */}
      <div className="rim surface absolute -bottom-5 right-4 hidden w-64 overflow-hidden shadow-[var(--shadow-lg)] sm:block lg:-bottom-8 lg:right-10">
        <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
          <span className="truncate text-[0.6875rem] font-medium">
            {firstName}
          </span>
          <span className="shrink-0 rounded border border-success/30 bg-success-soft px-1.5 py-px text-[0.5625rem] uppercase tracking-wider text-success">
            Aprobado
          </span>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[0.75rem] leading-relaxed text-fg-muted">
            Te enviamos el presupuesto de {asset?.label ?? "tu pedido"}.
          </p>
          <p className="mt-1.5 text-[0.6875rem] text-fg-subtle">
            leído 10:24 · respondido 10:26
          </p>
        </div>
      </div>
    </div>
  );
}

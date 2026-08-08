import { formatMoney } from "@/lib/money";
import type { IndustryPreset } from "@/lib/presets";
import { cn } from "@/lib/utils";

/**
 * Vista del producto.
 *
 * Es la interfaz real dibujada en HTML, no una captura: pesa nada, se ve
 * nítida en cualquier pantalla, acompaña el modo oscuro y cambia con cada
 * rubro. Va sin marco de navegador ni perspectiva — el producto se muestra
 * derecho y limpio, que es lo que transmite seriedad.
 */
export function AppPreview({
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
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      <div className="flex">
        {/* Barra lateral: sin ella la vista previa se lee como una maqueta
            suelta y no como la pantalla de un producto real. */}
        <aside className="hidden w-44 shrink-0 border-r border-border bg-surface-2 p-3 sm:block">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-accent text-[0.625rem] font-semibold text-accent-fg">
              TM
            </span>
            <span className="truncate text-xs font-medium">Mi negocio</span>
          </div>

          <nav className="mt-4 space-y-0.5">
            {[
              { label: "Inicio", active: false },
              { label: preset.vocabulary.jobPlural, active: true },
              { label: "Contactos", active: false },
              ...(preset.vocabulary.useAssets
                ? [{ label: preset.vocabulary.assetPlural, active: false }]
                : []),
              { label: "Agenda", active: false },
              { label: "Cobros", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                  item.active
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-fg-muted",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-sm",
                    item.active ? "bg-accent" : "bg-border-strong",
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Barra superior */}
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold">
                {preset.vocabulary.jobPlural}
              </h3>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">
                {preset.showcase.jobs.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden h-7 w-32 rounded-md border border-border sm:block" />
              <div className="h-7 rounded-md bg-accent px-3 text-xs leading-7 text-accent-fg">
                Nuevo
              </div>
            </div>
          </div>

          {/* Tablero */}
          <div className="grid grid-cols-2 gap-4 bg-bg-subtle p-4 lg:grid-cols-4">
            {columns.map((column) => (
              <section key={column.name} className="min-w-0">
                <header className="mb-2.5 flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h4 className="min-w-0 flex-1 truncate text-xs font-medium text-fg-muted">
                    {column.name}
                  </h4>
                  <span className="text-xs text-fg-subtle">
                    {column.jobs.length}
                  </span>
                </header>

                <div className="space-y-2">
                  {column.jobs.slice(0, 2).map((job, i) => {
                    const total = job.items.reduce(
                      (sum, it) => sum + it.quantity * it.priceCents,
                      0,
                    );
                    const asset = assetLabel(job.assetIndex);

                    return (
                      <article
                        key={i}
                        className="rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-xs)]"
                      >
                        <p className="line-clamp-2 text-[0.8125rem] font-medium leading-snug">
                          {job.title}
                        </p>
                        <p className="mt-1.5 truncate text-xs text-fg-muted">
                          {contactName(job.contactIndex)}
                          {asset && ` · ${asset}`}
                        </p>
                        {total > 0 && (
                          <p className="mt-2.5 font-mono text-xs font-medium">
                            {formatMoney(total)}
                          </p>
                        )}
                      </article>
                    );
                  })}

                  {column.jobs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border py-6" />
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Aviso de WhatsApp, dibujado sobrio y sin imitar la interfaz de la app. */
export function MessagePreview({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <figcaption className="mb-3 flex items-center gap-2 text-xs text-fg-muted">
        <span className="flex size-5 items-center justify-center rounded-full bg-accent-soft text-accent">
          <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.2 1.25-1.97 1.41-.53.11-1.21.2-3.51-.75-2.95-1.22-4.85-4.2-5-4.4-.14-.2-1.19-1.58-1.19-3.02s.75-2.14 1.02-2.44c.27-.29.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.59.83 2.03.9 2.18.07.14.12.31.02.51-.09.2-.14.32-.28.5-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.27.72 1.18 1.54 1.92 1.06.95 1.95 1.24 2.23 1.38.27.14.43.12.59-.07.16-.2.68-.79.86-1.07.18-.27.36-.22.61-.13.24.09 1.55.73 1.82.86.27.14.45.2.51.31.07.11.07.63-.17 1.31Z" />
          </svg>
        </span>
        Mensaje enviado al cliente
      </figcaption>
      <p className="text-sm leading-relaxed">{message}</p>
      <p className="mt-3 text-xs text-fg-subtle">Entregado · 10:24</p>
    </figure>
  );
}

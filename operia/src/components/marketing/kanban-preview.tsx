import { formatMoney } from "@/lib/money";
import type { IndustryPreset } from "@/lib/presets";
import { cn } from "@/lib/utils";

/**
 * Vista previa del producto renderizada en HTML, no una captura.
 *
 * Ventajas sobre una imagen: pesa nada, se ve nítida en cualquier pantalla,
 * se adapta al modo claro/oscuro y cambia sola con cada rubro. Es la pieza
 * que hace que el visitante entienda el producto en tres segundos.
 */
export function KanbanPreview({
  preset,
  className,
}: {
  preset: IndustryPreset;
  className?: string;
}) {
  // Se muestran las primeras 4 columnas con actividad, que es lo que entra bien en pantalla.
  const columns = preset.statuses
    .map((status, index) => ({
      ...status,
      index,
      jobs: preset.showcase.jobs
        .map((job, jobIndex) => ({ ...job, jobIndex }))
        .filter((j) => j.statusIndex === index),
    }))
    .filter((c) => c.kind !== "CANCELLED")
    .slice(0, 4);

  const contactName = (i: number) =>
    preset.showcase.contacts[i]?.name ?? "Cliente";

  const assetLabel = (i?: number) =>
    typeof i === "number" ? preset.showcase.assets[i]?.label : undefined;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      {/* Barra del navegador */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-danger/60" />
          <span className="size-2.5 rounded-full bg-warning/60" />
          <span className="size-2.5 rounded-full bg-success/60" />
        </div>
        <div className="ml-3 flex-1 truncate rounded-md bg-bg px-3 py-1 text-center font-mono text-[11px] text-fg-subtle">
          app.operia.com/mi-negocio/trabajos
        </div>
      </div>

      {/* Cabecera del tablero */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{preset.icon}</span>
          <h3 className="text-sm font-semibold">
            {preset.vocabulary.jobPlural}
          </h3>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-fg-muted">
            {preset.showcase.jobs.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-24 rounded-md border border-border bg-surface-2" />
          <div className="h-6 w-16 rounded-md border border-border bg-surface-2" />
          <div className="h-6 w-6 rounded-md bg-accent" />
        </div>
      </div>

      {/* Columnas */}
      <div className="grid grid-cols-2 gap-3 overflow-hidden bg-bg-subtle p-3 sm:grid-cols-4">
        {columns.map((col) => (
          <div key={col.name} className="min-w-0">
            <div className="mb-2 flex items-center gap-1.5 px-0.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: col.color }}
              />
              <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-fg-muted">
                {col.name}
              </span>
              <span className="ml-auto text-[11px] text-fg-subtle">
                {col.jobs.length}
              </span>
            </div>

            <div className="space-y-2">
              {col.jobs.slice(0, 2).map((job) => {
                const total = job.items.reduce(
                  (sum, it) => sum + it.quantity * it.priceCents,
                  0,
                );
                const asset = assetLabel(job.assetIndex);
                return (
                  <div
                    key={job.jobIndex}
                    className="rounded-lg border border-border bg-surface p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    <p className="line-clamp-2 text-xs font-medium leading-snug">
                      {job.title}
                    </p>
                    <p className="mt-1.5 truncate text-[11px] text-fg-muted">
                      {contactName(job.contactIndex)}
                    </p>
                    {asset && (
                      <p className="truncate text-[11px] text-fg-subtle">
                        {asset}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {/* Numeración correlativa global: si se repitiera entre
                          columnas quedaría a la vista que es una maqueta. */}
                      <span className="font-mono text-[10px] text-fg-subtle">
                        {preset.key.slice(0, 2).toUpperCase()}-
                        {String(job.jobIndex + 1042).padStart(5, "0")}
                      </span>
                      {total > 0 && (
                        <span className="text-[11px] font-semibold">
                          {formatMoney(total)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {col.jobs.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Simulación del mensaje de WhatsApp que recibe el cliente final. */
export function WhatsappPreview({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-xs rounded-2xl border border-border bg-surface p-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-success/15 text-success">
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.2 1.25-1.97 1.41-.53.11-1.21.2-3.51-.75-2.95-1.22-4.85-4.2-5-4.4-.14-.2-1.19-1.58-1.19-3.02s.75-2.14 1.02-2.44c.27-.29.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.59.83 2.03.9 2.18.07.14.12.31.02.51-.09.2-.14.32-.28.5-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.27.72 1.18 1.54 1.92 1.06.95 1.95 1.24 2.23 1.38.27.14.43.12.59-.07.16-.2.68-.79.86-1.07.18-.27.36-.22.61-.13.24.09 1.55.73 1.82.86.27.14.45.2.51.31.07.11.07.63-.17 1.31Z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold">Tu cliente</p>
          <p className="text-[10px] text-fg-subtle">en línea</p>
        </div>
      </div>
      <div className="rounded-xl rounded-tl-sm bg-success-soft p-2.5">
        <p className="text-xs leading-relaxed text-fg">{message}</p>
        <p className="mt-1 text-right text-[10px] text-fg-subtle">
          10:24 ✓✓
        </p>
      </div>
    </div>
  );
}

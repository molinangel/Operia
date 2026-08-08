import { formatMoney } from "@/lib/money";
import type { IndustryPreset } from "@/lib/presets";
import { cn } from "@/lib/utils";

/**
 * La pieza central de la landing: una orden de trabajo dibujada como el papel
 * que reemplaza.
 *
 * No es una captura ni un marco de navegador —eso es el recurso que usa toda
 * landing de SaaS—. Es el documento en sí: filetes, campos rotulados, borde
 * perforado de talonario y un sello de aprobado. Cambia con cada rubro, pesa
 * nada y se ve nítida en cualquier pantalla.
 */
export function WorkOrderSheet({
  preset,
  className,
}: {
  preset: IndustryPreset;
  className?: string;
}) {
  const job = preset.showcase.jobs[0];
  const contact = preset.showcase.contacts[job?.contactIndex ?? 0];
  const asset =
    typeof job?.assetIndex === "number"
      ? preset.showcase.assets[job.assetIndex]
      : undefined;

  const items = job?.items ?? [];
  const total = items.reduce((sum, it) => sum + it.quantity * it.priceCents, 0);
  const status = preset.statuses[2] ?? preset.statuses[0];

  return (
    <div className={cn("relative pb-7", className)}>
      <article className="relative border border-rule bg-surface">
        {/* Borde perforado del talonario */}
        <span
          className="perforated absolute inset-y-0 left-7 w-px"
          aria-hidden
        />

        {/* Cabecera del documento */}
        <header className="flex items-start justify-between gap-4 border-b border-rule px-6 py-4 pl-12">
          <div>
            <p className="label">{preset.vocabulary.jobSingular}</p>
            <p className="ordinal mt-1 text-lg font-medium">OT-01042</p>
          </div>
          <div className="text-right">
            <p className="label">Emitida</p>
            <p className="ordinal mt-1 text-sm">07 · 08 · 26</p>
          </div>
        </header>

        {/* Campos rotulados */}
        <dl className="divide-y divide-border pl-12">
          <Row label="Cliente" value={contact?.name ?? "—"} />
          {asset && (
            <Row
              label={preset.vocabulary.assetSingular}
              value={asset.label}
              hint={asset.identifier ?? undefined}
            />
          )}
          <Row label="Recibido por" value="Mostrador" />
          <div className="flex items-baseline gap-4 px-6 py-3">
            <dt className="label w-28 shrink-0">Estado</dt>
            <dd className="flex items-center gap-2 text-[0.9375rem]">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: status?.color }}
              />
              {status?.name}
            </dd>
          </div>
        </dl>

        {/* Detalle */}
        <table className="w-full border-t border-rule text-[0.9375rem]">
          <thead>
            <tr className="border-b border-border">
              <th className="label px-6 py-2 pl-12 text-left font-normal">
                Concepto
              </th>
              <th className="label px-6 py-2 text-right font-normal">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.slice(0, 3).map((item, i) => (
              <tr key={i}>
                <td className="px-6 py-2.5 pl-12">{item.description}</td>
                <td className="ordinal px-6 py-2.5 text-right">
                  {formatMoney(item.quantity * item.priceCents)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-rule">
              <td className="label px-6 py-3 pl-12">Total</td>
              <td className="ordinal px-6 py-3 text-right text-lg font-medium">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Pie del documento */}
        <footer className="flex items-center justify-between gap-4 border-t border-border px-6 py-3 pl-12">
          <p className="label">Firma del cliente</p>
          <span className="h-px w-32 bg-border-strong" aria-hidden />
        </footer>
      </article>

      {/*
        Sello: el gesto que resume la propuesta de valor. Va montado sobre el
        borde inferior y hacia afuera, nunca encima de un importe — tapar una
        cifra en un documento de dinero es exactamente lo que no hay que hacer.
      */}
      <div className="absolute bottom-0 right-6 flex items-end gap-2 sm:right-10">
        <span className="label pb-1.5 text-accent">10:24</span>
        <span aria-hidden className="stamp rotate-[-6deg] bg-surface px-3 py-1.5 text-sm">
          Aprobado
        </span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline gap-4 px-6 py-3">
      <dt className="label w-28 shrink-0">{label}</dt>
      <dd className="min-w-0 text-[0.9375rem]">
        {value}
        {hint && <span className="ml-2 text-fg-subtle">{hint}</span>}
      </dd>
    </div>
  );
}

/** Tira de estados del rubro, presentada como el recorrido impreso del formulario. */
export function StatusFlow({
  preset,
  className,
}: {
  preset: IndustryPreset;
  className?: string;
}) {
  const statuses = preset.statuses.filter((s) => s.kind !== "CANCELLED");

  return (
    <ol className={cn("flex flex-wrap items-center gap-x-2 gap-y-2", className)}>
      {statuses.map((status, i) => (
        <li key={status.name} className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 border border-border px-2.5 py-1">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-[0.8125rem]">{status.name}</span>
          </span>
          {i < statuses.length - 1 && (
            <span className="text-fg-subtle" aria-hidden>
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Mensaje de WhatsApp, dibujado sobrio para no romper el registro del sitio. */
export function WhatsappNote({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <figure className={cn("border border-rule bg-surface", className)}>
      <figcaption className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="label">WhatsApp · saliente</span>
        <span className="ordinal text-[0.6875rem] text-fg-subtle">10:24</span>
      </figcaption>
      <p className="px-4 py-4 text-[0.9375rem] leading-relaxed">{message}</p>
      <p className="label border-t border-border px-4 py-2 text-success">
        Entregado · leído
      </p>
    </figure>
  );
}

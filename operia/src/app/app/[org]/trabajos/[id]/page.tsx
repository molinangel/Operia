import Link from "next/link";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { JobItems, StatusSelect } from "@/components/app/job-detail-parts";
import { Badge } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/money";
import { whatsappLink } from "@/lib/site";
import { requirePageCtx, vocab } from "@/server/context";
import { customFieldsRepo, productsRepo } from "@/server/repos/contacts";
import { jobsRepo, statusesRepo } from "@/server/repos/jobs";
import { timeline } from "@/server/services/activity";

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Baja",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ org: string; id: string }>;
}) {
  const { org: orgSlug, id } = await params;
  const ctx = await requirePageCtx(orgSlug);
  const v = vocab(ctx.org);

  const job = await jobsRepo.byId(ctx, id);
  const [statuses, catalog, fieldDefs, activity] = await Promise.all([
    statusesRepo.list(ctx),
    productsRepo.list(ctx),
    customFieldsRepo.list(ctx, "JOB"),
    timeline(ctx, "job", id),
  ]);

  const canEdit = ctx.permissions.has("job:write");
  const base = `/app/${orgSlug}`;
  const custom = (job.customFields ?? {}) as Record<string, unknown>;

  const dateFmt = new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeZone: ctx.org.timezone,
  });
  const dateTimeFmt = new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: ctx.org.timezone,
  });

  return (
    <div className="mx-auto max-w-6xl p-5 sm:p-7">
      <Link
        href={`${base}/trabajos`}
        className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        {v.jobs}
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs text-fg-subtle">{job.code}</p>
          <h1 className="mt-1 text-2xl font-bold">{job.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
            <span>Creado el {dateFmt.format(job.createdAt)}</span>
            {job.priority !== "NORMAL" && (
              <Badge tone={job.priority === "URGENT" ? "danger" : "warning"}>
                Prioridad {PRIORITY_LABEL[job.priority].toLowerCase()}
              </Badge>
            )}
            {job.dueAt && (
              <Badge tone={job.dueAt < new Date() ? "danger" : "neutral"}>
                Entrega {dateFmt.format(job.dueAt)}
              </Badge>
            )}
          </div>
        </div>

        <StatusSelect
          orgSlug={orgSlug}
          jobId={job.id}
          statusId={job.statusId}
          statuses={statuses.map((s) => ({
            id: s.id,
            name: s.name,
            color: s.color,
          }))}
          disabled={!canEdit}
        />
      </header>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-5">
          {job.description && (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold">Detalle</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
                {job.description}
              </p>
            </section>
          )}

          {fieldDefs.length > 0 &&
            fieldDefs.some((f) => custom[f.key] !== undefined) && (
              <section className="rounded-xl border border-border bg-surface p-5">
                <h2 className="text-sm font-semibold">Datos de tu rubro</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {fieldDefs
                    .filter((f) => custom[f.key] !== undefined)
                    .map((f) => (
                      <div key={f.key}>
                        <dt className="text-xs text-fg-subtle">{f.label}</dt>
                        <dd className="mt-0.5 text-sm">
                          {String(custom[f.key])}
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>
            )}

          <JobItems
            orgSlug={orgSlug}
            jobId={job.id}
            currency={ctx.org.currency}
            canEdit={canEdit}
            items={job.items.map((item) => ({
              id: item.id,
              description: item.description,
              quantity: String(Number(item.quantity)),
              unitPriceCents: item.unitPriceCents,
              totalCents: item.totalCents,
            }))}
            catalog={catalog.map((p) => ({
              id: p.id,
              name: p.name,
              priceCents: p.priceCents,
            }))}
            totals={{
              subtotalCents: job.subtotalCents,
              taxCents: job.taxCents,
              totalCents: job.totalCents,
              paidCents: job.paidCents,
            }}
          />

          <section className="rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Historial</h2>
            </div>
            {activity.length === 0 ? (
              <p className="px-5 py-6 text-sm text-fg-subtle">
                Todo lo que pase acá va a quedar registrado: cambios de
                estado, notas y documentos.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {activity.map((entry) => (
                  <li key={entry.id} className="flex gap-3 px-5 py-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border-strong" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {entry.userName ?? "Alguien"}
                        </span>{" "}
                        <span className="text-fg-muted">{entry.message}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-fg-subtle">
                        {dateTimeFmt.format(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          {job.contact ? (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold">Cliente</h2>
              <Link
                href={`${base}/contactos/${job.contact.id}`}
                className="mt-2 block font-medium text-accent hover:underline"
              >
                {job.contact.name}
              </Link>
              {job.contact.phone && (
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={`tel:${job.contact.phone}`}
                    className="inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
                  >
                    <Phone className="size-3.5" />
                    {job.contact.phone}
                  </a>
                  <a
                    href={whatsappLink(
                      `Hola ${job.contact.name}, te escribimos de ${ctx.org.name} por ${job.code}.`,
                      job.contact.phone.replace(/\D/g, ""),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-success hover:underline"
                  >
                    <MessageCircle className="size-3.5" />
                    Escribir por WhatsApp
                  </a>
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-xl border border-dashed border-border p-5">
              <p className="text-sm text-fg-subtle">
                Sin cliente asignado.
              </p>
            </section>
          )}

          {job.asset && (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold">{v.asset}</h2>
              <Link
                href={`${base}/activos/${job.asset.id}`}
                className="mt-2 block font-medium text-accent hover:underline"
              >
                {job.asset.label}
              </Link>
              {job.asset.identifier && (
                <p className="mt-1 text-sm text-fg-muted">
                  {job.asset.identifier}
                </p>
              )}
            </section>
          )}

          <section className="rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Pagos</h2>
            </div>
            {job.payments.length === 0 ? (
              <p className="px-5 py-5 text-sm text-fg-subtle">
                Sin pagos registrados.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {job.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <span>
                      <span className="block">{payment.method}</span>
                      <span className="block text-xs text-fg-subtle">
                        {dateFmt.format(payment.paidAt)}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums text-success">
                      {formatMoney(payment.amountCents, payment.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { KanbanBoard } from "@/components/app/kanban-board";
import { NewJobDialog } from "@/components/app/new-job-dialog";
import { Button } from "@/components/ui/button";
import { requirePageCtx, vocab } from "@/server/context";
import { assetsRepo, contactsRepo, customFieldsRepo } from "@/server/repos/contacts";
import { jobsRepo } from "@/server/repos/jobs";

type Props = {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ estado?: string; q?: string; vencidos?: string }>;
};

export default async function JobsPage({ params, searchParams }: Props) {
  const { org: orgSlug } = await params;
  const filters = await searchParams;
  const ctx = await requirePageCtx(orgSlug);
  const v = vocab(ctx.org);

  const [board, contacts, assets, jobFieldDefs] = await Promise.all([
    jobsRepo.board(ctx, {
      statusId: filters.estado,
      search: filters.q,
      overdue: filters.vencidos === "1",
    }),
    contactsRepo.search(ctx, "", 200),
    ctx.org.useAssets ? assetsRepo.list(ctx, undefined, undefined, 200) : [],
    customFieldsRepo.list(ctx, "JOB"),
  ]);

  const canEdit = ctx.permissions.has("job:write");

  const dialog = (
    <NewJobDialog
      orgSlug={orgSlug}
      jobLabel={v.job}
      assetLabel={v.asset}
      useAssets={ctx.org.useAssets}
      statuses={board.statuses.map((s) => ({ id: s.id, name: s.name }))}
      contacts={contacts.map((c) => ({
        id: c.id,
        label: c.name,
        sub: c.phone,
      }))}
      assets={assets.map((a) => ({
        id: a.id,
        label: a.label,
        sub: a.identifier,
      }))}
      customFields={jobFieldDefs.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        options: Array.isArray(f.options) ? (f.options as string[]) : [],
        required: f.required,
      }))}
    />
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        title={v.jobs}
        description={
          board.jobs.length > 0
            ? `${board.jobs.length} en el tablero · arrastrá para cambiar de estado`
            : undefined
        }
        actions={canEdit ? dialog : undefined}
      />

      {board.jobs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-7" />}
          title={`Todavía no cargaste ${v.jobs.toLowerCase()}`}
          description={`Acá vas a ver tu tablero completo: cada ${v.job.toLowerCase()} en su columna, y lo movés arrastrándolo a medida que avanza. Tus estados ya están configurados para tu rubro.`}
          /* Enlace y no otro diálogo: montar el componente dos veces abriría
             dos modales superpuestos al llegar con ?nuevo=1. */
          action={
            canEdit ? (
              <Button asChild>
                <Link href={`/app/${orgSlug}/trabajos?nuevo=1`}>
                  Crear el primero
                </Link>
              </Button>
            ) : undefined
          }
          hint={`Tus columnas: ${board.statuses.slice(0, 4).map((s) => s.name).join(" → ")}${board.statuses.length > 4 ? " → …" : ""}`}
        />
      ) : (
        <KanbanBoard
          orgSlug={orgSlug}
          currency={ctx.org.currency}
          canEdit={canEdit}
          statuses={board.statuses.map((s) => ({
            id: s.id,
            name: s.name,
            color: s.color,
            kind: s.kind,
          }))}
          jobs={board.jobs.map((job) => ({
            id: job.id,
            code: job.code,
            title: job.title,
            statusId: job.statusId,
            priority: job.priority,
            totalCents: job.totalCents,
            paidCents: job.paidCents,
            dueAt: job.dueAt?.toISOString() ?? null,
            contactName: job.contact?.name ?? null,
            assetLabel: job.asset?.label ?? null,
          }))}
        />
      )}
    </div>
  );
}

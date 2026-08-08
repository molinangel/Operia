"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { AlertTriangle, GripVertical } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { moveJobAction } from "@/server/actions/jobs";
import { cn } from "@/lib/utils";

export type BoardStatus = {
  id: string;
  name: string;
  color: string;
  kind: string;
};

export type BoardJob = {
  id: string;
  code: string;
  title: string;
  statusId: string;
  priority: string;
  totalCents: number;
  paidCents: number;
  dueAt: string | null;
  contactName: string | null;
  assetLabel: string | null;
};

/**
 * Tablero Kanban.
 *
 * Es la pantalla que vende el producto en la demo, así que el arrastre tiene que
 * sentirse instantáneo. Por eso el estado se mueve de forma optimista: la tarjeta
 * salta de columna al soltarla y la escritura viaja al servidor en segundo plano.
 * Si el servidor rechaza el cambio, React revierte solo y se avisa del error.
 */
export function KanbanBoard({
  orgSlug,
  statuses,
  jobs,
  currency,
  canEdit,
}: {
  orgSlug: string;
  statuses: BoardStatus[];
  jobs: BoardJob[];
  currency: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dragging, setDragging] = useState<BoardJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [optimisticJobs, moveOptimistic] = useOptimistic(
    jobs,
    (current: BoardJob[], move: { jobId: string; statusId: string }) =>
      current.map((job) =>
        job.id === move.jobId ? { ...job, statusId: move.statusId } : job,
      ),
  );

  const sensors = useSensors(
    // 6 px de tolerancia: sin esto, un clic para abrir la tarjeta se interpreta
    // como arrastre y el usuario no puede entrar al detalle.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byStatus = useMemo(() => {
    const map = new Map<string, BoardJob[]>();
    for (const status of statuses) map.set(status.id, []);
    for (const job of optimisticJobs) {
      map.get(job.statusId)?.push(job);
    }
    return map;
  }, [optimisticJobs, statuses]);

  function onDragStart(event: DragStartEvent) {
    const job = optimisticJobs.find((j) => j.id === event.active.id);
    setDragging(job ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setDragging(null);
    const jobId = String(event.active.id);
    const statusId = event.over ? String(event.over.id) : null;
    if (!statusId) return;

    const job = optimisticJobs.find((j) => j.id === jobId);
    if (!job || job.statusId === statusId) return;

    setError(null);
    startTransition(async () => {
      moveOptimistic({ jobId, statusId });
      const result = await moveJobAction({ orgSlug, jobId, statusId });
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {error && (
        <div className="mx-5 mt-4 rounded-[2px] bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      <DndContext
        /**
         * Sin `id`, dnd-kit genera identificadores incrementales por instancia
         * («DndDescribedBy-0» en el servidor, «DndDescribedBy-2» en el cliente)
         * y React reporta un desajuste de hidratación en cada carga del tablero.
         */
        id="tablero-trabajos"
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto p-5 sm:px-7">
          {statuses.map((status) => (
            <Column
              key={status.id}
              status={status}
              jobs={byStatus.get(status.id) ?? []}
              orgSlug={orgSlug}
              currency={currency}
              canEdit={canEdit}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {dragging && (
            <JobCard
              job={dragging}
              orgSlug={orgSlug}
              currency={currency}
              canEdit={false}
              overlay
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({
  status,
  jobs,
  orgSlug,
  currency,
  canEdit,
}: {
  status: BoardStatus;
  jobs: BoardJob[];
  orgSlug: string;
  currency: string;
  canEdit: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  const total = jobs.reduce((sum, j) => sum + j.totalCents, 0);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2.5 flex items-center gap-2 px-1">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: status.color }}
        />
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
          {status.name}
        </h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">
          {jobs.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-2 rounded-[2px] border border-dashed p-2 transition",
          isOver
            ? "border-accent bg-accent-soft"
            : "border-border bg-bg-subtle",
        )}
      >
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            orgSlug={orgSlug}
            currency={currency}
            canEdit={canEdit}
          />
        ))}

        {jobs.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-fg-subtle">
            {isOver ? "Soltá acá" : "Sin nada por ahora"}
          </p>
        )}
      </div>

      {total > 0 && (
        <p className="mt-2 px-1 text-xs text-fg-subtle">
          {formatMoney(total, currency)}
        </p>
      )}
    </div>
  );
}

const PRIORITY_TONE: Record<string, string> = {
  URGENT: "bg-danger",
  HIGH: "bg-warning",
  NORMAL: "",
  LOW: "",
};

function JobCard({
  job,
  orgSlug,
  currency,
  canEdit,
  overlay,
}: {
  job: BoardJob;
  orgSlug: string;
  currency: string;
  canEdit: boolean;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: job.id,
    disabled: !canEdit || overlay,
  });

  const overdue =
    job.dueAt !== null && new Date(job.dueAt) < new Date();
  const pending = job.totalCents - job.paidCents;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative rounded-xl border border-border bg-surface p-3 transition",
        isDragging && "opacity-30",
        overlay && "rotate-2",
      )}
    >
      {PRIORITY_TONE[job.priority] && (
        <span
          className={cn(
            "absolute inset-y-2 left-0 w-0.5 rounded-full",
            PRIORITY_TONE[job.priority],
          )}
          aria-label={job.priority === "URGENT" ? "Urgente" : "Prioridad alta"}
        />
      )}

      <div className="flex items-start gap-1.5">
        {canEdit && !overlay && (
          <button
            {...attributes}
            {...listeners}
            aria-label="Arrastrar"
            className="-ml-1 mt-0.5 cursor-grab touch-none rounded p-0.5 text-fg-subtle opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" />
          </button>
        )}

        <Link
          href={`/app/${orgSlug}/trabajos/${job.id}`}
          className="min-w-0 flex-1"
        >
          <p className="line-clamp-2 text-sm font-medium leading-snug">
            {job.title}
          </p>

          {(job.contactName || job.assetLabel) && (
            <p className="mt-1.5 truncate text-xs text-fg-muted">
              {job.contactName}
              {job.contactName && job.assetLabel && " · "}
              {job.assetLabel}
            </p>
          )}

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-fg-subtle">
              {job.code}
            </span>
            <span className="flex items-center gap-1.5">
              {overdue && (
                <AlertTriangle className="size-3 text-danger" aria-label="Vencido" />
              )}
              {job.totalCents > 0 && (
                <span
                  className={cn(
                    "text-xs font-semibold",
                    pending > 0 ? "text-fg" : "text-success",
                  )}
                >
                  {formatMoney(job.totalCents, currency)}
                </span>
              )}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

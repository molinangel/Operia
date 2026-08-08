"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, Input, Select } from "@/components/ui/field";
import { formatMoney, toCents } from "@/lib/money";
import { addJobItemAction, moveJobAction, removeJobItemAction } from "@/server/actions/jobs";
import { cn } from "@/lib/utils";

/** Cambio de estado desde el detalle. Refleja el color del estado elegido. */
export function StatusSelect({
  orgSlug,
  jobId,
  statusId,
  statuses,
  disabled,
}: {
  orgSlug: string;
  jobId: string;
  statusId: string;
  statuses: Array<{ id: string; name: string; color: string }>;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(statusId);
  const [error, setError] = useState<string | null>(null);

  const color = statuses.find((s) => s.id === current)?.color ?? "#64748B";

  function onChange(next: string) {
    const previous = current;
    setCurrent(next);
    setError(null);

    startTransition(async () => {
      const result = await moveJobAction({ orgSlug, jobId, statusId: next });
      if (!result.ok) {
        setCurrent(previous);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="relative inline-flex items-center">
        <span
          className="pointer-events-none absolute left-3 size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <Select
          value={current}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || pending}
          className="w-auto min-w-48 pl-8 font-medium"
          aria-label="Estado"
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        {pending && (
          <Loader2 className="ml-2 size-4 animate-spin text-fg-subtle" />
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

export type ItemRow = {
  id: string;
  description: string;
  quantity: string;
  unitPriceCents: number;
  totalCents: number;
};

export type CatalogItem = {
  id: string;
  name: string;
  priceCents: number;
};

/**
 * Ítems del trabajo.
 *
 * Los totales que se muestran vienen del servidor: acá solo se envían las
 * líneas. Si el navegador calculara el total mostrado, cualquier diferencia de
 * redondeo terminaría en una discusión de plata con un cliente.
 */
export function JobItems({
  orgSlug,
  jobId,
  items,
  catalog,
  currency,
  totals,
  canEdit,
}: {
  orgSlug: string;
  jobId: string;
  items: ItemRow[];
  catalog: CatalogItem[];
  currency: string;
  totals: { subtotalCents: number; taxCents: number; totalCents: number; paidCents: number };
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function onAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const el = event.currentTarget;

    startTransition(async () => {
      const result = await addJobItemAction({
        orgSlug,
        jobId,
        description: String(form.get("description") ?? ""),
        quantity: Number(form.get("quantity") ?? 1),
        unitPriceCents: toCents(String(form.get("price") ?? "0")),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      el.reset();
      setAdding(false);
      router.refresh();
    });
  }

  function onRemove(itemId: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeJobItemAction({ orgSlug, jobId, itemId });
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  /** Al elegir del catálogo se completan descripción y precio de una vez. */
  function pickFromCatalog(event: React.ChangeEvent<HTMLSelectElement>) {
    const product = catalog.find((p) => p.id === event.target.value);
    if (!product) return;

    const form = event.currentTarget.form;
    if (!form) return;

    (form.elements.namedItem("description") as HTMLInputElement).value =
      product.name;
    (form.elements.namedItem("price") as HTMLInputElement).value = (
      product.priceCents / 100
    ).toFixed(2);
  }

  const pending_ = totals.totalCents - totals.paidCents;

  return (
    <section className="rounded-[2px] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold">Servicios y repuestos</h2>
        {canEdit && !adding && (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            <Plus />
            Agregar
          </Button>
        )}
      </div>

      {error && (
        <div className="px-5 pt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-subtle">
                <th className="px-5 py-2.5 font-medium">Descripción</th>
                <th className="px-3 py-2.5 text-right font-medium">Cant.</th>
                <th className="px-3 py-2.5 text-right font-medium">Precio</th>
                <th className="px-3 py-2.5 text-right font-medium">Total</th>
                {canEdit && <th className="w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-2.5">{item.description}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatMoney(item.unitPriceCents, currency)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {formatMoney(item.totalCents, currency)}
                  </td>
                  {canEdit && (
                    <td className="pr-3">
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        disabled={pending}
                        aria-label="Quitar"
                        className="rounded p-1.5 text-fg-subtle transition hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adding && (
        <form onSubmit={onAdd} className="space-y-3 border-t border-border p-5">
          {catalog.length > 0 && (
            <Select defaultValue="" onChange={pickFromCatalog} aria-label="Del catálogo">
              <option value="">— Elegir del catálogo —</option>
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatMoney(p.priceCents, currency)}
                </option>
              ))}
            </Select>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_5rem_8rem]">
            <Input
              name="description"
              placeholder="Descripción"
              required
              autoFocus
            />
            <Input
              name="quantity"
              type="number"
              step="any"
              min="0.01"
              defaultValue="1"
              aria-label="Cantidad"
            />
            <Input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              aria-label="Precio unitario"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAdding(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Agregar
            </Button>
          </div>
        </form>
      )}

      {items.length === 0 && !adding && (
        <p className="px-5 py-8 text-center text-sm text-fg-subtle">
          Sin ítems todavía. Agregá los servicios y repuestos para armar el
          presupuesto.
        </p>
      )}

      {items.length > 0 && (
        <dl className="space-y-1.5 border-t border-border bg-surface-2 px-5 py-4 text-sm">
          <Row label="Subtotal" value={formatMoney(totals.subtotalCents, currency)} />
          {totals.taxCents > 0 && (
            <Row label="Impuestos" value={formatMoney(totals.taxCents, currency)} />
          )}
          <Row
            label="Total"
            value={formatMoney(totals.totalCents, currency)}
            strong
          />
          {totals.paidCents > 0 && (
            <>
              <Row
                label="Cobrado"
                value={formatMoney(totals.paidCents, currency)}
                tone="success"
              />
              <Row
                label="Pendiente"
                value={formatMoney(pending_, currency)}
                tone={pending_ > 0 ? "danger" : "success"}
                strong
              />
            </>
          )}
        </dl>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "success" | "danger";
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={cn("text-fg-muted", strong && "font-semibold text-fg")}>
        {label}
      </dt>
      <dd
        className={cn(
          "tabular-nums",
          strong && "font-semibold",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

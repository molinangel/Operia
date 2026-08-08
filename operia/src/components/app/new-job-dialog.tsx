"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogBody, DialogContent, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui/field";
import { createJobAction } from "@/server/actions/jobs";

export type FieldDef = {
  key: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
};

export type OptionItem = { id: string; label: string; sub?: string | null };

/**
 * Alta rápida de trabajo.
 *
 * Solo el título es obligatorio. Todo lo demás se puede completar después desde
 * el detalle. Pedir quince datos en el alta es la forma más segura de que el
 * usuario deje de cargar trabajos a la semana de empezar.
 */
export function NewJobDialog({
  orgSlug,
  jobLabel,
  assetLabel,
  useAssets,
  statuses,
  contacts,
  assets,
  customFields,
}: {
  orgSlug: string;
  jobLabel: string;
  assetLabel: string;
  useAssets: boolean;
  statuses: Array<{ id: string; name: string }>;
  contacts: OptionItem[];
  assets: OptionItem[];
  customFields: FieldDef[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Permite abrir el diálogo desde otras pantallas con ?nuevo=1
  useEffect(() => {
    if (searchParams.get("nuevo") === "1") setOpen(true);
  }, [searchParams]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);

    const custom: Record<string, unknown> = {};
    for (const def of customFields) {
      const value = form.get(`cf_${def.key}`);
      if (value !== null && String(value).trim() !== "") {
        custom[def.key] =
          def.type === "NUMBER" ? Number(value) : String(value).trim();
      }
    }

    const payload = {
      orgSlug,
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? "") || undefined,
      contactId: String(form.get("contactId") ?? "") || undefined,
      assetId: String(form.get("assetId") ?? "") || undefined,
      statusId: String(form.get("statusId") ?? "") || undefined,
      priority: (String(form.get("priority") ?? "NORMAL") || "NORMAL") as
        | "LOW" | "NORMAL" | "HIGH" | "URGENT",
      dueAt: String(form.get("dueAt") ?? "") || undefined,
      customFields: custom,
    };

    startTransition(async () => {
      const result = await createJobAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.push(`/app/${orgSlug}/trabajos/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && searchParams.get("nuevo") === "1") {
          router.replace(`/app/${orgSlug}/trabajos`);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Crear {jobLabel.toLowerCase()}
        </Button>
      </DialogTrigger>

      <DialogContent
        title={`Crear ${jobLabel.toLowerCase()}`}
        description="Con el título alcanza para empezar. El resto lo completás después."
      >
        <form onSubmit={onSubmit}>
          <DialogBody>
            {error && <Alert>{error}</Alert>}

            <Field label="¿De qué se trata?" htmlFor="title" required>
              <Input
                id="title"
                name="title"
                placeholder="Cambio de aceite y revisión general"
                required
                autoFocus
                maxLength={160}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente" htmlFor="contactId">
                <Select id="contactId" name="contactId" defaultValue="">
                  <option value="">— Sin cliente —</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>

              {useAssets && (
                <Field label={assetLabel} htmlFor="assetId">
                  <Select id="assetId" name="assetId" defaultValue="">
                    <option value="">— Ninguno —</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                        {a.sub ? ` · ${a.sub}` : ""}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Estado" htmlFor="statusId">
                <Select id="statusId" name="statusId" defaultValue="">
                  <option value="">— Inicial —</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Prioridad" htmlFor="priority">
                <Select id="priority" name="priority" defaultValue="NORMAL">
                  <option value="LOW">Baja</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </Select>
              </Field>

              <Field label="Entrega" htmlFor="dueAt">
                <Input id="dueAt" name="dueAt" type="date" />
              </Field>
            </div>

            <Field label="Detalle" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Lo que contó el cliente, lo que hay que hacer…"
              />
            </Field>

            {customFields.length > 0 && (
              <div className="space-y-4 rounded-xl border border-border bg-surface-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                  Datos de tu rubro
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {customFields.map((def) => (
                    <Field
                      key={def.key}
                      label={def.label}
                      htmlFor={`cf_${def.key}`}
                      required={def.required}
                    >
                      {def.type === "SELECT" ? (
                        <Select
                          id={`cf_${def.key}`}
                          name={`cf_${def.key}`}
                          defaultValue=""
                        >
                          <option value="">—</option>
                          {def.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Select>
                      ) : def.type === "MULTILINE" ? (
                        <Textarea
                          id={`cf_${def.key}`}
                          name={`cf_${def.key}`}
                          rows={2}
                        />
                      ) : (
                        <Input
                          id={`cf_${def.key}`}
                          name={`cf_${def.key}`}
                          type={
                            def.type === "NUMBER"
                              ? "number"
                              : def.type === "DATE"
                                ? "date"
                                : "text"
                          }
                          step={def.type === "NUMBER" ? "any" : undefined}
                        />
                      )}
                    </Field>
                  ))}
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "Creando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

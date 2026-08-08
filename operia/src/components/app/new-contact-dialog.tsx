"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogBody, DialogContent, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui/field";
import { createContactAction } from "@/server/actions/contacts";
import type { FieldDef } from "./new-job-dialog";

export function NewContactDialog({
  orgSlug,
  customFields,
  label = "Nuevo contacto",
}: {
  orgSlug: string;
  customFields: FieldDef[];
  label?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("nuevo") === "1") setOpen(true);
  }, [searchParams]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setWarning(null);

    const form = new FormData(event.currentTarget);

    const custom: Record<string, unknown> = {};
    for (const def of customFields) {
      const value = form.get(`cf_${def.key}`);
      if (value !== null && String(value).trim() !== "") {
        custom[def.key] =
          def.type === "NUMBER" ? Number(value) : String(value).trim();
      }
    }

    startTransition(async () => {
      const result = await createContactAction({
        orgSlug,
        name: String(form.get("name") ?? ""),
        kind: String(form.get("kind") ?? "PERSON") as "PERSON" | "COMPANY",
        phone: String(form.get("phone") ?? "") || undefined,
        email: String(form.get("email") ?? "") || undefined,
        taxId: String(form.get("taxId") ?? "") || undefined,
        address: String(form.get("address") ?? "") || undefined,
        notes: String(form.get("notes") ?? "") || undefined,
        customFields: custom,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // El duplicado se avisa después de guardar: bloquear sería peor,
      // porque los duplicados legítimos existen y frenarían el trabajo.
      if (result.data.duplicateOf) {
        setWarning(
          `Ojo: ya tenías un contacto parecido («${result.data.duplicateOf}»). Se guardó igual.`,
        );
        router.refresh();
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setWarning(null);
        if (!next && searchParams.get("nuevo") === "1") {
          router.replace(`/app/${orgSlug}/contactos`);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent
        title="Nuevo contacto"
        description="Con el nombre y el teléfono alcanza. Lo demás es opcional."
      >
        <form onSubmit={onSubmit}>
          <DialogBody>
            {error && <Alert>{error}</Alert>}
            {warning && <Alert tone="warning">{warning}</Alert>}

            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Field label="Nombre" htmlFor="name" required>
                <Input
                  id="name"
                  name="name"
                  placeholder="María Rodríguez"
                  required
                  autoFocus
                  maxLength={120}
                />
              </Field>

              <Field label="Tipo" htmlFor="kind">
                <Select id="kind" name="kind" defaultValue="PERSON">
                  <option value="PERSON">Persona</option>
                  <option value="COMPANY">Empresa</option>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Teléfono"
                htmlFor="phone"
                hint="Se guarda en formato internacional para WhatsApp."
              >
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0412 123 4567"
                />
              </Field>

              <Field label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cédula / RIF" htmlFor="taxId">
                <Input id="taxId" name="taxId" />
              </Field>

              <Field label="Dirección" htmlFor="address">
                <Input id="address" name="address" />
              </Field>
            </div>

            {customFields.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {customFields.map((def) => (
                  <Field
                    key={def.key}
                    label={def.label}
                    htmlFor={`cf_${def.key}`}
                    required={def.required}
                  >
                    {def.type === "SELECT" ? (
                      <Select id={`cf_${def.key}`} name={`cf_${def.key}`} defaultValue="">
                        <option value="">—</option>
                        {def.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        id={`cf_${def.key}`}
                        name={`cf_${def.key}`}
                        type={def.type === "NUMBER" ? "number" : "text"}
                      />
                    )}
                  </Field>
                ))}
              </div>
            )}

            <Field label="Notas" htmlFor="notes">
              <Textarea id="notes" name="notes" rows={2} />
            </Field>
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
              Guardar contacto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Select } from "@/components/ui/field";
import type { IndustryPreset } from "@/lib/presets";
import { site } from "@/lib/site";
import { registerAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

/**
 * Registro en dos pasos.
 *
 * El rubro va PRIMERO a propósito: es la pregunta más fácil de contestar y la
 * que hace que el usuario entienda de inmediato que el sistema se adapta a él.
 * Pedir email y contraseña de entrada es la forma más rápida de perderlo.
 */

const CURRENCIES = [
  { code: "USD", label: "Dólar (USD)" },
  { code: "VES", label: "Bolívar (VES)" },
  { code: "COP", label: "Peso colombiano (COP)" },
  { code: "MXN", label: "Peso mexicano (MXN)" },
  { code: "ARS", label: "Peso argentino (ARS)" },
  { code: "CLP", label: "Peso chileno (CLP)" },
  { code: "PEN", label: "Sol (PEN)" },
  { code: "EUR", label: "Euro (EUR)" },
];

const TIMEZONES = [
  { value: "America/Caracas", label: "Venezuela (GMT-4)" },
  { value: "America/Bogota", label: "Colombia · Perú · Ecuador (GMT-5)" },
  { value: "America/Mexico_City", label: "México (GMT-6)" },
  { value: "America/Santiago", label: "Chile (GMT-4/-3)" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina · Uruguay (GMT-3)" },
  { value: "America/Santo_Domingo", label: "Rep. Dominicana · Panamá (GMT-4)" },
  { value: "Europe/Madrid", label: "España (GMT+1/+2)" },
];

export function RegisterForm({
  presets,
  initialIndustry,
}: {
  presets: IndustryPreset[];
  initialIndustry: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<1 | 2>(initialIndustry ? 2 : 1);
  const [industryKey, setIndustryKey] = useState<string | null>(initialIndustry);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const selected = presets.find((p) => p.key === industryKey);

  function choose(key: string) {
    setIndustryKey(key);
    setStep(2);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFields({});

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      orgName: String(form.get("orgName") ?? ""),
      industryKey: industryKey ?? "",
      currency: String(form.get("currency") ?? "USD"),
      timezone: String(form.get("timezone") ?? "America/Caracas"),
    };

    startTransition(async () => {
      const result = await registerAction(payload);
      if (!result.ok) {
        setError(result.error);
        if (result.fields) setFields(result.fields);
        return;
      }
      router.push(`/app/${result.data.slug}`);
      router.refresh();
    });
  }

  // ── Paso 1: rubro ───────────────────────────────────────────────
  if (step === 1) {
    return (
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Paso 1 de 2
        </p>
        <h2 className="mt-2 text-2xl font-bold">¿A qué se dedica tu negocio?</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Con esto configuramos tus estados, tus campos y tus documentos. Después
          podés cambiar todo.
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => choose(preset.key)}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3.5 text-left transition hover:border-accent hover:bg-accent-soft"
            >
              <span className="text-xl leading-none" aria-hidden>
                {preset.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{preset.name}</span>
                <span className="mt-0.5 block text-xs leading-snug text-fg-subtle">
                  {preset.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Paso 2: cuenta ──────────────────────────────────────────────
  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Paso 2 de 2
          </p>
          <h2 className="mt-2 text-2xl font-bold">Creá tu cuenta</h2>
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-fg-muted transition hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          Cambiar rubro
        </button>
      </div>

      {selected && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-accent-soft px-3.5 py-2.5">
          <span className="text-lg leading-none" aria-hidden>
            {selected.icon}
          </span>
          <span className="text-sm">
            Vas a gestionar{" "}
            <strong>{selected.vocabulary.jobPlural.toLowerCase()}</strong>
            {selected.vocabulary.useAssets && (
              <>
                {" "}y <strong>{selected.vocabulary.assetPlural.toLowerCase()}</strong>
              </>
            )}
          </span>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {error && <Alert>{error}</Alert>}

        <Field
          label="Nombre de tu negocio"
          htmlFor="orgName"
          error={fields.orgName}
          required
        >
          <Input
            id="orgName"
            name="orgName"
            placeholder="Taller El Rápido"
            required
            autoFocus
            aria-invalid={Boolean(fields.orgName)}
          />
        </Field>

        <Field label="Tu nombre" htmlFor="name" error={fields.name} required>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Juan Pérez"
            required
            aria-invalid={Boolean(fields.name)}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={fields.email} required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="vos@tunegocio.com"
            required
            aria-invalid={Boolean(fields.email)}
          />
        </Field>

        <Field
          label="Contraseña"
          htmlFor="password"
          hint="Mínimo 8 caracteres."
          error={fields.password}
          required
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="••••••••"
            required
            aria-invalid={Boolean(fields.password)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Moneda" htmlFor="currency">
            <Select id="currency" name="currency" defaultValue="USD">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Zona horaria" htmlFor="timezone">
            <Select id="timezone" name="timezone" defaultValue="America/Caracas">
              {TIMEZONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Button
          type="submit"
          size="lg"
          className={cn("w-full")}
          disabled={pending}
        >
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "Creando tu cuenta…" : "Crear mi cuenta gratis"}
          {!pending && <ArrowRight />}
        </Button>

        <p className="text-center text-xs leading-relaxed text-fg-subtle">
          {site.trialDays} días gratis. No pedimos tarjeta. Al crear la cuenta
          aceptás los términos y la política de privacidad.
        </p>
      </div>
    </form>
  );
}

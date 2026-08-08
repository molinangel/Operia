"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { type IndustryPreset, presetPath } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { AppPreview } from "./app-preview";

/**
 * El visitante elige su rubro y ve el mismo sistema hablando su idioma:
 * cambian los estados, los campos y hasta cómo se llaman las cosas.
 *
 * Es el argumento de venta más fuerte del producto, y acá se demuestra en un
 * clic en lugar de explicarlo en un párrafo.
 */
export function IndustryShowcase({ presets }: { presets: IndustryPreset[] }) {
  const [active, setActive] = useState(presets[0]);

  return (
    <section className="border-b border-border bg-bg-subtle py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Un sistema, tu rubro</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">
            Elegí a qué te dedicás y mirá cómo queda
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            Mismo sistema, configurado distinto. Cambian los estados, los
            campos y los documentos.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Rubros"
          className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2"
        >
          {presets.map((preset) => {
            const selected = active.key === preset.key;
            return (
              <button
                key={preset.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(preset)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <AppPreview preset={active} />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-fg-muted">
              Acá el trabajo se llama{" "}
              <span className="font-medium text-fg">
                {active.vocabulary.jobSingular.toLowerCase()}
              </span>
              {active.customFields.length > 0 && (
                <>
                  {" "}y sus campos son{" "}
                  <span className="font-medium text-fg">
                    {active.customFields.slice(0, 3).map((f) => f.label).join(", ")}
                  </span>
                </>
              )}
              .
            </p>
            <Link
              href={presetPath(active)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              Ver {active.name.toLowerCase()} en detalle
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

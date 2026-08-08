"use client";

import Link from "next/link";
import { useState } from "react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { type IndustryPreset, presetPath } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { StatusFlow, WorkOrderSheet } from "./work-order";

/**
 * El argumento de venta más fuerte, hecho interactivo: el visitante toca su
 * rubro y ve el mismo sistema hablando su idioma.
 *
 * Se presenta como el índice de un expediente —columna de rubros numerada a la
 * izquierda, documento a la derecha—, no como una fila de pestañas con píldoras.
 */
export function IndustryShowcase({ presets }: { presets: IndustryPreset[] }) {
  const [active, setActive] = useState(presets[0]);

  return (
    <section className="border-b border-rule py-20">
      <Container>
        <SectionHeading
          ordinal="00"
          eyebrow="Un sistema, tu rubro"
          title="Elegí a qué te dedicás y mirá cómo queda"
          description="Mismo sistema, configurado distinto. Cambian los estados, los campos, los documentos y hasta cómo se llaman las cosas."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-14">
          {/* Índice de rubros */}
          <div role="tablist" aria-label="Rubros" className="border-t border-border">
            {presets.map((preset, i) => {
              const selected = active.key === preset.key;
              return (
                <button
                  key={preset.key}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(preset)}
                  className={cn(
                    "flex w-full items-baseline gap-3 border-b border-border py-3.5 text-left transition-colors",
                    selected ? "text-accent" : "text-fg-muted hover:text-fg",
                  )}
                >
                  <span className="ordinal text-[0.6875rem]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[0.9375rem]">{preset.name}</span>
                  {selected && (
                    <span className="ordinal text-[0.6875rem]" aria-hidden>
                      ←
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <dl className="mb-8 grid gap-5 border-b border-border pb-8 sm:grid-cols-2">
              <div>
                <dt className="label">Su objeto de trabajo</dt>
                <dd className="mt-1.5 font-display text-xl">
                  {active.vocabulary.jobPlural}
                  {active.vocabulary.useAssets && (
                    <span className="text-fg-subtle">
                      {" "}· {active.vocabulary.assetPlural}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="label">Sus campos propios</dt>
                <dd className="mt-1.5 text-[0.9375rem] text-fg-muted">
                  {active.customFields.length > 0
                    ? active.customFields
                        .slice(0, 4)
                        .map((f) => f.label)
                        .join(" · ")
                    : "Ninguno: este rubro no los necesita"}
                </dd>
              </div>
            </dl>

            <p className="label mb-3">Su recorrido</p>
            <StatusFlow preset={active} className="mb-10" />

            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <WorkOrderSheet preset={active} className="max-w-xl" />
              <Link
                href={presetPath(active)}
                className="label whitespace-nowrap text-accent underline underline-offset-4 hover:decoration-2"
              >
                Ver {active.name.toLowerCase()} en detalle →
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

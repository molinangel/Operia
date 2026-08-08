"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { KanbanPreview } from "./kanban-preview";
import { type IndustryPreset, presetPath } from "@/lib/presets";
import { cn } from "@/lib/utils";

/**
 * El argumento de venta más fuerte del producto, hecho interactivo:
 * el visitante toca su rubro y ve el sistema configurado para él al instante.
 *
 * Comunica en tres segundos lo que un párrafo no logra: "esto se adapta a mí".
 */
export function IndustryShowcase({ presets }: { presets: IndustryPreset[] }) {
  const [active, setActive] = useState(presets[0]);

  return (
    <section className="border-b border-border bg-bg-subtle py-20">
      <Container>
        <SectionHeading
          eyebrow="Un sistema, tu rubro"
          title="Elegí a qué te dedicás y mirá cómo queda"
          description="Mismo sistema, configurado distinto. Los estados, los campos y hasta cómo se llaman las cosas cambian según tu negocio."
        />

        <div
          role="tablist"
          aria-label="Rubros"
          className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2"
        >
          {presets.map((p) => (
            <button
              key={p.key}
              role="tab"
              aria-selected={active.key === p.key}
              onClick={() => setActive(p)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
                active.key === p.key
                  ? "border-accent bg-accent text-accent-fg shadow-sm"
                  : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
              )}
            >
              <span aria-hidden>{p.icon}</span>
              {p.shortName}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:items-start">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none" aria-hidden>
                {active.icon}
              </span>
              <h3 className="font-display text-lg font-bold">{active.name}</h3>
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                  Se llama
                </dt>
                <dd className="mt-1 font-medium">
                  {active.vocabulary.jobPlural}
                  {active.vocabulary.useAssets && (
                    <span className="text-fg-muted">
                      {" "}
                      · {active.vocabulary.assetPlural}
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                  Sus estados
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {active.statuses.slice(0, 5).map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs"
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.name}
                    </span>
                  ))}
                </dd>
              </div>

              {active.customFields.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                    Sus campos propios
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {active.customFields.slice(0, 6).map((f) => (
                      <span
                        key={f.key}
                        className="rounded-md bg-accent-soft px-2 py-0.5 text-xs text-accent"
                      >
                        {f.label}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            <Link
              href={presetPath(active)}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              Ver {active.name.toLowerCase()} en detalle
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <KanbanPreview preset={active} />
        </div>
      </Container>
    </section>
  );
}

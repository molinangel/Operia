"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/theme-toggle";
import { LANDING_PRESETS, presetPath } from "@/lib/presets";
import { site } from "@/lib/site";
import { Logo } from "./logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [rubros, setRubros] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-bg/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label={site.name}>
          <Logo className="h-6 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setRubros(true)}
            onMouseLeave={() => setRubros(false)}
          >
            <button
              type="button"
              aria-expanded={rubros}
              className="label py-2 transition-colors hover:text-fg"
            >
              Por rubro
            </button>

            {rubros && (
              /* Índice ruleado, no un menú de tarjetas con sombra. */
              <div className="absolute left-0 top-full w-[34rem] pt-3">
                <ul className="grid grid-cols-2 border border-rule bg-surface">
                  {LANDING_PRESETS.map((preset, i) => (
                    <li
                      key={preset.key}
                      className="border-b border-border last:border-b-0 even:border-l"
                    >
                      <Link
                        href={presetPath(preset)}
                        className="flex items-baseline gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                      >
                        <span className="ordinal text-[0.6875rem] text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm">{preset.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-fg-subtle">
                            {preset.vocabulary.jobPlural}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link href="/precios" className="label py-2 transition-colors hover:text-fg">
            Precios
          </Link>
          <Link href="/#recorrido" className="label py-2 transition-colors hover:text-fg">
            Cómo funciona
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="label hidden transition-colors hover:text-fg sm:block"
          >
            Entrar
          </Link>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/registro">Probar gratis</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
            className="border border-border p-2 md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-rule bg-surface md:hidden">
          <Container className="py-5">
            <p className="label mb-3">Por rubro</p>
            <ul className="border-t border-border">
              {LANDING_PRESETS.map((preset, i) => (
                <li key={preset.key} className="border-b border-border">
                  <Link
                    href={presetPath(preset)}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-3 py-2.5 text-sm"
                  >
                    <span className="ordinal text-[0.6875rem] text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {preset.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button asChild variant="outline">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/registro">Probar gratis</Link>
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

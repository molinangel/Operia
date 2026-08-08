"use client";

import Link from "next/link";
import { useState } from "react";
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
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <Container className="flex h-14 items-center justify-between gap-6">
        <Link href="/" aria-label={site.name}>
          <Logo className="h-6 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setRubros(true)}
            onMouseLeave={() => setRubros(false)}
          >
            <button
              type="button"
              aria-expanded={rubros}
              className="py-2 text-[0.8125rem] text-fg-muted transition-colors hover:text-fg"
            >
              Por rubro
            </button>

            {rubros && (
              <div className="absolute left-1/2 top-full w-[30rem] -translate-x-1/2 pt-3">
                <ul className="grid grid-cols-2 rounded-xl border border-border bg-surface p-2 shadow-[var(--shadow-lg)]">
                  {LANDING_PRESETS.map((preset) => (
                    <li key={preset.key}>
                      <Link
                        href={presetPath(preset)}
                        className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-2"
                      >
                        <span className="block text-[0.8125rem] font-medium">
                          {preset.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-fg-subtle">
                          {preset.vocabulary.jobPlural}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link
            href="/precios"
            className="py-2 text-[0.8125rem] text-fg-muted transition-colors hover:text-fg"
          >
            Precios
          </Link>
          <Link
            href="/#recorrido"
            className="py-2 text-[0.8125rem] text-fg-muted transition-colors hover:text-fg"
          >
            Cómo funciona
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden text-[0.8125rem] text-fg-muted transition-colors hover:text-fg sm:block"
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
            aria-expanded={open}
            className="flex size-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-border md:hidden"
          >
            <span className="block h-0.5 w-4 bg-fg" />
            <span className="block h-0.5 w-4 bg-fg" />
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <Container className="py-5">
            <ul className="grid grid-cols-2 gap-x-4">
              {LANDING_PRESETS.map((preset) => (
                <li key={preset.key}>
                  <Link
                    href={presetPath(preset)}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-[0.9375rem] text-fg-muted"
                  >
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

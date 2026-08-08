"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/theme-toggle";
import { LANDING_PRESETS, presetPath } from "@/lib/presets";
import { site } from "@/lib/site";
import { Logo } from "./logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [rubrosOpen, setRubrosOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-auto" />
          <span className="sr-only">{site.name}</span>
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => setRubrosOpen(true)}
            onMouseLeave={() => setRubrosOpen(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition hover:text-fg"
              aria-expanded={rubrosOpen}
            >
              Por rubro
              <ChevronDown className="size-3.5" />
            </button>
            {rubrosOpen && (
              <div className="absolute left-1/2 top-full w-[30rem] -translate-x-1/2 pt-2">
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface p-2 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)]">
                  {LANDING_PRESETS.map((p) => (
                    <Link
                      key={p.key}
                      href={presetPath(p)}
                      className="flex items-start gap-2.5 rounded-lg p-2.5 transition hover:bg-surface-2"
                    >
                      <span className="text-lg leading-none">{p.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {p.name}
                        </span>
                        <span className="block truncate text-xs text-fg-subtle">
                          {p.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/precios"
            className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition hover:text-fg"
          >
            Precios
          </Link>
          <Link
            href="/#como-funciona"
            className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition hover:text-fg"
          >
            Cómo funciona
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/registro">Probar gratis</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </Container>

      {/* Navegación móvil */}
      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <Container className="grid gap-1 py-4">
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
              Por rubro
            </p>
            {LANDING_PRESETS.map((p) => (
              <Link
                key={p.key}
                href={presetPath(p)}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
              >
                <span>{p.icon}</span>
                {p.name}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            <Link
              href="/precios"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2 text-sm hover:bg-surface-2"
            >
              Precios
            </Link>
            <div className="mt-2 grid grid-cols-2 gap-2">
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

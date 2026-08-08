import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { LANDING_PRESETS, presetPath } from "@/lib/presets";
import { site } from "@/lib/site";
import { Logo } from "./logo";

export function SiteFooter() {
  const year = 2026;

  return (
    <footer className="mt-auto border-t border-border bg-bg-subtle">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo className="h-7 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">
              El sistema que ordena tu negocio de servicios: trabajos,
              presupuestos, cobros y recordatorios. Configurable para tu rubro.
            </p>
          </div>

          <nav aria-labelledby="f-rubros">
            <h3 id="f-rubros" className="text-sm font-semibold">
              Por rubro
            </h3>
            <ul className="mt-4 space-y-2.5">
              {LANDING_PRESETS.slice(0, 5).map((p) => (
                <li key={p.key}>
                  <Link
                    href={presetPath(p)}
                    className="text-sm text-fg-muted transition hover:text-fg"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="f-mas">
            <h3 id="f-mas" className="text-sm font-semibold">
              Más rubros
            </h3>
            <ul className="mt-4 space-y-2.5">
              {LANDING_PRESETS.slice(5).map((p) => (
                <li key={p.key}>
                  <Link
                    href={presetPath(p)}
                    className="text-sm text-fg-muted transition hover:text-fg"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="f-producto">
            <h3 id="f-producto" className="text-sm font-semibold">
              Producto
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/precios" className="text-sm text-fg-muted transition hover:text-fg">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/registro" className="text-sm text-fg-muted transition hover:text-fg">
                  Probar gratis
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-fg-muted transition hover:text-fg">
                  Entrar
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${site.support.email}`}
                  className="text-sm text-fg-muted transition hover:text-fg"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Hecho para negocios de servicios de
            Latinoamérica.
          </p>
          <div className="flex gap-5">
            <Link href="/terminos" className="transition hover:text-fg">
              Términos
            </Link>
            <Link href="/privacidad" className="transition hover:text-fg">
              Privacidad
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

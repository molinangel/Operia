import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { LANDING_PRESETS, presetPath } from "@/lib/presets";
import { site } from "@/lib/site";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo className="h-6 w-auto" />
            <p className="mt-5 max-w-xs text-[0.8125rem] leading-relaxed text-fg-muted">
              El sistema que ordena tu negocio de servicios: trabajos,
              presupuestos, cobros y recordatorios, configurado para tu rubro.
            </p>
          </div>

          <nav aria-labelledby="pie-rubros">
            <h2 id="pie-rubros" className="text-[0.8125rem] font-medium">
              Por rubro
            </h2>
            <ul className="mt-4 space-y-2.5">
              {LANDING_PRESETS.map((preset) => (
                <li key={preset.key}>
                  <Link
                    href={presetPath(preset)}
                    className="text-[0.8125rem] text-fg-muted transition-colors hover:text-fg"
                  >
                    {preset.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="pie-producto">
            <h2 id="pie-producto" className="text-[0.8125rem] font-medium">
              Producto
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/precios", label: "Precios" },
                { href: "/registro", label: "Probar gratis" },
                { href: "/login", label: "Entrar" },
                { href: "/terminos", label: "Términos" },
                { href: "/privacidad", label: "Privacidad" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.8125rem] text-fg-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.support.email}`}
                  className="text-[0.8125rem] text-fg-muted transition-colors hover:text-fg"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-border pt-6 text-[0.75rem] text-fg-subtle">
          © 2026 {site.name} · Hecho para negocios de servicios de Latinoamérica
        </p>
      </Container>
    </footer>
  );
}

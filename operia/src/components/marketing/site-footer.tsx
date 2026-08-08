import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { LANDING_PRESETS, presetPath } from "@/lib/presets";
import { site } from "@/lib/site";
import { Logo } from "./logo";

/** Pie compuesto como el reverso de un formulario: bloques ruleados y letra chica. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule">
      <Container className="py-14">
        <div className="grid gap-10 border-b border-border pb-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="h-6 w-auto" />
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-fg-muted">
              El sistema que ordena tu negocio de servicios. Trabajos,
              presupuestos, cobros y recordatorios, configurados para tu rubro.
            </p>
            <p className="label mt-6">
              Hecho para Latinoamérica · precios en dólares
            </p>
          </div>

          <nav aria-labelledby="pie-rubros">
            <h2 id="pie-rubros" className="label">
              Por rubro
            </h2>
            <ul className="mt-4 space-y-2.5">
              {LANDING_PRESETS.map((preset) => (
                <li key={preset.key}>
                  <Link
                    href={presetPath(preset)}
                    className="text-[0.9375rem] text-fg-muted transition-colors hover:text-fg"
                  >
                    {preset.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="pie-producto">
            <h2 id="pie-producto" className="label">
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
                    className="text-[0.9375rem] text-fg-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.support.email}`}
                  className="text-[0.9375rem] text-fg-muted transition-colors hover:text-fg"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="label mt-6">
          © 2026 {site.name} · Documento de referencia comercial · Todos los
          derechos reservados
        </p>
      </Container>
    </footer>
  );
}

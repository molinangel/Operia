"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Interruptor de tema.
 *
 * El servidor no sabe qué tema tiene guardado el navegador, así que hasta que el
 * componente monta NO puede depender de `resolvedTheme` para nada que llegue al
 * HTML: ni el icono ni el `aria-label`. Si el texto accesible cambiara entre el
 * render del servidor y el del cliente, React reporta un desajuste de hidratación
 * y deja de reconciliar ese árbol.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      // Etiqueta estable: describe la acción sin revelar el estado actual.
      aria-label="Cambiar entre modo claro y oscuro"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-fg-muted transition hover:bg-surface-2 hover:text-fg"
    >
      {/* Ambos iconos se renderizan; se alterna la visibilidad por CSS para que
          el HTML del servidor y el del cliente sean idénticos. */}
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" aria-hidden />
      )}
    </button>
  );
}

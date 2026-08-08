import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Marca. El isotipo son tres barras que representan las columnas del tablero:
 * el concepto central del producto, dibujado en 20 píxeles.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 28 28"
        fill="none"
        className="h-full w-auto"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="7" fill="var(--accent)" />
        <rect x="6" y="7" width="4.5" height="14" rx="2.25" fill="var(--accent-fg)" opacity="0.55" />
        <rect x="11.75" y="7" width="4.5" height="10" rx="2.25" fill="var(--accent-fg)" opacity="0.8" />
        <rect x="17.5" y="7" width="4.5" height="6" rx="2.25" fill="var(--accent-fg)" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-fg">
        {site.name}
      </span>
    </span>
  );
}

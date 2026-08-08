import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Marca. Tres barras de distinta altura: las columnas del tablero, que es el
 * concepto central del producto. Geométrica y simple, para que se lea bien a
 * 20 píxeles y en blanco y negro.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 24 24" fill="none" className="h-full w-auto" aria-hidden>
        <rect x="2" y="9" width="5" height="11" rx="1.6" fill="currentColor" opacity="0.35" />
        <rect x="9.5" y="5" width="5" height="15" rx="1.6" fill="currentColor" opacity="0.6" />
        <rect x="17" y="2" width="5" height="18" rx="1.6" fill="var(--accent)" />
      </svg>
      <span className="text-[1.0625rem] font-medium tracking-[-0.02em]">
        {site.name}
      </span>
    </span>
  );
}

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Marca. El isotipo es un documento con una esquina doblada y una línea de
 * sello: la orden de trabajo, que es de lo que trata el producto entero.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-full w-auto"
        aria-hidden="true"
      >
        <path
          d="M4 2h11l5 5v15H4V2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M15 2v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7.5 11.5h9M7.5 15h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M7.5 18.5h4.5"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-[1.375rem] font-medium tracking-tight text-fg">
        {site.name}
      </span>
    </span>
  );
}

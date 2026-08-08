import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[76rem] px-5 sm:px-8", className)}
      {...props}
    />
  );
}

/** Etiqueta de campo. El conector tipográfico de todo el sitio. */
export function FieldLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("label", className)} {...props} />;
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "border-border-strong text-fg-muted",
    accent: "border-accent text-accent",
    success: "border-success text-success",
    warning: "border-warning text-warning",
    danger: "border-danger text-danger",
    info: "border-info text-info",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.1em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[2px] border border-border bg-surface", className)}
      {...props}
    />
  );
}

/**
 * Cabecera de sección con numeral, como el encabezado de un apartado del
 * formulario. Alineada a la izquierda: el centrado es lo que hace que todas
 * las landings se parezcan entre sí.
 */
export function SectionHeading({
  ordinal,
  eyebrow,
  title,
  description,
  className,
}: {
  ordinal?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-rule pt-5", className)}>
      <div className="flex items-baseline gap-4">
        {ordinal && (
          <span className="ordinal text-sm text-accent">{ordinal}</span>
        )}
        {eyebrow && <span className="label">{eyebrow}</span>}
      </div>
      <h2 className="mt-5 max-w-3xl text-3xl sm:text-[2.75rem]">{title}</h2>
      {description && (
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-fg-muted">
          {description}
        </p>
      )}
    </div>
  );
}

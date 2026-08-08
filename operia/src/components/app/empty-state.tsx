import { cn } from "@/lib/utils";

/**
 * Estado vacío.
 *
 * Es la primera pantalla que ve todo cliente nuevo, porque el sistema NO carga
 * datos de ejemplo (ver CLAUDE.md §4.7). Por eso no dice "no hay datos" y ya:
 * explica para qué sirve la sección y ofrece la acción concreta para empezar.
 * Cada estado vacío es una oportunidad de activación o de abandono.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  hint,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex size-14 items-center justify-center rounded-[2px] bg-accent-soft text-accent">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
      {hint && (
        <p className="mt-5 text-xs leading-relaxed text-fg-subtle">{hint}</p>
      )}
    </div>
  );
}

/** Tarjeta de métrica del panel de inicio. */
export function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "text-fg",
    accent: "text-accent",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {label}
      </p>
      <p className={cn("mt-2 font-display text-2xl font-bold", tones[tone])}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-fg-muted">{sub}</p>}
    </div>
  );
}

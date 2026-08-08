/**
 * Dinero.
 *
 * REGLA INVIOLABLE: todo importe se guarda como entero en centavos.
 * Nunca float. Un `0.1 + 0.2 !== 0.3` en la cuenta de un cliente destruye
 * la confianza más rápido que cualquier caída del servidor.
 */

/** Redondeo "half up" al centavo. Definido una sola vez, usado en todos lados. */
export function roundCents(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

export function toCents(amount: number | string): number {
  const n = typeof amount === "string" ? parseFloat(amount.replace(",", ".")) : amount;
  if (!Number.isFinite(n)) return 0;
  return roundCents(n * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(
  cents: number,
  currency = "USD",
  locale = "es-VE",
): string {
  const key = `${locale}:${currency}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatters.set(key, fmt);
  }
  return fmt.format(fromCents(cents));
}

/** Formato compacto para tarjetas de métricas: $1,2 K */
export function formatMoneyCompact(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(fromCents(cents));
}

export type LineInput = {
  quantity: number;
  unitPriceCents: number;
  taxRate: number; // porcentaje, ej. 16
  discountPct: number; // porcentaje, ej. 10
};

export type LineTotals = {
  netCents: number;
  taxCents: number;
  totalCents: number;
};

/**
 * Total de una línea. El descuento se aplica antes del impuesto.
 * Documentado en docs/03-modelo-de-datos.md §4.1 — no cambiar sin actualizar el test.
 */
export function computeLine(line: LineInput): LineTotals {
  const gross = line.quantity * line.unitPriceCents;
  const net = roundCents(gross * (1 - line.discountPct / 100));
  const tax = roundCents(net * (line.taxRate / 100));
  return { netCents: net, taxCents: tax, totalCents: net + tax };
}

export type DocTotals = {
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
};

/** Totales de un conjunto de líneas más un descuento global en centavos. */
export function computeTotals(
  lines: LineInput[],
  globalDiscountCents = 0,
): DocTotals {
  let subtotal = 0;
  let tax = 0;
  for (const line of lines) {
    const t = computeLine(line);
    subtotal += t.netCents;
    tax += t.taxCents;
  }
  const total = Math.max(0, subtotal + tax - globalDiscountCents);
  return {
    subtotalCents: subtotal,
    taxCents: tax,
    discountCents: globalDiscountCents,
    totalCents: total,
  };
}

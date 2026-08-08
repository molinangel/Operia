/**
 * Configuración global de marca y contactos.
 *
 * Todo lo que se muestra al público sale de acá. Cambiar el nombre del producto
 * es cambiar una línea: la marca no está escrita en duro en ningún componente.
 */

export const site = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Operia",
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "operia.app",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  tagline: "El sistema que ordena tu negocio de servicios",
  description:
    "Órdenes de trabajo, presupuestos que tu cliente aprueba desde el celular, " +
    "control de cobros y recordatorios por WhatsApp. Configurable para tu rubro. " +
    "Probalo gratis 14 días, sin tarjeta.",

  support: {
    whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hola@operia.app",
  },

  trialDays: 14,
} as const;

export function whatsappLink(message: string, phone = site.support.whatsapp) {
  const text = encodeURIComponent(message);
  return phone ? `https://wa.me/${phone}?text=${text}` : `#`;
}

/** URL absoluta — necesaria para canónicas, Open Graph y datos estructurados. */
export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}

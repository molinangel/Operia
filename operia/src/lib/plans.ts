/**
 * Planes — fuente única para la landing, el registro, los límites y el seed.
 * Precios definidos en docs/07-precios-y-cobro.md
 */

export type PlanDef = {
  code: string;
  name: string;
  tagline: string;
  priceCents: number;
  currency: string;
  maxUsers: number;
  maxJobsMonth: number;
  maxContacts: number;
  maxStorageMb: number;
  highlighted?: boolean;
  features: string[];
  notIncluded?: string[];
};

export const UNLIMITED = 999_999;

export const PLANS: PlanDef[] = [
  {
    code: "starter",
    name: "Inicial",
    tagline: "Para el negocio que recién ordena su operación.",
    priceCents: 1900,
    currency: "USD",
    maxUsers: 3,
    maxJobsMonth: 150,
    maxContacts: 1000,
    maxStorageMb: 2048,
    features: [
      "3 usuarios",
      "150 trabajos por mes",
      "1.000 contactos",
      "Estados y campos personalizados",
      "Presupuestos y documentos en PDF",
      "Portal público para tu cliente",
      "Recordatorios por WhatsApp (enlace)",
      "Control de cobros y deudores",
      "2 GB de archivos",
      "Soporte por email",
    ],
    notIncluded: ["WhatsApp automático", "Reportes completos"],
  },
  {
    code: "pro",
    name: "Profesional",
    tagline: "El plan que elige la mayoría. Sin límites que estorben.",
    priceCents: 3900,
    currency: "USD",
    maxUsers: 10,
    maxJobsMonth: UNLIMITED,
    maxContacts: UNLIMITED,
    maxStorageMb: 20480,
    highlighted: true,
    features: [
      "10 usuarios",
      "Trabajos y contactos ilimitados",
      "Todo lo del plan Inicial",
      "WhatsApp automático (API)",
      "Plantillas de documento ilimitadas",
      "Reportes completos y exportación",
      "Agenda por responsable",
      "20 GB de archivos",
      "Soporte por WhatsApp en 24 h",
      "1 sesión de puesta en marcha",
    ],
  },
  {
    code: "business",
    name: "Negocio",
    tagline: "Para equipos grandes o varias sucursales.",
    priceCents: 7900,
    currency: "USD",
    maxUsers: UNLIMITED,
    maxJobsMonth: UNLIMITED,
    maxContacts: UNLIMITED,
    maxStorageMb: 102400,
    features: [
      "Usuarios ilimitados",
      "Todo lo del plan Profesional",
      "Multi-sucursal",
      "Exportación programada",
      "100 GB de archivos",
      "Soporte prioritario en 4 h",
      "3 sesiones de puesta en marcha",
      "Carga inicial de datos incluida",
    ],
  },
];

export const PLAN_MAP = new Map(PLANS.map((p) => [p.code, p]));

export function getPlan(code: string) {
  return PLAN_MAP.get(code) ?? PLANS[0];
}

/** Precio anual con dos meses bonificados. */
export function yearlyCents(plan: PlanDef) {
  return plan.priceCents * 10;
}

export function isUnlimited(value: number) {
  return value >= UNLIMITED;
}

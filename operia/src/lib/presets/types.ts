/**
 * Presets por rubro — el mecanismo que hace que un producto genérico
 * se sienta hecho a medida.  Ver ../../../docs/06-presets-por-rubro.md
 *
 * REGLA ARQUITECTÓNICA: un preset SOLO escribe datos al crear la organización.
 * Nunca se consulta después. Una vez aplicado, la configuración es del cliente
 * y puede cambiarla toda. Así el código nunca queda acoplado a un rubro.
 */

export type StatusKindKey =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING"
  | "DONE"
  | "CANCELLED";

export type FieldTypeKey =
  | "TEXT"
  | "MULTILINE"
  | "NUMBER"
  | "DATE"
  | "BOOLEAN"
  | "SELECT"
  | "MULTISELECT";

export type FieldEntityKey = "CONTACT" | "ASSET" | "JOB" | "PRODUCT";

export type DocKindKey =
  | "QUOTE"
  | "WORK_ORDER"
  | "RECEIPT"
  | "DELIVERY_NOTE"
  | "CERTIFICATE"
  | "REPORT";

export type PresetStatus = {
  name: string;
  kind: StatusKindKey;
  color: string;
  isDefault?: boolean;
};

export type PresetField = {
  entity: FieldEntityKey;
  key: string;
  label: string;
  type: FieldTypeKey;
  options?: string[];
  required?: boolean;
  showInList?: boolean;
};

export type PresetProduct = {
  name: string;
  kind: "SERVICE" | "GOOD";
  priceCents: number;
};

export type PresetRule = {
  event: string;
  channel: "WHATSAPP" | "EMAIL";
  offsetMinutes: number;
  bodyTemplate: string;
};

export type PresetDocTemplate = {
  kind: DocKindKey;
  name: string;
  title: string;
  footerNote: string;
};

/**
 * Contenido ILUSTRATIVO, exclusivo de la landing pública.
 *
 * NUNCA se escribe en la base de datos ni en la cuenta de un cliente: el sistema
 * no crea datos de ejemplo. Solo alimenta la vista previa del tablero en la web.
 */
export type PresetShowcase = {
  contacts: Array<{ name: string; phone: string; email?: string }>;
  assets: Array<{ label: string; identifier?: string; contactIndex: number }>;
  jobs: Array<{
    title: string;
    statusIndex: number;
    contactIndex: number;
    assetIndex?: number;
    items: Array<{ description: string; quantity: number; priceCents: number }>;
  }>;
};

/** Contenido de la landing específica del rubro — alimenta el SEO programático. */
export type PresetMarketing = {
  /** Segmento de URL: /software-para-{slug} */
  slug: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  audience: string;
  painPoints: Array<{ title: string; detail: string }>;
  features: Array<{ title: string; detail: string; icon: string }>;
  faq: Array<{ q: string; a: string }>;
  keywords: string[];
};

export type IndustryPreset = {
  key: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;

  vocabulary: {
    jobSingular: string;
    jobPlural: string;
    assetSingular: string;
    assetPlural: string;
    useAssets: boolean;
  };

  statuses: PresetStatus[];
  customFields: PresetField[];
  products: PresetProduct[];
  paymentMethods: string[];
  notificationRules: PresetRule[];
  documentTemplates: PresetDocTemplate[];
  showcase: PresetShowcase;
  marketing: PresetMarketing;
};

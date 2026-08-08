import type { IndustryPreset } from "./types";
import { automotriz, servicioTecnico, serviciosCampo } from "./industries/tecnicos";
import { veterinaria, estetica } from "./industries/salud";
import {
  construccion,
  consultoria,
  legal,
  generic,
} from "./industries/profesionales";

export * from "./types";
export { BASE_DOC_HTML } from "./shared";

/**
 * Orden deliberado: los rubros con más dolor y más fáciles de vender primero.
 * Es el orden en que aparecen en el registro y en el menú de la landing.
 */
export const PRESETS: IndustryPreset[] = [
  automotriz,
  servicioTecnico,
  veterinaria,
  serviciosCampo,
  construccion,
  estetica,
  consultoria,
  legal,
  generic,
];

export const PRESET_MAP = new Map(PRESETS.map((p) => [p.key, p]));

/** Devuelve el preset pedido, o el genérico si no existe. Nunca falla. */
export function getPreset(key: string | null | undefined): IndustryPreset {
  return PRESET_MAP.get(key ?? "") ?? generic;
}

/** Rubros que tienen landing propia (todos menos el genérico, que vive en la home). */
export const LANDING_PRESETS = PRESETS.filter((p) => p.key !== "generic");

const SLUG_MAP = new Map(PRESETS.map((p) => [p.marketing.slug, p]));

export function getPresetBySlug(slug: string): IndustryPreset | undefined {
  return SLUG_MAP.get(slug);
}

/** Prefijo de las URLs de rubro. Elegido por SEO: es la búsqueda literal del cliente. */
export const RUBRO_PREFIX = "software-para-";

export function presetPath(preset: IndustryPreset) {
  return `/${RUBRO_PREFIX}${preset.marketing.slug}`;
}

/** Resuelve el preset desde el segmento completo de la URL. */
export function getPresetByRubroParam(param: string): IndustryPreset | undefined {
  if (!param.startsWith(RUBRO_PREFIX)) return undefined;
  return SLUG_MAP.get(param.slice(RUBRO_PREFIX.length));
}

/** Parámetros conocidos — alimenta generateStaticParams y el sitemap. */
export const RUBRO_PARAMS = LANDING_PRESETS.map(
  (p) => `${RUBRO_PREFIX}${p.marketing.slug}`,
);

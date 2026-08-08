import type { PresetDocTemplate, PresetRule, PresetStatus } from "./types";

/** Paleta de estados — colores consistentes en todos los rubros. */
export const STATUS_COLORS = {
  slate: "#64748B",
  sky: "#0EA5E9",
  amber: "#F59E0B",
  violet: "#8B5CF6",
  red: "#EF4444",
  blue: "#3B82F6",
  emerald: "#10B981",
  green: "#059669",
  gray: "#94A3B8",
  pink: "#EC4899",
} as const;

/** Métodos de pago habituales en el mercado hispano. Cada organización los edita. */
export const DEFAULT_PAYMENT_METHODS = [
  "Efectivo",
  "Transferencia",
  "Pago móvil",
  "Zelle",
  "Punto de venta",
  "USDT",
];

/** Estados genéricos, base para el preset `generic`. */
export const GENERIC_STATUSES: PresetStatus[] = [
  { name: "Nuevo", kind: "OPEN", color: STATUS_COLORS.slate, isDefault: true },
  { name: "En curso", kind: "IN_PROGRESS", color: STATUS_COLORS.blue },
  { name: "En espera", kind: "WAITING", color: STATUS_COLORS.amber },
  { name: "Completado", kind: "DONE", color: STATUS_COLORS.green },
  { name: "Cancelado", kind: "CANCELLED", color: STATUS_COLORS.gray },
];

/**
 * Reglas de notificación comunes a todos los rubros.
 * Las variables se resuelven en src/server/services/templates.ts
 */
export const COMMON_RULES: PresetRule[] = [
  {
    event: "appointment.reminder",
    channel: "WHATSAPP",
    offsetMinutes: -1440,
    bodyTemplate:
      "Hola {{contact.name}}, te recordamos tu cita de mañana " +
      "{{appointment.time}} en {{org.name}}. ¡Te esperamos!",
  },
  {
    event: "document.quote.sent",
    channel: "WHATSAPP",
    offsetMinutes: 0,
    bodyTemplate:
      "Hola {{contact.name}}, te enviamos el presupuesto {{doc.number}}. " +
      "Podés verlo y aprobarlo desde acá: {{doc.publicUrl}}",
  },
  {
    event: "payment.reminder",
    channel: "WHATSAPP",
    offsetMinutes: 0,
    bodyTemplate:
      "Hola {{contact.name}}, te escribimos de {{org.name}} por el saldo " +
      "pendiente de {{contact.balance}}. ¿Coordinamos el pago?",
  },
];

export const DEFAULT_DOC_TEMPLATES: PresetDocTemplate[] = [
  {
    kind: "QUOTE",
    name: "Presupuesto",
    title: "Presupuesto",
    footerNote:
      "Presupuesto válido por 15 días. Los precios pueden variar según " +
      "disponibilidad. Gracias por confiar en nosotros.",
  },
  {
    kind: "WORK_ORDER",
    name: "Orden de trabajo",
    title: "Orden de trabajo",
    footerNote:
      "El cliente declara conocer y aceptar los trabajos detallados en este documento.",
  },
  {
    kind: "RECEIPT",
    name: "Recibo de pago",
    title: "Recibo",
    footerNote: "Documento de control interno. No constituye factura fiscal.",
  },
  {
    kind: "DELIVERY_NOTE",
    name: "Nota de entrega",
    title: "Nota de entrega",
    footerNote:
      "El cliente recibe conforme los trabajos y elementos detallados.",
  },
];

/**
 * Plantilla HTML base de los documentos.
 * Se usa para pantalla, PDF y portal público: una sola fuente de verdad.
 */
export const BASE_DOC_HTML = `<div class="doc">
  <header class="doc-head">
    <div class="doc-brand">
      {{#if org.logoUrl}}<img class="doc-logo" src="{{org.logoUrl}}" alt="{{org.name}}">{{/if}}
      <div class="doc-org">
        <strong>{{org.legalName}}</strong>
        {{#if org.taxId}}<div>{{org.taxId}}</div>{{/if}}
        {{#if org.address}}<div>{{org.address}}</div>{{/if}}
        <div>{{org.phone}}{{#if org.email}} · {{org.email}}{{/if}}</div>
      </div>
    </div>
    <div class="doc-meta">
      <h1>{{doc.title}}</h1>
      <div class="doc-number">{{doc.number}}</div>
      <div>Fecha: {{doc.issuedAt}}</div>
      {{#if doc.validUntil}}<div>Válido hasta: {{doc.validUntil}}</div>{{/if}}
    </div>
  </header>

  <section class="doc-parties">
    <div>
      <h2>Cliente</h2>
      <div class="doc-strong">{{contact.name}}</div>
      {{#if contact.taxId}}<div>{{contact.taxId}}</div>{{/if}}
      {{#if contact.phone}}<div>{{contact.phone}}</div>{{/if}}
      {{#if contact.address}}<div>{{contact.address}}</div>{{/if}}
    </div>
    {{#if asset}}
    <div>
      <h2>{{org.assetLabel}}</h2>
      <div class="doc-strong">{{asset.label}}</div>
      {{#if asset.identifier}}<div>{{asset.identifier}}</div>{{/if}}
    </div>
    {{/if}}
    {{#if job}}
    <div>
      <h2>Referencia</h2>
      <div class="doc-strong">{{job.code}}</div>
      <div>{{job.title}}</div>
    </div>
    {{/if}}
  </section>

  {{#if job.description}}
  <section class="doc-note">
    <h2>Detalle</h2>
    <p>{{job.description}}</p>
  </section>
  {{/if}}

  <table class="doc-items">
    <thead>
      <tr>
        <th class="col-desc">Descripción</th>
        <th class="col-num">Cant.</th>
        <th class="col-num">Precio</th>
        <th class="col-num">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{this.description}}</td>
        <td class="col-num">{{this.quantity}}</td>
        <td class="col-num">{{this.unitPrice}}</td>
        <td class="col-num">{{this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <section class="doc-totals">
    <div class="row"><span>Subtotal</span><span>{{totals.subtotal}}</span></div>
    {{#if totals.hasTax}}<div class="row"><span>Impuestos</span><span>{{totals.tax}}</span></div>{{/if}}
    {{#if totals.hasDiscount}}<div class="row"><span>Descuento</span><span>-{{totals.discount}}</span></div>{{/if}}
    <div class="row grand"><span>Total</span><span>{{totals.total}}</span></div>
  </section>

  <footer class="doc-foot">{{doc.footerNote}}</footer>
</div>`;

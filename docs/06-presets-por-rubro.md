# 06 — Presets por rubro: el mecanismo "a medida"

> Este es el documento que explica **por qué un solo producto puede sentirse hecho para cada cliente**.
> Es la ventaja competitiva del proyecto, y son unas 400 líneas de datos, no de código.

---

## 1. El problema del sistema vacío

Cuando alguien entra por primera vez a un software de gestión genérico, ve esto:

```
   Trabajos (0)          Estados: [Nuevo] [En proceso] [Terminado]
   ──────────────        Campos:  ninguno
   No hay trabajos.      Plantillas: ninguna
   [+ Crear trabajo]
```

Y piensa: *"esto no tiene nada que ver con mi negocio"*. Se va. **La primera impresión es la batalla
completa.**

Ahora, lo que ve el dueño de un taller mecánico al entrar a Operia:

```
   Órdenes de trabajo (0)
   ──────────────────────────────────────────────────────────────
   [Recibido] [Diagnóstico] [Presupuestado] [Aprobado] [En taller]
   [Listo para entregar] [Entregado]

   Campos de la orden: Kilometraje · Combustible al ingreso · Síntoma reportado
   Vehículos: Marca · Modelo · Año · Placa · Motor · Color
   Plantillas listas: Presupuesto · Orden de trabajo · Recibo · Acta de entrega
```

Mismo código. Misma base de datos. **Cero líneas de código específicas del rubro.**

---

## 2. Anatomía de un preset

Un preset es un objeto de datos que se aplica al crear la organización:

```ts
// src/lib/presets/types.ts

export type IndustryPreset = {
  key: string
  name: string              // "Taller mecánico"
  description: string       // aparece en el selector del registro
  icon: string              // emoji o nombre de icono

  vocabulary: {
    jobSingular: string
    jobPlural: string
    assetSingular: string
    assetPlural: string
    useAssets: boolean      // false = el módulo de activos se oculta por completo
  }

  statuses: Array<{
    name: string
    kind: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'DONE' | 'CANCELLED'
    color: string
    isDefault?: boolean
  }>

  customFields: Array<{
    entity: 'JOB' | 'CONTACT' | 'ASSET' | 'PRODUCT'
    key: string
    label: string
    type: 'TEXT' | 'MULTILINE' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT'
    options?: string[]
    required?: boolean
    showInList?: boolean
  }>

  products: Array<{ name: string; kind: 'SERVICE' | 'GOOD'; priceCents: number }>

  paymentMethods: string[]

  notificationRules: Array<{
    event: string
    channel: 'WHATSAPP' | 'EMAIL'
    offsetMinutes: number
    bodyTemplate: string
  }>

  documentTemplates: Array<{ kind: DocumentKind; name: string; bodyHtml: string }>

  /// Textos de la landing específica del rubro — mismo diseño, mensaje distinto (doc 08)
  marketing: {
    headline: string
    subheadline: string
    painPoints: string[]
    seoKeywords: string[]
  }
}
```

**Regla arquitectónica:** el preset **solo escribe datos** al crear la organización. Nunca se consulta
después. Una vez aplicado, el cliente es dueño de su configuración y puede cambiar todo. Esto evita el
error clásico de acoplar el código a los rubros.

---

## 3. Los rubros del lanzamiento

Ocho presets. Elegidos porque son negocios que ejecutan trabajos identificables, tienen dolor real y
son accesibles para venta directa.

| Key | Rubro | Objeto central | Activo | Por qué está |
|---|---|---|---|---|
| `automotriz` | Taller mecánico | Orden de trabajo | Vehículo | Dolor altísimo, ticket bueno, hay muchos |
| `servicio_tecnico` | Servicio técnico (electrodomésticos, informática) | Reparación | Equipo | Volumen y necesidad de trazabilidad |
| `veterinaria` | Veterinaria | Consulta | Mascota | Historia clínica + recordatorio de vacunas |
| `construccion` | Reformas y construcción | Obra | Inmueble | Presupuestos grandes, seguimiento por etapas |
| `servicios_campo` | Servicios de campo (plagas, refrigeración, ascensores) | Parte de trabajo | Instalación | Mantenimientos recurrentes = ingreso previsible para ellos |
| `consultoria` | Consultoría y agencias | Proyecto | — | No usa activos; prueba que el sistema se adapta |
| `estetica` | Estética y bienestar | Sesión | — | Agenda intensiva, recordatorios |
| `legal` | Estudio jurídico | Expediente | — | Alto valor, poca competencia de software local |

Más un preset `generic` para cualquier otro caso.

---

## 4. Ejemplo completo: preset `automotriz`

```ts
// src/lib/presets/automotriz.ts

export const automotriz: IndustryPreset = {
  key: 'automotriz',
  name: 'Taller mecánico',
  description: 'Órdenes de trabajo, historial por vehículo, presupuestos y entrega.',
  icon: '🔧',

  vocabulary: {
    jobSingular: 'Orden de trabajo',
    jobPlural: 'Órdenes de trabajo',
    assetSingular: 'Vehículo',
    assetPlural: 'Vehículos',
    useAssets: true,
  },

  statuses: [
    { name: 'Recibido',            kind: 'OPEN',        color: '#64748B', isDefault: true },
    { name: 'En diagnóstico',      kind: 'IN_PROGRESS', color: '#0EA5E9' },
    { name: 'Presupuestado',       kind: 'WAITING',     color: '#F59E0B' },
    { name: 'Aprobado',            kind: 'IN_PROGRESS', color: '#8B5CF6' },
    { name: 'Esperando repuesto',  kind: 'WAITING',     color: '#EF4444' },
    { name: 'En reparación',       kind: 'IN_PROGRESS', color: '#3B82F6' },
    { name: 'Listo para entregar', kind: 'IN_PROGRESS', color: '#10B981' },
    { name: 'Entregado',           kind: 'DONE',        color: '#059669' },
    { name: 'Cancelado',           kind: 'CANCELLED',   color: '#94A3B8' },
  ],

  customFields: [
    { entity: 'ASSET', key: 'marca',    label: 'Marca',   type: 'TEXT',   showInList: true },
    { entity: 'ASSET', key: 'modelo',   label: 'Modelo',  type: 'TEXT',   showInList: true },
    { entity: 'ASSET', key: 'anio',     label: 'Año',     type: 'NUMBER', showInList: true },
    { entity: 'ASSET', key: 'placa',    label: 'Placa',   type: 'TEXT',   showInList: true, required: true },
    { entity: 'ASSET', key: 'vin',      label: 'Serial / VIN', type: 'TEXT' },
    { entity: 'ASSET', key: 'color',    label: 'Color',   type: 'TEXT' },
    { entity: 'ASSET', key: 'combustible', label: 'Combustible', type: 'SELECT',
      options: ['Gasolina', 'Diésel', 'Gas', 'Híbrido', 'Eléctrico'] },

    { entity: 'JOB', key: 'kilometraje',    label: 'Kilometraje',        type: 'NUMBER', showInList: true },
    { entity: 'JOB', key: 'nivel_gasolina', label: 'Nivel de gasolina',  type: 'SELECT',
      options: ['Reserva', '1/4', '1/2', '3/4', 'Lleno'] },
    { entity: 'JOB', key: 'sintoma',        label: 'Síntoma reportado',  type: 'MULTILINE' },
    { entity: 'JOB', key: 'diagnostico',    label: 'Diagnóstico',        type: 'MULTILINE' },
    { entity: 'JOB', key: 'autoriza',       label: 'Autoriza retirar piezas', type: 'BOOLEAN' },
  ],

  products: [
    { name: 'Cambio de aceite y filtro',   kind: 'SERVICE', priceCents: 3500_00 },
    { name: 'Alineación y balanceo',       kind: 'SERVICE', priceCents: 2500_00 },
    { name: 'Diagnóstico computarizado',   kind: 'SERVICE', priceCents: 2000_00 },
    { name: 'Cambio de pastillas de freno',kind: 'SERVICE', priceCents: 4500_00 },
    { name: 'Mano de obra (hora)',         kind: 'SERVICE', priceCents: 1500_00 },
  ],

  paymentMethods: ['Efectivo', 'Transferencia', 'Pago móvil', 'Zelle', 'Punto de venta', 'USDT'],

  notificationRules: [
    {
      event: 'job.status.presupuestado',
      channel: 'WHATSAPP',
      offsetMinutes: 0,
      bodyTemplate:
        'Hola {{contact.name}}, ya tenemos el presupuesto de tu {{asset.label}}. ' +
        'Podés verlo y aprobarlo acá: {{doc.publicUrl}}',
    },
    {
      event: 'job.status.listo',
      channel: 'WHATSAPP',
      offsetMinutes: 0,
      bodyTemplate:
        '¡Hola {{contact.name}}! Tu {{asset.label}} está listo para retirar. ' +
        'Orden {{job.code}}. Te esperamos en {{org.address}}.',
    },
    {
      event: 'appointment.reminder',
      channel: 'WHATSAPP',
      offsetMinutes: -1440,
      bodyTemplate:
        'Recordatorio: mañana {{appointment.time}} te esperamos con tu {{asset.label}} en {{org.name}}.',
    },
  ],

  documentTemplates: [
    { kind: 'QUOTE',      name: 'Presupuesto de reparación', bodyHtml: /* ver §6 */ '' },
    { kind: 'WORK_ORDER', name: 'Orden de trabajo',          bodyHtml: '' },
    { kind: 'RECEIPT',    name: 'Recibo de pago',            bodyHtml: '' },
    { kind: 'DELIVERY_NOTE', name: 'Acta de entrega',        bodyHtml: '' },
  ],

  marketing: {
    headline: 'El software que ordena tu taller sin cambiar cómo trabajás',
    subheadline:
      'Órdenes de trabajo, historial por vehículo, presupuestos que el cliente aprueba desde el ' +
      'celular y avisos automáticos por WhatsApp. Listo en 5 minutos.',
    painPoints: [
      'No encontrás el historial de un vehículo que atendiste hace seis meses',
      'Los presupuestos van por foto de WhatsApp y después nadie sabe qué se aprobó',
      'El cliente llama cada dos horas para preguntar cómo va su carro',
      'No sabés cuánta plata te deben ni desde cuándo',
    ],
    seoKeywords: [
      'software para taller mecánico',
      'sistema de órdenes de trabajo taller',
      'programa para talleres automotrices',
      'gestión de taller mecánico online',
      'app para talleres mecánicos',
    ],
  },
}
```

---

## 5. Tabla resumen de los otros presets

Se construyen con la misma estructura. Lo esencial de cada uno:

### `servicio_tecnico`
- **Vocabulario:** Reparación / Reparaciones · Equipo / Equipos
- **Estados:** Recibido → En diagnóstico → Presupuestado → Aprobado → Esperando repuesto → En reparación → Reparado → Entregado · Sin reparación
- **Campos del equipo:** Tipo, Marca, Modelo, Número de serie, Accesorios entregados, ¿En garantía?
- **Campos de la reparación:** Falla reportada, Diagnóstico técnico, Trabajo realizado, Garantía (días)
- **Clave del rubro:** el campo "Accesorios entregados" evita el 100% de las discusiones en la entrega.

### `veterinaria`
- **Vocabulario:** Consulta / Consultas · Paciente / Pacientes
- **Estados:** Agendada → En espera → En consulta → En tratamiento → Alta · No asistió
- **Campos del paciente:** Especie, Raza, Sexo, Fecha de nacimiento, Peso, Castrado, Nº de chip, Alergias
- **Campos de la consulta:** Motivo, Temperatura, Peso actual, Diagnóstico, Tratamiento, Próximo control
- **Regla especial:** el campo "Próximo control" genera automáticamente un recordatorio. **Es la función
  que sola justifica el abono** — recuperan clientes que se habrían perdido.

### `construccion`
- **Vocabulario:** Obra / Obras · Inmueble / Inmuebles
- **Estados:** Contacto inicial → Visita técnica → Presupuestado → Aprobado → En ejecución → Terminado → Garantía
- **Campos de la obra:** Dirección, m², Tipo de obra, Fecha estimada de fin, % de avance, Anticipo recibido
- **Clave del rubro:** presupuestos largos con muchos ítems y cobro por etapas.

### `servicios_campo`
- **Vocabulario:** Servicio / Servicios · Instalación / Instalaciones
- **Estados:** Programado → Asignado → En sitio → Completado → Requiere seguimiento
- **Campos:** Dirección del sitio, Tipo de servicio, Técnico asignado, Firma del cliente, Próximo mantenimiento
- **Clave del rubro:** "Próximo mantenimiento" genera el trabajo futuro automáticamente. Le convierte el
  negocio en ingreso recurrente **a tu cliente**, que es el argumento de venta más potente que existe.

### `consultoria`
- **Vocabulario:** Proyecto / Proyectos · sin activos
- **Estados:** Propuesta → Negociación → Activo → En revisión → Entregado → Cerrado
- **Campos:** Tipo de proyecto, Horas estimadas, Horas consumidas, Responsable del cliente, Fecha de entrega
- **Clave del rubro:** demuestra que el sistema funciona sin activos.

### `estetica`
- **Vocabulario:** Sesión / Sesiones · sin activos
- **Estados:** Agendada → Confirmada → En atención → Completada → No asistió
- **Campos:** Tratamiento, Profesional, Nº de sesión del paquete, Observaciones, Consentimiento firmado
- **Clave del rubro:** recordatorio 24 h antes. Bajar el ausentismo del 20% al 5% se paga solo.

### `legal`
- **Vocabulario:** Expediente / Expedientes · sin activos
- **Estados:** Consulta inicial → En estudio → Escrito presentado → En trámite → Sentencia → Archivado
- **Campos:** Materia, Juzgado, Nº de causa, Contraparte, Próxima audiencia, Honorarios pactados
- **Clave del rubro:** "Próxima audiencia" con recordatorio. Olvidarse de una audiencia es catastrófico,
  así que el valor percibido es altísimo.

### `generic`
Estados neutros, sin campos, sin activos. Para todo lo demás.

---

## 6. Plantillas de documento

Cada preset trae cuatro plantillas en HTML con variables. Diseño limpio, imprimible en A4, con el logo
y los datos de la organización.

Estructura base compartida (`src/lib/presets/templates/base.ts`):

```html
<div class="doc">
  <header class="doc__head">
    <img src="{{org.logoUrl}}" class="doc__logo" alt="{{org.name}}">
    <div class="doc__org">
      <strong>{{org.legalName}}</strong><br>
      {{org.taxId}}<br>{{org.address}}<br>{{org.phone}} · {{org.email}}
    </div>
    <div class="doc__meta">
      <h1>{{doc.title}}</h1>
      <div>N.º {{doc.number}}</div>
      <div>Fecha: {{doc.issuedAt}}</div>
      {{#if doc.validUntil}}<div>Válido hasta: {{doc.validUntil}}</div>{{/if}}
    </div>
  </header>

  <section class="doc__party">
    <h2>Cliente</h2>
    <div>{{contact.name}}</div>
    <div>{{contact.taxId}}</div>
    <div>{{contact.phone}} · {{contact.email}}</div>
  </section>

  {{#if asset}}
  <section class="doc__asset">
    <h2>{{org.assetLabelSingular}}</h2>
    <div>{{asset.label}} · {{asset.identifier}}</div>
  </section>
  {{/if}}

  <table class="doc__items">
    <thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{this.description}}</td><td>{{this.quantity}}</td>
        <td>{{this.unitPrice}}</td><td>{{this.total}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="doc__totals">
    <div>Subtotal: {{totals.subtotal}}</div>
    {{#if totals.tax}}<div>Impuestos: {{totals.tax}}</div>{{/if}}
    {{#if totals.discount}}<div>Descuento: −{{totals.discount}}</div>{{/if}}
    <div class="doc__grand">Total: {{totals.total}}</div>
  </div>

  <footer class="doc__foot">{{doc.footerNote}}</footer>
</div>
```

Cada preset solo cambia el título, el pie y algún bloque específico. **Una plantilla base, ocho rubros.**

---

## 7. Cómo se aplica el preset

```ts
// src/server/services/onboarding.ts

export async function createOrganizationWithPreset(input: {
  userId: string
  orgName: string
  industryKey: string
  currency: string
  timezone: string
}) {
  const preset = getPreset(input.industryKey)

  return db.$transaction(async (tx) => {
    const org = await tx.organization.create({ data: { /* ...vocabulario del preset... */ } })

    await tx.membership.create({ data: { userId: input.userId, orgId: org.id, role: 'OWNER' } })
    await tx.jobStatus.createMany({ data: preset.statuses.map(...) })
    await tx.customFieldDef.createMany({ data: preset.customFields.map(...) })
    await tx.product.createMany({ data: preset.products.map(...) })
    await tx.notificationRule.createMany({ data: preset.notificationRules.map(...) })
    await tx.documentTemplate.createMany({ data: preset.documentTemplates.map(...) })
    await tx.subscription.create({ data: { orgId: org.id, planCode: 'starter', status: 'TRIAL',
                                           trialEndsAt: addDays(new Date(), 14) } })
    return org
  })
}
```

**Todo en una transacción.** Si algo falla, no queda una organización a medio configurar — que sería
peor que ninguna, porque el usuario entra, ve algo roto y se va para siempre.

---

## 8. Nada de datos de ejemplo dentro de la cuenta

**Decisión de producto tomada: el sistema nunca crea registros ficticios en la cuenta de un cliente.**

Es tentador cargar contactos y trabajos de mentira para que el tablero no se vea vacío, pero el costo
es alto: el usuario tiene que distinguir lo real de lo falso desde el primer minuto, corre el riesgo de
mandarle un presupuesto a un cliente inventado, y siempre queda basura sin borrar. Un sistema de
gestión que arranca con datos mentirosos empieza pidiendo desconfianza.

**En su lugar, el sistema vacío se resuelve así:**

| Recurso | Qué hace |
|---|---|
| **Estados vacíos con instrucciones** | Cada pantalla sin datos explica qué es y ofrece la acción concreta: "Todavía no cargaste ninguna orden. Creá la primera →" |
| **Preset aplicado** | El usuario entra y ve *sus* estados, *sus* campos y *su* vocabulario. La configuración ya está hecha aunque no haya datos |
| **Importación desde CSV** | El primer día carga sus clientes reales desde el Excel que ya tiene |
| **Vista previa en la landing** | La demostración con datos ilustrativos vive en la web pública (`preset.showcase`), donde corresponde: es material de venta, no de producción |

El contenido de `preset.showcase` en el código **solo alimenta la landing pública**. Nunca se escribe
en la base de datos. Está documentado como regla inviolable en `CLAUDE.md` §4.7.

---

## 9. Siguiente paso

Documento 07: precios, planes y cómo cobrar desde Venezuela sin que te congelen la cuenta.

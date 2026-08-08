# 07 — Precios, monetización y cómo cobrar desde Venezuela

> Este documento resuelve el problema más específico y más crítico del proyecto: **cómo cobra el dinero
> alguien que vive en Venezuela**, sin poner en riesgo el negocio.

---

## PARTE A — Precios

## 1. Filosofía de precios

Tres principios, en orden de importancia:

1. **Precio en USD.** Toda la región hispana entiende precios en dólares y protege tu ingreso de la
   inflación. El cliente paga en su moneda local al cambio del día, pero el precio nominal es en USD.
2. **Precio por organización, no por usuario.** Los planes por usuario castigan al cliente que crece y
   generan la conversación más incómoda del negocio. Cobrás por tamaño de plan, con un tope generoso
   de usuarios incluido.
3. **Barato para la región, no barato para vos.** USD 29/mes es carísimo para un taller de barrio y
   ridículamente barato para una consultora. Por eso hay tres planes.

---

## 2. Los tres planes

| | **Inicial** | **Profesional** ⭐ | **Negocio** |
|---|---|---|---|
| **Precio mensual** | USD 19 | USD 39 | USD 79 |
| **Precio anual** (2 meses gratis) | USD 190 | USD 390 | USD 790 |
| Usuarios | 3 | 10 | Ilimitados |
| Trabajos por mes | 150 | Ilimitados | Ilimitados |
| Contactos | 1.000 | Ilimitados | Ilimitados |
| Almacenamiento | 2 GB | 20 GB | 100 GB |
| Estados y campos personalizados | ✅ | ✅ | ✅ |
| Documentos y portal público | ✅ | ✅ | ✅ |
| Plantillas propias | 1 por tipo | Ilimitadas | Ilimitadas |
| Recordatorios por WhatsApp (enlace) | ✅ | ✅ | ✅ |
| **WhatsApp automático (API)** | — | ✅ | ✅ |
| Reportes | Básicos | Completos | Completos + export programado |
| Multi-sucursal | — | — | ✅ |
| Soporte | Email (48 h) | WhatsApp (24 h) | WhatsApp prioritario (4 h) |
| Onboarding asistido | — | 1 sesión | 3 sesiones + carga de datos |

**Prueba gratuita: 14 días, sin tarjeta, plan Profesional completo.** Sin tarjeta es decisivo: en la
región, pedir tarjeta por adelantado corta la mitad de los registros — y muchos ni siquiera tienen una
que funcione internacionalmente.

### Por qué esta estructura

- **El Inicial existe para tener un ancla barata**, no para ganar plata. Debe ser suficientemente
  limitado como para que el negocio que crece se mude a Profesional en 3–6 meses.
- **El Profesional es el que se vende.** Está diseñado para que sea la elección obvia. La
  diferenciación clave es WhatsApp automático: la función de mayor valor percibido.
- **El Negocio captura al que puede pagar más** sin que tengas que negociar caso por caso.

### Descuentos autorizados

| Situación | Descuento | Condición |
|---|---|---|
| Cliente fundador (primeros 20) | 40% vitalicio | Testimonio + permiso para usar su nombre |
| Pago anual | 2 meses gratis (≈17%) | Por adelantado |
| Referido que se convierte | 1 mes gratis a ambos | Al segundo mes pagado del referido |
| Canal / revendedor | 30% de comisión recurrente | Ver documento 08 |

**Nada más.** Los descuentos ad hoc destruyen la estructura de precios y te dejan sin argumentos con el
próximo cliente.

---

## 3. Proyección de ingresos

| Clientes | Mezcla típica | MRR | Neto aprox. |
|---|---|---|---|
| 5 | 3 Inicial + 2 Profesional | USD 135 | USD 100 |
| 10 | 4 Inicial + 5 Prof + 1 Negocio | USD 350 | USD 290 |
| 20 | 6 Inicial + 11 Prof + 3 Negocio | USD 780 | USD 690 |
| 40 | 10 Inicial + 24 Prof + 6 Negocio | USD 1.600 | USD 1.450 |
| 60 | 12 Inicial + 38 Prof + 10 Negocio | USD 2.500 | USD 2.280 |

Costos de infraestructura estimados: USD 25/mes hasta 20 clientes, USD 60–120/mes hasta 100.

**Lectura importante:** el objetivo de USD 2.000/mes está en **~55–60 clientes**, no 22 como en el
escenario optimista del documento 00. La diferencia es que ahí se asumía ticket combinado con
facturación fiscal. Sin ese módulo el ticket es menor pero el producto es vendible en toda la región y
cuesta la mitad construirlo. **Es el intercambio correcto para empezar.**

Camino a subir el ticket sin vender más clientes:
- WhatsApp API → empuja de Inicial a Profesional
- Onboarding asistido pago (USD 80–150 una vez) → ingreso inmediato y baja el churn
- Módulo fiscal por país en Fase 3 → +USD 15–25/mes sobre la base ya instalada

---

## PARTE B — Cómo cobrar desde Venezuela

## 4. La restricción real

**Stripe no admite empresas ni personas en Venezuela.** Tampoco Paddle, ni Lemon Squeezy, ni Payoneer,
ni Wise para cuentas venezolanas. No es un problema de configuración: es una decisión de cumplimiento de
esos proveedores.

### Por qué el VPN no es una solución

Es una idea que aparece siempre y hay que descartarla de forma explícita:

| Lo que el VPN resuelve | Lo que Stripe verifica igual |
|---|---|
| Tu dirección IP | Entidad legal en un país soportado |
| | Cuenta bancaria en ese país, a nombre de la entidad |
| | Identificador fiscal (EIN/SSN) |
| | Documento de identidad y comprobante de domicilio coincidentes |

El riesgo no está en la apertura, está **después**: la revisión de cumplimiento llega a los 3–9 meses,
cuando ya tenés clientes y saldo. Consecuencias reales documentadas:

- Retención de fondos 90–120 días.
- Cierre definitivo de la cuenta.
- Bloqueo permanente de tu identidad y de tu negocio en la plataforma — lo que te impide hacerlo bien
  después.
- Tus clientes sin servicio, con su información adentro, y vos sin forma de cobrarles.

Ese golpe llega en el peor momento posible: cuando el negocio ya depende de ti. **No vale la pena.**

---

## 5. La estrategia por etapas

### Etapa 1 — Clientes 1 a 20: cobro manual (empezá acá, hoy)

El cliente ve las instrucciones de pago, paga por el canal que le sirva, sube el comprobante, vos
confirmás desde `/admin` y el sistema extiende el período. Ya está en el modelo de datos:
`SubscriptionPayment` con `provider: "manual"`, `proofKey` y `status: PENDING`.

**Canales por país del cliente:**

| País del cliente | Canal | Cómo te llega |
|---|---|---|
| Venezuela | Pago móvil, transferencia local | Cuenta local |
| Cualquiera | **USDT (TRC-20 / BEP-20)** | Wallet propia → Binance P2P → bolívares o retención en USD |
| Colombia, Perú, Ecuador, México | Transferencia local a un conocido de confianza, o USDT | Conversión local |
| EE.UU. / clientes con cuenta allá | Zelle | Requiere titular en EE.UU. |
| Global | **Binance Pay** (transferencia entre usuarios, sin comisión) | Directo a tu cuenta |

**El canal principal debe ser USDT.** Es el que funciona sin intermediarios, sin permisos y sin riesgo
de bloqueo, y en el mercado venezolano es completamente normal — no vas a tener que convencer a nadie.

**Carga operativa real:** 20 clientes = ~20 confirmaciones al mes = **30 minutos mensuales**. Es
perfectamente sostenible. El sistema automatiza los avisos de vencimiento; lo único manual es apretar
"confirmar" cuando ves el comprobante.

**Ventaja oculta del cobro manual:** cada renovación es un punto de contacto con el cliente. Es cuando
te enterás de que estaba por darse de baja y podés hacer algo.

---

### Etapa 2 — Al superar ~USD 1.500/mes: entidad en el exterior

Cuando el ingreso lo justifica, se resuelve de forma legítima y definitiva.

**Opción recomendada: LLC en Estados Unidos.**

Un no residente puede constituir una LLC legalmente, sin visa, sin viajar y sin ser residente fiscal
estadounidense. Es el camino estándar de miles de emprendedores latinoamericanos.

| Paso | Qué es | Costo aprox. | Tiempo |
|---|---|---|---|
| 1 | Constituir LLC en Nuevo México o Wyoming | USD 100–350 | 1–7 días |
| 2 | Agente registrado (obligatorio) | USD 50–150/año | incluido |
| 3 | **EIN** (identificador fiscal ante el IRS) | gratis por tu cuenta, o USD 100–250 con gestor | 1–5 semanas sin SSN |
| 4 | Banco de empresa: **Mercury** o **Relay** | gratis | 3–10 días |
| 5 | Stripe con la LLC | gratis | inmediato |
| 6 | Contador para la declaración anual (formularios 5472 + 1120) | USD 300–600/año | anual |

**Costo total: USD 400–700 el primer año, ~USD 400/año después.** Con 40 clientes eso es media semana
de facturación.

> ⚠️ **Punto de honestidad:** las cuentas bancarias estadounidenses para no residentes con vínculo
> venezolano reciben escrutinio adicional. Mercury y Relay han rechazado solicitudes por eso. **Nunca
> declares información falsa** — si te rechazan, probás con otra o usás la alternativa de abajo. Una
> solicitud rechazada por honestidad no cierra ninguna puerta; una aprobada con datos falsos te cierra
> todas.

**Alternativa: Estonia (e-Residency + OÜ).** Más caro (~USD 1.200/año entre constitución, dirección
legal y contabilidad obligatoria) pero con un proceso más previsible para latinoamericanos, y da acceso
a Stripe y a la banca europea (Wise Business, LHV).

---

### Etapa 3 — Cobro automático

Con la LLC y Stripe:

- Suscripciones con cobro automático por tarjeta.
- Reintentos automáticos, avisos de tarjeta vencida, cancelación autogestionada.
- Y en paralelo se **mantiene el cobro manual con USDT**, porque muchos clientes de la región
  no tienen tarjeta internacional. **Ningún método reemplaza al otro: se suman.**

---

## 6. Diseño técnico: adaptadores de pago

La arquitectura está preparada para que cambiar de método no toque el resto del sistema.

```ts
// src/server/services/billing/provider.ts

export interface PaymentProvider {
  key: string
  displayName: string

  /// Instrucciones que ve el cliente en la pantalla de pago
  getInstructions(ctx: { org: Organization; plan: Plan; amountCents: number }): PaymentInstructions

  /// ¿Requiere que un humano confirme? (manual: sí; Stripe: no)
  requiresManualConfirmation: boolean

  /// Solo proveedores automáticos
  createCheckout?(input: CheckoutInput): Promise<{ url: string }>
  handleWebhook?(payload: unknown, signature: string): Promise<WebhookResult>
}
```

Implementaciones:

| Adaptador | Cuándo | Estado |
|---|---|---|
| `manual` | Etapa 1 — transferencia, USDT, pago móvil, Zelle | **Fase 1** |
| `binance_pay` | Verificación semiautomática por API de Binance | Fase 2 |
| `stripe` | Cuando exista la LLC | Fase 2 |
| `mercadopago` | Clientes de Argentina, México, Chile, Colombia | Fase 3 |

**Regla:** la lógica de suscripción (períodos, gracia, suspensión) vive en el servicio de facturación y
**no sabe nada** del proveedor. El proveedor solo responde "se pagó, sí o no".

---

## 7. Gestión de la mora

Automatizada por la cola de trabajos, sin intervención tuya:

| Momento | Acción |
|---|---|
| 7 días antes del vencimiento | Email + banner: "tu plan se renueva el día X" |
| 3 días antes | Email recordatorio con las instrucciones de pago |
| Día del vencimiento | Email + banner destacado. Estado → `PAST_DUE` |
| +2 días | WhatsApp personal tuyo. **Este es el que recupera clientes.** |
| +5 días | Estado → `SUSPENDED`. Solo lectura. Email explicando cómo reactivar |
| +30 días | Email: "tus datos siguen acá, disponibles cuando quieras volver" |
| Nunca | **Borrar datos.** Jamás. |

Los datos se conservan 12 meses tras la suspensión. Después se avisa con 30 días de anticipación antes
de archivarlos en frío. Nunca se destruyen sin aviso.

---

## 8. Impuestos y aspectos legales

**Sin la LLC (etapa 1):** operás como persona natural desde Venezuela. Tus obligaciones son las de tu
país de residencia. Consultá con un contador local — este documento no es asesoramiento fiscal.

**Con la LLC (etapa 2):** una LLC de un solo miembro no residente, sin presencia física ni empleados en
EE.UU., generalmente no tributa impuesto federal sobre la renta allí, pero **sí tiene obligación de
declarar** (formularios 5472 y 1120 pro forma). La multa por no presentarlos es de USD 25.000. **No es
opcional y no es algo para improvisar: contratá un contador especializado.**

**Términos y condiciones y política de privacidad:** obligatorios desde el primer cliente. Deben cubrir:

- Que sos el encargado del tratamiento y el cliente el responsable de sus datos
- Retención y eliminación de datos
- Nivel de servicio ofrecido y límite de responsabilidad
- Ley aplicable y jurisdicción
- Derecho del cliente a exportar todo, en cualquier momento

Se generan a partir de plantillas y se revisan con un abogado cuando el ingreso lo permita. Tenerlos
imperfectos es infinitamente mejor que no tenerlos.

---

## 9. Checklist de la Parte B

- [ ] Wallet de USDT creada (TRC-20 por comisiones bajas)
- [ ] Cuenta de Binance verificada, P2P probado con un monto chico
- [ ] Datos de pago móvil / transferencia local listos
- [ ] Pantalla de instrucciones de pago con los métodos activos
- [ ] Subida de comprobante funcionando
- [ ] Confirmación desde `/admin` extendiendo el período correctamente
- [ ] Secuencia de avisos de vencimiento probada
- [ ] Términos y condiciones y política de privacidad publicados
- [ ] Recordatorio en calendario: al llegar a USD 1.500/mes, iniciar el trámite de la LLC

---

## Siguiente paso

Documento 08: cómo conseguir los clientes — landing con SEO, guion de venta y programa de canal.

# 01 — Definición de producto y alcance

> Nombre en clave del proyecto: **Operia**
> (verificar disponibilidad de dominio antes de comprometerse; el nombre no afecta al código porque
> la marca vive en variables de configuración — ver documento 09.)

---

## 1. El problema

La PyME de servicios del mundo hispano trabaja así:

- Los pedidos entran por **WhatsApp**.
- Los presupuestos se hacen en **Word o a mano** y se mandan como foto.
- El seguimiento vive en la **cabeza del dueño**.
- Los cobros se anotan en un **cuaderno o un Excel**.
- El historial del cliente **no existe** — hay que buscarlo en el chat.

Consecuencias que el dueño sí percibe y sí paga por resolver:

| Síntoma | Costo real |
|---|---|
| "No sé qué trabajos están pendientes" | Trabajos que se caen, clientes que se van |
| "Se me pasó llamar al cliente" | Ventas perdidas por seguimiento |
| "No sé cuánto me deben" | Capital de trabajo inmovilizado |
| "El cliente pregunta cómo va lo suyo" | Horas del dueño contestando lo mismo |
| "Se fue el empleado y se llevó la información" | Pérdida de activo del negocio |
| "No sé si gano plata con este cliente" | Decisiones a ciegas |

No es un problema de un rubro. Es el problema de **todo negocio que ejecuta trabajos para clientes**.

---

## 2. Qué es Operia

> **Operia es el sistema operativo del negocio de servicios: entra el pedido, se ejecuta el trabajo,
> se documenta, se cobra y queda historial. Todo en un solo lugar, configurable para cada rubro.**

No es un CRM. No es un ERP. No es un gestor de tareas. Es la **columna vertebral operativa**: el
recorrido completo desde que un cliente pide algo hasta que paga y queda registrado.

### El objeto central: el Trabajo

Todo el sistema gira alrededor de una entidad: el **Trabajo** (`Job`). Según el rubro se llama distinto,
pero es estructuralmente lo mismo:

| Rubro | Cómo lo llama | Qué contiene |
|---|---|---|
| Taller mecánico | Orden de trabajo | Vehículo, síntoma, repuestos, mano de obra |
| Veterinaria | Consulta / Historia | Mascota, diagnóstico, tratamiento |
| Servicio técnico | Reparación | Equipo, falla, repuestos |
| Estudio jurídico | Expediente | Causa, actuaciones, honorarios |
| Consultora | Proyecto | Entregables, horas, hitos |
| Servicio de campo (plagas, refrigeración) | Parte de trabajo | Sitio, tareas, certificado |
| Constructora / reformas | Obra | Etapas, materiales, avances |
| Agencia | Proyecto de cliente | Tareas, revisiones, entregas |

**Un solo modelo de datos sirve a todos.** Lo que cambia es la configuración, no el código. Esa es la
tesis central del producto y la razón por la que un solo desarrollador puede sostenerlo.

---

## 3. Cómo se resuelve "generalizado" y "a medida" a la vez

Esta es la decisión de diseño más importante del proyecto.

```
   GENERALIZADO                          A MEDIDA
   (un solo código)                      (cada cliente lo siente suyo)
   ─────────────────                     ─────────────────────────────
   Un núcleo multi-tenant        ←──→    Estados de trabajo configurables
   Un modelo de datos                    Campos personalizados por entidad
   Un despliegue                         Plantillas de documento propias
   Un backlog                            Vocabulario renombrable
                                         Logo, colores y datos en documentos
                                         Presets por rubro (5 min de setup)
                                         Roles y permisos por organización
```

**Cuatro palancas de personalización, ninguna requiere escribir código:**

1. **Estados configurables** — cada organización define su propio flujo de trabajo
   (`Recibido → Diagnóstico → Presupuestado → Aprobado → En taller → Listo → Entregado`).
2. **Campos personalizados** — el taller agrega "Patente", "Kilometraje"; la veterinaria agrega
   "Especie", "Peso"; el estudio jurídico agrega "Fuero", "Juzgado".
3. **Plantillas de documento** — presupuestos, órdenes, recibos y certificados con el diseño y el
   texto del cliente, no uno genérico.
4. **Vocabulario** — la organización decide si su objeto central se llama "Orden de trabajo",
   "Expediente", "Caso" o "Proyecto". El sistema lo usa en toda la interfaz.

**Y encima, los presets por rubro** (documento 06): al crear la cuenta, el cliente elige su rubro y las
cuatro palancas quedan preconfiguradas. Entra al sistema y ve *su* vocabulario y *sus* estados, no un
producto vacío. Esa primera impresión es la que hace que diga "esto está hecho para mí".

---

## 4. Cliente ideal (ICP)

| Dimensión | Definición |
|---|---|
| **Tamaño** | 2 a 30 personas. Menos de 2, no paga. Más de 30, pide cosas que no vas a poder dar todavía. |
| **Tipo** | Negocio de servicios que ejecuta trabajos identificables para clientes identificables. |
| **Geografía** | Cualquier país hispanohablante. Sin dependencias fiscales, no hay barrera. |
| **Señal de dolor** | Ya usa WhatsApp para trabajar y Excel para controlar. Es decir: ya siente el problema. |
| **Anti-cliente** | Retail con caja y hardware, restaurantes, e-commerce puro, empresas de más de 50 empleados con IT propio. |

**Regla de oro:** si el negocio no puede nombrar "el trabajo" que hace para un cliente, no es tu cliente.

---

## 5. Alcance de la Fase 1 (lo que se construye primero)

Nueve módulos. Nada más. Cada uno está especificado en el documento 04.

| # | Módulo | Por qué está en Fase 1 |
|---|---|---|
| M1 | **Cuentas y organizaciones** | Multi-tenant, invitaciones, roles. Sin esto no hay producto. |
| M2 | **Contactos** | Clientes y proveedores con historial completo. |
| M3 | **Activos** | Vehículo, mascota, equipo, inmueble. Es lo que hace que se sienta del rubro. |
| M4 | **Trabajos** | El corazón. Estados configurables, asignación, ítems, timeline. |
| M5 | **Catálogo** | Servicios y productos con precio. Alimenta presupuestos. |
| M6 | **Documentos** | Presupuesto, orden, recibo, certificado. PDF + link público. |
| M7 | **Cobros** | Pagos, saldos, cuenta corriente. Sin fiscalidad, país-agnóstico. |
| M8 | **Agenda y recordatorios** | Turnos y avisos automáticos por WhatsApp/email. |
| M9 | **Configuración** | Estados, campos, plantillas, vocabulario, marca. La palanca "a medida". |

Más dos módulos transversales que no se ven pero sin los cuales no hay negocio:

| # | Módulo | Función |
|---|---|---|
| M10 | **Suscripciones y cobro del SaaS** | Planes, prueba gratis, mora, suspensión. Con adaptadores de pago. |
| M11 | **Panel de administración (tuyo)** | Ver organizaciones, activar pagos, métricas, soporte. |

---

## 6. No-objetivos explícitos (Fase 1)

Escribir esto es tan importante como el alcance. Lo que **no** se construye:

- ❌ **Facturación fiscal de ningún país.** Se emiten recibos y documentos internos, no comprobantes
  fiscales. Se agrega como módulo opcional por país en Fase 3, solo si el mercado lo pide y paga.
- ❌ **Contabilidad, nómina, impuestos.** No es un ERP.
- ❌ **App móvil nativa.** La web responsive alcanza y sobra. Se instala como PWA.
- ❌ **POS con hardware, cajón de dinero, impresora fiscal.**
- ❌ **E-commerce, carrito, tienda online.**
- ❌ **Chat en vivo, mensajería interna, red social de equipo.**
- ❌ **Integraciones con software externo** (salvo WhatsApp y email).
- ❌ **Multi-idioma.** Solo español en Fase 1. La arquitectura lo deja preparado, pero no se traduce.
- ❌ **Reportes avanzados / BI.** Cinco reportes fijos, no un constructor de reportes.

**Regla de defensa del alcance:** cuando un prospecto pida algo de esta lista, la respuesta es
*"está en el roadmap"*, y solo se mueve si **tres clientes distintos que ya pagan** lo piden.

---

## 7. Cómo se ve el éxito

| Hito | Métrica | Plazo objetivo (a 6 h/día) |
|---|---|---|
| H1 | MVP navegable con datos reales propios | Semana 6 |
| H2 | Primer cliente usándolo gratis (piloto) | Semana 8 |
| H3 | Primer cliente pagando | Semana 10 |
| H4 | 5 clientes pagando | Semana 16 |
| H5 | 20 clientes pagando ≈ objetivo de ingreso fijo | Mes 8–10 |
| H6 | Primer revendedor / canal activo | Mes 10–12 |

**Métricas que importan de verdad** (y que el panel de administración debe mostrar):

- **MRR** (ingreso mensual recurrente).
- **Churn mensual** — si supera 5%, el producto tiene un problema de valor, no de ventas.
- **Activación** — % de cuentas que crean 10 trabajos en los primeros 14 días. Es el mejor predictor
  de que el cliente va a pagar y quedarse.
- **Tiempo hasta el primer trabajo creado** — mide si el onboarding funciona. Objetivo: menos de 10 min.

---

## 8. La ventaja competitiva, dicha sin adornos

No vas a ganar por tener más funciones. Vas a ganar por tres cosas:

1. **Configurabilidad real.** Los competidores genéricos obligan al cliente a adaptarse al software.
   Los verticales cuestan caro y solo sirven a un rubro. Operia se adapta al cliente sin costo marginal.
2. **Cercanía.** Sos una persona a la que le pueden escribir por WhatsApp y que le cambia algo en dos
   días. Ningún SaaS global compite con eso, y es exactamente lo que la PyME hispana valora.
3. **Precio en la moneda correcta.** Podés cobrar en USD con precios pensados para LATAM, mientras los
   competidores globales cobran precios de Europa.

Y una debilidad que hay que aceptar y compensar: **estás solo.** Todo el documento 09 existe para que
eso no sea un riesgo terminal.

---

## 9. Siguiente paso

Documento 02: arquitectura técnica y stack — las decisiones de infraestructura, con el criterio de
"lo más simple que sostenga 200 clientes con una sola persona operándolo".

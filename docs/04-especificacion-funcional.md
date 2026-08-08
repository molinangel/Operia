# 04 — Especificación funcional por módulo

> Cómo leer este documento: cada módulo tiene **pantallas**, **reglas** y **criterios de aceptación**.
> Los criterios de aceptación son la definición de "terminado". Si no se cumplen todos, el módulo no está
> listo, por más que "funcione".

---

## M1 — Cuentas y organizaciones

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/registro` | Email + nombre + contraseña. Crea `User`, `Organization`, `Membership(OWNER)` y `Subscription(TRIAL)` en una sola transacción. |
| `/registro/rubro` | **Paso 2, obligatorio.** Elige el rubro → aplica el preset (doc 06). Es la pantalla que hace que el producto "se sienta a medida" a los 90 segundos. |
| `/login` | Email + contraseña. Con límite de intentos. |
| `/recuperar` | Envía enlace de un solo uso, válido 1 hora. |
| `/[org]/config/equipo` | Lista de miembros, invitar por email, cambiar rol, desactivar. |
| `/invitacion/[token]` | Aceptar invitación. Si el email no tiene cuenta, la crea en el mismo flujo. |
| Selector de organización | En la barra superior, si el usuario pertenece a más de una. |

### Reglas

1. Un usuario puede pertenecer a varias organizaciones. La organización activa vive en la URL
   (`/[org]/...`), **nunca** en la sesión: así dos pestañas con organizaciones distintas no se pisan.
2. `slug` de organización: minúsculas, sin espacios, único global, editable solo por `OWNER` y solo
   una vez cada 30 días (rompe enlaces guardados).
3. Siempre debe existir al menos un `OWNER` activo. No se puede quitar el último.
4. Al desactivar un miembro, sus trabajos asignados quedan sin asignar y se avisa a los `ADMIN`.
5. Invitación: expira a los 7 días, un solo uso, revocable.

### Criterios de aceptación

- [ ] Un usuario de la organización A que manipula la URL para entrar a la B recibe 404, no 403.
- [ ] Crear cuenta y llegar a la pantalla principal con datos de ejemplo del rubro toma menos de 2 minutos.
- [ ] El test automatizado de aislamiento entre organizaciones pasa.

---

## M2 — Contactos

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/[org]/contactos` | Tabla con búsqueda, filtros (etiqueta, tipo, con deuda), columnas configurables (incluye campos personalizados marcados `showInList`). |
| `/[org]/contactos/nuevo` | Alta rápida: nombre + teléfono es lo mínimo. Todo lo demás opcional. |
| `/[org]/contactos/[id]` | Ficha: datos, activos, trabajos, documentos, pagos, saldo, timeline, adjuntos. |

### Reglas

1. **Detección de duplicados**: al escribir un teléfono o email ya existente, se avisa antes de guardar
   y se ofrece abrir el existente. No se bloquea — a veces hay duplicados legítimos.
2. Teléfono se normaliza a E.164 usando el prefijo de la organización como defecto. Sin esto, WhatsApp
   no funciona.
3. **Saldo del contacto** = Σ totales de trabajos entregados − Σ pagos. Se muestra en la ficha y se
   puede filtrar por "con deuda".
4. Importación desde CSV con mapeo de columnas. Es lo que permite que un cliente migre de su Excel el
   primer día — sin esto, el onboarding se cae.
5. Archivar, no borrar. Un contacto archivado no aparece en búsquedas ni selectores, pero su historial
   se mantiene.

### Criterios de aceptación

- [ ] Buscar por nombre parcial, teléfono o email devuelve resultados en menos de 300 ms con 10.000 contactos.
- [ ] Importar un CSV de 500 filas funciona y reporta los errores fila por fila sin abortar todo.

---

## M3 — Activos

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/[org]/activos` | Tabla, filtrable por dueño y tipo. El título usa `assetLabelPlural` de la organización. |
| `/[org]/activos/[id]` | Ficha con historial completo de trabajos sobre ese activo. |
| Inline | Se crea desde el formulario de trabajo sin salir de la pantalla. |

### Reglas

1. Un activo puede existir sin dueño (equipo del propio negocio) y puede cambiar de dueño conservando
   el historial.
2. `identifier` (patente, serie, chip) es buscable y se usa para detectar duplicados.
3. **El módulo se oculta por completo** si el preset del rubro no lo usa (una consultora no tiene activos).
   Es un interruptor en la configuración de la organización.

### Criterios de aceptación

- [ ] Desde la ficha de un activo se ve el historial cronológico de todos sus trabajos.
- [ ] En un rubro sin activos, la palabra "activo" no aparece en ninguna parte de la interfaz.

---

## M4 — Trabajos (el corazón)

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/[org]/trabajos` | **Dos vistas conmutables: tablero Kanban por estado y tabla.** El Kanban es lo que vende el producto en la demo. |
| `/[org]/trabajos/nuevo` | Alta: título, contacto, activo, prioridad, responsable, fecha, campos personalizados. |
| `/[org]/trabajos/[id]` | Detalle en tres zonas: cabecera (estado, responsable, fechas), ítems y totales, timeline con notas y adjuntos. |
| `/p/[token]` | **Portal público**: el cliente final ve estado, descripción y documentos sin login. |

### Reglas

1. **Cambio de estado**: arrastrando en el Kanban o desde un selector. Cada cambio genera `Activity` y
   `AuditLog`, y dispara las reglas de notificación asociadas.
2. Al pasar a un estado de categoría `DONE` se registra `completedAt` automáticamente.
3. **Ítems**: se agregan desde el catálogo (autocompletado con precio) o a mano. Los totales se
   recalculan en el servidor, nunca en el navegador. El navegador muestra una previsualización; el
   servidor manda.
4. **Filtros de la lista**: estado, responsable, contacto, prioridad, rango de fechas, texto libre,
   "vencidos", "sin asignar". Los filtros se guardan en la URL para poder compartirlos.
5. **Enlace público**: se genera bajo demanda, es revocable y muestra solo lo que la organización
   habilitó (estado sí, costos opcional).
6. Adjuntos: fotos del trabajo. En rubros de servicio esto es la mitad del valor — el "antes y después".
7. Duplicar trabajo: crea uno nuevo con los mismos ítems. Para mantenimientos recurrentes.

### Criterios de aceptación

- [ ] El Kanban con 200 trabajos carga en menos de 1 segundo y el arrastre es fluido.
- [ ] Los totales calculados coinciden con el test unitario de redondeo definido en el documento 03.
- [ ] Dos usuarios creando trabajos al mismo tiempo obtienen códigos distintos y consecutivos.
- [ ] El portal público no filtra ningún dato que la organización no habilitó explícitamente.

---

## M5 — Catálogo

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/[org]/catalogo` | Tabla de servicios y productos, filtro por tipo, alerta de stock mínimo. |
| `/[org]/catalogo/[id]` | Ficha con precio, costo, impuesto, stock. |

### Reglas

1. `SERVICE` no maneja stock. `GOOD` puede activarlo con `trackStock`.
2. Al agregar un producto con stock a un trabajo, el stock se descuenta **cuando el trabajo pasa a
   `DONE`**, no al agregarlo. Si el trabajo se cancela, se repone.
3. El margen (`price − cost`) se muestra en la ficha y alimenta el reporte de rentabilidad.
4. Actualización masiva de precios por porcentaje. En economías con inflación esto no es un lujo, es
   requisito de uso diario.

### Criterios de aceptación

- [ ] Subir todos los precios un 15% con un clic y ver el historial de ese cambio en la auditoría.

---

## M6 — Documentos

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/[org]/documentos` | Lista filtrable por tipo y estado. |
| Desde el trabajo | Botón "Generar presupuesto / orden / recibo" con la plantilla por defecto del tipo. |
| `/[org]/documentos/[id]` | Vista previa, descargar PDF, copiar enlace, enviar por WhatsApp o email. |
| `/[org]/config/plantillas` | Editor de plantillas con variables disponibles y previsualización en vivo. |
| `/p/doc/[token]` | Vista pública. Si es presupuesto: botones **Aprobar** / **Rechazar**. |

### Reglas

1. **Variables de plantilla**: `{{org.*}}`, `{{contact.*}}`, `{{job.*}}`, `{{items}}`, `{{totals.*}}`,
   `{{today}}`, `{{doc.number}}`. Documentadas en el editor, no en la cabeza del desarrollador.
2. Al enviar (`DRAFT → SENT`) se congela `snapshotHtml`. Cambiar la plantilla después no altera
   documentos ya enviados.
3. El PDF se genera desde el mismo HTML. Una sola fuente para pantalla, PDF y portal.
4. Cuando el cliente abre el enlace: `viewedAt`. Cuando aprueba o rechaza: `respondedAt` + notificación
   al responsable. **Esa notificación de "tu cliente aprobó el presupuesto" es la función que más
   engancha del producto.**
5. Aprobar un presupuesto puede (configurable) mover el trabajo al siguiente estado automáticamente.
6. Numeración por tipo y por organización, con prefijo configurable.

### Criterios de aceptación

- [ ] Un presupuesto enviado por WhatsApp se abre bien en el móvil del cliente sin instalar nada.
- [ ] Modificar la plantilla no altera ni un pixel de un documento ya enviado.
- [ ] El PDF descargado es idéntico a la vista web.

---

## M7 — Cobros

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/[org]/cobros` | Lista de pagos, filtro por fecha, método y contacto. Totales del período. |
| Desde el trabajo | "Registrar pago" con el saldo pendiente precargado. |
| `/[org]/cobros/deudores` | Contactos con saldo, ordenados por antigüedad. Botón de recordatorio por WhatsApp. |

### Reglas

1. Un pago puede ser total o parcial. `Job.paidCents` se recalcula siempre desde los pagos.
2. Métodos de pago **configurables por organización** — cada país usa los suyos (efectivo,
   transferencia, Zelle, Pago Móvil, USDT, Mercado Pago, Bizum...). No se codifican en duro.
3. Multi-moneda: cada pago guarda su moneda. Si difiere de la de la organización, se guarda también la
   tasa aplicada. **Crítico en economías dolarizadas de facto.**
4. Al registrar un pago se ofrece generar el recibo con un clic.
5. La lista de deudores es la pantalla que el dueño abre todos los lunes. Tiene que ser rápida y clara.

### Criterios de aceptación

- [ ] Registrar un pago parcial deja el saldo correcto en el trabajo y en el contacto.
- [ ] El reporte de deudores cuadra con la suma manual de los trabajos entregados menos los pagos.

---

## M8 — Agenda y recordatorios

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/[org]/agenda` | Calendario semanal y diario, filtrable por responsable. |
| Desde el trabajo | Agendar visita o entrega. |
| `/[org]/config/recordatorios` | Reglas: evento, canal, cuándo, texto de la plantilla. |

### Reglas

1. Todo en UTC en la base, mostrado y calculado en la zona de la organización.
2. Reglas de recordatorio por defecto (vienen del preset):
   - 24 h antes de una cita → WhatsApp al cliente.
   - Trabajo completado → WhatsApp "tu trabajo está listo".
   - Presupuesto sin respuesta a los 3 días → aviso interno al responsable.
3. **Fase 1 — semiautomático**: el sistema genera el mensaje y un enlace `wa.me` con el texto
   precargado. El usuario hace un clic y se envía desde su propio WhatsApp. Costo cero, cero fricción
   regulatoria, y el cliente final recibe el mensaje del número que ya conoce.
4. **Fase 2 — automático**: WhatsApp Cloud API para envío sin intervención, como función de plan superior.
5. Detección de solapamientos al asignar dos citas a la misma persona en el mismo horario: se avisa, no
   se bloquea.

### Criterios de aceptación

- [ ] Un recordatorio programado a las 09:00 hora de Caracas se dispara a esa hora, no en UTC.
- [ ] El mensaje de WhatsApp llega con el nombre, la fecha y el trabajo correctamente sustituidos.

---

## M9 — Configuración

| Sección | Qué permite |
|---|---|
| **General** | Nombre, logo, color, datos legales, moneda, zona horaria. |
| **Vocabulario** | Cómo se llama el objeto central y los activos en toda la interfaz. |
| **Estados** | Crear, renombrar, reordenar (arrastrando), color, categoría técnica, cuál es el inicial. |
| **Campos personalizados** | Por entidad: clave, etiqueta, tipo, opciones, obligatorio, si es columna. |
| **Plantillas** | Editor de documentos con previsualización. |
| **Recordatorios** | Reglas de notificación. |
| **Métodos de pago** | Lista propia de cada organización. |
| **Equipo** | Miembros, roles, invitaciones. |
| **Suscripción** | Plan actual, consumo vs. límites, historial de pagos, cambio de plan. |

### Regla crítica de la configurabilidad

> **Cambiar la configuración nunca puede romper los datos existentes.**

- Renombrar un estado: los trabajos lo siguen usando, cambia solo la etiqueta.
- Archivar un estado con trabajos: se obliga a reasignarlos primero.
- Cambiar el tipo de un campo personalizado: solo se permite si es compatible; si no, se crea uno nuevo.
- Cambiar la moneda de la organización: **no** convierte los datos históricos; se avisa con claridad.

---

## M10 — Suscripciones (facturación del SaaS)

### Pantallas

| Ruta | Qué hace |
|---|---|
| `/[org]/config/suscripcion` | Plan, consumo, días restantes de prueba, historial. |
| `/[org]/config/suscripcion/pagar` | Instrucciones de pago según el método + subida del comprobante. |
| Banner global | Aparece a los 7, 3 y 1 día del vencimiento, y en mora. |

### Reglas del ciclo de vida

```
TRIAL (14 días) ──► ACTIVE ──► PAST_DUE (5 días de gracia) ──► SUSPENDED
                       ▲                                            │
                       └────────── pago confirmado ─────────────────┘
```

- `SUSPENDED`: solo lectura + exportación completa siempre disponible. **Nunca se borran datos.**
- Los avisos de vencimiento salen por email y por banner en la aplicación.
- Detalle completo de precios y métodos: documento 07.

---

## M11 — Panel de administración (tuyo)

`/admin`, restringido por lista de emails en variable de entorno.

| Vista | Para qué |
|---|---|
| Organizaciones | Todas, con plan, estado, uso, último acceso. Buscar y entrar como soporte. |
| Pagos pendientes | **La pantalla que más vas a usar.** Comprobantes subidos → confirmar → extiende el período. |
| Métricas | MRR, clientes activos, altas y bajas del mes, churn, activación. |
| Cola y mensajes | Estado de `QueuedJob` y `OutboundMessage`, reintentos manuales. |
| Registro de errores | Últimos fallos con contexto. |

### Reglas

1. **"Entrar como" queda registrado en auditoría** y se le muestra al cliente en su registro de
   actividad. Es una cuestión de confianza y, en algunos países, legal.
2. El panel nunca muestra datos de negocio de un cliente salvo entrando explícitamente en modo soporte.

---

## Reportes (mínimos de Fase 1)

Cinco reportes fijos. Ni uno más hasta que un cliente que paga pida el sexto.

1. **Trabajos por estado y por responsable** — carga de trabajo actual.
2. **Ingresos por período** — cobrado por mes, por método de pago.
3. **Deudores** — saldo por contacto y antigüedad.
4. **Servicios y productos más vendidos** — con margen.
5. **Tiempo medio de ciclo** — de creación a entrega, por tipo de trabajo. Este es el que le abre los
   ojos al dueño sobre dónde se le va el negocio.

Todos exportables a CSV. La exportación completa de datos de la organización es obligatoria y siempre
accesible: es un argumento de venta ("no te secuestro la información") y una obligación en varias
legislaciones.

---

## Siguiente paso

Documento 05: el plan de construcción semana por semana.

# 05 — Plan de construcción

> Capacidad asumida: **6 horas/día, 6 días/semana = ~36 h/semana.**
> Sprints de una semana. Cada sprint termina con algo **demostrable**, no con "avance".

---

## 0. Las cuatro reglas del plan

1. **Cada sprint cierra con algo que se puede mostrar en pantalla.** Si al viernes no hay nada que
   enseñar, el sprint falló aunque hayas trabajado 36 horas.
2. **La venta empieza en la semana 4, no cuando el producto esté listo.** Nunca va a estar listo.
3. **Ninguna función entra al plan sin estar en el documento 04.** Toda idea nueva va a `BACKLOG.md`
   y se evalúa al final del sprint, nunca en el medio.
4. **Regla del 80/20 del tiempo:** 80% construir, 20% hablar con clientes potenciales. Desde el día uno.
   Sin la segunda parte, terminás con un producto perfecto que nadie compra.

---

## FASE 1 — Fundaciones (semanas 1–3)

### Sprint 1 — Esqueleto y multi-tenant

**Objetivo:** poder registrarse, crear una organización y entrar a un panel vacío pero real.

| Día | Tareas |
|---|---|
| 1 | `create-next-app` con TypeScript. Tailwind v4. shadcn/ui. Estructura de carpetas del doc 02. ESLint + Prettier. Repositorio git con commits desde el minuto uno. |
| 2 | PostgreSQL (Neon o local con Docker). Prisma. Copiar el esquema del doc 03 completo. Primera migración. `seed.ts` con los planes. |
| 3 | Auth.js v5: registro, login, cierre de sesión, recuperación de contraseña. Hash con argon2id. |
| 4 | Capa de multi-tenancy: `context.ts`, `requireCtx`, primeros repositorios con scope, `permissions.ts`. |
| 5 | Layout de la aplicación: barra lateral, cabecera, selector de organización, ruta `/[org]/...`. |
| 6 | **Test de aislamiento entre organizaciones** (el innegociable). Despliegue a Vercel funcionando. |

**Demostrable:** registrarse en producción, entrar, ver el panel con el nombre de tu organización.

---

### Sprint 2 — Contactos y activos

| Día | Tareas |
|---|---|
| 1–2 | CRUD de contactos: lista con búsqueda y paginación por cursor, alta, ficha, archivar. |
| 3 | Motor de **campos personalizados**: definición, formulario dinámico, render en lista. Sirve para todas las entidades. |
| 4 | CRUD de activos + relación con contacto + historial. Interruptor para ocultar el módulo. |
| 5 | Importación CSV de contactos con mapeo de columnas y reporte de errores. |
| 6 | Subida de archivos a S3/R2 con URL firmada. Componente de adjuntos reutilizable. |

**Demostrable:** cargar 200 contactos reales desde un Excel y buscarlos.

---

### Sprint 3 — Trabajos: el corazón

| Día | Tareas |
|---|---|
| 1 | CRUD de `JobStatus` + reordenamiento por arrastre + estado inicial. |
| 2 | Alta y detalle de trabajo. Numeración transaccional. Campos personalizados. |
| 3 | `JobItem` + catálogo mínimo + **motor de cálculo de totales con sus tests unitarios**. |
| 4 | Vista Kanban con arrastre entre estados. |
| 5 | Vista de tabla con filtros persistidos en la URL. Timeline (`Activity`) y adjuntos. |
| 6 | Auditoría (`AuditLog`) en todas las escrituras. Repaso y corrección de deuda. |

**Demostrable:** el tablero Kanban con trabajos reales moviéndose entre columnas.
**Este es el momento en que el producto empieza a existir.**

> 🔴 **A partir de acá, empieza la actividad comercial en paralelo.** Ver documento 08, sección
> "Las primeras 20 conversaciones". No se pospone hasta tener el producto listo.

---

## FASE 2 — Producto vendible (semanas 4–6)

### Sprint 4 — Documentos

| Día | Tareas |
|---|---|
| 1 | Motor de plantillas: variables, render, saneamiento del HTML. |
| 2 | Editor de plantillas con previsualización en vivo y lista de variables disponibles. |
| 3 | Generar documento desde un trabajo. Congelado del snapshot. Numeración. |
| 4 | Generación de PDF desde el HTML. |
| 5 | Portal público `/p/doc/[token]`: ver, aprobar, rechazar. Registro de apertura. |
| 6 | Envío por WhatsApp (`wa.me`) y por email (Resend). Plantillas por defecto de los 4 tipos principales. |

**Demostrable:** generar un presupuesto, mandarlo por WhatsApp, aprobarlo desde el móvil.
**Es la demo que vende el producto.**

---

### Sprint 5 — Cobros, agenda y presets

| Día | Tareas |
|---|---|
| 1 | Pagos: registro, saldo del trabajo, saldo del contacto, métodos configurables, multi-moneda. |
| 2 | Reporte de deudores + recordatorio de cobro por WhatsApp. |
| 3 | Agenda: calendario semanal y diario, citas ligadas a trabajos. |
| 4 | Cola `QueuedJob` + endpoint cron + `OutboundMessage` + reglas de notificación. |
| 5–6 | **Presets por rubro** (doc 06): al menos 6 rubros completos, aplicados en el alta de la cuenta. |

**Demostrable:** crear una cuenta eligiendo "Taller mecánico" y ver el sistema ya configurado con
estados, campos, plantillas y vocabulario de taller.

---

### Sprint 6 — Suscripciones, panel de administración y pulido

| Día | Tareas |
|---|---|
| 1 | Planes, límites, prueba gratuita, ciclo de estados de la suscripción. |
| 2 | Pantalla de pago con instrucciones + subida de comprobante. Adaptador `manual`. |
| 3 | Panel `/admin`: organizaciones, confirmación de pagos, métricas de MRR. |
| 4 | Los 5 reportes + exportación a CSV + exportación completa de la organización. |
| 5 | Onboarding guiado, estados vacíos con instrucciones, responsive en móvil. |
| 6 | Repaso de seguridad: límite de intentos, validaciones, permisos, revisión de N+1. |

**🎯 Hito H1: MVP completo en producción.**

---

## FASE 3 — Primeros clientes (semanas 7–10)

### Sprint 7 — Piloto con clientes reales

- 2–3 negocios usando el sistema **gratis** a cambio de comentarios.
- **Vos cargás sus datos iniciales personalmente.** Es la tarea de mayor retorno de todo el proyecto:
  aprendés el rubro por dentro y el cliente queda enganchado.
- Bitácora diaria de fricciones: cada vez que el usuario duda, anotalo.

### Sprint 8 — Corregir lo que el piloto reveló

- Solo arreglos y ajustes derivados de la bitácora. **Cero funciones nuevas.**
- Lo que se rompe con datos reales siempre es distinto de lo que uno anticipa.

### Sprint 9 — Landing, precios y material de venta

- Landing con propuesta de valor, capturas reales, precios y registro.
- Página por rubro (`/talleres`, `/veterinarias`, ...) — misma plantilla, textos distintos. Es lo que
  hace que el prospecto sienta que es para él.
- Vídeo de demostración de 3 minutos.
- Documentación de ayuda: 10 artículos que cubren el 90% de las preguntas.

### Sprint 10 — Conversión

- Convertir los pilotos en clientes que pagan (con descuento vitalicio de fundador).
- Activar el cobro manual de punta a punta.

**🎯 Hito H3: primer cliente pagando.**

---

## FASE 4 — De 1 a 20 clientes (semanas 11–24)

Cambia el ritmo: **60% venta y soporte, 40% producto.**

| Bloque | Foco |
|---|---|
| Semanas 11–14 | Venta directa. 10 conversaciones por semana. Ajustes pequeños según objeciones reales. |
| Semanas 15–18 | Segundo grupo de rubros (3 presets más). Ampliar mercado sin escribir código nuevo. |
| Semanas 19–21 | WhatsApp Cloud API como función de plan superior. Sube el ticket de los clientes actuales. |
| Semanas 22–24 | Programa de canal: contadores y consultores que revenden a comisión (doc 08). |

**🎯 Hito H5: 20 clientes pagando ≈ objetivo de ingreso fijo.**

---

## Backlog explícitamente pospuesto

No se toca ninguno hasta tener 20 clientes pagando, por más tentador que parezca:

- Facturación fiscal por país (el módulo de mayor valor, y por eso mismo el más caro de equivocar)
- Aplicación móvil nativa
- Agente de IA sobre los datos del negocio
- Portal de autogestión para el cliente final
- Firma digital de documentos
- Integración con contabilidad
- Multi-idioma
- API pública y webhooks
- Marca blanca completa con dominio propio

---

## Disciplina de trabajo diaria

| Momento | Práctica |
|---|---|
| Inicio del día | 10 min: revisar el plan del sprint, elegir la tarea. Una sola. |
| Durante | Commits pequeños y frecuentes con mensajes claros. Nada de "wip". |
| Fin del día | Push. Anotar en `DIARIO.md` qué se hizo y qué quedó trabado. |
| Fin del sprint | Desplegar. Grabar la demostración de 2 minutos. Actualizar el plan. |
| Regla de bloqueo | Si algo te traba más de 2 horas: anotalo, saltalo, seguí con otra tarea. Volvés al día siguiente. |

**`DIARIO.md` no es burocracia.** Es lo que te permite retomar el hilo después de un día malo y lo que
te muestra el avance cuando sientas que no avanzaste nada. Trabajando solo, eso importa más que
cualquier metodología.

---

## Señales de alarma

Si aparece alguna de estas, parar y corregir el rumbo:

| Señal | Qué significa realmente | Qué hacer |
|---|---|---|
| Sprint 3 terminado y cero conversaciones con negocios | Estás construyendo a ciegas | Frenar un día entero y salir a hablar |
| Refactorizando el mismo módulo por tercera vez | Perfeccionismo como forma de evitar la venta | Congelar y avanzar |
| Semana 10 sin nadie que quiera probarlo gratis | El problema o el segmento están mal elegidos | Volver al doc 00 y revisar el rubro |
| Todos dicen "buenísimo" y nadie paga | Cortesía, no interés real | Pedir el pago antes; el "sí" que vale es el que sale del bolsillo |

---

## Siguiente paso

Documento 06: los presets por rubro — el mecanismo que hace que el producto se sienta a medida.

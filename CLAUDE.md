# CLAUDE.md — contexto del proyecto para asistentes de IA

> Este archivo lo lee automáticamente Claude Code (y sirve para cualquier otra IA).
> **Leelo entero antes de tocar código.** Contiene las decisiones que ya se tomaron
> y las reglas que no se negocian.

---

## 1. Qué es esto

**Operia** — SaaS multi-tenant de gestión operativa para negocios de servicios del
mundo hispano. El cliente gestiona *trabajos* (órdenes, consultas, expedientes,
proyectos, según su rubro) de punta a punta: alta, ejecución, documentos, cobro.

**Modelo de negocio:** suscripción mensual en USD. Objetivo: ~55 clientes pagando
para alcanzar USD 2.000/mes de ingreso recurrente.

**Quién lo construye:** una sola persona, desde Venezuela, unas 6 h/día.
Toda decisión técnica se juzga contra esa restricción.

---

## 2. Estructura del repositorio

```
Proyecto/
├── CLAUDE.md                 ← este archivo
├── docs/                     ← la serie 00–10, fuente de verdad del proyecto
│   ├── 00-panorama-de-oportunidades.md
│   ├── 01-producto-y-alcance.md
│   ├── 02-arquitectura-y-stack.md
│   ├── 03-modelo-de-datos.md          ← el esquema manda
│   ├── 04-especificacion-funcional.md ← qué hace cada pantalla
│   ├── 05-plan-de-construccion.md
│   ├── 06-presets-por-rubro.md
│   ├── 07-precios-y-cobro.md
│   ├── 08-go-to-market-y-seo.md
│   ├── 09-despliegue-y-operacion.md
│   └── 10-checklist-cuentas-y-tokens.md
└── operia/                   ← la aplicación
    ├── prisma/schema.prisma  ← modelo de datos
    ├── prisma.config.ts      ← config de la CLI (Prisma 7)
    └── src/
        ├── app/
        │   ├── (marketing)/  ← landing pública + landings por rubro (SEO)
        │   ├── (auth)/       ← login, registro, recuperación
        │   ├── app/[org]/    ← LA APLICACIÓN (todo cuelga del slug de organización)
        │   ├── p/            ← portal público sin login (documentos, estado)
        │   ├── admin/        ← panel del operador
        │   └── api/
        ├── components/
        │   ├── ui/           ← primitivas propias (button, primitives)
        │   ├── marketing/    ← todo lo de la landing
        │   └── app/          ← componentes de la aplicación
        ├── lib/              ← código sin dependencias de servidor
        │   ├── presets/      ← los 9 rubros
        │   ├── money.ts      ← aritmética de dinero
        │   ├── permissions.ts
        │   └── plans.ts
        └── server/           ← SOLO servidor
            ├── db.ts         ← cliente Prisma (singleton + adaptador pg)
            ├── auth.ts       ← sesiones, argon2, límite de intentos
            ├── context.ts    ← requireCtx: la barrera multi-tenant
            ├── errors.ts
            ├── repos/        ← acceso a datos, SIEMPRE con orgId
            └── services/     ← reglas de negocio
```

---

## 3. Stack (ya decidido, no re-litigar)

| Capa | Elección |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) + TypeScript + React 19 |
| Estilos | **Tailwind CSS v4** con tokens CSS propios en `globals.css` |
| Base de datos | **PostgreSQL** en Supabase |
| ORM | **Prisma 7** — la URL vive en `prisma.config.ts`, el cliente usa `@prisma/adapter-pg` |
| Auth | **Propia**, sesión en base de datos + argon2id. No hay next-auth |
| Archivos | S3-compatible (Supabase Storage o Cloudflare R2) |
| Email | Resend |
| Cola | Tabla `queued_job` + `/api/cron/tick`. Sin Redis |
| Despliegue | Vercel |

**Next.js es Node.** Si alguien pregunta por qué no "Node a secas": el renderizado
en servidor de las landings es el canal de captación del negocio. Ver docs/02.

---

## 4. Reglas que NO se rompen

1. **Aislamiento multi-tenant.** Ninguna consulta sin `orgId`. Todo pasa por
   `requireCtx(orgSlug)` en `src/server/context.ts` y por un repositorio de
   `src/server/repos/`. Ningún componente de UI importa `db` directamente.
   *Una filtración de datos entre clientes termina el negocio.*

2. **404, nunca 403, para recursos de otra organización.** Un 403 confirma que el
   recurso existe. Ver `NotFoundError` en `server/errors.ts`.

3. **Dinero en centavos enteros.** Nunca `float`. Toda aritmética pasa por
   `src/lib/money.ts`. El redondeo es *half up* al centavo, por línea.

4. **Fechas en UTC** en la base. La zona horaria vive en `Organization.timezone`
   y el formateo ocurre en el borde de la interfaz.

5. **Nada se borra.** `archivedAt` en todas las entidades de negocio.
   Tampoco se borran datos por falta de pago: la cuenta pasa a solo lectura.

6. **Los documentos enviados son inmutables.** Al pasar de `DRAFT` a `SENT` se
   congela `snapshotHtml`. Cambiar la plantilla después no altera lo ya enviado.

7. **Sin datos de ejemplo en la cuenta del cliente.** El sistema nunca crea
   registros ficticios. `preset.showcase` existe **solo** para la vista previa de
   la landing pública.

8. **Sin fiscalidad de ningún país.** Se emiten presupuestos, órdenes, notas de
   entrega y recibos de control interno. Nada de facturación fiscal: eso ataría
   el producto a un país. Es una decisión de producto, no una omisión.

9. **Numeración transaccional.** `Job.code` y `Document.number` se generan dentro
   de una transacción que incrementa el contador de la organización. Sin eso, dos
   usuarios simultáneos generan el mismo número.

10. **Validación con Zod en el borde** de toda Server Action. Los tipos se derivan
    del esquema, no al revés.

11. **Las invariantes críticas viven en la base de datos.** `CHECK` y `EXCLUDE` en
    la migración, no solo validaciones en el servicio. Una regla que la aplicación
    recuerda cumplir es una regla que algún día se rompe. Prisma no las modela:
    van escritas a mano en el SQL de la migración. Verificar con
    `npx tsx scripts/verify-db-invariants.ts`.

12. **Los pagos son append-only.** Nunca se editan ni se archivan. Un error se
    corrige con un pago inverso enlazado por `reversesId`, con motivo obligatorio
    y conservando la tasa de cambio original. El saldo es entradas menos salidas.

13. **La moneda base se calcula al momento del cobro y no se recalcula.** Si no
    hay cotización para esa fecha, el importe base queda en `null`: un dato
    faltante y visible es mejor que un número inventado con la tasa de hoy.

---

## 5. Convenciones de código

- **Idioma:** todo el texto visible y los comentarios, en **español rioplatense
  neutro** (voseo suave, sin regionalismos cerrados). Los identificadores, en inglés.
- **Comentarios:** explican *por qué*, nunca *qué*. Si el código necesita que le
  expliquen qué hace, se reescribe el código.
- **Componentes de servidor por defecto.** `"use client"` solo cuando hace falta
  estado o eventos.
- **Server Actions** para toda escritura. Devuelven `ActionResult<T>` de
  `server/errors.ts`.
- **Nombres:** modelos `PascalCase`, campos `camelCase`, tablas `snake_case` vía
  `@@map`.
- **Sin `any`.** Sin `@ts-ignore` salvo con comentario justificando.
- **Nunca un artículo junto al vocabulario configurable.** El cliente elige cómo
  se llama su objeto central, y el género gramatical cambia: «Nuevo orden de
  trabajo» está mal, «Nueva consulta» y «Nuevo proyecto» no se pueden generar con
  la misma plantilla. Se escriben frases sin artículo: «Crear orden de trabajo»,
  «Sin cliente asignado», «Todavía no cargaste consultas».
- **Tailwind:** usar los tokens (`bg-surface`, `text-fg-muted`, `border-border`),
  nunca colores crudos de Tailwind. El sistema tiene modo claro y oscuro.

### Diseño

El sistema es **minimalista, claro y profesional**. La jerarquía la hacen el
espacio y la tipografía, no la decoración. Reglas:

- **Un solo color de acento** (verde profundo), usado poco: acción principal,
  estado activo y dato clave. Nada más.
- **Neutros fríos y limpios.** Ni beige, ni sepia, ni fondos oscuros como base.
- **Sombras de una capa y muy suaves.** Separan planos, no adornan.
- **Prohibido:** degradados, resplandores, texturas, patrones de fondo,
  tipografías de fantasía, elementos rotados y marcos de navegador.
- El producto se muestra **derecho y limpio**, dibujado en HTML, sin
  perspectiva ni mockups.

---

## 6. Comandos

```bash
cd operia

npm run dev              # desarrollo
npm run build            # build de producción
npm run lint

npx prisma generate      # regenerar el cliente tras tocar el esquema
npx prisma migrate dev   # crear y aplicar migración en desarrollo
npx prisma migrate deploy# aplicar migraciones en producción
npx prisma studio        # explorador visual de la base
npm run db:seed          # cargar los planes

# Verificaciones (corren contra la base real)
npx tsx scripts/verify-tenant-isolation.ts   # aislamiento entre organizaciones
npx tsx scripts/verify-db-invariants.ts      # restricciones CHECK y EXCLUDE
```

---

## 7. Estado actual

**Terminado y verificado contra base de datos real**
- Serie de documentación 00–10
- Esquema de datos completo (Prisma 7 + Supabase, migración aplicada)
- 9 presets de rubro con configuración y contenido de marketing
- Landing: home con selector interactivo de rubro, 8 landings por rubro
  pre-renderizadas, precios, sitemap, robots, JSON-LD (con escape de `<`)
- Sistema de diseño con modo claro/oscuro sin desajustes de hidratación
- Auth propia: sesiones en base, argon2id, límite de intentos, permisos
- Contexto multi-tenant con `requireCtx` (acciones) y `requirePageCtx` (páginas)
- Registro en dos pasos que aplica el preset en una sola transacción
- Aplicación: shell con selector de organización, panel de inicio con métricas,
  tablero Kanban con arrastre optimista, detalle de trabajo con ítems y totales
  calculados en servidor, historial, contactos con normalización de teléfono

**Verificaciones automatizadas**
- `npx tsx scripts/verify-tenant-isolation.ts` — 18 comprobaciones de aislamiento
- Prueba end-to-end con Playwright — 21 comprobaciones (registro, tablero,
  ítems, contactos, modo oscuro, 404 de organización ajena, consola limpia)

**Siguiente**
- Documentos (presupuesto, orden, recibo) con portal público y PDF
- Cobros y reporte de deudores
- Agenda y recordatorios por WhatsApp
- Configuración: estados, campos, plantillas, equipo
- Activos y catálogo (pantallas propias)
- Panel de administración y suscripciones

## 8. Qué NO hacer

- ❌ Agregar dependencias sin necesidad real. Cada una es mantenimiento futuro.
- ❌ Microservicios, Redis, GraphQL, Kubernetes, monorepo. Ver docs/02 §1.
- ❌ Construir funciones del backlog pospuesto (docs/05) antes de tener 20 clientes.
- ❌ Facturación fiscal, app móvil nativa, multi-idioma. Están fuera de alcance a propósito.
- ❌ Refactorizar algo que funciona porque "quedaría más lindo".
- ❌ Dejar trabajo a medias con un `// TODO`. Si se empieza, se termina.

---

## 8b. Trampas conocidas

- **Después de `prisma generate`, reiniciar `next dev`.** El proceso tiene el
  cliente viejo cargado en memoria y falla con «Unknown field» en relaciones
  nuevas. No es un bug del código; se pierde media hora buscándolo.
- **`next dev` sobrevive a que se corte el proceso padre.** Si el puerto queda
  tomado, matar el PID que informa el mensaje de error.
- **Prisma CLI y `node-postgres` interpretan SSL distinto.** `DATABASE_URL` lleva
  `uselibpqcompat=true`, `DATABASE_URL_UNPOOLED` no. Está explicado en
  `.env.example`; no unificarlas.

---

## 9. Al terminar una tarea

1. `npm run build` tiene que pasar.
2. Si tocaste el esquema: `npx prisma migrate dev --name descripcion-corta`.
3. Actualizá la sección 7 de este archivo.
4. Si cambiaste una decisión de arquitectura, actualizá el documento de `docs/`
   correspondiente. **Documentación y código no pueden contradecirse.**

# 02 — Arquitectura técnica y stack

> Criterio rector: **la solución más simple que sostenga 200 organizaciones operada por una sola
> persona.** Cada pieza que se agrega es una pieza que hay que mantener, monitorear y arreglar a las
> 3 de la mañana. Se agrega solo si su ausencia duele más que su presencia.

---

## 1. Decisiones de stack

| Capa | Elección | Por qué esta y no otra |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + TypeScript | Front y back en un solo proyecto, un solo despliegue, un solo lenguaje. Para una persona sola, separar front y back duplica el trabajo sin beneficio a esta escala. |
| **UI** | Tailwind CSS v4 + shadcn/ui | Componentes que se copian al proyecto (no una dependencia que se rompe), accesibles y personalizables. Acelera muchísimo sin atarte. |
| **Base de datos** | PostgreSQL | Transacciones serias, JSONB para campos personalizados, full-text search incluido. No hace falta nada más. |
| **ORM** | Prisma | Migraciones versionadas, tipos generados, esquema legible. El esquema del documento 03 es la fuente de verdad del sistema. |
| **Autenticación** | Auth.js v5 (NextAuth) | Sesiones, email+contraseña y magic link. La capa de organizaciones y roles es propia (ver §4) porque es el corazón del multi-tenant y no conviene delegarla. |
| **Archivos** | S3-compatible (Cloudflare R2 / Supabase Storage) | Nunca guardar archivos en el disco del servidor: rompe el despliegue y los backups. |
| **Email** | Resend | Nivel gratuito suficiente para arrancar, API simple. |
| **WhatsApp** | Fase 1: enlaces `wa.me` + plantillas. Fase 2: WhatsApp Cloud API | El enlace `wa.me` cuesta cero, no requiere aprobación de Meta y cubre el 80% del valor. La API se agrega cuando haya clientes que la paguen. |
| **PDF** | Generación server-side desde HTML | Las plantillas son HTML, el PDF es una impresión de ese HTML. Una sola fuente para pantalla, PDF y link público. |
| **Trabajos programados** | Tabla `job_queue` + endpoint cron protegido | No hace falta Redis ni un worker aparte hasta pasar los 200 clientes. |
| **Despliegue Fase 1** | Vercel (hobby/pro) + Neon o Supabase | Cero administración de servidores mientras validás. |
| **Despliegue Fase 2** | VPS con Docker Compose + Caddy | Cuando el costo variable supere ~USD 40/mes, migrar. Preparado desde el día uno (documento 09). |

### Lo que deliberadamente NO se usa

- ❌ **Microservicios.** A esta escala son puro costo.
- ❌ **Redis / colas dedicadas.** Postgres hace de cola perfectamente hasta miles de mensajes/día.
- ❌ **GraphQL.** Server Actions y route handlers alcanzan.
- ❌ **Kubernetes.** No.
- ❌ **Monorepo con múltiples paquetes.** Un solo proyecto Next.js.
- ❌ **Tests end-to-end exhaustivos en Fase 1.** Tests solo en la lógica de negocio crítica
  (permisos, cálculo de totales, aislamiento de tenant). El resto se prueba a mano.

---

## 2. Diagrama general

```
                          ┌────────────────────────┐
                          │      NAVEGADOR         │
                          │  App (autenticada)     │
                          │  Portal público (link) │
                          └───────────┬────────────┘
                                      │ HTTPS
                          ┌───────────▼────────────┐
                          │      NEXT.JS 15        │
                          │  ┌──────────────────┐  │
                          │  │ UI (RSC + client)│  │
                          │  ├──────────────────┤  │
                          │  │ Server Actions   │  │  ← toda escritura pasa por acá
                          │  ├──────────────────┤  │
                          │  │ Capa de servicio │  │  ← reglas de negocio
                          │  ├──────────────────┤  │
                          │  │ Capa de datos    │  │  ← ÚNICO lugar que toca Prisma
                          │  │ (scoped por org) │  │     y que aplica el filtro de tenant
                          │  └──────────────────┘  │
                          └──┬──────────┬──────┬───┘
                             │          │      │
                 ┌───────────▼──┐  ┌────▼───┐ ┌▼─────────────┐
                 │ PostgreSQL   │  │ S3/R2  │ │ Resend       │
                 │ (datos)      │  │ (files)│ │ WhatsApp API │
                 └──────────────┘  └────────┘ └──────────────┘
                             ▲
                 ┌───────────┴──────────┐
                 │ CRON (cada 5 min)    │  → procesa job_queue:
                 │ /api/cron/tick       │     recordatorios, mora, limpieza
                 └──────────────────────┘
```

---

## 3. Estructura de carpetas

```
operia/
├── prisma/
│   ├── schema.prisma            # fuente de verdad del modelo (doc 03)
│   ├── migrations/
│   └── seed.ts                  # planes, presets de rubro
├── src/
│   ├── app/
│   │   ├── (marketing)/         # landing pública, precios
│   │   ├── (auth)/              # login, registro, recuperar clave
│   │   ├── (app)/[org]/         # aplicación: TODO cuelga del slug de organización
│   │   │   ├── trabajos/
│   │   │   ├── contactos/
│   │   │   ├── activos/
│   │   │   ├── catalogo/
│   │   │   ├── documentos/
│   │   │   ├── agenda/
│   │   │   ├── cobros/
│   │   │   ├── reportes/
│   │   │   └── config/
│   │   ├── p/[token]/           # portal público del cliente final (sin login)
│   │   ├── admin/               # panel del operador (vos)
│   │   └── api/
│   │       ├── cron/tick/
│   │       ├── webhooks/
│   │       └── files/
│   ├── server/
│   │   ├── db.ts                # cliente Prisma singleton
│   │   ├── auth.ts              # configuración de Auth.js
│   │   ├── context.ts           # resuelve usuario + organización + permisos  ← CLAVE
│   │   ├── repos/               # acceso a datos, siempre con orgId
│   │   ├── services/            # reglas de negocio
│   │   └── jobs/                # handlers de la cola
│   ├── components/
│   │   ├── ui/                  # shadcn
│   │   └── ...
│   ├── lib/
│   │   ├── permissions.ts
│   │   ├── money.ts             # todo importe en centavos, enteros
│   │   ├── templates.ts         # render de plantillas de documento
│   │   └── presets/             # presets por rubro (doc 06)
│   └── types/
├── docs/                        # esta serie
└── docker/                      # despliegue Fase 2 (doc 09)
```

**Regla estructural inviolable:** ningún componente de UI importa `prisma` directamente. Todo pasa por
`server/repos`. Es la única forma de garantizar que nunca se filtre data entre organizaciones.

---

## 4. Multi-tenancy: el punto crítico

Se usa **base de datos compartida con columna discriminadora**. Toda tabla de negocio tiene `orgId`.

### Por qué esta estrategia

| Estrategia | Veredicto |
|---|---|
| Base de datos por cliente | ❌ 200 bases que migrar en cada release. Inviable solo. |
| Esquema por cliente | ❌ Mismo problema, algo menos grave. |
| **Columna `orgId` compartida** | ✅ Una migración, un backup, una conexión. Estándar de la industria a esta escala. |

### Cómo se garantiza el aislamiento

Tres capas de defensa. Las tres, no una.

**Capa 1 — Contexto obligatorio.** Toda petición autenticada resuelve un contexto antes de tocar datos:

```ts
// src/server/context.ts
export type Ctx = {
  userId: string
  orgId: string
  role: Role
  permissions: Set<Permission>
}

// Lanza error si el usuario no es miembro activo de esa organización.
export async function requireCtx(orgSlug: string): Promise<Ctx>
```

**Capa 2 — Repositorios con scope.** Ninguna consulta se escribe sin `orgId`. Los repositorios reciben
el contexto, no parámetros sueltos:

```ts
// src/server/repos/jobs.ts
export const jobsRepo = {
  list: (ctx: Ctx, filters: JobFilters) =>
    db.job.findMany({ where: { orgId: ctx.orgId, ...toWhere(filters) } }),

  byId: async (ctx: Ctx, id: string) => {
    const job = await db.job.findFirst({ where: { id, orgId: ctx.orgId } })
    if (!job) throw new NotFoundError()   // nunca "forbidden": no revelar existencia
    return job
  },
}
```

**Capa 3 — Test de aislamiento automatizado.** Un test que crea dos organizaciones con datos y verifica
que ninguna consulta de la A devuelve nada de la B. Es el único test que **nunca** puede fallar.

> ⚠️ **La filtración de datos entre clientes es el único error que mata el negocio de forma
> irreversible.** Un bug de cálculo se corrige y se pide disculpas. Una filtración destruye la
> confianza y, según el país, genera responsabilidad legal. Por eso hay tres capas.

**Evolución futura:** cuando haya volumen, se puede activar Row Level Security de PostgreSQL como cuarta
capa sin cambiar el modelo de datos. Está previsto, no es urgente.

---

## 5. Permisos y roles

Cuatro roles por organización, con permisos derivados:

| Rol | Puede |
|---|---|
| `OWNER` | Todo, incluido facturación de la suscripción y eliminar la organización. Único e intransferible salvo por transferencia explícita. |
| `ADMIN` | Todo lo operativo y la configuración. No toca la suscripción. |
| `MEMBER` | Crea y edita trabajos, contactos, documentos. No cambia configuración ni ve reportes de dinero global. |
| `VIEWER` | Solo lectura. Útil para contadores externos y socios. |

Implementación: matriz explícita de permisos en `lib/permissions.ts`, no condicionales de rol
dispersos por el código.

```ts
// Un solo lugar donde vive la verdad sobre quién puede qué.
export const PERMISSIONS = {
  OWNER:  ['*'],
  ADMIN:  ['job:*', 'contact:*', 'doc:*', 'payment:*', 'config:*', 'report:*', 'member:*'],
  MEMBER: ['job:read', 'job:write', 'contact:read', 'contact:write', 'doc:read', 'doc:write',
           'payment:read', 'payment:write'],
  VIEWER: ['job:read', 'contact:read', 'doc:read', 'payment:read', 'report:read'],
} as const
```

---

## 6. Decisiones transversales que evitan dolor después

**Dinero.** Todo importe se guarda como **entero en la unidad mínima** (centavos) más un código de
moneda ISO. Nunca `float`. Nunca. Un helper `money.ts` centraliza formato y aritmética.

**Fechas.** Todo se guarda en UTC. Cada organización tiene su zona horaria y el formateo se hace en el
borde de la interfaz. Los recordatorios se calculan en la zona de la organización.

**Identificadores.** `cuid2` para IDs internos (no secuenciales, no revelan volumen de negocio).
Aparte, un **número secuencial por organización** para lo que el usuario ve (`OT-00042`), generado con
un contador transaccional por organización.

**Borrado.** Nada se borra de verdad. `archivedAt` en todas las entidades de negocio. El borrado real
solo existe para cumplir un pedido explícito de eliminación de datos.

**Auditoría.** Toda escritura sobre entidades sensibles (trabajos, documentos, pagos, configuración,
miembros) deja registro en `audit_log` con antes/después. Es lo que te salva cuando un cliente dice
"yo no cambié eso".

**Campos personalizados.** Se guardan en una columna `JSONB` (`customFields`) con definiciones en
`custom_field_def`. Sin tablas dinámicas, sin ALTER TABLE en runtime. Postgres indexa JSONB si hace
falta filtrar.

**Errores.** Clases de error propias (`NotFoundError`, `ForbiddenError`, `ValidationError`,
`LimitExceededError`) mapeadas a respuestas consistentes. Nunca exponer stack traces al cliente.

**Validación.** Zod en el borde de toda Server Action. Los tipos se derivan del esquema, no al revés.

---

## 7. Rendimiento: qué importa y qué no

A esta escala el rendimiento no es un problema, salvo en tres puntos que sí conviene resolver bien
desde el principio porque después duelen:

1. **Índices.** `(orgId, createdAt)`, `(orgId, statusId)`, `(orgId, contactId)` en `job`.
   Sin ellos, a los 50.000 trabajos la lista se arrastra.
2. **Paginación por cursor**, no por `offset`. `OFFSET 10000` escanea 10.000 filas.
3. **Evitar N+1.** Prisma lo permite fácilmente; se resuelve con `include` explícito en los
   repositorios y una revisión de queries antes de cada release.

Lo que **no** importa todavía: caché distribuida, CDN de datos, réplicas de lectura, optimización de
bundle más allá de lo que Next.js hace solo.

---

## 8. Seguridad mínima no negociable

| Punto | Implementación |
|---|---|
| Contraseñas | `argon2id`. Nunca bcrypt con costo bajo, nunca SHA. |
| Sesiones | Cookie `httpOnly`, `secure`, `sameSite=lax`. Expiración 30 días con renovación. |
| Limitación de intentos | Rate limit en login, registro, recuperación de clave y endpoints públicos. |
| Enlaces públicos | Token de 32 bytes aleatorios, revocable, con expiración opcional. No adivinable. |
| Subida de archivos | Lista blanca de tipos MIME, límite de tamaño por plan, nombre saneado, servidos por URL firmada. |
| Variables de entorno | Nunca en el repositorio. `.env.example` documentado, valores reales solo en el proveedor. |
| Backups | Diarios, automáticos, **con restauración probada** (ver documento 09). Un backup no probado no es un backup. |
| Dependencias | `npm audit` antes de cada release. Actualización mensual. |

---

## 9. Siguiente paso

Documento 03: el modelo de datos completo, con el esquema Prisma listo para copiar.

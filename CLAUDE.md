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
- **Tailwind:** usar los tokens (`bg-surface`, `text-fg-muted`, `border-border`),
  nunca colores crudos de Tailwind. El sistema tiene modo claro y oscuro.

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
```

---

## 7. Estado actual

**Terminado**
- Serie de documentación 00–10
- Esquema de datos completo (Prisma 7)
- 9 presets de rubro con contenido de marketing
- Landing: home con selector de rubro interactivo, 8 landings por rubro
  pre-renderizadas, precios, sitemap, robots, datos estructurados
- Sistema de diseño con modo claro/oscuro
- Auth: sesiones, argon2, límite de intentos, permisos, contexto multi-tenant

**En curso / siguiente**
- Registro con aplicación del preset
- Shell de la aplicación y tablero Kanban de trabajos
- Contactos, activos, catálogo
- Documentos, cobros, agenda, configuración
- Panel de administración y suscripciones

---

## 8. Qué NO hacer

- ❌ Agregar dependencias sin necesidad real. Cada una es mantenimiento futuro.
- ❌ Microservicios, Redis, GraphQL, Kubernetes, monorepo. Ver docs/02 §1.
- ❌ Construir funciones del backlog pospuesto (docs/05) antes de tener 20 clientes.
- ❌ Facturación fiscal, app móvil nativa, multi-idioma. Están fuera de alcance a propósito.
- ❌ Refactorizar algo que funciona porque "quedaría más lindo".
- ❌ Dejar trabajo a medias con un `// TODO`. Si se empieza, se termina.

---

## 9. Al terminar una tarea

1. `npm run build` tiene que pasar.
2. Si tocaste el esquema: `npx prisma migrate dev --name descripcion-corta`.
3. Actualizá la sección 7 de este archivo.
4. Si cambiaste una decisión de arquitectura, actualizá el documento de `docs/`
   correspondiente. **Documentación y código no pueden contradecirse.**

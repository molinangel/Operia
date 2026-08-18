# Operia

**SaaS multi-tenant de gestión operativa para negocios de servicios del mundo hispano.**

Trabajos, presupuestos que el cliente aprueba desde el celular, control de cobros y recordatorios por
WhatsApp. Un solo sistema que se configura a la medida de cada rubro sin escribir código.

---

## Arrancar en 4 pasos

```bash
cd operia
npm install
cp .env.example .env.local     # completar DATABASE_URL y AUTH_SECRET
npm run db:migrate             # crear las tablas
npm run db:seed                # cargar los planes
npm run dev                    # http://localhost:3000
```

Qué cuenta abrir y de dónde sale cada credencial:
**[docs/10-checklist-cuentas-y-tokens.md](docs/10-checklist-cuentas-y-tokens.md)** — unos 25 minutos.

---

## Documentación

La serie completa está en [`docs/`](docs/) y es la fuente de verdad del proyecto.
Si el código y un documento se contradicen, uno de los dos está mal y hay que corregirlo.

| # | Documento | Qué responde |
|---|---|---|
| 00 | [Panorama de oportunidades](docs/00-panorama-de-oportunidades.md) | Por qué este producto y no otro |
| 01 | [Producto y alcance](docs/01-producto-y-alcance.md) | Qué es, para quién, qué queda afuera |
| 02 | [Arquitectura y stack](docs/02-arquitectura-y-stack.md) | Cómo está construido y por qué así |
| 03 | [Modelo de datos](docs/03-modelo-de-datos.md) | El esquema y las reglas de negocio |
| 04 | [Especificación funcional](docs/04-especificacion-funcional.md) | Qué hace cada pantalla |
| 05 | [Plan de construcción](docs/05-plan-de-construccion.md) | Qué se hace cada semana |
| 06 | [Presets por rubro](docs/06-presets-por-rubro.md) | El mecanismo "a medida" |
| 07 | [Precios y cobro](docs/07-precios-y-cobro.md) | Planes y cómo se cobra desde Venezuela |
| 08 | [Go-to-market y SEO](docs/08-go-to-market-y-seo.md) | Cómo se consiguen los clientes |
| 09 | [Despliegue y operación](docs/09-despliegue-y-operacion.md) | Producción, respaldos, incidentes |
| 10 | [Checklist de cuentas](docs/10-checklist-cuentas-y-tokens.md) | Lo único que hay que hacer a mano |

Para asistentes de IA: **[AGENTS.md](AGENTS.md)** tiene el contexto y las reglas del proyecto.

---

## Stack

**Next.js 16** (App Router) · **TypeScript** · **Tailwind CSS v4** · **PostgreSQL** (Supabase) ·
**Prisma 7** · autenticación propia con argon2id · despliegue en **Vercel**.

Sin Redis, sin microservicios, sin GraphQL. Las razones están en
[docs/02](docs/02-arquitectura-y-stack.md).

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Desarrollo en http://localhost:3000 |
| `npm run build` | Build de producción |
| `npm run db:migrate` | Crear y aplicar una migración |
| `npm run db:deploy` | Aplicar migraciones en producción |
| `npm run db:seed` | Cargar los planes de suscripción |
| `npm run db:studio` | Explorador visual de la base |
| `npm run lint` | Revisión estática |

---

## Estructura

```
Proyecto/
├── AGENTS.md          contexto para asistentes de IA
├── docs/              la serie 00–10
└── operia/            la aplicación
    ├── prisma/        esquema y migraciones
    └── src/
        ├── app/
        │   ├── (marketing)/   landing pública y landings por rubro (SEO)
        │   ├── (auth)/        registro, login, recuperación
        │   ├── app/[org]/     la aplicación
        │   ├── p/             portal público sin login
        │   └── admin/         panel del operador
        ├── components/
        ├── lib/               código sin dependencias de servidor
        └── server/            solo servidor: db, auth, contexto, repos, servicios
```

---

## Las tres reglas que no se rompen

1. **Ninguna consulta sin `orgId`.** Todo pasa por `requireCtx()` y por un repositorio.
   Una filtración de datos entre clientes termina el negocio.
2. **El dinero se guarda en centavos enteros.** Nunca `float`.
3. **Nada se borra.** Ni por pedido, ni por falta de pago. Se archiva.

El resto está en [AGENTS.md](AGENTS.md) §4.

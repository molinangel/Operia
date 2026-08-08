# 11 — Patrones tomados de SH (Sistema Hotelero)

> SH es un ERP/PMS hotelero del mismo autor, construido sobre Supabase, que ya
> está en uso. Tiene decisiones de ingeniería mejores que las de Operia en varios
> puntos. Este documento registra **qué se adoptó, qué se descartó y por qué** —
> para que nadie tenga que volver a discutirlo, ni repetir el análisis.

---

## Lo que se adoptó

### 1. Las invariantes viven en la base de datos, no en el código

**Cómo lo hace SH.** Las reglas críticas están como restricciones de Postgres:
`CHECK (fecha_salida > fecha_entrada)`, `CHECK (importe_pagado <= importe_total)`,
descuentos acotados entre 0 y 100.

**Por qué importa.** Una regla que la aplicación *recuerda* cumplir es una regla
que algún día se rompe: por un bug, por un script de migración, por una IA
escribiendo directo contra la base, por un endpoint nuevo que olvidó validar. Una
restricción de Postgres no se puede violar por ningún camino.

**Cómo quedó en Operia.** Migración `20260808040000`, 16 restricciones:

| Ámbito | Invariante |
|---|---|
| Agenda | `endsAt > startsAt` |
| Dinero | importe de pago mayor que cero; tasa de cambio positiva; un pago no puede reversarse a sí mismo |
| Cotizaciones | tasa positiva; la moneda cotizada no puede ser la moneda base |
| Líneas | cantidad mayor que cero; precio no negativo; impuesto y descuento entre 0 y 100 |
| Trabajos | ningún importe negativo |
| Contadores | numeración nunca negativa |

Verificable con `npx tsx scripts/verify-db-invariants.ts`, que **intenta violarlas
a propósito** saltándose la capa de servicios.

---

### 2. Anti-solape con `EXCLUDE USING gist`

**Cómo lo hace SH.** La pieza más valiosa de todo el proyecto:

```sql
EXCLUDE USING gist (
  room_id WITH =,
  tstzrange(fecha_entrada, fecha_salida, '[)') WITH &&
)
```

Impide vender la misma habitación dos veces. La mayoría de los sistemas hace esto
con un `SELECT` previo desde la aplicación, y entre esa consulta y el `INSERT` hay
una ventana en la que otro usuario inserta. Con volumen bajo no se nota; con dos
recepcionistas trabajando a la vez, sí.

**Cómo quedó en Operia.** El mismo problema existe en la agenda: la misma persona
no puede estar citada en dos lugares al mismo tiempo.

```sql
ALTER TABLE "appointment"
  ADD CONSTRAINT excl_appointment_no_solape
  EXCLUDE USING gist (
    "orgId" WITH =, "assignedToId" WITH =,
    tsrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE ("assignedToId" IS NOT NULL AND "archivedAt" IS NULL
         AND "status" IN ('SCHEDULED', 'CONFIRMED'));
```

Tres diferencias deliberadas respecto de SH:

- **Alcanzada por `orgId`**, porque Operia es multi-tenant y SH no.
- **Parcial**: solo aplica a citas vigentes con responsable asignado. Las
  canceladas, las que no asistieron y las sin asignar pueden superponerse. Una
  restricción demasiado rígida se termina desactivando.
- **`tsrange` y no `tstzrange`**, porque Prisma mapea `DateTime` a `timestamp(3)`
  sin zona. Convertir dentro del índice dependería del huso de la sesión y
  Postgres lo rechaza por no ser inmutable. Es correcto igual: la regla 4 del
  proyecto obliga a guardar todo en UTC.

> SH declara sus columnas como `TIMESTAMPTZ`, que es más explícito y sería
> mejor. No se cambió en Operia para no tener dos criterios de fecha conviviendo
> en el mismo esquema, que sería peor que la ganancia.

---

### 3. Registro de dinero append-only, con reverso

**Cómo lo hace SH.** El libro contable es inmutable. Un asiento equivocado no se
edita ni se borra: se crea un asiento inverso (`ledger-reverse`).

**Por qué importa.** Si un registro de dinero se puede modificar, el historial
deja de ser prueba de nada. Cuando un cliente discute un saldo, lo único que
cierra la discusión es mostrar cada movimiento con su fecha, su autor y su motivo.

**Cómo quedó en Operia.** `Payment` perdió `archivedAt` y ganó `reversesId`:

- Los pagos **no se editan ni se archivan**. `updatePayment()` existe solo para
  lanzar un error explicativo si alguien lo intenta.
- Anular exige **motivo escrito**. Sin motivo, el historial no sirve.
- Un reverso conserva la **tasa de cambio original**, no la de hoy. Reconvertir
  con la tasa actual dejaría una diferencia en la caja.
- Un pago se anula una sola vez (`reversesId` es `@unique`), y una anulación no
  se puede anular.
- **Efecto secundario bueno:** el saldo es entradas menos salidas. Ya no hay que
  acordarse de filtrar por archivado en cada consulta, que es justo el filtro que
  algún día alguien olvida.

---

### 4. Moneda base con tasa histórica

**Cómo lo hace SH.** Tabla de cotizaciones, moneda base configurable, cron diario
que sincroniza la tasa del BCV, y un fallback para cobros históricos.

**Por qué importa.** Es *el* problema del mercado venezolano y de cualquier
economía con inflación: el negocio cobra en varias monedas y la tasa cambia todos
los días. Si un cobro de hace tres meses se reconvierte con la tasa de hoy, la
caja no cuadra nunca.

**Cómo quedó en Operia.** Modelo `ExchangeRate` con serie histórica por
organización, y en cada pago se guarda **calculado** el importe en moneda base
junto con la tasa aplicada. Nunca se recalcula.

Si no hay cotización para esa fecha, el importe base queda en `null`. Es
deliberado: **un dato faltante y visible es mejor que un número inventado.**

---

## Lo que se descartó, y por qué

### Row Level Security en Postgres

SH aplica la seguridad en la base con políticas RLS y un helper `has_role()`. Es
más fuerte que hacerlo en la aplicación: aunque se filtre la clave anónima, las
políticas siguen valiendo.

**No se adopta ahora.** Operia usa Prisma contra el pooler de Supabase en modo
transaccional. RLS necesita fijar una variable de sesión por petición, y con un
pooler que reasigna conexiones entre transacciones eso es frágil: una conexión
reutilizada con la variable de otra petición es exactamente el tipo de bug que
causa una filtración entre clientes — el mismo problema que RLS venía a resolver.

Operia lo cubre con tres capas en la aplicación (`requireCtx`, repositorios con
`orgId` obligatorio, y un test de aislamiento). Está verificado.

**Cuándo revisarlo:** si en algún momento se deja de usar el pooler, o se pasa a
una conexión por petición. Anotado, no olvidado.

### Cálculo del panel de inicio en una función SQL

SH resuelve su dashboard con una función de base de datos. Operia usa cinco
consultas en `Promise.all`.

**No se adopta.** Al ir en paralelo, las cinco consultas cuestan una sola ida y
vuelta de latencia, no cinco. La ganancia real sería el consumo de conexiones del
pool, que hoy no es un problema. Además el historial de SH muestra una migración
`fix_dashboard_rpc`, señal de que mantener lógica de presentación en SQL tiene su
costo.

**Cuándo revisarlo:** si el pool se satura, o si el panel supera los 800 ms.

### Identificadores secuenciales

SH usa `BIGSERIAL`. Operia usa `cuid2`, que no revela volumen de negocio ni
permite enumerar registros ajenos probando números. En un sistema de un solo
hotel es menor; en uno multi-tenant es una diferencia real. **Operia se queda con
lo suyo.**

---

## Lo que falta traer

Pendiente de SH, ordenado por valor:

1. **Manuales de usuario por rol dentro de la aplicación** (`docs/manuales/` en
   SH, integrados en la plataforma). Es la palanca más grande para bajar la carga
   de soporte, que es el riesgo número uno de operar esto solo.
2. **Migraciones periódicas de endurecimiento de seguridad.** El historial de SH
   muestra pasadas explícitas (`security_hardening_views_funcs`,
   `security_revoke_anon_rpc`). Es una práctica, no una función: revisar y
   corregir, con fecha.
3. **Cierre de caja y conciliación bancaria.** SH los tiene; para Operia son
   Fase 3, cuando algún cliente los pida.

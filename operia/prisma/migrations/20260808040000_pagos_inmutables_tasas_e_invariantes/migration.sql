-- AlterTable
ALTER TABLE "payment" DROP COLUMN "archivedAt",
ADD COLUMN     "baseAmountCents" INTEGER,
ADD COLUMN     "reversesId" TEXT;

-- CreateTable
CREATE TABLE "exchange_rate" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "rate" DECIMAL(18,6) NOT NULL,
    "effectiveOn" DATE NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_rate_orgId_effectiveOn_idx" ON "exchange_rate"("orgId", "effectiveOn");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_orgId_currency_effectiveOn_key" ON "exchange_rate"("orgId", "currency", "effectiveOn");

-- CreateIndex
CREATE UNIQUE INDEX "payment_reversesId_key" ON "payment"("reversesId");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_reversesId_fkey" FOREIGN KEY ("reversesId") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rate" ADD CONSTRAINT "exchange_rate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ════════════════════════════════════════════════════════════════════
--  INVARIANTES EN LA BASE DE DATOS
--
--  Patrón tomado de SH (proyecto hermano). La idea: una regla que la
--  aplicación "recuerda" cumplir es una regla que algún día se va a
--  romper — por un bug, por un script, por una IA escribiendo directo
--  contra la base. Una restricción de Postgres no se puede violar.
--
--  Prisma no modela CHECK ni EXCLUDE, así que van escritas a mano acá.
--  Si se agregan campos al esquema, revisar si merecen su invariante.
-- ════════════════════════════════════════════════════════════════════

-- Necesaria para combinar igualdad de texto con rangos en un índice GiST.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ── Agenda ──────────────────────────────────────────────────────────

ALTER TABLE "appointment"
  ADD CONSTRAINT chk_appointment_rango
  CHECK ("endsAt" > "startsAt");

/*
  Anti-solape de agenda.

  Es la pieza que más vale la pena copiar de SH: allá impide que dos
  recepcionistas vendan la misma habitación a la vez; acá impide que la
  misma persona quede citada en dos lugares al mismo tiempo.

  Validarlo con un SELECT previo desde la aplicación no alcanza: entre la
  consulta y el INSERT hay una ventana en la que otro usuario inserta. La
  restricción cierra esa ventana a nivel de motor.

  Solo aplica a citas vigentes y con responsable asignado. Las canceladas,
  las que no asistieron y las sin asignar pueden superponerse libremente.

  Se usa `tsrange` y no `tstzrange` porque Prisma mapea DateTime a
  `timestamp(3)` sin zona. Convertir a `timestamptz` dentro del índice
  dependería del huso de la sesión y Postgres lo rechaza por no ser
  inmutable. Es correcto igual: la regla 4 del proyecto obliga a guardar
  todo en UTC, así que la comparación se hace sobre el mismo huso.

  SH declara esas columnas como TIMESTAMPTZ, que es más explícito. Acá se
  mantiene el tipo de Prisma para no tener dos criterios de fecha conviviendo
  en el mismo esquema, que sería peor que la ganancia.
*/
ALTER TABLE "appointment"
  ADD CONSTRAINT excl_appointment_no_solape
  EXCLUDE USING gist (
    "orgId" WITH =,
    "assignedToId" WITH =,
    tsrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE (
    "assignedToId" IS NOT NULL
    AND "archivedAt" IS NULL
    AND "status" IN ('SCHEDULED', 'CONFIRMED')
  );

-- ── Dinero ──────────────────────────────────────────────────────────

ALTER TABLE "payment"
  ADD CONSTRAINT chk_payment_monto_positivo CHECK ("amountCents" > 0),
  ADD CONSTRAINT chk_payment_base_positivo
    CHECK ("baseAmountCents" IS NULL OR "baseAmountCents" >= 0),
  ADD CONSTRAINT chk_payment_tasa_positiva
    CHECK ("exchangeRate" IS NULL OR "exchangeRate" > 0),
  -- Un pago no puede reversarse a sí mismo.
  ADD CONSTRAINT chk_payment_reverso_distinto
    CHECK ("reversesId" IS NULL OR "reversesId" <> "id");

ALTER TABLE "exchange_rate"
  ADD CONSTRAINT chk_exchange_rate_positiva CHECK ("rate" > 0),
  ADD CONSTRAINT chk_exchange_rate_monedas
    CHECK ("currency" <> "baseCurrency");

-- ── Líneas de trabajo ───────────────────────────────────────────────

ALTER TABLE "job_item"
  ADD CONSTRAINT chk_job_item_cantidad CHECK ("quantity" > 0),
  ADD CONSTRAINT chk_job_item_precio CHECK ("unitPriceCents" >= 0),
  ADD CONSTRAINT chk_job_item_impuesto CHECK ("taxRate" BETWEEN 0 AND 100),
  ADD CONSTRAINT chk_job_item_descuento CHECK ("discountPct" BETWEEN 0 AND 100);

ALTER TABLE "job"
  ADD CONSTRAINT chk_job_importes
    CHECK (
      "subtotalCents" >= 0 AND "taxCents" >= 0
      AND "discountCents" >= 0 AND "totalCents" >= 0
      AND "paidCents" >= 0
    );

ALTER TABLE "product"
  ADD CONSTRAINT chk_product_importes
    CHECK ("priceCents" >= 0 AND "costCents" >= 0)
  ;

ALTER TABLE "plan"
  ADD CONSTRAINT chk_plan_precio CHECK ("priceCents" >= 0);

-- ── Contadores de numeración visible ────────────────────────────────

ALTER TABLE "organization"
  ADD CONSTRAINT chk_organization_contadores
    CHECK ("jobCounter" >= 0 AND "docCounter" >= 0);

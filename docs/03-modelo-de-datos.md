# 03 — Modelo de datos

> Este documento es la **fuente de verdad** del sistema. El esquema Prisma de abajo se copia tal cual a
> `prisma/schema.prisma`. Si algo del código contradice este documento, el documento gana o se actualiza.

---

## 1. Mapa de entidades

```
                        ┌──────────────┐
                        │ Organization │  ← el tenant. TODO cuelga de acá.
                        └──────┬───────┘
        ┌──────────────┬───────┼────────────┬──────────────┬───────────────┐
        ▼              ▼       ▼            ▼              ▼               ▼
   Membership     Contact    Product   JobStatus   CustomFieldDef   DocumentTemplate
        │              │                    │
        ▼              ▼                    │
      User          Asset                   │
                       │                    │
                       └────────┐   ┌───────┘
                                ▼   ▼
                            ┌─────────┐
                            │   Job   │  ← el corazón del sistema
                            └────┬────┘
              ┌──────────┬───────┼────────┬──────────┬──────────┐
              ▼          ▼       ▼        ▼          ▼          ▼
          JobItem   Appointment Document Payment  Activity  Attachment

    Transversales: AuditLog · QueuedJob · OutboundMessage · Subscription · SubscriptionPayment
```

---

## 2. Convenciones

| Convención | Regla |
|---|---|
| **Identificadores** | `cuid2` en todas las tablas. Nunca autoincremental expuesto. |
| **Tenant** | Toda tabla de negocio tiene `orgId` con índice. Sin excepción. |
| **Dinero** | Entero en centavos (`Int`) + `currency` en el padre. Nunca `Float`/`Decimal` para importes. |
| **Fechas** | `DateTime` en UTC. La zona horaria vive en `Organization.timezone`. |
| **Borrado** | `archivedAt DateTime?`. Se filtra en los repositorios. |
| **Campos personalizados** | `customFields Json` + definiciones en `CustomFieldDef`. |
| **Numeración visible** | `code String` secuencial por organización (`OT-00042`), generado transaccionalmente. |
| **Nombres** | Tablas en `snake_case` vía `@@map`, modelos en `PascalCase`, campos en `camelCase`. |

---

## 3. Esquema Prisma completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════════
// IDENTIDAD Y TENANT
// ═══════════════════════════════════════════════════════════════

model User {
  id             String       @id @default(cuid())
  email          String       @unique
  name           String?
  passwordHash   String?
  emailVerified  DateTime?
  image          String?
  lastLoginAt    DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  memberships    Membership[]
  sessions       Session[]

  @@map("user")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  purpose    String   // "email_verify" | "password_reset" | "magic_link"

  @@unique([identifier, token])
  @@map("verification_token")
}

model Organization {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique          // usado en la URL: /acme/trabajos
  industryKey   String   @default("generic") // preset aplicado (doc 06)
  currency      String   @default("USD")   // ISO 4217
  timezone      String   @default("America/Caracas")
  locale        String   @default("es")

  // Marca (aparece en documentos y portal público)
  logoKey       String?
  brandColor    String   @default("#0F172A")
  legalName     String?
  taxId         String?
  address       String?
  phone         String?
  email         String?

  // Vocabulario personalizable — la palanca "a medida"
  jobLabelSingular String @default("Trabajo")
  jobLabelPlural   String @default("Trabajos")
  assetLabelSingular String @default("Activo")
  assetLabelPlural   String @default("Activos")

  // Contadores de numeración visible
  jobCounter    Int      @default(0)
  docCounter    Int      @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  archivedAt    DateTime?

  memberships   Membership[]
  invitations   Invitation[]
  contacts      Contact[]
  assets        Asset[]
  jobs          Job[]
  jobStatuses   JobStatus[]
  products      Product[]
  documents     Document[]
  documentTemplates DocumentTemplate[]
  payments      Payment[]
  appointments  Appointment[]
  customFields  CustomFieldDef[]
  activities    Activity[]
  attachments   Attachment[]
  auditLogs     AuditLog[]
  outbound      OutboundMessage[]
  notificationRules NotificationRule[]
  subscription  Subscription?

  @@map("organization")
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Membership {
  id        String   @id @default(cuid())
  userId    String
  orgId     String
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
  archivedAt DateTime?

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([userId, orgId])
  @@index([orgId])
  @@map("membership")
}

model Invitation {
  id         String   @id @default(cuid())
  orgId      String
  email      String
  role       Role     @default(MEMBER)
  token      String   @unique
  expiresAt  DateTime
  acceptedAt DateTime?
  createdAt  DateTime @default(now())

  org        Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId])
  @@map("invitation")
}

// ═══════════════════════════════════════════════════════════════
// CRM: CONTACTOS Y ACTIVOS
// ═══════════════════════════════════════════════════════════════

enum ContactKind {
  PERSON
  COMPANY
}

model Contact {
  id           String      @id @default(cuid())
  orgId        String
  kind         ContactKind @default(PERSON)
  name         String
  email        String?
  phone        String?      // E.164 recomendado: +584121234567
  taxId        String?
  address      String?
  notes        String?
  tags         String[]     @default([])
  isSupplier   Boolean      @default(false)
  customFields Json         @default("{}")
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  archivedAt   DateTime?

  org          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  assets       Asset[]
  jobs         Job[]
  documents    Document[]
  payments     Payment[]
  appointments Appointment[]

  @@index([orgId, name])
  @@index([orgId, phone])
  @@index([orgId, archivedAt])
  @@map("contact")
}

/// El "objeto" sobre el que se trabaja: vehículo, mascota, equipo, inmueble, expediente físico.
/// Es lo que hace que el sistema se sienta del rubro sin escribir código nuevo.
model Asset {
  id           String   @id @default(cuid())
  orgId        String
  contactId    String?
  label        String                 // "Toyota Corolla 2018" / "Firulais" / "Compresor #3"
  identifier   String?                // patente, chip, número de serie
  kind         String   @default("generic")
  notes        String?
  customFields Json     @default("{}")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  archivedAt   DateTime?

  org          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  contact      Contact?     @relation(fields: [contactId], references: [id], onDelete: SetNull)
  jobs         Job[]

  @@index([orgId, contactId])
  @@index([orgId, identifier])
  @@map("asset")
}

// ═══════════════════════════════════════════════════════════════
// EL CORAZÓN: TRABAJOS
// ═══════════════════════════════════════════════════════════════

/// Categoría técnica del estado. El NOMBRE lo pone el cliente; la categoría permite
/// que los reportes y automatismos funcionen sin importar cómo lo llame cada uno.
enum StatusKind {
  OPEN
  IN_PROGRESS
  WAITING
  DONE
  CANCELLED
}

model JobStatus {
  id        String     @id @default(cuid())
  orgId     String
  name      String                        // "Esperando repuesto", "En cabina de pintura"
  kind      StatusKind @default(OPEN)
  color     String     @default("#64748B")
  position  Int        @default(0)
  isDefault Boolean    @default(false)    // estado inicial al crear
  archivedAt DateTime?

  org       Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  jobs      Job[]

  @@index([orgId, position])
  @@map("job_status")
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

model Job {
  id           String   @id @default(cuid())
  orgId        String
  code         String                    // "OT-00042" — visible, secuencial por org
  title        String
  description  String?
  contactId    String?
  assetId      String?
  statusId     String
  priority     Priority @default(NORMAL)
  assignedToId String?                   // userId del responsable

  scheduledAt  DateTime?
  dueAt        DateTime?
  startedAt    DateTime?
  completedAt  DateTime?

  // Totales calculados desde JobItem — se recalculan en cada cambio, nunca se editan a mano
  subtotalCents Int     @default(0)
  taxCents      Int     @default(0)
  discountCents Int     @default(0)
  totalCents    Int     @default(0)
  paidCents     Int     @default(0)      // suma de Payment asociados

  customFields Json     @default("{}")
  publicToken  String?  @unique          // link para que el cliente vea el estado
  createdById  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  archivedAt   DateTime?

  org          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  contact      Contact?     @relation(fields: [contactId], references: [id], onDelete: SetNull)
  asset        Asset?       @relation(fields: [assetId], references: [id], onDelete: SetNull)
  status       JobStatus    @relation(fields: [statusId], references: [id])
  items        JobItem[]
  documents    Document[]
  payments     Payment[]
  appointments Appointment[]

  @@unique([orgId, code])
  @@index([orgId, statusId])
  @@index([orgId, contactId])
  @@index([orgId, assignedToId])
  @@index([orgId, createdAt])
  @@index([orgId, archivedAt])
  @@map("job")
}

model JobItem {
  id            String   @id @default(cuid())
  orgId         String
  jobId         String
  productId     String?
  description   String
  quantity      Decimal  @default(1) @db.Decimal(12, 3)
  unitPriceCents Int     @default(0)
  taxRate       Decimal  @default(0) @db.Decimal(5, 2)   // porcentaje: 16.00
  discountPct   Decimal  @default(0) @db.Decimal(5, 2)
  totalCents    Int      @default(0)
  position      Int      @default(0)
  createdAt     DateTime @default(now())

  job           Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  product       Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([jobId])
  @@index([orgId])
  @@map("job_item")
}

// ═══════════════════════════════════════════════════════════════
// CATÁLOGO
// ═══════════════════════════════════════════════════════════════

enum ProductKind {
  SERVICE
  GOOD
}

model Product {
  id          String      @id @default(cuid())
  orgId       String
  sku         String?
  name        String
  description String?
  kind        ProductKind @default(SERVICE)
  priceCents  Int         @default(0)
  costCents   Int         @default(0)
  taxRate     Decimal     @default(0) @db.Decimal(5, 2)
  trackStock  Boolean     @default(false)
  stockQty    Decimal     @default(0) @db.Decimal(12, 3)
  stockMin    Decimal     @default(0) @db.Decimal(12, 3)
  customFields Json       @default("{}")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  archivedAt  DateTime?

  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  jobItems    JobItem[]

  @@index([orgId, name])
  @@unique([orgId, sku])
  @@map("product")
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENTOS
// ═══════════════════════════════════════════════════════════════

enum DocumentKind {
  QUOTE          // presupuesto
  WORK_ORDER     // orden de trabajo
  RECEIPT        // recibo de pago
  DELIVERY_NOTE  // remito / nota de entrega
  CERTIFICATE    // certificado de servicio
  REPORT         // informe
}

enum DocumentStatus {
  DRAFT
  SENT
  VIEWED
  APPROVED
  REJECTED
  VOID
}

model DocumentTemplate {
  id          String       @id @default(cuid())
  orgId       String
  kind        DocumentKind
  name        String
  bodyHtml    String       @db.Text     // plantilla con variables {{job.code}}, {{contact.name}}...
  isDefault   Boolean      @default(false)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  archivedAt  DateTime?

  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  documents   Document[]

  @@index([orgId, kind])
  @@map("document_template")
}

model Document {
  id           String         @id @default(cuid())
  orgId        String
  templateId   String?
  jobId        String?
  contactId    String?
  kind         DocumentKind
  number       String                          // "PRE-00017"
  status       DocumentStatus @default(DRAFT)
  issuedAt     DateTime       @default(now())
  validUntil   DateTime?
  currency     String         @default("USD")
  totalCents   Int            @default(0)

  /// HTML congelado en el momento de emisión. Si mañana cambia la plantilla,
  /// el documento que el cliente recibió no cambia. Esto es innegociable.
  snapshotHtml String         @db.Text
  pdfKey       String?                         // objeto en S3/R2
  publicToken  String         @unique
  viewedAt     DateTime?
  respondedAt  DateTime?
  createdById  String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  archivedAt   DateTime?

  org          Organization      @relation(fields: [orgId], references: [id], onDelete: Cascade)
  template     DocumentTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  job          Job?              @relation(fields: [jobId], references: [id], onDelete: SetNull)
  contact      Contact?          @relation(fields: [contactId], references: [id], onDelete: SetNull)

  @@unique([orgId, number])
  @@index([orgId, kind, status])
  @@index([orgId, jobId])
  @@map("document")
}

// ═══════════════════════════════════════════════════════════════
// COBROS (control interno, sin fiscalidad de ningún país)
// ═══════════════════════════════════════════════════════════════

enum PaymentDirection {
  IN      // el cliente nos paga
  OUT     // devolución
}

model Payment {
  id          String           @id @default(cuid())
  orgId       String
  contactId   String?
  jobId       String?
  direction   PaymentDirection @default(IN)
  amountCents Int
  currency    String           @default("USD")
  method      String                          // "efectivo" | "transferencia" | "zelle" | "usdt" | ...
  reference   String?                         // número de operación
  paidAt      DateTime         @default(now())
  notes       String?
  createdById String?
  createdAt   DateTime         @default(now())
  archivedAt  DateTime?

  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  contact     Contact?     @relation(fields: [contactId], references: [id], onDelete: SetNull)
  job         Job?         @relation(fields: [jobId], references: [id], onDelete: SetNull)

  @@index([orgId, paidAt])
  @@index([orgId, contactId])
  @@index([orgId, jobId])
  @@map("payment")
}

// ═══════════════════════════════════════════════════════════════
// AGENDA
// ═══════════════════════════════════════════════════════════════

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  DONE
  NO_SHOW
  CANCELLED
}

model Appointment {
  id           String            @id @default(cuid())
  orgId        String
  jobId        String?
  contactId    String?
  title        String
  location     String?
  startsAt     DateTime
  endsAt       DateTime
  assignedToId String?
  status       AppointmentStatus @default(SCHEDULED)
  notes        String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  archivedAt   DateTime?

  org          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  job          Job?         @relation(fields: [jobId], references: [id], onDelete: SetNull)
  contact      Contact?     @relation(fields: [contactId], references: [id], onDelete: SetNull)

  @@index([orgId, startsAt])
  @@index([orgId, assignedToId, startsAt])
  @@map("appointment")
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURABILIDAD
// ═══════════════════════════════════════════════════════════════

enum CustomFieldEntity {
  CONTACT
  ASSET
  JOB
  PRODUCT
}

enum CustomFieldType {
  TEXT
  MULTILINE
  NUMBER
  DATE
  BOOLEAN
  SELECT
  MULTISELECT
}

model CustomFieldDef {
  id         String            @id @default(cuid())
  orgId      String
  entity     CustomFieldEntity
  key        String                        // clave en el JSON: "patente"
  label      String                        // etiqueta visible: "Patente"
  type       CustomFieldType   @default(TEXT)
  options    Json              @default("[]")  // para SELECT/MULTISELECT
  required   Boolean           @default(false)
  showInList Boolean           @default(false) // ¿aparece como columna en la tabla?
  position   Int               @default(0)
  archivedAt DateTime?

  org        Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@unique([orgId, entity, key])
  @@index([orgId, entity, position])
  @@map("custom_field_def")
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE, ARCHIVOS Y AUDITORÍA
// ═══════════════════════════════════════════════════════════════

/// Timeline visible para el usuario: "Juan cambió el estado a Listo".
model Activity {
  id         String   @id @default(cuid())
  orgId      String
  entityType String                 // "job" | "contact" | "document"
  entityId   String
  type       String                 // "created" | "status_changed" | "note" | "message_sent"
  message    String
  meta       Json     @default("{}")
  userId     String?
  createdAt  DateTime @default(now())

  org        Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId, entityType, entityId, createdAt])
  @@map("activity")
}

model Attachment {
  id           String   @id @default(cuid())
  orgId        String
  entityType   String
  entityId     String
  fileName     String
  mimeType     String
  sizeBytes    Int
  storageKey   String                 // clave en S3/R2
  uploadedById String?
  createdAt    DateTime @default(now())
  archivedAt   DateTime?

  org          Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId, entityType, entityId])
  @@map("attachment")
}

/// Registro técnico inmutable. Distinto de Activity: esto es para vos, no para el usuario.
model AuditLog {
  id         String   @id @default(cuid())
  orgId      String
  userId     String?
  action     String                 // "job.update" | "member.remove" | "payment.delete"
  entityType String
  entityId   String
  before     Json?
  after      Json?
  ip         String?
  userAgent  String?
  createdAt  DateTime @default(now())

  org        Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId, createdAt])
  @@index([orgId, entityType, entityId])
  @@map("audit_log")
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICACIONES Y COLA DE TRABAJOS
// ═══════════════════════════════════════════════════════════════

enum Channel {
  EMAIL
  WHATSAPP
  INTERNAL
}

model NotificationRule {
  id            String   @id @default(cuid())
  orgId         String
  event         String              // "appointment.reminder" | "job.completed" | "quote.sent"
  channel       Channel  @default(WHATSAPP)
  offsetMinutes Int      @default(0)  // negativo = antes del evento
  bodyTemplate  String   @db.Text
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())

  org           Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([orgId, event])
  @@map("notification_rule")
}

enum MessageStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

model OutboundMessage {
  id          String        @id @default(cuid())
  orgId       String
  channel     Channel
  toAddress   String                        // email o teléfono E.164
  subject     String?
  body        String        @db.Text
  status      MessageStatus @default(PENDING)
  scheduledAt DateTime      @default(now())
  sentAt      DateTime?
  error       String?
  attempts    Int           @default(0)
  entityType  String?
  entityId    String?
  createdAt   DateTime      @default(now())

  org         Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([status, scheduledAt])
  @@index([orgId, createdAt])
  @@map("outbound_message")
}

/// Cola genérica procesada por /api/cron/tick. Reemplaza a Redis/BullMQ a esta escala.
model QueuedJob {
  id          String        @id @default(cuid())
  kind        String                        // "send_message" | "generate_pdf" | "check_dunning"
  payload     Json
  status      MessageStatus @default(PENDING)
  runAt       DateTime      @default(now())
  attempts    Int           @default(0)
  maxAttempts Int           @default(5)
  lockedAt    DateTime?
  error       String?
  createdAt   DateTime      @default(now())

  @@index([status, runAt])
  @@map("queued_job")
}

// ═══════════════════════════════════════════════════════════════
// SUSCRIPCIONES DEL SAAS (tu ingreso)
// ═══════════════════════════════════════════════════════════════

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  SUSPENDED
  CANCELLED
}

model Plan {
  code           String   @id           // "starter" | "pro" | "business"
  name           String
  priceCents     Int
  currency       String   @default("USD")
  maxUsers       Int
  maxJobsMonth   Int
  maxStorageMb   Int
  features       Json     @default("[]")  // ["whatsapp_api", "custom_domain", ...]
  active         Boolean  @default(true)
  position       Int      @default(0)

  subscriptions  Subscription[]

  @@map("plan")
}

model Subscription {
  id               String             @id @default(cuid())
  orgId            String             @unique
  planCode         String
  status           SubscriptionStatus @default(TRIAL)
  seats            Int                @default(1)
  trialEndsAt      DateTime?
  currentPeriodEnd DateTime?
  cancelAt         DateTime?
  provider         String             @default("manual") // "manual"|"stripe"|"paypal"|"crypto"|...
  providerRef      String?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  org              Organization @relation(fields: [orgId], references: [id], onDelete: Cascade)
  plan             Plan         @relation(fields: [planCode], references: [code])
  payments         SubscriptionPayment[]

  @@index([status, currentPeriodEnd])
  @@map("subscription")
}

enum SubPaymentStatus {
  PENDING
  CONFIRMED
  REJECTED
}

/// Pago de la suscripción. Con provider="manual", el cliente sube el comprobante
/// y vos lo confirmás desde el panel de administración. Ver documento 07.
model SubscriptionPayment {
  id             String           @id @default(cuid())
  subscriptionId String
  orgId          String
  amountCents    Int
  currency       String           @default("USD")
  provider       String
  reference      String?
  proofKey       String?                        // comprobante subido por el cliente
  status         SubPaymentStatus @default(PENDING)
  periodStart    DateTime
  periodEnd      DateTime
  confirmedAt    DateTime?
  confirmedById  String?
  notes          String?
  createdAt      DateTime         @default(now())

  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([orgId, createdAt])
  @@index([status])
  @@map("subscription_payment")
}
```

---

## 4. Reglas de negocio que el esquema NO puede expresar

Estas viven en `server/services` y deben tener test unitario:

1. **Cálculo de totales de un trabajo.** Al crear, editar o borrar un `JobItem` se recalcula:
   ```
   itemTotal   = quantity × unitPrice × (1 − discountPct/100)
   subtotal    = Σ itemTotal
   tax         = Σ (itemTotal × taxRate/100)
   total       = subtotal + tax − discountCents
   ```
   Redondeo: **al centavo, por ítem, hacia arriba en el 0.5** (`round half up`). Documentar y no cambiar nunca.

2. **Numeración secuencial.** `code` se genera dentro de una transacción que incrementa
   `Organization.jobCounter`. Si no es transaccional, dos usuarios simultáneos generan el mismo número.

3. **Estado inicial.** Un trabajo nuevo toma el `JobStatus` con `isDefault = true`. Debe existir
   siempre exactamente uno; se garantiza al aplicar el preset y al editar estados.

4. **No se borra un estado con trabajos asociados.** Se archiva y se obliga a reasignar.

5. **`paidCents` se deriva**, nunca se escribe a mano: es la suma de `Payment` de dirección `IN`
   menos los `OUT` asociados al trabajo.

6. **Congelado del documento.** Al pasar un `Document` de `DRAFT` a `SENT` se renderiza y se guarda
   `snapshotHtml`. A partir de ahí el HTML es inmutable.

7. **Límites del plan.** Antes de crear usuario, trabajo o subir archivo se verifica contra `Plan`.
   Superarlo lanza `LimitExceededError` con un mensaje que invita a subir de plan, no un error crudo.

8. **Suspensión por mora.** Si `currentPeriodEnd` pasó hace más de N días de gracia, el estado va a
   `PAST_DUE` y luego a `SUSPENDED`. Suspendido = solo lectura y exportación. **Nunca se borran datos
   por falta de pago.** Es una regla ética y también comercial: el cliente que vuelve, vuelve porque
   sus datos siguen ahí.

---

## 5. Datos iniciales (seed)

`prisma/seed.ts` debe cargar:

- Los tres registros de `Plan` (ver documento 07 para los precios).
- Nada más. Los estados, campos y plantillas de cada organización los crea el **preset de rubro**
  al momento de crear la cuenta (documento 06), no el seed global.

---

## 6. Estrategia de migraciones

- Toda migración con `prisma migrate dev` en desarrollo, `prisma migrate deploy` en producción.
- **Nunca** editar una migración ya aplicada en producción.
- Migraciones destructivas (borrar columna) en dos pasos separados por al menos un release:
  primero dejar de usarla, después borrarla.
- Antes de cada `migrate deploy` en producción: backup verificado. Sin excepción.

---

## 7. Siguiente paso

Documento 04: especificación funcional módulo por módulo — qué hace cada pantalla y con qué reglas.
